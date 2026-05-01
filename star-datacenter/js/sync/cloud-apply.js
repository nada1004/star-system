/* ══════════════════════════════════════
   Firebase/GitHub 수신 데이터 적용
══════════════════════════════════════ */

// 클라우드 데이터를 전역 변수에 반영 (cloudLoad + onFirebaseLoad 공통)
// 🔧 Firebase 배열→객체 변환 대응 헬퍼
// Firebase Realtime DB는 배열을 {0:...,1:...,2:...} 객체로 저장할 수 있음
// 수신 시 객체면 배열로 변환, null 슬롯 제거
function _fbArr(val, fallback) {
  if(!val) return fallback||[];
  if(Array.isArray(val)) return val;
  if(typeof val === 'object') {
    return Object.keys(val)
      .sort((a,b)=>Number(a)-Number(b))
      .map(k=>val[k])
      .filter(v=>v!=null);
  }
  return fallback||[];
}

function _decompressCloudData(d) {
  if (d && typeof d._lz === 'string') {
    try {
      const json = LZString.decompressFromBase64(d._lz);
      return JSON.parse(json);
    } catch(e) { console.warn('[_decompressCloudData] 압축 해제 실패:', e); }
  }
  return d;
}

function _applyCloudData(d) {
  d = _decompressCloudData(d);
  try{ window._applyingCloudData = true; }catch(e){}
  const _has = (key) => d[key] !== undefined && d[key] !== null;
  const _hasOrEmpty = (key) => d.savedAt !== undefined;

  {
    const v = d.players||d.player;
    if(v !== undefined) {
      players=_fbArr(v, []);
      players.forEach(p=>{ if(p.history) p.history=_fbArr(p.history, []); });
      try{
        const pm = d.playerPhotos || d.pPhotoMap || d.playerPhotoMap || null;
        if(pm){
          players.forEach(p=>{ if(p && p.name && !p.photo && pm[p.name]) p.photo = pm[p.name]; });
        }
      }catch(e){}
    }
  }
  if(_has('univCfg')||_has('univConfig')||_has('universities')) univCfg=_fbArr(d.univCfg||d.univConfig||d.universities, univCfg);
  if(_has('maps')) maps=_fbArr(d.maps||d.map, maps);
  if(_has('tourD')) tourD=_fbArr(d.tourD||d.tournamentDates, Array(15).fill(''));

  {
    const v = d.miniM||d.mini||d.miniMatches;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('miniM') ? [] : null);
    if(arr !== null){ miniM=arr; miniM.forEach(m=>{ if(m.sets)m.sets=_fbArr(m.sets,[]); m.sets&&m.sets.forEach(s=>{if(s.games)s.games=_fbArr(s.games,[]);}); }); }
  }
  {
    const v = d.univM||d.univ||d.univMatches;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('univM') ? [] : null);
    if(arr !== null){ univM=arr; univM.forEach(m=>{if(m.sets)m.sets=_fbArr(m.sets,[]);m.sets&&m.sets.forEach(s=>{if(s.games)s.games=_fbArr(s.games,[]);});}); }
  }
  {
    const v = d.comps||d.comp||d.competitions;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('comps') ? [] : null);
    if(arr !== null) comps=arr;
  }
  {
    const v = d.ckM||d.ck||d.ckMatches;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('ckM') ? [] : null);
    if(arr !== null){ ckM=arr; ckM.forEach(m=>{if(m.sets)m.sets=_fbArr(m.sets,[]);if(m.teamAMembers)m.teamAMembers=_fbArr(m.teamAMembers,[]);if(m.teamBMembers)m.teamBMembers=_fbArr(m.teamBMembers,[]);m.sets&&m.sets.forEach(s=>{if(s.games)s.games=_fbArr(s.games,[]);});}); }
  }
  if(_has('compNames')) compNames=_fbArr(d.compNames||d.competitionNames, []);
  if(_has('curComp')||d.savedAt) curComp=d.curComp||d.currentComp||'';
  {
    const v = d.proM||d.pro||d.proMatches;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('proM') ? [] : null);
    if(arr !== null){ proM=arr; proM.forEach(m=>{if(m.sets)m.sets=_fbArr(m.sets,[]);if(m.teamAMembers)m.teamAMembers=_fbArr(m.teamAMembers,[]);if(m.teamBMembers)m.teamBMembers=_fbArr(m.teamBMembers,[]);m.sets&&m.sets.forEach(s=>{if(s.games)s.games=_fbArr(s.games,[]);});}); }
  }
  {
    const v = d.proTourneys;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('proTourneys') ? [] : null);
    if(arr !== null) proTourneys=arr;
  }
  {
    const v = d.tourneys||d.tournaments||d.tourney;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('tourneys') ? [] : null);
    if(arr !== null){
      tourneys=arr;
      tourneys.forEach(tn=>{
        tn.groups=_fbArr(tn.groups,[]);
        tn.groups.forEach(g=>{
          g.univs=_fbArr(g.univs,[]);
          g.matches=_fbArr(g.matches,[]);
          g.matches.forEach(m=>{m.sets=_fbArr(m.sets,[]);});
        });
      });
    }
  }
  {
  }
  {
    const v = d.ttM||d.tiertour||d.tierTourM;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('ttM') ? [] : null);
    if(arr !== null){
      ttM = arr;
      try{
        (ttM||[]).forEach(m=>{
          if(m.sets) m.sets=_fbArr(m.sets,[]);
          (m.sets||[]).forEach(s=>{ if(s.games) s.games=_fbArr(s.games,[]); });
        });
      }catch(e){}
      try{ if(typeof _ttMigrated!=='undefined') _ttMigrated=false; }catch(e){}
    }
  }
  {
    const v = d.indM||d.ind;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('indM') ? [] : null);
    if(arr !== null) indM=arr;
  }
  {
    const v = d.gjM;
    const arr = v ? _fbArr(v,[]) : (_hasOrEmpty('gjM') ? [] : null);
    if(arr !== null) gjM=arr;
  }
  if(d.tiers&&d.tiers.length&&typeof TIERS!=='undefined'){TIERS.splice(0,TIERS.length,...d.tiers);}
  if(d.boardPlayerOrder!==undefined&&typeof boardPlayerOrder!=='undefined'){
    Object.keys(boardPlayerOrder).forEach(k=>delete boardPlayerOrder[k]);
    Object.assign(boardPlayerOrder, d.boardPlayerOrder||{});
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }
  if(d.boardOrder!==undefined&&typeof boardOrder!=='undefined') boardOrder=d.boardOrder;
  if(d.userMapAlias!==undefined&&typeof userMapAlias!=='undefined') userMapAlias=d.userMapAlias;
  if(d.playerStatusIcons!==undefined&&typeof playerStatusIcons!=='undefined'){
    Object.keys(playerStatusIcons).forEach(k=>delete playerStatusIcons[k]);
    Object.assign(playerStatusIcons, d.playerStatusIcons||{});
    localStorage.setItem('su_psi', JSON.stringify(playerStatusIcons));
  }
  if(d.notices!==undefined&&typeof notices!=='undefined') notices=d.notices;
  if(d.seasons!==undefined&&typeof seasons!=='undefined') seasons=_fbArr(d.seasons,[]);
  if(d.calScheduled!==undefined&&typeof calScheduled!=='undefined'){
    calScheduled=_fbArr(d.calScheduled,[]);
    window._calScheduled=calScheduled;
  }
  if(d.voteAgg!==undefined&&typeof voteData!=='undefined'){
    const myVotes={};
    Object.entries(voteData||{}).forEach(([k,v])=>{ if(k.endsWith('_my')) myVotes[k]=v; });
    Object.keys(voteData).forEach(k=>delete voteData[k]);
    Object.assign(voteData, d.voteAgg||{}, myVotes);
    localStorage.setItem('su_votes', JSON.stringify(voteData));
  }
  if(d.curProComp!==undefined&&typeof curProComp!=='undefined') curProComp=d.curProComp;
  if(d._ttCurComp!==undefined&&typeof _ttCurComp!=='undefined') _ttCurComp=d._ttCurComp;
  if(d.appSettings!==undefined){
    const s=d.appSettings;
    if(s.fabTabs) localStorage.setItem('su_fabTabs', JSON.stringify(s.fabTabs));
    if(s.globalImgSettings) localStorage.setItem('su_b2_global_img_settings', JSON.stringify(s.globalImgSettings));
    if(s.imgSettings) localStorage.setItem('su_img_settings', JSON.stringify(s.imgSettings));
    if(s.fabHideMobile!==undefined) localStorage.setItem('su_fabHideMobile', s.fabHideMobile?'1':'0');
    if(s.fabHidePC!==undefined) localStorage.setItem('su_fabHidePC', s.fabHidePC?'1':'0');
    if(s.darkMode!==undefined) localStorage.setItem('su_dark', s.darkMode?'1':'0');
    if(s.b2LabelAlpha!==undefined) localStorage.setItem('su_b2la', s.b2LabelAlpha);
    if(s.b2BgAlpha!==undefined) localStorage.setItem('su_b2ba', s.b2BgAlpha);
    try{
      const ls = s.ls || s.localStorage || null;
      if(ls && typeof ls==='object'){
        let localExtTs = 0, cloudExtTs = 0;
        try{ localExtTs = Number(localStorage.getItem('su_hist_ext_last_modified')||0) || 0; }catch(e){}
        try{ cloudExtTs = Number(ls.su_hist_ext_last_modified||0) || 0; }catch(e){}
        const extKeys = new Set([
          'su_hist_ext_data_v1',
          'su_hist_ext_proxy_presets_v1',
          'su_hist_ext_proxy_preset_sel_v1',
          'su_hist_ext_last_modified'
        ]);
        Object.entries(ls).forEach(([k,v])=>{
          if(!k || typeof k!=='string') return;
          if(!k.startsWith('su_')) return;
          if(k.startsWith('su_pp')) return;
          if(k==='su_fb_pw' || k==='su_gh_token' || k==='su_admin_hash') return;
          if(k==='su_last_admin_save' || k==='su_last_save_time') return;
          if(extKeys.has(k) && localExtTs && localExtTs > cloudExtTs) return;
          try{ localStorage.setItem(k, String(v)); }catch(e){}
        });
      }
    }catch(e){}
    if(typeof updateFabVisibility==='function') updateFabVisibility();
    if(typeof updateFabButtonOnclick==='function') updateFabButtonOnclick();
    try{ if(typeof applyProfileShapeVars==='function') applyProfileShapeVars(); }catch(e){}
    if(s.darkMode!==undefined){
      document.body.classList.toggle('dark', s.darkMode);
      if(window._fixHdrBtns) window._fixHdrBtns();
    }
    if(s.b2LabelAlpha!==undefined) b2LabelAlpha = parseInt(s.b2LabelAlpha);
    if(s.b2BgAlpha!==undefined) b2BgAlpha = parseInt(s.b2BgAlpha);
    const b2Content=document.getElementById('b2-content');
    if(b2Content && typeof _b2UnivView==='function'){
      b2Content.innerHTML=_b2UnivView();
      if(typeof injectUnivIcons==='function') injectUnivIcons(b2Content);
    }
    try{
      if(s.bgmEnabled!==undefined) localStorage.setItem('su_bgm_enabled', s.bgmEnabled ? '1' : '0');
      if(s.bgmShuffle!==undefined) localStorage.setItem('su_bgm_shuffle', s.bgmShuffle ? '1' : '0');
      if(s.bgmVolume!==undefined) localStorage.setItem('su_bgm_volume', String(s.bgmVolume));
      if(s.bgmList!==undefined) localStorage.setItem('su_bgm_list', String(s.bgmList||''));
      if(s.soopList!==undefined) localStorage.setItem('su_soop_list', String(s.soopList||''));
      if(typeof window.bgmApplySettings==='function') window.bgmApplySettings();
      if(typeof window.soopApplySettings==='function') window.soopApplySettings();
    }catch(e){}
    try{
      if(s.histExtData!==undefined) localStorage.setItem('su_hist_ext_data_v1', String(s.histExtData||''));
      if(s.histExtProxyPresets!==undefined) localStorage.setItem('su_hist_ext_proxy_presets_v1', String(s.histExtProxyPresets||''));
      if(s.histExtProxyPresetSel!==undefined) localStorage.setItem('su_hist_ext_proxy_preset_sel_v1', String(s.histExtProxyPresetSel||''));
    }catch(e){}
    try{
      if(s.designV2On!==undefined) localStorage.setItem('su_design_v2', s.designV2On ? '1' : '0');
      if(s.designV2Preset!==undefined) localStorage.setItem('su_design_v2_preset', String(s.designV2Preset||'base'));
      if(s.designV2Bright!==undefined) localStorage.setItem('su_design_v2_bright', String(s.designV2Bright||'0'));
      if(s.designV2Dark!==undefined) localStorage.setItem('su_design_v2_dark', String(s.designV2Dark||'0'));
      if(s.designV2Colors!==undefined) localStorage.setItem('su_design_v2_colors', String(s.designV2Colors||'{}'));
      if(s.designV2Effects!==undefined) localStorage.setItem('su_design_v2_effects', String(s.designV2Effects||'{}'));
      if(s.appFontPreset!==undefined) localStorage.setItem('su_app_font_preset', String(s.appFontPreset||'noto'));
      if(s.appFontCss!==undefined) localStorage.setItem('su_app_font_css', String(s.appFontCss||''));
      if(s.appFontFamily!==undefined) localStorage.setItem('su_app_font_family', String(s.appFontFamily||''));
      if(s.appFontCssText!==undefined) localStorage.setItem('su_app_font_css_text', String(s.appFontCssText||''));
      if(s.appFontAliasMap!==undefined) localStorage.setItem('su_app_font_alias_map', String(s.appFontAliasMap||'{}'));
      if(s.appFontScalePct!==undefined) localStorage.setItem('su_app_font_scale_pct', String(s.appFontScalePct||'100'));
      if(s.appFontScalePcPct!==undefined) localStorage.setItem('su_app_font_scale_pc_pct', String(s.appFontScalePcPct||'100'));
      if(s.appFontScaleTbPct!==undefined) localStorage.setItem('su_app_font_scale_tb_pct', String(s.appFontScaleTbPct||'100'));
      if(s.appFontScaleMbPct!==undefined) localStorage.setItem('su_app_font_scale_mb_pct', String(s.appFontScaleMbPct||'100'));
      if(s.uiScalePct!==undefined) localStorage.setItem('su_ui_scale_pct', String(s.uiScalePct||'100'));
      if(s.uiScalePcPct!==undefined) localStorage.setItem('su_ui_scale_pc_pct', String(s.uiScalePcPct||'100'));
      if(s.uiScaleTbPct!==undefined) localStorage.setItem('su_ui_scale_tb_pct', String(s.uiScaleTbPct||'100'));
      if(s.uiScaleMbPct!==undefined) localStorage.setItem('su_ui_scale_mb_pct', String(s.uiScaleMbPct||'100'));
      if(typeof window._applyAppFont==='function') window._applyAppFont();
      if(typeof window._applyAppFontScale==='function') window._applyAppFontScale();
      if(typeof window.applyDesignV2==='function') window.applyDesignV2();
      if(typeof window._applyUiScale==='function') window._applyUiScale();
    }catch(e){}
  }
  try{ window._applyingCloudData = false; }catch(e){}
}

window.onFirebaseLoad = function(data) {
  const { admin_pw: _, ...clean } = data;
  try{window._lastFbDataSize=JSON.stringify(data).length;window._lastFbLoadTime=Date.now();}catch(e){}
  const _getSavedAt = (obj)=>{
    try{ return Number(obj && obj.savedAt || 0) || 0; }catch(e){ return 0; }
  };
  const _getLocalSavedAt = ()=>{
    try{
      const a = Number(window._lastAdminSaveTime||0) || 0;
      const b = Number(localStorage.getItem('su_last_admin_save')||0) || 0;
      return Math.max(a,b);
    }catch(e){
      return Number(window._lastAdminSaveTime||0) || 0;
    }
  };
  const _markReceiveMeta = (sa)=>{
    try{
      if(sa) localStorage.setItem('su_sync_last_remote_saved_at', String(sa));
      localStorage.setItem('su_sync_last_received_at', String(Date.now()));
    }catch(e){}
  };
  try{
    const sa = _getSavedAt(clean);
    const localSavedAt = _getLocalSavedAt();
    const lastApplied = Number(window._lastAppliedSavedAt||0) || 0;
    if(!window._forcingSync && window._isSaving){
      const pendingSa = _getSavedAt(window._fbPendingData);
      if(!window._fbPendingData || sa >= pendingSa){
        window._fbPendingData = clean;
      }
      const fbTs = document.getElementById('fbLastSync');
      if(fbTs) fbTs.textContent = '⏳ 저장 중 수신 대기';
      return;
    }
    if(!window._forcingSync && sa && lastApplied && sa <= lastApplied){
      const fbTs = document.getElementById('fbLastSync');
      if(fbTs) fbTs.textContent = '🔄 ' + new Date().toLocaleTimeString('ko-KR');
      _markReceiveMeta(sa);
      return;
    }
    if(!window._forcingSync && sa && localSavedAt && sa < localSavedAt){
      console.warn('[sync] stale remote ignored', { remoteSavedAt: sa, localSavedAt });
      try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('⏭️ 오래된 원격 데이터 무시', '#d97706'); }catch(e){}
      _markReceiveMeta(sa);
      return;
    }
    if(sa) window._lastAppliedSavedAt = Math.max(lastApplied, sa);
    _markReceiveMeta(sa);
  }catch(e){}
  _applyCloudData(clean);
  if (typeof localSave === 'function') localSave();
  try{ if(typeof window._primeMatchSyncSignature === 'function') window._primeMatchSyncSignature(true); }catch(e){}
  if (typeof fixPoints === 'function') fixPoints();
  window._compListCache = {}; window._shareAllMatchesCached = null; window._histTourneyCache = {};
  if (typeof render === 'function') render();
  const _openModal = document.getElementById('playerModal');
  const pst = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  if (_openModal && _openModal.style.display !== 'none' && pst.currentName) {
    if (typeof openPlayerModal === 'function') openPlayerModal(pst.currentName);
  }
  const _openUnivModal = document.getElementById('univModal');
  const ust = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  if (_openUnivModal && _openUnivModal.style.display !== 'none' && ust.currentName) {
    if (typeof openUnivModal === 'function') openUnivModal(ust.currentName);
  }
  const fbTs = document.getElementById('fbLastSync');
  if(fbTs) fbTs.textContent = '🔄 ' + new Date().toLocaleTimeString('ko-KR');
};

try{ window._fbArr = _fbArr; }catch(e){}
try{ window._decompressCloudData = _decompressCloudData; }catch(e){}
try{ window._applyCloudData = _applyCloudData; }catch(e){}
