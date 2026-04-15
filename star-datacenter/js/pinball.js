// ─── 🎮 핀볼 룰렛 ─────────────────────────────────────────────────────────────

(function _pbInjectCSS() {
  if (document.getElementById('pb-style')) return;
  const s = document.createElement('style');
  s.id = 'pb-style';
  s.textContent = [
    '#pb-root{font-family:inherit;width:100%}',
    '.pb-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}',
    '.pb-input-row{width:100%;display:flex;align-items:flex-start;gap:8px}',
    '.pb-textarea{flex:1;min-width:0;border:2px solid var(--border);border-radius:10px;padding:8px 12px;font-size:14px;font-family:inherit;resize:none;height:60px;color:var(--text1);background:var(--white);outline:none;line-height:1.5;transition:border-color .18s}',
    '.pb-textarea:focus{border-color:#6C5CE7;box-shadow:0 0 0 3px rgba(108,92,231,.12)}',
    '#pb-canvas{display:block}',
    '.pb-btn-group{display:flex;gap:8px;align-items:center;justify-content:center;width:100%;flex-wrap:wrap}',
    '.pb-flip-btn{font-size:14px;font-weight:900;color:#fff;border:none;border-radius:14px;padding:12px 20px;cursor:pointer;font-family:inherit;user-select:none;-webkit-user-select:none;touch-action:none;transition:transform .08s,box-shadow .08s}',
    '.pb-flip-btn:active{transform:translateY(2px)}',
    '.pb-launch-btn{font-size:15px;font-weight:900;color:#fff;background:linear-gradient(135deg,#6C5CE7,#a29bfe);border:none;border-radius:22px;padding:12px 28px;cursor:pointer;box-shadow:0 5px 0 #4834d4;transition:transform .08s,box-shadow .08s;font-family:inherit;user-select:none;touch-action:none}',
    '.pb-launch-btn.charging{transform:translateY(3px);box-shadow:0 2px 0 #4834d4;background:linear-gradient(135deg,#a29bfe,#6C5CE7)}',
    '.pb-hist-box{width:100%;background:var(--white);border:2px solid var(--border);border-radius:14px;padding:12px 14px}',
    '.pb-result-card{width:100%;max-width:400px;background:linear-gradient(135deg,#f3f0ff,#faf8ff);border:2.5px solid #a29bfe;border-radius:16px;padding:20px;text-align:center;box-sizing:border-box}',
    '@keyframes pbCardIn{0%{opacity:0;transform:scale(0.7) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 상수 ────────────────────────────────────────────────────────────────────
const _PB_GRAVITY = 0.30;
const _PB_BALL_R  = 9;
const _PB_DAMPING = 0.62;
const _PB_SLOT_CLR = [
  ['#e74c3c','#fff'],['#e67e22','#fff'],['#f39c12','#333'],
  ['#27ae60','#fff'],['#2980b9','#fff'],['#8e44ad','#fff'],
  ['#16a085','#fff'],['#c0392b','#fff'],
];

// ─── 상태 ────────────────────────────────────────────────────────────────────
let _pbAnimId    = null;
let _pbChargeRaf = null;
let _pbRunning   = false;
let _pbBall      = null;
let _pbBumpers   = [];
let _pbSlots     = [];
let _pbFlipL     = false;
let _pbFlipR     = false;
let _pbPower     = 0;
let _pbCharging  = false;
let _pbResult    = null;
let _pbW = 320, _pbH = 500;
let _pbHistory   = [];
try { _pbHistory = JSON.parse(localStorage.getItem('su_pb_hist') || '[]'); } catch(e) {}

// ─── 공개 API ────────────────────────────────────────────────────────────────
function _pbInit() {
  const root = document.getElementById('pb-root');
  if (!root) return;
  _pbRender(root);
}

function _pbCleanup() {
  if (_pbAnimId)    { cancelAnimationFrame(_pbAnimId);    _pbAnimId    = null; }
  if (_pbChargeRaf) { cancelAnimationFrame(_pbChargeRaf); _pbChargeRaf = null; }
  _pbRunning  = false;
  _pbCharging = false;
  document.removeEventListener('keydown', _pbKeyDown);
  document.removeEventListener('keyup',   _pbKeyUp);
}

// ─── 렌더 ────────────────────────────────────────────────────────────────────
function _pbRender(root) {
  const saved = localStorage.getItem('su_pb_input') || '';
  root.innerHTML = `
<div class="pb-wrap">
  <div class="pb-input-row">
    <textarea class="pb-textarea" id="pb-input"
      placeholder="이름 입력... (쉼표 구분, 최대 8명)"
      oninput="_pbOnInput(this.value)">${saved}</textarea>
    <button onclick="_pbBuild()" style="align-self:stretch;padding:8px 14px;border:none;border-radius:10px;background:linear-gradient(135deg,#6C5CE7,#a29bfe);color:#fff;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap">🎮 적용</button>
  </div>
  <canvas id="pb-canvas" style="border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.3),0 0 0 4px rgba(108,92,231,.25)"></canvas>
  <div class="pb-btn-group">
    <button class="pb-flip-btn" id="pb-lbtn"
      style="background:linear-gradient(135deg,#FF4B6E,#FF89AB);box-shadow:0 4px 0 #C0274A"
      onpointerdown="_pbFlipDown('L')" onpointerup="_pbFlipUp('L')" onpointerleave="_pbFlipUp('L')">
      ◀ 왼쪽 (Z)
    </button>
    <button class="pb-launch-btn" id="pb-launch"
      onpointerdown="_pbChargeStart()" onpointerup="_pbChargeRelease()" onpointerleave="_pbChargeRelease()">
      🚀 발사!
    </button>
    <button class="pb-flip-btn" id="pb-rbtn"
      style="background:linear-gradient(135deg,#0984e3,#74b9ff);box-shadow:0 4px 0 #0652c5"
      onpointerdown="_pbFlipDown('R')" onpointerup="_pbFlipUp('R')" onpointerleave="_pbFlipUp('R')">
      오른쪽 (/) ▶
    </button>
  </div>
  <div id="pb-result-area"></div>
  ${_pbHistHtml()}
</div>`;

  _pbSizeCanvas();
  _pbBuild();
  document.addEventListener('keydown', _pbKeyDown);
  document.addEventListener('keyup',   _pbKeyUp);
}

function _pbSizeCanvas() {
  const cv = document.getElementById('pb-canvas');
  if (!cv) return;
  _pbW = Math.min(window.innerWidth - 48, 380);
  _pbH = Math.round(_pbW * 1.52);
  cv.width  = _pbW;
  cv.height = _pbH;
}

// ─── 필드 구성 ───────────────────────────────────────────────────────────────
function _pbBuild() {
  _pbCleanup();
  _pbRunning = false;
  _pbBall    = null;
  _pbResult  = null;
  _pbFlipL   = false;
  _pbFlipR   = false;
  _pbPower   = 0;
  _pbCharging = false;

  const area = document.getElementById('pb-result-area');
  if (area) area.innerHTML = '';

  const names = _pbGetNames();

  // 슬롯 (하단)
  const n = Math.min(Math.max(names.length, 2), 8);
  const ns = names.slice(0, n);
  while (ns.length < 2) ns.push((ns.length + 1) + '번');
  const slotW = _pbW / ns.length;
  _pbSlots = ns.map((name, i) => ({
    name, x: i * slotW, w: slotW,
    clr: _PB_SLOT_CLR[i % _PB_SLOT_CLR.length],
  }));

  // 범퍼 6개 (마름모 패턴)
  const cx  = _pbW / 2;
  const top = _pbH * 0.10;
  const bot = _pbH * 0.62;
  const sp  = bot - top;
  _pbBumpers = [
    { x: cx,              y: top + sp*0.05, r: 20, lit: 0 },
    { x: cx - _pbW*0.23,  y: top + sp*0.26, r: 17, lit: 0 },
    { x: cx + _pbW*0.23,  y: top + sp*0.26, r: 17, lit: 0 },
    { x: cx,              y: top + sp*0.48, r: 20, lit: 0 },
    { x: cx - _pbW*0.19,  y: top + sp*0.70, r: 15, lit: 0 },
    { x: cx + _pbW*0.19,  y: top + sp*0.70, r: 15, lit: 0 },
  ];

  document.addEventListener('keydown', _pbKeyDown);
  document.addEventListener('keyup',   _pbKeyUp);
  _pbDraw();
}

// ─── 입력 ────────────────────────────────────────────────────────────────────
function _pbGetNames() {
  const inp = document.getElementById('pb-input');
  const raw = inp ? inp.value : (localStorage.getItem('su_pb_input') || '');
  return raw.split(',').map(v => v.trim()).filter(Boolean);
}
function _pbOnInput(val) {
  localStorage.setItem('su_pb_input', val);
}

// ─── 키보드 ──────────────────────────────────────────────────────────────────
function _pbKeyDown(e) {
  if (!document.getElementById('pb-canvas')) { _pbCleanup(); return; }
  if (e.key === 'z' || e.key === 'Z')       _pbFlipDown('L');
  if (e.key === '/' )                        _pbFlipDown('R');
  if (e.code === 'Space') { e.preventDefault(); _pbChargeStart(); }
}
function _pbKeyUp(e) {
  if (!document.getElementById('pb-canvas')) { _pbCleanup(); return; }
  if (e.key === 'z' || e.key === 'Z')  _pbFlipUp('L');
  if (e.key === '/')                   _pbFlipUp('R');
  if (e.code === 'Space')              _pbChargeRelease();
}

// ─── 플리퍼 ──────────────────────────────────────────────────────────────────
function _pbFlipDown(side) { if (side==='L') _pbFlipL=true;  else _pbFlipR=true;  }
function _pbFlipUp(side)   { if (side==='L') _pbFlipL=false; else _pbFlipR=false; }

// ─── 플런저 ──────────────────────────────────────────────────────────────────
function _pbChargeStart() {
  if (_pbRunning) return;
  if (_pbSlots.length < 2) { alert('이름을 2명 이상 입력 후 [적용]을 누르세요!'); return; }
  if (_pbCharging) return;
  _pbCharging = true;
  _pbPower    = 0;
  const btn   = document.getElementById('pb-launch');
  if (btn) btn.classList.add('charging');
  _pbChargeLoop();
}
function _pbChargeLoop() {
  if (!_pbCharging) return;
  _pbPower     = Math.min(1, _pbPower + 0.022);
  _pbDraw();
  _pbChargeRaf = requestAnimationFrame(_pbChargeLoop);
}
function _pbChargeRelease() {
  if (!_pbCharging) return;
  _pbCharging = false;
  if (_pbChargeRaf) { cancelAnimationFrame(_pbChargeRaf); _pbChargeRaf = null; }
  const btn = document.getElementById('pb-launch');
  if (btn) btn.classList.remove('charging');
  if (_pbPower < 0.08) { _pbDraw(); return; }

  // 발사: 오른쪽 플런저 레인 → 위쪽+왼쪽
  const power = Math.max(0.35, _pbPower);
  const angle = -(Math.PI * 0.68) + (Math.random() - 0.5) * 0.28;
  const spd   = 7 + power * 11;
  _pbBall = {
    x:  _pbW * 0.87,
    y:  _pbH * 0.78,
    vx: Math.cos(angle) * spd,
    vy: Math.sin(angle) * spd,
  };
  _pbResult  = null;
  _pbRunning = true;
  const area = document.getElementById('pb-result-area');
  if (area) area.innerHTML = '';
  _pbLoop();
}

// ─── 게임 루프 ───────────────────────────────────────────────────────────────
function _pbLoop() {
  if (!_pbRunning) return;
  _pbUpdate();
  _pbDraw();
  _pbAnimId = requestAnimationFrame(_pbLoop);
}

function _pbUpdate() {
  const b = _pbBall;
  if (!b) return;

  // 중력
  b.vy += _PB_GRAVITY;

  // 좌우 벽
  if (b.x - _PB_BALL_R < 0) {
    b.x  = _PB_BALL_R;
    b.vx = Math.abs(b.vx) * _PB_DAMPING;
  }
  if (b.x + _PB_BALL_R > _pbW) {
    b.x  = _pbW - _PB_BALL_R;
    b.vx = -Math.abs(b.vx) * _PB_DAMPING;
  }
  // 천장
  if (b.y - _PB_BALL_R < 0) {
    b.y  = _PB_BALL_R;
    b.vy = Math.abs(b.vy) * _PB_DAMPING;
  }

  // 플런저 레인 왼쪽 벽 (하단에서만)
  const laneX = _pbW * 0.77;
  if (b.x > laneX && b.y > _pbH * 0.68) {
    b.x  = laneX - _PB_BALL_R;
    b.vx = -Math.abs(b.vx) * _PB_DAMPING;
  }

  // 범퍼 충돌
  _pbBumpers.forEach(bmp => {
    const dx = b.x - bmp.x, dy = b.y - bmp.y;
    const d  = Math.hypot(dx, dy);
    const md = _PB_BALL_R + bmp.r;
    if (d < md && d > 0.01) {
      const nx = dx/d, ny = dy/d;
      b.x = bmp.x + nx * (md + 0.5);
      b.y = bmp.y + ny * (md + 0.5);
      const dot = b.vx*nx + b.vy*ny;
      b.vx = (b.vx - 2*dot*nx) * 1.08 + nx * 1.8;
      b.vy = (b.vy - 2*dot*ny) * 1.08 + ny * 1.8;
      const spd = Math.hypot(b.vx, b.vy);
      if (spd > 15) { b.vx *= 15/spd; b.vy *= 15/spd; }
      if (spd < 2.5){ b.vx *= 2.5/spd; b.vy *= 2.5/spd; }
      bmp.lit = 15;
    }
    if (bmp.lit > 0) bmp.lit--;
  });

  // 플리퍼 충돌
  _pbFlipCollide(b, 'L');
  _pbFlipCollide(b, 'R');

  b.x += b.vx;
  b.y += b.vy;

  // 속도 한계
  const spd = Math.hypot(b.vx, b.vy);
  if (spd > 18) { b.vx *= 18/spd; b.vy *= 18/spd; }

  // 드레인 판정
  const drainY = _pbH * 0.855;
  if (b.y - _PB_BALL_R > drainY) {
    const slot = _pbSlots.find(s => b.x >= s.x && b.x < s.x + s.w)
               || _pbSlots[b.x < _pbW/2 ? 0 : _pbSlots.length-1];
    if (slot) {
      _pbRunning = false;
      cancelAnimationFrame(_pbAnimId); _pbAnimId = null;
      _pbResult = slot;
      _pbBall.y = drainY + _PB_BALL_R; // 드레인 라인 아래 고정
      _pbDraw();
      setTimeout(() => _pbShowResult(slot), 300);
    }
  }
}

// 플리퍼 기하 계산
function _pbFlipGeom(side) {
  const fY  = _pbH * 0.805;
  const len = _pbW * 0.215;
  const restAng = 0.40;
  const upAng   = -0.34;
  if (side === 'L') {
    return { px: _pbW*0.195, py: fY, ang: _pbFlipL ? upAng : restAng, len, dir:  1 };
  } else {
    return { px: _pbW*0.805, py: fY, ang: _pbFlipR ? upAng : restAng, len, dir: -1 };
  }
}

function _pbFlipCollide(b, side) {
  const g   = _pbFlipGeom(side);
  const ex  = g.px + g.dir * Math.cos(g.ang) * g.len;
  const ey  = g.py + Math.sin(g.ang) * g.len;
  const dx  = ex - g.px, dy = ey - g.py;
  const lsq = dx*dx + dy*dy;
  const t   = Math.max(0, Math.min(1, ((b.x-g.px)*dx + (b.y-g.py)*dy) / lsq));
  const cx  = g.px + t*dx, cy = g.py + t*dy;
  const dd  = Math.hypot(b.x-cx, b.y-cy);
  const md  = _PB_BALL_R + 5;
  if (dd < md && dd > 0.01) {
    const nx = (b.x-cx)/dd, ny = (b.y-cy)/dd;
    b.x = cx + nx*md;
    b.y = cy + ny*md;
    const dot    = b.vx*nx + b.vy*ny;
    const active = (side==='L' ? _pbFlipL : _pbFlipR);
    const boost  = active ? 1.25 : 0.65;
    b.vx = (b.vx - 2*dot*nx) * boost;
    b.vy = (b.vy - 2*dot*ny) * boost;
    if (active) {
      b.vy -= 3.5;
      b.vx += (side==='L' ? 2.5 : -2.5);
    }
  }
}

// ─── 그리기 ──────────────────────────────────────────────────────────────────
function _pbDraw() {
  const cv = document.getElementById('pb-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = _pbW, H = _pbH;
  const drainY = H * 0.855;

  // 배경 그라디언트
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0f0c29');
  bg.addColorStop(1, '#24243e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 장식 격자
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // 플런저 레인
  const laneX = W * 0.77;
  ctx.fillStyle = 'rgba(162,155,254,0.05)';
  ctx.fillRect(laneX, H*0.60, W-laneX, H*0.26);
  ctx.strokeStyle = 'rgba(162,155,254,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(laneX, H*0.60); ctx.lineTo(laneX, drainY); ctx.stroke();
  // 파워 바
  if (_pbCharging && _pbPower > 0) {
    const bH = H * 0.22 * _pbPower;
    const bX = W * 0.84, bY = drainY - bH;
    const pg = ctx.createLinearGradient(0, bY+bH, 0, bY);
    pg.addColorStop(0, '#00b894'); pg.addColorStop(0.55, '#fdcb6e'); pg.addColorStop(1, '#d63031');
    ctx.fillStyle = pg;
    ctx.fillRect(bX, bY, W*0.10, bH);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
    ctx.strokeRect(bX, bY, W*0.10, bH);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.fillText(Math.round(_pbPower*100)+'%', bX+W*0.05, bY-5);
  }

  // 슬롯
  const slotH = H - drainY;
  _pbSlots.forEach(s => {
    const active = _pbResult && _pbResult.name === s.name;
    if (active) {
      ctx.shadowColor = s.clr[0]; ctx.shadowBlur = 22;
      ctx.fillStyle = s.clr[0];
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
    }
    ctx.fillRect(s.x, drainY, s.w, slotH);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(s.x + s.w - 1, drainY, 2, slotH);
    ctx.save();
    ctx.beginPath(); ctx.rect(s.x+2, drainY+2, s.w-4, slotH-4); ctx.clip();
    ctx.fillStyle = active ? s.clr[1] : 'rgba(255,255,255,0.6)';
    const fz = Math.min(13, Math.round(s.w * 0.28));
    ctx.font = `bold ${fz}px "Noto Sans KR",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s.name, s.x + s.w/2, drainY + slotH/2);
    ctx.restore();
  });

  // 드레인 라인
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, drainY); ctx.lineTo(W, drainY); ctx.stroke();

  // 슬링샷 삼각형 (장식)
  const ssY = drainY - H*0.04;
  ctx.fillStyle = 'rgba(162,155,254,0.18)';
  ctx.beginPath(); ctx.moveTo(0,ssY); ctx.lineTo(W*0.17,ssY); ctx.lineTo(0,drainY); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W,ssY); ctx.lineTo(W*0.83,ssY); ctx.lineTo(W,drainY); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(162,155,254,0.45)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0,ssY); ctx.lineTo(W*0.17,ssY); ctx.lineTo(0,drainY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W,ssY); ctx.lineTo(W*0.83,ssY); ctx.lineTo(W,drainY); ctx.stroke();

  // 플리퍼
  ['L','R'].forEach(side => {
    const g      = _pbFlipGeom(side);
    const ex     = g.px + g.dir * Math.cos(g.ang) * g.len;
    const ey     = g.py + Math.sin(g.ang) * g.len;
    const active = side==='L' ? _pbFlipL : _pbFlipR;
    const c1     = side==='L' ? (active ? '#FF4B6E' : '#8b1a2f') : (active ? '#0984e3' : '#0a3d62');
    const c2     = side==='L' ? (active ? '#FF89AB' : '#c0274a') : (active ? '#74b9ff' : '#1e6fa5');
    const grad   = ctx.createLinearGradient(g.px, g.py, ex, ey);
    grad.addColorStop(0, c1); grad.addColorStop(1, c2);
    if (active) { ctx.shadowColor = c1; ctx.shadowBlur = 14; }
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineWidth = 13;
    ctx.strokeStyle = grad;
    ctx.beginPath(); ctx.moveTo(g.px, g.py); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.shadowBlur = 0;
    // 피벗 원
    ctx.fillStyle = active ? '#fff' : 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.arc(g.px, g.py, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  });

  // 범퍼
  _pbBumpers.forEach(bmp => {
    const lit = bmp.lit > 0;
    if (lit) { ctx.shadowColor = '#ffd32a'; ctx.shadowBlur = 26; }
    const gr = ctx.createRadialGradient(bmp.x-bmp.r*.3, bmp.y-bmp.r*.35, 1, bmp.x, bmp.y, bmp.r);
    if (lit) {
      gr.addColorStop(0, '#fffde7'); gr.addColorStop(1, '#f39c12');
    } else {
      gr.addColorStop(0, '#a29bfe'); gr.addColorStop(1, '#6c5ce7');
    }
    ctx.beginPath(); ctx.arc(bmp.x, bmp.y, bmp.r, 0, Math.PI*2);
    ctx.fillStyle = gr; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = lit ? '#fff' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(bmp.x, bmp.y, bmp.r*0.4, 0, Math.PI*2);
    ctx.fillStyle = lit ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.22)'; ctx.fill();
  });

  // 공
  if (_pbBall) {
    const b = _pbBall;
    const bg2 = ctx.createRadialGradient(b.x-3, b.y-3, 1, b.x, b.y, _PB_BALL_R);
    bg2.addColorStop(0, '#fff'); bg2.addColorStop(0.5, '#dfe6e9'); bg2.addColorStop(1, '#74b9ff');
    ctx.shadowColor = 'rgba(116,185,255,0.75)'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(b.x, b.y, _PB_BALL_R, 0, Math.PI*2);
    ctx.fillStyle = bg2; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // 안내 텍스트
  if (!_pbBall && !_pbResult) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (_pbSlots.length < 2 && !_pbCharging) {
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.font = '14px "Noto Sans KR",sans-serif';
      ctx.fillText('이름 2명 이상 입력 후 [적용]을 누르세요', W/2, H*0.44);
    } else if (!_pbCharging) {
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.font = '14px "Noto Sans KR",sans-serif';
      ctx.fillText('발사 버튼을 꾹 누르고 있다가 놓으세요', W/2, H*0.44);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.font = '12px sans-serif';
      ctx.fillText('Z = 왼쪽 플리퍼  /  / = 오른쪽 플리퍼  /  Space = 발사', W/2, H*0.49);
    }
  }

  // 결과 오버레이
  if (_pbResult) {
    ctx.fillStyle = 'rgba(10,8,30,0.52)';
    ctx.fillRect(0, 0, W, drainY);
    ctx.shadowColor = _pbResult.clr[0]; ctx.shadowBlur = 32;
    ctx.fillStyle   = _pbResult.clr[0];
    ctx.font = `bold ${Math.round(W*0.088)}px "Noto Sans KR",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🎊 ' + _pbResult.name, W/2, H*0.41);
    ctx.shadowBlur = 0;
  }
}

// ─── 결과 처리 ───────────────────────────────────────────────────────────────
function _pbShowResult(slot) {
  const now  = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  _pbHistory.unshift({ name: slot.name, time });
  if (_pbHistory.length > 20) _pbHistory = _pbHistory.slice(0, 20);
  try { localStorage.setItem('su_pb_hist', JSON.stringify(_pbHistory)); } catch(e) {}

  const area = document.getElementById('pb-result-area');
  if (area) {
    area.innerHTML = `
<div class="pb-result-card" style="animation:pbCardIn 0.5s cubic-bezier(.175,.885,.32,1.35)">
  <div style="font-size:12px;font-weight:700;color:#6c5ce7;letter-spacing:1.5px;margin-bottom:8px">🎮 핀볼 당첨!</div>
  <div style="font-size:46px;margin-bottom:4px">🏆</div>
  <div style="font-size:clamp(22px,6vw,38px);font-weight:900;color:#4834d4;margin-bottom:14px;word-break:break-all">${slot.name}</div>
  <button onclick="_pbBuild()" style="font-family:inherit;font-size:14px;font-weight:700;color:#fff;background:linear-gradient(135deg,#6C5CE7,#a29bfe);border:none;border-radius:20px;padding:10px 24px;cursor:pointer;box-shadow:0 4px 0 #4834d4;transition:transform .1s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">🔄 다시 하기</button>
</div>`;
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const hbox = document.getElementById('pb-hist-box');
  if (hbox) hbox.outerHTML = _pbHistHtml();
  _pbConfetti();
}

// ─── 히스토리 ────────────────────────────────────────────────────────────────
function _pbHistHtml() {
  if (!_pbHistory.length) return '<div id="pb-hist-box"></div>';
  const rows = _pbHistory.slice(0, 10).map((h, i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:12px;min-width:20px;color:var(--text3);text-align:right">${i+1}</span>
      <span style="font-weight:700;color:var(--text1);flex:1">${h.name}</span>
      <span style="font-size:11px;color:var(--text3)">${h.time}</span>
    </div>`).join('');
  return `<div class="pb-hist-box" id="pb-hist-box">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span style="font-size:13px;font-weight:700;color:var(--text2)">📋 결과 기록</span>
      <button onclick="_pbClearHistory()" style="font-size:11px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
    </div>
    ${rows}
  </div>`;
}
function _pbClearHistory() {
  _pbHistory = [];
  localStorage.removeItem('su_pb_hist');
  const hbox = document.getElementById('pb-hist-box');
  if (hbox) hbox.outerHTML = '<div id="pb-hist-box"></div>';
}

// ─── 컨페티 ──────────────────────────────────────────────────────────────────
function _pbConfetti() {
  const colors = ['#6C5CE7','#a29bfe','#fd79a8','#fdcb6e','#00b894','#74b9ff'];
  for (let i = 0; i < 38; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      const sz = 5 + Math.random() * 8;
      el.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-15px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${sz}px;height:${sz}px;border-radius:${Math.random()>.5?'50%':'3px'};z-index:600;pointer-events:none;animation:gcConfettiFall ${1.2+Math.random()*.9}s ease-in ${Math.random()*.4}s forwards`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }, i * 22);
  }
}
