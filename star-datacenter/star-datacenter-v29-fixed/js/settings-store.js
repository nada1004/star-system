// 설정/동기화 저장소 통합 모듈
// - 원격: GitHub Gist (public) 파일 1개로 통합: su_settings.json
// - 로컬: localStorage (기존 키들과 하위호환)
// - 쓰기 권한: 관리자(isLoggedIn && !isSubAdmin) + 토큰 필요
// - 읽기 권한: Gist ID만 있으면 가능

(function(){
  if (window.SettingsStore) return;

  const FILE = 'su_settings.json';
  const LEGACY = {
    memo: 'al_memo.json',
    fab: 'su_ui_settings.json'
  };
  const LS = {
    enabled: 'al_sync_enabled',
    token: 'al_github_token',
    gistId: 'al_gist_id',
    // 기존 로컬 키(하위호환)
    memoObj: 'al_memo',
    fabHideMobile: 'su_fabHideMobile',
    fabHidePC: 'su_fabHidePC',
    // 동기화 상태 표시용
    lastPull: 'su_sync_last_pull',
    lastPush: 'su_sync_last_push',
    lastError: 'su_sync_last_error',
    lastRemoteMode: 'su_sync_last_remote_mode', // new|legacy|none
    lastMigrated: 'su_sync_last_migrated', // 1/0
    lastRemoteUpdatedAt: 'su_sync_last_settings_remote_updated_at',
    lastSignalSeenAt: 'su_sync_last_settings_signal_at',
    lastSignalPushedAt: 'su_sync_last_settings_signal_push_at',

    // AI(프록시/API키) 설정
    aiCfg: 'su_ai_cfg',

    // (추가) 기기별 설정(로컬 설정) 동기화
    prefsUpdatedAt: 'su_sync_prefs_updated_at',
    prefsAutoPush: 'su_sync_prefs_auto_push', // 1/0
  };
  const SETTINGS_SIGNAL_DB_URL = 'https://stardata1004-default-rtdb.firebaseio.com';
  const SETTINGS_SIGNAL_PATH = 'syncSignals/star-datacenter-settings';
  const SETTINGS_SIGNAL_DEFAULT_PW = 'haram1019!@';

  function cfg(){
    return {
      enabled: localStorage.getItem(LS.enabled) === '1',
      token: (localStorage.getItem(LS.token) || '').trim(),
      gistId: (localStorage.getItem(LS.gistId) || '').trim(),
    };
  }
  function setCfg(p){
    if ('enabled' in p) localStorage.setItem(LS.enabled, p.enabled ? '1' : '0');
    if ('token' in p) localStorage.setItem(LS.token, (p.token||'').trim());
    if ('gistId' in p) localStorage.setItem(LS.gistId, (p.gistId||'').trim());
  }
  function isAdmin(){
    try{
      if (typeof isLoggedIn !== 'undefined' && isLoggedIn) {
        if (typeof isSubAdmin !== 'undefined' && isSubAdmin) return false;
        return true;
      }
    }catch(e){}
    return false;
  }
  const _mergeMod = window.__createSettingsStoreMerge ? window.__createSettingsStoreMerge({ LS }) : {};
  const {
    _loadLocalState,
    _applyLocalState,
    _mergeByUpdatedAt,
    getAiCfg,
    setAiCfg,
    getMemo,
    setMemo,
    getFab,
    setFab,
    _isSyncablePrefKey
  } = _mergeMod;
  const _gistMod = window.__createSettingsStoreGist ? window.__createSettingsStoreGist({ FILE, LEGACY, LS, cfg, setCfg, isAdmin, _loadLocalState }) : {};
  const {
    _request,
    _coerceIso,
    _rememberRemoteUpdatedAt,
    ensureGist,
    _getGist,
    _readFileFromGist,
    _getRemoteStateWithMigrationDecision,
    _patchGistFile
  } = _gistMod;
  const _signalMod = window.__createSettingsStoreSignal ? window.__createSettingsStoreSignal({ LS, SETTINGS_SIGNAL_DB_URL, SETTINGS_SIGNAL_PATH, SETTINGS_SIGNAL_DEFAULT_PW, cfg }) : {};
  const {
    _settingsSignalUrl,
    _settingsSignalTs,
    _rememberSettingsSignal,
    _fetchSettingsSignal,
    _pushSettingsSignal,
    createPullOnSignal
  } = _signalMod;

  function _markSync(ok, mode, migrated){
    try{
      if (mode) localStorage.setItem(LS.lastRemoteMode, String(mode));
      if (typeof migrated !== 'undefined') localStorage.setItem(LS.lastMigrated, migrated ? '1' : '0');
      if (ok === 'pull') localStorage.setItem(LS.lastPull, new Date().toISOString());
      if (ok === 'push') localStorage.setItem(LS.lastPush, new Date().toISOString());
      if (ok === 'err') {
        // no-op here (caller sets lastError)
      } else {
        localStorage.removeItem(LS.lastError);
      }
    }catch(e){}
  }

  function getSyncStatus(){
    const c = cfg();
    return {
      enabled: !!c.enabled,
      gistId: c.gistId || '',
      tokenSet: !!c.token,
      isAdmin: isAdmin(),
      lastPull: localStorage.getItem(LS.lastPull) || '',
      lastPush: localStorage.getItem(LS.lastPush) || '',
      lastError: localStorage.getItem(LS.lastError) || '',
      remoteMode: localStorage.getItem(LS.lastRemoteMode) || '',
      migrated: localStorage.getItem(LS.lastMigrated) === '1',
      file: FILE
    };
  }

  async function pull(opts){
    opts = opts || {};
    const c = cfg();
    if (!c.gistId) return false;
    // enabled가 꺼져 있어도 읽기는 허용(요청사항: 다른 기기에서 반영)
    try{
      const remoteInfo = await _getRemoteStateWithMigrationDecision();
      const remote = remoteInfo.state;
      if (!remote) { _markSync(null, 'none', false); return false; }
      const remoteUpdatedAt = _coerceIso(remoteInfo.remoteUpdatedAt) || null;
      const lastSeenRemote = _coerceIso(localStorage.getItem(LS.lastRemoteUpdatedAt) || null);
      if(!opts.force && remoteUpdatedAt && lastSeenRemote && (new Date(remoteUpdatedAt).getTime() <= new Date(lastSeenRemote).getTime())){
        _markSync(null, remoteInfo.mode, false);
        if (opts.returnInfo) return { ok:true, mode:remoteInfo.mode, migrated:false, skipped:true };
        return true;
      }

      const local = _loadLocalState();
      const merged = _mergeByUpdatedAt(local, remote);
      _applyLocalState(merged);
      let migrated = false;

      // 자동 마이그레이션:
      // - 원격에 통합 파일이 없고(legacy만 존재)
      // - 관리자 + 토큰 + 동기화 enabled면
      //   legacy를 su_settings.json으로 자동 생성
      try{
        if (remoteInfo.mode === 'legacy' && !remoteInfo.hasNew && c.enabled && isAdmin() && c.token) {
          await _patchGistFile(c.gistId, c.token, FILE, JSON.stringify(merged, null, 2));
          migrated = true;
        }
      }catch(e){
        // 마이그레이션 실패는 pull 자체 실패로 취급하지 않음
        try{ localStorage.setItem(LS.lastError, '마이그레이션 실패: ' + e.message); }catch(_){}
      }

      try{ if (typeof updateFabVisibility === 'function') updateFabVisibility(); }catch(e){}
      _rememberRemoteUpdatedAt(remoteUpdatedAt);
      _markSync('pull', remoteInfo.mode, migrated);
      if (opts.returnInfo) return { ok:true, mode:remoteInfo.mode, migrated };
      return true;
    }catch(e){
      try{ localStorage.setItem(LS.lastError, e.message || String(e)); }catch(_){}
      _markSync('err', null, false);
      if (!opts.silent) throw e;
      return false;
    }
  }
  const pullOnSignal = createPullOnSignal ? createPullOnSignal({ pull }) : async function(){ return false; };

  async function push(section){
    // section: 'memo' | 'ui.fab' | 'ai' | 'prefs' | undefined(전체)
    if (!isAdmin()) throw new Error('관리자만 저장할 수 있습니다.');
    const c = cfg();
    if (!c.token) throw new Error('동기화를 위해 GitHub 토큰(gist 권한)이 필요합니다.');
    const id = await ensureGist();

    // 원격 현재값을 받아 병합 후 푸시(충돌 최소화)
    const local = _loadLocalState();
    if (section === 'memo') local.memo.updatedAt = new Date().toISOString();
    if (section === 'ui.fab') { local.ui.fab.updatedAt = new Date().toISOString(); }
    if (section === 'ai') { local.ai = local.ai || {}; local.ai.updatedAt = new Date().toISOString(); }
    if (section === 'prefs') {
      local.prefs = local.prefs || {};
      local.prefs.updatedAt = new Date().toISOString();
      try{ localStorage.setItem(LS.prefsUpdatedAt, String(local.prefs.updatedAt)); }catch(e){}
    }
    if (!section) {
      local.memo.updatedAt = local.memo.updatedAt || new Date().toISOString();
      local.ui.fab.updatedAt = local.ui.fab.updatedAt || new Date().toISOString();
      if (local.ai) local.ai.updatedAt = local.ai.updatedAt || new Date().toISOString();
      if (local.prefs) {
        local.prefs.updatedAt = local.prefs.updatedAt || new Date().toISOString();
        try{ localStorage.setItem(LS.prefsUpdatedAt, String(local.prefs.updatedAt)); }catch(e){}
      }
    }
    let remoteState = null;
    let mode = 'none';
    try{
      const remoteInfo = await _getRemoteStateWithMigrationDecision();
      remoteState = remoteInfo.state;
      mode = remoteInfo.mode || 'none';
    }catch(e){ remoteState = null; mode = 'none'; }
    const merged = _mergeByUpdatedAt(remoteState || {}, local);

    await _patchGistFile(id, c.token, FILE, JSON.stringify(merged, null, 2));
    _rememberRemoteUpdatedAt(new Date().toISOString());
    try{
      const sig = await _pushSettingsSignal({ section: section || 'all', updatedAt: Date.now() });
      _rememberSettingsSignal(sig);
    }catch(e){
      try{ localStorage.setItem(LS.lastError, '설정 변경 신호 전송 실패: ' + (e.message || e)); }catch(_){}
    }
    _markSync('push', mode, false);
    if (section && section.indexOf('.') !== -1) {
      // no-op
    }
    return true;
  }

  // (요청사항) 설정 변경 시 자동 원격 저장(디바운스)
  function _prefsAutoEnabled(){
    // 기본값 true: 명시적으로 '0'으로 꺼야만 비활성화
    try{
      const v = localStorage.getItem(LS.prefsAutoPush);
      return v === null ? true : v === '1';
    }catch(e){ return true; }
  }
  function setPrefsAutoPush(on){
    try{ localStorage.setItem(LS.prefsAutoPush, on ? '1' : '0'); }catch(e){}
  }
  function getPrefsAutoPush(){
    return _prefsAutoEnabled();
  }
  function markPrefsChanged(){
    try{ localStorage.setItem(LS.prefsUpdatedAt, new Date().toISOString()); }catch(e){}
    try{ maybeAutoPushPrefs(); }catch(e){}
  }
  function maybeAutoPushPrefs(){
    try{
      if(!window.SettingsStore) return;
      const c = cfg();
      if(!c.enabled) return;         // 동기화 OFF면 자동 저장 안 함
      if(!_prefsAutoEnabled()) return;
      if(!isAdmin()) return;
      if(!c.token) return;           // 토큰 없으면 자동 저장 불가
      clearTimeout(window._prefsAutoPushT);
      window._prefsAutoPushT = setTimeout(async ()=>{
        try{ await push('prefs'); }catch(e){}
      }, 1200);
    }catch(e){}
  }

  window.SettingsStore = {
    cfg, setCfg, isAdmin,
    ensureGist, pull, pullOnSignal, push,
    emitSignal: async function(section){
      try{
        const sig = await _pushSettingsSignal({ section: section || 'all', updatedAt: Date.now() });
        _rememberSettingsSignal(sig);
        return true;
      }catch(e){
        try{ localStorage.setItem(LS.lastError, '설정 변경 신호 전송 실패: ' + (e.message || e)); }catch(_){}
        return false;
      }
    },
    getSyncStatus,
    getMemo, setMemo,
    getFab, setFab,
    // ai
    getAiCfg, setAiCfg,
    // prefs
    markPrefsChanged,
    maybeAutoPushPrefs,
    setPrefsAutoPush,
    getPrefsAutoPush,
    _isSyncablePrefKey,
    FILE
  };
})();
