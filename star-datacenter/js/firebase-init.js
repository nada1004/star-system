/* ══════════════════════════════════════
   Firebase Realtime Database 연동
   (ES Module - type="module" 로 로드)
══════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, get, set, off } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

let _pending = null;
let _lastSnapshot = null;
let _unsubscribeViewer = null; // 관람자 onValue 해제용

function _deliver(data) {
  _lastSnapshot = data;
  if (typeof window.onFirebaseLoad === 'function') window.onFirebaseLoad(data);
  else _pending = data;
}

// onFirebaseLoad가 나중에 등록될 때 _pending 전달
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

// 관리자 판별: su_session(로그인) + su_fb_pw(Firebase 비밀번호) 둘 다 있으면 관리자
const _isAdminDevice = localStorage.getItem('su_session') === '1' && !!localStorage.getItem('su_fb_pw');

if (_isAdminDevice) {
  // ── 관리자: Firebase onValue 실시간 WebSocket ──
  onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    _deliver(data);
  });

  // 포그라운드 복귀 시 최신 데이터 강제 재요청
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      try {
        const snapshot = await get(dataRef);
        const data = snapshot.val();
        if (data) _deliver(data);
      } catch(e) {
        if (_lastSnapshot) _deliver(_lastSnapshot);
      }
    }
  });

} else {
  // ── 관람자: onValue로 실시간 수신, 단 동시접속 절약을 위해 GitHub 토큰 있으면 폴링으로 전환 ──
  // onValue 시작 (실시간, 즉시 반영)
  _unsubscribeViewer = onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    _deliver(data);
  });

  // 포그라운드 복귀 시 즉시 최신 데이터 재요청
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      try {
        const snapshot = await get(dataRef);
        const data = snapshot.val();
        if (data) _deliver(data);
      } catch(e) {
        if (_lastSnapshot) _deliver(_lastSnapshot);
      }
    }
  });

  // 🔧 GitHub 폴링 제거
  // 이유: Firebase onValue가 실시간으로 모든 변경 사항을 처리함
  // GitHub Pages URL(nada1004.github.io/star-system/data.json)과
  // 실제 저장 경로(raw.githubusercontent.com/.../star-datacenter/data.json)가 달라
  // 오래된 데이터를 30초마다 덮어씌우는 버그 발생
  // → Firebase onValue만으로 실시간 동기화 처리
}

// 데이터 쓰기 함수 (관리자 전용)
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
