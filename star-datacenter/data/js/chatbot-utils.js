function _escapeRegExp(s){
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function _escJS(s){
  try{ return (typeof window.escJS === 'function') ? window.escJS(s) : String(s || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }catch(e){}
  return String(s || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}
function escapeHtml(text) { return window.escHTML(text); }
function escapeAttr(text) { return (typeof window.escAttr === 'function') ? window.escAttr(text) : escapeHtml(text); }
// 실제 티어 체계(G/K/JA/J/S/0~8티어/유스/미정, constants.js의 TIERS)에서 선수의
// 상대적 위치에 따라 배지 색을 매긴다. 문자열이 'S/A/B/C/D'일 거라 가정하는
// 하드코딩 매핑은 그 밖의 실제 티어를 전부 회색으로 표시해버리는 문제가 있었다.
function _tierBadgeColors(tier) {
  const palette = [
    ['#7c3aed','#ede9fe'],
    ['#2563eb','#dbeafe'],
    ['#0891b2','#cffafe'],
    ['#16a34a','#dcfce7'],
    ['#d97706','#fef3c7'],
    ['#dc2626','#fee2e2'],
  ];
  try{
    const list = (typeof TIERS !== 'undefined' && Array.isArray(TIERS) && TIERS.length) ? TIERS : null;
    if (list && tier) {
      const idx = list.indexOf(tier);
      if (idx >= 0) {
        const denom = Math.max(1, list.length - 1);
        const pos = Math.round((idx / denom) * (palette.length - 1));
        return palette[Math.max(0, Math.min(palette.length - 1, pos))];
      }
    }
  }catch(e){}
  return ['#64748b', '#f1f5f9'];
}
// 안내 문구(🔍/🎲 등) 뒤에 HTML 카드를 이어붙일 때 쓰는 한 줄 노트.
// 순수 "\n\n" 텍스트로 이어붙이면 html 포맷일 때 줄바꿈이 무시되므로 div로 감싼다.
function formatChatNote(text) {
  return `<div style="font-size:var(--fs-sm);color:var(--text3);font-weight:700;margin-bottom:8px">${escapeHtml(text)}</div>`;
}
try{
  window._escapeRegExp = window._escapeRegExp || _escapeRegExp;
  window._escJS = window._escJS || _escJS;
  window.escapeHtml = window.escapeHtml || escapeHtml;
  window.escapeAttr = window.escapeAttr || escapeAttr;
  window.formatChatNote = window.formatChatNote || formatChatNote;
  window._tierBadgeColors = window._tierBadgeColors || _tierBadgeColors;
}catch(e){}
