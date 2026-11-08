const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
let server,browser,base;
const lessonId='web-html-l1-lesson01';
const workspaceId=`student-uid__${lessonId}`;

// Only the Firebase boundary is replaced. Actual app modules, HTML, CSS,
// PDF images, iframe preview and browser input events run unchanged.
const firestore=`
const store=window.__firebase;
export const getFirestore=()=>({});
export const doc=(db,collection,id)=>({collection,id});
export const collection=(db,collection)=>({collection});
export const where=(field,op,value)=>({field,value});
export const query=(ref,...filters)=>({...ref,filters});
export const serverTimestamp=()=>({testTimestamp:true});
const snapshot=(id,data)=>({id,exists:()=>data!==undefined,data:()=>data});
export async function getDoc(ref){
 const data=structuredClone(store.data[ref.collection]?.[ref.id]);
 if(ref.collection==='web_workspaces'){
  if(store.holdReads)await new Promise(resolve=>store.releaseReads.push(resolve));
  if(store.failReads)throw Object.assign(Error('Test offline'),{code:'unavailable'});
 }
 return snapshot(ref.id,data);
}
export async function getDocs(ref){
 return {docs:Object.entries(store.data[ref.collection]||{})
  .filter(([id,data])=>(ref.filters||[]).every(f=>data[f.field]===f.value))
  .map(([id,data])=>snapshot(id,structuredClone(data)))};
}
export async function setDoc(ref,data,options){
 store.writes.push(structuredClone({ref,data,options}));
 if(store.failWrites)throw Object.assign(Error('Test offline'),{code:'unavailable'});
 store.data[ref.collection]||={};
 const previous=options?.merge?store.data[ref.collection][ref.id]||{}:{};
 store.data[ref.collection][ref.id]={...previous,...structuredClone(data),
  ...(data.pageWork?{pageWork:{...previous.pageWork,...structuredClone(data.pageWork)}}:{})};
}
export const updateDoc=(ref,data)=>setDoc(ref,data,{merge:true});
export async function addDoc(ref,data){await setDoc({...ref,id:'test-created'},data);}
export async function deleteDoc(ref){delete store.data[ref.collection][ref.id];}
`;
const auth=`
export const getAuth=()=>({});
export const onAuthStateChanged=(auth,callback)=>queueMicrotask(()=>callback({uid:window.__firebase.role==='teacher'?'teacher-uid':'student-uid'}));
export const signInWithEmailAndPassword=async()=>{};
export const createUserWithEmailAndPassword=async()=>({user:{uid:'test-created'}});
export const signOut=async()=>{};
export const updatePassword=async()=>{};
`;
before(async()=>{
 server=http.createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://test').pathname);
   const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
   if(!file.startsWith(root+path.sep))throw Error('outside root');
   const content=await fs.readFile(file);
   const type={'.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.webp':'image/webp','.pdf':'application/pdf'}[path.extname(file)];
   res.writeHead(200,{'Content-Type':type||'application/octet-stream'}).end(content);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(require('node:fs').existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath()),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
});
after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve));});
async function openStudio(t,{role='student',mobile=false,holdReads=false,failReads=false,failWrites=false,remoteCode}={}){
 const context=await browser.newContext({viewport:mobile?{width:375,height:812}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile});
 t.after(()=>context.close());
 const page=await context.newPage();page.setDefaultTimeout(8000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 t.after(()=>assert.deepEqual(errors,[],'No uncaught browser errors'));
 const lessons=JSON.parse(await fs.readFile(path.join(root,'assets/seed-lessons.json'),'utf8'));
 const web=JSON.parse(await fs.readFile(path.join(root,'assets/web-lesson01.json'),'utf8'));
 // A representative higher-level lesson exercises the existing standalone path.
 web.push({id:'test-web-level2',course:'web',level:2,title:'テスト用CSS教材',goal:'CSSを編集する',question:'学習したことを書こう'});
 await page.addInitScript(({role,lessons,web,holdReads,failReads,failWrites,remoteCode,workspaceId})=>{
  if(window.top!==window)return;
  const data={teachers:role==='teacher'?{'teacher-uid':{enabled:true}}:{},
   students:{student01:{displayName:'テスト生徒',enabled:true,activeUid:'student-uid'}},
   student_access:{'student-uid':{studentId:'student01',enabled:true,allowedCourses:['scratch','python','minecraft','roblox','robot','ai','web']}},
   lessons:Object.fromEntries([...lessons,...web].map(l=>[l.id,{...l,published:true}])),
   submissions:{},answer_keys:{},web_workspaces:remoteCode?{[workspaceId]:remoteCode}:{}};
  window.__firebase={role,data,writes:[],holdReads,releaseReads:[],failReads,failWrites};
  localStorage.setItem('ls_student_id','student01');
 },{role,lessons,web,holdReads,failReads,failWrites,remoteCode,workspaceId});
 await page.route('https://www.gstatic.com/firebasejs/**',route=>{
  const name=new URL(route.request().url()).pathname.split('/').pop();
  const body=name==='firebase-firestore.js'?firestore:name==='firebase-auth.js'?auth:'export const initializeApp=()=>({}); export const deleteApp=async()=>{};';
  return route.fulfill({contentType:'text/javascript',body});
 });
 await page.route(url=>!url.href.startsWith(base)&&url.hostname!=='www.gstatic.com',route=>route.abort());
 await page.goto(base);
 await page.waitForSelector('[data-course=web]');
 await page.locator('[data-course=web][data-level="1"]').click();
 await page.locator(`[data-id="${lessonId}"]`).click();
 await page.waitForSelector('#webHtmlEditor');
 return page;
}
async function minimize(page){await page.locator('[data-window-minimize]').click();}
async function editor(page){await page.locator('#hl1EditorOpen').click();}
async function selectPage(page,n){await page.locator('#hl1PageSelect').selectOption(String(n));}
async function closeTo(actual,expected,tolerance=2){assert.ok(Math.abs(actual-expected)<tolerance,`${actual} ≈ ${expected}`);}

test('PDF uses the large left column, zooms to 125/150/200%, and all 12 pages match missions',async t=>{
 const page=await openStudio(t);await minimize(page);
 const reader=await page.locator('.hl1-reader').boundingBox(),practice=await page.locator('.hl1-practice').boundingBox();
 assert.ok(reader.width>practice.width*1.5);
 for(const scale of [125,150,200,100]){
  await page.locator('#hl1Scale').selectOption(String(scale));
  const sizes=await page.evaluate(()=>({image:document.querySelector('#hl1Image').getBoundingClientRect().width,viewport:document.querySelector('#hl1PageViewport').clientWidth}));
  await closeTo(sizes.image/sizes.viewport,scale/100,.02);
 }
 for(let n=1;n<=12;n++){
  await selectPage(page,n);
  assert.equal(await page.locator('#hl1Current').textContent(),`PDF ${n}ページ`);
  const expectedTitle=(await page.locator(`#hl1PageSelect option[value="${n}"]`).textContent()).replace(/^\d+\. /,'');
  assert.equal(await page.locator('#hl1Title').textContent(),expectedTitle);
  assert.ok((await page.locator('#hl1Image').getAttribute('src')).endsWith(`${String(n).padStart(2,'0')}.webp`));
  assert.ok(await page.locator('.hl1-task').count()>=7);
  await page.waitForFunction(()=>{const image=document.querySelector('#hl1Image');return image.complete&&image.naturalWidth>0;});
 }
 assert.ok(await page.locator('#hl1Next').isDisabled());await selectPage(page,1);
 assert.ok(await page.locator('#hl1Prev').isDisabled());
 await page.screenshot({path:'/tmp/learning-studio-pdf.png'});
});

test('Page navigation, minimization and reload preserve HTML/CSS/JS and per-page answers',async t=>{
 const page=await openStudio(t);
 const code={html:'<h1>自分の作品</h1><p>保持するコード</p>',css:'h1 { color: rgb(255, 0, 0); }',js:'document.body.dataset.ran="yes";'};
 for(const [lang,text] of Object.entries(code)){
  await page.locator(`[data-lang=${lang}]`).click();
  await page.locator({html:'#webHtmlEditor',css:'#webCssEditor',js:'#webJsEditor'}[lang]).fill(text);
 }
 await minimize(page);
 await page.locator('input[name=hl1q0][value="1"]').check();
 await page.locator('input[type=checkbox][data-index="3"]').check();
 await page.locator('textarea[data-index="5"]').fill('好きな動物を紹介します');
 await selectPage(page,2);await page.locator('textarea[data-index="6"]').fill('エディターで書き、ブラウザで表示');
 await selectPage(page,1);
 assert.ok(await page.locator('input[name=hl1q0][value="1"]').isChecked());
 assert.ok(await page.locator('input[type=checkbox][data-index="3"]').isChecked());
 assert.equal(await page.locator('textarea[data-index="5"]').inputValue(),'好きな動物を紹介します');
 await editor(page);
 for(const [lang,text] of Object.entries(code))assert.equal(await page.locator({html:'#webHtmlEditor',css:'#webCssEditor',js:'#webJsEditor'}[lang]).inputValue(),text);
 await page.reload();
 await page.waitForSelector('[data-course=web]');await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lessonId}"]`).click();
 await page.waitForSelector('#webHtmlEditor');assert.equal(await page.locator('#webHtmlEditor').inputValue(),code.html);
 await minimize(page);assert.equal(await page.locator('textarea[data-index="5"]').inputValue(),'好きな動物を紹介します');
 await selectPage(page,2);assert.equal(await page.locator('textarea[data-index="6"]').inputValue(),'エディターで書き、ブラウザで表示');
});

test('Floating editor supports pointer and keyboard move/resize, minimize/restore and viewport changes',async t=>{
 const page=await openStudio(t),win=page.locator('#hl1EditorWindow');
 const start=await win.boundingBox(),bar=await page.locator('[data-window-move]').boundingBox();
 await page.mouse.move(bar.x+80,bar.y+20);await page.mouse.down();await page.mouse.move(bar.x-80,bar.y-60,{steps:5});await page.mouse.up();
 let moved=await win.boundingBox();await closeTo(moved.x,start.x-160);await closeTo(moved.y,start.y-80);
 const handle=await page.locator('[data-window-resize]').boundingBox();
 await page.mouse.move(handle.x+20,handle.y+18);await page.mouse.down();await page.mouse.move(handle.x-80,handle.y-62,{steps:5});await page.mouse.up();
 const resized=await win.boundingBox();await closeTo(resized.width,start.width-100);await closeTo(resized.height,start.height-80);
 await page.locator('[data-window-move]').focus();await page.keyboard.press('ArrowLeft');
 moved=await win.boundingBox();await closeTo(moved.x,resized.x-10);
 await page.locator('[data-window-resize]').focus();await page.keyboard.press('ArrowRight');
 await closeTo((await win.boundingBox()).width,resized.width+10);
 await page.keyboard.press('Escape');assert.ok(await win.isHidden());
 await editor(page);assert.ok(await win.isVisible());
 await page.setViewportSize({width:375,height:667});
 const small=await win.boundingBox();assert.ok(small.x>=0&&small.y>=0&&small.x+small.width<=375&&small.y+small.height<=667);
 await page.locator('[data-window-reset]').click();await page.screenshot({path:'/tmp/learning-studio-floating.png'});
});

test('Preview executes HTML/CSS/JavaScript in sandbox and saves code and page history with merge',async t=>{
 const page=await openStudio(t);
 await page.locator('#webHtmlEditor').fill('<h1>プレビュー作品</h1>');
 await page.locator('[data-lang=css]').click();await page.locator('#webCssEditor').fill('h1 { color: rgb(255, 0, 0); }');
 await page.locator('[data-lang=js]').click();await page.locator('#webJsEditor').fill('document.querySelector("h1").dataset.ran="yes";');
 await page.locator('#webRun').click();
 await page.screenshot({path:'/tmp/learning-studio-desktop.png'});
 const preview=page.frameLocator('#webPreview');
 await preview.locator('h1[data-ran=yes]').waitFor();assert.equal(await preview.locator('h1').evaluate(el=>getComputedStyle(el).color),'rgb(255, 0, 0)');
 assert.equal(await page.locator('#webPreview').getAttribute('sandbox'),'allow-scripts');
 await page.locator('#webSave').click();await page.waitForFunction(()=>document.querySelector('#webSaveState').textContent==='Firebaseに保存済み');
 await minimize(page);await page.locator('textarea[data-index="5"]').fill('保存する回答');await page.locator('#hl1Save').click();
 await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('保存しました'));
 const state=await page.evaluate(id=>({doc:window.__firebase.data.web_workspaces[id],writes:window.__firebase.writes}),workspaceId);
 assert.equal(state.doc.html,'<h1>プレビュー作品</h1>');assert.ok(state.doc.css.includes('255'));assert.ok(state.doc.js.includes('dataset.ran'));
 assert.equal(state.doc.pageWork.p01.answers[5],'保存する回答');assert.equal(state.doc.ownerUid,'student-uid');
 assert.ok(state.writes.every(w=>w.options.merge&&w.ref.collection==='web_workspaces'&&w.ref.id===workspaceId));
});

test('Mobile keeps PDF scrolling inside its panel and supports touch move/resize and panel switching',async t=>{
 const page=await openStudio(t,{mobile:true});await minimize(page);
 await page.locator('#hl1Scale').selectOption('200');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 assert.ok(await page.locator('#hl1PageViewport').evaluate(el=>el.scrollWidth>el.clientWidth));
 await page.locator('[data-show=practice]').click();await page.locator('textarea[data-index="5"]').fill('スマートフォンの回答');
 await selectPage(page,2);assert.ok(await page.locator('.hl1-reader').isVisible());
 await selectPage(page,1);await page.locator('[data-show=practice]').click();assert.equal(await page.locator('textarea[data-index="5"]').inputValue(),'スマートフォンの回答');
 await editor(page);
 const win=page.locator('#hl1EditorWindow'),start=await win.boundingBox(),bar=await page.locator('[data-window-move]').boundingBox();
 const cdp=await page.context().newCDPSession(page);
 async function touchDrag(x,y,dx,dy){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }
 await touchDrag(bar.x+50,bar.y+20,0,-60);
 await closeTo((await win.boundingBox()).y,start.y-60);
 const handle=await page.locator('[data-window-resize]').boundingBox();await touchDrag(handle.x+20,handle.y+18,-20,-50);
 const end=await win.boundingBox();assert.ok(end.width<start.width&&end.height<start.height);
 await page.screenshot({path:'/tmp/learning-studio-mobile.png'});
});

test('Delayed or unavailable Firebase does not block code checks or overwrite local edits',async t=>{
 const page=await openStudio(t,{holdReads:true,remoteCode:{html:'<h1>クラウドの古い作品</h1>',pageWork:{p02:{answers:{6:'クラウド回答'},results:{}}}}});
 await page.locator('#webHtmlEditor').fill('<h1>入力中の新しい作品</h1>');await minimize(page);
 await page.locator('textarea[data-index="5"]').fill('読み込み中の新しい回答');
 await selectPage(page,3);await page.locator('#hl1Check').click();
 assert.ok((await page.locator('#hl1Status5').textContent()).includes('達成'));
 await page.evaluate(()=>{window.__firebase.holdReads=false;window.__firebase.releaseReads.forEach(resolve=>resolve());});
 await page.waitForFunction(()=>document.querySelector('#hl1Title').textContent.includes('エディター'));
 await selectPage(page,1);assert.equal(await page.locator('textarea[data-index="5"]').inputValue(),'読み込み中の新しい回答');
 assert.equal(await page.locator('#webHtmlEditor').inputValue(),'<h1>入力中の新しい作品</h1>');
 await selectPage(page,2);assert.equal(await page.locator('textarea[data-index="6"]').inputValue(),'クラウド回答');
});

test('Failed Firebase saves retain local code and answers with visible errors',async t=>{
 const page=await openStudio(t,{failReads:true,failWrites:true});
 await page.locator('#webHtmlEditor').fill('<h1>オフライン作品</h1>');await page.locator('#webSave').click();
 await page.waitForFunction(()=>document.querySelector('#webSaveState').textContent==='Firebase保存エラー');
 await minimize(page);await page.locator('textarea[data-index="5"]').fill('オフライン回答');await page.locator('#hl1Save').click();
 await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('端末には保存済み'));
 const local=await page.evaluate(id=>({code:JSON.parse(localStorage.getItem('learning-studio-web-draft:student-uid:'+id)),pages:JSON.parse(localStorage.getItem('ls-html-level1-pages:student-uid:'+id))}),lessonId);
 assert.equal(local.code.html,'<h1>オフライン作品</h1>');assert.equal(local.pages.p01.answers[5],'オフライン回答');
});

test('Teacher still has seven courses, student/lesson management and standalone web lessons',async t=>{
 const page=await openStudio(t,{role:'teacher'});await minimize(page);
 await page.locator('#home').click();assert.equal(await page.locator('.course').count(),7);assert.ok(await page.locator('#hl1EditorWindow').count()===0);
 await page.locator('#manage').click();await page.locator('#tabStudents').click();assert.ok((await page.locator('#teacherBody').textContent()).includes('生徒'));
 await page.locator('#tabLessons').click();assert.ok((await page.locator('#teacherBody').textContent()).includes('教材'));
 await page.locator('#tabGrades').click();assert.ok((await page.locator('#teacherBody').textContent()).includes('採点'));
 await page.locator('#home').click();await page.locator('[data-course=web][data-level="2"]').click();
 await page.locator('.lesson-tile').first().click();await page.waitForSelector('#webHtmlEditor');
 assert.equal(await page.locator('#hl1EditorWindow').count(),0);await page.locator('#webHtmlEditor').fill('<h1>通常教材も編集可</h1>');await page.locator('#webRun').click();
 assert.equal(await page.frameLocator('#webPreview').locator('h1').textContent(),'通常教材も編集可');
});


test('Cloud-only answers restore on the initial page and a local code draft wins over stale cloud code',async t=>{
 const page=await openStudio(t,{remoteCode:{html:'<h1>クラウドの作品</h1>',pageWork:{p01:{answers:{5:'クラウドから復元'},results:{5:true}}}}});
 await page.waitForFunction(()=>document.querySelector('#webHtmlEditor').value.includes('クラウドの作品'));
 await minimize(page);assert.equal(await page.locator('textarea[data-index="5"]').inputValue(),'クラウドから復元');
 await editor(page);await page.locator('#webHtmlEditor').fill('<h1>端末に残る最新の作品</h1>');
 // Reload before the autosave, leaving the fixture's cloud HTML stale.
 await page.reload();await page.waitForSelector('[data-course=web]');await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lessonId}"]`).click();
 await page.waitForSelector('#webHtmlEditor');
 await page.waitForFunction(()=>document.querySelector('#webSaveState').textContent.includes('端末の入力'));
 assert.equal(await page.locator('#webHtmlEditor').inputValue(),'<h1>端末に残る最新の作品</h1>');
});

test('Loading a sample requires confirmation and preserves CSS/JavaScript and mission answers',async t=>{
 const page=await openStudio(t);await page.locator('#webHtmlEditor').fill('<h1>残したいHTML</h1>');
 await page.locator('[data-lang=css]').click();await page.locator('#webCssEditor').fill('h1 { color: blue; }');
 await page.locator('[data-lang=js]').click();await page.locator('#webJsEditor').fill('document.body.dataset.sample="kept";');
 await minimize(page);await selectPage(page,5);await page.locator('textarea[data-index="7"]').fill('titleはタブ、h1はページ内');
 await editor(page);page.once('dialog',dialog=>dialog.dismiss());await page.locator('#hl1LoadSample').click();
 assert.equal(await page.locator('#webHtmlEditor').inputValue(),'<h1>残したいHTML</h1>');
 page.once('dialog',dialog=>dialog.accept());await page.locator('#hl1LoadSample').click();
 assert.ok(await page.locator('#webHtmlEditor').isVisible());assert.ok((await page.locator('#webHtmlEditor').inputValue()).includes('<!DOCTYPE html>'));
 assert.equal(await page.locator('#webCssEditor').inputValue(),'h1 { color: blue; }');assert.equal(await page.locator('#webJsEditor').inputValue(),'document.body.dataset.sample="kept";');
 await minimize(page);assert.equal(await page.locator('textarea[data-index="7"]').inputValue(),'titleはタブ、h1はページ内');
});

async function assertPageControlsUsable(page){
 const nav=await page.locator('.hl1-page-navigation').boundingBox();
 const viewport=page.viewportSize();
 assert.ok(nav.y>=0&&nav.y+nav.height<=viewport.height,'Page controls remain within the visible viewport');
 assert.ok(nav.x>=0&&nav.x+nav.width<=viewport.width,'Page controls fit the screen width');
 for(const selector of ['#hl1Prev','#hl1PageSelect','#hl1Next']){
  const control=page.locator(selector),rect=await control.boundingBox();
  assert.ok(rect.y>=nav.y&&rect.y+rect.height<=nav.y+nav.height,'Control stays inside the navigation bar');
  assert.ok(await control.evaluate(el=>{
   const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
  }),'Control is not obscured by the PDF or floating editor');
 }
 return nav;
}
async function settleLayout(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}

test('Page controls stay usable during document, PDF and mission scrolling, including the lesson footer',async t=>{
 const page=await openStudio(t);await minimize(page);
 await page.evaluate(()=>window.scrollTo(0,document.querySelector('.hl1-grid').getBoundingClientRect().top+scrollY-150));
 await settleLayout(page);
 let nav=await assertPageControlsUsable(page);
 for(const selector of ['.hl1-reader','.hl1-practice']){
  assert.ok((await page.locator(selector).boundingBox()).y>=nav.y+nav.height,'Learning panes start below the reserved navigation band');
 }
 const pdf=page.locator('#hl1PageViewport');
 await pdf.hover();await page.mouse.wheel(0,400);await page.waitForFunction(()=>document.querySelector('#hl1PageViewport').scrollTop>0);
 await assertPageControlsUsable(page);
 const practice=page.locator('.hl1-practice');
 await practice.hover();await page.mouse.wheel(0,500);await page.waitForFunction(()=>document.querySelector('.hl1-practice').scrollTop>0);
 await assertPageControlsUsable(page);
 await page.locator('#hl1Next').click();assert.equal(await page.locator('#hl1PageSelect').inputValue(),'2');
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await settleLayout(page);
 nav=await assertPageControlsUsable(page);await closeTo(nav.y,0);
 await page.locator('#hl1Prev').click();assert.equal(await page.locator('#hl1PageSelect').inputValue(),'1');
 await page.screenshot({path:'/tmp/learning-studio-navigation-desktop.png'});
});

test('Mobile page controls remain visible in portrait, landscape and larger text without editor overlap',async t=>{
 const page=await openStudio(t,{mobile:true});await minimize(page);
 for(const size of [{width:375,height:812},{width:320,height:568},{width:844,height:390}]){
  await page.setViewportSize(size);await settleLayout(page);
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await settleLayout(page);
  await assertPageControlsUsable(page);
  await selectPage(page,2);assert.equal(await page.locator('#hl1Current').textContent(),'PDF 2ページ');
  await editor(page);await page.locator('[data-window-reset]').click();await settleLayout(page);
  const nav=await assertPageControlsUsable(page),win=await page.locator('#hl1EditorWindow').boundingBox();
  assert.ok(win.y>=nav.y+nav.height,'The editor stays below the navigation bar');
  await minimize(page);
 }
 await page.setViewportSize({width:375,height:812});
 await page.evaluate(()=>document.documentElement.style.fontSize='24px');await settleLayout(page);
 const nav=await assertPageControlsUsable(page);
 await editor(page);await settleLayout(page);
 assert.ok((await page.locator('#hl1EditorWindow').boundingBox()).y>=nav.y+nav.height);
 await page.screenshot({path:'/tmp/learning-studio-navigation-mobile.png'});
});

test('Editor drag/resize cannot cover navigation and reserved space is removed when leaving the lesson',async t=>{
 const page=await openStudio(t);
 const bar=await page.locator('[data-window-move]').boundingBox();
 await page.mouse.move(bar.x+80,bar.y+20);await page.mouse.down();await page.mouse.move(100,0,{steps:5});await page.mouse.up();
 let nav=await assertPageControlsUsable(page),win=await page.locator('#hl1EditorWindow').boundingBox();
 assert.ok(win.y>=nav.y+nav.height,'Dragging cannot move the editor over page controls');
 const handle=await page.locator('[data-window-resize]').boundingBox();
 await page.mouse.move(handle.x+20,handle.y+18);await page.mouse.down();await page.mouse.move(1430,990,{steps:5});await page.mouse.up();
 await assertPageControlsUsable(page);
 await selectPage(page,4);assert.equal(await page.locator('#hl1Current').textContent(),'PDF 4ページ');
 await minimize(page);await page.locator('#home').click();await settleLayout(page);
 assert.equal(await page.locator('.hl1-page-navigation').count(),0);
 assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).paddingTop),'0px');
 assert.equal(await page.locator('.course').count(),7);
 // Re-entering must register a single bar and re-establish the reserved band.
 await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lessonId}"]`).click();
 await page.waitForSelector('#webHtmlEditor');await settleLayout(page);
 assert.equal(await page.locator('.hl1-page-navigation').count(),1);
 await assertPageControlsUsable(page);
});
