(() => {
  const actor=document.querySelector('#red-runner'),sprite=actor.querySelector('img');
  const waiter=document.querySelector('#service-waitress'),drink=document.querySelector('#service-drink'),kisses=document.querySelector('#service-kisses');
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),PERIOD=5000,startedAt=performance.now();
  const layer=document.createElement('div');layer.className='world-cocktail-layer';layer.setAttribute('aria-hidden','true');
  let ready=false,cycle=-1,entry=null,lastEdge=-1,attached=false;
  const animations=new Set();
  const lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t),place=(el,x,y)=>el.style.transform=`translate(${x}px,${y}px)`;
  function hide(){waiter.hidden=true;drink.style.opacity=0;animations.forEach(a=>a.cancel());animations.clear();kisses.replaceChildren();}
  function world(){
    const rig=document.querySelector('.drone-rig');if(!rig)return null;
    if(!attached){rig.append(layer);layer.append(waiter,drink,kisses);attached=true;}
    const b=rig.getBoundingClientRect(),scale=b.width/rig.clientWidth;
    const r=sprite.getBoundingClientRect(),ratio=sprite.naturalWidth/sprite.naturalHeight;
    const w=Math.min(r.width,r.height*ratio)/scale,h=w/ratio;
    return {x:(r.left-b.left)/scale+(r.width/scale-w)/2,y:(r.top-b.top)/scale+(r.height/scale-h)/2,w,h,scale,
      left:-b.left/scale,right:(innerWidth-b.left)/scale,top:-b.top/scale,bottom:(innerHeight-b.top)/scale,
      visible:r.bottom>0&&r.top<innerHeight};
  }
  function kiss(p,index){
    const lip=document.createElement('span');lip.className='service-kiss';lip.textContent='💋';kisses.append(lip);
    const reverse=actor.classList.contains('returning'),dir=reverse?-1:1;
    const x=p.x+p.w*(reverse?.263:.737)-15,y=p.y+p.h*.313-15;
    const a=lip.animate([{transform:`translate(${x}px,${y}px) scale(.2)`,opacity:0},{transform:`translate(${x+dir*8}px,${y-5}px) scale(.6)`,opacity:1,offset:.16},{transform:`translate(${x+dir*(65+index*16)}px,${y-60-index*12}px) scale(.65)`,opacity:0}],{duration:1100,delay:index*80,easing:'ease-out'});
    animations.add(a);a.onfinish=()=>{animations.delete(a);lip.remove();};a.oncancel=()=>lip.remove();
  }
  function start(p,emit){
    let edge=Math.floor(Math.random()*4);if(edge===lastEdge)edge=(edge+1)%4;lastEdge=edge;
    const w=waiter.offsetWidth,h=waiter.offsetHeight,r=.15+Math.random()*.7;
    const starts=[{x:p.left-w-20,y:lerp(p.top,p.bottom,r)},{x:p.right+20,y:lerp(p.top,p.bottom,r)},{x:lerp(p.left,p.right,r),y:p.top-h-20},{x:lerp(p.left,p.right,r),y:p.bottom+20}];
    entry={start:starts[edge],right:starts[edge].x<p.x,departure:null};
    if(emit){kiss(p,0);kiss(p,1);}
  }
  function draw(p,t){
    const w=waiter.offsetWidth,h=waiter.offsetHeight,standing=actor.classList.contains('standing'),reverse=actor.classList.contains('returning');
    const hx=standing?.728:.90;
    const hand={x:p.x+p.w*(reverse?1-hx:hx),y:p.y+p.h*(standing?.71:.55)};
    const trayX=entry.right?.8:.2,dest={x:hand.x-trayX*w+(entry.right?-19:19),y:hand.y-h*.52+9};let q;
    if(t<1050){const u=smooth(t/1050);q={x:lerp(entry.start.x,dest.x,u),y:lerp(entry.start.y,dest.y,u)};}
    else if(t<1500){q=dest;entry.departure={...dest};}
    else{const from=entry.departure||dest,u=smooth(Math.min(1,(t-1500)/1150));q={x:lerp(from.x,entry.start.x,u),y:lerp(from.y,entry.start.y,u)};}
    waiter.querySelector('.service-facing').style.transform=(t<1500?entry.right:!entry.right)?'':'scaleX(-1)';
    waiter.classList.toggle('serving',t>=1050&&t<1500);waiter.hidden=t>=2650;place(waiter,q.x,q.y);
    const tray={x:q.x+trayX*w,y:q.y+h*.52-8},u=Math.max(0,Math.min(1,(t-1080)/350));
    place(drink,lerp(tray.x,hand.x,u)-10,lerp(tray.y,hand.y,u)-Math.sin(u*Math.PI)*10-20);
    drink.style.opacity=t>4700?String((PERIOD-t)/300):'1';
  }
  function tick(now){
    if(ready){
      const p=world(),elapsed=now-startedAt,n=Math.floor(elapsed/PERIOD),t=elapsed%PERIOD;
      if(!p||actor.dataset.machineWaiting==="true"||document.hidden||motion.matches||!p.visible){hide();}
      else{
        waiter.hidden=false;
        if(n!==cycle||!entry){cycle=n;start(p,t<180);}
        draw(p,t);
      }
    }
    requestAnimationFrame(tick);
  }
  Promise.all([sprite.decode(),waiter.querySelector('img').decode()]).then(()=>ready=true).catch(hide);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});motion.addEventListener('change',hide);
  requestAnimationFrame(tick);
})();
