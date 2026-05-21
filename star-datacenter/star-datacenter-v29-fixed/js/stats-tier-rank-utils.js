(function(){
  function _srSafeId(s){
    try{ return encodeURIComponent(String(s||'')).replace(/%/g,'_'); }catch(e){ return String(s||'').replace(/[^a-z0-9_\\-]/gi,'_'); }
  }

  function _srDaysAgo(dateStr){
    const d=(dateStr||'');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(d)) return 9999;
    const t = new Date(d+'T00:00:00').getTime();
    if(!t) return 9999;
    const now = Date.now();
    return Math.max(0, Math.floor((now - t) / 86400000));
  }

  function _srTimeW(dateStr){
    const days=_srDaysAgo(dateStr);
    const w = 1 - (days * 0.0035);
    return Math.max(0.70, Math.min(1.00, +w.toFixed(2)));
  }

  function _srIsImportant(mode){
    const m=(mode||'');
    return /(대회|티어대회|조별리그|프로리그|끝장전|CK)/.test(m);
  }

  window.statsSetRankTier = function(t){
    window._statsRankTier = (t||'').trim() || '4티어';
    try{ localStorage.setItem('su_statsRankTier', window._statsRankTier); }catch(e){}
    if(typeof window.render==='function') window.render();
  };

  window.statsRankToggle = function(safeId){
    const row=document.getElementById('sr-det-'+safeId);
    if(!row) return;
    row.classList.toggle('open');
    const btn=document.getElementById('sr-btn-'+safeId);
    if(btn) btn.textContent = row.classList.contains('open') ? '🔼 상세닫기' : '🔽 상세보기';
  };

  window._srSafeId = _srSafeId;
  window._srDaysAgo = _srDaysAgo;
  window._srTimeW = _srTimeW;
  window._srIsImportant = _srIsImportant;
})();
