/* ══════════════════════════════════════
   Firebase Realtime Database 연동
   (ES Module - type="module" 로 로드)
══════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// 실시간 데이터 수신 → 일반 스크립트의 onFirebaseLoad 콜백으로 전달
// 모듈은 비동기 로드되므로, 콜백이 아직 없으면 버퍼에 보관 후 나중에 전달
let _pending = null;
let _lastSnapshot = null; // 마지막 수신 데이터 보관 (포그라운드 복귀 시 재전달용)

onValue(dataRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;
  _lastSnapshot = data;
  if (typeof window.onFirebaseLoad === 'function') {
    window.onFirebaseLoad(data);
  } else {
    _pending = data;
  }
});

// onFirebaseLoad가 나중에 등록될 때 버퍼 전달
let _fbCallbackSet = false;
(function pollCallback() {
  if (_fbCallbackSet) return;
  if (typeof window.onFirebaseLoad === 'function' && _pending) {
    _fbCallbackSet = true;
    window.onFirebaseLoad(_pending);
    _pending = null;
  } else {
    setTimeout(pollCallback, 200);
  }
})();

// 모바일 백그라운드 → 포그라운드 복귀 시 Firebase에서 최신 데이터 강제 재요청
// (백그라운드 중 WebSocket 끊겼을 수 있으므로 _lastSnapshot 캐시 대신 신규 fetch)
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && typeof window.onFirebaseLoad === 'function') {
    try {
      const snapshot = await get(dataRef);
      const data = snapshot.val();
      if (!data) return;
      _lastSnapshot = data;
      window.onFirebaseLoad(data);
    } catch(e) {
      // fetch 실패 시 캐시 폴백
      if (_lastSnapshot) window.onFirebaseLoad(_lastSnapshot);
    }
  }
});

// 60초마다 자동 폴링 - 오래 열어둔 페이지도 최신 유지 (WebSocket 단절 대비)
// 관리자는 제외 - 인메모리 미저장 변경사항 보호
setInterval(async () => {
  if (document.visibilityState !== 'visible') return;
  const isAdmin = typeof isLoggedIn !== 'undefined' && isLoggedIn && !!localStorage.getItem('su_fb_pw');
  if (isAdmin) return;
  try {
    const snapshot = await get(dataRef);
    const data = snapshot.val();
    if (!data) return;
    _lastSnapshot = data;
    if (typeof window.onFirebaseLoad === 'function') window.onFirebaseLoad(data);
  } catch(e) {}
}, 60000);

// 데이터 쓰기 함수 (관리자 전용 - cloud-board.js의 fbCloudSave 에서 호출)
window.fbSet = async function(data, pw) {
  const finalData = { ...data, admin_pw: pw };
  await set(dataRef, finalData);
};

// 강제 1회 fetch (수동 동기화 버튼용)
window.fbForceSync = async function() {
  const snapshot = await get(dataRef);
  const data = snapshot.val();
  if (!data) return;
  _lastSnapshot = data;
  if (typeof window.onFirebaseLoad === 'function') {
    window._forcingSync = true;
    window.onFirebaseLoad(data);
    window._forcingSync = false;
  }
};
