// One fixed epoch shared by every device; reloads do not restart the counters.
const jackpotEpoch = 1790360404974;
const jackpotFormat = new Intl.NumberFormat('tr-TR', {minimumFractionDigits:2,maximumFractionDigits:2});
function updateJackpots(){
 const elapsed=Math.max(0,Date.now()-jackpotEpoch)/1000;
 document.getElementById('grand').textContent=jackpotFormat.format((33144640+Math.floor(elapsed*12))/100);
 document.getElementById('major').textContent=jackpotFormat.format((2007440+Math.floor(elapsed*3))/100);
}
updateJackpots();setInterval(updateJackpots,100);
