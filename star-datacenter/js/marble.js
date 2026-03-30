// ─── 🔮 마블 물리 룰렛 ────────────────────────────────────────────────────────

(function _mbInjectCSS() {
  if (document.getElementById('mb-style')) return;
  const s = document.createElement('style');
  s.id = 'mb-style';
  s.textContent = [
    '#mb-root{font-family:inherit;width:100%}',
    '.mb-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%}',
    '.mb-canvas-wrap{position:relative;width:100%;display:flex;justify-content:center}',
    '#mb-canvas{border-radius:16px;display:block;box-shadow:0 4px 24px rgba(0,0,0,.18)}',
    '.mb-btn{font-size:clamp(15px,2vw,20px);font-weight:900;color:#fff;background:linear-gradient(135deg,#6C5CE7,#A29BFE);border:none;border-radius:30px;padding:11px 40px;cursor:pointer;box-shadow:0 5px 0 #4834d4;transition:transform .12s,box-shadow .12s;font-family:inherit}',
    '.mb-btn:hover{transform:translateY(-2px);box-shadow:0 7px 0 #4834d4}',
    '.mb-btn:active{transform:translateY(3px);box-shadow:0 2px 0 #4834d4}',
    '.mb-btn:disabled{background:linear-gradient(135deg,#aaa,#888);box-shadow:0 4px 0 #555;cursor:not-allowed;transform:none}',
    '.mb-hist-box{width:100%;max-width:480px;background:var(--white);border:2px solid var(--border);border-radius:14px;padding:12px 14px}',
    '.mb-hist-item{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)}',
    '.mb-hist-item:last-child{border-bottom:none}',
    '@keyframes mbCardAppear{0%{opacity:0;transform:scale(0.7) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
    '@keyframes mbParticle{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0) rotate(var(--rot));opacity:0}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 색상 팔레트 ─────────────────────────────────────────────────────────────
const _MB_COLORS = [
  '#FF6B6B','#FFA502','#2ED573','#1E90FF',
  '#A29BFE','#FD79A8','#00CEC9','#E17055',
  '#6C5CE7','#FDCB6E','#55EFC4','#FAB1A0',
  '#FF4757','#eccc68','#7bed9f','#70a1ff',
];

// ─── 물리 상수 ────────────────────────────────────────────────────────────────
const _MB_GRAVITY    = 0.28;
const _MB_DAMPING    = 0.994;
const _MB_RESTITUTION = 0.55;
const _MB_WALL_REST  = 0.45;
const _MB_FRICTION   = 0.97;
const _MB_SPEED_CAP  = 16;

// ─── 상태 ────────────────────────────────────────────────────────────────────
let _mbBalls   = [];
let _mbSegs    = [];   // wall segments [{x1,y1,x2,y2}]
let _mbGeo     = {};   // canvas geometry reference
let _mbRunning = false;
let _mbAnimId  = null;
let _mbWinTimeout = null;
let _mbWinner  = null;
let _mbHistory = [];
let _mbAC      = null;
try { _mbHistory = JSON.parse(localStorage.getItem('su_mb_hist') || '[]'); } catch(e) {}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _mbInit() {
  const root = document.getElementById('mb-root');
  if (!root) return;
  _mbRender(root);
}

function _mbGetNames() {
  const txt = localStorage.getItem('su_mb_input') || '';
  return txt.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
}

// ─── 렌더 ────────────────────────────────────────────────────────────────────
function _mbRender(root) {
  const saved = localStorage.getItem('su_mb_input') || '';
  root.innerHTML =
    '<div class="mb-wrap">'
    + '<div style="width:100%;max-width:480px;display:flex;gap:8px;align-items:flex-start">'
    + '<textarea id="mb-input" style="flex:1;min-width:0;border:2px solid var(--border);border-radius:10px;padding:8px 12px;'
    + 'font-size:14px;font-family:inherit;resize:none;height:68px;color:var(--text1);background:var(--white);line-height:1.6;outline:none;box-sizing:border-box" '
    + 'placeholder="이름 입력... (쉼표 또는 줄바꿈으로 구분)" oninput="_mbOnInput(this.value)">' + saved + '</textarea>'
    + '<button onclick="_mbShuffleInput()" style="padding:6px 12px;border-radius:10px;border:1.5px solid var(--border);background:var(--surface);'
    + 'color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0">🔀 섞기</button>'
    + '</div>'
    + '<div class="mb-canvas-wrap"><canvas id="mb-canvas"></canvas></div>'
    + '<button class="mb-btn" id="mb-btn" onclick="_mbStart()">🔮 굴려라!</button>'
    + '<div id="mb-result-card" style="display:none;width:100%;max-width:480px;background:linear-gradient(135deg,#f0ebff,#f8f5ff);'
    + 'border:2.5px solid #A29BFE;border-radius:16px;padding:20px;text-align:center;box-sizing:border-box">'
    + '<div style="font-size:15px;font-weight:700;color:#A29BFE;letter-spacing:1px;margin-bottom:10px">🎊 당첨!</div>'
    + '<div id="mb-res-icon" style="font-size:48px;margin-bottom:6px;line-height:1.1">🔮</div>'
    + '<div id="mb-res-name" style="font-size:clamp(26px,6vw,46px);font-weight:900;color:#6C5CE7;word-break:break-all;margin-bottom:14px"></div>'
    + '<button onclick="_mbStart()" style="font-family:inherit;font-size:15px;font-weight:700;color:#fff;background:linear-gradient(135deg,#6C5CE7,#A29BFE);'
    + 'border:none;border-radius:22px;padding:10px 28px;cursor:pointer;box-shadow:0 4px 0 #4834d4" '
    + 'onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'">🔮 다시 굴리기</button>'
    + '</div>'
    + _mbHistHTML()
    + '</div>';

  _mbSetupCanvas();
}

function _mbOnInput(val) {
  localStorage.setItem('su_mb_input', val);
}

function _mbShuffleInput() {
  const inp = document.getElementById('mb-input');
  if (!inp) return;
  const names = inp.value.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  inp.value = names.join(', ');
  localStorage.setItem('su_mb_input', inp.value);
}

// ─── 캔버스 초기화 ────────────────────────────────────────────────────────────
function _mbSetupCanvas() {
  const cv = document.getElementById('mb-canvas');
  if (!cv) return;
  const avW = Math.min(window.innerWidth - 40, 480);
  const avH = Math.max(280, Math.min(520, window.innerHeight - 360));
  cv.width  = avW;
  cv.height = avH;
  cv.style.width  = avW + 'px';
  cv.style.height = avH + 'px';
  _mbBuildGeo(avW, avH);
  _mbDrawIdle(cv);
}

// ─── 지오메트리 (깔때기 벽) ───────────────────────────────────────────────────
function _mbBuildGeo(W, H) {
  const cx     = W / 2;
  const padX   = 20;
  const topY   = 12;
  const midY   = H * 0.54;   // 깔때기 시작
  const botY   = H * 0.84;   // 깔때기 끝 / 출구 위
  const hHW    = W * 0.062;  // 출구 반폭 (구슬 하나 통과 크기)

  _mbGeo = { W, H, cx, padX, topY, midY, botY, hHW };

  // 벽 선분: [좌상→좌중→출구좌 , 우상→우중→출구우 , 천장 , 출구 양쪽 세로벽]
  _mbSegs = [
    // 왼쪽 외벽
    { x1: padX,     y1: topY, x2: padX,         y2: midY },
    // 왼쪽 대각 (깔때기)
    { x1: padX,     y1: midY, x2: cx - hHW,     y2: botY },
    // 오른쪽 외벽
    { x1: W-padX,   y1: topY, x2: W-padX,       y2: midY },
    // 오른쪽 대각 (깔때기)
    { x1: W-padX,   y1: midY, x2: cx + hHW,     y2: botY },
    // 천장
    { x1: padX,     y1: topY, x2: W-padX,       y2: topY },
    // 출구 왼쪽 세로
    { x1: cx-hHW,   y1: botY, x2: cx-hHW,       y2: H+20 },
    // 출구 오른쪽 세로
    { x1: cx+hHW,   y1: botY, x2: cx+hHW,       y2: H+20 },
  ];
}

// ─── 그리기 ──────────────────────────────────────────────────────────────────
function _mbDrawIdle(cv) {
  const { W, H } = _mbGeo;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, W, H);
  _mbDrawWalls(ctx, 'rgba(130,110,220,0.7)');
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('이름을 입력하고 굴려라! 버튼을 누르세요', W / 2, H * 0.44);
}

function _mbDrawWalls(ctx, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth   = 3;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  for (const s of _mbSegs) {
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
  }
  ctx.stroke();
}

function _mbDrawFrame(cv) {
  const { W, H } = _mbGeo;
  const ctx = cv.getContext('2d');
  // Background
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, W, H);
  // Walls
  _mbDrawWalls(ctx, 'rgba(130,110,220,0.85)');
  // Balls
  for (const b of _mbBalls) {
    if (!b.alive) continue;
    // Glow
    ctx.shadowColor  = b.color;
    ctx.shadowBlur   = 8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, b.r*0.08, b.x, b.y, b.r);
    grad.addColorStop(0, '#ffffffaa');
    grad.addColorStop(0.35, b.color + 'dd');
    grad.addColorStop(1,   b.color);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    // Name label
    if (b.r >= 13) {
      ctx.fillStyle    = '#fff';
      ctx.font         = `bold ${Math.max(8, Math.round(b.r * 0.7))}px sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur   = 0;
      ctx.fillText(b.short, b.x, b.y);
    }
  }
}

// ─── 공 초기 배치 ─────────────────────────────────────────────────────────────
function _mbInitBalls(names) {
  const { W, H, padX, topY, midY } = _mbGeo;
  const n  = Math.min(names.length, 28);
  const innerW = W - padX * 2;
  // 반지름: 이름 수에 따라 자동 조절
  const r = Math.max(11, Math.min(22, Math.floor(innerW * 0.36 / Math.sqrt(n))));
  const cols = Math.max(2, Math.floor((innerW - r * 2) / (r * 2.1)));
  _mbBalls = [];
  for (let i = 0; i < n; i++) {
    const col_i = i % cols;
    const row_i = Math.floor(i / cols);
    const x = padX + r + col_i * (r * 2.15) + (Math.random() - 0.5) * r * 0.5;
    const y = topY + r + 4 + row_i * (r * 2.2);
    _mbBalls.push({
      x: Math.max(padX + r + 2, Math.min(W - padX - r - 2, x)),
      y: Math.min(y, midY - r - 4),
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 0.3,
      r,
      color: _MB_COLORS[i % _MB_COLORS.length],
      name:  names[i],
      short: names[i].length > 4 ? names[i].slice(0, 3) + '…' : names[i],
      alive: true,
    });
  }
}

// ─── 물리 ────────────────────────────────────────────────────────────────────
function _mbSegCollide(ball) {
  for (const s of _mbSegs) {
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
    const len2 = dx*dx + dy*dy;
    if (len2 < 0.0001) continue;
    const t  = Math.max(0, Math.min(1, ((ball.x - s.x1)*dx + (ball.y - s.y1)*dy) / len2));
    const cx = s.x1 + t*dx;
    const cy = s.y1 + t*dy;
    const ex = ball.x - cx, ey = ball.y - cy;
    const dist = Math.sqrt(ex*ex + ey*ey);
    if (dist < ball.r && dist > 0.0001) {
      const nx = ex/dist, ny = ey/dist;
      ball.x += nx * (ball.r - dist);
      ball.y += ny * (ball.r - dist);
      const dot = ball.vx*nx + ball.vy*ny;
      if (dot < 0) {
        ball.vx -= (1 + _MB_WALL_REST) * dot * nx;
        ball.vy -= (1 + _MB_WALL_REST) * dot * ny;
        ball.vx *= _MB_FRICTION;
        ball.vy *= _MB_FRICTION;
      }
    }
  }
}

function _mbBallCollide() {
  const alive = _mbBalls.filter(b => b.alive);
  for (let i = 0; i < alive.length; i++) {
    for (let j = i+1; j < alive.length; j++) {
      const a = alive[i], b = alive[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const min  = a.r + b.r;
      if (dist < min && dist > 0.0001) {
        const nx = dx/dist, ny = dy/dist;
        const ov = (min - dist) * 0.5;
        a.x -= nx*ov; a.y -= ny*ov;
        b.x += nx*ov; b.y += ny*ov;
        const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
        const dot = dvx*nx + dvy*ny;
        if (dot > 0) {
          const imp = dot * (1 + _MB_RESTITUTION) * 0.5;
          a.vx -= imp*nx; a.vy -= imp*ny;
          b.vx += imp*nx; b.vy += imp*ny;
        }
      }
    }
  }
}

function _mbStep() {
  const { H } = _mbGeo;
  for (const b of _mbBalls) {
    if (!b.alive) continue;
    b.vy += _MB_GRAVITY;
    b.vx *= _MB_DAMPING;
    b.vy *= _MB_DAMPING;
    const spd = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
    if (spd > _MB_SPEED_CAP) { b.vx *= _MB_SPEED_CAP/spd; b.vy *= _MB_SPEED_CAP/spd; }
    b.x += b.vx;
    b.y += b.vy;
    _mbSegCollide(b);
    if (b.y - b.r > H) b.alive = false;
  }
  _mbBallCollide();
}

// ─── 루프 ────────────────────────────────────────────────────────────────────
function _mbLoop(cv) {
  if (!_mbRunning) return;
  _mbStep();
  _mbDrawFrame(cv);

  const dead  = _mbBalls.filter(b => !b.alive);
  const alive = _mbBalls.filter(b => b.alive);

  if (dead.length > 0 && !_mbWinner) {
    _mbWinner  = dead[0];
    _mbRunning = false;
    _mbWinTimeout = setTimeout(() => _mbShowWinner(cv), 500);
  } else if (alive.length === 0 && !_mbWinner) {
    _mbRunning = false;
    const btn = document.getElementById('mb-btn');
    if (btn) btn.disabled = false;
  }

  if (_mbRunning) _mbAnimId = requestAnimationFrame(() => _mbLoop(cv));
}

// ─── 시작 ────────────────────────────────────────────────────────────────────
function _mbStart() {
  const names = _mbGetNames();
  if (names.length < 2) { alert('이름을 2개 이상 입력하세요.'); return; }

  const cv = document.getElementById('mb-canvas');
  if (!cv) return;

  if (_mbAnimId)    { cancelAnimationFrame(_mbAnimId); _mbAnimId = null; }
  if (_mbWinTimeout){ clearTimeout(_mbWinTimeout); _mbWinTimeout = null; }
  _mbRunning = false;
  _mbWinner  = null;

  const card = document.getElementById('mb-result-card');
  if (card) card.style.display = 'none';
  const btn = document.getElementById('mb-btn');
  if (btn) btn.disabled = true;

  _mbInitBalls(names);
  _mbRunning = true;
  _mbAnimId  = requestAnimationFrame(() => _mbLoop(cv));
}

// ─── 결과 표시 ────────────────────────────────────────────────────────────────
function _mbShowWinner(cv) {
  if (!_mbWinner) return;
  _mbDrawFrame(cv);  // 마지막 프레임

  const card   = document.getElementById('mb-result-card');
  const nameEl = document.getElementById('mb-res-name');
  const btn    = document.getElementById('mb-btn');
  if (nameEl) nameEl.textContent = _mbWinner.name;
  if (card) {
    card.style.display   = 'block';
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = 'mbCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)';
  }
  if (btn) btn.disabled = false;

  _mbConfetti();
  _mbPlayWin();

  const now  = new Date();
  const time = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  _mbHistory.unshift({ name: _mbWinner.name, color: _mbWinner.color, time });
  if (_mbHistory.length > 20) _mbHistory.length = 20;
  localStorage.setItem('su_mb_hist', JSON.stringify(_mbHistory));
  _mbRefreshHist();
}

// ─── 이펙트 ──────────────────────────────────────────────────────────────────
function _mbConfetti() {
  const emojis = ['🎉','✨','🎊','🎈','💫','🌟','🥳','🔮'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.cssText =
      `position:fixed;pointer-events:none;font-size:${18+Math.random()*14}px;z-index:10000;` +
      `left:${10+Math.random()*80}%;top:${10+Math.random()*50}%;` +
      `--dx:${(Math.random()-0.5)*220}px;--dy:${60+Math.random()*220}px;--rot:${Math.random()*720}deg;` +
      `animation:mbParticle ${0.8+Math.random()*0.8}s ease-out forwards;animation-delay:${Math.random()*0.25}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
}

function _mbPlayWin() {
  try {
    if (!_mbAC) _mbAC = new (window.AudioContext || window.webkitAudioContext)();
    if (_mbAC.state === 'suspended') _mbAC.resume();
    [0, 0.1, 0.2, 0.35].forEach((t, i) => {
      setTimeout(() => {
        const o = _mbAC.createOscillator(), g = _mbAC.createGain();
        o.type = 'sine';
        o.frequency.value = [523,659,784,1047][i];
        g.gain.setValueAtTime(0.15, _mbAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _mbAC.currentTime + 0.3);
        o.connect(g); g.connect(_mbAC.destination);
        o.start(); o.stop(_mbAC.currentTime + 0.3);
      }, t * 1000);
    });
  } catch(e) {}
}

// ─── 히스토리 ─────────────────────────────────────────────────────────────────
function _mbHistHTML() {
  if (!_mbHistory.length) return '';
  const rows = _mbHistory.slice(0, 8).map((h, i) => {
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'위';
    return '<div class="mb-hist-item">'
      + `<span style="font-size:11px">${medal}</span>`
      + `<span style="width:14px;height:14px;border-radius:50%;background:${h.color||'#888'};display:inline-block;flex-shrink:0"></span>`
      + `<span style="font-weight:700;color:var(--text1);flex:1">${h.name}</span>`
      + `<span style="font-size:11px;color:var(--text3)">${h.time}</span>`
      + '</div>';
  }).join('');
  return '<div class="mb-hist-box">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    + '<span style="font-size:13px;font-weight:700;color:var(--text2)">📋 당첨 기록</span>'
    + '<button onclick="_mbClearHistory()" style="font-size:11px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>'
    + '</div>' + rows + '</div>';
}

function _mbRefreshHist() {
  const wrap = document.querySelector('#mb-root .mb-wrap');
  if (!wrap) return;
  const old = wrap.querySelector('.mb-hist-box');
  const html = _mbHistHTML();
  if (old) old.outerHTML = html || '<span></span>';
  else if (html) wrap.insertAdjacentHTML('beforeend', html);
}

function _mbClearHistory() {
  _mbHistory = [];
  localStorage.removeItem('su_mb_hist');
  _mbRefreshHist();
}
