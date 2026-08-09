/* ══════════════════════════════════════════════════════════════
   설정 - 메뉴(섹션) 로드/이름변경/렌더 중간 로직 (settings-base.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _cfgMenuLoad(){
  try{ return JSON.parse(localStorage.getItem(_CFG_MENU_KEY) || 'null'); }catch(e){ return null; }
}

// (요청) 설정 하위 메뉴(섹션) 이름 변경
function _cfgMenuLoadRenames(){
  try{ return JSON.parse(localStorage.getItem('su_cfg_sec_renames')||'{}')||{}; }catch(e){ return {}; }
}
function _cfgMenuSaveRenames(v){
  try{ localStorage.setItem('su_cfg_sec_renames', JSON.stringify(v||{})); }catch(e){}
}
window.cfgMenuRenameSec = function(secId){
  const titles = window._cfgSecTitle || {};
  const cur = _cfgMenuLoadRenames();
  const curName = cur[secId] || titles[secId] || secId;
  const nv = prompt('설정 메뉴 이름 변경', curName);
  if(nv===null) return;
  const s = String(nv||'').trim();
  if(!s){ delete cur[secId]; }
  else cur[secId]=s;
  _cfgMenuSaveRenames(cur);
  try{ render(); }catch(e){}
  // [FIX] "설정 메뉴 정리" 팝업이 열려 있는 상태에서 이름을 바꾸면,
  // render()가 #rcont는 새로 그려도 이미 팝업(모달)로 옮겨진 옛 DOM은
  // 그대로 남아 있어 팝업 화면에는 바뀐 이름이 반영되지 않던 문제 수정.
  try{ if(window._cfgModalSecId==='cfgmenu' && typeof window.cfgGo==='function') window.cfgGo('cfgmenu'); }catch(e){}
};
window.cfgMenuResetSecNames = function(){
  if(!confirm('설정 하위 메뉴 이름 변경을 모두 초기화할까요?')) return;
  _cfgMenuSaveRenames({});
  try{ render(); }catch(e){}
  try{ if(window._cfgModalSecId==='cfgmenu' && typeof window.cfgGo==='function') window.cfgGo('cfgmenu'); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 현황판/이미지별(프로필)/펨코현황: 모바일·태블릿 원클릭 자동 맞춤
// - 사용자가 기존 설정을 덮어써도 OK(원클릭 자동화)
// ─────────────────────────────────────────────────────────────
window.cfgAutoFitBoard = function(){
  const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
  const isMobile = w <= 768;
  const isTablet = w > 768 && w <= 1024;

  // 1) UI 스케일(글자/아이콘) — init.js 자동 스케일이 있으나, 즉시 반영을 위해 한 번 더 적용
  try{
    let s = 1;
    if (w <= 360) s = 0.92;
    else if (w <= 430) s = 0.96;
    else if (w <= 520) s = 0.98;
    else if (w <= 768) s = 1.00;
    else if (w <= 1024) s = 1.02;
    else s = 1.00;
    document.documentElement.style.setProperty('--uiS', String(s));
  }catch(e){}

  // 2) 이미지별(프로필) 레이아웃(su_b2_layout)
  try{
    const settings = {
      autoResize: true,
      autoHeight: true,
      leftSize: 55,
      rightSize: 45,
      pcHeight: 600,
      tabletHeight: isTablet ? 420 : 400,
      mobileHeight: isMobile ? 380 : 320
    };
    localStorage.setItem('su_b2_layout', JSON.stringify(settings));
    // 설정 UI 반영
    const setVal = (id, val) => { const el=document.getElementById(id); if(el) el.value = val; };
    setVal('cfg-b2-left-size', settings.leftSize);
    setVal('cfg-b2-right-size', settings.rightSize);
    setVal('cfg-b2-pc-height', settings.pcHeight);
    setVal('cfg-b2-tablet-height', settings.tabletHeight);
    setVal('cfg-b2-mobile-height', settings.mobileHeight);
    try{ document.getElementById('cfg-b2-left-size-val').textContent = settings.leftSize+'%'; }catch(e){}
    try{ document.getElementById('cfg-b2-right-size-val').textContent = settings.rightSize+'%'; }catch(e){}
    try{ const chk=document.getElementById('cfg-b2-auto-resize'); if(chk) chk.checked = true; }catch(e){}
  }catch(e){}

  // 3) 이미지별(프로필) 이미지 잘림 방지: 기기별 전역 이미지 설정(su_b2_global_img_settings)
  // - 현재 기기 설정이 없을 때만 기본값을 채움 (기존 사용자 설정 덮어쓰기 방지)
  try{
    const fit = (w <= 1024) ? 'contain' : 'cover';
    const dk = w <= 768 ? 'mb' : (w <= 1024 ? 'tb' : 'pc');
    const raw = (()=>{ try{ return JSON.parse(localStorage.getItem('su_b2_global_img_settings')||'{}')||{}; }catch(e){ return {}; } })();
    if(!raw.__byDevice || typeof raw.__byDevice!=='object') raw.__byDevice = {};
    if(!raw.__byDevice[dk] || typeof raw.__byDevice[dk] !== 'object') raw.__byDevice[dk] = {};
    if(!raw.__byDevice[dk].primary) raw.__byDevice[dk].primary = {scale:100, brightness:100, fit, offsetX:0, offsetY:0, zoom:100, fill:fit, posX:0, posY:0};
    if(!raw.__byDevice[dk].secondary) raw.__byDevice[dk].secondary = {scale:100, brightness:100, fit, offsetX:0, offsetY:0, zoom:100, fill:fit, posX:0, posY:0};
    localStorage.setItem('su_b2_global_img_settings', JSON.stringify(raw));
  }catch(e){}

  // 4) 펨코현황: 모바일/태블릿 프리셋
  try{
    const cur = _cfgFemcoLoad();
    const next = {...cur};
    if (w <= 1024){
      next.contentAlign = 'left';
      next.contentPadX = isMobile ? 10 : 12;
      next.contentOffsetX = 0;
      next.colWidth = isMobile ? 150 : 160;
      next.rowsPerCol = isMobile ? 8 : 7;      // 세로 줄 수 ↑ → 가로 스크롤 ↓
      next.playerImgSize = isMobile ? 40 : 44;
      next.colGap = isMobile ? 8 : 10;         // 상하 간격
      next.univGap = isMobile ? 12 : 16;        // 대학 간 여백
      next.countFontSize = isMobile ? 11 : 12;
      next.nameFontSize = isMobile ? 11 : 12;
      next.roleFontSize = isMobile ? 9 : 10;
      next.statusIconSize = isMobile ? 16 : 18;
      next.starSize = isMobile ? 14 : 15;
      next.headGap = isMobile ? 6 : 10;
    }
    _cfgFemcoSave(next);
    try{ if(typeof cfgFemcoInit==='function') cfgFemcoInit(); }catch(e){}
  }catch(e){}

  // 5) 즉시 반영
  try{ if(typeof save==='function') save(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  try{
    // board2 탭이 열려있으면 다시 렌더링
    if(typeof _b2View !== 'undefined' && document.getElementById('b2-content')) {
      if(_b2View==='players') {
        document.getElementById('b2-content').innerHTML = _b2PlayersView();
        if(typeof _b2UpdateMainDisplay==='function' && typeof _b2SelectedPlayer !== 'undefined' && _b2SelectedPlayer) _b2UpdateMainDisplay(_b2SelectedPlayer.name);
      } else if(_b2View==='femco'){
        document.getElementById('b2-content').innerHTML = _b2FemcoView();
        try{ injectUnivIcons(document.getElementById('b2-content')); }catch(e){}
      }
    }
  }catch(e){}

  alert('✅ 브라우저 맞춤 자동 적용 완료');
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 모든 탭 공통: 모바일/태블릿 레이아웃 자동 맞춤(전역)
// - B 옵션: 화면 크기 + 레이아웃(그리드/간격)까지 자동
// ─────────────────────────────────────────────────────────────
const _AF_ALLTABS_KEY = 'su_af_alltabs_v1';
window.cfgSetAutoFitAllTabs = function(on){
  try{ localStorage.setItem(_AF_ALLTABS_KEY, on ? '1' : '0'); }catch(e){}
  try{ if(typeof window._applyAllTabsAutoFit === 'function') window._applyAllTabsAutoFit(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// [FIX-RECCARD-SHAPE] 기록 카드 "모양" 설정 — 예전엔 이 함수 자체가 없어서
// 카드 모양 버튼(약 50가지)을 눌러도 아무 반응이 없었습니다.
// CSS는 이미 `body.rc-shape--{name}` 클래스 기준으로 다 구현되어 있어서
// 여기서는 localStorage 저장 + body 클래스 갱신만 해주면 됩니다.
// ─────────────────────────────────────────────────────────────
window.cfgSetRecCardShape = function(shape){
  try{
    const v = String(shape||'default').trim() || 'default';
    localStorage.setItem('su_rc_card_shape', v);
    if(document.body){
      const toRemove=[];
      document.body.classList.forEach(c=>{ if(c.indexOf('rc-shape--')===0) toRemove.push(c); });
      toRemove.forEach(c=>document.body.classList.remove(c));
      if(v!=='default') document.body.classList.add('rc-shape--'+v);
    }
  }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드 테마/밝기/아이콘/메모 설정
// ─────────────────────────────────────────────────────────────
window.cfgSetRecCardSettings = function(){
  const on = !!document.getElementById('cfg-rc-theme-on')?.checked;
  const accent = (document.getElementById('cfg-rc-accent')?.value || 'none').trim();
  const bg = parseInt(document.getElementById('cfg-rc-bg')?.value||'12',10);
  const hd = parseInt(document.getElementById('cfg-rc-hd')?.value||'14',10);
  const ic = parseInt(document.getElementById('cfg-rc-uicon')?.value||'18',10);
  const icScopeOff = !!document.getElementById('cfg-rc-uicon-scope-off')?.checked;
  const icScope = parseInt(document.getElementById('cfg-rc-uicon-scope')?.value||String(ic),10);
  const univFontPct = parseInt(document.getElementById('cfg-rc-univ-font')?.value||'100',10);
  const ymScalePct = parseInt(document.getElementById('cfg-ym-scale')?.value||'100',10);
  const memoOn = !!document.getElementById('cfg-rc-memo-on')?.checked;
  const ava = parseInt(document.getElementById('cfg-ava-scale')?.value||'100',10);
  const vsAlign = (document.getElementById('cfg-rc-vs-align')?.value || 'center').trim(); // left|center|right
  const scScale = parseInt(document.getElementById('cfg-rc-score-scale')?.value||'88',10);
  const lpcEl = document.getElementById('cfg-rc-layout-pc');
  const lmbEl = document.getElementById('cfg-rc-layout-mb');
  const ckA = (document.getElementById('cfg-team-ck-a')?.value || '#2563eb').trim();
  const ckB = (document.getElementById('cfg-team-ck-b')?.value || '#d97706').trim();
  const proA = (document.getElementById('cfg-team-pro-a')?.value || '#0f766e').trim();
  const proB = (document.getElementById('cfg-team-pro-b')?.value || '#4f46e5').trim();
  const _hex = v => /^#[0-9a-fA-F]{6}$/.test(String(v||'').trim()) ? String(v).trim() : '';

  try{ localStorage.setItem('su_rc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_rc_accent_mode', ['none','header','border','full','gradient'].includes(accent)?accent:'none'); }catch(e){}
  try{ localStorage.setItem('su_rc_bg_alpha', String(Math.max(0,Math.min(30,bg)))); }catch(e){}
  try{ localStorage.setItem('su_rc_hd_alpha', String(Math.max(0,Math.min(30,hd)))); }catch(e){}
  try{ localStorage.setItem('su_rc_uicon', String(Math.max(12,Math.min(34,ic)))); }catch(e){}
  try{ localStorage.setItem('su_rc_uicon_scope_off', icScopeOff ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_rc_uicon_scope_size', String(Math.max(12,Math.min(34,icScope||ic)))); }catch(e){}
  try{ localStorage.setItem('su_rc_univ_font_pct', String(Math.max(90,Math.min(150,univFontPct||100)))); }catch(e){}
  try{ localStorage.setItem('su_ym_scale_pct', String(Math.max(80,Math.min(140,ymScalePct||100)))); }catch(e){}
  try{ localStorage.setItem('su_rc_memo_on', memoOn ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_avatar_scale', String(Math.max(70,Math.min(160,ava))/100)); }catch(e){}
  try{ localStorage.setItem('su_rc_vs_align', ['left','center','right'].includes(vsAlign)?vsAlign:'center'); }catch(e){}
  try{ localStorage.setItem('su_rc_score_scale', String(Math.max(50,Math.min(130,scScale)))); }catch(e){}
  try{
    if(lpcEl){
      const v = parseInt(lpcEl.value||'100',10) || 100;
      localStorage.setItem('su_rc_layout_scale_pc', String(Math.max(60,Math.min(120,v))));
    }
    if(lmbEl){
      const v = parseInt(lmbEl.value||'100',10) || 100;
      localStorage.setItem('su_rc_layout_scale_mb', String(Math.max(60,Math.min(120,v))));
    }
  }catch(e){}
  try{ if(_hex(ckA)) localStorage.setItem('su_team_color_ck_a', _hex(ckA)); }catch(e){}
  try{ if(_hex(ckB)) localStorage.setItem('su_team_color_ck_b', _hex(ckB)); }catch(e){}
  try{ if(_hex(proA)) localStorage.setItem('su_team_color_pro_a', _hex(proA)); }catch(e){}
  try{ if(_hex(proB)) localStorage.setItem('su_team_color_pro_b', _hex(proB)); }catch(e){}
  try{
    const rcAvaSize = parseInt(document.getElementById('cfg-rc-avatar-size')?.value||'38',10);
    localStorage.setItem('su_rec_avatar_size', String(Math.max(20,Math.min(80,rcAvaSize))));
  }catch(e){}
  try{
    const rcAvaFit = document.getElementById('cfg-rc-avatar-fit')?.value || 'contain';
    localStorage.setItem('su_rec_avatar_fit', ['contain','cover'].includes(rcAvaFit)?rcAvaFit:'contain');
  }catch(e){}
  try{ if(typeof window.cfgSyncTeamColorPreview==='function') window.cfgSyncTeamColorPreview(); }catch(e){}

  // 즉시 반영 (init.js 미로드/순서 이슈 대비: 여기서도 직접 적용)
  try{
    const _bg=Math.max(0,Math.min(30,bg));
    const _hd=Math.max(0,Math.min(30,hd));
    const _ic=Math.max(12,Math.min(34,ic));
    const _uf=Math.max(90,Math.min(150,univFontPct||100));
    const _ys=Math.max(80,Math.min(140,ymScalePct||100));
    const _accent=['none','header','border','full','gradient'].includes(accent)?accent:'none';
    const _va=['left','center','right'].includes(vsAlign)?vsAlign:'left';
    const _ss=Math.max(50,Math.min(130,scScale||88));
    const _vsJust=(_va==='center')?'center':(_va==='right')?'flex-end':'flex-start';
    if(document.body){
      document.body.classList.toggle('rc-theme-on', !!on);
      document.body.classList.toggle('rc-accent-header', !!on && _accent==='header');
      document.body.classList.toggle('rc-accent-border', !!on && _accent==='border');
      document.body.classList.toggle('rc-accent-full', !!on && _accent==='full');
      document.body.classList.toggle('rc-accent-gradient', !!on && _accent==='gradient');
      document.body.classList.toggle('rc-uicon-scope-off', !!icScopeOff);
    }
    document.documentElement.style.setProperty('--rc-bg-a', String(_bg/100));
    document.documentElement.style.setProperty('--rc-hd-a', String(_hd/100));
    document.documentElement.style.setProperty('--rc-uicon', _ic+'px');
    document.documentElement.style.setProperty('--rc-uicon-scope', Math.max(12,Math.min(34,icScope||_ic))+'px');
    document.documentElement.style.setProperty('--rc-univ-font-scale', String(_uf/100));
    document.documentElement.style.setProperty('--ym-scale', String(_ys/100));
    document.documentElement.style.setProperty('--rc-memo-on', memoOn?'1':'0');
    document.documentElement.style.setProperty('--rc-vs-justify', _vsJust);
    document.documentElement.style.setProperty('--rc-score-scale', String(_ss/100));
  }catch(e){}
  try{ if(typeof window._applyRecCardTheme === 'function') window._applyRecCardTheme(); }catch(e){}
  try{ window.applyRecLayoutScale && window.applyRecLayoutScale(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

window.applyRecLayoutScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_rc_layout_scale_mb' : 'su_rc_layout_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || '100', 10);
    const v = Math.max(60, Math.min(120, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--rc-layout-scale', String(v));
  }catch(e){}
};
try{
  if(!window._recLayoutScaleBound){
    window._recLayoutScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyRecLayoutScale && window.applyRecLayoutScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 미니대전/대학대전/대학CK/티어대회/프로리그/대회: 대학(팀) 버튼 크기(참여자 버튼은 유지)
// - CSS 변수: --rc-match-btn-scale
// - localStorage: su_match_btn_scale_pc, su_match_btn_scale_mb  (단위: %)
// ─────────────────────────────────────────────────────────────
window.applyMatchBtnScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_match_btn_scale_mb' : 'su_match_btn_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || (isMobile?'100':'100'), 10);
    const v = Math.max(40, Math.min(220, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--rc-match-btn-scale', String(v));
  }catch(e){}
};
window.cfgSetMatchBtnScaleSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-mbtn-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-mbtn-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_match_btn_scale_pc', String(Math.max(40,Math.min(220,pc))));
    localStorage.setItem('su_match_btn_scale_mb', String(Math.max(40,Math.min(220,mb))));
  }catch(e){}
  try{ window.applyMatchBtnScale && window.applyMatchBtnScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._matchBtnScaleBound){
    window._matchBtnScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyMatchBtnScale && window.applyMatchBtnScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드 참가자(👥) 버튼 크기(미니/시빌워/대학대전/대학CK/티어대회/프로리그/대회 등 기록탭)
// - CSS 변수: --rc-mem-btn-scale
// - localStorage: su_rc_mem_btn_scale_pc, su_rc_mem_btn_scale_mb (단위:%)
// ─────────────────────────────────────────────────────────────
window.applyRecMemBtnScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_rc_mem_btn_scale_mb' : 'su_rc_mem_btn_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || '100', 10);
    const v = Math.max(40, Math.min(240, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--rc-mem-btn-scale', String(v));
  }catch(e){}
};
window.cfgSetRecMemBtnScaleSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-rc-mem-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-rc-mem-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_rc_mem_btn_scale_pc', String(Math.max(40,Math.min(240,pc))));
    localStorage.setItem('su_rc_mem_btn_scale_mb', String(Math.max(40,Math.min(240,mb))));
  }catch(e){}
  try{ window.applyRecMemBtnScale && window.applyRecMemBtnScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._rcMemBtnScaleBound){
    window._rcMemBtnScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyRecMemBtnScale && window.applyRecMemBtnScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드: 스코어 ↔ 대학 버튼 간격
// - CSS 변수: --rc-vs-gap (px)
// - localStorage: su_rc_vs_gap_pc, su_rc_vs_gap_mb (단위:px)
// ─────────────────────────────────────────────────────────────
window.applyRecVsGap = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_rc_vs_gap_mb' : 'su_rc_vs_gap_pc';
    const px = parseInt(localStorage.getItem(key) || (isMobile?'8':'12'), 10);
    const v = Math.max(0, Math.min(120, isNaN(px)?(isMobile?8:12):px));
    document.documentElement.style.setProperty('--rc-vs-gap', v+'px');
  }catch(e){}
};
window.cfgSetRecVsGapSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-rc-gap-pc')?.value||'12',10);
    const mb = parseInt(document.getElementById('cfg-rc-gap-mb')?.value||'8',10);
    localStorage.setItem('su_rc_vs_gap_pc', String(Math.max(0,Math.min(120,isNaN(pc)?12:pc))));
    localStorage.setItem('su_rc_vs_gap_mb', String(Math.max(0,Math.min(120,isNaN(mb)?8:mb))));
  }catch(e){}
  try{ window.applyRecVsGap && window.applyRecVsGap(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._rcVsGapBound){
    window._rcVsGapBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyRecVsGap && window.applyRecVsGap(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭(조별/토너) 대학(팀) 버튼 크기
// - CSS 변수: --tc-team-btn-scale
// - localStorage: su_tc_team_btn_scale_pc, su_tc_team_btn_scale_mb  (단위: %)
// ─────────────────────────────────────────────────────────────
window.applyTourneyTeamBtnScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_tc_team_btn_scale_mb' : 'su_tc_team_btn_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || '100', 10);
    // 아주 작게~아주 크게
    const v = Math.max(40, Math.min(220, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--tc-team-btn-scale', String(v));
  }catch(e){}
};
window.cfgSetTourneyTeamBtnScaleSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tc-team-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-tc-team-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_tc_team_btn_scale_pc', String(Math.max(40,Math.min(220,pc))));
    localStorage.setItem('su_tc_team_btn_scale_mb', String(Math.max(40,Math.min(220,mb))));
  }catch(e){}
  try{ window.applyTourneyTeamBtnScale && window.applyTourneyTeamBtnScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._tcTeamBtnScaleBound){
    window._tcTeamBtnScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTourneyTeamBtnScale && window.applyTourneyTeamBtnScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 대학 버튼: 폰트/로고 아이콘 크기 개별 조절
// - CSS 변수: --tc-team-font-scale, --tc-team-icon-scale
// - localStorage: su_tc_team_font_scale_pc/mb, su_tc_team_icon_scale_pc/mb (단위:%)
// ─────────────────────────────────────────────────────────────
window.applyTourneyTeamBtnDetailScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const fKey = isMobile ? 'su_tc_team_font_scale_mb' : 'su_tc_team_font_scale_pc';
    const iKey = isMobile ? 'su_tc_team_icon_scale_mb' : 'su_tc_team_icon_scale_pc';
    const fp = parseInt(localStorage.getItem(fKey) || '100', 10);
    const ip = parseInt(localStorage.getItem(iKey) || '100', 10);
    const fv = Math.max(40, Math.min(240, isNaN(fp)?100:fp)) / 100;
    const iv = Math.max(40, Math.min(240, isNaN(ip)?100:ip)) / 100;
    document.documentElement.style.setProperty('--tc-team-font-scale', String(fv));
    document.documentElement.style.setProperty('--tc-team-icon-scale', String(iv));
  }catch(e){}
};
window.cfgSetTourneyTeamBtnDetailScaleSettings = function(){
  try{
    const fpc = parseInt(document.getElementById('cfg-tc-team-font-pc')?.value||'100',10) || 100;
    const fmb = parseInt(document.getElementById('cfg-tc-team-font-mb')?.value||'100',10) || 100;
    const ipc = parseInt(document.getElementById('cfg-tc-team-ico-pc')?.value||'100',10) || 100;
    const imb = parseInt(document.getElementById('cfg-tc-team-ico-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_tc_team_font_scale_pc', String(Math.max(40,Math.min(240,fpc))));
    localStorage.setItem('su_tc_team_font_scale_mb', String(Math.max(40,Math.min(240,fmb))));
    localStorage.setItem('su_tc_team_icon_scale_pc', String(Math.max(40,Math.min(240,ipc))));
    localStorage.setItem('su_tc_team_icon_scale_mb', String(Math.max(40,Math.min(240,imb))));
  }catch(e){}
  try{ window.applyTourneyTeamBtnDetailScale && window.applyTourneyTeamBtnDetailScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._tcTeamBtnDetailScaleBound){
    window._tcTeamBtnDetailScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTourneyTeamBtnDetailScale && window.applyTourneyTeamBtnDetailScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 참가자(👥) 버튼 크기 조절
// - CSS 변수: --tc-mem-btn-scale
// - localStorage: su_tc_mem_btn_scale_pc/mb (단위:%)
// ─────────────────────────────────────────────────────────────
window.applyTourneyMemBtnScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_tc_mem_btn_scale_mb' : 'su_tc_mem_btn_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || '100', 10);
    const v = Math.max(40, Math.min(240, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--tc-mem-btn-scale', String(v));
  }catch(e){}
};
window.cfgSetTourneyMemBtnScaleSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tc-mem-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-tc-mem-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_tc_mem_btn_scale_pc', String(Math.max(40,Math.min(240,pc))));
    localStorage.setItem('su_tc_mem_btn_scale_mb', String(Math.max(40,Math.min(240,mb))));
  }catch(e){}
  try{ window.applyTourneyMemBtnScale && window.applyTourneyMemBtnScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._tcMemBtnScaleBound){
    window._tcMemBtnScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTourneyMemBtnScale && window.applyTourneyMemBtnScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭(조별/토너) 스코어 ↔ 대학 버튼 간격
// - CSS 변수: --tc-vs-gap (px)
// - localStorage: su_tc_vs_gap_pc, su_tc_vs_gap_mb (단위:px)
// ─────────────────────────────────────────────────────────────
window.applyTourneyVsGap = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_tc_vs_gap_mb' : 'su_tc_vs_gap_pc';
    const px = parseInt(localStorage.getItem(key) || (isMobile?'8':'12'), 10);
    const v = Math.max(0, Math.min(120, isNaN(px)?(isMobile?8:12):px));
    document.documentElement.style.setProperty('--tc-vs-gap', v+'px');
  }catch(e){}
};
window.cfgSetTourneyVsGapSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tc-gap-pc')?.value||'12',10);
    const mb = parseInt(document.getElementById('cfg-tc-gap-mb')?.value||'8',10);
    localStorage.setItem('su_tc_vs_gap_pc', String(Math.max(0,Math.min(120,isNaN(pc)?12:pc))));
    localStorage.setItem('su_tc_vs_gap_mb', String(Math.max(0,Math.min(120,isNaN(mb)?8:mb))));
  }catch(e){}
  try{ window.applyTourneyVsGap && window.applyTourneyVsGap(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.applyStreamerCardGap = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_streamer_card_gap_mb' : 'su_streamer_card_gap_pc';
    const def = isMobile ? 9 : 13;
    const px = parseInt(localStorage.getItem(key) || String(def), 10);
    const v = Math.max(4, Math.min(80, isNaN(px) ? def : px));
    document.documentElement.style.setProperty('--su-streamer-card-gap', v+'px');
  }catch(e){}
};
window.cfgSetStreamerCardGapSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-streamer-gap-pc')?.value||'13',10);
    const mb = parseInt(document.getElementById('cfg-streamer-gap-mb')?.value||'9',10);
    localStorage.setItem('su_streamer_card_gap_pc', String(Math.max(4,Math.min(80,isNaN(pc)?13:pc))));
    localStorage.setItem('su_streamer_card_gap_mb', String(Math.max(4,Math.min(80,isNaN(mb)?9:mb))));
  }catch(e){}
  try{ window.applyStreamerCardGap && window.applyStreamerCardGap(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._streamerCardGapBound){
    window._streamerCardGapBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyStreamerCardGap && window.applyStreamerCardGap(); }catch(e){} }, {passive:true});
  }
}catch(e){}

window.applyTierCardGap = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_tier_card_gap_mb' : 'su_tier_card_gap_pc';
    const def = isMobile ? 18 : 26;
    const px = parseInt(localStorage.getItem(key) || String(def), 10);
    const v = Math.max(10, Math.min(80, isNaN(px) ? def : px));
    document.documentElement.style.setProperty('--su-tier-card-gap', v+'px');
  }catch(e){}
};
window.cfgSetTierCardGapSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tier-gap-pc')?.value||'26',10);
    const mb = parseInt(document.getElementById('cfg-tier-gap-mb')?.value||'18',10);
    localStorage.setItem('su_tier_card_gap_pc', String(Math.max(10,Math.min(80,isNaN(pc)?26:pc))));
    localStorage.setItem('su_tier_card_gap_mb', String(Math.max(10,Math.min(80,isNaN(mb)?18:mb))));
  }catch(e){}
  try{ window.applyTierCardGap && window.applyTierCardGap(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._tierCardGapBound){
    window._tierCardGapBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTierCardGap && window.applyTierCardGap(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// 대회탭 스코어 크기 설정 (TC Score Scale)
window.cfgSetTcScoreScale = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tc-score-pc')?.value||'82',10);
    const mb = parseInt(document.getElementById('cfg-tc-score-mb')?.value||'75',10);
    localStorage.setItem('su_tc_score_scale_pc', String(Math.max(50,Math.min(150,pc))));
    localStorage.setItem('su_tc_score_scale_mb', String(Math.max(50,Math.min(150,mb))));
    const isMb = window.innerWidth <= 768;
    const val = isMb ? Math.max(50,Math.min(150,mb)) : Math.max(50,Math.min(150,pc));
    document.documentElement.style.setProperty('--tc-score-scale', String(val/100));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window._applyTcScoreScale = function(){
  try{
    const isMb = window.innerWidth <= 768;
    const pcV = parseInt(localStorage.getItem('su_tc_score_scale_pc')||'82',10);
    const mbV = parseInt(localStorage.getItem('su_tc_score_scale_mb')||'75',10);
    const val = isMb ? Math.max(50,Math.min(150,mbV)) : Math.max(50,Math.min(150,pcV));
    document.documentElement.style.setProperty('--tc-score-scale', String(val/100));
  }catch(e){}
};

try{
  if(!window._tcVsGapBound){
    window._tcVsGapBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTourneyVsGap && window.applyTourneyVsGap(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 스코어 숫자 색상(승/패) 공통 설정
// - CSS 변수: --score-win/--score-lose (+ 그라데이션 상단색은 자동 생성)
// - localStorage: su_score_win, su_score_lose (hex)
// ─────────────────────────────────────────────────────────────
