// settings-store 분리: 로컬 설정 병합/편의 API
(function(){
  if(window.__createSettingsStoreMerge) return;

  window.__createSettingsStoreMerge = function(ctx){
    const { LS } = ctx;

    // (동기화 대상) 로컬 설정 키 수집
    // - 목적: "기기별 설정(localStorage)"를 다른 기기에도 반영
    // - 보안: 토큰/비밀번호/키 등 민감값 및 대용량 데이터(경기 기록/캐시)는 제외
    function _isSyncablePrefKey(k){
      k = String(k||'');
      if(!k) return false;
      // 펨코스타일/선택 대학
      if(k === 'b2_femco_settings_v1') return true;
      if(k === 'cfg_femco_univ') return true;

      // 기본: su_ 설정 키
      if(!k.startsWith('su_')) return false;

      // 민감/보안
      if(k.includes('token') || k.includes('_pw') || k.endsWith('_pw') || k.includes('apiKey') || k.includes('api_key')) return false;
      if(k === 'su_gh_token' || k === 'su_fb_pw' || k === LS.token || k === LS.gistId || k === LS.enabled) return false;
      if(k === LS.aiCfg) return false; // AI 설정은 ai 섹션으로 별도 동기화

      // 동기화/상태/로그류
      if(k.startsWith('su_sync_')) return false;
      if(k === 'su_cfg_open' || k === 'su_cfg_menu_layout_v1') return true; // UX 성향이 강해 동기화 허용

      // 대용량 데이터(기록/캐시/스토어)
      const denyPrefix = [
        'su_mm','su_um','su_cm','su_ck','su_ptn','su_tn','su_ttm','su_indm','su_gjm',
        'su_hist_ext_','su_match_store_','su_match_store_meta_','su_hist_ext_meta_','su_sharecard_cache_'
      ];
      // su_pro 자체(프로리그 대용량 데이터)는 제외, su_profile_/su_procomp_ 등 설정키는 허용
      if(k === 'su_pro') return false;
      for(const p of denyPrefix){ if(k.startsWith(p)) return false; }

      return true;
    }
    function _collectPrefs(){
      const kv = {};
      try{
        for(let i=0;i<localStorage.length;i++){
          const k = localStorage.key(i);
          if(!_isSyncablePrefKey(k)) continue;
          const v = localStorage.getItem(k);
          // 너무 큰 값은 제외(안전)
          if(v && v.length > 120000) continue;
          kv[k] = v;
        }
      }catch(e){}
      return kv;
    }
    function _applyPrefs(kv){
      if(!kv || typeof kv !== 'object') return;
      try{
        Object.keys(kv).forEach(k=>{
          if(!_isSyncablePrefKey(k)) return;
          const v = kv[k];
          if(v === null || typeof v === 'undefined') return;
          try{ localStorage.setItem(k, String(v)); }catch(e){}
        });
      }catch(e){}
    }

    function _loadLocalState(){
      let memo = { last: '', updatedAt: null };
      try{
        const o = JSON.parse(localStorage.getItem(LS.memoObj) || '{}');
        memo.last = o.last || '';
        memo.updatedAt = o.updatedAt || null;
      }catch(e){}

      const ui = {
        fab: {
          hideMobile: localStorage.getItem(LS.fabHideMobile) === '1',
          hidePC: localStorage.getItem(LS.fabHidePC) === '1',
          updatedAt: null,
        }
      };

      let ai = { proxyUrl: '', apiKey: '', updatedAt: null };
      try{
        const a = JSON.parse(localStorage.getItem(LS.aiCfg) || '{}');
        ai.proxyUrl = String(a.proxyUrl || '');
        ai.apiKey = String(a.apiKey || '');
        ai.updatedAt = a.updatedAt || null;
      }catch(e){}
      const prefs = {
        kv: _collectPrefs(),
        updatedAt: localStorage.getItem(LS.prefsUpdatedAt) || null,
      };
      return { memo, ui, ai, prefs };
    }

    function _applyLocalState(state){
      if (!state || typeof state !== 'object') return;
      if (state.memo) {
        const memo = {
          last: String(state.memo.last || ''),
          updatedAt: state.memo.updatedAt || null,
        };
        try{ localStorage.setItem(LS.memoObj, JSON.stringify(memo)); }catch(e){}
      }
      try{
        const fab = state.ui && state.ui.fab ? state.ui.fab : null;
        if (fab) {
          localStorage.setItem(LS.fabHideMobile, fab.hideMobile ? '1' : '0');
          localStorage.setItem(LS.fabHidePC, fab.hidePC ? '1' : '0');
        }
      }catch(e){}

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

      try{
        if(state.prefs && typeof state.prefs === 'object'){
          _applyPrefs(state.prefs.kv || {});
          if(state.prefs.updatedAt){
            localStorage.setItem(LS.prefsUpdatedAt, String(state.prefs.updatedAt));
          }
        }
      }catch(e){}
    }

    function _mergeByUpdatedAt(localState, remoteState){
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

      const lPrefsT = new Date((localState && localState.prefs && localState.prefs.updatedAt) || 0).getTime();
      const rPrefsT = new Date((remoteState && remoteState.prefs && remoteState.prefs.updatedAt) || 0).getTime();
      if (rPrefsT >= lPrefsT && remoteState && remoteState.prefs) out.prefs = remoteState.prefs;
      return out;
    }

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

    return {
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
    };
  };
})();
