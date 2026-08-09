// ─────────────────────────────────────────────────────────────
// 설정 탭: UI 배율/버튼 스타일 관련 로직
// - settings.js에서 분리
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// (요청사항) 버튼/필 스타일(크기/라운드)
// ─────────────────────────────────────────────────────────────
window.cfgSetUiBtnStyleSettings = function(){
  const pct = parseInt(document.getElementById('cfg-btnscale')?.value || '100',10) || 100;
  const br  = parseInt(document.getElementById('cfg-btnr')?.value || '8',10) || 8;
  const pr  = parseInt(document.getElementById('cfg-pillr')?.value || '20',10) || 20;
  try{ localStorage.setItem('su_btn_scale_pct', String(Math.max(70,Math.min(140,pct)))); }catch(e){}
  try{ localStorage.setItem('su_btn_r', String(Math.max(0,Math.min(40,br)))); }catch(e){}
  try{ localStorage.setItem('su_pill_r', String(Math.max(0,Math.min(60,pr)))); }catch(e){}
  try{ if(typeof window._applyUiBtnStyle === 'function') window._applyUiBtnStyle(); }catch(e){}
  try{
    const a=document.getElementById('cfg-btnscale-v'); if(a) a.textContent=pct+'%';
    const b=document.getElementById('cfg-btnr-v'); if(b) b.textContent=br+'px';
    const c=document.getElementById('cfg-pillr-v'); if(c) c.textContent=pr+'px';
  }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 전역 UI 배율(폰트/아이콘 크기) — 기기별 분리
// - localStorage:
//   su_ui_scale_pc_pct / su_ui_scale_tb_pct / su_ui_scale_mb_pct
//   (구버전 호환: su_ui_scale_pct)
// ─────────────────────────────────────────────────────────────
window.cfgSetUiScalePct = function(device, v){
  try{
    const n = Math.max(80, Math.min(140, parseInt(v||'100',10)||100));
    const key = device==='pc' ? 'su_ui_scale_pc_pct' : device==='tb' ? 'su_ui_scale_tb_pct' : device==='mb' ? 'su_ui_scale_mb_pct' : 'su_ui_scale_pct';
    localStorage.setItem(key, String(n));
    if(key === 'su_ui_scale_pct'){
      localStorage.setItem('su_ui_scale_pc_pct', String(n));
      localStorage.setItem('su_ui_scale_tb_pct', String(n));
      localStorage.setItem('su_ui_scale_mb_pct', String(n));
    }
  }catch(e){}
  try{
    const id = device==='pc' ? 'cfg-uiscale-pc-v' : device==='tb' ? 'cfg-uiscale-tb-v' : device==='mb' ? 'cfg-uiscale-mb-v' : 'cfg-uiscale-v';
    const key = device==='pc' ? 'su_ui_scale_pc_pct' : device==='tb' ? 'su_ui_scale_tb_pct' : device==='mb' ? 'su_ui_scale_mb_pct' : 'su_ui_scale_pct';
    const el=document.getElementById(id);
    if(el) el.textContent = (localStorage.getItem(key)||'100') + '%';
  }catch(e){}
  try{ if(typeof window._applyUiScale==='function') window._applyUiScale(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
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
  try{ if(typeof render==='function') render(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
};
window.cfgSetTopTabUiSettings = function(){
  try{
    const mbFont = Math.max(8, Math.min(16, parseInt(document.getElementById('cfg-top-tab-font-mb')?.value || '10', 10) || 10));
    const mbGap = Math.max(0, Math.min(16, parseInt(document.getElementById('cfg-top-tab-gap-mb')?.value || '2', 10) || 2));
    const align = String(document.getElementById('cfg-top-tab-align-mb')?.value || 'start').trim();
    localStorage.setItem('su_top_tab_font_mb_px', String(mbFont));
    localStorage.setItem('su_top_tab_gap_mb_px', String(mbGap));
    localStorage.setItem('su_top_tab_align_mb', align === 'center' ? 'center' : 'start');
  }catch(e){}
  try{ if(typeof applyResponsiveUiVars==='function') applyResponsiveUiVars(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof window._centerActiveTopTab==='function') window._centerActiveTopTab(false); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
};
window.cfgResetTopTabUiSettings = function(){
  try{
    localStorage.removeItem('su_top_tab_font_mb_px');
    localStorage.removeItem('su_top_tab_gap_mb_px');
    localStorage.removeItem('su_top_tab_align_mb');
  }catch(e){}
  try{
    const f=document.getElementById('cfg-top-tab-font-mb'); if(f) f.value='10';
    const fv=document.getElementById('cfg-top-tab-font-mb-v'); if(fv) fv.textContent='10px';
    const g=document.getElementById('cfg-top-tab-gap-mb'); if(g) g.value='2';
    const gv=document.getElementById('cfg-top-tab-gap-mb-v'); if(gv) gv.textContent='2px';
    const a=document.getElementById('cfg-top-tab-align-mb'); if(a) a.value='start';
  }catch(e){}
  try{ if(typeof applyResponsiveUiVars==='function') applyResponsiveUiVars(); else window.dispatchEvent(new Event('resize')); }catch(e){}
  try{ if(typeof window._centerActiveTopTab==='function') window._centerActiveTopTab(false); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
};
window.cfgResetUiBtnStyleSettings = function(){
  try{ localStorage.removeItem('su_btn_scale_pct'); }catch(e){}
  try{ localStorage.removeItem('su_btn_r'); }catch(e){}
  try{ localStorage.removeItem('su_pill_r'); }catch(e){}
  try{
    const s=document.getElementById('cfg-btnscale'); if(s) s.value='100';
    const r=document.getElementById('cfg-btnr'); if(r) r.value='8';
    const p=document.getElementById('cfg-pillr'); if(p) p.value='20';
  }catch(e){}
  window.cfgSetUiBtnStyleSettings();
};
