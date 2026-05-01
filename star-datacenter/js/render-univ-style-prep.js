function prepareUnivDetailStyleData(univName){
  const col=gc(univName);
  const w = (typeof window!=='undefined' && window.innerWidth) ? window.innerWidth : 1200;
  const isMobile = w<=768;
  const isTablet = (w>768 && w<=1024);
  const members = getMembers(univName);
  const logoSize = (typeof getUnivLogoSizeStr==='function')
    ? getUnivLogoSizeStr(univName, 'detail', 'var(--su_univ_logo_size_detail,46px)')
    : 'var(--su_univ_logo_size_detail,46px)';
  const logoSizeEff = `calc(${logoSize} * var(--su_univ_detail_scale,1))`;
  return {
    col,
    isMobile,
    isTablet,
    members,
    logoSize,
    logoSizeEff
  };
}

try{
  window.prepareUnivDetailStyleData = prepareUnivDetailStyleData;
}catch(e){}
