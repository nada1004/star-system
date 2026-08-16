// 📱 FAB (Floating Action Button) 관련 함수

var _fabOpen = false;

function toggleFab() {
  _fabOpen = !_fabOpen;
  var btn = document.getElementById('fabMain');
  var list = document.getElementById('fabSubList');
  if (!btn || !list) return;
  btn.classList.toggle('open', _fabOpen);
  list.classList.toggle('open', _fabOpen);
}

function closeFab() {
  _fabOpen = false;
  var btn = document.getElementById('fabMain');
  var list = document.getElementById('fabSubList');
  if (btn) btn.classList.remove('open');
  if (list) list.classList.remove('open');
}

function updateFabVisibility() {
  var fab = document.getElementById('mobileFab');
  if (!fab) return;

  var isMobile = window.innerWidth <= 768;
  var hideMobile = localStorage.getItem('su_fabHideMobile') === '1';
  var hidePC = localStorage.getItem('su_fabHidePC') === '1';

  if (isMobile) {
    fab.style.display = hideMobile ? 'none' : 'flex';
  } else {
    fab.style.display = hidePC ? 'none' : 'flex';
  }

  // 관리자 전용: 펨붕이붓(AI봇) 메뉴는 관리자만 표시
  try {
    var aiItem = document.getElementById('fabAIBotItem');
    if (aiItem) {
      var admin = (typeof isLoggedIn !== 'undefined' && isLoggedIn) &&
                  !(typeof isSubAdmin !== 'undefined' && isSubAdmin);
      aiItem.style.display = admin ? '' : 'none';
    }
  } catch (e) {}

  // 로그인 상태에 따라 설정 메뉴 표시/숨김
  // (mobile-bar.js의 동명 함수가 fab.js 로드 순서에 덮어써져 죽어있던 로직을 병합)
  try {
    var settingsItem = document.querySelector('.fab-sub-item--cfg');
    if (settingsItem) {
      settingsItem.style.display = (typeof isLoggedIn !== 'undefined' && isLoggedIn) ? 'flex' : 'none';
    }
  } catch (e) {}
}

window.addEventListener('resize', updateFabVisibility);
window.addEventListener('DOMContentLoaded', updateFabVisibility);

// ── FAB 빠른 액션 ──
function fabActionPaste() {
  try {
    if (typeof openPasteModal === 'function') { openPasteModal(); return; }
    if (typeof om === 'function') om('pasteModal');
  } catch (e) {}
  try { if (typeof showToast === 'function') showToast('붙여넣기 모달을 열 수 없습니다.'); } catch (e) {}
}

function fabActionSave() {
  try {
    if (typeof save === 'function') { save(); if (typeof showToast === 'function') showToast('저장 요청'); return; }
  } catch (e) {}
  try { if (typeof showToast === 'function') showToast('save()를 찾을 수 없습니다.'); } catch (e) {}
}

function fabActionCfgSearch() {
  try {
    var btn = document.getElementById('tabCfg');
    if (btn) sw('cfg', btn);
    setTimeout(function () {
      var inp = document.getElementById('cfgSearchInp');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    }, 80);
  } catch (e) {}
}
