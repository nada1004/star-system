/* ══════════════════════════════════════
   CONSTANTS - 티어 순서: god > king > jack > joker > spade > 0티어 > 1티어 ...
══════════════════════════════════════ */
let TIERS = J('su_tiers') || ['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스'];
const RACES=['T','Z','P'];
const RNAME={T:'테란',Z:'저그',P:'프로토스'};
const RANK_PTS={'🥇 1위':3,'🥈 2위':0,'🥉 3위':-3,'4강':0,'8강':0,'출전':0};

function getTierBadge(tier){
  if(!tier) return '';
  // 현황판과 동일한 _TIER_BG / _TIER_TEXT 색상 사용
  const icons={'G':'✨','K':'👑','JA':'⚔️','J':'🃏','S':'♠','유스':'🐣'};
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
  const icons={G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠',유스:'🐣'};
  const labels={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스'};
  const ic=icons[tier]||'';
  return ic?`${ic} ${labels[tier]||tier}`:tier;
}

function getTierPillLabel(tier){
  const icons={G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠️',유스:'🐣'};
  const labels={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스'};
  return icons[tier]?`${icons[tier]} ${labels[tier]||tier}`:tier;
}

// 티어 필터 버튼 색상 — 현황판(TIER_FIXED_COLORS)과 완전히 동일
const _TIER_BG = {
  'G':'#5b21b6','K':'#1e3a8a','JA':'#0e6280','J':'#065f46','S':'#2952a3',
  '0티어':'#1d4ed8','1티어':'#2e54c8','2티어':'#3d6ee0','3티어':'#5082f0',
  '4티어':'#6898f8','5티어':'#80b0ff','6티어':'#96c6ff','7티어':'#acdbff','8티어':'#c0e8ff',
  '유스':'#fef08a'
};
const _TIER_TEXT = {
  '5티어':'#1a3a8a','6티어':'#1d4ed8','7티어':'#1d4ed8','8티어':'#1d4ed8','유스':'#854d0e'
};
function getTierBtnColor(tier){ return _TIER_BG[tier]||'#64748b'; }
function getTierBtnTextColor(tier){ return _TIER_TEXT[tier]||'#fff'; }

/* ══════════════════════════════════════
   직책 시스템
   - MAIN_ROLES: 정렬 순서에 영향, 표시+정렬
   - SUB_ROLES: 표시만 (학생회장, 오락부장 등)
══════════════════════════════════════ */
const MAIN_ROLES = ['이사장','총장','부총장','총괄','교수','코치'];
const ROLE_ICONS = {'이사장':'👔','총장':'🎓','부총장':'📚','총괄':'🏛️','교수':'🏫','코치':'🎯'};
const ROLE_COLORS = {'이사장':'#6d28d9','총장':'#b91c1c','부총장':'#b45309','총괄':'#0c6e9e','교수':'#1d4ed8','코치':'#0e7490'};

function getRoleOrder(role){
  // 이사장=0, 총장=1, 부총장=2, 총괄=2(동률), 교수=3, 코치=4, 기타=99
  const ORDER = {'이사장':0,'총장':1,'부총장':2,'총괄':2,'교수':3,'코치':4};
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

/* ══════════════════════════════════════
   DATA LOAD
══════════════════════════════════════ */
function J(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}}

let players    = J('su_p')  || [];
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
// 회원 관리 데이터: [{id,nick,uid,status,banType,banEnd,banDone,category,memo,posts:[{url,savedAt,note}],comments:[{url,savedAt,note}],createdAt,updatedAt}]
let members    = J('su_mb') || [];
// 대회 조편성: [{id,name,groups:[{name,univs:[],matches:[{a,b,sa,sb,sets:[]}]}]}]
let tourneys   = J('su_tn') || [];
let ttM        = J('su_ttm') || [];
let indM       = J('su_indm') || [];
let gjM        = J('su_gjm')  || [];

let BLD = {};
let openDetails = {};

// ── 선수별 상태 아이콘 시스템 ──────────────────────────────
let playerStatusIcons = J('su_psi') || {};
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
};
function getStatusIcon(name){ return playerStatusIcons[name]||''; }
function setStatusIcon(name, iconId){
  if(!iconId||iconId==='none') delete playerStatusIcons[name];
  else playerStatusIcons[name]=STATUS_ICON_DEFS[iconId]?.emoji||iconId;
  localStorage.setItem('su_psi', JSON.stringify(playerStatusIcons));
}
function setStatusIconFromModal(btn, playerName, iconId){
  setStatusIcon(playerName, iconId);
  // Update button highlights
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
    const d = STATUS_ICON_DEFS[iconId];
    lbl.textContent = '선택: '+(d?d.label:'없음');
  }
}
function saveCustomStatusIcon(slot, emoji){
  localStorage.setItem('su_si_c'+slot, emoji);
  const k='custom'+slot;
  if(STATUS_ICON_DEFS[k]) STATUS_ICON_DEFS[k].emoji=emoji;
}
function getPlayerPhotoHTML(playerName, size, extraStyle){
  size=size||'32px'; extraStyle=extraStyle||'';
  const p=players.find(x=>x.name===playerName);
  const hasBorder=extraStyle.includes('border');
  const bdr=hasBorder?'':'border:1.5px solid var(--border);';
  const base='display:inline-block;width:'+size+';height:'+size+';border-radius:50%;flex-shrink:0;vertical-align:middle;'+extraStyle;
  if(!p||!p.photo){
    const RMAP={T:{bg:'#dbeafe',col:'#1e40af'},Z:{bg:'#ede9fe',col:'#5b21b6'},P:{bg:'#fef3c7',col:'#92400e'}};
    const rm=RMAP[p?.race]||{bg:'#e2e8f0',col:'#64748b'};
    const txt=p?.race||'?';
    return '<span style="'+base+';'+bdr+'background:'+rm.bg+';color:'+rm.col+';display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:calc('+size+' * 0.42)">'+txt+'</span>';
  }
  return '<img src="'+p.photo+'" style="'+base+';object-fit:cover;'+bdr+'" onerror="this.style.display=\'none\'">';
}
function getStatusIconHTML(name){
  const ic=getStatusIcon(name);
  return ic?`<span style="font-size:13px;margin-left:3px;flex-shrink:0">${ic}</span>`:'';
}

function fixPoints(){
  // 구 티어명 → 새 약어 마이그레이션
  const tierMap={god:'G',king:'K',jack:'JA',joker:'J',spade:'S'};
  players.forEach(p=>{
    if(!p.history)p.history=[];
    if(p.points===undefined)p.points=0;
    if(!p.win)p.win=0; if(!p.loss)p.loss=0;
    if(!p.gender || !['M','F'].includes(p.gender))p.gender='F';
    if(tierMap[p.tier])p.tier=tierMap[p.tier]; // 기존 데이터 자동 변환
  });
}

function localSave(){
  localStorage.setItem('su_tiers',JSON.stringify(TIERS));
  localStorage.setItem('su_p', JSON.stringify(players));
  localStorage.setItem('su_u', JSON.stringify(univCfg));
  localStorage.setItem('su_m', JSON.stringify(maps));
  localStorage.setItem('su_mAlias', JSON.stringify(userMapAlias));
  localStorage.setItem('su_t', JSON.stringify(tourD));
  localStorage.setItem('su_mm',JSON.stringify(miniM));
  localStorage.setItem('su_um',JSON.stringify(univM));
  localStorage.setItem('su_cm',JSON.stringify(comps));
  localStorage.setItem('su_ck',JSON.stringify(ckM));
  localStorage.setItem('su_cn',JSON.stringify(compNames));
  localStorage.setItem('su_cc',JSON.stringify(curComp));
  localStorage.setItem('su_pro',JSON.stringify(proM));
  localStorage.setItem('su_mb',JSON.stringify(members));
  localStorage.setItem('su_tn',JSON.stringify(tourneys));
  localStorage.setItem('su_ttm',JSON.stringify(ttM));
  localStorage.setItem('su_indm',JSON.stringify(indM));
  localStorage.setItem('su_gjm',JSON.stringify(gjM));
  localStorage.setItem('su_boardOrder',JSON.stringify(boardOrder));
  localStorage.setItem('su_bpo',JSON.stringify(boardPlayerOrder));
  localStorage.setItem('su_psi',JSON.stringify(playerStatusIcons));
}

function save(){
  localSave();
  if (typeof fbCloudSave === 'function' && typeof isLoggedIn !== 'undefined' && isLoggedIn && localStorage.getItem('su_fb_pw')) {
    const statusEl = document.getElementById('cloudStatus');
    if (statusEl) statusEl.textContent = '⏫ 저장 중...';
    fbCloudSave()
      .then(() => { if(statusEl){statusEl.textContent='✅ 저장됨'; setTimeout(()=>{if(statusEl)statusEl.textContent='';},3000);} })
      .catch(e => { if(statusEl) statusEl.textContent='❌ 저장 실패'; console.error('[fbCloudSave]',e); });
  }
}

let curTab='total', editName='', reMode='', reIdx=-1;
let histPage={mini:0, ck:0, univm:0, comp:0, pro:0, tiertour:0, tt:0, ind:0, gj:0}; // 대전기록 탭 페이지 상태
let playerHistPage=0; // 스트리머 상세 페이지 상태
const HIST_PAGE_SIZE=20;
const HIST_PAGE_SIZE_MOBILE=10;
function getHistPageSize(){return window.innerWidth<=768?HIST_PAGE_SIZE_MOBILE:HIST_PAGE_SIZE;}
const PLAYER_HIST_PAGE_SIZE=10; // REQ4: 스트리머 상세 10개 이상일 때 페이지네이션
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth(), calView='month';
let voteData=JSON.parse(localStorage.getItem('su_votes')||'{}');
let fUniv='전체', fTier='전체';
let miniSub='input', univmSub='input', ckSub='input', indSub='input', gjSub='input', compSub='league', histSub='mini';
let miniType='mini'; // 'mini' | 'civil'
let histUniv='';
let searchTarget='';
let recSortDir='desc'; // 날짜 정렬: 'desc'=최신순, 'asc'=오래된순
let vsNameA='', vsNameB=''; // 1:1 상대전적 조회

// 공통 연도/월 필터 상태
let yearOptions=['2026'];
let filterYear='전체';
let filterMonth='전체'; // '전체' 또는 '01'~'12'

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
  const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';
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
  return r;
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

function applyGameResult(winName, loseName, date, map, matchId){
  const w=players.find(p=>p.name===winName);
  const l=players.find(p=>p.name===loseName);
  if(!w||!l||w===l)return;
  w.win++;l.loss++;w.points+=3;l.points-=3;
  // ELO 계산
  const wElo=w.elo||ELO_DEFAULT;
  const lElo=l.elo||ELO_DEFAULT;
  const delta=calcElo(wElo,lElo);
  w.elo=wElo+delta;
  l.elo=lElo-delta;
  const t=Date.now();
  const d=date||new Date().toISOString().slice(0,10);
  const m=map||'-';
  w.history.unshift({date:d,time:t,result:'승',opp:l.name,oppRace:l.race,map:m,matchId:matchId||'',eloDelta:delta,eloAfter:w.elo});
  l.history.unshift({date:d,time:t,result:'패',opp:w.name,oppRace:w.race,map:m,matchId:matchId||'',eloDelta:-delta,eloAfter:l.elo});
}
