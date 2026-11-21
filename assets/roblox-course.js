import {ROBLOX_COURSE} from './roblox-course-data.js?v=2accacdfab74';
export {ROBLOX_COURSE};
export const robloxLesson=id=>ROBLOX_COURSE.lessons.find(lesson=>lesson.id===id);
export function robloxLessonData(entry){
 const {id,course,level,order,title,goal,explanation,practice,question,duration,options,imageUrl,imageCaption,videoUrl,pdfUrl}=entry;
 return {id,course,level,order,title,goal,explanation,practice,question,duration,options,imageUrl,imageCaption,videoUrl,pdfUrl,published:false};
}
export function withRobloxTemplates(remote){
 const ids=new Set(remote.map(lesson=>lesson.id));
 return [...remote,...ROBLOX_COURSE.lessons.filter(lesson=>!ids.has(lesson.id)).map(lesson=>({...robloxLessonData(lesson),_template:true}))];
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function robloxLevelIntro(){
 return `<div class="web-level-intro"><span class="pill">全8教材 / 各75分 / 合計10時間</span><h2>Studioを操作して、最初のゲームを作る</h2><p>第1回は公式の見本で操作を試し、第2回から自分のオビー（足場をジャンプして進むゲーム）を作ります。第3〜8回は保存した作品を開いて続きを制作します。</p><p>制作にはWindowsまたはMacのRoblox Studioを使います。この画面は画像・動画付きの手順書です。スマホでは教材を読み、制作はPCで進めてください。</p><details><summary>LEVEL1の8回と、次の学習予定</summary><ol>${ROBLOX_COURSE.lessons.map(l=>`<li>${esc(l.title)}（75分）</li>`).join('')}</ol><p>LEVEL2：短いLuauコード、LEVEL3：触れる・動く仕掛け、LEVEL4：コイン・GUI・通信、LEVEL5：オリジナルゲームの制作と発表へ進む予定です。今回はLEVEL1の8教材を用意しています。</p></details></div>`;
}
export function robloxLessonIntro(lesson){
 if(!robloxLesson(lesson.id))return '';
 return `<div class="web-lesson-meta"><p><strong>目安時間：</strong>${esc(lesson.duration||'75分')} ／ <strong>制作場所：</strong>PCのRoblox Studio</p><p>完成目標を読む → 道具を知る → Studioで操作する → 予想と結果を比べる → 保存・振り返り、の順に進めます。</p>${lesson._template?'<p class="notice">先生用の教材見本です。管理画面から非公開で登録し、確認後に公開すると、Robloxを受講できる生徒の一覧に表示されます。</p>':''}</div>`;
}
