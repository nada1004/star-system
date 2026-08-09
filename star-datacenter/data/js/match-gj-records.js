/* ══════════════════════════════════════════════════════════════
   경기기록 - 끝장전(GJ) 기록 HTML (match-builder-record-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[],_ord:sessions.length};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  sessions.forEach(s=>{const ds=s.games.map(g=>g.d||'').filter(Boolean).sort();if(ds.length)s.d=ds[ds.length-1];const ns=s.games.map(g=>g.n||'').filter(Boolean);if(ns.length)s.n=ns[ns.length-1];});
  let filteredSessGj=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSessGj.sort((a,b)=>{
    const cmp = recSortDir==='asc' ? (a.d||'').localeCompare(b.d||'') : (b.d||'').localeCompare(a.d||'');
    if(cmp!==0) return cmp;
    // gjM은 unshift로 채워져 _ord가 작을수록(=sessions에 먼저 등장할수록) 최근 등록임
    return recSortDir==='asc' ? (b._ord - a._ord) : (a._ord - b._ord);
  });

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
      <div style="font-weight:1000;font-size:var(--fs-sm);color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
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
    <button onclick="toggleBulkMode('${_gjBulkKey}')" style="padding:3px 10px;border-radius:12px;border:1.5px solid ${_gjBulkOn?'#dc2626':'var(--border2)'};background:${_gjBulkOn?'#fff1f2':'var(--surface)'};color:${_gjBulkOn?'#dc2626':'var(--text3)'};font-size:var(--fs-caption);font-weight:700;cursor:pointer">${_gjBulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>
  </div>`:'';
  h+=_dateMenuHTML;
  if(_gjBulkOn){
    h+=`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:5px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;color:var(--blue)">
        <input type="checkbox" id="bulk-all-${_gjBulkKey}" onchange="indBulkToggleAll('${_gjBulkKey}',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
      </label>
      <span id="bulk-cnt-${_gjBulkKey}" style="font-size:var(--fs-caption);color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
      <span style="color:var(--border2)">│</span>
      ${_gjBulkDests.map(bd=>`<button onclick="bulkMoveInd('${_gjBulkKey}','${bd.d}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${bd.l}로 이동</button>`).join('')}
      <button onclick="bulkDeleteInd('${_gjBulkKey}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  }
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const _gjMoveCtx=proOnly?'pro_gj':'gj';
    const _gjActionBtnId = `_gjActionBtn_${cur}_${Math.abs((s.key||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))}`;
    // ✅ 버그픽스: 캐시 저장 키와 수정 버튼에 전달하는 키를 동일하게 생성
    // ✅ 버그픽스: raw sid만 쓰면 "여러 명 경기를 한번에 자동인식 등록"처럼
    // 서로 다른 선수쌍이 같은 sid(같은 붙여넣기 배치)를 공유하는 경우
    // 세션 키가 충돌해서(마지막에 렌더된 세션이 캐시를 덮어써서) 엉뚱한 경기의
    // 상세 팝업/공유카드가 열리는 문제가 있었음. sid에 선수쌍을 함께 포함시켜 고유화.
    const _sidBase = (s.games.find(x=>x && x.sid)?.sid) || '';
    const _sidRaw = _sidBase ? `${_sidBase}|${s.p1||''}|${s.p2||''}` : (s.key || `${s.d||''}|${s.p1||''}|${s.p2||''}`);
    // ✅ 버그픽스(추가 보강): 세션 키 충돌(특히 자동인식 배치 저장 시 sid 공유) 방지
    const _gjSessKey = (`gjs_${_sessHashKey(_sidRaw)}_${String(_sidRaw).replace(/[^\w\-]/g,'_')}`).slice(0,120);
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
    // ✅ 버그픽스: _gjSessKey와 동일한 키로 캐시 저장 (수정 버튼과 일치)
    window._gjSessCache[_gjSessKey] = {...s, _proOnly: !!proOnly};

    const gj_p1univ=players.find(x=>x.name===s.p1)?.univ||'';
    const gj_p2univ=players.find(x=>x.name===s.p2)?.univ||'';
    const gj_p1race=players.find(x=>x.name===s.p1)?.race||'';
    const gj_p2race=players.find(x=>x.name===s.p2)?.race||'';
    const _gjP1Win = p1wins > p2wins;
    const _gjP2Win = p2wins > p1wins;
    const _gjP1Col = gj_p1univ?gc(gj_p1univ):'#378ADD';
    const _gjP2Col = gj_p2univ?gc(gj_p2univ):'#1D9E75';
    const _gjScoreColP1 = _gjP1Win ? 'var(--win-col)' : _gjP2Win ? 'var(--lose-col)' : 'var(--text2)';
    const _gjScoreColP2 = _gjP2Win ? 'var(--win-col)' : _gjP1Win ? 'var(--lose-col)' : 'var(--text2)';
    const gj_typeLabel=proOnly?'프로리그 끝장전':'끝장전';
    const gj_typeBg=proOnly?'#E1F5EE':'#FAECE7';
    const gj_typeColor=proOnly?'#085041':'#993C1D';
    const gj_p1bg=_h2hPlayerBgPanel(s.p1, winner===s.p1, winner && winner!==s.p1);
    const gj_p2bg=_h2hPlayerBgPanel(s.p2, winner===s.p2, winner && winner!==s.p2);
    const _gjWrapFx = _safeHeadToHeadSideFx(gj_p1univ?gc(gj_p1univ):'#378ADD', gj_p2univ?gc(gj_p2univ):'#1D9E75');
    const _isMb = _h2hIsMobile();
    const _gridCols = _gjBulkOn ? 'auto 1fr auto 1fr' : '1fr auto 1fr';
    const _gap = _h2hScoreGapPx();
    const _scorePad = _h2hScorePadPx();
    const _gjCardMode = _h2hCardMode();
    const _gjBodyHTML = _h2hCardBody(_gjCardMode, s, p1wins, p2wins, winner, _gjP1Col, _gjP2Col, _gridCols, _isMb, _scorePad, _gap, bulkCbGj, gj_p1bg, gj_p2bg, _gjScoreColP1, _gjScoreColP2);
    h+=`<div class="h2h-rec-card" style="border:var(--h2h-card-border,1px solid var(--border));border-bottom:var(--h2h-card-border-bottom,none);border-radius:var(--h2h-card-radius,12px);margin-bottom:var(--h2h-card-gap,8px);overflow:hidden;box-shadow:var(--h2h-card-shadow,none);${_gjWrapFx||'background:var(--white);'}">
      <div style="cursor:pointer" onclick="openGJSessionPopup('${_gjSessKey}')">${_gjBodyHTML}</div>
      <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:${_isMb?'7px 10px':'8px 14px'};background:var(--bg2);flex-wrap:wrap">
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${s.d||'날짜 미정'}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${gj_typeBg};color:${gj_typeColor}">${gj_typeLabel}</span>
        ${s.n?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#FEF3C7;color:#92400E">🏆 ${escHTML(s.n)}</span>`:''}
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${s.games.length}경기</span>
        <span style="margin-left:auto"></span>
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
    h+=`<span style="font-size:var(--fs-caption);color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}
