const jackpotEpoch=1790360404974;
const jackpotFormat=new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
let grandRunStartedAt=Date.now(),grandHeld=false;
try{const saved=Number(localStorage.getItem('kibris-grand-round-start'));if(saved>0)grandRunStartedAt=saved;else localStorage.setItem('kibris-grand-round-start',String(grandRunStartedAt));}catch{}
function updateJackpots(){
 const elapsed=Math.max(0,Date.now()-jackpotEpoch)/1000;
 const grandCents=grandHeld?0:420000000+Math.floor(Math.max(0,Date.now()-grandRunStartedAt)/1000*12);
 document.getElementById('grand').textContent=jackpotFormat.format(grandCents/100);
 document.getElementById('major').textContent=jackpotFormat.format((2007440+Math.floor(elapsed*3))/100);
}
window.trioJackpot={win(){grandHeld=true;updateJackpots();},resume(){grandHeld=false;grandRunStartedAt=Date.now();try{localStorage.setItem('kibris-grand-round-start',String(grandRunStartedAt));}catch{}updateJackpots();}};
updateJackpots();setInterval(updateJackpots,100);
