function preparePlayerDetailStyleData(player){
  const p = player;
  if(!p){
    return {
      col:'#6366f1', winC:'#16a34a', lossC:'#dc2626', cWin:'#16a34a', cLoss:'#dc2626',
      pdStyle:{}, isMobile:false, isTablet:false, hdrBg:'linear-gradient(135deg,#6366f1,#6366f1ee)',
      p2h:(v=>'00'), statsTint:8, modeTint:10,
      pmCardR:18, pmHdrPad:'18px 18px 16px', pmPhotoSz:76, pmPhotoR:16, pmNameFs:20,
      pmMetaFs:11, pmMetaPad:'3px 10px', pmMetaPad2:'3px 9px', pmStatsPad:'14px 6px',
      pmStatsNum1:14, pmStatsBig:22,
      chipFs:'9px', chipPad:'2px 6px', chipR:'8px', designMode:'classic'
    };
  }
  const col=gc(p.univ)||'#6366f1';
  const winC ='#16a34a';
  const lossC='#dc2626';
  const pdStyle=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  const darken=((pdStyle.univ_darken||{})[p.univ]||0);
  const isMobile=window.innerWidth<=768;
  const isTablet=(window.innerWidth>768 && window.innerWidth<=1024);
  const imgUrlLegacy=isMobile?(pdStyle.img2||''):(pdStyle.img1||'');
  const imgUrl=(p.detailHeaderBgImg||pdStyle.header_bg_img||imgUrlLegacy||'').trim();
  const imgSettings=(typeof suReadImgSettings==='function')
    ? suReadImgSettings()
    : (JSON.parse(localStorage.getItem('su_img_settings')||'{}'));
  const useRight = !!imgSettings.useRightScale;
  const scaleMul = useRight
    ? (isMobile ? (imgSettings.scaleLeft||1) : (imgSettings.scaleRight||1))
    : (imgSettings.scale||1);
  const imgZoom=(Number(p.detailHeaderBgScale||pdStyle.header_bg_scale||pdStyle.img_zoom||100)||100) * scaleMul;
  const hasImgFillSetting = typeof imgSettings.fill === 'boolean';
  const imgFit=(p.detailHeaderBgFit||pdStyle.header_bg_fit||'').trim();
  const _posKwToPct = (raw, axis) => {
    const s = String(raw||'').trim().toLowerCase();
    if(axis==='x') return s.includes('left') ? 0 : (s.includes('right') ? 100 : 50);
    return s.includes('top') ? 0 : (s.includes('bottom') ? 100 : 50);
  };
  const _numOr = (raw, fallback) => {
    const n = parseInt(String(raw??'').replace('%','').trim(), 10);
    return isNaN(n) ? fallback : Math.max(0, Math.min(100, n));
  };
  const _posRaw = (p.detailHeaderBgPos||pdStyle.header_bg_pos||'center center').trim();
  const _posX = _numOr((p.detailHeaderBgPosX ?? pdStyle.header_bg_pos_x), _posKwToPct(_posRaw,'x'));
  const _posY = _numOr((p.detailHeaderBgPosY ?? pdStyle.header_bg_pos_y), _posKwToPct(_posRaw,'y'));
  const imgPos=`${_posX}% ${_posY}%`;
  const imgFill=imgFit || (hasImgFillSetting
    ? (imgSettings.fill ? 'cover' : 'contain')
    : ((pdStyle.img_fill!=null && pdStyle.img_fill!=='') ? pdStyle.img_fill : 'contain'));
  const hdrBg=darken>0
    ?`linear-gradient(rgba(0,0,0,${darken}),rgba(0,0,0,${darken})),linear-gradient(135deg,${col},${col}ee)`
    :`linear-gradient(135deg,${col},${col}ee)`;
  const hdrBgLayer = imgUrl ? {
    url: imgUrl,
    fit: (imgFill==='fill' ? 'fill' : imgFill==='cover' ? 'cover' : 'contain'),
    scale: Math.max(40, Math.min(220, imgZoom||100)),
    pos: imgPos || 'center center'
  } : null;
  const p2h=v=>Math.max(0,Math.min(255,Math.round(v*2.55))).toString(16).padStart(2,'0');
  const statsTint=pdStyle.stats_tint!==undefined?pdStyle.stats_tint:8;
  const modeTint=pdStyle.mode_tint!==undefined?pdStyle.mode_tint:10;
  const CPM={light:{win:'#22c55e',loss:'#f87171'},normal:{win:'#16a34a',loss:'#dc2626'},dark:{win:'#15803d',loss:'#b91c1c'}};
  const cp=CPM[pdStyle.color_preset||'normal'];
  const cWin=cp.win;
  const cLoss=cp.loss;
  const _validDesignModes=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora'];
  const designMode=_validDesignModes.includes(pdStyle.design_mode) ? pdStyle.design_mode : 'classic';
  const pmCardR = isMobile ? 14 : (isTablet ? 16 : 18);
  const pmHdrPad = isMobile ? '14px 14px 12px' : (isTablet ? '16px 16px 14px' : '18px 18px 16px');
  const _profileBase = isMobile ? 62 : (isTablet ? 70 : 76);
  const _profileScale = Math.max(50, Math.min(180, parseInt(pdStyle.profile_size ?? 100, 10) || 100)) / 100;
  const pmPhotoSz = Math.round(_profileBase * _profileScale);
  const pmPhotoR = isMobile ? 14 : 16;
  const pmNameFs = isMobile ? 17 : (isTablet ? 18 : 20);
  const pmMetaFs = isMobile ? 9 : 11;
  const pmMetaPad = isMobile ? '2px 7px' : '3px 10px';
  const pmMetaPad2 = isMobile ? '2px 7px' : '3px 9px';
  const pmStatsPad = isMobile ? '10px 6px' : (isTablet ? '12px 6px' : '14px 6px');
  const pmStatsNum1 = isMobile ? 13 : 14;
  const pmStatsBig = isMobile ? 18 : 22;
  const chipScale = 'var(--su_pd_chip_scale,1)';
  const chipFsBase = isMobile ? 8 : (isTablet ? 9 : 9);
  const chipPadYBase = isMobile ? 1 : 2;
  const chipPadXBase = isMobile ? 5 : 6;
  const chipRBase = isMobile ? 7 : 8;
  const chipFs = `calc(${chipFsBase}px * ${chipScale})`;
  const chipPad = `calc(${chipPadYBase}px * ${chipScale}) calc(${chipPadXBase}px * ${chipScale})`;
  const chipR = `calc(${chipRBase}px * ${chipScale})`;
  return {
    col, winC, lossC, cWin, cLoss, pdStyle, isMobile, isTablet, hdrBg, hdrBgLayer, p2h, statsTint, modeTint,
    pmCardR, pmHdrPad, pmPhotoSz, pmPhotoR, pmNameFs, pmMetaFs, pmMetaPad, pmMetaPad2,
    pmStatsPad, pmStatsNum1, pmStatsBig, chipFs, chipPad, chipR, designMode
  };
}

function preparePlayerFilterBarData(opts){
  const {
    histAll=[],
    modeHist=[],
    availYears=[],
    selectedYear='',
    playerName='',
    chipFs='9px',
    chipPad='2px 6px',
    chipR='8px',
    isMobile=false
  } = opts || {};
  const allModes=[...new Set(histAll.map(h=>h.mode||'').filter(Boolean))].sort();
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  if(!st.histFilters) st.histFilters=[];
  if(!st.histFilter) st.histFilter='';
  const histFilterBar = (typeof buildPlayerHistFilterBar==='function')
    ? buildPlayerHistFilterBar({
        allModes,
        isLoggedIn,
        selectedFilters: st.histFilters,
        selectedFilter: st.histFilter,
        pName: playerName,
        chipFs,
        chipPad,
        chipR
      })
    : '';
  if(!st.years) st.years=[];
  if(!st.year) st.year='';
  const yearBar = (typeof buildPlayerYearFilterBar==='function')
    ? buildPlayerYearFilterBar({
        availYears,
        isLoggedIn,
        selectedYears: st.years,
        selectedYear,
        modeHist,
        pName: playerName,
        chipFs,
        chipPad,
        chipR,
        isMobile
      })
    : '';
  return { allModes, histFilterBar, yearBar };
}

try{
  window.preparePlayerDetailStyleData = preparePlayerDetailStyleData;
  window.preparePlayerFilterBarData = preparePlayerFilterBarData;
}catch(e){}
