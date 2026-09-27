(() => {
  const journey=document.querySelector('.journey');
  const rig=document.createElement('div');rig.className='drone-rig';
  while(journey.firstChild)rig.append(journey.firstChild);
  journey.append(rig);journey.classList.add('drone-stage');
  const island=document.createElement('div');island.className='carpet-island';island.setAttribute('aria-hidden','true');
  island.innerHTML=`<svg viewBox="0 0 1000 440" preserveAspectRatio="none"><defs><pattern id="island-carpet" width="125" height="125" patternUnits="userSpaceOnUse"><image href="casino-carpet-red.png" width="125" height="125"/></pattern></defs><path class="island-shore" d="M105 205 L144 166 L194 146 L225 113 L266 114 L287 137 L333 139 L374 132 L415 141 L457 154 L501 157 L548 147 L593 134 L636 116 L675 101 L711 94 L745 76 L783 66 L822 48 L858 37 L902 12 L925 7 L903 30 L874 51 L850 66 L823 87 L795 106 L771 128 L741 151 L709 169 L690 190 L692 213 L671 229 L674 253 L651 270 L626 280 L605 305 L574 313 L550 333 L522 339 L496 360 L461 369 L426 368 L403 385 L373 378 L343 369 L316 367 L287 356 L270 337 L239 333 L215 309 L186 301 L165 279 L133 263 L117 237 L89 224 Z" fill="url(#island-carpet)" stroke="#cfb17a" stroke-width="4" stroke-linejoin="round"/><path d="M105 205 L144 166 L194 146 L225 113 L266 114 L287 137 L333 139 L374 132 L415 141 L457 154 L501 157 L548 147 L593 134 L636 116 L675 101 L711 94 L745 76 L783 66 L822 48 L858 37 L902 12 L925 7 L903 30 L874 51 L850 66 L823 87 L795 106 L771 128 L741 151 L709 169 L690 190 L692 213 L671 229 L674 253 L651 270 L626 280 L605 305 L574 313 L550 333 L522 339 L496 360 L461 369 L426 368 L403 385 L373 378 L343 369 L316 367 L287 356 L270 337 L239 333 L215 309 L186 301 L165 279 L133 263 L117 237 L89 224 Z" fill="#351921" opacity=".4"/></svg>`;
  rig.prepend(island);
  const control=document.createElement('div');control.className='drone-controller';control.hidden=true;control.setAttribute('aria-hidden','true');
  control.innerHTML='<svg viewBox="0 0 90 58"><path d="M20 22L14 3M70 22L76 3" stroke="#14191e" stroke-width="5" stroke-linecap="round"/><path d="M15 21Q45 12 75 21L84 49Q72 59 62 44H28Q18 59 6 49Z" fill="#303c48" stroke="#a3a8a8" stroke-width="2"/><rect x="33" y="24" width="24" height="12" rx="2" fill="#5ab5ba"/><circle cx="22" cy="31" r="7" fill="#0c1118"/><circle cx="68" cy="31" r="7" fill="#0c1118"/><circle cx="45" cy="42" r="2" fill="#79e0aa"/><g fill="#e3ac83" stroke="#be885f" stroke-width="1"><ellipse cx="10" cy="43" rx="9" ry="11"/><ellipse cx="80" cy="43" rx="9" ry="11"/><ellipse cx="22" cy="32" rx="5" ry="8" transform="rotate(-28 22 32)"/><ellipse cx="68" cy="32" rx="5" ry="8" transform="rotate(28 68 32)"/></g></svg>';
  document.querySelector('#striped-runner').append(control);
  let geometry;
  function layout(){
    const w=rig.clientWidth,h=rig.clientHeight,ph=h*2.8,pw=ph*(1000/440);
    // The existing route sits on the broad southern body of the island.
    const x=w*.5-pw*.43,y=h*.5-ph*.60;
    Object.assign(island.style,{width:pw+'px',height:ph+'px',left:x+'px',top:y+'px'});
    geometry={w,h,pw,ph,x,y};
  }
  new ResizeObserver(layout).observe(rig);layout();
  const mix=(a,b,t)=>a+(b-a)*t, ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  function camera(t,point){
    const g=geometry,rect=journey.getBoundingClientRect();
    const outerScale=rect.width/journey.offsetWidth;
    const visibleTop=Math.max(0,-rect.top/outerScale),visibleBottom=Math.min(journey.clientHeight,(innerHeight-rect.top)/outerScale);
    const target={x:g.w*.5,y:Math.max(100,(visibleTop+visibleBottom)*.5)};
    const nearScale=window.groupPhotoActive?1.12:2.15;
    const near={s:nearScale,x:target.x-point.x*nearScale,y:target.y-point.y*nearScale};
    const farScale=Math.min(g.w*.93/g.pw,Math.max(220,visibleBottom-visibleTop)*.78/g.ph);
    const far={s:farScale,x:target.x-(g.x+g.pw*.5)*farScale,y:target.y-(g.y+g.ph*.5)*farScale};
    const home={s:1,x:0,y:0};let from,to,u;
    if(t<1.8){from=home;to=near;u=ease(t/1.8);}
    else if(t<2.4){from=near;to=near;u=1;}
    else if(t<5.4){from=near;to=far;u=ease((t-2.4)/3);}
    else if(t<6.1){from=far;to=far;u=1;}
    else{from=far;to=home;u=ease((t-6.1)/2.5);}
    const s=mix(from.s,to.s,u),x=mix(from.x,to.x,u),y=mix(from.y,to.y,u);
    rig.style.transform=`translate(${x}px,${y}px) scale(${s})`;
    // Fade the rectangle only once the map pulls back, revealing its coastline.
    rig.style.setProperty('--map-reveal',String(Math.max(0,Math.min(1,(1-s)*3))));
    journey.dataset.droneShot=t<1.8?'approach':t<2.4?'close':t<5.4?'pullback':t<6.1?'island':'return';
  }
  window.droneScene={
    update(t,point,prepTime=-1){
      const active=t>=0&&t<8.6;
      document.documentElement.classList.toggle('drone-view',active);
      const preparing=prepTime>=0&&t<6.1;
      control.hidden=!preparing;
      if(preparing){const u=ease(prepTime/1.4);control.style.transform=`translate(${mix(-22,0,u)}%,${mix(70,0,u)}%) rotate(${mix(-35,0,u)}deg)`;control.style.opacity=String(u);}
      if(active){camera(t,point);}
      else{rig.style.transform='';rig.style.setProperty('--map-reveal','0');journey.dataset.droneShot='home';}
    }
  };
})();
