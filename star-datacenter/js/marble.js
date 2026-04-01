// ─── 🔮 마블 물리 룰렛 v3 (통합 맵 시스템) ────────────────────────────────

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

const _MB_COLORS = ['#FF2D78','#FF6B00','#FFDD00','#00FF88','#00E5FF','#BD93F9','#FF79C6','#50FA7B','#8B5CF6','#FFB86C','#8BE9FD','#FF5555','#F1FA8C','#44B8FF','#FF6BCB','#00FFC8'];
const _MB_G = 0.20, _MB_D = 0.997, _MB_RBB = 0.52, _MB_RPG = 0.70, _MB_RWL = 0.44, _MB_RST = 0.78, _MB_VCAP = 22;

let _mbBalls = [], _mbSegs = [], _mbPegs = [], _mbSticks = [], _mbBoosters = [], _mbBlackholes = [], _mbConveyors = [];
let _mbGeo = {}, _mbRunning = false, _mbAnimId = null, _mbWinTimeout = null, _mbWinner = null, _mbHistory = [], _mbAC = null, _mbIdleAnimId = null, _mbTick = 0;
let _mbMaps = [], _mbCurrentMapIndex = -1;

function _mbGetDefaultMaps() {
  const W = 480, H = 1440, cx = W/2, padX = 18, topY = 12, funnelTop = H*0.7, pR = 7.2;
  const maps = [
    { name: '🎯 핀볼', heightMul: 3.0, pegsR: [], sticksR: [], segsR: [], boostersR: [], bhR: [], convR: [] },
    { name: '⚡ 지그재그', heightMul: 3.0, pegsR: [], sticksR: [], segsR: [], boostersR: [], bhR: [], convR: [] },
    { name: '🌀 카오스', heightMul: 3.0, pegsR: [], sticksR: [], segsR: [], boostersR: [], bhR: [], convR: [] }
  ];
  // 핀볼
  for(let r=0;r<15;r++){
    let even=r%2===0, cols=even?7:6, spX=(W-padX*2-pR*4)/6, spY=(funnelTop-topY-100)/14;
    for(let c=0;c<cols;c++){
      let px=padX+pR*2+c*spX+(even?0:spX*0.5), py=topY+70+r*spY;
      if(px>padX+10 && px<W-padX-10) maps[0].pegsR.push({xr:px/W, yr:py/H, rr:pR/W});
    }
  }
  return maps;
}

function _mbInit() {
  try {
    _mbMaps = JSON.parse(localStorage.getItem('su_mb_maps') || '[]');
    if(!_mbMaps.length) _mbMaps = _mbGetDefaultMaps();
    _mbHistory = JSON.parse(localStorage.getItem('su_mb_hist') || '[]');
  } catch(e) { _mbMaps = _mbGetDefaultMaps(); }
  const root = document.getElementById('mb-root');
  if (root) _mbRender(root);
}

function _mbRender(root) {
  const saved = localStorage.getItem('su_mb_input') || '';
  const mapSel = localStorage.getItem('su_mb_map_sel') || '-1';
  _mbCurrentMapIndex = parseInt(mapSel);

  root.innerHTML = `<div class="mb-wrap">
    <div style="width:100%;max-width:480px;display:flex;gap:8px">
      <textarea id="mb-input" style="flex:1;height:68px;border:2px solid var(--border);border-radius:10px;padding:8px;font-size:14px" oninput="localStorage.setItem('su_mb_input',this.value)">${saved}</textarea>
      <div style="display:flex;flex-direction:column;gap:4px">
        <button onclick="_mbShuffleInput()" class="btn" style="padding:4px 8px;font-size:12px">🔀 섞기</button>
        <button onclick="_mbOpenEditor()" class="btn" style="padding:4px 8px;font-size:12px;border-color:#7B2FFF;color:#BD93F9">🗺️ 맵 관리</button>
      </div>
    </div>
    <div style="width:100%;max-width:480px;display:flex;align-items:center;gap:8px">
      <label style="font-size:12px;font-weight:600">🗺️ 맵 선택</label>
      <select id="mb-map-sel" onchange="_mbOnMapSel(this.value)" style="flex:1;padding:5px;border-radius:8px">
        <option value="-1">🎲 랜덤</option>
        ${_mbMaps.map((m,i)=>`<option value="${i}" ${i===_mbCurrentMapIndex?'selected':''}>${m.name}</option>`).join('')}
      </select>
    </div>
    <div class="mb-canvas-wrap"><canvas id="mb-canvas"></canvas></div>
    <button class="mb-btn" id="mb-btn" onclick="_mbStart()">🔮 굴려라!</button>
    <div id="mb-result-card" style="display:none"></div>
    ${_mbHistHTML()}
  </div>`;
  _mbSetupCanvas();
}

function _mbOnMapSel(v) {
  localStorage.setItem('su_mb_map_sel', v);
  _mbCurrentMapIndex = parseInt(v);
  _mbSetupCanvas();
}

function _mbShuffleInput() {
  const inp = document.getElementById('mb-input');
  if(!inp) return;
  const names = inp.value.split(/[,\n]/).map(s=>s.trim()).filter(Boolean);
  for(let i=names.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [names[i],names[j]]=[names[j],names[i]];
  }
  inp.value = names.join(', ');
  localStorage.setItem('su_mb_input', inp.value);
}

function _mbSetupCanvas() {
  const cv = document.getElementById('mb-canvas');
  if(!cv) return;
  const avW = Math.min(window.innerWidth - 40, 480);
  const map = _mbCurrentMapIndex >= 0 ? _mbMaps[_mbCurrentMapIndex] : _mbMaps[0];
  const hm = map ? (map.heightMul || 3.0) : 3.0;
  cv.width = avW; cv.height = Math.round(avW * hm);
  cv.style.width = avW+'px'; cv.style.height = cv.height+'px';
  _mbBuildWorld(cv.width, cv.height);
  _mbDrawIdle(cv);
  _mbStartIdleAnim(cv);
}

function _mbBuildWorld(W, H) {
  const cx=W/2, padX=18, topY=12, fT=H*0.7, fB=H*0.8, cB=H*0.9, hHW=W*0.1, lW=W*0.43, fY=H-26;
  _mbGeo = { W, H, cx, padX, topY, funnelTop:fT, funnelBot:fB, chuteBot:cB, hHW, landW:lW, floorY:fY };
  _mbSegs = [
    {x1:padX, y1:topY, x2:padX, y2:fT}, {x1:padX, y1:fT, x2:cx-hHW, y2:fB},
    {x1:W-padX, y1:topY, x2:W-padX, y2:fT}, {x1:W-padX, y1:fT, x2:cx+hHW, y2:fB},
    {x1:padX, y1:topY, x2:W-padX, y2:topY}, {x1:cx-hHW, y1:fB, x2:cx-hHW, y2:cB},
    {x1:cx+hHW, y1:fB, x2:cx+hHW, y2:cB}, {x1:cx-hHW, y1:cB, x2:cx-lW, y2:fY},
    {x1:cx+hHW, y1:cB, x2:cx+lW, y2:fY}, {x1:cx-lW, y1:fY, x2:cx+lW, y2:fY}
  ];
  _mbPegs=[]; _mbSticks=[]; _mbBoosters=[]; _mbBlackholes=[]; _mbConveyors=[];
  const map = _mbCurrentMapIndex >= 0 ? _mbMaps[_mbCurrentMapIndex] : _mbMaps[Math.floor(Math.random()*_mbMaps.length)];
  if(map) {
    (map.pegsR||[]).forEach(p=>_mbPegs.push({x:p.xr*W, y:p.yr*H, r:p.rr*W, flash:0, bumper:p.bumper}));
    (map.segsR||[]).forEach(s=>_mbSegs.push({x1:s.x1r*W, y1:s.y1r*H, x2:s.x2r*W, y2:s.y2r*H}));
    (map.sticksR||[]).forEach(s=>_mbSticks.push({cx:s.cxr*W, cy:s.cyr*H, len:s.lenr*W, lenBase:s.lenr*W, lenAmp:s.lenAmp||0.2, lenFreq:s.lenFreq||0.03, lenOff:s.lenOff||0, angle:s.angle||0, omega:s.omega||0.03, thick:s.thick||3, spinner:s.spinner}));
    (map.boostersR||[]).forEach(b=>_mbBoosters.push({cx:b.cxr*W, cy:b.cyr*H, len:b.lenr*W, angle:b.angle, power:b.power||15, flash:0}));
    (map.bhR||[]).forEach(bh=>_mbBlackholes.push({cx:bh.cxr*W, cy:bh.cyr*H, r:bh.rr*W, power:bh.power||0.5}));
    (map.convR||[]).forEach(c=>_mbConveyors.push({x1:c.x1r*W, y1:c.y1r*H, x2:c.x2r*W, y2:c.y2r*H, speed:c.speed||2}));
  }
}

function _mbStart() {
  const names = (localStorage.getItem('su_mb_input')||'').split(/[,\n]/).map(s=>s.trim()).filter(Boolean);
  if(names.length < 2) return alert('이름을 2개 이상 입력하세요.');
  const cv = document.getElementById('mb-canvas');
  if(!cv) return;
  if(_mbIdleAnimId) cancelAnimationFrame(_mbIdleAnimId);
  _mbRunning = true; _mbWinner = null; _mbTick = 0;
  document.getElementById('mb-btn').disabled = true;
  _mbBuildWorld(cv.width, cv.height);
  _mbInitBalls(names);
  _mbLoop(cv);
}

function _mbInitBalls(names) {
  const {W, padX, topY, hHW} = _mbGeo;
  const n = Math.min(names.length, 30);
  const r = Math.max(6, Math.min(12, (W-padX*2)/n));
  _mbBalls = names.slice(0,n).map((name, i)=>({
    x: padX+r+Math.random()*(W-padX*2-r*2), y: topY+r+i*2, vx: (Math.random()-0.5)*2, vy: 0, r, color: _MB_COLORS[i%_MB_COLORS.length], name, short: name.length>4?name.slice(0,3)+'…':name, alive:true, settled:false
  }));
}

function _mbLoop(cv) {
  if(!_mbRunning) return;
  _mbStep();
  _mbDrawFrame(cv);
  const settled = _mbBalls.filter(b=>b.settled);
  if(settled.length > 0 && !_mbWinner) {
    _mbWinner = settled[0];
    setTimeout(()=>_mbShowWinner(cv), 500);
    _mbRunning = false;
  } else if(_mbBalls.every(b=>!b.alive)) {
    _mbRunning = false;
    document.getElementById('mb-btn').disabled = false;
  }
  if(_mbRunning) _mbAnimId = requestAnimationFrame(()=>_mbLoop(cv));
}

function _mbStep() {
  _mbTick++;
  _mbSticks.forEach(st=>{
    st.angle += st.omega;
    if(st.lenBase) st.len = st.lenBase*(1+st.lenAmp*Math.sin(_mbTick*st.lenFreq+st.lenOff));
  });
  _mbBalls.forEach(b=>{
    if(!b.alive) return;
    b.vy += _MB_G; b.vx *= _MB_D; b.vy *= _MB_D;
    _mbBlackholes.forEach(bh=>{
      const dx=bh.cx-b.x, dy=bh.cy-b.y, d=Math.hypot(dx,dy);
      if(d<bh.r*3){ b.vx+=dx/d*bh.power; b.vy+=dy/d*bh.power; }
    });
    b.x += b.vx; b.y += b.vy;
    _mbCollideWall(b); _mbCollidePegs(b);
    _mbSticks.forEach(st=>_mbCollideStick(b,st));
    _mbBoosters.forEach(bo=>_mbCollideBooster(b,bo));
    if(b.y > _mbGeo.floorY-b.r-2 && Math.hypot(b.vx,b.vy)<2){ b.settled=true; b.alive=false; }
    if(b.y > _mbGeo.H+50) b.alive=false;
  });
  _mbCollideBalls();
}

function _mbCollideWall(b) {
  _mbSegs.forEach(s=>{
    const dx=s.x2-s.x1, dy=s.y2-s.y1, l2=dx*dx+dy*dy; if(l2<1) return;
    const t=Math.max(0,Math.min(1,((b.x-s.x1)*dx+(b.y-s.y1)*dy)/l2));
    const cx=s.x1+t*dx, cy=s.y1+t*dy, ex=b.x-cx, ey=b.y-cy, d=Math.hypot(ex,ey);
    if(d<b.r){
      const nx=ex/d, ny=ey/d; b.x=cx+nx*b.r; b.y=cy+ny*b.r;
      const dot=b.vx*nx+b.vy*ny; if(dot<0){ b.vx-=(1+_MB_RWL)*dot*nx; b.vy-=(1+_MB_RWL)*dot*ny; }
    }
  });
}

function _mbCollidePegs(b) {
  _mbPegs.forEach(p=>{
    const dx=b.x-p.x, dy=b.y-p.y, d=Math.hypot(dx,dy), r2=b.r+p.r;
    if(d<r2){
      const nx=dx/d, ny=dy/d; b.x=p.x+nx*r2; b.y=p.y+ny*r2;
      const dot=b.vx*nx+b.vy*ny; if(dot<0){ const rp=p.bumper?1.8:_MB_RPG; b.vx-=(1+rp)*dot*nx; b.vy-=(1+rp)*dot*ny; p.flash=1; }
    }
  });
}

function _mbCollideStick(b, st) {
  const cos=Math.cos(st.angle), sin=Math.sin(st.angle);
  const x1=st.cx-cos*st.len, y1=st.cy-sin*st.len, x2=st.cx+cos*st.len, y2=st.cy+sin*st.len;
  const dx=x2-x1, dy=y2-y1, l2=dx*dx+dy*dy; if(l2<1) return;
  const t=Math.max(0,Math.min(1,((b.x-x1)*dx+(b.y-y1)*dy)/l2));
  const cx=x1+t*dx, cy=y1+t*dy, ex=b.x-cx, ey=b.y-cy, d=Math.hypot(ex,ey), r2=b.r+st.thick;
  if(d<r2){
    const nx=ex/d, ny=ey/d; b.x=cx+nx*r2; b.y=cy+ny*r2;
    const rvx=b.vx-(-st.omega*(cy-st.cy)), rvy=b.vy-(st.omega*(cx-st.cx));
    const dot=rvx*nx+rvy*ny; if(dot<0){ b.vx-=(1+_MB_RST)*dot*nx; b.vy-=(1+_MB_RST)*dot*ny; }
  }
}

function _mbCollideBooster(b, bo) {
  if(Math.hypot(b.x-bo.cx, b.y-bo.cy) < b.r+bo.len/2){
    const cos=Math.cos(bo.angle), sin=Math.sin(bo.angle);
    b.vx+=cos*bo.power*0.1; b.vy+=sin*bo.power*0.1; bo.flash=1;
  }
}

function _mbCollideBalls() {
  for(let i=0;i<_mbBalls.length;i++){
    for(let j=i+1;j<_mbBalls.length;j++){
      const a=_mbBalls[i], b=_mbBalls[j]; if(!a.alive && !b.alive) continue;
      const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy), r2=a.r+b.r;
      if(d<r2){
        const nx=dx/d, ny=dy/d;
        if(a.alive && b.alive){
          const p=(r2-d)/2; a.x-=nx*p; a.y-=ny*p; b.x+=nx*p; b.y+=ny*p;
          const dvx=a.vx-b.vx, dvy=a.vy-b.vy, dot=dvx*nx+dvy*ny;
          if(dot>0){ const imp=dot*(1+_MB_RBB)/2; a.vx-=imp*nx; a.vy-=imp*ny; b.vx+=imp*nx; b.vy+=imp*ny; }
        } else if(a.alive){ a.x-=nx*(r2-d); a.y-=ny*(r2-d); const dot=a.vx*nx+a.vy*ny; if(dot<0){ a.vx-=(1+_MB_RBB)*dot*nx; a.vy-=(1+_MB_RBB)*dot*ny; } }
        else { b.x+=nx*(r2-d); b.y+=ny*(r2-d); const dot=b.vx*nx+b.vy*ny; if(dot>0){ b.vx-=(1+_MB_RBB)*dot*nx; b.vy-=(1+_MB_RBB)*dot*ny; } }
      }
    }
  }
}

function _mbDrawIdle(cv) { _mbDrawFrame(cv); }
function _mbDrawFrame(cv) {
  const ctx=cv.getContext('2d'); const {W,H}=_mbGeo;
  ctx.fillStyle='#06061A'; ctx.fillRect(0,0,W,H);
  _mbSegs.forEach(s=>{ ctx.strokeStyle='#00E5FF'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke(); });
  _mbPegs.forEach(p=>{ ctx.fillStyle=p.flash>0?'#fff':'#FF2D78'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); if(p.flash>0) p.flash-=0.05; });
  _mbSticks.forEach(st=>{ ctx.strokeStyle='#BD93F9'; ctx.lineWidth=st.thick*2; const c=Math.cos(st.angle), s=Math.sin(st.angle); ctx.beginPath(); ctx.moveTo(st.cx-c*st.len,st.cy-s*st.len); ctx.lineTo(st.cx+c*st.len,st.cy+s*st.len); ctx.stroke(); });
  _mbBoosters.forEach(bo=>{ ctx.strokeStyle=bo.flash>0?'#fff':'#00FF88'; ctx.lineWidth=4; const c=Math.cos(bo.angle), s=Math.sin(bo.angle); ctx.beginPath(); ctx.moveTo(bo.cx-c*bo.len/2,bo.cy-s*bo.len/2); ctx.lineTo(bo.cx+c*bo.len/2,bo.cy+s*bo.len/2); ctx.stroke(); if(bo.flash>0) bo.flash-=0.05; });
  _mbBlackholes.forEach(bh=>{ ctx.strokeStyle='rgba(139,92,246,0.3)'; ctx.beginPath(); ctx.arc(bh.cx,bh.cy,bh.r,0,Math.PI*2); ctx.stroke(); });
  _mbBalls.forEach(b=>{ if(!b.alive && !b.settled) return; ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.font='8px sans-serif'; ctx.textAlign='center'; ctx.fillText(b.short,b.x,b.y+3); });
}

function _mbStartIdleAnim(cv) {
  if(_mbIdleAnimId) cancelAnimationFrame(_mbIdleAnimId);
  const loop=()=>{ if(_mbRunning) return; _mbTick++; _mbSticks.forEach(st=>st.angle+=st.omega*0.5); _mbDrawIdle(cv); _mbIdleAnimId=requestAnimationFrame(loop); };
  _mbIdleAnimId=requestAnimationFrame(loop);
}

function _mbShowWinner(cv) {
  const card=document.getElementById('mb-result-card'); if(!card) return;
  card.innerHTML=`<div style="background:rgba(0,0,0,0.8);padding:20px;border-radius:15px;border:2px solid #00E5FF;margin-top:10px">
    <div style="color:#00E5FF;font-size:12px">WINNER</div>
    <div style="color:#fff;font-size:24px;font-weight:900">${_mbWinner.name}</div>
    <button onclick="_mbStart()" class="mb-btn" style="margin-top:10px;padding:8px 20px;font-size:14px">다시 굴리기</button>
  </div>`;
  card.style.display='block'; document.getElementById('mb-btn').disabled=false;
  const now=new Date(); const time=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  _mbHistory.unshift({name:_mbWinner.name, color:_mbWinner.color, time});
  if(_mbHistory.length>10) _mbHistory.pop();
  localStorage.setItem('su_mb_hist', JSON.stringify(_mbHistory));
  _mbRefreshHist();
}

function _mbHistHTML() {
  if(!_mbHistory.length) return '';
  return `<div class="mb-hist-box" style="margin-top:10px;width:100%;max-width:480px">
    <div style="display:flex;justify-content:space-between;color:#00E5FF;font-size:13px;margin-bottom:5px"><span>📋 기록</span><button onclick="_mbClearHistory()" style="background:none;border:none;color:#666;cursor:pointer">지우기</button></div>
    ${_mbHistory.map(h=>`<div class="mb-hist-item" style="display:flex;gap:10px;font-size:12px;color:#ccc"><span style="color:${h.color}">●</span><span>${h.name}</span><span style="margin-left:auto;color:#666">${h.time}</span></div>`).join('')}
  </div>`;
}
function _mbRefreshHist() { const root=document.getElementById('mb-root'); if(root) _mbRender(root); }
function _mbClearHistory() { _mbHistory=[]; localStorage.removeItem('su_mb_hist'); _mbRefreshHist(); }

// ─── 🗺️ 맵 에디터 ─────────────────────────────────────────────────────────────
let _mbEdTool='peg', _mbEdDrawing=false, _mbEdDragSt=null, _mbEdSc=1, _mbEdGW=480, _mbEdGH=1440;
let _mbEdCurrentMapIndex = 0;

function _mbOpenEditor() {
  _mbEdCurrentMapIndex = _mbCurrentMapIndex >= 0 ? _mbCurrentMapIndex : 0;
  const map = _mbMaps[_mbEdCurrentMapIndex];
  const modal = document.createElement('div');
  modal.id='mb-editor-modal'; modal.className='modal';
  modal.innerHTML=`<div class="modal-inner" style="max-width:500px;background:#0a0618;color:#fff;padding:20px;border-radius:20px;border:1px solid #7B2FFF">
    <div style="display:flex;justify-content:space-between;margin-bottom:15px">
      <input id="mb-ed-name" value="${map.name}" style="background:none;border:none;color:#BD93F9;font-size:18px;font-weight:900;width:70%">
      <button onclick="cm('mb-editor-modal')" style="background:none;border:none;color:#666;font-size:20px;cursor:pointer">✕</button>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:10px">
      <select id="mb-ed-map-sel" onchange="_mbEdSwitchMap(this.value)" style="flex:1;padding:5px">${_mbMaps.map((m,i)=>`<option value="${i}" ${i===_mbEdCurrentMapIndex?'selected':''}>${m.name}</option>`).join('')}</select>
      <button onclick="_mbEdNewMap()" class="btn" style="font-size:11px">➕ 새 맵</button>
      <button onclick="_mbEdDelMap()" class="btn" style="font-size:11px;border-color:#ff4b6e;color:#ff4b6e">🗑️ 삭제</button>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;background:rgba(255,255,255,0.05);padding:8px;border-radius:8px">
      <span style="font-size:12px;color:#aaa">📐 세로 길이</span>
      <input type="range" id="mb-ed-height" min="1.5" max="8.0" step="0.1" value="${map.heightMul || 3.0}" style="flex:1" oninput="document.getElementById('mb-ed-hval').textContent=this.value+'x'">
      <span id="mb-ed-hval" style="font-size:12px;color:#BD93F9;min-width:30px">${(map.heightMul || 3.0).toFixed(1)}x</span>
    </div>
    <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap">
      ${['peg','bumper','booster','bh','wall','stick','spinner','erase'].map(t=>`<button id="mb-ed-t-${t}" onclick="_mbEdSetTool('${t}')" style="padding:5px 10px;font-size:11px;border-radius:5px;border:1px solid #444;background:#222;color:#888;cursor:pointer">${t}</button>`).join('')}
    </div>
    <div style="overflow:auto;max-height:50vh;border:1px solid #333;border-radius:10px">
      <canvas id="mb-ed-canvas" style="display:block;cursor:crosshair"></canvas>
    </div>
    <div style="display:flex;gap:10px;margin-top:15px">
      <button onclick="_mbEdResetDefaults()" class="btn" style="flex:1;font-size:11px">🔄 기본값 복원</button>
      <button onclick="_mbEditorSave()" class="btn" style="flex:2;background:#7B2FFF;color:#fff;border:none">💾 저장하고 적용</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  _mbEdSetTool('peg'); _mbEdInit(); om('mb-editor-modal');
}

function _mbEdSwitchMap(i) { _mbEdCurrentMapIndex=parseInt(i); cm('mb-editor-modal'); _mbOpenEditor(); }
function _mbEdNewMap() { _mbMaps.push({name:'새 맵 '+(_mbMaps.length+1), heightMul:3, pegsR:[], sticksR:[], segsR:[], boostersR:[], bhR:[], convR:[]}); _mbEdSwitchMap(_mbMaps.length-1); }
function _mbEdDelMap() { if(_mbMaps.length<=1) return alert('최소 하나의 맵은 있어야 합니다.'); if(confirm('이 맵을 삭제할까요?')){ _mbMaps.splice(_mbEdCurrentMapIndex,1); _mbEdSwitchMap(0); } }
function _mbEdResetDefaults() { if(confirm('모든 맵을 초기 기본값으로 되돌릴까요?')){ _mbMaps=_mbGetDefaultMaps(); localStorage.setItem('su_mb_maps',JSON.stringify(_mbMaps)); _mbEdSwitchMap(0); } }

function _mbEdInit() {
  const cv=document.getElementById('mb-ed-canvas'); if(!cv) return;
  const map=_mbMaps[_mbEdCurrentMapIndex];
  const avW=Math.min(window.innerWidth-60, 440); _mbEdSc=avW/480; _mbEdGW=480; _mbEdGH=480*map.heightMul;
  cv.width=avW; cv.height=480*map.heightMul*_mbEdSc;
  cv.onmousedown=e=>{ _mbEdDrawing=true; _mbEdDragSt=_mbEdPos(e); if(_mbEdTool==='peg'||_mbEdTool==='bumper'||_mbEdTool==='bh'||_mbEdTool==='erase') _mbEdApply(e); };
  cv.onmousemove=e=>{ if(_mbEdDrawing) _mbEdDraw(); };
  cv.onmouseup=e=>{ if(_mbEdDrawing){ _mbEdApply(e); _mbEdDrawing=false; _mbEdDragSt=null; _mbEdDraw(); } };
  _mbEdDraw();
}

function _mbEdPos(e) { const r=e.target.getBoundingClientRect(); return {x:(e.clientX-r.left)*(e.target.width/r.width), y:(e.clientY-r.top)*(e.target.height/r.height)}; }

function _mbEdApply(e) {
  const pos=_mbEdPos(e); const map=_mbMaps[_mbEdCurrentMapIndex]; const W=_mbEdGW, H=_mbEdGH, sc=_mbEdSc;
  const xr=pos.x/(W*sc), yr=pos.y/(H*sc);
  if(_mbEdTool==='erase'){
    const d=(xr2,yr2)=>Math.hypot(xr2-xr,yr2-yr);
    map.pegsR=map.pegsR.filter(p=>d(p.xr,p.yr)>0.03);
    map.sticksR=map.sticksR.filter(s=>d(s.cxr,s.cyr)>0.04);
    map.boostersR=map.boostersR.filter(b=>d(b.cxr,b.cyr)>0.04);
    map.bhR=map.bhR.filter(bh=>d(bh.cxr,bh.cyr)>0.04);
    map.segsR=map.segsR.filter(s=>d((s.x1r+s.x2r)/2,(s.y1r+s.y2r)/2)>0.04);
  } else if(_mbEdTool==='peg'||_mbEdTool==='bumper'){
    map.pegsR.push({xr, yr, rr:7.2/W, bumper:_mbEdTool==='bumper'});
  } else if(_mbEdTool==='bh'){
    map.bhR.push({cxr:xr, cyr:yr, rr:20/W});
  } else if(_mbEdDragSt) {
    const dx=pos.x-_mbEdDragSt.x, dy=pos.y-_mbEdDragSt.y, d=Math.hypot(dx,dy); if(d<5) return;
    const x1r=_mbEdDragSt.x/(W*sc), y1r=_mbEdDragSt.y/(H*sc);
    if(_mbEdTool==='wall') map.segsR.push({x1r, y1r, x2r:xr, y2r:yr});
    else if(_mbEdTool==='stick'||_mbEdTool==='spinner') map.sticksR.push({cxr:(x1r+xr)/2, cyr:(y1r+yr)/2, lenr:d/2/(W*sc), angle:Math.atan2(dy,dx), omega:_mbEdTool==='spinner'?0.12:0.04, thick:3, spinner:_mbEdTool==='spinner'});
    else if(_mbEdTool==='booster') map.boostersR.push({cxr:(x1r+xr)/2, cyr:(y1r+yr)/2, lenr:d/(W*sc), angle:Math.atan2(dy,dx), power:15});
  }
}

function _mbEdSetTool(t) {
  _mbEdTool=t; document.querySelectorAll('[id^="mb-ed-t-"]').forEach(b=>{
    const on=b.id==='mb-ed-t-'+t; b.style.background=on?'#7B2FFF':'#222'; b.style.color=on?'#fff':'#888';
  });
}

function _mbEdDraw() {
  const cv=document.getElementById('mb-ed-canvas'); if(!cv) return;
  const ctx=cv.getContext('2d'); const map=_mbMaps[_mbEdCurrentMapIndex]; const sc=_mbEdSc, W=_mbEdGW, H=_mbEdGH;
  ctx.fillStyle='#06061A'; ctx.fillRect(0,0,cv.width,cv.height);
  (map.pegsR||[]).forEach(p=>{ ctx.fillStyle=p.bumper?'#FF6B00':'#FF2D78'; ctx.beginPath(); ctx.arc(p.xr*W*sc,p.yr*H*sc,p.rr*W*sc,0,Math.PI*2); ctx.fill(); });
  (map.segsR||[]).forEach(s=>{ ctx.strokeStyle='#00E5FF'; ctx.beginPath(); ctx.moveTo(s.x1r*W*sc,s.y1r*H*sc); ctx.lineTo(s.x2r*W*sc,s.y2r*H*sc); ctx.stroke(); });
  (map.sticksR||[]).forEach(s=>{ ctx.strokeStyle=s.spinner?'#FFD700':'#BD93F9'; ctx.lineWidth=2; const c=Math.cos(s.angle), si=Math.sin(s.angle), l=s.lenr*W*sc; ctx.beginPath(); ctx.moveTo(s.cxr*W*sc-c*l,s.cyr*H*sc-si*l); ctx.lineTo(s.cxr*W*sc+c*l,s.cyr*H*sc+si*l); ctx.stroke(); });
  (map.boostersR||[]).forEach(b=>{ ctx.strokeStyle='#00FF88'; const c=Math.cos(b.angle), si=Math.sin(b.angle), l=b.lenr*W*sc/2; ctx.beginPath(); ctx.moveTo(b.cxr*W*sc-c*l,b.cyr*H*sc-si*l); ctx.lineTo(b.cxr*W*sc+c*l,b.cyr*H*sc+si*l); ctx.stroke(); });
  (map.bhR||[]).forEach(bh=>{ ctx.strokeStyle='#8B5CF6'; ctx.beginPath(); ctx.arc(bh.cxr*W*sc,bh.cyr*H*sc,bh.rr*W*sc,0,Math.PI*2); ctx.stroke(); });
}

function _mbEditorSave() {
  const map = _mbMaps[_mbEdCurrentMapIndex];
  map.name = document.getElementById('mb-ed-name').value;
  map.heightMul = parseFloat(document.getElementById('mb-ed-height').value);
  localStorage.setItem('su_mb_maps', JSON.stringify(_mbMaps));
  cm('mb-editor-modal');
  _mbInit();
}

_mbInit();
