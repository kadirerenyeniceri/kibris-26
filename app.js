const runnerImage = new Image();
runnerImage.src = 'runner.png';
runnerImage.alt = 'Kadir’in yüzüyle sağa doğru koşan çöp adam';
runnerImage.onload = () => document.getElementById('runner').replaceChildren(runnerImage);
// Kesin tatil tarihi değiştiğinde bu iki ISO tarihini güncelleyin.
const START = new Date('2026-09-23T00:00:00+03:00').getTime();
const DEPARTURE = new Date('2026-10-23T00:00:00+03:00').getTime();
function updateCountdown() {
  const now = Date.now();
  document.getElementById('today-label').textContent = 'BUGÜN · ' + new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' }).format(now).toLocaleUpperCase('tr-TR');
  const remaining = Math.max(0, Math.floor((DEPARTURE - now) / 1000));
  const numbers = [Math.floor(remaining/86400), Math.floor(remaining/3600)%24, Math.floor(remaining/60)%60, remaining%60];
  ['days','hours','minutes','seconds'].forEach((id,i) => document.getElementById(id).textContent = String(numbers[i]).padStart(2,'0'));
  document.getElementById('track-fill').style.strokeDashoffset = 100 - Math.max(0, Math.min(100, (now-START)/(DEPARTURE-START)*100));
  document.getElementById('journey-label').textContent = remaining ? 'Yolculuğa '+Math.ceil(remaining/86400)+' gün.' : 'Tatil zamanı.';
}
updateCountdown(); setInterval(updateCountdown,1000);
document.querySelector('.journey').classList.toggle('paused', window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const joinButton = document.getElementById('participate');
const moneyLayer = document.getElementById('money-layer');
const billPreload = new Image();
billPreload.src = 'bill.png';
let lastBurst = 0;
function burstMoney(source = joinButton) {
  if (Date.now() - lastBurst < 700) return;
  lastBurst = Date.now();
  moneyLayer.replaceChildren();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const box = source.getBoundingClientRect();
  const originX = box.left + box.width / 2;
  const originY = Math.min(innerHeight - 50, box.top + box.height / 2);
  document.getElementById('effect-status').textContent = 'Animasyon oynatıldı. Herhangi bir katılım kaydı oluşturulmadı.';
  for (let i = 0; i < (reduced ? 6 : 42); i++) {
    const bill = document.createElement('img');
    bill.src = 'bill.png'; bill.alt = ''; bill.className = 'flying-bill';
    moneyLayer.appendChild(bill);
    const x = Math.random() * innerWidth - 55;
    const spin = (Math.random() - .5) * 1000;
    const keyframes = reduced ? [
      { transform: `translate(${x}px, ${innerHeight*.35}px) rotate(${spin/12}deg)`, opacity: 0 },
      { opacity: 1, offset: .3 }, { opacity: 0 }
    ] : [
      { transform: `translate(${originX-55}px, ${originY}px) scale(.35) rotate(0deg)`, opacity: 0 },
      { transform: `translate(${x}px, ${Math.random()*innerHeight*.2-120}px) scale(1) rotate(${spin*.35}deg)`, opacity: 1, offset: .3 },
      { transform: `translate(${x+(Math.random()-.5)*220}px, ${innerHeight+160}px) scale(.8) rotate(${spin}deg)`, opacity: 0 }
    ];
    const animation = bill.animate(keyframes, {duration:reduced?900:2400+Math.random()*1600,delay:reduced?0:Math.random()*380,easing:'linear',fill:'both'});
    animation.onfinish = () => bill.remove();
  }
}
joinButton.addEventListener('click', () => burstMoney());

// Keep the pocket effect separate from the existing participation/slot effects.
(() => {
  const runner = document.getElementById('money-runner');
  const scene = runner.closest('.track-scene');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sprite = runner.querySelector('img');
  function dropPocketMoney() {
    if (document.hidden || motion.matches || !sprite.complete || !sprite.naturalWidth) return;
    const bounds = scene.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > innerHeight) return;
    const body = sprite.getBoundingClientRect();
    const bill = document.createElement('img');
    bill.src = 'bill.png';
    bill.alt = '';
    bill.setAttribute('aria-hidden', 'true');
    bill.className = 'pocket-bill';
    const x = body.left - bounds.left + body.width * .36;
    const y = body.top - bounds.top + body.height * .66;
    bill.style.left = x + 'px';
    bill.style.top = y + 'px';
    scene.appendChild(bill);
    const fall = Math.min(105, Math.max(20, bounds.height - y - 24));
    const drift = Math.min(x, 25 + Math.random() * 30);
    const spin = 100 + Math.random() * 150;
    const animation = bill.animate([
      { transform: 'translate(0,0) rotate(-15deg) scale(.45)', opacity: 0 },
      { transform: `translate(${-drift*.2}px,${fall*.1}px) rotate(25deg) scale(.8)`, opacity: 1, offset: .2 },
      { transform: `translate(${-drift*.65}px,${fall*.5}px) rotate(${spin*.6}deg) scale(1)`, opacity: 1, offset: .65 },
      { transform: `translate(${-drift}px,${fall}px) rotate(${spin}deg) scale(.9)`, opacity: 0 }
    ], { duration: 1550, easing: 'linear', fill: 'both' });
    animation.onfinish = () => bill.remove();
    animation.oncancel = () => bill.remove();
  }
  setInterval(dropPocketMoney, 380);
  motion.addEventListener('change', () => {
    if (motion.matches) scene.querySelectorAll('.pocket-bill').forEach(bill => bill.remove());
  });
})();

// The road and every character share one responsive route.
(() => {
  const scene = document.querySelector('.track-scene');
  const road = scene.querySelector('.journey-road');
  const paths = road.querySelectorAll('path');
  const runners = [...scene.querySelectorAll('.runner')];
  const stops = road.querySelector('.road-stops');
  scene.style.setProperty('--runner-count', runners.length);
  runners.forEach((runner, index) => {
    const progress = (index / runners.length + .08) % 1;
    runner.style.setProperty('--route-delay', `${-progress * 36}s`);
    runner.style.setProperty('--rest-position', `${progress * 100}%`);
  });
  function layoutRoad() {
    const width = scene.clientWidth;
    const height = scene.clientHeight;
    const slot = scene.querySelector('.destination');
    const startX = runners[0].offsetWidth / 2 + 10;
    const startY = height - 32;
    const endX = width - slot.offsetWidth * .53;
    const endY = slot.offsetTop + slot.offsetHeight * .76;
    const dx = endX - startX;
    const dy = startY - endY;
    const x = n => startX + dx * n;
    const y = n => startY - dy * n;
    const route = `M ${startX} ${startY}
      C ${x(.28)} ${y(0)}, ${x(.38)} ${y(.02)}, ${x(.38)} ${y(.27)}
      C ${x(.38)} ${y(.52)}, ${x(.57)} ${y(.43)}, ${x(.64)} ${y(.57)}
      C ${x(.77)} ${y(.82)}, ${x(.67)} ${y(1)}, ${endX} ${endY}`;
    road.setAttribute('viewBox', `0 0 ${width} ${height}`);
    paths.forEach(path => path.setAttribute('d', route));
    runners.forEach(runner => runner.style.offsetPath = `path("${route.replace(/\s+/g, ' ')}")`);
    const length = paths[0].getTotalLength();
    stops.replaceChildren();
    for (let i = 0; i <= 10; i++) {
      const point = paths[0].getPointAtLength(length * i / 10);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', point.x);
      dot.setAttribute('cy', point.y);
      dot.setAttribute('r', i === 0 || i === 10 ? 10 : 7);
      stops.appendChild(dot);
    }
  }
  layoutRoad();
  new ResizeObserver(layoutRoad).observe(scene);
})();
