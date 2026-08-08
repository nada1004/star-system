/* ══════════════════════════════════════════════════════════════
   상수 - 앱 상태 데이터 로드 & 상태아이콘 스토어 & 매치ID 마이그레이션 (constants.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function getRoleOrder(role, player){
  // player.roleOrder가 숫자로 지정돼 있으면(직책 편집에서 "표시 순서 직접 지정") 자동 판정보다 우선한다.
  if(player && typeof player.roleOrder==='number' && !isNaN(player.roleOrder)) return player.roleOrder;
  // Representative=0, President=0, Captain=0, Club President=0, Class President=0, Dean=1, Vice Dean=2, Director=2(tie), Professor=3, Coach=4, Other=99
  if(!role) return 99;
  // 직책 필드에 "이사장 & 회장"처럼 두 직책을 함께 적어도, 그 안에 알려진 직책 키워드가
  // 하나라도 포함돼 있으면 그 키워드 기준 정렬 우선순위를 그대로 적용한다(현황판 순서 유지).
  if(role in _ROLE_ORDER_MAP) return _ROLE_ORDER_MAP[role];
  for(const key of _ROLE_ORDER_KEYS){
    if(role.includes(key)) return _ROLE_ORDER_MAP[key];
  }
  return 99;
}
function getRoleBadgeHTML(role, size='11px'){
  if(!role) return '';
  const _matched = _roleMatchedMain(role);
  const icon = ROLE_ICONS[_matched]||'🏷️';
  const col = ROLE_COLORS[_matched]||'#6b7280';
  // MAIN_ROLES는 진한 배경색, 그 외는 연한 배경
  const isMain = !!_matched;
  if(isMain){
    return `<span style="font-size:${size};padding:1px 5px;border-radius:5px;background:${col};color:#fff;font-weight:800;white-space:nowrap;flex-shrink:0;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.2)">${icon} ${role}</span>`;
  }
  return `<span style="font-size:${size};padding:1px 4px;border-radius:4px;background:${col}20;color:${col};border:1px solid ${col}44;font-weight:700;white-space:nowrap;flex-shrink:0">${icon} ${role}</span>`;
}

/* ══════════════════════════════════════
   DATA LOAD
   [FIX-18] J()와 _lsSave()는 파일 최상단으로 이동됨. 이 섹션에서는 제거.
══════════════════════════════════════ */

function _normalizeLoadedPlayers(list){
  try{
    let changed = false;
    const next = (Array.isArray(list) ? list : []).map(p=>{
      if(!p || typeof p !== 'object'){ changed = true; return null; }
      const n = { ...p };
      const rawType = String(n.gameType || '').trim().toLowerCase();
      if(rawType === 'general' || n.gameType === '종합게임'){
        n.gameType = 'starcraft';
        changed = true;
      }else if(!n.gameType){
        n.gameType = 'starcraft';
        changed = true;
      }
      if(!String(n.univ || '').trim()){
        n.univ = '무소속';
        changed = true;
      }
      if(!String(n.race || '').trim()){
        n.race = 'N';
        changed = true;
      }
      if(Object.prototype.hasOwnProperty.call(n, 'displayName')){
        delete n.displayName;
        changed = true;
      }
      if(Object.prototype.hasOwnProperty.call(n, 'crew')){
        delete n.crew;
        changed = true;
      }
      return n;
    }).filter(Boolean);
    try{ window._playerSchemaNeedsSave = window._playerSchemaNeedsSave || changed; }catch(e){}
    return next;
  }catch(e){
    return Array.isArray(list) ? list : [];
  }
}
// (복구/호환) su_p가 {v:2,p:[...],d:{...}} 형태여도 정상 동작하도록 unpack
function _unpackPlayers(raw){
  try{
    if(!raw) return [];
    if(Array.isArray(raw)) return _normalizeLoadedPlayers(raw);
    if(typeof raw!=='object') return [];
    if(raw.v!==2 || !Array.isArray(raw.p) || !raw.d) return [];
    const d=raw.d||{};
    const res=d.res||[], opp=d.opp||[], race=d.race||[], map=d.map||[], univ=d.univ||[], mode=d.mode||[];
    const get=(arr,i)=> (i==null||i<0)?'':(arr[i]||'');
    return _normalizeLoadedPlayers(raw.p.map(pp=>{
      const base = (pp && typeof pp === 'object') ? pp : {};
      const p={...base};
      const hp=Array.isArray(p.h)?p.h:[];
      p.history = hp.filter(r=>Array.isArray(r)).map(r=>({
        date: r[0]||'',
        time: r[1]||0,
        result: get(res, r[2]),
        opp: get(opp, r[3]),
        oppRace: get(race, r[4]),
        map: get(map, r[5]),
        matchId: r[6]||'',
        eloDelta: (r[7]===undefined?null:r[7]),
        univ: get(univ, r[8]),
        mode: get(mode, r[9]),
        score: r[10]||'',
        ...(r[11]?{_team:true}:{})
      }));
      delete p.h;
      return p;
    }));
  }catch(e){
    return [];
  }
}
function _stripPlayerHistoryForSave(player){
  const c={...(player||{})};
  delete c.history;
  return c;
}

let playersRaw = J('su_p')  || [];
const _playerStoreMeta = J('su_player_store_meta_v1') || {};
const _playerLegacyLoadEnabled = !_playerStoreMeta.migrated || _playerStoreMeta.backend==='localStorage' || !window.indexedDB;
if(!_playerLegacyLoadEnabled) playersRaw = [];
let players    = _unpackPlayers(playersRaw) || [];
// 사진 분리 저장 지원: su_pp에 {이름:base64} 형태로 저장된 사진을 players에 병합
(function(){ if(!_playerLegacyLoadEnabled) return; const _pp=J('su_pp');if(_pp&&typeof _pp==='object'&&Array.isArray(players))players.forEach(p=>{if(!p.photo&&_pp[p.name])p.photo=_pp[p.name];});})();
try{ window.players = players; }catch(e){}
try{ window.playerPhotos = _playerLegacyLoadEnabled ? (J('su_pp') || {}) : {}; }catch(e){}
try{
  if(window._playerSchemaNeedsSave){
    setTimeout(()=>{
      try{
        if(window._playerSchemaNeedsSave && typeof localSave === 'function'){
          localSave();
          window._playerSchemaNeedsSave = false;
        }
      }catch(e){}
    }, 0);
  }
}catch(e){}
var boardOrder = J('su_boardOrder') || []; // 현황판 대학 순서
var b2LabelAlpha  = J('su_b2la')  ?? 16;
var b2BgAlpha     = J('su_b2ba')  ?? 9;
var b2BgImgAlpha      = J('su_b2bia')  ?? 64;
var b2FreeBgAlpha     = J('su_b2fba')  ?? 25;
var b2FreeTierBgAlpha = J('su_b2ftba') ?? 15;
var b2ProfileBgAlpha  = J('su_b2pba') ?? 10;
function _b2AlphaHex(pct){ return Math.round((pct||0)/100*255).toString(16).padStart(2,'0'); }
var univCfg    = J('su_u')  || [{name:'흑카데미',color:'#1e3a8a'},{name:'JSA',color:'#c2410c'},{name:'늪지대',color:'#15803d'},{name:'무소속',color:'#6b7280'}];
// [FIX-BRIGHT-4] 이전에 이름으로 하드코딩되어 있던 "로고형 배경" 대학들을 1회성으로 uCfg.bgIsLogo=true로 마이그레이션
// (밝기는 이제 통일되지만, 로고가 중앙에 작게 배치되는 레이아웃은 그대로 유지)
try{
  if(!localStorage.getItem('su_biglogo_migrated_v1') && Array.isArray(univCfg)){
    const _legacyLogoNames = ['늇캐슬','뉴캣슬','캄몬스타즈','케이대','엠비대','와플대','수술대','흑카데미','HM','DM','SSG','JSA','BGM'];
    univCfg.forEach(u=>{
      if(!u || u.bgIsLogo!==undefined) return;
      const nm = String(u.name||'').trim();
      const nmU = nm.toUpperCase();
      if(_legacyLogoNames.includes(nm) || _legacyLogoNames.includes(nmU) || nm.includes('몬스타') || nmU.includes('MONSTAR')){
        u.bgIsLogo = true;
      }
    });
    localStorage.setItem('su_biglogo_migrated_v1','1');
  }
}catch(e){}
let maps       = J('su_m')  || ['투혼','서킷','블리츠','신 개마고원'];
let userMapAlias = J('su_mAlias') || {};   // 사용자 정의 맵 약자 { '약자': '전체이름' }
let tourD      = J('su_t')  || Array(15).fill('');
const _matchStoreMeta = J('su_match_store_meta_v1') || {};
const _matchLegacyLoadEnabled = !_matchStoreMeta.migrated || _matchStoreMeta.backend==='localStorage' || !window.indexedDB;
let miniM      = _matchLegacyLoadEnabled ? (J('su_mm') || []) : [];
let univM      = _matchLegacyLoadEnabled ? (J('su_um') || []) : [];
let comps      = _matchLegacyLoadEnabled ? (J('su_cm') || []) : [];
let ckM        = _matchLegacyLoadEnabled ? (J('su_ck') || []) : [];
let compNames  = J('su_cn') || [];
let curComp    = J('su_cc') || '';
// 프로리그 데이터
let proM       = _matchLegacyLoadEnabled ? (J('su_pro') || []) : [];
// 프로리그 개인 대회: [{id,name,groups:[{name,players:[],matches:[{a,b,winner,d,map}]}]}]
let proTourneys = _matchLegacyLoadEnabled ? (J('su_ptn') || []) : [];
let curProComp  = J('su_ptc') || '';
// 대회 조편성: [{id,name,groups:[{name,univs:[],matches:[{a,b,sa,sb,sets:[]}]}]}]
let tourneys   = _matchLegacyLoadEnabled ? (J('su_tn') || []) : [];
// (버그픽스,2026-08-06) 결과를 하나도 안 넣었는데 sa=0,sb=0으로 저장돼 "0:0 완료 경기"로
// 조별순위/브라켓에 승점이 잘못 반영되던 기존 데이터 정리. 실제 게임 결과가 있는 매치는 건드리지 않음.
(function _fixPhantomZeroMatches(){
  const hasResult = m => (m.sets||[]).some(st => (st.games||[]).some(g => g.winner==='A'||g.winner==='B'));
  let touched=false;
  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(m && m.sa===0 && m.sb===0 && !hasResult(m)){ m.sa=null; m.sb=null; touched=true; }
      });
    });
    if(tn.bracket && tn.bracket.matchDetails){
      Object.values(tn.bracket.matchDetails).forEach(m=>{
        if(m && m.sa===0 && m.sb===0 && !hasResult(m)){ m.sa=null; m.sb=null; touched=true; }
      });
    }
  });
  if(touched) window.addEventListener('DOMContentLoaded',()=>{ if(typeof save==='function') save(); });
})();
let ttM        = _matchLegacyLoadEnabled ? (J('su_ttm') || []) : [];
let _ttCurComp = J('su_ttcur') || '';
let _ttSub     = 'records';
let indM       = _matchLegacyLoadEnabled ? (J('su_indm') || []) : [];
let gjM        = _matchLegacyLoadEnabled ? (J('su_gjm')  || []) : [];
let notices    = J('su_notices') || [];
// (요청사항) 보라크루 기능 삭제: 기존 저장 키 정리
try{ localStorage.removeItem('su_crew'); localStorage.removeItem('su_crewcfg'); }catch(e){}

var BLD = {}; // ✅ var로 선언해야 window.BLD와 동일 객체로 IIFE 내부에서도 접근 가능
let openDetails = {};
let tierRankModeFilter = '전체';

// ── 선수별 상태 아이콘 시스템 ──────────────────────────────
const _ICON_META_KEY = 'su_icon_store_meta_v1';
const _ICON_META = J(_ICON_META_KEY) || {};
const _ICON_LEGACY_LOAD_ENABLED = !_ICON_META.migrated || _ICON_META.backend==='localStorage' || !window.indexedDB;
let playerStatusIcons = _ICON_LEGACY_LOAD_ENABLED ? (J('su_psi') || {}) : {};
let playerStatusExpiry = _ICON_LEGACY_LOAD_ENABLED ? (J('su_psi_expiry') || {}) : {};
const STATUS_ICON_DEFS = {
  none:    { label: '없음',     emoji: '' },
  fire:    { label: '🔥 불',    emoji: '🔥' },
  water:   { label: '💧 물',    emoji: '💧' },
  cloud:   { label: '☁️ 구름',  emoji: '☁️' },
  ice:     { label: '🧊 얼음',  emoji: '🧊' },
  up:      { label: '⬆️ 상승',  emoji: '⬆️' },
  down:    { label: '⬇️ 하락',  emoji: '⬇️' },
  lightning:{ label: '⚡ 벼락', emoji: '⚡' },
  chick:   { label: '🐣 병아리', emoji: '🐣' },
  tiger:   { label: '🐯 호랑이', emoji: '🐯' },
  lion:    { label: '🦁 사자',  emoji: '🦁' },
  cloudy:  { label: '🌥️ 흐림',  emoji: '🌥️' },
  smile:   { label: '😊 웃음',  emoji: '😊' },
  cry:     { label: '😭 울음',  emoji: '😭' },
  blank:   { label: '😐 생각없음', emoji: '😐' },
  sad:     { label: '😢 슬픔',  emoji: '😢' },
  sob:     { label: '😩 통곡',  emoji: '😩' },
  cool:    { label: '😎 COOL',  emoji: '😎' },
  star2:   { label: '⭐ 스타',  emoji: '⭐' },
  crown:   { label: '👑 왕관',  emoji: '👑' },
  hot2:    { label: '🥵 핫',    emoji: '🥵' },
  star3:   { label: '🌟 빛나는별',emoji: '🌟' },
  new2:    { label: '🆕 NEW',   emoji: '🆕' },
  trophy:  { label: '🏆 트로피', emoji: '🏆' },
  diamond: { label: '💎 다이아', emoji: '💎' },
  skull:   { label: '💀 해골',  emoji: '💀' },
  muscle:  { label: '💪 강함',  emoji: '💪' },
  think:   { label: '🤔 생각중',emoji: '🤔' },
  sleep:   { label: '😴 수면',  emoji: '😴' },
  boom:    { label: '🤯 폭발',  emoji: '🤯' },
  cold:    { label: '🥶 추움',  emoji: '🥶' },
  party:   { label: '🎉 파티',  emoji: '🎉' },
  dizzy:   { label: '💫 어지러움',emoji:'💫' },
  clown:   { label: '🤡 광대',  emoji: '🤡' },
  angry:   { label: '😤 화남',  emoji: '😤' },
  target:  { label: '🎯 집중',  emoji: '🎯' },
  ghost:   { label: '👻 유령',  emoji: '👻' },
  game:    { label: '🎮 게임',  emoji: '🎮' },
  sword:   { label: '🗡️ 검',    emoji: '🗡️' },
  gold:    { label: '🥇 금메달',emoji: '🥇' },
  princess:{ label: '👸 공주',  emoji: '👸' },
  sprout:  { label: '🌱 새싹',  emoji: '🌱' },
  chick:   { label: '🐥 병아리',emoji: '🐥' },
};
// ── 커스텀 URL 아이콘 ──
let _customStatusIcons = _ICON_LEGACY_LOAD_ENABLED ? (J('su_si_customs') || []) : [];
function _rebuildCustomStatusDefs(){
  Object.keys(STATUS_ICON_DEFS).filter(k=>k.startsWith('_c')).forEach(k=>delete STATUS_ICON_DEFS[k]);
  if(!Array.isArray(_customStatusIcons)) _customStatusIcons = [];
  _customStatusIcons.forEach((c,i)=>{ STATUS_ICON_DEFS['_c'+i]={label:c.label||'커스텀'+(i+1),emoji:c.emoji}; });
}
_rebuildCustomStatusDefs();
function _iconDefaultState(){
  return {playerStatusIcons:{}, playerStatusExpiry:{}, customStatusIcons:[]};
}
function _iconNormalizeState(v){
  const s=v||{};
  return {
    playerStatusIcons:(s.playerStatusIcons && typeof s.playerStatusIcons==='object' && !Array.isArray(s.playerStatusIcons)) ? s.playerStatusIcons : {},
    playerStatusExpiry:(s.playerStatusExpiry && typeof s.playerStatusExpiry==='object' && !Array.isArray(s.playerStatusExpiry)) ? s.playerStatusExpiry : {},
    customStatusIcons:Array.isArray(s.customStatusIcons) ? s.customStatusIcons : []
  };
}
function _iconApplyState(v){
  const s=_iconNormalizeState(v);
  playerStatusIcons = s.playerStatusIcons ? {...s.playerStatusIcons} : {};
  playerStatusExpiry = s.playerStatusExpiry ? {...s.playerStatusExpiry} : {};
  _customStatusIcons = Array.isArray(s.customStatusIcons) ? [...s.customStatusIcons] : [];
  _rebuildCustomStatusDefs();
  return s;
}
function _iconLoadMeta(){
  try{ return JSON.parse(localStorage.getItem(_ICON_META_KEY)||'null')||{}; }catch(e){ return {}; }
}
function _iconSaveMeta(state){
  try{
    localStorage.setItem(_ICON_META_KEY, JSON.stringify({
      migrated: !!state?.migrated,
      backend: state?.backend || '',
      updatedAt: Date.now()
    }));
  }catch(e){}
}
function _iconLegacyLoad(){
  return _iconNormalizeState({
    playerStatusIcons:J('su_psi')||{},
    playerStatusExpiry:J('su_psi_expiry')||{},
    customStatusIcons:J('su_si_customs')||[]
  });
}
function _iconLegacySave(state){
  const s=_iconNormalizeState(state);
  try{
    _lsSave('su_psi', s.playerStatusIcons);
    _lsSave('su_psi_expiry', s.playerStatusExpiry);
    _lsSave('su_si_customs', s.customStatusIcons);
    return true;
  }catch(e){
    console.warn('[_iconLegacySave] localStorage 저장 실패:', e.message);
    return false;
  }
}
function _iconClearLegacyKeys(){
  ['su_psi','su_psi_expiry','su_si_customs'].forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });
}
function _iconIdbAvailable(){
  try{ return !!window.indexedDB; }catch(e){ return false; }
}
function _iconIdbOpen(){
  return new Promise((resolve,reject)=>{
    try{
      if(!_iconIdbAvailable()){ resolve(null); return; }
      const req = indexedDB.open('star_datacenter_icons', 2);
      req.onupgradeneeded = (ev)=>{
        const db = ev.target.result;
        if(!db.objectStoreNames.contains('icon_payloads')) db.createObjectStore('icon_payloads');
      };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('icon indexedDB open failed'));
    }catch(e){ reject(e); }
  });
}
async function _iconIdbGet(){
  const db = await _iconIdbOpen();
  if(!db) return null;
  return await new Promise((resolve,reject)=>{
    try{
      const tx = db.transaction('icon_payloads','readonly');
      const req = tx.objectStore('icon_payloads').get('main');
      req.onsuccess = ()=>resolve(_iconNormalizeState(req.result||null));
      req.onerror = ()=>reject(req.error || new Error('icon indexedDB get failed'));
    }catch(e){ reject(e); }
  });
}
async function _iconIdbSet(state){
  const db = await _iconIdbOpen();
  if(!db) return false;
  return await new Promise((resolve,reject)=>{
    try{
      const tx = db.transaction('icon_payloads','readwrite');
      tx.objectStore('icon_payloads').put(_iconNormalizeState(state), 'main');
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error || new Error('icon indexedDB put failed'));
    }catch(e){ reject(e); }
  });
}
window._iconStoreInitPromise = window._iconStoreInitPromise || null;
async function _iconInitStorage(){
  if(window._iconStoreInitPromise) return window._iconStoreInitPromise;
  window._iconStoreInitPromise = (async()=>{
    try{
      const meta=_iconLoadMeta();
      const useLegacy = !_iconIdbAvailable() || meta.backend==='localStorage' || !meta.migrated;
      if(useLegacy){
        const legacy=_iconLegacyLoad();
        _iconApplyState(legacy);
        if(_iconIdbAvailable()){
          try{
            await _iconIdbSet(legacy);
            _iconClearLegacyKeys();
            _iconSaveMeta({migrated:true, backend:'indexedDB'});
          }catch(e){
            console.warn('[_iconInitStorage] legacy -> indexedDB 이전 실패:', e.message);
            _iconSaveMeta({migrated:false, backend:'localStorage'});
          }
        }else{
          _iconSaveMeta({migrated:false, backend:'localStorage'});
        }
        try{ if(typeof render==='function') setTimeout(()=>render(),0); }catch(e){}
        return legacy;
      }
      const fromIdb = await _iconIdbGet();
      const next = fromIdb || _iconDefaultState();
      _iconApplyState(next);
      _iconSaveMeta({migrated:true, backend:'indexedDB'});
      try{ if(typeof render==='function') setTimeout(()=>render(),0); }catch(e){}
      return next;
    }catch(e){
      console.warn('[_iconInitStorage] 초기화 실패:', e.message);
      const legacy=_iconLegacyLoad();
      _iconApplyState(legacy);
      _iconSaveMeta({migrated:false, backend:'localStorage'});
      try{ if(typeof render==='function') setTimeout(()=>render(),0); }catch(e){}
      return legacy;
    }
  })();
  return window._iconStoreInitPromise;
}
function _iconSnapshot(){
  return _iconNormalizeState({playerStatusIcons, playerStatusExpiry, customStatusIcons:_customStatusIcons});
}
function _iconPersistState(){
  const snap=_iconSnapshot();
  if(!_iconIdbAvailable()){
    _iconLegacySave(snap);
    _iconSaveMeta({migrated:false, backend:'localStorage'});
    return;
  }
  Promise.resolve().then(()=>_iconIdbSet(snap)).then(()=>{
    _iconClearLegacyKeys();
    _iconSaveMeta({migrated:true, backend:'indexedDB'});
  }).catch(err=>{
    console.warn('[_iconPersistState] indexedDB 저장 실패:', err && err.message ? err.message : err);
    _iconLegacySave(snap);
    _iconSaveMeta({migrated:false, backend:'localStorage'});
  });
}
function addCustomStatusIcon(label, emoji){
  if(!emoji) return;
  _customStatusIcons.push({label:label||'커스텀',emoji});
  _rebuildCustomStatusDefs();
  _iconPersistState();
}
function removeCustomStatusIcon(idx){
  _customStatusIcons.splice(idx,1);
  _rebuildCustomStatusDefs();
  _iconPersistState();
}
function _siIsImg(v){ return typeof v==='string'&&(v.startsWith('http')||v.startsWith('data:')); }
function _siRender(emoji, size){ size=size||'16px'; if(!emoji)return''; if(_siIsImg(emoji))return`<img src="${emoji}" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`; return emoji; }

// (혼합 콘텐츠 방지) http:// 이미지를 https://로 자동 보정 (가능한 경우)
function toHttpsUrl(u){
  const s = String(u||'');
  return s.startsWith('http://') ? ('https://' + s.slice('http://'.length)) : s;
}
// 프로필 사진 썸네일 URL (images.weserv.nl 리사이즈 프록시)
// 사용자가 imgur/디스코드 등에 올린 원본(수백KB~수MB, 고해상도)을
// 실제 표시 크기(px)에 맞게 축소+webp 재인코딩하여 전송량/디코딩 비용을 크게 줄인다.
function toThumbUrl(u, px){
  const s = toHttpsUrl(u);
  if(!s || !/^https:\/\//.test(s)) return s; // data: 등은 그대로 통과
  if(s.indexOf('images.weserv.nl') !== -1) return s; // 이미 프록시된 URL이면 중복 방지
  try{
    const dpr = (typeof window!=='undefined' && window.devicePixelRatio > 1) ? 2 : 1;
    const w = Math.max(32, Math.min(640, Math.round((parseInt(px,10)||64) * dpr)));
    const encoded = encodeURIComponent(s.replace(/^https?:\/\//,''));
    return 'https://images.weserv.nl/?url='+encoded+'&w='+w+'&h='+w+'&fit=cover&we=1&output=webp&q=78';
  }catch(e){ return s; }
}
// 정사각형으로 자르지 않고 원본 비율을 유지한 채 최대 너비만 제한 (배너/상세 사진 등)
function toScaledUrl(u, maxPx){
  const s = toHttpsUrl(u);
  if(!s || !/^https:\/\//.test(s)) return s;
  if(s.indexOf('images.weserv.nl') !== -1) return s;
  try{
    const dpr = (typeof window!=='undefined' && window.devicePixelRatio > 1) ? 2 : 1;
    const w = Math.max(64, Math.min(1200, Math.round((parseInt(maxPx,10)||480) * dpr)));
    const encoded = encodeURIComponent(s.replace(/^https?:\/\//,''));
    return 'https://images.weserv.nl/?url='+encoded+'&w='+w+'&we=1&output=webp&q=80';
  }catch(e){ return s; }
}
// ══════════════════════════════════════════════════════════
// 공용: 썸네일에 마우스를 올리면 두번째 프로필 이미지가 미리보기(스크럽)로 표시되는 기능
// 스트리머탭 / 현황판 / 티어 순위표 / 각종 상세·공유 팝업 등 어디서든 재사용
// - PC(마우스 hover 가능한 포인터)에서만 동작, 터치 기기에서는 동작 안 함
// - 썸네일 우측 절반에 마우스가 있을 때만 두번째 이미지 표시
// 사용법: 감싸는 요소에 class="ph-swap" 지정 + _phSwap2ndHTML(secondUrl)을 그 요소 내부에 삽입
// ══════════════════════════════════════════════════════════
function _phSwapIsVideoUrl(u){
  const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
  return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
}
function _phSwap2ndHTML(secondUrl, opt){
  const raw = String(secondUrl||'').trim();
  if(!raw) return '';
  const cls = 'ph-swap-2' + (opt && opt.extraClass ? (' '+opt.extraClass) : '');
  const fitStyle = (opt && opt.style) ? opt.style : '';
  if(_phSwapIsVideoUrl(raw)){
    const src = toHttpsUrl(raw);
    return `<video class="${cls}" src="${src}" muted playsinline loop preload="metadata" style="${fitStyle}"></video>`;
  }
  const isGif = /\.gif(\?|$)/i.test(raw);
  // gif는 toScaledUrl(webp변환 프록시)을 거치면 정지 이미지가 되므로 원본 URL을 그대로 사용
  const src = isGif ? toHttpsUrl(raw) : toScaledUrl(raw, (opt && opt.px) || 320);
  const orig = toHttpsUrl(raw);
  return `<img class="${cls}" src="${src}" data-orig="${orig}" loading="lazy" decoding="async" alt="" style="${fitStyle}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.remove()}">`;
}
(function(){
  if(window._phSwapDelegatedInit) return; // 중복 등록 방지
  window._phSwapDelegatedInit = true;
  const _isPcHover = () => !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  document.addEventListener('mousemove', function(e){
    if(!_isPcHover()) return;
    const wrap = e.target && e.target.closest ? e.target.closest('.ph-swap') : null;
    if(!wrap) return;
    const sec = wrap.querySelector('.ph-swap-2');
    if(!sec) return;
    const rect = wrap.getBoundingClientRect();
    if(!rect.width) return;
    const x = e.clientX - rect.left;
    if(x > rect.width / 2) sec.classList.add('is-visible');
    else sec.classList.remove('is-visible');
  }, {passive:true});
  document.addEventListener('mouseout', function(e){
    const wrap = e.target && e.target.closest ? e.target.closest('.ph-swap') : null;
    if(!wrap) return;
    if(e.relatedTarget && wrap.contains(e.relatedTarget)) return;
    const sec = wrap.querySelector('.ph-swap-2');
    if(sec) sec.classList.remove('is-visible');
  }, {passive:true});
})();

// 썸네일 프록시 실패 시 원본으로 폴백 → 그래도 실패하면 숨김. onerror 핸들러에서 공용으로 호출.
function _thumbFallback(el){
  try{
    if(!el) return;
    const orig = el.getAttribute('data-orig');
    if(orig && el.src !== orig){ el.onerror = function(){ this.style.display='none'; }; el.src = orig; }
    else { el.style.display='none'; }
  }catch(e){ try{ el.style.display='none'; }catch(e2){} }
}
function getStatusIcon(name){
  const expiry = playerStatusExpiry[name];
  if(expiry && expiry < new Date().toISOString().slice(0,10)){
    delete playerStatusIcons[name];
    delete playerStatusExpiry[name];
    _iconPersistState();
    return '';
  }
  return playerStatusIcons[name]||'';
}
function setStatusIcon(name, iconId, expiryDate){
  if(!iconId||iconId==='none'){
    delete playerStatusIcons[name];
    delete playerStatusExpiry[name];
  } else {
    playerStatusIcons[name]=STATUS_ICON_DEFS[iconId]?.emoji||iconId;
    if(expiryDate) playerStatusExpiry[name]=expiryDate;
    else delete playerStatusExpiry[name];
  }
  _iconPersistState();
}
function onStatusExpiryChange(playerName){
  const expiryChk = document.getElementById('ed-icon-expiry');
  const curIcon = playerStatusIcons[playerName];
  if(!curIcon) return;
  let expiryDate = null;
  if(expiryChk && expiryChk.checked){
    const d = new Date(); d.setDate(d.getDate()+10);
    expiryDate = d.toISOString().slice(0,10);
  }
  if(expiryDate) playerStatusExpiry[playerName] = expiryDate;
  else delete playerStatusExpiry[playerName];
  _iconPersistState();
  const lbl = document.getElementById('ed-icon-label');
  if(lbl){
    const found = Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===curIcon);
    const expTxt = expiryDate ? ` (${expiryDate} 만료)` : '';
    lbl.textContent = '선택: ' + (found ? found[1].label : '없음') + expTxt;
  }
}
function setStatusIconFromModal(btn, playerName, iconId){
  const expiryChk = document.getElementById('ed-icon-expiry');
  let expiryDate = null;
  if(expiryChk && expiryChk.checked && iconId && iconId !== 'none'){
    const d = new Date(); d.setDate(d.getDate()+10);
    expiryDate = d.toISOString().slice(0,10);
  }
  setStatusIcon(playerName, iconId, expiryDate);
  const container = btn.closest('#ed-icon-btns') || btn.parentElement;
  if(container){
    container.querySelectorAll('button[data-icon-id]').forEach(b=>{
      const sel = b.dataset.iconId === iconId;
      b.style.border = '2px solid '+(sel?'#16a34a':'var(--border)');
      b.style.background = sel?'#dcfce7':'var(--white)';
    });
  }
  const lbl = document.getElementById('ed-icon-label');
  if(lbl){
    const d=STATUS_ICON_DEFS[iconId];
    const expTxt = expiryDate ? ` (${expiryDate} 만료)` : '';
    lbl.textContent='선택: '+(d?d.label:'없음')+expTxt;
  }
  // 만료 체크박스 표시 제어
  const expiryRow = document.getElementById('ed-icon-expiry-row');
  if(expiryRow) expiryRow.style.display = (!iconId||iconId==='none') ? 'none' : 'flex';
}
function saveCustomStatusIcon(slot, emoji){
  localStorage.setItem('su_si_c'+slot, emoji);
  const k='custom'+slot;
  if(STATUS_ICON_DEFS[k]) STATUS_ICON_DEFS[k].emoji=emoji;
}
try{ _iconInitStorage(); }catch(e){}
const SU_MATCH_ID_MIGRATION_KEY = 'su_match_id_migrated_v1';
function _ensureObjId(obj, key){
  if(!obj || typeof obj !== 'object') return false;
  if(obj[key]) return false;
  obj[key] = genId();
  return true;
}
function _ensureMatchArrayIds(arr){
  let changed = false;
  (Array.isArray(arr) ? arr : []).forEach(m=>{
    if(!m || typeof m !== 'object') return;
    if(_ensureObjId(m, '_id')) changed = true;
  });
  return changed;
}
function _ensureNestedCompetitionIds(arr){
  let changed = false;
  (Array.isArray(arr) ? arr : []).forEach(m=>{
    if(!m || typeof m !== 'object') return;
    if(_ensureObjId(m, '_id')) changed = true;
  });
  return changed;
}
function _ensureTourneyIds(list){
  let changed = false;
  (Array.isArray(list) ? list : []).forEach(tn=>{
    if(!tn || typeof tn !== 'object') return;
    if(_ensureObjId(tn, 'id')) changed = true;
    const touchMatch = (m)=>{
      if(!m || typeof m !== 'object') return;
      if(_ensureObjId(m, '_id')) changed = true;
    };
    (Array.isArray(tn.groups) ? tn.groups : []).forEach(g=>{
      (Array.isArray(g && g.matches) ? g.matches : []).forEach(touchMatch);
    });
    if(Array.isArray(tn.matches)) tn.matches.forEach(touchMatch);
    if(tn.thirdPlace) touchMatch(tn.thirdPlace);
    if(tn.final) touchMatch(tn.final);
    if(Array.isArray(tn.manualMatches)) tn.manualMatches.forEach(touchMatch);
    if(tn.matchDetails && typeof tn.matchDetails === 'object'){
      Object.values(tn.matchDetails).forEach(touchMatch);
    }
  });
  return changed;
}
function _ensureLegacyMatchIdsOnce(){
  try{
    if(localStorage.getItem(SU_MATCH_ID_MIGRATION_KEY) === '1') return false;
  }catch(e){}
  let changed = false;
  changed = _ensureMatchArrayIds(miniM) || changed;
  changed = _ensureMatchArrayIds(univM) || changed;
  changed = _ensureMatchArrayIds(ckM) || changed;
  changed = _ensureMatchArrayIds(proM) || changed;
  changed = _ensureMatchArrayIds(ttM) || changed;
  changed = _ensureMatchArrayIds(indM) || changed;
  changed = _ensureMatchArrayIds(gjM) || changed;
  changed = _ensureNestedCompetitionIds(comps) || changed;
  changed = _ensureTourneyIds(tourneys) || changed;
  try{ localStorage.setItem(SU_MATCH_ID_MIGRATION_KEY, '1'); }catch(e){}
  if(changed){
    try{ localSave(); }catch(e){}
  }
  return changed;
}
function fixPoints(){
  try{ _ensureLegacyMatchIdsOnce(); }catch(e){}
  // 구 티어명 → 새 약어 마이그레이션
  const tierMap={god:'G',king:'K',jack:'JA',joker:'J',spade:'S'};
  players.forEach(p=>{
    if(!p.history)p.history=[];
    if(p.points===undefined)p.points=0;
    if(!p.win)p.win=0; if(!p.loss)p.loss=0;
    if(!p.gender || !['M','F'].includes(p.gender))p.gender='M';
    if(tierMap[p.tier])p.tier=tierMap[p.tier]; // 기존 데이터 자동 변환
  });
}

// (정렬 보강) 저장 전 날짜 내림차순 정렬 — 과거 날짜 경기를 나중에 저장해도 순서 유지
function _sortMatchArrByDate(arr){
  if(!Array.isArray(arr)||arr.length<2) return;
  const _nd=(d)=>{
    const s=String(d||'').trim();
    const m=s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if(m) return `${m[1]}-${String(parseInt(m[2],10)).padStart(2,'0')}-${String(parseInt(m[3],10)).padStart(2,'0')}`;
    return s;
  };
  arr.sort((a,b)=>{
    const da=_nd(a.d||''), db=_nd(b.d||'');
    if(da&&db&&da!==db) return db.localeCompare(da);
    return 0;
  });
}

// ══════════════════════════════════════════════════════════
// 아래 코드는 분리된 파일로 이동됨:
//   constants-save.js     — localSave / saveCfg / savePhotos / 클라우드 저장
//   constants-game.js     — ELO / 게임결과 / 대학유틸 / 이름정규화 / histPage 등
//   constants-tab-colors.js — 탭 버튼 색상 커스텀 시스템
// ══════════════════════════════════════════════════════════
