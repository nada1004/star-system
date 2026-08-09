/* ══════════════════════════════════════════════════════════════
   선수 리포트 - 상세 섹션 HTML (제외필터/월별추이/티어상대/상대전적/히어로) (stats-player-report.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
    ['_prExcludeMini','미니대전 제외'],
    ['_prExcludeUniv','대학대전 제외'],
    ['_prExcludeCk','대학CK 제외'],
    ['_prExcludeTier','티어대회 제외'],
    ['_prExcludeNormalTour','일반대회 제외 (일반·조별리그·대진표기록)'],
  ];
  return `<div class="pr-filter-bar no-export">${opts.map(([key,lbl])=>{
    const on=!!window[key];
    return `<button type="button" class="pr-filter-pill${on?' on':''}" aria-pressed="${on}" onclick="window.${key}=!window.${key};render()">${on?'✕':'🚫'} ${escHTML(lbl)}</button>`;
  }).join('')}</div>`;
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
var PR_STRIP_HIGHLIGHT_N = 8; // 최근 N경기는 항상 강조 표시, 나머지는 "더보기"로 접기
function _prStripSqHTML(hh, big){
  const isWin = hh.result==='승';
  const isDraw = hh.result==='무';
  const bg = isWin?'var(--score-win)':isDraw?'#94a3b8':'var(--score-lose)';
  const lbl = isWin?'W':isDraw?'D':'L';
  const resultKo = isWin?'승':isDraw?'무':'패';
  const tip = `${escAttr(hh.date||'-')} · ${escAttr(hh.mode||'-')}&#10;vs ${escAttr(hh.opp||'-')}&#10;${escAttr(hh.map&&hh.map!=='-'?hh.map:'맵 정보 없음')} · ${resultKo}`;
  return `<div class="pr-strip-sq${big?' pr-strip-sq--recent':''}" style="background:${bg}" data-tip="${tip}">${lbl}</div>`;
}
function _prImportantStripHTML(histAll){
  const filtered = _prExcludeFilter(histAll);
  let h = _prAllMatchesWinRateHTML(filtered);
  const sorted = filtered.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const recentDesc = sorted.slice(0,20); // 최신 → 과거
  if(!recentDesc.length) return h + _prEmptyStateHTML('표시할 경기가 없습니다');
  const highlighted = recentDesc.slice(0,PR_STRIP_HIGHLIGHT_N).reverse(); // 과거 → 최신
  const older = recentDesc.slice(PR_STRIP_HIGHLIGHT_N).reverse(); // 과거 → 최신
  const expanded = !!window._prStripExpanded;
  h+=`<div style="font-size:11px;font-weight:800;color:var(--text2);margin-bottom:6px">🔥 최근 폼 (과거 → 최신)</div>`;
  h+=`<div class="pr-strip">`;
  if(older.length){
    h+=`<div class="pr-strip-older" style="display:${expanded?'flex':'none'}">${older.map(hh=>_prStripSqHTML(hh,false)).join('')}</div>`;
  }
  h+=highlighted.map(hh=>_prStripSqHTML(hh,true)).join('');
  h+=`</div>`;
  if(older.length){
    h+=`<button type="button" class="pr-strip-toggle no-export" onclick="window._prStripExpanded=!window._prStripExpanded;render()">${expanded?'▲ 접기':`▼ 이전 ${older.length}경기 더보기`}</button>`;
  }
  h+=`<div style="font-size:10px;color:var(--text2);margin-top:6px">과거 → 최신 순 · 최근 ${highlighted.length}경기 강조 표시 (최근 ${recentDesc.length}경기 / 전체 ${filtered.length}경기 중) · 사각형에 마우스를 올리면 상세 정보가 표시됩니다</div>`;
  return h;
}

/* ─── ELO 추이 그래프 (리포트 상단 기간 필터 적용 · 최근 N경기의 ELO 변화를 선그래프로) ─── */
var PR_ELO_TREND_N = 30;
function _prEloTrendHTML(p, period){
  const periodKey = period || 'all';
  const baseHist = (typeof statsNonProHist==='function') ? statsNonProHist(p) : _statsAllHist(p);
  const histInPeriod = _prFilterHistByPeriod(baseHist, periodKey);
  const hist = histInPeriod.filter(h=>typeof h.eloDelta==='number')
    .slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))); // 최신 → 과거
  if(!hist.length) return _prEmptyStateHTML(periodKey==='all' ? 'ELO 변동 기록이 없습니다' : '선택하신 기간에 ELO 변동 기록이 없습니다');
  const recent = hist.slice(0, PR_ELO_TREND_N); // 최신 → 과거
  // 현재 ELO에서 거꾸로 델타를 빼가며 각 경기 "직후" ELO를 복원
  let eloAfter = p.elo || 1200;
  const points = []; // {date, elo, result} 최신 → 과거 순으로 채운 뒤 뒤집는다
  recent.forEach(h=>{
    points.push({date:h.date, elo:eloAfter, result:h.result, opp:h.opp});
    eloAfter = eloAfter - (h.eloDelta||0);
  });
  points.push({date:'시작', elo:eloAfter, result:'', opp:''}); // 구간 시작점(가장 과거)
  points.reverse(); // 과거 → 최신
  const vals = points.map(pt=>pt.elo);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(1, max-min);
  const W=700, H=140, PAD=16;
  const xy = points.map((pt,i)=>{
    const x = PAD + (W-PAD*2) * (points.length===1?0.5:i/(points.length-1));
    const y = H-PAD - (H-PAD*2) * ((pt.elo-min)/span);
    return {...pt, x, y};
  });
  const pts = xy.map(pt=>`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const first = points[0], last = points[points.length-1];
  const delta = Math.round(last.elo - first.elo);
  const deltaColor = delta>0 ? 'var(--score-win)' : delta<0 ? 'var(--score-lose)' : 'var(--text2)';
  const dots = xy.map((pt,i)=>{
    const isLast = i===xy.length-1;
    const c = pt.result==='승'?'var(--score-win)':pt.result==='패'?'var(--score-lose)':'#94a3b8';
    const tip = pt.date==='시작' ? '구간 시작' : `${pt.date} · vs ${pt.opp||'-'} · ${pt.result} · ELO ${Math.round(pt.elo)}`;
    return `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${isLast?4.5:2.6}" fill="${c}" stroke="${isLast?'var(--white)':'none'}" stroke-width="${isLast?2:0}" class="pr-elo-dot"><title>${escHTML(tip)}</title></circle>`;
  }).join('');
  // 이 구간이 언제인지 감이 오도록 x축에 실제 날짜 눈금을 몇 개 표시
  const realPts = xy.slice(1);
  let tickHTML = '';
  if(realPts.length){
    const n = realPts.length;
    const count = Math.min(4, n);
    const idxs = [...new Set(Array.from({length:count}, (_,k)=> count===1?0:Math.round(k*(n-1)/(count-1))))];
    tickHTML = idxs.map(idx=>{
      const pt = realPts[idx];
      const d = String(pt.date||'').slice(5).replace('-','/');
      return `<div class="pr-elo-tick" style="left:${(pt.x/W*100).toFixed(1)}%">${escHTML(d)}</div>`;
    }).join('');
  }
  return `<div>
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px">
      <span style="font-size:22px;font-weight:950">${Math.round(last.elo)}</span>
      <span style="font-size:13px;font-weight:800;color:${deltaColor}">${delta>0?'▲ +':delta<0?'▼ ':'– '}${Math.abs(delta)}</span>
      <span style="font-size:11px;color:var(--text2);font-weight:700">최근 ${recent.length}경기 기준 (${escHTML(first.date)} → ${escHTML(last.date)})</span>
    </div>
    <div class="pr-elo-chart-wrap">
      <svg viewBox="0 0 ${W} ${H}" class="pr-elo-svg" preserveAspectRatio="none">
        <line x1="${PAD}" y1="${H-PAD}" x2="${W-PAD}" y2="${H-PAD}" stroke="var(--border)" stroke-width="1"/>
        <polyline fill="none" stroke="var(--blue)" stroke-width="2.4" points="${pts}" stroke-linejoin="round" stroke-linecap="round"/>
        ${dots}
      </svg>
      <div class="pr-elo-axis">${tickHTML}</div>
    </div>
    <div style="font-size:10px;color:var(--text2);margin-top:4px">점에 마우스를 올리면 해당 경기 정보가 표시됩니다 · 최소 ${Math.round(min)} ~ 최대 ${Math.round(max)}</div>
  </div>`;
}
/* 월별 승률 전용 색상 — 사이트 전체에서 쓰는 승(빨강)/패(파랑) 색 규칙과 통일 */
function _prMonthlyWrColor(wr){
  return wr>=50 ? 'var(--score-win)' : 'var(--score-lose)';
}
/* YYYY-MM 문자열에 개월수를 더하고 정규화 (연 경계 처리) */
function _prShiftYm(ym, delta){
  const parts = String(ym).split('-');
  let y = Number(parts[0]), m = Number(parts[1]) + delta;
  while(m<1){ m+=12; y--; }
  while(m>12){ m-=12; y++; }
  return `${y}-${String(m).padStart(2,'0')}`;
}
/* ─── 월별 승률 미니 차트 (승/패 숫자 항상 표시, 전체 기록 기준) ─── */
var PR_MONTHLY_TREND_N = 12;
function _prMonthlyTrendHTML(p){
  const hist = _statsAllHist(p).filter(h=>h.result==='승'||h.result==='패');
  if(!hist.length) return _prEmptyStateHTML('월별 기록이 없습니다');
  const byMonth = {};
  let minYm='', maxYm='';
  hist.forEach(h=>{
    const ym = String(h.date||'').slice(0,7); // YYYY-MM
    if(!ym || ym.length!==7) return;
    if(!byMonth[ym]) byMonth[ym]={w:0,l:0};
    if(h.result==='승') byMonth[ym].w++; else byMonth[ym].l++;
    if(!minYm || ym<minYm) minYm=ym;
    if(!maxYm || ym>maxYm) maxYm=ym;
  });
  if(!maxYm) return _prEmptyStateHTML('월별 기록이 없습니다');
  // 실제 기록이 있는 첫 달~마지막 달 사이를 빈 달 없이 연속으로 채운 뒤, 최근 N개월만 사용
  // (기록 없는 달을 건너뛰면 막대 간격이 실제 시간 간격과 어긋나 보이는 문제 수정)
  const allMonths = [];
  for(let ym=minYm; ym<=maxYm; ym=_prShiftYm(ym,1)) allMonths.push(ym);
  const monthKeys = allMonths.slice(-PR_MONTHLY_TREND_N);
  const recs = monthKeys.map(ym=>{
    const rec = byMonth[ym] || {w:0,l:0};
    const tot = rec.w+rec.l;
    const wr = tot? Math.round(rec.w/tot*100):0;
    return {ym, w:rec.w, l:rec.l, tot, wr};
  });
  const totW = recs.reduce((s,r)=>s+r.w,0), totL = recs.reduce((s,r)=>s+r.l,0);
  const avgWr = (totW+totL) ? Math.round(totW/(totW+totL)*100) : 0;
  // 추세: 앞 절반 대비 뒤 절반 평균 승률 비교 (데이터가 2개월 이상일 때만 표시)
  let trendHTML = '';
  if(recs.length>=2){
    const half = Math.floor(recs.length/2);
    const older = recs.slice(0,half), newer = recs.slice(half);
    const oW=older.reduce((s,r)=>s+r.w,0), oT=older.reduce((s,r)=>s+r.tot,0);
    const nW=newer.reduce((s,r)=>s+r.w,0), nT=newer.reduce((s,r)=>s+r.tot,0);
    if(oT>0 && nT>0){
      const diff = Math.round(nW/nT*100) - Math.round(oW/oT*100);
      const icon = diff>3?'📈':diff<-3?'📉':'➖';
      const txt = diff>3?`상승세 (${diff>0?'+':''}${diff}%p)`:diff<-3?`하락세 (${diff}%p)`:'안정적 흐름';
      trendHTML = `<span class="pr-mtrend-summary-trend">${icon} ${txt}</span>`;
    }
  }
  /* ── 라인(추이) 차트 렌더 ── */
  const uColor = (typeof gc==='function') ? gc(p.univ||'') : '#6366f1';
  const lineColor = uColor;
  const pctColor = (typeof univTextColor==='function') ? univTextColor(p.univ||'') : uColor;
  const n = recs.length;
  const COL = 62;              // 달 하나가 차지하는 폭(px) — 라벨 줄과 정확히 맞춰 스크롤되도록 고정폭 사용
  const totalW = Math.max(n*COL, COL);
  const H = 168, PADTOP = 34, PADBOTTOM = 18;
  const chartH = H - PADTOP - PADBOTTOM;
  const xFor = i => i*COL + COL/2;
  const yFor = wr => PADTOP + (100-wr)/100*chartH;
  const baseY = H - PADBOTTOM;
  const pts = recs.map((r,i)=>({...r, x:xFor(i), y:r.tot>0?yFor(r.wr):baseY, hasData:r.tot>0}));
  // 기록 없는 달에서는 선을 끊어 그림(데이터 없는 구간을 이어붙이면 오해의 소지가 있음)
  const segs = [];
  let cur = [];
  pts.forEach(pt=>{ if(pt.hasData){ cur.push(pt); } else if(cur.length){ segs.push(cur); cur=[]; } });
  if(cur.length) segs.push(cur);
  const gridHTML = [0,50,100].map(v=>{
    const y = yFor(v);
    return `<line x1="0" y1="${y.toFixed(1)}" x2="${totalW}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="${v===0?'0':'3,4'}"/>
      <text x="2" y="${(y-4).toFixed(1)}" font-size="9" font-weight="700" fill="var(--text2)">${v}%</text>`;
  }).join('');
  const areaHTML = segs.map(seg=>{
    if(seg.length<2) return '';
    const path = `M${seg[0].x.toFixed(1)},${baseY} ` + seg.map(p=>`L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${seg[seg.length-1].x.toFixed(1)},${baseY} Z`;
    return `<path d="${path}" fill="${lineColor}" fill-opacity="0.16" stroke="none"/>`;
  }).join('');
  const lineHTML = segs.map(seg=>{
    const points = seg.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return `<polyline points="${points}" fill="none" stroke="${lineColor}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
  }).join('');
  const dotsHTML = pts.map((pt,i)=>{
    if(!pt.hasData) return `<circle cx="${pt.x.toFixed(1)}" cy="${baseY}" r="2.5" fill="var(--border2)"/>`;
    const dotColor = _prMonthlyWrColor(pt.wr);
    const tip = `${pt.ym} · 승률 ${pt.wr}% (${pt.w}승 ${pt.l}패)`;
    return `<text x="${pt.x.toFixed(1)}" y="${(pt.y-11).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="950" fill="${pctColor}">${pt.wr}%</text>
      <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3.6" fill="${dotColor}" stroke="var(--white)" stroke-width="1.6"><title>${escHTML(tip)}</title></circle>`;
  }).join('');
  const labelsHTML = recs.map((r,i)=>{
    const hasData = r.tot>0;
    const isNow = i===recs.length-1;
    const mLbl = r.ym.slice(5,7)+'월';
    const recHTML = hasData
      ? `<span style="color:var(--score-win)">${r.w}승</span> <span style="color:var(--score-lose)">${r.l}패</span>`
      : '-';
    return `<div class="pr-mtrend-lcol${isNow?' pr-mtrend-lcol--now':''}${hasData?'':' pr-mtrend-col--empty'}" style="width:${COL}px">
      <div class="pr-mtrend-rec">${recHTML}</div>
      <div class="pr-mtrend-lbl">${mLbl}</div>
    </div>`;
  }).join('');
  return `<div>
    <div class="pr-mtrend-summary"><span class="pr-mtrend-summary-avg">최근 ${recs.length}개월 평균 승률 <b>${avgWr}%</b></span>${trendHTML}</div>
    <div class="pr-mtrend-linewrap">
      <div style="width:${totalW}px">
        <svg viewBox="0 0 ${totalW} ${H}" width="${totalW}" height="${H}" class="pr-mtrend-svg">
          ${gridHTML}${areaHTML}${lineHTML}${dotsHTML}
        </svg>
        <div class="pr-mtrend-lrow">${labelsHTML}</div>
      </div>
    </div>
  </div>`;
}
/* ─── 대회/모드별 성적 요약 (전체 기록 기준, 승/패가 기록된 경기만) ─── */
function _prModeStatsHTML(p){
  const hist = _statsAllHist(p).filter(h=>(h.result==='승'||h.result==='패') && (typeof _pdNormalizeRecentModeLabel!=='function' || _pdNormalizeRecentModeLabel(h.mode)!=='시빌워'));
  if(!hist.length) return _prEmptyStateHTML('모드별 기록이 없습니다');
  const colors = (typeof _pdRecentModeColors==='function') ? _pdRecentModeColors() : {};
  const byMode = {};
  hist.forEach(h=>{
    let lbl = (typeof _pdNormalizeRecentModeLabel==='function') ? (_pdNormalizeRecentModeLabel(h.mode)||'기타') : (h.mode||'기타');
    /* 프로리그 대회의 끝장전 세션은 조별리그/대진표와 같은 '프로리그대회' 기록으로 합쳐서 집계
       (그렇지 않으면 소수 경기만 남아 별도 칩으로 쪼개져 눈에 잘 안 띔) */
    if(lbl==='프로리그대회끝장전') lbl='프로리그대회';
    if(!byMode[lbl]) byMode[lbl]={w:0,l:0};
    if(h.result==='승') byMode[lbl].w++; else byMode[lbl].l++;
  });
  /* 🎮 이스포츠 카드(MATCH RECORD)와 동일한 우선순위로 정렬해 두 곳이 같은 순서로 보이게 함 */
  const MODE_ORDER = (typeof PR_CARD_MODE_ORDER!=='undefined') ? PR_CARD_MODE_ORDER : ['프로리그','프로리그대회','미니대전','대학대전','대학CK','티어대회','대회','끝장전'];
  const rows = Object.entries(byMode).map(([mode,rec])=>{
    const tot=rec.w+rec.l; const wr = tot? Math.round(rec.w/tot*100):0;
    return {mode, ...rec, tot, wr};
  }).sort((a,b)=>{
    const ia=MODE_ORDER.indexOf(a.mode), ib=MODE_ORDER.indexOf(b.mode);
    if(ia>=0 && ib>=0) return ia-ib;
    if(ia>=0) return -1;
    if(ib>=0) return 1;
    return b.tot-a.tot;
  });
  /* 🎮 이스포츠 리포트 카드(MATCH RECORD)와 통일감을 주기 위해 막대그래프 대신
     대학 컬러 악센트 + 큰 승률 숫자의 칩 카드 그리드로 노출 */
  let h=`<div class="pr-mode-chip-grid">`;
  rows.forEach(r=>{
    const color = colors[r.mode] || _prWrColor(r.wr);
    h+=`<div class="pr-mode-chip" style="background:${_prHexToRgba(color,.08)};border:1px solid ${_prHexToRgba(color,.25)}">
      <div style="background:${color}" class="pr-mode-chip-accent"></div>
      <div class="pr-mode-chip-lbl" style="color:${color}" title="${escAttr(r.mode)}">${escHTML(r.mode)}</div>
      <div class="pr-mode-chip-row">
        <div class="pr-mode-chip-pct">${r.wr}%</div>
        <div class="pr-mode-chip-rec"><span style="color:var(--score-win);font-weight:900">${r.w}승</span> <span style="color:var(--score-lose);font-weight:900">${r.l}패</span></div>
      </div>
    </div>`;
  });
  h+=`</div>`;
  return h;
}

/* ─── 동일 티어 상대전적 (최근 90일) ─── */
var PR_TIER_OPP_SHOW_N = 6; // 상위 N명만 우선 표시, 나머지는 "더보기"로 펼침
if(window._prTierOppExpanded===undefined) window._prTierOppExpanded = false;
function _prToggleTierOpp(){
  window._prTierOppExpanded = !window._prTierOppExpanded;
  if(typeof render==='function') render();
}
function _prTierOpponentRowHTML(r){
  return `<div class="pr-tier-opp-row">
      ${getPlayerPhotoHTML(r.name,'34px')}
      <span class="rbadge r${r.race||''}" style="font-size:10px">${r.race||''}</span>
      <span style="font-weight:800;color:var(--blue);cursor:pointer" onclick="openPlayerModal('${escJS(r.name)}')">${escHTML(r.name)}</span>
      <span style="font-weight:900"><span style="color:var(--score-win)">${r.w}승</span> <span style="color:var(--score-lose)">${r.l}패</span></span>
      <button class="pr-btn" style="padding:5px 10px;font-size:11px;margin-left:auto" onclick="openPlayerModal('${escJS(r.name)}')">👤 상세프로필</button>
    </div>`;
}
/* ─── 티어 대비 성과 지수 (전체 기록 기준 · 상위/동일/하위 티어 상대 승률 비교) ─── */
function _prTierPerfIndexHTML(p){
  const tiersList = (typeof TIERS!=='undefined' && Array.isArray(TIERS) && TIERS.length) ? TIERS
    : ['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스','미정'];
  const myIdx = tiersList.indexOf(p.tier);
  if(myIdx<0) return '';
  const hist = _statsAllHist(p).filter(h=>h.result==='승'||h.result==='패');
  const buckets = {up:{w:0,l:0}, same:{w:0,l:0}, down:{w:0,l:0}};
  hist.forEach(h=>{
    const oppP = (players||[]).find(x=>x && x.name===h.opp);
    if(!oppP) return;
    const oppIdx = tiersList.indexOf(oppP.tier);
    if(oppIdx<0) return;
    const key = oppIdx<myIdx ? 'up' : oppIdx>myIdx ? 'down' : 'same';
    if(h.result==='승') buckets[key].w++; else buckets[key].l++;
  });
  const card = (lbl, icon, rec)=>{
    const tot=rec.w+rec.l; const wr = tot? Math.round(rec.w/tot*100):null;
    return `<div class="pr-info-card"><div class="pr-info-num" style="color:${wr==null?'var(--text2)':_prWrColor(wr)}">${wr==null?'-':wr+'%'}</div><div class="pr-info-lbl">${icon} ${lbl}${tot?` (${rec.w}승 ${rec.l}패)`:' (기록 없음)'}</div></div>`;
  };
  const upWr = buckets.up.w+buckets.up.l ? Math.round(buckets.up.w/(buckets.up.w+buckets.up.l)*100) : null;
  let note = '';
  if(upWr!=null && (buckets.up.w+buckets.up.l)>=3 && upWr>=45){
    note = `<div class="pr-mtrend-note">🔥 상위 티어 상대로도 <b>${upWr}%</b> 승률 — 자이언트 킬러형 기록입니다</div>`;
  }
  return `<div style="margin-bottom:14px">
    <div class="pr-info-grid">
      ${card('상위 티어 상대', '🔼', buckets.up)}
      ${card('동일 티어 상대', '➖', buckets.same)}
      ${card('하위 티어 상대', '🔽', buckets.down)}
    </div>
    ${note}
  </div>`;
}
function _prTierOpponentsHTML(p){
  const perfIndexHTML = _prTierPerfIndexHTML(p);
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
  if(!rows.length) return perfIndexHTML + _prEmptyStateHTML('최근 90일 내 동일 티어 상대전적이 없습니다');
  const expanded = !!window._prTierOppExpanded;
  const shown = expanded ? rows : rows.slice(0, PR_TIER_OPP_SHOW_N);
  const rest = rows.length - shown.length;
  let h=perfIndexHTML + `<div style="border:1px solid var(--border);border-radius:var(--r2);overflow:hidden">`;
  h += shown.map(_prTierOpponentRowHTML).join('');
  h+=`</div>`;
  if(rows.length > PR_TIER_OPP_SHOW_N){
    h += `<button type="button" class="pr-strip-toggle no-export" style="margin-top:8px" onclick="_prToggleTierOpp()">${expanded?'▲ 접기':`▼ 상대 ${rest}명 더보기`}</button>`;
  }
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
  if(!opts.length) return _prEmptyStateHTML('비교할 상대 전적이 없습니다');
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
        <div style="font-size:11px;color:var(--text2);font-weight:900">최근 90일</div>
        <div style="font-size:20px;font-weight:950">${h2h90.w}-${h2h90.l}</div>
        <div style="font-size:11px;color:var(--text2);font-weight:900;margin-top:8px">전체</div>
        <div style="font-size:20px;font-weight:950">${h2hAll.w}-${h2hAll.l}</div>
      </div>
      <div class="pr-vs-side">
        ${getPlayerPhotoHTML(cur,'92px')}
        <div style="font-weight:900;margin-top:8px;font-size:14px;color:var(--blue);cursor:pointer" onclick="openPlayerModal('${escJS(cur)}')">${escHTML(cur)}</div>
      </div>
    </div>
    <div style="padding:0 4px">
      <div style="font-size:11px;font-weight:800;color:var(--text2);margin-bottom:4px">🤖 ELO 기반 승부 예상 (규칙 기반 추정치 · 참고용)</div>
      <div class="pr-predict-bar">
        <div style="width:${predictMe}%;background:#dc2626;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">${predictMe}%</div>
        <div style="width:${100-predictMe}%;background:#2563eb;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">${100-predictMe}%</div>
      </div>
    </div>
  </div>`;
  return h;
}

/* ─── 최근 경기 표 (기존 렌더 함수 재사용 · 읽기 전용) ─── */
function _prRecentTableHTML(p){
  const hist = _statsAllHist(p).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  let filtered = _prExcludeFilter(hist);
  if(window._prRecentMapFilter) filtered = filtered.filter(h=>h.map===window._prRecentMapFilter);
  const shown = filtered.slice(0, window._prTableLimit||20);
  if(!shown.length) return _prEmptyStateHTML('경기 기록이 없습니다');
  let h=`<div class="pr-recent-table" style="border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
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
  const eloBoardUrl = `https://eloboard.com/?s=${encodeURIComponent(p.name)}`;
  return `<div class="pr-hero">
    <div class="pr-hero-photo" style="box-shadow:0 0 0 3px var(--white),var(--sh2)" onclick="openPlayerModal('${escJS(p.name)}')" title="상세 프로필 보기">${getPlayerPhotoHTML(p.name,'124px','object-fit:cover;object-position:center;')}</div>
    <div style="flex:1;min-width:200px">
      <div class="pr-hero-name">${escHTML(p.name)} <span class="rbadge r${p.race||''}">${RACE_KO[p.race]||p.race||''}</span></div>
      <div class="pr-hero-wr-row">
        ${(typeof _prLevelBadgeHTML==='function') ? _prLevelBadgeHTML(p) : ''}
        ${(()=>{
          const pointsVal = Number(p.points||0);
          const pointsColor = pointsVal>0 ? 'var(--score-win)' : pointsVal<0 ? 'var(--score-lose)' : 'var(--text2)';
          const roleTxt = String(p.role||'').trim();
          return `<span class="pr-hero-wr-num" style="color:${pointsColor}">${pointsVal>0?'+':''}${pointsVal}P</span>
          <span class="pr-hero-wr-sub">포인트${roleTxt?` · ${escHTML(roleTxt)}`:''}</span>`;
        })()}
      </div>
      <div class="pr-hero-meta">
        ${(()=>{
          const uName = p.univ||'';
          const uColor = (typeof gc==='function') ? gc(uName) : '#6b7280';
          const uIcon = (typeof gUI==='function') ? gUI(uName,'1.05em') : '';
          return `<span class="pr-chip" style="cursor:pointer;background:${uColor};color:#fff;border-color:${uColor}" onclick="if(typeof openUnivModal==='function')openUnivModal('${escJS(uName)}')">${uIcon}${escHTML(uName||'-')}</span>`;
        })()}
        ${(()=>{
          const tier = p.tier;
          const ic = (typeof _TIER_ICON!=='undefined' && _TIER_ICON[tier]) || '';
          const bg = (typeof getTierBtnColor==='function') ? (getTierBtnColor(tier)||'#64748b') : '#64748b';
          const rankTxt = rankInfo.rank ? ` · ${rankInfo.rank}위/${rankInfo.total}명` : '';
          // 소속 칩(=신원 정보)만 진하게 채우고, 티어/등급 칩은 같은 "연한 톤+테두리" 스타일로 통일해
          // 3개 칩이 신호등처럼 튀지 않고 차분하게 정리되도록 함
          return `<span class="pr-chip" style="background:${bg}16;color:${bg};border:1.5px solid ${bg}45;gap:5px">${ic?ic+' ':''}${escHTML(tier||'-')}${rankTxt}</span>`;
        })()}
        ${(()=>{
          // 스트리머 상세 팝업과 동일한 ELO 등급 배지 — 숫자 칩과 등급 칩을 하나로 합쳐 깔끔하게
          const eloVal = Number(p.elo||1200);
          const GRADES = [
            [1500,'LEGEND','👑','#9a3412'],
            [1400,'MASTER','🏅','#6b21a8'],
            [1300,'DIAMOND','💎','#075985'],
            [1200,'GOLD','🥇','#854d0e'],
            [1100,'SILVER','🥈','#475569'],
            [0,'BRONZE','🥉','#7c2d12'],
          ];
          const [,label,icon,color] = GRADES.find(([min])=>eloVal>=min) || GRADES[GRADES.length-1];
          return `<span class="pr-chip" style="background:${color}16;color:${color};border:1.5px solid ${color}45;gap:5px;font-weight:900">${icon} ${label} <span style="opacity:.6;font-weight:700">· ELO ${eloVal}</span></span>`;
        })()}
      </div>
    </div>
    <div class="pr-hero-actions no-export">
      <button class="pr-btn pr-btn-primary" onclick="openPlayerModal('${escJS(p.name)}')">👤 상세 프로필</button>
      <a class="pr-btn pr-btn-ghost pr-btn-iconOnly" href="${eloBoardUrl}" target="_blank" rel="noopener" title="ELO 보드">📡<span>ELO 보드</span></a>
      <button class="pr-btn pr-btn-ghost pr-btn-iconOnly" title="리포트 이미지 저장" onclick="_prSaveReportImage()">📸<span>리포트 이미지 저장</span></button>
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
    drop.innerHTML = `<div style="padding:14px;text-align:center;color:var(--text2);font-size:12px">검색 결과가 없습니다</div>`;
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
        <div style="font-size:11px;color:var(--text2)">${escHTML(p.tier||'-')} · ${escHTML(p.univ||'-')}</div>
      </div>
      <div style="font-size:12px;font-weight:800;color:${wr>=50?'var(--red)':'var(--text2)'}">${tot?_prWrIcon(wr)+' ':''}${wr}%</div>
    </div>`;
  }).join('');
  drop.style.display='block';
}
function _prSelectPlayer(name){
  window._prName = name;
  window._prVsOpp = '';
  window._prTableLimit = 20;
  window._prRecentMapFilter = '';
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
