/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('omok') 진입 시 동적으로 로드됨. */
// ─── ⚫⚪ 스타대학 오목 (스트리머 프로필 이미지로 두는 5목) ──────────────────────────
// 규칙: 내가 응원하는 스타대학(소속)을 흑돌로, 상대 대학을 AI(백돌)로 골라 대결.
//       가로/세로/대각선으로 같은 편 돌이 5개 연속이면 승리. 돌에는 각 대학 소속
//       스트리머 프로필 사진이 랜덤으로 표시됨(팀매칭 게임과 동일한 방식 재사용).

(function _omInjectCSS() {
  if (document.getElementById('om-style')) return;
  const s = document.createElement('style');
  s.id = 'om-style';
  s.textContent = [
    '.om-shell{display:flex;flex-direction:column;gap:14px;width:100%}',
    '.om-card{position:relative;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);border-radius:26px;box-shadow:0 20px 44px rgba(15,23,42,.08),inset 0 1px 0 rgba(255,255,255,.9);padding:22px 22px 20px;overflow:hidden}',
    '.om-card::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#334155,#0f172a,#334155)}',
    '.om-head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}',
    '.om-head-left{display:flex;align-items:flex-start;gap:12px;min-width:0}',
    '.om-icon-badge{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:21px;background:linear-gradient(135deg,#334155,#0f172a);box-shadow:0 8px 16px rgba(15,23,42,.32)}',
    '.om-title-group{min-width:0}',
    '.om-title{font-size:17px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}',
    '.om-desc{margin-top:4px;font-size:var(--fs-sm);line-height:1.6;color:var(--text3);max-width:460px}',
    '.om-btn{padding:11px 18px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:var(--fs-base);font-weight:900;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.05);font-family:inherit;transition:.12s;white-space:nowrap}',
    '.om-btn:hover{border-color:rgba(37,99,235,.25);color:#2563eb;transform:translateY(-1px)}',
    '.om-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}',
    '.om-btn.om-btn-primary{background:linear-gradient(135deg,#334155,#0f172a 60%,#1e293b);color:#fff;border:none;box-shadow:0 7px 0 #020617,0 16px 26px rgba(15,23,42,.28)}',
    '.om-btn.om-btn-primary:hover{color:#fff;transform:translateY(-2px)}',
    '.om-btn.om-btn-primary:disabled{box-shadow:none}',
    '.om-actions{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}',
    '.om-section-label{margin-top:18px;font-size:var(--fs-caption);font-weight:900;color:var(--text3);letter-spacing:.02em}',
    '.om-chip-bar{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}',
    '.om-chip{position:relative;display:flex;align-items:center;gap:8px;padding:8px 14px 8px 8px;border-radius:999px;border:2px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);cursor:pointer;font-family:inherit;transition:.14s;white-space:nowrap}',
    '.om-chip:hover{transform:translateY(-1px)}',
    '.om-chip.on{border-color:var(--om-chip-color,#2563eb);box-shadow:0 6px 14px rgba(37,99,235,.22)}',
    '.om-chip.is-disabled{opacity:.35;cursor:not-allowed;pointer-events:none}',
    '.om-chip-avatars{display:flex;flex-shrink:0}',
    '.om-chip-avatars img,.om-chip-avatars .om-mini-fallback{width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(15,23,42,.25);margin-left:-9px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff}',
    '.om-chip-avatars img:first-child,.om-chip-avatars .om-mini-fallback:first-child{margin-left:0}',
    '.om-chip-meta{display:flex;flex-direction:column;line-height:1.2}',
    '.om-chip-name{font-size:var(--fs-sm);font-weight:900;color:var(--text1)}',
    '.om-chip-count{font-size:10px;font-weight:800;color:var(--text3)}',
    '.om-diff-pill{padding:8px 13px;border-radius:999px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:var(--fs-sm);font-weight:800;cursor:pointer;font-family:inherit;transition:.14s;white-space:nowrap}',
    '.om-diff-pill:hover{border-color:rgba(37,99,235,.3);color:#2563eb;transform:translateY(-1px)}',
    '.om-diff-pill.on{background:linear-gradient(135deg,#334155,#0f172a);color:#fff;border-color:transparent;box-shadow:0 6px 14px rgba(15,23,42,.3)}',
    '.om-empty-note{font-size:var(--fs-sm);color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 14px;margin-top:14px;line-height:1.6}',
    '.om-stats-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}',
    '.om-stat-chip{flex:1;min-width:70px;text-align:center;padding:9px 8px;border-radius:12px;background:#f8fafc;border:1px solid rgba(148,163,184,.16)}',
    '.om-stat-chip b{display:block;font-size:16px;color:var(--text1)}',
    '.om-stat-chip span{font-size:10px;font-weight:800;color:var(--text3)}',
    '.om-vs-row{display:flex;align-items:stretch;gap:10px;margin-top:16px}',
    '.om-side-card{flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:18px;background:#f8fafc;border:2px solid rgba(148,163,184,.16);transition:.2s}',
    '.om-side-card.is-turn{border-color:var(--om-side-color,#2563eb);box-shadow:0 0 0 4px color-mix(in srgb, var(--om-side-color,#2563eb) 16%, transparent);background:#fff}',
    '.om-side-card.is-win{border-color:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.18)}',
    '.om-side-swatch{flex:none;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:inset 0 0 0 3px rgba(255,255,255,.5)}',
    '.om-side-meta{min-width:0;line-height:1.25}',
    '.om-side-role{font-size:10px;font-weight:900;color:var(--text3);letter-spacing:.02em}',
    '.om-side-name{font-size:var(--fs-sm);font-weight:900;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.om-vs-mid{flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;color:var(--text3);font-size:13px}',
    '.om-status{margin-top:12px;display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:14px;font-size:var(--fs-sm);font-weight:800;line-height:1.5}',
    '.om-status::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;flex-shrink:0}',
    '.om-status.is-info{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}',
    '.om-status.is-info::before{background:#3b82f6}',
    '.om-status.is-think{background:#fefce8;border:1px solid #fde68a;color:#92400e}',
    '.om-status.is-think::before{background:#f59e0b;animation:omPulseDot 1s ease-in-out infinite}',
    '.om-status.is-good{background:#ecfdf5;border:1px solid #86efac;color:#047857}',
    '.om-status.is-good::before{background:#10b981}',
    '.om-status.is-bad{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c}',
    '.om-status.is-bad::before{background:#ef4444}',
    '@keyframes omPulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}',
    '.om-board-wrap{margin-top:14px;display:flex;justify-content:center}',
    '.om-board{position:relative;width:100%;max-width:720px;aspect-ratio:1/1;display:grid;grid-template-columns:repeat(var(--om-size),1fr);background:linear-gradient(160deg,#e8c583,#d9a85a);border-radius:16px;padding:9px;box-shadow:0 16px 34px rgba(120,80,20,.28),inset 0 2px 4px rgba(255,255,255,.35);touch-action:manipulation}',
    '.om-cell{position:relative}',
    '.om-cell::before{content:"";position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(90,60,20,.4);transform:translateY(-.5px)}',
    '.om-cell::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(90,60,20,.4);transform:translateX(-.5px)}',
    '.om-cell.om-empty{cursor:default}',
    '.om-board.om-turn-me .om-cell.om-empty{cursor:pointer}',
    '.om-board.om-turn-me .om-cell.om-empty:hover .om-ghost{opacity:.4}',
    '.om-ghost{position:absolute;inset:10%;border-radius:50%;background:var(--om-my-color,#334155);opacity:0;pointer-events:none;transition:.1s}',
    '.om-stone{position:absolute;inset:4%;border-radius:50%;overflow:hidden;box-shadow:0 3px 6px rgba(0,0,0,.35),inset 0 0 0 2.5px rgba(255,255,255,.85);animation:omDropIn .22s ease both;background:#e2e8f0}',
    '.om-stone::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 -6px 8px rgba(0,0,0,.18),inset 0 4px 5px rgba(255,255,255,.35);pointer-events:none}',
    '.om-stone img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}',
    '.om-stone-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;pointer-events:none}',
    '.om-stone.om-last{box-shadow:0 3px 6px rgba(0,0,0,.35),inset 0 0 0 3px #fff,0 0 0 3px var(--om-ring-color,#2563eb)}',
    '.om-stone.om-win{box-shadow:0 0 0 3px #fff,0 0 0 6px #f59e0b,0 0 14px 3px rgba(245,158,11,.65);animation:omWinPulse 1s ease-in-out infinite}',
    '@keyframes omDropIn{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}',
    '@keyframes omWinPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}',
    '.om-result{background:linear-gradient(135deg,#F0F4FF,#F8FAFF);border:1px solid rgba(51,65,85,.22);border-radius:22px;padding:22px 20px;text-align:center;margin-top:16px;animation:omPopIn .4s cubic-bezier(.175,.885,.32,1.35)}',
    '@keyframes omPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}',
    '.om-result-emoji{font-size:44px;display:block;margin-bottom:4px}',
    '.om-result-title{font-size:clamp(20px,4.4vw,28px);font-weight:900;color:var(--text);margin:4px 0 4px}',
    '.om-result-sub{font-size:var(--fs-sm);color:var(--text3)}',
    'body.dark .om-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}',
    'body.dark .om-side-card{background:#0f172a;border-color:#243349}',
    'body.dark .om-side-card.is-turn{background:#111f36}',
    'body.dark .om-stat-chip{background:#0f172a;border-color:#243349}',
    'body.dark .om-result{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}',
    'body.dark .om-btn,body.dark .om-chip,body.dark .om-diff-pill{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .om-diff-pill.on{color:#fff}',
    'body.dark .om-title{color:#f8fafc}',
    'body.dark .om-desc{color:#94a3b8}',
    'body.dark .om-status.is-info{background:#0b1a33;border-color:#1e3a5f;color:#93c5fd}',
    'body.dark .om-status.is-think{background:#241c04;border-color:#5c4a0a;color:#fcd34d}',
    'body.dark .om-status.is-good{background:#052e1f;border-color:#14532d;color:#86efac}',
    'body.dark .om-status.is-bad{background:#2c0b0b;border-color:#7f1d1d;color:#fca5a5}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 사운드 (team-match-game.js와 동일한 WebAudio 패턴) ───────────────────────
let _omAC = null;
function _omPlaceSound() {
  try {
    if (!_omAC) _omAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _omAC.createOscillator(), g = _omAC.createGain();
    o.connect(g); g.connect(_omAC.destination);
    o.frequency.value = 300; o.type = 'triangle';
    g.gain.setValueAtTime(0.12, _omAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _omAC.currentTime + 0.16);
    o.start(); o.stop(_omAC.currentTime + 0.16);
  } catch (e) {}
}
function _omWinSound() {
  try {
    if (!_omAC) _omAC = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => {
        const o = _omAC.createOscillator(), g = _omAC.createGain();
        o.connect(g); g.connect(_omAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.14, _omAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _omAC.currentTime + 0.24);
        o.start(); o.stop(_omAC.currentTime + 0.24);
      }, i * 80);
    });
  } catch (e) {}
}
function _omLoseSound() {
  try {
    if (!_omAC) _omAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _omAC.createOscillator(), g = _omAC.createGain();
    o.connect(g); g.connect(_omAC.destination);
    o.frequency.value = 180; o.type = 'sawtooth';
    g.gain.setValueAtTime(0.1, _omAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _omAC.currentTime + 0.3);
    o.start(); o.stop(_omAC.currentTime + 0.3);
  } catch (e) {}
}

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────
function _omEsc(s) {
  return (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s);
}
function _omUrl(u) {
  return (typeof toHttpsUrl === 'function') ? toHttpsUrl(u) : u;
}
// 돌/미니 아바타는 화면상 40px 안팎으로 작게 나오는데 원본 사진(수백KB~수MB)을 그대로 받으면
// 매 수마다 새 이미지가 늦게 뜨는 원인이 됨 → toScaledUrl로 작은 webp 썸네일만 받도록 축소
function _omThumbUrl(u) {
  return (typeof toScaledUrl === 'function') ? toScaledUrl(u, 90) : _omUrl(u);
}
const _OM_SIZE = 13;
const _OM_WIN_LEN = 5;
const _OM_AXES = [[1, 0], [0, 1], [1, 1], [1, -1]];
const _OM_DIFFS = {
  beginner: { key: 'beginner', label: '입문',   emoji: '🐣', defenseWeight: 0.25, lookahead: false, lookaheadDepth: 0, randomTop: 10 },
  easy:     { key: 'easy',     label: '쉬움',   emoji: '🌱', defenseWeight: 0.5,  lookahead: false, lookaheadDepth: 0, randomTop: 5 },
  normal:   { key: 'normal',   label: '보통',   emoji: '⚔️', defenseWeight: 0.9,  lookahead: false, lookaheadDepth: 0, randomTop: 2 },
  hard:     { key: 'hard',     label: '고수',   emoji: '🔥', defenseWeight: 1.05, lookahead: true,  lookaheadDepth: 1, randomTop: 1, lookaheadWidth: 6 },
  master:   { key: 'master',   label: '마스터', emoji: '👑', defenseWeight: 1.2,  lookahead: true,  lookaheadDepth: 2, randomTop: 1, lookaheadWidth: 8 },
};

function _omReadStoredDifficulty() {
  const v = _rLsGet('su_om_diff', 'normal');
  return _OM_DIFFS[v] ? v : 'normal';
}
function _omReadStats() {
  try {
    const raw = _rLsGet('su_om_stats', '');
    const v = raw ? JSON.parse(raw) : null;
    return (v && typeof v === 'object') ? { win: v.win || 0, lose: v.lose || 0, draw: v.draw || 0 } : { win: 0, lose: 0, draw: 0 };
  } catch (e) { return { win: 0, lose: 0, draw: 0 }; }
}
function _omSaveStats(stats) {
  try { _rLsSet('su_om_stats', JSON.stringify(stats)); } catch (e) {}
}

// ─── 대학(소속) 팀 풀 구성 (team-match-game.js 방식 재사용) ───────────────────
function _omBuildTeamPool() {
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
  const diverseTeams = teams.filter(t => t.players.length >= 2);
  if (diverseTeams.length >= 2) teams = diverseTeams;
  teams.sort((a, b) => b.players.length - a.players.length);
  return teams;
}

function _omDrawFromBag(side) {
  const st = window._omState;
  const team = side === 'me' ? st.myTeam : st.aiTeam;
  let bag = st.bags[side];
  if (!bag || !bag.length) {
    bag = team.players.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    const lastPicked = st.lastPicked[side];
    if (lastPicked && bag.length > 1 && bag[bag.length - 1].name === lastPicked) {
      const swapWith = Math.floor(Math.random() * (bag.length - 1));
      [bag[bag.length - 1], bag[swapWith]] = [bag[swapWith], bag[bag.length - 1]];
    }
    st.bags[side] = bag;
  }
  const picked = bag.pop();
  st.lastPicked[side] = picked.name;
  return picked;
}

// ─── 상태 ────────────────────────────────────────────────────────────────────
window._omState = window._omState || {
  pool: null,
  myUniv: null,
  aiUniv: null,
  difficulty: _omReadStoredDifficulty(),
  running: false,
  board: null,
  size: _OM_SIZE,
  turn: 'me',
  moveCount: 0,
  winner: null,
  winLine: [],
  lastMove: null,
  thinking: false,
  bags: { me: [], ai: [] },
  lastPicked: { me: null, ai: null },
  uidSeq: 1,
  myTeam: null,
  aiTeam: null,
};

function _omEnsurePool() {
  const st = window._omState;
  if (!st.pool) st.pool = _omBuildTeamPool();
  return st.pool;
}

// ─── 판정 로직 ───────────────────────────────────────────────────────────────
function _omDirRun(board, size, r, c, dr, dc, side) {
  let rr = r + dr, cc = c + dc, cnt = 0;
  while (rr >= 0 && rr < size && cc >= 0 && cc < size && board[rr][cc] && board[rr][cc].side === side) {
    cnt++; rr += dr; cc += dc;
  }
  const open = (rr >= 0 && rr < size && cc >= 0 && cc < size && !board[rr][cc]);
  return { cnt, open };
}
function _omAxisInfo(board, size, r, c, dr, dc, side) {
  const pos = _omDirRun(board, size, r, c, dr, dc, side);
  const neg = _omDirRun(board, size, r, c, -dr, -dc, side);
  return { total: pos.cnt + neg.cnt + 1, openEnds: (pos.open ? 1 : 0) + (neg.open ? 1 : 0), pos, neg };
}
function _omPatternScore(total, openEnds) {
  if (total >= _OM_WIN_LEN) return 100000;
  if (total === 4) return openEnds === 2 ? 50000 : (openEnds === 1 ? 10000 : 0);
  if (total === 3) return openEnds === 2 ? 5000 : (openEnds === 1 ? 600 : 0);
  if (total === 2) return openEnds === 2 ? 200 : (openEnds === 1 ? 60 : 0);
  if (total === 1) return openEnds === 2 ? 15 : (openEnds === 1 ? 5 : 0);
  return 0;
}
function _omEvalPoint(board, size, r, c, side) {
  let score = 0;
  for (const [dr, dc] of _OM_AXES) {
    const { total, openEnds } = _omAxisInfo(board, size, r, c, dr, dc, side);
    score += _omPatternScore(total, openEnds);
  }
  return score;
}
function _omWouldWin(board, size, r, c, side) {
  for (const [dr, dc] of _OM_AXES) {
    const { total } = _omAxisInfo(board, size, r, c, dr, dc, side);
    if (total >= _OM_WIN_LEN) return true;
  }
  return false;
}
function _omWinLine(board, size, r, c, side) {
  for (const [dr, dc] of _OM_AXES) {
    const info = _omAxisInfo(board, size, r, c, dr, dc, side);
    if (info.total >= _OM_WIN_LEN) {
      const line = [];
      for (let i = -info.neg.cnt; i <= info.pos.cnt; i++) line.push({ r: r + dr * i, c: c + dc * i });
      return line;
    }
  }
  return null;
}
function _omCollectCandidates(board, size) {
  const has = [];
  let anyStone = false;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c]) anyStone = true;
    }
  }
  if (!anyStone) return [{ r: Math.floor(size / 2), c: Math.floor(size / 2) }];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c]) continue;
      let near = false;
      for (let dr = -2; dr <= 2 && !near; dr++) {
        for (let dc = -2; dc <= 2 && !near; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr >= 0 && rr < size && cc >= 0 && cc < size && board[rr][cc]) near = true;
        }
      }
      if (near) has.push({ r, c });
    }
  }
  return has;
}

// ─── AI ─────────────────────────────────────────────────────────────────────
function _omComputeAiMove() {
  const st = window._omState;
  const board = st.board, size = st.size;
  const cands = _omCollectCandidates(board, size);
  if (!cands.length) return null;
  const diff = _OM_DIFFS[st.difficulty] || _OM_DIFFS.normal;

  for (const c of cands) { if (_omWouldWin(board, size, c.r, c.c, 'ai')) return c; }
  for (const c of cands) { if (_omWouldWin(board, size, c.r, c.c, 'me')) return c; }

  let scored = cands.map(c => {
    const off = _omEvalPoint(board, size, c.r, c.c, 'ai');
    const def = _omEvalPoint(board, size, c.r, c.c, 'me');
    return { r: c.r, c: c.c, score: off + diff.defenseWeight * def };
  });
  scored.sort((a, b) => b.score - a.score);

  const lookDepth = diff.lookahead ? (diff.lookaheadDepth || 1) : 0;
  if (lookDepth >= 1) {
    const width = diff.lookaheadWidth || 6;
    const top = scored.slice(0, Math.min(width, scored.length));
    top.forEach(cand => {
      board[cand.r][cand.c] = { side: 'ai' };
      const nextCands = _omCollectCandidates(board, size);
      let bestOpp = 0, bestOppMove = null;
      nextCands.forEach(c2 => {
        const s = _omEvalPoint(board, size, c2.r, c2.c, 'me');
        if (s > bestOpp) { bestOpp = s; bestOppMove = c2; }
      });
      let penalty = bestOpp * 0.3;
      // 마스터(2수 앞내다보기): 상대의 최선 대응 이후, AI가 이어서 만회할 수 있는 정도를 반영
      if (lookDepth >= 2 && bestOppMove) {
        board[bestOppMove.r][bestOppMove.c] = { side: 'me' };
        const next2 = _omCollectCandidates(board, size);
        let bestFollow = 0;
        next2.forEach(c3 => {
          const s = _omEvalPoint(board, size, c3.r, c3.c, 'ai');
          if (s > bestFollow) bestFollow = s;
        });
        board[bestOppMove.r][bestOppMove.c] = null;
        penalty -= bestFollow * 0.15;
      }
      board[cand.r][cand.c] = null;
      cand.score2 = cand.score - penalty;
    });
    top.sort((a, b) => (b.score2 ?? b.score) - (a.score2 ?? a.score));
    scored = top;
  }

  const poolSize = Math.max(1, Math.min(diff.randomTop, scored.length));
  const pick = scored[Math.floor(Math.random() * poolSize)];
  return { r: pick.r, c: pick.c };
}

// ─── 게임 진행 ───────────────────────────────────────────────────────────────
function _omPlaceStoneAndCheck(r, c, side) {
  const st = window._omState;
  const team = side === 'me' ? st.myTeam : st.aiTeam;
  const picked = _omDrawFromBag(side);
  st.board[r][c] = {
    side, univ: team.univ, color: team.color,
    name: picked.name, photo: picked.photo, uid: st.uidSeq++,
  };
  st.lastMove = { r, c };
  st.moveCount++;
  const line = _omWinLine(st.board, st.size, r, c, side);
  if (line) {
    st.winner = side;
    st.winLine = line;
    const stats = _omReadStats();
    if (side === 'me') { stats.win++; _omWinSound(); } else { stats.lose++; _omLoseSound(); }
    _omSaveStats(stats);
    return true;
  }
  if (st.moveCount >= st.size * st.size) {
    st.winner = 'draw';
    const stats = _omReadStats(); stats.draw++; _omSaveStats(stats);
    return true;
  }
  return false;
}

function _omCellClick(r, c) {
  const st = window._omState;
  if (!st.running || st.winner || st.turn !== 'me' || st.thinking) return;
  if (st.board[r][c]) return;
  _omPlaceSound();
  const ended = _omPlaceStoneAndCheck(r, c, 'me');
  if (!ended) {
    st.turn = 'ai';
    st.thinking = true;
    _omRenderRoot();
    setTimeout(_omAiTurn, 520);
  } else {
    _omRenderRoot();
  }
}
window._omCellClick = _omCellClick;

function _omAiTurn() {
  const st = window._omState;
  if (!st.running || st.winner) { st.thinking = false; return; }
  const move = _omComputeAiMove();
  st.thinking = false;
  if (!move) { st.winner = 'draw'; _omRenderRoot(); return; }
  _omPlaceSound();
  const ended = _omPlaceStoneAndCheck(move.r, move.c, 'ai');
  if (!ended) st.turn = 'me';
  _omRenderRoot();
}

function _omSelectTeam(kind, univ) {
  const st = window._omState;
  const other = kind === 'my' ? 'aiUniv' : 'myUniv';
  const mine = kind === 'my' ? 'myUniv' : 'aiUniv';
  if (st[other] === univ) {
    // 같은 대학을 상대쪽에서 선택 중이면 서로 맞바꿔줌
    st[other] = st[mine];
  }
  st[mine] = univ;
  _rLsSet(kind === 'my' ? 'su_om_my' : 'su_om_ai', univ);
  _omRenderRoot();
}
window._omSelectTeam = _omSelectTeam;

function _omSetDifficulty(key) {
  if (!_OM_DIFFS[key]) return;
  window._omState.difficulty = key;
  _rLsSet('su_om_diff', key);
  _omRenderRoot();
}
window._omSetDifficulty = _omSetDifficulty;

function _omPreloadTeamPhotos(team) {
  try {
    (team.players || []).forEach(p => {
      if (!p.photo) return;
      const im = new Image();
      im.src = _omThumbUrl(p.photo);
    });
  } catch (e) {}
}

function _omStartGame() {
  const st = window._omState;
  const pool = _omEnsurePool();
  const myTeam = pool.find(t => t.univ === st.myUniv);
  const aiTeam = pool.find(t => t.univ === st.aiUniv);
  if (!myTeam || !aiTeam || myTeam.univ === aiTeam.univ) return;
  st.myTeam = myTeam;
  st.aiTeam = aiTeam;
  st.size = _OM_SIZE;
  st.board = Array.from({ length: st.size }, () => Array(st.size).fill(null));
  st.bags = { me: [], ai: [] };
  st.lastPicked = { me: null, ai: null };
  st.uidSeq = 1;
  st.turn = 'me';
  st.moveCount = 0;
  st.winner = null;
  st.winLine = [];
  st.lastMove = null;
  st.thinking = false;
  st.running = true;
  _omPreloadTeamPhotos(myTeam);
  _omPreloadTeamPhotos(aiTeam);
  _omRenderRoot();
}
window._omStartGame = _omStartGame;

function _omBackToSetup() {
  window._omState.running = false;
  _omRenderRoot();
}
window._omBackToSetup = _omBackToSetup;

function _omCleanup() {
  window._omState.thinking = false;
}
window._omCleanup = _omCleanup;

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function _omMiniAvatarsHTML(team) {
  const sample = (team.players || []).slice(0, 3);
  if (!sample.length) return `<div class="om-chip-avatars"><div class="om-mini-fallback" style="background:${team.color}">?</div></div>`;
  return `<div class="om-chip-avatars">${sample.map(p => {
    const initial = _omEsc(String(p.name || '?').trim().slice(0, 1));
    return p.photo
      ? `<img src="${_omEsc(_omThumbUrl(p.photo))}" alt="${_omEsc(p.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'om-mini-fallback\\' style=\\'background:${team.color}\\'>${initial}</div>'">`
      : `<div class="om-mini-fallback" style="background:${team.color}">${initial}</div>`;
  }).join('')}</div>`;
}

function _omTeamChipHTML(team, kind, selected, disabled) {
  const on = selected === team.univ;
  return `<button type="button" class="om-chip${on ? ' on' : ''}${disabled ? ' is-disabled' : ''}" style="--om-chip-color:${team.color}" onclick="_omSelectTeam('${kind}','${_omEsc(team.univ).replace(/'/g, "\\'")}')">
    ${_omMiniAvatarsHTML(team)}
    <div class="om-chip-meta">
      <span class="om-chip-name">${_omEsc(team.univ)}</span>
      <span class="om-chip-count">${team.players.length}명</span>
    </div>
  </button>`;
}

function _omDiffBarHTML() {
  const st = window._omState;
  return Object.values(_OM_DIFFS).map(d =>
    `<button type="button" class="om-diff-pill${st.difficulty === d.key ? ' on' : ''}" onclick="_omSetDifficulty('${d.key}')">${d.emoji} ${d.label}</button>`
  ).join('');
}

function _omSetupHTML() {
  const st = window._omState;
  const pool = _omEnsurePool();
  const stats = _omReadStats();

  if (pool.length < 2) {
    return `<div class="om-shell">
      <div class="om-card">
        <div class="om-head-row">
          <div class="om-head-left">
            <div class="om-icon-badge">⚫⚪</div>
            <div class="om-title-group">
              <div class="om-title">스타대학 오목</div>
              <div class="om-desc">응원할 대학(소속)과 상대 대학을 골라 AI와 오목 대결을 펼치는 게임입니다.</div>
            </div>
          </div>
        </div>
        <div class="om-empty-note">⚠️ 게임을 만들 만큼 소속(대학)과 선수 프로필이 등록되지 않았습니다. 선수 데이터에 소속/사진을 더 등록한 뒤 다시 시도해주세요.</div>
      </div>
    </div>`;
  }

  const myUniv = pool.find(t => t.univ === st.myUniv) ? st.myUniv : null;
  const aiUniv = pool.find(t => t.univ === st.aiUniv) ? st.aiUniv : null;
  const canStart = myUniv && aiUniv && myUniv !== aiUniv;

  return `<div class="om-shell">
    <div class="om-card">
      <div class="om-head-row">
        <div class="om-head-left">
          <div class="om-icon-badge">⚫⚪</div>
          <div class="om-title-group">
            <div class="om-title">스타대학 오목</div>
            <div class="om-desc">내가 응원할 대학과 맞붙을 상대 대학을 고르면, 각 대학 소속 스트리머 사진이 돌이 되어 대결합니다. 5개를 먼저 이으면 승리!</div>
          </div>
        </div>
      </div>

      <div class="om-stats-row">
        <div class="om-stat-chip"><b>${stats.win}</b><span>승</span></div>
        <div class="om-stat-chip"><b>${stats.lose}</b><span>패</span></div>
        <div class="om-stat-chip"><b>${stats.draw}</b><span>무</span></div>
      </div>

      <div class="om-section-label">⚫ 내가 응원할 대학 (선공)</div>
      <div class="om-chip-bar">${pool.map(t => _omTeamChipHTML(t, 'my', myUniv, false)).join('')}</div>

      <div class="om-section-label">⚪ 상대 대학 (AI · 후공)</div>
      <div class="om-chip-bar">${pool.map(t => _omTeamChipHTML(t, 'ai', aiUniv, false)).join('')}</div>

      <div class="om-section-label">난이도</div>
      <div class="om-chip-bar">${_omDiffBarHTML()}</div>

      <div class="om-actions">
        <button class="om-btn om-btn-primary" ${canStart ? '' : 'disabled'} onclick="_omStartGame()">⚔️ 대결 시작</button>
      </div>
      ${!canStart ? `<div class="om-status is-info">서로 다른 대학 두 곳을 선택하면 대결을 시작할 수 있어요.</div>` : ''}
    </div>
  </div>`;
}

function _omCellHTML(cell, r, c, winSet) {
  const key = r + ',' + c;
  if (!cell) {
    return `<div class="om-cell om-empty" onclick="_omCellClick(${r},${c})"><div class="om-ghost"></div></div>`;
  }
  const isLast = window._omState.lastMove && window._omState.lastMove.r === r && window._omState.lastMove.c === c;
  const isWin = winSet.has(key);
  const initial = _omEsc(String(cell.name || '?').trim().slice(0, 1));
  const ringColor = cell.side === 'me' ? (window._omState.myTeam && window._omState.myTeam.color) : (window._omState.aiTeam && window._omState.aiTeam.color);
  const stoneClass = `om-stone${isLast ? ' om-last' : ''}${isWin ? ' om-win' : ''}`;
  const img = cell.photo
    ? `<img src="${_omEsc(_omThumbUrl(cell.photo))}" alt="${_omEsc(cell.name)}" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="om-stone-fallback" style="display:none;background:${cell.color}">${initial}</div>`
    : `<div class="om-stone-fallback" style="background:${cell.color}">${initial}</div>`;
  return `<div class="om-cell" onclick="_omCellClick(${r},${c})">
    <div class="${stoneClass}" style="--om-ring-color:${ringColor || '#2563eb'}">${img}</div>
  </div>`;
}

function _omBoardHTML() {
  const st = window._omState;
  const winSet = new Set((st.winLine || []).map(p => p.r + ',' + p.c));
  let html = '';
  for (let r = 0; r < st.size; r++) {
    for (let c = 0; c < st.size; c++) html += _omCellHTML(st.board[r][c], r, c, winSet);
  }
  return html;
}

function _omGameHTML() {
  const st = window._omState;
  const my = st.myTeam, ai = st.aiTeam;

  let statusHTML;
  if (st.winner === 'me') statusHTML = `<div class="om-status is-good">🏆 ${_omEsc(my.univ)}(나)이(가) 5목을 완성했습니다!</div>`;
  else if (st.winner === 'ai') statusHTML = `<div class="om-status is-bad">😥 ${_omEsc(ai.univ)}(AI)이(가) 5목을 완성했습니다.</div>`;
  else if (st.winner === 'draw') statusHTML = `<div class="om-status is-info">🤝 보드가 가득 찼습니다. 무승부!</div>`;
  else if (st.turn === 'ai') statusHTML = `<div class="om-status is-think">🤖 ${_omEsc(ai.univ)}(AI)이(가) 수를 고민하는 중...</div>`;
  else statusHTML = `<div class="om-status is-info">⚫ 내 차례입니다. 원하는 칸을 눌러 돌을 놓으세요.</div>`;

  const resultHTML = st.winner ? `<div class="om-result">
    <span class="om-result-emoji">${st.winner === 'me' ? '🏆' : st.winner === 'ai' ? '😥' : '🤝'}</span>
    <div class="om-result-title">${st.winner === 'me' ? `${_omEsc(my.univ)} 승리!` : st.winner === 'ai' ? `${_omEsc(ai.univ)} 승리` : '무승부'}</div>
    <div class="om-result-sub">${_omEsc(my.univ)} vs ${_omEsc(ai.univ)} · ${_OM_DIFFS[st.difficulty].label} 난이도</div>
  </div>` : '';

  return `<div class="om-shell">
    <div class="om-card">
      <div class="om-head-row">
        <div class="om-head-left">
          <div class="om-icon-badge">⚫⚪</div>
          <div class="om-title-group">
            <div class="om-title">스타대학 오목</div>
            <div class="om-desc">가로·세로·대각선 어느 방향이든 같은 편 돌 5개를 먼저 이으면 승리합니다.</div>
          </div>
        </div>
        <button class="om-btn" onclick="_omBackToSetup()">🔁 팀 다시 선택</button>
      </div>

      <div class="om-vs-row">
        <div class="om-side-card${st.turn === 'me' && !st.winner ? ' is-turn' : ''}${st.winner === 'me' ? ' is-win' : ''}" style="--om-side-color:${my.color}">
          <div class="om-side-swatch" style="background:${my.color}">⚫</div>
          <div class="om-side-meta">
            <div class="om-side-role">나 (선공)</div>
            <div class="om-side-name">${_omEsc(my.univ)}</div>
          </div>
        </div>
        <div class="om-vs-mid">VS</div>
        <div class="om-side-card${st.turn === 'ai' && !st.winner ? ' is-turn' : ''}${st.winner === 'ai' ? ' is-win' : ''}" style="--om-side-color:${ai.color}">
          <div class="om-side-swatch" style="background:${ai.color}">⚪</div>
          <div class="om-side-meta">
            <div class="om-side-role">AI (후공)</div>
            <div class="om-side-name">${_omEsc(ai.univ)}</div>
          </div>
        </div>
      </div>

      ${statusHTML}
      ${resultHTML}

      <div class="om-board-wrap">
        <div class="om-board om-turn-${st.turn}" style="--om-size:${st.size};--om-my-color:${my.color}">${_omBoardHTML()}</div>
      </div>

      <div class="om-actions">
        <button class="om-btn om-btn-primary" onclick="_omStartGame()">${st.winner ? '🔄 같은 팀으로 다시하기' : '🔄 새로 시작'}</button>
        <button class="om-btn" onclick="_omBackToSetup()">🔁 팀 다시 선택</button>
      </div>
    </div>
  </div>`;
}

function _omRenderRoot() {
  const root = document.getElementById('om-root');
  if (!root) return;
  const st = window._omState;
  root.innerHTML = st.running ? _omGameHTML() : _omSetupHTML();
}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _omInit() {
  const st = window._omState;
  _omEnsurePool();
  if (!st.myUniv || !st.aiUniv) {
    const pool = st.pool || [];
    const savedMy = _rLsGet('su_om_my', '');
    const savedAi = _rLsGet('su_om_ai', '');
    if (pool.find(t => t.univ === savedMy)) st.myUniv = savedMy;
    if (pool.find(t => t.univ === savedAi)) st.aiUniv = savedAi;
    if (!st.myUniv && pool[0]) st.myUniv = pool[0].univ;
    if (!st.aiUniv && pool[1]) st.aiUniv = pool[1].univ;
    if (st.myUniv && st.myUniv === st.aiUniv && pool[1]) st.aiUniv = pool[1].univ;
  }
  _omRenderRoot();
}
window._omInit = _omInit;
