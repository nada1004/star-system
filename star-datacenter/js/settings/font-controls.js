// ─────────────────────────────────────────────────────────────
// 설정 탭: 전역 폰트/전역 폰트 크기 관련 로직
// - settings.js에서 분리
// ─────────────────────────────────────────────────────────────

// cfgSetAppFontSettings 정의는 js/init-theme-apply.js로 이전됨
// (index.html 로드 순서상 이 파일보다 나중에 로드되어 실제로는 그쪽 정의가 항상 적용되므로,
//  두 곳에 중복 정의해 혼동을 만들지 않도록 여기서는 제거함. _applyAppFont와 함께 관리)

// ─────────────────────────────────────────────────────────────
// (요청사항) 전역 폰트 크기 — 기기별 분리
// - localStorage:
//   su_app_font_scale_pc_pct / su_app_font_scale_tb_pct / su_app_font_scale_mb_pct
//   (구버전 호환: su_app_font_scale_pct)
// ─────────────────────────────────────────────────────────────
window.cfgSetAppFontScalePct = function(device, v){
  try{
    const n = Math.max(85, Math.min(130, parseInt(v||'100',10)||100));
    const key = device==='pc' ? 'su_app_font_scale_pc_pct' : device==='tb' ? 'su_app_font_scale_tb_pct' : device==='mb' ? 'su_app_font_scale_mb_pct' : 'su_app_font_scale_pct';
    localStorage.setItem(key, String(n));
    if(key === 'su_app_font_scale_pct'){
      localStorage.setItem('su_app_font_scale_pc_pct', String(n));
      localStorage.setItem('su_app_font_scale_tb_pct', String(n));
      localStorage.setItem('su_app_font_scale_mb_pct', String(n));
    }
  }catch(e){}
  try{
    const id = device==='pc' ? 'cfg-appfont-scale-pc-v' : device==='tb' ? 'cfg-appfont-scale-tb-v' : device==='mb' ? 'cfg-appfont-scale-mb-v' : 'cfg-appfont-scale-v';
    const key = device==='pc' ? 'su_app_font_scale_pc_pct' : device==='tb' ? 'su_app_font_scale_tb_pct' : device==='mb' ? 'su_app_font_scale_mb_pct' : 'su_app_font_scale_pct';
    const el=document.getElementById(id);
    if(el) el.textContent = (localStorage.getItem(key)||'100') + '%';
  }catch(e){}
  try{ if(typeof window._applyAppFontScale==='function') window._applyAppFontScale(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
};
window.cfgResetAppFontScalePct = function(){
  try{
    ['su_app_font_scale_pct','su_app_font_scale_pc_pct','su_app_font_scale_tb_pct','su_app_font_scale_mb_pct'].forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  try{
    [['cfg-appfont-scale-pc','100'],['cfg-appfont-scale-tb','100'],['cfg-appfont-scale-mb','100']].forEach(([id,v])=>{ const r=document.getElementById(id); if(r) r.value=v; });
  }catch(e){}
  try{
    [['cfg-appfont-scale-pc-v','100%'],['cfg-appfont-scale-tb-v','100%'],['cfg-appfont-scale-mb-v','100%']].forEach(([id,v])=>{ const el=document.getElementById(id); if(el) el.textContent=v; });
  }catch(e){}
  try{ if(typeof window._applyAppFontScale==='function') window._applyAppFontScale(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
};

// 설정 화면 렌더 후 자동으로 커스텀 폰트 프리셋 목록/별칭 편집기 갱신
// [FIX] 이 스크립트는 render-core.js보다 먼저 로드되기 때문에, 로드 시점에
// window.render (혹은 window.renderNow)를 바로 감싸려고 하면 아직 함수가 존재하지
// 않아 patch가 조용히 무시되고("커스텀 폰트 별칭" UI가 영영 채워지지 않는 버그의 원인).
// → DOMContentLoaded(모든 defer 스크립트 로드 완료 후) 시점까지 기다렸다가 patch한다.
// → 또한 window.render()는 requestAnimationFrame으로 배치되는 비동기 스케줄러라
//   patch 직후 DOM이 아직 갱신되지 않은 상태일 수 있다. 실제 DOM을 동기적으로
//   그리는 window.renderNow(render-core.js의 _renderImpl)를 감싸야 타이밍이 맞다.
(function(){
  function _installFontPanelAutoRefresh(){
    try{
      if(window.__patchedRenderForFontPreset) return;
      const _prevRenderNow = window.renderNow;
      if(typeof _prevRenderNow !== 'function') return; // 아직 준비 안 됐으면 다음 시도에서
      window.__patchedRenderForFontPreset = true;
      window.renderNow = function(){
        const r = _prevRenderNow.apply(this, arguments);
        try{ if(typeof window.cfgRenderCustomFontPresetOptions==='function') window.cfgRenderCustomFontPresetOptions(); }catch(e){}
        try{ if(typeof window.cfgRenderAppFontAliasEditor==='function') window.cfgRenderAppFontAliasEditor(); }catch(e){}
      };
    }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', _installFontPanelAutoRefresh);
  }else{
    _installFontPanelAutoRefresh();
  }
  // 안전망: 혹시라도 renderNow가 DOMContentLoaded 시점에도 아직 없다면(스크립트 로딩 지연 등)
  // 짧게 재시도한다.
  let _tries = 0;
  const _retry = setInterval(()=>{
    _tries++;
    if(window.__patchedRenderForFontPreset || _tries>50){ clearInterval(_retry); return; }
    _installFontPanelAutoRefresh();
  }, 100);
})();

// ─────────────────────────────────────────────────────────────
// (요청사항) CSS 직접입력(@font-face)에서 font-family 자동 추출 → 프리셋 드롭다운
// ─────────────────────────────────────────────────────────────
window.cfgGetCustomFontFamilies = function(){
  let cssTxt = '';
  try{ cssTxt = (document.getElementById('cfg-appfont-csstext')?.value || localStorage.getItem('su_app_font_css_text') || ''); }catch(e){}
  cssTxt = String(cssTxt||'');
  const out = [];
  const seen = new Set();
  const re = /font-family\s*:\s*['"]?([^;'"\n\r]+)['"]?\s*;/gi;
  let m;
  while((m = re.exec(cssTxt))){
    const name = String(m[1]||'').trim();
    if(!name) continue;
    const key = name.toLowerCase();
    if(seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 커스텀 폰트 "별칭(표시 이름)" 저장/편집
// - localStorage: su_app_font_alias_map  (JSON: { "FontFamily": "표시이름" })
// ─────────────────────────────────────────────────────────────
window.cfgGetAppFontAliasMap = function(){
  try{ return JSON.parse(localStorage.getItem('su_app_font_alias_map')||'{}')||{}; }catch(e){ return {}; }
};
window.cfgSetAppFontAlias = function(fontFamily, alias){
  const k = String(fontFamily||'').trim();
  if(!k) return;
  const v = String(alias||'').trim();
  const map = window.cfgGetAppFontAliasMap ? window.cfgGetAppFontAliasMap() : {};
  if(v) map[k] = v;
  else delete map[k];
  try{ localStorage.setItem('su_app_font_alias_map', JSON.stringify(map)); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgRenderAppFontAliasEditor = function(){
  const wrap = document.getElementById('cfg-appfont-alias-wrap');
  if(!wrap) return;
  const fams = window.cfgGetCustomFontFamilies ? window.cfgGetCustomFontFamilies() : [];
  const map = window.cfgGetAppFontAliasMap ? window.cfgGetAppFontAliasMap() : {};
  if(!fams.length){
    wrap.innerHTML = `<div style="font-size:11px;color:var(--gray-l)">커스텀 폰트가 없습니다. (CSS 직접 입력에 @font-face를 추가하면 여기에 표시됩니다)</div>`;
    return;
  }
  wrap.innerHTML = fams.map(f=>{
    const a = map[f] || '';
    const fjs = JSON.stringify(String(f||''));
    return `
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);min-width:140px">${esc(f)}</div>
        <input type="text" value="${esc(a)}" placeholder="예) 본문용 / 타이틀용" style="flex:1;min-width:180px"
          oninput="cfgSetAppFontAlias(${fjs}, this.value)">
      </div>
    `;
  }).join('');
};
window.cfgRenderCustomFontPresetOptions = function(){
  const sel = document.getElementById('cfg-appfont-custompreset');
  if(!sel) return;
  const fams = window.cfgGetCustomFontFamilies ? window.cfgGetCustomFontFamilies() : [];
  const cur = (document.getElementById('cfg-appfont-family')?.value || '').trim();
  const curMain = cur.split(',')[0].replace(/['"]/g,'').trim();
  let html = `<option value="">(직접입력에서 자동 추출)</option>`;
  fams.forEach(f=>{
    const on = (curMain && curMain.toLowerCase() === f.toLowerCase());
    html += `<option value="${esc(f)}" ${on?'selected':''}>${esc(f)}</option>`;
  });
  sel.innerHTML = html;
};
window.cfgApplyCustomFontPreset = function(v){
  const val = String(v||'').trim();
  if(!val) return;
  const inp = document.getElementById('cfg-appfont-family');
  if(inp){
    inp.value = `${val}, "Noto Sans KR", sans-serif`;
  }
  try{ window.cfgSetAppFontSettings && window.cfgSetAppFontSettings(); }catch(e){}
};

// (추가) font-family를 입력 없이 고르기(요청): 드롭다운 선택 → 바로 적용
window.cfgApplyFontFamilyChoice = function(v){
  const val = String(v||'').trim();
  if(!val) return;
  try{
    const presetSel = document.getElementById('cfg-appfont-preset');
    if(presetSel) presetSel.value = 'custom';
  }catch(e){}
  const inp = document.getElementById('cfg-appfont-family');
  if(inp) inp.value = val;
  try{ window.cfgSetAppFontSettings && window.cfgSetAppFontSettings(); }catch(e){}
};
