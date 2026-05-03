window._centerActiveTopTab = function(smooth){
  try{
    const on = document.querySelector('.tabs .tab.on');
    if(!on) return;
    const tabs = on.closest('.tabs');
    if(!tabs) return;
    const mode = (localStorage.getItem('su_top_tab_align_mb')||'start').trim();
    if(window.innerWidth <= 768 && mode === 'center'){
      on.scrollIntoView({ behavior: smooth===false ? 'auto' : 'smooth', inline:'center', block:'nearest' });
    }
  }catch(e){}
};

window._resolveTopTabEl = function(t, fallbackEl){
  try{
    if(fallbackEl && fallbackEl.classList) return fallbackEl;
    const tabs = [...document.querySelectorAll('.tab')];
    if(t === 'cfg'){
      return document.getElementById('tabCfg')
        || document.querySelector('.tab[onclick*="sw(\'cfg\'"]')
        || null;
    }
    return tabs.find(b => {
      try{
        const oc = b.getAttribute('onclick') || '';
        return oc.includes(`'${t}'`) || oc.includes(`"${t}"`);
      }catch(e){
        return false;
      }
    }) || null;
  }catch(e){
    return null;
  }
};

window._goTopTab = function(t, fallbackEl){
  try{
    if(typeof sw === 'function'){
      sw(t, fallbackEl);
      return true;
    }
    const el = (typeof window._resolveTopTabEl === 'function')
      ? window._resolveTopTabEl(t, fallbackEl)
      : null;
    if(el && typeof el.click === 'function'){
      el.click();
      return true;
    }
  }catch(e){}
  return false;
};

window._goCfgSection = function(secId){
  try{
    if(typeof window._lazyCfgGo === 'function'){
      window._lazyCfgGo(secId);
      return true;
    }
  }catch(e){}
  try{
    if(typeof window.cfgGo === 'function'){
      window.cfgGo(secId);
      return true;
    }
  }catch(e){}
  try{
    if(typeof window._goTopTab === 'function') return !!window._goTopTab('cfg');
  }catch(e){}
  try{
    if(typeof window.sw === 'function'){
      window.sw('cfg');
      return true;
    }
  }catch(e){}
  return false;
};

window.openCfgHome = function(){
  try{ return !!window._goCfgSection(); }catch(e){ return false; }
};
window.openCfgTier = function(){
  try{ return !!window._goCfgSection('tier'); }catch(e){ return false; }
};
window.openCfgDataSync = function(){
  try{ return !!window._goCfgSection('💾 데이터'); }catch(e){ return false; }
};

function sw(t,el){
  try{
    if(t==='cfg' && (!(typeof isLoggedIn!=='undefined' && isLoggedIn) || (typeof isSubAdmin!=='undefined' && isSubAdmin))){
      if(typeof showToast==='function') showToast('설정탭은 총관리자만 접근할 수 있습니다.');
      return;
    }
  }catch(e){}
  if(t==='comp') { compSub='league'; leagueFilterDate=''; leagueFilterGrp=''; grpRankFilter=''; }
  if(t==='mini') miniSub='records';
  if(t==='ind') indSub='records';
  if(t==='gj') gjSub='records';
  if(t==='univck') ckSub='records';
  if(t==='univm') univmSub='records';
  if(t==='ind')      _mergedIndSub='ind';
  if(t==='gj')       _mergedIndSub='gj';
  if(t==='univm'||t==='mini') { _mergedUnivSub='mini'; miniType='mini'; }
  if(t==='univck')   _mergedUnivSub='univck';
  if(t==='comp')     _mergedCompSub='comp';
  if(t==='tiertour') _mergedCompSub='tiertour';
  if(t==='pro') { _mergedProSub='pro'; }
  if(t==='hist') histSub='mini';
  if(window._recQ){
    const tabModeMap={mini:'mini',univck:'ck',univm:'univm',comp:'comp',pro:'pro',ind:'ind'};
    const m=tabModeMap[t];
    if(m)window._recQ[m]='';
  }
  if(t==='total')totalSearch='';
  curTab=t;openDetails={};
  const tabs = [...document.querySelectorAll('.tab')];
  const resolvedEl = (typeof window._resolveTopTabEl === 'function')
    ? window._resolveTopTabEl(t, el)
    : null;
  tabs.forEach(b=>b.classList.remove('on'));
  if(resolvedEl && resolvedEl.classList) resolvedEl.classList.add('on');
  document.querySelectorAll('.bnav-item').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    b.classList.toggle('on',oc.includes("'"+t+"'"));
  });
  const _fs=document.getElementById('fstrip');
  if(_fs)_fs.style.display=(t==='total'&&isLoggedIn)?'block':'none';
  const C=document.getElementById('rcont');
  if(C) C.innerHTML='';
  render();
  try{ setTimeout(()=>{ if(typeof window._centerActiveTopTab==='function') window._centerActiveTopTab(); }, 30); }catch(e){}
}

function _lazyRStats(C, T){
  _lazyLoadingView(T, C, '통계', '통계 모듈을 불러오는 중...');
  (async()=>{
    try{
      await _ensureStatsLoaded();
      const fn = window.rStats;
      if(typeof fn === 'function' && fn !== _lazyRStats) fn(C, T);
      else render(true);
    }catch(e){
      console.error('[lazy] rStats load fail', e);
      try{ if(C) C.innerHTML='<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-title">통계 로딩 실패</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>'; }catch(_){}
    }
  })();
}

async function _ensureStatsFeatureReady(){
  try{
    await _ensureStatsLoaded();
    return true;
  }catch(e){
    console.error('[lazy] stats feature load fail', e);
    return false;
  }
}

function _lazyOnGlobalSearch(val){
  const q = String(val||'');
  (async()=>{
    const ok = await _ensureStatsFeatureReady();
    if(!ok) return;
    const fn = window.onGlobalSearch;
    if(typeof fn === 'function' && fn !== _lazyOnGlobalSearch) fn(q);
  })();
}

function _lazyOpenShareCardModal(){
  (async()=>{
    const ok = await _ensureStatsFeatureReady();
    if(!ok) return;
    const fn = window.openShareCardModal;
    if(typeof fn === 'function' && fn !== _lazyOpenShareCardModal) fn();
  })();
}

function _lazyRenderShareCardByMatchObj(m){
  (async()=>{
    const ok = await _ensureStatsFeatureReady();
    if(!ok) return;
    const fn = window.renderShareCardByMatchObj;
    if(typeof fn === 'function' && fn !== _lazyRenderShareCardByMatchObj) fn(m);
  })();
}

function _lazyRCal(C, T){
  _lazyLoadingView(T, C, '캘린더', '캘린더 모듈을 불러오는 중...');
  (async()=>{
    try{
      await _ensureCalendarLoaded();
      const fn = window.rCal;
      if(typeof fn === 'function' && fn !== _lazyRCal) fn(C, T);
      else render(true);
    }catch(e){
      console.error('[lazy] rCal load fail', e);
      try{ if(C) C.innerHTML='<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-title">캘린더 로딩 실패</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>'; }catch(_){}
    }
  })();
}

function _lazyCheckFbSyncStatus(){
  (async()=>{
    try{
      await _ensureCloudBoardLoaded();
      const fn = window.checkFbSyncStatus;
      if(typeof fn === 'function' && fn !== _lazyCheckFbSyncStatus) fn();
    }catch(e){
      console.error('[lazy] checkFbSyncStatus load fail', e);
      try{ alert('동기화 상태 확인 로딩 실패: 새로고침 후 다시 시도해주세요.'); }catch(_){}
    }
  })();
}

window.onGlobalSearch = window.onGlobalSearch || _lazyOnGlobalSearch;
window.openShareCardModal = window.openShareCardModal || _lazyOpenShareCardModal;
window.renderShareCardByMatchObj = window.renderShareCardByMatchObj || _lazyRenderShareCardByMatchObj;
window.rStats = window.rStats || _lazyRStats;
window.rCal   = window.rCal   || _lazyRCal;
window.checkFbSyncStatus = window.checkFbSyncStatus || _lazyCheckFbSyncStatus;
