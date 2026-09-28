(() => {
 const scene=document.querySelector('.track-scene'),cabinet=scene.querySelector('.destination');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const screens=[],buttons=[];
 for(let i=0;i<2;i++){
  const screen=document.createElement('div');screen.className=`arrival-reels machine-${i}`;screen.setAttribute("aria-hidden","true");
  for(let j=0;j<3;j++){const reel=document.createElement('span');reel.textContent=['🍒','7','🍋'][j];screen.append(reel);}
  const button=document.createElement('span');button.className=`arrival-button machine-${i}`;
  cabinet.append(screen,button);screens.push(screen);buttons.push(button);
 }
 const hand=document.createElementNS('http://www.w3.org/2000/svg','svg');hand.classList.add('arrival-hand');hand.setAttribute('aria-hidden','true');
 hand.innerHTML='<path fill="none" stroke="#202124" stroke-width="6" stroke-linecap="round"/><circle r="5" fill="#edbc91" stroke="#ba805c" stroke-width="1"/>';
 scene.append(hand);hand.style.display='none';
 const queue=[];let active=null,last=0,serial=0,reserved=false;
 window.sharedMachines={screens,buttons,reserve(){reserved=true;return !active;},release(){reserved=false;}};
 const symbols=['🍒','7','🍋','🔔','🍊'];
 window.machineVisit=actor=>new Promise(resolve=>{
  actor.dataset.machineWaiting='true';queue.push({actor,resolve,round:0,count:Number(actor.dataset.characters||1)});
 });
 function finish(){
  active.actor.classList.remove('at-machine');active.actor.dataset.machineWaiting='false';active.resolve();active=null;
  hand.style.display='none';screens.forEach(s=>s.classList.remove('rolling','finished'));buttons.forEach(b=>b.classList.remove('pressed'));
 }
 function tick(now){
  const dt=last?Math.min(80,now-last):0;last=now;
  if(!document.hidden&&!motion.matches){
   if(!reserved&&!active&&queue.length){active=queue.shift();active.time=0;active.slot=serial++%2;active.actor.classList.add('at-machine');}
   if(active){
    active.time+=dt;const t=active.time,i=active.slot,screen=screens[i];
    const r=scene.getBoundingClientRect(),scale=r.width/scene.clientWidth,a=active.actor.getBoundingClientRect(),b=buttons[i].getBoundingClientRect();
    const paired=active.count===2,relativeX=paired?(active.round===0?.45:.9):.88;
    const sx=(a.left-r.left+a.width*relativeX)/scale,sy=(a.top-r.top+a.height*.61)/scale;
    const bx=(b.left-r.left+b.width*.5)/scale,by=(b.top-r.top+b.height*.5)/scale;
    const u=Math.min(1,t/450),x=sx+(bx-sx)*u,y=sy+(by-sy)*u;
    hand.setAttribute('viewBox',`0 0 ${scene.clientWidth} ${scene.clientHeight}`);
    hand.style.display=t<900?'block':'none';hand.querySelector('path').setAttribute('d',`M ${sx} ${sy} Q ${(sx+x)*.5} ${sy+12} ${x} ${y}`);
    hand.querySelector('circle').setAttribute('cx',x);hand.querySelector('circle').setAttribute('cy',y);
    buttons[i].classList.toggle('pressed',t>=450&&t<850);
    screen.classList.toggle('rolling',t>=500&&t<2000);screen.classList.toggle('finished',t>=2000);
    if(t>=500&&t<2000)[...screen.children].forEach((reel,j)=>reel.textContent=symbols[(Math.floor(t/(85+j*17))+j)%symbols.length]);
    if(t>=2000)[...screen.children].forEach((reel,j)=>reel.textContent=['🍒','🔔','7'][(j+active.round)%3]);
    if(t>=2600){
     screen.classList.remove('rolling','finished');buttons[i].classList.remove('pressed');
     if(++active.round<active.count){active.time=0;active.slot=1-active.slot;}
     else finish();
    }
   }
  }
  requestAnimationFrame(tick);
 }
 // The other runners stop for their turn, then restart at the first point.
 const walkers=[['runner',.84],['money-runner',.64]].map(([id,p])=>({el:document.getElementById(id),p,waiting:false}));
 walkers.forEach(w=>w.el.classList.add('casino-managed'));
 window.photoWalkers={walkers,isBusy:()=>!!active||queue.length>0||reserved};
 let previous=0;
 function walk(now){
  const dt=previous?Math.min(.1,(now-previous)/1000):0;previous=now;
  for(const w of walkers){
   if(!window.groupPhotoActive&&!document.hidden&&!motion.matches&&!w.waiting){w.p=Math.min(1,w.p+dt/48);if(w.p>=1){w.waiting=true;window.machineVisit(w.el).then(()=>{w.p=0;w.waiting=false;});}}
   w.el.style.offsetDistance=`${w.p*100}%`;w.el.style.opacity=String(Math.min(1,w.p/.025));
  }
  requestAnimationFrame(walk);
 }
 requestAnimationFrame(tick);requestAnimationFrame(walk);
})();
