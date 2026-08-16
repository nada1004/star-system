/* ══════════════════════════════════════════════════════════════
   룰렛 - 공용 유틸(localStorage/esc) (roulette.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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

// ─────────────────────────────────────────────────────────────
// (추가) 룰렛/게임 탭 그룹 분리 — "🎰 룰렛·추첨" / "🎮 미니게임"
// ─────────────────────────────────────────────────────────────
const _GC_ROULETTE_TABS = [
  { id: 'player',    icon: '🎰',    label: '구슬뽑기' },
  { id: 'map',       icon: '🗺️',   label: '맵뽑기' },
  { id: 'ladder',    icon: '🪜',    label: '사다리' },
  { id: 'duck',      icon: '🐥',    label: '경주' },
  { id: 'wheel',     icon: '🎡',    label: '휠' },
  { id: 'ppopgi',    icon: '🎁',    label: '뽑기' },
  { id: 'teamsplit', icon: '👥',    label: '팀나누기' },
  { id: 'bracket',   icon: '🏆',    label: '대진표' }
];
const _GC_GAME_TABS = [
  { id: 'teammatch', icon: '🧩',   label: '소속매칭' },
  { id: 'tiermatch', icon: '🎖️',  label: '티어매칭' },
  { id: 'quiz',      icon: '🖼️',  label: '얼굴맞추기' },
  { id: 'memory',    icon: '🃏',   label: '짝맞추기' },
  { id: 'mole',      icon: '🐹',   label: '두더지' },
  { id: 'omok',      icon: '⚫⚪', label: '오목' },
  { id: 'janggi',    icon: '♟️',  label: '장기' },
  { id: 'othello',   icon: '🟢',   label: '오델로' }
];
const _GC_TAB_GROUP = {};
_GC_ROULETTE_TABS.forEach(t => { _GC_TAB_GROUP[t.id] = 'roulette'; });
_GC_GAME_TABS.forEach(t => { _GC_TAB_GROUP[t.id] = 'game'; });
// 그룹별로 마지막에 보고 있던 서브탭을 기억해뒀다가, 그룹 전환 시 그 탭으로 복귀
let _gcLastTab = { roulette: 'player', game: 'teammatch' };
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

