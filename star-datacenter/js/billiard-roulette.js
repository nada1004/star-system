/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 동적으로 필요시 로드 필요. */
// ─── 🎱 당구브레이크 룰렛 ──────────────────────────────────────────────────────

(function _blInjectCSS() {
  if (document.getElementById('bl-style')) return;
  const s = document.createElement('style');
  s.id = 'bl-style';
  s.textContent = [
    '#bl-root{font-family:inherit;width:100%}',
    '.bl-shell{display:flex;flex-direction:column;gap:14px}',
    '.bl-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:24px;box-shadow:0 18px 38px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.9)}',
    '.bl-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px}',
    '.bl-hero-title{font-size:var(--fs-lg);font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '.bl-hero-desc{margin-top:5px;font-size:var(--fs-sm);line-height:1.6;color:var(--text3)}',
    '.bl-badge-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}',
    '.bl-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.88);border:1px solid rgba(148,163,184,.16);font-size:var(--fs-caption);font-weight:900;color:var(--text2);box-shadow:0 10px 18px rgba(15,23,42,.04)}',
    '.bl-setup-panel{padding:0 20px 18px}',
    '.bl-textarea{width:100%;border:1px solid rgba(148,163,184,.24);border-radius:18px;padding:12px 14px;font-size:var(--fs-md);line-height:1.7;resize:none;color:var(--text1);background:linear-gradient(180deg,#fff,#f8fafc);font-family:inherit;box-sizing:border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,.9);outline:none;transition:border-color .18s,box-shadow .18s}',
    '.bl-textarea:focus{border-color:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.12)}',
    '.bl-chipbox{display:flex;flex-wrap:wrap;gap:6px;padding:0 20px 4px}',
    '.bl-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,#fff,#f8fafc);border-radius:999px;font-size:var(--fs-sm);font-weight:900;color:var(--text2);box-shadow:0 8px 18px rgba(15,23,42,.04)}',
    '.bl-chip-x{border:none;background:transparent;color:var(--gray-l);cursor:pointer;font-weight:1000;font-size:var(--fs-sm);line-height:1}',
    '.bl-btn-primary{background:linear-gradient(135deg,#22c55e,#15803d 52%,#065f46);color:#fff;border:none;border-radius:999px;padding:12px 28px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 7px 0 #064e3b,0 18px 30px rgba(21,128,61,.22);transition:transform .1s,box-shadow .1s;font-family:inherit}',
    '.bl-btn-primary:active{transform:translateY(3px);box-shadow:0 1px 0 #064e3b}',
    '.bl-btn-primary:disabled{opacity:.6;cursor:default}',
    '.bl-btn-secondary{background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);border:1px solid rgba(148,163,184,.22);border-radius:14px;padding:9px 16px;font-size:var(--fs-base);font-weight:700;cursor:pointer;font-family:inherit;transition:.1s;box-shadow:0 10px 18px rgba(15,23,42,.04)}',
    '.bl-btn-secondary:hover{border-color:var(--text3)}',
    '.bl-table-panel{padding:16px 18px 18px}',
    '.bl-table-meta{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}',
    '.bl-table-title{font-size:16px;font-weight:950;color:var(--text1);letter-spacing:-.02em}',
    '.bl-table-desc{margin-top:4px;font-size:var(--fs-sm);line-height:1.55;color:var(--text3)}',
    '.bl-felt-wrap{position:relative;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 20px 38px rgba(15,23,42,.16),inset 0 1px 0 rgba(255,255,255,.15)}',
    '.bl-felt-wrap.bl-shake{animation:blShake .32s ease}',
    '@keyframes blShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(2px)}}',
    '.bl-status{margin-top:12px;font-size:var(--fs-base);font-weight:800;color:#fff;text-align:center;display:inline-block;padding:8px 20px;border-radius:999px;background:linear-gradient(135deg,#16a34a,#065f46);box-shadow:0 8px 18px rgba(6,95,70,.28);transition:transform .15s}',
    '.bl-status-wrap{text-align:center}',
    '.bl-status.bl-pulse{animation:blStatusPulse .4s ease}',
    '@keyframes blStatusPulse{0%{transform:scale(1)}40%{transform:scale(1.12)}100%{transform:scale(1)}}',
    '.bl-result-card{background:linear-gradient(135deg,#ECFDF5,#F0FDF4);border:1px solid rgba(21,128,61,.28);border-radius:24px;padding:22px 24px;text-align:center;margin-top:14px;animation:blPopIn .4s cubic-bezier(.175,.885,.32,1.35);box-shadow:0 20px 36px rgba(21,128,61,.14)}',
    '.bl-result-trophy{font-size:52px;display:block;margin-bottom:4px}',
    '.bl-result-winner{font-size:clamp(22px,5vw,36px);font-weight:900;color:#15803d;margin:6px 0 12px;word-break:keep-all}',
    '.bl-history-card{margin-top:2px;padding:14px 16px}',
    '.bl-hist-item{display:flex;align-items:center;gap:8px;padding:8px 10px;background:linear-gradient(180deg,#fff,#f8fafc);border-radius:12px;border:1px solid rgba(148,163,184,.18);box-shadow:0 8px 18px rgba(15,23,42,.04)}',
    '@keyframes blPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}',
    'body.dark .bl-card,body.dark .bl-history-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55;box-shadow:0 22px 42px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark .bl-badge,body.dark .bl-btn-secondary,body.dark .bl-hist-item,body.dark .bl-chip{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .bl-textarea{background:linear-gradient(180deg,#132033,#0f172a);border-color:#334155;color:#f8fafc}',
    'body.dark .bl-hero-title,body.dark .bl-table-title{color:#f8fafc}',
    'body.dark .bl-hero-desc,body.dark .bl-table-desc{color:#94a3b8}',
    'body.dark .bl-result-card{background:linear-gradient(180deg,rgba(6,78,59,.35),rgba(15,23,42,.9));border-color:rgba(34,197,94,.28)}',
    '.bl-popup-wrap{position:relative;text-align:center;padding:0;overflow:hidden}',
    '.bl-popup-felt{position:relative;margin:2px 4px 14px;padding:22px 14px 20px;border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at 50% 0%, #1a7a4a 0%, #0d5c37 55%, #073b24 100%);box-shadow:inset 0 0 0 6px #5c3418,inset 0 0 0 9px rgba(0,0,0,.25),0 14px 26px rgba(0,0,0,.28)}',
    '.bl-popup-felt::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 8%, rgba(255,255,255,.16), transparent 55%);pointer-events:none}',
    '.bl-popup-glow{position:absolute;inset:-40px;background:radial-gradient(circle, var(--wc) 0%, transparent 62%);opacity:.4;filter:blur(20px);animation:blGlowPulse 1.7s ease-in-out infinite;pointer-events:none}',
    '@keyframes blGlowPulse{0%,100%{transform:scale(1);opacity:.32}50%{transform:scale(1.18);opacity:.54}}',
    '.bl-popup-confetti{position:relative;font-size:20px;letter-spacing:12px;opacity:.95;animation:blConfettiDrop .8s ease-out;margin-bottom:6px}',
    '@keyframes blConfettiDrop{0%{transform:translateY(-20px);opacity:0}40%{opacity:1}100%{transform:translateY(0);opacity:.95}}',
    '.bl-popup-ball-shadow{position:relative;width:78px;height:16px;margin:0 auto -14px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.42),transparent 72%);filter:blur(1px)}',
    '.bl-popup-ball{position:relative;width:92px;height:92px;border-radius:50%;margin:0 auto 4px;background:radial-gradient(circle at 32% 26%, #fff, var(--wc) 46%, var(--wc));box-shadow:0 4px 0 rgba(0,0,0,.18) inset,0 16px 26px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;animation:blBallBounceIn .55s cubic-bezier(.34,1.56,.64,1)}',
    '@keyframes blBallBounceIn{0%{transform:scale(0) rotate(-40deg);opacity:0}55%{transform:scale(1.18) rotate(10deg);opacity:1}100%{transform:scale(1) rotate(0)}}',
    '.bl-popup-ball-label{width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,.96);box-shadow:0 1px 3px rgba(0,0,0,.18) inset;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:#111;padding:2px;text-align:center;line-height:1.15;word-break:keep-all;overflow:hidden}',
    '.bl-popup-winner-name{position:relative;font-size:clamp(22px,6vw,32px);font-weight:1000;letter-spacing:-.02em;margin:10px 0 4px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.35)}',
    '.bl-popup-tag{position:relative;display:inline-flex;align-items:center;gap:5px;padding:3px 11px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);font-size:11px;font-weight:800;color:rgba(255,255,255,.92);letter-spacing:.02em}',
    '.bl-popup-info-row{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;flex-wrap:wrap}',
    '.bl-popup-prob-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:999px;background:rgba(120,120,120,.1);font-weight:800;font-size:var(--fs-sm);color:var(--text2)}',
    '.bl-popup-sub{font-size:var(--fs-caption);color:var(--text3);font-weight:700}',
    '.bl-popup-actions{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:16px}',
    '.bl-popup-link{border:none;background:transparent;color:var(--text3);font-weight:700;font-size:var(--fs-caption);cursor:pointer;padding:2px 4px;text-decoration:underline;text-underline-offset:2px}',
    'body.dark .bl-popup-prob-chip{background:rgba(255,255,255,.08)}',
    '@media (max-width:760px){.bl-hero,.bl-table-meta{flex-direction:column}.bl-badge-row{justify-content:flex-start}.bl-setup-panel,.bl-table-panel{padding-left:14px;padding-right:14px}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 상수 ────────────────────────────────────────────────────────────────────
const _BL_W = 800, _BL_H = 420;
const _BL_X0 = 34, _BL_Y0 = 34, _BL_X1 = 766, _BL_Y1 = 386;
const _BL_BALL_R = 16.5;
const _BL_POCKET_R = 24;
const _BL_POCKETS = [
  { x:_BL_X0, y:_BL_Y0 }, { x:(_BL_X0+_BL_X1)/2, y:_BL_Y0 }, { x:_BL_X1, y:_BL_Y0 },
  { x:_BL_X0, y:_BL_Y1 }, { x:(_BL_X0+_BL_X1)/2, y:_BL_Y1 }, { x:_BL_X1, y:_BL_Y1 },
];
const _BL_COLORS = [
  '#FDE047','#3B82F6','#EF4444','#8B5CF6','#F97316','#22C55E','#7C2D12',
  '#F472B6','#06B6D4','#EAB308','#10B981','#6366F1','#F59E0B','#EC4899','#0EA5E9',
];
const _BL_MAX_N = 15;
const _BL_FRICTION = 0.9935;
const _BL_WALL_REST = 0.86;
const _BL_BALL_REST = 0.94;
const _BL_SUBSTEPS = 3;
const _BL_BREAK_MAX_FRAMES = 260;
const _BL_FINISH_FRAMES = 46;
const _BL_AIM_FRAMES = 34;
const _BL_STICK_LEN = 150;
const _BL_STATUS_AIM = ['🎯 조준 중...', '🤏 신중하게...'];
const _BL_STATUS_BREAK = ['🎱 공이 흩어지는 중...', '💥 짜릿한 충돌!', '🌀 어디로 튈까...', '🔥 긴장되는 순간!'];
const _BL_STATUS_FINISH = ['🎯 당첨 공이 포켓으로!', '✨ 거의 다 왔다...'];

// ─── 상태 ────────────────────────────────────────────────────────────────────
let _blSt        = null;
let _blAnimId     = null;
let _blAC         = null;
let _blBreaking   = false;
let _blInputCache = localStorage.getItem('su_bl_input') || '';
let _blHistory    = [];
try { _blHistory = JSON.parse(localStorage.getItem('su_bl_hist') || '[]'); } catch(e) {}
(async function _blLoadFromIdb(){
  try{
    if (typeof MiscStore === 'undefined') return;
    const inp = await MiscStore.get('su_bl_input');
    if (typeof inp === 'string') _blInputCache = inp;
    const hist = await MiscStore.get('su_bl_hist');
    if (Array.isArray(hist)) _blHistory = hist;
  }catch(e){}
})();

// ─── 가중치 파서 ("이름*2" 지원) ─────────────────────────────────────────────
function _blParseWeightedCSV(text){
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
  const entries=[...map.entries()].map(([name,weight])=>({name,weight}));
  const total=entries.reduce((s,x)=>s+x.weight,0)||0;
  return {entries,total};
}

function _blRemoveOne(name){
  const ta = document.getElementById('bl-input');
  if (!ta) return;
  const raw = String(ta.value||'');
  const tokens = raw.split(',').map(v=>v.trim()).filter(Boolean);
  const idx = tokens.findIndex(t=>{
    const m=t.match(/^(.*?)(?:\*(\d+(?:\.\d+)?))?$/);
    return ((m?m[1]:t)||'').trim()===name;
  });
  if (idx>=0) tokens.splice(idx,1);
  const next = tokens.join(', ');
  ta.value = next;
  _blOnInput(next);
}

function _blShuffleInput(){
  const ta = document.getElementById('bl-input');
  const raw = ta ? ta.value : _blInputCache;
  const tokens = raw.split(',').map(v=>v.trim()).filter(Boolean);
  for (let i=tokens.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [tokens[i],tokens[j]] = [tokens[j],tokens[i]];
  }
  const next = tokens.join(', ');
  if (ta) ta.value = next;
  _blOnInput(next);
}

function _blOnInput(val){
  _blInputCache = val;
  try{ if(typeof MiscStore!=='undefined') MiscStore.set('su_bl_input', val); else localStorage.setItem('su_bl_input', val); }catch(e){}
  const chipbox = document.getElementById('bl-chipbox');
  if (chipbox) chipbox.innerHTML = _blChipsHTML(val);
  const badge = document.getElementById('bl-count-badge');
  const parsed = _blParseWeightedCSV(val);
  if (badge) badge.textContent = '✨ 참가자 ' + parsed.entries.length + '명';
}

function _blChipsHTML(val){
  const parsed = _blParseWeightedCSV(val);
  return parsed.entries.map(function(it){
    const nmDisp = String(it.name||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const nmJs = String(it.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return '<span class="bl-chip">' + nmDisp + '<button class="bl-chip-x" onclick="_blRemoveOne(\'' + nmJs + '\')">✕</button></span>';
  }).join('');
}

// ─── 이력 관리 ───────────────────────────────────────────────────────────────
function _blAddHistory(name, color){
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  _blHistory.unshift({ name: name, time: timeStr, color: color || '#22c55e' });
  _blHistory = _blHistory.slice(0,15);
  try{ if(typeof MiscStore!=='undefined') MiscStore.set('su_bl_hist', _blHistory); else localStorage.setItem('su_bl_hist', JSON.stringify(_blHistory)); }catch(e){}
}
function _blClearHistory(){
  _blHistory = [];
  try{ if(typeof MiscStore!=='undefined') MiscStore.delete('su_bl_hist'); else localStorage.removeItem('su_bl_hist'); }catch(e){}
  const box = document.getElementById('bl-hist-box');
  if (box) box.outerHTML = _blHistHTML();
}
function _blHistHTML(){
  if (!_blHistory.length) return '<div id="bl-hist-box"></div>';
  const rows = _blHistory.slice(0,8).map(function(h,i){
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'위';
    const dot = '<span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:' + (h.color||'#22c55e') + ';border:1.5px solid rgba(0,0,0,.18);flex-shrink:0"></span>';
    return '<div class="bl-hist-item">'
      + '<span style="font-size:var(--fs-md);min-width:26px">' + medal + '</span>'
      + dot
      + '<span style="font-weight:700;color:var(--text1);flex:1">' + h.name + '</span>'
      + '<span style="font-size:var(--fs-caption);color:var(--text3)">' + h.time + '</span>'
      + '</div>';
  }).join('');
  return '<div id="bl-hist-box" class="bl-card bl-history-card">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    + '<span style="font-size:var(--fs-base);font-weight:700;color:var(--text2)">📋 최근 브레이크 결과</span>'
    + '<button onclick="_blClearHistory()" class="bl-btn-secondary" style="font-size:var(--fs-caption);padding:3px 8px">전체 삭제</button>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:7px">' + rows + '</div></div>';
}

// ─── 공개 API ────────────────────────────────────────────────────────────────
function _blInit(){
  const root = document.getElementById('bl-root');
  if (!root) return;
  if (_blSt && (_blSt.running || _blSt.finished)) {
    _blRenderTable(root);
  } else {
    _blSt = null;
    _blRenderSetup(root, _blInputCache);
  }
}

function _blCleanup(){
  if (_blAnimId) { cancelAnimationFrame(_blAnimId); _blAnimId = null; }
  _blBreaking = false;
  _blSt = null;
}

// ─── 셋업 화면 ───────────────────────────────────────────────────────────────
function _blRenderSetup(root, saved){
  const parsed = _blParseWeightedCSV(saved);
  root.innerHTML =
    '<div class="bl-shell">'
    + '<div class="bl-card">'
    + '<div class="bl-hero">'
    + '<div>'
    + '<div class="bl-hero-title">🎱 당구 브레이크 룰렛</div>'
    + '<div class="bl-hero-desc">이름을 넣고 브레이크 샷을 날리면, 공이 흩어지다가 마지막에 당첨자가 포켓으로 빨려 들어갑니다.</div>'
    + '</div>'
    + '<div class="bl-badge-row">'
    + '<span class="bl-badge" id="bl-count-badge">✨ 참가자 ' + parsed.entries.length + '명</span>'
    + '<span class="bl-badge">🎯 최대 ' + _BL_MAX_N + '명</span>'
    + '<span class="bl-badge">🏆 최근 기록 ' + _blHistory.length + '개</span>'
    + '</div>'
    + '</div>'
    + '<div class="bl-setup-panel">'
    + '<textarea id="bl-input" class="bl-textarea" rows="3" placeholder="이름 입력... (쉼표로 구분, 가중치: 이름*2, 최대 ' + _BL_MAX_N + '명)"'
    + ' oninput="_blOnInput(this.value)" oncompositionend="_blOnInput(this.value)">' + saved + '</textarea>'
    + '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">'
    + '<button onclick="_blShuffleInput()" class="bl-btn-secondary">🔀 섞기</button>'
    + '<button onclick="document.getElementById(\'bl-input\').value=\'\';_blOnInput(\'\')" class="bl-btn-secondary">🗑 지우기</button>'
    + '</div>'
    + '</div>'
    + '<div class="bl-chipbox" id="bl-chipbox">' + _blChipsHTML(saved) + '</div>'
    + '<div style="text-align:center;padding:14px 0 22px">'
    + '<button onclick="_blBeginBreak()" class="bl-btn-primary" style="font-size:var(--fs-lg);padding:14px 44px">🎱 브레이크!</button>'
    + '</div>'
    + '</div>'
    + _blHistHTML()
    + '</div>';
}

// ─── 브레이크 시작 ───────────────────────────────────────────────────────────
function _blBeginBreak(){
  const ta = document.getElementById('bl-input');
  const raw = ta ? ta.value : _blInputCache;
  const parsed = _blParseWeightedCSV(raw);
  const entries = parsed.entries;
  if (entries.length < 2) { alert('참가자를 2명 이상 입력해 주세요.'); return; }
  if (entries.length > _BL_MAX_N) { alert('최대 ' + _BL_MAX_N + '명까지 가능합니다.'); return; }

  // 가중치 기반 승자 사전 결정 (다른 룰렛과 동일한 방식)
  let r = Math.random() * (parsed.total || entries.length);
  let winIdx = 0;
  for (let i=0;i<entries.length;i++){
    r -= (parsed.total ? entries[i].weight : 1);
    if (r<=0){ winIdx=i; break; }
  }

  // 셔플된 배치 순서(당첨자 위치를 매번 다르게)
  const order = entries.map(function(e,i){ return i; });
  for (let i=order.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [order[i],order[j]] = [order[j],order[i]];
  }

  const balls = _blBuildRack(entries, order);
  const winnerBallIdx = balls.findIndex(function(b){ return b.entryIdx === winIdx; });

  const cue = { name:null, isCue:true, x:_BL_X0+130, y:(_BL_Y0+_BL_Y1)/2, vx:0, vy:0, r:_BL_BALL_R, color:'#f8fafc', pocketed:false, trail:[] };
  const apex = balls[0];
  const dx = apex.x-cue.x, dy = apex.y-cue.y;
  const dist = Math.max(1, Math.hypot(dx,dy));
  // 인원이 적을수록(랙이 작을수록) 브레이크가 밋밋해 보이지 않도록 큐볼 스피드를 높임
  const speed = 15.5 + Math.max(0, 6 - entries.length) * 1.15;
  const dirX = dx/dist, dirY = dy/dist;
  cue.targetVx = dirX*speed;
  cue.targetVy = dirY*speed + (Math.random()-0.5)*0.6;
  cue.dirX = dirX; cue.dirY = dirY;

  _blSt = {
    entries: entries,
    balls: balls,
    cue: cue,
    winIdx: winIdx,
    winnerName: entries[winIdx].name,
    winnerBallIdx: winnerBallIdx,
    phase: 'aim',
    aimFrame: 0,
    frame: 0,
    flashes: [],
    running: true,
    finished: false,
  };

  const root = document.getElementById('bl-root');
  _blRenderTable(root);
}

// 15개 랙 표준 삼각 배치(레인지: 부족하면 뒷줄부터 축소)
function _blBuildRack(entries, order){
  const n = entries.length;
  const apexX = _BL_X1-190, apexY = (_BL_Y0+_BL_Y1)/2;
  const rowGap = _BL_BALL_R*1.78, colGap = _BL_BALL_R*2.06;
  const balls = [];
  let placed = 0, row = 0;
  while (placed < n){
    const rowCount = Math.min(row+1, n-placed);
    const rowX = apexX + row*rowGap;
    const startY = apexY - (rowCount-1)*colGap/2;
    for (let c=0;c<rowCount;c++){
      const idx = order[placed];
      balls.push({
        entryIdx: idx,
        name: entries[idx].name,
        x: rowX, y: startY + c*colGap,
        vx:0, vy:0, r:_BL_BALL_R,
        color: _BL_COLORS[idx % _BL_COLORS.length],
        pocketed:false, guided:false, trail:[],
      });
      placed++;
      if (placed>=n) break;
    }
    row++;
  }
  return balls;
}

// ─── 테이블 화면 렌더 ────────────────────────────────────────────────────────
function _blRenderTable(root){
  if (!root || !_blSt) return;
  root.innerHTML =
    '<div class="bl-shell">'
    + '<div class="bl-card bl-table-panel">'
    + '<div class="bl-table-meta">'
    + '<div>'
    + '<div class="bl-table-title">🎱 브레이크 진행 중</div>'
    + '<div class="bl-table-desc">공이 흩어지고 마지막까지 지켜보면 당첨자가 포켓으로 들어갑니다.</div>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">'
    + '<button onclick="_blReplayBreak()" class="bl-btn-secondary" style="font-size:var(--fs-sm);padding:7px 14px">🔄 다시하기</button>'
    + '<button onclick="_blResetBreak()" class="bl-btn-secondary" style="font-size:var(--fs-caption);padding:5px 10px;opacity:.72;border:none;background:transparent;box-shadow:none">✏️ 참가자 변경</button>'
    + '</div>'
    + '</div>'
    + '<div class="bl-felt-wrap" id="bl-felt-wrap">'
    + '<canvas id="bl-canvas" style="width:100%;height:auto;display:block"></canvas>'
    + '</div>'
    + '<div class="bl-status-wrap"><div class="bl-status" id="bl-status">🎯 조준 중...</div></div>'
    + '</div>'
    + '</div>';

  const cv = document.getElementById('bl-canvas');
  cv.width = _BL_W; cv.height = _BL_H;

  _blDrawTable();
  if (_blSt.running) {
    if (_blAnimId) cancelAnimationFrame(_blAnimId);
    _blAnimId = requestAnimationFrame(_blLoop);
  }
}

// ─── 테이블 그리기 ───────────────────────────────────────────────────────────
function _blDrawTable(){
  const cv = document.getElementById('bl-canvas');
  if (!cv || !_blSt) return;
  const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height;

  ctx.save();

  // 피니시 단계 카메라 줌 (당첨 공에 시선 집중)
  // [개선] 코너 포켓에 가까운 공을 그대로 화면 중앙에 놓고 확대하면
  // 캔버스 바깥(빈 여백)까지 보이면서 레일 배경만 크게 확대되어 지저분해 보이는
  // 문제가 있었음. 확대 배율을 낮추고, 카메라 중심이 캔버스 범위를 벗어나지
  // 않도록 클램프해서 항상 실제로 그려진 영역만 보이도록 함.
  if (_blSt.phase === 'finish' && _blSt.balls[_blSt.winnerBallIdx]) {
    const wb = _blSt.balls[_blSt.winnerBallIdx];
    const p = Math.min(1, (_blSt.finishFrame||0) / _BL_FINISH_FRAMES);
    const zoom = 1 + 0.3*p;
    const hw = w/(2*zoom), hh = h/(2*zoom);
    const focusX = Math.min(w-hw, Math.max(hw, wb.x));
    const focusY = Math.min(h-hh, Math.max(hh, wb.y));
    ctx.translate(w/2, h/2);
    ctx.scale(zoom, zoom);
    ctx.translate(-focusX, -focusY);
  }

  // 레일(테두리)
  const rail = ctx.createLinearGradient(0,0,0,h);
  rail.addColorStop(0,'#7c2d12'); rail.addColorStop(1,'#451a03');
  ctx.fillStyle = rail;
  ctx.fillRect(0,0,w,h);

  // 펠트(초록 테이블면)
  const felt = ctx.createRadialGradient(w/2,h/2,40, w/2,h/2, w*0.62);
  felt.addColorStop(0,'#16a34a'); felt.addColorStop(1,'#065f46');
  ctx.fillStyle = felt;
  ctx.fillRect(_BL_X0-8,_BL_Y0-8,(_BL_X1-_BL_X0)+16,(_BL_Y1-_BL_Y0)+16);

  // 쿠션 라인
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(_BL_X0-8,_BL_Y0-8,(_BL_X1-_BL_X0)+16,(_BL_Y1-_BL_Y0)+16);

  // 레일 다이아몬드 마커 (실제 당구대 느낌)
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  const dmY = [_BL_Y0-16, _BL_Y1+16];
  for (let i=1;i<=6;i++){
    const dx = _BL_X0 + (_BL_X1-_BL_X0)*(i/7);
    dmY.forEach(function(dy){
      ctx.beginPath();
      ctx.moveTo(dx,dy-4); ctx.lineTo(dx+4,dy); ctx.lineTo(dx,dy+4); ctx.lineTo(dx-4,dy);
      ctx.closePath(); ctx.fill();
    });
  }
  const dmX = [_BL_X0-16, _BL_X1+16];
  for (let i=1;i<=3;i++){
    const dy = _BL_Y0 + (_BL_Y1-_BL_Y0)*(i/4);
    dmX.forEach(function(dx){
      ctx.beginPath();
      ctx.moveTo(dx,dy-4); ctx.lineTo(dx+4,dy); ctx.lineTo(dx,dy+4); ctx.lineTo(dx-4,dy);
      ctx.closePath(); ctx.fill();
    });
  }

  // 펠트 비네트(입체감)
  const vg = ctx.createRadialGradient(w/2,h/2, w*0.28, w/2,h/2, w*0.62);
  vg.addColorStop(0,'rgba(0,0,0,0)');
  vg.addColorStop(1,'rgba(0,0,0,.22)');
  ctx.fillStyle = vg;
  ctx.fillRect(_BL_X0-8,_BL_Y0-8,(_BL_X1-_BL_X0)+16,(_BL_Y1-_BL_Y0)+16);

  // 포켓 (입체감: 어두운 안쪽 그라데이션 + 상단 하이라이트 림)
  _BL_POCKETS.forEach(function(p){
    // 바깥 그림자 링(펠트에 파묻힌 느낌)
    ctx.beginPath();
    ctx.arc(p.x,p.y,_BL_POCKET_R+3,0,Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fill();
    // 안쪽 깊이감 그라데이션
    const pg = ctx.createRadialGradient(p.x,p.y-2,1, p.x,p.y,_BL_POCKET_R);
    pg.addColorStop(0,'#1c2431');
    pg.addColorStop(0.55,'#0b0f1a');
    pg.addColorStop(1,'#000');
    ctx.beginPath();
    ctx.arc(p.x,p.y,_BL_POCKET_R,0,Math.PI*2);
    ctx.fillStyle = pg;
    ctx.fill();
    // 가죽 림 하이라이트(위쪽만 밝게)
    ctx.beginPath();
    ctx.arc(p.x,p.y,_BL_POCKET_R,Math.PI*1.05,Math.PI*1.95);
    ctx.strokeStyle = 'rgba(255,255,255,.28)';
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x,p.y,_BL_POCKET_R,Math.PI*0.05,Math.PI*0.95);
    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    ctx.lineWidth = 2.4;
    ctx.stroke();
  });

  // 잔상(트레일)
  const allForTrail = [_blSt.cue].concat(_blSt.balls);
  allForTrail.forEach(function(b){
    if (!b.trail || !b.trail.length) return;
    b.trail.forEach(function(pt, i){
      const a = (i+1)/(b.trail.length+1) * 0.28;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, b.r*0.72, 0, Math.PI*2);
      ctx.fillStyle = (b.color||'#fff').startsWith('#') ? _blHexAlpha(b.color, a) : 'rgba(255,255,255,'+a+')';
      ctx.fill();
    });
  });

  // 조준 단계: 큐대 그리기
  if (_blSt.phase === 'aim') _blDrawCueStick(ctx);
  // 브레이크 직후: 큐대 팔로우스루 잔상
  if (_blSt.phase === 'break' && _blSt.stickFollow && _blSt.stickFollow.life > 0) _blDrawStickFollow(ctx);

  // 큐볼
  if (_blSt.cue && !_blSt.cue.pocketed) _blDrawBall(ctx, _blSt.cue);

  // 이름 볼
  _blSt.balls.forEach(function(b){ if (!b.pocketed) _blDrawBall(ctx, b); });

  // 포켓 흡입 플래시 (당첨 공 색상으로 링 2겹 + 반짝임)
  (_blSt.flashes||[]).forEach(function(f){
    const p = f.frame / f.maxFrame;
    const col = f.color || '#FDE047';
    ctx.beginPath();
    ctx.arc(f.x, f.y, _BL_POCKET_R*(0.55+p*1.25), 0, Math.PI*2);
    ctx.strokeStyle = _blHexAlpha(col, Math.max(0,1-p));
    ctx.lineWidth = 3.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(f.x, f.y, _BL_POCKET_R*(0.3+p*0.8), 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(255,255,255,' + Math.max(0,0.85-p) + ')';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    if (p < 0.4) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, _BL_POCKET_R*0.5*(1-p/0.4), 0, Math.PI*2);
      ctx.fillStyle = _blHexAlpha(col, Math.max(0,0.5-p));
      ctx.fill();
    }
  });

  ctx.restore();

  // 피니시 단계: 화면 가장자리를 은은하게 어둡게 해 줌 카메라가
  // 갑자기 잘린 것처럼 보이지 않고 당첨 공에 스포트라이트가 비추는 느낌을 줌
  if (_blSt.phase === 'finish') {
    const p = Math.min(1, (_blSt.finishFrame||0) / _BL_FINISH_FRAMES);
    ctx.save();
    const vg = ctx.createRadialGradient(w/2,h/2, h*0.28, w/2,h/2, h*0.72);
    vg.addColorStop(0,'rgba(0,0,0,0)');
    vg.addColorStop(1,'rgba(0,0,0,' + (0.22*p) + ')');
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,w,h);
    ctx.restore();
  }
}

function _blHexAlpha(hex, a){
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 'rgba(255,255,255,'+a+')';
  const n = parseInt(m[1],16);
  return 'rgba(' + [(n>>16)&255,(n>>8)&255,n&255].join(',') + ',' + a + ')';
}

function _blDrawCueStick(ctx){
  const cue = _blSt.cue;
  const dirX = cue.dirX, dirY = cue.dirY;
  const t = Math.min(1, _blSt.aimFrame / _BL_AIM_FRAMES);
  const windT = Math.min(1, t/0.62);
  const thrustT = t<0.62 ? 0 : (t-0.62)/0.38;
  let pull;
  if (thrustT<=0) {
    pull = 30 * (1-Math.pow(1-windT,2)); // 서서히 뒤로
  } else {
    pull = 30 * (1-Math.pow(thrustT,3)); // 빠르게 찌르기
  }
  const tipX = cue.x - dirX*(cue.r+8+pull);
  const tipY = cue.y - dirY*(cue.r+8+pull);
  const buttX = tipX - dirX*_BL_STICK_LEN;
  const buttY = tipY - dirY*_BL_STICK_LEN;

  ctx.save();
  ctx.lineCap = 'round';
  const grad = ctx.createLinearGradient(buttX,buttY,tipX,tipY);
  grad.addColorStop(0,'#7c4a24');
  grad.addColorStop(0.85,'#d2a679');
  grad.addColorStop(1,'#e5e7eb');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(buttX,buttY);
  ctx.lineTo(tipX,tipY);
  ctx.stroke();
  ctx.restore();
}

function _blDrawStickFollow(ctx){
  const cue = _blSt.cue;
  const sf = _blSt.stickFollow;
  const dirX = sf.dirX, dirY = sf.dirY;
  const alpha = sf.life / sf.maxLife;
  // 시간이 지날수록 큐대가 뒤로 물러나며 서서히 사라짐
  const pull = 8 + (1-alpha)*70;
  const tipX = cue.x - dirX*(cue.r+8+pull);
  const tipY = cue.y - dirY*(cue.r+8+pull);
  const buttX = tipX - dirX*_BL_STICK_LEN;
  const buttY = tipY - dirY*_BL_STICK_LEN;

  ctx.save();
  ctx.globalAlpha = alpha*0.85;
  ctx.lineCap = 'round';
  const grad = ctx.createLinearGradient(buttX,buttY,tipX,tipY);
  grad.addColorStop(0,'#7c4a24');
  grad.addColorStop(0.85,'#d2a679');
  grad.addColorStop(1,'#e5e7eb');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(buttX,buttY);
  ctx.lineTo(tipX,tipY);
  ctx.stroke();
  ctx.restore();
}

function _blDrawBall(ctx, b){
  ctx.save();

  // 바닥 그림자(펠트 위에 떠 있지 않고 놓여있는 느낌)
  ctx.beginPath();
  ctx.ellipse(b.x, b.y+b.r*0.62, b.r*0.92, b.r*0.32, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,.24)';
  ctx.fill();

  // 당첨(가이드) 공: 포켓으로 빨려가는 동안 컬러 후광 펄스
  if (b.guided) {
    const pulse = 0.5 + 0.5*Math.sin((_blSt.finishFrame||0) * 0.35);
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r + 6 + pulse*3, 0, Math.PI*2);
    ctx.strokeStyle = _blHexAlpha(b.color, 0.55 + pulse*0.35);
    ctx.lineWidth = 3.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r + 11 + pulse*4, 0, Math.PI*2);
    ctx.strokeStyle = _blHexAlpha(b.color, 0.18 + pulse*0.14);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
  const grad = ctx.createRadialGradient(b.x-b.r*0.38, b.y-b.r*0.42, b.r*0.08, b.x, b.y, b.r*1.05);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.22, b.color);
  grad.addColorStop(0.82, b.color);
  grad.addColorStop(1, 'rgba(0,0,0,.22)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(0,0,0,.3)';
  ctx.stroke();
  // 작은 반사 하이라이트(광택)
  ctx.beginPath();
  ctx.ellipse(b.x-b.r*0.36, b.y-b.r*0.4, b.r*0.28, b.r*0.16, -0.5, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.fill();

  if (b.name){
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r*0.7, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.94)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,.12)';
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let label = b.name;
    let fontPx = 10.5;
    if (label.length >= 6) { label = label.slice(0,5); fontPx = 8; }
    else if (label.length === 5) { fontPx = 8.6; }
    else if (label.length === 4) { fontPx = 9.4; }
    ctx.font = '800 ' + fontPx + 'px sans-serif';
    ctx.fillText(label, b.x, b.y+0.5);
  }
  ctx.restore();
}

// ─── 물리 루프 ───────────────────────────────────────────────────────────────
function _blLoop(){
  if (!_blSt || !_blSt.running) return;
  _blSt.frame++;

  if (_blSt.phase === 'aim') {
    _blSt.aimFrame++;
    if (_blSt.aimFrame >= _BL_AIM_FRAMES) {
      _blSt.cue.vx = _blSt.cue.targetVx;
      _blSt.cue.vy = _blSt.cue.targetVy;
      _blSt.phase = 'break';
      _blSt.stickFollow = { life: 16, maxLife: 16, dirX: _blSt.cue.dirX, dirY: _blSt.cue.dirY };
      try{ _blPlayBreak(); }catch(e){}
      const felt = document.getElementById('bl-felt-wrap');
      if (felt) { felt.classList.add('bl-shake'); setTimeout(function(){ felt.classList.remove('bl-shake'); }, 340); }
    }
  } else if (_blSt.phase === 'break') {
    for (let s=0;s<_BL_SUBSTEPS;s++) _blStepPhysics();
    _blUpdateTrails();
    _blAdvanceFlashes();
    if (_blSt.stickFollow && _blSt.stickFollow.life > 0) _blSt.stickFollow.life--;
    const maxSpeed = _blMaxSpeed();
    const winnerStillOnTable = _blSt.winnerBallIdx>=0 && _blSt.balls[_blSt.winnerBallIdx] && !_blSt.balls[_blSt.winnerBallIdx].pocketed;
    const settled = maxSpeed < 0.05;
    if ((settled || _blSt.frame >= _BL_BREAK_MAX_FRAMES)) {
      if (!winnerStillOnTable) {
        _blFinish();
        return;
      }
      _blSt.phase = 'finish';
      _blSt.finishFrame = 0;
      const wb = _blSt.balls[_blSt.winnerBallIdx];
      wb.guided = true;
      let best = null, bestD = Infinity;
      _BL_POCKETS.forEach(function(p){
        const d = Math.hypot(p.x-wb.x, p.y-wb.y);
        if (d<bestD){ bestD=d; best=p; }
      });
      wb.targetPocket = best;
      wb.startX = wb.x; wb.startY = wb.y;
      try{ _blPlayShot(); }catch(e){}
    }
  } else if (_blSt.phase === 'finish') {
    _blSt.finishFrame++;
    const wb = _blSt.balls[_blSt.winnerBallIdx];
    const p = Math.min(1, _blSt.finishFrame / _BL_FINISH_FRAMES);
    const ease = p<1 ? (1-Math.pow(1-p,2)) : 1;
    wb.x = wb.startX + (wb.targetPocket.x - wb.startX) * ease;
    wb.y = wb.startY + (wb.targetPocket.y - wb.startY) * ease;
    _blUpdateTrails();
    if (p >= 1) {
      wb.pocketed = true;
      if (_blSt.flashes) _blSt.flashes.push({x:wb.targetPocket.x, y:wb.targetPocket.y, frame:0, maxFrame:30, color:wb.color});
      _blFinish();
      return;
    }
  }

  _blDrawTable();
  _blUpdateStatus();
  _blAnimId = requestAnimationFrame(_blLoop);
}

function _blUpdateTrails(){
  const all = [_blSt.cue].concat(_blSt.balls);
  all.forEach(function(b){
    if (b.pocketed) { b.trail = []; return; }
    if (!b.trail) b.trail = [];
    const speed = Math.hypot(b.vx||0, b.vy||0);
    if (speed > 0.6 || b.guided) {
      b.trail.unshift({x:b.x, y:b.y});
      if (b.trail.length > 5) b.trail.length = 5;
    } else if (b.trail.length) {
      b.trail.pop();
    }
  });
}

function _blAdvanceFlashes(){
  if (!_blSt.flashes || !_blSt.flashes.length) return;
  _blSt.flashes.forEach(function(f){ f.frame++; });
  _blSt.flashes = _blSt.flashes.filter(function(f){ return f.frame < f.maxFrame; });
}

function _blUpdateStatus(){
  const status = document.getElementById('bl-status');
  if (!status) return;
  let list, cycle;
  if (_blSt.phase === 'aim') { list = _BL_STATUS_AIM; cycle = 24; }
  else if (_blSt.phase === 'break') { list = _BL_STATUS_BREAK; cycle = 40; }
  else { list = _BL_STATUS_FINISH; cycle = 30; }
  const idx = Math.floor(_blSt.frame / cycle) % list.length;
  const next = list[idx];
  if (status.textContent !== next) {
    status.textContent = next;
    status.classList.remove('bl-pulse');
    void status.offsetWidth;
    status.classList.add('bl-pulse');
  }
}

function _blMaxSpeed(){
  let m = Math.hypot(_blSt.cue.vx, _blSt.cue.vy);
  _blSt.balls.forEach(function(b){ if (!b.pocketed) m = Math.max(m, Math.hypot(b.vx,b.vy)); });
  return m;
}

function _blStepPhysics(){
  const all = [_blSt.cue].concat(_blSt.balls).filter(function(b){ return !b.pocketed; });

  all.forEach(function(b){
    b.x += b.vx; b.y += b.vy;
    b.vx *= _BL_FRICTION; b.vy *= _BL_FRICTION;
    if (Math.hypot(b.vx,b.vy) < 0.015) { b.vx = 0; b.vy = 0; }

    if (b.x - b.r < _BL_X0) { b.x = _BL_X0 + b.r; b.vx = -b.vx*_BL_WALL_REST; }
    if (b.x + b.r > _BL_X1) { b.x = _BL_X1 - b.r; b.vx = -b.vx*_BL_WALL_REST; }
    if (b.y - b.r < _BL_Y0) { b.y = _BL_Y0 + b.r; b.vy = -b.vy*_BL_WALL_REST; }
    if (b.y + b.r > _BL_Y1) { b.y = _BL_Y1 - b.r; b.vy = -b.vy*_BL_WALL_REST; }
  });

  // 볼-볼 충돌 (동일 질량 탄성 충돌)
  for (let i=0;i<all.length;i++){
    for (let j=i+1;j<all.length;j++){
      const a = all[i], b = all[j];
      const dx = b.x-a.x, dy = b.y-a.y;
      const dist = Math.hypot(dx,dy);
      const minD = a.r+b.r;
      if (dist>0 && dist<minD){
        const nx = dx/dist, ny = dy/dist;
        const overlap = (minD-dist)/2;
        a.x -= nx*overlap; a.y -= ny*overlap;
        b.x += nx*overlap; b.y += ny*overlap;
        const rvx = b.vx-a.vx, rvy = b.vy-a.vy;
        const rel = rvx*nx + rvy*ny;
        if (rel < 0){
          const imp = -rel*_BL_BALL_REST;
          a.vx -= imp*nx*0.5; a.vy -= imp*ny*0.5;
          b.vx += imp*nx*0.5; b.vy += imp*ny*0.5;
          try{ if (Math.abs(rel) > 1.2) _blPlayClack(Math.min(1, Math.abs(rel)/14)); }catch(e){}
        }
      }
    }
  }

  // 포켓 흡입 판정
  all.forEach(function(b){
    _BL_POCKETS.forEach(function(p){
      const d = Math.hypot(b.x-p.x, b.y-p.y);
      if (d < _BL_POCKET_R*0.62 && !b.pocketed){
        b.pocketed = true;
        b.vx = 0; b.vy = 0;
        if (_blSt.flashes) _blSt.flashes.push({x:p.x, y:p.y, frame:0, maxFrame:18});
        try{ _blPlaySink(); }catch(e){}
      }
    });
  });
}

// ─── 종료 처리 ───────────────────────────────────────────────────────────────
function _blFinish(){
  _blSt.running = false;
  _blSt.finished = true;
  if (_blAnimId) { cancelAnimationFrame(_blAnimId); _blAnimId = null; }
  _blDrawTable();
  const winner = _blSt.winnerName;
  const winnerBall = _blSt.balls[_blSt.winnerBallIdx];
  const winnerColor = (winnerBall && winnerBall.color) || '#22c55e';
  _blAddHistory(winner, winnerColor);
  try{ _blPlayWin(); }catch(e){}
  try{ if (typeof _blFireConfetti==='function') _blFireConfetti(); }catch(e){}

  const status = document.getElementById('bl-status');
  if (status) status.innerHTML = '🏆 <strong>' + winner + '</strong> 당첨!';

  if (typeof window._rrShowPopup === 'function') {
    const winIdx = _blSt.winIdx;
    const winnerWeight = (_blSt.entries[winIdx] && _blSt.entries[winIdx].weight) || 1;
    const totalWeight = _blSt.entries.reduce(function(s,e){ return s+e.weight; }, 0) || 1;
    const prob = Math.round((winnerWeight/totalWeight)*1000)/10;
    let ballLabel = winner;
    if (ballLabel.length >= 5) ballLabel = ballLabel.slice(0,4);
    const winnerEsc = String(winner).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    window._rrShowPopup('🎱 당구 브레이크 결과', ''
      + '<div class="bl-popup-wrap" style="--wc:' + winnerColor + '">'
      +   '<div class="bl-popup-felt">'
      +     '<div class="bl-popup-glow"></div>'
      +     '<div class="bl-popup-confetti">🎉🎊✨🎊🎉</div>'
      +     '<div class="bl-popup-ball-shadow"></div>'
      +     '<div class="bl-popup-ball"><span class="bl-popup-ball-label">' + ballLabel + '</span></div>'
      +     '<div class="bl-popup-winner-name">' + winnerEsc + '</div>'
      +     '<span class="bl-popup-tag">🏆 당첨</span>'
      +   '</div>'
      +   '<div class="bl-popup-info-row">'
      +     '<span class="bl-popup-prob-chip">🎲 당첨 확률 ' + prob + '%</span>'
      +     '<span class="bl-popup-sub">· 전체 ' + _blSt.entries.length + '명 중 당첨</span>'
      +   '</div>'
      +   '<div class="bl-popup-actions">'
      +     '<button class="btn btn-b btn-sm" onclick="_blReplayBreak();_rrClosePopup && _rrClosePopup()">🎱 바로 다시 브레이크!</button>'
      +     '<button class="bl-popup-link" onclick="_blResetBreak();_rrClosePopup && _rrClosePopup()">✏️ 참가자 변경 후 다시하기</button>'
      +   '</div>'
      + '</div>');
  }
}

function _blResetBreak(){
  if (_blAnimId) { cancelAnimationFrame(_blAnimId); _blAnimId = null; }
  _blSt = null;
  const root = document.getElementById('bl-root');
  if (root) _blRenderSetup(root, _blInputCache);
}

// [추가] 설정 화면으로 돌아가지 않고, 같은 참가자 명단으로 바로 재시작
function _blReplayBreak(){
  if (_blAnimId) { cancelAnimationFrame(_blAnimId); _blAnimId = null; }
  _blSt = null;
  _blBeginBreak();
}

// ─── 오디오 ──────────────────────────────────────────────────────────────────
function _blGetAC(){
  if (!_blAC) {
    try{ _blAC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ _blAC = null; }
  }
  return _blAC;
}
function _blPlayBreak(){
  const ac = _blGetAC(); if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'square';
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(60, t+0.16);
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.001, t+0.2);
  o.start(t); o.stop(t+0.2);
}
function _blPlayClack(vol){
  const ac = _blGetAC(); if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'triangle';
  o.frequency.setValueAtTime(900+Math.random()*300, t);
  g.gain.setValueAtTime(Math.max(0.02, Math.min(0.18, vol*0.18)), t);
  g.gain.exponentialRampToValueAtTime(0.001, t+0.06);
  o.start(t); o.stop(t+0.06);
}
function _blPlaySink(){
  const ac = _blGetAC(); if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(500, t);
  o.frequency.exponentialRampToValueAtTime(120, t+0.22);
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t+0.24);
  o.start(t); o.stop(t+0.24);
}
function _blPlayShot(){
  const ac = _blGetAC(); if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'triangle';
  o.frequency.setValueAtTime(700, t);
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t+0.1);
  o.start(t); o.stop(t+0.1);
}
function _blPlayWin(){
  const ac = _blGetAC(); if (!ac) return;
  const notes = [523,659,784,1047,1319];
  notes.forEach(function(freq,i){
    const t = ac.currentTime + i*0.13;
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.frequency.value = freq; o.type = 'triangle';
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t+0.35);
    o.start(t); o.stop(t+0.35);
  });
}
function _blFireConfetti(){
  const colors = ['#FF4B6E','#FFD54F','#22c55e','#3B82F6','#8B5CF6','#F97316'];
  for (let i=0;i<45;i++){
    setTimeout(function(){
      const el = document.createElement('div');
      const sz = 6+Math.random()*9;
      el.style.cssText = 'position:fixed;left:'+(Math.random()*100)+'vw;top:-15px;background:'+colors[Math.floor(Math.random()*colors.length)]+';width:'+sz+'px;height:'+sz+'px;border-radius:'+(Math.random()>.5?'50%':'4px')+';z-index:600;pointer-events:none;animation:gcConfettiFall '+(1.2+Math.random()*.9)+'s ease-in '+(Math.random()*.4)+'s forwards';
      document.body.appendChild(el);
      setTimeout(function(){ el.remove(); }, 2200);
    }, i*20);
  }
}
