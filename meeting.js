(() => {
 const scene=document.querySelector('.track-scene'),road=scene.querySelector('.road-surface');
 const man=document.getElementById('striped-runner'),woman=document.getElementById('red-runner');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const images={manRun:'striped-runner.svg',manStand:'striped-standing.svg',manControl:'striped-controller.svg',womanRun:'red-runner.png',womanStand:'red-standing.svg',womanWave:'red-waving.svg'};
 for(const actor of [man,woman]){actor.classList.add('meeting-actor');const body=document.createElement('div');body.className='standing-motion';while(actor.firstChild)body.append(actor.firstChild);actor.append(body);}
 function waveArm(x,y,endX,endY,delay){return `<g class="photo-wave-arm" style="transform-origin:${x}px ${y}px;animation-delay:${delay}s"><path d="M${x} ${y} L${endX} ${endY}" fill="none" stroke="#202124" stroke-width="6" stroke-linecap="round"/><g transform="translate(${endX} ${endY})" fill="#e7b18b" stroke="#e7b18b" stroke-width="1.7" stroke-linecap="round"><ellipse cy="-3" rx="5" ry="6"/><path d="M-4 -5L-7 -10M-2 -7L-3 -14M1 -7L2 -14M4 -5L7 -11M-4 0L-8 -3"/></g></g>`;}
 function addWave(el,viewBox,body){if(el.querySelector('.photo-wave'))return;const layer=document.createElement('div');layer.className='photo-wave';layer.setAttribute('aria-hidden','true');layer.innerHTML=`<svg viewBox="${viewBox}">${body}</svg>`;el.append(layer);}
 const button=document.createElement('button');button.type='button';button.className='group-photo-button';button.textContent='yoldapaylaş';
 const toolbar=document.createElement('div');toolbar.className='group-photo-toolbar';toolbar.append(button);document.querySelector('.story-viewport').before(toolbar);
 const status=document.createElement('span');status.className='sr-only';status.setAttribute('role','status');toolbar.append(status);
 const pair=[{el:man,p:0,delay:6.72,waiting:false},{el:woman,p:0,delay:0,waiting:false}];
 let ready=true,last=0,pending=false,shot=null;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 const along=p=>road.getPointAtLength(road.getTotalLength()*Math.max(0,Math.min(1,p)));
 const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
 function move(el,p){el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.opacity='1';}
 function pose(el,standing,src){el.classList.toggle('standing',standing);const img=el.querySelector('img');if(img.getAttribute('src')!==src)img.src=src;}
 function begin(){
  pending=false;window.groupPhotoActive=true;
  pair.forEach(w=>w.delay=0);
  const others=window.photoWalkers.walkers;
  addWave(others[0].el,'0 0 135 202','<path d="M92 121L108 115" fill="none" stroke="#202124" stroke-width="7" stroke-linecap="round"/>'+waveArm(108,115,108,94,0));
  addWave(others[1].el,'0 0 188 188','<path d="M31 90L15 99M158 105L175 101" fill="none" stroke="#202124" stroke-width="7" stroke-linecap="round"/>'+waveArm(15,99,8,78,-.25)+waveArm(175,101,179,80,-.5));
  const friends=window.trioPhoto.walkers;
  friends.forEach((w,i)=>addWave(w.el,'0 0 135 202','<path d="M92 121L108 115" fill="none" stroke="#202124" stroke-width="7" stroke-linecap="round"/>'+waveArm(108,115,108,94,-i*.2)));
  // All eight friends share the frame; preserve each actor's road progress and size.
  const entries=[others[0],pair[0],pair[1],others[1],...friends].map(w=>({w,start:along(w.p),width:w.el.style.width,height:w.el.style.height}));
  entries.forEach(({w})=>{w.el.style.width=w.el.offsetWidth*.78+'px';w.el.style.height=w.el.offsetHeight*.78+'px';});
  entries.forEach(({w})=>w.el.classList.add('meeting-actor','photo-participant'));
  shot={time:0,entries};status.textContent='Herkes drone çekimi için toplanıyor.';
 }
 button.addEventListener('click',()=>{if(pending||shot||!ready)return;pending=true;button.disabled=true;button.setAttribute('aria-busy','true');status.textContent='Drone çekimi hazırlanıyor.';});
 function finish(){
  for(const {w,width,height} of shot.entries){w.el.style.width=width;w.el.style.height=height;w.el.classList.remove('photo-participant','photo-standing','returning');if(!pair.includes(w)){w.el.classList.remove('meeting-actor');w.el.style.left='';w.el.style.top='';}}
  shot=null;window.groupPhotoActive=false;button.disabled=false;button.removeAttribute('aria-busy');status.textContent='Çekim tamamlandı, herkes yola devam ediyor.';
  pose(man,false,images.manRun);pose(woman,false,images.womanRun);
 }
 function drawShot(){
  const t=shot.time,width=scene.clientWidth,y=along(.5).y+85;
  const xs=[.07,.20,.32,.47,.63,.77,.90];
  // The controller owner steps aside first; the rest follow into a single row.
  shot.entries.forEach(({w,start},i)=>{
   const destination={x:width*xs[i],y};const delay=i===1?0:i===2?.65:.4;
   const arrived=t>=delay+2.4;const returning=t>=13.6;
   const p=returning?mix(destination,along(w.p),smooth((t-13.6)/2)):mix(start,destination,smooth((t-delay)/2.4));
   move(w.el,p);w.el.classList.toggle('photo-standing',arrived&&!returning);
   if(w.el===man)pose(man,arrived&&!returning,arrived&&!returning?images.manControl:images.manRun);
   if(w.el===woman)pose(woman,arrived&&!returning,arrived&&!returning?images.womanWave:images.womanRun);
  });
  scene.dataset.meetingStage=t<4?'gathering':t<13.6?'standing':'rejoining';
  window.droneScene.update(motion.matches?-1:t-5,{x:scene.offsetLeft+width*.5,y:scene.offsetTop+y-100},t-2.4);
  if(t>=15.6){finish();window.droneScene.update(-1,{x:0,y:0});}
 }
 function tick(now){
  const dt=last?Math.min(.1,(now-last)/1000):0;last=now;
  if(ready){
   const area=scene.getBoundingClientRect(),visible=area.bottom>0&&area.top<innerHeight;
   if(pending&&!window.photoWalkers.isBusy()&&!window.trioPhoto.isBusy()&&!pair.some(w=>w.waiting))begin();
   if(shot){if(!document.hidden&&visible)shot.time+=dt;drawShot();}
   else{
    scene.dataset.meetingStage='following';
    for(const w of pair){
     if(!document.hidden&&visible&&!motion.matches&&!w.waiting){
      if(w.delay>0)w.delay=Math.max(0,w.delay-dt);
      else {w.p=Math.min(1,w.p+dt/48);if(w.p>=1){w.waiting=true;window.machineVisit(w.el).then(()=>{w.p=0;w.waiting=false;});}}
     }
     move(w.el,along(w.p));w.el.style.opacity=w.delay>0?'0':'1';
    }
   }
  }
  requestAnimationFrame(tick);
 }
 Promise.all(Object.values(images).map(src=>{const img=new Image();img.src=src;return img.decode();})).then(()=>{ready=true;}).catch(console.error);
 requestAnimationFrame(tick);
})();
