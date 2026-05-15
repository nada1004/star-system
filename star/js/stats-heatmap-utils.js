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

  window._statsDateYmd = _statsDateYmd;
  window.heatmapSearchFilter = heatmapSearchFilter;
})();
