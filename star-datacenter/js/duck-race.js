/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 동적으로 필요시 로드 필요. */
// ─── 🐥 오리경주 ──────────────────────────────────────────────────────────────

(function _drInjectCSS() {
  if (document.getElementById('dr-style')) return;
  const s = document.createElement('style');
  s.id = 'dr-style';
  s.textContent = [
    '#dr-root{font-family:inherit;width:100%}',
    '.dr-shell{display:flex;flex-direction:column;gap:14px}',
    '.dr-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:24px;box-shadow:0 18px 38px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.9)}',
    '.dr-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px}',
    '.dr-hero-title{font-size:var(--fs-lg);font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '.dr-hero-desc{margin-top:5px;font-size:var(--fs-sm);line-height:1.6;color:var(--text3)}',
    '.dr-badge-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}',
    '.dr-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.88);border:1px solid rgba(148,163,184,.16);font-size:var(--fs-caption);font-weight:900;color:var(--text2);box-shadow:0 10px 18px rgba(15,23,42,.04)}',
    '.dr-setup{background:transparent;border:none;border-radius:0;padding:0;margin:0}',
    '.dr-setup-panel{padding:0 20px 18px}',
    '.dr-pool-wrap{position:relative;overflow:hidden;border-radius:24px;border:1px solid rgba(148,163,184,.18);box-shadow:0 20px 38px rgba(15,23,42,.12),inset 0 1px 0 rgba(255,255,255,.7)}',
    '.dr-pool-inner{position:relative;height:100%}',
    '.dr-duck-el{position:absolute;display:flex;flex-direction:column;align-items:center;transform:translateX(-50%);pointer-events:none;transition:left 0s}',
    '.dr-duck-emoji{font-size:30px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25));display:inline-block;transform:scaleX(-1)}',
    '.dr-duck-name{font-size:var(--fs-caption);font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8);white-space:nowrap;max-width:72px;overflow:hidden;text-overflow:ellipsis;text-align:center;background:rgba(0,0,0,.28);padding:1px 4px;border-radius:4px;margin-top:1px}',
    '.dr-finish-flag{position:absolute;top:0;display:flex;flex-direction:column;pointer-events:none}',
    '.dr-race-panel{padding:16px 18px 18px}',
    '.dr-race-meta{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}',
    '.dr-race-title{font-size:16px;font-weight:950;color:var(--text1);letter-spacing:-.02em}',
    '.dr-race-desc{margin-top:4px;font-size:var(--fs-sm);line-height:1.55;color:var(--text3)}',
    '.dr-progress-panel{margin-top:12px;background:linear-gradient(180deg,rgba(255,255,255,.88),rgba(248,250,252,.82));border:1px solid rgba(148,163,184,.18);border-radius:18px;padding:12px 14px;box-shadow:0 12px 24px rgba(15,23,42,.05)}',
    '.dr-rank-board{margin-top:10px;display:flex;flex-wrap:wrap;gap:7px;padding:2px}',
    '.dr-rank-chip{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.18);background:rgba(255,255,255,.88);font-weight:800;font-size:var(--fs-sm);box-shadow:0 8px 18px rgba(15,23,42,.04)}',
    '.dr-rank-chip.is-finished{background:linear-gradient(135deg,#fef3c7,#fde68a);border-color:#fbbf24;color:#78350f}',
    '.dr-result-card{background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:1px solid rgba(251,113,133,.28);border-radius:24px;padding:22px 24px;text-align:center;margin-top:14px;animation:drPopIn .4s cubic-bezier(.175,.885,.32,1.35);box-shadow:0 20px 36px rgba(244,63,94,.12)}',
    '.dr-result-trophy{font-size:52px;display:block;margin-bottom:4px}',
    '.dr-result-winner{font-size:clamp(22px,5vw,36px);font-weight:900;color:#C0274A;margin:6px 0 12px;word-break:keep-all}',
    '.dr-result-rank{font-size:var(--fs-base);color:var(--text2);margin-bottom:16px;line-height:2;text-align:left;background:var(--white);border-radius:var(--r);padding:8px 14px;border:1px solid var(--border)}',
    '.dr-btn-primary{background:linear-gradient(135deg,#fb7185,#f43f5e 52%,#ec4899);color:#fff;border:none;border-radius:999px;padding:12px 28px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 7px 0 #9f1239,0 18px 30px rgba(244,63,94,.22);transition:transform .1s,box-shadow .1s;font-family:inherit}',
    '.dr-btn-primary:active{transform:translateY(3px);box-shadow:0 1px 0 #C0274A}',
    '.dr-btn-secondary{background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);border:1px solid rgba(148,163,184,.22);border-radius:14px;padding:9px 16px;font-size:var(--fs-base);font-weight:700;cursor:pointer;font-family:inherit;transition:.1s;box-shadow:0 10px 18px rgba(15,23,42,.04)}',
    '.dr-btn-secondary:hover{border-color:var(--text3)}',
    '.dr-ev-badge{position:absolute;background:rgba(255,255,80,.92);border-radius:6px;padding:2px 7px;font-size:var(--fs-caption);font-weight:700;color:#333;pointer-events:none;animation:drBadgePop 1.6s ease forwards;white-space:nowrap;z-index:10}',
    '.dr-history-card{margin-top:2px;padding:14px 16px}',
    '.dr-hist-item{cursor:pointer;padding:10px 12px;background:linear-gradient(180deg,#fff,#f8fafc);border-radius:14px;border:1px solid rgba(148,163,184,.18);transition:.1s;box-shadow:0 8px 18px rgba(15,23,42,.04)}',
    '.dr-hist-item:hover{border-color:#2aace0;transform:translateY(-1px)}',
    '.dr-hist-detail{display:none;margin-top:8px;padding:10px;background:rgba(255,255,255,.9);border-radius:12px;border:1px solid rgba(148,163,184,.18)}',
    '@keyframes drFadeIn{from{opacity:0}to{opacity:1}}',
    '@keyframes drPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}',
    '@keyframes drBadgePop{0%{opacity:1;transform:translateY(0)}70%{opacity:1;transform:translateY(-22px)}100%{opacity:0;transform:translateY(-34px)}}',
    'body.dark .dr-card,body.dark .dr-pool-wrap,body.dark .dr-progress-panel,body.dark .dr-history-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55;box-shadow:0 22px 42px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark .dr-badge,body.dark .dr-btn-secondary,body.dark .dr-hist-item,body.dark .dr-rank-chip{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .dr-hero-title,body.dark .dr-race-title{color:#f8fafc}',
    'body.dark .dr-hero-desc,body.dark .dr-race-desc{color:#94a3b8}',
    '@media (max-width:760px){.dr-hero,.dr-race-meta{flex-direction:column}.dr-badge-row{justify-content:flex-start}.dr-setup-panel,.dr-race-panel{padding-left:14px;padding-right:14px}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 상수 ────────────────────────────────────────────────────────────────────
const _DR_FINISH_PX = 4860;
const _DR_POOL_W    = 5400;
const _DR_LANE_H    = 82;
const _DR_EMOJIS    = ['🐥','🐤','🦆','🐣','🐧','🦩','🦢','🦜','🦉','🦚','🦅','🐓'];
const _DR_EVENTS    = [
  { label:'💨 급가속!',      mult:1.9,  dur:80 },
  { label:'🌊 파도에 휩쓸림', mult:0.25, dur:75 },
  { label:'🚀 터보!',        mult:2.4,  dur:55 },
  { label:'😴 졸음 수영...',  mult:0.12, dur:85 },
  { label:'⭐ 완전 회복!',   mult:1.0,  dur:65 },
  { label:'🍌 바나나 먹음!', mult:1.6,  dur:70 },
  { label:'🦈 상어 출현!',   mult:0.2,  dur:60 },
  { label:'🌬️ 순풍!',       mult:1.7,  dur:72 },
];

// ─── 상태 ────────────────────────────────────────────────────────────────────
let _drSt     = null;
let _drAnimId = null;
let _drAC     = null;
let _drNameCache = localStorage.getItem('su_dr_n') || '';
let _drHistCache = [];
try { _drHistCache = JSON.parse(localStorage.getItem('su_dr_hist') || '[]'); } catch(e) {}
// MiscStore에서 비동기 로드 (IDB 우선)
(async function _drLoadFromIdb(){
  try{
    if(typeof MiscStore==='undefined') return;
    const n = await MiscStore.get('su_dr_n');
    if(typeof n === 'string') _drNameCache = n;
    const h = await MiscStore.get('su_dr_hist');
    if(Array.isArray(h)) _drHistCache = h;
  }catch(e){}
})();

// ─── 이력 관리 ───────────────────────────────────────────────────────────────
function _drGetHistory() {
  return _drHistCache;
}
function _drSaveHistory(hist) {
  _drHistCache = hist.slice(0,15);
  try{ if(typeof MiscStore!=='undefined') MiscStore.set('su_dr_hist', _drHistCache); else localStorage.setItem('su_dr_hist', JSON.stringify(_drHistCache)); }catch(e){}
}
function _drToggleHistDetail(idx) {
  const el = document.getElementById('dr-hist-d-' + idx);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
function _drClearHistory() {
  try{ if(typeof MiscStore!=='undefined') MiscStore.delete('su_dr_hist'); else localStorage.removeItem('su_dr_hist'); }catch(e){}
  const root = document.getElementById('dr-root');
  if (root) _drRenderSetup(root, _drNameCache);
}
function _drRenderHistory() {
  const hist = _drGetHistory();
  if (!hist.length) return '';
  const rows = hist.map(function(h, i) {
    const rankRows = (h.rankings || []).map(function(r) {
      const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank + '위';
      return '<div style="display:flex;gap:6px;align-items:center;padding:3px 0">'
        + '<span style="min-width:28px;font-weight:700;color:' + (r.rank<=3?'#C0274A':'var(--text2)') + '">' + medal + '</span>'
        + '<span style="font-size:16px">' + r.emoji + '</span>'
        + '<span style="font-weight:600;color:var(--text1)">' + r.name + '</span>'
        + '</div>';
    }).join('');
    return '<div class="dr-hist-item" onclick="_drToggleHistDetail(' + i + ')">'
      + '<div style="display:flex;align-items:center;gap:8px">'
      + '<span style="color:var(--text3);font-size:var(--fs-caption);min-width:88px;flex-shrink:0">' + h.time + '</span>'
      + '<span style="font-weight:800;color:#C0274A;flex:1">' + h.winner + ' 🏆</span>'
      + '<span style="color:var(--text3);font-size:var(--fs-caption)">' + h.participants + '명 ▾</span>'
      + '</div>'
      + '<div id="dr-hist-d-' + i + '" class="dr-hist-detail">' + rankRows + '</div>'
      + '</div>';
  }).join('');
  return '<div class="dr-card dr-history-card">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    + '<div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">📋 최근 경주 결과 <span style="color:var(--text3);font-weight:400">(클릭하면 전체 순위)</span></div>'
    + '<button onclick="_drClearHistory()" class="dr-btn-secondary" style="font-size:var(--fs-caption);padding:3px 8px">전체 삭제</button>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:7px">' + rows + '</div></div>';
}

// ─── 공개 API ────────────────────────────────────────────────────────────────
function _drInit() {
  const root = document.getElementById('dr-root');
  if (!root) return;
  const saved = _drNameCache;
  if (_drSt && (_drSt.running || _drSt.finished)) {
    _drRenderRace(root);
  } else {
    _drSt = null;
    _drRenderSetup(root, saved);
  }
}

function _drCleanup() {
  if (_drAnimId) { cancelAnimationFrame(_drAnimId); _drAnimId = null; }
  const ov = document.getElementById('dr-result-overlay');
  if (ov) ov.remove();
  _drSt = null;
}

// ─── 셋업 화면 ───────────────────────────────────────────────────────────────
function _drRenderSetup(root, saved) {
  const savedCount = saved.split(',').map(function(v){ return v.trim(); }).filter(function(v){ return v; }).length;
  root.innerHTML =
    '<div class="dr-shell">'
    + '<div class="dr-card dr-setup">'
    + '<div class="dr-hero">'
    + '<div>'
    + '<div class="dr-hero-title">🐥 럭셔리 오리경주</div>'
    + '<div class="dr-hero-desc">참가자만 입력하면 더 또렷한 레이스 보드와 고급스러운 결과 화면으로 오리경주를 즐길 수 있습니다.</div>'
    + '</div>'
    + '<div class="dr-badge-row">'
    + '<span class="dr-badge">✨ 참가자 ' + savedCount + '명</span>'
    + '<span class="dr-badge">🏁 최대 12명</span>'
    + '<span class="dr-badge">🎉 이벤트 레이스</span>'
    + '</div>'
    + '</div>'
    + '<div class="dr-setup-panel">'
    + '<div style="font-size:var(--fs-base);font-weight:700;color:var(--text2);margin-bottom:8px">🐥 참가자 이름 (쉼표 구분, 2~12명)</div>'
    + '<textarea id="dr-names-ta" rows="3" oninput="_drSaveNames(this.value)"'
    + ' style="width:100%;border:1px solid rgba(148,163,184,.24);border-radius:18px;padding:12px 14px;font-size:var(--fs-md);line-height:1.7;resize:none;color:var(--text1);background:linear-gradient(180deg,#fff,#f8fafc);font-family:inherit;box-sizing:border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,.9)"'
    + ' placeholder="예: 김스타, 이스타, 박스타">' + saved + '</textarea>'
    + '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">'
    + '<button onclick="document.getElementById(\'dr-names-ta\').value=\'\';_drSaveNames(\'\')" class="dr-btn-secondary">🗑 지우기</button>'
    + '</div>'
    + '<div style="text-align:center;padding:12px 0 2px">'
    + '<button onclick="_drBeginRace()" class="dr-btn-primary" style="font-size:var(--fs-lg);padding:14px 44px">🚀 경주 시작!</button>'
    + '</div>'
    + '</div>'
    + '</div>'
    + _drRenderHistory()
    + '</div>';
}

function _drSaveNames(val) {
  _drNameCache = val;
  try{ if(typeof MiscStore!=='undefined') MiscStore.set('su_dr_n', val); else localStorage.setItem('su_dr_n', val); }catch(e){}
}

// ─── 경주 시작 ───────────────────────────────────────────────────────────────
function _drBeginRace() {
  const ta  = document.getElementById('dr-names-ta');
  const raw = ta ? ta.value : (_drNameCache);
  const names = raw.split(',').map(function(v){ return v.trim(); }).filter(function(v){ return v; });
  if (names.length < 2)  { alert('참가자를 2명 이상 입력해 주세요.'); return; }
  if (names.length > 12) { alert('최대 12명까지 가능합니다.'); return; }

  var laneH = Math.min(_DR_LANE_H, Math.max(48, Math.floor((window.innerHeight * 0.55) / names.length)));
  _drSt = {
    names: names,
    laneH: laneH,
    ducks: names.map(function(name, i) {
      var base = 1.4 + Math.random() * 1.6;
      return {
        name:        name,
        emoji:       _DR_EMOJIS[i % _DR_EMOJIS.length],
        x:           60,
        speed:       base,
        baseSpeed:   base,
        evActive:    false,
        evTimer:     0,
        nextEvIn:    Math.round(90 + Math.random() * 130),
        finished:    false,
        rank:        0,
      };
    }),
    running:           true,
    finished:          false,
    frame:             0,
    cameraX:           0,
    waveOff:           0,
    rankCount:         0,
    firstFinished:     false,
    firstFinishedFrame:0,
  };

  const root = document.getElementById('dr-root');
  try{ _drPlayStart(); }catch(e){}
  _drRenderRace(root);
}

// ─── 경주 화면 렌더 ──────────────────────────────────────────────────────────
function _drRenderRace(root) {
  if (!root || !_drSt) return;
  const n       = _drSt.ducks.length;
  const laneH   = _drSt.laneH || _DR_LANE_H;
  const canvasH = laneH * n;
  const viewW   = Math.min(window.innerWidth - 32, 920);

  root.innerHTML =
    '<div class="dr-shell">'
    + '<div class="dr-card dr-race-panel">'
    + '<div class="dr-race-meta">'
    + '<div>'
    + '<div class="dr-race-title">🏁 프리미엄 레이스 보드</div>'
    + '<div class="dr-race-desc">선두 오리와 진행률, 실시간 순위를 한눈에 볼 수 있도록 정리한 레이스 화면입니다.</div>'
    + '</div>'
    + '<button onclick="_drResetRace()" class="dr-btn-secondary" style="font-size:var(--fs-sm);padding:7px 14px">🔄 다시하기</button>'
    + '</div>'
    + '<div class="dr-pool-wrap" id="dr-pool-wrap" style="width:' + viewW + 'px;height:' + canvasH + 'px">'
    + '<canvas id="dr-bg-canvas" style="position:absolute;top:0;left:0;display:block"></canvas>'
    + '<div id="dr-pool-inner" class="dr-pool-inner" style="position:absolute;top:0;left:0;width:' + _DR_POOL_W + 'px"></div>'
    + '</div>'
    // 진행도 바
    + '<div class="dr-progress-panel">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">'
    + '<div id="dr-status" style="font-size:var(--fs-base);font-weight:700;color:var(--text2)">🏁 경주 중!</div>'
    + '<span class="dr-badge">🌊 랜덤 이벤트 진행 중</span>'
    + '</div>'
    + '<div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:4px" id="dr-progress-label">🥇 선두 진행률 0%</div>'
    + '<div style="background:var(--border);border-radius:6px;height:8px;overflow:hidden">'
    + '<div id="dr-progress-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#2aace0,#38bdf8);border-radius:6px;transition:width .1s"></div>'
    + '</div>'
    + '</div>'
    // 실시간 순위판
    + '<div id="dr-rank-board" class="dr-rank-board"></div>'
    + '</div>'
    + '</div>';

  // 캔버스 크기 설정
  var cv = document.getElementById('dr-bg-canvas');
  cv.width  = viewW;
  cv.height = canvasH;

  // 결승선
  var inner = document.getElementById('dr-pool-inner');
  var flagEl = document.createElement('div');
  flagEl.className = 'dr-finish-flag';
  flagEl.style.cssText = 'left:' + _DR_FINISH_PX + 'px;height:' + canvasH + 'px;width:6px;background:repeating-linear-gradient(180deg,#fff 0,#fff 8px,#111 8px,#111 16px)';
  inner.appendChild(flagEl);

  // 오리 엘리먼트 생성
  _drSt.ducks.forEach(function(duck, i) {
    var el = document.createElement('div');
    el.className = 'dr-duck-el';
    el.id = 'dr-duck-' + i;
    el.style.top  = (i * laneH + Math.round(laneH / 2) - 28) + 'px';
    el.style.left = duck.x + 'px';
    el.innerHTML  = '<span class="dr-duck-emoji">' + duck.emoji + '</span>'
                  + '<span class="dr-duck-name">'  + duck.name  + '</span>';
    inner.appendChild(el);
  });

  // 첫 프레임 배경 그리기
  _drDrawBG(0);

  if (_drSt.running) {
    if (_drAnimId) cancelAnimationFrame(_drAnimId);
    _drAnimId = requestAnimationFrame(_drLoop);
  }
}

// ─── 배경 캔버스 그리기 ──────────────────────────────────────────────────────
function _drDrawBG(camX) {
  var cv = document.getElementById('dr-bg-canvas');
  if (!cv || !_drSt) return;
  var ctx = cv.getContext('2d');
  var w   = cv.width;
  var h   = cv.height;
  var n   = _drSt.ducks.length;
  var lH  = _drSt.laneH || _DR_LANE_H;
  var off = _drSt.waveOff;

  // 트랙 바닥(연한 파랑 톤)
  var bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0,   '#dbeafe');
  bg.addColorStop(0.55,'#bfdbfe');
  bg.addColorStop(1,   '#93c5fd');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 미세 질감(점)
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  for (var s = 0; s < 420; s++) {
    var px = (s * 37) % w;
    var py = (s * 53) % h;
    ctx.fillRect(px, py, 1, 1);
  }

  // 레인 구분선
  ctx.strokeStyle = 'rgba(255,255,255,.70)';
  ctx.lineWidth   = 2;
  for (var i = 1; i < n; i++) {
    var ly = i * lH;
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(w, ly); ctx.stroke();
  }

  // 레인 중앙 가이드(점선)
  ctx.strokeStyle = 'rgba(30,64,175,.22)';
  ctx.lineWidth   = 1;
  ctx.setLineDash([10, 10]);
  for (var j = 0; j < n; j++) {
    var cy = j * lH + lH * 0.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  }
  ctx.setLineDash([]);

  // 거리 마커
  ctx.fillStyle = 'rgba(30,64,175,.55)';
  ctx.font = '11px sans-serif';
  for (var m = 500; m < _DR_FINISH_PX; m += 500) {
    var sx = m - camX;
    if (sx < -20 || sx > w + 20) continue;
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
    ctx.fillText(m + 'm', sx + 4, 13);
  }

  // 결승선
  var fx = _DR_FINISH_PX - camX;
  if (fx >= 0 && fx <= w) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(fx, 0); ctx.lineTo(fx, h); ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ─── 경주 루프 ───────────────────────────────────────────────────────────────
function _drLoop() {
  if (!_drSt || !_drSt.running) return;
  _drSt.frame++;
  _drSt.waveOff++;
  // (요청사항) 경주 중 효과음(가벼운 틱)
  try{
    if (_drSt.frame % 18 === 0) _drPlayRunTick();
  }catch(e){}

  _drSt.ducks.forEach(function(duck, i) {
    if (duck.finished) return;

    duck.evTimer--;
    if (duck.evTimer <= 0) {
      if (duck.evActive) {
        duck.evActive = false;
        duck.speed    = duck.baseSpeed;
      }
      duck.nextEvIn = Math.round(80 + Math.random() * 150);
      duck.evTimer  = duck.nextEvIn;
    }

    if (!duck.evActive && duck.evTimer === duck.nextEvIn - 1 && Math.random() < 0.72) {
      var ev       = _DR_EVENTS[Math.floor(Math.random() * _DR_EVENTS.length)];
      duck.evActive = true;
      duck.evTimer  = ev.dur;
      duck.speed    = duck.baseSpeed * ev.mult;
      _drShowEvBadge(i, ev.label);
      try{ _drPlayEvent(ev.mult); }catch(e){}
    }

    duck.x += duck.speed * (0.85 + Math.random() * 0.3);

    if (duck.x >= _DR_FINISH_PX) {
      duck.x        = _DR_FINISH_PX;
      duck.finished = true;
      duck.speed    = 0;
      _drSt.rankCount++;
      duck.rank = _drSt.rankCount;
      try{ _drPlayFinish(duck.rank); }catch(e){}
      if (duck.rank === 1) {
        _drSt.firstFinished      = true;
        _drSt.firstFinishedFrame = _drSt.frame;
        _drPlayWin();
        var st = document.getElementById('dr-status');
        if (st) st.innerHTML = '🥇 <strong>' + duck.emoji + ' ' + duck.name + '</strong> 1등 확정!';
      }
    }

  });

  // leadX: 완주 포함 전체 오리 중 가장 앞선 위치
  var leadX = 0;
  _drSt.ducks.forEach(function(d) { if (d.x > leadX) leadX = d.x; });

  // DOM 위치 갱신
  _drSt.ducks.forEach(function(duck, i) {
    var el = document.getElementById('dr-duck-' + i);
    if (el) el.style.left = Math.round(duck.x) + 'px';
  });

  // 카메라 팔로우
  var wrap = document.getElementById('dr-pool-wrap');
  if (wrap) {
    var viewW     = wrap.offsetWidth;
    var targetCam = Math.max(0, Math.min(leadX - viewW * 0.38, _DR_POOL_W - viewW));
    _drSt.cameraX += (targetCam - _drSt.cameraX) * 0.07;
    var inner = document.getElementById('dr-pool-inner');
    if (inner) inner.style.transform = 'translateX(' + (-Math.round(_drSt.cameraX)) + 'px)';
  }

  if (_drSt.frame % 2 === 0) _drDrawBG(_drSt.cameraX);

  // 진행도 업데이트 (매 5프레임)
  if (_drSt.frame % 5 === 0) {
    var pct = Math.min(100, Math.round(leadX / _DR_FINISH_PX * 100));
    var remaining = 100 - pct;
    var bar = document.getElementById('dr-progress-bar');
    var lbl = document.getElementById('dr-progress-label');
    if (bar) bar.style.width = pct + '%';
    if (lbl) {
      if (_drSt.firstFinished) {
        var remFrames = 300 - (_drSt.frame - _drSt.firstFinishedFrame);
        var remSec = Math.ceil(Math.max(0, remFrames) / 60);
        lbl.textContent = '⏳ ' + remSec + '초 후 미완주 오리 강제 종료';
        lbl.style.color = remSec <= 2 ? '#e74c3c' : '#e67e22';
      } else {
        var leader = _drSt.ducks.slice().sort(function(a,b){ return b.x - a.x; })[0];
        lbl.textContent = '🥇 ' + (leader ? leader.emoji + ' ' + leader.name : '선두') + ' — 결승까지 ' + remaining + '% 남음';
        lbl.style.color = '';
      }
    }
  }

  // 실시간 순위판 (매 15프레임)
  if (_drSt.frame % 15 === 0) {
    var board = document.getElementById('dr-rank-board');
    if (board) {
      var sorted2 = _drSt.ducks.slice().sort(function(a, b) {
        if (a.finished !== b.finished) return a.finished ? -1 : 1;
        return b.x - a.x;
      });
      board.innerHTML = sorted2.map(function(d, i) {
        var p2 = Math.min(100, Math.round(d.x / _DR_FINISH_PX * 100));
        var bg = d.finished ? '#fef9c3' : 'var(--white)';
        var bdr = d.finished ? '#fbbf24' : 'var(--border)';
        var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'위';
        return '<span class="dr-rank-chip'+(d.finished?' is-finished':'')+'" style="border-color:'+bdr+';background:'+bg+'">'
          + medal + ' ' + d.emoji + ' ' + d.name
          + '<span style="color:var(--text3);font-weight:400;font-size:10px;margin-left:2px">' + p2 + '%</span></span>';
      }).join('');
    }
  }

  // 전원 완주 체크 또는 1등 후 타임아웃 (5초)
  var allDone = _drSt.ducks.every(function(d) { return d.finished; });
  var timedOut = _drSt.firstFinished && (_drSt.frame > _drSt.firstFinishedFrame + 300);
  if (allDone || timedOut) {
    // 미완주 오리 강제 순위 처리 (위치 순)
    var unfinished = _drSt.ducks.filter(function(d){ return !d.finished; });
    unfinished.sort(function(a,b){ return b.x - a.x; });
    unfinished.forEach(function(d) {
      _drSt.rankCount++;
      d.rank = _drSt.rankCount;
      d.finished = true;
    });
    _drSt.running  = false;
    _drSt.finished = true;
    var winner = _drSt.ducks.find(function(d){ return d.rank === 1; });
    setTimeout(function(){ _drShowResult(winner); }, 500);
    return;
  }

  if (_drSt.running) {
    _drAnimId = requestAnimationFrame(_drLoop);
  }
}

// ─── 이벤트 배지 ─────────────────────────────────────────────────────────────
function _drShowEvBadge(idx, label) {
  var inner = document.getElementById('dr-pool-inner');
  if (!inner || !_drSt) return;
  var duck  = _drSt.ducks[idx];
  var badge = document.createElement('div');
  badge.className  = 'dr-ev-badge';
  badge.textContent = label;
  var lH2 = _drSt.laneH || _DR_LANE_H;
  badge.style.left = Math.round(duck.x) + 'px';
  badge.style.top  = (idx * lH2 + 4) + 'px';
  inner.appendChild(badge);
  setTimeout(function(){ badge.remove(); }, 1600);
}

// ─── 결과 오버레이 ────────────────────────────────────────────────────────────
function _drShowResult(winner) {
  var now = new Date();
  var timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  var dateStr = (now.getMonth()+1) + '/' + now.getDate() + ' ' + timeStr;

  var sorted = _drSt.ducks.slice().sort(function(a, b) { return a.rank - b.rank || b.x - a.x; });

  // 이력 저장 (전체 순위 포함)
  var hist = _drGetHistory();
  hist.unshift({
    time:         dateStr,
    winner:       winner.emoji + ' ' + winner.name,
    participants: _drSt.ducks.length,
    rankings:     sorted.map(function(d, i) {
      return { rank: d.rank || (i+1), emoji: d.emoji, name: d.name };
    }),
  });
  _drSaveHistory(hist);

  // 결과 카드 (인라인)
  var rankLines = sorted.map(function(d, i) {
    var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':((i+1)+'위');
    return '<div style="display:flex;align-items:center;gap:8px;padding:3px 0">'
      + '<span style="font-weight:900;min-width:28px">' + medal + '</span>'
      + '<span style="font-size:var(--fs-lg)">' + d.emoji + '</span>'
      + '<span style="font-weight:700;font-size:14px">' + d.name + '</span>'
      + '</div>';
  }).join('');

  // (요청사항) 결과는 팝업으로 표시
  if (typeof window._rrShowPopup === 'function') {
    window._rrShowPopup('🐥 경주 결과', ''
      + '<div style="text-align:center;padding:4px 2px">'
      +   '<div style="font-size:44px;line-height:1;margin-bottom:8px">🏆</div>'
      +   '<div class="dr-result-winner" style="margin:0 0 10px">' + winner.emoji + ' ' + winner.name + '</div>'
      +   '<div class="dr-result-rank" style="text-align:left;max-height:260px;overflow:auto">' + rankLines + '</div>'
      +   '<div style="display:flex;justify-content:flex-end;margin-top:12px">'
      +     '<button class="btn btn-b btn-sm" onclick="_drResetRace();_rrClosePopup && _rrClosePopup()">🔄 다시하기</button>'
      +   '</div>'
      + '</div>');
  } else {
    var card = document.createElement('div');
    card.className = 'dr-result-card';
    card.id = 'dr-result-overlay';
    card.innerHTML =
      '<span class="dr-result-trophy">🏆</span>'
      + '<div style="font-size:var(--fs-base);font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:6px">🎉 경주 결과!</div>'
      + '<div class="dr-result-winner">' + winner.emoji + ' ' + winner.name + '</div>'
      + '<div class="dr-result-rank">' + rankLines + '</div>'
      + '<button onclick="_drResetRace()" class="dr-btn-primary">🔄 다시하기</button>';

    var root = document.getElementById('dr-root');
    if (root) {
      root.appendChild(card);
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  var status = document.getElementById('dr-status');
  if (status) status.innerHTML = '🏆 ' + winner.emoji + ' <strong>' + winner.name + '</strong> 우승! (' + timeStr + ')';
}

// ─── 리셋 ────────────────────────────────────────────────────────────────────
function _drResetRace() {
  if (_drAnimId) { cancelAnimationFrame(_drAnimId); _drAnimId = null; }
  var ov = document.getElementById('dr-result-overlay');
  if (ov) ov.remove();
  _drSt = null;

  var root = document.getElementById('dr-root');
  if (root) _drRenderSetup(root, _drNameCache);
}

// ─── 오디오 ──────────────────────────────────────────────────────────────────
function _drGetAC() {
  if (!_drAC) {
    try { _drAC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { _drAC = null; }
  }
  return _drAC;
}

function _drPlayWin() {
  var ac = _drGetAC();
  if (!ac) return;
  var notes = [523, 659, 784, 1047, 1319];
  notes.forEach(function(freq, i) {
    var t    = ac.currentTime + i * 0.13;
    var osc  = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.value = freq;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

function _drPlayStart() {
  var ac = _drGetAC();
  if (!ac) return;
  var notes = [220, 330, 440];
  notes.forEach(function(freq, i) {
    var t    = ac.currentTime + i * 0.08;
    var osc  = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t);
    osc.stop(t + 0.18);
  });
}

function _drPlayRunTick() {
  var ac = _drGetAC();
  if (!ac) return;
  var t = ac.currentTime;
  var o = ac.createOscillator();
  var g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(480 + Math.random()*140, t);
  g.gain.setValueAtTime(0.03, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.start(t);
  o.stop(t + 0.06);
}

function _drPlayEvent(mult) {
  var ac = _drGetAC();
  if (!ac) return;
  var t = ac.currentTime;
  var up = (mult && mult >= 1.0);
  var f1 = up ? 740 : 320;
  var f2 = up ? 980 : 240;
  [f1, f2].forEach(function(freq, i){
    var tt = t + i*0.06;
    var o = ac.createOscillator();
    var g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = up ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(freq, tt);
    g.gain.setValueAtTime(0.05, tt);
    g.gain.exponentialRampToValueAtTime(0.001, tt + 0.10);
    o.start(tt);
    o.stop(tt + 0.10);
  });
}

function _drPlayFinish(rank) {
  var ac = _drGetAC();
  if (!ac) return;
  if (!(rank >= 1 && rank <= 5)) return;
  var t = ac.currentTime;
  var base = 520 + (5-rank)*90;
  var o = ac.createOscillator();
  var g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'square';
  o.frequency.setValueAtTime(base, t);
  g.gain.setValueAtTime(0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  o.start(t);
  o.stop(t + 0.08);
}
