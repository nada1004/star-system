/* ══════════════════════════════════════
   CONSTANTS - 티어 순서: god > king > jack > joker > spade > 0티어 > 1티어 ...
══════════════════════════════════════ */
let TIERS = (()=>{const t=J('su_tiers')||['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스'];if(!t.includes('미정'))t.push('미정');return t;})();
const RACES=['T','Z','P','N'];
const RNAME={T:'테란',Z:'저그',P:'프로토스',N:'종족미정'};
const RANK_PTS={'🥇 1위':3,'🥈 2위':0,'🥉 3위':-3,'4강':0,'8강':0,'출전':0};
function escJS(s){
  return String(s??'')
    .replace(/\\/g,'\\\\')
    .replace(/'/g,"\\'")
    .replace(/\r/g,'\\r')
    .replace(/\n/g,'\\n');
}
function escAttr(s){
  return String(s??'')
    .replace(/&/g,'&amp;')
    .replace(/"/g,'&quot;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function getTierBadge(tier){
  if(!tier) return '';
  // 현황판과 동일한 _TIER_BG / _TIER_TEXT 색상 사용
  const icons={'G':'✨','K':'👑','JA':'⚔️','J':'🃏','S':'♠','유스':'🐣','미정':'❓'};
  const ic=icons[tier]||'';
  const bg=_TIER_BG[tier]||'#64748b';
  const col=_TIER_TEXT[tier]||'#fff';
  // 현황판과 동일한 그라디언트 스타일 (box-shadow 포함)
  const shadowMap={
    'G':'0 2px 14px rgba(124,58,237,.55),0 0 0 1px rgba(167,139,250,.3)',
    'K':'0 2px 10px rgba(26,42,82,.5),0 0 0 1px rgba(226,201,126,.2)',
    'JA':'0 2px 10px rgba(12,74,92,.5)',
    'J':'0 2px 10px rgba(6,78,59,.5)',
    'S':'0 2px 10px rgba(30,58,95,.5)',
  };
  const shadow=shadowMap[tier]||'0 1px 5px rgba(0,0,0,.25)';
  return `<span class="tbadge" style="background:${bg};color:${col};box-shadow:${shadow};border-radius:6px;padding:3px 8px;font-size:11px;font-weight:800;letter-spacing:.3px;white-space:nowrap;display:inline-flex;align-items:center;gap:3px">${ic?ic+' ':''}${tier}</span>`;
}

function getTierLabel(tier){
  const icons={G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠',유스:'🐣',미정:'❓'};
  const labels={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스',미정:'미정 (미확인)'};
  const ic=icons[tier]||'';
  return ic?`${ic} ${labels[tier]||tier}`:tier;
}

function getTierPillLabel(tier){
  const icons={G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠️',유스:'🐣',미정:'❓'};
  const labels={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스',미정:'미정 (미확인)'};
  return icons[tier]?`${icons[tier]} ${labels[tier]||tier}`:tier;
}

// 티어 필터 버튼 색상 — 현황판(TIER_FIXED_COLORS)과 완전히 동일
const _TIER_BG = {
  'G':'#5b21b6','K':'#1e3a8a','JA':'#0e6280','J':'#065f46','S':'#2952a3',
  '0티어':'#1d4ed8','1티어':'#2558d0','2티어':'#3268d8','3티어':'#4a7ee8',
  '4티어':'#6092f4','5티어':'#74a4f4','6티어':'#86b2ec','7티어':'#98bee4','8티어':'#a8c8dc',
  '유스':'#b45309','미정':'#94a3b8'
};
const _TIER_TEXT = {
  '4티어':'#1a3a8a','5티어':'#1a3a8a','6티어':'#1d4ed8','7티어':'#1a4070','8티어':'#1a4070','미정':'#fff'
};
function getTierBtnColor(tier){ return _TIER_BG[tier]||'#64748b'; }
function getTierBtnTextColor(tier){ return _TIER_TEXT[tier]||'#fff'; }

/* ══════════════════════════════════════
   직책 시스템
   - MAIN_ROLES: 정렬 순서에 영향, 표시+정렬
   - SUB_ROLES: 표시만 (학생회장, 오락부장 등)
══════════════════════════════════════ */
const MAIN_ROLES = ['이사장','동아리 회장','총장','부총장','총괄','교수','코치','대표'];
const ROLE_ICONS = {'이사장':'👔','동아리 회장':'🏅','총장':'🎓','부총장':'📚','총괄':'🏛️','교수':'🏫','코치':'🎯','대표':'👥'};
const ROLE_COLORS = {'이사장':'#6d28d9','동아리 회장':'#0f766e','총장':'#b91c1c','부총장':'#b45309','총괄':'#0c6e9e','교수':'#1d4ed8','코치':'#0e7490','대표':'#8b5cf6'};

function getRoleOrder(role){
  // Representative=0, President=0, Captain=0, Club President=0, Class President=0, Dean=1, Vice Dean=2, Director=2(tie), Professor=3, Coach=4, Other=99
  const ORDER = {'대표':0,'이사장':0,'선장':0,'동아리장':0,'동아리 회장':0,'반장':0,'총장':1,'부총장':2,'총괄':2,'교수':3,'코치':4};
  if(!role) return 99;
  return role in ORDER ? ORDER[role] : 99;
}
function getRoleBadgeHTML(role, size='11px'){
  if(!role) return '';
  const icon = ROLE_ICONS[role]||'🏷️';
  const col = ROLE_COLORS[role]||'#6b7280';
  // MAIN_ROLES는 진한 배경색, 그 외는 연한 배경
  const isMain = MAIN_ROLES.includes(role);
  if(isMain){
    return `<span style="font-size:${size};padding:2px 7px;border-radius:5px;background:${col};color:#fff;font-weight:800;white-space:nowrap;flex-shrink:0;letter-spacing:.3px;text-shadow:0 1px 2px rgba(0,0,0,.2)">${icon} ${role}</span>`;
  }
  return `<span style="font-size:${size};padding:1px 6px;border-radius:4px;background:${col}20;color:${col};border:1px solid ${col}44;font-weight:700;white-space:nowrap;flex-shrink:0">${icon} ${role}</span>`;
}

// 맵 약자 → 전체 이름 매핑 (시스템 maps 배열에도 없으면 그대로 사용)
const PASTE_MAP_ALIAS_DEFAULT = {
  // ── 전체 이름 ──
  '투혼':'투혼','라데온':'라데온','라데리안':'라데온','녹아웃':'녹아웃','리트리트':'리트리트',
  '폴리포이드':'폴리포이드','플스타':'플스타','옥타곤':'옥타곤',
  '에티튜드':'에티튜드','매치포인트':'매치포인트','도미네이터':'도미네이터',
  '실피드':'실피드','블리츠':'블리츠','서킷':'서킷','신 개마고원':'신 개마고원',
  '아이언포리스트':'아이언포리스트','파이썬':'파이썬','화랑':'화랑','지옥섬':'지옥섬',
  '투영':'투영','네오리게이트':'네오리게이트','메트로폴리스':'메트로폴리스',
  // ── 약자 ──
  '라데':'라데온','라':'라데온','라데리안':'라데온',
  '녹아':'녹아웃','녹':'녹아웃',
  '리트':'리트리트','리':'리트리트',
  '폴':'폴리포이드','폴리':'폴리포이드','폴스':'폴리포이드',   // 폴스 추가
  '플스':'플스타','플립':'플스타',                             // 플립 추가
  '옥':'옥타곤','옥타':'옥타곤',                               // 옥타 추가
  '에티':'에티튜드','에':'에티튜드',
  '매':'매치포인트','매치':'매치포인트',
  '도미':'도미네이터','도':'도미네이터',
  '실':'실피드','실피':'실피드',
  '블리':'블리츠','블':'블리츠',
  '서':'서킷',
  '투':'투혼',
  '메트':'메트로폴리스','메':'메트로폴리스',
  '개마':'신 개마고원','신개마':'신 개마고원','개':'신 개마고원',
  '아이':'아이언포리스트','포리':'아이언포리스트','아이언':'아이언포리스트',
  '파이':'파이썬','파':'파이썬',
  '화':'화랑',
  '지옥':'지옥섬','지':'지옥섬',
  '네오':'네오리게이트','리게':'네오리게이트',
};

/* ══════════════════════════════════════
   DATA LOAD
══════════════════════════════════════ */
function J(k){
  try{
    const v=localStorage.getItem(k);
    if(!v)return null;
    // LZ-String 압축 여부 자동 감지: 압축된 데이터는 JSON으로 파싱 불가
    if(typeof LZString!=='undefined'){
      try{return JSON.parse(v);}catch{
        const d=LZString.decompressFromUTF16(v);
        return d?JSON.parse(d):null;
      }
    }
    return JSON.parse(v);
  }catch{return null;}
}
function _lsSave(k,obj){
  const s=JSON.stringify(obj);
  if(typeof LZString!=='undefined'){
    localStorage.setItem(k,LZString.compressToUTF16(s));
  }else{
    localStorage.setItem(k,s);
  }
}

let players    = J('su_p')  || [];
// 사진 분리 저장 지원: su_pp에 {이름:base64} 형태로 저장된 사진을 players에 병합
(function(){const _pp=J('su_pp');if(_pp&&typeof _pp==='object')players.forEach(p=>{if(!p.photo&&_pp[p.name])p.photo=_pp[p.name];});})();
let boardOrder = J('su_boardOrder') || []; // 현황판 대학 순서
let univCfg    = J('su_u')  || [{name:'흑카데미',color:'#1e3a8a'},{name:'JSA',color:'#c2410c'},{name:'늪지대',color:'#15803d'},{name:'무소속',color:'#6b7280'}];
let maps       = J('su_m')  || ['투혼','서킷','블리츠','신 개마고원'];
let userMapAlias = J('su_mAlias') || {};   // 사용자 정의 맵 약자 { '약자': '전체이름' }
let tourD      = J('su_t')  || Array(15).fill('');
let miniM      = J('su_mm') || [];
let univM      = J('su_um') || [];
let comps      = J('su_cm') || [];
let ckM        = J('su_ck') || [];
let compNames  = J('su_cn') || [];
let curComp    = J('su_cc') || '';
// 프로리그 데이터
let proM       = J('su_pro') || [];
// 프로리그 개인 대회: [{id,name,groups:[{name,players:[],matches:[{a,b,winner,d,map}]}]}]
let proTourneys = J('su_ptn') || [];
let curProComp  = J('su_ptc') || '';
// 대회 조편성: [{id,name,groups:[{name,univs:[],matches:[{a,b,sa,sb,sets:[]}]}]}]
let tourneys   = J('su_tn') || [];
let ttM        = J('su_ttm') || [];
let _ttCurComp = J('su_ttcur') || '';
let _ttSub     = 'records';
let indM       = J('su_indm') || [];
let gjM        = J('su_gjm')  || [];
let notices    = J('su_notices') || [];
// 보라크루 멤버: [{name, photo, link, crewName}]
let crew       = J('su_crew') || [];
// 크루 목록: [{id, name, color, logo, bgImage, bgAlpha, labelAlpha}]
let crewCfg    = J('su_crewcfg') || [];

let BLD = {};
let openDetails = {};
let tierRankModeFilter = '전체';

// ── 선수별 상태 아이콘 시스템 ──────────────────────────────
let playerStatusIcons = J('su_psi') || {};
let playerStatusExpiry = J('su_psi_expiry') || {};
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
let _customStatusIcons = J('su_si_customs') || [];
(function _loadCustomIcons(){
  _customStatusIcons.forEach((c,i)=>{ STATUS_ICON_DEFS['_c'+i]={label:c.label||'커스텀'+(i+1),emoji:c.emoji}; });
})();
function addCustomStatusIcon(label, emoji){
  if(!emoji) return;
  _customStatusIcons.push({label:label||'커스텀',emoji});
  const i=_customStatusIcons.length-1;
  STATUS_ICON_DEFS['_c'+i]={label:_customStatusIcons[i].label,emoji};
  localStorage.setItem('su_si_customs',JSON.stringify(_customStatusIcons));
}
function removeCustomStatusIcon(idx){
  _customStatusIcons.splice(idx,1);
  Object.keys(STATUS_ICON_DEFS).filter(k=>k.startsWith('_c')).forEach(k=>delete STATUS_ICON_DEFS[k]);
  _customStatusIcons.forEach((c,i)=>{STATUS_ICON_DEFS['_c'+i]={label:c.label,emoji:c.emoji};});
  localStorage.setItem('su_si_customs',JSON.stringify(_customStatusIcons));
}
function _siIsImg(v){ return typeof v==='string'&&(v.startsWith('http')||v.startsWith('data:')); }
function _siRender(emoji, size){ size=size||'16px'; if(!emoji)return''; if(_siIsImg(emoji))return`<img src="${emoji}" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`; return emoji; }
function getStatusIcon(name){
  const expiry = playerStatusExpiry[name];
  if(expiry && expiry < new Date().toISOString().slice(0,10)){
    delete playerStatusIcons[name];
    delete playerStatusExpiry[name];
    localStorage.setItem('su_psi', JSON.stringify(playerStatusIcons));
    localStorage.setItem('su_psi_expiry', JSON.stringify(playerStatusExpiry));
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
  localStorage.setItem('su_psi', JSON.stringify(playerStatusIcons));
  localStorage.setItem('su_psi_expiry', JSON.stringify(playerStatusExpiry));
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
  localStorage.setItem('su_psi_expiry', JSON.stringify(playerStatusExpiry));
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
let b2ProfileBgAlpha  = J('su_b2pba') ?? 10; // 프로필 탭 배경 밝기 (기본 10%)

// 스트리머 프로필 전역 스타일 설정
let profileShape = J('su_profile_shape') || 'circle'; // 'circle' | 'square'
let profileSize  = J('su_profile_size')  || 32;       // px 단위

function getPlayerPhotoHTML(playerName, size, extraStyle){
  const shape = profileShape || 'circle';
  const radius = shape === 'square' ? '8px' : '50%';
  const globalSize = profileSize ? profileSize + 'px' : '32px';
  
  size = size || globalSize; 
  extraStyle = extraStyle || '';
  const p = players.find(x => x.name === playerName);
  const hasBorder = extraStyle.includes('border');
  const bdr = hasBorder ? '' : 'border:1.5px solid var(--border);';
  const base = 'display:inline-block;width:' + size + ';height:' + size + ';border-radius:' + radius + ';flex-shrink:0;vertical-align:middle;' + extraStyle;
  const safeName = (playerName || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const clickStyle = 'cursor:pointer;';
  const clickAttr = 'onclick="openPlayerModal(\'' + safeName + '\')" title="스트리머 상세"';
  
  if (!p || !p.photo) {
    const RMAP = { T: { bg: '#dbeafe', col: '#1e40af' }, Z: { bg: '#ede9fe', col: '#5b21b6' }, P: { bg: '#fef3c7', col: '#92400e' } };
    const rm = RMAP[p?.race] || { bg: '#e2e8f0', col: '#64748b' };
    const txt = p?.race || '?';
    return '<span ' + clickAttr + ' style="' + base + ';' + bdr + 'background:' + rm.bg + ';color:' + rm.col + ';display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:calc(' + size + ' * 0.42);' + clickStyle + '">' + txt + '</span>';
  }
  return '<img ' + clickAttr + ' src="' + p.photo + '" style="' + base + ';object-fit:contain;' + bdr + clickStyle + '" onerror="this.style.display=\'none\'">';
}
function getStatusIconHTML(name){
  const ic=getStatusIcon(name);
  if(!ic) return '';
  const def=Object.values(STATUS_ICON_DEFS).find(d=>d.emoji===ic);
  const lbl=def?def.label:ic;
  if(_siIsImg(ic)) return `<span style="margin-left:3px;flex-shrink:0;display:inline-flex;align-items:center" title="${lbl}">${_siRender(ic,'18px')}</span>`;
  return `<span style="font-size:13px;margin-left:3px;flex-shrink:0" title="${lbl}">${ic}</span>`;
}

function fixPoints(){
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

function localSave(){
  // ⚠️ 중요: localStorage 용량 초과(QuotaExceeded)가 발생하면
  // try 블록이 즉시 중단되면서 뒤쪽 키(대전기록 su_mm/su_um/su_ck/su_pro ...)가 저장되지 않아
  // "기록 탭에 저장이 안됨"처럼 보일 수 있음.
  // → 경기/기록 데이터를 먼저 저장하고, 각 키를 개별 try/catch로 처리하여 일부라도 최대한 보존.
  const _isQuota = (e)=>e && (e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED');
  let quotaHit = false;
  let anySaved = false;
  const _safeSave = (k, obj)=>{
    try{ _lsSave(k, obj); anySaved = true; return true; }
    catch(e){
      if(_isQuota(e)){ quotaHit = true; return false; }
      console.error('[localSave error]', k, e);
      return false;
    }
  };

  // teamAMembers/teamBMembers에서 tier·race 제거 (표시 시 players 배열 조회)
  const _trimM = (arr)=>(arr||[]).map(m=>{
    if(!m || (!m.teamAMembers && !m.teamBMembers)) return m;
    const r={...m};
    if(r.teamAMembers)r.teamAMembers=r.teamAMembers.map(x=>({name:x.name,univ:x.univ}));
    if(r.teamBMembers)r.teamBMembers=r.teamBMembers.map(x=>({name:x.name,univ:x.univ}));
    return r;
  });

  // 1) 설정/기록(상대적으로 작은 데이터) 먼저 저장
  _safeSave('su_tiers',TIERS);
  _safeSave('su_u',univCfg);
  _safeSave('su_m',maps);
  _safeSave('su_mAlias',userMapAlias);
  _safeSave('su_t',tourD);

  // 2) 대전/대회 기록(핵심) 저장 — su_p(선수 히스토리)보다 먼저!
  _safeSave('su_mm',miniM);
  _safeSave('su_um',univM);
  _safeSave('su_cm',comps);
  _safeSave('su_ck',_trimM(ckM));
  _safeSave('su_pro',_trimM(proM));
  _safeSave('su_ptn',proTourneys);
  _safeSave('su_ptc',curProComp);
  _safeSave('su_tn',tourneys);
  _safeSave('su_ttm',_trimM(ttM));
  _safeSave('su_ttcur',_ttCurComp);
  _safeSave('su_indm',indM);
  _safeSave('su_gjm',gjM);
  _safeSave('su_cn',compNames);
  _safeSave('su_cc',curComp);

  if(typeof boardOrder!=='undefined') _safeSave('su_boardOrder',boardOrder);
  if(typeof boardPlayerOrder!=='undefined') _safeSave('su_bpo',boardPlayerOrder);
  if(typeof playerStatusIcons!=='undefined') _safeSave('su_psi',playerStatusIcons);
  _safeSave('su_notices',notices);
  _safeSave('su_crew',crew);
  _safeSave('su_crewcfg',crewCfg);
  _safeSave('su_seasons',seasons);
  _safeSave('su_cal_sched',calScheduled);
  if(BLD['ck']) _safeSave('su_bld_ck',{membersA:BLD['ck'].membersA||[],membersB:BLD['ck'].membersB||[]});
  if(BLD['pro']) _safeSave('su_bld_pro',{date:BLD['pro'].date||'',membersA:BLD['pro'].membersA||[],membersB:BLD['pro'].membersB||[],tierFilters:BLD['pro'].tierFilters||[],sets:BLD['pro'].sets||[]});

  // 3) 선수(히스토리 포함)는 가장 마지막에 저장 (용량 초과 위험이 가장 큼)
  // 사진(base64)을 su_pp로 분리해서 su_p 크기 감소
  const _pPhotoMap={};
  const _pNoPhoto=(players||[]).map(p=>{
    const c={...p};
    if(p.photo){_pPhotoMap[p.name]=p.photo;delete c.photo;}
    // eloAfter(render.js fallback으로 재계산 가능)만 제거, time은 중복 dedup에 필요하므로 유지
    if(c.history&&c.history.length){
      // eslint-disable-next-line no-unused-vars
      c.history=c.history.map(({eloAfter,...h})=>h);
    }
    return c;
  });
  _safeSave('su_pp',_pPhotoMap);
  _safeSave('su_p',_pNoPhoto);

  // 마지막 저장 시간 (가능하면 기록)
  try{
    if(anySaved) localStorage.setItem('su_last_save_time',Date.now().toString());
  }catch(e){
    if(_isQuota(e)) quotaHit = true;
    else console.error('[localSave error] su_last_save_time', e);
  }

  if(quotaHit){
    if(typeof showToast==='function')showToast('⚠️ 저장 공간이 부족합니다. 일부 데이터(특히 선수/사진)가 저장되지 않았을 수 있습니다. (대전기록은 우선 저장하도록 개선됨)',7000);
    else alert('⚠️ 저장 공간이 부족합니다. 일부 데이터가 저장되지 않았을 수 있습니다.');
  }
}

// 설정 전용 경량 저장 — 선수 기록·대전 데이터 직렬화 없음, Firebase 스킵
// 맵·약자·상태아이콘·티어·대학 설정 변경 시 사용
function saveCfg(){
  try{
    _lsSave('su_tiers',TIERS);
    _lsSave('su_u',univCfg);
    _lsSave('su_m',maps);
    _lsSave('su_mAlias',userMapAlias);
    if(typeof playerStatusIcons!=='undefined') _lsSave('su_psi',playerStatusIcons);
    localStorage.setItem('su_last_save_time',Date.now().toString());
  }catch(e){console.error('[saveCfg error]',e);}
}
// 프로필 사진만 저장 — su_pp만 갱신 (history 직렬화 없음)
function savePhotos(){
  try{
    const _ppm={};
    players.forEach(p=>{if(p.photo)_ppm[p.name]=p.photo;});
    _lsSave('su_pp',_ppm);
    localStorage.setItem('su_last_save_time',Date.now().toString());
  }catch(e){console.error('[savePhotos error]',e);}
}
function save(){
  localSave();
  const statusEl = document.getElementById('cloudStatus');
  if (typeof isLoggedIn !== 'undefined' && isLoggedIn) {
    if (!localStorage.getItem('su_fb_pw') && typeof _FB_PW_DEFAULT === 'undefined') {
      // 비밀번호 미설정 → Firebase 저장 안 됨 경고
      if (statusEl) { statusEl.style.color='#d97706'; statusEl.textContent='⚠️ 로컬만 저장 (설정탭→Firebase 비밀번호 필요)'; setTimeout(()=>{if(statusEl){statusEl.textContent='';statusEl.style.color='';}},5000); }
      return;
    }
    if (typeof fbCloudSave !== 'function' || typeof window.fbSet !== 'function') {
      if (statusEl) { statusEl.style.color='#dc2626'; statusEl.textContent='❌ Firebase 미연결'; setTimeout(()=>{if(statusEl){statusEl.textContent='';statusEl.style.color='';}},4000); }
      return;
    }
    if (statusEl) { statusEl.style.color=''; statusEl.textContent='⏫ 저장 중...'; }
    fbCloudSave()
      .then(() => { if(statusEl){statusEl.style.color='#16a34a';statusEl.textContent='✅ Firebase 저장됨'; setTimeout(()=>{if(statusEl){statusEl.textContent='';statusEl.style.color='';}},3000);} })
      .catch(e => { if(statusEl){statusEl.style.color='#dc2626';statusEl.textContent='❌ Firebase 저장 실패';} console.error('[fbCloudSave]',e); });
  }
}

let curTab='total', editName='', reMode='', reIdx=-1;
let histPage={mini:0, ck:0, univm:0, comp:0, pro:0, tiertour:0, tt:0, ind:0, gj:0, procomp:0}; // 대전기록 탭 페이지 상태
let playerHistPage=0; // 스트리머 상세 페이지 상태
const HIST_PAGE_SIZE=20;
const HIST_PAGE_SIZE_MOBILE=10;
function getHistPageSize(){return window.innerWidth<=768?HIST_PAGE_SIZE_MOBILE:HIST_PAGE_SIZE;}
const PLAYER_HIST_PAGE_SIZE=10; // REQ4: 스트리머 상세 10개 이상일 때 페이지네이션
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth(), calView=localStorage.getItem('su_cal_view')||'month';
let calTypeFilter='all';
let voteData=JSON.parse(localStorage.getItem('su_votes')||'{}');
let fUniv='전체', fTier='전체';
var miniSub='input', univmSub='input', ckSub='input', indSub='input', gjSub='input', compSub='league', histSub='mini';
var miniType='mini'; // 'mini' | 'civil'
var histUniv='';
var recSortDir='desc'; // 날짜 정렬: 'desc'=최신순, 'asc'=오래된순
var vsNameA='', vsNameB=''; // 1:1 상대전적 조회

// 공통 연도/월 필터 상태
let yearOptions=[]; // 하위호환용 — buildYearMonthFilter는 getYearOptions()로 동적 계산
let filterYear='전체';
let filterMonth='전체'; // '전체' 또는 '01'~'12'

// 🆕 시즌 관리: [{id, name, from, to}] — from/to: 'YYYY-MM-DD'
let seasons = J('su_seasons') || [];
let filterSeason = '전체'; // '전체' 또는 시즌 id

// 🆕 캘린더 예정 경기 (Firebase 동기화)
let calScheduled = J('su_cal_sched') || [];

// 🆕 랭킹 변동 스냅샷 (points 기준 순위)
// { playerName: rank } 형태로 저장
let _rankSnapshot = J('su_rank_snap') || {};
let _rankSnapDate = localStorage.getItem('su_rank_snap_date') || '';

// 랭킹 스냅샷 업데이트 (하루 1회)
function updateRankSnapshot() {
  const today = new Date().toISOString().slice(0,10);
  if(_rankSnapDate === today) return; // 오늘 이미 업데이트됨
  // 현재 순위 계산 (points 기준)
  const ranked = [...players]
    .filter(p => !p.retired)
    .sort((a,b) => (b.points||0)-(a.points||0) || (b.win||0)-(a.win||0));
  const snap = {};
  ranked.forEach((p,i) => { snap[p.name] = i+1; });
  localStorage.setItem('su_rank_snap', JSON.stringify(snap));
  localStorage.setItem('su_rank_snap_date', today);
  _rankSnapshot = snap;
  _rankSnapDate = today;
}

// 랭킹 변동 HTML 반환 (▲3 / ▼2 / NEW / -)
function getRankChangeBadge(playerName, currentRank) {
  const prev = _rankSnapshot[playerName];
  if(!prev) return '<span style="font-size:9px;color:#7c3aed;font-weight:700;padding:1px 4px;background:#ede9fe;border-radius:3px">NEW</span>';
  const diff = prev - currentRank; // 양수 = 상승
  if(diff === 0) return '<span style="font-size:9px;color:var(--gray-l)">-</span>';
  if(diff > 0)  return `<span style="font-size:9px;color:#16a34a;font-weight:800">▲${diff}</span>`;
  return `<span style="font-size:9px;color:#dc2626;font-weight:800">▼${Math.abs(diff)}</span>`;
}

function gc(n){const u=univCfg.find(x=>x.name===n);return u?u.color:'#6b7280';}
// Get univ color with alpha hex suffix for row tinting
function gcHex8(n,alpha){
  const c=gc(n);
  const a=Math.round((alpha||0.06)*255).toString(16).padStart(2,'0');
  return c+a;
}
function gcHex8Hover(n,alpha){
  const c=gc(n);
  const a=Math.round((alpha||0.12)*255).toString(16).padStart(2,'0');
  return c+a;
}
// 스타대학 아이콘 URL 매핑
const UNIV_ICONS={
  '엠비대':'https://i.ibb.co/6cfNW2Nt/image.png',
  '와플대':'https://i.ibb.co/Zp8f2w8c/image.png',
  '정선대':'https://i.ibb.co/QFc22RMp/image.png',
  '츠캄몬스타즈':'https://i.ibb.co/ZpRrMWMt/image.png',
  '수술대':'https://i.ibb.co/Q7CGzwck/image.png',
  'JSA':'https://i.ibb.co/tpdY6Z6T/jsa.png',
  '늪지대':'https://i.ibb.co/1YhTgzdS/image.png',
  '뉴캣슬':'https://i.ibb.co/qM7NQVMr/image.png',
  '씨나인':'https://i.ibb.co/8nyMJyWh/image.png',
  'HM':'https://i.ibb.co/ksZY7Ksq/hm-1.png',
  'BGM':'https://i.ibb.co/PGL06DJb/bgm-1.png',
  '흑카데미':'https://i.ibb.co/VW7Rw0G7/image.png',
  '케이대':'https://i.ibb.co/8n196Hq8/image.png',
  '이노대':'https://i.ibb.co/pjK8Hb1Z/image.png'
};
// 기본 대학 아이콘 SVG (아이콘이 없는 대학에 사용)
const DEFAULT_UNIV_ICON_SVG=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" data-univ-icon="1" style="flex-shrink:0;opacity:0.75;vertical-align:middle"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
// 대학명 옆에 아이콘 img 태그 반환 (아이콘 없으면 기본 SVG 반환)
function gUI(n,size='1em'){
  const url=(univCfg.find(x=>x.name===n)||{}).icon||UNIV_ICONS[n]||'';
  if(url)return `<img src="${url}" alt="" data-univ-icon="1" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;margin-right:3px;border-radius:2px;flex-shrink:0" onerror="this.style.display='none'">`;
  // 기본 아이콘 SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" data-univ-icon="1" style="width:${size};height:${size};flex-shrink:0;opacity:0.75;vertical-align:middle;margin-right:3px"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
}
// 대학명 + 아이콘 HTML 반환 (아이콘이 좌측에 위치)
function univNameWithIcon(n,fontSize){const icon=gUI(n,fontSize||'1em');return icon+n;}
// DOM 요소 내 ubadge에 대학 아이콘 주입 (항상 좌측에, 기본 아이콘 포함)
function injectUnivIcons(container){
  if(!container)return;
  container.querySelectorAll('.ubadge').forEach(el=>{
    if(el.querySelector('[data-univ-icon]')||el.getAttribute('data-icon-done'))return;
    let name='';
    el.childNodes.forEach(node=>{if(node.nodeType===3)name+=node.textContent;});
    name=name.trim().replace(/\s+/g,' ');
    if(!name)return;
    el.setAttribute('data-icon-done','1');
    // inline-flex 레이아웃으로 정렬
    if(!el.style.display||el.style.display==='inline-block')el.style.display='inline-flex';
    el.style.alignItems='center';
    el.style.gap='3px';
    const url=UNIV_ICONS[name]||(univCfg.find(x=>x.name===name)||{}).icon||'';
    if(url){
      const img=document.createElement('img');
      img.src=url; img.setAttribute('data-univ-icon','1');
      img.style.cssText='width:1em;height:1em;object-fit:contain;vertical-align:middle;border-radius:2px;flex-shrink:0';
      img.onerror=function(){this.style.display='none';};
      el.insertBefore(img,el.firstChild);
    } else {
      // 기본 아이콘 SVG 삽입
      const svgWrap=document.createElement('span');
      svgWrap.setAttribute('data-univ-icon','1');
      svgWrap.style.cssText='display:inline-flex;align-items:center;flex-shrink:0';
      svgWrap.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:1em;height:1em;opacity:0.75"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
      el.insertBefore(svgWrap,el.firstChild);
    }
  });
}
function pC(n){return n>0?'pt-p':n<0?'pt-n':'pt-z';}
function pS(n){return (n>0?'+':'')+n;}
function getAllUnivs(){
  const r=[...univCfg];const s=new Set(univCfg.map(u=>u.name));
  players.forEach(p=>{if(!s.has(p.univ)){r.push({name:p.univ,color:'#6b7280'});s.add(p.univ);}});
  const seen=new Set();
  return r.filter(u=>{if(seen.has(u.name))return false;seen.add(u.name);return true;});
}

// 현황판 boardOrder → univCfg 순서 동기화 (현황판에서 이동하면 스트리머 목록도 같이 이동)
function syncBoardOrderToUnivCfg(){
  if(!boardOrder||!boardOrder.length) return;
  const newCfg=[];
  boardOrder.forEach(name=>{const u=univCfg.find(x=>x.name===name);if(u)newCfg.push(u);});
  univCfg.forEach(u=>{if(!boardOrder.includes(u.name))newCfg.push(u);});
  if(newCfg.length===univCfg.length){univCfg=newCfg;save();}
}
function getMembers(univ){return players.filter(p=>p.univ===univ);}

function genderIcon(gender){
  if(gender==='M')return `<span class="male-icon">♂</span>`;
  return '';
}

/* ELO 상수 */
const ELO_DEFAULT=1200;
const ELO_K=32;

function calcElo(winnerElo, loserElo){
  const exp=1/(1+Math.pow(10,(loserElo-winnerElo)/400));
  return Math.round(ELO_K*(1-exp));
}

function _findPlayer(name){
  if(!name) return null;
  let p=players.find(x=>x.name===name);
  if(p)return p;
  const low=name.toLowerCase();
  p=players.find(x=>x.memo&&x.memo.split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
  if(p)return p;
  const ns=name.replace(/\s+/g,'');
  return players.find(x=>x.name.replace(/\s+/g,'')===ns)||null;
}

function applyGameResult(winName, loseName, date, map, matchId, univW, univL, mode){
  const w=_findPlayer(winName);
  const l=_findPlayer(loseName);
  if(!w||!l||w===l)return;
  if(!w.history)w.history=[];
  if(!l.history)l.history=[];
  // 중복 체크: gameId(_sN_gN 포함)면 matchId 자체가 고유 → matchId만 비교
  // 경기 단위 matchId면 matchId+opp 조합으로 비교, 없으면 date+map+opp fallback
  const d=date||new Date().toISOString().slice(0,10);
  const m=map||'-';
  const isGameId=matchId&&matchId.includes('_s')&&matchId.includes('_g');
  const parentId=isGameId?matchId.split('_s')[0]:matchId;
  
  // matchId 기반 체크 강화
  const wDupMatch=matchId
    ?(isGameId
      ?(w.history||[]).find(h=>h.matchId===matchId || h.matchId===parentId) // 고유ID나 부모ID가 있으면 중복
      :(w.history||[]).find(h=>h.matchId===matchId&&h.opp===l.name))
    :null;
  const lDupMatch=matchId
    ?(isGameId
      ?(l.history||[]).find(h=>h.matchId===matchId || h.matchId===parentId)
      :(l.history||[]).find(h=>h.matchId===matchId&&h.opp===w.name))
    :null;

  // date+map+opp 기반 체크 (matchId가 없거나 다른 경우에도 체크)
  // 고유 matchId(_sN_gN)가 있는 경우, 부모 ID가 겹치지 않는 한 날짜/맵 중복은 허용 (재경기 등 대응)
  const wDupFallback=(!isGameId && (w.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===l.name));
  const lDupFallback=(!isGameId && (l.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===w.name));
  // 둘 중 하나라도 중복이면 중단
  if(wDupMatch||lDupMatch||wDupFallback||lDupFallback)return; // 이미 기록되어 있으면 중단
  w.win++;l.loss++;w.points+=3;l.points-=3;
  // ELO 계산
  const wElo=w.elo||ELO_DEFAULT;
  const lElo=l.elo||ELO_DEFAULT;
  const delta=calcElo(wElo,lElo);
  w.elo=wElo+delta;
  l.elo=lElo-delta;
  const t=Date.now();
  // 경기 시점 대학 저장 (나중에 대학을 옮겨도 당시 소속 대학으로 집계)
  const wu=univW||w.univ||'';
  const lu=univL||l.univ||'';
  w.history.unshift({date:d,time:t,result:'승',opp:l.name,oppRace:l.race,map:m,matchId:matchId||'',eloDelta:delta,eloAfter:w.elo,univ:wu,mode:mode||''});
  l.history.unshift({date:d,time:t,result:'패',opp:w.name,oppRace:w.race,map:m,matchId:matchId||'',eloDelta:-delta,eloAfter:l.elo,univ:lu,mode:mode||''});
}

function applyMultiGameResult(winNames, loseNames, date, map, matchId, univW, univL, mode){
  const wins = (Array.isArray(winNames) ? winNames : [winNames]).map(n=>_findPlayer(n)).filter(Boolean);
  const loss = (Array.isArray(loseNames) ? loseNames : [loseNames]).map(n=>_findPlayer(n)).filter(Boolean);
  if(!wins.length || !loss.length) return;

  const d=date||new Date().toISOString().slice(0,10);
  const m=map||'-';
  const t=Date.now();

  wins.forEach(w=>{
    if(!w.history) w.history=[];
    if(matchId && w.history.find(h=>h.matchId===matchId)) return;
    w.win++; w.points+=3;
    const opps = loss.map(x=>x.name);
    const team = wins.filter(x=>x!==w).map(x=>x.name);
    w.history.unshift({date:d,time:t,result:'승',opp:opps[0],opps,team,map:m,matchId:matchId||'',univ:univW||w.univ||'',mode:mode||'',isMulti:true});
  });
  loss.forEach(l=>{
    if(!l.history) l.history=[];
    if(matchId && l.history.find(h=>h.matchId===matchId)) return;
    l.loss++; l.points-=3;
    const opps = wins.map(x=>x.name);
    const team = loss.filter(x=>x!==l).map(x=>x.name);
    l.history.unshift({date:d,time:t,result:'패',opp:opps[0],opps,team,map:m,matchId:matchId||'',univ:univL||l.univ||'',mode:mode||'',isMulti:true});
  });
}

function rebuildAllPlayerHistory() {
  if(!confirm('모든 스트리머의 경기 기록을 대전 데이터에서 다시 생성합니다.\n\n⚠️ 기존 history가 초기화되고 대전 기록 기반으로 재구성됩니다.\n\n계속하시겠습니까?')) return;

  // 1. 모든 선수의 history, win, loss, points, elo 초기화
  players.forEach(p => {
    p.history = [];
    p.win = 0;
    p.loss = 0;
    p.points = 0;
    p.elo = ELO_DEFAULT;
  });

  let count = 0;

  // 2. miniM에서 복구
  (miniM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const univW = g.winner === 'A' ? (m.a || '') : (m.b || '');
        const univL = g.winner === 'A' ? (m.b || '') : (m.a || '');
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, m.type === 'civil' ? '시빌워' : '미니대전');
        count++;
      });
    });
  });

  // 3. univM에서 복구
  (univM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const univW = g.winner === 'A' ? m.a : m.b;
        const univL = g.winner === 'A' ? m.b : m.a;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, '대학대전');
        count++;
      });
    });
  });

  // 4. ckM에서 복구
  (ckM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '대학CK');
        count++;
      });
    });
  });

  // 5. proM에서 복구
  (proM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '프로리그');
        count++;
      });
    });
  });

  // 6. ttM에서 복구
  (ttM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '티어대회');
        count++;
      });
    });
  });

  // 7. indM에서 복구
  (indM || []).forEach(m => {
    if(!m.wName || !m.lName) return;
    applyGameResult(m.wName, m.lName, m.d, m.map || '-', m._id || genId(), '', '', m._proLabel ? '프로리그' : '개인전');
    count++;
  });

  // 8. gjM에서 복구
  (gjM || []).forEach(m => {
    if(!m.wName || !m.lName) return;
    applyGameResult(m.wName, m.lName, m.d, m.map || '-', m._id || genId(), '', '', m._proLabel ? '프로리그끝장전' : '끝장전');
    count++;
  });

  // 9. comps에서 복구
  (comps || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const univW = g.winner === 'A' ? m.a : m.b;
        const univL = g.winner === 'A' ? m.b : m.a;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, '대회');
        count++;
      });
    });
  });

  // 10. tourneys에서 복구
  if (typeof tourneys !== 'undefined') {
    tourneys.forEach(tn => {
      const isTier = tn.type === 'tier';
      (tn.groups || []).forEach(grp => {
        (grp.matches || []).forEach(m => {
          if (!m._id) return;
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
              applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '조별리그');
              count++;
            });
          });
        });
      });
      Object.values((tn.bracket || {}).matchDetails || {}).forEach(m => {
        if (!m._id) return;
        (m.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
            applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '대회');
            count++;
          });
        });
      });
      ((tn.bracket || {}).manualMatches || []).forEach(m => {
        if (!m._id) return;
        (m.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
            applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '대회');
            count++;
          });
        });
      });
    });
  }

  // 11. proTourneys에서 복구
  if (typeof proTourneys !== 'undefined') {
    proTourneys.forEach(tn => {
      (tn.groups || []).forEach(grp => {
        (grp.matches || []).forEach((m, matchIdx) => {
          if (!m._id) return;
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
              applyGameResult(wName, lName, m.d || '', g.map || '', gameId, '', '', '프로리그대회');
              count++;
            });
          });
        });
      });
      (tn.bracket || []).forEach((rnd, rndIdx) => {
        rnd.forEach((m, matchIdx) => {
          if (!m || !m._id) return;
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
              applyGameResult(wName, lName, m.d || '', g.map || '', gameId, '', '', '프로리그대회');
              count++;
            });
          });
        });
      });
      if (tn.thirdPlace && tn.thirdPlace._id) {
        const tp = tn.thirdPlace;
        (tp.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || `${tp._id}_s${setIdx}_g${gameIdx}`;
            applyGameResult(wName, lName, tp.d || '', g.map || '', gameId, '', '', '프로리그대회');
            count++;
          });
        });
      }
      (tn.teamMatches || []).forEach((tm, tmIdx) => {
        (tm.games || []).forEach((g, gameIdx) => {
          if (!g.wName || !g.lName) return;
          const gameId = tm._id ? `${tm._id}_g${gameIdx}` : genId();
          applyGameResult(g.wName, g.lName, tm.d || '', g.map || '', gameId, '', '', '프로리그대회');
          count++;
        });
      });
    });
  }

  save();
  alert(`✅ ${count}개의 경기가 스트리머 기록에 복구되었습니다!`);
  render();
}

// 스트리머 history → 대전 기록 배열 역방향 복구
// 스트리머 최근 경기에는 있지만 대전기록 탭에 없는 경우 복구
function syncHistoryToMatchArrays(){
  if(!confirm('스트리머 최근 경기 데이터를 기반으로\n대전기록 탭에 누락된 기록을 복구합니다.\n\n이미 등록된 기록은 중복 추가되지 않습니다.\n계속하시겠습니까?')) return;

  // 기존 모든 배열의 _id 집합
  const existingIds = new Set();
  const _idx = (arr) => (arr||[]).forEach(m => { if(m._id) existingIds.add(m._id); });
  _idx(miniM); _idx(univM); _idx(ckM); _idx(proM);
  _idx(typeof ttM!=='undefined'?ttM:[]);
  _idx(typeof indM!=='undefined'?indM:[]);
  _idx(typeof gjM!=='undefined'?gjM:[]);

  // 모든 선수 history에서 parentId별로 게임 수집
  // parentId → { mode, date, games: { gameId → { winner, loser, winnerUniv, loserUniv, map, date } } }
  const byParent = {};
  players.forEach(p => {
    (p.history||[]).forEach(h => {
      if(!h.matchId || !h.date) return;
      const isGameId = h.matchId.includes('_s') && h.matchId.includes('_g');
      const parentId = isGameId ? h.matchId.split('_s')[0] : h.matchId;
      const gameId = h.matchId;

      if(!byParent[parentId]) byParent[parentId] = { mode: h.mode||'', date: h.date, games: {} };
      const entry = byParent[parentId];
      if(!entry.mode && h.mode) entry.mode = h.mode;
      if(h.date && h.date > entry.date) entry.date = h.date;

      if(!entry.games[gameId]) entry.games[gameId] = { gameId, map: h.map||'', date: h.date };
      const g = entry.games[gameId];
      if(h.result === '승') {
        g.winner = p.name; g.winnerUniv = h.univ||p.univ||''; g.winnerRace = p.race||'N';
      } else if(h.result === '패') {
        g.loser = p.name; g.loserUniv = h.univ||p.univ||''; g.loserRace = p.race||'N';
      }
    });
  });

  let added = 0;

  Object.entries(byParent).forEach(([parentId, data]) => {
    if(existingIds.has(parentId)) return; // 이미 존재하면 건너뜀
    // 구 데이터는 history에 mode가 비어있는 경우가 많음(과거 버전에서 applyGameResult에 mode 미전달)
    // → mode가 없더라도 최소한 "미니대전(대학 기준)"으로 복구할 수 있게 추정 로직 추가
    let mode = data.mode;
    const date = data.date;
    const games = Object.values(data.games).filter(g => g.winner && g.loser);
    if(!games.length) return; // 승자+패자 쌍이 없으면 복구 불가

    // mode 추정: winner/loser의 대학이 2개 이상 나오면 팀전(미니대전)으로 간주
    if(!mode){
      const uSet = new Set();
      games.forEach(g=>{
        if(g.winnerUniv) uSet.add(g.winnerUniv);
        if(g.loserUniv) uSet.add(g.loserUniv);
      });
      // 대학 정보가 전혀 없으면 복구 불가(팀을 만들 수 없음)
      if(uSet.size >= 1){
        mode = '미니대전';
      }
    }

    // 대상 배열 결정
    let targetArr = null;
    let isCivil = false, isProGj = false;
    if(mode === '미니대전') targetArr = miniM;
    else if(mode === '시빌워') { targetArr = miniM; isCivil = true; }
    else if(mode === '대학대전') targetArr = univM;
    else if(mode === '대학CK') targetArr = ckM;
    else if(mode === '프로리그') targetArr = proM;
    else if(mode === '티어대회') targetArr = (typeof ttM!=='undefined')?ttM:null;
    else if(mode === '개인전') targetArr = (typeof indM!=='undefined')?indM:null;
    else if(mode === '끝장전') targetArr = (typeof gjM!=='undefined')?gjM:null;
    else if(mode === '프로리그끝장전') { targetArr = (typeof gjM!=='undefined')?gjM:null; isProGj = true; }
    if(!targetArr) return;

    // 개인전·끝장전: 게임 하나하나가 배열 엔트리
    if(mode === '개인전' || mode === '끝장전' || mode === '프로리그끝장전') {
      games.forEach(g => {
        if(existingIds.has(g.gameId)) return;
        const entry = { _id: g.gameId, sid: parentId, d: g.date||date, wName: g.winner, lName: g.loser, map: g.map||'' };
        if(isProGj) entry._proLabel = true;
        targetArr.unshift(entry);
        existingIds.add(g.gameId);
        added++;
      });
      return;
    }

    // 팀 경기(miniM·univM·ckM·proM·ttM): 부모 경기 단위로 복구
    // 팀 결정: 승리 횟수 기준으로 teamA/teamB 배정
    const winsByUniv = {};
    games.forEach(g => { if(g.winnerUniv) winsByUniv[g.winnerUniv] = (winsByUniv[g.winnerUniv]||0)+1; });
    const univsSorted = Object.entries(winsByUniv).sort((a,b)=>b[1]-a[1]);
    const allUnivs = [...new Set(games.flatMap(g=>[g.winnerUniv,g.loserUniv]).filter(Boolean))];
    const teamA = univsSorted[0]?.[0] || allUnivs[0] || '';
    const teamB = allUnivs.find(u => u !== teamA) || teamA;

    const aWins = games.filter(g => g.winnerUniv === teamA || (teamA === teamB && g.winner)).length;
    const bWins = games.length - aWins;

    const setsGames = games.map(g => {
      const aWon = teamA !== teamB ? g.winnerUniv === teamA : true; // 동일팀이면 A가 항상 승
      return {
        playerA: aWon ? g.winner : g.loser,
        playerB: aWon ? g.loser : g.winner,
        winner: aWon ? 'A' : 'B',
        map: g.map || '',
        _id: g.gameId,
      };
    });

    const mA = [...new Map(games.map(g => {
      const name = (g.winnerUniv === teamA || teamA === teamB) ? g.winner : g.loser;
      const pl = players.find(x=>x.name===name)||{name,univ:teamA,race:'N'};
      return [name, {name: pl.name, univ: pl.univ||teamA, race: pl.race||'N'}];
    })).values()];
    const mB = [...new Map(games.map(g => {
      const name = (g.winnerUniv === teamA || teamA === teamB) ? g.loser : g.winner;
      const pl = players.find(x=>x.name===name)||{name,univ:teamB,race:'N'};
      return [name, {name: pl.name, univ: pl.univ||teamB, race: pl.race||'N'}];
    })).values()];

    const matchEntry = {
      _id: parentId, d: date, a: teamA, b: teamB, sa: aWins, sb: bWins,
      sets: [{ scoreA: aWins, scoreB: bWins, winner: aWins>bWins?'A':bWins>aWins?'B':'', games: setsGames }],
      teamAMembers: mA, teamBMembers: mB, _reconstructed: true,
    };
    if(isCivil) matchEntry.type = 'civil';
    targetArr.unshift(matchEntry);
    existingIds.add(parentId);
    added++;
  });

  if(added > 0) {
    save(); render();
    alert(`✅ ${added}건의 경기 기록을 스트리머 데이터에서 복구하여 대전기록 탭에 반영했습니다.`);
  } else {
    alert('복구할 데이터가 없습니다.\n스트리머 최근 경기의 모든 기록이 이미 대전기록 탭에 반영되어 있습니다.');
  }
}

function deduplicatePlayerHistory(){
  if(!confirm('중복 경기 기록을 제거합니다.\n\n완전히 동일한 항목(같은 게임 ID 또는 같은 time+matchId+상대+결과+맵)만 제거합니다.\n계속하시겠습니까?')) return;

  let totalRemoved=0;
  players.forEach(p=>{
    if(!p.history||!p.history.length)return;
    const seen=new Set();
    const before=p.history.length;
    p.history=p.history.filter(h=>{
      const mid=h.matchId||'';
      // 게임 단위 고유 ID(_sN_gN 포함)면 matchId 자체가 고유 키
      const isGameId=mid.includes('_s')&&mid.includes('_g');
      let key;
      if(isGameId){
        key=mid;
      } else if(h.time){
        // time이 있으면 포함하여 진짜 중복만 제거 (합법적 재매치와 구분)
        key=`${mid}|${h.opp||''}|${h.result||''}|${h.map||'-'}|${h.time}`;
      } else {
        // time도 없고 bare matchId면 건드리지 않음 (합법적 재매치와 구분 불가)
        return true;
      }
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
    totalRemoved+=before-p.history.length;
  });

  // 승패/포인트/ELO 재계산 (날짜 오름차순으로 delta 누적)
  players.forEach(p=>{
    p.win=0;p.loss=0;p.points=0;p.elo=ELO_DEFAULT;
    const sorted=[...(p.history||[])].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    sorted.forEach(h=>{
      if(h.result==='승'){p.win++;p.points+=3;}
      else if(h.result==='패'){p.loss++;p.points-=3;}
      if(h.eloDelta!=null)p.elo=(p.elo||ELO_DEFAULT)+h.eloDelta;
    });
  });

  if(typeof fixPoints==='function')fixPoints();
  save();
  alert(`🧹 중복 제거 완료: ${totalRemoved}개 항목 삭제`);
  render();
}

// game 객체에서 playerA, playerB, winner 정보를 추출해서
// applyGameResult를 호출한다.
function updatePlayerHistoryFromGame(game, date, mode){
  if(!game.playerA || !game.playerB || !game.winner) return;

  const winName = game.winner === 'A' ? game.playerA : 
                  game.winner === 'B' ? game.playerB : game.winner;
  const loseName = game.winner === 'A' ? game.playerB : 
                   game.winner === 'B' ? game.playerA : '';

  if(!winName || !loseName) return;

  // applyGameResult 내부에서 history 추가와 중복 방지를 처리함
  applyGameResult(winName, loseName, date, game.map||'', game._id||'', 
                  game.univA||'', game.univB||'', mode);
}
