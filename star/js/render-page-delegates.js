/* ══════════════════════════════════════
   Render Page Delegates
══════════════════════════════════════ */
(function(){
  async function manualSync(btn){
    const b = btn;
    if(!b) return;
    const old = b.innerHTML;
    b.disabled = true;
    b.innerHTML = '⏳ 동기화';
    try{
      if(typeof window.fbForceSync === 'function'){
        await window.fbForceSync();
        if(typeof window.refreshCloudSyncStatus === 'function'){
          window.refreshCloudSyncStatus('🔄 수동 동기화 완료','#2563eb');
        }
      }
    }catch(e){
      if(typeof window.refreshCloudSyncStatus === 'function'){
        window.refreshCloudSyncStatus('❌ 수동 동기화 실패','#dc2626');
      }
      console.error('[manual sync]', e);
    }finally{
      setTimeout(()=>{ b.disabled=false; b.innerHTML=old; }, 500);
    }
  }

  document.addEventListener('click', async function(ev){
    const stop = ev.target && ev.target.closest ? ev.target.closest('[data-stop-prop]') : null;
    if(stop){
      try{ ev.stopPropagation(); }catch(_){}
    }

    const el = ev.target && ev.target.closest ? ev.target.closest('[data-page-action]') : null;
    if(!el) return;
    const action = String(el.getAttribute('data-page-action') || '').trim();
    if(!action) return;
    try{ ev.preventDefault(); }catch(_){}
    try{
      if(action === 'notice-close') return typeof window.closeNoticePopup === 'function' ? window.closeNoticePopup() : undefined;
      if(action === 'close-modal'){
        const id = String(el.getAttribute('data-modal-id') || '').trim();
        return (id && typeof window.cm === 'function') ? window.cm(id) : undefined;
      }
      if(action === 'dissolve-confirm') return typeof window.confirmDissolve === 'function' ? window.confirmDissolve() : undefined;
      if(action === 'cal-sched-save') return typeof window.saveCalSched === 'function' ? window.saveCalSched() : undefined;
      if(action === 'login-submit') return typeof window.doLogin === 'function' ? window.doLogin() : undefined;
      if(action === 'add-player') return typeof window.addPlayer === 'function' ? window.addPlayer() : undefined;
      if(action === 'save-current-view') return typeof window.saveCurrentView === 'function' ? window.saveCurrentView() : undefined;
      if(action === 'do-export') return typeof window.doExport === 'function' ? window.doExport() : undefined;
      if(action === 'do-import') return typeof window.doImport === 'function' ? window.doImport() : undefined;
      if(action === 'manual-sync') return manualSync(el);
      if(action === 'save-player') return typeof window.savePlayer === 'function' ? window.savePlayer() : undefined;
      if(action === 'delete-player') return typeof window.delPlayer === 'function' ? window.delPlayer() : undefined;
      if(action === 'save-bulk-edit') return typeof window.saveBulkEdit === 'function' ? window.saveBulkEdit() : undefined;
      if(action === 'save-crew-cfg') return typeof window.saveCrewCfgModal === 'function' ? window.saveCrewCfgModal() : undefined;
      if(action === 'save-crew') return typeof window.saveCrewModal === 'function' ? window.saveCrewModal() : undefined;
      if(action === 'save-quick-crew-move') return typeof window.saveQuickCrewMove === 'function' ? window.saveQuickCrewMove() : undefined;
      if(action === 'save-row') return typeof window.saveRow === 'function' ? window.saveRow() : undefined;
      if(action === 'grp-paste-apply') return typeof window.grpPasteApply === 'function' ? window.grpPasteApply() : undefined;
      if(action === 'paste-close') return typeof window.closePasteModal === 'function' ? window.closePasteModal() : undefined;
      if(action === 'paste-mode-game') return typeof window.setPasteMatchMode === 'function' ? window.setPasteMatchMode('game') : undefined;
      if(action === 'paste-mode-set') return typeof window.setPasteMatchMode === 'function' ? window.setPasteMatchMode('set') : undefined;
      if(action === 'paste-clear'){
        const ta = document.getElementById('paste-input'); if(ta) ta.value='';
        return typeof window.pastePreview === 'function' ? window.pastePreview() : undefined;
      }
      if(action === 'paste-apply') return typeof window.pasteApply === 'function' ? window.pasteApply() : undefined;
      if(action === 'pro-paste-close') return typeof window.closeProPasteModal === 'function' ? window.closeProPasteModal() : undefined;
      if(action === 'pro-mode-game') return typeof window.setProPasteMode === 'function' ? window.setProPasteMode('game') : undefined;
      if(action === 'pro-mode-set') return typeof window.setProPasteMode === 'function' ? window.setProPasteMode('set') : undefined;
      if(action === 'pro-format'){
        const n = Number(el.getAttribute('data-format') || 0);
        return typeof window.setProFormat === 'function' ? window.setProFormat(n) : undefined;
      }
      if(action === 'pro-paste-clear'){
        const ta = document.getElementById('pro-paste-input'); if(ta) ta.value='';
        return typeof window.proPreview === 'function' ? window.proPreview() : undefined;
      }
      if(action === 'pro-insert-sep') return typeof window.insertProMatchSep === 'function' ? window.insertProMatchSep() : undefined;
      if(action === 'pro-swap') return typeof window.swapProTeams === 'function' ? window.swapProTeams() : undefined;
      if(action === 'pro-apply') return typeof window.proApply === 'function' ? window.proApply() : undefined;
      if(action === 'chatbot-close') return typeof window.closeChatbot === 'function' ? window.closeChatbot(ev) : undefined;
      if(action === 'chatbot-clear') return typeof window.clearChatHistory === 'function' ? window.clearChatHistory() : undefined;
      if(action === 'chatbot-send') return typeof window.sendMessage === 'function' ? window.sendMessage() : undefined;
      if(action === 'mobile-match-close') return typeof window.closeMobileMatchOverlay === 'function' ? window.closeMobileMatchOverlay() : undefined;
      if(action === 'mobile-match-overlay-close') return typeof window.closeMobileMatchSheet === 'function' ? window.closeMobileMatchSheet(ev) : undefined;
      if(action === 'mobile-match-capture') return window._mmsCaptureKey && typeof window.captureDetail === 'function' ? window.captureDetail('det-'+window._mmsCaptureKey, window._mmsCaptureDate||'match') : undefined;
      if(action === 'mobile-match-share') return window._mmsShareFn ? window._mmsShareFn() : undefined;
    }catch(e){
      console.error('[page delegate] failed', action, e);
    }
  }, true);

  document.addEventListener('change', function(ev){
    const el = ev.target;
    if(!el || !el.matches) return;
    try{
      if(el.matches('#p-reg-type') && typeof window.onRegTypeChange === 'function') return window.onRegTypeChange();
      if(el.matches('#fi') && typeof window.doFile === 'function') return window.doFile(el);
      if(el.matches('#paste-mode') && typeof window.onPasteModeChange === 'function') return window.onPasteModeChange(el.value);
    }catch(e){
      console.error('[page change delegate]', e);
    }
  }, true);

  document.addEventListener('input', function(ev){
    const el = ev.target;
    if(!el || !el.matches) return;
    try{
      if(el.matches('#globalSearch') && typeof window.onGlobalSearch === 'function') return window.onGlobalSearch(el.value);
      if(el.matches('#crewCfgLabelAlpha')) { const v=document.getElementById('crewCfgLabelAlphaVal'); if(v) v.textContent=el.value; return; }
      if(el.matches('#crewCfgCardAlpha')) { const v=document.getElementById('crewCfgCardAlphaVal'); if(v) v.textContent=el.value; return; }
      if(el.matches('#crewCfgBgAlpha')) { const v=document.getElementById('crewCfgBgAlphaVal'); if(v) v.textContent=el.value; return; }
      if((el.matches('#paste-ref-player') || el.matches('#paste-input')) && typeof window.pastePreview === 'function') return window.pastePreview();
      if(el.matches('#pro-paste-input') && typeof window.proPreview === 'function') return window.proPreview();
    }catch(e){
      console.error('[page input delegate]', e);
    }
  }, true);

  document.addEventListener('paste', function(ev){
    const el = ev.target;
    if(!el || !el.matches) return;
    try{
      if(el.matches('#paste-input') && typeof window.pastePreview === 'function') return setTimeout(window.pastePreview, 0);
      if(el.matches('#pro-paste-input') && typeof window.proPreview === 'function') return setTimeout(window.proPreview, 0);
    }catch(e){}
  }, true);

  document.addEventListener('keydown', function(ev){
    const el = ev.target;
    if(!el || !el.matches) return;
    try{
      if(el.matches('#li-id') && ev.key === 'Enter'){ const pw=document.getElementById('li-pw'); if(pw) pw.focus(); return; }
      if(el.matches('#li-pw') && ev.key === 'Enter'){ if(typeof window.doLogin === 'function') window.doLogin(); return; }
      if(el.matches('#chatInput') && typeof window.handleChatInputKeydown === 'function') return window.handleChatInputKeydown(ev);
    }catch(e){}
  }, true);

  document.addEventListener('focusin', function(ev){
    const el = ev.target;
    if(el && el.matches && el.matches('#globalSearch')) el.style.background='rgba(255,255,255,.25)';
  });
  document.addEventListener('focusout', function(ev){
    const el = ev.target;
    if(el && el.matches && el.matches('#globalSearch')) el.style.background='rgba(255,255,255,.15)';
  });
})();
