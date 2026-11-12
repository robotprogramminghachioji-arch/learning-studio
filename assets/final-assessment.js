import {addDoc,collection,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {DEFAULT_WORKBOOK} from './workbook-defaults.js?v=95ab371178ef';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountFinalAssessment({container,lesson,student,uid,db,canSubmit}){
  let questions=DEFAULT_WORKBOOK.finalQuestions,saving=false;
  const key=`ls-final-assessment:${uid}:${lesson.id}`;let answers={};try{answers=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
  const storage=q=>`${q.id}@${q.version}`;
  function cache(){try{localStorage.setItem(key,JSON.stringify(answers));}catch{container.querySelector('#submitMsg').textContent='端末に一時保存できません。送信前に回答を控えてください。';}}
  function render(){
    container.innerHTML=`<h2>レッスン全体の最終提出（${questions.length}問）</h2><p>第11ページのテストを終えたら、学んだことを自分の言葉やコードで説明してください。先生が採点します。全問必須、回答と問題文の合計は4000文字以内です。</p><form id="submitTest">${questions.map((q,i)=>`<label class="final-question">${i+1}. ${esc(q.prompt)}<textarea name="${esc(storage(q))}" data-final-id="${esc(q.id)}" maxlength="300" rows="3" required spellcheck="false" class="${q.kind==='code'?'final-code':''}">${esc(answers[storage(q)]||'')}</textarea></label>`).join('')}<button type="submit">全${questions.length}問の回答を提出する</button></form><div id="submitMsg" role="status"></div>`;
    const form=container.querySelector('form'),status=container.querySelector('#submitMsg');
    form.addEventListener('input',event=>{if(event.target.name){answers[event.target.name]=event.target.value;cache();}});
    form.onsubmit=async event=>{
      event.preventDefault();if(saving)return;
      if(!student){status.textContent='先生プレビューでは提出できません。';return;}
      if(!canSubmit()){status.textContent='第11ページの最終確認テストを先に提出してください。';return;}
      const data=new FormData(form),rows=questions.map((q,i)=>({q,answer:String(data.get(storage(q))||'').trim(),i}));
      if(rows.some(row=>row.answer.length<2)){status.textContent='全問に2文字以上で回答してください。';return;}
      const response=rows.map(({q,answer,i})=>`${i+1}. ${q.prompt}\n回答：${answer}`).join('\n\n');
      if(response.length>4000){status.textContent='問題文と回答の合計が4000文字を超えています。回答を短くしてください。';return;}
      saving=true;form.querySelector('button').disabled=true;status.textContent='回答を提出中…';cache();
      try{
        // Keep the existing submission fields; prompts are included in response so
        // teacher edits cannot change the meaning of an already-submitted answer.
        await addDoc(collection(db,'submissions'),{studentId:student.id,lessonId:lesson.id,response,kind:'test',status:'pending',createdAt:serverTimestamp()});
        status.textContent=`全${questions.length}問の回答を保存しました。先生の採点をお待ちください。`;
      }catch(err){status.textContent=`提出できませんでした。回答はそのまま残っています：${err.code||err.message}`;}
      finally{saving=false;form.querySelector('button').disabled=false;}
    };
  }
  render();return {setQuestions(next){questions=next;render();}};
}
