// settings-store 분리: 설정 변경 신호
(function(){
  if(window.__createSettingsStoreSignal) return;

  window.__createSettingsStoreSignal = function(ctx){
    const { LS, SETTINGS_SIGNAL_DB_URL, SETTINGS_SIGNAL_PATH, SETTINGS_SIGNAL_DEFAULT_PW, cfg } = ctx;

    function _settingsSignalUrl(){
      return `${SETTINGS_SIGNAL_DB_URL}/${SETTINGS_SIGNAL_PATH}.json`;
    }
    function _settingsSignalTs(sig){
      return Number(sig && (sig.updatedAt || sig.savedAt || sig.version) || 0) || 0;
    }
    function _rememberSettingsSignal(sig){
      const ts = _settingsSignalTs(sig);
      if(!ts) return 0;
      try{ localStorage.setItem(LS.lastSignalSeenAt, String(ts)); }catch(e){}
      return ts;
    }
    async function _fetchSettingsSignal(){
      const res = await fetch(_settingsSignalUrl() + '?_=' + Date.now(), { cache:'no-store', mode:'cors' });
      if(!res.ok) throw new Error('settings signal HTTP ' + res.status);
      return await res.json();
    }
    async function _pushSettingsSignal(meta){
      const ts = Number(meta && meta.updatedAt || Date.now()) || Date.now();
      const payload = {
        admin_pw: localStorage.getItem('su_fb_pw') || SETTINGS_SIGNAL_DEFAULT_PW,
        source: 'settings-gist',
        gistId: cfg().gistId || '',
        section: String(meta && meta.section || 'all'),
        updatedAt: ts,
        savedAt: ts,
        version: ts
      };
      const res = await fetch(_settingsSignalUrl(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error('settings signal write failed: ' + res.status);
      try{ localStorage.setItem(LS.lastSignalPushedAt, String(ts)); }catch(e){}
      return payload;
    }

    function createPullOnSignal(deps){
      const { pull } = deps;
      return async function pullOnSignal(opts){
        opts = opts || {};
        const c = cfg();
        if (!c.gistId) return false;
        try{
          const sig = await _fetchSettingsSignal();
          const sigTs = _settingsSignalTs(sig);
          const lastSeen = Number(localStorage.getItem(LS.lastSignalSeenAt) || 0) || 0;
          if(!sigTs) {
            if(opts.returnInfo) return { ok:true, skipped:true, reason:'no-signal' };
            return false;
          }
          if(!opts.force && sigTs <= lastSeen){
            if(opts.returnInfo) return { ok:true, skipped:true, reason:'unchanged-signal' };
            return false;
          }
          const info = await pull({ ...opts, force:true, returnInfo:true });
          _rememberSettingsSignal(sig);
          if(opts.returnInfo) return { ...(info||{ok:true}), signalAt:sigTs };
          return !!(info && info.ok);
        }catch(e){
          try{ localStorage.setItem(LS.lastError, e.message || String(e)); }catch(_){}
          if (!opts.silent) throw e;
          return false;
        }
      };
    }

    return {
      _settingsSignalUrl,
      _settingsSignalTs,
      _rememberSettingsSignal,
      _fetchSettingsSignal,
      _pushSettingsSignal,
      createPullOnSignal
    };
  };
})();
