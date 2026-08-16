/* ══════════════════════════════════════════════════════════════
   선수(전체) - 메인 렌더러 rTotal (players-streamer-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function rTotal(C,T){
  T.innerText='🎬 전체 스타크래프트 스트리머 리스트';
  try{ _bindTotalDelegatedEvents(); }catch(e){}
  try{ _bindFocusPhoto2DragEvents(); }catch(e){}
  try{ if(typeof _b2EnsureMvpHistoryFresh==='function') _b2EnsureMvpHistoryFresh(true); }catch(e){}
  // TabVis: 보기 방식(카드형/상세형/리스트/심플형)이 OFF(비로그인 숨김)면 비로그인 사용자는 리스트형으로 고정
  if (window.TabVis && typeof window.TabVis.visible === 'function' && !window.TabVis.visible('total.mode.' + totalViewMode)) {
    totalViewMode = 'table';
  }
  let _streamerTabDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_streamer_tab_design_mode')||'classic').trim(); return ['classic','glass','vivid','obsidian','aurora','blush','paper','mono','cute'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
  let _streamerTabLayoutMode = (()=>{ try{ const v=(localStorage.getItem('su_streamer_tab_layout_mode')||'default').trim(); return ['default','compact','cozy','showcase'].includes(v)?v:'default'; }catch(e){ return 'default'; } })();
  let _streamerTabUiMode = (()=>{ try{ const v=(localStorage.getItem('su_streamer_tab_ui_mode')||'standard').trim(); return ['standard','pill','minimal','photocard'].includes(v)?v:'standard'; }catch(e){ return 'standard'; } })();
  // TabVis: 디자인/레이아웃/UI 스킨이 OFF(비로그인 숨김)면 비로그인 사용자에게는 기본값으로 표시
  if ((_streamerTabDesignMode!=='classic' || _streamerTabLayoutMode!=='default' || _streamerTabUiMode!=='standard')
      && window.TabVis && typeof window.TabVis.visible === 'function' && !window.TabVis.visible('total.mode.designskin')) {
    _streamerTabDesignMode = 'classic';
    _streamerTabLayoutMode = 'default';
    _streamerTabUiMode = 'standard';
  }
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
  const _ncols=_isMb ? (3+(isLoggedIn?1:0)+(_showBulk?1:0)) : ((isLoggedIn?10:9)+(_showBulk?1:0));
  const _viewLabel=totalViewMode==='gallery'?'카드형':(totalViewMode==='focus'?'상세형':(totalViewMode==='simple'?'심플형':'리스트형'));
  // [참고] p.hidden / p.hideFromBoard 는 이름과 달리 "현황판(board2)에서만" 숨기는 용도입니다
  // (cloud-board-render.js 숨김 버튼 문구: "현황판에서 숨김"). 그래서 스트리머탭(여기)에서는
  // 이 두 플래그를 의도적으로 무시하고 retired(은퇴) 여부만 걸러냅니다 — 실수로 지운 게 아닙니다.
  const _visiblePlayers = _pl.filter(p=>{
    if(!p || p.retired) return false;
    if(totalRaceFilter!=='전체' && p.race!==totalRaceFilter) return false;
    if(totalGenderFilter!=='전체' && p.gender!==totalGenderFilter) return false;
    if(totalUnivFilter && String(p.univ||'').trim()!==totalUnivFilter) return false;
    if(totalHideNoRecord && (Number(p.win||0)+Number(p.loss||0))<=0) return false;
    return true;
  });
  const _activeUnivCount = new Set(_visiblePlayers.map(p=>p.univ).filter(Boolean)).size;
  const _photoCount = _visiblePlayers.filter(p=>String(p.photo||'').trim()).length;
  const _roleCount = _visiblePlayers.filter(p=>p.role && roleIsMain(p.role)).length;
  const _hasRecordCount = _visiblePlayers.filter(p=>(Number(p?.win||0)+Number(p?.loss||0))>0).length;
  const _noRecordCount = Math.max(0, _visiblePlayers.length - _hasRecordCount);
  // [삭제됨] 카드형(gallery) 상단 4칸 통계 카드(표시 스트리머/기록 보유/대학 분포/프로필 준비) — rlrj 요청으로 제거
  const _kpiBar = '';
  // 뷰 전환(카드형/상세형/리스트/심플형) 버튼은 별도의 고정 세그먼트 컨트롤로 분리 —
  // 아래 필터바(가로 스크롤)에 섞여 있으면 모바일에서 원하는 뷰 버튼을 찾으려 계속 스크롤해야 하는 문제가 있었음
  const _streamerViewModeMeta = {
    gallery:{icon:'🪪',label:'카드형',title:'카드형 대시보드 보기',action:"totalViewMode='gallery';try{localStorage.setItem('su_streamer_view_mode','gallery');}catch(e){};_bulkEditMode=false;render()"},
    focus:{icon:'🧾',label:'상세형',title:'좌측 목록 + 우측 상세 보기',action:"if(totalViewMode!=='focus')totalFocusPlayer='';totalViewMode='focus';try{localStorage.setItem('su_streamer_view_mode','focus');}catch(e){};_bulkEditMode=false;render()"},
    table:{icon:'☰',label:'리스트',title:'리스트 보기',action:"totalViewMode='table';try{localStorage.setItem('su_streamer_view_mode','table');}catch(e){};_bulkEditMode=false;render()"},
    simple:{icon:'✨',label:'심플형',title:'여백을 줄인 한 줄 미니멀 리스트',action:"totalViewMode='simple';try{localStorage.setItem('su_streamer_view_mode','simple');}catch(e){};_bulkEditMode=false;render()"}
  };
  // TabVis: OFF(비로그인 숨김) 처리된 보기 방식은 비로그인 사용자에게 버튼 자체를 숨김
  // (단, 'table'은 폴백 기본값이므로 항상 최소 하나는 남도록 필터에서 제외하지 않음)
  const _streamerViewModeIds = Object.keys(_streamerViewModeMeta).filter(id => id==='table' ||
    !(window.TabVis && typeof window.TabVis.visible === 'function') || window.TabVis.visible('total.mode.' + id));
  const _viewSeg = `<div class="streamer-viewmode-seg" role="tablist" aria-label="스트리머 보기 방식">
    ${_streamerViewModeIds.map(id => `<button class="streamer-viewmode-btn ${totalViewMode===id?'on':''}" onclick="${_streamerViewModeMeta[id].action}" title="${_streamerViewModeMeta[id].title}"><span class="streamer-viewmode-ico">${_streamerViewModeMeta[id].icon}</span><span class="streamer-viewmode-txt">${_streamerViewModeMeta[id].label}</span></button>`).join('')}
  </div>`;
  // 모바일 전용: 위 버튼들을 한 줄 드롭다운 트리거로 대체 (streamer-viewmode-seg는 CSS로 숨김)
  window._streamerViewModeItems = _streamerViewModeIds.map(id=>({id, icon:_streamerViewModeMeta[id].icon, label:_streamerViewModeMeta[id].label, action:_streamerViewModeMeta[id].action, active:totalViewMode===id}));
  const _curStreamerVm = _streamerViewModeMeta[totalViewMode] || _streamerViewModeMeta.table;
  const _viewSegMobile = `<button type="button" class="mode-select-trigger mode-select-trigger--block" onclick="_toggleModePopover(this,'보기 방식',window._streamerViewModeItems)">
    <span class="mode-select-trigger-main"><span class="mode-select-trigger-ico">${_curStreamerVm.icon}</span><span class="mode-select-trigger-label">${_curStreamerVm.label}</span></span>
    <span class="mode-select-trigger-caret">▾</span>
  </button>`;
  // (모바일/태블릿) 검색창이 커서 버튼들이 2줄로 밀리는 문제 방지
  // - 한 줄 유지 + 가로 스크롤(드래그)로 접근
  const _genderBtn=(g,label)=>`<button class="pill ${totalGenderFilter===g?'on':''}" onclick="totalGenderFilter='${g}';render()">${label}</button>`;
  const _univShortcutBtn=`<button type="button" class="pill streamer-univ-shortcut-btn ${totalUnivFilter?'on':''}" onclick="_toggleUnivShortcutPopover(this)" title="대학 바로가기">🏫${totalUnivFilter?`<span class="streamer-univ-shortcut-name">${totalUnivFilter}</span>`:' 대학 바로가기'}</button>`;
  let filterBar=`<div class="streamer-toolbar-card">
    ${_viewSeg}
    ${_viewSegMobile}
    <div class="fbar utilbar utilbar--scroll" style="flex-wrap:nowrap;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    ${raceOpts.map(r=>`<button class="pill ${totalRaceFilter===r?'on':''}" data-race="${r}" onclick="totalRaceFilter='${r}';render()">${r==='전체'?'전체':RNAME[r]||r}</button>`).join('')}
    <span class="fbar-divider"></span>
    <input id="total-search" class="streamer-search" type="text" value="${(totalSearch||'').replace(/"/g,'&quot;')}" placeholder="🔍 이름/대학/티어/직책 + (테/저/프, 남/여) 검색..."
      oncompositionstart="window._tsComp=true"
      oncompositionend="window._tsComp=false;totalSearch=this.value;totalApplySearchFilter()"
      oninput="totalSearch=this.value;if(!window._tsComp)totalApplySearchFilter()"
      autocomplete="off" spellcheck="false">
    <button class="pill ${totalHideNoRecord?'on warn-on':''}" onclick="totalHideNoRecord=!totalHideNoRecord;render()">전적없음 숨김</button>
    <span class="fbar-divider"></span>
    ${_genderBtn('전체','전체')}${_genderBtn('M','남자만 보기')}${_genderBtn('F','여자만 보기')}
    ${_univShortcutBtn}
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
    <col class="col-hide-mobile" style="width:70px"><col class="col-hide-mobile" style="width:80px">
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
    ${isLoggedIn?'<th class="no-export" style="text-align:center;white-space:nowrap;padding:8px 10px">관리</th>':''}
  </tr></thead><tbody>`;


  // 전체 순위 맵 (points 기준)
  const _allRanked = [..._pl].filter(p=>!p.retired).sort((a,b)=>(b.points||0)-(a.points||0)||(b.win||0)-(a.win||0));
  const _rankMap = {};
  _allRanked.forEach((p,i) => { _rankMap[p.name] = i+1; });

  // 갤러리 뷰 분기
  if(totalViewMode==='gallery'){
    C.innerHTML=`<div class="streamer-shell" data-st-mode="${_streamerTabDesignMode}" data-st-layout="${_streamerTabLayoutMode}" data-st-ui="${_streamerTabUiMode}" data-st-view="${totalViewMode}">
      ${_renderTopChrome('카드형 대시보드 중심으로 스트리머를 정리해 사진, 대학, 티어와 핵심 수치를 한 번에 읽기 쉽게 구성했습니다.', true)}
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
    if(totalUnivFilter && u.name!==totalUnivFilter) return;
    const _isHiddenUniv=isLoggedIn&&u.hidden;
    let up=_univScMap.get(u.name) || [];
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalGenderFilter!=='전체') up=up.filter(p=>p.gender===totalGenderFilter);
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
          <span class="clickable-univ streamer-univ-badge" onclick="openUnivModal('${escJS(u.name)}')" style="background:${u.color}">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','26px'):'26px'))}<span style="color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.55)">${u.name}</span></span>
          ${u.dissolved?`<span style="font-size:10px;background:rgba(0,0,0,.35);color:#fca5a5;border-radius:4px;padding:1px 6px;font-weight:700">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''}
          ${_isHiddenUniv?`<span style="font-size:10px;background:rgba(0,0,0,.4);border-radius:4px;padding:1px 6px;font-weight:700">🚫 방문자 숨김</span>`:''}
        </div>
        ${_hdrTextPos === 'center' ? _textHtml : ''}
        <span class="streamer-univ-count">${_univTotal}명</span>
        ${_hdrTextPos === 'right' ? _textHtml : ''}
      </div>
    </td></tr>`;
    // 스트리머 탭: 항상 직책→티어→포인트 순 (현황판 수동 순서 무시)
    const sorted = [...up].sort((a,b)=>getRoleOrder(a.role,a)-getRoleOrder(b.role,b)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||((b.points||0)-(a.points||0)));
    // 직책자와 일반 선수 분리
    const _rolePl = sorted.filter(p=>p.role&&roleIsMain(p.role));
    const _normalPl = sorted.filter(p=>!p.role||!roleIsMain(p.role));
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
            ${p.photo?`<span class="streamer-avatar${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim())?' ph-swap':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" title="스트리머 상세">${p.race||'?'}<img ${_imgLoadAttr} decoding="async" src="${toThumbUrl(p.photo,96)}" data-orig="${toHttpsUrl(p.photo)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="_thumbFallback(this)">${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim()&&typeof _phSwap2ndHTML==='function')?_phSwap2ndHTML(p.secondProfileFile,{style:'border-radius:inherit'}):''}</span>`:`<span class="streamer-avatar">${p.race||'?'}</span>`}
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
            ${p.photo?`<span class="streamer-avatar${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim())?' ph-swap':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" title="스트리머 상세">${p.race||'?'}<img ${_imgLoadAttr} decoding="async" src="${toThumbUrl(p.photo,72)}" data-orig="${toHttpsUrl(p.photo)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="_thumbFallback(this)">${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim()&&typeof _phSwap2ndHTML==='function')?_phSwap2ndHTML(p.secondProfileFile,{style:'border-radius:inherit'}):''}</span>`:`<span class="streamer-avatar">${p.race||'?'}</span>`}
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
    ${_renderTopChrome('대학별 구성을 유지하면서도 검색, 필터, 순위를 더 보기 좋고 빠르게 파악할 수 있도록 정리했습니다.', false)}
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

