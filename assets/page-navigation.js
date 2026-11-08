// Reserve a viewport band for the controls for as long as this lesson is open.
let disposePrevious=null;

export function mountPageNavigation({container,navigation}) {
  disposePrevious?.();
  const root=document.documentElement;
  const properties=['--hl1-navigation-height','--hl1-navigation-bottom'];
  const previous=properties.map(name=>[name,root.style.getPropertyValue(name),root.style.getPropertyPriority(name)]);
  const wasActive=root.classList.contains('hl1-navigation-active');
  const events=new AbortController();
  const update=()=>{
    navigation.style.top=`${window.visualViewport?.offsetTop||0}px`;
    const rect=navigation.getBoundingClientRect();
    root.style.setProperty('--hl1-navigation-height',`${rect.height}px`);
    root.style.setProperty('--hl1-navigation-bottom',`${rect.bottom}px`);
  };
  root.classList.add('hl1-navigation-active');
  const resizeObserver=new ResizeObserver(update);
  resizeObserver.observe(navigation);
  window.addEventListener('resize',update,{signal:events.signal});
  for(const type of ['resize','scroll'])window.visualViewport?.addEventListener(type,update,{signal:events.signal});
  const lifecycle=new MutationObserver(()=>{if(!container.isConnected)dispose();});
  lifecycle.observe(document.getElementById('app'),{childList:true,subtree:true});
  function dispose(){
    events.abort();resizeObserver.disconnect();lifecycle.disconnect();
    root.classList.toggle('hl1-navigation-active',wasActive);
    for(const [name,value,priority] of previous){
      if(value)root.style.setProperty(name,value,priority);else root.style.removeProperty(name);
    }
    if(disposePrevious===dispose)disposePrevious=null;
  }
  disposePrevious=dispose;
  update();
}
