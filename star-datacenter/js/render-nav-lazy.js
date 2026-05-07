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
window._tabLinkApplying = false;
window._lastTabLinkUrl = '';
window._lastAppliedDeepLinkSig = '';
window._lastHistDetailState = window._lastHistDetailState || null;

window._isModalOpen = function(id){
  try{
    const el = document.getElementById(id);
    if(!el) return false;
    const st = getComputedStyle(el);
    return st.display !== 'none' && st.visibility !== 'hidden';
  }catch(e){
    return false;
  }
};

window._getTabLinkState = function(){
  try{
    const out = { tab: String(curTab||'total'), sub: '', player:'', univ:'', detailMode:'', detailIdx:'' };
    if(out.tab === 'hist') out.sub = String(histSub||'mini');
    else if(out.tab === 'ind') out.sub = String(_mergedIndSub||'ind');
    else if(out.tab === 'mini') out.sub = String(_mergedUnivSub||'mini');
    else if(out.tab === 'comp') out.sub = String(_mergedCompSub||'comp');
    else if(out.tab === 'pro') out.sub = String(_mergedProSub||'pro');
    else if(out.tab === 'stats') out.sub = String((window.statsSub||'overview'));
    try{
      const ps = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
      if(window._isModalOpen('playerModal') && ps.currentName) out.player = String(ps.currentName||'');
    }catch(e){}
    try{
      const us = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
      if(window._isModalOpen('univModal') && us.currentName) out.univ = String(us.currentName||'');
    }catch(e){}
    try{
      const ds = window._lastHistDetailState || {};
      if(window._isModalOpen('histDetModal') && ds.mode && ds.idx!=null){
        out.detailMode = String(ds.mode||'');
        out.detailIdx = String(ds.idx);
      }
    }catch(e){}
    return out;
  }catch(e){
    return { tab:'total', sub:'', player:'', univ:'', detailMode:'', detailIdx:'' };
  }
};

window._syncTabUrlFromState = function(mode){
  try{
    if(window._tabLinkApplying) return;
    const state = (typeof window._getTabLinkState==='function') ? window._getTabLinkState() : { tab:String(curTab||'total'), sub:'' };
    const url = new URL(window.location.href);
    if(state.tab && state.tab !== 'total') url.searchParams.set('tab', state.tab);
    else url.searchParams.delete('tab');
    if(state.sub) url.searchParams.set('sub', state.sub);
    else url.searchParams.delete('sub');
    if(state.player) url.searchParams.set('player', state.player);
    else url.searchParams.delete('player');
    if(state.univ) url.searchParams.set('univ', state.univ);
    else url.searchParams.delete('univ');
    if(state.detailMode && state.detailIdx !== '') {
      url.searchParams.set('detailMode', state.detailMode);
      url.searchParams.set('detailIdx', state.detailIdx);
    } else {
      url.searchParams.delete('detailMode');
      url.searchParams.delete('detailIdx');
    }
    const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') + url.hash;
    const cur = window.location.pathname + window.location.search + window.location.hash;
    if(next === cur){
      window._lastTabLinkUrl = next;
      return;
    }
    if(mode === 'push') window.history.pushState({ soloTabLink:true }, '', next);
    else window.history.replaceState({ soloTabLink:true }, '', next);
    window._lastTabLinkUrl = next;
  }catch(e){}
};

window._openHistoryDetailByRoute = function(mode, idx){
  try{
    const i = Number(idx);
    if(!Number.isFinite(i) || i < 0) return false;
    const mk = String(mode||'').trim();
    const pickColor = (name, fallback) => {
      try{ return (typeof gc==='function' ? (gc(name)||fallback) : fallback) || fallback; }catch(e){ return fallback; }
    };
    const openSets = (arr, modeKey, labelAKey='a', labelBKey='b') => {
      const m = Array.isArray(arr) ? arr[i] : null;
      if(!m) return false;
      const a = m[labelAKey] || m.teamALabel || 'A';
      const b = m[labelBKey] || m.teamBLabel || 'B';
      const sa = Number(m.sa||0), sb = Number(m.sb||0);
      const key = `route:${modeKey}:${i}`;
      if(typeof _regDet==='function') _regDet(key, m, modeKey, a, b, pickColor(a,'#3b82f6'), pickColor(b,'#ef4444'), sa>sb, sb>sa, i);
      if(typeof openHistDetailModal==='function') openHistDetailModal(key);
      return true;
    };
    const openIndLike = (arr, modeKey) => {
      const m = Array.isArray(arr) ? arr[i] : null;
      if(!m) return false;
      const a = m.wName || 'WIN', b = m.lName || 'LOSE';
      const key = `route:${modeKey}:${i}`;
      const mm = { _id:key, d:m.d||'', map:m.map||'', wName:m.wName||'', lName:m.lName||'' };
      if(typeof _regDet==='function') _regDet(key, mm, modeKey, 'WIN', 'LOSE', '#3b82f6', '#ef4444', true, false, i);
      if(typeof openHistDetailModal==='function') openHistDetailModal(key);
      return true;
    };
    if(mk==='mini') return openSets(typeof miniM!=='undefined'?miniM:[], 'mini');
    if(mk==='civil') return openSets(typeof civilM!=='undefined'?civilM:[], 'civil');
    if(mk==='univm') return openSets(typeof univM!=='undefined'?univM:[], 'univm');
    if(mk==='ck') return openSets(typeof ckM!=='undefined'?ckM:[], 'ck');
    if(mk==='pro') return openSets(typeof proM!=='undefined'?proM:[], 'pro');
    if(mk==='comp') return openSets(typeof comps!=='undefined'?comps:[], 'comp');
    if(mk==='tt') return openSets(typeof ttM!=='undefined'?ttM:[], 'tt');
    if(mk==='ind') return openIndLike(typeof indM!=='undefined'?indM:[], 'ind');
    if(mk==='gj') return openIndLike(typeof gjM!=='undefined'?gjM:[], 'gj');
    if(mk==='progj') return openIndLike((typeof gjM!=='undefined' ? (gjM||[]).filter(x=>x&&x._proLabel) : []), 'progj');
  }catch(e){}
  return false;
};

window._applyDeepLinkFromUrl = function(){
  try{
    const params = new URLSearchParams(window.location.search);
    const player = String(params.get('player')||'').trim();
    const univ = String(params.get('univ')||'').trim();
    const detailMode = String(params.get('detailMode')||'').trim();
    const detailIdx = String(params.get('detailIdx')||'').trim();
    const sig = JSON.stringify({ player, univ, detailMode, detailIdx, tab:String(params.get('tab')||''), sub:String(params.get('sub')||'') });
    if(window._lastAppliedDeepLinkSig === sig){
      const ps = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
      const us = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
      const ds = window._lastHistDetailState || {};
      if(detailMode && detailIdx !== '' && window._isModalOpen('histDetModal') && String(ds.mode||'')===detailMode && String(ds.idx??'')===String(detailIdx)) return false;
      if(player && window._isModalOpen('playerModal') && String(ps.currentName||'')===player) return false;
      if(univ && window._isModalOpen('univModal') && String(us.currentName||'')===univ) return false;
      if(!detailMode && !player && !univ) return false;
    }
    window._lastAppliedDeepLinkSig = sig;
    if(detailMode && detailIdx !== ''){
      try{
        if(typeof window._openHistoryDetailByRoute==='function' && window._openHistoryDetailByRoute(detailMode, detailIdx)) return true;
      }catch(e){}
    }
    if(player){
      try{
        if(typeof openPlayerModal==='function' && Array.isArray(players) && players.some(p=>p&&p.name===player)){
          openPlayerModal(player);
          return true;
        }
      }catch(e){}
    }
    if(univ){
      try{
        if(typeof openUnivModal==='function' && Array.isArray(univCfg) && univCfg.some(u=>u&&u.name===univ)){
          openUnivModal(univ);
          return true;
        }
      }catch(e){}
    }
    return false;
  }catch(e){
    return false;
  }
};

window._applyTabLinkFromUrl = function(){
  try{
    const params = new URLSearchParams(window.location.search);
    let tab = String(params.get('tab')||'').trim();
    let sub = String(params.get('sub')||'').trim();
    if(!tab) return false;

    if(tab === 'gj'){ tab='ind'; sub='gj'; }
    else if(['civil','mini','univm','univck'].includes(tab)){ sub=tab; tab='mini'; }
    else if(tab === 'tiertour'){ sub='tiertour'; tab='comp'; }
    else if(tab === 'progj'){ sub='gj'; tab='pro'; }
    else if(tab === 'procomp'){ sub='comp'; tab='pro'; }

    const validTabs = new Set(['total','board','tier','hist','ind','mini','comp','pro','stats','cal','roulette','cfg']);
    if(!validTabs.has(tab)) return false;

    if(tab === 'hist' && sub) histSub = sub;
    else if(tab === 'ind' && sub && ['ind','gj'].includes(sub)){
      _mergedIndSub = sub;
      try{
        if(sub === 'ind' && typeof indSub!=='undefined' && indSub==='input') indSub='records';
        if(sub === 'gj' && typeof gjSub!=='undefined' && gjSub==='input') gjSub='records';
      }catch(e){}
    }
    else if(tab === 'mini' && sub && ['civil','mini','univm','univck'].includes(sub)) _mergedUnivSub = sub;
    else if(tab === 'comp' && sub && ['comp','tiertour'].includes(sub)) _mergedCompSub = sub;
    else if(tab === 'pro' && sub && ['pro','gj','comp'].includes(sub)){
      _mergedProSub = sub;
      try{
        if(sub === 'gj' && typeof gjSub!=='undefined' && gjSub==='input') gjSub='records';
      }catch(e){}
    }
    else if(tab === 'stats' && sub) window.statsSub = sub;

    curTab = tab;
    return true;
  }catch(e){
    return false;
  }
};

function sw(t,el){
  try{
    if(t==='cfg' && !(typeof isLoggedIn!=='undefined' && isLoggedIn)){
      if(typeof showToast==='function') showToast('설정탭은 관리자만 접근할 수 있습니다.');
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
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('push'); }catch(e){}
  try{ setTimeout(()=>{ if(typeof window._centerActiveTopTab==='function') window._centerActiveTopTab(); }, 30); }catch(e){}
}

if(!window.__tabLinkPopstateBound){
  window.__tabLinkPopstateBound = true;
  window.addEventListener('popstate', ()=>{
    try{
      window._tabLinkApplying = true;
      const ok = (typeof window._applyTabLinkFromUrl==='function') ? window._applyTabLinkFromUrl() : false;
      if(ok && typeof render==='function') render();
      setTimeout(()=>{
        try{
          window._tabLinkApplying = false;
          if(typeof window._centerActiveTopTab==='function') window._centerActiveTopTab(false);
        }catch(e){}
      }, 30);
    }catch(e){
      window._tabLinkApplying = false;
    }
  });
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
