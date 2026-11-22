import {ROBLOX_MEDIA,ROBLOX_COURSE} from './roblox-course-data.js?v=2ce03f7ced7f';
import {robloxLesson} from './roblox-course.js?v=89db59ec53e8';
import {assetUrl} from './asset-versions.js?v=e423564f0ba4';
import {mountPageNavigation} from './page-navigation.js?v=2e96ac5ac303';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=items=>`<ol class="roblox-instructions">${items.map(text=>`<li>${esc(text)}</li>`).join('')}</ol>`;
function sourceLink(source){return `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>`;}
function mediaHtml(item,zoom,printing){
 const m=ROBLOX_MEDIA[item.id];
 const credit=`<details class="roblox-origin" ${printing?'open':''}><summary>Roblox公式の原本・出典</summary><p>${sourceLink({title:'掲載元の公式ページ',url:m.sourceUrl})} ／ ${esc(m.creator)} ／ <a href="${esc(m.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.license)}</a> ／ 原本・加工なし</p><p><a href="${esc(m.originalUrl)}" target="_blank" rel="noopener noreferrer">${m.kind==='video'?'動画':'画像'}の原本を開く</a> ／ <a href="${esc(m.sourceRepository+'/blob/'+m.sourceRevision+'/LICENSE')}" target="_blank" rel="noopener noreferrer">配布元のライセンス</a></p></details>`;
 const visual=m.kind==='video'?(printing?'<p>公式実演動画：原本リンクから視聴できます。</p>':`<video controls playsinline preload="metadata" aria-label="${esc(m.caption)}"><source src="${esc(assetUrl(m.file))}" type="video/mp4">${esc(m.caption)}</video>`):`<div class="roblox-image-viewport" tabindex="0" role="region" aria-label="${esc(m.caption)}（拡大時は枠内をスクロール）"><img src="${esc(assetUrl(m.file))}" alt="${esc(m.caption)}" width="${m.width}" height="${m.height}" style="width:${zoom*m.width/(m.viewWidth||m.width)}%;max-width:${m.width}px"></div>`;
 return `<figure class="roblox-media" data-media="${esc(item.id)}">${visual}${m.viewWidth&&!printing?'<p class="roblox-image-hint">操作する部分を拡大しています。枠内を横へ動かすと周りも見られます。</p>':''}<figcaption><strong>${m.kind==='video'?'動画で追う場所':'画像で見る場所'}：</strong>${esc(item.look)}</figcaption>${credit}</figure>`;
}
function taskMedia(items,zoom,printing){
 const normal=items.filter(m=>!m.id.startsWith('shape-')&&!m.id.startsWith('material-'));
 const gallery=items.filter(m=>m.id.startsWith('shape-')||m.id.startsWith('material-'));
 return normal.map(m=>mediaHtml(m,zoom,printing)).join('')+(gallery.length?`<div class="roblox-gallery">${gallery.map(m=>mediaHtml(m,zoom,printing)).join('')}</div>`:'');
}
function recordTable(table){
 if(!table)return '';
 return `<div class="roblox-table-wrap" tabindex="0" role="region" aria-label="実習の比較・記録表"><table class="roblox-record-table"><thead><tr>${table.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function sheet(lesson,n,zoom=100,printing=false){
 const source=robloxLesson(lesson.id),page=source.pages[n-1],last=n===source.pages.length;
 const tasks=page.tasks.map((task,i)=>`<section class="roblox-step" data-task="${i+1}"><h3><span>${i+1}</span>${esc(task.title)}</h3>${taskMedia(task.media,zoom,printing)}<h4 class="roblox-action-label">クリックする場所・操作</h4>${list(task.actions)}${task.code?`<div class="roblox-code"><div><strong>${task.language==='lua'?'StudioのScriptへ入力するLuau':'公式の依頼文'}</strong>${!printing?`<button type="button" class="ghost small" data-roblox-copy="${i}">コピー</button>`:''}</div><pre><code>${esc(task.code)}</code></pre>${task.codeSource?`<p>${sourceLink(task.codeSource)} ／ 公式例を基にした教材用コード ／ <a href="assets/roblox-level1-media/LICENSE-CODE-MIT.txt" target="_blank" rel="noopener noreferrer">MITライセンス</a></p>`:''}</div>`:''}${task.codeNotes?`<dl class="roblox-terms">${task.codeNotes.map(term=>`<div><dt>${esc(term.label)}</dt><dd>${esc(term.text)}</dd></div>`).join('')}</dl>`:''}<p class="roblox-result"><strong>操作後に確かめる結果：</strong>${esc(task.expected)}</p></section>`).join('');
 const compare=page.compare?`<section class="roblox-experiment"><h3>予想して、同じ条件で比べる</h3><h4>操作前の予想</h4><p>${esc(page.compare.predict)}</p>${list(page.compare.actions)}<h4>結果を読む手掛かり</h4><p>${esc(page.compare.result)}</p></section>`:'';
 const ending=last?`<h3>最後の確認</h3><ul class="roblox-test-list">${source.tests.map(t=>`<li>□ ${esc(t)}</li>`).join('')}</ul><h3>困ったときの確認先</h3>${source.trouble.map(t=>`<section class="roblox-callout"><h4>${esc(t.symptom)}</h4><p>${esc(t.solution)}</p></section>`).join('')}<p class="roblox-save-note">Studioの作品ファイルを保存した後、このページの確認問題に操作結果を提出します。回答欄は作品ファイルのアップロード用ではありません。</p>`:'';
 const pageCheck=`<section class="roblox-page-check"><h3>このページの学習・進捗チェック</h3><p>ここで操作した結果を、ページを移動する前に確認します。</p><ul>${page.tasks.map(t=>`<li><span aria-hidden="true">□</span> ${esc(t.expected)}</li>`).join('')}</ul><h4>記録すること</h4><p>${esc(page.record)}</p></section>`;
 return `<article class="roblox-sheet"><header><span>LEVEL1 / ${esc(lesson.title)} / この実習は約${page.minutes}分</span><h2>${esc(page.title)}</h2><p>教材内 ${n} / ${source.pages.length}ページ ／ 完成させること：${esc(page.goal)}</p></header><div class="roblox-sheet-body">${n===1?`<p class="roblox-start"><strong>始めるファイル・状態：</strong>${esc(source.startFile)}</p>${(page.resources||[]).map(link=>`<p class="roblox-resource">${sourceLink(link)}</p>`).join('')}`:''}<section class="roblox-official"><h3>公式教材で学ぶ内容</h3><p>${esc(page.reading)}</p><p>${sourceLink(page.source)}</p></section>${page.terms.length?`<dl class="roblox-terms">${page.terms.map(t=>`<div><dt>${esc(t.word)}</dt><dd>${esc(t.meaning)}</dd></div>`).join('')}</dl>`:''}${tasks}${compare}${recordTable(page.table)}${pageCheck}<section class="roblox-record"><h3>操作した結果を記録する</h3><p>${esc(page.record)}</p><p>Studioで実際に試し、紙やメモに結果を書いてから次へ進みます。予想と結果が違った場合も、その違いを記録します。</p></section>${source.id.endsWith('07')&&n===2?`<p class="roblox-official-video">${sourceLink(ROBLOX_COURSE.officialVideo)}<br>公式のAssistant実演動画です。ここまでの操作と見比べる補助として使えます。</p>`:''}${ending}</div><footer>${esc(lesson.title)} ／ ${n} / ${source.pages.length}</footer></article>`;
}
export function mountRobloxReader({container,lesson,uid,initialPage,scrollOnEntry=false,onPageChange=()=>{}}){
 const source=robloxLesson(lesson.id);if(!container||!source)return;
 const count=source.pages.length,titles=source.pages.map(p=>p.title);
 const key=`learning-studio-roblox-page:v${source.revision}:${uid}:${lesson.id}`;
 let page=1,zoom=100,renderVersion=0,printing=false;
 try{const saved=Number(sessionStorage.getItem(key));if(saved>=1&&saved<=count)page=saved;}catch{}
 if(Number.isInteger(initialPage)&&initialPage>=1&&initialPage<=count)page=initialPage;
 const custom=['explanation','practice','question'].some(field=>lesson[field]!==source[field]);
 container.dataset.lessonId=lesson.id;container.dataset.revision=String(source.revision);
 container.innerHTML=`<nav class="course-visual-nav" aria-label="Roblox教材内のページ送り"><div class="course-nav-context"><strong title="${esc(lesson.title)}">LEVEL1 ${esc(lesson.title)}</strong><output id="robloxPageCount" aria-live="polite"></output></div><button id="robloxPagePrev" type="button">← 前のページ</button><select id="robloxPageSelect" aria-label="Roblox教材ページを選ぶ">${titles.map((t,i)=>`<option value="${i+1}">${i+1}. ${esc(t)}</option>`).join('')}</select><button id="robloxPageNext" type="button">次のページ →</button></nav><div class="roblox-tools"><label>画像の表示倍率 <select id="robloxImageZoom"><option value="100">100%</option><option value="150">150%</option><option value="200">200%</option></select></label><button id="robloxPrint" type="button" class="ghost">教材を印刷・PDF保存</button><span>全${count}実習ページ。印刷は説明量に応じて複数枚です。</span></div>${custom?'<p class="notice">先生が編集した原稿・問題を使用しています。番号付き手順は公式教材に沿う標準の実習です。下の先生の原稿も確認してください。</p>':''}<section id="robloxCurrentPage" class="course-current-page" aria-live="polite"></section><p id="robloxMediaStatus" role="status"></p><div class="roblox-layout"><div id="robloxCurrentSheet"></div><aside class="roblox-check-panel"><div id="robloxCurrentCheck"></div><div id="robloxSubmissionSlot"></div></aside></div><nav class="course-page-footer" aria-label="この教材内のページ送り"><button type="button" class="ghost" id="robloxBottomPrev"></button><output id="robloxBottomCount"></output><button type="button" class="ghost" id="robloxBottomNext"></button></nav><details class="course-reference" ${custom?'open':''}><summary>${custom?'先生の原稿（解説・実践課題）':'文章で全手順をまとめて読む'}</summary><h3>解説</h3><div class="lesson-text">${esc(lesson.explanation)}</div><h3>実践課題</h3><div class="lesson-text">${esc(lesson.practice)}</div></details>`;
 const navigation=container.querySelector('nav'),$=selector=>container.querySelector(selector)||navigation.querySelector(selector);
 const header=mountPageNavigation({container,navigation}),events=new AbortController();
 const on=(el,type,handler)=>el.addEventListener(type,handler,{signal:events.signal});
 const submission=document.getElementById('lsFinalSubmission');$('#robloxSubmissionSlot').append(submission);
 function focusImages(){
  for(const img of $('#robloxCurrentSheet').querySelectorAll('img')){
   const frame=img.closest('.roblox-image-viewport'),meta=ROBLOX_MEDIA[img.closest('[data-media]').dataset.media];
   frame.scrollLeft=Math.max(0,(meta.focusX??0.5)*img.getBoundingClientRect().width-frame.clientWidth/2);
  }
 }
 function stopVideos(){for(const video of $('#robloxCurrentSheet').querySelectorAll('video'))video.pause();}
 function render(){
  stopVideos();const version=++renderVersion,current=source.pages[page-1];container.dataset.page=String(page);
  $('#robloxPageCount').textContent=`${page} / ${count}`;$('#robloxBottomCount').textContent=`教材内 ${page} / ${count}ページ`;$('#robloxPageSelect').value=String(page);
  for(const id of ['#robloxPagePrev','#robloxBottomPrev'])$(id).disabled=page===1;
  for(const id of ['#robloxPageNext','#robloxBottomNext'])$(id).disabled=page===count;
  $('#robloxBottomPrev').textContent=`← 前のページ${page>1?'：'+titles[page-2]:'（最初のページ）'}`;
  $('#robloxBottomNext').textContent=`次のページ →${page<count?'：'+titles[page]:'（最後のページ）'}`;
  $('#robloxCurrentPage').innerHTML=`<span class="pill">${esc(lesson.title)} / 教材内 ${page}ページ</span><span class="roblox-live-goal">${esc(current.goal)}</span>`;
  $('#robloxCurrentSheet').innerHTML=sheet(lesson,page,zoom);$('#robloxImageZoom').disabled=!$('#robloxCurrentSheet img');
  const checks=current.tasks.map(t=>t.expected);
  $('#robloxCurrentCheck').innerHTML=`<span class="pill">教材 ${page}ページに対応</span><h2>このページの学習・進捗チェック</h2><p>${esc(current.title)}</p><ul>${checks.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><h3>記録すること</h3><p>${esc(current.record)}</p><p class="muted tiny">Studioで操作し、結果を記録してから次へ進みます。</p>`;
  submission.hidden=page!==count;
  const images=[...$('#robloxCurrentSheet').querySelectorAll('img')],status=$('#robloxMediaStatus');
  let imageStatus=images.length?'公式画像を読み込み中…':'',videoFailed=false;
  const mediaStatus=()=>{status.textContent=[imageStatus,videoFailed?'動画を再生できませんでした。動画の原本リンクから確認してください。':''].filter(Boolean).join(' ');};mediaStatus();
  $('#robloxCurrentSheet').setAttribute('aria-busy',String(images.length>0));
  Promise.all(images.map(img=>img.decode())).then(()=>{if(version!==renderVersion||!container.isConnected)return;focusImages();imageStatus='';mediaStatus();$('#robloxCurrentSheet').setAttribute('aria-busy','false');}).catch(()=>{if(version!==renderVersion||!container.isConnected)return;imageStatus='画像を読み込めませんでした。ページを選び直すか、各画像の公式出典から確認してください。';mediaStatus();$('#robloxCurrentSheet').setAttribute('aria-busy','false');});
  for(const video of $('#robloxCurrentSheet').querySelectorAll('video')){
   const unavailable=()=>{if(video.isConnected){videoFailed=true;mediaStatus();}};
   on(video,'error',unavailable);for(const source of video.querySelectorAll('source'))on(source,'error',unavailable);
  }
  try{sessionStorage.setItem(key,String(page));}catch{}onPageChange(page);
 }
 function reveal(){const top=$('#robloxCurrentPage').getBoundingClientRect().top+scrollY-header.getBoundingClientRect().bottom-12;window.scrollTo({top:Math.max(0,top),behavior:'instant'});}
 function go(n){if(n<1||n>count)return;page=n;render();reveal();}
 for(const id of ['#robloxPagePrev','#robloxBottomPrev'])on($(id),'click',()=>go(page-1));
 for(const id of ['#robloxPageNext','#robloxBottomNext'])on($(id),'click',()=>go(page+1));
 on(window,'resize',()=>requestAnimationFrame(focusImages));
 on($('#robloxPageSelect'),'change',event=>go(Number(event.target.value)));
 on($('#robloxImageZoom'),'change',event=>{zoom=Number(event.target.value);render();});
 on(container,'click',async event=>{
  const button=event.target.closest('[data-roblox-copy]');if(!button)return;
  try{await navigator.clipboard.writeText(source.pages[page-1].tasks[Number(button.dataset.robloxCopy)].code);button.textContent='コピーしました';}
  catch{$('#robloxMediaStatus').textContent='コピーできませんでした。コード欄を選択してコピーしてください。';}
 });
 on($('#robloxPrint'),'click',async()=>{
  if(printing)return;printing=true;const button=$('#robloxPrint');button.disabled=true;
  const layer=document.createElement('div');layer.id='robloxPrintPages';
  layer.innerHTML=source.pages.map((p,i)=>`<section class="roblox-print-page">${sheet(lesson,i+1,100,true)}${i===count-1?`<section class="roblox-print-question"><h3>確認問題</h3><p>${esc(lesson.question)}</p><div>回答・振り返り</div></section>`:''}</section>`).join('');
  layer.querySelectorAll('details').forEach(details=>details.open=true);document.body.append(layer);
  const cleanup=()=>{layer.remove();printing=false;button.disabled=false;};window.addEventListener('afterprint',cleanup,{once:true,signal:events.signal});
  try{await Promise.all([...layer.querySelectorAll('img')].map(img=>img.decode()));if(!container.isConnected){cleanup();return;}window.print();}
  catch{cleanup();$('#robloxMediaStatus').textContent='印刷用画像を読み込めませんでした。再度お試しください。';}
 });
 render();if(scrollOnEntry||page>1)requestAnimationFrame(reveal);
 const observer=new MutationObserver(()=>{if(!container.isConnected){stopVideos();events.abort();document.getElementById('robloxPrintPages')?.remove();observer.disconnect();}});
 observer.observe(document.getElementById('app'),{childList:true,subtree:true});
}
