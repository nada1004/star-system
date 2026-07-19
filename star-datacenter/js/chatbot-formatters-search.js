function _resolveTierToken(token) {
  const list = (typeof TIERS !== 'undefined' && Array.isArray(TIERS) && TIERS.length) ? TIERS : ['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스','미정'];
  if (!token) return null;
  const raw = String(token).trim();
  if (list.includes(raw)) return raw;
  const upper = raw.toUpperCase();
  const exactCI = list.find(t => t.toUpperCase() === upper);
  if (exactCI) return exactCI;
  const withSuffix = `${raw}티어`;
  if (list.includes(withSuffix)) return withSuffix;
  return null;
}

function _tierDisplayLabel(t) {
  return t.endsWith('티어') ? t : `${t}티어`;
}

function _raceIcon(race) {
  return race === '테란' ? '🔵' : race === '저그' ? '🟣' : race === '프로토스' ? '🟡' : '⚫';
}

// 티어/승률/종족 검색 공용 선수 목록 행 (클릭 시 해당 선수 기본정보로 이동)
function _searchPlayerRow(p, rightText) {
  const tC = _tierBadgeColors(p.tier);
  return `<div data-chatbot-quick="${escapeAttr(p.name)}" style="display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:9px;cursor:pointer;background:#f8fafc;margin-bottom:4px;border:1px solid #e8edf2">
    <span style="font-size:var(--fs-base);font-weight:700;color:#1a202c;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(p.name)} <span style="font-weight:600;color:#94a3b8;font-size:var(--fs-caption)">${escapeHtml(p.univ||'')}</span></span>
    <span style="font-size:var(--fs-caption);padding:2px 7px;border-radius:6px;font-weight:700;color:${tC[0]};background:${tC[1]};white-space:nowrap">${escapeHtml(p.tier||'미정')}</span>
    <span style="font-size:var(--fs-caption);color:#64748b;white-space:nowrap">${_raceIcon(p.race)} ${escapeHtml(rightText||'')}</span>
  </div>`;
}

function formatTierRanking(tier) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';

  let filteredPlayers = players;
  if (tier) {
    filteredPlayers = players.filter(p => p.tier === tier);
  }

  if (filteredPlayers.length === 0) return `❌ '${tier}' 티어의 선수를 찾을 수 없습니다.`;

  const sortedPlayers = [...filteredPlayers].sort((a, b) => b.elo - a.elo).slice(0, 10);
  const medal = ['🥇','🥈','🥉'];

  const header = _matchCardHeader('🏆', `${tier || '전체'} 랭킹`, `TOP ${sortedPlayers.length}`, 'linear-gradient(135deg,#b45309,#f59e0b)');
  const rows = sortedPlayers.map((p, i) => {
    const tC = _tierBadgeColors(p.tier);
    return `<div data-chatbot-quick="${escapeAttr(p.name)}" style="display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:9px;cursor:pointer;background:#f8fafc;margin-bottom:4px;border:1px solid #e8edf2">
      <span style="font-size:var(--fs-base);font-weight:900;color:#94a3b8;min-width:26px">${medal[i] || (i+1)}</span>
      <span style="font-size:var(--fs-base);font-weight:700;color:#1a202c;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(p.name)} <span style="font-weight:600;color:#94a3b8;font-size:var(--fs-caption)">${escapeHtml(p.univ||'')}</span></span>
      <span style="font-size:var(--fs-caption);padding:2px 7px;border-radius:6px;font-weight:700;color:${tC[0]};background:${tC[1]}">${escapeHtml(p.tier||'미정')}</span>
      <span style="font-size:var(--fs-sm);color:#334155;font-weight:800;white-space:nowrap">ELO ${p.elo}</span>
    </div>`;
  }).join('');

  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:#fff;padding:8px 8px 4px">${rows}</div></div>`;
}

function formatTierRangeSearch(startTier, endTier) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';

  const tiers = (typeof TIERS !== 'undefined' && Array.isArray(TIERS) && TIERS.length) ? TIERS : ['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스','미정'];
  const resolvedStart = _resolveTierToken(startTier);
  const resolvedEnd = _resolveTierToken(endTier);
  const startIndex = resolvedStart ? tiers.indexOf(resolvedStart) : -1;
  const endIndex = resolvedEnd ? tiers.indexOf(resolvedEnd) : -1;

  if (startIndex === -1 || endIndex === -1) return `❌ 유효하지 않은 티어입니다.`;

  const targetTiers = startIndex <= endIndex ? tiers.slice(startIndex, endIndex + 1) : tiers.slice(endIndex, startIndex + 1);
  const filteredPlayers = players.filter(p => targetTiers.includes(p.tier));

  if (filteredPlayers.length === 0) return _noRecordCard('🎖️', `${_tierDisplayLabel(resolvedStart)}~${_tierDisplayLabel(resolvedEnd)} 선수`);

  const sorted = [...filteredPlayers].sort((a, b) => b.elo - a.elo);
  const header = _matchCardHeader('🎖️', `${_tierDisplayLabel(resolvedStart)}~${_tierDisplayLabel(resolvedEnd)} 선수`, `${sorted.length}명__STATS__`, 'linear-gradient(135deg,#0f766e,#0d9488)');
  const rowFn = p => _searchPlayerRow(p, `ELO ${p.elo}`);
  return _renderPaged(`tierrange_${resolvedStart}_${resolvedEnd}`, sorted, 0, 20, header, rowFn, null);
}

function formatTierAboveSearch(tier) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';

  const tiers = (typeof TIERS !== 'undefined' && Array.isArray(TIERS) && TIERS.length) ? TIERS : ['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스','미정'];
  const resolvedTier = _resolveTierToken(tier);
  const tierIndex = resolvedTier ? tiers.indexOf(resolvedTier) : -1;

  if (tierIndex === -1) return `❌ 유효하지 않은 티어입니다.`;

  const targetTiers = tiers.slice(0, tierIndex + 1);
  const filteredPlayers = players.filter(p => targetTiers.includes(p.tier));

  if (filteredPlayers.length === 0) return _noRecordCard('🎖️', `${_tierDisplayLabel(resolvedTier)} 이상 선수`);

  const sorted = [...filteredPlayers].sort((a, b) => b.elo - a.elo);
  const header = _matchCardHeader('🎖️', `${_tierDisplayLabel(resolvedTier)} 이상 선수`, `${sorted.length}명__STATS__`, 'linear-gradient(135deg,#0f766e,#0d9488)');
  const rowFn = p => _searchPlayerRow(p, `ELO ${p.elo}`);
  return _renderPaged(`tierabove_${resolvedTier}`, sorted, 0, 20, header, rowFn, null);
}

function formatWinRateSearch(minRate) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';

  const filteredPlayers = players.filter(p => {
    const total = p.win + p.loss;
    if (total === 0) return false;
    const rate = (p.win / total) * 100;
    return rate >= minRate;
  });

  if (filteredPlayers.length === 0) return _noRecordCard('📊', `승률 ${minRate}% 이상 선수`);

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const rateA = (a.win / (a.win + a.loss)) * 100;
    const rateB = (b.win / (b.win + b.loss)) * 100;
    return rateB - rateA;
  });

  const header = _matchCardHeader('📊', `승률 ${minRate}% 이상 선수`, `${sortedPlayers.length}명__STATS__`, 'linear-gradient(135deg,#1e3a8a,#2563eb)');
  const rowFn = p => {
    const total = p.win + p.loss;
    const rate = ((p.win / total) * 100).toFixed(1);
    return _searchPlayerRow(p, `${rate}% (${p.win}승${p.loss}패)`);
  };
  return _renderPaged(`winrate_${minRate}`, sortedPlayers, 0, 20, header, rowFn, null);
}

function formatRacePlayersSearch(race) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';

  const filteredPlayers = players.filter(p => p.race === race);

  if (filteredPlayers.length === 0) return _noRecordCard('🎮', `${race} 선수`);

  const sorted = [...filteredPlayers].sort((a, b) => b.elo - a.elo);
  const header = _matchCardHeader('🎮', `${race} 선수`, `${sorted.length}명__STATS__`, 'linear-gradient(135deg,#4338ca,#6366f1)');
  const rowFn = p => _searchPlayerRow(p, `ELO ${p.elo}`);
  return _renderPaged(`race_${race}`, sorted, 0, 20, header, rowFn, null);
}

function formatDateRangeSearch(startDate, endDate) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) return `❌ 유효하지 않은 날짜 형식입니다.`;

  const gameDetails = [];
  players.forEach(p => {
    if (!p.history) return;
    p.history.forEach(h => {
      const gameDate = new Date(h.date);
      if (gameDate >= start && gameDate <= end) {
        gameDetails.push({ player: p.name, date: h.date, map: h.map, result: h.result, opp: h.opp });
      }
    });
  });

  if (gameDetails.length === 0) return _noRecordCard('📅', `${startDate} ~ ${endDate} 기간`);

  gameDetails.sort((a, b) => new Date(b.date) - new Date(a.date));

  const header = _matchCardHeader('📅', `${startDate} ~ ${endDate}`, `${gameDetails.length}경기`, 'linear-gradient(135deg,#0f172a,#334155)');
  const rowFn = g => _matchRow(g.date, `${g.player} · ${g.map||''}`, g.result === '승' ? '승' : '패', `vs ${g.opp||''}`, g.result === '승');
  return _renderPaged(`daterange_${startDate}_${endDate}`, gameDetails, 0, 20, header, rowFn, null);
}

function formatOpponentSearch(opponentName) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';

  const gameDetails = [];
  players.forEach(p => {
    if (!p.history) return;
    p.history.forEach(h => {
      if (h.opp && h.opp.includes(opponentName)) {
        gameDetails.push({ player: p.name, date: h.date, map: h.map, result: h.result, opp: h.opp });
      }
    });
  });

  if (gameDetails.length === 0) return _noRecordCard('⚔️', `'${opponentName}'와의 경기`);

  gameDetails.sort((a, b) => new Date(b.date) - new Date(a.date));

  const header = _matchCardHeader('⚔️', `'${opponentName}'와의 경기 기록`, `${gameDetails.length}경기`, 'linear-gradient(135deg,#991b1b,#dc2626)');
  const rowFn = g => _matchRow(g.date, `${g.player} · ${g.map||''}`, g.result === '승' ? '승' : '패', `vs ${g.opp||''}`, g.result === '승');
  return _renderPaged(`opponent_${opponentName}`, gameDetails, 0, 20, header, rowFn, null);
}

try{
  window.formatTierRanking = formatTierRanking;
  window.formatTierRangeSearch = formatTierRangeSearch;
  window.formatTierAboveSearch = formatTierAboveSearch;
  window.formatWinRateSearch = formatWinRateSearch;
  window.formatRacePlayersSearch = formatRacePlayersSearch;
  window.formatDateRangeSearch = formatDateRangeSearch;
  window.formatOpponentSearch = formatOpponentSearch;
}catch(e){}
