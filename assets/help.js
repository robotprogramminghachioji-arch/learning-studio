// Keep the lesson DOM and its unsaved drafts mounted while help is visible.
const helpLink=document.getElementById('lsHelp');
const dialog=document.createElement('dialog');
dialog.id='lsHelpDialog';dialog.className='ls-help-dialog';
dialog.setAttribute('aria-label','先生向けヘルプ');
dialog.innerHTML='<div class="ls-help-toolbar"><strong>ヘルプ</strong><button type="button" id="lsHelpClose">教材に戻る</button></div><div id="lsHelpContent" class="help-page" tabindex="0"><p role="status">手順書を読み込み中…</p></div>';
document.body.append(dialog);
const content=dialog.querySelector('#lsHelpContent');
let loaded=false;
helpLink.addEventListener('click',async event=>{
  event.preventDefault();dialog.showModal();document.documentElement.classList.add('ls-help-open');
  dialog.querySelector('button').focus();
  if(loaded)return;
  try{
    const response=await fetch(helpLink.href,{cache:'no-cache'});if(!response.ok)throw Error('load');
    const doc=new DOMParser().parseFromString(await response.text(),'text/html');
    const main=doc.querySelector('main');main.querySelector('a[href="index.html"]')?.closest('p').remove();
    content.replaceChildren(doc.querySelector('header'),main);loaded=true;
  }catch{content.innerHTML='<p role="alert">手順書を読み込めませんでした。通信を確認して、ヘルプを開き直してください。</p>';}
});
content.addEventListener('click',event=>{
  const a=event.target.closest('a[href^="#"]');if(!a)return;
  event.preventDefault();content.querySelector(a.getAttribute('href'))?.scrollIntoView({block:'start'});
});
dialog.querySelector('button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.documentElement.classList.remove('ls-help-open');helpLink.focus({preventScroll:true});});
