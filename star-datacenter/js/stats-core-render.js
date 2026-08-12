/* ══════════════════════════════════════════════════════════════
   통계 - 메인 렌더러 rStats (stats-core.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function rStats(C,T){
  T.textContent='📊 통계';
  // 전역 유틸(stats-core-utils.js)이 window._statsDateFrom 등을 참조하므로 항상 동기화
  _statsSyncFilterToWindow();
  // history가 비어있으면 통계가 전부 비어 보이므로 자동 재생성 시도
  _statsEnsureHistoryReady();
  if(typeof players==='undefined' || !Array.isArray(players)){
    C.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
    return;
  }
  // 통계탭 서브탭(스트리머 리포트 등)이 바뀌면 재생 중이던 음성듣기(TTS)를 정지.
  // (SUTTS는 싱글톤이라 stop() 호출 시 speak() 때 등록해둔 onEnd 정리 콜백이 그대로 실행됨)
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const _coreIds = new Set(['overview','tierRank','levelRank','award','radar','univwinbar','period','preport','sharecard']);
  // (A안) 하위 탭 + 전역필터를 '필터'로 접기/펼치기
  const _lockOpen = (localStorage.getItem('su_filter_lock_open') ?? '0') === '1'
    || (typeof window._shouldLockSubFilter==='function' && window._shouldLockSubFilter('stats'));
  if(window._statsFilterOpen===undefined) window._statsFilterOpen=_lockOpen;
  if(_lockOpen) window._statsFilterOpen = true;
  // UX 3: 마지막 방문 서브탭 복원
  const _savedSub=localStorage.getItem('su_statsSub');
  window.statsSub = window.statsSub || 'overview';
  if(_savedSub&&window.statsSub==='overview'&&_savedSub!=='overview'){
    if((_savedSub!=='csvexport'||_li) && (_savedSub!=='starsystem'||_li)) window.statsSub=_savedSub;
  }
  if (window._statsLastSub !== undefined && window._statsLastSub !== window.statsSub &&
      window.SUTTS && ((window.SUTTS.isSpeaking && window.SUTTS.isSpeaking()) || (window.SUTTS.isPaused && window.SUTTS.isPaused()))) {
    try{ window.SUTTS.stop(); }catch(e){}
  }
  window._statsLastSub = window.statsSub;
  // [UX-FIX] 상단 '핵심 통계 / 심화 분석' 표시와 실제 서브탭이 어긋나지 않도록
  // 저장된 서브탭 복원이 끝난 뒤에 보기 모드를 계산한다.
  window._statsViewMode = _coreIds.has(window.statsSub||'overview') ? 'core' : 'advanced';
  const _statsGroups=[
    {label:'🏆 개인',tabs:[
      {id:'overview',lbl:'🏛️ 종합'},
      {id:'tierRank',lbl:'🚀 티어 랭킹'},
      {id:'levelRank',lbl:'🎮 레벨/등급 순위표'},
      ...(_li?[{id:'starsystem',lbl:'⭐ 스타시스템'}]:[]),
      {id:'promosim',lbl:'🔮 승급 시뮬레이션'},
      {id:'elo',lbl:'📈 ELO 그래프'},
      {id:'growth',lbl:'📊 성장 곡선'},
      {id:'award',lbl:'🏆 이번 주/달 MVP'},
      {id:'records',lbl:'🎖️ 최다 기록'},
      {id:'killer',lbl:'🗡️ 킬러/피해자'},
      {id:'streakhist',lbl:'🔥 역대 연속 기록'},
      {id:'playervs',lbl:'⚔️ 스트리머 비교'},
    ]},
    {label:'🏛️ 대학',tabs:[
      {id:'radar',lbl:'🕸️ 대학 레이더'},
      {id:'univcompare',lbl:'⚔️ 대학비교'},
      {id:'univmatrix',lbl:'🏛️ 대학 매트릭스'},
      {id:'univmatrix2',lbl:'🏛️ 대학 매트릭스+'},
      {id:'univwinbar',lbl:'📊 대학별 승률'},
      {id:'univstat',lbl:'🏛️ 대학별 기록'},
      {id:'univrank',lbl:'🏛️ 대학별 포인트'},
    ]},
    {label:'📊 경기',tabs:[
      {id:'period',lbl:'🗓️ 주간/월간 분석'},
      {id:'mismatch',lbl:'⚡ 미스매치'},
      {id:'heatmap',lbl:'📅 활동 히트맵'},
      {id:'tierwin',lbl:'🎯 티어별 승률(개인)'},
      {id:'tiermatch',lbl:'🎖️ 티어별 승률(팀전)'},
      {id:'maprank',lbl:'🗺️ 맵별 특화'},
      {id:'race',lbl:'⚔️ 종족 승률'},
      {id:'racetrend',lbl:'🔬 종족 트렌드'},
      {id:'seasonal',lbl:'📅 요일/시즌 승률'},
    ]},
    {label:'🔍 리포트',tabs:[
      {id:'preport',lbl:'📺 스트리머 리포트'},
      {id:'sharecard',lbl:'🎴 공유 카드'},
      ...(_li?[{id:'csvexport',lbl:'📥 CSV 내보내기'}]:[]),
    ]},
  ];
  try{
    if(typeof applyTabLabels==='function'){
      _statsGroups.forEach(g=>{ g.tabs = applyTabLabels('stats', g.tabs); });
    }
  }catch(e){}
  const _viewFilteredGroups = _statsGroups
    .map(g=>({
      ...g,
      tabs:g.tabs.filter(t=>window._statsViewMode==='core' ? _coreIds.has(t.id) : !_coreIds.has(t.id))
    }))
    .filter(g=>g.tabs.length);
  // 유효한 서브탭인지 확인(유효하지 않으면 overview로 복귀)
  const _allSubIds = new Set(_viewFilteredGroups.flatMap(g=>g.tabs.map(t=>t.id)));
  if(!_allSubIds.has(window.statsSub||'')){
    const _fallback=_viewFilteredGroups[0]?.tabs[0]?.id || 'overview';
    window.statsSub=_fallback;
    try{ localStorage.setItem('su_statsSub',_fallback); }catch(e){}
  }
  // 현재 그룹 찾기
  const _curGrp=_viewFilteredGroups.find(g=>g.tabs.some(t=>t.id===(window.statsSub||'overview')))||_viewFilteredGroups[0];
  const _curSub = (window.statsSub||'overview');
  const _curSubObj = _curGrp.tabs.find(t=>t.id===_curSub) || _curGrp.tabs[0];
  const _curGrpLabel = (typeof getTabLabel==='function') ? getTabLabel('statsGroup', _curGrp.label, _curGrp.label) : _curGrp.label;
  let h=`<div class="stats-shell">`;
  h+=`<section class="stats-hero">
    <div class="stats-hero-copy">
      <div class="stats-hero-kicker">Stats Center</div>
      <div class="stats-hero-title">📊 통계 대시보드</div>
      <div class="stats-hero-desc">${window._statsViewMode==='core'?'자주 보는 핵심 지표 위주로 빠르게 확인할 수 있는 통계 화면입니다.':'세부 비교, 추세, 매트릭스까지 한 번에 볼 수 있는 심화 통계 화면입니다.'}</div>
    </div>
    <div class="stats-hero-badges">
      <span class="stats-hero-badge">${window._statsViewMode==='core'?'⚡ 핵심 통계':'🧠 심화 분석'}</span>
      <span class="stats-hero-badge">${_curGrpLabel}</span>
      <span class="stats-hero-badge">${_curSubObj?.lbl||'통계'}</span>
    </div>
  </section>`;
  h+=`<div class="stats-toolbar-card no-export">`;
  h+=`<div class="stats-modebar fbar no-export">
    <div class="stats-modeseg">
      <button class="pill ${window._statsViewMode==='core'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._statsViewMode='core';window.statsSub='${_coreIds.has(window.statsSub||'')?(window.statsSub||'overview'):'overview'}';localStorage.setItem('su_statsSub',window.statsSub);render()">⚡ 핵심 통계</button>
      <button class="pill ${window._statsViewMode==='advanced'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._statsViewMode='advanced';window.statsSub='${_coreIds.has(window.statsSub||'overview')?(_li?'starsystem':'promosim'):(window.statsSub||(_li?'starsystem':'promosim'))}';localStorage.setItem('su_statsSub',window.statsSub);render()">🧠 심화 분석</button>
    </div>
    <span class="stats-modebar-hint">${window._statsViewMode==='core'?'자주 보는 핵심 지표 중심':'세부 비교·추세·매트릭스 중심'}</span>
  </div>`;
  // 1행: 그룹 pill 바
  h+=`<div class="stats-grouprow fbar no-export">`;
  // (요청사항) 통계탭 필터는 맨 좌측(개인 버튼 왼쪽). 단, '항상 펼침'이면 버튼 숨김
  const _enableSubFilter = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  if(_enableSubFilter && !_lockOpen){
    h+=`<button class="pill stats-filter-toggle ${window._statsFilterOpen?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._statsFilterOpen=!window._statsFilterOpen;render()">🔍 필터 ${window._statsFilterOpen?'▲':'▼'}</button>`;
  }
  _viewFilteredGroups.forEach(grp=>{
    const isOn=grp===_curGrp;
    const gLbl = (typeof getTabLabel==='function') ? getTabLabel('statsGroup', grp.label, grp.label) : grp.label;
    h+=`<button class="pill stats-group-btn ${isOn?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window.statsSub='${grp.tabs[0].id}';localStorage.setItem('su_statsSub','${grp.tabs[0].id}');render()">${gLbl}</button>`;
  });
  window._statsGroupItems = _viewFilteredGroups.map(grp=>({
    id: grp.tabs[0].id,
    label: (typeof getTabLabel==='function') ? getTabLabel('statsGroup', grp.label, grp.label) : grp.label,
    action: `window.statsSub='${grp.tabs[0].id}';localStorage.setItem('su_statsSub','${grp.tabs[0].id}');render()`,
    active: grp===_curGrp
  }));
  h+=`<button type="button" class="pill mode-select-trigger" style="flex-shrink:0;white-space:nowrap" onclick="_toggleModePopover(this,'통계 카테고리',window._statsGroupItems)">${_curGrpLabel} ▾</button>`;
  // (요청사항) 우측 끝 현재 선택 글자 숨김
  h+=`</div>`;
  // 전역 필터 바
  const _isFiltered=!!(_statsDateFrom||_statsDateTo||_statsMinGames!==10||_statsLastN>0);
  const _now=new Date();
  const _yyyy=_now.getFullYear();
  const _mm=String(_now.getMonth()+1).padStart(2,'0');
  const _dd=String(_now.getDate()).padStart(2,'0');
  const _today=`${_yyyy}-${_mm}-${_dd}`;
  const _thisYearStart=`${_yyyy}-01-01`;
  const _thisMonthStart=`${_yyyy}-${_mm}-01`;
  const _3mAgo=(()=>{const d=new Date(_now);d.setMonth(d.getMonth()-3);return d.toISOString().slice(0,10);})();
  const _6mAgo=(()=>{const d=new Date(_now);d.setMonth(d.getMonth()-6);return d.toISOString().slice(0,10);})();
  function _qBtn(lbl,from,to){
    const on=_statsDateFrom===from&&_statsDateTo===to;
    return`<button class="stats-quickbtn ${on?'on':''}" onclick="_statsDateFrom='${from}';_statsDateTo='${to}';render()">${lbl}</button>`;
  }
  function _nBtn(n){
    const on=_statsLastN===n;
    return`<button class="stats-quickbtn stats-quickbtn--purple ${on?'on':''}" onclick="_statsLastN=${n};render()">${n===0?'전체':n+'경기'}</button>`;
  }
  // (A안) 필터가 열렸을 때만 하위 탭 + 전역필터 표시
  if((_enableSubFilter?window._statsFilterOpen:true)){
  // 하위 탭 pill 바
  h+=`<div class="stats-subrow fbar no-export">`;
  _curGrp.tabs.forEach(o=>{
    h+=`<button class="pill stats-subtab-btn ${(window.statsSub||'overview')===o.id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window.statsSub='${o.id}';localStorage.setItem('su_statsSub','${o.id}');render()">${o.lbl}</button>`;
  });
  window._statsSubtabItems = _curGrp.tabs.map(o=>({
    id: o.id,
    label: o.lbl,
    action: `window.statsSub='${o.id}';localStorage.setItem('su_statsSub','${o.id}');render()`,
    active: (window.statsSub||'overview')===o.id
  }));
  h+=`<button type="button" class="pill mode-select-trigger" style="flex-shrink:0;white-space:nowrap" onclick="_toggleModePopover(this,'세부 통계',window._statsSubtabItems)">${_curSubObj?.lbl||'통계'} ▾</button>`;
  h+=`</div>`;

  const _filterBadges = [
    _statsDateFrom||_statsDateTo ? `기간 ${_statsDateFrom||'시작'} ~ ${_statsDateTo||'현재'}` : '기간 전체',
    _statsLastN>0 ? `최근 ${_statsLastN}경기` : '최근 경기 제한 없음',
    `최소경기 ${_statsMinGames}`
  ];

  h+=`<div class="no-export stats-filter-box ${_isFiltered?'':'is-idle'}">
    <div class="stats-filter-row stats-filter-row--inputs">
      <label class="stats-filter-field stats-filter-field--range" title="기간을 직접 지정합니다">
        <span class="stats-filter-field-ico">📅</span>
        <input type="date" value="${_statsDateFrom}" onchange="_statsDateFrom=this.value;render()">
        <span class="stats-filter-tilde">~</span>
        <input type="date" value="${_statsDateTo}" onchange="_statsDateTo=this.value;render()">
      </label>
      <label class="stats-filter-field" title="월만 선택하면 해당 월의 1일~말일로 자동 설정합니다">
        <span class="stats-filter-field-ico">🗓️</span>
        <span class="stats-filter-field-lbl">월</span>
        <input type="month" value="${(_statsDateFrom||_statsDateTo)?(String((_statsDateFrom||_statsDateTo)).slice(0,7)):''}"
          onchange="try{const v=this.value||'';if(!v){_statsDateFrom='';_statsDateTo='';render();return;}const a=v.split('-');const yy=+a[0],mm=+a[1];const last=new Date(yy,mm,0).getDate();_statsDateFrom=v+'-01';_statsDateTo=v+'-'+String(last).padStart(2,'0');render();}catch(e){render();}">
      </label>
      <label class="stats-filter-field" title="이 경기 수 미만인 스트리머는 승률 집계에서 제외됩니다">
        <span class="stats-filter-field-ico">🎮</span>
        <span class="stats-filter-field-lbl">최소경기</span>
        <input type="number" min="1" max="99" class="stats-filter-num" value="${_statsMinGames}" onchange="_statsMinGames=Math.max(1,parseInt(this.value)||1);render()">
        <span class="stats-filter-info" title="최소 경기 수 미만인 스트리머는 승률 집계에서 제외">ℹ️</span>
      </label>
      ${_isFiltered?`<button class="stats-filter-reset" onclick="_statsDateFrom='';_statsDateTo='';_statsMinGames=10;_statsLastN=0;render()">✕ 초기화</button>`:''}
    </div>
    <div class="stats-filter-divider"></div>
    <div class="stats-filter-row stats-filter-row--quick">
      <div class="stats-quickgroup">
        <span class="stats-quickgroup-lbl">기간</span>
        <div class="stats-quickgroup-btns">
          ${_qBtn('올해',_thisYearStart,_today)}
          ${_qBtn('이번달',_thisMonthStart,_today)}
          ${_qBtn('최근3개월',_3mAgo,_today)}
          ${_qBtn('최근6개월',_6mAgo,_today)}
          ${_qBtn('전체','','')}
        </div>
      </div>
      <div class="stats-quickgroup">
        <span class="stats-quickgroup-lbl">🎯 최근N경기</span>
        <div class="stats-quickgroup-btns">
          ${_nBtn(0)}${_nBtn(30)}${_nBtn(100)}${_nBtn(300)}${_nBtn(500)}${_nBtn(1000)}
        </div>
      </div>
    </div>
    <div class="stats-filter-row stats-filter-row--badges">
      ${_filterBadges.map(txt=>`<span class="stats-filter-badge ${_isFiltered?'is-active':''}">${txt}</span>`).join('')}
      ${_statsLastN>0?`<span class="stats-filter-note">🎯 최근 ${_statsLastN}경기 기준 통계입니다</span>`:''}
    </div>
  </div>`;
  } // end if(_statsFilterOpen)
  h+=`</div>`;
  // 캐시 가능한 순수 탭 (선택 상태 없음): 데이터 변경 시에만 재계산
  const _CACHEABLE=['overview','records','streakhist','period','mismatch','univmatrix'];
  function _cached(sub, fn){
    if(!_CACHEABLE.includes(sub)) return fn();
    const c=_scGet(sub);
    return c || _scSet(sub, fn());
  }
  function _safeRender(fn, title){
    try{ return fn(); }
    catch(e){
      try{ console.error('[stats tab error]', title, e); }catch(_){}
      return `<div class="ssec"><div style="color:#dc2626;font-weight:900;margin-bottom:6px">${escHTML(title||'통계')} 렌더 오류</div><div style="font-family:ui-monospace,monospace;font-size:var(--fs-sm);white-space:pre-wrap;color:var(--gray-l)">${escHTML(String(e&&e.stack||e))}</div></div>`;
    }
  }

  if(window.statsSub==='overview')    h+=_safeRender(()=>_cached('overview', statsOverviewHTML), '종합');
  else if(window.statsSub==='tierRank')h+=_safeRender(statsTierRankHTML, '티어 랭킹');
  else if(window.statsSub==='levelRank')h+=_safeRender(statsLevelRankHTML, '레벨/등급 순위표');
  else if(window.statsSub==='starsystem'){
    if(_li){
      h+=_safeRender(statsStarSystemHTML, '스타시스템');
    }else{
      h+=`<div class="ssec"><p style="color:var(--gray-l);padding:30px;text-align:center">⭐ 스타시스템은 로그인 후 이용할 수 있습니다.</p></div>`;
    }
  }
  else if(window.statsSub==='elo')    h+=_safeRender(statsEloHTML, 'ELO 그래프');
  else if(window.statsSub==='growth') h+=_safeRender(statsGrowthHTML, '성장 곡선');
  else if(window.statsSub==='award')  h+=_safeRender(()=>_cached('award', statsAwardHTML), '이번 주/달 MVP');
  else if(window.statsSub==='records')h+=_safeRender(()=>_cached('records', statsRecordsHTML), '최다 기록');
  else if(window.statsSub==='radar')  h+=_safeRender(statsRadarHTML, '대학 레이더');
  else if(window.statsSub==='univcompare') h+=_safeRender(statsUnivCompareHTML, '대학비교');
  else if(window.statsSub==='period') h+=_safeRender(()=>_cached('period', statsPeriodAnalysisHTML), '주간/월간 분석');
  else if(window.statsSub==='mismatch')h+=_safeRender(()=>_cached('mismatch', statsMismatchHTML), '미스매치');
  else if(window.statsSub==='heatmap')  h+=_safeRender(()=>_cached('heatmap', statsHeatmapHTML), '활동 히트맵');
  else if(window.statsSub==='tierwin')  h+=_safeRender(()=>_cached('tierwin', statsTierWinHTML), '티어별 승률(개인)');
  else if(window.statsSub==='maprank')  h+=_safeRender(()=>_cached('maprank', statsMapRankHTML), '맵별 특화');
  else if(window.statsSub==='promosim'){
    if(typeof window.statsPromoSimHTML==='function'){
      h+=_safeRender(window.statsPromoSimHTML, '승급 시뮬레이션');
    }else{
      h+=`<div class="ssec"><div style="color:var(--gray-l);font-size:var(--fs-base)">승급 시뮬레이션을 불러오는 중...</div></div>`;
      try{
        (async()=>{
          try{
            if(typeof window._loadScriptOnce==='function'){
              await window._loadScriptOnce('js/stats-promo-sim-renderer.js?v=20260802-promosim20');
            }
            if(typeof render==='function') render(true);
          }catch(e){ try{ console.error('[lazy] promosim load fail', e); }catch(_){} }
        })();
      }catch(e){}
    }
  }
  else if(window.statsSub==='race')     h+=_safeRender(()=>`<div class="ssec">${typeof raceSummaryHTML==='function'?raceSummaryHTML():''}</div>`, '종족 승률');
  else if(window.statsSub==='univmatrix')h+=_safeRender(()=>_cached('univmatrix', statsUnivMatrixHTML), '대학 매트릭스');
  else if(window.statsSub==='racetrend')h+=_safeRender(statsRaceTrendHTML, '종족 트렌드');
  else if(window.statsSub==='csvexport')h+=_safeRender(statsCsvExportHTML, 'CSV 내보내기');
  else if(window.statsSub==='preport'){
    if(typeof window.statsPlayerReportHTML==='function'){
      h+=_safeRender(window.statsPlayerReportHTML, '스트리머 리포트');
    }else{
      h+=`<div class="ssec"><div style="color:var(--gray-l);font-size:var(--fs-base)">스트리머 리포트를 불러오는 중...</div></div>`;
      try{
        (async()=>{
          try{
            if(typeof window._loadScriptOnce==='function'){
              await window._loadScriptOnce('js/stats-player-report-data.js?v=20260802-mapfix3');
              await window._loadScriptOnce('js/stats-player-report-sections.js?v=20260730-split3');
              await window._loadScriptOnce('js/stats-player-report-entry.js?v=20260730-split3');
              await window._loadScriptOnce('js/stats-player-report-canvas.js?v=20260730-split3');
            }
            if(typeof render==='function') render(true);
          }catch(e){ try{ console.error('[lazy] preport load fail', e); }catch(_){} }
        })();
      }catch(e){}
    }
  }
  else if(window.statsSub==='sharecard')h+=_safeRender(statsShareCardHTML, '공유 카드');
  else if(window.statsSub==='killer')   h+=_safeRender(()=>_cached('killer', statsKillerHTML), '킬러/피해자');
  else if(window.statsSub==='seasonal') h+=_safeRender(()=>_cached('seasonal', statsSeasonalHTML), '요일/시즌 승률');
  else if(window.statsSub==='streakhist')h+=_safeRender(()=>_cached('streakhist', statsStreakHistHTML), '연속 기록 히스토리');
  else if(window.statsSub==='tiermatch') h+=_safeRender(()=>_cached('tiermatch', statsTierMatchHTML), '티어별 승률(팀전)');
  else if(window.statsSub==='univmatrix2')h+=_safeRender(()=>_cached('univmatrix2', statsUnivMatrix2HTML), '대학 매트릭스+');
  else if(window.statsSub==='playervs')  h+=_safeRender(statsPlayerVsHTML, '스트리머 비교');
  else if(window.statsSub==='univwinbar') h+=_safeRender(statsUnivWinBarHTML, '대학별 승률');
  else if(window.statsSub==='univstat')  h+=_safeRender(()=>`<div class="ssec">${rHistUnivStat()}</div>`, '대학별 기록');
  else if(window.statsSub==='univrank')  h+=_safeRender(()=>`<div class="ssec"><h4 style="margin-bottom:10px">🏛️ 대학별 포인트 순위</h4>${typeof rUnivBodyHTML==='function'?rUnivBodyHTML():''}</div>`, '대학별 포인트');
  h+=`</div>`;
  C.innerHTML=h;
  // 서브탭별 후처리
  if(window.statsSub==='elo')         initEloChart();
  else if(window.statsSub==='growth') initGrowthChart();
  else if(window.statsSub==='radar')  initRadarChart();
  else if(window.statsSub==='racetrend') initRaceTrendChart();
  else if(window.statsSub==='univwinbar') initUnivWinBarChart();
}

/* ─── 공통 유틸 ─── */
// 공통 유틸은 `stats-core-utils.js`로 분리
var _statsDateYmd = (typeof window._statsDateYmd==='function') ? window._statsDateYmd : (d=>'');
var _statsTodayYmd = (typeof window._statsTodayYmd==='function') ? window._statsTodayYmd : (()=>'');
var _statsCurrentWeekRange = (typeof window._statsCurrentWeekRange==='function') ? window._statsCurrentWeekRange : (()=>({from:'',to:''}));
var _statsCurrentMonthRange = (typeof window._statsCurrentMonthRange==='function') ? window._statsCurrentMonthRange : (()=>({from:'',to:''}));
var _statsInRange = (typeof window._statsInRange==='function') ? window._statsInRange : (()=>false);
var _statsAnalyzePeriod = (typeof window._statsAnalyzePeriod==='function') ? window._statsAnalyzePeriod : (()=>({label:'',from:'',to:'',totalMatches:0,totalGames:0,teamMatches:0,soloMatches:0,activeDays:0,bySource:[],topWinners:[],topPlayers:[],topTeams:[]}));
var statsPeriodAnalysisHTML = (typeof window.statsPeriodAnalysisHTML==='function')
  ? window.statsPeriodAnalysisHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:var(--fs-base)">기간 분석을 불러오지 못했습니다.</div></div>');
try{ window.renderShareCardByPlayer = renderShareCardByPlayer; }catch(e){}

// players 맵/히스토리/매치 필터 공통 유틸은 `stats-core-utils.js`로 분리

/* ══════════════════════════════════════
   🚀 티어 랭킹(선수) — 첨부 TXT 레이아웃 참고
   - 동일 티어 상대전만 집계
   - "일반(스폰)" + "중요경기" + "실전보너스" 형태로 분해 표시
══════════════════════════════════════ */
// 티어 랭킹 helper는 `stats-tier-rank-utils.js`로 분리
