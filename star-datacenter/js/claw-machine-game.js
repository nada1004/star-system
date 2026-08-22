/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 룰렛탭('claw') 진입 시 동적으로 로드됨. */
// ─── 🪆 선수 인형뽑기 (레트로 오락실 크레인 게임) ──────────────────────────────
// 규칙: 인형들은 기계 안에서 계속 좌우로 흔들리며 움직인다(고정 타겟이 아님).
//       ① 크레인을 원하는 위치에서 정지 → ② 그립 파워 게이지를 스위트존에서
//       잡기 → ③ 두 판정을 통과해도 배출구까지 옮기는 도중 손에서 미끄러질 수
//       있다. 정지 타이밍 + 그립 타이밍 + 운반 중 악력, 세 박자가 다 맞아야 성공.
// 디자인: 2000년대 오락실 네온(핑크·시안) 크레인 기계 — 마퀴 조명, 동전 표시,
// 성공 시 컨페티, 실패 시 화면 흔들림까지 넣어 실제 기계를 만지는 느낌을 살림.

(function _cwInjectCSS() {
  if (document.getElementById('cw-style')) return;
  const s = document.createElement('style');
  s.id = 'cw-style';
  s.textContent = `
:root{
  --cw-shell1:#EAA53F; --cw-shell2:#C87F1D; --cw-shell-deep:#8C5A13;
  --cw-red:#C0392B; --cw-red-dark:#8E2A1F; --cw-red-light:#E9634F;
  --cw-cream:#FFF6E4; --cw-cream-deep:#F1DFBB;
  --cw-teal:#1F8A82; --cw-teal-dark:#125C55;
  --cw-good:#3F7A3D; --cw-bad:#A83A2E;
  --cw-ink:#3B2A1E; --cw-ink2:#6B5540; --cw-ink3:#8C7357;
  --cw-gold:#C97F1D;
}
.cw-shell{display:flex;flex-direction:column;gap:0;width:100%;font-family:inherit}
.cw-console{
  position:relative;display:flex;gap:16px;padding:18px;border-radius:28px;
  background:linear-gradient(160deg,var(--cw-shell1),var(--cw-shell2));
  border:3px solid var(--cw-shell-deep);
  box-shadow:0 18px 38px rgba(70,42,10,.32),inset 0 2px 0 rgba(255,255,255,.35),inset 0 -7px 0 rgba(0,0,0,.14);
  overflow:hidden;
}
.cw-console::before{
  content:'';position:absolute;top:-60%;left:-15%;width:55%;height:220%;
  background:linear-gradient(120deg,rgba(255,255,255,.32),transparent 65%);
  transform:rotate(-14deg);pointer-events:none;
}
.cw-side{position:relative;width:236px;flex-shrink:0;display:flex;flex-direction:column;gap:12px;z-index:1}
.cw-title-row{display:flex;align-items:center;gap:10px}
.cw-title-emoji{font-size:26px;filter:drop-shadow(0 2px 4px rgba(142,42,31,.4))}
.cw-title{font-size:17px;font-weight:800;letter-spacing:-.02em;color:var(--cw-ink)}
.cw-desc{font-size:11.5px;line-height:1.6;color:var(--cw-ink2);word-break:keep-all}

.cw-diff-bar{display:flex;gap:6px}
.cw-diff-pill{
  flex:1;padding:8px 4px;border-radius:10px;border:1px solid var(--cw-shell-deep);
  background:var(--cw-cream);color:var(--cw-ink2);
  font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:.12s;text-align:center;
}
.cw-diff-pill:hover{color:var(--cw-red)}
.cw-diff-pill.on{background:var(--cw-red);border-color:var(--cw-red-dark);color:#fff}
.cw-diff-dot{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:5px;vertical-align:middle}
.cw-diff-pill.on .cw-diff-dot{background:#fff!important}
.cw-diff-hint{font-size:10.5px;color:var(--cw-ink2);line-height:1.5;margin-top:-2px}

.cw-scoreboard{
  border-radius:10px;padding:10px 12px;background:#1c140d;border:1px solid #000;
  display:flex;flex-direction:column;gap:8px;
}
.cw-score-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px}
.cw-score-item{display:flex;flex-direction:column;gap:1px}
.cw-score-label{font-size:9px;font-weight:700;letter-spacing:.08em;color:#c9a876;text-transform:uppercase}
.cw-score-value{font-family:'Courier New',ui-monospace,monospace;font-size:19px;font-weight:900;color:var(--cw-gold);letter-spacing:.01em;text-shadow:0 0 5px rgba(201,127,29,.5)}
.cw-score-value.is-win{color:#8fcb86;text-shadow:0 0 5px rgba(143,203,134,.5)}
.cw-coin-row{display:flex;flex-wrap:wrap;gap:3px}
.cw-coin-pip{font-size:14px;line-height:1;transition:opacity .2s,filter .2s}
.cw-coin-pip.is-used{opacity:.22;filter:grayscale(1)}

.cw-collected{display:flex;flex-wrap:wrap;gap:5px;min-height:26px}
.cw-collected-chip{width:26px;height:26px;border-radius:50%;overflow:hidden;border:2px solid var(--cw-teal)}
.cw-collected-chip img{width:100%;height:100%;object-fit:cover;display:block}
.cw-collected-chip.is-fallback{display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff;background:var(--cw-teal-dark)}
.cw-collected-empty{font-size:11px;color:var(--cw-ink3)}

.cw-actions{margin-top:auto;display:flex;flex-direction:column;gap:8px}
.cw-btn-primary{
  width:100%;padding:13px 14px;border-radius:999px;border:none;cursor:pointer;font-family:inherit;
  font-size:14px;font-weight:800;color:#fff;letter-spacing:-.01em;
  background:radial-gradient(120% 160% at 50% -20%,var(--cw-red-light),var(--cw-red) 58%,var(--cw-red-dark));
  box-shadow:0 5px 0 var(--cw-red-dark);
  transition:transform .1s;
}
.cw-btn-primary:hover{filter:brightness(1.06)}
.cw-btn-primary:active{transform:translateY(3px);box-shadow:0 2px 0 var(--cw-red-dark),0 6px 12px rgba(70,25,18,.26)}
.cw-btn-primary.is-busy{opacity:.55;pointer-events:none;box-shadow:none}
.cw-btn-secondary{
  width:100%;padding:9px 10px;border-radius:12px;border:1px solid var(--cw-shell-deep);cursor:pointer;
  background:var(--cw-cream);color:var(--cw-ink2);font-family:inherit;
  font-size:12px;font-weight:600;
}
.cw-btn-secondary:disabled{opacity:.4;pointer-events:none}

/* ── 게임판(캐비닛 유리 안) ── */
.cw-board-area{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;z-index:1}
.cw-nameplate-row{text-align:center}
.cw-nameplate{
  display:inline-block;background:var(--cw-cream);border:1px solid var(--cw-ink);border-radius:6px;
  padding:3px 12px;font-size:11px;font-weight:700;letter-spacing:.02em;color:var(--cw-ink);
  transform:rotate(-1.4deg);
}
.cw-status{
  padding:9px 12px;border-radius:11px;font-size:var(--fs-sm);font-weight:600;line-height:1.5;text-align:center;
  background:var(--cw-cream);border:1px solid var(--cw-shell-deep);color:var(--cw-ink2);
  transition:background .2s,border-color .2s,color .2s;
}
.cw-status.is-good{background:#EAF4E5;border-color:var(--cw-good);color:#2f5c2d}
.cw-status.is-bad{background:#FBEAE8;border-color:var(--cw-bad);color:#7a2a22}

.cw-cabinet{
  position:relative;flex:1;min-height:360px;border-radius:20px;overflow:hidden;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,246,228,.82) 55%,var(--cw-cream-deep));
  border:3px solid var(--cw-shell-deep);
  box-shadow:inset 0 0 0 3px rgba(255,255,255,.5),inset 0 -18px 26px rgba(140,90,20,.10),0 8px 18px rgba(70,42,10,.25);
}
.cw-cabinet.is-clickable{cursor:pointer}
.cw-cabinet.is-shake{animation:cwShake .32s ease}
@keyframes cwShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
.cw-track{position:absolute;top:14px;left:4%;right:4%;height:3px;background:linear-gradient(90deg,transparent,rgba(140,90,20,.35),transparent);border-radius:2px}

.cw-chute{
  position:absolute;right:3%;bottom:10px;width:15%;min-width:44px;max-width:60px;height:64px;
  border:2px dashed var(--cw-ink3);border-radius:10px 10px 22px 22px;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(241,224,190,.45));
  display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px;
  padding-bottom:5px;font-size:8.5px;font-weight:900;color:var(--cw-ink2);letter-spacing:.01em;text-align:center;line-height:1.2;
}
.cw-claw-unit{position:absolute;top:8px;width:1px;display:flex;flex-direction:column;align-items:center}
.cw-claw-unit.is-transit{transition:left .55s cubic-bezier(.4,0,.2,1)}
.cw-claw-rope{width:2px;background:linear-gradient(180deg,#e2e8f0,#94a3b8);box-shadow:0 0 3px rgba(0,0,0,.2);transition:height .48s cubic-bezier(.4,0,.2,1)}
.cw-claw-head{width:30px;height:20px;margin-top:-1px;border-radius:8px 8px 5px 5px;background:linear-gradient(180deg,#f1f5f9,#94a3b8);box-shadow:0 3px 6px rgba(0,0,0,.3),inset 0 1px 0 #fff;flex-shrink:0}
.cw-claw-pincers{display:flex;justify-content:center;gap:6px;margin-top:-2px}
.cw-claw-pincer{width:9px;height:16px;background:linear-gradient(180deg,#cbd5e1,#64748b);clip-path:polygon(20% 0,80% 0,100% 100%,0 100%);transition:transform .18s}
.cw-claw-pincer.l{transform:rotate(-14deg)}
.cw-claw-pincer.r{transform:rotate(14deg)}
.cw-claw-unit.is-grabbing .cw-claw-pincer.l{transform:rotate(6deg)}
.cw-claw-unit.is-grabbing .cw-claw-pincer.r{transform:rotate(-6deg)}
.cw-claw-cargo{width:32px;height:32px;margin-top:3px;border-radius:50%;overflow:hidden;opacity:0;transition:opacity .18s;border:2px solid var(--cap-color,#fff);box-shadow:0 3px 6px rgba(0,0,0,.3);flex-shrink:0}
.cw-claw-cargo img{width:100%;height:100%;object-fit:cover;display:block}
.cw-claw-cargo .cw-capsule-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fff}
.cw-claw-cargo.is-falling{animation:cwCargoFall .4s ease forwards}
.cw-claw-cargo.is-dropping{animation:cwCargoDrop .32s ease forwards}
@keyframes cwCargoFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(46px) rotate(30deg);opacity:0}}
@keyframes cwCargoDrop{0%{transform:scale(1);opacity:1}100%{transform:scale(.25) translateY(14px);opacity:0}}

.cw-capsule-row{position:absolute;left:0;right:0;bottom:14px;height:82px}
.cw-capsule{
  position:absolute;bottom:0;width:56px;height:56px;margin-left:-28px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
  background:linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(255,255,255,.92) 46%,var(--cap-color) 50%,var(--cap-color) 100%);
  border:2px solid rgba(0,0,0,.18);
  box-shadow:0 5px 10px rgba(70,42,10,.28),inset 0 2px 3px rgba(255,255,255,.55);
  transition:opacity .22s;
  animation:cwBob 2.6s ease-in-out infinite alternate;
  will-change:left;
}
.cw-capsule::after{content:'';position:absolute;left:8%;right:8%;top:47%;height:2px;background:rgba(0,0,0,.14);pointer-events:none}
.cw-capsule-inner{width:76%;height:76%;border-radius:50%;overflow:hidden;background:var(--cw-teal-dark);display:flex;align-items:center;justify-content:center;pointer-events:none}
.cw-capsule-inner img{width:100%;height:100%;object-fit:cover;display:block}
.cw-capsule-fallback{font-size:16px;font-weight:900;color:#fff}
.cw-capsule.is-target{box-shadow:0 0 0 3px rgba(255,255,255,.8),0 5px 10px rgba(70,42,10,.28)}
.cw-capsule.is-slip{animation:cwSlip .4s ease}
@keyframes cwBob{from{transform:translateY(0) rotate(-2deg)}to{transform:translateY(-5px) rotate(2deg)}}
@keyframes cwSlip{0%{transform:translateX(0) rotate(0)}25%{transform:translateX(-5px) rotate(-8deg)}55%{transform:translateX(5px) rotate(8deg)}100%{transform:translateX(0) rotate(0)}}

.cw-confetti-piece{position:absolute;font-size:16px;pointer-events:none;animation:cwConfettiPop .68s ease forwards;z-index:6}
@keyframes cwConfettiPop{0%{transform:translate(0,0) scale(.6);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.15);opacity:0}}

.cw-gauge-wrap{position:absolute;left:6%;right:20%;bottom:104px;height:26px;border-radius:999px;background:rgba(255,255,255,.55);border:2px solid var(--cw-shell-deep);overflow:hidden;box-shadow:inset 0 2px 5px rgba(70,42,10,.18)}
.cw-gauge-sweet{position:absolute;top:0;bottom:0;background:rgba(31,138,130,.26);border-left:2px dashed var(--cw-teal);border-right:2px dashed var(--cw-teal)}
.cw-gauge-needle{position:absolute;top:-3px;bottom:-3px;width:4px;margin-left:-2px;background:var(--cw-red);box-shadow:0 0 5px rgba(192,57,43,.6);border-radius:2px}
.cw-gauge-label{position:absolute;top:-20px;left:6%;font-size:10px;font-weight:700;letter-spacing:.06em;color:var(--cw-teal-dark);text-transform:uppercase}

.cw-result-overlay{
  position:absolute;inset:0;border-radius:20px;display:flex;align-items:center;justify-content:center;
  background:rgba(59,42,30,.55);backdrop-filter:blur(2px);z-index:5;animation:cwFadeIn .25s ease both;
}
@keyframes cwFadeIn{from{opacity:0}to{opacity:1}}
.cw-result{
  background:var(--cw-cream);border:3px solid var(--cw-shell-deep);
  border-radius:18px;padding:22px 24px;text-align:center;max-width:280px;
  box-shadow:0 20px 40px rgba(60,35,10,.4);animation:cwPopIn .4s cubic-bezier(.175,.885,.32,1.35);
}
.cw-result-emoji{font-size:40px;display:block;margin-bottom:6px}
.cw-result-title{font-size:clamp(22px,5.6vw,30px);font-weight:800;color:var(--cw-red);margin:2px 0 8px}
.cw-result-sub{font-size:11.5px;color:var(--cw-ink2);line-height:1.7}
.cw-result-list{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:10px}
@keyframes cwPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
.cw-empty-note{font-size:var(--fs-sm);color:var(--cw-bad);background:rgba(168,58,46,.12);border:1px solid rgba(168,58,46,.35);border-radius:var(--r);padding:10px 12px;margin-top:4px;line-height:1.6}

@media (max-width:820px){
  .cw-console{flex-direction:column}
  .cw-side{width:100%;flex-direction:row;flex-wrap:wrap;align-items:stretch}
  .cw-title-row{width:100%}
  .cw-diff-bar{width:100%}
  .cw-scoreboard{flex:1;min-width:170px}
  .cw-collected{flex:1;min-width:120px;align-content:flex-start}
  .cw-actions{width:100%}
}
@media (max-width:520px){
  .cw-console{padding:12px;border-radius:20px}
  .cw-cabinet{min-height:300px;border-radius:16px}
  .cw-capsule{width:44px;height:44px;margin-left:-22px}
}
`;
  document.head.appendChild(s);
})();

// ─── 사운드 (다른 미니게임과 동일한 WebAudio 패턴) ─────────────────────────────
let _cwAC = null;
function _cwGetAC() {
  try {
    if (!_cwAC) _cwAC = new (window.AudioContext || window.webkitAudioContext)();
    if (_cwAC.state === 'suspended') _cwAC.resume().catch(() => {});
  } catch (e) { _cwAC = null; }
  return _cwAC;
}
function _cwPlayClick() {
  const ac = _cwGetAC(); if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'square'; o.frequency.setValueAtTime(880, ac.currentTime);
  g.gain.setValueAtTime(0.08, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
  o.start(); o.stop(ac.currentTime + 0.08);
}
function _cwPlayWin() {
  const ac = _cwGetAC(); if (!ac) return;
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.14, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);
      o.start(); o.stop(ac.currentTime + 0.22);
    }, i * 70);
  });
}
function _cwPlayFail() {
  const ac = _cwGetAC(); if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sawtooth'; o.frequency.value = 150;
  g.gain.setValueAtTime(0.09, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.24);
  o.start(); o.stop(ac.currentTime + 0.24);
}

// ─── 난이도 설정 ──────────────────────────────────────────────────────────────
// speed/gaugeSpeed: %포인트/ms (클수록 빠르게 움직여서 정지 타이밍이 어려움).
// tolerance: 정지 위치가 인형(움직이는 실시간 위치)과 이 정도(%p) 안이어야 함.
// sweetWidth: 그립 파워 게이지 성공 구간 폭(%p, 작을수록 어려움).
// gripBase: 정렬 정확도(0~1)에 곱해지는 배율 — 낮을수록 잘 맞춰도 놓치기 쉬움.
// carryKeep: 일단 잡았어도 슈트까지 옮기는 도중 놓치지 않을 확률.
// ampBase/speedBase: 인형이 좌우로 흔들리는 폭(%p)과 속도 — 클수록 조준이 어려움.
const _CW_DIFFS = {
  easy:   { key: 'easy',   label: '쉬움',   dot: '#6B8F71', speed: 0.024, tolerance: 14, gaugeSpeed: 0.040, sweetWidth: 36, gripBase: 1.00, carryKeep: 0.72, coins: 8, capsuleCount: 6,  ampBase: 2.2, speedBase: 0.09 },
  normal: { key: 'normal', label: '보통',   dot: '#D9973D', speed: 0.036, tolerance: 10, gaugeSpeed: 0.058, sweetWidth: 26, gripBase: 0.92, carryKeep: 0.55, coins: 8, capsuleCount: 8,  ampBase: 3.0, speedBase: 0.13 },
  hard:   { key: 'hard',   label: '어려움', dot: '#B85C38', speed: 0.050, tolerance: 7,  gaugeSpeed: 0.078, sweetWidth: 18, gripBase: 0.80, carryKeep: 0.40, coins: 8, capsuleCount: 10, ampBase: 4.0, speedBase: 0.17 },
};
const _CW_DIFF_ORDER = ['easy', 'normal', 'hard'];
const _CW_MIN_POOL = 5;
const _CW_CAP_COLORS = ['#D9973D', '#B85C38', '#6B8F71', '#5C82A8', '#8B6F96', '#4C9C8E'];
const _CW_CHUTE_X = 90;      // 슈트(배출구) 가로 위치(%)
const _CW_IDLE_ROPE = 34;    // 크레인이 쉴 때 로프 길이(px)
const _CW_T_DESCEND = 480, _CW_T_GRIP = 300, _CW_T_RISE = 480, _CW_T_SLIP = 420, _CW_T_TRANSIT = 560, _CW_T_DROP = 320;

function _cwReadStoredDifficulty() {
  try {
    const v = localStorage.getItem('su_cw_diff');
    if (v && _CW_DIFFS[v]) return v;
  } catch (e) {}
  return 'normal';
}

window._cwState = window._cwState || {
  difficulty: _cwReadStoredDifficulty(),
  pool: [], capsules: [], collected: [],
  coins: 0, phase: 'idle', ended: false,
  clawX: 50, clawDir: 1, moveAnimId: null, moveLastTs: null,
  power: 0, powerDir: 1, gaugeAnimId: null, gaugeLastTs: null,
  boardAnimId: null,
  sweetCenter: 50, sweetHalf: 10,
  aimCapsuleUid: null, aimQuality: 0,
  statusText: '인형들이 흔들리는 사이, 크레인이 좌우로 움직입니다. 정지 버튼을 눌러보세요!',
  statusTone: 'info', uidSeq: 1, timeouts: [],
};

function _cwDiffObj() { return _CW_DIFFS[window._cwState.difficulty] || _CW_DIFFS.normal; }

function _cwSetDifficulty(key) {
  if (!_CW_DIFFS[key]) return;
  window._cwState.difficulty = key;
  try { localStorage.setItem('su_cw_diff', key); } catch (e) {}
  _cwStart();
}
window._cwSetDifficulty = _cwSetDifficulty;

function _cwDiffBarHTML() {
  const st = window._cwState;
  return _CW_DIFF_ORDER.map(k => {
    const d = _CW_DIFFS[k];
    const on = st.difficulty === k;
    return `<button class="cw-diff-pill${on ? ' on' : ''}" onclick="_cwSetDifficulty('${k}')"><span class="cw-diff-dot" style="background:${d.dot}"></span>${d.label}</button>`;
  }).join('');
}

function _cwBestScore(diffKey) {
  const key = diffKey || window._cwState.difficulty || 'normal';
  try { return parseInt(localStorage.getItem('su_cw_best_' + key) || '0', 10) || 0; } catch (e) { return 0; }
}
function _cwSaveBest(v, diffKey) {
  const key = diffKey || window._cwState.difficulty || 'normal';
  try { localStorage.setItem('su_cw_best_' + key, String(v)); } catch (e) {}
}

function _cwEsc(s) { return (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s); }
function _cwUrl(u) { return (typeof toHttpsUrl === 'function') ? toHttpsUrl(u) : u; }


// ─── 선수 풀 구성 ─────────────────────────────────────────────────────────────
function _cwBuildPool() {
  const players = Array.isArray(window.players) ? window.players : [];
  const seen = new Set();
  const pool = [];
  players.forEach(p => {
    if (!p || p.hidden || p.retired || p.hideFromBoard) return;
    if (String(p.univ || '').trim() === 'YB') return;
    const name = String(p.name || '').trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    pool.push({ name, photo: p.photo || (window.playerPhotos && window.playerPhotos[p.name]) || '' });
  });
  return pool;
}

function _cwShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── 타이머/애니메이션 정리 ────────────────────────────────────────────────────
function _cwClearTimers() {
  const st = window._cwState;
  if (st.moveAnimId) { cancelAnimationFrame(st.moveAnimId); st.moveAnimId = null; }
  if (st.gaugeAnimId) { cancelAnimationFrame(st.gaugeAnimId); st.gaugeAnimId = null; }
  if (st.boardAnimId) { cancelAnimationFrame(st.boardAnimId); st.boardAnimId = null; }
  (st.timeouts || []).forEach(id => clearTimeout(id));
  st.timeouts = [];
}
function _cwSetTimeout(fn, ms) {
  const st = window._cwState;
  const id = setTimeout(() => {
    st.timeouts = (st.timeouts || []).filter(x => x !== id);
    fn();
  }, ms);
  st.timeouts = st.timeouts || [];
  st.timeouts.push(id);
  return id;
}

// ─── 인형 좌우 흔들림(라이브 무빙 타겟) ────────────────────────────────────────
function _cwStartBoardLoop() {
  const st = window._cwState;
  if (st.boardAnimId) return;
  st.boardAnimId = requestAnimationFrame(_cwBoardTick);
}
function _cwStopBoardLoop() {
  const st = window._cwState;
  if (st.boardAnimId) { cancelAnimationFrame(st.boardAnimId); st.boardAnimId = null; }
}
function _cwBoardTick(ts) {
  const st = window._cwState;
  st.capsules.forEach(c => {
    if (c.held) return;
    c.curX = c.baseX + Math.sin((ts / 1000) * c.speedX * Math.PI * 2 + c.phaseX) * c.ampX;
    const el = document.getElementById('cw-capsule-' + c.uid);
    if (el) el.style.left = c.curX + '%';
  });
  st.boardAnimId = requestAnimationFrame(_cwBoardTick);
}

// ─── 라운드 준비 ──────────────────────────────────────────────────────────────
function _cwNewRound() {
  const st = window._cwState;
  _cwClearTimers();
  st.pool = _cwBuildPool();
  st.collected = [];
  st.coins = _cwDiffObj().coins;
  st.ended = false;
  st.aimCapsuleUid = null;
  st.aimQuality = 0;
  st.clawX = 50;
  st.statusText = '인형들이 흔들리는 사이, 크레인이 좌우로 움직입니다. 정지 버튼을 눌러보세요!';
  st.statusTone = 'info';

  if (st.pool.length < _CW_MIN_POOL) { st.capsules = []; st.phase = 'idle'; return; }

  const diff = _cwDiffObj();
  const n = Math.min(diff.capsuleCount, st.pool.length);
  const picked = _cwShuffle(st.pool).slice(0, n);
  const lo = 6 + diff.ampBase, hi = 76 - diff.ampBase;
  const positions = n > 1
    ? picked.map((_, i) => lo + ((hi - lo) * i) / (n - 1))
    : [(lo + hi) / 2];
  st.capsules = picked.map((p, i) => {
    const baseX = Math.max(lo, Math.min(hi, positions[i] + (Math.random() * 2 - 1)));
    return {
      uid: st.uidSeq++,
      name: p.name,
      photo: p.photo,
      baseX, curX: baseX,
      ampX: diff.ampBase * (0.85 + Math.random() * 0.3),
      speedX: diff.speedBase * (0.85 + Math.random() * 0.3),
      phaseX: Math.random() * Math.PI * 2,
      held: false,
      color: _CW_CAP_COLORS[i % _CW_CAP_COLORS.length],
    };
  });
  st.phase = 'idle';
}

function _cwStart() {
  const st = window._cwState;
  _cwNewRound();
  _cwRenderRoot();
  if (st.capsules.length) {
    _cwStartBoardLoop();
    _cwBeginMove();
  }
}
window._cwStart = _cwStart;

// ─── 페이즈 1: 크레인 좌우 이동 ────────────────────────────────────────────────
function _cwBeginMove() {
  const st = window._cwState;
  st.phase = 'moving';
  st.clawX = 50;
  st.clawDir = Math.random() < 0.5 ? 1 : -1;
  st.moveLastTs = null;
  _cwSetStatusState('정지! 버튼을 눌러 크레인을 인형 위에 멈춰보세요.', 'info');
  _cwRenderRoot();
  st.moveAnimId = requestAnimationFrame(_cwMoveTick);
}

function _cwMoveTick(ts) {
  const st = window._cwState;
  if (st.phase !== 'moving') return;
  if (st.moveLastTs == null) st.moveLastTs = ts;
  const dt = ts - st.moveLastTs;
  st.moveLastTs = ts;
  const diff = _cwDiffObj();
  st.clawX += st.clawDir * diff.speed * dt;
  if (st.clawX >= 78) { st.clawX = 78; st.clawDir = -1; }
  if (st.clawX <= 6) { st.clawX = 6; st.clawDir = 1; }
  const unit = document.getElementById('cw-claw-unit');
  if (unit) unit.style.left = st.clawX + '%';
  st.moveAnimId = requestAnimationFrame(_cwMoveTick);
}

function _cwStopClaw() {
  const st = window._cwState;
  if (st.phase !== 'moving') return;
  if (st.moveAnimId) { cancelAnimationFrame(st.moveAnimId); st.moveAnimId = null; }
  _cwPlayClick();

  // 인형들이 실시간으로 움직이고 있으므로, "멈춘 순간의" 현재 위치(curX)로 판정한다.
  let nearest = null, minDist = Infinity;
  st.capsules.forEach(c => {
    if (c.held) return;
    const d = Math.abs(c.curX - st.clawX);
    if (d < minDist) { minDist = d; nearest = c; }
  });
  const diff = _cwDiffObj();
  const reach = diff.tolerance * 2.1; // 이 거리 밖이면 그립 게이지조차 의미 없음(그냥 헛손질)

  if (!nearest || minDist > reach) {
    st.aimCapsuleUid = null;
    st.aimQuality = 0;
    _cwSetStatusState('너무 멀리서 멈췄어요... 그래도 한번 내려가 봅니다.', 'bad');
    st.phase = 'busy';
    _cwRenderRoot();
    _cwRunGrabSequence(false, null, 0);
    return;
  }

  st.aimCapsuleUid = nearest.uid;
  st.aimQuality = Math.max(0, 1 - minDist / diff.tolerance); // 0~1, 가까울수록 1
  _cwBeginGauge();
}
window._cwStopClaw = _cwStopClaw;

// ─── 페이즈 2: 그립 파워 게이지 ────────────────────────────────────────────────
function _cwBeginGauge() {
  const st = window._cwState;
  const diff = _cwDiffObj();
  st.phase = 'gauge';
  st.power = 0;
  st.powerDir = 1;
  st.gaugeLastTs = null;
  st.sweetHalf = diff.sweetWidth / 2;
  st.sweetCenter = 20 + Math.random() * 60;
  _cwSetStatusState('이번엔 그립 파워! 점선 구간 안에서 잡기 버튼을 눌러요.', 'info');
  _cwRenderRoot();
  st.gaugeAnimId = requestAnimationFrame(_cwGaugeTick);
}

function _cwGaugeTick(ts) {
  const st = window._cwState;
  if (st.phase !== 'gauge') return;
  if (st.gaugeLastTs == null) st.gaugeLastTs = ts;
  const dt = ts - st.gaugeLastTs;
  st.gaugeLastTs = ts;
  const diff = _cwDiffObj();
  st.power += st.powerDir * diff.gaugeSpeed * dt;
  if (st.power >= 100) { st.power = 100; st.powerDir = -1; }
  if (st.power <= 0) { st.power = 0; st.powerDir = 1; }
  const needle = document.getElementById('cw-gauge-needle');
  if (needle) needle.style.left = st.power + '%';
  st.gaugeAnimId = requestAnimationFrame(_cwGaugeTick);
}

function _cwGrab() {
  const st = window._cwState;
  if (st.phase !== 'gauge') return;
  if (st.gaugeAnimId) { cancelAnimationFrame(st.gaugeAnimId); st.gaugeAnimId = null; }
  _cwPlayClick();

  const gaugeSuccess = Math.abs(st.power - st.sweetCenter) <= st.sweetHalf;
  const capsule = st.capsules.find(c => c.uid === st.aimCapsuleUid) || null;
  const aimQuality = st.aimQuality;

  st.phase = 'busy';
  _cwRenderRoot();
  _cwRunGrabSequence(gaugeSuccess, capsule, aimQuality);
}
window._cwGrab = _cwGrab;

// ─── 페이즈 3: 내려가서 잡고 → 옮기기 (실제 연출 시퀀스) ───────────────────────
function _cwRunGrabSequence(gaugeSuccess, capsule, aimQuality) {
  const st = window._cwState;
  const diff = _cwDiffObj();
  const descendPx = _cwComputeDescendRopeHeight();

  if (capsule) capsule.held = true; // 잡는 순간부터는 흔들림 애니메이션에서 제외(고정)
  _cwSetRopeHeight(descendPx);

  _cwSetTimeout(() => {
    _cwPlayClick();
    _cwSetPincerState(true);
    const initialGrab = !!(capsule && gaugeSuccess && Math.random() < aimQuality * diff.gripBase);

    if (initialGrab) {
      _cwSetRowCapsuleHidden(capsule.uid, true);
      _cwSetCargo(capsule);
      _cwSetStatusState('꽉 잡았다! 조심스럽게 들어올리는 중...', 'good');
    } else {
      if (capsule) capsule.held = false;
      _cwShakeCabinet();
      _cwSetStatusState('아, 허공만 잡았어요...', 'bad');
    }

    _cwSetTimeout(() => {
      _cwSetRopeHeight(_CW_IDLE_ROPE);

      _cwSetTimeout(() => {
        if (!initialGrab) {
          _cwSetPincerState(false);
          _cwFinishAttempt(false, capsule);
          return;
        }

        const carrySuccess = Math.random() < diff.carryKeep;
        if (!carrySuccess) {
          _cwPlayFail();
          _cwShakeCabinet();
          _cwSetStatusState('앗, 손에서 미끄러졌어요! 다 왔는데 아쉽네요.', 'bad');
          _cwSlipCargoBack(capsule);
          _cwSetTimeout(() => {
            _cwSetPincerState(false);
            _cwFinishAttempt(false, capsule);
          }, _CW_T_SLIP);
          return;
        }

        _cwSetStatusState(`${capsule.name} 인형을 배출구로 옮기는 중...`, 'good');
        _cwSetClawTransit(true);
        _cwSetClawLeft(_CW_CHUTE_X);

        _cwSetTimeout(() => {
          _cwSetClawTransit(false);
          _cwPlayWin();
          _cwDropCargoIntoChute();
          _cwConfettiBurst();
          _cwSetStatusState(`${capsule.name} 인형을 뽑았습니다! 🎉`, 'good');

          _cwSetTimeout(() => {
            _cwSetPincerState(false);
            _cwFinishAttempt(true, capsule);
          }, _CW_T_DROP);
        }, _CW_T_TRANSIT);
      }, _CW_T_RISE);
    }, _CW_T_GRIP);
  }, _CW_T_DESCEND);
}

function _cwFinishAttempt(success, capsule) {
  const st = window._cwState;
  st.coins = Math.max(0, st.coins - 1);
  st.aimCapsuleUid = null;

  if (success && capsule) {
    st.capsules = st.capsules.filter(c => c.uid !== capsule.uid);
    st.collected.push({ name: capsule.name, photo: capsule.photo });
  }

  st.phase = 'result';
  st.clawX = 50; // 다음 시도를 위해 크레인을 중앙으로 즉시 복귀
  _cwRenderRoot();

  if (st.coins <= 0 || st.capsules.length === 0) {
    _cwStopBoardLoop();
    _cwSetTimeout(_cwEndGame, success ? 300 : 200);
  }
}

function _cwEndGame() {
  const st = window._cwState;
  st.phase = 'ended';
  st.ended = true;
  const count = st.collected.length;
  if (count > _cwBestScore()) _cwSaveBest(count);
  _cwRenderRoot();
}

function _cwNextAttempt() {
  const st = window._cwState;
  if (st.phase !== 'result' || st.ended) return;
  _cwBeginMove();
}
window._cwNextAttempt = _cwNextAttempt;

function _cwCleanup() {
  _cwClearTimers();
  window._cwState.phase = 'idle';
}
window._cwCleanup = _cwCleanup;

// ─── DOM 직접 조작 헬퍼 (연출 시퀀스 중에는 전체 재렌더링을 하지 않음) ─────────
function _cwComputeDescendRopeHeight() {
  const cab = document.querySelector('#cw-root .cw-cabinet');
  const h = cab ? cab.clientHeight : 320;
  return Math.max(70, h - 96);
}
function _cwSetRopeHeight(px) {
  const rope = document.getElementById('cw-claw-rope');
  if (rope) rope.style.height = px + 'px';
}
function _cwSetPincerState(closed) {
  const unit = document.getElementById('cw-claw-unit');
  if (unit) unit.classList.toggle('is-grabbing', !!closed);
}
function _cwSetClawLeft(x) {
  window._cwState.clawX = x;
  const unit = document.getElementById('cw-claw-unit');
  if (unit) unit.style.left = x + '%';
}
function _cwSetClawTransit(on) {
  const unit = document.getElementById('cw-claw-unit');
  if (unit) unit.classList.toggle('is-transit', !!on);
}
function _cwSetStatusState(text, tone) {
  const st = window._cwState;
  st.statusText = text;
  st.statusTone = tone;
  const el = document.getElementById('cw-status');
  if (el) { el.textContent = text; el.className = 'cw-status is-' + tone; }
}
function _cwSetRowCapsuleHidden(uid, hidden) {
  const el = document.getElementById('cw-capsule-' + uid);
  if (el) el.style.opacity = hidden ? '0' : '';
}
function _cwSetCargo(capsule) {
  const cargo = document.getElementById('cw-claw-cargo');
  if (!cargo) return;
  cargo.classList.remove('is-falling', 'is-dropping');
  if (!capsule) { cargo.style.opacity = '0'; cargo.innerHTML = ''; return; }
  cargo.style.setProperty('--cap-color', capsule.color || '#D9973D');
  const initial = _cwEsc(String(capsule.name || '?').trim().slice(0, 1));
  cargo.innerHTML = capsule.photo
    ? `<img src="${_cwEsc(_cwUrl(capsule.photo))}" alt="${_cwEsc(capsule.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="cw-capsule-fallback" style="display:none">${initial}</div>`
    : `<div class="cw-capsule-fallback">${initial}</div>`;
  cargo.style.opacity = '1';
}
function _cwSlipCargoBack(capsule) {
  const cargo = document.getElementById('cw-claw-cargo');
  if (cargo) cargo.classList.add('is-falling');
  _cwSetTimeout(() => {
    if (cargo) { cargo.classList.remove('is-falling'); cargo.style.opacity = '0'; cargo.innerHTML = ''; }
    capsule.held = false;
    _cwSetRowCapsuleHidden(capsule.uid, false);
    const rowEl = document.getElementById('cw-capsule-' + capsule.uid);
    if (rowEl) {
      rowEl.classList.add('is-slip');
      _cwSetTimeout(() => { rowEl.classList.remove('is-slip'); }, 420);
    }
  }, 380);
}
function _cwDropCargoIntoChute() {
  const cargo = document.getElementById('cw-claw-cargo');
  if (cargo) cargo.classList.add('is-dropping');
  _cwSetTimeout(() => {
    if (cargo) { cargo.classList.remove('is-dropping'); cargo.style.opacity = '0'; cargo.innerHTML = ''; }
  }, 300);
}
function _cwShakeCabinet() {
  const cab = document.querySelector('#cw-root .cw-cabinet');
  if (!cab) return;
  cab.classList.remove('is-shake');
  void cab.offsetWidth;
  cab.classList.add('is-shake');
}
function _cwConfettiBurst() {
  const cab = document.querySelector('#cw-root .cw-cabinet');
  if (!cab) return;
  const rect = cab.getBoundingClientRect();
  const originX = rect.width * (_CW_CHUTE_X / 100);
  const originY = rect.height - 44;
  const emojis = ['🎉', '✨', '🎊'];
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.className = 'cw-confetti-piece';
    el.textContent = emojis[i % emojis.length];
    el.style.left = originX + 'px';
    el.style.top = originY + 'px';
    const dx = Math.random() * 80 - 40;
    const dy = -(60 + Math.random() * 50);
    el.style.setProperty('--dx', dx + 'px');
    el.style.setProperty('--dy', dy + 'px');
    cab.appendChild(el);
    setTimeout(() => { el.remove(); }, 700);
  }
}

function _cwCabinetClick() {
  const st = window._cwState;
  if (st.phase === 'moving') { _cwStopClaw(); return; }
  if (st.phase === 'gauge') { _cwGrab(); return; }
  if (st.phase === 'result' && !st.ended) { _cwNextAttempt(); return; }
}
window._cwCabinetClick = _cwCabinetClick;

// ─── 렌더링 ──────────────────────────────────────────────────────────────────
function _cwCapsuleHTML(c, i) {
  const st = window._cwState;
  const isAiming = (st.phase === 'gauge' || st.phase === 'busy') && st.aimCapsuleUid === c.uid;
  const initial = _cwEsc(String(c.name || '?').trim().slice(0, 1));
  const inner = c.photo
    ? `<img src="${_cwEsc(_cwUrl(c.photo))}" alt="${_cwEsc(c.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="cw-capsule-fallback" style="display:none">${initial}</div>`
    : `<div class="cw-capsule-fallback">${initial}</div>`;
  const delay = (i % 6) * 0.17;
  return `<div class="cw-capsule${isAiming ? ' is-target' : ''}" id="cw-capsule-${c.uid}" title="${_cwEsc(c.name)}" style="left:${c.curX}%;--cap-color:${c.color};animation-delay:${delay}s">
    <div class="cw-capsule-inner">${inner}</div>
  </div>`;
}

function _cwCollectedHTML() {
  const st = window._cwState;
  if (!st.collected.length) return '<span class="cw-collected-empty">아직 없음</span>';
  return st.collected.map(c => {
    const initial = _cwEsc(String(c.name || '?').trim().slice(0, 1));
    return c.photo
      ? `<span class="cw-collected-chip" title="${_cwEsc(c.name)}"><img src="${_cwEsc(_cwUrl(c.photo))}" alt="${_cwEsc(c.name)}" loading="lazy"></span>`
      : `<span class="cw-collected-chip is-fallback" title="${_cwEsc(c.name)}">${initial}</span>`;
  }).join('');
}

function _cwCoinPipsHTML() {
  const st = window._cwState;
  const diff = _cwDiffObj();
  let html = '<div class="cw-coin-row">';
  for (let i = 0; i < diff.coins; i++) {
    html += `<span class="cw-coin-pip${i >= st.coins ? ' is-used' : ''}">🪙</span>`;
  }
  html += '</div>';
  return html;
}

function _cwActionHTML() {
  const st = window._cwState;
  if (st.ended) return `<button class="cw-btn-primary" onclick="_cwStart()">다시하기</button>`;
  if (st.phase === 'moving') return `<button class="cw-btn-primary" onclick="_cwStopClaw()">정지!</button>`;
  if (st.phase === 'gauge') return `<button class="cw-btn-primary" onclick="_cwGrab()">잡기!</button>`;
  if (st.phase === 'busy') return `<button class="cw-btn-primary is-busy">진행 중...</button>`;
  if (st.phase === 'result') return `<button class="cw-btn-primary" onclick="_cwNextAttempt()">다음 시도 (${st.coins}회 남음)</button>`;
  return `<button class="cw-btn-primary" onclick="_cwStart()">시작하기</button>`;
}

function _cwGaugeHTML() {
  const st = window._cwState;
  if (st.phase !== 'gauge') return '';
  const left = Math.max(0, st.sweetCenter - st.sweetHalf);
  const width = st.sweetHalf * 2;
  return `<div class="cw-gauge-label">그립 파워</div>
    <div class="cw-gauge-wrap">
      <div class="cw-gauge-sweet" style="left:${left}%;width:${width}%"></div>
      <div class="cw-gauge-needle" id="cw-gauge-needle" style="left:${st.power}%"></div>
    </div>`;
}

function _cwRenderRoot() {
  const root = document.getElementById('cw-root');
  if (!root) return;
  const st = window._cwState;
  const best = _cwBestScore();
  const diff = _cwDiffObj();

  if (!st.capsules.length && !st.pool.length) {
    root.innerHTML = `<div class="cw-shell">
      <div class="cw-console" style="flex-direction:column">
        <div class="cw-title-row">
          <span class="cw-title-emoji">🪆</span>
          <div>
            <div class="cw-title">선수 인형뽑기</div>
            <div class="cw-desc">정지 타이밍과 그립 파워, 두 박자를 맞춰야 뽑을 수 있어요.</div>
          </div>
        </div>
        <div class="cw-empty-note">프로필 사진이 등록된 선수가 부족합니다(최소 ${_CW_MIN_POOL}명 필요). 사진을 더 등록한 뒤 다시 시도해주세요.</div>
        <button class="cw-btn-primary" style="max-width:200px" onclick="_cwStart()">다시 확인</button>
      </div>
    </div>`;
    return;
  }

  const isBusy = st.phase === 'busy';
  const clawUnitCls = isBusy ? ' is-grabbing' : '';

  const resultHTML = st.ended ? `<div class="cw-result-overlay">
    <div class="cw-result">
      <span class="cw-result-emoji">🏆</span>
      <div class="cw-result-title">${st.collected.length}개 포획!</div>
      <div class="cw-result-sub">최고 기록 ${Math.max(best, st.collected.length)}개${st.collected.length >= best && st.collected.length > 0 ? ' · 신기록!' : ''}</div>
      <div class="cw-result-list">${_cwCollectedHTML()}</div>
    </div>
  </div>` : '';

  root.innerHTML = `<div class="cw-shell">
    <div class="cw-console">
      <div class="cw-side">
        <div class="cw-title-row">
          <span class="cw-title-emoji">🪆</span>
          <div>
            <div class="cw-title">선수 인형뽑기</div>
            <div class="cw-desc">정지! → 잡기! 인형은 계속 흔들리고, 잡아도 옮기다 놓칠 수 있어요. 화면을 직접 클릭해도 됩니다.</div>
          </div>
        </div>

        <div class="cw-scoreboard">
          <div class="cw-score-grid">
            <div class="cw-score-item"><span class="cw-score-label">포획 수</span><span class="cw-score-value is-win">${st.collected.length}</span></div>
            <div class="cw-score-item"><span class="cw-score-label">최고 기록</span><span class="cw-score-value" style="font-size:14px">${best}</span></div>
          </div>
          <div class="cw-score-item">
            <span class="cw-score-label">남은 시도</span>
            ${_cwCoinPipsHTML()}
          </div>
        </div>

        <div class="cw-diff-bar">${_cwDiffBarHTML()}</div>
        <div class="cw-diff-hint">난이도가 높을수록 판정이 좁아지고 빨라져요. 운반 성공률 ${Math.round(diff.carryKeep * 100)}%.</div>

        <div class="cw-collected">${_cwCollectedHTML()}</div>

        <div class="cw-actions">
          ${_cwActionHTML()}
          <button class="cw-btn-secondary" onclick="_cwStart()"${isBusy ? ' disabled' : ''}>새로 시작</button>
        </div>
      </div>

      <div class="cw-board-area">
        <div class="cw-nameplate-row"><span class="cw-nameplate">문방구 캡슐 뽑기 · 1회 100원</span></div>
        <div class="cw-status is-${_cwEsc(st.statusTone || 'info')}" id="cw-status">${_cwEsc(st.statusText || '')}</div>
        <div class="cw-cabinet${(st.phase === 'moving' || st.phase === 'gauge' || (st.phase === 'result' && !st.ended)) ? ' is-clickable' : ''}" onclick="_cwCabinetClick()">
          <div class="cw-track"></div>
          <div class="cw-chute">상품 출구</div>
          <div class="cw-claw-unit${clawUnitCls}" id="cw-claw-unit" style="left:${st.clawX}%">
            <div class="cw-claw-rope" id="cw-claw-rope" style="height:${_CW_IDLE_ROPE}px"></div>
            <div class="cw-claw-head"></div>
            <div class="cw-claw-pincers"><div class="cw-claw-pincer l"></div><div class="cw-claw-pincer r"></div></div>
            <div class="cw-claw-cargo" id="cw-claw-cargo"></div>
          </div>
          ${_cwGaugeHTML()}
          <div class="cw-capsule-row">${st.capsules.map(_cwCapsuleHTML).join('')}</div>
          ${resultHTML}
        </div>
      </div>
    </div>
  </div>`;
}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _cwInit() {
  _cwClearTimers();
  _cwStart();
}
window._cwInit = _cwInit;
