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
    '.ti-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:24px;box-shadow:0 18px 38px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.9);padding:18px 20px}',
    '.ti-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
    '.ti-title{font-size:16px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}',
    '.ti-desc{margin-top:5px;font-size:12px;line-height:1.6;color:var(--text3)}',
    '.ti-hud{display:flex;gap:8px;flex-wrap:wrap}',
    '.ti-hud-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.18);font-size:12px;font-weight:900;color:var(--text2);box-shadow:0 8px 16px rgba(15,23,42,.05);white-space:nowrap}',
    '.ti-hud-chip.is-time-low{background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#fca5a5;color:#b91c1c;animation:tiPulse 1s ease-in-out infinite}',
    '@keyframes tiPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}',
    '.ti-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
    '.ti-btn{padding:10px 18px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.05);font-family:inherit;transition:.12s}',
    '.ti-btn:hover{border-color:rgba(37,99,235,.25);color:#2563eb}',
    '.ti-btn.ti-btn-primary{background:linear-gradient(135deg,#fb7185,#f43f5e 52%,#ec4899);color:#fff;border:none;box-shadow:0 7px 0 #9f1239,0 16px 26px rgba(244,63,94,.22)}',
    '.ti-btn.ti-btn-primary:hover{color:#fff;transform:translateY(-1px)}',
    '.ti-stage{position:relative;margin-top:14px}',
    '.ti-grid{display:grid;grid-template-columns:repeat(var(--ti-cols,8),1fr);gap:7px;position:relative;touch-action:none;-webkit-user-select:none;user-select:none;border-radius:16px}',
    '.ti-cell{position:relative;aspect-ratio:1/1;border-radius:18px;overflow:hidden;background:var(--ti-cell-color,#f1f5f9);box-shadow:0 2px 0 rgba(15,23,42,.10),0 5px 10px rgba(15,23,42,.10),inset 0 0 0 3px rgba(255,255,255,.85);animation:tiDropIn .28s ease both;transition:transform .12s}',
    '.ti-cell.ti-empty{box-shadow:none;background:transparent;animation:none}',
    '.ti-cell.ti-sel{outline:3px solid #2563eb;outline-offset:-2px;filter:brightness(1.06);transform:scale(1.05)}',
    '.ti-cell.ti-invalid{animation:tiShake .32s ease}',
    '.ti-cell.ti-clear{animation:tiPopOut .26s ease forwards}',
    '.ti-cell img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;border-radius:15px}',
    '.ti-cell-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;color:#fff;pointer-events:none}',
    '.ti-selbox{position:absolute;border:2px dashed #2563eb;background:rgba(37,99,235,.10);border-radius:8px;pointer-events:none;z-index:5;display:none}',
    '.ti-result{background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:1px solid rgba(251,113,133,.28);border-radius:22px;padding:22px 20px;text-align:center;margin-top:14px;animation:tiPopIn .4s cubic-bezier(.175,.885,.32,1.35)}',
    '.ti-result-emoji{font-size:44px;display:block;margin-bottom:4px}',
    '.ti-result-score{font-size:clamp(24px,5vw,34px);font-weight:900;color:#C0274A;margin:4px 0 4px}',
    '.ti-result-sub{font-size:12px;color:var(--text3)}',
    '.ti-empty-note{font-size:12px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 12px;margin-top:10px;line-height:1.6}',
    '@keyframes tiDropIn{from{opacity:0;transform:translateY(-14px) scale(.85)}to{opacity:1;transform:translateY(0) scale(1)}}',
    '@keyframes tiPopOut{to{opacity:0;transform:scale(.55)}}',
    '@keyframes tiShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}',
    '@keyframes tiPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}',
    'body.dark .ti-card,body.dark .ti-result{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}',
    'body.dark .ti-hud-chip,body.dark .ti-btn{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .ti-title{color:#f8fafc}',
    'body.dark .ti-desc{color:#94a3b8}',
    'body.dark .ti-cell{box-shadow:0 2px 0 rgba(0,0,0,.3),0 5px 10px rgba(0,0,0,.3),inset 0 0 0 3px rgba(15,23,42,.55)}',
    '@media (max-width:520px){.ti-card{padding:14px 14px}}',
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
const _TI_TIME_LIMIT = 110; // 초 (기존 100초 → 여유 있게 조정)
window._tiState = window._tiState || {
  cols: 0, rows: 0, board: null, tierPool: [], tierBags: {},
  score: 0, timeLeft: _TI_TIME_LIMIT, running: false, ended: false,
  timerId: null, dragging: false, selStart: null, selCur: null, uidSeq: 1,
};

function _tiCols() { return (window.innerWidth || 375) >= 700 ? 8 : 5; }
function _tiRows() { return (window.innerWidth || 375) >= 700 ? 7 : 8; }

function _tiBestScore() {
  try { return parseInt(localStorage.getItem('su_tier_best') || '0', 10) || 0; } catch (e) { return 0; }
}
function _tiSaveBest(v) {
  try { localStorage.setItem('su_tier_best', String(v)); } catch (e) {}
}

// ─── 티어 풀 구성 ─────────────────────────────────────────────────────────
function _tiBuildTierPool() {
  const players = Array.isArray(window.players) ? window.players : [];
  const pool = {};
  players.forEach(p => {
    if (!p || p.hidden || p.retired || p.hideFromBoard) return;
    if (String(p.univ || '').trim() === 'YB') return;
    const t = String(p.tier || '').trim();
    if (!t || t === '?' || t === '미정' || t === '미확인') return;
    if (!p.photo) return;
    if (!pool[t]) pool[t] = [];
    pool[t].push({ name: String(p.name || '').trim(), photo: p.photo });
  });
  let teams = Object.keys(pool).map(t => ({
    tier: t,
    color: (typeof getTierBtnColor === 'function') ? getTierBtnColor(t) : '#6b7280',
    players: pool[t],
  }));
  // 셔플(티어 등장 순서를 매판마다 다르게)
  for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
  }
  // 티어 종류가 너무 많으면 판이 어수선해져서 매칭이 어려워지므로 최대 8종류만 사용
  if (teams.length > 8) teams = teams.slice(0, 8);
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
    st.tierBags[tierIdx] = bag;
  }
  const picked = bag.pop();
  return picked;
}

function _tiRandomCell() {
  const st = window._tiState;
  const tierIdx = Math.floor(Math.random() * st.tierPool.length);
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
  st.timeLeft = _TI_TIME_LIMIT;
  st.running = false;
  st.ended = false;
  st.dragging = false;
  st.selStart = null;
  st.selCur = null;
  if (st.tierPool.length < 2) { st.board = null; return; }
  st.board = [];
  for (let r = 0; r < st.rows; r++) {
    const row = [];
    for (let c = 0; c < st.cols; c++) row.push(_tiRandomCell());
    st.board.push(row);
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
  const chip = document.getElementById('ti-time-chip');
  if (chip) {
    chip.textContent = `⏱️ 남은 시간 ${st.timeLeft}초`;
    chip.classList.toggle('is-time-low', st.timeLeft <= 15);
  }
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
        <div class="ti-head">
          <div>
            <div class="ti-title">🎖️ 티어 매칭</div>
            <div class="ti-desc">사각형으로 드래그해서 같은 티어 선수들만 모아 제거하는 매칭 게임입니다.</div>
          </div>
        </div>
        <div class="ti-empty-note">⚠️ 게임을 만들 만큼 티어 정보와 프로필 사진이 등록된 선수가 부족합니다(최소 2개 티어 필요). 선수 데이터에 티어/사진을 더 등록한 뒤 다시 시도해주세요.</div>
        <div class="ti-actions"><button class="ti-btn ti-btn-primary" onclick="_tiStart()">🔄 다시 확인</button></div>
      </div>
    </div>`;
    return;
  }

  const resultHTML = st.ended ? `<div class="ti-result">
    <span class="ti-result-emoji">🏆</span>
    <div class="ti-result-score">${st.score}점</div>
    <div class="ti-result-sub">최고 기록 ${Math.max(best, st.score)}점${st.score >= best && st.score > 0 ? ' · 신기록!' : ''}</div>
  </div>` : '';

  root.innerHTML = `<div class="ti-shell">
    <div class="ti-card">
      <div class="ti-head">
        <div>
          <div class="ti-title">🎖️ 티어 매칭</div>
          <div class="ti-desc">드래그해서 사각형을 그리세요. 안에 있는 선수 사진이 <b>전부 같은 티어</b>이면 사라지고 점수를 얻습니다. 다른 티어가 하나라도 섞이면 무효!</div>
        </div>
        <div class="ti-hud">
          <span class="ti-hud-chip">🏅 점수 ${st.score}</span>
          <span class="ti-hud-chip" id="ti-time-chip">⏱️ 남은 시간 ${st.timeLeft}초</span>
          <span class="ti-hud-chip">🥇 최고 ${best}</span>
        </div>
      </div>
      <div class="ti-actions">
        <button class="ti-btn ti-btn-primary" onclick="_tiStart()">${st.ended ? '🔄 다시하기' : '🔀 새로 섞기'}</button>
      </div>
      ${resultHTML}
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
  st.score += matched.length;
  _tiPlayMatch(matched.length);
  const scoreChip = document.querySelector('#ti-root .ti-hud-chip');
  if (scoreChip) scoreChip.textContent = `🏅 점수 ${st.score}`;

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

function _tiApplyGravity(minC, maxC) {
  const st = window._tiState;
  for (let c = minC; c <= maxC; c++) {
    const remaining = [];
    for (let r = 0; r < st.rows; r++) if (st.board[r][c]) remaining.push(st.board[r][c]);
    const removed = st.rows - remaining.length;
    const newCol = [];
    for (let i = 0; i < removed; i++) newCol.push(_tiRandomCell());
    for (const v of remaining) newCol.push(v);
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
