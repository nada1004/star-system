// ─── 가챠 룰렛 시스템 ─────────────────────────────────────────────────────
function rRoulette(C, T) {
  T.textContent = '🎰 룰렛';
  // 화면 크기 기반으로 머신 사이즈 계산
  const avW = window.innerWidth;
  const avH = window.innerHeight - 130;
  const isWide = avW >= 700;
  // 돔 크기: 화면 높이의 45% or 너비의 30% 중 작은 것, min 190 max 340
  const _dome = Math.max(190, Math.min(340, Math.round(isWide ? Math.min(avH * 0.48, avW * 0.28) : Math.min(avH * 0.38, avW * 0.7))));
  const _capR = Math.round(_dome * 0.076);
  // 전역에 반영
  window._GC_DOME = _dome;
  window._GC_CAP_R = _capR;
  C.innerHTML = renderRoulettePanel(_dome, _capR, isWide, avW, avH);
  setTimeout(_gcSetup, 60);
}

(function _gcInjectCSS(){
  if (document.getElementById('gc-style')) return;
  const s = document.createElement('style');
  s.id = 'gc-style';
  s.textContent = '@keyframes gcConfettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(100vh) rotate(800deg) scale(0.4);opacity:0}}'
    + '@keyframes gcBounceIcon{0%{transform:scale(0) rotate(-20deg)}60%{transform:scale(1.3) rotate(10deg)}80%{transform:scale(0.9) rotate(-5deg)}100%{transform:scale(1) rotate(0deg)}}'
    + '@keyframes gcCardAppear{0%{transform:scale(0.75) translateY(10px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}';
  document.head.appendChild(s);
})();

let _gcTab = 'player';
let _gcSpinning = false;
let _gcSpeedMult = 1;
let _gcCapsules = [];
let _gcAnimId = null;
let _gcTotalRot = 0;
let _gcAudioCtx = null;
window._GC_DOME = 220;
window._GC_CAP_R = 17;

const _GC_COLORS = [
  ['#FF80AB','#FF4081'],['#81D4FA','#29B6F6'],['#FFF176','#FFD600'],
  ['#B9F6CA','#00E676'],['#CE93D8','#AB47BC'],['#FFCC80','#FFA726'],
  ['#F48FB1','#EC407A'],['#80DEEA','#00BCD4'],['#FFAB91','#FF5722'],
];

function _gcFindPlayer(keyword) {
  if (typeof players === 'undefined') return null;
  return players.find(x => x.name === keyword)
    || players.find(x => x.name.includes(keyword))
    || players.find(x => keyword.includes(x.name));
}

function renderRoulettePanel(dome, capR, isWide, avW, avH) {
  dome  = dome  || window._GC_DOME;
  capR  = capR  || window._GC_CAP_R;
  isWide = isWide != null ? isWide : (window.innerWidth >= 700);
  avW   = avW   || window.innerWidth;
  avH   = avH   || window.innerHeight - 130;

  const isPlayer = _gcTab === 'player';
  const savedText = localStorage.getItem(isPlayer ? 'su_gc_p' : 'su_gc_m') || '';
  const activeItems = savedText.split(',').map(v=>v.trim()).filter(v=>v);

  // 폰트/패딩 스케일
  const fs = Math.max(13, Math.round(dome * 0.075));   // 기본 폰트
  const fsLg = Math.max(16, Math.round(dome * 0.095)); // 큰 폰트
  const pad = Math.max(14, Math.round(dome * 0.085));

  const mapBadges = !isPlayer ? (maps||[]).map(m => {
    const active = activeItems.includes(m);
    return `<span onclick="_gcToggleMap('${m.replace(/'/g,"\\'").replace(/"/g,'\\"')}',this)" data-map="${m.replace(/"/g,'&quot;')}"
      style="cursor:pointer;padding:5px 12px;border-radius:14px;font-size:${fs}px;font-weight:700;border:2px solid ${active?'#FF4B6E':'var(--border)'};background:${active?'#FFF0F3':'var(--surface)'};color:${active?'#FF4B6E':'var(--text2)'};transition:.1s;user-select:none">${m}</span>`;
  }).join('') : '';

  // 머신 치수
  const bodyW   = dome + Math.round(dome * 0.11);
  const ringW   = dome - Math.round(dome * 0.11);
  const ringH   = Math.round(dome * 0.105);
  const crankSz = Math.round(dome * 0.42);
  const exitW   = Math.round(dome * 0.38);
  const exitH   = Math.round(dome * 0.25);
  const exitCapSz = Math.round(dome * 0.25);
  const trayW   = Math.round(dome * 0.5);
  const trayH   = Math.round(dome * 0.083);

  // 결과 카드 아이콘 크기
  const resIconSz = Math.round(dome * 0.36);
  const resTextSz = Math.max(20, Math.round(dome * 0.135));

  // 좌우 레이아웃 vs 상하 레이아웃
  const inputW = isWide ? Math.min(360, Math.round(avW * 0.38)) : '100%';
  const containerStyle = isWide
    ? `display:flex;gap:${pad*2}px;align-items:flex-start;justify-content:center;padding:${pad}px;max-width:${avW-32}px;margin:0 auto`
    : `display:flex;flex-direction:column;align-items:center;padding:${pad}px;max-width:${Math.min(avW-16, dome+80)}px;margin:0 auto`;

  const inputColStyle = isWide
    ? `width:${inputW}px;flex-shrink:0`
    : `width:100%`;

  return `<div style="${containerStyle}">
  <!-- 왼쪽: 입력 영역 -->
  <div style="${inputColStyle}">
    <!-- 탭 -->
    <div style="display:flex;border:2px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:${pad}px">
      <button onclick="_gcSwitchTab('player')" style="flex:1;padding:${Math.round(pad*0.8)}px;font-size:${fsLg}px;font-weight:700;border:none;background:${isPlayer?'#FFF0F3':'var(--surface)'};color:${isPlayer?'#FF4B6E':'var(--text2)'};cursor:pointer;border-right:2px solid var(--border);transition:.1s">🎰 선수뽑기</button>
      <button onclick="_gcSwitchTab('map')" style="flex:1;padding:${Math.round(pad*0.8)}px;font-size:${fsLg}px;font-weight:700;border:none;background:${!isPlayer?'#FFF0F3':'var(--surface)'};color:${!isPlayer?'#FF4B6E':'var(--text2)'};cursor:pointer;transition:.1s">🗺️ 맵뽑기</button>
    </div>
    <!-- 입력창 -->
    <div style="background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-bottom:${pad}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">${isPlayer?'선수 이름 (쉼표 구분, 부분 입력 가능)':'맵 이름 (쉼표 구분)'}</div>
      <textarea id="gc-items-input" rows="3" oninput="_gcSaveText(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:10px;padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box">${savedText}</textarea>
      <button onclick="_gcClearItems()" style="margin-top:10px;font-size:${fs}px;padding:6px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer;font-weight:600">지우기</button>
    </div>
    ${!isPlayer && mapBadges ? `
    <div style="background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-bottom:${pad}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:10px">📋 등록된 맵 (클릭해서 추가)</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${mapBadges}</div>
    </div>` : ''}
    <!-- 결과 카드 -->
    <div id="gc-result-card" style="display:none;background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:2.5px solid #FF89AB;border-radius:16px;padding:${pad*1.2}px;text-align:center;animation:gcCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)">
      <div style="font-size:${fs}px;font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:10px">🎊 당첨!</div>
      <div id="gc-pop-icon" style="font-size:${resIconSz}px;display:block;margin-bottom:8px;line-height:1.1"></div>
      <div id="gc-res-text" style="font-size:${resTextSz}px;font-weight:900;color:#C0274A;margin-bottom:16px;word-break:keep-all"></div>
      <button onclick="_gcReset()" style="background:linear-gradient(135deg,#FF4B6E,#FF89AB);color:white;border:none;border-radius:14px;padding:${Math.round(pad*0.7)}px ${pad*1.5}px;font-size:${fsLg}px;font-weight:700;cursor:pointer;box-shadow:0 4px 0 #C0274A"
        onmousedown="this.style.transform='translateY(3px)';this.style.boxShadow='0 1px 0 #C0274A'"
        onmouseup="this.style.transform='';this.style.boxShadow='0 4px 0 #C0274A'">🎰 다시 뽑기!</button>
    </div>
  </div>

  <!-- 오른쪽: 가챠 머신 -->
  <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;${isWide?'':'margin-top:'+pad+'px'}">
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 8px 22px rgba(255,75,110,0.35))">
      <!-- 돔 -->
      <div style="position:relative;width:${dome}px;height:${dome}px">
        <div id="gc-dome" style="width:${dome}px;height:${dome}px;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.52),rgba(255,200,220,0.2) 55%,rgba(255,150,180,0.08));border:${Math.round(dome*0.042)}px solid white;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 ${Math.round(dome*0.21)}px rgba(255,255,255,0.5),0 ${Math.round(dome*0.035)}px ${Math.round(dome*0.12)}px rgba(200,60,90,0.22),0 0 0 ${Math.round(dome*0.024)}px #FFD6E4;position:relative"></div>
        <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse at 28% 22%,rgba(255,255,255,0.55) 0%,transparent 55%);pointer-events:none"></div>
      </div>
      <!-- 링 -->
      <div style="width:${ringW}px;height:${ringH}px;background:linear-gradient(180deg,#fff 0%,#f8bbd0 60%,#f48fb1 100%);border-radius:0 0 ${Math.round(ringH*0.6)}px ${Math.round(ringH*0.6)}px;margin-top:${-Math.round(ringH*0.5)}px;position:relative;z-index:2;box-shadow:0 ${Math.round(ringH*0.22)}px 0 #FF4B6E"></div>
      <!-- 바디 -->
      <div style="width:${bodyW}px;background:linear-gradient(180deg,#FF4B6E 0%,#e53935 100%);margin-top:${-Math.round(dome*0.04)}px;border-radius:${Math.round(dome*0.08)}px ${Math.round(dome*0.08)}px ${Math.round(dome*0.22)}px ${Math.round(dome*0.22)}px;position:relative;z-index:1;box-shadow:0 ${Math.round(dome*0.042)}px 0 #C0274A;padding:${Math.round(dome*0.06)}px ${Math.round(dome*0.095)}px ${Math.round(dome*0.12)}px;display:flex;flex-direction:column;align-items:center;gap:${Math.round(dome*0.047)}px">
        <!-- 크랭크 -->
        <div id="gc-crank" onclick="_gcSpin()" title="클릭해서 뽑기!"
          style="width:${crankSz}px;height:${crankSz}px;background:radial-gradient(circle at 35% 28%,#ffffff,#d8d8d8);border:${Math.round(crankSz*0.083)}px solid #c8c8c8;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 ${Math.round(crankSz*0.083)}px 0 #aaa;transition:transform 0.8s cubic-bezier(0.4,0,0.2,1);user-select:none;position:relative;overflow:hidden">
          <div style="width:${Math.round(crankSz*0.69)}px;height:${Math.round(crankSz*0.19)}px;background:linear-gradient(180deg,#ccc,#999);border-radius:${Math.round(crankSz*0.12)}px;box-shadow:0 ${Math.round(crankSz*0.042)}px 0 #888"></div>
        </div>
        <div style="font-size:${Math.round(dome*0.07)}px;color:rgba(255,255,255,0.92);font-weight:700;letter-spacing:.5px">🎰 클릭해서 뽑기!</div>
        <!-- 출구 -->
        <div style="display:flex;flex-direction:column;align-items:center">
          <div style="position:relative;width:${exitW}px;height:${exitH}px;background:linear-gradient(180deg,#1a1a1a,#333);border-radius:${Math.round(exitW*0.12)}px ${Math.round(exitW*0.12)}px 0 0;box-shadow:inset 0 -${Math.round(exitH*0.14)}px ${Math.round(exitH*0.28)}px rgba(0,0,0,0.55)">
            <div id="gc-outcap" style="position:absolute;bottom:${-Math.round(exitCapSz*0.43)}px;left:50%;transform:translateX(-50%) scale(0);width:${exitCapSz}px;height:${exitCapSz}px;border-radius:50%;z-index:10;transition:0.65s cubic-bezier(0.175,0.885,0.32,1.45);border:${Math.round(exitCapSz*0.07)}px solid white;box-shadow:0 ${Math.round(exitCapSz*0.12)}px ${Math.round(exitCapSz*0.33)}px rgba(0,0,0,0.22)"></div>
          </div>
          <div style="width:${trayW}px;height:${trayH}px;background:linear-gradient(180deg,#d32f2f,#b71c1c);border-radius:0 0 ${Math.round(trayW*0.15)}px ${Math.round(trayW*0.15)}px;box-shadow:0 ${Math.round(trayH*0.29)}px 0 rgba(0,0,0,0.2)"></div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function _gcSwitchTab(tab) {
  _gcTab = tab;
  render();
  setTimeout(_gcSetup, 60);
}

function _gcSaveText(val) {
  localStorage.setItem(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m', val);
}

function _gcToggleMap(mapName, el) {
  const inp = document.getElementById('gc-items-input');
  if (!inp) return;
  let items = inp.value.split(',').map(v=>v.trim()).filter(v=>v);
  const idx = items.indexOf(mapName);
  if (idx >= 0) {
    items.splice(idx, 1);
    el.style.background = 'var(--surface)';
    el.style.borderColor = 'var(--border)';
    el.style.color = 'var(--text2)';
  } else {
    items.push(mapName);
    el.style.background = '#FFF0F3';
    el.style.borderColor = '#FF4B6E';
    el.style.color = '#FF4B6E';
  }
  inp.value = items.join(', ');
  _gcSaveText(inp.value);
}

function _gcClearItems() {
  const inp = document.getElementById('gc-items-input');
  if (inp) inp.value = '';
  localStorage.removeItem(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m');
  document.querySelectorAll('[data-map]').forEach(el => {
    el.style.background = 'var(--surface)';
    el.style.borderColor = 'var(--border)';
    el.style.color = 'var(--text2)';
  });
}

function _gcSetup() {
  const dome = document.getElementById('gc-dome');
  if (!dome) return;
  if (_gcAnimId) { cancelAnimationFrame(_gcAnimId); _gcAnimId = null; }
  _gcCapsules = [];
  dome.innerHTML = '';
  const D = window._GC_DOME, R = window._GC_CAP_R;
  const center = D / 2, limit = center - R - 4;
  for (let i = 0; i < 16; i++) {
    const cap = document.createElement('div');
    const [c1,c2] = _GC_COLORS[i % _GC_COLORS.length];
    cap.style.cssText = `position:absolute;width:${R*2}px;height:${R*2}px;border-radius:50%;background:radial-gradient(circle at 32% 28%,${c1},${c2});border:${Math.max(2,Math.round(R*0.15))}px solid rgba(255,255,255,0.75);box-shadow:2px 2px 5px rgba(0,0,0,0.13);will-change:transform`;
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * limit * 0.85;
    _gcCapsules.push({
      el: cap,
      x: center + Math.cos(ang)*r - R,
      y: center + Math.sin(ang)*r - R,
      vx: (Math.random()-.5)*2,
      vy: (Math.random()-.5)*2
    });
    dome.appendChild(cap);
  }
  _gcAnimLoop();
}

function _gcAnimLoop() {
  const dome = document.getElementById('gc-dome');
  if (!dome) { _gcAnimId = null; return; }
  const D = window._GC_DOME, R = window._GC_CAP_R;
  const center = D / 2, limit = center - R - 4;
  _gcCapsules.forEach(cap => {
    cap.x += cap.vx * _gcSpeedMult;
    cap.y += cap.vy * _gcSpeedMult;
    const dx = cap.x + R - center, dy = cap.y + R - center;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > limit) {
      const ang = Math.atan2(dy, dx);
      cap.x = center + Math.cos(ang)*limit - R;
      cap.y = center + Math.sin(ang)*limit - R;
      const nx = Math.cos(ang), ny = Math.sin(ang);
      const dot = cap.vx*nx + cap.vy*ny;
      cap.vx = (cap.vx - 2*dot*nx) + (Math.random()-.5)*.4;
      cap.vy = (cap.vy - 2*dot*ny) + (Math.random()-.5)*.4;
      const spd = Math.sqrt(cap.vx**2 + cap.vy**2);
      if (spd > 7) { cap.vx *= 7/spd; cap.vy *= 7/spd; }
    }
    cap.el.style.transform = `translate(${cap.x}px,${cap.y}px)`;
  });
  _gcAnimId = requestAnimationFrame(_gcAnimLoop);
}

function _gcSpin() {
  if (_gcSpinning) return;
  const inp = document.getElementById('gc-items-input');
  if (!inp) return;
  const items = inp.value.split(',').map(v=>v.trim()).filter(v=>v);
  if (!items.length) { alert('항목을 먼저 입력해주세요!'); return; }

  const card = document.getElementById('gc-result-card');
  if (card) card.style.display = 'none';

  _gcSpinning = true;
  if (!_gcAudioCtx) _gcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_gcAudioCtx.state === 'suspended') _gcAudioCtx.resume();

  const crank = document.getElementById('gc-crank');
  _gcTotalRot += 720;
  if (crank) {
    crank.style.transition = 'transform 0.85s cubic-bezier(0.4,0,0.2,1)';
    crank.style.transform = `rotate(${_gcTotalRot}deg)`;
  }

  (function(){
    const o = _gcAudioCtx.createOscillator(), g = _gcAudioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, _gcAudioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, _gcAudioCtx.currentTime + 0.75);
    g.gain.setValueAtTime(0.12, _gcAudioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, _gcAudioCtx.currentTime + 0.75);
    o.connect(g); g.connect(_gcAudioCtx.destination);
    o.start(); o.stop(_gcAudioCtx.currentTime + 0.75);
  })();

  _gcSpeedMult = 10;
  setTimeout(() => {
    _gcSpeedMult = 1;
    const outCap = document.getElementById('gc-outcap');
    if (outCap) {
      const [c1,c2] = _GC_COLORS[Math.floor(Math.random()*_GC_COLORS.length)];
      outCap.style.background = `radial-gradient(circle at 32% 28%,${c1},${c2})`;
      outCap.style.transform = 'translateX(-50%) scale(1.4)';
      outCap.style.bottom = `-${Math.round(window._GC_DOME * 0.17)}px`;
    }
    [0,0.08,0.16,0.27].forEach((t,i) => {
      setTimeout(() => {
        const o2 = _gcAudioCtx.createOscillator(), g2 = _gcAudioCtx.createGain();
        o2.type = 'sine'; o2.frequency.value = [523,659,784,1047][i];
        g2.gain.setValueAtTime(0.22, _gcAudioCtx.currentTime);
        g2.gain.exponentialRampToValueAtTime(0.01, _gcAudioCtx.currentTime + 0.28);
        o2.connect(g2); g2.connect(_gcAudioCtx.destination);
        o2.start(); o2.stop(_gcAudioCtx.currentTime + 0.28);
      }, t * 1000);
    });

    setTimeout(() => {
      const keyword = items[Math.floor(Math.random()*items.length)];
      const p = _gcFindPlayer(keyword);
      const displayName = p ? p.name : keyword;
      const iconSz = Math.round(window._GC_DOME * 0.36);

      let icon = '';
      if (p) {
        if (p.photo) {
          icon = `<img src="${p.photo}" style="width:${iconSz}px;height:${iconSz}px;border-radius:50%;object-fit:cover;border:4px solid #FF89AB;display:inline-block;animation:gcBounceIcon 0.65s ease 0.1s both" onerror="this.outerHTML='🎮'">`;
        } else {
          icon = p.race==='T'?'🤖':p.race==='Z'?'🐛':p.race==='P'?'💎':'🎮';
        }
      } else {
        const iconMap = {'투혼':'⚔️','블루':'💙','아즈':'🏛️','롱기':'🗡️','개마':'🏔️','포르':'🏰'};
        for (const [k,v] of Object.entries(iconMap)) if (keyword.includes(k)) { icon = v; break; }
        if (!icon) icon = ['🎰','⭐','🎮','🎯','✨','🌟','🎊'][Math.floor(Math.random()*7)];
      }

      const iconEl = document.getElementById('gc-pop-icon');
      if (iconEl) iconEl.innerHTML = icon.startsWith('<img') ? icon : `<span style="animation:gcBounceIcon 0.65s ease 0.1s both;display:inline-block">${icon}</span>`;
      const resEl = document.getElementById('gc-res-text');
      if (resEl) resEl.textContent = displayName;

      const resultCard = document.getElementById('gc-result-card');
      if (resultCard) {
        resultCard.style.display = 'block';
        resultCard.style.animation = 'none';
        void resultCard.offsetWidth;
        resultCard.style.animation = 'gcCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)';
      }
      _gcConfetti();
    }, 750);
  }, 950);
}

function _gcReset() {
  _gcSpinning = false;
  const outCap = document.getElementById('gc-outcap');
  if (outCap) { outCap.style.transform = 'translateX(-50%) scale(0)'; outCap.style.bottom = `-${Math.round(window._GC_DOME * 0.1)}px`; }
  const card = document.getElementById('gc-result-card');
  if (card) card.style.display = 'none';
}

function _gcConfetti() {
  const colors = ['#FF4B6E','#FFD54F','#CE93D8','#80DEEA','#A5D6A7','#FF80AB','#FFF176'];
  for (let i = 0; i < 45; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      const sz = 6 + Math.random() * 9;
      el.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-15px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${sz}px;height:${sz}px;border-radius:${Math.random()>.5?'50%':'4px'};z-index:600;pointer-events:none;animation:gcConfettiFall ${1.2+Math.random()*.9}s ease-in ${Math.random()*.4}s forwards`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }, i * 20);
  }
}
