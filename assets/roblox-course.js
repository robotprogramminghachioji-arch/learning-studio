import {ROBLOX_COURSE,ROBLOX_PREVIOUS_TEXT} from './roblox-course-data.js?v=b9519c53799c';
export {ROBLOX_COURSE};
export const robloxLesson=id=>ROBLOX_COURSE.lessons.find(lesson=>lesson.id===id);
// Upgrade only exact previous standard fields, at read time. Teacher edits,
// publication flags, IDs and existing submissions stay in Firestore unchanged.
export function refreshRobloxText(remote){
 const current=robloxLesson(remote.id),previous=ROBLOX_PREVIOUS_TEXT[remote.id];
 if(!current||!previous)return remote;
 const next={...remote};
 for(const field of ['title','goal','explanation','practice','question','duration']){
  if(field==='question'&&(remote.options||[]).length)continue;
  if(remote[field]===previous[field])next[field]=current[field];
 }
 return next;
}
export function robloxLessonData(entry){
 const {id,course,level,order,title,goal,explanation,practice,question,duration,options,imageUrl,imageCaption,videoUrl,pdfUrl}=entry;
 return {id,course,level,order,title,goal,explanation,practice,question,duration,options,imageUrl,imageCaption,videoUrl,pdfUrl,published:false};
}
export function withRobloxTemplates(remote){
 const ids=new Set(remote.map(lesson=>lesson.id));
 return [...remote.map(refreshRobloxText),...ROBLOX_COURSE.lessons.filter(lesson=>!ids.has(lesson.id)).map(lesson=>({...robloxLessonData(lesson),_template:true}))];
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function robloxLevelIntro(){
 return `<div class="web-level-intro"><span class="pill">公式Classic Obbyを改造 / 全8教材 / 各75分・合計10時間</span><h2>見本を遊び、足場と仕掛けを作って確かめる</h2><p>公式の「Get started → Work with parts → AI Assistant → Test and save」に沿って進めます。自分で追加した周回コースを作り、触れると光る仕掛けを付け、テストと改善を行います。</p><p>各教材は4つの実習ページです。各ページでStudioを操作し、画像の見る場所、操作後の結果、比較実験、記録することを確認します。制作はWindows／MacのRoblox Studio、スマホは手順の閲覧に使います。</p><p class="notice">教材を改訂しました。以前のBaseplate作品は別名で保管し、第1回の公式見本から新しい制作ファイルを用意してください。登録済みの標準文は新版で表示し、先生の独自編集と提出履歴は保持します。</p><details><summary>LEVEL1の8回と次の学習予定</summary><ol>${ROBLOX_COURSE.lessons.map(l=>`<li>${esc(l.title)}（75分）</li>`).join('')}</ol><p>LEVEL2：Luauの読み書き、LEVEL3：動く仕掛け、LEVEL4：GUI・通信、LEVEL5：オリジナルゲームと発表へ進む予定です。今回はLEVEL1の8教材です。</p></details></div>`;
}
export function robloxLessonIntro(lesson){
 const source=robloxLesson(lesson.id);if(!source)return '';
 return `<div class="web-lesson-meta"><p><strong>目安：</strong>${esc(lesson.duration||'75分')} ／ 全${source.pages.length}実習ページ ／ 制作はPCのRoblox Studio</p><p><strong>今回の制作：</strong>${esc(source.project)}</p>${lesson._template?'<p class="notice">先生用見本です。管理画面から非公開登録し、確認後に公開すると、Robloxを受講できる生徒の一覧に表示されます。</p>':''}</div>`;
}
