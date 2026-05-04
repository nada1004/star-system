function buildUnivDetailHTML(univName){
  const _style = (typeof prepareUnivDetailStyleData==='function')
    ? prepareUnivDetailStyleData(univName)
    : null;
  const col = _style?.col || gc(univName);
  const _isMobile = _style?.isMobile || false;
  const _isTablet = _style?.isTablet || false;
  const members = _style?.members || getMembers(univName);
  const _logoSizeEff = _style?.logoSizeEff || 'var(--su_univ_logo_size_detail,46px)';
  const _univComputed = (typeof prepareUnivDetailComputedData==='function')
    ? prepareUnivDetailComputedData({ univName, members })
    : null;
  const oppStats = _univComputed?.oppStats || {};
  const wins = _univComputed?.wins || 0;
  const tot = _univComputed?.tot || 0;
  const pts = _univComputed?.pts || members.reduce((s,p)=>s+p.points,0);
  const wr = _univComputed?.wr || (tot?Math.round(wins/tot*100):0);

  let h = (typeof buildUnivHeaderCardHTML==='function')
    ? buildUnivHeaderCardHTML({
        univName,
        col,
        members,
        wins,
        tot,
        pts,
        wr,
        isMobile:_isMobile,
        isTablet:_isTablet,
        logoSizeEff:_logoSizeEff
      })
    : '';

  h += (typeof buildUnivMembersTableHTML==='function')
    ? buildUnivMembersTableHTML({ members, univName, col })
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

  return h;
}

try{
  window.buildUnivDetailHTML = buildUnivDetailHTML;
}catch(e){}
