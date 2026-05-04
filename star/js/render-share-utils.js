/* ══════════════════════════════════════
   Render Share Utilities
══════════════════════════════════════ */
async function _shareEnsureStatsAndOpen(){
  try{
    if(typeof window._ensureShareCardLoaded === 'function'){
      await window._ensureShareCardLoaded();
    }else if(typeof window._ensureStatsLoaded === 'function'){
      await window._ensureStatsLoaded();
    }
  }catch(e){}
  for(let i=0;i<20;i++){
    if(typeof window.openShareCardModal === 'function' &&
       typeof window.renderShareCardByMatchObj === 'function' &&
       typeof window.refreshShareCardModalMeta === 'function'){
      return true;
    }
    await new Promise(r=>setTimeout(r,25));
  }
  return false;
}
try{
  window._shareEnsureStatsAndOpen = _shareEnsureStatsAndOpen;
}catch(e){}
