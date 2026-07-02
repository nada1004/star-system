function buildUnivDetailHTML(univName){
  const _style = (typeof prepareUnivDetailStyleData==='function')
    ? prepareUnivDetailStyleData(univName)
    : null;
  const col = _style?.col || gc(univName);
  const _isMobile = _style?.isMobile || false;
  const _isTablet = _style?.isTablet || false;
  const members = _style?.members || getMembers(univName);
  const _logoSizeEff = _style?.logoSizeEff || 'var(--su_univ_logo_size_detail,46px)';
  const _hdrBg = _style?.hdrBg || `linear-gradient(135deg,${col},${col}cc)`;
  const _hdrBgLayer = _style?.hdrBgLayer || null;
  const _univComputed = (typeof prepareUnivDetailComputedData==='function')
    ? prepareUnivDetailComputedData({ univName, members })
    : null;
  const oppStats = _univComputed?.oppStats || {};
  const wins = _univComputed?.wins || 0;
  const losses = _univComputed?.losses || 0;
  const tot = _univComputed?.tot || 0;
  const pts = _univComputed?.pts || members.reduce((s,p)=>s+p.points,0);
  const wr = _univComputed?.wr || (tot?Math.round(wins/tot*100):0);
  const byPlayer = _univComputed?.byPlayer || {};

  let h = (typeof buildUnivHeaderCardHTML==='function')
    ? buildUnivHeaderCardHTML({
        univName,
        col,
        members,
        wins,
        losses,
        tot,
        pts,
        wr,
        hdrBg:_hdrBg,
        hdrBgLayer:_hdrBgLayer,
        isMobile:_isMobile,
        isTablet:_isTablet,
        logoSizeEff:_logoSizeEff
      })
    : '';

  h += (typeof buildUnivMembersTableHTML==='function')
    ? buildUnivMembersTableHTML({ members, univName, col, byPlayer })
    : '';

  h += (typeof buildUnivOppStatsHTML==='function')
    ? buildUnivOppStatsHTML({ oppStats, isMobile:_isMobile, isTablet:_isTablet })
    : '';

  const myMatches=_univComputed?.myMatches || [];
  h += (typeof buildUnivRecentMatchesHTML==='function')
    ? buildUnivRecentMatchesHTML({
        myMatches,
        univName,
        isMobile:_isMobile,
        isTablet:_isTablet
      })
    : '';

  h += (typeof buildUnivAceCardsHTML==='function')
    ? buildUnivAceCardsHTML({ members, col })
    : '';

  const _udMode = _style?.designMode || 'classic';
  const _udDecor = (typeof buildUnivDetailModeDecorHTML==='function') ? buildUnivDetailModeDecorHTML(_udMode) : '';
  try{
    const _um = document.getElementById('univModal');
    if(_um) _um.setAttribute('data-ud-mode', _udMode);
  }catch(e){}
  return `<div class="ud-premium-shell" data-ud-mode="${_udMode}">${_udDecor}${h}</div>`;
}

try{
  window.buildUnivDetailHTML = buildUnivDetailHTML;
}catch(e){}
