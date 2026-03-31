// ─── 🔮 마블 물리 룰렛 v2 (회전막대 + 핀 장애물) ────────────────────────────────

(function _mbInjectCSS() {
  if (document.getElementById('mb-style')) return;
  const s = document.createElement('style');
  s.id = 'mb-style';
  s.textContent = [
    '#mb-root{font-family:inherit;width:100%}',
    '.mb-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%}',
    '.mb-canvas-wrap{position:relative;width:100%;display:flex;justify-content:center}',
    '#mb-canvas{border-radius:18px;display:block;box-shadow:0 0 40px rgba(0,200,255,0.22),0 0 80px rgba(120,40,255,0.12),0 8px 32px rgba(0,0,0,.5);border:1px solid rgba(0,229,255,0.2)}',
    '.mb-btn{font-size:clamp(15px,2vw,20px);font-weight:900;color:#fff;background:linear-gradient(135deg,#7B2FFF,#00BFFF);border:none;border-radius:30px;padding:11px 40px;cursor:pointer;box-shadow:0 5px 0 #4a1fa8,0 0 24px rgba(0,180,255,0.35);transition:transform .12s,box-shadow .12s;font-family:inherit;letter-spacing:.3px}',
    '.mb-btn:hover{transform:translateY(-2px);box-shadow:0 7px 0 #4a1fa8,0 0 36px rgba(0,200,255,0.5)}',
    '.mb-btn:active{transform:translateY(3px);box-shadow:0 2px 0 #4a1fa8,0 0 16px rgba(0,180,255,0.3)}',
    '.mb-btn:disabled{background:linear-gradient(135deg,#444,#333);box-shadow:0 4px 0 #222;cursor:not-allowed;transform:none}',
    '.mb-hist-box{width:100%;max-width:480px;background:rgba(10,6,30,0.85);border:1.5px solid rgba(0,229,255,0.25);border-radius:14px;padding:12px 14px;backdrop-filter:blur(8px)}',
    '.mb-hist-item{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.06)}',
    '.mb-hist-item:last-child{border-bottom:none}',
    '@keyframes mbCardAppear{0%{opacity:0;transform:scale(0.7) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
    '@keyframes mbParticle{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0) rotate(var(--rot));opacity:0}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 색상 ────────────────────────────────────────────────────────────────────
const _MB_COLORS = [
  '#FF2D78','#FF6B00','#FFDD00','#00FF88',
  '#00E5FF','#BD93F9','#FF79C6','#50FA7B',
  '#8B5CF6','#FFB86C','#8BE9FD','#FF5555',
  '#F1FA8C','#44B8FF','#FF6BCB','#00FFC8',
];

// ─── 물리 상수 ────────────────────────────────────────────────────────────────
const _MB_G    = 0.20;   // 중력 (느리게 — 방해물 체감↑)
const _MB_D    = 0.997;  // 감쇠
const _MB_RBB  = 0.52;   // 공↔공 반발
const _MB_RPG  = 0.70;   // 공↔핀 반발
const _MB_RWL  = 0.44;   // 공↔벽 반발
const _MB_RST  = 0.78;   // 공↔막대 반발
const _MB_VCAP = 22;     // 최대 속도

// ─── 상태 ────────────────────────────────────────────────────────────────────
let _mbBalls      = [];
let _mbSegs       = [];   // 정적 벽 선분
let _mbPegs       = [];   // 핀 장애물
let _mbSticks     = [];   // 회전 막대
let _mbGeo        = {};
let _mbRunning    = false;
let _mbAnimId     = null;
let _mbWinTimeout = null;
let _mbWinner     = null;
let _mbHistory    = [];
let _mbAC         = null;
let _mbIdleAnimId = null;
let _mbTick       = 0;
let _mbCurrentMap = 0;
try { _mbHistory = JSON.parse(localStorage.getItem('su_mb_hist') || '[]'); } catch(e) {}

// ─── 진입점 ──────────────────────────────────────────────────────────────────
function _mbInit() {
  const root = document.getElementById('mb-root');
  if (!root) return;
  _mbRender(root);
}

function _mbGetNames() {
  return (localStorage.getItem('su_mb_input') || '').split(/[,\n]/).map(s => s.trim()).filter(Boolean);
}

// ─── UI 렌더 ─────────────────────────────────────────────────────────────────
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
    + ((typeof isLoggedIn !== 'undefined' && isLoggedIn)
      ? '<button onclick="_mbOpenEditor()" style="padding:6px 12px;border-radius:10px;border:1.5px solid #7B2FFF;background:rgba(123,47,255,0.12);'
        + 'color:#BD93F9;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0">🗺️ 맵 편집</button>'
      : '')
    + '</div>'
    + '<div class="mb-canvas-wrap"><canvas id="mb-canvas"></canvas></div>'
    + '<button class="mb-btn" id="mb-btn" onclick="_mbStart()">🔮 굴려라!</button>'
    + '<div id="mb-result-card" style="display:none;width:100%;max-width:480px;'
    + 'background:linear-gradient(135deg,rgba(10,0,40,0.95),rgba(5,5,30,0.95));'
    + 'border:2px solid rgba(0,229,255,0.5);border-radius:18px;padding:22px;text-align:center;box-sizing:border-box;'
    + 'box-shadow:0 0 40px rgba(0,180,255,0.2),0 0 80px rgba(120,40,255,0.15)">'
    + '<div style="font-size:13px;font-weight:700;color:#00E5FF;letter-spacing:2px;margin-bottom:10px;text-transform:uppercase">🎊 Winner!</div>'
    + '<div id="mb-res-icon" style="font-size:48px;margin-bottom:6px;line-height:1.1">🔮</div>'
    + '<div id="mb-res-name" style="font-size:clamp(26px,6vw,46px);font-weight:900;'
    + 'background:linear-gradient(135deg,#00E5FF,#BD93F9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;'
    + 'background-clip:text;word-break:break-all;margin-bottom:16px"></div>'
    + '<button onclick="_mbStart()" style="font-family:inherit;font-size:15px;font-weight:700;color:#fff;'
    + 'background:linear-gradient(135deg,#7B2FFF,#00BFFF);border:none;border-radius:22px;padding:10px 28px;'
    + 'cursor:pointer;box-shadow:0 4px 0 #4a1fa8,0 0 20px rgba(0,180,255,0.3)" '
    + 'onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'">🔮 다시 굴리기</button>'
    + '</div>'
    + _mbHistHTML()
    + '</div>';
  _mbSetupCanvas();
}

function _mbOnInput(val) { localStorage.setItem('su_mb_input', val); }

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

// ─── 캔버스 크기 설정 ─────────────────────────────────────────────────────────
function _mbSetupCanvas() {
  const cv = document.getElementById('mb-canvas');
  if (!cv) return;
  const avW = Math.min(window.innerWidth - 40, 480);
  const _hm = parseFloat(_mbCustom.heightMul || 3.0);
  const avH = Math.max(800, Math.min(3000, Math.round(avW * _hm)));
  cv.width  = avW;
  cv.height = avH;
  cv.style.width  = avW + 'px';
  cv.style.height = avH + 'px';
  _mbBuildWorld(avW, avH);
  _mbDrawIdle(cv);
  _mbStartIdleAnim(cv);
}

function _mbStartIdleAnim(cv) {
  if (_mbIdleAnimId) cancelAnimationFrame(_mbIdleAnimId);
  function loop() {
    if (_mbRunning) { _mbIdleAnimId = null; return; }
    _mbTick++;
    for (const st of _mbSticks) {
      st.angle += st.omega * 0.6;
      if (st.lenBase != null)
        st.len = st.lenBase * (1 + st.lenAmp * Math.sin(_mbTick * st.lenFreq + st.lenOff));
    }
    _mbDrawIdle(cv);
    _mbIdleAnimId = requestAnimationFrame(loop);
  }
  _mbIdleAnimId = requestAnimationFrame(loop);
}

// ─── 커스텀 맵 데이터 ─────────────────────────────────────────────────────────
let _mbCustom = { pegsR: [], segsR: [], sticksR: [], heightMul: 3.0 };
try { const _mc = JSON.parse(localStorage.getItem('su_mb_custom') || 'null'); if (_mc) _mbCustom = _mc; } catch(e) {}

// ─── 월드 빌드 (벽 + 막대 + 핀) — 3가지 맵 + 커스텀 ─────────────────────────
const _MB_MAP_NAMES = ['🎯 핀볼', '⚡ 지그재그', '🌀 카오스', '✏️ 커스텀'];

function _mbBuildWorld(W, H) {
  const cx        = W / 2;
  const padX      = 18;
  const topY      = 12;
  const funnelTop = H * 0.70;
  const funnelBot = H * 0.80;
  const chuteBot  = H * 0.90;
  const hHW       = W * 0.10;
  const landW     = W * 0.43;
  const floorY    = H - 26;

  _mbGeo = { W, H, cx, padX, topY, funnelTop, funnelBot, chuteBot, hHW, landW, floorY };

  // 공통 벽
  _mbSegs = [
    { x1: padX,     y1: topY,      x2: padX,     y2: funnelTop },
    { x1: padX,     y1: funnelTop, x2: cx-hHW,   y2: funnelBot },
    { x1: W-padX,   y1: topY,      x2: W-padX,   y2: funnelTop },
    { x1: W-padX,   y1: funnelTop, x2: cx+hHW,   y2: funnelBot },
    { x1: padX,     y1: topY,      x2: W-padX,   y2: topY },
    { x1: cx-hHW,   y1: funnelBot, x2: cx-hHW,   y2: chuteBot },
    { x1: cx+hHW,   y1: funnelBot, x2: cx+hHW,   y2: chuteBot },
    { x1: cx-hHW,   y1: chuteBot,  x2: cx-landW, y2: floorY },
    { x1: cx+hHW,   y1: chuteBot,  x2: cx+landW, y2: floorY },
    { x1: cx-landW, y1: floorY,    x2: cx+landW, y2: floorY },
  ];

  // 슈트·착지 공통 막대
  const chuteLen = hHW * 0.56;
  const chuteSticks = [
    { cx: cx, cy: funnelBot+(chuteBot-funnelBot)*0.28, len: chuteLen, lenBase: chuteLen, lenAmp: 0.12, lenFreq: 0.055, lenOff: 0.5,  angle: 0,           omega:  0.080, thick: 3 },
    { cx: cx, cy: funnelBot+(chuteBot-funnelBot)*0.68, len: chuteLen, lenBase: chuteLen, lenAmp: 0.12, lenFreq: 0.050, lenOff: 1.8,  angle: Math.PI*0.5, omega: -0.068, thick: 3 },
    { cx: cx, cy: chuteBot+(floorY-chuteBot)*0.50,     len: landW*0.30, lenBase: landW*0.30, lenAmp: 0.18, lenFreq: 0.020, lenOff: 0, angle: 0, omega: -0.022, thick: 4 },
  ];

  _mbSticks = [];
  _mbPegs   = [];
  const pR  = Math.max(4, Math.round(W * 0.015));

  // ── 맵 0: 핀볼 (표준 균형) ──
  if (_mbCurrentMap === 0) {
    const sL = (W - padX * 2) * 0.150;
    _mbSticks = [
      { cx: W*0.26, cy: H*0.10, len: sL*1.1,  lenBase: sL*1.1,  lenAmp: 0.28, lenFreq: 0.022, lenOff: 0.0, angle: 0,            omega:  0.020, thick: 4 },
      { cx: W*0.74, cy: H*0.19, len: sL*1.1,  lenBase: sL*1.1,  lenAmp: 0.26, lenFreq: 0.024, lenOff: 1.2, angle: Math.PI*0.55, omega: -0.024, thick: 4 },
      { cx: cx,     cy: H*0.29, len: sL*0.95, lenBase: sL*0.95, lenAmp: 0.30, lenFreq: 0.028, lenOff: 2.1, angle: Math.PI*0.2,  omega:  0.030, thick: 3 },
      { cx: W*0.28, cy: H*0.40, len: sL*0.88, lenBase: sL*0.88, lenAmp: 0.32, lenFreq: 0.026, lenOff: 0.7, angle: Math.PI*0.45, omega: -0.035, thick: 3 },
      { cx: W*0.72, cy: H*0.50, len: sL*0.88, lenBase: sL*0.88, lenAmp: 0.30, lenFreq: 0.030, lenOff: 1.5, angle: Math.PI*0.75, omega:  0.038, thick: 3 },
      { cx: cx,     cy: H*0.60, len: sL*0.82, lenBase: sL*0.82, lenAmp: 0.28, lenFreq: 0.032, lenOff: 3.0, angle: 0,            omega: -0.042, thick: 3 },
      ...chuteSticks,
    ];
    const pegTop = H * 0.07, pegBot = funnelTop - pR * 3;
    const rows = 15, baseC = 7;
    const spX = (W - padX * 2 - pR * 4) / (baseC - 1);
    const spY = (pegBot - pegTop) / (rows - 1);
    for (let row = 0; row < rows; row++) {
      const even = row % 2 === 0;
      const cols = even ? baseC : baseC - 1;
      const offX = even ? 0 : spX * 0.5;
      for (let col = 0; col < cols; col++) {
        const px = padX + pR * 2 + col * spX + offX;
        const py = pegTop + row * spY;
        if (px - pR > padX + 3 && px + pR < W - padX - 3)
          _mbPegs.push({ x: px, y: py, r: pR, flash: 0 });
      }
    }
  }

  // ── 맵 1: 지그재그 (좌우 번갈아 막대, 빠른 회전) ──
  else if (_mbCurrentMap === 1) {
    const sL = (W - padX * 2) * 0.175;
    const rows4 = [[H*0.09, H*0.17], [H*0.26, H*0.34], [H*0.43, H*0.51], [H*0.59, H*0.65]];
    rows4.forEach(([ya, yb], pi) => {
      const flip = pi % 2 === 0 ? 1 : -1;
      const mul  = 1.0 - pi * 0.06;
      _mbSticks.push(
        { cx: W*0.27, cy: ya, len: sL*mul, lenBase: sL*mul, lenAmp: 0.35, lenFreq: 0.028+pi*0.004, lenOff: pi*1.1,   angle: Math.PI*0.10*flip,  omega:  (0.032+pi*0.006)*flip,  thick: 4 },
        { cx: W*0.73, cy: yb, len: sL*mul, lenBase: sL*mul, lenAmp: 0.33, lenFreq: 0.025+pi*0.004, lenOff: pi*1.3+1, angle: Math.PI*0.10*(-flip),omega: -(0.036+pi*0.006)*flip,  thick: 4 }
      );
    });
    _mbSticks.push(...chuteSticks);
    // 핀 — 적당히 (10행)
    const pegTop = H * 0.07, pegBot = funnelTop - pR * 3;
    const rows = 10, baseC = 6;
    const spX = (W - padX * 2 - pR * 4) / (baseC - 1);
    const spY = (pegBot - pegTop) / (rows - 1);
    for (let row = 0; row < rows; row++) {
      const even = row % 2 === 0;
      const cols = even ? baseC : baseC - 1;
      const offX = even ? 0 : spX * 0.5;
      for (let col = 0; col < cols; col++) {
        const px = padX + pR * 2 + col * spX + offX;
        const py = pegTop + row * spY;
        if (px - pR > padX + 3 && px + pR < W - padX - 3)
          _mbPegs.push({ x: px, y: py, r: pR, flash: 0 });
      }
    }
  }

  // ── 맵 2: 카오스 (막대 12개 산란, 핀 밀집) ──
  else {
    const sL = (W - padX * 2) * 0.130;
    const configs = [
      [W*0.22, H*0.08, 1.10, 0,            0.040], [W*0.78, H*0.14, 1.10, Math.PI*0.6, -0.046],
      [W*0.50, H*0.21, 1.00, Math.PI*0.3,  0.054], [W*0.25, H*0.30, 0.92, Math.PI*0.5, -0.062],
      [W*0.75, H*0.38, 0.92, Math.PI*0.8,  0.060], [W*0.50, H*0.46, 0.86, Math.PI*0.1, -0.068],
      [W*0.30, H*0.55, 0.88, Math.PI*0.4,  0.075], [W*0.70, H*0.62, 0.88, Math.PI*0.7, -0.078],
    ];
    configs.forEach(([cx2, cy2, mul, angle, omega], si) => {
      const l = sL * mul;
      _mbSticks.push({ cx: cx2, cy: cy2, len: l, lenBase: l, lenAmp: 0.32+si*0.02, lenFreq: 0.026+si*0.003, lenOff: si*0.9, angle, omega, thick: 3 });
    });
    _mbSticks.push(...chuteSticks);
    // 핀 — 밀집 (18행 8열)
    const pegTop = H * 0.06, pegBot = funnelTop - pR * 3;
    const rows = 18, baseC = 8;
    const spX = (W - padX * 2 - pR * 4) / (baseC - 1);
    const spY = (pegBot - pegTop) / (rows - 1);
    for (let row = 0; row < rows; row++) {
      const even = row % 2 === 0;
      const cols = even ? baseC : baseC - 1;
      const offX = even ? 0 : spX * 0.5;
      for (let col = 0; col < cols; col++) {
        const px = padX + pR * 2 + col * spX + offX;
        const py = pegTop + row * spY;
        if (px - pR > padX + 3 && px + pR < W - padX - 3)
          _mbPegs.push({ x: px, y: py, r: pR, flash: 0 });
      }
    }
  }

  // ── 맵 3: 커스텀 (관리자 편집) ──
  else if (_mbCurrentMap === 3) {
    _mbSticks.push(...chuteSticks);
    const _cd = _mbCustom;
    (_cd.pegsR  || []).forEach(p => _mbPegs.push({ x: p.xr*W, y: p.yr*H, r: Math.max(4, p.rr*W), flash: 0 }));
    (_cd.segsR  || []).forEach(s => _mbSegs.push({ x1: s.x1r*W, y1: s.y1r*H, x2: s.x2r*W, y2: s.y2r*H }));
    (_cd.sticksR|| []).forEach(s => {
      const l = s.lenr * W;
      _mbSticks.push({ cx: s.cxr*W, cy: s.cyr*H, len: l, lenBase: l, lenAmp: s.lenAmp||0.20, lenFreq: s.lenFreq||0.030, lenOff: s.lenOff||0, angle: s.angle||0, omega: s.omega||0.03, thick: s.thick||3 });
    });
  }
}

// ─── 공 초기 배치 ─────────────────────────────────────────────────────────────
function _mbInitBalls(names) {
  const { W, padX, topY, hHW } = _mbGeo;
  const n      = Math.min(names.length, 28);
  const innerW = W - padX * 2;
  // 반지름: 출구(hHW)보다 작아야 한 개씩 빠져나올 수 있음
  const r    = Math.max(6, Math.min(Math.floor(hHW * 0.33), Math.floor(innerW * 0.16 / Math.sqrt(n))));
  const cols = Math.max(2, Math.floor((innerW - r * 2) / (r * 2.15)));
  _mbBalls   = [];
  for (let i = 0; i < n; i++) {
    const ci = i % cols, ri = Math.floor(i / cols);
    const x  = padX + r + ci * (r * 2.15) + (Math.random() - 0.5) * r * 0.4;
    const y  = topY + r + 4 + ri * (r * 2.2);
    _mbBalls.push({
      x: Math.max(padX + r + 2, Math.min(W - padX - r - 2, x)),
      y,
      vx: (Math.random() - 0.5) * 1.0,
      vy: Math.random() * 0.2,
      r,
      color: _MB_COLORS[i % _MB_COLORS.length],
      name:  names[i],
      short: names[i].length > 4 ? names[i].slice(0, 3) + '…' : names[i],
      alive: true,
      settled: false,
    });
  }
}

// ─── 충돌: 공 ↔ 정적 벽 ─────────────────────────────────────────────────────
function _mbCollideWall(b) {
  for (const s of _mbSegs) {
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
    const len2 = dx * dx + dy * dy;
    if (len2 < 0.001) continue;
    const t  = Math.max(0, Math.min(1, ((b.x - s.x1) * dx + (b.y - s.y1) * dy) / len2));
    const cx = s.x1 + t * dx, cy = s.y1 + t * dy;
    const ex = b.x - cx, ey = b.y - cy;
    const d  = Math.sqrt(ex * ex + ey * ey);
    if (d < b.r && d > 0.001) {
      const nx = ex / d, ny = ey / d;
      b.x += nx * (b.r - d);
      b.y += ny * (b.r - d);
      const dot = b.vx * nx + b.vy * ny;
      if (dot < 0) {
        b.vx -= (1 + _MB_RWL) * dot * nx;
        b.vy -= (1 + _MB_RWL) * dot * ny;
        b.vx *= 0.97;
        b.vy *= 0.97;
      }
    }
  }
}

// ─── 충돌: 공 ↔ 핀 ──────────────────────────────────────────────────────────
function _mbCollidePegs(b) {
  for (const p of _mbPegs) {
    const dx = b.x - p.x, dy = b.y - p.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    const md = b.r + p.r;
    if (d < md && d > 0.001) {
      const nx = dx / d, ny = dy / d;
      b.x += nx * (md - d);
      b.y += ny * (md - d);
      const dot = b.vx * nx + b.vy * ny;
      if (dot < 0) {
        b.vx -= (1 + _MB_RPG) * dot * nx;
        b.vy -= (1 + _MB_RPG) * dot * ny;
        b.vx *= 0.95;
        b.vy *= 0.95;
        p.flash = 1.0;  // 핀 발광 트리거
      }
    }
  }
}

// ─── 충돌: 공 ↔ 회전 막대 ───────────────────────────────────────────────────
function _mbCollideStick(b, st) {
  const cos = Math.cos(st.angle), sin = Math.sin(st.angle);
  const ax = st.cx + cos * st.len, ay = st.cy + sin * st.len;
  const bx = st.cx - cos * st.len, by = st.cy - sin * st.len;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 0.001) return;
  const t  = Math.max(0, Math.min(1, ((b.x - ax) * dx + (b.y - ay) * dy) / len2));
  const cx = ax + t * dx, cy = ay + t * dy;
  const ex = b.x - cx, ey = b.y - cy;
  const d  = Math.sqrt(ex * ex + ey * ey);
  const reach = b.r + st.thick;
  if (d < reach && d > 0.001) {
    const nx = ex / d, ny = ey / d;
    // 공 밀어내기
    b.x += nx * (reach - d);
    b.y += ny * (reach - d);
    // 접촉점에서 막대의 회전 표면 속도
    const cpx = cx - st.cx, cpy = cy - st.cy;
    const svx = -st.omega * cpy;   // 접선 방향 속도
    const svy =  st.omega * cpx;
    // 공의 상대 속도 (막대 표면 기준)
    const rvx = b.vx - svx, rvy = b.vy - svy;
    const rdot = rvx * nx + rvy * ny;
    if (rdot < 0) {
      b.vx -= (1 + _MB_RST) * rdot * nx;
      b.vy -= (1 + _MB_RST) * rdot * ny;
      // 막대 회전 에너지 일부 공에 전달 (박진감↑)
      b.vx += svx * 0.28;
      b.vy += svy * 0.28;
      b.vx *= 0.95;
      b.vy *= 0.95;
    }
  }
}

// ─── 충돌: 공 ↔ 공 ──────────────────────────────────────────────────────────
function _mbCollideBalls() {
  const active = _mbBalls.filter(b => b.alive || b.settled);
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      if (!a.alive && !b.alive) continue;  // 둘 다 정착 시 skip
      const dx = b.x - a.x, dy = b.y - a.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const md = a.r + b.r;
      if (d < md && d > 0.001) {
        const nx = dx / d, ny = dy / d;
        const ov = md - d;
        if (a.alive && b.alive) {
          a.x -= nx * ov*0.5; a.y -= ny * ov*0.5;
          b.x += nx * ov*0.5; b.y += ny * ov*0.5;
          const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
          const dot = dvx * nx + dvy * ny;
          if (dot > 0) {
            const imp = dot * (1 + _MB_RBB) * 0.5;
            a.vx -= imp * nx; a.vy -= imp * ny;
            b.vx += imp * nx; b.vy += imp * ny;
          }
        } else if (a.alive) {
          // b 정착 (정적), a만 튕겨남
          a.x -= nx * ov; a.y -= ny * ov;
          const dot = a.vx * nx + a.vy * ny;
          if (dot < 0) { a.vx -= (1 + _MB_RBB) * dot * nx; a.vy -= (1 + _MB_RBB) * dot * ny; }
        } else {
          // a 정착 (정적), b만 튕겨남
          b.x += nx * ov; b.y += ny * ov;
          const dot = b.vx * nx + b.vy * ny;
          if (dot > 0) { b.vx -= (1 + _MB_RBB) * dot * nx; b.vy -= (1 + _MB_RBB) * dot * ny; }
        }
      }
    }
  }
}

// ─── 물리 스텝 ────────────────────────────────────────────────────────────────
function _mbStep() {
  const { H } = _mbGeo;
  _mbTick++;
  // 막대 회전 + 길이 진동 (pulsing)
  for (const st of _mbSticks) {
    st.angle += st.omega;
    if (st.lenBase != null)
      st.len = st.lenBase * (1 + st.lenAmp * Math.sin(_mbTick * st.lenFreq + st.lenOff));
  }
  // 핀 발광 감쇠
  for (const p of _mbPegs) if (p.flash > 0) p.flash = Math.max(0, p.flash - 0.065);
  // 공 적분 + 충돌
  for (const b of _mbBalls) {
    if (!b.alive) continue;
    b.vy += _MB_G;
    b.vx *= _MB_D;
    b.vy *= _MB_D;
    const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (spd > _MB_VCAP) { b.vx *= _MB_VCAP / spd; b.vy *= _MB_VCAP / spd; }
    b.x += b.vx;
    b.y += b.vy;
    _mbCollideWall(b);
    _mbCollidePegs(b);
    for (const st of _mbSticks) _mbCollideStick(b, st);
    // 바닥 정착 감지
    const { floorY } = _mbGeo;
    if (b.y + b.r >= floorY - 1) {
      const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (spd < 2.2) { b.settled = true; b.alive = false; }
    }
    // 화면 밖으로 탈출 시 제거
    if (b.y - b.r > H + 60) b.alive = false;
  }
  _mbCollideBalls();
}

// ─── 그리기 ──────────────────────────────────────────────────────────────────
function _mbDrawIdle(cv) {
  const { W, H, topY, floorY } = _mbGeo;
  const ctx = cv.getContext('2d');
  _mbDrawBg(ctx, W, H);
  _mbDrawWalls(ctx);
  _mbDrawPegs(ctx);
  _mbDrawSticks(ctx);
  // 맵 이름 (좌상단)
  ctx.save();
  ctx.fillStyle    = 'rgba(0,229,255,0.50)';
  ctx.font         = 'bold 10px monospace';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  ctx.shadowColor  = 'rgba(0,229,255,0.7)';
  ctx.shadowBlur   = 6;
  ctx.fillText(_MB_MAP_NAMES[_mbCurrentMap] || '', padX + 2, topY + 4);
  ctx.restore();
  // 이름 입력 안내
  ctx.save();
  ctx.fillStyle    = 'rgba(0,229,255,0.40)';
  ctx.font         = 'bold 11px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = 'rgba(0,229,255,0.6)';
  ctx.shadowBlur   = 7;
  ctx.fillText('▲  이름 입력 후  굴려라!  ▲', W / 2, topY + 18);
  ctx.restore();
}

function _mbDrawFrame(cv) {
  const { W, H, padX, topY } = _mbGeo;
  const ctx = cv.getContext('2d');
  _mbDrawBg(ctx, W, H);
  _mbDrawWalls(ctx);
  _mbDrawPegs(ctx);
  _mbDrawSticks(ctx);
  _mbDrawBalls(ctx);
  // 맵 이름
  ctx.save();
  ctx.fillStyle    = 'rgba(0,229,255,0.40)';
  ctx.font         = 'bold 10px monospace';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  ctx.shadowColor  = 'rgba(0,229,255,0.6)';
  ctx.shadowBlur   = 5;
  ctx.fillText(_MB_MAP_NAMES[_mbCurrentMap] || '', padX + 2, topY + 4);
  ctx.restore();
}

function _mbDrawBg(ctx, W, H) {
  // 짙은 다크 배경
  ctx.fillStyle = '#06061A';
  ctx.fillRect(0, 0, W, H);
  // 상단 퍼플 방사형 글로우
  const rg1 = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.55);
  rg1.addColorStop(0, 'rgba(100,40,255,0.20)');
  rg1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg1;
  ctx.fillRect(0, 0, W, H);
  // 하단 시안 방사형 글로우
  const rg2 = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, H * 0.45);
  rg2.addColorStop(0, 'rgba(0,229,255,0.14)');
  rg2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg2;
  ctx.fillRect(0, 0, W, H);
  // 미세 격자 (사이버펑크 회로 느낌)
  ctx.save();
  ctx.strokeStyle = 'rgba(80,120,255,0.055)';
  ctx.lineWidth = 0.5;
  const gs = 28;
  for (let x = 0; x <= W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
}

function _mbDrawWalls(ctx) {
  const { cx, funnelBot, chuteBot, hHW, landW, floorY } = _mbGeo;
  // ── 벽 선분 — 네온 시안 튜브 ──
  ctx.save();
  // 외부 글로우 패스 (두꺼운 흐린 레이어)
  ctx.strokeStyle = 'rgba(0,229,255,0.25)';
  ctx.lineWidth   = 9;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.shadowColor = 'rgba(0,229,255,0.9)';
  ctx.shadowBlur  = 18;
  ctx.beginPath();
  for (let i = 0; i < _mbSegs.length - 1; i++) {
    const s = _mbSegs[i];
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
  }
  ctx.stroke();
  // 내부 밝은 코어
  ctx.shadowBlur  = 6;
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  for (let i = 0; i < _mbSegs.length - 1; i++) {
    const s = _mbSegs[i];
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
  }
  ctx.stroke();
  ctx.restore();

  // 슈트 중심선 (점선)
  ctx.save();
  ctx.strokeStyle = 'rgba(0,229,255,0.18)';
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(cx, funnelBot + 8);
  ctx.lineTo(cx, chuteBot - 4);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ── 착지 구역 배경 ──
  ctx.save();
  const lx0 = cx - landW, lx1 = cx + landW;
  const bgGrad = ctx.createLinearGradient(cx, chuteBot, cx, floorY);
  bgGrad.addColorStop(0, 'rgba(0,255,136,0)');
  bgGrad.addColorStop(1, 'rgba(0,255,136,0.09)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.moveTo(cx - hHW, chuteBot);
  ctx.lineTo(lx0, floorY);
  ctx.lineTo(lx1, floorY);
  ctx.lineTo(cx + hHW, chuteBot);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── 바닥 네온 그린 라인 ──
  ctx.save();
  ctx.shadowColor = 'rgba(0,255,136,0.95)';
  ctx.shadowBlur  = 20;
  ctx.strokeStyle = 'rgba(0,255,136,0.3)';
  ctx.lineWidth   = 8;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(lx0, floorY);
  ctx.lineTo(lx1, floorY);
  ctx.stroke();
  ctx.shadowBlur  = 8;
  ctx.strokeStyle = '#00FF88';
  ctx.lineWidth   = 2.5;
  ctx.beginPath();
  ctx.moveTo(lx0, floorY);
  ctx.lineTo(lx1, floorY);
  ctx.stroke();
  ctx.restore();

  // 착지 반사
  ctx.save();
  const refGrad = ctx.createLinearGradient(cx, floorY, cx, floorY + 22);
  refGrad.addColorStop(0, 'rgba(0,255,136,0.16)');
  refGrad.addColorStop(1, 'rgba(0,255,136,0)');
  ctx.fillStyle = refGrad;
  ctx.fillRect(lx0, floorY, landW * 2, 22);
  ctx.restore();

  // LANDING 텍스트
  ctx.save();
  ctx.fillStyle    = 'rgba(0,255,136,0.5)';
  ctx.font         = 'bold 10px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('▼  LANDING ZONE  ▼', cx, floorY + 5);
  ctx.restore();
}

function _mbDrawPegs(ctx) {
  ctx.save();
  for (const p of _mbPegs) {
    const f = p.flash;
    const pr = p.r + (f > 0 ? f * 2.5 : 0);
    // 글로우
    ctx.shadowColor = f > 0 ? `rgba(255,255,100,${f})` : 'rgba(255,45,120,0.65)';
    ctx.shadowBlur  = f > 0 ? 22 : 8;
    // 핀 본체 — 핫 핑크 / 히트시 화이트
    ctx.beginPath();
    ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
    ctx.fillStyle = f > 0
      ? `rgba(255,255,180,${0.6 + f * 0.4})`
      : '#FF2D78';
    ctx.fill();
    // 테두리
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = f > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,150,200,0.55)';
    ctx.lineWidth   = 1;
    ctx.stroke();
    // 상단 반사 하이라이트
    ctx.beginPath();
    ctx.arc(p.x - p.r * 0.22, p.y - p.r * 0.28, p.r * 0.36, 0, Math.PI * 2);
    ctx.fillStyle = f > 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)';
    ctx.fill();
  }
  ctx.restore();
}

function _mbDrawSticks(ctx) {
  ctx.save();
  const { funnelBot, chuteBot } = _mbGeo;
  for (let si = 0; si < _mbSticks.length; si++) {
    const st = _mbSticks[si];
    const inChute = st.cy > funnelBot && st.cy < chuteBot;
    const isLand  = si === _mbSticks.length - 1; // 착지 스위퍼
    const cos = Math.cos(st.angle), sin = Math.sin(st.angle);
    const ax = st.cx + cos * st.len, ay = st.cy + sin * st.len;
    const bx = st.cx - cos * st.len, by = st.cy - sin * st.len;

    // 막대 그라디언트 색상 결정
    let grad, glowCol;
    if (inChute) {
      // 슈트: 오렌지→레드 핫 그라디언트
      grad = ctx.createLinearGradient(ax, ay, bx, by);
      grad.addColorStop(0,   si === 6 ? '#FF6B00' : '#FF0040');
      grad.addColorStop(0.5, '#FF2D50');
      grad.addColorStop(1,   si === 6 ? '#FF0040' : '#FF6B00');
      glowCol = 'rgba(255,60,30,0.9)';
    } else if (isLand) {
      // 착지: 네온 그린
      grad = ctx.createLinearGradient(ax, ay, bx, by);
      grad.addColorStop(0, '#00FF88');
      grad.addColorStop(1, '#00CEC9');
      glowCol = 'rgba(0,255,136,0.8)';
    } else {
      // 일반: 시안→퍼플 쿨 그라디언트
      grad = ctx.createLinearGradient(ax, ay, bx, by);
      grad.addColorStop(0,   '#00E5FF');
      grad.addColorStop(0.5, '#7B2FFF');
      grad.addColorStop(1,   '#00E5FF');
      glowCol = 'rgba(0,180,255,0.75)';
    }

    // 외부 글로우 레이어
    ctx.shadowColor = glowCol;
    ctx.shadowBlur  = inChute ? 22 : 16;
    ctx.lineCap     = 'round';
    ctx.strokeStyle = grad;
    ctx.lineWidth   = st.thick * 2.8;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 막대 본체
    ctx.shadowBlur  = inChute ? 14 : 10;
    ctx.strokeStyle = grad;
    ctx.lineWidth   = st.thick * 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // 중심 하이라이트 (흰 코어)
    ctx.shadowBlur  = 0;
    const coreG = ctx.createLinearGradient(ax, ay, bx, by);
    coreG.addColorStop(0,   'rgba(255,255,255,0)');
    coreG.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    coreG.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.strokeStyle = coreG;
    ctx.lineWidth   = st.thick * 0.55;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // 중심 허브 (흰 점 + 글로우 링)
    ctx.shadowColor = glowCol;
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(st.cx, st.cy, st.thick + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = inChute ? '#FF4400' : (isLand ? '#00FF88' : '#00E5FF');
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(st.cx, st.cy, st.thick + 5.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function _mbDrawBalls(ctx) {
  ctx.save();
  for (const b of _mbBalls) {
    if (!b.alive && !b.settled) continue;
    const isWinner = b.settled && b === _mbWinner;

    // 당첨 공 — 이중 글로우 링
    if (isWinner) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur  = 30;
      ctx.strokeStyle = 'rgba(255,215,0,0.5)';
      ctx.lineWidth   = 7;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur  = 14;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 외부 색상 글로우
    ctx.shadowColor = b.color;
    ctx.shadowBlur  = b.settled ? 22 : 14;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    // 유리구슬 라디얼 그라디언트
    const gr = ctx.createRadialGradient(
      b.x - b.r * 0.32, b.y - b.r * 0.38, b.r * 0.04,
      b.x,              b.y,               b.r
    );
    gr.addColorStop(0,   'rgba(255,255,255,0.90)');
    gr.addColorStop(0.18,'rgba(255,255,255,0.55)');
    gr.addColorStop(0.45, b.color + 'DD');
    gr.addColorStop(1,    b.color);
    ctx.fillStyle = gr;
    ctx.fill();

    // 테두리
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = b.settled ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.22)';
    ctx.lineWidth   = b.settled ? 1.8 : 1.2;
    ctx.stroke();

    // 하단 역반사 (유리 느낌)
    ctx.beginPath();
    ctx.arc(b.x + b.r * 0.18, b.y + b.r * 0.35, b.r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fill();

    // 이름 텍스트
    if (b.r >= 12) {
      ctx.fillStyle    = '#fff';
      ctx.font         = `bold ${Math.max(8, Math.round(b.r * 0.66))}px sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur   = 3;
      ctx.fillText(b.short, b.x, b.y + 0.5);
      ctx.shadowBlur   = 0;
    }
  }
  ctx.restore();
}

// ─── 메인 루프 ────────────────────────────────────────────────────────────────
function _mbLoop(cv) {
  if (!_mbRunning) return;
  _mbStep();
  _mbDrawFrame(cv);
  const settled = _mbBalls.filter(b => b.settled);
  const alive   = _mbBalls.filter(b => b.alive);
  if (settled.length > 0 && !_mbWinner) {
    _mbWinner  = settled[0];
    _mbRunning = false;
    _mbWinTimeout = setTimeout(() => _mbShowWinner(cv), 700);
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
  if (_mbIdleAnimId) { cancelAnimationFrame(_mbIdleAnimId); _mbIdleAnimId = null; }
  if (_mbAnimId)     { cancelAnimationFrame(_mbAnimId); _mbAnimId = null; }
  if (_mbWinTimeout) { clearTimeout(_mbWinTimeout); _mbWinTimeout = null; }
  _mbRunning = false;
  _mbWinner  = null;
  _mbTick    = 0;
  const _mbMapCount = (_mbCustom.pegsR.length || _mbCustom.segsR.length || _mbCustom.sticksR.length) ? 4 : 3;
  _mbCurrentMap = Math.floor(Math.random() * _mbMapCount);
  const card = document.getElementById('mb-result-card');
  if (card) card.style.display = 'none';
  const btn = document.getElementById('mb-btn');
  if (btn) btn.disabled = true;
  _mbBuildWorld(cv.width, cv.height);  // 매번 새로 빌드 (막대 초기각 리셋)
  _mbInitBalls(names);
  _mbRunning = true;
  _mbAnimId  = requestAnimationFrame(() => _mbLoop(cv));
}

// ─── 결과 표시 ────────────────────────────────────────────────────────────────
function _mbShowWinner(cv) {
  if (!_mbWinner) return;
  _mbDrawFrame(cv);
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
  for (let i = 0; i < 20; i++) {
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
        o.frequency.value = [523, 659, 784, 1047][i];
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
      + `<span style="font-weight:700;color:rgba(255,255,255,0.88);flex:1">${h.name}</span>`
      + `<span style="font-size:11px;color:rgba(0,229,255,0.55);font-family:monospace">${h.time}</span>`
      + '</div>';
  }).join('');
  return '<div class="mb-hist-box">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    + '<span style="font-size:13px;font-weight:700;color:#00E5FF;letter-spacing:.5px">📋 당첨 기록</span>'
    + '<button onclick="_mbClearHistory()" style="font-size:11px;padding:3px 8px;border-radius:6px;'
    + 'border:1px solid rgba(0,229,255,0.25);background:rgba(0,229,255,0.08);color:rgba(0,229,255,0.7);cursor:pointer">전체 삭제</button>'
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

// ─── 🗺️ 맵 에디터 (관리자 전용) ──────────────────────────────────────────────
let _mbEdTool     = 'peg';
let _mbEdDrawing  = false;
let _mbEdDragSt   = null;
let _mbEdPreview  = null;
let _mbEdSc       = 1;     // scale: editorPx / gamePx
let _mbEdGW       = 480;
let _mbEdGH       = 1440;

function _mbOpenEditor() {
  if (!document.getElementById('mb-editor-modal')) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
<div id="mb-editor-modal" class="modal" style="display:none;z-index:9999">
  <div class="modal-inner" style="max-width:400px;width:94vw;padding:18px 16px;background:#0a0618;border:1.5px solid rgba(123,47,255,0.5);border-radius:18px;color:#fff;box-sizing:border-box">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <span style="font-weight:900;font-size:15px;color:#BD93F9">🗺️ 마블 맵 편집기</span>
      <button onclick="cm('mb-editor-modal')" style="background:none;border:none;color:#666;font-size:20px;cursor:pointer;line-height:1">✕</button>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;background:rgba(255,255,255,0.04);border-radius:10px;padding:10px 12px">
      <span style="font-size:12px;color:#aaa;white-space:nowrap">📐 세로 길이</span>
      <input type="range" id="mb-ed-height" min="1.5" max="5.0" step="0.1" style="flex:1;accent-color:#7B2FFF"
        oninput="document.getElementById('mb-ed-hval').textContent=parseFloat(this.value).toFixed(1)+'x';_mbEdUpdateHeight()">
      <span id="mb-ed-hval" style="font-size:13px;font-weight:700;color:#BD93F9;min-width:32px">3.0x</span>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:8px">
      <button id="mb-ed-t-peg"   onclick="_mbEdSetTool('peg')"   style="flex:1;padding:7px 2px;border-radius:8px;border:1.5px solid #00E5FF;background:rgba(0,229,255,0.13);color:#00E5FF;font-size:11px;font-weight:700;cursor:pointer">⚫ 핀</button>
      <button id="mb-ed-t-wall"  onclick="_mbEdSetTool('wall')"  style="flex:1;padding:7px 2px;border-radius:8px;border:1.5px solid #444;background:rgba(255,255,255,0.05);color:#888;font-size:11px;font-weight:700;cursor:pointer">📏 벽</button>
      <button id="mb-ed-t-stick" onclick="_mbEdSetTool('stick')" style="flex:1;padding:7px 2px;border-radius:8px;border:1.5px solid #444;background:rgba(255,255,255,0.05);color:#888;font-size:11px;font-weight:700;cursor:pointer">🔄 막대</button>
      <button id="mb-ed-t-erase" onclick="_mbEdSetTool('erase')" style="flex:1;padding:7px 2px;border-radius:8px;border:1.5px solid #444;background:rgba(255,255,255,0.05);color:#888;font-size:11px;font-weight:700;cursor:pointer">🗑️ 지우기</button>
    </div>
    <div id="mb-ed-hint" style="font-size:11px;color:#7B6FA0;text-align:center;margin-bottom:8px">클릭으로 핀 추가 / 다시 클릭하면 삭제</div>
    <div style="display:flex;justify-content:center;overflow:auto;max-height:52vh;border-radius:10px;border:1px solid rgba(123,47,255,0.25)">
      <canvas id="mb-ed-canvas" style="cursor:crosshair;display:block;touch-action:none"></canvas>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button onclick="_mbEditorClear()" style="flex:1;padding:9px;border-radius:10px;border:1px solid #dc2626;background:rgba(220,38,38,0.1);color:#f87171;font-size:12px;font-weight:700;cursor:pointer">🗑️ 초기화</button>
      <button onclick="_mbEditorSave()" style="flex:2;padding:9px;border-radius:10px;border:none;background:linear-gradient(135deg,#7B2FFF,#00BFFF);color:#fff;font-size:13px;font-weight:700;cursor:pointer">💾 저장하고 적용</button>
    </div>
  </div>
</div>`;
    document.body.appendChild(wrap.firstElementChild);
  }
  const sl = document.getElementById('mb-ed-height');
  const vl = document.getElementById('mb-ed-hval');
  const hm = _mbCustom.heightMul || 3.0;
  if (sl) sl.value = hm;
  if (vl) vl.textContent = hm.toFixed(1) + 'x';
  om('mb-editor-modal');
  _mbEdInit();
}

function _mbEdInit() {
  const cv = document.getElementById('mb-ed-canvas');
  if (!cv) return;
  const avW  = Math.min(window.innerWidth - 40, 480);
  const hm   = _mbCustom.heightMul || 3.0;
  const avH  = Math.max(800, Math.min(3000, Math.round(avW * hm)));
  const edW  = Math.min(350, window.innerWidth * 0.82);
  _mbEdSc    = edW / avW;
  _mbEdGW    = avW;
  _mbEdGH    = avH;
  cv.width   = Math.round(avW * _mbEdSc);
  cv.height  = Math.round(avH * _mbEdSc);
  cv.style.width  = cv.width  + 'px';
  cv.style.height = cv.height + 'px';
  // Build base walls for reference display
  _mbBuildWorld(avW, avH);
  cv.onmousedown  = e => _mbEdDown(e);
  cv.onmousemove  = e => _mbEdMove(e);
  cv.onmouseup    = e => _mbEdUp(e);
  cv.onmouseleave = ()  => { _mbEdDrawing = false; _mbEdPreview = null; _mbEdDraw(); };
  cv.ontouchstart = e => { e.preventDefault(); _mbEdDown(e.touches[0]); };
  cv.ontouchmove  = e => { e.preventDefault(); _mbEdMove(e.touches[0]); };
  cv.ontouchend   = e => { e.preventDefault(); _mbEdUp(e.changedTouches[0]); };
  _mbEdDraw();
}

function _mbEdPos(e) {
  const cv = document.getElementById('mb-ed-canvas');
  const r  = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) };
}

function _mbEdDown(e) {
  const pos = _mbEdPos(e);
  if (_mbEdTool === 'erase') { _mbEdErase(pos); return; }
  if (_mbEdTool === 'peg') {
    const W = _mbEdGW, H = _mbEdGH, sc = _mbEdSc;
    const xr = pos.x / (W * sc), yr = pos.y / (H * sc);
    const rr = Math.max(4, Math.round(W * 0.015)) / W;
    const hi = _mbCustom.pegsR.findIndex(p => Math.hypot((p.xr-xr)*W*sc, (p.yr-yr)*H*sc) < Math.max(4,rr*W)*sc*1.8);
    if (hi >= 0) _mbCustom.pegsR.splice(hi, 1);
    else _mbCustom.pegsR.push({ xr, yr, rr });
    _mbEdDraw();
    return;
  }
  _mbEdDrawing = true;
  _mbEdDragSt  = pos;
}

function _mbEdMove(e) {
  if (!_mbEdDrawing) return;
  const pos = _mbEdPos(e);
  _mbEdPreview = { tool: _mbEdTool, x1: _mbEdDragSt.x, y1: _mbEdDragSt.y, x2: pos.x, y2: pos.y };
  _mbEdDraw();
}

function _mbEdUp(e) {
  if (!_mbEdDrawing) return;
  _mbEdDrawing = false;
  const pos = _mbEdPos(e);
  const dx = pos.x - _mbEdDragSt.x, dy = pos.y - _mbEdDragSt.y;
  const dist = Math.hypot(dx, dy);
  const W = _mbEdGW, H = _mbEdGH, sc = _mbEdSc;
  if (dist > 8) {
    if (_mbEdTool === 'wall') {
      _mbCustom.segsR.push({ x1r: _mbEdDragSt.x/(W*sc), y1r: _mbEdDragSt.y/(H*sc), x2r: pos.x/(W*sc), y2r: pos.y/(H*sc) });
    } else if (_mbEdTool === 'stick') {
      const angle = Math.atan2(dy, dx);
      _mbCustom.sticksR.push({
        cxr: (_mbEdDragSt.x+pos.x)*0.5/(W*sc), cyr: (_mbEdDragSt.y+pos.y)*0.5/(H*sc),
        lenr: dist*0.5/(W*sc), angle, omega: 0.035, thick: 3,
        lenAmp: 0.22, lenFreq: 0.030, lenOff: Math.random()*Math.PI*2
      });
    }
  }
  _mbEdPreview = null;
  _mbEdDraw();
}

function _mbEdErase(pos) {
  const W = _mbEdGW, H = _mbEdGH, sc = _mbEdSc;
  const xg = pos.x / sc, yg = pos.y / sc; // game px
  const THR = 14;
  const pi = _mbCustom.pegsR.findIndex(p => Math.hypot(p.xr*W-xg, p.yr*H-yg) < THR*1.5);
  if (pi >= 0) { _mbCustom.pegsR.splice(pi, 1); _mbEdDraw(); return; }
  const si = _mbCustom.segsR.findIndex(s => _mbEdSegDist(xg,yg, s.x1r*W,s.y1r*H, s.x2r*W,s.y2r*H) < THR);
  if (si >= 0) { _mbCustom.segsR.splice(si, 1); _mbEdDraw(); return; }
  const ki = _mbCustom.sticksR.findIndex(s => {
    const l = s.lenr*W, cx2 = s.cxr*W, cy2 = s.cyr*H;
    return _mbEdSegDist(xg,yg, cx2-Math.cos(s.angle)*l, cy2-Math.sin(s.angle)*l, cx2+Math.cos(s.angle)*l, cy2+Math.sin(s.angle)*l) < THR;
  });
  if (ki >= 0) { _mbCustom.sticksR.splice(ki, 1); _mbEdDraw(); }
}

function _mbEdSegDist(px,py,x1,y1,x2,y2) {
  const dx=x2-x1, dy=y2-y1, l2=dx*dx+dy*dy;
  if (l2 < 0.001) return Math.hypot(px-x1, py-y1);
  const t = Math.max(0, Math.min(1, ((px-x1)*dx+(py-y1)*dy)/l2));
  return Math.hypot(px-(x1+t*dx), py-(y1+t*dy));
}

function _mbEdSetTool(t) {
  _mbEdTool = t;
  const hints = { peg:'클릭으로 핀 추가 / 다시 클릭하면 삭제', wall:'드래그해서 벽을 그립니다', stick:'드래그해서 회전 막대를 추가합니다', erase:'요소를 클릭해 삭제합니다' };
  const el = document.getElementById('mb-ed-hint');
  if (el) el.textContent = hints[t] || '';
  ['peg','wall','stick','erase'].forEach(id => {
    const btn = document.getElementById('mb-ed-t-' + id);
    if (!btn) return;
    const on = id === t;
    btn.style.border     = on ? '1.5px solid #00E5FF' : '1.5px solid #444';
    btn.style.background = on ? 'rgba(0,229,255,0.13)' : 'rgba(255,255,255,0.05)';
    btn.style.color      = on ? '#00E5FF' : '#888';
  });
}

function _mbEdUpdateHeight() {
  const sl = document.getElementById('mb-ed-height');
  if (!sl) return;
  _mbCustom.heightMul = parseFloat(sl.value);
  _mbEdInit();
}

function _mbEdDraw() {
  const cv = document.getElementById('mb-ed-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = _mbEdGW, H = _mbEdGH, sc = _mbEdSc;
  ctx.fillStyle = '#0a0618';
  ctx.fillRect(0, 0, cv.width, cv.height);
  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
  const gs = Math.round(40 * sc);
  for (let x = 0; x < cv.width; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,cv.height); ctx.stroke(); }
  for (let y = 0; y < cv.height; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(cv.width,y); ctx.stroke(); }
  // Base funnel walls (reference)
  ctx.strokeStyle = 'rgba(0,229,255,0.35)';
  ctx.lineWidth = 1.5;
  for (const s of _mbSegs) { ctx.beginPath(); ctx.moveTo(s.x1*sc, s.y1*sc); ctx.lineTo(s.x2*sc, s.y2*sc); ctx.stroke(); }
  // Custom walls
  ctx.strokeStyle = '#FFB86C'; ctx.lineWidth = 2;
  for (const s of _mbCustom.segsR) {
    ctx.beginPath(); ctx.moveTo(s.x1r*W*sc, s.y1r*H*sc); ctx.lineTo(s.x2r*W*sc, s.y2r*H*sc); ctx.stroke();
  }
  // Custom sticks
  for (const s of _mbCustom.sticksR) {
    const cx2=s.cxr*W*sc, cy2=s.cyr*H*sc, l=s.lenr*W*sc;
    const grad = ctx.createLinearGradient(cx2-Math.cos(s.angle)*l, cy2-Math.sin(s.angle)*l, cx2+Math.cos(s.angle)*l, cy2+Math.sin(s.angle)*l);
    grad.addColorStop(0, '#7B2FFF'); grad.addColorStop(1, '#BD93F9');
    ctx.strokeStyle = grad; ctx.lineWidth = Math.max(2, s.thick*sc);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx2-Math.cos(s.angle)*l, cy2-Math.sin(s.angle)*l); ctx.lineTo(cx2+Math.cos(s.angle)*l, cy2+Math.sin(s.angle)*l); ctx.stroke();
    ctx.fillStyle='#BD93F9'; ctx.beginPath(); ctx.arc(cx2,cy2,3,0,Math.PI*2); ctx.fill();
    ctx.lineCap = 'butt';
  }
  // Custom pegs
  for (const p of _mbCustom.pegsR) {
    const pr = Math.max(4, p.rr*W)*sc;
    const grd = ctx.createRadialGradient(p.xr*W*sc-pr*0.3, p.yr*H*sc-pr*0.3, 0, p.xr*W*sc, p.yr*H*sc, pr);
    grd.addColorStop(0,'#FF79C6'); grd.addColorStop(1,'#FF2D78');
    ctx.beginPath(); ctx.arc(p.xr*W*sc, p.yr*H*sc, pr, 0, Math.PI*2);
    ctx.fillStyle = grd; ctx.fill();
    ctx.strokeStyle='rgba(255,120,200,0.5)'; ctx.lineWidth=1; ctx.stroke();
  }
  // Preview (drag in progress)
  if (_mbEdPreview) {
    const { tool, x1, y1, x2, y2 } = _mbEdPreview;
    ctx.setLineDash([5,4]);
    if (tool === 'wall') { ctx.strokeStyle='#FFB86C'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
    else if (tool === 'stick') {
      ctx.strokeStyle='#BD93F9'; ctx.lineWidth=3; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.lineCap='butt';
    }
    ctx.setLineDash([]);
  }
  // Legend
  ctx.fillStyle='rgba(0,229,255,0.4)'; ctx.font=`${Math.max(9,Math.round(10*sc))}px sans-serif`;
  ctx.fillText('— 기본 벽', 6*sc, 14*sc);
  ctx.fillStyle='#FFB86C'; ctx.fillText('— 커스텀 벽', 6*sc, 26*sc);
  ctx.fillStyle='#BD93F9'; ctx.fillText('— 회전 막대', 6*sc, 38*sc);
}

function _mbEditorSave() {
  _mbCustom.heightMul = parseFloat((document.getElementById('mb-ed-height')||{}).value || _mbCustom.heightMul || 3.0);
  localStorage.setItem('su_mb_custom', JSON.stringify(_mbCustom));
  cm('mb-editor-modal');
  _mbSetupCanvas();
}

function _mbEditorClear() {
  if (!confirm('커스텀 맵 요소를 모두 초기화할까요?')) return;
  _mbCustom.pegsR = []; _mbCustom.segsR = []; _mbCustom.sticksR = [];
  _mbEdDraw();
}
