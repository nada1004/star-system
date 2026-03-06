/* ══════════════════════════════════════
   Firebase Realtime Database 연동
   (ES Module - type="module" 로 로드)
══════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
onValue(dataRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;
  if (typeof window.onFirebaseLoad === 'function') {
    window.onFirebaseLoad(data);
  } else {
    _pending = data; // 콜백 등록 전 도착한 데이터 버퍼링
  }
});

// onFirebaseLoad가 나중에 등록될 때 버퍼 전달
const _origDefine = Object.defineProperty;
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

// 데이터 쓰기 함수 (관리자 전용 - cloud-board.js의 fbCloudSave 에서 호출)
window.fbSet = async function(data, pw) {
  const finalData = { ...data, admin_pw: pw };
  await set(dataRef, finalData);
};
