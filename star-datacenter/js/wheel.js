// ─── 🎡 룰렛 휠 ─────────────────────────────────────────────────────────────

(function _whInjectCSS() {
  if (document.getElementById('wh-style')) return;
  const s = document.createElement('style');
  s.id = 'wh-style';
  s.textContent = [
    '#wh-root{font-family:inherit;width:100%}',
    '.wh-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}',
    '.wh-input-row{width:100%;display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.wh-textarea{flex:1;min-width:0;border:2px solid var(--border);border-radius:10px;padding:8px 12px;font-size:14px;font-family:inherit;resize:none;height:64px;color:var(--text1);background:var(--white);line-height:1.6;outline:none;transition:border-color .18s}',
    '.wh-textarea:focus{border-color:#FF4B6E;box-shadow:0 0 0 3px rgba(255,75,110,.12)}',
    '.wh-speed-wrap{display:flex;align-items:center;gap:6px;flex-shrink:0;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:5px 10px}',
    '.wh-speed-lbl{font-size:12px;font-weight:700;color:var(--text3);min-width:60px}',
    '.wh-canvas-wrap{position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.wh-pointer{position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-size:26px;z-index:10;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25));animation:whBob 1.2s ease-in-out infinite}',
    '@keyframes whBob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(4px)}}',
    '#wh-canvas{border-radius:50%;display:block;box-shadow:0 8px 0 rgba(0,0,0,.18),0 0 0 5px rgba(255,75,110,.18),0 14px 32px rgba(0,0,0,.15)}',
    '.wh-btn-spin{font-size:clamp(16px,2.2vw,22px);font-weight:900;color:#fff;background:linear-gradient(135deg,#FF4B6E,#FF89AB);border:none;border-radius:30px;padding:12px 44px;cursor:pointer;box-shadow:0 5px 0 #C0274A;transition:transform .12s,box-shadow .12s;letter-spacing:.5px;font-family:inherit;flex-shrink:0}',
    '.wh-btn-spin:hover{transform:translateY(-2px);box-shadow:0 7px 0 #C0274A}',
    '.wh-btn-spin:active{transform:translateY(3px);box-shadow:0 2px 0 #C0274A}',
    '.wh-btn-spin:disabled{background:linear-gradient(135deg,#aaa,#888);box-shadow:0 4px 0 #555;cursor:not-allowed;transform:none}',
    '.wh-btn-spin.spinning{animation:whPulse .5s ease-in-out infinite alternate}',
    '@keyframes whPulse{from{box-shadow:0 5px 0 #C0274A}to{box-shadow:0 5px 20px rgba(255,75,110,.5),0 5px 0 #C0274A}}',
    '.wh-hist-box{width:100%;background:var(--white);border:2px solid var(--border);border-radius:14px;padding:12px 14px;margin-top:4px}',
    '.wh-hist-item{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)}',
    '.wh-hist-item:last-child{border-bottom:none}',
    '.wh-particle{position:fixed;pointer-events:none;font-size:22px;z-index:10000;animation:whParticle 1.2s ease-out forwards}',
    '@keyframes whPop{0%{transform:scale(0) rotate(-20deg);opacity:0}100%{transform:scale(1);opacity:1}}',
    '@keyframes whSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}',
    '@keyframes whBounce{from{transform:translateY(0)}to{transform:translateY(-8px)}}',
    '@keyframes whParticle{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0) rotate(var(--rot));opacity:0}}',
    '@keyframes whCardAppear{0%{opacity:0;transform:scale(0.7) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 상수 ────────────────────────────────────────────────────────────────────
const _WH_COLORS = [
  ['#FF6B6B','#fff'],['#FFA502','#fff'],['#2ED573','#fff'],['#1E90FF','#fff'],
  ['#A29BFE','#fff'],['#FD79A8','#fff'],['#00CEC9','#fff'],['#E17055','#fff'],
  ['#6C5CE7','#fff'],['#FDCB6E','#333'],['#55EFC4','#333'],['#FAB1A0','#333'],
];
const _WH_SPEED_DUR   = [6000, 4800, 3500, 2500, 1600];
const _WH_SPEED_LBLS  = ['느리게','천천히','보통','빠르게','매우빠르게'];
const _WH_CONFETTI    = ['🎉','✨','🎊','🎈','💫','🌟','🥳','🎆','🎇','🎁'];

// ─── 상태 ────────────────────────────────────────────────────────────────────
let _whAngle      = 0;
let _whSpinning   = false;
let _whAnimId     = null;
let _whAC         = null;
let _whSpinDur    = _WH_SPEED_DUR[+(localStorage.getItem('su_wh_speed') ?? 2)] ?? 3500;
let _whHistory    = [];
try { _whHistory = JSON.parse(localStorage.getItem('su_wh_hist') || '[]'); } catch(e) {}
let _whStats      = {};
try { _whStats    = JSON.parse(localStorage.getItem('su_wh_stats') || '{}'); } catch(e) {}

// ─── 공개 API ────────────────────────────────────────────────────────────────
function _whInit() {
  const root = document.getElementById('wh-root');
  if (!root) return;
  _whRender(root);
}

// ─── 렌더 ────────────────────────────────────────────────────────────────────
function _whRender(root) {
  const savedInput = localStorage.getItem('su_wh_input') || '';
  const speedIdx   = _WH_SPEED_DUR.indexOf(_whSpinDur);
  const sIdx       = speedIdx >= 0 ? speedIdx : 2;

  root.innerHTML =
    '<div class="wh-wrap">'
    // 입력 + 속도 행
    + '<div class="wh-input-row">'
    + '<textarea class="wh-textarea" id="wh-input" placeholder="이름 입력... (쉼표로 구분)" oninput="_whOnInput(this.value)">' + savedInput + '</textarea>'
    + '<button onclick="_whShuffleInput()" style="padding:6px 12px;border-radius:10px;border:1.5px solid var(--border);background:var(--surface);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">🔀 섞기</button>'
    + '<div class="wh-speed-wrap"><span style="font-size:12px;font-weight:700;color:var(--text3)">⚡</span><input type="range" id="wh-speed" min="1" max="5" value="' + (sIdx+1) + '" oninput="_whUpdateSpeed(this.value)" style="width:70px;accent-color:#FF4B6E"><span class="wh-speed-lbl" id="wh-speed-lbl">' + _WH_SPEED_LBLS[sIdx] + '</span></div>'
    + '</div>'
    // 캔버스 + 버튼
    + '<div class="wh-canvas-wrap" id="wh-canvas-wrap">'
    + '<div class="wh-pointer">▼</div>'
    + '<canvas id="wh-canvas"></canvas>'
    + '</div>'
    + '<button class="wh-btn-spin" id="wh-btn-spin" onclick="_whSpin()">🎡 돌려라!</button>'
    // 결과 카드 (hidden 초기)
    + '<div id="wh-result-card" style="display:none;width:100%;max-width:480px;background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:2.5px solid #FF89AB;border-radius:16px;padding:20px;text-align:center;box-sizing:border-box;animation:whCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)">'
    + '<div style="font-size:15px;font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:10px">🎊 당첨!</div>'
    + '<div id="wh-res-icon" style="font-size:52px;margin-bottom:6px;line-height:1.1">🏆</div>'
    + '<div id="wh-res-name" style="font-size:clamp(28px,6vw,48px);font-weight:900;color:#C0274A;word-break:break-all;margin-bottom:14px"></div>'
    + '<button onclick="_whSpin()" style="font-family:inherit;font-size:15px;font-weight:700;color:#fff;background:linear-gradient(135deg,#FF4B6E,#FF89AB);border:none;border-radius:22px;padding:10px 28px;cursor:pointer;box-shadow:0 4px 0 #C0274A;transition:transform .12s,box-shadow .12s" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'">🎡 다시 돌리기</button>'
    + '</div>'
    // 히스토리
    + _whHistHTML()
    + '</div>';

  _whSetSize();
  _whDraw(_whAngle);
}

function _whHistHTML() {
  if (!_whHistory.length) return '';
  const rows = _whHistory.slice(0, 8).map(function(h, i) {
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'위';
    return '<div class="wh-hist-item">'
      + '<span style="font-size:15px;min-width:26px">' + medal + '</span>'
      + '<span style="font-weight:700;color:var(--text1);flex:1">' + h.name + '</span>'
      + '<span style="font-size:11px;color:var(--text3)">' + h.time + '</span>'
      + '</div>';
  }).join('');
  return '<div class="wh-hist-box">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    + '<span style="font-size:13px;font-weight:700;color:var(--text2)">📋 최근 당첨 기록</span>'
    + '<button onclick="_whClearHistory()" style="font-size:11px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>'
    + '</div>' + rows + '</div>';
}

// ─── 크기 계산 ────────────────────────────────────────────────────────────────
function _whSetSize() {
  const cv = document.getElementById('wh-canvas');
  if (!cv) return;
  const wrap = document.getElementById('wh-canvas-wrap');
  if (!wrap) return;
  const avW  = Math.min(window.innerWidth - 40, 520);
  const avH  = Math.max(200, window.innerHeight - 380);
  const size = Math.max(180, Math.min(avW, avH));
  cv.width = cv.height = size;
  wrap.style.width  = size + 'px';
  wrap.style.height = (size + 20) + 'px';
}

// ─── 휠 그리기 ────────────────────────────────────────────────────────────────
function _whDraw(angle) {
  const cv = document.getElementById('wh-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const names = _whGetNames();
  const n = names.length;
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (!n) {
    ctx.fillStyle = 'var(--surface, #f8f9fa)';
    ctx.beginPath(); ctx.arc(cv.width/2, cv.height/2, cv.width/2 - 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ccc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('이름을 입력하세요', cv.width/2, cv.height/2);
    return;
  }
  const cx = cv.width/2, cy = cx, r = cx - 5;
  const slice = Math.PI * 2 / n;
  for (var i = 0; i < n; i++) {
    const col = _WH_COLORS[i % _WH_COLORS.length];
    const s = angle + i * slice, e = s + slice;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, s, e); ctx.closePath();
    ctx.fillStyle = col[0]; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.stroke();
    // 텍스트
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s + slice/2);
    ctx.textAlign = 'right'; ctx.fillStyle = col[1];
    const fs = Math.min(18, Math.max(9, Math.round(r * 0.13 * (8 / Math.max(n, 4)))));
    ctx.font = 'bold ' + fs + 'px "Noto Sans KR",sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 3;
    ctx.fillText(names[i], r - 12, 5, Math.round(r * 0.55));
    ctx.restore();
  }
  // 테두리
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.stroke();
  // 중심원
  ctx.beginPath(); ctx.arc(cx, cy, cx * 0.1, 0, Math.PI*2);
  ctx.fillStyle = '#fff'; ctx.shadowBlur = 0; ctx.fill();
  ctx.strokeStyle = '#FF89AB'; ctx.lineWidth = 3; ctx.stroke();
  ctx.font = 'bold ' + Math.round(cx * 0.09) + 'px "Noto Sans KR",sans-serif';
  ctx.fillStyle = '#C0274A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('GO!', cx, cy);
}

// ─── 스핀 ────────────────────────────────────────────────────────────────────
function _whSpin() {
  const names = _whGetNames();
  if (names.length < 2) { alert('2명 이상 입력해 주세요.'); return; }
  if (_whSpinning) return;
  _whSpinning = true;
  const btn = document.getElementById('wh-btn-spin');
  if (btn) { btn.disabled = true; btn.textContent = '🎡 돌아가는 중...'; btn.classList.add('spinning'); }
  const prevCard = document.getElementById('wh-result-card');
  if (prevCard) prevCard.style.display = 'none';

  const winIdx  = Math.floor(Math.random() * names.length);
  const slice   = Math.PI * 2 / names.length;
  const target  = -Math.PI / 2 - (winIdx * slice + slice / 2);
  let   diff    = (target - _whAngle) % (Math.PI * 2);
  if (diff > 0) diff -= Math.PI * 2;
  const totalRot = Math.PI * 2 * (8 + Math.floor(Math.random() * 8)) + diff;
  const dur      = _whSpinDur + Math.random() * 800;
  const startAng = _whAngle;
  let   t0 = null, lastTick = 0;
  const tickStep = slice * 0.88;

  function ease(t) { return 1 - Math.pow(1 - t, 3.5); }
  function frame(ts) {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    _whAngle = startAng + totalRot * ease(p);
    _whDraw(_whAngle);
    // 틱 사운드
    const na = ((_whAngle % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
    if (Math.abs(na - lastTick) > tickStep) { lastTick = na; if (p < 0.92) _whPlayTick(); }
    if (p < 1) {
      _whAnimId = requestAnimationFrame(frame);
    } else {
      _whAngle = startAng + totalRot;
      _whSpinning = false;
      if (btn) { btn.disabled = false; btn.textContent = '🎡 돌려라!'; btn.classList.remove('spinning'); }
      const winner = names[winIdx];
      _whAddHistory(winner);
      setTimeout(function() { _whShowResult(winner); }, 250);
    }
  }
  _whAnimId = requestAnimationFrame(frame);
}

// ─── 결과 카드 ────────────────────────────────────────────────────────────────
function _whShowResult(name) {
  const card = document.getElementById('wh-result-card');
  const nameEl = document.getElementById('wh-res-name');
  const iconEl = document.getElementById('wh-res-icon');
  if (!card || !nameEl) return;
  if (nameEl) nameEl.textContent = name;
  if (iconEl) {
    const icons = ['🏆','🥇','🎖️','👑','🌟'];
    iconEl.textContent = icons[Math.floor(Math.random() * icons.length)];
  }
  card.style.display = 'block';
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'whCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)';
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  _whFireConfetti();
  _whPlayWin();
}

// ─── 히스토리 ────────────────────────────────────────────────────────────────
function _whAddHistory(name) {
  const now = new Date();
  const time = (now.getMonth()+1) + '/' + now.getDate() + ' ' + now.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});
  _whHistory.unshift({ name: name, time: time });
  if (_whHistory.length > 20) _whHistory = _whHistory.slice(0, 20);
  _whStats[name] = (_whStats[name] || 0) + 1;
  try { localStorage.setItem('su_wh_hist', JSON.stringify(_whHistory)); } catch(e){}
  try { localStorage.setItem('su_wh_stats', JSON.stringify(_whStats)); } catch(e){}
  // 히스토리 박스 갱신
  const root = document.getElementById('wh-root');
  if (root) {
    let hbox = root.querySelector('.wh-hist-box');
    if (hbox) hbox.outerHTML = _whHistHTML();
    else {
      const wrap = root.querySelector('.wh-wrap');
      if (wrap) wrap.insertAdjacentHTML('beforeend', _whHistHTML());
    }
  }
}
function _whClearHistory() {
  if (!_whHistory.length || !confirm('기록을 모두 삭제할까요?')) return;
  _whHistory = []; _whStats = {};
  localStorage.removeItem('su_wh_hist'); localStorage.removeItem('su_wh_stats');
  const root = document.getElementById('wh-root');
  if (root) { const hbox = root.querySelector('.wh-hist-box'); if (hbox) hbox.remove(); }
}

// ─── 입력 관리 ────────────────────────────────────────────────────────────────
function _whGetNames() {
  const inp = document.getElementById('wh-input');
  const raw = inp ? inp.value : (localStorage.getItem('su_wh_input') || '');
  return raw.split(',').map(function(v){ return v.trim(); }).filter(Boolean);
}
function _whOnInput(val) {
  localStorage.setItem('su_wh_input', val);
  _whDraw(_whAngle);
}
function _whShuffleInput() {
  if (_whSpinning) return;
  const arr = _whGetNames();
  for (var i = arr.length-1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
  const inp = document.getElementById('wh-input');
  if (inp) { inp.value = arr.join(', '); localStorage.setItem('su_wh_input', inp.value); }
  _whDraw(_whAngle);
}
function _whUpdateSpeed(val) {
  const idx = parseInt(val) - 1;
  _whSpinDur = _WH_SPEED_DUR[idx];
  const lbl = document.getElementById('wh-speed-lbl');
  if (lbl) lbl.textContent = _WH_SPEED_LBLS[idx];
  try { localStorage.setItem('su_wh_speed', idx); } catch(e) {}
}

// ─── 사운드 ────────────────────────────────────────────────────────────────────
function _whPlayTick() {
  try {
    if (!_whAC) _whAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _whAC.createOscillator(), g = _whAC.createGain();
    o.connect(g); g.connect(_whAC.destination);
    o.frequency.value = 500 + Math.random()*200; o.type = 'sine';
    g.gain.setValueAtTime(0.08, _whAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _whAC.currentTime + 0.07);
    o.start(); o.stop(_whAC.currentTime + 0.07);
  } catch(e){}
}
function _whPlayWin() {
  try {
    if (!_whAC) _whAC = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784,1047].forEach(function(f, i) {
      setTimeout(function() {
        const o = _whAC.createOscillator(), g = _whAC.createGain();
        o.connect(g); g.connect(_whAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.15, _whAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _whAC.currentTime + 0.32);
        o.start(); o.stop(_whAC.currentTime + 0.32);
      }, i * 120);
    });
  } catch(e){}
}

// ─── 컨페티 ────────────────────────────────────────────────────────────────────
function _whFireConfetti() {
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  for (var i = 0; i < 22; i++) {
    (function(i) {
      setTimeout(function() {
        const el = document.createElement('div');
        el.className = 'wh-particle';
        el.textContent = _WH_CONFETTI[Math.floor(Math.random()*_WH_CONFETTI.length)];
        el.style.left = cx + 'px'; el.style.top = cy + 'px';
        const a = Math.random()*Math.PI*2, d = 80 + Math.random()*260;
        el.style.setProperty('--dx', Math.cos(a)*d + 'px');
        el.style.setProperty('--dy', Math.sin(a)*d + 'px');
        el.style.setProperty('--rot', (Math.random()*720-360) + 'deg');
        document.body.appendChild(el);
        setTimeout(function() { el.remove(); }, 1300);
      }, i * 50);
    })(i);
  }
}
