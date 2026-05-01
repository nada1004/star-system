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

function sw(t,el){
  try{
    if(typeof isSubAdmin!=='undefined' && isSubAdmin && t==='cfg'){
      if(typeof showToast==='function') showToast('부관리자는 설정탭에 접근할 수 없습니다.');
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
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
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
