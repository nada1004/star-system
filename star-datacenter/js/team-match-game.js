/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('teammatch') 진입 시 동적으로 로드됨. */
// ─── 🧩 소속 매칭 게임 (같은 소속끼리 사각형으로 묶어서 제거) ──────────────────────
// 규칙: 드래그로 사각형을 그려서 그 안의 선수가 전부 같은 소속(대학/팀)이면 제거.
//       다른 소속이 하나라도 섞여있으면 무효. 제거된 자리는 위에서 새 선수가 떨어져 채움.

(function _tmInjectCSS() {
  if (document.getElementById('tm-style')) return;
  const s = document.createElement('style');
  s.id = 'tm-style';
  s.textContent = [
    '#tm-root{font-family:inherit;width:100%}',
    '.tm-shell{display:flex;flex-direction:column;gap:14px}',
    '.tm-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:24px;box-shadow:0 18px 38px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.9);padding:18px 20px}',
    '.tm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
    '.tm-title{font-size:16px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}',
    '.tm-desc{margin-top:5px;font-size:12px;line-height:1.6;color:var(--text3)}',
    '.tm-hud{display:flex;gap:8px;flex-wrap:wrap}',
    '.tm-hud-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.18);font-size:12px;font-weight:900;color:var(--text2);box-shadow:0 8px 16px rgba(15,23,42,.05);white-space:nowrap}',
    '.tm-hud-chip.is-time-low{background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#fca5a5;color:#b91c1c;animation:tmPulse 1s ease-in-out infinite}',
    '@keyframes tmPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}',
    '.tm-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
    '.tm-btn{padding:10px 18px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.05);font-family:inherit;transition:.12s}',
    '.tm-btn:hover{border-color:rgba(37,99,235,.25);color:#2563eb}',
    '.tm-btn.tm-btn-primary{background:linear-gradient(135deg,#fb7185,#f43f5e 52%,#ec4899);color:#fff;border:none;box-shadow:0 7px 0 #9f1239,0 16px 26px rgba(244,63,94,.22)}',
    '.tm-btn.tm-btn-primary:hover{color:#fff;transform:translateY(-1px)}',
    '.tm-stage{position:relative;margin-top:14px}',
    '.tm-grid{display:grid;grid-template-columns:repeat(var(--tm-cols,8),1fr);gap:7px;position:relative;touch-action:none;-webkit-user-select:none;user-select:none;border-radius:16px}',
    '.tm-cell{position:relative;aspect-ratio:1/1;border-radius:18px;overflow:hidden;background:var(--tm-cell-color,#f1f5f9);box-shadow:0 2px 0 rgba(15,23,42,.10),0 5px 10px rgba(15,23,42,.10),inset 0 0 0 3px rgba(255,255,255,.85);animation:tmDropIn .28s ease both;transition:transform .12s}',
    '.tm-cell.tm-empty{box-shadow:none;background:transparent;animation:none}',
    '.tm-cell.tm-sel{outline:3px solid #2563eb;outline-offset:-2px;filter:brightness(1.06);transform:scale(1.05)}',
    '.tm-cell.tm-invalid{animation:tmShake .32s ease}',
    '.tm-cell.tm-clear{animation:tmPopOut .26s ease forwards}',
    '.tm-cell img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;border-radius:15px}',
    '.tm-cell-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;color:#fff;pointer-events:none}',
    '.tm-selbox{position:absolute;border:2px dashed #2563eb;background:rgba(37,99,235,.10);border-radius:8px;pointer-events:none;z-index:5;display:none}',
    '.tm-result{background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:1px solid rgba(251,113,133,.28);border-radius:22px;padding:22px 20px;text-align:center;margin-top:14px;animation:tmPopIn .4s cubic-bezier(.175,.885,.32,1.35)}',
    '.tm-result-emoji{font-size:44px;display:block;margin-bottom:4px}',
    '.tm-result-score{font-size:clamp(24px,5vw,34px);font-weight:900;color:#C0274A;margin:4px 0 4px}',
    '.tm-result-sub{font-size:12px;color:var(--text3)}',
    '.tm-empty-note{font-size:12px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 12px;margin-top:10px;line-height:1.6}',
    '@keyframes tmDropIn{from{opacity:0;transform:translateY(-14px) scale(.85)}to{opacity:1;transform:translateY(0) scale(1)}}',
    '@keyframes tmPopOut{to{opacity:0;transform:scale(.55)}}',
    '@keyframes tmShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}',
    '@keyframes tmPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}',
    'body.dark .tm-card,body.dark .tm-result{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}',
    'body.dark .tm-hud-chip,body.dark .tm-btn{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .tm-title{color:#f8fafc}',
    'body.dark .tm-desc{color:#94a3b8}',
    'body.dark .tm-cell{box-shadow:0 2px 0 rgba(0,0,0,.3),0 5px 10px rgba(0,0,0,.3),inset 0 0 0 3px rgba(15,23,42,.55)}',
    '@media (max-width:520px){.tm-card{padding:14px 14px}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 사운드 ────────────────────────────────────────────────────────────────────
let _tmAC = null;
function _tmPlayMatch(n) {
  try {
    if (!_tmAC) _tmAC = new (window.AudioContext || window.webkitAudioContext)();
    // 제거된 칸 수가 많을수록 더 화려한 아르페지오
    const notes = n >= 6 ? [523, 659, 784, 1047] : n >= 4 ? [523, 659, 784] : [659, 880];
    notes.forEach((f, i) => {
      setTimeout(() => {
        const o = _tmAC.createOscillator(), g = _tmAC.createGain();
        o.connect(g); g.connect(_tmAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.14, _tmAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _tmAC.currentTime + 0.22);
        o.start(); o.stop(_tmAC.currentTime + 0.22);
      }, i * 70);
    });
  } catch (e) {}
}
function _tmPlayInvalid() {
  try {
    if (!_tmAC) _tmAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _tmAC.createOscillator(), g = _tmAC.createGain();
    o.connect(g); g.connect(_tmAC.destination);
    o.frequency.value = 160; o.type = 'sawtooth';
    g.gain.setValueAtTime(0.09, _tmAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _tmAC.currentTime + 0.18);
    o.start(); o.stop(_tmAC.currentTime + 0.18);
  } catch (e) {}
}

// ─── 상태 ────────────────────────────────────────────────────────────────────
const _TM_TIME_LIMIT = 110; // 초 (기존 100초 → 여유 있게 조정)
window._tmState = window._tmState || {
  cols: 0, rows: 0, board: null, teamPool: [], teamBags: {},
  score: 0, timeLeft: _TM_TIME_LIMIT, running: false, ended: false,
  timerId: null, dragging: false, selStart: null, selCur: null, uidSeq: 1,
};

function _tmCols() { return (window.innerWidth || 375) >= 700 ? 8 : 5; }
function _tmRows() { return (window.innerWidth || 375) >= 700 ? 7 : 8; }

function _tmBestScore() {
  try { return parseInt(localStorage.getItem('su_tm_best') || '0', 10) || 0; } catch (e) { return 0; }
}
function _tmSaveBest(v) {
  try { localStorage.setItem('su_tm_best', String(v)); } catch (e) {}
}

// ─── 팀(소속) 풀 구성 ─────────────────────────────────────────────────────────
function _tmBuildTeamPool() {
  const players = Array.isArray(window.players) ? window.players : [];
  const univCfgArr = (typeof univCfg !== 'undefined' && Array.isArray(univCfg)) ? univCfg : [];
  const dissolved = new Set(univCfgArr.filter(u => u && u.dissolved).map(u => u.name));
  const pool = {};
  players.forEach(p => {
    if (!p || p.hidden || p.retired || p.hideFromBoard) return;
    const u = String(p.univ || '').trim();
    if (!u || u === '무소속' || u === 'YB' || dissolved.has(u)) return;
    if (!p.photo) return;
    if (!pool[u]) pool[u] = [];
    pool[u].push({ name: String(p.name || '').trim(), photo: p.photo });
  });
  let teams = Object.keys(pool).map(u => ({
    univ: u,
    color: (typeof gc === 'function') ? gc(u) : '#6b7280',
    players: pool[u],
  }));
  // 셔플 후 최대 8개 팀만 사용 (너무 많으면 색 구분이 어려워지고 매칭도 어려워짐)
  for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
  }
  if (teams.length > 8) teams = teams.slice(0, 8);
  return teams;
}

// 팀별로 "가방(bag)" 방식 셔플 큐를 유지해서 같은 선수 사진이 너무 몰리지 않게 함
function _tmDrawFromTeam(teamIdx) {
  const st = window._tmState;
  const team = st.teamPool[teamIdx];
  let bag = st.teamBags[teamIdx];
  if (!bag || !bag.length) {
    bag = team.players.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    st.teamBags[teamIdx] = bag;
  }
  const picked = bag.pop();
  return picked;
}

function _tmRandomCell() {
  const st = window._tmState;
  const teamIdx = Math.floor(Math.random() * st.teamPool.length);
  const team = st.teamPool[teamIdx];
  const picked = _tmDrawFromTeam(teamIdx);
  return {
    uid: st.uidSeq++,
    univ: team.univ,
    color: team.color,
    name: picked.name,
    photo: picked.photo,
  };
}

// ─── 보드 초기화 ──────────────────────────────────────────────────────────────
function _tmNewBoard() {
  const st = window._tmState;
  st.teamPool = _tmBuildTeamPool();
  st.teamBags = {};
  st.cols = _tmCols();
  st.rows = _tmRows();
  st.score = 0;
  st.timeLeft = _TM_TIME_LIMIT;
  st.running = false;
  st.ended = false;
  st.dragging = false;
  st.selStart = null;
  st.selCur = null;
  if (st.teamPool.length < 2) { st.board = null; return; }
  st.board = [];
  for (let r = 0; r < st.rows; r++) {
    const row = [];
    for (let c = 0; c < st.cols; c++) row.push(_tmRandomCell());
    st.board.push(row);
  }
}

function _tmStart() {
  const st = window._tmState;
  _tmNewBoard();
  if (!st.board) { _tmRenderRoot(); return; }
  st.running = true;
  _tmRenderRoot();
  if (st.timerId) clearInterval(st.timerId);
  st.timerId = setInterval(_tmTick, 1000);
}

function _tmTick() {
  const st = window._tmState;
  if (!st.running) return;
  st.timeLeft--;
  const chip = document.getElementById('tm-time-chip');
  if (chip) {
    chip.textContent = `⏱️ 남은 시간 ${st.timeLeft}초`;
    chip.classList.toggle('is-time-low', st.timeLeft <= 15);
  }
  if (st.timeLeft <= 0) _tmEndGame();
}

function _tmEndGame() {
  const st = window._tmState;
  st.running = false;
  st.ended = true;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.score > _tmBestScore()) _tmSaveBest(st.score);
  _tmRenderRoot();
}

function _tmCleanup() {
  const st = window._tmState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  st.running = false;
  st.dragging = false;
}
window._tmCleanup = _tmCleanup;

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function _tmEsc(s) {
  return (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s);
}
function _tmUrl(u) {
  return (typeof toHttpsUrl === 'function') ? toHttpsUrl(u) : u;
}
const _TM_CUTE_COLORS = ['#FFD6E8', '#D6F0FF', '#FFF3C4', '#DAFBD9', '#E7DBFF', '#FFE1CC', '#D6FFF3', '#F6D9FF'];
function _tmCuteColor(uid) {
  return _TM_CUTE_COLORS[uid % _TM_CUTE_COLORS.length];
}

function _tmCellHTML(cell) {
  if (!cell) return `<div class="tm-cell tm-empty"></div>`;
  const cute = _tmCuteColor(cell.uid);
  const initial = _tmEsc(String(cell.name || '?').trim().slice(0, 1));
  const img = cell.photo
    ? `<img src="${_tmEsc(_tmUrl(cell.photo))}" alt="${_tmEsc(cell.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="tm-cell-fallback" style="display:none;background:${cute}">${initial}</div>`
    : `<div class="tm-cell-fallback" style="background:${cute}">${initial}</div>`;
  return `<div class="tm-cell" data-uid="${cell.uid}" style="--tm-cell-color:${cute}">
    ${img}
  </div>`;
}

function _tmGridHTML() {
  const st = window._tmState;
  if (!st.board) return '';
  let html = '';
  for (let r = 0; r < st.rows; r++) {
    for (let c = 0; c < st.cols; c++) html += _tmCellHTML(st.board[r][c]);
  }
  return html;
}

function _tmRenderRoot() {
  const root = document.getElementById('tm-root');
  if (!root) return;
  const st = window._tmState;
  const best = _tmBestScore();

  if (!st.board && !st.ended) {
    root.innerHTML = `<div class="tm-shell">
      <div class="tm-card">
        <div class="tm-head">
          <div>
            <div class="tm-title">🧩 소속 매칭</div>
            <div class="tm-desc">사각형으로 드래그해서 같은 소속(팀) 선수들만 모아 제거하는 매칭 게임입니다.</div>
          </div>
        </div>
        <div class="tm-empty-note">⚠️ 게임을 만들 만큼 소속(팀) 정보와 프로필 사진이 등록된 선수가 부족합니다. 선수 데이터에 소속/사진을 더 등록한 뒤 다시 시도해주세요.</div>
        <div class="tm-actions"><button class="tm-btn tm-btn-primary" onclick="_tmStart()">🔄 다시 확인</button></div>
      </div>
    </div>`;
    return;
  }

  const resultHTML = st.ended ? `<div class="tm-result">
    <span class="tm-result-emoji">🏆</span>
    <div class="tm-result-score">${st.score}점</div>
    <div class="tm-result-sub">최고 기록 ${Math.max(best, st.score)}점${st.score >= best && st.score > 0 ? ' · 신기록!' : ''}</div>
  </div>` : '';

  root.innerHTML = `<div class="tm-shell">
    <div class="tm-card">
      <div class="tm-head">
        <div>
          <div class="tm-title">🧩 소속 매칭</div>
          <div class="tm-desc">드래그해서 사각형을 그리세요. 안에 있는 선수 사진이 <b>전부 같은 소속</b>이면 사라지고 점수를 얻습니다. 다른 소속이 하나라도 섞이면 무효!</div>
        </div>
        <div class="tm-hud">
          <span class="tm-hud-chip">🏅 점수 ${st.score}</span>
          <span class="tm-hud-chip" id="tm-time-chip">⏱️ 남은 시간 ${st.timeLeft}초</span>
          <span class="tm-hud-chip">🥇 최고 ${best}</span>
        </div>
      </div>
      <div class="tm-actions">
        <button class="tm-btn tm-btn-primary" onclick="_tmStart()">${st.ended ? '🔄 다시하기' : '🔀 새로 섞기'}</button>
      </div>
      ${resultHTML}
      <div class="tm-stage">
        <div class="tm-selbox" id="tm-selbox"></div>
        <div class="tm-grid" id="tm-grid" style="--tm-cols:${st.cols}">${_tmGridHTML()}</div>
      </div>
    </div>
  </div>`;

  _tmAttachPointerHandlers();
}

// ─── 드래그 선택 로직 ─────────────────────────────────────────────────────────
function _tmCellFromPoint(gridEl, clientX, clientY) {
  const st = window._tmState;
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

function _tmUpdateSelectionVisual() {
  const st = window._tmState;
  const gridEl = document.getElementById('tm-grid');
  const boxEl = document.getElementById('tm-selbox');
  if (!gridEl || !boxEl || !st.selStart || !st.selCur) return;
  const minR = Math.min(st.selStart.r, st.selCur.r), maxR = Math.max(st.selStart.r, st.selCur.r);
  const minC = Math.min(st.selStart.c, st.selCur.c), maxC = Math.max(st.selStart.c, st.selCur.c);

  gridEl.querySelectorAll('.tm-cell').forEach((el, idx) => {
    const r = Math.floor(idx / st.cols), c = idx % st.cols;
    el.classList.toggle('tm-sel', r >= minR && r <= maxR && c >= minC && c <= maxC);
  });

  const cellW = gridEl.clientWidth / st.cols;
  const cellH = gridEl.clientHeight / st.rows;
  boxEl.style.display = 'block';
  boxEl.style.left = (minC * cellW) + 'px';
  boxEl.style.top = (minR * cellH) + 'px';
  boxEl.style.width = ((maxC - minC + 1) * cellW) + 'px';
  boxEl.style.height = ((maxR - minR + 1) * cellH) + 'px';
}

function _tmClearSelectionVisual() {
  const gridEl = document.getElementById('tm-grid');
  const boxEl = document.getElementById('tm-selbox');
  if (gridEl) gridEl.querySelectorAll('.tm-cell.tm-sel').forEach(el => el.classList.remove('tm-sel'));
  if (boxEl) boxEl.style.display = 'none';
}

function _tmFinishSelection() {
  const st = window._tmState;
  if (!st.selStart || !st.selCur) return;
  const minR = Math.min(st.selStart.r, st.selCur.r), maxR = Math.max(st.selStart.r, st.selCur.r);
  const minC = Math.min(st.selStart.c, st.selCur.c), maxC = Math.max(st.selStart.c, st.selCur.c);
  st.selStart = null; st.selCur = null; st.dragging = false;
  _tmClearSelectionVisual();
  if (!st.running) return;

  const cells = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const cell = st.board[r][c];
      if (cell) cells.push({ r, c, cell });
    }
  }
  if (cells.length < 2) return;

  const firstUniv = String(cells[0]?.cell?.univ || '').trim();
  const matched = cells.filter(({ cell }) => String(cell?.univ || '').trim() === firstUniv);
  const gridEl = document.getElementById('tm-grid');
  if (!firstUniv || matched.length !== cells.length) {
    // 박스 안 전체가 같은 소속이 아니면 무효 처리
    _tmPlayInvalid();
    if (gridEl) {
      cells.forEach(({ r, c }) => {
        const idx = r * st.cols + c;
        const el = gridEl.children[idx];
        if (el) el.classList.add('tm-invalid');
      });
      setTimeout(() => {
        cells.forEach(({ r, c }) => {
          const idx = r * st.cols + c;
          const el = gridEl.children[idx];
          if (el) el.classList.remove('tm-invalid');
        });
      }, 320);
    }
    return;
  }

  // 유효한 매칭: 점수 추가 + 제거 애니메이션 후 낙하 보충 (매칭된 셀만)
  st.score += matched.length;
  _tmPlayMatch(matched.length);
  const scoreChip = document.querySelector('#tm-root .tm-hud-chip');
  if (scoreChip) scoreChip.textContent = `🏅 점수 ${st.score}`;

  if (gridEl) {
    matched.forEach(({ r, c }) => {
      const idx = r * st.cols + c;
      const el = gridEl.children[idx];
      if (el) el.classList.add('tm-clear');
    });
  }
  setTimeout(() => {
    matched.forEach(({ r, c }) => { st.board[r][c] = null; });
    _tmApplyGravity(minC, maxC);
    _tmRenderRoot();
  }, 220);
}

function _tmApplyGravity(minC, maxC) {
  const st = window._tmState;
  for (let c = minC; c <= maxC; c++) {
    const remaining = [];
    for (let r = 0; r < st.rows; r++) if (st.board[r][c]) remaining.push(st.board[r][c]);
    const removed = st.rows - remaining.length;
    const newCol = [];
    for (let i = 0; i < removed; i++) newCol.push(_tmRandomCell());
    for (const v of remaining) newCol.push(v);
    for (let r = 0; r < st.rows; r++) st.board[r][c] = newCol[r];
  }
}

function _tmAttachPointerHandlers() {
  const gridEl = document.getElementById('tm-grid');
  if (!gridEl || gridEl._tmBound) return;
  gridEl._tmBound = true;

  const onDown = (e) => {
    const st = window._tmState;
    if (!st.running) return;
    const p = e.touches ? e.touches[0] : e;
    const cell = _tmCellFromPoint(gridEl, p.clientX, p.clientY);
    st.dragging = true;
    st.selStart = cell;
    st.selCur = cell;
    _tmUpdateSelectionVisual();
    e.preventDefault();
  };
  const onMove = (e) => {
    const st = window._tmState;
    if (!st.dragging) return;
    const p = e.touches ? e.touches[0] : e;
    st.selCur = _tmCellFromPoint(gridEl, p.clientX, p.clientY);
    _tmUpdateSelectionVisual();
    e.preventDefault();
  };
  const onUp = () => {
    const st = window._tmState;
    if (!st.dragging) return;
    _tmFinishSelection();
  };

  gridEl.addEventListener('pointerdown', onDown);
  gridEl.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  gridEl.addEventListener('touchstart', onDown, { passive: false });
  gridEl.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);
}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _tmInit() {
  const st = window._tmState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (!st.board) { _tmStart(); return; }
  st.running = !st.ended;
  _tmRenderRoot();
  if (st.running) st.timerId = setInterval(_tmTick, 1000);
}
window._tmInit = _tmInit;
window._tmStart = _tmStart;
