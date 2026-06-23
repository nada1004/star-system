function formatTierRanking(tier) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  let filteredPlayers = players;
  if (tier) {
    filteredPlayers = players.filter(p => p.tier === tier);
  }
  
  if (filteredPlayers.length === 0) return `❌ '${tier}' 티어의 선수를 찾을 수 없습니다.`;
  
  const sortedPlayers = filteredPlayers.sort((a, b) => b.elo - a.elo).slice(0, 10);
  
  let result = `🏆 ${tier || '전체'} 랭킹 (TOP 10)\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  sortedPlayers.forEach((p, i) => {
    result += `${i + 1}. ${p.name} (${p.univ}) - ELO: ${p.elo}\n`;
  });
  
  return result;
}

function formatTierRangeSearch(startTier, endTier) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  const tiers = ['S', 'A', 'B', 'C', 'D'];
  const startIndex = tiers.indexOf(startTier);
  const endIndex = tiers.indexOf(endTier);
  
  if (startIndex === -1 || endIndex === -1) return `❌ 유효하지 않은 티어입니다.`;
  
  const targetTiers = startIndex <= endIndex ? tiers.slice(startIndex, endIndex + 1) : tiers.slice(endIndex, startIndex + 1);
  const filteredPlayers = players.filter(p => targetTiers.includes(p.tier));
  
  if (filteredPlayers.length === 0) return `❌ 해당 티어 범위의 선수를 찾을 수 없습니다.`;
  
  let result = `🎖️ ${startTier}~${endTier} 티어 선수 (총 ${filteredPlayers.length}명)\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  filteredPlayers.slice(0, 20).forEach(p => {
    result += `• ${p.name} (${p.univ}, ${p.race}, ELO: ${p.elo})\n`;
  });
  
  if (filteredPlayers.length > 20) {
    result += `\n... (총 ${filteredPlayers.length}명)`;
  }
  
  return result;
}

function formatTierAboveSearch(tier) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  const tiers = ['S', 'A', 'B', 'C', 'D'];
  const tierIndex = tiers.indexOf(tier);
  
  if (tierIndex === -1) return `❌ 유효하지 않은 티어입니다.`;
  
  const targetTiers = tiers.slice(0, tierIndex + 1);
  const filteredPlayers = players.filter(p => targetTiers.includes(p.tier));
  
  if (filteredPlayers.length === 0) return `❌ ${tier} 티어 이상의 선수를 찾을 수 없습니다.`;
  
  let result = `🎖️ ${tier} 티어 이상 선수 (총 ${filteredPlayers.length}명)\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  filteredPlayers.slice(0, 20).forEach(p => {
    result += `• ${p.name} (${p.univ}, ${p.race}, ELO: ${p.elo})\n`;
  });
  
  if (filteredPlayers.length > 20) {
    result += `\n... (총 ${filteredPlayers.length}명)`;
  }
  
  return result;
}

function formatWinRateSearch(minRate) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  const filteredPlayers = players.filter(p => {
    const total = p.win + p.loss;
    if (total === 0) return false;
    const rate = (p.win / total) * 100;
    return rate >= minRate;
  });
  
  if (filteredPlayers.length === 0) return `❌ 승률 ${minRate}% 이상의 선수를 찾을 수 없습니다.`;
  
  const sortedPlayers = filteredPlayers.sort((a, b) => {
    const rateA = (a.win / (a.win + a.loss)) * 100;
    const rateB = (b.win / (b.win + b.loss)) * 100;
    return rateB - rateA;
  });
  
  let result = `📊 승률 ${minRate}% 이상 선수 (총 ${filteredPlayers.length}명)\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  sortedPlayers.slice(0, 20).forEach(p => {
    const total = p.win + p.loss;
    const rate = ((p.win / total) * 100).toFixed(1);
    result += `• ${p.name} (${p.univ}) - ${rate}% (${p.win}승 ${p.loss}패)\n`;
  });
  
  if (filteredPlayers.length > 20) {
    result += `\n... (총 ${filteredPlayers.length}명)`;
  }
  
  return result;
}

function formatRacePlayersSearch(race) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  const filteredPlayers = players.filter(p => p.race === race);
  
  if (filteredPlayers.length === 0) return `❌ ${race} 선수를 찾을 수 없습니다.`;
  
  let result = `🎮 ${race} 선수 (총 ${filteredPlayers.length}명)\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  filteredPlayers.slice(0, 20).forEach(p => {
    result += `• ${p.name} (${p.univ}, ${p.tier}, ELO: ${p.elo})\n`;
  });
  
  if (filteredPlayers.length > 20) {
    result += `\n... (총 ${filteredPlayers.length}명)`;
  }
  
  return result;
}

function formatDateRangeSearch(startDate, endDate) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start) || isNaN(end)) return `❌ 유효하지 않은 날짜 형식입니다.`;
  
  let totalGames = 0;
  const gameDetails = [];
  
  players.forEach(p => {
    if (!p.history) return;
    
    p.history.forEach(h => {
      const gameDate = new Date(h.date);
      if (gameDate >= start && gameDate <= end) {
        totalGames++;
        gameDetails.push({
          player: p.name,
          date: h.date,
          map: h.map,
          result: h.result,
          opp: h.opp
        });
      }
    });
  });
  
  if (totalGames === 0) return `❌ 해당 기간의 경기 기록을 찾을 수 없습니다.`;
  
  gameDetails.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let result = `📅 ${startDate} ~ ${endDate} 기간 경기 기록 (총 ${totalGames}경기)\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  gameDetails.slice(0, 20).forEach(g => {
    result += `📅 ${g.date} | ${g.player} | ${g.map} | ${g.result} vs ${g.opp}\n`;
  });
  
  if (gameDetails.length > 20) {
    result += `\n... (총 ${totalGames}경기)`;
  }
  
  return result;
}

function formatOpponentSearch(opponentName) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  let totalGames = 0;
  const gameDetails = [];
  
  players.forEach(p => {
    if (!p.history) return;
    
    p.history.forEach(h => {
      if (h.opp && h.opp.includes(opponentName)) {
        totalGames++;
        gameDetails.push({
          player: p.name,
          date: h.date,
          map: h.map,
          result: h.result,
          opp: h.opp
        });
      }
    });
  });
  
  if (totalGames === 0) return `❌ '${opponentName}'와의 경기 기록을 찾을 수 없습니다.`;
  
  gameDetails.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let result = `⚔️ '${opponentName}'와의 경기 기록 (총 ${totalGames}경기)\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  gameDetails.slice(0, 20).forEach(g => {
    result += `📅 ${g.date} | ${g.player} | ${g.map} | ${g.result} vs ${g.opp}\n`;
  });
  
  if (gameDetails.length > 20) {
    result += `\n... (총 ${totalGames}경기)`;
  }
  
  return result;
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
