function _escapeRegExp(s){
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function _escJS(s){
  try{ return (typeof window.escJS === 'function') ? window.escJS(s) : String(s || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }catch(e){}
  return String(s || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}
function escapeHtml(text) { return window.escHTML(text); }
function escapeAttr(text) { return (typeof window.escAttr === 'function') ? window.escAttr(text) : escapeHtml(text); }
// 안내 문구(🔍/🎲 등) 뒤에 HTML 카드를 이어붙일 때 쓰는 한 줄 노트.
// 순수 "\n\n" 텍스트로 이어붙이면 html 포맷일 때 줄바꿈이 무시되므로 div로 감싼다.
function formatChatNote(text) {
  return `<div style="font-size:var(--fs-sm);color:#64748b;font-weight:700;margin-bottom:8px">${escapeHtml(text)}</div>`;
}
try{
  window._escapeRegExp = window._escapeRegExp || _escapeRegExp;
  window._escJS = window._escJS || _escJS;
  window.escapeHtml = window.escapeHtml || escapeHtml;
  window.escapeAttr = window.escapeAttr || escapeAttr;
  window.formatChatNote = window.formatChatNote || formatChatNote;
}catch(e){}
