/* ══════════════════════════════════════
   stats-player-report.js
   통계 탭 > 🔍 기록실 > 👤 선수 리포트
   - 선수 검색 후 개별 종합 리포트 (외부 사이트 레이아웃 참고: 전체/90일 리포트,
     최근전적, ELO 보드, AI 분석 코멘트, 동일 티어 상대전적, 1:1 비교)
   - AI 분석 코멘트: 규칙 기반 템플릿 문장 (외부 API 미사용)
   - ELO 보드: eloboard.com 외부 링크만 연결 (개인 URL 등록 기능 없음)
══════════════════════════════════════ */

/* ─── 상태 (var 사용 — 지연 로딩 재실행 시 재선언 충돌 방지) ─── */
if(window._prName===undefined) window._prName = '';
if(window._prPeriod===undefined) window._prPeriod = 'all'; // 30 | 90 | season | all
if(window._prExcludeMini===undefined) window._prExcludeMini = false;
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
    '@media(max-width:640px){.pr-hero{padding:16px}.pr-hero-photo{width:64px;height:64px}.pr-hero-name{font-size:19px}.pr-hero-actions{margin-left:0;width:100%}.pr-hero-actions .pr-btn{flex:1;justify-content:center}}'
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

/* ─── 승률 카드 ─── */
function _prWinRateCardsHTML(stats){
  const RACE_LABEL={P:'프로토스전',T:'테란전',Z:'저그전'};
  const RACE_ICON={P:'🔵',T:'🔴',Z:'🟣'};
  function card(label, w, l, icon){
    const tot=w+l; const wr= tot? Math.round(w/tot*100):0;
    return `<div class="pr-wr-card">
      <div class="pr-wr-label">${icon} ${escHTML(label)}</div>
      <div class="pr-wr-pct" style="color:${wr>=50?'var(--red)':'var(--text3)'}">${wr}%</div>
      <div class="pr-wr-rec">${w}승 ${l}패</div>
    </div>`;
  }
  let h=`<div class="pr-wr-grid">`;
  h+=card('전체 승률', stats.w, stats.l, '🎮');
  h+=card(RACE_LABEL.P, stats.rv.P.w, stats.rv.P.l, RACE_ICON.P);
  h+=card(RACE_LABEL.T, stats.rv.T.w, stats.rv.T.l, RACE_ICON.T);
  h+=card(RACE_LABEL.Z, stats.rv.Z.w, stats.rv.Z.l, RACE_ICON.Z);
  h+=`</div>`;
  return h;
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

/* ─── 최근 중요경기 스트립 ─── */
function _prImportantStripHTML(histAll, excludeMini){
  const filtered = excludeMini ? (histAll||[]).filter(h=>h.mode!=='미니대전') : (histAll||[]).slice();
  const sorted = filtered.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const recent = sorted.slice(0,20);
  if(!recent.length) return `<div style="color:var(--gray-l);font-size:12px;padding:10px 0">표시할 경기가 없습니다</div>`;
  let h=`<div class="pr-strip">`;
  recent.forEach(hh=>{
    const isWin = hh.result==='승';
    const isDraw = hh.result==='무';
    const bg = isWin?'var(--score-win)':isDraw?'#94a3b8':'var(--score-lose)';
    const lbl = isWin?'W':isDraw?'D':'L';
    h+=`<div class="pr-strip-sq" style="background:${bg}" title="${escAttr(hh.date||'')} vs ${escAttr(hh.opp||'')} (${escAttr(hh.mode||'')})">${lbl}</div>`;
  });
  h+=`</div>`;
  h+=`<div style="font-size:10px;color:var(--gray-l);margin-top:6px">최신 → 과거 순 · 최근 ${recent.length}경기</div>`;
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
  const filtered = window._prExcludeMini ? hist.filter(h=>h.mode!=='미니대전') : hist;
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
    <div class="pr-hero-actions">
      <a class="pr-btn pr-btn-elo" href="${eloBoardUrl}" target="_blank" rel="noopener">📡 ELO 보드</a>
      <button class="pr-btn" onclick="openPlayerModal('${escJS(p.name)}')">👤 상세 프로필</button>
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
        <h4 style="margin:0">👤 선수 리포트</h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">선수를 검색하면 종족별 승률, 최근 폼, 동일 티어 상대전적, 1:1 비교까지 한 번에 볼 수 있습니다.</div>
      </div>
    </div>
    <div class="pr-search-wrap">
      <input id="pr-search-input" class="pr-search-input" type="text" placeholder="🔍 선수 이름으로 검색..." value=""
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
    h += `<div class="pr-empty"><div style="font-size:40px;margin-bottom:10px">🔍</div>선수를 검색해서 리포트를 확인해보세요</div>`;
    return h;
  }

  const period = window._prPeriod || 'all';
  const periodLabelMap = {'30':'최근 30일','90':'최근 90일','season':'올해','all':'전체'};
  const histAll = _statsAllHist(p);
  const histPeriod = _prFilterHistByPeriod(histAll, period);
  const stats = _prRaceStats(histPeriod);

  h += _prHeroHTML(p);

  h += `<div class="pr-period-bar">
    ${['30','90','season','all'].map(pk=>`<button class="pr-period-btn ${period===pk?'on':''}" onclick="window._prPeriod='${pk}';render()">${periodLabelMap[pk]}</button>`).join('')}
  </div>`;

  h += `<div class="ssec"><h4>📊 ${periodLabelMap[period]} 승률</h4>${_prWinRateCardsHTML(stats)}</div>`;

  h += `<div class="ssec"><h4>🤖 AI 분석 코멘트</h4>${_prAiCommentHTML(p, histPeriod, stats, periodLabelMap[period])}</div>`;

  h += `<div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">
      <h4 style="margin:0;border:none;padding:0">⭐ 최근 중요경기</h4>
      <label class="pr-toggle"><input type="checkbox" ${window._prExcludeMini?'checked':''} onchange="window._prExcludeMini=this.checked;render()"> 🚫 미니대전 제외</label>
    </div>
    ${_prImportantStripHTML(histAll, window._prExcludeMini)}
  </div>`;

  h += `<div class="ssec"><h4>🎯 동일 티어 상대전적 (최근 90일)</h4>${_prTierOpponentsHTML(p)}</div>`;

  h += `<div class="ssec"><h4>⚔️ 1:1 상대 비교 &amp; 승부 예측</h4>${_prVsCompareHTML(p)}</div>`;

  h += `<div class="ssec"><h4>📋 최근 경기</h4>${_prRecentTableHTML(p)}</div>`;

  return h;
}

try{
  window.statsPlayerReportHTML = statsPlayerReportHTML;
  window._prSelectPlayer = _prSelectPlayer;
  window._prOnSearchInput = _prOnSearchInput;
}catch(e){}
