import {assetUrl} from './asset-versions.js?v=78ddd5e723c8';
import {pageKey,requiredTask,pageRequirementsMet,learningState,unlockedThrough,pageStatus,mergeHistory} from './html-level1-progress.js?v=6870227eeca4';
import {mountFloatingEditor} from './floating-editor.js?v=5b7434c51c8f';
import {mountPageNavigation} from './page-navigation.js?v=067885ce2b97';
import {doc,getDoc,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

import {DEFAULT_WORKBOOK} from './workbook-defaults.js?v=95ab371178ef';
import {validateWorkbook,questionKey} from './workbook-model.js?v=1fbf7052033a';
import {mountWorkbookEditor} from './workbook-editor.js?v=924b6b49d287';
import {renderDocumentPage,downloadWorkbookPdf} from './workbook-pdf.js?v=08a6bf7ca8ef';

const escapeHtml = s => String(s??'').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pad = n => String(n).padStart(2,'0');
function codeCheck(which,code){
  const html=String(code||'');
  const parsed=new DOMParser().parseFromString(html,'text/html');
  const sel=s=>parsed.querySelector(s);
  const text=s=>(sel(s)?.textContent||'').trim();
  switch(which){
    case 'doctype':return /^\s*<!doctype\s+html\s*>/i.test(html);
    case 'html':return /<html\b[^>]*\blang\s*=\s*["']ja["'][^>]*>/i.test(html)&&/<\/html\s*>/i.test(html);
    case 'head':return /<head\b[^>]*>/i.test(html)&&/<\/head\s*>/i.test(html);
    case 'body':return /<body\b[^>]*>/i.test(html)&&/<\/body\s*>/i.test(html);
    case 'title':return Boolean(text('title'));
    case 'heading':return Boolean(text('h1'));
    case 'paragraph':return Boolean(text('p'));
    case 'h2':return Boolean(text('h2'));
    case 'list3':return parsed.querySelectorAll('ul > li').length>=3;
    case 'link':return [...parsed.querySelectorAll('a[href]')].some(a=>a.getAttribute('href')?.startsWith('https://'));
    case 'image':return [...parsed.querySelectorAll('img')].some(im=>im.getAttribute('src')&&im.getAttribute('alt'));
    case 'customHeading':return Boolean(text('h1'))&&!['こんにちは！','こんにちは',''].includes(text('h1'));
    case 'customParagraph':return Boolean(text('p'))&&!['HTMLを勉強中です。','わたしはHTMLを勉強しています。',''].includes(text('p'));
    default:return false;
  }
}

export async function mountHtmlLevel1Companion({container,lesson,pdfUrl,db,student,uid,mountWebWorkspace,students=[],onProgressChange=()=>{},onWorkbookLoaded=()=>{},isTeacher=false}){
  if(!container)return;
  let workbook=validateWorkbook(lesson.workbook||DEFAULT_WORKBOOK);
  let PAGES=workbook.pages;
  const isStudent=Boolean(student),maxPage=PAGES.length;
  const draftKey=`ls-html-level1-pages:${uid}:${lesson.id}`,syncKey=`${draftKey}:sync`;
  const workspaceRef=isStudent?doc(db,'web_workspaces',`${uid}__${lesson.id}`):null;
  let progress={},pending=false;
  try{
    progress=JSON.parse(localStorage.getItem(draftKey)||'{}')||{};
    const sync=JSON.parse(localStorage.getItem(syncKey)||'null');
    pending=sync?sync.pending===true:Object.keys(progress).length>0;
  }catch{progress={};}
  let state=learningState(progress,PAGES),page=state.currentPage,saveTimer=null,editorApi=null;
  let revision=0,remoteReady=!isStudent,reading=false,saving=false,navigated=false;
  progress._learning=state;state.visited[pageKey(page)]=true;
  const getRecord=()=>{
    const record=progress[pageKey(page)]||(progress[pageKey(page)]={});
    record.answers||={};record.results||={};return record;
  };
  const allowed=n=>!isStudent||n<=unlockedThrough(state);
  const persistLocal=()=>{
    try{localStorage.setItem(draftKey,JSON.stringify(progress));localStorage.setItem(syncKey,JSON.stringify({pending}));return true;}
    catch(err){console.warn('学習記録のローカル保存に失敗',err);return false;}
  };
  container.innerHTML=`<div class="hl1-heading"><h2>HTML入門 レベル1｜全12ページ</h2><p class="muted">左の教材ページを進めると、右の説明・問題が同じページに切り替わります。コードはフローティングエディターで実行できます。ウィンドウの見出しをドラッグすると移動できます。</p></div>
    <details class="hl1-directory"><summary>ページ一覧（全12ページ）</summary><div id="hl1PageList" class="hl1-page-list"></div><p class="muted tiny">学習済み・学習中・未学習・ロック中を表示します。必須を完了してチェックすると次のページに進めます。</p></details>
    ${!isStudent?`<details class="hl1-teacher-panel"><summary>先生用：生徒の学習進度を調整</summary><p class="muted small">全ページをプレビューできます。生徒の回答・コードを残したまま、学習済み扱いの範囲を変更します。</p><label>生徒<select id="hl1TeacherStudent"><option value="">生徒を選択</option>${students.filter(s=>s.activeUid).map(s=>`<option value="${escapeHtml(s.id)}">${escapeHtml(s.id)}：${escapeHtml(s.displayName)}</option>`).join('')}</select></label><button type="button" id="hl1TeacherLoad" class="ghost">進度を読み込む</button><label>学習済み扱いの範囲<select id="hl1TeacherThrough">${Array.from({length:13},(_,n)=>`<option value="${n}">${n===0?'未完了（第1ページから）':`第1〜${n}ページ${n>=11?'（テスト提出済み扱い）':''}`}</option>`).join('')}</select></label><button type="button" id="hl1TeacherApply" disabled>進度調整を保存</button><p id="hl1TeacherStatus" aria-live="polite"></p></details>`:''}
    <div class="hl1-mobile-switch" role="group" aria-label="スマートフォン用表示切り替え"><button type="button" data-show="pdf" class="hl1-selected">📖 教材</button><button type="button" data-show="practice" class="ghost">💻 実習・問題</button></div>
    <nav class="hl1-page-navigation" aria-label="HTML入門レベル1のページ送り"><div class="hl1-navigation-summary"><strong>HTML入門 レベル1｜全12ページ</strong><output id="hl1Number" aria-label="現在のページ" aria-live="polite">1 / 12</output></div><button type="button" id="hl1Prev" class="ghost" aria-label="前のページ"><span aria-hidden="true">←</span><span class="hl1-control-label"> 前のページ</span></button><select id="hl1PageSelect" aria-label="教材ページを選択">${PAGES.map((p,i)=>`<option value="${i+1}">${i+1}. ${escapeHtml(p.title)}</option>`).join('')}</select><button type="button" id="hl1Next" class="ghost" aria-label="次のページ"><span class="hl1-control-label">次へ </span><span aria-hidden="true">→</span></button><div class="hl1-overall"><progress id="hl1OverallProgress" max="12" value="0" aria-label="12ページ全体の学習進捗"></progress><span id="hl1OverallStatus"></span></div></nav>
    <div class="hl1-grid">
      <aside class="hl1-reader" aria-label="教材のページ">
        <div class="hl1-reader-bar"><strong>📘 HTML入門 レベル1</strong><span class="pill">全12ページ</span></div>
        <div class="hl1-zoom-controls"><label for="hl1Scale">表示倍率</label><select id="hl1Scale"><option value="50">50%</option><option value="75">75%</option><option value="90">90%</option><option value="100" selected>幅に合わせる（100%）</option><option value="125">125%</option><option value="150">150%</option><option value="200">200%</option></select><span class="muted tiny">拡大後は教材内をスクロールできます</span></div>
        <div id="hl1PageViewport" class="hl1-page-viewport" tabindex="0" role="region" aria-label="PDF教材（拡大時は縦横にスクロール）"><img id="hl1Image" src="${escapeHtml(assetUrl('assets/pdf-pages/html-level1-01.webp'))}" alt="HTML教材の1ページ目"><section id="hl1PageGuide" class="hl1-page-guide" aria-label="この教材ページで取り組むこと"></section></div>
        <p id="hl1PdfStatus" class="muted small" role="status"></p><div class="hl1-pdf-actions"><a class="btn ghost small" href="${escapeHtml(assetUrl(pdfUrl))}" target="_blank" rel="noopener noreferrer">原本PDFを開く・印刷</a></div>
        <p class="muted tiny">教材は枠内でスクロールできます。印刷するときは下のPDFボタンから保存して開いてください。</p>
      </aside>
      <div class="hl1-practice" tabindex="0" role="region" aria-label="このページのミッション・確認問題">
        <div class="hl1-page-info"><span class="pill" id="hl1Current">PDF 1ページ</span><h3 id="hl1SectionHeading">このページの学習・進捗チェック</h3><p class="hl1-theme">学習テーマ：<span id="hl1Title"></span></p><p id="hl1Intro"></p></div>
        <div class="hl1-exercises"><h3 id="hl1ExercisesHeading">✏️ このページのミッション・確認問題</h3><div id="hl1Questions"></div><div class="hl1-check-actions"><button type="button" id="hl1Check">✅ 回答とコードをチェック</button><button type="button" class="ghost" id="hl1Save">☁ このページを保存</button></div><div id="hl1Result" aria-live="polite"></div><p id="hl1GateStatus" class="hl1-gate-status" aria-live="polite"></p><div class="hl1-progress"><div id="hl1ProgressBar"></div></div><p class="muted small" id="hl1Progress"></p><p class="muted small" id="hl1AnswerStatus"></p><p class="muted small" id="hl1SaveStatus" aria-live="polite"></p></div>
      </div>
    </div>
    <button type="button" id="hl1EditorOpen" class="hl1-editor-open" aria-controls="hl1EditorWindow" aria-expanded="true">💻 エディターを表示</button>
    <section id="hl1EditorWindow" class="hl1-editor-window" aria-labelledby="hl1WindowTitle">
      <div class="hl1-window-bar" data-window-move tabindex="0" role="group" aria-label="エディターを移動（ドラッグまたは矢印キー）" aria-describedby="hl1WindowHelp">
        <strong id="hl1WindowTitle">💻 HTMLエディター</strong><div class="hl1-window-actions"><button type="button" class="ghost small" data-window-reset>位置を戻す</button><button type="button" class="ghost small" data-window-minimize aria-label="エディターを最小化">− 最小化</button></div>
      </div>
      <div class="hl1-window-content hl1-editor-area">
        <details class="muted tiny"><summary>ウィンドウの操作方法</summary><p id="hl1WindowHelp">見出しで移動、右下の ↘ でサイズ変更（矢印キーでも操作可）。Escで最小化。入力はそのまま残ります。</p></details>
        <p class="muted" id="hl1EditorHint"></p><div id="hl1SampleBox"><button type="button" id="hl1LoadSample" class="ghost">📋 このページの見本コードを読み込む</button><p class="muted tiny">入力済みのHTMLは確認後に上書きします。CSS・JavaScriptは残ります。</p></div><div id="webWorkspace"></div>
      </div>
      <button type="button" class="hl1-window-resize" data-window-resize aria-label="エディターのサイズを変更（ドラッグまたは矢印キー）">↘</button>
    </section>`;

  const navigation=container.querySelector('.hl1-page-navigation');
  // Page controls now live in the shared header, while exercises remain in the lesson.
  const $=selector=>container.querySelector(selector)||navigation.querySelector(selector);
  const setSaveStatus=text=>{$('#hl1SaveStatus').textContent=text;};
  const header=mountPageNavigation({container,navigation});
  const floatingEditor=mountFloatingEditor({container,windowEl:$('#hl1EditorWindow'),openButton:$('#hl1EditorOpen'),header});
  const mobileShow=panel=>{
    container.classList.toggle('hl1-mobile-practice',panel==='practice');
    container.querySelectorAll('[data-show]').forEach(b=>{
      b.classList.toggle('hl1-selected',b.dataset.show===panel);b.classList.toggle('ghost',b.dataset.show!==panel);
      b.setAttribute('aria-pressed',String(b.dataset.show===panel));
    });
  };
  container.querySelectorAll('[data-show]').forEach(b=>b.addEventListener('click',()=>mobileShow(b.dataset.show)));
  function updateOverview(){
    const done=PAGES.filter((_,i)=>pageStatus(state,i+1)==='学習済み').length;
    $('#hl1OverallProgress').value=done;
    $('#hl1OverallStatus').textContent=`学習済み ${done} / ${maxPage}ページ`;
    $('#hl1Number').textContent=`${page} / ${maxPage}`;
    for(const option of $('#hl1PageSelect').options){
      const n=Number(option.value),status=pageStatus(state,n);
      option.textContent=`${n}. ${PAGES[n-1].title}［${status}］`;option.disabled=!allowed(n);
    }
    $('#hl1PageSelect').value=String(page);
    $('#hl1Prev').disabled=page===1;
    $('#hl1Next').disabled=page===maxPage||(PAGES[page-1].mode!=='introduction'&&!allowed(page+1));
    $('#hl1PageList').innerHTML=PAGES.map((data,index)=>{
      const n=index+1,status=pageStatus(state,n);
      return `<button type="button" data-page="${n}" class="ghost hl1-page-item" data-state="${status}" ${!allowed(n)?'disabled':''} ${n===page?'aria-current="page"':''}><strong>${n}. ${escapeHtml(data.title)}</strong><span>${status}</span></button>`;
    }).join('');
    onProgressChange({testSubmitted:state.testSubmitted,completedPages:done,currentPage:page,unlockedThrough:unlockedThrough(state)});
  }
  function updateProgress(){
    const record=getRecord(),tasks=PAGES[page-1].tasks;
    if(PAGES[page-1].mode==='introduction'){
      $('#hl1ProgressBar').style.width=state.completed.p01?'100%':'0%';
      $('#hl1GateStatus').textContent='内容を確認したら「次へ」で2ページ目へ進みましょう。このページに確認問題はありません。';
      updateOverview();return;
    }
    const required=tasks.filter((task,i)=>requiredTask(task,page,i));
    const done=tasks.filter((task,i)=>requiredTask(task,page,i)&&record.results[questionKey(tasks[i],i)]===true).length;
    const answered=tasks.filter((task,i)=>{
      const answer=record.answers[questionKey(task,i)];
      return task.type==='choice'?Number.isInteger(Number(answer))&&answer!==undefined&&answer!==''&&Number(answer)>=0&&Number(answer)<task.options.length:
        task.type==='text'?String(answer||'').trim().length>=2:task.type==='check'?answer===true:record.results[questionKey(tasks[i],i)]===true;
    }).length;
    $('#hl1Progress').textContent=`必須ミッション達成 ${done} / ${required.length} ・ 任意 ${tasks.length-required.length}問`;
    $('#hl1AnswerStatus').textContent=`回答・確認済み ${answered} / ${tasks.length}項目${page===11&&state.testSubmitted?' ／ テスト提出済み':''}`;
    $('#hl1ProgressBar').style.width=`${Math.round(done/required.length*100)}%`;
    $('#hl1GateStatus').textContent=page===11?(state.testSubmitted?'テスト提出済みです。第12ページの振り返りに進めます。':'全10問に回答して「テストを提出する」を押してください。正誤にかかわらず提出後に第12ページを解放します。'):
      state.completed[pageKey(page)]?'このページは学習済みです。任意問題は後から取り組めます。':
      '「必須」を完了して「回答とコードをチェック」を押すと、次のページを解放します。任意問題は進級条件に含みません。';
    updateOverview();
  }
  function scheduleSave(){
    revision++;pending=true;state.updatedAt=Date.now();state.currentPage=page;progress._learning=state;
    const cached=persistLocal();setSaveStatus(cached?'変更があります（端末に保存済み）':'端末への保存に失敗しました。Firebaseへの保存を確認してください。');
    if(isStudent&&remoteReady){clearTimeout(saveTimer);saveTimer=setTimeout(()=>storeRemote(),1400);}
  }
  async function storeRemote(){
    clearTimeout(saveTimer);persistLocal();
    if(!isStudent){setSaveStatus('先生プレビュー（この端末に一時保存）');return;}
    if(!remoteReady){
      if(!reading)await loadHistory();
      if(!remoteReady){setSaveStatus('Firebase履歴を取得できていません。端末の回答を保持しています。読み込み後に再保存してください。');return;}
    }
    if(saving)return;
    const savedRevision=revision,payload=JSON.parse(JSON.stringify(progress));saving=true;
    // Only the teacher writes this immutable adjustment snapshot. A stale student
    // autosave must not replace a teacher's newer instruction.
    delete payload._learning.teacherAdjustment;
    try{
      setSaveStatus('進捗をFirebaseへ保存中…');
      await setDoc(workspaceRef,{ownerUid:uid,studentId:student.id,lessonId:lesson.id,pageWork:payload,pageWorkUpdatedAt:serverTimestamp()},{merge:true});
      if(savedRevision===revision){pending=false;persistLocal();setSaveStatus('回答・学習位置・解放状態を保存しました');}
      else setSaveStatus('新しい変更があります（端末に保存済み）');
    }catch(err){setSaveStatus(`Firebase保存に失敗しました（端末には保存済み）：${err.code||err.message}`);}
    finally{
      saving=false;
      if(container.isConnected&&savedRevision!==revision){clearTimeout(saveTimer);saveTimer=setTimeout(()=>storeRemote(),1400);}
    }
  }
  function renderTasks(){
    const entry=getRecord(),data=PAGES[page-1];
    if(data.mode==='introduction'){
      $('#hl1Questions').innerHTML=`<div class="hl1-introduction">${data.introSections.map(section=>`<section><h4>${escapeHtml(section.title)}</h4>${section.steps?`<ol class="hl1-learning-flow">${section.steps.map(step=>`<li><strong>${escapeHtml(step.term)}</strong>：${escapeHtml(step.description)}</li>`).join('')}</ol>`:''}<p class="workbook-text">${escapeHtml(section.body)}</p></section>`).join('')}</div>`;
      updateProgress();return;
    }
    $('#hl1Questions').innerHTML=data.tasks.map((task,i)=>{
      const saved=entry.answers[questionKey(task,i)]??'',status=entry.results[questionKey(task,i)],required=requiredTask(task,page,i);
      const badge=status===true?'<span class="hl1-good">✓ 達成</span>':status===false?'<span class="hl1-notyet">再確認</span>':'';
      let field='';
      if(task.type==='choice')field=`<div class="hl1-options">${task.options.map((opt,n)=>`<label><input type="radio" name="hl1q${i}" value="${n}" ${String(saved)===String(n)?'checked':''}>${escapeHtml(opt)}</label>`).join('')}</div>`;
      if(task.type==='check')field=`<label class="hl1-self"><input type="checkbox" data-index="${i}" ${saved===true?'checked':''}>できた！</label>`;
      if(task.type==='text')field=`<textarea data-index="${i}" rows="2" maxlength="220" aria-label="${escapeHtml(task.text)}" placeholder="${escapeHtml(task.hint||'自分の言葉で答えよう')}">${escapeHtml(saved)}</textarea>`;
      if(task.type==='code')field=`<p class="hl1-hint">コードのチェック項目：${escapeHtml(task.hint||'フローティングエディターで試そう')}</p>`;
      return `<article class="hl1-task" data-required="${required}" data-task="${i}"><div class="hl1-task-header"><strong><span class="hl1-task-kind">${required?'必須':'任意・応用'}</span> ${i+1}. ${escapeHtml(task.text)}</strong><span id="hl1Status${i}">${badge}</span></div>${field}<div class="hl1-why" id="hl1Why${i}" ${status!==true?'hidden':''}>${task.type==='choice'?escapeHtml(task.why):'確認しました。'}</div></article>`;
    }).join('');
    $('#hl1Questions').querySelectorAll('input,textarea').forEach(input=>{
      input.addEventListener(input.type==='radio'||input.type==='checkbox'?'change':'input',()=>{
        if(!allowed(page))return;
        const i=input.type==='radio'?Number(input.name.replace('hl1q','')):Number(input.dataset.index);
        const record=getRecord(),key=questionKey(data.tasks[i],i);record.answers[key]=input.type==='checkbox'?input.checked:input.value;
        record.results[key]=input.type==='checkbox'?input.checked:input.tagName==='TEXTAREA'?input.value.trim().length>=2:false;
        $(`#hl1Status${i}`).textContent='未チェック';$(`#hl1Why${i}`).hidden=true;
        scheduleSave();updateProgress();
      });
    });
    updateProgress();
  }
  let documentRender=0;
  function renderPage(){
    const data=PAGES[page-1];
    const token=++documentRender;
    const pdfLink=$('.hl1-pdf-actions a');
    pdfLink.textContent=workbook.pages.some(p=>p.document.edited)?'教材PDFをダウンロード':'原本PDFを開く・印刷';
    $('#hl1PdfStatus').textContent='';
    if(data.document.edited){
      $('#hl1Image').removeAttribute('src');$('#hl1PdfStatus').textContent='編集した教材を表示中…';
      renderDocumentPage(data.document,page).then(image=>{if(token===documentRender&&container.isConnected){$('#hl1Image').src=image;$('#hl1PdfStatus').textContent='このページの教材本文を表示しています。';}}).catch(err=>{if(token===documentRender)$('#hl1PdfStatus').textContent=`編集した教材を表示できません：${err.message}`;});
    }else $('#hl1Image').src=assetUrl(`assets/pdf-pages/html-level1-${pad(page)}.webp`);
    $('#hl1PageGuide').hidden=!data.tasks.length;
    $('#hl1PageGuide').innerHTML='<h3>この教材ページで取り組むこと</h3><p>教材を読んだら、次の項目を実習・問題で確かめましょう。</p><ol>'+data.tasks.map(q=>`<li><strong>${escapeHtml(q.text)}</strong>${page!==11&&(q.why||q.hint)?`<p>${escapeHtml(q.why||q.hint)}</p>`:''}</li>`).join('')+'</ol>';
    $('#hl1Image').alt=`HTML入門レベル1 PDFの${page}ページ目：${data.title}`;
    $('#hl1Current').textContent=`PDF ${page}ページ`;$('#hl1Title').textContent=data.title;
    const introduction=data.mode==='introduction';
    $('.hl1-practice').setAttribute('aria-label',introduction?'教材の使い方とHTMLの基礎':'このページのミッション・確認問題');
    $('#hl1SectionHeading').textContent=introduction?'はじめに：この教材の使い方':page===11?'最終確認テスト':'このページの学習・進捗チェック';
    $('#hl1ExercisesHeading').textContent=introduction?'教材と画面の使い方':'✏️ このページのミッション・確認問題';
    for(const selector of ['.hl1-progress','#hl1Progress','#hl1AnswerStatus','#hl1Result'])$(selector).hidden=introduction;
    $('#hl1Intro').textContent=data.intro;$('#hl1EditorHint').textContent=data.editorHint;
    $('#hl1SampleBox').hidden=!data.sample;
    $('#hl1Check').textContent=introduction?'使い方を確認して次へ':page===11?'テストを提出する':'✅ 回答とコードをチェック';
    $('#hl1Result').textContent='';$('#hl1Result').className='';
    renderTasks();
  }
  function changePage(newPage){
    const n=Number(newPage);
    if(!Number.isInteger(n)||n<1||n>maxPage)return;
    if(!allowed(n)){
      $('#hl1PageSelect').value=String(page);
      $('#hl1GateStatus').textContent=`第${n}ページはロック中です。前のページの必須学習を完了してください。`;return;
    }
    navigated=true;page=n;state.currentPage=n;state.visited[pageKey(n)]=true;
    renderPage();scheduleSave();
    $('#hl1PageViewport').scrollTo(0,0);$('.hl1-practice').scrollTo(0,0);
    mobileShow('pdf');$('.hl1-grid').scrollIntoView({block:'start',behavior:'instant'});
  }
  $('#hl1Scale').addEventListener('change',()=>{$('#hl1Image').style.width=`${$('#hl1Scale').value}%`;});
  function advanceIntroduction(){
    getRecord().introRead=true;state.completed.p01=true;
    changePage(2);
  }
  $('#hl1Prev').addEventListener('click',()=>changePage(page-1));
  $('#hl1Next').addEventListener('click',()=>PAGES[page-1].mode==='introduction'?advanceIntroduction():changePage(page+1));
  $('#hl1PageSelect').addEventListener('change',ev=>changePage(ev.target.value));
  $('#hl1PageList').addEventListener('click',ev=>{const button=ev.target.closest('[data-page]');if(button)changePage(button.dataset.page);});
  $('#hl1Check').addEventListener('click',async()=>{
    if(!allowed(page))return;
    const record=getRecord(),data=PAGES[page-1];
    if(data.mode==='introduction'){advanceIntroduction();return;}
    if(page===11&&!data.tasks.every((task,i)=>task.type==='choice'?
      record.answers[questionKey(task,i)]!==undefined&&record.answers[questionKey(task,i)]!==''&&Number.isInteger(Number(record.answers[questionKey(task,i)]))&&Number(record.answers[questionKey(task,i)])>=0&&Number(record.answers[questionKey(task,i)])<task.options.length:
      String(record.answers[questionKey(task,i)]||'').trim().length>=2)){
      $('#hl1Result').textContent='未回答の必須問題があります。全10問に回答してから提出してください。';return;
    }
    data.tasks.forEach((task,i)=>{
      const answer=record.answers[questionKey(task,i)];
      record.results[questionKey(task,i)]=task.type==='choice'?String(answer)===String(task.correct):task.type==='check'?answer===true:
        task.type==='text'?String(answer??'').trim().length>=2:codeCheck(task.test,editorApi?.getCode()?.html||'');
    });
    if(page===11){state.testSubmitted=true;state.completed.p11=true;}
    else if(pageRequirementsMet(record,data,page))state.completed[pageKey(page)]=true;
    renderTasks();
    const done=data.tasks.filter((task,i)=>record.results[questionKey(task,i)]===true).length;
    $('#hl1Result').textContent=page===11?`テストを提出しました。確認結果 ${done} / ${data.tasks.length}。第12ページを解放しました。`:
      `このページ：${done} / ${data.tasks.length}項目を達成。${state.completed[pageKey(page)]?'必須学習が完了しました。':'未達成の必須を確認してください。'}`;
    $('#hl1Result').className='hl1-feedback';scheduleSave();
    // A submission records answers and gates in the same merged document write.
    if(page===11)await storeRemote();
  });
  $('#hl1Save').addEventListener('click',()=>storeRemote());
  $('#hl1LoadSample').addEventListener('click',()=>{
    if(!allowed(page)||!PAGES[page-1].sample||!editorApi)return;
    if(editorApi.setHtml(PAGES[page-1].sample))floatingEditor.show();
  });

  async function loadHistory(){
    if(reading)return false;reading=true;
    try{
      const snap=await getDoc(workspaceRef);
      if(!container.isConnected)return false;
      const cloud=snap.exists()&&snap.data().pageWork||{};
      // Normalize legacy completion/test evidence before combining it with a new local draft.
      cloud._learning=learningState(cloud,PAGES);
      progress=mergeHistory(progress,cloud,pending);
      state=learningState(progress,PAGES);progress._learning=state;
      if(!navigated)page=state.currentPage;
      if(!allowed(page))page=unlockedThrough(state);
      state.currentPage=page;state.visited[pageKey(page)]=true;
      remoteReady=true;persistLocal();renderPage();
      setSaveStatus(pending?'端末の変更を復元しました（Firebaseへ未保存）':'学習位置・回答・解放状態を読み込みました');
      if(pending){clearTimeout(saveTimer);saveTimer=setTimeout(()=>storeRemote(),1400);}
      return true;
    }catch(err){setSaveStatus(`Firebase履歴を取得できません（端末の入力は保持）：${err.code||err.message}`);return false;}
    finally{reading=false;}
  }
  if(!isStudent){
    let loadedStudent=null,loadVersion=0;
    $('#hl1TeacherStudent').addEventListener('change',()=>{loadVersion++;loadedStudent=null;$('#hl1TeacherApply').disabled=true;});
    $('#hl1TeacherLoad').addEventListener('click',async()=>{
      const target=students.find(s=>s.id===$('#hl1TeacherStudent').value),version=++loadVersion;
      if(!target?.activeUid)return;
      $('#hl1TeacherApply').disabled=true;$('#hl1TeacherStatus').textContent='生徒の進度を読み込み中…';
      try{
        const snap=await getDoc(doc(db,'web_workspaces',`${target.activeUid}__${lesson.id}`));
        if(version!==loadVersion||!container.isConnected)return;
        loadedStudent=target;
        const targetState=learningState(snap.exists()?snap.data().pageWork||{}:{},PAGES);
        $('#hl1TeacherThrough').value=String(unlockedThrough(targetState)===12?(targetState.completed.p12?12:11):unlockedThrough(targetState)-1);
        $('#hl1TeacherApply').disabled=false;$('#hl1TeacherStatus').textContent=`${target.id}：第${targetState.currentPage}ページから再開、学習済み ${Object.values(targetState.completed).filter(Boolean).length} / 12`;
      }catch(err){$('#hl1TeacherStatus').textContent=`読み込みに失敗：${err.code||err.message}`;}
    });
    $('#hl1TeacherApply').addEventListener('click',async()=>{
      const target=loadedStudent;
      if(!target||target.id!==$('#hl1TeacherStudent').value)return;
      const through=Number($('#hl1TeacherThrough').value);
      if(!Number.isInteger(through)||through<0||through>12)return;
      if(!confirm(`${target.id}の第${through}ページまでを学習済み扱いにします。以降のページは再学習になります。回答とコードは削除しません。よろしいですか？`))return;
      $('#hl1TeacherApply').disabled=true;
      try{
        const completed=Object.fromEntries(PAGES.map((_,i)=>[pageKey(i+1),i<through]));
        const adjustment={version:1,completed,visited:{},currentPage:Math.min(through+1,12),testSubmitted:through>=11,
          revision:crypto.randomUUID(),adjustedBy:uid,updatedAt:Date.now()};
        await setDoc(doc(db,'web_workspaces',`${target.activeUid}__${lesson.id}`),{
          ownerUid:target.activeUid,studentId:target.id,lessonId:lesson.id,
          pageWork:{_learning:{teacherAdjustment:adjustment}},pageWorkUpdatedAt:serverTimestamp()
        },{merge:true});
        $('#hl1TeacherStatus').textContent=`${target.id}の進度調整を保存しました。生徒の次回ログイン・教材再表示時に反映します。`;
      }catch(err){$('#hl1TeacherStatus').textContent=`保存に失敗しました（権限・通信状態を確認）：${err.code||err.message}`;}
      finally{if(target.id===$('#hl1TeacherStudent').value)$('#hl1TeacherApply').disabled=false;}
    });
  }
  $('.hl1-pdf-actions a').addEventListener('click',async event=>{
    if(!workbook.pages.some(p=>p.document.edited))return;
    event.preventDefault();$('#hl1PdfStatus').textContent='PDFを作成中…';
    try{await downloadWorkbookPdf(workbook,pdfUrl);$('#hl1PdfStatus').textContent='PDFを作成しました。';}catch(err){$('#hl1PdfStatus').textContent=`PDFを作成できません：${err.message}`;}
  });
  onWorkbookLoaded(workbook);
  mobileShow('pdf');renderPage();
  mountWorkbookEditor({container,book:workbook,db,lesson,uid,isTeacher,pdfUrl,onSaved:next=>{
    workbook=next;PAGES=next.pages;state=learningState(progress,PAGES);progress._learning=state;renderPage();onWorkbookLoaded(next);
  }});
  const lifecycle=new MutationObserver(()=>{if(!container.isConnected){clearTimeout(saveTimer);lifecycle.disconnect();}});
  lifecycle.observe(document.getElementById('app'),{childList:true,subtree:true});
  const editorReady=mountWebWorkspace({container:$('#webWorkspace'),lesson,db,student,uid,linkedWorkbook:true})
    .then(api=>{editorApi=api;})
    .catch(err=>{$('#webWorkspace').innerHTML=`<p class="message error">エディターを読み込めません：${escapeHtml(err.message)}</p>`;});
  if(isStudent)loadHistory();else setSaveStatus('先生プレビュー：全ページを確認できます。');
  await editorReady;
}
