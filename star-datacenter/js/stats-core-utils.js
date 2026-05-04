(function(){
  let _sProIds=null, _sProIdsTime='';
  let _sPMap=null, _sPMapTime='';
  let _sPMapLen=-1;
  let _sPMapRef=null;

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
    const arr = Array.isArray(window.players) ? window.players : [];
    if(t!==_sPMapTime || _sPMapRef!==arr || _sPMapLen!==arr.length){
      _sPMap=new Map(arr.map(p=>{
        const photo = (p&&p.photo) || ((window.playerPhotos && p && p.name) ? window.playerPhotos[p.name] : '');
        return [p.name,{...p, ...(photo?{photo}:{} )}];
      }));
      _sPMapTime=t;
      _sPMapRef=arr;
      _sPMapLen=arr.length;
    }
    return _sPMap || new Map();
  }

  function statsP(name){
    const key=String(name||'').trim();
    if(!key) return null;
    const hit = statsPMap().get(key) || null;
    if(hit) return hit;
    try{
      const p = (Array.isArray(window.players)?window.players:[]).find(x=>String(x&&x.name||'').trim()===key);
      if(!p) return null;
      const photo = p.photo || ((window.playerPhotos && window.playerPhotos[key]) ? window.playerPhotos[key] : '');
      return photo ? {...p, photo} : p;
    }catch(e){
      return null;
    }
  }

  window.statsProMatchIds = statsProMatchIds;
  window.statsNonProHist = statsNonProHist;
  window.statsMatchOk = statsMatchOk;
  window.statsFilterMatches = statsFilterMatches;
  window.statsPMap = statsPMap;
  window.statsP = statsP;
})();
