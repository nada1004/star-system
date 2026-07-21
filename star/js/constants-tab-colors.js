// ══════════════════════════════════════════════════════════
// constants-tab-colors.js — 탭 버튼 색상 커스텀 시스템 (constants.js 에서 분리)
// 의존: constants.js (J, _lsSave)
// ══════════════════════════════════════════════════════════

const _TAB_COLOR_KEY = 'su_tab_colors_v1';
const _TAB_COLOR_ENABLED_KEY = 'su_tab_color_enabled';
const _TAB_COLOR_MODE_KEY = 'su_tab_color_mode';
const _TAB_COLOR_LENGTH_KEY = 'su_tab_color_length';
const _TAB_COLOR_TAIL_KEY = 'su_tab_color_tail';
const _TAB_COLOR_DEFAULTS = {
  mergedComp: {
    comp:     { from:'#0f172a', to:'#1d4ed8', label:'일반 대회' },
    tiertour: { from:'#4c1d95', to:'#7c3aed', label:'티어대회' }
  },
  mergedUniv: {
    civil:  { from:'#7f1d1d', to:'#b91c1c', label:'시빌워' },
    mini:   { from:'#3b0764', to:'#7c3aed', label:'미니대전' },
    univm:  { from:'#064e3b', to:'#059669', label:'대학대전' },
    univck: { from:'#78350f', to:'#d97706', label:'대학CK' }
  },
  mergedInd: {
    ind: { from:'#0f172a', to:'#1d4ed8', label:'개인전' },
    gj:  { from:'#7f1d1d', to:'#dc2626', label:'끝장전' }
  },
  mergedPro: {
    pro:  { from:'#14532d', to:'#16a34a', label:'프로리그 일반' },
    gj:   { from:'#7f1d1d', to:'#dc2626', label:'프로 끝장전' },
    comp: { from:'#0f172a', to:'#1d4ed8', label:'프로리그 대회' }
  }
};
function getTabColorStyle(ctx, id){
  try{
    if(localStorage.getItem(_TAB_COLOR_ENABLED_KEY)==='0') return '';
  }catch(e){}
  let mode = 'fill';
  try{
    const raw = String(localStorage.getItem(_TAB_COLOR_MODE_KEY)||'fill').trim();
    if(['fill','soft','outline','solid'].includes(raw)) mode = raw;
  }catch(e){}
  let len = 48;
  let tail = 22;
  try{ len = Math.max(20, Math.min(90, parseInt(localStorage.getItem(_TAB_COLOR_LENGTH_KEY)||'48',10) || 48)); }catch(e){}
  try{ tail = Math.max(0, Math.min(60, parseInt(localStorage.getItem(_TAB_COLOR_TAIL_KEY)||'22',10) || 22)); }catch(e){}
  let from = '';
  let to = '';
  try{
    const saved = JSON.parse(localStorage.getItem(_TAB_COLOR_KEY)||'{}');
    const c = (saved[ctx]||{})[id];
    if(c && c.from && c.to){ from = c.from; to = c.to; }
    else if(c && c.from){ from = c.from; to = c.from; }
  }catch(e){}
  try{
    const def = (_TAB_COLOR_DEFAULTS[ctx]||{})[id];
    if(!from && def){
      from = def.from || '';
      to = def.to || def.from || '';
    }
  }catch(e){}
  if(!from && !to) return '';
  const main = to || from;
  const stop1 = Math.max(8, Math.min(78, len));
  const stop2 = Math.max(stop1 + 8, Math.min(96, stop1 + 20));
  const darkA = Math.max(0, Math.min(0.28, tail/100 * 0.32)).toFixed(3);
  const darkB = Math.max(0, Math.min(0.18, tail/100 * 0.18)).toFixed(3);
  const fullBg = `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 42%, rgba(15,23,42,${darkB}) 84%, rgba(15,23,42,${darkA}) 100%), linear-gradient(135deg, ${from} 0%, ${to} ${stop1}%, ${to} ${stop2}%, ${main} 100%)`;
  const softBg = `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 46%, rgba(15,23,42,${(tail/100*0.11).toFixed(3)}) 88%, rgba(15,23,42,${(tail/100*0.17).toFixed(3)}) 100%), linear-gradient(135deg, ${from}22 0%, ${to}14 ${stop1}%, ${to}0A ${stop2}%, ${main}10 100%)`;
  if(mode==='soft'){
    return `background:${softBg} !important;border-color:${main}44 !important;color:${main} !important;box-shadow:0 8px 18px ${main}18 !important,inset 0 0 0 1px ${main}16 !important;`;
  }
  if(mode==='outline'){
    return `background:linear-gradient(180deg,#ffffff,#f8fafc) !important;border:1.5px solid ${main}55 !important;color:${main} !important;box-shadow:0 6px 16px ${main}16 !important,inset 0 0 0 1px ${from}14 !important;`;
  }
  if(mode==='solid'){
    return `background:linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 52%, rgba(15,23,42,${darkB}) 86%, rgba(15,23,42,${darkA}) 100%), ${main} !important;border-color:${main}66 !important;color:#fff !important;box-shadow:0 12px 24px ${main}30 !important;`;
  }
  return `background:${fullBg} !important;border-color:${main}55 !important;color:#fff !important;box-shadow:0 12px 24px ${main}26 !important;`;
}
function setTabColor(ctx, id, from, to){
  try{
    const saved = JSON.parse(localStorage.getItem(_TAB_COLOR_KEY)||'{}');
    if(!saved[ctx]) saved[ctx]={};
    saved[ctx][id] = { from: String(from||''), to: String(to||'') };
    localStorage.setItem(_TAB_COLOR_KEY, JSON.stringify(saved));
  }catch(e){}
}
function resetTabColor(ctx, id){
  try{
    const saved = JSON.parse(localStorage.getItem(_TAB_COLOR_KEY)||'{}');
    if(saved[ctx]) delete saved[ctx][id];
    localStorage.setItem(_TAB_COLOR_KEY, JSON.stringify(saved));
  }catch(e){}
}
function resetAllTabColors(){
  try{ localStorage.removeItem(_TAB_COLOR_KEY); }catch(e){}
}
try{
  window.getTabColorStyle = getTabColorStyle;
  window.setTabColor = setTabColor;
  window.resetTabColor = resetTabColor;
  window.resetAllTabColors = resetAllTabColors;
  window._TAB_COLOR_DEFAULTS = _TAB_COLOR_DEFAULTS;
  window._TAB_COLOR_KEY = _TAB_COLOR_KEY;
  window._TAB_COLOR_ENABLED_KEY = _TAB_COLOR_ENABLED_KEY;
  window._TAB_COLOR_MODE_KEY = _TAB_COLOR_MODE_KEY;
  window._TAB_COLOR_LENGTH_KEY = _TAB_COLOR_LENGTH_KEY;
  window._TAB_COLOR_TAIL_KEY = _TAB_COLOR_TAIL_KEY;
}catch(e){}
