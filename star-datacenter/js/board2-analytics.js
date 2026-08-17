function _b2RankingView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const tieredVis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim()) &&
    !_b2HasRole(p)
  );
  const univList = _b2VisUnivs ? _b2VisUnivs().filter(u=>u.name && u.name!=='무소속') : [];
  const TIERS_LOCAL = typeof TIERS !== 'undefined' ? TIERS : [];
  const sortMode = window._b2RankingSort || 'tier';

  const tierScore = (tier) => {
    const idx = TIERS_LOCAL.indexOf(tier);
    return idx < 0 ? 0 : Math.max(0, (TIERS_LOCAL.length - idx) * 10);
  };

  // 이번주 / 이전주 날짜 범위
  const { fromN: thisFromN, toN: thisToN } = _b2ThisWeekRange();
  const dateNum = _b2DateNum;
  // 이전주: 이번주 월요일 - 7일 ~ 이번주 월요일 - 1일
  const _rkNow = new Date();
  const _rkDay = _rkNow.getDay();
  const _rkThisMon = new Date(_rkNow); _rkThisMon.setDate(_rkNow.getDate() + (_rkDay === 0 ? -6 : 1 - _rkDay));
  const prevMon = new Date(_rkThisMon); prevMon.setDate(_rkThisMon.getDate() - 7);
  const prevSun = new Date(_rkThisMon); prevSun.setDate(_rkThisMon.getDate() - 1);
  const _fmtN = d => parseInt(d.toISOString().slice(0,10).replace(/-/g,''));
  const prevFromN = _fmtN(prevMon), prevToN = _fmtN(prevSun);

  const univStats = univList.map(u => {
    const members = tieredVis.filter(p => String(p?.univ||'').trim() === u.name);
    if (!members.length) return null;

    // 티어 점수
    const score = members.reduce((s,p) => s + tierScore(p.tier||''), 0);

    // 이번주 승률
    let tw=0, tl=0, pw=0, pl=0;
    const memberNames = new Set(members.map(p=>p.name));
    members.forEach(p => {
      (Array.isArray(p.history)?p.history:[]).forEach(h => {
        const d = dateNum(h.date||h.d||'');
        if (d >= thisFromN && d <= thisToN) { h.result==='승'?tw++:h.result==='패'?tl++:null; }
        if (d >= prevFromN && d <= prevToN) { h.result==='승'?pw++:h.result==='패'?pl++:null; }
      });
    });
    // indM/gjM 이번주 승패도 포함
    try { (typeof indM!=='undefined'&&Array.isArray(indM)?indM:[]).forEach(m=>{
      if(!m||!m.d||!m.wName||!m.lName) return;
      const d=dateNum(m.d);
      if(memberNames.has(m.wName)){if(d>=thisFromN&&d<=thisToN)tw++;else if(d>=prevFromN&&d<=prevToN)pw++;}
      if(memberNames.has(m.lName)){if(d>=thisFromN&&d<=thisToN)tl++;else if(d>=prevFromN&&d<=prevToN)pl++;}
    }); } catch(e){}
    try { (typeof gjM!=='undefined'&&Array.isArray(gjM)?gjM:[]).forEach(m=>{
      if(!m||!m.d||!m.wName||!m.lName||m._proLabel) return;
      const d=dateNum(m.d);
      if(memberNames.has(m.wName)){if(d>=thisFromN&&d<=thisToN)tw++;else if(d>=prevFromN&&d<=prevToN)pw++;}
      if(memberNames.has(m.lName)){if(d>=thisFromN&&d<=thisToN)tl++;else if(d>=prevFromN&&d<=prevToN)pl++;}
    }); } catch(e){}
    const tg = tw+tl, pg = pw+pl;
    const wr = tg > 0 ? Math.round(tw/tg*100) : null;
    const pwr = pg > 0 ? Math.round(pw/pg*100) : null;

    const topMember = members.slice().sort((a,b)=>{
      const ia=TIERS_LOCAL.indexOf(a.tier||''),ib=TIERS_LOCAL.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999);
    })[0];
    const topTier = topMember?.tier||'없음';
    const topTierCol = typeof getTierBtnColor==='function'?getTierBtnColor(topTier):'#64748b';
    const topTierTc  = typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(topTier)||'#fff'):'#fff';
    const races={P:0,T:0,Z:0};
    members.forEach(p=>{if(p.race in races)races[p.race]++;});
    const dominantRace=Object.entries(races).sort((a,b)=>b[1]-a[1])[0]?.[0]||'?';
    const raceEmoji={P:'🔮',T:'⚔️',Z:'🦎','?':'❓'}[dominantRace]||'❓';

    return { name:u.name, color:gc(u.name)||'#64748b', count:members.length, score, topTier, topTierCol, topTierTc, races, dominantRace, raceEmoji, tw, tl, tg, wr, pwr };
  }).filter(Boolean);

  // 정렬
  const sorted = [...univStats].sort((a,b) => {
    if (sortMode === 'tier')   return b.score - a.score || b.count - a.count;
    if (sortMode === 'count')  return b.count - a.count || b.score - a.score;
    if (sortMode === 'wr')     return (b.wr??-1) - (a.wr??-1) || b.tg - a.tg;
    if (sortMode === 'games')  return b.tg - a.tg || b.tw - a.tw;
    return 0;
  });

  // 이전 순위 맵 (tier 기준 고정)
  const tierSorted = [...univStats].sort((a,b)=>b.score-a.score||b.count-a.count);
  const prevRankMap = {}; tierSorted.forEach((u,i)=>{ prevRankMap[u.name]=i+1; });

  const maxScore = Math.max(...sorted.map(u=>u.score),1);
  const maxCount = Math.max(...sorted.map(u=>u.count),1);
  const maxGames = Math.max(...sorted.map(u=>u.tg),1);
  const medals = ['🥇','🥈','🥉'];

  const sortBtns = [
    { key:'tier',  label:'🏅 티어 점수' },
    { key:'count', label:'👥 인원수' },
    { key:'wr',    label:'📈 이번주 승률' },
    { key:'games', label:'⚔️ 이번주 경기수' },
  ];

  let h = `<style>
    .b2rk2-wrap {}
    .b2rk2-sortbar { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px }
    .b2rk2-sbtn { padding:6px 14px;border-radius:20px;border:1.5px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;color:var(--text2);cursor:pointer;transition:all .15s }
    .b2rk2-sbtn.on { background:var(--text1);color:var(--white);border-color:var(--text1) }
    .b2rk2-sbtn:hover:not(.on) { border-color:var(--text2) }
    .b2rk2-row { display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;margin-bottom:6px;border:1.5px solid var(--border2);background:var(--white);cursor:pointer;position:relative;overflow:hidden;transition:border-color .12s,background .12s }
    .b2rk2-row:hover { background:var(--hover) }
    .b2rk2-row.selected { border-color:var(--text1);background:var(--hover);box-shadow:0 0 0 3px rgba(0,0,0,.06) }
    .b2rk2-row:active { transform:scale(.995) }
    .b2rk2-rank { font-size:22px;min-width:36px;text-align:center;font-weight:900 }
    .b2rk2-name { font-size:14px;font-weight:900;min-width:64px }
    .b2rk2-bar-wrap { flex:1;height:12px;border-radius:6px;background:var(--border2);overflow:hidden }
    .b2rk2-bar { height:100%;border-radius:6px;transition:width .7s ease }
    .b2rk2-bar-wrap.wl { display:flex;align-items:stretch;background:#cbd5e1;gap:1px;position:relative }
    .b2rk2-bar-win { height:100%;background:#dc2626;transition:width .7s ease }
    .b2rk2-bar-loss { height:100%;flex:1;background:#cbd5e1 }
    .b2rk2-wl-legend { display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:10.5px;font-weight:800;color:var(--text3) }
    .b2rk2-wl-legend span { display:inline-flex;align-items:center;gap:4px }
    .b2rk2-wl-legend i { width:9px;height:9px;border-radius:3px;display:inline-block }
    .b2rk2-score { font-size:var(--fs-base);font-weight:900;min-width:52px;text-align:right }
    .b2rk2-badges { display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap;align-items:center }
    .b2rk2-glow { position:absolute;inset:0;opacity:.05;pointer-events:none }
    .b2rk2-delta { font-size:var(--fs-caption);font-weight:800;margin-left:2px }
    body.dark .b2rk2-row { background:linear-gradient(180deg,rgba(15,23,42,.72),rgba(15,23,42,.62)); border-color:#334155 }
    body.dark .b2rk2-row.selected { box-shadow:0 0 0 3px rgba(255,255,255,.08) }
    body.dark .b2rk2-sbtn { background:rgba(15,23,42,.6); border-color:#334155; color:#94a3b8 }
    body.dark .b2rk2-sbtn.on { background:#e2e8f0; color:#0f172a; border-color:#e2e8f0 }
  </style>`;

  // 헤더 배너
  h += `<div style="margin-bottom:14px;padding:12px 16px;background:linear-gradient(135deg,#f97316,#fb923c);border-radius:14px;display:flex;align-items:center;gap:10px">
    <span style="font-size:24px">🏆</span>
    <div>
      <div style="font-size:var(--fs-md);font-weight:900;color:#fff">대학별 종합 랭킹</div>
      <div style="font-size:var(--fs-caption);color:rgba(255,255,255,.8)">정렬 기준을 선택해 다양한 관점으로 비교</div>
    </div>
    <div style="margin-left:auto;text-align:right">
      <div style="font-size:20px;font-weight:900;color:#fff">${sorted.length}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.8)">대학 참가</div>
    </div>
  </div>`;

  // 정렬 버튼
  h += `<div class="b2rk2-sortbar">
    ${sortBtns.map(b=>`<button class="b2rk2-sbtn${sortMode===b.key?' on':''}" onclick="window._b2RankingSort='${b.key}';render()">${b.label}</button>`).join('')}
  </div>`;

  // 승패 막대 범례 (색상 의미 안내)
  h += `<div class="b2rk2-wl-legend"><span><i style="background:#dc2626"></i>이번주 승</span><span><i style="background:#cbd5e1"></i>이번주 패</span></div>`;

  h += `<div class="b2rk2-wrap">`;
  sorted.forEach((u, i) => {
    const rank = i + 1;
    const prevRank = prevRankMap[u.name] || rank;
    const rankDelta = prevRank - rank; // 양수=상승
    const rankDisplay = medals[i] || `<span style="font-size:14px;font-weight:900;color:var(--text3)">${rank}</span>`;
    const isTop3 = i < 3;

    // 정렬 기준에 따라 바 값 결정
    let barW = 0, scoreLabel = '';
    if (sortMode === 'tier')  { barW=Math.round(u.score/maxScore*100); scoreLabel=`${u.score}pt`; }
    if (sortMode === 'count') { barW=Math.round(u.count/maxCount*100); scoreLabel=`${u.count}명`; }
    if (sortMode === 'wr')    { barW=u.wr??0; scoreLabel=u.wr!==null?`${u.wr}%`:'-'; }
    if (sortMode === 'games') { barW=Math.round(u.tg/Math.max(maxGames,1)*100); scoreLabel=`${u.tg}전`; }

    // 순위 변동 배지
    let deltaHtml = '';
    if (sortMode === 'tier' && rankDelta !== 0) {
      const col = rankDelta>0?'#10b981':'#ef4444';
      const arrow = rankDelta>0?'▲':'▼';
      deltaHtml = `<span class="b2rk2-delta" style="color:${col}">${arrow}${Math.abs(rankDelta)}</span>`;
    }

    // 이번주 승률 뱃지
    const wrBadge = u.wr!==null
      ? `<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:${u.wr>=60?'#10b981':u.wr>=40?'#f59e0b':'#ef4444'};color:#fff;font-weight:800">📈 ${u.wr}%</span>`
      : '';
    const pWrDelta = (u.wr!==null && u.pwr!==null)
      ? `<span style="font-size:10px;color:${u.wr>=u.pwr?'#10b981':'#ef4444'};font-weight:700">${u.wr>=u.pwr?'▲':'▼'}${Math.abs(u.wr-u.pwr)}%</span>`
      : '';

    h += `<div class="b2rk2-row" style="cursor:pointer;${isTop3?`border-color:${u.color}66;background:${u.color}08`:''
    }" onclick="(function(el){document.querySelectorAll('.b2rk2-row').forEach(function(r){r.classList.remove('selected')});el.classList.toggle('selected');})(this);if(typeof openUnivModal==='function')openUnivModal('${(typeof escJS==='function'?escJS(u.name):String(u.name).replace(/'/g,"\\'"))}')">
      <div class="b2rk2-glow" style="background:radial-gradient(ellipse at 0% 50%,${u.color},transparent 60%)"></div>
      <div class="b2rk2-rank">${rankDisplay}${deltaHtml}</div>
      <div class="b2rk2-name" style="color:${u.color}">${(typeof window.escHTML==='function'?window.escHTML(u.name):String(u.name||''))}</div>
      ${u.tg === 0
        ? `<div class="b2rk2-bar-wrap"></div>`
        : `<div class="b2rk2-bar-wrap wl" title="이번주 ${u.tw}승 ${u.tl}패 (${u.wr}%)">
        <div class="b2rk2-bar-win" style="width:${u.wr}%"></div>
        <div class="b2rk2-bar-loss"></div>
      </div>`}
      <div class="b2rk2-score" style="color:${u.color}">${scoreLabel}</div>
      <div class="b2rk2-badges">
        <span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;background:${u.topTierCol};color:${u.topTierTc}">TOP ${u.topTier}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px;background:var(--surface);color:var(--text2)">${u.raceEmoji} ${u.count}명</span>
        ${u.tg > 0 ? wrBadge : ''}
        ${pWrDelta}
      </div>
    </div>`;
  });
  h += `</div>`;

  // 점수 기준 설명
  if (sortMode === 'tier') {
    h += `<div style="margin-top:12px;padding:10px 14px;background:var(--surface);border-radius:var(--r);border:1px solid var(--border2)">
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:6px">📌 티어 점수 기준</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${TIERS_LOCAL.filter(t=>tieredVis.some(p=>p.tier===t)).map(t=>{
          const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
          const tc=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
          return `<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;background:${col};color:${tc}">${t} = ${tierScore(t)}pt</span>`;
        }).join('')}
      </div>
    </div>`;
  }

  return h;
}
/* ══════════════════════════════════════
   📊 요약 통계 뷰 - 인터랙티브 대시보드
══════════════════════════════════════ */
/* ══════════════════════════════════════
   📊 요약 뷰 v2 — 활동인원·통산승률·신입 추가
══════════════════════════════════════ */
function _b2SummaryView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet.has(String(p?.univ||'').trim()));
  const tieredVis = vis.filter(p => !_b2HasRole(p));
  const roledVis  = vis.filter(p => _b2HasRole(p));
  const univList  = _b2VisUnivs ? _b2VisUnivs().filter(u=>u.name && u.name!=='무소속') : [];

  // 종족 카운트
  const raceCts = {P:0,T:0,Z:0,'?':0};
  tieredVis.forEach(p => { const r=p.race||'?'; raceCts[r in raceCts?r:'?']++; });
  const tierCts = {};
  tieredVis.forEach(p => { const t=p.tier||'미정'; tierCts[t]=(tierCts[t]||0)+1; });

  // 종족별 통산 승률 (인원 비율과 별개로 실제 승률 비교용)
  const raceRecord = {P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};
  tieredVis.forEach(p => {
    if (!(p.race in raceRecord)) return;
    (Array.isArray(p.history)?p.history:[]).forEach(h => {
      if (h.result==='승') raceRecord[p.race].w++;
      else if (h.result==='패') raceRecord[p.race].l++;
    });
  });

  // 이번주 / 지난주 날짜 범위 (지난주 대비 증감 표시용)
  const { fromN: thisFromN, toN: thisToN } = _b2ThisWeekRange();
  const dateNum = _b2DateNum;
  const _nowD = new Date();
  const _day = _nowD.getDay();
  const _thisMon = new Date(_nowD); _thisMon.setHours(0,0,0,0); _thisMon.setDate(_nowD.getDate()+(_day===0?-6:1-_day));
  const _lastMon = new Date(_thisMon); _lastMon.setDate(_thisMon.getDate()-7);
  const _lastSun = new Date(_thisMon); _lastSun.setDate(_thisMon.getDate()-1); _lastSun.setHours(23,59,59,999);
  const _fmtN = d => parseInt(d.toISOString().slice(0,10).replace(/-/g,''));
  const lastFromN = _fmtN(_lastMon), lastToN = _fmtN(_lastSun);

  // 통산 전적 & 이번주/지난주 활동·전적
  let totalW=0, totalL=0, weekW=0, weekL=0;
  const weekActive=new Set(), lastWeekActive=new Set();
  tieredVis.forEach(p => {
    (Array.isArray(p.history)?p.history:[]).forEach(h => {
      if (h.result==='승') totalW++;
      else if (h.result==='패') totalL++;
      const d = dateNum(h.date||h.d||'');
      if (d>=thisFromN && d<=thisToN) {
        weekActive.add(p.name);
        if (h.result==='승') weekW++; else if (h.result==='패') weekL++;
      } else if (d>=lastFromN && d<=lastToN) {
        lastWeekActive.add(p.name);
      }
    });
  });
  const totalG = totalW+totalL;
  const totalWr = totalG>0 ? Math.round(totalW/totalG*100) : null;
  const weekDiff = weekActive.size - lastWeekActive.size;
  const weekTrendTxt = weekDiff===0 ? '지난주와 동일' : `${weekDiff>0?'▲':'▼'} 지난주 대비 ${Math.abs(weekDiff)}명`;
  const weekTrendColor = weekDiff===0 ? 'var(--text3)' : (weekDiff>0 ? '#16a34a' : '#dc2626');

  // 최근 합류 선수 (history 첫 경기 기준 최근 30일)
  const now = new Date();
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate()-30);
  const recentN = dateNum(thirtyDaysAgo.toISOString().slice(0,10));
  const newPlayers = tieredVis.filter(p => {
    const hist = Array.isArray(p.history)?p.history:[];
    if (!hist.length) return false;
    const firstD = Math.min(...hist.map(h=>dateNum(h.date||h.d||'')).filter(d=>d>0));
    return firstD >= recentN;
  }).sort((a,b) => {
    const fa = Math.min(...(Array.isArray(a.history)?a.history:[]).map(h=>dateNum(h.date||h.d||'')).filter(d=>d>0));
    const fb = Math.min(...(Array.isArray(b.history)?b.history:[]).map(h=>dateNum(h.date||h.d||'')).filter(d=>d>0));
    return fb - fa;
  }).slice(0, 8);

  // 선수별 통산 승/패·연승 집계 (다승왕 TOP, 연승 리더용)
  const playerAgg = tieredVis.map(p => {
    const decided = (Array.isArray(p.history)?p.history:[]).filter(h => h && (h.result==='승'||h.result==='패'));
    const sortedDesc = [...decided].sort((a,b) => dateNum(b.date||b.d||'') - dateNum(a.date||a.d||''));
    let streak = 0;
    for (const h of sortedDesc) { if (h.result==='승') streak++; else break; }
    const win = decided.filter(h=>h.result==='승').length;
    const loss = decided.length - win;
    const wr = decided.length ? Math.round(win/decided.length*100) : null;
    return { p, win, loss, games: decided.length, wr, streak };
  });
  const topWinners = playerAgg.filter(x=>x.win>0)
    .sort((a,b) => b.win - a.win || (b.wr??-1) - (a.wr??-1))
    .slice(0, 8);
  const topStreaks = playerAgg.filter(x=>x.streak>=3)
    .sort((a,b) => b.streak - a.streak)
    .slice(0, 6);

  // 최근 7일 일별 활동량 (경기 수)
  const last7Days = [];
  for (let i=6;i>=0;i--) {
    const d = new Date(_nowD); d.setDate(_nowD.getDate()-i); d.setHours(0,0,0,0);
    last7Days.push({ dn:_fmtN(d), label:`${d.getMonth()+1}/${d.getDate()}`, isToday:i===0, count:0 });
  }
  const last7Map = new Map(last7Days.map(x=>[x.dn, x]));
  tieredVis.forEach(p => {
    (Array.isArray(p.history)?p.history:[]).forEach(h => {
      if (!h || (h.result!=='승' && h.result!=='패')) return;
      const row = last7Map.get(dateNum(h.date||h.d||''));
      if (row) row.count++;
    });
  });
  const last7Max = Math.max(1, ...last7Days.map(x=>x.count));

  // 대학별 스탯 (인원/종족/티어 구성 + 통산 승/패)
  const univStats = univList.map(u => {
    const members = tieredVis.filter(p => String(p?.univ||'').trim()===String(u.name||'').trim());
    const rCts={P:0,T:0,Z:0};
    members.forEach(p=>{if(p.race in rCts)rCts[p.race]++;});
    const tierDist={};
    members.forEach(p=>{const t=p.tier||'미정';tierDist[t]=(tierDist[t]||0)+1;});
    let uw=0, ul=0;
    members.forEach(p=>(Array.isArray(p.history)?p.history:[]).forEach(h=>{ if(h.result==='승')uw++; else if(h.result==='패')ul++; }));
    const ug=uw+ul;
    return {name:u.name,color:gc(u.name),count:members.length,races:rCts,tiers:tierDist,wins:uw,losses:ul,games:ug,wr:ug>0?Math.round(uw/ug*100):null};
  }).filter(u=>u.count>0).sort((a,b)=>b.count-a.count);

  // 🏅 대학 랭킹 (다승 기준 — 승률만 있으면 소수 경기로 순위가 왜곡될 수 있어 총 승수 기준으로 변경)
  const univWinRank = univStats.filter(u=>u.wins>0)
    .slice()
    .sort((a,b) => b.wins-a.wins || (b.wr??-1)-(a.wr??-1))
    .slice(0, 8);

  // 🥇 이번주 MVP (이번주 승수 1위)
  const weeklyAgg = tieredVis.map(p => {
    let ww=0, wl=0;
    (Array.isArray(p.history)?p.history:[]).forEach(h => {
      const d = dateNum(h.date||h.d||'');
      if (d>=thisFromN && d<=thisToN) { if(h.result==='승')ww++; else if(h.result==='패')wl++; }
    });
    return { p, w:ww, l:wl };
  }).filter(x=>x.w>0).sort((a,b)=>b.w-a.w || a.l-b.l);
  const weeklyMvp = weeklyAgg[0] || null;

  const maxCount = univStats.length>0?univStats[0].count:1;
  const orderedTiers = (typeof TIERS!=='undefined'?TIERS:[]).filter(t=>tierCts[t]);
  const total3 = raceCts.P+raceCts.T+raceCts.Z||1;

  // 도넛 차트
  const donutRings = () => {
    const size=110,cx=55,cy=55,r=38,stroke=18;
    const total=raceCts.P+raceCts.T+raceCts.Z||1;
    const segs=[{val:raceCts.P,col:'#7c3aed',label:'P'},{val:raceCts.T,col:'#0284c7',label:'T'},{val:raceCts.Z,col:'#059669',label:'Z'}].filter(s=>s.val>0);
    const circ=2*Math.PI*r;
    let offset=0;
    const paths=segs.map(s=>{
      const dash=(s.val/total)*circ;
      const el=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.col}" stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>`;
      offset+=dash; return el;
    });
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border2)" stroke-width="${stroke}"/>
      ${paths.join('')}
      <text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--text1)">${tieredVis.length}</text>
      <text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="9" font-weight="600" fill="var(--text3)">선수</text>
    </svg>`;
  };

  let h = `<style>
    .b2s-hero{padding:20px 22px;border-radius:26px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.05);margin-bottom:16px}
    .b2s-hero-title{font-size:26px;font-weight:950;letter-spacing:-.04em;color:var(--text1);line-height:1.08}
    .b2s-hero-desc{margin-top:6px;font-size:var(--fs-base);line-height:1.65;color:var(--text3);max-width:720px}
    .b2s-hero-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    .b2s-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 18px rgba(15,23,42,.04);font-size:var(--fs-sm);font-weight:800;color:var(--text2)}
    .b2s-hero-badge--trend{border-color:${weekTrendColor}44}
    .b2s-grid7 { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; margin-bottom:16px; }
    @media(max-width:700px){ .b2s-grid7{ grid-template-columns:repeat(4,1fr); } }
    @media(max-width:420px){ .b2s-grid7{ grid-template-columns:repeat(2,1fr); } }
    .b2s-kpi { border-radius:18px; padding:15px 12px; text-align:center; position:relative; overflow:hidden; border:1px solid rgba(148,163,184,.16); background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96)); box-shadow:0 14px 24px rgba(15,23,42,.04); transition:transform .15s,box-shadow .15s; cursor:default; }
    .b2s-kpi:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(15,23,42,.08); }
    .b2s-kpi-num { font-size:26px; font-weight:900; line-height:1.1; }
    .b2s-kpi-lbl { font-size:var(--fs-caption); font-weight:700; margin-top:3px; opacity:.75; }
    .b2s-kpi-sub { font-size:10px; opacity:.6; margin-top:1px; }
    .b2s-kpi-glow { position:absolute;inset:0;opacity:.08;pointer-events:none; }
    .b2s-2col { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
    @media(max-width:640px){ .b2s-2col{ grid-template-columns:1fr; } }
    .b2s-panel { background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96)); border:1px solid rgba(148,163,184,.16); border-radius:20px; padding:16px; box-shadow:0 16px 28px rgba(15,23,42,.04); }
    .b2s-panel-title { font-size:var(--fs-base); font-weight:900; color:var(--text1); margin-bottom:12px; display:flex; align-items:center; gap:6px; }
    .b2s-univ-row { display:flex; align-items:center; gap:8px; padding:6px 4px; border-radius:10px; cursor:pointer; transition:background .12s; }
    .b2s-univ-row:hover { background:var(--surface); }
    .b2s-univ-row + .b2s-univ-row { border-top:1px solid var(--border2); }
    .b2s-bar-track { flex:1; height:12px; border-radius:6px; overflow:hidden; background:var(--border2); display:flex; }
    .b2s-tier-chip { display:inline-flex; flex-direction:column; align-items:center; padding:8px 10px; border-radius:14px; min-width:54px; box-shadow:0 10px 16px rgba(15,23,42,.04); }
    .b2s-top-univ { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:8px; }
    .b2s-univ-card { border-radius:var(--r2); padding:10px 12px; border:1.5px solid; position:relative; overflow:hidden; transition:transform .12s,box-shadow .12s; cursor:pointer; box-shadow:0 12px 18px rgba(15,23,42,.04); }
    .b2s-univ-card:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(15,23,42,.08); }
    .b2s-new-player { display:inline-flex;align-items:center;gap:5px;padding:4px 9px 4px 4px;border-radius:999px;background:var(--surface);border:1px solid var(--border2);font-size:var(--fs-caption);font-weight:700;color:var(--text2);margin:2px;cursor:pointer;transition:transform .12s,box-shadow .12s; }
    .b2s-new-player:hover { transform:translateY(-1px); box-shadow:0 6px 14px rgba(15,23,42,.1); }
    .b2s-new-player-avatar { width:20px;height:20px;border-radius:50%;flex-shrink:0;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff; }
    .b2s-new-player-avatar img { width:100%;height:100%;object-fit:cover; }
    .b2s-winner-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:8px; }
    .b2s-winner-card { border-radius:var(--r2); padding:10px 12px; border:1.5px solid; position:relative; overflow:hidden; cursor:pointer; transition:transform .12s,box-shadow .12s; box-shadow:0 12px 18px rgba(15,23,42,.04); }
    .b2s-winner-card:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(15,23,42,.08); }
    .b2s-winner-card-top { display:flex; align-items:center; gap:8px; margin-bottom:9px; }
    .b2s-winner-rank { font-size:15px; flex-shrink:0; width:20px; text-align:center; font-weight:900; color:var(--text3); }
    .b2s-winner-avatar { width:32px;height:32px;border-radius:50%;flex-shrink:0;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fff;box-shadow:0 3px 8px rgba(15,23,42,.14); }
    .b2s-winner-avatar img { width:100%;height:100%;object-fit:cover; }
    .b2s-streak-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 14px; }
    @media(max-width:640px){ .b2s-streak-grid{ grid-template-columns:1fr; } }
    .b2s-streak-row { display:flex;align-items:center;gap:10px;padding:8px 8px;border-radius:12px;cursor:pointer;transition:background .12s,transform .12s; }
    .b2s-streak-row:hover { background:var(--surface); transform:translateX(2px); }
    .b2s-streak-row--top { background:linear-gradient(90deg,rgba(245,158,11,.12),transparent 65%); }
    .b2s-streak-rank { width:22px;flex-shrink:0;text-align:center;font-size:13px;font-weight:900;color:var(--text3); }
    .b2s-streak-avatar { width:32px;height:32px;border-radius:50%;flex-shrink:0;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fff;box-shadow:0 3px 8px rgba(15,23,42,.14); }
    .b2s-streak-avatar img { width:100%;height:100%;object-fit:cover; }
    .b2s-streak-bar-track { flex:1; height:9px; border-radius:5px; overflow:hidden; background:var(--border2); margin:0 4px; min-width:40px; }
    .b2s-streak-bar-fill { height:100%; border-radius:5px; transition:width .6s ease; }
    .b2s-streak-badge { display:inline-flex;align-items:center;gap:3px;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:900;color:#fff;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,.14);flex-shrink:0; }
    .b2s-trend-wrap { display:flex;align-items:flex-end;gap:6px;height:96px;padding-top:6px; }
    .b2s-trend-col { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:6px; }
    .b2s-trend-bar { width:100%;max-width:30px;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,#60a5fa,#3b82f6);transition:height .5s ease;min-height:3px; }
    .b2s-trend-bar.today { background:linear-gradient(180deg,#fbbf24,#f59e0b); }
    .b2s-trend-lbl { font-size:9px;font-weight:800;color:var(--text3); }
    .b2s-trend-num { font-size:10px;font-weight:900;color:var(--text2); }
    @media(max-width:640px){
      .b2s-hero{padding:18px 16px;border-radius:22px}
      .b2s-hero-title{font-size:22px}
    }
    body.dark .b2s-hero,
    body.dark .b2s-hero-badge,
    body.dark .b2s-kpi,
    body.dark .b2s-panel {
      background:linear-gradient(180deg,rgba(15,23,42,.72),rgba(15,23,42,.62)) !important;
      border-color:#334155 !important;
      box-shadow:0 12px 22px rgba(0,0,0,.20) !important;
    }
    body.dark .b2s-univ-row:hover { background:rgba(148,163,184,.08); }
    body.dark .b2s-univ-row + .b2s-univ-row { border-top-color:#334155; }
    body.dark .b2s-bar-track { background:#334155; }
    body.dark .b2s-univ-card { background:rgba(15,23,42,.55); }
    body.dark .b2s-winner-card { background:rgba(15,23,42,.55); }
    body.dark .b2s-new-player { background:rgba(15,23,42,.6); border-color:#334155; color:#cbd5e1; }
    body.dark .b2s-streak-row:hover { background:rgba(148,163,184,.08); }
    body.dark .b2s-streak-bar-track { background:#334155; }
    body.dark .b2s-streak-row--top { background:linear-gradient(90deg,rgba(245,158,11,.18),transparent 65%); }
  </style>`;

  // KPI 7개 (이번주 활동은 주간 전적 + 지난주 대비 증감으로 표시)
  const kpis = [
    { num: vis.length,           lbl: '전체 선수', col:'#3b82f6', icon:'👥' },
    { num: univList.length,      lbl: '활동 대학', col:'#10b981', icon:'🏫' },
    { num: raceCts.P,            lbl: '프로토스',  col:'#7c3aed', icon:'🔮' },
    { num: raceCts.T,            lbl: '테란',      col:'#0284c7', icon:'⚔️' },
    { num: raceCts.Z,            lbl: '저그',      col:'#059669', icon:'🦎' },
    { num: weekActive.size,      lbl: '이번주 활동', col:'#f59e0b', icon:'🔥',
      sub:`${weekW}승 ${weekL}패 · <span style="color:${weekTrendColor}">${weekTrendTxt}</span>` },
    { num: totalWr!==null?`${totalWr}%`:'-', lbl:'통산 승률', col:'#ec4899', icon:'📊', sub:`${totalG.toLocaleString()}전 기준` },
  ];

  h += `<section class="b2s-hero">
    <div style="font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase">Summary Dashboard</div>
    <div class="b2s-hero-title">현황판 요약</div>
    <div class="b2s-hero-desc">전체 인원, 활동 대학, 종족 분포, 최근 유입과 대학별 구성을 한 화면에서 빠르게 훑을 수 있도록 정리한 요약 화면입니다.</div>
    <div class="b2s-hero-badges">
      <span class="b2s-hero-badge">표시 선수 ${vis.length}명</span>
      <span class="b2s-hero-badge">일반 ${tieredVis.length}명</span>
      <span class="b2s-hero-badge">직책 ${roledVis.length}명</span>
      <span class="b2s-hero-badge">최근 30일 신규 ${newPlayers.length}명</span>
      <span class="b2s-hero-badge b2s-hero-badge--trend">🔥 이번주 활동 ${weekActive.size}명 · <span style="color:${weekTrendColor}">${weekTrendTxt}</span></span>
      ${weeklyMvp ? `<span class="b2s-hero-badge" style="cursor:pointer" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${(weeklyMvp.p.name||'').replace(/'/g,"\\'")}')">🥇 이번주 MVP <b style="color:${gc(String(weeklyMvp.p?.univ||''))||'#64748b'}">${(typeof window.escHTML==='function'?window.escHTML(weeklyMvp.p.name):String(weeklyMvp.p.name||''))}</b> ${weeklyMvp.w}승${weeklyMvp.l?` ${weeklyMvp.l}패`:''}</span>` : ''}
    </div>
  </section>`;

  h += `<div class="b2s-grid7">
    ${kpis.map(k=>`
    <div class="b2s-kpi" style="background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96))">
      <div class="b2s-kpi-glow" style="background:radial-gradient(circle at 50% 0%,${k.col},transparent 70%)"></div>
      <div style="font-size:20px;margin-bottom:2px">${k.icon}</div>
      <div class="b2s-kpi-num" style="color:${k.col}">${k.num}</div>
      <div class="b2s-kpi-lbl" style="color:${k.col}">${k.lbl}</div>
      ${k.sub?`<div class="b2s-kpi-sub" style="color:${k.col}">${k.sub}</div>`:''}
    </div>`).join('')}
  </div>`;

  // 종족 비율 + 티어 분포 (대학별 미니 순위는 아래 "대학별 인원 현황"과 중복이라 통합, 여기선 제외)
  h += `<div class="b2s-2col">
    <div class="b2s-panel">
      <div class="b2s-panel-title">🎮 종족 비율
        <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">${tieredVis.length}명 기준</span>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        <div style="flex-shrink:0">${donutRings()}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          ${[{r:'P',c:'#7c3aed',l:'🔮 프로토스'},{r:'T',c:'#0284c7',l:'⚔️ 테란'},{r:'Z',c:'#059669',l:'🦎 저그'}].map(({r,c,l})=>{
            const n=raceCts[r]; const pct=Math.round(n/total3*100);
            return `<div>
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:var(--fs-caption);font-weight:800;color:${c}">${l}</span>
                <span style="font-size:var(--fs-caption);font-weight:900;color:var(--text2)">${n}<span style="font-weight:600;color:var(--text3)"> (${pct}%)</span></span>
              </div>
              <div style="height:7px;border-radius:4px;background:var(--border2);overflow:hidden">
                <div style="width:${pct}%;height:100%;background:${c};border-radius:4px;transition:width .8s ease"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
    <div class="b2s-panel">
      <div class="b2s-panel-title">🏆 티어 분포</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${orderedTiers.map(t=>{
          const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
          const tcol=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
          const n=tierCts[t]; const pct=Math.round(n/tieredVis.length*100);
          return `<div class="b2s-tier-chip" style="background:${col}18;border:1.5px solid ${col}55" title="${t}: ${n}명 (${pct}%)">
            <div style="font-size:var(--fs-sm);font-weight:900;padding:2px 8px;border-radius:6px;background:${col};color:${tcol}">${t}</div>
            <div style="font-size:var(--fs-caption);font-weight:800;color:${col};margin-top:3px">${n}명</div>
            <div style="font-size:10px;color:var(--text3)">${pct}%</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;

  // ⚔️ 종족별 승률 — "종족 비율"은 인원수 기준이라, 실제 승률은 따로 비교할 수 있게 추가
  h += `<div class="b2s-panel" style="margin-bottom:14px">
    <div class="b2s-panel-title">⚔️ 종족별 승률
      <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">통산 기준</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:11px">
      ${[{r:'P',c:'#7c3aed',l:'🔮 프로토스'},{r:'T',c:'#0284c7',l:'⚔️ 테란'},{r:'Z',c:'#059669',l:'🦎 저그'}].map(({r,c,l})=>{
        const rec=raceRecord[r]; const g=rec.w+rec.l; const wr=g>0?Math.round(rec.w/g*100):null;
        const wrCol = wr===null?'#94a3b8':wr>=55?'#10b981':wr>=45?'#f59e0b':'#ef4444';
        return `<div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
            <span style="font-size:var(--fs-caption);font-weight:800;color:${c}">${l}</span>
            <span style="font-size:var(--fs-caption);font-weight:900;color:${wrCol}">${wr!==null?wr+'%':'-'}<span style="font-weight:600;color:var(--text3);margin-left:5px">${rec.w}승 ${rec.l}패</span></span>
          </div>
          <div style="height:9px;border-radius:5px;background:var(--border2);overflow:hidden">
            <div style="width:${wr??0}%;height:100%;background:${wrCol};border-radius:5px;transition:width .8s ease"></div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 🏆 통산 다승 TOP — 승수 많은 선수 (요청으로 "최근 30일 첫 경기" 대신 노출)
  if (topWinners.length > 0) {
    h += `<div class="b2s-panel" style="margin-bottom:14px">
      <div class="b2s-panel-title">🏆 통산 다승 TOP
        <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">전체 ${playerAgg.filter(x=>x.games>0).length}명 중</span>
      </div>
      <div class="b2s-winner-grid">
        ${topWinners.map((x,i)=>{
          const p=x.p;
          const col=gc(String(p?.univ||''))||'#64748b';
          const rIco=p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
          const medal = i<3 ? ['🥇','🥈','🥉'][i] : `${i+1}`;
          const safeName=(p.name||'').replace(/'/g,"\\'");
          const photo = p.photo ? (typeof toThumbUrl==='function'?toThumbUrl(p.photo,44):p.photo) : '';
          const photoOrig = p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
          const initials = (p.name||'?').slice(0,1);
          const wrCol = x.wr===null?'#94a3b8':x.wr>=60?'#10b981':x.wr>=40?'#f59e0b':'#ef4444';
          const avatarHtml = photo
            ? `<span class="b2s-winner-avatar" style="background:${col}33;border:2px solid ${col}66"><img src="${photo}" data-orig="${photoOrig}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none'}"></span>`
            : `<span class="b2s-winner-avatar" style="background:${col};border:2px solid ${col}">${initials}</span>`;
          return `<div class="b2s-winner-card" style="border-color:${col}44;background:${col}0d"
            onclick="if(typeof _b2LineupCardHoverLeave==='function')_b2LineupCardHoverLeave();if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')"
            onmouseenter="if(typeof _b2LineupCardHoverEnter==='function')_b2LineupCardHoverEnter(event,this,'${safeName}','${col}')"
            onmouseleave="if(typeof _b2LineupCardHoverLeave==='function')_b2LineupCardHoverLeave()">
            <div class="b2s-winner-card-top">
              <span class="b2s-winner-rank">${medal}</span>
              ${avatarHtml}
              <div style="min-width:0;flex:1">
                <div style="font-size:var(--fs-sm);font-weight:900;color:${col};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(typeof window.escHTML==='function'?window.escHTML(p.name):String(p.name||''))}${rIco?` <span style="font-size:10px">${rIco}</span>`:''}</div>
                <div style="font-size:9px;font-weight:700;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(typeof window.escHTML==='function'?window.escHTML(p.univ||'무소속'):String(p.univ||'무소속'))}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
              <span style="font-size:10px;font-weight:800;color:var(--text2)">${x.win}승 ${x.loss}패</span>
              <span style="font-size:12px;font-weight:900;color:${wrCol}">${x.wr}%</span>
            </div>
            <div style="height:6px;border-radius:3px;background:var(--border2);overflow:hidden">
              <div style="width:${x.wr}%;height:100%;background:${wrCol};border-radius:3px;transition:width .6s ease"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  // 🔥 연승 리더 (3연승 이상)
  if (topStreaks.length > 0) {
    const maxStreak = topStreaks[0].streak || 1;
    h += `<div class="b2s-panel" style="margin-bottom:14px">
      <div class="b2s-panel-title">🔥 연승 리더
        <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">3연승 이상</span>
      </div>
      <div class="b2s-streak-grid">
      ${topStreaks.map((x,i)=>{
        const p=x.p;
        const col=gc(String(p?.univ||''))||'#64748b';
        const safeName=(p.name||'').replace(/'/g,"\\'");
        const photo = p.photo ? (typeof toThumbUrl==='function'?toThumbUrl(p.photo,32):p.photo) : '';
        const photoOrig = p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
        const initials = (p.name||'?').slice(0,1);
        const avatarHtml = photo
          ? `<span class="b2s-streak-avatar" style="background:${col}33;border:2px solid ${col}66"><img src="${photo}" data-orig="${photoOrig}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none'}"></span>`
          : `<span class="b2s-streak-avatar" style="background:${col};border:2px solid ${col}">${initials}</span>`;
        const t = Math.min(1, x.streak/Math.max(maxStreak,1));
        const hue = Math.round(38 - t*20); // 9연승에 가까울수록 붉은 계열, 3연승에 가까울수록 노란-주황
        const badgeBg = `linear-gradient(135deg,hsl(${hue} 92% 56%),hsl(${Math.max(hue-16,0)} 85% 46%))`;
        const rankDisplay = i<3 ? ['🥇','🥈','🥉'][i] : `${i+1}`;
        return `<div class="b2s-streak-row${i===0?' b2s-streak-row--top':''}"
          onclick="if(typeof _b2LineupCardHoverLeave==='function')_b2LineupCardHoverLeave();if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')"
          onmouseenter="if(typeof _b2LineupCardHoverEnter==='function')_b2LineupCardHoverEnter(event,this,'${safeName}','${col}')"
          onmouseleave="if(typeof _b2LineupCardHoverLeave==='function')_b2LineupCardHoverLeave()">
          <span class="b2s-streak-rank">${rankDisplay}</span>
          ${avatarHtml}
          <span style="min-width:0;flex-shrink:0">
            <div style="font-size:var(--fs-caption);font-weight:900;color:${col};max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(typeof window.escHTML==='function'?window.escHTML(p.name):String(p.name||''))}</div>
            <div style="font-size:9px;font-weight:700;color:var(--text3);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(typeof window.escHTML==='function'?window.escHTML(p.univ||'무소속'):String(p.univ||'무소속'))}</div>
          </span>
          <div class="b2s-streak-bar-track">
            <div class="b2s-streak-bar-fill" style="width:${Math.round(t*100)}%;background:${badgeBg}"></div>
          </div>
          <span class="b2s-streak-badge" style="background:${badgeBg}">🔥 ${x.streak}연승</span>
        </div>`;
      }).join('')}
      </div>
    </div>`;
  }

  // 📈 최근 7일 활동 추이 (일별 경기 수)
  h += `<div class="b2s-panel" style="margin-bottom:14px">
    <div class="b2s-panel-title">📈 최근 7일 활동 추이
      <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">일별 경기 수</span>
    </div>
    <div class="b2s-trend-wrap">
      ${last7Days.map(d=>{
        const hPct = Math.max(4, Math.round(d.count/last7Max*100));
        return `<div class="b2s-trend-col" title="${d.label}: ${d.count}경기">
          <span class="b2s-trend-num">${d.count}</span>
          <div class="b2s-trend-bar${d.isToday?' today':''}" style="height:${hPct}%"></div>
          <span class="b2s-trend-lbl">${d.isToday?'오늘':d.label}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 🏅 대학 랭킹 (다승) — "대학별 인원 현황"은 규모 기준이라, 실제 전적(승수) 기준 순위를 별도로 제공
  h += `<div class="b2s-panel" style="margin-bottom:14px">
    <div class="b2s-panel-title">🏅 대학 랭킹 (다승)
      <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">통산 승수 기준</span>
    </div>
    ${univWinRank.length ? univWinRank.map((u,i)=>{
      const wrCol = u.wr===null?'#94a3b8':u.wr>=55?'#10b981':u.wr>=45?'#f59e0b':'#ef4444';
      const medal = i<3 ? ['🥇','🥈','🥉'][i] : `${i+1}`;
      const barPct = univWinRank[0].wins>0 ? Math.round(u.wins/univWinRank[0].wins*100) : 0;
      const safeUnivName = String(u.name||'').replace(/'/g,"\\'");
      return `<div class="b2s-univ-row" onclick="if(typeof openUnivModal==='function')openUnivModal('${safeUnivName}')" title="${u.name} 상세 보기">
        <span style="width:20px;flex-shrink:0;text-align:center;font-size:12px;font-weight:900;color:var(--text3)">${medal}</span>
        <span style="font-size:var(--fs-caption);font-weight:800;color:${u.color};min-width:64px;max-width:76px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(typeof window.escHTML==='function'?window.escHTML(u.name):String(u.name||''))}</span>
        <div class="b2s-bar-track">
          <div style="width:${barPct}%;height:100%;background:${u.color};transition:width .6s ease"></div>
        </div>
        <span style="font-size:var(--fs-caption);font-weight:900;color:${u.color};min-width:44px;text-align:right">${u.wins}승</span>
        <span style="font-size:9px;color:${wrCol};font-weight:800;min-width:50px;text-align:right">${u.losses}패 · ${u.wr!==null?u.wr+'%':'-'}</span>
      </div>`;
    }).join('') : `<div style="text-align:center;color:var(--text3);font-size:var(--fs-caption);padding:14px 0">아직 전적이 쌓인 대학이 없습니다</div>`}
  </div>`;

  // 대학별 인원 현황 (요약탭에서 대학 데이터를 보여주는 유일한 섹션 — 메달 카드 + 전체 리스트, 클릭 시 대학 상세로 이동)
  h += `<div class="b2s-panel" style="margin-bottom:14px">
    <div class="b2s-panel-title">🏫 대학별 인원 현황
      <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">${univStats.length}개 대학</span>
    </div>
    <div class="b2s-top-univ" style="margin-bottom:12px">
      ${univStats.slice(0,6).map((u,i)=>{
        const medal=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'][i]||'';
        const pP=u.count>0?Math.round(u.races.P/u.count*100):0;
        const pT=u.count>0?Math.round(u.races.T/u.count*100):0;
        const pZ=u.count>0?Math.round(u.races.Z/u.count*100):0;
        const safeUnivName=String(u.name||'').replace(/'/g,"\\'");
        return `<div class="b2s-univ-card" style="border-color:${u.color}44;background:${u.color}0d" onclick="if(typeof openUnivModal==='function')openUnivModal('${safeUnivName}')" title="${u.name} 상세 보기">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
            <span style="font-size:14px">${medal}</span>
            <span style="font-size:var(--fs-sm);font-weight:900;color:${u.color};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${(typeof window.escHTML==='function'?window.escHTML(u.name):String(u.name||''))}</span>
            <span style="font-size:var(--fs-md);font-weight:900;color:${u.color}">${u.count}</span>
          </div>
          <div style="height:6px;border-radius:3px;overflow:hidden;background:var(--border2);display:flex;margin-bottom:4px">
            <div style="width:${pP}%;background:#7c3aed" title="P ${u.races.P}"></div>
            <div style="width:${pT}%;background:#0284c7" title="T ${u.races.T}"></div>
            <div style="width:${pZ}%;background:#059669" title="Z ${u.races.Z}"></div>
          </div>
          <div style="display:flex;gap:3px;flex-wrap:wrap">
            ${u.races.P?`<span style="font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 5px;border-radius:5px;font-weight:800">P${u.races.P}</span>`:''}
            ${u.races.T?`<span style="font-size:9px;background:#e0f2fe;color:#075985;padding:1px 5px;border-radius:5px;font-weight:800">T${u.races.T}</span>`:''}
            ${u.races.Z?`<span style="font-size:9px;background:#d1fae5;color:#064e3b;padding:1px 5px;border-radius:5px;font-weight:800">Z${u.races.Z}</span>`:''}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="border-top:1px solid var(--border2);padding-top:6px">
      ${univStats.slice(0,20).map(u=>{
        const barW=Math.round(u.count/maxCount*100);
        const safeUnivName=String(u.name||'').replace(/'/g,"\\'");
        return `<div class="b2s-univ-row" onclick="if(typeof openUnivModal==='function')openUnivModal('${safeUnivName}')" title="${u.name} 상세 보기">
          <span style="font-size:var(--fs-caption);font-weight:800;color:${u.color};min-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(typeof window.escHTML==='function'?window.escHTML(u.name):String(u.name||''))}</span>
          <div class="b2s-bar-track">
            <div title="프로토스 ${u.races.P}" style="width:${Math.round(u.races.P/u.count*barW)}%;background:#7c3aed;transition:width .6s ease"></div>
            <div title="테란 ${u.races.T}" style="width:${Math.round(u.races.T/u.count*barW)}%;background:#0284c7;transition:width .6s ease"></div>
            <div title="저그 ${u.races.Z}" style="width:${Math.round(u.races.Z/u.count*barW)}%;background:#059669;transition:width .6s ease"></div>
          </div>
          <span style="font-size:var(--fs-caption);font-weight:900;color:${u.color};min-width:22px;text-align:right">${u.count}</span>
          <div style="display:flex;gap:3px;margin-left:3px;min-width:70px">
            ${u.races.P?`<span style="font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 4px;border-radius:5px;font-weight:800">P${u.races.P}</span>`:''}
            ${u.races.T?`<span style="font-size:9px;background:#e0f2fe;color:#075985;padding:1px 4px;border-radius:5px;font-weight:800">T${u.races.T}</span>`:''}
            ${u.races.Z?`<span style="font-size:9px;background:#d1fae5;color:#064e3b;padding:1px 4px;border-radius:5px;font-weight:800">Z${u.races.Z}</span>`:''}
          </div>
        </div>`;
      }).join('')}
      ${univStats.length>20?`<div style="text-align:center;color:var(--text3);font-size:var(--fs-sm);margin-top:8px;padding-top:6px;border-top:1px solid var(--border2)">외 ${univStats.length-20}개 대학</div>`:''}
    </div>
  </div>`;

  return h;
}
/* ══════════════════════════════════════
   🌡️ 히트맵 뷰 v2 — 승률 모드 + 정렬 버튼
══════════════════════════════════════ */
window._b2HeatmapMode = window._b2HeatmapMode || 'count';
window._b2HeatmapSortRow = window._b2HeatmapSortRow || 'name';
window._b2HeatmapSortCol = window._b2HeatmapSortCol || 'tier';

