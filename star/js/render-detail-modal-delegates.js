/* ══════════════════════════════════════
   Render Detail Modal Delegates
══════════════════════════════════════ */
(function(){
  document.addEventListener('click', function(ev){
    const el = ev.target && ev.target.closest ? ev.target.closest('[data-detail-action]') : null;
    if(!el) return;
    const action = String(el.getAttribute('data-detail-action') || '').trim();
    if(!action) return;
    try{ ev.preventDefault(); }catch(_){}
    try{ ev.stopPropagation(); }catch(_){}
    try{
      if(action === 'player-capture'){
        return typeof window.capturePlayerModal === 'function' ? window.capturePlayerModal() : undefined;
      }
      if(action === 'player-edit'){
        return typeof window.openEPFromModal === 'function' ? window.openEPFromModal(el.dataset.playerName) : undefined;
      }
      if(action === 'player-close'){
        return typeof window.cm === 'function' ? window.cm('playerModal') : undefined;
      }
      if(action === 'univ-capture'){
        return typeof window.captureUnivModal === 'function' ? window.captureUnivModal() : undefined;
      }
      if(action === 'univ-edit'){
        return typeof window.toggleUnivEdit === 'function' ? window.toggleUnivEdit() : undefined;
      }
      if(action === 'univ-close'){
        return typeof window.cm === 'function' ? window.cm('univModal') : undefined;
      }
      if(action === 'comp-detail-share'){
        return typeof window.openCompDetailShareCard === 'function' ? window.openCompDetailShareCard() : undefined;
      }
      if(action === 'comp-detail-close'){
        return typeof window.closeCompMatchDetailModal === 'function' ? window.closeCompMatchDetailModal() : undefined;
      }
    }catch(e){
      console.error('[detail modal delegate] failed', action, e);
    }
  }, true);
})();
