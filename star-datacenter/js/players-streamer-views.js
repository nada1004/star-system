(function(){
  if(typeof window==='undefined' || window.__streamerMbResizeBound) return;
  window.__streamerMbResizeBound = true;
  let _lastMb = window.innerWidth<=768;
  let _t=null;
  window.addEventListener('resize', ()=>{
    clearTimeout(_t);
    _t=setTimeout(()=>{
      const nowMb = window.innerWidth<=768;
      if(nowMb!==_lastMb){
        _lastMb=nowMb;
        try{ if(typeof render==='function') render(); }catch(e){}
      }
    }, 150);
  }, {passive:true});
})();

// 스트리머 탭 리스트뷰(모바일): 행 아래 요약 정보(종족/승/패/포인트/ELO) 행을
// 기본 접힌 상태로 두고, 이름 옆 화살표를 탭했을 때만 펼치는 아코디언 방식.
// (항상 펼쳐두면 한 명당 실질 2줄을 차지해 화면 밀도가 떨어지고 스크롤이 길어지는 문제 개선)
function _toggleStreamerMobileInfo(btn){
  try{
    const row = btn.closest('tr');
    const infoRow = row && row.nextElementSibling;
    if(!infoRow || !infoRow.classList.contains('streamer-mobile-info-row')) return;
    const nowOpen = infoRow.classList.toggle('is-open');
    btn.classList.toggle('is-open', nowOpen);
    btn.setAttribute('aria-label', nowOpen?'상세 기록 접기':'상세 기록 펼치기');
  }catch(e){}
}
if(typeof window!=='undefined') window._toggleStreamerMobileInfo = _toggleStreamerMobileInfo;

function rTotal(C,T){
  T.innerText='🎬 전체 스타크래프트 스트리머 리스트';
  try{ _bindTotalDelegatedEvents(); }catch(e){}
  try{ _bindFocusPhoto2DragEvents(); }catch(e){}
  try{ if(typeof _b2EnsureMvpHistoryFresh==='function') _b2EnsureMvpHistoryFresh(true); }catch(e){}
  const _streamerTabDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_streamer_tab_design_mode')||'classic').trim(); return ['classic','glass','vivid','obsidian','aurora','blush','paper','mono','cute'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
  const _streamerTabLayoutMode = (()=>{ try{ const v=(localStorage.getItem('su_streamer_tab_layout_mode')||'default').trim(); return ['default','compact','cozy','showcase'].includes(v)?v:'default'; }catch(e){ return 'default'; } })();
  const _streamerTabUiMode = (()=>{ try{ const v=(localStorage.getItem('su_streamer_tab_ui_mode')||'standard').trim(); return ['standard','pill','minimal','photocard'].includes(v)?v:'standard'; }catch(e){ return 'standard'; } })();
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : null;
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_pl || !_getUnivs){
    const msg = (typeof players === 'undefined')
      ? '데이터 로딩 중...'
      : '스트리머 데이터를 불러올 수 없습니다.';
    C.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">${msg}</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>`;
    return;
  }
  try{
    if(!window.__streamer_hist_ready && typeof _rebuildAllPlayerHistoryCore==='function'){
      const hasMatchData = ((typeof miniM!=='undefined'&&miniM?miniM.length:0)
        + (typeof univM!=='undefined'&&univM?univM.length:0)
        + (typeof ckM!=='undefined'&&ckM?ckM.length:0)
        + (typeof proM!=='undefined'&&proM?proM.length:0)
        + (typeof indM!=='undefined'&&indM?indM.length:0)
        + (typeof gjM!=='undefined'&&gjM?gjM.length:0)
        + (typeof ttM!=='undefined'&&ttM?ttM.length:0)
        + (typeof comps!=='undefined'&&comps?comps.length:0)
        + (typeof tourneys!=='undefined'&&tourneys?tourneys.length:0)) > 0;
      const hasAnyHistory = _pl.some(p=>Array.isArray(p?.history) && p.history.length);
      if(hasMatchData && !hasAnyHistory){
        // 이름/UI 먼저 렌더 후 다음 프레임에 히스토리 재빌드 → 이름 즉시 표시
        window.__streamer_hist_ready = true;
        requestAnimationFrame(()=>{
          try{
            _rebuildAllPlayerHistoryCore();
            if(typeof render==='function') render();
          }catch(e){}
        });
        // 첫 렌더는 히스토리 없이 진행 (이름·티어 즉시 표시)
      }
    }
  }catch(e){}
  // 랭킹 스냅샷 업데이트 (하루 1회)
  if(typeof updateRankSnapshot === 'function') updateRankSnapshot();
  const raceOpts=['전체','T','Z','P','N'];
  const _showBulk=isLoggedIn&&_bulkEditMode;
  const _isMb = (typeof window!=='undefined' && window.innerWidth<=768);
  // [FIX] 리스트(테이블) 뷰의 대학헤더/구분줄 colspan은 실제 렌더되는 컬럼 수와 반드시 일치해야 함.
  // 모바일에서는 컬럼을 순위/티어/이름[/관리]만 렌더링하는데, 이 값이 데스크톱 컬럼 수(10~11)로
  // 고정되어 있으면 table-layout:fixed 폭 계산이 깨져 "이름" 컬럼이 극단적으로 좁아지고,
  // 그 안의 프로필 사진이 잘려 보이고 이름이 가려지는 문제가 발생함.
  const _ncols=_isMb ? (3+(isLoggedIn?1:0)+(_showBulk?1:0)) : ((isLoggedIn?11:10)+(_showBulk?1:0));
  const _viewLabel=totalViewMode==='gallery'?'카드형':(totalViewMode==='focus'?'상세형':(totalViewMode==='simple'?'심플형':'리스트형'));
  // [참고] p.hidden / p.hideFromBoard 는 이름과 달리 "현황판(board2)에서만" 숨기는 용도입니다
  // (cloud-board-render.js 숨김 버튼 문구: "현황판에서 숨김"). 그래서 스트리머탭(여기)에서는
  // 이 두 플래그를 의도적으로 무시하고 retired(은퇴) 여부만 걸러냅니다 — 실수로 지운 게 아닙니다.
  const _visiblePlayers = _pl.filter(p=>{
    if(!p || p.retired) return false;
    if(totalRaceFilter!=='전체' && p.race!==totalRaceFilter) return false;
    if(totalHideNoRecord && (Number(p.win||0)+Number(p.loss||0))<=0) return false;
    return true;
  });
  const _activeUnivCount = new Set(_visiblePlayers.map(p=>p.univ).filter(Boolean)).size;
  const _photoCount = _visiblePlayers.filter(p=>String(p.photo||'').trim()).length;
  const _roleCount = _visiblePlayers.filter(p=>p.role && MAIN_ROLES.includes(p.role)).length;
  const _liveCount = _visiblePlayers.filter(p=>_getStreamerActivityMeta(p).key==='hot').length;
  const _warmCount = _visiblePlayers.filter(p=>_getStreamerActivityMeta(p).key==='warm').length;
  const _hasRecordCount = _visiblePlayers.filter(p=>(Number(p?.win||0)+Number(p?.loss||0))>0).length;
  const _noRecordCount = Math.max(0, _visiblePlayers.length - _hasRecordCount);
  const _kpiBar = totalViewMode==='gallery'
    ? `<div class="streamer-kpi-grid">
        <article class="streamer-kpi-card">
          <div class="streamer-kpi-label">표시 스트리머</div>
          <div class="streamer-kpi-value">${_visiblePlayers.length}</div>
          <div class="streamer-kpi-sub">현재 필터 기준 표시 인원</div>
        </article>
        <article class="streamer-kpi-card">
          <div class="streamer-kpi-label">기록 보유</div>
          <div class="streamer-kpi-value" style="color:#2563eb">${_hasRecordCount}</div>
          <div class="streamer-kpi-sub">전적 있음 ${_hasRecordCount}명 · 전적 없음 ${_noRecordCount}명</div>
        </article>
        <article class="streamer-kpi-card">
          <div class="streamer-kpi-label">대학 분포</div>
          <div class="streamer-kpi-value" style="color:#2563eb">${_activeUnivCount}</div>
          <div class="streamer-kpi-sub">현재 조건에서 보이는 대학 수</div>
        </article>
        <article class="streamer-kpi-card">
          <div class="streamer-kpi-label">프로필 준비</div>
          <div class="streamer-kpi-value" style="color:#7c3aed">${_photoCount}</div>
          <div class="streamer-kpi-sub">사진 등록 ${_photoCount}명 · 직책자 ${_roleCount}명</div>
        </article>
      </div>`
    : '';
  // 뷰 전환(카드형/상세형/리스트/심플형) 버튼은 별도의 고정 세그먼트 컨트롤로 분리 —
  // 아래 필터바(가로 스크롤)에 섞여 있으면 모바일에서 원하는 뷰 버튼을 찾으려 계속 스크롤해야 하는 문제가 있었음
  const _viewSeg = `<div class="streamer-viewmode-seg" role="tablist" aria-label="스트리머 보기 방식">
    <button class="streamer-viewmode-btn ${totalViewMode==='gallery'?'on':''}" onclick="totalViewMode='gallery';try{localStorage.setItem('su_streamer_view_mode','gallery');}catch(e){};_bulkEditMode=false;render()" title="카드형 대시보드 보기"><span class="streamer-viewmode-ico">🪪</span><span class="streamer-viewmode-txt">카드형</span></button>
    <button class="streamer-viewmode-btn ${totalViewMode==='focus'?'on':''}" onclick="if(totalViewMode!=='focus')totalFocusPlayer='';totalViewMode='focus';try{localStorage.setItem('su_streamer_view_mode','focus');}catch(e){};_bulkEditMode=false;render()" title="좌측 목록 + 우측 상세 보기"><span class="streamer-viewmode-ico">🧾</span><span class="streamer-viewmode-txt">상세형</span></button>
    <button class="streamer-viewmode-btn ${totalViewMode==='table'?'on':''}" onclick="totalViewMode='table';try{localStorage.setItem('su_streamer_view_mode','table');}catch(e){};_bulkEditMode=false;render()" title="리스트 보기"><span class="streamer-viewmode-ico">☰</span><span class="streamer-viewmode-txt">리스트</span></button>
    <button class="streamer-viewmode-btn ${totalViewMode==='simple'?'on':''}" onclick="totalViewMode='simple';try{localStorage.setItem('su_streamer_view_mode','simple');}catch(e){};_bulkEditMode=false;render()" title="여백을 줄인 한 줄 미니멀 리스트"><span class="streamer-viewmode-ico">✨</span><span class="streamer-viewmode-txt">심플형</span></button>
  </div>`;
  // (모바일/태블릿) 검색창이 커서 버튼들이 2줄로 밀리는 문제 방지
  // - 한 줄 유지 + 가로 스크롤(드래그)로 접근
  let filterBar=`<div class="streamer-toolbar-card">
    ${_viewSeg}
    <div class="fbar utilbar utilbar--scroll" style="flex-wrap:nowrap;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    ${raceOpts.map(r=>`<button class="pill ${totalRaceFilter===r?'on':''}" data-race="${r}" onclick="totalRaceFilter='${r}';render()">${r==='전체'?'전체':RNAME[r]||r}</button>`).join('')}
    <span class="fbar-divider"></span>
    <input id="total-search" class="streamer-search" type="text" value="${(totalSearch||'').replace(/"/g,'&quot;')}" placeholder="🔍 이름/대학/티어/직책 + (테/저/프, 남/여) 검색..."
      oncompositionstart="window._tsComp=true"
      oncompositionend="window._tsComp=false;totalSearch=this.value;totalApplySearchFilter()"
      oninput="totalSearch=this.value;if(!window._tsComp)totalApplySearchFilter()"
      autocomplete="off" spellcheck="false">
    <button class="pill ${totalHideNoRecord?'on warn-on':''}" onclick="totalHideNoRecord=!totalHideNoRecord;render()">전적없음 숨김</button>
    ${totalViewMode==='table'?(isLoggedIn?`<span class="fbar-divider"></span><button class="pill action-btn ${_bulkEditMode?'on edit-on':''}" onclick="toggleBulkEditMode()">✏️ 일괄 수정</button>`:''):''}
    ${totalViewMode==='table'?(isLoggedIn?`<button class="pill action-btn" onclick="openMergePlayersModal()">🔀 병합</button>`:''):''}
    ${_showBulk&&totalViewMode==='table'?`<button class="pill ${_bulkEditSelected.size>0?'on':''}" onclick="clearBulkEditSelection()" style="${_bulkEditSelected.size>0?'background:#ef4444;border-color:#ef4444;color:#fff':''}">선택 초기화</button>
      <button id="bulk-edit-apply-btn" onclick="openBulkEditModal()" style="padding:4px 12px;border-radius:12px;border:1.5px solid #2563eb;background:#eff6ff;color:#1d4ed8;font-size:var(--fs-sm);font-weight:700;cursor:pointer;display:${_bulkEditSelected.size>0?'inline-flex':'none'};align-items:center;gap:4px">✏️ <span id="bulk-edit-cnt">${_bulkEditSelected.size}</span>명 수정</button>
      <input type="text" value="${(_bulkEditSearch||'').replace(/"/g,'&quot;')}" placeholder="선택 모드 내 검색..."
        oncompositionstart="window._tsComp2=true"
        oncompositionend="window._tsComp2=false;_bulkEditSearch=this.value;bulkApplySearchFilter()"
        oninput="_bulkEditSearch=this.value;if(!window._tsComp2)bulkApplySearchFilter()"
        autocomplete="off" spellcheck="false"
        class="streamer-search" style="min-width:170px">`:''}
  </div></div>`;
  const _heroHtml = (desc)=>`<section class="streamer-hero">
        <div class="streamer-hero-copy">
          <div class="streamer-hero-kicker">Streamer Directory</div>
          <div class="streamer-hero-title">🎬 스트리머 탭</div>
          <div class="streamer-hero-desc">${desc}</div>
        </div>
        <div class="streamer-hero-badges">
          <span class="streamer-hero-badge">${_viewLabel}</span>
          <span class="streamer-hero-badge">대학 ${_activeUnivCount}곳</span>
          <span class="streamer-hero-badge">총 ${_visiblePlayers.length}명</span>
        </div>
      </section>`;
  const _quickRail = `<div class="streamer-quickrail">
      <article class="streamer-quickstat">
        <div class="streamer-quickstat-label">표시 인원</div>
        <div class="streamer-quickstat-value">${_visiblePlayers.length}</div>
        <div class="streamer-quickstat-sub">필터 기준 표시 수</div>
      </article>
      <article class="streamer-quickstat">
        <div class="streamer-quickstat-label">대학 분포</div>
        <div class="streamer-quickstat-value">${_activeUnivCount}</div>
        <div class="streamer-quickstat-sub">보이는 대학 수</div>
      </article>
      <article class="streamer-quickstat">
        <div class="streamer-quickstat-label">활동 상태</div>
        <div class="streamer-quickstat-value">${_liveCount + _warmCount}</div>
        <div class="streamer-quickstat-sub">활성 ${_liveCount} · 주목 ${_warmCount}</div>
      </article>
      <article class="streamer-quickstat">
        <div class="streamer-quickstat-label">프로필 준비</div>
        <div class="streamer-quickstat-value">${_photoCount}</div>
        <div class="streamer-quickstat-sub">사진 ${_photoCount} · 직책 ${_roleCount}</div>
      </article>
    </div>`;
  const _renderTopChrome = (desc, includeKpi)=>{
    const hero = _heroHtml(desc);
    if(_streamerTabLayoutMode==='compact'){
      return `<div class="streamer-topgrid streamer-topgrid--compact">
        <div class="streamer-topgrid-main">
          ${filterBar}
          ${_quickRail}
        </div>
        <div class="streamer-topgrid-side">${hero}</div>
      </div>`;
    }
    if(_streamerTabLayoutMode==='cozy'){
      return `<div class="streamer-topstack streamer-topstack--cozy">
        ${hero}
        <div class="streamer-topstack-body">
          ${_quickRail}
          ${filterBar}
          ${includeKpi?_kpiBar:''}
        </div>
      </div>`;
    }
    if(_streamerTabLayoutMode==='showcase'){
      return `<div class="streamer-showcase-shell">
        ${hero}
        <div class="streamer-showcase-rail">
          ${_quickRail}
        </div>
        ${filterBar}
        ${includeKpi?_kpiBar:''}
      </div>`;
    }
    return `${hero}${includeKpi?_kpiBar:''}${filterBar}`;
  };

    let tableHTML=_isMb
      ? `<div class="streamer-content-card"><div class="streamer-table-wrap"><table class="streamer-table streamer-table-mb"><colgroup>
    ${_showBulk?'<col style="width:30px">':''}
    <col class="streamer-col-rank" style="width:30px"><col class="streamer-col-tier" style="width:42px"><col class="streamer-col-name">
    ${isLoggedIn?'<col style="width:44px">':''}
  </colgroup><thead><tr>
    ${_showBulk?`<th style="text-align:center;padding:8px 2px"><input type="checkbox" id="bulk-check-all" onchange="bulkEditToggleAll(this.checked)" style="cursor:pointer"></th>`:''}
    <th style="text-align:center;white-space:nowrap;padding:8px 2px">순위</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 4px">티어</th>
    <th style="text-align:left;padding:8px 8px">스트리머</th>
    ${isLoggedIn?'<th class="no-export" style="text-align:center;white-space:nowrap;padding:8px 4px">관리</th>':''}
  </tr></thead><tbody>`
      : `<div class="streamer-content-card"><div class="streamer-table-wrap"><table class="streamer-table"><colgroup>
    ${_showBulk?'<col style="width:36px">':''}
    <col class="streamer-col-rank" style="width:52px"><col class="streamer-col-tier" style="width:80px"><col class="streamer-col-race col-hide-mobile" style="width:60px"><col class="streamer-col-name" style="width:220px"><col class="col-hide-mobile" style="width:50px">
    <col class="col-hide-mobile" style="width:52px"><col class="streamer-col-wr" style="width:52px">
    <col class="col-hide-mobile" style="width:70px"><col class="col-hide-mobile" style="width:80px"><col class="col-hide-mobile" style="width:60px">
    ${isLoggedIn?'<col style="width:70px">':''}
  </colgroup><thead><tr>
    ${_showBulk?`<th style="text-align:center;padding:8px 4px"><input type="checkbox" id="bulk-check-all" onchange="bulkEditToggleAll(this.checked)" style="cursor:pointer"></th>`:''}
    <th style="text-align:center;white-space:nowrap;padding:8px 6px">순위</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">티어</th>
    <th class="streamer-th-race col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 8px">종족</th>
    <th style="text-align:left;padding:8px 12px">스트리머</th>
    <th class="col-hide-mobile num" style="text-align:right;white-space:nowrap;padding:8px 16px 8px 10px">승</th>
    <th class="col-hide-mobile num" style="text-align:right;white-space:nowrap;padding:8px 16px 8px 10px">패</th>
    <th class="streamer-th-wr num" style="text-align:right;white-space:nowrap;padding:8px 16px 8px 10px">승률</th>
    <th class="col-hide-mobile num" style="text-align:right;white-space:nowrap;padding:8px 16px 8px 10px">포인트</th>
    <th class="col-hide-mobile num" style="text-align:right;white-space:nowrap;padding:8px 16px 8px 10px">ELO</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 6px">활동</th>
    ${isLoggedIn?'<th class="no-export" style="text-align:center;white-space:nowrap;padding:8px 10px">관리</th>':''}
  </tr></thead><tbody>`;


  // 전체 순위 맵 (points 기준)
  const _allRanked = [..._pl].filter(p=>!p.retired).sort((a,b)=>(b.points||0)-(a.points||0)||(b.win||0)-(a.win||0));
  const _rankMap = {};
  _allRanked.forEach((p,i) => { _rankMap[p.name] = i+1; });

  // 갤러리 뷰 분기
  if(totalViewMode==='gallery'){
    C.innerHTML=`<div class="streamer-shell" data-st-mode="${_streamerTabDesignMode}" data-st-layout="${_streamerTabLayoutMode}" data-st-ui="${_streamerTabUiMode}" data-st-view="${totalViewMode}">
      ${_renderTopChrome('카드형 대시보드 중심으로 스트리머를 정리해 사진, 대학, 티어, 활동 상태와 핵심 수치를 한 번에 읽기 쉽게 구성했습니다.', true)}
      <div class="streamer-content-card">${_buildGalleryView(_rankMap)}</div>
    </div>`;
    _syncTpSelectedCards();
    injectUnivIcons(C);
    requestAnimationFrame(()=>injectUnivIcons(C));
    totalApplySearchFilter();
    const si=C.querySelector('#total-search');
    if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
    return;
  }
  if(totalViewMode==='focus'){
    C.innerHTML=`<div class="streamer-shell" data-st-mode="${_streamerTabDesignMode}" data-st-layout="${_streamerTabLayoutMode}" data-st-ui="${_streamerTabUiMode}" data-st-view="${totalViewMode}">
      ${_renderTopChrome('상세형은 왼쪽 목록에서 스트리머를 고르고 오른쪽에서 프로필과 핵심 수치를 크게 보는 방식입니다.', false)}
      ${_buildFocusView(_rankMap)}
    </div>`;
    injectUnivIcons(C);
    requestAnimationFrame(()=>injectUnivIcons(C));
    totalApplySearchFilter();
    const si=C.querySelector('#total-search');
    if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
    return;
  }
  if(totalViewMode==='simple'){
    C.innerHTML=`<div class="streamer-shell" data-st-mode="${_streamerTabDesignMode}" data-st-layout="${_streamerTabLayoutMode}" data-st-ui="${_streamerTabUiMode}" data-st-view="${totalViewMode}">
      ${_renderTopChrome('심플형은 불필요한 여백과 장식을 덜어내고 순위·이름·티어·승률만 한 줄로 빠르게 훑어볼 수 있도록 구성했습니다.', false)}
      <div class="streamer-content-card">${_buildSimpleView(_rankMap)}</div>
    </div>`;
    injectUnivIcons(C);
    requestAnimationFrame(()=>injectUnivIcons(C));
    totalApplySearchFilter();
    const si=C.querySelector('#total-search');
    if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
    return;
  }

  let totalShown=0;
  let _rowIdx=0;
  const _visiblePhotoUrls = [];
  const _univTotalMap = new Map();
  const _univScMap = new Map();
  for(const p of _pl){
    if(!p) continue;
    const u = p.univ;
    if(!u) continue;
    _univTotalMap.set(u, (_univTotalMap.get(u)||0) + 1);
    const arr = _univScMap.get(u);
    if(arr) arr.push(p);
    else _univScMap.set(u, [p]);
  }
  
  // University section
  const _gFallbackTextPos = localStorage.getItem('su_univ_header_text_pos') || 'right';
  const _gFallbackGradMode = localStorage.getItem('su_univ_header_gradient') || 'left-to-right';
  const _gFallbackGradLen = localStorage.getItem('su_univ_header_gradient_length') || '70';
  const _gFallbackGradColor = localStorage.getItem('su_univ_header_gradient_color') || '#ffffff';
  _getUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    const _isHiddenUniv=isLoggedIn&&u.hidden;
    let up=_univScMap.get(u.name) || [];
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalHideNoRecord) up=up.filter(p=>(Number(p.win||0)+Number(p.loss||0))>0);
    if(!up.length)return;
    totalShown+=up.length;
    const _univTotal=_univTotalMap.get(u.name) || 0; // 은퇴 포함 전체 인원
    // 대학별 헤더 배경 설정 적용
    const _hdrBgImg = u.streamerHeaderBgImg || '';
    const _hdrBgSize = u.streamerHeaderBgSize || 'cover';
    const _hdrBgPos = u.streamerHeaderBgPos || 'center center';
    const _hdrBgOpacity = Math.max(0, Math.min(100, parseInt(u.streamerHeaderBgOpacity, 10) || 30)) / 100;
    const _hdrGradient = u.streamerHeaderGradient || '';
    const _hdrText = u.streamerHeaderText || '';
    const _hdrTextSize = u.streamerHeaderTextSize || '12';
    const _hdrTextColor = u.streamerHeaderTextColor || 'rgba(255,255,255,0.8)';
    const _hdrTextPos = u.streamerHeaderTextPos || _gFallbackTextPos;
    // 그라데이션 스타일 결정
    let _gradientStyle = '';
    if (_hdrGradient || (!_hdrBgImg && !_hdrGradient)) {
      const gMode = _hdrGradient || _gFallbackGradMode;
      // 대학별 설정 우선, 없으면 전역 설정 사용
      const gLen = Math.max(20, Math.min(100, parseInt(u.streamerHeaderGradientLen || _gFallbackGradLen, 10) || 70));
      const gColorRaw = u.streamerHeaderGradientColor || _gFallbackGradColor;
      const gColor = (gColorRaw && gColorRaw !== '#ffffff') ? gColorRaw : u.color;
      const gMix = `${gColor} ${gLen}%, transparent`;
      switch(gMode){
        case 'solid':
          _gradientStyle = u.color;
          break;
        case 'left-to-right':
          _gradientStyle = `linear-gradient(90deg, ${u.color}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'left-to-both':
          _gradientStyle = `linear-gradient(90deg, ${u.color} 0%, ${u.color} ${Math.round(gLen/2)}%, color-mix(in srgb, ${u.color} ${gLen}%, transparent) 100%)`;
          break;
        case 'top-to-bottom':
          _gradientStyle = `linear-gradient(180deg, ${u.color}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'both-to-center':
          _gradientStyle = `linear-gradient(90deg, color-mix(in srgb, ${u.color} ${Math.round(100-gLen)}%, transparent) 0%, ${u.color} 50%, color-mix(in srgb, ${u.color} ${Math.round(100-gLen)}%, transparent) 100%)`;
          break;
        default:
          _gradientStyle = `linear-gradient(90deg, ${u.color}, color-mix(in srgb, ${gMix}))`;
      }
    }
    // 배경 이미지가 있으면 그라데이션과 함께 적용
    let _tdBgStyle = _gradientStyle || u.color;
    let _tdBgSize = 'auto';
    let _tdBgPos = 'center center';
    if (_hdrBgImg) {
      // 이미지가 있으면 그라데이션 위에 이미지 오버레이
      _tdBgStyle = `linear-gradient(rgba(0,0,0,${1 - _hdrBgOpacity}), rgba(0,0,0,${1 - _hdrBgOpacity})), url('${_hdrBgImg.replace(/'/g, "\\'")}'), ${_gradientStyle || u.color}`;
      _tdBgSize = `${_hdrBgSize}, ${_hdrBgSize}, auto`;
      _tdBgPos = `${_hdrBgPos}, ${_hdrBgPos}, center center`;
    }
    // 커스텀 텍스트 스타일
    const _textStyle = _hdrText ? `position:relative;` : '';
    // 텍스트 위치에 따른 스타일 결정
    let _textHtml = '';
    if (_hdrText) {
      const _textBaseStyle = `font-size:${_hdrTextSize}px;color:${_hdrTextColor};font-weight:900;white-space:nowrap;`;
      if (_hdrTextPos === 'left') {
        _textHtml = `<span style="${_textBaseStyle}margin-right:8px;">${_hdrText}</span>`;
      } else if (_hdrTextPos === 'center') {
        _textHtml = `<span style="${_textBaseStyle}position:absolute;left:50%;transform:translateX(-50%);">${_hdrText}</span>`;
      } else {
        // right (default)
        _textHtml = `<span style="${_textBaseStyle}margin-left:auto;">${_hdrText}</span>`;
      }
    }
    tableHTML+=`<tr class="ugrp streamer-univ-head" data-univ-header="${u.name}" style="--c:${u.color};${_isHiddenUniv?'opacity:.55;':''}"><td colspan="${_ncols}" style="${_textStyle}">
      <div class="streamer-univ-banner" style="background:${_tdBgStyle};background-size:${_tdBgSize};background-position:${_tdBgPos};background-repeat:no-repeat;">
        <div class="streamer-univ-meta">
          ${_hdrTextPos === 'left' ? _textHtml : ''}
          <span class="clickable-univ streamer-univ-badge" onclick="openUnivModal('${escJS(u.name)}')" style="background:${u.color}">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','26px'):'26px'))}${u.name}</span>
          ${u.dissolved?`<span style="font-size:10px;background:rgba(0,0,0,.35);color:#fca5a5;border-radius:4px;padding:1px 6px;font-weight:700">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''}
          ${_isHiddenUniv?`<span style="font-size:10px;background:rgba(0,0,0,.4);border-radius:4px;padding:1px 6px;font-weight:700">🚫 방문자 숨김</span>`:''}
        </div>
        ${_hdrTextPos === 'center' ? _textHtml : ''}
        <span class="streamer-univ-count">${_univTotal}명</span>
        ${_hdrTextPos === 'right' ? _textHtml : ''}
      </div>
    </td></tr>`;
    // 스트리머 탭: 항상 직책→티어→포인트 순 (현황판 수동 순서 무시)
    const sorted = [...up].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||((b.points||0)-(a.points||0)));
    // 직책자와 일반 선수 분리
    const _rolePl = sorted.filter(p=>p.role&&MAIN_ROLES.includes(p.role));
    const _normalPl = sorted.filter(p=>!p.role||!MAIN_ROLES.includes(p.role));
    const _displayList = _rolePl.length ? [..._rolePl, null, ..._normalPl] : _normalPl; // null = 구분자
    let lt='';
    let _inRoleSection = _rolePl.length > 0;
    if(_inRoleSection) tableHTML+=`<tr class="tgrp streamer-subgrp" style="--c:${u.color||'#6366f1'}"><td colspan="${_ncols}"><span class="streamer-subgrp-chip" style="background:${(u.color||'#6366f1')}22;color:${u.color||'#6366f1'};border-color:${(u.color||'#6366f1')}33">👑 직책자 (${_rolePl.length}명)</span></td></tr>`;
    _displayList.forEach(p=>{
      if(p===null){
        // 구분자 - 직책 섹션 끝, 일반 선수 시작
        _inRoleSection=false; lt='';
        if(_normalPl.length) tableHTML+=`<tr class="tgrp streamer-subgrp" style="--c:${u.color||'#6366f1'}"><td colspan="${_ncols}"><span class="streamer-subgrp-chip">▷ 일반 스트리머 (${_normalPl.length}명)</span></td></tr>`;
        return;
      }
      if(!_inRoleSection && (p.tier||'미정')!==lt){lt=p.tier||'미정';tableHTML+=`<tr class="tgrp streamer-subgrp"><td colspan="${_ncols}"><span class="streamer-subgrp-chip">▷ ${getTierLabel(p.tier||'미정')}</span></td></tr>`;}
      const win = Number(p.win||0);
      const loss = Number(p.loss||0);
      const games = win + loss;
      const points = Number(p.points||0);
      const wr=games?Math.round(win/games*100):0;
      const elo = Number(p.elo||ELO_DEFAULT);
      const _pRank = _rankMap[p.name];
      const _pChange = typeof getRankChangeBadge==='function' ? getRankChangeBadge(p.name, _pRank) : '';
      const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const _q = `${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      const _metaHTML = `${genderIcon(p.gender)}${getStatusIconHTML(p.name)}`;
      const _metaSpan = _metaHTML ? `<span class="streamer-mini-meta">${_metaHTML}</span>` : '';
      if(typeof p.photo==='string' && p.photo.trim()) _visiblePhotoUrls.push(p.photo.trim());
      _rowIdx++;
      // 처음 14행(대략 첫 화면)은 즉시+우선 로드, 그 이후도 즉시 로드하되 우선순위만 낮춤(loading=lazy 금지: 스크롤해야 로드되어 늦게 뜨는 문제 방지)
      const _imgLoadAttr = _rowIdx<=14 ? 'loading="eager" fetchpriority="high"' : 'loading="eager" fetchpriority="low"';
      tableHTML+=_isMb ? `<tr class="streamer-row ${_pRank===1?'top1':_pRank===2?'top2':_pRank===3?'top3':''} ${p.inactive?'inactive':''} ${p.retired?'retired':''}" data-player-row="1" data-univ="${u.name}" data-q="${_q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="cursor:pointer">
        ${_showBulk?`<td style="text-align:center;padding:7px 2px"><input type="checkbox" data-player-name="${_pSafe}" ${_bulkEditSelected.has(p.name)?'checked':''} onclick="event.stopPropagation()" onchange="toggleBulkEditPlayer('${_pSafe}',this.checked)" style="cursor:pointer;width:15px;height:15px"></td>`:''}
        <td style="text-align:center;white-space:nowrap;padding:5px 2px">
          <div class="streamer-rank-box">
          <div style="font-size:10.5px;font-weight:900;color:var(--text2);line-height:1.2">${_pRank||'-'}</div>
          <div>${_pChange}</div>
          </div>
        </td>
        <td class="streamer-td-tier" style="text-align:center;white-space:normal;padding:7px 4px">${getTierBadge(p.tier)}</td>
        <td style="text-align:left;padding:6px 8px">
          <span class="streamer-player-cell">
            ${p.photo?`<span class="streamer-avatar" data-tp-action="open-player" data-tp-player="${_pAttr}" title="스트리머 상세">${p.race||'?'}<img ${_imgLoadAttr} decoding="async" src="${toThumbUrl(p.photo,96)}" data-orig="${toHttpsUrl(p.photo)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="_thumbFallback(this)"></span>`:`<span class="streamer-avatar">${p.race||'?'}</span>`}
            <span class="streamer-name-stack">
              <span class="streamer-name-line">${p.role?`${getRoleBadgeHTML(p.role,'10px')} `:''}<span class="clickable-name streamer-name-link" data-tp-action="open-player" data-tp-player="${_pAttr}">${p.name}</span>${p.retired?'<span style="font-size:10px;background:#e2e8f0;color:#64748b;border-radius:4px;padding:1px 5px;font-weight:700">🎗️ 은퇴</span>':''}${p.inactive?'<span style="font-size:10px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 5px;font-weight:700">⏸️ 휴학</span>':''}</span>
              ${_metaSpan}
            </span>
            <button type="button" class="streamer-mobile-info-toggle" aria-label="상세 기록 펼치기" onclick="event.stopPropagation();_toggleStreamerMobileInfo(this)">▾</button>
          </span>
        </td>
        ${isLoggedIn?`<td class="no-export" style="text-align:center;white-space:nowrap;padding:7px 4px">${adminBtn(`<button class="btn btn-w btn-xs" onclick="event.stopPropagation();openEPFromModal('${_pSafe}')">✏️</button>`)}</td>`:''}
      </tr>` : `<tr class="streamer-row ${_rowIdx%2===0?'zebra':''} ${_pRank===1?'top1':_pRank===2?'top2':_pRank===3?'top3':''} ${p.inactive?'inactive':''} ${p.retired?'retired':''}" data-player-row="1" data-univ="${u.name}" data-q="${_q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="cursor:pointer">
        ${_showBulk?`<td style="text-align:center;padding:7px 4px"><input type="checkbox" data-player-name="${_pSafe}" ${_bulkEditSelected.has(p.name)?'checked':''} onclick="event.stopPropagation()" onchange="toggleBulkEditPlayer('${_pSafe}',this.checked)" style="cursor:pointer;width:15px;height:15px"></td>`:''}
        <td style="text-align:center;white-space:nowrap;padding:5px 4px">
          <div class="streamer-rank-box">
          <div style="font-size:var(--fs-caption);font-weight:900;color:var(--text2);line-height:1.2">${_pRank||'-'}</div>
          <div>${_pChange}</div>
          </div>
        </td>
        <td class="streamer-td-tier" style="text-align:center;white-space:nowrap;padding:7px 10px">${getTierBadge(p.tier)}</td>
        <td class="streamer-td-race col-hide-mobile" style="text-align:center;white-space:nowrap;padding:7px 8px"><span class="rbadge r${p.race}" style="font-size:var(--fs-caption)">${p.race||'?'}</span></td>
        <td style="text-align:left;padding:6px 12px;white-space:nowrap">
          <span class="streamer-player-cell">
            ${p.photo?`<span class="streamer-avatar" data-tp-action="open-player" data-tp-player="${_pAttr}" title="스트리머 상세">${p.race||'?'}<img ${_imgLoadAttr} decoding="async" src="${toThumbUrl(p.photo,72)}" data-orig="${toHttpsUrl(p.photo)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="_thumbFallback(this)"></span>`:`<span class="streamer-avatar">${p.race||'?'}</span>`}
            <span class="streamer-name-stack">
              <span class="streamer-name-line">${p.role?`${getRoleBadgeHTML(p.role,'10px')} `:''}<span class="clickable-name streamer-name-link" data-tp-action="open-player" data-tp-player="${_pAttr}">${p.name}</span>${p.retired?'<span style="font-size:10px;background:#e2e8f0;color:#64748b;border-radius:4px;padding:1px 5px;font-weight:700">🎗️ 은퇴</span>':''}${p.inactive?'<span style="font-size:10px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 5px;font-weight:700">⏸️ 휴학</span>':''}</span>
              ${_metaSpan}
            </span>
          </span>
        </td>
        <td class="col-hide-mobile wt streamer-stat-num" style="text-align:right;white-space:nowrap;padding:7px 16px 7px 10px;font-weight:900;color:var(--text1);cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">${win}</td>
        <td class="col-hide-mobile lt streamer-stat-num" style="text-align:right;white-space:nowrap;padding:7px 16px 7px 10px;font-weight:900;color:var(--text1);cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">${loss}</td>
        <td class="streamer-td-wr" style="text-align:right;white-space:nowrap;padding:7px 16px 7px 10px;font-weight:700;color:${games===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'};cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">
          <div class="streamer-wr-box" style="justify-content:flex-end">
          ${games?wr+'%':'-'}${games?`<span style="font-size:9px;color:var(--gray-l);font-weight:400">${games}전</span>`:''}
          </div>
        </td>
        <td class="col-hide-mobile ${pC(points)}" style="text-align:right;white-space:nowrap;padding:7px 16px 7px 10px;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base);cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">${pS(points)}</td>
        <td class="col-hide-mobile" style="text-align:right;white-space:nowrap;padding:7px 16px 7px 10px;cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}"><span class="streamer-elo-chip" style="color:${elo>=ELO_DEFAULT?'#2563eb':'#dc2626'}">${elo}</span></td>
        <td class="col-hide-mobile" style="text-align:center;padding:7px 4px"></td>
        ${isLoggedIn?`<td class="no-export" style="text-align:center;white-space:nowrap;padding:7px 8px">${adminBtn(`<button class="btn btn-w btn-xs" onclick="event.stopPropagation();openEPFromModal('${_pSafe}')">✏️ 수정</button>`)}</td>`:''}
      </tr>`;
      tableHTML+=`
      <tr class="streamer-mobile-info-row" style="cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">
        <td colspan="${_ncols}">
          <div class="streamer-mobile-stats" style="cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">
            <span class="sm-stat sm-stat-wr" style="color:${games===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}"><b>승률</b>${games?wr+'%':'-'}${games?` (${games}전)`:''}</span>
            <span class="sm-stat"><b>종족</b>${p.race||'?'}</span>
            <span class="sm-stat"><b>승</b>${win}</span>
            <span class="sm-stat"><b>패</b>${loss}</span>
            <span class="sm-stat ${pC(points)}"><b>포인트</b>${pS(points)}</span>
            <span class="sm-stat"><b>ELO</b>${elo}</span>
          </div>
        </td>
      </tr>`;
    });
  });
  if(totalShown===0){
    tableHTML+=`<tr><td colspan="${_ncols}"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div><div class="empty-state-desc">다른 검색어나 필터를 사용해보세요</div></div></td></tr>`;
  }
  tableHTML+=`</tbody></table></div></div>`;

  C.innerHTML = `<div class="streamer-shell" data-st-mode="${_streamerTabDesignMode}" data-st-layout="${_streamerTabLayoutMode}" data-st-ui="${_streamerTabUiMode}" data-st-view="${totalViewMode}">
    ${_renderTopChrome('대학별 구성을 유지하면서도 검색, 필터, 순위, 활동 상태를 더 보기 좋고 빠르게 파악할 수 있도록 정리했습니다.', false)}
    ${tableHTML}
  </div>`;
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_visiblePhotoUrls, 60, 96); }catch(e){}
  injectUnivIcons(C);
  requestAnimationFrame(()=>injectUnivIcons(C));
  totalApplySearchFilter();
  bulkApplySearchFilter();
  const si=C.querySelector('#total-search');
  if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
}

function _buildGalleryView(rankMap){
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : null;
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_pl || !_getUnivs){
    const msg = (typeof players === 'undefined')
      ? '데이터 로딩 중...'
      : '스트리머 데이터를 불러올 수 없습니다.';
    return `<div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">${msg}</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>`;
  }
  const RACE_CLR={T:'#2563eb',Z:'#7c3aed',P:'#c2410c',N:'#64748b'};
  let html='<div class="streamer-gallery-grid">';
  let anyShown=false;
  let _gRowIdx=0;
  const _galleryPhotoUrls = [];
  const _univScActiveMap = new Map();
  for(const p of _pl){
    if(!p || p.retired) continue;
    const u = p.univ;
    if(!u) continue;
    const arr = _univScActiveMap.get(u);
    if(arr) arr.push(p);
    else _univScActiveMap.set(u, [p]);
  }
  const _ggFallbackTextPos = localStorage.getItem('su_univ_header_text_pos') || 'right';
  const _ggFallbackGradMode = localStorage.getItem('su_univ_header_gradient') || 'left-to-right';
  const _ggFallbackGradLen = localStorage.getItem('su_univ_header_gradient_length') || '70';
  const _ggFallbackGradColor = localStorage.getItem('su_univ_header_gradient_color') || '#ffffff';
  _getUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    let up=_univScActiveMap.get(u.name) || [];
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalHideNoRecord) up=up.filter(p=>(Number(p.win||0)+Number(p.loss||0))>0);
    if(!up.length) return;
    anyShown=true;
    const sorted=[...up].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
    // 대학 헤더: 대학별 설정 적용
    const _gHdrBgImg = u.streamerHeaderBgImg || '';
    const _gHdrBgSize = u.streamerHeaderBgSize || 'cover';
    const _gHdrBgPos = u.streamerHeaderBgPos || 'center center';
    const _gHdrBgOpacity = Math.max(0, Math.min(100, parseInt(u.streamerHeaderBgOpacity, 10) || 30)) / 100;
    const _gHdrGradient = u.streamerHeaderGradient || '';
    const _gHdrText = u.streamerHeaderText || '';
    const _gHdrTextSize = u.streamerHeaderTextSize || '12';
    const _gHdrTextColor = u.streamerHeaderTextColor || 'rgba(255,255,255,0.85)';
    const _gHdrTextPos = u.streamerHeaderTextPos || _ggFallbackTextPos;
    // 그라데이션 스타일 결정
    let _gGradientStyle = '';
    if (_gHdrGradient || (!_gHdrBgImg && !_gHdrGradient)) {
      const gMode = _gHdrGradient || _ggFallbackGradMode;
      // 대학별 설정 우선, 없으면 전역 설정 사용
      const gLen = Math.max(20, Math.min(100, parseInt(u.streamerHeaderGradientLen || _ggFallbackGradLen, 10) || 70));
      const gColorRaw = u.streamerHeaderGradientColor || _ggFallbackGradColor;
      const gColor = (gColorRaw && gColorRaw !== '#ffffff') ? gColorRaw : (u.color || '#6366f1');
      const gMix = `${gColor} ${gLen}%, transparent`;
      switch(gMode){
        case 'solid':
          _gGradientStyle = u.color || '#6366f1';
          break;
        case 'left-to-right':
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'left-to-both':
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'} 0%, ${u.color || '#6366f1'} ${Math.round(gLen/2)}%, color-mix(in srgb, ${u.color || '#6366f1'} ${gLen}%, transparent) 100%)`;
          break;
        case 'top-to-bottom':
          _gGradientStyle = `linear-gradient(180deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'both-to-center':
          _gGradientStyle = `linear-gradient(90deg, color-mix(in srgb, ${u.color || '#6366f1'} ${Math.round(100-gLen)}%, transparent) 0%, ${u.color || '#6366f1'} 50%, color-mix(in srgb, ${u.color || '#6366f1'} ${Math.round(100-gLen)}%, transparent) 100%)`;
          break;
        default:
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
      }
    }
    // 배경 이미지가 있으면 그라데이션과 함께 적용
    let _gFinalBgStyle = _gGradientStyle || (u.color || '#6366f1');
    let _gFinalBgSize = 'auto';
    let _gFinalBgPos = 'center center';
    if (_gHdrBgImg) {
      // 이미지가 있으면 그라데이션 위에 이미지 오버레이 (오버레이 블렌딩 사용)
      _gFinalBgStyle = `linear-gradient(rgba(0,0,0,${1 - _gHdrBgOpacity}), rgba(0,0,0,${1 - _gHdrBgOpacity})), url('${_gHdrBgImg.replace(/'/g, "\\'")}'), ${_gGradientStyle || (u.color || '#6366f1')}`;
      _gFinalBgSize = `${_gHdrBgSize}, ${_gHdrBgSize}, auto`;
      _gFinalBgPos = `${_gHdrBgPos}, ${_gHdrBgPos}, center center`;
    }
    // 텍스트 위치에 따른 스타일 결정
    let _gTextHtml = '';
    if (_gHdrText) {
      const _gTextBaseStyle = `font-size:${_gHdrTextSize}px;color:${_gHdrTextColor};font-weight:900;white-space:nowrap;`;
      if (_gHdrTextPos === 'left') {
        _gTextHtml = `<span style="${_gTextBaseStyle}margin-right:8px;">${_gHdrText}</span>`;
      } else if (_gHdrTextPos === 'center') {
        _gTextHtml = `<span style="${_gTextBaseStyle}position:absolute;left:50%;transform:translateX(-50%);">${_gHdrText}</span>`;
      } else {
        // right (default)
        _gTextHtml = `<span style="${_gTextBaseStyle}margin-left:auto;">${_gHdrText}</span>`;
      }
    }
    const _uSafe=(typeof escJS==='function') ? escJS(u.name||'') : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    html+=`<div class="streamer-gallery-head" data-gallery-univ-header="${u.name}" style="background:${_gFinalBgStyle};background-size:${_gFinalBgSize};background-position:${_gFinalBgPos};background-repeat:no-repeat;margin-top:6px;">
      ${_gHdrTextPos === 'left' ? _gTextHtml : ''}
      <span class="ubadge streamer-gallery-univ clickable-univ" data-icon-done="1" onclick="event.stopPropagation();openUnivModal('${_uSafe}')" style="color:#fff;display:inline-flex;align-items:center;gap:4px;font-size:var(--fs-sm)">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','20px'):'20px'))}${u.name}</span>
      ${_gHdrTextPos === 'center' ? _gTextHtml : ''}
      <span style="font-size:var(--fs-caption);color:rgba(255,255,255,.85);font-weight:700;position:relative;z-index:1">${up.length}명</span>
      ${_gHdrTextPos === 'right' ? _gTextHtml : ''}
    </div>`;
    sorted.forEach(p=>{
      const win = Number(p.win||0);
      const loss = Number(p.loss||0);
      const games = win + loss;
      const wr=games?Math.round(win/games*100):null;
      const points = Number(p.points||0);
      const elo = Number(p.elo||ELO_DEFAULT);
      const clr=RACE_CLR[p.race]||'#64748b';
      const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const q=`${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      const _uSafe=(typeof escJS==='function') ? escJS(u.name||'') : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const actMeta = _getStreamerActivityMeta(p);
      let _gMvpStats=null;
      try{ _gMvpStats = (typeof _b2GetPlayerMvpStats==='function') ? _b2GetPlayerMvpStats(p.name) : null; }catch(e){}
      const _gHasMvp = !!(_gMvpStats && (_gMvpStats.weekCount||_gMvpStats.monthCount));
      const photoMap=(window.playerPhotos&&typeof window.playerPhotos==='object')?window.playerPhotos:{};
      const photoSrcRaw=(typeof p.photo==='string'&&p.photo.trim())?p.photo.trim():String(photoMap[p.name]||'').trim();
      const _posUse=(p.photoPosUse!==false);
      const _posX=Number(p.photoPosX), _posY=Number(p.photoPosY);
      const photoPos=(_posUse && Number.isFinite(_posX) && Number.isFinite(_posY)) ? `${_posX}% ${_posY}%` : 'top center';
      if(photoSrcRaw) _galleryPhotoUrls.push(photoSrcRaw);
      _gRowIdx++;
      const _gImgLoadAttr = _gRowIdx<=8 ? 'loading="eager" fetchpriority="high"' : 'loading="eager" fetchpriority="low"';
      html+=`<div class="streamer-gallery-card ${p.inactive?'inactive':''} ${p.retired?'retired':''} ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-player-card="1" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}"
        data-tp-action="open-player" data-tp-player="${_pAttr}"
        style="--card-accent:${clr};background:#0b1120;border-color:rgba(255,255,255,.14);backdrop-filter:blur(1px)"
        onmouseenter="try{if(typeof _prewarmPlayerModalImages==='function'){var _pp=window.players&&window.players.find(function(x){return x.name==='${_pSafe}'});if(_pp)_prewarmPlayerModalImages(_pp);}}catch(e){}">
        ${photoSrcRaw
          ? `<img ${_gImgLoadAttr} decoding="async" src="${toScaledUrl(photoSrcRaw,340)}" data-orig="${toHttpsUrl(photoSrcRaw)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${photoPos}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.parentNode.querySelector('.gc-placeholder').style.display='flex';this.style.display='none';}">`
          : ''}
        <div class="gc-placeholder" style="position:absolute;inset:0;display:${photoSrcRaw?'none':'flex'};align-items:center;justify-content:center;font-size:36px;font-weight:900;color:${clr};background:linear-gradient(160deg,${clr}28 0%,${clr}10 100%)">${p.race||'?'}</div>
        ${photoSrcRaw ? '' : '<div class="streamer-gallery-overlay"></div>'}
        <div class="streamer-gallery-bottom streamer-gallery-bottom--compact">
          <div class="streamer-gallery-topline">
            <div class="streamer-gallery-name" title="${p.name}">${p.name}${genderIcon(p.gender)}</div>
            ${getStatusIconHTML(p.name)}
          </div>
          <div class="streamer-gallery-brief">
            ${_gHasMvp ? `<span class="sg-pill" style="background:linear-gradient(135deg,#fef9c3,#fde68a);border-color:#fcd34d;color:#92400e;font-weight:900">🏆 MVP</span>` : ''}
            ${p.role ? `<span class="sg-pill">${p.role}</span>` : ''}
            <span class="sg-pill">${p.tier||'?'}티어</span>
            <span class="sg-pill">${p.race||'?'}</span>
            <span class="sg-pill" ${u.name&&u.name!=='무소속'?`onclick="event.stopPropagation();openUnivModal('${_uSafe}')"`:''}>${u.name || '무소속'}</span>
            ${p.inactive?'<span class="sg-pill" style="background:rgba(249,115,22,.18);border-color:rgba(249,115,22,.26)">휴학</span>':''}
            ${p.retired?'<span class="sg-pill" style="background:rgba(148,163,184,.18);border-color:rgba(148,163,184,.26)">은퇴</span>':''}
          </div>
          <div class="streamer-gallery-metrics">
            <span class="sg-metric">전적 ${games ? `${win}-${loss}` : '-'}</span>
            <span class="sg-dot">·</span>
            <span class="sg-metric">P ${pS(points)}</span>
            <span class="sg-dot">·</span>
            <span class="sg-metric">ELO ${elo}</span>
            ${wr==null?'':`<span class="sg-dot">·</span><span class="sg-metric" style="color:${wr>=50?'#86efac':'#fecaca'}">${wr}%</span>`}
          </div>
        </div>
      </div>`;
    });
  });
  if(!anyShown) html+=`<div style="grid-column:1/-1"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div></div></div>`;
  html+='</div>';
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_galleryPhotoUrls, 30, 340, 'scaled'); }catch(e){}
  return html;
}

// 심플형 - 여백을 최소화한 한 줄 미니멀 리스트. 카드형(사진 중심)/상세형(분할 화면)/리스트형(다열 표)과
// 구분되는 네번째 보기 방식으로, 순위·프로필·이름·티어·승률만 한 줄에 압축해 빠르게 훑어볼 수 있도록 구성한다.
function _buildSimpleView(rankMap){
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : null;
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_pl || !_getUnivs){
    const msg = (typeof players === 'undefined')
      ? '데이터 로딩 중...'
      : '스트리머 데이터를 불러올 수 없습니다.';
    return `<div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">${msg}</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>`;
  }
  const _simplePhotoUrls = [];
  const _univScMap = new Map();
  for(const p of _pl){
    if(!p || p.retired) continue;
    const u = p.univ;
    if(!u) continue;
    const arr = _univScMap.get(u);
    if(arr) arr.push(p);
    else _univScMap.set(u, [p]);
  }
  let html='<div class="streamer-simple-list">';
  let anyShown=false;
  let _sRowIdx=0;
  _getUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    let up=_univScMap.get(u.name) || [];
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalHideNoRecord) up=up.filter(p=>(Number(p.win||0)+Number(p.loss||0))>0);
    if(!up.length) return;
    anyShown=true;
    const sorted=[...up].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
    const _uSafe=(typeof escJS==='function') ? escJS(u.name||'') : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    html+=`<div class="streamer-simple-head" data-simple-univ-header="${u.name}" style="--c:${u.color||'#6366f1'}">
      <span class="streamer-simple-univ clickable-univ" onclick="openUnivModal('${_uSafe}')">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','18px'):'18px'))}${u.name}</span>
      <span class="streamer-simple-univ-count">${up.length}명</span>
    </div>`;
    sorted.forEach(p=>{
      const win = Number(p.win||0);
      const loss = Number(p.loss||0);
      const games = win + loss;
      const wr = games?Math.round(win/games*100):null;
      const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const q=`${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      const photoSrcRaw=(typeof p.photo==='string'&&p.photo.trim())?p.photo.trim():'';
      if(photoSrcRaw) _simplePhotoUrls.push(photoSrcRaw);
      _sRowIdx++;
      const _sImgLoadAttr = _sRowIdx<=20 ? 'loading="eager" fetchpriority="high"' : 'loading="eager" fetchpriority="low"';
      const _wrIsHot = games>=5 && wr>=70;
      const _raceCode = p.race || 'N';
      const _tierColorRaw = (p.tier && typeof getTierBtnColor==='function') ? getTierBtnColor(p.tier) : '#8b5cf6';
      html+=`<div class="streamer-simple-row ${p.inactive?'inactive':''} ${p.retired?'retired':''}" data-simple-row="1" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--c:${u.color||'#6366f1'};--i:${_sRowIdx}">
        <span class="streamer-simple-avatar-wrap">
          ${photoSrcRaw?`<span class="streamer-simple-avatar"><img ${_sImgLoadAttr} decoding="async" src="${toThumbUrl(photoSrcRaw,56)}" data-orig="${toHttpsUrl(photoSrcRaw)}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.parentNode.textContent='${p.race||'?'}';}"></span>`:`<span class="streamer-simple-avatar">${p.race||'?'}</span>`}
        </span>
        <span class="streamer-simple-line">
          <span class="streamer-simple-left">
            ${p.role?`<span class="streamer-simple-role">${getRoleBadgeHTML(p.role,'9px')}</span>`:''}
            <span class="streamer-simple-name"><span class="streamer-simple-name-text clickable-name">${p.name}</span>${genderIcon(p.gender)}${p.retired?'<span class="streamer-simple-flag">은퇴</span>':''}${p.inactive?'<span class="streamer-simple-flag">휴학</span>':''}</span>
          </span>
          <span class="streamer-simple-mid">
            <span class="streamer-simple-race race-${_raceCode}">${_raceCode}</span>
            <span class="streamer-simple-tier" style="--tc:${_tierColorRaw}">${p.tier||'미정'}</span>
            <span class="streamer-simple-record">${games?`${win}승${loss}패`:'전적없음'}</span>
          </span>
        </span>
        <span class="streamer-simple-medal ${games?(wr>=50?'is-win':'is-lose'):'is-none'}">
          ${_wrIsHot?'<span class="streamer-simple-medal-hot">HOT</span>':''}
          <span class="streamer-simple-medal-label">승률</span>
          <span class="streamer-simple-medal-value">${games?`${wr}%`:'-'}</span>
        </span>
      </div>`;
    });
  });
  html+='</div>';
  if(!anyShown) html+=`<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div><div class="empty-state-desc">다른 검색어나 필터를 사용해보세요</div></div>`;
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_simplePhotoUrls, 60, 56); }catch(e){}
  return html;
}

// 상세형 - "사진+리스트형" 두번째 레이아웃 전용 스타일 (최초 1회만 주입)
;(function _injectFocusCardStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('focus-card-detail-style')) return;
  const s=document.createElement('style');
  s.id='focus-card-detail-style';
  s.textContent=[
    '.streamer-focus-card2{display:flex;gap:0;border-radius:22px;overflow:hidden;background:var(--panel,#fff);border-top:1px solid rgba(148,163,184,.18);border-right:1px solid rgba(148,163,184,.18);border-bottom:1px solid rgba(148,163,184,.18);border-left:none;box-shadow:0 16px 32px rgba(15,23,42,.08);min-height:420px}',
    '.streamer-focus-card2-photo{position:relative;flex:0 0 42%;min-width:220px;overflow:hidden;background:#e2e8f0}',
    '.streamer-focus-card2-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}',
    '.streamer-focus-card2-photo .streamer-focus-photo-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:64px;font-weight:900;color:rgba(15,23,42,.28)}',
    '.streamer-focus-card2-info{flex:1;min-width:0;padding:22px 26px 18px;display:flex;flex-direction:column}',
    '.streamer-focus-card2-name{font-size:24px;font-weight:950;letter-spacing:-.02em;color:var(--text1);margin-bottom:8px}',
    '.streamer-focus-card2-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 2px;border-bottom:1px dashed rgba(148,163,184,.38)}',
    '.streamer-focus-card2-row:last-child{border-bottom:none}',
    '.streamer-focus-card2-label{font-size:var(--fs-base);font-weight:700;color:var(--text3)}',
    '.streamer-focus-card2-value{font-size:var(--fs-md);font-weight:900;color:var(--text1);text-align:right}',
    '.streamer-focus-card2-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}',
    '.streamer-focus-card2-photo2{margin-top:10px;border-radius:22px;overflow:hidden;position:relative;width:100%;aspect-ratio:3/2;background:#e2e8f0;border-top:1px solid rgba(148,163,184,.18);border-right:1px solid rgba(148,163,184,.18);border-bottom:1px solid rgba(148,163,184,.18);border-left:none;box-shadow:0 16px 32px rgba(15,23,42,.08);transition:aspect-ratio .18s ease}',
    '.streamer-focus-card2-photo2 img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    // 자동 맞춤 모드: 이미지를 두 겹으로 겹치지 않고, 박스 자체의 비율을 사진의 실제 비율에 맞춰 자동으로 조절 → 크롭도, 위치 지정도 필요 없음
    '.streamer-focus-card2-photo2.is-autofit{max-height:min(74vh,560px)}',
    '.streamer-focus-card2-photo2.is-autofit .sfc2p2-fg{object-fit:cover;object-position:center 22%}',
    // 수동 위치 모드도 자동 모드와 비슷한 크기감을 갖도록 최소 높이 확보 (전보다 작아 보이지 않게)
    '.streamer-focus-card2-photo2:not(.is-autofit){min-height:320px;max-height:min(64vh,520px)}',
    '@media (max-width:768px){.streamer-focus-card2{flex-direction:column;min-height:0}.streamer-focus-card2-photo{flex:0 0 auto;aspect-ratio:4/3;min-width:0;width:100%}.streamer-focus-card2-info{padding:16px 16px 14px}}',
    'body.dark .streamer-focus-card2{background:#0f172a;border-color:#334155}',
    'body.dark .streamer-focus-card2-row{border-color:#334155}',
    'body.dark .streamer-focus-card2-photo2{background:#1e293b;border-color:#334155}',
    // 이미지2 수동 위치 - 드래그로 직접 조정 (크로스헤어/가이드라인/뱃지)
    '.streamer-focus-card2-photo2.is-manual{cursor:grab;touch-action:none}',
    '.streamer-focus-card2-photo2.is-manual:active{cursor:grabbing}',
    '.sfp2-cross{position:absolute;width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.95);box-shadow:0 2px 10px rgba(0,0,0,.4),0 0 0 3px rgba(0,0,0,.15);transform:translate(-50%,-50%);pointer-events:none;z-index:3}',
    '.sfp2-gridline-v{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.45);pointer-events:none;z-index:2}',
    '.sfp2-gridline-h{position:absolute;left:0;right:0;height:1px;background:rgba(255,255,255,.45);pointer-events:none;z-index:2}',
    '.sfp2-badge{position:absolute;top:10px;left:10px;background:rgba(15,23,42,.72);color:#fff;font-size:var(--fs-caption);font-weight:800;padding:4px 9px;border-radius:999px;pointer-events:none;z-index:4;letter-spacing:.01em}',
    '.sfp2-hint{position:absolute;bottom:10px;right:12px;background:rgba(15,23,42,.55);color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;pointer-events:none;z-index:4}',
    // 사이드바 카드 - 이미지2 수동 위치 지정 여부 뱃지
    '.streamer-focus-card-pin{position:absolute;top:7px;left:7px;font-size:var(--fs-sm);line-height:1;background:rgba(15,23,42,.55);border-radius:999px;padding:3px 4px;z-index:2;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))}'
  ].join('');
  document.head.appendChild(s);
})();

// 심플형(4번째 보기) 및 리스트형 심플모드 전용 스타일 (최초 1회만 주입)
;(function _injectSimpleViewStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('streamer-simple-style')) return;
  const s=document.createElement('style');
  s.id='streamer-simple-style';
  s.textContent=[
    // 심플형: 여백·장식·모션을 최소화한 담백한 한 줄 리스트. 그라디언트/그림자/회전 없이 정보 위주로 빠르게 훑을 수 있도록 구성
    '.streamer-simple-list{display:flex;flex-direction:column;gap:6px;font-family:inherit}',
    '.streamer-simple-head{display:flex;align-items:center;gap:8px;padding:6px 10px;margin-top:16px;border-bottom:2px solid color-mix(in srgb, var(--c,#6366f1) 45%, transparent)}',
    '.streamer-simple-head:first-child{margin-top:0}',
    '.streamer-simple-univ{display:inline-flex;align-items:center;gap:5px;font-size:var(--fs-base);font-weight:800;color:var(--c,#6366f1);cursor:pointer;letter-spacing:-.01em}',
    '.streamer-simple-univ-count{margin-left:auto;font-size:var(--fs-caption);font-weight:700;color:var(--text3)}',
    '.streamer-simple-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r);border:1px solid rgba(148,163,184,.16);background:var(--panel,#fff);cursor:pointer;transition:background-color .12s ease,border-color .12s ease}',
    '@media (prefers-reduced-motion:reduce){.streamer-simple-row{transition:none}}',
    '.streamer-simple-row:hover{background:color-mix(in srgb, var(--c,#6366f1) 6%, var(--panel,#fff));border-color:color-mix(in srgb, var(--c,#6366f1) 30%, rgba(148,163,184,.16))}',
    '.streamer-simple-row.inactive{opacity:.6}',
    '.streamer-simple-row.retired{opacity:.5;filter:grayscale(.5)}',
    // 프로필 이미지: 설정탭에서 정한 모양(원형/둥근사각 등)은 그대로 따름. 장식 없는 단일 테두리만
    '.streamer-simple-avatar-wrap{position:relative;flex-shrink:0;line-height:0}',
    '.streamer-simple-avatar{width:40px;height:40px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;background:color-mix(in srgb, var(--c,#6366f1) 14%, #eef2ff);display:flex;align-items:center;justify-content:center;font-size:var(--fs-sm);font-weight:800;color:var(--c,#6366f1);position:relative;box-shadow:0 0 0 1.5px color-mix(in srgb, var(--c,#6366f1) 40%, transparent)}',
    '.streamer-simple-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;clip-path:inherit}',
    // 직책+이름(좌측 고정폭 그룹) / 종족·티어·전적(중간 그룹, 남는 공간에 고르게 분산 배치)으로 분리.
    // 좌측 그룹의 폭을 이름 길이와 무관하게 항상 동일하게 고정해서(내용에 따라 늘어나지 않음),
    // 종족/티어/전적이 시작되는 위치가 카드마다 흔들리지 않고 항상 같은 자리에서 시작하도록 함
    '.streamer-simple-line{min-width:0;flex:1;display:flex;align-items:center;gap:10px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}',
    '.streamer-simple-line::-webkit-scrollbar{display:none}',
    '.streamer-simple-left{flex:0 0 160px;min-width:0;display:flex;align-items:center;gap:6px;overflow:hidden}',
    '.streamer-simple-mid{flex:1 1 auto;min-width:0;display:flex;align-items:center;justify-content:space-evenly;gap:6px}',
    '@media (max-width:768px){.streamer-simple-left{flex-basis:116px}}',
    '.streamer-simple-role{flex:0 0 auto;display:inline-flex}',
    // 이름: 어떤 상태에서도 효과 없이 항상 담백한 굵은 글씨로 표시
    '.streamer-simple-name{flex:0 1 auto;min-width:0;display:flex;align-items:center;gap:3px;overflow:hidden}',
    '.streamer-simple-name-text{font-size:13.5px;font-weight:800;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;max-width:100%;color:var(--text1)}',
    '.streamer-simple-flag{flex:0 0 auto;font-size:9px;font-weight:700;color:var(--text3);background:rgba(148,163,184,.16);border-radius:6px;padding:2px 6px}',
    '.streamer-simple-race{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;min-width:20px;font-size:var(--fs-caption);font-weight:900;padding:3px 7px;border-radius:6px;white-space:nowrap;border:1px solid transparent}',
    '.streamer-simple-race.race-T{color:#1e40af;background:#dbe9ff;border-color:#b8d4ff}',
    '.streamer-simple-race.race-Z{color:#6b21a8;background:#ecdcff;border-color:#ddc2fb}',
    '.streamer-simple-race.race-P{color:#92400e;background:#fbe6b0;border-color:#f3d488}',
    '.streamer-simple-race.race-N{color:#475569;background:#e5e9ef;border-color:#cbd5e1}',
    'body.dark .streamer-simple-race.race-T{color:#93c5fd;background:rgba(59,130,246,.22);border-color:rgba(59,130,246,.3)}',
    'body.dark .streamer-simple-race.race-Z{color:#d8b4fe;background:rgba(168,85,247,.22);border-color:rgba(168,85,247,.3)}',
    'body.dark .streamer-simple-race.race-P{color:#fcd34d;background:rgba(245,158,11,.22);border-color:rgba(245,158,11,.3)}',
    'body.dark .streamer-simple-race.race-N{color:#cbd5e1;background:rgba(148,163,184,.2);border-color:rgba(148,163,184,.3)}',
    // 티어/전적: 담백한 플랫 칩이되, 테두리와 진한 배경으로 잘 보이도록
    '.streamer-simple-tier,.streamer-simple-record{flex:0 0 auto;display:inline-flex;align-items:center;font-size:var(--fs-caption);font-weight:900;white-space:nowrap;border-radius:6px;padding:3px 8px;border:1px solid transparent}',
    '.streamer-simple-tier{color:color-mix(in srgb, var(--tc,#8b5cf6) 88%, #000 10%);background:color-mix(in srgb, var(--tc,#8b5cf6) 22%, #fff);border-color:color-mix(in srgb, var(--tc,#8b5cf6) 45%, transparent)}',
    '.streamer-simple-record{color:var(--text2);background:rgba(148,163,184,.16);border-color:rgba(148,163,184,.3)}',
    'body.dark .streamer-simple-tier{color:color-mix(in srgb, var(--tc,#8b5cf6) 90%, #fff 35%);background:color-mix(in srgb, var(--tc,#8b5cf6) 30%, #0f172a);border-color:color-mix(in srgb, var(--tc,#8b5cf6) 50%, transparent)}',
    'body.dark .streamer-simple-record{color:var(--text2);background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.14)}',
    // 승률: 다른 탭과 동일한 승패 색상(--win-col 빨강 / --lose-col 파랑)을 그대로 사용, 옅은 배경 칩으로 시인성 확보
    '.streamer-simple-medal{position:relative;flex-shrink:0;min-width:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;font-weight:900;text-align:center;padding:3px 6px;border-radius:8px}',
    '.streamer-simple-medal-label{font-size:8.5px;font-weight:700;letter-spacing:.02em;color:var(--text3)}',
    '.streamer-simple-medal-value{font-size:var(--fs-md);font-weight:900;line-height:1.2}',
    '.streamer-simple-medal-hot{position:absolute;top:-8px;right:-2px;font-size:8px;font-weight:800;letter-spacing:.02em;color:#f97316}',
    '.streamer-simple-medal.is-win{background:color-mix(in srgb, var(--win-col,#dc2626) 12%, transparent)}',
    '.streamer-simple-medal.is-win .streamer-simple-medal-value{color:var(--win-col,#dc2626)}',
    '.streamer-simple-medal.is-lose{background:color-mix(in srgb, var(--lose-col,#2563eb) 10%, transparent)}',
    '.streamer-simple-medal.is-lose .streamer-simple-medal-value{color:var(--lose-col,#2563eb)}',
    '.streamer-simple-medal.is-none .streamer-simple-medal-value{color:var(--gray-l)}',
    '@media (max-width:768px){.streamer-simple-row{gap:8px;padding:6px 8px}.streamer-simple-avatar{width:34px;height:34px}.streamer-simple-name-text{font-size:var(--fs-sm)}.streamer-simple-tier,.streamer-simple-record,.streamer-simple-race{font-size:9.5px;padding:2.5px 6px}.streamer-simple-medal{min-width:40px}.streamer-simple-medal-value{font-size:12.5px}.streamer-simple-medal-label{font-size:7px}}',
    'body.dark .streamer-simple-row{background:#0f172a;border-color:rgba(255,255,255,.08)}',
    'body.dark .streamer-simple-row:hover{background:color-mix(in srgb, var(--c,#6366f1) 10%, #0f172a)}'
  ].join('');
  document.head.appendChild(s);
})();

function _buildFocusCardDetail(selected, opts){
  const { selUniv, selColor, selWin, selLoss, selGames, selWr, selAttr, selHistAll, heroPhoto2Pos } = opts;
  const photoSrcOrig = selected.photo ? toHttpsUrl(selected.photo) : '';
  const photoSrc = selected.photo ? toScaledUrl(selected.photo, 320) : '';
  const photo2SrcOrig = String(selected.secondProfileFile||'').trim() ? toHttpsUrl(String(selected.secondProfileFile||'').trim()) : '';
  const photo2Src = String(selected.secondProfileFile||'').trim() ? toScaledUrl(String(selected.secondProfileFile||'').trim(), 720) : '';
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
      <div class="streamer-focus-card2-photo">
        ${photoSrc ? `<img src="${photoSrc}" data-orig="${photoSrcOrig}" alt="${selected.name}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex';}">` : ''}
        <div class="streamer-focus-photo-fallback" style="display:${photoSrc?'none':'flex'}">${selected.race||'?'}</div>
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
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : [];
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_getUnivs) return `<div class="streamer-content-card"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">스트리머 데이터를 불러오는 중입니다.</div></div></div>`;
  const visible = _pl.filter(p=>{
    if(!p || p.retired) return false;
    if(totalRaceFilter!=='전체' && p.race!==totalRaceFilter) return false;
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
    const sorted = [...members].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
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
      listHtml += `<div class="streamer-focus-card ${_isActive?'active':''}" data-focus-row="1" data-focus-name="${(typeof escAttr==='function'?escAttr(p.name):p.name)}" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}" onclick="try{var _sl=document.querySelector('.streamer-focus-list');if(_sl)window._streamerFocusScrollTop=_sl.scrollTop;}catch(e){};totalFocusPlayer='${_pSafe}';render()">
        ${photoSrc ? `<img ${_fImgLoadAttr} decoding="async" src="${toScaledUrl(photoSrc,320)}" data-orig="${toHttpsUrl(photoSrc)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="_thumbFallback(this)">` : ''}
        <div class="streamer-focus-card-fallback" style="display:${photoSrc?'none':'flex'}">${p.race||'?'}</div>
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
  const heroPhotoUrl2 = heroPhotoUrl2Src ? toScaledUrl(heroPhotoUrl2Src, 200).replace(/'/g,'%27').replace(/"/g,'%22') : '';
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
      <div class="streamer-focus-photo">
        ${selected.photo ? `<img src="${toScaledUrl(selected.photo,480)}" data-orig="${heroPhotoOrig}" alt="${selected.name}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';}">` : ''}
        <div class="streamer-focus-photo-fallback" style="display:${selected.photo?'none':'flex'}">${selected.race||'?'}</div>
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
          <button class="pill ${totalFocusDetailStyle==='hero'?'on':''}" style="padding:4px 10px;font-size:var(--fs-caption);white-space:nowrap" onclick="totalFocusDetailStyle='hero';try{localStorage.setItem('su_focus_detail_style','hero');}catch(e){};render()" title="기본형">🖼️ 기본</button>
          <button class="pill ${totalFocusDetailStyle==='card'?'on':''}" style="padding:4px 10px;font-size:var(--fs-caption);white-space:nowrap" onclick="totalFocusDetailStyle='card';try{localStorage.setItem('su_focus_detail_style','card');}catch(e){};render()" title="사진+리스트형">📋 포토</button>
        </span>
      </div>
      ${listHtml}
    </aside>
    ${detailHtml}
  </div>`;
}

function toggleBulkEditMode(){
  _bulkEditMode=!_bulkEditMode;
  _bulkEditSelected=new Set();
  _bulkEditSearch='';
  render();
}

function toggleBulkEditPlayer(name,checked){
  if(checked) _bulkEditSelected.add(name);
  else _bulkEditSelected.delete(name);
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent=_bulkEditSelected.size;
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display=_bulkEditSelected.size>0?'inline-flex':'none';
}

function bulkEditToggleAll(checked){
  document.querySelectorAll('[data-player-name]').forEach(cb=>{
    cb.checked=checked;
    const name=cb.dataset.playerName;
    if(name){if(checked)_bulkEditSelected.add(name);else _bulkEditSelected.delete(name);}
  });
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent=_bulkEditSelected.size;
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display=_bulkEditSelected.size>0?'inline-flex':'none';
}

function clearBulkEditSelection(){
  _bulkEditSelected=new Set();
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent='0';
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display='none';
  const all=document.getElementById('bulk-check-all');
  if(all) all.checked=false;
  document.querySelectorAll('[data-player-name]').forEach(cb=>{cb.checked=false;});
}

function openBulkEditModal(){
  if(!_bulkEditSelected.size) return;
  const univOpts=getAllUnivs().filter(u=>!u.dissolved).map(u=>`<option value="${u.name}">${u.name}</option>`).join('');
  const tierOpts=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
  const sel=[..._bulkEditSelected];
  const first=sel.slice(0,30);
  const more=sel.length-first.length;
  document.getElementById('bulkEditBody').innerHTML=`
    <div style="margin-bottom:14px;padding:10px;background:var(--surface);border-radius:8px;font-size:var(--fs-sm);color:var(--text2)">
      <strong style="color:var(--blue)">${sel.length}명</strong> 선택됨: ${first.join(', ')}${more?` 외 ${more}명`:''}
      ${more?`<details style="margin-top:8px"><summary style="cursor:pointer;color:var(--gray-l);font-size:var(--fs-caption)">전체 보기</summary><div style="margin-top:6px;line-height:1.6">${sel.join(', ')}</div></details>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">티어</label>
        <select id="bulk-ed-t" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>${tierOpts}
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">대학</label>
        <select id="bulk-ed-u" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>${univOpts}
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">종족</label>
        <select id="bulk-ed-r" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>
          <option value="T">테란</option><option value="Z">저그</option><option value="P">프로토스</option><option value="N">종족미정</option>
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">성별</label>
        <select id="bulk-ed-g" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>
          <option value="F">👩 여자</option><option value="M">👨 남자</option>
        </select>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:4px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">현황판</label>
      <select id="bulk-ed-h" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
        <option value="">변경 안함</option>
        <option value="hide">제외 (숨김)</option>
        <option value="show">표시</option>
      </select>
      <button onclick="bulkDeleteSelected()" style="margin-left:auto;padding:6px 14px;border-radius:8px;border:1.5px solid #ef4444;background:#fef2f2;color:#dc2626;font-size:var(--fs-sm);font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  om('bulkEditModal');
}

function saveBulkEdit(){
  const _getSelVal=(id)=>document.getElementById(id)?.value||'';
  const t=_getSelVal('bulk-ed-t');
  const u=_getSelVal('bulk-ed-u');
  const r=_getSelVal('bulk-ed-r');
  const g=_getSelVal('bulk-ed-g');
  const h=_getSelVal('bulk-ed-h');
  if(!document.getElementById('bulk-ed-t')&&!document.getElementById('bulk-ed-u')&&!document.getElementById('bulk-ed-r')&&!document.getElementById('bulk-ed-g')&&!document.getElementById('bulk-ed-h')){
    alert('일괄 편집 창을 다시 열어주세요.');
    return;
  }
  if(!t&&!u&&!r&&!g&&!h){alert('변경할 항목을 선택하세요.');return;}
  _bulkEditSelected.forEach(name=>{
    const p=players.find(x=>x.name===name);
    if(!p) return;
    if(t) p.tier=t;
    if(u) p.univ=u;
    if(r) p.race=r;
    if(g) p.gender=g;
    // p.hideFromBoard: 이 일괄편집에서 쓰는 "현황판 숨김" 플래그.
    // cloud-board-render.js의 개별 숨김 버튼은 p.hidden을 토글하는데, 용도가 같아 보이지만
    // 별개 필드입니다. 현황판(board2) 각 뷰는 두 플래그를 모두 검사합니다(!p.hidden && !p.hideFromBoard).
    if(h==='hide') p.hideFromBoard=true;
    else if(h==='show') p.hideFromBoard=undefined;
  });
  save();
  cm('bulkEditModal');
  _bulkEditMode=false;
  _bulkEditSelected=new Set();
  render();
}
function bulkDeleteSelected(){
  if(!_bulkEditSelected.size) return;
  if(!confirm(`선택한 ${_bulkEditSelected.size}명을 삭제할까요?\n전적·기록은 삭제되지 않습니다.`)) return;
  _bulkEditSelected.forEach(name=>{
    const idx=players.findIndex(x=>x.name===name);
    if(idx>=0) players.splice(idx,1);
  });
  if(typeof fixPoints==='function') fixPoints();
  save();
  cm('bulkEditModal');
  _bulkEditMode=false;
  _bulkEditSelected=new Set();
  render();
}

function openMergePlayersModal(){
  if(!isLoggedIn) return;
  const modalId='_mergePlayersModal';
  let modal=document.getElementById(modalId);
  if(modal) modal.remove();
  modal=document.createElement('div');
  modal.id=modalId;
  modal.style.cssText='position:fixed;inset:0;background:#0008;z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  const list=players.map(p=>p.name).filter(Boolean).sort((a,b)=>a.localeCompare(b));
  modal.innerHTML=`<div style="background:var(--white);border-radius:var(--r2);padding:18px 18px 16px;width:520px;max-width:100%;box-shadow:0 10px 50px rgba(0,0,0,.35)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:var(--fs-md)">🔀 스트리머 병합</div>
      <button class="btn btn-w btn-xs" onclick="document.getElementById('${modalId}').remove()">닫기</button>
    </div>
    <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.6;margin-bottom:12px">
      A(원본)를 B(대상)로 합칩니다. 모든 기록/대진/현황판에서 A 이름을 B로 치환합니다.
    </div>
    <datalist id="_mergePlayersList">${list.map(n=>`<option value="${escAttr(n)}"></option>`).join('')}</datalist>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:4px">A (원본)</div>
        <input id="_mergeFrom" list="_mergePlayersList" placeholder="예: 닉네임(오타)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:var(--r);box-sizing:border-box">
      </div>
      <div style="flex:1;min-width:220px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:4px">B (대상)</div>
        <input id="_mergeTo" list="_mergePlayersList" placeholder="예: 닉네임(정상)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:var(--r);box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);color:var(--text3);cursor:pointer">
        <input id="_mergeDel" type="checkbox" checked style="width:15px;height:15px;cursor:pointer"> A(원본) 스트리머 삭제
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);color:var(--text3);cursor:pointer">
        <input id="_mergeFill" type="checkbox" checked style="width:15px;height:15px;cursor:pointer"> B 정보가 비면 A 정보로 보강(사진/채널/메모)
      </label>
    </div>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="mergePlayersApply()">병합 실행</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('${modalId}').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  const i=document.getElementById('_mergeFrom');
  if(i) i.focus();
}

function mergePlayersApply(){
  const from=(document.getElementById('_mergeFrom')?.value||'').trim();
  const to=(document.getElementById('_mergeTo')?.value||'').trim();
  const del=document.getElementById('_mergeDel')?.checked||false;
  const fill=document.getElementById('_mergeFill')?.checked||false;
  mergePlayers(from,to,{del,fill});
}

function mergePlayers(fromName, toName, opt){
  if(!fromName||!toName) return alert('A/B 둘 다 입력하세요.');
  if(fromName===toName) return alert('A와 B가 같습니다.');
  const fromP=players.find(p=>p.name===fromName);
  const toP=players.find(p=>p.name===toName);
  if(!fromP) return alert(`원본(A) "${fromName}"을 찾을 수 없습니다.`);
  if(!toP) return alert(`대상(B) "${toName}"을 찾을 수 없습니다.`);
  if(!confirm(`"${fromName}" → "${toName}" 병합을 진행할까요?\n(되돌리기 어렵습니다)`)) return;

  const _repList = (arr, fn) => { (arr||[]).forEach(fn); };
  const _repMembers = (mems) => { _repList(mems, m => { if(m && m.name===fromName) m.name=toName; }); };
  const _repGames = (games) => { _repList(games, g => { if(!g) return; if(g.playerA===fromName) g.playerA=toName; if(g.playerB===fromName) g.playerB=toName; if(g.wName===fromName) g.wName=toName; if(g.lName===fromName) g.lName=toName; if(g.winner===fromName) g.winner=toName; }); };
  const _repSets = (sets) => { _repList(sets, s => { if(!s) return; _repGames(s.games); if(s.winner===fromName) s.winner=toName; }); };
  const _repMatch = (m) => {
    if(!m) return;
    if(m.a===fromName) m.a=toName;
    if(m.b===fromName) m.b=toName;
    if(m.wName===fromName) m.wName=toName;
    if(m.lName===fromName) m.lName=toName;
    if(m.playerA===fromName) m.playerA=toName;
    if(m.playerB===fromName) m.playerB=toName;
    if(m.winner===fromName) m.winner=toName;
    _repMembers(m.membersA);
    _repMembers(m.membersB);
    _repMembers(m.teamAMembers);
    _repMembers(m.teamBMembers);
    _repSets(m.sets);
    _repGames(m.games);
  };

  _repList([...(miniM||[]), ...(univM||[]), ...(ckM||[]), ...(proM||[]), ...(comps||[]), ...(ttM||[])], _repMatch);
  _repList(indM||[], m => { if(!m) return; if(m.wName===fromName) m.wName=toName; if(m.lName===fromName) m.lName=toName; if(m.matchupA===fromName) m.matchupA=toName; if(m.matchupB===fromName) m.matchupB=toName; });
  _repList(gjM||[], m => { if(!m) return; if(m.wName===fromName) m.wName=toName; if(m.lName===fromName) m.lName=toName; });

  const _repTourney = (tn) => {
    if(!tn) return;
    if(Array.isArray(tn.groups)){
      tn.groups.forEach(g=>{
        if(!g) return;
        if(Array.isArray(g.players)) g.players=g.players.map(n=>n===fromName?toName:n);
        if(Array.isArray(g.univs)) g.univs=g.univs.map(n=>n===fromName?toName:n);
        _repList(g.matches, _repMatch);
      });
    }
    if(Array.isArray(tn.bracket)){
      tn.bracket.forEach(r=>_repList(r,_repMatch));
    }
    if(tn.thirdPlace) _repMatch(tn.thirdPlace);
    if(Array.isArray(tn.gjMatches)) _repList(tn.gjMatches, s => { if(!s) return; if(s.a===fromName) s.a=toName; if(s.b===fromName) s.b=toName; _repList(s.games, g => { if(!g) return; if(g.winner===fromName) g.winner=toName; }); });
  };
  _repList(proTourneys||[], _repTourney);
  _repList(tourneys||[], _repTourney);

  players.forEach(p=>{
    if(!p) return;
    if(Array.isArray(p.history)){
      p.history.forEach(h=>{
        if(!h) return;
        if(h.opp===fromName) h.opp=toName;
        if(h.who===fromName) h.who=toName;
      });
    }
  });

  if(typeof boardPlayerOrder!=='undefined' && boardPlayerOrder){
    Object.keys(boardPlayerOrder).forEach(u=>{
      const arr=boardPlayerOrder[u]||[];
      const hasTo=arr.includes(toName);
      boardPlayerOrder[u]=arr.filter(n=>n!==fromName);
      if(!hasTo && arr.includes(fromName)) boardPlayerOrder[u].push(toName);
    });
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }

  if(typeof playerStatusIcons!=='undefined'){
    if(playerStatusIcons[fromName] && !playerStatusIcons[toName]) playerStatusIcons[toName]=playerStatusIcons[fromName];
    delete playerStatusIcons[fromName];
    try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}
  }

  if(opt?.fill){
    if(!toP.photo && fromP.photo) toP.photo=fromP.photo;
    if(!toP.channelUrl && fromP.channelUrl) toP.channelUrl=fromP.channelUrl;
    if(!toP.memo && fromP.memo) toP.memo=fromP.memo;
  }
  toP.win=(toP.win||0)+(fromP.win||0);
  toP.loss=(toP.loss||0)+(fromP.loss||0);
  toP.points=(toP.points||0)+(fromP.points||0);
  if(!toP.elo && fromP.elo) toP.elo=fromP.elo;
  if(Array.isArray(fromP.history)){
    if(!Array.isArray(toP.history)) toP.history=[];
    toP.history.unshift(...fromP.history);
  }

  if(opt?.del){
    const idx=players.findIndex(p=>p.name===fromName);
    if(idx>=0) players.splice(idx,1);
  }

  if(typeof fixPoints==='function') fixPoints();
  save();
  const m=document.getElementById('_mergePlayersModal');
  if(m) m.remove();
  render();
}

function tierRankGoHist(modeId, playerName){
  const mode=(modeId||'').toLowerCase();
  let type='전체';
  if(mode.startsWith('mini_')||mode.startsWith('civ_')) type='mini';
  else if(mode.startsWith('univm_')) type='univm';
  else if(mode.startsWith('ck_')) type='ck';
  else if(mode.startsWith('pro_')) type='pro';
  else if(mode.startsWith('tt_')) type='tt';
  else if(mode.startsWith('ind_')) type='ind';
  else if(mode.startsWith('gj_')) type='gj';
  else if(mode.startsWith('comp_')) type='tourney';
  if(!window._recQ) window._recQ={};
  window._recQ['all']=playerName||'';
  window._recTypeFilter=type;
  curTab='hist';
  histSub='all';
  openDetails={};
  if(window.histPage && window.histPage['all']!==undefined) window.histPage['all']=0;
  render();
}

/* ══════════════════════════════════════
   티어 순위표
══════════════════════════════════════ */
