/* ══════════════════════════════════════════════════════════════
   선수(전체) - 포커스 카드 뷰 (players-streamer-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _buildFocusCardDetail(selected, opts){
  const { selUniv, selColor, selWin, selLoss, selGames, selWr, selAttr, selHistAll, heroPhoto2Pos } = opts;
  const photoSrcOrig = selected.photo ? toHttpsUrl(selected.photo) : '';
  const photoSrc = selected.photo ? toScaledUrl(selected.photo, 320) : '';
  const photo2SrcOrig = String(selected.secondProfileFile||'').trim() ? toHttpsUrl(String(selected.secondProfileFile||'').trim()) : '';
  const _photo2Raw = String(selected.secondProfileFile||'').trim();
  const _photo2IsGif = /\.gif(\?|$)/i.test(_photo2Raw);
  // gif는 toScaledUrl(webp변환 프록시)을 거치면 정지 이미지가 되므로 원본 URL을 그대로 사용
  const photo2Src = _photo2Raw ? (_photo2IsGif ? toHttpsUrl(_photo2Raw) : toScaledUrl(_photo2Raw, 720)) : '';
  const photo2Pos = heroPhoto2Pos || 'center center';
  const _p2XNow = (()=>{ const n=Number(selected.photo2PosX); return Number.isFinite(n) ? Math.round(Math.max(0,Math.min(100,n))) : 50; })();
  const _p2YNow = (()=>{ const n=Number(selected.photo2PosY); return Number.isFinite(n) ? Math.round(Math.max(0,Math.min(100,n))) : 50; })();
  const _globalAutoFitOn = (typeof totalFocusCard2AutoFit!=='undefined' ? totalFocusCard2AutoFit : true);
  // 개인별 수동 위치 오버라이드 전용 플래그. photo2PosUse는 선수 편집창의 '위치 고정' 체크박스와
  // 공용으로 쓰이며 기본값이 true라서 재사용하면 안 됨 (거의 모든 스트리머가 수동으로 잡혀버림).
  // ▲▼로 실제 조정했을 때만 photo2CardAutoManual이 true가 되므로, 기본값은 항상 '전역 자동'을 따름.
  const _manualOverride = selected.photo2CardAutoManual === true;
  const _autoFitOn = _globalAutoFitOn && !_manualOverride;
  const _showPosNudge = isLoggedIn && photo2Src;
  const raceLabel = selected.race==='P'?'프로토스':selected.race==='T'?'테란':selected.race==='Z'?'저그':'미정';
  let _fMvpStats=null;
  try{ _fMvpStats = (typeof _b2GetPlayerMvpStats==='function') ? _b2GetPlayerMvpStats(selected.name) : null; }catch(e){}
  const _fMvpParts=[];
  if(_fMvpStats){
    if(_fMvpStats.weekCount) _fMvpParts.push(`주간 ${_fMvpStats.weekCount}회`);
    if(_fMvpStats.monthCount) _fMvpParts.push(`월간 ${_fMvpStats.monthCount}회`);
  }
  const rows = [
    ['역할', selected.role || '일반'],
    ['티어', selected.tier ? `${selected.tier}티어` : '미정'],
    ['종족', raceLabel],
    ['소속대학', selUniv || '무소속'],
    ['전적', selGames ? `${selWin}승 ${selLoss}패` : '기록 없음'],
    ['승률', selWr==null ? '-' : `${selWr}%`],
    ..._fMvpParts.length ? [['🏆 MVP', _fMvpParts.join(' · ')]] : []
  ];
  return `<div class="streamer-focus-main">
    <div class="streamer-focus-card2">
      <div class="streamer-focus-card2-photo${photo2Src?' ph-swap':''}">
        ${photoSrc ? `<img src="${photoSrc}" data-orig="${photoSrcOrig}" alt="${selected.name}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex';}">` : ''}
        <div class="streamer-focus-photo-fallback" style="display:${photoSrc?'none':'flex'}">${selected.race||'?'}</div>
        ${photo2Src && typeof _phSwap2ndHTML==='function' ? _phSwap2ndHTML(String(selected.secondProfileFile||'').trim()) : ''}
      </div>
      <div class="streamer-focus-card2-info">
        <div class="streamer-focus-card2-name">${selected.name}${genderIcon(selected.gender)}</div>
        ${rows.map(([label,value])=>`
          <div class="streamer-focus-card2-row">
            <span class="streamer-focus-card2-label">${label}</span>
            <span class="streamer-focus-card2-value">${value}</span>
          </div>`).join('')}
        <div class="streamer-focus-card2-actions">
          <button class="pill on" data-tp-action="open-player" data-tp-player="${selAttr}" style="border:none;background:${selColor}">상세 열기</button>
          ${isLoggedIn ? `<button class="pill" onclick="openEPFromModal('${(typeof escJS==='function'?escJS(selected.name):selected.name)}')">✏️ 수정</button>` : ''}
          ${_showPosNudge ? (
            _autoFitOn
              ? `<button type="button" class="pill" onclick="event.stopPropagation();_focusPhoto2EnableManual()" style="padding:3px 10px;font-size:var(--fs-caption)" title="아래 이미지를 마우스/터치로 드래그해 이 스트리머만의 위치를 직접 잡을 수 있습니다">🎯 위치 직접 조정</button>`
              : `<span class="pill" style="display:inline-flex;align-items:center;gap:0;padding:2px 4px" title="아래 사진을 드래그하면 위치가 바로 바뀝니다. 화살표는 1%씩 미세 조정용이고, 변경 즉시 저장됩니다.">
                  <button type="button" onclick="event.stopPropagation();_nudgeFocusPhoto2(-4,0)" style="border:none;background:transparent;cursor:pointer;font-size:var(--fs-sm);padding:3px 6px;line-height:1;color:inherit" title="왼쪽으로">◀</button>
                  <span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1">
                    <button type="button" onclick="event.stopPropagation();_nudgeFocusPhoto2(0,-4)" style="border:none;background:transparent;cursor:pointer;font-size:var(--fs-caption);padding:0 6px 1px;line-height:1.3;color:inherit" title="위로">▲</button>
                    <button type="button" onclick="event.stopPropagation();_nudgeFocusPhoto2(0,4)" style="border:none;background:transparent;cursor:pointer;font-size:var(--fs-caption);padding:1px 6px 0;line-height:1.3;color:inherit" title="아래로">▼</button>
                  </span>
                  <button type="button" onclick="event.stopPropagation();_nudgeFocusPhoto2(4,0)" style="border:none;background:transparent;cursor:pointer;font-size:var(--fs-sm);padding:3px 6px;line-height:1;color:inherit" title="오른쪽으로">▶</button>
                  <span style="font-size:10px;font-weight:800;color:var(--text3);min-width:56px;text-align:center;padding:0 3px">X${_p2XNow}·Y${_p2YNow}%</span>
                </span>
                 <button type="button" class="pill" onclick="event.stopPropagation();_focusPhoto2SetCenter()" style="padding:3px 8px;font-size:var(--fs-caption)" title="가로/세로 모두 가운데(50%)로 되돌립니다">가운데로</button>`
          ) : ''}
          ${(_showPosNudge && !_autoFitOn && _globalAutoFitOn && _manualOverride) ? `<button type="button" class="pill" onclick="event.stopPropagation();_resetFocusPhoto2ToAuto()" style="padding:3px 8px;font-size:var(--fs-caption)" title="이 스트리머만 전역 자동 배치로 되돌립니다">↺ 자동으로</button>` : ''}
        </div>
      </div>
    </div>
    ${photo2Src ? (
      _autoFitOn
        ? `<div class="streamer-focus-card2-photo2 is-autofit">
             <img class="sfc2p2-fg" src="${photo2Src}" data-orig="${photo2SrcOrig}" alt="${selected.name}" loading="eager" fetchpriority="high" decoding="async"
               onload="try{var r=this.naturalWidth/this.naturalHeight;if(!isFinite(r)||r<=0)r=16/9;r=Math.max(.68,Math.min(2.1,r));this.parentElement.style.aspectRatio=r;}catch(e){}"
               onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.parentElement.style.display='none';}">
           </div>`
        : `<div class="streamer-focus-card2-photo2${_showPosNudge?' is-manual':''}"${_showPosNudge?' data-focus-p2-drag="1" ondblclick="_focusPhoto2SetCenter()" title="드래그하면 위치가 바로 바뀝니다 (더블클릭 = 가운데로)"':''}>
             <img src="${photo2Src}" data-orig="${photo2SrcOrig}" alt="${selected.name}" loading="eager" fetchpriority="high" decoding="async" style="object-position:${photo2Pos}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.parentElement.style.display='none';}">
             ${_showPosNudge ? `
               <div class="sfp2-gridline-v" style="left:${_p2XNow}%"></div>
               <div class="sfp2-gridline-h" style="top:${_p2YNow}%"></div>
               <div class="sfp2-cross" style="left:${_p2XNow}%;top:${_p2YNow}%"></div>
               <div class="sfp2-badge">${_p2XNow}% · ${_p2YNow}%</div>
               <div class="sfp2-hint">드래그해서 위치 조정</div>
             ` : ''}
           </div>`
    ) : ''}
  </div>`;
}

// 상세형(리스트) 하단 이미지2 위치를 화살표로 1%씩 미세 조정 + 즉시 저장 (관리자 전용, 수동위치 모드에서만 노출)
function _nudgeFocusPhoto2(dx, dy){
  try{
    const p = (typeof players!=='undefined' ? players : []).find(x=>x && x.name===totalFocusPlayer);
    if(!p) return;
    const curX = Number.isFinite(Number(p.photo2PosX)) ? Number(p.photo2PosX) : 50;
    const curY = Number.isFinite(Number(p.photo2PosY)) ? Number(p.photo2PosY) : 50;
    p.photo2PosX = Math.max(0, Math.min(100, Math.round(curX + dx)));
    p.photo2PosY = Math.max(0, Math.min(100, Math.round(curY + dy)));
    p.photo2CardAutoManual = true; // 이 스트리머만 수동 위치로 전환 (전역 자동 설정과 무관하게 개인별로 저장됨)
    if(typeof save==='function') save();
    if(typeof render==='function') render();
  }catch(e){ console.error('[_nudgeFocusPhoto2]', e); }
}

// "🎯 위치 직접 조정" 버튼 → 기존 값(없으면 기본값)을 그대로 유지한 채 수동 모드로 진입, 이후 드래그/화살표로 조정
function _focusPhoto2EnableManual(){
  try{
    const p = (typeof players!=='undefined' ? players : []).find(x=>x && x.name===totalFocusPlayer);
    if(!p) return;
    if(!Number.isFinite(Number(p.photo2PosX))) p.photo2PosX = 50;
    if(!Number.isFinite(Number(p.photo2PosY))) p.photo2PosY = 32;
    p.photo2CardAutoManual = true;
    if(typeof save==='function') save();
    if(typeof render==='function') render();
  }catch(e){ console.error('[_focusPhoto2EnableManual]', e); }
}

// 이미지2 위치를 정가운데(50%·50%)로 즉시 초기화
function _focusPhoto2SetCenter(){
  try{
    const p = (typeof players!=='undefined' ? players : []).find(x=>x && x.name===totalFocusPlayer);
    if(!p) return;
    p.photo2PosX = 50;
    p.photo2PosY = 50;
    p.photo2CardAutoManual = true;
    if(typeof save==='function') save();
    if(typeof render==='function') render();
  }catch(e){ console.error('[_focusPhoto2SetCenter]', e); }
}

// 개인별 수동 위치 오버라이드를 해제하고, 전역 자동/수동 설정을 다시 따르게 합니다.
function _resetFocusPhoto2ToAuto(){
  try{
    const p = (typeof players!=='undefined' ? players : []).find(x=>x && x.name===totalFocusPlayer);
    if(!p) return;
    p.photo2CardAutoManual = false;
    if(typeof save==='function') save();
    if(typeof render==='function') render();
  }catch(e){ console.error('[_resetFocusPhoto2ToAuto]', e); }
}

// 상세형 이미지2 미리보기를 마우스/터치로 직접 드래그해 위치를 잡는 기능.
// DOM이 render()마다 새로 그려지므로 document에 위임 바인딩(최초 1회)해 항상 동작하게 함.
// 드래그 중에는 화면만 즉시 갱신(리렌더 없음)하고, 손을 뗄 때 한 번만 저장 + 리렌더합니다.
function _bindFocusPhoto2DragEvents(){
  if(typeof document==='undefined') return;
  if(window.__focusP2DragBound) return;
  window.__focusP2DragBound = true;
  document.addEventListener('pointerdown', (ev)=>{
    const box = ev.target && ev.target.closest ? ev.target.closest('[data-focus-p2-drag]') : null;
    if(!box) return;
    ev.preventDefault();
    const img = box.querySelector('img');
    const cross = box.querySelector('.sfp2-cross');
    const glV = box.querySelector('.sfp2-gridline-v');
    const glH = box.querySelector('.sfp2-gridline-h');
    const badge = box.querySelector('.sfp2-badge');
    const apply = (e)=>{
      const r = box.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, Math.round((e.clientX - r.left) / Math.max(1, r.width) * 100)));
      const y = Math.max(0, Math.min(100, Math.round((e.clientY - r.top) / Math.max(1, r.height) * 100)));
      if(img) img.style.objectPosition = `${x}% ${y}%`;
      if(cross){ cross.style.left = x+'%'; cross.style.top = y+'%'; }
      if(glV) glV.style.left = x+'%';
      if(glH) glH.style.top = y+'%';
      if(badge) badge.textContent = `${x}% · ${y}%`;
      box.dataset.px = String(x);
      box.dataset.py = String(y);
    };
    try{ box.setPointerCapture(ev.pointerId); }catch(_){}
    apply(ev);
    const mv = (e)=>apply(e);
    const up = ()=>{
      try{ box.removeEventListener('pointermove', mv); }catch(_){}
      try{ box.removeEventListener('pointerup', up); }catch(_){}
      try{ box.removeEventListener('pointercancel', up); }catch(_){}
      const x = Number(box.dataset.px), y = Number(box.dataset.py);
      if(!Number.isFinite(x) || !Number.isFinite(y)) return;
      try{
        const p = (typeof players!=='undefined' ? players : []).find(pl=>pl && pl.name===totalFocusPlayer);
        if(!p) return;
        p.photo2PosX = x;
        p.photo2PosY = y;
        p.photo2CardAutoManual = true;
        if(typeof save==='function') save();
        if(typeof render==='function') render();
      }catch(e){ console.error('[_bindFocusPhoto2DragEvents:up]', e); }
    };
    box.addEventListener('pointermove', mv);
    box.addEventListener('pointerup', up);
    box.addEventListener('pointercancel', up);
  });
}

function _buildFocusView(rankMap){
  if (window.TabVis && typeof window.TabVis.visible === 'function' && !window.TabVis.visible('total.mode.focus.' + totalFocusDetailStyle)) {
    totalFocusDetailStyle = window.TabVis.visible('total.mode.focus.hero') ? 'hero' : 'card';
    try{ localStorage.setItem('su_focus_detail_style', totalFocusDetailStyle); }catch(e){}
  }
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : [];
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_getUnivs) return `<div class="streamer-content-card"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">스트리머 데이터를 불러오는 중입니다.</div></div></div>`;
  const visible = _pl.filter(p=>{
    if(!p || p.retired) return false;
    if(totalRaceFilter!=='전체' && p.race!==totalRaceFilter) return false;
    if(totalGenderFilter!=='전체' && p.gender!==totalGenderFilter) return false;
    if(totalUnivFilter && String(p.univ||'').trim()!==totalUnivFilter) return false;
    if(totalHideNoRecord && (Number(p.win||0)+Number(p.loss||0))<=0) return false;
    return true;
  });
  const focusPool = visible.length ? visible : _pl.filter(Boolean);
  if(!focusPool.length){
    return `<div class="streamer-content-card"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">표시할 스트리머가 없습니다.</div></div></div>`;
  }
  if(!focusPool.some(p=>p.name===totalFocusPlayer)){
    const withPhoto = focusPool.filter(p=>String(p.photo||'').trim());
    const seedPool = withPhoto.length ? withPhoto : focusPool;
    totalFocusPlayer = (seedPool[Math.floor(Math.random() * seedPool.length)] || {}).name || '';
  }
  const selected = focusPool.find(p=>p.name===totalFocusPlayer) || focusPool[0];
  if(selected) totalFocusPlayer = selected.name;
  const groups = new Map();
  focusPool.forEach(p=>{
    const key = p.univ || '무소속';
    if(groups.has(key)) groups.get(key).push(p);
    else groups.set(key,[p]);
  });
  const orderedUnivs = (_getUnivs().filter(u=>isLoggedIn||!u.hidden).map(u=>u.name)).concat('무소속');
  let listHtml = '<div class="streamer-focus-list">';
  let _fRowIdx=0;
  orderedUnivs.forEach(univName=>{
    const members = groups.get(univName);
    if(!members || !members.length) return;
    const u = (typeof getAllUnivs === 'function' ? getAllUnivs().find(x=>x.name===univName) : null) || { name:univName, color:'#64748b' };
    const color = u.color || '#64748b';
    listHtml += `<section class="streamer-focus-group">
      <div class="streamer-focus-group-title" data-focus-univ-header="${u.name}" style="background:linear-gradient(135deg,${color},color-mix(in srgb, ${color} 68%, #ffffff))">
        <span style="display:inline-flex;align-items:center;gap:6px">${u.name && u.name!=='무소속' ? gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','18px'):'18px')) : '🏷️'}<span class="${u.name&&u.name!=='무소속'?'clickable-univ':''}" ${u.name&&u.name!=='무소속'?`onclick="event.stopPropagation();openUnivModal('${u.name.replace(/'/g,"\\'")}')"`:''}>${u.name}</span></span>
        <span style="font-size:var(--fs-caption);color:rgba(255,255,255,.82)">${members.length}명</span>
      </div>`;
    const sorted = [...members].sort((a,b)=>getRoleOrder(a.role,a)-getRoleOrder(b.role,b)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
    listHtml += `<div class="streamer-focus-card-grid">`;
    sorted.forEach(p=>{
      const win = Number(p.win||0);
      const loss = Number(p.loss||0);
      const games = win + loss;
      const wr = games ? Math.round(win/games*100) : null;
      const actMeta = _getStreamerActivityMeta(p);
      const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const q=`${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      const photoSrc = String(p.photo||'').trim();
      const _isActive = !!(selected && selected.name===p.name);
      _fRowIdx++;
      const _fImgLoadAttr = _fRowIdx<=10 ? 'loading="eager" fetchpriority="high"' : 'loading="eager" fetchpriority="low"';
      listHtml += `<div class="streamer-focus-card ${_isActive?'active':''} ${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim())?'ph-swap':''}" data-focus-row="1" data-focus-name="${(typeof escAttr==='function'?escAttr(p.name):p.name)}" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}" onclick="try{var _sl=document.querySelector('.streamer-focus-list');if(_sl)window._streamerFocusScrollTop=_sl.scrollTop;}catch(e){};totalFocusPlayer='${_pSafe}';render()">
        ${photoSrc ? `<img ${_fImgLoadAttr} decoding="async" src="${toScaledUrl(photoSrc,320)}" data-orig="${toHttpsUrl(photoSrc)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="_thumbFallback(this)">` : ''}
        <div class="streamer-focus-card-fallback" style="display:${photoSrc?'none':'flex'}">${p.race||'?'}</div>
        ${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim()&&typeof _phSwap2ndHTML==='function')?_phSwap2ndHTML(p.secondProfileFile):''}
        ${_isActive ? `<span class="streamer-focus-card-check">✓</span>` : ''}
        ${(isLoggedIn && p.photo2CardAutoManual===true) ? `<span class="streamer-focus-card-pin" title="이미지2 위치가 수동으로 지정된 스트리머입니다">📌</span>` : ''}
        <div class="streamer-focus-card-bottom">
          <div class="streamer-focus-card-name" title="${p.name}">${p.name}${genderIcon(p.gender)}</div>
          <div class="streamer-focus-card-sub">${p.role||'일반'} · ${p.tier||'?'}T · ${p.race||'?'}</div>
          <div class="streamer-focus-card-sub">${actMeta.label?`${actMeta.label} · `:''}${games?`${win}-${loss} · ${wr}%`:'기록 없음'}</div>
        </div>
      </div>`;
    });
    listHtml += `</div>`;
    listHtml += `</section>`;
  });
  listHtml += '</div>';
  const selWin = Number(selected.win||0);
  const selLoss = Number(selected.loss||0);
  const selGames = selWin + selLoss;
  const selWr = selGames ? Math.round(selWin/selGames*100) : null;
  const selElo = Number(selected.elo||ELO_DEFAULT);
  const selPoints = Number(selected.points||0);
  const selAct = _getStreamerActivityMeta(selected);
  const selHistAll = _tpHistAllForPlayer(selected);
  const selHistSorted = [...selHistAll].sort((a,b)=>_tpDateNum(b?.date)-_tpDateNum(a?.date)||(Number(b?.time||0)-Number(a?.time||0)));
  const lastRec = selHistSorted[0] || null;
  const lastMatch = lastRec ? (lastRec.date || '') : '';
  const selUniv = selected.univ || '무소속';
  const selColor = (typeof gc==='function' ? gc(selUniv) : '#2563eb') || '#2563eb';
  const selAttr = (typeof escAttr==='function')
    ? escAttr(String(selected.name||'').replace(/[\r\n]+/g,' '))
    : String(selected.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
  const recentList = selHistSorted.slice(0, 10);
  const recentDesc = recentList.length
    ? `<div style="display:flex;flex-direction:column;gap:6px;max-height:260px;overflow:auto;padding-right:6px">${recentList.map(h=>{
        const d=String(h?.date||'').trim();
        const r=String(h?.result||'-').trim();
        const opp=String(h?.opp||'').trim();
        const mode=String(h?.mode||'').trim();
        const map=String(h?.map||'').trim();
        const left = `${d||'-'} · ${r}${opp?` vs ${opp}`:''}`;
        const right = `${mode||''}${map?` · ${map}`:''}`;
        return `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
          <span style="font-weight:800;color:var(--text2)">${left}</span>
          <span style="color:var(--text3);white-space:nowrap">${right}</span>
        </div>`;
      }).join('')}</div>`
    : '최근 기록이 아직 없습니다.';
  const _7agoN = _tpDaysAgoNum(7);
  const _30agoN = _tpDaysAgoNum(30);
  const _c7 = selHistAll.filter(h=>_tpDateNum(h?.date) >= _7agoN).length;
  const _c30 = selHistAll.filter(h=>_tpDateNum(h?.date) >= _30agoN).length;
  const heroPhotoOrig = selected.photo ? toHttpsUrl(selected.photo).replace(/'/g,'%27').replace(/"/g,'%22') : '';
  const heroPhotoUrl = selected.photo ? toScaledUrl(selected.photo, 200).replace(/'/g,'%27').replace(/"/g,'%22') : '';
  const heroPhotoUrl2Src = String(selected.secondProfileFile||'').trim();
  const _heroP2IsGif = /\.gif(\?|$)/i.test(heroPhotoUrl2Src);
  const heroPhotoUrl2 = heroPhotoUrl2Src ? (_heroP2IsGif ? toHttpsUrl(heroPhotoUrl2Src).replace(/'/g,'%27').replace(/"/g,'%22') : toScaledUrl(heroPhotoUrl2Src, 200).replace(/'/g,'%27').replace(/"/g,'%22')) : '';
  try{ if(heroPhotoUrl2Src && typeof prewarmImageUrls==='function') prewarmImageUrls([heroPhotoUrl2Src], 1, 200, 'scaled'); }catch(e){}
  const heroPhoto2Use = (selected.photo2PosUse !== false);
  const heroPhoto2PosX = Number(selected.photo2PosX), heroPhoto2PosY = Number(selected.photo2PosY);
  const heroPhoto2Pos = (heroPhoto2Use && Number.isFinite(heroPhoto2PosX) && Number.isFinite(heroPhoto2PosY)) ? `${heroPhoto2PosX}% ${heroPhoto2PosY}%` : 'center 32%';
  const detailHtml = (totalFocusDetailStyle === 'card')
    ? _buildFocusCardDetail(selected, { selUniv, selColor, selWin, selLoss, selGames, selWr, selAttr, selHistAll, heroPhoto2Pos })
    : `<div class="streamer-focus-main">
    <div class="streamer-focus-main-hero" style="background:linear-gradient(135deg,color-mix(in srgb, ${selColor} 28%, #0f172a),${selColor})">
      ${heroPhotoUrl ? `<div class="streamer-focus-hero-bg" style="background-image:url('${heroPhotoUrl}')"></div>` : ''}
      ${(heroPhotoUrl2 || heroPhotoUrl) ? `<div class="streamer-focus-hero-bg2" style="background-image:url('${heroPhotoUrl2 || heroPhotoUrl}');--hero-bg2-op:${heroPhotoUrl2 ? '.11' : '.05'};--hero-bg2-pos:${heroPhotoUrl2 ? heroPhoto2Pos : 'top center'};--hero-bg2-left:${heroPhotoUrl2 ? '46%' : '54%'};--hero-bg2-scale:${heroPhotoUrl2 ? '1.02' : '1.05'}"></div>` : ''}
      <div class="streamer-focus-photo${heroPhotoUrl2Src?' ph-swap':''}">
        ${selected.photo ? `<img src="${toScaledUrl(selected.photo,480)}" data-orig="${heroPhotoOrig}" alt="${selected.name}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';}">` : ''}
        <div class="streamer-focus-photo-fallback" style="display:${selected.photo?'none':'flex'}">${selected.race||'?'}</div>
        ${heroPhotoUrl2Src && typeof _phSwap2ndHTML==='function' ? _phSwap2ndHTML(heroPhotoUrl2Src) : ''}
      </div>
      <div class="streamer-focus-copy">
        <div class="streamer-focus-title">${selected.name}${genderIcon(selected.gender)}</div>
        <div class="streamer-focus-chips">
          ${selected.role ? `<span class="streamer-focus-chip">${selected.role}</span>` : ''}
          <span class="streamer-focus-chip">${selected.tier||'?'}티어</span>
          <span class="streamer-focus-chip">${selected.race==='P'?'프로토스':selected.race==='T'?'테란':selected.race==='Z'?'저그':'종족 미정'}</span>
          <span class="streamer-focus-chip ${selUniv&&selUniv!=='무소속'?'clickable-univ':''}" ${selUniv&&selUniv!=='무소속'?`onclick="event.stopPropagation();openUnivModal('${selUniv.replace(/'/g,"\\'")}')"`:''}>${selUniv}</span>
          ${selAct.label ? `<span class="streamer-focus-chip">${selAct.label}</span>` : ''}
          ${getStatusIconHTML(selected.name)}
        </div>
        <div class="streamer-focus-desc">${selUniv} 소속으로 현재 ${selGames ? `${selGames}전 ${selWin}승 ${selLoss}패` : '공식 기록이 아직 없고'}${selWr==null ? '' : `, 승률 ${selWr}%`} 상태입니다.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="pill on" data-tp-action="open-player" data-tp-player="${selAttr}" style="border:none">상세 열기</button>
          ${isLoggedIn ? `<button class="pill" onclick="openEPFromModal('${(typeof escJS==='function'?escJS(selected.name):selected.name)}')">✏️ 수정</button>` : ''}
        </div>
      </div>
    </div>
    <div class="streamer-focus-statgrid">
      <div class="streamer-focus-stat"><div class="streamer-focus-stat-label">전적</div><div class="streamer-focus-stat-value">${selGames ? `${selWin}승 ${selLoss}패` : '기록 없음'}</div></div>
      <div class="streamer-focus-stat"><div class="streamer-focus-stat-label">승률</div><div class="streamer-focus-stat-value" style="color:${selWr==null?'var(--text1)':selWr>=50?'#16a34a':'#dc2626'}">${selWr==null?'-':`${selWr}%`}</div></div>
      <div class="streamer-focus-stat"><div class="streamer-focus-stat-label">포인트</div><div class="streamer-focus-stat-value">${pS(selPoints)}</div></div>
      <div class="streamer-focus-stat"><div class="streamer-focus-stat-label">ELO</div><div class="streamer-focus-stat-value" style="color:${selElo>=ELO_DEFAULT?'#2563eb':'#dc2626'}">${selElo}</div></div>
    </div>
    <div class="streamer-focus-note-grid">
      <div class="streamer-focus-note">
        <div class="streamer-focus-note-title">최근 기록</div>
        <div class="streamer-focus-note-desc">${recentDesc}</div>
      </div>
      <div class="streamer-focus-note">
        <div class="streamer-focus-note-title">활동 상태</div>
        <div class="streamer-focus-note-desc">${selAct.title}<br>최근 7일 · ${_c7}회 / 최근 30일 · ${_c30}회${lastMatch ? `<br>마지막 기록일 · ${lastMatch}` : ''}</div>
      </div>
    </div>
  </div>`;
  return `<div class="streamer-focus-layout">
    <aside class="streamer-focus-sidebar">
      <div class="streamer-focus-section-title" style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;row-gap:6px">
        <span>스트리머 선택</span>
        <span style="display:inline-flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">
          ${(!window.TabVis || typeof window.TabVis.visible !== 'function' || window.TabVis.visible('total.mode.focus.hero')) ? `<button class="pill ${totalFocusDetailStyle==='hero'?'on':''}" style="padding:4px 10px;font-size:var(--fs-caption);white-space:nowrap" onclick="totalFocusDetailStyle='hero';try{localStorage.setItem('su_focus_detail_style','hero');}catch(e){};render()" title="기본형">🖼️ 기본</button>` : ''}
          ${(!window.TabVis || typeof window.TabVis.visible !== 'function' || window.TabVis.visible('total.mode.focus.photo')) ? `<button class="pill ${totalFocusDetailStyle==='card'?'on':''}" style="padding:4px 10px;font-size:var(--fs-caption);white-space:nowrap" onclick="totalFocusDetailStyle='card';try{localStorage.setItem('su_focus_detail_style','card');}catch(e){};render()" title="사진+리스트형">📋 포토</button>` : ''}
        </span>
      </div>
      ${listHtml}
    </aside>
    ${detailHtml}
  </div>`;
}

