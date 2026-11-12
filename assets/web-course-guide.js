import {WEB_GUIDES} from './web-course-guide-data.js?v=d3ba59d3cf5c';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const beginnerGuide=id=>WEB_GUIDES[id];
const steps=items=>`<ol class="course-guide-steps">${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ol>`;
const box=(title,body,kind='')=>`<section class="course-beginner-guide ${kind}"><h3>${esc(title)}</h3>${body}</section>`;
export function guidePageHtml(lesson,page,visual){
 const guide=beginnerGuide(lesson.id);if(!guide)return '';
 if(page===1)return box('まず、何をする教材？',`<p>${esc(guide.start)}</p>`)+box('エディターと教材の使い方',steps([
  '画面右下の「エディターを開く」を押します。コードを書くための小窓が開きます。',
  'HTML・CSS・JavaScriptのタブで編集する場所を選びます。プレビューは、コードを実行した結果を見る場所です。',
  'コードを変えたら「プレビューを更新」を押します。スマホでは小窓の中を下へスクロールして、プレビューを見ます。更新するとゲームは最初から始まります。',
  '小窓の「最小化」で教材へ戻れます。教材は上か下の「次のページ」で進みます。小窓の最小化や教材のページ移動だけではコードは消えません。'
 ]),'course-editor-guide');
 if(page===2)return box('言葉とコードを、例で読もう',`<dl class="course-guide-terms">${guide.terms.map(term=>`<div><dt>${esc(term.word)}</dt><dd>${esc(term.meaning)}</dd></div>`).join('')}</dl>`);
 if(page===3){
  const reading=visual.change.before===visual.change.after;
  return box('どのタブの、どこを見る？',`<p><span class="pill">${esc(visual.change.language)}タブ</span></p><p>${esc(guide.locate)}</p><p>${esc(guide.reason)}</p>`)+box(reading?'今回は書き換えず、動きを確かめよう':'1か所ずつ変える手順',steps(reading?[
   `${visual.change.language}タブで、上の図と同じコードを探します。変更前後が同じなので、この部分の書き換えは不要です。`,
   '4ページ目の操作を行い、処理と画面の変化を比べます。分からない単語は2ページ目で読み直します。'
  ]:[
   `${visual.change.language}タブで図の「変更前」と同じ部分を探します。ほかの場所までまとめて消さず、示した文字や数字だけを変えます。`,
   '図の「変更後」と見比べ、半角の括弧・引用符・記号が残っているか確認します。「プレビューを更新」を押して反映します。',
   `プレビューで操作し、「${visual.change.expected}」という結果になるか確かめます。4ページ目には基本課題と実験の詳しい手順があります。`
  ]));
 }
 if(page===4)return box('予想して比べる：実験の詳しい手順',guide.experiments.map((e,i)=>`<details class="course-guide-experiment" ${i===0?'open':''}><summary>実験${i+1}｜${esc(e.title)}</summary><div><h4>操作する前に予想</h4><p>${esc(e.predict)}</p><h4>やってみよう</h4>${steps(e.steps)}${e.example?`<p class="course-example-label">入力するコードの例（説明にある場所へ追加）</p><pre class="course-guide-code"><code>${esc(e.example)}</code></pre>`:''}<h4>確かめる結果と理由</h4><p>${esc(e.result)}</p></div></details>`).join(''));
 return box('困ったときは、ここを確認',`<p><strong>${esc(guide.trouble.symptom)}</strong></p><p>${esc(guide.trouble.check)}</p>`)+box('保存して、確認問題へ答えよう',steps([
  'エディターの「学習内容を保存」を押し、成功表示を確認します。先生プレビューでは学習記録を保存しません。',
  '「HTMLを保存」は、作品を端末用のindex.htmlとしてダウンロードする操作です。クラウドへの学習コード保存とは別です。',
  'エディターを最小化し、右側（スマホはこの下）の確認問題を読みます。予想・変えた場所・実際の結果を書いて「回答を提出する」を押します。'
 ])+`<p class="course-guide-report"><strong>この教材で振り返ること：</strong>${esc(guide.report)}</p><p>回答の書き出し例：「わたしは＿＿を変えました。＿＿と予想しました。実際に＿＿をすると＿＿でした。理由は＿＿です。」実際に試した結果を自分の言葉で続けましょう。</p>`);
}
