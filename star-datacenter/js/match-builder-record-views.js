/* ══════════════════════════════════════
   Match Builder Record Views
══════════════════════════════════════ */

function _safeHeadToHeadSideFx(leftHex, rightHex){
  try{
    if(typeof _getRecSideFxCfg!=='function') return '';
    const cfg = _getRecSideFxCfg();
    if(!cfg || !cfg.on) return '';
    const fx = (typeof _buildRecSideFxMetrics==='function') ? _buildRecSideFxMetrics(cfg) : null;
    const mode = fx ? fx.mode : 'soft';
    const a1 = fx ? fx.a1 : 0.18;
    const a2 = fx ? fx.a2 : 0.08;
    const ae = fx ? fx.aEdge : 0.28;
    const lr = (typeof _recFxHexToRgbStr==='function') ? _recFxHexToRgbStr(leftHex||'#3b82f6') : '59,130,246';
    const rr = (typeof _recFxHexToRgbStr==='function') ? _recFxHexToRgbStr(rightHex||'#ef4444') : '239,68,68';
    const L1 = fx ? fx.len : 25, L2 = fx ? fx.len2 : 11, L3 = fx ? fx.len3 : 18;
    const R1 = fx ? fx.lenR : 75, R2 = fx ? fx.len2R : 89, R3 = fx ? fx.len3R : 82;
    const lineW = fx ? fx.lineW : 8;
    const glowInset = fx ? fx.glowInset : 26;
    const glowBlur = fx ? fx.glowBlur : 34;
    const bandW = fx ? fx.bandW : 14;
    const frameW = fx ? fx.frameW : 3;
    const spot = fx ? fx.spotSize : 56;
    if(mode==='line'){
      return `background:
        linear-gradient(180deg, rgba(${lr},${a1.toFixed(3)}), rgba(${lr},${a2.toFixed(3)})) left center / ${lineW}px 100% no-repeat,
        linear-gradient(180deg, rgba(${rr},${a1.toFixed(3)}), rgba(${rr},${a2.toFixed(3)})) right center / ${lineW}px 100% no-repeat,
        var(--white);`;
    }
    if(mode==='glow'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${ae.toFixed(3)}) 100%),
        var(--white);
        box-shadow: inset ${glowInset}px 0 ${glowBlur}px rgba(${lr},${a1.toFixed(3)}), inset -${glowInset}px 0 ${glowBlur}px rgba(${rr},${a1.toFixed(3)});`;
    }
    if(mode==='panel'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0%, rgba(${lr},${a2.toFixed(3)}) ${L2}%, rgba(${lr},${a1.toFixed(3)}) ${L3}%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${a1.toFixed(3)}) ${R3}%, rgba(${rr},${a2.toFixed(3)}) ${R2}%, rgba(${rr},${ae.toFixed(3)}) 100%),
        var(--white);`;
    }
    if(mode==='ribbon'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0, rgba(${lr},${a2.toFixed(3)}) ${bandW}px, rgba(${lr},0) ${Math.round(bandW*1.8)}px, rgba(${rr},0) calc(100% - ${Math.round(bandW*1.8)}px), rgba(${rr},${a2.toFixed(3)}) calc(100% - ${bandW}px), rgba(${rr},${ae.toFixed(3)}) 100%),
        var(--white);`;
    }
    if(mode==='frame'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${a1.toFixed(3)}) 0%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${a1.toFixed(3)}) 100%),
        var(--white);
        box-shadow: inset ${frameW}px 0 0 rgba(${lr},${ae.toFixed(3)}), inset -${frameW}px 0 0 rgba(${rr},${ae.toFixed(3)}), inset 0 ${frameW}px 0 rgba(${lr},${a2.toFixed(3)}), inset 0 -${frameW}px 0 rgba(${rr},${a2.toFixed(3)});`;
    }
    if(mode==='spotlight'){
      return `background:
        radial-gradient(circle at left center, rgba(${lr},${ae.toFixed(3)}) 0, rgba(${lr},${a2.toFixed(3)}) ${Math.round(spot*0.42)}px, rgba(${lr},0) ${spot}px),
        radial-gradient(circle at right center, rgba(${rr},${ae.toFixed(3)}) 0, rgba(${rr},${a2.toFixed(3)}) ${Math.round(spot*0.42)}px, rgba(${rr},0) ${spot}px),
        var(--white);`;
    }
    return `background:
      linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0%, rgba(${lr},${a2.toFixed(3)}) ${L2}%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${a2.toFixed(3)}) ${R2}%, rgba(${rr},${ae.toFixed(3)}) 100%),
      var(--white);`;
  }catch(e){
    return '';
  }
}

function _rememberStableIndGj(kind, arr){
  try{
    // (버그픽스) 빈 배열도 캐시에 저장 — 삭제 후 전부 비었을 때 캐시가 갱신되지 않아 복원되던 문제 수정
    if(!Array.isArray(arr)) return;
    const key = kind === 'gj' ? '__lastGoodGjM' : '__lastGoodIndM';
    window[key] = arr.slice();
    // 유효한 삭제/변경 상태임을 플래그로 기록 (restore가 덮어쓰지 못하도록)
    window['__indGjCacheSet_' + kind] = true;
  }catch(e){}
}
function _restoreStableIndGj(kind){
  try{
    if(kind === 'ind'){
      if(Array.isArray(indM) && indM.length){
        _rememberStableIndGj('ind', indM);
        return;
      }
      // (버그픽스) 삭제로 인해 indM이 빈 배열이 된 경우에는 복원하지 않음
      // — 캐시가 이미 갱신된 상태(삭제 후)라면 복원을 건너뜀
      if(window.__indGjCacheSet_ind) return;
      const fromMem = Array.isArray(window.__lastGoodIndM) ? window.__lastGoodIndM : [];
      const fromLs = (typeof J==='function' ? (J('su_indm') || []) : []);
      const next = fromMem.length ? fromMem : (Array.isArray(fromLs) ? fromLs : []);
      if(Array.isArray(next) && next.length){
        indM = next.slice();
        try{ window.indM = indM; }catch(e){}
      }
      return;
    }
    if(Array.isArray(gjM) && gjM.length){
      _rememberStableIndGj('gj', gjM);
      return;
    }
    // (버그픽스) 삭제로 인해 gjM이 빈 배열이 된 경우에는 복원하지 않음
    if(window.__indGjCacheSet_gj) return;
    const fromMem = Array.isArray(window.__lastGoodGjM) ? window.__lastGoodGjM : [];
    const fromLs = (typeof J==='function' ? (J('su_gjm') || []) : []);
    const next = fromMem.length ? fromMem : (Array.isArray(fromLs) ? fromLs : []);
    if(Array.isArray(next) && next.length){
      gjM = next.slice();
      try{ window.gjM = gjM; }catch(e){}
    }
  }catch(e){}
}

// ─────────────────────────────────────────────────────────────
// (요청사항) 개인전/끝장전/프로리그끝장전: 선수 패널을 "프로필 배경 + 오버레이 텍스트" 형태로
// - 설정탭에서 su_h2h_panel_pc / su_h2h_panel_mb / su_h2h_panel_fit 로 저장
// ─────────────────────────────────────────────────────────────
function _h2hIsMobile(){ try{ return window.innerWidth <= 768; }catch(e){ return false; } }
function _h2hReadInt(key, def, min, max){
  try{ const v=parseInt(localStorage.getItem(key)||'',10); if(Number.isFinite(v)) return Math.max(min,Math.min(max,v)); }catch(e){}
  return Math.max(min,Math.min(max,def));
}
function _h2hPanelSize(){
  const pc=_h2hReadInt('su_h2h_panel_pc', 150, 110, 230);
  const mb=_h2hReadInt('su_h2h_panel_mb', 126, 96, 210);
  return _h2hIsMobile()?mb:pc;
}
function _h2hPanelMul(axis){
  const isMb=_h2hIsMobile();
  // axis: 'w' | 'h'
  const key = axis==='w'
    ? (isMb?'su_h2h_panel_wmul_mb':'su_h2h_panel_wmul_pc')
    : (isMb?'su_h2h_panel_hmul_mb':'su_h2h_panel_hmul_pc');
  const def = axis==='w' ? (isMb?100:105) : 100;
  // 10%까지 허용(요청사항)
  const pct = _h2hReadInt(key, def, 10, 300);
  return pct / 100;
}
function _h2hPanelFit(){
  try{
    const v=String(localStorage.getItem('su_h2h_panel_fit')||'cover').trim();
    return (v==='contain'||v==='cover'||v==='fill')?v:'cover';
  }catch(e){ return 'cover'; }
}
function _h2hScoreGapPx(){
  const isMb=_h2hIsMobile();
  const def=isMb?8:10;
  const v=_h2hReadInt(isMb?'su_h2h_score_gap_mb':'su_h2h_score_gap_pc', def, 0, 50);
  return v;
}
function _h2hScorePadPx(){
  const isMb=_h2hIsMobile();
  const def=isMb?6:10;
  const v=_h2hReadInt(isMb?'su_h2h_score_pad_mb':'su_h2h_score_pad_pc', def, 0, 24);
  return v;
}
function _h2hPlayerBgPos(name){
  try{
    const raw = localStorage.getItem('su_h2h_player_bgpos') || '';
    if(!raw) return 'center';
    const map = JSON.parse(raw) || {};
    const it = map[String(name||'').trim()];
    if(!it) return 'center';
    const x = Number(it.x), y = Number(it.y);
    if(!Number.isFinite(x) || !Number.isFinite(y)) return 'center';
    const xx = Math.max(0, Math.min(100, x));
    const yy = Math.max(0, Math.min(100, y));
    return `${xx}% ${yy}%`;
  }catch(e){
    return 'center';
  }
}
function _h2hPlayerBgPanel(pName, isWin, isLose){
  const p=players.find(x=>x.name===pName)||{};
  const base=_h2hPanelSize();
  const sizeH=Math.round(base * _h2hPanelMul('h'));
  const sizeW=Math.round(base * _h2hPanelMul('w'));
  const fit=_h2hPanelFit();
  const bgSize=(fit==='fill')?'100% 100%':(fit==='contain'?'contain':'cover');
  const bgImg=p.photo?`background-image:url('${toHttpsUrl(p.photo)}');`:'';
  const bgPos=_h2hPlayerBgPos(pName);
  const initial=(pName||'미').slice(0,1);
  const tier=p.tier?getTierBadge(p.tier):'';
  const race=(p.race&&p.race!=='N')?`<span class="rbadge r${p.race}" style="transform:scale(.92);transform-origin:center">${p.race}</span>`:'';
  const univ = p.univ||'';
  const click = pName?`onclick="event.stopPropagation();openPlayerModal('${escJS(pName)}')"`:'';
  const loseFx = isLose ? 'filter:grayscale(1);opacity:.78;' : '';
  const txtCol = isLose ? 'rgba(255,255,255,.78)' : '#fff';
  const txtCol2 = isLose ? 'rgba(255,255,255,.60)' : 'rgba(255,255,255,.86)';
  const isMb = _h2hIsMobile();
  // (요청사항) 좌우/상하 폭이 "확실히" 바뀌게:
  // - PC: width를 지정하되 max-width:100%로 오버플로 방지
  // - 모바일: 1열이므로 width 100% 유지, height 위주로 변경
  // (버그픽스) 좌우폭 조절이 "작동 안 하는 것처럼" 보이는 문제:
  // - flex:1 1 0 상태에서는 width가 기대대로 반영되지 않는 경우가 있어
  //   flex-basis를 auto로 두고 width를 우선 적용하도록 조정
  // - 모바일은 화면폭에 맞춰 자동으로 줄어들어야 하므로 vw 상한을 두되,
  //   최소폭은 10% 설정이 실제로 체감되게 너무 크게 고정하지 않음
  const wCss = isMb
    ? `width:min(60vw, ${Math.max(40,sizeW)}px);max-width:60vw;flex:0 1 auto;min-width:0;`
    : `width:min(100%, ${Math.max(80,sizeW)}px);flex:0 1 auto;min-width:0;`;
  return `<div ${click} style="position:relative;overflow:hidden;border-radius:16px;height:${Math.max(60,sizeH)}px;${wCss}border:2px solid ${isWin?'#16a34a':'rgba(148,163,184,.35)'};box-shadow:${isWin?'0 14px 30px rgba(34,197,94,.16)':'0 10px 24px rgba(15,23,42,.08)'};cursor:pointer;${bgImg}background-size:${bgSize};background-position:${bgPos};background-repeat:no-repeat;${!p.photo?`background:linear-gradient(135deg,rgba(100,116,139,.28),rgba(100,116,139,.10));`:''}${isLose?'filter:grayscale(1);opacity:.88;':''}">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.06) 0%, rgba(15,23,42,.30) 55%, rgba(15,23,42,.78) 100%)"></div>
    ${!p.photo?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${Math.max(28,Math.round(base*0.30))}px;font-weight:1000;color:rgba(255,255,255,.16)">${initial}</div>`:''}
    <div style="position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;z-index:1;${loseFx}">
      <div style="font-weight:1000;font-size:16px;line-height:1.1;color:${txtCol};text-shadow:0 2px 10px rgba(0,0,0,.45)">${pName||'미정'}</div>
      <div style="font-size:11px;font-weight:800;color:${txtCol2};text-shadow:0 2px 10px rgba(0,0,0,.35)">${univ}</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center;align-items:center">${race}${tier?`<span style="transform:scale(.92);transform-origin:center">${tier}</span>`:''}</div>
    </div>
  </div>`;
}

function indRecordsHTML(){
  _restoreStableIndGj('ind');
  if(!indM.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  _rememberStableIndGj('ind', indM);
  const sessions=[];
  const sidPairMap=new Map();
  let lastKey=null, lastSess=null;
  indM.forEach((m)=>{
    const pair=[m.wName,m.lName].sort();
    const k = m.sid ? `${m.sid}|${pair[0]}|${pair[1]}` : `${m.d||''}|${pair[0]}|${pair[1]}`;
    if(k!==lastKey||!lastSess){
      if(m.sid && sidPairMap.has(k)){
        lastSess=sidPairMap.get(k);lastKey=k;
      } else {
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[]};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  sessions.forEach(s=>{const ds=s.games.map(g=>g.d||'').filter(Boolean).sort();if(ds.length)s.d=ds[ds.length-1];});
  let filteredSess=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSess.sort((a,b)=>recSortDir==='asc' ? (a.d||'').localeCompare(b.d||'') : (b.d||'').localeCompare(a.d||''));

  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') || 'pill');
  const _datePickKey = 'su_rec_date_pick_hist_ind';
  const _pickedDate = (localStorage.getItem(_datePickKey) || '').trim();
  const _baseSess = filteredSess.slice();
  const _allDates = Array.from(new Set(_baseSess.map(s=>String(s.d||'').trim()).filter(Boolean))).sort((a,b)=>recSortDir==='asc'?a.localeCompare(b):b.localeCompare(a));
  if(_pickedDate && _allDates.includes(_pickedDate)){
    filteredSess = filteredSess.filter(s => String(s.d||'').trim() === _pickedDate);
  }
  const _dateMenuHTML = (()=>{
    if(_dateMenuStyle!=='asl' || !_allDates.length) return '';
    const daysS=['일','월','화','수','목','금','토'];
    const _pLine = (pName)=>{
      const pObj=players.find(x=>x.name===pName)||{};
      const univ=pObj.univ||'';
      const col=univ?gc(univ):'#64748b';
      return `<span style="display:inline-flex;align-items:center;gap:4px;min-width:0">
        ${getPlayerPhotoHTML(pName,'16px')}
        <span style="font-weight:900;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:88px">${pName}</span>
        ${pObj.tier?`<span style="transform:scale(.85);transform-origin:left center">${getTierBadge(pObj.tier)}</span>`:''}
        ${univ?`<span style="width:10px;height:10px;border-radius:3px;background:${col};display:inline-block;flex-shrink:0" title="${univ}"></span>`:''}
      </span>`;
    };
    const _mini = (s)=>`<div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text2);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
      <span style="flex:1;min-width:0">${_pLine(s.p1)}</span>
      <span style="color:var(--gray-l);font-weight:900;flex-shrink:0">vs</span>
      <span style="flex:1;min-width:0;display:flex;justify-content:flex-end">${_pLine(s.p2)}</span>
    </div>`;
    let h=`<div class="no-export" style="margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div style="display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">`;
    const _onAll = !_pickedDate;
    h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','');histPage['ind']=0;render()" style="flex-shrink:0;min-width:92px;padding:10px 12px;border-radius:12px;border:1px solid ${_onAll?'var(--blue)':'var(--border)'};background:${_onAll?'#eff6ff':'var(--surface)'};cursor:pointer;text-align:left">
      <div style="font-weight:1000;font-size:12px;color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
      <div style="margin-top:6px;font-size:10px;color:var(--gray-l)">날짜 필터 해제</div>
    </button>`;
    _allDates.forEach(d0=>{
      const dt=new Date(d0+'T00:00:00');
      const label=`${daysS[dt.getDay()]} ${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
      const dayS=_baseSess.filter(s=>String(s.d||'').trim()===d0);
      const prev=dayS.length?`<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">${dayS.slice(0,2).map(_mini).join('')}</div>`:'';
      const on=(_pickedDate===d0);
      h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','${d0}');histPage['ind']=0;render()" style="flex-shrink:0;text-align:left;min-width:170px;max-width:280px;padding:10px 12px;border-radius:12px;border:1px solid ${on?'var(--blue)':'var(--border)'};background:${on?'#eff6ff':'var(--surface)'};cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:1000;font-size:12px;color:${on?'var(--blue)':'var(--text2)'}">${label}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--gray-l);font-weight:900">${dayS.length?`세션 ${dayS.length}`:''}</span>
        </div>
        ${prev}
      </button>`;
    });
    h+=`</div></div>`;
    return h;
  })();

  const pageSize=getHistPageSize();
  const total=filteredSess.length;
  const totalPages=Math.ceil(total/pageSize)||1;
  if(histPage['ind']>=totalPages) histPage['ind']=Math.max(0,totalPages-1);
  const cur=histPage['ind'];
  const slice=total>pageSize?filteredSess.slice(cur*pageSize,(cur+1)*pageSize):filteredSess;
  const _indBulkOn=isLoggedIn&&!!_bulkModes['ind'];
  let h=isLoggedIn?`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;margin-bottom:4px">
    <button onclick="toggleBulkMode('ind')" style="padding:3px 10px;border-radius:12px;border:1.5px solid ${_indBulkOn?'#dc2626':'var(--border2)'};background:${_indBulkOn?'#fff1f2':'var(--surface)'};color:${_indBulkOn?'#dc2626':'var(--text3)'};font-size:11px;font-weight:700;cursor:pointer">${_indBulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>
  </div>`:'';
  h+=_dateMenuHTML;
  if(_indBulkOn){
    h+=`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;cursor:pointer;color:var(--blue)">
        <input type="checkbox" id="bulk-all-ind" onchange="indBulkToggleAll('ind',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
      </label>
      <span id="bulk-cnt-ind" style="font-size:11px;color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
      <span style="color:var(--border2)">│</span>
      <button onclick="bulkMoveInd('ind','gj')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:11px;font-weight:700;cursor:pointer">⚔️ 끝장전으로 이동</button>
      <button onclick="bulkMoveInd('ind','progj')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #7c3aed;background:#7c3aed;color:#fff;font-size:11px;font-weight:700;cursor:pointer">🏅 프로리그 끝장전으로 이동</button>
      <button onclick="bulkDeleteInd('ind')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:11px;font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  }
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const _indSessKey = ('inds_' + String(s.key||`${s.d||''}|${s.p1||''}|${s.p2||''}`).replace(/[^\w\-]/g,'_')).slice(0,120);
    window._indSessCache = window._indSessCache || {};
    window._indSessCache[_indSessKey] = {...s};
    const actionOpts = [];
    // (중요) onclick 속성 안에 큰따옴표(")가 들어가면 HTML 파싱이 깨져 SyntaxError가 발생할 수 있음.
    // ids 배열(예: ['id1','id2'])을 그대로 넣고, 런타임에 JSON.stringify로 문자열로 변환해서 전달한다.
    // (버그픽스) 비로그인자에게는 공유카드만 표시, 수정/삭제/이동은 관리자(로그인)만 볼 수 있음
    actionOpts.push(`{l:'📷 공유카드',fn:()=>openIndShareCard('${escJS(s.p1)}','${escJS(s.p2)}',${p1wins},${p2wins},'${escJS(s.d)}','${escJS(winner)}',JSON.stringify(${idsJson}))}`);
    if(isLoggedIn){
      actionOpts.push(`{l:'✏️ 수정',fn:()=>openIndSessionEdit('${_indSessKey}')}`);
      actionOpts.push(`{l:'↗ 이동',fn:()=>{window._pendingMoveIds=${idsJson};openMoveIndPop(document.getElementById('_indActionBtn_${cur}_${Math.abs((s.key||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))}')||document.body,window._pendingMoveIds,'ind');}}`);
      actionOpts.push(`{l:'🗑 삭제',fn:()=>deleteIndSession(${idsJson})}`);
    }
    const _indActionBtnId = `_indActionBtn_${cur}_${Math.abs((s.key||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))}`;
    const actionBtn=`<button id="${_indActionBtnId}" class="btn btn-w btn-xs" style="white-space:nowrap;padding:2px 8px;font-size:16px;line-height:1;font-weight:900" onclick="event.stopPropagation();openIndSessionActionPop(this,[${actionOpts.join(',')}])">⋯</button>`;
    const bulkCbInd=_indBulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="ind" data-bids="${idsJson}" onchange="_indBulkCountUpdate('ind')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:'';
    const p1univ=players.find(x=>x.name===s.p1)?.univ||'';
    const p2univ=players.find(x=>x.name===s.p2)?.univ||'';
    const p1race=players.find(x=>x.name===s.p1)?.race||'';
    const p2race=players.find(x=>x.name===s.p2)?.race||'';
    const p1col=p1univ?gc(p1univ):'#378ADD';
    const p2col=p2univ?gc(p2univ):'#1D9E75';
    const p1bg=_h2hPlayerBgPanel(s.p1, winner===s.p1, winner && winner!==s.p1);
    const p2bg=_h2hPlayerBgPanel(s.p2, winner===s.p2, winner && winner!==s.p2);
    const _indWrapFx = _safeHeadToHeadSideFx(p1col, p2col);
    const _isMb = _h2hIsMobile();
    // 모바일에서도 한 줄(좌 패널 / 스코어 / 우 패널) 유지. 좁으면 가로 스크롤로 대응
    const _gridCols = _indBulkOn ? 'auto 1fr auto 1fr' : '1fr auto 1fr';
    const _pad = _isMb ? '10px 10px' : '14px 14px';
    const _gap = _h2hScoreGapPx() + 'px';
    const _scoreFs = _isMb ? 26 : 32;
    const _dashFs = _isMb ? 16 : 18;
    const _rowScroll = _isMb ? 'overflow-x:auto;-webkit-overflow-scrolling:touch;' : '';
    const _scorePad = `padding:0 ${_h2hScorePadPx()}px;`;
    h+=`<div style="border:1px solid var(--border);border-radius:12px;margin-bottom:8px;overflow:hidden;${_indWrapFx||'background:var(--white);'}">
      <div style="display:grid;grid-template-columns:${_gridCols};align-items:center;padding:${_pad};gap:${_gap};cursor:pointer;${_rowScroll}" onclick="openIndSessionPopup('${_indSessKey}')">
        ${bulkCbInd||''}
        <div style="display:flex;align-items:center;justify-content:flex-end;width:100%">${p1bg}</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;${_scorePad}flex-shrink:0">
          <div style="font-size:${_scoreFs}px;font-weight:900;letter-spacing:-1.6px;line-height:1;color:var(--text1)">${p1wins}<span style="font-size:${_dashFs}px;color:var(--gray-l);margin:0 3px">-</span>${p2wins}</div>
          ${winner?`<div style="font-size:10px;color:var(--gray-l);white-space:nowrap">${winner} 승</div>`:''}
        </div>
        <div style="display:flex;align-items:center;justify-content:flex-start;width:100%">${p2bg}</div>
      </div>
      <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:${_isMb?'7px 10px':'8px 14px'};background:var(--bg2);flex-wrap:wrap">
        <span style="font-size:11px;color:var(--gray-l)">${s.d||'날짜 미정'}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#E6F1FB;color:#185FA5">개인전</span>
        <span style="font-size:11px;color:var(--gray-l)">${s.games.length}경기</span>
        ${winner?`<span style="margin-left:auto;font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;background:#dcfce7;color:#166534">${winner} 승</span>`:'<span style="margin-left:auto"></span>'}
        <span onclick="event.stopPropagation()">${actionBtn}</span>
      </div>
    </div>`;
  });
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=0;render()" ${cur===0?'disabled':''}>«</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.max(0,${cur}-1);render()" ${cur===0?'disabled':''}>‹</button>`;
    let s2=Math.max(0,cur-3),e2=Math.min(totalPages-1,s2+6);if(e2-s2<6)s2=Math.max(0,e2-6);
    for(let p=s2;p<=e2;p++) h+=`<button class="btn ${p===cur?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['ind']=${p};render()">${p+1}</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.min(${totalPages-1},${cur}+1);render()" ${cur===totalPages-1?'disabled':''}>›</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=${totalPages-1};render()" ${cur===totalPages-1?'disabled':''}>»</button>`;
    h+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}

function gjRecordsHTML(proOnly){
  _restoreStableIndGj('gj');
  window._gjSessCache = window._gjSessCache || {};
  const _gjSrc=proOnly?gjM.filter(m=>m._proLabel):gjM.filter(m=>!m._proLabel);
  if(!_gjSrc.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  _rememberStableIndGj('gj', gjM);
  const sessions=[];
  const sidPairMap=new Map();
  let lastKey=null, lastSess=null;
  _gjSrc.forEach((m)=>{
    const pair=[m.wName,m.lName].sort();
    const k = m.sid ? `${m.sid}|${pair[0]}|${pair[1]}` : `${m.d||''}|${pair[0]}|${pair[1]}`;
    if(k!==lastKey||!lastSess){
      if(m.sid && sidPairMap.has(k)){
        lastSess=sidPairMap.get(k);lastKey=k;
      } else {
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[]};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  sessions.forEach(s=>{const ds=s.games.map(g=>g.d||'').filter(Boolean).sort();if(ds.length)s.d=ds[ds.length-1];});
  let filteredSessGj=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSessGj.sort((a,b)=>recSortDir==='asc' ? (a.d||'').localeCompare(b.d||'') : (b.d||'').localeCompare(a.d||''));

  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') || 'pill');
  const _datePickKey = proOnly ? 'su_rec_date_pick_hist_progj' : 'su_rec_date_pick_hist_gj';
  const _pickedDate = (localStorage.getItem(_datePickKey) || '').trim();
  const _baseSess = filteredSessGj.slice();
  const _allDates = Array.from(new Set(_baseSess.map(s=>String(s.d||'').trim()).filter(Boolean))).sort((a,b)=>b.localeCompare(a));
  if(_pickedDate && _allDates.includes(_pickedDate)){
    filteredSessGj = filteredSessGj.filter(s => String(s.d||'').trim() === _pickedDate);
  }
  const _dateMenuHTML = (()=>{
    if(_dateMenuStyle!=='asl' || !_allDates.length) return '';
    const daysS=['일','월','화','수','목','금','토'];
    const _pLine = (pName)=>{
      const pObj=players.find(x=>x.name===pName)||{};
      const univ=pObj.univ||'';
      const col=univ?gc(univ):'#64748b';
      return `<span style="display:inline-flex;align-items:center;gap:4px;min-width:0">
        ${getPlayerPhotoHTML(pName,'16px')}
        <span style="font-weight:900;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:88px">${pName}</span>
        ${pObj.tier?`<span style="transform:scale(.85);transform-origin:left center">${getTierBadge(pObj.tier)}</span>`:''}
        ${univ?`<span style="width:10px;height:10px;border-radius:3px;background:${col};display:inline-block;flex-shrink:0" title="${univ}"></span>`:''}
      </span>`;
    };
    const _mini = (s)=>`<div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text2);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
      <span style="flex:1;min-width:0">${_pLine(s.p1)}</span>
      <span style="color:var(--gray-l);font-weight:900;flex-shrink:0">vs</span>
      <span style="flex:1;min-width:0;display:flex;justify-content:flex-end">${_pLine(s.p2)}</span>
    </div>`;
    let h=`<div class="no-export" style="margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div style="display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">`;
    const _onAll = !_pickedDate;
    h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','');histPage['gj']=0;render()" style="flex-shrink:0;min-width:92px;padding:10px 12px;border-radius:12px;border:1px solid ${_onAll?'var(--blue)':'var(--border)'};background:${_onAll?'#eff6ff':'var(--surface)'};cursor:pointer;text-align:left">
      <div style="font-weight:1000;font-size:12px;color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
      <div style="margin-top:6px;font-size:10px;color:var(--gray-l)">날짜 필터 해제</div>
    </button>`;
    _allDates.forEach(d0=>{
      const dt=new Date(d0+'T00:00:00');
      const label=`${daysS[dt.getDay()]} ${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
      const dayS=_baseSess.filter(s=>String(s.d||'').trim()===d0);
      const prev=dayS.length?`<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">${dayS.slice(0,2).map(_mini).join('')}</div>`:'';
      const on=(_pickedDate===d0);
      h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','${d0}');histPage['gj']=0;render()" style="flex-shrink:0;text-align:left;min-width:170px;max-width:280px;padding:10px 12px;border-radius:12px;border:1px solid ${on?'var(--blue)':'var(--border)'};background:${on?'#eff6ff':'var(--surface)'};cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:1000;font-size:12px;color:${on?'var(--blue)':'var(--text2)'}">${label}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--gray-l);font-weight:900">${dayS.length?`세션 ${dayS.length}`:''}</span>
        </div>
        ${prev}
      </button>`;
    });
    h+=`</div></div>`;
    return h;
  })();

  const pageSize=getHistPageSize();
  const total=filteredSessGj.length;
  const totalPages=Math.ceil(total/pageSize)||1;
  if(histPage['gj']>=totalPages) histPage['gj']=Math.max(0,totalPages-1);
  const cur=histPage['gj'];
  const slice=total>pageSize?filteredSessGj.slice(cur*pageSize,(cur+1)*pageSize):filteredSessGj;
  const _gjBulkKey=proOnly?'pro_gj':'gj';
  const _gjBulkOn=isLoggedIn&&!!_bulkModes[_gjBulkKey];
  const _gjBulkDests=proOnly
    ?[{l:'⚔️ 일반 끝장전',d:'ungj'},{l:'🎮 개인전',d:'ind'}]
    :[{l:'🎮 개인전',d:'ind'},{l:'🏅 프로리그 끝장전',d:'progj'}];
  let h=isLoggedIn?`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;margin-bottom:4px">
    <button onclick="toggleBulkMode('${_gjBulkKey}')" style="padding:3px 10px;border-radius:12px;border:1.5px solid ${_gjBulkOn?'#dc2626':'var(--border2)'};background:${_gjBulkOn?'#fff1f2':'var(--surface)'};color:${_gjBulkOn?'#dc2626':'var(--text3)'};font-size:11px;font-weight:700;cursor:pointer">${_gjBulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>
  </div>`:'';
  h+=_dateMenuHTML;
  if(_gjBulkOn){
    h+=`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;cursor:pointer;color:var(--blue)">
        <input type="checkbox" id="bulk-all-${_gjBulkKey}" onchange="indBulkToggleAll('${_gjBulkKey}',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
      </label>
      <span id="bulk-cnt-${_gjBulkKey}" style="font-size:11px;color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
      <span style="color:var(--border2)">│</span>
      ${_gjBulkDests.map(bd=>`<button onclick="bulkMoveInd('${_gjBulkKey}','${bd.d}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:11px;font-weight:700;cursor:pointer">${bd.l}로 이동</button>`).join('')}
      <button onclick="bulkDeleteInd('${_gjBulkKey}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:11px;font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  }
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const _gjMoveCtx=proOnly?'pro_gj':'gj';
    const _gjActionBtnId = `_gjActionBtn_${cur}_${Math.abs((s.key||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))}`;
    const _gjSessKey = ('gjs_' + String((s.games.find(x=>x && x.sid)?.sid) || s.key || `${s.d||''}|${s.p1||''}|${s.p2||''}`).replace(/[^\w\-]/g,'_')).slice(0,120);
    const gjActionOpts = [];
    // (버그픽스) 비로그인자에게는 공유카드만 표시, 수정/삭제/이동은 관리자(로그인)만 볼 수 있음
    gjActionOpts.push(`{l:'🎴 공유카드',fn:()=>openGJShareCard('${escJS(s.p1)}','${escJS(s.p2)}',${p1wins},${p2wins},'${escJS(s.d)}','${escJS(winner)}',{proOnly:${proOnly?'true':'false'}})}`);
    if(isLoggedIn){
      gjActionOpts.push(`{l:'✏️ 수정',fn:()=>openGJSessionEdit('${_gjSessKey}')}`);
      gjActionOpts.push(`{l:'↗ 이동',fn:()=>{window._pendingMoveIds=${idsJson};openMoveIndPop(document.getElementById('${_gjActionBtnId}')||document.body,window._pendingMoveIds,'${_gjMoveCtx}');}}`);
      gjActionOpts.push(`{l:'🗑 삭제',fn:()=>deleteGjSession(${idsJson})}`);
    }
    const actionBtn=`<button id="${_gjActionBtnId}" class="btn btn-w btn-xs" style="white-space:nowrap;padding:2px 8px;font-size:16px;line-height:1;font-weight:900" onclick="event.stopPropagation();openIndSessionActionPop(this,[${gjActionOpts.join(',')}])">⋯</button>`;
    const bulkCbGj=_gjBulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="${_gjBulkKey}" data-bids="${idsJson}" onchange="_indBulkCountUpdate('${_gjBulkKey}')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:'';
    const _sidRaw = (s.games.find(x=>x && x.sid)?.sid) || s.key || `${s.d||''}|${s.p1||''}|${s.p2||''}`;
    const _sessKey = ('gjs_' + String(_sidRaw).replace(/[^\w\-]/g,'_')).slice(0,120);
    window._gjSessCache[_sessKey] = {...s, _proOnly: !!proOnly};

    const gj_p1univ=players.find(x=>x.name===s.p1)?.univ||'';
    const gj_p2univ=players.find(x=>x.name===s.p2)?.univ||'';
    const gj_p1race=players.find(x=>x.name===s.p1)?.race||'';
    const gj_p2race=players.find(x=>x.name===s.p2)?.race||'';
    const gj_typeLabel=proOnly?'프로리그 끝장전':'끝장전';
    const gj_typeBg=proOnly?'#E1F5EE':'#FAECE7';
    const gj_typeColor=proOnly?'#085041':'#993C1D';
    const gj_p1bg=_h2hPlayerBgPanel(s.p1, winner===s.p1, winner && winner!==s.p1);
    const gj_p2bg=_h2hPlayerBgPanel(s.p2, winner===s.p2, winner && winner!==s.p2);
    const _gjWrapFx = _safeHeadToHeadSideFx(gj_p1univ?gc(gj_p1univ):'#378ADD', gj_p2univ?gc(gj_p2univ):'#1D9E75');
    const _isMb = _h2hIsMobile();
    const _gridCols = _gjBulkOn ? 'auto 1fr auto 1fr' : '1fr auto 1fr';
    const _pad = _isMb ? '10px 10px' : '14px 14px';
    const _gap = _h2hScoreGapPx() + 'px';
    const _scoreFs = _isMb ? 26 : 32;
    const _dashFs = _isMb ? 16 : 18;
    const _rowScroll = _isMb ? 'overflow-x:auto;-webkit-overflow-scrolling:touch;' : '';
    const _scorePad = `padding:0 ${_h2hScorePadPx()}px;`;
    h+=`<div style="border:1px solid var(--border);border-radius:12px;margin-bottom:8px;overflow:hidden;${_gjWrapFx||'background:var(--white);'}">
      <div style="display:grid;grid-template-columns:${_gridCols};align-items:center;padding:${_pad};gap:${_gap};cursor:pointer;${_rowScroll}" onclick="openGJSessionPopup('${_sessKey}')">
        ${bulkCbGj||''}
        <div style="display:flex;align-items:center;justify-content:flex-end;width:100%">${gj_p1bg}</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;${_scorePad}flex-shrink:0">
          <div style="font-size:${_scoreFs}px;font-weight:900;letter-spacing:-1.6px;line-height:1;color:var(--text1)">${p1wins}<span style="font-size:${_dashFs}px;color:var(--gray-l);margin:0 3px">-</span>${p2wins}</div>
          ${winner?`<div style="font-size:10px;color:var(--gray-l);white-space:nowrap">${winner} 승</div>`:''}
        </div>
        <div style="display:flex;align-items:center;justify-content:flex-start;width:100%">${gj_p2bg}</div>
      </div>
      <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:${_isMb?'7px 10px':'8px 14px'};background:var(--bg2);flex-wrap:wrap">
        <span style="font-size:11px;color:var(--gray-l)">${s.d||'날짜 미정'}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${gj_typeBg};color:${gj_typeColor}">${gj_typeLabel}</span>
        <span style="font-size:11px;color:var(--gray-l)">${s.games.length}경기</span>
        ${winner?`<span style="margin-left:auto;font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;background:#dcfce7;color:#166534">${winner} 승</span>`:'<span style="margin-left:auto"></span>'}
        <span onclick="event.stopPropagation()">${actionBtn}</span>
      </div>
    </div>`;
  });
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=0;render()" ${cur===0?'disabled':''}>«</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=Math.max(0,${cur}-1);render()" ${cur===0?'disabled':''}>‹</button>`;
    let s2=Math.max(0,cur-3),e2=Math.min(totalPages-1,s2+6);if(e2-s2<6)s2=Math.max(0,e2-6);
    for(let p=s2;p<=e2;p++) h+=`<button class="btn ${p===cur?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['gj']=${p};render()">${p+1}</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=Math.min(${totalPages-1},${cur}+1);render()" ${cur===totalPages-1?'disabled':''}>›</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=${totalPages-1};render()" ${cur===totalPages-1?'disabled':''}>»</button>`;
    h+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}
