function buildPlayerDetailHTML(p){
  if(typeof ensureRenderMatchIdsPrepared==='function') ensureRenderMatchIdsPrepared();
  const _pdState = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});

  const _style = (typeof preparePlayerDetailStyleData==='function')
    ? preparePlayerDetailStyleData(p)
    : null;
  const col = _style?.col || (gc(p.univ)||'#6366f1');
  const _winC = _style?.winC || '#dc2626';
  const _lossC = _style?.lossC || '#94a3b8';
  const _pdStyle = _style?.pdStyle || {};
  const _isMobile = _style?.isMobile || (window.innerWidth<=768);
  const _isTablet = _style?.isTablet || (window.innerWidth>768 && window.innerWidth<=1024);
  const _hdrBg = _style?.hdrBg || `linear-gradient(135deg,${col},${col}ee)`;
  const _hdrBgLayer = _style?.hdrBgLayer || null;
  const _p2h = _style?.p2h || (v=>Math.max(0,Math.min(255,Math.round(v*2.55))).toString(16).padStart(2,'0'));
  const _statsTint = _style?.statsTint ?? 8;
  const _modeTint = _style?.modeTint ?? 6;
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
      <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px;display:flex;align-items:center;gap:6px">
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

  const _modeColors=_computed?.modeColors || {'미니대전':'#7c3aed','대학대전':'#2563eb','대학CK':'#dc2626','끝장전':'#8b5cf6','개인전':'#0891b2','티어대회':'#f59e0b','대회':'#d97706','프로리그':'#16a34a','프로리그대회':'#0d9488'};
  const _fixedModes=_computed?.fixedModes || [];
  const _secModeStatsRaw = (typeof buildPlayerModeStatsHTML==='function')
    ? buildPlayerModeStatsHTML({
        fixedModes: _fixedModes,
        modeColors: _modeColors,
        modeTint: _modeTint,
        cWin: _cWin,
        cLoss: _cLoss
      })
    : '';
  const _secModeStats = _secModeStatsRaw ? `<div id="pd-jump-mode">${_secModeStatsRaw}</div>` : '';

  const _secMapStatsRaw = (typeof buildPlayerMapStatsHTML==='function')
    ? buildPlayerMapStatsHTML(_modeHist, p.name, _pdState.mapFilter||'')
    : '';
  const _secMapStats = _secMapStatsRaw ? `<div id="pd-jump-map">${_secMapStatsRaw}</div>` : '';

  const _secRaceStatsRaw = (typeof buildPlayerRaceStatsHTML==='function')
    ? buildPlayerRaceStatsHTML(_modeHist)
    : '';
  const _secRaceStats = _secRaceStatsRaw ? `<div id="pd-jump-race">${_secRaceStatsRaw}</div>` : '';

  const _secVsUnivRaw = (typeof buildPlayerVsUnivSectionHTML==='function')
    ? buildPlayerVsUnivSectionHTML({
        rows: vsUnivs,
        playerName: p.name,
        maxVisible: 6
      })
    : '';
  const _secVsUniv = _secVsUnivRaw ? `<div id="pd-jump-vsuniv">${_secVsUnivRaw}</div>` : '';

  if(!_pdState.oppSort) _pdState.oppSort='tot';
  if(!_pdState.oppPage) _pdState.oppPage=0;
  const _secOppTableRaw = (typeof buildPlayerOppTableHTML==='function')
    ? buildPlayerOppTableHTML({
        opps,
        pName: p.name,
        oppSort: _pdState.oppSort,
        oppPage: _pdState.oppPage
      })
    : '';
  const _secOppTable = _secOppTableRaw ? `<div id="pd-jump-opp">${_secOppTableRaw}</div>` : '';

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
    const _mapFilterActive = _recentPrep?.mapFilter || '';
    const _secRecentRaw = (typeof buildPlayerRecentHistorySectionHTML==='function')
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
          totalPages,
          mapFilter: _mapFilterActive,
          histFilterBar: _secHistFilterBar
        })
      : '';
    _secRecent = _secRecentRaw ? `<div id="pd-jump-recent">${_secRecentRaw}</div>` : '';
  }

  const _secMvpHistoryRaw = (typeof buildPlayerMvpHistoryHTML==='function')
    ? buildPlayerMvpHistoryHTML(p)
    : '';
  const _secMvpHistory = _secMvpHistoryRaw ? `<div id="pd-jump-mvp">${_secMvpHistoryRaw}</div>` : '';

  const _secTeammatesRaw = (typeof buildPlayerTeammatesHTML==='function')
    ? buildPlayerTeammatesHTML({ player:p, col })
    : '';
  const _secTeammates = _secTeammatesRaw ? `<div id="pd-jump-teammates">${_secTeammatesRaw}</div>` : '';

  const _secMemoRaw = (isLoggedIn && (typeof buildPlayerMemoHTML==='function'))
    ? buildPlayerMemoHTML(p)
    : '';
  const _secMemo = _secMemoRaw ? `<div id="pd-jump-memo">${_secMemoRaw}</div>` : '';

  // 종목/섹션 바로가기 칩 — 실제 내용이 있는 섹션만 노출
  const _jumpTargets = [
    ['pd-jump-mode', '모드별', _secModeStats],
    ['pd-jump-race', '종족별', _secRaceStats],
    ['pd-jump-vsuniv', '상대 대학', _secVsUniv],
    ['pd-jump-opp', '상대 전적', _secOppTable],
    ['pd-jump-map', '맵별', _secMapStats],
    ['pd-jump-recent', '최근 경기', _secRecent],
    ['pd-jump-mvp', 'MVP', _secMvpHistory],
    ['pd-jump-teammates', '팀원', _secTeammates],
    ['pd-jump-memo', '메모', _secMemo]
  ].filter(([,,html]) => !!html);
  const _secJumpNav = _jumpTargets.length>=3 ? `<div class="pd-jumpnav" style="display:flex;gap:6px;overflow-x:auto;padding:2px 1px 4px;margin-bottom:10px;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    ${_jumpTargets.map(([id,label])=>`<button type="button" onclick="const t=document.getElementById('${id}');if(t)t.scrollIntoView({behavior:'smooth',block:'start'})" style="flex-shrink:0;font-size:11.5px;font-weight:800;padding:6px 12px;border-radius:99px;border:1.5px solid rgba(148,163,184,.28);background:var(--white,#fff);color:var(--text2,#334155);white-space:nowrap;cursor:pointer">${label}</button>`).join('')}
  </div>` : '';

  let h='';
  if(_layoutMode==='board'){
    h = `<div class="pd-layout pd-layout--board">
      ${_secHeader}
      <div class="pd-board-grid">${_secStrip}${_secEloChart}${_secModeStats}${_secRaceStats}${_secVsUniv}</div>
      ${_secJumpNav}${_secMvpHistory}${_secYearBar}${_secOppTable}${_secMapStats}${_secRecent}${_secTeammates}${_secMemo}
    </div>`;
  }else if(_layoutMode==='tabs'){
    const _tabDefs = [
      ['overview','개요', `${_secMvpHistory}${_secEloChart}${_secModeStats}${_secRaceStats}${_secVsUniv}`],
      ['records','전적', `${_secOppTable}`],
      ['recent','최근경기', `${_secYearBar}${_secMapStats}${_secRecent}`],
      ['extra','기타', `${_secTeammates}${_secMemo}`]
    ].filter(([,,html])=>!!html.trim());
    if(!_pdState.pdTab || !_tabDefs.some(([k])=>k===_pdState.pdTab)) _pdState.pdTab = _tabDefs[0]?.[0] || 'overview';
    const _activeTab = _pdState.pdTab;
    const _tabBar = _tabDefs.length>1 ? `<div class="pd-tabbar">
      ${_tabDefs.map(([key,label])=>`<button type="button" class="pd-tabbtn${key===_activeTab?' pd-tabbtn--active':''}" data-pd-tab-btn="${key}" onclick="_pdSwitchTab('${key}')">${label}</button>`).join('')}
    </div>` : '';
    h = `<div class="pd-layout pd-layout--tabs">
      ${_secHeader}${_secStrip}
      ${_tabBar}
      <div class="pd-tabpanels">
        ${_tabDefs.map(([key,,html])=>`<div class="pd-tabpanel" data-pd-tab-panel="${key}"${key===_activeTab?'':' hidden'}>${html}</div>`).join('')}
      </div>
    </div>`;
    if(typeof window._pdSwitchTab !== 'function'){
      window._pdSwitchTab = function(key){
        try{
          const state = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
          state.pdTab = key;
          const panels = document.querySelectorAll('[data-pd-tab-panel]');
          panels.forEach(el=>{ el.hidden = (el.getAttribute('data-pd-tab-panel')!==key); });
          const btns = document.querySelectorAll('[data-pd-tab-btn]');
          btns.forEach(el=>{ el.classList.toggle('pd-tabbtn--active', el.getAttribute('data-pd-tab-btn')===key); });
        }catch(e){}
      };
    }
  }else if(_layoutMode==='report'){
    let _repNum = 0;
    const _repSec = (label, html) => {
      if(!html || !html.trim()) return '';
      _repNum++;
      return `<div class="pd-secblock"><div class="pd-secblock-head"><span class="pd-secblock-num">${String(_repNum).padStart(2,'0')}</span><span class="pd-secblock-label">${label}</span></div><div class="pd-secblock-body">${html}</div></div>`;
    };
    const _repToc = _jumpTargets.length ? `<div class="pd-toc"><div class="pd-toc-title">목차</div>${_jumpTargets.map(([id,label],i)=>`<button type="button" class="pd-toc-item" onclick="const t=document.getElementById('${id}');if(t)t.scrollIntoView({behavior:'smooth',block:'start'})"><span class="pd-toc-num">${String(i+1).padStart(2,'0')}</span>${label}</button>`).join('')}</div>` : '';
    h = `<div class="pd-layout pd-layout--report">
      <div class="pd-report-cover">${_secHeader}${_secStrip}</div>
      ${_repToc}
      ${_repSec('MVP', _secMvpHistory)}
      ${_repSec('연도별 필터', _secYearBar)}
      ${_repSec('ELO 추이', _secEloChart)}
      ${_repSec('모드별 기록', _secModeStats)}
      ${_repSec('종족별 기록', _secRaceStats)}
      ${_repSec('상대 대학', _secVsUniv)}
      ${_repSec('상대 전적', _secOppTable)}
      ${_repSec('맵별 기록', _secMapStats)}
      ${_repSec('최근 경기', `${_secRecent}`)}
      ${_repSec('팀원', _secTeammates)}
      ${_repSec('메모', _secMemo)}
    </div>`;
  }else if(_layoutMode==='flip'){
    const _flipBackHtml = `${_secMvpHistory}${_secYearBar}${_secEloChart}${_secModeStats}${_secRaceStats}${_secVsUniv}${_secOppTable}${_secMapStats}${_secRecent}${_secTeammates}${_secMemo}`;
    if(!_pdState.pdFlipSide) _pdState.pdFlipSide = 'front';
    const _flipSide = _pdState.pdFlipSide;
    h = `<div class="pd-layout pd-layout--flip">
      <div class="pd-flip-face" data-pd-flip-face="front"${_flipSide==='front'?'':' hidden'}>
        ${_secHeader}${_secStrip}
        <button type="button" class="pd-flip-btn" onclick="_pdFlipTo('back')">상세 기록 보기</button>
      </div>
      <div class="pd-flip-face" data-pd-flip-face="back"${_flipSide==='back'?'':' hidden'}>
        <button type="button" class="pd-flip-btn pd-flip-btn--back" onclick="_pdFlipTo('front')">← 앞면으로</button>
        ${_flipBackHtml}
      </div>
    </div>`;
    if(typeof window._pdFlipTo !== 'function'){
      window._pdFlipTo = function(side){
        try{
          const state = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
          state.pdFlipSide = side;
          const faces = document.querySelectorAll('[data-pd-flip-face]');
          faces.forEach(el=>{ el.hidden = (el.getAttribute('data-pd-flip-face')!==side); });
        }catch(e){}
      };
    }
  }else if(_layoutMode==='story'){
    const _storySlides = [
      ['header', `${_secHeader}${_secStrip}`],
      ['overview', `${_secMvpHistory}${_secEloChart}`],
      ['modes', `${_secModeStats}${_secRaceStats}`],
      ['vsuniv', _secVsUniv],
      ['opp', _secOppTable],
      ['recent', `${_secYearBar}${_secMapStats}${_secRecent}`],
      ['extra', `${_secTeammates}${_secMemo}`]
    ].filter(([,html])=>!!html && html.trim());
    h = `<div class="pd-layout pd-layout--story">
      <div class="pd-story-dots">${_storySlides.map((_s,i)=>`<span class="pd-story-dot${i===0?' is-active':''}" data-pd-story-dot="${i}"></span>`).join('')}</div>
      <div class="pd-story-track" id="pdStoryTrack">
        ${_storySlides.map(([,html2],i)=>`<div class="pd-story-slide" data-pd-story-slide="${i}">${html2}</div>`).join('')}
      </div>
    </div>`;
    if(typeof window._pdStoryBind !== 'function'){
      window._pdStoryBind = function(){
        try{
          const track = document.getElementById('pdStoryTrack');
          if(!track || track.dataset.pdStoryBound) return;
          track.dataset.pdStoryBound = '1';
          track.addEventListener('scroll', ()=>{
            const slides = track.querySelectorAll('[data-pd-story-slide]');
            let idx = 0, best = Infinity;
            slides.forEach(s=>{
              const d = Math.abs(s.offsetTop - track.scrollTop);
              if(d < best){ best = d; idx = Number(s.getAttribute('data-pd-story-slide')); }
            });
            document.querySelectorAll('[data-pd-story-dot]').forEach(dot=>{
              dot.classList.toggle('is-active', Number(dot.getAttribute('data-pd-story-dot'))===idx);
            });
          }, {passive:true});
        }catch(e){}
      };
    }
    setTimeout(()=>{ try{ window._pdStoryBind(); }catch(e){} }, 0);
  }else if(_layoutMode==='gallery'){
    const _galEsc = (v)=> (typeof escHTML==='function') ? escHTML(String(v==null?'':v)) : String(v==null?'':v);
    const _galCard = (label, icon, html, wide) => {
      if(!html || !html.trim()) return '';
      return `<div class="pd-gal-card${wide?' pd-gal-card--wide':''}">
        <div class="pd-gal-card-head"><span class="pd-gal-card-icon">${icon}</span><span class="pd-gal-card-label">${label}</span></div>
        <div class="pd-gal-card-body">${html}</div>
      </div>`;
    };
    h = `<div class="pd-layout pd-layout--gallery">
      <div class="pd-gal-hero">
        <span class="pd-gal-glow pd-gal-glow--a"></span>
        <span class="pd-gal-glow pd-gal-glow--b"></span>
        <div class="pd-gal-hero-inner">${_secHeader}${_secStrip}</div>
      </div>
      ${_secJumpNav}
      <div class="pd-gal-grid">
        ${_galCard('하이라이트','🏆',_secMvpHistory,true)}
        ${_galCard('ELO 흐름','📈',_secEloChart,true)}
        ${_galCard('모드별','🎮',_secModeStats)}
        ${_galCard('종족별','🧬',_secRaceStats)}
        ${_galCard('상대 대학','🎓',_secVsUniv)}
        ${_galCard('상대 전적','⚔️',_secOppTable,true)}
        ${_galCard('맵별','🗺️',_secMapStats)}
        ${_galCard('최근 경기','🕒',`${_secYearBar}${_secRecent}`,true)}
        ${_galCard('팀원','🤝',_secTeammates)}
        ${_galCard('메모','📝',_secMemo)}
      </div>
      <div class="pd-gal-foot">${_galEsc(p.name)} · ${_galEsc(p.univ||'무소속')}</div>
    </div>`;
  }else if(_layoutMode==='brief'){
    const _brEsc = (v)=> (typeof escHTML==='function') ? escHTML(String(v==null?'':v)) : String(v==null?'':v);
    const _brDate = (()=>{ try{ const d=new Date(); return `${d.getFullYear()}. ${String(d.getMonth()+1).padStart(2,'0')}. ${String(d.getDate()).padStart(2,'0')}`; }catch(e){ return ''; } })();
    let _brNum = 0;
    const _brSec = (label, html) => {
      if(!html || !html.trim()) return '';
      _brNum++;
      return `<section class="pd-br-sec">
        <h3 class="pd-br-sec-head"><span class="pd-br-sec-num">${String(_brNum).padStart(2,'0')}</span><span class="pd-br-sec-title">${label}</span><span class="pd-br-sec-rule"></span></h3>
        <div class="pd-br-sec-body">${html}</div>
      </section>`;
    };
    h = `<div class="pd-layout pd-layout--brief">
      <div class="pd-br-doc">
        <div class="pd-br-masthead">
          <div class="pd-br-masthead-left">
            <div class="pd-br-kicker">PLAYER PERFORMANCE BRIEF</div>
            <div class="pd-br-title">${_brEsc(p.name)} 전적 분석 보고서</div>
            <div class="pd-br-sub">${_brEsc(p.univ||'무소속')} · 발행일 ${_brDate}</div>
          </div>
          <div class="pd-br-stamp">CONFIDENTIAL<br><span>INTERNAL USE</span></div>
        </div>
        <div class="pd-br-cover">${_secHeader}${_secStrip}</div>
        ${_brSec('요약 하이라이트', _secMvpHistory)}
        ${_brSec('레이팅 추이', _secEloChart)}
        ${_brSec('모드별 성과', _secModeStats)}
        ${_brSec('종족별 성과', _secRaceStats)}
        ${_brSec('대학별 상대 전적', _secVsUniv)}
        ${_brSec('상대 선수 전적', _secOppTable)}
        ${_brSec('맵별 성과', _secMapStats)}
        ${_brSec('경기 로그', `${_secYearBar}${_secRecent}`)}
        ${_brSec('팀 구성', _secTeammates)}
        ${_brSec('비고', _secMemo)}
        <div class="pd-br-colophon">본 문서는 등록된 경기 기록을 기준으로 자동 생성되었습니다.</div>
      </div>
    </div>`;
  }else if(_layoutMode==='analyst'){
    const _anSecs = [
      ['mode','모드별', _secModeStats],
      ['race','종족별', _secRaceStats],
      ['vsuniv','상대 대학', _secVsUniv],
      ['opp','상대 전적', _secOppTable],
      ['map','맵별', _secMapStats],
      ['recent','최근 경기', `${_secYearBar}${_secRecent}`],
      ['mvp','요약 하이라이트', _secMvpHistory],
      ['elo','레이팅 추이', _secEloChart],
      ['team','팀원', _secTeammates],
      ['memo','메모', _secMemo]
    ].filter(([,,html]) => !!html && !!String(html).trim());
    const _anUid = 'pdan' + Math.random().toString(36).slice(2,8);
    const _anIdx = _anSecs.length ? `<nav class="pd-an-side">
      <div class="pd-an-side-title">INDEX</div>
      ${_anSecs.map(([key,label],i)=>`<button type="button" class="pd-an-side-item${i===0?' is-active':''}" data-an-tab="${key}" onclick="if(window.pdAnalystSelect)window.pdAnalystSelect(this,'${_anUid}','${key}')"><span class="pd-an-side-num">${String(i+1).padStart(2,'0')}</span><span class="pd-an-side-label">${label}</span></button>`).join('')}
    </nav>` : '';
    const _anBlock = ([key,label,html],i) => `<section class="pd-an-block${i===0?' is-active':''}" data-an-panel="${key}">
        <div class="pd-an-block-head"><span class="pd-an-label">${label}</span></div>
        <div class="pd-an-block-body">${html}</div>
      </section>`;
    h = `<div class="pd-layout pd-layout--analyst" data-an-uid="${_anUid}">
      <div class="pd-an-hero">${_secHeader}${_secStrip}</div>
      <div class="pd-an-main">
        ${_anIdx}
        <div class="pd-an-content">
          ${_anSecs.map(_anBlock).join('')}
        </div>
      </div>
    </div>`;
  }else{
    h = `${_secHeader}${_secStrip}${_secJumpNav}${_secMvpHistory}${_secYearBar}${_secEloChart}${_secModeStats}${_secRaceStats}${_secVsUniv}${_secOppTable}${_secMapStats}${_secRecent}${_secTeammates}${_secMemo}`;
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
      _pm.setAttribute('data-pd-univbtn-enabled', (_style?.modalBgVars && _style?.univBtnEnabled) ? '1' : '0');
      const keys=['--su-pastel-bg1','--su-pastel-bg2','--su-pastel-card','--su-pastel-border','--su-pastel-accent1','--su-pastel-accent2','--su-pastel-accent3','--su-pastel-text1','--su-pastel-text2','--su-pastel-shadow','--su-pastel-glow'];
      const modalKeys=['--su-pd-modal-box-bg','--su-pd-modal-box-border','--su-pd-modal-title-bg','--su-pd-modal-body-bg','--su-pd-hero-bg','--su-pd-strip-bg','--su-pd-card-bg','--su-pd-card-border','--su-pd-card-chip-bg','--su-pd-card-btn-bg','--su-pd-card-btn-border','--su-pd-card-btn-text'];
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

/* 애널리스트 콘솔: 좌측 INDEX 클릭 시 우측 패널만 전환 (좌측 목록은 유지) */
try{
  window.pdAnalystSelect = function(btn, uid, key){
    const root = document.querySelector('.pd-layout--analyst[data-an-uid="'+uid+'"]') ||
                 (btn && btn.closest ? btn.closest('.pd-layout--analyst') : null);
    if(!root) return;
    root.querySelectorAll('.pd-an-side-item').forEach(function(el){
      el.classList.toggle('is-active', el.getAttribute('data-an-tab')===key);
    });
    root.querySelectorAll('.pd-an-block').forEach(function(el){
      el.classList.toggle('is-active', el.getAttribute('data-an-panel')===key);
    });
    const content = root.querySelector('.pd-an-content');
    if(content && content.scrollIntoView && window.innerWidth<=768){
      content.scrollIntoView({behavior:'smooth', block:'start'});
    }
  };
}catch(e){}
