/* ══════════════════════════════════════════════════════════════
   보드2 브리핑 - 주간 브리핑 메인 뷰 렌더러 (board2-briefing.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _b2WeeklyBriefingView() {
  try {
    if (
      typeof window._b2WeeklyPreset === 'undefined' ||
      !window._b2WeeklyDateFrom ||
      !window._b2WeeklyDateTo ||
      typeof window._b2WeeklyUniv === 'undefined'
    ) {
      const st = _b2BriefingLoadState();
      if (st) {
        if (typeof window._b2WeeklyPreset === 'undefined' && st.preset) window._b2WeeklyPreset = st.preset;
        if (!window._b2WeeklyDateFrom && st.from) window._b2WeeklyDateFrom = st.from;
        if (!window._b2WeeklyDateTo && st.to) window._b2WeeklyDateTo = st.to;
        if (typeof window._b2WeeklyUniv === 'undefined' && st.univ) window._b2WeeklyUniv = st.univ;
      }
    }
    if (typeof window._b2WeeklyPreset === 'undefined') window._b2WeeklyPreset = 'thisWeek';
    if (!window._b2WeeklyDateFrom || !window._b2WeeklyDateTo) {
      const def = _b2BriefingPresetRange(window._b2WeeklyPreset);
      window._b2WeeklyDateFrom = def.from;
      window._b2WeeklyDateTo = def.to;
    }
    if (typeof window._b2WeeklyUniv === 'undefined') window._b2WeeklyUniv = '전체';
    const _normInit = _b2NormalizeBriefingRange(window._b2WeeklyDateFrom, window._b2WeeklyDateTo);
    window._b2WeeklyDateFrom = _normInit.from;
    window._b2WeeklyDateTo = _normInit.to;
    const preset = String(window._b2WeeklyPreset || 'thisWeek');
    const dateFrom = window._b2WeeklyDateFrom;
    const dateTo   = window._b2WeeklyDateTo;

    // 이전주 범위 계산
    const fmtN = s => parseInt(String(s||'').replace(/[-\.\/]/g,''))||0;
    const diffDays = Math.round((new Date(dateTo) - new Date(dateFrom)) / 86400000) + 1;
    const prevTo   = new Date(dateFrom); prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);   prevFrom.setDate(prevFrom.getDate() - (diffDays - 1));
    const prevDateFrom = _b2FmtLocalYMD(prevFrom), prevDateTo = _b2FmtLocalYMD(prevTo);

    const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : [])
      .filter(u => u.dissolved || u.hidden).map(u => String(u.name||'').trim()));
    const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet.has(String(p?.univ||'').trim()));
    const univList = (_b2VisUnivs ? _b2VisUnivs() : []).filter(u => u.name && u.name !== '무소속');

    const selUniv  = window._b2WeeklyUniv || '전체';
    const fmtDate  = s => String(s||'').slice(0,10).replace(/-/g,'.');
    const _briefingMeta = {
      thisWeek:  { kicker:'Weekly Briefing', title:'브리핑', short:'이번주', prevLabel:'지난주', desc:'이번 주 활동과 흐름을 카드 위주로 빠르게 훑어볼 수 있도록 정리한 화면입니다.' },
      lastWeek:  { kicker:'Weekly Briefing', title:'브리핑', short:'지난주', prevLabel:'그 전 주', desc:'지난주 활동 흐름과 주요 변화를 되짚어보기 좋게 정리한 화면입니다.' },
      thisMonth: { kicker:'Monthly Briefing', title:'월간 브리핑', short:'이번달', prevLabel:'지난달', desc:'이번 달 활동 흐름과 월간 변화 포인트를 한 화면에서 보기 좋게 정리한 화면입니다.' },
      lastMonth: { kicker:'Monthly Briefing', title:'월간 브리핑', short:'지난달', prevLabel:'그 전 달', desc:'지난달 활동 흐름과 월간 요약을 되돌아보기 좋게 정리한 화면입니다.' },
      custom:    { kicker:'Period Briefing', title:'기간 브리핑', short:'사용자 기간', prevLabel:'이전 기간', desc:'직접 지정한 기간의 활동 흐름과 핵심 변화를 비교해서 보는 화면입니다.' }
    };
    const _briefingInfo = _briefingMeta[preset] || _briefingMeta.custom;
    const _isMonthly = preset === 'thisMonth' || preset === 'lastMonth';
    const _isCustom = preset === 'custom';
    const _isArchive = preset === 'mvpArchive';
    const _mvpLabel = preset === 'thisMonth' ? '이달 MVP' : preset === 'lastMonth' ? '지난달 MVP' : '이번 주 MVP';
    const _topLabel = _isMonthly ? '활동 많은 대학 TOP 5' : '활동 많은 대학 TOP 3';
    const _topLimit = _isMonthly ? 5 : 3;

    // 이번주 & 이전주 집계
    const _chartSort = window._b2WeeklyChartSort === 'winrate' ? 'winrate' : 'games';
    const curStats  = _b2WeeklyUnivStats(vis, dateFrom, dateTo, univList, _chartSort);
    const prevStats = _b2WeeklyUnivStats(vis, prevDateFrom, prevDateTo, univList);
    const prevMap   = {};
    prevStats.forEach(ud => { prevMap[ud.u.name] = ud; });

    // 필터
    const targetStats = selUniv === '전체' ? curStats : curStats.filter(ud => ud.u.name === selUniv);
    const orderedTargetStats = [...targetStats].sort((a, b) => {
      const ia = univList.findIndex(u => u.name === a?.u?.name);
      const ib = univList.findIndex(u => u.name === b?.u?.name);
      const ra = ia >= 0 ? ia : 999;
      const rb = ib >= 0 ? ib : 999;
      return ra - rb;
    });

    // 전체 MVP
    const mvp = _b2WeeklyMVP(curStats);
    const mvp2 = _b2WeeklyMVP2(curStats, mvp);
    const worstPlayer = _b2WeeklyWorst(curStats);
    // 주간/월간 MVP 수상 기록 저장은 _b2EnsureMvpHistoryFresh(board2-briefing-data.js)가
    // 전담한다. 여기서는 저장된 화면 상태(dateFrom/dateTo)가 최신 달력 기준과 어긋날 수 있어
    // (예: 며칠 전 '이번주'를 본 뒤 그대로 저장된 상태) 직접 기록을 남기지 않는다 — 범위와
    // MVP 계산이 서로 다른 시점 기준으로 어긋나 기록이 꼬이는 원인이었다.
    // ── 풀배경 사진형 MVP 카드 빌더 (하이라이트 카드 + MVP 트리플 배너 공용) ──
    const _mvpFx = _b2MvpFxLoad();
    const _mvpFxOp = ((_mvpFx.on ? _mvpFx.intensity : 0) / 100).toFixed(3);
    const _mvpFxStyleAttr = _mvpFx.on ? _mvpFx.style : 'none';
    // MVP/최악 카드 HTML 빌더는 board2-briefing-data.js의 _b2BuildMvpCardHtml로 분리했습니다.
    const _mkMvpCard = (s, rank, isWorst, extraClass) => _b2BuildMvpCardHtml(s, rank, isWorst, extraClass, {
      isMonthly: _isMonthly,
      mvpLabel: _mvpLabel,
      mvpFxStyleAttr: _mvpFxStyleAttr,
      mvpFxDesign: _mvpFx.design,
      mvpFxOp: _mvpFxOp
    });
    const curPlayerStats = _b2WeeklyAggregate(vis, dateFrom, dateTo);
    const prevPlayerStats = _b2WeeklyAggregate(vis, prevDateFrom, prevDateTo);
    const prevPlayerMap = {};
    prevPlayerStats.forEach(s => { prevPlayerMap[s.p?.name || ''] = s; });
    const activePlayers = curPlayerStats.filter(s => s.total > 0);
    const topUnivs = [...curStats]
      .filter(ud => ud.tg > 0)
      .sort((a, b) => (b.tg - a.tg) || (b.active.length - a.active.length) || ((b.wr ?? -1) - (a.wr ?? -1)))
      .slice(0, _topLimit);
    const silentUnivs = curStats.filter(ud => ud.tg === 0).map(ud => ud.u.name);
    const risingPlayers = activePlayers
      .map(s => {
        const prev = prevPlayerMap[s.p?.name || ''] || null;
        const prevWr = prev && prev.total > 0 ? (prev.winRate ?? 0) : 0;
        const prevTotal = prev ? (prev.total || 0) : 0;
        return {
          ...s,
          wrDelta: (s.winRate ?? 0) - prevWr,
          totalDelta: s.total - prevTotal,
          prevTotal
        };
      })
      .filter(s => s.total >= 2)
      .sort((a, b) => (b.wrDelta - a.wrDelta) || (b.totalDelta - a.totalDelta) || (b.wins - a.wins));
    const hotPlayer = risingPlayers[0] || null;
    // 하락세 — 승률이 떨어졌고 표본이 있는 선수만 (전주 활동이 있었던 경우)
    const decliningPlayers = risingPlayers
      .filter(s => s.prevTotal >= 2 && s.wrDelta < 0)
      .slice()
      .sort((a, b) => (a.wrDelta - b.wrDelta) || (a.totalDelta - b.totalDelta));
    const coldPlayer = decliningPlayers[0] || null;
    // 연승/연패 스트릭 — 순수 계산 로직은 board2-briefing-data.js의 _b2CalcStreak로 분리했습니다.
    const _calcStreak = _b2CalcStreak;
    const streakPlayers = activePlayers
      .map(s => ({ ...s, streak: _calcStreak(s.hist, '승') }))
      .filter(s => s.streak >= 2)
      .sort((a, b) => b.streak - a.streak);
    const streakPlayer = streakPlayers[0] || null;
    const loseStreakPlayers = activePlayers
      .map(s => ({ ...s, streak: _calcStreak(s.hist, '패') }))
      .filter(s => s.streak >= 2)
      .sort((a, b) => b.streak - a.streak);
    const loseStreakPlayer = loseStreakPlayers[0] || null;
    // 최고 승률 — 최소 3전 이상 표본 보장
    const bestWrPlayers = activePlayers
      .filter(s => s.total >= 3)
      .slice()
      .sort((a, b) => ((b.winRate ?? -1) - (a.winRate ?? -1)) || (b.total - a.total));
    const bestWrPlayer = bestWrPlayers[0] || null;
    const mostWinsPlayers = activePlayers
      .filter(s => (s.wins || 0) > 0)
      .slice()
      .sort((a, b) => (b.wins - a.wins) || (b.total - a.total) || ((b.winRate ?? -1) - (a.winRate ?? -1)));
    const mostWinsPlayer = mostWinsPlayers[0] || null;
    const mostActivePlayers = activePlayers
      .filter(s => s.total > 0)
      .slice()
      .sort((a, b) => (b.total - a.total) || ((b.winRate ?? -1) - (a.winRate ?? -1)));
    const mostActivePlayer = mostActivePlayers[0] || null;
    const monthlyTopPlayers = [...activePlayers]
      .sort((a, b) => (b.total - a.total) || (b.wins - a.wins) || ((b.winRate ?? -1) - (a.winRate ?? -1)))
      .slice(0, 5);
    const monthlyMvp = monthlyTopPlayers[0] || null;
    // 대학 랭킹 정렬/순위 계산 로직도 board2-briefing-data.js로 분리했습니다.
    const _rankSort = _b2RankSortUnivs;
    const _buildRankedUnivs = _b2BuildRankedUnivs;
    const rankedUnivs = _buildRankedUnivs(curStats, prevStats);
    const rankedUnivLeaders = rankedUnivs;
    const monthlyUnivAces = rankedUnivs
      .map(ud => ({ ...ud, ace: _b2WeeklyUnivMVP(ud.active) }));
    const _monthlyPreviewCount = rankedUnivLeaders.length; // 이번달 대학 순위는 전체 노출 (더보기 없이 전부 표시)
    const _monthlyRankMoreId = `b2w2-monthly-ranks-more-${preset}`;
    const _monthlyRankBtnId = `b2w2-monthly-ranks-btn-${preset}`;
    const _monthlyAceMoreId = `b2w2-monthly-aces-more-${preset}`;
    const _monthlyAceBtnId = `b2w2-monthly-aces-btn-${preset}`;
    const monthlyAceSpotlight = monthlyUnivAces.find(item => item.ace) || null;
    const _bfEsc = (typeof window.escHTML==='function') ? window.escHTML : (s)=>String(s??'');
    const _heroSummary = (() => {
      const parts = [];
      if (_isMonthly && rankedUnivs[0]) {
        parts.push(`${_bfEsc(rankedUnivs[0].u.name)} ${rankedUnivs[0].tw}승 ${rankedUnivs[0].tl}패 · 승률 ${rankedUnivs[0].wr ?? 0}%로 1위`);
      } else if (topUnivs[0]) {
        parts.push(`${_bfEsc(topUnivs[0].u.name)} 활동량 1위 · ${topUnivs[0].tg}전 · 활동 ${topUnivs[0].active.length}명`);
      }
      if (hotPlayer && hotPlayer.wrDelta > 0) parts.push(`${_bfEsc(hotPlayer.p?.name || '-')} 승률 변동 ${hotPlayer.wrDelta > 0 ? '+' : ''}${hotPlayer.wrDelta}%p`);
      if (_isMonthly && monthlyAceSpotlight) parts.push(`${_bfEsc(monthlyAceSpotlight.u.name)} 에이스 ${_bfEsc(monthlyAceSpotlight.ace.p?.name || '-')}`);
      return parts.length ? `${parts.join(' · ')}.` : '선택 기간 활동량과 비교 지표를 정리했습니다.';
    })();
    const _heroSpotlight = (() => {
      if (_isMonthly && rankedUnivs[0]) {
        const leader = rankedUnivs[0];
        const rankDeltaTxt = leader.rankDelta === null ? '첫 집계' : (leader.rankDelta > 0 ? `전기 대비 ▲${leader.rankDelta}` : leader.rankDelta < 0 ? `전기 대비 ▼${Math.abs(leader.rankDelta)}` : '전기와 동일');
        return `${_bfEsc(leader.u.name)} 1위 · ${leader.tw}승 ${leader.tl}패 · 승률 ${leader.wr ?? 0}% · ${rankDeltaTxt}`;
      }
      if (topUnivs[0]) return `${_bfEsc(topUnivs[0].u.name)} 활동량 1위 · ${topUnivs[0].tg}전 · 활동 ${topUnivs[0].active.length}명`;
      return '선택 기간 핵심 지표를 빠르게 확인할 수 있도록 정리했습니다';
    })();
    const _heroFocusLabel = _isMonthly ? '집계 범위' : (_isCustom ? '사용자 기간' : '주간 범위');
    const _heroFocusValue = _isMonthly
      ? `대학 ${rankedUnivs.length}곳`
      : `활동 ${activePlayers.length}명`;
    const _heroCompareText = `${_briefingInfo.prevLabel} ${fmtDate(prevDateFrom)} ~ ${fmtDate(prevDateTo)}`;

    let h = '';

    const _totalGames = curStats.gameCount || 0;
    const _activeUnivs = curStats.filter(ud=>ud.tg>0).length;
    const _periodDays = diffDays;
    // 기간 핵심 요약 카드용 보조 지표 — 전체 승/패 합계와 전기 대비 경기 수 변화
    // 종족 참여 비율 — 종족별 승률 해석 시 표본 크기를 함께 보여주기 위함(활동 스트리머 기준)
    const _raceParticipation = { T:0, Z:0, P:0 };
    activePlayers.forEach(s => { const r = String(s.p?.race||'').trim().toUpperCase(); if (_raceParticipation[r] !== undefined) _raceParticipation[r]++; });
    const _raceParticipationTotal = _raceParticipation.T + _raceParticipation.Z + _raceParticipation.P;
    const _mkRaceShare = (r) => _raceParticipationTotal ? Math.round(_raceParticipation[r]/_raceParticipationTotal*1000)/10 : null;
    // 전체 대학 종족별 승패 — "전체 승/패"(선수 개인전적 합산, tw+tl)는 대학간 매치는 양쪽이 각각
    // 승/패로 잡혀 총 경기 수(게임 1건=1)와 어긋나 보일 수 있어 카드에는 노출하지 않고,
    // 대신 오해 소지가 적은 종족별 승패 구성을 보여준다.
    // 선수당 평균 경기 수 — 총 경기 수 / 활동 스트리머 수
    const _avgGamesPerPlayer = activePlayers.length ? Math.round((_totalGames / activePlayers.length) * 10) / 10 : null;
    // 종족전 상대 승률(T vs Z / T vs P / Z vs P) + 동족전(T vs T / Z vs Z / P vs P) —
    // 자기 종족 기준 상대 종족전 기록을 모아 승률을 계산. 각 선수의 vsRace(상대 종족별 전적)를
    // 본인 종족으로 묶어 집계(동족전은 상대 종족이 본인과 같은 경우).
    const _matchupByOwnRace = { T:{T:{w:0,l:0},P:{w:0,l:0},Z:{w:0,l:0}}, Z:{Z:{w:0,l:0},T:{w:0,l:0},P:{w:0,l:0}}, P:{P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}} };
    curStats.forEach(ud => {
      ud.active.forEach(s => {
        const own = String(s.p?.race||'').trim().toUpperCase();
        if (!_matchupByOwnRace[own] || !s.vsRace) return;
        Object.keys(_matchupByOwnRace[own]).forEach(opp => {
          if (s.vsRace[opp]) { _matchupByOwnRace[own][opp].w += s.vsRace[opp].w; _matchupByOwnRace[own][opp].l += s.vsRace[opp].l; }
        });
      });
    });
    const _mkMatchup = (a, b) => {
      const rec = _matchupByOwnRace[a][b];
      const total = rec.w + rec.l;
      return { a, b, w: rec.w, l: rec.l, total, wr: total ? Math.round(rec.w/total*1000)/10 : null };
    };
    const _raceMatchups = [_mkMatchup('T','Z'), _mkMatchup('T','P'), _mkMatchup('Z','P'), _mkMatchup('T','T'), _mkMatchup('Z','Z'), _mkMatchup('P','P')].filter(m => m.total > 0);
    // 종족별 승/패(그 종족 자신의 전체 성적) — 동족전 + 두 종족전 매치업을 합산.
    // (과거엔 raceCount(=해당 종족을 "상대"한 모든 선수의 합산 성적)를 그대로 썼던 탓에
    //  화면에 함께 노출되는 "종족전 상대 승패" 매치업 합계와 값이 어긋나 보이는 문제가 있었음)
    const _ownRaceCount = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    ['T','Z','P'].forEach(own => {
      Object.keys(_matchupByOwnRace[own]).forEach(opp => {
        _ownRaceCount[own].w += _matchupByOwnRace[own][opp].w;
        _ownRaceCount[own].l += _matchupByOwnRace[own][opp].l;
      });
    });
    const _prevTotalGames = prevStats.gameCount || 0;
    const _gamesDelta = _totalGames - _prevTotalGames;

    // ── "저장(1장)" 신문기사 스타일 캡처용 데이터 스냅샷 ──
    // render-capture-utils.js의 captureBriefingArticle('single')에서 사용.
    // (여기서 이미 계산해둔 통계를 그대로 재사용 — 중복 계산 방지)
    // 대학별 우수 스트리머(에이스)는 월간 모드에서는 monthlyUnivAces를 그대로 쓰고,
    // 주간 모드에서는 topUnivs 기준으로 동일하게 계산해 export에서도 항상 노출되도록 함.
    // topUnivs는 화면상의 "대학 활동량 TOP" 카드용으로 상위 _topLimit(주간 3 / 월간 5)개만 담지만,
    // 저장(신문) 내보내기용 "대학별 우수 스트리머" 섹션은 활동이 있었던 대학을 전부 보여줘야 하므로
    // 별도로 전체 목록을 만들어 사용한다 (주간 모드에서 3개로 잘리던 문제 수정).
    const _univAcesForExport = _isMonthly
      ? monthlyUnivAces
      : [...curStats]
          .filter(ud => ud.tg > 0)
          .sort((a, b) => (b.tg - a.tg) || (b.active.length - a.active.length) || ((b.wr ?? -1) - (a.wr ?? -1)))
          .map(ud => ({ ...ud, ace: _b2WeeklyUnivMVP(ud.active) }));
    // ── 저장(신문) 내보내기에 종족별 상대 전적 / 전체 선수 랭킹을 추가로 담기 위한 집계 ──
    // (화면에는 대학별로만 노출되던 종족 통계를 선택 범위 전체로 합산하고,
    //  화면 카드에서는 5명으로 잘리던 선수 랭킹을 전체 다 담는다)
    const _exportRaceCount = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    targetStats.forEach(ud => { ['P','T','Z'].forEach(r => { _exportRaceCount[r].w += ud.raceCount[r].w; _exportRaceCount[r].l += ud.raceCount[r].l; }); });
    // 동족전(미러매치) 승패 — 선택 범위(targetStats) 기준, 저장 이미지의 "종족별 상대 전적"에 함께 노출
    const _exportMirrorCount = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    targetStats.forEach(ud => {
      ud.active.forEach(s => {
        const own = String(s.p?.race||'').trim().toUpperCase();
        if (!_exportMirrorCount[own] || !s.vsRace) return;
        const m = s.vsRace[own];
        if (m) { _exportMirrorCount[own].w += m.w; _exportMirrorCount[own].l += m.l; }
      });
    });
    const _allActivePlayersRanked = [...activePlayers]
      .sort((a, b) => (b.total - a.total) || (b.wins - a.wins) || ((b.winRate ?? -1) - (a.winRate ?? -1)));
    try {
      window._b2BriefingExportCtx = {
        preset, dateFrom, dateTo, prevDateFrom, prevDateTo,
        selUniv, isMonthly: _isMonthly, isCustom: _isCustom,
        briefingInfo: _briefingInfo, mvpLabel: _mvpLabel,
        heroSummary: _heroSummary, heroSpotlight: _heroSpotlight,
        mvp, mvp2, worstPlayer,
        topUnivs, rankedUnivs, univAces: _univAcesForExport,
        raceCountGlobal: _exportRaceCount, mirrorRaceCountGlobal: _exportMirrorCount, allActivePlayersRanked: _allActivePlayersRanked,
        hotPlayer, coldPlayer, streakPlayer, loseStreakPlayer,
        bestWrPlayer, mostWinsPlayer, mostActivePlayer,
        monthlyMvp, monthlyTopPlayers, silentUnivs,
        totalGames: _totalGames, activeUnivs: _activeUnivs,
        activePlayerCount: activePlayers.length, periodDays: _periodDays
      };
    } catch (e) {}

    // ── MVP 아카이브 모드용 데이터(시즌 시작부터 현재까지의 전체 주간/월간 MVP 기록) ──
    let _archiveEntries = [];
    let _archiveWeekCount = 0, _archiveMonthCount = 0;
    if (_isArchive) {
      try {
        if (typeof _b2EnsureMvpHistoryFresh === 'function') _b2EnsureMvpHistoryFresh(false);
        _archiveEntries = (typeof _b2MvpHistoryLoad === 'function' ? _b2MvpHistoryLoad() : [])
          .filter(e => e && e.name)
          .sort((a, b) => String(b.from || '').localeCompare(String(a.from || '')));
        _archiveWeekCount = _archiveEntries.filter(e => e.type === 'week').length;
        _archiveMonthCount = _archiveEntries.filter(e => e.type === 'month').length;
      } catch (e) {}
    }
    const _archiveTypeFilter = ['week','month'].includes(window._b2MvpArchiveType) ? window._b2MvpArchiveType : 'all';
    const _archiveUnivFilter = window._b2MvpArchiveUniv || '전체';

    // ── 헤더 컨트롤
    h += `<div class="b2w2-wrap" id="b2w2-export-root" data-theme="${_b2BriefingThemeLoad()}">
      <div class="b2w2-masthead">
        <span class="b2w2-masthead-brand"><span class="b2w2-masthead-mark"></span>STAR DATACENTER</span>
        <span>${_isArchive ? `${fmtDate(_B2_MVP_SEASON_START)} ~ 현재` : `${fmtDate(dateFrom)} ~ ${fmtDate(dateTo)} 발행`}</span>
      </div>
      <section class="b2w2-hero">
        <div class="b2w2-hero-main">
          <div style="font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:var(--b2w-gold);text-transform:uppercase">${_isArchive ? 'MVP Archive' : _briefingInfo.kicker}</div>
          <div class="b2w2-hero-title">${_isArchive ? 'MVP 아카이브' : _briefingInfo.title}</div>
          <div class="b2w2-hero-desc">${_isArchive ? '시즌이 시작된 이후 지금까지의 모든 주간·월간 MVP 수상 기록을 모아봤습니다.' : _heroSummary}</div>
        </div>
        <div class="b2w2-hero-meta">
          <div class="b2w2-hero-meta-kicker">핵심 지표</div>
          <div class="b2w2-hero-meta-headline">${_isArchive ? `주간 MVP ${_archiveWeekCount}회 · 월간 MVP ${_archiveMonthCount}회 기록` : _heroSpotlight}</div>
          <div class="b2w2-hero-meta-grid">
            <div class="b2w2-hero-meta-cell">
              <div class="b2w2-hero-meta-label">${_isArchive ? '집계 시작' : '현재 보기'}</div>
              <div class="b2w2-hero-meta-value">${_isArchive ? fmtDate(_B2_MVP_SEASON_START) : _briefingInfo.short}</div>
            </div>
            <div class="b2w2-hero-meta-cell">
              <div class="b2w2-hero-meta-label">${_isArchive ? '주간 MVP' : _heroFocusLabel}</div>
              <div class="b2w2-hero-meta-value">${_isArchive ? `${_archiveWeekCount}회` : _heroFocusValue}</div>
            </div>
            <div class="b2w2-hero-meta-cell">
              <div class="b2w2-hero-meta-label">${_isArchive ? '월간 MVP' : '비교 기준'}</div>
              <div class="b2w2-hero-meta-value">${_isArchive ? `${_archiveMonthCount}회` : _heroCompareText}</div>
            </div>
            <div class="b2w2-hero-meta-cell">
              <div class="b2w2-hero-meta-label">필터</div>
              <div class="b2w2-hero-meta-value">${_isArchive ? (_archiveUnivFilter==='전체'?'전체 대학':_archiveUnivFilter) : (selUniv==='전체'?'전체 대학':selUniv)}</div>
            </div>
          </div>
        </div>
      </section>
      <div class="b2w2-modebar">
        <div class="b2w2-modecard ${(!_isMonthly && !_isCustom && !_isArchive)?'is-active':''}" onclick="_b2SetBriefingPreset('thisWeek')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">주간 모드</div>
              <div class="b2w2-modetitle">주간</div>
            </div>
            <span class="b2w2-modebadge">${(!_isMonthly && !_isCustom && !_isArchive)?'선택됨':'빠른 확인'}</span>
          </div>
          <div class="b2w2-modedesc">이번주와 지난주 흐름을 빠르게 비교할 때 보기 좋습니다.</div>
          <div class="b2w2-presetrow">
            ${[
              ['thisWeek','이번주'],
              ['lastWeek','지난주']
            ].map(([key,label])=>`<button type="button" class="b2w2-preset${preset===key?' on':''}" onclick="event.stopPropagation();_b2SetBriefingPreset('${key}')">${label}</button>`).join('')}
          </div>
        </div>
        <div class="b2w2-modecard ${_isMonthly?'is-active':''}" onclick="_b2SetBriefingPreset('thisMonth')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">월간 모드</div>
              <div class="b2w2-modetitle">월간</div>
            </div>
            <span class="b2w2-modebadge">${_isMonthly?'선택됨':'깊게 보기'}</span>
          </div>
          <div class="b2w2-modedesc">이번달과 지난달 흐름을 조금 더 넓게 확인할 때 적합합니다.</div>
          <div class="b2w2-presetrow">
            ${[
              ['thisMonth','이번달'],
              ['lastMonth','지난달']
            ].map(([key,label])=>`<button type="button" class="b2w2-preset${preset===key?' on':''}" onclick="event.stopPropagation();_b2SetBriefingPreset('${key}')">${label}</button>`).join('')}
          </div>
        </div>
        <div class="b2w2-modecard ${_isCustom?'is-active':''}" onclick="_b2ActivateBriefingCustom(true)">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">사용자 기간</div>
              <div class="b2w2-modetitle">기간</div>
            </div>
            <span class="b2w2-modebadge">${_isCustom?'사용 중':'직접 지정'}</span>
          </div>
          <div class="b2w2-modedesc">원하는 날짜 범위를 직접 입력해 특정 기간 브리핑으로 볼 수 있습니다.</div>
          <div class="b2w2-presetrow">
            <button type="button" class="b2w2-preset${_isCustom && _periodDays===7?' on':''}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(7)">최근 7일</button>
            <button type="button" class="b2w2-preset${_isCustom && _periodDays===14?' on':''}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(14)">최근 14일</button>
            <button type="button" class="b2w2-preset${_isCustom && _periodDays===30?' on':''}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(30)">최근 30일</button>
            <button type="button" class="b2w2-preset${_isCustom && ![7,14,30].includes(_periodDays)?' on':''}" onclick="event.stopPropagation();_b2ActivateBriefingCustom(true)">직접 지정</button>
            <button type="button" class="b2w2-preset${_isCustom && ![7,14,30].includes(_periodDays)?' on':''}" onclick="event.stopPropagation();_b2ApplyBriefingCustomFromInputs()">${_isCustom ? `${fmtDate(dateFrom)} ~ ${fmtDate(dateTo)}` : '입력값 조회'}</button>
          </div>
        </div>
        <div class="b2w2-modecard ${_isArchive?'is-active':''}" onclick="_b2SetBriefingPreset('mvpArchive')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">MVP 아카이브</div>
              <div class="b2w2-modetitle">MVP</div>
            </div>
            <span class="b2w2-modebadge">${_isArchive?'보는 중':'전체 기록'}</span>
          </div>
          <div class="b2w2-modedesc">시즌 시작부터 지금까지의 주간·월간 MVP를 한 번에 모아봅니다.</div>
          <div class="b2w2-presetrow">
            <button type="button" class="b2w2-preset${_isArchive?' on':''}" onclick="event.stopPropagation();_b2SetBriefingPreset('mvpArchive')">아카이브 보기</button>
          </div>
        </div>
      </div>`;

    if (_isArchive) {
      h += _b2RenderMvpArchiveBody(_archiveEntries, _archiveTypeFilter, _archiveUnivFilter, univList);
      h += `</div>`;
      return h;
    }

    h += `<div class="b2w2-hdr">
      <div class="b2w2-hdr-title">
        <span style="font-size:16px">📅</span>
        <span style="font-size:14px;font-weight:900;color:var(--text1)">${_briefingInfo.title}</span>
      </div>
      <div class="b2w2-filtergroup">
        <span class="b2w2-dategroup" title="기간 선택">
          <button type="button" class="b2w2-datebtn" onclick="_b2OpenBriefingDateInput('from')" title="시작 날짜 선택" aria-label="시작 날짜 선택">📅</button>
          <input type="date" class="b2w2-din" id="b2w2-from" value="${dateFrom}" onchange="_b2SyncBriefingCustomInputs(true)" title="시작 날짜 변경">
          <span class="b2w2-daterange-tilde">~</span>
          <input type="date" class="b2w2-din" id="b2w2-to" value="${dateTo}" onchange="_b2SyncBriefingCustomInputs(true)" title="종료 날짜 변경">
          <button type="button" class="b2w2-datebtn" onclick="_b2OpenBriefingDateInput('to')" title="종료 날짜 선택" aria-label="종료 날짜 선택">📅</button>
        </span>
        <select class="b2w2-sel" id="b2w2-univ" onchange="_b2SyncBriefingCustomInputs(true)">
          <option value="전체"${selUniv==='전체'?' selected':''}>🏫 전체 대학</option>
          ${univList.map(u=>{const _n=(typeof escAttr==='function'?escAttr(u.name):String(u.name||''));const _nh=(typeof window.escHTML==='function'?window.escHTML(u.name):String(u.name||''));return `<option value="${_n}"${selUniv===u.name?' selected':''}>${_nh}</option>`;}).join('')}
        </select>
      </div>
      <div class="b2w2-actiongroup">
        <button type="button" class="b2w2-btn" onclick="_b2ApplyBriefingCustomFromInputs()">조회</button>
        <button type="button" class="b2w2-btn b2w2-ghostbtn no-export" onclick="_b2ResetBriefingFilters()" title="이번주 브리핑으로 초기화" aria-label="초기화">↺</button>
      </div>
      <button type="button" id="b2w2-speak-btn" class="b2w2-btn no-export" title="브리핑 음성으로 듣기" onclick="_b2BriefingToggleSpeak()">🔊 음성듣기</button>
      <button type="button" class="b2w2-btn no-export b2w2-savebtn" onclick="captureBriefingArticle()">📰 브리핑 저장</button>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 2px 10px;border-bottom:1px dashed var(--b2w-rule-soft);margin-bottom:16px">
      <span style="font-size:10px;font-weight:800;color:var(--b2w-tag-muted);letter-spacing:.06em;text-transform:uppercase;flex-shrink:0">데이터 범위</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">미니대전</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대학대전</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대학CK</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대회 · 일반</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대회 · 조별리그</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대회 · 대진표기록</span>
      <span style="font-size:10px;color:var(--b2w-accent);background:var(--b2w-tag-accent-bg);border:1px solid var(--b2w-tag-accent-border);border-radius:4px;padding:2px 7px;font-weight:700">티어대회 · 일반</span>
      <span style="font-size:10px;color:var(--b2w-accent);background:var(--b2w-tag-accent-bg);border:1px solid var(--b2w-tag-accent-border);border-radius:4px;padding:2px 7px;font-weight:700">티어대회 · 조별리그</span>
      <span style="font-size:10px;color:var(--b2w-accent);background:var(--b2w-tag-accent-bg);border:1px solid var(--b2w-tag-accent-border);border-radius:4px;padding:2px 7px;font-weight:700">티어대회 · 대진표기록</span>
      <span style="font-size:10px;color:var(--b2w-tag-muted);margin-left:2px">※ 개인전·끝장전·프로리그 기록은 브리핑 집계에서 제외됩니다</span>
    </div>
    <div id="b2w2-basic-export-root">`;

    const hasData = targetStats.some(ud => ud.tg > 0);
    if (!hasData) {
      h += `<div class="b2w2-empty"><div style="font-size:28px;margin-bottom:8px">📭</div>해당 기간에 기록된 경기가 없습니다.<div style="font-size:var(--fs-caption);margin-top:4px">기간을 변경해보세요</div></div></div></div>`;
      return h;
    }

    const _leaderForKpi = _isMonthly ? rankedUnivs[0] : topUnivs[0];
    const _leaderLabel = _isMonthly ? '선두 대학' : '활동량 1위 대학';
    const _leaderValue = _leaderForKpi ? _leaderForKpi.u.name : '-';
    const _leaderColor = _leaderForKpi && typeof gc === 'function'
      ? (gc(_leaderForKpi.u.name) || '#f59e0b')
      : '#f59e0b';
    const _leaderSub = _leaderForKpi
      ? (_isMonthly
          ? `${_leaderForKpi.tw}승 ${_leaderForKpi.tl}패 · 승률 ${_leaderForKpi.wr ?? 0}%`
          : `${_leaderForKpi.tg}전 · 활동 ${_leaderForKpi.active.length}명`)
      : '집계 데이터 없음';
    const _bestWrSub = bestWrPlayer ? `${bestWrPlayer.p?.name || '-'} · ${bestWrPlayer.total}전` : '표본 부족';
    h += `<section class="b2w2-kpi-grid">
      <article class="b2w2-kpi-card" style="--kpi-accent:#6366f1">
        <div class="b2w2-kpi-label">🏫 활동 대학</div>
        <div class="b2w2-kpi-value">${_activeUnivs}<span style="font-size:14px;font-weight:700;color:var(--b2w-ink-soft);margin-left:2px">곳</span></div>
        <div class="b2w2-kpi-sub">경기 기록 있는 대학 수</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:#0ea5e9">
        <div class="b2w2-kpi-label">🎮 총 경기 수</div>
        <div class="b2w2-kpi-value">${_totalGames}<span style="font-size:14px;font-weight:700;color:var(--b2w-ink-soft);margin-left:2px">전</span></div>
        <div class="b2w2-kpi-sub">${_periodDays}일 집계 기준</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:${_leaderColor}">
        <div class="b2w2-kpi-label">👑 ${_leaderLabel}</div>
        <div class="b2w2-kpi-value" style="font-size:var(--fs-lg);margin-top:8px">${_leaderValue}</div>
        <div class="b2w2-kpi-sub">${_leaderSub}</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:#10b981">
        <div class="b2w2-kpi-label">🎯 최고 승률</div>
        <div class="b2w2-kpi-value" style="color:#10b981">${bestWrPlayer ? `${bestWrPlayer.winRate}%` : '-'}</div>
        <div class="b2w2-kpi-sub">${_bestWrSub}</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:#8b5cf6">
        <div class="b2w2-kpi-label">📊 선수당 평균</div>
        <div class="b2w2-kpi-value">${_avgGamesPerPlayer !== null ? _avgGamesPerPlayer : '-'}<span style="font-size:14px;font-weight:700;color:var(--b2w-ink-soft);margin-left:2px">전</span></div>
        <div class="b2w2-kpi-sub">활동 스트리머 ${activePlayers.length}명 기준</div>
      </article>
    </section>`;

    h += `<section class="b2w2-feature-row">
      ${(() => {
        const _profileMvp = mvp || monthlyTopPlayers[0] || null;
        if (!_profileMvp) {
          return `<article class="b2w2-highlight-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;--hc-top:#f59e0b">
            <div class="b2w2-highlight-kicker" style="color:#b45309">🏆 ${_mvpLabel}</div>
            <div class="b2w2-highlight-desc">집계할 기록이 없습니다.</div>
          </article>`;
        }
        return _mkMvpCard(_profileMvp, 1, false, 'b2w2-mvp-card-lead');
      })()}
      <article class="b2w2-highlight-card b2w2-lead-card" style="border-color:var(--b2w-accent-border);--hc-top:#2563eb">
        <div class="b2w2-highlight-kicker" style="color:var(--b2w-accent)">전체 전적</div>
        <div class="b2w2-highlight-title">종합 승패 개요</div>
        <div class="b2w2-racetable">
          <div></div>
          <div class="b2w2-racetable-head"><span class="rbadge rT" style="font-size:10px">T</span></div>
          <div class="b2w2-racetable-head"><span class="rbadge rZ" style="font-size:10px">Z</span></div>
          <div class="b2w2-racetable-head"><span class="rbadge rP" style="font-size:10px">P</span></div>

          <div class="b2w2-racetable-label">참여 비율</div>
          <div class="b2w2-racetable-cell"><strong>${_raceParticipation.T}명</strong><span>${_mkRaceShare('T') ?? '-'}%</span></div>
          <div class="b2w2-racetable-cell"><strong>${_raceParticipation.Z}명</strong><span>${_mkRaceShare('Z') ?? '-'}%</span></div>
          <div class="b2w2-racetable-cell"><strong>${_raceParticipation.P}명</strong><span>${_mkRaceShare('P') ?? '-'}%</span></div>

          <div class="b2w2-racetable-label">종족별 승/패</div>
          <div class="b2w2-racetable-cell"><strong>${_ownRaceCount.T.w}승 ${_ownRaceCount.T.l}패</strong></div>
          <div class="b2w2-racetable-cell"><strong>${_ownRaceCount.Z.w}승 ${_ownRaceCount.Z.l}패</strong></div>
          <div class="b2w2-racetable-cell"><strong>${_ownRaceCount.P.w}승 ${_ownRaceCount.P.l}패</strong></div>
        </div>
        ${_raceMatchups.length ? `
        <div style="margin-top:6px;padding-top:8px;border-top:1px solid var(--b2w-rule-soft)">
          <div style="font-size:var(--fs-caption);color:var(--text3);margin-bottom:6px">종족전 상대 승패 (승률)</div>
          <div style="display:flex;flex-direction:column;gap:5px">
            ${_raceMatchups.map(m => {
              const _wrCol = m.wr>=60?'#15803d':m.wr>=50?'#9f1d1d':'var(--text3)';
              const _raceBarCol = { T:'#2563eb', Z:'#7c3aed', P:'#d97706' }[m.a] || _wrCol;
              const _isMirror = m.a === m.b;
              return `<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:var(--b2w-r);background:var(--b2w-paper-alt)">
                <span style="display:flex;align-items:center;gap:4px;flex-shrink:0">${_isMirror
                  ? `<span class="rbadge r${m.a}" style="font-size:9px">${m.a}</span><span style="font-size:9px;color:var(--text3);font-weight:700">동족전</span>`
                  : `<span class="rbadge r${m.a}" style="font-size:9px">${m.a}</span><span style="font-size:9px;color:var(--text3);font-weight:700">vs</span><span class="rbadge r${m.b}" style="font-size:9px">${m.b}</span>`}</span>
                <span style="flex:1;height:5px;border-radius:3px;background:var(--b2w-rule-soft);overflow:hidden"><span style="display:block;height:100%;width:${m.wr}%;background:${_raceBarCol};border-radius:3px"></span></span>
                <span style="font-size:var(--fs-caption);font-weight:800;color:var(--text1);flex-shrink:0">${m.w}승 ${m.l}패</span>
                <span style="font-size:var(--fs-sm);font-weight:900;color:${_wrCol};min-width:38px;text-align:right;flex-shrink:0">${m.wr}%</span>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}
        <div class="b2w2-highlight-list" style="margin-top:2px">
          <div class="b2w2-highlight-row"><span style="font-size:var(--fs-caption);color:var(--text3)">전기 대비 경기 수</span><strong style="font-size:var(--fs-sm);color:${_gamesDelta>0?'#15803d':_gamesDelta<0?'#dc2626':'var(--text1)'}">${_gamesDelta>0?'▲+':_gamesDelta<0?'▼':'━'}${Math.abs(_gamesDelta)}전</strong></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="b2w2-note-chip" style="border-color:var(--b2w-tag-accent-border);color:var(--b2w-accent);background:var(--b2w-tag-accent-bg)">활동 스트리머 ${activePlayers.length}명</span>
          <span class="b2w2-note-chip">${_periodDays}일 집계</span>
          <span class="b2w2-note-chip">${_briefingInfo.prevLabel} 대비 비교</span>
        </div>
      </article>
    </section>
    <section class="b2w2-highlight-grid">
      <article class="b2w2-highlight-card" style="--hc-top:#6366f1">
        <div class="b2w2-highlight-kicker" style="color:#4f46e5">🏫 대학 활동량</div>
        <div class="b2w2-highlight-title">${_topLabel}</div>
        <div class="b2w2-highlight-list">
          ${topUnivs.length ? topUnivs.map((ud, idx) => `
            <div class="b2w2-highlight-row">
              <div style="display:flex;align-items:center;gap:8px;min-width:0">
                <span style="font-size:var(--fs-caption);font-weight:900;color:${gc ? gc(ud.u.name) : '#64748b'}">${idx + 1}</span>
                <span style="font-size:var(--fs-sm);font-weight:900;color:var(--text1)">${(typeof window.escHTML==='function'?window.escHTML(ud.u.name):String(ud.u.name||''))}</span>
              </div>
              <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3)">${ud.tg}전 · 활동 ${ud.active.length}명</div>
            </div>
          `).join('') : `<div class="b2w2-highlight-desc">활동 대학이 없습니다.</div>`}
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#10b981">
        <div class="b2w2-highlight-kicker" style="color:#15803d">📈 승률 변동</div>
        <div class="b2w2-highlight-title">전기 대비 승률 변화</div>
        <div class="b2w2-dual-card">
          <div class="b2w2-dual-block">
            ${hotPlayer ? `
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#dc2626">상승세</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${hotPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${hotPlayer.p?.name || '-'}</span> · ${String(hotPlayer.p?.univ || '무소속')}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#fecaca;color:#dc2626;background:#fef2f2">${hotPlayer.wrDelta >= 0 ? '+' : ''}${hotPlayer.wrDelta}%p</span>
              </div>
              <div class="b2w2-mini-list">
                <div class="b2w2-mini-row"><span style="color:var(--text3)">전적</span><span style="color:var(--text1)">${hotPlayer.wins}승 ${hotPlayer.losses}패</span></div>
                <div class="b2w2-mini-row"><span style="color:var(--text3)">경기 수 변화</span><span style="color:var(--text1)">${hotPlayer.totalDelta >= 0 ? '+' : ''}${hotPlayer.totalDelta}전</span></div>
                ${risingPlayers[1] ? `<div class="b2w2-mini-row"><span style="color:var(--text3)">2위</span><span style="color:#dc2626">${risingPlayers[1].p?.name || '-'} ${risingPlayers[1].wrDelta >= 0 ? '+' : ''}${risingPlayers[1].wrDelta}%p</span></div>` : ''}
              </div>
            ` : `<div class="b2w2-highlight-desc">전주와 비교할 만큼 상승한 스트리머가 없습니다.</div>`}
          </div>
          <div class="b2w2-dual-block">
            ${coldPlayer ? `
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#2563eb">하락세</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${coldPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${coldPlayer.p?.name || '-'}</span> · ${String(coldPlayer.p?.univ || '무소속')}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#bfdbfe;color:#2563eb;background:#eff6ff">${coldPlayer.wrDelta}%p</span>
              </div>
              <div class="b2w2-mini-list">
                <div class="b2w2-mini-row"><span style="color:var(--text3)">전적</span><span style="color:var(--text1)">${coldPlayer.wins}승 ${coldPlayer.losses}패</span></div>
                <div class="b2w2-mini-row"><span style="color:var(--text3)">경기 수 변화</span><span style="color:var(--text1)">${coldPlayer.totalDelta >= 0 ? '+' : ''}${coldPlayer.totalDelta}전</span></div>
                ${decliningPlayers[1] ? `<div class="b2w2-mini-row"><span style="color:var(--text3)">2위</span><span style="color:#2563eb">${decliningPlayers[1].p?.name || '-'} ${decliningPlayers[1].wrDelta}%p</span></div>` : ''}
              </div>
            ` : `<div class="b2w2-highlight-desc">전주와 비교할 만큼 하락한 스트리머가 없습니다.</div>`}
          </div>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#0891b2">
        <div class="b2w2-highlight-kicker" style="color:#0891b2">🔥 연속 기록</div>
        <div class="b2w2-highlight-title">연승 / 연패 현황</div>
        <div class="b2w2-dual-card">
          <div class="b2w2-dual-block">
            ${streakPlayer ? `
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#0891b2">연승</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${streakPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${streakPlayer.p?.name || '-'}</span> · ${String(streakPlayer.p?.univ || '무소속')}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#a5f3fc;color:#0891b2;background:#ecfeff">🔥 ${streakPlayer.streak}연승</span>
              </div>
              <div class="b2w2-mini-list">
                ${streakPlayers.slice(1, 3).map((s, idx) => `
                  <div class="b2w2-mini-row">
                    <span style="color:var(--text1)">${idx + 2}. ${s.p?.name || '-'}</span>
                    <span style="color:#0891b2">${s.streak}연승</span>
                  </div>
                `).join('') || `<div class="b2w2-mini-row"><span style="color:var(--text3)">보조 랭크</span><span style="color:#0891b2">단독 선두</span></div>`}
              </div>
            ` : `<div class="b2w2-highlight-desc">2연승 이상 기록 중인 스트리머가 없습니다.</div>`}
          </div>
          <div class="b2w2-dual-block">
            ${loseStreakPlayer ? `
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#dc2626">연패</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${loseStreakPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${loseStreakPlayer.p?.name || '-'}</span> · ${String(loseStreakPlayer.p?.univ || '무소속')}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#fecaca;color:#dc2626;background:#fef2f2">💧 ${loseStreakPlayer.streak}연패</span>
              </div>
              <div class="b2w2-mini-list">
                ${loseStreakPlayers.slice(1, 3).map((s, idx) => `
                  <div class="b2w2-mini-row">
                    <span style="color:var(--text1)">${idx + 2}. ${s.p?.name || '-'}</span>
                    <span style="color:#dc2626">${s.streak}연패</span>
                  </div>
                `).join('') || `<div class="b2w2-mini-row"><span style="color:var(--text3)">보조 랭크</span><span style="color:#dc2626">단독 집계</span></div>`}
              </div>
            ` : `<div class="b2w2-highlight-desc">2연패 이상 기록 중인 스트리머가 없습니다.</div>`}
          </div>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#16a34a">
        <div class="b2w2-highlight-kicker" style="color:#16a34a">🏅 승률 지표</div>
        <div class="b2w2-highlight-title">최고 승률</div>
        ${bestWrPlayer ? `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:var(--fs-lg);font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${bestWrPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${bestWrPlayer.p?.name || '-'}</div>
              <div style="font-size:var(--fs-sm);color:var(--text3);margin-top:4px">${String(bestWrPlayer.p?.univ || '무소속')}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#bbf7d0;color:#16a34a;background:#f0fdf4">${bestWrPlayer.winRate}%</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:var(--fs-caption);color:var(--text3)">전적</span><strong style="font-size:var(--fs-sm);color:var(--text1)">${bestWrPlayer.total}전 ${bestWrPlayer.wins}승 ${bestWrPlayer.losses}패</strong></div>
          </div>
          ${bestWrPlayers.length > 1 ? `
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${bestWrPlayers.slice(1, 3).map((s, idx) => `
              <div class="b2w2-highlight-row">
                <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${s.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${idx + 2}. ${s.p?.name || '-'}</span>
                <strong style="font-size:var(--fs-caption);color:#16a34a">${s.winRate}%</strong>
              </div>
            `).join('')}
          </div>` : ''}
        ` : `<div class="b2w2-highlight-desc">3전 이상 기록한 스트리머가 없습니다.</div>`}
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#0ea5e9">
        <div class="b2w2-highlight-kicker" style="color:#0284c7">⚔️ 전체 경기 지표</div>
        <div class="b2w2-highlight-title">최다 전체 경기</div>
        ${mostActivePlayer ? `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:var(--fs-lg);font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${mostActivePlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${mostActivePlayer.p?.name || '-'}</div>
              <div style="font-size:var(--fs-sm);color:var(--text3);margin-top:4px">${String(mostActivePlayer.p?.univ || '무소속')}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#bae6fd;color:#0284c7;background:#f0f9ff">${mostActivePlayer.total}전</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:var(--fs-caption);color:var(--text3)">전체 전적</span><strong style="font-size:var(--fs-sm);color:var(--text1)">${mostActivePlayer.wins}승 ${mostActivePlayer.losses}패 · ${mostActivePlayer.winRate ?? '-'}%</strong></div>
          </div>
          ${mostActivePlayers.length > 1 ? `
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${mostActivePlayers.slice(1, 3).map((s, idx) => `
              <div class="b2w2-highlight-row">
                <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${s.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${idx + 2}. ${s.p?.name || '-'}</span>
                <strong style="font-size:var(--fs-caption);color:#0284c7">${s.total}전</strong>
              </div>
            `).join('')}
          </div>` : ''}
        ` : `<div class="b2w2-highlight-desc">경기 기록이 없습니다.</div>`}
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#f97316">
        <div class="b2w2-highlight-kicker" style="color:#f97316">🏆 승수 지표</div>
        <div class="b2w2-highlight-title">최다 승수</div>
        ${mostWinsPlayer ? `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:var(--fs-lg);font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${mostWinsPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${mostWinsPlayer.p?.name || '-'}</div>
              <div style="font-size:var(--fs-sm);color:var(--text3);margin-top:4px">${String(mostWinsPlayer.p?.univ || '무소속')}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#fed7aa;color:#c2410c;background:#fff7ed">${mostWinsPlayer.wins}승</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:var(--fs-caption);color:var(--text3)">전적</span><strong style="font-size:var(--fs-sm);color:var(--text1)">${mostWinsPlayer.total}전 ${mostWinsPlayer.wins}승 ${mostWinsPlayer.losses}패</strong></div>
          </div>
          ${mostWinsPlayers.length > 1 ? `
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${mostWinsPlayers.slice(1, 3).map((s, idx) => `
              <div class="b2w2-highlight-row">
                <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${s.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${idx + 2}. ${s.p?.name || '-'}</span>
                <strong style="font-size:var(--fs-caption);color:#c2410c">${s.wins}승</strong>
              </div>
            `).join('')}
          </div>` : ''}
        ` : `<div class="b2w2-highlight-desc">승리 기록이 없습니다.</div>`}
      </article>
    </section>`;

    const _renderMonthlyRankRows = (list) => {
      if (!list.length) return `<div class="b2w2-highlight-desc">월간 대학 순위를 계산할 기록이 없습니다.</div>`;
      const _renderRow = (ud) => {
        const col = (typeof gc === 'function' ? gc(ud.u.name) : '#64748b') || '#64748b';
        const deltaClass = ud.rankDelta === null ? 'new' : ud.rankDelta > 0 ? 'up' : ud.rankDelta < 0 ? 'down' : 'same';
        const deltaText = ud.rankDelta === null ? 'NEW' : ud.rankDelta > 0 ? `▲${ud.rankDelta}` : ud.rankDelta < 0 ? `▼${Math.abs(ud.rankDelta)}` : '유지';
        const univNameJs = ud.u.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        return `
              <div class="b2w2-rank-row" style="cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univNameJs}')">
                <div class="b2w2-rank-main">
                  <span class="b2w2-rank-badge" style="background:${col}18;color:${col}">${ud.rank}</span>
                  <div style="min-width:0">
                    <div class="b2w2-rank-name">${(typeof window.escHTML==='function'?window.escHTML(ud.u.name):String(ud.u.name||''))}</div>
                    <div class="b2w2-rank-sub">
                      <span><span style="color:var(--win-col,#dc2626);font-weight:800">${ud.tw}승</span> <span style="color:var(--lose-col,#2563eb);font-weight:800">${ud.tl}패</span></span>
                      <span>승률 ${ud.wr ?? 0}%</span>
                      <span style="color:${col};font-weight:800">${ud.tg}전</span>
                    </div>
                  </div>
                </div>
                <span class="b2w2-rank-delta ${deltaClass}">${deltaText}</span>
              </div>`;
      };
      const visible = list.slice(0, _monthlyPreviewCount);
      const hidden = list.slice(_monthlyPreviewCount);
      return `${visible.map(_renderRow).join('')}${hidden.length ? `
        <div id="${_monthlyRankMoreId}" class="b2w2-more-stack" style="display:none">${hidden.map(_renderRow).join('')}</div>
        <button type="button" id="${_monthlyRankBtnId}" class="b2w2-more-btn" onclick="(function(){const more=document.getElementById('${_monthlyRankMoreId}');const btn=document.getElementById('${_monthlyRankBtnId}');if(!more||!btn)return;const isOpen=more.style.display!=='none';more.style.display=isOpen?'none':'';btn.textContent=isOpen?'순위 더 보기':'순위 접기';})()">순위 더 보기</button>
      ` : ''}`;
    };
    const _renderMonthlyAceCards = (list) => {
      if (!list.length) return `<div class="b2w2-highlight-desc">대학별 에이스를 뽑을 수 있는 기록이 없습니다.</div>`;
      const _renderCard = (item) => {
        const col = (typeof gc === 'function' ? gc(item.u.name) : '#64748b') || '#64748b';
        const ace = item.ace;
        if (!ace) {
          return `
              <div class="b2w2-ace-empty">
                <div class="b2w2-ace-head" style="margin-bottom:0">
                  <div class="b2w2-ace-univ">
                    <span class="b2w2-ace-dot" style="background:${col}"></span>
                    <span class="b2w2-ace-univ-name">${(typeof window.escHTML==='function'?window.escHTML(item.u.name):String(item.u.name||''))}</span>
                  </div>
                  <span class="b2w2-ace-rank">${item.rank}위 대학</span>
                </div>
                <div class="b2w2-ace-empty-title">확실한 에이스 없음</div>
                <div class="b2w2-ace-empty-sub">이번 기간은 기준을 만족한 스트리머가 없습니다. 최소 3전, 승률 50% 이상, 순승 우세 조건을 적용했습니다.</div>
              </div>`;
        }
        const aceTone = (ace.winRate ?? 0) >= 70 && (ace.netWins ?? 0) >= 3
          ? { bg:'var(--b2w-paper-alt)', badgeBg:'rgba(16,185,129,.14)', badgeCol:'var(--green)', badgeBorder:'rgba(16,185,129,.36)', label:'고승률' }
          : (ace.winRate ?? 0) >= 60
            ? { bg:'var(--b2w-paper-alt)', badgeBg:'var(--b2w-tag-accent-bg)', badgeCol:'var(--b2w-accent)', badgeBorder:'var(--b2w-tag-accent-border)', label:'에이스' }
            : { bg:'var(--b2w-paper)', badgeBg:'var(--b2w-paper-alt)', badgeCol:'var(--b2w-ink-mid)', badgeBorder:'var(--b2w-rule)', label:'근소 우세' };
        return `
              <div class="b2w2-ace-card" style="background:${aceTone.bg};border-color:${col}22">
                <div class="b2w2-ace-head">
                  <div class="b2w2-ace-univ">
                    <span class="b2w2-ace-dot" style="background:${col}"></span>
                    <span class="b2w2-ace-univ-name">${(typeof window.escHTML==='function'?window.escHTML(item.u.name):String(item.u.name||''))}</span>
                  </div>
                  <span class="b2w2-ace-rank">${item.rank}위 대학</span>
                </div>
                <div class="b2w2-ace-player">
                  <div class="b2w2-ace-player-main">
                    <div class="b2w2-ace-photo ph-swap" style="--_c:${col}">
                      ${(() => { const _ph = ace.p?.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(ace.p.photo):ace.p.photo) : ''; return _ph ? `<img src="${_ph}" alt="${ace.p?.name||''}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''; })()}
                      ${(typeof _phSwap2ndHTML==='function' && ace.p?.secondProfileFile) ? _phSwap2ndHTML(ace.p.secondProfileFile) : ''}
                      <div class="b2w2-ace-photo-fallback" style="${ace.p?.photo?'display:none':''}">${String(ace.p?.name||'-').trim().slice(0,1)}</div>
                    </div>
                    <div style="min-width:0">
                      <div class="b2w2-ace-player-name" onclick="openPlayerModal('${ace.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${ace.p?.name || '-'}</div>
                      <div class="b2w2-ace-player-sub">
                        <span>${ace.wins}승 ${ace.losses}패</span>
                        <span style="color:${(ace.winRate ?? 0) >= 60 ? 'var(--green)' : (ace.winRate ?? 0) >= 50 ? 'var(--b2w-accent)' : 'var(--gray)'}">승률 ${ace.winRate ?? 0}%</span>
                        <span>순승 +${ace.netWins ?? 0}</span>
                        <span>${ace.total}전</span>
                      </div>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:3px;flex-shrink:0">${_b2WeeklyForm(ace.hist)}</div>
                </div>
                <div class="b2w2-ace-badges">
                  <span class="b2w2-ace-badge" style="background:${aceTone.badgeBg};color:${aceTone.badgeCol};border-color:${aceTone.badgeBorder}">${aceTone.label}</span>
                  ${(ace.netWins || 0) >= 3 ? `<span class="b2w2-ace-badge">순승 강세</span>` : ''}
                </div>
              </div>`;
      };
      const visible = list.slice(0, _monthlyPreviewCount);
      const hidden = list.slice(_monthlyPreviewCount);
      return `${visible.map(_renderCard).join('')}${hidden.length ? `
        <div id="${_monthlyAceMoreId}" class="b2w2-more-stack" style="display:none">${hidden.map(_renderCard).join('')}</div>
        <button type="button" id="${_monthlyAceBtnId}" class="b2w2-more-btn" onclick="(function(){const more=document.getElementById('${_monthlyAceMoreId}');const btn=document.getElementById('${_monthlyAceBtnId}');if(!more||!btn)return;const isOpen=more.style.display!=='none';more.style.display=isOpen?'none':'';btn.textContent=isOpen?'에이스 더 보기':'에이스 접기';})()">에이스 더 보기</button>
      ` : ''}`;
    };
    if (_isMonthly && selUniv === '전체') {
      h += `<section class="b2w2-monthly-grid">
        <article class="b2w2-highlight-card">
          <div class="b2w2-highlight-kicker">University Ranking</div>
          <div class="b2w2-highlight-title">${preset==='thisMonth' ? '이번달 대학 순위' : '지난달 대학 순위'}</div>
          <div class="b2w2-highlight-desc">승 수를 우선으로 정렬하고, 동률일 때 승률과 경기 수를 함께 반영했습니다.</div>
          <div class="b2w2-rank-list">
            ${_renderMonthlyRankRows(rankedUnivLeaders)}
          </div>
        </article>
        <article class="b2w2-highlight-card">
          <div class="b2w2-highlight-kicker">University Aces</div>
          <div class="b2w2-highlight-title">${preset==='thisMonth' ? '대학별 에이스' : '지난달 대학별 에이스'}</div>
          <div class="b2w2-highlight-desc">최소 3전, 승률 50% 이상, 순승 우선 기준으로 뽑았습니다. 조건 미달 대학은 별도 안내로 표시합니다.</div>
          <div class="b2w2-ace-list">
            ${_renderMonthlyAceCards(monthlyUnivAces)}
          </div>
        </article>
      </section>`;
    }

    // ── (기록 없는 대학 안내 섹션 삭제됨)

    // ── MVP 트리플 배너 (MVP + 2위 + 이번주 최악) — 제거됨: 위쪽 하이라이트 카드와 중복되어 삭제

    // ── 전체 대학 차트 (전체 탭일 때만)
    if (selUniv === '전체' && curStats.some(ud=>ud.tg>0)) {
      h += `<div class="b2w2-chart-box">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div class="b2w2-chart-title">📊 대학별 전적 현황 (이번 기간)</div>
          <div style="display:flex;gap:4px;background:var(--surface,#f1f5f9);padding:3px;border-radius:999px">
            <button type="button" onclick="_b2SetWeeklyChartSort('games')" style="font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;border:none;cursor:pointer;background:${_chartSort==='games'?'var(--b2w-paper,#fff)':'transparent'};color:${_chartSort==='games'?'var(--text1)':'var(--text3)'};box-shadow:${_chartSort==='games'?'0 1px 3px rgba(0,0,0,.12)':'none'}">전적순</button>
            <button type="button" onclick="_b2SetWeeklyChartSort('winrate')" style="font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;border:none;cursor:pointer;background:${_chartSort==='winrate'?'var(--b2w-paper,#fff)':'transparent'};color:${_chartSort==='winrate'?'var(--text1)':'var(--text3)'};box-shadow:${_chartSort==='winrate'?'0 1px 3px rgba(0,0,0,.12)':'none'}">승률순</button>
          </div>
        </div>
        ${_b2WeeklyBarChart(curStats)}
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#dc2626;opacity:.9"></div><span style="font-size:10px;font-weight:700;color:var(--text2)">승</span></div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#94a3b8;opacity:.85"></div><span style="font-size:10px;font-weight:700;color:var(--text2)">패</span></div>
          <span style="font-size:10px;color:var(--text3)">우측: 승률 / 경기수</span>
          <span style="font-size:10px;color:var(--text3)">· 막대 길이 = 최다 전적 대학 대비 상대 전적</span>
        </div>
      </div>`;
    }

    // ── 전체 종족 메타 (선택 범위 기준 — 상대 종족전 승률)
    const _metaRaceCount = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    targetStats.forEach(ud => { ['P','T','Z'].forEach(r => { _metaRaceCount[r].w += ud.raceCount[r].w; _metaRaceCount[r].l += ud.raceCount[r].l; }); });
    const _metaHasRace = ['P','T','Z'].some(r => _metaRaceCount[r].w + _metaRaceCount[r].l > 0);
    if (_metaHasRace) {
      const _metaRaceRanked = ['P','T','Z'].map(r => {
        const { w, l } = _metaRaceCount[r];
        const t = w + l;
        return { r, t, wr: t ? Math.round(w/t*100) : null };
      }).filter(x => x.t > 0).sort((a,b) => (b.wr ?? -1) - (a.wr ?? -1));
      const _metaTop = _metaRaceRanked[0];
      const _metaRaceLabel = { P:'프로토스', T:'테란', Z:'저그' };
      h += `<div class="b2w2-chart-box">
        <div class="b2w2-chart-title">⚔️ 종족전 메타 (${selUniv==='전체'?'전체':selUniv} · ${_briefingInfo.short})</div>
        ${_b2WeeklyRaceStats(_metaRaceCount)}
        ${_metaTop ? `<div style="margin-top:8px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">${_metaRaceLabel[_metaTop.r]} 진영이 상대 종족전 승률 ${_metaTop.wr}%로 가장 강세입니다.</div>` : ''}
      </div>`;
    }

    // ── 대학별 카드
    orderedTargetStats.filter(ud=>ud.tg>0).forEach((ud, ui) => {
      const { u, active, tw, tl, tg, wr, raceCount } = ud;
      const color   = (gc ? gc(u.name) : '#64748b') || '#64748b';
      const prevUd  = prevMap[u.name];
      const prevWr  = prevUd && prevUd.tg > 0 ? prevUd.wr : null;
      const wrClass = wr===null?'':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
      const cid     = `b2w2-body-${ui}`;
      const icid    = `b2w2-ic-${ui}`;

      // 대학 MVP
      const univMVP = _b2WeeklyUnivMVP(active);

      // 정렬: 승률→경기수
      const sorted = [...active].sort((a,b) => {
        const ra = a.total?a.wins/a.total:0, rb = b.total?b.wins/b.total:0;
        return ra!==rb?rb-ra:b.total-a.total;
      });

      h += `<div class="b2w2-card" style="border-top:3px solid ${color}">
        <div class="b2w2-card-head" style="background:linear-gradient(135deg, ${color}17 0%, ${color}08 55%, transparent 100%)" onclick="(function(){
          const b=document.getElementById('${cid}');
          const ic=document.getElementById('${icid}');
          const sub=document.getElementById('b2w2-sub-${ui}');
          if(!b)return;
          const show=b.style.display==='none';
          b.style.display=show?'':'none';
          if(ic)ic.textContent=show?'▼':'▶';
          if(sub)sub.style.display=show?'none':'flex';
        })()">
          <div class="b2w2-card-title">
            <div style="min-width:0">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span class="b2w2-card-univ-logo" style="display:inline-flex;flex-shrink:0">${typeof gUI==='function'?gUI(u.name,'18px'):''}</span>
                <div class="b2w2-card-name" style="cursor:pointer" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${u.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')">${(typeof window.escHTML==='function'?window.escHTML(u.name):String(u.name||''))}</div>
              </div>
              <div id="b2w2-sub-${ui}" class="b2w2-card-sub" style="display:none">
                <span>활동 ${active.length}명</span>
                <span><span style="color:${color};font-weight:800">${tg}전</span> <span style="color:var(--win-col,#dc2626);font-weight:800">${tw}승</span> <span style="color:var(--lose-col,#2563eb);font-weight:800">${tl}패</span></span>
                ${wr!==null?`<span style="font-weight:900;color:${wrClass}">승률 ${wr}%${_b2WeeklyDelta(wr,prevWr)}</span>`:''}
              </div>
            </div>
          </div>
          <span id="${icid}" class="b2w2-card-chevron">▼</span>
        </div>
        <div id="${cid}" class="b2w2-card-body">
          <div class="b2w2-card-summary">
            <div class="b2w2-card-kpis">
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">활동 인원</div>
                <div class="b2w2-card-kpi-value">${active.length}명</div>
                <div class="b2w2-card-kpi-sub">이번 기간 출전 스트리머</div>
              </div>
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">팀 전적</div>
                <div class="b2w2-card-kpi-value"><span style="color:var(--win-col,#dc2626)">${tw}승</span> <span style="color:var(--lose-col,#2563eb)">${tl}패</span></div>
                <div class="b2w2-card-kpi-sub">총 <span style="color:${color};font-weight:900">${tg}</span>전 소화</div>
              </div>
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">팀 승률</div>
                <div class="b2w2-card-kpi-value" style="color:${wrClass}">${wr!==null?`${wr}%`:'-'}</div>
                <div class="b2w2-card-kpi-sub">${prevWr!==null&&wr!==null?`전기 대비 ${_b2WeeklyDelta(wr,prevWr)}`:'비교 데이터 없음'}</div>
              </div>
            </div>
            <div class="b2w2-card-spotlight" style="--spot-c:${color}">
              ${univMVP ? `
                <div class="b2w2-card-spotlight-kicker">대학별 에이스</div>
                <div class="b2w2-card-spotlight-body" style="margin-top:8px">
                  <div class="b2w2-card-spotlight-photo ph-swap" style="--_c:${color}">
                    ${(() => { const _ph = univMVP.p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(univMVP.p.photo):univMVP.p.photo) : ''; const _altSafe=(typeof escAttr==='function'?escAttr(univMVP.p.name||''):String(univMVP.p.name||'')); return _ph ? `<img src="${_ph}" alt="${_altSafe}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''; })()}
                    ${(typeof _phSwap2ndHTML==='function' && univMVP.p.secondProfileFile) ? _phSwap2ndHTML(univMVP.p.secondProfileFile) : ''}
                    <div class="b2w2-card-spotlight-photo-fallback" style="${univMVP.p.photo?'display:none':''}">${String(univMVP.p.name||'-').trim().slice(0,1)}</div>
                  </div>
                  <div style="min-width:0;flex:1">
                    <div class="b2w2-card-spotlight-title" style="margin-top:0">
                      <span onclick="openPlayerModal(this.dataset.n);event.stopPropagation()" data-n="${(typeof escAttr==='function'?escAttr(univMVP.p.name||''):String(univMVP.p.name||''))}" style="cursor:pointer;border-bottom:1.5px solid ${color}55">${(typeof window.escHTML==='function'?window.escHTML(univMVP.p.name||''):String(univMVP.p.name||''))}</span>
                      ${univMVP.p.tier?`<span title="${typeof escAttr==='function'?escAttr(_b2TierRankTooltip(univMVP.p.tier)):''}" style="font-size:10px;padding:2px 6px;border-radius:999px;background:${typeof getTierBtnColor==='function' ? getTierBtnColor(univMVP.p.tier) : '#64748b'};color:${typeof getTierBtnTextColor==='function' ? (getTierBtnTextColor(univMVP.p.tier)||'#fff') : '#fff'};cursor:help">${univMVP.p.tier}</span>`:''}
                    </div>
                    <div class="b2w2-card-spotlight-sub">
                      <span style="color:var(--win-col,#dc2626);font-weight:800">${univMVP.wins}승</span>
                      <span style="color:var(--lose-col,#2563eb);font-weight:800">${univMVP.losses}패</span>
                      <span class="b2w2-card-spotlight-wr-badge" style="background:${(univMVP.winRate??0)>=70?'rgba(220,38,38,.12)':(univMVP.winRate??0)>=50?'rgba(245,158,11,.16)':'rgba(100,116,139,.14)'};color:${(univMVP.winRate??0)>=70?'#dc2626':(univMVP.winRate??0)>=50?'#b45309':'#64748b'}">${univMVP.winRate??0}%</span>
                    </div>
                  </div>
                </div>
              ` : `
                <div class="b2w2-card-spotlight-kicker">대학별 에이스</div>
                <div class="b2w2-card-spotlight-title" style="margin-top:6px">이번 기간 확실한 에이스 없음</div>
                <div class="b2w2-card-spotlight-sub">최소 경기 수와 승률 기준을 동시에 만족한 스트리머가 없습니다.</div>
              `}
            </div>
          </div>`;

      // 선수 테이블
      h += `<div class="b2w2-table-wrap"><table class="b2w2-tbl"><thead><tr>
        <th style="width:28px">#</th>
        <th>스트리머</th>
        <th>전체 전적</th>
        <th>최근 폼</th>
      </tr></thead><tbody>`;

      sorted.forEach((s, i) => {
        const { p, wins, losses, total, winRate, offWins, offLosses } = s;
        const wrCls  = winRate===null?'#94a3b8':winRate>=60?'#10b981':winRate>=40?'#f59e0b':'#ef4444';
        const tc2    = typeof getTierBtnColor==='function'&&p.tier?getTierBtnColor(p.tier):'#64748b';
        const tt2    = typeof getTierBtnTextColor==='function'&&p.tier?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
        const medal  = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
        const isMVP  = univMVP && univMVP.p === p;

        // 이전주 비교 (사전 계산된 맵 재사용 — 매 선수마다 재집계하지 않음)
        const prevS    = prevPlayerMap[p.name] || null;
        const prevWr2  = prevS && prevS.total>0 ? prevS.winRate : null;

        const _zebraBg = i % 2 === 1 ? 'var(--surface,#f8fafc)' : 'transparent';
        h += `<tr style="background:${isMVP?'#fef9c322':_zebraBg}">
          <td style="font-size:var(--fs-caption);font-weight:900;color:var(--text3);text-align:center">${medal}</td>
          <td>
            <span onclick="openPlayerModal(this.dataset.n);event.stopPropagation()" data-n="${(typeof escAttr==='function'?escAttr(p.name||''):String(p.name||''))}" style="font-size:var(--fs-base);font-weight:900;color:var(--text1);cursor:pointer;border-bottom:1.5px solid var(--border2);padding-bottom:1px">${(typeof window.escHTML==='function'?window.escHTML(p.name||''):String(p.name||''))}</span>
            ${p.tier?`<span title="${typeof escAttr==='function'?escAttr(_b2TierRankTooltip(p.tier)):''}" style="font-size:var(--fs-sm);padding:1px 5px;border-radius:4px;background:${tc2};color:${tt2};margin-left:3px;cursor:help">${p.tier}</span>`:''}
            ${isMVP?`<span style="font-size:var(--fs-caption);background:#fef9c3;color:#b45309;padding:1px 4px;border-radius:4px;margin-left:3px;font-weight:800">MVP</span>`:''}
          </td>
          <td>
            <div style="display:flex;align-items:baseline;gap:7px;font-family:'Noto Serif KR',Georgia,serif">
              <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text1)">${total}전</span>
              <span style="font-size:var(--fs-caption);font-weight:700;color:var(--b2w-rule-hard,#94a3b8)">·</span>
              <span style="font-size:var(--fs-sm);font-weight:800;color:var(--win-col,#dc2626)">${wins}승</span>
              <span style="font-size:var(--fs-sm);font-weight:800;color:var(--lose-col,#2563eb)">${losses}패</span>
            </div>
            ${winRate!==null?`<div style="margin-top:3px;font-size:var(--fs-caption);font-weight:700;color:${wrCls}">${winRate}%${_b2WeeklyDelta(winRate,prevWr2)}</div>`:''}
          </td>
          <td><div style="display:flex;align-items:center;gap:2px">${_b2WeeklyForm(s.hist)}</div></td>
        </tr>`;
      });

      h += `</tbody></table></div>`;

      // 종족별 통계
      const hasRace = ['P','T','Z'].some(r => raceCount[r].w+raceCount[r].l > 0);
      if (hasRace) {
        h += `<div class="b2w2-race-box">
          <div class="b2w2-race-title">⚔️ 종족별 상대 전적 (대학 전체)</div>
          ${_b2WeeklyRaceStats(raceCount)}
        </div>`;
      }

      h += `</div></div>`;
    });

    h += `</div></div>`;

    // ── 🔊 브리핑 음성듣기(TTS)용 데이터 스냅샷 저장 ──
    // (이 함수 안에서 이미 계산해둔 통계를 그대로 재사용, 별도 재계산 없음)
    try{
      window._b2BriefingSpeakSnapshot = {
        title: _briefingInfo.title,
        isMonthly: _isMonthly,
        dateFrom, dateTo,
        totalGames: _totalGames,
        activeUnivCount: _activeUnivs,
        activePlayerCount: activePlayers.length,
        mvp, mvp2, worstPlayer,
        rankedUnivs: _isMonthly ? rankedUnivs : null,
        topUnivs: !_isMonthly ? topUnivs : null,
        silentUnivs,
        hotPlayer, coldPlayer,
        streakPlayer, loseStreakPlayer,
        bestWrPlayer, mostWinsPlayer, mostActivePlayer
      };
    }catch(e){}

    return h;

  } catch(e) {
    console.error('[_b2WeeklyBriefingView v2] 오류:', e);
    return `<div style="padding:40px;text-align:center;color:#dc2626">브리핑 오류: ${e.message}</div>`;
  }
}

/* ─── 🔊 브리핑 음성듣기(TTS) ─── */
function _b2BriefingBuildSpeakQueue(){
  const d = window._b2BriefingSpeakSnapshot;
  if (!d) return [];
  const fmtDate = s => String(s||'').slice(0,10).replace(/-/g,'.');
  const q = [];

  q.push({text:`${d.title}, ${fmtDate(d.dateFrom)}부터 ${fmtDate(d.dateTo)}까지의 브리핑을 읽어드리겠습니다.`});
  q.push({text:`이 기간 총 경기 수는 ${d.totalGames}경기이고, 활동한 스트리머는 ${d.activePlayerCount}명, 활동한 대학은 ${d.activeUnivCount}곳입니다.`});

  if (d.mvp && d.mvp.p) {
    q.push({text:`${d.isMonthly ? '이달' : '이번 주'} MVP는 ${d.mvp.p.name}입니다. ${d.mvp.wins}승 ${d.mvp.losses}패, 승률 ${d.mvp.winRate}%를 기록했습니다.`});
  }
  if (d.mvp2 && d.mvp2.p) {
    q.push({text:`MVP 2위는 ${d.mvp2.p.name}입니다. ${d.mvp2.wins}승 ${d.mvp2.losses}패, 승률 ${d.mvp2.winRate}%를 기록했습니다.`});
  }
  if (d.worstPlayer && d.worstPlayer.p) {
    q.push({text:`이번 기간 최다 패배는 ${d.worstPlayer.p.name}로, ${d.worstPlayer.wins}승 ${d.worstPlayer.losses}패를 기록했습니다.`});
  }

  if (d.isMonthly && Array.isArray(d.rankedUnivs) && d.rankedUnivs.length) {
    q.push({text:`대학 순위입니다.`});
    d.rankedUnivs.slice(0, 5).forEach((u, i) => {
      q.push({text:`${i+1}위 ${u.u.name}, ${u.tw}승 ${u.tl}패, 승률 ${u.wr ?? 0}%입니다.`});
    });
  } else if (Array.isArray(d.topUnivs) && d.topUnivs.length) {
    q.push({text:`활동량이 많은 대학입니다.`});
    d.topUnivs.forEach((u, i) => {
      q.push({text:`${i+1}위 ${u.u.name}, ${u.tg}경기, 활동 인원 ${u.active.length}명입니다.`});
    });
  }

  if (Array.isArray(d.silentUnivs) && d.silentUnivs.length) {
    q.push({text:`이번 기간 활동이 없었던 대학은 ${d.silentUnivs.join(', ')}입니다.`});
  }

  if (d.hotPlayer && d.hotPlayer.p && d.hotPlayer.wrDelta > 0) {
    q.push({text:`상승세를 보인 스트리머는 ${d.hotPlayer.p.name}로, 승률이 지난 기간보다 ${Math.abs(d.hotPlayer.wrDelta)}퍼센트 포인트 올랐습니다.`});
  }
  if (d.coldPlayer && d.coldPlayer.p && d.coldPlayer.wrDelta < 0) {
    q.push({text:`하락세를 보인 스트리머는 ${d.coldPlayer.p.name}로, 승률이 지난 기간보다 ${Math.abs(d.coldPlayer.wrDelta)}퍼센트 포인트 떨어졌습니다.`});
  }
  if (d.streakPlayer && d.streakPlayer.p && d.streakPlayer.streak >= 2) {
    q.push({text:`${d.streakPlayer.p.name}가 ${d.streakPlayer.streak}연승을 달리고 있습니다.`});
  }
  if (d.loseStreakPlayer && d.loseStreakPlayer.p && d.loseStreakPlayer.streak >= 2) {
    q.push({text:`${d.loseStreakPlayer.p.name}가 ${d.loseStreakPlayer.streak}연패에 빠져 있습니다.`});
  }
  if (d.bestWrPlayer && d.bestWrPlayer.p) {
    q.push({text:`최고 승률은 ${d.bestWrPlayer.p.name}로, 승률 ${d.bestWrPlayer.winRate}%입니다.`});
  }
  if (d.mostWinsPlayer && d.mostWinsPlayer.p) {
    q.push({text:`최다승은 ${d.mostWinsPlayer.p.name}로, ${d.mostWinsPlayer.wins}승을 기록했습니다.`});
  }
  if (d.mostActivePlayer && d.mostActivePlayer.p) {
    q.push({text:`가장 활발히 활동한 스트리머는 ${d.mostActivePlayer.p.name}로, ${d.mostActivePlayer.total}경기를 치렀습니다.`});
  }

  q.push({text:`이상으로 브리핑을 마칩니다.`});
  return q;
}
function _b2BriefingSpeakBtnLabel(){
  const btn = document.getElementById('b2w2-speak-btn');
  if (!btn) return;
  const speaking = !!(window.SUTTS && window.SUTTS.isSpeaking());
  const paused = !speaking && !!(window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused());
  btn.innerHTML = speaking ? '⏸ 일시정지' : (paused ? '▶ 이어듣기' : '🔊 음성듣기');
}
function _b2BriefingToggleSpeak(){
  if (!window.SUTTS || !('speechSynthesis' in window)) { alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); return; }
  if (window.SUTTS.isSpeaking()) { window.SUTTS.pause(); _b2BriefingSpeakBtnLabel(); return; }
  if (window.SUTTS.isPaused && window.SUTTS.isPaused()) { window.SUTTS.resume(); _b2BriefingSpeakBtnLabel(); return; }
  const queue = _b2BriefingBuildSpeakQueue();
  if (!queue.length) { alert('음성으로 읽어줄 브리핑 내용이 없습니다.'); return; }
  window.SUTTS.speak(queue, { onEnd: _b2BriefingSpeakBtnLabel });
  _b2BriefingSpeakBtnLabel();
}
try {
  window._b2BriefingBuildSpeakQueue = _b2BriefingBuildSpeakQueue;
  window._b2BriefingToggleSpeak = _b2BriefingToggleSpeak;
} catch(e){}
