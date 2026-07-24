/* ══════════════════════════════════════
   stats-player-report.js
   통계 탭 > 🔍 리포트 > 📡 스트리머 리포트
   - 스트리머 검색 후 개별 종합 리포트 (기본 정보, 기간별 승률 게이지,
     맵별 성적, 핵심 분석 결과, AI 분석 코멘트, 최근전적, ELO 보드,
     동일 티어 상대전적, 1:1 비교)
   - AI 분석 코멘트: 규칙 기반 템플릿 문장 (외부 API 미사용)
   - ELO 보드: eloboard.com 외부 링크만 연결 (개인 URL 등록 기능 없음)
══════════════════════════════════════ */

/* ─── 상태 (var 사용 — 지연 로딩 재실행 시 재선언 충돌 방지) ─── */
if(window._prName===undefined) window._prName = '';
if(window._prPeriod===undefined) window._prPeriod = 'all'; // 30 | 90 | season | all
if(window._prExcludeMini===undefined) window._prExcludeMini = false;
if(window._prExcludeUniv===undefined) window._prExcludeUniv = false;
if(window._prExcludeCk===undefined) window._prExcludeCk = false;
if(window._prExcludeTier===undefined) window._prExcludeTier = false;
if(window._prExcludeNormalTour===undefined) window._prExcludeNormalTour = false;
if(window._prVsOpp===undefined) window._prVsOpp = '';
if(window._prTableLimit===undefined) window._prTableLimit = 20;

var PR_RECENT_KEY = 'su_prReportRecent';

function _prLoadRecent(){
  try{ return JSON.parse(localStorage.getItem(PR_RECENT_KEY)||'[]'); }catch(e){ return []; }
}
function _prSaveRecent(name){
  try{
    let arr = _prLoadRecent().filter(n=>n!==name);
    arr.unshift(name);
    arr = arr.slice(0,8);
    localStorage.setItem(PR_RECENT_KEY, JSON.stringify(arr));
  }catch(e){}
}

/* ─── 스타일 주입 (1회) ─── */
(function _prInjectCss(){
  if(document.getElementById('pr-report-style')) return;
  const s=document.createElement('style');
  s.id='pr-report-style';
  s.textContent = [
    '.pr-search-wrap{position:relative;max-width:480px}',
    '.pr-search-input{width:100%;box-sizing:border-box;padding:12px 16px;font-size:var(--fs-md);border:1.5px solid var(--border2);border-radius:999px;font-family:inherit;transition:border-color .15s}',
    '.pr-search-input:focus{outline:none;border-color:var(--blue)}',
    '.pr-search-drop{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--white);border:1px solid var(--border);border-radius:var(--r2);box-shadow:var(--sh3);max-height:360px;overflow-y:auto;z-index:50}',
    '.pr-search-row{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--border)}',
    '.pr-search-row:last-child{border-bottom:none}',
    '.pr-search-row:hover{background:var(--surface)}',
    '.pr-recent-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:999px;background:var(--surface);border:1px solid var(--border);font-size:12px;font-weight:700;cursor:pointer;color:var(--text2)}',
    '.pr-recent-chip:hover{background:var(--blue-l);border-color:var(--blue)}',
    '.pr-hero{display:flex;align-items:center;gap:18px;padding:22px;border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:var(--sh2);flex-wrap:wrap;margin-bottom:14px}',
    '.pr-hero-photo{width:84px;height:84px;border-radius:var(--su_profile_radius,20px);overflow:hidden;flex-shrink:0;box-shadow:var(--sh2)}',
    '.pr-hero-name{font-size:24px;font-weight:950;letter-spacing:-.02em;color:var(--text1);display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.pr-hero-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:9px}',
    '.pr-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;font-size:12px;font-weight:800;white-space:nowrap}',
    '.pr-hero-actions{display:flex;gap:8px;margin-left:auto;flex-wrap:wrap}',
    '.pr-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer;border:1px solid var(--border2);background:var(--white);color:var(--text2);text-decoration:none;transition:.15s}',
    '.pr-btn:hover{background:var(--surface);border-color:var(--blue)}',
    '.pr-btn.pr-btn-elo{background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border-color:transparent}',
    '.pr-btn.pr-btn-elo:hover{filter:brightness(1.06)}',
    '.pr-period-bar{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}',
    '.pr-period-btn{padding:7px 16px;border-radius:999px;border:1px solid var(--border2);background:var(--white);font-size:12px;font-weight:800;cursor:pointer;color:var(--text3)}',
    '.pr-period-btn.on{background:var(--blue);border-color:var(--blue);color:#fff}',
    '.pr-wr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}',
    '.pr-wr-card{padding:16px;border-radius:18px;background:var(--white);border:1px solid var(--border);box-shadow:var(--sh);text-align:center}',
    '.pr-wr-card .pr-wr-label{font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px}',
    '.pr-wr-card .pr-wr-pct{font-size:28px;font-weight:950;line-height:1.1}',
    '.pr-wr-card .pr-wr-rec{font-size:11px;color:var(--text3);margin-top:4px;font-weight:700}',
    '.pr-ai-box{padding:18px 20px;border-radius:18px;background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #dbeafe;display:flex;gap:12px;align-items:flex-start}',
    '.pr-ai-icon{font-size:22px;flex-shrink:0}',
    '.pr-ai-text{font-size:13px;line-height:1.75;color:var(--text2);font-weight:600}',
    '.pr-strip{display:flex;gap:4px;flex-wrap:wrap;align-items:center}',
    '.pr-strip-sq{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff;flex-shrink:0;cursor:default}',
    '.pr-toggle{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--text3);cursor:pointer;user-select:none}',
    '.pr-tier-opp-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--border);font-size:13px;flex-wrap:wrap}',
    '.pr-tier-opp-row:last-child{border-bottom:none}',
    '.pr-vs-select{padding:8px 12px;border-radius:10px;border:1px solid var(--border2);font-size:13px;font-family:inherit;max-width:240px}',
    '.pr-vs-box{display:flex;align-items:center;justify-content:center;gap:20px;padding:20px 0;flex-wrap:wrap}',
    '.pr-vs-side{text-align:center;flex:1;min-width:110px}',
    '.pr-predict-bar{height:24px;border-radius:999px;overflow:hidden;display:flex;background:var(--surface);margin-top:8px}',
    '.pr-empty{padding:60px 20px;text-align:center;color:var(--gray-l)}',
    '.pr-sec-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 14px}',
    '.pr-sec-head h4{margin:0;border:none;padding:0;font-size:15px}',
    '.pr-sec-sub{font-size:11px;color:var(--text3);font-weight:700}',
    '.pr-info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px}',
    '.pr-info-card{text-align:center;padding:14px 8px;border-radius:16px;background:var(--surface);border:1px solid var(--border)}',
    '.pr-info-num{font-size:23px;font-weight:950;line-height:1.15}',
    '.pr-info-lbl{font-size:11px;color:var(--text3);font-weight:800;margin-top:5px}',
    '.pr-gauge-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px}',
    '.pr-gauge-card{text-align:center}',
    '.pr-gauge-ring{width:92px;height:92px;border-radius:50%;margin:0 auto 8px;position:relative}',
    '.pr-gauge-ring::before{content:"";position:absolute;inset:9px;border-radius:50%;background:var(--white)}',
    '.pr-gauge-pct{position:absolute;inset:9px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:950}',
    '.pr-gauge-lbl{font-size:12px;font-weight:800;color:var(--text2)}',
    '.pr-gauge-rec{font-size:10.5px;color:var(--text3);font-weight:700;margin-top:2px}',
    '.pr-bar-row{display:flex;align-items:center;gap:10px;padding:6px 0}',
    '.pr-bar-lbl{width:66px;flex-shrink:0;font-size:12px;font-weight:800;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.pr-bar-track{flex:1;height:20px;border-radius:999px;background:var(--surface);overflow:hidden}',
    '.pr-bar-fill{height:100%;border-radius:999px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;box-sizing:border-box;color:#fff;font-size:10px;font-weight:900;white-space:nowrap;transition:width .3s}',
    '.pr-bar-rec{width:76px;flex-shrink:0;font-size:11px;color:var(--text3);font-weight:700;text-align:right}',
    '.pr-highlight-row{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:14px;margin-bottom:8px;font-size:12.5px;font-weight:700;color:var(--text2);line-height:1.5}',
    '.pr-highlight-row:last-child{margin-bottom:0}',
    '.pr-highlight-row b{font-weight:900;color:var(--text1)}',
    '.pr-hi-icon{font-size:17px;flex-shrink:0}',
    '@media(max-width:640px){.pr-hero{padding:16px}.pr-hero-photo{width:64px;height:64px}.pr-hero-name{font-size:19px}.pr-hero-actions{margin-left:0;width:100%}.pr-hero-actions .pr-btn{flex:1;justify-content:center}.pr-info-grid{grid-template-columns:repeat(2,1fr)}.pr-gauge-grid{grid-template-columns:repeat(2,1fr)}}'
  ].join('\n');
  document.head.appendChild(s);
})();

/* ─── 기간 필터 ─── */
function _prPeriodRange(period){
  const now=new Date();
  const toStr=d=>d.toISOString().slice(0,10);
  if(period==='30'){ const d=new Date(now); d.setDate(d.getDate()-30); return {from:toStr(d), to:toStr(now)}; }
  if(period==='90'){ const d=new Date(now); d.setDate(d.getDate()-90); return {from:toStr(d), to:toStr(now)}; }
  if(period==='season'){ return {from:`${now.getFullYear()}-01-01`, to:toStr(now)}; }
  return {from:'', to:''};
}
function _prFilterHistByPeriod(hist, period){
  const {from,to} = _prPeriodRange(period);
  if(!from) return (hist||[]).slice();
  return (hist||[]).filter(h=>{
    const d = (typeof window._toIsoDateStr==='function') ? window._toIsoDateStr(h.date) : String(h.date||'');
    return d>=from && (!to || d<=to);
  });
}
function _prRaceStats(hist){
  const rv={T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}};
  let w=0,l=0;
  (hist||[]).forEach(h=>{
    if(h.result==='승'){ w++; if(rv[h.oppRace]) rv[h.oppRace].w++; }
    else if(h.result==='패'){ l++; if(rv[h.oppRace]) rv[h.oppRace].l++; }
  });
  const tot=w+l;
  const wr = tot ? Math.round(w/tot*100) : 0;
  return {w,l,tot,wr,rv};
}

/* ─── 승률 색상 헬퍼 (강세=초록 / 균등=주황 / 약세=빨강) ─── */
function _prWrColor(wr){
  if(wr>=55) return '#16a34a';
  if(wr>=38) return '#f59e0b';
  return '#ef4444';
}
function _prGaugeCardHTML(label, w, l, icon){
  const tot=w+l; const wr= tot? Math.round(w/tot*100):0;
  const color=_prWrColor(wr);
  return `<div class="pr-gauge-card">
    <div class="pr-gauge-ring" style="background:conic-gradient(${color} ${wr*3.6}deg, var(--border) 0deg)">
      <div class="pr-gauge-pct" style="color:${color}">${wr}%</div>
    </div>
    <div class="pr-gauge-lbl">${icon} ${escHTML(label)}</div>
    <div class="pr-gauge-rec">${w}승 ${l}패</div>
  </div>`;
}
/* ─── 승률 게이지 카드 그룹 (전체 승률 단독) ─── */
function _prOverallGaugeHTML(stats){
  return `<div style="display:flex;justify-content:center">${_prGaugeCardHTML('전체 승률', stats.w, stats.l, '🎮')}</div>`;
}
/* 하위 호환용 (다른 곳에서 참조 시 전체+종족 게이지 그리드) */
function _prWinRateCardsHTML(stats){
  const RACE_LABEL={P:'프로토스전',T:'테란전',Z:'저그전'};
  const RACE_ICON={P:'🔵',T:'🔴',Z:'🟣'};
  let h=`<div class="pr-gauge-grid">`;
  h+=_prGaugeCardHTML('전체 승률', stats.w, stats.l, '🎮');
  h+=_prGaugeCardHTML(RACE_LABEL.P, stats.rv.P.w, stats.rv.P.l, RACE_ICON.P);
  h+=_prGaugeCardHTML(RACE_LABEL.T, stats.rv.T.w, stats.rv.T.l, RACE_ICON.T);
  h+=_prGaugeCardHTML(RACE_LABEL.Z, stats.rv.Z.w, stats.rv.Z.l, RACE_ICON.Z);
  h+=`</div>`;
  return h;
}
/* ─── 종족 전적 (동일 종족전 포함 · 상대 종족별 전적 바) ─── */
function _prRaceBarsHTML(stats){
  const RACE_LABEL={P:'프로토스전',T:'테란전',Z:'저그전'};
  const RACE_ICON={P:'🔵',T:'🔴',Z:'🟣'};
  let h=`<div>`;
  ['P','T','Z'].forEach(r=>{
    const rv=stats.rv[r]; const tot=rv.w+rv.l; const wr= tot? Math.round(rv.w/tot*100):0;
    const color=_prWrColor(wr);
    h+=`<div class="pr-bar-row">
      <div class="pr-bar-lbl">${RACE_ICON[r]} ${escHTML(RACE_LABEL[r])}</div>
      <div class="pr-bar-track"><div class="pr-bar-fill" style="width:${tot?Math.max(wr,10):0}%;background:${color}">${tot?wr+'%':'-'}</div></div>
      <div class="pr-bar-rec">${rv.w}승 ${rv.l}패</div>
    </div>`;
  });
  h+=`</div>`;
  return h;
}
/* ─── 기본 정보 (전체 통산) ─── */
function _prInfoGridHTML(p){
  const w=p.win||0, l=p.loss||0, tot=w+l;
  const wr= tot? Math.round(w/tot*100):0;
  function card(num, lbl, color){
    return `<div class="pr-info-card"><div class="pr-info-num" style="color:${color||'var(--text1)'}">${num}</div><div class="pr-info-lbl">${escHTML(lbl)}</div></div>`;
  }
  return `<div class="pr-info-grid">
    ${card(tot+'전', '총 경기수')}
    ${card(w+'승', '승리', 'var(--score-win)')}
    ${card(l+'패', '패배', 'var(--score-lose)')}
    ${card(wr+'%', '통산 승률', _prWrColor(wr))}
  </div>`;
}
/* ─── 맵별 성적 ─── */
function _prMapStats(hist){
  const m={};
  (hist||[]).forEach(h=>{
    if(h.result!=='승' && h.result!=='패') return;
    const map = (h.map && h.map!=='-') ? h.map : null;
    if(!map) return;
    if(!m[map]) m[map]={w:0,l:0};
    if(h.result==='승') m[map].w++; else m[map].l++;
  });
  return Object.entries(m).map(([map,r])=>{
    const tot=r.w+r.l;
    return {map, w:r.w, l:r.l, tot, wr: tot? Math.round(r.w/tot*100):0};
  }).sort((a,b)=>b.tot-a.tot);
}
function _prMapBarsHTML(mapStats){
  if(!mapStats.length) return `<div style="color:var(--gray-l);font-size:12px;padding:10px 0">맵 기록이 없습니다</div>`;
  let h=`<div>`;
  mapStats.forEach(m=>{
    const color=_prWrColor(m.wr);
    h+=`<div class="pr-bar-row">
      <div class="pr-bar-lbl" title="${escAttr(m.map)}">${escHTML(m.map)}</div>
      <div class="pr-bar-track"><div class="pr-bar-fill" style="width:${Math.max(m.wr,10)}%;background:${color}">${m.wr}%</div></div>
      <div class="pr-bar-rec">${m.w}승 ${m.l}패</div>
    </div>`;
  });
  h+=`</div>`;
  return h;
}
/* ─── 핵심 분석 결과 (하이라이트 콜아웃) ─── */
function _prKeyInsightsHTML(stats, mapStats){
  const RACE_KO={T:'테란',Z:'저그',P:'프로토스'};
  const rows=[];
  const raceEntries=['T','Z','P'].map(r=>{
    const rv=stats.rv[r]; const t=rv.w+rv.l;
    return {r, w:rv.w, l:rv.l, tot:t, wr: t? Math.round(rv.w/t*100):0};
  }).filter(e=>e.tot>=2);
  if(raceEntries.length){
    const best=raceEntries.slice().sort((a,b)=>b.wr-a.wr)[0];
    const worst=raceEntries.slice().sort((a,b)=>a.wr-b.wr)[0];
    rows.push({icon:'🏆', bg:'#ecfdf5', html:`가장 강한 종족전: <b>${RACE_KO[best.r]}전</b> ${best.w}승 ${best.l}패 (승률 ${best.wr}%)`});
    if(worst.r!==best.r){
      rows.push({icon:'⚠️', bg:'#fff7ed', html:`가장 약한 종족전: <b>${RACE_KO[worst.r]}전</b> ${worst.w}승 ${worst.l}패 (승률 ${worst.wr}%)`});
    }
  }
  const mapsEligible = mapStats.filter(m=>m.tot>=3);
  if(mapsEligible.length){
    const bestMap = mapsEligible.slice().sort((a,b)=>b.wr-a.wr)[0];
    const worstMap = mapsEligible.slice().sort((a,b)=>a.wr-b.wr)[0];
    rows.push({icon:'🗺️', bg:'#eff6ff', html:`가장 강한 맵: <b>${escHTML(bestMap.map)}</b> ${bestMap.w}승 ${bestMap.l}패 (승률 ${bestMap.wr}%)`});
    if(worstMap.map!==bestMap.map){
      rows.push({icon:'🚧', bg:'#fef2f2', html:`가장 어려운 맵: <b>${escHTML(worstMap.map)}</b> ${worstMap.w}승 ${worstMap.l}패 (승률 ${worstMap.wr}%)`});
    }
  }
  if(!rows.length) return `<div style="color:var(--gray-l);font-size:12px;padding:10px 0">분석할 데이터가 부족합니다 (표본 부족)</div>`;
  return rows.map(r=>`<div class="pr-highlight-row" style="background:${r.bg}"><span class="pr-hi-icon">${r.icon}</span><span>${r.html}</span></div>`).join('');
}

/* ─── AI 분석 코멘트 (규칙 기반) ─── */
function _prAiCommentHTML(p, histPeriod, stats, periodLabel){
  const sentences=[];
  if(!stats.tot){
    sentences.push(`${p.name} 선수는 ${periodLabel} 기간 동안 기록된 경기가 없습니다.`);
  } else {
    if(stats.wr>=65) sentences.push(`${periodLabel} 승률 ${stats.wr}%(${stats.w}승 ${stats.l}패)로 컨디션이 매우 좋습니다.`);
    else if(stats.wr>=50) sentences.push(`${periodLabel} 승률 ${stats.wr}%(${stats.w}승 ${stats.l}패)로 평균 이상의 흐름을 보이고 있습니다.`);
    else if(stats.wr>=35) sentences.push(`${periodLabel} 승률 ${stats.wr}%(${stats.w}승 ${stats.l}패)로 다소 아쉬운 성적입니다.`);
    else sentences.push(`${periodLabel} 승률 ${stats.wr}%(${stats.w}승 ${stats.l}패)로 최근 고전하고 있습니다.`);

    const RACE_KO={T:'테란',Z:'저그',P:'프로토스'};
    const raceEntries=['T','Z','P'].map(r=>{
      const rv=stats.rv[r]; const t=rv.w+rv.l;
      return {r, w:rv.w, l:rv.l, tot:t, wr: t? Math.round(rv.w/t*100):null};
    }).filter(e=>e.tot>=2);
    if(raceEntries.length){
      const best=raceEntries.slice().sort((a,b)=>b.wr-a.wr)[0];
      const worst=raceEntries.slice().sort((a,b)=>a.wr-b.wr)[0];
      if(best && best.wr>=60) sentences.push(`${RACE_KO[best.r]}전에서 ${best.wr}%(${best.w}승 ${best.l}패)로 강한 모습을 보였습니다.`);
      if(worst && (!best || worst.r!==best.r) && worst.wr<=40) sentences.push(`반면 ${RACE_KO[worst.r]}전은 ${worst.wr}%(${worst.w}승 ${worst.l}패)로 약점으로 보입니다.`);
    }

    const sorted = histPeriod.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    let streak=0, streakType='';
    for(const h of sorted){
      if(h.result!=='승' && h.result!=='패') continue;
      if(!streakType){ streakType=h.result; streak=1; continue; }
      if(h.result===streakType) streak++;
      else break;
    }
    if(streak>=3){
      sentences.push(streakType==='승' ? `최근 ${streak}연승 중으로 상승세를 타고 있습니다.` : `최근 ${streak}연패 중으로 반등이 필요한 시점입니다.`);
    }
  }
  return `<div class="pr-ai-box"><div class="pr-ai-icon">🤖</div><div class="pr-ai-text">${sentences.map(s=>escHTML(s)).join(' ')}</div></div>`;
}

/* ─── 제외 필터 (미니대전/대학대전/대학CK/티어대회/일반대회) ─── */
// 일반대회 = 일반대회 소속의 일반경기(대회(일반경기)) + 조별리그 + 대진표기록(대회) 전부 포함
var PR_NORMAL_TOUR_MODES = ['대회(일반경기)','조별리그','대회'];
function _prExcludeFilter(hist){
  return (hist||[]).filter(h=>{
    if(window._prExcludeMini && h.mode==='미니대전') return false;
    if(window._prExcludeUniv && h.mode==='대학대전') return false;
    if(window._prExcludeCk && h.mode==='대학CK') return false;
    if(window._prExcludeTier && h.mode==='티어대회') return false;
    if(window._prExcludeNormalTour && PR_NORMAL_TOUR_MODES.includes(h.mode)) return false;
    return true;
  });
}
function _prExcludeTogglesHTML(){
  const opts=[
    ['_prExcludeMini','🚫 미니대전 제외'],
    ['_prExcludeUniv','🚫 대학대전 제외'],
    ['_prExcludeCk','🚫 대학CK 제외'],
    ['_prExcludeTier','🚫 티어대회 제외'],
    ['_prExcludeNormalTour','🚫 일반대회 제외 (일반·조별리그·대진표기록)'],
  ];
  return `<div style="display:flex;gap:12px;flex-wrap:wrap">${opts.map(([key,lbl])=>
    `<label class="pr-toggle"><input type="checkbox" ${window[key]?'checked':''} onchange="window.${key}=this.checked;render()"> ${lbl}</label>`
  ).join('')}</div>`;
}
/* ─── 전체 경기 승률 요약 (제외 필터 적용 · 전체 승률 + 종족별 승률) ─── */
function _prAllMatchesWinRateHTML(filtered){
  if(!filtered.length) return '';
  const stats = _prRaceStats(filtered);
  return `<div style="margin-bottom:14px">
    ${_prRaceBarsHTML(stats)}
  </div>`;
}
/* ─── 전체 경기 스트립 ─── */
function _prImportantStripHTML(histAll){
  const filtered = _prExcludeFilter(histAll);
  let h = _prAllMatchesWinRateHTML(filtered);
  const sorted = filtered.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const recent = sorted.slice(0,20).reverse();
  if(!recent.length) return h + `<div style="color:var(--gray-l);font-size:12px;padding:10px 0">표시할 경기가 없습니다</div>`;
  h+=`<div class="pr-strip">`;
  recent.forEach(hh=>{
    const isWin = hh.result==='승';
    const isDraw = hh.result==='무';
    const bg = isWin?'var(--score-win)':isDraw?'#94a3b8':'var(--score-lose)';
    const lbl = isWin?'W':isDraw?'D':'L';
    h+=`<div class="pr-strip-sq" style="background:${bg}" title="${escAttr(hh.date||'')} vs ${escAttr(hh.opp||'')} (${escAttr(hh.mode||'')})">${lbl}</div>`;
  });
  h+=`</div>`;
  h+=`<div style="font-size:10px;color:var(--gray-l);margin-top:6px">과거 → 최신 순 · 최근 ${recent.length}경기 (전체 ${filtered.length}경기 중)</div>`;
  return h;
}

/* ─── 동일 티어 상대전적 (최근 90일) ─── */
function _prTierOpponentsHTML(p){
  const hist90 = _prFilterHistByPeriod(_statsAllHist(p), '90');
  const myTier = p.tier;
  const map = {};
  hist90.forEach(h=>{
    const oppP = (players||[]).find(x=>x && x.name===h.opp);
    if(!oppP || oppP.tier!==myTier) return;
    if(!map[h.opp]) map[h.opp]={w:0,l:0,race:h.oppRace||oppP.race||''};
    if(h.result==='승') map[h.opp].w++;
    else if(h.result==='패') map[h.opp].l++;
  });
  const rows = Object.entries(map).map(([name,rec])=>({name,...rec,tot:rec.w+rec.l}))
    .filter(r=>r.tot>0)
    .sort((a,b)=>b.tot-a.tot);
  if(!rows.length) return `<div style="color:var(--gray-l);font-size:12px;padding:10px 0">최근 90일 내 동일 티어 상대전적이 없습니다</div>`;
  let h=`<div style="border:1px solid var(--border);border-radius:var(--r2);overflow:hidden">`;
  rows.forEach(r=>{
    const wr = r.tot? Math.round(r.w/r.tot*100):0;
    const badge = (r.tot>=3 && wr>=70) ? ' 🔥' : (r.tot>=3 && wr<=20) ? ' 🥶' : '';
    h+=`<div class="pr-tier-opp-row">
      ${getPlayerPhotoHTML(r.name,'34px')}
      <span class="rbadge r${r.race||''}" style="font-size:10px">${r.race||''}</span>
      <span style="font-weight:800;color:var(--blue);cursor:pointer;flex:1" onclick="openPlayerModal('${escJS(r.name)}')">${escHTML(r.name)}</span>
      <span style="font-weight:700">${r.w}승 ${r.l}패${badge}</span>
      <button class="pr-btn" style="padding:5px 10px;font-size:11px" onclick="openPlayerModal('${escJS(r.name)}')">👤 상세프로필</button>
    </div>`;
  });
  h+=`</div>`;
  return h;
}

/* ─── 1:1 상대 비교 + 규칙 기반 승부 예측 (ELO 표준 공식) ─── */
function _prOpponentList(p){
  const set=new Set();
  _statsAllHist(p).forEach(h=>{ if(h.opp) set.add(h.opp); });
  return [...set].sort((a,b)=>a.localeCompare(b,'ko'));
}
function _prHeadToHead(hist, oppName){
  let w=0,l=0;
  (hist||[]).forEach(h=>{ if(h.opp!==oppName) return; if(h.result==='승') w++; else if(h.result==='패') l++; });
  return {w,l,tot:w+l};
}
function _prVsCompareHTML(p){
  const opts = _prOpponentList(p);
  if(!opts.length) return `<div style="color:var(--gray-l);font-size:12px;padding:10px 0">비교할 상대 전적이 없습니다</div>`;
  const cur = (window._prVsOpp && opts.includes(window._prVsOpp)) ? window._prVsOpp : opts[0];
  window._prVsOpp = cur;
  const oppP = (players||[]).find(x=>x&&x.name===cur);
  const all = _statsAllHist(p);
  const h2h90 = _prHeadToHead(_prFilterHistByPeriod(all,'90'), cur);
  const h2hAll = _prHeadToHead(all, cur);
  const myElo = p.elo||1200, oppElo = (oppP&&oppP.elo)||1200;
  const predictMe = Math.max(1,Math.min(99,Math.round(100/(1+Math.pow(10,(oppElo-myElo)/400)))));
  let h=`<div>
    <select class="pr-vs-select" onchange="window._prVsOpp=this.value;render()">
      ${opts.map(n=>`<option value="${escAttr(n)}" ${n===cur?'selected':''}>${escHTML(n)}</option>`).join('')}
    </select>
    <div class="pr-vs-box">
      <div class="pr-vs-side">
        ${getPlayerPhotoHTML(p.name,'92px')}
        <div style="font-weight:900;margin-top:8px;font-size:14px">${escHTML(p.name)}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:11px;color:var(--gray-l);font-weight:700">최근 90일</div>
        <div style="font-size:20px;font-weight:950">${h2h90.w}-${h2h90.l}</div>
        <div style="font-size:11px;color:var(--gray-l);font-weight:700;margin-top:8px">전체</div>
        <div style="font-size:20px;font-weight:950">${h2hAll.w}-${h2hAll.l}</div>
      </div>
      <div class="pr-vs-side">
        ${getPlayerPhotoHTML(cur,'92px')}
        <div style="font-weight:900;margin-top:8px;font-size:14px;color:var(--blue);cursor:pointer" onclick="openPlayerModal('${escJS(cur)}')">${escHTML(cur)}</div>
      </div>
    </div>
    <div style="padding:0 4px">
      <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">🤖 ELO 기반 승부 예상 (규칙 기반 추정치 · 참고용)</div>
      <div class="pr-predict-bar">
        <div style="width:${predictMe}%;background:#dc2626;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">${predictMe}%</div>
        <div style="width:${100-predictMe}%;background:#64748b;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">${100-predictMe}%</div>
      </div>
    </div>
  </div>`;
  return h;
}

/* ─── 최근 경기 표 (기존 렌더 함수 재사용 · 읽기 전용) ─── */
function _prRecentTableHTML(p){
  const hist = _statsAllHist(p).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const filtered = _prExcludeFilter(hist);
  const shown = filtered.slice(0, window._prTableLimit||20);
  if(!shown.length) return `<div style="color:var(--gray-l);font-size:12px;padding:16px 0;text-align:center">경기 기록이 없습니다</div>`;
  let h=`<div style="border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
    <table style="margin:0;border:none;width:100%"><thead><tr><th>날짜</th><th>종류</th><th>결과</th><th>상대</th><th>종족</th><th class="ph-col-map">맵</th><th class="ph-col-elo">ELO</th></tr></thead><tbody>`;
  shown.forEach(hh=>{
    h += (typeof buildPlayerRecentHistoryRowHTML==='function')
      ? buildPlayerRecentHistoryRowHTML({ hh, hi:-1, pName:p.name, isLoggedIn:false, canEditByDate:false, bulkMode:false, bulkSelectedSet:null })
      : '';
  });
  h+=`</tbody></table></div>`;
  if(filtered.length>shown.length){
    h+=`<div style="text-align:center;padding:10px"><button class="btn btn-w btn-xs" onclick="window._prTableLimit=(window._prTableLimit||20)+20;render()">▼ 더보기 (${filtered.length-shown.length}건)</button></div>`;
  }
  return h;
}

/* ─── 티어 내 순위 ─── */
function _prTierRank(p){
  const sameTier = (players||[]).filter(x=>x && x.tier===p.tier && !x.hideFromBoard);
  const scored = sameTier.map(x=>{
    const t=(x.win||0)+(x.loss||0);
    const wr = t? (x.win||0)/t : 0;
    return {name:x.name, wr, elo:x.elo||1200};
  }).sort((a,b)=> b.elo-a.elo || b.wr-a.wr);
  const idx = scored.findIndex(x=>x.name===p.name);
  return { rank: idx>=0?idx+1:null, total: scored.length };
}

/* ─── 상단 프로필 히어로 ─── */
function _prHeroHTML(p){
  const RACE_KO={T:'테란',Z:'저그',P:'프로토스',N:'무종족'};
  const rankInfo=_prTierRank(p);
  const univColor = (typeof gc==='function') ? gc(p.univ) : '#6b7280';
  const eloBoardUrl = `https://eloboard.com/?s=${encodeURIComponent(p.name)}`;
  return `<div class="pr-hero">
    <div class="pr-hero-photo">${getPlayerPhotoHTML(p.name,'84px')}</div>
    <div style="flex:1;min-width:200px">
      <div class="pr-hero-name">${escHTML(p.name)} <span class="rbadge r${p.race||''}" style="font-size:12px">${RACE_KO[p.race]||p.race||''}</span></div>
      <div class="pr-hero-meta">
        <span class="pr-chip" style="background:${univColor}22;color:${univColor};cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${escJS(p.univ||'')}')">🏛️ ${escHTML(p.univ||'-')}</span>
        <span class="pr-chip" style="background:var(--blue-l);color:var(--blue)">${escHTML(p.tier||'-')}${rankInfo.rank?` (${rankInfo.rank}위/${rankInfo.total}명)`:''}</span>
        <span class="pr-chip" style="background:var(--surface);color:var(--text3)">ELO ${p.elo||1200}</span>
      </div>
    </div>
    <div class="pr-hero-actions no-export">
      <a class="pr-btn pr-btn-elo" href="${eloBoardUrl}" target="_blank" rel="noopener">📡 ELO 보드</a>
      <button class="pr-btn" onclick="openPlayerModal('${escJS(p.name)}')">👤 상세 프로필</button>
      <button class="pr-btn" onclick="_prSaveReportImage()">📸 리포트 이미지 저장</button>
    </div>
  </div>`;
}

/* ─── 검색 ─── */
function _prOnSearchInput(val){
  const drop = document.getElementById('pr-search-drop');
  if(!drop) return;
  const q = String(val||'').trim().toLowerCase();
  if(!q){ drop.style.display='none'; return; }
  const list = (players||[]).filter(p=>p && p.name && p.name.toLowerCase().includes(q)).slice(0,12);
  if(!list.length){
    drop.innerHTML = `<div style="padding:14px;text-align:center;color:var(--gray-l);font-size:12px">검색 결과가 없습니다</div>`;
    drop.style.display='block';
    return;
  }
  drop.innerHTML = list.map(p=>{
    const tot=(p.win||0)+(p.loss||0);
    const wr = tot? Math.round((p.win||0)/tot*100):0;
    return `<div class="pr-search-row" onclick="_prSelectPlayer('${escJS(p.name)}')">
      ${getPlayerPhotoHTML(p.name,'36px')}
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:13px">${escHTML(p.name)}</div>
        <div style="font-size:11px;color:var(--gray-l)">${escHTML(p.tier||'-')} · ${escHTML(p.univ||'-')}</div>
      </div>
      <div style="font-size:12px;font-weight:800;color:${wr>=50?'var(--red)':'var(--gray-l)'}">${wr}%</div>
    </div>`;
  }).join('');
  drop.style.display='block';
}
function _prSelectPlayer(name){
  window._prName = name;
  window._prVsOpp = '';
  window._prTableLimit = 20;
  _prSaveRecent(name);
  render();
}
function _prApplySearch(val){
  const raw = String(val||'').trim();
  if(!raw) return false;
  const cands = (players||[]).filter(p=>p && p.name);
  const exact = cands.find(p=>String(p.name).trim()===raw);
  const partial = cands.filter(p=>String(p.name).toLowerCase().includes(raw.toLowerCase()));
  const hit = exact || (partial.length ? partial[0] : null);
  if(!hit) return false;
  _prSelectPlayer(hit.name);
  return true;
}
if(!window._prDocClickBound){
  window._prDocClickBound = true;
  document.addEventListener('click', (e)=>{
    const wrap = document.querySelector('.pr-search-wrap');
    const drop = document.getElementById('pr-search-drop');
    if(!wrap || !drop) return;
    if(!wrap.contains(e.target)) drop.style.display='none';
  });
}

/* ─── 메인 엔트리 ─── */
function statsPlayerReportHTML(){
  let h = `<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:14px">
      <div>
        <h4 style="margin:0">📺 스트리머 리포트</h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">스트리머를 검색하면 통산 전적, 종족·맵별 승률, 최근 폼, 동일 티어 상대전적, 1:1 비교까지 한 번에 볼 수 있습니다. 위쪽 필터(기간/최근N경기)를 적용하면 이 리포트에도 함께 반영됩니다.</div>
      </div>
    </div>
    <div class="pr-search-wrap">
      <input id="pr-search-input" class="pr-search-input" type="text" placeholder="🔍 스트리머 이름으로 검색..." value=""
        oninput="_prOnSearchInput(this.value)" onkeydown="if(event.key==='Enter'){_prApplySearch(this.value);}" autocomplete="off">
      <div id="pr-search-drop" class="pr-search-drop" style="display:none"></div>
    </div>`;

  const recent = _prLoadRecent().filter(n=>n!==window._prName);
  if(recent.length){
    h += `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
      <span style="font-size:11px;color:var(--gray-l);font-weight:700">최근 검색</span>
      ${recent.map(n=>`<span class="pr-recent-chip" onclick="_prSelectPlayer('${escJS(n)}')">${escHTML(n)}</span>`).join('')}
    </div>`;
  }
  h += `</div>`;

  const p = window._prName ? (players||[]).find(x=>x && x.name===window._prName) : null;
  if(!p){
    h += `<div class="pr-empty"><div style="font-size:40px;margin-bottom:10px">🔍</div>스트리머를 검색해서 리포트를 확인해보세요</div>`;
    return h;
  }

  const period = window._prPeriod || 'all';
  const periodLabelMap = {'30':'최근 30일','90':'최근 90일','season':'올해','all':'전체'};
  // 상단 통계 필터(기간/최근N경기)를 먼저 적용한 뒤, 리포트 자체 기간 버튼으로 한 번 더 좁힌다
  const histGlobal = (typeof statsNonProHist==='function') ? statsNonProHist(p) : _statsAllHist(p);
  const histAll = _statsAllHist(p); // 전체 경기 스트립/최근 경기표는 전역 필터와 별개로 항상 전체 기록 기준
  const histPeriod = _prFilterHistByPeriod(histGlobal, period);
  const stats = _prRaceStats(histPeriod);
  const mapStats = _prMapStats(histPeriod);

  h += `<div id="pr-report-capture">`;
  h += _prHeroHTML(p);

  h += `<div class="ssec"><div class="pr-sec-head"><h4>📋 기본 정보</h4></div>${_prInfoGridHTML(p)}</div>`;

  h += `<div class="pr-period-bar">
    ${['30','90','season','all'].map(pk=>`<button class="pr-period-btn ${period===pk?'on':''}" onclick="window._prPeriod='${pk}';render()">${periodLabelMap[pk]}</button>`).join('')}
  </div>`;

  h += `<div class="ssec"><div class="pr-sec-head"><h4>🎮 ${periodLabelMap[period]} 전체 승률</h4></div>${_prWinRateCardsHTML(stats)}</div>`;

  h += `<div class="ssec"><div class="pr-sec-head"><h4>🗺️ ${periodLabelMap[period]} 맵별 성적</h4></div>${_prMapBarsHTML(mapStats)}</div>`;

  h += `<div class="ssec"><div class="pr-sec-head"><h4>📈 핵심 분석 결과</h4></div>${_prKeyInsightsHTML(stats, mapStats)}</div>`;

  h += `<div class="ssec"><div class="pr-sec-head"><h4>🤖 AI 분석 코멘트</h4></div>${_prAiCommentHTML(p, histPeriod, stats, periodLabelMap[period])}</div>`;

  h += `<div class="ssec">
    <div class="pr-sec-head"><h4>📋 전체 경기</h4></div>
    <div style="margin-bottom:10px">${_prExcludeTogglesHTML()}</div>
    ${_prImportantStripHTML(histAll)}
  </div>`;

  h += `<div class="ssec"><div class="pr-sec-head"><h4>🎯 동일 티어 상대전적 (최근 90일)</h4></div>${_prTierOpponentsHTML(p)}</div>`;

  h += `<div class="ssec"><div class="pr-sec-head"><h4>⚔️ 1:1 상대 비교 &amp; 승부 예측</h4></div>${_prVsCompareHTML(p)}</div>`;

  h += `<div class="ssec"><div class="pr-sec-head"><h4>📋 최근 경기</h4></div>${_prRecentTableHTML(p)}</div>`;
  h += `</div>`;

  return h;
}

/* ─── 리포트 전체 이미지 저장 ─── */
async function _prSaveReportImage(){
  const el = document.getElementById('pr-report-capture');
  if(!el){ alert('캡처할 리포트가 없습니다.'); return; }
  const name = window._prName || '스트리머';
  try{
    if(typeof _showSaveLoading==='function') _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    if(typeof _imgToDataUrls==='function') await _imgToDataUrls(el);
    try{ if(typeof _waitForImages==='function') await _waitForImages(el,1500); }catch(e){}
    try{ if(typeof _sanitizeUnsupportedCssFunctions==='function') _sanitizeUnsupportedCssFunctions(el); }catch(e){}
    const canvas = await html2canvas(el,{
      backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000,
      onclone:(doc)=>{ try{ doc.querySelectorAll('.no-export').forEach(n=>n.remove()); }catch(e){} }
    });
    await _saveCanvasImage(canvas, `${name}_리포트.png`, 'png');
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{ if(typeof _hideSaveLoading==='function') _hideSaveLoading(); }
}

try{
  window.statsPlayerReportHTML = statsPlayerReportHTML;
  window._prSelectPlayer = _prSelectPlayer;
  window._prOnSearchInput = _prOnSearchInput;
  window._prSaveReportImage = _prSaveReportImage;
}catch(e){}
