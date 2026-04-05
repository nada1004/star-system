// ─── 가챠 룰렛 시스템 ─────────────────────────────────────────────────────
function rRoulette(C, T) {
  T.textContent = '🎰 룰렛';
  const avW = window.innerWidth;
  const avH = window.innerHeight - 130;
  const isWide = avW >= 700;
  const _dome = Math.max(190, Math.min(340, Math.round(isWide ? Math.min(avH * 0.48, avW * 0.28) : Math.min(avH * 0.38, avW * 0.7))));
  const _capR = Math.round(_dome * 0.076);
  window._GC_DOME = _dome;
  window._GC_CAP_R = _capR;
  C.innerHTML = renderRoulettePanel(_dome, _capR, isWide, avW, avH);
  if (_gcTab === 'ladder') {
    setTimeout(_ldInit, 60);
  } else if (_gcTab === 'duck') {
    setTimeout(_drInit, 60);
  } else if (_gcTab === 'wheel') {
    setTimeout(_whInit, 60);
  } else {
    setTimeout(_gcSetup, 60);
  }
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
let _gcInputOpen = true;
let _gcSpinning = false;
let _gcHistory = {
  player: JSON.parse(localStorage.getItem('su_gc_hist_p')||'[]'),
  map:    JSON.parse(localStorage.getItem('su_gc_hist_m')||'[]'),
  ladder: JSON.parse(localStorage.getItem('su_gc_hist_l')||'[]')
};
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
  dome   = dome  || window._GC_DOME;
  capR   = capR  || window._GC_CAP_R;
  isWide = isWide != null ? isWide : (window.innerWidth >= 700);
  avW    = avW   || window.innerWidth;
  avH    = avH   || window.innerHeight - 130;

  const isPlayer = _gcTab === 'player';
  const isLadder = _gcTab === 'ladder';
  const isDuck   = _gcTab === 'duck';
  const isWheel  = _gcTab === 'wheel';

  const savedText   = (!isLadder && !isDuck && !isWheel) ? (localStorage.getItem(isPlayer ? 'su_gc_p' : 'su_gc_m') || '') : '';
  const activeItems = savedText.split(',').map(v=>v.trim()).filter(v=>v);

  const ldNamesText = isLadder ? (localStorage.getItem('su_ld_names') || '') : '';
  const ldItemsText = isLadder ? (localStorage.getItem('su_ld_items') || '') : '';
  const ldNames     = ldNamesText.split(',').map(v=>v.trim()).filter(v=>v);

  const fs   = Math.max(13, Math.round(dome * 0.075));
  const fsLg = Math.max(16, Math.round(dome * 0.095));
  const pad  = Math.max(14, Math.round(dome * 0.085));

  // 탭 버튼 스타일 헬퍼 (TDZ 방지: isDuck 블록보다 먼저 선언)
  const _tbP = Math.round(pad * 0.65);
  const _tbF = Math.max(11, fs - 1);
  const tbStyle = (active, isSpecial) => active
    ? `flex:1;padding:${_tbP}px 5px;font-size:${_tbF}px;font-weight:800;border:none;border-radius:10px;background:${isSpecial?'linear-gradient(135deg,#0ea5e9,#38bdf8)':'linear-gradient(135deg,#FF4B6E,#FF89AB)'};color:#fff;cursor:pointer;transition:.15s;box-shadow:0 2px 8px ${isSpecial?'rgba(14,165,233,.35)':'rgba(255,75,110,.35)'};text-align:center;line-height:1.3;min-width:0`
    : `flex:1;padding:${_tbP}px 5px;font-size:${_tbF}px;font-weight:700;border:none;border-radius:10px;background:transparent;color:var(--text3);cursor:pointer;transition:.15s;text-align:center;line-height:1.3;min-width:0`;

  // 공통 탭바 HTML
  const _tabBar = `<div style="background:var(--surface);border-radius:14px;padding:4px;display:flex;gap:2px;margin-bottom:${pad}px">
    <button onclick="_gcSwitchTab('player')" style="${tbStyle(_gcTab==='player')}">🎰 구슬뽑기</button>
    <button onclick="_gcSwitchTab('map')"    style="${tbStyle(_gcTab==='map')}">🗺️ 맵뽑기</button>
    <button onclick="_gcSwitchTab('ladder')" style="${tbStyle(_gcTab==='ladder')}">🪜 사다리</button>
    <button onclick="_gcSwitchTab('duck')"   style="${tbStyle(_gcTab==='duck',true)}">🐥 경주</button>
    <button onclick="_gcSwitchTab('wheel')"  style="${tbStyle(_gcTab==='wheel',true)}">🎡 휠</button>
  </div>`;

  // 오리경주 탭: 별도 레이아웃
  if (isDuck) {
    return `<div style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_tabBar}
  <div id="dr-root"></div>
</div>`;
  }

  // 룰렛 휠 탭: 별도 레이아웃
  if (isWheel) {
    return `<div style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_tabBar}
  <div id="wh-root"></div>
</div>`;
  }

  const mapBadges = (!isLadder && !isPlayer) ? (maps||[]).map(m => {
    const active = activeItems.includes(m);
    return `<span onclick="_gcToggleMap('${m.replace(/'/g,"\\'").replace(/"/g,'\\"')}',this)" data-map="${m.replace(/"/g,'&quot;')}"
      style="cursor:pointer;padding:5px 12px;border-radius:14px;font-size:${fs}px;font-weight:700;border:2px solid ${active?'#FF4B6E':'var(--border)'};background:${active?'#FFF0F3':'var(--surface)'};color:${active?'#FF4B6E':'var(--text2)'};transition:.1s;user-select:none">${m}</span>`;
  }).join('') : '';

  const _inputSummary = isLadder
    ? (ldNames.length ? `✏️ 참가자 ${ldNames.length}명 입력됨` : '✏️ 참가자 입력 없음')
    : (activeItems.length ? `✏️ ${isPlayer?'스트리머':'맵'} ${activeItems.length}개 입력됨` : `✏️ ${isPlayer?'스트리머':'맵'} 입력 없음`);

  // 머신 치수 (가챠용)
  const bodyW     = dome + Math.round(dome * 0.11);
  const ringW     = dome - Math.round(dome * 0.11);
  const ringH     = Math.round(dome * 0.105);
  const crankSz   = Math.round(dome * 0.42);
  const exitW     = Math.round(dome * 0.38);
  const exitH     = Math.round(dome * 0.25);
  const exitCapSz = Math.round(dome * 0.25);
  const trayW     = Math.round(dome * 0.5);
  const trayH     = Math.round(dome * 0.083);
  const resIconSz = Math.round(dome * 0.36);
  const resTextSz = Math.max(20, Math.round(dome * 0.135));

  // 사다리 캔버스 크기
  const ldCanvasW = isWide ? Math.min(600, Math.round(avW * 0.55)) : Math.min(avW - 40, 420);
  const ldCanvasH = Math.max(380, Math.round(avH * 0.68));

  const inputW = isWide ? Math.min(360, Math.round(avW * 0.38)) : '100%';
  const innerLayout = isWide
    ? `display:flex;gap:${pad*2}px;align-items:flex-start`
    : `display:flex;flex-direction:column;align-items:center`;
  const inputColStyle = isWide ? `width:${inputW}px;flex-shrink:0` : `width:100%`;

  // 탭 버튼 스타일 헬퍼 (상단에서 이미 선언됨 - 중복 선언 제거)

  // 사다리: 항상 표시할 결과 항목 블록 (접기 영역 밖)
  const ldItemsAlways = isLadder ? `
    <div style="background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-bottom:${Math.round(pad*0.6)}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">결과 항목 (쉼표 구분, 이름 수와 동일하게)</div>
      <textarea id="ld-items-input" rows="2" oninput="_ldSaveItems(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:10px;padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box">${ldItemsText}</textarea>
      <button onclick="_ldRebuild()" style="margin-top:10px;font-size:${fs}px;padding:6px 14px;border-radius:8px;border:1.5px solid #a78bfa;background:#f5f3ff;color:#7c3aed;cursor:pointer;font-weight:600">🎲 사다리 다시 만들기</button>
    </div>
    <div id="ld-hist-box"></div>
  ` : '';

  // 입력 본체 HTML (접기 대상)
  const inputBodyInner = isLadder ? `
    <div style="background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-bottom:${Math.round(pad*0.6)}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">참가자 이름 (쉼표 구분, 2명 이상)</div>
      <textarea id="ld-names-input" rows="2" oninput="_ldSaveNames(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:10px;padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box">${ldNamesText}</textarea>
    </div>
  ` : `
    <div style="background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-bottom:${pad}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">${isPlayer?'스트리머 이름 (쉼표 구분, 부분 입력 가능)':'맵 이름 (쉼표 구분)'}</div>
      <textarea id="gc-items-input" rows="3" oninput="_gcSaveText(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:10px;padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box">${savedText}</textarea>
      <button onclick="_gcClearItems()" style="margin-top:10px;font-size:${fs}px;padding:6px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer;font-weight:600">지우기</button>
    </div>
    ${(!isPlayer && mapBadges) ? `
    <div style="background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-bottom:${pad}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:10px">📋 등록된 맵 (클릭해서 추가)</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${mapBadges}</div>
    </div>` : ''}
  `;

  // 가챠 결과 카드 + 기록 (가챠탭만)
  const gcResultHTML = isLadder ? '' : `
    <div id="gc-result-card" style="display:none;background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:2.5px solid #FF89AB;border-radius:16px;padding:${pad*1.2}px;text-align:center;animation:gcCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)">
      <div style="font-size:${fs}px;font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:10px">🎊 당첨!</div>
      <div id="gc-pop-icon" style="font-size:${resIconSz}px;display:block;margin-bottom:8px;line-height:1.1"></div>
      <div id="gc-res-text" style="font-size:${resTextSz}px;font-weight:900;color:#C0274A;margin-bottom:16px;word-break:keep-all"></div>
      <button onclick="_gcReset()" style="background:linear-gradient(135deg,#FF4B6E,#FF89AB);color:white;border:none;border-radius:14px;padding:${Math.round(pad*0.7)}px ${pad*1.5}px;font-size:${fsLg}px;font-weight:700;cursor:pointer;box-shadow:0 4px 0 #C0274A"
        onmousedown="this.style.transform='translateY(3px)';this.style.boxShadow='0 1px 0 #C0274A'"
        onmouseup="this.style.transform='';this.style.boxShadow='0 4px 0 #C0274A'">🎰 다시 뽑기!</button>
    </div>
    ${(()=>{
      const hist = _gcHistory[isPlayer?'player':'map'];
      if (!hist.length) return '';
      return `<div style="background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-top:${Math.round(pad*0.5)}px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:${fs}px;font-weight:700;color:var(--text2)">📋 결과 기록 (${hist.length})</span>
          <button onclick="_gcClearHistory()" style="font-size:${Math.max(10,fs-2)}px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;max-height:220px;overflow-y:auto">
          ${hist.slice().reverse().map((r,i)=>`
          <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--surface);border-radius:8px;font-size:${fs}px">
            <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px;min-width:18px;text-align:right">${hist.length-i}</span>
            <span style="font-weight:700;flex:1;color:var(--text1)">${r.name}</span>
            <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px">${r.time}</span>
          </div>`).join('')}
        </div>
      </div>`;
    })()}
  `;

  // 오른쪽 패널: 사다리 캔버스 or 가챠 머신
  const rightPanelHTML = isLadder ? `
  <div style="${isWide?'flex:1;display:flex;flex-direction:column;align-items:center':'display:flex;flex-direction:column;align-items:center;margin-top:'+pad+'px'}">
    <div id="ld-instruction" style="font-size:${fs}px;color:var(--text3);font-weight:600;margin-bottom:10px;text-align:center">이름을 클릭하면 사다리를 타요!</div>
    <canvas id="ld-canvas" width="${ldCanvasW}" height="${ldCanvasH}"
      style="width:${ldCanvasW}px;height:${ldCanvasH}px;border-radius:14px;border:2px solid var(--border);background:var(--white);cursor:pointer;display:block;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.08))"></canvas>
    <div id="ld-result-card" style="display:none;width:${ldCanvasW}px;margin-top:${pad}px;background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:2.5px solid #FF89AB;border-radius:16px;padding:${pad}px;text-align:center;box-sizing:border-box">
      <div style="font-size:${fs}px;font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:8px">🎊 당첨!</div>
      <div id="ld-res-name" style="font-size:${resTextSz}px;font-weight:900;color:#C0274A;margin-bottom:4px"></div>
      <div style="font-size:${fs}px;color:var(--text3);margin-bottom:8px">▼</div>
      <div id="ld-res-item" style="font-size:${resTextSz}px;font-weight:900;color:#2563eb"></div>
    </div>
  </div>
  ` : `
  <div style="${isWide?'flex:1;display:flex;flex-direction:column;align-items:center':'display:flex;flex-direction:column;align-items:center;margin-top:'+pad+'px'}">
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 8px 22px rgba(255,75,110,0.35))">
      <div style="position:relative;width:${dome}px;height:${dome}px">
        <div id="gc-dome" style="width:${dome}px;height:${dome}px;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.52),rgba(255,200,220,0.2) 55%,rgba(255,150,180,0.08));border:${Math.round(dome*0.042)}px solid white;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 ${Math.round(dome*0.21)}px rgba(255,255,255,0.5),0 ${Math.round(dome*0.035)}px ${Math.round(dome*0.12)}px rgba(200,60,90,0.22),0 0 0 ${Math.round(dome*0.024)}px #FFD6E4;position:relative"></div>
        <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse at 28% 22%,rgba(255,255,255,0.55) 0%,transparent 55%);pointer-events:none"></div>
      </div>
      <div style="width:${ringW}px;height:${ringH}px;background:linear-gradient(180deg,#fff 0%,#f8bbd0 60%,#f48fb1 100%);border-radius:0 0 ${Math.round(ringH*0.6)}px ${Math.round(ringH*0.6)}px;margin-top:${-Math.round(ringH*0.5)}px;position:relative;z-index:2;box-shadow:0 ${Math.round(ringH*0.22)}px 0 #FF4B6E"></div>
      <div style="width:${bodyW}px;background:linear-gradient(180deg,#FF4B6E 0%,#e53935 100%);margin-top:${-Math.round(dome*0.04)}px;border-radius:${Math.round(dome*0.08)}px ${Math.round(dome*0.08)}px ${Math.round(dome*0.22)}px ${Math.round(dome*0.22)}px;position:relative;z-index:1;box-shadow:0 ${Math.round(dome*0.042)}px 0 #C0274A;padding:${Math.round(dome*0.06)}px ${Math.round(dome*0.095)}px ${Math.round(dome*0.12)}px;display:flex;flex-direction:column;align-items:center;gap:${Math.round(dome*0.047)}px">
        <div id="gc-crank" onclick="_gcSpin()" title="클릭해서 뽑기!"
          style="width:${crankSz}px;height:${crankSz}px;background:radial-gradient(circle at 35% 28%,#ffffff,#d8d8d8);border:${Math.round(crankSz*0.083)}px solid #c8c8c8;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 ${Math.round(crankSz*0.083)}px 0 #aaa;transition:transform 0.8s cubic-bezier(0.4,0,0.2,1);user-select:none;position:relative;overflow:hidden">
          <div style="width:${Math.round(crankSz*0.69)}px;height:${Math.round(crankSz*0.19)}px;background:linear-gradient(180deg,#ccc,#999);border-radius:${Math.round(crankSz*0.12)}px;box-shadow:0 ${Math.round(crankSz*0.042)}px 0 #888"></div>
        </div>
        <div style="font-size:${Math.round(dome*0.07)}px;color:rgba(255,255,255,0.92);font-weight:700;letter-spacing:.5px">🎰 클릭해서 뽑기!</div>
        <div style="display:flex;flex-direction:column;align-items:center">
          <div style="position:relative;width:${exitW}px;height:${exitH}px;background:linear-gradient(180deg,#1a1a1a,#333);border-radius:${Math.round(exitW*0.12)}px ${Math.round(exitW*0.12)}px 0 0;box-shadow:inset 0 -${Math.round(exitH*0.14)}px ${Math.round(exitH*0.28)}px rgba(0,0,0,0.55)">
            <div id="gc-outcap" style="position:absolute;bottom:${-Math.round(exitCapSz*0.43)}px;left:50%;transform:translateX(-50%) scale(0);width:${exitCapSz}px;height:${exitCapSz}px;border-radius:50%;z-index:10;transition:0.65s cubic-bezier(0.175,0.885,0.32,1.45);border:${Math.round(exitCapSz*0.07)}px solid white;box-shadow:0 ${Math.round(exitCapSz*0.12)}px ${Math.round(exitCapSz*0.33)}px rgba(0,0,0,0.22)"></div>
          </div>
          <div style="width:${trayW}px;height:${trayH}px;background:linear-gradient(180deg,#d32f2f,#b71c1c);border-radius:0 0 ${Math.round(trayW*0.15)}px ${Math.round(trayW*0.15)}px;box-shadow:0 ${Math.round(trayH*0.29)}px 0 rgba(0,0,0,0.2)"></div>
        </div>
      </div>
    </div>
  </div>
  `;

  return `<div style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  <div style="background:var(--surface);border-radius:14px;padding:4px;display:flex;gap:2px;margin-bottom:${pad}px">
    <button onclick="_gcSwitchTab('player')" style="${tbStyle(_gcTab==='player')}">🎰 구슬뽑기</button>
    <button onclick="_gcSwitchTab('map')"    style="${tbStyle(_gcTab==='map')}">🗺️ 맵뽑기</button>
    <button onclick="_gcSwitchTab('ladder')" style="${tbStyle(_gcTab==='ladder')}">🪜 사다리</button>
    <button onclick="_gcSwitchTab('duck')"   style="${tbStyle(_gcTab==='duck',true)}">🐥 경주</button>
    <button onclick="_gcSwitchTab('wheel')"  style="${tbStyle(false,true)}">🎡 휠</button>
  </div>
  <div style="${innerLayout}">
    <div style="${inputColStyle}">
      <button onclick="_gcToggleInput()" id="gc-input-toggle" style="width:100%;padding:7px 12px;font-size:${fs}px;font-weight:700;border:1.5px solid var(--border);border-radius:10px;background:var(--white);color:var(--text3);cursor:pointer;transition:.1s;margin-bottom:${Math.round(pad*0.5)}px;text-align:left">${_gcInputOpen?'📝 입력 접기 ▲':'📝 입력 펼치기 ▼'}</button>
      <div id="gc-input-body" style="display:${_gcInputOpen?'block':'none'}">
        ${inputBodyInner}
      </div>
      ${ldItemsAlways}
      ${gcResultHTML}
    </div>
    ${rightPanelHTML}
  </div>
</div>`;
}

function _gcSwitchTab(tab) {
  if (_gcTab === 'duck' && tab !== 'duck' && typeof _drCleanup === 'function') _drCleanup();
  _gcTab = tab;
  render();
  if (tab === 'ladder') {
    setTimeout(_ldInit, 60);
  } else if (tab === 'duck') {
    setTimeout(_drInit, 60);
  } else if (tab === 'wheel') {
    setTimeout(_whInit, 60);
  } else {
    setTimeout(_gcSetup, 60);
  }
}

function _gcToggleInput() {
  _gcInputOpen = !_gcInputOpen;
  const body = document.getElementById('gc-input-body');
  const btn  = document.getElementById('gc-input-toggle');
  if (body) body.style.display = _gcInputOpen ? 'block' : 'none';
  if (btn)  btn.textContent    = _gcInputOpen ? '📝 입력 접기 ▲' : '📝 입력 펼치기 ▼';
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
  if (_gcInputOpen) _gcToggleInput();

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

      const histKey = _gcTab === 'player' ? 'player' : 'map';
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      _gcHistory[histKey].push({ name: displayName, time: timeStr });
      localStorage.setItem(`su_gc_hist_${histKey==='player'?'p':'m'}`, JSON.stringify(_gcHistory[histKey]));
      _gcRefreshHistory();

      const resultCard = document.getElementById('gc-result-card');
      if (resultCard) {
        resultCard.style.display = 'block';
        resultCard.style.animation = 'none';
        void resultCard.offsetWidth;
        resultCard.style.animation = 'gcCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)';
      }
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
  container.style.cssText = `background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-top:${Math.round(pad*0.5)}px`;
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:${fs}px;font-weight:700;color:var(--text2)">📋 결과 기록 (${hist.length})</span>
      <button onclick="_gcClearHistory()" style="font-size:${Math.max(10,fs-2)}px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:5px;max-height:220px;overflow-y:auto">
      ${hist.slice().reverse().map((r,i)=>`
      <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--surface);border-radius:8px;font-size:${fs}px">
        <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px;min-width:18px;text-align:right">${hist.length-i}</span>
        <span style="font-weight:700;flex:1;color:var(--text1)">${r.name}</span>
        <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px">${r.time}</span>
      </div>`).join('')}
    </div>`;
}

function _gcClearHistory() {
  const key = _gcTab === 'player' ? 'player' : 'map';
  _gcHistory[key] = [];
  localStorage.removeItem(`su_gc_hist_${key==='player'?'p':'m'}`);
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

function _ldSaveNames(val) { localStorage.setItem('su_ld_names', val); }
function _ldSaveItems(val) { localStorage.setItem('su_ld_items', val); }

function _ldBuildLadder(names, items) {
  const n = names.length;
  const rowCount = Math.max(8, n * 3);
  const rungs = [];
  for (let row = 1; row < rowCount; row++) {
    let lastCol = -2;
    for (let col = 0; col < n - 1; col++) {
      if (col > lastCol + 1 && Math.random() < 0.45) {
        rungs.push({ row, col });
        lastCol = col;
      }
    }
  }
  return { n, rowCount, names: [...names], items: [...items], rungs };
}

function _ldGetPath(nameIdx, ladder, colX, rowY) {
  let col = nameIdx;
  const pts = [{ x: colX(col), y: rowY(0) }];
  for (let row = 1; row < ladder.rowCount; row++) {
    const y = rowY(row);
    const rRight = ladder.rungs.find(r => r.row === row && r.col === col);
    const rLeft  = ladder.rungs.find(r => r.row === row && r.col === col - 1);
    pts.push({ x: colX(col), y });
    if (rRight)     { col++; pts.push({ x: colX(col), y }); }
    else if (rLeft) { col--; pts.push({ x: colX(col), y }); }
  }
  pts.push({ x: colX(col), y: rowY(ladder.rowCount) });
  return { pts, resultCol: col };
}

function _ldRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function _ldDrawCanvas(ladder, highlightPts, animProgress) {
  const canvas = document.getElementById('ld-canvas');
  if (!canvas || !ladder) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const n = ladder.n;
  const padTop = 50, padBot = 55;
  const lineTop = padTop, lineBot = H - padBot;
  const lineH = lineBot - lineTop;
  const spacing = n > 1 ? (W - 60) / (n - 1) : W - 60;
  const padX = 30;
  const colX  = i => padX + i * spacing;
  const rowY  = r => lineTop + (r / ladder.rowCount) * lineH;
  const bw    = Math.min(spacing * 0.85, 72);
  const bh    = 28;
  const fSize = Math.max(10, Math.min(14, Math.round(bw * 0.22)));

  ctx.clearRect(0, 0, W, H);

  // 세로 줄
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e2e8f0';
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(colX(i), lineTop);
    ctx.lineTo(colX(i), lineBot);
    ctx.stroke();
  }

  // 가로 줄 (런그)
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  for (const rung of ladder.rungs) {
    const y = rowY(rung.row);
    ctx.beginPath();
    ctx.moveTo(colX(rung.col), y);
    ctx.lineTo(colX(rung.col + 1), y);
    ctx.stroke();
  }

  const COLORS = ['#FF4B6E','#a78bfa','#34d399','#fbbf24','#60a5fa','#f472b6','#fb923c','#a3e635','#e879f9','#38bdf8'];

  // 이름 박스 (상단)
  for (let i = 0; i < n; i++) {
    const x = colX(i);
    ctx.fillStyle = COLORS[i % COLORS.length];
    _ldRoundRect(ctx, x - bw/2, 5, bw, bh, 7);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(_ldFitText(ctx, ladder.names[i], bw - 8), x, 5 + bh / 2);
  }

  // 결과 박스 (하단)
  for (let i = 0; i < n; i++) {
    const x = colX(i);
    const y = H - padBot + 10;
    ctx.fillStyle = '#f1f5f9';
    _ldRoundRect(ctx, x - bw/2, y, bw, bh, 7);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    _ldRoundRect(ctx, x - bw/2, y, bw, bh, 7);
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.font = `bold ${fSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(_ldFitText(ctx, ladder.items[i], bw - 8), x, y + bh / 2);
  }

  // 경로 하이라이트
  if (highlightPts && highlightPts.length >= 2) {
    let totalLen = 0;
    for (let i = 1; i < highlightPts.length; i++) {
      const dx = highlightPts[i].x - highlightPts[i-1].x;
      const dy = highlightPts[i].y - highlightPts[i-1].y;
      totalLen += Math.sqrt(dx*dx + dy*dy);
    }
    const drawLen = totalLen * (animProgress == null ? 1 : animProgress);
    let rem = drawLen;
    ctx.beginPath();
    ctx.moveTo(highlightPts[0].x, highlightPts[0].y);
    ctx.strokeStyle = '#FF4B6E';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < highlightPts.length && rem > 0; i++) {
      const dx = highlightPts[i].x - highlightPts[i-1].x;
      const dy = highlightPts[i].y - highlightPts[i-1].y;
      const segLen = Math.sqrt(dx*dx + dy*dy);
      if (rem >= segLen) {
        ctx.lineTo(highlightPts[i].x, highlightPts[i].y);
        rem -= segLen;
      } else {
        const t = rem / segLen;
        ctx.lineTo(highlightPts[i-1].x + dx*t, highlightPts[i-1].y + dy*t);
        rem = 0;
      }
    }
    ctx.stroke();
  }
}

function _ldFitText(ctx, text, maxW) {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s + '…';
}

function _ldInit() {
  const canvas = document.getElementById('ld-canvas');
  if (!canvas) return;
  if (_ldAnimId2) { cancelAnimationFrame(_ldAnimId2); _ldAnimId2 = null; }
  _ldAnimating = false;

  const namesText = localStorage.getItem('su_ld_names') || '';
  const itemsText = localStorage.getItem('su_ld_items') || '';
  const names = namesText.split(',').map(v=>v.trim()).filter(v=>v);
  const items = itemsText.split(',').map(v=>v.trim()).filter(v=>v);

  const ctx = canvas.getContext('2d');

  if (names.length < 2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('참가자를 2명 이상 입력하세요', canvas.width/2, canvas.height/2);
    return;
  }

  const n = names.length;
  const normItems = Array.from({length: n}, (_, i) => items[i] || `${i+1}번`);

  if (!_ldLadder || _ldLadder.n !== n) {
    _ldLadder = _ldBuildLadder(names, normItems);
  } else {
    _ldLadder.names = [...names];
    _ldLadder.items = [...normItems];
  }

  _ldDrawCanvas(_ldLadder, null, null);
  _ldRefreshHistory();

  canvas.onclick = null;
  canvas.onclick = (e) => {
    if (_ldAnimating) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top)  * scaleY;
    if (cy > 50) return;
    const n2 = _ldLadder.n;
    const spacing2 = n2 > 1 ? (canvas.width - 60) / (n2 - 1) : canvas.width - 60;
    const bw2 = Math.min(spacing2 * 0.85, 72);
    for (let i = 0; i < n2; i++) {
      const bx = 30 + i * spacing2;
      if (cx >= bx - bw2/2 && cx <= bx + bw2/2) {
        _ldAnimate(i);
        break;
      }
    }
  };
}

function _ldRebuild() {
  _ldLadder = null; // 강제 초기화 → _ldInit에서 새 사다리 빌드 + onclick 재등록
  _ldInit();
}

function _ldAnimate(nameIdx) {
  if (!_ldLadder || _ldAnimating) return;
  const canvas = document.getElementById('ld-canvas');
  if (!canvas) return;

  const W = canvas.width, H = canvas.height;
  const n = _ldLadder.n;
  const padTop = 50, padBot = 55;
  const lineTop = padTop, lineBot = H - padBot;
  const lineH = lineBot - lineTop;
  const spacing = n > 1 ? (W - 60) / (n - 1) : W - 60;
  const colX = i => 30 + i * spacing;
  const rowY = r => lineTop + (r / _ldLadder.rowCount) * lineH;

  const { pts, resultCol } = _ldGetPath(nameIdx, _ldLadder, colX, rowY);

  let totalLen = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
    totalLen += Math.sqrt(dx*dx + dy*dy);
  }
  const duration = Math.max(900, Math.min(2200, totalLen * 1.6));
  const startTime = performance.now();
  _ldAnimating = true;

  const rc = document.getElementById('ld-result-card');
  if (rc) rc.style.display = 'none';
  const instr = document.getElementById('ld-instruction');
  if (instr) instr.textContent = '⏳ 이동 중...';

  // 자동 입력창 접기
  if (_gcInputOpen) _gcToggleInput();

  function frame(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    _ldDrawCanvas(_ldLadder, pts, progress);
    if (progress < 1) {
      _ldAnimId2 = requestAnimationFrame(frame);
    } else {
      _ldAnimating = false;
      _ldAnimId2 = null;
      if (instr) instr.textContent = '이름을 클릭하면 사다리를 타요!';

      const resName = _ldLadder.names[nameIdx];
      const resItem = _ldLadder.items[resultCol];

      if (rc) {
        document.getElementById('ld-res-name').textContent = resName;
        document.getElementById('ld-res-item').textContent = resItem;
        rc.style.display = 'block';
        rc.style.animation = 'none';
        void rc.offsetWidth;
        rc.style.animation = 'gcCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)';
      }

      // 기록 저장
      const now2 = new Date();
      const timeStr = String(now2.getHours()).padStart(2,'0') + ':' + String(now2.getMinutes()).padStart(2,'0');
      _gcHistory.ladder.push({ name: resName, item: resItem, time: timeStr });
      localStorage.setItem('su_gc_hist_l', JSON.stringify(_gcHistory.ladder));
      _ldRefreshHistory();

      // 효과음
      if (!_gcAudioCtx) _gcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (_gcAudioCtx.state === 'suspended') _gcAudioCtx.resume();
      [0, 0.08, 0.16, 0.27].forEach((t, i) => {
        setTimeout(() => {
          const o = _gcAudioCtx.createOscillator(), g = _gcAudioCtx.createGain();
          o.type = 'sine'; o.frequency.value = [523,659,784,1047][i];
          g.gain.setValueAtTime(0.18, _gcAudioCtx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.01, _gcAudioCtx.currentTime + 0.25);
          o.connect(g); g.connect(_gcAudioCtx.destination);
          o.start(); o.stop(_gcAudioCtx.currentTime + 0.25);
        }, t * 1000);
      });
    }
  }
  requestAnimationFrame(frame);
}

function _ldRefreshHistory() {
  const hist = _gcHistory.ladder;
  const container = document.getElementById('ld-hist-box');
  if (!container) return;
  const fs  = Math.max(12, Math.round(window._GC_DOME * 0.07));
  const pad = Math.max(12, Math.round(window._GC_DOME * 0.08));
  if (!hist.length) { container.innerHTML = ''; return; }
  container.style.cssText = `background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-top:${Math.round(pad*0.5)}px`;
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:${fs}px;font-weight:700;color:var(--text2)">📋 결과 기록 (${hist.length})</span>
      <button onclick="_ldClearHistory()" style="font-size:${Math.max(10,fs-2)}px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;max-height:180px;overflow-y:auto">
      ${hist.slice().reverse().map((r,i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--surface);border-radius:8px;font-size:${fs}px">
        <span style="color:var(--text3);min-width:18px;text-align:right">${hist.length-i}</span>
        <span style="font-weight:700;color:#FF4B6E">${r.name}</span>
        <span style="color:var(--text3)">→</span>
        <span style="font-weight:700;flex:1;color:var(--text1)">${r.item}</span>
        <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px">${r.time}</span>
      </div>`).join('')}
    </div>`;
}

function _ldClearHistory() {
  _gcHistory.ladder = [];
  localStorage.removeItem('su_gc_hist_l');
  _ldRefreshHistory();
}

function _mbInit() {
  const root = document.getElementById('mb-root');
  if (!root) return;
  root.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3)">마블 룰렛 기능은 현재 개발 중입니다.</div>';
}

