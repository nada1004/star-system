/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('janggi') 진입 시 동적으로 로드됨. */
// ─── ♟️ 스타대학 장기 (스트리머 프로필 이미지로 두는 장기) ──────────────────────────
// 규칙: 내가 응원하는 스타대학(소속)을 홍(아래쪽, 선공)으로, 상대 대학을 AI(청, 후공)로 골라 대결.
//       차/포/마/상/사/졸/궁 기물의 실제 장기 이동 규칙을 적용, 상대 궁을 외통수(장군을 피할 수 없게)로
//       몰아넣으면 승리. 기물에는 각 대학 소속 스트리머 프로필 사진이 랜덤 배정됨(오목 게임과 동일한 톤).
//       ※ 대국 편의를 위해 동형반복/장군규칙 등 일부 고급 규칙은 간소화되어 있습니다.

(function _jgInjectCSS() {
  if (document.getElementById('jg-style')) return;
  const s = document.createElement('style');
  s.id = 'jg-style';
  s.textContent = `
    .jg-shell{display:flex;flex-direction:column;gap:14px;width:100%}
    .jg-card{position:relative;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);border-radius:26px;box-shadow:0 20px 44px rgba(15,23,42,.08),inset 0 1px 0 rgba(255,255,255,.9);padding:22px 22px 20px;overflow:hidden}
    .jg-card::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#7c2d12,#451a03,#7c2d12)}
    .jg-head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .jg-head-left{display:flex;align-items:flex-start;gap:12px;min-width:0}
    .jg-icon-badge{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:21px;background:linear-gradient(135deg,#7c2d12,#451a03);box-shadow:0 8px 16px rgba(69,26,3,.32)}
    .jg-title-group{min-width:0}
    .jg-title{font-size:17px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}
    .jg-desc{margin-top:4px;font-size:var(--fs-sm);line-height:1.6;color:var(--text3);max-width:460px}
    .jg-btn{padding:11px 18px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:var(--fs-base);font-weight:900;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.05);font-family:inherit;transition:.12s;white-space:nowrap}
    .jg-btn:hover{border-color:rgba(124,45,18,.3);color:#7c2d12;transform:translateY(-1px)}
    .jg-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
    .jg-btn.jg-btn-primary{background:linear-gradient(135deg,#7c2d12,#451a03 60%,#5c1f0a);color:#fff;border:none;box-shadow:0 7px 0 #2a0f02,0 16px 26px rgba(69,26,3,.28)}
    .jg-btn.jg-btn-primary:hover{color:#fff;transform:translateY(-2px)}
    .jg-btn.jg-btn-primary:disabled{box-shadow:none}
    .jg-actions{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
    .jg-section-label{margin-top:18px;font-size:var(--fs-caption);font-weight:900;color:var(--text3);letter-spacing:.02em}
    .jg-chip-bar{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .jg-chip{position:relative;display:flex;align-items:center;gap:8px;padding:8px 14px 8px 8px;border-radius:999px;border:2px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);cursor:pointer;font-family:inherit;transition:.14s;white-space:nowrap}
    .jg-chip:hover{transform:translateY(-1px)}
    .jg-chip.on{border-color:var(--jg-chip-color,#7c2d12);box-shadow:0 6px 14px rgba(124,45,18,.22)}
    .jg-chip-avatars{display:flex;flex-shrink:0}
    .jg-chip-avatars img,.jg-chip-avatars .jg-mini-fallback{width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(15,23,42,.25);margin-left:-9px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff}
    .jg-chip-avatars img:first-child,.jg-chip-avatars .jg-mini-fallback:first-child{margin-left:0}
    .jg-chip-meta{display:flex;flex-direction:column;line-height:1.2}
    .jg-chip-name{font-size:var(--fs-sm);font-weight:900;color:var(--text1)}
    .jg-chip-count{font-size:10px;font-weight:800;color:var(--text3)}
    .jg-diff-pill{padding:8px 13px;border-radius:999px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:var(--fs-sm);font-weight:800;cursor:pointer;font-family:inherit;transition:.14s;white-space:nowrap}
    .jg-diff-pill:hover{border-color:rgba(124,45,18,.3);color:#7c2d12;transform:translateY(-1px)}
    .jg-diff-pill.on{background:linear-gradient(135deg,#7c2d12,#451a03);color:#fff;border-color:transparent;box-shadow:0 6px 14px rgba(69,26,3,.3)}
    .jg-empty-note{font-size:var(--fs-sm);color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 14px;margin-top:14px;line-height:1.6}
    .jg-stats-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
    .jg-stat-chip{flex:1;min-width:70px;text-align:center;padding:9px 8px;border-radius:12px;background:#f8fafc;border:1px solid rgba(148,163,184,.16)}
    .jg-stat-chip b{display:block;font-size:16px;color:var(--text1)}
    .jg-stat-chip span{font-size:10px;font-weight:800;color:var(--text3)}
    .jg-vs-row{display:flex;align-items:stretch;gap:10px;margin-top:16px}
    .jg-side-card{flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:18px;background:#f8fafc;border:2px solid rgba(148,163,184,.16);transition:.2s}
    .jg-side-card.is-turn{border-color:var(--jg-side-color,#7c2d12);box-shadow:0 0 0 4px color-mix(in srgb, var(--jg-side-color,#7c2d12) 16%, transparent);background:#fff}
    .jg-side-card.is-win{border-color:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.18)}
    .jg-side-card.is-check{border-color:#dc2626;box-shadow:0 0 0 4px rgba(220,38,38,.18)}
    .jg-side-swatch{flex:none;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:inset 0 0 0 3px rgba(255,255,255,.5)}
    .jg-side-meta{min-width:0;line-height:1.25}
    .jg-side-role{font-size:10px;font-weight:900;color:var(--text3);letter-spacing:.02em}
    .jg-side-name{font-size:var(--fs-sm);font-weight:900;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .jg-vs-mid{flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;color:var(--text3);font-size:13px}
    .jg-status{margin-top:12px;display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:14px;font-size:var(--fs-sm);font-weight:800;line-height:1.5}
    .jg-status::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;flex-shrink:0}
    .jg-status.is-info{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}
    .jg-status.is-info::before{background:#3b82f6}
    .jg-status.is-think{background:#fefce8;border:1px solid #fde68a;color:#92400e}
    .jg-status.is-think::before{background:#f59e0b;animation:jgPulseDot 1s ease-in-out infinite}
    .jg-status.is-good{background:#ecfdf5;border:1px solid #86efac;color:#047857}
    .jg-status.is-good::before{background:#10b981}
    .jg-status.is-bad{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c}
    .jg-status.is-bad::before{background:#ef4444}
    .jg-status.is-check{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c}
    .jg-status.is-check::before{background:#ef4444;animation:jgPulseDot .8s ease-in-out infinite}
    @keyframes jgPulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
    .jg-board-wrap{margin-top:14px;display:flex;justify-content:center}
    .jg-board{position:relative;width:100%;max-width:560px;aspect-ratio:9/10;display:grid;grid-template-columns:repeat(9,1fr);grid-template-rows:repeat(10,1fr);background:linear-gradient(160deg,#e8c583,#d9a85a);border-radius:16px;padding:14px;box-shadow:0 16px 34px rgba(120,80,20,.28),inset 0 2px 4px rgba(255,255,255,.35);touch-action:manipulation}
    .jg-palace-lines{position:absolute;inset:14px;width:calc(100% - 28px);height:calc(100% - 28px);pointer-events:none;z-index:0}
    .jg-cell{position:relative;z-index:1;cursor:default}
    .jg-cell::before{content:"";position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(90,60,20,.4);transform:translateY(-.5px)}
    .jg-cell::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(90,60,20,.4);transform:translateX(-.5px)}
    .jg-cell.jg-sel::before,.jg-cell.jg-sel::after{background:rgba(124,45,18,.7)}
    .jg-board.jg-turn-me .jg-cell{cursor:pointer}
    .jg-target-dot{position:absolute;inset:38%;border-radius:50%;background:rgba(34,197,94,.55);pointer-events:none;animation:jgDotPulse 1.1s ease-in-out infinite}
    .jg-cell.jg-target-cap .jg-target-dot{inset:6%;background:transparent;border:4px solid rgba(220,38,38,.65);box-shadow:0 0 0 2px rgba(255,255,255,.5) inset}
    @keyframes jgDotPulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.25);opacity:.5}}
    .jg-piece{position:absolute;inset:4%;border-radius:50%;overflow:visible;display:flex;align-items:center;justify-content:center;animation:jgDropIn .18s ease both;filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))}
    .jg-piece-photo{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:#e2e8f0;box-shadow:inset 0 0 0 2.5px rgba(255,255,255,.9),inset 0 -6px 8px rgba(0,0,0,.16),inset 0 4px 5px rgba(255,255,255,.3)}
    .jg-piece-photo img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
    .jg-piece-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;pointer-events:none}
    .jg-piece-tag{position:absolute;right:-4px;bottom:-4px;width:19px;height:19px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:900;color:#fff;background:var(--jg-ring,#7c2d12);box-shadow:0 0 0 2px #fff,0 2px 4px rgba(0,0,0,.3);line-height:1}
    .jg-piece.jg-last .jg-piece-photo{box-shadow:inset 0 0 0 3px #fff,0 0 0 3px var(--jg-ring,#7c2d12)}
    .jg-piece.jg-general-check .jg-piece-photo{box-shadow:0 0 0 3px #fff,0 0 0 6px #dc2626,0 0 14px 3px rgba(220,38,38,.7);animation:jgCheckPulse .9s ease-in-out infinite}
    @keyframes jgDropIn{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
    @keyframes jgCheckPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
    .jg-win-glow .jg-piece-photo{box-shadow:0 0 0 3px #fff,0 0 0 6px #f59e0b,0 0 14px 3px rgba(245,158,11,.65);animation:jgCheckPulse 1s ease-in-out infinite}
    .jg-result{background:linear-gradient(135deg,#FFF7ED,#FFFBF5);border:1px solid rgba(124,45,18,.22);border-radius:22px;padding:22px 20px;text-align:center;margin-top:16px;animation:jgPopIn .4s cubic-bezier(.175,.885,.32,1.35)}
    @keyframes jgPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
    .jg-result-emoji{font-size:44px;display:block;margin-bottom:4px}
    .jg-result-title{font-size:clamp(20px,4.4vw,28px);font-weight:900;color:var(--text);margin:4px 0 4px}
    .jg-result-sub{font-size:var(--fs-sm);color:var(--text3)}
    body.dark .jg-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}
    body.dark .jg-side-card{background:#0f172a;border-color:#243349}
    body.dark .jg-side-card.is-turn{background:#111f36}
    body.dark .jg-stat-chip{background:#0f172a;border-color:#243349}
    body.dark .jg-result{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}
    body.dark .jg-btn,body.dark .jg-chip,body.dark .jg-diff-pill{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}
    body.dark .jg-diff-pill.on{color:#fff}
    body.dark .jg-title{color:#f8fafc}
    body.dark .jg-desc{color:#94a3b8}
    body.dark .jg-status.is-info{background:#0b1a33;border-color:#1e3a5f;color:#93c5fd}
    body.dark .jg-status.is-think{background:#241c04;border-color:#5c4a0a;color:#fcd34d}
    body.dark .jg-status.is-good{background:#052e1f;border-color:#14532d;color:#86efac}
    body.dark .jg-status.is-bad,body.dark .jg-status.is-check{background:#2c0b0b;border-color:#7f1d1d;color:#fca5a5}
  `;
  document.head.appendChild(s);
})();

// ─── 사운드 (오목 게임과 동일한 WebAudio 패턴) ───────────────────────────────────
let _jgAC = null;
function _jgMoveSound(isCapture) {
  try {
    if (!_jgAC) _jgAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _jgAC.createOscillator(), g = _jgAC.createGain();
    o.connect(g); g.connect(_jgAC.destination);
    o.frequency.value = isCapture ? 220 : 340; o.type = isCapture ? 'sawtooth' : 'triangle';
    g.gain.setValueAtTime(0.12, _jgAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _jgAC.currentTime + (isCapture ? 0.22 : 0.14));
    o.start(); o.stop(_jgAC.currentTime + (isCapture ? 0.22 : 0.14));
  } catch (e) {}
}
function _jgWinSound() {
  try {
    if (!_jgAC) _jgAC = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => {
        const o = _jgAC.createOscillator(), g = _jgAC.createGain();
        o.connect(g); g.connect(_jgAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.14, _jgAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _jgAC.currentTime + 0.24);
        o.start(); o.stop(_jgAC.currentTime + 0.24);
      }, i * 80);
    });
  } catch (e) {}
}
function _jgLoseSound() {
  try {
    if (!_jgAC) _jgAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _jgAC.createOscillator(), g = _jgAC.createGain();
    o.connect(g); g.connect(_jgAC.destination);
    o.frequency.value = 170; o.type = 'sawtooth';
    g.gain.setValueAtTime(0.1, _jgAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _jgAC.currentTime + 0.3);
    o.start(); o.stop(_jgAC.currentTime + 0.3);
  } catch (e) {}
}

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────
function _jgEsc(s) {
  return (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s);
}
function _jgUrl(u) {
  return (typeof toHttpsUrl === 'function') ? toHttpsUrl(u) : u;
}
function _jgThumbUrl(u) {
  return (typeof toScaledUrl === 'function') ? toScaledUrl(u, 90) : _jgUrl(u);
}

const _JG_ROWS = 10, _JG_COLS = 9;
const _JG_LABELS = { general: '궁', guard: '사', horse: '마', elephant: '상', chariot: '차', cannon: '포', soldier: '졸' };
const _JG_VALUE  = { general: 9999, guard: 3, horse: 5, elephant: 3, chariot: 13, cannon: 7, soldier: 2 };
const _JG_PALACE_LINES = [
  [[0, 3], [1, 4], [2, 5]], [[0, 5], [1, 4], [2, 3]],
  [[7, 3], [8, 4], [9, 5]], [[7, 5], [8, 4], [9, 3]],
];
const _JG_DIFFS = {
  beginner: { key: 'beginner', label: '입문',   emoji: '🐣', depth: 0, width: 0,  randomTop: 8 },
  easy:     { key: 'easy',     label: '쉬움',   emoji: '🌱', depth: 1, width: 12, randomTop: 4 },
  normal:   { key: 'normal',   label: '보통',   emoji: '⚔️', depth: 1, width: 18, randomTop: 1 },
  hard:     { key: 'hard',     label: '고수',   emoji: '🔥', depth: 2, width: 14, randomTop: 1 },
  master:   { key: 'master',   label: '마스터', emoji: '👑', depth: 3, width: 10, randomTop: 1 },
};

function _jgReadStoredDifficulty() {
  const v = _rLsGet('su_jg_diff', 'normal');
  return _JG_DIFFS[v] ? v : 'normal';
}
function _jgReadStats() {
  try {
    const raw = _rLsGet('su_jg_stats', '');
    const v = raw ? JSON.parse(raw) : null;
    return (v && typeof v === 'object') ? { win: v.win || 0, lose: v.lose || 0, draw: v.draw || 0 } : { win: 0, lose: 0, draw: 0 };
  } catch (e) { return { win: 0, lose: 0, draw: 0 }; }
}
function _jgSaveStats(stats) {
  try { _rLsSet('su_jg_stats', JSON.stringify(stats)); } catch (e) {}
}

// ─── 대학(소속) 팀 풀 구성 (오목 게임과 동일한 방식) ──────────────────────────
function _jgBuildTeamPool() {
  const players = Array.isArray(window.players) ? window.players : [];
  const univCfgArr = (typeof univCfg !== 'undefined' && Array.isArray(univCfg)) ? univCfg : [];
  const dissolved = new Set(univCfgArr.filter(u => u && u.dissolved).map(u => u.name));
  const pool = {};
  const seenByUniv = {};
  players.forEach(p => {
    if (!p || p.hidden || p.retired || p.hideFromBoard) return;
    const u = String(p.univ || '').trim();
    if (!u || u === '무소속' || u === 'YB' || dissolved.has(u)) return;
    const name = String(p.name || '').trim();
    if (!name) return;
    if (!seenByUniv[u]) seenByUniv[u] = new Set();
    if (seenByUniv[u].has(name)) return;
    seenByUniv[u].add(name);
    if (!pool[u]) pool[u] = [];
    pool[u].push({ name, photo: p.photo || (window.playerPhotos && window.playerPhotos[p.name]) || '' });
  });
  let teams = Object.keys(pool).map(u => ({
    univ: u,
    color: (typeof gc === 'function') ? gc(u) : '#6b7280',
    players: pool[u],
  }));
  teams.sort((a, b) => b.players.length - a.players.length);
  return teams;
}

// ─── 상태 ────────────────────────────────────────────────────────────────────
window._jgState = window._jgState || {
  pool: null,
  myUniv: null,
  aiUniv: null,
  difficulty: _jgReadStoredDifficulty(),
  running: false,
  board: null,
  turn: 'me',
  moveCount: 0,
  winner: null,
  selected: null,
  legalTargets: [],
  lastMove: null,
  thinking: false,
  myTeam: null,
  aiTeam: null,
};

function _jgEnsurePool() {
  const st = window._jgState;
  if (!st.pool) st.pool = _jgBuildTeamPool();
  return st.pool;
}

// ─── 좌표 헬퍼 ───────────────────────────────────────────────────────────────
function _jgInBoard(r, c) { return r >= 0 && r < _JG_ROWS && c >= 0 && c < _JG_COLS; }
function _jgInPalace(r, c) { return (r >= 0 && r <= 2 && c >= 3 && c <= 5) || (r >= 7 && r <= 9 && c >= 3 && c <= 5); }
function _jgPalaceDiagNeighbors(r, c) {
  const out = [];
  _JG_PALACE_LINES.forEach(line => {
    const idx = line.findIndex(p => p[0] === r && p[1] === c);
    if (idx === -1) return;
    if (idx - 1 >= 0) out.push(line[idx - 1]);
    if (idx + 1 < line.length) out.push(line[idx + 1]);
  });
  return out;
}
function _jgSlideRays(r, c) {
  const rays = [];
  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
    const ray = [];
    let rr = r + dr, cc = c + dc;
    while (_jgInBoard(rr, cc)) { ray.push([rr, cc]); rr += dr; cc += dc; }
    if (ray.length) rays.push(ray);
  });
  _JG_PALACE_LINES.forEach(line => {
    const idx = line.findIndex(p => p[0] === r && p[1] === c);
    if (idx === -1) return;
    if (idx + 1 < line.length) rays.push(line.slice(idx + 1));
    if (idx - 1 >= 0) rays.push(line.slice(0, idx).reverse());
  });
  return rays;
}

// ─── 기물별 이동(의사 합법수) 생성 ───────────────────────────────────────────
function _jgKingMoves(board, r, c, side) {
  const moves = [];
  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
    const nr = r + dr, nc = c + dc;
    if (!_jgInPalace(nr, nc)) return;
    const p = board[nr][nc];
    if (!p) moves.push({ r: nr, c: nc });
    else if (p.side !== side) moves.push({ r: nr, c: nc, capture: true });
  });
  _jgPalaceDiagNeighbors(r, c).forEach(([nr, nc]) => {
    const p = board[nr][nc];
    if (!p) moves.push({ r: nr, c: nc });
    else if (p.side !== side) moves.push({ r: nr, c: nc, capture: true });
  });
  return moves;
}
function _jgSlideMoves(board, r, c, side) {
  const moves = [];
  _jgSlideRays(r, c).forEach(ray => {
    for (const [rr, cc] of ray) {
      const p = board[rr][cc];
      if (!p) { moves.push({ r: rr, c: cc }); continue; }
      if (p.side !== side) moves.push({ r: rr, c: cc, capture: true });
      break;
    }
  });
  return moves;
}
function _jgCannonMoves(board, r, c, side) {
  const moves = [];
  _jgSlideRays(r, c).forEach(ray => {
    let screenIdx = -1;
    for (let i = 0; i < ray.length; i++) {
      const [rr, cc] = ray[i];
      if (board[rr][cc]) { screenIdx = i; break; }
    }
    if (screenIdx === -1) return;
    const screen = board[ray[screenIdx][0]][ray[screenIdx][1]];
    if (screen.type === 'cannon') return;
    for (let i = screenIdx + 1; i < ray.length; i++) {
      const [rr, cc] = ray[i];
      const p = board[rr][cc];
      if (!p) { moves.push({ r: rr, c: cc }); continue; }
      if (p.type !== 'cannon' && p.side !== side) moves.push({ r: rr, c: cc, capture: true });
      break;
    }
  });
  return moves;
}
const _JG_HORSE_LEGS = [
  { leg: [-1, 0], diag: [[-2, -1], [-2, 1]] },
  { leg: [1, 0],  diag: [[2, -1], [2, 1]] },
  { leg: [0, -1], diag: [[-1, -2], [1, -2]] },
  { leg: [0, 1],  diag: [[-1, 2], [1, 2]] },
];
function _jgHorseMoves(board, r, c, side) {
  const moves = [];
  _JG_HORSE_LEGS.forEach(({ leg, diag }) => {
    const lr = r + leg[0], lc = c + leg[1];
    if (!_jgInBoard(lr, lc) || board[lr][lc]) return;
    diag.forEach(([ddr, ddc]) => {
      const nr = r + ddr, nc = c + ddc;
      if (!_jgInBoard(nr, nc)) return;
      const p = board[nr][nc];
      if (!p) moves.push({ r: nr, c: nc });
      else if (p.side !== side) moves.push({ r: nr, c: nc, capture: true });
    });
  });
  return moves;
}
const _JG_ELEPHANT_DIRS = [
  { leg1: [-1, 0], leg2: [-2, -1], dst: [-3, -2] }, { leg1: [-1, 0], leg2: [-2, 1], dst: [-3, 2] },
  { leg1: [1, 0],  leg2: [2, -1],  dst: [3, -2] },  { leg1: [1, 0],  leg2: [2, 1],  dst: [3, 2] },
  { leg1: [0, -1], leg2: [-1, -2], dst: [-2, -3] }, { leg1: [0, -1], leg2: [1, -2], dst: [2, -3] },
  { leg1: [0, 1],  leg2: [-1, 2],  dst: [-2, 3] },  { leg1: [0, 1],  leg2: [1, 2],  dst: [2, 3] },
];
function _jgElephantMoves(board, r, c, side) {
  const moves = [];
  _JG_ELEPHANT_DIRS.forEach(d => {
    const l1r = r + d.leg1[0], l1c = c + d.leg1[1];
    const l2r = r + d.leg2[0], l2c = c + d.leg2[1];
    const dr = r + d.dst[0], dc = c + d.dst[1];
    if (!_jgInBoard(dr, dc)) return;
    if (!_jgInBoard(l1r, l1c) || board[l1r][l1c]) return;
    if (!_jgInBoard(l2r, l2c) || board[l2r][l2c]) return;
    const p = board[dr][dc];
    if (!p) moves.push({ r: dr, c: dc });
    else if (p.side !== side) moves.push({ r: dr, c: dc, capture: true });
  });
  return moves;
}
function _jgSoldierMoves(board, r, c, side) {
  const moves = [];
  const fwd = side === 'me' ? -1 : 1;
  [[fwd, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
    const nr = r + dr, nc = c + dc;
    if (!_jgInBoard(nr, nc)) return;
    const p = board[nr][nc];
    if (!p) moves.push({ r: nr, c: nc });
    else if (p.side !== side) moves.push({ r: nr, c: nc, capture: true });
  });
  _jgPalaceDiagNeighbors(r, c).forEach(([nr, nc]) => {
    if (nr - r !== fwd) return;
    const p = board[nr][nc];
    if (!p) moves.push({ r: nr, c: nc });
    else if (p.side !== side) moves.push({ r: nr, c: nc, capture: true });
  });
  return moves;
}
function _jgPieceMoves(board, r, c) {
  const p = board[r][c];
  if (!p) return [];
  switch (p.type) {
    case 'general': case 'guard': return _jgKingMoves(board, r, c, p.side);
    case 'chariot': return _jgSlideMoves(board, r, c, p.side);
    case 'cannon': return _jgCannonMoves(board, r, c, p.side);
    case 'horse': return _jgHorseMoves(board, r, c, p.side);
    case 'elephant': return _jgElephantMoves(board, r, c, p.side);
    case 'soldier': return _jgSoldierMoves(board, r, c, p.side);
  }
  return [];
}

// ─── 장군/외통수 판정 ────────────────────────────────────────────────────────
function _jgFindGeneral(board, side) {
  for (let r = 0; r < _JG_ROWS; r++) for (let c = 0; c < _JG_COLS; c++) {
    const p = board[r][c];
    if (p && p.side === side && p.type === 'general') return { r, c };
  }
  return null;
}
function _jgIsAttacked(board, r, c, bySide) {
  for (let rr = 0; rr < _JG_ROWS; rr++) for (let cc = 0; cc < _JG_COLS; cc++) {
    const p = board[rr][cc];
    if (!p || p.side !== bySide) continue;
    const moves = _jgPieceMoves(board, rr, cc);
    for (const m of moves) { if (m.r === r && m.c === c) return true; }
  }
  return false;
}
function _jgInCheck(board, side) {
  const g = _jgFindGeneral(board, side);
  if (!g) return true;
  return _jgIsAttacked(board, g.r, g.c, side === 'me' ? 'ai' : 'me');
}
function _jgGeneralsFacing(board) {
  const gMe = _jgFindGeneral(board, 'me'), gAi = _jgFindGeneral(board, 'ai');
  if (!gMe || !gAi || gMe.c !== gAi.c) return false;
  const top = Math.min(gMe.r, gAi.r), bottom = Math.max(gMe.r, gAi.r);
  for (let r = top + 1; r < bottom; r++) { if (board[r][gMe.c]) return false; }
  return true;
}
function _jgLegalMovesForPiece(board, r, c) {
  const p = board[r][c];
  if (!p) return [];
  const side = p.side;
  const pseudo = _jgPieceMoves(board, r, c);
  const legal = [];
  pseudo.forEach(m => {
    const captured = board[m.r][m.c];
    board[m.r][m.c] = p; board[r][c] = null;
    const bad = _jgInCheck(board, side) || _jgGeneralsFacing(board);
    board[r][c] = p; board[m.r][m.c] = captured;
    if (!bad) legal.push(m);
  });
  return legal;
}
function _jgAllLegalMoves(board, side) {
  const all = [];
  for (let r = 0; r < _JG_ROWS; r++) for (let c = 0; c < _JG_COLS; c++) {
    const p = board[r][c];
    if (!p || p.side !== side) continue;
    _jgLegalMovesForPiece(board, r, c).forEach(m => {
      all.push({ from: { r, c }, to: { r: m.r, c: m.c }, capture: !!m.capture });
    });
  }
  return all;
}

// ─── AI ─────────────────────────────────────────────────────────────────────
function _jgMakeMove(board, mv) {
  const captured = board[mv.to.r][mv.to.c];
  board[mv.to.r][mv.to.c] = board[mv.from.r][mv.from.c];
  board[mv.from.r][mv.from.c] = null;
  return captured;
}
function _jgUndoMove(board, mv, captured) {
  board[mv.from.r][mv.from.c] = board[mv.to.r][mv.to.c];
  board[mv.to.r][mv.to.c] = captured;
}
function _jgEvalBoard(board) {
  let score = 0;
  for (let r = 0; r < _JG_ROWS; r++) for (let c = 0; c < _JG_COLS; c++) {
    const p = board[r][c];
    if (!p) continue;
    let v = _JG_VALUE[p.type] || 0;
    if (p.type === 'soldier') v += (p.side === 'ai' ? r : (9 - r)) * 0.05;
    score += (p.side === 'ai' ? v : -v);
  }
  return score;
}
function _jgOrderedMoves(board, side, width) {
  const moves = _jgAllLegalMoves(board, side);
  moves.forEach(m => {
    let sc = 0;
    if (m.capture) { const cap = board[m.to.r][m.to.c]; sc += cap ? (_JG_VALUE[cap.type] || 0) * 10 : 0; }
    m._s = sc;
  });
  moves.sort((a, b) => b._s - a._s);
  return width ? moves.slice(0, Math.min(width, moves.length)) : moves;
}
function _jgMinimax(board, depth, alpha, beta, side, width) {
  const legal = _jgOrderedMoves(board, side, width);
  if (!legal.length) return side === 'ai' ? -100000 : 100000;
  if (depth === 0) return _jgEvalBoard(board);
  const maximizing = side === 'ai';
  let best = maximizing ? -Infinity : Infinity;
  for (const mv of legal) {
    const cap = _jgMakeMove(board, mv);
    const val = _jgMinimax(board, depth - 1, alpha, beta, side === 'ai' ? 'me' : 'ai', width);
    _jgUndoMove(board, mv, cap);
    if (maximizing) { if (val > best) best = val; alpha = Math.max(alpha, val); }
    else { if (val < best) best = val; beta = Math.min(beta, val); }
    if (beta <= alpha) break;
  }
  return best;
}
function _jgComputeAiMove() {
  const st = window._jgState;
  const board = st.board;
  const diff = _JG_DIFFS[st.difficulty] || _JG_DIFFS.normal;
  const legal = _jgAllLegalMoves(board, 'ai');
  if (!legal.length) return null;
  for (const mv of legal) { const cap = board[mv.to.r][mv.to.c]; if (cap && cap.type === 'general') return mv; }

  if (diff.depth <= 0) {
    const scored = legal.map(m => {
      const cap = m.capture ? board[m.to.r][m.to.c] : null;
      return { m, s: (cap ? (_JG_VALUE[cap.type] || 0) : 0) + Math.random() * 4 };
    });
    scored.sort((a, b) => b.s - a.s);
    const poolSize = Math.max(1, Math.min(diff.randomTop, scored.length));
    return scored[Math.floor(Math.random() * poolSize)].m;
  }

  const ordered = _jgOrderedMoves(board, 'ai', diff.width);
  let bestScore = -Infinity, bestMoves = [];
  let alpha = -Infinity, beta = Infinity;
  for (const mv of ordered) {
    const cap = _jgMakeMove(board, mv);
    const val = _jgMinimax(board, diff.depth - 1, alpha, beta, 'me', diff.width);
    _jgUndoMove(board, mv, cap);
    if (val > bestScore) { bestScore = val; bestMoves = [mv]; }
    else if (val === bestScore) bestMoves.push(mv);
    alpha = Math.max(alpha, val);
  }
  const poolSize = Math.max(1, Math.min(diff.randomTop, bestMoves.length));
  return bestMoves[Math.floor(Math.random() * poolSize)];
}

// ─── 초기 배치 및 기물 사진 배정 ─────────────────────────────────────────────
function _jgSideLayout(backRow, cannonRow, soldierRow, palaceMidRow) {
  return [
    { type: 'chariot',  r: backRow, c: 0 }, { type: 'horse', r: backRow, c: 1 },
    { type: 'elephant', r: backRow, c: 2 }, { type: 'guard', r: backRow, c: 3 },
    { type: 'guard',    r: backRow, c: 5 }, { type: 'elephant', r: backRow, c: 6 },
    { type: 'horse',    r: backRow, c: 7 }, { type: 'chariot',  r: backRow, c: 8 },
    { type: 'general',  r: palaceMidRow, c: 4 },
    { type: 'cannon',   r: cannonRow, c: 1 }, { type: 'cannon', r: cannonRow, c: 7 },
    { type: 'soldier',  r: soldierRow, c: 0 }, { type: 'soldier', r: soldierRow, c: 2 },
    { type: 'soldier',  r: soldierRow, c: 4 }, { type: 'soldier', r: soldierRow, c: 6 },
    { type: 'soldier',  r: soldierRow, c: 8 },
  ];
}
function _jgAssignPieces(team, sideId, defs) {
  const players = (team.players && team.players.length) ? team.players.slice() : [{ name: team.univ, photo: '' }];
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }
  let idx = 0;
  return defs.map(d => {
    const p = players[idx % players.length]; idx++;
    return { side: sideId, type: d.type, r: d.r, c: d.c, univ: team.univ, color: team.color, name: p.name, photo: p.photo, uid: idx };
  });
}

// ─── 게임 진행 ───────────────────────────────────────────────────────────────
function _jgFinishTurn(moverSide) {
  const st = window._jgState;
  const oppSide = moverSide === 'me' ? 'ai' : 'me';
  if (st.moveCount >= 300) {
    st.winner = 'draw';
    const stats = _jgReadStats(); stats.draw++; _jgSaveStats(stats);
    return true;
  }
  const oppLegal = _jgAllLegalMoves(st.board, oppSide);
  if (!oppLegal.length) {
    st.winner = moverSide;
    const stats = _jgReadStats();
    if (moverSide === 'me') { stats.win++; _jgWinSound(); } else { stats.lose++; _jgLoseSound(); }
    _jgSaveStats(stats);
    return true;
  }
  st.turn = oppSide;
  return false;
}

function _jgCellClick(r, c) {
  const st = window._jgState;
  if (!st.running || st.winner || st.turn !== 'me' || st.thinking) return;
  const board = st.board;
  const cell = board[r][c];

  if (st.selected) {
    const sel = st.selected;
    if (sel.r === r && sel.c === c) { st.selected = null; st.legalTargets = []; _jgRenderRoot(); return; }
    const target = st.legalTargets.find(m => m.r === r && m.c === c);
    if (target) {
      board[r][c] = board[sel.r][sel.c];
      board[sel.r][sel.c] = null;
      st.lastMove = { from: { r: sel.r, c: sel.c }, to: { r, c } };
      st.selected = null; st.legalTargets = [];
      st.moveCount++;
      _jgMoveSound(!!target.capture);
      const ended = _jgFinishTurn('me');
      _jgRenderRoot();
      if (!ended && st.turn === 'ai') {
        st.thinking = true;
        _jgRenderRoot();
        setTimeout(_jgAiTurn, 550);
      }
      return;
    }
    if (cell && cell.side === 'me') {
      st.selected = { r, c };
      st.legalTargets = _jgLegalMovesForPiece(board, r, c);
      _jgRenderRoot();
      return;
    }
    st.selected = null; st.legalTargets = [];
    _jgRenderRoot();
    return;
  }

  if (cell && cell.side === 'me') {
    st.selected = { r, c };
    st.legalTargets = _jgLegalMovesForPiece(board, r, c);
    _jgRenderRoot();
  }
}
window._jgCellClick = _jgCellClick;

function _jgAiTurn() {
  const st = window._jgState;
  if (!st.running || st.winner) { st.thinking = false; return; }
  const board = st.board;
  const mv = _jgComputeAiMove();
  st.thinking = false;
  if (!mv) {
    st.winner = 'me';
    const stats = _jgReadStats(); stats.win++; _jgSaveStats(stats); _jgWinSound();
    _jgRenderRoot();
    return;
  }
  const captured = board[mv.to.r][mv.to.c];
  board[mv.to.r][mv.to.c] = board[mv.from.r][mv.from.c];
  board[mv.from.r][mv.from.c] = null;
  st.lastMove = { from: mv.from, to: mv.to };
  st.moveCount++;
  _jgMoveSound(!!captured);
  _jgFinishTurn('ai');
  _jgRenderRoot();
}

function _jgSelectTeam(kind, univ) {
  const st = window._jgState;
  const other = kind === 'my' ? 'aiUniv' : 'myUniv';
  const mine = kind === 'my' ? 'myUniv' : 'aiUniv';
  if (st[other] === univ) st[other] = st[mine];
  st[mine] = univ;
  _rLsSet(kind === 'my' ? 'su_jg_my' : 'su_jg_ai', univ);
  _jgRenderRoot();
}
window._jgSelectTeam = _jgSelectTeam;

function _jgSetDifficulty(key) {
  if (!_JG_DIFFS[key]) return;
  window._jgState.difficulty = key;
  _rLsSet('su_jg_diff', key);
  _jgRenderRoot();
}
window._jgSetDifficulty = _jgSetDifficulty;

function _jgPreloadTeamPhotos(team) {
  try {
    (team.players || []).forEach(p => {
      if (!p.photo) return;
      const im = new Image();
      im.src = _jgThumbUrl(p.photo);
    });
  } catch (e) {}
}

function _jgStartGame() {
  const st = window._jgState;
  const pool = _jgEnsurePool();
  const myTeam = pool.find(t => t.univ === st.myUniv);
  const aiTeam = pool.find(t => t.univ === st.aiUniv);
  if (!myTeam || !aiTeam || myTeam.univ === aiTeam.univ) return;
  st.myTeam = myTeam; st.aiTeam = aiTeam;
  const board = Array.from({ length: _JG_ROWS }, () => Array(_JG_COLS).fill(null));
  const mePieces = _jgAssignPieces(myTeam, 'me', _jgSideLayout(9, 7, 6, 8));
  const aiPieces = _jgAssignPieces(aiTeam, 'ai', _jgSideLayout(0, 2, 3, 1));
  mePieces.concat(aiPieces).forEach(p => { board[p.r][p.c] = p; });
  st.board = board;
  st.turn = 'me';
  st.moveCount = 0;
  st.winner = null;
  st.selected = null;
  st.legalTargets = [];
  st.lastMove = null;
  st.thinking = false;
  st.running = true;
  _jgPreloadTeamPhotos(myTeam);
  _jgPreloadTeamPhotos(aiTeam);
  _jgRenderRoot();
}
window._jgStartGame = _jgStartGame;

function _jgBackToSetup() {
  window._jgState.running = false;
  _jgRenderRoot();
}
window._jgBackToSetup = _jgBackToSetup;

function _jgCleanup() {
  window._jgState.thinking = false;
}
window._jgCleanup = _jgCleanup;

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function _jgMiniAvatarsHTML(team) {
  const sample = (team.players || []).slice(0, 3);
  if (!sample.length) return `<div class="jg-chip-avatars"><div class="jg-mini-fallback" style="background:${team.color}">?</div></div>`;
  return `<div class="jg-chip-avatars">${sample.map(p => {
    const initial = _jgEsc(String(p.name || '?').trim().slice(0, 1));
    return p.photo
      ? `<img src="${_jgEsc(_jgThumbUrl(p.photo))}" alt="${_jgEsc(p.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'jg-mini-fallback\\' style=\\'background:${team.color}\\'>${initial}</div>'">`
      : `<div class="jg-mini-fallback" style="background:${team.color}">${initial}</div>`;
  }).join('')}</div>`;
}
function _jgTeamChipHTML(team, kind, selected) {
  const on = selected === team.univ;
  return `<button type="button" class="jg-chip${on ? ' on' : ''}" style="--jg-chip-color:${team.color}" onclick="_jgSelectTeam('${kind}','${_jgEsc(team.univ).replace(/'/g, "\\'")}')">
    ${_jgMiniAvatarsHTML(team)}
    <div class="jg-chip-meta">
      <span class="jg-chip-name">${_jgEsc(team.univ)}</span>
      <span class="jg-chip-count">${team.players.length}명</span>
    </div>
  </button>`;
}
function _jgDiffBarHTML() {
  const st = window._jgState;
  return Object.values(_JG_DIFFS).map(d =>
    `<button type="button" class="jg-diff-pill${st.difficulty === d.key ? ' on' : ''}" onclick="_jgSetDifficulty('${d.key}')">${d.emoji} ${d.label}</button>`
  ).join('');
}
function _jgSetupHTML() {
  const st = window._jgState;
  const pool = _jgEnsurePool();
  const stats = _jgReadStats();

  if (pool.length < 2) {
    return `<div class="jg-shell">
      <div class="jg-card">
        <div class="jg-head-row">
          <div class="jg-head-left">
            <div class="jg-icon-badge">♟️</div>
            <div class="jg-title-group">
              <div class="jg-title">스타대학 장기</div>
              <div class="jg-desc">응원할 대학(소속)과 상대 대학을 골라 AI와 장기 대결을 펼치는 게임입니다.</div>
            </div>
          </div>
        </div>
        <div class="jg-empty-note">⚠️ 게임을 만들 만큼 소속(대학)과 선수 프로필이 등록되지 않았습니다. 선수 데이터에 소속/사진을 더 등록한 뒤 다시 시도해주세요.</div>
      </div>
    </div>`;
  }

  const myUniv = pool.find(t => t.univ === st.myUniv) ? st.myUniv : null;
  const aiUniv = pool.find(t => t.univ === st.aiUniv) ? st.aiUniv : null;
  const canStart = myUniv && aiUniv && myUniv !== aiUniv;

  return `<div class="jg-shell">
    <div class="jg-card">
      <div class="jg-head-row">
        <div class="jg-head-left">
          <div class="jg-icon-badge">♟️</div>
          <div class="jg-title-group">
            <div class="jg-title">스타대학 장기</div>
            <div class="jg-desc">내가 응원할 대학과 맞붙을 상대 대학을 고르면, 각 대학 소속 스트리머 사진이 기물이 되어 대결합니다. 상대 궁(장군)을 외통수로 몰아넣으면 승리! (동형반복 등 일부 고급 규칙은 간소화되어 있습니다)</div>
          </div>
        </div>
      </div>

      <div class="jg-stats-row">
        <div class="jg-stat-chip"><b>${stats.win}</b><span>승</span></div>
        <div class="jg-stat-chip"><b>${stats.lose}</b><span>패</span></div>
        <div class="jg-stat-chip"><b>${stats.draw}</b><span>무</span></div>
      </div>

      <div class="jg-section-label">♟️ 내가 응원할 대학 (홍 · 선공)</div>
      <div class="jg-chip-bar">${pool.map(t => _jgTeamChipHTML(t, 'my', myUniv)).join('')}</div>

      <div class="jg-section-label">♟️ 상대 대학 (AI · 청 · 후공)</div>
      <div class="jg-chip-bar">${pool.map(t => _jgTeamChipHTML(t, 'ai', aiUniv)).join('')}</div>

      <div class="jg-section-label">난이도</div>
      <div class="jg-chip-bar">${_jgDiffBarHTML()}</div>

      <div class="jg-actions">
        <button class="jg-btn jg-btn-primary" ${canStart ? '' : 'disabled'} onclick="_jgStartGame()">⚔️ 대결 시작</button>
      </div>
      ${!canStart ? `<div class="jg-status is-info">서로 다른 대학 두 곳을 선택하면 대결을 시작할 수 있어요.</div>` : ''}
    </div>
  </div>`;
}

function _jgPalaceSvg() {
  const pt = (r, c) => [((c + 0.5) / _JG_COLS * 900).toFixed(1), ((r + 0.5) / _JG_ROWS * 1000).toFixed(1)];
  const lines = [[[0, 3], [2, 5]], [[0, 5], [2, 3]], [[7, 3], [9, 5]], [[7, 5], [9, 3]]];
  const segs = lines.map(([a, b]) => {
    const [x1, y1] = pt(a[0], a[1]), [x2, y2] = pt(b[0], b[1]);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(90,60,20,.42)" stroke-width="3.4"/>`;
  }).join('');
  return `<svg class="jg-palace-lines" viewBox="0 0 900 1000" preserveAspectRatio="none">${segs}</svg>`;
}

function _jgPieceHTML(cell, r, c, checkSide, winGlow) {
  const label = _JG_LABELS[cell.type] || '?';
  const initial = _jgEsc(String(cell.name || '?').trim().slice(0, 1));
  const st = window._jgState;
  const isLast = st.lastMove && st.lastMove.to.r === r && st.lastMove.to.c === c;
  const isGeneralCheck = cell.type === 'general' && checkSide === cell.side;
  const cls = `jg-piece${isLast ? ' jg-last' : ''}${isGeneralCheck ? ' jg-general-check' : ''}${winGlow ? ' jg-win-glow' : ''}`;
  const img = cell.photo
    ? `<img src="${_jgEsc(_jgThumbUrl(cell.photo))}" alt="${_jgEsc(cell.name)}" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="jg-piece-fallback" style="display:none;background:${cell.color}">${initial}</div>`
    : `<div class="jg-piece-fallback" style="background:${cell.color}">${initial}</div>`;
  return `<div class="${cls}" style="--jg-ring:${cell.color}">
    <div class="jg-piece-photo">${img}</div>
    <div class="jg-piece-tag">${label}</div>
  </div>`;
}

function _jgCellHTML(r, c, checkSide) {
  const st = window._jgState;
  const cell = st.board[r][c];
  const isSel = st.selected && st.selected.r === r && st.selected.c === c;
  const target = st.legalTargets.find(m => m.r === r && m.c === c);
  const winnerSide = st.winner === 'me' || st.winner === 'ai' ? st.winner : null;
  const winGlow = winnerSide && cell && cell.side === winnerSide && cell.type === 'general';
  const classes = ['jg-cell'];
  if (isSel) classes.push('jg-sel');
  if (target) classes.push(target.capture ? 'jg-target-cap' : 'jg-target');
  const inner = cell ? _jgPieceHTML(cell, r, c, checkSide, winGlow) : '';
  return `<div class="${classes.join(' ')}" onclick="_jgCellClick(${r},${c})">${inner}${target ? '<div class="jg-target-dot"></div>' : ''}</div>`;
}

function _jgBoardHTML() {
  const st = window._jgState;
  const checkSide = st.winner ? null : (_jgInCheck(st.board, 'me') ? 'me' : (_jgInCheck(st.board, 'ai') ? 'ai' : null));
  let html = _jgPalaceSvg();
  for (let r = 0; r < _JG_ROWS; r++) for (let c = 0; c < _JG_COLS; c++) html += _jgCellHTML(r, c, checkSide);
  return { html, checkSide };
}

function _jgGameHTML() {
  const st = window._jgState;
  const my = st.myTeam, ai = st.aiTeam;
  const { html: boardHTML, checkSide } = _jgBoardHTML();

  let statusHTML;
  if (st.winner === 'me') statusHTML = `<div class="jg-status is-good">🏆 ${_jgEsc(my.univ)}(나)이(가) 외통수로 승리했습니다!</div>`;
  else if (st.winner === 'ai') statusHTML = `<div class="jg-status is-bad">😥 ${_jgEsc(ai.univ)}(AI)이(가) 외통수로 이겼습니다.</div>`;
  else if (st.winner === 'draw') statusHTML = `<div class="jg-status is-info">🤝 수 제한에 도달했습니다. 무승부!</div>`;
  else if (st.turn === 'ai') statusHTML = `<div class="jg-status is-think">🤖 ${_jgEsc(ai.univ)}(AI)이(가) 수를 고민하는 중...</div>`;
  else if (checkSide === 'me') statusHTML = `<div class="jg-status is-check">⚠️ 장군! 궁을 피하거나 막을 수를 두세요.</div>`;
  else statusHTML = `<div class="jg-status is-info">♟️ 내 차례입니다. 기물을 선택해 이동하세요.</div>`;

  const resultHTML = st.winner ? `<div class="jg-result">
    <span class="jg-result-emoji">${st.winner === 'me' ? '🏆' : st.winner === 'ai' ? '😥' : '🤝'}</span>
    <div class="jg-result-title">${st.winner === 'me' ? `${_jgEsc(my.univ)} 승리!` : st.winner === 'ai' ? `${_jgEsc(ai.univ)} 승리` : '무승부'}</div>
    <div class="jg-result-sub">${_jgEsc(my.univ)} vs ${_jgEsc(ai.univ)} · ${_JG_DIFFS[st.difficulty].label} 난이도</div>
  </div>` : '';

  return `<div class="jg-shell">
    <div class="jg-card">
      <div class="jg-head-row">
        <div class="jg-head-left">
          <div class="jg-icon-badge">♟️</div>
          <div class="jg-title-group">
            <div class="jg-title">스타대학 장기</div>
            <div class="jg-desc">상대 궁(장군)을 피할 수 없게 몰아넣으면 승리합니다. 기물을 눌러 이동 가능한 칸을 확인하세요.</div>
          </div>
        </div>
        <button class="jg-btn" onclick="_jgBackToSetup()">🔁 팀 다시 선택</button>
      </div>

      <div class="jg-vs-row">
        <div class="jg-side-card${st.turn === 'me' && !st.winner ? ' is-turn' : ''}${st.winner === 'me' ? ' is-win' : ''}${checkSide === 'me' && !st.winner ? ' is-check' : ''}" style="--jg-side-color:${my.color}">
          <div class="jg-side-swatch" style="background:${my.color}">♟️</div>
          <div class="jg-side-meta">
            <div class="jg-side-role">나 (홍 · 선공)</div>
            <div class="jg-side-name">${_jgEsc(my.univ)}</div>
          </div>
        </div>
        <div class="jg-vs-mid">VS</div>
        <div class="jg-side-card${st.turn === 'ai' && !st.winner ? ' is-turn' : ''}${st.winner === 'ai' ? ' is-win' : ''}${checkSide === 'ai' && !st.winner ? ' is-check' : ''}" style="--jg-side-color:${ai.color}">
          <div class="jg-side-swatch" style="background:${ai.color}">♟️</div>
          <div class="jg-side-meta">
            <div class="jg-side-role">AI (청 · 후공)</div>
            <div class="jg-side-name">${_jgEsc(ai.univ)}</div>
          </div>
        </div>
      </div>

      ${statusHTML}
      ${resultHTML}

      <div class="jg-board-wrap">
        <div class="jg-board jg-turn-${st.turn}">${boardHTML}</div>
      </div>

      <div class="jg-actions">
        <button class="jg-btn jg-btn-primary" onclick="_jgStartGame()">${st.winner ? '🔄 같은 팀으로 다시하기' : '🔄 새로 시작'}</button>
        <button class="jg-btn" onclick="_jgBackToSetup()">🔁 팀 다시 선택</button>
      </div>
    </div>
  </div>`;
}

function _jgRenderRoot() {
  const root = document.getElementById('jg-root');
  if (!root) return;
  const st = window._jgState;
  root.innerHTML = st.running ? _jgGameHTML() : _jgSetupHTML();
}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _jgInit() {
  const st = window._jgState;
  _jgEnsurePool();
  if (!st.myUniv || !st.aiUniv) {
    const pool = st.pool || [];
    const savedMy = _rLsGet('su_jg_my', '');
    const savedAi = _rLsGet('su_jg_ai', '');
    if (pool.find(t => t.univ === savedMy)) st.myUniv = savedMy;
    if (pool.find(t => t.univ === savedAi)) st.aiUniv = savedAi;
    if (!st.myUniv && pool[0]) st.myUniv = pool[0].univ;
    if (!st.aiUniv && pool[1]) st.aiUniv = pool[1].univ;
    if (st.myUniv && st.myUniv === st.aiUniv && pool[1]) st.aiUniv = pool[1].univ;
  }
  _jgRenderRoot();
}
window._jgInit = _jgInit;
