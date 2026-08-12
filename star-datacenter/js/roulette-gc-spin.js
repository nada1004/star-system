/* ══════════════════════════════════════════════════════════════
   룰렛 - GC 휠 스핀/애니메이션 (roulette.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _gcSwitchTab(tab) {
  // (정리) 신규 탭 삭제: 호출되더라도 무시
  if (tab === 'new') tab = 'player';
  if (_gcTab === 'duck' && tab !== 'duck' && typeof _drCleanup === 'function') _drCleanup();
  if (_gcTab === 'ladder' && tab !== 'ladder') {
    if (typeof _ldAnimId2 !== 'undefined' && _ldAnimId2) { cancelAnimationFrame(_ldAnimId2); _ldAnimId2 = null; }
    if (typeof _ldAnimating !== 'undefined') _ldAnimating = false;
  }
  if (_gcTab === 'wheel' && tab !== 'wheel') {
    if (typeof _whAnimId !== 'undefined' && _whAnimId) { cancelAnimationFrame(_whAnimId); _whAnimId = null; }
    if (typeof _whSpinning !== 'undefined') _whSpinning = false;
  }
  if (_gcTab === 'teammatch' && tab !== 'teammatch' && typeof _tmCleanup === 'function') _tmCleanup();
  if (_gcTab === 'tiermatch' && tab !== 'tiermatch' && typeof _tiCleanup === 'function') _tiCleanup();
  if (_gcTab === 'quiz' && tab !== 'quiz' && typeof _pqCleanup === 'function') _pqCleanup();
  if (_gcTab === 'memory' && tab !== 'memory' && typeof _mmCleanup === 'function') _mmCleanup();
  if (_gcTab === 'mole' && tab !== 'mole' && typeof _mwCleanup === 'function') _mwCleanup();
  if (_gcTab === 'omok' && tab !== 'omok' && typeof _omCleanup === 'function') _omCleanup();
  if (_gcTab === 'janggi' && tab !== 'janggi' && typeof _jgCleanup === 'function') _jgCleanup();
  if (_gcTab === 'othello' && tab !== 'othello' && typeof _otCleanup === 'function') _otCleanup();
  _gcTab = tab;
  if (_GC_TAB_GROUP[tab]) _gcLastTab[_GC_TAB_GROUP[tab]] = tab;
  render();
  if (tab === 'ladder') {
    setTimeout(()=>{ try{ if(typeof _ldInit==='function') _ldInit(); }catch(e){} }, 60);
  } else if (tab === 'duck') {
    setTimeout(()=>{ try{ if(typeof _drInit==='function') _drInit(); }catch(e){} }, 60);
  } else if (tab === 'wheel') {
    setTimeout(()=>{ try{ if(typeof _whInit==='function') _whInit(); }catch(e){} }, 60);
  } else if (tab === 'ppopgi') {
    setTimeout(()=>{ try{ if(typeof _ppgInit==='function') _ppgInit(); }catch(e){} }, 60);
  } else if (tab === 'teammatch') {
    setTimeout(()=>{ try{ if(typeof _tmInit==='function') _tmInit(); }catch(e){} }, 60);
  } else if (tab === 'tiermatch') {
    setTimeout(()=>{ try{ if(typeof _tiInit==='function') _tiInit(); }catch(e){} }, 60);
  } else if (tab === 'quiz') {
    setTimeout(()=>{ try{ if(typeof _pqInit==='function') _pqInit(); }catch(e){} }, 60);
  } else if (tab === 'memory') {
    setTimeout(()=>{ try{ if(typeof _mmInit==='function') _mmInit(); }catch(e){} }, 60);
  } else if (tab === 'mole') {
    setTimeout(()=>{ try{ if(typeof _mwInit==='function') _mwInit(); }catch(e){} }, 60);
  } else if (tab === 'omok') {
    setTimeout(()=>{ try{ if(typeof _omInit==='function') _omInit(); }catch(e){} }, 60);
  } else if (tab === 'janggi') {
    setTimeout(()=>{ try{ if(typeof _jgInit==='function') _jgInit(); }catch(e){} }, 60);
  } else if (tab === 'othello') {
    setTimeout(()=>{ try{ if(typeof _otInit==='function') _otInit(); }catch(e){} }, 60);
  } else {
    setTimeout(()=>{ try{ if(typeof _gcSetup==='function') _gcSetup(); }catch(e){} }, 60);
  }
}

// (추가) 룰렛·추첨 / 미니게임 그룹 전환 — 해당 그룹에서 마지막으로 보던 탭으로 이동
function _gcSwitchGroup(group) {
  if (group !== 'roulette' && group !== 'game') return;
  const fallback = group === 'game' ? 'teammatch' : 'player';
  const target = _gcLastTab[group] || fallback;
  _gcSwitchTab(target);
}

function _gcToggleInput() {
  _gcInputOpen = !_gcInputOpen;
  const body = document.getElementById('gc-input-body');
  const btn  = document.getElementById('gc-input-toggle');
  if (body) body.style.display = _gcInputOpen ? 'block' : 'none';
  if (btn)  btn.textContent    = _gcInputOpen ? '📝 입력 접기 ▲' : '📝 입력 펼치기 ▼';
}

function _gcSaveText(val) {
  _rLsSet(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m', val);
  // (요청사항) 확률(%) 표시는 제거
}

// (요청사항) 확률(%) 표시는 제거됨

function _gcToggleMap(mapName, el) {
  const inp = document.getElementById('gc-items-input');
  if (!inp) return;
  let items = inp.value.split(',').map(v=>v.trim()).filter(v=>v);
  const idx = items.findIndex(x=>{
    const m=String(x).match(/^(.*?)(?:\*(\d+(?:\.\d+)?))?$/);
    const n=(m?m[1]:x).trim();
    return n===mapName;
  });
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
  try{ localStorage.removeItem(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m'); }catch(e){}
  document.querySelectorAll('[data-map]').forEach(el => {
    el.style.background = 'var(--surface)';
    el.style.borderColor = 'var(--border)';
    el.style.color = 'var(--text2)';
  });
  // (요청사항) 확률(%) 표시는 제거
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
  const parsed = _gcParseWeightedCSV(inp.value);
  if (!parsed.items.length) { alert('항목을 먼저 입력해주세요!'); return; }

  const card = document.getElementById('gc-result-card');
  if (card) card.style.display = 'none';
  if (_gcInputOpen) _gcToggleInput();

  _gcSpinning = true;
  try {
    if (!_gcAudioCtx) _gcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_gcAudioCtx.state === 'suspended') _gcAudioCtx.resume().catch(()=>{});
  } catch(e) {}

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
      const _histKey = _gcTab === 'player' ? 'player' : 'map';
      const _avoidNames = _gcRecentResults[_histKey] || [];
      const picked = _gcPickWeightedAvoidRepeat(parsed.items, parsed.total, _avoidNames) || parsed.items[0];
      const keyword = picked.name;
      _gcRememberRecent(_histKey, keyword);
      const p = _gcFindPlayer(keyword);
      const displayName = p ? p.name : keyword;
      const iconSz = Math.round(window._GC_DOME * 0.36);

      let icon = '';
      const _gcPhoto = p ? (p.photo || (window.playerPhotos && window.playerPhotos[p.name]) || '') : '';
      if (p) {
        if (_gcPhoto) {
          icon = `<img src="${toHttpsUrl(_gcPhoto)}" style="width:${iconSz}px;height:${iconSz}px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:4px solid #FF89AB;display:inline-block;animation:gcBounceIcon 0.65s ease 0.1s both" onerror="this.outerHTML='🎮'">`;
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
      const probEl = document.getElementById('gc-res-prob');
      if (probEl) {
        probEl.textContent = '';
      }

      const histKey = _gcTab === 'player' ? 'player' : 'map';
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      _gcHistory[histKey].push({ name: displayName, time: timeStr });
      if (_gcHistory[histKey].length > 30) _gcHistory[histKey] = _gcHistory[histKey].slice(-30);
      try{ const _hk=histKey==='player'?'p':'m'; if(typeof MiscStore!=='undefined') MiscStore.set(`su_gc_hist_${_hk}`, _gcHistory[histKey]); else localStorage.setItem(`su_gc_hist_${_hk}`, JSON.stringify(_gcHistory[histKey])); }catch(e){}
      _gcRefreshHistory();

      const resultCard = document.getElementById('gc-result-card');
      if (resultCard) resultCard.style.display = 'none';

      // (요청사항) 결과는 팝업으로 표시
      try{
        if(typeof window._rrShowPopup==='function'){
          window._rrShowPopup('🎉 결과', `<div style="text-align:center;padding:6px 4px">
            <div style="font-size:46px;line-height:1;margin-bottom:10px">${_gcPhoto ? '🎮' : (icon && !String(icon).startsWith('<') ? icon : '🎁')}</div>
            <div style="font-size:22px;font-weight:1000;color:var(--text1)">${displayName}</div>
          </div>`);
        }
      }catch(e){}
      _gcSpinning = false;
    }, 750);
  }, 950);
}

function _gcRefreshHistory() {
  const hist = _gcHistory[_gcTab === 'player' ? 'player' : 'map'];
  const fs = Math.max(13, Math.round(window._GC_DOME * 0.075));
  const pad = Math.max(14, Math.round(window._GC_DOME * 0.085));
  let container = document.getElementById('gc-hist-box');
  const resultCard = document.getElementById('gc-result-card');
  if (!container && resultCard) {
    container = document.createElement('div');
    container.id = 'gc-hist-box';
    resultCard.parentNode.insertBefore(container, resultCard.nextSibling);
  }
  if (!container) return;
  if (!hist.length) { container.innerHTML = ''; return; }
  container.className = 'gc-history-card';
  container.style.cssText = `margin-top:${Math.round(pad*0.5)}px`;
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:${fs}px;font-weight:700;color:var(--text2)">📋 결과 기록 (${hist.length})</span>
      <button onclick="_gcClearHistory()" style="font-size:${Math.max(10,fs-2)}px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:5px;max-height:220px;overflow-y:auto">
      ${hist.slice().reverse().map((r,i)=>`
      <div class="gc-history-item" style="font-size:${fs}px">
        <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px;min-width:18px;text-align:right">${hist.length-i}</span>
        <span style="font-weight:700;flex:1;color:var(--text1)">${r.name}</span>
        <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px">${r.time}</span>
      </div>`).join('')}
    </div>`;
}

function _gcClearHistory() {
  const key = _gcTab === 'player' ? 'player' : 'map';
  _gcHistory[key] = [];
  try{ const _hk=key==='player'?'p':'m'; if(typeof MiscStore!=='undefined') MiscStore.delete(`su_gc_hist_${_hk}`); else localStorage.removeItem(`su_gc_hist_${_hk}`); }catch(e){}
  _gcRefreshHistory();
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

// ─── 사다리 게임 ────────────────────────────────────────────────────────────
let _ldLadder    = null;
let _ldAnimating = false;
let _ldAnimId2   = null;

