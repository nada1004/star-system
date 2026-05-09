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

      // design v2 설정 로드
      const design = {
        enabled: localStorage.getItem('su_design_v2') === '1',
        preset: localStorage.getItem('su_design_v2_preset') || 'base',
        bright: parseInt(localStorage.getItem('su_design_v2_bright') || '0', 10) || 0,
        dark: parseInt(localStorage.getItem('su_design_v2_dark') || '0', 10) || 0,
        colors: JSON.parse(localStorage.getItem('su_design_v2_colors') || '{}'),
        effects: JSON.parse(localStorage.getItem('su_design_v2_effects') || '{}'),
        updatedAt: null,
      };

      // tab color 설정 로드
      const tabColor = {
        enabled: localStorage.getItem('su_tab_color_enabled') !== '0',
        mode: localStorage.getItem('su_tab_color_mode') || 'fill',
        length: Math.max(20, Math.min(90, parseInt(localStorage.getItem('su_tab_color_length') || '48', 10) || 48)),
        tail: Math.max(0, Math.min(60, parseInt(localStorage.getItem('su_tab_color_tail') || '22', 10) || 22)),
        colors: JSON.parse(localStorage.getItem('su_tab_colors_v1') || '{}'),
        updatedAt: null,
      };

      // rec side fx 설정 로드
      const recCard = {
        enabled: localStorage.getItem('su_rec_side_fx_on') !== '0',
        mode: localStorage.getItem('su_rec_side_fx_mode') || 'soft',
        intensity: Math.max(0, Math.min(140, parseInt(localStorage.getItem('su_rec_side_fx_intensity') || '68', 10) || 68)),
        length: Math.max(4, Math.min(80, parseInt(localStorage.getItem('su_rec_side_fx_length') || '25', 10) || 25)),
        tail: Math.max(0, Math.min(140, parseInt(localStorage.getItem('su_rec_side_fx_tail') || '28', 10) || 28)),
        softness: Math.max(0, Math.min(100, parseInt(localStorage.getItem('su_rec_side_fx_softness') || '52', 10) || 52)),
        edge: Math.max(2, Math.min(24, parseInt(localStorage.getItem('su_rec_side_fx_edge') || '8', 10) || 8)),
        updatedAt: null,
      };

      return { memo, ui, ai, design, tabColor, recCard };
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

      // design v2 설정 적용
      if(state.design && typeof state.design === 'object'){
        try{
          localStorage.setItem('su_design_v2', state.design.enabled ? '1' : '0');
          localStorage.setItem('su_design_v2_preset', String(state.design.preset || 'base'));
          localStorage.setItem('su_design_v2_bright', String(state.design.bright || 0));
          localStorage.setItem('su_design_v2_dark', String(state.design.dark || 0));
          if(state.design.colors) localStorage.setItem('su_design_v2_colors', JSON.stringify(state.design.colors));
          if(state.design.effects) localStorage.setItem('su_design_v2_effects', JSON.stringify(state.design.effects));
          if(typeof window.applyDesignV2 === 'function') window.applyDesignV2();
        }catch(e){}
      }

      // tab color 설정 적용
      if(state.tabColor && typeof state.tabColor === 'object'){
        try{
          localStorage.setItem('su_tab_color_enabled', state.tabColor.enabled ? '1' : '0');
          localStorage.setItem('su_tab_color_mode', String(state.tabColor.mode || 'fill'));
          localStorage.setItem('su_tab_color_length', String(state.tabColor.length || 48));
          localStorage.setItem('su_tab_color_tail', String(state.tabColor.tail || 22));
          if(state.tabColor.colors) localStorage.setItem('su_tab_colors_v1', JSON.stringify(state.tabColor.colors));
          if(typeof window.applyTabColor === 'function') window.applyTabColor();
        }catch(e){}
      }

      // rec card 설정 적용
      if(state.recCard && typeof state.recCard === 'object'){
        try{
          localStorage.setItem('su_rec_side_fx_on', state.recCard.enabled ? '1' : '0');
          localStorage.setItem('su_rec_side_fx_mode', String(state.recCard.mode || 'soft'));
          localStorage.setItem('su_rec_side_fx_intensity', String(state.recCard.intensity || 68));
          localStorage.setItem('su_rec_side_fx_length', String(state.recCard.length || 25));
          localStorage.setItem('su_rec_side_fx_tail', String(state.recCard.tail || 28));
          localStorage.setItem('su_rec_side_fx_softness', String(state.recCard.softness || 52));
          localStorage.setItem('su_rec_side_fx_edge', String(state.recCard.edge || 8));
          if(typeof window.applyRecSideFx === 'function') window.applyRecSideFx();
        }catch(e){}
      }
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

      // design 설정 병합
      const lDesignT = new Date((localState && localState.design && localState.design.updatedAt) || 0).getTime();
      const rDesignT = new Date((remoteState && remoteState.design && remoteState.design.updatedAt) || 0).getTime();
      if (rDesignT >= lDesignT && remoteState && remoteState.design) out.design = remoteState.design;

      // tab color 설정 병합
      const lTabColorT = new Date((localState && localState.tabColor && localState.tabColor.updatedAt) || 0).getTime();
      const rTabColorT = new Date((remoteState && remoteState.tabColor && remoteState.tabColor.updatedAt) || 0).getTime();
      if (rTabColorT >= lTabColorT && remoteState && remoteState.tabColor) out.tabColor = remoteState.tabColor;

      // rec card 설정 병합
      const lRecCardT = new Date((localState && localState.recCard && localState.recCard.updatedAt) || 0).getTime();
      const rRecCardT = new Date((remoteState && remoteState.recCard && remoteState.recCard.updatedAt) || 0).getTime();
      if (rRecCardT >= lRecCardT && remoteState && remoteState.recCard) out.recCard = remoteState.recCard;

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
