// ══════════════════════════════════════════════════════════
// constants-save.js — 저장/동기화 함수 (constants.js 에서 분리)
// 의존: constants.js (J, _lsSave, players, univCfg, 매치배열 등 전역)
// ══════════════════════════════════════════════════════════

function localSave(){
  try{
    // 저장 전 각 경기 배열 날짜 내림차순 정렬
    try{
      [window.indM, window.gjM, window.ttM, window.univM, window.ckM, window.miniM].forEach(arr=>_sortMatchArrByDate(arr));
    }catch(_){}
    _lsSave('su_tiers',TIERS);
    // 데이터 버전 관리 - 캐시 무효화용
    _lsSave('su_data_version', DATA_VERSION || 1);
    // teamAMembers/teamBMembers에서 tier·race 제거 (표시 시 players 배열 조회)
    const _trimM=arr=>arr.map(m=>{
      if(!m.teamAMembers&&!m.teamBMembers)return m;
      const r={...m};
      if(r.teamAMembers)r.teamAMembers=r.teamAMembers.map(x=>({name:x.name,univ:x.univ}));
      if(r.teamBMembers)r.teamBMembers=r.teamBMembers.map(x=>({name:x.name,univ:x.univ}));
      return r;
    });
    _lsSave('su_u',univCfg);
    _lsSave('su_m',maps);
    _lsSave('su_mAlias',userMapAlias);
    _lsSave('su_t',tourD);
    // 경기 기록 원본은 IndexedDB 우선 저장
    _lsSave('su_cn',compNames);
    _lsSave('su_cc',curComp);
    _lsSave('su_ptc',curProComp);
    _lsSave('su_ttcur',_ttCurComp);
    if(typeof boardOrder!=='undefined') _lsSave('su_boardOrder',boardOrder);
    if(typeof boardPlayerOrder!=='undefined') _lsSave('su_bpo',boardPlayerOrder);
    try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}
    _lsSave('su_notices',notices);
    _lsSave('su_seasons',seasons);
    _lsSave('su_cal_sched',calScheduled);
    if(window.MatchStore && typeof window.MatchStore.save==='function'){
      window._lastMatchStoreSavePromise = window.MatchStore.save().catch(e=>{
        console.warn('[MatchStore.save]', e && e.message ? e.message : e);
        return false;
      });
    }else{
      window._lastMatchStoreSavePromise = Promise.resolve(true);
    }
    if(window.PlayerStore && typeof window.PlayerStore.save==='function'){
      window._lastPlayerStoreSavePromise = window.PlayerStore.save().catch(e=>{
        console.warn('[PlayerStore.save]', e && e.message ? e.message : e);
        return false;
      });
    }else{
      const _pPhotoMap={};
      const _pNoPhoto=players.map(p=>{
        const c=_stripPlayerHistoryForSave(p);
        if(p.photo){_pPhotoMap[p.name]=p.photo;delete c.photo;}
        return c;
      });
      _lsSave('su_pp',_pPhotoMap);
      _lsSave('su_p',_pNoPhoto);
      window._lastPlayerStoreSavePromise = Promise.resolve(true);
    }
    localStorage.setItem('su_last_save_time',Date.now().toString());
    if(BLD['ck'])_lsSave('su_bld_ck',{membersA:BLD['ck'].membersA||[],membersB:BLD['ck'].membersB||[]});
    if(BLD['pro'])_lsSave('su_bld_pro',{date:BLD['pro'].date||'',membersA:BLD['pro'].membersA||[],membersB:BLD['pro'].membersB||[],tierFilters:BLD['pro'].tierFilters||[],sets:BLD['pro'].sets||[]});
  }catch(e){
    if(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'){
      if(typeof showToast==='function')showToast('⚠️ 저장 공간이 부족합니다! 일부 데이터가 저장되지 않았을 수 있습니다.',5000);
      else alert('⚠️ 저장 공간이 부족합니다! 브라우저 저장소를 정리해 주세요.');
    }else{
      console.error('[localSave error]',e);
    }
  }
}

// 설정 전용 경량 저장 — 선수 기록·대전 데이터 직렬화 없음, Firebase 스킵
// 맵·약자·상태아이콘·티어·대학 설정 변경 시 사용
function saveCfg(){
  try{
    _lsSave('su_tiers',TIERS);
    _lsSave('su_u',univCfg);
    _lsSave('su_m',maps);
    _lsSave('su_mAlias',userMapAlias);
    localStorage.setItem('su_last_save_time',Date.now().toString());
    try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}

    // 설정 변경 GitHub 자동 반영은 옵션이 켜진 경우에만 수행
    try{
      const statusEl = document.getElementById('cloudStatus');
      if (typeof isLoggedIn !== 'undefined' && isLoggedIn) {
        const token = localStorage.getItem('su_gh_token') || '';
        const autoCfgRemote = (localStorage.getItem('su_cfg_remote_auto') ?? '1') === '1';
        if (token && autoCfgRemote && typeof window.fbUpdate === 'function') {
          // su_* 키 일부(큰 값/비밀 값 제외)도 함께 동기화 → 설정탭 변경이 다른 기기에 바로 적용
          const _syncLs = {};
          try{
            for(let i=0;i<localStorage.length;i++){
              const k = localStorage.key(i);
              if(!k || typeof k!=='string') continue;
              if(!k.startsWith('su_')) continue;
              if(k.startsWith('su_pp')) continue;
              if(k==='su_fb_pw' || k==='su_gh_token' || k==='su_admin_hash' || k==='su_admin_hashes') continue;
              if(k==='su_last_admin_save' || k==='su_last_save_time') continue;
              // 대용량/캐시 키 제외 (fbCloudSave와 일치)
              if(k==='su_hist_ext_data_v1' || k==='su_hist_ext_proxy_presets_v1' || k==='su_hist_ext_proxy_preset_sel_v1' || k==='su_hist_ext_last_modified') continue;
              if(k==='su_unified_settings_v1' || k==='su_unified_settings_migrated_v2') continue;
              if(k.startsWith('su_match_store_') || k.startsWith('su_sharecard_cache_') || k.startsWith('su_hist_ext_meta_')) continue;
              const v = localStorage.getItem(k);
              if(v==null) continue;
              if(String(v).length > 200000) continue;
              _syncLs[k] = v;
            }
          }catch(e){}

          const patch = {
            tiers: TIERS,
            univCfg,
            maps,
            userMapAlias,
            playerStatusIcons: (typeof playerStatusIcons!=='undefined' ? playerStatusIcons : {}),
            appSettings: { ls: _syncLs },
          };
          if(statusEl){ statusEl.style.color=''; statusEl.textContent='⏫ 설정 GitHub 저장 중...'; }
          window.fbUpdate(patch)
            .then(()=>{ if(statusEl){ statusEl.style.color='#16a34a'; statusEl.textContent='✅ 설정 GitHub 반영됨'; setTimeout(()=>{ if(statusEl){statusEl.textContent='';statusEl.style.color='';} }, 2500);} })
            .catch((e)=>{ if(statusEl){ statusEl.style.color='#dc2626'; statusEl.textContent='❌ 설정 GitHub 실패'; } console.error('[fbUpdate cfg]',e); });
        } else {
          // GitHub 토큰 미설정이거나 자동 반영 OFF면 로컬만 저장
          if(statusEl){
            if(!token){
              statusEl.style.color='#d97706';
              statusEl.textContent='⚠️ 로컬만 저장 (설정탭→GitHub 토큰 필요)';
              setTimeout(()=>{ if(statusEl){statusEl.textContent='';statusEl.style.color='';} }, 4000);
            }else if(!autoCfgRemote){
              statusEl.style.color='#64748b';
              statusEl.textContent='💾 로컬 저장만 수행됨 (설정 자동 GitHub 저장 OFF)';
              setTimeout(()=>{ if(statusEl){statusEl.textContent='';statusEl.style.color='';} }, 2200);
            }
          }
        }
      }
    }catch(e){}
  }catch(e){console.error('[saveCfg error]',e);}
}
// 프로필 사진만 저장 — su_pp만 갱신 (history 직렬화 없음)
function savePhotos(){
  try{
    if(window.PlayerStore && typeof window.PlayerStore.save==='function'){
      window.PlayerStore.save().catch(e=>console.warn('[PlayerStore.savePhotos]', e && e.message ? e.message : e));
    }else{
      const _ppm={};
      players.forEach(p=>{if(p.photo)_ppm[p.name]=p.photo;});
      _lsSave('su_pp',_ppm);
    }
    localStorage.setItem('su_last_save_time',Date.now().toString());
  }catch(e){console.error('[savePhotos error]',e);}
}
const _REMOTE_SAVE_DEBOUNCE_MS = 1000; // 1초 간격으로 저장 요청 취합 (즉시 동기화를 위해 감소)
let _remoteCloudSaveTimer = null;
let _remoteCloudSaveBusy = false;
function _setPendingRemoteSave(reason, failMsg, mode){
  try{
    localStorage.setItem('su_sync_pending_save', '1');
    localStorage.setItem('su_sync_pending_save_at', String(Date.now()));
    if(reason) localStorage.setItem('su_sync_pending_save_reason', String(reason));
    if(mode) localStorage.setItem('su_sync_pending_save_mode', String(mode));
    if(failMsg) localStorage.setItem('su_sync_last_fail_msg', String(failMsg));
  }catch(e){}
  try{ if(typeof window._updateSyncNetworkBadge==='function') window._updateSyncNetworkBadge(); }catch(e){}
}
function _clearPendingRemoteSave(){
  try{
    localStorage.removeItem('su_sync_pending_save');
    localStorage.removeItem('su_sync_pending_save_at');
    localStorage.removeItem('su_sync_pending_save_reason');
    localStorage.removeItem('su_sync_pending_save_mode');
    localStorage.removeItem('su_sync_last_fail_msg');
  }catch(e){}
  try{ if(typeof window._updateSyncNetworkBadge==='function') window._updateSyncNetworkBadge(); }catch(e){}
}
function _setCloudStatusMsg(msg, color){
  try{
    if(typeof window.refreshCloudSyncStatus === 'function') window.refreshCloudSyncStatus(msg, color);
    else{
      const statusEl = document.getElementById('cloudStatus');
      if(statusEl){
        statusEl.style.color = color || '';
        statusEl.textContent = msg;
      }
    }
  }catch(e){}
}
function _updateSyncNetworkBadge(){
  try{
    const el = document.getElementById('syncNetBadge');
    if(!el) return;
    const online = navigator.onLine !== false;
    const pending = localStorage.getItem('su_sync_pending_save') === '1';
    if(!online){
      el.textContent = '오프라인';
      el.style.color = '#b45309';
      el.style.borderColor = '#fbbf24';
      el.style.background = '#fffbeb';
    }else if(pending){
      el.textContent = '미전송 있음';
      el.style.color = '#b91c1c';
      el.style.borderColor = '#fca5a5';
      el.style.background = '#fef2f2';
    }else{
      el.textContent = '온라인';
      el.style.color = 'var(--text2)';
      el.style.borderColor = 'var(--border)';
      el.style.background = 'var(--surface)';
    }
    el.title = pending ? '아직 다른 기기에 반영되지 않은 저장이 있습니다' : (online ? '네트워크 연결됨' : '오프라인 상태입니다');
  }catch(e){}
}
try{ window._updateSyncNetworkBadge = _updateSyncNetworkBadge; }catch(e){}
const _MATCH_SYNC_SIG_KEYS = {
  pending: 'su_sync_pending_match_sig',
  uploaded: 'su_sync_last_uploaded_match_sig'
};
let _lastObservedMatchSyncSig = '';
function _matchSyncHash(str){
  let h = 2166136261;
  for(let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
function _buildMatchSyncSignature(){
  const _playersForSig = (Array.isArray(players)?players:[]).map(p=>_stripPlayerHistoryForSave(p));
  const payload = {
    miniM,
    univM,
    comps,
    ckM,
    proM,
    ttM,
    indM,
    gjM,
    players:_playersForSig,
    TIERS,
    univCfg,
    maps,
    userMapAlias,
    notices,
    seasons,
    calScheduled,
    boardOrder:(typeof boardOrder!=='undefined' ? boardOrder : []),
    boardPlayerOrder:(typeof boardPlayerOrder!=='undefined' ? boardPlayerOrder : []),
    tourD
  };
  const json = JSON.stringify(payload);
  return `${json.length}:${_matchSyncHash(json)}`;
}
function _primeMatchSyncSignature(force){
  try{
    const sig = _buildMatchSyncSignature();
    if(force || !_lastObservedMatchSyncSig) _lastObservedMatchSyncSig = sig;
    return sig;
  }catch(e){
    if(force) _lastObservedMatchSyncSig = '';
    return _lastObservedMatchSyncSig || '';
  }
}
try{ window._primeMatchSyncSignature = _primeMatchSyncSignature; }catch(e){}
async function _ensureRemoteSaveReady(){
  if(typeof window.fbCloudSave === 'function' && typeof window.fbSet === 'function') return true;
  try{
    if (typeof window._ensureCloudBoardLoaded === 'function') {
      await window._ensureCloudBoardLoaded();
    } else if (typeof window._loadScriptOnce === 'function') {
      await window._loadScriptOnce('js/cloud-board-state.js?v=20260629-split');
      await window._loadScriptOnce('js/cloud-board-render.js?v=20260629-split');
      await window._loadScriptOnce('js/cloud-board-drag.js?v=20260629-split');
      await window._loadScriptOnce('js/cloud-board-rank-sync.js?v=20260629-split');
    }
  }catch(e){
    console.error('[save] cloud-board load fail', e);
  }
  return typeof window.fbCloudSave === 'function' && typeof window.fbSet === 'function';
}
async function _flushRemoteCloudSave(reason){
  if(_remoteCloudSaveTimer){
    clearTimeout(_remoteCloudSaveTimer);
    _remoteCloudSaveTimer = null;
  }
  if(!(typeof isLoggedIn !== 'undefined' && isLoggedIn)) return false;
  if(!localStorage.getItem('su_gh_token')){
    try{ localStorage.setItem('su_sync_last_fail_msg','GitHub 토큰 없음'); }catch(e){}
    _setCloudStatusMsg('⚠️ 로컬만 저장 (설정탭→GitHub 토큰 필요)', '#d97706');
    return false;
  }
  if(navigator.onLine === false){
    _setPendingRemoteSave(reason || 'save', '오프라인 상태', 'offline');
    _setCloudStatusMsg('📴 오프라인 상태 — 온라인 복귀 시 자동 업로드', '#d97706');
    return false;
  }
  if(_remoteCloudSaveBusy){
    _setPendingRemoteSave(reason || 'save', '', 'queued');
    return false;
  }
  _remoteCloudSaveBusy = true;
  try{
    const ready = await _ensureRemoteSaveReady();
    if(!ready){
      _setPendingRemoteSave(reason || 'save', 'GitHub 저장 모듈 미연결', 'failed');
      // 에러 메시지를 부드럽게 표시 (3초 후 사라짐)
      _setCloudStatusMsg('⚠️ GitHub 연결 확인 중...', '#d97706');
      setTimeout(() => { _setCloudStatusMsg('', ''); }, 3000);
      return false;
    }
    _setCloudStatusMsg('⏫ GitHub 저장 중...', '#2563eb');
    await window.fbCloudSave({ includeSettings:true });
    try{
      const now = Date.now();
      const uploadedSig = localStorage.getItem(_MATCH_SYNC_SIG_KEYS.pending) || _buildMatchSyncSignature();
      localStorage.setItem('su_last_save_time', String(now));
      localStorage.setItem('su_sync_last_upload_ok_at', String(now));
      localStorage.setItem(_MATCH_SYNC_SIG_KEYS.uploaded, uploadedSig);
      localStorage.removeItem(_MATCH_SYNC_SIG_KEYS.pending);
      localStorage.removeItem('su_sync_last_fail_msg');
      _primeMatchSyncSignature(true);
    }catch(e){}
    _clearPendingRemoteSave();
    _setCloudStatusMsg('✅ GitHub 저장됨', '#16a34a');
    return true;
  }catch(e){
    const errMsg = String((e&&e.message)||e||'');
    const isRateLimit = errMsg.includes('403') || errMsg.includes('rate') || errMsg.includes('limit');
    const isNetwork = errMsg.includes('network') || errMsg.includes('fetch') || errMsg.includes('timeout');
    
    if(isRateLimit){
      _setPendingRemoteSave(reason || 'save', 'GitHub API 제한', 'retry');
      _setCloudStatusMsg('⏳ GitHub API 제한 — 잠시 후 재시도', '#d97706');
    }else if(isNetwork){
      _setPendingRemoteSave(reason || 'save', '네트워크 오류', 'retry');
      _setCloudStatusMsg('📴 네트워크 불안정 — 자동 재시도 예정', '#d97706');
    }else{
      _setPendingRemoteSave(reason || 'save', errMsg, 'failed');
      _setCloudStatusMsg('⚠️ GitHub 저장 지연 — 로컬은 안전함', '#d97706');
    }
    
    console.error('[fbCloudSave]',e);
    // 5초 후 자동 재시도
    setTimeout(() => {
      if(localStorage.getItem('su_sync_pending_save') === '1'){
        _scheduleRemoteCloudSave(30000, 'retry');
      }
    }, 5000);
    return false;
  }finally{
    _remoteCloudSaveBusy = false;
    try{ _updateSyncNetworkBadge(); }catch(e){}
  }
}
function _scheduleRemoteCloudSave(delay, reason){
  try{
    if(!(typeof isLoggedIn !== 'undefined' && isLoggedIn)) return false;
    const wait = Math.max(0, parseInt(delay, 10) || 0);
    _setPendingRemoteSave(reason || 'save', '', 'queued');
    if(_remoteCloudSaveTimer){
      clearTimeout(_remoteCloudSaveTimer);
      _remoteCloudSaveTimer = null;
    }
    _setCloudStatusMsg('💾 로컬 저장됨 · GitHub 업로드 대기', '#2563eb');
    _remoteCloudSaveTimer = setTimeout(()=>{
      _remoteCloudSaveTimer = null;
      _flushRemoteCloudSave(reason || 'save').catch(e=>{
        console.error('[scheduleRemoteCloudSave]', e);
      });
    }, wait);
    try{ _updateSyncNetworkBadge(); }catch(e){}
    return true;
  }catch(e){
    console.error('[scheduleRemoteCloudSave]', e);
    return false;
  }
}
window._retryPendingRemoteSave = function(force){
  try{
    if(!(typeof isLoggedIn !== 'undefined' && isLoggedIn)) return false;
    const pending = localStorage.getItem('su_sync_pending_save') === '1';
    const pendingSig = localStorage.getItem(_MATCH_SYNC_SIG_KEYS.pending);
    if(!force && !pending && !pendingSig) return false;
    if(force){
      _flushRemoteCloudSave('retry').catch(e=>console.error('[retryPendingRemoteSave]', e));
      return true;
    }
    return _scheduleRemoteCloudSave(0, 'retry');
  }catch(e){
    console.error('[retryPendingRemoteSave]', e);
    return false;
  }
};
window.addEventListener('online', ()=>{
  _updateSyncNetworkBadge();
  _setCloudStatusMsg('🌐 온라인 복귀', '#2563eb');
  try{ if(typeof window._retryPendingRemoteSave==='function') window._retryPendingRemoteSave(); }catch(e){}
});
window.addEventListener('offline', ()=>{
  _updateSyncNetworkBadge();
  _setCloudStatusMsg('📴 오프라인 상태 — 로컬 저장만 유지', '#d97706');
});
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState === 'visible'){
    _updateSyncNetworkBadge();
  }
});
window.addEventListener('DOMContentLoaded', ()=>{
  _updateSyncNetworkBadge();
}, { once:true });
window.addEventListener('DOMContentLoaded', ()=>{
  _checkDataVersion();
}, { once:true });
window.addEventListener('DOMContentLoaded', ()=>{
  try{
    if(window.MatchStore && typeof window.MatchStore.init==='function'){
      window.MatchStore.init().then(()=>{
        try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
        try{ if(typeof render==='function') render(); }catch(e){}
      });
    }
  }catch(e){}
}, { once:true });
async function save(){
  localSave();
  try{ await (window._lastMatchStoreSavePromise || Promise.resolve(true)); }catch(e){}
  try{
    const nextSig = _buildMatchSyncSignature();
    const uploadedSig = localStorage.getItem(_MATCH_SYNC_SIG_KEYS.uploaded) || '';
    const pendingSig = localStorage.getItem(_MATCH_SYNC_SIG_KEYS.pending) || '';
    _lastObservedMatchSyncSig = nextSig;
    if(uploadedSig && uploadedSig === nextSig){
      if(pendingSig === nextSig){
        try{ localStorage.removeItem(_MATCH_SYNC_SIG_KEYS.pending); }catch(e){}
      }
      _clearPendingRemoteSave();
      _setCloudStatusMsg('💾 로컬 저장됨 (원격 반영할 변경 없음)', '#16a34a');
      return;
    }
    localStorage.setItem(_MATCH_SYNC_SIG_KEYS.pending, nextSig);
  }catch(e){}
  const scheduled = (()=>{ try{ return _scheduleRemoteCloudSave(_REMOTE_SAVE_DEBOUNCE_MS, 'save'); }catch(e){ return false; } })();
  if(!scheduled){
    try{
      if((typeof isLoggedIn !== 'undefined' && isLoggedIn) && !localStorage.getItem('su_gh_token')){
        _setCloudStatusMsg('⚠️ 로컬만 저장 (설정탭→GitHub 토큰 필요)', '#d97706');
      }else{
        _setCloudStatusMsg('💾 로컬 저장됨', '#16a34a');
      }
    }catch(e){
      _setCloudStatusMsg('💾 로컬 저장됨', '#16a34a');
    }
  }
}

