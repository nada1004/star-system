(function(){
  let _sProIds=null, _sProIdsTime='';
  let _sPMap=null, _sPMapTime='';

  function statsProMatchIds(){
    const t=localStorage.getItem('su_last_save_time')||'0';
    if(t!==_sProIdsTime){_sProIds=null;_sProIdsTime=t;}
    if(_sProIds)return _sProIds;
    _sProIds=new Set((window.proM||[]).map(m=>m._id).filter(Boolean));
    return _sProIds;
  }

  function statsNonProHist(p){
    let h=((p&&p.history)||[]);
    if(window._statsDateFrom) h=h.filter(x=>(x.date||'')>=window._statsDateFrom);
    if(window._statsDateTo)   h=h.filter(x=>(x.date||'')<=window._statsDateTo);
    if(window._statsLastN>0){
      h=[...h].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,window._statsLastN);
    }
    return h;
  }

  function statsMatchOk(dateStr){
    const d = (dateStr||'');
    if(window._statsDateFrom && d && d < window._statsDateFrom) return false;
    if(window._statsDateTo && d && d > window._statsDateTo) return false;
    return true;
  }

  function statsFilterMatches(arr){
    let out = (arr||[]).filter(m=>statsMatchOk(m?.d||m?.date||''));
    if(window._statsLastN>0){
      out = [...out].sort((a,b)=>(String(b.d||b.date||'')).localeCompare(String(a.d||a.date||''))).slice(0,window._statsLastN);
    }
    return out;
  }

  function statsPMap(){
    const t=localStorage.getItem('su_last_save_time')||'0';
    if(t!==_sPMapTime){ _sPMap=new Map(((window.players)||[]).map(p=>[p.name,p])); _sPMapTime=t; }
    return _sPMap || new Map();
  }

  function statsP(name){ return statsPMap().get(name) || null; }

  window.statsProMatchIds = statsProMatchIds;
  window.statsNonProHist = statsNonProHist;
  window.statsMatchOk = statsMatchOk;
  window.statsFilterMatches = statsFilterMatches;
  window.statsPMap = statsPMap;
  window.statsP = statsP;
})();
