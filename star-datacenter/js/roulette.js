/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 동적으로 필요시 로드 필요. */
// ─── 가챠 룰렛 시스템 ─────────────────────────────────────────────────────
function rRoulette(C, T) {
  T.textContent = '🎰 룰렛/게임';
  const avW = window.innerWidth;
  const avH = window.innerHeight - 130;
  const isWide = avW >= 700;
  const _dome = Math.max(190, Math.min(340, Math.round(isWide ? Math.min(avH * 0.48, avW * 0.28) : Math.min(avH * 0.38, avW * 0.7))));
  const _capR = Math.round(_dome * 0.076);
  window._GC_DOME = _dome;
  window._GC_CAP_R = _capR;

  // [Fix-4] players 비어있으면 구슬뽑기 탭 진입 시 경고 배너 + 재시도 버튼
  const _playersEmpty = (typeof players === 'undefined' || !Array.isArray(players) || players.length === 0);
  if (_playersEmpty && _gcTab === 'player') {
    const _pad = Math.max(14, Math.round(_dome * 0.085));
    C.innerHTML = renderRoulettePanel(_dome, _capR, isWide, avW, avH);
    // 탭바(상단 pill 바) 위에 경고 배너 삽입
    const _tabBarEl = C.querySelector('.fbar');
    if (_tabBarEl) {
      const _banner = document.createElement('div');
      _banner.id = 'gc-players-banner';
      _banner.style.cssText = 'background:#FFF7ED;border:2px solid #FED7AA;border-radius:12px;padding:14px 18px;margin-bottom:12px;display:flex;flex-direction:column;gap:8px';
      _banner.innerHTML = '<div style="font-size:14px;font-weight:800;color:#C2410C">⚠️ 스트리머 데이터 로드 실패</div>'
        + '<div style="font-size:12px;color:#92400E;line-height:1.6">구슬뽑기를 사용하려면 스트리머 목록이 필요합니다.<br>데이터를 불러오지 못했거나 아직 로딩 중입니다.</div>'
        + '<button onclick="location.reload()" style="align-self:flex-start;padding:7px 16px;border-radius:8px;border:none;background:#EA580C;color:#fff;font-size:12px;font-weight:700;cursor:pointer">🔄 페이지 새로고침</button>';
      C.insertBefore(_banner, C.firstChild);
    }
    // textarea 값 주입
    (function _injectTextareaValues() {
      var _gcInp = document.getElementById('gc-items-input');
      if (_gcInp) _gcInp.value = _rLsGet(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m', '');
      var _ldN = document.getElementById('ld-names-input');
      if (_ldN) _ldN.value = _rLsGet('su_ld_names', '');
      var _ldI = document.getElementById('ld-items-input');
      if (_ldI) _ldI.value = _rLsGet('su_ld_items', '');
      // 뽑기 당첨 내용(1~5등) 값 주입
      for (var k=1;k<=5;k++){
        var el = document.getElementById('ppg-prize-' + k);
        if (el) el.value = _rLsGet('su_ppg_prize_' + k, '');
      }
    })();
    if (_gcTab === 'ladder') { setTimeout(()=>{ try{ if(typeof _ldInit==='function') _ldInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'duck') { setTimeout(()=>{ try{ if(typeof _drInit==='function') _drInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'wheel') { setTimeout(()=>{ try{ if(typeof _whInit==='function') _whInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'ppopgi') { setTimeout(()=>{ try{ if(typeof _ppgInit==='function') _ppgInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'teammatch') { setTimeout(()=>{ try{ if(typeof _tmInit==='function') _tmInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'tiermatch') { setTimeout(()=>{ try{ if(typeof _tiInit==='function') _tiInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'quiz') { setTimeout(()=>{ try{ if(typeof _pqInit==='function') _pqInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'memory') { setTimeout(()=>{ try{ if(typeof _mmInit==='function') _mmInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'mole') { setTimeout(()=>{ try{ if(typeof _mwInit==='function') _mwInit(); }catch(e){} }, 60); }
    else { setTimeout(()=>{ try{ if(typeof _gcSetup==='function') _gcSetup(); }catch(e){} }, 60); }
    return;
  }

  C.innerHTML = renderRoulettePanel(_dome, _capR, isWide, avW, avH);
  // [Fix-2] localStorage 값을 innerHTML 삽입 대신 .value로 안전하게 세팅 (XSS/DOM 깨짐 방지)
  (function _injectTextareaValues() {
    var _gcInp = document.getElementById('gc-items-input');
    if (_gcInp) _gcInp.value = _rLsGet(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m', '');
    var _ldN = document.getElementById('ld-names-input');
    if (_ldN) _ldN.value = _rLsGet('su_ld_names', '');
    var _ldI = document.getElementById('ld-items-input');
    if (_ldI) _ldI.value = _rLsGet('su_ld_items', '');
    // 뽑기 당첨 내용(1~5등) 값 주입
    for (var k=1;k<=5;k++){
      var el = document.getElementById('ppg-prize-' + k);
      if (el) el.value = _rLsGet('su_ppg_prize_' + k, '');
    }
  })();
  if (_gcTab === 'ladder') {
    setTimeout(()=>{ try{ if(typeof _ldInit==='function') _ldInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'duck') {
    setTimeout(()=>{ try{ if(typeof _drInit==='function') _drInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'wheel') {
    setTimeout(()=>{ try{ if(typeof _whInit==='function') _whInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'ppopgi') {
    setTimeout(()=>{ try{ if(typeof _ppgInit==='function') _ppgInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'teammatch') {
    setTimeout(()=>{ try{ if(typeof _tmInit==='function') _tmInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'tiermatch') {
    setTimeout(()=>{ try{ if(typeof _tiInit==='function') _tiInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'quiz') {
    setTimeout(()=>{ try{ if(typeof _pqInit==='function') _pqInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'memory') {
    setTimeout(()=>{ try{ if(typeof _mmInit==='function') _mmInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'mole') {
    setTimeout(()=>{ try{ if(typeof _mwInit==='function') _mwInit(); }catch(e){} }, 60);
  } else {
    setTimeout(()=>{ try{ if(typeof _gcSetup==='function') _gcSetup(); }catch(e){} }, 60);
  }
  // (요청사항) 확률(%) 표시는 제거
}

(function _gcInjectCSS(){
  if (document.getElementById('gc-style')) return;
  const s = document.createElement('style');
  s.id = 'gc-style';
  s.textContent = '@keyframes gcConfettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(100vh) rotate(800deg) scale(0.4);opacity:0}}'
    + '@keyframes gcBounceIcon{0%{transform:scale(0) rotate(-20deg)}60%{transform:scale(1.3) rotate(10deg)}80%{transform:scale(0.9) rotate(-5deg)}100%{transform:scale(1) rotate(0deg)}}'
    + '@keyframes gcCardAppear{0%{transform:scale(0.75) translateY(10px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}'
    + '.gc-shell{position:relative}'
    + '.gc-shell::before{content:"";position:absolute;inset:0 10px auto 10px;height:220px;border-radius:28px;background:radial-gradient(circle at top left,rgba(96,165,250,.16),transparent 40%),radial-gradient(circle at top right,rgba(244,114,182,.14),transparent 42%);pointer-events:none}'
    + '.gc-hero{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 20px;border:1px solid rgba(148,163,184,.18);border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(248,250,252,.92));box-shadow:0 16px 38px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.85);margin-bottom:12px;backdrop-filter:blur(10px)}'
    + '.gc-hero-copy{display:flex;flex-direction:column;gap:7px;min-width:0}'
    + '.gc-hero-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase}'
    + '.gc-hero-title{font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.15}'
    + '.gc-hero-desc{font-size:13px;line-height:1.6;color:var(--text3);word-break:keep-all}'
    + '.gc-hero-badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}'
    + '.gc-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.86);border:1px solid rgba(148,163,184,.18);font-size:12px;font-weight:800;color:var(--text2);box-shadow:0 8px 20px rgba(15,23,42,.05)}'
    + '.gc-tabbar-card{position:relative;padding:8px;border:1px solid rgba(148,163,184,.18);border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.88));box-shadow:0 14px 30px rgba(15,23,42,.06);margin-bottom:14px}'
    + '.gc-tabbar-card .fbar{margin-bottom:0 !important;padding:2px}'
    + '.gc-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:22px;box-shadow:0 16px 34px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.9)}'
    + '.gc-card-soft{position:relative;overflow:hidden}'
    + '.gc-card-soft::before{content:"";position:absolute;inset:auto -10% 65% auto;width:170px;height:170px;background:radial-gradient(circle,rgba(96,165,250,.16),transparent 68%);pointer-events:none}'
    + '.gc-stage-card{padding:18px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(244,247,251,.92));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 38px rgba(15,23,42,.07)}'
    + '.gc-stage-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}'
    + '.gc-stage-title{font-size:16px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}'
    + '.gc-stage-desc{font-size:12px;color:var(--text3);line-height:1.55;margin-top:4px}'
    + '.gc-input-toggle{width:100%;padding:10px 14px;font-weight:900;border:1px solid rgba(148,163,184,.2);border-radius:16px;background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);cursor:pointer;transition:.15s;text-align:left;box-shadow:0 10px 20px rgba(15,23,42,.05)}'
    + '.gc-input-toggle:hover{transform:translateY(-1px);border-color:rgba(37,99,235,.26);box-shadow:0 14px 26px rgba(37,99,235,.08);color:#2563eb}'
    + '.gc-history-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:18px;padding:14px 16px;box-shadow:0 14px 26px rgba(15,23,42,.05)}'
    + '.gc-history-item{display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.72);border:1px solid rgba(148,163,184,.12);border-radius:12px;font-size:13px}'
    + '.gc-wheel-root,.gc-duck-root{min-height:420px}'
    + 'body.dark .gc-shell::before{background:radial-gradient(circle at top left,rgba(59,130,246,.14),transparent 40%),radial-gradient(circle at top right,rgba(236,72,153,.12),transparent 42%)}'
    + 'body.dark .gc-hero,body.dark .gc-tabbar-card,body.dark .gc-card,body.dark .gc-stage-card,body.dark .gc-history-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55;box-shadow:0 18px 36px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.03)}'
    + 'body.dark .gc-badge,body.dark .gc-history-item{background:rgba(30,41,59,.76);border-color:#334155;color:#cbd5e1}'
    + 'body.dark .gc-hero-title,body.dark .gc-stage-title{color:#f8fafc}'
    + 'body.dark .gc-hero-desc,body.dark .gc-stage-desc{color:#94a3b8}'
    + 'body.dark .gc-input-toggle{background:linear-gradient(180deg,#18263b,#0f172a);border-color:#334155;color:#cbd5e1;box-shadow:0 12px 24px rgba(0,0,0,.24)}'
    + 'body.dark .gc-input-toggle:hover{color:#93c5fd;border-color:#3b82f6}'
    + '@media (max-width:900px){.gc-hero{flex-direction:column}.gc-hero-title{font-size:20px}.gc-hero-badges{justify-content:flex-start}.gc-tabbar-card{border-radius:18px}.gc-stage-card,.gc-card{border-radius:20px}}'
    + '@media (max-width:640px){.gc-shell::before{left:0;right:0;height:180px}.gc-hero{padding:16px;border-radius:20px}.gc-hero-title{font-size:18px}.gc-badge{font-size:11px;padding:7px 10px}.gc-stage-card{padding:14px}}';
  document.head.appendChild(s);
})();

function _rLsGet(key, fallback){
  try{
    const v = localStorage.getItem(key);
    return (v==null) ? (fallback==null?'':fallback) : v;
  }catch(e){
    return (fallback==null?'':fallback);
  }
}
function _rLsSet(key, value){
  try{ localStorage.setItem(key, value); return true; }catch(e){ return false; }
}
function _rJsonGet(key, fallback){
  try{
    const raw = _rLsGet(key, '');
    if(!raw) return fallback;
    const v = JSON.parse(raw);
    return (v==null) ? fallback : v;
  }catch(e){
    return fallback;
  }
}
const _rEscHTML = (typeof window !== 'undefined' && typeof window.escHTML === 'function')
  ? window.escHTML
  : (s)=>String(s??'').replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const _rEscJS = (typeof window !== 'undefined' && typeof window.escJS === 'function')
  ? window.escJS
  : (s)=>String(s??'')
    .replace(/\\/g,'\\\\')
    .replace(/'/g,"\\'")
    .replace(/\r/g,'\\r')
    .replace(/\n/g,'\\n');
const _rEscAttr = (typeof window !== 'undefined' && typeof window.escAttr === 'function')
  ? window.escAttr
  : (s)=>String(s??'')
    .replace(/&/g,'&amp;')
    .replace(/"/g,'&quot;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');

let _gcTab = 'player';
let _gcInputOpen = true;
let _gcSpinning = false;
let _gcHistory = {
  player: _rJsonGet('su_gc_hist_p', []),
  map:    _rJsonGet('su_gc_hist_m', []),
  ladder: _rJsonGet('su_gc_hist_l', [])
};
// MiscStore에서 비동기 로드 (IDB 우선)
(async function _gcLoadFromIdb(){
  try{
    if(typeof MiscStore==='undefined') return;
    const p = await MiscStore.get('su_gc_hist_p');
    if(Array.isArray(p)) _gcHistory.player = p;
    const m = await MiscStore.get('su_gc_hist_m');
    if(Array.isArray(m)) _gcHistory.map = m;
    const l = await MiscStore.get('su_gc_hist_l');
    if(Array.isArray(l)) _gcHistory.ladder = l;
  }catch(e){}
})();

// ─────────────────────────────────────────────────────────────
// 🎁 뽑기(5×5) — 룰렛 탭 내 서브탭
// - 25칸 중 “1등~5등” 각 1개 + 나머지 “꽝”
// - 여러 칸 오픈 가능
// - ‘오늘 고정’ 규칙은 사용하지 않음(사용자가 원할 때 새로 섞기)
// ─────────────────────────────────────────────────────────────
let _ppgBoard = null;     // string[25]
let _ppgRev = null;       // boolean[25]
let _ppgLastOpenIdx = -1;
let _ppgAC = null;
let _ppgPrizeOpen = false;

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
window._GC_DOME = 220;
window._GC_CAP_R = 17;

// ─────────────────────────────────────────────────────────────
// (요청사항) 룰렛 결과 팝업
// ─────────────────────────────────────────────────────────────
if (typeof window._rrShowPopup !== 'function') {
  window._rrShowPopup = function(title, bodyHTML){
    let m=document.getElementById('rrPopupModal');
    if(!m){
      m=document.createElement('div');
      m.id='rrPopupModal';
      m.className='modal no-export';
      m.style.cssText='display:none;z-index:9100;align-items:center;justify-content:center';
      m.addEventListener('click', (e)=>{ if(e && e.target===m) window._rrClosePopup(); });
      document.body.appendChild(m);
    }
    m.innerHTML = `
      <div class="mbox" style="width:min(520px,94vw);max-height:86vh;overflow:auto">
        <div class="mtitle" style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <span>${title||'결과'}</span>
          <button class="btn btn-w btn-xs" onclick="_rrClosePopup()">✕</button>
        </div>
        <div style="padding:10px 2px 4px">${bodyHTML||''}</div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px">
          <button class="btn btn-b btn-sm" onclick="_rrClosePopup()">확인</button>
        </div>
      </div>`;
    m.style.display='flex';
  };
  window._rrClosePopup = function(){
    const m=document.getElementById('rrPopupModal');
    if(m) m.style.display='none';
  };
}

// ─────────────────────────────────────────────────────────────
// (추가) 가중치/확률 파서
// 형식: "이름" 또는 "이름*2.5" (쉼표로 구분)
// - 같은 이름이 여러 번 나오면 가중치를 합산
// ─────────────────────────────────────────────────────────────
function _gcParseWeightedCSV(text){
  const raw = String(text||'');
  const tokens = raw.split(',').map(v=>v.trim()).filter(Boolean);
  const map = new Map();
  tokens.forEach(t=>{
    let name=t, w=1;
    const m=t.match(/^(.*?)(?:\*(\d+(?:\.\d+)?))$/);
    if(m){
      name=(m[1]||'').trim();
      const n=parseFloat(m[2]);
      if(!isNaN(n) && isFinite(n)) w=n;
    }
    if(!name) return;
    w=Math.max(0.01, Math.min(1000, w));
    map.set(name, (map.get(name)||0) + w);
  });
  const items=[...map.entries()].map(([name,weight])=>({name,weight}));
  const total=items.reduce((s,x)=>s+x.weight,0)||0;
  return {items,total};
}

function _gcPickWeighted(items,total){
  if(!items||!items.length) return null;
  if(!(total>0)) total = items.reduce((s,x)=>s+x.weight,0);
  let r=Math.random()*total;
  for(const it of items){
    r -= it.weight;
    if(r<=0) return it;
  }
  return items[items.length-1];
}

// ─── 연속 반복 방지 (두더지 게임과 동일한 방식) ──────────────────────────────
// 같은 이름(프로필)이 바로 다음 스핀에서 또 나오지 않도록 최근 결과를 기억해뒀다가 제외하고 뽑음.
const _GC_RECENT_AVOID = 1; // 최근 이만큼의 결과는 연속으로 다시 나오지 않음
let _gcRecentResults = { player: [], map: [] };

function _gcRememberRecent(histKey, name){
  if(!name) return;
  const bucket = histKey === 'player' ? 'player' : 'map';
  const cur = (_gcRecentResults[bucket] || []).filter(n => n !== name);
  _gcRecentResults[bucket] = [name, ...cur].slice(0, _GC_RECENT_AVOID);
}

function _gcPickWeightedAvoidRepeat(items, total, avoidNames){
  if(!items || !items.length) return null;
  const avoid = avoidNames || [];
  // 후보가 전부 회피 목록에 걸리면(항목이 1~2개뿐인 경우 등) 회피를 포기하고 그냥 뽑음
  const filtered = items.filter(it => !avoid.includes(it.name));
  if(!filtered.length) return _gcPickWeighted(items, total);
  const filteredTotal = filtered.reduce((s,x)=>s+x.weight,0);
  return _gcPickWeighted(filtered, filteredTotal);
}

const _GC_COLORS = [
  ['#FF80AB','#FF4081'],['#81D4FA','#29B6F6'],['#FFF176','#FFD600'],
  ['#B9F6CA','#00E676'],['#CE93D8','#AB47BC'],['#FFCC80','#FFA726'],
  ['#F48FB1','#EC407A'],['#80DEEA','#00BCD4'],['#FFAB91','#FF5722'],
];

function _gcFindPlayer(keyword) {
  if (typeof players === 'undefined') return null;
  return players.find(x => x.name === keyword)
    || players.find(x => x.name.includes(keyword))
    || players.find(x => keyword.includes(x.name));
}

function renderRoulettePanel(dome, capR, isWide, avW, avH) {
  dome   = dome  || window._GC_DOME;
  capR   = capR  || window._GC_CAP_R;
  isWide = isWide != null ? isWide : (window.innerWidth >= 700);
  avW    = avW   || window.innerWidth;
  avH    = avH   || window.innerHeight - 130;

  const isPlayer = _gcTab === 'player';
  const isLadder = _gcTab === 'ladder';
  const isDuck   = _gcTab === 'duck';
  const isWheel  = _gcTab === 'wheel';
  const isPpopgi = _gcTab === 'ppopgi';
  const isTeamMatch = _gcTab === 'teammatch';
  const isTierMatch = _gcTab === 'tiermatch';
  const isQuiz = _gcTab === 'quiz';
  const isMemory = _gcTab === 'memory';
  const isMole = _gcTab === 'mole';
  const savedText   = (!isLadder && !isDuck && !isWheel) ? (_rLsGet(isPlayer ? 'su_gc_p' : 'su_gc_m', '') || '') : '';
  const _w = _gcParseWeightedCSV(savedText);
  const activeItems = _w.items.map(x=>x.name);

  const ldNamesText = isLadder ? (_rLsGet('su_ld_names', '') || '') : '';
  const ldItemsText = isLadder ? (_rLsGet('su_ld_items', '') || '') : '';
  const ldNames     = ldNamesText.split(',').map(v=>v.trim()).filter(v=>v);

  // 모바일/태블릿에서 dome 기반 폰트가 과하게 커져 입력창이 "불편"해지는 문제 완화
  // - 입력창/버튼은 화면폭 기준으로 적당히 clamp
  const fs   = Math.max(12, Math.min(14, Math.round(dome * 0.065)));
  const fsLg = Math.max(14, Math.min(16, Math.round(dome * 0.072)));
  const pad  = Math.max(14, Math.round(dome * 0.085));
  const isCompactUI = avW <= 1024; // 모바일/태블릿
  const rowsGC = isWide ? 3 : 4;
  const rowsLd = isWide ? 2 : 3;
  const _tabMeta = {
    player: { title:'구슬뽑기', desc:'스트리머 이름을 넣고 바로 뽑는 기본 룰렛입니다.', badge1:`항목 ${activeItems.length}개`, badge2:'가중치 지원' },
    map: { title:'맵뽑기', desc:'등록된 맵을 빠르게 고르고 랜덤으로 추첨합니다.', badge1:`맵 ${activeItems.length}개`, badge2:'맵 배지 선택' },
    ladder: { title:'사다리', desc:'참가자와 결과 항목을 연결해서 재미있게 추첨합니다.', badge1:`참가자 ${ldNames.length}명`, badge2:'캔버스 추첨' },
    duck: { title:'경주', desc:'오리 경주 방식으로 더 시각적으로 결과를 뽑습니다.', badge1:'실시간 애니메이션', badge2:'가볍게 진행' },
    wheel: { title:'휠', desc:'큰 룰렛 휠로 직관적으로 돌리고 결과를 확인합니다.', badge1:'휠 인터랙션', badge2:'몰입감 강화' },
    ppopgi: { title:'5x5 뽑기', desc:'카드 뒤집기 느낌으로 순서대로 결과를 열어볼 수 있습니다.', badge1:'25칸 보드', badge2:'등수 커스텀' },
    teammatch: { title:'소속 매칭', desc:'같은 소속(팀) 선수들을 사각형으로 묶어서 제거하는 매칭 게임입니다.', badge1:'제한시간 100초', badge2:'낙하 보충' },
    tiermatch: { title:'티어 매칭', desc:'같은 티어 선수들을 사각형으로 묶어서 제거하는 매칭 게임입니다.', badge1:'제한시간 100초', badge2:'낙하 보충' },
    quiz: { title:'얼굴 맞추기', desc:'사진이 점점 선명해지는 시간제한 퀴즈. 빨리 맞힐수록 스피드 보너스!', badge1:'제한시간 60초', badge2:'블러 리빌' },
    memory: { title:'짝맞추기', desc:'같은 선수 사진 두 장을 찾는 카드 매칭 게임입니다.', badge1:'제한시간 90초', badge2:'콤보 보너스' },
    mole: { title:'두더지 잡기', desc:'문제로 나온 선수 사진과 같은 얼굴의 두더지만 재빨리 잡아보세요.', badge1:'제한시간 100초', badge2:'3x3 · 5x5 난이도' }
  }[_gcTab] || { title:'룰렛/게임', desc:'원하는 방식으로 간단하게 추첨할 수 있습니다.', badge1:'빠른 추첨', badge2:'탭 전환 지원' };
  const _hero = `<section class="gc-hero">
    <div class="gc-hero-copy">
      <div class="gc-hero-kicker">Lucky Studio</div>
      <div class="gc-hero-title">🎰 ${_tabMeta.title}</div>
      <div class="gc-hero-desc">${_tabMeta.desc}</div>
    </div>
    <div class="gc-hero-badges">
      <span class="gc-badge">✨ ${_tabMeta.badge1}</span>
      <span class="gc-badge">🎯 ${_tabMeta.badge2}</span>
      <span class="gc-badge">📱 모바일 최적화</span>
    </div>
  </section>`;

  // 공통 탭바 HTML — 다른 탭 하위 메뉴와 동일한 pill/fbar 스타일
  const _tabBar = `<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">
    <button class="pill${_gcTab==='player'?' on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('player')">🎰 구슬뽑기</button>
    <button class="pill${_gcTab==='map'?' on':''}"    style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('map')">🗺️ 맵뽑기</button>
    <button class="pill${_gcTab==='ladder'?' on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('ladder')">🪜 사다리</button>
    <button class="pill${_gcTab==='duck'?' on':''}"   style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('duck')">🐥 경주</button>
    <button class="pill${_gcTab==='wheel'?' on':''}"  style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('wheel')">🎡 휠</button>
    <button class="pill${_gcTab==='ppopgi'?' on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('ppopgi')">🎁 뽑기</button>
    <button class="pill${_gcTab==='teammatch'?' on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('teammatch')">🧩 소속매칭</button>
    <button class="pill${_gcTab==='tiermatch'?' on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('tiermatch')">🎖️ 티어매칭</button>
    <button class="pill${_gcTab==='quiz'?' on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('quiz')">🖼️ 얼굴맞추기</button>
    <button class="pill${_gcTab==='memory'?' on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('memory')">🃏 짝맞추기</button>
    <button class="pill${_gcTab==='mole'?' on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('mole')">🐹 두더지</button>
  </div>`;

  // 오리경주 탭: 별도 레이아웃
  if (isDuck) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div class="gc-stage-card gc-duck-root">
    <div class="gc-stage-head">
      <div>
        <div class="gc-stage-title">🐥 오리 경주 추첨</div>
        <div class="gc-stage-desc">보기 좋은 카드형 레이아웃으로 감싸서, 경주 화면이 더 또렷하게 보이도록 정리했습니다.</div>
      </div>
    </div>
    <div id="dr-root"></div>
  </div>
</div>`;
  }

  // 룰렛 휠 탭: 별도 레이아웃
  if (isWheel) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div class="gc-stage-card gc-wheel-root">
    <div class="gc-stage-head">
      <div>
        <div class="gc-stage-title">🎡 휠 룰렛</div>
        <div class="gc-stage-desc">휠 영역을 카드처럼 분리해서 시선이 더 잘 모이도록 구성했습니다.</div>
      </div>
    </div>
    <div id="wh-root"></div>
  </div>
</div>`;
  }

  // 🧩 소속 매칭 탭: 별도 레이아웃 (내용은 team-match-game.js가 #tm-root에 채움)
  if (isTeamMatch) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="tm-root"></div>
</div>`;
  }

  // 🎖️ 티어 매칭 탭: 별도 레이아웃 (내용은 tier-match-game.js가 #ti-root에 채움)
  if (isTierMatch) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="ti-root"></div>
</div>`;
  }

  // 🖼️ 얼굴 맞추기 탭: 별도 레이아웃 (내용은 photo-quiz-game.js가 #pq-root에 채움)
  if (isQuiz) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="pq-root"></div>
</div>`;
  }

  // 🃏 짝맞추기 탭: 별도 레이아웃 (내용은 memory-match-game.js가 #mm-root에 채움)
  if (isMemory) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="mm-root"></div>
</div>`;
  }

  // 🐹 두더지 잡기 탭: 별도 레이아웃 (내용은 mole-whack-game.js가 #mw-root에 채움)
  if (isMole) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="mw-root"></div>
</div>`;
  }

  // 🎁 뽑기 탭: 별도 레이아웃
  if (isPpopgi) {
    _ppgLoad();
    if(!_ppgBoard || !_ppgRev) _ppgNewBoard();
    const fs = Math.max(14, Math.min(18, Math.round(dome * 0.07)));
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div class="ppg-wrap">
    <div class="ppg-panel gc-card gc-card-soft">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div>
          <div class="ppg-title" style="font-size:${fs}px">🎁 5×5 뽑기</div>
          <div class="ppg-sub">카드를 뒤집듯 당첨 결과를 열어보는 방식입니다.</div>
        </div>
      </div>

      <div class="ppg-actions">
        <button class="btn btn-b btn-sm" onclick="_ppgReshuffle()">🔀 새로 섞기</button>
        <button class="btn btn-w btn-sm" onclick="_ppgResetOpen()">♻️ 오픈 초기화</button>
      </div>

      <div id="ppg-grid" class="ppg-grid">
        ${Array.from({length:25}, (_,i)=>{
          const open = !!_ppgRev[i];
          const result = open ? (_ppgBoard[i] || '꽝') : '';
          const cls = open ? 'ppg-card is-open' : 'ppg-card';
          const dataRes = open ? ` data-result="${result}"` : '';
          return `<button class="${cls}" data-ppg="${i}"${dataRes} onclick="_ppgOpen(${i})" aria-label="뽑기 ${i+1}">
            <span class="ppg-card-inner">
              <span class="ppg-face ppg-front">뽑기</span>
              <span class="ppg-face ppg-back">
                <span class="ppg-back-rank"></span>
                <span class="ppg-back-prize"></span>
              </span>
            </span>
          </button>`;
        }).join('')}
      </div>

      <div class="ppg-last">
        <div class="ppg-last-label">최근 결과</div>
        <div id="ppg-last" class="ppg-last-val">—</div>
        <div id="ppg-last-sub" class="ppg-last-sub"></div>
      </div>
    </div>

    <div class="ppg-panel gc-card">
      <button id="ppg-prizecfg-toggle" class="btn btn-w btn-sm" style="width:100%" onclick="_ppgTogglePrizeCfg()">🎁 당첨 내용 입력 ▼</button>
      <div id="ppg-prizecfg-body" style="display:none;margin-top:10px">
        <div style="font-size:12px;color:var(--gray-l);margin-bottom:8px">각 등수에 표시할 “당첨 내용”을 적어줘. (비우면 등수만 표시)</div>
        <div class="ppg-prize-grid">
          ${[1,2,3,4,5].map(k=>`
            <label class="ppg-prize-row">
              <span class="ppg-prize-lbl">${k}등</span>
              <input id="ppg-prize-${k}" type="text" placeholder="예) 치킨 기프티콘" class="ppg-prize-inp">
            </label>
          `).join('')}
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
          <button class="btn btn-b btn-sm" onclick="_ppgSavePrizeCfg()">저장</button>
        </div>
      </div>
    </div>

    <!-- (요청사항) 최근 오픈 기록 제거 -->
  </div>
</div>`;
  }

  const _maps = (typeof maps!=='undefined' && Array.isArray(maps)) ? maps : (Array.isArray(window.maps) ? window.maps : []);
  const mapBadges = (!isLadder && !isPlayer) ? _maps.map(m => {
    const active = activeItems.includes(m);
    const mj = _rEscJS(m);
    const ma = _rEscAttr(String(m||''));
    return `<span onclick="_gcToggleMap('${mj}',this)" data-map="${ma}"
      style="cursor:pointer;padding:5px 12px;border-radius:14px;font-size:${fs}px;font-weight:700;border:2px solid ${active?'#FF4B6E':'var(--border)'};background:${active?'#FFF0F3':'var(--surface)'};color:${active?'#FF4B6E':'var(--text2)'};transition:.1s;user-select:none">${_rEscHTML(m)}</span>`;
  }).join('') : '';

  const _inputSummary = isLadder
    ? (ldNames.length ? `✏️ 참가자 ${ldNames.length}명 입력됨` : '✏️ 참가자 입력 없음')
    : (activeItems.length ? `✏️ ${isPlayer?'스트리머':'맵'} ${activeItems.length}개 입력됨` : `✏️ ${isPlayer?'스트리머':'맵'} 입력 없음`);

  // 머신 치수 (가챠용)
  const bodyW     = dome + Math.round(dome * 0.11);
  const ringW     = dome - Math.round(dome * 0.11);
  const ringH     = Math.round(dome * 0.105);
  const crankSz   = Math.round(dome * 0.42);
  const exitW     = Math.round(dome * 0.38);
  const exitH     = Math.round(dome * 0.25);
  const exitCapSz = Math.round(dome * 0.25);
  const trayW     = Math.round(dome * 0.5);
  const trayH     = Math.round(dome * 0.083);
  const resIconSz = Math.round(dome * 0.36);
  const resTextSz = Math.max(20, Math.round(dome * 0.135));

  // 사다리 캔버스 크기
  const ldCanvasW = isWide ? Math.min(600, Math.round(avW * 0.55)) : Math.min(avW - 40, 420);
  const ldCanvasH = Math.max(380, Math.round(avH * 0.68));

  // 입력 컬럼 폭: 태블릿에서 너무 좁/넓지 않게 clamp
  const inputW = isWide ? Math.min(420, Math.max(280, Math.round(avW * 0.34))) : '100%';
  const innerLayout = isWide
    ? `display:flex;gap:${pad*2}px;align-items:flex-start`
    : `display:flex;flex-direction:column;align-items:center`;
  const inputColStyle = isWide ? `width:${inputW}px;flex-shrink:0` : `width:100%`;


  // 사다리: 항상 표시할 결과 항목 블록 (접기 영역 밖)
  const ldItemsAlways = isLadder ? `
    <div class="gc-card gc-card-soft" style="padding:${pad}px;margin-bottom:${Math.round(pad*0.6)}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">결과 항목 (쉼표 구분, 이름 수와 동일하게)</div>
      <textarea id="ld-items-input" rows="${rowsLd}" oninput="_ldSaveItems(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:10px;padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box"></textarea><!-- [Fix-2] value는 rRoulette()에서 .value로 주입 -->
      <button onclick="_ldRebuild()" style="margin-top:10px;font-size:${fs}px;padding:6px 14px;border-radius:8px;border:1.5px solid #a78bfa;background:#f5f3ff;color:#7c3aed;cursor:pointer;font-weight:600">🎲 사다리 다시 만들기</button>
    </div>
    <div id="ld-hist-box"></div>
  ` : '';

  // 입력 본체 HTML (접기 대상)
  const inputBodyInner = isLadder ? `
    <div class="gc-card gc-card-soft" style="padding:${pad}px;margin-bottom:${Math.round(pad*0.6)}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">참가자 이름 (쉼표 구분, 2명 이상)</div>
      <textarea id="ld-names-input" rows="${rowsLd}" oninput="_ldSaveNames(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:10px;padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box"></textarea><!-- [Fix-2] value는 rRoulette()에서 .value로 주입 -->
    </div>
  ` : `
    <div class="gc-card gc-card-soft" style="padding:${pad}px;margin-bottom:${pad}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">${isPlayer?'스트리머 이름 (쉼표 구분, 부분 입력 가능)':'맵 이름 (쉼표 구분)'}</div>
      <textarea id="gc-items-input" rows="${rowsGC}" oninput="_gcSaveText(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:10px;padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box"></textarea><!-- [Fix-2] value는 rRoulette()에서 .value로 주입 -->
      <div style="margin-top:8px;font-size:${Math.max(11,fs-1)}px;color:var(--gray-l);line-height:1.5">
        ✅ 가중치: <b>이름*2</b> (2배) · 예) <span style="font-family:${'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'}">폴리포이드*2, 라데온*1</span>
      </div>
      <button onclick="_gcClearItems()" style="margin-top:10px;font-size:${fs}px;padding:6px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer;font-weight:600">지우기</button>
    </div>
    ${(!isPlayer && mapBadges) ? `
    <div class="gc-card" style="padding:${pad}px;margin-bottom:${pad}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:10px">📋 등록된 맵 (클릭해서 추가)</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${mapBadges}</div>
    </div>` : ''}
  `;

  // 가챠 결과 카드 + 기록 (가챠탭만)
  const gcResultHTML = isLadder ? '' : `
    <div id="gc-result-card" class="gc-card gc-card-soft" style="display:none;background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:2.5px solid #FF89AB;border-radius:20px;padding:${pad*1.2}px;text-align:center;animation:gcCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)">
      <div style="font-size:${fs}px;font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:10px">🎊 당첨!</div>
      <div id="gc-pop-icon" style="font-size:${resIconSz}px;display:block;margin-bottom:8px;line-height:1.1"></div>
      <div id="gc-res-text" style="font-size:${resTextSz}px;font-weight:900;color:#C0274A;margin-bottom:6px;word-break:keep-all"></div>
      <div id="gc-res-prob" style="display:none"></div>
      <button onclick="_gcReset()" style="background:linear-gradient(135deg,#FF4B6E,#FF89AB);color:white;border:none;border-radius:14px;padding:${Math.round(pad*0.7)}px ${pad*1.5}px;font-size:${fsLg}px;font-weight:700;cursor:pointer;box-shadow:0 4px 0 #C0274A"
        onmousedown="this.style.transform='translateY(3px)';this.style.boxShadow='0 1px 0 #C0274A'"
        onmouseup="this.style.transform='';this.style.boxShadow='0 4px 0 #C0274A'">🎰 다시 뽑기!</button>
    </div>
    ${(()=>{
      const hist = _gcHistory[isPlayer?'player':'map'];
      if (!hist.length) return '';
      return `<div class="gc-history-card" style="margin-top:${Math.round(pad*0.5)}px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:${fs}px;font-weight:700;color:var(--text2)">📋 결과 기록 (${hist.length})</span>
          <button onclick="_gcClearHistory()" style="font-size:${Math.max(10,fs-2)}px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;max-height:220px;overflow-y:auto">
          ${hist.slice().reverse().map((r,i)=>`
          <div class="gc-history-item" style="font-size:${fs}px">
            <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px;min-width:18px;text-align:right">${hist.length-i}</span>
            <span style="font-weight:700;flex:1;color:var(--text1)">${r.name}</span>
            <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px">${r.time}</span>
          </div>`).join('')}
        </div>
      </div>`;
    })()}
  `;

  // 오른쪽 패널: 사다리 캔버스 or 가챠 머신
  const rightPanelHTML = isLadder ? `
  <div style="${isWide?'flex:1;display:flex;flex-direction:column;align-items:center;margin-top:'+Math.round(pad*2.1)+'px':'display:flex;flex-direction:column;align-items:center;margin-top:'+Math.round(pad*2.1)+'px'}">
    <div class="gc-stage-card" style="width:100%;max-width:${ldCanvasW+20}px;box-sizing:border-box">
      <div class="gc-stage-head">
        <div>
          <div class="gc-stage-title">🪜 사다리 추첨</div>
          <div class="gc-stage-desc">이름을 클릭하면 사다리를 타고 결과까지 바로 연결됩니다.</div>
        </div>
      </div>
      <div id="ld-instruction" style="font-size:${fs}px;color:var(--text3);font-weight:600;margin-bottom:10px;text-align:center">이름을 클릭하면 사다리를 타요!</div>
      <canvas id="ld-canvas" width="${ldCanvasW}" height="${ldCanvasH}"
        style="width:${ldCanvasW}px;height:${ldCanvasH}px;border-radius:18px;border:2px solid var(--border);background:var(--white);cursor:pointer;display:block;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.08))"></canvas>
      <div id="ld-result-card" class="gc-card gc-card-soft" style="display:none;width:${ldCanvasW}px;margin-top:${pad}px;background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:2.5px solid #FF89AB;border-radius:20px;padding:${pad}px;text-align:center;box-sizing:border-box">
        <div style="font-size:${fs}px;font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:8px">🎊 당첨!</div>
        <div id="ld-res-name" style="font-size:${resTextSz}px;font-weight:900;color:#C0274A;margin-bottom:4px"></div>
        <div style="font-size:${fs}px;color:var(--text3);margin-bottom:8px">▼</div>
        <div id="ld-res-item" style="font-size:${resTextSz}px;font-weight:900;color:#2563eb"></div>
      </div>
    </div>
  </div>
  ` : `
  <div style="${isWide?'flex:1;display:flex;flex-direction:column;align-items:center;margin-top:'+Math.round(pad*2.1)+'px':'display:flex;flex-direction:column;align-items:center;margin-top:'+Math.round(pad*2.1)+'px'}">
    <div class="gc-stage-card" style="display:flex;flex-direction:column;align-items:center;width:100%;max-width:${bodyW+90}px;box-sizing:border-box">
      <div class="gc-stage-head" style="width:100%">
        <div>
          <div class="gc-stage-title">${isPlayer?'🎰 스트리머 구슬뽑기':'🗺️ 맵 구슬뽑기'}</div>
          <div class="gc-stage-desc">클릭 한 번으로 추첨하고, 결과는 팝업과 기록 카드로 깔끔하게 확인할 수 있습니다.</div>
        </div>
      </div>
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 8px 22px rgba(255,75,110,0.35))">
        <div style="position:relative;width:${dome}px;height:${dome}px">
          <div id="gc-dome" style="width:${dome}px;height:${dome}px;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.52),rgba(255,200,220,0.2) 55%,rgba(255,150,180,0.08));border:${Math.round(dome*0.042)}px solid white;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 ${Math.round(dome*0.21)}px rgba(255,255,255,0.5),0 ${Math.round(dome*0.035)}px ${Math.round(dome*0.12)}px rgba(200,60,90,0.22),0 0 0 ${Math.round(dome*0.024)}px #FFD6E4;position:relative"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse at 28% 22%,rgba(255,255,255,0.55) 0%,transparent 55%);pointer-events:none"></div>
        </div>
        <div style="width:${ringW}px;height:${ringH}px;background:linear-gradient(180deg,#fff 0%,#f8bbd0 60%,#f48fb1 100%);border-radius:0 0 ${Math.round(ringH*0.6)}px ${Math.round(ringH*0.6)}px;margin-top:${-Math.round(ringH*0.5)}px;position:relative;z-index:2;box-shadow:0 ${Math.round(ringH*0.22)}px 0 #FF4B6E"></div>
        <div style="width:${bodyW}px;background:linear-gradient(180deg,#FF4B6E 0%,#e53935 100%);margin-top:${-Math.round(dome*0.04)}px;border-radius:${Math.round(dome*0.08)}px ${Math.round(dome*0.08)}px ${Math.round(dome*0.22)}px ${Math.round(dome*0.22)}px;position:relative;z-index:1;box-shadow:0 ${Math.round(dome*0.042)}px 0 #C0274A;padding:${Math.round(dome*0.06)}px ${Math.round(dome*0.095)}px ${Math.round(dome*0.12)}px;display:flex;flex-direction:column;align-items:center;gap:${Math.round(dome*0.047)}px">
          <div id="gc-crank" onclick="_gcSpin()" title="클릭해서 뽑기!"
            style="width:${crankSz}px;height:${crankSz}px;background:radial-gradient(circle at 35% 28%,#ffffff,#d8d8d8);border:${Math.round(crankSz*0.083)}px solid #c8c8c8;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 ${Math.round(crankSz*0.083)}px 0 #aaa;transition:transform 0.8s cubic-bezier(0.4,0,0.2,1);user-select:none;position:relative;overflow:hidden">
            <div style="width:${Math.round(crankSz*0.69)}px;height:${Math.round(crankSz*0.19)}px;background:linear-gradient(180deg,#ccc,#999);border-radius:${Math.round(crankSz*0.12)}px;box-shadow:0 ${Math.round(crankSz*0.042)}px 0 #888"></div>
          </div>
          <div style="font-size:${Math.round(dome*0.07)}px;color:rgba(255,255,255,0.92);font-weight:700;letter-spacing:.5px">🎰 클릭해서 뽑기!</div>
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="position:relative;width:${exitW}px;height:${exitH}px;background:linear-gradient(180deg,#1a1a1a,#333);border-radius:${Math.round(exitW*0.12)}px ${Math.round(exitW*0.12)}px 0 0;box-shadow:inset 0 -${Math.round(exitH*0.14)}px ${Math.round(exitH*0.28)}px rgba(0,0,0,0.55)">
              <div id="gc-outcap" style="position:absolute;bottom:${-Math.round(exitCapSz*0.43)}px;left:50%;transform:translateX(-50%) scale(0);width:${exitCapSz}px;height:${exitCapSz}px;border-radius:50%;z-index:10;transition:0.65s cubic-bezier(0.175,0.885,0.32,1.45);border:${Math.round(exitCapSz*0.07)}px solid white;box-shadow:0 ${Math.round(exitCapSz*0.12)}px ${Math.round(exitCapSz*0.33)}px rgba(0,0,0,0.22)"></div>
            </div>
            <div style="width:${trayW}px;height:${trayH}px;background:linear-gradient(180deg,#d32f2f,#b71c1c);border-radius:0 0 ${Math.round(trayW*0.15)}px ${Math.round(trayW*0.15)}px;box-shadow:0 ${Math.round(trayH*0.29)}px 0 rgba(0,0,0,0.2)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div style="${innerLayout}">
    <div style="${inputColStyle}">
      <button onclick="_gcToggleInput()" id="gc-input-toggle" class="gc-input-toggle" style="font-size:${fs}px;margin-bottom:${Math.round(pad*0.5)}px">${_gcInputOpen?'📝 입력 접기 ▲':'📝 입력 펼치기 ▼'}</button>
      <div id="gc-input-body" style="display:${_gcInputOpen?'block':'none'}">
        ${inputBodyInner}
        ${ldItemsAlways}
      </div>
      ${gcResultHTML}
    </div>
    ${rightPanelHTML}
  </div>
</div>`;
}

function _gcSwitchTab(tab) {
  // (정리) 신규 탭 삭제: 호출되더라도 무시
  if (tab === 'new') tab = 'player';
  if (_gcTab === 'duck' && tab !== 'duck' && typeof _drCleanup === 'function') _drCleanup();
  if (_gcTab === 'ladder' && tab !== 'ladder') {
    if (typeof _ldAnimId2 !== 'undefined' && _ldAnimId2) { cancelAnimationFrame(_ldAnimId2); _ldAnimId2 = null; }
    if (typeof _ldAnimating !== 'undefined') _ldAnimating = false;
  }
  if (_gcTab === 'wheel' && tab !== 'wheel') {
    if (typeof _whAnimId !== 'undefined' && _whAnimId) { cancelAnimationFrame(_whAnimId); _whAnimId = null; }
    if (typeof _whSpinning !== 'undefined') _whSpinning = false;
  }
  if (_gcTab === 'teammatch' && tab !== 'teammatch' && typeof _tmCleanup === 'function') _tmCleanup();
  if (_gcTab === 'tiermatch' && tab !== 'tiermatch' && typeof _tiCleanup === 'function') _tiCleanup();
  if (_gcTab === 'quiz' && tab !== 'quiz' && typeof _pqCleanup === 'function') _pqCleanup();
  if (_gcTab === 'memory' && tab !== 'memory' && typeof _mmCleanup === 'function') _mmCleanup();
  if (_gcTab === 'mole' && tab !== 'mole' && typeof _mwCleanup === 'function') _mwCleanup();
  _gcTab = tab;
  render();
  if (tab === 'ladder') {
    setTimeout(()=>{ try{ if(typeof _ldInit==='function') _ldInit(); }catch(e){} }, 60);
  } else if (tab === 'duck') {
    setTimeout(()=>{ try{ if(typeof _drInit==='function') _drInit(); }catch(e){} }, 60);
  } else if (tab === 'wheel') {
    setTimeout(()=>{ try{ if(typeof _whInit==='function') _whInit(); }catch(e){} }, 60);
  } else if (tab === 'ppopgi') {
    setTimeout(()=>{ try{ if(typeof _ppgInit==='function') _ppgInit(); }catch(e){} }, 60);
  } else if (tab === 'teammatch') {
    setTimeout(()=>{ try{ if(typeof _tmInit==='function') _tmInit(); }catch(e){} }, 60);
  } else if (tab === 'tiermatch') {
    setTimeout(()=>{ try{ if(typeof _tiInit==='function') _tiInit(); }catch(e){} }, 60);
  } else if (tab === 'quiz') {
    setTimeout(()=>{ try{ if(typeof _pqInit==='function') _pqInit(); }catch(e){} }, 60);
  } else if (tab === 'memory') {
    setTimeout(()=>{ try{ if(typeof _mmInit==='function') _mmInit(); }catch(e){} }, 60);
  } else if (tab === 'mole') {
    setTimeout(()=>{ try{ if(typeof _mwInit==='function') _mwInit(); }catch(e){} }, 60);
  } else {
    setTimeout(()=>{ try{ if(typeof _gcSetup==='function') _gcSetup(); }catch(e){} }, 60);
  }
}

function _gcToggleInput() {
  _gcInputOpen = !_gcInputOpen;
  const body = document.getElementById('gc-input-body');
  const btn  = document.getElementById('gc-input-toggle');
  if (body) body.style.display = _gcInputOpen ? 'block' : 'none';
  if (btn)  btn.textContent    = _gcInputOpen ? '📝 입력 접기 ▲' : '📝 입력 펼치기 ▼';
}

function _gcSaveText(val) {
  _rLsSet(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m', val);
  // (요청사항) 확률(%) 표시는 제거
}

// (요청사항) 확률(%) 표시는 제거됨

function _gcToggleMap(mapName, el) {
  const inp = document.getElementById('gc-items-input');
  if (!inp) return;
  let items = inp.value.split(',').map(v=>v.trim()).filter(v=>v);
  const idx = items.findIndex(x=>{
    const m=String(x).match(/^(.*?)(?:\*(\d+(?:\.\d+)?))?$/);
    const n=(m?m[1]:x).trim();
    return n===mapName;
  });
  if (idx >= 0) {
    items.splice(idx, 1);
    el.style.background = 'var(--surface)';
    el.style.borderColor = 'var(--border)';
    el.style.color = 'var(--text2)';
  } else {
    items.push(mapName);
    el.style.background = '#FFF0F3';
    el.style.borderColor = '#FF4B6E';
    el.style.color = '#FF4B6E';
  }
  inp.value = items.join(', ');
  _gcSaveText(inp.value);
}

function _gcClearItems() {
  const inp = document.getElementById('gc-items-input');
  if (inp) inp.value = '';
  try{ localStorage.removeItem(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m'); }catch(e){}
  document.querySelectorAll('[data-map]').forEach(el => {
    el.style.background = 'var(--surface)';
    el.style.borderColor = 'var(--border)';
    el.style.color = 'var(--text2)';
  });
  // (요청사항) 확률(%) 표시는 제거
}

function _gcSetup() {
  const dome = document.getElementById('gc-dome');
  if (!dome) return;
  if (_gcAnimId) { cancelAnimationFrame(_gcAnimId); _gcAnimId = null; }
  _gcCapsules = [];
  dome.innerHTML = '';
  const D = window._GC_DOME, R = window._GC_CAP_R;
  const center = D / 2, limit = center - R - 4;
  for (let i = 0; i < 16; i++) {
    const cap = document.createElement('div');
    const [c1,c2] = _GC_COLORS[i % _GC_COLORS.length];
    cap.style.cssText = `position:absolute;width:${R*2}px;height:${R*2}px;border-radius:50%;background:radial-gradient(circle at 32% 28%,${c1},${c2});border:${Math.max(2,Math.round(R*0.15))}px solid rgba(255,255,255,0.75);box-shadow:2px 2px 5px rgba(0,0,0,0.13);will-change:transform`;
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * limit * 0.85;
    _gcCapsules.push({
      el: cap,
      x: center + Math.cos(ang)*r - R,
      y: center + Math.sin(ang)*r - R,
      vx: (Math.random()-.5)*2,
      vy: (Math.random()-.5)*2
    });
    dome.appendChild(cap);
  }
  _gcAnimLoop();
}

function _gcAnimLoop() {
  const dome = document.getElementById('gc-dome');
  if (!dome) { _gcAnimId = null; return; }
  const D = window._GC_DOME, R = window._GC_CAP_R;
  const center = D / 2, limit = center - R - 4;
  _gcCapsules.forEach(cap => {
    cap.x += cap.vx * _gcSpeedMult;
    cap.y += cap.vy * _gcSpeedMult;
    const dx = cap.x + R - center, dy = cap.y + R - center;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > limit) {
      const ang = Math.atan2(dy, dx);
      cap.x = center + Math.cos(ang)*limit - R;
      cap.y = center + Math.sin(ang)*limit - R;
      const nx = Math.cos(ang), ny = Math.sin(ang);
      const dot = cap.vx*nx + cap.vy*ny;
      cap.vx = (cap.vx - 2*dot*nx) + (Math.random()-.5)*.4;
      cap.vy = (cap.vy - 2*dot*ny) + (Math.random()-.5)*.4;
      const spd = Math.sqrt(cap.vx**2 + cap.vy**2);
      if (spd > 7) { cap.vx *= 7/spd; cap.vy *= 7/spd; }
    }
    cap.el.style.transform = `translate(${cap.x}px,${cap.y}px)`;
  });
  _gcAnimId = requestAnimationFrame(_gcAnimLoop);
}

function _gcSpin() {
  if (_gcSpinning) return;
  const inp = document.getElementById('gc-items-input');
  if (!inp) return;
  const parsed = _gcParseWeightedCSV(inp.value);
  if (!parsed.items.length) { alert('항목을 먼저 입력해주세요!'); return; }

  const card = document.getElementById('gc-result-card');
  if (card) card.style.display = 'none';
  if (_gcInputOpen) _gcToggleInput();

  _gcSpinning = true;
  try {
    if (!_gcAudioCtx) _gcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_gcAudioCtx.state === 'suspended') _gcAudioCtx.resume().catch(()=>{});
  } catch(e) {}

  const crank = document.getElementById('gc-crank');
  _gcTotalRot += 720;
  if (crank) {
    crank.style.transition = 'transform 0.85s cubic-bezier(0.4,0,0.2,1)';
    crank.style.transform = `rotate(${_gcTotalRot}deg)`;
  }

  (function(){
    const o = _gcAudioCtx.createOscillator(), g = _gcAudioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, _gcAudioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, _gcAudioCtx.currentTime + 0.75);
    g.gain.setValueAtTime(0.12, _gcAudioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, _gcAudioCtx.currentTime + 0.75);
    o.connect(g); g.connect(_gcAudioCtx.destination);
    o.start(); o.stop(_gcAudioCtx.currentTime + 0.75);
  })();

  _gcSpeedMult = 10;
  setTimeout(() => {
    _gcSpeedMult = 1;
    const outCap = document.getElementById('gc-outcap');
    if (outCap) {
      const [c1,c2] = _GC_COLORS[Math.floor(Math.random()*_GC_COLORS.length)];
      outCap.style.background = `radial-gradient(circle at 32% 28%,${c1},${c2})`;
      outCap.style.transform = 'translateX(-50%) scale(1.4)';
      outCap.style.bottom = `-${Math.round(window._GC_DOME * 0.17)}px`;
    }
    [0,0.08,0.16,0.27].forEach((t,i) => {
      setTimeout(() => {
        const o2 = _gcAudioCtx.createOscillator(), g2 = _gcAudioCtx.createGain();
        o2.type = 'sine'; o2.frequency.value = [523,659,784,1047][i];
        g2.gain.setValueAtTime(0.22, _gcAudioCtx.currentTime);
        g2.gain.exponentialRampToValueAtTime(0.01, _gcAudioCtx.currentTime + 0.28);
        o2.connect(g2); g2.connect(_gcAudioCtx.destination);
        o2.start(); o2.stop(_gcAudioCtx.currentTime + 0.28);
      }, t * 1000);
    });

    setTimeout(() => {
      const _histKey = _gcTab === 'player' ? 'player' : 'map';
      const _avoidNames = _gcRecentResults[_histKey] || [];
      const picked = _gcPickWeightedAvoidRepeat(parsed.items, parsed.total, _avoidNames) || parsed.items[0];
      const keyword = picked.name;
      _gcRememberRecent(_histKey, keyword);
      const p = _gcFindPlayer(keyword);
      const displayName = p ? p.name : keyword;
      const iconSz = Math.round(window._GC_DOME * 0.36);

      let icon = '';
      if (p) {
        if (p.photo) {
          icon = `<img src="${toHttpsUrl(p.photo)}" style="width:${iconSz}px;height:${iconSz}px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:4px solid #FF89AB;display:inline-block;animation:gcBounceIcon 0.65s ease 0.1s both" onerror="this.outerHTML='🎮'">`;
        } else {
          icon = p.race==='T'?'🤖':p.race==='Z'?'🐛':p.race==='P'?'💎':'🎮';
        }
      } else {
        const iconMap = {'투혼':'⚔️','블루':'💙','아즈':'🏛️','롱기':'🗡️','개마':'🏔️','포르':'🏰'};
        for (const [k,v] of Object.entries(iconMap)) if (keyword.includes(k)) { icon = v; break; }
        if (!icon) icon = ['🎰','⭐','🎮','🎯','✨','🌟','🎊'][Math.floor(Math.random()*7)];
      }

      const iconEl = document.getElementById('gc-pop-icon');
      if (iconEl) iconEl.innerHTML = icon.startsWith('<img') ? icon : `<span style="animation:gcBounceIcon 0.65s ease 0.1s both;display:inline-block">${icon}</span>`;
      const resEl = document.getElementById('gc-res-text');
      if (resEl) resEl.textContent = displayName;
      const probEl = document.getElementById('gc-res-prob');
      if (probEl) {
        probEl.textContent = '';
      }

      const histKey = _gcTab === 'player' ? 'player' : 'map';
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      _gcHistory[histKey].push({ name: displayName, time: timeStr });
      if (_gcHistory[histKey].length > 30) _gcHistory[histKey] = _gcHistory[histKey].slice(-30);
      try{ const _hk=histKey==='player'?'p':'m'; if(typeof MiscStore!=='undefined') MiscStore.set(`su_gc_hist_${_hk}`, _gcHistory[histKey]); else localStorage.setItem(`su_gc_hist_${_hk}`, JSON.stringify(_gcHistory[histKey])); }catch(e){}
      _gcRefreshHistory();

      const resultCard = document.getElementById('gc-result-card');
      if (resultCard) resultCard.style.display = 'none';

      // (요청사항) 결과는 팝업으로 표시
      try{
        if(typeof window._rrShowPopup==='function'){
          window._rrShowPopup('🎉 결과', `<div style="text-align:center;padding:6px 4px">
            <div style="font-size:46px;line-height:1;margin-bottom:10px">${(p && p.photo) ? '🎮' : (icon && !String(icon).startsWith('<') ? icon : '🎁')}</div>
            <div style="font-size:22px;font-weight:1000;color:var(--text1)">${displayName}</div>
          </div>`);
        }
      }catch(e){}
      _gcSpinning = false;
    }, 750);
  }, 950);
}

function _gcRefreshHistory() {
  const hist = _gcHistory[_gcTab === 'player' ? 'player' : 'map'];
  const fs = Math.max(13, Math.round(window._GC_DOME * 0.075));
  const pad = Math.max(14, Math.round(window._GC_DOME * 0.085));
  let container = document.getElementById('gc-hist-box');
  const resultCard = document.getElementById('gc-result-card');
  if (!container && resultCard) {
    container = document.createElement('div');
    container.id = 'gc-hist-box';
    resultCard.parentNode.insertBefore(container, resultCard.nextSibling);
  }
  if (!container) return;
  if (!hist.length) { container.innerHTML = ''; return; }
  container.className = 'gc-history-card';
  container.style.cssText = `margin-top:${Math.round(pad*0.5)}px`;
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:${fs}px;font-weight:700;color:var(--text2)">📋 결과 기록 (${hist.length})</span>
      <button onclick="_gcClearHistory()" style="font-size:${Math.max(10,fs-2)}px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:5px;max-height:220px;overflow-y:auto">
      ${hist.slice().reverse().map((r,i)=>`
      <div class="gc-history-item" style="font-size:${fs}px">
        <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px;min-width:18px;text-align:right">${hist.length-i}</span>
        <span style="font-weight:700;flex:1;color:var(--text1)">${r.name}</span>
        <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px">${r.time}</span>
      </div>`).join('')}
    </div>`;
}

function _gcClearHistory() {
  const key = _gcTab === 'player' ? 'player' : 'map';
  _gcHistory[key] = [];
  try{ const _hk=key==='player'?'p':'m'; if(typeof MiscStore!=='undefined') MiscStore.delete(`su_gc_hist_${_hk}`); else localStorage.removeItem(`su_gc_hist_${_hk}`); }catch(e){}
  _gcRefreshHistory();
}

function _gcReset() {
  _gcSpinning = false;
  const outCap = document.getElementById('gc-outcap');
  if (outCap) { outCap.style.transform = 'translateX(-50%) scale(0)'; outCap.style.bottom = `-${Math.round(window._GC_DOME * 0.1)}px`; }
  const card = document.getElementById('gc-result-card');
  if (card) card.style.display = 'none';
}

function _gcConfetti() {
  const colors = ['#FF4B6E','#FFD54F','#CE93D8','#80DEEA','#A5D6A7','#FF80AB','#FFF176'];
  for (let i = 0; i < 45; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      const sz = 6 + Math.random() * 9;
      el.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-15px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${sz}px;height:${sz}px;border-radius:${Math.random()>.5?'50%':'4px'};z-index:600;pointer-events:none;animation:gcConfettiFall ${1.2+Math.random()*.9}s ease-in ${Math.random()*.4}s forwards`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }, i * 20);
  }
}

// ─── 사다리 게임 ────────────────────────────────────────────────────────────
let _ldLadder    = null;
let _ldAnimating = false;
let _ldAnimId2   = null;

function _ldSaveNames(val) { _rLsSet('su_ld_names', val); }
function _ldSaveItems(val) { _rLsSet('su_ld_items', val); }

function _ldBuildLadder(names, items) {
  const n = names.length;
  const rowCount = Math.max(8, n * 3);
  const rungs = [];
  for (let row = 1; row < rowCount; row++) {
    let lastCol = -2;
    for (let col = 0; col < n - 1; col++) {
      if (col > lastCol + 1 && Math.random() < 0.45) {
        rungs.push({ row, col });
        lastCol = col;
      }
    }
  }
  return { n, rowCount, names: [...names], items: [...items], rungs };
}

function _ldGetPath(nameIdx, ladder, colX, rowY) {
  let col = nameIdx;
  const pts = [{ x: colX(col), y: rowY(0) }];
  for (let row = 1; row < ladder.rowCount; row++) {
    const y = rowY(row);
    const rRight = ladder.rungs.find(r => r.row === row && r.col === col);
    const rLeft  = ladder.rungs.find(r => r.row === row && r.col === col - 1);
    pts.push({ x: colX(col), y });
    if (rRight)     { col++; pts.push({ x: colX(col), y }); }
    else if (rLeft) { col--; pts.push({ x: colX(col), y }); }
  }
  pts.push({ x: colX(col), y: rowY(ladder.rowCount) });
  return { pts, resultCol: col };
}

function _ldRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function _ldDrawCanvas(ladder, highlightPts, animProgress) {
  const canvas = document.getElementById('ld-canvas');
  if (!canvas || !ladder) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const n = ladder.n;
  const padTop = 50, padBot = 55;
  const lineTop = padTop, lineBot = H - padBot;
  const lineH = lineBot - lineTop;
  const spacing = n > 1 ? (W - 60) / (n - 1) : W - 60;
  const padX = 30;
  const colX  = i => padX + i * spacing;
  const rowY  = r => lineTop + (r / ladder.rowCount) * lineH;
  const bw    = Math.min(spacing * 0.85, 72);
  const bh    = 28;
  const fSize = Math.max(10, Math.min(14, Math.round(bw * 0.22)));

  ctx.clearRect(0, 0, W, H);

  // 세로 줄
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e2e8f0';
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(colX(i), lineTop);
    ctx.lineTo(colX(i), lineBot);
    ctx.stroke();
  }

  // 가로 줄 (런그)
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  for (const rung of ladder.rungs) {
    const y = rowY(rung.row);
    ctx.beginPath();
    ctx.moveTo(colX(rung.col), y);
    ctx.lineTo(colX(rung.col + 1), y);
    ctx.stroke();
  }

  const COLORS = ['#FF4B6E','#a78bfa','#34d399','#fbbf24','#60a5fa','#f472b6','#fb923c','#a3e635','#e879f9','#38bdf8'];

  // 이름 박스 (상단)
  for (let i = 0; i < n; i++) {
    const x = colX(i);
    ctx.fillStyle = COLORS[i % COLORS.length];
    _ldRoundRect(ctx, x - bw/2, 5, bw, bh, 7);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(_ldFitText(ctx, ladder.names[i], bw - 8), x, 5 + bh / 2);
  }

  // 결과 박스 (하단)
  for (let i = 0; i < n; i++) {
    const x = colX(i);
    const y = H - padBot + 10;
    ctx.fillStyle = '#f1f5f9';
    _ldRoundRect(ctx, x - bw/2, y, bw, bh, 7);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    _ldRoundRect(ctx, x - bw/2, y, bw, bh, 7);
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.font = `bold ${fSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(_ldFitText(ctx, ladder.items[i], bw - 8), x, y + bh / 2);
  }

  // 경로 하이라이트
  if (highlightPts && highlightPts.length >= 2) {
    let totalLen = 0;
    for (let i = 1; i < highlightPts.length; i++) {
      const dx = highlightPts[i].x - highlightPts[i-1].x;
      const dy = highlightPts[i].y - highlightPts[i-1].y;
      totalLen += Math.sqrt(dx*dx + dy*dy);
    }
    const drawLen = totalLen * (animProgress == null ? 1 : animProgress);
    let rem = drawLen;
    ctx.beginPath();
    ctx.moveTo(highlightPts[0].x, highlightPts[0].y);
    ctx.strokeStyle = '#FF4B6E';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < highlightPts.length && rem > 0; i++) {
      const dx = highlightPts[i].x - highlightPts[i-1].x;
      const dy = highlightPts[i].y - highlightPts[i-1].y;
      const segLen = Math.sqrt(dx*dx + dy*dy);
      if (rem >= segLen) {
        ctx.lineTo(highlightPts[i].x, highlightPts[i].y);
        rem -= segLen;
      } else {
        const t = rem / segLen;
        ctx.lineTo(highlightPts[i-1].x + dx*t, highlightPts[i-1].y + dy*t);
        rem = 0;
      }
    }
    ctx.stroke();
  }
}

function _ldFitText(ctx, text, maxW) {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s + '…';
}

function _ldInit() {
  const canvas = document.getElementById('ld-canvas');
  if (!canvas) return;
  if (_ldAnimId2) { cancelAnimationFrame(_ldAnimId2); _ldAnimId2 = null; }
  _ldAnimating = false;

  const namesText = _rLsGet('su_ld_names', '') || '';
  const itemsText = _rLsGet('su_ld_items', '') || '';
  const names = namesText.split(',').map(v=>v.trim()).filter(v=>v);
  const items = itemsText.split(',').map(v=>v.trim()).filter(v=>v);

  const ctx = canvas.getContext('2d');

  if (names.length < 2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('참가자를 2명 이상 입력하세요', canvas.width/2, canvas.height/2);
    return;
  }

  const n = names.length;
  const normItems = Array.from({length: n}, (_, i) => items[i] || `${i+1}번`);

  const instr0 = document.getElementById('ld-instruction');
  if (items.length > 0 && items.length < n && instr0) {
    instr0.innerHTML = `⚠️ 결과 항목이 ${n}명보다 적습니다 (${items.length}개). 부족한 항목은 번호로 자동 채워집니다.`;
    instr0.style.color = '#e67e22';
  }

  if (!_ldLadder || _ldLadder.n !== n) {
    _ldLadder = _ldBuildLadder(names, normItems);
  } else {
    _ldLadder.names = [...names];
    _ldLadder.items = [...normItems];
  }

  _ldDrawCanvas(_ldLadder, null, null);
  _ldRefreshHistory();

  function _ldHandleClick(clientX, clientY) {
    if (_ldAnimating) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (clientX - rect.left) * scaleX;
    const cy = (clientY - rect.top)  * scaleY;
    if (cy > 50) return;
    const n2 = _ldLadder.n;
    const spacing2 = n2 > 1 ? (canvas.width - 60) / (n2 - 1) : canvas.width - 60;
    const bw2 = Math.min(spacing2 * 0.85, 72);
    for (let i = 0; i < n2; i++) {
      const bx = 30 + i * spacing2;
      if (cx >= bx - bw2/2 && cx <= bx + bw2/2) {
        _ldAnimate(i);
        break;
      }
    }
  }
  canvas.onclick = null;
  canvas.ontouchend = null;
  canvas.onclick = (e) => _ldHandleClick(e.clientX, e.clientY);
  canvas.ontouchend = (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    _ldHandleClick(t.clientX, t.clientY);
  };
}

function _ldRebuild() {
  _ldLadder = null; // 강제 초기화 → _ldInit에서 새 사다리 빌드 + onclick 재등록
  _ldInit();
}

function _ldAnimate(nameIdx) {
  if (!_ldLadder || _ldAnimating) return;
  const canvas = document.getElementById('ld-canvas');
  if (!canvas) return;

  const W = canvas.width, H = canvas.height;
  const n = _ldLadder.n;
  const padTop = 50, padBot = 55;
  const lineTop = padTop, lineBot = H - padBot;
  const lineH = lineBot - lineTop;
  const spacing = n > 1 ? (W - 60) / (n - 1) : W - 60;
  const colX = i => 30 + i * spacing;
  const rowY = r => lineTop + (r / _ldLadder.rowCount) * lineH;

  const { pts, resultCol } = _ldGetPath(nameIdx, _ldLadder, colX, rowY);

  let totalLen = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
    totalLen += Math.sqrt(dx*dx + dy*dy);
  }
  const duration = Math.max(900, Math.min(2200, totalLen * 1.6));
  const startTime = performance.now();
  _ldAnimating = true;

  const rc = document.getElementById('ld-result-card');
  if (rc) rc.style.display = 'none';
  const instr = document.getElementById('ld-instruction');
  if (instr) instr.textContent = '⏳ 이동 중...';

  // 자동 입력창 접기
  if (_gcInputOpen) _gcToggleInput();

  function frame(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    _ldDrawCanvas(_ldLadder, pts, progress);
    if (progress < 1) {
      _ldAnimId2 = requestAnimationFrame(frame);
    } else {
      _ldAnimating = false;
      _ldAnimId2 = null;
      if (instr) instr.textContent = '이름을 클릭하면 사다리를 타요!';

      const resName = _ldLadder.names[nameIdx];
      const resItem = _ldLadder.items[resultCol];

      if (rc) rc.style.display = 'none';

      // (요청사항) 결과는 팝업으로 표시
      try{
        if(typeof window._rrShowPopup==='function'){
          window._rrShowPopup('🪜 사다리 결과', `<div style="text-align:center;padding:6px 4px">
            <div style="font-size:18px;font-weight:1000;color:var(--text1);margin-bottom:6px">${resName}</div>
            <div style="font-size:12px;color:var(--text3);margin-bottom:6px">▼</div>
            <div style="font-size:20px;font-weight:1000;color:#2563eb">${resItem}</div>
          </div>`);
        }
      }catch(e){}

      // 기록 저장
      const now2 = new Date();
      const timeStr = String(now2.getHours()).padStart(2,'0') + ':' + String(now2.getMinutes()).padStart(2,'0');
      _gcHistory.ladder.push({ name: resName, item: resItem, time: timeStr });
      if (_gcHistory.ladder.length > 30) _gcHistory.ladder = _gcHistory.ladder.slice(-30);
      try{ if(typeof MiscStore!=='undefined') MiscStore.set('su_gc_hist_l', _gcHistory.ladder); else localStorage.setItem('su_gc_hist_l', JSON.stringify(_gcHistory.ladder)); }catch(e){}
      _ldRefreshHistory();

      // 효과음
      try {
        if (!_gcAudioCtx) _gcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (_gcAudioCtx.state === 'suspended') _gcAudioCtx.resume().catch(()=>{});
      } catch(e) {}
      [0, 0.08, 0.16, 0.27].forEach((t, i) => {
        setTimeout(() => {
          const o = _gcAudioCtx.createOscillator(), g = _gcAudioCtx.createGain();
          o.type = 'sine'; o.frequency.value = [523,659,784,1047][i];
          g.gain.setValueAtTime(0.18, _gcAudioCtx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.01, _gcAudioCtx.currentTime + 0.25);
          o.connect(g); g.connect(_gcAudioCtx.destination);
          o.start(); o.stop(_gcAudioCtx.currentTime + 0.25);
        }, t * 1000);
      });
    }
  }
  requestAnimationFrame(frame);
}

function _ldRefreshHistory() {
  const hist = _gcHistory.ladder;
  const container = document.getElementById('ld-hist-box');
  if (!container) return;
  const fs  = Math.max(12, Math.round(window._GC_DOME * 0.07));
  const pad = Math.max(12, Math.round(window._GC_DOME * 0.08));
  if (!hist.length) { container.innerHTML = ''; return; }
  container.style.cssText = `background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-top:${Math.round(pad*0.5)}px`;
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:${fs}px;font-weight:700;color:var(--text2)">📋 결과 기록 (${hist.length})</span>
      <button onclick="_ldClearHistory()" style="font-size:${Math.max(10,fs-2)}px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;max-height:180px;overflow-y:auto">
      ${hist.slice().reverse().map((r,i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--surface);border-radius:8px;font-size:${fs}px">
        <span style="color:var(--text3);min-width:18px;text-align:right">${hist.length-i}</span>
        <span style="font-weight:700;color:#FF4B6E">${r.name}</span>
        <span style="color:var(--text3)">→</span>
        <span style="font-weight:700;flex:1;color:var(--text1)">${r.item}</span>
        <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px">${r.time}</span>
      </div>`).join('')}
    </div>`;
}

function _ldClearHistory() {
  _gcHistory.ladder = [];
  try{ if(typeof MiscStore!=='undefined') MiscStore.delete('su_gc_hist_l'); else localStorage.removeItem('su_gc_hist_l'); }catch(e){}
  _ldRefreshHistory();
}

function _mbInit() {
  const root = document.getElementById('mb-root');
  if (!root) return;
  root.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3)">마블 룰렛 기능은 현재 개발 중입니다.</div>';
}
