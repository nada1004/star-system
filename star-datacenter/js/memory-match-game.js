/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('memory') 진입 시 동적으로 로드됨. */
// ─── 🃏 짝맞추기 게임 (같은 선수 사진 두 장을 찾는 메모리 게임) ──────────────────
// 규칙: 카드를 두 장씩 뒤집어서 같은 선수 사진이면 매칭 성공(제거X, 고정 오픈).
//       모두 맞히면 클리어, 시간 안에 다 못 맞히면 타임아웃으로 종료.

(function _mmInjectCSS() {
  if (document.getElementById('mm-style')) return;
  const s = document.createElement('style');
  s.id = 'mm-style';
  s.textContent = [
    '#mm-root{font-family:inherit;width:100%}',
    '.mm-shell{display:flex;flex-direction:column;gap:14px}',
    '.mm-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:24px;box-shadow:0 18px 38px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.9);padding:18px 20px}',
    '.mm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
    '.mm-title{font-size:16px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}',
    '.mm-desc{margin-top:5px;font-size:12px;line-height:1.6;color:var(--text3)}',
    '.mm-hud{display:flex;gap:8px;flex-wrap:wrap}',
    '.mm-hud-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.18);font-size:12px;font-weight:900;color:var(--text2);box-shadow:0 8px 16px rgba(15,23,42,.05);white-space:nowrap}',
    '.mm-hud-chip.is-time-low{background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#fca5a5;color:#b91c1c;animation:mmPulse 1s ease-in-out infinite}',
    '.mm-hud-chip.is-combo{background:linear-gradient(135deg,#fef9c3,#fde68a);border-color:#fcd34d;color:#92400e}',
    '@keyframes mmPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}',
    '.mm-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
    '.mm-btn{padding:10px 18px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.05);font-family:inherit;transition:.12s}',
    '.mm-btn:hover{border-color:rgba(37,99,235,.25);color:#2563eb}',
    '.mm-btn.mm-btn-primary{background:linear-gradient(135deg,#34d399,#10b981 52%,#059669);color:#fff;border:none;box-shadow:0 7px 0 #065f46,0 16px 26px rgba(16,185,129,.22)}',
    '.mm-btn.mm-btn-primary:hover{color:#fff;transform:translateY(-1px)}',
    '.mm-diff-bar{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}',
    '.mm-diff-pill{padding:7px 12px;border-radius:999px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;transition:.12s;white-space:nowrap}',
    '.mm-diff-pill:hover{border-color:rgba(37,99,235,.3);color:#2563eb}',
    '.mm-diff-pill.on{background:linear-gradient(135deg,#34d399,#10b981);color:#fff;border-color:transparent;box-shadow:0 6px 14px rgba(16,185,129,.28)}',
    'body.dark .mm-diff-pill{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .mm-diff-pill.on{color:#fff}',
    '.mm-stage{margin-top:14px}',
    '.mm-tool-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:12px 0 0}',
    '.mm-tool-btn{padding:9px 14px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:12px;font-weight:900;cursor:pointer;font-family:inherit;transition:.12s}',
    '.mm-tool-btn:hover{border-color:rgba(37,99,235,.3);color:#2563eb}',
    '.mm-tool-btn:disabled{opacity:.45;cursor:default}',
    '.mm-grid{display:grid;grid-template-columns:repeat(var(--mm-cols,4),1fr);gap:8px;max-width:calc(var(--mm-cols,4) * 92px + (var(--mm-cols,4) - 1) * 8px);margin:0 auto}',
    '.mm-grid.is-preview .mm-cell{cursor:default}',
    '.mm-cell{position:relative;aspect-ratio:1/1;border-radius:16px;cursor:pointer;perspective:600px}',
    '.mm-cell.mm-empty{cursor:default;visibility:hidden}',
    '.mm-cell-inner{position:relative;width:100%;height:100%;transition:transform .32s cubic-bezier(.4,.2,.2,1);transform-style:preserve-3d}',
    '.mm-cell.is-open .mm-cell-inner,.mm-cell.is-matched .mm-cell-inner{transform:rotateY(180deg)}',
    '.mm-face{position:absolute;inset:0;border-radius:16px;overflow:hidden;backface-visibility:hidden;box-shadow:0 2px 0 rgba(15,23,42,.10),0 5px 10px rgba(15,23,42,.10),inset 0 0 0 3px rgba(255,255,255,.85)}',
    '.mm-face-back{background:linear-gradient(135deg,#60a5fa,#6366f1);display:flex;align-items:center;justify-content:center;font-size:20px}',
    '.mm-face-front{transform:rotateY(180deg);background:#f1f5f9}',
    '.mm-face-front img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}',
    '.mm-face-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;background:linear-gradient(135deg,#60a5fa,#6366f1)}',
    '.mm-cell.is-matched .mm-face-front{box-shadow:0 2px 0 rgba(15,23,42,.10),0 5px 10px rgba(15,23,42,.10),inset 0 0 0 3px #4ade80}',
    '.mm-cell.is-matched{cursor:default}',
    '.mm-cell.is-wrong .mm-cell-inner{animation:mmShake .32s ease}',
    '.mm-name-tag{position:absolute;left:0;right:0;bottom:0;padding:3px 4px;font-size:9px;font-weight:800;color:#fff;text-align:center;background:linear-gradient(0deg,rgba(0,0,0,.55),transparent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '@keyframes mmShake{0%,100%{transform:rotateY(180deg) translateX(0)}25%{transform:rotateY(180deg) translateX(-4px)}75%{transform:rotateY(180deg) translateX(4px)}}',
    '.mm-result{background:linear-gradient(135deg,#ECFDF5,#F7FEFB);border:1px solid rgba(52,211,153,.28);border-radius:22px;padding:22px 20px;text-align:center;margin-top:14px;animation:mmPopIn .4s cubic-bezier(.175,.885,.32,1.35)}',
    '.mm-result-emoji{font-size:44px;display:block;margin-bottom:4px}',
    '.mm-result-score{font-size:clamp(24px,5vw,34px);font-weight:900;color:#047857;margin:4px 0 4px}',
    '.mm-result-sub{font-size:12px;color:var(--text3)}',
    '@keyframes mmPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}',
    '.mm-empty-note{font-size:12px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 12px;margin-top:10px;line-height:1.6}',
    '.mm-status{margin-top:12px;padding:10px 12px;border-radius:12px;font-size:12px;font-weight:800;line-height:1.55}',
    '.mm-status.is-info{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}',
    '.mm-status.is-good{background:#ecfdf5;border:1px solid #86efac;color:#047857}',
    '.mm-status.is-bad{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c}',
    'body.dark .mm-card,body.dark .mm-result{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}',
    'body.dark .mm-hud-chip,body.dark .mm-btn{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .mm-title{color:#f8fafc}',
    'body.dark .mm-desc{color:#94a3b8}',
    'body.dark .mm-face{box-shadow:0 2px 0 rgba(0,0,0,.3),0 5px 10px rgba(0,0,0,.3),inset 0 0 0 3px rgba(15,23,42,.55)}',
    '@media (max-width:520px){.mm-card{padding:14px 14px}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 사운드 ────────────────────────────────────────────────────────────────────
let _mmAC = null;
function _mmPlayMatch(combo) {
  try {
    if (!_mmAC) _mmAC = new (window.AudioContext || window.webkitAudioContext)();
    const notes = combo >= 6 ? [523, 659, 784, 1047] : combo >= 3 ? [523, 659, 784] : [659, 880];
    notes.forEach((f, i) => {
      setTimeout(() => {
        const o = _mmAC.createOscillator(), g = _mmAC.createGain();
        o.connect(g); g.connect(_mmAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.14, _mmAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _mmAC.currentTime + 0.2);
        o.start(); o.stop(_mmAC.currentTime + 0.2);
      }, i * 60);
    });
  } catch (e) {}
}
function _mmPlayWrong() {
  try {
    if (!_mmAC) _mmAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _mmAC.createOscillator(), g = _mmAC.createGain();
    o.connect(g); g.connect(_mmAC.destination);
    o.frequency.value = 150; o.type = 'sawtooth';
    g.gain.setValueAtTime(0.09, _mmAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _mmAC.currentTime + 0.2);
    o.start(); o.stop(_mmAC.currentTime + 0.2);
  } catch (e) {}
}
function _mmPlayFlip() {
  try {
    if (!_mmAC) _mmAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _mmAC.createOscillator(), g = _mmAC.createGain();
    o.connect(g); g.connect(_mmAC.destination);
    o.frequency.value = 380; o.type = 'sine';
    g.gain.setValueAtTime(0.06, _mmAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _mmAC.currentTime + 0.09);
    o.start(); o.stop(_mmAC.currentTime + 0.09);
  } catch (e) {}
}

// ─── 상태 ────────────────────────────────────────────────────────────────────
const _MM_TIME_LIMIT = 90; // 초 — 모든 난이도 공통
const _MM_PREVIEW_MS = 1000; // 미리보기 시간(ms) — 모든 난이도 공통, 1초 고정
const _MM_MISMATCH_DELAY = 750; // 오답 시 다시 뒤집기까지 대기(ms)
const _MM_MATCH_DELAY = 260; // 정답 확정까지 대기(ms) — 두 장 다 보여준 뒤 확정
const _MM_HINT_TIME_PENALTY = 3; // 힌트 사용 시 차감 시간
// ─── 난이도 설정 ──────────────────────────────────────────────────────────────
// 시간/미리보기는 모든 난이도 공통(위 상수 사용), 난이도는 정사각형 그리드 크기(N x N)로만 구분.
// N이 홀수면 칸 하나가 남으므로 빈 장식 칸(mm-empty)으로 채워서 항상 정사각형 모양을 유지함.
const _MM_DIFFICULTIES = {
  beginner: { key: 'beginner', label: '초급',   emoji: '🌱', grid: 4 },
  normal:   { key: 'normal',   label: '중급',   emoji: '⚔️', grid: 5 },
  hard:     { key: 'hard',     label: '고수',   emoji: '🔥', grid: 6 },
  extreme:  { key: 'extreme',  label: '초고수', emoji: '💀', grid: 7 },
  god:      { key: 'god',      label: '신',     emoji: '👑', grid: 8 },
};
const _MM_DIFF_ORDER = ['beginner', 'normal', 'hard', 'extreme', 'god'];

function _mmReadStoredDifficulty() {
  try {
    const v = localStorage.getItem('su_mm_diff');
    if (v && _MM_DIFFICULTIES[v]) return v;
  } catch (e) {}
  return 'normal';
}

window._mmState = window._mmState || {
  difficulty: _mmReadStoredDifficulty(),
  cols: 4, pairs: 0, cards: null,
  score: 0, combo: 0, moves: 0, matched: 0,
  timeLeft: _MM_TIME_LIMIT, running: false, ended: false, endReason: '',
  timerId: null, resolveId: null, previewId: null,
  previewing: false, hintsLeft: 2,
  firstIdx: null, secondIdx: null, locked: false,
  statusText: '초반 1초 미리보기 때 위치를 기억하고, 막히면 힌트를 아껴 쓰세요.',
  statusTone: 'info',
};

function _mmSetDifficulty(key) {
  if (!_MM_DIFFICULTIES[key]) return;
  const st = window._mmState;
  st.difficulty = key;
  try { localStorage.setItem('su_mm_diff', key); } catch (e) {}
  _mmStart();
}
window._mmSetDifficulty = _mmSetDifficulty;

function _mmBestScore(diffKey) {
  const key = diffKey || window._mmState.difficulty || 'normal';
  try { return parseInt(localStorage.getItem('su_mm_best_' + key) || '0', 10) || 0; } catch (e) { return 0; }
}
function _mmSaveBest(v, diffKey) {
  const key = diffKey || window._mmState.difficulty || 'normal';
  try { localStorage.setItem('su_mm_best_' + key, String(v)); } catch (e) {}
}

// ─── 선수 풀 구성 ─────────────────────────────────────────────────────────────
function _mmBuildPool() {
  const players = Array.isArray(window.players) ? window.players : [];
  const seen = new Set();
  const pool = [];
  players.forEach(p => {
    if (!p || p.hidden || p.retired || p.hideFromBoard) return;
    if (String(p.univ || '').trim() === 'YB') return;
    const name = String(p.name || '').trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    pool.push({ name, photo: p.photo });
  });
  return pool;
}

function _mmEsc(s) {
  return (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s);
}
function _mmUrl(u) {
  return (typeof toHttpsUrl === 'function') ? toHttpsUrl(u) : u;
}

function _mmShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function _mmCols(diff) {
  const d = diff || _MM_DIFFICULTIES[window._mmState.difficulty] || _MM_DIFFICULTIES.normal;
  return d.grid;
}

function _mmHintsForDifficulty(key) {
  if (key === 'beginner') return 3;
  if (key === 'normal' || key === 'hard') return 2;
  return 1;
}

// ─── 보드 초기화 ──────────────────────────────────────────────────────────────
function _mmNewBoard() {
  const st = window._mmState;
  const fullPool = _mmBuildPool();
  const diff = _MM_DIFFICULTIES[st.difficulty] || _MM_DIFFICULTIES.normal;
  const n = diff.grid;
  st.cols = n;
  const totalCells = n * n;
  const desiredPairs = Math.floor(totalCells / 2);
  const pairs = Math.min(desiredPairs, fullPool.length);
  st.score = 0;
  st.combo = 0;
  st.moves = 0;
  st.matched = 0;
  st.timeLeft = _MM_TIME_LIMIT;
  st.hintsLeft = _mmHintsForDifficulty(st.difficulty);
  st.running = false;
  st.ended = false;
  st.endReason = '';
  st.firstIdx = null;
  st.secondIdx = null;
  st.locked = false;
  st._clearBonus = 0;
  st.statusText = '같은 카드 위치를 기억하고, 연속 성공으로 콤보 점수를 노려보세요.';
  st.statusTone = 'info';
  if (pairs < 3) { st.cards = null; st.pairs = 0; return; }
  st.pairs = pairs;
  const chosen = _mmShuffle(fullPool.slice()).slice(0, pairs);
  let cards = [];
  chosen.forEach((p, i) => {
    cards.push({ uid: i + '-a', pairId: i, name: p.name, photo: p.photo, state: 'hidden' });
    cards.push({ uid: i + '-b', pairId: i, name: p.name, photo: p.photo, state: 'hidden' });
  });
  cards = _mmShuffle(cards);
  // 정사각형 모양 유지를 위해 남는 칸은 클릭 불가능한 빈 장식 칸으로 채움
  // (풀에 선수가 부족하거나 grid가 홀수일 때 발생)
  while (cards.length < totalCells) cards.push({ uid: 'empty-' + cards.length, pairId: null, empty: true, state: 'hidden' });
  st.cards = cards;
}

// ─── 게임 진행 ────────────────────────────────────────────────────────────────
function _mmStart() {
  const st = window._mmState;
  if (st.resolveId) { clearTimeout(st.resolveId); st.resolveId = null; }
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.previewId) { clearTimeout(st.previewId); st.previewId = null; }
  _mmNewBoard();
  if (!st.cards) { _mmRenderRoot(); return; }

  // 👀 미리보기: 시작 직후 잠깐 전체 오픈했다가 뒤집고 게임 시작 (모든 난이도 공통 1초)
  st.cards.forEach(c => { c.state = 'preview'; });
  st.running = false;
  st.previewing = true;
  st.statusText = '전체 카드가 잠깐 공개됩니다. 빠르게 위치를 외워두세요!';
  st.statusTone = 'info';
  _mmRenderRoot();
  st.previewId = setTimeout(() => {
    st.previewId = null;
    st.cards.forEach(c => { if (c.state === 'preview') c.state = 'hidden'; });
    st.previewing = false;
    st.running = true;
    st.statusText = '시작! 연속으로 맞히면 콤보 보너스가 붙습니다.';
    st.statusTone = 'info';
    _mmRenderRoot();
    st.timerId = setInterval(_mmTick, 1000);
  }, _MM_PREVIEW_MS);
}

function _mmTick() {
  const st = window._mmState;
  if (!st.running) return;
  st.timeLeft--;
  const chip = document.getElementById('mm-time-chip');
  if (chip) {
    chip.textContent = `⏱️ 남은 시간 ${st.timeLeft}초`;
    chip.classList.toggle('is-time-low', st.timeLeft <= 15);
  }
  if (st.timeLeft <= 0) _mmEndGame('timeup');
}

function _mmEndGame(reason) {
  const st = window._mmState;
  st.running = false;
  st.ended = true;
  st.endReason = reason;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.resolveId) { clearTimeout(st.resolveId); st.resolveId = null; }
  if (reason === 'clear') {
    st._clearBonus = st.timeLeft * 2;
    st.score += st._clearBonus;
  }
  if (st.score > _mmBestScore()) _mmSaveBest(st.score);
  _mmRenderRoot();
}

function _mmCleanup() {
  const st = window._mmState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.resolveId) { clearTimeout(st.resolveId); st.resolveId = null; }
  if (st.previewId) { clearTimeout(st.previewId); st.previewId = null; }
  if (st.previewing && st.cards) {
    st.cards.forEach(c => { if (c.state === 'preview') c.state = 'hidden'; });
  }
  st.running = false;
  st.previewing = false;
}
window._mmCleanup = _mmCleanup;

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function _mmCardFaceHTML(c) {
  const initial = _mmEsc(String(c.name || '?').trim().slice(0, 1));
  const front = c.photo
    ? `<img src="${_mmEsc(_mmUrl(c.photo))}" alt="${_mmEsc(c.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="mm-face-fallback" style="display:none">${initial}</div>`
    : `<div class="mm-face-fallback">${initial}</div>`;
  return `<div class="mm-cell-inner">
    <div class="mm-face mm-face-back">🃏</div>
    <div class="mm-face mm-face-front">${front}<div class="mm-name-tag">${_mmEsc(c.name)}</div></div>
  </div>`;
}

function _mmUseHint() {
  const st = window._mmState;
  if (!st.running || st.locked || st.previewing || !st.cards || st.hintsLeft <= 0) return;
  const hidden = st.cards
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c && !c.empty && c.state === 'hidden');
  if (hidden.length < 2) return;
  const bucket = new Map();
  hidden.forEach(({ c, i }) => {
    if (!bucket.has(c.pairId)) bucket.set(c.pairId, []);
    bucket.get(c.pairId).push(i);
  });
  const candidatePairs = [...bucket.values()].filter(list => list.length >= 2);
  if (!candidatePairs.length) return;
  const revealPair = candidatePairs[Math.floor(Math.random() * candidatePairs.length)].slice(0, 2);
  revealPair.forEach(i => { st.cards[i].state = 'preview'; });
  st.hintsLeft--;
  st.timeLeft = Math.max(0, st.timeLeft - _MM_HINT_TIME_PENALTY);
  st.locked = true;
  st.statusText = `힌트 사용: 짝 하나를 잠깐 공개했습니다. 시간 ${_MM_HINT_TIME_PENALTY}초 차감`;
  st.statusTone = 'info';
  _mmRenderRoot();
  if (st.timeLeft <= 0) {
    _mmEndGame('timeup');
    return;
  }
  st.resolveId = setTimeout(() => {
    st.resolveId = null;
    revealPair.forEach(i => {
      if (st.cards[i] && st.cards[i].state === 'preview') st.cards[i].state = 'hidden';
    });
    st.locked = false;
    _mmRenderRoot();
  }, 700);
}
window._mmUseHint = _mmUseHint;

function _mmGridHTML() {
  const st = window._mmState;
  if (!st.cards) return '';
  return st.cards.map((c, i) => {
    if (c.empty) return `<div class="mm-cell mm-empty"></div>`;
    const cls = ['mm-cell'];
    if (c.state === 'revealed' || c.state === 'preview') cls.push('is-open');
    if (c.state === 'matched') cls.push('is-matched');
    return `<div class="${cls.join(' ')}" id="mm-cell-${i}" onclick="_mmFlip(${i})">${_mmCardFaceHTML(c)}</div>`;
  }).join('');
}

function _mmDiffBarHTML() {
  const st = window._mmState;
  return _MM_DIFF_ORDER.map(k => {
    const d = _MM_DIFFICULTIES[k];
    const on = st.difficulty === k;
    return `<button class="mm-diff-pill${on ? ' on' : ''}" onclick="_mmSetDifficulty('${k}')">${d.emoji} ${d.label} ${d.grid}x${d.grid}</button>`;
  }).join('');
}

function _mmRenderRoot() {
  const root = document.getElementById('mm-root');
  if (!root) return;
  const st = window._mmState;
  const best = _mmBestScore();

  if (!st.cards && !st.ended) {
    root.innerHTML = `<div class="mm-shell">
      <div class="mm-card">
        <div class="mm-head">
          <div>
            <div class="mm-title">🃏 짝맞추기</div>
            <div class="mm-desc">같은 선수 사진 두 장을 찾아 맞히는 카드 게임입니다.</div>
          </div>
        </div>
        <div class="mm-empty-note">⚠️ 카드를 만들 만큼 프로필 사진이 등록된 선수가 부족합니다(최소 3명 필요). 선수 데이터에 사진을 더 등록하거나, 더 쉬운 난이도로 바꿔서 다시 시도해주세요.</div>
        <div class="mm-diff-bar">${_mmDiffBarHTML()}</div>
        <div class="mm-actions"><button class="mm-btn mm-btn-primary" onclick="_mmStart()">🔄 다시 확인</button></div>
      </div>
    </div>`;
    return;
  }

  const resultHTML = st.ended ? (() => {
    const cleared = st.endReason === 'clear';
    const emoji = cleared ? '🏆' : '⏰';
    const sub = cleared
      ? `클리어 보너스 +${st._clearBonus || 0}점 · 이동 ${st.moves}회 · 최고 기록 ${Math.max(best, st.score)}점${st.score >= best && st.score > 0 ? ' · 신기록!' : ''}`
      : `${st.matched}/${st.pairs}쌍 완성 · 이동 ${st.moves}회 · 최고 기록 ${Math.max(best, st.score)}점${st.score >= best && st.score > 0 ? ' · 신기록!' : ''}`;
    return `<div class="mm-result">
      <span class="mm-result-emoji">${emoji}</span>
      <div class="mm-result-score">${st.score}점</div>
      <div class="mm-result-sub">${sub}</div>
    </div>`;
  })() : '';

  const stageHTML = (!st.ended && st.cards) ? `<div class="mm-stage">
    <div class="mm-grid${st.previewing ? ' is-preview' : ''}" id="mm-grid" style="--mm-cols:${st.cols}">${_mmGridHTML()}</div>
  </div>` : '';

  root.innerHTML = `<div class="mm-shell">
    <div class="mm-card">
      <div class="mm-head">
        <div>
          <div class="mm-title">🃏 짝맞추기</div>
          <div class="mm-desc">카드를 두 장씩 뒤집어서 같은 선수 사진을 찾으세요. 연속으로 맞히면 콤보 점수가 올라갑니다!</div>
        </div>
        <div class="mm-hud">
          <span class="mm-hud-chip">🏅 점수 ${st.score}</span>
          <span class="mm-hud-chip is-combo">🔥 콤보 ${st.combo}</span>
          <span class="mm-hud-chip" id="mm-progress-chip">✅ ${st.matched}/${st.pairs}쌍</span>
          <span class="mm-hud-chip" id="mm-moves-chip">🕹️ 이동 ${st.moves}</span>
          ${st.previewing
            ? `<span class="mm-hud-chip is-combo" id="mm-preview-chip">👀 카드를 외워보세요!</span>`
            : `<span class="mm-hud-chip" id="mm-time-chip">⏱️ 남은 시간 ${st.timeLeft}초</span>`}
          <span class="mm-hud-chip">🥇 최고 ${best}</span>
        </div>
      </div>
      <div class="mm-diff-bar">${_mmDiffBarHTML()}</div>
      <div class="mm-actions">
        <button class="mm-btn mm-btn-primary" onclick="_mmStart()">${st.ended ? '🔄 다시하기' : '🔀 새로 섞기'}</button>
      </div>
      ${!st.ended ? `<div class="mm-tool-row"><button class="mm-tool-btn" onclick="_mmUseHint()" ${(!st.running || st.previewing || st.locked || st.hintsLeft <= 0) ? 'disabled' : ''}>💡 짝 힌트 (${st.hintsLeft})</button></div>` : ''}
      ${resultHTML}
      <div class="mm-status is-${_mmEsc(st.statusTone || 'info')}" id="mm-status">${_mmEsc(st.statusText || '')}</div>
      ${stageHTML}
    </div>
  </div>`;
}

function _mmFlip(idx) {
  const st = window._mmState;
  if (!st.running || st.locked || !st.cards) return;
  const card = st.cards[idx];
  if (!card || card.empty || card.state !== 'hidden') return;

  card.state = 'revealed';
  _mmPlayFlip();

  if (st.firstIdx === null) {
    st.firstIdx = idx;
    _mmRenderRoot();
    return;
  }

  st.secondIdx = idx;
  st.moves++;
  st.locked = true;
  _mmRenderRoot();

  const a = st.cards[st.firstIdx], b = st.cards[st.secondIdx];
  const isMatch = a.pairId === b.pairId;

  if (isMatch) {
    st.resolveId = setTimeout(() => {
      a.state = 'matched'; b.state = 'matched';
      st.matched++;
      st.combo++;
      st.score += 15 + Math.max(0, st.combo - 1) * 3;
      st.statusText = `매칭 성공! ${a.name} 카드 한 쌍 완료 · 현재 콤보 ${st.combo}`;
      st.statusTone = 'good';
      st.firstIdx = null; st.secondIdx = null; st.locked = false;
      _mmPlayMatch(st.combo);
      if (st.matched >= st.pairs) { _mmEndGame('clear'); return; }
      _mmRenderRoot();
    }, _MM_MATCH_DELAY);
  } else {
    st.combo = 0;
    st.statusText = '틀렸습니다. 두 카드의 위치를 기억해두세요.';
    st.statusTone = 'bad';
    _mmPlayWrong();
    const elA = document.getElementById(`mm-cell-${st.firstIdx}`);
    const elB = document.getElementById(`mm-cell-${st.secondIdx}`);
    if (elA) elA.classList.add('is-wrong');
    if (elB) elB.classList.add('is-wrong');
    st.resolveId = setTimeout(() => {
      a.state = 'hidden'; b.state = 'hidden';
      st.firstIdx = null; st.secondIdx = null; st.locked = false;
      _mmRenderRoot();
    }, _MM_MISMATCH_DELAY);
  }
}
window._mmFlip = _mmFlip;

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _mmInit() {
  const st = window._mmState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.resolveId) { clearTimeout(st.resolveId); st.resolveId = null; }
  if (!st.cards && !st.ended) { _mmStart(); return; }
  st.running = !st.ended;
  _mmRenderRoot();
  if (st.running) st.timerId = setInterval(_mmTick, 1000);
}
window._mmInit = _mmInit;
window._mmStart = _mmStart;
