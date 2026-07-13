/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('mole') 진입 시 동적으로 로드됨. */
// ─── 🐹 두더지 잡기 (문제 프로필과 같은 얼굴의 두더지만 클릭) ──────────────────────
// 규칙: 위에 나온 문제 선수 사진과 같은 얼굴의 두더지가 튀어나오면 클릭해서 잡는다.
//       다른 선수 두더지를 잘못 잡으면 콤보가 끊긴다. 3x3(쉬움)/5x5(어려움) 난이도 지원.

(function _mwInjectCSS() {
  if (document.getElementById('mw-style')) return;
  const s = document.createElement('style');
  s.id = 'mw-style';
  s.textContent = [
    '#mw-root{font-family:inherit;width:100%}',
    '.mw-shell{display:flex;flex-direction:column;gap:14px}',
    '.mw-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:24px;box-shadow:0 18px 38px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.9);padding:18px 20px}',
    '.mw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
    '.mw-title{font-size:16px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}',
    '.mw-desc{margin-top:5px;font-size:12px;line-height:1.6;color:var(--text3)}',
    '.mw-hud{display:flex;gap:8px;flex-wrap:wrap}',
    '.mw-hud-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.18);font-size:12px;font-weight:900;color:var(--text2);box-shadow:0 8px 16px rgba(15,23,42,.05);white-space:nowrap}',
    '.mw-hud-chip.is-time-low{background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#fca5a5;color:#b91c1c;animation:mwPulse 1s ease-in-out infinite}',
    '.mw-hud-chip.is-combo{background:linear-gradient(135deg,#dcfce7,#bbf7d0);border-color:#86efac;color:#166534}',
    '@keyframes mwPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}',
    '.mw-diff-bar{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}',
    '.mw-diff-pill{padding:7px 12px;border-radius:999px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;transition:.12s;white-space:nowrap}',
    '.mw-diff-pill:hover{border-color:rgba(37,99,235,.3);color:#2563eb}',
    '.mw-diff-pill.on{background:linear-gradient(135deg,#34d399,#10b981);color:#fff;border-color:transparent;box-shadow:0 6px 14px rgba(16,185,129,.28)}',
    '.mw-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
    '.mw-btn{padding:10px 18px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.05);font-family:inherit;transition:.12s}',
    '.mw-btn:hover{border-color:rgba(37,99,235,.25);color:#2563eb}',
    '.mw-btn.mw-btn-primary{background:linear-gradient(135deg,#4ade80,#16a34a 52%,#15803d);color:#fff;border:none;box-shadow:0 7px 0 #14532d,0 16px 26px rgba(22,163,74,.22)}',
    '.mw-btn.mw-btn-primary:hover{color:#fff;transform:translateY(-1px)}',
    '.mw-target-row{margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:8px}',
    '.mw-target-label{font-size:12px;font-weight:900;color:var(--text2)}',
    '.mw-target-wrap{width:min(96px,22vw);aspect-ratio:1/1;border-radius:20px;overflow:hidden;background:#f1f5f9;box-shadow:0 4px 0 rgba(15,23,42,.10),0 12px 22px rgba(15,23,42,.12),inset 0 0 0 4px rgba(255,255,255,.9);animation:mwTargetIn .3s ease both}',
    '.mw-target-wrap img{width:100%;height:100%;object-fit:cover;display:block}',
    '.mw-target-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#fff;background:linear-gradient(135deg,#4ade80,#16a34a)}',
    '@keyframes mwTargetIn{from{opacity:0;transform:scale(.8) rotate(-4deg)}to{opacity:1;transform:scale(1) rotate(0)}}',
    '.mw-status{margin-top:6px;padding:10px 12px;border-radius:12px;font-size:12px;font-weight:800;line-height:1.55;text-align:center}',
    '.mw-status.is-info{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}',
    '.mw-status.is-good{background:#ecfdf5;border:1px solid #86efac;color:#047857}',
    '.mw-status.is-bad{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c}',
    '.mw-stage{margin-top:12px}',
    '.mw-grid{display:grid;grid-template-columns:repeat(var(--mw-cols,3),1fr);gap:10px;max-width:520px;margin:0 auto}',
    '.mw-hole{position:relative;aspect-ratio:1/1;border-radius:50%;cursor:pointer;background:radial-gradient(ellipse at 50% 62%,rgba(15,23,42,.9) 0%,rgba(76,52,32,.85) 45%,rgba(139,98,58,.65) 68%,transparent 76%);box-shadow:inset 0 6px 10px rgba(0,0,0,.35);overflow:visible}',
    '.mw-mole{position:absolute;left:50%;bottom:6%;width:78%;aspect-ratio:1/1;border-radius:50%;transform:translate(-50%,60%) scale(.85);opacity:0;overflow:hidden;box-shadow:0 4px 10px rgba(15,23,42,.3),0 0 0 3px rgba(255,255,255,.9);pointer-events:none}',
    '.mw-hole.is-up .mw-mole{animation:mwPopUp .18s ease forwards}',
    '.mw-hole.is-good .mw-mole{animation:mwHitGood .28s ease forwards}',
    '.mw-hole.is-bad .mw-mole{animation:mwHitBad .3s ease forwards}',
    '@keyframes mwPopUp{from{transform:translate(-50%,60%) scale(.85);opacity:0}to{transform:translate(-50%,0) scale(1);opacity:1}}',
    '@keyframes mwHitGood{0%{transform:translate(-50%,0) scale(1);opacity:1}60%{transform:translate(-50%,-8%) scale(1.15);opacity:1}100%{transform:translate(-50%,60%) scale(.6);opacity:0}}',
    '@keyframes mwHitBad{0%{transform:translate(-50%,0) scale(1);opacity:1}30%{transform:translate(-58%,0) scale(1)}60%{transform:translate(-42%,0) scale(1)}100%{transform:translate(-50%,60%) scale(.6);opacity:0}}',
    '.mw-mole img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}',
    '.mw-mole-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;background:#6b7280;pointer-events:none}',
    '.mw-result{background:linear-gradient(135deg,#F0FDF4,#F8FFFA);border:1px solid rgba(74,222,128,.28);border-radius:22px;padding:22px 20px;text-align:center;margin-top:14px;animation:mwPopIn .4s cubic-bezier(.175,.885,.32,1.35)}',
    '.mw-result-emoji{font-size:44px;display:block;margin-bottom:4px}',
    '.mw-result-score{font-size:clamp(24px,5vw,34px);font-weight:900;color:#15803d;margin:4px 0 4px}',
    '.mw-result-sub{font-size:12px;color:var(--text3)}',
    '@keyframes mwPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}',
    '.mw-empty-note{font-size:12px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 12px;margin-top:10px;line-height:1.6}',
    'body.dark .mw-card,body.dark .mw-result{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}',
    'body.dark .mw-hud-chip,body.dark .mw-btn,body.dark .mw-diff-pill{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .mw-diff-pill.on{color:#fff}',
    'body.dark .mw-title{color:#f8fafc}',
    'body.dark .mw-desc{color:#94a3b8}',
    'body.dark .mw-target-wrap{box-shadow:0 4px 0 rgba(0,0,0,.3),0 12px 22px rgba(0,0,0,.3),inset 0 0 0 4px rgba(15,23,42,.55)}',
    '@media (max-width:520px){.mw-card{padding:14px 14px}.mw-grid{gap:7px}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 사운드 (다른 미니게임과 동일한 WebAudio 패턴) ─────────────────────────────
let _mwAC = null;
function _mwPlayHit(combo) {
  try {
    if (!_mwAC) _mwAC = new (window.AudioContext || window.webkitAudioContext)();
    const notes = combo >= 8 ? [523, 659, 784, 1047] : combo >= 4 ? [523, 659, 784] : [659, 880];
    notes.forEach((f, i) => {
      setTimeout(() => {
        const o = _mwAC.createOscillator(), g = _mwAC.createGain();
        o.connect(g); g.connect(_mwAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.14, _mwAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _mwAC.currentTime + 0.2);
        o.start(); o.stop(_mwAC.currentTime + 0.2);
      }, i * 55);
    });
  } catch (e) {}
}
function _mwPlayWrong() {
  try {
    if (!_mwAC) _mwAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _mwAC.createOscillator(), g = _mwAC.createGain();
    o.connect(g); g.connect(_mwAC.destination);
    o.frequency.value = 150; o.type = 'sawtooth';
    g.gain.setValueAtTime(0.09, _mwAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _mwAC.currentTime + 0.2);
    o.start(); o.stop(_mwAC.currentTime + 0.2);
  } catch (e) {}
}

// ─── 상태 ────────────────────────────────────────────────────────────────────
const _MW_TIME_LIMIT = 100; // 초 — 다른 매칭 게임과 동일
const _MW_MIN_POOL = 5; // 최소 이 인원(사진 보유) 이상이어야 게임 진행 가능
// ─── 난이도 설정 ──────────────────────────────────────────────────────────────
// grid: 보드 한 변 칸 수(3=3x3, 5=5x5). maxUp: 동시에 튀어나올 수 있는 두더지 수.
// spawnChance: 틱마다 새 두더지가 튀어나올 확률. holeUp: 두더지가 버티는 시간(ms).
// targetChance: 튀어나온 두더지가 "정답(문제 사진)"일 확률 — 낮을수록 헷갈림.
const _MW_DIFFICULTIES = {
  easy: { key: 'easy', label: '쉬움',   emoji: '🐹', grid: 4, maxUp: 5,  spawnChance: 0.6,  holeUp: 850, targetChance: 0.4 },
  hard: { key: 'hard', label: '어려움', emoji: '🔥', grid: 6, maxUp: 13, spawnChance: 0.9,  holeUp: 480, targetChance: 0.16 },
};
const _MW_DIFF_ORDER = ['easy', 'hard'];
const _MW_SPAWN_TICK = 120; // ms — 스폰 판정 주기 (짧을수록 더 빠르게 튀어나옴)
const _MW_RECENT_AVOID = 3; // 최근 이만큼의 사진은 연속으로 다시 뽑지 않음(같은 얼굴 반복 방지) — 값을 키울수록 같은 프로필이 더 오래 안 나옴

function _mwReadStoredDifficulty() {
  try {
    const v = localStorage.getItem('su_mw_diff');
    if (v && _MW_DIFFICULTIES[v]) return v;
  } catch (e) {}
  return 'easy';
}

window._mwState = window._mwState || {
  difficulty: _mwReadStoredDifficulty(),
  pool: [], grid: 0, holes: [], target: null,
  score: 0, combo: 0, bestCombo: 0, hits: 0,
  timeLeft: _MW_TIME_LIMIT, running: false, ended: false,
  timerId: null, spawnTimerId: null, uidSeq: 1,
  statusText: '위 사진과 같은 얼굴의 두더지가 튀어나오면 재빨리 클릭하세요!',
  statusTone: 'info',
};

function _mwDiffObj() {
  return _MW_DIFFICULTIES[window._mwState.difficulty] || _MW_DIFFICULTIES.easy;
}

function _mwSetDifficulty(key) {
  if (!_MW_DIFFICULTIES[key]) return;
  const st = window._mwState;
  st.difficulty = key;
  try { localStorage.setItem('su_mw_diff', key); } catch (e) {}
  _mwStart();
}
window._mwSetDifficulty = _mwSetDifficulty;

function _mwDiffBarHTML() {
  const st = window._mwState;
  return _MW_DIFF_ORDER.map(k => {
    const d = _MW_DIFFICULTIES[k];
    const on = st.difficulty === k;
    return `<button class="mw-diff-pill${on ? ' on' : ''}" onclick="_mwSetDifficulty('${k}')">${d.emoji} ${d.label} (${d.grid}x${d.grid})</button>`;
  }).join('');
}

function _mwBestScore(diffKey) {
  const key = diffKey || window._mwState.difficulty || 'easy';
  try { return parseInt(localStorage.getItem('su_mw_best_' + key) || '0', 10) || 0; } catch (e) { return 0; }
}
function _mwSaveBest(v, diffKey) {
  const key = diffKey || window._mwState.difficulty || 'easy';
  try { localStorage.setItem('su_mw_best_' + key, String(v)); } catch (e) {}
}

// ─── 선수 풀 구성 ─────────────────────────────────────────────────────────────
function _mwBuildPool() {
  const players = Array.isArray(window.players) ? window.players : [];
  const seen = new Set();
  const pool = [];
  players.forEach(p => {
    if (!p || p.hidden || p.retired || p.hideFromBoard || !p.photo) return;
    if (String(p.univ || '').trim() === 'YB') return;
    const name = String(p.name || '').trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    pool.push({ name, photo: p.photo });
  });
  return pool;
}

function _mwEsc(s) {
  return (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s);
}
function _mwUrl(u) {
  return (typeof toHttpsUrl === 'function') ? toHttpsUrl(u) : u;
}

// ─── 문제(목표) 선정 ──────────────────────────────────────────────────────────
// 최근 _MW_RECENT_AVOID 만큼의 이름과 다른 선수만 후보에서 골라낸다.
// 후보가 없으면(풀이 너무 작은 경우) 전체에서 뽑는다.
function _mwPickTarget() {
  const st = window._mwState;
  if (!st.pool.length) { st.target = null; return; }
  const recent = st.recentNames || [];
  const candidates = st.pool.filter(p => !recent.includes(p.name));
  const src = candidates.length ? candidates : st.pool;
  const picked = src[Math.floor(Math.random() * src.length)];
  st.target = picked;
  if (st.target) _mwRememberRecent(st.target.name);
}

function _mwRandomPlayer(excludeNames) {
  const st = window._mwState;
  const ex = Array.isArray(excludeNames) ? excludeNames.filter(Boolean) : (excludeNames ? [excludeNames] : []);
  const recent = st.recentNames || [];
  let candidates = ex.length ? st.pool.filter(p => !ex.includes(p.name)) : st.pool.slice();
  const filtered = candidates.filter(p => !recent.includes(p.name));
  // 후보가 없으면 제외 목록만 지키고 최근 목록은 무시(풀이 작을 때를 대비한 완화 단계)
  const src = filtered.length ? filtered : (candidates.length ? candidates : st.pool);
  const picked = src[Math.floor(Math.random() * src.length)];
  if (picked) _mwRememberRecent(picked.name);
  return picked;
}

function _mwRememberRecent(name) {
  const st = window._mwState;
  const cur = (st.recentNames || []).filter(n => n !== name);
  st.recentNames = [name, ...cur].slice(0, _MW_RECENT_AVOID);
}

// ─── 보드/타이머 ──────────────────────────────────────────────────────────────
function _mwClearHoleTimeouts() {
  const st = window._mwState;
  (st.holes || []).forEach(h => { if (h && h.timeoutId) clearTimeout(h.timeoutId); });
}

function _mwNewBoard() {
  const st = window._mwState;
  if (st.spawnTimerId) { clearInterval(st.spawnTimerId); st.spawnTimerId = null; }
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  _mwClearHoleTimeouts();

  st.pool = _mwBuildPool();
  st.score = 0;
  st.combo = 0;
  st.bestCombo = 0;
  st.hits = 0;
  st.timeLeft = _MW_TIME_LIMIT;
  st.running = false;
  st.ended = false;
  st.recentNames = []; // 새 게임 시작 시 최근 메모리 초기화
  st.lastSpawnPos = null; // 새 게임 시작 시 마지막 스폰 위치 초기화
  st.lastSpawnedName = null; // 새 게임 시작 시 마지막으로 튀어나온 얼굴 초기화 (연속 동일 프로필 방지용)
  st.statusText = '위 사진과 같은 얼굴의 두더지가 튀어나오면 재빨리 클릭하세요!';
  st.statusTone = 'info';

  if (st.pool.length < _MW_MIN_POOL) {
    st.grid = 0; st.holes = []; st.target = null;
    return;
  }
  st.grid = _mwDiffObj().grid;
  st.holes = new Array(st.grid * st.grid).fill(null);
  st.target = null;
  _mwPickTarget();
}

function _mwStart() {
  const st = window._mwState;
  _mwNewBoard();
  _mwRenderRoot();
  if (!st.grid) return;
  st.running = true;
  st.timerId = setInterval(_mwTick, 1000);
  st.spawnTimerId = setInterval(_mwSpawnTick, _MW_SPAWN_TICK);
}
window._mwStart = _mwStart;

function _mwTick() {
  const st = window._mwState;
  if (!st.running) return;
  st.timeLeft--;
  const chip = document.getElementById('mw-time-chip');
  if (chip) {
    chip.textContent = `⏱️ 남은 시간 ${st.timeLeft}초`;
    chip.classList.toggle('is-time-low', st.timeLeft <= 15);
  }
  if (st.timeLeft <= 0) _mwEndGame();
}

function _mwEndGame() {
  const st = window._mwState;
  st.running = false;
  st.ended = true;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.spawnTimerId) { clearInterval(st.spawnTimerId); st.spawnTimerId = null; }
  _mwClearHoleTimeouts();
  if (st.holes && st.holes.length) st.holes.fill(null); // 남아있던 두더지 이미지 제거 (안 사라지는 버그 수정)
  if (st.score > _mwBestScore()) _mwSaveBest(st.score);
  _mwRenderRoot();
}

function _mwCleanup() {
  const st = window._mwState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.spawnTimerId) { clearInterval(st.spawnTimerId); st.spawnTimerId = null; }
  _mwClearHoleTimeouts();
  if (st.holes && st.holes.length) st.holes.fill(null); // 탭 이동 시 튀어나와 있던 두더지 이미지 제거 (재진입 시 안 사라지는 버그 수정)
  st.running = false;
}
window._mwCleanup = _mwCleanup;

// ─── 두더지 스폰 ──────────────────────────────────────────────────────────────
function _mwSpawnTick() {
  const st = window._mwState;
  if (!st.running || !st.grid) return;
  const diff = _mwDiffObj();
  const activeCount = st.holes.reduce((n, h) => n + (h ? 1 : 0), 0);
  if (activeCount >= diff.maxUp) return;
  if (Math.random() >= diff.spawnChance) return;

  const emptyIdx = [];
  st.holes.forEach((h, i) => { if (!h) emptyIdx.push(i); });
  if (!emptyIdx.length) return;
  // 가능한 경우 직전 스폰 위치와 다른 칸에서 등장하도록 (연속 같은 위치 방지)
  const lastPos = st.lastSpawnPos;
  let posCandidates = emptyIdx;
  if (lastPos != null && emptyIdx.length > 1) {
    const filtered = emptyIdx.filter(i => i !== lastPos);
    if (filtered.length) posCandidates = filtered;
  }
  const idx = posCandidates[Math.floor(Math.random() * posCandidates.length)];
  st.lastSpawnPos = idx;

  // 바로 직전에 튀어나왔던 얼굴과 같은 선수는 이번 스폰에서 제외 (2연속 동일 프로필 방지)
  const wantsTarget = st.target && Math.random() < diff.targetChance;
  const isTarget = wantsTarget && st.target.name !== st.lastSpawnedName;
  const player = isTarget
    ? st.target
    : _mwRandomPlayer([st.target ? st.target.name : null, st.lastSpawnedName]);
  if (!player) return;
  st.lastSpawnedName = player.name;

  const hole = {
    uid: st.uidSeq++,
    name: player.name,
    photo: player.photo,
    isTarget: !!(st.target && player.name === st.target.name),
    hitState: null,
  };
  hole.timeoutId = setTimeout(() => {
    const cur = st.holes[idx];
    if (cur && cur.uid === hole.uid) {
      st.holes[idx] = null;
      _mwRenderHole(idx);
    }
  }, diff.holeUp);

  st.holes[idx] = hole;
  _mwRenderHole(idx);
}

// ─── 클릭 처리 ───────────────────────────────────────────────────────────────
function _mwHit(idx) {
  const st = window._mwState;
  if (!st.running) return;
  const hole = st.holes[idx];
  if (!hole) return;
  if (hole.timeoutId) clearTimeout(hole.timeoutId);

  if (hole.isTarget) {
    st.combo = (st.combo || 0) + 1;
    st.bestCombo = Math.max(st.bestCombo || 0, st.combo);
    st.hits++;
    const comboBonus = Math.max(0, st.combo - 1) * 2;
    const gained = 10 + comboBonus;
    st.score += gained;
    st.statusText = `${_mwEsc(hole.name)} 두더지를 잡았습니다! +${gained}점${comboBonus ? ` · 콤보 보너스 +${comboBonus}` : ''}`;
    st.statusTone = 'good';
    hole.hitState = 'good';
    _mwPlayHit(st.combo);
    _mwPickTarget();
    _mwRenderTarget();
  } else {
    st.combo = 0;
    st.statusText = `앗, ${_mwEsc(hole.name)}은(는) 다른 선수예요. 콤보가 끊겼습니다.`;
    st.statusTone = 'bad';
    hole.hitState = 'bad';
    _mwPlayWrong();
  }
  _mwUpdateHud();
  _mwRenderHole(idx);
  setTimeout(() => {
    if (st.holes[idx] === hole) { st.holes[idx] = null; _mwRenderHole(idx); }
  }, 260);
}
window._mwHit = _mwHit;

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function _mwHoleHTML(idx) {
  const st = window._mwState;
  const hole = st.holes[idx];
  if (!hole) return `<div class="mw-hole" id="mw-hole-${idx}" onclick="_mwHit(${idx})"></div>`;
  const stateCls = hole.hitState ? ` is-${hole.hitState}` : ' is-up';
  const initial = _mwEsc(String(hole.name || '?').trim().slice(0, 1));
  const img = hole.photo
    ? `<img src="${_mwEsc(_mwUrl(hole.photo))}" alt="${_mwEsc(hole.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="mw-mole-fallback" style="display:none">${initial}</div>`
    : `<div class="mw-mole-fallback">${initial}</div>`;
  return `<div class="mw-hole${stateCls}" id="mw-hole-${idx}" onclick="_mwHit(${idx})"><div class="mw-mole">${img}</div></div>`;
}

function _mwRenderHole(idx) {
  const el = document.getElementById(`mw-hole-${idx}`);
  if (!el) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = _mwHoleHTML(idx);
  const next = tmp.firstElementChild;
  el.replaceWith(next);
}

function _mwGridHTML() {
  const st = window._mwState;
  let html = '';
  for (let i = 0; i < st.holes.length; i++) html += _mwHoleHTML(i);
  return html;
}

function _mwTargetHTML() {
  const st = window._mwState;
  if (!st.target) return `<div class="mw-target-fallback">?</div>`;
  const initial = _mwEsc(String(st.target.name || '?').trim().slice(0, 1));
  return st.target.photo
    ? `<img src="${_mwEsc(_mwUrl(st.target.photo))}" alt="${_mwEsc(st.target.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="mw-target-fallback" style="display:none">${initial}</div>`
    : `<div class="mw-target-fallback">${initial}</div>`;
}

function _mwRenderTarget() {
  const wrap = document.getElementById('mw-target-wrap');
  if (wrap) wrap.innerHTML = _mwTargetHTML();
}

function _mwUpdateHud() {
  const st = window._mwState;
  const scoreChip = document.querySelector('#mw-root .mw-hud-chip');
  if (scoreChip) scoreChip.textContent = `🏅 점수 ${st.score}`;
  const comboChip = document.querySelector('#mw-root .mw-hud-chip.is-combo');
  if (comboChip) comboChip.textContent = `🔥 콤보 ${st.combo || 0}`;
  const statusEl = document.getElementById('mw-status');
  if (statusEl) {
    statusEl.className = `mw-status is-${st.statusTone || 'info'}`;
    statusEl.textContent = st.statusText || '';
  }
}

function _mwRenderRoot() {
  const root = document.getElementById('mw-root');
  if (!root) return;
  const st = window._mwState;
  const best = _mwBestScore();

  if (!st.grid) {
    root.innerHTML = `<div class="mw-shell">
      <div class="mw-card">
        <div class="mw-head">
          <div>
            <div class="mw-title">🐹 두더지 잡기</div>
            <div class="mw-desc">문제로 나온 선수 사진과 같은 얼굴의 두더지만 클릭해서 잡는 게임입니다.</div>
          </div>
        </div>
        <div class="mw-diff-bar">${_mwDiffBarHTML()}</div>
        <div class="mw-empty-note">⚠️ 게임을 만들 만큼 프로필 사진이 등록된 선수가 부족합니다(최소 ${_MW_MIN_POOL}명 필요). 선수 데이터에 사진을 더 등록한 뒤 다시 시도해주세요.</div>
        <div class="mw-actions"><button class="mw-btn mw-btn-primary" onclick="_mwStart()">🔄 다시 확인</button></div>
      </div>
    </div>`;
    return;
  }

  const resultHTML = st.ended ? `<div class="mw-result">
    <span class="mw-result-emoji">🏆</span>
    <div class="mw-result-score">${st.score}점</div>
    <div class="mw-result-sub">최고 기록 ${Math.max(best, st.score)}점${st.score >= best && st.score > 0 ? ' · 신기록!' : ''} · 최고 콤보 ${Math.max(st.bestCombo || 0, st.combo || 0)} · 총 ${st.hits}마리 포획</div>
  </div>` : '';

  root.innerHTML = `<div class="mw-shell">
    <div class="mw-card">
      <div class="mw-head">
        <div>
          <div class="mw-title">🐹 두더지 잡기</div>
          <div class="mw-desc">위 사진과 <b>같은 얼굴</b>의 두더지가 튀어나오면 재빨리 클릭하세요! 다른 선수 두더지를 잘못 잡으면 콤보가 끊깁니다.</div>
        </div>
        <div class="mw-hud">
          <span class="mw-hud-chip">🏅 점수 ${st.score}</span>
          <span class="mw-hud-chip is-combo">🔥 콤보 ${st.combo || 0}</span>
          <span class="mw-hud-chip" id="mw-time-chip">⏱️ 남은 시간 ${st.timeLeft}초</span>
          <span class="mw-hud-chip">🥇 최고 ${best}</span>
        </div>
      </div>
      <div class="mw-diff-bar">${_mwDiffBarHTML()}</div>
      <div class="mw-actions">
        <button class="mw-btn mw-btn-primary" onclick="_mwStart()">${st.ended ? '🔄 다시하기' : '🔀 새로 시작'}</button>
      </div>
      ${resultHTML}
      <div class="mw-target-row">
        <div class="mw-target-label">🎯 이 얼굴을 찾아 두더지를 잡으세요!</div>
        <div class="mw-target-wrap" id="mw-target-wrap">${_mwTargetHTML()}</div>
      </div>
      <div class="mw-status is-${_mwEsc(st.statusTone || 'info')}" id="mw-status">${_mwEsc(st.statusText || '')}</div>
      <div class="mw-stage">
        <div class="mw-grid" id="mw-grid" style="--mw-cols:${st.grid}">${_mwGridHTML()}</div>
      </div>
    </div>
  </div>`;
}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _mwInit() {
  const st = window._mwState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.spawnTimerId) { clearInterval(st.spawnTimerId); st.spawnTimerId = null; }
  if (!st.grid && !st.pool.length) { _mwStart(); return; }
  if (!st.grid) { _mwRenderRoot(); return; }
  st.running = !st.ended;
  _mwRenderRoot();
  if (st.running) {
    st.timerId = setInterval(_mwTick, 1000);
    st.spawnTimerId = setInterval(_mwSpawnTick, _MW_SPAWN_TICK);
  }
}
window._mwInit = _mwInit;
