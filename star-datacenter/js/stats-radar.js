/* ══════════════════════════════════════════════════════════════
   통계 - 대학 레이더 비교 (stats-overview-elo.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _radarBaseScore(){
  return {winrate:0,avgElo:1200,pts:0,activity:0,diversity:0,streak:0,w:0,l:0,tot:0,mem:0};
}
function _statsSideNames(side){
  if(Array.isArray(side)){
    return side.map(x => {
      if(x && typeof x === 'object') return String(x.name || '').trim();
      return String(x || '').trim();
    }).filter(Boolean);
  }
  return String(side || '').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
}
function _statsGameSides(g){
  if(!g || !g.winner) return null;
  const aList = (Array.isArray(g.teamA) && g.teamA.length) ? _statsSideNames(g.teamA) : ((g.a1 || g.a2) ? [g.a1, g.a2].filter(Boolean) : _statsSideNames(g.playerA));
  const bList = (Array.isArray(g.teamB) && g.teamB.length) ? _statsSideNames(g.teamB) : ((g.b1 || g.b2) ? [g.b1, g.b2].filter(Boolean) : _statsSideNames(g.playerB));
  if(!aList.length || !bList.length) return null;
  return { a:aList, b:bList, winner:String(g.winner || '') };
}
function _statsSideUnivs(names){
  const set = new Set();
  (names || []).forEach(name => {
    const p = statsP(name);
    const u = String(p?.univ || '').trim();
    if(u) set.add(u);
  });
  return [...set];
}
function getSortedRadarRows(){
  const _players = Array.isArray(players) ? players : [];
  const univs=getAllUnivs().filter(u=>_players.some(p=>p.univ===u.name));
  const _allScores=getStatsRadarScores();
  const rows=univs.map(u=>({u, scores:_allScores[u.name] || _radarBaseScore()}));
  const sorter = String(_radarSort||'winrate');
  rows.sort((a,b)=>{
    if(sorter==='name') return String(a.u?.name||'').localeCompare(String(b.u?.name||''),'ko');
    if(sorter==='activity') return (b.scores.activity-a.scores.activity)||(b.scores.winrate-a.scores.winrate)||(b.scores.tot-a.scores.tot);
    if(sorter==='elo') return (b.scores.avgElo-a.scores.avgElo)||(b.scores.winrate-a.scores.winrate)||(b.scores.tot-a.scores.tot);
    return (b.scores.winrate-a.scores.winrate)||(b.scores.tot-a.scores.tot)||(b.scores.avgElo-a.scores.avgElo);
  });
  return {rows, scoreMap:_allScores};
}
window.toggleRadarCompareUniv = window.toggleRadarCompareUniv || function(name){
  try{
    const key = String(name||'').trim();
    if(!key) return;
    const arr = Array.isArray(window._radarCompareUnivs) ? [...window._radarCompareUnivs] : [];
    const idx = arr.indexOf(key);
    if(idx >= 0) arr.splice(idx,1);
    else{
      if(arr.length >= 4) arr.shift();
      arr.push(key);
    }
    window._radarCompareUnivs = arr.filter(v=>v && v!==window._radarSelUniv);
    render();
  }catch(e){}
};
function getStatsRadarSourceMatches(){
  const _mini = Array.isArray(window.miniM) ? window.miniM : [];
  const _univm = Array.isArray(window.univM) ? window.univM : [];
  const _ck = Array.isArray(window.ckM) ? window.ckM : [];
  const _comps = Array.isArray(window.comps) ? window.comps : [];
  const _tour = (typeof getTourneyMatches === 'function') ? getTourneyMatches() : [];
  return statsFilterMatches([].concat(_mini, _univm, _ck, _comps, _tour));
}
function getStatsRadarScores(){
  const _players = Array.isArray(players) ? players : [];
  const univNames = [...new Set(_players.map(p=>String(p?.univ||'').trim()).filter(Boolean))];
  const scoreMap = {};
  const memberSets = {};
  // 대학별 소속 선수를 1회 순회로 그룹핑 (기존: 대학 수 × 전체 선수 수 만큼 filter 반복)
  const _membersByUniv = {};
  _players.forEach(p=>{
    const nm = String(p?.univ||'').trim();
    if(!nm) return;
    (_membersByUniv[nm] || (_membersByUniv[nm]=[])).push(p);
  });
  univNames.forEach(name=>{
    const mem=_membersByUniv[name] || [];
    const avgElo=Math.round(mem.reduce((s,p)=>s+(p.elo||1200),0)/Math.max(1, mem.length));
    const pts=mem.reduce((s,p)=>s+(p.points||0),0);
    const races=new Set(mem.map(p=>p.race).filter(Boolean)).size;
    memberSets[name] = new Set();
    let maxS=0;
    mem.forEach(p=>{
      let cs=0, lt='';
      const hist=[...statsNonProHist(p)].sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')));
      for(const h of hist){
        if(h.result===lt || lt===''){ cs++; lt=h.result; }
        else { cs=1; lt=h.result; }
        if(lt==='승') maxS=Math.max(maxS, cs);
      }
    });
    // 활동도: statsNonProHist 기반 전역 날짜 필터가 적용된 게임 참여 수 (30일 하드코딩 제거)
    const actCount = mem.reduce((s,p) => s + (statsNonProHist(p)||[]).length, 0);
    scoreMap[name]={winrate:0,avgElo,pts,activity:actCount,diversity:races,streak:maxS,w:0,l:0,tot:0,mem:mem.length};
  });
  getStatsRadarSourceMatches().forEach(m=>{
    const md = String(m?.d || m?.date || '');
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        const sides = _statsGameSides(g);
        if(!sides) return;
        sides.a.forEach(name => {
          const pA = statsP(name);
          const ua = String(pA?.univ || '').trim();
          if(ua && scoreMap[ua]){
            memberSets[ua] && memberSets[ua].add(String(name).trim());
            if(sides.winner === 'A') scoreMap[ua].w++; else scoreMap[ua].l++;
            scoreMap[ua].tot++;
          }
        });
        sides.b.forEach(name => {
          const pB = statsP(name);
          const ub = String(pB?.univ || '').trim();
          if(ub && scoreMap[ub]){
            memberSets[ub] && memberSets[ub].add(String(name).trim());
            if(sides.winner === 'B') scoreMap[ub].w++; else scoreMap[ub].l++;
            scoreMap[ub].tot++;
          }
        });
      });
    });
  });
  Object.values(scoreMap).forEach(s=>{
    s.winrate = s.tot ? Math.round(s.w / s.tot * 100) : 0;
  });
  Object.keys(scoreMap).forEach(name=>{
    scoreMap[name].mem = memberSets[name] ? memberSets[name].size : 0;
  });
  return scoreMap;
}
function getStatsUnivHeadToHead(nameA, nameB){
  const a = String(nameA || '').trim();
  const b = String(nameB || '').trim();
  const res = { aWins:0, bWins:0, total:0 };
  if(!a || !b || a === b) return res;
  getStatsRadarSourceMatches().forEach(m=>{
    (m.sets || []).forEach(set=>{
      (set.games || []).forEach(g=>{
        const sides = _statsGameSides(g);
        if(!sides) return;
        const uA = _statsSideUnivs(sides.a);
        const uB = _statsSideUnivs(sides.b);
        if(uA.length === 1 && uB.length === 1 && uA[0] === a && uB[0] === b){
          res.total++;
          if(sides.winner === 'A') res.aWins++;
          else if(sides.winner === 'B') res.bWins++;
        }else if(uA.length === 1 && uB.length === 1 && uA[0] === b && uB[0] === a){
          res.total++;
          if(sides.winner === 'A') res.bWins++;
          else if(sides.winner === 'B') res.aWins++;
        }
      });
    });
  });
  return res;
}
/* ──────────────────────────────────────────────────────────────
   대학 강점/약점 분석 (레이더 차트를 보조하는 텍스트·막대 기반 인사이트)
   - 레이더는 여러 지표를 한 번에 겹쳐 보여주지만, "그래서 이 대학의
     강점/약점이 뭔데?"를 바로 읽어내긴 어렵다는 피드백을 반영.
   - 지표별로 전체 대학 대비 순위/백분위를 계산해 상위권은 강점,
     하위권은 약점으로 분류하고, 막대 + 한 줄 요약으로 보여준다.
   ────────────────────────────────────────────────────────────── */
function _univInsightMetricDefs(){
  return [
    {key:'winrate',  label:'승률',        icon:'🏆', suffix:'%'},
    {key:'avgElo',   label:'평균 ELO',    icon:'📈', suffix:''},
    {key:'activity', label:'활동도',      icon:'🔥', suffix:'경기'},
    {key:'pts',      label:'포인트',      icon:'💠', suffix:'점'},
    {key:'diversity',label:'종족 다양성', icon:'🎮', suffix:'종족'},
    {key:'streak',   label:'최고 연승',   icon:'⚡', suffix:'연승'},
    {key:'mem',      label:'집계 선수 수', icon:'👥', suffix:'명'},
  ];
}
function _univInsightCompute(selName, scores, rows){
  const total = rows.length;
  const defs = _univInsightMetricDefs();
  return defs.map(d=>{
    const values = rows.map(r=>Number(r.scores[d.key])||0);
    const val = Number(scores?.[d.key])||0;
    const min = Math.min(...values), max = Math.max(...values);
    const avgRaw = values.reduce((s,v)=>s+v,0)/Math.max(1,values.length);
    const avg = Math.round(avgRaw*10)/10;
    const sorted = values.slice().sort((a,b)=>b-a);
    const rank = sorted.filter(v=>v>val).length + 1;
    const pct = total>0 ? Math.round(rank/total*100) : 50;
    const delta = Math.round((val-avg)*10)/10;
    return {...d, val, min, max, avg, rank, total, pct, delta, hasSpread: max>min};
  });
}
function _univInsightBarRow(m, tone){
  const barColor = tone==='up' ? '#16a34a' : (tone==='down' ? '#dc2626' : '#64748b');
  const pos = m.hasSpread ? Math.round((m.val-m.min)/(m.max-m.min)*100) : 50;
  const avgPos = m.hasSpread ? Math.round((m.avg-m.min)/(m.max-m.min)*100) : 50;
  const rankTxt = tone==='down' ? `${m.total}개교 중 ${m.rank}위 (하위 ${Math.max(1,101-m.pct)}%)` : (tone==='up' ? `${m.total}개교 중 ${m.rank}위 (상위 ${Math.max(1,m.pct)}%)` : `${m.total}개교 중 ${m.rank}위 (중위권)`);
  const deltaTxt = m.delta===0 ? '리그 평균과 동일' : `리그 평균 대비 ${m.delta>0?'+':''}${m.delta}${m.suffix}`;
  return `<div class="univ-insight-row">
    <div class="univ-insight-row-top">
      <span class="univ-insight-row-label"><span class="univ-insight-icon">${m.icon}</span>${escHTML(m.label)}</span>
      <span class="univ-insight-row-value" style="color:${barColor}">${m.val}${m.suffix}</span>
    </div>
    <div class="univ-insight-bar-track">
      <div class="univ-insight-bar-fill" style="width:${Math.max(3,Math.min(100,pos))}%;background:${barColor}"></div>
      <div class="univ-insight-bar-avg" style="left:${Math.max(0,Math.min(100,avgPos))}%" title="리그 평균 ${m.avg}${m.suffix}"></div>
    </div>
    <div class="univ-insight-row-sub">${rankTxt}</div>
    <div class="univ-insight-row-sub2">${deltaTxt} (평균 ${m.avg}${m.suffix})</div>
  </div>`;
}
function univStrengthWeaknessHTML(selName, scores, allScores, rows){
  const total = Array.isArray(rows) ? rows.length : 0;
  if(!selName || total<2){
    return `<div class="ssec"><div class="stats-note-box">🔎 강점/약점 분석은 활동 중인 대학이 2곳 이상일 때 볼 수 있습니다.</div></div>`;
  }
  const metrics = _univInsightCompute(selName, scores, rows);
  const spread = metrics.filter(m=>m.hasSpread);
  const flat = metrics.filter(m=>!m.hasSpread);
  const strengths = spread.filter(m=>m.pct<=34).sort((a,b)=>a.pct-b.pct);
  const weaknesses = spread.filter(m=>m.pct>=67).sort((a,b)=>b.pct-a.pct);
  const strengthKeys = new Set(strengths.map(m=>m.key));
  const weaknessKeys = new Set(weaknesses.map(m=>m.key));
  const neutral = spread.filter(m=>!strengthKeys.has(m.key) && !weaknessKeys.has(m.key)).sort((a,b)=>a.pct-b.pct).concat(flat);
  // 하나도 강점/약점이 없으면(전 지표가 중위권) 가장 좋은/나쁜 1개씩을 참고용으로 보여준다
  const fallbackSorted = spread.slice().sort((a,b)=>a.pct-b.pct);
  const strengthsShow = strengths.length ? strengths : fallbackSorted.slice(0,1);
  const strengthsShowKeys = new Set(strengthsShow.map(m=>m.key));
  const weaknessesShow = (weaknesses.length ? weaknesses : fallbackSorted.slice(-1)).filter(m=>!strengthsShowKeys.has(m.key));
  const weaknessesShowKeys = new Set(weaknessesShow.map(m=>m.key));
  const neutralShow = neutral.filter(m=>!strengthsShowKeys.has(m.key) && !weaknessesShowKeys.has(m.key));
  const _lbls = arr => arr.map(m=>m.label).join(', ');
  let summary;
  if(strengths.length && weaknesses.length){
    summary = `<b>${escHTML(selName)}</b>은(는) <b style="color:#16a34a">${escHTML(_lbls(strengths))}</b> 지표에서 ${strengths.length}개교 중 상위권으로 강세를 보이지만, <b style="color:#dc2626">${escHTML(_lbls(weaknesses))}</b> 쪽은 다른 대학 대비 하위권으로 아쉬운 편입니다.`;
  } else if(strengths.length){
    summary = `<b>${escHTML(selName)}</b>은(는) <b style="color:#16a34a">${escHTML(_lbls(strengths))}</b> 지표에서 뚜렷한 강세를 보이며, 특별한 약점은 드러나지 않습니다.`;
  } else if(weaknesses.length){
    summary = `<b>${escHTML(selName)}</b>은(는) <b style="color:#dc2626">${escHTML(_lbls(weaknesses))}</b> 쪽에서 다른 대학 대비 개선 여지가 있습니다.`;
  } else {
    summary = `<b>${escHTML(selName)}</b>은(는) 현재 데이터 기준으로 지표 간 편차가 크지 않은, 고르게 균형 잡힌 대학입니다.`;
  }
  return `<div class="ssec">
    <h4 style="margin-bottom:4px">🧭 ${escHTML(selName)} 강점 &amp; 약점 정밀 분석 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(활동 중인 ${total}개 대학 순위 기준)</span></h4>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:12px">지표 7개(승률·ELO·활동도·포인트·종족 다양성·최고 연승·선수 수) 각각을 전체 대학과 비교해 상위 34%는 강점, 하위 34%는 약점, 나머지는 중위권으로 분류합니다.</div>
    <div class="univ-insight-summary">💬 ${summary}</div>
    <div class="univ-insight-grid univ-insight-grid--3">
      <div class="univ-insight-col univ-insight-col--up">
        <div class="univ-insight-col-title univ-insight-col-title--up">💪 강점 <span class="univ-insight-col-count">${strengthsShow.length}개</span></div>
        ${strengthsShow.length ? strengthsShow.map(m=>_univInsightBarRow(m,'up')).join('') : `<div class="univ-insight-empty">뚜렷한 강점 지표가 없습니다</div>`}
      </div>
      <div class="univ-insight-col univ-insight-col--neutral">
        <div class="univ-insight-col-title univ-insight-col-title--neutral">🟰 중위권 <span class="univ-insight-col-count">${neutralShow.length}개</span></div>
        ${neutralShow.length ? neutralShow.map(m=>_univInsightBarRow(m,'flat')).join('') : `<div class="univ-insight-empty">모든 지표가 강점/약점으로 뚜렷합니다</div>`}
      </div>
      <div class="univ-insight-col univ-insight-col--down">
        <div class="univ-insight-col-title univ-insight-col-title--down">⚠️ 약점 <span class="univ-insight-col-count">${weaknessesShow.length}개</span></div>
        ${weaknessesShow.length ? weaknessesShow.map(m=>_univInsightBarRow(m,'down')).join('') : `<div class="univ-insight-empty">뚜렷한 약점 지표가 없습니다</div>`}
      </div>
    </div>
  </div>`;
}
/* ──────────────────────────────────────────────────────────────
   소속 스트리머(선수) 로스터 — 선택 대학 소속 선수들을 티어/승률과
   함께 한눈에 보여준다. (svc-roster-*는 stats-univ-compare.js에서
   런타임에 주입되는 스타일이라 독립적으로 동작하도록 별도 클래스 사용)
   ────────────────────────────────────────────────────────────── */
function _univRosterCard(p, col){
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const w = Number(p.win||0), l = Number(p.loss||0), tot = w+l;
  const wr = tot>0 ? Math.round(w/tot*100) : null;
  const tCol = p.tier && typeof getTierBtnColor==='function' ? getTierBtnColor(p.tier) : col;
  const tTxt = p.tier && typeof getTierBtnTextColor==='function' ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
  return `<div class="univ-roster-card" style="--accent:${col}" onclick="openPlayerModal('${safeName}')">
    <div class="univ-roster-avatar" style="background:${col}">${typeof getPlayerPhotoHTML==='function'?getPlayerPhotoHTML(p.name,46,'width:100%;height:100%'):escHTML((p.name||'?').slice(0,1))}</div>
    <div class="univ-roster-info">
      <div class="univ-roster-name" style="${p.inactive?'opacity:.55':''}">${escHTML(p.name||'')}${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:9px;margin-left:4px">${p.race}</span>`:''}</div>
      <div class="univ-roster-meta">
        ${p.tier?`<span class="univ-roster-tier" style="background:${tCol};color:${tTxt}">${escHTML(p.tier)}</span>`:(p.role?`<span class="univ-roster-role">${escHTML(p.role)}</span>`:'')}
        ${wr!==null?`<span class="univ-roster-wr" style="color:${wr>=50?'#16a34a':'#dc2626'}">${w}승 ${l}패 (${wr}%)</span>`:`<span class="univ-roster-wr" style="color:var(--gray-l)">전적 없음</span>`}
      </div>
    </div>
  </div>`;
}
function univRosterSectionHTML(selName, accentColor){
  const _players = Array.isArray(players) ? players : [];
  const members = _players.filter(p=>String(p?.univ||'').trim()===selName && !p.hidden && !p.hideFromBoard);
  if(!selName){
    return '';
  }
  const q = String(window._radarRosterQ||'').trim().toLowerCase();
  const filtered = q ? members.filter(p=>String(p.name||'').toLowerCase().includes(q)) : members;
  const ti = typeof TIERS!=='undefined'?TIERS:[];
  const sorted = filtered.slice().sort((a,b)=>{
    const ia=ti.indexOf(a.tier||''), ib=ti.indexOf(b.tier||'');
    return (ia>=0?ia:999)-(ib>=0?ib:999) || (Number(b.win||0)-Number(b.loss||0))-(Number(a.win||0)-Number(a.loss||0));
  });
  const activeCount = members.filter(p=>!p.retired && !p.inactive).length;
  return `<div class="ssec">
    <h4 style="margin-bottom:4px">👥 ${escHTML(selName)} 소속 스트리머 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(총 ${members.length}명 · 활동중 ${activeCount}명)</span></h4>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">티어·전적 순으로 정렬됩니다. 이름을 클릭하면 선수 상세 정보를 볼 수 있어요.</div>
    <div class="stats-table-card">
      <input type="text" class="stats-search-field" style="width:100%;margin-bottom:10px;box-sizing:border-box" placeholder="🔍 소속 선수 이름으로 검색..." value="${escHTML(window._radarRosterQ||'')}" oninput="window._radarRosterQ=this.value;clearTimeout(window._radarRosterQT);window._radarRosterQT=setTimeout(render,180)">
      ${sorted.length ? `<div class="univ-roster-grid">${sorted.map(p=>_univRosterCard(p, accentColor)).join('')}</div>` : `<div class="univ-insight-empty">${q?'검색 결과가 없습니다':'소속 선수가 없습니다'}</div>`}
    </div>
  </div>`;
}
/* ──────────────────────────────────────────────────────────────
   선택 대학 vs 전체 대학 맞대결 기록 — 실제 경기 데이터를 바탕으로
   선택 대학이 각 상대 대학에게 몇 승 몇 패를 거뒀는지 정리.
   ────────────────────────────────────────────────────────────── */
// [UI개선] 공용 바 트랙 마크업 — 항상 50% 지점에 기준선을 두고, 채움 막대는 그 기준선에서
// 실제 값 쪽으로 뻗어나간다. 값이 50%보다 낮으면 왼쪽으로, 높으면 오른쪽으로 자라기 때문에
// 40~60% 사이처럼 값이 몰려있어도 막대 길이 차이가 한눈에 들어온다.
function _h2hBarTrackHTML(pct, color){
  // [UI개선 v4] 중앙 발산형 막대 대신, 왼쪽부터 승률만큼 채워지는 그라데이션 필 바로 변경.
  // 50% 기준선은 얇은 점선으로 유지해 "평균보다 위/아래"를 계속 가늠할 수 있게 함.
  const p = Math.max(0, Math.min(100, Number(pct)||0));
  const isHex = /^#[0-9a-fA-F]{6}$/.test(String(color||''));
  const grad = isHex ? `linear-gradient(90deg,${color}99,${color})` : color;
  return `<div class="univ-h2h-bar-track">
    <div class="univ-h2h-bar-refline"></div>
    <div class="univ-h2h-bar-fill" style="width:${Math.max(p>0?4:0,p)}%;background:${grad}"></div>
  </div>`;
}
function univHeadToHeadAllHTML(selName, rows, accentColor){
  if(!selName || !Array.isArray(rows) || rows.length<2) return '';
  const others = rows.map(r=>r.u).filter(u=>u.name!==selName);
  const records = others.map(u=>{
    const h2h = getStatsUnivHeadToHead(selName, u.name);
    const wr = h2h.total>0 ? Math.round(h2h.aWins/h2h.total*100) : null;
    return {name:u.name, col:u.color||gc(u.name), aWins:h2h.aWins, bWins:h2h.bWins, total:h2h.total, wr};
  });
  const played = records.filter(r=>r.total>0).sort((a,b)=>(b.wr??-1)-(a.wr??-1) || b.total-a.total);
  const unplayed = records.filter(r=>r.total===0);
  const totalW = played.reduce((s,r)=>s+r.aWins,0), totalL = played.reduce((s,r)=>s+r.bWins,0);
  const totalG = totalW+totalL;
  const totalWr = totalG>0 ? Math.round(totalW/totalG*100) : null;
  // [UI개선] 승/패 텍스트 한 줄 대신, 통산 성적을 한눈에 보여주는 요약 스탯 스트립 +
  // 각 행에 순위 번호와 결과 톤(승세/균형/열세)에 따른 은은한 배경색을 추가.
  const _toneOf = wr => wr===null ? 'flat' : (wr>=60?'up':(wr<=40?'down':'flat'));
  const _toneBg = { up:'linear-gradient(90deg,rgba(22,163,74,.09),rgba(255,255,255,0))', down:'linear-gradient(90deg,rgba(220,38,38,.08),rgba(255,255,255,0))', flat:'' };
  const summaryHTML = totalG>0 ? `<div class="univ-h2h-summary">
      <div class="univ-h2h-summary-ring" style="--wr:${totalWr};--tone:${totalWr>=50?'#16a34a':'#dc2626'}">
        <span>${totalWr}%</span>
      </div>
      <div class="univ-h2h-summary-stats">
        <div class="univ-h2h-summary-stat"><b style="color:#16a34a">${totalW}</b><span>승</span></div>
        <div class="univ-h2h-summary-stat"><b style="color:#dc2626">${totalL}</b><span>패</span></div>
        <div class="univ-h2h-summary-stat"><b>${totalG}</b><span>총 맞대결</span></div>
        <div class="univ-h2h-summary-stat"><b>${played.length}</b><span>상대 대학</span></div>
      </div>
    </div>` : '';
  return `<div class="ssec">
    <h4 style="margin-bottom:4px">⚔️ ${escHTML(selName)} vs 전체 대학 맞대결 기록</h4>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">실제 경기 기록(개인전·팀전·대회 포함)을 바탕으로, 상대 대학별 승패를 정리했습니다.</div>
    ${summaryHTML}
    ${played.length ? `<div class="univ-h2h-list">
      ${played.map((r,idx)=>{
        const pct = r.total>0 ? Math.round(r.aWins/r.total*100) : 50;
        const lowSample = r.total<=1;
        const tone = _toneOf(r.wr);
        return `<div class="univ-h2h-row${lowSample?' low-sample':''}" style="background:${_toneBg[tone]||''}" onclick="_radarSelUniv='${escJS(r.name)}';render()" title="클릭하면 이 대학의 정보로 이동">
          <span class="univ-h2h-rank">${idx+1}</span>
          <span class="ubadge" style="background:${r.col};flex-shrink:0">${escHTML(r.name)}</span>
          ${_h2hBarTrackHTML(pct, pct>=50?'#16a34a':'#dc2626')}
          <span class="univ-h2h-record">${r.aWins}승 ${r.bWins}패${lowSample?'<span class="univ-h2h-tag">표본 적음</span>':''}</span>
          <span class="univ-h2h-wr" style="color:${r.wr>=50?'#16a34a':'#dc2626'}">${r.wr}%</span>
        </div>`;
      }).join('')}
    </div>` : `<div class="univ-insight-empty">아직 다른 대학과의 맞대결 기록이 없습니다</div>`}
    ${unplayed.length ? `<div class="univ-h2h-unplayed">🚫 맞대결 기록 없음: ${unplayed.map(r=>escHTML(r.name)).join(', ')}</div>` : ''}
  </div>`;
}
function _resolveGameTier(names){
  const tiers = (names||[]).map(n=>{ const p=statsP(n); return (p && p.tier) ? p.tier : null; }).filter(Boolean);
  if(!tiers.length) return '미정';
  const uniq = [...new Set(tiers)];
  if(uniq.length===1) return uniq[0];
  const order = typeof TIERS!=='undefined' ? TIERS : [];
  return uniq.sort((a,b)=>order.indexOf(a)-order.indexOf(b)).join('/');
}
function getStatsUnivHeadToHeadByTier(nameA, nameB){
  const a = String(nameA || '').trim();
  const b = String(nameB || '').trim();
  const tierMap = {};
  if(!a || !b || a === b) return tierMap;
  const ensure = t => tierMap[t] || (tierMap[t] = {tier:t, aWins:0, bWins:0, total:0});
  getStatsRadarSourceMatches().forEach(m=>{
    (m.sets || []).forEach(set=>{
      (set.games || []).forEach(g=>{
        const sides = _statsGameSides(g);
        if(!sides) return;
        const uA = _statsSideUnivs(sides.a);
        const uB = _statsSideUnivs(sides.b);
        let aNames=null, bNames=null, aIsFirst=null;
        if(uA.length===1 && uB.length===1 && uA[0]===a && uB[0]===b){ aNames=sides.a; bNames=sides.b; aIsFirst=true; }
        else if(uA.length===1 && uB.length===1 && uA[0]===b && uB[0]===a){ aNames=sides.b; bNames=sides.a; aIsFirst=false; }
        else return;
        const tier = _resolveGameTier(aNames.concat(bNames));
        const row = ensure(tier);
        row.total++;
        const aWon = aIsFirst ? sides.winner==='A' : sides.winner==='B';
        if(aWon) row.aWins++; else row.bWins++;
      });
    });
  });
  return tierMap;
}
function getStatsUnivTierRecord(selName){
  const name = String(selName || '').trim();
  const tierMap = {};
  if(!name) return tierMap;
  const ensure = t => tierMap[t] || (tierMap[t] = {tier:t, w:0, l:0, tot:0});
  getStatsRadarSourceMatches().forEach(m=>{
    (m.sets || []).forEach(set=>{
      (set.games || []).forEach(g=>{
        const sides = _statsGameSides(g);
        if(!sides) return;
        const uA = _statsSideUnivs(sides.a);
        const uB = _statsSideUnivs(sides.b);
        const processSide = (names, universities, isWin)=>{
          if(universities.length!==1 || universities[0]!==name) return;
          const tier = _resolveGameTier(names);
          const row = ensure(tier);
          row.tot++;
          if(isWin) row.w++; else row.l++;
        };
        processSide(sides.a, uA, sides.winner==='A');
        processSide(sides.b, uB, sides.winner==='B');
      });
    });
  });
  return tierMap;
}
function getStatsUnivRecentForm(univName, n=20){
  const name = String(univName || '').trim();
  if(!name) return null;
  const games = [];
  getStatsRadarSourceMatches().forEach(m=>{
    const md = String(m?.d || m?.date || '');
    (m.sets || []).forEach(set=>{
      (set.games || []).forEach(g=>{
        const sides = _statsGameSides(g);
        if(!sides) return;
        const uA = _statsSideUnivs(sides.a);
        const uB = _statsSideUnivs(sides.b);
        if(uA.length===1 && uA[0]===name) games.push({date:md, win: sides.winner==='A'});
        else if(uB.length===1 && uB[0]===name) games.push({date:md, win: sides.winner==='B'});
      });
    });
  });
  if(!games.length) return null;
  games.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const recent = games.slice(0, n);
  const wins = recent.filter(g=>g.win).length;
  return {n:recent.length, wr: Math.round(wins/recent.length*100)};
}
function getAllUnivTierRecords(rows){
  const map = {};
  (rows || []).forEach(r=>{ map[r.u.name] = getStatsUnivTierRecord(r.u.name); });
  return map;
}
function _univTierOrder(tierKeys){
  const known = (typeof TIERS!=='undefined' ? TIERS : []).filter(t=>tierKeys.includes(t));
  const rest = tierKeys.filter(t=>typeof TIERS==='undefined' || !TIERS.includes(t));
  return known.concat(rest);
}
function univTierRecordHTML(selName, accentColor){
  if(!selName) return '';
  const tierMap = getStatsUnivTierRecord(selName);
  const tierKeys = Object.keys(tierMap);
  if(!tierKeys.length){
    return `<div class="ssec"><h4 style="margin-bottom:4px">🎯 ${escHTML(selName)} 티어별 대결 기록</h4><div class="univ-insight-empty">아직 집계된 경기 기록이 없습니다</div></div>`;
  }
  const order = _univTierOrder(tierKeys);
  const bestTier = order.slice().filter(t=>tierMap[t].tot>0).sort((a,b)=>{
    const wa = tierMap[a].tot? tierMap[a].w/tierMap[a].tot : 0;
    const wb = tierMap[b].tot? tierMap[b].w/tierMap[b].tot : 0;
    return wb-wa;
  })[0];
  const rowsHtml = order.map(t=>{
    const r = tierMap[t];
    const wr = r.tot>0 ? Math.round(r.w/r.tot*100) : 0;
    const lowSample = r.tot<=2;
    const tone = wr>=60?'up':(wr<=40?'down':'flat');
    const toneBg = tone==='up' ? 'linear-gradient(90deg,rgba(22,163,74,.09),rgba(255,255,255,0))' : (tone==='down' ? 'linear-gradient(90deg,rgba(220,38,38,.08),rgba(255,255,255,0))' : '');
    return `<div class="univ-h2h-row${lowSample?' low-sample':''}" style="cursor:default;background:${toneBg}">
      <span class="univ-h2h-rank univ-h2h-rank--tier" style="background:${accentColor}18;color:${accentColor}">${t===bestTier?'👑':'🎯'}</span>
      <span class="ubadge" style="background:${accentColor};flex-shrink:0">${escHTML(t)}</span>
      ${_h2hBarTrackHTML(wr, wr>=50?'#16a34a':'#dc2626')}
      <span class="univ-h2h-record">${r.w}승 ${r.l}패${lowSample?'<span class="univ-h2h-tag">표본 적음</span>':''}</span>
      <span class="univ-h2h-wr" style="color:${wr>=50?'#16a34a':'#dc2626'}">${wr}%</span>
    </div>`;
  }).join('');
  return `<div class="ssec">
    <h4 style="margin-bottom:4px">🎯 ${escHTML(selName)} 티어별 대결 기록</h4>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">소속 선수의 현재 티어를 기준으로, 각 티어에서 치른 경기의 승패를 집계했습니다. 👑는 이 대학의 최고 승률 티어입니다.</div>
    <div class="univ-h2h-list">${rowsHtml}</div>
  </div>`;
}
function predictUnivMatchup(selScores, oppScores, h2h, selForm, oppForm){
  const eloA = selScores.avgElo || 1200, eloB = oppScores.avgElo || 1200;
  const eloProb = 1/(1+Math.pow(10,(eloB-eloA)/400));
  const wrA = selScores.winrate || 0, wrB = oppScores.winrate || 0;
  let wrProb = 0.5;
  if(wrA || wrB) wrProb = Math.max(0, Math.min(1, wrA/((wrA+wrB) || 1)));
  const h2hProb = (h2h && h2h.total>0) ? h2h.aWins/h2h.total : null;
  let formProb = null;
  if(selForm && oppForm && (selForm.wr || oppForm.wr)){
    formProb = Math.max(0, Math.min(1, selForm.wr/((selForm.wr+oppForm.wr) || 1)));
  }
  const comps = [ {p:eloProb, w:0.35}, {p:wrProb, w:0.2} ];
  if(formProb!==null) comps.push({p:formProb, w:0.15});
  let h2hW = 0;
  if(h2hProb!==null){
    h2hW = h2h.total>=5 ? 0.45 : (h2h.total>=2 ? 0.3 : 0.15);
    comps.push({p:h2hProb, w:h2hW});
  }
  const totalW = comps.reduce((s,c)=>s+c.w,0);
  let prob = comps.reduce((s,c)=>s+c.p*c.w,0)/totalW;
  prob = Math.max(0.05, Math.min(0.95, prob));
  const formSample = Math.min(selForm ? selForm.n : 0, oppForm ? oppForm.n : 0);
  const h2hTotal = h2h ? h2h.total : 0;
  let confidence = '낮음';
  if(h2hTotal>=8 || (h2hTotal>=3 && formSample>=10)) confidence = '높음';
  else if(h2hTotal>=2 || formSample>=5) confidence = '보통';
  return {prob: Math.round(prob*100), h2hTotal, confidence};
}
function univMatchupPredictionHTML(selName, rows, allScores, accentColor){
  const total = Array.isArray(rows) ? rows.length : 0;
  if(!selName || total<2) return '';
  const selScores = allScores[selName] || _radarBaseScore();
  const selForm = getStatsUnivRecentForm(selName, 20);
  const others = rows.map(r=>r.u).filter(u=>u.name!==selName);
  const preds = others.map(u=>{
    const oppScores = allScores[u.name] || _radarBaseScore();
    const oppForm = getStatsUnivRecentForm(u.name, 20);
    const h2h = getStatsUnivHeadToHead(selName, u.name);
    const pred = predictUnivMatchup(selScores, oppScores, h2h, selForm, oppForm);
    return {name:u.name, col:u.color||gc(u.name), ...pred};
  }).sort((a,b)=>b.prob-a.prob);
  const favorable = preds.filter(p=>p.prob>=55);
  const tough = preds.filter(p=>p.prob<=45);
  const even = preds.filter(p=>p.prob>45 && p.prob<55);
  const _confColor = c => c==='높음' ? '#16a34a' : (c==='보통' ? '#d97706' : '#94a3b8');
  // [UI개선] 매 행마다 반복되던 긴 안내 문장("ELO·승률·최근 폼 기반 추정 (맞대결 기록 없음) ·
  // 신뢰도 보통")을 읽기 부담이 적은 짧은 칩 2개(근거·신뢰도)로 압축. 전체 계산 방식 설명은
  // 섹션 상단에 한 번만 안내하고, 행별로는 핵심 차이(근거/신뢰도)만 보여준다.
  const _predRow = p=>{
    const tone = p.prob>=55 ? '#16a34a' : (p.prob<=45 ? '#dc2626' : '#64748b');
    const basisChip = p.h2hTotal>0 ? `🗓️ 맞대결 ${p.h2hTotal}전` : `🔮 ELO·폼 추정`;
    const cc = _confColor(p.confidence);
    return `<div class="univ-h2h-row" onclick="_radarSelUniv='${escJS(p.name)}';render()" title="클릭하면 이 대학의 정보로 이동">
      <span class="ubadge" style="background:${p.col};flex-shrink:0">${escHTML(p.name)}</span>
      ${_h2hBarTrackHTML(p.prob, tone)}
      <span class="univ-h2h-wr" style="color:${tone};min-width:96px;text-align:right">예상승률 ${p.prob}%</span>
    </div>
    <div class="univ-pred-meta">
      <span class="univ-pred-chip">${basisChip}</span>
      <span class="univ-pred-chip" style="color:${cc}">● 신뢰도 ${p.confidence}</span>
    </div>`;
  };
  return `<div class="ssec">
    <h4 style="margin-bottom:4px">🔮 ${escHTML(selName)} 상대 대학별 승부 예측</h4>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:12px">맞대결 기록(있으면 최우선 반영), 평균 ELO 격차, 전체 승률 격차, 최근 20경기 폼을 종합해 예상 승률을 계산한 참고용 추정치입니다. 신뢰도는 맞대결·최근 경기 표본이 많을수록 높아집니다. 실제 결과와 다를 수 있습니다.</div>
    ${favorable.length ? `<div style="font-weight:900;font-size:12px;color:#16a34a;margin-bottom:4px">😎 유리한 상대 (${favorable.length})</div><div class="univ-h2h-list">${favorable.map(_predRow).join('')}</div>` : ''}
    ${even.length ? `<div style="font-weight:900;font-size:12px;color:#64748b;margin:10px 0 4px">🟰 백중세 (${even.length})</div><div class="univ-h2h-list">${even.map(_predRow).join('')}</div>` : ''}
    ${tough.length ? `<div style="font-weight:900;font-size:12px;color:#dc2626;margin:10px 0 4px">⚠️ 까다로운 상대 (${tough.length})</div><div class="univ-h2h-list">${tough.map(_predRow).join('')}</div>` : ''}
  </div>`;
}
function univTierInsightHTML(selName, rows){
  const total = Array.isArray(rows) ? rows.length : 0;
  if(!selName || total<2) return '';
  const MIN_SAMPLE = 3;
  const allRecords = getAllUnivTierRecords(rows);
  const selRecord = allRecords[selName] || {};
  const tierKeys = Object.keys(selRecord);
  const order = _univTierOrder(tierKeys);
  const analyzed = order.map(tier=>{
    const selRow = selRecord[tier];
    if(!selRow || selRow.tot<MIN_SAMPLE) return null;
    const others = [];
    Object.keys(allRecords).forEach(uname=>{
      const r = allRecords[uname][tier];
      if(r && r.tot>=MIN_SAMPLE) others.push({name:uname, wr:r.w/r.tot*100});
    });
    if(others.length<2) return null;
    others.sort((a,b)=>b.wr-a.wr);
    const rank = others.findIndex(o=>o.name===selName)+1;
    if(rank<=0) return null;
    const totalN = others.length;
    const pct = Math.round(rank/totalN*100);
    const wr = Math.round(selRow.w/selRow.tot*100);
    const tone = pct<=34 ? 'up' : (pct>=67 ? 'down' : 'flat');
    return {tier, wr, w:selRow.w, l:selRow.l, tot:selRow.tot, rank, totalN, pct, tone};
  }).filter(Boolean);
  if(!analyzed.length){
    return `<div class="ssec"><h4 style="margin-bottom:4px">🧭 ${escHTML(selName)} 티어별 강점 &amp; 약점 분석</h4><div class="univ-insight-empty">티어별 비교에 필요한 최소 표본(티어당 ${MIN_SAMPLE}경기 이상, 2개 대학 이상)이 아직 부족합니다</div></div>`;
  }
  const strengths = analyzed.filter(m=>m.tone==='up').sort((a,b)=>a.pct-b.pct);
  const weaknesses = analyzed.filter(m=>m.tone==='down').sort((a,b)=>b.pct-a.pct);
  const flat = analyzed.filter(m=>m.tone==='flat');
  const _row = m=>{
    const barColor = m.tone==='up' ? '#16a34a' : (m.tone==='down' ? '#dc2626' : '#64748b');
    const rankTxt = m.tone==='down' ? `${m.totalN}개교 중 ${m.rank}위 (하위권)` : (m.tone==='up' ? `${m.totalN}개교 중 ${m.rank}위 (상위권)` : `${m.totalN}개교 중 ${m.rank}위 (중위권)`);
    return `<div class="univ-insight-row">
      <div class="univ-insight-row-top">
        <span class="univ-insight-row-label"><span class="univ-insight-icon">🎯</span>${escHTML(m.tier)}</span>
        <span class="univ-insight-row-value" style="color:${barColor}">${m.w}승 ${m.l}패 (${m.wr}%)</span>
      </div>
      <div class="univ-h2h-bar-track">
        <div class="univ-h2h-bar-fill" style="width:${m.wr}%;background:${barColor}"></div>
      </div>
      <div class="univ-insight-row-sub">${rankTxt} · 이 티어 표본 ${m.tot}경기</div>
    </div>`;
  };
  return `<div class="ssec">
    <h4 style="margin-bottom:4px">🧭 ${escHTML(selName)} 티어별 강점 &amp; 약점 분석 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(티어당 최소 ${MIN_SAMPLE}경기 이상 대학끼리 비교)</span></h4>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:12px">각 티어에서의 승률을 그 티어에서 활동한 다른 대학들과 비교해 상위 34%는 강점, 하위 34%는 약점으로 분류합니다.</div>
    <div class="univ-insight-grid univ-insight-grid--3">
      <div class="univ-insight-col univ-insight-col--up">
        <div class="univ-insight-col-title univ-insight-col-title--up">💪 강한 티어 <span class="univ-insight-col-count">${strengths.length}개</span></div>
        ${strengths.length ? strengths.map(_row).join('') : `<div class="univ-insight-empty">뚜렷한 강점 티어가 없습니다</div>`}
      </div>
      <div class="univ-insight-col univ-insight-col--neutral">
        <div class="univ-insight-col-title univ-insight-col-title--neutral">🟰 중위권 티어 <span class="univ-insight-col-count">${flat.length}개</span></div>
        ${flat.length ? flat.map(_row).join('') : `<div class="univ-insight-empty">모든 티어가 강점/약점으로 뚜렷합니다</div>`}
      </div>
      <div class="univ-insight-col univ-insight-col--down">
        <div class="univ-insight-col-title univ-insight-col-title--down">⚠️ 약한 티어 <span class="univ-insight-col-count">${weaknesses.length}개</span></div>
        ${weaknesses.length ? weaknesses.map(_row).join('') : `<div class="univ-insight-empty">뚜렷한 약점 티어가 없습니다</div>`}
      </div>
    </div>
  </div>`;
}
// [FIX-RADAR-RANDOMDEFAULT] 정보탭 최초 진입 시 항상 1등 대학(예: 케이대)만 보이던 것을
// 접속(세션)마다 무작위 대학이 기본 선택되도록 변경. 한번 선택된 뒤에는 그 값을 그대로
// 유지(다른 render() 호출로 계속 바뀌지 않음)하며, 사용자가 셀렉트박스로 직접 바꾸면 그 값을 따른다.
function _pickRandomUnivName(list){
  try{
    if(!list || !list.length) return '';
    const idx = Math.floor(Math.random()*list.length);
    return list[idx].name;
  }catch(e){ return (list && list[0] && list[0].name) || ''; }
}
function _radarUnivLogoHTML(name, col){
  if(!name) return `<span style="font-size:26px">🏛️</span>`;
  const uCfg = (typeof univCfg!=='undefined'?univCfg:[]).find(u=>u && u.name===name);
  const iconUrl = (uCfg && (uCfg.icon || uCfg.img)) || (typeof UNIV_ICONS!=='undefined'?UNIV_ICONS[name]:'') || '';
  const src = iconUrl ? (typeof toHttpsUrl==='function'?toHttpsUrl(iconUrl):iconUrl) : '';
  return src ? `<img src="${src}" onerror="this.parentNode.innerHTML='🏛️'">` : `<span style="font-size:26px">🏛️</span>`;
}
function statsRadarHTML(){
  const _players = Array.isArray(players) ? players : [];
  const {rows:_rows, scoreMap:_allScores} = getSortedRadarRows();
  const univs=_rows.map(x=>x.u);
  if((!_radarSelUniv || !univs.some(u=>u.name===_radarSelUniv)) && univs.length) _radarSelUniv=_pickRandomUnivName(univs);
  const _selectedScores=_allScores[_radarSelUniv] || {tot:0,w:0,l:0};
  const _selectedColor = gc(_radarSelUniv);
  const _totalGames=_rows.reduce((sum,row)=>sum+(row.scores.tot||0),0);
  const _wrRank = _rows.slice().sort((a,b)=>(b.scores.winrate||0)-(a.scores.winrate||0)).findIndex(r=>r.u.name===_radarSelUniv)+1;
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="radar-hero" id="stats-radar-sec" style="--accent:${_selectedColor}">
    <div class="radar-hero-top">
      <div class="radar-hero-id">
        <div class="radar-hero-logo">${_radarUnivLogoHTML(_radarSelUniv,_selectedColor)}</div>
        <div style="min-width:0">
          <div class="radar-hero-eyebrow">🏛️ 대학 정보</div>
          <div class="radar-hero-name">${escHTML(_radarSelUniv||'대학')}</div>
        </div>
      </div>
      <div class="stats-chart-actions no-export" style="align-items:center">
        <select id="radar-sel" class="radar-hero-select" onchange="_radarSelUniv=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()">
          ${univs.map(u=>`<option value="${escHTML(u.name)}"${_radarSelUniv===u.name?' selected':''}>${escHTML(u.name)}</option>`).join('')}
        </select>
        <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-radar-sec','radar')">📷 이미지 저장</button>
      </div>
    </div>
    <div class="radar-hero-chips">
      <div class="radar-hero-chip"><b>${_selectedScores.w||0}<span style="color:#16a34a">승</span> ${_selectedScores.l||0}<span style="color:#dc2626">패</span></b><span>통산 전적</span></div>
      <div class="radar-hero-chip"><b>${_selectedScores.winrate||0}%</b><span>승률</span></div>
      <div class="radar-hero-chip"><b>${_selectedScores.avgElo||0}</b><span>평균 ELO</span></div>
      <div class="radar-hero-chip"><b>${_wrRank>0?_wrRank+' / '+_rows.length:'-'}</b><span>승률 순위</span></div>
      <div class="radar-hero-chip"><b>${_totalGames}</b><span>전체 집계 경기</span></div>
    </div>
  </div>
  ${univHeadToHeadAllHTML(_radarSelUniv, _rows, _selectedColor)}
  ${univTierRecordHTML(_radarSelUniv, _selectedColor)}
  ${univMatchupPredictionHTML(_radarSelUniv, _rows, _allScores, _selectedColor)}
  ${univStrengthWeaknessHTML(_radarSelUniv, _selectedScores, _allScores, _rows)}
  ${univTierInsightHTML(_radarSelUniv, _rows)}
  ${univRosterSectionHTML(_radarSelUniv, _selectedColor)}
  </div>`;
}
function calcUnivRadar(univName, proIds){
  const scores = getStatsRadarScores();
  return scores[univName] || {winrate:0,avgElo:1200,pts:0,activity:0,diversity:0,streak:0,w:0,l:0,tot:0,mem:0};
}
function initRadarChart(){
  const canvas=document.getElementById('radarChart');
  const info=document.getElementById('radarInfo');
  if(!canvas)return;
  // HTML entity decode fallback (특수문자 대학명 대응)
  try{const ta=document.createElement('textarea');ta.innerHTML=_radarSelUniv;_radarSelUniv=ta.value;}catch(e){}
  const _players = Array.isArray(players) ? players : [];
  const _univsWithPlayers = new Set(_players.map(p=>p.univ));
  const allUnivs=getAllUnivs().filter(u=>_univsWithPlayers.has(u.name));
  if((!_radarSelUniv || !allUnivs.some(u=>u.name===_radarSelUniv)) && allUnivs.length) _radarSelUniv = _pickRandomUnivName(allUnivs);
  const _allScores=getStatsRadarScores();
  const _activeNames = Array.from(new Set([_radarSelUniv, ...((Array.isArray(_radarCompareUnivs)?_radarCompareUnivs:[]).filter(name=>name && name!==_radarSelUniv))])).slice(0,5);
  const _activeRows = _activeNames.map(name=>({name, scores:_allScores[name]||calcUnivRadar(name), col:gc(name)}));
  const scores=_allScores[_radarSelUniv]||calcUnivRadar(_radarSelUniv);
  const _sv=Object.values(_allScores);
  const maxVals={
    winrate:100,
    avgElo:Math.max(..._sv.map(s=>s.avgElo),1500),
    activity:Math.max(..._sv.map(s=>s.activity),1),
    diversity:3,
    streak:Math.max(..._sv.map(s=>s.streak),1),
    mem:Math.max(..._sv.map(s=>s.mem),1),
  };
  const labels=['승률','ELO','활동도','다양성','연승','선수수'];
  const col=gc(_radarSelUniv);
  const W=280,H=280,cx=W/2,cy=H/2,r=100,sides=6;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const angle=i=>(-Math.PI/2)+(2*Math.PI/sides)*i;
  // 배경 그물
  [0.2,0.4,0.6,0.8,1.0].forEach(frac=>{
    ctx.beginPath();
    for(let i=0;i<sides;i++){
      const x=cx+r*frac*Math.cos(angle(i));
      const y=cy+r*frac*Math.sin(angle(i));
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;ctx.stroke();
    if(frac===1||frac===0.5){ctx.fillStyle='#94a3b8';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText(Math.round(frac*100)+'%',cx,cy-r*frac-3);}
  });
  // 축선
  for(let i=0;i<sides;i++){
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.lineTo(cx+r*Math.cos(angle(i)),cy+r*Math.sin(angle(i)));
    ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;ctx.stroke();
  }
  _activeRows.forEach((row, idx)=>{
    const vals=[
      row.scores.winrate/maxVals.winrate,
      row.scores.avgElo/maxVals.avgElo,
      Math.min(1,row.scores.activity/maxVals.activity),
      row.scores.diversity/maxVals.diversity,
      Math.min(1,row.scores.streak/maxVals.streak),
      row.scores.mem/maxVals.mem,
    ];
    ctx.beginPath();
    for(let i=0;i<sides;i++){
      const v=vals[i];
      const x=cx+r*v*Math.cos(angle(i));
      const y=cy+r*v*Math.sin(angle(i));
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle=row.col + (idx===0 ? '2e' : '16'); ctx.fill();
    ctx.strokeStyle=row.col; ctx.lineWidth=idx===0?2.8:1.8; ctx.stroke();
    for(let i=0;i<sides;i++){
      const v=vals[i];
      const x=cx+r*v*Math.cos(angle(i));
      const y=cy+r*v*Math.sin(angle(i));
      ctx.beginPath();ctx.arc(x,y,idx===0?4:3,0,Math.PI*2);
      ctx.fillStyle=row.col;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.stroke();
    }
  });
  // 레이블
  ctx.fillStyle='#374151';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
  for(let i=0;i<sides;i++){
    const x=cx+(r+18)*Math.cos(angle(i));
    const y=cy+(r+18)*Math.sin(angle(i));
    const va=Math.abs(Math.sin(angle(i)));
    ctx.textAlign=Math.cos(angle(i))>0.1?'left':Math.cos(angle(i))<-0.1?'right':'center';
    ctx.fillText(labels[i],x,y+va*5);
  }
  // 중앙 대학명
  ctx.fillStyle=col;ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  ctx.fillText(_radarSelUniv,cx,cy+4);
  if(info){
    info.innerHTML=`
      <div class="stats-info-stack">
        <div class="stats-legend-wrap">${_activeRows.map((row, idx)=>`<span class="stats-legend-chip" style="background:${row.col}14;border-color:${row.col}55;color:${row.col}"><span style="width:8px;height:8px;border-radius:50%;background:${row.col};display:inline-block"></span>${idx===0?'기준':'비교'} ${escHTML(row.name)}</span>`).join('')}</div>
        ${_activeRows.map((row, idx)=>`
        <div class="stats-detail-card" style="border-color:${idx===0?row.col+'55':'var(--border)'};background:${idx===0?row.col+'0d':'var(--white)'}">
          <div class="stats-detail-title" style="color:${row.col}">${escHTML(row.name)}</div>
          ${[
            ['집계 선수 수',row.scores.mem+'명'],
            ['승률',row.scores.winrate+'%'],
            ['평균 ELO',row.scores.avgElo],
            ['총 포인트',(row.scores.pts>=0?'+':'')+row.scores.pts],
            ['활동도 (경기 수)',row.scores.activity+'경기'],
            ['종족 다양성',row.scores.diversity+'종족'],
            ['최장 연승',row.scores.streak+'연승'],
            ['총 전적',`${row.scores.w}승 ${row.scores.l}패`],
          ].map(([k,v])=>`<div class="stats-detail-row">
            <span>${k}</span>
            <span>${v}</span>
          </div>`).join('')}
        </div>`).join('')}
      </div>`;
  }
  const sel=document.getElementById('radar-sel');
  if(sel)sel.value=_radarSelUniv;
}

/* ══════════════════════════════════════
   6-1. 대학비교 (구 현황판 ⚔️ 대학비교 뷰 이식)
   — 실전승률 + 직접대결 + 레이더차트
══════════════════════════════════════ */
let _statsCompareA = '';
let _statsCompareB = '';

// board2-core.js(현황판 청크)가 로드되지 않은 상태(통계탭에 바로 진입)에서도
// 동작하도록 _b2HasRole과 동일한 로직을 통계탭 전용으로 독립 구현
const _STATS_CV_ROLE_ORDER = ['이사장','동아리 회장','총장','부총장','교수','코치','선장','동아리장','반장','총괄'];
const _STATS_CV_ROLE_ORDER_BY_LEN = [..._STATS_CV_ROLE_ORDER].sort((a,b)=>b.length-a.length);
function _statsCvHasRole(p) {
  if (p && typeof p.roleOrder === 'number' && !isNaN(p.roleOrder)) return true;
  const role = (p && p.role) || '';
  if (!role) return false;
  if (_STATS_CV_ROLE_ORDER.includes(role)) return true;
  return _STATS_CV_ROLE_ORDER_BY_LEN.some(key => role.includes(key));
}
// board2 전용 _b2NameTag 대신 통계탭에서 자체적으로 쓰는 간단한 선수 태그
function _statsCvNameTag(p, accentCol, showTier) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  return `
    <div style="display:flex;align-items:center;gap:6px;padding:3px 8px 3px 3px;border-radius:20px;cursor:pointer;transition:background .12s"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'"
      onclick="openPlayerModal('${safeName}')">
      ${typeof getPlayerPhotoHTML==='function'?getPlayerPhotoHTML(p.name,26,'border-radius:50%;flex-shrink:0'):''}
      <span style="font-weight:700;font-size:var(--fs-lg);color:var(--text1);white-space:nowrap;${p.inactive?'opacity:.6':''}">${escHTML(p.name||'')}</span>
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:10px;flex-shrink:0">${p.race}</span>`:''}
      ${showTier&&p.tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||'#fff'};flex-shrink:0">${escHTML(p.tier)}</span>`:''}
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
    </div>`;
}

