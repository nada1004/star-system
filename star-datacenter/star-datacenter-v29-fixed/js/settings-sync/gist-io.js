// settings-store 분리: gist 저장/읽기
(function(){
  if(window.__createSettingsStoreGist) return;

  window.__createSettingsStoreGist = function(ctx){
    const { FILE, LEGACY, LS, cfg, setCfg, isAdmin, _loadLocalState } = ctx;

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

    function _coerceIso(v){
      try{
        if(!v) return null;
        const t = new Date(v);
        if(isNaN(t.getTime())) return null;
        return t.toISOString();
      }catch(e){ return null; }
    }

    function _rememberRemoteUpdatedAt(iso){
      try{
        const normalized = _coerceIso(iso);
        if(normalized) localStorage.setItem(LS.lastRemoteUpdatedAt, normalized);
        return normalized;
      }catch(e){
        return null;
      }
    }

    async function ensureGist(){
      const c = cfg();
      if (c.gistId) return c.gistId;
      if (!isAdmin()) throw new Error('관리자만 Gist를 생성할 수 있습니다.');
      if (!c.token) throw new Error('동기화를 위해 GitHub 토큰(gist 권한)이 필요합니다.');
      const initState = _loadLocalState();
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

    async function _getRemoteStateWithMigrationDecision(){
      const gist = await _getGist();
      const remoteUpdatedAt = _coerceIso(gist && gist.updated_at) || null;
      if(!gist) return { state:null, mode:'none', gist:null, hasNew:false, hasLegacy:false, remoteUpdatedAt:null };

      const txtNew = await _readFileFromGist(gist, FILE);
      if (txtNew) {
        try{
          const st = JSON.parse(txtNew);
          return { state: st, mode:'new', gist, hasNew:true, hasLegacy:false, remoteUpdatedAt };
        }catch(e){}
      }

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
      if (!hasLegacy) return { state:null, mode:'none', gist, hasNew:false, hasLegacy:false, remoteUpdatedAt };

      const out = { memo: { last:'', updatedAt:null }, ui: { fab: { hideMobile:false, hidePC:false, updatedAt:null } } };
      if (memo) {
        out.memo.last = String(memo.last || '');
        out.memo.updatedAt = _coerceIso(memo.updatedAt) || null;
      }
      if (uiFab) {
        if (typeof uiFab.su_fabHideMobile !== 'undefined') out.ui.fab.hideMobile = String(uiFab.su_fabHideMobile) === '1';
        if (typeof uiFab.su_fabHidePC !== 'undefined') out.ui.fab.hidePC = String(uiFab.su_fabHidePC) === '1';
        out.ui.fab.updatedAt = _coerceIso(uiFab.updatedAt) || null;
      }
      const nowIso = new Date().toISOString();
      if (!out.memo.updatedAt) out.memo.updatedAt = nowIso;
      if (!out.ui.fab.updatedAt) out.ui.fab.updatedAt = nowIso;

      return { state: out, mode:'legacy', gist, hasNew:false, hasLegacy:true, remoteUpdatedAt };
    }

    async function _patchGistFile(gistId, token, filename, content){
      const payload = { files: { [filename]: { content } } };
      await _request('PATCH', `https://api.github.com/gists/${gistId}`, token, payload);
      return true;
    }

    return {
      _request,
      _coerceIso,
      _rememberRemoteUpdatedAt,
      ensureGist,
      _getGist,
      _readFileFromGist,
      _getRemoteStateWithMigrationDecision,
      _patchGistFile
    };
  };
})();
