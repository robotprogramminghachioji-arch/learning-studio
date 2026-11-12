import {WEB_COURSE} from './web-course-data.js?v=3a5afb671b84';
import {PREVIOUS_WEB_TEXT} from './web-course-guide-data.js?v=d3ba59d3cf5c';
export {WEB_COURSE};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const foundationLesson=id=>WEB_COURSE.lessons.find(l=>l.id===id);
export function courseLessonData(entry){
  const {teacherGuide,...lesson}=entry;
  return {...lesson,published:false};
}
export function withCourseTemplates(remote){
  const ids=new Set(remote.map(l=>l.id));
  return [...remote.map(refreshCourseText),...WEB_COURSE.lessons.filter(l=>!ids.has(l.id)).map(l=>({...courseLessonData(l),_template:true}))];
}
// Display revised stock text for already registered lessons. Exact equality
// preserves every teacher edit; this performs no Firestore writes.
export function refreshCourseText(lesson){
  const previous=PREVIOUS_WEB_TEXT[lesson.id],current=foundationLesson(lesson.id);
  if(!previous||!current)return lesson;
  const updated={...lesson};
  for(const field of ['explanation','practice'])if(lesson[field]===previous[field])updated[field]=current[field];
  return updated;
}
export function roadmapHtml(){
  return `<section class="panel web-roadmap-intro"><span class="pill">Web開発の学習ロードマップ</span><h1>ゲームから、Webサービスを作る開発者へ</h1><p>Web開発は<strong>コース①〜③、それぞれLEVEL1〜5</strong>の構成です。①でブラウザ上の作品づくり、②で実用アプリ、③でチーム開発と運用へ進みます。</p><p>①の修了だけで仕事に必要なすべてを扱うわけではありません。「仕様を考え、調べ、不具合を直し、安全に公開して改善できる」力を段階的に育てます。</p><p>コース①は${esc(WEB_COURSE.duration)}。基本課題を優先し、時間が足りない日は追加の改造を次回へ回せます。受講時間は目安で、制作や復習によって変わります。コース①の教材は先生が確認後に生徒向けに公開します。</p></section>`+
    WEB_COURSE.roadmap.map(c=>`<section class="panel web-roadmap-course"><span class="pill">${esc(c.status)}</span><h2>Web開発コース${esc(c.number)}：${esc(c.title)}</h2><p><strong>対象：</strong>${esc(c.audience)}</p><p><strong>到達目標：</strong>${esc(c.outcome)}</p><ol class="web-roadmap-levels">${c.levels.map(l=>`<li><strong>LEVEL${l.level}｜${esc(l.title)}</strong><p>${esc(l.content)}</p>${c.number==='①'?`<button class="ghost" data-web-level="${l.level}">LEVEL${l.level}の教材へ</button>`:''}</li>`).join('')}</ol>${c.number!=='①'?'<p class="muted">このコースは学習予定の説明です。受講用の教材は今後追加します。</p>':''}</section>`).join('');
}
export function levelIntro(level){
  const info=WEB_COURSE.levels.find(l=>l.level===Number(level));
  return info?`<div class="web-level-intro"><span class="pill">${WEB_COURSE.lessons.filter(l=>l.level===info.level).length}教材 / 目安${esc(info.duration)}</span><h2>${esc(info.title)}</h2><p>${esc(info.goal)}</p><p><strong>前提：</strong>${esc(info.prerequisite)}<br><strong>完成する作品：</strong>${esc(info.project)}</p></div>`:'';
}
export function lessonIntro(lesson){
  const source=foundationLesson(lesson.id);if(!source)return '';
  return `<div class="web-lesson-meta"><p><strong>目安時間：</strong>${esc(lesson.duration||source.duration)} ／ <strong>前提：</strong>${esc(lesson.prerequisite||source.prerequisite)}</p><p>見本を見る → 言葉としくみを知る → 1か所ずつ変える → 動きを確かめる → 結果を振り返る、の順に進めます。</p>${lesson._template?'<p class="notice">先生用の教材見本です。生徒が受講するには「先生用管理」から教材を登録し、確認後に公開してください。</p>':''}<div class="actions"><button type="button" data-course-practice>フローティングエディターを開く</button><button class="ghost" type="button" data-course-check>確認問題へ</button><button class="ghost" type="button" data-web-roadmap>コース①〜③の構成を見る</button></div></div>`;
}
