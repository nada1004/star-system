/* ══════════════════════════════════════════════════════════════
   룰렛 - 상금 뽑기 게임(PPG) (roulette.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _ppgPrizeText(rankStr){
  const m = String(rankStr||'').match(/^(\d)등$/);
  if(!m) return '';
  const k = m[1];
  return (_rLsGet('su_ppg_prize_' + k, '') || '').trim();
}
function _ppgTogglePrizeCfg(){
  _ppgPrizeOpen = !_ppgPrizeOpen;
  const body = document.getElementById('ppg-prizecfg-body');
  const btn  = document.getElementById('ppg-prizecfg-toggle');
  if(body) body.style.display = _ppgPrizeOpen ? 'block' : 'none';
  if(btn) btn.textContent = _ppgPrizeOpen ? '🎁 당첨 내용 접기 ▲' : '🎁 당첨 내용 입력 ▼';
}
function _ppgSavePrizeCfg(){
  for(let k=1;k<=5;k++){
    const el = document.getElementById('ppg-prize-' + k);
    if(!el) continue;
    try{ localStorage.setItem('su_ppg_prize_' + k, String(el.value||'').trim()); }catch(e){}
  }
  try{ if(typeof showToast==='function') showToast('✅ 당첨 내용 저장'); }catch(e){}
}

function _ppgLoad(){
  try{ _ppgBoard = JSON.parse(localStorage.getItem('su_ppg_board')||'null'); }catch(e){ _ppgBoard=null; }
  try{ _ppgRev = JSON.parse(localStorage.getItem('su_ppg_rev')||'null'); }catch(e){ _ppgRev=null; }
  if(!Array.isArray(_ppgBoard) || _ppgBoard.length !== 25) _ppgBoard = null;
  if(!Array.isArray(_ppgRev) || _ppgRev.length !== 25) _ppgRev = null;
}
function _ppgSave(){
  try{ localStorage.setItem('su_ppg_board', JSON.stringify(_ppgBoard||[])); }catch(e){}
  try{ localStorage.setItem('su_ppg_rev', JSON.stringify(_ppgRev||[])); }catch(e){}
}
function _ppgShuffleArray(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    const t=arr[i]; arr[i]=arr[j]; arr[j]=t;
  }
  return arr;
}
function _ppgNewBoard(){
  // 1등 1개, 2등 2개, 3등 3개, 4등 4개, 5등 5개 = 15개 + 나머지 꽝 10개 = 25개
  const base = [];
  for(let i=0;i<1;i++) base.push('1등');
  for(let i=0;i<2;i++) base.push('2등');
  for(let i=0;i<3;i++) base.push('3등');
  for(let i=0;i<4;i++) base.push('4등');
  for(let i=0;i<5;i++) base.push('5등');
  while(base.length < 25) base.push('꽝');
  _ppgBoard = _ppgShuffleArray(base);
  _ppgRev = Array(25).fill(false);
  _ppgSave();
}
function _ppgOpenedCount(){
  if(!_ppgRev) return 0;
  return _ppgRev.reduce((s,v)=>s+(v?1:0),0);
}
function _ppgRender(){
  const grid=document.getElementById('ppg-grid');
  if(!grid || !_ppgBoard || !_ppgRev) return;
  for(let i=0;i<25;i++){
    const btn=grid.querySelector(`[data-ppg="${i}"]`);
    if(!btn) continue;
    const open = !!_ppgRev[i];
    btn.classList.toggle('is-open', open);
    const result = open ? (_ppgBoard[i] || '꽝') : '';
    if (open) btn.setAttribute('data-result', result);
    else btn.removeAttribute('data-result');

    const front = btn.querySelector('.ppg-front');
    const backRank  = btn.querySelector('.ppg-back-rank');
    const backPrize = btn.querySelector('.ppg-back-prize');
    if(front) front.textContent = '뽑기';
    if(backRank)  backRank.textContent  = open ? result : '';
    if(backPrize) backPrize.textContent = (open && result && result !== '꽝') ? _ppgPrizeText(result) : '';

    // 클릭 직후 애니메이션
    if (open && i === _ppgLastOpenIdx) {
      btn.classList.remove('just-open');
      void btn.offsetWidth;
      btn.classList.add('just-open');
      setTimeout(()=>{ try{ btn.classList.remove('just-open'); }catch(e){} }, 520);
    }
  }
  // (요청사항) 오픈 카운트 텍스트는 표시하지 않음
}
function _ppgGetAC(){
  if(!_ppgAC){
    try{ _ppgAC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ _ppgAC=null; }
  }
  try{ if(_ppgAC && _ppgAC.state === 'suspended') _ppgAC.resume().catch(()=>{}); }catch(e){}
  return _ppgAC;
}
function _ppgPlayTap(){
  const ac=_ppgGetAC();
  if(!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'square';
  o.frequency.setValueAtTime(720, t);
  g.gain.setValueAtTime(0.02, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.start(t);
  o.stop(t + 0.05);
}
function _ppgPlayOpenSfx(result){
  const ac=_ppgGetAC();
  if(!ac) return;
  const win = (result && result !== '꽝');
  const base = win ? [659, 784, 1047] : [220, 164];
  base.forEach((freq, i)=>{
    const t = ac.currentTime + i*0.07;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = win ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(win ? 0.14 : 0.10, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (win ? 0.22 : 0.18));
    o.start(t);
    o.stop(t + (win ? 0.22 : 0.18));
  });
}
function _ppgOpen(idx){
  _ppgLoad();
  if(!_ppgBoard || !_ppgRev) _ppgNewBoard();
  if(idx<0 || idx>=25) return;
  if(_ppgRev[idx]) return; // 이미 오픈

  // 클릭 애니메이션(살짝 눌렀다가 플립)
  const grid=document.getElementById('ppg-grid');
  const btn = grid ? grid.querySelector(`[data-ppg="${idx}"]`) : null;
  if(btn){
    btn.classList.remove('opening');
    void btn.offsetWidth;
    btn.classList.add('opening');
  }
  _ppgPlayTap();

  setTimeout(()=>{
    _ppgLoad();
    if(!_ppgBoard || !_ppgRev) _ppgNewBoard();
    if(_ppgRev[idx]) return;
    _ppgRev[idx] = true;
    const result = _ppgBoard[idx] || '꽝';
    _ppgLastOpenIdx = idx;
    _ppgSave();

    const last=document.getElementById('ppg-last');
    const lastSub=document.getElementById('ppg-last-sub');
    if(last){
      last.textContent = result;
      last.classList.remove('ppg-pop');
      void last.offsetWidth;
      last.classList.add('ppg-pop');
    }
    if(lastSub){
      const prize = (result && result !== '꽝') ? _ppgPrizeText(result) : '';
      lastSub.textContent = prize || '';
      lastSub.style.display = prize ? 'block' : 'none';
    }
    _ppgRender();
    // opening 클래스 정리(플립/색상 적용 방해 방지)
    try{
      const grid2=document.getElementById('ppg-grid');
      const btn2 = grid2 ? grid2.querySelector(`[data-ppg="${idx}"]`) : null;
      if(btn2) btn2.classList.remove('opening');
    }catch(e){}
    _ppgPlayOpenSfx(result);
    try{
      if(typeof showToast==='function') showToast(result==='꽝' ? '꽝...' : `🎉 ${result}!`);
    }catch(e){}
  }, 140);
}

function _ppgReshuffle(){
  if(!confirm('새로 섞을까요? (진행 중인 오픈 상태가 초기화됩니다)')) return;
  _ppgNewBoard();
  _ppgLastOpenIdx = -1;
  const last=document.getElementById('ppg-last');
  const lastSub=document.getElementById('ppg-last-sub');
  if(last) last.textContent = '—';
  if(lastSub){ lastSub.textContent=''; lastSub.style.display='none'; }
  _ppgRender();
}
function _ppgResetOpen(){
  if(!confirm('오픈 상태만 초기화할까요? (배치는 유지)')) return;
  _ppgLoad();
  if(!_ppgBoard) _ppgNewBoard();
  _ppgRev = Array(25).fill(false);
  _ppgLastOpenIdx = -1;
  _ppgSave();
  const last=document.getElementById('ppg-last');
  const lastSub=document.getElementById('ppg-last-sub');
  if(last) last.textContent = '—';
  if(lastSub){ lastSub.textContent=''; lastSub.style.display='none'; }
  _ppgRender();
}
function _ppgInit(){
  _ppgLoad();
  if(!_ppgBoard || !_ppgRev) _ppgNewBoard();
  _ppgLastOpenIdx = -1;
  _ppgRender();
}
let _gcSpeedMult = 1;
let _gcCapsules = [];
let _gcAnimId = null;
let _gcTotalRot = 0;
let _gcAudioCtx = null;
