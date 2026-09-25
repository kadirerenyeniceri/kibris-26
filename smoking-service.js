(() => {
  const actor = document.querySelector('#money-runner');
  const sprite = actor.querySelector('.couple-sprite > img');
  const layer = document.querySelector('#service-layer');
  const waiter = document.querySelector('#service-waitress').cloneNode(true);
  waiter.id = 'smoking-waitress';
  const tray = document.createElement('div');
  tray.className = 'cigarette-tray';
  const cigarette = document.createElement('div');
  cigarette.className = 'served-cigarette';
  cigarette.innerHTML = '<i class="cigarette-filter"></i><i class="cigarette-paper"><b></b></i>';
  const paper = cigarette.querySelector('.cigarette-paper');
  layer.append(waiter, tray, cigarette);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const PERIOD = 15000, DELIVERY = 1550;
  let ready = false, elapsed = 0, last = 0, cycle = -1, entry, previous, lastSmoke = -1, lastEdge = -1;
  const lerp = (a,b,t) => a+(b-a)*t;
  const smooth = t => t*t*(3-2*t);
  const place = (el,x,y) => el.style.transform = `translate(${x}px,${y}px)`;
  function bounds() {
    const b=sprite.getBoundingClientRect(), ratio=sprite.naturalWidth/sprite.naturalHeight;
    const w=Math.min(b.width,b.height*ratio), h=w/ratio;
    return {x:b.left+(b.width-w)/2,y:b.top+(b.height-h)/2,w,h};
  }
  function effect(className, text, frames, duration) {
    const el=document.createElement('span');el.className=className;el.textContent=text;layer.append(el);
    const a=el.animate(frames,{duration,easing:'ease-out',fill:'forwards'});
    animations.add(a);a.onfinish=()=>{animations.delete(a);el.remove();};
    a.oncancel=()=>el.remove();
  }
  function clear() {
    waiter.hidden=true;tray.hidden=true;cigarette.hidden=true;
    animations.forEach(a=>a.cancel());animations.clear();
    elapsed=0;cycle=-1;previous=null;lastSmoke=-1;
  }
  function start(mouth) {
    let edge=Math.floor(Math.random()*4);
    if(edge===lastEdge)edge=(edge+1)%4;lastEdge=edge;
    const w=waiter.offsetWidth,h=waiter.offsetHeight,r=.15+Math.random()*.7;
    const starts=[{x:-w-40,y:innerHeight*r},{x:innerWidth+40,y:innerHeight*r},{x:innerWidth*r,y:-h-40},{x:innerWidth*r,y:innerHeight+40}];
    entry={start:starts[edge],right:starts[edge].x<mouth.x,departure:null};
    for(let i=0;i<2;i++) {
      const x=mouth.x-15,y=mouth.y-15;
      effect('service-kiss','💋',[
        {transform:`translate(${x}px,${y}px) scale(.15)`,opacity:0},
        {transform:`translate(${x+4*i}px,${y-4*i}px) scale(.45)`,opacity:1,offset:.15},
        {transform:`translate(${x+55+25*i}px,${y-40-30*i}px) scale(.7)`,opacity:0}
      ],850+i*180);
    }
  }
  function draw(p) {
    const mouth={x:p.x+p.w*.433,y:p.y+p.h*.326};
    const n=Math.floor(elapsed/PERIOD),t=elapsed%PERIOD;
    waiter.hidden=false;
    if(n!==cycle){cycle=n;start(mouth);lastSmoke=-1;}
    const w=waiter.offsetWidth,h=waiter.offsetHeight,trayX=entry.right?.8:.2;
    const dest={x:mouth.x-trayX*w+24,y:mouth.y+30-h*.52};
    let q;
    if(t<1100){const u=smooth(t/1100);q={x:lerp(entry.start.x,dest.x,u),y:lerp(entry.start.y,dest.y,u)};}
    else if(t<1750){q=dest;entry.departure={...dest};}
    else {const a=entry.departure||dest,u=smooth(Math.min(1,(t-1750)/1100));q={x:lerp(a.x,entry.start.x,u),y:lerp(a.y,entry.start.y,u)};}
    waiter.querySelector('.service-facing').style.transform=(t<1750?entry.right:!entry.right)?'':'scaleX(-1)';
    waiter.classList.toggle('serving',t>=1100&&t<1750);waiter.hidden=t>=2850;
    place(waiter,q.x,q.y);
    const plate={x:q.x+trayX*w,y:q.y+h*.52};
    tray.hidden=waiter.hidden;place(tray,plate.x-22,plate.y);
    cigarette.hidden=false;
    const u=smooth(Math.max(0,Math.min(1,(t-1150)/(DELIVERY-1150))));
    const x=lerp(plate.x-12,mouth.x,u),y=lerp(plate.y-7,mouth.y,u);
    place(cigarette,x,y);
    const remaining=t<DELIVERY?1:1-(t-DELIVERY)/(PERIOD-DELIVERY);
    const length=4+19*remaining;
    paper.style.width=`${length}px`;
    cigarette.classList.toggle('lit',t>=DELIVERY);
    if(t>=DELIVERY&&elapsed-lastSmoke>420){
      lastSmoke=elapsed;
      const sx=x+6+length,sy=y-3,drift=8+Math.random()*12;
      effect('cigarette-smoke','',[
        {transform:`translate(${sx}px,${sy}px) scale(.3)`,opacity:0},
        {transform:`translate(${sx-4}px,${sy-9}px) scale(.65)`,opacity:.65,offset:.18},
        {transform:`translate(${sx+drift}px,${sy-42}px) scale(1.7)`,opacity:0}
      ],1700);
    }
  }
  function tick(now) {
    const dt=last?Math.min(100,now-last):0;last=now;
    if(ready){
      const p=bounds();
      const visible=!document.hidden&&!motion.matches&&p.y+p.h>45&&p.y<innerHeight-40&&Number(getComputedStyle(actor).opacity)>.5;
      if(!visible){if(cycle!==-1)clear();}
      else {if(previous&&Math.hypot(p.x-previous.x,p.y-previous.y)>90)clear();elapsed+=dt;draw(p);previous=p;}
    }
    requestAnimationFrame(tick);
  }
  clear();
  Promise.all([sprite.decode(),waiter.querySelector('img').decode()]).then(()=>ready=true).catch(clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  motion.addEventListener('change',clear);addEventListener('resize',clear);requestAnimationFrame(tick);
})();
