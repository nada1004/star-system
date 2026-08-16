// settings-data-ops.js에서 분리됨 (설정 - UI배율/버튼스타일/폰트 배율·프리셋)

// ─────────────────────────────────────────────────────────────
// 🎛️ 버튼 스타일 / 전역 UI 배율 / 상단 탭 UI / 앱 폰트 크기 배율
// - 컨트롤(oninput/onchange)은 있었지만 실제 저장 함수가 없어 동작하지 않던 것들을 복원
// ─────────────────────────────────────────────────────────────
window.cfgSetUiScalePct = function(device, val){
  try{
    const pct = Math.max(80, Math.min(140, parseInt(val,10) || 100));
    const key = device==='pc' ? 'su_ui_scale_pc_pct' : device==='tb' ? 'su_ui_scale_tb_pct' : device==='mb' ? 'su_ui_scale_mb_pct' : 'su_ui_scale_pct';
    localStorage.setItem(key, String(pct));
    if(key === 'su_ui_scale_pct'){
      localStorage.setItem('su_ui_scale_pc_pct', String(pct));
      localStorage.setItem('su_ui_scale_tb_pct', String(pct));
      localStorage.setItem('su_ui_scale_mb_pct', String(pct));
    }
    const lbl = document.getElementById('cfg-uiscale-'+device+'-v');
    if(lbl) lbl.textContent = pct+'%';
  }catch(e){}
  try{ if(typeof window._applyUiScale==='function') window._applyUiScale(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync === 'function') window.cfgTouchPrefsSync(); }catch(e){}
};
window.cfgResetUiScalePct = function(){
  try{
    ['su_ui_scale_pct','su_ui_scale_pc_pct','su_ui_scale_tb_pct','su_ui_scale_mb_pct'].forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  try{
    [['cfg-uiscale-pc','100'],['cfg-uiscale-tb','100'],['cfg-uiscale-mb','100']].forEach(([id,v])=>{ const r=document.getElementById(id); if(r) r.value=v; });
  }catch(e){}
  try{
    [['cfg-uiscale-pc-v','100%'],['cfg-uiscale-tb-v','100%'],['cfg-uiscale-mb-v','100%']].forEach(([id,v])=>{ const el=document.getElementById(id); if(el) el.textContent=v; });
  }catch(e){}
  try{ if(typeof window._applyUiScale==='function') window._applyUiScale(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync === 'function') window.cfgTouchPrefsSync(); }catch(e){}
};

window.cfgSetTopTabUiSettings = function(){
  try{
    const font = parseInt(document.getElementById('cfg-top-tab-font-mb')?.value || '10', 10) || 10;
    const gap  = parseInt(document.getElementById('cfg-top-tab-gap-mb')?.value || '2', 10) || 2;
    const align = (document.getElementById('cfg-top-tab-align-mb')?.value || 'start').trim();
    localStorage.setItem('su_top_tab_font_mb_px', String(Math.max(8,Math.min(16,font))));
    localStorage.setItem('su_top_tab_gap_mb_px', String(Math.max(0,Math.min(16,gap))));
    localStorage.setItem('su_top_tab_align_mb', align === 'center' ? 'center' : 'start');
  }catch(e){}
  try{ if(typeof applyResponsiveUiVars==='function') applyResponsiveUiVars(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof window._centerActiveTopTab === 'function') window._centerActiveTopTab(false); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync === 'function') window.cfgTouchPrefsSync(); }catch(e){}
};
window.cfgResetTopTabUiSettings = function(){
  try{
    ['su_top_tab_font_mb_px','su_top_tab_gap_mb_px','su_top_tab_align_mb'].forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  try{
    const f=document.getElementById('cfg-top-tab-font-mb'); if(f) f.value='10';
    const fv=document.getElementById('cfg-top-tab-font-mb-v'); if(fv) fv.textContent='10px';
    const g=document.getElementById('cfg-top-tab-gap-mb'); if(g) g.value='2';
    const gv=document.getElementById('cfg-top-tab-gap-mb-v'); if(gv) gv.textContent='2px';
    const a=document.getElementById('cfg-top-tab-align-mb'); if(a) a.value='start';
  }catch(e){}
  try{ if(typeof applyResponsiveUiVars==='function') applyResponsiveUiVars(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof window._centerActiveTopTab === 'function') window._centerActiveTopTab(false); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync === 'function') window.cfgTouchPrefsSync(); }catch(e){}
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
  try{
    const a=document.getElementById('cfg-btnscale-v'); if(a) a.textContent=pct+'%';
    const b=document.getElementById('cfg-btnr-v'); if(b) b.textContent=br+'px';
    const c=document.getElementById('cfg-pillr-v'); if(c) c.textContent=pr+'px';
  }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync === 'function') window.cfgTouchPrefsSync(); }catch(e){}
};
window.cfgResetUiBtnStyleSettings = function(){
  try{
    ['su_btn_scale_pct','su_btn_r','su_pill_r'].forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  try{
    const s=document.getElementById('cfg-btnscale'); if(s) s.value='100';
    const r=document.getElementById('cfg-btnr'); if(r) r.value='8';
    const p=document.getElementById('cfg-pillr'); if(p) p.value='20';
  }catch(e){}
  window.cfgSetUiBtnStyleSettings();
};

window.cfgSetAppFontScalePct = function(device, val){
  try{
    const pct = Math.max(85, Math.min(130, parseInt(val,10) || 100));
    const key = device==='pc' ? 'su_app_font_scale_pc_pct' : device==='tb' ? 'su_app_font_scale_tb_pct' : device==='mb' ? 'su_app_font_scale_mb_pct' : 'su_app_font_scale_pct';
    localStorage.setItem(key, String(pct));
    // 통합 키(su_app_font_scale_pct)로 설정된 경우 pc/tb/mb에도 동일하게 미러링
    if(key === 'su_app_font_scale_pct'){
      localStorage.setItem('su_app_font_scale_pc_pct', String(pct));
      localStorage.setItem('su_app_font_scale_tb_pct', String(pct));
      localStorage.setItem('su_app_font_scale_mb_pct', String(pct));
    }
    const lbl = document.getElementById('cfg-appfont-scale-'+device+'-v');
    if(lbl) lbl.textContent = pct+'%';
  }catch(e){}
  try{ if(typeof window._applyAppFontScale==='function') window._applyAppFontScale(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync === 'function') window.cfgTouchPrefsSync(); }catch(e){}
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
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync === 'function') window.cfgTouchPrefsSync(); }catch(e){}
};

// font-family 선택 드롭다운 → font-family 입력칸에 반영 후 저장
window.cfgApplyFontFamilyChoice = function(val){
  try{
    if(!val) return;
    const presetSel = document.getElementById('cfg-appfont-preset');
    if(presetSel) presetSel.value = 'custom';
  }catch(e){}
  try{
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
