/* ══════════════════════════════════════════════════════════════
   상수 - 코어 저장소 유틸 (J, _lsSave, 데이터버전체크) (constants.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
try{ window.SU_STATS_JS_V = window.SU_STATS_JS_V || '20260806-weekmvp2'; }catch(e){}

// (요청) 특정 탭들은 필터 영역을 기본으로 항상 펼친 상태로 유지
// - 통계탭, 개인/끝장전, 대학전, 대회/티어, 프로리그, 룰렛/게임
try{
  window._shouldLockSubFilter = window._shouldLockSubFilter || function(ctx){
    const t = String(ctx||'').trim();
    const set = new Set(['stats','ind','gj','univm','mini','civil','ck','comp','tiertour','pro','progj','roulette']);
    return set.has(t);
  };
}catch(e){}

// 캐시 관리 함수
function _checkDataVersion(){
  try{
    // 세션 스토리지에 체크 완료 플래그가 있으면 스킵
    if(sessionStorage.getItem('su_version_checked') === 'true') return;
    
    const savedVer = Number(localStorage.getItem('su_data_version')) || 0;
    if(savedVer !== DATA_VERSION){
      window.LOG('Cache', '데이터 버전 변경됨:', savedVer, '->', DATA_VERSION, '- 캐시 초기화');
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
    window.LOG('Cache', '캐시 초기화 완료');
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
    window.LOG('Cache', '전체 캐시 삭제 완료');
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
    window.LOG('Cache', '특정 캐시 삭제 완료:', keys);
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
