// ─────────────────────────────────────────────────────────────
// 설정 탭: 전역 폰트/전역 폰트 크기 관련 로직
// - settings.js에서 분리
// ─────────────────────────────────────────────────────────────

window.cfgSetAppFontSettings = function(){
  let preset = (document.getElementById('cfg-appfont-preset')?.value || 'noto').trim();
  const cssUrl = (document.getElementById('cfg-appfont-css')?.value || '').trim();
  let fam      = (document.getElementById('cfg-appfont-family')?.value || '').trim();
  // CSS 직접 입력은 줄바꿈/앞뒤 공백이 의미 있을 수 있어 trim 하지 않음
  const cssTxt = (document.getElementById('cfg-appfont-csstext')?.value || '');
  // 프리셋 드롭다운에서 "커스텀:FontName" 형태로 선택한 경우
  try{
    if(/^custom:/.test(preset)){
      const name = preset.slice('custom:'.length).trim();
      preset = 'custom';
      if(name){
        fam = `${name}, "Noto Sans KR", sans-serif`;
        const inp = document.getElementById('cfg-appfont-family');
        if(inp) inp.value = fam;
      }
    }
  }catch(e){}
  try{ localStorage.setItem('su_app_font_preset', preset); }catch(e){}
  try{ localStorage.setItem('su_app_font_css', cssUrl); }catch(e){}
  try{ localStorage.setItem('su_app_font_family', fam); }catch(e){}
  try{ localStorage.setItem('su_app_font_css_text', cssTxt); }catch(e){}
  try{ if(typeof window._applyAppFont === 'function') window._applyAppFont(); }catch(e){}
  try{ if(typeof window._applyAppFontScale === 'function') window._applyAppFontScale(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
};

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
};

// 설정 화면 렌더 후 자동으로 커스텀 폰트 프리셋 목록 갱신
try{
  const _prevRender = window.render;
  if(typeof _prevRender === 'function' && !window.__patchedRenderForFontPreset){
    window.__patchedRenderForFontPreset = true;
    window.render = function(){
      const r = _prevRender.apply(this, arguments);
      try{ if(typeof window.cfgRenderCustomFontPresetOptions==='function') window.cfgRenderCustomFontPresetOptions(); }catch(e){}
      try{ if(typeof window.cfgRenderAppFontAliasEditor==='function') window.cfgRenderAppFontAliasEditor(); }catch(e){}
      return r;
    };
  }
}catch(e){}

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
