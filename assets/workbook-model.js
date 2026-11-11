export const questionKey=(task,index)=>task.storageKey??String(index);
const codeTests=new Set(['doctype','html','head','body','title','heading','paragraph','h2','list3','link','image','customHeading','customParagraph']);
const text=(value,max,label,empty=false)=>{
  if(typeof value!=='string'||value.length>max||(!empty&&!value.trim()))throw Error(`${label}を確認してください（${max}文字以内）`);
  return value;
};
const id=(value,label)=>{if(typeof value!=='string'||! /^[A-Za-z0-9_-]{1,80}$/.test(value))throw Error(`${label}のIDが不正です`);return value;};
export function validateWorkbook(input){
  if(!input||input.schemaVersion!==1||!Array.isArray(input.pages)||input.pages.length!==12)throw Error('教材はバージョン1・全12ページで指定してください');
  const ids=new Set();
  const pages=input.pages.map((p,index)=>{
    if(p.id!==`p${String(index+1).padStart(2,'0')}`)throw Error('ページIDと順序を変更できません');
    const page={id:p.id,title:text(p.title,100,'学習テーマ'),intro:text(p.intro,2000,'説明',true),editorHint:text(p.editorHint,1000,'エディターヒント',true),sample:text(p.sample||'',10000,'見本コード',true),mode:index===0?'introduction':undefined,
      document:{title:text(p.document?.title,100,'PDFタイトル'),body:text(p.document?.body,6000,'PDF本文'),edited:p.document.edited===true}};
    if(!Array.isArray(p.tasks)||p.tasks.length>30)throw Error('問題は1ページ30項目以内で指定してください');
    const responseKeys=new Set();
    page.tasks=p.tasks.map((q,i)=>{
      const key=id(q.id,'問題');if(ids.has(key))throw Error('問題IDが重複しています');ids.add(key);
      if(!Number.isInteger(q.version)||q.version<1||q.version>1000000)throw Error('問題の版が不正です');
      const storageKey=q.storageKey??`${key}@${q.version}`;
      if(!/^(\d{1,2}|[A-Za-z0-9_-]{1,80}@\d+)$/.test(storageKey))throw Error('回答キーが不正です');
      if(responseKeys.has(storageKey))throw Error('回答キーが重複しています');responseKeys.add(storageKey);
      const task={id:key,version:q.version,storageKey,type:q.type,text:text(q.text,500,'問題文'),required:index===10?true:q.required!==false};
      if(!['choice','text','check','code'].includes(q.type))throw Error('問題形式が不正です');
      if(q.type==='choice'){
        if(!Array.isArray(q.options)||q.options.length<2||q.options.length>6)throw Error('選択肢は2〜6個にしてください');
        task.options=q.options.map(v=>text(v,300,'選択肢'));
        if(!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.options.length)throw Error('正解の番号を確認してください');
        task.correct=q.correct;task.why=text(q.why||'',1000,'解説',true);
      }
      if(q.type==='text')task.hint=text(q.hint||'',500,'記述ヒント',true);
      if(q.type==='code'){
        if(!codeTests.has(q.test))throw Error('コード判定は用意された項目から選んでください');
        task.test=q.test;task.hint=text(q.hint||'',500,'コードヒント',true);
      }
      return task;
    });
    if(index===0&&page.tasks.length)throw Error('1ページ目は導入説明のみです');
    if(index>0&&!page.tasks.some(q=>q.required))throw Error('各ページに必須項目を1つ以上設定してください');
    if(index===10&&(page.tasks.length<10||page.tasks.some(q=>!['choice','text'].includes(q.type))))throw Error('第11ページのテストは選択・記述式で10問以上必要です');
    if(index===0){
      if(!Array.isArray(p.introSections)||p.introSections.length<1||p.introSections.length>6)throw Error('導入の説明を1〜6節指定してください');
      page.introSections=p.introSections.map(s=>({title:text(s.title,100,'導入見出し'),body:text(s.body||'',3000,'導入本文',true),...(s.steps?{steps:s.steps.map(step=>({term:text(step.term,100,'学習段階'),description:text(step.description,1000,'学習段階の説明')}))}:{})}));
    }
    return page;
  });
  if(!Array.isArray(input.finalQuestions)||input.finalQuestions.length<10||input.finalQuestions.length>30)throw Error('最終提出は10〜30問にしてください');
  const finalIds=new Set();
  const finalQuestions=input.finalQuestions.map(q=>{
    const key=id(q.id,'最終提出');if(finalIds.has(key))throw Error('最終提出IDが重複しています');finalIds.add(key);
    if(!Number.isInteger(q.version)||q.version<1)throw Error('最終提出の版が不正です');
    return {id:key,version:q.version,prompt:text(q.prompt,140,'最終提出の問題文'),kind:q.kind==='code'?'code':'text'};
  });
  if(finalQuestions.reduce((total,q,i)=>total+q.prompt.length+String(i+1).length+12,0)>4000)throw Error('最終提出の問題文を短くしてください（回答を含め4000文字以内）');
  return {schemaVersion:1,revision:String(input.revision||'default').slice(0,100),pages,finalQuestions};
}
export function prepareRevision(draft,previous){
  const next=validateWorkbook(draft);
  next.pages.forEach((p,n)=>p.tasks.forEach(q=>{
    const old=previous.pages[n].tasks.find(t=>t.id===q.id);
    if(!old){q.version=1;q.storageKey=`${q.id}@1`;return;}
    const comparable=t=>JSON.stringify(Object.fromEntries(Object.entries(t).filter(([k])=>!['version','storageKey'].includes(k))));
    if(comparable(old)!==comparable(q)){q.version=old.version+1;q.storageKey=`${q.id}@${q.version}`;}
    else{q.version=old.version;q.storageKey=old.storageKey;}
  }));
  next.finalQuestions.forEach(q=>{const old=previous.finalQuestions.find(t=>t.id===q.id);q.version=old?old.version+(old.prompt!==q.prompt||old.kind!==q.kind?1:0):1;});
  next.revision=crypto.randomUUID();return next;
}
