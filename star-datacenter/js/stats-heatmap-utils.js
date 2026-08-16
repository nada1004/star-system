(function(){
  function _statsDateYmd(d){
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function heatmapSearchFilter(q){
    const d=document.getElementById('heatmap-search-drop');if(!d)return;
    d.querySelectorAll('.sitem').forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});
  }

  function applyHeatmapSearch(q){
    const raw=String(q||'').trim();
    if(!raw){
      window._heatmapSelPlayer='';
      if(typeof render==='function') render();
      return true;
    }
    const cands=(Array.isArray(window.players)?window.players:[]).filter(p=>(p.history||[]).length>0);
    const exact=cands.find(p=>String(p.name||'').trim()===raw);
    const partial=cands.filter(p=>String(p.name||'').toLowerCase().includes(raw.toLowerCase()));
    const hit=exact || (partial.length ? partial[0] : null);
    if(!hit) return false;
    window._heatmapSelPlayer=hit.name;
    const inp=document.getElementById('heatmap-search-input'); if(inp) inp.value=hit.name;
    const drop=document.getElementById('heatmap-search-drop'); if(drop) drop.style.display='none';
    if(typeof render==='function') render();
    return true;
  }

  window._statsDateYmd = _statsDateYmd;
  window.heatmapSearchFilter = heatmapSearchFilter;
  window.applyHeatmapSearch = applyHeatmapSearch;
})();
