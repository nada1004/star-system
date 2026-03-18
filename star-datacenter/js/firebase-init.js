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
  // ── 관람자 기기: onValue WebSocket 미사용 → 동시접속 100명 제한 회피 ──
  // 최초 1회 Firebase get() (brief HTTP, persistent 연결 아님)
  get(dataRef).then(snapshot => {
    const data = snapshot.val();
    if (data) _deliver(data);
  }).catch(() => {});

  // GitHub Pages data.json 30초 폴링 (수천 명 무료 처리)
  const GITHUB_DATA_URL = 'https://nada1004.github.io/star-system/data.json';
  let _lastGhSavedAt = 0;

  async function pollGitHub() {
    if (document.visibilityState !== 'visible') return;
    try {
      const res = await fetch(GITHUB_DATA_URL + '?_=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;
      // 더 최신 데이터일 때만 적용 (불필요한 re-render 방지)
      if ((data.savedAt || 0) > _lastGhSavedAt) {
        _lastGhSavedAt = data.savedAt || 0;
        _deliver(data);
      }
    } catch(e) {}
  }

  setInterval(pollGitHub, 30000);

  // 포그라운드 복귀 시 즉시 폴링
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pollGitHub();
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
