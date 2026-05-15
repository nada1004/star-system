/* ══════════════════════════════════════
   CONSTANTS - 티어 순서: god > king > jack > joker > spade > 0티어 > 1티어 ...
══════════════════════════════════════ */
// 데이터 버전 관리 - 캐시 무효화용 (데이터 구조 변경 시 버전 증가)
const DATA_VERSION = 1;

// 캐시 관리 함수
function _checkDataVersion(){
  try{
    // 세션 스토리지에 체크 완료 플래그가 있으면 스킵
    if(sessionStorage.getItem('su_version_checked') === 'true') return;
    
    const savedVer = Number(localStorage.getItem('su_data_version')) || 0;
    if(savedVer !== DATA_VERSION){
      console.log('[Cache] 데이터 버전 변경됨:', savedVer, '->', DATA_VERSION, '- 캐시 초기화');
      _clearCacheByVersionChange();
    }else{
      // 버전이 같으면 체크 완료 플래그 설정
      sessionStorage.setItem('su_version_checked', 'true');
    }
  }catch(e){
    console.error('[Cache] 버전 확인 실패:', e);
  }
}

function _clearCacheByVersionChange(){
  try{
    // 먼저 새 버전을 저장하여 무한 루프 방지
    localStorage.setItem('su_data_version', String(DATA_VERSION));
    
    const cacheKeys = ['su_tiers', 'su_u', 'su_m', 'su_t', 'su_cn', 'su_cc', 'su_ptc', 'su_ttcur', 'su_boardOrder', 'su_bpo', 'su_notices', 'su_seasons', 'su_cal_sched'];
    cacheKeys.forEach(key => {
      try{ localStorage.removeItem(key); }catch(e){}
    });
    console.log('[Cache] 캐시 초기화 완료');
    // (요청) 버전 변경 시 강제 새로고침은 하지 않음
    // - 일부 환경에서 localStorage/sessionStorage 반영 타이밍 문제로 "계속 새로고침"처럼 느껴질 수 있음
    // - 대신 이번 세션에서는 체크 완료로 표시하고, 사용자에게 필요 시 수동 새로고침을 안내
    try{ sessionStorage.setItem('su_version_checked', 'true'); }catch(e){}
    try{ if(typeof showToast==='function') showToast('캐시 초기화 완료. 필요 시 새로고침(F5) 해주세요.'); }catch(e){}
  }catch(e){
    console.error('[Cache] 캐시 초기화 실패:', e);
  }
}

window.clearAppCache = function(){
  if(!confirm('앱 캐시를 초기화하시겠습니까?\n\n⚠️ 저장된 모든 데이터가 삭제됩니다.')) return;
  try{
    localStorage.clear();
    console.log('[Cache] 전체 캐시 삭제 완료');
    location.reload();
  }catch(e){
    alert('캐시 삭제 실패: ' + e.message);
  }
};

window.clearSpecificCache = function(keys){
  if(!Array.isArray(keys)) keys = [keys];
  try{
    keys.forEach(key => {
      try{ localStorage.removeItem(key); }catch(e){}
    });
    console.log('[Cache] 특정 캐시 삭제 완료:', keys);
    return true;
  }catch(e){
    console.error('[Cache] 특정 캐시 삭제 실패:', e);
    return false;
  }
};

let TIERS = (()=>{const t=J('su_tiers')||['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스'];if(!t.includes('미정'))t.push('미정');return t;})();
const RACES=['T','Z','P','N'];
const RNAME={T:'테란',Z:'저그',P:'프로토스',N:'종족미정'};
const RANK_PTS={'🥇 1위':3,'🥈 2위':0,'🥉 3위':-3,'4강':0,'8강':0,'출전':0};

/* ══════════════════════════════════════
   탭 라벨(표시 이름) 설정
   - 내부 id는 유지하고 "표시되는 이름만" 설정에서 교체
   - localStorage: su_tab_labels_v1 (LZString/JSON 모두 지원: J/_lsSave 활용)
══════════════════════════════════════ */
const _TAB_LBL_KEY = 'su_tab_labels_v1';
function getTabLabel(ctx, id, def){
  try{
    const m = J(_TAB_LBL_KEY) || {};
    const v = (m[ctx] && m[ctx][id] != null) ? String(m[ctx][id]) : '';
    return v ? v : def;
  }catch(e){
    return def;
  }
}
function applyTabLabels(ctx, items, key='lbl'){
  try{
    if(!Array.isArray(items)) return items;
    return items.map(it=>{
      if(!it || typeof it!=='object') return it;
      const base = (it[key] != null) ? it[key] : '';
      return { ...it, [key]: getTabLabel(ctx, it.id, base) };
    });
  }catch(e){
    return items;
  }
}
function applyMainTabLabels(){
  try{
    const defs = {
      total:'스트리머',
      board2:'현황판',
      tier:'티어 순위표',
      hist:'대전 기록',
      ind:'개인전/끝장전',
      univm:'대학전',
      comp:'대회/티어',
      pro:'프로리그',
      stats:'통계',
      cal:'캘린더',
      roulette:'룰렛',
      cfg:'설정'
    };
    document.querySelectorAll('.tab').forEach(btn=>{
      let id = '';
      try{
        const oc = btn.getAttribute('onclick') || '';
        const m = oc.match(/sw\(['"]([^'"]+)['"]/);
        id = m ? m[1] : '';
      }catch(e){}
      if(!id) return;
      const label = getTabLabel('main', id, defs[id] || btn.textContent.trim());
      let txtNode = null;
      [...btn.childNodes].forEach(n=>{
        if(txtNode) return;
        if(n && n.nodeType === Node.TEXT_NODE && String(n.textContent||'').trim()) txtNode = n;
      });
      if(txtNode) txtNode.textContent = label;
      else btn.appendChild(document.createTextNode(label));
      try{ btn.dataset.tabLabel = label; }catch(e){}
    });
  }catch(e){}
}
function setTabLabel(ctx, id, val){
  try{
    const m = J(_TAB_LBL_KEY) || {};
    m[ctx] = m[ctx] || {};
    const v = String(val||'').trim();
    if(!v) delete m[ctx][id];
    else m[ctx][id] = v;
    _lsSave(_TAB_LBL_KEY, m);
  }catch(e){}
  try{ if(typeof applyMainTabLabels==='function') applyMainTabLabels(); }catch(e){}
}
function resetTabLabels(ctx){
  try{
    if(!ctx){ localStorage.removeItem(_TAB_LBL_KEY); return; }
    const m = J(_TAB_LBL_KEY) || {};
    delete m[ctx];
    _lsSave(_TAB_LBL_KEY, m);
  }catch(e){}
  try{ if(typeof applyMainTabLabels==='function') applyMainTabLabels(); }catch(e){}
}
function exportTabLabels(){
  try{
    const raw = localStorage.getItem(_TAB_LBL_KEY);
    const m = raw ? (J(_TAB_LBL_KEY) || {}) : {};
    return JSON.stringify(m, null, 2);
  }catch(e){
    return '{}';
  }
}
function importTabLabels(text){
  try{
    const obj = JSON.parse(String(text||'').trim() || '{}');
    _lsSave(_TAB_LBL_KEY, obj && typeof obj==='object' ? obj : {});
    try{ if(typeof applyMainTabLabels==='function') applyMainTabLabels(); }catch(e){}
    return true;
  }catch(e){
    throw e;
  }
}
try{
  window.getTabLabel = getTabLabel;
  window.applyTabLabels = applyTabLabels;
  window.applyMainTabLabels = applyMainTabLabels;
  window.setTabLabel = setTabLabel;
  window.resetTabLabels = resetTabLabels;
  window.exportTabLabels = exportTabLabels;
  window.importTabLabels = importTabLabels;
}catch(e){}
try{ setTimeout(()=>{ if(typeof applyMainTabLabels==='function') applyMainTabLabels(); }, 0); }catch(e){}

/* ══════════════════════════════════════
   상세 상태 객체
   - 기존 전역 변수와 호환되는 alias를 유지하면서
     선수/대학 상세 상태를 공통 객체로 수렴
══════════════════════════════════════ */
function _suDefineWindowAlias(key, getter, setter){
  try{
    const desc = Object.getOwnPropertyDescriptor(window, key);
    if(desc && desc.get && desc.set) return;
    Object.defineProperty(window, key, {
      configurable: true,
      enumerable: true,
      get: getter,
      set: setter
    });
  }catch(e){}
}

function ensureDetailStateObjects(){
  try{
    if(!window.PlayerDetailState){
      window.PlayerDetailState = {
        currentName: '',
        year: '',
        years: [],
        histFilter: '',
        histFilters: [],
        seasonFilter: '전체',
        seasonFilters: [],
        oppPage: 0,
        oppSort: 'tot'
      };
    }
    if(!window.UnivDetailState){
      window.UnivDetailState = {
        currentName: '',
        editOpen: false
      };
    }

    const ps = window.PlayerDetailState;
    const us = window.UnivDetailState;

    _suDefineWindowAlias('_playerModalCurrentName', ()=>ps.currentName, v=>{ ps.currentName = v || ''; });
    _suDefineWindowAlias('_playerModalYear', ()=>ps.year, v=>{ ps.year = v || ''; });
    _suDefineWindowAlias('_playerModalYears', ()=>ps.years, v=>{ ps.years = Array.isArray(v) ? v : []; });
    _suDefineWindowAlias('_playerHistFilter', ()=>ps.histFilter, v=>{ ps.histFilter = v || ''; });
    _suDefineWindowAlias('_playerHistFilters', ()=>ps.histFilters, v=>{ ps.histFilters = Array.isArray(v) ? v : []; });
    _suDefineWindowAlias('_playerSeasonFilter', ()=>ps.seasonFilter, v=>{ ps.seasonFilter = v || '전체'; });
    _suDefineWindowAlias('_playerSeasonFilters', ()=>ps.seasonFilters, v=>{ ps.seasonFilters = Array.isArray(v) ? v : []; });
    _suDefineWindowAlias('_oppPage', ()=>ps.oppPage, v=>{ ps.oppPage = Number(v)||0; });
    _suDefineWindowAlias('_oppSort', ()=>ps.oppSort, v=>{ ps.oppSort = v || 'tot'; });
    _suDefineWindowAlias('_univModalCurrentName', ()=>us.currentName, v=>{ us.currentName = v || ''; });
    _suDefineWindowAlias('_univEditOpen', ()=>us.editOpen, v=>{ us.editOpen = !!v; });
  }catch(e){}
}

function getPlayerDetailState(){
  try{
    ensureDetailStateObjects();
    return window.PlayerDetailState || {};
  }catch(e){
    return window.PlayerDetailState || {};
  }
}

function getUnivDetailState(){
  try{
    ensureDetailStateObjects();
    return window.UnivDetailState || {};
  }catch(e){
    return window.UnivDetailState || {};
  }
}

function resetPlayerDetailState(){
  const st = getPlayerDetailState();
  st.currentName = '';
  st.year = '';
  st.years = [];
  st.histFilter = '';
  st.histFilters = [];
  st.seasonFilter = '전체';
  st.seasonFilters = [];
  st.oppPage = 0;
  st.oppSort = 'tot';
  return st;
}

function resetUnivDetailState(){
  const st = getUnivDetailState();
  st.currentName = '';
  st.editOpen = false;
  return st;
}

try{
  ensureDetailStateObjects();
  window.ensureDetailStateObjects = ensureDetailStateObjects;
  window.getPlayerDetailState = getPlayerDetailState;
  window.getUnivDetailState = getUnivDetailState;
  window.resetPlayerDetailState = resetPlayerDetailState;
  window.resetUnivDetailState = resetUnivDetailState;
}catch(e){}

/* ══════════════════════════════════════
   스트리머 프로필 이미지 공통 스타일
   - 현황판 칩 프로필 이미지 설정(su_bcp_shape)을 "프로필 이미지 모양"의 기준으로도 사용
   - 인라인 스타일에서도 적용 가능하도록 CSS 변수로 노출
══════════════════════════════════════ */
function applyProfileShapeVars(){
  try{
    // (보강) 전역 프로필 모양은 su_profile_shape를 우선 사용하고,
    // 없으면 과거 호환으로 su_bcp_shape(현황판 칩 모양)를 사용
    const shape = localStorage.getItem('su_profile_shape') || localStorage.getItem('su_bcp_shape') || 'circle';
    const _shapeRadius = {
      circle: '50%',
      square: '6px',
      rounded: '22%',
      diamond: '50%',
      hexagon: '50%',
      shield: '50% 50% 45% 45% / 60% 60% 40% 40%'
    };
    const radius = _shapeRadius[shape] || '50%';
    document.documentElement.style.setProperty('--su_profile_radius', radius);
    // 특수 모양(diamond/hexagon/shield)은 clip-path로 처리
    const _shapeClip = {
      diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      hexagon: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
      shield: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)'
    };
    const clipPath = _shapeClip[shape] || 'none';
    document.documentElement.style.setProperty('--su_profile_clip', clipPath);

    // (추가) 기기별 프로필 이미지 크기 배율
    // - PC/태블릿/모바일 각각 %로 저장
    const w = (typeof window!=='undefined' && window.innerWidth) ? window.innerWidth : 1200;
    const pc = parseInt(localStorage.getItem('su_profile_scale_pc')||'100',10) || 100;
    const tb = parseInt(localStorage.getItem('su_profile_scale_tb')||'96',10) || 96;
    const mb = parseInt(localStorage.getItem('su_profile_scale_mb')||'92',10) || 92;
    const pct = (w<=768) ? mb : (w<=1024 ? tb : pc);
    const sc = Math.max(0.7, Math.min(1.3, pct/100));
    document.documentElement.style.setProperty('--su_profile_scale', String(sc));

    // (추가) 프로필 이미지 효과
    const fx = (localStorage.getItem('su_profile_fx')||'none').trim();
    let shadow = 'none';
    if(fx==='shadow') shadow = '0 6px 16px rgba(0,0,0,.18)';
    if(fx==='ring') shadow = '0 0 0 2px rgba(255,255,255,.85)';
    if(fx==='both') shadow = '0 0 0 2px rgba(255,255,255,.85), 0 6px 16px rgba(0,0,0,.18)';
    document.documentElement.style.setProperty('--su_profile_fx', shadow);
  }catch(e){
    console.warn('[applyProfileShapeVars] CSS 변수 설정 실패:', e.message);
  }
}
// 초기 1회 적용
try{ applyProfileShapeVars(); }catch(e){
  console.warn('[applyProfileShapeVars 초기화] 실패:', e.message);
}
// 화면 크기 변경 시도 반영
try{
  if(!window.__suProfileShapeResizeBound){
    window.__suProfileShapeResizeBound=true;
    window.addEventListener('resize', ()=>{ try{ applyProfileShapeVars(); }catch(e){}; }, {passive:true});
  }
}catch(e){}

/* ══════════════════════════════════════
   대학 로고 공통 스타일 (현황판/설정 등)
   - 모양/크기/레이아웃(박스) 크기를 CSS 변수로 노출
══════════════════════════════════════ */
function applyUnivLogoVars(){
  try{
    const shape = localStorage.getItem('su_ul_shape') || 'circle'; // circle|square
    const size  = parseInt(localStorage.getItem('su_ul_size') || '34', 10);
    const box   = parseInt(localStorage.getItem('su_ul_box')  || '46', 10);
    // 대학 상세(대학 모달) 전용 크기 (없으면 기본 크기 사용)
    const dSize = parseInt(localStorage.getItem('su_ul_size_detail') || String(size), 10);
    const dBox  = parseInt(localStorage.getItem('su_ul_box_detail')  || String(box), 10);
    const radius = (shape === 'square') ? '10px' : '50%';
    document.documentElement.style.setProperty('--su_univ_logo_radius', radius);
    document.documentElement.style.setProperty('--su_univ_logo_size', size + 'px');
    document.documentElement.style.setProperty('--su_univ_logo_box', box + 'px');
    // 대학 상세(모달)용
    document.documentElement.style.setProperty('--su_univ_logo_size_detail', dSize + 'px');
    document.documentElement.style.setProperty('--su_univ_logo_box_detail', dBox + 'px');

    // (추가) 모바일/태블릿에서 대학 상세(모달) 헤더가 너무 커 보이는 문제 완화
    // - 저장값(기본 크기)은 유지하고, 화면폭에 따라 "표시용 배율"만 적용한다.
    const w = (typeof window!=='undefined' && window.innerWidth) ? window.innerWidth : 1200;
    const ds = (w<=768) ? 0.82 : (w<=1024 ? 0.90 : 1);
    document.documentElement.style.setProperty('--su_univ_detail_scale', String(ds));
  }catch(e){
    console.warn('[applyUnivLogoVars] CSS 변수 설정 실패:', e.message);
  }
}
try{ applyUnivLogoVars(); }catch(e){
  console.warn('[applyUnivLogoVars 초기화] 실패:', e.message);
}
// 화면 크기 변경 시도 반영
try{
  if(!window.__suUnivLogoResizeBound){
    window.__suUnivLogoResizeBound=true;
    window.addEventListener('resize', ()=>{ try{ applyUnivLogoVars(); }catch(e){}; }, {passive:true});
  }
}catch(e){}

/* ══════════════════════════════════════
   현황판(board2) 대학 로고 크기
══════════════════════════════════════ */
function applyBoard2LogoVars(){
  try{
    const px = parseInt(localStorage.getItem('su_b2_univ_logo_size') || '42', 10);
    const v = Math.max(24, Math.min(80, isNaN(px) ? 42 : px));
    document.documentElement.style.setProperty('--su_b2_univ_logo_size', v + 'px');
  }catch(e){
    console.warn('[applyBoard2LogoVars] CSS 변수 설정 실패:', e.message);
  }
}
try{ applyBoard2LogoVars(); }catch(e){}

/* ══════════════════════════════════════
   📱 반응형 UI 크기(버튼/메뉴/배지) 변수 적용
══════════════════════════════════════ */
function applyResponsiveUiVars(){
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const gf=(k,def)=>{ try{ const v=parseFloat(localStorage.getItem(k)); return isNaN(v)?def:v; }catch(e){ return def; } };
  try{
    // 전체 버튼/메뉴 스케일(모바일/태블릿)
    const mb = clamp(gf('su_mb_scale', 0.88), 0.65, 1.10);
    const tb = clamp(gf('su_tb_scale', 0.92), 0.65, 1.10);
    const mmb = clamp(gf('su_modal_mb_scale', 0.70), 0.55, 1.10);
    const mtb = clamp(gf('su_modal_tb_scale', 0.78), 0.55, 1.10);
    const mbTab = clamp(gf('su_tab_mb_scale', 0.90), 0.65, 1.10);
    const tbTab = clamp(gf('su_tab_tb_scale', 0.94), 0.65, 1.10);
    const mdMb = clamp(gf('su_md_mb_btn_scale', 1.00), 0.70, 1.30);
    const mdTb = clamp(gf('su_md_tb_btn_scale', 1.00), 0.70, 1.30);
    const pdBadgeMb = clamp(gf('su_pd_badge_scale_mb', gf('su_pd_badge_scale', 1.00)), 0.55, 1.20);
    const pdBadgeTb = clamp(gf('su_pd_badge_scale_tb', gf('su_pd_badge_scale', 1.00)), 0.60, 1.25);
    const univRecentMb = clamp(gf('su_univ_recent_chip_scale_mb', 1.00), 0.60, 1.20);
    const univRecentTb = clamp(gf('su_univ_recent_chip_scale_tb', 1.00), 0.65, 1.25);
    const selMb = clamp(gf('su_select_mb_scale', 0.92), 0.70, 1.15);
    const selTb = clamp(gf('su_select_tb_scale', 0.96), 0.70, 1.15);
    const badge = clamp(gf('su_pd_badge_scale', 1.00), 0.70, 1.30);
    const chip = clamp(gf('su_pd_chip_scale', 1.00), 0.70, 1.30);
    const topTabPcFont = clamp(gf('su_top_tab_font_pc_px', 12), 9, 20);
    const topTabMbFont = clamp(gf('su_top_tab_font_mb_px', 10), 8, 16);
    const topTabTbFont = clamp(gf('su_top_tab_font_tb_px', 11), 9, 18);
    const subTabFont = clamp(gf('su_subtab_font_px', 12), 9, 18);
    const topTabMbGap = clamp(gf('su_top_tab_gap_mb_px', 2), 0, 16);
    const topTabMbAlign = (()=>{ try{ return (localStorage.getItem('su_top_tab_align_mb')||'start').trim(); }catch(e){ return 'start'; } })();
    const topTabMbJustify = topTabMbAlign === 'center' ? 'center' : 'flex-start';

    document.documentElement.style.setProperty('--su_mb_scale', String(mb));
    document.documentElement.style.setProperty('--su_tb_scale', String(tb));
    document.documentElement.style.setProperty('--su_modal_mb_scale', String(mmb));
    document.documentElement.style.setProperty('--su_modal_tb_scale', String(mtb));
    document.documentElement.style.setProperty('--su_tab_mb_scale', String(mbTab));
    document.documentElement.style.setProperty('--su_tab_tb_scale', String(tbTab));
    document.documentElement.style.setProperty('--su_md_mb_btn_scale', String(mdMb));
    document.documentElement.style.setProperty('--su_md_tb_btn_scale', String(mdTb));
    document.documentElement.style.setProperty('--su_pd_badge_scale_mb', String(pdBadgeMb));
    document.documentElement.style.setProperty('--su_pd_badge_scale_tb', String(pdBadgeTb));
    document.documentElement.style.setProperty('--su_univ_recent_chip_scale_mb', String(univRecentMb));
    document.documentElement.style.setProperty('--su_univ_recent_chip_scale_tb', String(univRecentTb));
    document.documentElement.style.setProperty('--su_select_mb_scale', String(selMb));
    document.documentElement.style.setProperty('--su_select_tb_scale', String(selTb));
    document.documentElement.style.setProperty('--su_pd_badge_scale', String(badge));
    document.documentElement.style.setProperty('--su_pd_chip_scale', String(chip));
    document.documentElement.style.setProperty('--su_top_tab_font_pc', topTabPcFont + 'px');
    document.documentElement.style.setProperty('--su_top_tab_font_mb', topTabMbFont + 'px');
    document.documentElement.style.setProperty('--su_top_tab_font_tb', topTabTbFont + 'px');
    document.documentElement.style.setProperty('--su_subtab_font_px', subTabFont + 'px');
    document.documentElement.style.setProperty('--su_top_tab_gap_mb', topTabMbGap + 'px');
    document.documentElement.style.setProperty('--su_tabs_justify_mb', topTabMbJustify);
  }catch(e){}
}
try{ window.applyResponsiveUiVars = applyResponsiveUiVars; }catch(e){}
try{ applyResponsiveUiVars(); }catch(e){}
try{
  if(!window.__suResponsiveUiResizeBound){
    window.__suResponsiveUiResizeBound=true;
    window.addEventListener('resize', ()=>{ try{ applyResponsiveUiVars(); }catch(e){}; }, {passive:true});
  }
}catch(e){}

/* ══════════════════════════════════════
   공통 반응형/설정 헬퍼
══════════════════════════════════════ */
function suGetDeviceKey(width){
  const w = Math.max(320, Math.min(1920, width || (window.innerWidth || 1024)));
  return w <= 768 ? 'mb' : (w <= 1024 ? 'tb' : 'pc');
}
function suReadNumberSetting(key, def){
  try{
    const v = parseFloat(localStorage.getItem(key));
    return isNaN(v) ? def : v;
  }catch(e){
    return def;
  }
}
function suClamp(v, min, max){
  return Math.max(min, Math.min(max, v));
}
function suNormalizeImgSettings(raw){
  const src = (raw && typeof raw === 'object') ? raw : {};
  const by = (src.__byDevice && typeof src.__byDevice === 'object') ? src.__byDevice : {};
  return {
    ...src,
    scaleMb: by.mb?.scale ?? src.scaleMb ?? src.scaleLeft ?? src.scale ?? 1,
    scaleTb: by.tb?.scale ?? src.scaleTb ?? src.scaleRight ?? src.scale ?? 1,
    scalePc: by.pc?.scale ?? src.scalePc ?? src.scaleRight ?? src.scale ?? 1,
    __byDevice: {
      mb: { ...(by.mb || {}), scale: by.mb?.scale ?? src.scaleMb ?? src.scaleLeft ?? src.scale ?? 1 },
      tb: { ...(by.tb || {}), scale: by.tb?.scale ?? src.scaleTb ?? src.scaleRight ?? src.scale ?? 1 },
      pc: { ...(by.pc || {}), scale: by.pc?.scale ?? src.scalePc ?? src.scaleRight ?? src.scale ?? 1 }
    }
  };
}
function suReadImgSettings(){
  try{
    return suNormalizeImgSettings(JSON.parse(localStorage.getItem('su_img_settings') || '{}') || {});
  }catch(e){
    return suNormalizeImgSettings({});
  }
}
function suBuildBoard2ImgSettingsFromProfile(settings, prevRaw){
  const base = (prevRaw && typeof prevRaw === 'object') ? prevRaw : {};
  if(!base.__byDevice || typeof base.__byDevice !== 'object') base.__byDevice = {};
  const mk = (scale)=>({
    primary: { fit: settings.fill ? 'cover' : 'contain', scale: scale * 100, brightness: settings.brightness * 100, offsetX: 0, offsetY: 0, zoom: scale * 100, posX: 0, posY: 0 },
    secondary:{ fit: settings.fill ? 'cover' : 'contain', scale: scale * 100, brightness: settings.brightness * 100, offsetX: 0, offsetY: 0, zoom: scale * 100, posX: 0, posY: 0 }
  });
  base.__byDevice.mb = mk(settings.scaleMb || settings.scale || 1);
  base.__byDevice.tb = mk(settings.scaleTb || settings.scale || 1);
  base.__byDevice.pc = mk(settings.scalePc || settings.scale || 1);
  return base;
}
function suGetRecentChipMetrics(kind, width){
  const dk = suGetDeviceKey(width);
  if(kind === 'playerRecent'){
    const raw = suReadNumberSetting(`su_pd_badge_scale_${dk}`, suReadNumberSetting('su_pd_badge_scale', 1));
    const scale = suClamp(raw, dk === 'mb' ? 0.55 : (dk === 'tb' ? 0.60 : 0.70), dk === 'mb' ? 1.20 : (dk === 'tb' ? 1.25 : 1.30));
    const base = dk === 'mb'
      ? {px:2, fs:5.1, lh:10, rr:3}
      : (dk === 'tb' ? {px:4, fs:7, lh:13, rr:4} : {px:5, fs:8, lh:14, rr:3});
    return { deviceKey: dk, scale, base };
  }
  if(kind === 'univRecent'){
    const raw = suReadNumberSetting(`su_univ_recent_chip_scale_${dk}`, 1);
    const scale = suClamp(raw, dk === 'mb' ? 0.60 : (dk === 'tb' ? 0.65 : 0.70), dk === 'mb' ? 1.20 : (dk === 'tb' ? 1.25 : 1.30));
    const base = dk === 'mb'
      ? {date:10, chipFs:6.8, chipPx:3, chipH:12, chipR:4}
      : (dk === 'tb' ? {date:11, chipFs:8.4, chipPx:5, chipH:15, chipR:5} : {date:12, chipFs:10, chipPx:7, chipH:18, chipR:5});
    return { deviceKey: dk, scale, base };
  }
  return { deviceKey: dk, scale: 1, base: {} };
}
try{
  window.suGetDeviceKey = suGetDeviceKey;
  window.suReadImgSettings = suReadImgSettings;
  window.suNormalizeImgSettings = suNormalizeImgSettings;
  window.suBuildBoard2ImgSettingsFromProfile = suBuildBoard2ImgSettingsFromProfile;
  window.suGetRecentChipMetrics = suGetRecentChipMetrics;
}catch(e){}

/* ══════════════════════════════════════
   대학별 로고 크기(대학상세/스트리머탭)
   - univCfg에 대학별로 저장:
     * logoSizeDetail  (대학 상세 모달 로고 크기)
     * logoSizePlayers (스트리머탭(전체) 대학 로고 크기)
══════════════════════════════════════ */
function getUnivLogoSizeStr(univName, ctx, fallback){
  try{
    const u = (univCfg||[]).find(x=>x && x.name===univName) || null;
    if(u){
      if(ctx==='detail' && u.logoSizeDetail)  return String(parseInt(u.logoSizeDetail,10))+'px';
      if(ctx==='players' && u.logoSizePlayers) return String(parseInt(u.logoSizePlayers,10))+'px';
    }
  }catch(e){}
  return fallback;
}
try{ window.getUnivLogoSizeStr = getUnivLogoSizeStr; }catch(e){}

/* ══════════════════════════════════════
   경기 상세(팝업) 승/패 배경 강도 설정
   - 승자: 대학색 tint(투명도) 조절 (localStorage: su_md_win_tint)
   - 패자: 회색 배경 강도 조절 (localStorage: su_md_lose_gray)
══════════════════════════════════════ */
function applyMatchDetailVars(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
    const dKey = w <= 768 ? 'mb' : (w <= 1024 ? 'tb' : 'pc');
    const getPxByDevice = (baseKey, legacyKey, def, min, max)=>{
      const raw = localStorage.getItem(`${baseKey}_${dKey}`);
      const legacy = localStorage.getItem(legacyKey);
      const n = parseInt((raw ?? legacy ?? String(def)), 10);
      return Math.max(min, Math.min(max, isNaN(n) ? def : n));
    };
    const losePct = parseInt(localStorage.getItem('su_md_lose_gray') || '12', 10);
    const lp = Math.max(0, Math.min(30, isNaN(losePct) ? 12 : losePct));
    document.documentElement.style.setProperty('--su_md_lose_gray', String(lp/100));

    // 상단 대학 로고(대학 카드) 크기
    const ls = getPxByDevice('su_md_logo_size', 'su_md_logo_size', 42, 28, 64);
    document.documentElement.style.setProperty('--su_md_logo_size', ls + 'px');

    // 상단 대학 카드 정렬/폰트
    const align = (localStorage.getItem('su_md_head_align') || 'center').trim();
    const justify =
      align === 'left' ? 'flex-start' :
      align === 'right' ? 'flex-end' : 'center';
    const textAlign =
      align === 'left' ? 'left' :
      align === 'right' ? 'right' : 'center';
    const tf = getPxByDevice('su_md_team_font', 'su_md_team_font', 16, 11, 26);
    const ttf = getPxByDevice('su_md_title_font', 'su_md_title_font', 15, 12, 24);
    const sf = getPxByDevice('su_md_sub_font', 'su_md_sub_font', 11, 10, 18);
    document.documentElement.style.setProperty('--su_md_head_justify', justify);
    document.documentElement.style.setProperty('--su_md_head_text_align', textAlign);
    document.documentElement.style.setProperty('--su_md_team_font', tf + 'px');
    document.documentElement.style.setProperty('--su_md_title_font', ttf + 'px');
    document.documentElement.style.setProperty('--su_md_sub_font', sf + 'px');

    // ── 헤더 애니메이션/효과 설정 ──
    const fxOn = (localStorage.getItem('su_md_fx_on') ?? '1') !== '0';
    const fxPreset = (localStorage.getItem('su_md_fx_preset') || 'classic').trim(); // classic|aurora|sunset|minimal
    const fxAnim = (localStorage.getItem('su_md_fx_anim') || 'both').trim(); // both|wave|shimmer|pulse|glint
    const fxSpeedMul = parseFloat(localStorage.getItem('su_md_fx_speed_mul') || '1');
    const sm = isNaN(fxSpeedMul) ? 1 : Math.max(0.5, Math.min(2.2, fxSpeedMul));
    const fxIntPct = parseInt(localStorage.getItem('su_md_fx_int') || '100', 10);
    const ip = Math.max(0, Math.min(150, isNaN(fxIntPct) ? 100 : fxIntPct)) / 100;

    // 기본값 (파랑)
    let headC1='#1e3a8a', headC2='#2563eb';
    let scoreC1='rgba(2,132,199,.09)', scoreC2='rgba(2,132,199,.02)';
    if(fxPreset==='aurora'){
      headC1='#4c1d95'; headC2='#0ea5e9';
      scoreC1='rgba(139,92,246,.10)'; scoreC2='rgba(14,165,233,.03)';
    }else if(fxPreset==='sunset'){
      headC1='#9f1239'; headC2='#f97316';
      scoreC1='rgba(244,63,94,.10)'; scoreC2='rgba(249,115,22,.03)';
    }else if(fxPreset==='minimal'){
      headC1='#0f172a'; headC2='#334155';
      scoreC1='rgba(148,163,184,.08)'; scoreC2='rgba(148,163,184,.02)';
    }

    // 애니메이션 이름 결정 (CSS 변수로 제어)
    let scoreAnim = 'cmdScoreWave';
    let scoreSparkleAnim = 'cmdScoreSparkle';
    let shimmerAnim = 'cmdTeamShimmer';
    if(fxAnim==='pulse'){
      scoreAnim = 'cmdScoreWave';
      scoreSparkleAnim = 'cmdScorePulse';
      shimmerAnim = 'cmdTeamPulse';
    }else if(fxAnim==='glint'){
      scoreAnim = 'cmdScoreWave';
      scoreSparkleAnim = 'cmdScoreSparkle';
      shimmerAnim = 'cmdTeamGlint';
    }else if(fxAnim==='wave'){
      scoreAnim = 'cmdScoreWave';
      scoreSparkleAnim = 'cmdScoreSparkle';
      shimmerAnim = 'none';
    }else if(fxAnim==='shimmer'){
      scoreAnim = 'none';
      scoreSparkleAnim = 'none';
      shimmerAnim = 'cmdTeamShimmer';
    }else{ // both
      scoreAnim = 'cmdScoreWave';
      scoreSparkleAnim = 'cmdScoreSparkle';
      shimmerAnim = 'cmdTeamShimmer';
    }

    if(!fxOn){
      scoreAnim = 'none';
      scoreSparkleAnim = 'none';
      shimmerAnim = 'none';
    }

    document.documentElement.style.setProperty('--su_md_fx_speed_mul', String(sm));
    document.documentElement.style.setProperty('--su_md_fx_int', String(ip));
    document.documentElement.style.setProperty('--su_md_fx_head_c1', headC1);
    document.documentElement.style.setProperty('--su_md_fx_head_c2', headC2);
    document.documentElement.style.setProperty('--su_md_fx_score_c1', scoreC1);
    document.documentElement.style.setProperty('--su_md_fx_score_c2', scoreC2);
    document.documentElement.style.setProperty('--su_md_fx_score_anim', scoreAnim);
    document.documentElement.style.setProperty('--su_md_fx_score_sparkle_anim', scoreSparkleAnim);
    document.documentElement.style.setProperty('--su_md_fx_shimmer_anim', shimmerAnim);
  }catch(e){
    console.warn('[applyMatchDetailVars] CSS 변수 설정 실패:', e.message);
  }
}
function _getMdDeviceKey(){
  const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
  return w <= 768 ? 'mb' : (w <= 1024 ? 'tb' : 'pc');
}
function getMatchDetailAvatarSetting(kind){
  try{
    const dk = _getMdDeviceKey();
    if(kind === 'fit'){
      const v = localStorage.getItem(`su_md_avatar_fit_${dk}`) || localStorage.getItem('su_md_avatar_fit') || 'cover';
      return ['cover','contain'].includes(String(v).trim()) ? String(v).trim() : 'cover';
    }
    const raw = localStorage.getItem(`su_md_avatar_scale_${dk}`) || localStorage.getItem('su_md_avatar_scale') || '100';
    const n = parseInt(raw, 10);
    return Math.max(80, Math.min(200, isNaN(n) ? 100 : n));
  }catch(e){
    return kind === 'fit' ? 'cover' : 100;
  }
}

// (추가) 2:2 팀전(2명 vs 2명)도 개인 ELO/승패에 반영
// - teamA/teamB: ["영희","철수"] 형태의 선수명 배열
// - winnerSide: 'A' 또는 'B' (A팀 승 / B팀 승)
// - 개별 전적은 "상대팀(콤마)"를 opp로 기록 (예: "민수,영지수")
function applyTeamGameResult(teamA, teamB, winnerSide, date, map, matchId, mode, opts){
  try{
    const _opts = opts || {};
    const _normMember = (x, sideUniv) => {
      if(x && typeof x === 'object'){
        const name = String(x.name||'').trim();
        if(!name) return null;
        return { name, univ: String(x.univ || sideUniv || '').trim() };
      }
      const name = String(x||'').trim();
      if(!name) return null;
      return { name, univ: String(sideUniv||'').trim() };
    };
    const AMembers = Array.isArray(teamA) ? teamA.map(x=>_normMember(x, _opts.sideUnivA)).filter(Boolean) : [];
    const BMembers = Array.isArray(teamB) ? teamB.map(x=>_normMember(x, _opts.sideUnivB)).filter(Boolean) : [];
    const A = AMembers.map(x=>x.name);
    const B = BMembers.map(x=>x.name);
    if(A.length < 2 || B.length < 2) return;
    const _find = (name) => players.find(x=>x.name===name) || null;
    const pA = A.map(_find).filter(Boolean);
    const pB = B.map(_find).filter(Boolean);
    if(pA.length < 2 || pB.length < 2) return;

    const d = date || new Date().toISOString().slice(0,10);
    const m = map || '-';
    const mid = String(matchId||'').trim();
    const oppA = B.join(',');
    const oppB = A.join(',');
    const univMapA = new Map(AMembers.map(x=>[x.name, x.univ]));
    const univMapB = new Map(BMembers.map(x=>[x.name, x.univ]));

    // 중복 방지: 각 선수 history에 동일 matchId 있으면 중단
    const hasDup = (p) => !!(mid && (p.history||[]).some(h => h.matchId === mid));
    if(pA.some(hasDup) || pB.some(hasDup)) return;

    // 팀 ELO는 평균으로 계산 (단순)
    const avg = (arr) => arr.reduce((s,x)=>s+(x.elo||ELO_DEFAULT),0) / (arr.length||1);
    const eloA = avg(pA);
    const eloB = avg(pB);
    const aWin = (winnerSide === 'A');
    const wElo = aWin ? eloA : eloB;
    const lElo = aWin ? eloB : eloA;
    const delta = calcElo(wElo, lElo);
    const t = Date.now();

    const applyOne = (p, isWin, oppStr, sideMap) => {
      if(!p.history) p.history=[];
      if(isWin){ p.win++; p.points+=3; }
      else { p.loss++; p.points-=3; }
      const cur = p.elo || ELO_DEFAULT;
      p.elo = cur + (isWin ? delta : -delta);
      p.history.unshift({
        date:d,time:t,
        result:isWin?'승':'패',
        opp:oppStr, oppRace:'',
        map:m, matchId:mid,
        eloDelta: isWin ? delta : -delta,
        eloAfter: p.elo,
        univ: (sideMap && sideMap.get(p.name)) || p.univ || '',
        mode: mode||'',
        _team:true
      });
    };

    pA.forEach(p => applyOne(p, aWin, oppA, univMapA));
    pB.forEach(p => applyOne(p, !aWin, oppB, univMapB));
  }catch(e){}
}
try{ applyMatchDetailVars(); }catch(e){
  console.warn('[applyMatchDetailVars 초기화] 실패:', e.message);
}
try{
  if(!window.__suMatchDetailVarsResizeBound){
    window.__suMatchDetailVarsResizeBound = true;
    window.addEventListener('resize', ()=>{ try{ applyMatchDetailVars(); }catch(e){}; }, {passive:true});
  }
}catch(e){}

function _hexToRgbObj(hex){
  const h=String(hex||'').replace('#','').trim();
  if(h.length===3){
    const r=parseInt(h[0]+h[0],16), g=parseInt(h[1]+h[1],16), b=parseInt(h[2]+h[2],16);
    return {r:isNaN(r)?100:r, g:isNaN(g)?116:g, b:isNaN(b)?139:b};
  }
  if(h.length>=6){
    const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    return {r:isNaN(r)?100:r, g:isNaN(g)?116:g, b:isNaN(b)?139:b};
  }
  return {r:100,g:116,b:139};
}
function getMatchWinTint(hex){
  try{
    const pct = parseInt(localStorage.getItem('su_md_win_tint') || '13', 10);
    const p = Math.max(0, Math.min(30, isNaN(pct) ? 13 : pct));
    const a = p/100;
    const {r,g,b}=_hexToRgbObj(hex);
    return `rgba(${r},${g},${b},${a})`;
  }catch(e){
    // fallback: 기존 0x22(약 13%)
    return String(hex||'#64748b') + '22';
  }
}
function escJS(s){
  return String(s??'')
    .replace(/\\/g,'\\\\')
    .replace(/'/g,"\\'")
    .replace(/\r/g,'\\r')
    .replace(/\n/g,'\\n');
}
function escAttr(s){
  return String(s??'')
    .replace(/&/g,'&amp;')
    .replace(/"/g,'&quot;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function getTierBadge(tier){
  if(!tier) return '';
  const ic=(_TIER_ICON&&_TIER_ICON[tier])||'';
  const bg=getTierBtnColor(tier)||'#64748b';
  const col=getTierBtnTextColor(tier)||'#fff';
  // 현황판과 동일한 그라디언트 스타일 (box-shadow 포함)
  const shadowMap={
    'G':'0 2px 14px rgba(124,58,237,.55),0 0 0 1px rgba(167,139,250,.3)',
    'K':'0 2px 10px rgba(26,42,82,.5),0 0 0 1px rgba(226,201,126,.2)',
    'JA':'0 2px 10px rgba(12,74,92,.5)',
    'J':'0 2px 10px rgba(6,78,59,.5)',
    'S':'0 2px 10px rgba(30,58,95,.5)',
  };
  const shadow=shadowMap[tier]||'0 1px 5px rgba(0,0,0,.25)';
  return `<span class="tbadge" style="background:${bg};color:${col};box-shadow:${shadow};border-radius:6px;padding:3px 8px;font-size:11px;font-weight:800;letter-spacing:.3px;white-space:nowrap;display:inline-flex;align-items:center;gap:3px">${ic?ic+' ':''}${tier}</span>`;
}

function getTierLabel(tier){
  const icons=_TIER_ICON||{G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠',유스:'🐣',미정:'❓'};
  const labels={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스',미정:'미정 (미확인)'};
  const ic=icons[tier]||'';
  return ic?`${ic} ${labels[tier]||tier}`:tier;
}

function getTierPillLabel(tier){
  const icons=_TIER_ICON||{G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠️',유스:'🐣',미정:'❓'};
  const labels={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스',미정:'미정 (미확인)'};
  return icons[tier]?`${icons[tier]} ${labels[tier]||tier}`:tier;
}

// ── (설정) 티어 색상/이모지 커스텀 ──
const _TIER_THEME_KEY = 'su_tier_theme_v1';
const _TIER_DEFAULT_BG = {
  'G':'#5b21b6','K':'#1e3a8a','JA':'#0e6280','J':'#065f46','S':'#2952a3',
  '0티어':'#1d4ed8','1티어':'#2558d0','2티어':'#3268d8','3티어':'#4a7ee8',
  '4티어':'#6092f4','5티어':'#74a4f4','6티어':'#86b2ec','7티어':'#98bee4','8티어':'#a8c8dc',
  '유스':'#b45309','미정':'#94a3b8'
};
const _TIER_DEFAULT_TEXT = {
  '4티어':'#1a3a8a','5티어':'#1a3a8a','6티어':'#1d4ed8','7티어':'#1a4070','8티어':'#1a4070','미정':'#fff'
};
const _TIER_DEFAULT_ICON = {G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠',유스:'🐣',미정:'❓'};

let _TIER_BG = {..._TIER_DEFAULT_BG};      // base
let _TIER_TEXT = {..._TIER_DEFAULT_TEXT}; // base (optional overrides)
let _TIER_ICON = {..._TIER_DEFAULT_ICON};
let _TIER_SAT = 1.0; // 0.5~1.6
let _TIER_BRI = 1.0; // 0.6~1.6 (lightness multiplier)

function _clamp01(x){ return Math.max(0, Math.min(1, x)); }
function _rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if(max!==min){
    const d=max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=(g-b)/d + (g<b?6:0); break;
      case g: h=(b-r)/d + 2; break;
      case b: h=(r-g)/d + 4; break;
    }
    h/=6;
  }
  return {h,s,l};
}
function _hslToRgb(h,s,l){
  const hue2rgb=(p,q,t)=>{
    if(t<0) t+=1; if(t>1) t-=1;
    if(t<1/6) return p+(q-p)*6*t;
    if(t<1/2) return q;
    if(t<2/3) return p+(q-p)*(2/3-t)*6;
    return p;
  };
  let r,g,b;
  if(s===0){ r=g=b=l; }
  else{
    const q = l<0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l-q;
    r=hue2rgb(p,q,h+1/3);
    g=hue2rgb(p,q,h);
    b=hue2rgb(p,q,h-1/3);
  }
  return {r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255)};
}
function _rgbToHex(r,g,b){
  const to=(n)=>String(n.toString(16)).padStart(2,'0');
  return `#${to(Math.max(0,Math.min(255,r)))}${to(Math.max(0,Math.min(255,g)))}${to(Math.max(0,Math.min(255,b)))}`;
}
function _hexToRgb(hex){
  const {r,g,b}=_hexToRgbObj(hex);
  return {r,g,b};
}
function _tierFiltered(hex){
  try{
    const {r,g,b}=_hexToRgb(hex);
    const hsl=_rgbToHsl(r,g,b);
    const s=_clamp01(hsl.s * (isNaN(_TIER_SAT)?1:_TIER_SAT));
    const l=_clamp01(hsl.l * (isNaN(_TIER_BRI)?1:_TIER_BRI));
    const rgb=_hslToRgb(hsl.h, s, l);
    return _rgbToHex(rgb.r, rgb.g, rgb.b);
  }catch(e){
    return hex||'#64748b';
  }
}
function _autoTextColor(bgHex){
  try{
    const {r,g,b}=_hexToRgb(bgHex);
    // relative luminance
    const lum = (0.2126*r + 0.7152*g + 0.0722*b)/255;
    return lum > 0.62 ? '#0f172a' : '#ffffff';
  }catch(e){ return '#fff'; }
}

function getTierBtnColor(tier){
  const base = _TIER_BG[tier] || '#64748b';
  return _tierFiltered(base);
}
function getTierBtnTextColor(tier){
  const base = _TIER_TEXT[tier];
  if(base) return base;
  return _autoTextColor(getTierBtnColor(tier));
}

function getTierTheme(){
  return {
    bg: {..._TIER_BG},
    text: {..._TIER_TEXT},
    icon: {..._TIER_ICON},
    sat: _TIER_SAT,
    bri: _TIER_BRI
  };
}
function setTierTheme(patch){
  try{
    const cur=getTierTheme();
    const next={
      ...cur,
      ...patch,
      bg: {...cur.bg, ...(patch?.bg||{})},
      text: {...cur.text, ...(patch?.text||{})},
      icon: {...cur.icon, ...(patch?.icon||{})}
    };
    _TIER_BG = {..._TIER_DEFAULT_BG, ...next.bg};
    _TIER_TEXT = {..._TIER_DEFAULT_TEXT, ...next.text};
    _TIER_ICON = {..._TIER_DEFAULT_ICON, ...next.icon};
    _TIER_SAT = Math.max(0.5, Math.min(1.6, parseFloat(next.sat)||1));
    _TIER_BRI = Math.max(0.6, Math.min(1.6, parseFloat(next.bri)||1));
    localStorage.setItem(_TIER_THEME_KEY, JSON.stringify({
      bg:_TIER_BG, text:_TIER_TEXT, icon:_TIER_ICON, sat:_TIER_SAT, bri:_TIER_BRI
    }));
  }catch(e){}
}
function resetTierTheme(){
  try{
    localStorage.removeItem(_TIER_THEME_KEY);
    _TIER_BG = {..._TIER_DEFAULT_BG};
    _TIER_TEXT = {..._TIER_DEFAULT_TEXT};
    _TIER_ICON = {..._TIER_DEFAULT_ICON};
    _TIER_SAT = 1.0;
    _TIER_BRI = 1.0;
  }catch(e){}
}
// init
try{
  const raw = localStorage.getItem(_TIER_THEME_KEY);
  if(raw){
    const obj = JSON.parse(raw)||{};
    setTierTheme(obj);
  }
}catch(e){}
// expose for settings
window.getTierTheme = getTierTheme;
window.setTierTheme = setTierTheme;
window.resetTierTheme = resetTierTheme;

/* ══════════════════════════════════════
   직책 시스템
   - MAIN_ROLES: 정렬 순서에 영향, 표시+정렬
   - SUB_ROLES: 표시만 (학생회장, 오락부장 등)
══════════════════════════════════════ */
const MAIN_ROLES = ['이사장','동아리 회장','총장','부총장','총괄','교수','코치','대표'];
const ROLE_ICONS = {'이사장':'👔','동아리 회장':'🏅','총장':'🎓','부총장':'📚','총괄':'🏛️','교수':'🏫','코치':'🎯','대표':'👥'};
const ROLE_COLORS = {'이사장':'#6d28d9','동아리 회장':'#0f766e','총장':'#b91c1c','부총장':'#b45309','총괄':'#0c6e9e','교수':'#1d4ed8','코치':'#0e7490','대표':'#8b5cf6'};

function getRoleOrder(role){
  // Representative=0, President=0, Captain=0, Club President=0, Class President=0, Dean=1, Vice Dean=2, Director=2(tie), Professor=3, Coach=4, Other=99
  const ORDER = {'대표':0,'이사장':0,'선장':0,'동아리장':0,'동아리 회장':0,'반장':0,'총장':1,'부총장':2,'총괄':2,'교수':3,'코치':4};
  if(!role) return 99;
  return role in ORDER ? ORDER[role] : 99;
}
function getRoleBadgeHTML(role, size='11px'){
  if(!role) return '';
  const icon = ROLE_ICONS[role]||'🏷️';
  const col = ROLE_COLORS[role]||'#6b7280';
  // MAIN_ROLES는 진한 배경색, 그 외는 연한 배경
  const isMain = MAIN_ROLES.includes(role);
  if(isMain){
    return `<span style="font-size:${size};padding:2px 7px;border-radius:5px;background:${col};color:#fff;font-weight:800;white-space:nowrap;flex-shrink:0;letter-spacing:.3px;text-shadow:0 1px 2px rgba(0,0,0,.2)">${icon} ${role}</span>`;
  }
  return `<span style="font-size:${size};padding:1px 6px;border-radius:4px;background:${col}20;color:${col};border:1px solid ${col}44;font-weight:700;white-space:nowrap;flex-shrink:0">${icon} ${role}</span>`;
}

/* ══════════════════════════════════════
   DATA LOAD
══════════════════════════════════════ */
function J(k){
  try{
    const v=localStorage.getItem(k);
    if(!v)return null;
    // LZ-String 압축 여부 자동 감지: 압축된 데이터는 JSON으로 파싱 불가
    if(typeof LZString!=='undefined'){
      try{return JSON.parse(v);}catch{
        const d=LZString.decompressFromUTF16(v);
        return d?JSON.parse(d):null;
      }
    }
    return JSON.parse(v);
  }catch{return null;}
}
function _lsSave(k,obj){
  const s=JSON.stringify(obj);
  if(typeof LZString!=='undefined'){
    localStorage.setItem(k,LZString.compressToUTF16(s));
  }else{
    localStorage.setItem(k,s);
  }
}

// (복구/호환) su_p가 {v:2,p:[...],d:{...}} 형태여도 정상 동작하도록 unpack
function _unpackPlayers(raw){
  try{
    if(!raw) return [];
    if(Array.isArray(raw)) return raw;
    if(typeof raw!=='object') return [];
    if(raw.v!==2 || !Array.isArray(raw.p) || !raw.d) return [];
    const d=raw.d||{};
    const res=d.res||[], opp=d.opp||[], race=d.race||[], map=d.map||[], univ=d.univ||[], mode=d.mode||[];
    const get=(arr,i)=> (i==null||i<0)?'':(arr[i]||'');
    return raw.p.map(pp=>{
      const p={...pp};
      const hp=Array.isArray(p.h)?p.h:[];
      p.history = hp.map(r=>({
        date: r[0]||'',
        time: r[1]||0,
        result: get(res, r[2]),
        opp: get(opp, r[3]),
        oppRace: get(race, r[4]),
        map: get(map, r[5]),
        matchId: r[6]||'',
        eloDelta: (r[7]===undefined?null:r[7]),
        univ: get(univ, r[8]),
        mode: get(mode, r[9]),
        score: r[10]||'',
        ...(r[11]?{_team:true}:{})
      }));
      delete p.h;
      return p;
    });
  }catch(e){
    return [];
  }
}
function _stripPlayerHistoryForSave(player){
  const c={...(player||{})};
  delete c.history;
  return c;
}

let playersRaw = J('su_p')  || [];
const _playerStoreMeta = J('su_player_store_meta_v1') || {};
const _playerLegacyLoadEnabled = !_playerStoreMeta.migrated || _playerStoreMeta.backend==='localStorage' || !window.indexedDB;
if(!_playerLegacyLoadEnabled) playersRaw = [];
let players    = _unpackPlayers(playersRaw) || [];
// 사진 분리 저장 지원: su_pp에 {이름:base64} 형태로 저장된 사진을 players에 병합
(function(){ if(!_playerLegacyLoadEnabled) return; const _pp=J('su_pp');if(_pp&&typeof _pp==='object'&&Array.isArray(players))players.forEach(p=>{if(!p.photo&&_pp[p.name])p.photo=_pp[p.name];});})();
try{ window.players = players; }catch(e){}
try{ window.playerPhotos = _playerLegacyLoadEnabled ? (J('su_pp') || {}) : {}; }catch(e){}
let boardOrder = J('su_boardOrder') || []; // 현황판 대학 순서
let univCfg    = J('su_u')  || [{name:'흑카데미',color:'#1e3a8a'},{name:'JSA',color:'#c2410c'},{name:'늪지대',color:'#15803d'},{name:'무소속',color:'#6b7280'}];
let maps       = J('su_m')  || ['투혼','서킷','블리츠','신 개마고원'];
let userMapAlias = J('su_mAlias') || {};   // 사용자 정의 맵 약자 { '약자': '전체이름' }
let tourD      = J('su_t')  || Array(15).fill('');
const _matchStoreMeta = J('su_match_store_meta_v1') || {};
const _matchLegacyLoadEnabled = !_matchStoreMeta.migrated || _matchStoreMeta.backend==='localStorage' || !window.indexedDB;
let miniM      = _matchLegacyLoadEnabled ? (J('su_mm') || []) : [];
let univM      = _matchLegacyLoadEnabled ? (J('su_um') || []) : [];
let comps      = _matchLegacyLoadEnabled ? (J('su_cm') || []) : [];
let ckM        = _matchLegacyLoadEnabled ? (J('su_ck') || []) : [];
let compNames  = J('su_cn') || [];
let curComp    = J('su_cc') || '';
// 프로리그 데이터
let proM       = _matchLegacyLoadEnabled ? (J('su_pro') || []) : [];
// 프로리그 개인 대회: [{id,name,groups:[{name,players:[],matches:[{a,b,winner,d,map}]}]}]
let proTourneys = _matchLegacyLoadEnabled ? (J('su_ptn') || []) : [];
let curProComp  = J('su_ptc') || '';
// 대회 조편성: [{id,name,groups:[{name,univs:[],matches:[{a,b,sa,sb,sets:[]}]}]}]
let tourneys   = _matchLegacyLoadEnabled ? (J('su_tn') || []) : [];
let ttM        = _matchLegacyLoadEnabled ? (J('su_ttm') || []) : [];
let _ttCurComp = J('su_ttcur') || '';
let _ttSub     = 'records';
let indM       = _matchLegacyLoadEnabled ? (J('su_indm') || []) : [];
let gjM        = _matchLegacyLoadEnabled ? (J('su_gjm')  || []) : [];
let notices    = J('su_notices') || [];
// (요청사항) 보라크루 기능 삭제: 기존 저장 키 정리
try{ localStorage.removeItem('su_crew'); localStorage.removeItem('su_crewcfg'); }catch(e){}

let BLD = {};
let openDetails = {};
let tierRankModeFilter = '전체';

// ── 선수별 상태 아이콘 시스템 ──────────────────────────────
const _ICON_META_KEY = 'su_icon_store_meta_v1';
const _ICON_META = J(_ICON_META_KEY) || {};
const _ICON_LEGACY_LOAD_ENABLED = !_ICON_META.migrated || _ICON_META.backend==='localStorage' || !window.indexedDB;
let playerStatusIcons = _ICON_LEGACY_LOAD_ENABLED ? (J('su_psi') || {}) : {};
let playerStatusExpiry = _ICON_LEGACY_LOAD_ENABLED ? (J('su_psi_expiry') || {}) : {};
const STATUS_ICON_DEFS = {
  none:    { label: '없음',     emoji: '' },
  fire:    { label: '🔥 불',    emoji: '🔥' },
  water:   { label: '💧 물',    emoji: '💧' },
  cloud:   { label: '☁️ 구름',  emoji: '☁️' },
  ice:     { label: '🧊 얼음',  emoji: '🧊' },
  up:      { label: '⬆️ 상승',  emoji: '⬆️' },
  down:    { label: '⬇️ 하락',  emoji: '⬇️' },
  lightning:{ label: '⚡ 벼락', emoji: '⚡' },
  chick:   { label: '🐣 병아리', emoji: '🐣' },
  tiger:   { label: '🐯 호랑이', emoji: '🐯' },
  lion:    { label: '🦁 사자',  emoji: '🦁' },
  cloudy:  { label: '🌥️ 흐림',  emoji: '🌥️' },
  smile:   { label: '😊 웃음',  emoji: '😊' },
  cry:     { label: '😭 울음',  emoji: '😭' },
  blank:   { label: '😐 생각없음', emoji: '😐' },
  sad:     { label: '😢 슬픔',  emoji: '😢' },
  sob:     { label: '😩 통곡',  emoji: '😩' },
  cool:    { label: '😎 COOL',  emoji: '😎' },
  star2:   { label: '⭐ 스타',  emoji: '⭐' },
  crown:   { label: '👑 왕관',  emoji: '👑' },
  hot2:    { label: '🥵 핫',    emoji: '🥵' },
  star3:   { label: '🌟 빛나는별',emoji: '🌟' },
  new2:    { label: '🆕 NEW',   emoji: '🆕' },
  trophy:  { label: '🏆 트로피', emoji: '🏆' },
  diamond: { label: '💎 다이아', emoji: '💎' },
  skull:   { label: '💀 해골',  emoji: '💀' },
  muscle:  { label: '💪 강함',  emoji: '💪' },
  think:   { label: '🤔 생각중',emoji: '🤔' },
  sleep:   { label: '😴 수면',  emoji: '😴' },
  boom:    { label: '🤯 폭발',  emoji: '🤯' },
  cold:    { label: '🥶 추움',  emoji: '🥶' },
  party:   { label: '🎉 파티',  emoji: '🎉' },
  dizzy:   { label: '💫 어지러움',emoji:'💫' },
  clown:   { label: '🤡 광대',  emoji: '🤡' },
  angry:   { label: '😤 화남',  emoji: '😤' },
  target:  { label: '🎯 집중',  emoji: '🎯' },
  ghost:   { label: '👻 유령',  emoji: '👻' },
  game:    { label: '🎮 게임',  emoji: '🎮' },
  sword:   { label: '🗡️ 검',    emoji: '🗡️' },
  gold:    { label: '🥇 금메달',emoji: '🥇' },
  princess:{ label: '👸 공주',  emoji: '👸' },
  sprout:  { label: '🌱 새싹',  emoji: '🌱' },
  chick:   { label: '🐥 병아리',emoji: '🐥' },
};
// ── 커스텀 URL 아이콘 ──
let _customStatusIcons = _ICON_LEGACY_LOAD_ENABLED ? (J('su_si_customs') || []) : [];
function _rebuildCustomStatusDefs(){
  Object.keys(STATUS_ICON_DEFS).filter(k=>k.startsWith('_c')).forEach(k=>delete STATUS_ICON_DEFS[k]);
  _customStatusIcons.forEach((c,i)=>{ STATUS_ICON_DEFS['_c'+i]={label:c.label||'커스텀'+(i+1),emoji:c.emoji}; });
}
_rebuildCustomStatusDefs();
function _iconDefaultState(){
  return {playerStatusIcons:{}, playerStatusExpiry:{}, customStatusIcons:[]};
}
function _iconNormalizeState(v){
  const s=v||{};
  return {
    playerStatusIcons:(s.playerStatusIcons && typeof s.playerStatusIcons==='object' && !Array.isArray(s.playerStatusIcons)) ? s.playerStatusIcons : {},
    playerStatusExpiry:(s.playerStatusExpiry && typeof s.playerStatusExpiry==='object' && !Array.isArray(s.playerStatusExpiry)) ? s.playerStatusExpiry : {},
    customStatusIcons:Array.isArray(s.customStatusIcons) ? s.customStatusIcons : []
  };
}
function _iconApplyState(v){
  const s=_iconNormalizeState(v);
  playerStatusIcons = {...s.playerStatusIcons};
  playerStatusExpiry = {...s.playerStatusExpiry};
  _customStatusIcons = [...s.customStatusIcons];
  _rebuildCustomStatusDefs();
  return s;
}
function _iconLoadMeta(){
  try{ return JSON.parse(localStorage.getItem(_ICON_META_KEY)||'null')||{}; }catch(e){ return {}; }
}
function _iconSaveMeta(state){
  try{
    localStorage.setItem(_ICON_META_KEY, JSON.stringify({
      migrated: !!state?.migrated,
      backend: state?.backend || '',
      updatedAt: Date.now()
    }));
  }catch(e){}
}
function _iconLegacyLoad(){
  return _iconNormalizeState({
    playerStatusIcons:J('su_psi')||{},
    playerStatusExpiry:J('su_psi_expiry')||{},
    customStatusIcons:J('su_si_customs')||[]
  });
}
function _iconLegacySave(state){
  const s=_iconNormalizeState(state);
  try{
    _lsSave('su_psi', s.playerStatusIcons);
    _lsSave('su_psi_expiry', s.playerStatusExpiry);
    _lsSave('su_si_customs', s.customStatusIcons);
    return true;
  }catch(e){
    console.warn('[_iconLegacySave] localStorage 저장 실패:', e.message);
    return false;
  }
}
function _iconClearLegacyKeys(){
  ['su_psi','su_psi_expiry','su_si_customs'].forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });
}
function _iconIdbAvailable(){
  try{ return !!window.indexedDB; }catch(e){ return false; }
}
function _iconIdbOpen(){
  return new Promise((resolve,reject)=>{
    try{
      if(!_iconIdbAvailable()){ resolve(null); return; }
      const req = indexedDB.open('star_datacenter_icons', 2);
      req.onupgradeneeded = (ev)=>{
        const db = ev.target.result;
        if(!db.objectStoreNames.contains('icon_payloads')) db.createObjectStore('icon_payloads');
      };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('icon indexedDB open failed'));
    }catch(e){ reject(e); }
  });
}
async function _iconIdbGet(){
  const db = await _iconIdbOpen();
  if(!db) return null;
  return await new Promise((resolve,reject)=>{
    try{
      const tx = db.transaction('icon_payloads','readonly');
      const req = tx.objectStore('icon_payloads').get('main');
      req.onsuccess = ()=>resolve(_iconNormalizeState(req.result||null));
      req.onerror = ()=>reject(req.error || new Error('icon indexedDB get failed'));
    }catch(e){ reject(e); }
  });
}
async function _iconIdbSet(state){
  const db = await _iconIdbOpen();
  if(!db) return false;
  return await new Promise((resolve,reject)=>{
    try{
      const tx = db.transaction('icon_payloads','readwrite');
      tx.objectStore('icon_payloads').put(_iconNormalizeState(state), 'main');
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error || new Error('icon indexedDB put failed'));
    }catch(e){ reject(e); }
  });
}
window._iconStoreInitPromise = window._iconStoreInitPromise || null;
async function _iconInitStorage(){
  if(window._iconStoreInitPromise) return window._iconStoreInitPromise;
  window._iconStoreInitPromise = (async()=>{
    try{
      const meta=_iconLoadMeta();
      const useLegacy = !_iconIdbAvailable() || meta.backend==='localStorage' || !meta.migrated;
      if(useLegacy){
        const legacy=_iconLegacyLoad();
        _iconApplyState(legacy);
        if(_iconIdbAvailable()){
          try{
            await _iconIdbSet(legacy);
            _iconClearLegacyKeys();
            _iconSaveMeta({migrated:true, backend:'indexedDB'});
          }catch(e){
            console.warn('[_iconInitStorage] legacy -> indexedDB 이전 실패:', e.message);
            _iconSaveMeta({migrated:false, backend:'localStorage'});
          }
        }else{
          _iconSaveMeta({migrated:false, backend:'localStorage'});
        }
        try{ if(typeof render==='function') setTimeout(()=>render(),0); }catch(e){}
        return legacy;
      }
      const fromIdb = await _iconIdbGet();
      const next = fromIdb || _iconDefaultState();
      _iconApplyState(next);
      _iconSaveMeta({migrated:true, backend:'indexedDB'});
      try{ if(typeof render==='function') setTimeout(()=>render(),0); }catch(e){}
      return next;
    }catch(e){
      console.warn('[_iconInitStorage] 초기화 실패:', e.message);
      const legacy=_iconLegacyLoad();
      _iconApplyState(legacy);
      _iconSaveMeta({migrated:false, backend:'localStorage'});
      try{ if(typeof render==='function') setTimeout(()=>render(),0); }catch(e){}
      return legacy;
    }
  })();
  return window._iconStoreInitPromise;
}
function _iconSnapshot(){
  return _iconNormalizeState({playerStatusIcons, playerStatusExpiry, customStatusIcons:_customStatusIcons});
}
function _iconPersistState(){
  const snap=_iconSnapshot();
  if(!_iconIdbAvailable()){
    _iconLegacySave(snap);
    _iconSaveMeta({migrated:false, backend:'localStorage'});
    return;
  }
  Promise.resolve().then(()=>_iconIdbSet(snap)).then(()=>{
    _iconClearLegacyKeys();
    _iconSaveMeta({migrated:true, backend:'indexedDB'});
  }).catch(err=>{
    console.warn('[_iconPersistState] indexedDB 저장 실패:', err && err.message ? err.message : err);
    _iconLegacySave(snap);
    _iconSaveMeta({migrated:false, backend:'localStorage'});
  });
}
function addCustomStatusIcon(label, emoji){
  if(!emoji) return;
  _customStatusIcons.push({label:label||'커스텀',emoji});
  _rebuildCustomStatusDefs();
  _iconPersistState();
}
function removeCustomStatusIcon(idx){
  _customStatusIcons.splice(idx,1);
  _rebuildCustomStatusDefs();
  _iconPersistState();
}
function _siIsImg(v){ return typeof v==='string'&&(v.startsWith('http')||v.startsWith('data:')); }
function _siRender(emoji, size){ size=size||'16px'; if(!emoji)return''; if(_siIsImg(emoji))return`<img src="${emoji}" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`; return emoji; }

// (혼합 콘텐츠 방지) http:// 이미지를 https://로 자동 보정 (가능한 경우)
function toHttpsUrl(u){
  const s = String(u||'');
  return s.startsWith('http://') ? ('https://' + s.slice('http://'.length)) : s;
}
function getStatusIcon(name){
  const expiry = playerStatusExpiry[name];
  if(expiry && expiry < new Date().toISOString().slice(0,10)){
    delete playerStatusIcons[name];
    delete playerStatusExpiry[name];
    _iconPersistState();
    return '';
  }
  return playerStatusIcons[name]||'';
}
function setStatusIcon(name, iconId, expiryDate){
  if(!iconId||iconId==='none'){
    delete playerStatusIcons[name];
    delete playerStatusExpiry[name];
  } else {
    playerStatusIcons[name]=STATUS_ICON_DEFS[iconId]?.emoji||iconId;
    if(expiryDate) playerStatusExpiry[name]=expiryDate;
    else delete playerStatusExpiry[name];
  }
  _iconPersistState();
}
function onStatusExpiryChange(playerName){
  const expiryChk = document.getElementById('ed-icon-expiry');
  const curIcon = playerStatusIcons[playerName];
  if(!curIcon) return;
  let expiryDate = null;
  if(expiryChk && expiryChk.checked){
    const d = new Date(); d.setDate(d.getDate()+10);
    expiryDate = d.toISOString().slice(0,10);
  }
  if(expiryDate) playerStatusExpiry[playerName] = expiryDate;
  else delete playerStatusExpiry[playerName];
  _iconPersistState();
  const lbl = document.getElementById('ed-icon-label');
  if(lbl){
    const found = Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===curIcon);
    const expTxt = expiryDate ? ` (${expiryDate} 만료)` : '';
    lbl.textContent = '선택: ' + (found ? found[1].label : '없음') + expTxt;
  }
}
function setStatusIconFromModal(btn, playerName, iconId){
  const expiryChk = document.getElementById('ed-icon-expiry');
  let expiryDate = null;
  if(expiryChk && expiryChk.checked && iconId && iconId !== 'none'){
    const d = new Date(); d.setDate(d.getDate()+10);
    expiryDate = d.toISOString().slice(0,10);
  }
  setStatusIcon(playerName, iconId, expiryDate);
  const container = btn.closest('#ed-icon-btns') || btn.parentElement;
  if(container){
    container.querySelectorAll('button[data-icon-id]').forEach(b=>{
      const sel = b.dataset.iconId === iconId;
      b.style.border = '2px solid '+(sel?'#16a34a':'var(--border)');
      b.style.background = sel?'#dcfce7':'var(--white)';
    });
  }
  const lbl = document.getElementById('ed-icon-label');
  if(lbl){
    const d=STATUS_ICON_DEFS[iconId];
    const expTxt = expiryDate ? ` (${expiryDate} 만료)` : '';
    lbl.textContent='선택: '+(d?d.label:'없음')+expTxt;
  }
  // 만료 체크박스 표시 제어
  const expiryRow = document.getElementById('ed-icon-expiry-row');
  if(expiryRow) expiryRow.style.display = (!iconId||iconId==='none') ? 'none' : 'flex';
}
function saveCustomStatusIcon(slot, emoji){
  localStorage.setItem('su_si_c'+slot, emoji);
  const k='custom'+slot;
  if(STATUS_ICON_DEFS[k]) STATUS_ICON_DEFS[k].emoji=emoji;
}
try{ _iconInitStorage(); }catch(e){}
const SU_MATCH_ID_MIGRATION_KEY = 'su_match_id_migrated_v1';
function _ensureObjId(obj, key){
  if(!obj || typeof obj !== 'object') return false;
  if(obj[key]) return false;
  obj[key] = genId();
  return true;
}
function _ensureMatchArrayIds(arr){
  let changed = false;
  (Array.isArray(arr) ? arr : []).forEach(m=>{
    if(!m || typeof m !== 'object') return;
    if(_ensureObjId(m, '_id')) changed = true;
  });
  return changed;
}
function _ensureNestedCompetitionIds(arr){
  let changed = false;
  (Array.isArray(arr) ? arr : []).forEach(m=>{
    if(!m || typeof m !== 'object') return;
    if(_ensureObjId(m, '_id')) changed = true;
  });
  return changed;
}
function _ensureTourneyIds(list){
  let changed = false;
  (Array.isArray(list) ? list : []).forEach(tn=>{
    if(!tn || typeof tn !== 'object') return;
    if(_ensureObjId(tn, 'id')) changed = true;
    const touchMatch = (m)=>{
      if(!m || typeof m !== 'object') return;
      if(_ensureObjId(m, '_id')) changed = true;
    };
    (Array.isArray(tn.groups) ? tn.groups : []).forEach(g=>{
      (Array.isArray(g && g.matches) ? g.matches : []).forEach(touchMatch);
    });
    if(Array.isArray(tn.matches)) tn.matches.forEach(touchMatch);
    if(tn.thirdPlace) touchMatch(tn.thirdPlace);
    if(tn.final) touchMatch(tn.final);
    if(Array.isArray(tn.manualMatches)) tn.manualMatches.forEach(touchMatch);
    if(tn.matchDetails && typeof tn.matchDetails === 'object'){
      Object.values(tn.matchDetails).forEach(touchMatch);
    }
  });
  return changed;
}
function _ensureLegacyMatchIdsOnce(){
  try{
    if(localStorage.getItem(SU_MATCH_ID_MIGRATION_KEY) === '1') return false;
  }catch(e){}
  let changed = false;
  changed = _ensureMatchArrayIds(miniM) || changed;
  changed = _ensureMatchArrayIds(univM) || changed;
  changed = _ensureMatchArrayIds(ckM) || changed;
  changed = _ensureMatchArrayIds(proM) || changed;
  changed = _ensureMatchArrayIds(ttM) || changed;
  changed = _ensureMatchArrayIds(indM) || changed;
  changed = _ensureMatchArrayIds(gjM) || changed;
  changed = _ensureNestedCompetitionIds(comps) || changed;
  changed = _ensureTourneyIds(tourneys) || changed;
  try{ localStorage.setItem(SU_MATCH_ID_MIGRATION_KEY, '1'); }catch(e){}
  if(changed){
    try{ localSave(); }catch(e){}
  }
  return changed;
}
function fixPoints(){
  try{ _ensureLegacyMatchIdsOnce(); }catch(e){}
  // 구 티어명 → 새 약어 마이그레이션
  const tierMap={god:'G',king:'K',jack:'JA',joker:'J',spade:'S'};
  players.forEach(p=>{
    if(!p.history)p.history=[];
    if(p.points===undefined)p.points=0;
    if(!p.win)p.win=0; if(!p.loss)p.loss=0;
    if(!p.gender || !['M','F'].includes(p.gender))p.gender='M';
    if(tierMap[p.tier])p.tier=tierMap[p.tier]; // 기존 데이터 자동 변환
  });
}

function localSave(){
  try{
    _lsSave('su_tiers',TIERS);
    // 데이터 버전 관리 - 캐시 무효화용
    _lsSave('su_data_version', DATA_VERSION || 1);
    // teamAMembers/teamBMembers에서 tier·race 제거 (표시 시 players 배열 조회)
    const _trimM=arr=>arr.map(m=>{
      if(!m.teamAMembers&&!m.teamBMembers)return m;
      const r={...m};
      if(r.teamAMembers)r.teamAMembers=r.teamAMembers.map(x=>({name:x.name,univ:x.univ}));
      if(r.teamBMembers)r.teamBMembers=r.teamBMembers.map(x=>({name:x.name,univ:x.univ}));
      return r;
    });
    _lsSave('su_u',univCfg);
    _lsSave('su_m',maps);
    _lsSave('su_mAlias',userMapAlias);
    _lsSave('su_t',tourD);
    // 경기 기록 원본은 IndexedDB 우선 저장
    _lsSave('su_cn',compNames);
    _lsSave('su_cc',curComp);
    _lsSave('su_ptc',curProComp);
    _lsSave('su_ttcur',_ttCurComp);
    if(typeof boardOrder!=='undefined') _lsSave('su_boardOrder',boardOrder);
    if(typeof boardPlayerOrder!=='undefined') _lsSave('su_bpo',boardPlayerOrder);
    try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}
    _lsSave('su_notices',notices);
    _lsSave('su_seasons',seasons);
    _lsSave('su_cal_sched',calScheduled);
    if(window.MatchStore && typeof window.MatchStore.save==='function'){
      window._lastMatchStoreSavePromise = window.MatchStore.save().catch(e=>{
        console.warn('[MatchStore.save]', e && e.message ? e.message : e);
        return false;
      });
    }else{
      window._lastMatchStoreSavePromise = Promise.resolve(true);
    }
    if(window.PlayerStore && typeof window.PlayerStore.save==='function'){
      window._lastPlayerStoreSavePromise = window.PlayerStore.save().catch(e=>{
        console.warn('[PlayerStore.save]', e && e.message ? e.message : e);
        return false;
      });
    }else{
      const _pPhotoMap={};
      const _pNoPhoto=players.map(p=>{
        const c=_stripPlayerHistoryForSave(p);
        if(p.photo){_pPhotoMap[p.name]=p.photo;delete c.photo;}
        return c;
      });
      _lsSave('su_pp',_pPhotoMap);
      _lsSave('su_p',_pNoPhoto);
      window._lastPlayerStoreSavePromise = Promise.resolve(true);
    }
    localStorage.setItem('su_last_save_time',Date.now().toString());
    if(BLD['ck'])_lsSave('su_bld_ck',{membersA:BLD['ck'].membersA||[],membersB:BLD['ck'].membersB||[]});
    if(BLD['pro'])_lsSave('su_bld_pro',{date:BLD['pro'].date||'',membersA:BLD['pro'].membersA||[],membersB:BLD['pro'].membersB||[],tierFilters:BLD['pro'].tierFilters||[],sets:BLD['pro'].sets||[]});
  }catch(e){
    if(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'){
      if(typeof showToast==='function')showToast('⚠️ 저장 공간이 부족합니다! 일부 데이터가 저장되지 않았을 수 있습니다.',5000);
      else alert('⚠️ 저장 공간이 부족합니다! 브라우저 저장소를 정리해 주세요.');
    }else{
      console.error('[localSave error]',e);
    }
  }
}

// 설정 전용 경량 저장 — 선수 기록·대전 데이터 직렬화 없음, Firebase 스킵
// 맵·약자·상태아이콘·티어·대학 설정 변경 시 사용
function saveCfg(){
  try{
    _lsSave('su_tiers',TIERS);
    _lsSave('su_u',univCfg);
    _lsSave('su_m',maps);
    _lsSave('su_mAlias',userMapAlias);
    localStorage.setItem('su_last_save_time',Date.now().toString());
    try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}

    // 설정 변경 GitHub 자동 반영은 옵션이 켜진 경우에만 수행
    try{
      const statusEl = document.getElementById('cloudStatus');
      if (typeof isLoggedIn !== 'undefined' && isLoggedIn) {
        const token = localStorage.getItem('su_gh_token') || '';
        const autoCfgRemote = (localStorage.getItem('su_cfg_remote_auto') ?? '1') === '1';
        if (token && autoCfgRemote && typeof window.fbUpdate === 'function') {
          // su_* 키 일부(큰 값/비밀 값 제외)도 함께 동기화 → 설정탭 변경이 다른 기기에 바로 적용
          const _syncLs = {};
          try{
            for(let i=0;i<localStorage.length;i++){
              const k = localStorage.key(i);
              if(!k || typeof k!=='string') continue;
              if(!k.startsWith('su_')) continue;
              if(k.startsWith('su_pp')) continue;
              if(k==='su_fb_pw' || k==='su_gh_token' || k==='su_admin_hash' || k==='su_admin_hashes') continue;
              if(k==='su_last_admin_save' || k==='su_last_save_time') continue;
              const v = localStorage.getItem(k);
              if(v==null) continue;
              if(String(v).length > 200000) continue;
              _syncLs[k] = v;
            }
          }catch(e){}

          const patch = {
            tiers: TIERS,
            univCfg,
            maps,
            userMapAlias,
            playerStatusIcons: (typeof playerStatusIcons!=='undefined' ? playerStatusIcons : {}),
            appSettings: { ls: _syncLs },
          };
          if(statusEl){ statusEl.style.color=''; statusEl.textContent='⏫ 설정 GitHub 저장 중...'; }
          window.fbUpdate(patch)
            .then(()=>{ if(statusEl){ statusEl.style.color='#16a34a'; statusEl.textContent='✅ 설정 GitHub 반영됨'; setTimeout(()=>{ if(statusEl){statusEl.textContent='';statusEl.style.color='';} }, 2500);} })
            .catch((e)=>{ if(statusEl){ statusEl.style.color='#dc2626'; statusEl.textContent='❌ 설정 GitHub 실패'; } console.error('[fbUpdate cfg]',e); });
        } else {
          // GitHub 토큰 미설정이거나 자동 반영 OFF면 로컬만 저장
          if(statusEl){
            if(!token){
              statusEl.style.color='#d97706';
              statusEl.textContent='⚠️ 로컬만 저장 (설정탭→GitHub 토큰 필요)';
              setTimeout(()=>{ if(statusEl){statusEl.textContent='';statusEl.style.color='';} }, 4000);
            }else if(!autoCfgRemote){
              statusEl.style.color='#64748b';
              statusEl.textContent='💾 로컬 저장만 수행됨 (설정 자동 GitHub 저장 OFF)';
              setTimeout(()=>{ if(statusEl){statusEl.textContent='';statusEl.style.color='';} }, 2200);
            }
          }
        }
      }
    }catch(e){}
  }catch(e){console.error('[saveCfg error]',e);}
}
// 프로필 사진만 저장 — su_pp만 갱신 (history 직렬화 없음)
function savePhotos(){
  try{
    if(window.PlayerStore && typeof window.PlayerStore.save==='function'){
      window.PlayerStore.save().catch(e=>console.warn('[PlayerStore.savePhotos]', e && e.message ? e.message : e));
    }else{
      const _ppm={};
      players.forEach(p=>{if(p.photo)_ppm[p.name]=p.photo;});
      _lsSave('su_pp',_ppm);
    }
    localStorage.setItem('su_last_save_time',Date.now().toString());
  }catch(e){console.error('[savePhotos error]',e);}
}
const _REMOTE_SAVE_DEBOUNCE_MS = 1000; // 1초 간격으로 저장 요청 취합 (즉시 동기화를 위해 감소)
let _remoteCloudSaveTimer = null;
let _remoteCloudSaveBusy = false;
function _setPendingRemoteSave(reason, failMsg, mode){
  try{
    localStorage.setItem('su_sync_pending_save', '1');
    localStorage.setItem('su_sync_pending_save_at', String(Date.now()));
    if(reason) localStorage.setItem('su_sync_pending_save_reason', String(reason));
    if(mode) localStorage.setItem('su_sync_pending_save_mode', String(mode));
    if(failMsg) localStorage.setItem('su_sync_last_fail_msg', String(failMsg));
  }catch(e){}
  try{ if(typeof window._updateSyncNetworkBadge==='function') window._updateSyncNetworkBadge(); }catch(e){}
}
function _clearPendingRemoteSave(){
  try{
    localStorage.removeItem('su_sync_pending_save');
    localStorage.removeItem('su_sync_pending_save_at');
    localStorage.removeItem('su_sync_pending_save_reason');
    localStorage.removeItem('su_sync_pending_save_mode');
    localStorage.removeItem('su_sync_last_fail_msg');
  }catch(e){}
  try{ if(typeof window._updateSyncNetworkBadge==='function') window._updateSyncNetworkBadge(); }catch(e){}
}
function _setCloudStatusMsg(msg, color){
  try{
    if(typeof window.refreshCloudSyncStatus === 'function') window.refreshCloudSyncStatus(msg, color);
    else{
      const statusEl = document.getElementById('cloudStatus');
      if(statusEl){
        statusEl.style.color = color || '';
        statusEl.textContent = msg;
      }
    }
  }catch(e){}
}
function _updateSyncNetworkBadge(){
  try{
    const el = document.getElementById('syncNetBadge');
    if(!el) return;
    const online = navigator.onLine !== false;
    const pending = localStorage.getItem('su_sync_pending_save') === '1';
    if(!online){
      el.textContent = '오프라인';
      el.style.color = '#b45309';
      el.style.borderColor = '#fbbf24';
      el.style.background = '#fffbeb';
    }else if(pending){
      el.textContent = '미전송 있음';
      el.style.color = '#b91c1c';
      el.style.borderColor = '#fca5a5';
      el.style.background = '#fef2f2';
    }else{
      el.textContent = '온라인';
      el.style.color = 'var(--text2)';
      el.style.borderColor = 'var(--border)';
      el.style.background = 'var(--surface)';
    }
    el.title = pending ? '아직 다른 기기에 반영되지 않은 저장이 있습니다' : (online ? '네트워크 연결됨' : '오프라인 상태입니다');
  }catch(e){}
}
try{ window._updateSyncNetworkBadge = _updateSyncNetworkBadge; }catch(e){}
const _MATCH_SYNC_SIG_KEYS = {
  pending: 'su_sync_pending_match_sig',
  uploaded: 'su_sync_last_uploaded_match_sig'
};
let _lastObservedMatchSyncSig = '';
function _matchSyncHash(str){
  let h = 2166136261;
  for(let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
function _buildMatchSyncSignature(){
  const _playersForSig = (Array.isArray(players)?players:[]).map(p=>_stripPlayerHistoryForSave(p));
  const payload = {
    miniM,
    univM,
    comps,
    ckM,
    proM,
    ttM,
    indM,
    gjM,
    players:_playersForSig,
    TIERS,
    univCfg,
    maps,
    userMapAlias,
    notices,
    seasons,
    calScheduled,
    boardOrder:(typeof boardOrder!=='undefined' ? boardOrder : []),
    boardPlayerOrder:(typeof boardPlayerOrder!=='undefined' ? boardPlayerOrder : []),
    tourD
  };
  const json = JSON.stringify(payload);
  return `${json.length}:${_matchSyncHash(json)}`;
}
function _primeMatchSyncSignature(force){
  try{
    const sig = _buildMatchSyncSignature();
    if(force || !_lastObservedMatchSyncSig) _lastObservedMatchSyncSig = sig;
    return sig;
  }catch(e){
    if(force) _lastObservedMatchSyncSig = '';
    return _lastObservedMatchSyncSig || '';
  }
}
try{ window._primeMatchSyncSignature = _primeMatchSyncSignature; }catch(e){}
async function _ensureRemoteSaveReady(){
  if(typeof window.fbCloudSave === 'function' && typeof window.fbSet === 'function') return true;
  try{
    if (typeof window._ensureCloudBoardLoaded === 'function') {
      await window._ensureCloudBoardLoaded();
    } else if (typeof window._loadScriptOnce === 'function') {
      await window._loadScriptOnce('js/cloud-board.js?v=20260425-01');
    }
  }catch(e){
    console.error('[save] cloud-board load fail', e);
  }
  return typeof window.fbCloudSave === 'function' && typeof window.fbSet === 'function';
}
async function _flushRemoteCloudSave(reason){
  if(_remoteCloudSaveTimer){
    clearTimeout(_remoteCloudSaveTimer);
    _remoteCloudSaveTimer = null;
  }
  if(!(typeof isLoggedIn !== 'undefined' && isLoggedIn)) return false;
  if(!localStorage.getItem('su_gh_token')){
    try{ localStorage.setItem('su_sync_last_fail_msg','GitHub 토큰 없음'); }catch(e){}
    _setCloudStatusMsg('⚠️ 로컬만 저장 (설정탭→GitHub 토큰 필요)', '#d97706');
    return false;
  }
  if(navigator.onLine === false){
    _setPendingRemoteSave(reason || 'save', '오프라인 상태', 'offline');
    _setCloudStatusMsg('📴 오프라인 상태 — 온라인 복귀 시 자동 업로드', '#d97706');
    return false;
  }
  if(_remoteCloudSaveBusy){
    _setPendingRemoteSave(reason || 'save', '', 'queued');
    return false;
  }
  _remoteCloudSaveBusy = true;
  try{
    const ready = await _ensureRemoteSaveReady();
    if(!ready){
      _setPendingRemoteSave(reason || 'save', 'GitHub 저장 모듈 미연결', 'failed');
      // 에러 메시지를 부드럽게 표시 (3초 후 사라짐)
      _setCloudStatusMsg('⚠️ GitHub 연결 확인 중...', '#d97706');
      setTimeout(() => { _setCloudStatusMsg('', ''); }, 3000);
      return false;
    }
    _setCloudStatusMsg('⏫ GitHub 저장 중...', '#2563eb');
    await window.fbCloudSave({ includeSettings:false });
    try{
      const now = Date.now();
      const uploadedSig = localStorage.getItem(_MATCH_SYNC_SIG_KEYS.pending) || _buildMatchSyncSignature();
      localStorage.setItem('su_last_save_time', String(now));
      localStorage.setItem('su_sync_last_upload_ok_at', String(now));
      localStorage.setItem(_MATCH_SYNC_SIG_KEYS.uploaded, uploadedSig);
      localStorage.removeItem(_MATCH_SYNC_SIG_KEYS.pending);
      localStorage.removeItem('su_sync_last_fail_msg');
      _primeMatchSyncSignature(true);
    }catch(e){}
    _clearPendingRemoteSave();
    _setCloudStatusMsg('✅ GitHub 저장됨', '#16a34a');
    return true;
  }catch(e){
    const errMsg = String((e&&e.message)||e||'');
    const isRateLimit = errMsg.includes('403') || errMsg.includes('rate') || errMsg.includes('limit');
    const isNetwork = errMsg.includes('network') || errMsg.includes('fetch') || errMsg.includes('timeout');
    
    if(isRateLimit){
      _setPendingRemoteSave(reason || 'save', 'GitHub API 제한', 'retry');
      _setCloudStatusMsg('⏳ GitHub API 제한 — 잠시 후 재시도', '#d97706');
    }else if(isNetwork){
      _setPendingRemoteSave(reason || 'save', '네트워크 오류', 'retry');
      _setCloudStatusMsg('📴 네트워크 불안정 — 자동 재시도 예정', '#d97706');
    }else{
      _setPendingRemoteSave(reason || 'save', errMsg, 'failed');
      _setCloudStatusMsg('⚠️ GitHub 저장 지연 — 로컬은 안전함', '#d97706');
    }
    
    console.error('[fbCloudSave]',e);
    // 5초 후 자동 재시도
    setTimeout(() => {
      if(localStorage.getItem('su_sync_pending_save') === '1'){
        _scheduleRemoteCloudSave(30000, 'retry');
      }
    }, 5000);
    return false;
  }finally{
    _remoteCloudSaveBusy = false;
    try{ _updateSyncNetworkBadge(); }catch(e){}
  }
}
function _scheduleRemoteCloudSave(delay, reason){
  try{
    if(!(typeof isLoggedIn !== 'undefined' && isLoggedIn)) return false;
    const wait = Math.max(0, parseInt(delay, 10) || 0);
    _setPendingRemoteSave(reason || 'save', '', 'queued');
    if(_remoteCloudSaveTimer){
      clearTimeout(_remoteCloudSaveTimer);
      _remoteCloudSaveTimer = null;
    }
    _setCloudStatusMsg('💾 로컬 저장됨 · GitHub 업로드 대기', '#2563eb');
    _remoteCloudSaveTimer = setTimeout(()=>{
      _remoteCloudSaveTimer = null;
      _flushRemoteCloudSave(reason || 'save').catch(e=>{
        console.error('[scheduleRemoteCloudSave]', e);
      });
    }, wait);
    try{ _updateSyncNetworkBadge(); }catch(e){}
    return true;
  }catch(e){
    console.error('[scheduleRemoteCloudSave]', e);
    return false;
  }
}
window._retryPendingRemoteSave = function(force){
  try{
    if(!(typeof isLoggedIn !== 'undefined' && isLoggedIn)) return false;
    const pending = localStorage.getItem('su_sync_pending_save') === '1';
    const pendingSig = localStorage.getItem(_MATCH_SYNC_SIG_KEYS.pending);
    if(!force && !pending && !pendingSig) return false;
    if(force){
      _flushRemoteCloudSave('retry').catch(e=>console.error('[retryPendingRemoteSave]', e));
      return true;
    }
    return _scheduleRemoteCloudSave(0, 'retry');
  }catch(e){
    console.error('[retryPendingRemoteSave]', e);
    return false;
  }
};
window.addEventListener('online', ()=>{
  _updateSyncNetworkBadge();
  _setCloudStatusMsg('🌐 온라인 복귀', '#2563eb');
  try{ if(typeof window._retryPendingRemoteSave==='function') window._retryPendingRemoteSave(); }catch(e){}
});
window.addEventListener('offline', ()=>{
  _updateSyncNetworkBadge();
  _setCloudStatusMsg('📴 오프라인 상태 — 로컬 저장만 유지', '#d97706');
});
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState === 'visible'){
    _updateSyncNetworkBadge();
  }
});
window.addEventListener('DOMContentLoaded', ()=>{
  _updateSyncNetworkBadge();
}, { once:true });
window.addEventListener('DOMContentLoaded', ()=>{
  _checkDataVersion();
}, { once:true });
window.addEventListener('DOMContentLoaded', ()=>{
  try{
    if(window.MatchStore && typeof window.MatchStore.init==='function'){
      window.MatchStore.init().then(()=>{
        try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
        try{ if(typeof render==='function') render(); }catch(e){}
      });
    }
  }catch(e){}
}, { once:true });
async function save(){
  localSave();
  try{ await (window._lastMatchStoreSavePromise || Promise.resolve(true)); }catch(e){}
  try{
    const nextSig = _buildMatchSyncSignature();
    const uploadedSig = localStorage.getItem(_MATCH_SYNC_SIG_KEYS.uploaded) || '';
    const pendingSig = localStorage.getItem(_MATCH_SYNC_SIG_KEYS.pending) || '';
    _lastObservedMatchSyncSig = nextSig;
    if(uploadedSig && uploadedSig === nextSig){
      if(pendingSig === nextSig){
        try{ localStorage.removeItem(_MATCH_SYNC_SIG_KEYS.pending); }catch(e){}
      }
      _clearPendingRemoteSave();
      _setCloudStatusMsg('💾 로컬 저장됨 (원격 반영할 변경 없음)', '#16a34a');
      return;
    }
    localStorage.setItem(_MATCH_SYNC_SIG_KEYS.pending, nextSig);
  }catch(e){}
  const scheduled = (()=>{ try{ return _scheduleRemoteCloudSave(_REMOTE_SAVE_DEBOUNCE_MS, 'save'); }catch(e){ return false; } })();
  if(!scheduled){
    try{
      if((typeof isLoggedIn !== 'undefined' && isLoggedIn) && !localStorage.getItem('su_gh_token')){
        _setCloudStatusMsg('⚠️ 로컬만 저장 (설정탭→GitHub 토큰 필요)', '#d97706');
      }else{
        _setCloudStatusMsg('💾 로컬 저장됨', '#16a34a');
      }
    }catch(e){
      _setCloudStatusMsg('💾 로컬 저장됨', '#16a34a');
    }
  }
}

let curTab='total', editName='', reMode='', reIdx=-1;
let histPage={mini:0, ck:0, univm:0, comp:0, pro:0, tiertour:0, tt:0, ind:0, gj:0, procomp:0}; // 대전기록 탭 페이지 상태
let playerHistPage=0; // 스트리머 상세 페이지 상태
const HIST_PAGE_SIZE=20;
const HIST_PAGE_SIZE_MOBILE=10;
function getHistPageSize(){return window.innerWidth<=768?HIST_PAGE_SIZE_MOBILE:HIST_PAGE_SIZE;}
const PLAYER_HIST_PAGE_SIZE=10; // REQ4: 스트리머 상세 10개 이상일 때 페이지네이션
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth(), calView=localStorage.getItem('su_cal_view')||'month';
let calTypeFilter='all';
let voteData=JSON.parse(localStorage.getItem('su_votes')||'{}');
let fUniv='전체', fTier='전체';
// (버그픽스) 티어 순위표 탭에서 대학/티어 필터 버튼이 sf()를 호출하는데,
// sf가 특정 모듈(vote.js)에만 정의되어 있으면 로딩 순서에 따라 ReferenceError가 발생할 수 있음.
// → 공용으로 window.sf를 제공 (기존 정의가 있으면 유지)
try{
  if(typeof window.sf !== 'function'){
    window.sf = function(u, t){
      try{ fUniv = u; }catch(e){ window.fUniv = u; }
      try{ fTier = t; }catch(e){ window.fTier = t; }
      try{ if(typeof render==='function') render(); }catch(e){}
    };
  }
}catch(e){}
var miniSub='input', univmSub='input', ckSub='input', indSub='input', gjSub='input', compSub='league', histSub='mini';
var miniType='mini'; // 'mini' | 'civil'
var histUniv='';
var recSortDir='desc'; // 날짜 정렬: 'desc'=최신순, 'asc'=오래된순
var vsNameA='', vsNameB=''; // 1:1 상대전적 조회

// 공통 연도/월 필터 상태
let yearOptions=[]; // 하위호환용 — buildYearMonthFilter는 getYearOptions()로 동적 계산
let filterYear='전체';
let filterMonth='전체'; // '전체' 또는 '01'~'12'

// 🆕 시즌 관리: [{id, name, from, to}] — from/to: 'YYYY-MM-DD'
let seasons = J('su_seasons') || [];
let filterSeason = '전체'; // '전체' 또는 시즌 id

// 🆕 캘린더 예정 경기 (Firebase 동기화)
let calScheduled = J('su_cal_sched') || [];
window.addEventListener('DOMContentLoaded', ()=>{
  try{ _primeMatchSyncSignature(true); }catch(e){}
}, { once:true });

// 🆕 랭킹 변동 스냅샷 (points 기준 순위)
// { playerName: rank } 형태로 저장
let _rankSnapshot = J('su_rank_snap') || {};
let _rankSnapDate = localStorage.getItem('su_rank_snap_date') || '';

// 랭킹 스냅샷 업데이트 (하루 1회)
function updateRankSnapshot() {
  const today = new Date().toISOString().slice(0,10);
  if(_rankSnapDate === today) return; // 오늘 이미 업데이트됨
  // 현재 순위 계산 (points 기준)
  const ranked = [...players]
    .filter(p => !p.retired)
    .sort((a,b) => (b.points||0)-(a.points||0) || (b.win||0)-(a.win||0));
  const snap = {};
  ranked.forEach((p,i) => { snap[p.name] = i+1; });
  localStorage.setItem('su_rank_snap', JSON.stringify(snap));
  localStorage.setItem('su_rank_snap_date', today);
  _rankSnapshot = snap;
  _rankSnapDate = today;
}

// 랭킹 변동 HTML 반환 (▲3 / ▼2 / NEW / -)
function getRankChangeBadge(playerName, currentRank) {
  const prev = _rankSnapshot[playerName];
  if(!prev) return '<span style="font-size:9px;color:#7c3aed;font-weight:700;padding:1px 4px;background:#ede9fe;border-radius:3px">NEW</span>';
  const diff = prev - currentRank; // 양수 = 상승
  if(diff === 0) return '<span style="font-size:9px;color:var(--gray-l)">-</span>';
  if(diff > 0)  return `<span style="font-size:9px;color:#16a34a;font-weight:800">▲${diff}</span>`;
  return `<span style="font-size:9px;color:#dc2626;font-weight:800">▼${Math.abs(diff)}</span>`;
}

function gc(n){const u=univCfg.find(x=>x.name===n);return u?u.color:'#6b7280';}
function _normHexColor(v,fallback){
  const s=String(v||'').trim();
  if(/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  return fallback||'#6b7280';
}
function getFixedSideColors(kind){
  const k=String(kind||'').trim();
  const defaults = {
    ck: { a:'#2563eb', b:'#6366f1' },
    pro:{ a:'#0f766e', b:'#4f46e5' },
    tt: { a:'#2563eb', b:'#dc2626' }
  };
  const base = defaults[k] || defaults.ck;
  try{
    return {
      a:_normHexColor(localStorage.getItem(`su_team_color_${k}_a`), base.a),
      b:_normHexColor(localStorage.getItem(`su_team_color_${k}_b`), base.b)
    };
  }catch(e){
    return { a:base.a, b:base.b };
  }
}
function getFixedSideColor(kind, side, fallback){
  const colors = getFixedSideColors(kind);
  if(String(side||'').toUpperCase()==='B') return _normHexColor(colors.b, fallback||colors.b);
  return _normHexColor(colors.a, fallback||colors.a);
}
// Get univ color with alpha hex suffix for row tinting
function gcHex8(n,alpha){
  const c=gc(n);
  const a=Math.round((alpha||0.06)*255).toString(16).padStart(2,'0');
  return c+a;
}
function gcHex8Hover(n,alpha){
  const c=gc(n);
  const a=Math.round((alpha||0.12)*255).toString(16).padStart(2,'0');
  return c+a;
}
// ⚠️ 대학 아이콘(로고)은 코드에 하드코딩하지 않습니다.
// - 저작권/출처 이슈가 발생할 수 있어, 로고 URL은 data.json(univCfg.icon / univCfg.img)로만 관리합니다.
const UNIV_ICONS = {};
// 기본 대학 아이콘 SVG (아이콘이 없는 대학에 사용)
const DEFAULT_UNIV_ICON_SVG=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" data-univ-icon="1" style="flex-shrink:0;opacity:0.75;vertical-align:middle"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
// 대학명 옆에 아이콘 img 태그 반환 (아이콘 없으면 기본 SVG 반환)
function gUI(n,size='1em'){
  const url=(univCfg.find(x=>x.name===n)||{}).icon || (univCfg.find(x=>x.name===n)||{}).img || '';
  if(url)return `<img src="${toHttpsUrl(url)}" alt="" data-univ-icon="1" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;margin-right:3px;border-radius:var(--su_univ_logo_radius,2px);flex-shrink:0" onerror="this.style.display='none'">`;
  // 기본 아이콘 SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" data-univ-icon="1" style="width:${size};height:${size};flex-shrink:0;opacity:0.75;vertical-align:middle;margin-right:3px"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
}
// 대학명 + 아이콘 HTML 반환 (아이콘이 좌측에 위치)
function univNameWithIcon(n,fontSize){const icon=gUI(n,fontSize||'1em');return icon+n;}
// DOM 요소 내 ubadge에 대학 아이콘 주입 (항상 좌측에, 기본 아이콘 포함)
function injectUnivIcons(container){
  if(!container)return;
  container.querySelectorAll('.ubadge').forEach(el=>{
    if(el.querySelector('[data-univ-icon]')||el.getAttribute('data-icon-done'))return;
    let name='';
    el.childNodes.forEach(node=>{if(node.nodeType===3)name+=node.textContent;});
    name=name.trim().replace(/\s+/g,' ');
    if(!name)return;
    el.setAttribute('data-icon-done','1');
    // inline-flex 레이아웃으로 정렬
    if(!el.style.display||el.style.display==='inline-block')el.style.display='inline-flex';
    el.style.alignItems='center';
    el.style.gap='3px';
    const url=(univCfg.find(x=>x.name===name)||{}).icon || (univCfg.find(x=>x.name===name)||{}).img || '';
    if(url){
      const img=document.createElement('img');
      img.src=url; img.setAttribute('data-univ-icon','1');
      img.style.cssText='width:1em;height:1em;object-fit:contain;vertical-align:middle;border-radius:var(--su_univ_logo_radius,2px);flex-shrink:0';
      img.onerror=function(){this.style.display='none';};
      el.insertBefore(img,el.firstChild);
    } else {
      // 기본 아이콘 SVG 삽입
      const svgWrap=document.createElement('span');
      svgWrap.setAttribute('data-univ-icon','1');
      svgWrap.style.cssText='display:inline-flex;align-items:center;flex-shrink:0';
      svgWrap.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:1em;height:1em;opacity:0.75"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
      el.insertBefore(svgWrap,el.firstChild);
    }
  });
}
function pC(n){return n>0?'pt-p':n<0?'pt-n':'pt-z';}
function pS(n){return (n>0?'+':'')+n;}
function getAllUnivs(){
  const r=[...univCfg];const s=new Set(univCfg.map(u=>u.name));
  players.forEach(p=>{if(!s.has(p.univ)){r.push({name:p.univ,color:'#6b7280'});s.add(p.univ);}});
  const seen=new Set();
  return r.filter(u=>{if(seen.has(u.name))return false;seen.add(u.name);return true;});
}

// 현황판 boardOrder → univCfg 순서 동기화 (현황판에서 이동하면 스트리머 목록도 같이 이동)
function syncBoardOrderToUnivCfg(){
  if(!boardOrder||!boardOrder.length) return;
  const newCfg=[];
  boardOrder.forEach(name=>{const u=univCfg.find(x=>x.name===name);if(u)newCfg.push(u);});
  univCfg.forEach(u=>{if(!boardOrder.includes(u.name))newCfg.push(u);});
  if(newCfg.length===univCfg.length){univCfg=newCfg;save();}
}
function getMembers(univ){return players.filter(p=>p.univ===univ);}

/* ELO 상수 */
const ELO_DEFAULT=1200;
const ELO_K=32;

function calcElo(winnerElo, loserElo){
  const exp=1/(1+Math.pow(10,(loserElo-winnerElo)/400));
  return Math.round(ELO_K*(1-exp));
}

// ─────────────────────────────────────────────
// 스트리머 이름 정규화/별명(메모) 매칭
// - 예: 김재현 memo에 "샤이니"가 있으면, 입력에 "샤이니"를 넣어도 "김재현"으로 저장되게
// - 별명/메모가 애매하거나 부분일치만 되면 후보 리스트를 반환
// ─────────────────────────────────────────────
function _cleanPlayerInputName(name){
  const raw = (name||'').trim();
  // 종족 접미사 제거: "김명운Z", "샤이니T"
  return raw.replace(/\s*[TZPN]$/i,'').trim();
}
function resolvePlayerName(rawName){
  const raw = (rawName||'').trim();
  const cleaned = _cleanPlayerInputName(raw);
  if(!cleaned) return {name:'', player:null, match:'empty', candidates:[]};

  // 1) 정확한 이름
  let p = (players||[]).find(x=>x && x.name===cleaned) || (players||[]).find(x=>x && x.name===raw);
  if(p) return {name:p.name, player:p, match:'name', candidates:[p]};

  // 2) 메모(별명) 정확 일치
  const low = cleaned.toLowerCase();
  const memoExact = (players||[]).filter(x=>x && x.memo && String(x.memo).split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
  if(memoExact.length===1) return {name:memoExact[0].name, player:memoExact[0], match:'memo', candidates:memoExact};

  // 3) 공백 제거 후 이름 일치
  const ns = cleaned.replace(/\s+/g,'');
  const nsMatches = (players||[]).filter(x=>x && x.name && x.name.replace(/\s+/g,'')===ns);
  if(nsMatches.length===1) return {name:nsMatches[0].name, player:nsMatches[0], match:'space', candidates:nsMatches};

  // 4) 후보 추천(부분 일치)
  const cand = [];
  const push = (pp, why)=>{
    if(!pp || !pp.name) return;
    if(cand.some(x=>x.p.name===pp.name)) return;
    cand.push({p:pp, why});
  };
  (players||[]).forEach(pp=>{
    if(!pp || !pp.name) return;
    const n = String(pp.name);
    if(n.includes(cleaned) || n.replace(/\s+/g,'').includes(ns)) push(pp,'name');
    else if(pp.memo){
      const toks = String(pp.memo).split(/[\s,，\n]+/).map(x=>x.trim()).filter(Boolean);
      if(toks.some(t=>t.toLowerCase().includes(low))) push(pp,'memo');
    }
  });
  cand.sort((a,b)=>(a.why===b.why? a.p.name.localeCompare(b.p.name) : (a.why==='name'?-1:1)));
  const candidates = cand.slice(0,8).map(x=>x.p);
  return {name: raw, player:null, match:'none', candidates};
}
// 전역 노출(모달/인라인 onclick에서 사용)
try{ window.resolvePlayerName = resolvePlayerName; }catch(e){}

function _normalizeStoredMode(mode){
  const raw = String(mode||'').trim();
  if(!raw) return '';
  const low = raw.toLowerCase();
  if(raw === '중장전') return '끝장전';
  if(raw === 'CK' || raw === '대학 ck' || raw === '대학 CK' || low === '대학ck') return '대학CK';
  if(raw === '일반' || raw === '프로리그 일반') return '프로리그';
  if(raw === '티어대회 일반' || raw === '티어 일반') return '티어대회';
  return raw;
}

// 날짜 문자열을 YYYY-MM-DD로 최대한 정규화한다.
// - 통계/정렬/월별 집계를 위해 "YYYY-MM" prefix가 안정적으로 나오게 하는 목적
// - 파싱 불가한 값은 원본(trim) 반환
function _toIsoDateStr(input){
  const s = String(input ?? '').trim();
  if(!s) return new Date().toISOString().slice(0,10);
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(!m) m = s.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/);
  if(!m) m = s.match(/^(\d{4})\s*(?:년)?\s*(\d{1,2})\s*(?:월)?\s*(\d{1,2})\s*(?:일)?$/);
  if(m){
    const yy = Number(m[1]), mm = Number(m[2]), dd = Number(m[3]);
    if(yy>=1990 && mm>=1 && mm<=12 && dd>=1 && dd<=31){
      return `${yy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
    }
  }
  // 최후: Date 파서 시도 (예: "2026-4-1", "2026/4/1 00:00" 등)
  try{
    const d = new Date(s);
    if(!isNaN(d.getTime())){
      const yy = d.getFullYear();
      const mm = d.getMonth()+1;
      const dd = d.getDate();
      if(yy>=1990 && mm>=1 && mm<=12 && dd>=1 && dd<=31){
        return `${yy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
      }
    }
  }catch(e){}
  return s;
}
try{ window._toIsoDateStr = _toIsoDateStr; }catch(e){}
function applyGameResult(winName, loseName, date, map, matchId, univW, univL, mode){
  // 정확한 이름 일치 우선, 없으면 메모 별명 fallback, 그 다음 공백 제거 후 일치
  function _findPlayer(name){
    // 종족 접미사 제거: "김명운Z", "샤이니T" 같이 이름 뒤에 종족이 붙은 입력도 허용
    // (붙여넣기/자동인식에서 자주 등장)
    const raw = (name||'').trim();
    const cleanedRace = raw.replace(/\s*[TZPN]$/i,'').trim();
    let p=players.find(x=>x.name===name);
    if(p)return p;
    // cleanedRace 우선으로도 재시도
    if (cleanedRace && cleanedRace !== name) {
      p = players.find(x => x.name === cleanedRace);
      if (p) return p;
    }
    const low=cleanedRace.toLowerCase();
    p=players.find(x=>x.memo&&x.memo.split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
    if(p)return p;
    const ns=cleanedRace.replace(/\s+/g,'');
    return players.find(x=>x.name.replace(/\s+/g,'')===ns)||null;
  }
  const w=_findPlayer(winName);
  const l=_findPlayer(loseName);
  if(!w||!l||w===l)return;
  if(!w.history)w.history=[];
  if(!l.history)l.history=[];
  // 중복 체크
  // - matchId가 있으면 matchId가 곧 고유키(게임 단위)라고 가정하고 matchId만으로 중복 판단
  //   (티어대회/대학CK 등에서 같은 날짜/같은 맵/같은 상대가 여러 번 나올 수 있어 date+map+opp로 막으면 누락됨)
  // - matchId가 없을 때만 date+map+opp로 중복 방지
  const d=_toIsoDateStr(date||'');
  const m=map||'-';
  // matchId 기반 체크
  const wDupMatch = matchId ? (w.history||[]).find(h=>h.matchId===matchId) : null;
  const lDupMatch = matchId ? (l.history||[]).find(h=>h.matchId===matchId) : null;
  if(wDupMatch||lDupMatch) return;
  // matchId가 없을 때만 fallback 사용
  if(!matchId){
    const wDupFallback=(w.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===l.name);
    const lDupFallback=(l.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===w.name);
    if(wDupFallback||lDupFallback) return;
  }
  w.win++;l.loss++;w.points+=3;l.points-=3;
  // ELO 계산
  const wElo=w.elo||ELO_DEFAULT;
  const lElo=l.elo||ELO_DEFAULT;
  const delta=calcElo(wElo,lElo);
  w.elo=wElo+delta;
  l.elo=lElo-delta;
  const t=Date.now();
  // 경기 시점 대학 저장 (나중에 대학을 옮겨도 당시 소속 대학으로 집계)
  const wu=univW||w.univ||'';
  const lu=univL||l.univ||'';
  const modeNorm = _normalizeStoredMode(mode);
  w.history.unshift({date:d,time:t,result:'승',opp:l.name,oppRace:l.race,map:m,matchId:matchId||'',eloDelta:delta,eloAfter:w.elo,univ:wu,mode:modeNorm});
  l.history.unshift({date:d,time:t,result:'패',opp:w.name,oppRace:w.race,map:m,matchId:matchId||'',eloDelta:-delta,eloAfter:l.elo,univ:lu,mode:modeNorm});
}

// (요청사항) 동률(2:2 등)도 "저장"되도록 — 무승부 기록
// - 승/패/포인트/ELO에는 영향 없음
// - 스트리머 상세(최근 경기 기록) 및 대전기록 탭에서 확인 가능
// - matchId는 충돌 방지를 위해 호출부에서 기존 matchId에 "_tie" 같은 suffix를 붙이는 것을 권장
function applyDrawResult(nameA, nameB, date, map, matchId, univA, univB, mode, scoreA, scoreB){
  function _findPlayer(name){
    const raw = (name||'').trim();
    const cleanedRace = raw.replace(/\s*[TZPN]$/i,'').trim();
    let p=players.find(x=>x.name===name);
    if(p)return p;
    if (cleanedRace && cleanedRace !== name) {
      p = players.find(x => x.name === cleanedRace);
      if (p) return p;
    }
    const low=cleanedRace.toLowerCase();
    p=players.find(x=>x.memo&&x.memo.split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
    if(p)return p;
    const ns=cleanedRace.replace(/\s+/g,'');
    return players.find(x=>x.name.replace(/\s+/g,'')===ns)||null;
  }
  const a=_findPlayer(nameA);
  const b=_findPlayer(nameB);
  if(!a||!b||a===b) return;
  if(!a.history)a.history=[];
  if(!b.history)b.history=[];
  const d=_toIsoDateStr(date||'');
  const m=map||'-';
  // 중복 체크: matchId가 있으면 matchId만으로 판단(게임 단위 중복 허용 방지)
  const aDup = matchId ? (a.history||[]).find(h=>h.matchId===matchId) : null;
  const bDup = matchId ? (b.history||[]).find(h=>h.matchId===matchId) : null;
  if(aDup||bDup) return;
  // matchId 없을 때만 fallback
  if(!matchId){
    const aDupFallback=(a.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===b.name&&h.result==='무');
    const bDupFallback=(b.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===a.name&&h.result==='무');
    if(aDupFallback||bDupFallback) return;
  }
  const t=Date.now();
  const au=univA||a.univ||'';
  const bu=univB||b.univ||'';
  const scoreStr = (scoreA!=null && scoreB!=null) ? `${scoreA}:${scoreB}` : '';
  // eloDelta는 null로 두어 UI에서 "-" 처리되게 함
  const modeNorm = _normalizeStoredMode(mode);
  a.history.unshift({date:d,time:t,result:'무',opp:b.name,oppRace:b.race,map:m,matchId:matchId||'',eloDelta:null,eloAfter:a.elo||ELO_DEFAULT,univ:au,mode:modeNorm,score:scoreStr});
  b.history.unshift({date:d,time:t,result:'무',opp:a.name,oppRace:a.race,map:m,matchId:matchId||'',eloDelta:null,eloAfter:b.elo||ELO_DEFAULT,univ:bu,mode:modeNorm,score:scoreStr});
}

function _rebuildAllPlayerHistoryCore() {
  // 1. 모든 선수의 history, win, loss, points, elo 초기화
  players.forEach(p => {
    p.history = [];
    p.win = 0;
    p.loss = 0;
    p.points = 0;
    p.elo = ELO_DEFAULT;
  });

  let count = 0;
  function _ensureMid(m, prefix, idx){
    let id = String((m && (m._id || m.sid || m.id)) || '').trim();
    if(!id){
      const d = _toIsoDateStr(m && m.d || '');
      const a = String(m && (m.a || m.wName || '') || '').replace(/\s+/g,'').slice(0,16);
      const b = String(m && (m.b || m.lName || '') || '').replace(/\s+/g,'').slice(0,16);
      id = `${prefix}:${d}:${a}:${b}:${idx}`;
    }
    try{ if(m) m._id = id; }catch(e){}
    return id;
  }

  // 2. miniM에서 복구
  (miniM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'mini', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        // (요청/수정) 시빌워(내전)는 팀 라벨(A/B)과 무관하게 "선수 실제 소속 대학"을 기록
        // → univW/univL을 비워두면 applyGameResult가 w.univ / l.univ를 사용
        const isCivil = (m.type === 'civil') || (m.a === 'A팀' && m.b === 'B팀');
        const univW = isCivil ? '' : (g.winner === 'A' ? (m.a || '') : (m.b || ''));
        const univL = isCivil ? '' : (g.winner === 'A' ? (m.b || '') : (m.a || ''));
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, m.type === 'civil' ? '시빌워' : '미니대전', { sideUnivA: m.a, sideUnivB: m.b });
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, m.type === 'civil' ? '시빌워' : '미니대전');
        }
        count++;
      });
    });
  });

  // 3. univM에서 복구
  (univM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'univ', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const univW = g.winner === 'A' ? m.a : m.b;
        const univL = g.winner === 'A' ? m.b : m.a;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, '대학대전', { sideUnivA: m.a, sideUnivB: m.b });
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, '대학대전');
        }
        count++;
      });
    });
  });

  // 4. ckM에서 복구
  (ckM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'ck', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(m.teamAMembers || g.teamA, m.teamBMembers || g.teamB, g.winner, m.d, g.map || '-', gameId, '대학CK');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '대학CK');
        }
        count++;
      });
    });
  });

  // 5. proM에서 복구
  (proM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'pro', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(m.teamAMembers || g.teamA, m.teamBMembers || g.teamB, g.winner, m.d, g.map || '-', gameId, '프로리그');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '프로리그');
        }
        count++;
      });
    });
  });

  // 6. ttM에서 복구
  (ttM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'tt', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(m.teamAMembers || g.teamA, m.teamBMembers || g.teamB, g.winner, m.d, g.map || '-', gameId, '티어대회');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '티어대회');
        }
        count++;
      });
    });
  });

  // 7. indM에서 복구
  (indM || []).forEach(m => {
    if(!m.wName || !m.lName) return;
    applyGameResult(m.wName, m.lName, m.d, m.map || '-', m._id || genId(), '', '', m._proLabel ? '프로리그' : '개인전');
    count++;
  });

  // 8. gjM에서 복구
  (gjM || []).forEach(m => {
    if(!m.wName || !m.lName) return;
    applyGameResult(m.wName, m.lName, m.d, m.map || '-', m._id || genId(), '', '', m._proLabel ? '프로리그끝장전' : '끝장전');
    count++;
  });

  // 9. comps에서 복구
  (comps || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'comp', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const univW = g.winner === 'A' ? m.a : m.b;
        const univL = g.winner === 'A' ? m.b : m.a;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, '대회', { sideUnivA: m.a, sideUnivB: m.b });
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, '대회');
        }
        count++;
      });
    });
  });

  // 10. tourneys에서 복구
  if (typeof tourneys !== 'undefined') {
    tourneys.forEach((tn, tnIdx) => {
      const isTier = tn.type === 'tier';
      (tn.groups || []).forEach(grp => {
        (grp.matches || []).forEach((m, mi) => {
          const mid = _ensureMid(m, `tourG${tnIdx}`, mi);
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
              if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
                applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, isTier ? '티어대회' : '조별리그', { sideUnivA: m.a, sideUnivB: m.b });
              } else {
                applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '조별리그');
              }
              count++;
            });
          });
        });
      });
      Object.values((tn.bracket || {}).matchDetails || {}).forEach((m, mi) => {
        const mid = _ensureMid(m, `tourB${tnIdx}`, mi);
        (m.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
            if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
              applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, isTier ? '티어대회' : '대회', { sideUnivA: m.a, sideUnivB: m.b });
            } else {
              applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '대회');
            }
            count++;
          });
        });
      });
      ((tn.bracket || {}).manualMatches || []).forEach((m, mi) => {
        const mid = _ensureMid(m, `tourM${tnIdx}`, mi);
        (m.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
            if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
              applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, isTier ? '티어대회' : '대회', { sideUnivA: m.a, sideUnivB: m.b });
            } else {
              applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '대회');
            }
            count++;
          });
        });
      });
    });
  }

  // 11. proTourneys에서 복구
  if (typeof proTourneys !== 'undefined') {
    proTourneys.forEach((tn, tnIdx) => {
      (tn.groups || []).forEach(grp => {
        (grp.matches || []).forEach((m, matchIdx) => {
          const mid = _ensureMid(m, `pTG${tnIdx}`, matchIdx);
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
              applyGameResult(wName, lName, m.d || '', g.map || '', gameId, '', '', '프로리그대회');
              count++;
            });
          });
        });
      });
      (tn.bracket || []).forEach((rnd, rndIdx) => {
        rnd.forEach((m, matchIdx) => {
          if (!m) return;
          const mid = _ensureMid(m, `pTB${tnIdx}_${rndIdx}`, matchIdx);
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
              applyGameResult(wName, lName, m.d || '', g.map || '', gameId, '', '', '프로리그대회');
              count++;
            });
          });
        });
      });
      if (tn.thirdPlace) {
        const tp = tn.thirdPlace;
        const tpid = _ensureMid(tp, `pT3${tnIdx}`, 0);
        (tp.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || g.sid || `${tpid}_s${setIdx}_g${gameIdx}`;
            applyGameResult(wName, lName, tp.d || '', g.map || '', gameId, '', '', '프로리그대회');
            count++;
          });
        });
      }
      (tn.teamMatches || []).forEach((tm, tmIdx) => {
        const tmid = _ensureMid(tm, `pTTM${tnIdx}`, tmIdx);
        (tm.games || []).forEach((g, gameIdx) => {
          if (!g.wName || !g.lName) return;
          const gameId = g._id || g.sid || `${tmid}_g${gameIdx}`;
          applyGameResult(g.wName, g.lName, tm.d || '', g.map || '', gameId, '', '', '프로리그대회');
          count++;
        });
      });
    });
  }

  return count;
}
function rebuildAllPlayerHistory() {
  if(!confirm('모든 스트리머의 경기 기록을 대전 데이터에서 다시 생성합니다.\n\n⚠️ 기존 history가 초기화되고 대전 기록 기반으로 재구성됩니다.\n\n계속하시겠습니까?')) return;
  const count = _rebuildAllPlayerHistoryCore();
  save();
  alert(`✅ ${count}개의 경기가 스트리머 기록에 복구되었습니다!`);
  render();
}

function deduplicatePlayerHistory(){
  if(!confirm('중복 경기 기록을 제거합니다.\n\n완전히 동일한 항목(같은 게임 ID 또는 같은 time+matchId+상대+결과+맵)만 제거합니다.\n계속하시겠습니까?')) return;

  let totalRemoved=0;
  players.forEach(p=>{
    if(!p.history||!p.history.length)return;
    const seen=new Set();
    const before=p.history.length;
    p.history=p.history.filter(h=>{
      const mid=h.matchId||'';
      // 게임 단위 고유 ID(_sN_gN 포함)면 matchId 자체가 고유 키
      const isGameId=mid.includes('_s')&&mid.includes('_g');
      let key;
      if(isGameId){
        key=mid;
      } else if(h.time){
        // time이 있으면 포함하여 진짜 중복만 제거 (합법적 재매치와 구분)
        key=`${mid}|${h.opp||''}|${h.result||''}|${h.map||'-'}|${h.time}`;
      } else {
        // time도 없고 bare matchId면 건드리지 않음 (합법적 재매치와 구분 불가)
        return true;
      }
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
    totalRemoved+=before-p.history.length;
  });

  // 승패/포인트/ELO 재계산 (날짜 오름차순으로 delta 누적)
  players.forEach(p=>{
    p.win=0;p.loss=0;p.points=0;p.elo=ELO_DEFAULT;
    const sorted=[...(p.history||[])].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    sorted.forEach(h=>{
      if(h.result==='승'){p.win++;p.points+=3;}
      else if(h.result==='패'){p.loss++;p.points-=3;}
      if(h.eloDelta!=null)p.elo=(p.elo||ELO_DEFAULT)+h.eloDelta;
    });
  });

  if(typeof fixPoints==='function')fixPoints();
  save();
  alert(`🧹 중복 제거 완료: ${totalRemoved}개 항목 삭제`);
  render();
}

// game 객체에서 playerA, playerB, winner 정보를 추출해서
// applyGameResult를 호출한다.
function updatePlayerHistoryFromGame(game, date, mode){
  if(!game.playerA || !game.playerB || !game.winner) return;

  const winName = game.winner === 'A' ? game.playerA : 
                  game.winner === 'B' ? game.playerB : game.winner;
  const loseName = game.winner === 'A' ? game.playerB : 
                   game.winner === 'B' ? game.playerA : '';

  if(!winName || !loseName) return;

  // applyGameResult 내부에서 history 추가와 중복 방지를 처리함
  applyGameResult(winName, loseName, date, game.map||'', game._id||'', 
                  game.univA||'', game.univB||'', mode);
}

/* ══════════════════════════════════════
   탭 버튼 색상 커스텀 시스템
   - localStorage: su_tab_colors_v1
   - ctx별 탭 활성(on) 색상 커스텀
══════════════════════════════════════ */
const _TAB_COLOR_KEY = 'su_tab_colors_v1';
const _TAB_COLOR_ENABLED_KEY = 'su_tab_color_enabled';
const _TAB_COLOR_MODE_KEY = 'su_tab_color_mode';
const _TAB_COLOR_LENGTH_KEY = 'su_tab_color_length';
const _TAB_COLOR_TAIL_KEY = 'su_tab_color_tail';
const _TAB_COLOR_DEFAULTS = {
  mergedComp: {
    comp:     { from:'#0f172a', to:'#1d4ed8', label:'일반 대회' },
    tiertour: { from:'#4c1d95', to:'#7c3aed', label:'티어대회' }
  },
  mergedUniv: {
    civil:  { from:'#7f1d1d', to:'#b91c1c', label:'시빌워' },
    mini:   { from:'#0f172a', to:'#1d4ed8', label:'미니대전' },
    univm:  { from:'#064e3b', to:'#059669', label:'대학대전' },
    univck: { from:'#78350f', to:'#d97706', label:'대학CK' }
  },
  mergedInd: {
    ind: { from:'#0f172a', to:'#1d4ed8', label:'개인전' },
    gj:  { from:'#7f1d1d', to:'#dc2626', label:'끝장전' }
  },
  mergedPro: {
    pro:  { from:'#14532d', to:'#16a34a', label:'프로리그 일반' },
    gj:   { from:'#7f1d1d', to:'#dc2626', label:'프로 끝장전' },
    comp: { from:'#0f172a', to:'#1d4ed8', label:'프로리그 대회' }
  }
};
function getTabColorStyle(ctx, id){
  try{
    if(localStorage.getItem(_TAB_COLOR_ENABLED_KEY)==='0') return '';
  }catch(e){}
  let mode = 'fill';
  try{
    const raw = String(localStorage.getItem(_TAB_COLOR_MODE_KEY)||'fill').trim();
    if(['fill','soft','outline','solid'].includes(raw)) mode = raw;
  }catch(e){}
  let len = 48;
  let tail = 22;
  try{ len = Math.max(20, Math.min(90, parseInt(localStorage.getItem(_TAB_COLOR_LENGTH_KEY)||'48',10) || 48)); }catch(e){}
  try{ tail = Math.max(0, Math.min(60, parseInt(localStorage.getItem(_TAB_COLOR_TAIL_KEY)||'22',10) || 22)); }catch(e){}
  let from = '';
  let to = '';
  try{
    const saved = JSON.parse(localStorage.getItem(_TAB_COLOR_KEY)||'{}');
    const c = (saved[ctx]||{})[id];
    if(c && c.from && c.to){ from = c.from; to = c.to; }
    else if(c && c.from){ from = c.from; to = c.from; }
  }catch(e){}
  try{
    const def = (_TAB_COLOR_DEFAULTS[ctx]||{})[id];
    if(!from && def){
      from = def.from || '';
      to = def.to || def.from || '';
    }
  }catch(e){}
  if(!from && !to) return '';
  const main = to || from;
  const stop1 = Math.max(8, Math.min(78, len));
  const stop2 = Math.max(stop1 + 8, Math.min(96, stop1 + 20));
  const darkA = Math.max(0, Math.min(0.28, tail/100 * 0.32)).toFixed(3);
  const darkB = Math.max(0, Math.min(0.18, tail/100 * 0.18)).toFixed(3);
  const fullBg = `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 42%, rgba(15,23,42,${darkB}) 84%, rgba(15,23,42,${darkA}) 100%), linear-gradient(135deg, ${from} 0%, ${to} ${stop1}%, ${to} ${stop2}%, ${main} 100%)`;
  const softBg = `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 46%, rgba(15,23,42,${(tail/100*0.11).toFixed(3)}) 88%, rgba(15,23,42,${(tail/100*0.17).toFixed(3)}) 100%), linear-gradient(135deg, ${from}22 0%, ${to}14 ${stop1}%, ${to}0A ${stop2}%, ${main}10 100%)`;
  if(mode==='soft'){
    return `background:${softBg} !important;border-color:${main}44 !important;color:${main} !important;box-shadow:0 8px 18px ${main}18 !important,inset 0 0 0 1px ${main}16 !important;`;
  }
  if(mode==='outline'){
    return `background:linear-gradient(180deg,#ffffff,#f8fafc) !important;border:1.5px solid ${main}55 !important;color:${main} !important;box-shadow:0 6px 16px ${main}16 !important,inset 0 0 0 1px ${from}14 !important;`;
  }
  if(mode==='solid'){
    return `background:linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 52%, rgba(15,23,42,${darkB}) 86%, rgba(15,23,42,${darkA}) 100%), ${main} !important;border-color:${main}66 !important;color:#fff !important;box-shadow:0 12px 24px ${main}30 !important;`;
  }
  return `background:${fullBg} !important;border-color:${main}55 !important;color:#fff !important;box-shadow:0 12px 24px ${main}26 !important;`;
}
function setTabColor(ctx, id, from, to){
  try{
    const saved = JSON.parse(localStorage.getItem(_TAB_COLOR_KEY)||'{}');
    if(!saved[ctx]) saved[ctx]={};
    saved[ctx][id] = { from: String(from||''), to: String(to||'') };
    localStorage.setItem(_TAB_COLOR_KEY, JSON.stringify(saved));
  }catch(e){}
}
function resetTabColor(ctx, id){
  try{
    const saved = JSON.parse(localStorage.getItem(_TAB_COLOR_KEY)||'{}');
    if(saved[ctx]) delete saved[ctx][id];
    localStorage.setItem(_TAB_COLOR_KEY, JSON.stringify(saved));
  }catch(e){}
}
function resetAllTabColors(){
  try{ localStorage.removeItem(_TAB_COLOR_KEY); }catch(e){}
}
try{
  window.getTabColorStyle = getTabColorStyle;
  window.setTabColor = setTabColor;
  window.resetTabColor = resetTabColor;
  window.resetAllTabColors = resetAllTabColors;
  window._TAB_COLOR_DEFAULTS = _TAB_COLOR_DEFAULTS;
  window._TAB_COLOR_KEY = _TAB_COLOR_KEY;
  window._TAB_COLOR_ENABLED_KEY = _TAB_COLOR_ENABLED_KEY;
  window._TAB_COLOR_MODE_KEY = _TAB_COLOR_MODE_KEY;
  window._TAB_COLOR_LENGTH_KEY = _TAB_COLOR_LENGTH_KEY;
  window._TAB_COLOR_TAIL_KEY = _TAB_COLOR_TAIL_KEY;
}catch(e){}
