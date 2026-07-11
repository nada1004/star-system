// ══════════════════════════════════════════════════════════
// board2-briefing-data.js — 브리핑 데이터 집계/계산 헬퍼
// board2-briefing.js 에서 분리됨
// 의존: constants.js (players, univCfg 등 전역)
// ══════════════════════════════════════════════════════════

// ─── 순수 계산 헬퍼 (board2-briefing.js의 거대 함수에서 분리) ─────
// [REFACTOR] _b2WeeklyBriefingView()가 약 2200줄짜리 단일 함수라 유지보수가 어렵습니다.
// 전체를 한번에 쪼개는 건 서로 얽힌 지역변수가 많아 위험이 커서, 우선 외부 상태에
// 의존하지 않는 "순수 함수"만 안전하게 여기로 옮겼습니다. (동작 변화 없음)

// 연승/연패 스트릭 — 기간 내 최근 경기부터 거슬러 올라가며 연속 결과 카운트
function _b2CalcStreak(hist, want) {
  const sorted = [...hist].sort((a, b) => {
    const da = parseInt(String(a.date||'').replace(/[-\.\/]/g,''))||0;
    const db = parseInt(String(b.date||'').replace(/[-\.\/]/g,''))||0;
    return db!==da ? db-da : (b.time||0)-(a.time||0);
  });
  let streak = 0;
  for (const h of sorted) {
    if (h.result === want) streak++;
    else break;
  }
  return streak;
}

// 대학 랭킹 정렬 기준: 승 수 → 승률 → 총 전적 → 활동 인원 → 이름
function _b2RankSortUnivs(a, b) {
  return (b.tw - a.tw) ||
    ((b.wr ?? -1) - (a.wr ?? -1)) ||
    (b.tg - a.tg) ||
    (b.active.length - a.active.length) ||
    String(a.u?.name || '').localeCompare(String(b.u?.name || ''), 'ko', { sensitivity: 'base' });
}

// 현재 기간 대학 통계(list)에 순위(rank)와 이전 기간(prevList) 대비 순위 변동(rankDelta)을 붙여서 반환
function _b2BuildRankedUnivs(list, prevList) {
  const prevRankMap = {};
  (prevList || [])
    .filter(ud => ud.tg > 0)
    .slice()
    .sort(_b2RankSortUnivs)
    .forEach((ud, idx) => { prevRankMap[ud.u.name] = idx + 1; });
  return (list || [])
    .filter(ud => ud.tg > 0)
    .slice()
    .sort(_b2RankSortUnivs)
    .map((ud, idx) => {
      const rank = idx + 1;
      const prevRank = prevRankMap[ud.u.name] || null;
      const rankDelta = prevRank ? (prevRank - rank) : null;
      return { ...ud, rank, prevRank, rankDelta };
    });
}

// MVP/최악 카드 HTML 빌더 (풀배경 사진형) — board2-briefing.js의 거대 함수에서 분리.
// opts: { isMonthly, mvpLabel, mvpFxStyleAttr, mvpFxDesign, mvpFxOp }
function _b2BuildMvpCardHtml(s, rank, isWorst, extraClass, opts) {
  if (!s) return '';
  const o = opts || {};
  const isMonthly = !!o.isMonthly;
  const mvpLabel = o.mvpLabel || 'MVP';
  const mvpFxStyleAttr = o.mvpFxStyleAttr;
  const mvpFxDesign = o.mvpFxDesign;
  const mvpFxOp = o.mvpFxOp;

  const mp = s.p;
  const tc  = typeof getTierBtnColor==='function'&&mp.tier?getTierBtnColor(mp.tier):'#475569';
  const tt  = typeof getTierBtnTextColor==='function'&&mp.tier?(getTierBtnTextColor(mp.tier)||'#fff'):'#fff';
  const photo = mp.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(mp.photo):mp.photo) : '';
  const initial = String(mp.name||'-').trim().slice(0,1);
  const nameEsc = String(mp.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");

  const cardClass = isWorst ? 'b2w2-mvp-worst' : (rank===1 ? 'b2w2-mvp-first' : 'b2w2-mvp-second');
  const _isMini = extraClass === 'b2w2-mvp-card-mini';
  const badgeText = _isMini
    ? (isWorst ? '3등' : (rank===1 ? '1등' : '2등'))
    : (isWorst ? (isMonthly?'이달의 최악':'이번주 최악') : (rank===1 ? mvpLabel : (isMonthly?'이달의 2위':'이번주 2위')));
  const badgeEmoji = isWorst ? '💀' : (rank===1 ? '🏆' : '🥈');

  const winColor   = 'b2w2-mvp-sv-win';
  const lossColor  = 'b2w2-mvp-sv-loss';
  const rateColor  = 'b2w2-mvp-sv-rate';

  const _statItem = (val, label, colorClass) =>
    `<span class="b2w2-mvp-stat"><b class="b2w2-mvp-sv ${colorClass}">${val}</b><i class="b2w2-mvp-sl">${label}</i></span>`;
  const _sep = `<span class="b2w2-mvp-statline-sep"></span>`;

  const statsHtml = isWorst
    ? `${_statItem(s.losses,'패',lossColor)}${_sep}${_statItem(s.wins,'승',winColor)}${_sep}${_statItem((s.winRate??0)+'%','승률',rateColor)}`
    : `${_statItem(s.wins,'승',winColor)}${_sep}${_statItem(s.losses,'패',lossColor)}${_sep}${_statItem((s.winRate??0)+'%','승률',rateColor)}`;

  return `<div class="b2w2-mvp-card ${cardClass}${extraClass ? ' '+extraClass : ''}" data-fx="${mvpFxStyleAttr}" data-design="${mvpFxDesign}" style="--b2mvp-fx-op:${mvpFxOp}" onclick="openPlayerModal('${nameEsc}')">
    ${photo
      ? `<img class="b2w2-mvp-bg" src="${photo}" alt="${mp.name||''}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : ''}
    <div class="b2w2-mvp-bg-fallback" style="${photo?'display:none':''}">${initial}</div>
    <div class="b2w2-mvp-overlay"></div>
    <div class="b2w2-mvp-top-badge">${mvpFxDesign==='ribbon' ? badgeText : `${badgeEmoji} ${badgeText}`}</div>
    <div class="b2w2-mvp-bottom">
      <div class="b2w2-mvp-id">
        <div class="b2w2-mvp-name">${mp.name||'-'}</div>
        <div class="b2w2-mvp-meta">
          <span class="b2w2-mvp-univ">${String(mp.univ||'무소속')}</span>
          ${mp.tier?`<span class="b2w2-mvp-tier" style="background:${tc};color:${tt}">${mp.tier}</span>`:''}
        </div>
      </div>
      <div class="b2w2-mvp-statline">
        ${statsHtml}
        <div class="b2w2-mvp-statline-form">${_b2WeeklyForm(s.hist)}</div>
      </div>
    </div>
  </div>`;
}

// ─── 데이터 집계 헬퍼 ─────────────────────────
// [PERF] _b2WeeklyAggregate는 브리핑(현재/이전 기간)과 대학별 화면 등에서
// render()가 다시 호출될 때마다 미니게임/CK/대회/개인전/끝장전 등 모든 경기 배열을
// 처음부터 다시 훑습니다. 실제로 선수 목록·기간·저장 데이터가 바뀌지 않았다면
// 결과가 동일하므로, (선수 이름 목록 + 기간 + 마지막 저장 시각) 서명이 같으면
// 캐시된 결과를 재사용하도록 했습니다. (players-tier-rank.js의 _tierRecByNameCache와 동일한 접근)
const _b2WeeklyAggregateCache = [];
const _B2_WEEKLY_AGG_CACHE_MAX = 4;
function _b2WeeklyAggregate(players, dateFrom, dateTo) {
  let cacheKey = null;
  try {
    let saveSig = '';
    try { saveSig = String(localStorage.getItem('su_last_save_time') || ''); } catch(e) {}
    // 선수 수만 비교하면 "같은 인원, 다른 구성"을 같다고 오판할 수 있어 이름을 이어붙여 서명으로 사용합니다.
    const namesSig = players.map(p => p && p.name).join(',');
    cacheKey = `${dateFrom}|${dateTo}|${saveSig}|${namesSig}`;
    const hit = _b2WeeklyAggregateCache.find(e => e.key === cacheKey);
    if (hit) return hit.result;
  } catch(e) { cacheKey = null; }

  const result = _b2WeeklyAggregateCompute(players, dateFrom, dateTo);

  if (cacheKey) {
    _b2WeeklyAggregateCache.push({ key: cacheKey, result });
    if (_b2WeeklyAggregateCache.length > _B2_WEEKLY_AGG_CACHE_MAX) _b2WeeklyAggregateCache.shift();
  }
  return result;
}

function _b2WeeklyAggregateCompute(players, dateFrom, dateTo) {
  const dateNum = s => parseInt(String(s || '').replace(/[-\.\/]/g, '')) || 0;
  const fromN = dateNum(dateFrom), toN = dateNum(dateTo);
  const inRange = d => { const dn = dateNum(d); return dn >= fromN && dn <= toN; };
  const isOff   = mode => { const m = String(mode||'').trim(); return m && !['스폰서','스크리미지','연습',''].includes(m); };
  // 브리핑 집계 제외 모드: 개인전 / 끝장전 / 프로리그 기록은 반영하지 않음
  const isBriefingExcluded = mode => {
    const m = String(mode||'').trim();
    return m.indexOf('프로리그') !== -1 || m.indexOf('개인전') !== -1 || m.indexOf('끝장전') !== -1;
  };

  // ── 외부 소스에서 플레이어별 경기 목록 구성 ──────────────────
  // key: playerName → [{date,result,oppRace,mode}]
  const extMap = {};
  const addExt = (name, date, result, oppRace, mode) => {
    if (!name || !date || !result) return;
    if (!inRange(date)) return;
    if (isBriefingExcluded(mode)) return;
    if (!extMap[name]) extMap[name] = [];
    extMap[name].push({ date, result, oppRace: oppRace||'', mode: mode||'' });
  };
  const _b2TeamNames = (side) => {
    if (Array.isArray(side)) {
      return side.map(x => {
        if (x && typeof x === 'object') return String(x.name || '').trim();
        return String(x || '').trim();
      }).filter(Boolean);
    }
    return String(side || '').split(/[,+，]/).map(x => x.trim()).filter(Boolean);
  };
  const _b2AddTeamGameExt = (game, date, modeLabel) => {
    if (!game || !date || !game.winner) return;
    const teamA = (Array.isArray(game.teamA) && game.teamA.length)
      ? _b2TeamNames(game.teamA)
      : (game.a1 || game.a2)
        ? [game.a1, game.a2].filter(Boolean)
        : _b2TeamNames(game.playerA);
    const teamB = (Array.isArray(game.teamB) && game.teamB.length)
      ? _b2TeamNames(game.teamB)
      : (game.b1 || game.b2)
        ? [game.b1, game.b2].filter(Boolean)
        : _b2TeamNames(game.playerB);
    if (teamA.length >= 2 && teamB.length >= 2) {
      const winTeam = game.winner === 'A' ? teamA : teamB;
      const loseTeam = game.winner === 'A' ? teamB : teamA;
      winTeam.forEach(name => addExt(name, date, '승', '', modeLabel));
      loseTeam.forEach(name => addExt(name, date, '패', '', modeLabel));
      return true;
    }
    return false;
  };

  // 개인전 (indM)
  try { (typeof indM!=='undefined'&&Array.isArray(indM)?indM:[]).forEach(m=>{
    if (!m || !m.d || !m.wName || !m.lName) return;
    const wp = players.find(p=>p.name===m.wName), lp = players.find(p=>p.name===m.lName);
    addExt(m.wName, m.d, '승', lp?.race||'', m.mode||'개인전');
    addExt(m.lName, m.d, '패', wp?.race||'', m.mode||'개인전');
  }); } catch(e){}

  // 끝장전 (gjM)
  try { (typeof gjM!=='undefined'&&Array.isArray(gjM)?gjM:[]).forEach(m=>{
    if (!m || !m.d || !m.wName || !m.lName) return;
    if (m._proLabel) return;
    const wp = players.find(p=>p.name===m.wName), lp = players.find(p=>p.name===m.lName);
    addExt(m.wName, m.d, '승', lp?.race||'', m.mode||'끝장전');
    addExt(m.lName, m.d, '패', wp?.race||'', m.mode||'끝장전');
  }); } catch(e){}

  // 티어대회 (ttM)
  try { (typeof ttM!=='undefined'&&Array.isArray(ttM)?ttM:[]).forEach(m=>{
    if (!m || !m.d) return;
    (m.sets||[]).forEach(s=>{
      (s.games||[]).forEach(g=>{
        if (_b2AddTeamGameExt(g, m.d, '티어대회')) return;
        if (!g || !g.playerA || !g.playerB || !g.winner) return;
        const pA = players.find(p=>p.name===g.playerA), pB = players.find(p=>p.name===g.playerB);
        const wA = g.winner==='A', wB = g.winner==='B';
        addExt(g.playerA, m.d, wA?'승':'패', pB?.race||'', '티어대회');
        addExt(g.playerB, m.d, wB?'승':'패', pA?.race||'', '티어대회');
      });
    });
  }); } catch(e){}

  // 팀전 (miniM/univM/ckM/proM) - 게임 단위 개인 전적 집계
  const _scanTeamMatches = (arr, modeLabel) => {
    try { (Array.isArray(arr)?arr:[]).forEach(m=>{
      if (!m || !m.d) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if (!g || !g.winner) return;
          if (_b2AddTeamGameExt(g, m.d, modeLabel)) return;
          // 개인전 형식 (playerA/B)
          if (g.playerA && g.playerB) {
            const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
            addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', modeLabel);
            addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', modeLabel);
          }
        });
      });
    }); } catch(e){}
  };
  _scanTeamMatches(typeof miniM!=='undefined'?miniM:[], '미니대전');
  _scanTeamMatches(typeof univM!=='undefined'?univM:[], '대학대전');
  _scanTeamMatches(typeof ckM!=='undefined'?ckM:[], '대학CK');

  // 대회 (tourneys) - 조별/브라켓/일반
  try { (typeof tourneys!=='undefined'&&Array.isArray(tourneys)?tourneys:[]).forEach(tn=>{
    // 조별리그
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if (!m || !m.d) return;
        (m.sets||[]).forEach(s=>{
          (s.games||[]).forEach(g=>{
            if (_b2AddTeamGameExt(g, m.d, '대회')) return;
            if (!g || !g.playerA || !g.playerB || !g.winner) return;
            const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
            addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', '대회');
            addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', '대회');
          });
        });
      });
    });
    // 브라켓
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if (!m || !m.d) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if (_b2AddTeamGameExt(g, m.d, '대회')) return;
          if (!g || !g.playerA || !g.playerB || !g.winner) return;
          const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
          addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', '대회');
          addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', '대회');
        });
      });
    });
    // 일반 경기
    (tn.normalMatches||[]).forEach(m=>{
      if (!m || !m.d) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if (_b2AddTeamGameExt(g, m.d, '대회')) return;
          if (!g || !g.playerA || !g.playerB || !g.winner) return;
          const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
          addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', '대회');
          addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', '대회');
        });
      });
    });
  }); } catch(e){}

  return players.map(p => {
    // p.history (직접 기록) + 외부 소스 경기 합산
    const phist = (Array.isArray(p.history) ? p.history : [])
      .filter(h => inRange(h.date || h.d || '') && !isBriefingExcluded(h.mode || h.label || h.type || h.kind || h.cat || ''));
    const extHist = (extMap[p.name] || []).filter(h => !isBriefingExcluded(h.mode || ''));

    // 중복 제거: p.history에 이미 있는 날짜+결과+oppRace 조합은 외부에서 제외
    const histKeys = new Set(phist.map(h => `${h.date||h.d||''}|${h.result||''}`));
    const extFiltered = extHist.filter(h => !histKeys.has(`${h.date||''}|${h.result||''}`));

    const hist = [...phist, ...extFiltered];
    const wins   = hist.filter(h => h.result === '승').length;
    const losses = hist.filter(h => h.result === '패').length;
    const total  = wins + losses;
    const offH   = hist.filter(h => isOff(h.mode));
    const spH    = hist.filter(h => !isOff(h.mode));
    // 종족별 상대 전적
    const vsRace = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    hist.forEach(h => {
      const r = String(h.oppRace||'').trim().toUpperCase();
      if (vsRace[r]) { h.result==='승' ? vsRace[r].w++ : vsRace[r].l++; }
    });
    return {
      p, wins, losses, total, winRate: total ? Math.round(wins/total*100) : null,
      offWins: offH.filter(h=>h.result==='승').length, offLosses: offH.filter(h=>h.result==='패').length,
      spWins:  spH.filter(h=>h.result==='승').length,  spLosses:  spH.filter(h=>h.result==='패').length,
      vsRace, hist
    };
  });
}

// ─── 유니브 집계 ──────────────────────────────
function _b2WeeklyUnivStats(players, dateFrom, dateTo, univList, sortBy) {
  const stats = _b2WeeklyAggregate(players, dateFrom, dateTo);
  const result = univList.map(u => {
    const members = stats.filter(s => String(s.p?.univ||'').trim() === u.name);
    const active  = members.filter(s => s.total > 0);
    const tw = active.reduce((a,s)=>a+s.wins,0);
    const tl = active.reduce((a,s)=>a+s.losses,0);
    const tg = tw + tl;
    const raceCount = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    active.forEach(s => { ['P','T','Z'].forEach(r => { raceCount[r].w+=s.vsRace[r].w; raceCount[r].l+=s.vsRace[r].l; }); });
    return { u, members, active, tw, tl, tg, wr: tg ? Math.round(tw/tg*100) : null, raceCount };
  });
  // sortBy: 'winrate' → 승률순(경기수 0인 대학은 맨 뒤로), 그 외(기본) → 전적순
  if (sortBy === 'winrate') {
    return result.sort((a,b) => (b.wr ?? -1) - (a.wr ?? -1) || b.tg - a.tg);
  }
  return result.sort((a,b) => b.tg - a.tg);
}

// ─── MVP 선정 ─────────────────────────────────
function _b2WeeklyMVP(univStats) {
  let best = null, bestScore = -1;
  univStats.forEach(ud => {
    ud.active.forEach(s => {
      if (s.total < 3) return; // 최소 3경기
      if (String(s.p?.gender||'').trim() !== 'F') return;
      const score = s.wins * 3 + (s.total > 0 ? (s.wins/s.total)*10 : 0) + (s.offWins * 2);
      if (score > bestScore) { bestScore = score; best = s; }
    });
  });
  return best;
}
// ─── MVP 2위 선정 ─────────────────────────────
function _b2WeeklyMVP2(univStats, mvp1) {
  let best = null, bestScore = -1;
  const mvp1Name = mvp1?.p?.name || null;
  univStats.forEach(ud => {
    ud.active.forEach(s => {
      if (s.total < 3) return;
      if (String(s.p?.gender||'').trim() !== 'F') return;
      if (mvp1Name && s.p?.name === mvp1Name) return; // MVP 1위 제외
      const score = s.wins * 3 + (s.total > 0 ? (s.wins/s.total)*10 : 0) + (s.offWins * 2);
      if (score > bestScore) { bestScore = score; best = s; }
    });
  });
  return best;
}
// ─── 이번주 최악(최다 패배) 선정 ──────────────
function _b2WeeklyWorst(univStats) {
  let worst = null, worstScore = -1;
  univStats.forEach(ud => {
    ud.active.forEach(s => {
      if (s.total < 2) return; // 최소 2경기
      if (String(s.p?.gender||'').trim() !== 'F') return;
      // 패배 수 우선, 동률이면 낮은 승률
      const score = s.losses * 3 + (s.total > 0 ? ((s.total - s.wins)/s.total)*10 : 0);
      if (score > worstScore) { worstScore = score; worst = s; }
    });
  });
  return worst;
}

// ─── 대학별 MVP ───────────────────────────────
function _b2WeeklyUnivMVP(active) {
  const candidates = (Array.isArray(active) ? active : [])
    .filter(s => s && s.total > 0)
    .map(s => {
      const netWins = (s.wins || 0) - (s.losses || 0);
      const winRate = s.total > 0 ? (s.winRate ?? Math.round((s.wins || 0) / s.total * 100)) : null;
      const offTotal = (s.offWins || 0) + (s.offLosses || 0);
      return {
        ...s,
        netWins,
        offTotal,
        aceQualified: (s.total >= 3) && ((winRate ?? 0) >= 50) && (netWins >= 1),
        aceScore: netWins * 100 + (winRate ?? 0) * 2 + offTotal * 4 + (s.wins || 0)
      };
    });
  const sorter = (a, b) =>
    (b.aceScore - a.aceScore) ||
    (b.netWins - a.netWins) ||
    ((b.winRate ?? -1) - (a.winRate ?? -1)) ||
    (b.offTotal - a.offTotal) ||
    (b.total - a.total) ||
    (b.wins - a.wins);
  const qualified = candidates.filter(s => s.aceQualified).sort(sorter);
  if (qualified.length) return qualified[0];
  return null;
}

// ─── MVP 수상 기록 저장/조회 (주간/월간 MVP 횟수 · 시점 · 소속 추적) ──
const _B2_MVP_HISTORY_KEY = 'su_mvp_history_v1';
function _b2MvpHistoryLoad() {
  try {
    const raw = localStorage.getItem(_B2_MVP_HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}
function _b2MvpHistorySave(arr) {
  try {
    localStorage.setItem(_B2_MVP_HISTORY_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
  } catch (e) {}
}
// 과거 UTC 변환 버그(하루씩 밀림) + type:from:to 키로 인한 중복 적립 버그로
// 이미 저장된 기록은 날짜가 틀어져 있어 신뢰할 수 없다. 1회에 한해 초기화하고
// 이후로는 고쳐진 로직으로 다시 쌓이게 한다.
// v4: 1월 1일부터 전체 주간/월간을 소급 계산해 새로 채우면서, v3 이후에도 남아있던
// 하루씩 밀린 구식 레코드(예: month:2026-06-30, month:2026-05-31)를 한 번 더 정리한다.
const _B2_MVP_HISTORY_MIGRATION_FLAG = 'su_mvp_history_reset_v4';
(function _b2MvpHistoryMigrateOnce() {
  try {
    if (localStorage.getItem(_B2_MVP_HISTORY_MIGRATION_FLAG)) return;
    localStorage.removeItem(_B2_MVP_HISTORY_KEY);
    localStorage.setItem(_B2_MVP_HISTORY_MIGRATION_FLAG, '1');
  } catch (e) {}
})();
// preset(thisWeek/lastWeek/thisMonth/lastMonth) 또는 'week'/'month'를 직접 넘겨서
// 실제 집계 기간(dateFrom~dateTo)의 MVP를 기록/갱신한다. 같은 기간(type+from)은 항상
// 최신 결과로 덮어써서 진행 중인 이번주/이번달의 MVP가 바뀌어도 최종적으로 정확한
// 값이 남도록 한다. 소급 계산(1월부터 전체 주/달)도 이 함수를 그대로 사용한다.
function _b2SyncMvpHistory(preset, dateFrom, dateTo, mvpStat) {
  const type = (preset === 'week' || preset === 'thisWeek' || preset === 'lastWeek') ? 'week'
    : (preset === 'month' || preset === 'thisMonth' || preset === 'lastMonth') ? 'month'
    : null;
  if (!type || !dateFrom || !dateTo) return;
  // 기간 시작일(from)만으로 키를 잡는다. 진행 중인 이번주/이번달은 매일 to가 바뀌므로,
  // to까지 키에 넣으면 같은 주/달인데도 하루마다 새 레코드가 쌓이는 버그가 있었다.
  const key = `${type}:${dateFrom}`;
  const arr = _b2MvpHistoryLoad();
  const idx = arr.findIndex(e => e && e.key === key);
  if (!mvpStat || !mvpStat.p || !mvpStat.p.name) {
    if (idx >= 0) { arr.splice(idx, 1); _b2MvpHistorySave(arr); }
    return;
  }
  const entry = {
    key, type, from: dateFrom, to: dateTo,
    name: String(mvpStat.p.name || '').trim(),
    univ: String(mvpStat.p.univ || '').trim() || '무소속',
    wins: mvpStat.wins || 0,
    losses: mvpStat.losses || 0,
    updatedAt: Date.now()
  };
  if (idx >= 0) arr[idx] = entry; else arr.push(entry);
  if (arr.length > 500) arr.splice(0, arr.length - 500);
  _b2MvpHistorySave(arr);
}
// 특정 선수의 MVP 수상 이력 조회 (주간/월간 횟수 + 시점별 소속 목록, 최신순)
function _b2GetPlayerMvpStats(playerName) {
  const nm = String(playerName || '').trim();
  if (!nm) return { weekCount: 0, monthCount: 0, entries: [] };
  const raw = _b2MvpHistoryLoad()
    .filter(e => e && String(e.name || '').trim() === nm);
  // 방어적 중복 제거: 저장 로직이 바뀌기 전에 쌓인 레코드나 여러 경로에서 동시에
  // 기록된 레코드가 남아 있어도, 같은 기간(type+from)은 항상 최신 것 하나만 노출한다.
  const byPeriod = new Map();
  raw.forEach(e => {
    const pk = `${e.type}:${String(e.from || '').slice(0, 10)}`;
    const prev = byPeriod.get(pk);
    if (!prev || (e.updatedAt || 0) >= (prev.updatedAt || 0)) byPeriod.set(pk, e);
  });
  const mine = [...byPeriod.values()]
    .sort((a, b) => String(b.from || '').localeCompare(String(a.from || '')));
  return {
    weekCount: mine.filter(e => e.type === 'week').length,
    monthCount: mine.filter(e => e.type === 'month').length,
    entries: mine
  };
}
// 시즌 시작일(2026-01-01)부터 현재까지의 모든 "주간"(월~일 7일 단위) 구간을 생성한다.
function _b2GenAllWeekRanges(seasonStartStr){
  const seasonStart = new Date(seasonStartStr + 'T00:00:00');
  const day = seasonStart.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const firstMon = new Date(seasonStart);
  firstMon.setDate(seasonStart.getDate() + diffToMon);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ranges = [];
  const cur = new Date(firstMon);
  let guard = 0;
  while (cur <= now && guard < 600) { // 넉넉히 600주(약 11년)까지 방어
    const sun = new Date(cur);
    sun.setDate(cur.getDate() + 6);
    // _b2GenAllMonthRanges의 isCurrent 처리와 동일: 오늘이 포함된 "진행 중인 주"는
    // 아직 일요일이 지나지 않았으므로 미래 날짜(일요일)가 아니라 오늘까지만 집계 구간으로
    // 잡는다. 이걸 빠뜨리면 이번주가 끝나지도 않았는데 이미 확정된 주(월~일 전체)처럼
    // MVP 이력에 저장되어, 이후 매일 경기가 추가될 때마다 "이미 끝난 것처럼 보였던"
    // 같은 기간의 MVP가 다른 선수로 조용히 바뀌는 것처럼 보이는 원인이 된다.
    const isCurrentWeek = today >= cur && today <= sun;
    const to = isCurrentWeek ? today : sun;
    ranges.push({ from: _b2FmtLocalYMD(cur), to: _b2FmtLocalYMD(to) });
    cur.setDate(cur.getDate() + 7);
    guard++;
  }
  return ranges;
}
// 시즌 시작월(2026-01)부터 현재까지의 모든 "월간"(1월/2월/3월... 달력 기준) 구간을 생성한다.
// 진행 중인 이번 달은 월초~오늘까지, 이미 지난 달은 1일~말일 전체로 잡는다.
function _b2GenAllMonthRanges(seasonStartStr){
  const seasonStart = new Date(seasonStartStr + 'T00:00:00');
  const now = new Date();
  const ranges = [];
  let y = seasonStart.getFullYear(), m = seasonStart.getMonth();
  let guard = 0;
  while ((y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth())) && guard < 200) {
    const isCurrent = (y === now.getFullYear() && m === now.getMonth());
    const from = new Date(y, m, 1);
    const to = isCurrent ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : new Date(y, m + 1, 0);
    ranges.push({ from: _b2FmtLocalYMD(from), to: _b2FmtLocalYMD(to) });
    m++; if (m > 11) { m = 0; y++; }
    guard++;
  }
  return ranges;
}
const _B2_MVP_SEASON_START = '2026-01-01';
// 브리핑 탭에 들어가지 않아도 스트리머탭/상세팝업에서 바로 전체 MVP 현황을 볼 수 있도록,
// 2026년 1월 1일부터 현재까지의 모든 주간/월간 MVP를 그 자리에서 즉시 계산해 기록을 최신화한다.
// (기존에는 이번주·저번주·이번달·지난달, 총 4개 구간만 계산해서 상세 팝업에 최근 기록만 보였음)
// 지금의 생성 로직(_b2GenAllWeekRanges/_b2GenAllMonthRanges)으로는 절대 나올 수 없는
// 키를 가진 레코드를 정리한다. 예전 UTC 변환 버그 시절 하루 밀려 저장된
// "month:2026-06-30", "month:2026-05-31" 같은 유령 레코드가 대표적인 예 —
// 새 로직이 "month:2026-06-01"/"month:2026-07-01"로 다시 채워도 옛 키는 아무도
// 지우지 않아 팝업 MVP 기록에 날짜가 이상한 항목으로 계속 남아있었다.
function _b2PruneStaleMvpHistory(validKeys) {
  try {
    const arr = _b2MvpHistoryLoad();
    const kept = arr.filter(e => e && validKeys.has(e.key));
    if (kept.length !== arr.length) _b2MvpHistorySave(kept);
  } catch (e) {}
}
let _b2MvpHistoryFreshAt = 0;
function _b2EnsureMvpHistoryFresh(force){
  try{
    const now = Date.now();
    if(!force && _b2MvpHistoryFreshAt && (now - _b2MvpHistoryFreshAt) < 60000) return; // 1분 내 재계산 스킵
    if(typeof players === 'undefined' || !Array.isArray(players)) return;
    if(typeof _b2WeeklyUnivStats !== 'function' || typeof _b2WeeklyMVP !== 'function') return;
    const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : [])
      .filter(u => u.dissolved || u.hidden).map(u => String(u.name||'').trim()));
    const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet.has(String(p?.univ||'').trim()));
    const univList = (typeof _b2VisUnivs === 'function' ? _b2VisUnivs() : []).filter(u => u.name && u.name !== '무소속');
    const weekRanges = _b2GenAllWeekRanges(_B2_MVP_SEASON_START);
    const monthRanges = _b2GenAllMonthRanges(_B2_MVP_SEASON_START);
    const validKeys = new Set();
    weekRanges.forEach(r => {
      validKeys.add(`week:${r.from}`);
      const stats = _b2WeeklyUnivStats(vis, r.from, r.to, univList);
      const mvp = _b2WeeklyMVP(stats);
      _b2SyncMvpHistory('week', r.from, r.to, mvp);
    });
    monthRanges.forEach(r => {
      validKeys.add(`month:${r.from}`);
      const stats = _b2WeeklyUnivStats(vis, r.from, r.to, univList);
      const mvp = _b2WeeklyMVP(stats);
      _b2SyncMvpHistory('month', r.from, r.to, mvp);
    });
    _b2PruneStaleMvpHistory(validKeys);
    _b2MvpHistoryFreshAt = now;
  }catch(e){}
}
try {
  window._b2EnsureMvpHistoryFresh = _b2EnsureMvpHistoryFresh;
  window._b2GenAllWeekRanges = _b2GenAllWeekRanges;
  window._b2GenAllMonthRanges = _b2GenAllMonthRanges;
} catch (e) {}
try {
  window._b2MvpHistoryLoad = _b2MvpHistoryLoad;
  window._b2SyncMvpHistory = _b2SyncMvpHistory;
  window._b2GetPlayerMvpStats = _b2GetPlayerMvpStats;
} catch (e) {}

// ─── MVP 아카이브 리스트 렌더 (브리핑 탭의 'MVP 아카이브' 모드에서 사용) ──
// 시즌 시작부터 지금까지 쌓인 su_mvp_history_v1 전체 기록을, 종류(주간/월간)와
// 대학 필터에 맞춰 카드 그리드로 그려준다. 기존 "대학별 에이스" 카드(b2w2-ace-*)
// 스타일을 그대로 재사용해 새 CSS 없이 톤을 맞췄다.
function _b2RenderMvpArchiveBody(entries, typeFilter, univFilter, univList) {
  const fmtD = s => String(s || '').slice(0, 10).replace(/-/g, '.');
  const filtered = (Array.isArray(entries) ? entries : []).filter(e => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (univFilter !== '전체' && String(e.univ || '').trim() !== univFilter) return false;
    return true;
  });
  const _typeBtn = (key, label) => `<button type="button" class="b2w2-preset${typeFilter===key?' on':''}" onclick="_b2SetMvpArchiveType('${key}')">${label}</button>`;
  const filterBar = `
    <div class="b2w2-hdr">
      <span style="font-size:16px">🏆</span>
      <span style="font-size:14px;font-weight:900;color:var(--text1)">MVP 아카이브</span>
      <div class="b2w2-presetrow" style="margin:0">
        ${_typeBtn('all','전체')}
        ${_typeBtn('week','주간만')}
        ${_typeBtn('month','월간만')}
      </div>
      <select class="b2w2-sel" onchange="_b2SetMvpArchiveUniv(this.value)">
        <option value="전체"${univFilter==='전체'?' selected':''}>🏫 전체 대학</option>
        ${(univList || []).map(u => {
          const _n = (typeof escAttr === 'function' ? escAttr(u.name) : String(u.name || ''));
          const _nh = (typeof window.escHTML === 'function' ? window.escHTML(u.name) : String(u.name || ''));
          return `<option value="${_n}"${univFilter===u.name?' selected':''}>${_nh}</option>`;
        }).join('')}
      </select>
      <span style="font-size:11px;color:var(--text3);margin-left:auto">총 ${filtered.length}건</span>
      <button type="button" class="b2w2-preset" onclick="(function(){const bodies=[...document.getElementsByClassName('b2w2-mvp-arch-body')];const chevs=[...document.getElementsByClassName('b2w2-mvp-arch-chev')];const anyOpen=bodies.some(b=>b.style.display!=='none');bodies.forEach(b=>{b.style.display=anyOpen?'none':'';});chevs.forEach(c=>{c.textContent=anyOpen?'▶':'▼';});})()">전체 펼치기/접기</button>
    </div>`;

  if (!filtered.length) {
    return `${filterBar}<div class="b2w2-empty"><div style="font-size:28px;margin-bottom:8px">🏆</div>조건에 맞는 MVP 기록이 없습니다.<div style="font-size:11px;margin-top:4px">필터를 변경해보세요</div></div>`;
  }

  const _renderCard = (e) => {
    const col = (typeof gc === 'function' ? (gc(e.univ) || '#64748b') : '#64748b');
    const total = (e.wins || 0) + (e.losses || 0);
    const winRate = total > 0 ? Math.round((e.wins / total) * 1000) / 10 : 0;
    const nameEsc = String(e.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const player = (typeof players !== 'undefined' && Array.isArray(players))
      ? players.find(p => String(p?.name || '').trim() === String(e.name || '').trim())
      : null;
    const photo = player?.photo ? (typeof toHttpsUrl === 'function' ? toHttpsUrl(player.photo) : player.photo) : '';
    const nameSafe = (typeof window.escHTML === 'function' ? window.escHTML(e.name || '') : String(e.name || ''));
    const univSafe = (typeof window.escHTML === 'function' ? window.escHTML(e.univ || '') : String(e.univ || ''));
    const isMonth = e.type === 'month';
    // 주간(파랑) / 월간(골드)로 종류를 한눈에 구분
    const typeBg = isMonth ? 'var(--b2w-gold-soft)' : 'var(--b2w-tag-accent-bg)';
    const typeBorder = isMonth ? 'rgba(184,134,44,.35)' : 'var(--b2w-tag-accent-border)';
    const typeColor = isMonth ? 'var(--b2w-gold)' : 'var(--b2w-accent)';
    return `
      <div class="b2w2-ace-card" style="border-color:${col}22">
        <div class="b2w2-ace-head">
          <div class="b2w2-ace-univ">
            <span class="b2w2-ace-dot" style="background:${col}"></span>
            <span class="b2w2-ace-univ-name">${univSafe}</span>
          </div>
          <span class="b2w2-ace-rank" style="background:${typeBg};border-color:${typeBorder};color:${typeColor};font-weight:900">${isMonth ? '월간' : '주간'} MVP</span>
        </div>
        <div class="b2w2-ace-player">
          <div class="b2w2-ace-player-main">
            <div class="b2w2-ace-photo" style="--_c:${col}">
              ${photo ? `<img src="${photo}" alt="${nameSafe}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
              <div class="b2w2-ace-photo-fallback" style="${photo?'display:none':''}">${String(e.name||'-').trim().slice(0,1)}</div>
            </div>
            <div style="min-width:0">
              <div class="b2w2-ace-player-name" onclick="openPlayerModal('${nameEsc}')">${nameSafe}</div>
              <div class="b2w2-ace-player-sub">
                <span>${e.wins||0}승 ${e.losses||0}패</span>
                <span style="color:${winRate>=60?'var(--green)':winRate>=50?'var(--b2w-accent)':'var(--gray)'}">승률 ${winRate}%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="b2w2-ace-badges">
          <span class="b2w2-ace-badge">${fmtD(e.from)} ~ ${fmtD(e.to)}</span>
        </div>
      </div>`;
  };

  // 기록이 아무리 쌓여도 감당되도록 월별로 묶어서 접이식 섹션으로 보여준다.
  // 최근 2개월은 펼친 채로 시작하고, 그 이전 달은 헤더만 보이다가 클릭하면 펼쳐진다 —
  // "더보기"를 계속 눌러야 하는 방식 대신, 원하는 달을 바로 찾아 열어보는 방식.
  const _groups = new Map();
  filtered.forEach(e => {
    const ym = String(e.from || '').slice(0, 7); // 'YYYY-MM'
    if (!_groups.has(ym)) _groups.set(ym, []);
    _groups.get(ym).push(e);
  });
  const _ymKeys = [..._groups.keys()].sort((a, b) => b.localeCompare(a));
  const sections = _ymKeys.map((ym, idx) => {
    const list = _groups.get(ym);
    const weekN = list.filter(e => e.type === 'week').length;
    const monthN = list.filter(e => e.type === 'month').length;
    const [y, m] = ym.split('-');
    const label = `${y}년 ${parseInt(m, 10)}월`;
    const isOpen = idx < 2; // 최근 2개월은 기본으로 펼침
    const bodyId = `b2w2-mvp-arch-${ym}`;
    const chevId = `b2w2-mvp-arch-chev-${ym}`;
    return `
      <div class="b2w2-card" style="margin-bottom:10px">
        <div class="b2w2-card-head" onclick="(function(){const b=document.getElementById('${bodyId}');const c=document.getElementById('${chevId}');if(!b)return;const show=b.style.display==='none';b.style.display=show?'':'none';if(c)c.textContent=show?'▼':'▶';})()">
          <div class="b2w2-card-title">
            <span class="b2w2-card-dot" style="background:var(--b2w-accent)"></span>
            <div>
              <div class="b2w2-card-name" style="font-size:15px">${label}</div>
              <div class="b2w2-card-sub">
                <span style="color:var(--b2w-accent);font-weight:800">주간 ${weekN}건</span>
                <span style="color:var(--b2w-gold);font-weight:800">월간 ${monthN}건</span>
              </div>
            </div>
          </div>
          <span id="${chevId}" class="b2w2-card-chevron b2w2-mvp-arch-chev">${isOpen ? '▼' : '▶'}</span>
        </div>
        <div id="${bodyId}" class="b2w2-card-body b2w2-mvp-arch-body" style="${isOpen ? '' : 'display:none'}">
          <section class="b2w2-ace-list">${list.map(_renderCard).join('')}</section>
        </div>
      </div>`;
  }).join('');

  const cards = sections;

  return `${filterBar}<div style="margin-top:14px">${cards}</div>`;
}
try { window._b2RenderMvpArchiveBody = _b2RenderMvpArchiveBody; } catch (e) {}

// ─── 티어 뱃지 툴팁(순위 설명) ─────────────────
function _b2TierRankTooltip(tier) {
  try {
    const list = (typeof TIERS !== 'undefined' && Array.isArray(TIERS) && TIERS.length) ? TIERS : ['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스','미정'];
    const idx = list.indexOf(tier);
    const order = list.join(' > ');
    if (idx === -1) return `티어 순위: ${order}`;
    return `티어 순위(높음→낮음): ${order}\n현재 "${tier}" = 상위 ${idx + 1}번째 등급`;
  } catch (e) { return ''; }
}
try { window._b2TierRankTooltip = _b2TierRankTooltip; } catch (e) {}

// ─── 최근 폼 렌더 ─────────────────────────────
function _b2WeeklyForm(hist) {
  const sorted = [...hist].sort((a,b)=>{
    const da=parseInt(String(a.date||'').replace(/[-\.\/]/g,''))||0;
    const db=parseInt(String(b.date||'').replace(/[-\.\/]/g,''))||0;
    return da!==db?da-db:(a.time||0)-(b.time||0);
  }).slice(-5);
  const SLOTS = 5;
  const pad = SLOTS - sorted.length; // 경기 수가 5보다 적으면 앞쪽을 빈 슬롯으로 채워 컬럼 폭 고정
  let out = '';
  for (let i = 0; i < pad; i++) {
    out += `<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:var(--border,#e2e8f0);flex-shrink:0"></span>`;
  }
  out += sorted.map(h => {
    const c = h.result==='승'?'var(--win-col,#dc2626)':h.result==='패'?'var(--lose-col,#2563eb)':'#94a3b8';
    const t = h.result==='승'?'W':h.result==='패'?'L':'-';
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:${c};font-size:9px;color:#fff;font-weight:900;flex-shrink:0">${t}</span>`;
  }).join('');
  return out;
}

// ─── 막대 차트 SVG ────────────────────────────
function _b2WeeklyBarChart(univStats) {
  const visible = univStats.filter(ud => ud.tg > 0).slice(0, 10);
  if (!visible.length) return '';
  const maxGames = Math.max(...visible.map(ud => ud.tg), 1);
  const ROW_H = 34, BAR_H = 13, LEFT = 90, RIGHT = 160, TOP = 14, BOT = 10;
  const H = visible.length * ROW_H + TOP + BOT;
  const MAX_W = 520 - LEFT - RIGHT;

  const rows = visible.map((ud, i) => {
    const y = TOP + i * ROW_H;
    const color = (gc ? gc(ud.u.name) : '#64748b') || '#64748b';
    // 승+패를 하나의 막대에 이어붙여서 그림 — 전체 길이(=totalW)가 팀 간 총 전적 비교 기준이 됨
    const totalW = Math.max(2, Math.round(ud.tg / maxGames * MAX_W));
    const winW   = ud.tg > 0 ? Math.round(totalW * ud.tw / ud.tg) : 0;
    const lossW  = Math.max(0, totalW - winW);
    const wr = ud.wr !== null ? `${ud.wr}%` : '-';
    const wrColor = ud.wr===null?'#94a3b8':ud.wr>=60?'#10b981':ud.wr>=40?'#f59e0b':'#ef4444';
    const name = ud.u.name.length > 6 ? ud.u.name.slice(0,6)+'…' : ud.u.name;
    const clipId = `b2wbar-clip-${i}`;
    return `
      <text x="${LEFT-6}" y="${y+BAR_H*0.9}" text-anchor="end" font-size="11" font-weight="700" fill="var(--text2)">${name}</text>
      <defs><clipPath id="${clipId}"><rect x="${LEFT}" y="${y}" width="${totalW}" height="${BAR_H}" rx="4"/></clipPath></defs>
      <rect x="${LEFT}" y="${y}" width="${MAX_W}" height="${BAR_H}" rx="4" fill="var(--border,#e2e8f0)" opacity="0.35"/>
      <g clip-path="url(#${clipId})">
        ${winW>0?`<rect x="${LEFT}" y="${y}" width="${winW}" height="${BAR_H}" fill="${color}"/>`:''}
        ${lossW>0?`<rect x="${LEFT+winW}" y="${y}" width="${lossW}" height="${BAR_H}" fill="${color}" opacity="0.32"/>`:''}
      </g>
      <text x="${LEFT}" y="${y+BAR_H+12}" font-size="10" font-weight="800" fill="${color}">${ud.tw}승</text>
      <text x="${LEFT+32}" y="${y+BAR_H+12}" font-size="10" fill="${color}" opacity="0.65">${ud.tl}패</text>
      <text x="${520-RIGHT+8}" y="${y+BAR_H*0.9}" font-size="13" font-weight="900" fill="${wrColor}">${wr}</text>
      <text x="${520-RIGHT+50}" y="${y+BAR_H*0.9}" font-size="11" fill="var(--text3)">${ud.tg}전 ${ud.active.length}명</text>`;
  }).join('');

  return `<div style="width:100%;overflow:hidden;padding:4px 0">
    <svg viewBox="0 0 520 ${H}" width="100%" style="overflow:visible;display:block">
      ${rows}
    </svg>
  </div>`;
}

// ─── 종족별 통계 렌더 ─────────────────────────
function _b2WeeklyRaceStats(raceCount) {
  const races = [
    { key:'P', label:'프로토스', ico:'🔮', color:'#8b5cf6' },
    { key:'T', label:'테란',     ico:'⚔️', color:'#3b82f6' },
    { key:'Z', label:'저그',     ico:'🦎', color:'#f59e0b' }
  ];
  const rows = races.map(({ key, label, ico, color }) => {
    const { w, l } = raceCount[key];
    const t = w + l;
    const wr = t ? Math.round(w/t*100) : null;
    const wrColor = wr===null ? '#94a3b8' : wr>=60 ? '#10b981' : wr>=40 ? '#f59e0b' : '#ef4444';
    return `<div class="b2w2-race-row">
      <div class="b2w2-race-cell b2w2-race-cell-main">
        <span style="font-size:13px;width:20px;text-align:center;flex-shrink:0">${ico}</span>
        <span style="font-size:11px;font-weight:800;color:var(--text2);white-space:nowrap">${label}</span>
      </div>
      <div class="b2w2-race-cell"><span class="b2w2-race-pill win">${w}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-pill loss">${l}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-count">${t}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-rate" style="color:${wrColor};border-color:${color}2e;background:${color}10">${wr!==null?`${wr}%`:'-'}</span></div>
    </div>`;
  }).join('');
  return `<div class="b2w2-race-table">
    <div class="b2w2-race-head">
      <span>상대 종족</span>
      <span>승</span>
      <span>패</span>
      <span>총전</span>
      <span>승률</span>
    </div>
    ${rows}
  </div>`;
}

// ─── 이전주 비교 배지 ─────────────────────────
function _b2WeeklyDelta(curr, prev) {
  if (prev === null || curr === null) return '';
  const d = curr - prev;
  if (d === 0) return `<span style="font-size:10px;color:var(--text3);margin-left:4px">━ ${prev}%</span>`;
  const arrow = d > 0 ? '▲' : '▼';
  const col   = d > 0 ? '#10b981' : '#ef4444';
  return `<span style="font-size:10px;font-weight:800;color:${col};margin-left:4px">${arrow}${Math.abs(d)}%</span><span style="font-size:10px;color:var(--text3);margin-left:2px">vs 전주</span>`;
}

// ═══════════════════════════════════════════════
//  메인 렌더 함수
// ═══════════════════════════════════════════════
