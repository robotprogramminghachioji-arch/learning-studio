import {mountWebWorkspace} from './web-workspace.js';
import {initializeApp,deleteApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,updatePassword} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,doc,getDoc,getDocs,collection,query,where,setDoc,updateDoc,addDoc,deleteDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const cfg=window.LEARNING_STUDIO_FIREBASE||{},appEl=document.getElementById('app'),userbar=document.getElementById('userbar');
const courses={scratch:'Scratch',python:'Python',minecraft:'Minecraft Education',roblox:'Roblox Studio',robot:'ロボット・電子工作',ai:'AIリテラシー',web:'Web開発（HTML・CSS・JavaScript）'};
const icons={scratch:'🧩',python:'🐍',minecraft:'⛏️',roblox:'🎮',robot:'🤖',ai:'🧠',web:'🌐'};
const tools={scratch:'https://scratch.mit.edu/projects/editor/',python:'https://www.python.org/',minecraft:'https://education.minecraft.net/',roblox:'https://create.roblox.com/docs/studio',robot:'https://www.makeblock.com/',ai:'https://www.soumu.go.jp/',web:'https://developer.mozilla.org/ja/docs/Learn_web_development'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg=(s,error=false)=>`<div class="message ${error?'error':''}">${esc(s)}</div>`;
const sidOK=s=>/^[a-z0-9_-]{4,24}$/.test(s);
const hashId=async s=>{let d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('learning-studio-id-v1:'+s));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const list=async c=>(await getDocs(collection(db,c))).docs.map(x=>({id:x.id,...x.data()}));
const uidEmail=()=>`ls-${crypto.randomUUID()}@students.example.com`;
const safeImage=s=>{try{let u=new URL(s,location.href);return u.protocol==='https:'&&(!s.startsWith('http')||u.origin===location.origin)?u.href:''}catch{return ''}};
const safePdf=s=>{try{if(!s||!/^assets\/pdfs\/[a-zA-Z0-9_./-]+\.pdf$/.test(s)||s.includes('..'))return '';let u=new URL(s,location.href);return u.origin===location.origin?u.href:''}catch{return ''}};
const videoId=s=>{try{let u=new URL(s);if(u.hostname==='youtu.be')return /^[\w-]{11}$/.test(u.pathname.slice(1))?u.pathname.slice(1):'';if(['www.youtube.com','youtube.com','www.youtube-nocookie.com'].includes(u.hostname)){let v=u.searchParams.get('v')||u.pathname.match(/^\/embed\/([\w-]{11})$/)?.[1];return /^[\w-]{11}$/.test(v||'')?v:''}}catch{}return ''};
let db,auth,me=null,teacher=false,student=null,lessons=[],submissions=[],students=[],keys={},autoKeys={},view='home',selected=null,tab='lessons';

// Learning Studio: in-app navigation and a confirmation before mobile browser Back.
const screenHistory=[];
let currentScreen={kind:'home'};
let browserExitApproved=false;
const browserGuard={learningStudioBackGuard:1};

function unsavedWork(){
  const form=appEl.querySelector('form[data-ls-dirty="true"]');
  const saveState=appEl.querySelector('#webSaveState')?.textContent||'';
  return !!form || saveState.includes('未保存') || saveState.includes('保存中');
}

function showScreen(screen){
  currentScreen={...screen};
  if(screen.kind==='level'){
    view='level';
    levelScreen(screen.course,screen.level);
  }else if(screen.kind==='lesson'){
    const lesson=lessons.find(item=>item.id===screen.lessonId);
    if(!lesson){view='home';currentScreen={kind:'home'};render();}
    else{selected=lesson;view='lesson';render();}
  }else if(screen.kind==='password'){
    view='password';passwordScreen();
  }else{
    view=screen.kind==='manage'?'manage':'home';
    if(view==='manage')tab=screen.tab||'lessons';
    render();
  }
  window.scrollTo({top:0,behavior:'instant'});
}
function sameScreen(a,b){
  return a.kind===b.kind && a.course===b.course && a.level===b.level &&
    a.lessonId===b.lessonId && a.tab===b.tab;
}
function moveTo(screen){
  if(!me)return;
  if(sameScreen(currentScreen,screen))return; // Keep unsaved forms visible when the same tab is tapped.
  if(unsavedWork()&&!window.confirm('まだ保存していない入力内容があります。保存せずに画面を移動しますか？'))return;
  screenHistory.push({...currentScreen});
  showScreen(screen);
}
function backWithinStudio(){
  if(screenHistory.length){showScreen(screenHistory.pop());return;}
  if(currentScreen.kind!=='home'){showScreen({kind:'home'});return;}
  openBrowserBackDialog();
}
function openBrowserBackDialog(){
  const dialog=document.getElementById('lsBackDialog');
  if(!dialog || !dialog.hidden)return;
  const leaving=screenHistory.length===0 && currentScreen.kind==='home';
  document.getElementById('lsBackTitle').textContent=leaving?'Learning Studioを終了しますか？':'前の画面に戻りますか？';
  document.getElementById('lsBackDescription').textContent=unsavedWork()
    ?'入力途中の内容があります。保存していない内容は消えることがあります。続ける場合は、まず保存してください。'
    :leaving?'このページから移動します。学習を続ける場合は「この画面にとどまる」を選んでください。'
      :'前の画面に移動します。学習中の場合は保存したことを確認してください。';
  document.getElementById('lsBackProceed').textContent=leaving?'サイトを離れる':'前の画面へ戻る';
  dialog.hidden=false;
  document.getElementById('lsBackStay').focus();
}
function closeBrowserBackDialog(){
  const dialog=document.getElementById('lsBackDialog');
  if(dialog)dialog.hidden=true;
}
function initializeNavigation(){
  // This history entry gives popstate a chance to show a confirmation on mobile.
  // Browser/OS gestures still have the final say; they cannot be blocked in every environment.
  history.pushState(browserGuard,'',location.href);
  window.addEventListener('popstate',()=>{
    if(browserExitApproved)return;
    history.pushState(browserGuard,'',location.href);
    openBrowserBackDialog();
  });
  document.getElementById('lsBackStay')?.addEventListener('click',closeBrowserBackDialog);
  document.getElementById('lsBackProceed')?.addEventListener('click',()=>{
    const leaving=screenHistory.length===0 && currentScreen.kind==='home';
    closeBrowserBackDialog();
    if(leaving){browserExitApproved=true;history.go(-2);}
    else backWithinStudio();
  });
  document.getElementById('lsBackDialog')?.addEventListener('click',event=>{
    if(event.target.id==='lsBackDialog')closeBrowserBackDialog();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && document.getElementById('lsBackDialog')?.hidden===false){
      event.preventDefault();closeBrowserBackDialog();
    }
  });
  appEl.addEventListener('input',event=>{
    const form=event.target.closest('#editorForm,#addStudent,#courseForm,#gradeForm,#submitTest,#pw');
    if(form)form.dataset.lsDirty='true';
  });
  appEl.addEventListener('change',event=>{
    const form=event.target.closest('#editorForm,#addStudent,#courseForm,#gradeForm,#submitTest,#pw');
    if(form)form.dataset.lsDirty='true';
  });
  const up=document.getElementById('lsToTop');
  if(up){
    up.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
    const toggle=()=>{up.hidden=window.scrollY<260;};
    window.addEventListener('scroll',toggle,{passive:true});toggle();
  }
}
initializeNavigation();

const configured=cfg.apiKey&&!cfg.apiKey.startsWith('YOUR_')&&cfg.projectId&&!cfg.projectId.startsWith('YOUR_');
if(!configured){appEl.innerHTML='<section class="panel"><h1>Firebase設定が必要です</h1><p>config.js を設定してください。README.md に手順があります。</p></section>'}else{let a=initializeApp(cfg);auth=getAuth(a);db=getFirestore(a);onAuthStateChanged(auth,async u=>{me=u;try{await refresh()}catch(e){console.error(e);appEl.innerHTML=msg('読み込みに失敗しました：'+e.message,true)}})}
async function refresh(){screenHistory.length=0;currentScreen={kind:'home'};view='home';selected=null;closeBrowserBackDialog();teacher=false;student=null;lessons=[];submissions=[];students=[];keys={};autoKeys={};if(!me){userbar.innerHTML='';return login()};const t=await getDoc(doc(db,'teachers',me.uid));teacher=t.exists()&&t.data().enabled===true;
 if(teacher){students=await list('students');lessons=await list('lessons');submissions=await list('submissions');let k=await list('answer_keys');keys=Object.fromEntries(k.map(x=>[x.id,x]));}
 else{const sid=localStorage.getItem('ls_student_id');if(!sid){return noProfile()};const p=await getDoc(doc(db,'students',sid));if(!p.exists()||p.data().activeUid!==me.uid||p.data().enabled!==true)return noProfile();const accessSnap=await getDoc(doc(db,'student_access',me.uid));
  if(!accessSnap.exists() || accessSnap.data().studentId!==sid || accessSnap.data().enabled!==true)return noProfile();
  const allowedCourses=(accessSnap.data().allowedCourses||[]).filter(x=>Object.prototype.hasOwnProperty.call(courses,x));
  student={id:sid,...p.data(),allowedCourses};
  const lessonQueries=await Promise.all(allowedCourses.map(course=>getDocs(query(collection(db,'lessons'),where('published','==',true),where('course','==',course)))));
  lessons=lessonQueries.flatMap(snap=>snap.docs.map(x=>({id:x.id,...x.data()})));
  submissions=(await getDocs(query(collection(db,'submissions'),where('studentId','==',sid)))).docs.map(x=>({id:x.id,...x.data()}));}
 userbar.innerHTML=`<div class="row"><span>${esc(teacher?'先生':student.displayName)}</span><button id="logout" class="ghost small">ログアウト</button></div>`;document.getElementById('logout').onclick=()=>signOut(auth);render();}
function noProfile(){userbar.innerHTML='<button id="logout" class="ghost small">ログアウト</button>';document.getElementById('logout').onclick=()=>signOut(auth);appEl.innerHTML='<section class="panel"><h2>有効な生徒情報がありません</h2><p>先生に生徒IDとアカウントの状態を確認してください。</p></section>'}
function login(){appEl.innerHTML=`<section class="panel auth"><h1>Learning Studioにログイン</h1><form id="login"><label>区分<select name="kind"><option value="student">生徒</option><option value="teacher">先生</option></select></label><label>生徒ID（先生はメールアドレス）<input name="identifier" required autocomplete="username"></label><label>パスワード<input type="password" name="password" required autocomplete="current-password"></label><button>ログイン</button></form><div id="notice"></div></section>`;document.getElementById('login').onsubmit=async e=>{e.preventDefault();let f=new FormData(e.target),id=String(f.get('identifier')).trim().toLowerCase(),email=id,out=document.getElementById('notice');out.textContent='確認中…';try{if(f.get('kind')==='student'){if(!sidOK(id))throw Error('ID形式が違います');let lookup=await getDoc(doc(db,'login_lookup',await hashId(id)));if(!lookup.exists())throw Error('認証できません');email=lookup.data().email;localStorage.setItem('ls_student_id',id)}else localStorage.removeItem('ls_student_id');await signInWithEmailAndPassword(auth,email,String(f.get('password')))}catch(err){out.innerHTML=msg('ログインエラー: '+(err.code || 'unknown'),true)}}}
function nav(){return `<div class="tabs ls-main-nav"><button class="ghost" id="home">🏠 ホーム</button>${teacher?'<button class="ghost" id="manage">🧑‍🏫 先生用管理</button>':''}<button class="ghost" id="password">🔐 パスワード変更</button></div><div class="ls-page-controls"><button class="ghost" type="button" id="lsPageBack" ${currentScreen.kind==='home'&&screenHistory.length===0?'hidden':''}>← 前の画面に戻る</button><button class="ghost" type="button" id="lsPageTop">↑ ページ上部へ</button></div>`}
function wireNav(){
 document.getElementById('home').onclick=()=>moveTo({kind:'home'});
 if(teacher)document.getElementById('manage').onclick=()=>moveTo({kind:'manage',tab:'lessons'});
 document.getElementById('password').onclick=()=>moveTo({kind:'password'});
 document.getElementById('lsPageBack').onclick=()=>{
   if(unsavedWork()){openBrowserBackDialog();return;}
   backWithinStudio();
 };
 document.getElementById('lsPageTop').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
}
function render(){if(view==='manage'&&!teacher)view='home';if(view==='manage')return manage();if(view==='lesson'&&selected)return lessonScreen(selected);home()}
function home(){let h=`${nav()}<section class="panel"><h1>${teacher?'教材プレビュー':'こんにちは、'+esc(student.displayName)+'さん！'}</h1><p class="muted">教材を読む → 実際に練習する → テストを提出する</p></section><div class="grid">`;for(let [key,name] of Object.entries(courses)){if(!teacher&&!student.allowedCourses.includes(key))continue;h+=`<article class="course"><div class="icon">${icons[key]}</div><h3>${name}</h3><p class="muted tiny">レベル1〜5</p><div class="level-grid">`;for(let lv=1;lv<=5;lv++){let count=lessons.filter(l=>l.course===key&&Number(l.level)===lv).length;h+=`<button data-course="${key}" data-level="${lv}" ${count?'':'disabled'}>Lv.${lv}</button>`}h+='</div></article>'}h+='</div>';appEl.innerHTML=h;wireNav();appEl.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>moveTo({kind:'level',course:b.dataset.course,level:Number(b.dataset.level)}))}
function levelScreen(course,level){let arr=lessons.filter(x=>x.course===course&&Number(x.level)===level).sort((a,b)=>(a.order||0)-(b.order||0));appEl.innerHTML=`${nav()}<section class="panel"><h1>${esc(courses[course])} / レベル${level}</h1><p>学習する教材を選んでください。</p><div class="lesson-list">${arr.map(x=>`<button class="ghost lesson-tile" data-id="${esc(x.id)}">${esc(x.title)} <span class="meta">${x.published?'公開中':'先生プレビュー'}</span></button>`).join('')}</div></section>`;wireNav();appEl.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>moveTo({kind:'lesson',lessonId:b.dataset.id}))}
function lessonScreen(l){let img=safeImage(l.imageUrl),vid=videoId(l.videoUrl),pdf=safePdf(l.pdfUrl),mine=submissions.filter(s=>s.lessonId===l.id&&(!student||s.studentId===student.id));appEl.innerHTML=`${nav()}<section class="panel"><span class="pill">${esc(courses[l.course])} / レベル${l.level}</span><h1>${esc(l.title)}</h1><p>${esc(l.goal)}</p></section><section class="panel"><h2>STEP 1｜解説を読もう</h2><div class="lesson-text">${esc(l.explanation)}</div>${img?`<figure><img class="lesson-image" src="${esc(img)}" alt="${esc(l.imageCaption||'操作画面')}"><figcaption>${esc(l.imageCaption||'')}</figcaption></figure>`:'<div class="notice">実際の操作画面画像はまだ登録されていません。</div>'}${vid?`<iframe class="media-frame" loading="lazy" title="動画教材" src="https://www.youtube-nocookie.com/embed/${vid}" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`:''}</section><section class="panel"><h2>STEP 2｜練習してみよう</h2><div class="lesson-text">${esc(l.practice)}</div><p><a class="btn ghost" href="${tools[l.course]}" target="_blank" rel="noopener noreferrer">公式ツールを開く</a></p></section>${pdf?`<section class="panel"><h2>📄 印刷用PDF教材</h2><p>授業で使うテキストを閲覧・印刷できます。</p><div class="actions"><a class="btn ghost" href="${esc(pdf)}" target="_blank" rel="noopener noreferrer">PDFを別タブで開く・印刷する</a></div><details><summary>この画面でPDFを表示</summary><iframe class="pdf-frame" src="${esc(pdf)}" title="印刷用PDF教材" loading="lazy"></iframe></details><p class="muted tiny">印刷はPDFを別タブで開き、印刷アイコンまたはCtrl＋Pを使用してください。</p></section>`:''}${l.course==='web'?`<section class="panel"><h2>🧑‍💻 Web開発エディターとプレビュー</h2><p class="muted">HTML・CSS・JavaScriptを入力し、結果を確かめましょう。生徒のコードとミッション達成状況をFirebaseへ保存できます。</p><div id="webWorkspace"></div></section>`:''}<section class="panel"><h2>STEP 3｜確認問題</h2><p>${esc(l.question||'学習したことを説明してください。')}</p>${(l.options||[]).length?`<form id="submitTest"><div class="question">${l.options.map((o,i)=>`<label><input type="radio" name="answer" value="${i}" required>${esc(o)}</label>`).join('')}</div><button>回答を提出する</button></form>`:`<form id="submitTest"><label>回答<textarea name="answer" maxlength="4000" required></textarea></label><button>回答を提出する</button></form>`}<div id="submitMsg"></div><p class="muted tiny">4択問題はその場で自動採点します。正解情報はブラウザに送られるため、教室内の練習・確認用です。記述式・制作課題は先生が採点します。</p></section><section class="panel"><h2>提出履歴</h2>${mine.length?mine.map(s=>`<p>${s.kind==='test'?'テスト':'練習'}：${['graded','self_graded'].includes(s.status)?`${Number(s.score)}点 ／ ${esc(s.feedback||'')}${s.status==='self_graded'?'（自己採点）':''}`:'採点待ち'}</p>`).join(''):'<p>まだ提出はありません。</p>'}</section>`;wireNav();if(l.course==='web')mountWebWorkspace({container:document.getElementById('webWorkspace'),lesson:l,db,student,uid:me.uid}).catch(err=>{document.getElementById('webWorkspace').innerHTML=msg('Webエディターを読み込めません: '+err.message,true)});let form=document.getElementById('submitTest');form.onsubmit=async e=>{e.preventDefault();if(!student){document.getElementById('submitMsg').innerHTML=msg('先生プレビューでは提出できません。');return}let f=new FormData(form),response=String(f.get('answer')??'');try{let payload={studentId:student.id,lessonId:l.id,response,kind:'test',status:'pending',createdAt:serverTimestamp()};let feedback='回答を保存しました。先生の採点をお待ちください。';if((l.options||[]).length===4){const k=await getDoc(doc(db,'auto_keys',l.id));if(k.exists()&&Number.isInteger(k.data().correct)){let ok=Number(response)===k.data().correct;payload.status='self_graded';payload.score=ok?100:0;payload.feedback=ok?'正解です！ '+String(k.data().explanation||''):'不正解です。教材を復習して再挑戦しましょう。 '+String(k.data().explanation||'');feedback=`${ok?'正解！':'不正解'} ${payload.score}点。${payload.feedback}（自己採点・参考記録）`;}}await addDoc(collection(db,'submissions'),payload);document.getElementById('submitMsg').innerHTML=msg(feedback);form.reset();submissions= (await getDocs(query(collection(db,'submissions'),where('studentId','==',student.id)))).docs.map(x=>({id:x.id,...x.data()}))}catch(err){document.getElementById('submitMsg').innerHTML=msg(err.message,true)}}}
function passwordScreen(){appEl.innerHTML=`${nav()}<section class="panel auth"><h2>パスワード変更</h2><form id="pw"><label>新しいパスワード（12文字以上）<input name="pw" type="password" minlength="12" required></label><button>変更</button></form><div id="out"></div></section>`;wireNav();document.getElementById('pw').onsubmit=async e=>{e.preventDefault();try{await updatePassword(auth,new FormData(e.target).get('pw'));document.getElementById('out').innerHTML=msg('変更しました')}catch(err){document.getElementById('out').innerHTML=msg(err.message,true)}}}
function manage(){appEl.innerHTML=`${nav()}<section class="panel"><h1>先生用管理画面</h1><div class="tabs"><button id="tabLessons" class="ghost">教材・問題管理</button><button id="tabStudents" class="ghost">生徒管理</button><button id="tabGrades" class="ghost">提出・採点・CSV</button></div><div id="teacherBody"></div></section>`;wireNav();document.getElementById('tabLessons').onclick=()=>moveTo({kind:'manage',tab:'lessons'});document.getElementById('tabStudents').onclick=()=>moveTo({kind:'manage',tab:'students'});document.getElementById('tabGrades').onclick=()=>moveTo({kind:'manage',tab:'grades'});teacherBody()}
function teacherBody(){
 const tabs={lessons:'tabLessons',students:'tabStudents',grades:'tabGrades'};
 for(const [name,id] of Object.entries(tabs))document.getElementById(id)?.classList.toggle('active-tab',tab===name);
 if(tab==='lessons')return lessonManage();if(tab==='students')return studentManage();grades();
}
function lessonManage(){let el=document.getElementById('teacherBody');el.innerHTML=`<h2>教材一覧</h2><p class="muted">文章・課題・問題はFirestoreに保存します。画像はGitHubのimagesフォルダへ置き、相対パスを指定してください。</p><div class="actions"><button id="newLesson">新規作成</button><button id="seed" class="ghost">初期教材30件を登録</button><button id="importWeb" class="ghost">HTML第1回教材を登録</button></div><div id="notice"></div><div class="tablewrap"><table><thead><tr><th>コース</th><th>レベル</th><th>順序</th><th>教材</th><th>公開</th><th>操作</th></tr></thead><tbody>${[...lessons].sort((a,b)=>a.course.localeCompare(b.course)||a.level-b.level||(a.order||0)-(b.order||0)).map(l=>`<tr><td>${esc(courses[l.course])}</td><td>${l.level}</td><td>${l.order||0}</td><td>${esc(l.title)}</td><td>${l.published?'公開':'非公開'}</td><td><button class="ghost small" data-edit="${esc(l.id)}">編集</button> <button class="danger small" data-del="${esc(l.id)}">削除</button></td></tr>`).join('')}</tbody></table></div><div id="editor"></div>`;document.getElementById('newLesson').onclick=()=>editLesson();el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editLesson(lessons.find(l=>l.id===b.dataset.edit)));el.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{let id=b.dataset.del;if(!confirm('教材と正解データを削除しますか？過去の提出履歴は残ります。'))return;try{await deleteDoc(doc(db,'lessons',id));await deleteDoc(doc(db,'answer_keys',id));await deleteDoc(doc(db,'auto_keys',id));lessons=await list('lessons');delete keys[id];lessonManage()}catch(e){alert(e.message)}});document.getElementById('seed').onclick=async()=>{if(!confirm('初期教材を未公開で登録しますか？'))return;let out=document.getElementById('notice');out.textContent='登録中…';try{let data=await (await fetch('assets/seed-lessons.json')).json(),n=0;for(let x of data){if(lessons.some(l=>l.id===x.id))continue;let pub={id:x.id,course:x.course,level:x.level,order:10,title:x.title,goal:x.goal,explanation:x.explanation,practice:x.practice,question:x.question,options:x.options||[],imageUrl:'',imageCaption:'',videoUrl:'',published:false};await setDoc(doc(db,'lessons',x.id),pub);await setDoc(doc(db,'answer_keys',x.id),{correct:x.correct,answerExplanation:x.answerExplanation||'',hint:x.hint||''});n++}lessons=await list('lessons');keys=Object.fromEntries((await list('answer_keys')).map(k=>[k.id,k]));lessonManage();document.getElementById('notice').innerHTML=msg(n+'件を追加しました')}catch(e){out.innerHTML=msg(e.message,true)}}}
function editLesson(l=null){
 document.getElementById('notice').after(document.getElementById('editor'));
 requestAnimationFrame(()=>document.getElementById('editor')?.scrollIntoView({behavior:'smooth',block:'start'}));
 let v=l||{course:'scratch',level:1,order:10,title:'',goal:'',explanation:'',practice:'',question:'',options:[],imageUrl:'',imageCaption:'',videoUrl:'',pdfUrl:'',starterHtml:'',starterCss:'',starterJs:'',published:false},key=keys[l?.id]||{};document.getElementById('editor').innerHTML=`<section class="panel"><h2>${l?'教材編集':'教材新規作成'}</h2><form id="editorForm"><div class="two"><label>コース<select name="course">${Object.entries(courses).map(([id,n])=>`<option value="${id}" ${v.course===id?'selected':''}>${n}</option>`).join('')}</select></label><label>レベル<select name="level">${[1,2,3,4,5].map(i=>`<option value="${i}" ${Number(v.level)===i?'selected':''}>${i}</option>`).join('')}</select></label></div><label>並び順（小さい順）<input type="number" name="order" min="0" max="9999" value="${Number(v.order||10)}"></label>${[['title','タイトル'],['goal','到達目標'],['explanation','学習解説'],['practice','実践課題'],['question','確認問題'],['imageUrl','操作画面の画像パス（例：images/scratch-editor.png）'],['imageCaption','画像の説明'],['videoUrl','YouTube動画URL'],['pdfUrl','PDF教材パス（例：assets/pdfs/html_lesson01.pdf）'],['starterHtml','Web演習HTML初期コード'],['starterCss','Web演習CSS初期コード'],['starterJs','Web演習JavaScript初期コード']].map(([k,label])=>`<label>${label}${['explanation','practice','question','starterHtml','starterCss','starterJs'].includes(k)?`<textarea name="${k}">${esc(v[k])}</textarea>`:`<input name="${k}" value="${esc(v[k])}">`}</label>`).join('')}<h3>選択問題（空欄なら記述式）</h3>${[0,1,2,3].map(i=>`<label>選択肢${i+1}<input name="opt${i}" value="${esc(v.options?.[i]||'')}"></label>`).join('')}<label>正解の番号（選択問題）<select name="correct">${[0,1,2,3].map(i=>`<option value="${i}" ${Number(key.correct||0)===i?'selected':''}>${i+1}</option>`).join('')}</select></label><label>正解・採点基準（先生専用）<textarea name="answerExplanation">${esc(key.answerExplanation||'')}</textarea></label><label>先生用ヒント（非公開）<textarea name="hint">${esc(key.hint||'')}</textarea></label><label class="inlinecheck"><input type="checkbox" name="published" ${v.published?'checked':''}>内容確認済み・公開する</label><div class="form-actions"><button>保存</button><button class="ghost" type="button" id="cancel">閉じる</button></div></form><div id="saveMsg"></div></section>`;document.getElementById('cancel').onclick=()=>document.getElementById('editor').innerHTML='';document.getElementById('editorForm').onsubmit=async e=>{e.preventDefault();let f=new FormData(e.target),id=l?.id||crypto.randomUUID(),options=[0,1,2,3].map(i=>String(f.get('opt'+i)).trim()).filter(Boolean),imageUrl=String(f.get('imageUrl')).trim(),videoUrl=String(f.get('videoUrl')).trim();if(imageUrl&&!safeImage(imageUrl)){document.getElementById('saveMsg').innerHTML=msg('画像は同じGitHub Pagesサイトの相対パス、または同一オリジンのHTTPS URLにしてください。',true);return}if(videoUrl&&!videoId(videoUrl)){document.getElementById('saveMsg').innerHTML=msg('YouTube動画のURLを確認してください。',true);return}
let pdfUrl=String(f.get('pdfUrl')||'').trim();
if(pdfUrl&&!safePdf(pdfUrl)){document.getElementById('saveMsg').innerHTML=msg('PDFはassets/pdfs/内の半角英数字ファイル名を指定してください。',true);return}if(options.length!==0&&options.length!==4){document.getElementById('saveMsg').innerHTML=msg('選択肢は4つすべて入力するか、すべて空欄にしてください。',true);return}let pub={id,course:f.get('course'),level:Number(f.get('level')),order:Number(f.get('order')),title:String(f.get('title')),goal:String(f.get('goal')),explanation:String(f.get('explanation')),practice:String(f.get('practice')),question:String(f.get('question')),options,imageUrl,imageCaption:String(f.get('imageCaption')),videoUrl,pdfUrl,starterHtml:String(f.get('starterHtml')||''),starterCss:String(f.get('starterCss')||''),starterJs:String(f.get('starterJs')||''),published:f.has('published')};try{await setDoc(doc(db,'lessons',id),pub);await setDoc(doc(db,'answer_keys',id),{correct:Number(f.get('correct')),answerExplanation:String(f.get('answerExplanation')),hint:String(f.get('hint'))});if(options.length===4&&pub.published){await setDoc(doc(db,'auto_keys',id),{correct:Number(f.get('correct')),explanation:String(f.get('answerExplanation')).slice(0,500)});}else{await deleteDoc(doc(db,'auto_keys',id));}lessons=await list('lessons');keys=Object.fromEntries((await list('answer_keys')).map(k=>[k.id,k]));lessonManage();document.getElementById('notice').innerHTML=msg('教材と先生専用の正解を保存しました。')}catch(err){document.getElementById('saveMsg').innerHTML=msg(err.message,true)}}}
// Course permissions are stored in student_access/{firebaseAuthUid}.
// Only teachers can set or change them; students can read their own assignment.
const courseEntries=Object.entries(courses);
const courseChoices=(selected=[])=>courseEntries.map(([id,name])=>
  `<label class="course-choice"><input type="checkbox" name="courseAccess" value="${esc(id)}" ${selected.includes(id)?'checked':''}><span>${esc(name)}</span></label>`).join('');
const courseValues=form=>[...form.querySelectorAll('input[name="courseAccess"]:checked')].map(x=>x.value);

async function provision(sid,name,pw,reset=false,allowedCourses=[]){
 if(!sidOK(sid)||pw.length<12)throw Error('IDは英小文字・数字・_-の4〜24文字、パスワードは12文字以上にしてください。');
 if(!reset&&students.some(x=>x.id===sid))throw Error('同じIDがあります');
 const oldStudent=reset?students.find(x=>x.id===sid):null;
 let secondary=initializeApp(cfg,'provision-'+crypto.randomUUID()),secondaryAuth=getAuth(secondary),email=uidEmail();
 try{
  let cred=await createUserWithEmailAndPassword(secondaryAuth,email,pw);
  await setDoc(doc(db,'students',sid),{displayName:name,activeUid:cred.user.uid,enabled:true,updatedAt:serverTimestamp()},{merge:true});
  await setDoc(doc(db,'student_access',cred.user.uid),{studentId:sid,enabled:true,allowedCourses});
  await setDoc(doc(db,'login_lookup',await hashId(sid)),{email});
  if(oldStudent?.activeUid && oldStudent.activeUid!==cred.user.uid){
   await deleteDoc(doc(db,'student_access',oldStudent.activeUid)).catch(e=>console.warn('Old assignment clean-up:',e));
  }
  await signOut(secondaryAuth);
 }finally{await deleteApp(secondary).catch(()=>{})}
}

function studentManage(){
 const el=document.getElementById('teacherBody');
 el.innerHTML=`<h2>生徒アカウント</h2>
   <form id="addStudent">
    <div class="two"><label>生徒ID<input name="sid" required pattern="[a-z0-9_-]{4,24}"></label>
     <label>表示名<input name="name" required maxlength="60"></label>
     <label>初期パスワード（12文字以上）<input type="password" name="pw" required minlength="12"></label></div>
    <fieldset class="course-access-fieldset"><legend>受講するコース（生徒に表示するコース）</legend>
      <div class="course-choice-grid">${courseChoices(Object.keys(courses))}</div>
    </fieldset>
    <button>生徒登録</button>
   </form>
   <div id="studentMsg"></div><div id="studentCourseEditor"></div>
   <div class="tablewrap"><table><thead><tr><th>生徒ID</th><th>表示名</th><th>有効</th><th>操作</th></tr></thead>
   <tbody>${students.map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.displayName)}</td><td>${x.enabled?'有効':'停止'}</td><td>
    <button class="ghost small" data-courses="${esc(x.id)}">コース設定</button>
    <button class="ghost small" data-reset="${esc(x.id)}">認証再発行</button>
    <button class="ghost small" data-toggle="${esc(x.id)}">${x.enabled?'停止':'再開'}</button></td></tr>`).join('')}</tbody></table></div>
   <p class="notice tiny">既存生徒は「コース設定」で一度保存してください。再発行後、古いAuthユーザーはFirebase Consoleで削除してください。</p>`;
 document.getElementById('addStudent').onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.target),out=document.getElementById('studentMsg');out.textContent='登録中…';
  try{
   await provision(String(f.get('sid')).trim().toLowerCase(),String(f.get('name')),String(f.get('pw')),false,courseValues(e.target));
   students=await list('students');studentManage();document.getElementById('studentMsg').innerHTML=msg('生徒を登録しました');
  }catch(err){out.innerHTML=msg('登録に失敗しました：'+err.message,true)}
 };
 el.querySelectorAll('[data-courses]').forEach(b=>b.onclick=async()=>{
  const s=students.find(x=>x.id===b.dataset.courses),editor=document.getElementById('studentCourseEditor');
  if(!s?.activeUid){editor.innerHTML=msg('生徒の認証情報が見つかりません。',true);return}
  editor.innerHTML='<p>コース情報を読み込み中…</p>';
  try{
   const snap=await getDoc(doc(db,'student_access',s.activeUid));
   const selected=snap.exists()?(snap.data().allowedCourses||[]):[];
   editor.innerHTML=`<section class="panel"><h3>${esc(s.displayName)}さんの受講コース</h3>
    <p class="muted tiny">チェックしたコースだけが生徒の画面に表示され、Firebaseでも閲覧を許可されます。</p>
    <form id="courseForm"><fieldset class="course-access-fieldset"><legend>表示するコースを選択</legend>
      <div class="course-choice-grid">${courseChoices(selected)}</div></fieldset>
      <div class="actions"><button>設定を保存</button><button type="button" id="closeCourseForm" class="ghost">閉じる</button></div></form>
      <div id="courseSaveStatus"></div></section>`;
   editor.scrollIntoView({behavior:'smooth',block:'start'});
   document.getElementById('closeCourseForm').onclick=()=>editor.innerHTML='';
   document.getElementById('courseForm').onsubmit=async ev=>{
    ev.preventDefault();const out=document.getElementById('courseSaveStatus');out.textContent='保存中…';
    try{
     await setDoc(doc(db,'student_access',s.activeUid),{studentId:s.id,enabled:true,allowedCourses:courseValues(ev.target)});
     out.innerHTML=msg('受講コースを保存しました。生徒は再読み込みすると反映されます。');
    }catch(err){out.innerHTML=msg('保存に失敗しました：'+err.message,true)}
   };
  }catch(err){editor.innerHTML=msg('コース設定を読み込めません：'+err.message,true)}
 });
 el.querySelectorAll('[data-reset]').forEach(b=>b.onclick=async()=>{
  const s=students.find(x=>x.id===b.dataset.reset),pw=prompt('新しいパスワード（12文字以上）');
  if(!pw||!confirm('古い認証を失効させ、新しいアカウントを作成しますか？'))return;
  try{
   const snap=await getDoc(doc(db,'student_access',s.activeUid));
   const assigned=snap.exists()?snap.data().allowedCourses||[]:[];
   await provision(s.id,s.displayName,pw,true,assigned);
   students=await list('students');studentManage();alert('再発行しました。古いAuthユーザーをFirebase Consoleから削除してください。');
  }catch(err){alert('認証再発行に失敗しました：'+err.message)}
 });
 el.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=async()=>{
  const s=students.find(x=>x.id===b.dataset.toggle);
  try{
   await updateDoc(doc(db,'students',s.id),{enabled:!s.enabled});
   students=await list('students');studentManage();
  }catch(err){alert('変更に失敗しました：'+err.message)}
 });
}
function csvCell(x){let s=String(x??'');return '"'+(/^[=+\-@\t\r]/.test(s)?"'":'')+s.replaceAll('"','""')+'"'}
function csv(name,rows){let blob=new Blob(['\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function grades(){queueMicrotask(()=>loadWebWorkspaces());let el=document.getElementById('teacherBody'),sorted=[...submissions].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));el.innerHTML=`<h2>提出履歴・採点</h2><div class="actions"><button id="csvSub">提出・成績CSV</button><button id="csvProgress" class="ghost">進捗CSV</button><button id="csvWeb" class="ghost">Web制作履歴CSV</button></div><div class="tablewrap"><table><thead><tr><th>生徒</th><th>教材</th><th>回答</th><th>状態</th><th>採点</th></tr></thead><tbody>${sorted.slice(0,200).map(s=>`<tr><td>${esc(s.studentId)}</td><td>${esc(lessons.find(l=>l.id===s.lessonId)?.title||s.lessonId)}</td><td>${esc(s.response)}</td><td>${['graded','self_graded'].includes(s.status)?esc(s.score)+'点'+(s.status==='self_graded'?'（自己）':''):'採点待ち'}</td><td><button class="ghost small" data-grade="${esc(s.id)}">採点</button></td></tr>`).join('')}</tbody></table></div><div id="gradeEditor"></div><div id="webWorkspaceSummary" class="section-item"><h3>Web制作の学習履歴</h3><p class="muted tiny">読み込み中…</p></div>`;el.querySelectorAll('[data-grade]').forEach(b=>b.onclick=()=>{let s=submissions.find(x=>x.id===b.dataset.grade),k=keys[s.lessonId]||{};document.getElementById('gradeEditor').innerHTML=`<section class="panel"><h3>採点：${esc(s.studentId)}</h3><p>回答：${esc(s.response)}</p><p>正解・採点基準：${esc(k.answerExplanation||'未設定')}</p>${k.correct!==undefined?`<p>正解選択肢：${Number(k.correct)+1}</p>`:''}<form id="gradeForm"><label>点数（0〜100）<input name="score" type="number" min="0" max="100" value="${Number(s.score||0)}" required></label><label>先生からのコメント<textarea name="feedback">${esc(s.feedback||'')}</textarea></label><button>採点を保存</button></form><div id="gradeMsg"></div></section>`;document.getElementById('gradeForm').onsubmit=async e=>{e.preventDefault();let f=new FormData(e.target),score=Number(f.get('score'));try{await updateDoc(doc(db,'submissions',s.id),{status:'graded',score,feedback:String(f.get('feedback')),gradedAt:serverTimestamp(),gradedBy:me.uid});s.status='graded';s.score=score;s.feedback=String(f.get('feedback'));let ref=doc(db,'progress',s.studentId),prev=await getDoc(ref),old=prev.exists()?prev.data().scores||{}:{};await setDoc(ref,{studentId:s.studentId,scores:{...old,[s.lessonId]:Math.max(score,old[s.lessonId]||0)},updatedAt:serverTimestamp()},{merge:true});grades()}catch(err){document.getElementById('gradeMsg').innerHTML=msg(err.message,true)}}});document.getElementById('csvSub').onclick=()=>csv('learning-studio-submissions.csv',[['生徒ID','教材ID','回答','状態','点数','コメント','提出日時'],...sorted.map(s=>[s.studentId,s.lessonId,s.response,s.status,s.score??'',s.feedback||'',s.createdAt?.toDate?.()?.toLocaleString('ja-JP')||''])]);document.getElementById('csvProgress').onclick=async()=>{try{let p=await list('progress');csv('learning-studio-progress.csv',[['生徒ID','教材ID','最高点'],...p.flatMap(x=>Object.entries(x.scores||{}).map(([lid,score])=>[x.studentId,lid,score]))])}catch(e){alert(e.message)}}}


// The bundled Web lesson is imported as a DRAFT, never published without teacher approval.
document.addEventListener('click',async event=>{
 if(!event.target.closest('#importWeb'))return;
 if(!teacher)return;
 if(!confirm('添付のHTML第1回教材を非公開で登録しますか？'))return;
 const out=document.getElementById('notice');
 if(out)out.textContent='Web教材を登録中…';
 try{
  const items=await (await fetch('assets/web-lesson01.json',{cache:'no-store'})).json();
  let n=0;
  for(const entry of items){
   if(lessons.some(l=>l.id===entry.id))continue;
   const {correct,answerExplanation,hint,...rest}=entry;
   await setDoc(doc(db,'lessons',entry.id),{...rest,published:false});
   await setDoc(doc(db,'answer_keys',entry.id),{correct,answerExplanation,hint});
   n++;
  }
  lessons=await list('lessons');keys=Object.fromEntries((await list('answer_keys')).map(k=>[k.id,k]));
  lessonManage();
  document.getElementById('notice').innerHTML=msg(n?`${n}件のHTML教材を非公開で登録しました。`:'登録済みのため追加はありません。');
 }catch(err){if(out)out.innerHTML=msg('教材登録に失敗しました: '+err.message,true)}
});


async function loadWebWorkspaces(){
 if(!teacher)return;
 const target=document.getElementById('webWorkspaceSummary');
 if(!target)return;
 try{
  const workspaces=await list('web_workspaces');
  if(!target.isConnected)return;
  const rows=[...workspaces].sort((a,b)=>(b.updatedAt?.seconds||0)-(a.updatedAt?.seconds||0));
  target.innerHTML='<h3>Web制作の学習履歴</h3>'+(rows.length
   ?`<div class="tablewrap"><table><thead><tr><th>生徒ID</th><th>教材ID</th><th>ミッション達成</th><th>保存日時</th></tr></thead><tbody>${rows.map(w=>`<tr><td>${esc(w.studentId)}</td><td>${esc(w.lessonId)}</td><td>${Number(w.missions)||0}/3</td><td>${esc(w.updatedAt?.toDate?.()?.toLocaleString('ja-JP')||'')}</td></tr>`).join('')}</tbody></table></div>`
   :'<p class="muted">まだWeb制作の保存履歴はありません。</p>');
  const btn=document.getElementById('csvWeb');
  if(btn)btn.onclick=()=>csv('learning-studio-web-progress.csv',[
    ['生徒ID','教材ID','ミッション達成','完了','更新日時'],
    ...rows.map(w=>[w.studentId,w.lessonId,w.missions||0,w.completed?'はい':'いいえ',w.updatedAt?.toDate?.()?.toLocaleString('ja-JP')||''])
  ]);
 }catch(e){if(target.isConnected)target.innerHTML='<h3>Web制作の学習履歴</h3>'+msg('履歴を取得できません: '+e.message,true)}
}
