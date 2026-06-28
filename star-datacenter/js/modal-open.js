/* 기본 모달 열기/닫기 함수 */
window._bringModalToFront = function(el) {
  if(!el) return;
  let maxZ = 6000;
  try{
    document.querySelectorAll('.modal,[id$="Modal"],[id$="modal"],.sharecard-modal-overlay').forEach(node=>{
      if(!node || node===el) return;
      const st = window.getComputedStyle(node);
      if(st.display === 'none' || st.visibility === 'hidden') return;
      const z = Number(st.zIndex);
      if(Number.isFinite(z)) maxZ = Math.max(maxZ, z);
    });
  }catch(e){}
  try{
    const currentInlineZ = parseInt(el?.style?.zIndex || '0', 10);
    const currentComputedZ = parseInt(getComputedStyle(el).zIndex || '0', 10);
    const nextZ = Math.max(
      maxZ + 20,
      Number.isFinite(currentInlineZ) ? currentInlineZ : 0,
      Number.isFinite(currentComputedZ) ? currentComputedZ : 0
    );
    el.style.zIndex = String(nextZ);
  }catch(e){}
};

window.om = function(id) {
  const el = document.getElementById(id);
  if(el) {
    el.style.setProperty('display', 'flex', 'important');
    try{ window._bringModalToFront(el); }catch(e){}
  }
};

window.cm = function(id) {
  const el = document.getElementById(id);
  if(el) {
    el.style.setProperty('display', 'none', 'important');
    try{
      if(id === 'emModal'){
        window._suppressPlayerModalFront = false;
        const reopenName = String(window._resumePlayerModalAfterEdit || '').trim();
        if(reopenName){
          window._resumePlayerModalAfterEdit = '';
          setTimeout(()=>{
            try{
              if(typeof window.openPlayerModal === 'function') window.openPlayerModal(reopenName);
            }catch(e){}
          }, 40);
        }
      }
      if(id === 'histDetModal') window._lastHistDetailState = null;
      if(typeof window._syncTabUrlFromState === 'function') window._syncTabUrlFromState('replace');
    }catch(e){}
  }
};

window._isModalVisible = function(el){
  if(!(el instanceof HTMLElement)) return false;
  try{
    const st = window.getComputedStyle(el);
    return st.display !== 'none' && st.visibility !== 'hidden';
  }catch(e){
    return false;
  }
};

window._isModalBackdropCloseBlocked = function(el){
  if(!(el instanceof HTMLElement)) return true;
  if(el.classList?.contains('sharecard-modal-overlay')) return false;
  return String(el.dataset?.noClose || '') === '1';
};

window._closeModalElement = function(el){
  if(!(el instanceof HTMLElement)) return false;
  if(el.classList?.contains('sharecard-modal-overlay')){
    try{ el.remove(); return true; }catch(e){ return false; }
  }
  if(el.id && typeof window.cm === 'function'){
    try{ window.cm(el.id); return true; }catch(e){}
  }
  try{
    el.style.setProperty('display', 'none', 'important');
    return true;
  }catch(e){
    return false;
  }
};

window._getTopClosableModal = function(){
  let topEl = null;
  let topZ = -Infinity;
  try{
    document.querySelectorAll('.modal,.sharecard-modal-overlay').forEach(el=>{
      if(!window._isModalVisible(el)) return;
      if(window._isModalBackdropCloseBlocked(el)) return;
      const z = Number(window.getComputedStyle(el).zIndex || 0);
      if(!topEl || z >= topZ){
        topEl = el;
        topZ = z;
      }
    });
  }catch(e){}
  return topEl;
};

try{
  if(!window.__globalModalCloseBound){
    window.__globalModalCloseBound = true;
    document.addEventListener('click', function(ev){
      try{
        const target = ev.target;
        if(!(target instanceof HTMLElement)) return;
        const modalEl = target.closest('.modal,.sharecard-modal-overlay');
        if(!modalEl) return;
        if(target !== modalEl) return;
        if(window._isModalBackdropCloseBlocked(modalEl)) return;
        window._closeModalElement(modalEl);
      }catch(e){}
    });
    document.addEventListener('keydown', function(ev){
      try{
        if(ev.defaultPrevented || ev.key !== 'Escape') return;
        const topModal = window._getTopClosableModal();
        if(!topModal) return;
        ev.preventDefault();
        window._closeModalElement(topModal);
      }catch(e){}
    });
  }
}catch(e){}

try{
  if(!window.__autoFrontModalObserver){
    const isCandidate = (node) => {
      if(!(node instanceof HTMLElement)) return false;
      if(node.classList?.contains('modal')) return true;
      if(node.classList?.contains('sharecard-modal-overlay')) return true;
      const id = String(node.id||'');
      if(/modal/i.test(id)) return true;
      return false;
    };
    const promote = (node) => {
      if(!isCandidate(node)) return;
      const st = window.getComputedStyle(node);
      if(st.display === 'none' || st.visibility === 'hidden') return;
      try{ window._bringModalToFront(node); }catch(e){}
    };
    window.__autoFrontModalObserver = new MutationObserver((mutations)=>{
      mutations.forEach(m=>{
        if(m.target) promote(m.target);
        m.addedNodes && m.addedNodes.forEach(promote);
      });
    });
    window.__autoFrontModalObserver.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style','class']
    });
  }
}catch(e){}
