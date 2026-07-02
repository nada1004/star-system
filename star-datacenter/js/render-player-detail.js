function buildPlayerDetailHTML(p){
  if(typeof ensureRenderMatchIdsPrepared==='function') ensureRenderMatchIdsPrepared();
  const _pdState = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});

  const _style = (typeof preparePlayerDetailStyleData==='function')
    ? preparePlayerDetailStyleData(p)
    : null;
  const col = _style?.col || (gc(p.univ)||'#6366f1');
  const _winC = _style?.winC || '#16a34a';
  const _lossC = _style?.lossC || '#dc2626';
  const _pdStyle = _style?.pdStyle || {};
  const _isMobile = _style?.isMobile || (window.innerWidth<=768);
  const _isTablet = _style?.isTablet || (window.innerWidth>768 && window.innerWidth<=1024);
  const _hdrBg = _style?.hdrBg || `linear-gradient(135deg,${col},${col}ee)`;
  const _hdrBgLayer = _style?.hdrBgLayer || null;
  const _p2h = _style?.p2h || (v=>Math.max(0,Math.min(255,Math.round(v*2.55))).toString(16).padStart(2,'0'));
  const _statsTint = _style?.statsTint ?? 8;
  const _modeTint = _style?.modeTint ?? 10;
  const _cWin = _style?.cWin || _winC;
  const _cLoss = _style?.cLoss || _lossC;
  const _designMode = _style?.designMode || 'classic';
  const _layoutMode = _style?.layoutMode || 'default';
  const _year=_pdState.year||'';
  const _histBase = (typeof preparePlayerHistoryBaseData==='function')
    ? preparePlayerHistoryBaseData(p)
    : null;
  const _normMap = _histBase?.normMap || ((v)=>{ const s=String(v||'-'); return s.replace(/^📍\s*/,'').trim() || '-'; });
  const _histDupKey = _histBase?.histDupKey || (h=>{
    if(h?.matchId) return `mid:${h.matchId}`;
    const date = (h?.date||'').trim();
    const map = _normMap(h?.map||'-');
    const opp = (h?.opp||'').trim();
    const mode = (h?.mode||'').trim();
    const result = (h?.result||'').trim();
    return `${date}|${map}|${[p.name,opp].filter(x=>x).sort().join('|')}|${mode}|${result}`;
  });
  const _dedupedHistory = _histBase?.dedupedHistory || (p.history||[]);
  const _histNoResSet = _histBase?.histNoResSet || new Set();
  const _hasDetailedKey = _histBase?.hasDetailedKey || new Set();
  const _prunedHistory = _histBase?.prunedHistory || _dedupedHistory;
  const _prunedHistory2 = _histBase?.prunedHistory2 || _prunedHistory;
  const _existingMatchIds = _histBase?.existingMatchIds || new Set(_prunedHistory2.map(h=>h.matchId).filter(Boolean));
  const _existingKeys = _histBase?.existingKeys || new Set(_prunedHistory2.map(h=>_histDupKey(h)));

  const _histAll = (typeof collectPlayerExtraHistoryData==='function')
    ? collectPlayerExtraHistoryData({
        player: p,
        dedupedHistory: _dedupedHistory,
        prunedHistory: _prunedHistory,
        prunedHistory2: _prunedHistory2,
        existingMatchIds: _existingMatchIds,
        existingKeys: _existingKeys,
        histNoResSet: _histNoResSet,
        histDupKey: _histDupKey,
        normMap: _normMap,
        hasDetailedKey: _hasDetailedKey
      }).histAll
    : [..._prunedHistory2];
  const _computed = (typeof preparePlayerDetailComputedData==='function')
    ? preparePlayerDetailComputedData({
        player: p,
        histAll: _histAll,
        year: _year,
        normMap: _normMap,
        modeTint: _modeTint,
        cWin: _cWin,
        cLoss: _cLoss
      })
    : null;
  const _hist = _computed?.hist || _histAll;
  const _modeHist = _computed?.modeHist || _hist;
  const _availYears = _computed?.availYears || [];
  const opps = _computed?.opps || {};
  const vsUnivs = _computed?.vsUnivs || [];
  const rv = _computed?.rv || {T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0},N:{w:0,l:0}};
  const tot = _computed?.tot ?? (p.win+p.loss);
  const wr = _computed?.wr ?? (tot?Math.round(p.win/tot*100):0);
  const eloVal = _computed?.eloVal ?? (p.elo||ELO_DEFAULT);
  const eloColor = _computed?.eloColor || (eloVal>=1400?'#7c3aed':eloVal>=1300?'#d97706':eloVal>=1200?'#16a34a':'#dc2626');

  const _headerPrep = (typeof preparePlayerHeaderDisplayData==='function')
    ? preparePlayerHeaderDisplayData({
        player: p,
        isMobile: _isMobile,
        isTablet: _isTablet,
        histAll: _histAll,
        eloVal,
        winColor: _cWin,
        lossColor: _cLoss
      })
    : {};
  const _photoHTML = _headerPrep.photoHTML || '';
  const _channelHTML = _headerPrep.channelHTML || '';
  const _eloSparkHTML = _headerPrep.eloSparkHTML || '';

  const _pmCardR = _style?.pmCardR ?? (_isMobile ? 14 : (_isTablet ? 16 : 18));
  const _pmHdrPad = _style?.pmHdrPad || (_isMobile ? '14px 14px 12px' : (_isTablet ? '16px 16px 14px' : '18px 18px 16px'));
  const _pmPhotoSz = _style?.pmPhotoSz ?? (_isMobile ? 62 : (_isTablet ? 70 : 76));
  const _pmPhotoR = _style?.pmPhotoR ?? (_isMobile ? 14 : 16);
  const _pmNameFs = _style?.pmNameFs ?? (_isMobile ? 17 : (_isTablet ? 18 : 20));
  const _pmMetaFs = _style?.pmMetaFs ?? (_isMobile ? 9 : 11);
  const _pmMetaPad = _style?.pmMetaPad || (_isMobile ? '2px 7px' : '3px 10px');
  const _pmMetaPad2 = _style?.pmMetaPad2 || (_isMobile ? '2px 7px' : '3px 9px');
  const _pmStatsPad = _style?.pmStatsPad || (_isMobile ? '10px 6px' : (_isTablet ? '12px 6px' : '14px 6px'));
  const _pmStatsNum1 = _style?.pmStatsNum1 ?? (_isMobile ? 13 : 14);
  const _pmStatsBig = _style?.pmStatsBig ?? (_isMobile ? 18 : 22);

  const _secHeader = (typeof buildPlayerHeaderCardHTML==='function')
    ? buildPlayerHeaderCardHTML({
        player: p,
        hdrBg: _hdrBg,
        hdrBgLayer: _hdrBgLayer,
        photoHTML: _photoHTML,
        channelHTML: _channelHTML,
        col,
        p2h: _p2h,
        statsTint: _statsTint,
        pmCardR: _pmCardR,
        pmHdrPad: _pmHdrPad,
        pmPhotoSz: _pmPhotoSz,
        pmPhotoR: _pmPhotoR,
        pmNameFs: _pmNameFs,
        pmMetaFs: _pmMetaFs,
        pmMetaPad: _pmMetaPad,
        pmMetaPad2: _pmMetaPad2,
        pmStatsPad: _pmStatsPad,
        pmStatsNum1: _pmStatsNum1,
        pmStatsBig: _pmStatsBig,
        tot,
        wr,
        cWin: _cWin,
        cLoss: _cLoss,
        histAll: _histAll,
        eloVal,
        eloColor,
        eloSparkHTML: _eloSparkHTML,
        layoutMode: _layoutMode
      })
    : '';

  const _secStrip = (typeof buildPlayerSummaryStripHTML==='function')
    ? buildPlayerSummaryStripHTML({
        histAll: _histAll,
        player: p,
        cWin: _cWin,
        cLoss: _cLoss
      })
    : '';

  const _chipFs = _style?.chipFs || '9px';
  const _chipPad = _style?.chipPad || '2px 6px';
  const _chipR = _style?.chipR || '8px';
  const _filterPrep = (typeof preparePlayerFilterBarData==='function')
    ? preparePlayerFilterBarData({
        histAll: _histAll,
        modeHist: _modeHist,
        availYears: _availYears,
        selectedYear: _year,
        playerName: p.name,
        chipFs: _chipFs,
        chipPad: _chipPad,
        chipR: _chipR,
        isMobile: _isMobile
      })
    : null;
  const _histFilterBar = _filterPrep?.histFilterBar || '';
  const _yearBar = _filterPrep?.yearBar || '';

  const _secYearBar = _yearBar;

  const _eloChartPts=_computed?.eloChartPts || _modeHist.filter(h=>h.eloDelta!=null||h.eloAfter!=null);
  const _secEloChart = (_eloChartPts.length>=3) ? `<div class="pd-elo-chart-card" style="background:var(--white);border:1.5px solid var(--border2);border-radius:14px;padding:14px 16px;margin-bottom:14px">
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:3px;height:14px;background:#7c3aed;border-radius:2px"></span>
        ELO 변화 추이${_year?` (${_year}년)`:''}
        <span style="font-size:10px;color:var(--gray-l);font-weight:400;margin-left:4px">${_eloChartPts.length}경기</span>
        <span style="font-size:10px;font-weight:700;margin-left:auto;color:${eloColor}">${eloVal}</span>
      </div>
      <div style="position:relative">
        <canvas id="pEloChart" style="width:100%;height:140px;display:block"></canvas>
        <div id="pEloTip" style="position:absolute;display:none;background:rgba(15,23,42,.92);color:#fff;font-size:10px;padding:6px 9px;border-radius:8px;pointer-events:none;white-space:nowrap;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,.3)"></div>
      </div>
    </div>` : '';

  const _modeColors=_computed?.modeColors || {'미니대전':'#7c3aed','대학대전':'#2563eb','대학CK':'#dc2626','끝장전':'#8b5cf6','개인전':'#0891b2','티어대회':'#f59e0b','대회':'#d97706','프로리그':'#16a34a'};
  const _fixedModes=_computed?.fixedModes || [];
  const _secModeStats = (typeof buildPlayerModeStatsHTML==='function')
    ? buildPlayerModeStatsHTML({
        fixedModes: _fixedModes,
        modeColors: _modeColors,
        modeTint: _modeTint,
        cWin: _cWin,
        cLoss: _cLoss
      })
    : '';

  const _secMapStats = (typeof buildPlayerMapStatsHTML==='function')
    ? buildPlayerMapStatsHTML(_modeHist)
    : '';

  const _secRaceStats = (typeof buildPlayerRaceStatsHTML==='function')
    ? buildPlayerRaceStatsHTML(_modeHist)
    : '';

  const _secVsUniv = (typeof buildPlayerVsUnivSectionHTML==='function')
    ? buildPlayerVsUnivSectionHTML({
        rows: vsUnivs,
        playerName: p.name,
        maxVisible: 6
      })
    : '';

  if(!_pdState.oppSort) _pdState.oppSort='tot';
  if(!_pdState.oppPage) _pdState.oppPage=0;
  const _secOppTable = (typeof buildPlayerOppTableHTML==='function')
    ? buildPlayerOppTableHTML({
        opps,
        pName: p.name,
        oppSort: _pdState.oppSort,
        oppPage: _pdState.oppPage
      })
    : '';

  let _secRecent = '';
  let _secHistFilterBar = '';
  if(_modeHist.length){
    _secHistFilterBar = _histFilterBar;
    const _recentPrep = (typeof preparePlayerRecentSectionData==='function')
      ? preparePlayerRecentSectionData({
          player: p,
          modeHist: _modeHist,
          seasonsList: (typeof seasons!=='undefined' && seasons) ? seasons : [],
          pageSize: HIST_PAGE_SIZE||20
        })
      : null;
    const seasonBar = _recentPrep?.seasonBar || '';
    const totalGames = _recentPrep?.totalGames || 0;
    const totalPages = _recentPrep?.totalPages || 1;
    const curPage = _recentPrep?.curPage || 0;
    const displayHist = _recentPrep?.displayHist || [];
    const fromN = _recentPrep?.fromN || 0;
    const toN = _recentPrep?.toN || 0;
    _secRecent = (typeof buildPlayerRecentHistorySectionHTML==='function')
      ? buildPlayerRecentHistorySectionHTML({
          pName: p.name,
          totalGames,
          fromN,
          toN,
          isLoggedIn,
          bulkMode: _playerHistBulkMode,
          bulkSelectedSet: _playerHistBulkSelected,
          seasonBar,
          displayHist,
          curPage,
          totalPages
        })
      : '';
  }

  const _secTeammates = (typeof buildPlayerTeammatesHTML==='function')
    ? buildPlayerTeammatesHTML({ player:p, col })
    : '';

  const _secMemo = (isLoggedIn && (typeof buildPlayerMemoHTML==='function'))
    ? buildPlayerMemoHTML(p)
    : '';

  let h='';
  if(_layoutMode==='poster'){
    h = `<div class="pd-layout pd-layout--poster">
      <div class="pd-layout-top">${_secHeader}${_secStrip}</div>
      <div class="pd-layout-grid">
        <div class="pd-layout-main">${_secYearBar}${_secEloChart}${_secHistFilterBar}${_secRecent}${_secOppTable}</div>
        <div class="pd-layout-side">${_secModeStats}${_secMapStats}${_secRaceStats}${_secVsUniv}${_secTeammates}${_secMemo}</div>
      </div>
    </div>`;
  }else if(_layoutMode==='split'){
    h = `<div class="pd-layout pd-layout--split">
      <div class="pd-split-left">${_secHeader}${_secStrip}${_secYearBar}</div>
      <div class="pd-split-right">${_secEloChart}${_secModeStats}${_secMapStats}${_secRaceStats}${_secVsUniv}${_secOppTable}${_secHistFilterBar}${_secRecent}${_secTeammates}${_secMemo}</div>
    </div>`;
  }else if(_layoutMode==='timeline'){
    h = `<div class="pd-layout pd-layout--timeline">
      <div class="pd-layout-top">${_secHeader}${_secStrip}</div>
      <div class="pd-layout-grid">
        <div class="pd-layout-main">${_secYearBar}${_secHistFilterBar}${_secRecent}</div>
        <div class="pd-layout-side">${_secEloChart}${_secModeStats}${_secMapStats}${_secRaceStats}${_secVsUniv}${_secOppTable}${_secTeammates}${_secMemo}</div>
      </div>
    </div>`;
  }else if(_layoutMode==='board'){
    h = `<div class="pd-layout pd-layout--board">
      ${_secHeader}
      <div class="pd-board-grid">${_secStrip}${_secEloChart}${_secModeStats}${_secMapStats}${_secRaceStats}${_secVsUniv}</div>
      ${_secYearBar}${_secOppTable}${_secHistFilterBar}${_secRecent}${_secTeammates}${_secMemo}
    </div>`;
  }else{
    h = `${_secHeader}${_secStrip}${_secYearBar}${_secEloChart}${_secModeStats}${_secMapStats}${_secRaceStats}${_secVsUniv}${_secOppTable}${_secHistFilterBar}${_secRecent}${_secTeammates}${_secMemo}`;
  }

  // ELO 차트는 p.history만이 아니라 개인전/끝장전/대회 등 외부 매치소스까지 합쳐진
  // _modeHist(통합 기록) 기준으로 그려야 하므로, initPEloChart가 재사용할 수 있게 캐시해둔다.
  try{
    window._pEloChartDataCache = window._pEloChartDataCache || {};
    window._pEloChartDataCache[p.name] = _eloChartPts;
  }catch(e){}

  const _modeDecor = (typeof buildPlayerDetailModeDecorHTML==='function') ? buildPlayerDetailModeDecorHTML(_designMode) : '';
  try{
    const _pm = document.getElementById('playerModal');
    if(_pm){
      _pm.setAttribute('data-pd-mode', _designMode);
      _pm.setAttribute('data-pd-layout', _layoutMode);
      _pm.setAttribute('data-pd-univbg-enabled', _style?.modalBgVars ? '1' : '0');
      _pm.setAttribute('data-pd-univbg-scope', _style?.bgScope || 'body');
      const keys=['--su-pastel-bg1','--su-pastel-bg2','--su-pastel-card','--su-pastel-border','--su-pastel-accent1','--su-pastel-accent2','--su-pastel-accent3','--su-pastel-text1','--su-pastel-text2','--su-pastel-shadow','--su-pastel-glow'];
      const modalKeys=['--su-pd-modal-box-bg','--su-pd-modal-box-border','--su-pd-modal-title-bg','--su-pd-modal-body-bg','--su-pd-hero-bg','--su-pd-strip-bg','--su-pd-card-bg','--su-pd-card-border','--su-pd-card-chip-bg'];
      if(_designMode==='pastel' && _style?.pastelVars){
        keys.forEach(k=>{
          const v=_style.pastelVars[k];
          if(v!=null && v!=='') _pm.style.setProperty(k, String(v));
        });
      }else{
        keys.forEach(k=>{ try{ _pm.style.removeProperty(k); }catch(e){} });
      }
      if(_style?.modalBgVars){
        modalKeys.forEach(k=>{
          const v=_style.modalBgVars[k];
          if(v!=null && v!=='') _pm.style.setProperty(k, String(v));
          else try{ _pm.style.removeProperty(k); }catch(e){}
        });
      }else{
        modalKeys.forEach(k=>{ try{ _pm.style.removeProperty(k); }catch(e){} });
      }
    }
  }catch(e){}
  return `<div class="pd-premium-shell" data-pd-mode="${_designMode}" data-pd-layout="${_layoutMode}">${_modeDecor}${h}</div>`;
}

try{
  window.buildPlayerDetailHTML = buildPlayerDetailHTML;
}catch(e){}
