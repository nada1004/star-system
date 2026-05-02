// settings-store 분리: 로컬 설정 병합/편의 API
(function(){
  if(window.__createSettingsStoreMerge) return;

  window.__createSettingsStoreMerge = function(ctx){
    const { LS } = ctx;

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
      return { memo, ui, ai };
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
      setFab
    };
  };
})();
