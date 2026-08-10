/* ══════════════════════════════════════════════════════════════
   대전기록 - 메인 탭 네비게이터 (history-render-tabs.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function rHist(C,T){
  T.innerText='📅 대전 기록';
  // (요청사항) 대전기록탭: 필터 항상 열기로 고정 (접기 버튼 제거)
  const _lockOpen = true;
  window._histFilterOpen = true;

  const _mini = (typeof miniM!=='undefined' && Array.isArray(miniM)) ? miniM : [];
  const _ck = (typeof ckM!=='undefined' && Array.isArray(ckM)) ? ckM : [];
  const _univm = (typeof univM!=='undefined' && Array.isArray(univM)) ? univM : [];
  const _pro = (typeof proM!=='undefined' && Array.isArray(proM)) ? proM : [];
  const _ind = (typeof indM!=='undefined' && Array.isArray(indM)) ? indM : [];
  const _gj = (typeof gjM!=='undefined' && Array.isArray(gjM)) ? gjM : [];
  const _tt = (typeof ttM!=='undefined' && Array.isArray(ttM)) ? ttM : [];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _proTourneys = (typeof proTourneys!=='undefined' && Array.isArray(proTourneys)) ? proTourneys : [];

  const tabDefs=[
    {id:'all',      grp:'종합',   lbl:'전체 통합'},
    {id:'psearch',  grp:'종합',   lbl:'스트리머별 검색'},
    {id:'ind',      grp:'개인',    lbl:'🎮 개인전'},
    {id:'gj',       grp:'개인',    lbl:'⚔️ 끝장전'},
    // (요청, 2026-08-10) 팀경기 탭 순서: 시빌워 → 미니대전 → 대학대전 → 대학CK
    // (다른 화면의 "팀경기" 탭 순서와 동일하게 맞춤)
    {id:'civil',    grp:'팀경기',  lbl:'⚔️ 시빌워'},
    {id:'mini',     grp:'팀경기',  lbl:'⚡ 미니대전'},
    {id:'univm',    grp:'팀경기',  lbl:'🏟️ 대학대전'},
    {id:'ck',       grp:'팀경기',  lbl:'🤝 대학CK'},
    {id:'tourney',  grp:'대회',    lbl:'🎖️ 대회 (토너먼트)'},
    {id:'tiertour', grp:'대회',    lbl:'🎯 티어대회'},
    // (요청) 표기/순서: 일반 → 중장전 → 대회 …
    {id:'pro',      grp:'프로리그', lbl:'🏅 일반'},
    {id:'progj',    grp:'프로리그', lbl:'⚔️ 끝장전'},
    // (요청사항) 대전기록 > 프로리그 하위에 "대회" 탭이 있고,
    // 그 아래 하위메뉴에서 조별리그/토너먼트/팀전/중장전 기록을 선택
    {id:'procomp',    grp:'프로리그', lbl:'🏆 대회 기록', disp:'🏆 대회'},
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
      tabDefs.push({id:'ext', grp:'외부', lbl:'📎', disp:(typeof getTabLabel==='function'?getTabLabel('history','ext','📎'):'📎')});
      // 외부2: 관리자 전용(iframe)
      tabDefs.push({id:'ext2', grp:'외부', lbl:'🌐 외부2', disp:(typeof getTabLabel==='function'?getTabLabel('history','ext2','🌐 외부2'):'🌐 외부2')});
      // 외부3: 관리자 전용(iframe, 페이지 이동 지원)
      tabDefs.push({id:'ext3', grp:'외부', lbl:'🌐 외부3', disp:(typeof getTabLabel==='function'?getTabLabel('history','ext3','🌐 외부3'):'🌐 외부3')});
    }
  }catch(e){}
  // (버그픽스, 2026-08-10) 티어대회 하위탭(tiertour-gen/-league/-bkt)은 tabDefs에 별도 등록돼 있지
  // 않아 그룹(대회) 인식이 깨지던 문제 → 'tiertour'로 정규화해서 찾는다
  const _histSubForGroup = String(histSub||'').startsWith('tiertour-') ? 'tiertour' : histSub;
  const curTab=tabDefs.find(t=>t.id===_histSubForGroup)||tabDefs[0];
  let _histLastByGroup={};
  try{ _histLastByGroup = JSON.parse(localStorage.getItem('su_hist_last_by_group')||'{}')||{}; }catch(e){ _histLastByGroup={}; }
  try{
    if(curTab?.grp){
      _histLastByGroup[curTab.grp]=histSub;
      localStorage.setItem('su_hist_last_by_group', JSON.stringify(_histLastByGroup));
    }
  }catch(e){}
  const grps=[...new Set(tabDefs.map(t=>t.grp))];
  // 과거/잘못된 histSub 값으로 들어왔을 때는 "대회" 탭으로 귀속
  if(histSub==='procomptn' || histSub==='procompteam' || histSub==='procompgj'){
    histSub='procomp';
    try{ openDetails={}; }catch(e){}
  }
  // (삭제됨) 1:1 상대전적 탭 — 과거 저장된 값이 남아있으면 "전체 통합"으로 귀속
  if(histSub==='vs'){
    histSub='all';
    try{ openDetails={}; }catch(e){}
  }
  const needDateFilter=['mini','civil','ck','univm','comp','tourney','pro','ind','gj','progj','tiertour','tiertour-gen','tiertour-league','tiertour-bkt','procomp','all'].includes(histSub);
  const _histBulkKeyTop = (()=>{
    if(!isLoggedIn) return '';
    if(histSub==='mini' || histSub==='civil' || histSub==='univm' || histSub==='ck' || histSub==='pro') return histSub;
    if(histSub==='tiertour') return 'tt';
    return '';
  })();
  const _histBulkBtnTop = _histBulkKeyTop
    ? `<button onclick="toggleBulkMode('${_histBulkKeyTop}')" style="flex-shrink:0;white-space:nowrap;padding:3px 10px;border-radius:12px;border:1.5px solid ${_bulkModes[_histBulkKeyTop]?'#dc2626':'var(--border2)'};background:${_bulkModes[_histBulkKeyTop]?'#fff1f2':'var(--surface)'};color:${_bulkModes[_histBulkKeyTop]?'#dc2626':'var(--text3)'};font-size:var(--fs-caption);font-weight:700;cursor:pointer">${_bulkModes[_histBulkKeyTop]?'✕ 선택 해제':'☑ 일괄 선택'}</button>`
    : '';

  // 상단: 기록 메뉴(그룹) 버튼 (연/월/정렬은 하위메뉴 우측에 배치)
  let h=`<div class="hist-topbar no-export">`;
  h+=`  <div class="hist-topbar-left">`;
  // (요청사항) 필터는 '종합' 좌측(=그룹바 맨 좌측)에 배치
  if((localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1' && !_lockOpen){
    h+=`<button class="pill ${window._histFilterOpen?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histFilterOpen=!window._histFilterOpen;render()">🔍 필터 ${window._histFilterOpen?'▲':'▼'}</button>`;
  }
  grps.forEach(g=>{
    const isOn=(g==='외부') ? (histSub==='ext') : (curTab.grp===g);
    const firstId=tabDefs.find(t=>t.grp===g).id;
    const gLbl=(typeof getTabLabel==='function') ? getTabLabel('historyGroup', g, g) : g;
    const _lastId=_histLastByGroup?.[g];
    const targetId=(g==='외부') ? firstId : ((typeof _lastId==='string' && tabDefs.some(t=>t.id===_lastId && t.grp===g)) ? _lastId : firstId);
    h+=`<button class="pill ${isOn?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='${targetId}';openDetails={};render()">${gLbl}</button>`;
    // '외부' 우측에 '외부2' 버튼 노출(관리자 전용)
    if(g==='외부' && tabDefs.some(t=>t.id==='ext2')){
      const isOn2=(histSub==='ext2');
      h+=`<button class="pill ${isOn2?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='ext2';openDetails={};render()">${(typeof getTabLabel==='function') ? getTabLabel('history','ext2','외부2') : '외부2'}</button>`;
    }
    // '외부' 우측에 '외부3' 버튼 노출(관리자 전용)
    if(g==='외부' && tabDefs.some(t=>t.id==='ext3')){
      const isOn3=(histSub==='ext3');
      h+=`<button class="pill ${isOn3?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='ext3';openDetails={};render()">${(typeof getTabLabel==='function') ? getTabLabel('history','ext3','외부3') : '외부3'}</button>`;
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
    // 탭별 활성(on) 색상: 시빌워는 빨간색, 미니대전은 보라색, 대학대전은 초록색 등
    const _TAB_PILL_COL = {
      civil:{bg:'linear-gradient(135deg,#7f1d1d,#b91c1c 60%,#ef4444)',bd:'rgba(239,68,68,.30)',shadow:'rgba(185,28,28,.28)'},
      mini: {bg:'linear-gradient(135deg,#3b0764,#7c3aed 58%,#a78bfa)',bd:'rgba(167,139,250,.30)',shadow:'rgba(124,58,237,.24)'},
      univm:{bg:'linear-gradient(135deg,#14532d,#16a34a 58%,#4ade80)',bd:'rgba(74,222,128,.30)', shadow:'rgba(22,163,74,.24)'},
      ck:   {bg:'linear-gradient(135deg,#78350f,#f59e0b 58%,#fcd34d)',bd:'rgba(252,211,77,.30)', shadow:'rgba(245,158,11,.24)'},
      pro:  {bg:'linear-gradient(135deg,#075985,#0ea5e9 58%,#7dd3fc)',bd:'rgba(125,211,252,.30)',shadow:'rgba(14,165,233,.24)'},
      tt:   {bg:'linear-gradient(135deg,#064e3b,#10b981 58%,#6ee7b7)',bd:'rgba(110,231,183,.30)',shadow:'rgba(16,185,129,.24)'},
      gj:   {bg:'linear-gradient(135deg,#78350f,#d97706 58%,#fbbf24)',bd:'rgba(251,191,36,.30)', shadow:'rgba(217,119,6,.24)'},
      progj:{bg:'linear-gradient(135deg,#7f1d1d,#b91c1c 58%,#ef4444)',bd:'rgba(239,68,68,.30)', shadow:'rgba(185,28,28,.24)'},
    };
    h+=`<div class="hist-inlinebar no-export">`;
    grpTabs.forEach(t=>{
      const isOn=histSub===t.id;
      const _tc = _TAB_PILL_COL[t.id];
      const _onStyle = (isOn && _tc) ? `background:${_tc.bg};border-color:${_tc.bd};box-shadow:0 12px 26px ${_tc.shadow};color:#fff;font-weight:800;` : '';
      h+=`<button class="pill ${isOn?'on':''}" style="flex-shrink:0;white-space:nowrap;${_onStyle}" onclick="histSub='${t.id}';openDetails={};render()">${t.disp||t.lbl}</button>`;
    });
    if(_hasCtrl){
      h+=`<span class="hist-inline-sep"></span>`;
      h+=`<div class="hist-ctrl-group">`;
      // (요청사항) 메뉴 버튼 우측: 연/월 → 구분선 → 최신/오래된순 → 구분선 → 보기모드
      h+=buildYearMonthFilterControls('hist', true);
      // (수정, 2026-08-10) 대회/티어대회 탭도 다른 탭과 동일하게 "연도" 필터 바로 우측
      // 같은 줄에 최신순/오래된순 버튼을 둔다 (이전엔 별도의 콘텐츠 내 줄에 있었음)
      h+=`<span class="hist-inline-sep"></span>`;
      h+=`<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';window._ttPageMap=window._ttPageMap||{};window._ttPageMap['tiertour-gen']=0;render()">최신순 ↓</button>`;
      h+=`<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';window._ttPageMap=window._ttPageMap||{};window._ttPageMap['tiertour-gen']=0;render()">오래된순 ↑</button>`;
      if(histSub==='all'){
        h+=`<span class="hist-inline-sep"></span>`;
        h+=histAllViewModeBarHTML();
      } else if(typeof _histTabAltSupported==='function' && _histTabAltSupported(histSub) && typeof histTabViewModeBarHTML==='function'){
        // (요청사항) 개인전/끝장전/팀경기/프로리그 일반·끝장전 탭의 "기본/미니 기본/그리드/
        // 컴팩트 테이블형" 보기모드 버튼도 "최신순/오래된순" 바로 우측(같은 줄)에 이어붙인다
        h+=`<span class="hist-inline-sep"></span>`;
        h+=histTabViewModeBarHTML(histSub, true);
      } else if(histSub==='tourney' && typeof compAltViewModeBarHTML==='function'){
        // (수정, 2026-08-10) 대회 탭 보기모드 버튼도 같은 줄로 이동
        h+=`<span class="hist-inline-sep"></span>`;
        h+=compAltViewModeBarHTML('histtourney', true);
      } else if(String(histSub||'').startsWith('tiertour') && typeof compAltViewModeBarHTML==='function'){
        // (수정, 2026-08-10) 티어대회 탭(전체/일반/조별리그/토너먼트) 보기모드 버튼도 같은 줄로 이동
        h+=`<span class="hist-inline-sep"></span>`;
        h+=compAltViewModeBarHTML('histtt', true);
      } else if(histSub==='procomp' && typeof pcAltViewModeBarHTML==='function'){
        // (수정, 2026-08-10) 프로리그 > 대회 기록 탭의 기본/미니 기본/그리드/컴팩트 테이블형
        // 보기모드 버튼도 하위메뉴 아래 별도 줄이 아니라 "연도/최신순" 줄에 이어붙인다
        const _pcAltTab = (typeof _HIST_PC_SUB_TO_ALT_TAB!=='undefined' && _HIST_PC_SUB_TO_ALT_TAB[window._histProCompSub||'league']) || 'pcleague';
        h+=`<span class="hist-inline-sep"></span>`;
        h+=pcAltViewModeBarHTML(_pcAltTab, true);
      }
      h+=_histBulkBtnTop;
      h+=`</div>`;
    }
    h+=`</div>`;
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
  else if(histSub==='civil') h+=(typeof histTabWithViewModes==='function')
    ? histTabWithViewModes('civil', ()=>recSummaryListHTML(_mini.filter(m=>m && (m.type==='civil'||(m.a==='A팀'&&m.b==='B팀'))),'civil','hist'), {suppressBar:true})
    : recSummaryListHTML(_mini.filter(m=>m && (m.type==='civil'||(m.a==='A팀'&&m.b==='B팀'))),'civil','hist');
  else if(histSub==='mini') h+=(typeof histTabWithViewModes==='function')
    ? histTabWithViewModes('mini', ()=>recSummaryListHTML(_mini.filter(m=>m && (m.type!=='civil'&&!(m.a==='A팀'&&m.b==='B팀'))),'mini','hist'), {suppressBar:true})
    : recSummaryListHTML(_mini.filter(m=>m && (m.type!=='civil'&&!(m.a==='A팀'&&m.b==='B팀'))),'mini','hist');
  else if(histSub==='ind') h+=(typeof histTabWithViewModes==='function')
    ? histTabWithViewModes('ind', ()=>typeof indRecordsHTML==='function'?indRecordsHTML():'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>', {suppressBar:true})
    : (typeof indRecordsHTML==='function'?indRecordsHTML():'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>');
  else if(histSub==='gj') h+=(typeof histTabWithViewModes==='function')
    ? histTabWithViewModes('gj', ()=>typeof gjRecordsHTML==='function'?gjRecordsHTML(false):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>', {suppressBar:true})
    : (typeof gjRecordsHTML==='function'?gjRecordsHTML(false):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>');
  else if(histSub==='progj') h+=(typeof histTabWithViewModes==='function')
    ? histTabWithViewModes('progj', ()=>typeof gjRecordsHTML==='function'?gjRecordsHTML(true):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>', {suppressBar:true})
    : (typeof gjRecordsHTML==='function'?gjRecordsHTML(true):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>');
  else if(histSub==='ck') h+=(typeof histTabWithViewModes==='function')
    ? histTabWithViewModes('ck', ()=>recSummaryListHTML(_ck,'ck','hist'), {suppressBar:true})
    : recSummaryListHTML(_ck,'ck','hist');
  else if(histSub==='univm') h+=(typeof histTabWithViewModes==='function')
    ? histTabWithViewModes('univm', ()=>recSummaryListHTML(_univm,'univm','hist'), {suppressBar:true})
    : recSummaryListHTML(_univm,'univm','hist');
  else if(histSub==='comp') h+=compSummaryListHTML('hist');
  else if(histSub==='tourney'){
    // (요청, 2026-08-10) 대회 탭: 기본 / 미니 기본 / 그리드 / 컴팩트 테이블형
    const _tcMode=(typeof compAltViewMode==='function')?compAltViewMode('histtourney'):'basic';
    if(typeof compAltTitleModeBarHTML==='function'){
      // (수정, 2026-08-10) 정렬/보기모드 버튼은 상단 "연도" 필터 줄로 이동 → 제목 배지만 표시
      h+=compAltTitleModeBarHTML('histtourney','🎖️ 대회 기록',{bg:'#eff6ff',bd:'#bfdbfe',col:'#2563eb',controls:false});
    }
    h+=(_tcMode!=='basic' && typeof compAltRenderHTML==='function')
      ? compAltRenderHTML('histtourney', compAltRecItems((typeof histTourneyAltMatches==='function')?histTourneyAltMatches():[], 'histcomp'))
      : histTourneyHTML('hist');
  }
  else if(histSub==='tiertour'||histSub==='tiertour-gen'||histSub==='tiertour-league'||histSub==='tiertour-bkt'){
    // 티어대회 하위탭 색상: 에메랄드/초록 계열
    const _ttOnStyle=(active)=>active?'background:linear-gradient(135deg,#064e3b,#10b981 58%,#6ee7b7);border-color:rgba(110,231,183,.30);box-shadow:0 12px 26px rgba(16,185,129,.24);color:#fff;font-weight:800;':'';
    const _ttSubBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">
      <button class="pill ${histSub==='tiertour'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_ttOnStyle(histSub==='tiertour')}" onclick="histSub='tiertour';openDetails={};render()">📋 전체</button>
      <button class="pill ${histSub==='tiertour-gen'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_ttOnStyle(histSub==='tiertour-gen')}" onclick="histSub='tiertour-gen';openDetails={};window._ttPageMap=window._ttPageMap||{};window._ttPageMap['tiertour-gen']=0;render()">📝 일반</button>
      <button class="pill ${histSub==='tiertour-league'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_ttOnStyle(histSub==='tiertour-league')}" onclick="histSub='tiertour-league';openDetails={};render()">📅 조별리그</button>
      <button class="pill ${histSub==='tiertour-bkt'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_ttOnStyle(histSub==='tiertour-bkt')}" onclick="histSub='tiertour-bkt';openDetails={};render()">🏆 토너먼트 기록</button>
    </div>`;
    h+=_ttSubBar;
    try{
      if((typeof ttM==='undefined' || !Array.isArray(ttM) || !ttM.length) && typeof window.ensureTierTourRecords==='function'){
        window.ensureTierTourRecords();
      }
    }catch(e){}
    // (요청사항) 티어대회 기록이 "사라져 보이는" 현상 방지:
    // 일부 데이터는 _proKey가 붙어도 ttM(티어대회 기록)에 포함되므로, 전체 목록에서는 제외하지 않음
    const _ttAll=(typeof ttM!=='undefined' && Array.isArray(ttM)) ? ttM : [];
    const _ttGen=_ttAll.filter(m=>!m.stage||m.stage==='general'||m.stage==='grp');
    const _ttLeague=_ttAll.filter(m=>m.stage==='league');
    const _ttBkt=_ttAll.filter(m=>m.stage==='bkt');
    const _ttSrc=histSub==='tiertour-gen'?_ttGen:histSub==='tiertour-league'?_ttLeague:histSub==='tiertour-bkt'?_ttBkt:_ttAll;
    const _emptyIco=histSub==='tiertour-bkt'?'🏆':histSub==='tiertour-league'?'📅':'🎯';
    const _emptyMsg=histSub==='tiertour-bkt'?'토너먼트 기록이 없습니다':histSub==='tiertour-league'?'조별리그 기록이 없습니다':histSub==='tiertour-gen'?'일반 기록이 없습니다':'티어대회 기록이 없습니다';
    // tiertour-gen 전용 페이지네이션 (20개 단위)
    const _ttPageOpts = histSub==='tiertour-gen' ? {pageSize:20, pageKey:'tiertour-gen'} : null;
    // (요청, 2026-08-10) 티어대회 탭: 기본 / 미니 기본 / 그리드 / 컴팩트 테이블형
    const _ttAltMode=(typeof compAltViewMode==='function')?compAltViewMode('histtt'):'basic';
    if(typeof compAltTitleModeBarHTML==='function'){
      const _ttTitle=histSub==='tiertour-bkt'?'🏆 토너먼트 기록':histSub==='tiertour-league'?'📅 조별리그 기록':histSub==='tiertour-gen'?'📝 일반 기록':'🎯 티어대회 기록';
      // (수정, 2026-08-10) 정렬/보기모드 버튼은 상단 "연도" 필터 줄로 이동 → 제목 배지만 표시
      h+=compAltTitleModeBarHTML('histtt',_ttTitle,{bg:'#ecfdf5',bd:'#86efac',col:'#059669',controls:false});
    }
    if(_ttAltMode!=='basic' && typeof compAltRenderHTML==='function'){
      const _ttAltType=histSub==='tiertour-bkt'?'ttbkt':histSub==='tiertour-league'?'ttleague':'ttgen';
      h+=compAltRenderHTML('histtt', compAltRecItems(_ttSrc.filter(m=>typeof passDateFilter!=='function'||passDateFilter(m.d||'')), _ttAltType));
      C.innerHTML=h;
      return;
    }
    h+=_ttSrc.length?recSummaryListHTMLFiltered(_ttSrc,'tt','hist',undefined,_ttPageOpts):`<div class="empty-state"><div class="empty-state-icon">${_emptyIco}</div><div class="empty-state-title">${_emptyMsg}</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div><div style="margin-top:10px"><button class="btn btn-w btn-sm" onclick="try{window.ensureTierTourRecords&&window.ensureTierTourRecords();}catch(e){};render()">🔄 티어대회 기록 다시 불러오기</button></div></div>`;
  }
  else if(histSub==='pro') h+=(typeof histTabWithViewModes==='function')
    ? histTabWithViewModes('pro', ()=>recSummaryListHTML(_pro,'pro','hist'), {suppressBar:true})
    : recSummaryListHTML(_pro,'pro','hist');
  else if(histSub==='procomp') h+=histProCompHTML();
  else if(histSub==='psearch') h+=histPlayerSearchHTML();
  C.innerHTML=h;
}

// ─────────────────────────────────────────────────────────────
// 관리자 전용: 외부 자료(붙여넣기 파싱)
// - eloboard 페이지를 자동 수집하는 대신, 표를 복사→붙여넣기 해서 파싱
// - 날짜/승자/패자/맵/ELO/경기방식 컬럼으로 정규화
// ─────────────────────────────────────────────────────────────
// 외부 / 외부2 / 외부3 컨트롤러는 `js/history-external-ui.js`로 분리


/* ══════════════════════════════════════
   대전 기록 > 전체 통합 탭 — 수정 버튼 헬퍼
   ind/gj 타입: 세션 캐시에서 sessKey를 찾아 인라인 수정 모달(맵 수정 포함)로 연결
   세션 캐시에 없으면 단건 openRE 폴백
══════════════════════════════════════ */
