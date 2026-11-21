import {ROBLOX_MEDIA} from './roblox-course-data.js?v=2accacdfab74';
import {robloxLesson} from './roblox-course.js?v=91bd6fb6766c';
import {assetUrl} from './asset-versions.js?v=81ac5b5dc66c';
import {mountPageNavigation} from './page-navigation.js?v=067885ce2b97';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titles=['今日のゴールと準備','道具と言葉を知ろう','Studioで作ろう①','Studioで作ろう②・比べよう','テスト・保存・振り返り'];
const stepsHtml=items=>`<ol class="roblox-instructions">${items.map(text=>`<li>${esc(text)}</li>`).join('')}</ol>`;
function mediaHtml(id,zoom=100,printing=false){
 const m=ROBLOX_MEDIA[id];if(!m)return '';
 const credit=`<figcaption><p>${esc(m.caption)}</p><small>出典：<a href="${esc(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">Roblox公式ドキュメント</a> ／ ${esc(m.creator)} ／ <a href="${esc(m.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.license)}</a> ／ 原本・加工なし</small><details class="roblox-origin"><summary>素材の原本と権利表示</summary><p><a href="${esc(m.originalUrl)}" target="_blank" rel="noopener noreferrer">${m.kind==='video'?'動画':'画像'}原本を開く</a> ／ <a href="${esc(m.sourceRepository+'/blob/main/LICENSE')}" target="_blank" rel="noopener noreferrer">配布元のライセンス</a></p></details></figcaption>`;
 if(m.kind==='video')return `<figure class="roblox-media" data-media="${esc(id)}">${printing?'<p><strong>公式の実演動画（画面で再生できます）</strong></p>':`<video controls playsinline preload="metadata" aria-label="${esc(m.caption)}"><source src="${esc(assetUrl(m.file))}" type="video/mp4">動画を再生できない場合は、下の原本リンクから確認できます。</video>`}${credit}</figure>`;
 return `<figure class="roblox-media" data-media="${esc(id)}"><div class="roblox-image-viewport" tabindex="0" role="region" aria-label="${esc(m.caption)}（拡大時は枠内をスクロール）"><img src="${esc(assetUrl(m.file))}" alt="${esc(m.caption)}" width="${m.width}" height="${m.height}" style="width:${zoom}%;max-width:${m.width}px"></div>${credit}</figure>`;
}
function instructionHtml(step,index,zoom,printing){
 return `<section class="roblox-step"><h3><span>${index+1}</span>${esc(step.title)}</h3><p>${esc(step.instruction)}</p>${step.media?mediaHtml(step.media,zoom,printing):''}<p class="roblox-result"><strong>確かめること：</strong>${esc(step.expected)}</p></section>`;
}
function sheet(lesson,n,zoom=100,printing=false){
 const source=robloxLesson(lesson.id),e=source.experiment;
 const body=[
  ()=>`<p class="roblox-project">${esc(source.project)}</p>${mediaHtml(source.hero,zoom,printing)}<section class="roblox-callout"><h3>今日できるようになること</h3><p>${esc(lesson.goal)}</p><h3>どの作品から始める？</h3><p>${esc(source.startFile)}</p></section><section class="roblox-callout"><h3>教材とStudioを並べて進めよう</h3><p>Learning Studioで手順を読み、PCのRoblox Studioで操作します。スマホではこの手順書を閲覧できます。画像はRoblox公式の操作例なので、自分の作品と色や部品の配置が異なる場合があります。入力値は画像内の数値ではなく、本文の指定値を使います。日本語と英語の道具名を見比べて探してください。</p><p>目安75分：準備・見本10分 → 言葉と道具10分 → 制作35分 → 比較・調整10分 → 保存・振り返り10分。操作やダウンロードにかかる時間は環境によって変わります。</p><div class="actions"><a class="btn ghost" href="https://create.roblox.com/docs/ja-jp/studio/setup" target="_blank" rel="noopener noreferrer">Studioの準備（公式）</a><a class="btn ghost" href="https://create.roblox.com/docs/ja-jp/tutorials/curriculums/building/get-started" target="_blank" rel="noopener noreferrer">Classic Obbyの公式チュートリアル</a></div></section>`,
  ()=>`${source.images.slice(0,2).map(id=>mediaHtml(id,zoom,printing)).join('')}<h3>最初に言葉と道具を知ろう</h3><dl class="roblox-terms">${source.terms.map(t=>`<div><dt>${esc(t.word)}</dt><dd>${esc(t.meaning)}</dd></div>`).join('')}</dl><p>分からない言葉は、このページへ戻って読み直せます。操作の結果は、次のページの番号付き手順で確かめます。</p>`,
  ()=>`<p>StudioをStop（停止）した編集状態で始めます。本文に「Playで試す」とある場面で再生し、編集前には再びStopします。</p>${source.video?`<h3>本物のStudioでの動きを見よう</h3>${mediaHtml(source.video,zoom,printing)}<p>再生して変化を観察したら動画を止め、自分の作品で同じ設定を試します。</p>`:''}${source.steps.slice(0,4).map((s,i)=>instructionHtml(s,i,zoom,printing)).join('')}`,
  ()=>`${source.steps.slice(4).map((s,i)=>instructionHtml(s,i+4,zoom,printing)).join('')}<section class="roblox-experiment"><h3>予想して比べる｜${esc(e.title)}</h3><h4>操作する前に予想</h4><p>${esc(e.predict)}</p><h4>試す順番</h4>${stepsHtml(e.steps)}<h4>結果を比べる手掛かり</h4><p>${esc(e.result)}</p></section>`,
  ()=>`<h3>作品を開いて、最後に確かめよう</h3><ul class="roblox-test-list">${source.tests.map(test=>`<li>□ ${esc(test)}</li>`).join('')}</ul><h3>困ったときの確認先</h3>${source.trouble.map(t=>`<section class="roblox-callout"><h4>${esc(t.symptom)}</h4><p>${esc(t.solution)}</p></section>`).join('')}<section class="roblox-callout"><h3>作品の保存と、回答の提出は別です</h3><p>StudioのテストをStopしてから、FileのSave to FileまたはDownload a Copyで、本文のファイル名へ保存します。保存した作品を開き直して確認します。</p><p>その後、右側（スマホはこの下）の確認問題へ、実際に行った操作・予想・結果・保存ファイル名を書き、「回答を提出する」を押します。Studioの作品ファイル自体をこの欄へアップロードする機能ではありません。</p><p>書き出し例：「＿＿と予想しました。Studioで＿＿を変えると＿＿でした。＿＿へ戻して確認し、＿＿というファイルに保存しました。」</p><a href="https://create.roblox.com/docs/projects/place-files" target="_blank" rel="noopener noreferrer">ファイル保存の公式説明</a></section>`
 ][n-1]();
 return `<article class="roblox-sheet"><header><span>Roblox Studio / LEVEL1 / 75分</span><h2>${esc(titles[n-1])}</h2><p>教材内 ${n} / 5ページ</p></header><div class="roblox-sheet-body">${body}</div><footer>${esc(lesson.title)} ／ ${n} / 5</footer></article>`;
}
export function mountRobloxReader({container,lesson,uid,initialPage,scrollOnEntry=false,onPageChange=()=>{}}){
 const source=robloxLesson(lesson.id);if(!container||!source)return;
 const key=`learning-studio-roblox-page:${uid}:${lesson.id}`;let page=1,zoom=100,renderVersion=0,printing=false;
 try{const saved=Number(sessionStorage.getItem(key));if(saved>=1&&saved<=5)page=saved;}catch{}
 if(Number.isInteger(initialPage)&&initialPage>=1&&initialPage<=5)page=initialPage;
 const custom=['explanation','practice','question'].some(field=>lesson[field]!==source[field]);
 container.dataset.lessonId=lesson.id;
 container.innerHTML=`<nav class="course-visual-nav" aria-label="Roblox教材内のページ送り"><div class="course-nav-context"><strong title="${esc(lesson.title)}">LEVEL1 ${esc(lesson.title)}</strong><output id="robloxPageCount" aria-live="polite"></output></div><button id="robloxPagePrev" type="button">← 前のページ</button><select id="robloxPageSelect" aria-label="Roblox教材ページを選ぶ">${titles.map((t,i)=>`<option value="${i+1}">${i+1}. ${esc(t)}</option>`).join('')}</select><button id="robloxPageNext" type="button">次のページ →</button></nav><div class="roblox-tools"><label>画像の表示倍率 <select id="robloxImageZoom"><option value="100">100%</option><option value="150">150%</option><option value="200">200%</option></select></label><button id="robloxPrint" type="button" class="ghost">教材を印刷・PDF保存</button><span>画面は全5ページ。印刷は説明量に応じて複数枚です。</span></div>${custom?'<p class="notice">先生が編集した原稿・問題を使用しています。画像と番号付き手順は標準教材の操作例です。下の先生の原稿も確認してください。</p>':''}<section id="robloxCurrentPage" class="course-current-page" aria-live="polite"></section><p id="robloxMediaStatus" role="status"></p><div class="roblox-layout"><div id="robloxCurrentSheet"></div><aside class="roblox-check-panel"><div id="robloxCurrentCheck"></div><div id="robloxSubmissionSlot"></div></aside></div><nav class="course-page-footer" aria-label="この教材内のページ送り"><button type="button" class="ghost" id="robloxBottomPrev"></button><output id="robloxBottomCount"></output><button type="button" class="ghost" id="robloxBottomNext"></button></nav><details class="course-reference" ${custom?'open':''}><summary>${custom?'先生の原稿（解説・実践課題）':'解説・実践課題をまとめて読む'}</summary><h3>解説</h3><div class="lesson-text">${esc(lesson.explanation)}</div><h3>実践課題</h3><div class="lesson-text">${esc(lesson.practice)}</div></details>`;
 const navigation=container.querySelector('nav'),$=s=>container.querySelector(s)||navigation.querySelector(s);
 const header=mountPageNavigation({container,navigation}),events=new AbortController();
 const on=(el,type,handler)=>el.addEventListener(type,handler,{signal:events.signal});
 const submission=document.getElementById('lsFinalSubmission');$('#robloxSubmissionSlot').append(submission);
 function render(){
  const version=++renderVersion;container.dataset.page=String(page);
  $('#robloxPageCount').textContent=`${page} / 5`;$('#robloxBottomCount').textContent=`教材内 ${page} / 5ページ`;$('#robloxPageSelect').value=String(page);
  for(const id of ['#robloxPagePrev','#robloxBottomPrev'])$(id).disabled=page===1;
  for(const id of ['#robloxPageNext','#robloxBottomNext'])$(id).disabled=page===5;
  $('#robloxBottomPrev').textContent=`← 前のページ${page>1?'：'+titles[page-2]:'（最初のページ）'}`;
  $('#robloxBottomNext').textContent=`次のページ →${page<5?'：'+titles[page]:'（最後のページ）'}`;
  $('#robloxCurrentPage').innerHTML=`<span class="pill">${esc(lesson.title)} / 教材内 ${page}ページ</span><h2>${esc(titles[page-1])}</h2><p>手順を読み、PCのRoblox Studioで操作します。設定を変えたらPlayで試し、Stopして編集へ戻ります。</p>`;
  $('#robloxCurrentSheet').innerHTML=sheet(lesson,page,zoom);$('#robloxImageZoom').disabled=page===5;
  const checks=[['始める作品と今日のゴールを確認する','PCのRoblox Studioで制作する準備をする'],source.terms.map(t=>`${t.word}の意味を説明する`),source.steps.slice(0,4).map(s=>s.expected),[...source.steps.slice(4).map(s=>s.expected),source.experiment.result],source.tests][page-1];
  $('#robloxCurrentCheck').innerHTML=`<span class="pill">教材 ${page}ページに対応</span><h2>このページの学習・進捗チェック</h2><p>${esc(titles[page-1])}</p><ul>${checks.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`;submission.hidden=page!==5;
  const images=[...$('#robloxCurrentSheet').querySelectorAll('img')],status=$('#robloxMediaStatus');
  let imageStatus=images.length?'公式画像を読み込み中…':'',videoFailed=false;
  const mediaStatus=()=>{status.textContent=[imageStatus,videoFailed?'動画を再生できませんでした。動画の原本リンクから確認してください。':''].filter(Boolean).join(' ');};mediaStatus();
  $('#robloxCurrentSheet').setAttribute('aria-busy',String(images.length>0));
  Promise.all(images.map(img=>img.decode())).then(()=>{if(version!==renderVersion||!container.isConnected)return;imageStatus='';mediaStatus();$('#robloxCurrentSheet').setAttribute('aria-busy','false');}).catch(()=>{if(version!==renderVersion||!container.isConnected)return;imageStatus='画像を読み込めませんでした。ページを選び直すか、各画像の公式出典から確認してください。';mediaStatus();$('#robloxCurrentSheet').setAttribute('aria-busy','false');});
  for(const video of $('#robloxCurrentSheet').querySelectorAll('video')){
   const unavailable=()=>{if(video.isConnected){videoFailed=true;mediaStatus();}};
   on(video,'error',unavailable);for(const source of video.querySelectorAll('source'))on(source,'error',unavailable);
  }
  try{sessionStorage.setItem(key,String(page));}catch{}onPageChange(page);
 }
 function reveal(){const top=$('#robloxCurrentPage').getBoundingClientRect().top+scrollY-header.getBoundingClientRect().bottom-12;window.scrollTo({top:Math.max(0,top),behavior:'instant'});}
 function go(n){if(n<1||n>5)return;page=n;render();reveal();}
 for(const id of ['#robloxPagePrev','#robloxBottomPrev'])on($(id),'click',()=>go(page-1));
 for(const id of ['#robloxPageNext','#robloxBottomNext'])on($(id),'click',()=>go(page+1));
 on($('#robloxPageSelect'),'change',e=>go(Number(e.target.value)));on($('#robloxImageZoom'),'change',e=>{zoom=Number(e.target.value);render();});
 on($('#robloxPrint'),'click',async()=>{
  if(printing)return;printing=true;const button=$('#robloxPrint');button.disabled=true;
  const layer=document.createElement('div');layer.id='robloxPrintPages';layer.innerHTML=Array.from({length:5},(_,i)=>`<section class="roblox-print-page">${sheet(lesson,i+1,100,true)}${i===4?`<section class="roblox-print-question"><h3>確認問題</h3><p>${esc(lesson.question)}</p><div>回答・振り返り</div></section>`:''}</section>`).join('');layer.querySelectorAll('details').forEach(d=>d.open=true);document.body.append(layer);
  const cleanup=()=>{layer.remove();printing=false;button.disabled=false;};window.addEventListener('afterprint',cleanup,{once:true,signal:events.signal});
  try{await Promise.all([...layer.querySelectorAll('img')].map(img=>img.decode()));if(!container.isConnected){cleanup();return;}window.print();}catch{cleanup();$('#robloxMediaStatus').textContent='印刷用画像を読み込めませんでした。再度お試しください。';}
 });
 render();if(scrollOnEntry||page>1)requestAnimationFrame(reveal);
 const observer=new MutationObserver(()=>{if(!container.isConnected){events.abort();document.getElementById('robloxPrintPages')?.remove();observer.disconnect();}});observer.observe(document.getElementById('app'),{childList:true,subtree:true});
}
