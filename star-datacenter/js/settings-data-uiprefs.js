// settings-data-ops.js에서 분리됨 (설정 - UI배율/버튼스타일/폰트 배율·프리셋)

// ─────────────────────────────────────────────────────────────
// 🎛️ 버튼 스타일 / 전역 UI 배율 / 상단 탭 UI / 앱 폰트 크기 배율
// - 컨트롤(oninput/onchange)은 있었지만 실제 저장 함수가 없어 동작하지 않던 것들을 복원
// ─────────────────────────────────────────────────────────────
window.cfgSetUiScalePct = function(device, val){
  try{
    const pct = Math.max(80, Math.min(140, parseInt(val,10) || 100));
    const key = device==='pc' ? 'su_ui_scale_pc_pct' : device==='tb' ? 'su_ui_scale_tb_pct' : 'su_ui_scale_mb_pct';
    localStorage.setItem(key, String(pct));
    const lbl = document.getElementById('cfg-uiscale-'+device+'-v');
    if(lbl) lbl.textContent = pct+'%';
  }catch(e){}
  try{ if(typeof window._applyUiScale === 'function') window._applyUiScale(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
};
window.cfgResetUiScalePct = function(){
  try{
    ['su_ui_scale_pc_pct','su_ui_scale_tb_pct','su_ui_scale_mb_pct','su_ui_scale_pct'].forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  try{ if(typeof window._applyUiScale === 'function') window._applyUiScale(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

window.cfgSetTopTabUiSettings = function(){
  try{
    const font = parseInt(document.getElementById('cfg-top-tab-font-mb')?.value || '10', 10) || 10;
    const gap  = parseInt(document.getElementById('cfg-top-tab-gap-mb')?.value || '2', 10) || 2;
    const align = (document.getElementById('cfg-top-tab-align-mb')?.value || 'start').trim();
    localStorage.setItem('su_top_tab_font_mb_px', String(Math.max(8,Math.min(16,font))));
    localStorage.setItem('su_top_tab_gap_mb_px', String(Math.max(0,Math.min(16,gap))));
    localStorage.setItem('su_top_tab_align_mb', align);
  }catch(e){}
  try{ if(typeof applyResponsiveUiVars === 'function') applyResponsiveUiVars(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
};
window.cfgResetTopTabUiSettings = function(){
  try{
    ['su_top_tab_font_mb_px','su_top_tab_gap_mb_px','su_top_tab_align_mb'].forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  try{ if(typeof applyResponsiveUiVars === 'function') applyResponsiveUiVars(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

window.cfgSetUiBtnStyleSettings = function(){
  try{
    const pct = parseInt(document.getElementById('cfg-btnscale')?.value || '100', 10) || 100;
    const br  = parseInt(document.getElementById('cfg-btnr')?.value || '8', 10) || 8;
    const pr  = parseInt(document.getElementById('cfg-pillr')?.value || '20', 10) || 20;
    localStorage.setItem('su_btn_scale_pct', String(Math.max(85,Math.min(125,pct))));
    localStorage.setItem('su_btn_r', String(Math.max(4,Math.min(18,br))));
    localStorage.setItem('su_pill_r', String(Math.max(12,Math.min(28,pr))));
  }catch(e){}
  try{ if(typeof window._applyUiBtnStyle === 'function') window._applyUiBtnStyle(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
};
window.cfgResetUiBtnStyleSettings = function(){
  try{
    ['su_btn_scale_pct','su_btn_r','su_pill_r'].forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  try{ if(typeof window._applyUiBtnStyle === 'function') window._applyUiBtnStyle(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

window.cfgSetAppFontScalePct = function(device, val){
  try{
    const pct = Math.max(85, Math.min(130, parseInt(val,10) || 100));
    const key = device==='pc' ? 'su_app_font_scale_pc_pct' : device==='tb' ? 'su_app_font_scale_tb_pct' : 'su_app_font_scale_mb_pct';
    localStorage.setItem(key, String(pct));
    const lbl = document.getElementById('cfg-appfont-scale-'+device+'-v');
    if(lbl) lbl.textContent = pct+'%';
  }catch(e){}
  try{ if(typeof window._applyAppFontScale === 'function') window._applyAppFontScale(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
};
window.cfgResetAppFontScalePct = function(){
  try{
    ['su_app_font_scale_pc_pct','su_app_font_scale_tb_pct','su_app_font_scale_mb_pct','su_app_font_scale_pct'].forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  try{ if(typeof window._applyAppFontScale === 'function') window._applyAppFontScale(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// font-family 선택 드롭다운 → font-family 입력칸에 반영 후 저장
window.cfgApplyFontFamilyChoice = function(val){
  try{
    if(!val) return;
    const el = document.getElementById('cfg-appfont-family');
    if(el) el.value = val;
  }catch(e){}
  try{ if(typeof window.cfgSetAppFontSettings === 'function') window.cfgSetAppFontSettings(); }catch(e){}
};
// 커스텀 CSS 직접입력에서 자동 추출된 font-family 프리셋 선택
window.cfgApplyCustomFontPreset = function(val){
  try{
    if(!val) return;
    const name = val.indexOf('custom:')===0 ? val.slice(7) : val;
    const el = document.getElementById('cfg-appfont-family');
    if(el) el.value = `${name}, "Noto Sans KR", sans-serif`;
  }catch(e){}
  try{ if(typeof window.cfgSetAppFontSettings === 'function') window.cfgSetAppFontSettings(); }catch(e){}
};
// 커스텀 CSS 직접입력 textarea에서 font-family들을 다시 추출해 프리셋 드롭다운 갱신
window.cfgRenderCustomFontPresetOptions = function(){
  try{
    const sel = document.getElementById('cfg-appfont-custompreset');
    const txt = document.getElementById('cfg-appfont-csstext')?.value || '';
    if(!sel) return;
    const out=[]; const seen=new Set();
    const re=/font-family\s*:\s*['"]?([^;'"\n\r]+)['"]?\s*;/gi;
    let m;
    while((m=re.exec(txt))){
      const name=String(m[1]||'').trim();
      if(!name) continue;
      const key=name.toLowerCase();
      if(seen.has(key)) continue;
      seen.add(key); out.push(name);
    }
    sel.innerHTML = '<option value="">(직접입력에서 자동 추출)</option>' +
      out.map(n=>`<option value="custom:${n.replace(/"/g,'&quot;')}">${n.replace(/</g,'&lt;')}</option>`).join('');
  }catch(e){}
};
