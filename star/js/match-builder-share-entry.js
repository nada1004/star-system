(function(){
  window.MatchBuilderModules = window.MatchBuilderModules || {};

  function openIndShareCard(p1, p2, p1wins, p2wins, date, winner, idsJson) {
    const ids = idsJson ? (()=>{
      try{ return JSON.parse(idsJson); }catch(e){}
      try{ return JSON.parse(String(idsJson).replace(/'/g,'"')); }catch(e){}
      return null;
    })() : null;
    const games = ids
      ? indM.filter(m => ids.includes(m._id))
      : indM.filter(m => {
          const pair = [m.wName, m.lName].sort();
          const pair2 = [p1, p2].sort();
          return (m.d||'') === date && pair[0] === pair2[0] && pair[1] === pair2[1];
        });
    const payload = {
      a:p1,b:p2,sa:p1wins,sb:p2wins,d:date||'',
      _matchType:'ind',_subLabel:'개인전',_usePlayerPhoto:true,
      sets:[{scoreA:p1wins,scoreB:p2wins,winner:winner===p1?'A':winner===p2?'B':'',games:games.map(m=>({
        playerA:p1,playerB:p2,winner:m.wName===p1?'A':m.wName===p2?'B':'',map:m.map||''
      })).filter(g=>g.winner)}]
    };
    if(typeof window._openShareMatchObjCard==='function'){ window._openShareMatchObjCard(payload); return; }
    _shareMode = 'match';
    openShareCardModal();
    const _run = () => renderIndShareCard(p1, p2, p1wins, p2wins, date, winner, ids);
    if(typeof window._shareCardDeferRender==='function') window._shareCardDeferRender(_run);
    else setTimeout(_run, 0);
  }

  function openGJShareCard(p1, p2, p1wins, p2wins, date, winner, opts) {
    const proOnly = !!(opts && opts.proOnly);
    const pair = [p1, p2].sort();
    const games = gjM.filter(m => {
      const mp = [m.wName, m.lName].sort();
      return (m.d||'') === date && mp[0] === pair[0] && mp[1] === pair[1] && (!!m._proLabel===proOnly);
    });
    const payload = {
      a:p1,b:p2,sa:p1wins,sb:p2wins,d:date||'',
      _matchType:proOnly?'progj':'gj',_subLabel:proOnly?'프로리그 끝장전':'끝장전',_usePlayerPhoto:true,
      sets:[{scoreA:p1wins,scoreB:p2wins,winner:winner===p1?'A':winner===p2?'B':'',games:games.map(m=>({
        playerA:p1,playerB:p2,winner:m.wName===p1?'A':m.wName===p2?'B':'',map:m.map||''
      })).filter(g=>g.winner)}]
    };
    if(typeof window._openShareMatchObjCard==='function'){ window._openShareMatchObjCard(payload); return; }
    _shareMode = 'match';
    openShareCardModal();
    const _run = () => renderGJShareCard(p1, p2, p1wins, p2wins, date, winner, opts);
    if(typeof window._shareCardDeferRender==='function') window._shareCardDeferRender(_run);
    else setTimeout(_run, 0);
  }

  try{
    window.openIndShareCard = openIndShareCard;
    window.openGJShareCard = openGJShareCard;
    window.MatchBuilderModules.shareEntry = { openIndShareCard, openGJShareCard };
  }catch(e){}
})();
