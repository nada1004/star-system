// ══════════════════════════════════════════════════════════
// constants-game.js — ELO/게임결과/대학유틸/이름정규화 (constants.js 에서 분리)
// 의존: constants.js, constants-save.js
// ══════════════════════════════════════════════════════════

let curTab='total', editName='', reMode='', reIdx=-1;
let histPage={mini:0, ck:0, univm:0, comp:0, pro:0, tiertour:0, tt:0, ind:0, gj:0, procomp:0}; // 대전기록 탭 페이지 상태
let playerHistPage=0; // 스트리머 상세 페이지 상태
const HIST_PAGE_SIZE=20;
const HIST_PAGE_SIZE_MOBILE=10;
function getHistPageSize(){
  try{
    const custom = parseInt(localStorage.getItem('su_hist_page_size')||'0',10)||0;
    if(custom>=5 && custom<=200) return custom;
  }catch(e){}
  return window.innerWidth<=768?HIST_PAGE_SIZE_MOBILE:HIST_PAGE_SIZE;
}
const PLAYER_HIST_PAGE_SIZE=10; // REQ4: 스트리머 상세 10개 이상일 때 페이지네이션
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth(), calView=localStorage.getItem('su_cal_view')||'month';
let calTypeFilter='all';
let calWeekOffset=0, calDayDate='';
let voteData=JSON.parse(localStorage.getItem('su_votes')||'{}');
let fUniv='전체', fTier='전체';
// (버그픽스) 티어 순위표 탭에서 대학/티어 필터 버튼이 sf()를 호출하는데,
// sf가 특정 모듈(vote.js)에만 정의되어 있으면 로딩 순서에 따라 ReferenceError가 발생할 수 있음.
// → 공용으로 window.sf를 제공 (기존 정의가 있으면 유지)
try{
  if(typeof window.sf !== 'function'){
    window.sf = function(u, t){
      try{ fUniv = u; }catch(e){ window.fUniv = u; }
      try{ fTier = t; }catch(e){ window.fTier = t; }
      try{ if(typeof render==='function') render(); }catch(e){}
    };
  }
}catch(e){}
// histSub 초기값 'race' — constants.js var가 진실 공급원
var miniSub='input', univmSub='input', ckSub='input', indSub='input', gjSub='input', compSub='league', histSub='race';
// WARNING fix: 암묵적 전역 방지 — 엄격 모드에서 접근 순서 문제 예방
window.histSub = window.histSub || histSub;
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
window.addEventListener('DOMContentLoaded', ()=>{
  try{ _primeMatchSyncSignature(true); }catch(e){}
}, { once:true });

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
function _normHexColor(v,fallback){
  const s=String(v||'').trim();
  if(/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  return fallback||'#6b7280';
}
function getFixedSideColors(kind){
  const k=String(kind||'').trim();
  const defaults = {
    ck: { a:'#2563eb', b:'#6366f1' },
    pro:{ a:'#0f766e', b:'#4f46e5' },
    tt: { a:'#2563eb', b:'#dc2626' }
  };
  const base = defaults[k] || defaults.ck;
  try{
    return {
      a:_normHexColor(localStorage.getItem(`su_team_color_${k}_a`), base.a),
      b:_normHexColor(localStorage.getItem(`su_team_color_${k}_b`), base.b)
    };
  }catch(e){
    return { a:base.a, b:base.b };
  }
}
function getFixedSideColor(kind, side, fallback){
  const colors = getFixedSideColors(kind);
  if(String(side||'').toUpperCase()==='B') return _normHexColor(colors.b, fallback||colors.b);
  return _normHexColor(colors.a, fallback||colors.a);
}
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
// ⚠️ 대학 아이콘(로고)은 코드에 하드코딩하지 않습니다.
// - 저작권/출처 이슈가 발생할 수 있어, 로고 URL은 data.json(univCfg.icon / univCfg.img)로만 관리합니다.
const UNIV_ICONS = {};
// 기본 대학 아이콘 SVG (아이콘이 없는 대학에 사용)
const DEFAULT_UNIV_ICON_SVG=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" data-univ-icon="1" style="flex-shrink:0;opacity:0.75;vertical-align:middle"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
// 대학명 옆에 아이콘 img 태그 반환 (아이콘 없으면 기본 SVG 반환)
function gUI(n,size='1em'){
  const url=(univCfg.find(x=>x.name===n)||{}).icon || (univCfg.find(x=>x.name===n)||{}).img || '';
  if(url)return `<img src="${toHttpsUrl(url)}" alt="" data-univ-icon="1" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;margin-right:3px;border-radius:var(--su_univ_logo_radius,2px);flex-shrink:0" onerror="this.style.display='none'">`;
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
    const url=(univCfg.find(x=>x.name===name)||{}).icon || (univCfg.find(x=>x.name===name)||{}).img || '';
    if(url){
      const img=document.createElement('img');
      img.src=url; img.setAttribute('data-univ-icon','1');
      img.style.cssText='width:1em;height:1em;object-fit:contain;vertical-align:middle;border-radius:var(--su_univ_logo_radius,2px);flex-shrink:0';
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

/* ELO 상수 */
const ELO_DEFAULT=1200;
const ELO_K=32;

function calcElo(winnerElo, loserElo){
  const exp=1/(1+Math.pow(10,(loserElo-winnerElo)/400));
  return Math.round(ELO_K*(1-exp));
}

// ─────────────────────────────────────────────
// 스트리머 이름 정규화/별명(메모) 매칭
// - 예: 김재현 memo에 "샤이니"가 있으면, 입력에 "샤이니"를 넣어도 "김재현"으로 저장되게
// - 별명/메모가 애매하거나 부분일치만 되면 후보 리스트를 반환
// ─────────────────────────────────────────────
function _cleanPlayerInputName(name){
  const raw = (name||'').trim();
  // 종족 접미사 제거: "김명운Z", "샤이니T"
  return raw.replace(/\s*[TZPN]$/i,'').trim();
}
function resolvePlayerName(rawName){
  const raw = (rawName||'').trim();
  const cleaned = _cleanPlayerInputName(raw);
  if(!cleaned) return {name:'', player:null, match:'empty', candidates:[]};

  // 1) 정확한 이름
  let p = (players||[]).find(x=>x && x.name===cleaned) || (players||[]).find(x=>x && x.name===raw);
  if(p) return {name:p.name, player:p, match:'name', candidates:[p]};

  // 2) 메모(별명) 정확 일치
  const low = cleaned.toLowerCase();
  const memoExact = (players||[]).filter(x=>x && x.memo && String(x.memo).split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
  if(memoExact.length===1) return {name:memoExact[0].name, player:memoExact[0], match:'memo', candidates:memoExact};

  // 3) 공백 제거 후 이름 일치
  const ns = cleaned.replace(/\s+/g,'');
  const nsMatches = (players||[]).filter(x=>x && x.name && x.name.replace(/\s+/g,'')===ns);
  if(nsMatches.length===1) return {name:nsMatches[0].name, player:nsMatches[0], match:'space', candidates:nsMatches};

  // 4) 후보 추천(부분 일치)
  const cand = [];
  const push = (pp, why)=>{
    if(!pp || !pp.name) return;
    if(cand.some(x=>x.p.name===pp.name)) return;
    cand.push({p:pp, why});
  };
  (players||[]).forEach(pp=>{
    if(!pp || !pp.name) return;
    const n = String(pp.name);
    if(n.includes(cleaned) || n.replace(/\s+/g,'').includes(ns)) push(pp,'name');
    else if(pp.memo){
      const toks = String(pp.memo).split(/[\s,，\n]+/).map(x=>x.trim()).filter(Boolean);
      if(toks.some(t=>t.toLowerCase().includes(low))) push(pp,'memo');
    }
  });
  cand.sort((a,b)=>(a.why===b.why? a.p.name.localeCompare(b.p.name) : (a.why==='name'?-1:1)));
  const candidates = cand.slice(0,8).map(x=>x.p);
  return {name: raw, player:null, match:'none', candidates};
}
// 전역 노출(모달/인라인 onclick에서 사용)
try{ window.resolvePlayerName = resolvePlayerName; }catch(e){}

function _normalizeStoredMode(mode){
  const raw = String(mode||'').trim();
  if(!raw) return '';
  const low = raw.toLowerCase();
  if(raw === '중장전') return '끝장전';
  if(raw === 'CK' || raw === '대학 ck' || raw === '대학 CK' || low === '대학ck') return '대학CK';
  if(raw === '일반' || raw === '프로리그 일반') return '프로리그';
  if(raw === '티어대회 일반' || raw === '티어 일반') return '티어대회';
  return raw;
}

// 날짜 문자열을 YYYY-MM-DD로 최대한 정규화한다.
// - 통계/정렬/월별 집계를 위해 "YYYY-MM" prefix가 안정적으로 나오게 하는 목적
// - 파싱 불가한 값은 원본(trim) 반환
function _toIsoDateStr(input){
  const s = String(input ?? '').trim();
  if(!s) return new Date().toISOString().slice(0,10);
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(!m) m = s.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/);
  if(!m) m = s.match(/^(\d{4})\s*(?:년)?\s*(\d{1,2})\s*(?:월)?\s*(\d{1,2})\s*(?:일)?$/);
  if(m){
    const yy = Number(m[1]), mm = Number(m[2]), dd = Number(m[3]);
    if(yy>=1990 && mm>=1 && mm<=12 && dd>=1 && dd<=31){
      return `${yy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
    }
  }
  // 최후: Date 파서 시도 (예: "2026-4-1", "2026/4/1 00:00" 등)
  try{
    const d = new Date(s);
    if(!isNaN(d.getTime())){
      const yy = d.getFullYear();
      const mm = d.getMonth()+1;
      const dd = d.getDate();
      if(yy>=1990 && mm>=1 && mm<=12 && dd>=1 && dd<=31){
        return `${yy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
      }
    }
  }catch(e){}
  return s;
}
try{ window._toIsoDateStr = _toIsoDateStr; }catch(e){}
function applyGameResult(winName, loseName, date, map, matchId, univW, univL, mode){
  // 정확한 이름 일치 우선, 없으면 메모 별명 fallback, 그 다음 공백 제거 후 일치
  function _findPlayer(name){
    // 종족 접미사 제거: "김명운Z", "샤이니T" 같이 이름 뒤에 종족이 붙은 입력도 허용
    // (붙여넣기/자동인식에서 자주 등장)
    const raw = (name||'').trim();
    const cleanedRace = raw.replace(/\s*[TZPN]$/i,'').trim();
    let p=players.find(x=>x.name===name);
    if(p)return p;
    // cleanedRace 우선으로도 재시도
    if (cleanedRace && cleanedRace !== name) {
      p = players.find(x => x.name === cleanedRace);
      if (p) return p;
    }
    const low=cleanedRace.toLowerCase();
    p=players.find(x=>x.memo&&x.memo.split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
    if(p)return p;
    const ns=cleanedRace.replace(/\s+/g,'');
    return players.find(x=>x.name.replace(/\s+/g,'')===ns)||null;
  }
  const w=_findPlayer(winName);
  const l=_findPlayer(loseName);
  if(!w||!l||w===l)return;
  if(!w.history)w.history=[];
  if(!l.history)l.history=[];
  // 중복 체크
  // - matchId가 있으면 matchId가 곧 고유키(게임 단위)라고 가정하고 matchId만으로 중복 판단
  //   (티어대회/대학CK 등에서 같은 날짜/같은 맵/같은 상대가 여러 번 나올 수 있어 date+map+opp로 막으면 누락됨)
  // - matchId가 없을 때만 date+map+opp로 중복 방지
  const d=_toIsoDateStr(date||'');
  const m=map||'-';
  // matchId 기반 체크
  const wDupMatch = matchId ? (w.history||[]).find(h=>h.matchId===matchId) : null;
  const lDupMatch = matchId ? (l.history||[]).find(h=>h.matchId===matchId) : null;
  if(wDupMatch||lDupMatch) return;
  // matchId가 없을 때만 fallback 사용
  if(!matchId){
    const wDupFallback=(w.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===l.name);
    const lDupFallback=(l.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===w.name);
    if(wDupFallback||lDupFallback) return;
  }
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
  const modeNorm = _normalizeStoredMode(mode);
  w.history.unshift({date:d,time:t,result:'승',opp:l.name,oppRace:l.race,map:m,matchId:matchId||'',eloDelta:delta,eloAfter:w.elo,univ:wu,mode:modeNorm});
  l.history.unshift({date:d,time:t,result:'패',opp:w.name,oppRace:w.race,map:m,matchId:matchId||'',eloDelta:-delta,eloAfter:l.elo,univ:lu,mode:modeNorm});
}

// (요청사항) 동률(2:2 등)도 "저장"되도록 — 무승부 기록
// - 승/패/포인트/ELO에는 영향 없음
// - 스트리머 상세(최근 경기 기록) 및 대전기록 탭에서 확인 가능
// - matchId는 충돌 방지를 위해 호출부에서 기존 matchId에 "_tie" 같은 suffix를 붙이는 것을 권장
function applyDrawResult(nameA, nameB, date, map, matchId, univA, univB, mode, scoreA, scoreB){
  function _findPlayer(name){
    const raw = (name||'').trim();
    const cleanedRace = raw.replace(/\s*[TZPN]$/i,'').trim();
    let p=players.find(x=>x.name===name);
    if(p)return p;
    if (cleanedRace && cleanedRace !== name) {
      p = players.find(x => x.name === cleanedRace);
      if (p) return p;
    }
    const low=cleanedRace.toLowerCase();
    p=players.find(x=>x.memo&&x.memo.split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
    if(p)return p;
    const ns=cleanedRace.replace(/\s+/g,'');
    return players.find(x=>x.name.replace(/\s+/g,'')===ns)||null;
  }
  const a=_findPlayer(nameA);
  const b=_findPlayer(nameB);
  if(!a||!b||a===b) return;
  if(!a.history)a.history=[];
  if(!b.history)b.history=[];
  const d=_toIsoDateStr(date||'');
  const m=map||'-';
  // 중복 체크: matchId가 있으면 matchId만으로 판단(게임 단위 중복 허용 방지)
  const aDup = matchId ? (a.history||[]).find(h=>h.matchId===matchId) : null;
  const bDup = matchId ? (b.history||[]).find(h=>h.matchId===matchId) : null;
  if(aDup||bDup) return;
  // matchId 없을 때만 fallback
  if(!matchId){
    const aDupFallback=(a.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===b.name&&h.result==='무');
    const bDupFallback=(b.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===a.name&&h.result==='무');
    if(aDupFallback||bDupFallback) return;
  }
  const t=Date.now();
  const au=univA||a.univ||'';
  const bu=univB||b.univ||'';
  const scoreStr = (scoreA!=null && scoreB!=null) ? `${scoreA}:${scoreB}` : '';
  // eloDelta는 null로 두어 UI에서 "-" 처리되게 함
  const modeNorm = _normalizeStoredMode(mode);
  a.history.unshift({date:d,time:t,result:'무',opp:b.name,oppRace:b.race,map:m,matchId:matchId||'',eloDelta:null,eloAfter:a.elo||ELO_DEFAULT,univ:au,mode:modeNorm,score:scoreStr});
  b.history.unshift({date:d,time:t,result:'무',opp:a.name,oppRace:a.race,map:m,matchId:matchId||'',eloDelta:null,eloAfter:b.elo||ELO_DEFAULT,univ:bu,mode:modeNorm,score:scoreStr});
}

function _rebuildAllPlayerHistoryCore() {
  // 1. 모든 선수의 history, win, loss, points, elo 초기화
  players.forEach(p => {
    p.history = [];
    p.win = 0;
    p.loss = 0;
    p.points = 0;
    p.elo = ELO_DEFAULT;
  });

  let count = 0;
  function _ensureMid(m, prefix, idx){
    let id = String((m && (m._id || m.sid || m.id)) || '').trim();
    if(!id){
      const d = _toIsoDateStr(m && m.d || '');
      const a = String(m && (m.a || m.wName || '') || '').replace(/\s+/g,'').slice(0,16);
      const b = String(m && (m.b || m.lName || '') || '').replace(/\s+/g,'').slice(0,16);
      id = `${prefix}:${d}:${a}:${b}:${idx}`;
    }
    try{ if(m) m._id = id; }catch(e){}
    return id;
  }

  // 2. miniM에서 복구
  (miniM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'mini', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        // (요청/수정) 시빌워(내전)는 팀 라벨(A/B)과 무관하게 "선수 실제 소속 대학"을 기록
        // → univW/univL을 비워두면 applyGameResult가 w.univ / l.univ를 사용
        const isCivil = (m.type === 'civil') || (m.a === 'A팀' && m.b === 'B팀');
        const univW = isCivil ? '' : (g.winner === 'A' ? (m.a || '') : (m.b || ''));
        const univL = isCivil ? '' : (g.winner === 'A' ? (m.b || '') : (m.a || ''));
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, m.type === 'civil' ? '시빌워' : '미니대전', { sideUnivA: m.a, sideUnivB: m.b });
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, m.type === 'civil' ? '시빌워' : '미니대전');
        }
        count++;
      });
    });
  });

  // 3. univM에서 복구
  (univM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'univ', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const univW = g.winner === 'A' ? m.a : m.b;
        const univL = g.winner === 'A' ? m.b : m.a;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, '대학대전', { sideUnivA: m.a, sideUnivB: m.b });
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, '대학대전');
        }
        count++;
      });
    });
  });

  // 4. ckM에서 복구
  (ckM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'ck', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(m.teamAMembers || g.teamA, m.teamBMembers || g.teamB, g.winner, m.d, g.map || '-', gameId, '대학CK');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '대학CK');
        }
        count++;
      });
    });
  });

  // 5. proM에서 복구
  (proM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'pro', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(m.teamAMembers || g.teamA, m.teamBMembers || g.teamB, g.winner, m.d, g.map || '-', gameId, '프로리그');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '프로리그');
        }
        count++;
      });
    });
  });

  // 6. ttM에서 복구
  (ttM || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'tt', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(m.teamAMembers || g.teamA, m.teamBMembers || g.teamB, g.winner, m.d, g.map || '-', gameId, '티어대회');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '티어대회');
        }
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
  (comps || []).forEach((m, mi) => {
    const mid = _ensureMid(m, 'comp', mi);
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const univW = g.winner === 'A' ? m.a : m.b;
        const univL = g.winner === 'A' ? m.b : m.a;
        const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, '대회', { sideUnivA: m.a, sideUnivB: m.b });
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, '대회');
        }
        count++;
      });
    });
  });

  // 10. tourneys에서 복구
  if (typeof tourneys !== 'undefined') {
    tourneys.forEach((tn, tnIdx) => {
      const isTier = tn.type === 'tier';
      (tn.groups || []).forEach(grp => {
        (grp.matches || []).forEach((m, mi) => {
          const mid = _ensureMid(m, `tourG${tnIdx}`, mi);
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
              if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
                applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, isTier ? '티어대회' : '조별리그', { sideUnivA: m.a, sideUnivB: m.b });
              } else {
                applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '조별리그');
              }
              count++;
            });
          });
        });
      });
      Object.values((tn.bracket || {}).matchDetails || {}).forEach((m, mi) => {
        const mid = _ensureMid(m, `tourB${tnIdx}`, mi);
        (m.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
            if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
              applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, isTier ? '티어대회' : '대회', { sideUnivA: m.a, sideUnivB: m.b });
            } else {
              applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '대회');
            }
            count++;
          });
        });
      });
      ((tn.bracket || {}).manualMatches || []).forEach((m, mi) => {
        const mid = _ensureMid(m, `tourM${tnIdx}`, mi);
        (m.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
            if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
              applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, isTier ? '티어대회' : '대회', { sideUnivA: m.a, sideUnivB: m.b });
            } else {
              applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '대회');
            }
            count++;
          });
        });
      });
    });
  }

  // 10-b. tourneys의 normalMatches에서 복구 [BUGFIX: 누락 수정]
  if (typeof tourneys !== 'undefined') {
    tourneys.forEach((tn, tnIdx) => {
      if (tn.type === 'tier') return;
      (tn.normalMatches || []).forEach((m, mi) => {
        const mid = _ensureMid(m, `tourNM${tnIdx}`, mi);
        (m.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const univW = g.winner === 'A' ? (m.a || '') : (m.b || '');
            const univL = g.winner === 'A' ? (m.b || '') : (m.a || '');
            const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
            applyGameResult(wName, lName, m.d || '', g.map || '', gameId, univW, univL, '대회');
            count++;
          });
        });
      });
    });
  }

  // 11. proTourneys에서 복구
  if (typeof proTourneys !== 'undefined') {
    proTourneys.forEach((tn, tnIdx) => {
      (tn.groups || []).forEach(grp => {
        (grp.matches || []).forEach((m, matchIdx) => {
          const mid = _ensureMid(m, `pTG${tnIdx}`, matchIdx);
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
              applyGameResult(wName, lName, m.d || '', g.map || '', gameId, '', '', '프로리그대회');
              count++;
            });
          });
        });
      });
      (tn.bracket || []).forEach((rnd, rndIdx) => {
        rnd.forEach((m, matchIdx) => {
          if (!m) return;
          const mid = _ensureMid(m, `pTB${tnIdx}_${rndIdx}`, matchIdx);
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || g.sid || `${mid}_s${setIdx}_g${gameIdx}`;
              applyGameResult(wName, lName, m.d || '', g.map || '', gameId, '', '', '프로리그대회');
              count++;
            });
          });
        });
      });
      if (tn.thirdPlace) {
        const tp = tn.thirdPlace;
        const tpid = _ensureMid(tp, `pT3${tnIdx}`, 0);
        (tp.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || g.sid || `${tpid}_s${setIdx}_g${gameIdx}`;
            applyGameResult(wName, lName, tp.d || '', g.map || '', gameId, '', '', '프로리그대회');
            count++;
          });
        });
      }
      (tn.teamMatches || []).forEach((tm, tmIdx) => {
        const tmid = _ensureMid(tm, `pTTM${tnIdx}`, tmIdx);
        (tm.games || []).forEach((g, gameIdx) => {
          if (!g.wName || !g.lName) return;
          const gameId = g._id || g.sid || `${tmid}_g${gameIdx}`;
          applyGameResult(g.wName, g.lName, tm.d || '', g.map || '', gameId, '', '', '프로리그대회');
          count++;
        });
      });
    });
  }

  return count;
}
function rebuildAllPlayerHistory() {
  if(!confirm('모든 스트리머의 경기 기록을 대전 데이터에서 다시 생성합니다.\n\n⚠️ 기존 history가 초기화되고 대전 기록 기반으로 재구성됩니다.\n\n계속하시겠습니까?')) return;
  const count = _rebuildAllPlayerHistoryCore();
  save();
  alert(`✅ ${count}개의 경기가 스트리머 기록에 복구되었습니다!`);
  render();
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

/* ══════════════════════════════════════
   탭 버튼 색상 커스텀 시스템
   - localStorage: su_tab_colors_v1
   - ctx별 탭 활성(on) 색상 커스텀
══════════════════════════════════════ */
