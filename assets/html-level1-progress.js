// Page gates are a classroom workflow; Firestore rules remain the access boundary.
export const pageKey=n=>`p${String(n).padStart(2,'0')}`;
export function requiredTask(task,page,index){
  return page===11 || (page===12 ? task.type!=='text'||index===8 : task.type!=='text');
}
export function pageRequirementsMet(record,definition,page){
  return definition.tasks.every((task,index)=>!requiredTask(task,page,index)||record?.results?.[index]===true);
}
export function learningState(work,definitions){
  let stored=work?._learning||{};
  const adjustment=stored.teacherAdjustment;
  if(adjustment?.revision&&adjustment.revision!==stored.teacherRevision){
    stored={...stored,completed:adjustment.completed,currentPage:adjustment.currentPage,
      testSubmitted:adjustment.testSubmitted,teacherRevision:adjustment.revision};
  }
  const completed={},visited={...stored.visited};
  definitions.forEach((definition,index)=>{
    const n=index+1,key=pageKey(n),record=work?.[key];
    completed[key]=stored.teacherRevision&&typeof stored.completed?.[key]==='boolean'?stored.completed[key]:
      stored.completed?.[key]===true||(n!==11&&pageRequirementsMet(record,definition,n));
    if(Object.keys(record?.answers||{}).length||Object.keys(record?.results||{}).length)visited[key]=true;
  });
  // The old UI had a check button rather than an explicit test submission.
  // Preserve a fully answered, checked legacy test once its prerequisites are met.
  const legacyTest=work?.p11;
  const legacySubmitted=!stored.version&&Array.from({length:10},(_,i)=>completed[pageKey(i+1)]).every(Boolean)&&
    definitions[10].tasks.every((task,i)=>typeof legacyTest?.results?.[i]==='boolean'&&
      (task.type==='choice'?legacyTest.answers?.[i]!==undefined&&legacyTest.answers[i]!==''&&
        Number.isInteger(Number(legacyTest.answers[i]))&&Number(legacyTest.answers[i])>=0&&Number(legacyTest.answers[i])<task.options.length:
        String(legacyTest.answers?.[i]||'').trim().length>=2));
  const state={...stored,version:1,completed,visited,testSubmitted:stored.testSubmitted===true||legacySubmitted};
  state.completed.p11=state.testSubmitted;
  state.currentPage=Math.max(1,Math.min(Number.isInteger(stored.currentPage)?stored.currentPage:1,unlockedThrough(state)));
  return state;
}
export function unlockedThrough(state){
  let through=1;
  for(let n=1;n<=10;n++){
    if(!state.completed[pageKey(n)])break;
    through=n+1;
  }
  if(through===11&&state.testSubmitted)through=12;
  return through;
}
export function pageStatus(state,n){
  if(n>unlockedThrough(state))return 'ロック中';
  if(state.completed[pageKey(n)])return '学習済み';
  if(state.visited[pageKey(n)]||state.currentPage===n)return '学習中';
  return '未学習';
}
export function mergeHistory(local,cloud,preferLocal){
  const merged={...cloud,...local};
  for(let n=1;n<=12;n++){
    const key=pageKey(n),a=preferLocal?cloud[key]:local[key],b=preferLocal?local[key]:cloud[key];
    if(!a&&!b)continue;
    merged[key]={...a,...b,answers:{...a?.answers,...b?.answers},results:{...a?.results,...b?.results}};
  }
  const localMeta=local._learning||{},cloudMeta=cloud._learning||{};
  // A teacher adjustment supersedes cached gates, but never removes answers.
  merged._learning=preferLocal?{...cloudMeta,...localMeta}:{...localMeta,...cloudMeta};
  if(preferLocal){
    // Typing during a pending read must not replace cloud completions with the
    // fresh page's default false values. Completions latch until a teacher resets them.
    merged._learning.completed={...cloudMeta.completed,...localMeta.completed};
    for(const [key,value] of Object.entries(cloudMeta.completed||{})){
      if(value===true)merged._learning.completed[key]=true;
    }
    merged._learning.testSubmitted=localMeta.testSubmitted===true||cloudMeta.testSubmitted===true;
    if(cloudMeta.teacherAdjustment?.revision&&cloudMeta.teacherAdjustment.revision!==localMeta.teacherRevision){
      merged._learning={...cloudMeta};
    }
  }
  if(cloudMeta.teacherAdjustment)merged._learning.teacherAdjustment=cloudMeta.teacherAdjustment;
  return merged;
}
