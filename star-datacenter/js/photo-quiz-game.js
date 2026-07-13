/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('quiz') 진입 시 동적으로 로드됨. */
// ─── 🖼️ 선수 얼굴 맞추기 퀴즈 ────────────────────────────────────────────────
// 규칙: 사진을 보고 4개의 이름 보기 중 정답을 고르는 시간제한 퀴즈.
//       맞히면 점수 획득 + 콤보 증가, 틀리면 콤보 초기화하고 정답을 잠깐 보여줌.

(function _pqInjectCSS() {
  if (document.getElementById('pq-style')) return;
  const s = document.createElement('style');
  s.id = 'pq-style';
  s.textContent = [
    '#pq-root{font-family:inherit;width:100%}',
    '.pq-shell{display:flex;flex-direction:column;gap:14px}',
    '.pq-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:24px;box-shadow:0 18px 38px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.9);padding:18px 20px}',
    '.pq-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}',
    '.pq-title{font-size:16px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}',
    '.pq-desc{margin-top:5px;font-size:12px;line-height:1.6;color:var(--text3)}',
    '.pq-hud{display:flex;gap:8px;flex-wrap:wrap}',
    '.pq-hud-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.18);font-size:12px;font-weight:900;color:var(--text2);box-shadow:0 8px 16px rgba(15,23,42,.05);white-space:nowrap}',
    '.pq-hud-chip.is-time-low{background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#fca5a5;color:#b91c1c;animation:pqPulse 1s ease-in-out infinite}',
    '.pq-hud-chip.is-combo{background:linear-gradient(135deg,#fef9c3,#fde68a);border-color:#fcd34d;color:#92400e}',
    '@keyframes pqPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}',
    '.pq-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
    '.pq-btn{padding:10px 18px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.05);font-family:inherit;transition:.12s}',
    '.pq-btn:hover{border-color:rgba(37,99,235,.25);color:#2563eb}',
    '.pq-btn.pq-btn-primary{background:linear-gradient(135deg,#60a5fa,#3b82f6 52%,#6366f1);color:#fff;border:none;box-shadow:0 7px 0 #1e3a8a,0 16px 26px rgba(59,130,246,.22)}',
    '.pq-btn.pq-btn-primary:hover{color:#fff;transform:translateY(-1px)}',
    '.pq-stage{margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:16px}',
    '.pq-photo-wrap{width:min(220px,60vw);aspect-ratio:1/1;border-radius:26px;overflow:hidden;background:#f1f5f9;box-shadow:0 4px 0 rgba(15,23,42,.10),0 12px 26px rgba(15,23,42,.12),inset 0 0 0 4px rgba(255,255,255,.9);position:relative;animation:pqPhotoIn .3s ease both}',
    '.pq-photo-wrap img{width:100%;height:100%;object-fit:cover;display:block;filter:blur(0px);transform:scale(1.08);transition:filter .35s ease}',
    '.pq-stage-badge{position:absolute;left:8px;top:8px;padding:3px 9px;border-radius:999px;background:rgba(15,23,42,.6);color:#fff;font-size:10px;font-weight:800;letter-spacing:.02em;pointer-events:none;backdrop-filter:blur(2px)}',
    '.pq-photo-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;color:#fff;background:linear-gradient(135deg,#60a5fa,#6366f1)}',
    '@keyframes pqPhotoIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}',
    '.pq-hint-btn{padding:9px 16px;border-radius:14px;border:1px dashed rgba(148,163,184,.4);background:rgba(248,250,252,.9);color:var(--text2);font-size:12px;font-weight:900;cursor:pointer;font-family:inherit;transition:.12s}',
    '.pq-hint-btn:hover{border-color:rgba(37,99,235,.35);color:#2563eb}',
    '.pq-hint-btn:disabled{opacity:.45;cursor:default}',
    '.pq-tool-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}',
    '.pq-tool-btn{padding:9px 14px;border-radius:14px;border:1px solid rgba(148,163,184,.24);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:12px;font-weight:900;cursor:pointer;font-family:inherit;transition:.12s}',
    '.pq-tool-btn:hover{border-color:rgba(37,99,235,.35);color:#2563eb}',
    '.pq-tool-btn:disabled{opacity:.45;cursor:default}',
    '.pq-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:420px}',
    '.pq-tries-left{font-size:11px;font-weight:800;color:var(--text3)}',
    '.pq-status{width:100%;max-width:420px;padding:10px 12px;border-radius:12px;font-size:12px;font-weight:800;line-height:1.55}',
    '.pq-status.is-info{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}',
    '.pq-status.is-good{background:#ecfdf5;border:1px solid #86efac;color:#047857}',
    '.pq-status.is-bad{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c}',
    '.pq-opt{padding:14px 10px;border-radius:16px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text1);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:.12s;text-align:center;box-shadow:0 6px 14px rgba(15,23,42,.05)}',
    '.pq-opt:hover{border-color:rgba(37,99,235,.3);transform:translateY(-1px)}',
    '.pq-opt.pq-correct{background:linear-gradient(135deg,#bbf7d0,#86efac);border-color:#4ade80;color:#14532d;animation:pqPopOk .3s ease}',
    '.pq-opt.pq-wrong{background:linear-gradient(135deg,#fecaca,#fca5a5);border-color:#f87171;color:#7f1d1d;animation:pqShake .32s ease}',
    '.pq-opt:disabled{cursor:default}',
    '@keyframes pqPopOk{0%{transform:scale(1)}50%{transform:scale(1.06)}100%{transform:scale(1)}}',
    '@keyframes pqShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}',
    '.pq-result{background:linear-gradient(135deg,#EFF6FF,#F8FBFF);border:1px solid rgba(96,165,250,.28);border-radius:22px;padding:22px 20px;text-align:center;margin-top:14px;animation:pqPopIn .4s cubic-bezier(.175,.885,.32,1.35)}',
    '.pq-result-emoji{font-size:44px;display:block;margin-bottom:4px}',
    '.pq-result-score{font-size:clamp(24px,5vw,34px);font-weight:900;color:#1D4ED8;margin:4px 0 4px}',
    '.pq-result-sub{font-size:12px;color:var(--text3)}',
    '.pq-empty-note{font-size:12px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 12px;margin-top:10px;line-height:1.6}',
    'body.dark .pq-card,body.dark .pq-result{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55}',
    'body.dark .pq-hud-chip,body.dark .pq-btn,body.dark .pq-opt{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .pq-title{color:#f8fafc}',
    'body.dark .pq-desc{color:#94a3b8}',
    'body.dark .pq-photo-wrap{box-shadow:0 4px 0 rgba(0,0,0,.3),0 12px 26px rgba(0,0,0,.3),inset 0 0 0 4px rgba(15,23,42,.55)}',
    '@media (max-width:520px){.pq-card{padding:14px 14px}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 사운드 (team-match-game.js와 동일한 WebAudio 패턴) ───────────────────────
let _pqAC = null;
function _pqPlayCorrect(combo) {
  try {
    if (!_pqAC) _pqAC = new (window.AudioContext || window.webkitAudioContext)();
    const notes = combo >= 8 ? [523, 659, 784, 1047] : combo >= 4 ? [523, 659, 784] : [659, 880];
    notes.forEach((f, i) => {
      setTimeout(() => {
        const o = _pqAC.createOscillator(), g = _pqAC.createGain();
        o.connect(g); g.connect(_pqAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.14, _pqAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _pqAC.currentTime + 0.2);
        o.start(); o.stop(_pqAC.currentTime + 0.2);
      }, i * 60);
    });
  } catch (e) {}
}
function _pqPlayWrong() {
  try {
    if (!_pqAC) _pqAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _pqAC.createOscillator(), g = _pqAC.createGain();
    o.connect(g); g.connect(_pqAC.destination);
    o.frequency.value = 150; o.type = 'sawtooth';
    g.gain.setValueAtTime(0.09, _pqAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _pqAC.currentTime + 0.2);
    o.start(); o.stop(_pqAC.currentTime + 0.2);
  } catch (e) {}
}

// ─── 상태 ────────────────────────────────────────────────────────────────────
const _PQ_TIME_LIMIT = 60; // 초
const _PQ_NEXT_DELAY = 700; // 정답 확인 후 다음 문제까지 대기(ms)
const _PQ_SKIP_PENALTY = 4; // 패스 시 차감 시간
// 실루엣(블러 심함) 상태로 시작 → "힌트 보기"를 누를 때마다 조금씩 선명해지고,
// 누를수록 그 문제에서 받을 수 있는 점수가 줄어듦(총 10단계).
const _PQ_STAGES = [
  { blur: 28, points: 10 },
  { blur: 25, points: 9 },
  { blur: 22, points: 8 },
  { blur: 19, points: 7 },
  { blur: 16, points: 6 },
  { blur: 13, points: 5 },
  { blur: 10, points: 4 },
  { blur: 7,  points: 3 },
  { blur: 4,  points: 2 },
  { blur: 0,  points: 1 },
];
window._pqState = window._pqState || {
  pool: [], score: 0, combo: 0, best: 0,
  timeLeft: _PQ_TIME_LIMIT, running: false, ended: false, locked: false,
  timerId: null, advanceId: null,
  solved: 0, lastAnswerName: '',
  statusText: '바로 맞히면 고득점, 막히면 힌트나 50:50을 써서 흐름을 이어가세요.',
  statusTone: 'info',
  cur: null, // {answer, choices:[{name,uid}], answerIdx}
};

function _pqBestScore() {
  try { return parseInt(localStorage.getItem('su_pq_best') || '0', 10) || 0; } catch (e) { return 0; }
}
function _pqSaveBest(v) {
  try { localStorage.setItem('su_pq_best', String(v)); } catch (e) {}
}

// ─── 문제 풀 구성 ─────────────────────────────────────────────────────────────
function _pqBuildPool() {
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

function _pqEsc(s) {
  return (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s);
}
function _pqUrl(u) {
  return (typeof toHttpsUrl === 'function') ? toHttpsUrl(u) : u;
}

function _pqShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function _pqNextQuestion() {
  const st = window._pqState;
  if (st.pool.length < 4) { st.cur = null; return; }
  const candidates = st.pool.filter(p => p.name !== st.lastAnswerName);
  const answerPool = candidates.length ? candidates : st.pool;
  const answer = answerPool[Math.floor(Math.random() * answerPool.length)];
  const distractorsPool = st.pool.filter(p => p.name !== answer.name);
  _pqShuffle(distractorsPool);
  const distractors = distractorsPool.slice(0, 3);
  const choices = _pqShuffle([answer, ...distractors]);
  st.cur = { answer, choices, stage: 0, wrongCount: 0, wrongIndices: [], fiftyUsed: false };
  st.locked = false;
  st.statusText = '정답이 보이면 바로 찍고, 애매하면 힌트나 50:50으로 좁혀보세요.';
  st.statusTone = 'info';
}

// ─── 게임 진행 ────────────────────────────────────────────────────────────────
function _pqStart() {
  const st = window._pqState;
  if (st.advanceId) { clearTimeout(st.advanceId); st.advanceId = null; }
  st.pool = _pqBuildPool();
  st.score = 0;
  st.combo = 0;
  st.solved = 0;
  st.lastAnswerName = '';
  st.timeLeft = _PQ_TIME_LIMIT;
  st.running = false;
  st.ended = false;
  st.locked = false;
  st.statusText = '빠른 정답과 연속 콤보를 노려보세요.';
  st.statusTone = 'info';
  if (st.pool.length < 4) { st.cur = null; _pqRenderRoot(); return; }
  _pqNextQuestion();
  st.running = true;
  _pqRenderRoot();
  if (st.timerId) clearInterval(st.timerId);
  st.timerId = setInterval(_pqTick, 1000);
}

function _pqTick() {
  const st = window._pqState;
  if (!st.running) return;
  st.timeLeft--;
  const chip = document.getElementById('pq-time-chip');
  if (chip) {
    chip.textContent = `⏱️ 남은 시간 ${st.timeLeft}초`;
    chip.classList.toggle('is-time-low', st.timeLeft <= 15);
  }
  if (st.timeLeft <= 0) _pqEndGame();
}

function _pqEndGame() {
  const st = window._pqState;
  st.running = false;
  st.ended = true;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.advanceId) { clearTimeout(st.advanceId); st.advanceId = null; }
  if (st.score > _pqBestScore()) _pqSaveBest(st.score);
  _pqRenderRoot();
}

function _pqCleanup() {
  const st = window._pqState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.advanceId) { clearTimeout(st.advanceId); st.advanceId = null; }
  st.running = false;
}
window._pqCleanup = _pqCleanup;

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function _pqPhotoHTML(p, stageIdx) {
  const initial = _pqEsc(String(p.name || '?').trim().slice(0, 1));
  const stage = _PQ_STAGES[stageIdx] || _PQ_STAGES[0];
  return p.photo
    ? `<img id="pq-photo-img" src="${_pqEsc(_pqUrl(p.photo))}" alt="${_pqEsc(p.name)}" loading="lazy" style="filter:blur(${stage.blur}px)" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="pq-photo-fallback" style="display:none">${initial}</div>
       <span class="pq-stage-badge" id="pq-stage-badge">${stageIdx + 1}/${_PQ_STAGES.length}단계 · 최대 ${stage.points}점</span>`
    : `<div class="pq-photo-fallback">${initial}</div>`;
}

function _pqApplyStageBlur(stageIdx) {
  const img = document.getElementById('pq-photo-img');
  const badge = document.getElementById('pq-stage-badge');
  const stage = _PQ_STAGES[stageIdx] || _PQ_STAGES[0];
  if (img) img.style.filter = `blur(${stage.blur}px)`;
  if (badge) badge.textContent = `${stageIdx + 1}/${_PQ_STAGES.length}단계 · 최대 ${stage.points}점`;
}

function _pqSnapPhotoClear() {
  const img = document.getElementById('pq-photo-img');
  if (!img) return;
  img.style.filter = 'blur(0px)';
}

// 힌트 버튼: 다음 단계로 넘어가며 조금 더 선명해지지만, 해당 문제의 획득 가능 점수는 줄어듦
function _pqHint() {
  const st = window._pqState;
  if (!st.running || !st.cur || st.locked) return;
  if (st.cur.stage >= _PQ_STAGES.length - 1) return;
  st.cur.stage++;
  _pqApplyStageBlur(st.cur.stage);
  const hintBtn = document.getElementById('pq-hint-btn');
  if (hintBtn) {
    const next = _PQ_STAGES[st.cur.stage];
    hintBtn.textContent = st.cur.stage >= _PQ_STAGES.length - 1
      ? '💡 마지막 단계'
      : `💡 힌트 보기 (현재 정답 시 +${next.points}점)`;
    if (st.cur.stage >= _PQ_STAGES.length - 1) hintBtn.disabled = true;
  }
}
window._pqHint = _pqHint;

function _pqUseFifty() {
  const st = window._pqState;
  if (!st.running || !st.cur || st.locked || st.cur.fiftyUsed) return;
  const correctIdx = st.cur.choices.findIndex(c => c.name === st.cur.answer.name);
  const availableWrong = st.cur.choices
    .map((c, i) => ({ c, i }))
    .filter(({ i }) => i !== correctIdx && !(st.cur.wrongIndices || []).includes(i));
  if (!availableWrong.length) return;
  const target = availableWrong[Math.floor(Math.random() * availableWrong.length)];
  (st.cur.wrongIndices || (st.cur.wrongIndices = [])).push(target.i);
  st.cur.fiftyUsed = true;
  st.statusText = '50:50 사용: 오답 보기 하나를 제거했습니다.';
  st.statusTone = 'info';
  _pqRenderRoot();
}
window._pqUseFifty = _pqUseFifty;

function _pqSkipQuestion() {
  const st = window._pqState;
  if (!st.running || !st.cur || st.locked) return;
  st.combo = 0;
  st.timeLeft = Math.max(0, st.timeLeft - _PQ_SKIP_PENALTY);
  st.statusText = `패스 사용: ${_PQ_SKIP_PENALTY}초 차감 후 다음 문제로 넘어갑니다.`;
  st.statusTone = 'bad';
  _pqUpdateChips();
  if (st.timeLeft <= 0) {
    _pqEndGame();
    return;
  }
  _pqNextQuestion();
  _pqRenderRoot();
}
window._pqSkipQuestion = _pqSkipQuestion;

function _pqOptionsHTML() {
  const st = window._pqState;
  if (!st.cur) return '';
  const wrongIdx = st.cur.wrongIndices || [];
  return st.cur.choices.map((c, i) => {
    const isWrong = wrongIdx.includes(i);
    return `<button class="pq-opt${isWrong ? ' pq-wrong' : ''}" id="pq-opt-${i}" onclick="_pqAnswer(${i})" ${isWrong ? 'disabled' : ''}>${_pqEsc(c.name)}</button>`;
  }).join('');
}

function _pqRenderRoot() {
  const root = document.getElementById('pq-root');
  if (!root) return;
  const st = window._pqState;
  const best = _pqBestScore();

  if (!st.cur && !st.ended) {
    root.innerHTML = `<div class="pq-shell">
      <div class="pq-card">
        <div class="pq-head">
          <div>
            <div class="pq-title">🖼️ 얼굴 맞추기</div>
            <div class="pq-desc">사진을 보고 이름을 맞히는 퀴즈입니다.</div>
          </div>
        </div>
        <div class="pq-empty-note">⚠️ 퀴즈를 만들 만큼 프로필 사진이 등록된 선수가 부족합니다(최소 4명 필요). 선수 데이터에 사진을 더 등록한 뒤 다시 시도해주세요.</div>
        <div class="pq-actions"><button class="pq-btn pq-btn-primary" onclick="_pqStart()">🔄 다시 확인</button></div>
      </div>
    </div>`;
    return;
  }

  const resultHTML = st.ended ? `<div class="pq-result">
    <span class="pq-result-emoji">🏆</span>
    <div class="pq-result-score">${st.score}점</div>
    <div class="pq-result-sub">최고 기록 ${Math.max(best, st.score)}점${st.score >= best && st.score > 0 ? ' · 신기록!' : ''}</div>
  </div>` : '';

  const isLastStage = st.cur ? st.cur.stage >= _PQ_STAGES.length - 1 : false;
  const nextStageInfo = st.cur && !isLastStage ? _PQ_STAGES[st.cur.stage + 1] : null;
  const hintLabel = isLastStage ? '💡 마지막 단계' : `💡 힌트 보기 (현재 정답 시 +${nextStageInfo ? nextStageInfo.points : ''}점)`;

  const stageHTML = (!st.ended && st.cur) ? `<div class="pq-stage">
    <div class="pq-photo-wrap">${_pqPhotoHTML(st.cur.answer, st.cur.stage)}</div>
    <button class="pq-hint-btn" id="pq-hint-btn" onclick="_pqHint()" ${isLastStage ? 'disabled' : ''}>${hintLabel}</button>
    <div class="pq-tool-row">
      <button class="pq-tool-btn" onclick="_pqUseFifty()" ${st.cur.fiftyUsed ? 'disabled' : ''}>✂️ 50:50 제거</button>
      <button class="pq-tool-btn" onclick="_pqSkipQuestion()">⏭️ 패스 (-${_PQ_SKIP_PENALTY}초)</button>
    </div>
    <div class="pq-options">${_pqOptionsHTML()}</div>
    <div class="pq-tries-left" id="pq-tries-left">❌ 오답 ${st.cur.wrongCount || 0}/3 · 남은 기회 ${Math.max(0, 3 - (st.cur.wrongCount || 0))}번</div>
    <div class="pq-status is-${_pqEsc(st.statusTone || 'info')}" id="pq-status">${_pqEsc(st.statusText || '')}</div>
  </div>` : '';

  root.innerHTML = `<div class="pq-shell">
    <div class="pq-card">
      <div class="pq-head">
        <div>
          <div class="pq-title">🖼️ 얼굴 맞추기</div>
          <div class="pq-desc">사진이 실루엣으로 시작합니다. 바로 맞히면 최대 10점! 모르겠으면 힌트 버튼을 눌러 조금씩 선명하게 볼 수 있지만, 누를 때마다 획득 점수가 줄어들어요(총 10단계). 3번 틀리면 다음 문제로 넘어갑니다.</div>
        </div>
        <div class="pq-hud">
          <span class="pq-hud-chip">🏅 점수 ${st.score}</span>
          <span class="pq-hud-chip is-combo">🔥 콤보 ${st.combo}</span>
          <span class="pq-hud-chip" id="pq-solved-chip">✅ 정답 ${st.solved}</span>
          <span class="pq-hud-chip" id="pq-time-chip">⏱️ 남은 시간 ${st.timeLeft}초</span>
          <span class="pq-hud-chip">🥇 최고 ${best}</span>
        </div>
      </div>
      <div class="pq-actions">
        <button class="pq-btn pq-btn-primary" onclick="_pqStart()">${st.ended ? '🔄 다시하기' : '🔀 새로 시작'}</button>
      </div>
      ${resultHTML}
      ${stageHTML}
    </div>
  </div>`;
}

function _pqAnswer(idx) {
  const st = window._pqState;
  if (!st.running || !st.cur || st.locked) return;
  const correctIdx = st.cur.choices.findIndex(c => c.name === st.cur.answer.name);
  const isCorrect = idx === correctIdx;
  const btn = document.getElementById(`pq-opt-${idx}`);

  if (isCorrect) {
    st.locked = true;
    document.querySelectorAll('.pq-opt').forEach((el, i) => {
      el.disabled = true;
      if (i === correctIdx) el.classList.add('pq-correct');
    });
    _pqSnapPhotoClear();
    const hintBtn = document.getElementById('pq-hint-btn');
    if (hintBtn) hintBtn.disabled = true;

    const stagePoints = (_PQ_STAGES[st.cur.stage] || _PQ_STAGES[_PQ_STAGES.length - 1]).points;
    st.combo++;
    st.solved++;
    st.lastAnswerName = st.cur.answer.name;
    const comboBonus = Math.max(0, st.combo - 1) * 2;
    st.score += stagePoints + comboBonus; // 실루엣 단계 점수 + 콤보 보너스
    st.statusText = `정답! ${st.cur.answer.name} · +${stagePoints + comboBonus}점${comboBonus ? ` (콤보 보너스 +${comboBonus})` : ''}`;
    st.statusTone = 'good';
    _pqPlayCorrect(st.combo);
    _pqUpdateChips();

    st.advanceId = setTimeout(() => {
      if (!st.running) return;
      _pqNextQuestion();
      _pqRenderRoot();
    }, _PQ_NEXT_DELAY);
    return;
  }

  // 오답: 해당 보기만 비활성화하고, 3번 틀릴 때까지는 같은 문제를 계속 시도할 수 있음
  if (btn) { btn.disabled = true; btn.classList.add('pq-wrong'); }
  st.cur.wrongCount = (st.cur.wrongCount || 0) + 1;
  (st.cur.wrongIndices || (st.cur.wrongIndices = [])).push(idx);
  st.combo = 0;
  st.statusText = `오답입니다. 남은 기회 ${Math.max(0, 3 - st.cur.wrongCount)}번`;
  st.statusTone = 'bad';
  _pqPlayWrong();
  _pqUpdateChips();

  const triesEl = document.getElementById('pq-tries-left');
  const remaining = Math.max(0, 3 - st.cur.wrongCount);
  if (triesEl) triesEl.textContent = `❌ 오답 ${st.cur.wrongCount}/3 · 남은 기회 ${remaining}번`;

  if (st.cur.wrongCount >= 3) {
    st.locked = true;
    document.querySelectorAll('.pq-opt').forEach((el, i) => {
      el.disabled = true;
      if (i === correctIdx) el.classList.add('pq-correct');
    });
    _pqSnapPhotoClear();
    const hintBtn = document.getElementById('pq-hint-btn');
    if (hintBtn) hintBtn.disabled = true;
    st.lastAnswerName = st.cur.answer.name;
    st.statusText = `정답은 ${st.cur.answer.name}였습니다. 다음 문제로 넘어갑니다.`;
    st.statusTone = 'info';

    st.advanceId = setTimeout(() => {
      if (!st.running) return;
      _pqNextQuestion();
      _pqRenderRoot();
    }, _PQ_NEXT_DELAY);
  }
}
window._pqAnswer = _pqAnswer;

function _pqUpdateChips() {
  const st = window._pqState;
  const scoreChip = document.querySelector('#pq-root .pq-hud-chip');
  if (scoreChip) scoreChip.textContent = `🏅 점수 ${st.score}`;
  const comboChip = document.querySelector('#pq-root .pq-hud-chip.is-combo');
  if (comboChip) comboChip.textContent = `🔥 콤보 ${st.combo}`;
  const solvedChip = document.getElementById('pq-solved-chip');
  if (solvedChip) solvedChip.textContent = `✅ 정답 ${st.solved}`;
  const statusEl = document.getElementById('pq-status');
  if (statusEl) {
    statusEl.className = `pq-status is-${st.statusTone || 'info'}`;
    statusEl.textContent = st.statusText || '';
  }
}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _pqInit() {
  const st = window._pqState;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }
  if (st.advanceId) { clearTimeout(st.advanceId); st.advanceId = null; }
  if (!st.cur && !st.ended) { _pqStart(); return; }
  st.running = !st.ended;
  _pqRenderRoot();
  if (st.running) st.timerId = setInterval(_pqTick, 1000);
}
window._pqInit = _pqInit;
window._pqStart = _pqStart;
