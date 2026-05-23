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
    ? getUnivLogoSizeStr(univName, 'detail', 'var(--su_univ_logo_size_detail,46px)')
    : 'var(--su_univ_logo_size_detail,46px)';
  const logoSizeEff = `calc(${logoSize} * var(--su_univ_detail_scale,1))`;
  const bgImg=(ucfg.detailHeaderBgImg||udStyle.header_bg_img||'').trim();
  const bgFit=(ucfg.detailHeaderBgFit||udStyle.header_bg_fit||'contain').trim();
  const bgScale=Math.max(40, Math.min(220, Number(ucfg.detailHeaderBgScale||udStyle.header_bg_scale||100)||100));
  return {
    col,
    isMobile,
    isTablet,
    members,
    ucfg,
    udStyle,
    logoSize,
    logoSizeEff,
    hdrBg:`linear-gradient(135deg,${col},${col}cc)`,
    hdrBgLayer:bgImg ? { url:bgImg, fit:(bgFit==='fill'?'fill':bgFit==='cover'?'cover':'contain'), scale:bgScale } : null
  };
}

try{
  window.prepareUnivDetailStyleData = prepareUnivDetailStyleData;
}catch(e){}
