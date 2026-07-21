function prepareUnivDetailStyleData(univName){
  const col=gc(univName);
  const w = (typeof window!=='undefined' && window.innerWidth) ? window.innerWidth : 1200;
  const isMobile = w<=768;
  const isTablet = (w>768 && w<=1024);
  const members = getMembers(univName);
  const ucfg=(typeof _getUnivCfg==='function') ? _getUnivCfg(univName) : ((univCfg||[]).find(u=>u.name===univName)||{});
  let udStyle={};
  try{ udStyle = JSON.parse(localStorage.getItem('su_ud_style')||'{}') || {}; }catch(e){ udStyle={}; }
  const logoSize = (typeof getUnivLogoSizeStr==='function')
    ? getUnivLogoSizeStr(univName, 'detail', 'var(--su_univ_logo_size_detail,132px)')
    : 'var(--su_univ_logo_size_detail,132px)';
  const logoSizeEff = `calc(${logoSize} * var(--su_univ_detail_scale,1))`;
  const bgImg=(ucfg.detailHeaderBgImg||udStyle.header_bg_img||'').trim();
  const bgFit=(ucfg.detailHeaderBgFit||udStyle.header_bg_fit||'contain').trim();
  const bgScale=Math.max(40, Math.min(220, Number(ucfg.detailHeaderBgScale||udStyle.header_bg_scale||100)||100));
  const bgPosX=Math.max(0, Math.min(100, Number(ucfg.detailHeaderBgPosX ?? udStyle.header_bg_pos_x ?? 50) || 50));
  const bgPosY=Math.max(0, Math.min(100, Number(ucfg.detailHeaderBgPosY ?? udStyle.header_bg_pos_y ?? 50) || 50));
  const _validUdModes=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora','studio','blush','obsidian'];
  const _validUdLayouts=['default','photocard','showcase','stats','split','banner','poster','timeline','board'];
  const designMode = _validUdModes.includes(udStyle.design_mode) ? udStyle.design_mode : 'classic';
  const layoutMode = _validUdLayouts.includes(udStyle.layout_mode) ? udStyle.layout_mode : 'default';
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
  let hdrBgEff = `linear-gradient(135deg,${col},${col}cc)`;
  const bgScope = ['header','body','cards'].includes(udStyle.univ_bg_scope) ? udStyle.univ_bg_scope : 'cards';
  if(designMode==='pastel'){
    const base = col || '#6366f1';
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
    hdrBgEff = `linear-gradient(135deg,${accent2},${accent1})`;
  }
  if(udStyle.univ_bg_enabled===true){
    const tintRaw = parseInt(udStyle.univ_bg_tint ?? 18, 10);
    const tint = isNaN(tintRaw) ? 18 : Math.max(0, Math.min(60, tintRaw));
    const usePastel = udStyle.univ_bg_pastel!==undefined ? !!udStyle.univ_bg_pastel : true;
    const baseBg = usePastel ? _mix(col || '#6366f1', '#ffffff', .58) : (col || '#6366f1');
    const headerStrong = Math.max(0.06, tint/100);
    const headerSoft = Math.max(0.02, headerStrong*.38);
    const bodyTop = Math.max(0.03, headerStrong*.52);
    const bodyBottom = Math.max(0.015, headerStrong*.18);
    const boxBottom = Math.max(0.018, headerStrong*.22);
    const cardTop = Math.max(0.04, headerStrong*.56);
    const cardBottom = Math.max(0.02, headerStrong*.24);
    modalBgVars = {
      '--su-ud-modal-box-bg': `linear-gradient(180deg,rgba(255,255,255,.988),${_rgba(baseBg, boxBottom)})`,
      '--su-ud-modal-box-border': _rgba(baseBg, Math.max(.16, headerStrong*.95)),
      '--su-ud-modal-title-bg': `linear-gradient(135deg,${_rgba(baseBg, headerStrong)},rgba(255,255,255,.94) 72%,${_rgba(baseBg, headerSoft)})`,
      '--su-ud-modal-body-bg': `linear-gradient(180deg,${_rgba(baseBg, bodyTop)},rgba(248,250,252,.94) 28%,${_rgba(baseBg, bodyBottom)} 100%)`,
      '--su-ud-hero-bg': `linear-gradient(180deg,${_rgba(baseBg, cardTop)},rgba(255,255,255,.96) 56%,${_rgba(baseBg, cardBottom)} 100%)`,
      '--su-ud-card-bg': `linear-gradient(180deg,rgba(255,255,255,.985),${_rgba(baseBg, cardTop)})`,
      '--su-ud-card-border': _rgba(baseBg, Math.max(.14, headerStrong*.78)),
      '--su-ud-card-btn-bg': `linear-gradient(135deg,${_rgba(baseBg, Math.max(.16, headerStrong*.9))},rgba(255,255,255,.92))`,
      '--su-ud-card-btn-border': _rgba(baseBg, Math.max(.24, headerStrong*1.15)),
      '--su-ud-card-btn-text': _mix(col || '#6366f1', '#0b1020', .42)
    };
  }
  const univBtnEnabled = !!udStyle.univ_btn_enabled;
  return {
    col,
    isMobile,
    isTablet,
    members,
    ucfg,
    udStyle,
    logoSize,
    logoSizeEff,
    hdrBg:hdrBgEff,
    hdrBgLayer:bgImg ? { url:bgImg, fit:(bgFit==='fill'?'fill':bgFit==='cover'?'cover':'contain'), scale:bgScale, posX:bgPosX, posY:bgPosY } : null,
    designMode,
    layoutMode,
    pastelVars,
    modalBgVars,
    bgScope,
    univBtnEnabled
  };
}

try{
  window.prepareUnivDetailStyleData = prepareUnivDetailStyleData;
}catch(e){}
