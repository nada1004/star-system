/* ══════════════════════════════════════════════════════════════
   설정 - 코어 유틸 (esc, 섹션 접힘 헬퍼) (settings-base.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════
   ⚙️ settings.js — 설정 탭 전용
   tier-tour.js에서 분리됨. 이 파일의 버그가 티어대회 탭에 영향을 주지 않습니다.
══════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// HTML escape (설정 화면 템플릿 문자열 안전 처리)
// window.escHTML은 constants.js에서 전역 단일 정의됨
// ─────────────────────────────────────────────────────────────
function esc(s){ return window.escHTML(s); }

try{
  if(!window._cfgB2LogoOverlayKey) window._cfgB2LogoOverlayKey = 'su_b2_univ_logo_overlay_v1';
  window._cfgB2LogoOverlayDefault = function(){
    return { wmGlobalOn: 1, wmOn: 1, wmScale: 150, wmRight: 120, wmBottom: 30, bgScale: 100 };
  };
  window._cfgB2LogoOverlayReadAll = function(){
    const def = window._cfgB2LogoOverlayDefault();
    try{
      const raw = String(localStorage.getItem(window._cfgB2LogoOverlayKey) || '').trim();
      const parsed = raw ? (JSON.parse(raw) || {}) : {};
      const root = (parsed && typeof parsed === 'object') ? parsed : {};
      const d = (root.default && typeof root.default === 'object') ? root.default : {};
      const per = (root.perUniv && typeof root.perUniv === 'object') ? root.perUniv : {};
      root.default = Object.assign({}, def, d);
      root.perUniv = per;
      return root;
    }catch(e){
      return { default: def, perUniv: {} };
    }
  };
  window._cfgB2LogoOverlayGet = function(univName){
    const root = window._cfgB2LogoOverlayReadAll();
    const def = (root.default && typeof root.default === 'object') ? root.default : window._cfgB2LogoOverlayDefault();
    const u = String(univName||'').trim();
    const over = (u && root.perUniv && root.perUniv[u] && typeof root.perUniv[u] === 'object') ? root.perUniv[u] : {};
    return Object.assign({}, def, over);
  };
  window._cfgB2LogoOverlaySave = function(root){
    try{ localStorage.setItem(window._cfgB2LogoOverlayKey, JSON.stringify(root || {})); }catch(e){}
  };
  window._cfgB2LogoOverlaySet = function(univName, key, value){
    const u = String(univName||'').trim();
    const root = window._cfgB2LogoOverlayReadAll();
    if(!key) return;
    const vNum = (value===''||value==null) ? null : Number(value);
    const v = (vNum==null || isNaN(vNum)) ? null : vNum;
    const clamp = (k, n)=>{
      if(k === 'wmGlobalOn') return n ? 1 : 0;
      if(k === 'wmOn') return n ? 1 : 0;
      if(k === 'wmScale') return Math.max(50, Math.min(250, n));
      if(k === 'wmRight') return Math.max(0, Math.min(260, n));
      if(k === 'wmBottom') return Math.max(0, Math.min(160, n));
      if(k === 'bgScale') return Math.max(60, Math.min(120, n));
      return n;
    };
    if(!u || u === '__ALL__'){
      root.default = root.default || window._cfgB2LogoOverlayDefault();
      if(v == null) delete root.default[key];
      else root.default[key] = clamp(key, v);
      window._cfgB2LogoOverlaySave(root);
      return;
    }
    if(key === 'wmGlobalOn'){
      return;
    }
    root.perUniv = root.perUniv || {};
    root.perUniv[u] = (root.perUniv[u] && typeof root.perUniv[u] === 'object') ? root.perUniv[u] : {};
    if(v == null) delete root.perUniv[u][key];
    else root.perUniv[u][key] = clamp(key, v);
    if(!Object.keys(root.perUniv[u]).length) delete root.perUniv[u];
    window._cfgB2LogoOverlaySave(root);
  };
  window._cfgB2LogoOverlayReset = function(univName){
    const u = String(univName||'').trim();
    const root = window._cfgB2LogoOverlayReadAll();
    if(!u || u === '__ALL__'){
      try{ localStorage.removeItem(window._cfgB2LogoOverlayKey); }catch(e){}
      return;
    }
    if(root.perUniv && root.perUniv[u]) delete root.perUniv[u];
    window._cfgB2LogoOverlaySave(root);
  };
  window._cfgSoftRefreshBoard2 = function(){
    try{
      if(typeof window.curTab !== 'undefined' && window.curTab === 'board2' && typeof window.rBoard2 === 'function'){
        const C=document.getElementById('rcont');
        const T=document.getElementById('rtitle');
        if(C && T) window.rBoard2(C,T);
      }
    }catch(e){}
  };
  window._cfgSoftRefreshLive = function(){
    try{
      if(typeof window.curTab !== 'undefined' && window.curTab === 'cfg') return;
      if(typeof window.render === 'function') window.render(true);
      else if(typeof window.renderNow === 'function') window.renderNow();
    }catch(e){}
  };
  // [FIX-UX-1] 설정탭 <details class="cfg-grp"> 펼침/접힘 상태를 세션 동안 기억.
  // 설정탭 전체가 다시 그려질 때(다른 슬라이더 조작 등으로 render()가 호출될 때)마다
  // 사용자가 펼쳐 둔 패널이 매번 접혀버리던 문제를 근본적으로 줄여줍니다.
  window._cfgGrpOpenKeys = window._cfgGrpOpenKeys || new Set();
  window._cfgSyncGrpOpenState = function(){
    try{
      document.querySelectorAll('#rcont details.cfg-grp').forEach(function(d){
        const summaryEl = d.querySelector('summary');
        const key = summaryEl ? summaryEl.textContent.trim() : '';
        if(!key) return;
        if(window._cfgGrpOpenKeys.has(key) && !d.open) d.open = true;
        d.addEventListener('toggle', function(){
          if(d.open) window._cfgGrpOpenKeys.add(key);
          else window._cfgGrpOpenKeys.delete(key);
        });
      });
    }catch(e){}
  };
  window.cfgGetB2UnivProfileView = function(){
    try{
      const raw = String(localStorage.getItem('su_b2_univ_profile_view') || '').trim();
      if(raw === 'card') return 'poster';
      if(raw === 'compact' || raw === 'media') return 'default';
      return ['default','poster','heat','split','board'].includes(raw) ? raw : 'default';
    }catch(e){
      return 'default';
    }
  };
  window.cfgSetB2UnivProfileView = function(mode){
    const next = ['default','poster','heat','split','board'].includes(String(mode||'')) ? String(mode) : 'default';
    try{ localStorage.setItem('su_b2_univ_profile_view', next); }catch(e){}
    try{ window._cfgSoftRefreshBoard2 && window._cfgSoftRefreshBoard2(); }catch(e){}
    try{ if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync(); }catch(e){}
  };
  window._cfgB2LogoOverlayUiSync = function(){
    try{
      const selEl = document.getElementById('cfg-b2-wm-univ');
      const sel = selEl ? (selEl.value || '__ALL__') : '__ALL__';
      const cfg = (typeof window._cfgB2LogoOverlayGet==='function') ? window._cfgB2LogoOverlayGet(sel) : window._cfgB2LogoOverlayDefault();
      const setV=(id,v)=>{ const el=document.getElementById(id); if(el) el.value=String(v); };
      const setT=(id,t)=>{ const el=document.getElementById(id); if(el) el.textContent=String(t); };
      const setC=(id,on)=>{ const el=document.getElementById(id); if(el) el.checked=!!on; };
      const gOn = (cfg.wmGlobalOn==null) ? 1 : !!Number(cfg.wmGlobalOn);
      const wmOn = (cfg.wmOn==null) ? 1 : !!Number(cfg.wmOn);
      const wmScale = parseInt(cfg.wmScale||150,10);
      const wmRight = parseInt(cfg.wmRight||120,10);
      const wmBottom = parseInt(cfg.wmBottom||30,10);
      const bgScale = parseInt(cfg.bgScale||100,10);
      setC('cfg-b2-wm-global-on', gOn);
      setC('cfg-b2-wm-on', wmOn);
      setV('cfg-b2-wm-scale', wmScale);
      setV('cfg-b2-wm-right', wmRight);
      setV('cfg-b2-wm-bottom', wmBottom);
      setV('cfg-b2-bg-scale', bgScale);
      setT('cfg-b2-wm-scale-val', wmScale+'% (x'+(wmScale/100).toFixed(2)+')');
      setT('cfg-b2-wm-right-val', wmRight+'px');
      setT('cfg-b2-wm-bottom-val', wmBottom+'px');
      setT('cfg-b2-bg-scale-val', bgScale+'%');
    }catch(e){}
  };
}catch(e){}

/* ══════════════════════════════════════
   🎨 디자인 모드 분리
   - 구현은 `js/settings/design.js`로 이동
══════════════════════════════════════ */

/* ══════════════════════════════════════
   ⚙️ 설정 섹션 접힘 상태 영속 헬퍼
══════════════════════════════════════ */
// ⚠️ tier-tour.js에도 _cfgOpen/_cfgToggle/_cfgD가 존재해서 전역이 덮어써지는 문제가 있음.
// settings.js는 고유 접두사(_scfg*)를 사용해 충돌을 원천 차단한다.
function _scfgOpen(id){try{return !!(JSON.parse(localStorage.getItem('su_cfg_open')||'{}')[id]);}catch(e){return false;}}
