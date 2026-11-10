import {doc,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {validateWorkbook,prepareRevision} from './workbook-model.js?v=1fbf7052033a';
import {renderDocumentPage,validatePdfPages,downloadWorkbookPdf} from './workbook-pdf.js?v=3dd22dc0b3e0';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy=value=>JSON.parse(JSON.stringify(value));
const codeTests=['doctype','html','head','body','title','heading','paragraph','h2','list3','link','image','customHeading','customParagraph'];
export function mountWorkbookEditor({container,book,db,lesson,uid,isTeacher,pdfUrl,onSaved}){
  if(!isTeacher)return;
  const draftKey=`ls-workbook-author:${uid}:${lesson.id}`;
  const root=document.createElement('div');root.className='workbook-author';
  root.innerHTML='<button type="button" class="ghost" id="wbEdit">教材本文・問題・最終提出を編集</button><dialog id="wbDialog" aria-labelledby="wbTitle"><div class="wb-dialog-head"><h2 id="wbTitle">教材編集（先生用）</h2><button type="button" id="wbClose" class="ghost">閉じる</button></div><p>保存すると生徒の次回教材表示から反映されます。PDF本文を変えたページは文字中心のレイアウトで再生成します。元のPDFと未編集ページは残ります。変更ページのPDFは画像形式となり、文字のコピー・検索はできません。</p><div class="actions"><button type="button" id="wbRestore" class="ghost">端末の編集中原稿を復元</button><button type="button" id="wbExport" class="ghost">JSONを書き出す</button><label class="wb-file">JSONを読み込む<input id="wbImport" type="file" accept=".json,application/json"></label></div><label>編集するページ<select id="wbPage"></select></label><div id="wbFields"></div><details><summary>レッスン全体の最終提出（10問以上）</summary><div id="wbFinals"></div><button type="button" id="wbAddFinal" class="ghost">最終提出に問題を追加</button></details><div class="actions wb-save-actions"><button type="button" id="wbPreview" class="ghost">編集ページをプレビュー</button><button type="button" id="wbPdf" class="ghost">編集内容でPDFを作成</button><button type="button" id="wbSave">生徒に反映して保存</button></div><p id="wbAuthorStatus" role="status"></p><div id="wbPreviewArea"></div></dialog>';
  container.prepend(root);
  const $=s=>root.querySelector(s),dialog=$('#wbDialog');
  let baseline=copy(book),draft=copy(book),page=0,remoteRevision=lesson.workbook?.revision??null,busy=false;
  const field=(label,name,value,large=false)=>`<label>${label}${large?`<textarea name="${name}">${esc(value)}</textarea>`:`<input name="${name}" value="${esc(value)}">`}</label>`;
  function flush(){
    const p=draft.pages[page],fields=$('#wbFields');if(!fields.firstChild)return;
    const get=name=>fields.querySelector(`[name="${name}"]`)?.value||'';
    p.title=get('title');p.intro=get('intro');p.editorHint=get('editorHint');p.sample=get('sample');
    const body=get('pdfBody'),title=get('pdfTitle');
    if(body!==p.document.body||title!==p.document.title)p.document.edited=true;
    p.document.body=body;p.document.title=title;
    fields.querySelectorAll('[data-task]').forEach(el=>{
      const q=p.tasks.find(t=>t.id===el.dataset.task),get=name=>el.querySelector(`[name="${name}"]`)?.value||'';
      q.text=get('text');q.type=get('type');q.required=el.querySelector('[name=required]').checked;
      if(q.type==='choice'){q.options=get('options').split('\n').filter(s=>s.trim());q.correct=Number(get('correct'))-1;q.why=get('why');delete q.test;delete q.hint;}
      else if(q.type==='text'){q.hint=get('hint');delete q.options;delete q.correct;delete q.why;delete q.test;}
      else if(q.type==='code'){q.test=get('test')||'heading';q.hint=get('hint');delete q.options;delete q.correct;delete q.why;}
      else{delete q.options;delete q.correct;delete q.why;delete q.test;delete q.hint;}
    });
    if(p.introSections)fields.querySelectorAll('[data-section]').forEach(el=>{
      const s=p.introSections[Number(el.dataset.section)];s.title=el.querySelector('[name=sectionTitle]').value;s.body=el.querySelector('[name=sectionBody]').value;
      el.querySelectorAll('[data-step]').forEach(row=>{s.steps[Number(row.dataset.step)]={term:row.querySelector('[name=term]').value,description:row.querySelector('[name=description]').value};});
    });
    $('#wbFinals').querySelectorAll('[data-final]').forEach(el=>{const q=draft.finalQuestions.find(q=>q.id===el.dataset.final);q.prompt=el.querySelector('textarea').value;q.kind=el.querySelector('select').value;});
  }
  function cache(){flush();try{localStorage.setItem(draftKey,JSON.stringify(draft));}catch{$('#wbAuthorStatus').textContent='端末に一時保存できません。JSONを書き出してください。';}}
  function render(){
    const p=draft.pages[page];$('#wbPage').innerHTML=draft.pages.map((p,i)=>`<option value="${i}" ${i===page?'selected':''}>${i+1}. ${esc(p.title)}</option>`).join('');
    $('#wbFields').innerHTML=field('学習テーマ','title',p.title)+field('右側の説明','intro',p.intro,true)+`<details open><summary>左側のPDF本文</summary><p class="muted small">改行を含めて編集できます。変更したページだけを再生成します。長すぎる本文は保存前に案内します。</p>${field('PDFタイトル','pdfTitle',p.document.title)}${field('PDF本文','pdfBody',p.document.body,true)}</details>`+
      (p.mode==='introduction'?p.introSections.map((s,i)=>`<fieldset data-section="${i}"><legend>導入の説明 ${i+1}</legend>${field('見出し','sectionTitle',s.title)}${field('本文','sectionBody',s.body,true)}${(s.steps||[]).map((step,j)=>`<div data-step="${j}">${field('学習段階','term',step.term)}${field('段階の説明','description',step.description,true)}</div>`).join('')}</fieldset>`).join(''):
      `<h3>ページごとのミッション・問題</h3><div id="wbTasks">${p.tasks.map((q,i)=>`<fieldset data-task="${esc(q.id)}"><legend>問題 ${i+1}</legend><label>形式<select name="type">${['choice','text','check','code'].map(type=>`<option value="${type}" ${type===q.type?'selected':''}>${({choice:'選択問題',text:'記述問題',check:'操作確認',code:'コード課題'})[type]}</option>`).join('')}</select></label>${field('問題文','text',q.text,true)}<label class="inlinecheck"><input type="checkbox" name="required" ${q.required?'checked':''}>必須（第11ページは常に必須）</label>${q.type==='choice'?field('選択肢（1行に1つ）','options',q.options.join('\n'),true)+field('正解番号（1から）','correct',q.correct+1)+field('解説','why',q.why,true):q.type==='text'?field('記述ヒント','hint',q.hint,true):q.type==='code'?`<label>コード判定<select name="test">${codeTests.map(v=>`<option ${v===q.test?'selected':''}>${v}</option>`).join('')}</select></label>`+field('コードヒント','hint',q.hint,true):''}<div class="actions"><button type="button" data-move="-1" class="ghost">上へ</button><button type="button" data-move="1" class="ghost">下へ</button><button type="button" data-remove-task class="danger">この問題を外す</button></div></fieldset>`).join('')}</div><button type="button" id="wbAddTask" class="ghost">問題を追加</button>`)+field('エディターヒント','editorHint',p.editorHint,true)+field('見本HTML','sample',p.sample,true);
    $('#wbFinals').innerHTML=draft.finalQuestions.map((q,i)=>`<fieldset data-final="${esc(q.id)}"><legend>最終提出 ${i+1}</legend>${field('問題文','prompt',q.prompt,true)}<label>回答形式<select>${['text','code'].map(type=>`<option value="${type}" ${q.kind===type?'selected':''}>${type==='code'?'コード':'記述'}</option>`).join('')}</select></label><button type="button" data-remove-final class="danger">この問題を外す</button></fieldset>`).join('');
  }
  $('#wbEdit').onclick=()=>{if(!isTeacher)return;draft=copy(baseline);page=0;render();$('#wbAuthorStatus').textContent='';$('#wbPreviewArea').innerHTML='';dialog.showModal();};
  $('#wbClose').onclick=()=>{cache();dialog.close();};
  dialog.addEventListener('cancel',cache);dialog.addEventListener('input',cache);
  $('#wbPage').onchange=event=>{cache();page=Number(event.target.value);render();};
  $('#wbFields').addEventListener('change',event=>{
    if(event.target.name!=='type')return;flush();const q=draft.pages[page].tasks.find(t=>t.id===event.target.closest('[data-task]').dataset.task);
    if(q.type==='choice'){if(!q.options||q.options.length<2)q.options=['選択肢1','選択肢2'];if(!Number.isInteger(q.correct)||q.correct<0)q.correct=0;q.why||='';}if(q.type==='text'||q.type==='code')q.hint||='';if(q.type==='code')q.test||='heading';render();cache();
  });
  dialog.addEventListener('click',event=>{
    if(event.target.id==='wbAddTask'){cache();draft.pages[page].tasks.push({id:`task-${crypto.randomUUID()}`,version:1,type:'text',text:'新しい問題',hint:'',required:true});render();cache();}
    const task=event.target.closest('[data-task]');
    if(task&&(event.target.hasAttribute('data-remove-task')||event.target.hasAttribute('data-move'))){
      cache();const list=draft.pages[page].tasks,index=list.findIndex(q=>q.id===task.dataset.task);
      if(event.target.hasAttribute('data-remove-task')){if(!confirm('この問題を教材から外しますか？保存済みの生徒回答は残ります。'))return;list.splice(index,1);}
      else{const target=index+Number(event.target.dataset.move);if(target>=0&&target<list.length)[list[target],list[index]]=[list[index],list[target]];}
      render();cache();
    }
    if(event.target.hasAttribute('data-remove-final')){cache();draft.finalQuestions=draft.finalQuestions.filter(q=>q.id!==event.target.closest('[data-final]').dataset.final);render();cache();}
  });
  $('#wbAddFinal').onclick=()=>{cache();draft.finalQuestions.push({id:`final-${crypto.randomUUID()}`,version:1,prompt:'新しい最終提出の問題',kind:'text'});render();cache();};
  $('#wbRestore').onclick=()=>{try{const saved=localStorage.getItem(draftKey);if(!saved)throw Error('復元する原稿がありません');draft=validateWorkbook(JSON.parse(saved));page=0;render();$('#wbAuthorStatus').textContent='端末の原稿を復元しました。プレビュー後に保存してください。';}catch(err){$('#wbAuthorStatus').textContent=err.message;}};
  $('#wbExport').onclick=()=>{cache();try{const next=validateWorkbook(draft),url=URL.createObjectURL(new Blob([JSON.stringify(next,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='html-level1-workbook.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(err){$('#wbAuthorStatus').textContent=err.message;}};
  $('#wbImport').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>800000)throw Error('JSONは800KB以内で指定してください');draft=validateWorkbook(JSON.parse(await file.text()));page=0;render();cache();$('#wbAuthorStatus').textContent='JSONを読み込みました。内容を確認し保存してください。';}catch(err){$('#wbAuthorStatus').textContent=err.message;}finally{event.target.value='';}};
  async function action(callback){if(busy)return;busy=true;try{cache();$('#wbAuthorStatus').textContent='内容を確認中…';await callback();}catch(err){$('#wbAuthorStatus').textContent=`保存・作成できません：${err.message||err.code}`;}finally{busy=false;}}
  $('#wbPreview').onclick=()=>action(async()=>{const next=validateWorkbook(draft);const pageData=next.pages[page];const image=await renderDocumentPage(pageData.document,page+1);$('#wbPreviewArea').innerHTML=`<h3>PDFプレビュー（第${page+1}ページ）</h3><img alt="編集した教材のプレビュー" src="${image}"><h3>右側の問題</h3>${pageData.tasks.map(q=>`<p>${esc(q.text)}</p>`).join('')}`;$('#wbAuthorStatus').textContent='プレビューを作成しました。';});
  $('#wbPdf').onclick=()=>action(async()=>{await downloadWorkbookPdf(validateWorkbook(draft),pdfUrl);$('#wbAuthorStatus').textContent='PDFを作成しました。';});
  $('#wbSave').onclick=()=>action(async()=>{
    const next=prepareRevision(draft,baseline);await validatePdfPages(next);
    if(new Blob([JSON.stringify(next)]).size>800000)throw Error('教材データが大きすぎます。本文や見本コードを短くしてください');
    await runTransaction(db,async tx=>{
      const ref=doc(db,'lessons',lesson.id),current=await tx.get(ref);
      if(!current.exists())throw Error('元の教材が見つかりません');
      if((current.data().workbook?.revision??null)!==remoteRevision)throw Error('別の編集が保存されています。JSONを書き出し、教材を開き直して確認してください');
      tx.set(ref,{workbook:next,workbookUpdatedAt:serverTimestamp()},{merge:true});
    });
    baseline=copy(next);draft=copy(next);remoteRevision=next.revision;lesson.workbook=next;localStorage.removeItem(draftKey);
    $('#wbAuthorStatus').textContent='教材本文・問題・最終提出を保存しました。生徒の次回教材表示から反映します。';onSaved(next);render();
  });
}
