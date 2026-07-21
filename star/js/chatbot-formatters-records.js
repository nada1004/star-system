function formatPlayerPeriodRecord(player, period) {
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  
  const now = new Date();
  let filteredGames = [];
  let periodName = '';
  
  if (period === '이번달') {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    filteredGames = player.history.filter(h => {
      const gameDate = new Date(h.date);
      return gameDate.getMonth() === currentMonth && gameDate.getFullYear() === currentYear;
    });
    periodName = `${currentMonth + 1}월`;
  } else if (period === '이번년도') {
    const currentYear = now.getFullYear();
    filteredGames = player.history.filter(h => {
      const gameDate = new Date(h.date);
      return gameDate.getFullYear() === currentYear;
    });
    periodName = `${currentYear}년`;
  }
  
  if (filteredGames.length === 0) {
    return `📭 ${player.name}의 ${periodName} 경기 기록이 없습니다.`;
  }
  
  const sortedGames = [...filteredGames].sort((a, b) => new Date(b.date) - new Date(a.date));
  const wins = sortedGames.filter(h => h.result === '승').length;
  const losses = sortedGames.length - wins;
  const rate = sortedGames.length > 0 ? ((wins / sortedGames.length) * 100).toFixed(1) : 0;
  
  let result = `📊 ${player.name} ${periodName} 전적\n\n`;
  result += `승: ${wins} | 패: ${losses} | 승률: ${rate}%\n`;
  result += `총 경기 수: ${sortedGames.length}경기\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  sortedGames.slice(0, 30).forEach(h => {
    result += `📅 ${h.date} | ${h.map} | ${h.result} vs ${h.opp}\n`;
  });
  
  return result;
}

function formatPlayerMonthRecord(player, month) {
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  
  const monthGames = player.history.filter(h => h.date && h.date.includes(month));
  if (monthGames.length === 0) {
    return `📭 ${player.name}의 ${month} 전적 기록이 없습니다.`;
  }
  
  const wins = monthGames.filter(h => h.result === '승').length;
  const losses = monthGames.length - wins;
  const rate = monthGames.length > 0 ? ((wins / monthGames.length) * 100).toFixed(1) : 0;
  
  let result = `📅 ${player.name} ${month} 전적\n\n`;
  result += `승: ${wins} | 패: ${losses} | 승률: ${rate}%\n`;
  result += `총 경기 수: ${monthGames.length}경기\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  monthGames.slice(-10).reverse().forEach(h => {
    result += `📅 ${h.date} | ${h.map} | ${h.result} vs ${h.opp}\n`;
  });
  
  return result;
}

function formatPlayerMapRecord(player, mapName) {
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  
  const mapGames = player.history.filter(h => h.map && h.map.toLowerCase().includes(mapName.toLowerCase()));
  if (mapGames.length === 0) {
    return `📭 ${player.name}의 '${mapName}' 맵 전적 기록이 없습니다.`;
  }
  
  const wins = mapGames.filter(h => h.result === '승').length;
  const losses = mapGames.length - wins;
  const rate = mapGames.length > 0 ? ((wins / mapGames.length) * 100).toFixed(1) : 0;
  
  let result = `🗺️ ${player.name} '${mapName}' 맵 전적\n\n`;
  result += `승: ${wins} | 패: ${losses} | 승률: ${rate}%\n`;
  result += `총 경기 수: ${mapGames.length}경기\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  mapGames.slice(-10).reverse().forEach(h => {
    result += `📅 ${h.date} | ${h.result} vs ${h.opp}\n`;
  });
  
  return result;
}

function formatPlayerRaceRecord(player, raceType) {
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  
  const raceMap = { '저그전': '저그', '테란전': '테란', '프로토스전': '프로토스' };
  const targetRace = raceMap[raceType];
  
  const raceGames = player.history.filter(h => {
    if (h.oppRace) {
      return h.oppRace === targetRace;
    }
    if (typeof players !== 'undefined') {
      const oppPlayer = players.find(p => p.name === h.opp);
      if (oppPlayer) {
        return oppPlayer.race === targetRace;
      }
    }
    return false;
  });
  
  if (raceGames.length === 0) {
    return `📭 ${player.name}의 ${raceType} 기록이 없습니다. (상대 종족 정보 부족)`;
  }
  
  const wins = raceGames.filter(h => h.result === '승').length;
  const losses = raceGames.length - wins;
  const rate = raceGames.length > 0 ? ((wins / raceGames.length) * 100).toFixed(1) : 0;
  
  let result = `🎮 ${player.name} ${raceType} 승률\n\n`;
  result += `승: ${wins} | 패: ${losses} | 승률: ${rate}%\n`;
  result += `총 경기 수: ${raceGames.length}경기\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  const sortedRaceGames = [...raceGames].sort((a, b) => new Date(b.date) - new Date(a.date));
  sortedRaceGames.slice(0, 10).forEach(h => {
    result += `📅 ${h.date} | ${h.map} | ${h.result} vs ${h.opp}\n`;
  });
  
  return result;
}

function formatHeadToHeadRecord(player1, player2) {
  if (!player1.history || player1.history.length === 0) {
    return `📭 ${player1.name}의 경기 기록이 없습니다.`;
  }
  
  const h2hMatches = player1.history.filter(h => h.opp === player2.name);
  
  if (h2hMatches.length === 0) {
    return `📭 ${player1.name}과 ${player2.name} 간의 대전 기록이 없습니다.`;
  }
  
  const wins = h2hMatches.filter(h => h.result === '승').length;
  const losses = h2hMatches.length - wins;
  const rate = h2hMatches.length > 0 ? ((wins / h2hMatches.length) * 100).toFixed(1) : 0;
  
  let result = `⚔️ ${player1.name} vs ${player2.name}\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  result += `총 대전: ${h2hMatches.length}경기\n`;
  result += `${player1.name}: ${wins}승 (${rate}%)\n`;
  result += `${player2.name}: ${losses}승 (${(100 - rate).toFixed(1)}%)\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  result += `🕐 최근 대전 기록\n`;
  
  h2hMatches.slice(-10).reverse().forEach(h => {
    result += `📅 ${h.date} | ${h.map} | ${h.result}\n`;
  });
  
  return result;
}

try{
  window.formatPlayerPeriodRecord = formatPlayerPeriodRecord;
  window.formatPlayerMonthRecord = formatPlayerMonthRecord;
  window.formatPlayerMapRecord = formatPlayerMapRecord;
  window.formatPlayerRaceRecord = formatPlayerRaceRecord;
  window.formatHeadToHeadRecord = formatHeadToHeadRecord;
}catch(e){}
