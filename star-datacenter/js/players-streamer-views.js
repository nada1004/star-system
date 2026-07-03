function rTotal(C,T){
  T.innerText='🎬 전체 스타크래프트 스트리머 리스트';
  try{ _bindTotalDelegatedEvents(); }catch(e){}
  const _streamerTabDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_streamer_tab_design_mode')||'classic').trim(); return ['classic','glass','vivid','obsidian','aurora','blush','paper','mono'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
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
  const _ncols=(isLoggedIn?11:10)+(_showBulk?1:0);
  const _viewLabel=totalViewMode==='gallery'?'카드형':(totalViewMode==='focus'?'상세형':'리스트형');
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
  // (모바일/태블릿) 검색창이 커서 버튼들이 2줄로 밀리는 문제 방지
  // - 한 줄 유지 + 가로 스크롤(드래그)로 접근
  let filterBar=`<div class="streamer-toolbar-card"><div class="fbar utilbar utilbar--scroll" style="flex-wrap:nowrap;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    ${raceOpts.map(r=>`<button class="pill ${totalRaceFilter===r?'on':''}" onclick="totalRaceFilter='${r}';render()">${r==='전체'?'전체':RNAME[r]||r}</button>`).join('')}
    <span style="color:var(--border2);align-self:center">│</span>
    <input id="total-search" class="streamer-search" type="text" value="${(totalSearch||'').replace(/"/g,'&quot;')}" placeholder="🔍 이름/대학/티어/직책 + (테/저/프, 남/여) 검색..."
      oncompositionstart="window._tsComp=true"
      oncompositionend="window._tsComp=false;totalSearch=this.value;totalApplySearchFilter()"
      oninput="totalSearch=this.value;if(!window._tsComp)totalApplySearchFilter()"
      autocomplete="off" spellcheck="false">
    <button class="pill ${totalHideNoRecord?'on warn-on':''}" onclick="totalHideNoRecord=!totalHideNoRecord;render()">전적없음 숨김</button>
    <span style="color:var(--border2);align-self:center">│</span>
    <button class="pill ${totalViewMode==='gallery'?'on':''}" onclick="totalViewMode='gallery';try{localStorage.setItem('su_streamer_view_mode','gallery');}catch(e){};_bulkEditMode=false;render()" title="카드형 대시보드 보기">🪪 카드형</button>
    <button class="pill ${totalViewMode==='focus'?'on':''}" onclick="if(totalViewMode!=='focus')totalFocusPlayer='';totalViewMode='focus';try{localStorage.setItem('su_streamer_view_mode','focus');}catch(e){};_bulkEditMode=false;render()" title="좌측 목록 + 우측 상세 보기">🧾 상세형</button>
    <button class="pill ${totalViewMode==='table'?'on':''}" onclick="totalViewMode='table';try{localStorage.setItem('su_streamer_view_mode','table');}catch(e){};_bulkEditMode=false;render()" title="리스트 보기">☰ 리스트</button>
    ${totalViewMode==='table'?(isLoggedIn?`<button class="pill ${_bulkEditMode?'on edit-on':''}" onclick="toggleBulkEditMode()">일괄 수정</button>`:''):''}
    ${totalViewMode==='table'?(isLoggedIn?`<button class="pill" onclick="openMergePlayersModal()">🔀 병합</button>`:''):''}
    ${_showBulk&&totalViewMode==='table'?`<button class="pill ${_bulkEditSelected.size>0?'on':''}" onclick="clearBulkEditSelection()" style="${_bulkEditSelected.size>0?'background:#ef4444;border-color:#ef4444;color:#fff':''}">선택 초기화</button>
      <button id="bulk-edit-apply-btn" onclick="openBulkEditModal()" style="padding:4px 12px;border-radius:12px;border:1.5px solid #2563eb;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700;cursor:pointer;display:${_bulkEditSelected.size>0?'inline-flex':'none'};align-items:center;gap:4px">✏️ <span id="bulk-edit-cnt">${_bulkEditSelected.size}</span>명 수정</button>
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

    let tableHTML=`<div class="streamer-content-card"><div class="streamer-table-wrap"><table class="streamer-table"><colgroup>
    ${_showBulk?'<col style="width:36px">':''}
    <col style="width:52px"><col style="width:80px"><col style="width:60px"><col style="width:220px"><col class="col-hide-mobile" style="width:50px">
    <col style="width:52px"><col style="width:52px">
    <col style="width:70px"><col style="width:80px"><col style="width:60px">
    ${isLoggedIn?'<col style="width:70px">':''}
  </colgroup><thead><tr>
    ${_showBulk?`<th style="text-align:center;padding:8px 4px"><input type="checkbox" id="bulk-check-all" onchange="bulkEditToggleAll(this.checked)" style="cursor:pointer"></th>`:''}
    <th style="text-align:center;white-space:nowrap;padding:8px 6px">순위</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">티어</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 8px">종족</th>
    <th style="text-align:left;padding:8px 12px">스트리머</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">승</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">패</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">승률</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">포인트</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">ELO</th>
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

  let totalShown=0;
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
    const _hdrTextPos = u.streamerHeaderTextPos || localStorage.getItem('su_univ_header_text_pos') || 'right';
    // 그라데이션 스타일 결정
    let _gradientStyle = '';
    if (_hdrGradient || (!_hdrBgImg && !_hdrGradient)) {
      const gMode = _hdrGradient || (localStorage.getItem('su_univ_header_gradient') || 'left-to-right');
      // 대학별 설정 우선, 없으면 전역 설정 사용
      const gLen = Math.max(20, Math.min(100, parseInt(u.streamerHeaderGradientLen || localStorage.getItem('su_univ_header_gradient_length') || '70', 10) || 70));
      const gColorRaw = u.streamerHeaderGradientColor || localStorage.getItem('su_univ_header_gradient_color') || '#ffffff';
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
      if(typeof p.photo==='string' && p.photo.trim()) _visiblePhotoUrls.push(p.photo.trim());
      tableHTML+=`<tr class="streamer-row ${_pRank===1?'top1':_pRank===2?'top2':_pRank===3?'top3':''} ${p.inactive?'inactive':''} ${p.retired?'retired':''}" data-player-row="1" data-univ="${u.name}" data-q="${_q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}">
        ${_showBulk?`<td style="text-align:center;padding:7px 4px"><input type="checkbox" data-player-name="${_pSafe}" ${_bulkEditSelected.has(p.name)?'checked':''} onchange="toggleBulkEditPlayer('${_pSafe}',this.checked)" style="cursor:pointer;width:15px;height:15px"></td>`:''}
        <td style="text-align:center;white-space:nowrap;padding:5px 4px">
          <div class="streamer-rank-box">
          <div style="font-size:11px;font-weight:900;color:var(--text2);line-height:1.2">${_pRank||'-'}</div>
          <div>${_pChange}</div>
          </div>
        </td>
        <td style="text-align:center;white-space:nowrap;padding:7px 10px">${getTierBadge(p.tier)}</td>
        <td style="text-align:center;white-space:nowrap;padding:7px 8px"><span class="rbadge r${p.race}" style="font-size:11px">${p.race||'?'}</span></td>
        <td style="text-align:left;padding:6px 12px;white-space:nowrap">
          <span class="streamer-player-cell">
            ${p.photo?`<span class="streamer-avatar" data-tp-action="open-player" data-tp-player="${_pAttr}" title="스트리머 상세">${p.race||'?'}<img loading="eager" fetchpriority="high" src="${toHttpsUrl(p.photo)}" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.style.display='none'"></span>`:'<span class="streamer-avatar"></span>'}
            <span class="streamer-name-stack">
              <span class="streamer-name-line">${p.role?`${getRoleBadgeHTML(p.role,'10px')} `:''}<span class="clickable-name streamer-name-link" data-tp-action="open-player" data-tp-player="${_pAttr}">${p.name}</span>${p.retired?'<span style="font-size:10px;background:#e2e8f0;color:#64748b;border-radius:4px;padding:1px 5px;font-weight:700">🎗️ 은퇴</span>':''}${p.inactive?'<span style="font-size:10px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 5px;font-weight:700">⏸️ 휴학</span>':''}</span>
              <span class="streamer-mini-meta">${genderIcon(p.gender)}${getStatusIconHTML(p.name)}</span>
            </span>
          </span>
        </td>
        <td class="col-hide-mobile wt streamer-stat-num" style="text-align:center;white-space:nowrap;padding:7px 10px;font-weight:900;color:var(--text1)">${win}</td>
        <td class="col-hide-mobile lt streamer-stat-num" style="text-align:center;white-space:nowrap;padding:7px 10px;font-weight:900;color:var(--text1)">${loss}</td>
        <td style="text-align:center;white-space:nowrap;padding:7px 10px;font-weight:700;color:${games===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">
          <div class="streamer-wr-box">
          ${games?wr+'%':'-'}${games?`<span style="font-size:9px;color:var(--gray-l);font-weight:400">${games}전</span>`:''}
          </div>
        </td>
        <td class="col-hide-mobile ${pC(points)}" style="text-align:center;white-space:nowrap;padding:7px 10px;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${pS(points)}</td>
        <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:7px 10px"><span class="streamer-elo-chip" style="color:${elo>=ELO_DEFAULT?'#2563eb':'#dc2626'}">${elo}</span></td>
        <td class="col-hide-mobile" style="text-align:center;padding:7px 4px"></td>
        ${isLoggedIn?`<td class="no-export" style="text-align:center;white-space:nowrap;padding:7px 8px">${adminBtn(`<button class="btn btn-w btn-xs" onclick="openEPFromModal('${_pSafe}')">✏️ 수정</button>`)}</td>`:''}
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
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_visiblePhotoUrls, _visiblePhotoUrls.length); }catch(e){}
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
    const _gHdrTextPos = u.streamerHeaderTextPos || localStorage.getItem('su_univ_header_text_pos') || 'right';
    // 그라데이션 스타일 결정
    let _gGradientStyle = '';
    if (_gHdrGradient || (!_gHdrBgImg && !_gHdrGradient)) {
      const gMode = _gHdrGradient || (localStorage.getItem('su_univ_header_gradient') || 'left-to-right');
      // 대학별 설정 우선, 없으면 전역 설정 사용
      const gLen = Math.max(20, Math.min(100, parseInt(u.streamerHeaderGradientLen || localStorage.getItem('su_univ_header_gradient_length') || '70', 10) || 70));
      const gColorRaw = u.streamerHeaderGradientColor || localStorage.getItem('su_univ_header_gradient_color') || '#ffffff';
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
      <span class="ubadge streamer-gallery-univ clickable-univ" data-icon-done="1" onclick="event.stopPropagation();openUnivModal('${_uSafe}')" style="color:#fff;display:inline-flex;align-items:center;gap:4px;font-size:12px">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','20px'):'20px'))}${u.name}</span>
      ${_gHdrTextPos === 'center' ? _gTextHtml : ''}
      <span style="font-size:11px;color:rgba(255,255,255,.85);font-weight:700;position:relative;z-index:1">${up.length}명</span>
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
      const photoMap=(window.playerPhotos&&typeof window.playerPhotos==='object')?window.playerPhotos:{};
      const photoSrcRaw=(typeof p.photo==='string'&&p.photo.trim())?p.photo.trim():String(photoMap[p.name]||'').trim();
      const _posUse=(p.photoPosUse!==false);
      const _posX=Number(p.photoPosX), _posY=Number(p.photoPosY);
      const photoPos=(_posUse && Number.isFinite(_posX) && Number.isFinite(_posY)) ? `${_posX}% ${_posY}%` : 'top center';
      if(photoSrcRaw) _galleryPhotoUrls.push(photoSrcRaw);
      html+=`<div class="streamer-gallery-card ${p.inactive?'inactive':''} ${p.retired?'retired':''} ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-player-card="1" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}"
        data-tp-action="open-player" data-tp-player="${_pAttr}"
        style="--card-accent:${clr};background:#0b1120;border-color:rgba(255,255,255,.14);backdrop-filter:blur(1px)"
        onmouseenter="try{if(typeof _prewarmPlayerModalImages==='function'){var _pp=window.players&&window.players.find(function(x){return x.name==='${_pSafe}'});if(_pp)_prewarmPlayerModalImages(_pp);}}catch(e){}">
        ${photoSrcRaw
          ? `<img loading="eager" fetchpriority="high" src="${toHttpsUrl(photoSrcRaw)}" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${photoPos}" onerror="this.parentNode.querySelector('.gc-placeholder').style.display='flex';this.style.display='none'">`
          : ''}
        <div class="gc-placeholder" style="position:absolute;inset:0;display:${photoSrcRaw?'none':'flex'};align-items:center;justify-content:center;font-size:36px;font-weight:900;color:${clr};background:linear-gradient(160deg,${clr}28 0%,${clr}10 100%)">${p.race||'?'}</div>
        ${photoSrcRaw ? '' : '<div class="streamer-gallery-overlay"></div>'}
        <div class="streamer-gallery-bottom streamer-gallery-bottom--compact">
          <div class="streamer-gallery-topline">
            <div class="streamer-gallery-name" title="${p.name}">${p.name}${genderIcon(p.gender)}</div>
            ${getStatusIconHTML(p.name)}
          </div>
          <div class="streamer-gallery-brief">
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
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_galleryPhotoUrls, _galleryPhotoUrls.length); }catch(e){}
  return html;
}

// 상세형 - "사진+리스트형" 두번째 레이아웃 전용 스타일 (최초 1회만 주입)
;(function _injectFocusCardStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('focus-card-detail-style')) return;
  const s=document.createElement('style');
  s.id='focus-card-detail-style';
  s.textContent=[
    '.streamer-focus-card2{display:flex;gap:0;border-radius:22px;overflow:hidden;background:var(--panel,#fff);border:1px solid rgba(148,163,184,.18);box-shadow:0 16px 32px rgba(15,23,42,.08);min-height:420px}',
    '.streamer-focus-card2-photo{position:relative;flex:0 0 42%;min-width:220px;overflow:hidden;background:#e2e8f0}',
    '.streamer-focus-card2-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}',
    '.streamer-focus-card2-photo .streamer-focus-photo-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:64px;font-weight:900;color:rgba(15,23,42,.28)}',
    '.streamer-focus-card2-info{flex:1;min-width:0;padding:26px 28px 22px;display:flex;flex-direction:column}',
    '.streamer-focus-card2-name{font-size:24px;font-weight:950;letter-spacing:-.02em;color:var(--text1);margin-bottom:14px}',
    '.streamer-focus-card2-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 2px;border-bottom:1px dashed rgba(148,163,184,.38)}',
    '.streamer-focus-card2-row:last-child{border-bottom:none}',
    '.streamer-focus-card2-label{font-size:13px;font-weight:700;color:var(--text3)}',
    '.streamer-focus-card2-value{font-size:15px;font-weight:900;color:var(--text1);text-align:right}',
    '.streamer-focus-card2-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}',
    '@media (max-width:768px){.streamer-focus-card2{flex-direction:column;min-height:0}.streamer-focus-card2-photo{flex:0 0 auto;aspect-ratio:4/3}}',
    'body.dark .streamer-focus-card2{background:#0f172a;border-color:#334155}',
    'body.dark .streamer-focus-card2-row{border-color:#334155}'
  ].join('');
  document.head.appendChild(s);
})();

function _buildFocusCardDetail(selected, opts){
  const { selUniv, selColor, selWin, selLoss, selGames, selWr, selAttr } = opts;
  const photoSrc = selected.photo ? toHttpsUrl(selected.photo) : '';
  const raceLabel = selected.race==='P'?'프로토스':selected.race==='T'?'테란':selected.race==='Z'?'저그':'미정';
  const rows = [
    ['역할', selected.role || '일반'],
    ['티어', selected.tier ? `${selected.tier}티어` : '미정'],
    ['종족', raceLabel],
    ['소속대학', selUniv || '무소속'],
    ['전적', selGames ? `${selWin}승 ${selLoss}패` : '기록 없음'],
    ['승률', selWr==null ? '-' : `${selWr}%`]
  ];
  return `<div class="streamer-focus-main">
    <div class="streamer-focus-card2">
      <div class="streamer-focus-card2-photo">
        ${photoSrc ? `<img src="${photoSrc}" alt="${selected.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
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
        </div>
      </div>
    </div>
  </div>`;
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
  orderedUnivs.forEach(univName=>{
    const members = groups.get(univName);
    if(!members || !members.length) return;
    const u = (typeof getAllUnivs === 'function' ? getAllUnivs().find(x=>x.name===univName) : null) || { name:univName, color:'#64748b' };
    const color = u.color || '#64748b';
    listHtml += `<section class="streamer-focus-group">
      <div class="streamer-focus-group-title" data-focus-univ-header="${u.name}" style="background:linear-gradient(135deg,${color},color-mix(in srgb, ${color} 68%, #ffffff))">
        <span style="display:inline-flex;align-items:center;gap:6px">${u.name && u.name!=='무소속' ? gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','18px'):'18px')) : '🏷️'}<span class="${u.name&&u.name!=='무소속'?'clickable-univ':''}" ${u.name&&u.name!=='무소속'?`onclick="event.stopPropagation();openUnivModal('${u.name.replace(/'/g,"\\'")}')"`:''}>${u.name}</span></span>
        <span style="font-size:11px;color:rgba(255,255,255,.82)">${members.length}명</span>
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
      listHtml += `<div class="streamer-focus-card ${selected && selected.name===p.name?'active':''}" data-focus-row="1" data-focus-name="${(typeof escAttr==='function'?escAttr(p.name):p.name)}" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}" onclick="try{var _sl=document.querySelector('.streamer-focus-list');if(_sl)window._streamerFocusScrollTop=_sl.scrollTop;}catch(e){};totalFocusPlayer='${_pSafe}';render()">
        ${photoSrc ? `<img loading="eager" fetchpriority="high" src="${toHttpsUrl(photoSrc)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none'">` : ''}
        <div class="streamer-focus-card-fallback" style="display:${photoSrc?'none':'flex'}">${p.race||'?'}</div>
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
  const heroPhotoUrl = selected.photo ? toHttpsUrl(selected.photo).replace(/'/g,'%27').replace(/"/g,'%22') : '';
  const heroPhotoUrl2Src = String(selected.secondProfileFile||'').trim();
  const heroPhotoUrl2 = heroPhotoUrl2Src ? toHttpsUrl(heroPhotoUrl2Src).replace(/'/g,'%27').replace(/"/g,'%22') : '';
  const heroPhoto2Use = (selected.photo2PosUse !== false);
  const heroPhoto2PosX = Number(selected.photo2PosX), heroPhoto2PosY = Number(selected.photo2PosY);
  const heroPhoto2Pos = (heroPhoto2Use && Number.isFinite(heroPhoto2PosX) && Number.isFinite(heroPhoto2PosY)) ? `${heroPhoto2PosX}% ${heroPhoto2PosY}%` : 'top center';
  const detailHtml = (totalFocusDetailStyle === 'card')
    ? _buildFocusCardDetail(selected, { selUniv, selColor, selWin, selLoss, selGames, selWr, selAttr })
    : `<div class="streamer-focus-main">
    <div class="streamer-focus-main-hero" style="background:linear-gradient(135deg,color-mix(in srgb, ${selColor} 28%, #0f172a),${selColor})">
      ${heroPhotoUrl ? `<div class="streamer-focus-hero-bg" style="background-image:url('${heroPhotoUrl}')"></div>` : ''}
      ${(heroPhotoUrl2 || heroPhotoUrl) ? `<div class="streamer-focus-hero-bg2" style="background-image:url('${heroPhotoUrl2 || heroPhotoUrl}');--hero-bg2-op:${heroPhotoUrl2 ? '.11' : '.05'};--hero-bg2-pos:${heroPhotoUrl2 ? heroPhoto2Pos : 'top center'};--hero-bg2-left:${heroPhotoUrl2 ? '46%' : '54%'};--hero-bg2-scale:${heroPhotoUrl2 ? '1.02' : '1.05'}"></div>` : ''}
      <div class="streamer-focus-photo">
        ${selected.photo ? `<img src="${toHttpsUrl(selected.photo)}" alt="${selected.name}">` : ''}
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
      <div class="streamer-focus-section-title" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span>스트리머 선택</span>
        <span style="display:inline-flex;gap:4px">
          <button class="pill ${totalFocusDetailStyle==='hero'?'on':''}" style="padding:4px 10px;font-size:11px" onclick="totalFocusDetailStyle='hero';try{localStorage.setItem('su_focus_detail_style','hero');}catch(e){};render()" title="기본형">🖼️ 기본</button>
          <button class="pill ${totalFocusDetailStyle==='card'?'on':''}" style="padding:4px 10px;font-size:11px" onclick="totalFocusDetailStyle='card';try{localStorage.setItem('su_focus_detail_style','card');}catch(e){};render()" title="사진+리스트형">📋 리스트</button>
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
    <div style="margin-bottom:14px;padding:10px;background:var(--surface);border-radius:8px;font-size:12px;color:var(--text2)">
      <strong style="color:var(--blue)">${sel.length}명</strong> 선택됨: ${first.join(', ')}${more?` 외 ${more}명`:''}
      ${more?`<details style="margin-top:8px"><summary style="cursor:pointer;color:var(--gray-l);font-size:11px">전체 보기</summary><div style="margin-top:6px;line-height:1.6">${sel.join(', ')}</div></details>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">티어</label>
        <select id="bulk-ed-t" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <option value="">변경 안함</option>${tierOpts}
        </select>
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">대학</label>
        <select id="bulk-ed-u" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <option value="">변경 안함</option>${univOpts}
        </select>
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">종족</label>
        <select id="bulk-ed-r" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <option value="">변경 안함</option>
          <option value="T">테란</option><option value="Z">저그</option><option value="P">프로토스</option><option value="N">종족미정</option>
        </select>
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">성별</label>
        <select id="bulk-ed-g" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <option value="">변경 안함</option>
          <option value="F">👩 여자</option><option value="M">👨 남자</option>
        </select>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:4px">
      <label style="font-size:12px;font-weight:700;color:var(--text2)">현황판</label>
      <select id="bulk-ed-h" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
        <option value="">변경 안함</option>
        <option value="hide">제외 (숨김)</option>
        <option value="show">표시</option>
      </select>
      <button onclick="bulkDeleteSelected()" style="margin-left:auto;padding:6px 14px;border-radius:8px;border:1.5px solid #ef4444;background:#fef2f2;color:#dc2626;font-size:12px;font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
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
  modal.innerHTML=`<div style="background:var(--white);border-radius:16px;padding:18px 18px 16px;width:520px;max-width:100%;box-shadow:0 10px 50px rgba(0,0,0,.35)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:15px">🔀 스트리머 병합</div>
      <button class="btn btn-w btn-xs" onclick="document.getElementById('${modalId}').remove()">닫기</button>
    </div>
    <div style="font-size:12px;color:var(--text3);line-height:1.6;margin-bottom:12px">
      A(원본)를 B(대상)로 합칩니다. 모든 기록/대진/현황판에서 A 이름을 B로 치환합니다.
    </div>
    <datalist id="_mergePlayersList">${list.map(n=>`<option value="${escAttr(n)}"></option>`).join('')}</datalist>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:4px">A (원본)</div>
        <input id="_mergeFrom" list="_mergePlayersList" placeholder="예: 닉네임(오타)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:10px;box-sizing:border-box">
      </div>
      <div style="flex:1;min-width:220px">
        <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:4px">B (대상)</div>
        <input id="_mergeTo" list="_mergePlayersList" placeholder="예: 닉네임(정상)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:10px;box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text3);cursor:pointer">
        <input id="_mergeDel" type="checkbox" checked style="width:15px;height:15px;cursor:pointer"> A(원본) 스트리머 삭제
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text3);cursor:pointer">
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
