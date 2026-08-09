/* ══════════════════════════════════════════════════════════════
   설정 - 색상 변환 유틸 (settings-base.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _hexToRgb_(hex){
  const h=String(hex||'').trim().replace('#','');
  if(h.length!==6) return null;
  const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
  if(!Number.isFinite(r)||!Number.isFinite(g)||!Number.isFinite(b)) return null;
  return {r,g,b};
}
function _mixRgb_(a,b,t){
  t=Math.max(0,Math.min(1,Number(t)||0));
  const r=Math.round(a.r+(b.r-a.r)*t);
  const g=Math.round(a.g+(b.g-a.g)*t);
  const b2=Math.round(a.b+(b.b-a.b)*t);
  return {r,g,b:b2};
}
function _rgbToHex_(c){
  const to=(n)=>String(Math.max(0,Math.min(255,n|0)).toString(16)).padStart(2,'0');
  return '#'+to(c.r)+to(c.g)+to(c.b);
}
window.applyScoreColors = function(){
  try{
    // (통일) 기존 기본값(승=초록 #16a34a / 패=빨강 #dc2626)을 그대로 쓰고 있던 사용자는
    // 사이트 전역 승패색 컨벤션(승=빨강 #dc2626 / 패=파랑 #2563eb)에 맞춰 1회 자동 이관한다.
    if(!localStorage.getItem('su_score_col_migrated_v2')){
      if((localStorage.getItem('su_score_win')||'#16a34a') === '#16a34a'){
        localStorage.setItem('su_score_win', '#dc2626');
      }
      if((localStorage.getItem('su_score_lose')||'#dc2626') === '#dc2626'){
        localStorage.setItem('su_score_lose', '#2563eb');
      }
      localStorage.setItem('su_score_col_migrated_v2', '1');
    }
    const win=String(localStorage.getItem('su_score_win')||'#dc2626').trim();
    const lose=String(localStorage.getItem('su_score_lose')||'#2563eb').trim();
    const wr=_hexToRgb_(win)||{r:220,g:38,b:38};
    const lr=_hexToRgb_(lose)||{r:37,g:99,b:235};
    const w2=_mixRgb_(wr,{r:255,g:255,b:255},0.18);
    const l2=_mixRgb_(lr,{r:255,g:255,b:255},0.20);
    document.documentElement.style.setProperty('--score-win', _rgbToHex_(wr));
    document.documentElement.style.setProperty('--score-win-2', _rgbToHex_(w2));
    document.documentElement.style.setProperty('--score-lose', _rgbToHex_(lr));
    document.documentElement.style.setProperty('--score-lose-2', _rgbToHex_(l2));
  }catch(e){}
};
window.cfgSetScoreColors = function(){
  try{
    const w=String(document.getElementById('cfg-score-win')?.value||'#dc2626').trim();
    const l=String(document.getElementById('cfg-score-lose')?.value||'#2563eb').trim();
    if(/^#[0-9a-fA-F]{6}$/.test(w)) localStorage.setItem('su_score_win', w);
    if(/^#[0-9a-fA-F]{6}$/.test(l)) localStorage.setItem('su_score_lose', l);
  }catch(e){}
  try{ window.applyScoreColors && window.applyScoreColors(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드 배경 효과 전체 ON/OFF (승리색 배경 + 양끝 효과)
// - 별도 저장키 없이 su_rc_theme_on / su_rec_side_fx_on 를 동시에 조절
// ─────────────────────────────────────────────────────────────
window.cfgSetRecBgFxAll = function(on){
  try{ localStorage.setItem('su_rc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_rec_side_fx_on', on ? '1' : '0'); }catch(e){}
  try{
    const rc=document.getElementById('cfg-rc-theme-on');
    if(rc) rc.checked = !!on;
  }catch(e){}
  try{
    const sfx=document.getElementById('cfg-sidefx-on');
    if(sfx) sfx.checked = !!on;
  }catch(e){}
  // 사이드FX는 history-core.js의 setter가 변수를 같이 갱신하므로 가능하면 호출
  try{ if(typeof window.cfgSetRecSideFxEnabled==='function') window.cfgSetRecSideFxEnabled(!!on); }catch(e){}
  try{ if(typeof window.cfgSetRecCardSettings==='function') window.cfgSetRecCardSettings(); }catch(e){}
  try{ if(typeof window._applyRecCardTheme==='function') window._applyRecCardTheme(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// [FIX-SIDEFX] 기록 카드 "양쪽 끝 색상 효과" 설정
// - 예전엔 이 6개 함수 자체가 없어서(history-core.js 유실 추정)
//   사용/끄기 체크박스와 효과 종류·강도·길이·진하기·부드러움 슬라이더가
//   전부 아무 반응이 없었습니다.
// - 실제 색상 효과는 카드가 그려질 때 _getRecSideFxCfg()가 이 localStorage
//   값들을 그대로 읽어가므로, 여기서는 저장 + 재렌더만 하면 됩니다.
// ─────────────────────────────────────────────────────────────
function _cfgSideFxTouch(){
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
}
window.cfgSetRecSideFxEnabled = function(on){
  try{ localStorage.setItem('su_rec_side_fx_on', on ? '1' : '0'); }catch(e){}
  _cfgSideFxTouch();
};
window.cfgSetRecSideFxMode = function(mode){
  try{
    const valid = (typeof _REC_SIDE_FX_MODES!=='undefined' && Array.isArray(_REC_SIDE_FX_MODES)) ? _REC_SIDE_FX_MODES : null;
    const v = String(mode||'soft').trim();
    localStorage.setItem('su_rec_side_fx_mode', (valid && !valid.includes(v)) ? 'soft' : v);
  }catch(e){}
  _cfgSideFxTouch();
};
window.cfgSetRecSideFxIntensity = function(val){
  try{ localStorage.setItem('su_rec_side_fx_intensity', String(Math.max(0,Math.min(140,parseInt(val,10)||68)))); }catch(e){}
  _cfgSideFxTouch();
};
window.cfgSetRecSideFxLength = function(val){
  try{ localStorage.setItem('su_rec_side_fx_length', String(Math.max(4,Math.min(80,parseInt(val,10)||25)))); }catch(e){}
  _cfgSideFxTouch();
};
window.cfgSetRecSideFxTail = function(val){
  try{ localStorage.setItem('su_rec_side_fx_tail', String(Math.max(0,Math.min(140,parseInt(val,10)||28)))); }catch(e){}
  _cfgSideFxTouch();
};
window.cfgSetRecSideFxSoftness = function(val){
  try{ localStorage.setItem('su_rec_side_fx_softness', String(Math.max(0,Math.min(100,parseInt(val,10)||52)))); }catch(e){}
  _cfgSideFxTouch();
};

window.cfgSetProCompAvatarSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-procomp-ava-pc')?.value||'52',10) || 52;
    const mb = parseInt(document.getElementById('cfg-procomp-ava-mb')?.value||'40',10) || 40;
    const fit = String(document.getElementById('cfg-procomp-ava-fit')?.value||'cover').trim();
    localStorage.setItem('su_procomp_avatar_pc', String(Math.max(28,Math.min(200,pc))));
    localStorage.setItem('su_procomp_avatar_mb', String(Math.max(24,Math.min(160,mb))));
    localStorage.setItem('su_procomp_avatar_fit', (fit==='contain'||fit==='cover'||fit==='fill') ? fit : 'cover');
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgSetProCompScoreSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-procomp-score-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-procomp-score-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_procomp_score_scale_pc', String(Math.max(60,Math.min(160,pc))));
    localStorage.setItem('su_procomp_score_scale_mb', String(Math.max(60,Math.min(160,mb))));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgSetProCompLayoutSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-procomp-layout-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-procomp-layout-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_procomp_layout_scale_pc', String(Math.max(60,Math.min(120,pc))));
    localStorage.setItem('su_procomp_layout_scale_mb', String(Math.max(60,Math.min(120,mb))));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

// 개인전/끝장전/프로리그끝장전 선수 패널(프로필 배경 카드) 설정
window.cfgSetH2HPanelSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-h2h-panel-pc')?.value||'150',10) || 150;
    const mb = parseInt(document.getElementById('cfg-h2h-panel-mb')?.value||'126',10) || 126;
    const fit = String(document.getElementById('cfg-h2h-panel-fit')?.value||'cover').trim();
    const wpc = parseInt(document.getElementById('cfg-h2h-w-pc')?.value||'105',10) || 105;
    const hpc = parseInt(document.getElementById('cfg-h2h-h-pc')?.value||'100',10) || 100;
    const wmb = parseInt(document.getElementById('cfg-h2h-w-mb')?.value||'100',10) || 100;
    const hmb = parseInt(document.getElementById('cfg-h2h-h-mb')?.value||'100',10) || 100;
    const gpc = parseInt(document.getElementById('cfg-h2h-gap-pc')?.value||'10',10);
    const gmb = parseInt(document.getElementById('cfg-h2h-gap-mb')?.value||'8',10);
    const spc = parseInt(document.getElementById('cfg-h2h-scorepad-pc')?.value||'10',10);
    const smb = parseInt(document.getElementById('cfg-h2h-scorepad-mb')?.value||'6',10);
    localStorage.setItem('su_h2h_panel_pc', String(Math.max(110,Math.min(230,pc))));
    localStorage.setItem('su_h2h_panel_mb', String(Math.max(96,Math.min(210,mb))));
    localStorage.setItem('su_h2h_panel_fit', (fit==='contain'||fit==='cover'||fit==='fill') ? fit : 'cover');
    // 10%까지 허용(요청사항) + 더 넓게(스코어 앞까지) 쓸 수 있게 최대 300%
    localStorage.setItem('su_h2h_panel_wmul_pc', String(Math.max(10,Math.min(300,wpc))));
    localStorage.setItem('su_h2h_panel_hmul_pc', String(Math.max(10,Math.min(300,hpc))));
    localStorage.setItem('su_h2h_panel_wmul_mb', String(Math.max(10,Math.min(300,wmb))));
    localStorage.setItem('su_h2h_panel_hmul_mb', String(Math.max(10,Math.min(300,hmb))));
    // 스코어 ↔ 선수패널 간격 + 스코어 좌우 여백
    localStorage.setItem('su_h2h_score_gap_pc', String(Math.max(0,Math.min(120,isNaN(gpc)?10:gpc))));
    localStorage.setItem('su_h2h_score_gap_mb', String(Math.max(0,Math.min(120,isNaN(gmb)?8:gmb))));
    localStorage.setItem('su_h2h_score_pad_pc', String(Math.max(0,Math.min(24,isNaN(spc)?10:spc))));
    localStorage.setItem('su_h2h_score_pad_mb', String(Math.max(0,Math.min(24,isNaN(smb)?6:smb))));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

// 개인/끝장전: 스트리머별 프로필 배경 위치(object-position) 저장
