// ─── 🐥 오리경주 ──────────────────────────────────────────────────────────────

(function _drInjectCSS() {
  if (document.getElementById('dr-style')) return;
  const s = document.createElement('style');
  s.id = 'dr-style';
  s.textContent = [
    '#dr-root{font-family:inherit;width:100%}',
    '.dr-setup{background:var(--white);border:2px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px}',
    '.dr-pool-wrap{position:relative;overflow:hidden;border-radius:14px;border:3px solid #2aace0;box-shadow:0 4px 20px rgba(30,100,160,.25)}',
    '.dr-pool-inner{position:relative;height:100%}',
    '.dr-duck-el{position:absolute;display:flex;flex-direction:column;align-items:center;transform:translateX(-50%);pointer-events:none;transition:left 0s}',
    '.dr-duck-emoji{font-size:30px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25))}',
    '.dr-duck-name{font-size:11px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8);white-space:nowrap;max-width:72px;overflow:hidden;text-overflow:ellipsis;text-align:center;background:rgba(0,0,0,.28);padding:1px 4px;border-radius:4px;margin-top:1px}',
    '.dr-finish-flag{position:absolute;top:0;display:flex;flex-direction:column;pointer-events:none}',
    '.dr-result-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:9999;animation:drFadeIn .3s ease}',
    '.dr-result-box{background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:3px solid #FF89AB;border-radius:20px;padding:32px 40px;text-align:center;max-width:90vw;box-shadow:0 16px 48px rgba(0,0,0,.25);animation:drPopIn .45s cubic-bezier(.175,.885,.32,1.35)}',
    '.dr-result-trophy{font-size:64px;display:block;margin-bottom:8px}',
    '.dr-result-winner{font-size:26px;font-weight:900;color:#C0274A;margin:8px 0;word-break:keep-all}',
    '.dr-result-rank{font-size:13px;color:var(--text3);margin-bottom:20px;line-height:1.7}',
    '.dr-btn-primary{background:linear-gradient(135deg,#FF4B6E,#FF89AB);color:#fff;border:none;border-radius:12px;padding:12px 28px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 4px 0 #C0274A;transition:transform .1s,box-shadow .1s;font-family:inherit}',
    '.dr-btn-primary:active{transform:translateY(3px);box-shadow:0 1px 0 #C0274A}',
    '.dr-btn-secondary{background:var(--surface);color:var(--text2);border:2px solid var(--border);border-radius:10px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:.1s}',
    '.dr-btn-secondary:hover{border-color:var(--text3)}',
    '.dr-ev-badge{position:absolute;background:rgba(255,255,80,.92);border-radius:6px;padding:2px 7px;font-size:11px;font-weight:700;color:#333;pointer-events:none;animation:drBadgePop 1.6s ease forwards;white-space:nowrap;z-index:10}',
    '@keyframes drFadeIn{from{opacity:0}to{opacity:1}}',
    '@keyframes drPopIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}',
    '@keyframes drBadgePop{0%{opacity:1;transform:translateY(0)}70%{opacity:1;transform:translateY(-22px)}100%{opacity:0;transform:translateY(-34px)}}',
    '@keyframes drWave{0%{d:path("M0,8 C180,0 360,16 540,8 C720,0 900,16 1080,8 C1260,0 1440,16 1440,8 L1440,30 L0,30 Z")}50%{d:path("M0,16 C180,8 360,0 540,16 C720,8 900,0 1080,16 C1260,8 1440,0 1440,16 L1440,30 L0,30 Z")}100%{d:path("M0,8 C180,0 360,16 540,8 C720,0 900,16 1080,8 C1260,0 1440,16 1440,8 L1440,30 L0,30 Z")}}',
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

// ─── 공개 API ────────────────────────────────────────────────────────────────
function _drInit() {
  const root = document.getElementById('dr-root');
  if (!root) return;
  const saved = localStorage.getItem('su_dr_n') || '';
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
  root.innerHTML = `
<div class="dr-setup">
  <div style="font-size:13px;font-weight:700;color:var(--text2);margin-bottom:8px">🐥 참가자 이름 (쉼표 구분, 2~12명)</div>
  <textarea id="dr-names-ta" rows="3" oninput="_drSaveNames(this.value)"
    style="width:100%;border:2px solid var(--border);border-radius:10px;padding:10px 12px;font-size:15px;line-height:1.7;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box"
    placeholder="예: 김스타, 이스타, 박스타">${saved}</textarea>
  <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
    <button onclick="_drAutoFill()" class="dr-btn-secondary">👥 스트리머 자동입력</button>
    <button onclick="document.getElementById('dr-names-ta').value='';_drSaveNames('')" class="dr-btn-secondary">🗑 지우기</button>
  </div>
</div>
<div style="text-align:center;padding:8px 0 4px">
  <button onclick="_drBeginRace()" class="dr-btn-primary" style="font-size:18px;padding:14px 44px">🚀 경주 시작!</button>
</div>`;
}

function _drSaveNames(val) {
  localStorage.setItem('su_dr_n', val);
}

function _drAutoFill() {
  if (typeof players === 'undefined' || !players.length) return;
  const names = players.map(function(p){ return p.name; }).join(', ');
  const ta = document.getElementById('dr-names-ta');
  if (ta) ta.value = names;
  _drSaveNames(names);
}

// ─── 경주 시작 ───────────────────────────────────────────────────────────────
function _drBeginRace() {
  const ta  = document.getElementById('dr-names-ta');
  const raw = ta ? ta.value : (localStorage.getItem('su_dr_n') || '');
  const names = raw.split(',').map(function(v){ return v.trim(); }).filter(function(v){ return v; });
  if (names.length < 2)  { alert('참가자를 2명 이상 입력해 주세요.'); return; }
  if (names.length > 12) { alert('최대 12명까지 가능합니다.'); return; }

  _drSt = {
    names: names,
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
    running:   true,
    finished:  false,
    frame:     0,
    cameraX:   0,
    waveOff:   0,
    rankCount: 0,
  };

  const root = document.getElementById('dr-root');
  _drRenderRace(root);
}

// ─── 경주 화면 렌더 ──────────────────────────────────────────────────────────
function _drRenderRace(root) {
  if (!root || !_drSt) return;
  const n       = _drSt.ducks.length;
  const canvasH = _DR_LANE_H * n;
  const viewW   = Math.min(window.innerWidth - 32, 920);

  root.innerHTML = `
<div class="dr-pool-wrap" id="dr-pool-wrap" style="width:${viewW}px;height:${canvasH}px">
  <canvas id="dr-bg-canvas" style="position:absolute;top:0;left:0;display:block"></canvas>
  <div id="dr-pool-inner" class="dr-pool-inner" style="position:absolute;top:0;left:0;width:${_DR_POOL_W}px"></div>
</div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;flex-wrap:wrap;gap:8px">
  <div id="dr-status" style="font-size:14px;font-weight:700;color:var(--text2)">🏁 경주 중!</div>
  <button onclick="_drResetRace()" class="dr-btn-secondary">🔄 다시하기</button>
</div>`;

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
    el.style.top  = (i * _DR_LANE_H + Math.round(_DR_LANE_H / 2) - 28) + 'px';
    el.style.left = duck.x + 'px';
    el.innerHTML  = '<span class="dr-duck-emoji">' + duck.emoji + '</span>'
                  + '<span class="dr-duck-name">'  + duck.name  + '</span>';
    inner.appendChild(el);
  });

  // 첫 프레임 배경 그리기
  _drDrawBG(0);

  // 이미 완료된 경주라면 루프 불필요
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
  var off = _drSt.waveOff;

  // 물 배경
  var bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0,   '#5bc8f5');
  bg.addColorStop(0.5, '#2aace0');
  bg.addColorStop(1,   '#0d7bb0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 레인 구분선
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.lineWidth   = 1;
  for (var i = 1; i < n; i++) {
    var ly = i * _DR_LANE_H;
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(w, ly); ctx.stroke();
  }

  // 거리 마커 (가상 좌표 → 화면 좌표)
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.font = '11px sans-serif';
  for (var m = 500; m < _DR_FINISH_PX; m += 500) {
    var sx = m - camX;
    if (sx < -20 || sx > w + 20) continue;
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
    ctx.fillText(m + 'm', sx + 3, 12);
  }

  // 결승선 표시
  var fx = _DR_FINISH_PX - camX;
  if (fx >= 0 && fx <= w) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(fx, 0); ctx.lineTo(fx, h); ctx.stroke();
    ctx.setLineDash([]);
  }

  // 물결 (레인별 2개)
  for (var lane = 0; lane < n; lane++) {
    var lTop = lane * _DR_LANE_H;
    var lH   = _DR_LANE_H;
    for (var wi = 0; wi < 2; wi++) {
      var freq  = 0.007 + wi * 0.004;
      var amp   = 7   + wi * 5;
      var yBase = lTop + lH * (0.55 + wi * 0.22);
      var ph    = off * (0.9 + wi * 0.5) * 0.05 + lane * 1.8;
      ctx.beginPath();
      ctx.moveTo(0, yBase);
      for (var x = 0; x <= w; x += 5) {
        ctx.lineTo(x, yBase + Math.sin(x * freq + ph) * amp);
      }
      ctx.lineTo(w, lTop + lH);
      ctx.lineTo(0, lTop + lH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(' + (8 + wi * 20) + ',' + (80 + wi * 50) + ',180,' + (0.14 - wi * 0.04) + ')';
      ctx.fill();
    }
  }
}

// ─── 경주 루프 ───────────────────────────────────────────────────────────────
function _drLoop() {
  if (!_drSt || !_drSt.running) return;
  _drSt.frame++;
  _drSt.waveOff++;

  var leadX = 0;

  _drSt.ducks.forEach(function(duck, i) {
    if (duck.finished) return;

    // 이벤트 타이머
    duck.evTimer--;
    if (duck.evTimer <= 0) {
      if (duck.evActive) {
        duck.evActive = false;
        duck.speed    = duck.baseSpeed;
      }
      // 다음 이벤트까지 대기
      duck.nextEvIn = Math.round(80 + Math.random() * 150);
      duck.evTimer  = duck.nextEvIn;
    }

    // 새 이벤트 발생
    if (!duck.evActive && duck.evTimer === duck.nextEvIn - 1 && Math.random() < 0.72) {
      var ev       = _DR_EVENTS[Math.floor(Math.random() * _DR_EVENTS.length)];
      duck.evActive = true;
      duck.evTimer  = ev.dur;
      duck.speed    = duck.baseSpeed * ev.mult;
      _drShowEvBadge(i, ev.label);
    }

    // 이동 (약간 랜덤성 추가)
    duck.x += duck.speed * (0.85 + Math.random() * 0.3);

    // 결승 체크
    if (duck.x >= _DR_FINISH_PX) {
      duck.x       = _DR_FINISH_PX;
      duck.finished = true;
      _drSt.rankCount++;
      duck.rank = _drSt.rankCount;
      if (duck.rank === 1) {
        _drSt.running  = false;
        _drSt.finished = true;
        _drPlayWin();
        setTimeout(function(){ _drShowResult(duck); }, 600);
      }
    }

    if (duck.x > leadX) leadX = duck.x;
  });

  // DOM 위치 갱신
  _drSt.ducks.forEach(function(duck, i) {
    var el = document.getElementById('dr-duck-' + i);
    if (el) el.style.left = Math.round(duck.x) + 'px';
  });

  // 카메라 스무스 팔로우
  var wrap = document.getElementById('dr-pool-wrap');
  if (wrap) {
    var viewW     = wrap.offsetWidth;
    var targetCam = Math.max(0, Math.min(leadX - viewW * 0.38, _DR_POOL_W - viewW));
    _drSt.cameraX += (targetCam - _drSt.cameraX) * 0.07;
    var inner = document.getElementById('dr-pool-inner');
    if (inner) inner.style.transform = 'translateX(' + (-Math.round(_drSt.cameraX)) + 'px)';
  }

  // 배경 재그리기 (매 2프레임)
  if (_drSt.frame % 2 === 0) _drDrawBG(_drSt.cameraX);

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
  badge.style.left = Math.round(duck.x) + 'px';
  badge.style.top  = (idx * _DR_LANE_H + 4) + 'px';
  inner.appendChild(badge);
  setTimeout(function(){ badge.remove(); }, 1600);
}

// ─── 결과 오버레이 ────────────────────────────────────────────────────────────
function _drShowResult(winner) {
  var timeStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  // 순위 목록 (2등 이후)
  var rankLines = '';
  var sorted = _drSt.ducks.slice().sort(function(a, b) { return a.rank - b.rank || b.x - a.x; });
  for (var i = 1; i < sorted.length; i++) {
    var d = sorted[i];
    rankLines += (i + 1) + '위 ' + d.emoji + ' ' + d.name + (i < sorted.length - 1 ? '<br>' : '');
  }

  var overlay = document.createElement('div');
  overlay.className = 'dr-result-overlay';
  overlay.id = 'dr-result-overlay';
  overlay.innerHTML =
    '<div class="dr-result-box">'
    + '<span class="dr-result-trophy">🏆</span>'
    + '<div style="font-size:13px;color:var(--text3);margin-bottom:4px">🥇 1등</div>'
    + '<div class="dr-result-winner">' + winner.emoji + ' ' + winner.name + '</div>'
    + (rankLines
       ? '<div class="dr-result-rank">' + rankLines + '</div>'
       : '<div style="height:8px"></div>')
    + '<button onclick="document.getElementById(\'dr-result-overlay\').remove();_drResetRace()" class="dr-btn-primary">🔄 다시하기</button>'
    + '</div>';
  document.body.appendChild(overlay);

  var status = document.getElementById('dr-status');
  if (status) status.textContent = '🏆 ' + winner.emoji + ' ' + winner.name + ' 1등! (' + timeStr + ')';
}

// ─── 리셋 ────────────────────────────────────────────────────────────────────
function _drResetRace() {
  if (_drAnimId) { cancelAnimationFrame(_drAnimId); _drAnimId = null; }
  var ov = document.getElementById('dr-result-overlay');
  if (ov) ov.remove();
  _drSt = null;

  var root = document.getElementById('dr-root');
  if (root) _drRenderSetup(root, localStorage.getItem('su_dr_n') || '');
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
