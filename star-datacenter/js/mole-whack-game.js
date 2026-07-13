/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('mole') 진입 시 동적으로 로드됨. */
// ─── 🐹 두더지 잡기 (문제 프로필과 같은 얼굴의 두더지만 클릭) ──────────────────────
// 규칙: 위에 나온 문제 선수 사진과 같은 얼굴의 두더지가 튀어나오면 클릭해서 잡는다.
//       다른 선수 두더지를 잘못 잡으면 콤보가 끊긴다. 4x4(쉬움)/6x6(어려움) 난이도 지원.
//
// 디자인 콘셉트: "현상수배 두더지 사냥" — 목표 얼굴은 나무 팻말에 못박힌 수배 전단으로,
// 게임판은 잔디밭 위 나무 프레임 크레이트로 표현해 다른 미니게임과 구분되는 고유한 톤을 준다.

(function _mwInjectCSS() {
  if (document.getElementById('mw-style')) return;
  const s = document.createElement('style');
  s.id = 'mw-style';
  s.textContent = `
:root{
  --mw-ivory:#FBF8F0; --mw-ivory2:#F4EDDB;
  --mw-gold:#d97706; --mw-gold-l:#f2b542; --mw-gold-d:#9a5c07;
  --mw-meadow1:#1f5240; --mw-meadow2:#123526; --mw-meadow-deep:#0c2519;
  --mw-mound:#6b4a30; --mw-mound-l:#8f6440; --mw-mound-d:#3c2718;
  --mw-good:#22c55e; --mw-bad:#ef4444;
  --mw-ink:#2c2013; --mw-ink2:#5b4632; --mw-ink3:#8a7860;
}
.mw-shell{display:flex;flex-direction:column;gap:0;width:100%;font-family:inherit}
.mw-console{
  position:relative;display:flex;gap:16px;padding:18px;border-radius:26px;
  background:linear-gradient(155deg,var(--mw-ivory),var(--mw-ivory2));
  border:1px solid rgba(217,119,6,.18);
  box-shadow:0 20px 44px rgba(60,40,15,.09),inset 0 1px 0 rgba(255,255,255,.7);
}
.mw-console::before{
  content:'';position:absolute;inset:8px;border-radius:20px;pointer-events:none;
  border:1px solid rgba(217,119,6,.14);
}
.mw-side{position:relative;width:236px;flex-shrink:0;display:flex;flex-direction:column;gap:12px}
.mw-title-row{display:flex;align-items:center;gap:10px}
.mw-title-emoji{font-size:26px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.15))}
.mw-title{font-size:17px;font-weight:950;letter-spacing:-.02em;color:var(--mw-ink)}
.mw-desc{font-size:11.5px;line-height:1.6;color:var(--mw-ink3);word-break:keep-all}

/* 타깃 카드 — 금박 프레임의 현상 전단 */
.mw-wanted{
  position:relative;padding:14px 12px 12px;border-radius:14px;text-align:center;
  background:linear-gradient(180deg,#fffaf0,#f8edd2);
  border:1px solid rgba(217,119,6,.3);
  box-shadow:0 10px 22px rgba(154,92,7,.14),inset 0 0 0 1px rgba(255,255,255,.5);
}
.mw-wanted::before{
  content:'';position:absolute;top:-7px;left:50%;transform:translateX(-50%);
  width:14px;height:14px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,var(--mw-gold-l),var(--mw-gold-d));
  box-shadow:0 3px 5px rgba(154,92,7,.4);
}
.mw-wanted-label{font-size:10px;font-weight:950;letter-spacing:.14em;color:var(--mw-gold-d);text-transform:uppercase;margin-bottom:8px}
.mw-target-wrap{
  width:104px;height:104px;margin:0 auto;border-radius:50%;overflow:hidden;
  background:#eee3c8;box-shadow:0 3px 8px rgba(154,92,7,.22),inset 0 0 0 3px #fff,inset 0 0 0 5px var(--mw-gold);
  animation:mwTargetIn .3s ease both;
}
.mw-target-wrap img{width:100%;height:100%;object-fit:cover;display:block}
.mw-target-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;background:linear-gradient(135deg,var(--mw-gold-l),var(--mw-gold-d))}
@keyframes mwTargetIn{from{opacity:0;transform:scale(.8) rotate(-6deg)}to{opacity:1;transform:scale(1) rotate(0)}}
.mw-wanted-caption{margin-top:8px;font-size:11px;font-weight:800;color:var(--mw-ink2);line-height:1.5}

/* 점수판 — 앰버 LED 전광판 */
.mw-scoreboard{
  border-radius:14px;padding:10px 12px;background:linear-gradient(180deg,#241c11,#17120b);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.05),0 8px 18px rgba(30,20,8,.28);
}
.mw-score-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px}
.mw-score-item{display:flex;flex-direction:column;gap:1px}
.mw-score-label{font-size:9px;font-weight:800;letter-spacing:.08em;color:#c4a877;text-transform:uppercase}
.mw-score-value{font-family:'Courier New',ui-monospace,monospace;font-size:19px;font-weight:900;color:#ffe4ae;letter-spacing:.01em;text-shadow:0 0 8px rgba(255,196,102,.45)}
.mw-score-value.is-combo{color:#7ee0a8;text-shadow:0 0 8px rgba(126,224,168,.5)}
.mw-timer-row{margin-top:8px}
.mw-timer-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
.mw-timer-label{font-size:9px;font-weight:800;letter-spacing:.08em;color:#c4a877;text-transform:uppercase}
.mw-timer-value{font-family:'Courier New',ui-monospace,monospace;font-size:12px;font-weight:900;color:#ffe4ae}
.mw-timer-track{height:7px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
.mw-timer-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--mw-gold-l),var(--mw-gold));transition:width .3s linear,background .3s}
.mw-scoreboard.is-time-low .mw-timer-fill{background:linear-gradient(90deg,#f87171,#ef4444);animation:mwPulseBar .6s ease-in-out infinite}
.mw-scoreboard.is-time-low .mw-timer-value{color:#fca5a5}
@keyframes mwPulseBar{0%,100%{opacity:1}50%{opacity:.55}}

.mw-diff-bar{display:flex;gap:6px}
.mw-diff-pill{
  flex:1;padding:8px 6px;border-radius:10px;border:1px solid rgba(217,119,6,.3);
  background:linear-gradient(180deg,#fff,#f8edd2);color:var(--mw-ink2);
  font-size:11.5px;font-weight:900;cursor:pointer;font-family:inherit;transition:.12s;
  box-shadow:0 6px 12px rgba(154,92,7,.08);text-align:center;
}
.mw-diff-pill:hover{transform:translateY(-1px);color:var(--mw-gold-d)}
.mw-diff-pill:active{transform:translateY(1px)}
.mw-diff-pill.on{background:linear-gradient(180deg,var(--mw-gold-l),var(--mw-gold));border-color:var(--mw-gold-d);color:#fff;box-shadow:0 3px 0 var(--mw-gold-d),0 8px 16px rgba(217,119,6,.3)}

.mw-actions{margin-top:auto}
.mw-btn-primary{
  width:100%;padding:12px 14px;border-radius:14px;border:none;cursor:pointer;font-family:inherit;
  font-size:13.5px;font-weight:950;color:#fff;letter-spacing:-.01em;
  background:radial-gradient(120% 160% at 50% -20%,var(--mw-gold-l),var(--mw-gold) 60%,var(--mw-gold-d));
  box-shadow:0 5px 0 #7a4a05,0 12px 22px rgba(217,119,6,.28),inset 0 1px 0 rgba(255,255,255,.35);
  transition:transform .1s;
}
.mw-btn-primary:hover{filter:brightness(1.05)}
.mw-btn-primary:active{transform:translateY(3px);box-shadow:0 2px 0 #7a4a05,0 6px 12px rgba(217,119,6,.22)}

/* 게임판 — 은은한 저녁 초원 (사선 스트라이프 제거, 여백 확보로 프레임 밖 튀어나옴 방지) */
.mw-board-area{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
.mw-status{
  padding:9px 12px;border-radius:11px;font-size:12px;font-weight:800;line-height:1.5;text-align:center;
  background:rgba(255,255,255,.85);border:1px solid rgba(217,119,6,.18);color:var(--mw-ink2);
  box-shadow:0 4px 10px rgba(60,40,15,.05);
}
.mw-status.is-good{background:#eafbf0;border-color:#86efac;color:#166534}
.mw-status.is-bad{background:#fef1f1;border-color:#fca5a5;color:#b91c1c}

.mw-field{
  position:relative;flex:1;min-height:340px;border-radius:22px;padding:26px 18px 20px;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
  background:
    radial-gradient(circle at 18% 12%,rgba(242,181,66,.16),transparent 34%),
    radial-gradient(circle at 85% 78%,rgba(242,181,66,.10),transparent 38%),
    radial-gradient(ellipse at 50% 0%,var(--mw-meadow1) 0%,var(--mw-meadow2) 62%,var(--mw-meadow-deep) 100%);
  border:1px solid rgba(217,119,6,.35);
  box-shadow:0 0 0 5px var(--mw-ivory),0 0 0 6px rgba(217,119,6,.3),0 18px 36px rgba(18,53,38,.28),inset 0 0 40px rgba(0,0,0,.22);
}
.mw-field::before{
  content:'';position:absolute;inset:8px;border-radius:14px;pointer-events:none;
  border:1px solid rgba(242,181,66,.16);
}

.mw-grid{
  display:grid;grid-template-columns:repeat(var(--mw-cols,4),1fr);grid-template-rows:repeat(var(--mw-cols,4),1fr);
  gap:5% 4%;width:100%;max-width:520px;aspect-ratio:1/1;max-height:100%;margin:0 auto;
}
.mw-hole{
  position:relative;border-radius:50%;cursor:pointer;overflow:visible;
  background:radial-gradient(ellipse at 50% 56%,var(--mw-mound-d) 0%,var(--mw-mound) 46%,var(--mw-mound-l) 70%,transparent 76%);
  box-shadow:inset 0 6px 10px rgba(0,0,0,.4),0 2px 0 rgba(0,0,0,.1);
  transition:transform .08s;
}
.mw-hole::before{
  content:'';position:absolute;left:50%;bottom:-4%;width:70%;height:26%;transform:translateX(-50%);
  border-radius:50%;background:radial-gradient(ellipse,rgba(8,20,14,.5),transparent 72%);pointer-events:none;
}
.mw-hole:hover{transform:scale(1.04)}
.mw-mole{position:absolute;left:50%;bottom:12%;width:66%;aspect-ratio:1/1;border-radius:50%;transform:translate(-50%,54%) scale(.85);opacity:0;overflow:hidden;box-shadow:0 5px 10px rgba(15,23,42,.35),0 0 0 3px #fff8ec,0 0 0 5px var(--mw-gold);pointer-events:none}
.mw-hole.is-up .mw-mole{animation:mwPopUp .17s ease forwards}
.mw-hole.is-good .mw-mole{animation:mwHitGood .3s ease forwards}
.mw-hole.is-bad .mw-mole{animation:mwHitBad .32s ease forwards}
@keyframes mwPopUp{from{transform:translate(-50%,54%) scale(.85);opacity:0}to{transform:translate(-50%,0) scale(1);opacity:1}}
@keyframes mwHitGood{0%{transform:translate(-50%,0) scale(1);opacity:1}55%{transform:translate(-50%,-14%) scale(1.18) rotate(-8deg);opacity:1}100%{transform:translate(-50%,54%) scale(.5) rotate(10deg);opacity:0}}
@keyframes mwHitBad{0%{transform:translate(-50%,0) scale(1);opacity:1}25%{transform:translate(-58%,0) scale(1) rotate(-10deg)}55%{transform:translate(-42%,0) scale(1) rotate(10deg)}100%{transform:translate(-50%,54%) scale(.55);opacity:0}}
.mw-mole img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
.mw-mole-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;background:#6b7280;pointer-events:none}
.mw-hole.is-good::after{content:attr(data-gain);position:absolute;top:-6px;left:50%;transform:translateX(-50%);font-size:15px;font-weight:950;color:#ffd76a;text-shadow:0 2px 4px rgba(0,0,0,.5);animation:mwFloatUp .55s ease forwards;pointer-events:none;white-space:nowrap}
@keyframes mwFloatUp{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-20px)}}

/* 결과 오버레이 — 포획 완료 트로피 카드 */
.mw-result-overlay{
  position:absolute;inset:0;border-radius:22px;display:flex;align-items:center;justify-content:center;
  background:rgba(12,37,25,.6);backdrop-filter:blur(2px);z-index:5;animation:mwFadeIn .25s ease both;
}
@keyframes mwFadeIn{from{opacity:0}to{opacity:1}}
.mw-result{
  background:linear-gradient(180deg,var(--mw-ivory),var(--mw-ivory2));border:1px solid rgba(217,119,6,.28);
  border-radius:20px;padding:24px 26px;text-align:center;max-width:280px;
  box-shadow:0 24px 48px rgba(0,0,0,.35);animation:mwPopIn .4s cubic-bezier(.175,.885,.32,1.35);
}
.mw-result-emoji{font-size:42px;display:block;margin-bottom:6px}
.mw-result-score{font-family:'Courier New',ui-monospace,monospace;font-size:clamp(26px,6vw,36px);font-weight:900;color:var(--mw-gold-d);margin:2px 0 8px}
.mw-result-sub{font-size:11.5px;color:var(--mw-ink3);line-height:1.7}
@keyframes mwPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
.mw-empty-note{font-size:12px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 12px;margin-top:4px;line-height:1.6}

body.dark .mw-console{background:linear-gradient(155deg,#1c1710,#171310);border-color:rgba(242,181,66,.16)}
body.dark .mw-console::before{border-color:rgba(242,181,66,.1)}
body.dark .mw-title{color:#f5ecd9}
body.dark .mw-desc{color:#a6957c}
body.dark .mw-wanted{background:linear-gradient(180deg,#2a2114,#221a10);border-color:rgba(242,181,66,.22)}
body.dark .mw-wanted-caption{color:#c9b691}
body.dark .mw-status{background:rgba(30,24,16,.75);border-color:rgba(242,181,66,.16);color:#d8c8ab}
body.dark .mw-status.is-good{background:rgba(22,101,52,.28);border-color:#166534;color:#86efac}
body.dark .mw-status.is-bad{background:rgba(153,27,27,.28);border-color:#991b1b;color:#fca5a5}
body.dark .mw-field{box-shadow:0 0 0 5px #171310,0 0 0 6px rgba(242,181,66,.22),0 18px 36px rgba(0,0,0,.4),inset 0 0 40px rgba(0,0,0,.3)}
body.dark .mw-result{background:linear-gradient(180deg,#211a10,#191309);border-color:rgba(242,181,66,.2)}
body.dark .mw-result-sub{color:#a6957c}

@media (max-width:820px){
  .mw-console{flex-direction:column}
  .mw-side{width:100%;flex-direction:row;flex-wrap:wrap;align-items:stretch}
  .mw-title-row{width:100%}
  .mw-wanted{width:132px;flex-shrink:0}
  .mw-scoreboard{flex:1;min-width:170px}
  .mw-diff-bar{width:100%}
  .mw-actions{width:100%}
}
@media (max-width:520px){
  .mw-console{padding:12px;border-radius:20px}
  .mw-field{padding:20px 10px 14px;border-radius:18px;min-height:280px}
  .mw-grid{gap:6% 3%}
  .mw-wanted{width:112px}
  .mw-target-wrap{width:84px;height:84px}
}
`;
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
// grid: 보드 한 변 칸 수(4=4x4, 6=6x6). maxUp: 동시에 튀어나올 수 있는 두더지 수.
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
    return `<button class="mw-diff-pill${on ? ' on' : ''}" onclick="_mwSetDifficulty('${k}')">${d.emoji} ${d.label}</button>`;
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
    if (!p || p.hidden || p.retired || p.hideFromBoard) return;
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
  const valueEl = document.getElementById('mw-time-value');
  const board = document.getElementById('mw-scoreboard');
  const fill = document.getElementById('mw-timer-fill');
  if (valueEl) valueEl.textContent = `${st.timeLeft}s`;
  if (fill) fill.style.width = Math.max(0, Math.round((st.timeLeft / _MW_TIME_LIMIT) * 100)) + '%';
  if (board) board.classList.toggle('is-time-low', st.timeLeft <= 15);
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
    spawnTime: Date.now(),
    lifeMs: diff.holeUp,
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
    // 반응 속도 보너스: 튀어나오자마자 빨리 잡을수록 높은 점수, 사라지기 직전에 잡으면 기본 점수만
    const lifeMs = hole.lifeMs || _mwDiffObj().holeUp;
    const elapsed = hole.spawnTime ? (Date.now() - hole.spawnTime) : 0;
    const lifeRatio = lifeMs ? Math.min(1, elapsed / lifeMs) : 0;
    const speedBonus = Math.round((1 - lifeRatio) * 10); // 0~10점, 빠를수록 높음
    const comboBonus = Math.max(0, st.combo - 1) * 2;
    const gained = 10 + speedBonus + comboBonus;
    hole.gained = gained;
    st.score += gained;
    const speedNote = speedBonus >= 7 ? ' · ⚡ 스피드 보너스 +' + speedBonus : (speedBonus <= 2 ? ' · 아슬아슬하게 포획' : '');
    st.statusText = `${_mwEsc(hole.name)} 두더지를 잡았습니다! +${gained}점${comboBonus ? ` · 콤보 +${comboBonus}` : ''}${speedNote}`;
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
  const gainAttr = hole.hitState === 'good' ? ` data-gain="+${hole.gained || 10}"` : '';
  const initial = _mwEsc(String(hole.name || '?').trim().slice(0, 1));
  const img = hole.photo
    ? `<img src="${_mwEsc(_mwUrl(hole.photo))}" alt="${_mwEsc(hole.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="mw-mole-fallback" style="display:none">${initial}</div>`
    : `<div class="mw-mole-fallback">${initial}</div>`;
  return `<div class="mw-hole${stateCls}" id="mw-hole-${idx}"${gainAttr} onclick="_mwHit(${idx})"><div class="mw-mole">${img}</div></div>`;
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
  const cap = document.getElementById('mw-target-caption');
  const st = window._mwState;
  if (cap) cap.textContent = st.target ? `"${st.target.name}" 얼굴을 찾아라` : '';
}

function _mwUpdateHud() {
  const st = window._mwState;
  const scoreEl = document.getElementById('mw-score-value');
  const comboEl = document.getElementById('mw-combo-value');
  if (scoreEl) scoreEl.textContent = st.score;
  if (comboEl) comboEl.textContent = `x${st.combo || 0}`;
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
      <div class="mw-console" style="flex-direction:column">
        <div class="mw-title-row">
          <span class="mw-title-emoji">🐹</span>
          <div>
            <div class="mw-title">두더지 잡기</div>
            <div class="mw-desc">문제로 나온 선수 사진과 같은 얼굴의 두더지만 클릭해서 잡는 게임입니다.</div>
          </div>
        </div>
        <div class="mw-empty-note">⚠️ 게임을 만들 만큼 프로필 사진이 등록된 선수가 부족합니다(최소 ${_MW_MIN_POOL}명 필요). 선수 데이터에 사진을 더 등록한 뒤 다시 시도해주세요.</div>
        <button class="mw-btn-primary" style="max-width:200px" onclick="_mwStart()">🔄 다시 확인</button>
      </div>
    </div>`;
    return;
  }

  const resultHTML = st.ended ? `<div class="mw-result-overlay">
    <div class="mw-result">
      <span class="mw-result-emoji">🏆</span>
      <div class="mw-result-score">${st.score}점</div>
      <div class="mw-result-sub">최고 기록 ${Math.max(best, st.score)}점${st.score >= best && st.score > 0 ? ' · 신기록!' : ''}<br>최고 콤보 x${Math.max(st.bestCombo || 0, st.combo || 0)} · 총 ${st.hits}마리 포획</div>
    </div>
  </div>` : '';

  root.innerHTML = `<div class="mw-shell">
    <div class="mw-console">
      <div class="mw-side">
        <div class="mw-title-row">
          <span class="mw-title-emoji">🐹</span>
          <div>
            <div class="mw-title">두더지 잡기</div>
            <div class="mw-desc">같은 얼굴의 두더지만 재빨리 클릭! 빨리 잡을수록 점수가 높고, 다른 얼굴을 잡으면 콤보가 끊깁니다.</div>
          </div>
        </div>

        <div class="mw-wanted">
          <div class="mw-wanted-label">WANTED</div>
          <div class="mw-target-wrap" id="mw-target-wrap">${_mwTargetHTML()}</div>
          <div class="mw-wanted-caption" id="mw-target-caption">${st.target ? `"${_mwEsc(st.target.name)}" 얼굴을 찾아라` : ''}</div>
        </div>

        <div class="mw-scoreboard" id="mw-scoreboard">
          <div class="mw-score-grid">
            <div class="mw-score-item"><span class="mw-score-label">점수</span><span class="mw-score-value" id="mw-score-value">${st.score}</span></div>
            <div class="mw-score-item"><span class="mw-score-label">콤보</span><span class="mw-score-value is-combo" id="mw-combo-value">x${st.combo || 0}</span></div>
            <div class="mw-score-item"><span class="mw-score-label">최고 기록</span><span class="mw-score-value" style="font-size:14px">${best}</span></div>
            <div class="mw-score-item"><span class="mw-score-label">난이도</span><span class="mw-score-value" style="font-size:14px">${_mwDiffObj().grid}x${_mwDiffObj().grid}</span></div>
          </div>
          <div class="mw-timer-row">
            <div class="mw-timer-head">
              <span class="mw-timer-label">남은 시간</span>
              <span class="mw-timer-value" id="mw-time-value">${st.timeLeft}s</span>
            </div>
            <div class="mw-timer-track"><div class="mw-timer-fill" id="mw-timer-fill" style="width:${Math.max(0, Math.round((st.timeLeft / _MW_TIME_LIMIT) * 100))}%"></div></div>
          </div>
        </div>

        <div class="mw-diff-bar">${_mwDiffBarHTML()}</div>

        <div class="mw-actions">
          <button class="mw-btn-primary" onclick="_mwStart()">${st.ended ? '🔄 다시 사냥하기' : '🔀 새로 시작'}</button>
        </div>
      </div>

      <div class="mw-board-area">
        <div class="mw-status is-${_mwEsc(st.statusTone || 'info')}" id="mw-status">${_mwEsc(st.statusText || '')}</div>
        <div class="mw-field">
          <div class="mw-grid" id="mw-grid" style="--mw-cols:${st.grid}">${_mwGridHTML()}</div>
          ${resultHTML}
        </div>
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
