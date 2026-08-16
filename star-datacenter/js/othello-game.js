/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('othello') 진입 시 동적으로 로드됨. */
// ─── 🟢⚪ 스타대학 오델로 (스트리머 프로필 이미지로 두는 리버시) ──────────────────────────
// 규칙: 내가 응원하는 스타대학(소속)을 검정(선공)으로, 상대 대학을 AI(하양, 후공)로 골라 대결.
//       표준 오델로(리버시) 규칙 그대로: 상대 돌을 양 끝에서 감싸면 뒤집기, 둘 곳이 없으면 자동 패스,
//       양쪽 다 둘 곳이 없으면 종료 후 돌 개수가 많은 쪽 승리. 돌에는 각 대학 소속 스트리머 프로필
//       사진이 랜덤 배정됨(오목/장기 게임과 동일한 톤). 뒤집힌 돌은 사진은 유지한 채 소속(색)만 바뀝니다.

(function _otInjectCSS() {
  if (document.getElementById('ot-style')) return;
  const s = document.createElement('style');
  s.id = 'ot-style';
  s.textContent = `
    .ot-shell{display:flex;flex-direction:column;gap:14px;width:100%}
    .ot-card{position:relative;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);border-radius:26px;box-shadow:0 20px 44px rgba(15,23,42,.08),inset 0 1px 0 rgba(255,255,255,.9);padding:22px 22px 20px;overflow:hidden}
    .ot-card::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#065f46,#022c22,#065f46)}
    .ot-head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .ot-head-left{display:flex;align-items:flex-start;gap:12px;min-width:0}
    .ot-icon-badge{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:21px;background:linear-gradient(135deg,#065f46,#022c22);box-shadow:0 8px 16px rgba(2,44,34,.32)}
    .ot-title-group{min-width:0}
    .ot-title{font-size:17px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}
    .ot-desc{margin-top:4px;font-size:var(--fs-sm);line-height:1.6;color:var(--text3);max-width:460px}
    .ot-btn{padding:11px 18px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:var(--fs-base);font-weight:900;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.05);font-family:inherit;transition:.12s;white-space:nowrap}
    .ot-btn:hover{border-color:rgba(6,95,70,.3);color:#065f46;transform:translateY(-1px)}
    .ot-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
    .ot-btn.ot-btn-primary{background:linear-gradient(135deg,#065f46,#022c22 60%,#064e3b);color:#fff;border:none;box-shadow:0 7px 0 #011712,0 16px 26px rgba(2,44,34,.28)}
    .ot-btn.ot-btn-primary:hover{color:#fff;transform:translateY(-2px)}
    .ot-btn.ot-btn-primary:disabled{box-shadow:none}
    .ot-actions{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
    .ot-section-label{margin-top:18px;font-size:var(--fs-caption);font-weight:900;color:var(--text3);letter-spacing:.02em}
    .ot-chip-bar{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .ot-chip{position:relative;display:flex;align-items:center;gap:8px;padding:8px 14px 8px 8px;border-radius:999px;border:2px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);cursor:pointer;font-family:inherit;transition:.14s;white-space:nowrap}
    .ot-chip:hover{transform:translateY(-1px)}
    .ot-chip.on{border-color:var(--ot-chip-color,#065f46);box-shadow:0 6px 14px rgba(6,95,70,.22)}
    .ot-chip-avatars{display:flex;flex-shrink:0}
    .ot-chip-avatars img,.ot-chip-avatars .ot-mini-fallback{width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(15,23,42,.25);margin-left:-9px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff}
    .ot-chip-avatars img:first-child,.ot-chip-avatars .ot-mini-fallback:first-child{margin-left:0}
    .ot-chip-meta{display:flex;flex-direction:column;line-height:1.2}
    .ot-chip-name{font-size:var(--fs-sm);font-weight:900;color:var(--text1)}
    .ot-chip-count{font-size:10px;font-weight:800;color:var(--text3)}
    .ot-diff-pill{padding:8px 13px;border-radius:999px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:var(--fs-sm);font-weight:800;cursor:pointer;font-family:inherit;transition:.14s;white-space:nowrap}
    .ot-diff-pill:hover{border-color:rgba(6,95,70,.3);color:#065f46;transform:translateY(-1px)}
    .ot-diff-pill.on{background:linear-gradient(135deg,#065f46,#022c22);color:#fff;border-color:transparent;box-shadow:0 6px 14px rgba(2,44,34,.3)}
    .ot-empty-note{font-size:var(--fs-sm);color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 14px;margin-top:14px;line-height:1.6}
    .ot-stats-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
    .ot-stat-chip{flex:1;min-width:70px;text-align:center;padding:9px 8px;border-radius:12px;background:#f8fafc;border:1px solid rgba(148,163,184,.16)}
    .ot-stat-chip b{display:block;font-size:16px;color:var(--text1)}
    .ot-stat-chip span{font-size:10px;font-weight:800;color:var(--text3)}
    .ot-vs-row{display:flex;align-items:stretch;gap:10px;margin-top:16px}
    .ot-side-card{flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:18px;background:#f8fafc;border:2px solid rgba(148,163,184,.16);transition:.2s}
    .ot-side-card.is-turn{border-color:var(--ot-side-color,#065f46);box-shadow:0 0 0 4px color-mix(in srgb, var(--ot-side-color,#065f46) 16%, transparent);background:#fff}
    .ot-side-card.is-win{border-color:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.18)}
    .ot-side-swatch{flex:none;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:inset 0 0 0 3px rgba(255,255,255,.5)}
    .ot-side-meta{min-width:0;line-height:1.25;flex:1}
    .ot-side-role{font-size:10px;font-weight:900;color:var(--text3);letter-spacing:.02em}
    .ot-side-name{font-size:var(--fs-sm);font-weight:900;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ot-side-count{font-size:15px;font-weight:950;color:var(--text1)}
    .ot-vs-mid{flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;color:var(--text3);font-size:13px}
    .ot-status{margin-top:12px;display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:14px;font-size:var(--fs-sm);font-weight:800;line-height:1.5}
    .ot-status::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;flex-shrink:0}
    .ot-status.is-info{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}
    .ot-status.is-info::before{background:#3b82f6}
    .ot-status.is-think{background:#fefce8;border:1px solid #fde68a;color:#92400e}
    .ot-status.is-think::before{background:#f59e0b;animation:otPulseDot 1s ease-in-out infinite}
    .ot-status.is-good{background:#ecfdf5;border:1px solid #86efac;color:#047857}
    .ot-status.is-good::before{background:#10b981}
    .ot-status.is-bad{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c}
    .ot-status.is-bad::before{background:#ef4444}
    .ot-status.is-pass{background:#f5f3ff;border:1px solid #ddd6fe;color:#6d28d9}
    .ot-status.is-pass::before{background:#8b5cf6}
    @keyframes otPulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
    .ot-board-wrap{margin-top:14px;display:flex;justify-content:center}
    .ot-board{position:relative;width:100%;max-width:520px;aspect-ratio:1/1;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);background:linear-gradient(160deg,#0d7a56,#065f46);border-radius:16px;padding:10px;box-shadow:0 16px 34px rgba(2,44,34,.32),inset 0 2px 4px rgba(255,255,255,.15);touch-action:manipulation;gap:2px}
    .ot-cell{position:relative;background:rgba(255,255,255,.04);border-radius:4px;cursor:default;display:flex;align-items:center;justify-content:center}
    .ot-board.ot-turn-me .ot-cell.ot-legal{cursor:pointer}
    .ot-cell.ot-legal::after{content:"";position:absolute;inset:38%;border-radius:50%;background:rgba(255,255,255,.4);pointer-events:none;animation:otDotPulse 1.1s ease-in-out infinite}
    @keyframes otDotPulse{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.3);opacity:.35}}
    .ot-piece{position:absolute;inset:6%;border-radius:50%;perspective:400px}
    .ot-piece-inner{position:relative;width:100%;height:100%;border-radius:50%;filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))}
    .ot-piece.ot-flip .ot-piece-inner{animation:otFlipPiece .5s ease}
    @keyframes otFlipPiece{0%{transform:rotateY(0)}50%{transform:rotateY(90deg) scale(.82)}100%{transform:rotateY(0)}}
    .ot-piece.ot-new .ot-piece-inner{animation:otDropIn .2s ease both}
    @keyframes otDropIn{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
    .ot-piece-photo{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:#e2e8f0;box-shadow:inset 0 0 0 2.5px rgba(255,255,255,.9),inset 0 -6px 8px rgba(0,0,0,.16),inset 0 4px 5px rgba(255,255,255,.3),0 0 0 3px var(--ot-ring,#065f46)}
    .ot-piece-photo img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
    .ot-piece-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;pointer-events:none}
    .ot-piece.ot-last .ot-piece-photo{box-shadow:inset 0 0 0 3px #fff,0 0 0 3px var(--ot-ring,#065f46),0 0 10px 2px rgba(255,255,255,.5)}
    .ot-result{background:linear-gradient(135deg,#ECFDF5,#F5FBF9);border:1px solid rgba(6,95,70,.22);border-radius:22px;padding:22px 20px;text-align:center;margin-top:16px;animation:otPopIn .4s cubic-bezier(.175,.885,.32,1.35)}
    @keyframes otPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
    .ot-result-emoji{font-size:44px;display:block;margin-bottom:4px}
    .ot-result-title{font-size:clamp(20px,4.4vw,28px);font-weight:900;color:var(--text);margin:4px 0 4px}
    .ot-result-sub{font-size:var(--fs-sm);color:var(--text3)}
    body.dark .ot-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}
    body.dark .ot-side-card{background:#0f172a;border-color:#243349}
    body.dark .ot-side-card.is-turn{background:#111f36}
    body.dark .ot-stat-chip{background:#0f172a;border-color:#243349}
    body.dark .ot-result{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}
    body.dark .ot-btn,body.dark .ot-chip,body.dark .ot-diff-pill{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}
    body.dark .ot-diff-pill.on{color:#fff}
    body.dark .ot-title{color:#f8fafc}
    body.dark .ot-desc{color:#94a3b8}
    body.dark .ot-status.is-info{background:#0b1a33;border-color:#1e3a5f;color:#93c5fd}
    body.dark .ot-status.is-think{background:#241c04;border-color:#5c4a0a;color:#fcd34d}
    body.dark .ot-status.is-good{background:#052e1f;border-color:#14532d;color:#86efac}
    body.dark .ot-status.is-bad{background:#2c0b0b;border-color:#7f1d1d;color:#fca5a5}
    body.dark .ot-status.is-pass{background:#1e1b33;border-color:#4c3a8a;color:#c4b5fd}
  `;
  document.head.appendChild(s);
})();

// ─── 사운드 (오목/장기 게임과 동일한 WebAudio 패턴) ───────────────────────────────
let _otAC = null;
function _otMoveSound(flipCount) {
  try {
    if (!_otAC) _otAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _otAC.createOscillator(), g = _otAC.createGain();
    o.connect(g); g.connect(_otAC.destination);
    const isBig = flipCount >= 3;
    o.frequency.value = isBig ? 260 : 340; o.type = isBig ? 'sawtooth' : 'triangle';
    g.gain.setValueAtTime(0.12, _otAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _otAC.currentTime + (isBig ? 0.2 : 0.14));
    o.start(); o.stop(_otAC.currentTime + (isBig ? 0.2 : 0.14));
  } catch (e) {}
}
function _otWinSound() {
  try {
    if (!_otAC) _otAC = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => {
        const o = _otAC.createOscillator(), g = _otAC.createGain();
        o.connect(g); g.connect(_otAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.14, _otAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _otAC.currentTime + 0.24);
        o.start(); o.stop(_otAC.currentTime + 0.24);
      }, i * 80);
    });
  } catch (e) {}
}
function _otLoseSound() {
  try {
    if (!_otAC) _otAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _otAC.createOscillator(), g = _otAC.createGain();
    o.connect(g); g.connect(_otAC.destination);
    o.frequency.value = 170; o.type = 'sawtooth';
    g.gain.setValueAtTime(0.1, _otAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _otAC.currentTime + 0.3);
    o.start(); o.stop(_otAC.currentTime + 0.3);
  } catch (e) {}
}

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────
function _otEsc(s) {
  return (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s);
}
function _otUrl(u) {
  return (typeof toHttpsUrl === 'function') ? toHttpsUrl(u) : u;
}
function _otThumbUrl(u) {
  return (typeof toScaledUrl === 'function') ? toScaledUrl(u, 90) : _otUrl(u);
}

const _OT_SIZE = 8;
const _OT_DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
// 코너/모서리를 우대, X-스퀘어(코너 대각)를 페널티 주는 고전적 오델로 가중치판
const _OT_WEIGHTS = [
  [100,-20,10,5,5,10,-20,100],
  [-20,-50,-2,-2,-2,-2,-50,-20],
  [10,-2,-1,-1,-1,-1,-2,10],
  [5,-2,-1,-1,-1,-1,-2,5],
  [5,-2,-1,-1,-1,-1,-2,5],
  [10,-2,-1,-1,-1,-1,-2,10],
  [-20,-50,-2,-2,-2,-2,-50,-20],
  [100,-20,10,5,5,10,-20,100],
];
const _OT_DIFFS = {
  beginner: { key: 'beginner', label: '입문',   emoji: '🐣', depth: 0, width: 0,  randomTop: 8 },
  easy:     { key: 'easy',     label: '쉬움',   emoji: '🌱', depth: 1, width: 14, randomTop: 4 },
  normal:   { key: 'normal',   label: '보통',   emoji: '⚔️', depth: 2, width: 14, randomTop: 1 },
  hard:     { key: 'hard',     label: '고수',   emoji: '🔥', depth: 3, width: 12, randomTop: 1 },
  master:   { key: 'master',   label: '마스터', emoji: '👑', depth: 4, width: 10, randomTop: 1 },
};

function _otReadStoredDifficulty() {
  const v = _rLsGet('su_ot_diff', 'normal');
  return _OT_DIFFS[v] ? v : 'normal';
}
function _otReadStats() {
  try {
    const raw = _rLsGet('su_ot_stats', '');
    const v = raw ? JSON.parse(raw) : null;
    return (v && typeof v === 'object') ? { win: v.win || 0, lose: v.lose || 0, draw: v.draw || 0 } : { win: 0, lose: 0, draw: 0 };
  } catch (e) { return { win: 0, lose: 0, draw: 0 }; }
}
function _otSaveStats(stats) {
  try { _rLsSet('su_ot_stats', JSON.stringify(stats)); } catch (e) {}
}

// ─── 대학(소속) 팀 풀 구성 (오목/장기 게임과 동일한 방식) ──────────────────────
function _otBuildTeamPool() {
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

function _otDrawFromBag(side) {
  const st = window._otState;
  const team = side === 'me' ? st.myTeam : st.aiTeam;
  let bag = st.bags[side];
  if (!bag || !bag.length) {
    bag = team.players.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    st.bags[side] = bag;
  }
  return bag.pop() || { name: team.univ, photo: '' };
}

// ─── 상태 ────────────────────────────────────────────────────────────────────
window._otState = window._otState || {
  pool: null,
  myUniv: null,
  aiUniv: null,
  difficulty: _otReadStoredDifficulty(),
  running: false,
  board: null,
  turn: 'me',
  winner: null,
  lastMove: null,
  flippedNow: [],
  newNow: null,
  thinking: false,
  passNotice: null,
  meCount: 2,
  aiCount: 2,
  bags: { me: [], ai: [] },
  myTeam: null,
  aiTeam: null,
};

function _otEnsurePool() {
  const st = window._otState;
  if (!st.pool) st.pool = _otBuildTeamPool();
  return st.pool;
}

// ─── 오델로 규칙 로직 ────────────────────────────────────────────────────────
function _otFlipsForMove(board, r, c, side) {
  if (board[r][c]) return null;
  const opp = side === 'me' ? 'ai' : 'me';
  let all = [];
  for (const [dr, dc] of _OT_DIRS) {
    let rr = r + dr, cc = c + dc;
    const line = [];
    while (rr >= 0 && rr < _OT_SIZE && cc >= 0 && cc < _OT_SIZE && board[rr][cc] && board[rr][cc].side === opp) {
      line.push([rr, cc]); rr += dr; cc += dc;
    }
    if (line.length && rr >= 0 && rr < _OT_SIZE && cc >= 0 && cc < _OT_SIZE && board[rr][cc] && board[rr][cc].side === side) {
      all = all.concat(line);
    }
  }
  return all.length ? all : null;
}
function _otLegalMoves(board, side) {
  const moves = [];
  for (let r = 0; r < _OT_SIZE; r++) for (let c = 0; c < _OT_SIZE; c++) {
    const flips = _otFlipsForMove(board, r, c, side);
    if (flips) moves.push({ r, c, flips });
  }
  return moves;
}
function _otHasAnyMove(board, side) {
  for (let r = 0; r < _OT_SIZE; r++) for (let c = 0; c < _OT_SIZE; c++) {
    if (_otFlipsForMove(board, r, c, side)) return true;
  }
  return false;
}

// ─── AI 평가/탐색 ────────────────────────────────────────────────────────────
function _otEvalBoard(board) {
  let score = 0, meCount = 0, aiCount = 0, empty = 0;
  for (let r = 0; r < _OT_SIZE; r++) for (let c = 0; c < _OT_SIZE; c++) {
    const cell = board[r][c];
    if (!cell) { empty++; continue; }
    const w = _OT_WEIGHTS[r][c];
    if (cell.side === 'ai') { score += w; aiCount++; } else { score -= w; meCount++; }
  }
  const meMob = _otLegalMoves(board, 'me').length;
  const aiMob = _otLegalMoves(board, 'ai').length;
  score += (aiMob - meMob) * 8;
  if (empty <= 10) score += (aiCount - meCount) * 14;
  return score;
}
function _otOrderedMoves(board, side, width) {
  const moves = _otLegalMoves(board, side);
  moves.forEach(m => {
    let sc = m.flips.length;
    const isCorner = (m.r === 0 || m.r === 7) && (m.c === 0 || m.c === 7);
    const isXSquare = (m.r === 1 || m.r === 6) && (m.c === 1 || m.c === 6);
    if (isCorner) sc += 60; else if (isXSquare) sc -= 20;
    m._s = sc;
  });
  moves.sort((a, b) => b._s - a._s);
  return width ? moves.slice(0, Math.min(width, moves.length)) : moves;
}
// 탐색 전용 경량 적용/취소: .side 값만 뒤집고 되돌림 (사진/색상은 실제 진행시에만 갱신)
function _otSearchMakeMove(board, mv, side) {
  board[mv.r][mv.c] = { side };
  mv.flips.forEach(([fr, fc]) => { board[fr][fc].side = side; });
}
function _otSearchUndoMove(board, mv, side) {
  const opp = side === 'me' ? 'ai' : 'me';
  board[mv.r][mv.c] = null;
  mv.flips.forEach(([fr, fc]) => { board[fr][fc].side = opp; });
}
function _otMinimax(board, depth, alpha, beta, side, width) {
  const oppSide = side === 'ai' ? 'me' : 'ai';
  const moves = _otOrderedMoves(board, side, width);
  if (!moves.length) {
    if (!_otHasAnyMove(board, oppSide)) return _otEvalBoard(board);
    return _otMinimax(board, depth, alpha, beta, oppSide, width);
  }
  if (depth === 0) return _otEvalBoard(board);
  const maximizing = side === 'ai';
  let best = maximizing ? -Infinity : Infinity;
  for (const mv of moves) {
    _otSearchMakeMove(board, mv, side);
    const val = _otMinimax(board, depth - 1, alpha, beta, oppSide, width);
    _otSearchUndoMove(board, mv, side);
    if (maximizing) { if (val > best) best = val; alpha = Math.max(alpha, val); }
    else { if (val < best) best = val; beta = Math.min(beta, val); }
    if (beta <= alpha) break;
  }
  return best;
}
function _otComputeAiMove() {
  const st = window._otState;
  const board = st.board;
  const diff = _OT_DIFFS[st.difficulty] || _OT_DIFFS.normal;
  const legal = _otLegalMoves(board, 'ai');
  if (!legal.length) return null;

  if (diff.depth <= 0) {
    const scored = legal.map(m => {
      const isCorner = (m.r === 0 || m.r === 7) && (m.c === 0 || m.c === 7);
      const isXSquare = (m.r === 1 || m.r === 6) && (m.c === 1 || m.c === 6);
      let s = m.flips.length + Math.random() * 4;
      if (isCorner) s += 30; else if (isXSquare) s -= 15;
      return { m, s };
    });
    scored.sort((a, b) => b.s - a.s);
    const poolSize = Math.max(1, Math.min(diff.randomTop, scored.length));
    return scored[Math.floor(Math.random() * poolSize)].m;
  }

  const ordered = _otOrderedMoves(board, 'ai', diff.width);
  let bestScore = -Infinity, bestMoves = [];
  let alpha = -Infinity, beta = Infinity;
  for (const mv of ordered) {
    _otSearchMakeMove(board, mv, 'ai');
    const val = _otMinimax(board, diff.depth - 1, alpha, beta, 'me', diff.width);
    _otSearchUndoMove(board, mv, 'ai');
    if (val > bestScore) { bestScore = val; bestMoves = [mv]; }
    else if (val === bestScore) bestMoves.push(mv);
    alpha = Math.max(alpha, val);
  }
  const poolSize = Math.max(1, Math.min(diff.randomTop, bestMoves.length));
  return bestMoves[Math.floor(Math.random() * poolSize)];
}

// ─── 실제 진행(사진/색상 반영) ────────────────────────────────────────────────
function _otPlaceMove(r, c, side, flips) {
  const st = window._otState;
  const team = side === 'me' ? st.myTeam : st.aiTeam;
  const picked = _otDrawFromBag(side);
  st.board[r][c] = { side, univ: team.univ, color: team.color, name: picked.name, photo: picked.photo };
  flips.forEach(([fr, fc]) => {
    const cell = st.board[fr][fc];
    cell.side = side; cell.univ = team.univ; cell.color = team.color;
  });
  st.lastMove = { r, c };
  st.flippedNow = flips.slice();
  st.newNow = { r, c };
  _otMoveSound(flips.length);
  _otRecountDisks();
}
function _otRecountDisks() {
  const st = window._otState;
  let me = 0, ai = 0;
  for (let r = 0; r < _OT_SIZE; r++) for (let c = 0; c < _OT_SIZE; c++) {
    const cell = st.board[r][c];
    if (!cell) continue;
    if (cell.side === 'me') me++; else ai++;
  }
  st.meCount = me; st.aiCount = ai;
}
function _otEndGame() {
  const st = window._otState;
  _otRecountDisks();
  const stats = _otReadStats();
  if (st.meCount > st.aiCount) { st.winner = 'me'; stats.win++; _otWinSound(); }
  else if (st.aiCount > st.meCount) { st.winner = 'ai'; stats.lose++; _otLoseSound(); }
  else { st.winner = 'draw'; stats.draw++; }
  _otSaveStats(stats);
  return true;
}
// moverSide가 방금 두었을 때 다음 턴을 결정 (자동 패스/종료 판정 포함)
function _otFinishTurn(moverSide) {
  const st = window._otState;
  const oppSide = moverSide === 'me' ? 'ai' : 'me';
  if (_otHasAnyMove(st.board, oppSide)) {
    st.turn = oppSide;
    st.passNotice = null;
    return false;
  }
  if (_otHasAnyMove(st.board, moverSide)) {
    st.turn = moverSide;
    st.passNotice = oppSide; // 상대가 둘 곳이 없어 패스됨
    return false;
  }
  return _otEndGame();
}

function _otCellClick(r, c) {
  const st = window._otState;
  if (!st.running || st.winner || st.turn !== 'me' || st.thinking) return;
  const flips = _otFlipsForMove(st.board, r, c, 'me');
  if (!flips) return;
  _otPlaceMove(r, c, 'me', flips);
  const ended = _otFinishTurn('me');
  _otRenderRoot();
  if (!ended && st.turn === 'ai') {
    st.thinking = true;
    _otRenderRoot();
    setTimeout(_otAiTurn, 550);
  }
}
window._otCellClick = _otCellClick;

function _otAiTurn() {
  const st = window._otState;
  if (!st.running || st.winner) { st.thinking = false; return; }
  const mv = _otComputeAiMove();
  st.thinking = false;
  if (!mv) { _otRenderRoot(); return; }
  _otPlaceMove(mv.r, mv.c, 'ai', mv.flips);
  const ended = _otFinishTurn('ai');
  _otRenderRoot();
  if (!ended && st.turn === 'ai') {
    // 내가 둘 곳이 없어 패스됨 → AI가 연속으로 둠
    st.thinking = true;
    _otRenderRoot();
    setTimeout(_otAiTurn, 550);
  }
}

function _otSelectTeam(kind, univ) {
  const st = window._otState;
  const other = kind === 'my' ? 'aiUniv' : 'myUniv';
  const mine = kind === 'my' ? 'myUniv' : 'aiUniv';
  if (st[other] === univ) st[other] = st[mine];
  st[mine] = univ;
  _rLsSet(kind === 'my' ? 'su_ot_my' : 'su_ot_ai', univ);
  _otRenderRoot();
}
window._otSelectTeam = _otSelectTeam;

function _otSetDifficulty(key) {
  if (!_OT_DIFFS[key]) return;
  window._otState.difficulty = key;
  _rLsSet('su_ot_diff', key);
  _otRenderRoot();
}
window._otSetDifficulty = _otSetDifficulty;

function _otPreloadTeamPhotos(team) {
  try {
    (team.players || []).forEach(p => {
      if (!p.photo) return;
      const im = new Image();
      im.src = _otThumbUrl(p.photo);
    });
  } catch (e) {}
}

function _otStartGame() {
  const st = window._otState;
  const pool = _otEnsurePool();
  const myTeam = pool.find(t => t.univ === st.myUniv);
  const aiTeam = pool.find(t => t.univ === st.aiUniv);
  if (!myTeam || !aiTeam || myTeam.univ === aiTeam.univ) return;
  st.myTeam = myTeam; st.aiTeam = aiTeam;
  st.bags = { me: [], ai: [] };
  const board = Array.from({ length: _OT_SIZE }, () => Array(_OT_SIZE).fill(null));
  st.board = board;
  st.turn = 'me';
  st.winner = null;
  st.lastMove = null;
  st.flippedNow = [];
  st.newNow = null;
  st.thinking = false;
  st.passNotice = null;
  st.running = true;
  // 초기 4개 배치 (표준 오델로 시작 위치): 검정(나)이 먼저 둠
  const aiPick1 = _otDrawFromBag('ai'), aiPick2 = _otDrawFromBag('ai');
  const mePick1 = _otDrawFromBag('me'), mePick2 = _otDrawFromBag('me');
  board[3][3] = { side: 'ai', univ: aiTeam.univ, color: aiTeam.color, name: aiPick1.name, photo: aiPick1.photo };
  board[4][4] = { side: 'ai', univ: aiTeam.univ, color: aiTeam.color, name: aiPick2.name, photo: aiPick2.photo };
  board[3][4] = { side: 'me', univ: myTeam.univ, color: myTeam.color, name: mePick1.name, photo: mePick1.photo };
  board[4][3] = { side: 'me', univ: myTeam.univ, color: myTeam.color, name: mePick2.name, photo: mePick2.photo };
  _otRecountDisks();
  _otPreloadTeamPhotos(myTeam);
  _otPreloadTeamPhotos(aiTeam);
  _otRenderRoot();
}
window._otStartGame = _otStartGame;

function _otBackToSetup() {
  window._otState.running = false;
  _otRenderRoot();
}
window._otBackToSetup = _otBackToSetup;

function _otCleanup() {
  window._otState.thinking = false;
}
window._otCleanup = _otCleanup;

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function _otMiniAvatarsHTML(team) {
  const sample = (team.players || []).slice(0, 3);
  if (!sample.length) return `<div class="ot-chip-avatars"><div class="ot-mini-fallback" style="background:${team.color}">?</div></div>`;
  return `<div class="ot-chip-avatars">${sample.map(p => {
    const initial = _otEsc(String(p.name || '?').trim().slice(0, 1));
    return p.photo
      ? `<img src="${_otEsc(_otThumbUrl(p.photo))}" alt="${_otEsc(p.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'ot-mini-fallback\\' style=\\'background:${team.color}\\'>${initial}</div>'">`
      : `<div class="ot-mini-fallback" style="background:${team.color}">${initial}</div>`;
  }).join('')}</div>`;
}
function _otTeamChipHTML(team, kind, selected) {
  const on = selected === team.univ;
  return `<button type="button" class="ot-chip${on ? ' on' : ''}" style="--ot-chip-color:${team.color}" onclick="_otSelectTeam('${kind}','${_otEsc(team.univ).replace(/'/g, "\\'")}')">
    ${_otMiniAvatarsHTML(team)}
    <div class="ot-chip-meta">
      <span class="ot-chip-name">${_otEsc(team.univ)}</span>
      <span class="ot-chip-count">${team.players.length}명</span>
    </div>
  </button>`;
}
function _otDiffBarHTML() {
  const st = window._otState;
  return Object.values(_OT_DIFFS).map(d =>
    `<button type="button" class="ot-diff-pill${st.difficulty === d.key ? ' on' : ''}" onclick="_otSetDifficulty('${d.key}')">${d.emoji} ${d.label}</button>`
  ).join('');
}
function _otSetupHTML() {
  const st = window._otState;
  const pool = _otEnsurePool();
  const stats = _otReadStats();

  if (pool.length < 2) {
    return `<div class="ot-shell">
      <div class="ot-card">
        <div class="ot-head-row">
          <div class="ot-head-left">
            <div class="ot-icon-badge">🟢</div>
            <div class="ot-title-group">
              <div class="ot-title">스타대학 오델로</div>
              <div class="ot-desc">응원할 대학(소속)과 상대 대학을 골라 AI와 오델로 대결을 펼치는 게임입니다.</div>
            </div>
          </div>
        </div>
        <div class="ot-empty-note">⚠️ 게임을 만들 만큼 소속(대학)과 선수 프로필이 등록되지 않았습니다. 선수 데이터에 소속/사진을 더 등록한 뒤 다시 시도해주세요.</div>
      </div>
    </div>`;
  }

  const myUniv = pool.find(t => t.univ === st.myUniv) ? st.myUniv : null;
  const aiUniv = pool.find(t => t.univ === st.aiUniv) ? st.aiUniv : null;
  const canStart = myUniv && aiUniv && myUniv !== aiUniv;

  return `<div class="ot-shell">
    <div class="ot-card">
      <div class="ot-head-row">
        <div class="ot-head-left">
          <div class="ot-icon-badge">🟢</div>
          <div class="ot-title-group">
            <div class="ot-title">스타대학 오델로</div>
            <div class="ot-desc">내가 응원할 대학과 맞붙을 상대 대학을 고르면, 각 대학 소속 스트리머 사진이 돌이 되어 대결합니다. 상대 돌을 양 끝에서 감싸면 뒤집을 수 있고, 게임이 끝났을 때 돌이 더 많은 쪽이 승리! (둘 곳이 없으면 자동으로 패스됩니다)</div>
          </div>
        </div>
      </div>

      <div class="ot-stats-row">
        <div class="ot-stat-chip"><b>${stats.win}</b><span>승</span></div>
        <div class="ot-stat-chip"><b>${stats.lose}</b><span>패</span></div>
        <div class="ot-stat-chip"><b>${stats.draw}</b><span>무</span></div>
      </div>

      <div class="ot-section-label">🟢 내가 응원할 대학 (검정 · 선공)</div>
      <div class="ot-chip-bar">${pool.map(t => _otTeamChipHTML(t, 'my', myUniv)).join('')}</div>

      <div class="ot-section-label">⚪ 상대 대학 (AI · 하양 · 후공)</div>
      <div class="ot-chip-bar">${pool.map(t => _otTeamChipHTML(t, 'ai', aiUniv)).join('')}</div>

      <div class="ot-section-label">난이도</div>
      <div class="ot-chip-bar">${_otDiffBarHTML()}</div>

      <div class="ot-actions">
        <button class="ot-btn ot-btn-primary" ${canStart ? '' : 'disabled'} onclick="_otStartGame()">⚔️ 대결 시작</button>
      </div>
      ${!canStart ? `<div class="ot-status is-info">서로 다른 대학 두 곳을 선택하면 대결을 시작할 수 있어요.</div>` : ''}
    </div>
  </div>`;
}

function _otPieceHTML(cell, r, c) {
  const initial = _otEsc(String(cell.name || '?').trim().slice(0, 1));
  const st = window._otState;
  const isLast = st.lastMove && st.lastMove.r === r && st.lastMove.c === c;
  const isNew = st.newNow && st.newNow.r === r && st.newNow.c === c;
  const isFlipped = !isNew && (st.flippedNow || []).some(([fr, fc]) => fr === r && fc === c);
  const cls = `ot-piece${isNew ? ' ot-new' : ''}${isFlipped ? ' ot-flip' : ''}${isLast ? ' ot-last' : ''}`;
  const img = cell.photo
    ? `<img src="${_otEsc(_otThumbUrl(cell.photo))}" alt="${_otEsc(cell.name)}" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="ot-piece-fallback" style="display:none;background:${cell.color}">${initial}</div>`
    : `<div class="ot-piece-fallback" style="background:${cell.color}">${initial}</div>`;
  return `<div class="${cls}" style="--ot-ring:${cell.color}">
    <div class="ot-piece-inner">
      <div class="ot-piece-photo">${img}</div>
    </div>
  </div>`;
}
function _otCellHTML(r, c, legalSet) {
  const st = window._otState;
  const cell = st.board[r][c];
  const isLegal = !cell && legalSet.has(r + '_' + c);
  const classes = ['ot-cell'];
  if (isLegal) classes.push('ot-legal');
  const inner = cell ? _otPieceHTML(cell, r, c) : '';
  return `<div class="${classes.join(' ')}" onclick="_otCellClick(${r},${c})">${inner}</div>`;
}
function _otBoardHTML() {
  const st = window._otState;
  const legal = (!st.winner && st.turn === 'me') ? _otLegalMoves(st.board, 'me') : [];
  const legalSet = new Set(legal.map(m => m.r + '_' + m.c));
  let html = '';
  for (let r = 0; r < _OT_SIZE; r++) for (let c = 0; c < _OT_SIZE; c++) html += _otCellHTML(r, c, legalSet);
  return html;
}

function _otGameHTML() {
  const st = window._otState;
  const my = st.myTeam, ai = st.aiTeam;
  const boardHTML = _otBoardHTML();

  let statusHTML;
  if (st.winner === 'me') statusHTML = `<div class="ot-status is-good">🏆 ${_otEsc(my.univ)}(나)이(가) ${st.meCount}:${st.aiCount}로 승리했습니다!</div>`;
  else if (st.winner === 'ai') statusHTML = `<div class="ot-status is-bad">😥 ${_otEsc(ai.univ)}(AI)이(가) ${st.aiCount}:${st.meCount}로 이겼습니다.</div>`;
  else if (st.winner === 'draw') statusHTML = `<div class="ot-status is-info">🤝 ${st.meCount}:${st.aiCount} 동점입니다. 무승부!</div>`;
  else if (st.thinking) statusHTML = `<div class="ot-status is-think">🤖 ${_otEsc(ai.univ)}(AI)이(가) 수를 고민하는 중...</div>`;
  else if (st.passNotice === 'ai') statusHTML = `<div class="ot-status is-pass">⏭️ ${_otEsc(ai.univ)}(AI)이(가) 둘 곳이 없어 패스했습니다. 이어서 두세요!</div>`;
  else if (st.passNotice === 'me') statusHTML = `<div class="ot-status is-pass">⏭️ 둘 곳이 없어 자동으로 패스되었습니다. AI가 이어서 둡니다.</div>`;
  else if (st.turn === 'me') statusHTML = `<div class="ot-status is-info">🟢 내 차례입니다. 빛나는 칸을 눌러 돌을 놓으세요.</div>`;
  else statusHTML = `<div class="ot-status is-info">⚪ 상대 차례를 기다리는 중...</div>`;

  const resultHTML = st.winner ? `<div class="ot-result">
    <span class="ot-result-emoji">${st.winner === 'me' ? '🏆' : st.winner === 'ai' ? '😥' : '🤝'}</span>
    <div class="ot-result-title">${st.winner === 'me' ? `${_otEsc(my.univ)} 승리!` : st.winner === 'ai' ? `${_otEsc(ai.univ)} 승리` : '무승부'}</div>
    <div class="ot-result-sub">${_otEsc(my.univ)} ${st.meCount} : ${st.aiCount} ${_otEsc(ai.univ)} · ${_OT_DIFFS[st.difficulty].label} 난이도</div>
  </div>` : '';

  return `<div class="ot-shell">
    <div class="ot-card">
      <div class="ot-head-row">
        <div class="ot-head-left">
          <div class="ot-icon-badge">🟢</div>
          <div class="ot-title-group">
            <div class="ot-title">스타대학 오델로</div>
            <div class="ot-desc">상대 돌을 양 끝에서 감싸면 뒤집습니다. 둘 곳이 없으면 자동으로 패스되고, 더 이상 둘 곳이 없으면 돌이 많은 쪽이 승리합니다.</div>
          </div>
        </div>
        <button class="ot-btn" onclick="_otBackToSetup()">🔁 팀 다시 선택</button>
      </div>

      <div class="ot-vs-row">
        <div class="ot-side-card${st.turn === 'me' && !st.winner ? ' is-turn' : ''}${st.winner === 'me' ? ' is-win' : ''}" style="--ot-side-color:${my.color}">
          <div class="ot-side-swatch" style="background:${my.color}">🟢</div>
          <div class="ot-side-meta">
            <div class="ot-side-role">나 (검정 · 선공)</div>
            <div class="ot-side-name">${_otEsc(my.univ)}</div>
          </div>
          <div class="ot-side-count">${st.meCount}</div>
        </div>
        <div class="ot-vs-mid">VS</div>
        <div class="ot-side-card${st.turn === 'ai' && !st.winner ? ' is-turn' : ''}${st.winner === 'ai' ? ' is-win' : ''}" style="--ot-side-color:${ai.color}">
          <div class="ot-side-swatch" style="background:${ai.color}">⚪</div>
          <div class="ot-side-meta">
            <div class="ot-side-role">AI (하양 · 후공)</div>
            <div class="ot-side-name">${_otEsc(ai.univ)}</div>
          </div>
          <div class="ot-side-count">${st.aiCount}</div>
        </div>
      </div>

      ${statusHTML}
      ${resultHTML}

      <div class="ot-board-wrap">
        <div class="ot-board ot-turn-${st.turn}">${boardHTML}</div>
      </div>

      <div class="ot-actions">
        <button class="ot-btn ot-btn-primary" onclick="_otStartGame()">${st.winner ? '🔄 같은 팀으로 다시하기' : '🔄 새로 시작'}</button>
        <button class="ot-btn" onclick="_otBackToSetup()">🔁 팀 다시 선택</button>
      </div>
    </div>
  </div>`;
}

function _otRenderRoot() {
  const root = document.getElementById('ot-root');
  if (!root) return;
  const st = window._otState;
  root.innerHTML = st.running ? _otGameHTML() : _otSetupHTML();
}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _otInit() {
  const st = window._otState;
  _otEnsurePool();
  if (!st.myUniv || !st.aiUniv) {
    const pool = st.pool || [];
    const savedMy = _rLsGet('su_ot_my', '');
    const savedAi = _rLsGet('su_ot_ai', '');
    if (pool.find(t => t.univ === savedMy)) st.myUniv = savedMy;
    if (pool.find(t => t.univ === savedAi)) st.aiUniv = savedAi;
    if (!st.myUniv && pool[0]) st.myUniv = pool[0].univ;
    if (!st.aiUniv && pool[1]) st.aiUniv = pool[1].univ;
    if (st.myUniv && st.myUniv === st.aiUniv && pool[1]) st.aiUniv = pool[1].univ;
  }
  _otRenderRoot();
}
window._otInit = _otInit;
