/* ══════════════════════════════════════
   GitHub data.json 동기화 호환 레이어
   - 파일명은 firebase-init.js 유지(기존 참조 호환)
   - 실제 동작은 Firebase를 쓰지 않고 GitHub 업로드/폴링만 수행
   - GitHub 토큰은 Fine-grained Personal Access Token 권장
   - 권한은 nada1004/star-system 저장소의 Contents: Read and Write 만 부여
   - Classic PAT의 repo 전체 권한은 사용하지 않음
   - 저장 구조:
     1) star-datacenter/data.json        : 경량 엔트리 포인터
     2) star-datacenter/data/index.json  : 분리 저장 인덱스
     3) star-datacenter/data/core.json   : 공통 데이터
     4) star-datacenter/data/history/*.json : 월별 기록 데이터
══════════════════════════════════════ */

const GH_OWNER = 'nada1004';
const GH_REPO = 'star-system';
const GH_BRANCH = 'main';
const GH_ENTRY_PATH = 'star-datacenter/data.json';
const GH_SPLIT_INDEX_PATH = 'star-datacenter/data/index.json';
const GH_SPLIT_CORE_PATH = 'star-datacenter/data/core.json';
const GH_SPLIT_HISTORY_DIR = 'star-datacenter/data/history';
const GH_SPLIT_SCHEMA_VERSION = 2;
const GH_MONTHLY_KEYS = ['miniM','univM','comps','ckM','proM','ttM','indM','gjM'];
const FB_AUX_DATABASE_URL = 'https://stardata1004-default-rtdb.firebaseio.com';
const FB_AUX_SIGNAL_PATH = 'syncSignals/star-datacenter';
// [보안 수정] 하드코딩된 기본 비밀번호(FB_AUX_DEFAULT_PW)를 제거했습니다.
// 관리자는 localStorage의 su_fb_pw 값을 직접 설정해야 신호 동기화가 동작합니다.
// (기존에는 평문 비밀번호가 공개 클라이언트 소스에 그대로 노출되어 있었습니다.)

let _pending = null;
let _lastSnapshot = null;
let _lastSavedAt = 0;
let _saveChain = Promise.resolve();
let _lastFirebaseSignalAt = Number(localStorage.getItem('su_sync_last_firebase_signal_at')||0) || 0;
let _firebaseSignalBusy = false;
let _toastPendingSignalTs = 0;
let _lastMissingMonthsSig = String(localStorage.getItem('su_sync_missing_months_sig')||'');
let _missingRetryInFlight = false;
let _autoRetryMissingBusy = false;
let _autoRetryMissingAttempt = 0;
let _autoRetryMissingTimer = null;
let _autoRetryMissingSig = '';
let _syncAgeBadgeBound = false;
// GitHub 저장/조회 로직은 `js/sync/firebase-github.js`,
// 신호 감지/강제 동기화/배지 로직은 `js/sync/firebase-signal.js`로 분리

// 초기 로드 + 신호 기반 변경 감지
function _safePollGithub(force){
  try{
    const fn = (typeof window!=='undefined' && typeof window._pollGithubOnce==='function')
      ? window._pollGithubOnce
      : (typeof _pollGithubOnce==='function' ? _pollGithubOnce : null);
    if(typeof fn === 'function'){
      fn(!!force);
      return true;
    }
  }catch(e){}
  return false;
}
function _deferPollGithub(force, tryCount){
  const n = Number(tryCount||0) || 0;
  if(_safePollGithub(force)) return;
  if(n < 20){
    setTimeout(()=>{ _deferPollGithub(force, n+1); }, n < 5 ? 120 : 300);
  }
}
function _safePollFirebaseSignal(force){
  try{
    const fn = (typeof window!=='undefined' && typeof window._pollFirebaseSignalOnce==='function')
      ? window._pollFirebaseSignalOnce
      : (typeof _pollFirebaseSignalOnce==='function' ? _pollFirebaseSignalOnce : null);
    if(typeof fn === 'function'){
      fn(!!force);
      return true;
    }
  }catch(e){}
  return false;
}
function _deferPollFirebaseSignal(force, tryCount){
  const n = Number(tryCount||0) || 0;
  if(_safePollFirebaseSignal(force)) return;
  if(n < 20){
    setTimeout(()=>{ _deferPollFirebaseSignal(force, n+1); }, n < 5 ? 120 : 300);
  }
}
setTimeout(()=>{ _deferPollGithub(true, 0); _deferPollFirebaseSignal(true, 0); }, 150);
setInterval(()=>{
  if(document.visibilityState !== 'visible') return;
  _deferPollFirebaseSignal(false, 0);
}, 8000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    _deferPollFirebaseSignal(true, 0);
    try{
      const fn = (typeof window!=='undefined' && typeof window._updateSyncAgeBadge==='function')
        ? window._updateSyncAgeBadge
        : (typeof _updateSyncAgeBadge==='function' ? _updateSyncAgeBadge : null);
      if(typeof fn === 'function') fn();
    }catch(e){}
  }
});
function _safeInitSyncAgeBadge(tryCount){
  const n = Number(tryCount||0) || 0;
  try{
    const fn = (typeof window!=='undefined' && typeof window._bindSyncAgeBadge==='function')
      ? window._bindSyncAgeBadge
      : (typeof _bindSyncAgeBadge==='function' ? _bindSyncAgeBadge : null);
    if(typeof fn === 'function'){
      fn();
      return true;
    }
  }catch(e){}
  if(n < 20){
    setTimeout(()=>{ _safeInitSyncAgeBadge(n+1); }, n < 5 ? 100 : 300);
  }
  return false;
}
setTimeout(()=>{ _safeInitSyncAgeBadge(0); }, 0);
