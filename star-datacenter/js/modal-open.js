/* ═══════════════════════════════════════════════════════
   modal-open.js  —  팝업 z-index 관리
   핵심 원칙: 나중에 열린 팝업이 항상 제일 위
   글로벌 카운터 방식으로 경쟁 조건(race condition) 완전 제거
   ═══════════════════════════════════════════════════════ */

/* 글로벌 z-index 카운터: 모달 열 때마다 +10씩 증가
   CSS 하드코딩 최대값(#emModal: 6200)보다 높은 6500에서 시작 */
window.__modalZCounter = window.__modalZCounter || 6500;

window._getNextModalZ = function() {
  window.__modalZCounter += 10;
  return window.__modalZCounter;
};

/* 특정 모달을 최전방으로 (카운터 기반) */
window._bringModalToFront = function(el) {
  if(!el) return;
  try{
    el.style.zIndex = String(window._getNextModalZ());
  }catch(e){}
};

/* 모달 열기: display:flex 설정 + 즉시 최전방 z-index 부여 */
window.om = function(id) {
  const el = document.getElementById(id);
  if(!el) return;
  el.style.setProperty('display', 'flex', 'important');
  try{ window._bringModalToFront(el); }catch(e){}
};

/* 모달 닫기 */
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

/* 클릭/키보드 이벤트: 최상위 모달 닫기 */
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

/* MutationObserver: 새로 DOM에 추가되는 모달(sharecard 등)만 처리
   기존에 있던 모달의 style 변경은 무시 → 경쟁 조건 완전 제거 */
try{
  if(!window.__autoFrontModalObserver){
    const isModalCandidate = (node) => {
      if(!(node instanceof HTMLElement)) return false;
      if(node.classList?.contains('sharecard-modal-overlay')) return true;
      if(node.classList?.contains('modal-compact-overlay')) return true;
      /* DOM에 새로 추가된 모달 엘리먼트만 대상 */
      return false;
    };
    window.__autoFrontModalObserver = new MutationObserver((mutations)=>{
      mutations.forEach(m=>{
        /* 새로 추가된 노드만 처리 (style 변경은 무시) */
        m.addedNodes && m.addedNodes.forEach(node=>{
          if(!isModalCandidate(node)) return;
          const st = window.getComputedStyle(node);
          if(st.display === 'none' || st.visibility === 'hidden') return;
          try{ window._bringModalToFront(node); }catch(e){}
        });
      });
    });
    window.__autoFrontModalObserver.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
      /* attributes 감지 제거: style 변경으로 인한 무한 경쟁 원천 차단 */
    });
  }
}catch(e){}
