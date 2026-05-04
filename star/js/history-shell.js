/* history-shell.js: rebuilt from v127 history.js */
function _histBtnPair(kind){
  try{
    if(typeof getHistButtonColorPair==='function') return getHistButtonColorPair(kind);
  }catch(e){}
  return kind==='ck'
    ? { a:'#6366f1', b:'#f59e0b' }
    : kind==='pro'
      ? { a:'#06b6d4', b:'#ec4899' }
      : kind==='ind'
        ? { a:'#8b5cf6', b:'#ec4899' }
        : kind==='gj'
          ? { a:'#f97316', b:'#ef4444' }
          : kind==='progj'
            ? { a:'#06b6d4', b:'#8b5cf6' }
            : { a:'#8b5cf6', b:'#f97316' };
}
function _histModePair(mode){
  const mk = String(mode||'').trim();
  return (mk==='ck')
    ? _histBtnPair('ck')
    : (mk==='ind')
      ? _histBtnPair('ind')
      : (mk==='gj')
        ? _histBtnPair('gj')
        : (mk==='progj')
          ? _histBtnPair('progj')
    : (mk==='pro' || mk==='progj' || mk==='procomp' || mk==='procompgj' || mk==='procompteam' || mk==='procomptn')
      ? _histBtnPair('pro')
      : _histBtnPair('general');
}
function _histModeAccent(mode){
  const mk = String(mode||'').trim();
  const p = _histModePair(mk);
  return mk==='gj' ? p.b : p.a;
}

function rHist(C,T){
  T.innerText='📅 대전 기록';
  // (A안) 하위 탭/기간 필터를 접기/펼치기
  const _lockOpen = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
  if(window._histFilterOpen===undefined) window._histFilterOpen=_lockOpen;
  if(_lockOpen) window._histFilterOpen = true;

  const tabDefs=[
    {id:'all',      grp:'종합',   lbl:'📋 전체 통합'},
    {id:'psearch',  grp:'종합',   lbl:'🔍 스트리머별 검색'},
    {id:'race',     grp:'종합',   lbl:'🧬 종족 승률'},
    {id:'vs',       grp:'종합',   lbl:'⚔️ 1:1 상대전적'},
    {id:'ind',      grp:'개인',    lbl:'🎮 개인전'},
    {id:'gj',       grp:'개인',    lbl:'⚔️ 끝장전'},
    {id:'mini',     grp:'팀경기',  lbl:'⚡ 미니대전'},
    {id:'ck',       grp:'팀경기',  lbl:'🤝 대학CK'},
    {id:'univm',    grp:'팀경기',  lbl:'🏟️ 대학대전'},
    {id:'civil',    grp:'팀경기',  lbl:'⚔️ 시빌워'},
    {id:'tourney',  grp:'대회',    lbl:'🎖️ 대회 (토너먼트)'},
    {id:'tiertour', grp:'대회',    lbl:'🎯 티어대회'},
    // (요청) 표기/순서: 일반 → 중장전 → 대회 …
    {id:'pro',      grp:'프로리그', lbl:'🏅 일반'},
    {id:'progj',    grp:'프로리그', lbl:'⚔️ 끝장전'},
    // (요청사항) 대전기록 > 프로리그 하위에 "대회" 탭이 있고,
    // 그 아래 하위메뉴에서 조별리그/토너먼트/팀전/중장전 기록을 선택
    {id:'procomp',    grp:'프로리그', lbl:'🏆 대회 기록', disp:'🏆 대회'},
    {id:'univstat', grp:'통계',   lbl:'🏛️ 대학별 기록'},
    {id:'univrank', grp:'통계',   lbl:'🏛️ 대학별 포인트'},
    {id:'univcomp',  grp:'통계',   lbl:'⚔️ 대학 전력 비교'},
  ];
  // (탭 라벨 설정) 표시 이름만 설정에서 교체 가능
  try{
    if(typeof getTabLabel==='function'){
      tabDefs.forEach(t=>{
        t.disp = getTabLabel('history', t.id, t.disp||t.lbl);
      });
    }
  }catch(e){}
  // (요청사항) 관리자 전용 외부 자료 탭
  try{
    if(typeof isLoggedIn!=='undefined' && isLoggedIn && !(typeof isSubAdmin!=='undefined' && isSubAdmin)){
      tabDefs.push({id:'ext', grp:'외부', lbl:'📎'});
      // 외부2: 관리자 전용(iframe)
      tabDefs.push({id:'ext2', grp:'외부', lbl:'🌐 외부2'});
      // 외부3: 관리자 전용(iframe, 페이지 이동 지원)
      tabDefs.push({id:'ext3', grp:'외부', lbl:'🌐 외부3'});
    }
  }catch(e){}
  const curTab=tabDefs.find(t=>t.id===histSub)||tabDefs[0];
  const grps=[...new Set(tabDefs.map(t=>t.grp))];
  // 과거/잘못된 histSub 값으로 들어왔을 때는 "대회" 탭으로 귀속
  if(histSub==='procomptn' || histSub==='procompteam' || histSub==='procompgj'){
    histSub='procomp';
    try{ openDetails={}; }catch(e){}
  }
  const needDateFilter=['mini','civil','ck','univm','comp','tourney','pro','race','ind','gj','progj','tiertour','procomp','all'].includes(histSub);
  const _topBulkKey = histSub==='civil' ? 'civil'
    : histSub==='mini' ? 'mini'
    : histSub==='ck' ? 'ck'
    : histSub==='univm' ? 'univm'
    : histSub==='pro' ? 'pro'
    : histSub==='procomp' ? 'comp'
    : (histSub==='tiertour' || histSub==='tiertour-gen' || histSub==='tiertour-league' || histSub==='tiertour-bkt') ? 'tt'
    : '';
  const _topCanBulk = !!_topBulkKey && !!(typeof isLoggedIn!=='undefined' && isLoggedIn);
  const _topBulkOn = _topCanBulk && !!_bulkModes[_topBulkKey];
  const _topBulkBtns = _topCanBulk
    ? `${_topBulkOn?`<button class="pill danger-pill" style="flex-shrink:0;white-space:nowrap" onclick="bulkDeleteRecs('${_topBulkKey}')">🗑️ 선택 삭제</button>`:''}<button class="pill bulk-pill ${_topBulkOn?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="toggleBulkMode('${_topBulkKey}')">${_topBulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>`
    : '';

  // 상단: 기록 메뉴(그룹) 버튼 (연/월/정렬은 하위메뉴 우측에 배치)
  let h=`<div class="hist-topbar no-export">`;
  h+=`  <div class="hist-topbar-left">`;
  // (요청사항) 필터는 '종합' 좌측(=그룹바 맨 좌측)에 배치
  if((localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1' && !_lockOpen){
    h+=`<button class="pill ${window._histFilterOpen?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histFilterOpen=!window._histFilterOpen;render()">🔍 필터 ${window._histFilterOpen?'▲':'▼'}</button>`;
  }
  grps.forEach(g=>{
    const isOn=curTab.grp===g;
    const firstId=tabDefs.find(t=>t.grp===g).id;
    h+=`<button class="pill ${isOn?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='${firstId}';openDetails={};render()">${g}</button>`;
    // '외부' 우측에 '외부2' 버튼 노출(관리자 전용)
    if(g==='외부' && tabDefs.some(t=>t.id==='ext2')){
      const isOn2=(histSub==='ext2');
      h+=`<button class="pill ${isOn2?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='ext2';openDetails={};render()">외부2</button>`;
    }
    // '외부' 우측에 '외부3' 버튼 노출(관리자 전용)
    if(g==='외부' && tabDefs.some(t=>t.id==='ext3')){
      const isOn3=(histSub==='ext3');
      h+=`<button class="pill ${isOn3?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='ext3';openDetails={};render()">외부3</button>`;
    }
  });
  h+=`  </div>`;
  h+=`</div>`;

  // (요청사항) 중복되는 하위 버튼(전체통합/개인전 등) 제거: 별도 '현재선택 버튼줄' 없음

  // 선택 그룹 내 탭 + 기간 필터는 필터가 열렸을 때만 표시
  const grpTabs=tabDefs.filter(t=>t.grp===curTab.grp);
  const _enableSubFilter = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  if((_enableSubFilter?window._histFilterOpen:true) && grpTabs.length>1 && curTab.grp!=='외부'){
    // (요청사항) "우측 끝 고정"이 아니라, 하위메뉴 버튼 "바로 우측"에
    // 연도/월 + 최신/오래된순이 이어서 붙어야 함 (한 줄 드래그 메뉴)
    const _hasCtrl = needDateFilter && (typeof buildYearMonthFilterControls==='function');
    h+=`<div class="hist-inlinebar no-export">`;
    grpTabs.forEach(t=>{
      const isOn=histSub===t.id;
      h+=`<button class="pill ${isOn?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='${t.id}';openDetails={};render()">${t.disp||t.lbl}</button>`;
    });
    if(_hasCtrl){
      h+=`<span class="hist-inline-sep"></span>`;
      h+=`<div class="hist-ctrl-group">`;
      // (요청사항) 메뉴 버튼 우측: 연/월 → 그 우측에 최신/오래된순
      h+=buildYearMonthFilterControls('hist', true);
      h+=`<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`;
      h+=`<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`;
      h+=_topBulkBtns;
      h+=`</div>`;
    }
    h+=`</div>`;
  } else {
    // 하위메뉴가 없는 그룹이라도(예: 버튼 1개 그룹) 필요한 경우 상단에 컨트롤을 한 줄로 제공
    if((_enableSubFilter?window._histFilterOpen:true) && needDateFilter && (typeof buildYearMonthFilterControls==='function')){
      h+=`<div class="hist-inlinebar no-export">`;
      h+=`<div class="hist-ctrl-group">`;
      h+=buildYearMonthFilterControls('hist', true);
      h+=`<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`;
      h+=`<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`;
      h+=_topBulkBtns;
      h+=`</div>`;
      h+=`</div>`;
    }
  }
  if(histSub==='vs'){
    h+=vsSearchHTML();
    h+=univVsHTML();
    C.innerHTML=h;
    // 두 선수 이미 선택된 경우 결과 즉시 렌더
    if(vsNameA&&vsNameB&&vsNameA!==vsNameB) _vsRenderResult();
    renderUnivVsResult();
    return;
  }
  if(histSub==='race'){
    if(typeof raceSummaryHTML==='function'){
      h+=raceSummaryHTML();
      C.innerHTML=h;
      return;
    }
    rRace(C,T);
    return;
  }
  if(histSub==='univstat'){h+=rHistUnivStat();C.innerHTML=h;return;}
  if(histSub==='univcomp'){try{h+=histUnivCompHTML();}catch(e){h+=`<div style="padding:20px;color:red;font-size:12px">⚠️ 오류: ${e.message}</div>`;console.error('histUnivCompHTML error:',e);}C.innerHTML=h;return;}
  if(histSub==='univrank'){
    if(typeof rUnivBodyHTML==='function'){
      h+=rUnivBodyHTML();
      C.innerHTML=h;
      return;
    }
    rUniv(C,T);
    return;
  }
  if(histSub==='ext'){
    h+=histExternalHTML();
    C.innerHTML=h;
    return;
  }
  if(histSub==='ext2'){
    h+=histExternal2HTML();
    C.innerHTML=h;
    return;
  }
  if(histSub==='ext3'){
    h+=histExternal3HTML();
    C.innerHTML=h;
    return;
  }
  if(histSub==='all') h+=histAllHTML();
  else if(histSub==='civil') h+=recSummaryListHTML(miniM.filter(m=>m.type==='civil'||(m.a==='A팀'&&m.b==='B팀')),'mini','hist');
  else if(histSub==='mini') h+=recSummaryListHTML(miniM.filter(m=>m.type!=='civil'&&!(m.a==='A팀'&&m.b==='B팀')),'mini','hist');
  else if(histSub==='ind') h+=typeof indRecordsHTML==='function'?indRecordsHTML():'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='gj') h+=typeof gjRecordsHTML==='function'?gjRecordsHTML(false):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='progj') h+=typeof gjRecordsHTML==='function'?gjRecordsHTML(true):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='ck') h+=recSummaryListHTML(ckM,'ck','hist');
  else if(histSub==='univm') h+=recSummaryListHTML(univM,'univm','hist');
  else if(histSub==='comp') h+=compSummaryListHTML('hist');
  else if(histSub==='tourney') h+=histTourneyHTML('hist');
  else if(histSub==='tiertour'||histSub==='tiertour-gen'||histSub==='tiertour-league'||histSub==='tiertour-bkt'){
    const _pendingInitialData = !!window.__suInitialDataPending;
    const _hasTierTourneys = (typeof tourneys!=='undefined' && Array.isArray(tourneys)) ? tourneys.some(t=>t && t.type==='tier') : false;
    if(_hasTierTourneys && (typeof ttM==='undefined' || !Array.isArray(ttM) || !ttM.length)){
      try{
        if(typeof _ttMigrated!=='undefined') _ttMigrated = false;
        if(typeof _migrateTierTourneys==='function') _migrateTierTourneys();
      }catch(e){}
    }
    const _ttSubBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">
      <button class="pill ${histSub==='tiertour'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='tiertour';openDetails={};render()">📋 전체</button>
      <button class="pill ${histSub==='tiertour-gen'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='tiertour-gen';openDetails={};render()">📝 일반</button>
      <button class="pill ${histSub==='tiertour-league'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='tiertour-league';openDetails={};render()">📅 조별리그</button>
      <button class="pill ${histSub==='tiertour-bkt'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='tiertour-bkt';openDetails={};render()">🏆 토너먼트 기록</button>
    </div>`;
    h+=_ttSubBar;
    if(_pendingInitialData && !_hasTierTourneys && (typeof ttM==='undefined' || !Array.isArray(ttM) || !ttM.length)){
      h+=`<div class="empty-state"><div class="empty-state-icon">🔄</div><div class="empty-state-title">티어대회 기록 불러오는 중</div><div class="empty-state-desc">초기 데이터를 적용하고 있습니다</div></div>`;
      C.innerHTML=h;
      return;
    }
    // (요청사항) 티어대회 기록이 "사라져 보이는" 현상 방지:
    // 일부 데이터는 _proKey가 붙어도 ttM(티어대회 기록)에 포함되므로, 전체 목록에서는 제외하지 않음
    const _ttAll=(typeof ttM!=='undefined' && Array.isArray(ttM)) ? ttM : [];
    const _ttGen=_ttAll.filter(m=>!m.stage||m.stage==='general'||m.stage==='grp');
    const _ttLeague=_ttAll.filter(m=>m.stage==='league');
    const _ttBkt=_ttAll.filter(m=>m.stage==='bkt');
    const _ttSrc=histSub==='tiertour-gen'?_ttGen:histSub==='tiertour-league'?_ttLeague:histSub==='tiertour-bkt'?_ttBkt:_ttAll;
    const _emptyIco=histSub==='tiertour-bkt'?'🏆':histSub==='tiertour-league'?'📅':'🎯';
    const _emptyMsg=histSub==='tiertour-bkt'?'토너먼트 기록이 없습니다':histSub==='tiertour-league'?'조별리그 기록이 없습니다':histSub==='tiertour-gen'?'일반 기록이 없습니다':'티어대회 기록이 없습니다';
    h+=_ttSrc.length?recSummaryListHTMLFiltered(_ttSrc,'tt','hist'):`<div class="empty-state"><div class="empty-state-icon">${_emptyIco}</div><div class="empty-state-title">${_emptyMsg}</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  else if(histSub==='pro') h+=recSummaryListHTML(proM,'pro','hist');
  else if(histSub==='procomp') h+=histProCompHTML();
  else if(histSub==='psearch') h+=histPlayerSearchHTML();
  C.innerHTML=h;
}

