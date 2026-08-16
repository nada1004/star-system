/* ══════════════════════════════════════════════════════════════
   경기기록 - 개인전 기록 HTML (match-builder-record-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function indRecordsHTML(){
  _restoreStableIndGj('ind');
  // [UX-FIX] 빈 화면 대신 공용 empty-state + 끝장전으로 바로 이동하는 안내 제공
  if(!indM.length){
    const _gjCnt = (typeof gjM!=='undefined' && Array.isArray(gjM)) ? gjM.length : 0;
    return `<div class="empty-state">`
      + `<div class="empty-state-icon">🎮</div>`
      + `<div class="empty-state-title">개인전 기록이 없습니다</div>`
      + `<div class="empty-state-desc">${_gjCnt ? `현재 데이터에는 개인전 기록이 없습니다. 끝장전 기록 ${_gjCnt.toLocaleString()}건은 확인할 수 있습니다.` : '기록이 추가되면 여기에 표시됩니다.'}</div>`
      + (_gjCnt ? `<div style="margin-top:12px"><button class="btn btn-w btn-sm" onclick="try{indSub='records';window._mergedIndSub='gj';if(typeof gjSub!=='undefined')gjSub='records';}catch(e){};try{render()}catch(e){}">⚔️ 끝장전 기록 보기</button></div>` : '')
      + `</div>`;
  }
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
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[],_ord:sessions.length};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  sessions.forEach(s=>{const ds=s.games.map(g=>g.d||'').filter(Boolean).sort();if(ds.length)s.d=ds[ds.length-1];const ns=s.games.map(g=>g.n||'').filter(Boolean);if(ns.length)s.n=ns[ns.length-1];});
  let filteredSess=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSess.sort((a,b)=>{
    const cmp = recSortDir==='asc' ? (a.d||'').localeCompare(b.d||'') : (b.d||'').localeCompare(a.d||'');
    if(cmp!==0) return cmp;
    // 같은 날짜면 등록순으로 정렬: 최신순=나중에 등록한 게 위, 오래된순=먼저 등록한 게 위
    // indM은 unshift로 채워져 _ord가 작을수록(=sessions에 먼저 등장할수록) 최근 등록임
    return recSortDir==='asc' ? (b._ord - a._ord) : (a._ord - b._ord);
  });

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
      <div style="font-weight:1000;font-size:var(--fs-sm);color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
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
          <span style="font-weight:1000;font-size:var(--fs-sm);color:${on?'var(--blue)':'var(--text2)'}">${label}</span>
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
    <button onclick="toggleBulkMode('ind')" style="padding:3px 10px;border-radius:12px;border:1.5px solid ${_indBulkOn?'#dc2626':'var(--border2)'};background:${_indBulkOn?'#fff1f2':'var(--surface)'};color:${_indBulkOn?'#dc2626':'var(--text3)'};font-size:var(--fs-caption);font-weight:700;cursor:pointer">${_indBulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>
  </div>`:'';
  h+=_dateMenuHTML;
  if(_indBulkOn){
    h+=`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:5px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;color:var(--blue)">
        <input type="checkbox" id="bulk-all-ind" onchange="indBulkToggleAll('ind',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
      </label>
      <span id="bulk-cnt-ind" style="font-size:var(--fs-caption);color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
      <span style="color:var(--border2)">│</span>
      <button onclick="bulkMoveInd('ind','gj')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">⚔️ 끝장전으로 이동</button>
      <button onclick="bulkMoveInd('ind','progj')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #7c3aed;background:#7c3aed;color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">🏅 프로리그 끝장전으로 이동</button>
      <button onclick="bulkDeleteInd('ind')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  }
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    // 세션 키 충돌 방지: 사람이 읽을 수 있는 일부 + 짧은 해시를 함께 사용
    const _indRawKey = String(s.key||`${s.d||''}|${s.p1||''}|${s.p2||''}`);
    const _indSessKey = (`inds_${_sessHashKey(_indRawKey)}_${_indRawKey.replace(/[^\w\-]/g,'_')}`).slice(0,120);
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
    const _indP1Win = p1wins > p2wins;
    const _indP2Win = p2wins > p1wins;
    const _indScoreColP1 = _indP1Win ? 'var(--win-col)' : _indP2Win ? 'var(--lose-col)' : 'var(--text2)';
    const _indScoreColP2 = _indP2Win ? 'var(--win-col)' : _indP1Win ? 'var(--lose-col)' : 'var(--text2)';
    const p1bg=_h2hPlayerBgPanel(s.p1, winner===s.p1, winner && winner!==s.p1);
    const p2bg=_h2hPlayerBgPanel(s.p2, winner===s.p2, winner && winner!==s.p2);
    const _indWrapFx = _safeHeadToHeadSideFx(p1col, p2col);
    const _isMb = _h2hIsMobile();
    const _gridCols = _indBulkOn ? 'auto 1fr auto 1fr' : '1fr auto 1fr';
    const _gap = _h2hScoreGapPx();
    const _scorePad = _h2hScorePadPx();
    const _indCardMode = _h2hCardMode();
    const _bodyHTML = _h2hCardBody(_indCardMode, s, p1wins, p2wins, winner, p1col, p2col, _gridCols, _isMb, _scorePad, _gap, bulkCbInd, p1bg, p2bg, _indScoreColP1, _indScoreColP2);
    h+=`<div class="h2h-rec-card" style="border:var(--h2h-card-border,1px solid var(--border));border-bottom:var(--h2h-card-border-bottom,none);border-radius:var(--h2h-card-radius,12px);margin-bottom:var(--h2h-card-gap,8px);overflow:hidden;box-shadow:var(--h2h-card-shadow,none);${_indWrapFx||'background:var(--white);'}">
      <div style="cursor:pointer" onclick="openIndSessionPopup('${_indSessKey}')">${_bodyHTML}</div>
      <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:${_isMb?'7px 10px':'8px 14px'};background:var(--bg2);flex-wrap:wrap">
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${s.d||'날짜 미정'}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#E6F1FB;color:#185FA5">개인전</span>
        ${s.n?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#FEF3C7;color:#92400E">🏆 ${escHTML(s.n)}</span>`:''}
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${s.games.length}경기</span>
        <span style="margin-left:auto"></span>
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
    h+=`<span style="font-size:var(--fs-caption);color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}

