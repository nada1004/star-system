/* ══════════════════════════════════════
   Match Builder Record Views
══════════════════════════════════════ */

function _safeHeadToHeadSideFx(leftHex, rightHex){
  try{
    if(typeof _getRecSideFxCfg!=='function') return '';
    const cfg = _getRecSideFxCfg();
    if(!cfg || !cfg.on) return '';
    const mode = ['soft','glow','panel','line'].includes(cfg.mode) ? cfg.mode : 'soft';
    const intensity = Math.max(20, Math.min(100, parseInt(cfg.intensity||68,10)||68));
    const lenPct = Math.max(10, Math.min(60, parseInt(localStorage.getItem('su_rec_side_fx_length')||'25',10)||25));
    const tail = Math.max(0, Math.min(100, parseInt((cfg&&cfg.tail)||28,10)||28));
    const a1 = Math.max(0.08, Math.min(0.34, (intensity/100) * 0.28));
    const a2 = Math.max(0.03, Math.min(0.16, a1 * 0.42));
    const ae = Math.max(a1, Math.min(0.70, a1 + (tail/100)*0.34));
    const lr = (typeof _recFxHexToRgbStr==='function') ? _recFxHexToRgbStr(leftHex||'#3b82f6') : '59,130,246';
    const rr = (typeof _recFxHexToRgbStr==='function') ? _recFxHexToRgbStr(rightHex||'#ef4444') : '239,68,68';
    const L1 = lenPct, L2 = Math.round(lenPct*0.45), L3 = Math.round(lenPct*0.85);
    const R1 = 100-lenPct, R2 = 100-Math.round(lenPct*0.45), R3 = 100-Math.round(lenPct*0.85);
    if(mode==='line'){
      return `background:
        linear-gradient(180deg, rgba(${lr},${a1.toFixed(3)}), rgba(${lr},${a2.toFixed(3)})) left center / 8px 100% no-repeat,
        linear-gradient(180deg, rgba(${rr},${a1.toFixed(3)}), rgba(${rr},${a2.toFixed(3)})) right center / 8px 100% no-repeat,
        var(--white);`;
    }
    if(mode==='glow'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${ae.toFixed(3)}) 100%),
        var(--white);
        box-shadow: inset 26px 0 34px rgba(${lr},${a1.toFixed(3)}), inset -26px 0 34px rgba(${rr},${a1.toFixed(3)});`;
    }
    if(mode==='panel'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0%, rgba(${lr},${a2.toFixed(3)}) ${L2}%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${a2.toFixed(3)}) ${R2}%, rgba(${rr},${ae.toFixed(3)}) 100%),
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
    if(!Array.isArray(arr) || !arr.length) return;
    const key = kind === 'gj' ? '__lastGoodGjM' : '__lastGoodIndM';
    window[key] = arr.slice();
  }catch(e){}
}
function _restoreStableIndGj(kind){
  try{
    if(kind === 'ind'){
      if(Array.isArray(indM) && indM.length){
        _rememberStableIndGj('ind', indM);
        return;
      }
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
    const fromMem = Array.isArray(window.__lastGoodGjM) ? window.__lastGoodGjM : [];
    const fromLs = (typeof J==='function' ? (J('su_gjm') || []) : []);
    const next = fromMem.length ? fromMem : (Array.isArray(fromLs) ? fromLs : []);
    if(Array.isArray(next) && next.length){
      gjM = next.slice();
      try{ window.gjM = gjM; }catch(e){}
    }
  }catch(e){}
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
    const _sIdsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const _indSessKey = ('inds_' + String(s.key||`${s.d||''}|${s.p1||''}|${s.p2||''}`).replace(/[^\w\-]/g,'_')).slice(0,120);
    window._indSessCache = window._indSessCache || {};
    window._indSessCache[_indSessKey] = {...s};
    const actionOpts = [];
    actionOpts.push(`{l:'📷 공유카드',fn:()=>openIndShareCard('${escJS(s.p1)}','${escJS(s.p2)}',${p1wins},${p2wins},'${escJS(s.d)}','${escJS(winner)}','${_sIdsJson}')}`);
    actionOpts.push(`{l:'✏️ 수정',fn:()=>openIndSessionPopup('${_indSessKey}')}`);
    if(isLoggedIn){
      actionOpts.push(`{l:'↗ 이동',fn:()=>{window._pendingMoveIds=${idsJson};openMoveIndPop(document.getElementById('_indActionBtn_${cur}_${Math.abs((s.key||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))}')||document.body,window._pendingMoveIds,'ind');}}`);
    }
    actionOpts.push(`{l:'🗑 삭제',fn:()=>deleteIndSession(${idsJson})}`);
    const _indActionBtnId = `_indActionBtn_${cur}_${Math.abs((s.key||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))}`;
    const actionBtn=`<button id="${_indActionBtnId}" class="btn btn-w btn-xs" style="white-space:nowrap;padding:2px 8px;font-size:16px;line-height:1;font-weight:900" onclick="event.stopPropagation();openIndSessionActionPop(this,[${actionOpts.join(',')}])">⋯</button>`;
    const bulkCbInd=_indBulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="ind" data-bids="${idsJson}" onchange="_indBulkCountUpdate('ind')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:'';
    const p1univ=players.find(x=>x.name===s.p1)?.univ||'';
    const p2univ=players.find(x=>x.name===s.p2)?.univ||'';
    const p1race=players.find(x=>x.name===s.p1)?.race||'';
    const p2race=players.find(x=>x.name===s.p2)?.race||'';
    const p1col=p1univ?gc(p1univ):'#378ADD';
    const p2col=p2univ?gc(p2univ):'#1D9E75';
    const _rcAvaSize=(()=>{try{const n=parseInt(localStorage.getItem('su_rec_avatar_size')||'38',10);return (n>=20&&n<=80)?n+'px':'38px';}catch(e){return '38px';}})();
    window.__detailCtx='recCard';
    const p1photoLg=getPlayerPhotoHTML(s.p1,_rcAvaSize);
    const p2photoLg=getPlayerPhotoHTML(s.p2,_rcAvaSize);
    try{delete window.__detailCtx;}catch(e){}
    const _indWrapFx = _safeHeadToHeadSideFx(p1col, p2col);
    h+=`<div style="border:1px solid var(--border);border-radius:12px;margin-bottom:8px;overflow:hidden;${_indWrapFx||'background:var(--white);'}">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:16px 14px;gap:8px;cursor:pointer" onclick="openIndSessionPopup('${_indSessKey}')">${bulkCbInd}
        <div style="display:flex;flex-direction:column;gap:4px">
          <div style="display:flex;align-items:center;gap:8px">
            ${p1photoLg}
            <div>
              <div style="font-size:15px;font-weight:700;cursor:pointer;color:var(--text1)" onclick="event.stopPropagation();openPlayerModal('${escJS(s.p1)}')">${s.p1}</div>
              <div style="font-size:11px;color:var(--gray-l)">${p1univ}${p1race&&p1race!=='N'?` · ${p1race}`:''}</div>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 10px;flex-shrink:0">
          <div style="font-size:32px;font-weight:700;letter-spacing:-2px;line-height:1;color:var(--text1)">${p1wins}<span style="font-size:18px;color:var(--gray-l);margin:0 3px">-</span>${p2wins}</div>
          ${winner?`<div style="font-size:10px;color:var(--gray-l);white-space:nowrap">${winner} 승</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          <div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">
            <div style="text-align:right">
              <div style="font-size:15px;font-weight:700;cursor:pointer;color:var(--text1)" onclick="event.stopPropagation();openPlayerModal('${escJS(s.p2)}')">${s.p2}</div>
              <div style="font-size:11px;color:var(--gray-l)">${p2univ}${p2race&&p2race!=='N'?` · ${p2race}`:''}</div>
            </div>
            ${p2photoLg}
          </div>
        </div>
      </div>
      <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--bg2)">
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
    gjActionOpts.push(`{l:'🎴 공유카드',fn:()=>openGJShareCard('${escJS(s.p1)}','${escJS(s.p2)}',${p1wins},${p2wins},'${escJS(s.d)}','${escJS(winner)}',{proOnly:${proOnly?'true':'false'}})}`);
    gjActionOpts.push(`{l:'✏️ 수정',fn:()=>openGJSessionPopup('${_gjSessKey}')}`);
    if(isLoggedIn){
      gjActionOpts.push(`{l:'↗ 이동',fn:()=>{window._pendingMoveIds=${idsJson};openMoveIndPop(document.getElementById('${_gjActionBtnId}')||document.body,window._pendingMoveIds,'${_gjMoveCtx}');}}`);
    }
    gjActionOpts.push(`{l:'🗑 삭제',fn:()=>deleteGjSession(${idsJson})}`);
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
    const _rcAvaSizeGj=(()=>{try{const n=parseInt(localStorage.getItem('su_rec_avatar_size')||'38',10);return (n>=20&&n<=80)?n+'px':'38px';}catch(e){return '38px';}})();
    window.__detailCtx='recCard';
    const gj_p1photoLg=getPlayerPhotoHTML(s.p1,_rcAvaSizeGj);
    const gj_p2photoLg=getPlayerPhotoHTML(s.p2,_rcAvaSizeGj);
    try{delete window.__detailCtx;}catch(e){}
    const _gjWrapFx = _safeHeadToHeadSideFx(gj_p1univ?gc(gj_p1univ):'#378ADD', gj_p2univ?gc(gj_p2univ):'#1D9E75');
    h+=`<div style="border:1px solid var(--border);border-radius:12px;margin-bottom:8px;overflow:hidden;${_gjWrapFx||'background:var(--white);'}">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:16px 14px;gap:8px;cursor:pointer" onclick="openGJSessionPopup('${_sessKey}')">${bulkCbGj}
        <div style="display:flex;flex-direction:column;gap:4px">
          <div style="display:flex;align-items:center;gap:8px">
            ${gj_p1photoLg}
            <div>
              <div style="font-size:15px;font-weight:700;cursor:pointer;color:var(--text1)" onclick="event.stopPropagation();openPlayerModal('${escJS(s.p1)}')">${s.p1}</div>
              <div style="font-size:11px;color:var(--gray-l)">${gj_p1univ}${gj_p1race&&gj_p1race!=='N'?` · ${gj_p1race}`:''}</div>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 10px;flex-shrink:0">
          <div style="font-size:32px;font-weight:700;letter-spacing:-2px;line-height:1;color:var(--text1)">${p1wins}<span style="font-size:18px;color:var(--gray-l);margin:0 3px">-</span>${p2wins}</div>
          ${winner?`<div style="font-size:10px;color:var(--gray-l);white-space:nowrap">${winner} 승</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          <div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">
            <div style="text-align:right">
              <div style="font-size:15px;font-weight:700;cursor:pointer;color:var(--text1)" onclick="event.stopPropagation();openPlayerModal('${escJS(s.p2)}')">${s.p2}</div>
              <div style="font-size:11px;color:var(--gray-l)">${gj_p2univ}${gj_p2race&&gj_p2race!=='N'?` · ${gj_p2race}`:''}</div>
            </div>
            ${gj_p2photoLg}
          </div>
        </div>
      </div>
      <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--bg2)">
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
