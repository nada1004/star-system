/* ══════════════════════════════════════
   Render Share Delegates
══════════════════════════════════════ */
(function(){
  function dec(v){
    try{ return decodeURIComponent(String(v||'')); }catch(_){ return String(v||''); }
  }
  document.addEventListener('click', function(ev){
    const btn = ev.target && ev.target.closest ? ev.target.closest('[data-share-open]') : null;
    if(!btn) return;
    const kind = String(btn.getAttribute('data-share-open')||'').trim();
    if(!kind) return;
    try{ ev.preventDefault(); }catch(_){}
    try{ ev.stopPropagation(); }catch(_){}
    try{
      if(kind==='ind-session'){
        return openIndShareCard(
          dec(btn.dataset.p1),
          dec(btn.dataset.p2),
          Number(btn.dataset.sa||0),
          Number(btn.dataset.sb||0),
          dec(btn.dataset.d),
          dec(btn.dataset.winner),
          dec(btn.dataset.ids)
        );
      }
      if(kind==='gj-session'){
        return openGJShareCard(
          dec(btn.dataset.p1),
          dec(btn.dataset.p2),
          Number(btn.dataset.sa||0),
          Number(btn.dataset.sb||0),
          dec(btn.dataset.d),
          dec(btn.dataset.winner),
          dec(btn.dataset.mode||'gj')
        );
      }
      if(kind==='procomp'){
        return openProCompMatchShare(
          dec(btn.dataset.a),
          dec(btn.dataset.b),
          Number(btn.dataset.sa||0),
          Number(btn.dataset.sb||0),
          dec(btn.dataset.d)
        );
      }
      if(kind==='comp-match'){
        return openCompMatchShareCard(
          dec(btn.dataset.tnId),
          Number(btn.dataset.gi||0),
          Number(btn.dataset.mi||0)
        );
      }
      if(kind==='player-current'){
        return openShareCardFromPlayer();
      }
      if(kind==='univ-current'){
        return openShareCardFromUniv();
      }
    }catch(e){
      console.error('[share delegate] failed', kind, e);
    }
  }, true);
})();
