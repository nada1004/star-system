/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('tiermatch') 진입 시 동적으로 로드됨. */
// ─── 🎖️ 티어 매칭 게임 (같은 티어끼리 사각형으로 묶어서 제거) ──────────────────────
// 규칙: 드래그로 사각형을 그려서 그 안의 선수가 전부 같은 티어면 제거.
//       다른 티어가 하나라도 섞여 있으면 무효. 제거된 자리는 위에서 새 선수가 떨어져 채움.

(function _tiInjectCSS() {
  if (document.getElementById('ti-style')) return;
  const s = document.createElement('style');
  s.id = 'ti-style';
  s.textContent = [
    '#ti-root{font-family:inherit;width:100%}',
    '.ti-shell{display:flex;flex-direction:column;gap:14px}',
    '.ti-card{position:relative;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);border-radius:26px;box-shadow:0 20px 44px rgba(15,23,42,.08),inset 0 1px 0 rgba(255,255,255,.9);padding:22px 22px 20px;overflow:hidden}',
    '.ti-card::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#fb7185,#f43f5e,#ec4899,#f43f5e,#fb7185)}',
    '.ti-head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}',
    '.ti-head-left{display:flex;align-items:flex-start;gap:12px;min-width:0}',
    '.ti-icon-badge{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:21px;background:linear-gradient(135deg,#fb7185,#ec4899);box-shadow:0 8px 16px rgba(236,72,153,.32)}',
    '.ti-title-group{min-width:0}',
    '.ti-title{font-size:17px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}',
    '.ti-desc{margin-top:4px;font-size:var(--fs-sm);line-height:1.6;color:var(--text3);max-width:440px}',
    '.ti-btn{padding:11px 18px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:var(--fs-base);font-weight:900;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.05);font-family:inherit;transition:.12s;white-space:nowrap}',
    '.ti-btn:hover{border-color:rgba(37,99,235,.25);color:#2563eb;transform:translateY(-1px)}',
    '.ti-btn.ti-btn-primary{background:linear-gradient(135deg,#fb7185,#f43f5e 52%,#ec4899);color:#fff;border:none;box-shadow:0 7px 0 #9f1239,0 16px 26px rgba(244,63,94,.24)}',
    '.ti-btn.ti-btn-primary:hover{color:#fff;transform:translateY(-2px)}',
    '.ti-btn.ti-btn-primary:active{transform:translateY(1px);box-shadow:0 3px 0 #9f1239,0 8px 14px rgba(244,63,94,.24)}',
    '.ti-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px}',
    '.ti-stat{display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:var(--r2);background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.16);box-shadow:0 8px 16px rgba(15,23,42,.05);min-width:0}',
    '.ti-stat-icon{flex:none;width:30px;height:30px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;font-size:var(--fs-md);background:#f1f5f9}',
    '.ti-stat-meta{display:flex;flex-direction:column;min-width:0;line-height:1.25}',
    '.ti-stat-val{font-size:var(--fs-md);font-weight:950;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ti-stat-label{font-size:10.5px;font-weight:800;color:var(--text3)}',
    '.ti-stat.is-combo .ti-stat-icon{background:linear-gradient(135deg,#fef3c7,#fde68a)}',
    '.ti-stat.is-combo .ti-stat-val{color:#92400e}',
    '.ti-stat.is-best .ti-stat-icon{background:linear-gradient(135deg,#fde68a,#fbbf24)}',
    '.ti-stat.is-best .ti-stat-val{color:#92400e}',
    '.ti-stat.is-time-low{background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#fca5a5;animation:tiPulse 1s ease-in-out infinite}',
    '.ti-stat.is-time-low .ti-stat-icon{background:#fecaca}',
    '.ti-stat.is-time-low .ti-stat-val{color:#b91c1c}',
    '@keyframes tiPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}',
    '.ti-section-label{margin-top:16px;font-size:var(--fs-caption);font-weight:900;color:var(--text3);letter-spacing:.02em}',
    '.ti-diff-bar{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}',
    '.ti-diff-pill{padding:8px 13px;border-radius:999px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:var(--fs-sm);font-weight:800;cursor:pointer;font-family:inherit;transition:.14s;white-space:nowrap}',
    '.ti-diff-pill:hover{border-color:rgba(37,99,235,.3);color:#2563eb;transform:translateY(-1px)}',
    '.ti-diff-pill.on{background:linear-gradient(135deg,#34d399,#10b981);color:#fff;border-color:transparent;box-shadow:0 6px 14px rgba(16,185,129,.3)}',
    '.ti-actions{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}',
    '.ti-stage{position:relative;margin-top:16px}',
    '.ti-grid{display:grid;grid-template-columns:repeat(var(--ti-cols,8),1fr);gap:7px;position:relative;touch-action:none;-webkit-user-select:none;user-select:none;border-radius:18px;padding:10px;background:linear-gradient(180deg,#f8fafc,#f1f5f9);border:1px solid rgba(148,163,184,.14)}',
    '.ti-cell{position:relative;aspect-ratio:1/1;border-radius:var(--r2);overflow:hidden;background:var(--ti-cell-color,#f1f5f9);box-shadow:0 2px 0 rgba(15,23,42,.08),0 4px 8px rgba(15,23,42,.08),inset 0 0 0 2.5px rgba(255,255,255,.9);animation:tiDropIn .28s ease both;transition:transform .12s}',
    '.ti-cell.ti-empty{box-shadow:none;background:transparent;animation:none}',
    '.ti-cell.ti-sel{outline:3px solid #2563eb;outline-offset:-2px;filter:brightness(1.06);transform:scale(1.06);z-index:2}',
    '.ti-cell.ti-invalid{animation:tiShake .32s ease}',
    '.ti-cell.ti-clear{animation:tiPopOut .26s ease forwards}',
    '.ti-cell img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;border-radius:13.5px}',
    '.ti-cell-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;color:#fff;pointer-events:none}',
    '.ti-selbox{position:absolute;border:2px dashed #2563eb;background:rgba(37,99,235,.10);border-radius:var(--r);pointer-events:none;z-index:5;display:none}',
    '.ti-result{background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:1px solid rgba(251,113,133,.28);border-radius:22px;padding:22px 20px;text-align:center;margin-top:16px;animation:tiPopIn .4s cubic-bezier(.175,.885,.32,1.35)}',
    '.ti-result-emoji{font-size:44px;display:block;margin-bottom:4px}',
    '.ti-result-score{font-size:clamp(24px,5vw,34px);font-weight:900;color:#C0274A;margin:4px 0 4px}',
    '.ti-result-sub{font-size:var(--fs-sm);color:var(--text3)}',
    '.ti-empty-note{font-size:var(--fs-sm);color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 14px;margin-top:14px;line-height:1.6}',
    '.ti-status{margin-top:14px;display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:14px;font-size:var(--fs-sm);font-weight:800;line-height:1.5}',
    '.ti-status::before{content:"";flex:none;width:7px;height:7px;border-radius:50%}',
    '.ti-status.is-info{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}',
    '.ti-status.is-info::before{background:#3b82f6}',
    '.ti-status.is-good{background:#ecfdf5;border:1px solid #86efac;color:#047857}',
    '.ti-status.is-good::before{background:#10b981}',
    '.ti-status.is-bad{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c}',
    '.ti-status.is-bad::before{background:#ef4444}',
    '@keyframes tiDropIn{from{opacity:0;transform:translateY(-14px) scale(.85)}to{opacity:1;transform:translateY(0) scale(1)}}',
    '@keyframes tiPopOut{to{opacity:0;transform:scale(.55)}}',
    '@keyframes tiShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}',
    '@keyframes tiPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}',
    'body.dark .ti-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}',
    'body.dark .ti-result{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}',
    'body.dark .ti-stat,body.dark .ti-btn,body.dark .ti-diff-pill{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .ti-stat-icon{background:#1e293b}',
    'body.dark .ti-diff-pill.on{color:#fff}',
    'body.dark .ti-title{color:#f8fafc}',
    'body.dark .ti-desc{color:#94a3b8}',
    'body.dark .ti-grid{background:linear-gradient(180deg,#0f172a,#0b1322);border-color:#243349}',
    'body.dark .ti-cell{box-shadow:0 2px 0 rgba(0,0,0,.3),0 4px 8px rgba(0,0,0,.3),inset 0 0 0 2.5px rgba(15,23,42,.6)}',
    'body.dark .ti-section-label{color:#94a3b8}',
    '@media (max-width:520px){.ti-card{padding:16px 14px 16px}.ti-stats{grid-template-columns:repeat(2,1fr)}.ti-icon-badge{width:38px;height:38px;font-size:var(--fs-lg)}.ti-title{font-size:var(--fs-md)}}'
  ].join('');
  document.head.appendChild(s);
})();

// ─── 사운드 ────────────────────────────────────────────────────────────────────
let _tiAC = null;
function _tiPlayMatch(n) {
  try {
    if (!_tiAC) _tiAC = new (window.AudioContext || window.webkitAudioContext)();
    // 제거된 칸 수가 많을수록 더 화려한 아르페지오
    const notes = n >= 6 ? [523, 659, 784, 1047] : n >= 4 ? [523, 659, 784] : [659, 880];
    notes.forEach((f, i) => {
      setTimeout(() => {
        const o = _tiAC.createOscillator(), g = _tiAC.createGain();
        o.connect(g); g.connect(_tiAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.14, _tiAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _tiAC.currentTime + 0.22);
        o.start(); o.stop(_tiAC.currentTime + 0.22);
      }, i * 70);
    });
  } catch (e) {}
}
function _tiPlayInvalid() {
  try {
    if (!_tiAC) _tiAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _tiAC.createOscillator(), g = _tiAC.createGain();
    o.connect(g); g.connect(_tiAC.destination);
    o.frequency.value = 160; o.type = 'sawtooth';
    g.gain.setValueAtTime(0.09, _tiAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _tiAC.currentTime + 0.18);
    o.start(); o.stop(_tiAC.currentTime + 0.18);
  } catch (e) {}
}

// ─── 상태 ────────────────────────────────────────────────────────────────────
const _TI_TIME_LIMIT = 110; // 초 — 모든 난이도 공통 (난이도는 보드 크기/티어 수/클러스터링으로만 구분)
// ─── 난이도 설정 ──────────────────────────────────────────────────────────────
// maxGroups: 판에 등장하는 티어 종류 수 상한 — 많을수록 헷갈림.
// bias: 인접 칸이 같은 티어로 나올 확률 — 낮을수록 티어가 흩어져서 사각형 찾기가 어려워짐.
// colBump/rowBump: 기본 그리드 크기에 더할 보정값 — 클수록 판이 커져서 스캔하기 어려워짐.
const _TI_DIFFICULTIES = {
  beginner: { key: 'beginner', label: '초급',   emoji: '🌱', maxGroups: 4,  bias: 0.82, colBump: -1, rowBump: -1 },
  normal:   { key: 'normal',   label: '중급',   emoji: '⚔️', maxGroups: 6,  bias: 0.68, colBump: 0,  rowBump: 0 },
  hard:     { key: 'hard',     label: '고수',   emoji: '🔥', maxGroups: 8,  bias: 0.55, colBump: 0,  rowBump: 1 },
  extreme:  { key: 'extreme',  label: '초고수', emoji: '💀', maxGroups: 10, bias: 0.42, colBump: 1,  rowBump: 1 },
  god:      { key: 'god',      label: '신',     emoji: '👑', maxGroups: 99, bias: 0.30, colBump: 1,  rowBump: 2 },
};
const _TI_DIFF_ORDER = ['beginner', 'normal', 'hard', 'extreme', 'god'];

function _tiReadStoredDifficulty() {
  try {
    const v = localStorage.getItem('su_ti_diff');
    if (v && _TI_DIFFICULTIES[v]) return v;
  } catch (e) {}
  return 'normal';
}

window._tiState = window._tiState || {
  difficulty: _tiReadStoredDifficulty(),
  cols: 0, rows: 0, board: null, tierPool: [], tierBags: {},
  score: 0, combo: 0, bestCombo: 0, timeLeft: _TI_TIME_LIMIT, running: false, ended: false,
  timerId: null, dragging: false, selStart: null, selCur: null, uidSeq: 1,
  statusText: '같은 티어가 붙은 구간을 찾아 작고 정확한 직사각형으로 연속 제거해보세요.',
  statusTone: 'info',
};

function _tiDiffObj() {
  return _TI_DIFFICULTIES[window._tiState.difficulty] || _TI_DIFFICULTIES.normal;
}

function _tiSetDifficulty(key) {
  if (!_TI_DIFFICULTIES[key]) return;
  const st = window._tiState;
  st.difficulty = key;
  try { localStorage.setItem('su_ti_diff', key); } catch (e) {}
  _tiStart();
}
window._tiSetDifficulty = _tiSetDifficulty;

function _tiDiffBarHTML() {
  const st = window._tiState;
  return _TI_DIFF_ORDER.map(k => {
    const d = _TI_DIFFICULTIES[k];
    const on = st.difficulty === k;
    return `<button class="ti-diff-pill${on ? ' on' : ''}" onclick="_tiSetDifficulty('${k}')">${d.emoji} ${d.label}</button>`;
  }).join('');
}

function _tiCols() {
  const base = (window.innerWidth || 375) >= 700 ? 8 : 5;
  return Math.max(4, base + (_tiDiffObj().colBump || 0));
}
function _tiRows() {
  const base = (window.innerWidth || 375) >= 700 ? 7 : 8;
  return Math.max(4, base + (_tiDiffObj().rowBump || 0));
}

function _tiBestScore(diffKey) {
  const key = diffKey || window._tiState.difficulty || 'normal';
  try {
    const v = localStorage.getItem('su_ti_best_' + key);
    if (v != null) return parseInt(v, 10) || 0;
    if (key === 'normal') return parseInt(localStorage.getItem('su_tier_best') || '0', 10) || 0; // 구버전 기록 이관
  } catch (e) {}
  return 0;
}
function _tiSaveBest(v, diffKey) {
  const key = diffKey || window._tiState.difficulty || 'normal';
  try { localStorage.setItem('su_ti_best_' + key, String(v)); } catch (e) {}
}

// ─── 티어 풀 구성 ─────────────────────────────────────────────────────────
function _tiBuildTierPool() {
  const players = Array.isArray(window.players) ? window.players : [];
  const pool = {};
  const seenByTier = {}; // [버그수정] 동일 인물이 같은 티어 목록에 중복 등록돼 있으면 그 사람만 과도하게 자주 뽑히는 문제 방지
  players.forEach(p => {
    if (!p || p.hidden || p.retired || p.hideFromBoard) return;
    if (String(p.univ || '').trim() === 'YB') return;
    const t = String(p.tier || '').trim();
    if (!t || t === '?' || t === '미정' || t === '미확인') return;
    const name = String(p.name || '').trim();
    if (!name) return;
    if (!seenByTier[t]) seenByTier[t] = new Set();
    if (seenByTier[t].has(name)) return; // 중복 인물 스킵
    seenByTier[t].add(name);
    if (!pool[t]) pool[t] = [];
    pool[t].push({ name, photo: p.photo });
  });
  let teams = Object.keys(pool).map(t => ({
    tier: t,
    color: (typeof getTierBtnColor === 'function') ? getTierBtnColor(t) : '#6b7280',
    players: pool[t],
  }));
  // [버그수정] 티어에 등록된 선수가 1명뿐이면 그 티어가 나올 때마다 항상 같은 사람 사진만 보이게 되어
  // "같은 사람만 계속 나온다"는 체감으로 이어짐 → 최소 2명 이상 등록된 티어만 게임 풀에 포함
  const diverseTiers = teams.filter(t => t.players.length >= 2);
  if (diverseTiers.length >= 2) teams = diverseTiers;
  // 셔플(티어 등장 순서를 매판마다 다르게)
  for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
  }
  // 티어 종류가 너무 많으면 판이 어수선해져서 매칭이 어려워지므로 난이도별 상한만큼만 사용
  const maxGroups = _tiDiffObj().maxGroups || 8;
  if (teams.length > maxGroups) teams = teams.slice(0, maxGroups);
  return teams;
}

// 티어별로 "가방(bag)" 방식 셔플 큐를 유지해서 같은 선수 사진이 너무 몰리지 않게 함
function _tiDrawFromTier(tierIdx) {
  const st = window._tiState;
  const team = st.tierPool[tierIdx];
  let bag = st.tierBags[tierIdx];
  if (!bag || !bag.length) {
    bag = team.players.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    // [버그수정] 이전 가방의 마지막 인물과 새 가방의 첫 뽑힘(맨 뒤 요소)이 같으면
    // 바로 직전과 동일 인물이 연속으로 뽑혀 "같은 사람만 나온다"고 느껴짐 → 가능하면 위치를 바꿔줌
    const lastPicked = st.tierLastPicked && st.tierLastPicked[tierIdx];
    if (lastPicked && bag.length > 1 && bag[bag.length - 1].name === lastPicked) {
      const swapWith = Math.floor(Math.random() * (bag.length - 1));
      [bag[bag.length - 1], bag[swapWith]] = [bag[swapWith], bag[bag.length - 1]];
    }
    st.tierBags[tierIdx] = bag;
  }
  const picked = bag.pop();
  if (!st.tierLastPicked) st.tierLastPicked = {};
  st.tierLastPicked[tierIdx] = picked.name;
  return picked;
}

function _tiTierIndexByName(tier) {
  const st = window._tiState;
  return st.tierPool.findIndex(team => String(team?.tier || '').trim() === String(tier || '').trim());
}

function _tiPickTierIndex(neighborSpecs) {
  const st = window._tiState;
  const weighted = [];
  (neighborSpecs || []).forEach(spec => {
    const cell = spec?.cell;
    const weight = Math.max(0, spec?.weight || 0);
    const tier = String(cell?.tier || '').trim();
    if (!tier || !weight) return;
    const idx = _tiTierIndexByName(tier);
    if (idx < 0) return;
    for (let i = 0; i < weight; i++) weighted.push(idx);
  });
  if (weighted.length && Math.random() < _tiDiffObj().bias) {
    return weighted[Math.floor(Math.random() * weighted.length)];
  }
  return Math.floor(Math.random() * st.tierPool.length);
}

function _tiRandomCell(neighborSpecs) {
  const st = window._tiState;
  const tierIdx = _tiPickTierIndex(neighborSpecs);
  const team = st.tierPool[tierIdx];
  const picked = _tiDrawFromTier(tierIdx);
  return {
    uid: st.uidSeq++,
    tier: team.tier,
    color: team.color,
    name: picked.name,
    photo: picked.photo,
  };
}

// ─── 보드 초기화 ──────────────────────────────────────────────────────────────
function _tiNewBoard() {
  const st = window._tiState;
  st.tierPool = _tiBuildTierPool();
  st.tierBags = {};
  st.cols = _tiCols();
  st.rows = _tiRows();
  st.score = 0;
  st.combo = 0;
  st.bestCombo = 0;
  st.timeLeft = _TI_TIME_LIMIT;
  st.running = false;
  st.ended = false;
  st.dragging = false;
  st.selStart = null;
  st.selCur = null;
  st.statusText = '같은 티어가 이어진 줄을 찾아 작고 빠르게 긁으면 점수가 잘 쌓입니다.';
  st.statusTone = 'info';
  if (st.tierPool.length < 2) { st.board = null; return; }
  st.board = Array.from({ length: st.rows }, () => Array(st.cols).fill(null));
  for (let r = 0; r < st.rows; r++) {
    for (let c = 0; c < st.cols; c++) {
      st.board[r][c] = _tiRandomCell([
        { cell: c > 0 ? st.board[r][c - 1] : null, weight: 4 },
        { cell: r > 0 ? st.board[r - 1][c] : null, weight: 3 },
        { cell: c > 1 ? st.board[r][c - 2] : null, weight: 1 },
      ]);
    }
  }
}

function _tiStart() {
  const st = window._tiState;
  _tiNewBoard();
  if (!st.board) { _tiRenderRoot(); return; }
  st.running = true;
  _tiRenderRoot();
  if (st.timerId) clearInterval(st.timerId);
  st.timerId = setInterval(_tiTick, 1000);
}

function _tiTick() {
  const st = window._tiState;
  if (!st.running) return;
  st.timeLeft--;
  const timeVal = document.getElementById('ti-time-val');
  const timeStat = document.getElementById('ti-time-chip');
  if (timeVal) timeVal.textContent = `${st.timeLeft}초`;
  if (timeStat) timeStat.classList.toggle('is-time-low', st.timeLeft <= 15);
  if (st.timeLeft <= 0) _tiEndGame();
}

function _tiEndGame() {
  const st = window._tiState;
  st.running = false;
  st.ended = true;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.score > _tiBestScore()) _tiSaveBest(st.score);
  _tiRenderRoot();
}

function _tiCleanup() {
  const st = window._tiState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  st.running = false;
  st.dragging = false;
}
window._tiCleanup = _tiCleanup;

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function _tiEsc(s) {
  return (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s);
}
function _tiUrl(u) {
  return (typeof toHttpsUrl === 'function') ? toHttpsUrl(u) : u;
}

function _tiCellHTML(cell) {
  if (!cell) return `<div class="ti-cell ti-empty"></div>`;
  const bg = cell.color || '#94a3b8';
  const initial = _tiEsc(String(cell.name || '?').trim().slice(0, 1));
  const img = cell.photo
    ? `<img src="${_tiEsc(_tiUrl(cell.photo))}" alt="${_tiEsc(cell.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="ti-cell-fallback" style="display:none;background:${bg}">${initial}</div>`
    : `<div class="ti-cell-fallback" style="background:${bg}">${initial}</div>`;
  return `<div class="ti-cell" data-uid="${cell.uid}" style="--ti-cell-color:${bg}">
    ${img}
  </div>`;
}

function _tiGridHTML() {
  const st = window._tiState;
  if (!st.board) return '';
  let html = '';
  for (let r = 0; r < st.rows; r++) {
    for (let c = 0; c < st.cols; c++) html += _tiCellHTML(st.board[r][c]);
  }
  return html;
}

function _tiRenderRoot() {
  const root = document.getElementById('ti-root');
  if (!root) return;
  const st = window._tiState;
  const best = _tiBestScore();

  if (!st.board && !st.ended) {
    root.innerHTML = `<div class="ti-shell">
      <div class="ti-card">
        <div class="ti-head-row">
          <div class="ti-head-left">
            <div class="ti-icon-badge">🎖️</div>
            <div class="ti-title-group">
              <div class="ti-title">티어 매칭</div>
              <div class="ti-desc">사각형으로 드래그해서 같은 티어 선수들만 모아 제거하는 매칭 게임입니다.</div>
            </div>
          </div>
        </div>
        <div class="ti-section-label">난이도 선택</div>
        <div class="ti-diff-bar">${_tiDiffBarHTML()}</div>
        <div class="ti-empty-note">⚠️ 게임을 만들 만큼 티어 정보와 프로필 사진이 등록된 선수가 부족합니다(최소 2개 티어 필요). 선수 데이터에 티어/사진을 더 등록한 뒤 다시 시도해주세요.</div>
        <div class="ti-actions"><button class="ti-btn ti-btn-primary" onclick="_tiStart()">🔄 다시 확인</button></div>
      </div>
    </div>`;
    return;
  }

  const resultHTML = st.ended ? `<div class="ti-result">
    <span class="ti-result-emoji">🏆</span>
    <div class="ti-result-score">${st.score}점</div>
    <div class="ti-result-sub">최고 기록 ${Math.max(best, st.score)}점${st.score >= best && st.score > 0 ? ' · 신기록!' : ''} · 최고 콤보 ${Math.max(st.bestCombo || 0, st.combo || 0)}</div>
  </div>` : '';

  root.innerHTML = `<div class="ti-shell">
    <div class="ti-card">
      <div class="ti-head-row">
        <div class="ti-head-left">
          <div class="ti-icon-badge">🎖️</div>
          <div class="ti-title-group">
            <div class="ti-title">티어 매칭</div>
            <div class="ti-desc">드래그해서 사각형을 그리세요. 안에 있는 선수 사진이 <b>전부 같은 티어</b>이면 사라지고 점수를 얻습니다. 다른 티어가 하나라도 섞이면 무효!</div>
          </div>
        </div>
        <button class="ti-btn ti-btn-primary" onclick="_tiStart()">${st.ended ? '🔄 다시하기' : '🔀 새로 섞기'}</button>
      </div>
      <div class="ti-stats">
        <div class="ti-stat"><span class="ti-stat-icon">🏅</span><div class="ti-stat-meta"><span class="ti-stat-val" id="ti-score-val">${st.score}</span><span class="ti-stat-label">점수</span></div></div>
        <div class="ti-stat is-combo"><span class="ti-stat-icon">🔥</span><div class="ti-stat-meta"><span class="ti-stat-val" id="ti-combo-val">${st.combo || 0}</span><span class="ti-stat-label">콤보</span></div></div>
        <div class="ti-stat" id="ti-time-chip"><span class="ti-stat-icon">⏱️</span><div class="ti-stat-meta"><span class="ti-stat-val" id="ti-time-val">${st.timeLeft}초</span><span class="ti-stat-label">남은 시간</span></div></div>
        <div class="ti-stat is-best"><span class="ti-stat-icon">🥇</span><div class="ti-stat-meta"><span class="ti-stat-val">${best}</span><span class="ti-stat-label">최고 기록</span></div></div>
      </div>
      <div class="ti-section-label">난이도 선택</div>
      <div class="ti-diff-bar">${_tiDiffBarHTML()}</div>
      ${resultHTML}
      <div class="ti-status is-${_tiEsc(st.statusTone || 'info')}" id="ti-status">${_tiEsc(st.statusText || '')}</div>
      <div class="ti-stage">
        <div class="ti-selbox" id="ti-selbox"></div>
        <div class="ti-grid" id="ti-grid" style="--ti-cols:${st.cols}">${_tiGridHTML()}</div>
      </div>
    </div>
  </div>`;

  _tiAttachPointerHandlers();
}

// ─── 드래그 선택 로직 ─────────────────────────────────────────────────────────
function _tiCellFromPoint(gridEl, clientX, clientY) {
  const st = window._tiState;
  const rect = gridEl.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const cw = rect.width / st.cols;
  const ch = rect.height / st.rows;
  let c = Math.floor(x / cw);
  let r = Math.floor(y / ch);
  c = Math.max(0, Math.min(st.cols - 1, c));
  r = Math.max(0, Math.min(st.rows - 1, r));
  return { r, c };
}

function _tiUpdateSelectionVisual() {
  const st = window._tiState;
  const gridEl = document.getElementById('ti-grid');
  const boxEl = document.getElementById('ti-selbox');
  if (!gridEl || !boxEl || !st.selStart || !st.selCur) return;
  const minR = Math.min(st.selStart.r, st.selCur.r), maxR = Math.max(st.selStart.r, st.selCur.r);
  const minC = Math.min(st.selStart.c, st.selCur.c), maxC = Math.max(st.selStart.c, st.selCur.c);

  gridEl.querySelectorAll('.ti-cell').forEach((el, idx) => {
    const r = Math.floor(idx / st.cols), c = idx % st.cols;
    el.classList.toggle('ti-sel', r >= minR && r <= maxR && c >= minC && c <= maxC);
  });

  const cellW = gridEl.clientWidth / st.cols;
  const cellH = gridEl.clientHeight / st.rows;
  boxEl.style.display = 'block';
  boxEl.style.left = (minC * cellW) + 'px';
  boxEl.style.top = (minR * cellH) + 'px';
  boxEl.style.width = ((maxC - minC + 1) * cellW) + 'px';
  boxEl.style.height = ((maxR - minR + 1) * cellH) + 'px';
}

function _tiClearSelectionVisual() {
  const gridEl = document.getElementById('ti-grid');
  const boxEl = document.getElementById('ti-selbox');
  if (gridEl) gridEl.querySelectorAll('.ti-cell.ti-sel').forEach(el => el.classList.remove('ti-sel'));
  if (boxEl) boxEl.style.display = 'none';
}

function _tiFinishSelection() {
  const st = window._tiState;
  if (!st.selStart || !st.selCur) return;
  const minR = Math.min(st.selStart.r, st.selCur.r), maxR = Math.max(st.selStart.r, st.selCur.r);
  const minC = Math.min(st.selStart.c, st.selCur.c), maxC = Math.max(st.selStart.c, st.selCur.c);
  st.selStart = null; st.selCur = null; st.dragging = false;
  _tiClearSelectionVisual();
  if (!st.running) return;

  const cells = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const cell = st.board[r][c];
      if (cell) cells.push({ r, c, cell });
    }
  }
  if (cells.length < 2) return;

  const firstTier = String(cells[0]?.cell?.tier || '').trim();
  const matched = cells.filter(({ cell }) => String(cell?.tier || '').trim() === firstTier);
  const gridEl = document.getElementById('ti-grid');
  if (!firstTier || matched.length !== cells.length) {
    // 박스 안 전체가 같은 티어가 아니면 무효 처리
    st.combo = 0;
    st.statusText = `조건 불일치: ${cells.length}칸이 모두 같은 티어여야 합니다.`;
    st.statusTone = 'bad';
    _tiUpdateHud();
    _tiPlayInvalid();
    if (gridEl) {
      cells.forEach(({ r, c }) => {
        const idx = r * st.cols + c;
        const el = gridEl.children[idx];
        if (el) el.classList.add('ti-invalid');
      });
      setTimeout(() => {
        cells.forEach(({ r, c }) => {
          const idx = r * st.cols + c;
          const el = gridEl.children[idx];
          if (el) el.classList.remove('ti-invalid');
        });
      }, 320);
    }
    return;
  }

  // 유효한 매칭: 점수 추가 + 제거 애니메이션 후 낙하 보충 (매칭된 셀만)
  st.combo = (st.combo || 0) + 1;
  st.bestCombo = Math.max(st.bestCombo || 0, st.combo);
  const areaBonus = matched.length >= 6 ? 4 : matched.length >= 4 ? 2 : 0;
  const comboBonus = Math.max(0, st.combo - 1) * 2;
  const gained = matched.length + areaBonus + comboBonus;
  st.score += gained;
  st.statusText = `${matched.length}칸 제거 성공! +${gained}점${areaBonus ? ` · 큰 박스 보너스 +${areaBonus}` : ''}${comboBonus ? ` · 콤보 보너스 +${comboBonus}` : ''}`;
  st.statusTone = 'good';
  _tiPlayMatch(matched.length);
  _tiUpdateHud();

  if (gridEl) {
    matched.forEach(({ r, c }) => {
      const idx = r * st.cols + c;
      const el = gridEl.children[idx];
      if (el) el.classList.add('ti-clear');
    });
  }
  setTimeout(() => {
    matched.forEach(({ r, c }) => { st.board[r][c] = null; });
    _tiApplyGravity(minC, maxC);
    _tiRenderRoot();
  }, 220);
}

function _tiUpdateHud() {
  const st = window._tiState;
  const scoreVal = document.getElementById('ti-score-val');
  if (scoreVal) scoreVal.textContent = st.score;
  const comboVal = document.getElementById('ti-combo-val');
  if (comboVal) comboVal.textContent = st.combo || 0;
  const statusEl = document.getElementById('ti-status');
  if (statusEl) {
    statusEl.className = `ti-status is-${st.statusTone || 'info'}`;
    statusEl.textContent = st.statusText || '';
  }
}

function _tiApplyGravity(minC, maxC) {
  const st = window._tiState;
  for (let c = minC; c <= maxC; c++) {
    const remaining = [];
    for (let r = 0; r < st.rows; r++) if (st.board[r][c]) remaining.push(st.board[r][c]);
    const removed = st.rows - remaining.length;
    const newCol = new Array(st.rows);
    for (let i = removed - 1; i >= 0; i--) {
      newCol[i] = _tiRandomCell([
        { cell: c > 0 ? st.board[i][c - 1] : null, weight: 3 },
        { cell: c < st.cols - 1 ? st.board[i][c + 1] : null, weight: 2 },
        { cell: i === removed - 1 ? remaining[0] : newCol[i + 1], weight: 4 },
      ]);
    }
    for (let i = 0; i < remaining.length; i++) newCol[removed + i] = remaining[i];
    for (let r = 0; r < st.rows; r++) st.board[r][c] = newCol[r];
  }
}

function _tiAttachPointerHandlers() {
  const gridEl = document.getElementById('ti-grid');
  if (!gridEl || gridEl._tiBound) return;
  gridEl._tiBound = true;

  const onDown = (e) => {
    const st = window._tiState;
    if (!st.running) return;
    const p = e.touches ? e.touches[0] : e;
    const cell = _tiCellFromPoint(gridEl, p.clientX, p.clientY);
    st.dragging = true;
    st.selStart = cell;
    st.selCur = cell;
    _tiUpdateSelectionVisual();
    e.preventDefault();
  };
  const onMove = (e) => {
    const st = window._tiState;
    if (!st.dragging) return;
    const p = e.touches ? e.touches[0] : e;
    st.selCur = _tiCellFromPoint(gridEl, p.clientX, p.clientY);
    _tiUpdateSelectionVisual();
    e.preventDefault();
  };
  const onUp = () => {
    const st = window._tiState;
    if (!st.dragging) return;
    _tiFinishSelection();
  };

  gridEl.addEventListener('pointerdown', onDown);
  gridEl.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  gridEl.addEventListener('touchstart', onDown, { passive: false });
  gridEl.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);
}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _tiInit() {
  const st = window._tiState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (!st.board) { _tiStart(); return; }
  st.running = !st.ended;
  _tiRenderRoot();
  if (st.running) st.timerId = setInterval(_tiTick, 1000);
}
window._tiInit = _tiInit;
window._tiStart = _tiStart;
