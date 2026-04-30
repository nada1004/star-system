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
  async function once(){
    if (document.visibilityState !== 'visible') return;
    // 관리자(로그인) 기기에서는 자동 폴링 적용이 로컬 입력을 덮어써서
    // "기록이 몇 초 뒤 사라지는" 현상을 유발할 수 있음.
    // → 관리자는 자동 반영을 끄고, 원격 갱신은 표시만 하고 수동 불러오기로 처리.
    // (관람자/비로그인 기기만 자동 적용)
    const isAdminSession = (()=>{ try{ return localStorage.getItem('su_session') === '1'; }catch(e){ return false; } })();
    try{
      const url = _ghRawUrl();
      const r = await fetch(url + '?_=' + Date.now(), { cache:'no-store' });
      if(!r.ok) return;
      const d = await r.json().catch(()=>null);
      if(!d) return;
      const sa = Number(d.savedAt||0) || 0;
      if(!lastSavedAt || sa > lastSavedAt){
        lastSavedAt = sa || lastSavedAt;
        if (isAdminSession) {
          // 원격 데이터는 보관만 하고(필요 시 수동 적용), 화면에 힌트만 표시
          _lastSnapshot = d;
          try{
            const el = document.getElementById('cloudStatus');
            if(el){
              el.style.color = '#0ea5e9';
              el.textContent = 'ℹ️ 원격 데이터 갱신 감지됨 — 관리자 기기에서는 자동 반영을 끄고 있습니다(기록 보호). 필요 시 “데이터 불러오기/동기화 확인”을 사용하세요.';
              setTimeout(()=>{ try{ if(el) el.textContent=''; }catch(e){} }, 4500);
            }
          }catch(e){}
          return;
        }
        _deliver(d);
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
