import {WEB_VISUALS} from './web-visual-data.js?v=145514f436ae';
import {assetUrl} from './asset-versions.js?v=78ddd5e723c8';
import {foundationLesson} from './web-course.js?v=8f1b29569cd0';
import {mountFloatingEditor} from './floating-editor.js?v=5b7434c51c8f';
import {mountPageNavigation} from './page-navigation.js?v=067885ce2b97';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titles=['完成見本を見てみよう','しくみを図で見よう','この部分を変えてみよう','つくって、確かめよう','振り返りと確認問題'];
function practiceItems(lesson){
 const basic=lesson.practice.split('【基本課題】')[1]?.split('【動作の確認】')[0]||lesson.practice;
 return basic.split(/(?:^|\n)\d+\.\s*/).map(s=>s.trim()).filter(Boolean);
}
function checks(lesson){return (lesson.practice.split('【動作の確認】')[1]?.split('【')[0]||'').split('\n').map(s=>s.replace(/^□\s*/, '').trim()).filter(Boolean);}
function figure(file,alt,caption,zoom=100,poster=false){
 return `<figure class="course-figure"><div class="course-image-viewport" tabindex="0" role="region" aria-label="${esc(alt)}（拡大時は枠内をスクロール）"><img src="${esc(assetUrl(file))}" alt="${esc(alt)}" style="width:${zoom}%" ${poster?'':'width="640" height="440"'}></div><figcaption>${esc(caption)}</figcaption></figure>`;
}
function sheet(lesson,visual,page,zoom=100){
 const body=[
  ()=>figure(visual.poster,`${lesson.title}の実際の見本画面`, '見本画像の番号を手掛かりに、画面の役割を見つけよう。',zoom,true)+`<div class="course-picture-legend">${visual.lookFor.map(([,label])=>`<span>${esc(label)}</span>`).join('')}</div><div class="course-key-message"><strong>今日できるようになること</strong><p>${esc(lesson.goal)}</p></div><p class="course-short-note">これは見本画像です。ゲームは「エディターを開く」から実行できます。</p>`,
  ()=>figure(visual.diagram,visual.headline, '矢印・囲み・位置の関係を、コードと結び付けよう。',zoom)+`<div class="course-concept-notes">${visual.notes.map((s,i)=>`<p><b>${i+1}</b>${esc(s)}</p>`).join('')}</div>`,
  ()=>figure(visual.code,`${visual.change.language}の変更箇所。${visual.change.instruction}`, '見本のコードと、変更後のコードを上下で比べよう。',zoom)+`<div class="course-change-task"><span class="pill">${esc(visual.change.language)}タブ</span><h3>やってみよう</h3><p>${esc(visual.change.instruction)}</p></div><div class="course-expected"><strong>こうなれば成功</strong><p>${esc(visual.change.expected)}</p></div>`,
  ()=>`<div class="course-step-cards">${practiceItems(lesson).map((s,i)=>`<section><span>${i+1}</span><div><h3>操作 ${i+1}</h3><p>${esc(s)}</p></div></section>`).join('')}</div><h3>予想 → 操作 → 結果を比べる</h3><div class="course-test-example"><div><b>予想</b><p>${esc(visual.change.expected)}</p></div><span aria-hidden="true">→</span><div><b>実際</b><p>同じ結果になった？<br>違った場所を1つずつ調べよう。</p></div></div><div class="course-expected"><strong>動作のチェック</strong>${checks(lesson).map(s=>`<p>□ ${esc(s)}</p>`).join('')}</div>`,
  ()=>`<div class="course-recap"><img src="${esc(assetUrl(visual.poster))}" alt="完成見本を振り返る"><div><span class="pill">自分の作品を見ながら説明</span><h3>どこを変えた？ どう動いた？</h3><p>変えた場所、確かめた結果、次に直したいことを自分の言葉で書こう。</p></div></div><h3>この教材の大切なポイント</h3><div class="course-concept-notes">${visual.notes.map((s,i)=>`<p><b>${i+1}</b>${esc(s)}</p>`).join('')}</div><p class="course-short-note">確認問題は右側、スマホではこの下にあります。詳しい用語は下の「用語と詳しい解説」で読み直せます。</p>`
 ][page-1]();
 return `<article class="course-illustrated-sheet"><header class="course-page-head"><div><span>WEB開発コース① / LEVEL${lesson.level}</span><h2>${esc(titles[page-1])}</h2></div><strong>${String(page).padStart(2,'0')}<small> / 05</small></strong></header><div class="course-sheet-body">${body}</div><footer>Learning Studio ／ ${esc(lesson.title)} ／ ${page} / 5</footer></article>`;
}
export function mountIllustratedWebCourse({container,lesson,db,student,uid,mountWebWorkspace}){
 const visual=WEB_VISUALS[lesson.id];if(!container||!visual)return;
 const source=foundationLesson(lesson.id),custom=['starterHtml','starterCss','starterJs','explanation','practice','question','imageUrl','videoUrl','pdfUrl'].some(k=>lesson[k]!==source[k]);
 const editedExplanation=lesson.explanation!==source.explanation;
 let page=1,zoom=100,printing=false;const positionKey=`learning-studio-visual-page:${uid}:${lesson.id}`;
 try{const saved=Number(sessionStorage.getItem(positionKey));if(saved>=1&&saved<=5)page=saved;}catch{}
 container.innerHTML=`<nav class="course-visual-nav" aria-label="図解教材のページ送り"><output id="coursePageCount" aria-live="polite">1 / 5</output><button type="button" id="coursePagePrev" aria-label="前の教材ページ">←</button><select id="coursePageSelect" aria-label="教材ページを選ぶ">${titles.map((t,i)=>`<option value="${i+1}">${i+1}. ${esc(t)}</option>`).join('')}</select><button type="button" id="coursePageNext" aria-label="次の教材ページ">→</button></nav>
  <div class="course-visual-tools"><label>図の表示倍率 <select id="courseImageZoom"><option value="100">100%</option><option value="125">125%</option><option value="150">150%</option><option value="200">200%</option></select></label><button type="button" id="coursePrint" class="ghost">教材を印刷・PDF保存</button><span class="muted tiny">全5ページ / 目安60〜90分</span></div>
  ${custom?'<p class="notice">先生が編集した原稿を使用しています。画像・図・変更例は標準教材の見本です。現在のコードと先生の説明も確認してください。</p>':''}
  <div class="course-visual-layout"><div class="course-visual-reader" tabindex="0" role="region" aria-label="図解と完成見本の教材"><div id="courseVisualPage"></div><details class="course-reference" ${editedExplanation?'open':''}><summary>用語と詳しい解説を読む${custom?'（先生の原稿）':''}</summary><div class="lesson-text">${esc(lesson.explanation)}</div></details><details class="course-reference"><summary>追加の改造・実験・不具合の調べ方</summary><div class="lesson-text">${esc(lesson.practice)}</div></details></div>
  <aside class="course-visual-check" aria-label="この教材ページの学習・進捗チェック"><div id="courseVisualCheck"></div><div id="courseSubmissionSlot"></div></aside></div>
  <button type="button" id="webCourseEditorOpen" class="hl1-editor-open" aria-controls="webCourseEditorWindow" aria-expanded="false">💻 エディターを開く</button>
  <section id="webCourseEditorWindow" class="hl1-editor-window course-editor-window" aria-labelledby="webCourseWindowTitle" hidden><div class="hl1-window-bar" data-window-move tabindex="0" role="group" aria-label="エディターを移動（ドラッグまたは矢印キー）"><strong id="webCourseWindowTitle">💻 Webエディター</strong><div class="hl1-window-actions"><button type="button" class="ghost small" data-window-reset>位置を戻す</button><button type="button" class="ghost small" data-window-minimize>− 最小化</button></div></div><div class="hl1-window-content"><p class="muted tiny">見出しで移動、右下の↘でサイズ変更。矢印キーでも操作できます。Escで最小化。コードとゲームの状態は残ります。</p><div id="webWorkspace"></div></div><button type="button" class="hl1-window-resize" data-window-resize aria-label="エディターのサイズを変更（ドラッグまたは矢印キー）">↘</button></section>`;
 const navigation=container.querySelector('.course-visual-nav'),$=s=>container.querySelector(s)||navigation.querySelector(s);
 const header=mountPageNavigation({container,navigation});
 const floating=mountFloatingEditor({container,windowEl:$('#webCourseEditorWindow'),openButton:$('#webCourseEditorOpen'),header});floating.hide();
 const submission=document.getElementById('lsFinalSubmission');$('#courseSubmissionSlot').append(submission);
 const events=new AbortController(),on=(el,type,fn)=>el.addEventListener(type,fn,{signal:events.signal});
 function render(){
  $('#courseVisualPage').innerHTML=sheet(lesson,visual,page,zoom);$('#courseImageZoom').disabled=page>=4;
  $('#coursePageCount').textContent=`${page} / 5`;$('#coursePageSelect').value=String(page);$('#coursePagePrev').disabled=page===1;$('#coursePageNext').disabled=page===5;
  const current=[visual.lookFor.map(([,label])=>`${label}を見つける`),visual.notes,[visual.change.instruction,visual.change.expected],checks(lesson),['実際に変えたコードと動作を説明する','コードを保存して、確認問題を提出する']][page-1];
  $('#courseVisualCheck').innerHTML=`<span class="pill">教材 ${page}ページに対応</span><h2>このページの学習・進捗チェック</h2><p class="course-check-theme">${esc(titles[page-1])}</p><ul>${current.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><button type="button" data-open-course-editor>エディターを開いて試す</button>`;
  $('#courseVisualCheck button').onclick=()=>floating.show();submission.hidden=page!==5;
  try{sessionStorage.setItem(positionKey,String(page));}catch{}
 }
 function go(n){if(n<1||n>5)return;page=n;render();$('.course-visual-reader').scrollTop=0;$('.course-visual-check').scrollTop=0;}
 on($('#coursePagePrev'),'click',()=>go(page-1));on($('#coursePageNext'),'click',()=>go(page+1));on($('#coursePageSelect'),'change',e=>go(Number(e.target.value)));
 on($('#courseImageZoom'),'change',e=>{zoom=Number(e.target.value);render();});
 on(container,'course-open-editor',()=>floating.show());
 on(container,'course-show-check',()=>{floating.hide();go(5);$('.course-visual-check').scrollIntoView({block:'start'});});
 on($('#coursePrint'),'click',async()=>{
  if(printing)return;printing=true;$('#coursePrint').disabled=true;
  const layer=document.createElement('div');layer.id='coursePrintPages';
  layer.innerHTML=Array.from({length:5},(_,i)=>`<section class="course-print-page">${i===0&&custom?'<p class="course-print-notice">図と変更例は標準教材の見本です。先生が編集した原稿と問題も確認してください。</p>':''}${sheet(lesson,visual,i+1)}${i===4?`<div class="course-print-question"><h3>確認問題</h3><p>${esc(lesson.question)}</p><div class="course-print-answer">回答・振り返り</div></div>`:''}</section>`).join('');
  document.getElementById('coursePrintPages')?.remove();document.body.append(layer);
  const printButton=$('#coursePrint');const cleanup=()=>{layer.remove();printing=false;printButton.disabled=false;};window.addEventListener('afterprint',cleanup,{once:true,signal:events.signal});
  try{await Promise.all([...layer.querySelectorAll('img')].map(i=>i.decode()));if(!container.isConnected){cleanup();return;}window.print();}catch{cleanup();printButton.textContent='画像を読み込めません。再度印刷してください';}
 });
 render();
 mountWebWorkspace({container:$('#webWorkspace'),lesson,db,student,uid}).catch(err=>{$('#webWorkspace').textContent='エディターを読み込めません：'+err.message;});
 const observer=new MutationObserver(()=>{if(!container.isConnected){events.abort();document.getElementById('coursePrintPages')?.remove();observer.disconnect();}});observer.observe(document.getElementById('app'),{childList:true,subtree:true});
 return {openEditor:()=>floating.show(),showCheck:()=>go(5)};
}
