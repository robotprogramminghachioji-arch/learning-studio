// Keep the editor mounted while moving, resizing or hiding its window.
export function mountFloatingEditor({container, windowEl, openButton}) {
  const titlebar=windowEl.querySelector('[data-window-move]');
  const resizeHandle=windowEl.querySelector('[data-window-resize]');
  const minimize=windowEl.querySelector('[data-window-minimize]');
  const reset=windowEl.querySelector('[data-window-reset]');
  const events=new AbortController();
  const on=(el,type,handler)=>el.addEventListener(type,handler,{signal:events.signal});
  let bounds=null, gesture=null;
  const viewport=()=>({
    left:window.visualViewport?.offsetLeft||0,
    top:window.visualViewport?.offsetTop||0,
    width:window.visualViewport?.width||window.innerWidth,
    height:window.visualViewport?.height||window.innerHeight
  });
  function place(next=bounds) {
    const v=viewport(), margin=8;
    const maxWidth=Math.max(0,v.width-margin*2), maxHeight=Math.max(0,v.height-margin*2);
    const width=Math.min(maxWidth,Math.max(Math.min(320,maxWidth),next.width));
    const height=Math.min(maxHeight,Math.max(Math.min(240,maxHeight),next.height));
    bounds={width,height,
      left:Math.max(v.left+margin,Math.min(next.left,v.left+v.width-width-margin)),
      top:Math.max(v.top+margin,Math.min(next.top,v.top+v.height-height-margin))};
    Object.assign(windowEl.style,{
      width:`${width}px`,height:`${height}px`,left:`${bounds.left}px`,top:`${bounds.top}px`
    });
  }
  function resetPosition() {
    const v=viewport();
    const width=Math.min(720,v.width-16), height=Math.min(540,v.height*.65);
    place({width,height,left:v.left+v.width-width-16,top:v.top+v.height-height-16});
  }
  function show() {
    windowEl.hidden=false;openButton.setAttribute('aria-expanded','true');
    openButton.textContent='💻 エディターを表示';
    place();titlebar.focus({preventScroll:true});
  }
  function hide() {
    windowEl.hidden=true;openButton.setAttribute('aria-expanded','false');
    openButton.textContent='💻 エディターを開く';openButton.focus({preventScroll:true});
  }
  function finishGesture() {
    if(!gesture)return;
    const {handle,id}=gesture;gesture=null;
    if(handle.hasPointerCapture(id))handle.releasePointerCapture(id);
    windowEl.classList.remove('hl1-window-moving');
  }
  for(const [handle,mode] of [[titlebar,'move'],[resizeHandle,'resize']]) {
    on(handle,'pointerdown',event=>{
      if(event.button!==0||(event.target.closest('button')&&event.target.closest('button')!==handle))return;
      event.preventDefault();handle.focus({preventScroll:true});
      gesture={handle,mode,id:event.pointerId,x:event.clientX,y:event.clientY,start:{...bounds}};
      handle.setPointerCapture(event.pointerId);
      windowEl.classList.add('hl1-window-moving');
    });
    on(handle,'pointermove',event=>{
      if(!gesture||gesture.id!==event.pointerId)return;
      const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y,{start}=gesture;
      place(gesture.mode==='move'?{...start,left:start.left+dx,top:start.top+dy}:
        {...start,width:start.width+dx,height:start.height+dy});
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])on(handle,type,finishGesture);
    on(handle,'keydown',event=>{
      if(event.target!==handle||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
      event.preventDefault();const step=event.shiftKey?40:10;
      const dx=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0;
      const dy=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0;
      place(mode==='move'?{...bounds,left:bounds.left+dx,top:bounds.top+dy}:
        {...bounds,width:bounds.width+dx,height:bounds.height+dy});
    });
  }
  on(openButton,'click',show);on(minimize,'click',hide);on(reset,'click',resetPosition);
  on(windowEl,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();hide();}});
  on(window,'resize',()=>place());
  if(window.visualViewport){
    on(window.visualViewport,'resize',()=>place());
    on(window.visualViewport,'scroll',()=>place());
  }
  resetPosition();openButton.setAttribute('aria-expanded','true');
  // In-app navigation may remove the entire lesson panel.
  const appObserver=new MutationObserver(()=>{
    if(!container.isConnected){finishGesture();events.abort();appObserver.disconnect();}
  });
  appObserver.observe(document.getElementById('app'),{childList:true,subtree:true});
  return {show};
}
