/* ══════════════════════════════════════
   Render Shell Delegates
══════════════════════════════════════ */
(function(){
  document.addEventListener('click', function(ev){
    const el = ev.target && ev.target.closest ? ev.target.closest('[data-shell-action]') : null;
    if(!el) return;
    const action = String(el.getAttribute('data-shell-action') || '').trim();
    if(!action) return;
    try{ ev.preventDefault(); }catch(_){}
    try{
      if(action === 'go-total'){
        if(typeof window.sw === 'function'){
          const btn = document.querySelector('.tab[data-tab-target="total"]');
          return window.sw('total', btn || el);
        }
        return;
      }
      if(action === 'toggle-dark'){
        return typeof window.toggleDark === 'function' ? window.toggleDark() : undefined;
      }
      if(action === 'open-login'){
        return typeof window.om === 'function' ? window.om('loginModal') : undefined;
      }
      if(action === 'logout'){
        return typeof window.doLogout === 'function' ? window.doLogout() : undefined;
      }
      if(action === 'tab-switch'){
        const target = String(el.getAttribute('data-tab-target') || '').trim();
        if(target && typeof window.sw === 'function') return window.sw(target, el);
        return;
      }
      if(action === 'fab-toggle'){
        return typeof window.toggleFab === 'function' ? window.toggleFab() : undefined;
      }
      if(action === 'fab-chatbot'){
        if(typeof window.closeFab === 'function') window.closeFab();
        const bot = String(el.getAttribute('data-bot') || '').trim();
        return (bot && typeof window.openChatbot === 'function') ? window.openChatbot(bot) : undefined;
      }
      if(action === 'fab-go'){
        if(typeof window.closeFab === 'function') window.closeFab();
        const target = String(el.getAttribute('data-tab-target') || '').trim();
        return (target && typeof window._fabGo === 'function') ? window._fabGo(target) : undefined;
      }
      if(action === 'bottom-nav'){
        const target = String(el.getAttribute('data-tab-target') || '').trim();
        return (target && typeof window.swNav === 'function') ? window.swNav(target, el) : undefined;
      }
    }catch(e){
      console.error('[shell delegate] failed', action, e);
    }
  }, true);
})();
