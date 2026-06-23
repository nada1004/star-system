function _escapeRegExp(s){
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function _escJS(s){
  try{ return (typeof window.escJS === 'function') ? window.escJS(s) : String(s || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }catch(e){}
  return String(s || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}
function escapeHtml(text) { return window.escHTML(text); }
function escapeAttr(text) { return (typeof window.escAttr === 'function') ? window.escAttr(text) : escapeHtml(text); }
try{
  window._escapeRegExp = window._escapeRegExp || _escapeRegExp;
  window._escJS = window._escJS || _escJS;
  window.escapeHtml = window.escapeHtml || escapeHtml;
  window.escapeAttr = window.escapeAttr || escapeAttr;
}catch(e){}
