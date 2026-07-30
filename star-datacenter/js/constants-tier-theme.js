/* ══════════════════════════════════════════════════════════════
   상수 - 티어 뱃지/라벨/테마 색상 (constants.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

const _TIER_LABEL_MAP={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스',미정:'미정 (미확인)'};
function getTierLabel(tier){
  const icons=_TIER_ICON||_TIER_LABEL_ICONS_DEFAULT;
  const ic=icons[tier]||'';
  return ic?`${ic} ${_TIER_LABEL_MAP[tier]||tier}`:tier;
}

const _TIER_PILL_ICONS_DEFAULT={G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠️',유스:'🐣',미정:'❓'};
function getTierPillLabel(tier){
  const icons=_TIER_ICON||_TIER_PILL_ICONS_DEFAULT;
  return icons[tier]?`${icons[tier]} ${_TIER_LABEL_MAP[tier]||tier}`:tier;
}

// ── (설정) 티어 색상/이모지 커스텀 ──
const _TIER_THEME_KEY = 'su_tier_theme_v1';
const _TIER_DEFAULT_BG = {
  'G':'#5b21b6','K':'#1e3a8a','JA':'#0e6280','J':'#065f46','S':'#2952a3',
  '0티어':'#1d4ed8','1티어':'#2558d0','2티어':'#3268d8','3티어':'#4a7ee8',
  '4티어':'#6092f4','5티어':'#74a4f4','6티어':'#86b2ec','7티어':'#98bee4','8티어':'#a8c8dc',
  '유스':'#b45309','미정':'#94a3b8'
};
const _TIER_DEFAULT_TEXT = {
  '4티어':'#1a3a8a','5티어':'#1a3a8a','6티어':'#1d4ed8','7티어':'#1a4070','8티어':'#1a4070','미정':'#fff'
};
const _TIER_DEFAULT_ICON = {G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠',유스:'🐣',미정:'❓'};

let _TIER_BG = {..._TIER_DEFAULT_BG};      // base
let _TIER_TEXT = {..._TIER_DEFAULT_TEXT}; // base (optional overrides)
let _TIER_ICON = {..._TIER_DEFAULT_ICON};
let _TIER_SAT = 1.0; // 0.5~1.6
let _TIER_BRI = 1.0; // 0.6~1.6 (lightness multiplier)

function _clamp01(x){ return Math.max(0, Math.min(1, x)); }
function _rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if(max!==min){
    const d=max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=(g-b)/d + (g<b?6:0); break;
      case g: h=(b-r)/d + 2; break;
      case b: h=(r-g)/d + 4; break;
    }
    h/=6;
  }
  return {h,s,l};
}
function _hslToRgb(h,s,l){
  const hue2rgb=(p,q,t)=>{
    if(t<0) t+=1; if(t>1) t-=1;
    if(t<1/6) return p+(q-p)*6*t;
    if(t<1/2) return q;
    if(t<2/3) return p+(q-p)*(2/3-t)*6;
    return p;
  };
  let r,g,b;
  if(s===0){ r=g=b=l; }
  else{
    const q = l<0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l-q;
    r=hue2rgb(p,q,h+1/3);
    g=hue2rgb(p,q,h);
    b=hue2rgb(p,q,h-1/3);
  }
  return {r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255)};
}
function _rgbToHex(r,g,b){
  const to=(n)=>String(n.toString(16)).padStart(2,'0');
  return `#${to(Math.max(0,Math.min(255,r)))}${to(Math.max(0,Math.min(255,g)))}${to(Math.max(0,Math.min(255,b)))}`;
}
function _hexToRgb(hex){
  const {r,g,b}=_hexToRgbObj(hex);
  return {r,g,b};
}
function _tierFiltered(hex){
  try{
    const {r,g,b}=_hexToRgb(hex);
    const hsl=_rgbToHsl(r,g,b);
    const s=_clamp01(hsl.s * (isNaN(_TIER_SAT)?1:_TIER_SAT));
    const l=_clamp01(hsl.l * (isNaN(_TIER_BRI)?1:_TIER_BRI));
    const rgb=_hslToRgb(hsl.h, s, l);
    return _rgbToHex(rgb.r, rgb.g, rgb.b);
  }catch(e){
    return hex||'#64748b';
  }
}
function _autoTextColor(bgHex){
  try{
    const {r,g,b}=_hexToRgb(bgHex);
    // relative luminance
    const lum = (0.2126*r + 0.7152*g + 0.0722*b)/255;
    return lum > 0.62 ? '#0f172a' : '#ffffff';
  }catch(e){ return '#fff'; }
}

function getTierBtnColor(tier){
  const base = _TIER_BG[tier] || '#64748b';
  return _tierFiltered(base);
}
function getTierBtnTextColor(tier){
  const base = _TIER_TEXT[tier];
  if(base) return base;
  return _autoTextColor(getTierBtnColor(tier));
}

function getTierTheme(){
  return {
    bg: {..._TIER_BG},
    text: {..._TIER_TEXT},
    icon: {..._TIER_ICON},
    sat: _TIER_SAT,
    bri: _TIER_BRI
  };
}
function setTierTheme(patch){
  try{
    const cur=getTierTheme();
    const next={
      ...cur,
      ...patch,
      bg: {...cur.bg, ...(patch?.bg||{})},
      text: {...cur.text, ...(patch?.text||{})},
      icon: {...cur.icon, ...(patch?.icon||{})}
    };
    _TIER_BG = {..._TIER_DEFAULT_BG, ...next.bg};
    _TIER_TEXT = {..._TIER_DEFAULT_TEXT, ...next.text};
    _TIER_ICON = {..._TIER_DEFAULT_ICON, ...next.icon};
    _TIER_SAT = Math.max(0.5, Math.min(1.6, parseFloat(next.sat)||1));
    _TIER_BRI = Math.max(0.6, Math.min(1.6, parseFloat(next.bri)||1));
    localStorage.setItem(_TIER_THEME_KEY, JSON.stringify({
      bg:_TIER_BG, text:_TIER_TEXT, icon:_TIER_ICON, sat:_TIER_SAT, bri:_TIER_BRI
    }));
  }catch(e){}
}
function resetTierTheme(){
  try{
    localStorage.removeItem(_TIER_THEME_KEY);
    _TIER_BG = {..._TIER_DEFAULT_BG};
    _TIER_TEXT = {..._TIER_DEFAULT_TEXT};
    _TIER_ICON = {..._TIER_DEFAULT_ICON};
    _TIER_SAT = 1.0;
    _TIER_BRI = 1.0;
  }catch(e){}
}
// init
try{
  const raw = localStorage.getItem(_TIER_THEME_KEY);
  if(raw){
    const obj = JSON.parse(raw)||{};
    setTierTheme(obj);
  }
}catch(e){}
// expose for settings
window.getTierTheme = getTierTheme;
window.setTierTheme = setTierTheme;
window.resetTierTheme = resetTierTheme;

/* ══════════════════════════════════════
   직책 시스템
   - MAIN_ROLES: 정렬 순서에 영향, 표시+정렬
   - SUB_ROLES: 표시만 (학생회장, 오락부장 등)
══════════════════════════════════════ */
const MAIN_ROLES = ['이사장','동아리 회장','총장','부총장','총괄','교수','코치','대표'];
const ROLE_ICONS = {'이사장':'👔','동아리 회장':'🏅','총장':'🎓','부총장':'📚','총괄':'🏛️','교수':'🏫','코치':'🎯','대표':'👥'};
const ROLE_COLORS = {'이사장':'#6d28d9','동아리 회장':'#0f766e','총장':'#b91c1c','부총장':'#b45309','총괄':'#0c6e9e','교수':'#1d4ed8','코치':'#0e7490','대표':'#8b5cf6'};

const _ROLE_ORDER_MAP = {'대표':0,'이사장':0,'선장':0,'동아리장':0,'동아리 회장':0,'반장':0,'총장':1,'부총장':2,'총괄':2,'교수':3,'코치':4};
// 긴 키워드부터 검사해야 "총장"이 "부총장" 안의 부분 문자열로 먼저 걸려서 우선순위가
// 잘못 올라가는(부총장인데 총장 취급) 일을 막을 수 있다.
const _ROLE_ORDER_KEYS = Object.keys(_ROLE_ORDER_MAP).sort((a,b)=>b.length-a.length);
// 직책란에 "이사장&총장"처럼 여러 직책을 함께 적었을 때, 그 안에 포함된 MAIN_ROLES
// 키워드 중 하나를 찾아 반환한다(길이가 긴 키워드부터 검사). 아이콘/색상/직책자 여부 판정을
// MAIN_ROLES.includes(role) 같은 완전일치가 아니라 이 함수로 통일해야, 직책을 함께 적어도
// 뱃지 색상이 사라지거나 현황판에서 순서가 어긋나는 문제가 생기지 않는다.
const _MAIN_ROLE_KEYS_BY_LEN = [...MAIN_ROLES].sort((a,b)=>b.length-a.length);
function _roleMatchedMain(role){
  if(!role) return null;
  if(MAIN_ROLES.includes(role)) return role;
  for(const key of _MAIN_ROLE_KEYS_BY_LEN){
    if(role.includes(key)) return key;
  }
  return null;
}
function roleIsMain(role){ return !!_roleMatchedMain(role); }
