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

// Firebase REST API URL (WebSocket 연결 없이 HTTP GET → 동시접속 제한 없음)
const FIREBASE_REST_URL = 'https://stardata1004-default-rtdb.firebaseio.com/.json';
const GITHUB_DATA_URL = 'https://nada1004.github.io/star-system/data.json';

let _pending = null;
let _lastSnapshot = null;

// 데이터 전달 헬퍼
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

// 관리자 판별: su_session(로그인) + su_fb_pw(Firebase 비밀번호) 둘 다 있으면 관리자 기기
const _isAdminDevice = localStorage.getItem('su_session') === '1' && !!localStorage.getItem('su_fb_pw');

if (_isAdminDevice) {
  // ── 관리자 기기: Firebase WebSocket 실시간 구독 ──
  onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    _deliver(data);
  });

  // 포그라운드 복귀 시 Firebase에서 최신 데이터 강제 재요청
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      try {
        const snapshot = await get(dataRef);
        const data = snapshot.val();
        if (!data) return;
        _deliver(data);
      } catch(e) {
        if (_lastSnapshot) _deliver(_lastSnapshot);
      }
    }
  });

} else {
  // ── 관람자 기기 ──
  // onValue WebSocket 미사용 → 동시접속 100명 제한 없음 (수천 명 무료)
  // Firebase REST API(HTTP) + GitHub CDN 폴링 조합
  let _lastViewerSavedAt = 0;

  async function viewerPoll() {
    if (document.visibilityState !== 'visible') return;

    // 1. GitHub Pages 먼저 시도 (관리자 GitHub 토큰 설정 시 CDN 무제한 처리)
    try {
      const ghRes = await fetch(GITHUB_DATA_URL + '?_=' + Date.now(), { cache: 'no-store' });
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (ghData && (ghData.savedAt || 0) > _lastViewerSavedAt) {
          _lastViewerSavedAt = ghData.savedAt || 0;
          _deliver(ghData);
          return; // GitHub에서 최신 데이터 받았으면 Firebase 호출 불필요
        }
      }
    } catch(e) {}

    // 2. Firebase REST API 폴백 (GitHub 토큰 미설정 or GitHub에 새 데이터 없을 때)
    // HTTP GET으로 WebSocket 연결 없이 데이터 조회 → 동시접속 제한 없음
    try {
      const fbRes = await fetch(FIREBASE_REST_URL + '?_=' + Date.now(), { cache: 'no-store' });
      if (!fbRes.ok) return;
      const fbData = await fbRes.json();
      if (!fbData) return;
      if ((fbData.savedAt || 0) > _lastViewerSavedAt) {
        _lastViewerSavedAt = fbData.savedAt || 0;
        _deliver(fbData);
      }
    } catch(e) {}
  }

  // 최초 로드: Firebase REST (빠르게 최신 데이터 획득)
  (async () => {
    try {
      const res = await fetch(FIREBASE_REST_URL + '?_=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data) { _lastViewerSavedAt = data.savedAt || 0; _deliver(data); }
      }
    } catch(e) {}
  })();

  // 30초마다 폴링
  setInterval(viewerPoll, 30000);

  // 포그라운드 복귀 시 즉시 폴링
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') viewerPoll();
  });
}

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
