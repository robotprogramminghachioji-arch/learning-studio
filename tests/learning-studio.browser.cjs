const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
let server,browser,base;
let cacheScenario=false,serveOldRelease=false,bareCompanionRequests=0;
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
 function merge(a,b){
  if(!b||typeof b!=='object'||Array.isArray(b))return structuredClone(b);
  if(!Object.keys(b).length)return {};
  const result={...a};for(const [key,value] of Object.entries(b))result[key]=merge(a?.[key],value);return result;
 }
 store.data[ref.collection][ref.id]=merge(previous,data);
}
export const runTransaction=async(db,fn)=>{const writes=[];const result=await fn({get:getDoc,set:(...args)=>writes.push(args)});for(const args of writes)await setDoc(...args);return result;};
export const updateDoc=(ref,data)=>setDoc(ref,data,{merge:true});
export async function addDoc(ref,data){await setDoc({...ref,id:'test-created'},data);}
export async function deleteDoc(ref){delete store.data[ref.collection][ref.id];}
`;
const auth=`
export const getAuth=()=>({});
let authCallback=null;
const currentUser=()=>({uid:window.__firebase.role==='teacher'?'teacher-uid':'student-uid'});
export const onAuthStateChanged=(auth,callback)=>{authCallback=callback;queueMicrotask(()=>callback(currentUser()));};
export const signInWithEmailAndPassword=async()=>{window.__firebase.authEvents.push('login');await authCallback(currentUser());};
export const createUserWithEmailAndPassword=async()=>({user:{uid:'test-created'}});
export const signOut=async()=>{window.__firebase.authEvents.push('logout');await authCallback(null);};
export const updatePassword=async()=>{};
`;
before(async()=>{
 server=http.createServer(async(req,res)=>{
  try{
   const requestUrl=new URL(req.url,'http://test'),pathname=decodeURIComponent(requestUrl.pathname);
   if(cacheScenario&&pathname.startsWith('/__firebase__/')){
    const name=pathname.split('/').pop();
    const body=name==='firebase-firestore.js'?firestore:name==='firebase-auth.js'?auth:'export const initializeApp=()=>({}); export const deleteApp=async()=>{};';
    res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'public, max-age=31536000, immutable'}).end(body);return;
   }
   const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
   if(!file.startsWith(root+path.sep))throw Error('outside root');
   let content=await fs.readFile(file);
   if(cacheScenario){
    if(pathname.endsWith('html-level1-companion.js')&&!requestUrl.searchParams.has('v'))bareCompanionRequests++;
    if(path.extname(file)==='.js'){
     let source=content.toString().replaceAll('https://www.gstatic.com/firebasejs/11.10.0/','/__firebase__/');
     if(serveOldRelease){
      source=source.replace(/(from\s*['"])(\.[^'"?]+)\?v=[a-f0-9]+(['"])/g,'$1$2$3');
      if(pathname.endsWith('asset-versions.js'))source='export function assetUrl(value){return value;}';
      if(pathname.endsWith('html-level1-companion.js'))source=source.replace(/<ol class="hl1-learning-flow">.*?<\/ol>/,'<p>「知る → 読む → 作る → 試す」の順に学習します。</p>');
     }
     content=Buffer.from(source);
    }else if(path.extname(file)==='.html'&&serveOldRelease)content=Buffer.from(content.toString().replace(/\?v=[a-f0-9]{12}/g,''));
   }
   const type={'.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf'}[path.extname(file)];
   res.writeHead(200,{'Content-Type':type||'application/octet-stream','Cache-Control':cacheScenario&&path.extname(file)!=='.html'?'public, max-age=31536000, immutable':'no-store'}).end(content);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(require('node:fs').existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath()),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
});
after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve));});
async function openStudio(t,{role='student',mobile=false,holdReads=false,failReads=false,failWrites=false,remoteCode,completedThrough=0,localProgress,cachedAssets=false,workbook,extraLessons=[],courseAccess,startAtHome=false}={}){
 if(completedThrough){
  remoteCode={...remoteCode,pageWork:{...remoteCode?.pageWork,_learning:{version:1,currentPage:1,testSubmitted:completedThrough>=11,completed:Object.fromEntries(Array.from({length:12},(_,i)=>['p'+String(i+1).padStart(2,'0'),i<completedThrough]))}}};
 }
 const context=await browser.newContext({viewport:mobile?{width:375,height:812}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile});
 t.after(()=>context.close());
 const page=await context.newPage();page.setDefaultTimeout(8000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 t.after(()=>assert.deepEqual(errors,[],'No uncaught browser errors'));
 const lessons=JSON.parse(await fs.readFile(path.join(root,'assets/seed-lessons.json'),'utf8'));
 const web=JSON.parse(await fs.readFile(path.join(root,'assets/web-lesson01.json'),'utf8'));
 // A representative higher-level lesson exercises the existing standalone path.
 web.push({id:'test-web-level2',course:'web',level:2,title:'テスト用CSS教材',goal:'CSSを編集する',question:'学習したことを書こう'});
 await page.addInitScript(({role,lessons,web,holdReads,failReads,failWrites,remoteCode,workspaceId,localProgress,workbook,extraLessons,courseAccess})=>{
  if(window.top!==window)return;
  const data={teachers:role==='teacher'?{'teacher-uid':{enabled:true}}:{},
   students:{student01:{displayName:'テスト生徒',enabled:true,activeUid:'student-uid'}},
   student_access:{'student-uid':{studentId:'student01',enabled:true,allowedCourses:['scratch','python','minecraft','roblox','robot','ai','web']}},
   lessons:Object.fromEntries([...lessons,...web].map(l=>[l.id,{...l,published:true}])),
   login_lookup:{'6d35659c221c9e952e486089108f09bf3ce16989fac1a166a9deea99c4cd629d':{email:'student01@example.test'}},
   submissions:{},answer_keys:{},web_workspaces:remoteCode?{[workspaceId]:remoteCode}:{}};
  for(const lesson of extraLessons)data.lessons[lesson.id]=lesson;
  if(courseAccess)data.student_access['student-uid'].allowedCourses=courseAccess;
  if(workbook)data.lessons['web-html-l1-lesson01'].workbook=workbook;
  window.__firebase={role,data,writes:[],authEvents:[],holdReads,releaseReads:[],failReads,failWrites};
  localStorage.setItem('ls_student_id','student01');
  if(localProgress&&!sessionStorage.getItem('fixture-local')){
   localStorage.setItem('ls-html-level1-pages:student-uid:web-html-l1-lesson01',JSON.stringify(localProgress));
   sessionStorage.setItem('fixture-local','yes');
  }
 },{role,lessons,web,holdReads,failReads,failWrites,remoteCode,workspaceId,localProgress,workbook,extraLessons,courseAccess});
 if(!cachedAssets){
 await page.route('https://www.gstatic.com/firebasejs/**',route=>{
  const name=new URL(route.request().url()).pathname.split('/').pop();
  const body=name==='firebase-firestore.js'?firestore:name==='firebase-auth.js'?auth:'export const initializeApp=()=>({}); export const deleteApp=async()=>{};';
  return route.fulfill({contentType:'text/javascript',body});
 });
 await page.route(url=>!url.href.startsWith(base)&&url.hostname!=='www.gstatic.com',route=>route.abort());
 }
 await page.goto(base);
 if(startAtHome){await page.waitForSelector('.course');return page;}
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
 const page=await openStudio(t,{role:'teacher'});await minimize(page);
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
  const expectedTitle=(await page.locator(`#hl1PageSelect option[value="${n}"]`).textContent()).replace(/^\d+\. /,'').replace(/［.*］$/,'');
  assert.equal(await page.locator('#hl1Title').textContent(),expectedTitle);
  await page.waitForFunction(()=>{const img=document.querySelector('#hl1Image');return !!img.getAttribute('src')&&img.complete&&img.naturalWidth>0;});
  assert.ok(n===1?(await page.locator('#hl1Image').getAttribute('src')).includes('01.webp'):(await page.locator('#hl1Image').getAttribute('src')).startsWith('data:image/webp'));
  assert.ok(n===1?await page.locator('.hl1-task').count()===0:await page.locator('.hl1-task').count()>=7);
  await page.waitForFunction(()=>{const image=document.querySelector('#hl1Image');return image.complete&&image.naturalWidth>0;});
 }
 assert.ok(await page.locator('#hl1Next').isDisabled());await selectPage(page,1);
 assert.ok(await page.locator('#hl1Prev').isDisabled());
 await page.screenshot({path:'/tmp/learning-studio-pdf.png'});
});

test('Page navigation, minimization and reload preserve HTML/CSS/JS and per-page answers',async t=>{
 const page=await openStudio(t,{completedThrough:2});
 const code={html:'<h1>自分の作品</h1><p>保持するコード</p>',css:'h1 { color: rgb(255, 0, 0); }',js:'document.body.dataset.ran="yes";'};
 for(const [lang,text] of Object.entries(code)){
  await page.locator(`[data-lang=${lang}]`).click();await page.locator({html:'#webHtmlEditor',css:'#webCssEditor',js:'#webJsEditor'}[lang]).fill(text);
 }
 await minimize(page);await selectPage(page,2);
 await page.locator('input[name=hl1q0][value="1"]').check();await page.locator('input[type=checkbox][data-index="5"]').check();
 await page.locator('textarea[data-index="6"]').fill('エディターとブラウザの役割の回答');
 await selectPage(page,3);await page.locator('textarea[data-index="7"]').fill('クラウド保存とダウンロードの違い');await selectPage(page,2);
 assert.ok(await page.locator('input[name=hl1q0][value="1"]').isChecked());assert.ok(await page.locator('input[type=checkbox][data-index="5"]').isChecked());
 assert.equal(await page.locator('textarea[data-index="6"]').inputValue(),'エディターとブラウザの役割の回答');
 await editor(page);for(const [lang,text] of Object.entries(code))assert.equal(await page.locator({html:'#webHtmlEditor',css:'#webCssEditor',js:'#webJsEditor'}[lang]).inputValue(),text);
 await page.reload();await page.waitForSelector('[data-course=web]');await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lessonId}"]`).click();
 await page.waitForSelector('#webHtmlEditor');assert.equal(await page.locator('#webHtmlEditor').inputValue(),code.html);await minimize(page);
 assert.equal(await page.locator('#hl1PageSelect').inputValue(),'2');
 assert.equal(await page.locator('textarea[data-index="6"]').inputValue(),'エディターとブラウザの役割の回答');
 await selectPage(page,3);assert.equal(await page.locator('textarea[data-index="7"]').inputValue(),'クラウド保存とダウンロードの違い');
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
 const page=await openStudio(t,{completedThrough:1});
 await page.locator('#webHtmlEditor').fill('<h1>プレビュー作品</h1>');
 await page.locator('[data-lang=css]').click();await page.locator('#webCssEditor').fill('h1 { color: rgb(255, 0, 0); }');
 await page.locator('[data-lang=js]').click();await page.locator('#webJsEditor').fill('document.querySelector("h1").dataset.ran="yes";');
 await page.locator('#webRun').click();
 await page.screenshot({path:'/tmp/learning-studio-desktop.png'});
 const preview=page.frameLocator('#webPreview');
 await preview.locator('h1[data-ran=yes]').waitFor();assert.equal(await preview.locator('h1').evaluate(el=>getComputedStyle(el).color),'rgb(255, 0, 0)');
 assert.equal(await page.locator('#webPreview').getAttribute('sandbox'),'allow-scripts');
 await page.locator('#webSave').click();await page.waitForFunction(()=>document.querySelector('#webSaveState').textContent==='Firebaseに保存済み');
 await minimize(page);await selectPage(page,2);await page.locator('textarea[data-index="6"]').fill('保存する回答');await page.locator('#hl1Save').click();
 await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('保存しました'));
 const state=await page.evaluate(id=>({doc:window.__firebase.data.web_workspaces[id],writes:window.__firebase.writes}),workspaceId);
 assert.equal(state.doc.html,'<h1>プレビュー作品</h1>');assert.ok(state.doc.css.includes('255'));assert.ok(state.doc.js.includes('dataset.ran'));
 assert.equal(state.doc.pageWork.p02.answers[6],'保存する回答');assert.equal(state.doc.ownerUid,'student-uid');
 assert.ok(state.writes.every(w=>w.options.merge&&w.ref.collection==='web_workspaces'&&w.ref.id===workspaceId));
});

test('Mobile keeps PDF scrolling inside its panel and supports touch move/resize and panel switching',async t=>{
 const page=await openStudio(t,{completedThrough:2,mobile:true});await minimize(page);
 await page.locator('#hl1Scale').selectOption('200');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 assert.ok(await page.locator('#hl1PageViewport').evaluate(el=>el.scrollWidth>el.clientWidth));
 await selectPage(page,2);await page.locator('[data-show=practice]').click();await page.locator('textarea[data-index="6"]').fill('スマートフォンの回答');
 await selectPage(page,3);assert.ok(await page.locator('.hl1-reader').isVisible());
 await selectPage(page,2);await page.locator('[data-show=practice]').click();assert.equal(await page.locator('textarea[data-index="6"]').inputValue(),'スマートフォンの回答');
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
 const page=await openStudio(t,{holdReads:true,localProgress:{_learning:{currentPage:1,completed:{p01:true,p02:true}}},remoteCode:{html:'<h1>クラウドの古い作品</h1>',pageWork:{p02:{answers:{7:'クラウド回答'},results:{}}}}});
 await page.locator('#webHtmlEditor').fill('<h1>入力中の新しい作品</h1>');await minimize(page);await selectPage(page,2);
 await page.locator('textarea[data-index="6"]').fill('読み込み中の新しい回答');
 await selectPage(page,3);await page.locator('#hl1Check').click();
 assert.ok((await page.locator('#hl1Status5').textContent()).includes('達成'));
 await page.evaluate(()=>{window.__firebase.holdReads=false;window.__firebase.releaseReads.forEach(resolve=>resolve());});
 await page.waitForFunction(()=>document.querySelector('#hl1Title').textContent.includes('エディター'));
 await selectPage(page,2);assert.equal(await page.locator('textarea[data-index="6"]').inputValue(),'読み込み中の新しい回答');
 assert.equal(await page.locator('#webHtmlEditor').inputValue(),'<h1>入力中の新しい作品</h1>');
 await selectPage(page,2);assert.equal(await page.locator('textarea[data-index="7"]').inputValue(),'クラウド回答');
});

test('Failed Firebase saves retain local code and answers with visible errors',async t=>{
 const page=await openStudio(t,{failWrites:true,completedThrough:1});
 await page.locator('#webHtmlEditor').fill('<h1>オフライン作品</h1>');await page.locator('#webSave').click();
 await page.waitForFunction(()=>document.querySelector('#webSaveState').textContent==='Firebase保存エラー');
 await minimize(page);await selectPage(page,2);await page.locator('textarea[data-index="6"]').fill('オフライン回答');await page.locator('#hl1Save').click();
 await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('端末には保存済み'));
 const local=await page.evaluate(id=>({code:JSON.parse(localStorage.getItem('learning-studio-web-draft:student-uid:'+id)),pages:JSON.parse(localStorage.getItem('ls-html-level1-pages:student-uid:'+id))}),lessonId);
 assert.equal(local.code.html,'<h1>オフライン作品</h1>');assert.equal(local.pages.p02.answers[6],'オフライン回答');
});

test('Teacher still has seven courses, student/lesson management and standalone web lessons',async t=>{
 const page=await openStudio(t,{role:'teacher'});await minimize(page);
 await page.locator('#home').click();assert.equal(await page.locator('.course').count(),7);assert.ok(await page.locator('#hl1EditorWindow').count()===0);
 await page.locator('#manage').click();await page.locator('#tabStudents').click();assert.ok((await page.locator('#teacherBody').textContent()).includes('生徒'));
 await page.locator('#tabLessons').click();assert.ok((await page.locator('#teacherBody').textContent()).includes('教材'));
 await page.locator('#tabGrades').click();assert.ok((await page.locator('#teacherBody').textContent()).includes('採点'));
 await page.locator('#home').click();await page.locator('[data-course=web][data-level="2"]').click();
 await page.locator('[data-id="test-web-level2"]').click();await page.waitForSelector('#webHtmlEditor');
 assert.equal(await page.locator('#hl1EditorWindow').count(),0);await page.locator('#webHtmlEditor').fill('<h1>通常教材も編集可</h1>');await page.locator('#webRun').click();
 assert.equal(await page.frameLocator('#webPreview').locator('h1').textContent(),'通常教材も編集可');
});


test('Cloud-only answers restore on the initial page and a local code draft wins over stale cloud code',async t=>{
 const page=await openStudio(t,{completedThrough:1,remoteCode:{html:'<h1>クラウドの作品</h1>',pageWork:{p02:{answers:{6:'クラウドから復元'},results:{6:true}}}}});
 await page.waitForFunction(()=>document.querySelector('#webHtmlEditor').value.includes('クラウドの作品'));
 await minimize(page);await selectPage(page,2);assert.equal(await page.locator('textarea[data-index="6"]').inputValue(),'クラウドから復元');
 await editor(page);await page.locator('#webHtmlEditor').fill('<h1>端末に残る最新の作品</h1>');
 // Reload before the autosave, leaving the fixture's cloud HTML stale.
 await page.reload();await page.waitForSelector('[data-course=web]');await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lessonId}"]`).click();
 await page.waitForSelector('#webHtmlEditor');
 await page.waitForFunction(()=>document.querySelector('#webSaveState').textContent.includes('端末の入力'));
 assert.equal(await page.locator('#webHtmlEditor').inputValue(),'<h1>端末に残る最新の作品</h1>');
});

test('Loading a sample requires confirmation and preserves CSS/JavaScript and mission answers',async t=>{
 const page=await openStudio(t,{completedThrough:4});await page.locator('#webHtmlEditor').fill('<h1>残したいHTML</h1>');
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
 const page=await openStudio(t,{completedThrough:2});await minimize(page);await selectPage(page,2);
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
 await page.locator('#hl1Next').click();assert.equal(await page.locator('#hl1PageSelect').inputValue(),'3');
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await settleLayout(page);
 nav=await assertPageControlsUsable(page);await closeTo((await page.locator('#lsHeader').boundingBox()).y,0);
 assert.ok(nav.y>=(await page.locator('.ls-header-top').boundingBox()).height);
 await page.locator('#hl1Prev').click();assert.equal(await page.locator('#hl1PageSelect').inputValue(),'2');
 await page.screenshot({path:'/tmp/learning-studio-navigation-desktop.png'});
});

test('Mobile page controls remain visible in portrait, landscape and larger text without editor overlap',async t=>{
 const page=await openStudio(t,{completedThrough:1,mobile:true});await minimize(page);
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
 const page=await openStudio(t,{completedThrough:3});
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
 await closeTo(await page.locator('body').evaluate(el=>parseFloat(getComputedStyle(el).paddingTop)),(await page.locator('#lsHeader').boundingBox()).height);
 assert.equal(await page.locator('.course').count(),7);
 // Re-entering must register a single bar and re-establish the reserved band.
 await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lessonId}"]`).click();
 await page.waitForSelector('#webHtmlEditor');await settleLayout(page);
 assert.equal(await page.locator('.hl1-page-navigation').count(),1);
 await assertPageControlsUsable(page);
});

const correctByPage={2:{0:1,1:0,2:1,3:1,4:0},3:{0:0,1:1,2:0,3:1,4:0},4:{0:0,1:1,2:0,3:0,4:1},5:{0:1,1:0,2:0,3:0,4:0},6:{0:1,1:1,2:0,3:1,4:1,5:0},7:{5:1},8:{5:1},9:{0:0,1:0,2:1,3:0,4:0},10:{3:0,4:0,5:0}};
const completeHtml='<!DOCTYPE html><html lang="ja"><head><title>自分の作品</title></head><body><h1>私の作品</h1><p>自分で書いた紹介文です</p><h2>好きなもの</h2><ul><li>ねこ</li><li>ゲーム</li><li>音楽</li></ul><a href="https://example.com/">リンク</a><img src="images/cat.svg" alt="ねこ"></body></html>';
async function completeRequired(page,n,mobile=false){
 if(mobile)await page.locator('[data-show=practice]').click();
 if(n===1){await page.locator('#hl1Check').click();assert.equal(await page.locator('#hl1PageSelect').inputValue(),'2');return;}
 for(const [i,value] of Object.entries(correctByPage[n]||{}))await page.locator(`input[name=hl1q${i}][value="${value}"]`).check();
 for(const checkbox of await page.locator('.hl1-task[data-required=true] input[type=checkbox]').all())await checkbox.check();
 await page.locator('#hl1Check').click();
 assert.ok((await page.locator('#hl1GateStatus').textContent()).includes('学習済み'));
}

test('Fresh learners start at page 1, see 12-page progress and cannot bypass page or final-test locks',async t=>{
 const page=await openStudio(t);await minimize(page);
 assert.equal(await page.locator('#hl1Number').textContent(),'1 / 12');
 assert.ok((await page.locator('.hl1-navigation-summary').textContent()).includes('HTML入門 レベル1｜全12ページ'));
 assert.equal(await page.locator('#hl1OverallProgress').getAttribute('max'),'12');
 assert.equal(await page.locator('#hl1OverallProgress').getAttribute('value'),'0');
 assert.ok(await page.locator('#hl1Next').isEnabled());
 assert.ok(await page.locator('#hl1PageSelect option[value="11"]').isDisabled());
 assert.ok(await page.locator('#hl1PageSelect option[value="12"]').isDisabled());
 assert.equal(await page.locator('#hl1SectionHeading').textContent(),'はじめに：この教材の使い方');
 assert.ok(await page.locator('#lsFinalSubmission').isHidden());
 // Even a direct selection change (rather than clicking the disabled option) is rejected.
 await page.evaluate(()=>{const select=document.querySelector('#hl1PageSelect');select.options[10].disabled=false;select.value='11';select.dispatchEvent(new Event('change'));});
 assert.equal(await page.locator('#hl1PageSelect').inputValue(),'1');
 assert.ok((await page.locator('#hl1GateStatus').textContent()).includes('ロック中'));
 await page.locator('#submitTest').evaluate(form=>form.dispatchEvent(new Event('submit',{cancelable:true})));
 assert.equal(await page.evaluate(()=>window.__firebase.writes.filter(w=>w.ref.collection==='submissions').length),0);
 await page.locator('.hl1-directory summary').click();
 assert.equal(await page.locator('.hl1-page-item[data-state="ロック中"]').count(),11);
 assert.equal(await page.locator('.hl1-page-item[data-state="学習中"]').count(),1);
 await page.screenshot({path:'/tmp/learning-studio-guided-locks.png'});
});

for(const mobile of [false,true])test(`Sequential required learning unlocks the final test; optional answers are not required (${mobile?'mobile':'desktop'})`,async t=>{
 const page=await openStudio(t,{mobile});
 await page.locator('#webHtmlEditor').fill(completeHtml);await minimize(page);
 for(let n=1;n<=10;n++){
  assert.equal(await page.locator('#hl1PageSelect').inputValue(),String(n));
  await completeRequired(page,n,mobile);
  assert.equal(await page.locator('#hl1OverallProgress').getAttribute('value'),String(n));
  if(n===1)continue;
  assert.ok(await page.locator('#hl1PageSelect option[value="12"]').isDisabled());
  if(n<10){
   assert.ok(await page.locator('#hl1PageSelect option[value="11"]').isDisabled());
   // A newly unlocked, unvisited page has its own 未学習 state.
   assert.ok((await page.locator(`#hl1PageSelect option[value="${n+1}"]`).textContent()).includes('未学習'));
  }
  await page.locator('#hl1Next').click();
 }
 if(mobile)await page.locator('[data-show=practice]').click();
 assert.equal(await page.locator('#hl1SectionHeading').textContent(),'最終確認テスト');
 await page.locator('#hl1Check').click();
 assert.ok((await page.locator('#hl1Result').textContent()).includes('未回答'));
 assert.ok(await page.locator('#hl1Next').isDisabled());
 for(let i=0;i<8;i++)await page.locator(`input[name=hl1q${i}][value="0"]`).check();
 await page.locator('textarea[data-index="8"]').fill('headはページ情報、bodyは表示する内容');
 await page.locator('textarea[data-index="9"]').fill('ブラウザでHTMLファイルを開く');
 await page.locator('#hl1Check').click();
 await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('保存しました'));
 assert.ok(await page.locator('#hl1Next').isEnabled());
 assert.ok(await page.locator('#lsFinalSubmission').isVisible());
 await page.screenshot({path:`/tmp/learning-studio-guided-test-${mobile?'mobile':'desktop'}.png`});
 await page.locator('#hl1Next').click();if(mobile)await page.locator('[data-show=practice]').click();
 for(const checkbox of await page.locator('.hl1-task[data-required=true] input[type=checkbox]').all())await checkbox.check();
 await page.locator('textarea[data-index="8"]').fill('HTMLで自分の紹介ページが作れた');
 await page.locator('#hl1Check').click();
 assert.equal(await page.locator('#hl1OverallProgress').getAttribute('value'),'12');
 assert.equal(await page.locator('#webHtmlEditor').inputValue(),completeHtml);
 // Optional reflection answers on pages 1-10 remain empty, yet progress is complete.
 await page.locator('#hl1Save').click();await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('保存しました'));
 const saved=await page.evaluate(id=>window.__firebase.data.web_workspaces[id],workspaceId);
 assert.ok(saved.pageWork._learning.testSubmitted);assert.equal(saved.pageWork._learning.currentPage,12);
 assert.equal(saved.pageWork.p01.answers[5],undefined);assert.equal(saved.pageWork.p11.answers[9],'ブラウザでHTMLファイルを開く');
 const relogin=await openStudio(t,{mobile,remoteCode:saved});
 await relogin.waitForFunction(()=>document.querySelector('#hl1PageSelect').value==='12');await minimize(relogin);
 assert.equal(await relogin.locator('#hl1OverallProgress').getAttribute('value'),'12');
 assert.ok(await relogin.locator('#hl1PageSelect option[value="11"]').isEnabled());
 await selectPage(relogin,11);if(mobile)await relogin.locator('[data-show=practice]').click();
 assert.equal(await relogin.locator('textarea[data-index="9"]').inputValue(),'ブラウザでHTMLファイルを開く');
});

test('Legacy answers and checked progress migrate without deletion and restore position from Firebase on a new login',async t=>{
 const remoteCode={html:'<h1>昔の作品</h1>',css:'h1{color:blue}',legacyField:'keep',pageWork:{
  p01:{answers:{0:'1',1:'0',2:'0',3:true,4:true,6:'昔の回答'},results:{0:true,1:true,2:true,3:true,4:true}},
  p08:{answers:{7:'先に答えてあった内容'},results:{7:true}},customRecord:{note:'keep'}
 }};
 const page=await openStudio(t,{remoteCode,localProgress:{p01:{answers:{5:'端末に残っていた回答'},results:{5:true}}}});await minimize(page);
 assert.ok(await page.locator('#hl1Next').isEnabled());
 assert.equal(await page.locator('.hl1-task').count(),0);
 await page.locator('#hl1Next').click();await page.locator('#hl1Save').click();
 await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('保存しました'));
 const saved=await page.evaluate(id=>window.__firebase.data.web_workspaces[id],workspaceId);
 assert.equal(saved.pageWork.p01.answers[5],'端末に残っていた回答');assert.equal(saved.pageWork.p01.answers[6],'昔の回答');
 assert.equal(saved.legacyField,'keep');assert.equal(saved.pageWork.customRecord.note,'keep');
 assert.equal(saved.pageWork.p08.answers[7],'先に答えてあった内容');assert.equal(saved.pageWork._learning.currentPage,2);
 const relogin=await openStudio(t,{remoteCode:saved});
 await relogin.waitForFunction(()=>document.querySelector('#hl1PageSelect').value==='2');await minimize(relogin);
 assert.ok(await relogin.locator('#hl1PageSelect option[value="3"]').isDisabled());
 await selectPage(relogin,1);assert.equal(await relogin.locator('.hl1-task').count(),0);
 assert.ok(!(await relogin.locator('#hl1Questions').textContent()).includes('端末に残っていた回答'));
});

test('Teacher previews all pages and adjusts a student without deleting answers; stale caches obey the adjustment',async t=>{
 const original={html:'<h1>生徒の大切な作品</h1>',css:'h1{color:red}',pageWork:{p11:{answers:{8:'過去のテスト回答'},results:{8:true}}}};
 const teacher=await openStudio(t,{role:'teacher',remoteCode:original});await minimize(teacher);
 await selectPage(teacher,12);assert.equal(await teacher.locator('#hl1PageSelect').inputValue(),'12');
 await teacher.locator('.hl1-teacher-panel summary').click();
 await teacher.locator('#hl1TeacherStudent').selectOption('student01');await teacher.locator('#hl1TeacherLoad').click();
 await teacher.locator('#hl1TeacherApply').waitFor({state:'visible'});
 await teacher.waitForFunction(()=>!document.querySelector('#hl1TeacherApply').disabled);
 await teacher.locator('#hl1TeacherThrough').selectOption('3');teacher.once('dialog',d=>d.accept());await teacher.locator('#hl1TeacherApply').click();
 await teacher.waitForFunction(()=>document.querySelector('#hl1TeacherStatus').textContent.includes('保存しました'));
 const adjusted=await teacher.evaluate(id=>window.__firebase.data.web_workspaces[id],workspaceId);
 assert.equal(adjusted.html,original.html);assert.deepEqual(adjusted.pageWork.p11,original.pageWork.p11);
 const stale={_learning:{version:1,currentPage:12,testSubmitted:true,teacherRevision:'old',completed:Object.fromEntries(Array.from({length:12},(_,i)=>['p'+String(i+1).padStart(2,'0'),true]))}};
 const student=await openStudio(t,{remoteCode:adjusted,localProgress:stale});
 await student.waitForFunction(()=>document.querySelector('#hl1PageSelect').value==='4');await minimize(student);
 assert.ok(await student.locator('#hl1PageSelect option[value="5"]').isDisabled());
 assert.ok(await student.locator('#hl1PageSelect option[value="11"]').isDisabled());
 await student.locator('#hl1Save').click();await student.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('保存しました'));
 const doc=await student.evaluate(id=>window.__firebase.data.web_workspaces[id],workspaceId);
 assert.equal(doc.pageWork._learning.teacherAdjustment.revision,adjusted.pageWork._learning.teacherAdjustment.revision);
 assert.equal(doc.pageWork.p11.answers[8],'過去のテスト回答');
 assert.ok(await student.evaluate(()=>window.__firebase.writes.every(w=>!w.data.pageWork?._learning?.teacherAdjustment)));
 // Teacher can also relock everything while retaining previously saved answers.
 await teacher.locator('#hl1TeacherThrough').selectOption('0');teacher.once('dialog',d=>d.accept());await teacher.locator('#hl1TeacherApply').click();
 await teacher.waitForFunction(()=>document.querySelector('#hl1TeacherStatus').textContent.includes('保存しました'));
 const reset=await teacher.evaluate(id=>window.__firebase.data.web_workspaces[id],workspaceId);
 const again=await openStudio(t,{remoteCode:reset});await minimize(again);
 assert.equal(await again.locator('#hl1PageSelect').inputValue(),'1');assert.ok(await again.locator('#hl1PageSelect option[value="2"]').isDisabled());
 assert.equal(reset.pageWork.p11.answers[8],'過去のテスト回答');
});

for(const mobile of [false,true])test(`PDF zoom supports 50/75/90% centered and retains all larger scales (${mobile?'mobile':'desktop'})`,async t=>{
 const page=await openStudio(t,{mobile});await minimize(page);
 for(const scale of [50,75,90,100,125,150,200]){
  await page.locator('#hl1Scale').selectOption(String(scale));
  const sizes=await page.evaluate(()=>{const image=document.querySelector('#hl1Image').getBoundingClientRect(),panel=document.querySelector('#hl1PageViewport');return {x:image.x,width:image.width,px:panel.getBoundingClientRect().x+panel.clientLeft,pw:panel.clientWidth};});
  await closeTo(sizes.width/sizes.pw,scale/100,.02);
  if(scale<100)await closeTo(sizes.x+sizes.width/2,sizes.px+sizes.pw/2);
 }
 await page.screenshot({path:`/tmp/learning-studio-guided-zoom-${mobile?'mobile':'desktop'}.png`});
});

test('Unloaded Firebase history is not overwritten by autosave and read failure keeps local work',async t=>{
 const page=await openStudio(t,{holdReads:true,localProgress:{_learning:{currentPage:2,completed:{p01:true}}},remoteCode:{pageWork:{_learning:{version:1,currentPage:3,completed:{p01:true,p02:true}},p08:{answers:{7:'クラウドの既存回答'},results:{}}}}});await minimize(page);
 await page.locator('textarea[data-index="6"]').fill('履歴読み込み中の新しい回答');
 await page.locator('#hl1Save').click();
 assert.equal(await page.evaluate(()=>window.__firebase.writes.length),0);
 assert.ok((await page.locator('#hl1SaveStatus').textContent()).includes('端末の回答を保持'));
 await page.evaluate(()=>{window.__firebase.holdReads=false;window.__firebase.releaseReads.forEach(resolve=>resolve());});
 await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('復元'));
 await page.locator('#hl1Save').click();await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('保存しました'));
 const saved=await page.evaluate(id=>window.__firebase.data.web_workspaces[id],workspaceId);
 assert.equal(saved.pageWork.p08.answers[7],'クラウドの既存回答');assert.equal(saved.pageWork.p02.answers[6],'履歴読み込み中の新しい回答');
 assert.equal(saved.pageWork._learning.completed.p01,true);assert.equal(saved.pageWork._learning.completed.p02,true);
 assert.ok(await page.locator('#hl1PageSelect option[value="3"]').isEnabled());
 const offline=await openStudio(t,{failReads:true});await minimize(offline);await offline.locator('#hl1Next').click();
 await offline.locator('textarea[data-index="6"]').fill('通信エラーでも保持');await offline.locator('#hl1Save').click();
 assert.equal(await offline.evaluate(()=>window.__firebase.writes.length),0);
 assert.ok((await offline.locator('#hl1SaveStatus').textContent()).includes('端末の回答を保持'));
});


test('Fully checked legacy learning and final-test history retain all twelve completed pages',async t=>{
 const pageWork={};
 for(let n=1;n<=12;n++)pageWork['p'+String(n).padStart(2,'0')]={answers:{},results:Object.fromEntries(Array.from({length:11},(_,i)=>[i,true]))};
 for(let i=0;i<8;i++)pageWork.p11.answers[i]='0';
 pageWork.p11.answers[8]='以前に書いたheadとbodyの説明';pageWork.p11.answers[9]='以前に書いたHTMLを開く手順';
 pageWork.p11.results[1]=false; // A checked wrong answer still constitutes a legacy submission.
 const page=await openStudio(t,{remoteCode:{pageWork}});await minimize(page);
 await page.waitForFunction(()=>document.querySelector('#hl1OverallProgress').value===12);
 assert.ok(await page.locator('#hl1PageSelect option[value="12"]').isEnabled());
 await selectPage(page,11);
 assert.equal(await page.locator('textarea[data-index="8"]').inputValue(),'以前に書いたheadとbodyの説明');
 assert.ok((await page.locator('#hl1AnswerStatus').textContent()).includes('テスト提出済み'));
});

async function assertUnifiedHeader(page,{workbook=true,compact=true}={}){
 const header=page.locator('#lsHeader'),top=page.locator('.ls-header-top');
 const rect=await header.boundingBox(),topRect=await top.boundingBox(),viewport=page.viewportSize();
 assert.equal(await header.evaluate(el=>getComputedStyle(el).position),'fixed');
 await closeTo(rect.y,0);
 assert.ok(rect.x>=0&&rect.x+rect.width<=viewport.width);
 assert.equal(await header.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(36, 59, 112)');
 assert.ok(await page.locator('.ls-brand-title').isVisible());assert.ok(await page.locator('.brand small').isVisible());
 assert.ok((await page.locator('.brand small').textContent()).includes('プログラミング学びの教室'));
 const logout=await page.locator('#logout').boundingBox();
 assert.ok(logout.width>=72&&logout.height>=44,'Logout is a distinct 44px touch target');
 assert.ok(logout.y>=topRect.y&&logout.y+logout.height<=topRect.y+topRect.height);
 assert.ok(logout.x+logout.width<=viewport.width);
 if(workbook){
  assert.ok(await page.locator('#lsHeader .hl1-page-navigation').isVisible());
  assert.equal(await page.locator('#lsLessonNavigation').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(54, 92, 150)');
  const nav=await assertPageControlsUsable(page);
  await closeTo(nav.y,topRect.y+topRect.height);
  assert.ok(await page.locator('#hl1OverallProgress').isVisible());
  assert.ok(await page.locator('#hl1Number').isVisible());
  if(compact)assert.ok(rect.height<=(viewport.width<=600?124:116),`Compact header height: ${rect.height}px`);
 }else{
  assert.equal(await page.locator('.hl1-page-navigation').count(),0);
  assert.ok(await page.locator('#lsLessonNavigation').isHidden());
  if(compact)assert.ok(rect.height<=60);
 }
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Header causes no horizontal page scrolling');
 await closeTo(await page.locator('body').evaluate(el=>parseFloat(getComputedStyle(el).paddingTop)),rect.height);
 return rect;
}

test('Desktop unified header keeps account and workbook controls in two compact bands while scrolling',async t=>{
 const page=await openStudio(t,{completedThrough:2});await minimize(page);await selectPage(page,3);await settleLayout(page);
 const header=await assertUnifiedHeader(page);
 assert.equal(await page.locator('.ls-session-name').textContent(),'テスト生徒');
 for(const selector of ['.hl1-reader','.hl1-practice'])assert.ok((await page.locator(selector).boundingBox()).y>=header.y+header.height);
 await page.locator('#hl1PageViewport').hover();await page.mouse.wheel(0,450);
 await page.waitForFunction(()=>document.querySelector('#hl1PageViewport').scrollTop>0);await assertUnifiedHeader(page);
 await page.locator('.hl1-practice').hover();await page.mouse.wheel(0,400);
 await page.waitForFunction(()=>document.querySelector('.hl1-practice').scrollTop>0);await assertUnifiedHeader(page);
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await settleLayout(page);await assertUnifiedHeader(page);
 await page.locator('#hl1Prev').click();assert.equal(await page.locator('#hl1Current').textContent(),'PDF 2ページ');
 await page.waitForFunction(()=>document.querySelector('#hl1Image').src.startsWith('data:image/webp'));
 await page.locator('#hl1Next').click();assert.equal(await page.locator('#hl1Current').textContent(),'PDF 3ページ');
 await page.locator('#hl1Scale').selectOption('75');await settleLayout(page);
 await page.screenshot({path:'/tmp/learning-studio-unified-header-desktop.png'});
 await editor(page);await page.locator('[data-window-move]').focus();
 for(let i=0;i<20;i++)await page.keyboard.press('Shift+ArrowUp');
 const win=await page.locator('#hl1EditorWindow').boundingBox();assert.ok(win.y>=header.y+header.height+7);
 await assertUnifiedHeader(page);await page.screenshot({path:'/tmp/learning-studio-unified-header-editor.png'});
});

test('Mobile unified header fits narrow and landscape screens, long names and keyboard viewport changes',async t=>{
 const page=await openStudio(t,{mobile:true,completedThrough:2});await minimize(page);
 await page.locator('.ls-session-name').evaluate(el=>{el.textContent='とても長い名前のテスト生徒さん';el.title=el.textContent;});
 for(const size of [{width:320,height:568},{width:375,height:812},{width:768,height:1024},{width:844,height:390}]){
  await page.setViewportSize(size);await settleLayout(page);await assertUnifiedHeader(page);
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await settleLayout(page);await assertUnifiedHeader(page);
  await selectPage(page,3);await editor(page);await page.locator('[data-window-reset]').click();
  const rect=await assertUnifiedHeader(page),win=await page.locator('#hl1EditorWindow').boundingBox();
  assert.ok(win.y>=rect.y+rect.height+7);await minimize(page);
 }
 // Emulate the reduced visible area when a phone keyboard is open.
 await page.setViewportSize({width:375,height:360});await settleLayout(page);await editor(page);
 const keyboardHeader=await assertUnifiedHeader(page),keyboardWindow=await page.locator('#hl1EditorWindow').boundingBox();
 assert.ok(keyboardWindow.y>=keyboardHeader.y+keyboardHeader.height+7);
 assert.ok(keyboardWindow.y+keyboardWindow.height<=360);
 await minimize(page);await page.setViewportSize({width:375,height:812});
 await page.locator('.ls-session-name').evaluate(el=>{el.textContent='テスト生徒';el.title=el.textContent;});
 await selectPage(page,3);await settleLayout(page);
 await page.screenshot({path:'/tmp/learning-studio-unified-header-mobile.png'});
 await page.locator('[data-show=practice]').click();await page.locator('.hl1-grid').scrollIntoViewIfNeeded();
 await assertUnifiedHeader(page);await page.screenshot({path:'/tmp/learning-studio-unified-header-mobile-practice.png'});
});

for(const role of ['student','teacher'])test(`Shared header survives logout/login and hides workbook controls on other screens (${role})`,async t=>{
 const page=await openStudio(t,{role});await minimize(page);await assertUnifiedHeader(page);
 if(role==='teacher')assert.equal(await page.locator('.ls-session-name').textContent(),'先生');
 await page.locator('#logout').click();await page.waitForSelector('#login');await settleLayout(page);
 assert.equal(await page.locator('.hl1-page-navigation').count(),0);
 assert.ok(await page.locator('#lsLessonNavigation').isHidden());
 assert.equal(await page.locator('#logout').count(),0);
 await closeTo((await page.locator('#lsHeader').boundingBox()).y,0);
 await page.locator('#login select[name=kind]').selectOption(role);
 await page.locator('#login input[name=identifier]').fill(role==='student'?'student01':'teacher@example.test');
 await page.locator('#login input[name=password]').fill('test-password-for-browser');
 await page.locator('#login button').click();await page.waitForSelector('.course');await settleLayout(page);
 assert.equal(await page.locator('.course').count(),7);await assertUnifiedHeader(page,{workbook:false});
 assert.deepEqual(await page.evaluate(()=>window.__firebase.authEvents),['logout','login']);
 if(role==='teacher'){
  await page.locator('#manage').click();await page.locator('#tabStudents').click();await assertUnifiedHeader(page,{workbook:false});
  await page.locator('#tabLessons').click();assert.ok((await page.locator('#teacherBody').textContent()).includes('教材'));
  await page.locator('#home').click();
 }
 await page.locator('[data-course=python][data-level="1"]').click();await page.locator('.lesson-tile').first().click();
 await assertUnifiedHeader(page,{workbook:false});
 await page.locator('#home').click();await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lessonId}"]`).click();
 await page.waitForSelector('#webHtmlEditor');await settleLayout(page);await assertUnifiedHeader(page);
 assert.equal(await page.locator('#lsHeader .hl1-page-navigation').count(),1);
});


for(const mobile of [false,true])test(`Page 1 is a reading introduction, advances without a quiz and preserves old answers (${mobile?'mobile':'desktop'})`,async t=>{
 const oldAnswers={0:'1',1:'0',5:'以前の自己紹介についての回答'};
 const oldResults={0:true,1:false,3:false};
 const original={html:completeHtml,css:'h1{color:blue}',js:'document.body.dataset.saved="yes";',pageWork:{p01:{answers:oldAnswers,results:oldResults},p02:{answers:{6:'以前のブラウザの説明'},results:{6:true}}}};
 const page=await openStudio(t,{mobile,remoteCode:original,localProgress:{p01:{answers:{6:'端末に残っていた旧回答'},results:{6:true}}}});
 await page.waitForFunction(()=>document.querySelector('#webHtmlEditor').value.includes('私の作品'));await minimize(page);
 if(mobile)await page.locator('[data-show=practice]').click();
 assert.equal(await page.locator('#hl1PageSelect').inputValue(),'1');
 assert.equal(await page.locator('#hl1OverallProgress').getAttribute('value'),'0');
 assert.equal(await page.locator('.hl1-task').count(),0);
 assert.equal(await page.locator('#hl1Questions input,#hl1Questions textarea').count(),0);
 const introduction=await page.locator('#hl1Questions').textContent();
 assert.deepEqual(await page.locator('.hl1-learning-flow strong').allTextContents(),['Input（インプット）','Output（アウトプット）','Check（確認）','Reflect（振り返り）']);
 assert.ok(introduction.includes('見本や自分のねらいに合っているか'));
 assert.ok(introduction.includes('できたこと・できなかったことを振り返り、次の学習につなげる'));
 assert.ok(introduction.includes('コードを直してもう一度確認'));
 assert.ok(!introduction.includes('知る → 読む'));
 assert.ok(introduction.includes('分からない言葉は先生に聞こう'));
 assert.ok(introduction.includes('HTMLは、Webページの内容や構造'));
 for(const obsolete of ['今日の目標に入っているものは？','必要な組み合わせは？','「こんにちは！」は何の役割？','見出しと文章をそれぞれ見つけた','以前の自己紹介についての回答'])assert.ok(!introduction.includes(obsolete));
 assert.ok(await page.locator('#hl1Progress').isHidden());assert.ok(await page.locator('#hl1AnswerStatus').isHidden());
 assert.ok(await page.locator('#hl1Next').isEnabled());assert.ok(await page.locator('#hl1PageSelect option[value="11"]').isDisabled());
 await page.locator('.hl1-grid').scrollIntoViewIfNeeded();
 if(!mobile){await page.locator('#hl1Scale').selectOption('75');await page.locator('#hl1PageViewport').evaluate(el=>el.scrollTop=el.scrollHeight);}
 await page.screenshot({path:`/tmp/learning-studio-page1-introduction-${mobile?'mobile':'desktop'}.png`});
 if(mobile)await page.locator('#hl1Next').click();else await page.getByRole('button',{name:'使い方を確認して次へ',exact:true}).click();
 assert.equal(await page.locator('#hl1PageSelect').inputValue(),'2');
 assert.equal(await page.locator('#hl1OverallProgress').getAttribute('value'),'1');
 if(mobile)await page.locator('[data-show=practice]').click();
 assert.equal(await page.locator('#hl1SectionHeading').textContent(),'このページの学習・進捗チェック');
 assert.ok(await page.locator('#hl1Progress').isVisible());assert.ok(await page.locator('#hl1Next').isDisabled());
 assert.equal(await page.locator('textarea[data-index="6"]').inputValue(),'以前のブラウザの説明');
 await page.locator('#hl1Save').click();await page.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('保存しました'));
 const saved=await page.evaluate(id=>window.__firebase.data.web_workspaces[id],workspaceId);
 assert.equal(saved.pageWork.p01.introRead,true);
 assert.deepEqual(saved.pageWork.p01.answers,{...oldAnswers,6:'端末に残っていた旧回答'});
 assert.deepEqual(saved.pageWork.p01.results,{...oldResults,6:true});
 assert.equal(saved.html,original.html);assert.equal(saved.css,original.css);assert.equal(saved.js,original.js);
 const again=await openStudio(t,{mobile,remoteCode:saved});
 await again.waitForFunction(()=>document.querySelector('#hl1PageSelect').value==='2');await minimize(again);await selectPage(again,1);
 if(mobile)await again.locator('[data-show=practice]').click();
 assert.equal(await again.locator('.hl1-task').count(),0);
 assert.equal(await again.locator('#hl1OverallProgress').getAttribute('value'),'1');
});


// Use Chromium's real HTTP cache. Playwright request routing is deliberately off:
// routing disables the HTTP cache and cannot reproduce this production failure.
test('A phone with cached unversioned modules updates the lesson after deployment without losing local work',async t=>{
 cacheScenario=true;serveOldRelease=true;bareCompanionRequests=0;
 t.after(()=>{cacheScenario=false;serveOldRelease=false;});
 const page=await openStudio(t,{role:'teacher',mobile:true,cachedAssets:true});
 await page.locator('#webHtmlEditor').fill('<h1>消してはいけない作品</h1>');
 await page.locator('[data-lang=css]').click();await page.locator('#webCssEditor').fill('h1{color:blue}');
 await minimize(page);await page.locator('[data-show=practice]').click();
 assert.ok((await page.locator('#hl1Questions').textContent()).includes('知る → 読む → 作る → 試す'));
 await page.locator('#hl1Next').click();
 await page.evaluate(()=>{localStorage.setItem('cache-test-keep','keep');sessionStorage.setItem('cache-test-session','keep');});
 const cachedRequests=bareCompanionRequests;assert.ok(cachedRequests>0);
 serveOldRelease=false;
 await page.reload();await page.waitForSelector('[data-course=web]');
 await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lessonId}"]`).click();
 await page.waitForSelector('#webHtmlEditor');await minimize(page);
 assert.equal(await page.locator('#hl1PageSelect').inputValue(),'2');
 assert.equal(await page.locator('#webHtmlEditor').inputValue(),'<h1>消してはいけない作品</h1>');
 assert.equal(await page.locator('#webCssEditor').inputValue(),'h1{color:blue}');
 assert.equal(await page.evaluate(()=>localStorage.getItem('cache-test-keep')),'keep');
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('cache-test-session')),'keep');
 await selectPage(page,1);await page.locator('[data-show=practice]').click();
 assert.deepEqual(await page.locator('.hl1-learning-flow strong').allTextContents(),['Input（インプット）','Output（アウトプット）','Check（確認）','Reflect（振り返り）']);
 assert.ok(!(await page.locator('#hl1Questions').textContent()).includes('知る → 読む → 作る → 試す'));
 // The old response is demonstrably still in the browser cache. New asset URLs
 // bypassed it; neither a cache purge nor clearing localStorage was necessary.
 const stale=await page.evaluate(()=>fetch('assets/html-level1-companion.js',{cache:'force-cache'}).then(r=>r.text()));
 assert.ok(stale.includes('「知る → 読む → 作る → 試す」の順に学習します。'));
 assert.equal(bareCompanionRequests,cachedRequests,'The stale fetch was served from HTTP cache, not the updated server');
 for(const selector of ['#hl1Image','.hl1-pdf-actions a']){
  const url=new URL(await page.locator(selector).getAttribute(selector==='#hl1Image'?'src':'href'),base);
  assert.match(url.searchParams.get('v'),/^[a-f0-9]{12}$/);
 }
 const appUrl=await page.locator('script[type=module]').getAttribute('src');assert.match(appUrl,/app\.js\?v=[a-f0-9]{12}$/);
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(entry=>entry.name));
 assert.ok(resources.some(url=>/html-level1-companion\.js\?v=[a-f0-9]{12}/.test(url)));
 await page.locator('.hl1-grid').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
 await page.locator('.hl1-practice').evaluate(el=>{const card=el.querySelector('.hl1-introduction section');el.scrollTop+=card.getBoundingClientRect().top-el.getBoundingClientRect().top;});
 await settleLayout(page);
 await page.screenshot({path:'/tmp/learning-studio-mobile-cache-update.png'});
});

for(const mobile of [false,true])test(`Teacher edits PDF and questions, exports a real Japanese PDF (${mobile?'mobile':'desktop'})`,async t=>{
 const page=await openStudio(t,{role:'teacher',mobile});await minimize(page);
 await page.locator('#wbEdit').click();await page.locator('#wbPage').selectOption('1');
 await page.locator('#wbFields [name=pdfBody]').fill('先生が編集した教材本文です。\nHTMLのタグを確認しよう。');
 await page.locator('#wbFields [name=title]').fill('先生の新しい学習テーマ');
 const task=page.locator('#wbFields [data-task]').first();const taskId=await task.getAttribute('data-task');
 await task.locator('[name=text]').fill('変更した確認問題です');
 await page.screenshot({path:`/tmp/learning-studio-author-dialog-${mobile?'mobile':'desktop'}.png`});
 await page.locator('#wbSave').click();await page.waitForFunction(()=>!document.querySelector('#wbAuthorStatus').textContent.includes('内容を確認中'),null,{timeout:30000});assert.ok((await page.locator('#wbAuthorStatus').textContent()).includes('保存しました'),await page.locator('#wbAuthorStatus').textContent());
 const book=await page.evaluate(id=>window.__firebase.data.lessons[id].workbook,lessonId);
 assert.equal(book.pages[1].document.edited,true);assert.equal(book.pages[1].tasks[0].storageKey,`${taskId}@2`);
 const downloadPromise=page.waitForEvent('download',{timeout:30000});downloadPromise.catch(()=>{});await page.locator('#wbPdf').click();await page.waitForFunction(()=>!document.querySelector('#wbAuthorStatus').textContent.includes('内容を確認中'),null,{timeout:30000});assert.ok((await page.locator('#wbAuthorStatus').textContent()).includes('PDFを作成しました'),await page.locator('#wbAuthorStatus').textContent());const download=await downloadPromise;
 await download.saveAs(`/tmp/learning-studio-teacher-edited-${mobile?'mobile':'desktop'}.pdf`);
 await page.locator('#wbClose').click();await selectPage(page,2);
 await page.waitForFunction(()=>document.querySelector('#hl1PageImage')?.src.startsWith('data:')||[...document.images].some(i=>i.src.startsWith('data:image/webp')));
 await page.screenshot({path:`/tmp/learning-studio-teacher-editor-${mobile?'mobile':'desktop'}.png`});
 const studentPage=await openStudio(t,{mobile,workbook:book,completedThrough:1,remoteCode:{pageWork:{p02:{answers:{0:'0'},results:{0:true}}}}});await minimize(studentPage);await selectPage(studentPage,2);
 if(mobile)await studentPage.locator('[data-show=practice]').click();
 assert.equal(await studentPage.locator('#wbEdit').count(),0);
 assert.ok((await studentPage.locator('#hl1Questions').textContent()).includes('変更した確認問題です'));
 assert.equal(await studentPage.locator('input[name="hl1q0"]:checked').count(),0);
 await studentPage.locator('input[name=hl1q0]').last().check();
 await studentPage.locator('#hl1Save').click();await studentPage.waitForFunction(()=>document.querySelector('#hl1SaveStatus').textContent.includes('保存しました'));
 assert.equal(await studentPage.evaluate(id=>window.__firebase.data.web_workspaces[id].pageWork.p02.answers[0],workspaceId),'0');
 assert.equal(await studentPage.evaluate(({id,key})=>window.__firebase.data.web_workspaces[id].pageWork.p02.answers[key],{id:workspaceId,key:book.pages[1].tasks[0].storageKey}),String(book.pages[1].tasks[0].options.length-1));
});

test('Final assessment has twelve required questions, preserves drafts and submits prompt snapshots',async t=>{
 const page=await openStudio(t,{completedThrough:11});await minimize(page);
 assert.equal(await page.locator('#submitTest textarea').count(),12);
 for(const field of await page.locator('#submitTest textarea').all())await field.fill('学習した内容を説明する回答です');
 await page.reload();await page.waitForSelector('[data-course=web]');await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lessonId}"]`).click();await page.waitForSelector('#webHtmlEditor');await minimize(page);
 assert.equal(await page.locator('#submitTest textarea').first().inputValue(),'学習した内容を説明する回答です');
 await page.locator('#submitTest button').click();await page.waitForFunction(()=>document.querySelector('#submitMsg').textContent.includes('全12問の回答を保存'));
 const saved=await page.evaluate(()=>window.__firebase.data.submissions['test-created']);assert.equal(saved.status,'pending');assert.ok(saved.response.includes('12.'));assert.ok(saved.response.includes('回答：学習した内容'));
});

test('Teacher rejects fewer than ten final questions and concurrent overwrite without deleting the draft',async t=>{
 const page=await openStudio(t,{role:'teacher'});await minimize(page);await page.locator('#wbEdit').click();
 await page.locator('#wbFinals').evaluate(el=>el.closest('details').open=true);
 for(let i=0;i<3;i++)await page.locator('[data-remove-final]').last().click();
 await page.locator('#wbSave').click();await page.waitForFunction(()=>document.querySelector('#wbAuthorStatus').textContent.includes('10〜30問'));
 for(let i=0;i<3;i++)await page.locator('#wbAddFinal').click();
 await page.evaluate(id=>window.__firebase.data.lessons[id].workbook={revision:'another-teacher'},lessonId);
 await page.locator('#wbSave').click();await page.waitForFunction(()=>document.querySelector('#wbAuthorStatus').textContent.includes('別の編集'));
 assert.equal(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('ls-workbook-author:'))),true);
});

test('Workbook JSON exchange validates data and failed cloud save keeps the teacher draft',async t=>{
 const page=await openStudio(t,{role:'teacher',failWrites:true});await minimize(page);await page.locator('#wbEdit').click();
 const original=JSON.parse(await fs.readFile(path.join(root,'assets/html-level1-workbook.json'),'utf8'));
 original.pages[0].title='Codexから読み込んだ教材';
 await page.locator('#wbImport').setInputFiles({name:'workbook.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(original))});
 await page.waitForFunction(()=>document.querySelector('#wbAuthorStatus').textContent.includes('JSONを読み込みました'));
 assert.equal(await page.locator('#wbFields [name=title]').inputValue(),'Codexから読み込んだ教材');
 const pending=page.waitForEvent('download');await page.locator('#wbExport').click();const download=await pending;const jsonPath=await download.path();assert.equal(JSON.parse(await fs.readFile(jsonPath,'utf8')).pages[0].title,original.pages[0].title);
 await page.locator('#wbSave').click();await page.waitForFunction(()=>document.querySelector('#wbAuthorStatus').textContent.includes('Test offline'));
 assert.equal(await page.locator('#wbFields [name=title]').inputValue(),original.pages[0].title);
 assert.equal(await page.evaluate(id=>window.__firebase.data.lessons[id].workbook,lessonId),undefined);
 original.finalQuestions=original.finalQuestions.slice(0,9);
 await page.locator('#wbImport').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(original))});
 await page.waitForFunction(()=>document.querySelector('#wbAuthorStatus').textContent.includes('10〜30問'));
});

for(const mobile of [false,true])test(`Help opens teacher instructions without losing edits (${mobile?'mobile':'desktop'})`,async t=>{
 const page=await openStudio(t,{role:'teacher',mobile});
 await page.locator('#webHtmlEditor').fill('<h1>保存前の原稿</h1>');
 const widths=mobile?[320,375,844]:[1440];
 for(const width of widths){
  await page.setViewportSize({width,height:mobile?812:1000});await settleLayout(page);
  const help=await page.locator('#lsHelp').boundingBox(),logout=await page.locator('#logout').boundingBox();
  assert.ok(help.width>=44&&help.height>=44&&help.x+help.width<=width);
  assert.ok(logout.x+logout.width<=help.x);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 }
 await page.setViewportSize({width:mobile?375:1440,height:mobile?812:1000});
 const url=page.url(),pages=page.context().pages().length;
 await selectPage(page,4);await page.locator('#lsHelp').click();
 const help=page.locator('#lsHelpDialog');
 await help.locator('h1').waitFor();
 assert.equal(await help.locator('h1').textContent(),'先生向け 教材・問題編集手順書');
 assert.equal(page.context().pages().length,pages);
 for(const width of mobile?[320,375,844]:[1440]){
  await page.setViewportSize({width,height:mobile?812:1000});
  assert.equal(await help.evaluate(el=>el.scrollWidth<=el.clientWidth),true);
  for(const id of ['start','lessons','workbook','backup','trouble']){
   await help.locator(`nav a[href="#${id}"]`).click();
   assert.equal(page.url(),url);
   assert.equal(await page.locator('#lsHelpClose').isVisible(),true);
   assert.ok((await page.locator('#lsHelpClose').boundingBox()).y>=0);
  }
 }
 await page.setViewportSize({width:mobile?375:1440,height:mobile?812:1000});
 await help.locator('nav').scrollIntoViewIfNeeded();
 await page.screenshot({path:`/tmp/learning-studio-help-${mobile?'mobile':'desktop'}.png`});
 await page.locator('#lsHelpClose').click();assert.equal(await help.isVisible(),false);
 assert.equal(await page.locator('#hl1Current').textContent(),'PDF 4ページ');
 assert.equal(await page.locator('#webHtmlEditor').inputValue(),'<h1>保存前の原稿</h1>');
 assert.equal(await page.locator('#lsHelp').evaluate(el=>el===document.activeElement),true);
 await page.locator('#lsHelp').click();await page.keyboard.press('Escape');assert.equal(await help.isVisible(),false);
 await page.locator('#lsHelp').click();await page.goBack();await page.waitForFunction(()=>!document.querySelector('#lsHelpDialog').open);
 assert.equal(await page.locator('#lsBackDialog').isVisible(),false);
 assert.equal(await page.locator('#hl1Current').textContent(),'PDF 4ページ');
 await page.locator('#logout').click();await page.waitForSelector('#login');
 assert.equal(await page.locator('#lsHelp').isVisible(),true);
});

for(const mobile of [false,true])test(`Every workbook page includes matching learning/check guidance (${mobile?'mobile':'desktop'})`,async t=>{
 const page=await openStudio(t,{role:'teacher',mobile});await minimize(page);
 const book=JSON.parse(await fs.readFile(path.join(root,'assets/html-level1-workbook.json'),'utf8'));
 for(let n=2;n<=12;n++){
  await selectPage(page,n);
  await page.waitForFunction(()=>{const i=document.querySelector('#hl1Image');return i.getAttribute('src')?.startsWith('data:')&&i.complete&&i.naturalWidth>0;},null,{timeout:30000});
  const guide=await page.locator('#hl1PageGuide').textContent();
  for(const task of book.pages[n-1].tasks)assert.ok(guide.includes(task.text),`Page ${n}: ${task.text}`);
  assert.ok(!await page.locator('#hl1PdfStatus').textContent().then(s=>s.includes('できません')));
  if([4,6,9,11].includes(n))await page.screenshot({path:`/tmp/learning-studio-aligned-${n}-${mobile?'mobile':'desktop'}.png`});
 }
 // A cloud-authored question must stay paired with its current page, too.
 await page.locator('#wbEdit').click();await page.locator('#wbPage').selectOption('5');
 await page.locator('#wbFields [data-task] [name=text]').first().fill('先生が追加した属性の確認');
 await page.locator('#wbSave').click();await page.waitForFunction(()=>document.querySelector('#wbAuthorStatus').textContent.includes('保存しました'),null,{timeout:30000});
 await page.locator('#wbClose').click();await selectPage(page,6);
 assert.ok((await page.locator('#hl1PageGuide').textContent()).includes('先生が追加した属性の確認'));
 const saved=await page.evaluate(id=>window.__firebase.data.lessons[id].workbook,lessonId);
 const studentPage=await openStudio(t,{mobile,workbook:saved,completedThrough:6});await minimize(studentPage);await selectPage(studentPage,6);
 assert.ok((await studentPage.locator('#hl1PageGuide').textContent()).includes('先生が追加した属性の確認'));
});

async function courseData(){return JSON.parse(await fs.readFile(path.join(root,'assets/web-course.json'),'utf8'));}
async function openCourseLesson(page,lesson){
 await page.locator('#home').click();await page.locator(`[data-course=web][data-level="${lesson.level}"]`).click();
 await page.locator(`[data-id="${lesson.id}"]`).click();await page.locator('#webHtmlEditor').waitFor({state:'attached'});
 await page.locator('[data-course-practice]').click();
 const frame=page.frameLocator('#webPreview');await frame.locator('main[data-game]').waitFor();return frame;
}
async function expireCourseGame(frame){
 await frame.locator('body').evaluate(()=>{const original=Date.now;Date.now=()=>original()+20000;});
 await frame.locator('#time').filter({hasText:/^0$/}).waitFor();
}
async function playCourseSample(page,frame,lesson){
 const n=Number(lesson.id.slice(-2)),level=lesson.level;
 if(level===1){
  for(let i=0;i<(n===3||n===4||n===6?5:3);i++)await frame.locator('#collect').click();
  assert.equal(await frame.locator('#score').textContent(),n===3||n===4||n===6?'5':'3');
  if(await frame.locator('#reset').count()){await frame.locator('#reset').click();assert.equal(await frame.locator('#score').textContent(),'0');}
  if(n===5||n===6)assert.ok(await frame.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0));
 }else if(level===2&&n===1){
  for(let i=0;i<3;i++)await frame.locator('#collect').click();assert.equal(await frame.locator('#score').textContent(),'3');
 }else if(level===2){
  await frame.locator('[data-box="0"]').click();assert.ok((await frame.locator('#message').textContent()).includes('からっぽ'));
  await frame.locator('[data-box="1"]').click();assert.ok((await frame.locator('#message').textContent()).includes('宝を発見'));
  assert.equal(await frame.locator('[data-box]:not(:disabled)').count(),0);
  if(await frame.locator('#reset').count()){await frame.locator('#reset').click();assert.equal(await frame.locator('[data-box]:disabled').count(),0);}
 }else if(level===3){
  if(n===1){for(let i=0;i<5;i++)await frame.locator('#collect').click();assert.equal(await frame.locator('#score').textContent(),'10');assert.equal(await frame.locator('#collect').isDisabled(),true);}
  else if([2,3,6].includes(n)){
   await frame.locator('body').evaluate(()=>{Math.random=()=>0;});
   await frame.locator('[data-hand="2"]').click();assert.ok((await frame.locator('#message').textContent()).includes('勝ち'));
   await frame.locator('[data-hand="0"]').click();assert.ok((await frame.locator('#message').textContent()).includes('あいこ'));
   await frame.locator('[data-hand="1"]').click();assert.ok((await frame.locator('#message').textContent()).includes('負け'));
   if(n!==2){
    assert.equal(await frame.locator('#score').textContent(),'1');assert.equal(await frame.locator('#rounds').textContent(),'3');
    if(n===6){for(let i=0;i<4;i++)await frame.locator('[data-hand="2"]').click();assert.equal(await frame.locator('#history li').count(),5);}
    await frame.locator('#reset').click();assert.equal(await frame.locator('#rounds').textContent(),'0');
   }
  }else if(n===4){
   for(let i=0;i<3;i++){await frame.locator('#choices button').nth(i).click();assert.equal(await frame.locator('#choices button:not(:disabled)').count(),0);await frame.locator('#next').click();}
   assert.equal(await frame.locator('#score').textContent(),'3');assert.ok((await frame.locator('#question').textContent()).includes('全問終了'));
   await frame.locator('#reset').click();assert.equal(await frame.locator('#score').textContent(),'0');
  }else if(n===5){
   await frame.locator('body').evaluate(()=>{Math.random=()=>.6;});await frame.locator('#reset').click();
   await frame.locator('#guess').fill('0');await frame.locator('#checkGuess').click();assert.equal(await frame.locator('#attempts').textContent(),'0');
   await frame.locator('#guess').fill('6');await frame.locator('#guess').press('Enter');assert.ok((await frame.locator('#message').textContent()).includes('大きい'));
   await frame.locator('#guess').fill('8');await frame.locator('#checkGuess').click();assert.ok((await frame.locator('#message').textContent()).includes('小さい'));
   await frame.locator('#guess').fill('7');await frame.locator('#checkGuess').click();assert.equal(await frame.locator('#message').textContent(),'正解！');
  }
 }else if(level===4){
  if([1,2,4].includes(n)){
   await frame.locator('body').evaluate(()=>{Math.random=()=>0;});
   if(n===4)await frame.locator('#difficulty').selectOption('1200');
   await frame.locator('#start').click();
   if(n===1)await frame.locator('#collect').click();else await frame.locator('#holes button').first().click();
   assert.equal(await frame.locator('#score').textContent(),'1');
   if(n!==1){await frame.locator('#holes button').first().click();assert.equal(await frame.locator('#score').textContent(),'1');}
   await expireCourseGame(frame);assert.equal(await frame.locator('#time').textContent(),'0');
   await frame.locator('#start').click();assert.equal(await frame.locator('#score').textContent(),'0');
  }else{
   if(n===6)await frame.locator('#start').click();
   if(n===3){await frame.locator('#board').focus();await frame.locator('#board').press('ArrowRight');assert.equal(await frame.locator('#player').evaluate(el=>el.style.left),'20%');}
   if(n===5){await frame.locator('[data-move=right]').click();await frame.locator('[data-move=right]').click();assert.equal(await frame.locator('#player').evaluate(el=>el.style.left),'20%');await frame.locator('[data-move=down]').click();await frame.locator('[data-move=down]').click();for(let i=0;i<3;i++)await frame.locator('[data-move=right]').click();}
   else{for(let i=0;i<4;i++)await frame.locator('[data-move=right]').click();for(let i=0;i<2;i++)await frame.locator('[data-move=down]').click();}
   assert.equal(await frame.locator('#score').textContent(),'1');
   if(n===6){await expireCourseGame(frame);const before=await frame.locator('#player').getAttribute('style');await frame.locator('[data-move=left]').click();assert.equal(await frame.locator('#player').getAttribute('style'),before);}
  }
 }else{
  for(let i=0;i<5;i++)await frame.locator('#collect').click();assert.equal(await frame.locator('#collect').isDisabled(),true);
  if(n>=2)assert.equal(await frame.locator('#best').textContent(),'5');
  await frame.locator('#reset').click();assert.equal(await frame.locator('#score').textContent(),'0');
  if(n===5){await frame.locator('#theme').selectOption('night');assert.equal(await frame.locator('html').getAttribute('data-theme'),'night');}
  if(n===6)assert.equal(await frame.locator('#version').textContent(),'1.0.0');
 }
}

for(const mobile of [false,true])test(`All 30 foundations samples run, play and fit the screen (${mobile?'mobile':'desktop'})`,async t=>{
 const page=await openStudio(t,{role:'teacher',mobile,startAtHome:true});
 const course=await courseData();assert.equal(course.lessons.length,30);
 for(const lesson of course.lessons){
  const frame=await openCourseLesson(page,lesson);
  assert.ok((await page.locator('.web-lesson-meta').textContent()).includes('60〜90分'));
  assert.ok((await page.locator('.lesson-text').first().textContent()).includes('【'));
  try{await playCourseSample(page,frame,lesson);}catch(err){err.message=lesson.id+': '+err.message;throw err;}
  assert.equal(await frame.locator('html').evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,lesson.id+' preview fits');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,lesson.id+' lesson fits');
  if(mobile){await page.setViewportSize({width:320,height:812});assert.equal(await frame.locator('html').evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,lesson.id+' 320px preview fits');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,lesson.id+' 320px lesson fits');await page.setViewportSize({width:375,height:812});}
  if(Number(lesson.id.slice(-2))===6){await page.locator('.web-preview-panel').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/web-course-level${lesson.level}-${mobile?'mobile':'desktop'}.png`});}
 }
});

for(const mobile of [false,true])test(`Roadmap explains three courses of five levels and labels planned content (${mobile?'mobile':'desktop'})`,async t=>{
 const page=await openStudio(t,{role:'teacher',mobile,startAtHome:true});
 await page.locator('[data-web-roadmap]').click();assert.equal(await page.locator('.web-roadmap-course').count(),3);
 assert.equal(await page.locator('.web-roadmap-levels li').count(),15);assert.equal(await page.locator('[data-web-level]').count(),5);
 assert.ok((await page.locator('.web-roadmap-intro').textContent()).includes('全30教材'));
 assert.equal(await page.locator('.web-roadmap-course').nth(1).getByText('今後の学習予定',{exact:true}).count(),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:`/tmp/web-course-roadmap-${mobile?'mobile':'desktop'}.png`});
 for(let level=1;level<=5;level++){
  await page.locator(`[data-web-level="${level}"]`).click();assert.equal(await page.locator('[data-id^="web1-"]').count(),6);
  await page.locator('[data-web-roadmap]').click();
 }
});

test('Teacher registers drafts, preserves edited lessons, publishes deliberately and students see only published lessons',async t=>{
 const course=await courseData(),first={...course.lessons[0],title:'先生の編集を保持',explanation:'先生の説明を保持',published:false};
 const page=await openStudio(t,{role:'teacher',startAtHome:true,extraLessons:[first]});page.on('dialog',d=>d.accept());
 await page.locator('#manage').click();await page.locator('#importFoundations').click();
 await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('登録処理が完了'));
 const registered=await page.evaluate(()=>Object.values(window.__firebase.data.lessons).filter(l=>l.id.startsWith('web1-')));
 assert.equal(registered.length,30);assert.equal(registered.every(l=>l.published===false),true);
 assert.equal(registered.find(l=>l.id===first.id).explanation,first.explanation);
 assert.equal(registered.some(l=>l._template||l.teacherGuide&&l.id!==first.id),false);
 const writes=await page.evaluate(()=>window.__firebase.writes.length);await page.locator('#importFoundations').click();
 await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('全教材が登録済み'));
 assert.equal(await page.evaluate(()=>window.__firebase.writes.length),writes);
 const studentDraft=await openStudio(t,{startAtHome:true,extraLessons:registered});
 await studentDraft.locator('[data-course=web][data-level="1"]').click();assert.equal(await studentDraft.locator('[data-id^="web1-"]').count(),0);
 await page.locator('#publishFoundations').click();await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('公開処理が完了'));
 const published=await page.evaluate(()=>Object.values(window.__firebase.data.lessons).filter(l=>l.id.startsWith('web1-')));
 assert.equal(published.every(l=>l.published===true),true);assert.equal(published.find(l=>l.id===first.id).title,first.title);
 const student=await openStudio(t,{startAtHome:true,extraLessons:published});
 for(let level=1;level<=5;level++){await student.locator('[data-course=web][data-level="'+level+'"]').click();assert.equal(await student.locator('[data-id^="web1-"]').count(),6);await student.locator('#home').click();}
 await student.locator('[data-course=web][data-level="1"]').click();await student.locator('[data-id="'+first.id+'"]').click();
 assert.equal(await student.locator('.lesson-text').first().textContent(),first.explanation);
});

test('Failed course registration shows an error and can be retried without duplicate or partial overwrite',async t=>{
 const page=await openStudio(t,{role:'teacher',startAtHome:true,failWrites:true});page.on('dialog',d=>d.accept());
 await page.locator('#manage').click();await page.locator('#importFoundations').click();await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('完了できませんでした'));
 assert.equal(await page.evaluate(()=>Object.keys(window.__firebase.data.lessons).filter(id=>id.startsWith('web1-')).length),0);
 await page.evaluate(()=>window.__firebase.failWrites=false);await page.locator('#importFoundations').click();await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('登録処理が完了'));
 assert.equal(await page.evaluate(()=>Object.keys(window.__firebase.data.lessons).filter(id=>id.startsWith('web1-')).length),30);
});

test('Course assignment is retained; students without Web access do not see course or roadmap controls',async t=>{
 const page=await openStudio(t,{startAtHome:true,courseAccess:['python']});
 assert.equal(await page.locator('[data-course=web]').count(),0);assert.equal(await page.locator('[data-web-roadmap]').count(),0);
 assert.equal(await page.locator('[data-course=python]').count(),5);assert.equal(await page.locator('#importFoundations').count(),0);
});

test('Student saves a new course work, submits reflection and downloads a playable page with persistent best score',async t=>{
 const course=await courseData(),lesson={...course.lessons.find(l=>l.id==='web1-l5-lesson02'),published:true};
 const page=await openStudio(t,{startAtHome:true,extraLessons:[lesson]});await openCourseLesson(page,lesson);
 await page.locator('#webHtmlEditor').fill(lesson.starterHtml.replace('星を集める</button>','作品の星を集める</button>'));
 await page.locator('#webRun').click();await page.locator('#webSave').click();await page.waitForFunction(()=>document.querySelector('#webSaveState').textContent==='Firebaseに保存済み');
 const saved=await page.evaluate(id=>window.__firebase.data.web_workspaces['student-uid__'+id],lesson.id);
 assert.ok(saved.html.includes('作品の星を集める'));assert.equal(saved.missions,undefined);
 assert.ok((await page.locator('#webFeedback').textContent()).includes('学習内容を保存しました。'));
 const response='最高得点は端末保存、学習コードはクラウド保存です。プレビューでは最高得点を永続保存できなくてもゲームが動くことを確認しました。';
 await page.locator('[data-course-check]').click();
 await page.locator('#submitTest textarea').fill(response);await page.locator('#submitTest button').click();await page.waitForFunction(()=>document.querySelector('#submitMsg').textContent.includes('先生の採点'));
 assert.equal(await page.evaluate(()=>window.__firebase.data.submissions['test-created'].response),response);
 await page.locator('[data-course-practice]').click();
 const downloadPromise=page.waitForEvent('download');await page.locator('#webDownload').click();const download=await downloadPromise;
 assert.equal(download.suggestedFilename(),'index.html');const html=await fs.readFile(await download.path(),'utf8');assert.ok(html.includes(lesson.starterJs));
 const exported=await page.context().newPage();t.after(()=>exported.close());
 await exported.route(base+'/exported-game.html',r=>r.fulfill({contentType:'text/html',body:html}));await exported.goto(base+'/exported-game.html');
 for(let i=0;i<5;i++)await exported.locator('#collect').click();assert.equal(await exported.locator('#best').textContent(),'5');
 await exported.reload();assert.equal(await exported.locator('#best').textContent(),'5');
 await exported.locator('#collect').click();assert.equal(await exported.locator('#best').textContent(),'5');
 await page.locator('#home').click();await openCourseLesson(page,lesson);assert.ok((await page.locator('#webHtmlEditor').inputValue()).includes('作品の星を集める'));
});


test('Bulk course publication skips unregistered templates and teacher-authored multiple-choice changes',async t=>{
 const course=await courseData(),text={...course.lessons[0],published:false},choice={...course.lessons[1],options:['A','B','C','D'],published:false};
 const page=await openStudio(t,{role:'teacher',startAtHome:true,extraLessons:[text,choice]});page.on('dialog',d=>d.accept());
 await page.locator('#manage').click();await page.locator('#publishFoundations').click();await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('公開処理が完了'));
 const state=await page.evaluate(()=>window.__firebase.data.lessons);
 assert.equal(state[text.id].published,true);assert.equal(state[choice.id].published,false);
 assert.equal(Object.keys(state).filter(id=>id.startsWith('web1-')).length,2);
});

for(const mobile of [false,true])test(`All thirty illustrated workbooks load five pages with images and matching checks (${mobile?'mobile':'desktop'})`,async t=>{
 const page=await openStudio(t,{role:'teacher',mobile,startAtHome:true});
 const course=await courseData();
 for(const lesson of course.lessons){
  await page.locator('#home').click();await page.locator(`[data-course=web][data-level="${lesson.level}"]`).click();await page.locator(`[data-id="${lesson.id}"]`).click();
  await page.locator('#coursePageSelect').waitFor();assert.equal(await page.locator('#webCourseEditorWindow').isVisible(),false);
  for(let n=1;n<=5;n++){
   await page.locator('#coursePageSelect').selectOption(String(n));
   await page.waitForFunction(()=>[...document.querySelectorAll('#courseVisualPage img')].every(i=>i.complete&&i.naturalWidth>0));
   assert.equal(await page.locator('#coursePageCount').textContent(),`${n} / 5`);
   assert.ok((await page.locator('#courseVisualCheck').textContent()).includes(`教材 ${n}ページに対応`));
   assert.equal(await page.locator('#lsFinalSubmission').isVisible(),n===5);
   if(n!==4)assert.ok(await page.locator('#courseVisualPage img').count()>0,lesson.id+' page '+n+' has visual material');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,lesson.id+' page '+n+' fits');
  }
  if(Number(lesson.id.slice(-2))===1){
   await page.locator('#coursePageSelect').selectOption('2');
   await page.waitForFunction(()=>document.querySelector('#courseVisualPage img')?.complete&&document.querySelector('#courseVisualPage img').naturalWidth>0);
   await page.evaluate(()=>window.scrollTo(0,document.querySelector('#webVisualWorkbook').getBoundingClientRect().top+scrollY-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ls-header-height'))));
   await page.screenshot({path:`/tmp/illustrated-web-level${lesson.level}-${mobile?'mobile':'desktop'}.png`});
  }
 }
});

for(const mobile of [false,true])test(`Course floating editor preserves draft and running game across page, move, resize and help (${mobile?'mobile':'desktop'})`,async t=>{
 const course=await courseData(),lesson={...course.lessons[0],published:true};
 const page=await openStudio(t,{mobile,startAtHome:true,extraLessons:[lesson]});const frame=await openCourseLesson(page,lesson);
 const win=page.locator('#webCourseEditorWindow');assert.equal(await win.isVisible(),true);
 const code=lesson.starterHtml+'\n<!-- 入力途中の作品 -->';await page.locator('#webHtmlEditor').fill(code);await page.locator('#webRun').click();
 await frame.locator('#collect').click();await frame.locator('#collect').click();assert.equal(await frame.locator('#score').textContent(),'2');
 const before=await win.boundingBox(),bar=await win.locator('[data-window-move]').boundingBox();
 if(mobile){
  const cdp=await page.context().newCDPSession(page);
  const drag=async(x,y,dx,dy)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  await drag(bar.x+50,bar.y+20,0,-40);
  const handle=await win.locator('[data-window-resize]').boundingBox();await drag(handle.x+18,handle.y+15,-18,-30);
 }else{
  await page.mouse.move(bar.x+70,bar.y+20);await page.mouse.down();await page.mouse.move(bar.x-30,bar.y-30,{steps:5});await page.mouse.up();
  await win.locator('[data-window-resize]').focus();await page.keyboard.press('ArrowLeft');
 }
 const moved=await win.boundingBox();assert.ok(moved.y<before.y||moved.x<before.x);assert.ok(moved.width<before.width);
 await win.locator('[data-window-minimize]').click();await page.locator('#coursePageSelect').selectOption('3');
 await page.locator('#courseImageZoom').selectOption('200');
 assert.equal(await page.locator('.course-image-viewport').evaluate(e=>e.scrollWidth>e.clientWidth),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('#webCourseEditorOpen').click();assert.equal(await page.locator('#webHtmlEditor').inputValue(),code);assert.equal(await frame.locator('#score').textContent(),'2');
 await page.locator('#lsHelp').click();await page.locator('#lsHelpClose').click();await page.waitForFunction(()=>document.activeElement===document.querySelector('#lsHelp'));assert.equal(await frame.locator('#score').textContent(),'2');
 if(mobile)await win.locator('[data-window-minimize]').click();else{await win.locator('[data-window-move]').focus();await page.keyboard.press('Escape');}
 assert.equal(await win.isVisible(),false);await page.locator('#webCourseEditorOpen').click();
 assert.equal(await page.locator('#webHtmlEditor').inputValue(),code);
 for(const size of mobile?[{width:320,height:568},{width:844,height:390},{width:375,height:360}]:[{width:1280,height:720}]){
  await page.setViewportSize(size);await settleLayout(page);const rect=await win.boundingBox(),header=await page.locator('#lsHeader').boundingBox();
  assert.ok(rect.x>=0&&rect.x+rect.width<=size.width+1);assert.ok(rect.y>=header.y+header.height);assert.ok(rect.y+rect.height<=size.height+1);
 }
 await page.screenshot({path:`/tmp/illustrated-web-floating-${mobile?'mobile':'desktop'}.png`});
 await page.locator('#webSave').click();await page.waitForFunction(()=>document.querySelector('#webSaveState').textContent==='Firebaseに保存済み');
 await win.locator('[data-window-minimize]').click();await page.locator('#home').click();assert.equal(await page.locator('#webCourseEditorWindow').count(),0);assert.equal(await page.locator('.course-visual-nav').count(),0);
 await openCourseLesson(page,lesson);assert.equal(await page.locator('#webHtmlEditor').inputValue(),code);
});

test('Teaching SVG text fits its canvas and all changed examples remain valid runnable source',async t=>{
 const course=await courseData(),plans=JSON.parse(await fs.readFile(path.join(root,'assets/web-course-visuals.json'),'utf8'));
 const context=await browser.newContext();t.after(()=>context.close());const svgPage=await context.newPage();
 for(const lesson of course.lessons){
  const change=plans[lesson.id].change,key={HTML:'starterHtml',CSS:'starterCss',JavaScript:'starterJs'}[change.language];
  assert.ok(lesson[key].includes(change.before),lesson.id+' snippet matches starter');
  if(key==='starterJs')assert.doesNotThrow(()=>new Function(lesson[key].replace(change.before,change.after)),lesson.id+' changed JS parses');
  for(const suffix of ['diagram','code']){
   await svgPage.goto(`${base}/assets/web-course-visuals/${lesson.id}-${suffix}.svg`);
   const outside=await svgPage.evaluate(async()=>{await document.fonts.ready;const s=document.documentElement.viewBox.baseVal;return [...document.querySelectorAll('text')].map(t=>({text:t.textContent,box:t.getBBox()})).filter(({box:b})=>b.x<0||b.y<0||b.x+b.width>s.width+1||b.y+b.height>s.height+1).map(t=>t.text);});
   assert.deepEqual(outside,[],lesson.id+' '+suffix+' has no clipped text');
  }
 }
});

test('Illustrated code changes produce the pictured outcomes across five levels',async t=>{
 const page=await openStudio(t,{role:'teacher',startAtHome:true}),course=await courseData(),plans=JSON.parse(await fs.readFile(path.join(root,'assets/web-course-visuals.json'),'utf8'));
 for(const id of ['web1-l1-lesson03','web1-l2-lesson01','web1-l3-lesson01','web1-l4-lesson03','web1-l5-lesson01']){
  const lesson=course.lessons.find(l=>l.id===id),change=plans[id].change,frame=await openCourseLesson(page,lesson);
  const lang={HTML:'html',CSS:'css',JavaScript:'js'}[change.language];await page.locator(`[data-lang=${lang}]`).click();
  const field=page.locator({html:'#webHtmlEditor',css:'#webCssEditor',js:'#webJsEditor'}[lang]);await field.fill((await field.inputValue()).replace(change.before,change.after));await page.locator('#webRun').click();
  if(lesson.level===1){for(let i=0;i<3;i++)await frame.locator('#collect').click();assert.equal(await frame.locator('#score').textContent(),'3');assert.equal(await frame.locator('#collect').isDisabled(),true);}
  if(lesson.level===1){
   await page.setViewportSize({width:1680,height:1000});await page.locator('#coursePageSelect').selectOption('3');await page.locator('[data-window-reset]').click();
   await page.locator('[data-window-resize]').focus();for(let i=0;i<10;i++)await page.keyboard.press('ArrowLeft');for(let i=0;i<8;i++)await page.keyboard.press('ArrowDown');
   await page.locator('[data-window-move]').focus();for(let i=0;i<10;i++)await page.keyboard.press('ArrowRight');
   await page.waitForFunction(()=>document.querySelector('#courseVisualPage img')?.complete&&document.querySelector('#courseVisualPage img').naturalWidth>0);
   await page.evaluate(()=>window.scrollTo(0,document.querySelector('#webVisualWorkbook').getBoundingClientRect().top+scrollY-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ls-header-height'))));
   await page.locator('#webJsEditor').evaluate(el=>el.scrollTop=0);
   await page.screenshot({path:'/tmp/illustrated-web-course-review.png'});assert.equal(await frame.locator('#score').textContent(),'3');
   await page.setViewportSize({width:1440,height:1000});
  }
  if(lesson.level===2)assert.equal(await frame.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 249, 232)');
  if(lesson.level===3){for(let i=0;i<4;i++)await frame.locator('#collect').click();assert.equal(await frame.locator('#score').textContent(),'12');assert.equal(await frame.locator('#collect').isDisabled(),true);}
  if(lesson.level===4){for(let i=0;i<3;i++)await frame.locator('[data-move=right]').click();await frame.locator('[data-move=down]').click();assert.equal(await frame.locator('#score').textContent(),'1');}
  if(lesson.level===5){for(let i=0;i<4;i++)await frame.locator('#collect').click();assert.equal(await frame.locator('#score').textContent(),'8');assert.equal(await frame.locator('#collect').isDisabled(),true);}
 }
});

test('Illustrated lesson prints five image-rich pages including the current teacher question',async t=>{
 const course=await courseData(),lesson={...course.lessons[0],published:true,question:'先生が設定した作品の確認問題です。'};
 const page=await openStudio(t,{startAtHome:true,extraLessons:[lesson]});await openCourseLesson(page,lesson);await page.locator('[data-window-minimize]').click();
 await page.evaluate(()=>window.print=()=>{});await page.locator('#coursePrint').click();await page.waitForSelector('#coursePrintPages',{state:'attached'});
 await page.waitForFunction(()=>[...document.querySelectorAll('#coursePrintPages img')].every(i=>i.complete&&i.naturalWidth>0));
 assert.equal(await page.locator('#coursePrintPages .course-print-page').count(),5);assert.ok((await page.locator('#coursePrintPages').textContent()).includes(lesson.question));
 const pdf=await page.pdf({path:'/tmp/illustrated-web-workbook.pdf',format:'A4',printBackground:true});const {PDFDocument}=require('pdf-lib');
 assert.equal((await PDFDocument.load(pdf)).getPageCount(),5);
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));assert.equal(await page.locator('#coursePrintPages').count(),0);
});

test('Every illustrated lesson exports exactly five complete printable pages',async t=>{
 const course=await courseData(),page=await openStudio(t,{role:'teacher',startAtHome:true});
 await page.evaluate(()=>window.print=()=>{});const {PDFDocument}=require('pdf-lib');
 for(const lesson of course.lessons){
  await openCourseLesson(page,lesson);await page.locator('[data-window-minimize]').click();await page.locator('#coursePrint').click();
  await page.waitForFunction(()=>document.querySelector('#coursePrintPages')&&[...document.querySelectorAll('#coursePrintPages img')].every(i=>i.complete&&i.naturalWidth>0));
  const options={format:'A4',printBackground:true};if(lesson.id.endsWith('06'))options.path=`/tmp/illustrated-web-level${lesson.level}-workbook.pdf`;
  const pdf=await page.pdf(options);assert.equal((await PDFDocument.load(pdf)).getPageCount(),5,lesson.id+' prints five pages');
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 }
});

async function assertCourseNavigationSync(page,lesson,n,{visible=true}={}){
 await page.waitForFunction(({id,n})=>{const book=document.getElementById('webVisualWorkbook');return book?.dataset.lessonId===id&&book.dataset.page===String(n);},{id:lesson.id,n});
 assert.equal(await page.locator('main h1').textContent(),lesson.title);
 assert.equal(await page.locator('#courseNavLesson').textContent(),`LEVEL${lesson.level} ${lesson.title}`);
 assert.equal(await page.locator('#coursePageCount').textContent(),`${n} / 5`);
 assert.equal(await page.locator('#courseBottomPageCount').textContent(),`教材内 ${n} / 5ページ`);
 assert.equal(await page.locator('#coursePageSelect').inputValue(),String(n));
 assert.ok((await page.locator('#courseCurrentPage').textContent()).includes(lesson.title));
 assert.ok((await page.locator('#courseCurrentPage').textContent()).includes(`教材内 ${n}ページ`));
 assert.equal(await page.locator('#courseVisualPage h2').textContent(),await page.locator('.course-check-theme').textContent());
 assert.equal(await page.locator('#lsFinalSubmission').isVisible(),n===5);
 await page.waitForFunction(()=>document.querySelector('#courseVisualPage')?.getAttribute('aria-busy')==='false');
 if(n!==4){
  await page.waitForFunction(()=>[...document.querySelectorAll('#courseVisualPage img')].every(i=>i.complete&&i.naturalWidth>0));
  const suffix={1:'preview.png',2:'diagram.svg',3:'code.svg',5:'preview.png'}[n];
  assert.ok((await page.locator('#courseVisualPage img').first().getAttribute('src')).includes(lesson.id+'-'+suffix));
 }
 assert.equal(await page.locator('.lesson-text').first().textContent(),lesson.explanation);
 if(visible){
  await page.waitForFunction(()=>{const y=document.querySelector('#courseCurrentPage').getBoundingClientRect().top,h=document.querySelector('#lsHeader').getBoundingClientRect().bottom;return y>=h-1&&y<h+110;});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.ok((await page.locator('#courseVisualPage h2').boundingBox()).y<page.viewportSize().height);
 }
}

for(const mobile of [false,true])test(`Top and bottom page arrows and next-lesson buttons synchronize all thirty lessons (${mobile?'mobile':'desktop'})`,async t=>{
 const course=await courseData(),published=course.lessons.map(l=>({...l,published:true}));
 const page=await openStudio(t,{mobile,startAtHome:true,extraLessons:published});
 await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${published[0].id}"]`).click();
 for(let i=0;i<published.length;i++){
  const lesson=published[i];await assertCourseNavigationSync(page,lesson,1,{visible:i>0});
  for(let n=2;n<=5;n++){
   await page.locator(n%2===0?'#coursePageNext':'#courseBottomNext').click();await assertCourseNavigationSync(page,lesson,n);
   if(n===2&&lesson.id==='web1-l1-lesson03')await page.screenshot({path:`/tmp/web-navigation-sync-${mobile?'mobile':'desktop'}.png`});
  }
  for(let n=4;n>=1;n--){await page.locator(n%2===0?'#courseBottomPrev':'#coursePagePrev').click();await assertCourseNavigationSync(page,lesson,n);}
  if(i<published.length-1){
   // A prior visit must not turn an explicit next-lesson action into a jump to page 5.
   await page.evaluate(id=>sessionStorage.setItem('learning-studio-visual-page:student-uid:'+id,'5'),published[i+1].id);
   await page.locator(`[data-open-lesson="${published[i+1].id}"]`).click();
  }
 }
});

for(const mobile of [false,true])test(`Next lesson always starts at page one and Back restores the previous page (${mobile?'mobile':'desktop'})`,async t=>{
 const course=await courseData(),a={...course.lessons[2],published:true},b={...course.lessons[3],published:true};
 const page=await openStudio(t,{mobile,startAtHome:true,extraLessons:[a,b]});
 await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${a.id}"]`).click();
 await page.locator('#coursePageNext').click();await page.locator('#coursePageNext').click();await assertCourseNavigationSync(page,a,3);
 await page.evaluate(id=>sessionStorage.setItem('learning-studio-visual-page:student-uid:'+id,'5'),b.id);
 await page.locator(`[data-open-lesson="${b.id}"]`).click();await assertCourseNavigationSync(page,b,1);
 await page.locator('#coursePageSelect').selectOption('4');await assertCourseNavigationSync(page,b,4);
 await page.locator('#lsPageBack').click();await assertCourseNavigationSync(page,a,3);
 await page.reload();await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${a.id}"]`).click();await assertCourseNavigationSync(page,a,3);
});

test('Late images from an old page cannot overwrite the current lesson or explanation',async t=>{
 const course=await courseData(),a={...course.lessons[2],published:true},b={...course.lessons[3],published:true};
 const page=await openStudio(t,{startAtHome:true,extraLessons:[a,b]});
 let release,started;const gate=new Promise(r=>release=r),requested=new Promise(r=>started=r);
 await page.route('**/web1-l1-lesson03-code.svg*',async route=>{started();await gate;try{await route.fulfill({contentType:'image/svg+xml',body:await fs.readFile(path.join(root,'assets/web-course-visuals/web1-l1-lesson03-code.svg'))});}catch{/* Chromium may cancel an image no longer in the document. */}});
 t.after(()=>release());
 await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${a.id}"]`).click();
 await page.locator('#coursePageNext').click();await page.locator('#coursePageNext').click();await requested;
 assert.ok((await page.locator('#coursePageLoadStatus').textContent()).includes('3ページ'));
 await page.locator('#coursePageNext').click();await page.locator('#coursePageNext').click();await page.locator(`[data-open-lesson="${b.id}"]`).click();
 await assertCourseNavigationSync(page,b,1);release();
 await page.locator('#coursePageNext').click();await assertCourseNavigationSync(page,b,2);
 assert.equal(await page.locator('#coursePageLoadStatus').textContent(),'');
 assert.ok(!(await page.locator('#courseCurrentPage').textContent()).includes(a.title));
});

test('Page changes keep an unfinished answer, and cancelling a lesson change keeps every panel in sync',async t=>{
 const course=await courseData(),a={...course.lessons[2],published:true},b={...course.lessons[3],published:true};
 const page=await openStudio(t,{startAtHome:true,extraLessons:[a,b]});
 await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${a.id}"]`).click();await page.locator('#coursePageSelect').selectOption('5');
 await page.locator('#submitTest textarea').fill('まだ提出していない振り返り');
 await page.locator('#coursePagePrev').click();await assertCourseNavigationSync(page,a,4);
 await page.locator('#coursePageNext').click();await assertCourseNavigationSync(page,a,5);assert.equal(await page.locator('#submitTest textarea').inputValue(),'まだ提出していない振り返り');
 page.once('dialog',d=>d.dismiss());await page.locator(`[data-open-lesson="${b.id}"]`).click();await assertCourseNavigationSync(page,a,5,{visible:false});
 assert.equal(await page.locator('#submitTest textarea').inputValue(),'まだ提出していない振り返り');
 page.once('dialog',d=>d.accept());await page.locator(`[data-open-lesson="${b.id}"]`).click();await assertCourseNavigationSync(page,b,1);
});

test('All thirty completion previews have lossless high-resolution pixels for enlarged reading',async()=>{
 const course=await courseData(),manifest=JSON.parse(await fs.readFile(path.join(root,'assets/web-visual-manifest.json'),'utf8'));
 for(const lesson of course.lessons){
  const bytes=await fs.readFile(path.join(root,'assets/web-course-visuals',lesson.id+'-preview.png'));
  assert.deepEqual(bytes.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]),lesson.id+' is a real PNG');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),meta=manifest[lesson.id];
  assert.ok(width>=2400,lesson.id+' has enough source pixels for desktop and 200% zoom');
  assert.equal(width,meta.pixelWidth);assert.equal(height,meta.pixelHeight);
  assert.ok(Math.abs(width-meta.width*4)<=4&&Math.abs(height-meta.height*4)<=4,lesson.id+' is captured at four device pixels per CSS pixel');
 }
});

for(const mobile of [false,true])test(`Explicit previous and next page labels fit and work at narrow and wide sizes (${mobile?'mobile':'desktop'})`,async t=>{
 const course=await courseData(),lesson=course.lessons[0],page=await openStudio(t,{role:'teacher',mobile,startAtHome:true});
 await page.locator('[data-course=web][data-level="1"]').click();await page.locator(`[data-id="${lesson.id}"]`).click();
 const sizes=mobile?[{width:375,height:812},{width:320,height:812},{width:812,height:375}]:[{width:1440,height:1000},{width:768,height:1000}];
 for(const size of sizes){
  await page.setViewportSize(size);await page.locator('#coursePageSelect').selectOption('1');
  await page.waitForFunction(()=>document.querySelector('#courseVisualPage')?.getAttribute('aria-busy')==='false');
  for(const [id,label] of [['coursePagePrev','前のページ'],['coursePageNext','次のページ'],['courseBottomPrev','前のページ'],['courseBottomNext','次のページ']]){
   const button=page.locator('#'+id),direction=button.locator('.course-page-direction');
   assert.ok((await direction.textContent()).includes(label));assert.equal(await direction.isVisible(),true);
   const bounds=await button.boundingBox();assert.ok(bounds.height>=44,id+' is a touch-sized button');
   assert.equal(await direction.evaluate(el=>el.scrollWidth<=el.clientWidth),true,id+' label fits without clipping');
   if(id.startsWith('coursePage'))assert.ok(bounds.x>=0&&bounds.x+bounds.width<=size.width,id+' is inside the screen');
  }
  assert.equal(await page.locator('#coursePagePrev').isDisabled(),true);
  if(mobile)await page.locator('#coursePageNext').tap();else{await page.locator('#coursePageNext').focus();await page.keyboard.press('Enter');}
  await assertCourseNavigationSync(page,lesson,2);
  await page.locator('#courseBottomPrev').click();await assertCourseNavigationSync(page,lesson,1);
  await page.locator('#courseBottomNext').click();await assertCourseNavigationSync(page,lesson,2);
  assert.ok((await page.locator('#courseBottomNext small').textContent()).includes('3. この部分を変えてみよう'));
  await page.locator('#coursePagePrev').click();await assertCourseNavigationSync(page,lesson,1);
  const image=page.locator('#courseVisualPage img');
  assert.ok(await image.evaluate(img=>img.naturalWidth>=2400));
  await page.locator('#courseImageZoom').selectOption('200');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'200% enlargement stays in the image scroll area');
  await page.locator('#courseImageZoom').selectOption('100');
  await page.screenshot({path:`/tmp/web-page-controls-${mobile?'mobile':'desktop'}-${size.width}.png`});
  await page.locator('#coursePageSelect').selectOption('5');
  assert.equal(await page.locator('#coursePageNext').isDisabled(),true);assert.equal(await page.locator('#courseBottomNext').isDisabled(),true);
  assert.ok((await page.locator('#courseBottomNext').textContent()).includes('次のページ'));
 }
});
