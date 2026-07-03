function preparePlayerDetailStyleData(player){
  const p = player;
  if(!p){
    return {
      col:'#6366f1', winC:'#dc2626', lossC:'#94a3b8', cWin:'#dc2626', cLoss:'#94a3b8',
      pdStyle:{}, isMobile:false, isTablet:false, hdrBg:'linear-gradient(135deg,#6366f1,#6366f1ee)',
      p2h:(v=>'00'), statsTint:8, modeTint:10,
      pmCardR:18, pmHdrPad:'18px 18px 16px', pmPhotoSz:76, pmPhotoR:16, pmNameFs:20,
      pmMetaFs:11, pmMetaPad:'3px 10px', pmMetaPad2:'3px 9px', pmStatsPad:'14px 6px',
      pmStatsNum1:14, pmStatsBig:22,
      chipFs:'9px', chipPad:'2px 6px', chipR:'8px', designMode:'classic', layoutMode:'default', pastelVars:null, univBtnEnabled:false
    };
  }
  const col=gc(p.univ)||'#6366f1';
  const winC ='#dc2626';
  const lossC='#94a3b8';
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
  const CPM={light:{win:'#ef4444',loss:'#9ca3af'},normal:{win:'#dc2626',loss:'#94a3b8'},dark:{win:'#f87171',loss:'#cbd5e1'}};
  const cp=CPM[pdStyle.color_preset||'normal'];
  const cWin=cp.win;
  const cLoss=cp.loss;
  const _validDesignModes=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora','studio','blush','obsidian'];
  const _validLayoutModes=['default','photocard','showcase','stats','split','banner','poster','timeline','board'];
  const designMode=_validDesignModes.includes(pdStyle.design_mode) ? pdStyle.design_mode : 'classic';
  const layoutMode=_validLayoutModes.includes(pdStyle.layout_mode) ? pdStyle.layout_mode : 'default';
  const _hexToRgb = (hex) => {
    const s = String(hex||'').trim();
    const m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if(!m) return null;
    let h = m[1];
    if(h.length===3) h = h.split('').map(ch=>ch+ch).join('');
    const n = parseInt(h, 16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  };
  const _rgbToHex = (r,g,b) => {
    const to = (v)=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');
    return `#${to(r)}${to(g)}${to(b)}`;
  };
  const _mix = (c1, c2, t) => {
    const a=_hexToRgb(c1); const b=_hexToRgb(c2);
    if(!a || !b) return c1;
    const tt=Math.max(0,Math.min(1,Number(t)||0));
    return _rgbToHex(
      a.r*(1-tt)+b.r*tt,
      a.g*(1-tt)+b.g*tt,
      a.b*(1-tt)+b.b*tt
    );
  };
  const _rgba = (hex, a) => {
    const c=_hexToRgb(hex);
    if(!c) return `rgba(0,0,0,${a})`;
    const aa=Math.max(0,Math.min(1,Number(a)||0));
    return `rgba(${c.r},${c.g},${c.b},${aa})`;
  };
  let modalBgVars = null;
  let pastelVars = null;
  let hdrBgEff = hdrBg;
  const bgScope = ['header','body','cards'].includes(pdStyle.univ_bg_scope) ? pdStyle.univ_bg_scope : 'cards';
  if(designMode==='pastel'){
    const base = col;
    const bg1 = _mix(base, '#ffffff', .92);
    const bg2 = _mix(base, '#ffffff', .84);
    const card = _mix(base, '#ffffff', .965);
    const border = _mix(base, '#ffffff', .70);
    const accent1 = _mix(base, '#ffffff', .36);
    const accent2 = _mix(base, '#ffffff', .18);
    const accent3 = _mix(base, '#ffffff', .52);
    const text1 = _mix(base, '#0b1020', .78);
    const text2 = _mix(base, '#0b1020', .62);
    pastelVars = {
      '--su-pastel-bg1': bg1,
      '--su-pastel-bg2': bg2,
      '--su-pastel-card': card,
      '--su-pastel-border': border,
      '--su-pastel-accent1': accent1,
      '--su-pastel-accent2': accent2,
      '--su-pastel-accent3': accent3,
      '--su-pastel-text1': text1,
      '--su-pastel-text2': text2,
      '--su-pastel-shadow': _rgba(base, .18),
      '--su-pastel-glow': _rgba(base, .28)
    };
    hdrBgEff = darken>0
      ? `linear-gradient(rgba(0,0,0,${darken}),rgba(0,0,0,${darken})),linear-gradient(135deg,${accent2},${accent1})`
      : `linear-gradient(135deg,${accent2},${accent1})`;
  }
  if(pdStyle.univ_bg_enabled===true){
    const tintRaw = parseInt(pdStyle.univ_bg_tint ?? 18, 10);
    const tint = isNaN(tintRaw) ? 18 : Math.max(0, Math.min(60, tintRaw));
    const usePastel = pdStyle.univ_bg_pastel!==undefined ? !!pdStyle.univ_bg_pastel : true;
    const baseBg = usePastel ? _mix(col, '#ffffff', .58) : col;
    const headerStrong = Math.max(0.06, tint/100);
    const headerSoft = Math.max(0.02, headerStrong*.38);
    const bodyTop = Math.max(0.03, headerStrong*.52);
    const bodyBottom = Math.max(0.015, headerStrong*.18);
    const boxBottom = Math.max(0.018, headerStrong*.22);
    const cardTop = Math.max(0.04, headerStrong*.56);
    const cardBottom = Math.max(0.02, headerStrong*.24);
    modalBgVars = {
      '--su-pd-modal-box-bg': `linear-gradient(180deg,rgba(255,255,255,.988),${_rgba(baseBg, boxBottom)})`,
      '--su-pd-modal-box-border': _rgba(baseBg, Math.max(.16, headerStrong*.95)),
      '--su-pd-modal-title-bg': `linear-gradient(135deg,${_rgba(baseBg, headerStrong)},rgba(255,255,255,.94) 72%,${_rgba(baseBg, headerSoft)})`,
      '--su-pd-modal-body-bg': `linear-gradient(180deg,${_rgba(baseBg, bodyTop)},rgba(248,250,252,.94) 28%,${_rgba(baseBg, bodyBottom)} 100%)`,
      '--su-pd-hero-bg': `linear-gradient(180deg,${_rgba(baseBg, cardTop)},rgba(255,255,255,.96) 56%,${_rgba(baseBg, cardBottom)} 100%)`,
      '--su-pd-strip-bg': `linear-gradient(135deg,rgba(255,255,255,.98),${_rgba(baseBg, cardBottom)})`,
      '--su-pd-card-bg': `linear-gradient(180deg,rgba(255,255,255,.985),${_rgba(baseBg, cardTop)})`,
      '--su-pd-card-border': _rgba(baseBg, Math.max(.14, headerStrong*.78)),
      '--su-pd-card-chip-bg': _rgba(baseBg, Math.max(.08, headerStrong*.58)),
      '--su-pd-card-btn-bg': `linear-gradient(135deg,${_rgba(baseBg, Math.max(.16, headerStrong*.9))},rgba(255,255,255,.92))`,
      '--su-pd-card-btn-border': _rgba(baseBg, Math.max(.24, headerStrong*1.15)),
      '--su-pd-card-btn-text': _mix(col, '#0b1020', .42)
    };
  }
  const univBtnEnabled = !!pdStyle.univ_btn_enabled;
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
    col, winC, lossC, cWin, cLoss, pdStyle, isMobile, isTablet, hdrBg:hdrBgEff, hdrBgLayer, p2h, statsTint, modeTint,
    pmCardR, pmHdrPad, pmPhotoSz, pmPhotoR, pmNameFs, pmMetaFs, pmMetaPad, pmMetaPad2,
      pmStatsPad, pmStatsNum1, pmStatsBig, chipFs, chipPad, chipR, designMode, layoutMode, pastelVars, modalBgVars, bgScope, univBtnEnabled
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
