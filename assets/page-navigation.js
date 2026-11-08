// A single fixed header owns both account controls and optional workbook controls.
let headerController=null,disposePrevious=null;

export function initializeHeader(){
  if(headerController)return headerController.header;
  const header=document.getElementById('lsHeader');
  if(!header)return null;
  const root=document.documentElement;
  const update=()=>{
    header.style.top=`${window.visualViewport?.offsetTop||0}px`;
    const rect=header.getBoundingClientRect();
    root.style.setProperty('--ls-header-height',`${rect.height}px`);
    root.style.setProperty('--ls-header-bottom',`${rect.bottom}px`);
  };
  const observer=new ResizeObserver(update);
  observer.observe(header);
  window.addEventListener('resize',update);
  for(const type of ['resize','scroll'])window.visualViewport?.addEventListener(type,update);
  headerController={header,update};
  update();
  return header;
}

export function mountPageNavigation({container,navigation}){
  disposePrevious?.();
  const header=initializeHeader(),host=document.getElementById('lsLessonNavigation');
  const root=document.documentElement;
  host.append(navigation);host.hidden=false;
  root.classList.add('hl1-navigation-active');
  headerController.update();
  const lifecycle=new MutationObserver(()=>{if(!container.isConnected)dispose();});
  lifecycle.observe(document.getElementById('app'),{childList:true,subtree:true});
  function dispose(){
    lifecycle.disconnect();navigation.remove();
    host.hidden=true;root.classList.remove('hl1-navigation-active');
    headerController.update();
    if(disposePrevious===dispose)disposePrevious=null;
  }
  disposePrevious=dispose;
  return header;
}
