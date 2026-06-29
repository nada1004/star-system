function _b2RankingView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const tieredVis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim()) &&
    !_B2_ROLE_ORDER.includes(p.role||'')
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
    .b2rk2-sbtn { padding:6px 14px;border-radius:20px;border:1.5px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;color:var(--text2);cursor:pointer;transition:all .15s }
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
    .b2rk2-score { font-size:13px;font-weight:900;min-width:52px;text-align:right }
    .b2rk2-badges { display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap;align-items:center }
    .b2rk2-glow { position:absolute;inset:0;opacity:.05;pointer-events:none }
    .b2rk2-delta { font-size:11px;font-weight:800;margin-left:2px }
  </style>`;

  // 헤더 배너
  h += `<div style="margin-bottom:14px;padding:12px 16px;background:linear-gradient(135deg,#f97316,#fb923c);border-radius:14px;display:flex;align-items:center;gap:10px">
    <span style="font-size:24px">🏆</span>
    <div>
      <div style="font-size:15px;font-weight:900;color:#fff">대학별 종합 랭킹</div>
      <div style="font-size:11px;color:rgba(255,255,255,.8)">정렬 기준을 선택해 다양한 관점으로 비교</div>
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

    h += `<div class="b2rk2-row" onclick="(function(el){document.querySelectorAll('.b2rk2-row').forEach(function(r){r.classList.remove('selected')});el.classList.toggle('selected');})(this)" style="${isTop3?`border-color:${u.color}66;background:${u.color}08`:''
    }">
      <div class="b2rk2-glow" style="background:radial-gradient(ellipse at 0% 50%,${u.color},transparent 60%)"></div>
      <div class="b2rk2-rank">${rankDisplay}${deltaHtml}</div>
      <div class="b2rk2-name" style="color:${u.color}">${u.name}</div>
      <div class="b2rk2-bar-wrap">
        <div class="b2rk2-bar" style="width:${barW}%;background:linear-gradient(90deg,${u.color},${u.color}88)"></div>
      </div>
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
    h += `<div style="margin-top:12px;padding:10px 14px;background:var(--surface);border-radius:10px;border:1px solid var(--border2)">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">📌 티어 점수 기준</div>
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
   🕸️ 레이더 뷰 v2 — 전체평균선 + 강점축 하이라이트 + 수치 테이블
══════════════════════════════════════ */
function _b2RadarView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const tieredVis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim()) &&
    !_B2_ROLE_ORDER.includes(p.role||'')
  );
  const univList = _b2VisUnivs ? _b2VisUnivs().filter(u=>u.name && u.name!=='무소속') : [];
  const TIERS_LOCAL = typeof TIERS !== 'undefined' ? TIERS : [];

  try {
    const sig = (function(){
      try {
        const arrs=[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM];
        return arrs.map(a=>Array.isArray(a)?a.length:0).join('|');
      } catch(e) { return ''; }
    })();
    if (typeof window.__b2_radar_hist_sig === 'undefined') window.__b2_radar_hist_sig = '';
    if (window.__b2_radar_hist_sig !== sig && typeof _rebuildAllPlayerHistoryCore === 'function') {
      _rebuildAllPlayerHistoryCore();
      window.__b2_radar_hist_sig = sig;
    }
  } catch(e) {}

  const tierScore = t => {
    const i = TIERS_LOCAL.indexOf(t);
    return i < 0 ? 0 : Math.max(0, (TIERS_LOCAL.length - i) * 10);
  };
  const _hist = p => Array.isArray(p && p.history) ? p.history : [];
  const _modeKey = m => {
    if (!m) return '';
    m = String(m).trim();
    if (m === '미니' || m === '친선' || m === '미니대전' || m.includes('미니')) return 'mini';
    if (m === '대학대전' || m === '대학' || m.includes('대학대전')) return 'univm';
    if (m === 'CK' || m.includes('CK')) return 'ck';
    if (m === '티어대회' || m.includes('티어')) return 'tt';
    if (m === '대회' || m === '일반대회' || m === '조별리그' || m === '토너먼트' || m === '조별대회' || m.includes('일반대회') || m.includes('대회') || m.includes('조별') || m.includes('토너')) return 'comp';
    return '';
  };

  const _radarCacheSig = (function(){
    try{
      const arrs=[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM];
      const lens = arrs.map(a=>Array.isArray(a)?a.length:0).join('|');
      const pLen = Array.isArray(players)?players.length:0;
      const hLen = (Array.isArray(players)?players:[]).reduce((s,p)=>s+(Array.isArray(p?.history)?p.history.length:0),0);
      const uLen = (typeof univCfg!=='undefined' && Array.isArray(univCfg)) ? univCfg.length : 0;
      // [FIX-11] 티어 변경 시 캐시 무효화: 선수별 tier 문자열 해시 포함
      const tierHash = (Array.isArray(players)?players:[]).map(p=>p.tier||'').join(',');
      return `${pLen}|${hLen}|${uLen}|${lens}|${tierHash}`;
    }catch(e){ return ''; }
  })();

  if (!window.__b2_radar_stats_cache) window.__b2_radar_stats_cache = { sig:'', univStats:[] };

  let univStats = window.__b2_radar_stats_cache.sig === _radarCacheSig
    ? (window.__b2_radar_stats_cache.univStats || [])
    : null;

  if (!Array.isArray(univStats)) {
    univStats = univList.map(u => {
      const members = tieredVis.filter(p => String(p?.univ||'').trim() === u.name);
      if (!members.length) return null;
      const total = members.length;
      const avgScore = members.reduce((s,p)=>s+tierScore(p.tier||''),0) / total;
      const part = { mini:0, univm:0, ck:0, tt:0, comp:0 };
      let wins=0, losses=0;
      members.forEach(p => {
        const seen = { mini:false, univm:false, ck:false, tt:false, comp:false };
        _hist(p).forEach(h => {
          const k = _modeKey(h && h.mode);
          if (k && (k in part)) {
            const r2 = String(h && h.result || '').trim();
            if (r2==='승') wins++; else if (r2==='패') losses++;
          }
          if (k && k in seen) seen[k] = true;
        });
        Object.keys(seen).forEach(k=>{ if(seen[k]) part[k]++; });
      });
      const games = wins+losses;
      const wr = games>0?Math.round(wins/games*100):null;
      return { name:u.name, color:gc(u.name)||'#64748b', total, avgScore, wins, losses, wr,
        partMini:part.mini/total, partUnivm:part.univm/total, partCk:part.ck/total,
        partTt:part.tt/total, partComp:part.comp/total };
    }).filter(Boolean).sort((a,b)=>b.total-a.total);
    window.__b2_radar_stats_cache.sig = _radarCacheSig;
    window.__b2_radar_stats_cache.univStats = univStats;
  }

  const maxTotal = Math.max(...univStats.map(u=>u.total), 1);
  const maxAvg   = Math.max(...univStats.map(u=>u.avgScore), 1);
  const maxWins  = Math.max(...univStats.map(u=>u.wins||0), 1);
  const maxLoss  = Math.max(...univStats.map(u=>u.losses||0), 1);

  const AXES      = ['인원','평균티어','승','패','미니','대학대전','대학CK','티어대회','일반대회'];
  const AXES_DESC = ['선수 수','티어 점수 평균','총 승리수','총 패배수','참가율','참가율','참가율','참가율','참가율'];
  const N = AXES.length;

  const getVals = u => [
    u.total/maxTotal, u.avgScore/maxAvg,
    (u.wins||0)/maxWins, (u.losses||0)/maxLoss,
    u.partMini, u.partUnivm, u.partCk, u.partTt, u.partComp
  ];

  // 전체 평균값 계산
  const avgVals = AXES.map((_,i) => {
    const vals = univStats.map(u=>getVals(u)[i]);
    return vals.reduce((s,v)=>s+v,0)/Math.max(vals.length,1);
  });

  // 실제 수치 (테이블용)
  const getRawVals = u => [
    u.total, Math.round(u.avgScore*10)/10,
    u.wins||0, u.losses||0,
    Math.round(u.partMini*100)+'%', Math.round(u.partUnivm*100)+'%',
    Math.round(u.partCk*100)+'%', Math.round(u.partTt*100)+'%',
    Math.round(u.partComp*100)+'%'
  ];

  const univDataJson = JSON.stringify(univStats.map(u=>({ name:u.name, color:u.color, total:u.total, wr:u.wr, wins:u.wins, losses:u.losses, vals:getVals(u), raw:getRawVals(u) })));
  const axesJson     = JSON.stringify(AXES);
  const axesDescJson = JSON.stringify(AXES_DESC);
  const avgJson      = JSON.stringify(avgVals);
  const uid = 'rdr_' + Math.random().toString(36).slice(2,8);

  return `<style>
    #${uid}-wrap {}
    #${uid}-sel { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
    .${uid}-chip { padding:5px 12px; border-radius:20px; border:1.5px solid var(--border2); background:var(--surface); font-size:11px; font-weight:700; color:var(--text2); cursor:pointer; transition:all .12s; }
    .${uid}-chip.on { color:#fff; border-color:transparent; }
    .${uid}-chip:hover:not(.on) { border-color:var(--text2); }
    #${uid}-canvas { display:block; max-width:520px; margin:0 auto; cursor:crosshair; }
    #${uid}-legend { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; justify-content:center; }
    #${uid}-table { width:100%; border-collapse:collapse; margin-top:14px; font-size:11px; }
    #${uid}-table th { padding:5px 8px; background:var(--bg); border-bottom:2px solid var(--border2); font-size:10px; font-weight:800; color:var(--text3); text-align:center; white-space:nowrap; position:sticky; top:0; z-index:1; }
    #${uid}-table th:first-child { text-align:left; }
    #${uid}-table td { padding:5px 8px; border-bottom:1px solid var(--border2); text-align:center; font-weight:700; }
    #${uid}-table td:first-child { text-align:left; font-weight:900; }
    #${uid}-table tr:hover td { background:var(--hover); }
    #${uid}-table td.hi { background:#fef9c366; font-weight:900; }
    .${uid}-avg-note { font-size:10px; color:var(--text3); display:flex; align-items:center; gap:4px; margin-top:4px; }
    #${uid}-tooltip { position:fixed; pointer-events:none; opacity:0; background:var(--white); border:1px solid var(--border2); border-radius:10px; padding:8px 12px; box-shadow:0 4px 20px #0003; font-size:11px; font-weight:700; color:var(--text2); z-index:999; transition:opacity .1s; max-width:180px; }
  </style>
  <div id="${uid}-wrap">
    <div style="margin-bottom:12px;padding:10px 14px;background:linear-gradient(135deg,#a855f7,#9333ea);border-radius:12px;display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">🕸️</span>
      <div>
        <div style="font-size:13px;font-weight:900;color:#fff">대학별 다차원 레이더</div>
        <div style="font-size:11px;color:rgba(255,255,255,.8)">최대 3개 선택 · 점선 = 전체 평균 · 강점 축 자동 하이라이트</div>
      </div>
    </div>
    <div style="margin-bottom:10px;padding:10px 14px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;font-size:11px;color:var(--text3);line-height:1.6">
      <strong style="color:var(--text2)">축 설명</strong> —
      승/패: 공식 기록 기준 · 참가율: 해당 종목 1경기 이상 뛴 비율 · 인원·평균티어: 최대값 기준 정규화
    </div>
    <div id="${uid}-sel"></div>
    <div style="position:relative">
      <canvas id="${uid}-canvas" width="520" height="480"></canvas>
      <div id="${uid}-tooltip"></div>
    </div>
    <div id="${uid}-legend"></div>
    <div style="overflow-x:auto;margin-top:4px">
      <table id="${uid}-table"><thead></thead><tbody></tbody></table>
    </div>
  </div>
  <script>
  (function(){
    const UNIVS    = ${univDataJson};
    const AXES     = ${axesJson};
    const AXES_DESC= ${axesDescJson};
    const AVG_VALS = ${avgJson};
    const N = AXES.length;
    const canvas  = document.getElementById('${uid}-canvas');
    const selEl   = document.getElementById('${uid}-sel');
    const legendEl= document.getElementById('${uid}-legend');
    const tableEl = document.getElementById('${uid}-table');
    const ttipEl  = document.getElementById('${uid}-tooltip');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const _cssVar = k => { try{ return String(getComputedStyle(document.documentElement).getPropertyValue(k)||'').trim(); }catch(e){ return ''; } };
    const TEXT2  = ()=> _cssVar('--text2') || '#475569';
    const TEXT3  = ()=> _cssVar('--text3') || '#64748b';
    const BORDER = ()=> _cssVar('--border2') || '#e2e8f0';
    let selected = [];
    let mousePos = null;

    const W=520,H=480,cx=260,cy=240,R=155;
    // DPR 처리: 고해상도 디스플레이에서 선명하게 렌더
    const _dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width  = W * _dpr;
    canvas.height = H * _dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(_dpr, _dpr);
    const angle = i => (Math.PI*2*i/N) - Math.PI/2;
    const radarPt = (val,i) => { const a=angle(i); return {x:cx+Math.cos(a)*R*val, y:cy+Math.sin(a)*R*val}; };

    // 강점 축 계산 (선택된 대학이 전체 평균 대비 가장 높은 축)
    function getStrengthAxes(u) {
      return u.vals.map((v,i)=>({ i, diff:v-(AVG_VALS[i]||0) })).filter(d=>d.diff>0.12).sort((a,b)=>b.diff-a.diff).slice(0,2).map(d=>d.i);
    }

    // 칩 빌드
    UNIVS.forEach(u => {
      const chip = document.createElement('button');
      chip.className = '${uid}-chip';
      chip.textContent = u.name;
      chip.onclick = () => {
        if (selected.includes(u.name)) {
          selected = selected.filter(n=>n!==u.name);
        } else {
          if (selected.length >= 3) selected.shift();
          selected.push(u.name);
        }
        document.querySelectorAll('.${uid}-chip').forEach(c => {
          const un = UNIVS.find(u2=>u2.name===c.textContent);
          const isOn = selected.includes(c.textContent);
          c.classList.toggle('on', isOn);
          c.style.background = isOn && un ? un.color : '';
        });
        draw(); buildTable();
      };
      selEl.appendChild(chip);
    });

    function draw() {
      ctx.clearRect(0,0,W,H);
      const t2=TEXT2(), t3=TEXT3(), bd=BORDER();
      const activeUnivs = UNIVS.filter(u=>selected.includes(u.name));

      // 배경 링
      for (let r=1;r<=5;r++) {
        const ratio=r/5;
        ctx.beginPath();
        for (let i=0;i<N;i++) { const {x,y}=radarPt(ratio,i); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
        ctx.closePath();
        ctx.strokeStyle=\`rgba(100,116,139,\${r===5?0.25:0.12})\`;
        ctx.lineWidth=r===5?1.5:1; ctx.stroke();
        if(r===5){ ctx.fillStyle='rgba(100,116,139,0.04)'; ctx.fill(); }
        // 링 수치
        ctx.save(); ctx.font='700 9px sans-serif'; ctx.fillStyle=t3; ctx.textAlign='left';
        ctx.fillText((ratio*100).toFixed(0)+'%', cx+4, cy-R*ratio+3);
        ctx.restore();
      }

      // 전체 평균선 (점선)
      ctx.save();
      ctx.beginPath();
      AVG_VALS.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.closePath();
      ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(148,163,184,0.7)'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='rgba(148,163,184,0.06)'; ctx.fill();
      ctx.setLineDash([]); ctx.restore();

      // 강점 축 하이라이트 (선택된 대학 기준)
      const strengthSet = new Set();
      activeUnivs.forEach(u=>{ getStrengthAxes(u).forEach(i=>strengthSet.add(i)); });

      // 축 라인 + 레이블
      for (let i=0;i<N;i++) {
        const {x,y}=radarPt(1,i);
        const isStrength = strengthSet.has(i);
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y);
        ctx.strokeStyle = isStrength ? 'rgba(251,191,36,0.7)' : 'rgba(100,116,139,0.2)';
        ctx.lineWidth = isStrength ? 2.5 : 1.2; ctx.stroke();

        const la=angle(i), lx=cx+Math.cos(la)*(R+26), ly=cy+Math.sin(la)*(R+26);
        ctx.textAlign='center'; ctx.textBaseline='middle';
        if (isStrength) {
          ctx.font='900 13px sans-serif'; ctx.fillStyle='#b45309';
        } else {
          ctx.font='800 11px sans-serif'; ctx.fillStyle=t2;
        }
        ctx.fillText(AXES[i], lx, ly-6);
        ctx.font='600 9px sans-serif'; ctx.fillStyle=t3;
        ctx.fillText(AXES_DESC[i]||'', lx, ly+7);
      }

      // 데이터 폴리곤
      if (activeUnivs.length===0) {
        ctx.fillStyle=t3; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font='900 13px sans-serif'; ctx.fillText('대학을 선택하세요', cx, cy-10);
        ctx.font='700 11px sans-serif'; ctx.fillText('최대 3개까지 동시 비교 가능', cx, cy+12);
        legendEl.innerHTML='';
        return;
      }

      activeUnivs.forEach(u => {
        ctx.beginPath();
        u.vals.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
        ctx.closePath();
        ctx.fillStyle=u.color+'28'; ctx.fill();
        ctx.strokeStyle=u.color; ctx.lineWidth=2.5; ctx.stroke();
        // 점
        u.vals.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i);
          ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2);
          ctx.fillStyle=u.color; ctx.fill();
          ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
        });
      });

      // 마우스 hover → 가장 가까운 점 강조
      if (mousePos) {
        let minDist=Infinity, bestU=null, bestI=-1;
        activeUnivs.forEach(u=>{ u.vals.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i); const d=Math.hypot(mousePos.x-x,mousePos.y-y); if(d<minDist){minDist=d;bestU=u;bestI=i;} }); });
        if (bestU && minDist<24) {
          const {x,y}=radarPt(Math.max(0.01,bestU.vals[bestI]),bestI);
          ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2);
          ctx.strokeStyle=bestU.color; ctx.lineWidth=3; ctx.stroke();
          // 툴팁
          ttipEl.style.opacity='1';
          ttipEl.style.left=(x/W*canvas.getBoundingClientRect().width+canvas.getBoundingClientRect().left+12)+'px';
          ttipEl.style.top=(y/H*canvas.getBoundingClientRect().height+canvas.getBoundingClientRect().top-30)+'px';
          ttipEl.innerHTML=\`<div style="color:\${bestU.color};font-weight:900">\${bestU.name}</div><div style="color:#475569">\${AXES[bestI]}: <strong>\${bestU.raw[bestI]}</strong></div><div style="font-size:10px;color:#94a3b8">정규화 평균 \${Math.round((AVG_VALS[bestI]||0)*100)}%</div>\`;
        } else { ttipEl.style.opacity='0'; }
      }

      // 범례
      legendEl.innerHTML = activeUnivs.map(u=>{
        const str = getStrengthAxes(u).map(i=>AXES[i]).join(', ');
        return \`<div style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:10px;background:var(--surface);border:1.5px solid \${u.color}44">
          <span style="width:12px;height:12px;border-radius:50%;background:\${u.color};flex-shrink:0"></span>
          <span style="font-size:12px;font-weight:900;color:\${u.color}">\${u.name}</span>
          <span style="font-size:11px;color:var(--text3);">\${u.total}명\${u.wr!==null?' · '+u.wr+'%':''}\${(u.wins+u.losses)>0?' · '+(u.wins+u.losses)+'전':''}</span>
          \${str?'<span style="font-size:10px;background:#fef9c3;color:#b45309;padding:1px 5px;border-radius:5px;font-weight:800">강점: '+str+'</span>':''}
        </div>\`;
      }).join('');
    }

    // 수치 테이블 빌드
    function buildTable() {
      const active = UNIVS.filter(u=>selected.includes(u.name));
      if (!tableEl) return;
      if (!active.length) { tableEl.innerHTML=''; return; }
      const thead=tableEl.querySelector('thead'), tbody=tableEl.querySelector('tbody');
      if (!thead || !tbody) {
        // thead/tbody가 없으면 재생성
        tableEl.innerHTML='<thead></thead><tbody></tbody>';
      }
      const th=tableEl.querySelector('thead'), tb=tableEl.querySelector('tbody');
      if (!th || !tb) return;
      // 각 축별 최고값 인덱스
      const maxIdx = AXES.map((_,ai)=>{
        let best=-1, bestV=-Infinity;
        active.forEach((u,ui)=>{ if(u.vals[ai]>bestV){bestV=u.vals[ai];best=ui;} });
        return best;
      });
      th.innerHTML = \`<tr><th>항목</th>\${active.map(u=>\`<th style="color:\${u.color}">\${u.name}</th>\`).join('')}<th style="color:#94a3b8">정규화 평균</th></tr>\`;
      tb.innerHTML = AXES.map((ax,ai)=>{
        const avgRaw=(AVG_VALS[ai]*100).toFixed(0)+'%';
        return \`<tr>
          <td style="font-weight:800;color:var(--text2)">\${ax}<div style="font-size:9px;color:var(--text3);font-weight:600">\${AXES_DESC[ai]}</div></td>
          \${active.map((u,ui)=>\`<td class="\${ui===maxIdx[ai]?'hi':''}" style="color:\${ui===maxIdx[ai]?u.color:'var(--text2)'}">\${u.raw[ai]}\${ui===maxIdx[ai]?'<span style="font-size:9px;margin-left:2px">★</span>':''}</td>\`).join('')}
          <td style="color:#94a3b8">\${avgRaw}</td>
        </tr>\`;
      }).join('');
    }

    canvas.addEventListener('mousemove', e => {
      const rect=canvas.getBoundingClientRect();
      const scX=W/rect.width, scY=H/rect.height;
      mousePos={ x:(e.clientX-rect.left)*scX, y:(e.clientY-rect.top)*scY };
      draw();
    });
    canvas.addEventListener('mouseleave', ()=>{ mousePos=null; ttipEl.style.opacity='0'; draw(); });

    // 반응형
    const ro=new ResizeObserver(()=>draw());
    ro.observe(canvas.parentElement);
    draw(); buildTable();
  })();
  </script>`;
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
  const tieredVis = vis.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
  const roledVis  = vis.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  const univList  = _b2VisUnivs ? _b2VisUnivs().filter(u=>u.name && u.name!=='무소속') : [];

  // 종족 카운트
  const raceCts = {P:0,T:0,Z:0,'?':0};
  tieredVis.forEach(p => { const r=p.race||'?'; raceCts[r in raceCts?r:'?']++; });
  const tierCts = {};
  tieredVis.forEach(p => { const t=p.tier||'미정'; tierCts[t]=(tierCts[t]||0)+1; });

  // 이번주 활동 인원 & 통산 승률
  const { fromN: thisFromN, toN: thisToN } = _b2ThisWeekRange();
  const dateNum = _b2DateNum;

  let totalW=0, totalL=0, weekActive=new Set();
  tieredVis.forEach(p => {
    (Array.isArray(p.history)?p.history:[]).forEach(h => {
      if (h.result==='승') totalW++;
      else if (h.result==='패') totalL++;
      const d = dateNum(h.date||h.d||'');
      if (d>=thisFromN && d<=thisToN) weekActive.add(p.name);
    });
  });
  const totalG = totalW+totalL;
  const totalWr = totalG>0 ? Math.round(totalW/totalG*100) : null;

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

  // 대학별 스탯
  const univStats = univList.map(u => {
    const members = tieredVis.filter(p => String(p?.univ||'').trim()===String(u.name||'').trim());
    const rCts={P:0,T:0,Z:0};
    members.forEach(p=>{if(p.race in rCts)rCts[p.race]++;});
    const tierDist={};
    members.forEach(p=>{const t=p.tier||'미정';tierDist[t]=(tierDist[t]||0)+1;});
    return {name:u.name,color:gc(u.name),count:members.length,races:rCts,tiers:tierDist};
  }).filter(u=>u.count>0).sort((a,b)=>b.count-a.count);

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
    .b2s-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-radius:26px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.05);margin-bottom:16px}
    .b2s-hero-title{font-size:26px;font-weight:950;letter-spacing:-.04em;color:var(--text1);line-height:1.08}
    .b2s-hero-desc{margin-top:6px;font-size:13px;line-height:1.65;color:var(--text3);max-width:720px}
    .b2s-hero-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
    .b2s-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 18px rgba(15,23,42,.04);font-size:12px;font-weight:800;color:var(--text2)}
    .b2s-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;min-width:min(100%,360px)}
    .b2s-hero-stat{padding:14px;border-radius:18px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 18px rgba(15,23,42,.04)}
    .b2s-hero-stat-label{font-size:11px;font-weight:800;color:var(--text3)}
    .b2s-hero-stat-value{margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1}
    .b2s-hero-stat-sub{margin-top:4px;font-size:11px;font-weight:700;color:var(--text3)}
    .b2s-grid7 { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; margin-bottom:16px; }
    @media(max-width:700px){ .b2s-grid7{ grid-template-columns:repeat(4,1fr); } }
    @media(max-width:420px){ .b2s-grid7{ grid-template-columns:repeat(2,1fr); } }
    .b2s-kpi { border-radius:18px; padding:15px 12px; text-align:center; position:relative; overflow:hidden; border:1px solid rgba(148,163,184,.16); background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96)); box-shadow:0 14px 24px rgba(15,23,42,.04); transition:transform .15s,box-shadow .15s; cursor:default; }
    .b2s-kpi:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(15,23,42,.08); }
    .b2s-kpi-num { font-size:26px; font-weight:900; line-height:1.1; }
    .b2s-kpi-lbl { font-size:11px; font-weight:700; margin-top:3px; opacity:.75; }
    .b2s-kpi-sub { font-size:10px; opacity:.6; margin-top:1px; }
    .b2s-kpi-glow { position:absolute;inset:0;opacity:.08;pointer-events:none; }
    .b2s-2col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
    @media(max-width:780px){ .b2s-2col{ grid-template-columns:1fr 1fr; } }
    @media(max-width:520px){ .b2s-2col{ grid-template-columns:1fr; } }
    .b2s-panel { background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96)); border:1px solid rgba(148,163,184,.16); border-radius:20px; padding:16px; box-shadow:0 16px 28px rgba(15,23,42,.04); }
    .b2s-panel-title { font-size:13px; font-weight:900; color:var(--text1); margin-bottom:12px; display:flex; align-items:center; gap:6px; }
    .b2s-univ-row { display:flex; align-items:center; gap:8px; padding:5px 0; }
    .b2s-univ-row + .b2s-univ-row { border-top:1px solid var(--border2); }
    .b2s-bar-track { flex:1; height:12px; border-radius:6px; overflow:hidden; background:var(--border2); display:flex; }
    .b2s-tier-chip { display:inline-flex; flex-direction:column; align-items:center; padding:8px 10px; border-radius:14px; min-width:54px; box-shadow:0 10px 16px rgba(15,23,42,.04); }
    .b2s-top-univ { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:8px; }
    .b2s-univ-card { border-radius:16px; padding:10px 12px; border:1.5px solid; position:relative; overflow:hidden; transition:transform .12s,box-shadow .12s; cursor:default; box-shadow:0 12px 18px rgba(15,23,42,.04); }
    .b2s-univ-card:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(15,23,42,.08); }
    .b2s-new-player { display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:var(--surface);border:1px solid var(--border2);font-size:11px;font-weight:700;color:var(--text2);margin:2px; }
    @media(max-width:900px){ .b2s-hero{flex-direction:column}.b2s-hero-stats{width:100%;grid-template-columns:repeat(3,minmax(0,1fr));} }
    @media(max-width:640px){ .b2s-hero{padding:18px 16px;border-radius:22px}.b2s-hero-title{font-size:22px}.b2s-hero-stats{grid-template-columns:1fr} }
  </style>`;

  // KPI 7개 (통산승률 + 이번주 활동 추가)
  const kpis = [
    { num: vis.length,           lbl: '전체 선수', col:'#3b82f6', icon:'👥' },
    { num: univList.length,      lbl: '활동 대학', col:'#10b981', icon:'🏫' },
    { num: raceCts.P,            lbl: '프로토스',  col:'#7c3aed', icon:'🔮' },
    { num: raceCts.T,            lbl: '테란',      col:'#0284c7', icon:'⚔️' },
    { num: raceCts.Z,            lbl: '저그',      col:'#059669', icon:'🦎' },
    { num: weekActive.size,      lbl: '이번주 활동', col:'#f59e0b', icon:'🔥', sub:`${totalW}승 ${totalL}패` },
    { num: totalWr!==null?`${totalWr}%`:'-', lbl:'통산 승률', col:'#ec4899', icon:'📊', sub:`${totalG.toLocaleString()}전` },
  ];

  h += `<section class="b2s-hero">
    <div>
      <div style="font-size:11px;font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase">Summary Dashboard</div>
      <div class="b2s-hero-title">현황판 요약</div>
      <div class="b2s-hero-desc">전체 인원, 활동 대학, 종족 분포, 최근 유입과 대학별 구성을 한 화면에서 빠르게 훑을 수 있도록 정리한 요약 화면입니다.</div>
      <div class="b2s-hero-badges">
        <span class="b2s-hero-badge">표시 선수 ${vis.length}명</span>
        <span class="b2s-hero-badge">일반 ${tieredVis.length}명</span>
        <span class="b2s-hero-badge">직책 ${roledVis.length}명</span>
        <span class="b2s-hero-badge">최근 30일 신규 ${newPlayers.length}명</span>
      </div>
    </div>
    <div class="b2s-hero-stats">
      <div class="b2s-hero-stat">
        <div class="b2s-hero-stat-label">활동 대학</div>
        <div class="b2s-hero-stat-value">${univList.length}</div>
        <div class="b2s-hero-stat-sub">무소속 제외 기준</div>
      </div>
      <div class="b2s-hero-stat">
        <div class="b2s-hero-stat-label">이번주 활동</div>
        <div class="b2s-hero-stat-value">${weekActive.size}</div>
        <div class="b2s-hero-stat-sub">${totalW}승 ${totalL}패 누적</div>
      </div>
      <div class="b2s-hero-stat">
        <div class="b2s-hero-stat-label">통산 승률</div>
        <div class="b2s-hero-stat-value">${totalWr!==null?`${totalWr}%`:'-'}</div>
        <div class="b2s-hero-stat-sub">${totalG.toLocaleString()}전 기준</div>
      </div>
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

  // 종족 비율 + 티어 분포
  h += `<div class="b2s-2col">
    <div class="b2s-panel">
      <div class="b2s-panel-title">🎮 종족 비율
        <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${tieredVis.length}명 기준</span>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        <div style="flex-shrink:0">${donutRings()}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          ${[{r:'P',c:'#7c3aed',l:'🔮 프로토스'},{r:'T',c:'#0284c7',l:'⚔️ 테란'},{r:'Z',c:'#059669',l:'🦎 저그'}].map(({r,c,l})=>{
            const n=raceCts[r]; const pct=Math.round(n/total3*100);
            return `<div>
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:11px;font-weight:800;color:${c}">${l}</span>
                <span style="font-size:11px;font-weight:900;color:var(--text2)">${n}<span style="font-weight:600;color:var(--text3)"> (${pct}%)</span></span>
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
            <div style="font-size:12px;font-weight:900;padding:2px 8px;border-radius:6px;background:${col};color:${tcol}">${t}</div>
            <div style="font-size:11px;font-weight:800;color:${col};margin-top:3px">${n}명</div>
            <div style="font-size:10px;color:var(--text3)">${pct}%</div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="b2s-panel">
      <div class="b2s-panel-title">🏫 대학별 현황
        <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${univStats.length}개 대학</span>
      </div>
      ${univStats.slice(0,10).map((u,i)=>{
        const barW=Math.round(u.count/maxCount*100);
        return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border2)">
          <span style="font-size:10px;font-weight:900;color:var(--text3);width:16px;text-align:center">${i+1}</span>
          <span style="font-size:11px;font-weight:800;color:${u.color};min-width:60px;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name}</span>
          <div style="flex:1;height:8px;border-radius:4px;overflow:hidden;background:var(--border2);display:flex">
            <div style="width:${Math.round(u.races.P/u.count*barW)}%;background:#7c3aed"></div>
            <div style="width:${Math.round(u.races.T/u.count*barW)}%;background:#0284c7"></div>
            <div style="width:${Math.round(u.races.Z/u.count*barW)}%;background:#059669"></div>
          </div>
          <span style="font-size:11px;font-weight:900;color:${u.color};min-width:20px;text-align:right">${u.count}</span>
        </div>`;
      }).join('')}
      ${univStats.length>10?`<div style="text-align:center;color:var(--text3);font-size:11px;margin-top:6px">외 ${univStats.length-10}개 대학</div>`:''}
    </div>
  </div>`;

  // 최근 합류 선수
  if (newPlayers.length > 0) {
    h += `<div class="b2s-panel" style="margin-bottom:14px">
      <div class="b2s-panel-title">🆕 최근 30일 첫 경기 선수
        <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${newPlayers.length}명</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${newPlayers.map(p=>{
          const col=gc(String(p?.univ||''))||'#64748b';
          const tc=typeof getTierBtnColor==='function'&&p.tier?getTierBtnColor(p.tier):'#64748b';
          const tt=typeof getTierBtnTextColor==='function'&&p.tier?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
          const rIco=p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
          const hist=Array.isArray(p.history)?p.history:[];
          const firstD=hist.length?String(Math.min(...hist.map(h2=>parseInt(String(h2.date||h2.d||'').replace(/[-\.]/g,''))||Infinity))).replace(/(\d{4})(\d{2})(\d{2})/,'$1.$2.$3'):'';
          return `<span class="b2s-new-player" style="border-color:${col}44;background:${col}0d">
            <span style="color:${col};font-weight:900">${p.name}</span>
            ${rIco?`<span style="font-size:10px">${rIco}</span>`:''}
            ${p.tier?`<span style="font-size:9px;padding:1px 4px;border-radius:4px;background:${tc};color:${tt}">${p.tier}</span>`:''}
            <span style="font-size:9px;color:var(--text3)">${p.univ||''}</span>
          </span>`;
        }).join('')}
      </div>
    </div>`;
  }

  // 대학별 인원 현황
  h += `<div class="b2s-panel" style="margin-bottom:14px">
    <div class="b2s-panel-title">🏫 대학별 인원 현황
      <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${univStats.length}개 대학</span>
    </div>
    <div class="b2s-top-univ" style="margin-bottom:12px">
      ${univStats.slice(0,6).map((u,i)=>{
        const medal=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'][i]||'';
        const pP=u.count>0?Math.round(u.races.P/u.count*100):0;
        const pT=u.count>0?Math.round(u.races.T/u.count*100):0;
        const pZ=u.count>0?Math.round(u.races.Z/u.count*100):0;
        return `<div class="b2s-univ-card" style="border-color:${u.color}44;background:${u.color}0d">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
            <span style="font-size:14px">${medal}</span>
            <span style="font-size:12px;font-weight:900;color:${u.color};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${u.name}</span>
            <span style="font-size:15px;font-weight:900;color:${u.color}">${u.count}</span>
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
    <div style="border-top:1px solid var(--border2);padding-top:10px">
      ${univStats.slice(0,20).map(u=>{
        const barW=Math.round(u.count/maxCount*100);
        return `<div class="b2s-univ-row">
          <span style="font-size:11px;font-weight:800;color:${u.color};min-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name}</span>
          <div class="b2s-bar-track">
            <div title="프로토스 ${u.races.P}" style="width:${Math.round(u.races.P/u.count*barW)}%;background:#7c3aed;transition:width .6s ease"></div>
            <div title="테란 ${u.races.T}" style="width:${Math.round(u.races.T/u.count*barW)}%;background:#0284c7;transition:width .6s ease"></div>
            <div title="저그 ${u.races.Z}" style="width:${Math.round(u.races.Z/u.count*barW)}%;background:#059669;transition:width .6s ease"></div>
          </div>
          <span style="font-size:11px;font-weight:900;color:${u.color};min-width:22px;text-align:right">${u.count}</span>
          <div style="display:flex;gap:3px;margin-left:3px;min-width:70px">
            ${u.races.P?`<span style="font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 4px;border-radius:5px;font-weight:800">P${u.races.P}</span>`:''}
            ${u.races.T?`<span style="font-size:9px;background:#e0f2fe;color:#075985;padding:1px 4px;border-radius:5px;font-weight:800">T${u.races.T}</span>`:''}
            ${u.races.Z?`<span style="font-size:9px;background:#d1fae5;color:#064e3b;padding:1px 4px;border-radius:5px;font-weight:800">Z${u.races.Z}</span>`:''}
          </div>
        </div>`;
      }).join('')}
      ${univStats.length>20?`<div style="text-align:center;color:var(--text3);font-size:12px;margin-top:8px;padding-top:6px;border-top:1px solid var(--border2)">외 ${univStats.length-20}개 대학</div>`:''}
    </div>
  </div>`;

  return h;
}
/* ══════════════════════════════════════
   ⚔️ 비교 뷰 v2 — 실전승률 + 직접대결 + 레이더차트
══════════════════════════════════════ */
let _b2CompareA = '';
let _b2CompareB = '';

function _b2CompareView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const univList = _b2VisUnivs ? _b2VisUnivs().filter(u=>u.name && u.name!=='무소속') : [];
  if (!_b2CompareA && univList.length>0) _b2CompareA = univList[0]?.name||'';
  if (!_b2CompareB && univList.length>1) _b2CompareB = univList[1]?.name||'';

  const dateNum = _b2DateNum;

  const getStats = (name) => {
    const members = players.filter(p=>String(p?.univ||'').trim()===name&&!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(name));
    const tiered  = members.filter(p=>!_B2_ROLE_ORDER.includes(p.role||''));
    const roled   = members.filter(p=>_B2_ROLE_ORDER.includes(p.role||''));
    const races={P:0,T:0,Z:0,N:0};
    members.forEach(p=>{
      const r=String(p.race||'').trim().toUpperCase();
      if(r==='P'||r==='T'||r==='Z') races[r]++;
      else races.N++;
    });
    const tiers={};
    tiered.forEach(p=>{const t=p.tier||'미정';tiers[t]=(tiers[t]||0)+1;});
    const topTier = tiered.length>0?(tiered.slice().sort((a,b)=>{
      const ti=typeof TIERS!=='undefined'?TIERS:[];
      const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999);
    })[0]?.tier||'없음'):'없음';

    // 실전 승률 계산 — 마이페이지(선수 상세)와 동일하게 p.win/p.loss 합산 기준 사용
    let tw=0,tl=0;
    tiered.forEach(p=>{
      tw += Number(p.win||0);
      tl += Number(p.loss||0);
    });
    const tg=tw+tl;
    const wr=tg>0?Math.round(tw/tg*100):null;

    // 직접 맞대결 (상대 대학 이름이 opp 기록에 있는 경우)
    // 각 선수 history에서 opp가 상대 대학 소속 선수명인 케이스 → oppUniv 필드 사용
    return {members,tiered,roled,races,tiers,topTier,total:members.length,tw,tl,tg,wr};
  };

  // 직접 맞대결: A 선수들 history 중 oppUniv === B (또는 opp가 B 소속 선수)
  const getHeadToHead = (nameA, nameB) => {
    const aPlayers = new Set(players.filter(p=>String(p?.univ||'').trim()===nameA&&!p.hidden&&!p.retired).map(p=>p.name));
    const bPlayers = new Set(players.filter(p=>String(p?.univ||'').trim()===nameB).map(p=>p.name));
    let aw=0,al=0;
    // p.history 기반
    players.filter(p=>aPlayers.has(p.name)).forEach(p=>{
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        const oppU = String(h.oppUniv||h.univ||'').trim();
        const oppN = String(h.opp||'').trim();
        if (oppU===nameB || bPlayers.has(oppN)) {
          if(h.result==='승')aw++; else if(h.result==='패')al++;
        }
      });
    });
    // indM (개인전)
    try { (typeof indM!=='undefined'&&Array.isArray(indM)?indM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName) return;
      if(aPlayers.has(m.wName)&&bPlayers.has(m.lName)) aw++;
      else if(aPlayers.has(m.lName)&&bPlayers.has(m.wName)) al++;
    }); } catch(e){}
    // gjM (끝장전)
    try { (typeof gjM!=='undefined'&&Array.isArray(gjM)?gjM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName||m._proLabel) return;
      if(aPlayers.has(m.wName)&&bPlayers.has(m.lName)) aw++;
      else if(aPlayers.has(m.lName)&&bPlayers.has(m.wName)) al++;
    }); } catch(e){}
    // ttM (티어대회) 게임 단위
    try { (typeof ttM!=='undefined'&&Array.isArray(ttM)?ttM:[]).forEach(m=>{
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g||!g.winner) return;
        const gA=g.playerA||g.a1||'', gB=g.playerB||g.b1||'';
        if(!gA||!gB) return;
        const wA=g.winner==='A'; const wB=g.winner==='B';
        if(aPlayers.has(gA)&&bPlayers.has(gB)){if(wA)aw++;else if(wB)al++;}
        else if(aPlayers.has(gB)&&bPlayers.has(gA)){if(wB)aw++;else if(wA)al++;}
      });});
    }); } catch(e){}
    // 팀전 (miniM/univM/ckM) 게임 단위
    try { [
      typeof miniM!=='undefined'?miniM:[],
      typeof univM!=='undefined'?univM:[],
      typeof ckM!=='undefined'?ckM:[]
    ].forEach(arr=>{ (Array.isArray(arr)?arr:[]).forEach(m=>{
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g||!g.winner) return;
        const gA=g.playerA||g.a1||'', gB=g.playerB||g.b1||'';
        if(!gA||!gB) return;
        const wA=g.winner==='A'; const wB=g.winner==='B';
        if(aPlayers.has(gA)&&bPlayers.has(gB)){if(wA)aw++;else if(wB)al++;}
        else if(aPlayers.has(gB)&&bPlayers.has(gA)){if(wB)aw++;else if(wA)al++;}
      });});
    }); }); } catch(e){}
    return {aw,al,ag:aw+al};
  };

  const colA = _b2CompareA?gc(_b2CompareA)||'#64748b':'#64748b';
  const colB = _b2CompareB?gc(_b2CompareB)||'#64748b':'#64748b';
  const stA  = _b2CompareA?getStats(_b2CompareA):null;
  const stB  = _b2CompareB?getStats(_b2CompareB):null;
  const h2h  = (_b2CompareA&&_b2CompareB)?getHeadToHead(_b2CompareA,_b2CompareB):{aw:0,al:0,ag:0};
  const h2hB = (_b2CompareA&&_b2CompareB)?getHeadToHead(_b2CompareB,_b2CompareA):{aw:0,al:0,ag:0};

  const univOptA = univList.map(u=>`<option value="${u.name}"${_b2CompareA===u.name?' selected':''}>${u.name}</option>`).join('');
  const univOptB = univList.map(u=>`<option value="${u.name}"${_b2CompareB===u.name?' selected':''}>${u.name}</option>`).join('');

  const compareRow = (label,valA,valB) => {
    const numA=typeof valA==='number'?valA:null;
    const numB=typeof valB==='number'?valB:null;
    const winA=numA!==null&&numB!==null&&numA>numB;
    const winB=numA!==null&&numB!==null&&numB>numA;
    const tot=numA!==null&&numB!==null?(numA+numB):0;
    const pctA=tot>0?Math.round(numA/tot*100):50;
    const pctB=tot>0?Math.round(numB/tot*100):50;
    const showBar=numA!==null&&numB!==null&&tot>0;
    return `<div style="padding:7px 0;border-bottom:1px solid var(--border2)">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:${showBar?'5px':'0'}">
        <div style="text-align:right;font-size:13px;font-weight:${winA?'900':'600'};color:${winA?colA:'var(--text2)'}">
          ${winA?'▲ ':''}${valA}
        </div>
        <div style="font-size:10px;color:var(--text3);font-weight:700;text-align:center;white-space:nowrap;min-width:58px">${label}</div>
        <div style="text-align:left;font-size:13px;font-weight:${winB?'900':'600'};color:${winB?colB:'var(--text2)'}">
          ${valB}${winB?' ▲':''}
        </div>
      </div>
      ${showBar?`<div style="display:flex;height:5px;border-radius:3px;overflow:hidden;background:var(--border2)">
        <div style="width:${pctA}%;background:${winA?colA:colA+'88'};transition:width .5s ease"></div>
        <div style="width:${pctB}%;background:${winB?colB:colB+'88'};transition:width .5s ease"></div>
      </div>`:''}
    </div>`;
  };

  // 레이더 차트 SVG
  const radarChart = (stA, stB) => {
    if (!stA || !stB) return '';
    const TIERS_LOCAL = typeof TIERS!=='undefined'?TIERS:[];
    const tierScore = t => { const i=TIERS_LOCAL.indexOf(t); return i<0?0:Math.max(0,(TIERS_LOCAL.length-i)*10); };

    const normalize = (val,max) => Math.min(1, max>0?val/max:0);
    // 인원과 티어점수를 '전력' 한 축으로 통합해 저그 축이 들어갈 자리를 만듦
    const powerScore = st => st.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0) + st.total*5;
    const powA = powerScore(stA), powB = powerScore(stB);
    const axes = [
      { label:'전력',   vA: normalize(powA, Math.max(powA,powB,1)), vB: normalize(powB, Math.max(powA,powB,1)) },
      { label:'승률',  vA: stA.wr!==null?stA.wr/100:0, vB: stB.wr!==null?stB.wr/100:0 },
      { label:'경기수', vA: normalize(stA.tg, Math.max(stA.tg,stB.tg,1)), vB: normalize(stB.tg, Math.max(stA.tg,stB.tg,1)) },
      { label:'프로토스', vA: normalize(stA.races.P, Math.max(stA.races.P,stB.races.P,1)), vB: normalize(stB.races.P, Math.max(stA.races.P,stB.races.P,1)) },
      { label:'테란',   vA: normalize(stA.races.T, Math.max(stA.races.T,stB.races.T,1)), vB: normalize(stB.races.T, Math.max(stA.races.T,stB.races.T,1)) },
      { label:'저그',   vA: normalize(stA.races.Z, Math.max(stA.races.Z,stB.races.Z,1)), vB: normalize(stB.races.Z, Math.max(stA.races.Z,stB.races.Z,1)) },
    ];
    const N = axes.length;
    const cx=120,cy=120,R=90;
    const angleOf = i => (Math.PI*2/N)*i - Math.PI/2;
    const pt = (val,i) => {
      const a=angleOf(i); const r=val*R;
      return `${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`;
    };
    const webPts = (vFn) => axes.map((_,i)=>pt(vFn(i),i)).join(' ');

    // 격자
    let grid='';
    [0.25,0.5,0.75,1].forEach(s=>{
      const pts=axes.map((_,i)=>{const a=angleOf(i);return `${(cx+Math.cos(a)*R*s).toFixed(1)},${(cy+Math.sin(a)*R*s).toFixed(1)}`;}).join(' ');
      grid+=`<polygon points="${pts}" fill="none" stroke="var(--border2)" stroke-width="1"/>`;
    });
    // 축
    const axisLines=axes.map((_,i)=>{const a=angleOf(i);return `<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*R).toFixed(1)}" y2="${(cy+Math.sin(a)*R).toFixed(1)}" stroke="var(--border2)" stroke-width="1"/>`;}).join('');
    // 레이블
    const labels=axes.map((ax,i)=>{
      const a=angleOf(i);const lx=(cx+Math.cos(a)*(R+18)).toFixed(1);const ly=(cy+Math.sin(a)*(R+18)).toFixed(1);
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="var(--text3)">${ax.label}</text>`;
    }).join('');

    return `<div style="display:flex;justify-content:center;margin:8px 0 4px">
      <svg width="240" height="240" viewBox="0 0 240 240" style="overflow:visible">
        ${grid}${axisLines}
        <polygon points="${webPts(i=>axes[i].vA)}" fill="${colA}" fill-opacity="0.18" stroke="${colA}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="${webPts(i=>axes[i].vB)}" fill="${colB}" fill-opacity="0.18" stroke="${colB}" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>
        ${labels}
      </svg>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;font-size:11px;font-weight:700">
      <span style="color:${colA}">━ ${_b2CompareA}</span>
      <span style="color:${colB}">╌ ${_b2CompareB}</span>
    </div>`;
  };

  let h = `<style>
    .b2cv2-wrap { max-width:800px;margin:0 auto }
    .b2cv2-sel { display:grid;grid-template-columns:1fr 40px 1fr;gap:12px;align-items:center;margin-bottom:16px }
    .b2cv2-header { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px }
    .b2cv2-col { border-radius:12px;padding:14px;text-align:center }
    .b2cv2-h2h { padding:12px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;text-align:center }
    @media(max-width:540px){ .b2cv2-sel{grid-template-columns:1fr} .b2cv2-header{grid-template-columns:1fr 1fr;gap:6px} }
  </style>
  <div class="b2cv2-wrap">
    <div class="b2cv2-sel">
      <div>
        <select onchange="if(this.value===_b2CompareB){this.value=_b2CompareA;return;}; _b2CompareA=this.value;document.getElementById('b2-content').innerHTML=_b2CompareView()"
          style="width:100%;padding:8px 12px;border-radius:10px;border:2px solid ${colA};font-size:13px;font-weight:700;background:var(--white);color:${colA};cursor:pointer">
          ${univOptA}
        </select>
      </div>
      <div style="text-align:center;font-size:18px;font-weight:900;color:var(--text3)">VS</div>
      <div>
        <select onchange="if(this.value===_b2CompareA){this.value=_b2CompareB;return;}; _b2CompareB=this.value;document.getElementById('b2-content').innerHTML=_b2CompareView()"
          style="width:100%;padding:8px 12px;border-radius:10px;border:2px solid ${colB};font-size:13px;font-weight:700;background:var(--white);color:${colB};cursor:pointer">
          ${univOptB}
        </select>
      </div>
    </div>
    ${_b2CompareA === _b2CompareB ? `<div style="text-align:center;padding:10px;color:#b45309;font-size:12px;font-weight:700;background:#fef9c3;border-radius:10px;margin-bottom:8px">⚠️ 같은 대학을 선택하면 비교가 의미 없습니다. 다른 대학을 선택해 주세요.</div>` : ''}`;

  if (stA && stB) {
    // 헤더 카드
    h += `<div class="b2cv2-header">
      <div class="b2cv2-col" style="background:${colA}15;border:2px solid ${colA}44">
        <div style="font-size:22px;font-weight:900;color:${colA}">${stA.total}</div>
        <div style="font-size:12px;color:var(--text3)">총 인원</div>
        ${stA.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stA.wr>=50?'#10b981':'#ef4444'};margin-top:4px">${stA.wr}% 승률</div>`:''}
      </div>
      <div class="b2cv2-col" style="background:${colB}15;border:2px solid ${colB}44">
        <div style="font-size:22px;font-weight:900;color:${colB}">${stB.total}</div>
        <div style="font-size:12px;color:var(--text3)">총 인원</div>
        ${stB.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stB.wr>=50?'#10b981':'#ef4444'};margin-top:4px">${stB.wr}% 승률</div>`:''}
      </div>
    </div>`;

    // 직접 맞대결
    {
      const totalAg = h2h.aw + h2hB.aw;
      const aWpct = totalAg>0?Math.round(h2h.aw/totalAg*100):50;
      const aWr = totalAg>0?Math.round(h2h.aw/totalAg*100):null;
      const bWr = totalAg>0?Math.round(h2hB.aw/totalAg*100):null;
      if (totalAg > 0) {
        h += `<div class="b2cv2-h2h">
          <div style="font-size:12px;font-weight:800;color:var(--text3);margin-bottom:8px">⚔️ 직접 맞대결 전적 <span style="font-size:10px;font-weight:600;color:var(--text3)">(총 ${totalAg}전)</span></div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <div style="text-align:right;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colA}">${h2h.aw}승 ${h2h.al}패</div>
              ${aWr!==null?`<div style="font-size:11px;font-weight:800;color:${aWr>=50?colA:'var(--text3)'}">${aWr}%</div>`:''}
            </div>
            <div style="flex:1;height:14px;border-radius:7px;overflow:hidden;background:var(--border2);display:flex">
              <div style="width:${aWpct}%;background:${colA};height:100%;transition:width .6s ease"></div>
              <div style="width:${100-aWpct}%;background:${colB};height:100%;transition:width .6s ease"></div>
            </div>
            <div style="text-align:left;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colB}">${h2hB.aw}승 ${h2hB.al}패</div>
              ${bWr!==null?`<div style="font-size:11px;font-weight:800;color:${bWr>=50?colB:'var(--text3)'}">${bWr}%</div>`:''}
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px">
            <span style="color:${colA};font-weight:800">${_b2CompareA}</span>
            <span style="color:var(--text3)">${aWpct>50?_b2CompareA+'이 우세':aWpct<50?_b2CompareB+'이 우세':'균형'}</span>
            <span style="color:${colB};font-weight:800">${_b2CompareB}</span>
          </div>
        </div>`;
      } else {
        h += `<div class="b2cv2-h2h" style="color:var(--text3);font-size:12px">
          ⚔️ 직접 맞대결 기록 없음 <span style="font-size:11px">(경기 데이터 누적 시 표시)</span>
        </div>`;
      }
    }

    // 레이더 차트
    h += `<div class="b2cv2-col" style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;padding:14px">
      <div style="font-size:12px;font-weight:800;color:var(--text3);margin-bottom:4px;text-align:center">📡 다차원 비교</div>
      ${radarChart(stA, stB)}
    </div>`;

    // 항목별 비교
    h += `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:8px 0;border-bottom:2px solid var(--border2);margin-bottom:4px">
      <div style="text-align:right;font-size:14px;font-weight:900;color:${colA}">${_b2CompareA}</div>
      <div style="width:60px;text-align:center"></div>
      <div style="text-align:left;font-size:14px;font-weight:900;color:${colB}">${_b2CompareB}</div>
    </div>`;
    h += compareRow('선수 수', stA.tiered.length, stB.tiered.length);
    h += compareRow('직책자', stA.roled.length, stB.roled.length);
    h += compareRow('통산 경기', stA.tg, stB.tg);
    h += compareRow('통산 승', stA.tw, stB.tw);
    h += compareRow(stA.wr!==null?`승률 (${stA.wr}%)`:'승률', stA.wr??0, stB.wr??0);
    h += `<div style="text-align:center;font-size:10px;color:var(--text3);font-weight:700;margin:6px 0 2px">🎮 종족 분포 (전체 ${stA.total}명 / ${stB.total}명 기준)</div>`;
    h += compareRow('🔮 프로토스', stA.races.P, stB.races.P);
    h += compareRow('⚔️ 테란', stA.races.T, stB.races.T);
    h += compareRow('🦎 저그', stA.races.Z, stB.races.Z);
    if (stA.races.N>0 || stB.races.N>0) h += compareRow('❔ 종족 미정', stA.races.N, stB.races.N);
    h += compareRow('최상위 티어', stA.topTier, stB.topTier);

    // 티어 비교
    const allTiers=[...new Set([...Object.keys(stA.tiers),...Object.keys(stB.tiers)])];
    const sortedTiers=(typeof TIERS!=='undefined'?TIERS.filter(t=>allTiers.includes(t)):[]).concat(allTiers.filter(t=>typeof TIERS==='undefined'||!TIERS.includes(t)));
    if (sortedTiers.length) {
      h+=`<div style="margin-top:12px;font-size:12px;font-weight:700;color:var(--text3);text-align:center;margin-bottom:8px">티어별 비교</div>`;
      sortedTiers.forEach(t=>{
        const nA=stA.tiers[t]||0,nB=stB.tiers[t]||0;
        const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
        const tcol=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
        const maxN=Math.max(nA,nB,1);
        h+=`<div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;align-items:center;margin-bottom:6px">
          <div style="display:flex;justify-content:flex-end">
            <div style="height:10px;width:${Math.round(nA/maxN*100)}%;max-width:100%;background:${nA>nB?colA:colA+'88'};border-radius:5px 0 0 5px;min-width:${nA?'8px':'0'}"></div>
          </div>
          <div style="text-align:center;font-size:11px;font-weight:800;padding:2px 6px;border-radius:8px;background:${col};color:${tcol}">${t}</div>
          <div>
            <div style="height:10px;width:${Math.round(nB/maxN*100)}%;max-width:100%;background:${nB>nA?colB:colB+'88'};border-radius:0 5px 5px 0;min-width:${nB?'8px':'0'}"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;margin-bottom:4px">
          <div style="text-align:right;font-size:11px;color:${nA>nB?colA:'var(--text3)'};font-weight:${nA>nB?'800':'400'}">${nA?nA+'명':''}</div>
          <div></div>
          <div style="font-size:11px;color:${nB>nA?colB:'var(--text3)'};font-weight:${nB>nA?'800':'400'}">${nB?nB+'명':''}</div>
        </div>`;
      });
    }

    // 선수 목록
    const _sortPlayers = arr => arr.slice().sort((a,b)=>{
      const ti=typeof TIERS!=='undefined'?TIERS:[];
      const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999)||(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'});
    });
    const _makePlayerList = (st, col) => {
      const tieredHtml = _sortPlayers(st.tiered).map(p=>_b2NameTag(p,col,true)).join('');
      const roledHtml = st.roled.length ? `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border2)">${st.roled.map(p=>_b2NameTag(p,col,false)).join('')}</div>` : '';
      return tieredHtml + roledHtml;
    };
    h+=`<div style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:12px;margin-top:14px">
      <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:10px;text-align:center">👥 선수 명단 (클릭하여 상세 보기)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:12px;font-weight:900;color:${colA};margin-bottom:6px;text-align:center;padding:4px 8px;background:${colA}14;border-radius:8px">${_b2CompareA} · ${stA.tiered.length}명</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${_makePlayerList(stA, colA)}</div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:900;color:${colB};margin-bottom:6px;text-align:center;padding:4px 8px;background:${colB}14;border-radius:8px">${_b2CompareB} · ${stB.tiered.length}명</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${_makePlayerList(stB, colB)}</div>
        </div>
      </div>
    </div>`;
  }

  h += `</div>`;
  return h;
}
/* ══════════════════════════════════════
   🌡️ 히트맵 뷰 v2 — 승률 모드 + 정렬 버튼
══════════════════════════════════════ */
window._b2HeatmapMode = window._b2HeatmapMode || 'count';
window._b2HeatmapSortRow = window._b2HeatmapSortRow || 'name';
window._b2HeatmapSortCol = window._b2HeatmapSortCol || 'tier';

