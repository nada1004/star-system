(function(){
  function buildShareMatchUnivIconHTML(args){
    const { name, size, scp, toHttpsUrl } = args || {};
    if(typeof window._sharecardUnivIconHTML==='function'){
      return window._sharecardUnivIconHTML({ name, size, logoFit: scp && scp.logoFit, toHttpsUrl });
    }
    return `<span style="display:inline-flex;width:${size||'40px'};height:${size||'40px'};align-items:center;justify-content:center;color:#fff">🏫</span>`;
  }

  function shareMatchRaceLabel(r){
    try{ return (typeof window.raceLabel==='function') ? window.raceLabel(r||'') : String(r||''); }catch(e){ return String(r||''); }
  }

  function shareMatchTierBg(t){
    try{ return (typeof window.getTierBtnColor==='function' ? window.getTierBtnColor(t) : '') || '#64748b'; }catch(e){ return '#64748b'; }
  }

  function shareMatchTierFg(t){
    try{ return (typeof window.getTierBtnTextColor==='function' ? window.getTierBtnTextColor(t) : '') || '#fff'; }catch(e){ return '#fff'; }
  }

  function shareMatchUnivLogo(u, c){
    try{ return (typeof window.univLogo==='function') ? (window.univLogo(u||'', c)||'') : ''; }catch(e){ return ''; }
  }

  function buildShareMatchHeaderBg(args){
    const { winnerColor, ca, cb, aWin, bWin, scp, variant } = args || {};
    return (typeof window._buildShareCardHeaderBg==='function')
      ? window._buildShareCardHeaderBg({winnerColor, ca, cb, aWin, bWin, scp})
      : (variant && variant.headerBg) || '#1e293b';
  }

  function buildShareMatchCacheKey(args){
    const { m, teamMode } = args || {};
    return `match:${JSON.stringify({
      a:m&&m.a,b:m&&m.b,sa:m&&m.sa,sb:m&&m.sb,d:m&&m.d,n:m&&m.n,t:m&&m._matchType,sub:m&&m._subLabel,
      sets:m&&m.sets,teamA:m&&m.teamAMembers,teamB:m&&m.teamBMembers,
      view:teamMode?`${Date.now()}-${Math.random().toString(36).slice(2,8)}`:''
    })}`;
  }

  window._buildShareMatchUnivIconHTML = buildShareMatchUnivIconHTML;
  window._shareMatchRaceLabel = shareMatchRaceLabel;
  window._shareMatchTierBg = shareMatchTierBg;
  window._shareMatchTierFg = shareMatchTierFg;
  window._shareMatchUnivLogo = shareMatchUnivLogo;
  window._buildShareMatchHeaderBg = buildShareMatchHeaderBg;
  window._buildShareMatchCacheKey = buildShareMatchCacheKey;
})();
