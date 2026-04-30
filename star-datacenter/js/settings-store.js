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

    // AI(프록시/API키) 설정
    aiCfg: 'su_ai_cfg',
  };

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

  async function _request(method, url, token, body){
    const opt = { method, headers: { 'Accept': 'application/vnd.github+json' } };
    if (token) opt.headers['Authorization'] = 'token ' + token;
    if (body) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    const res = await fetch(url, opt);
    const txt = await res.text();
    let json = null;
    try{ json = txt ? JSON.parse(txt) : null; }catch(e){}
    if (!res.ok) {
      const msg = (json && (json.message||json.error)) ? (json.message||json.error) : (txt || ('HTTP '+res.status));
      throw new Error(msg);
    }
    return json;
  }

  // ── 상태 직렬화/역직렬화 ──
  function _loadLocalState(){
    // memo (기존 al_memo 객체 우선)
    let memo = { last: '', updatedAt: null };
    try{
      const o = JSON.parse(localStorage.getItem(LS.memoObj) || '{}');
      memo.last = o.last || '';
      memo.updatedAt = o.updatedAt || null;
    }catch(e){}

    // ui.fab
    const ui = {
      fab: {
        hideMobile: localStorage.getItem(LS.fabHideMobile) === '1',
        hidePC: localStorage.getItem(LS.fabHidePC) === '1',
        updatedAt: null,
      }
    };
    // ai (proxy url, apiKey)
    let ai = { proxyUrl: '', apiKey: '', updatedAt: null };
    try{
      const a = JSON.parse(localStorage.getItem(LS.aiCfg) || '{}');
      ai.proxyUrl = String(a.proxyUrl || '');
      ai.apiKey = String(a.apiKey || '');
      ai.updatedAt = a.updatedAt || null;
    }catch(e){}
    return { memo, ui, ai };
  }

  function _applyLocalState(state){
    if (!state || typeof state !== 'object') return;
    // memo
    if (state.memo) {
      const memo = {
        last: String(state.memo.last || ''),
        updatedAt: state.memo.updatedAt || null,
      };
      try{ localStorage.setItem(LS.memoObj, JSON.stringify(memo)); }catch(e){}
    }
    // ui.fab
    try{
      const fab = state.ui && state.ui.fab ? state.ui.fab : null;
      if (fab) {
        localStorage.setItem(LS.fabHideMobile, fab.hideMobile ? '1' : '0');
        localStorage.setItem(LS.fabHidePC, fab.hidePC ? '1' : '0');
      }
    }catch(e){}

    // ai
    try{
      if(state.ai && typeof state.ai === 'object'){
        const ai = {
          proxyUrl: String(state.ai.proxyUrl || ''),
          apiKey: String(state.ai.apiKey || ''),
          updatedAt: state.ai.updatedAt || null,
        };
        localStorage.setItem(LS.aiCfg, JSON.stringify(ai));
      }
    }catch(e){}
  }

  function _mergeByUpdatedAt(localState, remoteState){
    // 섹션별 updatedAt 비교로 병합
    const out = JSON.parse(JSON.stringify(localState || {}));
    const lMemoT = new Date((localState && localState.memo && localState.memo.updatedAt) || 0).getTime();
    const rMemoT = new Date((remoteState && remoteState.memo && remoteState.memo.updatedAt) || 0).getTime();
    if (rMemoT >= lMemoT && remoteState && remoteState.memo) out.memo = remoteState.memo;

    const lFabT = new Date((localState && localState.ui && localState.ui.fab && localState.ui.fab.updatedAt) || 0).getTime();
    const rFabT = new Date((remoteState && remoteState.ui && remoteState.ui.fab && remoteState.ui.fab.updatedAt) || 0).getTime();
    if (rFabT >= lFabT && remoteState && remoteState.ui && remoteState.ui.fab) {
      out.ui = out.ui || {};
      out.ui.fab = remoteState.ui.fab;
    }

    const lAiT = new Date((localState && localState.ai && localState.ai.updatedAt) || 0).getTime();
    const rAiT = new Date((remoteState && remoteState.ai && remoteState.ai.updatedAt) || 0).getTime();
    if (rAiT >= lAiT && remoteState && remoteState.ai) out.ai = remoteState.ai;
    return out;
  }

  // ── AI 설정 API ────────────────────────────────────────────────
  function getAiCfg(){
    try{
      const a = JSON.parse(localStorage.getItem(LS.aiCfg) || '{}');
      return { proxyUrl: String(a.proxyUrl || ''), apiKey: String(a.apiKey || ''), updatedAt: a.updatedAt || null };
    }catch(e){
      return { proxyUrl:'', apiKey:'', updatedAt:null };
    }
  }
  function setAiCfg(p){
    const cur = getAiCfg();
    const next = {
      proxyUrl: ('proxyUrl' in p) ? String(p.proxyUrl||'') : cur.proxyUrl,
      apiKey: ('apiKey' in p) ? String(p.apiKey||'') : cur.apiKey,
      updatedAt: new Date().toISOString(),
    };
    try{ localStorage.setItem(LS.aiCfg, JSON.stringify(next)); }catch(e){}
    return next;
  }

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

  // ── Gist 파일 IO ──
  async function ensureGist(){
    const c = cfg();
    if (c.gistId) return c.gistId;
    if (!isAdmin()) throw new Error('관리자만 Gist를 생성할 수 있습니다.');
    if (!c.token) throw new Error('동기화를 위해 GitHub 토큰(gist 권한)이 필요합니다.');
    // public gist: 읽기는 누구나 가능하게(다른 기기 반영)
    const initState = _loadLocalState();
    // 최초 생성 시에도 updatedAt 채우기
    if (!initState.memo.updatedAt) initState.memo.updatedAt = new Date().toISOString();
    if (!initState.ui.fab.updatedAt) initState.ui.fab.updatedAt = new Date().toISOString();
    const payload = {
      description: 'Star Datacenter settings sync',
      public: true,
      files: {
        [FILE]: { content: JSON.stringify(initState, null, 2) }
      }
    };
    const created = await _request('POST', 'https://api.github.com/gists', c.token, payload);
    const id = created && created.id ? String(created.id) : '';
    if (!id) throw new Error('Gist 생성에 실패했습니다.');
    setCfg({ gistId: id });
    return id;
  }

  async function _getGist(){
    const c = cfg();
    if (!c.gistId) return null;
    return await _request('GET', `https://api.github.com/gists/${c.gistId}`, c.token || null);
  }

  async function _readFileFromGist(gist, filename){
    if(!gist || !gist.files) return null;
    const f = gist.files[filename];
    if(!f) return null;
    let content = f.content;
    if ((!content || f.truncated) && f.raw_url) {
      const r = await fetch(f.raw_url);
      content = await r.text();
    }
    return content || null;
  }

  function _coerceIso(v){
    try{
      if(!v) return null;
      const t = new Date(v);
      if(isNaN(t.getTime())) return null;
      return t.toISOString();
    }catch(e){ return null; }
  }

  async function _getRemoteStateWithMigrationDecision(){
    const gist = await _getGist();
    if(!gist) return { state:null, mode:'none', gist:null, hasNew:false, hasLegacy:false };

    // 1) new 통합 파일 우선
    const txtNew = await _readFileFromGist(gist, FILE);
    if (txtNew) {
      try{
        const st = JSON.parse(txtNew);
        return { state: st, mode:'new', gist, hasNew:true, hasLegacy:false };
      }catch(e){
        // 파싱 실패면 legacy fallback
      }
    }

    // 2) legacy 파일들로부터 조립
    let hasLegacy = false;
    let memo = null, uiFab = null;
    const txtMemo = await _readFileFromGist(gist, LEGACY.memo);
    if (txtMemo) {
      hasLegacy = true;
      try{ memo = JSON.parse(txtMemo); }catch(e){ memo = null; }
    }
    const txtFab = await _readFileFromGist(gist, LEGACY.fab);
    if (txtFab) {
      hasLegacy = true;
      try{ uiFab = JSON.parse(txtFab); }catch(e){ uiFab = null; }
    }
    if (!hasLegacy) return { state:null, mode:'none', gist, hasNew:false, hasLegacy:false };

    const out = { memo: { last:'', updatedAt:null }, ui: { fab: { hideMobile:false, hidePC:false, updatedAt:null } } };
    if (memo) {
      out.memo.last = String(memo.last || '');
      out.memo.updatedAt = _coerceIso(memo.updatedAt) || null;
    }
    if (uiFab) {
      // 기존 su_ui_settings.json 포맷: {su_fabHideMobile:'0'|'1', su_fabHidePC:'0'|'1', updatedAt:...}
      if (typeof uiFab.su_fabHideMobile !== 'undefined') out.ui.fab.hideMobile = String(uiFab.su_fabHideMobile) === '1';
      if (typeof uiFab.su_fabHidePC !== 'undefined') out.ui.fab.hidePC = String(uiFab.su_fabHidePC) === '1';
      out.ui.fab.updatedAt = _coerceIso(uiFab.updatedAt) || null;
    }
    // legacy에 timestamp가 없으면 현재로 채움(병합 비교가 가능하도록)
    const nowIso = new Date().toISOString();
    if (!out.memo.updatedAt) out.memo.updatedAt = nowIso;
    if (!out.ui.fab.updatedAt) out.ui.fab.updatedAt = nowIso;

    return { state: out, mode:'legacy', gist, hasNew:false, hasLegacy:true };
  }

  async function _patchGistFile(gistId, token, filename, content){
    const payload = { files: { [filename]: { content } } };
    await _request('PATCH', `https://api.github.com/gists/${gistId}`, token, payload);
    return true;
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

  async function push(section){
    // section: 'memo' | 'ui.fab' | undefined(전체)
    if (!isAdmin()) throw new Error('관리자만 저장할 수 있습니다.');
    const c = cfg();
    if (!c.token) throw new Error('동기화를 위해 GitHub 토큰(gist 권한)이 필요합니다.');
    const id = await ensureGist();

    // 원격 현재값을 받아 병합 후 푸시(충돌 최소화)
    const local = _loadLocalState();
    if (section === 'memo') local.memo.updatedAt = new Date().toISOString();
    if (section === 'ui.fab') { local.ui.fab.updatedAt = new Date().toISOString(); }
    if (section === 'ai') { local.ai = local.ai || {}; local.ai.updatedAt = new Date().toISOString(); }
    if (!section) {
      local.memo.updatedAt = local.memo.updatedAt || new Date().toISOString();
      local.ui.fab.updatedAt = local.ui.fab.updatedAt || new Date().toISOString();
      if (local.ai) local.ai.updatedAt = local.ai.updatedAt || new Date().toISOString();
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
    _markSync('push', mode, false);
    if (section && section.indexOf('.') !== -1) {
      // no-op
    }
    return true;
  }

  // ── 편의 API ──
  function getMemo(){
    try{
      const o = JSON.parse(localStorage.getItem(LS.memoObj) || '{}');
      return { last: o.last || '', updatedAt: o.updatedAt || null };
    }catch(e){ return { last:'', updatedAt:null }; }
  }
  function setMemo(text){
    const memo = { last: String(text || ''), updatedAt: new Date().toISOString() };
    try{ localStorage.setItem(LS.memoObj, JSON.stringify(memo)); }catch(e){}
    return memo;
  }
  function getFab(){
    return {
      hideMobile: localStorage.getItem(LS.fabHideMobile) === '1',
      hidePC: localStorage.getItem(LS.fabHidePC) === '1',
    };
  }
  function setFab(hideMobile, hidePC){
    localStorage.setItem(LS.fabHideMobile, hideMobile ? '1' : '0');
    localStorage.setItem(LS.fabHidePC, hidePC ? '1' : '0');
    try{ if (typeof updateFabVisibility === 'function') updateFabVisibility(); }catch(e){}
  }

  window.SettingsStore = {
    cfg, setCfg, isAdmin,
    ensureGist, pull, push,
    getSyncStatus,
    getMemo, setMemo,
    getFab, setFab,
    // ai
    getAiCfg, setAiCfg,
    FILE
  };
})();
