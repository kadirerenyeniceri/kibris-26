(() => {
 const scene=document.querySelector('.track-scene'),road=scene.querySelector('.road-surface'),cabinet=scene.querySelector('.destination');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const walkers=['friend-left','friend-middle','friend-front'].map((id,i)=>({el:document.getElementById(id),p:.48-i*.10}));
 walkers.forEach(w=>w.el.classList.add('casino-managed'));
 const {screens,buttons}=window.sharedMachines;
 const hands=document.createElementNS('http://www.w3.org/2000/svg','svg');hands.classList.add('arrival-hand');hands.setAttribute('aria-hidden','true');
 hands.innerHTML='<g><path fill="none" stroke="#202124" stroke-width="6" stroke-linecap="round"/><circle r="5" fill="#edbc91" stroke="#ba805c" stroke-width="1"/></g>';scene.append(hands);hands.style.display='none';
 const staff=document.createElement('div');staff.className='champagne-staff';staff.setAttribute('aria-hidden','true');scene.append(staff);
 const bottle=`<svg viewBox="0 0 80 105"><g transform="rotate(-24 40 60)"><path d="M31 24V9H47V24L54 38V91Q40 99 25 91V38Z" fill="#195638" stroke="#e3b852" stroke-width="2"/><path d="M31 10H47V27H31Z" fill="#e3c06a"/><path d="M26 52H53V77H26Z" fill="#fff1bf"/><path d="M29 58H49M29 65H49" stroke="#ba8633" stroke-width="2"/></g><ellipse cx="49" cy="69" rx="9" ry="7" fill="#edbc91"/></svg>`;
 const servers=Array.from({length:4},(_,i)=>{const el=document.createElement('div');el.className='champagne-server';el.innerHTML=`<img src="waitress.png" alt=""><span class="champagne-bottle">${bottle}</span><span class="champagne-cork"></span><span class="champagne-spray"></span>`;el.style.setProperty('--tilt',i%2?'18deg':'-18deg');staff.append(el);return el;});
 const confetti=document.createElement('div');confetti.className='grand-confetti';confetti.setAttribute('aria-hidden','true');scene.append(confetti);
 let state='running',time=0,last=0,popped=false,ownsMachines=false;
 window.trioPhoto={walkers,isBusy:()=>state!=='running'||walkers.some(w=>w.p>=.82)};
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 const mix=(a,b,t)=>a+(b-a)*t;
 function position(el,x,y){el.style.left=x+'px';el.style.top=y+'px';}
 function stagePoint(i){return{x:scene.clientWidth*(.47+i*.15),y:275};}
 function celebratePoint(i){return{x:scene.clientWidth*(.39+i*.17),y:435};}
 function pop(){
  popped=true;scene.classList.add('champagne-pop');
  for(let i=0;i<76;i++){
   const piece=document.createElement('i');const side=i%2;
   piece.style.left=(side?scene.clientWidth*.93:scene.clientWidth*.08)+'px';piece.style.top='305px';
   piece.style.background=['#ffd469','#fff3cf','#ed627f','#70daca','#b39aff'][i%5];
   piece.style.setProperty('--dx',((side?-1:1)*(60+Math.random()*560))+'px');piece.style.setProperty('--dy',(-120-Math.random()*210)+'px');piece.style.setProperty('--land',(90+Math.random()*150)+'px');piece.style.setProperty('--spin',(Math.random()*1200-600)+'deg');piece.style.animationDelay=(Math.random()*.8)+'s';confetti.append(piece);
  }
 }
 function startWin(){
  state='celebrating';time=0;popped=false;scene.classList.add('grand-winning');
  window.trioJackpot.win();
  window.sharedMachines.release();ownsMachines=false;
 }
 function reset(){
  state='running';time=0;window.trioJackpot.resume();confetti.replaceChildren();scene.classList.remove('grand-winning','champagne-pop');staff.classList.remove('visible');

  walkers.forEach((w,i)=>{w.p=-i*.10;w.el.classList.remove('trio-gathered','trio-waiting','trio-cheering');w.el.style.left='';w.el.style.top='';w.el.style.offsetDistance='0%';w.el.style.opacity='0';});
 }
 function drawHands(){
  const r=scene.getBoundingClientRect(),scale=r.width/scene.clientWidth;
  hands.setAttribute('viewBox',`0 0 ${scene.clientWidth} ${scene.clientHeight}`);hands.style.display=time<.4?'block':'none';
  {
   const w=walkers[1];
   const a=w.el.getBoundingClientRect(),b=buttons[0].getBoundingClientRect();
   const sx=(a.left-r.left+a.width*.84)/scale,sy=(a.top-r.top+a.height*.62)/scale;
   const bx=(b.left-r.left+b.width*.5)/scale,by=(b.top-r.top+b.height*.5)/scale;
   const u=smooth(time/.12),x=mix(sx,bx,u),y=mix(sy,by,u),g=hands.children[0];
   g.querySelector('path').setAttribute('d',`M${sx} ${sy} Q${(sx+x)/2} ${sy-18} ${x} ${y}`);g.querySelector('circle').setAttribute('cx',x);g.querySelector('circle').setAttribute('cy',y);
  }
 }
 function advanceWalkers(dt,duration=48){
  walkers.forEach((w,i)=>{
    w.p=Math.min(1,w.p+dt/duration);
    w.el.style.opacity=String(Math.min(1,Math.max(0,w.p/.025)));
    // Fan out before reaching the machine: each friend goes straight to her own place.
    if(w.p>=.82){
     w.el.classList.add('trio-gathered');
     const start=road.getPointAtLength(road.getTotalLength()*.82),end=stagePoint(i),u=smooth((w.p-.82)/.18);
     position(w.el,mix(start.x,end.x,u),mix(start.y,end.y,u));
    }else{w.el.style.offsetDistance=Math.max(0,w.p)*100+'%';}
    w.el.classList.toggle('trio-waiting',w.p>=1);
   });
 }
 function draw(dt){
  scene.dataset.trioStage=state;
  if(state==='running'){
   advanceWalkers(dt);
   if(walkers[1].p>=.82)ownsMachines=window.sharedMachines.reserve();
   if(walkers[1].p>=1&&ownsMachines){state='pressing';time=0;}
  }else if(state==='pressing'){
   advanceWalkers(dt,24);drawHands();
   buttons.forEach((b,i)=>b.classList.toggle('pressed',i===0&&time>=.12&&time<.4));
   screens.forEach((s,i)=>{s.classList.toggle('rolling',time>=.12&&time<2.65);s.classList.toggle('finished',time>=2.65);[...s.children].forEach((r,j)=>r.textContent=time>=2.65?'7':['🍒','7','🍋','🔔'][Math.floor(time*12+j+i)%4]);});
   if(time>=3){hands.style.display='none';startWin();}
  }else if(state==='celebrating'){
   staff.classList.add('visible');const u=smooth(time/1.4);
   walkers.forEach((w,i)=>{const a=stagePoint(i),b=celebratePoint(i);position(w.el,mix(a.x,b.x,u),mix(a.y,b.y,u));w.el.classList.add('trio-cheering');});
   servers.forEach((el,i)=>{const x=scene.clientWidth*[.18,.35,.63,.87][i];position(el,mix(i<2?-100:scene.clientWidth+100,x,u),310);el.classList.toggle('arrived',time>=1.4);});
   if(time>=1.65&&!popped)pop();
   if(time>=9){servers.forEach((el,i)=>{const x=scene.clientWidth*[.18,.35,.63,.87][i];position(el,mix(x,i<2?-100:scene.clientWidth+100,smooth((time-9)/1.2)),310);});}
   if(time>=10.2)reset();
  }
 }
 function tick(now){const dt=last?Math.min(.08,(now-last)/1000):0;last=now;const rect=scene.getBoundingClientRect();if(!window.groupPhotoActive&&!motion.matches&&!document.hidden&&rect.bottom>0&&rect.top<innerHeight){time+=dt;draw(dt);}requestAnimationFrame(tick);}
 requestAnimationFrame(tick);
})();
