(function(){
  window.HistoryModules = window.HistoryModules || {};

  function getArrayByMode(modeKey){
    const key = String(modeKey||'').trim();
    return key==='mini' ? miniM
      : key==='univm' ? univM
      : key==='ck' ? ckM
      : key==='pro' ? proM
      : key==='tt' ? ttM
      : key==='comp' ? comps
      : null;
  }

  window._resolveHistoryShareSource = function(match, modeKey, idx){
    try{
      const fromModeIdx = (mk, ii)=>{
        const arr = getArrayByMode(mk);
        const iNum = Number(ii);
        if(!Array.isArray(arr) || !isFinite(iNum) || iNum < 0 || !arr[iNum]) return null;
        return {...arr[iNum], _matchType:String(mk||'').trim()};
      };
      if(idx!==null && idx!==undefined){
        const hit = fromModeIdx(modeKey, idx);
        if(hit) return hit;
      }
      const ref = String(match?._editRef||'').trim();
      if(ref && ref.includes(':')){
        const [mk, ii] = ref.split(':');
        const hit = fromModeIdx(mk, ii);
        if(hit) return hit;
      }
      return null;
    }catch(e){ return null; }
  };

  window._buildHistoryDetailSharePayload = function(match, modeKey, idx){
    try{
      if(!match) return null;
      const source = typeof window._resolveHistoryShareSource==='function' ? window._resolveHistoryShareSource(match, modeKey, idx) : null;
      if(source) return source;
      if((match.a||match.b) && match.sa!=null && match.sb!=null) return {...match, _matchType:(modeKey||'')};
      if(match.wName || match.lName){
        return {
          _id: match._id || match.matchId || '',
          d: match.d || '',
          a: match.wName || '',
          b: match.lName || '',
          _matchType: (modeKey||''),
          wName: match.wName || '',
          lName: match.lName || '',
          map: match.map || '',
          sets: [{ scoreA:1, scoreB:0, winner:'A', games:[{ playerA:match.wName||'', playerB:match.lName||'', winner:'A', map:match.map||'' }] }]
        };
      }
      return {...match, _matchType:(modeKey||'')};
    }catch(e){ return null; }
  };

  window.HistoryModules.share = {
    resolveSource: window._resolveHistoryShareSource,
    buildPayload: window._buildHistoryDetailSharePayload
  };
})();
