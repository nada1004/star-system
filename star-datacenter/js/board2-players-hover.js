/* ══════════════════════════════════════════════════════════════
   보드2 - 선수카드 호버 유틸 (board2-players.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _b2TierLabel(t) {
  const s = String(t || '').trim();
  if (!s) return '?티어';
  return s.endsWith('티어') ? s : s + '티어';
}

// 프로필탭 그리드 카드 — 우측에 마우스를 올리면 두번째 프로필 사진이 잠깐 미리보기(스크럽)로 표시됨 (PC 마우스 전용)
function _b2CardHoverScrub(e, card) {
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const img2 = card.querySelector('.b2-players-card-secondary');
  if (!img2) return;
  const rect = card.getBoundingClientRect();
  if (!rect.width) return;
  const x = e.clientX - rect.left;
  if (x > rect.width / 2) {
    img2.classList.add('is-visible');
  } else {
    img2.classList.remove('is-visible');
  }
}
function _b2CardHoverLeave(card) {
  const img2 = card && card.querySelector ? card.querySelector('.b2-players-card-secondary') : null;
  if (img2) img2.classList.remove('is-visible');
}

