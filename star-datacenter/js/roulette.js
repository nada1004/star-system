// ─── 가챠 룰렛 시스템 ─────────────────────────────────────────────────────
(function _gcInjectCSS(){
  if (document.getElementById('gc-style')) return;
  const s = document.createElement('style');
  s.id = 'gc-style';
  s.textContent = `@keyframes gcConfettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(100vh) rotate(800deg) scale(0.4);opacity:0}}
  @keyframes gcBounceIcon{0%{transform:scale(0) rotate(-20deg)}60%{transform:scale(1.3) rotate(10deg)}80%{transform:scale(0.9) rotate(-5deg)}100%{transform:scale(1) rotate(0deg)}}`;
  document.head.appendChild(s);
})();

let _gcTab = 'player';
let _gcSpinning = false;
let _gcSpeedMult = 1;
let _gcCapsules = [];
let _gcAnimId = null;
let _gcTotalRot = 0;
let _gcAudioCtx = null;

const _GC_DOME = 170;
const _GC_CAP_R = 13;
const _GC_COLORS = [
  ['#FF80AB','#FF4081'],['#81D4FA','#29B6F6'],['#FFF176','#FFD600'],
  ['#B9F6CA','#00E676'],['#CE93D8','#AB47BC'],['#FFCC80','#FFA726'],
  ['#F48FB1','#EC407A'],['#80DEEA','#00BCD4'],['#FFAB91','#FF5722'],
];

function renderRoulettePanel() {
  const isPlayer = _gcTab === 'player';
  const savedText = localStorage.getItem(isPlayer ? 'su_gc_p' : 'su_gc_m') || '';
  const activeItems = savedText.split(',').map(v=>v.trim()).filter(v=>v);

  const mapBadges = !isPlayer ? (maps||[]).map(m => {
    const active = activeItems.includes(m);
    return `<span onclick="_gcToggleMap('${m.replace(/'/g,"\\'").replace(/"/g,'\\"')}',this)" data-map="${m.replace(/"/g,'&quot;')}" style="cursor:pointer;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;border:1.5px solid ${active?'#FF4B6E':'var(--border)'};background:${active?'#FFF0F3':'var(--surface)'};color:${active?'#FF4B6E':'var(--text2)'};transition:.1s;user-select:none">${m}</span>`;
  }).join('') : '';

  return `<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:visible" class="no-export">
  <!-- 탭 헤더 -->
  <div style="display:flex;border-bottom:1px solid var(--border)">
    <button onclick="_gcSwitchTab('player')" style="flex:1;padding:10px 6px;font-size:12px;font-weight:700;border:none;background:${isPlayer?'#FFF0F3':'var(--surface)'};color:${isPlayer?'#FF4B6E':'var(--text2)'};cursor:pointer;border-right:1px solid var(--border);border-radius:12px 0 0 0;transition:.1s">🎰 선수뽑기</button>
    <button onclick="_gcSwitchTab('map')" style="flex:1;padding:10px 6px;font-size:12px;font-weight:700;border:none;background:${!isPlayer?'#FFF0F3':'var(--surface)'};color:${!isPlayer?'#FF4B6E':'var(--text2)'};cursor:pointer;border-radius:0 12px 0 0;transition:.1s">🗺️ 맵뽑기</button>
  </div>
  <!-- 입력 영역 -->
  <div style="padding:10px 12px 0">
    <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">${isPlayer?'선수 이름 (쉼표 구분)':'맵 이름 (쉼표 구분)'}</div>
    <textarea id="gc-items-input" rows="2" oninput="_gcSaveText(this.value)" style="width:100%;border:1.5px solid var(--border);border-radius:8px;padding:7px 9px;font-size:11px;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box">${savedText}</textarea>
    ${!isPlayer && mapBadges ? `<div style="margin-top:6px"><div style="font-size:10px;color:var(--text3);margin-bottom:4px;font-weight:700">등록된 맵 클릭해서 추가:</div><div style="display:flex;flex-wrap:wrap;gap:3px">${mapBadges}</div></div>` : ''}
    <button onclick="_gcClearItems()" style="margin-top:6px;font-size:10px;padding:3px 8px;border-radius:5px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">지우기</button>
  </div>
  <!-- 가챠 머신 -->
  <div style="padding:8px 12px 16px;display:flex;flex-direction:column;align-items:center">
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 16px rgba(255,75,110,0.3))">
      <!-- 돔 -->
      <div style="position:relative;width:${_GC_DOME}px;height:${_GC_DOME}px">
        <div id="gc-dome" style="width:${_GC_DOME}px;height:${_GC_DOME}px;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.52),rgba(255,200,220,0.2) 55%,rgba(255,150,180,0.08));border:7px solid white;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 35px rgba(255,255,255,0.5),0 6px 20px rgba(200,60,90,0.2),0 0 0 4px #FFD6E4;position:relative"></div>
        <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse at 28% 22%,rgba(255,255,255,0.55) 0%,transparent 55%);pointer-events:none"></div>
      </div>
      <!-- 링 -->
      <div style="width:${_GC_DOME-18}px;height:18px;background:linear-gradient(180deg,#fff 0%,#f8bbd0 60%,#f48fb1 100%);border-radius:0 0 10px 10px;margin-top:-9px;position:relative;z-index:2;box-shadow:0 4px 0 #FF4B6E"></div>
      <!-- 바디 -->
      <div style="width:${_GC_DOME+18}px;background:linear-gradient(180deg,#FF4B6E 0%,#e53935 100%);margin-top:-7px;border-radius:14px 14px 36px 36px;position:relative;z-index:1;box-shadow:0 7px 0 #C0274A;padding:10px 16px 20px;display:flex;flex-direction:column;align-items:center;gap:8px">
        <!-- 크랭크 -->
        <div id="gc-crank" onclick="_gcSpin()" style="width:72px;height:72px;background:radial-gradient(circle at 35% 28%,#ffffff,#d8d8d8);border:6px solid #c8c8c8;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 0 #aaa;transition:transform 0.8s cubic-bezier(0.4,0,0.2,1);user-select:none;position:relative;overflow:hidden" title="클릭해서 뽑기!">
          <div style="width:50px;height:14px;background:linear-gradient(180deg,#ccc,#999);border-radius:9px;box-shadow:0 3px 0 #888"></div>
        </div>
        <div style="font-size:10px;color:rgba(255,255,255,0.9);font-weight:700;letter-spacing:.5px">🎰 클릭해서 뽑기!</div>
        <!-- 출구 -->
        <div style="display:flex;flex-direction:column;align-items:center">
          <div style="position:relative;width:65px;height:42px;background:linear-gradient(180deg,#1a1a1a,#333);border-radius:11px 11px 0 0;box-shadow:inset 0 -5px 10px rgba(0,0,0,0.55)">
            <div id="gc-outcap" style="position:absolute;bottom:-18px;left:50%;transform:translateX(-50%) scale(0);width:42px;height:42px;border-radius:50%;z-index:10;transition:0.65s cubic-bezier(0.175,0.885,0.32,1.45);border:3px solid white;box-shadow:0 5px 14px rgba(0,0,0,0.22)"></div>
          </div>
          <div style="width:84px;height:14px;background:linear-gradient(180deg,#d32f2f,#b71c1c);border-radius:0 0 14px 14px;box-shadow:0 4px 0 rgba(0,0,0,0.2)"></div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- 결과 팝업 -->
<div id="gc-popup-overlay" style="display:none;position:fixed;inset:0;background:rgba(255,160,190,0.45);backdrop-filter:blur(10px);z-index:500;align-items:center;justify-content:center" onclick="if(event.target===this)_gcReset()">
  <div id="gc-popup" style="background:white;border-radius:32px;border:6px solid #FF89AB;padding:36px 48px;text-align:center;box-shadow:0 24px 60px rgba(255,75,110,0.3);transform:scale(0);transition:transform 0.52s cubic-bezier(0.175,0.885,0.32,1.35);max-width:320px;width:88%;position:relative">
    <div style="font-size:32px;position:absolute;top:-16px;left:50%;transform:translateX(-50%)">🌟</div>
    <div id="gc-pop-icon" style="font-size:68px;display:block;margin-bottom:6px;animation:gcBounceIcon 0.65s ease 0.2s both"></div>
    <div id="gc-res-text" style="font-size:clamp(1.4rem,5vw,2rem);font-weight:900;color:#C0274A;margin:8px 0 20px;word-break:keep-all"></div>
    <button onclick="_gcReset()" style="background:linear-gradient(135deg,#FF4B6E,#FF89AB);color:white;border:none;border-radius:18px;padding:12px 30px;font-size:0.95rem;font-weight:700;cursor:pointer;box-shadow:0 6px 0 #C0274A;transition:transform .1s,box-shadow .1s" onmousedown="this.style.transform='translateY(4px)';this.style.boxShadow='0 2px 0 #C0274A'" onmouseup="this.style.transform='';this.style.boxShadow='0 6px 0 #C0274A'">🎰 다시 뽑기!</button>
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
  const center = _GC_DOME / 2;
  const limit = center - _GC_CAP_R - 4;
  for (let i = 0; i < 15; i++) {
    const cap = document.createElement('div');
    const [c1,c2] = _GC_COLORS[i % _GC_COLORS.length];
    cap.style.cssText = `position:absolute;width:${_GC_CAP_R*2}px;height:${_GC_CAP_R*2}px;border-radius:50%;background:radial-gradient(circle at 32% 28%,${c1},${c2});border:3px solid rgba(255,255,255,0.75);box-shadow:2px 2px 5px rgba(0,0,0,0.13);will-change:transform`;
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * limit * 0.85;
    _gcCapsules.push({
      el: cap,
      x: center + Math.cos(ang)*r - _GC_CAP_R,
      y: center + Math.sin(ang)*r - _GC_CAP_R,
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
  const center = _GC_DOME / 2;
  const limit = center - _GC_CAP_R - 4;
  _gcCapsules.forEach(cap => {
    cap.x += cap.vx * _gcSpeedMult;
    cap.y += cap.vy * _gcSpeedMult;
    const dx = cap.x + _GC_CAP_R - center;
    const dy = cap.y + _GC_CAP_R - center;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > limit) {
      const ang = Math.atan2(dy, dx);
      cap.x = center + Math.cos(ang)*limit - _GC_CAP_R;
      cap.y = center + Math.sin(ang)*limit - _GC_CAP_R;
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

  _gcSpinning = true;
  if (!_gcAudioCtx) _gcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_gcAudioCtx.state === 'suspended') _gcAudioCtx.resume();

  const crank = document.getElementById('gc-crank');
  _gcTotalRot += 720;
  if (crank) {
    crank.style.transition = 'transform 0.85s cubic-bezier(0.4,0,0.2,1)';
    crank.style.transform = `rotate(${_gcTotalRot}deg)`;
  }

  // 회전 효과음
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
      outCap.style.bottom = '-28px';
    }
    // 당첨 효과음
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
      const result = items[Math.floor(Math.random()*items.length)];
      // 아이콘 결정
      let icon = '';
      const p = (typeof players !== 'undefined') && players.find(x => x.name === result);
      if (p) {
        if (p.photo) {
          icon = `<img src="${p.photo}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:4px solid #FF89AB;animation:gcBounceIcon 0.65s ease 0.2s both" onerror="this.outerHTML='🎮'">`;
        } else {
          icon = p.race==='T'?'🤖':p.race==='Z'?'🐛':p.race==='P'?'💎':'🎮';
        }
      } else {
        const iconMap = {'투혼':'⚔️','블루':'💙','아즈':'🏛️','롱기':'🗡️','개마':'🏔️','신':'✨','포르':'🏰'};
        for (const [k,v] of Object.entries(iconMap)) if (result.includes(k)) { icon = v; break; }
        if (!icon) icon = ['🎰','⭐','🎮','🎯','✨','🌟','🎊'][Math.floor(Math.random()*7)];
      }

      const iconEl = document.getElementById('gc-pop-icon');
      if (iconEl) iconEl.innerHTML = typeof icon === 'string' && icon.startsWith('<img') ? icon : `<span style="animation:gcBounceIcon 0.65s ease 0.2s both;display:inline-block">${icon}</span>`;
      const resEl = document.getElementById('gc-res-text');
      if (resEl) resEl.textContent = result;

      const overlay = document.getElementById('gc-popup-overlay');
      const popup = document.getElementById('gc-popup');
      if (overlay && popup) {
        overlay.style.display = 'flex';
        setTimeout(() => { popup.style.transform = 'scale(1)'; }, 20);
      }
      _gcConfetti();
    }, 750);
  }, 950);
}

function _gcReset() {
  _gcSpinning = false;
  const outCap = document.getElementById('gc-outcap');
  if (outCap) { outCap.style.transform = 'translateX(-50%) scale(0)'; outCap.style.bottom = '-18px'; }
  const popup = document.getElementById('gc-popup');
  if (popup) popup.style.transform = 'scale(0)';
  const overlay = document.getElementById('gc-popup-overlay');
  if (overlay) setTimeout(() => { overlay.style.display = 'none'; }, 320);
}

function _gcConfetti() {
  const colors = ['#FF4B6E','#FFD54F','#CE93D8','#80DEEA','#A5D6A7','#FF80AB','#FFF176'];
  for (let i = 0; i < 55; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      const sz = 6 + Math.random() * 9;
      el.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-15px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${sz}px;height:${sz}px;border-radius:${Math.random()>.5?'50%':'4px'};z-index:600;pointer-events:none;animation:gcConfettiFall ${1.2+Math.random()*.9}s ease-in ${Math.random()*.5}s forwards`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2400);
    }, i * 18);
  }
}
