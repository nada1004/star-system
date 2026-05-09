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
      tabDefs.push({id:'ext', grp:'외부', lbl:'📎', disp:(typeof getTabLabel==='function'?getTabLabel('history','ext','📎'):'📎')});
      // 외부2: 관리자 전용(iframe)
      tabDefs.push({id:'ext2', grp:'외부', lbl:'🌐 외부2', disp:(typeof getTabLabel==='function'?getTabLabel('history','ext2','🌐 외부2'):'🌐 외부2')});
      // 외부3: 관리자 전용(iframe, 페이지 이동 지원)
      tabDefs.push({id:'ext3', grp:'외부', lbl:'🌐 외부3', disp:(typeof getTabLabel==='function'?getTabLabel('history','ext3','🌐 외부3'):'🌐 외부3')});
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
    const isOn=curTab.grp===g;
    const firstId=tabDefs.find(t=>t.grp===g).id;
    const gLbl=(typeof getTabLabel==='function') ? getTabLabel('historyGroup', g, g) : g;
    h+=`<button class="pill ${isOn?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='${firstId}';openDetails={};render()">${gLbl}</button>`;
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
      h+=_histBulkBtnTop;
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
      h+=_histBulkBtnTop;
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
    const _ttSubBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">
      <button class="pill ${histSub==='tiertour'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='tiertour';openDetails={};render()">📋 전체</button>
      <button class="pill ${histSub==='tiertour-gen'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='tiertour-gen';openDetails={};render()">📝 일반</button>
      <button class="pill ${histSub==='tiertour-league'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='tiertour-league';openDetails={};render()">📅 조별리그</button>
      <button class="pill ${histSub==='tiertour-bkt'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="histSub='tiertour-bkt';openDetails={};render()">🏆 토너먼트 기록</button>
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
    h+=_ttSrc.length?recSummaryListHTMLFiltered(_ttSrc,'tt','hist'):`<div class="empty-state"><div class="empty-state-icon">${_emptyIco}</div><div class="empty-state-title">${_emptyMsg}</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div><div style="margin-top:10px"><button class="btn btn-w btn-sm" onclick="try{window.ensureTierTourRecords&&window.ensureTierTourRecords();}catch(e){};render()">🔄 티어대회 기록 다시 불러오기</button></div></div>`;
  }
  else if(histSub==='pro') h+=recSummaryListHTML(proM,'pro','hist');
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
   대전 기록 > 전체 통합 탭
══════════════════════════════════════ */
function histAllHTML(){
  // 각 경기 타입별 레이블과 색상
  const typeInfo={
    mini:{lbl:'⚡ 미니대전',col:'#2563eb'},
    univm:{lbl:'🏟️ 대학대전',col:'#7c3aed'},
    ck:{lbl:'🤝 대학CK',col:'#dc2626'},
    pro:{lbl:'🏅 프로리그',col:'#0891b2'},
    ind:{lbl:'🎮 개인전',col:'#16a34a'},
    gj:{lbl:'⚔️ 끝장전',col:'#d97706'},
    tt:{lbl:'🎯 티어대회',col:'#7c3aed'},
    tourney:{lbl:'🎖️ 대회',col:'#b45309'},
    procomp:{lbl:'🏅 프로리그대회',col:'#7c3aed'},
  };
  // 통합 목록 생성
  const allItems=[];
  // 팀전 (mini/ck/univm/pro): m.a, m.b, m.sa, m.sb, m.d
  [[miniM,'mini'],[ckM,'ck'],[univM,'univm'],[proM,'pro']].forEach(([arr,type])=>{
    (arr||[]).forEach((m,idx)=>{
      const isCK=(type==='ck'||type==='pro');
      if(isCK){if(!m.teamAMembers||!m.teamBMembers)return;}else{if(!m.a||!m.b)return;}
      if(m.sa==null||m.sb==null||m.sa===''||m.sb==='')return;
      if(!passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m,idx});
    });
  });
  // 개인전/끝장전 (ind/gj): m.wName, m.lName, m.d
  [[indM,'ind'],[gjM,'gj']].forEach(([arr,type])=>{
    (arr||[]).forEach((m,idx)=>{
      if(!m.wName||!m.lName)return;
      if(!passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m,idx});
    });
  });
  // 티어대회 (tt): m.a, m.b, m.sa, m.sb, m.d
  (ttM||[]).forEach((m,idx)=>{
    if(!m.a||!m.b)return;
    if(!passDateFilter(m.d||''))return;
    allItems.push({type:'tt',d:m.d||'',m,idx});
  });
  // 대회 tourney
  if(typeof getTourneyMatches==='function'){
    getTourneyMatches().forEach((m,idx)=>{
      if(!m.a||!m.b||m.sa==null||m.sb==null)return;
      if(!passDateFilter(m.d||''))return;
      allItems.push({type:'tourney',d:m.d||'',m,idx});
    });
  }
  // 대회 토너먼트 (comps)
  (comps||[]).forEach((m,idx)=>{
    if(!m.a&&!m.u) return; if(!m.b) return;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return;
    if(!passDateFilter(m.d||'')) return;
    allItems.push({type:'tourney',d:m.d||'',m:{...m,a:m.a||m.u},idx});
  });
  // 프로리그 개인 대회 (procomp)
  (proTourneys||[]).forEach((tn,tnIdx)=>{
    (tn.groups||[]).forEach((grp,grpIdx)=>{
      (grp.matches||[]).forEach((m,matchIdx)=>{
        if(!m.a||!m.b||!m.winner)return;
        if(!passDateFilter(m.d||''))return;
        const wName=m.winner==='A'?m.a:m.b;
        const lName=m.winner==='A'?m.b:m.a;
        allItems.push({type:'procomp',d:m.d||'',m:{...m,wName,lName},idx:matchIdx,_ref:`procomp:${tnIdx}:${grpIdx}:${matchIdx}`});
      });
    });
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d).localeCompare(b.d):(b.d).localeCompare(a.d));

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
    {id:'mini',lbl:'⚡ 미니'},
    {id:'univm',lbl:'🏟️ 대학대전'},
    {id:'ck',lbl:'🤝 CK'},
    {id:'pro',lbl:'🏅 프로'},
    {id:'tt',lbl:'🎯 티어'},
    {id:'ind',lbl:'🎮 개인전'},
    {id:'gj',lbl:'⚔️ 끝장전'},
    {id:'tourney',lbl:'🎖️ 대회'},
    {id:'procomp',lbl:'🏅 프로리그대회'},
  ].filter(t=>t.id==='전체'||_typeCountMap[t.id]>0);
  // 페이지네이션
  const pageSize=getHistPageSize();
  if(histPage['all']===undefined) histPage['all']=0;
  const totalPages=Math.ceil(_typeFiltered.length/pageSize)||1;
  if(histPage['all']>=totalPages) histPage['all']=Math.max(0,totalPages-1);
  const curPage=histPage['all'];
  const paged=_typeFiltered.length>pageSize?_typeFiltered.slice(curPage*pageSize,(curPage+1)*pageSize):_typeFiltered;

  let h=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
    ${_typeButtons.map(t=>`<button class="pill ${window._recTypeFilter===t.id?'on':''}" onclick="window._recTypeFilter='${t.id}';histPage['all']=0;render()">${t.lbl}${t.id!=='전체'&&_typeCountMap[t.id]?` <span style="font-size:10px;opacity:.7">(${_typeCountMap[t.id]})</span>`:''}</button>`).join('')}
  </div>`;

  if(!paged.length){
    h+=`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div></div>`;
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
    h+=`<div class="rec-summary rec-mode-tierrank${_recSideFxClass(mode)}" data-rec-mode="tierrank" style="--rec-mode-col:${ti.col};--rec-mode-rgb:${(function(){const h=String(ti.col||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};${_recSideFxStyle(mode,ca,cb)}border-left:3px solid ${ti.col}">
      <div class="rec-sum-header" style="gap:6px">
        <div style="display:flex;flex-direction:column;gap:2px;flex-shrink:0;min-width:68px">
          <span style="font-size:9px;font-weight:800;padding:1px 6px;border-radius:4px;background:${ti.col}18;color:${ti.col};white-space:nowrap;display:inline-block">${ti.lbl}${m._teamMatchType?` <span style="background:#7c3aed;color:#fff;padding:0 4px;border-radius:3px">${m._teamMatchType.replace('v',':')+'전'}</span>`:''}</span>
          <span style="font-size:12px;font-weight:600;color:${dColor};white-space:nowrap">${dLabel}</span>
        </div>
        <span style="font-weight:800;font-size:13px;color:${winner===teamA?'#16a34a':'var(--text)'};flex:1;min-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${teamA}</span>
        ${isInd
          ?`<span style="font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;white-space:nowrap;flex-shrink:0" onclick="toggleDetail('${key}')">승</span>`
          :`<div class="rec-sum-score score-click" style="font-size:16px;padding:3px 12px" onclick="toggleDetail('${key}')">
            <span style="color:${Number(scoreA)>Number(scoreB)?'#16a34a':Number(scoreB)>Number(scoreA)?'#dc2626':'var(--text)'}">${scoreA}</span>
            <span style="color:var(--gray-l);font-size:12px;font-weight:400">:</span>
            <span style="color:${Number(scoreB)>Number(scoreA)?'#16a34a':Number(scoreA)>Number(scoreB)?'#dc2626':'var(--text)'}">${scoreB}</span>
          </div>`}
        <span style="font-weight:800;font-size:13px;color:${winner===teamB?'#16a34a':'var(--text)'};flex:1;min-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right">${teamB}</span>
        ${winner&&!isInd?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${winCol}18;color:${winCol};border:1px solid ${winCol}33;white-space:nowrap;flex-shrink:0">🏆 ${winner}</span>`:''}
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${isInd
          ? (()=> {
              const wp=players.find(p=>p.name===(m.wName||'')); const lp=players.find(p=>p.name===(m.lName||''));
              const wc=wp?gc(wp.univ):'#888'; const lc=lp?gc(lp.univ):'#888';
              const mapStr=m.map&&m.map!=='-'?`<span style="font-size:11px;color:var(--gray-l)">📍 ${m.map}</span>`:'';
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

  // 페이지 네비게이션
  if(_typeFiltered.length>pageSize){
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
  // tourneys(조편성 대회) + comps(기존 대회) 합산
  const tourItems=getTourneyMatches();
  const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const allItems=[...tourItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=``;
  // 대회명별로 그룹화
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
    items.forEach(({m,idx})=>{
      const a=m.a||'',b=m.b||'';
      const ca=gc(a),cb=gc(b);
      const aWin=m.sa>m.sb,bWin=m.sb>m.sa;
      const key=`${context}-tourney-${idx}`;
      const rIdx=(m._src==='comps')?m._origIdx:-1;
      const grpBadge=m._src==='tour'
        ?`<span style="background:${m.grpColor||'#2563eb'};color:#fff;font-size:10px;font-weight:700;padding:1px 8px;border-radius:4px">GROUP ${m.grpLetter||''}</span>`:'';
      const _tAwin=m.sa>m.sb,_tBwin=m.sb>m.sa;
      const _tBorderCol=_tAwin?gc(a):_tBwin?gc(b):'var(--blue-ll)';
      const _ab = (typeof _collectMatchTeamMembersAB === 'function') ? _collectMatchTeamMembersAB(m) : {a:[], b:[]};
      const _aMemJson = JSON.stringify((_ab.a||[])).replace(/"/g,"'");
      const _bMemJson = JSON.stringify((_ab.b||[])).replace(/"/g,"'");
      h+=`<div class="rec-summary rec-mode-tourney${_recSideFxClass('tourney')}" data-rec-mode="tourney" style="--rec-mode-col:${_tBorderCol};--rec-mode-rgb:${(function(){const h=String(_tBorderCol||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};${_recSideFxStyle('tourney',ca,cb)}margin-left:8px;border-left:3px solid ${_tBorderCol}">
        <div class="rec-sum-header">
          <span style="color:var(--text3);font-size:12px;font-weight:600;flex-shrink:0;white-space:nowrap">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>
          ${grpBadge}
          <div class="rec-sum-vs">
            ${a?`<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
              <span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>
              ${(_ab.a||[]).length?`<button class="btn btn-xs rc-mem-btn" style="background:${ca}12;border:1px solid ${ca}40;color:${ca};font-weight:800" onclick="event.stopPropagation();openProMembersPopup('${a.replace(/'/g,"\\'")}', '${ca}', ${_aMemJson})">👥 ${(_ab.a||[]).length}명</button>`:''}
            </div>`:''}
            ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기">
              <span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${m.sa||0}</span>
              <span style="color:var(--gray-l);font-size:12px;font-weight:400">:</span>
              <span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${m.sb||0}</span>
            </div>`:''}
            ${b?`<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
              <span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>
              ${(_ab.b||[]).length?`<button class="btn btn-xs rc-mem-btn" style="background:${cb}12;border:1px solid ${cb}40;color:${cb};font-weight:800" onclick="event.stopPropagation();openProMembersPopup('${b.replace(/'/g,"\\'")}', '${cb}', ${_bMemJson})">👥 ${(_ab.b||[]).length}명</button>`:''}
            </div>`:''}
            ${(a&&b)?(aWin||bWin)?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${aWin?ca:cb}18;color:${aWin?ca:cb};border:1px solid ${aWin?ca:cb}33;white-space:nowrap;flex-shrink:0">🏆 ${aWin?a:b}</span>`:`<span style="font-size:10px;color:var(--gray-l)">무승부</span>`:''}

          </div>
          <div style="margin-left:auto;display:flex;gap:5px;align-items:center" class="no-export">
            <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
              onclick="openRecActionMenu(event,{
                _btnEl:this,
                a:'${(m.a||'').replace(/'/g,"\\'")}',
                sa:${m.sa||0},
                b:'${(m.b||'').replace(/'/g,"\\'")}',
                sb:${m.sb||0},
                d:'${m.d||''}',
                mode:'comp',
                idx:${rIdx>=0?rIdx:0},
                key:'${key}',
                canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
                shareFn:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1'; if(_adm && !isLoggedIn) return 'null'; return `()=>window._openShareMatchObjCard&&window._openShareMatchObjCard(_getHistTourneyMatchObj(${idx},'${context}'))`;})()},
                canEdit:${((rIdx>=0 || m._src==='tour') && isLoggedIn && !isSubAdmin)?'true':'false'},
                canDel:${(rIdx>=0 && isLoggedIn && !isSubAdmin)?'true':'false'},
                editFn:${m._src==='tour' ? `()=>leagueEditMatch('${m._tnId}',${m._gi},${m._mi})` : 'null'},
                canMove:false
              })">⋯</button>
          </div>
        </div>
        <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:rIdx>=0?'comp:'+rIdx:''},  'comp',a,b,ca,cb,aWin,bWin, rIdx)}
          ${(()=>{const _memo=(rIdx>=0&&isLoggedIn)?`<input type="text" id="memo-${key}" placeholder="경기 메모..." value="${m.memo||''}" style="flex:1;font-size:12px"><button class="btn btn-w btn-xs" onclick="saveMemo('comp',${rIdx},'memo-${key}')">💾 메모</button>${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('comp',${rIdx},null)">🗑️ 삭제</button>`:''}`:''; const _note=m.memo?`<div style="font-size:12px;color:var(--text2);background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:6px;padding:6px 10px;margin-bottom:6px">📝 ${m.memo}</div>`:''; return (_memo||_note)?`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)" class="no-export">${_note}<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">${_memo}</div></div>`:'';})()}
        </div>
      </div>`;
    });
  });
  return h;
}

// 대회 탭 공유카드용 헬퍼
function _getHistTourneyMatchObj(idx, context){
  const tourItems=getTourneyMatches();
  const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const all=[...tourItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sb==null) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  all.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const m = all[idx]||null;
  if(!m) return null;
  return {...m,_matchType:'comp',compName:m.compName||m.n||'',teamALabel:m.teamALabel||m.a||'',teamBLabel:m.teamBLabel||m.b||''};
}


function rHistUnivStat(){
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
  const myMini=miniM.filter(m=>(m.a===histUniv||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  const myUnivM=univM.filter(m=>(m.a===histUniv||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  const myCK=ckM.filter(m=>((m.teamAMembers||[]).some(x=>x.univ===histUniv)||(m.teamBMembers||[]).some(x=>x.univ===histUniv))&&(!passDateFilter||passDateFilter(m.d||'')));
  const myComp=comps.filter(m=>(((m.a||m.u)===histUniv)||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  // 조별대회(tourneys) 경기 추가
  const myTourney=(typeof getTourneyMatches==='function'?getTourneyMatches():[])
    .filter(m=>(m.a===histUniv||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
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
const _REC_SIDE_FX_MODES = ['soft','glow','panel','line','ribbon','frame','spotlight','fade','double'];
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
  return _recSideFxVarStyle(leftHex, rightHex, cfg);
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

function recSummaryListHTMLFiltered(arr,mode,ctxPrefix,filterUniv){
  if(!arr.length)return`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  // (정렬 보강) 티어대회 등 filtered 목록도 "입력 순서"가 아니라 날짜 기준으로 정렬
  // - 사용자가 과거 날짜 경기를 나중에 저장하면 unshift 때문에 최신순이 깨질 수 있음
  const _normDateSort = (d)=>{
    const s = String(d||'').trim();
    if(!s) return '';
    const m = s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if(m){
      const y=m[1];
      const mo=String(parseInt(m[2],10)).padStart(2,'0');
      const da=String(parseInt(m[3],10)).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    }
    return s;
  };
  let h='';
  let _filtered=false;
  // 유효 경기만 모아 렌더(그룹 요약 제거 요청)
  const list=[];
  arr.forEach((m, _origIdx)=>{
    if(isCKmode){if(mode!=='tt'&&(!m.teamAMembers||!m.teamBMembers)) return;}
    else{if(!m.a||!m.b) return;}
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
    _filtered=true;
    list.push({m, _origIdx});
  });

  function _renderItem(m){
    const srcArr=mode==='mini'?miniM:mode==='univm'?univM:mode==='pro'?proM:mode==='tt'?ttM:ckM;
    const i=srcArr.indexOf(m);
    const isCK=isCKmode;
    const _sideCols = mode==='ck' ? getFixedSideColors('ck') : mode==='pro' ? getFixedSideColors('pro') : getFixedSideColors('tt');
    const ca=isCK?_sideCols.a:gc(m.a);const cb=isCK?_sideCols.b:gc(m.b);
    const rawLA2=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    const rawLB2=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    const labelA=isCK?(rawLA2||'A팀'):m.a;const labelB=isCK?(rawLB2||'B팀'):m.b;
    const aWin=(m.sa>m.sb),bWin=(m.sb>m.sa);
    const col=gc(filterUniv);
    const isA=(!isCK&&m.a===filterUniv)||(isCK&&(m.teamAMembers||[]).some(x=>x.univ===filterUniv));
    const isB=(!isCK&&m.b===filterUniv)||(isCK&&(m.teamBMembers||[]).some(x=>x.univ===filterUniv));
    const myWin=(isA&&aWin)||(isB&&bWin);
    const key=`${ctxPrefix}-${mode}-${i}`;
    const MODE_COL = {
      ind:'#2563eb', gj:'#dc2626', progj:'#b91c1c',
      mini:'#7c3aed', civil:'#a855f7',
      univm:'#16a34a', ck:'#f59e0b', pro:'#0ea5e9',
      tt:'#10b981', comp:'#3b82f6', tourney:'#7c3aed',
      procomp:'#2563eb', procomptn:'#7c3aed'
    };
    const _mc = MODE_COL[mode] || '#64748b';
    const _rgb = (hex)=>{const h=String(hex||'').replace('#',''); if(h.length!==6) return '100,116,139'; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `${r},${g},${b}`;};
    const _pms=_collectMatchParticipantsAny(m);
    const _pmJson=JSON.stringify(_pms).replace(/"/g,"'");
    const _pmCol=(aWin?ca:bWin?cb:(ca||cb||'#64748b'));
    const _ab=_collectMatchTeamMembersAB(m);
    const _aMemJson=JSON.stringify(_ab.a||[]).replace(/"/g,"'");
    const _bMemJson=JSON.stringify(_ab.b||[]).replace(/"/g,"'");
    h+=`<div class="rec-summary rec-mode-${mode}${_recSideFxClass(mode)}" data-rec-mode="${mode}" style="--rec-mode-col:${_mc};--rec-mode-rgb:${_rgb(_mc)};${_recSideFxStyle(mode,ca,cb)}">
      <div class="rec-sum-header rec-sum-header--stack">
        <div class="rec-topline">
          <div class="rec-meta-row">
            <span class="rec-datechip">${m.d||''}</span>
            ${m.t?`<span class="rec-meta-chip">${m.t}</span>`:''}
            ${(m.n&&mode!=='comp')?`<span class="rec-meta-chip rec-meta-chip--note">${m.n}</span>`:''}
          </div>
          <div class="rec-actions rec-actions--inline no-export">
            ${(_pms.length && mode!=='tt')?`<button class="btn btn-w btn-xs rc-mem-btn" onclick="event.stopPropagation();openProMembersPopup('참여자', '${_pmCol}', ${_pmJson})">👥 ${_pms.length}</button>`:''}
            <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
              onclick="openRecActionMenu(event,{
                _btnEl:this,
                a:'${(m.a||'').replace(/'/g,"\\'")}',
                sa:${m.sa||0},
                b:'${(m.b||'').replace(/'/g,"\\'")}',
                sb:${m.sb||0},
                d:'${m.d||''}',
                mode:'${mode}',
                idx:${i},
                key:'${key}',
                canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
                canEdit:${(isLoggedIn && !isSubAdmin)?'true':'false'},
                canDel:${(isLoggedIn && !isSubAdmin)?'true':'false'},
                canMove:${['mini','univm','comp','tt','ck','pro'].includes(String(mode||''))?'true':'false'}
              })">⋯</button>
          </div>
        </div>
        <div class="rec-sum-vs">
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
            <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.a}')">${(()=>{const n=isCK?'':m.a;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}${labelA}</span>
            ${(_ab.a||[]).length?`<button class="btn btn-xs rc-mem-btn" style="background:${ca}12;border:1px solid ${ca}40;color:${ca};font-weight:800" onclick="event.stopPropagation();openProMembersPopup('${labelA.replace(/'/g,"\\'")}', '${ca}', ${_aMemJson})">👥 ${(_ab.a||[]).length}명</button>`:''}
          </div>
          <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa}</span><span style="color:var(--gray-l);font-size:14px">:</span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb}</span></div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
            <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.b}')">${(()=>{const n=isCK?'':m.b;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}${labelB}</span>
            ${(_ab.b||[]).length?`<button class="btn btn-xs rc-mem-btn" style="background:${cb}12;border:1px solid ${cb}40;color:${cb};font-weight:800" onclick="event.stopPropagation();openProMembersPopup('${labelB.replace(/'/g,"\\'")}', '${cb}', ${_bMemJson})">👥 ${(_ab.b||[]).length}명</button>`:''}
          </div>
          <span class="rec-victor-chip" style="--rec-victor-col:${myWin?col:(aWin?ca:bWin?cb:'#888')};color:${myWin?col:'#888'}">${myWin?'▶ '+filterUniv+' 승':aWin?'▶ '+labelA+' 승':bWin?'▶ '+labelB+' 승':'무승부'}</span>
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${mode}:${i}`},mode,labelA,labelB,ca,cb,aWin,bWin, i)}
      </div>
    </div>`;
  }

  // 날짜 정렬(기본: 최신순). 같은 날짜면 원래 배열 순서를 유지
  try{
    const dir = (typeof recSortDir!=='undefined' && recSortDir==='asc') ? 'asc' : 'desc';
    list.sort((x,y)=>{
      const dx=_normDateSort(x.m?.d||''), dy=_normDateSort(y.m?.d||'');
      const cmp = dir==='asc' ? dx.localeCompare(dy) : dy.localeCompare(dx);
      if(cmp!==0) return cmp;
      return (x._origIdx||0) - (y._origIdx||0);
    });
  }catch(e){}
  list.forEach(x=>_renderItem(x.m));
  if(!_filtered) return `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  return h;
}

function recSummaryListHTML(arr, mode, context, extraFilter){
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  // 날짜 정규화(정렬용): 2026-4-2 같이 0이 빠진 날짜가 있으면 문자열 정렬이 깨질 수 있음
  const _normDateSort = (d)=>{
    const s = String(d||'').trim();
    if(!s) return '';
    // yyyy-mm-dd / yyyy.m.d / yyyy/m/d
    const m = s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if(m){
      const y=m[1];
      const mo=String(parseInt(m[2],10)).padStart(2,'0');
      const da=String(parseInt(m[3],10)).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    }
    return s;
  };
  // 기록 카드 스타일 설정 (localStorage 기반)
  function _rcGet(k, d){ try{ const v=localStorage.getItem(k); return v==null?d:v; }catch(e){ return d; } }
  const _rcThemeOn = _rcGet('su_rc_theme_on','1')==='1';
  const _rcAccent  = (_rcGet('su_rc_accent_mode','none')||'none').trim();
  const _rcMemoOn  = _rcGet('su_rc_memo_on','0')==='1';
  // (요청사항) 기록 카드 대학 로고를 더 크게 (스코어 영역과 밸런스)
  const _uiconPx   = Math.max(14, Math.min(34, parseInt(_rcGet('su_rc_uicon','24'),10)||24));
  function _hexToRgbStr(hex){
    const h=String(hex||'').replace('#','').trim();
    if(h.length===3){
      const r=parseInt(h[0]+h[0],16), g=parseInt(h[1]+h[1],16), b=parseInt(h[2]+h[2],16);
      if([r,g,b].some(x=>isNaN(x))) return '100,116,139';
      return `${r},${g},${b}`;
    }
    if(h.length>=6){
      const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
      if([r,g,b].some(x=>isNaN(x))) return '100,116,139';
      return `${r},${g},${b}`;
    }
    return '100,116,139';
  }
  if(!window._recQ)window._recQ={};
  if(!arr.length){
    const emptyBar=``;
    return emptyBar+`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  // 날짜 필터만 적용 (검색어 필터는 DOM에서 실시간 처리)
  // 필터된 부분 배열이 넘어올 수 있으므로 원본 배열에서 실제 인덱스를 구함
  // (filter()는 같은 객체 참조를 반환하므로 indexOf로 정확한 원본 인덱스 확인 가능)
  const _srcArr=(()=>{
    if(mode==='mini') return miniM;
    if(mode==='univm') return univM;
    if(mode==='ck') return ckM;
    if(mode==='pro') return proM;
    if(mode==='tt') return ttM;
    if(mode==='comp') return comps;
    return arr;
  })();
  let filtered=arr.map((m,i)=>({m,i:_srcArr!==arr?_srcArr.indexOf(m):i})).filter(({m})=>{
    if(extraFilter&&!extraFilter(m)) return false;
    if(isCKmode){
      if(mode!=='tt'&&(!m.teamAMembers||!m.teamBMembers)) return false;
    } else {
      if(!m.a||!m.b) return false;
    }
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    if(typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return false;
    return true;
  });
  // 동일 날짜 내 정렬 보조키(최신이 위): 시간/생성시각 기반
  // - time: 숫자(ms) 또는 문자열
  // - t: 'HH:MM' 형태(존재할 경우)
  // - _id/sid: genId() = (Date.now base36 + random4) → 앞부분으로 생성시각 추정
  const _getMatchTs = (m, idx) => {
    try{
      // 1) time 필드
      if (m && typeof m.time === 'number') return m.time;
      if (m && typeof m.time === 'string' && m.time.trim()) {
        const n = Number(m.time);
        if (!isNaN(n) && isFinite(n)) return n;
      }
      // 2) t (HH:MM 또는 HH:MM:SS) → 날짜 없는 경우도 있어 보조키로만 사용
      if (m && typeof m.t === 'string' && m.t.includes(':')) {
        const parts = m.t.split(':').map(x=>Number(x));
        if (parts.length >= 2 && parts.every(x=>!isNaN(x))) {
          const hh = parts[0]||0, mm = parts[1]||0, ss = parts[2]||0;
          return hh*3600 + mm*60 + ss;
        }
      }
      // 3) genId 기반(_id/sid)
      const id = (m && (m._id || m.sid)) ? String(m._id || m.sid) : '';
      if (id && id.length > 4) {
        const prefix = id.slice(0, -4); // Date.now().toString(36)
        const t36 = parseInt(prefix, 36);
        if (!isNaN(t36) && isFinite(t36)) return t36;
      }
    }catch(e){}
    // 4) 최후: 배열 인덱스(대부분 unshift로 최신이 0번) → desc에서는 -idx가 최신 우선
    return -idx;
  };
  filtered.sort((a,b)=>{
    const da=_normDateSort(a.m.d||''), db=_normDateSort(b.m.d||'');
    const cmp=recSortDir==='asc'?da.localeCompare(db):db.localeCompare(da);
    if(cmp!==0) return cmp;
    // 동일 날짜일 때: (1) 시간/생성시각 (2) 원본 인덱스
    const ta=_getMatchTs(a.m, a.i);
    const tb=_getMatchTs(b.m, b.i);
    const cmp2 = recSortDir==='asc' ? (ta - tb) : (tb - ta);
    if (cmp2 !== 0) return cmp2;
    // asc(오래된→최신): unshift 기준이라 i가 클수록 오래됨
    return recSortDir==='asc' ? (b.i - a.i) : (a.i - b.i);
  });

  // ── 날짜(일자) 빠른 선택: ASL 스타일 날짜 메뉴(설정: su_date_menu_style) ──
  // 컨텍스트별로 날짜 선택값을 저장하여(예: hist / tiertour) 서로 간섭하지 않게 함
  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') || 'pill');
  const _datePickKey = `su_rec_date_pick_${context||'x'}_${mode}`;
  const _pickedDate = (localStorage.getItem(_datePickKey) || '').trim();
  const _baseFiltered = filtered.slice(); // 메뉴/카운트는 원본(일자 선택 전) 기준
  const _allDates = Array.from(new Set(_baseFiltered.map(x=>_normDateSort(x.m.d||'')).filter(Boolean))).sort((a,b)=>recSortDir==='asc'?a.localeCompare(b):b.localeCompare(a));
  if(_pickedDate && _allDates.includes(_pickedDate)){
    filtered = filtered.filter(x => _normDateSort(x.m.d||'') === _pickedDate);
  }
  const _dateMenuHTML = (()=>{
    if(_dateMenuStyle!=='asl' || !_allDates.length) return '';
    const daysS=['일','월','화','수','목','금','토'];
    const _mini = (m)=>{
      const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
      const a=isCK?(String(m.teamALabel||'A팀').replace(/^\$\{.*\}$/,'')||'A팀'):(m.a||'');
      const b=isCK?(String(m.teamBLabel||'B팀').replace(/^\$\{.*\}$/,'')||'B팀'):(m.b||'');
      const ca=gc(a)||'#64748b', cb=gc(b)||'#64748b';
      const icon = (u, col)=>{
        const url=UNIV_ICONS[u]||(univCfg.find(x=>x.name===u)||{}).icon||'';
        if(url) return `<img src="${toHttpsUrl(url)}" style="width:14px;height:14px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`;
        return `<span style="width:10px;height:10px;border-radius:3px;background:${col};display:inline-block;flex-shrink:0"></span>`;
      };
      return `<div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text2);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        <span style="display:inline-flex;align-items:center;gap:4px;min-width:0;flex:1">${icon(a,ca)}<span style="overflow:hidden;text-overflow:ellipsis">${a||'—'}</span></span>
        <span style="color:var(--gray-l);font-weight:900;flex-shrink:0">vs</span>
        <span style="display:inline-flex;align-items:center;gap:4px;min-width:0;flex:1;justify-content:flex-end">${icon(b,cb)}<span style="overflow:hidden;text-overflow:ellipsis">${b||'—'}</span></span>
      </div>`;
    };
    let h=`<div class="no-export" style="margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div style="display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">`;
    const _onAll = !_pickedDate;
    h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','');histPage['${mode}']=0;render()" style="flex-shrink:0;min-width:92px;padding:10px 12px;border-radius:12px;border:1px solid ${_onAll?'var(--blue)':'var(--border)'};background:${_onAll?'#eff6ff':'var(--surface)'};cursor:pointer;text-align:left">
        <div style="font-weight:1000;font-size:12px;color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
        <div style="margin-top:6px;font-size:10px;color:var(--gray-l)">날짜 필터 해제</div>
      </button>`;
    _allDates.forEach(d0=>{
      const dt=new Date(d0+'T00:00:00');
      const label=`${daysS[dt.getDay()]} ${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
      const ms=_baseFiltered
        .filter(x=>String(x.m.d||'').trim()===d0)
        .slice(0,2)
        .map(x=>_mini(x.m)).join('');
      const prev=ms?`<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">${ms}</div>`:'';
      const on=(_pickedDate===d0);
      const cnt=_baseFiltered.filter(x=>String(x.m.d||'').trim()===d0).length;
      h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','${d0}');histPage['${mode}']=0;render()" style="flex-shrink:0;text-align:left;min-width:150px;max-width:240px;padding:10px 12px;border-radius:12px;border:1px solid ${on?'var(--blue)':'var(--border)'};background:${on?'#eff6ff':'var(--surface)'};cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:1000;font-size:12px;color:${on?'var(--blue)':'var(--text2)'}">${label}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--gray-l);font-weight:900">${cnt?`기록 ${cnt}`:''}</span>
        </div>
        ${prev}
      </button>`;
    });
    h+=`</div></div>`;
    return h;
  })();

  // ── 페이지네이션 계산 ──
  const totalItems=filtered.length;
  const pageSize=getHistPageSize();
  const pageKey=mode;
  if(histPage[pageKey]===undefined) histPage[pageKey]=0;
  const totalPages=Math.ceil(totalItems/pageSize)||1;
  if(histPage[pageKey]>=totalPages) histPage[pageKey]=Math.max(0,totalPages-1);
  const curPage=histPage[pageKey];
  const paged=totalItems>pageSize?filtered.slice(curPage*pageSize,(curPage+1)*pageSize):filtered;
  // 일괄 이동 컨텍스트
  const _canBulk=isLoggedIn;
  const _bulkKey=(mode==='mini'&&histSub==='civil')?'civil':mode;
  const _bulkOn=_canBulk&&!!_bulkModes[_bulkKey];
  const _bulkDests=_bulkKey==='mini'?[{l:'⚔️ 시빌워',d:'civil'},{l:'🏟️ 대학대전',d:'univm'}]
    :_bulkKey==='civil'?[{l:'⚡ 미니대전',d:'mini'},{l:'🏟️ 대학대전',d:'univm'}]
    :_bulkKey==='univm'?[{l:'⚡ 미니대전',d:'mini'},{l:'⚔️ 시빌워',d:'civil'}]:[];
  const sortBar=`${_bulkOn?`<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
    <label style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;cursor:pointer;color:var(--blue)">
      <input type="checkbox" id="bulk-all-${_bulkKey}" onchange="bulkToggleAll('${_bulkKey}',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
    </label>
    <span id="bulk-cnt-${_bulkKey}" style="font-size:11px;color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
    <span style="color:var(--border2)">│</span>
    ${_bulkDests.map(bd=>`<button onclick="bulkMoveTeam('${_bulkKey}','${bd.d}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:11px;font-weight:700;cursor:pointer">${bd.l}로 이동</button>`).join('')}
    <button onclick="bulkDeleteRecs('${_bulkKey}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:11px;font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
  </div>`:''}`;

  if(!totalItems){
    return sortBar+_dateMenuHTML+`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
  }

  // 기존 렌더 블록을 함수로 감싸서 그룹 출력에 재사용
  function _recItemHTML(m,i){
    const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
    const isCivil=(mode==='civil'||(m.type==='civil'));
    const _sideCols = mode==='ck' ? getFixedSideColors('ck') : mode==='pro' ? getFixedSideColors('pro') : getFixedSideColors('tt');
    // 시빌워: 같은 소속팀끼리 경기 → A팀/B팀 모두 같은 대학명 사용
    const _civilUniv=isCivil?(m.a||m.hostUniv||m.teamA||''):'';
    const ca=isCK?_sideCols.a:isCivil?gc(_civilUniv):gc(m.a);
    const cb=isCK?_sideCols.b:isCivil?gc(_civilUniv):gc(m.b);
    // teamALabel/B 필드 정리: 잘못된 값({...} 포함) 필터링
    const rawLA=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    const rawLB=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    // 시빌워: A/B 라벨 모두 같은 대학으로, 또는 A팀/B팀 구분
    const labelA=isCK?(rawLA||'A팀'):isCivil?(_civilUniv||m.a||'A팀'):m.a;
    const labelB=isCK?(rawLB||'B팀'):isCivil?(_civilUniv||m.a||'B팀'):m.b;
    const aWin=(m.sa>m.sb);const bWin=(m.sb>m.sa);
    const key=`${context}-${mode}-${i}`;
    // 검색용 hay 데이터
    // 대학 아이콘 (대학끼리 경기: mini/univm/comp/tour 는 상대 대학 아이콘, CK/pro/tt는 소속 대학 아이콘, 시빌워는 같은 대학)
    const _iconUnivA=isCivil?_civilUniv:(isCK?'':m.a);
    const _iconUnivB=isCivil?_civilUniv:(isCK?'':m.b);
    const iconA=(()=>{const n=_iconUnivA;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const iconB=(()=>{const n=_iconUnivB;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    // 기본(무색)에서는 승리색 테두리도 사용하지 않음
    const _wBorderCol = (_rcThemeOn && _rcAccent==='border' && (aWin||bWin)) ? (aWin?ca:bWin?cb:'var(--border)') : 'var(--border)';
    // 승리 색 테마(대학 색) — 켜져있을 때만 적용
    const _winCol = (aWin||bWin) ? (aWin?ca:cb) : '';
    const _rgb = _hexToRgbStr(_winCol);
    const _themeCls = (_rcThemeOn && _winCol && _rcAccent!=='none') ? ` rc-theme rc-accent-${_rcAccent}` : '';
    const _themeStyle = (_rcThemeOn && _winCol) ? `--rc-win-rgb:${_rgb};--rc-win-col:${_winCol};` : '';

    const MODE_COL = {
      ind:'#2563eb', gj:'#dc2626', mini:'#7c3aed', civil:'#a855f7',
      univm:'#16a34a', ck:'#f59e0b', pro:'#0ea5e9', tt:'#10b981',
      comp:'#3b82f6', tourney:'#7c3aed', procomptn:'#7c3aed', procompteam:'#2563eb'
    };
    const _mc = MODE_COL[mode] || '#64748b';
    const _rgbM = _hexToRgbStr(_mc);
    return `<div class="rec-summary rec-mode-${mode}${_themeCls}${_recSideFxClass(mode)}" data-rec-mode="${mode}" style="--rec-mode-col:${_mc};--rec-mode-rgb:${_rgbM};${_themeStyle}${_recSideFxStyle(mode,ca,cb)}border-left:3px solid ${_wBorderCol}">
      <div class="rec-sum-header rec-sum-header--stack">
        <div class="rec-topline">
          <div class="rec-meta-row">
            ${_bulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="${_bulkKey}" data-bidx="${i}" onchange="_bulkCountUpdate('${_bulkKey}')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:''}
            <span class="rec-datechip">${m.d?m.d.slice(2).replace(/-/g,'/'):''}</span>
            ${m.fmt>0?`<span class="rec-meta-chip rec-meta-chip--note">${m.fmt}:${m.fmt}</span>`:''}
            ${aWin||bWin?`<span class="rec-victor-chip rec-victor-chip--crown" style="--rec-victor-col:${aWin?ca:cb};color:${aWin?ca:cb}">🏆 ${aWin?labelA:labelB}</span>`:`<span class="rec-meta-chip">무승부</span>`}
          </div>
          <div class="rec-actions no-export rec-actions--inline">
          <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
            onclick="openRecActionMenu(event,{
              _btnEl:this,
              a:'${(m.a||'').replace(/'/g,"\\'")}',
              sa:${m.sa||0},
              b:'${(m.b||'').replace(/'/g,"\\'")}',
              sb:${m.sb||0},
              d:'${m.d||''}',
              mode:'${mode}',
              idx:${i},
              key:'${key}',
              canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
              canEdit:${(isLoggedIn && !isSubAdmin)?'true':'false'},
              canDel:${(isLoggedIn && !isSubAdmin)?'true':'false'},
              canMove:${(isLoggedIn && (mode==='mini'||mode==='univm'))?'true':'false'}
            })">⋯</button>
          </div>
        </div>
        ${(() => {
          // 팀 멤버 추출: teamAMembers/teamBMembers 있으면 사용, 없으면 sets에서 추출 (미니/대학)
          let aMembers = m.teamAMembers || [];
          let bMembers = m.teamBMembers || [];
          if (!aMembers.length && !bMembers.length && m.sets) {
            const aSet = new Set(), bSet = new Set();
            m.sets.forEach(s => {
              (s.games || []).forEach(g => {
                if (g.playerA) aSet.add(g.playerA);
                if (g.winner === 'A' && g.lName) bSet.add(g.lName);
                else if (g.winner === 'B' && g.wName) bSet.add(g.wName);
                if (g.playerB) bSet.add(g.playerB);
                if (g.winner === 'B' && g.lName) aSet.add(g.lName);
                else if (g.winner === 'A' && g.wName) aSet.add(g.wName);
              });
            });
            aMembers = Array.from(aSet).map(n => ({ name: n }));
            bMembers = Array.from(bSet).map(n => ({ name: n }));
          }
          const aMemJson = JSON.stringify(aMembers).replace(/"/g, "'");
          const bMemJson = JSON.stringify(bMembers).replace(/"/g, "'");
          const aBtnColor = ca || '#3b82f6';
          const bBtnColor = cb || '#ef4444';
          return `
        <div class="rec-sum-vs" style="flex-wrap:wrap;align-items:center">
          <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
            <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:4px" onclick="${!isCK?`openUnivModal('${m.a||''}')`:''}">${iconA?iconA.replace('width:18px;height:18px',`width:${_uiconPx}px;height:${_uiconPx}px`).replace('<img ','<img class="rec-uicon" '):''}${labelA}</span>
            ${aMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${aBtnColor}15,${aBtnColor}08);border:1.5px solid ${aBtnColor}40;color:${aBtnColor};font-weight:700;box-shadow:0 2px 8px ${aBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${aBtnColor}30,0 2px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px ${aBtnColor}20,0 1px 3px rgba(0,0,0,0.08)'" onclick="event.stopPropagation();openProMembersPopup('${labelA.replace(/'/g,"\\'")}', '${ca}', ${aMemJson})">
              <span class="mem-ico">👥</span><span>${aMembers.length}명</span>
            </button>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기/닫기">
              <span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${m.sa}</span>
              <span style="color:var(--gray-l);font-size:12px;font-weight:400">:</span>
              <span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${m.sb}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
            <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:4px" onclick="${!isCK?`openUnivModal('${m.b||''}')`:''}">${iconB?iconB.replace('width:18px;height:18px',`width:${_uiconPx}px;height:${_uiconPx}px`).replace('<img ','<img class="rec-uicon" '):''}${labelB}</span>
            ${bMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${bBtnColor}15,${bBtnColor}08);border:1.5px solid ${bBtnColor}40;color:${bBtnColor};font-weight:700;box-shadow:0 2px 8px ${bBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${bBtnColor}30,0 2px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px ${bBtnColor}20,0 1px 3px rgba(0,0,0,0.08)'" onclick="event.stopPropagation();openProMembersPopup('${labelB.replace(/'/g,"\\'")}', '${cb}', ${bMemJson})">
              <span class="mem-ico">👥</span><span>${bMembers.length}명</span>
            </button>` : ''}
          </div>
        </div>`;
        })()}
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${mode}:${i}`}, mode, labelA, labelB, ca, cb, aWin, bWin, i)}
        ${(()=>{const _note=m.memo?`<div class="rec-note-box">📝 ${m.memo}</div>`:''; const _memo=isLoggedIn&&_rcMemoOn?`<div class="fbar merged-subbar no-export rec-detail-footer__actions" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input type="text" id="memo-${key}" placeholder="경기 메모 입력..." value="${m.memo||''}" style="flex:1;font-size:12px"><button class="btn btn-w btn-xs" onclick="saveMemo('${mode}',${i},'memo-${key}')">💾 메모</button>${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('${mode}',${i},null)">🗑️ 삭제</button>`:''}</div>`:''; return (_note||_memo)?`<div class="rec-detail-footer">${_note}${_memo}</div>`:'';})()}
      </div>
    </div>`;
  }

  // (요청사항) 기록탭 상단 ‘이전/승패 요약’ 제거 → 그냥 리스트로만 출력
  let h=sortBar+`<div id="rec-list-${mode}">`;
  paged.forEach(({m,i})=>{ h+=_recItemHTML(m,i); });

  // ── 페이지 컨트롤 ──
  if(totalItems>getHistPageSize()){
    const pages=totalPages;
    let pager=`<div class="no-export" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:16px 0;flex-wrap:wrap">`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=0;render()" ${curPage===0?'disabled':''}>«</button>`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=Math.max(0,${curPage}-1);render()" ${curPage===0?'disabled':''}>‹</button>`;
    // 페이지 번호 버튼 (최대 7개)
    let startP=Math.max(0,curPage-3);let endP=Math.min(pages-1,startP+6);
    if(endP-startP<6)startP=Math.max(0,endP-6);
    for(let p=startP;p<=endP;p++){
      pager+=`<button class="btn ${p===curPage?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=${p};render()">${p+1}</button>`;
    }
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=Math.min(${pages-1},${curPage}+1);render()" ${curPage===pages-1?'disabled':''}>›</button>`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=${pages-1};render()" ${curPage===pages-1?'disabled':''}>»</button>`;
    pager+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${curPage+1} / ${pages}</span>`;
    pager+=`</div>`;
    h+=pager;
  }

  return h||`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
}

/* 모바일 시트용 레지스트리 */
window._detReg = window._detReg || {};
function _regDet(key, m, mode, lA, lB, ca, cb, aW, bW, idx){
  window._detReg[key] = {m, mode, lA, lB, ca, cb, aW, bW, idx};
  return buildDetailHTML(m, mode, lA, lB, ca, cb, aW, bW);
}
window._openShareFromDetReg = window._openShareFromDetReg || function(key){
  try{
    const reg = (window._detReg||{})[key];
    if(!reg || !reg.m || typeof window._openShareMatchObjCard!=='function') return false;
    const mode = reg.mode || '';
    const src = reg.m || {};
    const A = reg.lA || src.a || src.wName || 'A';
    const B = reg.lB || src.b || src.lName || 'B';
    let payload = {...src, a:A, b:B, _matchType:mode};
    if((mode==='ind' || mode==='gj' || mode==='progj') && (!(payload.sa!=null && payload.sb!=null))){
      if(Array.isArray(src.games) && src.games.length){
        const games = src.games.map(g=>{
          const w = g.wName || (g.winner==='A'?A:(g.winner==='B'?B:''));
          return {
            playerA: A,
            playerB: B,
            winner: w===A ? 'A' : (w===B ? 'B' : ''),
            map: g.map||''
          };
        });
        const sa = games.filter(g=>g.winner==='A').length;
        const sb = games.filter(g=>g.winner==='B').length;
        payload = {...payload, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
      }else if(src.wName || src.lName){
        const w = src.wName||'';
        const sa = w===A ? 1 : 0;
        const sb = w===B ? 1 : 0;
        payload = {...payload, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games:[{playerA:A, playerB:B, winner:sa>sb?'A':sb>sa?'B':'', map:src.map||''}]}]};
      }
      payload._usePlayerPhoto = true;
      if(mode==='ind' && payload._subLabel==null) payload._subLabel='개인전';
      if(mode==='gj' && payload._subLabel==null) payload._subLabel='끝장전';
      if(mode==='progj' && payload._subLabel==null) payload._subLabel='프로리그 끝장전';
    }
    try{
      const _personal = ['ind','gj','progj'].includes(String(mode||''));
      window._sharePopupContext = {
        source:'history-detail',
        key,
        mode,
        idx:reg.idx,
        canEdit:_personal && !!(isLoggedIn && !isSubAdmin),
        canDel:_personal && !!(isLoggedIn && !isSubAdmin),
        editFn:()=>openRE(mode, reg.idx),
        delFn:()=>delRec(mode, reg.idx)
      };
    }catch(e){}
    window._openShareMatchObjCard(payload);
    return true;
  }catch(e){
    return false;
  }
};

// ── (요청사항) 경기기록 점수 방식(세트제/경기제) 전환 ──
function _calcScoreFromSets(sets, scoreMode){
  let sa=0, sb=0;
  (sets||[]).forEach(s=>{
    if(!s) return;
    const games = Array.isArray(s.games) ? s.games : [];
    const scoreA = (s.scoreA!=null) ? Number(s.scoreA) : games.filter(g=>g && g.winner==='A').length;
    const scoreB = (s.scoreB!=null) ? Number(s.scoreB) : games.filter(g=>g && g.winner==='B').length;
    let w = s.winner;
    if(!w){
      w = scoreA>scoreB ? 'A' : scoreB>scoreA ? 'B' : '';
    }
    if(scoreMode==='set'){
      if(w==='A') sa += 1;
      else if(w==='B') sb += 1;
    }else{
      sa += (isNaN(scoreA)?0:scoreA);
      sb += (isNaN(scoreB)?0:scoreB);
    }
  });
  return {sa, sb};
}
function setRecScoreMode(mode, idx, scoreMode){
  try{
    const mkey = (mode==='mini'&&typeof histSub!=='undefined'&&histSub==='civil') ? 'civil' : mode;
    const arr = mkey==='mini'?miniM:mkey==='civil'?miniM:mkey==='univm'?univM:mkey==='ck'?ckM:mkey==='pro'?proM:mkey==='tt'?ttM:mkey==='comp'?comps:null;
    if(!arr || !arr[idx]) return;
    const m = arr[idx];
    if(!m.sets || !Array.isArray(m.sets) || !m.sets.length) return alert('세트 정보가 없어 전환할 수 없습니다.');
    const sm = (scoreMode==='set') ? 'set' : 'game';
    const sc = _calcScoreFromSets(m.sets, sm);
    m.sa = sc.sa;
    m.sb = sc.sb;
    m.scoreMode = sm;
    save();
    render();
  }catch(e){
    console.error('[setRecScoreMode] fail', e);
  }
}

// ─────────────────────────────────────────────────────────────
// 경기 상세 역추적 인덱스 (스트리머 history → 원본 경기 데이터)
// - 탭은 원본 배열을 직접 렌더하지만, 스트리머 상세는 history로부터 역추적이 필요함
// - matchId / _id / sid / 내부 _id 등이 섞여 있어 전역 인덱스를 생성해 해결
// ─────────────────────────────────────────────────────────────
window._matchIndex = window._matchIndex || null; // { idMap:Map, sigMap:Map, builtAt:number, sizes:{} }
function _buildMatchIndex(){
  const idMap = new Map();   // id -> [entry]
  const sigMap = new Map();  // sig -> [entry]
  const normDate = (s) => {
    const t = String(s||'').trim();
    if(!t) return '';
    // 허용: YYYY-MM-DD, YYYY-M-D, YYYY.MM.DD, YYYY/MM/DD, YYYYMMDD
    const m = t.match(/(20\\d{2})\\D?(\\d{1,2})\\D?(\\d{1,2})/);
    if(!m) return t;
    const y = m[1];
    const mo = String(m[2]).padStart(2,'0');
    const da = String(m[3]).padStart(2,'0');
    return `${y}-${mo}-${da}`;
  };

  const addId = (id, entry) => {
    const k = String(id||'').trim();
    if(!k) return;
    const arr = idMap.get(k) || [];
    arr.push(entry);
    idMap.set(k, arr);
  };

  const addSig = (date, a, b, map, entry) => {
    const d = normDate(date);
    const A = String(a||'').trim();
    const B = String(b||'').trim();
    if(!d || !A || !B) return;
    const pair = [A,B].sort().join('||');
    const m = (map && map !== '-') ? String(map).trim() : '';
    const sig = [d, pair, m].join('|');
    const arr = sigMap.get(sig) || [];
    arr.push(entry);
    sigMap.set(sig, arr);
    // 맵이 비었을 때도 찾을 수 있도록 map 없는 sig도 같이 기록
    if(m){
      const sig2 = [d, pair, ''].join('|');
      const arr2 = sigMap.get(sig2) || [];
      arr2.push(entry);
      sigMap.set(sig2, arr2);
    }
  };

  const indexSets = (matchObj, modeKey) => {
    if(!matchObj || !matchObj.sets) return;
    const date = normDate(matchObj.d || matchObj.date || '');
    const A = matchObj.a || matchObj.teamALabel || '';
    const B = matchObj.b || matchObj.teamBLabel || '';
    (matchObj.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g) return;
        // gameId → parent match
        if(g._id) addId(g._id, {refType:'game', modeKey, parent:matchObj, game:g});
        // signature (날짜+선수쌍+맵) → parent match
        if(date && g.playerA && g.playerB) addSig(date, g.playerA, g.playerB, g.map||'', {refType:'game', modeKey, parent:matchObj, game:g});
      });
    });
  };

  // 재귀적으로 _id를 가진 객체를 찾아 index (대회/프로리그대회 중첩 구조 대응)
  const walk = (node, modeKey, depth, seen) => {
    if(!node || depth>12) return;
    if(typeof node !== 'object') return;
    try{ if(seen.has(node)) return; seen.add(node); }catch(_){}

    // match-like object
    const id = node._id || node.id || node.matchId || node.sid || '';
    if(id){
      addId(id, {refType:'obj', modeKey, obj:node});
    }
    // 가능한 경우 signature도 등록
    const d = normDate(node.d || node.date || '');
    if(d){
      // 1) a/b 형태(단일 경기)
      if(node.a && node.b){
        addSig(d, node.a, node.b, node.map||'', {refType:'obj', modeKey, obj:node});
      }
      // 2) wName/lName 형태(단일 경기)
      if(node.wName && node.lName){
        addSig(d, node.wName, node.lName, node.map||'', {refType:'obj', modeKey, obj:node});
      }
    }
    // sets 포함 시 gameId도 등록
    if(node.sets && Array.isArray(node.sets)) indexSets(node, modeKey);
    // 프로리그대회 끝장전 세션(gjMatches): {a,b,games:[{winner,map}]}
    if(node.games && Array.isArray(node.games) && node.a && node.b && !node.sets){
      // 세트형으로 만들 수 있는 세션 → signature는 a/b로 등록
      if(d) addSig(d, node.a, node.b, '', {refType:'pcgj', modeKey, obj:node});
    }

    // traverse children
    if(Array.isArray(node)){
      node.forEach(it=>walk(it, modeKey, depth+1, seen));
    } else {
      Object.keys(node).forEach(k=>walk(node[k], modeKey, depth+1, seen));
    }
  };

  // ── top-level sources ──
  const seen = new WeakSet();
  const top = [
    {arr:(typeof miniM!=='undefined'?miniM:[]), modeKey:'mini'},
    {arr:(typeof univM!=='undefined'?univM:[]), modeKey:'univm'},
    {arr:(typeof ckM!=='undefined'?ckM:[]), modeKey:'ck'},
    {arr:(typeof proM!=='undefined'?proM:[]), modeKey:'pro'},
    {arr:(typeof ttM!=='undefined'?ttM:[]), modeKey:'tt'},
    {arr:(typeof comps!=='undefined'?comps:[]), modeKey:'comp'},
    {arr:(typeof tourneys!=='undefined'?tourneys:[]), modeKey:'tourney'},
    {arr:(typeof proTourneys!=='undefined'?proTourneys:[]), modeKey:'procomp'},
    {arr:(typeof indM!=='undefined'?indM:[]), modeKey:'ind'},
    {arr:(typeof gjM!=='undefined'?gjM:[]), modeKey:'gj'}
  ];
  top.forEach(({arr, modeKey})=>{
    try{
      // ind/gj는 game 객체지만 _id/sid를 모두 인덱싱
      if(modeKey==='ind' || modeKey==='gj'){
        (arr||[]).forEach(g=>{
          if(!g) return;
          if(g._id) addId(g._id, {refType:'obj', modeKey, obj:g});
          if(g.sid) addId(g.sid, {refType:'sid', modeKey, sid:g.sid});
          if(g.matchId) addId(g.matchId, {refType:'sid', modeKey, sid:g.matchId});
          if(g.d && g.wName && g.lName) addSig(g.d, g.wName, g.lName, g.map||'', {refType:'obj', modeKey, obj:g});
        });
        return;
      }
      (arr||[]).forEach(m=>{
        if(!m) return;
        // main id
        if(m._id) addId(m._id, {refType:'obj', modeKey, obj:m});
        if(m.id) addId(m.id, {refType:'obj', modeKey, obj:m});
        if(m.matchId) addId(m.matchId, {refType:'obj', modeKey, obj:m});
        // signature for match-level
        if(m.d && (m.a||m.teamALabel) && (m.b||m.teamBLabel)) addSig(m.d, (m.a||m.teamALabel), (m.b||m.teamBLabel), '', {refType:'obj', modeKey, obj:m});
        // sets games
        indexSets(m, modeKey);
        // deep scan nested (대회/프로리그대회)
        walk(m, modeKey, 0, seen);
      });
    }catch(_){}
  });

  const sizes = {
    mini: (typeof miniM!=='undefined' && miniM ? miniM.length : 0),
    univm: (typeof univM!=='undefined' && univM ? univM.length : 0),
    ck: (typeof ckM!=='undefined' && ckM ? ckM.length : 0),
    pro: (typeof proM!=='undefined' && proM ? proM.length : 0),
    tt: (typeof ttM!=='undefined' && ttM ? ttM.length : 0),
    comp: (typeof comps!=='undefined' && comps ? comps.length : 0),
    tourney: (typeof tourneys!=='undefined' && tourneys ? tourneys.length : 0),
    procomp: (typeof proTourneys!=='undefined' && proTourneys ? proTourneys.length : 0),
    ind: (typeof indM!=='undefined' && indM ? indM.length : 0),
    gj: (typeof gjM!=='undefined' && gjM ? gjM.length : 0)
  };
  window._matchIndex = {idMap, sigMap, builtAt:Date.now(), sizes};
  return window._matchIndex;
}
function _getMatchIndex(){
  // 데이터가 자주 바뀌는 앱이라, 없으면 생성 / 너무 오래됐으면 재생성
  const idx = window._matchIndex;
  if(!idx) return _buildMatchIndex();
  // 데이터 로딩/동기화 타이밍 이슈로, 길이 변화가 있으면 즉시 재인덱싱
  const cur = {
    mini: (typeof miniM!=='undefined' && miniM ? miniM.length : 0),
    univm: (typeof univM!=='undefined' && univM ? univM.length : 0),
    ck: (typeof ckM!=='undefined' && ckM ? ckM.length : 0),
    pro: (typeof proM!=='undefined' && proM ? proM.length : 0),
    tt: (typeof ttM!=='undefined' && ttM ? ttM.length : 0),
    comp: (typeof comps!=='undefined' && comps ? comps.length : 0),
    tourney: (typeof tourneys!=='undefined' && tourneys ? tourneys.length : 0),
    procomp: (typeof proTourneys!=='undefined' && proTourneys ? proTourneys.length : 0),
    ind: (typeof indM!=='undefined' && indM ? indM.length : 0),
    gj: (typeof gjM!=='undefined' && gjM ? gjM.length : 0)
  };
  const prev = idx.sizes || {};
  const changed = Object.keys(cur).some(k => (prev[k]||0) !== cur[k]);
  if(changed) return _buildMatchIndex();
  if(!idx.builtAt || (Date.now()-idx.builtAt) > 20000) return _buildMatchIndex(); // 20초 캐시
  return idx;
}

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 "최근 경기"에서 종목(배지) 클릭 → 경기 상세 팝업
// - matchId가 게임ID(_sN_gN)일 수 있어 세션ID로 정규화 후 찾음
// - 찾은 match를 histDetModal(경기 상세)로 표시
// ─────────────────────────────────────────────────────────────
window.openMatchDetailByMatchId = function(matchId, modeLabel){
  return window._openMatchDetailByMatchId(matchId, modeLabel, false);
};

// 내부 구현: silent=true면 실패 시 alert 안 띄움
window._openMatchDetailByMatchId = function(matchId, modeLabel, silent){
  try{
    const mid = String(matchId||'').trim();
    if(!mid) return false;
    const lbl = String(modeLabel||'').trim();
    const sessId = (mid.includes('_s') && mid.includes('_g')) ? mid.split('_s')[0] : mid;

    // 0) 인덱스로 우선 탐색 (중첩 대회 포함)
    let _idxSkipToNative = false; // 예: 끝장전(gj)은 세션 묶음 처리가 필요하므로 아래 native 로직으로 넘김
    {
      const idx = _getMatchIndex();
      const cands = (idx.idMap.get(mid) || []).concat(idx.idMap.get(sessId) || []);
      if(cands && cands.length){
        const pick = cands[0];
        // game ref → parent match
        if(pick.refType==='game' && pick.parent){
          const pm = pick.parent;
          const lA = pm.teamALabel || pm.a || 'A';
          const lB = pm.teamBLabel || pm.b || 'B';
          const ca = (typeof gc==='function' ? (gc(lA)||'#3b82f6') : '#3b82f6');
          const cb = (typeof gc==='function' ? (gc(lB)||'#ef4444') : '#ef4444');
          const aW = (pm.sa||0)>(pm.sb||0);
          const bW = (pm.sb||0)>(pm.sa||0);
          const key = 'mid:'+String(pm._id||sessId);
          _regDet(key, pm, pick.modeKey||'comp', lA, lB, ca, cb, aW, bW);
          openHistDetailModal(key);
          return true;
        }
        // procompgj session stored as {a,b,games}
        if(pick.refType==='pcgj' && pick.obj){
          const sess = pick.obj;
          const a = sess.a || 'A';
          const b = sess.b || 'B';
          const games = (sess.games||[]).map((gg,idx2)=>({
            _id: `${sess._id||sessId}_s0_g${idx2}`,
            playerA: a, playerB: b,
            winner: gg.winner===a ? 'A' : gg.winner===b ? 'B' : '',
            map: gg.map || ''
          }));
          const sa = games.filter(g=>g.winner==='A').length;
          const sb = games.filter(g=>g.winner==='B').length;
          const mm = {_id: sess._id||sessId, d: sess.d||'', a, b, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
          const ca = (typeof gc==='function' ? (gc(a)||'#3b82f6') : '#3b82f6');
          const cb = (typeof gc==='function' ? (gc(b)||'#ef4444') : '#ef4444');
          const key = 'mid:'+String(mm._id);
          _regDet(key, mm, 'procompgj', a, b, ca, cb, sa>sb, sb>sa);
          openHistDetailModal(key);
          return true;
        }
        if(pick.refType==='obj' && pick.obj){
          const o = pick.obj;
          // sets match
          if(o.sets && (o.a||o.teamALabel) && (o.b||o.teamBLabel)){
            const lA = o.teamALabel || o.a || 'A';
            const lB = o.teamBLabel || o.b || 'B';
            const ca = (typeof gc==='function' ? (gc(lA)||'#3b82f6') : '#3b82f6');
            const cb = (typeof gc==='function' ? (gc(lB)||'#ef4444') : '#ef4444');
            const aW = (o.sa||0)>(o.sb||0);
            const bW = (o.sb||0)>(o.sa||0);
            const key = 'mid:'+String(o._id||sessId);
            _regDet(key, o, pick.modeKey||'comp', lA, lB, ca, cb, aW, bW);
            openHistDetailModal(key);
            return true;
          }
          // ind-like
          if(o.wName && o.lName){
            // 끝장전(gj)은 BO 시리즈(여러 게임)로 묶어서 보여줘야 하므로
            // 인덱스에서 단일 게임으로 바로 열지 않고, 아래 native gj 로직(묶음 처리)로 넘김
            const mk = String(pick.modeKey||'');
            if(mk==='gj' || lbl.indexOf('끝장전') !== -1){
              _idxSkipToNative = true;
            } else {
              const key = 'mid:'+String(o._id||sessId);
              _regDet(key, {_id:key, d:o.d||'', wName:o.wName, lName:o.lName, map:o.map||''}, mk||'ind', 'WIN', 'LOSE', '#3b82f6', '#ef4444', true, false);
              openHistDetailModal(key);
              return true;
            }
          }
          // a/b + winner
          if(o.a && o.b && o.winner){
            const a=o.a, b=o.b;
            const w = (o.winner==='A' || o.winner===a) ? a : (o.winner==='B' || o.winner===b) ? b : '';
            const l = w===a ? b : w===b ? a : '';
            if(w && l){
              const key='mid:'+String(o._id||sessId);
              _regDet(key, {_id:key, d:o.d||'', wName:w, lName:l, map:o.map||''}, 'ind', 'WIN', 'LOSE', '#3b82f6', '#ef4444', true, false);
              openHistDetailModal(key);
              return true;
            }
          }
        }
      }
    }
    // 인덱스에서 찾았지만(주로 gj) 단일 표시 대신 묶음 처리가 필요하면 아래 로직으로 계속 진행

    const pickColor = (label, fallback) => {
      try{ return (typeof gc==='function' ? (gc(label)||fallback) : fallback); }
      catch(_){ return fallback; }
    };
    const openAsSetsMatch = (m, modeKey, lA, lB, ca, cb) => {
      const aW = (m.sa||0)>(m.sb||0);
      const bW = (m.sb||0)>(m.sa||0);
      const key = 'mid:'+String(m._id||sessId);
      _regDet(key, m, modeKey, lA, lB, ca, cb, aW, bW);
      openHistDetailModal(key);
      return true;
    };
    const openAsIndLike = (wName, lName, d, map, modeKey='ind') => {
      const key = 'mid:'+sessId;
      const m = {_id:sessId, d:d||'', wName, lName, map:map||''};
      _regDet(key, m, modeKey, 'WIN', 'LOSE', '#3b82f6', '#ef4444', true, false);
      openHistDetailModal(key);
      return true;
    };

    // 1) 개인전(indM) — _id가 gameId
    if(lbl==='개인전' && typeof indM!=='undefined'){
      const g = (indM||[]).find(x=>x && (x._id===mid || x._id===sessId));
      if(g) return openAsIndLike(g.wName, g.lName, g.d, g.map, 'ind');
    }

    // 2) 끝장전(gjM) / 프로리그끝장전(gjM _proLabel)
    if((lbl==='끝장전' || lbl==='프로리그끝장전') && typeof gjM!=='undefined'){
      const arr=(gjM||[]);
      const g = arr.find(x=>x && (
        x._id===mid || x._id===sessId ||
        x.sid===sessId || x.matchId===sessId ||
        x.sid===mid || x.matchId===mid
      ));
      if(g){
        const sid = g.sid || g.matchId || '';
        if(sid){
          const group = arr.filter(x=>x && (x.sid===sid || x.matchId===sid));
          if(group.length>=2){
            const names=[]; const seen=new Set();
            group.forEach(it=>{ [it.wName,it.lName].forEach(n=>{ if(n && !seen.has(n)){ seen.add(n); names.push(n);} }); });
            const A = names[0] || g.wName || 'A';
            const B = names[1] || g.lName || 'B';
            const games = group.slice().reverse().map((it,idx)=>({
              _id: `${sid}_s0_g${idx}`,
              playerA: A,
              playerB: B,
              winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
              map: it.map || ''
            }));
            const sa = games.filter(x=>x.winner==='A').length;
            const sb = games.filter(x=>x.winner==='B').length;
            const m = {_id: sid, d: g.d||'', a: A, b: B, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
            return openAsSetsMatch(m, 'gj', A, B, pickColor(A,'#3b82f6'), pickColor(B,'#ef4444'));
          }
        }
        // sid가 없거나 1게임만 잡히는 데이터(과거 저장/마이그레이션 등)는
        // 같은 날짜 + 같은 선수 페어(끝장전 특성상 BO 시리즈)를 한 세션으로 묶어서 표시
        const _pairKey = [g.wName||'', g.lName||''].map(s=>String(s).trim()).sort().join('||');
        const _isProGJ = (lbl==='프로리그끝장전');
        const group2 = arr.filter(x=>{
          if(!x) return false;
          if(String(x.d||'').trim() !== String(g.d||'').trim()) return false;
          const pk = [x.wName||'', x.lName||''].map(s=>String(s).trim()).sort().join('||');
          if(pk !== _pairKey) return false;
          // 프로끝장전/일반끝장전 분리 (가능한 경우)
          if(typeof x._proLabel !== 'undefined'){
            if(_isProGJ && !x._proLabel) return false;
            if(!_isProGJ && x._proLabel) return false;
          }
          return true;
        });
        if(group2.length>=2){
          const names=[]; const seen=new Set();
          group2.forEach(it=>{ [it.wName,it.lName].forEach(n=>{ if(n && !seen.has(n)){ seen.add(n); names.push(n);} }); });
          const A = names[0] || g.wName || 'A';
          const B = names[1] || g.lName || 'B';
          const gid = `gjgrp_${String(g.d||'')}_${_pairKey}`.replace(/[^\w\-|]/g,'');
          const games = group2.slice().reverse().map((it,idx)=>({
            _id: `${gid}_s0_g${idx}`,
            playerA: A,
            playerB: B,
            winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
            map: it.map || ''
          }));
          const sa = games.filter(x=>x.winner==='A').length;
          const sb = games.filter(x=>x.winner==='B').length;
          const mm = {_id: gid, d: g.d||'', a: A, b: B, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
          return openAsSetsMatch(mm, 'gj', A, B, pickColor(A,'#3b82f6'), pickColor(B,'#ef4444'));
        }
        return openAsIndLike(g.wName, g.lName, g.d, g.map, 'gj');
      }
    }

    // 3) 프로리그 대회 끝장전(proTourneys[].gjMatches) — 세션ID
    if(lbl==='프로리그대회끝장전' || lbl==='프로리그 대회 끝장전'){
      if(typeof proTourneys!=='undefined' && Array.isArray(proTourneys)){
        for(const tn of (proTourneys||[])){
          const sess = (tn?.gjMatches||[]).find(s=>s && s._id===sessId);
          if(sess){
            const a = sess.a || 'A';
            const b = sess.b || 'B';
            const games = (sess.games||[]).map((gg,idx)=>({
              _id: `${sessId}_s0_g${idx}`,
              playerA: a,
              playerB: b,
              winner: gg.winner===a ? 'A' : gg.winner===b ? 'B' : '',
              map: gg.map || ''
            }));
            const sa = games.filter(g=>g.winner==='A').length;
            const sb = games.filter(g=>g.winner==='B').length;
            const m = {_id: sessId, d: sess.d||'', a, b, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
            return openAsSetsMatch(m, 'procompgj', a, b, pickColor(a,'#3b82f6'), pickColor(b,'#ef4444'));
          }
        }
      }
    }

    // 4) 세트 기반: mini/univm/ck/pro/tt/comps/tourneys 등
    const pools=[];
    const push=(arr,modeKey)=>{ if(arr && Array.isArray(arr)) pools.push({arr,modeKey}); };
    if(lbl==='미니대전' || lbl==='시빌워') push(typeof miniM!=='undefined'?miniM:[], 'mini');
    if(lbl==='대학대전') push(typeof univM!=='undefined'?univM:[], 'univm');
    if(lbl==='대학CK') push(typeof ckM!=='undefined'?ckM:[], 'ck');
    if(lbl==='프로리그') push(typeof proM!=='undefined'?proM:[], 'pro');
    if(lbl==='티어대회' || lbl==='티어대회 토너먼트') push(typeof ttM!=='undefined'?ttM:[], 'tt');
    if(lbl==='조별리그' || lbl==='대회' || lbl==='토너먼트') push(typeof comps!=='undefined'?comps:[], 'comp');
    // fallback 전체
    push(typeof miniM!=='undefined'?miniM:[], 'mini');
    push(typeof univM!=='undefined'?univM:[], 'univm');
    push(typeof ckM!=='undefined'?ckM:[], 'ck');
    push(typeof proM!=='undefined'?proM:[], 'pro');
    push(typeof ttM!=='undefined'?ttM:[], 'tt');
    push(typeof comps!=='undefined'?comps:[], 'comp');
    // 기존 대회 구조(tourneys)가 있으면 포함
    if(typeof tourneys!=='undefined') push(tourneys, 'tourney');

    for(const p of pools){
      const m = (p.arr||[]).find(x=>x && (x._id===sessId || x.matchId===sessId || x.id===sessId));
      if(m){
        const lA = m.teamALabel || m.a || 'A';
        const lB = m.teamBLabel || m.b || 'B';
        return openAsSetsMatch(m, p.modeKey, lA, lB, pickColor(lA,'#3b82f6'), pickColor(lB,'#ef4444'));
      }
    }

    // 5) 프로리그 대회(조별/토너/팀전) 내부에서 _id 딥서치
    const deepFindById = (root, id, maxDepth=10) => {
      const seen = new WeakSet();
      const walk = (node, depth) => {
        if(!node || depth>maxDepth) return null;
        if(typeof node !== 'object') return null;
        try{ if(seen.has(node)) return null; seen.add(node); }catch(_){}
        if(node._id===id) return node;
        if(Array.isArray(node)){
          for(const it of node){ const r = walk(it, depth+1); if(r) return r; }
        } else {
          for(const k of Object.keys(node)){ const r = walk(node[k], depth+1); if(r) return r; }
        }
        return null;
      };
      return walk(root, 0);
    };
    if(typeof proTourneys!=='undefined'){
      const found = deepFindById(proTourneys, sessId, 10);
      if(found){
        if(found.sets && (found.a||found.teamALabel) && (found.b||found.teamBLabel)){
          const lA = found.teamALabel || found.a || 'A';
          const lB = found.teamBLabel || found.b || 'B';
          return openAsSetsMatch(found, 'procomp', lA, lB, pickColor(lA,'#3b82f6'), pickColor(lB,'#ef4444'));
        }
        if(found.wName && found.lName){
          return openAsIndLike(found.wName, found.lName, found.d||'', found.map||'', 'ind');
        }
        if(found.a && found.b && found.winner){
          const a = found.a, b = found.b;
          const w = (found.winner==='A' || found.winner===a) ? a : (found.winner==='B' || found.winner===b) ? b : '';
          const l = w===a ? b : w===b ? a : '';
          if(w && l) return openAsIndLike(w, l, found.d||'', found.map||'', 'ind');
        }
      }
    }

    if(!silent) alert('해당 경기 상세 데이터를 찾을 수 없습니다.');
    return false;
  }catch(e){
    if(!silent) alert('경기 상세를 여는 중 오류가 발생했습니다.');
    try{ console.error(e); }catch(_){}
    return false;
  }
};

// 외부 프록시 프리셋 UI는 `js/history-external-ui.js`로 분리

// 스트리머 상세의 history 한 줄 정보(날짜/상대/맵/모드)만으로도 경기 상세 찾기
window.openMatchDetailFromHistory = function(selfName, oppName, date, map, modeLabel, matchId, result){
  try{
    const selfN=String(selfName||'').trim();
    const oppN=String(oppName||'').trim();
    const _normDate = (s) => {
      const t = String(s||'').trim();
      if(!t) return '';
      const m = t.match(/(20\\d{2})\\D?(\\d{1,2})\\D?(\\d{1,2})/);
      if(!m) return t;
      const y=m[1], mo=String(m[2]).padStart(2,'0'), da=String(m[3]).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    };
    const d=_normDate(date);
    const m=String(map||'').trim();
    const lbl=String(modeLabel||'').trim();
    const mid=String(matchId||'').trim();
    const res=String(result||'').trim(); // '승' | '패' (없을 수 있음)

    // ── (추가 폴백) 스트리머 history 자체에서 "같은 날짜+상대+종목"을 묶어서 세트로 표시 ──
    // 원본 배열(ttM/tourneys 등)에서 게임을 못 주워오는 환경/데이터에서도, 유저가 보는 history 기준으로는
    // 분명 같은날 여러 경기가 존재하므로 팝업에서는 최소한 "여러 경기"로 묶여서 보이게 한다.
    if(d && selfN && oppN && lbl){
      const pObj = (typeof players!=='undefined' ? (players||[]).find(p=>p && p.name===selfN) : null);
      const hs = (pObj?.history||[]).filter(h=>{
        if(!h) return false;
        const hd=_normDate(h.date||h.d||'');
        if(hd !== d) return false;
        if(String(h.opp||'').trim() !== oppN) return false;
        if(String(h.mode||'').trim() !== lbl) return false;
        return true;
      });
      if(hs.length >= 2){
        // 시간순(있으면)으로 정렬해서 경기1~N으로 보여주기
        hs.sort((a,b)=>(a.time||0)-(b.time||0));
        const games = hs.map((h,i)=>({
          _id: `histgrp_${lbl}_${d}_${[selfN,oppN].sort().join('_')}_g${i}`.replace(/[^\w\-]/g,''),
          playerA: selfN,
          playerB: oppN,
          winner: (h.result==='승') ? 'A' : (h.result==='패') ? 'B' : '',
          map: h.map || ''
        })).filter(g=>g.winner); // 승패 없는 건 제외
        if(games.length >= 2){
          const sa = games.filter(x=>x.winner==='A').length;
          const sb = games.filter(x=>x.winner==='B').length;
          const mm = {_id:`histgrp_${lbl}_${d}_${[selfN,oppN].sort().join('_')}`.replace(/[^\w\-]/g,''), d, a:selfN, b:oppN, sa, sb,
            sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
          const ca = (typeof gc==='function' ? (gc(selfN)||'#3b82f6') : '#3b82f6');
          const cb = (typeof gc==='function' ? (gc(oppN)||'#ef4444') : '#ef4444');
          const key = 'mid:'+mm._id;
          _regDet(key, mm, (lbl.indexOf('티어대회')!==-1?'tt':lbl.indexOf('끝장전')!==-1?'gj':'comp'), selfN, oppN, ca, cb, sa>sb, sb>sa);
          openHistDetailModal(key);
          return true;
        }
      }
    }

    // ── (중요) 실시간 스캔 기반 "날짜+상대 묶기" ──
    // 인덱스(sigMap)는 캐시/타이밍 이슈로 최신 게임을 놓칠 수 있어,
    // 사용자가 클릭했을 때는 해당 모드의 원본 배열을 직접 스캔해서 "같은 날짜+상대" 게임을 전부 모아준다.
    const _pairOk = (a,b) => {
      const A=String(a||'').trim(), B=String(b||'').trim();
      return (A===selfN && B===oppN) || (A===oppN && B===selfN);
    };
    const _pushGameList = (out, pA, pB, winnerName, gMap, gid) => {
      const A=String(pA||'').trim(), B=String(pB||'').trim();
      const W=String(winnerName||'').trim();
      if(!A || !B || !W) return;
      if(!(W===A || W===B)) return;
      // ⚠️ 맵이 '-'(또는 공백)인 게임이 여러 개면, (A,B,W,map) 기준 중복제거로 인해 1개만 남는 문제가 생김.
      // gameId가 있으면 그것을 키로 우선 사용하고, 없으면 시퀀스를 붙여 유니크 처리한다.
      if(out._seq == null) out._seq = 0;
      const mapKey = String(gMap||'').trim();
      const key = gid ? `gid:${gid}` : `${A}|${B}|${W}|${mapKey}|seq:${++out._seq}`;
      if(out._seen.has(key)) return;
      out._seen.add(key);
      out.games.push({playerA:A, playerB:B, winner: (W===A?'A':'B'), map:gMap||''});
    };
    const _collectFromSetsArr = (arr, out) => {
      if(!Array.isArray(arr)) return;
      for(const mm of arr){
        if(!mm) continue;
        const md = _normDate(mm.d || mm.date || '');
        if(d && md && md !== d) continue;
        const sets = mm.sets || [];
        for(let si=0; si<sets.length; si++){
          const set = sets[si];
          const games = set?.games || [];
          for(let gi=0; gi<games.length; gi++){
            const g = games[gi];
            if(!g || !g.winner) continue;
            if(!_pairOk(g.playerA, g.playerB)) continue;
            const wName = (g.winner==='A') ? g.playerA : (g.winner==='B') ? g.playerB : '';
            const gid = g._id || `${mm._id||mm.id||'m'}_s${si}_g${gi}`;
            _pushGameList(out, g.playerA, g.playerB, wName, g.map||'', gid);
          }
        }
      }
    };
    const _collectFromGjArr = (arr, out, proOnly=null) => {
      if(!Array.isArray(arr)) return;
      for(const gg of arr){
        if(!gg) continue;
        const gd = _normDate(gg.d || gg.date || '');
        if(d && gd && gd !== d) continue;
        if(!_pairOk(gg.wName, gg.lName)) continue;
        if(proOnly === true && !gg._proLabel) continue;
        if(proOnly === false && gg._proLabel) continue;
        _pushGameList(out, gg.wName, gg.lName, gg.wName, gg.map||'', gg._id || gg.sid || gg.matchId || '');
      }
    };
    const _collectDeepSets = (root, out, depth=0, seen=new WeakSet()) => {
      if(!root || depth>10) return;
      if(typeof root !== 'object') return;
      try{ if(seen.has(root)) return; seen.add(root); }catch(_){}
      // match object with sets
      if(root.sets && Array.isArray(root.sets)){
        const rd = _normDate(root.d || root.date || '');
        if(!d || !rd || rd === d){
          for(let si=0; si<root.sets.length; si++){
            const set = root.sets[si];
            const games = set?.games || [];
            for(let gi=0; gi<games.length; gi++){
              const g = games[gi];
              if(!g || !g.winner) continue;
              if(!_pairOk(g.playerA, g.playerB)) continue;
              const wName = (g.winner==='A') ? g.playerA : (g.winner==='B') ? g.playerB : '';
              const gid = g._id || `${root._id||root.id||'r'}_s${si}_g${gi}`;
              _pushGameList(out, g.playerA, g.playerB, wName, g.map||'', gid);
            }
          }
        }
      }
      if(Array.isArray(root)){
        for(const it of root) _collectDeepSets(it, out, depth+1, seen);
      } else {
        for(const k of Object.keys(root)) _collectDeepSets(root[k], out, depth+1, seen);
      }
    };
    const _openGroupedSetPopup = (games, modeKeyFallback) => {
      if(!games || games.length < 2) return false;
      const A=selfN, B=oppN;
      const gs = games.map((g,i)=>({
        _id: `grp_${lbl}_${d}_${[A,B].sort().join('_')}_g${i}`.replace(/[^\w\-]/g,''),
        playerA: A,
        playerB: B,
        winner: ((g.winner==='A'?g.playerA:g.playerB)===A) ? 'A' : 'B',
        map: g.map || ''
      }));
      const sa = gs.filter(x=>x.winner==='A').length;
      const sb = gs.filter(x=>x.winner==='B').length;
      const mm = {_id:`grp_${lbl}_${d}_${[A,B].sort().join('_')}`.replace(/[^\w\-]/g,''), d, a:A, b:B, sa, sb,
        sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games:gs}]};
      const ca = (typeof gc==='function' ? (gc(A)||'#3b82f6') : '#3b82f6');
      const cb = (typeof gc==='function' ? (gc(B)||'#ef4444') : '#ef4444');
      const key='mid:'+mm._id;
      _regDet(key, mm, modeKeyFallback||'comp', A, B, ca, cb, sa>sb, sb>sa);
      openHistDetailModal(key);
      return true;
    };

    // 모드별로 스캔 범위 선택
    if(d && selfN && oppN){
      const out = {games:[], _seen:new Set()};
      if(lbl==='끝장전'){
        _collectFromGjArr(typeof gjM!=='undefined'?gjM:[], out, false);
        if(_openGroupedSetPopup(out.games, 'gj')) return true;
      }
      if(lbl==='프로리그끝장전'){
        _collectFromGjArr(typeof gjM!=='undefined'?gjM:[], out, true);
        if(_openGroupedSetPopup(out.games, 'gj')) return true;
      }
      if(lbl==='대학CK'){
        _collectFromSetsArr(typeof ckM!=='undefined'?ckM:[], out);
        if(_openGroupedSetPopup(out.games, 'ck')) return true;
      }
      if(lbl==='티어대회' || lbl==='티어대회 토너먼트'){
        _collectFromSetsArr(typeof ttM!=='undefined'?ttM:[], out);
        _collectDeepSets(typeof tourneys!=='undefined'?tourneys:[], out);
        if(_openGroupedSetPopup(out.games, 'tt')) return true;
      }
      if(lbl==='프로리그'){
        _collectFromSetsArr(typeof proM!=='undefined'?proM:[], out);
        if(_openGroupedSetPopup(out.games, 'pro')) return true;
      }
      if(lbl==='대학대전'){
        _collectFromSetsArr(typeof univM!=='undefined'?univM:[], out);
        if(_openGroupedSetPopup(out.games, 'univm')) return true;
      }
      if(lbl==='미니대전' || lbl==='시빌워'){
        _collectFromSetsArr(typeof miniM!=='undefined'?miniM:[], out);
        if(_openGroupedSetPopup(out.games, 'mini')) return true;
      }
      if(lbl==='조별리그' || lbl==='대회' || lbl==='토너먼트' || lbl.indexOf('프로리그대회')!==-1 || lbl.indexOf('프로리그 대회')!==-1){
        _collectFromSetsArr(typeof comps!=='undefined'?comps:[], out);
        _collectDeepSets(typeof tourneys!=='undefined'?tourneys:[], out);
        _collectDeepSets(typeof proTourneys!=='undefined'?proTourneys:[], out);
        if(_openGroupedSetPopup(out.games, 'comp')) return true;
      }
    }

    // (요청) A안: 날짜+상대가 같으면 무조건 1매치로 묶기
    // - 스트리머 history는 종종 "개별 게임 1개" 단위로 쌓여있어서 종목 클릭 시 1개만 뜨는 문제가 있었음
    // - 탭에 있는 원본 데이터(세트/대회/끝장전/CK/티어대회 등)에서 "같은 날짜 + 같은 선수 페어" 게임을 전부 모아 세트형으로 표시
    const _labelToModeKeys = (label) => {
      if(!label) return [];
      if(label==='대학CK') return ['ck'];
      if(label==='대학대전') return ['univm'];
      if(label==='미니대전' || label==='시빌워') return ['mini'];
      if(label==='프로리그') return ['pro'];
      if(label.indexOf('티어대회') !== -1) return ['tt','tourney']; // 티어대회 토너먼트가 tourneys에 들어있는 케이스 대응
      if(label.indexOf('끝장전') !== -1) return ['gj','procompgj'];
      if(label==='조별리그' || label==='대회' || label==='토너먼트' || label.indexOf('프로리그대회') !== -1 || label.indexOf('프로리그 대회') !== -1)
        return ['comp','tourney','procomp'];
      // 기타는 제한하지 않음
      return [];
    };
    const _wantModeKeys = _labelToModeKeys(lbl);
    if(d && selfN && oppN && lbl && lbl!=='개인전'){
      const idx = _getMatchIndex();
      const pair = [selfN, oppN].sort().join('||');
      const sig = [d, pair, ''].join('|');
      const entries = idx.sigMap.get(sig) || [];
      // mode 필터 적용 (필터가 비어있으면 전부 허용)
      const filtered = _wantModeKeys.length ? entries.filter(e => _wantModeKeys.includes(e.modeKey)) : entries;

      // game 수집 (중복 제거)
      const outGames = [];
      const seenGame = new Set();
      const pushGame = (pA, pB, winnerName, gMap) => {
        const A = String(pA||'').trim(), B = String(pB||'').trim();
        const W = String(winnerName||'').trim();
        if(!A || !B || !W) return;
        if(!(W===A || W===B)) return;
        const key = [A,B,W,String(gMap||'').trim()].join('|');
        if(seenGame.has(key)) return;
        seenGame.add(key);
        outGames.push({
          playerA: A,
          playerB: B,
          winner: W===A ? 'A' : 'B',
          map: gMap || ''
        });
      };

      filtered.forEach(ent=>{
        if(!ent) return;
        if(ent.refType==='game' && ent.game){
          const g = ent.game;
          const wName = (g.winner==='A') ? g.playerA : (g.winner==='B') ? g.playerB : '';
          pushGame(g.playerA, g.playerB, wName, g.map||'');
        } else if(ent.refType==='pcgj' && ent.obj){
          const s = ent.obj;
          const A = s.a, B = s.b;
          (s.games||[]).forEach(gg=>{
            pushGame(A, B, gg.winner, gg.map||'');
          });
        } else if(ent.refType==='obj' && ent.obj){
          const o = ent.obj;
          if(o.wName && o.lName){
            pushGame(o.wName, o.lName, o.wName, o.map||'');
          } else if(o.a && o.b && o.winner){
            const a=o.a, b=o.b;
            const w = (o.winner==='A'||o.winner===a) ? a : (o.winner==='B'||o.winner===b) ? b : '';
            pushGame(a, b, w, o.map||'');
          }
        }
      });

      // 2게임 이상이면 세트형으로 묶어서 표시
      if(outGames.length >= 2){
        // self/opp를 A/B로 고정해서 표기 (요청: 날짜+상대 기준 묶기)
        const A = selfN, B = oppN;
        const games = outGames.map((g, i)=>({
          _id: `grp_${d}_${[A,B].sort().join('_')}_g${i}`.replace(/[^\w\-]/g,''),
          playerA: A,
          playerB: B,
          winner: (g.winner==='A' ? g.playerA : g.playerB)===A ? 'A' : 'B',
          map: g.map || ''
        }));
        const sa = games.filter(x=>x.winner==='A').length;
        const sb = games.filter(x=>x.winner==='B').length;
        const mm = {_id:`grp_${lbl}_${d}_${[A,B].sort().join('_')}`.replace(/[^\w\-]/g,''), d, a: A, b: B, sa, sb,
          sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
        const ca = (typeof gc==='function' ? (gc(A)||'#3b82f6') : '#3b82f6');
        const cb = (typeof gc==='function' ? (gc(B)||'#ef4444') : '#ef4444');
        const modeKey = (_wantModeKeys[0] || (lbl.indexOf('끝장전')!==-1?'gj':'comp'));
        const key = 'mid:'+mm._id;
        _regDet(key, mm, modeKey, A, B, ca, cb, sa>sb, sb>sa);
        openHistDetailModal(key);
        return true;
      }
    }

    // 끝장전은 "한 세션(BO5 등)"으로 묶어서 보여주는 게 기본 기대값이라,
    // history의 matchId가 개별 게임ID로 들어와도 날짜+선수페어 기준으로 묶어서 우선 표시한다.
    if((lbl==='끝장전' || lbl==='프로리그끝장전') && typeof gjM!=='undefined'){
      const arr = (gjM||[]);
      const dateOk = (xDate) => !d || _normDate(xDate) === d;
      const playersOk = (a,b) => {
        const A=String(a||'').trim(), B=String(b||'').trim();
        return (A===selfN && B===oppN) || (A===oppN && B===selfN);
      };
      const group = arr.filter(x=>{
        if(!x) return false;
        if(x.d && !dateOk(x.d)) return false;
        // 일부 데이터는 d가 비어있을 수 있어, 그런 경우엔 날짜 필터를 강제하지 않음
        if(x.wName && x.lName){
          if(!playersOk(x.wName, x.lName)) return false;
        } else return false;
        // 프로끝장전/일반끝장전 구분 (가능한 경우)
        if(typeof x._proLabel !== 'undefined'){
          if(lbl==='프로리그끝장전' && !x._proLabel) return false;
          if(lbl==='끝장전' && x._proLabel) return false;
        }
        return true;
      });
      if(group.length >= 2){
        const names=[]; const seen=new Set();
        group.forEach(it=>{ [it.wName,it.lName].forEach(n=>{ if(n && !seen.has(n)){ seen.add(n); names.push(n);} }); });
        const A = names[0] || selfN || 'A';
        const B = names[1] || oppN || 'B';
        const gid = `gjgrp_${d}_${[A,B].sort().join('_')}`.replace(/[^\w\-]/g,'');
        const games = group.slice().reverse().map((it,idx)=>({
          _id: `${gid}_s0_g${idx}`,
          playerA: A,
          playerB: B,
          winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
          map: it.map || ''
        }));
        const sa = games.filter(x=>x.winner==='A').length;
        const sb = games.filter(x=>x.winner==='B').length;
        const mm = {_id: gid, d, a: A, b: B, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
        const ca = (typeof gc==='function' ? (gc(A)||'#3b82f6') : '#3b82f6');
        const cb = (typeof gc==='function' ? (gc(B)||'#ef4444') : '#ef4444');
        const key = 'mid:'+gid;
        _regDet(key, mm, 'gj', A, B, ca, cb, sa>sb, sb>sa);
        openHistDetailModal(key);
        return true;
      }
    }

    if(mid){
      const ok = window._openMatchDetailByMatchId(mid, lbl, true);
      if(ok) return true;
    }

    // 인덱스 signature 기반 탐색 (날짜+선수쌍+맵)
    {
      const idx = _getMatchIndex();
      const pair = [selfN, oppN].sort().join('||');
      const mKey = (m && m !== '-') ? m : '';
      const sig = [d, pair, mKey].join('|');
      const cands = (idx.sigMap.get(sig) || []).concat(idx.sigMap.get([d,pair,''].join('|')) || []);
      if(cands && cands.length){
        // 가장 먼저 들어온 후보를 id로 다시 열기 (세트 경기면 match._id, game이면 game._id)
        const c = cands[0];
        if(c.refType==='game' && c.parent && c.parent._id){
          return window._openMatchDetailByMatchId(c.parent._id, lbl, false);
        }
        if(c.refType==='obj' && c.obj && (c.obj._id || c.obj.id)){
          return window._openMatchDetailByMatchId(c.obj._id || c.obj.id, lbl, false);
        }
      }
    }

    // fallback: 날짜+선수쌍(+맵)으로 game 포함 여부 검색
    const mapOk = (gMap) => {
      if(!m || m==='-') return true;
      return String(gMap||'').trim() === m;
    };
    const playersOk = (a,b) => {
      const A=String(a||'').trim(), B=String(b||'').trim();
      return (A===selfN && B===oppN) || (A===oppN && B===selfN);
    };
    const dateOk = (xDate) => !d || String(xDate||'').trim() === d;

    // 개인전/끝장전 단일 게임
    if((lbl==='개인전') && typeof indM!=='undefined'){
      const g=(indM||[]).find(x=>x && dateOk(x.d) && playersOk(x.wName,x.lName) && mapOk(x.map));
      if(g) return window._openMatchDetailByMatchId(g._id||'', lbl, false);
    }
    if((lbl==='끝장전' || lbl==='프로리그끝장전') && typeof gjM!=='undefined'){
      const g=(gjM||[]).find(x=>x && dateOk(x.d) && playersOk(x.wName,x.lName) && mapOk(x.map));
      if(g) return window._openMatchDetailByMatchId(g._id||g.sid||'', lbl, false);
    }

    // 프로리그 대회 끝장전 세션
    if((lbl==='프로리그대회끝장전' || lbl==='프로리그 대회 끝장전') && typeof proTourneys!=='undefined'){
      for(const tn of (proTourneys||[])){
        const sess=(tn?.gjMatches||[]).find(s=>s && dateOk(s.d) && playersOk(s.a,s.b));
        if(sess) return window._openMatchDetailByMatchId(sess._id||'', '프로리그대회끝장전', false);
      }
    }

    // 세트 경기들: 특정 모드 풀 우선, 없으면 전체 풀
    const pools=[];
    const push=(arr,modeKey)=>{ if(arr && Array.isArray(arr)) pools.push({arr,modeKey}); };
    if(lbl==='미니대전' || lbl==='시빌워') push(typeof miniM!=='undefined'?miniM:[], 'mini');
    if(lbl==='대학대전') push(typeof univM!=='undefined'?univM:[], 'univm');
    if(lbl==='대학CK') push(typeof ckM!=='undefined'?ckM:[], 'ck');
    if(lbl==='프로리그') push(typeof proM!=='undefined'?proM:[], 'pro');
    if(lbl==='티어대회' || lbl==='티어대회 토너먼트') push(typeof ttM!=='undefined'?ttM:[], 'tt');
    if(lbl==='조별리그' || lbl==='대회' || lbl==='토너먼트') push(typeof comps!=='undefined'?comps:[], 'comp');
    // fallback
    push(typeof miniM!=='undefined'?miniM:[], 'mini');
    push(typeof univM!=='undefined'?univM:[], 'univm');
    push(typeof ckM!=='undefined'?ckM:[], 'ck');
    push(typeof proM!=='undefined'?proM:[], 'pro');
    push(typeof ttM!=='undefined'?ttM:[], 'tt');
    push(typeof comps!=='undefined'?comps:[], 'comp');

    for(const p of pools){
      for(const mm of (p.arr||[])){
        if(!mm || !dateOk(mm.d)) continue;
        const sets = mm.sets || [];
        for(const set of sets){
          const games = set.games || [];
          for(const g of games){
            if(!g) continue;
            if(playersOk(g.playerA,g.playerB) && mapOk(g.map)){
              return window._openMatchDetailByMatchId(mm._id||mm.id||'', lbl, false);
            }
          }
        }
      }
    }

    // 마지막 폴백: 원본 history 한 줄 정보로라도 상세 팝업을 띄움
    // (일부 데이터는 match 배열(gjM/indM/comps/ttM 등)에 없고 history만 존재)
    const wName = (res==='승') ? selfN : (res==='패') ? oppN : selfN;
    const lName = (res==='승') ? oppN  : (res==='패') ? selfN : oppN;
    const key = 'hist:'+ [d, lbl, wName, lName, m].join('|');
    const isGJ = (lbl.indexOf('끝장전') !== -1);
    const modeKey = isGJ ? 'gj' : 'ind';
    const memo = '⚠️ 원본 경기(세트/대회) 데이터를 찾지 못해 history 기반 단일 경기로 표시합니다.';
    const mm = {_id:key, d, wName, lName, map: m||'', memo};
    _regDet(key, mm, modeKey, 'WIN', 'LOSE', '#3b82f6', '#ef4444', true, false);
    openHistDetailModal(key);
    return true;
  }catch(e){
    alert('경기 상세를 여는 중 오류가 발생했습니다.');
    try{ console.error(e); }catch(_){}
    return false;
  }
};

function buildDetailHTML(m, mode, labelA, labelB, ca, cb, aWin, bWin){
  const _resolvePlayerCol = (name, fallback) => {
    try{
      const p = (players||[]).find(x=>x && x.name===name);
      return (p && gc(p.univ)) || fallback || '#64748b';
    }catch(e){
      return fallback || '#64748b';
    }
  };
  ca = _resolvePlayerCol(labelA, ca);
  cb = _resolvePlayerCol(labelB, cb);
  // ind/gj: (단일 경기) sets 없이 wName/lName/map 구조
  // 단, 끝장전(BO 시리즈)처럼 sets가 존재하는 경우는 아래 세트 렌더링을 사용한다.
  if((mode==='ind'||mode==='gj') && (!m.sets || !m.sets.length)){
    const pW=players.find(p=>p.name===m.wName), pL=players.find(p=>p.name===m.lName);
    const wc=(pW&&gc(pW.univ))||ca;
    const lc=(pL&&gc(pL.univ))||cb;
    const rW=pW?`<span class="rbadge r${pW.race}" style="font-size:10px">${pW.race}</span>`:'';
    const rL=pL?`<span class="rbadge r${pL.race}" style="font-size:10px">${pL.race}</span>`:'';
    const uW=pW?.univ?`<span class="ubadge" style="background:${wc};font-size:10px">${pW.univ}</span>`:'';
    const uL=pL?.univ?`<span class="ubadge" style="background:${lc};font-size:10px;opacity:.92">${pL.univ}</span>`:'';
    const mapStr=m.map?`<span style="font-size:11px;color:var(--text3);white-space:nowrap">${m.map}</span>`:'';
    const memoStr=m.memo?`<div style="font-size:11px;color:var(--gray-l);margin-top:4px">📝 ${m.memo}</div>`:'';
    return `<div class="cmd-single-summary">
      <div class="cmd-single-summary__row">
        <span class="cmd-pill-win" style="background:${wc};color:#fff">WIN</span>
        <span class="cmd-single-name">${m.wName||''}</span>${rW}${uW}
        <span class="cmd-single-vs">vs</span>
        <span class="cmd-single-name cmd-single-name--lose">${m.lName||''}</span>${rL}${uL}
        ${mapStr}
      </div>
      ${memoStr?`<div class="cmd-single-summary__memo">${memoStr}</div>`:''}
    </div>`;
  }
  if(!m.sets||!m.sets.length) return '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">세트 상세 기록 없음</div>';
  let h='';
  m.sets.forEach((set,si)=>{
    const isAce=(si===m.sets.length-1&&m.sets.length>=3);
    const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
    const swA=set.scoreA||0, swB=set.scoreB||0;
    const setAWin=swA>swB, setBWin=swB>swA;
    h+=`<div class="set-row">
      <div class="cmd-set-head" style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding:5px 10px;background:${isAce?'#f5f3ff':'var(--blue-l)'};border-radius:7px;border:1px solid ${isAce?'#ddd6fe':'var(--blue-ll)'}">
        <span class="set-row-title ${isAce?'ace-t':''}" style="margin-bottom:0;font-size:12px">${sLabel}</span>
        <span class="ubadge${setAWin?'':' loser'}" style="background:${setAWin?ca:`linear-gradient(135deg, ${typeof getMatchWinTint==='function'?getMatchWinTint(ca):ca+'18'}, rgba(255,255,255,.92))`};color:${setAWin?'#fff':'#334155'};border-color:${setAWin?ca:ca+'33'};font-size:10px">${labelA}</span>
        <span style="font-weight:800;font-size:14px">
          <span class="${setAWin?'wt':setBWin?'lt':'pt-z'}">${swA}</span>
          <span style="color:var(--border2)"> : </span>
          <span class="${setBWin?'wt':setAWin?'lt':'pt-z'}">${swB}</span>
        </span>
        <span class="ubadge${setBWin?'':' loser'}" style="background:${setBWin?cb:`linear-gradient(135deg, ${typeof getMatchWinTint==='function'?getMatchWinTint(cb):cb+'18'}, rgba(255,255,255,.92))`};color:${setBWin?'#fff':'#334155'};border-color:${setBWin?cb:cb+'33'};font-size:10px">${labelB}</span>
        ${setAWin?`<span style="font-size:10px;font-weight:700;color:${ca}">▶ ${labelA} 승</span>`:setBWin?`<span style="font-size:10px;font-weight:700;color:${cb}">▶ ${labelB} 승</span>`:''}
      </div>`;
    if(set.games&&set.games.length){
      set.games.forEach((g,gi)=>{
        if(!g.playerA&&!g.playerB)return;
        const pA=players.find(p=>p.name===g.playerA);
        const pB=players.find(p=>p.name===g.playerB);
        const pca=(pA&&gc(pA.univ))||ca;
        const pcb=(pB&&gc(pB.univ))||cb;
        const aIsWinner=(g.winner==='A');
        const bIsWinner=(g.winner==='B');
        const hasWinner=!!(g.winner);
        const winBgA=(typeof getMatchWinTint==='function'?getMatchWinTint(pca):(pca+'22'));
        const winBgB=(typeof getMatchWinTint==='function'?getMatchWinTint(pcb):(pcb+'22'));
        const winBorderA=pca+'88'; const winBorderB=pcb+'88';
        const _pASafe=(g.playerA||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        const _pBSafe=(g.playerB||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        // (설정) 경기 결과 팝업( histDetModal )에서 스트리머 클릭 시 팝업 닫기 여부
        const clickA=g.playerA?`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } })();setTimeout(()=>openPlayerModal('${_pASafe}'),80)" data-player-link="1"`:''
        const clickB=g.playerB?`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } })();setTimeout(()=>openPlayerModal('${_pBSafe}'),80)" data-player-link="1"`:''
        const _teamColorMode = ['mini','univm','ck','pro','tt','comp','procomp','procomptn'].includes(String(mode||''));
        const sideBaseA = _teamColorMode ? ca : pca;
        const sideBaseB = _teamColorMode ? cb : pcb;
        const raceA=pA?`<span class="rbadge cmd-race-badge r${pA.race}" style="font-size:10px;flex-shrink:0">${pA.race}</span>`:'';
        const raceB=pB?`<span class="rbadge cmd-race-badge r${pB.race}" style="font-size:10px;flex-shrink:0">${pB.race}</span>`:'';
        const univLogoA='';
        const univLogoB='';
        // 경기 상세 카드(경기 기록 네모) 프로필 이미지: 1배(조금 더 크게)
        const photoA=pA?getPlayerPhotoHTML(pA.name,'40px','flex-shrink:0;border:2px solid '+sideBaseA+';box-shadow:0 1px 6px '+sideBaseA+'44'):'';
        const photoB=pB?getPlayerPhotoHTML(pB.name,'40px','flex-shrink:0;border:2px solid '+sideBaseB+';box-shadow:0 1px 6px '+sideBaseB+'44'):'';
        const editBtn=isLoggedIn&&m._editRef?`<button class="btn btn-o btn-xs no-export cmd-edit-btn" style="margin-left:4px;flex-shrink:0" onclick="openGameEditModal('${m._editRef}',${si},${gi})">✏️</button>`:'';

        {
          // (대회 상세 팝업) 더 컴팩트/세련된 한 줄 카드 UI
          const winA = aIsWinner&&hasWinner;
          const winB = bIsWinner&&hasWinner;
          const _ct = t => t ? t.replace(/티어$/,'') : '';
          const _tierBadge = (tier) => tier ? `<span class="cmd-tier-badge" style="background:${getTierBtnColor(tier)||'#64748b'};color:${getTierBtnTextColor(tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;flex-shrink:0"><span class="tier-pc">${tier}</span><span class="tier-mob">${_ct(tier)}</span></span>` : '';
          const tierA = _tierBadge(pA?.tier);
          const tierB = _tierBadge(pB?.tier);
          const winMark = col => `<span class="cmd-win" style="--cmd-col:${col}">WIN</span>`;

          // 팝업(대회탭/기록탭)에서는 동일한 '세련된' 경기 카드 UI 사용
          if((window.__detailCtx||'')==='compModal' || (window.__detailCtx||'')==='histModal'){
            const sideColA = sideBaseA;
            const sideColB = sideBaseB;
            const loseA = hasWinner && !winA;
            const loseB = hasWinner && !winB;
            const pAHtml = photoA ? `<span class="cmd-photo ${loseA?'is-lose':''}">${photoA}</span>` : '';
            const pBHtml = photoB ? `<span class="cmd-photo ${loseB?'is-lose':''}">${photoB}</span>` : '';
            const loseBgA = `linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))`;
            const loseBgB = `linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))`;
            const loseBdA = 'rgba(203,213,225,.85)';
            const loseBdB = 'rgba(203,213,225,.85)';
            h+=`<div class="cmd-game">
              <div class="cmd-game-row">
                <div class="cmd-player ${winA?'is-win':''} ${loseA?'is-lose':''}" style="--cmd-col:${sideColA};background:${winA?(typeof getMatchWinTint==='function'?getMatchWinTint(sideColA):(sideColA+'22')):(loseA?loseBgA:(sideColA+'12'))};border-color:${winA?(sideColA+'55'):(loseA?loseBdA:(sideColA+'33'))};">
                  <div class="cmd-player-meta">
                    <div class="cmd-player-name" ${clickA} style="display:flex;align-items:center;justify-content:center;gap:8px;text-align:center"><span class="cmd-player-inline" style="display:inline-flex;align-items:center;gap:4px;justify-content:center">${univLogoA}${tierA}${raceA}</span><span class="cmd-player-name__txt">${g.playerA||'?'}</span></div>
                  </div>
                  ${winA?`${winMark(sideColA)}${pAHtml}`:pAHtml}
                </div>
                <div class="cmd-midbox">
                  <div class="cmd-gno">경기 ${gi+1}</div>
                  ${g.map?`<div class="cmd-gmap">${g.map}</div>`:''}
                </div>
                <div class="cmd-player ${winB?'is-win':''} ${loseB?'is-lose':''} is-right" style="--cmd-col:${sideColB};background:${winB?(typeof getMatchWinTint==='function'?getMatchWinTint(sideColB):(sideColB+'22')):(loseB?loseBgB:(sideColB+'12'))};border-color:${winB?(sideColB+'55'):(loseB?loseBdB:(sideColB+'33'))};">
                  ${winB?`${pBHtml}${winMark(sideColB)}`:pBHtml}
                  <div class="cmd-player-meta">
                    <div class="cmd-player-name" ${clickB} style="display:flex;align-items:center;justify-content:center;gap:8px;text-align:center"><span class="cmd-player-inline" style="display:inline-flex;align-items:center;gap:4px;justify-content:center">${univLogoB}${tierB}${raceB}</span><span class="cmd-player-name__txt">${g.playerB||'?'}</span></div>
                  </div>
                </div>
                ${editBtn}
              </div>
            </div>`;
          } else {
            // ── [WIN] [소속 종족 이름] [사진] vs [사진] [이름 종족 소속] [WIN] ──
            // (요청사항) 경기 상세 창에서 패자 영역이 '반투명'처럼 보이지 않도록
            // 패자 스타일에 opacity를 적용하지 않는다. (승자만 강조)
            const loserStyleA = '';
            const loserStyleB = '';
            const winBadge = col => `<span style="background:${col};color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;flex-shrink:0">WIN</span>`;
            const mapDot = g.map ? `<span style="font-size:10px;color:var(--text3);white-space:nowrap;flex-shrink:0">${g.map}</span>` : '';
            // (요청사항) 패자 프로필 사진 흐리게
            const loseA = hasWinner && !winA;
            const loseB = hasWinner && !winB;
            const photoAHtml = photoA ? `<span class="cmd-photo ${loseA?'is-lose':''}">${photoA}</span>` : '';
            const photoBHtml = photoB ? `<span class="cmd-photo ${loseB?'is-lose':''}">${photoB}</span>` : '';
            const nameStyleA = loseA ? 'opacity:.7;color:#64748b;' : 'opacity:1;';
            const nameStyleB = loseB ? 'opacity:.7;color:#64748b;' : 'opacity:1;';
            h+=`<div style="display:flex;flex-direction:column;gap:3px;padding:5px 2px;">
              <div style="display:flex;align-items:center;gap:5px;">
                <span style="color:var(--gray-l);font-size:11px;min-width:40px;font-weight:700;flex-shrink:0;text-align:center">경기${gi+1}</span>
                <!-- 좌측 선수: [WIN] [티어 종족 이름] [사진] -->
                <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winA?pca+'18':(loseA?'linear-gradient(180deg, rgba(148,163,184,.14), rgba(255,255,255,.96))':pca+'12')};border:${winA?'1.5px solid '+pca+'55':(loseA?'1px solid rgba(148,163,184,.26)':'1px solid '+pca+'33')};min-width:0;${loserStyleA}">
                  ${winA ? winBadge(pca) : ''}
                  <div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;overflow:hidden">
                    ${univLogoA}${tierA}${raceA}
                    <strong style="font-size:13px;color:var(--text);white-space:nowrap;${nameStyleA}" ${clickA}>${g.playerA||'?'}</strong>
                  </div>
                  ${photoAHtml}
                </div>
                <span style="color:var(--gray-l);font-size:12px;font-weight:800;flex-shrink:0">vs</span>
                <!-- 우측 선수: [사진] [이름 종족 티어] [WIN] -->
                <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winB?pcb+'18':(loseB?'linear-gradient(180deg, rgba(148,163,184,.14), rgba(255,255,255,.96))':pcb+'12')};border:${winB?'1.5px solid '+pcb+'55':(loseB?'1px solid rgba(148,163,184,.26)':'1px solid '+pcb+'33')};min-width:0;${loserStyleB}">
                  ${photoBHtml}
                  <div style="flex:1;min-width:0;display:flex;align-items:center;gap:4px;overflow:hidden">
                    ${univLogoB}${tierB}${raceB}
                    <strong style="font-size:13px;color:var(--text);white-space:nowrap;${nameStyleB}" ${clickB}>${g.playerB||'?'}</strong>
                  </div>
                  ${winB ? winBadge(pcb) : ''}
                </div>
                ${editBtn}
              </div>
              ${mapDot ? `<div style="padding-left:48px;font-size:10px;color:var(--text3)">${mapDot}</div>` : ''}
            </div>`;
          }
        }
      });
    } else {
      h+=`<div style="font-size:11px;color:var(--gray-l);padding:4px 0">상세 경기 기록 없음</div>`;
    }
    h+=`</div>`;
  });
  h+=`</div>`;
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 선수별 검색 탭
══════════════════════════════════════ */
function _histPSearchResultsHTML(q){
  const modeBadgeColors={'조별리그':'#2563eb','대회':'#b45309','미니대전':'#2563eb','시빌워':'#db2777','대학대전':'#7c3aed','대학CK':'#dc2626','프로리그':'#0891b2','티어대회':'#f59e0b','끝장전':'#8b5cf6','개인전':'#8b5cf6','개인':'#8b5cf6'};
  if(!q){
    return`<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">스트리머 이름을 입력하세요</div><div class="empty-state-desc">선수의 최근 기록(p.history)에서 검색합니다</div></div>`;
  }
  const ql=q.toLowerCase();
  const matched=players.filter(p=>p.name.toLowerCase().includes(ql));
  if(!matched.length){
    return`<div class="empty-state"><div class="empty-state-icon">😅</div><div class="empty-state-title">스트리머를 찾을 수 없습니다</div><div class="empty-state-desc">"${q}"와 일치하는 스트리머가 없습니다</div></div>`;
  }
  let h='';
  matched.forEach(p=>{
    const hist=(p.history||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
    // 날짜 필터 적용
    const filteredHist=typeof passDateFilter==='function'?hist.filter(h=>passDateFilter(h.date||'')):hist;
    if(!filteredHist.length)return;
    const col=gc(p.univ)||'#6b7280';
    const wins=filteredHist.filter(hh=>hh.result==='승').length;
    const losses=filteredHist.length-wins;
    const wr=filteredHist.length?Math.round(wins/filteredHist.length*100):0;
    h+=`<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px">
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">
        <span style="width:10px;height:10px;border-radius:50%;background:${col};display:inline-block;flex-shrink:0"></span>
        <span style="font-weight:800;font-size:15px;color:var(--text)">${p.name}</span>
        <span style="font-size:12px;color:var(--gray-l)">${p.univ||''}</span>
        <span style="margin-left:auto;font-size:12px;font-weight:700;color:var(--text3)">${filteredHist.length}게임</span>
        <span style="font-size:12px;font-weight:700;color:#16a34a">${wins}승</span>
        <span style="font-size:12px;font-weight:700;color:#dc2626">${losses}패</span>
        <span style="font-size:12px;padding:2px 8px;border-radius:20px;background:${wr>=50?'#dcfce7':'#fee2e2'};color:${wr>=50?'#16a34a':'#dc2626'};font-weight:800">${wr}%</span>
      </div>
      <div style="overflow-x:auto">
        <table style="margin:0;border:none;border-radius:0;font-size:12px"><thead><tr>
          <th style="white-space:nowrap">날짜</th><th>종류</th><th>결과</th><th>상대</th><th>종족</th><th>맵</th><th>ELO</th>
        </tr></thead><tbody>`;
    filteredHist.forEach(hh=>{
      const isWin=hh.result==='승';
      const mc=modeBadgeColors[hh.mode||'']||'#6b7280';
      const oppP=players.find(x=>x.name===hh.opp);const oppCol=oppP?gc(oppP.univ):'#6b7280';
      const eloStr=hh.eloDelta!=null?`<span style="font-weight:700;font-size:11px;color:${hh.eloDelta>0?'#16a34a':'#dc2626'}">${hh.eloDelta>0?'+':''}${hh.eloDelta}</span>`:'-';
      h+=`<tr style="background:${isWin?'#f0fdf4':'#fef2f2'}10">
        <td style="color:var(--text3);font-size:12px;font-weight:600;white-space:nowrap">${hh.date||''}</td>
        <td><span style="background:${mc};color:#fff;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap">${hh.mode||''}</span></td>
        <td>${isWin?`<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">WIN</span>`:`<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">LOSE</span>`}</td>
        <td style="cursor:pointer;font-weight:700" onclick="openPlayerModal('${(hh.opp||'').replace(/'/g,"\\'")}')"><span style="display:inline-flex;align-items:center;gap:3px"><span style="width:10px;height:10px;border-radius:3px;background:${oppCol};display:inline-block;flex-shrink:0"></span><span style="color:var(--blue)">${hh.opp||''}</span></span></td>
        <td><span class="rbadge r${hh.oppRace}" style="font-size:10px">${hh.oppRace||''}</span></td>
        <td style="color:var(--gray-l);font-size:11px">${hh.map&&hh.map!=='-'?hh.map:''}</td>
        <td>${eloStr}</td>
      </tr>`;
    });
    h+=`</tbody></table></div></div>`;
  });
  return h||`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">경기 기록이 없습니다</div></div>`;
}

function _psearchUpdate(val){
  window._histPSearchQ=val;
  const r=document.getElementById('hist-psearch-results');
  if(r) r.innerHTML=_histPSearchResultsHTML(val.trim());
}

/* ══════════════════════════════════════
   대학 전력 비교
══════════════════════════════════════ */
var _univCompA = '', _univCompB = '';

function histUnivCompHTML(){
  const allU = getAllUnivs().filter(u=>!u.hidden||isLoggedIn).filter(u=>u.name!=='무소속');
  // 처음 진입 시 자동으로 첫 두 대학 선택
  if(!_univCompA && allU.length>=1) _univCompA = allU[0].name;
  if(!_univCompB && allU.length>=2) _univCompB = allU[1].name;
  const uOpts = name => `<option value="">— 대학 선택 —</option>`
    + allU.map(u=>`<option value="${u.name}"${u.name===name?' selected':''}>${u.name}</option>`).join('');

  // 선택된 대학 비교 카드
  function univStats(univName){
    if(!univName) return null;
    const col = gc(univName);
    const members = players.filter(p=>p.univ===univName&&!p.retired);
    const activeM = members.filter(p=>(p.win+p.loss)>0);
    const avgElo = activeM.length ? Math.round(activeM.reduce((s,p)=>s+(p.elo||ELO_DEFAULT),0)/activeM.length) : ELO_DEFAULT;
    const totalW = members.reduce((s,p)=>s+(p.win||0),0);
    const totalL = members.reduce((s,p)=>s+(p.loss||0),0);
    const wr = (totalW+totalL) ? Math.round(totalW/(totalW+totalL)*100) : 0;
    const ace = [...members].sort((a,b)=>(b.points||0)-(a.points||0))[0];
    // 전체 팀전 전적 (미니/대학대전/CK/프로)
    const _allTeamArrs = [
      {arr:miniM, label:'미니'},
      {arr:univM, label:'대학대전'},
      {arr:ckM,   label:'CK', isCK:true},
      {arr:proM,  label:'프로', isCK:true},
    ];
    let mW=0,mL=0;
    _allTeamArrs.forEach(({arr,isCK})=>{
      (arr||[]).forEach(m=>{
        if(m.sa==null||m.sb==null) return;
        const myA = isCK
          ? (m.teamAMembers||[]).some(x=>x.univ===univName)
          : m.a===univName;
        const myB = isCK
          ? (m.teamBMembers||[]).some(x=>x.univ===univName)
          : m.b===univName;
        if(myA&&m.sa>m.sb) mW++;
        else if(myB&&m.sb>m.sa) mW++;
        else if(myA&&m.sa<m.sb) mL++;
        else if(myB&&m.sb<m.sa) mL++;
      });
    });
    // 직접 대결 (전체 팀전)
    let vsW=0,vsL=0;
    if(_univCompA&&_univCompB){
      const opp=univName===_univCompA?_univCompB:_univCompA;
      _allTeamArrs.forEach(({arr,isCK})=>{
        (arr||[]).filter(m=>m.sa!=null).forEach(m=>{
          const myA=isCK?(m.teamAMembers||[]).some(x=>x.univ===univName):m.a===univName;
          const myB=isCK?(m.teamBMembers||[]).some(x=>x.univ===univName):m.b===univName;
          const oppA=isCK?(m.teamAMembers||[]).some(x=>x.univ===opp):m.a===opp;
          const oppB=isCK?(m.teamBMembers||[]).some(x=>x.univ===opp):m.b===opp;
          const hasOpp=oppA||oppB;
          if(!hasOpp) return;
          const myWin=(myA&&m.sa>m.sb)||(myB&&m.sb>m.sa);
          const myLoss=(myA&&m.sa<m.sb)||(myB&&m.sb<m.sa);
          if(myWin)vsW++; else if(myLoss)vsL++;
        });
      });
    }
    return {col,members,activeM,avgElo,totalW,totalL,wr,ace,mW,mL,vsW,vsL};
  }

  const sA = univStats(_univCompA);
  const sB = univStats(_univCompB);

  function statRow(label,va,vb,higherBetter=true){
    const na=parseFloat(va),nb=parseFloat(vb);
    const aWins=!isNaN(na)&&!isNaN(nb)&&(higherBetter?na>nb:na<nb);
    const bWins=!isNaN(na)&&!isNaN(nb)&&(higherBetter?nb>na:nb<na);
    const ca=sA?sA.col:'#2563eb', cb=sB?sB.col:'#dc2626';
    return `<tr>
      <td style="text-align:right;padding:6px 10px;font-weight:${aWins?800:600};color:${aWins?ca:'var(--text)'}">${va}${aWins?` <span style="color:${ca}">◀</span>`:''}</td>
      <td style="text-align:center;padding:6px 8px;color:var(--gray-l);font-size:11px;white-space:nowrap">${label}</td>
      <td style="text-align:left;padding:6px 10px;font-weight:${bWins?800:600};color:${bWins?cb:'var(--text)'}">${bWins?`<span style="color:${cb}">▶</span> `:''}${vb}</td>
    </tr>`;
  }

  return `<div>
    <!-- 선택 UI -->
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px">
      <select onchange="_univCompA=this.value;render()" style="flex:1;min-width:120px;padding:7px 10px;border-radius:8px;border:1.5px solid ${sA?sA.col+'99':'var(--border2)'};font-size:13px;font-weight:700;background:var(--white)">
        ${uOpts(_univCompA)}
      </select>
      <span style="font-weight:900;font-size:16px;color:var(--gray-l)">VS</span>
      <select onchange="_univCompB=this.value;render()" style="flex:1;min-width:120px;padding:7px 10px;border-radius:8px;border:1.5px solid ${sB?sB.col+'99':'var(--border2)'};font-size:13px;font-weight:700;background:var(--white)">
        ${uOpts(_univCompB)}
      </select>
    </div>

    ${(!sA||!sB)?`<div style="text-align:center;padding:40px;color:var(--gray-l)">두 대학을 선택하면 전력을 비교합니다</div>`:`
    <!-- 비교 카드 -->
    <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <!-- A 대학 -->
      <div style="flex:1;min-width:130px;background:${sA.col}18;border:2px solid ${sA.col}44;border-radius:12px;padding:14px;text-align:center">
        <div style="font-weight:900;font-size:16px;color:${sA.col};margin-bottom:4px">${_univCompA}</div>
        <div style="font-size:11px;color:var(--gray-l)">${sA.members.length}명</div>
        ${sA.vsW>sA.vsL?`<div style="margin-top:6px;font-size:10px;font-weight:800;color:${sA.col}">🏆 직접 대결 우세</div>`:''}
      </div>
      <!-- 스코어 -->
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:80px">
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">직접 대결</div>
        <div style="font-size:28px;font-weight:900">
          <span style="color:${sA.vsW>sA.vsL?sA.col:'var(--text3)'}">${sA.vsW}</span>
          <span style="color:var(--gray-l);font-size:18px">:</span>
          <span style="color:${sB.vsW>sB.vsL?sB.col:'var(--text3)'}">${sB.vsW}</span>
        </div>
        <div style="font-size:10px;color:var(--gray-l)">팀전 전체 기준</div>
      </div>
      <!-- B 대학 -->
      <div style="flex:1;min-width:130px;background:${sB.col}18;border:2px solid ${sB.col}44;border-radius:12px;padding:14px;text-align:center">
        <div style="font-weight:900;font-size:16px;color:${sB.col};margin-bottom:4px">${_univCompB}</div>
        <div style="font-size:11px;color:var(--gray-l)">${sB.members.length}명</div>
        ${sB.vsW>sB.vsL?`<div style="margin-top:6px;font-size:10px;font-weight:800;color:${sB.col}">🏆 직접 대결 우세</div>`:''}
      </div>
    </div>

    <!-- 스탯 비교 테이블 -->
    <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:14px">
      <table style="margin:0;border:none;border-radius:0;table-layout:fixed">
        <thead><tr>
          <th style="text-align:right;color:${sA.col};width:40%">${_univCompA}</th>
          <th style="text-align:center;color:var(--gray-l);width:20%">항목</th>
          <th style="text-align:left;color:${sB.col};width:40%">${_univCompB}</th>
        </tr></thead>
        <tbody>
          ${statRow('평균 ELO', sA.avgElo, sB.avgElo)}
          ${statRow('전체 승률', sA.wr+'%', sB.wr+'%')}
          ${statRow('전체 승', sA.totalW, sB.totalW)}
          ${statRow('전체 패', sA.totalL, sB.totalL, false)}
          ${statRow('팀전 승(전체)', sA.mW, sB.mW)}
          ${statRow('팀전 패(전체)', sA.mL, sB.mL, false)}
          ${statRow('선수 수', sA.members.length, sB.members.length)}
          <tr>
            <td style="text-align:right;padding:6px 10px;cursor:pointer;color:${sA.col};font-weight:700" onclick="cm('univModal');setTimeout(()=>openPlayerModal('${(sA.ace?.name||'').replace(/'/g,"\'")}'),80)">${sA.ace?.name||'-'}</td>
            <td style="text-align:center;padding:6px 8px;color:var(--gray-l);font-size:11px">에이스</td>
            <td style="text-align:left;padding:6px 10px;cursor:pointer;color:${sB.col};font-weight:700" onclick="cm('univModal');setTimeout(()=>openPlayerModal('${(sB.ace?.name||'').replace(/'/g,"\'")}'),80)">${sB.ace?.name||'-'}</td>
          </tr>
        </tbody>
      </table>
    </div>`}
  </div>`;
}

function histPlayerSearchHTML(){
  const q=(window._histPSearchQ||'').trim();
  return`<div style="margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input type="text" id="hist-psearch-input" placeholder="🔍 스트리머 이름 입력..." value="${q.replace(/"/g,'&quot;')}"
        oninput="_psearchUpdate(this.value)"
        style="flex:1;min-width:160px;max-width:280px;padding:7px 12px;border:1.5px solid var(--blue);border-radius:8px;font-size:13px;font-weight:600;outline:none" autofocus>
      ${q?`<button onclick="window._histPSearchQ='';document.getElementById('hist-psearch-input').value='';document.getElementById('hist-psearch-results').innerHTML=_histPSearchResultsHTML('')" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:18px;line-height:1;padding:0 2px">✕</button>`:''}
    </div>
  </div>
  <div id="hist-psearch-results">${_histPSearchResultsHTML(q)}</div>`;
}

// tourneys에서 완료된 모든 경기를 flat하게 추출
function getTourneyMatches(){
  const result=[];
  if(!Array.isArray(tourneys))return result;
  (tourneys||[]).forEach(tn=>{
    // 조별리그 경기
    (tn.groups||[]).forEach((grp,gi)=>{
      const gl='ABCDEFGHIJ'[gi]||String(gi);
      const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach((m,mi)=>{
        if(!m.a||!m.b)return;
        if(m.sa==null||m.sb==null)return;
        result.push({
          _src:'tour',_tnId:tn.id,_gi:gi,_mi:mi,
          d:m.d||'',n:tn.name,a:m.a,b:m.b,
          sa:m.sa,sb:m.sb,sets:m.sets||[],
          grpName:grp.name,grpLetter:gl,grpColor:col
        });
      });
    });
    // 브라켓 경기 (matchDetails)
    const br=tn.bracket||{};
    Object.entries(br.matchDetails||{}).forEach(([key,m])=>{
      if(!m||!m.a||!m.b||m.sa==null||m.sb==null)return;
      result.push({
        _src:'tour_bracket',_tnId:tn.id,_bktKey:key,
        d:m.d||'',n:tn.name,a:m.a,b:m.b,
        sa:m.sa,sb:m.sb,sets:m.sets||[],
        grpName:'토너먼트',grpLetter:'T',grpColor:'#2563eb'
      });
    });
    // 브라켓 winner-only 경기 (matchDetails에 a/b 없거나 없는 키)
    Object.entries(br.winners||{}).forEach(([key,winner])=>{
      if(!winner)return;
      const det=(br.matchDetails||{})[key];
      if(det&&det.a&&det.b&&det.sa!=null&&det.sb!=null)return; // 이미 위에서 처리
      const parts=key.split('-');
      const r=parseInt(parts[0]),mi=parseInt(parts[1]);
      const a=(det&&det.a)||((br.slots||{})[`${r}-${mi}-a`])||(r>0?((br.winners||{})[`${r-1}-${mi*2}`]||''):'');
      const b=(det&&det.b)||((br.slots||{})[`${r}-${mi}-b`])||(r>0?((br.winners||{})[`${r-1}-${mi*2+1}`]||''):'');
      if(!a||!b)return;
      result.push({
        _src:'tour_bracket',_tnId:tn.id,_bktKey:key,
        d:(det&&det.d)||'',n:tn.name,a,b,
        sa:winner===a?1:0,sb:winner===b?1:0,sets:[],
        grpName:'토너먼트',grpLetter:'T',grpColor:'#2563eb'
      });
    });
    // 수동 추가 브라켓 경기 (manualMatches)
    (br.manualMatches||[]).forEach((m,idx)=>{
      if(!m||!m.a||!m.b||m.sa==null||m.sb==null)return;
      result.push({
        _src:'tour_manual',_tnId:tn.id,_manualIdx:idx,
        d:m.d||'',n:tn.name,a:m.a,b:m.b,
        sa:m.sa,sb:m.sb,sets:m.sets||[],
        grpName:m.rndLabel||'토너먼트',grpLetter:'T',grpColor:'#7c3aed'
      });
    });
  });
  return result;
}
function compSummaryListHTML(context){
  // tourneys 경기 + comps 배열 모두 합산
  const tourItems=getTourneyMatches();
  const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const allItems=[...tourItems,...compItems];
  if(!allItems.length)return`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  // 날짜 필터 적용 후 정렬
  const filtered=allItems.filter(m=>
    typeof passDateFilter!=='function'||passDateFilter(m.d||'')
  );
  filtered.sort((a,b)=>recSortDir==='asc'
    ?(a.d||'').localeCompare(b.d||'')
    :(b.d||'').localeCompare(a.d||''));
  const sortBar=``;
  if(!filtered.length)return sortBar+`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
  let h=sortBar;
  filtered.forEach((m,listIdx)=>{
    const a=m.a||m.hostUniv||m.u||'';const b=m.b||'';
    const ca=gc(a);const cb=gc(b);
    const aWin=m.sa>m.sb;const bWin=m.sb>m.sa;
    const key=`${context}-comp-${listIdx}`;
    const rIdx=(m._src==='comps')?m._origIdx:-1;
    // GROUP 배지 (tourneys 경기)
    const grpBadge=m._src==='tour'
      ?`<span style="background:${m.grpColor};color:#fff;font-size:10px;font-weight:700;padding:1px 8px;border-radius:4px;margin-left:6px">GROUP ${m.grpLetter}</span>`:'';
    const _pms=_collectMatchParticipantsAny(m);
    const _pmJson=JSON.stringify(_pms).replace(/"/g,"'");
    const _pmCol=(aWin?ca:bWin?cb:(ca||cb||'#64748b'));
    h+=`<div class="rec-summary rec-mode-comp${_recSideFxClass('comp')}" data-rec-mode="comp" style="--rec-mode-col:#3b82f6;--rec-mode-rgb:59,130,246;${_recSideFxStyle('comp',ca,cb)}">
      <div class="rec-sum-header">
        <span style="color:var(--text3);font-size:12px;font-weight:600;min-width:72px">${m.d||''}</span>
        <span style="font-weight:700;font-size:13px">🎖️ ${m.n||'대회'}${grpBadge}</span>
        ${_pms.length?`<button class="btn btn-w btn-xs rc-mem-btn" style="margin-left:8px" onclick="event.stopPropagation();openProMembersPopup('참여자', '${_pmCol}', ${_pmJson})">👥 참여자 ${_pms.length}</button>`:''}
        ${(() => {
          // 대회 탭 멤버 추출 (가능한 모든 포맷 대응)
          let aMembers = m.teamAMembers || [];
          let bMembers = m.teamBMembers || [];
          if (!aMembers.length && !bMembers.length && m.sets) {
            const aSet = new Set(), bSet = new Set();
            m.sets.forEach(s => {
              (s.games || []).forEach(g => {
                if (g.playerA) String(g.playerA).split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>aSet.add(x));
                if (g.playerB) String(g.playerB).split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>bSet.add(x));
                if (g.a1) aSet.add(String(g.a1).trim());
                if (g.a2) aSet.add(String(g.a2).trim());
                if (g.b1) bSet.add(String(g.b1).trim());
                if (g.b2) bSet.add(String(g.b2).trim());
                if (g.winner === 'A' && g.wName) { aSet.add(g.wName); if (g.lName) bSet.add(g.lName); }
                else if (g.winner === 'B' && g.wName) { bSet.add(g.wName); if (g.lName) aSet.add(g.lName); }
              });
            });
            aMembers = Array.from(aSet).map(n => ({ name: n }));
            bMembers = Array.from(bSet).map(n => ({ name: n }));
          }
          // 그래도 비어있으면 공통 유틸로 한 번 더 시도
          if((!aMembers.length && !bMembers.length) && typeof _collectMatchTeamMembersAB === 'function'){
            const ab = _collectMatchTeamMembersAB(m);
            aMembers = ab.a || [];
            bMembers = ab.b || [];
          }
          const aBtnColor = ca || '#3b82f6';
          const bBtnColor = cb || '#ef4444';
          const aMemJson = JSON.stringify(aMembers).replace(/"/g, "'");
          const bMemJson = JSON.stringify(bMembers).replace(/"/g, "'");
          // 맵 정보 추출
          const maps = [];
          (m.sets || []).forEach(s => {
            (s.games || []).forEach(g => { if (g.map && !maps.includes(g.map)) maps.push(g.map); });
          });
          const mapStr = maps.slice(0, 2).join(', ') + (maps.length > 2 ? ` 외 ${maps.length - 2}` : '');
          return `
        <div class="rec-sum-vs" style="flex-wrap:wrap;align-items:center">
          <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
            ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>`:''}
            ${aMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${aBtnColor}15,${aBtnColor}08);border:1.5px solid ${aBtnColor}40;color:${aBtnColor};font-weight:700;box-shadow:0 2px 8px ${aBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${aBtnColor}30,0 2px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px ${aBtnColor}20,0 1px 3px rgba(0,0,0,0.08)'" onclick="event.stopPropagation();openProMembersPopup('${a.replace(/'/g,"\\'")}', '${ca}', ${aMemJson})">
              <span class="mem-ico">👥</span><span>${aMembers.length}명</span>
            </button>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세보기">
              <span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa||0}</span>
              <span style="color:var(--gray-l);font-size:14px">:</span>
              <span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb||0}</span>
            </div>`:''}
            ${mapStr ? `<span style="font-size:10px;color:var(--gray-l);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${maps.join(', ')}">${mapStr}</span>` : ''}
            ${aWin ? `<span style="font-size:11px;color:#16a34a;font-weight:700">${a} 승</span>` : bWin ? `<span style="font-size:11px;color:#16a34a;font-weight:700">${b} 승</span>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
            ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>`:''}
            ${bMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${bBtnColor}15,${bBtnColor}08);border:1.5px solid ${bBtnColor}40;color:${bBtnColor};font-weight:700;box-shadow:0 2px 8px ${bBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${bBtnColor}30,0 2px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px ${bBtnColor}20,0 1px 3px rgba(0,0,0,0.08)'" onclick="event.stopPropagation();openProMembersPopup('${b.replace(/'/g,"\\'")}', '${cb}', ${bMemJson})">
              <span class="mem-ico">👥</span><span>${bMembers.length}명</span>
            </button>` : ''}
          </div>
        </div>`;
        })()}
        <div style="margin-left:auto;display:flex;align-items:center;gap:4px;flex-shrink:0" class="no-export">
          <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
            onclick="openRecActionMenu(event,{
              _btnEl:this,
              a:'${a.replace(/'/g,"\\'")}',
              sa:${m.sa||0},
              b:'${b.replace(/'/g,"\\'")}',
              sb:${m.sb||0},
              d:'${m.d||''}',
              mode:'comp',
              idx:${rIdx>=0?rIdx:'null'},
              key:'${key}',
              canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
              canEdit:${((rIdx>=0 || m._src==='tour') && isLoggedIn && !isSubAdmin)?'true':'false'},
              canDel:${(rIdx>=0 && isLoggedIn && !isSubAdmin)?'true':'false'},
              shareFn:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1'; if(_adm && !isLoggedIn) return 'null'; return `()=>window._openShareMatchObjCard&&window._openShareMatchObjCard(_getCompMatchObj(${listIdx},'${context}'))`;})()},
              editFn:${m._src==='tour' ? `()=>leagueEditMatch('${m._tnId}',${m._gi},${m._mi})` : 'null'},
              canMove:false
            })">⋯</button>
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,rIdx>=0?{...m,_editRef:'comp:'+rIdx}:m,'comp',a,b,ca,cb,aWin,bWin, rIdx)}
      </div>
    </div>`;
  });
  return h||`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
}
// 공유카드용 - context별 캐시된 filtered 배열에서 m 객체 반환 헬퍼
window._compListCache={};
function _getCompMatchObj(listIdx,context){
  // 캐시 없거나 데이터 변경 시 재생성
  if(!window._compListCache||!window._compListCache[context]){
    if(!window._compListCache)window._compListCache={};
    const tourItems=getTourneyMatches();
    const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
    const all=[...tourItems,...compItems].filter(m=>typeof passDateFilter!=='function'||passDateFilter(m.d||''));
    all.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
    window._compListCache[context]=all;
  }
  const m = window._compListCache[context][listIdx]||null;
  if(!m) return null;
  return {...m,_matchType:'comp',compName:m.compName||m.n||'',teamALabel:m.teamALabel||m.a||'',teamBLabel:m.teamBLabel||m.b||''};
}

/* ══════════════════════════════════════
   경기 이동 (탭 간 이동)
══════════════════════════════════════ */
var _movePop=null;
function _showMovePop(btn,opts){
  closeMovePop();
  const pop=document.createElement('div');
  pop.id='_movePop';
  pop.style.cssText='position:fixed;z-index:9999;background:var(--white,#fff);border:1px solid var(--border2,#cbd5e1);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:6px;min-width:180px;font-family:\'Noto Sans KR\',sans-serif';
  const r=btn.getBoundingClientRect();
  pop.style.top=(r.bottom+4)+'px';
  pop.style.right=(window.innerWidth-r.right)+'px';
  let html='';
  opts.forEach((o,i)=>{
    html+=`<button onclick="_movePop_pick(${i})" style="display:block;width:100%;text-align:left;padding:8px 12px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:7px;color:var(--text,#1e293b)" onmouseenter="this.style.background='rgba(37,99,235,.08)'" onmouseleave="this.style.background='none'">${o.l}</button>`;
  });
  html+=`<button onclick="closeMovePop()" style="display:block;width:100%;text-align:left;padding:6px 12px;border:none;background:none;cursor:pointer;font-size:12px;border-radius:7px;color:var(--gray-l,#94a3b8)" onmouseenter="this.style.background='rgba(0,0,0,.04)'" onmouseleave="this.style.background='none'">취소</button>`;
  pop.innerHTML=html;
  document.body.appendChild(pop);
  _movePop=pop;
  window._movePopOpts=opts;
  setTimeout(()=>document.addEventListener('click',_movePopOutside,{once:true}),0);
}
function _movePopOutside(e){ if(_movePop&&!_movePop.contains(e.target)) closeMovePop(); }
function _movePop_pick(i){ const fn=window._movePopOpts&&window._movePopOpts[i]&&window._movePopOpts[i].fn; closeMovePop(); if(fn) fn(); }
function closeMovePop(){ if(_movePop){_movePop.remove();_movePop=null;} document.removeEventListener('click',_movePopOutside); }

// 팀 경기 이동 (mini ↔ univm ↔ civil)
function moveTeamMatch(srcMode, srcIdx, destMode, _batch=false){
  const srcArr=srcMode==='mini'?miniM:univM;
  const m=srcArr[srcIdx];
  if(!m)return;
  const srcType=m.type||'mini'; // 'mini'|'civil' (miniM 전용)
  const oldLabel=srcMode==='univm'?'대학대전':srcType==='civil'?'시빌워':'미니대전';
  const newLabel=destMode==='univm'?'대학대전':destMode==='civil'?'시빌워':'미니대전';
  if(oldLabel===newLabel)return;
  // 배열 이동
  srcArr.splice(srcIdx,1);
  if(destMode==='univm'){
    const {type:_t,...rest}=m; // type 필드 제거
    univM.unshift(rest);
    var moved=rest;
  } else {
    m.type=destMode==='civil'?'civil':'mini';
    miniM.unshift(m);
    var moved=m;
  }
  // player.history mode 레이블 업데이트
  const mid=moved._id;
  players.forEach(p=>(p.history||[]).forEach(h=>{if(h.matchId===mid)h.mode=newLabel;}));
  if(!_batch){if(typeof fixPoints==='function')fixPoints();save();render();}
}

// ── 일괄 선택 이동 ───────────────────────────────────────────
let _bulkModes = {}; // {key:bool} — 'mini'|'civil'|'univm'

function toggleBulkMode(key){
  _bulkModes[key]=!_bulkModes[key];
  render();
}
function bulkToggleAll(key,checked){
  document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`).forEach(cb=>cb.checked=checked);
  _bulkCountUpdate(key);
}
function _bulkCountUpdate(key){
  const n=[...document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]:checked`)].length;
  const el=document.getElementById('bulk-cnt-'+key);
  if(el)el.textContent=n+'개 선택됨';
  const allCbs=document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`);
  const allChk=document.getElementById('bulk-all-'+key);
  if(allChk&&allCbs.length) allChk.indeterminate=n>0&&n<allCbs.length, allChk.checked=n===allCbs.length;
}
function bulkMoveTeam(bulkKey,destMode){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 경기가 없습니다.');return;}
  const indices=cbs.map(cb=>parseInt(cb.dataset.bidx)).sort((a,b)=>b-a);
  if(!confirm(indices.length+'개 경기를 이동하시겠습니까?'))return;
  const srcMode=bulkKey==='univm'?'univm':'mini';
  indices.forEach(idx=>moveTeamMatch(srcMode,idx,destMode,true));
  _bulkModes[bulkKey]=false;
  if(typeof fixPoints==='function')fixPoints();
  save();render();
}
function bulkDeleteRecs(bulkKey){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 경기가 없습니다.');return;}
  const indices=cbs.map(cb=>parseInt(cb.dataset.bidx)).sort((a,b)=>b-a);
  if(!confirm(indices.length+'개 경기를 삭제하시겠습니까?\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.'))return;
  const arr=bulkKey==='univm'?univM:bulkKey==='ck'?ckM:bulkKey==='pro'?proM:bulkKey==='tt'?ttM:miniM;
  const deletedIds=new Set();
  indices.forEach(idx=>{
    const matchObj=arr[idx];
    if(matchObj){
      if(matchObj._id){
        deletedIds.add(matchObj._id);
        // 게임 레벨 ID도 추가 (sets 기반 저장: matchId_sN_gN 포맷)
        (matchObj.sets||[]).forEach((set,si)=>{
          (set.games||[]).forEach((g,gi)=>{
            deletedIds.add(`${matchObj._id}_s${si}_g${gi}`);
          });
        });
      }
      arr.splice(idx,1);
      revertMatchRecord(matchObj);
      // (버그픽스) 티어대회(tt)는 tourneys(조별/브라켓)에도 같은 _id 기록이 남아 있으면
      // 다음 렌더/마이그레이션에서 다시 ttM으로 복구되어 "삭제가 안 된 것처럼" 보일 수 있음.
      if(bulkKey==='tt' && matchObj._id) {
        try{ _removeTierTourneyMatchById(matchObj._id); }catch(e){}
      }
    }
  });
  // 안전 처리: revertMatchRecord가 놓친 history 항목 직접 정리
  if(deletedIds.size>0){
    players.forEach(p=>{
      if(!p.history)return;
      const removed=p.history.filter(h=>h.matchId&&deletedIds.has(h.matchId));
      if(!removed.length)return;
      p.history=p.history.filter(h=>!h.matchId||!deletedIds.has(h.matchId));
      removed.forEach(hr=>{
        if(hr.result==='승'){p.win=Math.max(0,(p.win||0)-1);p.points=(p.points||0)-3;}
        else if(hr.result==='패'){p.loss=Math.max(0,(p.loss||0)-1);p.points=(p.points||0)+3;}
        if(hr.eloDelta!=null)p.elo=(p.elo||1500)-hr.eloDelta;
      });
    });
  }
  _bulkModes[bulkKey]=false;
  if(typeof fixPoints==='function')fixPoints();
  save();render();
}

// (버그픽스) 티어대회 삭제 시 tourneys 내부(조별/브라켓)에 남은 같은 _id 기록도 같이 제거
function _removeTierTourneyMatchById(matchId){
  const id = String(matchId||'').trim();
  if(!id) return 0;
  let removed = 0;
  try{
    (tourneys||[]).filter(t=>t && t.type==='tier').forEach(tn=>{
      // 조별리그 matches
      (tn.groups||[]).forEach(grp=>{
        if(!grp || !Array.isArray(grp.matches)) return;
        const before = grp.matches.length;
        grp.matches = grp.matches.filter(m=>!(m && String(m._id||'')===id));
        removed += (before - grp.matches.length);
      });
      // 브라켓 matchDetails/manualMatches
      const br = tn.bracket || {};
      if(br.matchDetails){
        Object.keys(br.matchDetails).forEach(k=>{
          const m = br.matchDetails[k];
          if(m && String(m._id||'')===id){
            delete br.matchDetails[k];
            removed++;
            try{ if(br.winners) delete br.winners[k]; }catch(e){}
          }
        });
      }
      if(Array.isArray(br.manualMatches)){
        const before = br.manualMatches.length;
        br.manualMatches = br.manualMatches.filter(m=>!(m && String(m._id||'')===id));
        removed += (before - br.manualMatches.length);
      }
    });
  }catch(e){}
  return removed;
}
// ─────────────────────────────────────────────────────────────

// 팀 경기 이동 팝업 열기
function openMoveMatchPop(btn,srcMode,srcIdx){
  const arr=srcMode==='mini'?miniM:univM;
  const m=arr[srcIdx];if(!m)return;
  const srcType=m.type||'mini';
  const opts=[];
  if(srcMode==='mini'&&srcType==='mini'){
    opts.push({l:'⚔️ 시빌워로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'civil')});
    opts.push({l:'🏟️ 대학대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'univm')});
  } else if(srcMode==='mini'&&srcType==='civil'){
    opts.push({l:'⚡ 미니대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'mini')});
    opts.push({l:'🏟️ 대학대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'univm')});
  } else if(srcMode==='univm'){
    opts.push({l:'⚡ 미니대전으로 이동',fn:()=>moveTeamMatch('univm',srcIdx,'mini')});
    opts.push({l:'⚔️ 시빌워로 이동',fn:()=>moveTeamMatch('univm',srcIdx,'civil')});
  }
  _showMovePop(btn,opts);
}

function delRec(mode,i){
  if(!confirm('삭제하시겠습니까?\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.'))return;
  let matchObj=null;
  if(mode==='mini')     { matchObj=miniM[i];  miniM.splice(i,1); }
  else if(mode==='univm'){ matchObj=univM[i];  univM.splice(i,1); }
  else if(mode==='comp') { matchObj=comps[i];  comps.splice(i,1); }
  else if(mode==='ck')   { matchObj=ckM[i];    ckM.splice(i,1);   }
  else if(mode==='pro')  { matchObj=proM[i];   proM.splice(i,1);  }
  else if(mode==='tt')   { matchObj=ttM[i];    ttM.splice(i,1);   }
  if(matchObj) {
    revertMatchRecord(matchObj);
    if(mode==='tt' && matchObj._id) {
      try{ _removeTierTourneyMatchById(matchObj._id); }catch(e){}
    }
  }
  if(typeof fixPoints==='function')fixPoints();
  save();render();
}


function _ensureHistDetailModal(){
  let m=document.getElementById('histDetModal');
  if(m) return m;
  m=document.createElement('div');
  m.id='histDetModal';
  m.className='modal modal--matchdetail no-export';
  // (개선) z-index는 CSS 변수로 통일 (공유카드가 항상 위로 오도록)
  m.style.cssText='z-index:var(--z-modal-4);display:none';
  m.setAttribute('onclick',"document.getElementById('histDetModal').style.display='none'");
  m.innerHTML=`
    <div class="mbox mbox--matchdetail" onclick="event.stopPropagation()">
      <div class="cmd-head">
        <div class="cmd-head__txt">
          <div id="hmdTitle" class="cmd-title">📅 경기 상세</div>
          <div id="hmdSub" class="cmd-sub"></div>
        </div>
        <div class="cmd-head-actions no-export">
          <button id="hmdActCopy" class="cmd-hbtn" title="결과 복사">📤</button>
          <button id="hmdActShare" class="cmd-hbtn" title="공유 카드">🎴</button>
        </div>
        <button class="cmd-close" onclick="document.getElementById('histDetModal').style.display='none'" aria-label="닫기">✕</button>
      </div>
      <div id="hmdScoreBar" class="cmd-scorebar" style="display:none"></div>
      <div id="histDetBody" class="cmd-body"></div>
      <div class="cmd-actions no-export">
        <button class="btn btn-w" onclick="document.getElementById('histDetModal').style.display='none'">닫기</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  return m;
}

function _getMatchDetailTeamHeaderColor(modeKey, side, fallback){
  try{
    const mode = String(modeKey||'').trim();
    const sd = (String(side||'A').toUpperCase()==='B') ? 'b' : 'a';
    if(mode==='ck' || mode==='pro' || mode==='tt'){
      const key = `su_md_team_hdr_${mode}_${sd}`;
      const v = String(localStorage.getItem(key)||'').trim();
      if(/^#[0-9a-fA-F]{6}$/.test(v)) return v;
    }
  }catch(e){}
  return fallback;
}

function _applyOpenHistDetailTeamHeaderColors(){
  try{
    const m=document.getElementById('histDetModal');
    if(!m || m.style.display==='none') return;
    const mode = m.dataset.mode || '';
    const baseA = m.dataset.teamColorA || '#64748b';
    const baseB = m.dataset.teamColorB || '#64748b';
    const ca = _getMatchDetailTeamHeaderColor(mode, 'A', baseA);
    const cb = _getMatchDetailTeamHeaderColor(mode, 'B', baseB);
    const teams = m.querySelectorAll('.cmd-score .cmd-team');
    if(teams[0]) teams[0].style.background = `linear-gradient(135deg,${ca},${ca}cc)`;
    if(teams[1]) teams[1].style.background = `linear-gradient(135deg,${cb},${cb}cc)`;
  }catch(e){}
}

function openHistDetailModal(key){
  const reg=(window._detReg||{})[key];
  if(!reg || !reg.m) return;
  try{
    window._lastHistDetailState = {
      key,
      mode: String(reg.mode||''),
      idx: (reg.idx!==undefined && reg.idx!==null) ? Number(reg.idx) : null
    };
  }catch(e){}
  try{ window.__detailCtx = 'histModal'; }catch(_){}
  const m=_ensureHistDetailModal();
  const titleEl=document.getElementById('hmdTitle');
  const subEl=document.getElementById('hmdSub');
  const bar=document.getElementById('hmdScoreBar');
  const bodyEl=document.getElementById('histDetBody');
  const match=reg.m;
  const idx = (reg.idx!==undefined && reg.idx!==null) ? reg.idx : null;
  const modeKey = reg.mode || '';
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
  const _resolveOriginalShareSource = ()=> typeof window._resolveHistoryShareSource==='function'
    ? window._resolveHistoryShareSource(match, modeKey, idx)
    : null;
  // 공유카드: 인덱스 기반이 어려운 케이스(comp 통합/대회 포함)에서는 match 객체로 직접 오픈
  const _buildDetailSharePayload = ()=>{
    try{
      if(typeof window._buildHistoryDetailSharePayload==='function'){
        return window._buildHistoryDetailSharePayload(match, modeKey, idx);
      }
      if(!match) return null;
      const source = _resolveOriginalShareSource();
      if(source) return source;
      if((match.a||match.b) && match.sa!=null && match.sb!=null){
        return {...match, _matchType:(modeKey||'')};
      }
      const A = reg.lA || match.a || match.wName || 'A';
      const B = reg.lB || match.b || match.lName || 'B';
      if(Array.isArray(match.games) && match.games.length){
        const games = match.games.map(g=>{
          const w = g.wName || (g.winner==='A'?A:(g.winner==='B'?B:''));
          return {
            playerA: A,
            playerB: B,
            winner: w===A ? 'A' : 'B',
            map: g.map||''
          };
        });
        const sa = games.filter(g=>g.winner==='A').length;
        const sb = games.filter(g=>g.winner==='B').length;
        return { a:A, b:B, sa, sb, d:match.d||'', n:match.n||'', sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}], _usePlayerPhoto:true, _matchType:(modeKey||'') };
      }
      if(match.wName || match.lName){
        const w = match.wName||'';
        const sa = w===A ? 1 : 0;
        const sb = w===B ? 1 : 0;
        return { a:A, b:B, sa, sb, d:match.d||'', n:match.n||'', sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games:[{playerA:A, playerB:B, winner:sa>sb?'A':'B', map:match.map||''}]}], _usePlayerPhoto:true, _matchType:(modeKey||'') };
      }
    }catch(e){}
    return null;
  };
  const _openShareByObj = (obj)=>{
    try{
      // 티어대회(tt) 등에서 공유카드 표기 보정
      const _mt = modeKey==='tt' ? 'tt' : (obj?._matchType || (modeKey||''));
      const _usePhoto = modeKey==='tt' ? true : (obj?._usePlayerPhoto || false);
      const _payload = obj ? {...obj, _matchType:_mt, _usePlayerPhoto:_usePhoto} : null;
      if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(_payload);
    }catch(e){}
  };
  // 헤더 액션(고정)
  try{
    const copyBtn=document.getElementById('hmdActCopy');
    if(copyBtn){
      copyBtn.onclick = (e)=>{
        try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
        const a=(match.a||reg.lA||''); const b=(match.b||reg.lB||'');
        copyMatchResult(String(a), match.sa||0, String(b), match.sb||0, match.d||'', modeKey, idx??0);
      };
    }
    const shareBtn=document.getElementById('hmdActShare');
    if(shareBtn){
      const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';
      const canShare = (!_adm || isLoggedIn);
      shareBtn.style.display = canShare ? '' : 'none';
      shareBtn.onclick = (e)=>{
        try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
        if(!canShare) return;
        const _payload = _buildDetailSharePayload();
        if(_payload){
          _openShareByObj(_payload);
          return;
        }
        // comp 포함 전 모드 지원
        if(typeof openShareCardFromMatch==='function' && idx!==null && modeKey!=='comp'){
          openShareCardFromMatch(modeKey, idx);
          return;
        }
        if(typeof openShareCardFromMatch==='function' && idx!==null && modeKey==='comp' && Array.isArray(comps) && comps[idx]){
          openShareCardFromMatch('comp', idx);
          return;
        }
        // fallback: match 객체로 직접 (대회 통합/인덱스 없는 케이스)
        _openShareByObj({...match, _matchType:(modeKey||'')});
      };
    }
  }catch(e){}
  const labelA=reg.lA || match.a || 'A';
  const labelB=reg.lB || match.b || 'B';
  const isDone=(match.sa!=null && match.sb!=null);
  const aWin=isDone && (match.sa>match.sb);
  const bWin=isDone && (match.sb>match.sa);
  const score=isDone ? `${match.sa}:${match.sb}` : '';

  // 헤더 텍스트
  if(titleEl) titleEl.textContent = `📅 ${labelA} vs ${labelB}${score?` (${score})`:''}`;
  if(subEl){
    const parts=[];
    if(match.d) parts.push(`📅 ${String(match.d).slice(0,10)}`);
    if(match.t) parts.push(String(match.t));
    if(match.n) parts.push(String(match.n));
    if(match.memo) parts.push(`📝 ${String(match.memo)}`);
    subEl.textContent = parts.join(' · ');
  }

  // 스코어바(가능할 때만)
  try{
    if(bar){
      if(isDone){
        const safe=(s)=>String(s||'').replace(/[<>]/g,'');
        const _icon = (name)=>{
          try{
            const url=UNIV_ICONS[name]||(univCfg.find(x=>x.name===name)||{}).icon||'';
            if(url) return `<img class="cmd-uicon" src="${toHttpsUrl(url)}" style="object-fit:contain;border-radius:var(--su_univ_logo_radius,12px);background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);padding:7px" onerror="this.style.display='none'">`;
          }catch(e){}
          return '';
        };
        const _playerMeta = (name, col, isLose) => {
          try{
            const p = (players||[]).find(x=>x && x.name===name);
            if(!p) return '';
            const race = p.race ? `<span class="rbadge cmd-head-race r${p.race}" style="font-size:10px">${p.race}</span>` : '';
            const tierTxt = p.tier ? String(p.tier).replace(/티어$/,'') : '';
            const tier = p.tier ? `<span class="cmd-head-tier" style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'}">${tierTxt}</span>` : '';
            return `<span class="cmd-team-meta">${tier}${race}</span>`;
          }catch(e){
            return '';
          }
        };
        const _resolvePlayerCol = (name, fallback) => {
          try{
            const p = (players||[]).find(x=>x && x.name===name);
            return (p && gc(p.univ)) || fallback || '#64748b';
          }catch(e){
            return fallback || '#64748b';
          }
        };
        const caBase=_resolvePlayerCol(labelA, reg.ca||'#64748b');
        const cbBase=_resolvePlayerCol(labelB, reg.cb||'#64748b');
        const ca=_getMatchDetailTeamHeaderColor(modeKey, 'A', caBase);
        const cb=_getMatchDetailTeamHeaderColor(modeKey, 'B', cbBase);
        const loseTeamA = isDone && !aWin && !!(match.sa!=null || match.sb!=null);
        const loseTeamB = isDone && !bWin && !!(match.sa!=null || match.sb!=null);
        const metaA = _playerMeta(labelA, caBase, loseTeamA);
        const metaB = _playerMeta(labelB, cbBase, loseTeamB);
        try{
          m.dataset.mode = String(modeKey||'');
          m.dataset.teamColorA = caBase;
          m.dataset.teamColorB = cbBase;
        }catch(e){}
        bar.innerHTML = `<div class="cmd-score">
          <div class="cmd-team ${aWin?'is-win':''} ${loseTeamA?'is-lose':''}" style="background:${loseTeamA?'linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))':`linear-gradient(135deg,${ca},${ca}cc)`};border-color:${loseTeamA?'rgba(203,213,225,.88)':'rgba(255,255,255,.28)'};padding:0 18px;color:${loseTeamA?'#64748b':'#fff'}"><span class="cmd-team-text" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);align-items:center;text-align:center;justify-content:center;gap:3px;max-width:calc(100% - 82px)"><span style="display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:100%">${_icon(labelA)}<span class="cmd-team-name" style="font-weight:1000">${safe(labelA)}</span></span>${metaA}</span></div>
          <div class="cmd-mid"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'#111827'}">${match.sa??''}</span><span class="cmd-colon">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'#111827'}">${match.sb??''}</span></div>
          <div class="cmd-team ${bWin?'is-win':''} ${loseTeamB?'is-lose':''}" style="background:${loseTeamB?'linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))':`linear-gradient(135deg,${cb},${cb}cc)`};border-color:${loseTeamB?'rgba(203,213,225,.88)':'rgba(255,255,255,.28)'};padding:0 18px;color:${loseTeamB?'#64748b':'#fff'}"><span class="cmd-team-text" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);align-items:center;text-align:center;justify-content:center;gap:3px;max-width:calc(100% - 82px)"><span style="display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:100%">${_icon(labelB)}<span class="cmd-team-name" style="font-weight:1000">${safe(labelB)}</span></span>${metaB}</span></div>
        </div>`;
        bar.style.display='block';
      }else{
        bar.style.display='none';
        bar.innerHTML='';
      }
    }
  }catch(e){}
  if(bodyEl){
    bodyEl.innerHTML = (typeof buildDetailHTML==='function'
      ? `<div class="cmd-detail">${buildDetailHTML(match, reg.mode, labelA, labelB, reg.ca, reg.cb, reg.aW, reg.bW)}</div>`
      : '<div style="padding:10px;color:var(--gray-l)">상세 렌더 함수를 찾을 수 없습니다.</div>');
    try{ injectUnivIcons(bodyEl); }catch(e){}
    try{ bodyEl.scrollTop = 0; }catch(e){}
  }
  try{
    const box = m.querySelector('.mbox--matchdetail');
    if(box) box.scrollTop = 0;
  }catch(e){}
  if(typeof om==='function') om('histDetModal');
  else m.style.display='block';
}

function toggleDetail(key){
  // (요청사항) 상세는 인라인 펼치기 대신 팝업으로 표시
  openHistDetailModal(key);
}

/* ══════════════════════════════════════
   대전기록 액션 메뉴(⋯)
   - (개선) 아이콘 버튼(복사/공유/상세/수정/삭제/이동)을 한 곳에 모아 UI 복잡도 감소
══════════════════════════════════════ */
// 대전기록 > 외부2 (관리자 전용, iframe)
// 외부2 / 외부3 UI는 `js/history-external-ui.js`로 분리

function buildSingleSetHTML(m, si, labelA, labelB, ca, cb){
  if(!m.sets||!m.sets[si])return`<div style="font-size:11px;color:var(--gray-l)">세트 기록 없음</div>`;
  const set=m.sets[si];
  const isAce=(si===m.sets.length-1&&m.sets.length>=3);
  const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
  const swA=set.scoreA||0,swB=set.scoreB||0;
  const setAWin=swA>swB,setBWin=swB>swA;
  let h=`<div style="font-size:11px;font-weight:700;color:${isAce?'#7c3aed':'var(--blue)'};margin-bottom:8px">${sLabel} — ${labelA} <span class="${setAWin?'wt':'lt'}">${swA}</span>:<span class="${setBWin?'wt':'lt'}">${swB}</span> ${labelB}</div>`;
  if(set.games&&set.games.length){
    set.games.forEach((g,gi)=>{
      if(!g.playerA&&!g.playerB)return;
      const pA=players.find(p=>p.name===g.playerA);
      const pB=players.find(p=>p.name===g.playerB);
      const pca=(pA&&gc(pA.univ))||ca;
      const pcb=(pB&&gc(pB.univ))||cb;
      const aIsWinner=g.winner==='A';const bIsWinner=g.winner==='B';const hasWinner=!!g.winner;
      const winBgA=(typeof getMatchWinTint==='function'?getMatchWinTint(pca):(pca+'22'));
      const winBgB=(typeof getMatchWinTint==='function'?getMatchWinTint(pcb):(pcb+'22'));
      const winBorderA=pca+'66',winBorderB=pcb+'66';
      const styleA=hasWinner?(aIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgA};border:2px solid ${winBorderA};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pca}12;border:1px solid ${pca}33;opacity:0.72;`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pca}12;border:1px solid ${pca}33;`;
      const styleB=hasWinner?(bIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgB};border:2px solid ${winBorderB};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pcb}12;border:1px solid ${pcb}33;opacity:0.72;`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pcb}12;border:1px solid ${pcb}33;`;
      const cA=g.playerA?`onclick="openPlayerModal('${g.playerA}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const cB=g.playerB?`onclick="openPlayerModal('${g.playerB}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const mapStr=g.map?`<span style="background:var(--surface);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-size:10px">${g.map}</span>`:'';
      h+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
        <span style="color:var(--gray-l);font-size:11px;font-weight:900;min-width:54px;text-align:center">경기 ${gi+1}</span>
        <div style="${styleA}">${pA?getPlayerPhotoHTML(pA.name,'30px','margin-right:4px'):''} ${pA?`<span class="rbadge r${pA.race}" style="font-size:11px;padding:2px 6px">${pA.race}</span>`:''}<strong style="font-size:14px" ${cA}>${g.playerA||'?'}</strong>${pA?genderIcon(pA.gender):''}<span style="font-size:11px;color:${ca};font-weight:700;margin-left:2px">(${labelA})</span>${aIsWinner&&hasWinner?`<span style="background:${ca};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        <span style="color:var(--gray-l);font-size:12px;font-weight:700">vs</span>
        <div style="${styleB}">${pB?getPlayerPhotoHTML(pB.name,'30px','margin-right:4px'):''} ${pB?`<span class="rbadge r${pB.race}" style="font-size:11px;padding:2px 6px">${pB.race}</span>`:''}<strong style="font-size:14px" ${cB}>${g.playerB||'?'}</strong>${pB?genderIcon(pB.gender):''}<span style="font-size:11px;color:${cb};font-weight:700;margin-left:2px">(${labelB})</span>${bIsWinner&&hasWinner?`<span style="background:${cb};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        ${mapStr}
      </div>`;
    });
  }
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 대회 탭
══════════════════════════════════════ */
function histProCompHTML() {
  // (요청사항) 대전기록 > 프로리그 > 대회 탭 아래 하위메뉴:
  // 조별리그 / 토너먼트 / 팀전 / 중장전
  if(!window._histProCompSub) window._histProCompSub='league'; // league | tourney | team | gj
  const sub = window._histProCompSub;
  const _pcSubBar=`<div class="fbar merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    <button class="pill ${sub==='league'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';render()">📅 조별리그</button>
    <button class="pill ${sub==='tourney'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='tourney';render()">🗂️ 토너먼트</button>
    <button class="pill ${sub==='team'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';render()">🤝 팀전</button>
    <button class="pill ${sub==='gj'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='gj';render()">⚔️ 중장전</button>
  </div>`;
  let inner = '';
  if(sub==='league') inner = _histProCompLeagueListHTML();
  else if(sub==='tourney') inner = histProCompTourneyHTML(true);
  else if(sub==='team') inner = histProCompTeamHTML(true);
  else if(sub==='gj') inner = histProCompGJHTML(true);
  else inner = _histProCompLeagueListHTML();
  return _pcSubBar + inner;
}

// 대전기록 > 프로리그 > 대회 > 조별리그(리스트)
function _histProCompLeagueListHTML(){
  // proTourneys에서 완료된 경기만 추출 (조별리그)
  const allItems = [];
  (proTourneys||[]).forEach(tn => {
    // 조별리그 경기
    (tn.groups||[]).forEach((grp, gi) => {
      const gl = 'ABCDEFGHIJ'[gi]||gi;
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach((m, mi) => {
        if (!m.a||!m.b||!m.winner) return;
        // (요청사항) 조편성 관리에서 "기록 반영=대진표 기록(stage)"인 경우
        // 조별리그 기록 목록에 중복으로 노출되지 않도록 제외
        if (m._stageRecId || (grp._recTarget||'')==='stage') return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _gi:gi, _mi:mi, _stage:'조별리그', _stageDetail:`GROUP ${gl}`, _stageColor:col});
      });
    });
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar = ``;
  if (!allItems.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🏅</div><div class="empty-state-title">프로리그 대회 기록이 없습니다</div><div class="empty-state-desc">대회 경기를 입력하면 여기에 표시됩니다</div></div>`;

  let h = '';
  // 대회명별 그룹화
  const groups = {};
  allItems.forEach(m => {
    if (!groups[m._tnName]) groups[m._tnName] = [];
    groups[m._tnName].push(m);
  });

  const _tb = p => p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb = p => p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _photo = p => p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:22px;height:22px;border-radius:var(--su_profile_radius,50%);object-fit:cover;vertical-align:middle;margin-right:3px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')" onerror="this.style.display='none'">`:'';

  h += sortBar;
  Object.entries(groups).forEach(([tnName, items]) => {
    h += `<div style="background:linear-gradient(135deg,var(--blue-l) 0%,var(--white) 100%);border:1.5px solid var(--blue-ll);border-left:4px solid #0891b2;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🏅</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#0891b2">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#0891b2;background:#e0f2fe;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m => {
      const pa = players.find(p=>p.name===m.a);
      const pb = players.find(p=>p.name===m.b);
      const aWin = m.winner==='A';
      const bWin = m.winner==='B';
      // 스테이지 배지 (조별리그 GROUP A / 준결승 / 결승 등)
      const stageBadge = `<span style="background:${m._stageColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap">${m._stageDetail}</span>`;
      const stageTypeBadge = m._stage==='조별리그'
        ? `<span style="background:#e0f2fe;color:#0891b2;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">조별리그</span>`
        : `<span style="background:#fef3c7;color:#b45309;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">대진표</span>`;
      h += `<div class="rec-summary rec-mode-procomptn${_recSideFxClass('procomptn')}" data-rec-mode="procomptn" style="--rec-mode-col:${m._stageColor};--rec-mode-rgb:${(function(){const h=String(m._stageColor||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};${_recSideFxStyle('procomptn',gc(m.a),gc(m.b))}margin-left:8px;border-left:3px solid ${m._stageColor}">
        <div style="padding:5px 12px 0;display:flex;align-items:center;gap:6px">
          <span style="color:var(--text3);font-size:11px;font-weight:600;flex-shrink:0">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>
          ${stageTypeBadge}${stageBadge}
          <div class="rec-actions no-export" style="margin-left:auto">
            <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
              onclick="openRecActionMenu(event,{
                _btnEl:this,
                hideDetail:true,
                a:'${(m.a||'').replace(/'/g,"\\'")}',
                sa:${aWin?1:0},
                b:'${(m.b||'').replace(/'/g,"\\'")}',
                sb:${bWin?1:0},
                d:'${m.d||''}',
                mode:'procomp',
                idx:0,
                key:'',
                canShare:true,
                shareFn:()=>openProCompMatchShare('${(m.a||'').replace(/'/g,"\\'")}','${(m.b||'').replace(/'/g,"\\'")}',${aWin?1:0},${bWin?1:0},'${m.d||''}'),
                canEdit:${isLoggedIn?'true':'false'},
                canDel:${isLoggedIn?'true':'false'},
                editFn:${isLoggedIn?`()=>proCompEditMatch('${m._tnId||''}',${m._gi||0},${m._mi||0})`:'null'},
                delFn:${isLoggedIn?`()=>proCompDelMatch('${m._tnId||''}',${m._gi||0},${m._mi||0})`:'null'},
                canMove:false
              })">⋯</button>
          </div>
        </div>
        <div class="rec-sum-header" style="padding:5px 12px 10px">
          <div class="rec-sum-vs" style="flex:1">
            <div style="display:flex;align-items:center;gap:4px;${aWin?'':'opacity:.7'}">
              ${_photo(pa)}
              <span style="font-weight:${aWin?'800':'500'};font-size:13px;color:${aWin?'#16a34a':'var(--text)'};cursor:pointer;text-decoration:underline dotted" onclick="openPlayerModal('${escJS(m.a)}')">${m.a}</span>
              ${_rb(pa)}${_tb(pa)}
              ${pa&&pa.univ?`<span style="font-size:10px;color:var(--gray-l)">${pa.univ}</span>`:''}
              ${aWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            <span style="font-size:11px;color:var(--gray-l);font-weight:700;flex-shrink:0">vs</span>
            <div style="display:flex;align-items:center;gap:4px;${bWin?'':'opacity:.7'}">
              ${_photo(pb)}
              <span style="font-weight:${bWin?'800':'500'};font-size:13px;color:${bWin?'#16a34a':'var(--text)'};cursor:pointer;text-decoration:underline dotted" onclick="openPlayerModal('${escJS(m.b)}')">${m.b}</span>
              ${_rb(pb)}${_tb(pb)}
              ${pb&&pb.univ?`<span style="font-size:10px;color:var(--gray-l)">${pb.univ}</span>`:''}
              ${bWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            ${m.map?`<span style="font-size:10px;color:var(--gray-l);flex-shrink:0">📍${m.map}</span>`:''}
          </div>
        </div>
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 토너먼트 탭 (대진표 + 3위전)
══════════════════════════════════════ */
function histProCompTourneyHTML(_omitBar) {
  const _pcSubBar2=_omitBar?'':`<div class="fbar merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';histSub='procomp';render()">📅 조별리그</button>
    <button class="pill on" style="flex-shrink:0;white-space:nowrap">🗂️ 토너먼트</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';histSub='procomp';render()">🤝 팀전</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='gj';histSub='procomp';render()">⚔️ 중장전</button>
  </div>`;
  const allItems = [];
  (proTourneys||[]).forEach(tn => {
    // 1) (신규) 대진표 기록(라운드 기록) 기반
    if(tn && tn.stageRecords){
      const st = tn.stageRecords || {};
      const order=['64강','32강','16강','8강','4강','결승'];
      const colOf = (r)=>r==='결승'?'#f59e0b':r==='4강'?'#7c3aed':r==='8강'?'#dc2626':'#2563eb';
      let hasStageItems = false;
      order.forEach(r=>{
        (st[r]||[]).forEach((m, idx)=>{
          if(!m||!m.a||!m.b||!m.winner) return;
          if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
          hasStageItems = true;
          allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _round:r, _idx:idx, _stage:'토너먼트', _stageDetail:r, _stageColor:colOf(r), d:m.d||''});
        });
      });
      if(hasStageItems) return;
    }
    // 2) (호환) 기존 대진표(bracket) 기반
    const rounds = tn.bracket||[];
    const totalRounds = rounds.length;
    rounds.forEach((rnd, ri) => {
      // 라운드 표기: 16강/8강/4강/결승 (※ 4강=준결승)
      const rndLabel = ri===totalRounds-1?'결승':ri===totalRounds-2?'4강':ri===totalRounds-3?'8강':`${Math.pow(2,totalRounds-ri)}강`;
      const stageColor = ri===totalRounds-1?'#f59e0b':ri===totalRounds-2?'#7c3aed':ri===totalRounds-3?'#dc2626':'#2563eb';
      rnd.forEach(m => {
        if (!m.a||!m.b) return;
        const scoreA = (m._games||[]).filter(g=>g.winner==='A').length;
        const scoreB = (m._games||[]).filter(g=>g.winner==='B').length;
        const isTieSaved = (!m.winner && Array.isArray(m._games) && m._games.length>0 && scoreA===scoreB && (scoreA+scoreB)>0);
        if (!m.winner && !isTieSaved) return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _ri:ri, _mi:(m._mi!==undefined?m._mi:null), _stage:'토너먼트', _stageDetail:rndLabel, _stageColor:stageColor, d:m.d||'', _isTie:isTieSaved, _scoreA:scoreA, _scoreB:scoreB});
      });
    });
    if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.winner) {
      if (!(typeof passDateFilter==='function'&&!passDateFilter(tn.thirdPlace.d||''))) {
        allItems.push({...tn.thirdPlace, _tnName:tn.name, _tnId:tn.id, _ri:'3rd', _mi:0, _stage:'토너먼트', _stageDetail:'3위전', _stageColor:'#cd7f32', d:tn.thirdPlace.d||''});
      }
    }
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=``;
  if (!allItems.length) return _pcSubBar2+sortBar+`<div class="empty-state"><div class="empty-state-icon">🗂️</div><div class="empty-state-title">토너먼트 기록이 없습니다</div><div class="empty-state-desc">대진표 기록에서 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const groups={};
  allItems.forEach(m=>{if(!groups[m._tnName])groups[m._tnName]=[];groups[m._tnName].push(m);});
  const _tb=p=>p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _photo=p=>p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:22px;height:22px;border-radius:var(--su_profile_radius,50%);object-fit:cover;vertical-align:middle;margin-right:3px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')" onerror="this.style.display='none'">`:'';
  let h=_pcSubBar2+sortBar;
  Object.entries(groups).forEach(([tnName,items])=>{
    h+=`<div style="background:linear-gradient(135deg,#f5f3ff 0%,var(--white) 100%);border:1.5px solid #ddd6fe;border-left:4px solid #7c3aed;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🗂️</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#7c3aed">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#7c3aed;background:#f5f3ff;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m=>{
      const pa=players.find(p=>p.name===m.a), pb=players.find(p=>p.name===m.b);
      const aWin=m.winner==='A', bWin=m.winner==='B';
      const stageBadge=`<span style="background:${m._stageColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap">${m._stageDetail}</span>`;
      const tieBadge = m._isTie ? `<span style="background:#fffbeb;color:#b45309;border:1px solid #fde68a;font-size:10px;font-weight:900;padding:2px 8px;border-radius:999px;white-space:nowrap">⚖️ ${m._scoreA||0}:${m._scoreB||0}</span>` : '';
      h+=`<div class="rec-summary rec-mode-procomptn${_recSideFxClass('procomptn')}" data-rec-mode="procomptn" style="--rec-mode-col:${m._stageColor};--rec-mode-rgb:${(function(){const h=String(m._stageColor||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};${_recSideFxStyle('procomptn',gc(m.a),gc(m.b))}margin-left:8px;border-left:3px solid ${m._stageColor}">
        <div style="padding:5px 12px 0;display:flex;align-items:center;gap:6px">
          <span style="color:var(--text3);font-size:11px;font-weight:600;flex-shrink:0">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>
          <span style="background:#f5f3ff;color:#7c3aed;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">토너먼트</span>
          ${stageBadge}
          ${tieBadge}
          <div class="rec-actions no-export" style="margin-left:auto">
            <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
              onclick="openRecActionMenu(event,{
                _btnEl:this,
                hideDetail:true,
                a:'${(m.a||'').replace(/'/g,"\\'")}',
                sa:${m._isTie?(m._scoreA||0):(aWin?1:0)},
                b:'${(m.b||'').replace(/'/g,"\\'")}',
                sb:${m._isTie?(m._scoreB||0):(bWin?1:0)},
                d:'${m.d||''}',
                mode:'procomptn',
                idx:0,
                key:'',
                canShare:true,
                shareFn:()=>openProCompMatchShare('${(m.a||'').replace(/'/g,"\\'")}','${(m.b||'').replace(/'/g,"\\'")}',${m._isTie?(m._scoreA||0):(aWin?1:0)},${m._isTie?(m._scoreB||0):(bWin?1:0)},'${m.d||''}'),
                canEdit:${isLoggedIn?'true':'false'},
                canDel:false,
                editFn:${isLoggedIn?`()=>{ try{ if(typeof openPcStageRecModal==='function' && m._round) openPcStageRecModal('${(m._tnId||'').replace(/'/g,"\\'")}', '${(m._round||'').replace(/'/g,"\\'")}', ${m._idx||0}); else if(typeof openPcBktPasteModal==='function') openPcBktPasteModal('${(m._tnId||'').replace(/'/g,"\\'")}', ${JSON.stringify(m._ri)}, ${m._mi||0}); }catch(e){} }`:'null'},
                canMove:false
              })">⋯</button>
          </div>
        </div>
        <div class="rec-sum-header" style="padding:5px 12px 10px">
          <div class="rec-sum-vs" style="flex:1">
            <div style="display:flex;align-items:center;gap:4px;${(aWin||m._isTie)?'':'opacity:.7'}">
              ${_photo(pa)}<span style="font-weight:${aWin?'800':m._isTie?'800':'500'};font-size:13px;color:${aWin?'#16a34a':m._isTie?'#b45309':'var(--text)'}">${m.a}</span>
              ${_rb(pa)}${_tb(pa)}${aWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            <span style="font-size:11px;color:var(--gray-l);font-weight:700;flex-shrink:0">vs</span>
            <div style="display:flex;align-items:center;gap:4px;${(bWin||m._isTie)?'':'opacity:.7'}">
              ${_photo(pb)}<span style="font-weight:${bWin?'800':m._isTie?'800':'500'};font-size:13px;color:${bWin?'#16a34a':m._isTie?'#b45309':'var(--text)'}">${m.b}</span>
              ${_rb(pb)}${_tb(pb)}${bWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            ${m.map?`<span style="font-size:10px;color:var(--gray-l);flex-shrink:0">📍${m.map}</span>`:''}
          </div>
        </div>
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 팀전 탭
══════════════════════════════════════ */
function histProCompTeamHTML(_omitBar) {
  // proTourneys.teamMatches 전체 추출
  const tmList = []; // [{tnName, tm}]
  (proTourneys||[]).forEach(tn => {
    (tn.teamMatches||[]).forEach(tm => {
      const games = (tm.games||[]).filter(g=>g.wName&&g.lName);
      if (!games.length) return;
      if (typeof passDateFilter==='function'&&!passDateFilter(tm.d||'')) return;
      tmList.push({tnName:tn.name, tm});
    });
  });
  tmList.sort((a,b)=>recSortDir==='asc'?(a.tm.d||'').localeCompare(b.tm.d||''):(b.tm.d||'').localeCompare(a.tm.d||''));
  const totalGames = tmList.reduce((s,x)=>s+(x.tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
  const sortBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
    <span style="font-size:11px;color:var(--gray-l)">${totalGames}경기 / ${tmList.length}팀전</span>
  </div>`;
  if (!tmList.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🤝</div><div class="empty-state-title">팀전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 팀전 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const _tb=p=>p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _photo=p=>p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:22px;height:22px;border-radius:var(--su_profile_radius,50%);object-fit:cover;vertical-align:middle;margin-right:3px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')" onerror="this.style.display='none'">`:'';
  const _proSideCols = getFixedSideColors('pro');
  const colA=_proSideCols.a, colB=_proSideCols.b;
  let h=sortBar;
  // 대회명별 그룹
  const byTn={};
  tmList.forEach(({tnName,tm})=>{ if(!byTn[tnName])byTn[tnName]=[]; byTn[tnName].push(tm); });
  Object.entries(byTn).forEach(([tnName,tms])=>{
    const gCnt=tms.reduce((s,tm)=>s+(tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
    h+=`<div style="background:linear-gradient(135deg,#ecfdf5 0%,var(--white) 100%);border:1.5px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🤝</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#16a34a">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;border-radius:20px;padding:2px 10px;margin-left:auto">${tms.length}팀전 · ${gCnt}경기</span>
    </div>`;
    tms.forEach(tm=>{
      const aWin=tm.sa>tm.sb, bWin=tm.sb>tm.sa;
      const games=(tm.games||[]).filter(g=>g.wName&&g.lName);
      h+=`<div class="rec-summary${_recSideFxClass('procompteam')}" data-rec-mode="procompteam" style="border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:10px;${_recSideFxStyle('procompteam',colA,colB)}">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border)">
          <span style="font-size:12px;font-weight:600;color:var(--text3)">${tm.d||'날짜 미정'}</span>
          <span style="background:#e0f2fe;color:#0284c7;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">팀전</span>
          <span style="font-weight:${aWin?900:600};color:${aWin?colA:'var(--text)'};font-size:13px">${tm.teamAName||'A팀'}</span>
          <span style="font-size:16px;font-weight:900;background:${aWin?colA:bWin?colB:'var(--border)'};color:#fff;padding:1px 10px;border-radius:6px">${tm.sa||0}:${tm.sb||0}</span>
          <span style="font-weight:${bWin?900:600};color:${bWin?colB:'var(--text)'};font-size:13px">${tm.teamBName||'B팀'}</span>
          <button class="btn btn-w btn-xs rec-morebtn no-export" style="margin-left:auto;padding:3px 10px;font-size:14px" title="메뉴"
            onclick="openRecActionMenu(event,{
              _btnEl:this,
              hideDetail:true,
              a:'${(tm.teamAName||'A팀').replace(/'/g,"\\'")}',
              sa:${tm.sa||0},
              b:'${(tm.teamBName||'B팀').replace(/'/g,"\\'")}',
              sb:${tm.sb||0},
              d:'${tm.d||''}',
              mode:'procomp-team',
              idx:0,
              key:'',
              canShare:true,
              shareFn:()=>openProCompMatchShare('${(tm.teamAName||'A팀').replace(/'/g,"\\'")}','${(tm.teamBName||'B팀').replace(/'/g,"\\'")}',${tm.sa||0},${tm.sb||0},'${tm.d||''}'),
              canEdit:false,
              canDel:false,
              canMove:false
            })">⋯</button>
        </div>
        ${games.map(g=>{
          const pw=players.find(p=>p.name===g.wName), pl=players.find(p=>p.name===g.lName);
          const sideWin=g._sideW==='A'?tm.teamAName||'A팀':tm.teamBName||'B팀';
          return `<div class="rec-summary rec-mode-procompteam${_recSideFxClass('procompteam')}" data-rec-mode="procompteam" style="--rec-mode-col:${g._sideW==='A'?colA:colB};--rec-mode-rgb:${(function(){const c=(g._sideW==='A'?colA:colB);const h=String(c||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};${_recSideFxStyle('procompteam',colA,colB)}margin-left:4px;border-left:3px solid ${g._sideW==='A'?colA:colB}">
            <div class="rec-sum-header">
              <span style="background:${g._sideW==='A'?colA:colB};color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${sideWin}</span>
              <div class="rec-sum-vs" style="flex:1">
                <div style="display:flex;align-items:center;gap:4px">
                  ${_photo(pw)}<span style="font-weight:800;font-size:13px;color:#16a34a">${g.wName}</span>
                  ${_rb(pw)}${_tb(pw)}
                  ${pw&&pw.univ?`<span style="font-size:10px;color:var(--gray-l)">${pw.univ}</span>`:''}
                  <span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>
                </div>
                <span style="font-size:11px;color:var(--gray-l);font-weight:700;flex-shrink:0">vs</span>
                <div style="display:flex;align-items:center;gap:4px;opacity:.7">
                  ${_photo(pl)}<span style="font-weight:500;font-size:13px;color:var(--text)">${g.lName}</span>
                  ${_rb(pl)}${_tb(pl)}
                  ${pl&&pl.univ?`<span style="font-size:10px;color:var(--gray-l)">${pl.univ}</span>`:''}
                </div>
                ${g.map?`<span style="font-size:10px;color:var(--gray-l);flex-shrink:0">📍${g.map}</span>`:''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   ⚔️ 프로리그 대회 중장전 기록
══════════════════════════════════════ */
function histProCompGJHTML(_omitBar){
  const _pcGjBar=_omitBar?'':`<div class="fbar merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';histSub='procomp';render()">📅 조별리그</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='tourney';histSub='procomp';render()">🗂️ 토너먼트</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';histSub='procomp';render()">🤝 팀전</button>
    <button class="pill on" style="flex-shrink:0;white-space:nowrap">⚔️ 중장전</button>
  </div>`;
  const allSess=[];
  (proTourneys||[]).forEach(tn=>{
    (tn.gjMatches||[]).forEach(sess=>{
      allSess.push({...sess,tnName:tn.name});
    });
  });
  if(!allSess.length)return _pcGjBar+`<div class="empty-state"><div class="empty-state-icon">⚔️</div><div class="empty-state-title">프로리그 대회 중장전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 탭 → 중장전에서 입력하세요</div></div>`;
  allSess.sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  let h=_pcGjBar;
  allSess.forEach(sess=>{
    const p1w=(sess.games||[]).filter(g=>g.winner===sess.a).length;
    const p2w=(sess.games||[]).filter(g=>g.winner===sess.b).length;
    const winner=p1w>p2w?sess.a:p2w>p1w?sess.b:'';
    const _sid = String(sess._id||'').replace(/'/g,"\\'");
    const _pcgjColA=gc(sess.a||'');
    const _pcgjColB=gc(sess.b||'');
    h+=`<div class="rec-summary${_recSideFxClass('procompgj')}" data-rec-mode="procompgj" style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden;${_recSideFxStyle('procompgj',_pcgjColA,_pcgjColB)}">
      <div style="background:var(--bg2);padding:10px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;cursor:pointer" onclick="openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')">
        <span style="font-size:12px;font-weight:600;color:var(--text3)">${sess.d||'날짜 미정'}</span>
        <span style="font-size:11px;background:#0891b2;color:#fff;padding:1px 8px;border-radius:4px;font-weight:700">🎖️ ${sess.tnName||''}</span>
        <span style="font-weight:700;color:var(--blue);cursor:pointer" onclick="event.stopPropagation();openPlayerModal(decodeURIComponent('${encodeURIComponent(sess.a||'')}'))">${sess.a||'?'}</span>
        <span class="score-click" style="font-weight:1000;color:var(--blue);text-decoration:underline;text-underline-offset:3px;text-decoration-style:dotted">${p1w} - ${p2w}</span>
        <span style="font-weight:700;cursor:pointer" onclick="event.stopPropagation();openPlayerModal(decodeURIComponent('${encodeURIComponent(sess.b||'')}'))">${sess.b||'?'}</span>
        ${winner?`<span style="font-size:11px;color:#16a34a;font-weight:700">(${winner} 승)</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${(sess.games||[]).length}게임</span>
        <button class="btn btn-w btn-xs no-export" style="margin-left:auto" onclick="event.stopPropagation();openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')">📂 경기 상세</button>
      </div>
      <table style="margin:0;border-radius:0"><thead><tr><th>게임</th><th>${sess.a||'A'}</th><th style="color:var(--gray-l)">vs</th><th>${sess.b||'B'}</th><th>맵</th></tr></thead><tbody>
      ${(sess.games||[]).map((g,gi)=>{
        const aWin=g.winner===sess.a;
        return`<tr><td style="font-size:11px;color:var(--gray-l)">${gi+1}게임</td><td style="font-weight:${aWin?'900':'400'};color:${aWin?'var(--blue)':'#aaa'}">${aWin?'▶ '+sess.a:sess.a}</td><td style="color:var(--gray-l);text-align:center">vs</td><td style="font-weight:${!aWin?'900':'400'};color:${!aWin?'var(--blue)':'#aaa'}">${!aWin?'▶ '+sess.b:sess.b}</td><td style="font-size:11px;color:var(--gray-l)">${g.map||''}</td></tr>`;
      }).join('')}
      </tbody></table>
    </div>`;
  });
  return h;
}

// 팀 멤버 팝업 (프로리그, 미니, 대학, 티어, 토너먼트 등)
function openProMembersPopup(teamLabel, teamColor, members){
  try{
    if(!members || !members.length) return;

    // 이미 열린 모달이 있으면 닫기
    const existing = document.getElementById('proMembersModal');
    if(existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'proMembersModal';
    // modal-drag.js가 인식하도록 class 부여 (PC에서 헤더 드래그 이동)
    modal.className = 'modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

    const membersHTML = members.map(mem => {
      const memName = typeof mem === 'string' ? mem : (mem.name || mem);
      const p = players.find(x => x.name === memName) || {};
      const pColor = gc(p.univ) || '#64748b';
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
          <span style="cursor:pointer" onclick="document.getElementById('proMembersModal').remove();openPlayerModal('${memName.replace(/'/g,"\\'")}')">
            ${getPlayerPhotoHTML(memName, '44px')}
          </span>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:14px;color:#1f2937;cursor:pointer" onclick="document.getElementById('proMembersModal').remove();openPlayerModal('${memName.replace(/'/g,"\\'")}')">${memName}</div>
            <div style="font-size:11px;color:#6b7280;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              ${p.univ ? `<span class="ubadge" style="background:${pColor};font-size:10px;padding:1px 6px;">${p.univ}</span>` : ''}
              ${p.tier ? `<span style="background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)};font-size:10px;padding:1px 6px;border-radius:4px;font-weight:700;">${p.tier}</span>` : ''}
              ${p.race ? `<span class="rbadge r${p.race}" style="font-size:10px;padding:1px 5px;">${p.race}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="mbox" style="background:#ffffff;border-radius:16px;max-width:420px;width:100%;max-height:80vh;overflow:auto;padding:18px 18px 16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div class="mtitle" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;cursor:move;user-select:none">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            <span style="width:12px;height:12px;border-radius:50%;background:${teamColor};flex-shrink:0"></span>
            <div style="min-width:0">
              <div style="margin:0;font-size:16px;font-weight:900;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${teamLabel} 참가자</div>
              <div style="font-size:12px;color:#6b7280;margin-top:2px">총 ${members.length}명</div>
            </div>
          </div>
          <button onclick="document.getElementById('proMembersModal').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;line-height:1">×</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${membersHTML}
        </div>
        <div style="margin-top:14px;display:flex;justify-content:center;">
          <button class="btn btn-w" onclick="document.getElementById('proMembersModal').remove()">닫기</button>
        </div>
        <div style="margin-top:10px;font-size:11px;color:#94a3b8;text-align:center">※ PC에서는 상단 제목을 드래그해서 창을 이동할 수 있습니다.</div>
      </div>
    `;
    document.body.appendChild(modal);
  }catch(e){
    console.error('[openProMembersPopup] 오류:', e);
  }
}
