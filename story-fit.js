(() => {
 const journey=document.querySelector('.journey');
 const viewport=document.createElement('div');viewport.className='story-viewport';
 journey.before(viewport);viewport.append(journey);
 function fit(){
  const width=viewport.clientWidth,h=journey.offsetHeight;
  const available=Math.max(260,innerHeight-viewport.getBoundingClientRect().top-22);
  const scale=Math.min(width/780,available/h,1.1);
  journey.style.transform=`scale(${scale})`;
  journey.style.left=`${(width-780*scale)/2}px`;
  viewport.style.height=`${h*scale}px`;
 }
 new ResizeObserver(fit).observe(journey);addEventListener('resize',fit);fit();
})();
