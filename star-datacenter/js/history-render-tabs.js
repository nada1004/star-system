function rHist(C,T){
  T.innerText='📅 대전 기록';
  // (A안) 하위 탭/기간 필터를 접기/펼치기
  const _lockOpen = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
  if(window._histFilterOpen===undefined) window._histFilterOpen=_lockOpen;
  if(_lockOpen) window._histFilterOpen = true;

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
    {id:'race',     grp:'종합',   lbl:'종족 승률'},
    {id:'vs',       grp:'종합',   lbl:'1:1 상대전적'},
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
      tabDefs.push({id:'ext', grp:'외부', lbl:'📎', disp:(typeof getTabLabel==='function'?getTabLabel('history','ext','📎'):'📎')});
      // 외부2: 관리자 전용(iframe)
      tabDefs.push({id:'ext2', grp:'외부', lbl:'🌐 외부2', disp:(typeof getTabLabel==='function'?getTabLabel('history','ext2','🌐 외부2'):'🌐 외부2')});
      // 외부3: 관리자 전용(iframe, 페이지 이동 지원)
      tabDefs.push({id:'ext3', grp:'외부', lbl:'🌐 외부3', disp:(typeof getTabLabel==='function'?getTabLabel('history','ext3','🌐 외부3'):'🌐 외부3')});
    }
  }catch(e){}
  const curTab=tabDefs.find(t=>t.id===histSub)||tabDefs[0];
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
  const needDateFilter=['mini','civil','ck','univm','comp','tourney','pro','race','ind','gj','progj','tiertour','procomp','all'].includes(histSub);
  const _histBulkKeyTop = (()=>{
    if(!isLoggedIn) return '';
    if(histSub==='mini' || histSub==='civil' || histSub==='univm' || histSub==='ck' || histSub==='pro') return histSub;
    if(histSub==='tiertour') return 'tt';
    return '';
  })();
  const _histBulkBtnTop = _histBulkKeyTop
    ? `<button onclick="toggleBulkMode('${_histBulkKeyTop}')" style="flex-shrink:0;white-space:nowrap;padding:3px 10px;border-radius:12px;border:1.5px solid ${_bulkModes[_histBulkKeyTop]?'#dc2626':'var(--border2)'};background:${_bulkModes[_histBulkKeyTop]?'#fff1f2':'var(--surface)'};color:${_bulkModes[_histBulkKeyTop]?'#dc2626':'var(--text3)'};font-size:11px;font-weight:700;cursor:pointer">${_bulkModes[_histBulkKeyTop]?'✕ 선택 해제':'☑ 일괄 선택'}</button>`
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
      // (요청사항) 메뉴 버튼 우측: 연/월 → 그 우측에 최신/오래된순
      h+=buildYearMonthFilterControls('hist', true);
      h+=`<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';window._ttPageMap=window._ttPageMap||{};window._ttPageMap['tiertour-gen']=0;render()">최신순 ↓</button>`;
      h+=`<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';window._ttPageMap=window._ttPageMap||{};window._ttPageMap['tiertour-gen']=0;render()">오래된순 ↑</button>`;
      h+=_histBulkBtnTop;
      h+=`</div>`;
    }
    h+=`</div>`;
  }
  if(histSub==='vs'){
    h+=vsSearchHTML();
    h+=univVsHTML();
    C.innerHTML=h;
    // 두 선수 이미 선택된 경우 결과 즉시 렌더
    if(typeof vsNameA!=='undefined' && typeof vsNameB!=='undefined' && vsNameA&&vsNameB&&vsNameA!==vsNameB) _vsRenderResult();
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
  else if(histSub==='civil') h+=recSummaryListHTML(_mini.filter(m=>m && (m.type==='civil'||(m.a==='A팀'&&m.b==='B팀'))),'civil','hist');
  else if(histSub==='mini') h+=recSummaryListHTML(_mini.filter(m=>m && (m.type!=='civil'&&!(m.a==='A팀'&&m.b==='B팀'))),'mini','hist');
  else if(histSub==='ind') h+=typeof indRecordsHTML==='function'?indRecordsHTML():'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='gj') h+=typeof gjRecordsHTML==='function'?gjRecordsHTML(false):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='progj') h+=typeof gjRecordsHTML==='function'?gjRecordsHTML(true):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='ck') h+=recSummaryListHTML(_ck,'ck','hist');
  else if(histSub==='univm') h+=recSummaryListHTML(_univm,'univm','hist');
  else if(histSub==='comp') h+=compSummaryListHTML('hist');
  else if(histSub==='tourney') h+=histTourneyHTML('hist');
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
    h+=_ttSrc.length?recSummaryListHTMLFiltered(_ttSrc,'tt','hist',undefined,_ttPageOpts):`<div class="empty-state"><div class="empty-state-icon">${_emptyIco}</div><div class="empty-state-title">${_emptyMsg}</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div><div style="margin-top:10px"><button class="btn btn-w btn-sm" onclick="try{window.ensureTierTourRecords&&window.ensureTierTourRecords();}catch(e){};render()">🔄 티어대회 기록 다시 불러오기</button></div></div>`;
  }
  else if(histSub==='pro') h+=recSummaryListHTML(_pro,'pro','hist');
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
function _openAllTabIndEdit(type, m, regIdx){
  try{
    // 1) 세션 캐시에서 이 게임(m._id 또는 m.sid)이 속한 세션 키 탐색
    const cacheKey = (type==='gj'||type==='progj') ? 'gj' : 'ind';
    const cache = cacheKey==='gj' ? (window._gjSessCache||{}) : (window._indSessCache||{});
    const gameId = m._id || '';
    const gameSid = m.sid || '';
    let foundSessKey = null;

    if(gameId || gameSid){
      for(const [sk, sess] of Object.entries(cache)){
        const games = Array.isArray(sess?.games) ? sess.games : [];
        const hit = games.some(g=>
          (gameId && (g._id===gameId || g.sid===gameId)) ||
          (gameSid && (g.sid===gameSid || g._id===gameSid))
        );
        if(hit){ foundSessKey=sk; break; }
      }
    }

    // 2) p1/p2 + date 기반 세션 키도 시도 (캐시 키 생성 방식과 동일하게)
    if(!foundSessKey){
      const p1 = m.wName||''; const p2 = m.lName||''; const dd = m.d||'';
      const guessKey = ('inds_' + `${dd}|${p1}|${p2}`.replace(/[^\w\-]/g,'_')).slice(0,120);
      const guessKeyGJ = ('gjs_' + `${dd}|${p1}|${p2}`.replace(/[^\w\-]/g,'_')).slice(0,120);
      if(cache[guessKey]) foundSessKey=guessKey;
      else if(cache[guessKeyGJ]) foundSessKey=guessKeyGJ;
      // 역순(p2 vs p1)도 시도
      if(!foundSessKey){
        const guessKeyR = ('inds_' + `${dd}|${p2}|${p1}`.replace(/[^\w\-]/g,'_')).slice(0,120);
        const guessKeyGJR = ('gjs_' + `${dd}|${p2}|${p1}`.replace(/[^\w\-]/g,'_')).slice(0,120);
        if(cache[guessKeyR]) foundSessKey=guessKeyR;
        else if(cache[guessKeyGJR]) foundSessKey=guessKeyGJR;
      }
      // 전체 캐시에서 p1/p2/date 일치 세션 탐색
      if(!foundSessKey){
        for(const [sk, sess] of Object.entries(cache)){
          if(sess.d===dd && ((sess.p1===p1&&sess.p2===p2)||(sess.p1===p2&&sess.p2===p1))){
            foundSessKey=sk; break;
          }
        }
      }
    }

    if(foundSessKey){
      if(cacheKey==='gj' && typeof openGJSessionEdit==='function'){ openGJSessionEdit(foundSessKey); return; }
      if(cacheKey==='ind' && typeof openIndSessionEdit==='function'){ openIndSessionEdit(foundSessKey); return; }
    }
  }catch(e){}
  // 폴백: 단건 openRE
  if(typeof openRE==='function') openRE(type, regIdx);
}

/* ══════════════════════════════════════
   대전 기록 > 전체 통합 탭
══════════════════════════════════════ */
window._scanBulkMapEverywhere = window._scanBulkMapEverywhere || function(from, onMatch, replaceTo){
  const norm = (s)=>String(s||'').trim().toLowerCase().replace(/\s+/g,'');
  const fromV = String(from||'').trim();
  if(!fromV) return 0;
  const fromN = norm(fromV);
  let changed = 0;
  const rep = (obj)=>{
    if(!obj || typeof obj !== 'object') return;
    if(typeof obj.map === 'string'){
      const cur = obj.map.trim();
      if(cur===fromV || norm(cur)===fromN){
        changed++;
        if(typeof onMatch === 'function') onMatch(obj, replaceTo);
      }
    }
    (obj.games||[]).forEach(rep);
    (obj._games||[]).forEach(rep);
    (obj.sets||[]).forEach(rep);
  };
  try{
    const arrMap = (typeof _bulkArrMapAll==='function') ? _bulkArrMapAll() : {};
    Object.keys(arrMap||{}).forEach(k => (arrMap[k]||[]).forEach(rep));
  }catch(e){}
  try{
    (tourneys||[]).forEach(tn=>{
      (tn.groups||[]).forEach(grp=> (grp.matches||[]).forEach(rep));
      (tn.normalMatches||[]).forEach(rep);
      if(tn.thirdPlace) rep(tn.thirdPlace);
      const br = tn.bracket || {};
      if(Array.isArray(br)) br.forEach(round => (round||[]).forEach(rep));
      Object.values(br.matchDetails||{}).forEach(rep);
      (br.manualMatches||[]).forEach(rep);
    });
  }catch(e){}
  try{
    (proTourneys||[]).forEach(tn=>{
      (tn.groups||[]).forEach(grp=> (grp.matches||[]).forEach(rep));
      Object.values(tn.stageRecords||{}).forEach(arr => (arr||[]).forEach(rep));
      (tn.bracket||[]).forEach(round => (round||[]).forEach(rep));
      if(tn.thirdPlace) rep(tn.thirdPlace);
      (tn.teamMatches||[]).forEach(rep);
      (tn.gjMatches||[]).forEach(rep);
    });
  }catch(e){}
  try{
    if(Array.isArray(maps)){
      maps = maps.map(m=>((String(m||'').trim()===fromV || norm(m)===fromN) ? toV : m));
    }
  }catch(e){}
  return changed;
};
window.bulkCountMapEverywhere = window.bulkCountMapEverywhere || function(from){
  return window._scanBulkMapEverywhere(from, null, '');
};
window.bulkReplaceMapEverywhere = window.bulkReplaceMapEverywhere || function(from, to){
  const toV = String(to||'').trim();
  if(!String(from||'').trim() || !toV) return 0;
  return window._scanBulkMapEverywhere(from, (obj, next)=>{ obj.map = next; }, toV);
};
window.histBulkPreviewMapFromAllTab = window.histBulkPreviewMapFromAllTab || function(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li){ alert('로그인이 필요합니다.'); return; }
  const from = (document.getElementById('hist-bulk-map-from')?.value||'').trim();
  if(!from){ alert('교체 전 맵 이름을 입력하세요.'); return; }
  const cnt = (typeof window.bulkCountMapEverywhere === 'function') ? window.bulkCountMapEverywhere(from) : 0;
  const el = document.getElementById('hist-bulk-map-result');
  if(el){
    el.textContent = cnt ? `🔎 변경 예정 ${cnt}개` : '일치하는 맵이 없습니다.';
    setTimeout(()=>{ if(el && el.textContent.startsWith('🔎')) el.textContent=''; }, 3500);
  }
};
window.histBulkChangeMapFromAllTab = window.histBulkChangeMapFromAllTab || function(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li){ alert('로그인이 필요합니다.'); return; }
  const from = (document.getElementById('hist-bulk-map-from')?.value||'').trim();
  const to = (document.getElementById('hist-bulk-map-to')?.value||'').trim();
  if(!from || !to){ alert('교체 전/후 맵 이름을 입력하세요.'); return; }
  const changed = window.bulkReplaceMapEverywhere(from, to);
  if(changed){ save(); render(); }
  const el = document.getElementById('hist-bulk-map-result');
  if(el){
    el.textContent = changed ? `✅ ${changed}개 맵명 교체 완료!` : '교체할 항목이 없습니다.';
    setTimeout(()=>{ if(el) el.textContent=''; }, 3500);
  }
};
function histAllHTML(){
  const _mini = (typeof miniM!=='undefined' && Array.isArray(miniM)) ? miniM : [];
  const _ck = (typeof ckM!=='undefined' && Array.isArray(ckM)) ? ckM : [];
  const _univm = (typeof univM!=='undefined' && Array.isArray(univM)) ? univM : [];
  const _pro = (typeof proM!=='undefined' && Array.isArray(proM)) ? proM : [];
  const _ind = (typeof indM!=='undefined' && Array.isArray(indM)) ? indM : [];
  const _gj = (typeof gjM!=='undefined' && Array.isArray(gjM)) ? gjM : [];
  const _tt = (typeof ttM!=='undefined' && Array.isArray(ttM)) ? ttM : [];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _proTourneys = (typeof proTourneys!=='undefined' && Array.isArray(proTourneys)) ? proTourneys : [];
  const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
  // 각 경기 타입별 레이블과 색상
  const typeInfo={
    mini:{lbl:'미니대전',col:'#2563eb'},
    univm:{lbl:'대학대전',col:'#7c3aed'},
    ck:{lbl:'대학CK',col:'#dc2626'},
    pro:{lbl:'프로리그',col:'#0891b2'},
    ind:{lbl:'개인전',col:'#16a34a'},
    gj:{lbl:'끝장전',col:'#d97706'},
    tt:{lbl:'티어대회',col:'#7c3aed'},
    tourney:{lbl:'대회',col:'#b45309'},
    procomp:{lbl:'프로리그대회',col:'#7c3aed'},
  };
  // 통합 목록 생성
  const allItems=[];
  // 팀전 (mini/ck/univm/pro): m.a, m.b, m.sa, m.sb, m.d
  [[_mini,'mini'],[_ck,'ck'],[_univm,'univm'],[_pro,'pro']].forEach(([arr,type])=>{
    (arr||[]).forEach((m,idx)=>{
      const isCK=(type==='ck'||type==='pro');
      if(isCK){if(!m.teamAMembers||!m.teamBMembers)return;}else{if(!m.a||!m.b)return;}
      if(m.sa==null||m.sb==null||m.sa===''||m.sb==='')return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m,idx});
    });
  });
  // 개인전/끝장전 (ind/gj): m.wName, m.lName, m.d
  [[_ind,'ind'],[_gj,'gj']].forEach(([arr,type])=>{
    (arr||[]).forEach((m,idx)=>{
      if(!m.wName||!m.lName)return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m,idx});
    });
  });
  // 티어대회 (tt): m.a, m.b, m.sa, m.sb, m.d
  _tt.forEach((m,idx)=>{
    if(!m.a||!m.b)return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
    allItems.push({type:'tt',d:m.d||'',m,idx});
  });
  // 대회 tourney
  if(typeof getTourneyMatches==='function'){
    getTourneyMatches().forEach((m,idx)=>{
      if(!m.a||!m.b||m.sa==null||m.sb==null)return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type:'tourney',d:m.d||'',m,idx});
    });
  }
  // 일반대회 일반 경기 (normalMatches)
  if(typeof getNormalMatchesForHistory==='function'){
    getNormalMatchesForHistory().forEach((m,idx)=>{
      if(!m.a||!m.b||m.sa==null||m.sb==null)return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type:'tourney',d:m.d||'',m,idx});
    });
  }
  // 대회 토너먼트 (comps)
  _comps.forEach((m,idx)=>{
    if(!m.a&&!m.u) return; if(!m.b) return;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||'')) return;
    allItems.push({type:'tourney',d:m.d||'',m:{...m,a:m.a||m.u},idx});
  });
  // 프로리그 개인 대회 (procomp)
  _proTourneys.forEach((tn,tnIdx)=>{
    (tn.groups||[]).forEach((grp,grpIdx)=>{
      (grp.matches||[]).forEach((m,matchIdx)=>{
        if(!m.a||!m.b||!m.winner)return;
        if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
        const wName=m.winner==='A'?m.a:m.b;
        const lName=m.winner==='A'?m.b:m.a;
        allItems.push({type:'procomp',d:m.d||'',m:{...m,wName,lName},idx:matchIdx,_ref:`procomp:${tnIdx}:${grpIdx}:${matchIdx}`});
      });
    });
  });
  allItems.sort((a,b)=>_sortDir==='asc'?(a.d).localeCompare(b.d):(b.d).localeCompare(a.d));

  // 검색어 필터
  const _sq=((window._recQ&&window._recQ['all'])||'').toLowerCase().trim();
  const filtered=_sq?allItems.filter(({m})=>{
    const searchableText=[
      m.a||'',m.b||'',m.d||'',m.wName||'',m.lName||'',m.compName||'',m.memo||'',
      (m.teamAMembers||[]).map(x=>x.name||'').join(' '),(m.teamBMembers||[]).map(x=>x.name||'').join(' '),
      (m.sets||[]).flatMap(s=>(s.games||[]).flatMap(g=>[g.playerA||'',g.playerB||'',g.winner||'',g.wName||'',g.lName||''])).join(' ')
    ].join(' ').toLowerCase();
    return searchableText.includes(_sq);
  }):allItems;

  const initQ=(window._recQ&&window._recQ['all'])||'';
  if(!window._recTypeFilter) window._recTypeFilter='전체';
  const _typeFiltered = window._recTypeFilter==='전체' ? filtered
    : filtered.filter(({type})=>type===window._recTypeFilter);
  const _typeCountMap={};
  filtered.forEach(({type})=>{_typeCountMap[type]=(_typeCountMap[type]||0)+1;});
  const _typeButtons=[
    {id:'전체',lbl:'전체'},
    {id:'mini',lbl:'미니'},
    {id:'univm',lbl:'대학대전'},
    {id:'ck',lbl:'CK'},
    {id:'pro',lbl:'프로'},
    {id:'tt',lbl:'티어'},
    {id:'ind',lbl:'개인전'},
    {id:'gj',lbl:'끝장전'},
    {id:'tourney',lbl:'대회'},
    {id:'procomp',lbl:'프로리그대회'},
  ].filter(t=>t.id==='전체'||_typeCountMap[t.id]>0);

  // ── 맵 필터 ──
  // allItems에서 맵 목록 추출 (sets.games 포함)
  const _getItemMaps = ({m}) => {
    const found = new Set();
    // 단일 맵 필드
    if(m.map && m.map !== '-') found.add(m.map);
    // sets → games 맵
    (m.sets||[]).forEach(s => {
      if(s.map && s.map !== '-') found.add(s.map);
      (s.games||[]).forEach(g => { if(g.map && g.map !== '-') found.add(g.map); });
    });
    return found;
  };
  const _allMapSet = new Set();
  _typeFiltered.forEach(item => _getItemMaps(item).forEach(mp => _allMapSet.add(mp)));
  const _allMapList = [..._allMapSet].sort((a,b)=>a.localeCompare(b,'ko'));
  // 맵 필터 상태
  if(!window._recMapFilter) window._recMapFilter='전체';
  // 현재 선택 맵이 목록에 없으면 초기화
  if(window._recMapFilter !== '전체' && !_allMapSet.has(window._recMapFilter)) window._recMapFilter='전체';
  // 맵 필터 적용
  const _mapFiltered = (window._recMapFilter === '전체') ? _typeFiltered
    : _typeFiltered.filter(item => _getItemMaps(item).has(window._recMapFilter));
  // 맵별 경기 수
  const _mapCountMap = {};
  _typeFiltered.forEach(item => _getItemMaps(item).forEach(mp => { _mapCountMap[mp]=(_mapCountMap[mp]||0)+1; }));

  // 페이지네이션
  const pageSize=getHistPageSize();
  if(histPage['all']===undefined) histPage['all']=0;
  const totalPages=Math.ceil(_mapFiltered.length/pageSize)||1;
  if(histPage['all']>=totalPages) histPage['all']=Math.max(0,totalPages-1);
  const curPage=histPage['all'];
  const paged=_mapFiltered.length>pageSize?_mapFiltered.slice(curPage*pageSize,(curPage+1)*pageSize):_mapFiltered;

  let h=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
    ${_typeButtons.map(t=>`<button class="pill ${window._recTypeFilter===t.id?'on':''}" onclick="window._recTypeFilter='${t.id}';window._recMapFilter='전체';histPage['all']=0;render()">${t.lbl}${t.id!=='전체'&&_typeCountMap[t.id]?` <span style="font-size:10px;opacity:.7">(${_typeCountMap[t.id]})</span>`:''}</button>`).join('')}
  </div>`;
  if((typeof isLoggedIn!=='undefined' && isLoggedIn) || !!window.isLoggedIn){
    h += `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 10px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface)">
      <span style="font-size:12px;font-weight:800;color:var(--text2)">맵명 일괄 변경</span>
      <input id="hist-bulk-map-from" type="text" placeholder="교체 전 맵명" value="${window._recMapFilter&&window._recMapFilter!=='전체'?String(window._recMapFilter).replace(/"/g,'&quot;'):''}" style="width:140px;padding:7px 10px;border:1px solid var(--border);border-radius:8px">
      <span style="font-size:12px;color:var(--gray-l)">→</span>
      <input id="hist-bulk-map-to" type="text" placeholder="교체 후 맵명" style="width:140px;padding:7px 10px;border:1px solid var(--border);border-radius:8px">
      <button class="btn btn-w btn-sm" onclick="histBulkPreviewMapFromAllTab()">미리보기</button>
      <button class="btn btn-b btn-sm" onclick="histBulkChangeMapFromAllTab()">일괄 변경</button>
      <span id="hist-bulk-map-result" style="font-size:12px;color:var(--green)"></span>
    </div>`;
  }
  // 맵 필터 바 (맵이 2개 이상일 때만 표시)
  if(_allMapList.length >= 2){
    h+=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;align-items:center">`;
    h+=`<span style="font-size:11px;color:var(--gray-l);white-space:nowrap;flex-shrink:0">맵</span>`;
    h+=`<button class="pill ${window._recMapFilter==='전체'?'on':''}" style="font-size:11px" onclick="window._recMapFilter='전체';histPage['all']=0;render()">전체</button>`;
    _allMapList.forEach(mp=>{
      const cnt=_mapCountMap[mp]||0;
      const isOn=window._recMapFilter===mp;
      h+=`<button class="pill ${isOn?'on':''}" style="font-size:11px" onclick="window._recMapFilter='${mp.replace(/'/g,"\\'")}';histPage['all']=0;render()">${mp}<span style="font-size:10px;opacity:.65;margin-left:3px">${cnt}</span></button>`;
    });
    h+=`</div>`;
  }

  if(!paged.length){
    h+=`<div class="empty-state"><div class="empty-state-title">기록이 없습니다</div></div>`;
    return h;
  }

  paged.forEach(({type,d,m,idx,_ref}, pageIdx)=>{
    const ti=typeInfo[type]||{lbl:type,col:'#64748b'};
    const isCK=(type==='ck'||type==='pro');
    const isInd=(type==='ind'||type==='gj'||type==='procomp');
    let teamA='',teamB='',scoreA='',scoreB='';
    if(isInd){
      teamA=m.wName||''; teamB=m.lName||'';
    } else if(isCK){
      teamA=(m.teamAMembers||[]).map(x=>x.name||'').join(', ')||m.a||'';
      teamB=(m.teamBMembers||[]).map(x=>x.name||'').join(', ')||m.b||'';
      scoreA=m.sa!=null?m.sa:''; scoreB=m.sb!=null?m.sb:'';
    } else {
      teamA=m.a||''; teamB=m.b||'';
      scoreA=m.sa!=null?m.sa:''; scoreB=m.sb!=null?m.sb:'';
    }
    const winner=isInd?teamA:(!isInd&&scoreA!==''&&scoreB!==''?(Number(scoreA)>Number(scoreB)?teamA:(Number(scoreB)>Number(scoreA)?teamB:'')):'');
    const dLabel=d?d.slice(2).replace(/-/g,'/'):'미정';
    const dColor=d?'var(--text3)':'#f59e0b';
    const winCol=winner===teamA?gc(teamA):winner===teamB?gc(teamB):ti.col;
    const key=`hist-all-${type}-${d}-${(m.a||teamA)}-${(m.b||teamB)}`.replace(/[^\w\-:.]/g,'');
    const labelA=isCK?'A팀':(m.a||teamA);
    const labelB=isCK?'B팀':(m.b||teamB);
    const _sideCols = type==='ck' ? getFixedSideColors('ck') : type==='pro' ? getFixedSideColors('pro') : getFixedSideColors('tt');
    const ca=isCK?_sideCols.a:gc(m.a||teamA);
    const cb=isCK?_sideCols.b:gc(m.b||teamB);
    const aWin=!isInd && Number(scoreA)>Number(scoreB);
    const bWin=!isInd && Number(scoreB)>Number(scoreA);
    const modeMap={mini:'mini',univm:'univm',ck:'ck',pro:'pro',tt:'tt',ind:'ind',gj:'gj',progj:'progj',tourney:'tourney',procomp:'procomp'};
    const mode=modeMap[type]||'comp';
    const _regIdx = (typeof idx==='number' ? idx : pageIdx);
    const _detM = _ref ? {...m, _editRef:_ref} : m;
    const _isIndLike = (type==='ind'||type==='gj'||type==='procomp');
    let dotA=ca, dotB=cb;
    if(_isIndLike){
      const _wp=players.find(p=>p.name===(m.wName||teamA||'')); const _lp=players.find(p=>p.name===(m.lName||teamB||''));
      dotA=_wp?gc(_wp.univ):'#94a3b8'; dotB=_lp?gc(_lp.univ):'#94a3b8';
    }
    const _rgbStr=(function(){const hx=String(ti.col||'').replace('#','');if(hx.length!==6)return'100,116,139';return parseInt(hx.slice(0,2),16)+','+parseInt(hx.slice(2,4),16)+','+parseInt(hx.slice(4,6),16);})();
    h+=`<div class="rec-summary rec-mode-tierrank${_recSideFxClass(mode)}" data-rec-mode="tierrank" style="--rec-mode-col:${ti.col};--rec-mode-rgb:${_rgbStr};${_recSideFxStyle(mode,ca,cb)}background:linear-gradient(120deg, rgba(${_rgbStr},.09) 0%, var(--white) 42%);border-left:3px solid ${ti.col}">
      <div class="rec-sum-header" style="gap:8px">
        <div style="display:flex;flex-direction:column;gap:3px;flex-shrink:0;min-width:70px">
          <span style="font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;background:${ti.col}1f;color:${ti.col};border:1px solid ${ti.col}33;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;width:fit-content">${ti.lbl}${m._src==='tour_normal'?` <span style="background:#6366f1;color:#fff;padding:0 4px;border-radius:3px">일반경기</span>`:m._src==='tour_bracket'||m._src==='tour_manual'?` <span style="background:#1e3a8a;color:#fff;padding:0 4px;border-radius:3px">토너먼트</span>`:m._teamMatchType?` <span style="background:#7c3aed;color:#fff;padding:0 4px;border-radius:3px">${m._teamMatchType.replace('v',':')+'전'}</span>`:''}</span>
          <span style="font-size:11px;font-weight:700;color:${dColor};white-space:nowrap;display:inline-flex;align-items:center;gap:3px">${dLabel}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:60px;overflow:hidden">
          <span style="width:7px;height:7px;border-radius:50%;background:${dotA};flex-shrink:0;box-shadow:0 0 0 2px ${dotA}22"></span>
          <span style="font-weight:800;font-size:13px;color:${winner===teamA?'var(--win-col)':'var(--text)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${teamA}</span>
        </div>
        ${isInd
          ?`<span style="font-size:11px;font-weight:800;padding:3px 11px;border-radius:20px;background:linear-gradient(135deg,#fee2e2,#fecaca55);color:var(--win-col);border:1px solid #fecaca;white-space:nowrap;flex-shrink:0;box-shadow:0 2px 6px rgba(220,38,38,.12)" onclick="toggleDetail('${key}')">승</span>`
          :`<div class="rec-sum-score score-click" style="font-size:16px;padding:4px 13px;border-radius:20px;background:var(--surface);border:1px solid var(--border)" onclick="toggleDetail('${key}')">
            <span style="color:${Number(scoreA)>Number(scoreB)?'var(--win-col)':Number(scoreB)>Number(scoreA)?'var(--lose-col)':'var(--text)'}">${scoreA}</span>
            <span style="color:var(--gray-l);font-size:12px;font-weight:400">:</span>
            <span style="color:${Number(scoreB)>Number(scoreA)?'var(--win-col)':Number(scoreA)>Number(scoreB)?'var(--lose-col)':'var(--text)'}">${scoreB}</span>
          </div>`}
        <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:60px;overflow:hidden;justify-content:flex-end">
          <span style="font-weight:800;font-size:13px;color:${winner===teamB?'var(--win-col)':'var(--text)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${teamB}</span>
          <span style="width:7px;height:7px;border-radius:50%;background:${dotB};flex-shrink:0;box-shadow:0 0 0 2px ${dotB}22"></span>
        </div>
        ${(()=>{
          if(!(typeof isLoggedIn!=='undefined'&&isLoggedIn&&!(typeof isSubAdmin!=='undefined'&&isSubAdmin)&&_regIdx>=0&&type!=='tourney'&&type!=='procomp')) return '';
          if(type==='ind'||type==='gj'||type==='progj'){
            const _minfo=JSON.stringify({_id:m._id||'',sid:m.sid||'',d:m.d||'',wName:m.wName||'',lName:m.lName||''}).replace(/"/g,"'");
            return `<button class="btn btn-o btn-xs no-export" style="flex-shrink:0;margin-left:2px;padding:2px 8px;font-size:11px" onclick="event.stopPropagation();_openAllTabIndEdit('${type}',${_minfo},${_regIdx})">수정</button>`;
          }
          return `<button class="btn btn-o btn-xs no-export" style="flex-shrink:0;margin-left:2px;padding:2px 8px;font-size:11px" onclick="event.stopPropagation();openRE('${mode}',${_regIdx})">수정</button>`;
        })()}
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${isInd
          ? (()=> {
              const wp=players.find(p=>p.name===(m.wName||'')); const lp=players.find(p=>p.name===(m.lName||''));
              const wc=wp?gc(wp.univ):'#888'; const lc=lp?gc(lp.univ):'#888';
              const mapStr=m.map&&m.map!=='-'?`<span style="font-size:11px;color:var(--gray-l)">${m.map}</span>`:'';
              return `<div style="padding:8px 10px;display:flex;align-items:center;gap:8px">
                ${wp?getPlayerPhotoHTML(wp.name,'24px'):''}<span class="ubadge" style="background:${wc}">${m.wName||''}</span>
                <span style="color:var(--gray-l)">vs</span>
                ${lp?getPlayerPhotoHTML(lp.name,'24px'):''}<span class="ubadge" style="background:${lc}">${m.lName||''}</span>
                ${mapStr}
              </div>`;
            })()
          : _regDet(key, _detM, mode, labelA, labelB, ca, cb, aWin, bWin, _regIdx)}
      </div>
    </div>`;
  });

  // 페이지 네비게이션 (버그픽스: 맵 필터 적용 후 실제 항목 수 기준으로 표시)
  if(_mapFiltered.length>pageSize){
    h+=`<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn btn-sm" ${curPage===0?'disabled':''} onclick="histPage['all']=${curPage-1};render()">← 이전</button>
      <span style="font-size:12px;color:var(--gray-l)">${curPage+1} / ${totalPages}</span>
      <button class="btn btn-sm" ${curPage>=totalPages-1?'disabled':''} onclick="histPage['all']=${curPage+1};render()">다음 →</button>
    </div>`;
  }
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 대회 탭: 미니대전처럼 보이는 대회 경기 기록
══════════════════════════════════════ */
function histTourneyHTML(context){
  const tourItems=(typeof getTourneyMatches==='function') ? getTourneyMatches() : [];
  const nmItems=(typeof getNormalMatchesForHistory==='function') ? getNormalMatchesForHistory() : [];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
  const compItems=[..._comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx,a:(m.a||m.u||''),b:(m.b||'')}));
  const allItems=[...tourItems,...nmItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  allItems.sort((a,b)=>_sortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=``;
  if(!allItems.length){
    return sortBar+`<div class="empty-state"><div class="empty-state-icon">🎖️</div><div class="empty-state-title">대회 기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  const groups={};
  allItems.forEach((m,idx)=>{
    const compName=m.n||m.compName||'기타 대회';
    if(!groups[compName]) groups[compName]=[];
    groups[compName].push({m,idx});
  });

  let h=sortBar;
  Object.entries(groups).forEach(([compName,items])=>{
    const startDate=items[items.length-1]?.m?.d||'';
    const endDate=items[0]?.m?.d||'';
    const dateRange=startDate===endDate?startDate:(startDate&&endDate?`${startDate} ~ ${endDate}`:'');
    h+=`<div style="background:linear-gradient(135deg,var(--blue-l) 0%,var(--white) 100%);border:1.5px solid var(--blue-ll);border-left:4px solid var(--blue);border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🎖️</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">${compName}</span>
      ${dateRange?`<span style="font-size:11px;color:var(--gray-l)">${dateRange}</span>`:''}
      <span style="font-size:11px;font-weight:700;color:var(--blue);background:var(--blue-ll);border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;

    const byDate={};
    items.forEach(({m,idx})=>{
      const k=m.d||'날짜 미정';
      if(!byDate[k]) byDate[k]=[];
      byDate[k].push({m,idx});
    });
    const days=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    Object.keys(byDate).sort((a,b)=>recSortDir==='asc'?a.localeCompare(b):b.localeCompare(a)).forEach(date=>{
      let dateLabel=date;
      if(date!=='날짜 미정'){
        const dt=new Date(date+'T00:00:00');
        dateLabel=`${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${days[dt.getDay()]}`;
      }
      h+=`<div style="margin-bottom:22px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${dateLabel}</div>
        </div>`;

      byDate[date].forEach(({m,idx})=>{
        const a=m.a||'',b=m.b||'';
        const ca=gc(a),cb=gc(b);
        const isDone=(m.sa!=null&&m.sb!=null);
        const aWin=isDone&&m.sa>m.sb;
        const bWin=isDone&&m.sb>m.sa;
        const key=`${context}-tourney-${idx}`;
        const rIdx=(m._src==='comps')?m._origIdx:-1;

        const grpBadge=m._src==='tour'
          ?`<span class="grp-meta-group" style="background:linear-gradient(135deg,${m.grpColor||'#2563eb'},${m.grpColor||'#2563eb'}cc);color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:99px;letter-spacing:.5px;box-shadow:0 2px 6px ${m.grpColor||'#2563eb'}44">GROUP ${m.grpLetter||''}</span>`
          :m._src==='tour_normal'
          ?`<span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:99px;letter-spacing:.5px">🎮 일반경기</span>`
          :'';
        const _rndBadge=m.rndLabel?`<span style="background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;font-size:10px;font-weight:900;padding:2px 10px;border-radius:99px;letter-spacing:.5px;box-shadow:0 2px 6px rgba(37,99,235,.30)">${m.rndLabel}</span>`:'';

        const _ab = (typeof _collectMatchTeamMembersAB === 'function') ? _collectMatchTeamMembersAB(m) : {a:[], b:[]};
        const aMembers=_ab.a||[];
        const bMembers=_ab.b||[];
        const aMemJson=JSON.stringify(aMembers).replace(/"/g,"'");
        const bMemJson=JSON.stringify(bMembers).replace(/"/g,"'");

        const _sideAB={a:aMembers,b:bMembers};
        const _sideM={...m,a,b,teamAMembers:aMembers,teamBMembers:bMembers};
        const _sidePanel=(typeof window._buildRecSideProfilePanel==='function')
          ? window._buildRecSideProfilePanel(_sideM, _sideAB, aWin, bWin, ca, cb)
          : {left:'', right:''};
        const _hasSide=!!((_sidePanel.left||'')||(_sidePanel.right||''));

        const _menuActions=[
          isLoggedIn&&m._src==='tour'?{t:'✏️ 수정',d:'경기 수정',kind:'normal',on:()=>leagueEditMatch(m._tnId,m._gi,m._mi)}:null,
          isLoggedIn&&m._src==='tour_bracket'?{t:'✏️ 결과 입력',d:'대진표 경기 결과 입력',kind:'normal',on:()=>{const _bk=m._bktKey||'';const _bkp=_bk.split('-');const _r=parseInt(_bkp[0]);const _bmi=parseInt(_bkp[1]);if(typeof openBracketMatchModal==='function')openBracketMatchModal(m._tnId,_r,_bmi,m.a,m.b);}}:null,
          isLoggedIn&&m._src==='tour_manual'?{t:'✏️ 결과 입력',d:'수동 경기 결과 입력',kind:'normal',on:()=>{if(typeof openBracketMatchModal==='function')openBracketMatchModal(m._tnId,-1,m._manualIdx,m.a,m.b);}}:null,
          isLoggedIn&&m._src==='tour_normal'?{t:'✏️ 수정',d:'경기 수정',kind:'normal',on:()=>{if(typeof nmStartEdit==='function')nmStartEdit(m._tnId,m._nmi);}}:null,
          {t:'🎴 공유카드',d:'공유용 카드 생성',kind:'accent',on:()=>window._openShareMatchObjCard&&window._openShareMatchObjCard(_getHistTourneyMatchObj(idx,context))},
          isLoggedIn&&m._src==='tour'&&!isSubAdmin?{t:'🗑️ 삭제',d:'경기 삭제',kind:'danger',on:()=>typeof grpDelMatch==='function'&&grpDelMatch(m._tnId,m._gi,m._mi)}:null,
          isLoggedIn&&m._src==='tour_bracket'&&!isSubAdmin?{t:'🗑️ 결과 삭제',d:'대진표 결과 초기화',kind:'danger',on:()=>{const _bk=m._bktKey||'';const _bkp=_bk.split('-');const _r=parseInt(_bkp[0]);const _bmi=parseInt(_bkp[1]);if(typeof bktClearMatchResult==='function')bktClearMatchResult(m._tnId,_r,_bmi);}}:null,
          isLoggedIn&&m._src==='tour_manual'&&!isSubAdmin?{t:'🗑️ 삭제',d:'수동 경기 삭제',kind:'danger',on:()=>{if(typeof bktDelManualMatch==='function')bktDelManualMatch(m._tnId,m._manualIdx);}}:null,
          isLoggedIn&&m._src==='tour_normal'&&!isSubAdmin?{t:'🗑️ 삭제',d:'경기 삭제',kind:'danger',on:()=>{if(typeof nmDelMatch==='function')nmDelMatch(m._tnId,m._nmi);}}:null,
          isLoggedIn&&rIdx>=0&&!isSubAdmin&&(m._src==='comps'||!m._src)?{t:'🗑️ 삭제',d:'경기 삭제',kind:'danger',on:()=>null}:null
        ].filter(Boolean);
        const _menuBtn=(_menuActions.length&&typeof _compActionMenuHTML==='function')?_compActionMenuHTML(_menuActions):'';

        const _hexRgb=(h)=>{const s=String(h||'').replace('#','');if(s.length===6){const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);if(![r,g,b].some(isNaN))return r+','+g+','+b;}return'100,116,139';};
        const _sideRgbVars=`--rec-side-left-rgb:${_hexRgb(ca||'#3b82f6')};--rec-side-right-rgb:${_hexRgb(cb||'#ef4444')};`;
        const _winCol=(aWin||bWin)?(aWin?ca:cb):'#64748b';
        const _winRgb=_hexRgb(_winCol);
        const _fxCfg=(typeof _getRecSideFxCfg==='function')?_getRecSideFxCfg():{on:true,mode:'soft',intensity:68,length:25};
        const _fxOn=!!_fxCfg.on;
        const _fxMetrics=(typeof _buildRecSideFxMetrics==='function')?_buildRecSideFxMetrics(_fxCfg):null;
        const _fxMode=_fxMetrics?_fxMetrics.mode:'soft';
        const _fxVars=(_fxOn&&typeof _recSideFxVarStyle==='function')?_recSideFxVarStyle(ca||'#3b82f6',cb||'#ef4444',_fxCfg):'';

        h+=`<div class="grp-match-wrap">
          <div class="grp-card-meta-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            ${grpBadge}
            ${_rndBadge}
            <span class="grp-meta-spacer" style="flex:1"></span>
            ${_menuBtn?`<span class="grp-meta-menu">${_menuBtn}</span>`:''}
          </div>
          <div class="grp-match-card match-card-v3 tc-card${_fxOn?' grp-sidefx grp-sidefx--'+_fxMode:''}${_hasSide?' has-side-panels':''}" style="--tc-win-rgb:${_winRgb};${_sideRgbVars}${_fxVars}background:var(--white);border:1px solid var(--border);border-left:4px solid ${ca||'var(--blue)'};border-right:4px solid ${cb||'var(--blue)'};border-radius:22px;box-shadow:0 14px 32px rgba(15,23,42,.06);cursor:pointer" onclick="toggleDetail('${key}')">
            ${_sidePanel.left||''}
            <div class="grp-match-main" style="flex:1;display:flex;align-items:center;gap:var(--tc-vs-gap,12px);justify-content:center;flex-wrap:wrap">
              <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
                <div class="grp-team-chip" style="--chip-col:${ca||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);cursor:pointer" onclick="event.stopPropagation();openUnivModal('${a}')">
                  ${(()=>{const url=(typeof UNIV_ICONS!=='undefined'&&UNIV_ICONS[a])||((typeof univCfg!=='undefined'&&Array.isArray(univCfg))?((univCfg.find(x=>x.name===a)||{}).icon||''):'');return url?`<img class="tc-uicon" src="${typeof toHttpsUrl==='function'?toHttpsUrl(url):url}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);clip-path:var(--su_tc_uicon_clip,none);flex-shrink:0" onerror="this.style.display='none'">`:'';})()}
                  <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${a||'—'}</span>
                </div>
                ${aMembers.length?`<button class="grp-mem-btn" style="--mem-col:${(isDone&&bWin)?'#94a3b8':(ca||'#3b82f6')};${(isDone&&bWin)?'opacity:.45;filter:grayscale(1);':''}" onclick="event.stopPropagation();openProMembersPopup('${a.replace(/'/g,"\\'")}','${ca}',${aMemJson})"><span class="mem-ico">👥</span><span>${aMembers.length}명</span></button>`:''}
              </div>
              <div class="grp-score-col" style="display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;min-width:80px">
                <div class="grp-match-score score-click"><span class="">${m.sa||0}</span><span class="score-sep" style="color:var(--text2);font-size:0.72em;font-weight:900;margin:0 5px;opacity:0.8">:</span><span class="">${m.sb||0}</span></div>
              </div>
              <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
                <div class="grp-team-chip" style="--chip-col:${cb||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);cursor:pointer" onclick="event.stopPropagation();openUnivModal('${b}')">
                  ${(()=>{const url=(typeof UNIV_ICONS!=='undefined'&&UNIV_ICONS[b])||((typeof univCfg!=='undefined'&&Array.isArray(univCfg))?((univCfg.find(x=>x.name===b)||{}).icon||''):'');return url?`<img class="tc-uicon" src="${typeof toHttpsUrl==='function'?toHttpsUrl(url):url}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);clip-path:var(--su_tc_uicon_clip,none);flex-shrink:0" onerror="this.style.display='none'">`:'';})()}
                  <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${b||'—'}</span>
                </div>
                ${bMembers.length?`<button class="grp-mem-btn" style="--mem-col:${(isDone&&aWin)?'#94a3b8':(cb||'#ef4444')};${(isDone&&aWin)?'opacity:.45;filter:grayscale(1);':''}" onclick="event.stopPropagation();openProMembersPopup('${b.replace(/'/g,"\\'")}','${cb}',${bMemJson})"><span class="mem-ico">👥</span><span>${bMembers.length}명</span></button>`:''}
              </div>
            </div>
            ${_sidePanel.right||''}
          </div>
          <div id="det-${key}" class="rec-detail-area">
            ${_regDet(key,{...m,_editRef:rIdx>=0?'comp:'+rIdx:''},  'comp',a,b,ca,cb,aWin,bWin, rIdx)}
            ${(()=>{const _memo=(rIdx>=0&&isLoggedIn)?`<input type="text" id="memo-${key}" placeholder="경기 메모..." value="${m.memo||''}" style="flex:1;font-size:12px"><button class="btn btn-w btn-xs" onclick="saveMemo('comp',${rIdx},'memo-${key}')">💾 메모</button>${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('comp',${rIdx},null)">🗑️ 삭제</button>`:''}`:''; const _note=m.memo?`<div style="font-size:12px;color:var(--text2);background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:6px;padding:6px 10px;margin-bottom:6px">📝 ${m.memo}</div>`:''; return (_memo||_note)?`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)" class="no-export">${_note}<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">${_memo}</div></div>`:'';})()}
          </div>
        </div>`;
      });

      h+=`</div>`;
    });
  });
  return h;
}

// 대회 탭 공유카드용 헬퍼
function _getHistTourneyMatchObj(idx, context){
  const tourItems=(typeof getTourneyMatches==='function') ? getTourneyMatches() : [];
  const nmItems=(typeof getNormalMatchesForHistory==='function')?getNormalMatchesForHistory():[];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
  const compItems=[..._comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const all=[...tourItems,...nmItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sb==null) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  all.sort((a,b)=>_sortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const m = all[idx]||null;
  if(!m) return null;
  const _stage = m._src==='tour_normal'?'league':(m.stage||'league');
  const _grpName = m._src==='tour_normal'?'일반경기':(m.grpName||'');
  return {...m,_matchType:'comp',compName:m.compName||m.n||'',teamALabel:m.teamALabel||m.a||'',teamBLabel:m.teamBLabel||m.b||'',stage:_stage,grpName:_grpName};
}


function rHistUnivStat(){
  const _mini = (typeof miniM!=='undefined' && Array.isArray(miniM)) ? miniM : [];
  const _univm = (typeof univM!=='undefined' && Array.isArray(univM)) ? univM : [];
  const _ck = (typeof ckM!=='undefined' && Array.isArray(ckM)) ? ckM : [];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const allU=getAllUnivs();
  if(!histUniv&&allU.length) histUniv=allU[0].name;
  let h='';
  if(typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('hist-univ');
  }
  h+=`<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;" class="no-export">
    <span style="font-size:13px;font-weight:900;color:var(--text2);white-space:nowrap">🏛️ 대학 선택</span>
    <select onchange="histUniv=this.value;openDetails={};render()" style="flex:1;min-width:140px;max-width:260px;padding:8px 32px 8px 12px;border-radius:12px;border:1.5px solid var(--border2);background:var(--card);color:var(--text);font-size:14px;font-weight:700;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 10px center;transition:border-color .15s,box-shadow .15s;" onfocus="this.style.borderColor='var(--blue)';this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.12)'" onblur="this.style.borderColor='';this.style.boxShadow=''">`;
  allU.forEach(u=>{
    h+=`<option value="${u.name}"${histUniv===u.name?' selected':''}>${u.name}</option>`;
  });
  h+=`</select></div>`;
  if(!histUniv) return h+`<div style="padding:60px 20px;text-align:center;"><div style="font-size:40px;margin-bottom:12px">🏛️</div><div style="font-size:15px;font-weight:800;color:var(--text2);margin-bottom:6px">대학을 선택하세요</div><div style="font-size:13px;color:var(--gray-l)">위 드롭다운에서 조회할 대학을 골라주세요.</div></div>`;
  const col=gc(histUniv);
  const myMini=_mini.filter(m=>(m.a===histUniv||m.b===histUniv) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  const myUnivM=_univm.filter(m=>(m.a===histUniv||m.b===histUniv) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  const myCK=_ck.filter(m=>((m.teamAMembers||[]).some(x=>x.univ===histUniv)||(m.teamBMembers||[]).some(x=>x.univ===histUniv)) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  const myComp=_comps.filter(m=>(((m.a||m.u)===histUniv)||m.b===histUniv) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  // 조별대회(tourneys) 경기 추가
  const myTourney=[
    ...(typeof getTourneyMatches==='function'?getTourneyMatches():[]),
    ...(typeof getNormalMatchesForHistory==='function'?getNormalMatchesForHistory():[])
  ].filter(m=>(m.a===histUniv||m.b===histUniv) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  function calcStats(arr,getA,getB){let w=0,l=0,d=0;arr.forEach(m=>{const a=getA(m),b=getB(m);const iA=(a===histUniv),iB=(b===histUniv);if(iA){if(m.sa>m.sb)w++;else if(m.sb>m.sa)l++;else d++;}else if(iB){if(m.sb>m.sa)w++;else if(m.sa>m.sb)l++;else d++;}});return{w,l,d,total:w+l+d};}
  const sm=calcStats(myMini,m=>m.a,m=>m.b);
  const su=calcStats(myUnivM,m=>m.a,m=>m.b);
  const sc=calcStats(myComp,m=>m.a||m.u,m=>m.b);
  const st=calcStats(myTourney,m=>m.a,m=>m.b);
  let ckW=0,ckL=0;
  myCK.forEach(m=>{
    // univWins가 채워진 경우 (match builder 저장)
    if(m.univWins&&Object.keys(m.univWins).length){
      ckW+=(m.univWins[histUniv]||0);
      ckL+=(m.univLosses&&m.univLosses[histUniv]||0);
    } else {
      // 미채워진 경우: sets 내 게임별 승패 집계
      let hasSets=false;
      (m.sets||[]).forEach(set=>{
        (set.games||[]).forEach(g=>{
          hasSets=true;
          const wp=players.find(p=>p.name===(g.wName||''));
          const lp=players.find(p=>p.name===(g.lName||''));
          if(wp&&wp.univ===histUniv) ckW++;
          if(lp&&lp.univ===histUniv) ckL++;
        });
      });
      // sets도 없으면 팀 스코어로 대체
      if(!hasSets){
        const inA=(m.teamAMembers||[]).some(x=>x.univ===histUniv);
        const inB=(m.teamBMembers||[]).some(x=>x.univ===histUniv);
        if(inA&&m.sa!=null&&m.sb!=null){if(m.sa>m.sb)ckW++;else if(m.sb>m.sa)ckL++;}
        else if(inB&&m.sa!=null&&m.sb!=null){if(m.sb>m.sa)ckW++;else if(m.sa>m.sb)ckL++;}
      }
    }
  });

  // 상대 대학 승/패 집계
  const oppStats={};
  function addOpp(myU,oppU,myWin){
    if(myU!==histUniv||oppU===histUniv)return;
    if(!oppStats[oppU])oppStats[oppU]={w:0,l:0};
    if(myWin)oppStats[oppU].w++;else oppStats[oppU].l++;
  }
  myMini.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  myUnivM.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  myComp.forEach(m=>{const a=m.a||m.u||'';addOpp(a,m.b,m.sa>m.sb);addOpp(m.b,a,m.sb>m.sa);});
  myTourney.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});

  // 총합 계산
  const totalW=sm.w+su.w+sc.w+st.w+ckW;
  const totalL=sm.l+su.l+sc.l+st.l+ckL;
  const totalD=sm.d+su.d+sc.d+st.d;
  const totalAll=totalW+totalL+totalD;
  const totalWR=totalAll?Math.round(totalW/totalAll*100):0;

  h+=`<div style="background:linear-gradient(135deg,${col}18 0%,${col}08 100%);border:2px solid ${col}55;border-radius:16px;padding:20px 22px;margin-bottom:22px;position:relative;overflow:hidden;">
    <div style="position:absolute;right:-18px;top:-18px;width:90px;height:90px;border-radius:50%;background:${col}12;pointer-events:none"></div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap;">
      <span class="ubadge clickable-univ" style="background:${col};font-size:15px;padding:6px 18px;border-radius:999px;box-shadow:0 2px 8px ${col}55;font-weight:900;letter-spacing:.3px" onclick="openUnivModal('${histUniv}')">${histUniv}</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:17px;color:${col};letter-spacing:-.3px">대전 통합 성적</span>
      <span style="margin-left:auto;background:${col};color:#fff;border-radius:999px;padding:4px 14px;font-size:13px;font-weight:800;box-shadow:0 1px 6px ${col}55">${totalAll}경기 · ${totalWR}%</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;">
      ${statCard('⚡ 미니대전',sm.w,sm.l,sm.d,col)}
      ${statCard('🏟️ 대학대전',su.w,su.l,su.d,col)}
      ${statCard('🎖️ 대회',sc.w,sc.l,sc.d,col)}
      ${st.total>0?statCard('🏆 조별대회',st.w,st.l,st.d,col):''}
      ${statCard('🤝 대학CK',ckW,ckL,0,col)}
    </div>
  </div>`;

  // 상대 대학별 전적표
  const oppList=Object.entries(oppStats).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(oppList.length){
    h+=`<div class="hist-univ-opp-header" style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:10px 14px;background:linear-gradient(135deg,${col}10,${col}05);border-radius:14px;border:1.5px solid ${col}22;">
      <span style="font-size:20px;line-height:1">🆚</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:${col};letter-spacing:-.2px">상대 대학 대전 전적</span>
      <span style="margin-left:auto;background:${col}22;color:${col};border-radius:999px;padding:3px 10px;font-size:12px;font-weight:800">${oppList.length}개 대학</span>
    </div>`;
    h+=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px;margin-bottom:20px;">`;
    oppList.forEach(([opp,s])=>{
      const ot=s.w+s.l;const ow=ot?Math.round(s.w/ot*100):0;const oc=gc(opp);
      const barW=Math.round(s.w/ot*100);
      h+=`<div style="background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:box-shadow .15s" onclick="openUnivModal('${opp}')">
        <span class="ubadge" style="background:${oc};font-size:12px;padding:3px 10px;border-radius:999px;flex-shrink:0;min-width:60px;text-align:center">${opp}</span>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:12px;font-weight:800"><span style="color:var(--green)">${s.w}승</span> <span style="color:var(--red)">${s.l}패</span></span>
            <span style="font-size:12px;font-weight:800;color:${ow>=50?'var(--green)':'var(--red)'}">${ow}%</span>
          </div>
          <div style="height:5px;background:var(--border);border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${barW}%;background:${ow>=50?'var(--green)':'var(--red)'};border-radius:99px;transition:width .3s"></div>
          </div>
        </div>
      </div>`;
    });
    h+=`</div>`;
  }

  const totalMatches=myMini.length+myUnivM.length+myCK.length+myComp.length+myTourney.length;
  if(!totalMatches) h+=`<div style="padding:40px;text-align:center;color:var(--gray-l)">이 대학의 대전 기록이 없습니다.</div>`;
  return h;
}

function statCard(label,w,l,d,col){
  const tot=w+l+d;const wr=tot?Math.round(w/tot*100):0;
  const arc=wr/100;
  const r=20;const circ=2*Math.PI*r;const dash=circ*arc;const gap=circ-dash;
  return `<div style="background:var(--card);border:1.5px solid ${col}33;border-radius:14px;padding:14px 12px;text-align:center;position:relative;overflow:hidden;border-top:3px solid ${col}">
    <div style="position:absolute;inset:0;background:${col}06;pointer-events:none"></div>
    <div style="font-size:11px;font-weight:800;color:${col};margin-bottom:8px;letter-spacing:.4px;white-space:nowrap">${label}</div>
    ${tot>0?`<div style="position:relative;display:inline-block;margin-bottom:6px">
      <svg width="52" height="52" viewBox="0 0 52 52" style="transform:rotate(-90deg)">
        <circle cx="26" cy="26" r="${r}" fill="none" stroke="${col}20" stroke-width="5"/>
        <circle cx="26" cy="26" r="${r}" fill="none" stroke="${col}" stroke-width="5" stroke-dasharray="${dash.toFixed(1)} ${gap.toFixed(1)}" stroke-linecap="round"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:${col}">${wr}%</div>
    </div>`:'<div style="height:52px;display:flex;align-items:center;justify-content:center;color:var(--gray-l);font-size:12px">-</div>'}
    <div style="font-family:\'Noto Sans KR\',sans-serif;font-weight:900;font-size:13px"><span style="color:var(--green)">${w}승</span> <span style="color:var(--red)">${l}패</span>${d?` <span style="color:var(--gray-l);font-size:11px">${d}무</span>`:''}</div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:3px">${tot}경기</div>
  </div>`;
}

function _recFxHexToRgbStr(hex){
  try{
    const h=String(hex||'').replace('#','').trim();
    if(h.length===3){
      const r=parseInt(h[0]+h[0],16), g=parseInt(h[1]+h[1],16), b=parseInt(h[2]+h[2],16);
      if([r,g,b].some(v=>isNaN(v))) return '100,116,139';
      return `${r},${g},${b}`;
    }
    if(h.length>=6){
      const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
      if([r,g,b].some(v=>isNaN(v))) return '100,116,139';
      return `${r},${g},${b}`;
    }
  }catch(e){}
  return '100,116,139';
}
// 기록 카드 양쪽 끝 색상 효과 모드
// - 기존 모드 + 요청사항: 효과 1~2개 추가(fade/double)
const _REC_SIDE_FX_MODES = ['soft','glow','panel','line','ribbon','frame','spotlight','fade','double','neon','wave','prism','vignette','pulse','sheen','aurora','slant','steps','laser','diamond','halo','confetti','circuit','ink','fire','ice','dust','ember','mirror','bars','bracket','corner','diagonal','scanline','sweep','shimmer'];
function _getRecSideFxCfg(){
  let on = true, mode = 'soft', intensity = 68, length = 25, tail = 28, softness = 52, edge = 8;
  try{ on = (localStorage.getItem('su_rec_side_fx_on') || '1') !== '0'; }catch(e){}
  try{
    const raw = String(localStorage.getItem('su_rec_side_fx_mode') || 'soft').trim();
    if(_REC_SIDE_FX_MODES.includes(raw)) mode = raw;
  }catch(e){}
  try{ intensity = Math.max(0, Math.min(140, parseInt(localStorage.getItem('su_rec_side_fx_intensity') || '68', 10) || 68)); }catch(e){}
  try{ length = Math.max(4, Math.min(80, parseInt(localStorage.getItem('su_rec_side_fx_length') || '25', 10) || 25)); }catch(e){}
  try{ tail = Math.max(0, Math.min(140, parseInt(localStorage.getItem('su_rec_side_fx_tail') || '28', 10) || 28)); }catch(e){}
  try{ softness = Math.max(0, Math.min(100, parseInt(localStorage.getItem('su_rec_side_fx_softness') || '52', 10) || 52)); }catch(e){}
  try{ edge = Math.max(2, Math.min(24, parseInt(localStorage.getItem('su_rec_side_fx_edge') || '8', 10) || 8)); }catch(e){}
  return { on, mode, intensity, length, tail, softness, edge };
}
function _buildRecSideFxMetrics(cfg){
  const c = cfg || _getRecSideFxCfg();
  const mode = _REC_SIDE_FX_MODES.includes(String(c.mode||'')) ? String(c.mode) : 'soft';
  const intensity = Math.max(0, Math.min(140, parseInt(c.intensity||68,10) || 68));
  const length = Math.max(4, Math.min(80, parseInt(c.length||25,10) || 25));
  const tail = Math.max(0, Math.min(140, parseInt(c.tail||28,10) || 28));
  const softness = Math.max(0, Math.min(100, parseInt(c.softness||52,10) || 52));
  const edge = Math.max(2, Math.min(24, parseInt(c.edge||8,10) || 8));
  const lengthFactor = (length - 4) / 76;
  const intensityFactor = intensity / 100;
  const softnessFactor = softness / 100;
  const tailFactor = tail / 100;
  const blend = Math.max(0, Math.min(1.4, intensityFactor * 0.62 + lengthFactor * 0.38));
  const a1 = Math.max(0.04, Math.min(0.52, 0.045 + blend * 0.20));
  const a2 = Math.max(0.018, Math.min(0.30, a1 * (0.22 + softnessFactor * 0.82)));
  const aEdge = Math.max(0.08, Math.min(0.84, a1 + (tailFactor * 0.26) + (edge / 220)));
  const len = length;
  const len2 = Math.max(2, Math.min(96, Math.round(len * (0.24 + softnessFactor * 0.42))));
  const len3 = Math.max(len2 + 1, Math.min(98, Math.round(len * (0.55 + softnessFactor * 0.25))));
  const lenR = 100 - len;
  const len2R = 100 - len2;
  const len3R = 100 - len3;
  const lineW = edge;
  const glowInset = Math.max(12, Math.round(10 + lineW * 1.5 + length * 0.22));
  const glowBlur = Math.max(18, Math.round(18 + lineW * 2.2 + length * 0.38));
  const bandW = Math.max(lineW + 4, Math.round(length * 0.35));
  const spotSize = Math.max(24, Math.round(22 + lineW * 1.8 + length * 0.9));
  const frameW = Math.max(1, Math.round(lineW * 0.42));
  return { mode, intensity, length, tail, softness, edge, a1, a2, aEdge, len, len2, len3, lenR, len2R, len3R, lineW, glowInset, glowBlur, bandW, spotSize, frameW };
}
function _recSideFxVarStyle(leftHex, rightHex, cfg){
  const m = _buildRecSideFxMetrics(cfg);
  return `--rec-side-left-rgb:${_recFxHexToRgbStr(leftHex)};--rec-side-right-rgb:${_recFxHexToRgbStr(rightHex)};--rec-side-a1:${m.a1.toFixed(3)};--rec-side-a2:${m.a2.toFixed(3)};--rec-side-ae:${m.aEdge.toFixed(3)};--rec-fx-len:${m.len}%;--rec-fx-len2:${m.len2}%;--rec-fx-len3:${m.len3}%;--rec-fx-len-r:${m.lenR}%;--rec-fx-len2-r:${m.len2R}%;--rec-fx-len3-r:${m.len3R}%;--rec-side-line-w:${m.lineW}px;--rec-side-glow-inset:${m.glowInset}px;--rec-side-glow-blur:${m.glowBlur}px;--rec-side-band:${m.bandW}px;--rec-side-spot:${m.spotSize}px;--rec-side-frame:${m.frameW}px;`;
}
function _canUseRecSideFx(mode){
  return ['ind','gj','progj','mini','civil','univm','ck','pro','tt','comp','tourney','procomp','procompgj','procomptn','procompteam'].includes(String(mode||''));
}
function _recSideFxClass(mode){
  const cfg = _getRecSideFxCfg();
  if(!cfg.on || !_canUseRecSideFx(mode)) return '';
  return ` rec-sidefx rec-sidefx--${cfg.mode}`;
}
function _recSideFxStyle(mode, leftHex, rightHex){
  const cfg = _getRecSideFxCfg();
  if(!cfg.on || !_canUseRecSideFx(mode) || !leftHex || !rightHex) return '';
  const vars = _recSideFxVarStyle(leftHex, rightHex, cfg);
  return vars;
}

// 경기(세트/게임)에서 "참여자"를 최대한 수집 (팀 구분 없이 전체 인원)
function _collectMatchParticipantsAny(m){
  try{
    const set = new Set();
    const add = (v)=>{
      if(!v) return;
      String(v).split(',').map(s=>s.trim()).filter(Boolean).forEach(x=>set.add(x));
    };
    // 사전 저장된 멤버
    (m?.teamAMembers||[]).forEach(x=>add(typeof x==='string'?x:(x?.name||x)));
    (m?.teamBMembers||[]).forEach(x=>add(typeof x==='string'?x:(x?.name||x)));
    // 세트/게임
    (m?.sets||[]).forEach(s=>{
      (s?.games||[]).forEach(g=>{
        add(g?.playerA); add(g?.playerB);
        add(g?.wName); add(g?.lName);
        add(g?.a1); add(g?.a2); add(g?.b1); add(g?.b2);
      });
    });
    return Array.from(set).map(name=>({name}));
  }catch(e){
    return [];
  }
}

// 경기 데이터에서 A/B 팀 멤버를 최대한 수집 (조별리그/토너먼트/티어대회 팀전 등)
function _collectMatchTeamMembersAB(m){
  try{
    const aSet=new Set(), bSet=new Set();
    const addSet=(set,v)=>{
      if(!v) return;
      String(v).split(',').map(s=>s.trim()).filter(Boolean).forEach(x=>set.add(x));
    };
    // 1) 저장된 멤버 우선
    (m?.teamAMembers||[]).forEach(x=>addSet(aSet, typeof x==='string'?x:(x?.name||x)));
    (m?.teamBMembers||[]).forEach(x=>addSet(bSet, typeof x==='string'?x:(x?.name||x)));
    // 2) sets.games 기반 수집
    (m?.sets||[]).forEach(s=>{
      (s?.games||[]).forEach(g=>{
        // 팀전 편집기에서 a1/a2/b1/b2 쓰는 케이스
        addSet(aSet, g?.a1); addSet(aSet, g?.a2);
        addSet(bSet, g?.b1); addSet(bSet, g?.b2);
        // 일반적으로 playerA=왼쪽, playerB=오른쪽
        addSet(aSet, g?.playerA);
        addSet(bSet, g?.playerB);
        // 일부 데이터는 a/b 키를 쓸 수 있음
        addSet(aSet, g?.a);
        addSet(bSet, g?.b);
      });
    });
    return {
      a: Array.from(aSet).map(name=>({name})),
      b: Array.from(bSet).map(name=>({name})),
    };
  }catch(e){
    return {a:[], b:[]};
  }
}

