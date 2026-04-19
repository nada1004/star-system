/* ══════════════════════════════════════
   ⚙️ settings.js — 설정 탭 전용
   tier-tour.js에서 분리됨. 이 파일의 버그가 티어대회 탭에 영향을 주지 않습니다.
══════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// HTML escape (설정 화면 템플릿 문자열 안전 처리)
// ─────────────────────────────────────────────────────────────
function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

/* ══════════════════════════════════════

/* ══════════════════════════════════════
   ⚙️ 설정 섹션 접힘 상태 영속 헬퍼
══════════════════════════════════════ */
// ⚠️ tier-tour.js에도 _cfgOpen/_cfgToggle/_cfgD가 존재해서 전역이 덮어써지는 문제가 있음.
// settings.js는 고유 접두사(_scfg*)를 사용해 충돌을 원천 차단한다.
function _scfgOpen(id){try{return !!(JSON.parse(localStorage.getItem('su_cfg_open')||'{}')[id]);}catch(e){return false;}}
function _scfgToggle(id,el){
  try{
    // 아코디언: 하나 열리면 나머지는 닫기
    if(el && el.open){
      document.querySelectorAll('[data-cfg-sec]').forEach(d=>{
        if(d!==el && d.tagName==='DETAILS') d.open=false;
      });
    }
  }catch(e){}
  try{
    const o=JSON.parse(localStorage.getItem('su_cfg_open')||'{}');
    o[id]=el.open;
    localStorage.setItem('su_cfg_open',JSON.stringify(o));
    const sp=el.querySelector('summary .cfg-toggle-txt');
    if(sp)sp.textContent=el.open?'▴ 접기':'▾ 펼치기';
  }catch(e){}
  // (요청사항) 특정 섹션은 열릴 때 동적 렌더링
  try{
    if(el && el.open && id==='pd' && typeof window._renderCfgPdSection==='function'){
      window._renderCfgPdSection();
    }
  }catch(e){}
}
// ─────────────────────────────────────────────────────────────
// 설정 메뉴 구성(사용자 정리 지원)
// - 카테고리 이동 + 순서 변경을 localStorage로 저장
// ─────────────────────────────────────────────────────────────
const _CFG_MENU_KEY = 'su_cfg_menu_layout_v1';

const _DEFAULT_CATSECS = {
  '게임 운영':['notice','tier','season','teammatch','acct'],
  '콘텐츠 관리':['univ','maps','mAlias','si','paste'],
  // (요청사항) 현황판 관리 메뉴 분리
  '현황판 관리':['b2layout','b2femco','boardchip','oldbright','boardbg'],
  '이미지 관리':['imgsettings','imgmodalsettings'],
  // (요청사항) 설정탭 하위 메뉴 2개 추가(프리셋 중심)
  '🎨 스타일/테마':['appfont','reccard','tourneycard','calui','pd'],
  '🧪 고급/실험실':['cfgmenu','autofitall','fab','storage','selfcheck'],
  '데이터 관리':['sync','firebase','bulkdate','bulkmap','bulktier','bulkdel','bulkconv']
};
const _cfgAllSecs=[...new Set(Object.values(_DEFAULT_CATSECS).flat())];

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
};
window.cfgMenuResetSecNames = function(){
  if(!confirm('설정 하위 메뉴 이름 변경을 모두 초기화할까요?')) return;
  _cfgMenuSaveRenames({});
  try{ render(); }catch(e){}
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

  // 3) 이미지별(프로필) 이미지 잘림 방지: 전역 이미지 설정(su_b2_global_img_settings)
  // - 모바일/태블릿에서는 contain + 100% + 중심으로 초기화
  try{
    const fit = (w <= 1024) ? 'contain' : 'cover';
    const cfg = {
      primary: {scale:100, brightness:100, fit, offsetX:0, offsetY:0, zoom:100, fill:fit, posX:0, posY:0},
      secondary: {scale:100, brightness:100, fit, offsetX:0, offsetY:0, zoom:100, fill:fit, posX:0, posY:0},
    };
    localStorage.setItem('su_b2_global_img_settings', JSON.stringify(cfg));
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
// (요청사항) 기록 카드 테마/밝기/아이콘/메모 설정
// ─────────────────────────────────────────────────────────────
window.cfgSetRecCardSettings = function(){
  const on = !!document.getElementById('cfg-rc-theme-on')?.checked;
  const accent = (document.getElementById('cfg-rc-accent')?.value || 'none').trim();
  const bg = parseInt(document.getElementById('cfg-rc-bg')?.value||'12',10);
  const hd = parseInt(document.getElementById('cfg-rc-hd')?.value||'14',10);
  const ic = parseInt(document.getElementById('cfg-rc-uicon')?.value||'18',10);
  const memoOn = !!document.getElementById('cfg-rc-memo-on')?.checked;
  const ava = parseInt(document.getElementById('cfg-ava-scale')?.value||'100',10);
  const vsAlign = (document.getElementById('cfg-rc-vs-align')?.value || 'left').trim(); // left|center|right
  const scScale = parseInt(document.getElementById('cfg-rc-score-scale')?.value||'100',10);

  try{ localStorage.setItem('su_rc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_rc_accent_mode', ['none','header','border','full','gradient'].includes(accent)?accent:'none'); }catch(e){}
  try{ localStorage.setItem('su_rc_bg_alpha', String(Math.max(0,Math.min(30,bg)))); }catch(e){}
  try{ localStorage.setItem('su_rc_hd_alpha', String(Math.max(0,Math.min(30,hd)))); }catch(e){}
  try{ localStorage.setItem('su_rc_uicon', String(Math.max(12,Math.min(28,ic)))); }catch(e){}
  try{ localStorage.setItem('su_rc_memo_on', memoOn ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_avatar_scale', String(Math.max(70,Math.min(160,ava))/100)); }catch(e){}
  try{ localStorage.setItem('su_rc_vs_align', ['left','center','right'].includes(vsAlign)?vsAlign:'left'); }catch(e){}
  try{ localStorage.setItem('su_rc_score_scale', String(Math.max(80,Math.min(130,scScale)))); }catch(e){}

  // 즉시 반영
  try{ if(typeof window._applyRecCardTheme === 'function') window._applyRecCardTheme(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 카드(조별리그 일정 등) 전용 디자인 3안
// ─────────────────────────────────────────────────────────────
window.cfgSetTourneyCardSettings = function(){
  const on = !!document.getElementById('cfg-tc-theme-on')?.checked;
  const accent = (document.getElementById('cfg-tc-accent')?.value || 'none').trim();
  const hd = parseInt(document.getElementById('cfg-tc-hd')?.value||'12',10);
  const bw = parseInt(document.getElementById('cfg-tc-bw')?.value||'4',10);
  const ic = parseInt(document.getElementById('cfg-tc-uicon')?.value||'34',10);
  const lw = parseInt(document.getElementById('cfg-tc-line-w')?.value||'2',10);
  const la = parseInt(document.getElementById('cfg-tc-line-a')?.value||'70',10);

  try{ localStorage.setItem('su_tc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_tc_accent_mode', ['none','header','border'].includes(accent)?accent:'none'); }catch(e){}
  try{ localStorage.setItem('su_tc_hd_alpha', String(Math.max(0,Math.min(30,hd)))); }catch(e){}
  try{ localStorage.setItem('su_tc_border_w', String(Math.max(2,Math.min(6,bw)))); }catch(e){}
  try{ localStorage.setItem('su_tc_uicon', String(Math.max(24,Math.min(48,ic)))); }catch(e){}
  try{ localStorage.setItem('su_tc_line_w', String(Math.max(1,Math.min(4,lw)))); }catch(e){}
  try{ localStorage.setItem('su_tc_line_a', String(Math.max(25,Math.min(100,la)))); }catch(e){}

  try{ if(typeof window._applyTourneyCardTheme === 'function') window._applyTourneyCardTheme(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 토너먼트 대진표/브라켓 디자인 프리셋
// - 기존 슬라이더(선두께/진하기/테두리/로고크기 등)에 값을 "한 번에" 채워줌
// - 실제 저장/적용은 cfgSetTourneyCardSettings()가 수행
// ─────────────────────────────────────────────────────────────
window.cfgApplyBracketPreset = function(preset){
  const p = (preset || '').trim();
  const presets = {
    '기본':      {on:true, accent:'none',  hd:12, bw:4, ic:34, lw:2, la:70},
    '월드컵':    {on:true, accent:'header',hd:18, bw:5, ic:42, lw:3, la:85},
    '프로리그':  {on:true, accent:'border',hd:10, bw:6, ic:38, lw:2, la:78},
    '컴팩트':    {on:true, accent:'none',  hd:8,  bw:3, ic:30, lw:1, la:65},
    '미니멀':    {on:true, accent:'none',  hd:0,  bw:1, ic:32, lw:1, la:40},
    '다크리그':  {on:true, accent:'border',hd:16, bw:6, ic:40, lw:3, la:90},
  };
  const v = presets[p] || presets['기본'];
  const set = (id, val) => { const el=document.getElementById(id); if(el){ el.value = String(val); el.dispatchEvent(new Event('input')); } };
  try{
    const chk=document.getElementById('cfg-tc-theme-on'); if(chk) chk.checked = !!v.on;
    const sel=document.getElementById('cfg-tc-accent'); if(sel) sel.value = v.accent;
    set('cfg-tc-hd', v.hd); set('cfg-tc-bw', v.bw); set('cfg-tc-uicon', v.ic); set('cfg-tc-line-w', v.lw); set('cfg-tc-line-a', v.la);
    // 숫자 박스 동기화(있는 경우)
    const syncNum = (rangeId, numSpanId, suf='') => {
      const r=document.getElementById(rangeId); const s=document.getElementById(numSpanId);
      if(r && s) s.textContent = r.value + suf;
    };
    syncNum('cfg-tc-hd','cfg-tc-hd-v','%');
    syncNum('cfg-tc-bw','cfg-tc-bw-v','px');
    syncNum('cfg-tc-uicon','cfg-tc-ic-v','px');
    syncNum('cfg-tc-line-w','cfg-tc-lw-v','px');
    syncNum('cfg-tc-line-a','cfg-tc-la-v','%');
  }catch(e){}
  try{ window.cfgSetTourneyCardSettings && window.cfgSetTourneyCardSettings(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 캘린더 요약칩/공유 버튼 구성
// ─────────────────────────────────────────────────────────────
window.cfgSetCalendarUiSettings = function(){
  const chipMode = (document.getElementById('cfg-cal-chip')?.value || 'types').trim(); // total | types
  const shareAdminOnly = !!document.getElementById('cfg-share-adminonly')?.checked;
  try{ localStorage.setItem('su_cal_chip_mode', (chipMode==='total'?'total':'types')); }catch(e){}
  try{ localStorage.setItem('su_share_admin_only', shareAdminOnly ? '1' : '0'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 날짜 버튼 메뉴(대회/프로리그 일정) 디자인 모드
// - ASL 스케줄 페이지처럼 날짜 탭 형태 + 미니 매치업 프리뷰
// ─────────────────────────────────────────────────────────────
window.cfgSetDateMenuStyle = function(){
  const v = (document.getElementById('cfg-date-menu-style')?.value || 'pill').trim(); // pill | asl
  try{ localStorage.setItem('su_date_menu_style', v==='asl' ? 'asl' : 'pill'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 헤더 커스텀(제목/좌측 아이콘/우측 이미지/배경 이미지/높이)
// ─────────────────────────────────────────────────────────────
window.cfgSetHeaderSettings = function(){
  const title = (document.getElementById('cfg-hdr-title')?.value || '').trim();
  const lIco  = (document.getElementById('cfg-hdr-left')?.value || '').trim();
  const lSz   = parseInt(document.getElementById('cfg-hdr-left-sz')?.value || '22',10) || 22;
  const rImg  = (document.getElementById('cfg-hdr-right')?.value || '').trim();
  const rSz   = parseInt(document.getElementById('cfg-hdr-right-sz')?.value || '32',10) || 32;
  const bgImg = (document.getElementById('cfg-hdr-bg')?.value || '').trim();
  const hH    = parseInt(document.getElementById('cfg-hdr-h')?.value || '0',10) || 0;
  try{ localStorage.setItem('su_hdr_title', title); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_icon', lIco); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_size', String(Math.max(14,Math.min(44,lSz)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_img', rImg); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_size', String(Math.max(18,Math.min(70,rSz)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_bg_img', bgImg); }catch(e){}
  try{ localStorage.setItem('su_hdr_height', String(Math.max(0,Math.min(140,hH)))); }catch(e){}
  try{ if(typeof window._applyHeaderSettings === 'function') window._applyHeaderSettings(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 설정 동기화: 다른 기기/모바일/태블릿에 적용할 수 있도록 내보내기/가져오기(코드)
// - 데이터(경기 기록)는 포함하지 않고 "설정(localStorage)"만 대상
// ─────────────────────────────────────────────────────────────
window.cfgExportSettingsCode = function(){
  const out = {};
  try{
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(!k) continue;
      if(/^su_/.test(k) || /^cfg_/.test(k)){
        out[k] = localStorage.getItem(k);
      }
    }
  }catch(e){}
  try{
    // LZString은 index.html에 포함되어 있음
    return LZString.compressToBase64(JSON.stringify(out));
  }catch(e){
    return '';
  }
};
window.cfgFillSettingsCode = function(){
  const ta = document.getElementById('cfg-sync-code');
  if(!ta) return;
  const code = window.cfgExportSettingsCode();
  ta.value = code || '';
  try{ ta.focus(); ta.select(); }catch(e){}
};
window.cfgCopySettingsCode = async function(){
  const ta = document.getElementById('cfg-sync-code');
  if(!ta) return;
  try{
    await navigator.clipboard.writeText(ta.value||'');
    alert('복사됨');
  }catch(e){
    alert('복사 실패: 브라우저 권한 문제일 수 있어요.');
  }
};
window.cfgImportSettingsCode = function(){
  const ta = document.getElementById('cfg-sync-code');
  if(!ta) return;
  const code = String(ta.value||'').trim();
  if(!code) return alert('가져올 코드가 없습니다.');
  let obj=null;
  try{
    const json = LZString.decompressFromBase64(code);
    obj = JSON.parse(json||'{}');
  }catch(e){
    return alert('코드 해석 실패: 형식이 올바르지 않습니다.');
  }
  if(!obj || typeof obj!=='object') return alert('코드 해석 실패');
  if(!confirm('이 코드를 현재 기기에 적용할까요?\n(현재 설정은 덮어씁니다)')) return;
  try{
    Object.keys(obj).forEach(k=>{
      if(!( /^su_/.test(k) || /^cfg_/.test(k) )) return;
      const v = obj[k];
      if(v==null) localStorage.removeItem(k);
      else localStorage.setItem(k, String(v));
    });
  }catch(e){}
  try{ if(typeof window._applyHeaderSettings==='function') window._applyHeaderSettings(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  alert('✅ 적용 완료');
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 전역 폰트 설정(프리셋 + 커스텀 URL)
// ─────────────────────────────────────────────────────────────
window.cfgSetAppFontSettings = function(){
  const preset = (document.getElementById('cfg-appfont-preset')?.value || 'noto').trim();
  const cssUrl = (document.getElementById('cfg-appfont-css')?.value || '').trim();
  const fam    = (document.getElementById('cfg-appfont-family')?.value || '').trim();
  try{ localStorage.setItem('su_app_font_preset', preset); }catch(e){}
  try{ localStorage.setItem('su_app_font_css', cssUrl); }catch(e){}
  try{ localStorage.setItem('su_app_font_family', fam); }catch(e){}
  try{ if(typeof window._applyAppFont === 'function') window._applyAppFont(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

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

// ─────────────────────────────────────────────────────────────
// (요청사항) 필터/하위메뉴(접기) 설정
// - su_filter_lock_open:       '1'이면 필터 항상 펼침(접기 버튼 숨김)
// - su_submenu_filter_enabled: '1'이면 하위메뉴를 "필터로 접기" 사용
// ─────────────────────────────────────────────────────────────
window.cfgSetUiFilterMenuSettings = function(){
  const lock = document.getElementById('cfg-filter-lock')?.checked ? '1' : '0';
  const enabled = document.getElementById('cfg-submenu-filter')?.checked ? '1' : '0';
  try{ localStorage.setItem('su_filter_lock_open', lock); }catch(e){}
  try{ localStorage.setItem('su_submenu_filter_enabled', enabled); }catch(e){}
  // 잠금 ON이면 현재 열린 상태로 강제
  if(lock==='1'){
    try{ window._histFilterOpen=true; }catch(e){}
    try{ window._statsFilterOpen=true; }catch(e){}
    try{ window._miniFilterOpen=true; }catch(e){}
    try{ window._indFilterOpen=true; }catch(e){}
    try{ window._gjFilterOpen=true; }catch(e){}
    try{ window._ckFilterOpen=true; }catch(e){}
    try{ window._univmFilterOpen=true; }catch(e){}
    try{ window._proFilterOpen=true; }catch(e){}
    try{ window._compFilterOpen=true; }catch(e){}
  }
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgResetUiFilterMenuSettings = function(){
  try{ localStorage.removeItem('su_filter_lock_open'); }catch(e){}
  try{ localStorage.removeItem('su_submenu_filter_enabled'); }catch(e){}
  try{
    const a=document.getElementById('cfg-filter-lock'); if(a) a.checked=true;
    const b=document.getElementById('cfg-submenu-filter'); if(b) b.checked=true;
  }catch(e){}
  window.cfgSetUiFilterMenuSettings();
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 경기 결과 '자동인식' 호환 옵션
// - su_paste_compat: '1'이면 전각 괄호/🆚/VS 공백 없는 형태 등을 넓게 인식
// ─────────────────────────────────────────────────────────────
window.cfgSetPasteCompatSettings = function(){
  const on = document.getElementById('cfg-paste-compat')?.checked ? '1' : '0';
  try{ localStorage.setItem('su_paste_compat', on); }catch(e){}
};
try{ window.cfgSetPasteCompatSettings(); }catch(e){}
window.cfgResetPasteCompatSettings = function(){
  try{ localStorage.removeItem('su_paste_compat'); }catch(e){}
  try{
    const a=document.getElementById('cfg-paste-compat'); if(a) a.checked=true;
  }catch(e){}
  window.cfgSetPasteCompatSettings();
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 자동인식 변환툴: 가공되지 않은 텍스트 → 리포트 포맷
// 규칙은 사용자 메시지의 [출력 가이드라인]을 따른다.
// ─────────────────────────────────────────────────────────────
window.cfgPasteConvertRun = function(){
  const inp = document.getElementById('cfg-paste-conv-in');
  const out = document.getElementById('cfg-paste-conv-out');
  if(!inp || !out) return;
  const raw = String(inp.value||'').trim();
  if(!raw){ out.textContent=''; return; }
  const lines = raw.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const mapFix = (m)=>{
    const s = String(m||'').trim();
    if(!s) return '-';
    const t = s.replace(/[\[\]]/g,'').trim();
    const d = {
      '실피':'실피드','실피드':'실피드',
      '폴':'폴리포이드','폴스':'폴리포이드','폴리':'폴리포이드','폴리포이드':'폴리포이드',
      '제인':'제인스','제인스':'제인스',
      '녹아':'녹아웃','녹아웃':'녹아웃',
      '에티':'애티튜드','애티':'애티튜드','애티튜드':'애티튜드',
      '매치':'매치포인트','매치포인트':'매치포인트'
    };
    return d[t] || t;
  };
  const raceOf = (name)=>{
    try{
      if(typeof players !== 'undefined' && Array.isArray(players)){
        const p = players.find(x=>x && x.name===name);
        const r = (p && p.race) ? String(p.race).trim().toUpperCase() : '';
        if(r==='T'||r==='Z'||r==='P') return r;
      }
    }catch(e){}
    return 'N';
  };
  const parsed = [];
  lines.forEach(line=>{
    // 순번/불필요 텍스트 제거
    line = line.replace(/^[\d]+\s*(?:경기|세트)\s*/,'').trim();
    // 맵 추출: [맵]
    let map='-';
    const mm = line.match(/\[([^\]]+)\]/);
    if(mm){ map = mapFix(mm[1]); line = line.replace(mm[0],'').trim(); }
    // 전각 괄호/VS 정규화
    line = line.replace(/[（]/g,'(').replace(/[）]/g,')').replace(/🆚/g,'vs');
    // '조기석(승) vs (패)변현제' / '(승)조기석 vs 변현제(패)' 등 대응
    const vs = line.split(/\s*vs\s*/i);
    if(vs.length<2) return;
    const L = vs[0].trim();
    const R = vs.slice(1).join('vs').trim();
    const pick = (s)=>{
      s = s.replace(/\s+/g,' ').trim();
      // 불필요 점수/주석 제거
      s = s.replace(/\b\d+\/\d+\b.*$/,'').trim();
      // (승)/(패) + 이름
      let m = s.match(/^\((승|패)\)\s*(.+)$/);
      if(m) return {res:m[1], name:m[2].trim().replace(/\((승|패)\)/g,'').trim()};
      // 이름 + (승)/(패)
      m = s.match(/^(.+?)\s*\((승|패)\)\s*$/);
      if(m) return {res:m[2], name:m[1].trim().replace(/\((승|패)\)/g,'').trim()};
      return null;
    };
    const p1 = pick(L), p2 = pick(R);
    if(!p1 || !p2 || !p1.name || !p2.name) return;
    let win='', lose='';
    if(p1.res==='승' && p2.res==='패'){ win=p1.name; lose=p2.name; }
    else if(p1.res==='패' && p2.res==='승'){ win=p2.name; lose=p1.name; }
    else return;
    parsed.push({win,lose,map});
  });
  if(!parsed.length){
    out.textContent = '인식된 경기 없음 (형식을 확인해주세요)';
    return;
  }
  // 최종 스코어(첫 경기의 두 선수 기준)
  const A = parsed[0].win;
  const B = parsed[0].lose;
  let aW=0,bW=0;
  parsed.forEach(g=>{
    if(g.win===A) aW++;
    else if(g.win===B) bW++;
  });
  const body = parsed.map(g=>{
    const wR = raceOf(g.win), lR = raceOf(g.lose);
    return `* **${g.win}**(${wR}) ✅ 🆚️ ⬜ ${g.lose}(${lR}) [${g.map}]`;
  }).join('\n');
  const tail = `\n\n[최종 결과] ${A}(${raceOf(A)}) ${aW} : ${bW} ${B}(${raceOf(B)})`;
  out.textContent = body + tail;
};
window.cfgPasteConvertCopy = function(){
  const out = document.getElementById('cfg-paste-conv-out');
  if(!out) return;
  const txt = out.textContent || '';
  if(!txt) return;
  try{
    navigator.clipboard.writeText(txt);
    alert('✅ 복사 완료');
  }catch(e){
    prompt('아래 내용을 복사하세요:', txt);
  }
};

// ─────────────────────────────────────────────────────────────
// (점검) 설정탭 핸들러 누락 체크(“눌러도 안 되는 버튼” 빠르게 찾기)
// - settings 화면에 렌더된 data-cfg-sec 영역에서 onclick/onchange/oninput 을 스캔
// ─────────────────────────────────────────────────────────────
window.cfgRunSettingsSelfCheck = function(){
  const out = document.getElementById('cfg-selfcheck-out');
  if(out) out.innerHTML = '<div style="color:var(--gray-l);font-size:12px">검사 중...</div>';
  try{
    const JS_KEYWORDS = new Set(['if','for','while','function','typeof','new','return','let','const','var','switch','case','do','break','continue','try','catch','finally','throw','class','extends','super','static','async','await','yield','import','export','default','from','as','delete','in','instanceof','of','void','undefined','null','true','false','this','arguments','eval','isNaN','parseInt','parseFloat','encodeURIComponent','decodeURIComponent']);
    const secs = Array.from(document.querySelectorAll('[data-cfg-sec]'));
    const html = secs.map(el=>el.outerHTML).join('\n');
    const re = /(?:onclick|onchange|oninput)=\"\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    const called = new Set();
    let m;
    while((m=re.exec(html))) called.add(m[1]);
    const missing = Array.from(called).filter(fn => !JS_KEYWORDS.has(fn) && typeof window[fn] !== 'function').sort();

    // 각 탭 함수 확인
    const tabFuncs = {
      '기록탭': ['rHist'],
      '미니탭': ['rMini'],
      '대회탭': ['rComp'],
      '현황판탭': ['rBoard2'],
      '티어토너먼트': ['rTierTourTab'],
      '프로리그': ['rPro'],
      '캘린더': ['rCal'],
      '통계': ['rStats'],
      '붙여넣기': ['pastePreview', 'openGrpPasteModal'],
    };
    const tabMissing = {};
    for(const [tab, funcs] of Object.entries(tabFuncs)){
      const missing = funcs.filter(f => typeof window[f] !== 'function');
      if(missing.length > 0) tabMissing[tab] = missing;
    }

    if(out){
      let html = '';
      if(missing.length > 0){
        html += `<div style="font-size:12px;color:#dc2626;font-weight:1000;margin-bottom:8px">⚠️ settings.js 핸들러 누락 ${missing.length}개</div>
                 <div style="font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;line-height:1.5;margin-bottom:12px">${missing.join('\\n')}</div>`;
      }
      if(Object.keys(tabMissing).length > 0){
        html += `<div style="font-size:12px;color:#ea580c;font-weight:1000;margin-bottom:6px">⚠️ 탭 렌더러 누락</div>
                 <div style="font-family:ui-monospace,monospace;font-size:11px;white-space:pre-wrap;line-height:1.6">`;
        for(const [tab, funcs] of Object.entries(tabMissing)){
          html += `${tab}: ${funcs.join(', ')}\\n`;
        }
        html += `</div>`;
      }
      if(missing.length === 0 && Object.keys(tabMissing).length === 0){
        html = `<div style="font-size:12px;color:#16a34a;font-weight:1000">✅ 모든 핸들러 및 탭 함수 정상</div>`;
      }
      out.innerHTML = html;
    }
  }catch(e){
    if(out) out.innerHTML = `<div style="font-size:12px;color:#dc2626;font-weight:1000">검사 실패: ${String(e)}</div>`;
  }
};
function _cfgMenuSave(v){
  try{ localStorage.setItem(_CFG_MENU_KEY, JSON.stringify(v)); }catch(e){}
}
function _cfgMenuNormalize(layout){
  const all = _cfgAllSecs.slice();
  const defCats = Object.keys(_DEFAULT_CATSECS);
  let catOrder = Array.isArray(layout?.catOrder) ? layout.catOrder.filter(c=>typeof c==='string' && c.trim()) : defCats.slice();
  // 구버전 호환: "시스템 설정" → 신규 2카테고리(스타일/테마, 고급/실험실)
  catOrder = catOrder.filter(c => c !== '시스템 설정');
  // 기본 카테고리 누락 시 추가
  defCats.forEach(c=>{ if(!catOrder.includes(c)) catOrder.push(c); });

  const catSecs = {};
  const legacyCatSecs = layout?.catSecs && typeof layout.catSecs === 'object' ? layout.catSecs : {};
  const aliasCatSecs = {...legacyCatSecs};
  // 구버전 호환(이전 버전에서 현황판/이미지가 하나의 카테고리로 합쳐져 있던 경우) 자동 분리
  try{
    const legacyImg = Array.isArray(legacyCatSecs['이미지 관리']) ? legacyCatSecs['이미지 관리'] : [];
    const hasBoardCat = Array.isArray(legacyCatSecs['현황판 관리']);
    if(legacyImg.length && !hasBoardCat){
      const boardSet = new Set(['b2layout','b2femco','boardchip','oldbright','boardbg']);
      const imgSet = new Set(['imgsettings','imgmodalsettings']);
      const board = legacyImg.filter(s=>boardSet.has(s));
      const imgs  = legacyImg.filter(s=>imgSet.has(s));
      if(board.length) aliasCatSecs['현황판 관리'] = board;
      aliasCatSecs['이미지 관리'] = imgs.length ? imgs : legacyImg.filter(s=>imgSet.has(s));
    }
  }catch(e){}

  // 시스템 설정 섹션이 기존 레이아웃에 있으면, 섹션별로 신규 카테고리에 자동 분배
  try{
    const legacySys = Array.isArray(legacyCatSecs['시스템 설정']) ? legacyCatSecs['시스템 설정'] : [];
    if(legacySys.length){
      const secToCat = {
        appfont:'🎨 스타일/테마', reccard:'🎨 스타일/테마', tourneycard:'🎨 스타일/테마', calui:'🎨 스타일/테마',
        boardchip:'현황판 관리', oldbright:'현황판 관리', boardbg:'현황판 관리',
        cfgmenu:'🧪 고급/실험실', autofitall:'🧪 고급/실험실', pd:'🧪 고급/실험실', fab:'🧪 고급/실험실', storage:'🧪 고급/실험실',
        imgsettings:'이미지 관리', imgmodalsettings:'이미지 관리',
        b2layout:'현황판 관리', b2femco:'현황판 관리',
      };
      legacySys.forEach(sec=>{
        const t = secToCat[sec] || (Object.keys(_DEFAULT_CATSECS).find(c => (_DEFAULT_CATSECS[c]||[]).includes(sec)) || defCats[0]);
        if(!aliasCatSecs[t]) aliasCatSecs[t] = [];
        if(!aliasCatSecs[t].includes(sec)) aliasCatSecs[t].push(sec);
      });
      delete aliasCatSecs['시스템 설정'];
    }
  }catch(e){}
  // 사용자 레이아웃 반영
  catOrder.forEach(c=>{
    const arr = (aliasCatSecs && Array.isArray(aliasCatSecs[c])) ? aliasCatSecs[c] : (_DEFAULT_CATSECS[c] || []);
    catSecs[c] = arr.filter(sec => all.includes(sec));
  });
  // 누락된 섹션은 기본 위치에 추가
  const used = new Set(Object.values(catSecs).flat());
  all.forEach(sec=>{
    if(used.has(sec)) return;
    const defCat = Object.keys(_DEFAULT_CATSECS).find(c => (_DEFAULT_CATSECS[c]||[]).includes(sec)) || defCats[0];
    if(!catSecs[defCat]) catSecs[defCat] = [];
    catSecs[defCat].push(sec);
    used.add(sec);
  });
  // 빈 카테고리 제거(단, 기본 카테고리는 유지)
  catOrder.forEach(c=>{ if(!catSecs[c]) catSecs[c] = []; });
  return {catOrder, catSecs};
}

let _catSecs = (() => {
  const raw = _cfgMenuLoad();
  const norm = _cfgMenuNormalize(raw || {});
  try{ window._cfgCatOrder = norm.catOrder; }catch(e){}
  // catSecs만 rCfg/_cfgApplyCat에서 사용
  return norm.catSecs;
})();

function _cfgMenuApplyAndRerender(layout){
  const norm = _cfgMenuNormalize(layout || {});
  _cfgMenuSave(norm);
  _catSecs = norm.catSecs;
  try{ window._cfgCatOrder = norm.catOrder; }catch(e){}
  try{
    if(!Object.keys(_catSecs).includes(window._cfgCat)){
      window._cfgCat = (window._cfgCatOrder && window._cfgCatOrder[0]) || '게임 운영';
    }
  }catch(e){}
  try{ render(); }catch(e){}
}

// 섹션을 다른 카테고리로 이동
window.cfgMenuSetCat = function(secId, targetCat){
  const cur = _cfgMenuNormalize(_cfgMenuLoad() || {});
  const cats = cur.catOrder.slice();
  if(!cats.includes(targetCat)) cats.push(targetCat);
  // 제거
  cats.forEach(c=>{
    cur.catSecs[c] = (cur.catSecs[c]||[]).filter(x=>x!==secId);
  });
  cur.catSecs[targetCat] = cur.catSecs[targetCat] || [];
  cur.catSecs[targetCat].push(secId);
  _cfgMenuApplyAndRerender(cur);
};

// 섹션 순서 이동(같은 카테고리 내)
window.cfgMenuMoveSec = function(secId, dir){
  const cur = _cfgMenuNormalize(_cfgMenuLoad() || {});
  const cats = cur.catOrder.slice();
  let foundCat = null;
  cats.forEach(c=>{
    if((cur.catSecs[c]||[]).includes(secId)) foundCat = c;
  });
  if(!foundCat) return;
  const arr = cur.catSecs[foundCat] || [];
  const i = arr.indexOf(secId);
  const j = i + (dir==='up'?-1:1);
  if(i<0 || j<0 || j>=arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  cur.catSecs[foundCat] = arr;
  _cfgMenuApplyAndRerender(cur);
};

// 카테고리 순서 이동
window.cfgMenuMoveCat = function(cat, dir){
  const cur = _cfgMenuNormalize(_cfgMenuLoad() || {});
  const arr = cur.catOrder.slice();
  const i = arr.indexOf(cat);
  const j = i + (dir==='up'?-1:1);
  if(i<0 || j<0 || j>=arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  cur.catOrder = arr;
  _cfgMenuApplyAndRerender(cur);
};

window.cfgMenuReset = function(){
  try{ localStorage.removeItem(_CFG_MENU_KEY); }catch(e){}
  _cfgMenuApplyAndRerender({});
};

// (요청사항) 설정 상단 "바로가기" UI 제거됨.

// closest()/matches()/includes() 미지원 환경 대비: 상위로 올라가며 data-attr 탐색
function _cfgFindUpAttr(el, attrName, maxDepth){
  maxDepth = (typeof maxDepth === 'number') ? maxDepth : 8;
  let cur = el;
  for(let i=0;i<maxDepth && cur;i++){
    try{
      if(cur.getAttribute && cur.getAttribute(attrName)!=null) return cur;
    }catch(e){}
    cur = cur.parentNode;
  }
  return null;
}

/* ══════════════════════════════════════
   🧩 펨코현황 설정 (이미지 관리)
   - localStorage: b2_femco_settings_v1
══════════════════════════════════════ */
const _FEMCO_CFG_KEY = 'b2_femco_settings_v1';
function _cfgFemcoDefaults(){
  return {
    autoLayout: 1,     // 1: 인원수/화면폭에 맞춰 자동 레이아웃, 0: 수동 설정값 사용
    logoSize: 150,
    logoPos: 'top',
    logoAttachTitle: 1, // 1: 로고+대학명 같이 이동, 0: 로고만 이동
    headGap: 10,        // 로고-대학명(세로) 간격
    titleSize: 28,
    titleFont: 'system',
    playerImgSize: 46,
    playerImgShape: 'square',
    rowsPerCol: 5,
    colWidth: 170,
    colGap: 10,
    univGap: 18,
    countFontSize: 12,
    contentPadX: 16,
    contentAlign: 'left', // left | center (기본은 좌측)
    contentOffsetX: 0,      // 좌우 미세 이동(-40~40)
    univSubtitles: {},
    subtitleSize: 12,
    subtitleWeight: 800,
    subtitleColor: '',
    nameFontSize: 12,
    roleFontSize: 10,
    tierBadgeSize: 10,
    tierBadgePadX: 6,
    starSize: 15,
    statusIconSize: 18,
    univColorOverrides: {},
    // 대학별 배경 미디어 URL (이미지/GIF: 배경, MP4/WEBM: 버튼으로 재생, YouTube/Twitch: 새창)
    univBgMedia: {},
    // (요청) 배경 미디어 오버레이(투명도) — 0(없음) ~ 70(진하게)
    bgOverlay: 22,
    // (요청) 로고/대학명 위치 미세조정(px)
    logoOffsetX: 0,
    logoOffsetY: 0,
    titleOffsetX: 0,
    titleOffsetY: 0,
    // (요청) 대학명 위치(로고 기준) — left/right/top/bottom
    titlePos: 'bottom'
  };
}
function _cfgFemcoLoad(){
  try{
    const raw = localStorage.getItem(_FEMCO_CFG_KEY);
    if(!raw) return _cfgFemcoDefaults();
    const obj = JSON.parse(raw) || {};
    return {..._cfgFemcoDefaults(), ...obj,
      univSubtitles:{...((_cfgFemcoDefaults().univSubtitles)||{}), ...(obj.univSubtitles||{})},
      univColorOverrides:{...((_cfgFemcoDefaults().univColorOverrides)||{}), ...(obj.univColorOverrides||{})},
      univBgMedia:{...((_cfgFemcoDefaults().univBgMedia)||{}), ...(obj.univBgMedia||{})}
    };
  }catch(e){ return _cfgFemcoDefaults(); }
}
function _cfgFemcoSave(obj){
  try{ localStorage.setItem(_FEMCO_CFG_KEY, JSON.stringify(obj)); }catch(e){}
}

// (리팩터) 펨코 설정 단일 소스(SSOT): 다른 모듈(board2.js 등)에서 재사용할 수 있도록 노출
// - 기존 동작은 그대로 유지하며, 중복 defaults/load/save를 제거하기 위한 목적
try{
  window._cfgFemcoDefaults = _cfgFemcoDefaults;
  window._cfgFemcoLoad = _cfgFemcoLoad;
  window._cfgFemcoSave = _cfgFemcoSave;
}catch(e){}

window.cfgFemcoUpd = function(k, v){
  const cur = _cfgFemcoLoad();
  const next = {...cur};
  const numKeys = ['autoLayout','logoSize','logoAttachTitle','logoPos','headGap','titleSize','playerImgSize','rowsPerCol','colWidth','colGap','univGap','countFontSize','contentPadX','contentOffsetX','starSize','statusIconSize','subtitleSize','subtitleWeight','nameFontSize','roleFontSize','tierBadgeSize','tierBadgePadX','bgOverlay','logoOffsetX','logoOffsetY','titleOffsetX','titleOffsetY'];
  next[k] = numKeys.includes(k) ? parseInt(v, 10) : v;

  // 수동 조절을 건드리면 자동 레이아웃 OFF (원클릭 자동화 요구사항: 사용자가 바꾸면 유지)
  const manualKeys = ['rowsPerCol','colWidth','colGap','univGap','playerImgSize','contentPadX','contentOffsetX','nameFontSize','roleFontSize','countFontSize','headGap','logoSize','statusIconSize','starSize','bgOverlay','logoOffsetX','logoOffsetY','titleOffsetX','titleOffsetY','logoPos','titlePos','logoAttachTitle'];
  if (k !== 'autoLayout' && manualKeys.includes(k)) {
    next.autoLayout = 0;
  }
  _cfgFemcoSave(next);
  // 즉시 반영(로고 위치/오버레이 등이 "안 먹는" 것처럼 보이는 문제 방지)
  try{ if(typeof render === 'function') render(); }catch(e){}
};

window.cfgFemcoInit = function(){
  const s = _cfgFemcoLoad();
  const setVal = (id, val) => { const el=document.getElementById(id); if(el) el.value = val; };
  try{ const chk=document.getElementById('cfg-femco-autoLayout'); if(chk) chk.checked = (s.autoLayout ?? 1) ? true : false; }catch(e){}
  setVal('cfg-femco-logoSize', s.logoSize); setVal('cfg-femco-logoSizeNum', s.logoSize);
  setVal('cfg-femco-logoPos', s.logoPos);
  setVal('cfg-femco-titlePos', s.titlePos || 'bottom');
  try{ const chk=document.getElementById('cfg-femco-logoAttachTitle'); if(chk) chk.checked = (s.logoAttachTitle ?? 1) ? true : false; }catch(e){}
  setVal('cfg-femco-headGap', s.headGap || 10); setVal('cfg-femco-headGapNum', s.headGap || 10);
  setVal('cfg-femco-titleSize', s.titleSize); setVal('cfg-femco-titleSizeNum', s.titleSize);
  setVal('cfg-femco-titleFont', s.titleFont);
  setVal('cfg-femco-playerImgSize', s.playerImgSize); setVal('cfg-femco-playerImgSizeNum', s.playerImgSize);
  setVal('cfg-femco-playerImgShape', s.playerImgShape);
  setVal('cfg-femco-rowsPerCol', s.rowsPerCol); setVal('cfg-femco-rowsPerColNum', s.rowsPerCol);
  setVal('cfg-femco-colWidth', s.colWidth); setVal('cfg-femco-colWidthNum', s.colWidth);
  setVal('cfg-femco-colGap', s.colGap); setVal('cfg-femco-colGapNum', s.colGap);
  setVal('cfg-femco-univGap', s.univGap || 18); setVal('cfg-femco-univGapNum', s.univGap || 18);
  setVal('cfg-femco-countFontSize', s.countFontSize || 12); setVal('cfg-femco-countFontSizeNum', s.countFontSize || 12);
  setVal('cfg-femco-contentPadX', s.contentPadX || 16); setVal('cfg-femco-contentPadXNum', s.contentPadX || 16);
  setVal('cfg-femco-contentAlign', s.contentAlign || 'left');
  setVal('cfg-femco-contentOffsetX', s.contentOffsetX || 0); setVal('cfg-femco-contentOffsetXNum', s.contentOffsetX || 0);
  setVal('cfg-femco-nameFontSize', s.nameFontSize || 12); setVal('cfg-femco-nameFontSizeNum', s.nameFontSize || 12);
  setVal('cfg-femco-roleFontSize', s.roleFontSize || 10); setVal('cfg-femco-roleFontSizeNum', s.roleFontSize || 10);
  setVal('cfg-femco-tierBadgeSize', s.tierBadgeSize || 10); setVal('cfg-femco-tierBadgeSizeNum', s.tierBadgeSize || 10);
  setVal('cfg-femco-starSize', s.starSize || 15); setVal('cfg-femco-starSizeNum', s.starSize || 15);
  setVal('cfg-femco-statusIconSize', s.statusIconSize || 18); setVal('cfg-femco-statusIconSizeNum', s.statusIconSize || 18);
  setVal('cfg-femco-subtitleSize', s.subtitleSize); setVal('cfg-femco-subtitleSizeNum', s.subtitleSize);
  setVal('cfg-femco-subtitleWeight', s.subtitleWeight);
  setVal('cfg-femco-subtitleColor', (s.subtitleColor && s.subtitleColor.startsWith('#')) ? s.subtitleColor : '#ffffff');
  setVal('cfg-femco-bgOverlay', s.bgOverlay ?? 22); setVal('cfg-femco-bgOverlayNum', s.bgOverlay ?? 22);
  setVal('cfg-femco-logoOffsetX', s.logoOffsetX ?? 0); setVal('cfg-femco-logoOffsetXNum', s.logoOffsetX ?? 0);
  setVal('cfg-femco-logoOffsetY', s.logoOffsetY ?? 0); setVal('cfg-femco-logoOffsetYNum', s.logoOffsetY ?? 0);
  setVal('cfg-femco-titleOffsetX', s.titleOffsetX ?? 0); setVal('cfg-femco-titleOffsetXNum', s.titleOffsetX ?? 0);
  setVal('cfg-femco-titleOffsetY', s.titleOffsetY ?? 0); setVal('cfg-femco-titleOffsetYNum', s.titleOffsetY ?? 0);

  // 대학 셀렉트 채우기
  const sel = document.getElementById('cfg-femco-univ');
  if (sel) {
    const names = (typeof univCfg !== 'undefined' ? univCfg : []).map(u=>u.name).filter(Boolean);
    const curUniv = localStorage.getItem('cfg_femco_univ') || names[0] || '';
    sel.innerHTML = names.map(n=>`<option value="${n}"${n===curUniv?' selected':''}>${n}</option>`).join('');
    localStorage.setItem('cfg_femco_univ', curUniv);
  }
  if (typeof window.cfgFemcoRefreshUnivFields === 'function') window.cfgFemcoRefreshUnivFields();
};

window.cfgFemcoRefreshUnivFields = function(){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : (localStorage.getItem('cfg_femco_univ') || '');
  const c = (s.univColorOverrides||{})[u] || '#000000';
  const sub = (s.univSubtitles||{})[u] || '';
  const bg = (s.univBgMedia||{})[u] || '';
  const colorEl = document.getElementById('cfg-femco-univColor');
  const subEl = document.getElementById('cfg-femco-subtitle');
  const bgEl = document.getElementById('cfg-femco-bgMediaUrl');
  const bgHint = document.getElementById('cfg-femco-bgMediaHint');
  if (colorEl) colorEl.value = c;
  if (subEl) subEl.value = sub;
  if (bgEl) bgEl.value = bg;
  if (bgHint) bgHint.textContent = bg ? '설정됨' : '미설정';
};

window.cfgFemcoSetBgMedia = function(url){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univBgMedia = s.univBgMedia || {};
  const v = (url || '').trim();
  if(!v) delete s.univBgMedia[u];
  else s.univBgMedia[u] = v;
  _cfgFemcoSave(s);
  try{ window.cfgFemcoRefreshUnivFields && window.cfgFemcoRefreshUnivFields(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgFemcoSetUnivColor = function(color){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univColorOverrides = s.univColorOverrides || {};
  s.univColorOverrides[u] = color;
  _cfgFemcoSave(s);
};
window.cfgFemcoClearUnivColor = function(){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univColorOverrides = s.univColorOverrides || {};
  delete s.univColorOverrides[u];
  _cfgFemcoSave(s);
  window.cfgFemcoRefreshUnivFields();
};
window.cfgFemcoSetSubtitle = function(text){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univSubtitles = s.univSubtitles || {};
  s.univSubtitles[u] = (text || '').trim();
  _cfgFemcoSave(s);
};
window.cfgFemcoClearSubtitle = function(){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univSubtitles = s.univSubtitles || {};
  delete s.univSubtitles[u];
  _cfgFemcoSave(s);
  window.cfgFemcoRefreshUnivFields();
};
window.cfgFemcoReset = function(){
  _cfgFemcoSave(_cfgFemcoDefaults());
  window.cfgFemcoInit();
};

// 설정 탭 버튼이 "반응 없음"처럼 보일 때를 대비한 이벤트 바인딩(인라인 onclick 불발 대비)
function _cfgHandleCfgClick(e){
  // 설정탭이 실제로 렌더된 상태에서만 처리
  // (바로가기 UI를 삭제했으므로 cfg-shortcuts는 더 이상 존재하지 않음)
  // 설정 화면이 아닌 경우에는 무시
  try{
    if(!document.querySelector('.cfg-cat-pill') && !document.querySelector('[data-cfg-sec]')) return;
  }catch(_){}
  const t = e.target;
  const catBtn = _cfgFindUpAttr(t, 'data-cfg-cat');
  if(catBtn){
    // preventDefault 제거 - 인라인 onclick도 작동하도록
    const cat = catBtn.getAttribute('data-cfg-cat');
    if(cat){ _cfgApplyCat(cat, false); }
    return;
  }
  const goBtn = _cfgFindUpAttr(t, 'data-cfg-go');
  if(goBtn){
    // preventDefault 제거 - 인라인 onclick도 작동하도록
    const sec = goBtn.getAttribute('data-cfg-go');
    if(sec){ _cfgGo(sec); }
    return;
  }
  // (요청사항) 섹션(summary) 클릭 시 "펼치기" 대신 팝업(모달)로 열기
  // - 모달 안(#cfgModalBody)에서는 토글 대신 '팝업 닫기'
  try{
    const secWrap = _cfgFindUpAttr(t, 'data-cfg-sec');
    if(secWrap && secWrap.tagName === 'DETAILS'){
      const inModal = !!(secWrap.closest && secWrap.closest('#cfgModalBody'));
      // summary 영역 클릭인지 확인
      let cur = t, inSummary = false;
      for(let i=0;i<8 && cur && cur!==secWrap;i++){
        if(cur.tagName === 'SUMMARY'){ inSummary = true; break; }
        cur = cur.parentNode;
      }
      if(inSummary){
        if(inModal){
          try{ if(e && e.preventDefault) e.preventDefault(); }catch(_){}
          try{ if(e && e.stopPropagation) e.stopPropagation(); }catch(_){}
          try{ if(typeof closeCfgModal==='function') closeCfgModal(); }catch(_){}
          return;
        }
        const secId = secWrap.getAttribute('data-cfg-sec');
        if(secId){
          try{ if(e && e.preventDefault) e.preventDefault(); }catch(_){}
          try{ if(e && e.stopPropagation) e.stopPropagation(); }catch(_){}
          // (요청사항) '펼치기' 동작은 하지 않고 팝업만 띄우기
          try{ secWrap.open = false; }catch(_){}
          _cfgGo(secId);
          return;
        }
      }
    }
  }catch(_){}
}
function _bindCfgHandlers(){
  if(window._cfgGlobalBound) return;
  window._cfgGlobalBound = true;
  // 일부 웹뷰/확장환경에서 document 캡처 클릭이 차단되는 케이스가 있어
  // window 캡처(pointerup)를 우선으로 바인딩한다.
  // details/summary 토글을 확실히 막기 위해 pointerdown도 캡처로 선 바인딩
  try{ document.addEventListener('pointerdown', _cfgHandleCfgClick, true); }catch(e){}
  try{ window.addEventListener('pointerup', _cfgHandleCfgClick, true); }catch(e){}
  try{ document.addEventListener('click', _cfgHandleCfgClick, true); }catch(e){}
  try{ document.addEventListener('touchend', _cfgHandleCfgClick, true); }catch(e){}
}
function _scfgD(id,title,extra){
  // (요청사항) 펼치기 UI 대신 "팝업으로 열기" UX: 기본은 항상 닫힘
  const isOpen=false;
  // cfg-anchor: 바로가기 클릭 시 원래 위치로 되돌릴 기준점
  return `<div class="cfg-anchor" data-cfg-anchor="${id}"></div><details id="cfg-sec-${id}" class="ssec" data-cfg-sec="${id}" ${isOpen?'open':''} ontoggle="_scfgToggle('${id}',this)"${extra?' '+extra:''}>
  <summary class="cfg-sec-summary" style="list-style:none;outline:none;-webkit-appearance:none">
    <h4>${title}</h4>
    <span class="cfg-sec-right">열기 ›</span>
  </summary>`;
}

// 설정 섹션 팝업 모달 (바로가기 클릭 시 사용)
function _cfgEnsureModal(){
  let m=document.getElementById('cfgModal');
  if(m) return m;
  try{
    m=document.createElement('div');
    m.id='cfgModal';
    m.className='modal no-export';
    m.style.display='none';
    m.style.zIndex='9000';
    m.innerHTML=`
      <div class="mbox" style="width:min(860px,96vw);padding:0;border-radius:16px;overflow:hidden;max-height:92vh">
        <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:14px 16px;display:flex;align-items:center;gap:10px">
          <div id="cfgModalTitle" class="mtitle" style="font-size:14px;font-weight:900;color:#fff;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer">⚙️ 설정</div>
          <button onclick="closeCfgModal()" style="background:rgba(255,255,255,.15);border:none;border-radius:8px;color:#fff;width:30px;height:30px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">✕</button>
        </div>
        <div id="cfgModalBody" style="padding:14px 16px;background:var(--bg);overflow:auto;max-height:calc(92vh - 58px)"></div>
      </div>
    `;
    document.body.appendChild(m);
  }catch(e){}
  // (요청사항) 모달 바깥(배경) 클릭으로 닫아도 섹션이 원위치로 복구되도록
  try{
    m.addEventListener('click', (ev)=>{
      try{
        if(ev && ev.target===m && typeof window.closeCfgModal==='function') window.closeCfgModal();
      }catch(_){}
    }, {capture:true});
  }catch(e){}
  // 닫기 핸들러 (섹션 원위치 복구)
  if(typeof window.closeCfgModal!=='function'){
    window.closeCfgModal=function(){
      try{
        const prevId=window._cfgModalSecId;
        if(prevId){
          const prev=document.querySelector(`[data-cfg-sec="${prevId}"]`);
          const anchor=document.querySelector(`[data-cfg-anchor="${prevId}"]`);
          if(prev && anchor){
            anchor.parentNode.insertBefore(prev, anchor.nextSibling);
            prev.style.display='';
            // 목록에서는 펼치지 않음
            try{ if(prev.tagName==='DETAILS') prev.open=false; }catch(e){}
          }
          window._cfgModalSecId=null;
        }
        const body=document.getElementById('cfgModalBody');
        if(body) body.innerHTML='';
      }catch(e){}
      try{ if(typeof cm==='function') cm('cfgModal'); else { const mm=document.getElementById('cfgModal'); if(mm) mm.style.display='none'; } }catch(e){}
    };
  }
  return m;
}

/* ══════════════════════════════════════
   설정 카테고리 필터
══════════════════════════════════════ */
if(typeof window._cfgCat==='undefined'||window._cfgCat==='전체'||!Object.keys(_catSecs||{}).includes(window._cfgCat)) window._cfgCat=(window._cfgCatOrder&&window._cfgCatOrder[0])||'게임 운영';
function _cfgGo(secId){
  // 섹션이 다른 카테고리에 속하면 카테고리 자동 전환
  try{
    let targetCat=null;
    for(const cat in _catSecs){
      const arr=_catSecs[cat]||[];
      if(arr.indexOf(secId)!==-1){ targetCat=cat; break; }
    }
    if(targetCat && window._cfgCat!==targetCat) _cfgApplyCat(targetCat,false);
  }catch(e){}

  const el=document.getElementById(`cfg-sec-${secId}`) || document.querySelector(`[data-cfg-sec="${secId}"]`);
  if(!el){
    try{
      // 디버그: 특정 환경에서만 섹션 탐색이 실패하는 현상(‘pd만 됨’) 추적용
      if(window.__CFG_DEBUG){
        const secs=[...document.querySelectorAll('[data-cfg-sec]')].slice(0,40).map(x=>`${x.getAttribute('data-cfg-sec')}#${x.id||''}`);
        console.warn('[cfgGo] section not found:', secId, 'known secs=', secs);
      }
    }catch(e){}
    return;
  }

  // 기존 열림 닫기 (아코디언)
  try{
    const all=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<all.length;i++){
      const d=all[i];
      if(d!==el && d.tagName==='DETAILS') d.open=false;
    }
  }catch(e){}

  // 바로가기 클릭 시: 해당 섹션을 팝업 모달로 표시
  try{
    _cfgEnsureModal();
    // 이전에 모달로 올린 섹션이 있으면 원위치 복구
    const prevId=window._cfgModalSecId;
    if(prevId && prevId!==secId){
        const prev=document.getElementById(`cfg-sec-${prevId}`) || document.querySelector(`[data-cfg-sec="${prevId}"]`);
      const anchor=document.querySelector(`[data-cfg-anchor="${prevId}"]`);
      if(prev && anchor){
        anchor.parentNode.insertBefore(prev, anchor.nextSibling);
        prev.style.display='';
      }
    }
    window._cfgModalSecId=secId;
    const titleEl=document.getElementById('cfgModalTitle');
    if(titleEl) titleEl.textContent=(window._cfgSecTitle&&window._cfgSecTitle[secId]?window._cfgSecTitle[secId]:'⚙️ 설정');
    const body=document.getElementById('cfgModalBody');
    if(body){
      body.innerHTML='';
      el.style.display='';
      body.appendChild(el);
      // (요청사항) 팝업에서는 내용이 보여야 하므로 펼침
      try{ if(el.tagName==='DETAILS') el.open=true; }catch(e){}
    }
    // om()/cm()가 "초기 로드 시점에 존재하던 모달만" 관리하는 구현일 수 있어,
    // 동적 생성 모달은 style.display로도 확실히 띄운 뒤 om()을 보조로 호출한다.
    const mm=document.getElementById('cfgModal');
    if(mm) mm.style.display='flex';
    if(typeof om==='function'){ try{ om('cfgModal'); }catch(err){ if(window.__CFG_DEBUG) console.error('[cfgGo] om() failed', err); } }
  }catch(e){
    // 기존엔 조용히 삼켜서 “버튼 반응 없음”처럼 보였음 → 콘솔에 노출
    try{ console.error('[cfgGo] failed:', secId, e); }catch(_){}
  }
  // (요청사항) 목록에서는 펼치기 사용 안 함(팝업으로만 확인)
  // - 팝업으로 옮겨진 경우는 위에서 open=true 처리
  try{ if(el && el.tagName==='DETAILS' && !(el.closest && el.closest('#cfgModalBody'))) el.open=false; }catch(e){}
}

function _cfgApplyCat(cat, autoGo=true){
  window._cfgCat=cat;
  const show=_catSecs[cat]||[];
  // 섹션 표시/숨김
  try{
    const secs=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<secs.length;i++){
      const el=secs[i];
      // 모달에 올라간 섹션은 숨기지 않음
      try{ if(el.closest && el.closest('#cfgModalBody')) continue; }catch(e){}
      const id=el.getAttribute('data-cfg-sec');
      const vis=(show.indexOf(id)!==-1);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS') el.open=false;
    }
  }catch(e){}
  // 카테고리 버튼 스타일 업데이트 (초기 렌더 인라인 스타일은 1회성이라 JS로 재적용)
  try{
    const pills=document.querySelectorAll('.cfg-cat-pill');
    for(let i=0;i<pills.length;i++){
      const btn=pills[i];
      const on=(btn.getAttribute('data-cat')===cat);
      btn.classList.toggle('on', on);
      btn.style.borderColor = on ? 'var(--blue)' : 'var(--border)';
      // (요청사항) 비활성 배경의 회색 제거
      btn.style.background  = on ? 'var(--blue)' : 'transparent';
      btn.style.fontWeight  = on ? '800' : '700';
      btn.style.color       = on ? '#fff' : 'var(--text)';
    }
  }catch(e){}
  if(autoGo){
    const first=show[0];
    if(first) setTimeout(()=>_cfgGo(first),0);
  }
}

// 함수를 window 객체에 할당 (인라인 onclick에서 사용)
window._cfgGo = _cfgGo;
window._cfgApplyCat = _cfgApplyCat;
// 인라인 onclick에서 try/catch로 에러를 숨기지 않기 위해 단순 래퍼 제공
window.cfgGo = function(secId){ return _cfgGo(secId); };
// (요청사항) 카테고리 클릭 시 해당 카테고리 "메뉴만" 보여주고 자동으로 모달을 띄우지 않음
window.cfgApplyCat = function(cat){ return _cfgApplyCat(cat, false); };

// 디버그 플래그 (기본 OFF): URL에 ?cfgdebug=1 이 포함되면 콘솔에 자세히 기록
try{
  if(typeof window.__CFG_DEBUG==='undefined'){
    window.__CFG_DEBUG = (typeof location!=='undefined' && (location.search||'').indexOf('cfgdebug=1')!==-1);
  }
}catch(e){}

/* ══════════════════════════════════════
   설정
══════════════════════════════════════ */
function rCfg(C,T){
  T.innerText='⚙️ 설정';
  if(!isLoggedIn){
    C.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px"><div style="font-size:48px">🔒</div><div style="font-size:18px;font-weight:800;color:var(--text)">관리자 전용 페이지</div><div style="font-size:13px;color:var(--gray-l)">설정 탭은 관리자 로그인 후 이용할 수 있습니다.</div><button class="btn btn-b" onclick="om(\'loginModal\')">&#128273; 로그인</button></div>';
    return;
  }
  if(!window._cfgCat || window._cfgCat==='전체') window._cfgCat='게임 운영';
  const _cfgCats=(window._cfgCatOrder && Array.isArray(window._cfgCatOrder) ? window._cfgCatOrder : Object.keys(_catSecs||{}));
  const _cfgCatIcons={'게임 운영':'🎮','콘텐츠 관리':'📝','현황판 관리':'🧩','이미지 관리':'🖼️','🎨 스타일/테마':'🎨','🧪 고급/실험실':'🧪','데이터 관리':'💾','기타':'🗂️'};
  // 카테고리명 자체에 이모지가 들어있는 경우(🎨 스타일/테마, 🧪 고급/실험실) 아이콘이 2번 보이는 문제 방지
  const _catLabel = (c)=>{
    const s=String(c||'');
    return s.replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]+\s*/u,'');
  };
  const _cfgCatDesc={
    '게임 운영':'공지/티어/시즌/경기 운영',
    '콘텐츠 관리':'대학/맵/약자/이미지 리소스',
    '현황판 관리':'현황판/펨코현황/칩/밝기/배경',
    '이미지 관리':'이미지별/이미지 모달/리소스',
    '🎨 스타일/테마':'폰트/카드/캘린더/브라켓 디자인',
    '🧪 고급/실험실':'메뉴정리/자동맞춤/저장소/점검',
    '데이터 관리':'동기화/백업/일괄 작업'
  };
  const _cfgSecTitle={
    notice:'📢 공지', tier:'🎯 티어/점수', season:'🗓️ 시즌', teammatch:'🏟️ 팀경기', acct:'🔐 계정',
    univ:'🏛️ 대학', maps:'🗺️ 맵', mAlias:'🔤 맵 약자', si:'🧩 SI', paste:'🤖 자동인식',
    b2layout:'🖼️ 현황판', b2femco:'🧩 펨코현황', cfgmenu:'🧭 메뉴 정리', autofitall:'📱 전역 자동 맞춤', reccard:'🧾 기록 카드(기록탭)', tourneycard:'🏆 대회 카드(대회탭)', calui:'📅 캘린더', appfont:'🅰️ 폰트', imgsettings:'🖼️ 이미지', imgmodalsettings:'🖼️ 이미지 모달', pd:'🧑‍💻 스트리머 상세', boardchip:'🏷️ 칩/로고', oldbright:'🌗 밝기', boardbg:'🧱 배경', fab:'📱 FAB', storage:'💾 저장소', selfcheck:'🧪 설정 점검',
    sync:'🔄 동기화', firebase:'🔥 Firebase', bulkdate:'📅 일괄 날짜', bulkmap:'🗺️ 일괄 맵', bulktier:'🎯 일괄 티어', bulkdel:'🗑️ 일괄 삭제', bulkconv:'🧾 변환'
  };
  // 사용자 지정 섹션명 적용
  try{
    const _ren=_cfgMenuLoadRenames();
    for(const k in (_ren||{})){
      if(!_ren[k]) continue;
      _cfgSecTitle[k]=String(_ren[k]);
    }
  }catch(e){}
  const typeOpts=[{v:'📢',l:'📢 일반 공지'},{v:'🔥',l:'🔥 중요'},{v:'⚠️',l:'⚠️ 경고/주의'},{v:'🎉',l:'🎉 이벤트'}];
  const _curSecs=_catSecs[window._cfgCat]||[];
  // 다른 함수에서도 참조할 수 있게 title 맵을 window에 노출
  window._cfgSecTitle = _cfgSecTitle;
  const _regBtn = (!isSubAdmin ? `<button class="btn btn-b no-export" onclick="openB2PlayerCreateModal()" style="padding:6px 10px;border-radius:14px;font-size:11px;font-weight:900;white-space:nowrap;flex-shrink:0">🎬 스트리머 등록</button>` : ``);
  const _menuBtn = `<button class="btn btn-w no-export" onclick="cfgGo('cfgmenu')" style="padding:6px 10px;border-radius:14px;font-size:11px;font-weight:900;white-space:nowrap;flex-shrink:0" title="설정 하위 메뉴 이름 변경/정리">🧭 메뉴정리</button>`;
  const _afOn = (localStorage.getItem('su_af_alltabs_v1') === '1');
  const _rcOn = (localStorage.getItem('su_rc_theme_on') ?? '1') === '1';
  const _rcAccent = (localStorage.getItem('su_rc_accent_mode') ?? 'none');
  const _rcBg = parseInt(localStorage.getItem('su_rc_bg_alpha') ?? '12',10) || 12;
  const _rcHd = parseInt(localStorage.getItem('su_rc_hd_alpha') ?? '14',10) || 14;
  const _rcIc = parseInt(localStorage.getItem('su_rc_uicon') ?? '18',10) || 18;
  const _rcMemoOn = (localStorage.getItem('su_rc_memo_on') ?? '0') === '1';
  const _avaScale = Math.round((parseFloat(localStorage.getItem('su_avatar_scale') ?? '1') || 1) * 100);

  let h=`<div class="no-export" style="position:sticky;top:0;z-index:10;background:var(--bg);padding:6px 0 0;margin-bottom:10px;border-bottom:1px solid var(--border)">
    <div style="display:flex;align-items:center;gap:10px;padding-bottom:6px">
      <div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;flex-wrap:nowrap">
        ${_cfgCats.map(c=>{const on=window._cfgCat===c;return`<button type="button" onclick="cfgApplyCat('${c}')" class="cfg-cat-pill" data-cat="${c}" data-cfg-cat="${c}"
          style="display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border:1px solid ${on?'var(--blue)':'var(--border)'};border-radius:14px;background:${on?'var(--blue)':'transparent'};cursor:pointer;white-space:nowrap;flex-shrink:0;font-size:11px;font-weight:${on?800:700};color:${on?'#fff':'var(--text)'};transition:all .12s;touch-action:manipulation;line-height:1.1">
          <span style="font-size:12px;line-height:1">${_cfgCatIcons[c]||'🗂️'}</span>${_catLabel(c)}</button>`;}).join('')}
      </div>
      <span style="flex:1"></span>
      ${_menuBtn}
      ${_regBtn}
    </div>
  </div>
${_scfgD('notice','📢 공지 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">접속 시 팝업으로 표시됩니다. 활성화된 공지만 보여집니다.</div>
    <div id="notice-list-area" style="margin-bottom:16px">
    ${notices.length===0?`<div style="padding:18px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px;font-size:13px">등록된 공지 없음</div>`:
      notices.map((n,i)=>`<div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;background:${n.active?'var(--white)':'var(--surface)'};opacity:${n.active?1:0.6}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:18px">${n.type||'📢'}</span>
          <span style="font-weight:700;flex:1;font-size:13px">${n.title||'(제목 없음)'}</span>
          <span style="font-size:11px;color:var(--gray-l)">${n.date||''}</span>
          <button class="btn btn-xs" style="background:${n.active?'#f0fdf4':'#f1f5f9'};color:${n.active?'#16a34a':'#64748b'};border:1px solid ${n.active?'#86efac':'#cbd5e1'};min-width:52px"
            onclick="notices[${i}].active=!notices[${i}].active;save();render()">
            ${n.active?'✅ 활성':'⭕ 비활성'}</button>
          <button class="btn btn-r btn-xs" onclick="if(confirm('공지를 삭제할까요?')){notices.splice(${i},1);save();render()}">🗑️</button>
        </div>
        ${(n.body||'').length>120
          ? `<div id="notice-body-${i}" style="font-size:12px;color:var(--text2);white-space:pre-wrap;max-height:60px;overflow:hidden">${(n.body||'').slice(0,120)}...</div>
             <button onclick="(function(){const el=document.getElementById('notice-body-${i}');const btn=document.getElementById('notice-exp-${i}');const open=el.style.maxHeight!=='none';el.style.maxHeight=open?'none':'60px';el.textContent=open?notices[${i}].body:notices[${i}].body.slice(0,120)+'...';btn.textContent=open?'▲ 접기':'▼ 전체보기';})()" id="notice-exp-${i}" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;padding:2px 0;font-weight:600">▼ 전체보기</button>`
          : `<div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${n.body||''}</div>`
        }
      </div>`).join('')
    }
    </div>
    <div style="border:1.5px dashed var(--border2);border-radius:12px;padding:16px;background:var(--surface)">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">+ 새 공지 작성</div>
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <select id="new-notice-type" style="width:140px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
          ${typeOpts.map(o=>`<option value="${o.v}">${o.l}</option>`).join('')}
        </select>
        <input type="text" id="new-notice-title" placeholder="공지 제목" style="flex:1;min-width:180px">
      </div>
      <textarea id="new-notice-body" placeholder="공지 내용을 입력하세요..." style="width:100%;height:80px;resize:vertical;border:1px solid var(--border2);border-radius:8px;padding:8px 10px;font-size:13px;box-sizing:border-box"></textarea>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="new-notice-active" checked> 즉시 활성화
        </label>
        <button class="btn btn-b" style="margin-left:auto" onclick="
          const t=document.getElementById('new-notice-title').value.trim();
          const b=document.getElementById('new-notice-body').value.trim();
          const tp=document.getElementById('new-notice-type').value;
          const ac=document.getElementById('new-notice-active').checked;
          if(!t){alert('제목을 입력하세요');return;}
          notices.unshift({id:Date.now(),type:tp,title:t,body:b,active:ac,date:new Date().toLocaleDateString('ko-KR')});
          save();render();">📢 공지 등록</button>
      </div>
    </div>
  </details>
  ${(()=>{
    const seen={};const dupNames=[];
    players.forEach(p=>{if(seen[p.name])dupNames.push(p.name);else seen[p.name]=true;});
    const uniq=[...new Set(dupNames)];
    if(!uniq.length) return '';
    return `<div class="ssec" style="border:2px solid #fca5a5;background:#fff5f5">
      <h4 style="color:#dc2626">⚠️ 동명이인 감지 (${uniq.length}건)</h4>
      <div style="font-size:12px;color:#7f1d1d;margin-bottom:12px">중복 이름이 있으면 승패·기록이 뒤섞입니다. 한 명의 이름을 바꿔 구분하세요.</div>
      ${uniq.map(name=>{
        const dupes=players.map((p,i)=>({p,i})).filter(({p})=>p.name===name);
        return `<div style="background:var(--white);border:1px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-bottom:8px">
          <div style="font-weight:800;color:#dc2626;font-size:13px;margin-bottom:6px">👥 "${name}" — ${dupes.length}명 중복</div>
          ${dupes.map(({p,i})=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:11px;background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 7px;font-weight:700">${p.univ||'무소속'}</span>
            <span style="font-size:11px;color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}</span>
            <input type="text" id="dupfix-${i}" placeholder="새 이름..." style="flex:1;min-width:100px;padding:3px 7px;border-radius:5px;border:1px solid #fca5a5;font-size:12px">
            <button class="btn btn-xs" style="background:#dc2626;color:#fff;border-color:#dc2626" onclick="(function(){
              const inp=document.getElementById('dupfix-${i}');
              const nw=(inp?.value||'').trim();
              if(!nw){alert('새 이름을 입력하세요.');return;}
              if(players.find((x,xi)=>x.name===nw&&xi!==${i})){alert('이미 존재하는 이름입니다.');return;}
              editName=players[${i}].name;
              document.getElementById('emBody').innerHTML='';
              const oldN=players[${i}].name;
              players[${i}].name=nw;
              players.forEach(other=>{(other.history||[]).forEach(h=>{if(h.opp===oldN)h.opp=nw;});});
              [miniM,univM,comps,ckM,proM,ttM].forEach(arr=>(arr||[]).forEach(m=>{
                if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;
                (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(g.playerA===oldN)g.playerA=nw;if(g.playerB===oldN)g.playerB=nw;}));
              }));
              (tourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
                const br=tn.bracket||{};
                Object.values(br.matchDetails||{}).forEach(m=>{if(m&&m.a===oldN)m.a=nw;if(m&&m.b===oldN)m.b=nw;});
                (br.manualMatches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});
              });
              (proTourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
              });
              save();render();
            })()">✅ 적용</button>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>`;
  })()}
  ${_scfgD('univ','🏛️ 대학 관리')}
    <div style="font-size:11px;color:var(--gray-l);margin:8px 0 10px">👁️ 숨김 처리된 대학은 비로그인 상태에서 현황판에 표시되지 않습니다.</div>
    ${univCfg.map((u,i)=>{
      const isHidden = !!u.hidden;
      const isDissolved = !!u.dissolved;
      return `<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px;flex-wrap:wrap;gap:4px">
        <div class="cdot" style="background:${u.color};opacity:${isHidden?0.4:1}"></div>
        <input type="text" value="${u.name}" style="flex:1;max-width:130px;opacity:${isHidden?0.5:1}" onblur="const oldName=univCfg[${i}].name;const v=this.value.trim();if(!v){this.value=oldName;return;}if(v!==oldName&&univCfg.some((x,xi)=>xi!==${i}&&x.name===v)){alert('이미 추가된 대학명입니다.');this.value=oldName;return;}if(v!==oldName){renameUnivAcrossData(oldName,v);univCfg[${i}].name=v;save();render();}">
        ${isDissolved?`<span style="font-size:10px;background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;border-radius:5px;padding:1px 6px;font-weight:700">🏚️ 해체 ${u.dissolvedDate||''}</span>`:''}
        <input type="color" value="${u.color}" style="width:36px;height:30px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)" title="대학 색상" onchange="univCfg[${i}].color=this.value;this.previousElementSibling.previousElementSibling${isDissolved?'.previousElementSibling':''}.style.background=this.value;save();if(typeof renderBoard==='function')renderBoard()">
        ${isDissolved
          ? `<button class="btn btn-xs" style="background:#f0fdf4;color:#16a34a;border:1px solid #86efac" onclick="univCfg[${i}].dissolved=false;univCfg[${i}].hidden=false;delete univCfg[${i}].dissolvedDate;saveCfg();render()">🔄 복구</button>`
          : `<button class="btn btn-xs" style="background:${isHidden?'#fef2f2':'#f0fdf4'};color:${isHidden?'#dc2626':'#16a34a'};border:1px solid ${isHidden?'#fca5a5':'#86efac'};min-width:58px"
              onclick="univCfg[${i}].hidden=!univCfg[${i}].hidden;saveCfg();render()">
              ${isHidden?'👁️ 숨김':'✅ 표시'}</button>
            <button class="btn btn-xs" style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa" onclick="openDissolveModal(${i})">🏚️ 해체</button>`
        }
        <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
      </div>`;
    }).join('')}
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <input type="text" id="nu-n" placeholder="새 대학명" style="width:150px">
      <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
      <button class="btn btn-b" onclick="addUniv()">+ 대학 추가</button>
    </div></details>
  ${_scfgD('maps','🗺️ 맵 관리')}<div id="map-list">
    ${maps.map((m,i)=>`<div class="srow">
      <span style="font-size:14px">📍</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
    </div>`).join('')}
  </div><div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="새 맵 이름" style="width:200px" onkeydown="if(event.key==='Enter')addMap()">
    <button class="btn btn-b" onclick="addMap()">+ 맵 추가</button>
  </div></details>
  ${_scfgD('mAlias','⚡ 맵 약자 관리 <span style="font-size:11px;font-weight:400;color:var(--gray-l)">붙여넣기 입력 시 자동 변환</span>')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
      약자를 입력하면 경기 결과 붙여넣기 시 자동으로 전체 맵 이름으로 변환됩니다.<br>
      <span style="color:var(--blue);font-weight:600">예:</span> <code style="background:var(--surface);padding:1px 6px;border-radius:4px">녹 → 녹아웃</code>, <code style="background:var(--surface);padding:1px 6px;border-radius:4px">폴 → 폴리포이드</code>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">📦 기본 내장 약자 <span style="font-weight:400;color:var(--gray-l);font-size:10px">(✕ 클릭 시 비활성화)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.entries(PASTE_MAP_ALIAS_DEFAULT).filter(([k,v])=>k!==v).map(([k,v])=>{
          const disabled=(userMapAlias||{}).hasOwnProperty(k+'__disabled');
          return disabled
            ? `<span style="display:inline-flex;align-items:center;gap:3px;background:#f1f5f9;border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px;opacity:.5;text-decoration:line-through"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="restoreDefaultMapAlias('${encodeURIComponent(k)}')" style="background:none;border:none;cursor:pointer;color:#16a34a;font-size:10px;padding:0 2px;line-height:1;text-decoration:none" title="복원">↩</button></span>`
            : `<span style="display:inline-flex;align-items:center;gap:3px;background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="delDefaultMapAlias('${encodeURIComponent(k)}','${encodeURIComponent(v)}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0 2px;line-height:1" title="비활성화">✕</button></span>`;
        }).join('')}
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🔧 사용자 정의 약자</div>
    <div id="alias-list" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="alias-key" placeholder="약자 (예: 녹)" style="width:90px" maxlength="10" onkeydown="if(event.key==='Enter')addMapAlias()">
      <span style="color:var(--gray-l)">→</span>
      <input type="text" id="alias-val" list="alias-val-list" placeholder="맵 이름 입력..." autocomplete="off" style="width:180px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px" onkeydown="if(event.key==='Enter')addMapAlias()">
      <datalist id="alias-val-list">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b" onclick="addMapAlias()">+ 약자 추가</button>
    </div>
    <div id="alias-msg" style="font-size:12px;margin-top:6px;min-height:16px"></div>
  </details>
  ${_scfgD('hdr','🖼️ 헤더(상단바) 커스텀')}
    ${(()=>{ 
      const _t = (localStorage.getItem('su_hdr_title')||'스타대학 데이터 센터');
      const _li = (localStorage.getItem('su_hdr_left_icon')||'🏆');
      const _ls = parseInt(localStorage.getItem('su_hdr_left_size')||'22',10)||22;
      const _ri = (localStorage.getItem('su_hdr_right_img')||'');
      const _rs = parseInt(localStorage.getItem('su_hdr_right_size')||'32',10)||32;
      const _bg = (localStorage.getItem('su_hdr_bg_img')||'');
      const _hh = parseInt(localStorage.getItem('su_hdr_height')||'0',10)||0;
      return `
        <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">상단 헤더의 제목/아이콘/이미지/배경을 커스텀합니다. (URL은 https:// 로 시작)</div>
        <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">제목</div>
            <input id="cfg-hdr-title" type="text" value="${esc(_t)}" placeholder="예: 스타대학 데이터 센터" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">좌측 아이콘</div>
            <input id="cfg-hdr-left" type="text" value="${esc(_li)}" placeholder="이모지 또는 이미지 URL" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
            <span style="font-size:11px;color:var(--text3);font-weight:800">크기</span>
            <input id="cfg-hdr-left-sz" type="range" min="14" max="44" step="2" value="${Math.max(14,Math.min(44,_ls))}" oninput="document.getElementById('cfg-hdr-left-sz-v').textContent=this.value+'px'" onchange="cfgSetHeaderSettings()" style="width:160px">
            <span id="cfg-hdr-left-sz-v" style="font-size:11px;color:var(--gray-l);min-width:40px;font-weight:900">${Math.max(14,Math.min(44,_ls))}px</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">우측 이미지</div>
            <input id="cfg-hdr-right" type="text" value="${esc(_ri)}" placeholder="이미지 URL (없으면 비움)" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
            <span style="font-size:11px;color:var(--text3);font-weight:800">크기</span>
            <input id="cfg-hdr-right-sz" type="range" min="18" max="70" step="2" value="${Math.max(18,Math.min(70,_rs))}" oninput="document.getElementById('cfg-hdr-right-sz-v').textContent=this.value+'px'" onchange="cfgSetHeaderSettings()" style="width:160px">
            <span id="cfg-hdr-right-sz-v" style="font-size:11px;color:var(--gray-l);min-width:40px;font-weight:900">${Math.max(18,Math.min(70,_rs))}px</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">배경 이미지</div>
            <input id="cfg-hdr-bg" type="text" value="${esc(_bg)}" placeholder="배경 이미지 URL (없으면 비움)" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">헤더 높이</div>
            <input id="cfg-hdr-h" type="range" min="0" max="120" step="4" value="${Math.max(0,Math.min(120,_hh))}" oninput="document.getElementById('cfg-hdr-h-v').textContent=(this.value==0?'자동':this.value+'px')" onchange="cfgSetHeaderSettings()" style="width:240px">
            <span id="cfg-hdr-h-v" style="font-size:11px;color:var(--gray-l);min-width:56px;font-weight:900">${_hh?(_hh+'px'):'자동'}</span>
          </div>
        </div>
      </details>`;
    })()}
  ${_scfgD('si','🏷️ 스트리머 상태 아이콘 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">이름 우측에 표시될 상태 아이콘을 스트리머별로 지정합니다. 현황판·순위표·이미지 저장 모두 반영됩니다.</div>
    <!-- 커스텀 아이콘 추가 (URL/링크) -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🔗 커스텀 아이콘 추가 (URL · 이모지)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input type="text" id="si-url" placeholder="이미지 URL 또는 이모지 입력" style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="text" id="si-label" placeholder="이름 (선택)" style="width:110px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <button class="btn btn-b btn-sm" onclick="var e=document.getElementById('si-url').value.trim(),l=document.getElementById('si-label').value.trim();if(!e){alert('URL 또는 이모지를 입력하세요.');return;}addCustomStatusIcon(l||'커스텀',e);document.getElementById('si-url').value='';document.getElementById('si-label').value='';render()">+ 추가</button>
      </div>
      ${_customStatusIcons.length?`<div style="display:flex;flex-wrap:wrap;gap:6px">${_customStatusIcons.map((c,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:7px;background:var(--white);border:1.5px solid var(--blue);font-size:14px"><span style="display:inline-flex;align-items:center">${_siRender(c.emoji,'20px')||c.emoji}</span><span style="font-size:11px;color:var(--gray-l);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.label||''}</span><button onclick="removeCustomStatusIcon(${i});render()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0;line-height:1;margin-left:2px" title="삭제">×</button></span>`).join('')}</div>`
      :'<div style="font-size:11px;color:var(--gray-l)">추가된 커스텀 아이콘 없음</div>'}
    </div>
    <!-- 기본 아이콘 목록 -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🎭 기본 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STATUS_ICON_DEFS).filter(([id])=>id!=='none'&&!id.startsWith('_c')).map(([id,d])=>`<span style="padding:4px 10px;border-radius:7px;background:var(--white);border:1px solid var(--border);font-size:16px" title="${d.label}">${_siRender(d.emoji,'20px')||d.emoji}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">스트리머 정보 수정 또는 현황판 클릭 팝업에서 아이콘을 설정하세요.</div>
    </div>
    <!-- 스트리머별 아이콘 지정 -->
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">스트리머별 상태 아이콘 지정</div>
    <div id="cfg-si-list" style="max-height:320px;overflow-y:auto;border:1px solid var(--border);border-radius:8px">
      <div style="padding:16px;text-align:center;color:var(--gray-l);font-size:12px">로딩 중...</div>
    </div>
    <button class="btn btn-r btn-sm" style="margin-top:10px" onclick="if(confirm('모든 상태 아이콘을 초기화할까요?')){playerStatusIcons={};localStorage.setItem('su_psi','{}');render();}">전체 초기화</button>
  </details>
  ${_scfgD('tier','🎭 티어 관리')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${TIERS.map((t,i)=>`<div style="text-align:center;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:4px">
        ${getTierBadge(t)}
        <div style="font-size:10px;color:var(--gray-l)">${i+1}순위</div>
        ${!['G','K','JA','J','S','0티어'].includes(t)?`<button class="btn btn-r btn-xs" onclick="delTier('${t}')">🗑️ 삭제</button>`:''}
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="nt-name" placeholder="티어 이름 (예: 9티어)" style="width:160px">
      <button class="btn btn-b" onclick="addTier()">+ 티어 추가</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 기본 티어(G/K/JA/J/S/0티어)는 삭제할 수 없습니다.</div>
  </details>
  ${_scfgD('acct','👤 관리자 계정 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:4px">• <b>관리자</b>: 모든 기능 + 설정 접근 가능</div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">• <b>부관리자</b>: 경기 기록 입력만 가능 (설정/회원관리 불가)</div>
    <div style="margin-bottom:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">등록된 계정 (<span id="adm-count">-</span>명)</div>
      <div id="adm-list"></div>
      <button class="btn btn-r btn-xs" style="margin-top:10px" onclick="clearAllAdmins()">⚠️ 전체 초기화 (기본값 리셋)</button>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">+ 새 계정 추가</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="adm-id" placeholder="아이디" style="width:140px" autocomplete="off">
      <input type="password" id="adm-pw" placeholder="비밀번호 (4자 이상)" style="width:150px" autocomplete="new-password">
      <select id="adm-role" style="border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
        <option value="admin">👑 관리자</option>
        <option value="sub-admin">🔰 부관리자</option>
      </select>
      <button class="btn btn-p" onclick="addAdminAccount()">+ 추가</button>
    </div>
    <div id="adm-msg" style="font-size:12px;min-height:18px"></div>
  </details>
  ${_scfgD('storage','💾 로컬 저장소 사용량')}
    <div id="cfg-storage-wrap2">
      <div id="cfg-storage-info"><div style="color:var(--gray-l);font-size:12px">계산 중...</div></div>
      <button class="btn btn-w btn-sm" style="margin-top:8px" onclick="renderStorageInfo()">🔄 새로고침</button>
    </div>
  </details>
  ${_scfgD('selfcheck','🧪 설정 기능 점검')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">설정 화면에서 버튼/토글이 “눌러도 안되는” 경우, 핸들러(함수) 누락이 원인일 수 있습니다.</div>
    <button class="btn btn-b btn-sm" onclick="cfgRunSettingsSelfCheck()">🔎 설정 핸들러 점검</button>
    <div id="cfg-selfcheck-out" style="margin-top:10px"></div>
  </details>
  ${_scfgD('autofitall','📱 전역 자동 맞춤 (모든 탭)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">모바일/태블릿에서 <b>간격·패딩·카드/그리드 밀도·테이블</b>을 화면에 맞춰 자동 조절합니다. (전 탭 공통)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-autofitall-on" style="width:15px;height:15px" ${_afOn?'checked':''}
          onchange="cfgSetAutoFitAllTabs(this.checked)">
        전체 탭 자동 맞춤 사용
      </label>
      <div style="font-size:11px;color:var(--gray-l)">※ 켜면 화면 크기 변화(가로/세로 전환 포함)에 따라 자동 적용됩니다.</div>
    </div>
  </details>
  ${_scfgD('reccard','🧾 기록 카드(기록탭) 스타일')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">개인전/끝장전/미니/프로리그/대회 기록 목록에 쓰이는 “기록 카드” 스타일입니다. (대회탭 조별리그 일정 카드는 별도 설정)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-rc-theme-on" style="width:15px;height:15px" ${_rcOn?'checked':''} onchange="cfgSetRecCardSettings()">
        승리 대학색을 카드 배경/헤더에 연하게 적용
      </label>

      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">디자인 모드</div>
        <select id="cfg-rc-accent" onchange="cfgSetRecCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="none" ${_rcAccent==='none'?'selected':''}>무색</option>
          <option value="header" ${_rcAccent==='header'?'selected':''}>헤더만 포인트</option>
          <option value="border" ${_rcAccent==='border'?'selected':''}>테두리만 포인트</option>
          <option value="full" ${_rcAccent==='full'?'selected':''}>전체 배경 포인트</option>
          <option value="gradient" ${_rcAccent==='gradient'?'selected':''}>그라디언트 헤더</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ 체크를 끄면 무조건 무색</span>
      </div>

      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">스코어/좌우 배치(PC)</div>
        <select id="cfg-rc-vs-align" onchange="cfgSetRecCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="left" ${(localStorage.getItem('su_rc_vs_align')||'left')==='left'?'selected':''}>좌측</option>
          <option value="center" ${(localStorage.getItem('su_rc_vs_align')||'left')==='center'?'selected':''}>가운데</option>
          <option value="right" ${(localStorage.getItem('su_rc_vs_align')||'left')==='right'?'selected':''}>우측</option>
        </select>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--text3);font-weight:800">스코어 크기</span>
          <input type="range" id="cfg-rc-score-scale" min="80" max="130" step="5" value="${Math.max(80,Math.min(130,parseInt(localStorage.getItem('su_rc_score_scale')||'100',10)||100))}" oninput="document.getElementById('cfg-rc-score-scale-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:140px">
          <span id="cfg-rc-score-scale-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(80,Math.min(130,parseInt(localStorage.getItem('su_rc_score_scale')||'100',10)||100))}%</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">카드 배경 색상 강도</div>
          <input type="range" id="cfg-rc-bg" min="0" max="30" step="1" value="${Math.max(0,Math.min(30,_rcBg))}" oninput="document.getElementById('cfg-rc-bg-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-bg-v">${Math.max(0,Math.min(30,_rcBg))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">카드 헤더 색상 강도</div>
          <input type="range" id="cfg-rc-hd" min="0" max="30" step="1" value="${Math.max(0,Math.min(30,_rcHd))}" oninput="document.getElementById('cfg-rc-hd-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-hd-v">${Math.max(0,Math.min(30,_rcHd))}%</span></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">대학 아이콘 크기(기록 카드)</div>
          <input type="range" id="cfg-rc-uicon" min="12" max="28" step="1" value="${Math.max(12,Math.min(28,_rcIc))}" oninput="document.getElementById('cfg-rc-ic-v').textContent=this.value+'px'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-ic-v">${Math.max(12,Math.min(28,_rcIc))}px</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">스트리머 프로필 이미지 크기(전역 배율)</div>
          <input type="range" id="cfg-ava-scale" min="70" max="160" step="5" value="${Math.max(70,Math.min(160,_avaScale))}" oninput="document.getElementById('cfg-ava-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-ava-v">${Math.max(70,Math.min(160,_avaScale))}%</span></div>
        </div>
      </div>

      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-rc-memo-on" style="width:15px;height:15px" ${_rcMemoOn?'checked':''} onchange="cfgSetRecCardSettings()">
        기록 카드에서 메모 입력 기능 사용(관리자)
      </label>
      <div style="font-size:11px;color:var(--gray-l)">※ 메모가 이미 저장된 경우는 항상 표시됩니다. 이 옵션은 “입력칸”만 켜고 끕니다.</div>
    </div>
  </details>
  ${(()=>{ 
    const _tcOn = (localStorage.getItem('su_tc_theme_on') ?? '0') === '1';
    const _tcAccent = (localStorage.getItem('su_tc_accent_mode') ?? 'none');
    const _tcHd = parseInt(localStorage.getItem('su_tc_hd_alpha') ?? '12',10) || 12;
    const _tcBw = parseInt(localStorage.getItem('su_tc_border_w') ?? '4',10) || 4;
    const _tcIc = parseInt(localStorage.getItem('su_tc_uicon') ?? '34',10) || 34;
    const _tcLw = parseInt(localStorage.getItem('su_tc_line_w') ?? '2',10) || 2;
    const _tcLa = parseInt(localStorage.getItem('su_tc_line_a') ?? '70',10) || 70;
    const _tcPreset = (localStorage.getItem('su_tc_preset') ?? '기본');
    const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') ?? 'pill'); // pill | asl
    return _scfgD('tourneycard','🏆 대회 카드(대회탭) 스타일') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">대회탭 “조별리그 일정/대진표” 카드 스타일입니다. 기록탭 카드와 <b>별도</b>로 설정됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-tc-theme-on" style="width:15px;height:15px" ${_tcOn?'checked':''} onchange="cfgSetTourneyCardSettings()">
        대회 카드 디자인 모드 사용
      </label>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">날짜 버튼 메뉴</div>
        <select id="cfg-date-menu-style" onchange="cfgSetDateMenuStyle()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="pill" ${_dateMenuStyle!=='asl'?'selected':''}>기본 (pill)</option>
          <option value="asl" ${_dateMenuStyle==='asl'?'selected':''}>ASL 스타일 (날짜+미니매치업)</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">대회탭/프로리그 대회탭 상단 날짜 필터에 적용</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">토너먼트/대진표 프리셋</div>
        <select id="cfg-tc-preset" onchange="localStorage.setItem('su_tc_preset',this.value);cfgApplyBracketPreset(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="기본" ${_tcPreset==='기본'?'selected':''}>기본</option>
          <option value="월드컵" ${_tcPreset==='월드컵'?'selected':''}>월드컵</option>
          <option value="프로리그" ${_tcPreset==='프로리그'?'selected':''}>프로리그</option>
          <option value="컴팩트" ${_tcPreset==='컴팩트'?'selected':''}>컴팩트</option>
          <option value="미니멀" ${_tcPreset==='미니멀'?'selected':''}>미니멀 (깔끔함)</option>
          <option value="다크리그" ${_tcPreset==='다크리그'?'selected':''}>다크리그 (강한 포인트)</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ 아래 슬라이더 값도 같이 변경됩니다</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">디자인 모드</div>
        <select id="cfg-tc-accent" onchange="cfgSetTourneyCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="none" ${_tcAccent==='none'?'selected':''}>무색</option>
          <option value="header" ${_tcAccent==='header'?'selected':''}>상단 바 포인트</option>
          <option value="border" ${_tcAccent==='border'?'selected':''}>테두리 포인트</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">상단 바 색상 강도</div>
          <input type="range" id="cfg-tc-hd" min="0" max="30" step="1" value="${Math.max(0,Math.min(30,_tcHd))}" oninput="document.getElementById('cfg-tc-hd-v').textContent=this.value+'%'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-hd-v">${Math.max(0,Math.min(30,_tcHd))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">테두리 두께</div>
          <input type="range" id="cfg-tc-bw" min="2" max="6" step="1" value="${Math.max(2,Math.min(6,_tcBw))}" oninput="document.getElementById('cfg-tc-bw-v').textContent=this.value+'px'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-bw-v">${Math.max(2,Math.min(6,_tcBw))}px</span></div>
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">대학 로고 크기(대회 카드)</div>
        <input type="range" id="cfg-tc-uicon" min="24" max="48" step="2" value="${Math.max(24,Math.min(48,_tcIc))}" oninput="document.getElementById('cfg-tc-ic-v').textContent=this.value+'px'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-ic-v">${Math.max(24,Math.min(48,_tcIc))}px</span></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">브라켓 연결선 두께</div>
          <input type="range" id="cfg-tc-line-w" min="1" max="4" step="1" value="${Math.max(1,Math.min(4,_tcLw))}" oninput="document.getElementById('cfg-tc-lw-v').textContent=this.value+'px'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-lw-v">${Math.max(1,Math.min(4,_tcLw))}px</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">브라켓 연결선 진하기</div>
          <input type="range" id="cfg-tc-line-a" min="25" max="100" step="5" value="${Math.max(25,Math.min(100,_tcLa))}" oninput="document.getElementById('cfg-tc-la-v').textContent=this.value+'%'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-la-v">${Math.max(25,Math.min(100,_tcLa))}%</span></div>
        </div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const _chip = (localStorage.getItem('su_cal_chip_mode') ?? 'types');
    const _shareAdm = (localStorage.getItem('su_share_admin_only') ?? '0') === '1';
    return _scfgD('calui','📅 캘린더 표시/버튼') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">캘린더 탭의 날짜 칸 표시와 카드 버튼 구성을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">월간/주간 날짜칸 요약</div>
        <select id="cfg-cal-chip" onchange="cfgSetCalendarUiSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="total" ${_chip==='total'?'selected':''}>총 경기수만</option>
          <option value="types" ${_chip!=='total'?'selected':''}>총 + 상위2종류</option>
        </select>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-share-adminonly" style="width:15px;height:15px" ${_shareAdm?'checked':''} onchange="cfgSetCalendarUiSettings()">
        공유 버튼 숨기기(관리자만 표시)
      </label>
      <div style="font-size:11px;color:var(--gray-l)">※ 관리자=로그인 상태. 기록/대회/캘린더 카드의 공유 버튼이 함께 적용됩니다.</div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const p = (localStorage.getItem('su_app_font_preset') ?? 'noto');
    const css = (localStorage.getItem('su_app_font_css') ?? '');
    const fam = (localStorage.getItem('su_app_font_family') ?? '');
    return _scfgD('appfont','🅰️ 전역 폰트') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">앱 전체 폰트를 변경합니다. (프리셋 + 사용자 CSS URL 지원)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">프리셋</div>
        <select id="cfg-appfont-preset" onchange="cfgSetAppFontSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="system" ${p==='system'?'selected':''}>시스템</option>
          <option value="noto" ${p==='noto'?'selected':''}>Noto Sans KR</option>
          <option value="pretendard" ${p==='pretendard'?'selected':''}>Pretendard</option>
          <option value="nanum" ${p==='nanum'?'selected':''}>나눔고딕</option>
          <option value="gmarket" ${p==='gmarket'?'selected':''}>GmarketSans</option>
          <option value="dohyeon" ${p==='dohyeon'?'selected':''}>Do Hyeon (개성있는 한글)</option>
          <option value="blackhansans" ${p==='blackhansans'?'selected':''}>Black Han Sans (굵은 헤드라인)</option>
          <option value="ibmplexsans" ${p==='ibmplexsans'?'selected':''}>IBM Plex Sans KR (정갈함)</option>
        </select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">추가 CSS URL</div>
        <input type="text" id="cfg-appfont-css" value="${css.replace(/\"/g,'&quot;')}" placeholder="예) https://.../font.css" style="flex:1;min-width:260px" onchange="cfgSetAppFontSettings()">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">font-family</div>
        <input type="text" id="cfg-appfont-family" value="${fam.replace(/\"/g,'&quot;')}" placeholder="비우면 프리셋 기본값 사용" style="flex:1;min-width:260px" onchange="cfgSetAppFontSettings()">
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.5">
        • 예: <span style="font-family:ui-monospace,monospace">Pretendard Variable, Pretendard, Noto Sans KR, sans-serif</span><br>
        • 유튜브/트위치 같은 외부 사이트 폰트는 적용되지 않을 수 있습니다.
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const pct = parseInt(localStorage.getItem('su_btn_scale_pct')||'100',10)||100;
    const br  = parseInt(localStorage.getItem('su_btn_r')||'8',10)||8;
    const pr  = parseInt(localStorage.getItem('su_pill_r')||'20',10)||20;
    return _scfgD('uibtn','🎛️ 버튼 스타일') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">앱 전체 버튼/필(탭·필터) 크기와 라운드를 조절합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">버튼 크기</div>
        <input type="range" id="cfg-btnscale" min="85" max="125" step="5" value="${Math.max(85,Math.min(125,pct))}"
          oninput="document.getElementById('cfg-btnscale-v').textContent=this.value+'%'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-btnscale-v">${Math.max(85,Math.min(125,pct))}%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">버튼 라운드</div>
          <input type="range" id="cfg-btnr" min="4" max="18" step="1" value="${Math.max(4,Math.min(18,br))}"
            oninput="document.getElementById('cfg-btnr-v').textContent=this.value+'px'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-btnr-v">${Math.max(4,Math.min(18,br))}px</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">필(탭/정렬) 라운드</div>
          <input type="range" id="cfg-pillr" min="12" max="28" step="1" value="${Math.max(12,Math.min(28,pr))}"
            oninput="document.getElementById('cfg-pillr-v').textContent=this.value+'px'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-pillr-v">${Math.max(12,Math.min(28,pr))}px</span></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-w btn-sm" onclick="cfgResetUiBtnStyleSettings()">초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 모바일에서는 터치 편의 때문에 최소 높이가 유지될 수 있습니다.</span>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">미리보기</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <button class="btn btn-b">기본</button>
          <button class="btn btn-w">화이트</button>
          <button class="btn btn-p">포인트</button>
          <button class="btn btn-r">삭제</button>
          <button class="btn btn-w btn-sm">SM</button>
          <button class="btn btn-w btn-xs">XS</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          <button class="pill on">필 ON</button>
          <button class="pill">필 OFF</button>
          <button class="sort-btn on">정렬 ON</button>
          <button class="sort-btn">정렬</button>
        </div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const lock = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
    const enabled = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
    return _scfgD('uifilter','🔽 필터/하위메뉴') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">대전기록/통계/개인전/대학대전/대회/프로리그 등의 하위메뉴 표시 방식을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-filter-lock" style="width:15px;height:15px" ${lock?'checked':''} onchange="cfgSetUiFilterMenuSettings()">
        필터 항상 펼치기(접기 비활성)
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-submenu-filter" style="width:15px;height:15px" ${enabled?'checked':''} onchange="cfgSetUiFilterMenuSettings()">
        하위메뉴를 ‘필터’로 접기/펼치기 사용
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <button class="btn btn-w btn-sm" onclick="cfgResetUiFilterMenuSettings()">초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 체크 해제 시 하위 메뉴가 항상 보이게 됩니다.</span>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const compat = (localStorage.getItem('su_paste_compat') ?? '1') === '1';
    return _scfgD('paste','🤖 자동인식') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">경기 결과 붙여넣기 ‘자동인식’이 잘 안 될 때 호환 옵션을 켜두면 인식률이 올라갑니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-paste-compat" style="width:15px;height:15px" ${compat?'checked':''} onchange="cfgSetPasteCompatSettings()">
        호환 모드 (전각괄호/🆚/VS 공백 없음 등)
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <button class="btn btn-w btn-sm" onclick="cfgResetPasteCompatSettings()">초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 기본값 ON 권장</span>
      </div>
    </div>
    <div style="height:12px"></div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:8px">🔁 변환툴 (리포트 포맷)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        가공되지 않은 텍스트를 붙여넣으면 아래 규칙으로 변환합니다: <b>승자 굵게</b> · ✅/⬜ · 🆚️ · 맵 약어 교정 · 최종 스코어 출력
      </div>
      <textarea id="cfg-paste-conv-in" rows="7" placeholder="여기에 원본 경기 텍스트를 붙여넣기..." style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;resize:vertical;background:var(--surface);color:var(--text1);box-sizing:border-box"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-b btn-sm" onclick="cfgPasteConvertRun()">변환</button>
        <button class="btn btn-w btn-sm" onclick="cfgPasteConvertCopy()">복사</button>
      </div>
      <pre id="cfg-paste-conv-out" style="margin-top:12px;white-space:pre-wrap;word-break:break-word;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:12px;line-height:1.6;min-height:70px"></pre>
    </div>
  </details>`;
  })()}
  ${_scfgD('firebase','☁️ Firebase 실시간 동기화')}
    <div id="cfg-fb-body">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">관리자가 데이터를 저장할 때 Firebase에 자동으로 업로드됩니다. 다른 기기에서도 실시간으로 반영됩니다.</p>
    <div id="cfg-fb-sync-panel" style="margin-bottom:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <span style="font-size:12px;font-weight:700;color:var(--blue)">🔄 동기화 상태</span>
        <button class="btn btn-w btn-xs" onclick="checkFbSyncStatus()">🔍 지금 확인</button>
      </div>
      <div id="cfg-fb-sync-result" style="font-size:12px;color:var(--gray-l)">확인 버튼을 눌러 상태를 확인하세요.</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">Firebase 비밀번호</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">Firebase Security Rules에서 설정한 admin_pw 값을 입력하세요. 저장 시 이 비밀번호로 쓰기 인증됩니다.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-fb-pw" placeholder="Firebase 비밀번호 입력..." style="width:220px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveFbPw()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearFbPw()">지우기</button>
      </div>
      <div id="fb-pw-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_fb_pw')?'✅ 비밀번호 설정됨':'미설정'}</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:8px">GitHub 토큰 (관람자 수천 명 무료 지원)</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:6px">설정 시: 저장할 때 GitHub data.json도 자동 업로드 → 관람자들이 GitHub CDN에서 데이터를 받아 Firebase 동시접속 100명 제한 없이 수천 명도 무료로 지원됩니다.</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token → Contents: Read and Write 권한 발급</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-gh-token" placeholder="ghp_xxxxxxxxxxxx" style="width:260px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveGhToken()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearGhToken()">지우기</button>
      </div>
      <div id="gh-token-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_gh_token')?'✅ 토큰 설정됨 (저장 시 GitHub 자동 업로드 활성)':'미설정 (관람자는 Firebase 사용 중)'}</div>
    </div>
    </div>
  </details>
  ${_scfgD('season','🏆 시즌 관리','id="cfg-season-sec"')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">시즌을 정의하면 대전기록·통계 등 모든 탭에서 시즌 단위로 필터링할 수 있습니다.</p>
    <div id="cfg-season-list" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시즌 이름</label>
        <input type="text" id="cfg-season-name" placeholder="예: 2025 스프링" style="width:140px;font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시작일</label>
        <input type="date" id="cfg-season-from" style="font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">종료일</label>
        <input type="date" id="cfg-season-to" style="font-size:12px">
      </div>
      <button class="btn btn-b btn-sm" onclick="addSeason()">+ 시즌 추가</button>
    </div>
  </details>
  ${_scfgD('teammatch','👥 팀 매치 설정 (2:2 / 3:3 / 4:4전)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">붙여넣기 자동 인식 및 경기 입력에서 팀 매치(2:2·3:3·4:4전)를 지원합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">⚙️ 기본 팀 규모</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${['1v1','2v2','3v3','4v4'].map(t=>`<button class="pill ${(localStorage.getItem('su_teamMatchSize')||'1v1')===t?'on':''}" id="cfg-tm-${t.replace(':','')}" onclick="localStorage.setItem('su_teamMatchSize','${t}');document.querySelectorAll('[id^=cfg-tm-]').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${t}전</button>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px">경기 입력 모달에서 사용할 기본 팀 규모 (기본: 1v1)</div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:6px">📋 자동인식 형식 안내</div>
        <div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--text2);line-height:2">
          <div>• <code>선수A+선수B 승 선수C+선수D</code> → 2:2전 승리</div>
          <div>• <code>선수A+선수B+선수C 승 선수D+선수E+선수F</code> → 3:3전</div>
          <div>• <code>선수A+선수B > 선수C+선수D [맵명]</code> → 맵 포함</div>
          <div style="color:var(--gray-l);margin-top:4px">※ 붙여넣기 모달에서 "+" 기호로 팀원을 연결하면 자동 인식됩니다.</div>
        </div>
      </div>
    </div>
  </details>
    ${_scfgD('bulkdate','📅 날짜 일괄 변경')}
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">변경 전 날짜</label>
        <input type="date" id="bulk-date-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경 후</label>
        <input type="date" id="bulk-date-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-date-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeDate()">📅 날짜 일괄 변경</button>
      <span id="bulk-date-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
  </details>
  ${_scfgD('bulkmap','🗺️ 맵 이름 일괄 교체')}
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">교체 전</label>
        <input type="text" id="bulk-map-from" placeholder="예: 투혼II" style="font-size:12px;width:120px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 교체 후</label>
        <input type="text" id="bulk-map-to" placeholder="예: 투혼" style="font-size:12px;width:120px">
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeMap()">🗺️ 맵 일괄 교체</button>
      <span id="bulk-map-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
  </details>
  ${_scfgD('bulktier','🎖️ 선수 일괄 티어 변경')}
    <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">현재 티어</label>
        <select id="bulk-tier-from" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 (상관없음)</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경할 티어</label>
        <select id="bulk-tier-to" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">선택</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">대상 대학</label>
        <select id="bulk-tier-univ" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 대학</option>
          ${getAllUnivs().map(u=>`<option value="${u.name}">${u.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeTier()">🎖️ 티어 일괄 변경</button>
      <span id="bulk-tier-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
    </div>
  </details>
  ${_scfgD('bulkdel','🗑️ 날짜 범위 일괄 삭제')}
    <div style="padding:14px;background:#fff5f5;border:1px solid #fca5a5;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">시작일</label>
        <input type="date" id="bulk-del-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">~</label>
        <input type="date" id="bulk-del-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-del-chk-${m}" style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-r btn-sm" onclick="bulkDeleteByDate()">🗑️ 범위 삭제 (되돌릴 수 없음)</button>
      <span id="bulk-del-result" style="font-size:12px;margin-left:8px;color:var(--red)"></span>
    </div>
  </details>
  ${_scfgD('bulkconv','🔄 세트제 → 게임수 합산 일괄 변환')}
    <div style="padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:10px">
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">sets 배열의 게임 수 합산으로 sa/sb를 재계산합니다.<br>세트 수와 게임 수가 다른 경기만 변환됩니다.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-conv-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkConvertToGameScore()">🔄 게임수 합산으로 변환</button>
      <span id="bulk-conv-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
    </div>
  </details>
  ${_scfgD('boardbg','🖼️ 현황판 라벨 배경 이미지별 설정')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">각 대학 라벨에 배경 이미지를 설정할 수 있습니다. 이미지 위치와 크기도 조절 가능합니다.</p>
    <div id="cfg-board-bg-list" style="max-height:400px;overflow-y:auto"></div>
  </details>
  ${_scfgD('sync','🔄 데이터 동기화')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">경기 기록을 각 탭 기록 및 스트리머 최근 경기에 반영합니다.</div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:12px">
        <div style="font-weight:1000;font-size:12px;margin-bottom:6px">📦 설정 내보내기/가져오기 (다른 기기 적용)</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">설정만 코드로 복사해 다른 기기(모바일/태블릿/PC)에 붙여넣어 적용할 수 있습니다. (경기 데이터는 포함 안됨)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-w btn-sm" onclick="cfgFillSettingsCode()">코드 생성</button>
          <button class="btn btn-w btn-sm" onclick="cfgCopySettingsCode()">복사</button>
          <button class="btn btn-b btn-sm" onclick="cfgImportSettingsCode()">이 기기에 적용</button>
        </div>
        <textarea id="cfg-sync-code" placeholder="여기에 코드가 표시됩니다 (또는 다른 기기에서 복사한 코드를 붙여넣으세요)" style="width:100%;min-height:90px;border:1px solid var(--border2);border-radius:10px;padding:10px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;resize:vertical"></textarea>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const n=syncAllHistory?syncAllHistory():0;
          alert('✅ 티어대회 기록 동기화 + '+n+'건 스트리머 반영 완료');render();">🔄 전체 동기화 (기록탭 + 스트리머)</button>
        <span style="font-size:11px;color:var(--gray-l)">티어대회 기록탭·대전기록 반영 + 스트리머 최근 경기 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const before=ttM.length;save();render();
          alert('✅ 티어대회 기록 동기화 완료\\n추가된 기록: '+(ttM.length-before)+'건');">🎯 티어대회 기록 동기화</button>
        <span style="font-size:11px;color:var(--gray-l)">조별리그·토너먼트 경기를 기록탭·대전기록에 반영 (누락 시 사용)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="syncAllHistoryBtn()">📋 스트리머 최근 경기 반영</button>
        <span style="font-size:11px;color:var(--gray-l)">모든 경기를 스트리머 상세의 최근 경기에 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-w btn-sm" onclick="
          const seen=new Set();let removed=0;
          ttM=ttM.filter(m=>{if(!m._id)return true;if(seen.has(m._id)){removed++;return false;}seen.add(m._id);return true;});
          save();render();alert('✅ ttM 중복 제거 완료: '+removed+'건 삭제');
        ">🗑️ 중복 경기 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">같은 _id로 이중 등록된 티어대회 경기 제거</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-y btn-sm" onclick="deduplicatePlayerHistory()">🧹 중복 기록 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">스트리머 history에서 중복 항목만 제거 (승패/ELO 재계산)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-r btn-sm" onclick="rebuildAllPlayerHistory()">🔄 전체 경기 기록 복구</button>
        <span style="font-size:11px;color:var(--gray-l)">대전 데이터에서 스트리머 history 재구성 (기존 history 초기화됨)</span>
      </div>
    </div>
  </details>
  ${_scfgD('b2layout','📐 이미지탭 레이아웃')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭(프로필 탭)의 좌우 비율과 높이를 설정합니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b" onclick="cfgAutoFitBoard()">📱 이미지탭 자동 맞춤(원클릭)</button>
        <span style="font-size:11px;color:var(--gray-l)">※ “전역 자동 맞춤(모든 탭)”과 별개로, <b>이미지탭(프로필)</b> 전용 프리셋입니다.</span>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">좌측(이미지) 너비</label>
          <span id="cfg-b2-left-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">55%</span>
        </div>
        <input type="range" id="cfg-b2-left-size" min="30" max="70" step="1" value="55" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-left-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-right-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-right-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">우측(목록) 너비</label>
          <span id="cfg-b2-right-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">45%</span>
        </div>
        <input type="range" id="cfg-b2-right-size" min="30" max="70" step="1" value="45" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-right-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-left-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-left-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">PC 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-pc-height" value="600" min="400" max="900" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">태블릿 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-tablet-height" value="400" min="300" max="700" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">모바일 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-mobile-height" value="320" min="200" max="600" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:4px">
          <div style="display:flex;flex-direction:column;gap:8px">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:700">
              <input type="checkbox" id="cfg-b2-auto-resize" checked style="width:15px;height:15px"> 자동 크기 조절(좌우 비율)
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:700">
              <input type="checkbox" id="cfg-b2-auto-height" checked style="width:15px;height:15px"> 모바일/태블릿 높이 자동 맞춤(추천)
            </label>
          </div>
        </div>
      </div>
      <button class="btn btn-b" onclick="saveB2LayoutSettings()" style="align-self:flex-start">💾 레이아웃 저장</button>
    </div>
  </details>
  ${_scfgD('b2femco','🧩 펨코현황 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">현황판 &gt; 펨코현황판에서 사용하는 전용 설정입니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-femco-autoLayout" style="width:15px;height:15px" onchange="cfgFemcoUpd('autoLayout', this.checked?1:0)">
          인원수/화면폭에 맞춰 자동 레이아웃(추천)
        </label>
        <button class="btn btn-w btn-xs" style="margin-left:auto" onclick="(function(){cfgFemcoUpd('autoLayout',1);try{document.getElementById('cfg-femco-autoLayout').checked=true;}catch(e){};alert('✅ 자동 레이아웃으로 되돌렸습니다');render();})()">🔄 자동으로 되돌리기</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 아래 수동 값을 조절하면 자동 레이아웃이 자동으로 꺼집니다</span>
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학 로고 크기</div>
        <input type="range" id="cfg-femco-logoSize" min="60" max="520" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoSizeNum').value=this.value;cfgFemcoUpd('logoSize',this.value)">
        <input type="number" id="cfg-femco-logoSizeNum" min="60" max="520" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-logoSize').value=this.value;cfgFemcoUpd('logoSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">배경 투명(오버레이)</div>
        <input type="range" id="cfg-femco-bgOverlay" min="0" max="70" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOverlayNum').value=this.value;cfgFemcoUpd('bgOverlay',this.value)">
        <input type="number" id="cfg-femco-bgOverlayNum" min="0" max="70" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-bgOverlay').value=this.value;cfgFemcoUpd('bgOverlay',this.value)">
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:-6px">0=투명(원본 그대로) · 70=글자 잘 보이게 진하게</div>

      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:800;color:var(--text2)">
        <input type="checkbox" id="cfg-femco-logoAttachTitle" style="width:14px;height:14px" onchange="cfgFemcoUpd('logoAttachTitle', this.checked?1:0)">
        로고를 대학명과 같이 이동(체크 해제 시 ‘로고만’ 위치 이동)
      </label>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 로고 위치</div>
        <select id="cfg-femco-logoPos" onchange="cfgFemcoUpd('logoPos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="left">좌측</option>
          <option value="right">우측</option>
          <option value="top">상단</option>
          <option value="bottom">하단</option>
          <option value="center">가운데</option>
        </select>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학명 위치(로고 기준)</div>
        <select id="cfg-femco-titlePos" onchange="cfgFemcoUpd('titlePos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="right">로고 우측</option>
          <option value="left">로고 좌측</option>
          <option value="bottom">로고 아래</option>
          <option value="top">로고 위</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ ‘로고를 대학명과 같이 이동’ 켠 상태에서 적용</span>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">로고 좌우 이동</div>
        <input type="range" id="cfg-femco-logoOffsetX" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoOffsetXNum').value=this.value;cfgFemcoUpd('logoOffsetX',this.value)">
        <input type="number" id="cfg-femco-logoOffsetXNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-logoOffsetX').value=this.value;cfgFemcoUpd('logoOffsetX',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">로고 상하 이동</div>
        <input type="range" id="cfg-femco-logoOffsetY" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoOffsetYNum').value=this.value;cfgFemcoUpd('logoOffsetY',this.value)">
        <input type="number" id="cfg-femco-logoOffsetYNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-logoOffsetY').value=this.value;cfgFemcoUpd('logoOffsetY',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학명 좌우 이동</div>
        <input type="range" id="cfg-femco-titleOffsetX" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleOffsetXNum').value=this.value;cfgFemcoUpd('titleOffsetX',this.value)">
        <input type="number" id="cfg-femco-titleOffsetXNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-titleOffsetX').value=this.value;cfgFemcoUpd('titleOffsetX',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학명 상하 이동</div>
        <input type="range" id="cfg-femco-titleOffsetY" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleOffsetYNum').value=this.value;cfgFemcoUpd('titleOffsetY',this.value)">
        <input type="number" id="cfg-femco-titleOffsetYNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-titleOffsetY').value=this.value;cfgFemcoUpd('titleOffsetY',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">로고-대학명 간격</div>
        <input type="range" id="cfg-femco-headGap" min="0" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-headGapNum').value=this.value;cfgFemcoUpd('headGap',this.value)">
        <input type="number" id="cfg-femco-headGapNum" min="0" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-headGap').value=this.value;cfgFemcoUpd('headGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학명 폰트 크기</div>
        <input type="range" id="cfg-femco-titleSize" min="16" max="44" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleSizeNum').value=this.value;cfgFemcoUpd('titleSize',this.value)">
        <input type="number" id="cfg-femco-titleSizeNum" min="16" max="44" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-titleSize').value=this.value;cfgFemcoUpd('titleSize',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학명 폰트</div>
        <select id="cfg-femco-titleFont" onchange="cfgFemcoUpd('titleFont',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="system">기본(시스템)</option>
          <option value="app">전역 폰트</option>
          <option value="noto">Noto Sans KR</option>
          <option value="pretendard">Pretendard</option>
          <option value="nanum">나눔고딕</option>
          <option value="gmarket">GmarketSans</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">스트리머 이미지 크기</div>
        <input type="range" id="cfg-femco-playerImgSize" min="28" max="90" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-playerImgSizeNum').value=this.value;cfgFemcoUpd('playerImgSize',this.value)">
        <input type="number" id="cfg-femco-playerImgSizeNum" min="28" max="90" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-playerImgSize').value=this.value;cfgFemcoUpd('playerImgSize',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">이미지 모양</div>
        <select id="cfg-femco-playerImgShape" onchange="cfgFemcoUpd('playerImgShape',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="square">네모</option>
          <option value="circle">원</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">이름 폰트 크기</div>
        <input type="range" id="cfg-femco-nameFontSize" min="10" max="20" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-nameFontSizeNum').value=this.value;cfgFemcoUpd('nameFontSize',this.value)">
        <input type="number" id="cfg-femco-nameFontSizeNum" min="10" max="20" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-nameFontSize').value=this.value;cfgFemcoUpd('nameFontSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">직급 폰트 크기</div>
        <input type="range" id="cfg-femco-roleFontSize" min="9" max="16" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-roleFontSizeNum').value=this.value;cfgFemcoUpd('roleFontSize',this.value)">
        <input type="number" id="cfg-femco-roleFontSizeNum" min="9" max="16" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-roleFontSize').value=this.value;cfgFemcoUpd('roleFontSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">티어 아이콘 크기</div>
        <input type="range" id="cfg-femco-tierBadgeSize" min="9" max="16" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-tierBadgeSizeNum').value=this.value;cfgFemcoUpd('tierBadgeSize',this.value)">
        <input type="number" id="cfg-femco-tierBadgeSizeNum" min="9" max="16" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-tierBadgeSize').value=this.value;cfgFemcoUpd('tierBadgeSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">⭐ 아이콘 크기</div>
        <input type="range" id="cfg-femco-starSize" min="10" max="28" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-starSizeNum').value=this.value;cfgFemcoUpd('starSize',this.value)">
        <input type="number" id="cfg-femco-starSizeNum" min="10" max="28" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-starSize').value=this.value;cfgFemcoUpd('starSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">상태 아이콘 크기</div>
        <input type="range" id="cfg-femco-statusIconSize" min="10" max="34" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-statusIconSizeNum').value=this.value;cfgFemcoUpd('statusIconSize',this.value)">
        <input type="number" id="cfg-femco-statusIconSizeNum" min="10" max="34" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-statusIconSize').value=this.value;cfgFemcoUpd('statusIconSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">세로 인원(줄)</div>
        <input type="range" id="cfg-femco-rowsPerCol" min="2" max="12" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-rowsPerColNum').value=this.value;cfgFemcoUpd('rowsPerCol',this.value)">
        <input type="number" id="cfg-femco-rowsPerColNum" min="2" max="12" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-rowsPerCol').value=this.value;cfgFemcoUpd('rowsPerCol',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">스트리머 폭</div>
        <input type="range" id="cfg-femco-colWidth" min="80" max="360" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-colWidthNum').value=this.value;cfgFemcoUpd('colWidth',this.value)">
        <input type="number" id="cfg-femco-colWidthNum" min="80" max="360" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-colWidth').value=this.value;cfgFemcoUpd('colWidth',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">내용 정렬</div>
        <select id="cfg-femco-contentAlign" onchange="cfgFemcoUpd('contentAlign', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="left">왼쪽</option>
          <option value="center">가운데</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ ‘너무 좌측’ 느낌이면 가운데 + 좌우 여백을 키워보세요</span>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">좌우 여백</div>
        <input type="range" id="cfg-femco-contentPadX" min="0" max="40" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-contentPadXNum').value=this.value;cfgFemcoUpd('contentPadX',this.value)">
        <input type="number" id="cfg-femco-contentPadXNum" min="0" max="40" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-contentPadX').value=this.value;cfgFemcoUpd('contentPadX',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">내용 좌우 이동</div>
        <input type="range" id="cfg-femco-contentOffsetX" min="-40" max="40" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-contentOffsetXNum').value=this.value;cfgFemcoUpd('contentOffsetX',this.value)">
        <input type="number" id="cfg-femco-contentOffsetXNum" min="-40" max="40" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-contentOffsetX').value=this.value;cfgFemcoUpd('contentOffsetX',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">상하(행) 간격</div>
        <input type="range" id="cfg-femco-colGap" min="0" max="28" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-colGapNum').value=this.value;cfgFemcoUpd('colGap',this.value)">
        <input type="number" id="cfg-femco-colGapNum" min="0" max="28" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-colGap').value=this.value;cfgFemcoUpd('colGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학 간 여백</div>
        <input type="range" id="cfg-femco-univGap" min="0" max="120" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-univGapNum').value=this.value;cfgFemcoUpd('univGap',this.value)">
        <input type="number" id="cfg-femco-univGapNum" min="0" max="120" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-univGap').value=this.value;cfgFemcoUpd('univGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">인원수 폰트 크기</div>
        <input type="range" id="cfg-femco-countFontSize" min="10" max="18" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-countFontSizeNum').value=this.value;cfgFemcoUpd('countFontSize',this.value)">
        <input type="number" id="cfg-femco-countFontSizeNum" min="10" max="18" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-countFontSize').value=this.value;cfgFemcoUpd('countFontSize',this.value)">
      </div>

      <hr style="border:none;border-top:1px solid var(--border);margin:8px 0">
      <div style="font-size:12px;font-weight:800;color:var(--text2)">대학별 설정</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 선택</div>
        <select id="cfg-femco-univ" onchange="localStorage.setItem('cfg_femco_univ',this.value);cfgFemcoRefreshUnivFields()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;min-width:160px"></select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 색상</div>
        <input type="color" id="cfg-femco-univColor" onchange="cfgFemcoSetUnivColor(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoClearUnivColor()">해제</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학명 아래 문구</div>
        <input type="text" id="cfg-femco-subtitle" placeholder="대학명 아래 문구" style="flex:1;min-width:240px" onchange="cfgFemcoSetSubtitle(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoClearSubtitle()">삭제</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 배경 미디어</div>
        <input type="text" id="cfg-femco-bgMediaUrl" placeholder="https://... (jpg/png/gif/webp/mp4/유튜브/트위치)" style="flex:1;min-width:260px" onchange="cfgFemcoSetBgMedia(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoSetBgMedia('')">삭제</button>
        <span id="cfg-femco-bgMediaHint" style="font-size:11px;color:var(--gray-l)">미설정</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.45;margin-top:-6px">
        • 이미지/GIF: 대학 카드 배경으로 적용<br>
        • MP4/WEBM: 대학 카드에 “배경영상” 버튼 표시(클릭 재생)<br>
        • 유튜브/트위치: “배경링크” 버튼 표시(새창)
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">문구 스타일</div>
        <span style="font-size:11px;color:var(--gray-l)">크기</span>
        <input type="range" id="cfg-femco-subtitleSize" min="10" max="24" step="1" style="width:180px;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-subtitleSizeNum').value=this.value;cfgFemcoUpd('subtitleSize',this.value)">
        <input type="number" id="cfg-femco-subtitleSizeNum" min="10" max="24" step="1" style="width:80px;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-subtitleSize').value=this.value;cfgFemcoUpd('subtitleSize',this.value)">
        <span style="font-size:11px;color:var(--gray-l)">굵기</span>
        <select id="cfg-femco-subtitleWeight" onchange="cfgFemcoUpd('subtitleWeight',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">색</span>
        <input type="color" id="cfg-femco-subtitleColor" onchange="cfgFemcoUpd('subtitleColor',this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoUpd('subtitleColor','')">자동</button>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-b" onclick="cfgFemcoReset()">초기화</button>
      </div>
    </div>
  </details>
  ${_scfgD('cfgmenu','🧭 설정 메뉴 정리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">카테고리 이동 + 섹션 순서 변경을 직접 정리할 수 있습니다. 변경 즉시 저장되며 새로고침 없이 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      ${(()=>{
        const cats = (window._cfgCatOrder && Array.isArray(window._cfgCatOrder)) ? window._cfgCatOrder : Object.keys(_catSecs||{});
        const secTitle = window._cfgSecTitle || {};
        return cats.map((cat, catIdx)=>{
          const secs = (_catSecs[cat]||[]);
          return `
            <div style="border:1px solid var(--border);border-radius:10px;background:var(--white);padding:12px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <div style="font-weight:900">${cat}</div>
                <span style="font-size:11px;color:var(--gray-l)">${secs.length}개</span>
                <span style="flex:1"></span>
                <button class="btn btn-xs" onclick="cfgMenuMoveCat('${cat.replace(/'/g,"\\'")}','up')" ${catIdx===0?'disabled':''}>▲</button>
                <button class="btn btn-xs" onclick="cfgMenuMoveCat('${cat.replace(/'/g,"\\'")}','down')" ${catIdx===cats.length-1?'disabled':''}>▼</button>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${secs.map((secId, i)=>{
                  const title = secTitle[secId] || secId;
                  return `
                    <div style="display:flex;align-items:center;gap:8px;border:1px solid var(--border2);border-radius:10px;padding:8px 10px;background:var(--surface)">
                      <div style="font-size:12px;font-weight:800;min-width:160px">${title}</div>
                      <button class="btn btn-xs" onclick="cfgMenuRenameSec('${secId}')" title="이름 변경">✏️</button>
                      <select onchange="cfgMenuSetCat('${secId}', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
                        ${cats.map(c=>`<option value="${c}"${c===cat?' selected':''}>${c}</option>`).join('')}
                      </select>
                      <span style="flex:1"></span>
                      <button class="btn btn-xs" onclick="cfgMenuMoveSec('${secId}','up')" ${i===0?'disabled':''}>▲</button>
                      <button class="btn btn-xs" onclick="cfgMenuMoveSec('${secId}','down')" ${i===secs.length-1?'disabled':''}>▼</button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('');
      })()}
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-b" onclick="cfgMenuReset()">기본 메뉴로 초기화</button>
        <button class="btn btn-w" onclick="cfgMenuResetSecNames()">이름 변경 초기화</button>
      </div>
    </div>
  </details>
  ${_scfgD('imgsettings','🖼️ 이미지탭 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭 ⚙️ 버튼과 동일한 설정입니다. 크기·밝기·배치·위치를 조절하면 즉시 반영됩니다.</div>
    <div id="cfg-b2-img-settings-wrap" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px;padding:0 2px">※ 스트리머 상세 모달 이미지 설정은 아래 별도 항목에서 설정</div>
  </details>
  ${_scfgD('imgmodalsettings','🖼️ 스트리머 상세 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">스트리머 상세 모달의 이미지 크기·밝기를 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:600">
        <input type="checkbox" id="cfg-img-fill" style="width:14px;height:14px"> 이미지 채우기 (cover) — 해제 시 맞춤 (contain)
      </label>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 크기</label>
          <span id="cfg-img-scale-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.5x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 밝기</label>
          <span id="cfg-img-brightness-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-brightness" min="0.3" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-brightness-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.3x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">좌측(모바일) 크기</label>
          <span id="cfg-img-scale-left-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-left" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-left-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">우측(PC) 크기</label>
          <span id="cfg-img-scale-right-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-right" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-right-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:600">
        <input type="checkbox" id="cfg-img-use-right-scale" style="width:14px;height:14px"> 좌우 개별 크기 사용
      </label>
      <button class="btn btn-b" onclick="saveImageSettings()" style="align-self:flex-start">💾 설정 저장</button>
    </div>
  </details>
  ${_scfgD('pd','🎨 스트리머 상세 스타일 설정')}
    <div id="cfg-pd-body"></div>
  </details>
  ${_scfgD('fab','🔘 FAB 버튼 탭 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">하단 FAB 버튼 클릭 시 이동할 탭을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">캘린더:</label>
        <select id="cfg-fab-cal" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cal">📅 캘린더</option>
          <option value="stats">📊 통계</option>
          <option value="roulette">🎰 룰렛</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">대회:</label>
        <select id="cfg-fab-comp" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="comp">🏆 대회</option>
          <option value="pro">🏅 프로리그</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">대학대전:</label>
        <select id="cfg-fab-univm" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="univm">🏫 대학대전</option>
          <option value="ck">🏆 CK</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">개인전:</label>
        <select id="cfg-fab-ind" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="ind">👤 개인전</option>
          <option value="gj">⚔️ 끝장전</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">프로리그:</label>
        <select id="cfg-fab-pro" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="pro">🏅 프로리그</option>
          <option value="comp">🏆 대회</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">FAB 버튼 표시 설정</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="cfg-fab-hide-mobile" onchange="saveFabVisibilitySettings()">
          모바일에서 숨기기
        </label>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="cfg-fab-hide-pc" onchange="saveFabVisibilitySettings()">
          PC에서 숨기기
        </label>
      </div>
    </div>
  </details>
  ${_scfgD('boardchip','🏷️ 현황판 칩/대학로고 크기')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">현황판 칩/대학 로고 관련 설정입니다. <b>스트리머 프로필 이미지 전역 배율</b>과는 별개로 동작합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📐 프로필 이미지 모양</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="cfg-bcp-circle" class="btn ${(()=>{try{return (localStorage.getItem('su_bcp_shape')||'circle')==='circle'?'btn-b':'btn-w';}catch(e){return 'btn-b';}})()}" onclick="boardChipPhotoShape='circle';saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-circle').className='btn btn-b';document.getElementById('cfg-bcp-square').className='btn btn-w';render()">⭕ 원형 (기본)</button>
          <button id="cfg-bcp-square" class="btn ${(()=>{try{return (localStorage.getItem('su_bcp_shape')||'circle')==='square'?'btn-b':'btn-w';}catch(e){return 'btn-w';}})()}" onclick="boardChipPhotoShape='square';saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-circle').className='btn btn-w';document.getElementById('cfg-bcp-square').className='btn btn-b';render()">⬛ 네모형</button>
        </div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 프로필 이미지 크기 <span id="cfg-bcp-size-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_bcp_size')||'26');}catch(e){return 26;}})()}px</span></div>
        <input type="range" min="16" max="56" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_bcp_size')||'26');}catch(e){return 26;}})()}" style="width:100%;accent-color:var(--blue)"
          oninput="boardChipPhotoSize=+this.value;saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-size-val').textContent=this.value+'px';render()">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-l);margin-top:2px"><span>16px</span><span>56px</span></div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📦 레이아웃 크기 <span id="cfg-bcp-layout-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_bcp_layout')||'100');}catch(e){return 100;}})()}%</span></div>
        <input type="range" min="70" max="160" step="5" value="${(()=>{try{return parseInt(localStorage.getItem('su_bcp_layout')||'100');}catch(e){return 100;}})()}" style="width:100%;accent-color:var(--blue)"
          oninput="boardChipLayoutScale=+this.value;saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-layout-val').textContent=this.value+'%';render()">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-l);margin-top:2px"><span>70%</span><span>160%</span></div>
      </div>
      <div style="border-top:1px dashed var(--border2);padding-top:12px">
        <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:10px">🏫 대학 로고 설정</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:120px">프로필(로고) 모양</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn ${(()=>{try{return (localStorage.getItem('su_ul_shape')||'circle')==='circle'?'btn-b':'btn-w';}catch(e){return 'btn-b';}})()}"
              onclick="localStorage.setItem('su_ul_shape','circle');if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();render()">⭕ 원형</button>
            <button class="btn ${(()=>{try{return (localStorage.getItem('su_ul_shape')||'circle')==='square'?'btn-b':'btn-w';}catch(e){return 'btn-w';}})()}"
              onclick="localStorage.setItem('su_ul_shape','square');if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();render()">⬛ 네모</button>
          </div>
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 대학 로고 이미지 크기 <span id="cfg-ul-size-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_size')||'34');}catch(e){return 34;}})()}px</span></div>
          <input type="range" min="20" max="60" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_size')||'34');}catch(e){return 34;}})()}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_ul_size',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-size-val').textContent=this.value+'px';render()">
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📦 대학 로고 레이아웃 크기 <span id="cfg-ul-box-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_box')||'46');}catch(e){return 46;}})()}px</span></div>
          <input type="range" min="34" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_box')||'46');}catch(e){return 46;}})()}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_ul_box',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-box-val').textContent=this.value+'px';render()">
        </div>
      </div>
    </div>
  </details>
  ${_scfgD('oldbright','🎨 구현황판 카드 배경/라벨 밝기 조절')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">구현황판 카드의 배경과 라벨 밝기를 조절합니다. (구현황판 툴바에서도 조절 가능)</p>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">배경 밝기:</label>
        <input type="range" id="cfg-b2-bg-alpha" min="0" max="30" value="9" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-bg-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-bg-alpha-val">9%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">라벨 밝기:</label>
        <input type="range" id="cfg-b2-label-alpha" min="0" max="40" value="16" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-label-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-label-alpha-val">16%</span>
      </div>
      <button class="btn btn-b" onclick="saveOldDashboardBrightness()">💾 저장</button>
    </div>
  </details>
  `;

  // 관리자 목록 + 맵 약자 목록 렌더링
  setTimeout(()=>{
    if(typeof _renderCfgSiList==='function') _renderCfgSiList();
    renderStorageInfo();
    renderSeasonList();
    const el=document.getElementById('adm-count');
    const listEl=document.getElementById('adm-list');
    const accounts=getAdminAccounts();
    if(el)el.textContent=accounts.length;
    if(listEl){
      if(!accounts.length){listEl.innerHTML='<div style="font-size:12px;color:var(--gray-l)">등록된 계정 없음</div>';return;}
      listEl.innerHTML=accounts.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:13px;font-weight:600">${a.label||'(이름없음)'}</span>
          <span style="padding:2px 9px;border-radius:5px;font-size:10px;font-weight:700;${a.role==='sub-admin'?'background:#fef3c7;color:#92400e;border:1px solid #fde68a':'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe'}">${a.role==='sub-admin'?'🔰 부관리자':'👑 관리자'}</span>
          <button class="btn btn-r btn-xs" onclick="deleteAdminAccount(${i})">🗑️ 삭제</button>
        </div>`).join('');
    }
    // 현황판 배경 설정 렌더링
    const bgListEl=document.getElementById('cfg-board-bg-list');
    if(bgListEl){
      bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div class="cdot" style="background:${u.color}"></div>
          <span style="flex:1;font-weight:700;font-size:13px">${u.name}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
          ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
        </div>
        ${u.bgImg?`<div style="margin-top:8px">
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
          <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
            <option value="top left" ${u.bgImgPos==='top left'?' selected':''}>좌상단</option>
            <option value="top center" ${u.bgImgPos==='top center'?' selected':''}>중상단</option>
            <option value="top right" ${u.bgImgPos==='top right'?' selected':''}>우상단</option>
            <option value="center left" ${u.bgImgPos==='center left'?' selected':''}>좌중앙</option>
            <option value="center center" ${u.bgImgPos==='center center'?' selected':''}>중앙</option>
            <option value="center right" ${u.bgImgPos==='center right'?' selected':''}>우중앙</option>
            <option value="bottom left" ${u.bgImgPos==='bottom left'?' selected':''}>좌하단</option>
            <option value="bottom center" ${u.bgImgPos==='bottom center'?' selected':''}>중하단</option>
            <option value="bottom right" ${u.bgImgPos==='bottom right'?' selected':''}>우하단</option>
          </select>
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
          <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
            <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
            <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
            <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
          </select>
        </div>`:''}
      </div>`).join('');
    }
    // 이미지탭 레이아웃 설정 초기화
    const b2Layout=JSON.parse(localStorage.getItem('su_b2_layout')||'{}');
    const _b2ls=b2Layout.leftSize||55, _b2rs=b2Layout.rightSize||45;
    const _b2lEl=document.getElementById('cfg-b2-left-size'), _b2rEl=document.getElementById('cfg-b2-right-size');
    if(_b2lEl){_b2lEl.value=_b2ls;const v=document.getElementById('cfg-b2-left-size-val');if(v)v.textContent=_b2ls+'%';}
    if(_b2rEl){_b2rEl.value=_b2rs;const v=document.getElementById('cfg-b2-right-size-val');if(v)v.textContent=_b2rs+'%';}
    if(document.getElementById('cfg-b2-pc-height'))document.getElementById('cfg-b2-pc-height').value=b2Layout.pcHeight||600;
    if(document.getElementById('cfg-b2-mobile-height'))document.getElementById('cfg-b2-mobile-height').value=b2Layout.mobileHeight||320;
    if(document.getElementById('cfg-b2-tablet-height'))document.getElementById('cfg-b2-tablet-height').value=b2Layout.tabletHeight||400;
    if(document.getElementById('cfg-b2-auto-resize'))document.getElementById('cfg-b2-auto-resize').checked=b2Layout.autoResize!==false;
    if(document.getElementById('cfg-b2-auto-height'))document.getElementById('cfg-b2-auto-height').checked=b2Layout.autoHeight!==false;
    // 이미지탭 이미지 설정 (board2 전역 설정) 렌더링
    const _cfgB2ImgWrap=document.getElementById('cfg-b2-img-settings-wrap');
    if(_cfgB2ImgWrap&&typeof _b2BuildImageControlGroup==='function'){
      _cfgB2ImgWrap.innerHTML=`
        <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px">이미지 1 (기본 이미지)</div>
        ${_b2BuildImageControlGroup('','primary','이미지 1',true)}
        <div style="font-weight:700;font-size:12px;color:var(--text2);margin:14px 0 10px">이미지 2 (두번째 이미지)</div>
        ${_b2BuildImageControlGroup('','secondary','이미지 2',true)}
      `;
    }
    // 스트리머 상세 이미지 설정 초기화
    const imgSettings=JSON.parse(localStorage.getItem('su_img_settings')||'{}');
    if(document.getElementById('cfg-img-fill'))document.getElementById('cfg-img-fill').checked=imgSettings.fill||false;
    if(document.getElementById('cfg-img-scale')){document.getElementById('cfg-img-scale').value=imgSettings.scale||1;document.getElementById('cfg-img-scale-val').textContent=(imgSettings.scale||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-brightness')){document.getElementById('cfg-img-brightness').value=imgSettings.brightness||1;document.getElementById('cfg-img-brightness-val').textContent=(imgSettings.brightness||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-left')){document.getElementById('cfg-img-scale-left').value=imgSettings.scaleLeft||1;document.getElementById('cfg-img-scale-left-val').textContent=(imgSettings.scaleLeft||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-right')){document.getElementById('cfg-img-scale-right').value=imgSettings.scaleRight||1;document.getElementById('cfg-img-scale-right-val').textContent=(imgSettings.scaleRight||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-use-right-scale'))document.getElementById('cfg-img-use-right-scale').checked=imgSettings.useRightScale||false;
    if(document.getElementById('cfg-img-random'))document.getElementById('cfg-img-random').checked=imgSettings.randomRotation||false;
    if(document.getElementById('cfg-img-interval'))document.getElementById('cfg-img-interval').value=imgSettings.interval||5;
    // 구현황판 밝기 설정 초기화
    const b2LabelAlpha=parseInt(localStorage.getItem('su_b2la')||'16');
    const b2BgAlpha=parseInt(localStorage.getItem('su_b2ba')||'9');
    if(document.getElementById('cfg-b2-label-alpha')){document.getElementById('cfg-b2-label-alpha').value=b2LabelAlpha;document.getElementById('cfg-b2-label-alpha-val').textContent=b2LabelAlpha+'%';}
    if(document.getElementById('cfg-b2-bg-alpha')){document.getElementById('cfg-b2-bg-alpha').value=b2BgAlpha;document.getElementById('cfg-b2-bg-alpha-val').textContent=b2BgAlpha+'%';}
    // 레이아웃 자동 저장 이벤트 리스너
    ['cfg-b2-left-size','cfg-b2-right-size','cfg-b2-pc-height','cfg-b2-mobile-height','cfg-b2-tablet-height'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveB2LayoutSettings);
    });
    const autoResizeEl=document.getElementById('cfg-b2-auto-resize');
    if(autoResizeEl)autoResizeEl.addEventListener('change',saveB2LayoutSettings);
    const autoHeightEl=document.getElementById('cfg-b2-auto-height');
    if(autoHeightEl)autoHeightEl.addEventListener('change',saveB2LayoutSettings);
    // 스트리머 상세 이미지 설정 자동 저장 이벤트 리스너
    ['cfg-img-fill','cfg-img-scale','cfg-img-brightness','cfg-img-scale-left','cfg-img-scale-right','cfg-img-random','cfg-img-interval'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveImageSettings);
    });
    // 카테고리 필터 적용
    if(typeof _cfgApplyCat==='function') _cfgApplyCat(window._cfgCat||'게임 운영', false);
    // 펨코현황 설정 초기화
    try{ if(typeof cfgFemcoInit==='function') cfgFemcoInit(); }catch(e){}
    // 스트리머 상세 스타일 섹션 내용 항상 렌더링 (펼침 여부 무관)
    if(typeof _renderCfgPdSection==='function') _renderCfgPdSection();
  },50);
  C.innerHTML=h;
  // 최초 렌더 직후 카테고리 필터를 즉시 적용 (setTimeout 실행이 막히는 환경 대비)
  try{ if(typeof _cfgApplyCat==='function') _cfgApplyCat(window._cfgCat||'게임 운영', false); }catch(e){}
  // 인라인 onclick이 불발되는 환경 대비 이벤트 바인딩
  _bindCfgHandlers();
  setTimeout(_refreshAliasList, 10);
  // FAB 탭 설정 초기화
  window.saveFabTabSetting = function(btnKey, tabId){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    settings[btnKey]=tabId;
    localStorage.setItem('su_fabTabs',JSON.stringify(settings));
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
    // Firebase에 설정 동기화
    if(typeof save==='function' && typeof isLoggedIn!=='undefined' && isLoggedIn) save();
  };
  window.initFabTabSettings = function(){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    const defaults={cal:'cal',comp:'comp',univm:'univm',ind:'ind',pro:'pro'};
    Object.keys(defaults).forEach(key=>{
      const el=document.getElementById('cfg-fab-'+key);
      if(el){
        el.value=settings[key]||defaults[key];
      }
    });
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
  };
  window.saveFabVisibilitySettings = function(){
    const hideMobile = document.getElementById('cfg-fab-hide-mobile')?.checked;
    const hidePC = document.getElementById('cfg-fab-hide-pc')?.checked;
    localStorage.setItem('su_fabHideMobile', hideMobile ? '1' : '0');
    localStorage.setItem('su_fabHidePC', hidePC ? '1' : '0');
    if(typeof updateFabVisibility==='function')updateFabVisibility();
    if(typeof save==='function')save();
  };
  window.initFabVisibilitySettings = function(){
    const hideMobile = localStorage.getItem('su_fabHideMobile') === '1';
    const hidePC = localStorage.getItem('su_fabHidePC') === '1';
    if(document.getElementById('cfg-fab-hide-mobile'))document.getElementById('cfg-fab-hide-mobile').checked = hideMobile;
    if(document.getElementById('cfg-fab-hide-pc'))document.getElementById('cfg-fab-hide-pc').checked = hidePC;
  };
  setTimeout(function(){window.initFabTabSettings();window.initFabVisibilitySettings();}, 50);
} // end first rCfg

function renderStorageInfo(){
  const el=document.getElementById('cfg-storage-info');
  if(!el)return;
  try{
    let total=0;const rows=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);const v=localStorage.getItem(k)||'';
      const bytes=(k.length+v.length)*2;total+=bytes;
      if(k.startsWith('su_'))rows.push({k,bytes});
    }
    rows.sort((a,b)=>b.bytes-a.bytes);
    const limit=5*1024*1024;
    const pct=Math.min(100,Math.round(total/limit*100));
    const barCol=pct>=90?'#dc2626':pct>=70?'#f59e0b':'#22c55e';
    const fmt=b=>b>=1024*1024?(b/1024/1024).toFixed(2)+'MB':b>=1024?(b/1024).toFixed(1)+'KB':b+'B';
    const LABELS={'su_p':'선수 데이터','su_pp':'선수 사진','su_mm':'미니대전','su_um':'대학대전','su_ck':'대학CK','su_pro':'프로리그','su_cm':'대회','su_tn':'토너먼트','su_mb':'회원관리','su_notices':'공지','su_psi':'상태아이콘'};
    el.innerHTML=`
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
        <span style="font-weight:700;color:var(--text)">${fmt(total)} / 5MB 사용</span>
        <span style="font-weight:700;color:${barCol}">${pct}%</span>
      </div>
      <div style="height:10px;border-radius:5px;background:var(--border2);overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${barCol};border-radius:5px;transition:.3s"></div>
      </div>
      ${pct>=70?`<div style="font-size:11px;color:${barCol};margin-top:5px;font-weight:600">${pct>=90?'⚠️ 저장 공간이 거의 가득 찼습니다! 데이터를 정리해 주세요.':'⚠️ 저장 공간이 많이 사용되고 있습니다.'}</div>`:''}
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">항목별 사용량 (상위 10개)</div>
    <div style="font-size:11px;line-height:1.8">
      ${rows.slice(0,10).map(({k,bytes})=>{
        const label=LABELS[k]||k;
        const bpct=Math.min(100,Math.round(bytes/limit*100));
        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="min-width:100px;color:var(--text2)">${label}</span>
          <div style="flex:1;height:6px;border-radius:3px;background:var(--border2);overflow:hidden"><div style="height:100%;width:${bpct}%;background:#60a5fa;border-radius:3px"></div></div>
          <span style="min-width:55px;text-align:right;color:var(--gray-l)">${fmt(bytes)}</span>
        </div>`;
      }).join('')}
    </div>`;
  }catch(e){el.innerHTML='<div style="color:var(--gray-l);font-size:12px">사용량 계산 불가</div>';}
}

// ── 이미지탭 레이아웃 저장 함수 ──
function saveB2LayoutSettings(){
  const settings = {
    autoResize: document.getElementById('cfg-b2-auto-resize')?.checked !== false,
    autoHeight: document.getElementById('cfg-b2-auto-height')?.checked !== false,
    leftSize: parseInt(document.getElementById('cfg-b2-left-size')?.value) || 55,
    rightSize: parseInt(document.getElementById('cfg-b2-right-size')?.value) || 45,
    pcHeight: parseInt(document.getElementById('cfg-b2-pc-height')?.value) || 600,
    mobileHeight: parseInt(document.getElementById('cfg-b2-mobile-height')?.value) || 320,
    tabletHeight: parseInt(document.getElementById('cfg-b2-tablet-height')?.value) || 400
  };
  localStorage.setItem('su_b2_layout', JSON.stringify(settings));
  if(typeof save==='function')save();
  alert('이미지탭 레이아웃이 저장되었습니다.');
  if(typeof render === 'function') render();
  // board2 탭이 열려있으면 다시 렌더링
  if(typeof _b2View !== 'undefined' && document.getElementById('b2-content')) {
    document.getElementById('b2-content').innerHTML = _b2PlayersView();
    if(_b2SelectedPlayer) _b2UpdateMainDisplay(_b2SelectedPlayer.name);
  }
}

// ── 구현황판 밝기 저장 함수 ──
function saveOldDashboardBrightness(){
  const labelAlpha = parseInt(document.getElementById('cfg-b2-label-alpha')?.value) || 16;
  const bgAlpha = parseInt(document.getElementById('cfg-b2-bg-alpha')?.value) || 9;
  localStorage.setItem('su_b2la', labelAlpha);
  localStorage.setItem('su_b2ba', bgAlpha);
  if(typeof save==='function')save();
  alert('구현황판 밝기 설정이 저장되었습니다.');
  if(typeof render === 'function') render();
}

// ── 이미지 설정 저장 함수 ──
function saveImageSettings(){
  const settings = {
    fill: document.getElementById('cfg-img-fill')?.checked || false,
    scale: parseFloat(document.getElementById('cfg-img-scale')?.value) || 1,
    brightness: parseFloat(document.getElementById('cfg-img-brightness')?.value) || 1,
    scaleLeft: parseFloat(document.getElementById('cfg-img-scale-left')?.value) || 1,
    scaleRight: parseFloat(document.getElementById('cfg-img-scale-right')?.value) || 1,
    useRightScale: document.getElementById('cfg-img-use-right-scale')?.checked || false,
    randomRotation: document.getElementById('cfg-img-random')?.checked || false,
    interval: parseInt(document.getElementById('cfg-img-interval')?.value) || 5
  };
  localStorage.setItem('su_img_settings', JSON.stringify(settings));
  
  // 이미지탭(board2)과 동기화를 위한 저장
  const b2Settings = {
    primary: {
      fill: settings.fill ? 'contain' : 'cover',
      scale: settings.scale * 100,
      brightness: settings.brightness * 100,
      offsetX: 0,
      offsetY: 0,
      zoom: settings.scale * 100,
      posX: 0,
      posY: 0
    },
    secondary: {
      fill: settings.fill ? 'contain' : 'cover',
      scale: settings.scale * 100,
      brightness: settings.brightness * 100,
      offsetX: 0,
      offsetY: 0,
      zoom: settings.scale * 100,
      posX: 0,
      posY: 0
    }
  };
  localStorage.setItem('su_b2_global_img_settings', JSON.stringify(b2Settings));
  
  if(typeof save==='function')save();
  alert('이미지 설정이 저장되었습니다.');
  if(typeof render === 'function') render();
}

// ── 우클릭 이미지 조절 메뉴 ──
let _imgContextMenuEl = null;
let _currentImageTarget = null;

function showImageContextMenu(e, imgElement){
  e.preventDefault();
  _currentImageTarget = imgElement;
  
  // 기존 메뉴 제거
  if(_imgContextMenuEl){
    _imgContextMenuEl.remove();
  }
  
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: var(--white);
    border: 1px solid var(--border2);
    border-radius: 8px;
    padding: 8px 0;
    min-width: 180px;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  `;
  
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  const currentScale = imgElement.dataset.scale || imgSettings.scale || 1;
  const currentBrightness = imgElement.dataset.brightness || imgSettings.brightness || 1;
  
  menu.innerHTML = `
    <div style="padding: 8px 16px; font-size: 12px; font-weight: 700; color: var(--text2); border-bottom: 1px solid var(--border);">
      🖼️ 이미지 조절
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">크기: <span id="ctx-scale-val">${currentScale}x</span></label>
      <input type="range" id="ctx-scale" min="0.5" max="3" step="0.1" value="${currentScale}" style="width: 100%;" oninput="document.getElementById('ctx-scale-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">밝기: <span id="ctx-bright-val">${currentBrightness}x</span></label>
      <input type="range" id="ctx-bright" min="0.3" max="2" step="0.1" value="${currentBrightness}" style="width: 100%;" oninput="document.getElementById('ctx-bright-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px; border-top: 1px solid var(--border);">
      <button onclick="applyImageContextStyle()" style="width: 100%; padding: 6px 12px; background: var(--blue); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor:pointer;">✅ 적용</button>
    </div>
  `;
  
  document.body.appendChild(menu);
  _imgContextMenuEl = menu;
  
  // 메뉴 외부 클릭 시 닫기
  setTimeout(()=>{
    const closeMenu = (ev)=>{
      if(!menu.contains(ev.target)){
        menu.remove();
        _imgContextMenuEl = null;
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 0);
}

function applyImageContextStyle(){
  if(!_currentImageTarget) return;
  
  const scale = document.getElementById('ctx-scale')?.value || 1;
  const brightness = document.getElementById('ctx-bright')?.value || 1;
  
  _currentImageTarget.style.transform = `scale(${scale})`;
  _currentImageTarget.style.filter = `brightness(${brightness})`;
  _currentImageTarget.dataset.scale = scale;
  _currentImageTarget.dataset.brightness = brightness;
  
  if(_imgContextMenuEl){
    _imgContextMenuEl.remove();
    _imgContextMenuEl = null;
  }
}

// ── 랜덤 이미지 회전 ──
let _randomRotationTimer = null;

function startRandomRotation(){
  stopRandomRotation();
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;
  
  const interval = (imgSettings.interval || 5) * 1000;
  
  _randomRotationTimer = setInterval(()=>{
    rotateRandomImage();
  }, interval);
}

function stopRandomRotation(){
  if(_randomRotationTimer){
    clearInterval(_randomRotationTimer);
    _randomRotationTimer = null;
  }
}

function rotateRandomImage(){
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;
  
  // 랜덤 스트리머 선택
  if(players && players.length > 0){
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    
    // 전체대학 보기
    if(currentTab === 'total'){
      const imgContainer = document.querySelector('.random-image-container');
      if(imgContainer && randomPlayer.photo){
        imgContainer.src = randomPlayer.photo;
      }
    }
    
    // 이미지탭(board2)
    const b2MainImg = document.getElementById('b2-main-img-1');
    if(b2MainImg && randomPlayer.photo && typeof _b2UpdateMainDisplay === 'function'){
      _b2UpdateMainDisplay(randomPlayer.name);
    }
  }
}

// 현재 탭 추적
let currentTab = 'total';

// 탭 변경 시 회전 제어
const originalSw = window.sw;
window.sw = function(tab, el){
  currentTab = tab;
  if(originalSw) originalSw(tab, el);

  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(imgSettings.randomRotation){
    startRandomRotation();
  } else {
    stopRandomRotation();
  }
};

function bulkChangeTier(){
  if(!isLoggedIn) return;
  const fromTier=document.getElementById('bulk-tier-from')?.value||'';
  const toTier=document.getElementById('bulk-tier-to')?.value||'';
  const targetUniv=document.getElementById('bulk-tier-univ')?.value||'';
  if(!toTier){alert('변경할 티어를 선택하세요.');return;}
  const targets=players.filter(p=>{
    if(fromTier && (p.tier||'미정')!==fromTier) return false;
    if(targetUniv && p.univ!==targetUniv) return false;
    return true;
  });
  if(!targets.length){alert('해당하는 선수가 없습니다.');return;}
  if(!confirm(`${targets.length}명의 티어를 '${toTier}'으로 변경할까요?\n\n${targets.slice(0,5).map(p=>p.name).join(', ')}${targets.length>5?` 외 ${targets.length-5}명`:''}`)) return;
  targets.forEach(p=>{ p.tier=toTier; });
  save(); render();
  const el=document.getElementById('bulk-tier-result');
  if(el){ el.textContent=`✅ ${targets.length}명 변경 완료!`; setTimeout(()=>{if(el)el.textContent='';},3000); }
}

/* ══════════════════════════════════════
   경기 일괄 수정 함수들
══════════════════════════════════════ */
function bulkConvertToGameScore(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  let converted = 0;
  targets.forEach(key=>{
    const arr = arrMap[key]||[];
    arr.forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA = m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB = m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      // 세트 수와 다를 때만 변환
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        converted++;
      }
    });
  });

  // 대회(tourneys) 조별리그도 변환
  (tourneys||[]).forEach(tn=>{
    if(!tn.groups) return;
    tn.groups.forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.sets||!m.sets.length) return;
        const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
        const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
        if(gA!==m.sa||gB!==m.sb){
          m.sa=gA; m.sb=gB;
          converted++;
        }
      });
    });
    // 브라켓 경기도 변환
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{
      if(!m||!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        converted++;
      }
    });
    (br.manualMatches||[]).forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        converted++;
      }
    });
  });

  if(converted===0){
    const el=document.getElementById('bulk-conv-result');
    if(el) el.textContent='변환할 경기가 없습니다. (이미 게임수 합산으로 저장됨)';
    return;
  }
  save(); render();
  const el=document.getElementById('bulk-conv-result');
  if(el) el.textContent='✅ '+converted+'건 변환 완료!';
  setTimeout(()=>{ if(el) el.textContent=''; }, 3000);
}


/* ══════════════════════════════════════
   시즌 관리 함수
══════════════════════════════════════ */
function renderSeasonList(){
  const el = document.getElementById('cfg-season-list');
  if(!el) return;
  if(!seasons.length){
    el.innerHTML = '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">등록된 시즌이 없습니다.</div>';
    return;
  }
  el.innerHTML = seasons.map((s,i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:13px;font-weight:800;color:#7c3aed;min-width:100px">🏆 ${s.name}</span>
      <span style="font-size:11px;color:var(--gray-l)">${s.from} ~ ${s.to}</span>
      ${isLoggedIn ? '<button class="btn btn-w btn-xs" style="margin-left:auto" onclick="editSeason('+i+')">✏️ 수정</button><button class="btn btn-r btn-xs" onclick="deleteSeason('+i+')">🗑️</button>' : '<span style="margin-left:auto"></span>'}
    </div>`).join('');
}

function setBoardMemo2(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memo2=text;
  save();
}
function setBoardNote(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bMemo=text;
  save();
}
function addBoardNoteImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.push(dataUrl);
  save();render();
}
function removeBoardNoteImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.splice(idx,1);
  save();render();
}
function setBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memoImg=dataUrl;
  save();render();
}
function addBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.push(dataUrl);
  save();render();
}
function removeBoardMemoImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.splice(idx,1);
  save();render();
}

function setBoardBgImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImg=dataUrl;
  save();render();
}
function removeBoardBgImg(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  delete u.bgImg;
  delete u.bgImgPos;
  save();render();
}
function setBoardBgImgPos(univName, pos){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgPos=pos;
  save();render();
}
function setBoardBgImgSize(univName, size){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgSize=size;
  save();render();
}
function promptBoardBgImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const cur=u.bgImg&&!u.bgImg.startsWith('data:')?u.bgImg:'';
  const url=prompt('배경 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)',cur);
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  setBoardBgImg(univName,trimmed);
}
function promptBoardMemoImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('사이드 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardMemoImg(univName,trimmed);
}
function promptBoardNoteImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('하단 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardNoteImg(univName,trimmed);
}

/* ══════════════════════════════════════
   선수 CRUD
══════════════════════════════════════ */
// 등록 타입 변경 시 폼 필드 동적 표시/숨김
function onRegTypeChange() {
  const type = document.getElementById('p-reg-type')?.value || 'starcraft';
  const scFields = ['p-univ','p-tier','p-race'];
  const crewField = document.getElementById('p-crew');
  const genderField = document.getElementById('p-gender');
  const displayNameField = document.getElementById('p-display-name');

  // 스타크래프트 전용 필드
  scFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = (type === 'starcraft' || type === 'starcraft-crew') ? '' : 'none';
  });

  // 크루 선택 (스타크루/종합게임/보라크루)
  if (crewField) {
    crewField.style.display = (type !== 'starcraft') ? '' : 'none';
    if (type !== 'starcraft') {
      // 크루 목록 채우기
      const cfg = typeof crewCfg !== 'undefined' ? crewCfg : [];
      crewField.innerHTML = '<option value="">— 크루 없음 —</option>' +
        cfg.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
  }

  // 성별/프로필이름 (종합게임/보라크루)
  if (genderField) genderField.style.display = (type === 'general' || type === 'boracrew') ? '' : 'none';
  if (displayNameField) displayNameField.style.display = (type === 'general' || type === 'boracrew') ? '' : 'none';
}

function addPlayer(){
  const n=document.getElementById('p-name').value.trim();
  if(!n)return alert('이름을 입력하세요.');
  if(players.find(p=>p.name===n)&&!confirm(`"${n}" 이름이 이미 있습니다.\n동명이인으로 등록할까요?`))return;
  const _pRegType=(document.getElementById('p-reg-type')?.value||'starcraft');
  const _pRole=(document.getElementById('p-role')?.value||'').trim();
  const _pPhoto=(document.getElementById('p-photo')?.value||'').trim();
  const _pDisplayName=(document.getElementById('p-display-name')?.value||'').trim();
  if(_pPhoto){
    if(_pPhoto.startsWith('data:')){alert('base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용');return;}
    if(_pPhoto.length>2000&&!confirm(`이미지 URL이 매우 깁니다 (${_pPhoto.length}자). 계속할까요?`))return;
  }
  const _pHideBoard=document.getElementById('p-hide-board')?.checked||false;
  const _pGender=document.getElementById('p-gender')?.value||'M';

  let playerData;

  if(_pRegType==='starcraft'){
    // 순수 스타크래프트 스트리머
    playerData={name:n,univ:document.getElementById('p-univ').value,tier:document.getElementById('p-tier').value,
      race:document.getElementById('p-race').value,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
      gameType:'starcraft',win:0,loss:0,points:0,history:[]};

  } else if(_pRegType==='starcraft-crew'){
    // 스타크루 — 스타크래프트 + 크루 소속
    const crewName=(document.getElementById('p-crew')?.value||'').trim();
    playerData={name:n,univ:document.getElementById('p-univ').value,tier:document.getElementById('p-tier').value,
      race:document.getElementById('p-race').value,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
      gameType:'starcraft',crewName:crewName||undefined,isCrew:crewName?true:undefined,
      win:0,loss:0,points:0,history:[]};

  } else if(_pRegType==='general'){
    // 종합게임 스트리머
    const crewName=(document.getElementById('p-crew')?.value||'').trim();
    playerData={name:n,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,displayName:_pDisplayName||undefined,
      hideFromBoard:_pHideBoard||undefined,
      gameType:'종합게임',crewName:crewName||undefined,isCrew:crewName?true:undefined,
      win:0,loss:0,points:0,history:[]};

  } else if(_pRegType==='boracrew'){
    // 보라크루 스트리머
    const crewName=(document.getElementById('p-crew')?.value||'').trim();
    playerData={name:n,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,displayName:_pDisplayName||undefined,
      hideFromBoard:_pHideBoard||undefined,
      gameType:'보라크루',crewName:crewName||undefined,isCrew:crewName?true:undefined,
      win:0,loss:0,points:0,history:[]};
  } else {
    playerData={name:n,univ:'무소속',gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
      gameType:'starcraft',win:0,loss:0,points:0,history:[]};
  }

  players.push(playerData);
  document.getElementById('p-name').value='';
  document.getElementById('p-photo').value='';
  if(document.getElementById('p-display-name')) document.getElementById('p-display-name').value='';
  document.getElementById('p-hide-board').checked=false;
  save();render();
}
function bulkAddPlayers(){
  if(!isLoggedIn){alert('관리자만 사용 가능합니다.');return;}
  const raw=document.getElementById('bulk-player-input')?.value||'';
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);
  if(!lines.length){alert('등록할 스트리머를 입력하세요.');return;}
  const RACES=new Set(['T','Z','P','N']);
  const TIER_SET=new Set(typeof TIERS!=='undefined'?TIERS:['G','K','JA','J','S']);
  let added=0;const skipped=[];
  lines.forEach(line=>{
    const parts=line.split(/\s+/);
    if(!parts[0])return;
    const name=parts[0];
    let race='T',tier='',showOnBoard=false,gender='M';
    const univParts=[];
    parts.slice(1).forEach(tok=>{
      if(tok.toLowerCase()==='show'){showOnBoard=true;return;}
      if(tok.toLowerCase()==='hide'){return;} // hide는 기본값이므로 무시
      if(tok==='남자'||tok.toUpperCase()==='M'){gender='M';return;}
      if(tok==='여자'||tok.toUpperCase()==='F'){gender='F';return;}
      if(RACES.has(tok.toUpperCase())){race=tok.toUpperCase();return;}
      if(TIER_SET.has(tok)){tier=tok;return;}
      univParts.push(tok);
    });
    const univ=univParts.join(' ')||'무소속';
    if(players.find(p=>p.name===name)){skipped.push(name);return;}
    players.push({name,univ,tier:tier||'미정',race,gender,hideFromBoard:showOnBoard?undefined:true,win:0,loss:0,points:0,history:[]});
    added++;
  });
  if(added>0){save();render();}
  const resultEl=document.getElementById('bulk-player-result');
  if(resultEl){
    let msg=`✅ ${added}명 등록 완료`;
    if(skipped.length)msg+=`\n⚠️ 중복 스킵 (${skipped.length}명): ${skipped.join(', ')}`;
    resultEl.innerHTML=msg.replace('\n','<br>');
    resultEl.style.display='block';
    if(added>0)document.getElementById('bulk-player-input').value='';
  }
}
window.openEP=function(name){
  editName=name;const p=players.find(x=>x.name===name);
  if(!p) return;
  document.getElementById('emBody').innerHTML=`
    <label>스트리머 이름</label><input type="text" id="ed-n" value="${p.name}">
    <label>티어</label><select id="ed-t">${TIERS.map(t=>`<option value="${t}"${p.tier===t?' selected':''}>${getTierLabel(t)}</option>`).join('')}</select>
    <label>대학</label>
    <div style="display:flex;gap:6px;align-items:center">
      <select id="ed-u" style="flex:1">${getAllUnivs().filter(u=>!u.dissolved||u.name===p.univ).map(u=>`<option value="${u.name}"${p.univ===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      ${p.univ!=='무소속'?`<button type="button" onclick="document.getElementById('ed-u').value='무소속'" style="flex-shrink:0;padding:4px 10px;border-radius:7px;border:1.5px solid #9ca3af;background:var(--surface);color:#6b7280;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">🚶 무소속</button>`:''}
    </div>
    <label>종족</label><select id="ed-r"><option value="T"${p.race==='T'?' selected':''}>테란</option><option value="Z"${p.race==='Z'?' selected':''}>저그</option><option value="P"${p.race==='P'?' selected':''}>프로토스</option><option value="N"${p.race==='N'?' selected':''}>종족미정</option></select>
    <label>성별</label><select id="ed-g"><option value="F"${(p.gender||'F')==='F'?' selected':''}>👩 여자</option><option value="M"${p.gender==='M'?' selected':''}>👨 남자</option></select>
    <label>직책 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(이사장/선장/동아리장/반장/총장/부총장/총괄/교수/코치는 정렬 우선순위 적용)</span></label>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
      ${MAIN_ROLES.map(r=>{const ic=ROLE_ICONS[r]||'🏷️';const col=ROLE_COLORS[r]||'#6b7280';return `<button type="button" onclick="const el=document.getElementById('ed-role');el.value=el.value===this.dataset.role?'':this.dataset.role;" data-role="${r}" style="padding:3px 8px;border-radius:6px;border:1.5px solid ${col};background:${p.role===r?col+'22':'var(--white)'};color:${col};font-size:11px;font-weight:700;cursor:pointer">${ic} ${r}</button>`;}).join('')}
      <button type="button" onclick="document.getElementById('ed-role').value=''" style="padding:3px 8px;border-radius:6px;border:1.5px solid #9ca3af;background:var(--white);color:#9ca3af;font-size:11px;font-weight:700;cursor:pointer">✕ 없음</button>
    </div>
    <input type="text" id="ed-role" value="${p.role||''}" placeholder="직책 직접 입력 또는 위 버튼 클릭" style="width:100%">
    <label>🖼 프로필 사진 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(현황판 카드에 표시 · 비워두면 기본 아이콘)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-photo" value="${p.photo||''}" placeholder="https://... 이미지 URL 입력" style="flex:1" oninput="(function(el){const v=el.value.trim();const img=document.getElementById('ed-photo-preview');const warn=document.getElementById('ed-photo-warn');if(v&&v.startsWith('data:')){el.style.borderColor='#dc2626';if(warn){warn.style.color='#dc2626';warn.textContent='❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용';}}else{el.style.borderColor='';if(warn){warn.textContent='이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.';warn.style.color='var(--gray-l)';}}const wrap=document.getElementById('ed-photo-preview-wrap');if(v&&!v.startsWith('data:')){img.src=v;img.style.display='block';if(wrap)wrap.style.display='inline-block';}else{if(wrap)wrap.style.display='none';}})(this)">
      <span id="ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.photo&&!p.photo.startsWith('data:')?'inline-block':'none'}">
        <img id="ed-photo-preview" src="${p.photo&&!p.photo.startsWith('data:')?p.photo:''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none';const w=document.getElementById('ed-photo-warn');if(w){w.style.color='#d97706';w.textContent='⚠️ 이미지를 불러올 수 없습니다. 다른 도메인에서 차단됐거나 URL이 잘못됐을 수 있습니다.';}">
      </span>
    </div>
    <div id="ed-photo-warn" style="font-size:10px;color:${p.photo&&p.photo.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-top:-6px">${p.photo&&p.photo.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.'}</div>
    <label>🏠 방송국 홈 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(홈 아이콘 클릭 시 이동)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-channel" value="${p.channelUrl||''}" placeholder="https://chzzk.naver.com/... 또는 https://twitch.tv/..." style="flex:1">
      ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" style="font-size:18px;text-decoration:none" title="방송국 바로가기">🏠</a>`:''}
    </div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">치지직/트위치/유튜브 등 방송국 주소. 스트리머 상세에서 홈 아이콘으로 이동됩니다.</div>
    <div style="margin-top:14px;padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#15803d;margin-bottom:10px">🎭 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="ed-icon-btns">
        ${(()=>{const cur=getStatusIcon(p.name);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const isSelected=(id==='none'&&!cur)||(d.emoji&&cur===d.emoji);const iconHTML=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'18px'):d.emoji):'<span style="font-size:11px;font-weight:700">없음</span>';return `<button type="button" onclick="setStatusIconFromModal(this,'${p.name}','${id}')" data-icon-id="${id}" title="${d.label}" style="padding:5px 10px;border-radius:7px;border:2px solid ${isSelected?'#16a34a':'var(--border)'};background:${isSelected?'#dcfce7':'var(--white)'};cursor:pointer;min-width:38px;transition:.12s;font-family:'Noto Sans KR',sans-serif;">${iconHTML}</button>`}).join('')})()}
      </div>
      <div id="ed-icon-label" style="font-size:11px;color:var(--gray-l);margin-top:7px">선택: ${(()=>{const c=getStatusIcon(p.name);const found=Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===c);const expiry=playerStatusExpiry[p.name];const expTxt=expiry?` (${expiry} 만료)`:'';return (found?found[1].label:'없음')+expTxt;})()}</div>
      <div id="ed-icon-expiry-row" style="display:${getStatusIcon(p.name)?'flex':'none'};align-items:center;gap:7px;margin-top:8px">
        <input type="checkbox" id="ed-icon-expiry" ${playerStatusExpiry[p.name]?'checked':''} onchange="onStatusExpiryChange('${p.name}')" style="width:14px;height:14px;cursor:pointer;accent-color:#16a34a">
        <label for="ed-icon-expiry" style="font-size:11px;color:#15803d;font-weight:600;cursor:pointer;margin:0">10일 후 자동으로 없음으로 변경</label>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--blue);margin-bottom:12px">📊 승패 직접 조정</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">승 (현재: ${p.win})</div>
          <input type="number" id="ed-win" value="${p.win}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">패 (현재: ${p.loss})</div>
          <input type="number" id="ed-loss" value="${p.loss}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">포인트 (현재: ${p.points})</div>
          <input type="number" id="ed-pts" value="${p.points}" style="width:100%">
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-o btn-sm" onclick="
          if(confirm('승패와 히스토리를 모두 초기화하시겠습니까?')){
            const p=players.find(x=>x.name===editName);
            p.win=0;p.loss=0;p.points=0;p.history=[];
            document.getElementById('ed-win').value=0;
            document.getElementById('ed-loss').value=0;
            document.getElementById('ed-pts').value=0;
            save();render();
          }
        ">🔄 승패 전체 초기화</button>
        <button class="btn btn-w btn-sm" onclick="
          const p=players.find(x=>x.name===editName);
          p.win=parseInt(document.getElementById('ed-win').value)||0;
          p.loss=parseInt(document.getElementById('ed-loss').value)||0;
          p.points=parseInt(document.getElementById('ed-pts').value)||0;
          save();render();
          document.getElementById('emBody').querySelector('.apply-ok').style.display='inline-block';
          setTimeout(()=>document.getElementById('emBody').querySelector('.apply-ok').style.display='none',1500);
        " style="border-color:var(--green);color:var(--green)">✅ 승패 적용</button>
        <span class="apply-ok" style="display:none;color:var(--green);font-weight:700;font-size:12px;align-self:center">적용됨!</span>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">※ 승패 초기화 시 개인 경기 기록(히스토리)도 함께 삭제됩니다. 대전 기록(미니/대학대전 등)은 유지됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-retired" ${p.retired?'checked':''} style="width:16px;height:16px;cursor:pointer">
        🎗️ 은퇴 (현황판에서만 숨김, 경기 기록은 유지)
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-inactive" ${p.inactive?'checked':''} style="width:16px;height:16px;cursor:pointer">
        ⏸️ 임시 상태 (휴학/활동중단) — 현황판에서 반투명 표시, 은퇴와 달리 숨기지 않음
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-hide-board" ${p.hideFromBoard?'checked':''} style="width:16px;height:16px;cursor:pointer">
        👁️ 현황판에서 숨기기 (스탯·기록은 유지, 구현황판·신현황판 모두 적용)
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px">
      <div style="font-weight:700;font-size:12px;color:#7c3aed;margin-bottom:8px">💜 크루 소속</div>
      <select id="ed-crew-name" style="width:100%;border:1.5px solid #ddd6fe;border-radius:7px;padding:5px 8px;font-size:13px;background:var(--white);color:var(--text1)">
        <option value="">— 소속 없음 —</option>
        ${(typeof crewCfg!=='undefined'?crewCfg:[]).map(c=>`<option value="${c.name}"${p.crewName===c.name?' selected':''}>${c.name}</option>`).join('')}
      </select>
      <div style="font-size:10px;color:var(--gray-l);margin-top:4px">선택 시 현황판 → 보라크루 탭에 자동 표시됩니다</div>
    </div>
    <div style="margin-top:14px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#b45309;margin-bottom:8px">📝 선수 메모</div>
      <textarea id="ed-memo" style="width:100%;min-height:70px;font-size:12px;border:1px solid #fde68a;border-radius:6px;padding:8px;background:#fff;resize:vertical;font-family:'Noto Sans KR',sans-serif;line-height:1.6;box-sizing:border-box;" placeholder="선수에 대한 메모를 입력하세요...">${p.memo||''}</textarea>
    </div>`;
  om('emModal');
}
// 스트리머 상세 모달 → 수정창 열기
// emModal(z-index:5000) > playerModal(z-index:4000) 이므로 playerModal을 닫지 않고
// 그 위에 emModal을 열기만 함 → cm/om 순서 경쟁조건 완전 제거
function openEPFromModal(nameArg){
  const name=nameArg||window._playerModalCurrentName;
  if(!name){alert('선수 이름을 확인할 수 없습니다.');return;}
  const p=players.find(x=>x.name===name);
  if(!p){alert('선수 정보를 찾을 수 없습니다: '+name);return;}
  try{
    openEP(name);
  }catch(e){
    console.error('[openEP] 오류:',e);
    alert('수정창 열기 실패: '+e.message);
  }
}
function savePlayer(){
  try{
  const p=players.find(x=>x.name===editName);
  if(!p){alert('선수를 찾을 수 없습니다.\n현재 editName: "'+editName+'"');return;}
  const newName=(document.getElementById('ed-n')?.value||'').trim();
  if(!newName){alert('이름을 입력하세요.');return;}
  const oldName=editName;

  // 이름 변경 시 모든 기록 자동 갱신
  if(newName !== oldName){
    if(players.some(x=>x.name===newName)&&!confirm(`"${newName}" 이름의 스트리머가 이미 존재합니다.\n동명이인으로 변경하시겠습니까?`))return;
    players.forEach(other=>{
      (other.history||[]).forEach(h=>{if(h.opp===oldName)h.opp=newName;});
    });
    const renameInMatches=(arr)=>{
      (arr||[]).forEach(m=>{
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
        (m.teamAMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
        (m.teamBMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
      });
    };
    renameInMatches(miniM);renameInMatches(univM);renameInMatches(comps);
    renameInMatches(ckM);renameInMatches(proM);renameInMatches(ttM);
    // 🔧 개인전/끝장전: wName/lName 갱신
    [indM, gjM].forEach(arr=>{
      (arr||[]).forEach(m=>{
        if(m.wName===oldName) m.wName=newName;
        if(m.lName===oldName) m.lName=newName;
      });
    });
    tourneys.forEach(tn=>{
      (tn.groups||[]).forEach(grp=>{
        (grp.matches||[]).forEach(m=>{
          (m.sets||[]).forEach(set=>{
            (set.games||[]).forEach(g=>{
              if(g.playerA===oldName)g.playerA=newName;
              if(g.playerB===oldName)g.playerB=newName;
            });
          });
        });
      });
      // 브라켓 경기 이름 갱신
      const br=tn.bracket||{};
      Object.values(br.matchDetails||{}).forEach(m=>{
        if(!m)return;
        if(m.a===oldName)m.a=newName;
        if(m.b===oldName)m.b=newName;
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
      });
      (br.manualMatches||[]).forEach(m=>{
        if(!m)return;
        if(m.a===oldName)m.a=newName;
        if(m.b===oldName)m.b=newName;
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
      });
    });
  }

  p.name=newName;
  editName=p.name;
  p.tier=document.getElementById('ed-t')?.value||p.tier||'';
  p.univ=document.getElementById('ed-u')?.value||p.univ||'';
  p.race=document.getElementById('ed-r')?.value||p.race||'N';
  p.gender=document.getElementById('ed-g')?.value||p.gender||'F';
  const _rv=(document.getElementById('ed-role')?.value||'').trim();
  p.role=(!p.univ||p.univ==='무소속')?undefined:(_rv||undefined);
  const _photo=(document.getElementById('ed-photo')?.value||'').trim();
  if(_photo){
    if(_photo.startsWith('data:')){
      alert('❌ 프로필 사진에 base64 이미지(data:...)를 직접 붙여넣으면 Firebase 동기화가 실패합니다.\n\n이미지를 imgur.com, Discord 등에 업로드한 후 URL을 사용하세요.');
      return;
    }
    if(_photo.length>2000){
      if(!confirm(`⚠️ 사진 URL이 매우 깁니다 (${_photo.length}자).\n정상 URL인지 확인하세요. 계속 저장하시겠습니까?`)) return;
    }
  }
  p.photo=_photo||undefined;
  const _win=document.getElementById('ed-win');
  const _loss=document.getElementById('ed-loss');
  const _pts=document.getElementById('ed-pts');
  if(_win)p.win=parseInt(_win.value)||0;
  if(_loss)p.loss=parseInt(_loss.value)||0;
  if(_pts)p.points=parseInt(_pts.value)||0;
  p.retired=document.getElementById('ed-retired')?.checked||false;
  if(!p.retired)p.retired=undefined;
  p.inactive=document.getElementById('ed-inactive')?.checked||false;
  if(!p.inactive)p.inactive=undefined;
  p.hideFromBoard=document.getElementById('ed-hide-board')?.checked||false;
  if(!p.hideFromBoard)p.hideFromBoard=undefined;
  const _crewName=(document.getElementById('ed-crew-name')?.value||'').trim();
  p.crewName=_crewName||undefined;
  p.isCrew=_crewName?true:undefined; // 하위 호환
  const _memo=(document.getElementById('ed-memo')?.value||'').trim();
  p.memo=_memo||undefined;
  const _channel=(document.getElementById('ed-channel')?.value||'').trim();
  p.channelUrl=_channel||undefined;
  save();
  cm('emModal');
  
  // Auto-switch to 보라크루 view if player was assigned to crew or has position
  if(_crewName || (_rv && _rv.trim())){
    // Check if current tab is board2 and switch to crew view
    const currentTab = document.querySelector('.tab.on');
    if(currentTab && currentTab.onclick && currentTab.onclick.toString().includes('board2')){
      _b2View = 'crew';
    }
  }
  
  render();
  if(typeof openPlayerModal==='function'){
    const _savedName=p.name;
    setTimeout(()=>{
      const _p=players.find(x=>x.name===_savedName);
      if(_p) openPlayerModal(_savedName);
    },100);
  }
  }catch(e){
    console.error('[savePlayer] 오류:',e);
    alert('저장 중 오류가 발생했습니다:\n'+e.message+'\n\nF12 콘솔에서 자세한 내용을 확인하세요.');
  }
}
function setAllFemale(){
  if(!confirm(`모든 스트리머 ${players.length}명을 여자로 일괄 변경하시겠습니까?\n이후 남자 선수는 개별 수정으로 변경하세요.`))return;
  players.forEach(p=>p.gender='F');
  save();render();
  alert(`완료! 총 ${players.length}명이 여자로 변경되었습니다.`);
}

function delPlayer(){
  if(!confirm(`"${editName}" 선수를 완전 삭제할까요?\n\n⚠️ 선수 정보와 모든 경기 기록이 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`)) return;
  const name = editName;
  // 1. players 배열에서 완전 제거
  const idx = players.findIndex(x => x.name === name);
  if(idx >= 0) players.splice(idx, 1);
  // 2. 모든 경기 배열에서 해당 선수 관련 기록 제거
  // 개인전/끝장전: 해당 선수가 포함된 게임 제거
  if(typeof indM !== 'undefined') indM = indM.filter(m => m.wName !== name && m.lName !== name);
  if(typeof gjM !== 'undefined') gjM = gjM.filter(m => m.wName !== name && m.lName !== name);
  // 미니/대학대전/CK/프로/티어대회: 해당 선수가 포함된 세트의 게임 제거
  function _removePlayerFromMatches(arr) {
    arr.forEach(m => {
      if(!m.sets) return;
      m.sets.forEach(set => {
        if(!set.games) return;
        set.games = set.games.filter(g => g.playerA !== name && g.playerB !== name);
      });
    });
  }
  _removePlayerFromMatches(miniM);
  _removePlayerFromMatches(univM);
  _removePlayerFromMatches(ckM);
  _removePlayerFromMatches(proM);
  _removePlayerFromMatches(ttM);
  // 3. 다른 선수의 history에서 해당 선수와의 기록 제거 + win/loss/points/ELO 재계산
  players.forEach(p => {
    if(!p.history) return;
    const removed = p.history.filter(h => h.opp === name);
    if(!removed.length) return;
    p.history = p.history.filter(h => h.opp !== name);
    // 제거된 기록만큼 전적 차감
    removed.forEach(h => {
      if(h.result === '승') {
        p.win = Math.max(0, (p.win||0) - 1);
        p.points = (p.points||0) - 3;
        if(h.eloDelta != null) p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
      } else if(h.result === '패') {
        p.loss = Math.max(0, (p.loss||0) - 1);
        p.points = (p.points||0) + 3;
        if(h.eloDelta != null) p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
      }
    });
  });
  save();
  render();
  cm('emModal');
  cm('playerModal');
}

function openRE(mode,idx){
  reMode=mode;reIdx=idx;const allU=getAllUnivs();
  let body='',tit='';
  if(mode==='mini'){
    const m=miniM[idx];tit='⚡ 미니대전 수정';
    const mSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const mSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A 대학</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>팀 A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${mSetsA!==null&&mSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${mSetsA};document.getElementById('re-sb').value=${mSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${mSetsA}:${mSetsB})</button>`:''}
      </div>
      <label>팀 B 대학</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>팀 B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${mSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${mSetsA} / B ${mSetsB}</div>`:''}`;
  } else if(mode==='univm'){
    const m=univM[idx];tit='🏟️ 대학대전 수정';
    const uSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const uSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${uSetsA!==null&&uSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${uSetsA};document.getElementById('re-sb').value=${uSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${uSetsA}:${uSetsB})</button>`:''}
      </div>
      <label>팀 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${uSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${uSetsA} / B ${uSetsB}</div>`:''}`;
  } else if(mode==='comp'){
    const c=comps[idx];tit='🎖️ 대회 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${c.d}">
      <label>대회명</label><input type="text" id="re-cn" value="${c.n}">
      <label>대학 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${(c.a||c.u)===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>A 세트 승</label><input type="number" id="re-sa" value="${c.sa||0}">
      <label>대학 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${c.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 세트 승</label><input type="number" id="re-sb" value="${c.sb||0}">`;
  } else if(mode==='pro'){
    const m=proM[idx];tit='🏅 프로리그 수정';
    const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
    const pSetsGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const pSetsGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const pSetsWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const pSetsWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A팀 레이블</label><input type="text" id="re-tla" value="${m.teamALabel||''}">
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
        ${pSetsGA!==null&&pSetsGA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${pSetsGA};document.getElementById('re-sb').value=${pSetsGB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer">🔄 게임수(${pSetsGA}:${pSetsGB})</button>`:''}
        ${pSetsWA!==null&&pSetsWA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${pSetsWA};document.getElementById('re-sb').value=${pSetsWB}" style="font-size:11px;padding:2px 8px;background:#dbeafe;border:1px solid #2563eb;border-radius:6px;cursor:pointer">🔄 세트수(${pSetsWA}:${pSetsWB})</button>`:''}
      </div>
      <label>B팀 레이블</label><input type="text" id="re-tlb" value="${m.teamBLabel||''}">
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${pSetsGA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${pSetsWA} / B ${pSetsWB} | 게임 수: A ${pSetsGA} / B ${pSetsGB}</div>`:''}
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='tt'){
    const m=ttM[idx];tit='🎯 티어대회 수정';
    const ttGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const ttGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const ttWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const ttWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>대회명 (기록 분류 기준)</label><input type="text" id="re-ttcomp" value="${m.compName||m.n||m.t||''}">
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
        ${ttGA!==null&&ttGA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${ttGA};document.getElementById('re-sb').value=${ttGB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer">🔄 게임수(${ttGA}:${ttGB})</button>`:''}
        ${ttWA!==null&&ttWA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${ttWA};document.getElementById('re-sb').value=${ttWB}" style="font-size:11px;padding:2px 8px;background:#dbeafe;border:1px solid #2563eb;border-radius:6px;cursor:pointer">🔄 세트수(${ttWA}:${ttWB})</button>`:''}
      </div>
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${ttGA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${ttWA} / B ${ttWB} | 게임 수: A ${ttGA} / B ${ttGB}</div>`:''}
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='ck'){
    const m=ckM[idx];tit='🤝 대학CK 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A조 세트 승</label><input type="number" id="re-sa" value="${m.sa||0}">
      <label>B조 세트 승</label><input type="number" id="re-sb" value="${m.sb||0}">
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='gj'){
    const m=gjM[idx];tit='⚔️ 끝장전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">`;
  } else if(mode==='ind'){
    const m=indM[idx];tit='🎮 개인전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">`;
  }
  document.getElementById('reTitle').innerText=tit;
  document.getElementById('reBody').innerHTML=body;om('reModal');
}
function saveRow(){
  const d=document.getElementById('re-d')?.value||'';
  if(reMode==='mini'){
    miniM[reIdx].d=d;
    miniM[reIdx].a=document.getElementById('re-a')?.value||miniM[reIdx].a;
    miniM[reIdx].b=document.getElementById('re-b')?.value||miniM[reIdx].b;
    miniM[reIdx].sa=parseInt(document.getElementById('re-sa').value)||0;
    miniM[reIdx].sb=parseInt(document.getElementById('re-sb').value)||0;
    // miniM에 _id가 없으면 생성
    if(!miniM[reIdx]._id)miniM[reIdx]._id=genId();
    // 선수 history 업데이트
    (miniM[reIdx].sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=miniM[reIdx]._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'mini');
      });
    });
  } else if(reMode==='univm'){
    const m=univM[reIdx];m.d=d;m.a=document.getElementById('re-a').value;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.b=document.getElementById('re-b').value;m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // univM에 _id가 없으면 생성
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'univ');
      });
    });
  } else if(reMode==='comp'){
    const c=comps[reIdx];c.d=d;c.n=document.getElementById('re-cn').value;
    c.a=document.getElementById('re-a').value;c.u=c.a;c.hostUniv=c.a;
    c.sa=parseInt(document.getElementById('re-sa').value)||0;
    c.b=document.getElementById('re-b').value;c.sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='pro'){
    const m=proM[reIdx];m.d=d;
    m.teamALabel=document.getElementById('re-tla')?.value||m.teamALabel;
    m.teamBLabel=document.getElementById('re-tlb')?.value||m.teamBLabel;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // proM에 _id가 없으면 생성
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'pro');
      });
    });
  } else if(reMode==='tt'){
    const m=ttM[reIdx];m.d=d;
    const ttn=document.getElementById('re-ttcomp')?.value;
    if(ttn!==undefined){m.compName=ttn;m.n=ttn;m.t=ttn;}
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // ttM에 _id가 없으면 생성 (기록 탭에서 표시되도록)
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'tier');
      });
    });
  } else if(reMode==='ck'){
    const m=ckM[reIdx];m.d=d;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='gj'){
    const m=gjM[reIdx];m.d=d;
    m.wName=document.getElementById('re-gj-w')?.value.trim()||m.wName;
    m.lName=document.getElementById('re-gj-l')?.value.trim()||m.lName;
    m.map=document.getElementById('re-gj-map')?.value.trim()||m.map;
  } else if(reMode==='ind'){
    const m=indM[reIdx];m.d=d;
    m.wName=document.getElementById('re-gj-w')?.value.trim()||m.wName;
    m.lName=document.getElementById('re-gj-l')?.value.trim()||m.lName;
    m.map=document.getElementById('re-gj-map')?.value.trim()||m.map;
  }
  save();render();cm('reModal');
}

function renameUnivAcrossData(oldName,newName){
  oldName=(oldName||'').trim();
  newName=(newName||'').trim();
  if(!oldName||!newName||oldName===newName) return false;

  const _renameHistory=(h)=>{
    if(!h) return;
    ['univ','myUniv','oppUniv','team','oppTeam','teamA','teamB','teamALabel','teamBLabel'].forEach(k=>{
      if(h[k]===oldName) h[k]=newName;
    });
  };
  const _renameMember=(m)=>{
    if(m&&m.univ===oldName) m.univ=newName;
  };
  const _renameMatch=(m)=>{
    if(!m) return;
    ['a','b','u','hostUniv','teamALabel','teamBLabel'].forEach(k=>{
      if(m[k]===oldName) m[k]=newName;
    });
    (m.teamAMembers||[]).forEach(_renameMember);
    (m.teamBMembers||[]).forEach(_renameMember);
    (m.membersA||[]).forEach(_renameMember);
    (m.membersB||[]).forEach(_renameMember);
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        ['univA','univB','wUniv','lUniv','teamA','teamB'].forEach(k=>{
          if(g[k]===oldName) g[k]=newName;
        });
      });
    });
  };

  (players||[]).forEach(p=>{
    if(p.univ===oldName) p.univ=newName;
    (p.history||[]).forEach(_renameHistory);
  });

  [miniM,univM,comps,ckM,proM,ttM,indM,gjM].forEach(arr=>{
    (arr||[]).forEach(_renameMatch);
  });

  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      if(Array.isArray(grp.univs)) grp.univs=grp.univs.map(u=>u===oldName?newName:u);
      (grp.matches||[]).forEach(_renameMatch);
    });
    const br=tn.bracket||{};
    Object.keys(br.slots||{}).forEach(k=>{ if(br.slots[k]===oldName) br.slots[k]=newName; });
    Object.keys(br.winners||{}).forEach(k=>{ if(br.winners[k]===oldName) br.winners[k]=newName; });
    if(br.champ===oldName) br.champ=newName;
    Object.values(br.matchDetails||{}).forEach(_renameMatch);
    (br.manualMatches||[]).forEach(_renameMatch);
  });

  (proTourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      if(Array.isArray(grp.univs)) grp.univs=grp.univs.map(u=>u===oldName?newName:u);
      (grp.matches||[]).forEach(_renameMatch);
    });
  });

  if(typeof boardPlayerOrder!=='undefined' && boardPlayerOrder && boardPlayerOrder[oldName]){
    if(!boardPlayerOrder[newName]) boardPlayerOrder[newName]=boardPlayerOrder[oldName];
    delete boardPlayerOrder[oldName];
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }

  return true;
}

function addUniv(){const n=document.getElementById('nu-n').value.trim();const c=document.getElementById('nu-c').value;if(!n)return;univCfg.push({name:n,color:c});save();render();refreshSel();}
function delUniv(i){if(confirm(`"${univCfg[i].name}" 삭제?`)){univCfg.splice(i,1);save();render();refreshSel();}}
let _univDragSrc=-1;
function _univDragStart(e,i){_univDragSrc=i;e.currentTarget.style.opacity='0.4';e.dataTransfer.effectAllowed='move';}
function _univDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';return false;}
function _univDrop(e,i){
  e.stopPropagation();
  if(_univDragSrc===i)return false;
  const moved=univCfg.splice(_univDragSrc,1)[0];
  univCfg.splice(i,0,moved);
  save();render();
  return false;
}
function _univDragEnd(e){e.currentTarget.style.opacity='1';}

let _dissolveIdx = -1;
function openDissolveModal(i){
  _dissolveIdx = i;
  const u = univCfg[i];
  document.getElementById('dissolve-title').textContent = `"${u.name}" 해체 처리`;
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('dissolve-date').value = today;
  const cnt = players.filter(p=>p.univ===u.name).length;
  document.getElementById('dissolve-player-count').textContent = cnt ? `현재 소속 선수 ${cnt}명` : '소속 선수 없음';
  document.getElementById('dissolve-move-players').checked = cnt > 0;
  om('dissolveModal');
}
function confirmDissolve(){
  if(_dissolveIdx < 0) return;
  const u = univCfg[_dissolveIdx];
  const date = document.getElementById('dissolve-date').value || new Date().toISOString().slice(0,10);
  const movePlayers = document.getElementById('dissolve-move-players').checked;
  u.dissolved = true;
  u.hidden = true;
  u.dissolvedDate = date;
  if(movePlayers){
    players.forEach(p=>{ if(p.univ===u.name){ p.univ='무소속'; p.role=undefined; } });
  }
  // 해체된 대학의 현황판 수동 순서 데이터 정리
  if(typeof boardPlayerOrder !== 'undefined' && boardPlayerOrder[u.name]){
    delete boardPlayerOrder[u.name];
    if(typeof saveBoardPlayerOrder === 'function') saveBoardPlayerOrder();
  }
  save();
  cm('dissolveModal');
  render();
  if(typeof renderBoard==='function') renderBoard();
}
function _refreshMapList(){
  const listEl=document.getElementById('map-list');
  if(!listEl){render();return;}
  listEl.innerHTML=maps.map((m,i)=>`<div class="srow">
    <span style="font-size:14px">📍</span>
    <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
    <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
  </div>`).join('');
  // datalist 업데이트
  document.querySelectorAll('datalist[id^="alias"]').forEach(dl=>{
    dl.innerHTML=maps.map(m=>`<option value="${m}">`).join('');
  });
  refreshSel();
}
function addMap(){
  const inp=document.getElementById('nm');
  const n=(inp?.value||'').trim();
  if(!n)return;
  maps.push(n);save();
  if(inp)inp.value='';
  _refreshMapList();
}
function delMap(i){maps.splice(i,1);save();_refreshMapList();}

function _refreshAliasList(){
  const listEl = document.getElementById('alias-list');
  if(!listEl) return;
  const entries = Object.entries(userMapAlias);
  if(entries.length === 0){
    listEl.innerHTML = '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">아직 추가된 약자가 없습니다.</div>';
    return;
  }
  listEl.innerHTML = entries.filter(([k])=>!k.endsWith('__disabled')).map(([k,v])=>`
    <div class="srow" style="flex-wrap:wrap">
      <code style="background:var(--blue-ll);color:var(--blue);border-radius:5px;padding:2px 10px;font-size:13px;font-weight:700;min-width:44px;text-align:center">${k}</code>
      <span style="color:var(--gray-l)">→</span>
      <input type="text" value="${v}" id="alias-edit-${encodeURIComponent(k)}" list="alias-edit-list-${encodeURIComponent(k)}" autocomplete="off" style="flex:1;min-width:100px;padding:2px 6px;border:1px solid var(--border2);border-radius:5px;font-size:12px" onkeydown="if(event.key==='Enter')editMapAlias(decodeURIComponent('${encodeURIComponent(k)}'),this.value)">
      <datalist id="alias-edit-list-${encodeURIComponent(k)}">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b btn-xs" onclick="editMapAlias(decodeURIComponent('${encodeURIComponent(k)}'),document.getElementById('alias-edit-${encodeURIComponent(k)}').value)">수정</button>
      <button class="btn btn-r btn-xs" data-ak="${encodeURIComponent(k)}" onclick="if(confirm('약자 \''+decodeURIComponent('${encodeURIComponent(k)}')+'\'를 삭제할까요?'))delMapAlias(decodeURIComponent(this.getAttribute('data-ak')))">🗑️ 삭제</button>
    </div>`).join('') || '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">아직 추가된 약자가 없습니다.</div>';
}

function editMapAlias(key, newVal){
  newVal=(newVal||'').trim();
  if(!newVal){alert('맵 이름을 입력하세요.');return;}
  if(key===newVal){alert('약자와 맵 이름이 같습니다.');return;}
  userMapAlias[key]=newVal;
  saveCfg();
  _refreshAliasList();
}

function addMapAlias(){
  const key = (document.getElementById('alias-key')?.value || '').trim();
  const val = (document.getElementById('alias-val')?.value || '').trim();
  const msg = document.getElementById('alias-msg');
  if(!key){ if(msg){msg.style.color='var(--red)';msg.textContent='약자를 입력하세요.';} return; }
  if(!val){ if(msg){msg.style.color='var(--red)';msg.textContent='맵을 선택하세요.';} return; }
  if(key===val){ if(msg){msg.style.color='var(--red)';msg.textContent='약자와 맵 이름이 같습니다.';} return; }
  if(PASTE_MAP_ALIAS_DEFAULT[key] && PASTE_MAP_ALIAS_DEFAULT[key]!==val){
    if(!confirm(`'${key}'는 기본 내장 약자(${PASTE_MAP_ALIAS_DEFAULT[key]})입니다.\n'${val}'으로 덮어쓸까요?`)) return;
  }
  userMapAlias[key]=val;
  saveCfg();
  if(msg){msg.style.color='var(--green)';msg.textContent=`✅ '${key}' → '${val}' 추가됨`;}
  document.getElementById('alias-key').value='';
  document.getElementById('alias-val').value='';
  _refreshAliasList(); // render() 대신 목록만 부분 업데이트
}

function delMapAlias(key){
  delete userMapAlias[key];
  saveCfg();
  _refreshAliasList();
}

function restoreDefaultMapAlias(encK){
  const k=decodeURIComponent(encK);
  delete userMapAlias[k+'__disabled'];
  saveCfg(); render();
}

function delDefaultMapAlias(encK, encV){
  const k=decodeURIComponent(encK), v=decodeURIComponent(encV);
  if(!confirm(`기본 약자 '${k}' → '${v}' 를 비활성화할까요?\n(사용자 정의로 덮어쓰거나, 복원하려면 직접 추가하세요)`)) return;
  userMapAlias[k+'__disabled']='1';
  saveCfg(); render();
}

function _renderCfgSiList(){
  const el=document.getElementById('cfg-si-list');
  if(!el)return;
  if(!players.length){el.innerHTML='<div style="padding:20px;text-align:center;color:var(--gray-l)">등록된 선수 없음</div>';return;}
  const iconOptCache=Object.entries(STATUS_ICON_DEFS);
  el.innerHTML=[...players].sort((a,b)=>a.name.localeCompare(b.name,'ko')).map(p=>{
    const cur=playerStatusIcons[p.name]||'';
    const pN=p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const encN=encodeURIComponent(p.name);
    const opts=iconOptCache.map(([id,d])=>`<option value="${id}"${(!cur&&id==='none')||(cur&&(cur===id||cur===d.emoji)&&id!=='none')?' selected':''}>${!_siIsImg(d.emoji)&&d.emoji?d.emoji+' ':''}${d.label}</option>`).join('');
    const delBtn=p.photo?`<button onclick="setProfilePhoto('${pN}','')" style="font-size:11px;padding:2px 6px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;cursor:pointer;flex-shrink:0" title="이미지 삭제">🗑️</button>`:'';
    const clrBtn=cur?`<button onclick="setStatusIcon('${pN}','none');_cfgRefreshSiRow('${pN}')" style="background:none;border:1px solid var(--border2);border-radius:4px;color:#dc2626;cursor:pointer;font-size:12px;padding:2px 7px" title="아이콘 제거">×</button>`:'';
    return `<div style="border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;padding:7px 12px 4px">
        <span id="cfg-photo-wrap-${encN}" style="flex-shrink:0">${getPlayerPhotoHTML(p.name,'32px')}</span>
        <span style="font-weight:600;flex:1;min-width:0;font-size:13px">${p.name}<span style="font-size:10px;color:var(--gray-l);margin-left:4px">${p.univ||''}·${p.tier||''}</span></span>
        <span id="cfg-si-prev-${encN}" style="min-width:26px;text-align:center;display:inline-flex;align-items:center;justify-content:center">${cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):''}</span>
        <select onchange="setStatusIcon('${pN}',this.value);_cfgRefreshSiRow('${pN}')" style="font-size:12px;padding:3px 6px;border:1px solid var(--border2);border-radius:5px;max-width:120px">${opts}</select>
        <span id="cfg-si-clr-${encN}">${clrBtn}</span>
      </div>
      <div style="display:flex;align-items:center;gap:5px;padding:0 12px 6px 52px">
        <span style="font-size:10px;color:var(--gray-l);white-space:nowrap">🖼️ 프로필</span>
        <input type="text" id="cfg-photo-url-${encN}" placeholder="이미지 URL 입력..." value="${(p.photo||'').replace(/"/g,'&quot;')}" style="flex:1;min-width:0;font-size:11px;padding:2px 6px;border:1px solid var(--border2);border-radius:5px" onkeydown="if(event.key==='Enter')setProfilePhoto('${pN}',this.value)">
        <button onclick="setProfilePhoto('${pN}',document.getElementById('cfg-photo-url-${encN}').value)" style="font-size:11px;padding:2px 8px;border-radius:5px;border:1px solid var(--blue);background:var(--blue-ll);color:var(--blue);cursor:pointer;white-space:nowrap;flex-shrink:0">저장</button>
        ${delBtn}
      </div>
    </div>`;
  }).join('');
}

function _cfgRefreshSiRow(name){
  const encN=encodeURIComponent(name);
  const cur=playerStatusIcons[name]||'';
  const prevEl=document.getElementById('cfg-si-prev-'+encN);
  if(prevEl) prevEl.innerHTML=cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):'';
  const clrEl=document.getElementById('cfg-si-clr-'+encN);
  if(clrEl){
    const pN=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    clrEl.innerHTML=cur?`<button onclick="setStatusIcon('${pN}','none');_cfgRefreshSiRow('${pN}')" style="background:none;border:1px solid var(--border2);border-radius:4px;color:#dc2626;cursor:pointer;font-size:12px;padding:2px 7px" title="아이콘 제거">×</button>`:'';
  }
}

function setProfilePhoto(name, url){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  const trimmed=(url||'').trim();
  if(trimmed) p.photo=trimmed; else delete p.photo;
  savePhotos();
  const encN=encodeURIComponent(name);
  const wrap=document.getElementById('cfg-photo-wrap-'+encN);
  if(wrap) wrap.innerHTML=getPlayerPhotoHTML(name,'32px');
  const urlInp=document.getElementById('cfg-photo-url-'+encN);
  if(urlInp) urlInp.value=trimmed;
  const row=urlInp&&urlInp.parentElement;
  if(row){
    const delBtn=row.querySelector('button[title="이미지 삭제"]');
    const pN=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    if(trimmed&&!delBtn){
      const b=document.createElement('button');
      b.title='이미지 삭제';
      b.style.cssText='font-size:11px;padding:2px 6px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;cursor:pointer;flex-shrink:0';
      b.textContent='🗑️';
      b.onclick=()=>setProfilePhoto(pN,'');
      row.appendChild(b);
    } else if(!trimmed&&delBtn){
      delBtn.remove();
    }
  }
}

function addTier(){
  const n=document.getElementById('nt-name').value.trim();
  if(!n)return alert('티어 이름을 입력하세요.');
  if(TIERS.includes(n))return alert('이미 존재하는 티어입니다.');
  TIERS.push(n);
  // TIERS는 const이므로 push 가능
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
}
function delTier(t){
  const protectedTiers=['G','K','JA','J','S','0티어'];
  if(protectedTiers.includes(t))return alert('기본 티어는 삭제할 수 없습니다.');
  if(!confirm(`"${t}" 티어를 삭제하시겠습니까?\n해당 티어의 선수는 기본 티어로 변경되지 않습니다.`))return;
  const idx=TIERS.indexOf(t);
  if(idx>=0)TIERS.splice(idx,1);
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t2=>`<option value="${t2}">${getTierLabel(t2)}</option>`).join('');
}

async function addAdminAccount(){
  const id=document.getElementById('adm-id').value.trim();
  const pw=document.getElementById('adm-pw').value;
  const roleEl=document.getElementById('adm-role');
  const role=roleEl?roleEl.value:'admin';
  const msg=document.getElementById('adm-msg');
  if(!id||!pw){msg.style.color='var(--red)';msg.textContent='아이디와 비밀번호를 모두 입력하세요.';return;}
  if(pw.length<4){msg.style.color='var(--red)';msg.textContent='비밀번호는 4자 이상이어야 합니다.';return;}
  const h=await sha256(id+':'+pw);
  const accounts=getAdminAccounts();
  if(accounts.some(a=>a.hash===h)){msg.style.color='var(--gold)';msg.textContent='이미 동일한 계정이 등록되어 있습니다.';return;}
  accounts.push({hash:h,role,label:id});
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(accounts));
  msg.style.color='var(--green)';
  const roleLabel=role==='sub-admin'?'부관리자':'관리자';
  msg.textContent=`✅ ${roleLabel} 계정이 추가되었습니다. (${id}) 총 ${accounts.length}명`;
  document.getElementById('adm-id').value='';
  document.getElementById('adm-pw').value='';
  reCfg();
}

async function clearAllAdmins(){
  if(!confirm('모든 관리자 계정을 초기화하고 기본 계정(admin99)으로 리셋하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'))return;
  const h=await sha256('admin99:99admin');
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify([{hash:h,role:'admin',label:'admin99'}]));
  alert('초기화 완료. 기본 계정(admin99 / 99admin)으로 로그인하세요.');
  doLogout();
}

function saveFbPw(){
  const pw = document.getElementById('cfg-fb-pw')?.value.trim();
  const statusEl = document.getElementById('fb-pw-status');
  if (!pw) { if(statusEl) statusEl.textContent = '⚠️ 비밀번호를 입력하세요.'; return; }
  localStorage.setItem('su_fb_pw', pw);
  if (statusEl) statusEl.textContent = '✅ 비밀번호 저장됨';
  const input = document.getElementById('cfg-fb-pw');
  if (input) input.value = '';
}
function clearFbPw(){
  localStorage.removeItem('su_fb_pw');
  const statusEl = document.getElementById('fb-pw-status');
  if (statusEl) statusEl.textContent = '미설정';
}
function saveGhToken(){
  const val = document.getElementById('cfg-gh-token')?.value.trim();
  const statusEl = document.getElementById('gh-token-status');
  if (!val) { if(statusEl) statusEl.textContent = '⚠️ 토큰을 입력하세요.'; return; }
  localStorage.setItem('su_gh_token', val);
  if(statusEl) statusEl.textContent = '✅ 토큰 저장됨 (저장 시 GitHub 자동 업로드 활성)';
  const input = document.getElementById('cfg-gh-token');
  if(input) input.value = '';
}
function clearGhToken(){
  localStorage.removeItem('su_gh_token');
  const statusEl = document.getElementById('gh-token-status');
  if(statusEl) statusEl.textContent = '미설정 (관람자는 Firebase 사용 중)';
}

// ─── 스트리머 상세 스타일 설정 ─────────────────────────────────────────────────
function _renderCfgPdSection(){
  const body=document.getElementById('cfg-pd-body');
  if(!body) return;
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  const fs=s.font_size||'normal';
  const cp=s.color_preset||'normal';
  const st=s.stats_tint!==undefined?s.stats_tint:8;
  const mt=s.mode_tint!==undefined?s.mode_tint:10;
  const ps=s.profile_size!==undefined?s.profile_size:100;
  const closeOnBadge=s.close_on_badge!==undefined?s.close_on_badge:true;
  const closeOnMatchPlayer=s.close_on_match_player!==undefined?s.close_on_match_player:true;
  const headerClickClose=s.header_click_close!==undefined?s.header_click_close:true;
  const _shape = (()=>{
    try{ return (localStorage.getItem('su_bcp_shape')||'circle'); }catch(e){ return 'circle'; }
  })(); // circle | square
  const shapeBtns = `
    <button class="btn btn-xs ${_shape==='circle'?'btn-b':'btn-w'}" onclick="_setGlobalProfileShape('circle')">⭕ 원형</button>
    <button class="btn btn-xs ${_shape==='square'?'btn-b':'btn-w'}" onclick="_setGlobalProfileShape('square')">⬛ 네모</button>
  `;
  const darken=s.univ_darken||{};
  const univs=(typeof getAllUnivs==='function'?getAllUnivs():univCfg).filter(u=>u.name!=='무소속');
  const fsBtns=['normal','large','xlarge'].map(f=>`<button class="btn btn-xs ${f===fs?'btn-b':'btn-w'}" onclick="_setPdFontSize('${f}')">${f==='normal'?'기본':f==='large'?'크게 (×1.12)':'더 크게 (×1.2)'}</button>`).join('');
  const cpBtns=[['light','연하게'],['normal','기본'],['dark','진하게']].map(([k,l])=>`<button class="btn btn-xs ${cp===k?'btn-b':'btn-w'}" onclick="_setPdColorPreset('${k}')">${l}</button>`).join('');
  const univRows=univs.map((u,i)=>{
    const val=Math.round((darken[u.name]||0)*100);
    const safe=u.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="width:14px;height:14px;border-radius:50%;background:${u.color};flex-shrink:0;border:1px solid rgba(0,0,0,.12)"></span>
      <span style="font-size:12px;font-weight:600;color:var(--text2);min-width:72px;flex-shrink:0">${u.name}</span>
      <input type="range" min="0" max="50" step="5" value="${val}" style="flex:1;accent-color:var(--blue)" oninput="_setPdUnivDarken('${safe}',this.value/100,${i})">
      <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="pd-dv-${i}">${val}%</span>
    </div>`;
  }).join('');
  body.innerHTML=`
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 폰트 크기</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${fsBtns}</div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">스트리머 상세 모달 전체 크기에 적용됩니다</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🖼️ 프로필 이미지 크기</div>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="60" max="140" step="5" value="${ps}" style="flex:1;accent-color:var(--blue)" oninput="_setPdProfileSize(this.value);document.getElementById('pd-ps-val').textContent=this.value+'%'">
        <span id="pd-ps-val" style="font-size:11px;color:var(--gray-l);min-width:35px;text-align:right;font-weight:700">${ps}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">프로필 이미지 크기 (기본 100%)</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📐 프로필 이미지 모양 (전역)</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${shapeBtns}</div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">스트리머 상세/통계(티어랭킹·이달의 스트리머·최다기록·킬러/피해자 등)·경기 상세의 프로필 이미지 모양에 공통 적용됩니다</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🎨 승패 색상 농도</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">${cpBtns}</div>
      <div style="font-size:11px;color:var(--gray-l)">전적·승률·포인트·모드별 전적의 승/패/승률 색상 전체에 적용</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📊 전적·승률 배경 색상 강도</div>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="0" max="30" step="2" value="${st}" style="flex:1;accent-color:var(--blue)" oninput="_setPdTint('stats',this.value);document.getElementById('pd-st-val').textContent=this.value+'%'">
        <span id="pd-st-val" style="font-size:11px;color:var(--gray-l);min-width:28px;font-weight:700">${st}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:4px">전적/승률/포인트/ELO 영역 배경 대학색 강도 (현재 ${st}%)</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🃏 모드별 전적 배경 색상 강도</div>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="0" max="30" step="2" value="${mt}" style="flex:1;accent-color:var(--blue)" oninput="_setPdTint('mode',this.value);document.getElementById('pd-mt-val').textContent=this.value+'%'">
        <span id="pd-mt-val" style="font-size:11px;color:var(--gray-l);min-width:28px;font-weight:700">${mt}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:4px">모드별 전적 카드 배경 모드색 강도 (현재 ${mt}%)</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">⚙️ 팝업 동작 설정</div>
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${closeOnBadge?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdCloseOnBadge(this.checked)">
          <span style="font-size:12px;color:var(--text)">종목 클릭 시 팝업 닫기</span>
        </label>
      </div>
      <div style="font-size:11px;color:var(--gray-l)">활성화 시: 종목 아이콘/배지 클릭 시 스트리머 상세 팝업이 닫힙니다</div>
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${closeOnMatchPlayer?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdCloseOnMatchPlayer(this.checked)">
          <span style="font-size:12px;color:var(--text)">경기 상세에서 선수 클릭 시 팝업 닫기</span>
        </label>
      </div>
      <div style="font-size:11px;color:var(--gray-l)">활성화 시: 경기 상세 팝업에서 선수 이름을 누르면 경기 상세 팝업이 닫힙니다</div>
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${headerClickClose?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdHeaderClickClose(this.checked)">
          <span style="font-size:12px;color:var(--text)">팝업 헤더 클릭 시 닫기</span>
        </label>
      </div>
      <div style="font-size:11px;color:var(--gray-l)">활성화 시: 각 팝업 상단 헤더(제목)를 클릭하면 팝업이 닫힙니다 (드래그 이동은 유지)</div>
    </div>
    <div>
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:4px">🌗 대학별 헤더 어둡기</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">밝은 색상 대학은 어둡게 조정하면 이름이 더 잘 보입니다</div>
      ${univRows}
    </div>`;
}

function _setPdFontSize(size){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.font_size=size;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
}

function _setPdProfileSize(val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.profile_size=parseInt(val)||100;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}

function _setPdColorPreset(cp){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.color_preset=cp;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
}

function _setPdTint(type,val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s[type+'_tint']=parseInt(val)||0;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}

function _setPdUnivDarken(univ,val,idx){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  if(!s.univ_darken) s.univ_darken={};
  s.univ_darken[univ]=parseFloat(val)||0;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  const el=document.getElementById('pd-dv-'+idx);
  if(el) el.textContent=Math.round(val*100)+'%';
}

function _setPdCloseOnBadge(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.close_on_badge=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}

function _setPdCloseOnMatchPlayer(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.close_on_match_player=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}

function _setPdHeaderClickClose(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.header_click_close=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}

// 전역 프로필 이미지 모양(원/네모)
function _setGlobalProfileShape(shape){
  try{
    const v = (shape==='square') ? 'square' : 'circle';
    localStorage.setItem('su_bcp_shape', v);
    // 현황판 칩 설정과 동일 키 사용
    try{ if(typeof boardChipPhotoShape!=='undefined') boardChipPhotoShape=v; }catch(e){}
    try{ if(typeof saveBoardChipPhotoSettings==='function') saveBoardChipPhotoSettings(); }catch(e){}
    try{ if(typeof applyProfileShapeVars==='function') applyProfileShapeVars(); }catch(e){}
  }catch(e){}
  _renderCfgPdSection();
  try{ if(typeof render==='function') render(); }catch(e){}
}




/* ==========================================
   STATISTICS TAB
========================================== */
let statsSub='overview';
