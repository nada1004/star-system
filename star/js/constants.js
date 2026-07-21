/* ══════════════════════════════════════
   CONSTANTS - 티어 순서: god > king > jack > joker > spade > 0티어 > 1티어 ...
══════════════════════════════════════ */

// [FIX-18] J()와 _lsSave()를 파일 최상단으로 이동.
// 기존 위치: 1088줄 (function 호이스팅으로 동작은 했으나 정의를 찾으려면 1000줄 스크롤 필요)
// localStorage JSON/LZString 로드 헬퍼 — 파일 전체에서 사용
function J(k){
  try{
    const v=localStorage.getItem(k);
    if(!v)return null;
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

// 데이터 버전 관리 - 캐시 무효화용 (데이터 구조 변경 시 버전 증가)
const DATA_VERSION = 2;
try{ window.SU_STATS_JS_V = window.SU_STATS_JS_V || '20260717-ds03'; }catch(e){}

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
try{ _checkDataVersion(); }catch(e){}

function _clearCacheByVersionChange(){
  try{
    // 먼저 새 버전을 저장하여 무한 루프 방지
    localStorage.setItem('su_data_version', String(DATA_VERSION));
    
    const cacheKeys = [
      'su_tiers', 'su_u', 'su_m', 'su_t', 'su_cn', 'su_cc', 'su_ptc', 'su_ttcur', 'su_boardOrder', 'su_bpo', 'su_notices', 'su_seasons', 'su_cal_sched',
      'su_mm','su_um','su_ck','su_pro','su_cm','su_tn','su_ttm','su_indm','su_gjm','su_p','su_pp','su_last_save_time'
    ];
    cacheKeys.forEach(key => {
      try{ localStorage.removeItem(key); }catch(e){}
    });
    try{ localStorage.setItem('su_force_autoload', '1'); }catch(e){}
    try{ sessionStorage.setItem('su_force_autoload', '1'); }catch(e){}
    try{ if(window.MatchStore && typeof window.MatchStore.clear === 'function') window.MatchStore.clear(); }catch(e){}
    try{ if(window.PlayerStore && typeof window.PlayerStore.clear === 'function') window.PlayerStore.clear(); }catch(e){}
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

window.escJS = function(s){
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
};
window.escHTML = function(s){
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
window.escAttr = function(s){
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
      roulette:'룰렛/게임',
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
      circle:'50%', square:'6px', rounded:'22%', squircle:'28%',
      diamond:'50%', hexagon:'50%', shield:'50% 50% 45% 45% / 60% 60% 40% 40%',
      pentagon:'50%', star:'50%', blob:'40% 60% 55% 45% / 45% 55% 60% 40%',
      leaf:'50%', triangle:'0', octagon:'50%', cross:'0',
      heart:'50% 50% 50% 50%/60% 60% 40% 40%',
      parallelogram:'0', arrow:'0',
      'rounded-top':'50% 50% 10% 10% / 70% 70% 10% 10%',
      cloud:'50%', arch:'50% 50% 8px 8px / 60% 60% 8px 8px',
      badge:'0', chevron:'0', clover:'50%', gem:'0', flag:'0',
      pill:'50px', stadium:'40% 40% 40% 40% / 60% 60% 60% 60%',
      teardrop:'50% 50% 50% 50% / 60% 60% 40% 40%',
      moon:'50%', tv:'14%', flower:'50%', pac:'50%',
      'ring-cut':'50%', kite:'0', notch:'8px',
      // ── 스포츠 대결 ──
      thunder:'0', versus:'0', esports:'0', trophy:'0', crown:'0',
      target:'50%', fist:'0', arena:'50%', medal:'50%', saber:'0', blast:'0',
      // ── 추가 모양 ──
      puzzle:'8px', 'ribbon-banner':'0', envelope:'4px', spark:'0', 'tag-corner':'0', 'wave-bottom':'0 0 50% 50% / 0 0 30% 30%'
    };
    const radius = _shapeRadius[shape] || '50%';
    document.documentElement.style.setProperty('--su_profile_radius', radius);
    // 특수 모양(diamond/hexagon/shield)은 clip-path로 처리
    const _shapeClip = {
      diamond:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      hexagon:'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
      shield:'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
      pentagon:'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)',
      star:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
      leaf:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
      triangle:'polygon(50% 0%, 0% 100%, 100% 100%)',
      octagon:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
      cross:'polygon(33% 0%,67% 0%,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0% 67%,0% 33%,33% 33%)',
      parallelogram:'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
      arrow:'polygon(0% 0%,75% 0%,100% 50%,75% 100%,0% 100%,25% 50%)',
      cloud:'polygon(8% 60%,5% 45%,12% 32%,22% 26%,30% 10%,45% 4%,60% 10%,72% 5%,85% 14%,92% 28%,96% 43%,90% 58%,78% 66%,62% 70%,40% 70%,22% 66%)',
      badge:'polygon(50% 0%,95% 15%,100% 55%,75% 92%,25% 92%,0% 55%,5% 15%)',
      chevron:'polygon(0% 0%,85% 0%,100% 50%,85% 100%,0% 100%,15% 50%)',
      clover:'polygon(50% 20%,58% 35%,75% 25%,65% 42%,82% 48%,65% 55%,75% 72%,58% 62%,50% 80%,42% 62%,25% 72%,35% 55%,18% 48%,35% 42%,25% 25%,42% 35%)',
      gem:'polygon(50% 0%,85% 20%,100% 55%,75% 100%,25% 100%,0% 55%,15% 20%)',
      flag:'polygon(0% 0%,100% 0%,75% 50%,100% 100%,0% 100%)',
      moon:'ellipse(50% 50% at 65% 50%)',
      flower:'polygon(50% 5%,61% 29%,84% 20%,74% 44%,98% 50%,74% 56%,84% 80%,61% 71%,50% 95%,39% 71%,16% 80%,26% 56%,2% 50%,26% 44%,16% 20%,39% 29%)',
      pac:'polygon(100% 35%,55% 50%,100% 65%,100% 100%,0% 100%,0% 0%,100% 0%)',
      kite:'polygon(50% 0%,100% 40%,50% 100%,0% 40%)',
      notch:'polygon(25% 0%,75% 0%,75% 12%,100% 12%,100% 100%,0% 100%,0% 12%,25% 12%)',
      // ── 스포츠 대결 ──
      thunder:'polygon(30% 0%,65% 0%,45% 42%,75% 42%,18% 100%,38% 55%,8% 55%)',
      versus:'polygon(0% 0%,100% 0%,100% 72%,50% 100%,0% 72%)',
      esports:'polygon(50% 0%,96% 18%,100% 62%,75% 100%,25% 100%,0% 62%,4% 18%)',
      trophy:'polygon(20% 0%,80% 0%,85% 30%,100% 30%,100% 45%,85% 45%,75% 68%,80% 80%,90% 85%,90% 100%,10% 100%,10% 85%,20% 80%,25% 68%,15% 45%,0% 45%,0% 30%,15% 30%)',
      crown:'polygon(0% 100%,0% 40%,25% 65%,50% 0%,75% 65%,100% 40%,100% 100%)',
      fist:'polygon(15% 0%,85% 0%,100% 15%,100% 60%,85% 80%,70% 100%,30% 100%,15% 80%,0% 60%,0% 15%)',
      arena:'polygon(50% 0%,90% 10%,100% 50%,90% 90%,50% 100%,10% 90%,0% 50%,10% 10%)',
      medal:'polygon(25% 0%,75% 0%,75% 10%,100% 32%,100% 68%,75% 90%,75% 100%,25% 100%,25% 90%,0% 68%,0% 32%,25% 10%)',
      saber:'polygon(0% 15%,15% 0%,100% 85%,85% 100%)',
      blast:'polygon(50% 0%,56% 36%,78% 10%,62% 43%,95% 34%,73% 52%,100% 65%,68% 65%,82% 95%,55% 72%,50% 100%,45% 72%,18% 95%,32% 65%,0% 65%,27% 52%,5% 34%,38% 43%,22% 10%,44% 36%)',
      // ── 추가 모양 ──
      puzzle:'polygon(0% 0%,40% 0%,40% 10%,60% 10%,60% 0%,100% 0%,100% 40%,90% 40%,90% 60%,100% 60%,100% 100%,60% 100%,60% 90%,40% 90%,40% 100%,0% 100%,0% 60%,10% 60%,10% 40%,0% 40%)',
      'ribbon-banner':'polygon(0% 0%,100% 0%,100% 80%,75% 80%,75% 100%,50% 80%,25% 100%,25% 80%,0% 80%)',
      envelope:'polygon(0% 15%,50% 0%,100% 15%,100% 100%,0% 100%)',
      spark:'polygon(50% 0%,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0% 50%,40% 40%)',
      'tag-corner':'polygon(8% 0%,92% 0%,100% 8%,100% 92%,92% 100%,8% 100%,0% 92%,0% 8%)'
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

    // 프로필 이미지 효과 — 기능 완전 제거(항상 "없음"으로 고정)
    document.documentElement.style.setProperty('--su_profile_fx', 'none');
    document.documentElement.style.setProperty('--su_profile_filter_fx', 'none');
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
    const shape = localStorage.getItem('su_ul_shape') || 'circle'; // circle|square|rounded|squircle|hexagon|shield|pentagon|star|diamond|blob|leaf|octagon
    const size  = parseInt(localStorage.getItem('su_ul_size') || '34', 10);
    const box   = parseInt(localStorage.getItem('su_ul_box')  || '46', 10);
    // 대학 상세(대학 모달) 전용 크기 (없으면 기본 크기 사용)
    const dSizeRaw = parseInt(localStorage.getItem('su_ul_size_detail') || '0', 10);
    const dBoxRaw  = parseInt(localStorage.getItem('su_ul_box_detail')  || '0', 10);
    const dSize = Math.max(132, Number.isFinite(dSizeRaw) && dSizeRaw > 0 ? dSizeRaw : size);
    const dBox  = Math.max(166, Number.isFinite(dBoxRaw) && dBoxRaw > 0 ? dBoxRaw : box);
    // (요청사항) 대학 로고/팀버튼 이미지 모양 다양화
    const _ulRadiusMap = {
      circle:'50%', square:'10px', rounded:'22%', squircle:'28%',
      hexagon:'50%', shield:'50%', pentagon:'50%', star:'50%',
      diamond:'50%', blob:'40% 60% 55% 45% / 45% 55% 60% 40%',
      leaf:'50%', octagon:'50%', heart:'50% 50% 50% 50%/60% 60% 40% 40%'
    };
    const _ulClipMap = {
      hexagon:'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
      shield:'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
      pentagon:'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)',
      star:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
      diamond:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      leaf:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
      octagon:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'
    };
    const radius = _ulRadiusMap[shape] || '50%';
    const ulClip = _ulClipMap[shape] || 'none';
    document.documentElement.style.setProperty('--su_univ_logo_radius', radius);
    document.documentElement.style.setProperty('--su_univ_logo_clip', ulClip);
    document.documentElement.style.setProperty('--su_univ_logo_size', size + 'px');
    // tc-uicon (팀버튼 내 대학 로고) 모양도 같이 적용
    document.documentElement.style.setProperty('--su_tc_uicon_radius', radius);
    document.documentElement.style.setProperty('--su_tc_uicon_clip', ulClip);
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
      // fill(늘리기) 옵션도 지원 - fill은 '100% 100%'로 렌더링됨
      return ['cover','contain','fill'].includes(String(v).trim()) ? String(v).trim() : 'cover';
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
// HTML 이스케이프 — 전역 단일 정의 (stats.js / settings.js 등의 중복 guard가 이 정의를 우선 사용)
const _ESC_HTML_MAP={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
window.escHTML = function(s){
  return String(s??'').replace(/[&<>"']/g, function(m){
    return _ESC_HTML_MAP[m];
  });
};

const _TIER_SHADOW_MAP={
  'G':'0 2px 14px rgba(124,58,237,.55),0 0 0 1px rgba(167,139,250,.3)',
  'K':'0 2px 10px rgba(26,42,82,.5),0 0 0 1px rgba(226,201,126,.2)',
  'JA':'0 2px 10px rgba(12,74,92,.5)',
  'J':'0 2px 10px rgba(6,78,59,.5)',
  'S':'0 2px 10px rgba(30,58,95,.5)',
};
function getTierBadge(tier){
  if(!tier) return '';
  const ic=(_TIER_ICON&&_TIER_ICON[tier])||'';
  const bg=getTierBtnColor(tier)||'#64748b';
  const col=getTierBtnTextColor(tier)||'#fff';
  // 현황판과 동일한 그라디언트 스타일 (box-shadow 포함)
  const shadow=_TIER_SHADOW_MAP[tier]||'0 1px 5px rgba(0,0,0,.25)';
  return `<span class="tbadge" style="background:${bg};color:${col};box-shadow:${shadow};border-radius:6px;padding:1px 5px;font-size:9.5px;font-weight:800;letter-spacing:.2px;white-space:nowrap;display:inline-flex;align-items:center;gap:2px">${ic?ic+' ':''}${tier}</span>`;
}

const _TIER_LABEL_ICONS_DEFAULT={G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠',유스:'🐣',미정:'❓'};
const _TIER_LABEL_MAP={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스',미정:'미정 (미확인)'};
function getTierLabel(tier){
  const icons=_TIER_ICON||_TIER_LABEL_ICONS_DEFAULT;
  const ic=icons[tier]||'';
  return ic?`${ic} ${_TIER_LABEL_MAP[tier]||tier}`:tier;
}

const _TIER_PILL_ICONS_DEFAULT={G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠️',유스:'🐣',미정:'❓'};
function getTierPillLabel(tier){
  const icons=_TIER_ICON||_TIER_PILL_ICONS_DEFAULT;
  return icons[tier]?`${icons[tier]} ${_TIER_LABEL_MAP[tier]||tier}`:tier;
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

const _ROLE_ORDER_MAP = {'대표':0,'이사장':0,'선장':0,'동아리장':0,'동아리 회장':0,'반장':0,'총장':1,'부총장':2,'총괄':2,'교수':3,'코치':4};
function getRoleOrder(role){
  // Representative=0, President=0, Captain=0, Club President=0, Class President=0, Dean=1, Vice Dean=2, Director=2(tie), Professor=3, Coach=4, Other=99
  if(!role) return 99;
  return role in _ROLE_ORDER_MAP ? _ROLE_ORDER_MAP[role] : 99;
}
function getRoleBadgeHTML(role, size='11px'){
  if(!role) return '';
  const icon = ROLE_ICONS[role]||'🏷️';
  const col = ROLE_COLORS[role]||'#6b7280';
  // MAIN_ROLES는 진한 배경색, 그 외는 연한 배경
  const isMain = MAIN_ROLES.includes(role);
  if(isMain){
    return `<span style="font-size:${size};padding:1px 5px;border-radius:5px;background:${col};color:#fff;font-weight:800;white-space:nowrap;flex-shrink:0;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.2)">${icon} ${role}</span>`;
  }
  return `<span style="font-size:${size};padding:1px 4px;border-radius:4px;background:${col}20;color:${col};border:1px solid ${col}44;font-weight:700;white-space:nowrap;flex-shrink:0">${icon} ${role}</span>`;
}

/* ══════════════════════════════════════
   DATA LOAD
   [FIX-18] J()와 _lsSave()는 파일 최상단으로 이동됨. 이 섹션에서는 제거.
══════════════════════════════════════ */

function _normalizeLoadedPlayers(list){
  try{
    let changed = false;
    const next = (Array.isArray(list) ? list : []).map(p=>{
      if(!p || typeof p !== 'object'){ changed = true; return null; }
      const n = { ...p };
      const rawType = String(n.gameType || '').trim().toLowerCase();
      if(rawType === 'general' || n.gameType === '종합게임'){
        n.gameType = 'starcraft';
        changed = true;
      }else if(!n.gameType){
        n.gameType = 'starcraft';
        changed = true;
      }
      if(!String(n.univ || '').trim()){
        n.univ = '무소속';
        changed = true;
      }
      if(!String(n.race || '').trim()){
        n.race = 'N';
        changed = true;
      }
      if(Object.prototype.hasOwnProperty.call(n, 'displayName')){
        delete n.displayName;
        changed = true;
      }
      if(Object.prototype.hasOwnProperty.call(n, 'crew')){
        delete n.crew;
        changed = true;
      }
      return n;
    }).filter(Boolean);
    try{ window._playerSchemaNeedsSave = window._playerSchemaNeedsSave || changed; }catch(e){}
    return next;
  }catch(e){
    return Array.isArray(list) ? list : [];
  }
}
// (복구/호환) su_p가 {v:2,p:[...],d:{...}} 형태여도 정상 동작하도록 unpack
function _unpackPlayers(raw){
  try{
    if(!raw) return [];
    if(Array.isArray(raw)) return _normalizeLoadedPlayers(raw);
    if(typeof raw!=='object') return [];
    if(raw.v!==2 || !Array.isArray(raw.p) || !raw.d) return [];
    const d=raw.d||{};
    const res=d.res||[], opp=d.opp||[], race=d.race||[], map=d.map||[], univ=d.univ||[], mode=d.mode||[];
    const get=(arr,i)=> (i==null||i<0)?'':(arr[i]||'');
    return _normalizeLoadedPlayers(raw.p.map(pp=>{
      const base = (pp && typeof pp === 'object') ? pp : {};
      const p={...base};
      const hp=Array.isArray(p.h)?p.h:[];
      p.history = hp.filter(r=>Array.isArray(r)).map(r=>({
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
    }));
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
try{
  if(window._playerSchemaNeedsSave){
    setTimeout(()=>{
      try{
        if(window._playerSchemaNeedsSave && typeof localSave === 'function'){
          localSave();
          window._playerSchemaNeedsSave = false;
        }
      }catch(e){}
    }, 0);
  }
}catch(e){}
var boardOrder = J('su_boardOrder') || []; // 현황판 대학 순서
var b2LabelAlpha  = J('su_b2la')  ?? 16;
var b2BgAlpha     = J('su_b2ba')  ?? 9;
var b2BgImgAlpha      = J('su_b2bia')  ?? 12;
var b2FreeBgAlpha     = J('su_b2fba')  ?? 25;
var b2FreeTierBgAlpha = J('su_b2ftba') ?? 15;
var b2ProfileBgAlpha  = J('su_b2pba') ?? 10;
function _b2AlphaHex(pct){ return Math.round((pct||0)/100*255).toString(16).padStart(2,'0'); }
var univCfg    = J('su_u')  || [{name:'흑카데미',color:'#1e3a8a'},{name:'JSA',color:'#c2410c'},{name:'늪지대',color:'#15803d'},{name:'무소속',color:'#6b7280'}];
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

var BLD = {}; // ✅ var로 선언해야 window.BLD와 동일 객체로 IIFE 내부에서도 접근 가능
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
  if(!Array.isArray(_customStatusIcons)) _customStatusIcons = [];
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
  playerStatusIcons = s.playerStatusIcons ? {...s.playerStatusIcons} : {};
  playerStatusExpiry = s.playerStatusExpiry ? {...s.playerStatusExpiry} : {};
  _customStatusIcons = Array.isArray(s.customStatusIcons) ? [...s.customStatusIcons] : [];
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
// 프로필 사진 썸네일 URL (images.weserv.nl 리사이즈 프록시)
// 사용자가 imgur/디스코드 등에 올린 원본(수백KB~수MB, 고해상도)을
// 실제 표시 크기(px)에 맞게 축소+webp 재인코딩하여 전송량/디코딩 비용을 크게 줄인다.
function toThumbUrl(u, px){
  const s = toHttpsUrl(u);
  if(!s || !/^https:\/\//.test(s)) return s; // data: 등은 그대로 통과
  if(s.indexOf('images.weserv.nl') !== -1) return s; // 이미 프록시된 URL이면 중복 방지
  try{
    const dpr = (typeof window!=='undefined' && window.devicePixelRatio > 1) ? 2 : 1;
    const w = Math.max(32, Math.min(640, Math.round((parseInt(px,10)||64) * dpr)));
    const encoded = encodeURIComponent(s.replace(/^https?:\/\//,''));
    return 'https://images.weserv.nl/?url='+encoded+'&w='+w+'&h='+w+'&fit=cover&we=1&output=webp&q=78';
  }catch(e){ return s; }
}
// 정사각형으로 자르지 않고 원본 비율을 유지한 채 최대 너비만 제한 (배너/상세 사진 등)
function toScaledUrl(u, maxPx){
  const s = toHttpsUrl(u);
  if(!s || !/^https:\/\//.test(s)) return s;
  if(s.indexOf('images.weserv.nl') !== -1) return s;
  try{
    const dpr = (typeof window!=='undefined' && window.devicePixelRatio > 1) ? 2 : 1;
    const w = Math.max(64, Math.min(1200, Math.round((parseInt(maxPx,10)||480) * dpr)));
    const encoded = encodeURIComponent(s.replace(/^https?:\/\//,''));
    return 'https://images.weserv.nl/?url='+encoded+'&w='+w+'&we=1&output=webp&q=80';
  }catch(e){ return s; }
}
// ══════════════════════════════════════════════════════════
// 공용: 썸네일에 마우스를 올리면 두번째 프로필 이미지가 미리보기(스크럽)로 표시되는 기능
// 스트리머탭 / 현황판 / 티어 순위표 / 각종 상세·공유 팝업 등 어디서든 재사용
// - PC(마우스 hover 가능한 포인터)에서만 동작, 터치 기기에서는 동작 안 함
// - 썸네일 우측 절반에 마우스가 있을 때만 두번째 이미지 표시
// 사용법: 감싸는 요소에 class="ph-swap" 지정 + _phSwap2ndHTML(secondUrl)을 그 요소 내부에 삽입
// ══════════════════════════════════════════════════════════
function _phSwapIsVideoUrl(u){
  const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
  return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
}
function _phSwap2ndHTML(secondUrl, opt){
  const raw = String(secondUrl||'').trim();
  if(!raw) return '';
  const cls = 'ph-swap-2' + (opt && opt.extraClass ? (' '+opt.extraClass) : '');
  const fitStyle = (opt && opt.style) ? opt.style : '';
  if(_phSwapIsVideoUrl(raw)){
    const src = toHttpsUrl(raw);
    return `<video class="${cls}" src="${src}" muted playsinline loop preload="metadata" style="${fitStyle}"></video>`;
  }
  const isGif = /\.gif(\?|$)/i.test(raw);
  // gif는 toScaledUrl(webp변환 프록시)을 거치면 정지 이미지가 되므로 원본 URL을 그대로 사용
  const src = isGif ? toHttpsUrl(raw) : toScaledUrl(raw, (opt && opt.px) || 320);
  const orig = toHttpsUrl(raw);
  return `<img class="${cls}" src="${src}" data-orig="${orig}" loading="lazy" decoding="async" alt="" style="${fitStyle}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.remove()}">`;
}
(function(){
  if(window._phSwapDelegatedInit) return; // 중복 등록 방지
  window._phSwapDelegatedInit = true;
  const _isPcHover = () => !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  document.addEventListener('mousemove', function(e){
    if(!_isPcHover()) return;
    const wrap = e.target && e.target.closest ? e.target.closest('.ph-swap') : null;
    if(!wrap) return;
    const sec = wrap.querySelector('.ph-swap-2');
    if(!sec) return;
    const rect = wrap.getBoundingClientRect();
    if(!rect.width) return;
    const x = e.clientX - rect.left;
    if(x > rect.width / 2) sec.classList.add('is-visible');
    else sec.classList.remove('is-visible');
  }, {passive:true});
  document.addEventListener('mouseout', function(e){
    const wrap = e.target && e.target.closest ? e.target.closest('.ph-swap') : null;
    if(!wrap) return;
    if(e.relatedTarget && wrap.contains(e.relatedTarget)) return;
    const sec = wrap.querySelector('.ph-swap-2');
    if(sec) sec.classList.remove('is-visible');
  }, {passive:true});
})();

// 썸네일 프록시 실패 시 원본으로 폴백 → 그래도 실패하면 숨김. onerror 핸들러에서 공용으로 호출.
function _thumbFallback(el){
  try{
    if(!el) return;
    const orig = el.getAttribute('data-orig');
    if(orig && el.src !== orig){ el.onerror = function(){ this.style.display='none'; }; el.src = orig; }
    else { el.style.display='none'; }
  }catch(e){ try{ el.style.display='none'; }catch(e2){} }
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

// (정렬 보강) 저장 전 날짜 내림차순 정렬 — 과거 날짜 경기를 나중에 저장해도 순서 유지
function _sortMatchArrByDate(arr){
  if(!Array.isArray(arr)||arr.length<2) return;
  const _nd=(d)=>{
    const s=String(d||'').trim();
    const m=s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if(m) return `${m[1]}-${String(parseInt(m[2],10)).padStart(2,'0')}-${String(parseInt(m[3],10)).padStart(2,'0')}`;
    return s;
  };
  arr.sort((a,b)=>{
    const da=_nd(a.d||''), db=_nd(b.d||'');
    if(da&&db&&da!==db) return db.localeCompare(da);
    return 0;
  });
}

// ══════════════════════════════════════════════════════════
// 아래 코드는 분리된 파일로 이동됨:
//   constants-save.js     — localSave / saveCfg / savePhotos / 클라우드 저장
//   constants-game.js     — ELO / 게임결과 / 대학유틸 / 이름정규화 / histPage 등
//   constants-tab-colors.js — 탭 버튼 색상 커스텀 시스템
// ══════════════════════════════════════════════════════════
