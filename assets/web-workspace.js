import {doc, getDoc, setDoc, serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

// Uses the same login session and Firestore instance as Learning Studio.
// HTML/CSS/JavaScript executes only inside an opaque-origin, sandboxed iframe.
const FALLBACK_HTML = '<!DOCTYPE html>\n<html lang="ja">\n<head>\n  <meta charset="UTF-8">\n  <title>はじめてのページ</title>\n</head>\n<body>\n  <h1>こんにちは！</h1>\n  <p>HTMLを勉強中です。</p>\n</body>\n</html>';
const INITIAL_HEADING='こんにちは！';
const INITIAL_PARAGRAPH='HTMLを勉強中です。';
const escapeHtml = s => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function composeDocument({html, css, js}, restricted=false) {
  // The iframe's sandbox lacks allow-same-origin and navigation privileges.
  // CSP deliberately blocks external scripts, requests and forms in preview.
  const csp = restricted ? `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'">` : '';
  const style = css.trim() ? `<style>${css.replace(/<\/style/gi,'<\\/style')}</style>` : '';
  const script = js.trim() ? `<script>${js.replace(/<\/script/gi,'<\\/script')}<\/script>` : '';
  let result = html.trim() || FALLBACK_HTML;
  if(/<head\b[^>]*>/i.test(result)) result=result.replace(/<head\b[^>]*>/i, matched=>matched+csp+style);
  else result=csp+style+result;
  if(/<\/body\s*>/i.test(result)) result=result.replace(/<\/body\s*>/i, script+'</body>');
  else result+=script;
  return result;
}
function getFlags(html) {
  const parsed=new DOMParser().parseFromString(html, 'text/html');
  const heading=parsed.querySelector('h1');
  const paragraphs=[...parsed.querySelectorAll('p')];
  return [
    !!heading && heading.textContent.trim()!==INITIAL_HEADING && heading.textContent.trim().length>0,
    !!paragraphs[0] && paragraphs[0].textContent.trim()!==INITIAL_PARAGRAPH && paragraphs[0].textContent.trim().length>0,
    paragraphs.length>=2 && paragraphs[1].textContent.trim().length>0
  ];
}
export async function mountWebWorkspace({container, lesson, db, student, uid, linkedWorkbook=false}) {
  if(!container) return;
  const isStudent=!!student;
  const introMissions=lesson.id==='web-html-l1-lesson01' && !linkedWorkbook;
  const draftKey=`learning-studio-web-draft:${uid}:${lesson.id}`;
  const starter={html:lesson.starterHtml||FALLBACK_HTML, css:lesson.starterCss||'', js:lesson.starterJs||''};
  let code={...starter};
  let touched=false, saveTimer=null, latestFlags=[false,false,false];
  let savedLocal=null;
  try{savedLocal=localStorage.getItem(draftKey);}catch{/* Storage may be unavailable in private browsing. */}
  if(savedLocal){try{const parsed=JSON.parse(savedLocal); if(typeof parsed.html==='string') code={html:parsed.html,css:parsed.css||'',js:parsed.js||''};}catch{/* ignore invalid local drafts */}}
  container.innerHTML=`
    <div class="web-workspace">
      <div class="web-workspace-header"><div><strong>コードを書く → 実行する → チャレンジ</strong><div class="muted tiny">HTML・CSS・JavaScriptを切り替えて編集できます</div></div><span class="pill" id="webSaveState">${isStudent?'読み込み中':'先生プレビュー'}</span></div>
      <div class="web-workspace-grid">
        <div class="web-code-panel">
          <div class="tabs web-code-tabs" role="group" aria-label="編集する言語">
            <button type="button" class="active-tab" data-lang="html">HTML</button>
            <button type="button" class="ghost" data-lang="css">CSS</button>
            <button type="button" class="ghost" data-lang="js">JavaScript</button>
          </div>
          <label class="web-label" for="webHtmlEditor" id="webEditorLabel">HTMLコード</label>
          <textarea id="webHtmlEditor" class="web-editor" spellcheck="false" aria-label="HTMLコード"></textarea>
          <textarea id="webCssEditor" class="web-editor" spellcheck="false" aria-label="CSSコード" hidden></textarea>
          <textarea id="webJsEditor" class="web-editor" spellcheck="false" aria-label="JavaScriptコード" hidden></textarea>
          <div class="actions web-editor-actions">
            <button id="webRun" type="button">▶ プレビューを更新</button>
            <button id="webSave" class="ghost" type="button">☁ 学習内容を保存</button>
            <button id="webReset" class="ghost" type="button">最初に戻す</button>
            <button id="webDownload" class="ghost" type="button">HTMLを保存</button>
          </div>
        </div>
        <div class="web-preview-panel"><div class="web-label">🖥️ プレビュー</div><iframe id="webPreview" title="HTML・CSS・JavaScript実行プレビュー" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe><p class="muted tiny">安全のため外部通信・外部スクリプトは使用できません。</p></div>
      </div>
      ${introMissions?`<div class="web-challenges"><h3>チャレンジミッション（HTML入門 第1回）</h3><p class="muted tiny">3つのミッションに取り組み、「チェックする」を押してください。</p>
        <label><input id="webMission1" type="checkbox" disabled> ミッション1：<code>&lt;h1&gt;</code> を好きな見出しに変更</label>
        <label><input id="webMission2" type="checkbox" disabled> ミッション2：<code>&lt;p&gt;</code> の文章を変更</label>
        <label><input id="webMission3" type="checkbox" disabled> ミッション3：<code>&lt;p&gt;</code> をもう1つ追加</label>
        <div class="actions"><button id="webCheck" type="button">ミッションをチェックする</button></div>
        <div class="web-progress-track"><div id="webProgressBar"></div></div>
        <div id="webProgressText" class="muted">達成 0 / 3</div>
        <details class="web-help"><summary>ヒントを見る</summary><p>見出し：<code>&lt;h1&gt;わたしのページ&lt;/h1&gt;</code></p><p>文章：<code>&lt;p&gt;好きな食べ物はカレーです。&lt;/p&gt;</code></p><p>最後にもう一つ <code>&lt;p&gt;もう一つの文章&lt;/p&gt;</code> を追加してみよう。</p></details>
      </div>`:'<p class="muted tiny">この教材はコードの保存に対応しています。確認問題の採点は下のフォームで行います。</p>'}
      <div class="web-status" id="webFeedback" aria-live="polite"></div>
      ${!isStudent?'<p class="notice tiny">先生プレビュー：操作は試せますが、学習履歴は保存しません。</p>':''}
    </div>`;
  const $=selector=>container.querySelector(selector);
  const fields={html:$('#webHtmlEditor'),css:$('#webCssEditor'),js:$('#webJsEditor')};
  const state=$('#webSaveState'),feedback=$('#webFeedback');
  const workspaceRef=isStudent?doc(db,'web_workspaces',`${uid}__${lesson.id}`):null;
  let active=true;
  function showCode(){ for(const k of Object.keys(fields))fields[k].value=code[k]||''; }
  function collectCode(){ return {html:fields.html.value,css:fields.css.value,js:fields.js.value}; }
  function preview(){
    code=collectCode();
    $('#webPreview').srcdoc=composeDocument(code,true);
    feedback.textContent='プレビューを更新しました。';
    return code;
  }
  function updateMissions(){
    if(!introMissions)return 0;
    latestFlags=getFlags(fields.html.value);
    latestFlags.forEach((v,i)=>$('#webMission'+(i+1)).checked=v);
    const n=latestFlags.filter(Boolean).length;
    $('#webProgressBar').style.width=`${n*100/3}%`;
    $('#webProgressText').textContent=`達成 ${n} / 3`;
    return n;
  }
  function persistLocal(){
    try{localStorage.setItem(draftKey,JSON.stringify(code));}catch{
      feedback.textContent='端末に一時保存できません。学習内容をFirebaseへ保存してください。';
    }
  }
  function cache(){
    touched=true;code=collectCode();
    persistLocal();
    if(isStudent){state.textContent='未保存の変更';clearTimeout(saveTimer);saveTimer=setTimeout(()=>save(false),3500);}
  }
  async function save(showFeedback){
    clearTimeout(saveTimer);
    code=collectCode();
    persistLocal();
    if(!isStudent){if(showFeedback)feedback.textContent='先生プレビューのため、クラウド保存はしません。';return;}
    const count=updateMissions();
    try{
      state.textContent='Firebaseに保存中…';
      const payload={ownerUid:uid,studentId:student.id,lessonId:lesson.id,
        html:code.html,css:code.css,js:code.js,updatedAt:serverTimestamp()};
      if(!linkedWorkbook){payload.missions=count;payload.completed=count===3;}
      await setDoc(workspaceRef,payload,{merge:true});
      state.textContent='Firebaseに保存済み';
      if(showFeedback)feedback.textContent=linkedWorkbook?'HTML・CSS・JavaScriptをFirebaseに保存しました。ページごとの回答は教材ミッションの「このページを保存」で保存できます。':`学習内容を保存しました（達成 ${count} / 3）。`;
    }catch(error){
      state.textContent='Firebase保存エラー';
      if(showFeedback || active)feedback.textContent=`保存できませんでした：${error.code||error.message}`;
    }
  }
  showCode();preview();updateMissions();
  for(const [lang,el] of Object.entries(fields)){
    el.addEventListener('input',cache);
  }
  container.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{
    const lang=button.dataset.lang;
    container.querySelectorAll('[data-lang]').forEach(b=>{b.classList.toggle('active-tab',b.dataset.lang===lang);b.classList.toggle('ghost',b.dataset.lang!==lang);});
    Object.entries(fields).forEach(([k,el])=>el.hidden=k!==lang);
    $('#webEditorLabel').htmlFor=fields[lang].id;
    $('#webEditorLabel').textContent=lang==='html'?'HTMLコード':lang==='css'?'CSSコード':'JavaScriptコード';
    fields[lang].focus();
  }));
  $('#webRun').addEventListener('click',()=>{preview();cache()});
  $('#webSave').addEventListener('click',()=>save(true));
  if(introMissions)$('#webCheck').addEventListener('click',()=>{
    const n=updateMissions();
    feedback.textContent=n===3?'3つのミッションをすべて達成しました！':`現在 ${n} 個達成。残り ${3-n} 個です。`;
    save(false);
  });
  $('#webReset').addEventListener('click',()=>{
    if(!confirm('コードを教材の初期状態に戻しますか？'))return;
    code={...starter};showCode();preview();updateMissions();cache();
  });
  $('#webDownload').addEventListener('click',()=>{
    const combined=composeDocument(collectCode(),false);
    const blob=new Blob([combined],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='my-web-page.html';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  async function loadRemote(){
    try{
      const remote=await getDoc(workspaceRef);
      if(!container.isConnected)return;
      if(remote.exists()&&!touched&&!savedLocal){
        const data=remote.data();
        code={html:typeof data.html==='string'?data.html:starter.html,css:data.css||'',js:data.js||''};
        showCode();preview();updateMissions();
        persistLocal();
      }
      if(!touched)state.textContent=savedLocal?'端末の入力を復元しました':'学習記録を読み込みました';
    }catch(error){
      if(!container.isConnected||touched)return;
      state.textContent='読み込みに失敗';
      feedback.textContent=`保存済みデータを取得できません：${error.code||error.message}`;
    }
  }
  // Return the editor API without waiting for Firebase, so page code checks work offline.
  if(isStudent)loadRemote();
  // Avoid delayed autosaves from a lesson that is no longer visible.
  const observer=new MutationObserver(()=>{
    if(!container.isConnected){active=false;clearTimeout(saveTimer);observer.disconnect();}
  });
  observer.observe(document.getElementById('app'),{childList:true,subtree:true});
  return {
    getCode: () => collectCode(),
    setHtml: nextHtml => {
      if (!active || !container.isConnected) return false;
      if (!confirm('このページの見本コードを読み込むと、現在のHTMLコードを上書きします。よろしいですか？\n必要な作品は先に「学習内容を保存」または「HTMLを保存」してください。')) return false;
      fields.html.value=String(nextHtml);
      preview();updateMissions();cache();
      container.querySelector('[data-lang=html]').click();
      return true;
    }
  };
}
