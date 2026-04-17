// ─── 🔮 마블 물리 룰렛 v4 (리팩토링 및 기능 개선) ───────────────────────────

(function _mbInjectCSS() {
  if (document.getElementById('mb-style-v4')) return;
  const s = document.createElement('style');
  s.id = 'mb-style-v4';
  s.textContent = `
    #mb-root { font-family: inherit; width: 100%; }
    .mb-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
    .mb-canvas-wrap { position: relative; width: 100%; display: flex; justify-content: center; }
    #mb-canvas { border-radius: 18px; display: block; box-shadow: 0 0 40px rgba(0,200,255,0.22), 0 0 80px rgba(120,40,255,0.12), 0 8px 32px rgba(0,0,0,.5); border: 1px solid rgba(0,229,255,0.2); }
    .mb-btn { font-size: clamp(15px, 2vw, 20px); font-weight: 900; color: #fff; background: linear-gradient(135deg, #7B2FFF, #00BFFF); border: none; border-radius: 30px; padding: 11px 40px; cursor: pointer; box-shadow: 0 5px 0 #4a1fa8, 0 0 24px rgba(0,180,255,0.35); transition: transform .12s, box-shadow .12s; font-family: inherit; letter-spacing: .3px; }
    .mb-btn:hover { transform: translateY(-2px); box-shadow: 0 7px 0 #4a1fa8, 0 0 36px rgba(0,200,255,0.5); }
    .mb-btn:active { transform: translateY(3px); box-shadow: 0 2px 0 #4a1fa8, 0 0 16px rgba(0,180,255,0.3); }
    .mb-btn:disabled { background: linear-gradient(135deg, #444, #333); box-shadow: 0 4px 0 #222; cursor: not-allowed; transform: none; }
    .mb-hist-box { width: 100%; max-width: 480px; background: rgba(10,6,30,0.85); border: 1.5px solid rgba(0,229,255,0.25); border-radius: 14px; padding: 12px 14px; backdrop-filter: blur(8px); }
    .mb-hist-item { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .mb-hist-item:last-child { border-bottom: none; }
    @keyframes mbCardAppear { 0%{opacity:0;transform:scale(0.7) translateY(20px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes mbParticle { 0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) scale(0) rotate(var(--rot));opacity:0} }
  `;
  document.head.appendChild(s);
})();

// ─── 상수 ───────────────────────────────────────────────────────────────────
const _MB_COLORS = ['#FF2D78','#FF6B00','#FFDD00','#00FF88','#00E5FF','#BD93F9','#FF79C6','#50FA7B','#8B5CF6','#FFB86C','#8BE9FD','#FF5555','#F1FA8C','#44B8FF','#FF6BCB','#00FFC8'];
const _MB_PHYSICS = { G: 0.22, D: 0.998, R_BALL: 0.45, R_PEG: 0.65, R_WALL: 0.40, R_STICK: 0.75, V_CAP: 20 };

// ─── 상태 변수 ──────────────────────────────────────────────────────────────
let _mbBalls = [], _mbSegs = [], _mbPegs = [], _mbSticks = [], _mbBoosters = [], _mbBlackholes = [], _mbConveyors = [];
let _mbGeo = {}, _mbRunning = false, _mbAnimId = null, _mbTick = 0;
let _mbWinner = null, _mbHistory = [];
let _mbMaps = [], _mbCurrentMapIndex = -1;
let _mbEd = { tool: 'select', drawing: false, dragStart: null, scale: 1, gameW: 480, gameH: 1440, selectedItem: null, testRunning: false, testBalls: [] };

// ─── 초기화 및 데이터 관리 ──────────────────────────────────────────────────
function _mbGetDefaultMaps() {
  const W = 480, H = 1440, pR = 7.2, funnelTop = H * 0.7, topY = 12, padX = 18;
  const maps = [
    { name: '🎯 핀볼', heightMul: 3.0, pegsR: [], sticksR: [], segsR: [], boostersR: [], bhR: [], convR: [] },
    { name: '⚡ 지그재그', heightMul: 3.2, pegsR: [], sticksR: [], segsR: [], boostersR: [], bhR: [], convR: [] },
    { name: '🌀 카오스', heightMul: 3.5, pegsR: [], sticksR: [], segsR: [], boostersR: [], bhR: [], convR: [] }
  ];
  for(let r=0;r<15;r++){ let even=r%2===0,c=even?7:6,s=(W-padX*2-pR*4)/6,y=(funnelTop-topY-100)/14; for(let o=0;o<c;o++){ let x=padX+pR*2+o*s+(even?0:s/2); if(x>padX+10&&x<W-padX-10)maps[0].pegsR.push({xr:x/W,yr:(topY+70+r*y)/H,rr:pR/W}); } }
  return maps;
}

function _mbInit() {
  try {
    const saved = localStorage.getItem('su_mb_maps_v2');
    _mbMaps = saved ? JSON.parse(saved) : _mbGetDefaultMaps();
    if (!_mbMaps.length) _mbMaps = _mbGetDefaultMaps();
  } catch (e) { _mbMaps = _mbGetDefaultMaps(); }
  try { _mbHistory = JSON.parse(localStorage.getItem('su_mb_hist') || '[]'); } catch (e) { _mbHistory = []; }
  const root = document.getElementById('mb-root');
  if (root) _mbRenderUI(root);
}

// ─── UI 렌더링 ──────────────────────────────────────────────────────────────
function _mbRenderUI(root) {
  const savedInput = localStorage.getItem('su_mb_input') || '';
  const savedMapSel = localStorage.getItem('su_mb_map_sel') || '-1';
  _mbCurrentMapIndex = parseInt(savedMapSel);

  root.innerHTML = `
    <div class="mb-wrap">
      <div style="width:100%;max-width:480px;display:flex;gap:8px;align-items:stretch">
        <textarea id="mb-input" style="flex:1;min-width:0;border:2px solid var(--border);border-radius:10px;padding:8px 12px;font-size:14px;font-family:inherit;resize:none;height:68px;color:var(--text1);background:var(--white);line-height:1.6;outline:none;box-sizing:border-box" placeholder="이름 입력... (쉼표 또는 줄바꿈으로 구분)" oninput="localStorage.setItem('su_mb_input',this.value)">${savedInput}</textarea>
        <div style="display:flex;flex-direction:column;gap:4px">
          <button onclick="_mbShuffleInput()" style="flex:1;padding:0 10px;font-size:12px;border:1px solid var(--border2);background:var(--white);color:var(--text2);border-radius:8px;cursor:pointer">🔀 섞기</button>
          <button onclick="_mbOpenEditor()" style="flex:1;padding:0 10px;font-size:12px;border:1px solid #7B2FFF;background:rgba(123,47,255,0.1);color:#BD93F9;border-radius:8px;cursor:pointer">🗺️ 맵 관리</button>
        </div>
      </div>
      <div style="width:100%;max-width:480px;display:flex;align-items:center;gap:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">🗺️ 맵 선택</label>
        <select id="mb-map-sel" onchange="_mbOnMapSel(this.value)" style="flex:1;border:1.5px solid var(--border2);border-radius:8px;padding:5px 8px;font-size:13px;background:var(--white);color:var(--text1)">
          <option value="-1">🎲 랜덤</option>
          ${_mbMaps.map((m, i) => `<option value="${i}" ${i === _mbCurrentMapIndex ? 'selected' : ''}>${m.name}</option>`).join('')}
        </select>
      </div>
      <div class="mb-canvas-wrap"><canvas id="mb-canvas"></canvas></div>
      <button class="mb-btn" id="mb-btn" onclick="_mbStart()">🔮 굴려라!</button>
      <div id="mb-result-card" style="display:none;animation:mbCardAppear .4s ease-out forwards"></div>
      <div id="mb-hist-root">${_mbHistHTML()}</div>
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
  if (!inp) return;
  let names = inp.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  for (let i = names.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [names[i], names[j]] = [names[j], names[i]]; }
  inp.value = names.join(', ');
  localStorage.setItem('su_mb_input', inp.value);
}

function _mbSetupCanvas() {
  const cv = document.getElementById('mb-canvas');
  if (!cv) return;
  const avW = Math.min(window.innerWidth - 40, 480);
  const map = _mbCurrentMapIndex >= 0 ? _mbMaps[_mbCurrentMapIndex] : null;
  const hm = map ? (map.heightMul || 3.0) : 3.0;
  cv.width = avW; cv.height = Math.round(avW * hm);
  cv.style.width = avW + 'px'; cv.style.height = cv.height + 'px';
  _mbBuildWorld(cv.width, cv.height);
  _mbDrawIdle(cv);
}

// ... (rest of the new, refactored code for physics, game logic, and the new editor)

_mbInit();
