const toy = document.querySelector('.toy-slot');
const lever = document.getElementById('toy-lever');
const reels = [...document.querySelectorAll('.toy-reel')];
const result = document.getElementById('toy-result');
const winBanner = document.createElement('div');
winBanner.className = 'slot-win-banner';
winBanner.textContent = 'EREN DE KOLU ÇEKMEK İSTİYOR';
winBanner.setAttribute('aria-hidden', 'true');
document.body.appendChild(winBanner);
let bannerTimer;
let spinning = false;
let dragStart = null;
function spinToy() {
  if (spinning) return;
  spinning = true;
  clearTimeout(bannerTimer);
  winBanner.classList.remove('visible');
  lever.disabled = true;
  toy.classList.add('spinning');
  result.textContent = 'Dönüyor…';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const jobs = reels.map((reel, index) => new Promise(resolve => {
    let tick = 0;
    const timer = reduced ? null : setInterval(() => { reel.textContent = ['7','★','◆','7','♣'][tick++ % 5]; }, 65);
    setTimeout(() => {
      if (timer) clearInterval(timer);
      reel.textContent = '7';
      reel.classList.add('settled');
      resolve();
    }, reduced ? 100 : 850 + index * 350);
  }));
  Promise.all(jobs).then(() => {
    toy.classList.remove('spinning');
    toy.classList.add('won');
    result.textContent = 'EREN DE KOLU ÇEKMEK İSTİYOR';
    winBanner.classList.add('visible');
    bannerTimer = setTimeout(() => winBanner.classList.remove('visible'), 3800);
    burstMoney(lever);
    spinning = false;
    lever.disabled = false;
    setTimeout(() => { toy.classList.remove('won'); reels.forEach(r => r.classList.remove('settled')); }, 900);
  });
}
lever.addEventListener('click', spinToy);
lever.addEventListener('pointerdown', event => {
  if (spinning) return;
  dragStart = event.clientY;
  lever.setPointerCapture(event.pointerId);
});
lever.addEventListener('pointermove', event => {
  if (dragStart === null || spinning) return;
  const distance = Math.max(0, Math.min(48, event.clientY-dragStart));
  lever.style.setProperty('--pull', distance+'px');
});
lever.addEventListener('pointerup', event => {
  const pulled = dragStart !== null && event.clientY-dragStart >= 12;
  dragStart = null; lever.style.removeProperty('--pull');
  if (pulled) spinToy();
});
lever.addEventListener('pointercancel', () => { dragStart = null; lever.style.removeProperty('--pull'); });
