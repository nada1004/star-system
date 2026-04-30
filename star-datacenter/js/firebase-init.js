/* ══════════════════════════════════════
   동기화 초기화 (GitHub 기본 / 필요 시 Firebase)
   (ES Module - type="module" 로 로드)
══════════════════════════════════════ */

// 기본 모드: github (Firebase 한도/동시접속 이슈 회피)
function _syncMode(){
  try{ return (localStorage.getItem('su_sync_mode') || 'github').trim() || 'github'; }catch(e){ return 'github'; }
}
function _ghRawUrl(){
  try{
    const v = (localStorage.getItem('su_gh_raw_url') || '').trim();
    if (v) return v;
  }catch(e){}
  try{
    if (typeof window.CONFIG !== 'undefined' && window.CONFIG?.GITHUB?.DATA_URL) return String(window.CONFIG.GITHUB.DATA_URL);
  }catch(e){}
  return 'https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data.json';
}
function _pollMs(){
  try{
    const ms = parseInt(localStorage.getItem('su_gh_poll_ms')||'45000',10);
    return Math.max(10000, Math.min(300000, isNaN(ms)?45000:ms)); // 10초~5분
  }catch(e){ return 45000; }
}

let _pending = null;
let _lastSnapshot = null;

function _deliver(data){
  _lastSnapshot = data;
  if (typeof window.onFirebaseLoad === 'function') window.onFirebaseLoad(data);
  else _pending = data;
}

// onFirebaseLoad가 나중에 등록될 때 _pending 전달
let _cbSet = false;
(function pollCallback(){
  if(_cbSet) return;
  if(typeof window.onFirebaseLoad === 'function' && _pending){
    _cbSet = true;
    window.onFirebaseLoad(_pending);
    _pending = null;
  }else{
    setTimeout(pollCallback, 200);
  }
})();

async function startGithubPolling(){
  let lastSavedAt = 0;
  let _adminFirstApplied = false; // 관리자 최초 1회는 새로고침 시 원격 반영 허용
  let _lastAdminHintTs = 0;
  const _isAdminSession = (()=>{ try{ return localStorage.getItem('su_session') === '1'; }catch(e){ return false; } })();

  const _shouldApplyToAdmin = (remoteSavedAt)=>{
    try{
      const localAdminSa = Number(localStorage.getItem('su_last_admin_save')||0) || 0;
      // 로컬이 더 최신이면(아직 업로드 실패/지연) 덮어쓰지 않음
      if(localAdminSa && remoteSavedAt && localAdminSa > remoteSavedAt) return false;
    }catch(e){}
    return true;
  };

  const _hintAdminRemoteUpdated = ()=>{
    try{
      const now = Date.now();
      // 너무 자주 띄우지 않게(최소 60초 간격)
      if(_lastAdminHintTs && now - _lastAdminHintTs < 60000) return;
      _lastAdminHintTs = now;
      const el = document.getElementById('cloudStatus');
      if(el){
        el.style.color = '#0ea5e9';
        el.textContent = 'ℹ️ 원격 데이터 갱신 감지됨 — 새로고침하면 반영됩니다(관리자 기록 보호를 위해 자동 반영은 꺼짐)';
        setTimeout(()=>{ try{ if(el) el.textContent=''; }catch(e){} }, 4500);
      }
    }catch(e){}
  };

  async function once(){
    if (document.visibilityState !== 'visible') return;
    try{
      const url = _ghRawUrl();
      const r = await fetch(url + '?_=' + Date.now(), { cache:'no-store' });
      if(!r.ok) return;
      const d = await r.json().catch(()=>null);
      if(!d) return;
      const sa = Number(d.savedAt||0) || 0;
      if(!lastSavedAt || sa > lastSavedAt){
        lastSavedAt = sa || lastSavedAt;
        if (_isAdminSession) {
          // ✅ 새로고침(초기 로드)에서는 1회 원격 반영 허용(로컬이 더 최신이면 보호)
          if(!_adminFirstApplied){
            _adminFirstApplied = true;
            if(_shouldApplyToAdmin(sa)){
              _deliver(d);
            }else{
              _lastSnapshot = d;
            }
            return;
          }
          // 이후에는 자동 반영 금지(기록 보호) + 알림만(너무 자주 X)
          _lastSnapshot = d;
          _hintAdminRemoteUpdated();
          return;
        }
        _deliver(d); // 관람자/비로그인 기기: 자동 반영
      }
    }catch(e){}
  }
  // 최초 1회
  await once();
  // 주기 폴링
  setInterval(once, _pollMs());
  // 포그라운드 복귀 시 즉시 1회
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') once(); });
}

async function startFirebase(){
  // Firebase 모드는 동적 import로만 로드(기본 GitHub 모드에서는 Firebase를 아예 안 불러옴)
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
  const { getDatabase, ref, onValue, get, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

  const firebaseConfig = {
    apiKey: "AIzaSyAM7YWzo13XEx7J57Z5OhGPs4GRvjZ-GzY",
    authDomain: "stardata1004.firebaseapp.com",
    databaseURL: "https://stardata1004-default-rtdb.firebaseio.com",
    projectId: "stardata1004",
    storageBucket: "stardata1004.firebasestorage.app",
    messagingSenderId: "286293082488",
    appId: "1:286293082488:web:ce7226ee05d4843cb4088d"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const dataRef = ref(db, '/');

  // 관리자 판별: su_session(로그인) + su_fb_pw(Firebase 비밀번호) 둘 다 있으면 관리자
  const _isAdminDevice = localStorage.getItem('su_session') === '1' && !!localStorage.getItem('su_fb_pw');

  // 관리자/관람자 모두 onValue 사용 (기존 동작 유지)
  onValue(dataRef, (snapshot)=>{
    const data = snapshot.val();
    if(!data) return;
    _deliver(data);
  });

  // 포그라운드 복귀 시 최신 데이터 강제 재요청
  document.addEventListener('visibilitychange', async ()=>{
    if(document.visibilityState !== 'visible') return;
    try{
      const snapshot = await get(dataRef);
      const data = snapshot.val();
      if(data) _deliver(data);
    }catch(e){
      if(_lastSnapshot) _deliver(_lastSnapshot);
    }
  });

  // 데이터 쓰기 함수 (관리자 전용)
  window.fbSet = async function(data, pw){
    const finalData = { ...data, admin_pw: pw };
    await set(dataRef, finalData);
  };

  // 강제 1회 fetch (수동 동기화 버튼용)
  window.fbForceSync = async function(){
    const snapshot = await get(dataRef);
    const data = snapshot.val();
    if(!data) return;
    _lastSnapshot = data;
    if (typeof window.onFirebaseLoad === 'function') {
      window._forcingSync = true;
      window.onFirebaseLoad(data);
      window._forcingSync = false;
    }
  };

  // 관람자 보호를 위해 firebase 모드여도 GitHub 보조 폴링을 붙일 수 있게(옵션)
  if (!_isAdminDevice) {
    setTimeout(()=>{ try{ startGithubPolling(); }catch(e){} }, 5000);
  }
}

(async function(){
  const mode = _syncMode();
  if (mode === 'firebase') await startFirebase();
  else await startGithubPolling();
})();
