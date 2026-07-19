async function _chatbotHandleMainCommands(msg, userMessage){
  function _getExactPlayer(name){
    try{
      if (typeof window !== 'undefined' && typeof window._chatbotGetPlayerByName === 'function') {
        return window._chatbotGetPlayerByName(name);
      }
    }catch(e){}
    return typeof players !== 'undefined' ? players.find(p => p.name === name) : null;
  }

  if (msg.includes('최근전적')) {
    const nameMatch = userMessage.match(/([^\s]+)\s+최근전적/);
    if (nameMatch) {
      const playerName = nameMatch[1];
      let player = _getExactPlayer(playerName);
      if (!player) player = findSimilarPlayer(playerName);
      if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
      if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerRecentRecord(player);
      return formatPlayerRecentRecord(player);
    }
  }
  
  if (msg.includes('통계')) {
    const nameMatch = userMessage.match(/([^\s]+)\s+통계/);
    if (nameMatch) {
      const playerName = nameMatch[1];
      let player = _getExactPlayer(playerName);
      if (!player) player = findSimilarPlayer(playerName);
      if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
      if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerStats(player);
      return formatPlayerStats(player);
    }
  }
  
  const monthMatch = userMessage.match(/([^\s]+)\s+(\d+)월\s+전적/i);
  if (monthMatch) {
    const playerName = monthMatch[1];
    const month = monthMatch[2];
    let player = _getExactPlayer(playerName);
    if (!player) player = findSimilarPlayer(playerName);
    if (player) {
      if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerMonthRecord(player, month);
      return formatPlayerMonthRecord(player, month);
    }
  }
  
  const thisMonthMatch = userMessage.match(/([^\s]+)\s+(이번달|이번년도)\s+전적/i);
  if (thisMonthMatch) {
    const playerName = thisMonthMatch[1];
    const period = thisMonthMatch[2];
    let player = _getExactPlayer(playerName);
    if (!player) player = findSimilarPlayer(playerName);
    if (player) {
      if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerPeriodRecord(player, period);
      return formatPlayerPeriodRecord(player, period);
    }
  }
  
  const raceMatch = userMessage.match(/([^\s]+)\s+(저그전|테란전|프로토스전)/);
  if (raceMatch) {
    const playerName = raceMatch[1];
    const race = raceMatch[2];
    let player = _getExactPlayer(playerName);
    if (!player) player = findSimilarPlayer(playerName);
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerRaceRecord(player, race);
    return formatPlayerRaceRecord(player, race);
  }
  
  const raceOnlyMatch = userMessage.match(/^(저그전|테란전|프로토스전)$/);
  if (raceOnlyMatch) {
    const race = raceOnlyMatch[1];
    return formatRacePlayersSearch(race === '저그전' ? '저그' : race === '테란전' ? '테란' : '프로토스');
  }
  
  const matchTypePatterns = [
    { key: '미니대전', fn: formatPlayerMiniM },
    { key: '대학대전', fn: formatPlayerUnivM },
    { key: '프로리그', fn: formatPlayerProM },
    { key: 'ck', fn: formatPlayerCkM },
    { key: 'CK', fn: formatPlayerCkM },
    { key: '개인전', fn: formatPlayerIndM },
    { key: '끝장전', fn: formatPlayerGjM },
    { key: '티어대회', fn: formatPlayerTtM },
    { key: '대회기록', fn: (p) => formatPlayerCompOnly(p) },
    { key: '전체기록', fn: formatPlayerAllRecords },
    { key: '기록요약', fn: formatPlayerAllRecords },
  ];
  for (const p of matchTypePatterns) {
    if (msg.includes(p.key)) {
      const nm = userMessage.replace(p.key.toLowerCase(),'').trim();
      const playerName = nm.split(/\s/)[0];
      if (playerName) {
        let player = _getExactPlayer(playerName);
        if (!player) player = findSimilarPlayer(playerName);
        if (player) {
          if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + p.fn(player);
          return p.fn(player);
        }
        return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
      }
    }
  }

  if (msg.includes('대회') && !msg.includes('티어대회') && !msg.includes('일정') && !msg.includes('목록') && !msg.includes('브라켓') && !msg.includes('대회기록')) {
    const dcMatch = userMessage.match(/([^\s]+)\s+대회/);
    if (dcMatch) {
      const playerName = dcMatch[1];
      let player = _getExactPlayer(playerName);
      if (!player) player = findSimilarPlayer(playerName);
      if (player) {
        if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerCompOnly(player);
        return formatPlayerCompOnly(player);
      }
    }
  }

  const mapMatch = userMessage.match(/([^\s]+)\s+(.+)$/);
  if (mapMatch && !msg.includes('전적') && !msg.includes('최근') && !msg.includes('통계') && !msg.includes('vs')) {
    const playerName = mapMatch[1];
    const mapName = mapMatch[2];
    let player = _getExactPlayer(playerName);
    if (!player) player = findSimilarPlayer(playerName);
    if (player) {
      if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerMapRecord(player, mapName);
      return formatPlayerMapRecord(player, mapName);
    }
  }
  
  const h2hMatch = userMessage.match(/([^\s]+)\s+vs\s+([^\s]+)/i);
  if (h2hMatch) {
    const player1Name = h2hMatch[1];
    const player2Name = h2hMatch[2];
    
    let player1 = _getExactPlayer(player1Name);
    let player2 = _getExactPlayer(player2Name);
    
    if (!player1) player1 = findSimilarPlayer(player1Name);
    if (!player2) player2 = findSimilarPlayer(player2Name);
    
    if (!player1) return `❌ '${player1Name}' 선수를 찾을 수 없습니다.`;
    if (!player2) return `❌ '${player2Name}' 선수를 찾을 수 없습니다.`;

    let h2hNote = '';
    if (player1.name !== player1Name) h2hNote += formatFuzzyNote(player1Name, player1.name);
    if (player2.name !== player2Name) h2hNote += formatFuzzyNote(player2Name, player2.name);

    return h2hNote + formatHeadToHeadRecord(player1, player2);
  }
  
  if (msg.includes('랭킹')) {
    const tierMatch = userMessage.match(/([^\s]+)\s+랭킹/);
    if (tierMatch) {
      const tier = tierMatch[1];
      return formatTierRanking(tier);
    }
    return formatTierRanking('');
  }
  
  const univVsMatch = userMessage.match(/([^\s]+)\s+vs\s+([^\s]+)/i);
  if (univVsMatch) {
    const univ1 = univVsMatch[1];
    const univ2 = univVsMatch[2];
    return formatUniversityVsRecord(univ1, univ2);
  }
  
  const singleWordMatch = userMessage.match(/^([^\s]+)$/);
  if (singleWordMatch) {
    const query = singleWordMatch[1];
    const universities = (typeof window !== 'undefined' && typeof window._chatbotGetUniversities === 'function')
      ? window._chatbotGetUniversities()
      : (typeof players !== 'undefined'
          ? [...new Set([
              ...players.map(p => p.univ).filter(Boolean),
              ...(typeof univCfg !== 'undefined' ? univCfg.map(u => u && u.name).filter(Boolean) : [])
            ])]
          : []);

    if (universities.includes(query)) return formatUniversityInfo(query);

    let player = _getExactPlayer(query);

    if (!player) {
      const similarPlayer = findSimilarPlayer(query);
      if (similarPlayer && levenshteinDistance(query, similarPlayer.name) <= 2) {
        player = similarPlayer;
      }
    }
    if (player) {
      if (player.name !== query) return formatFuzzyNote(query, player.name) + formatPlayerBasicInfo(player);
      return formatPlayerBasicInfo(player);
    }

    const koreanConsonantsOnly = /^[ㄱ-ㅎ]+$/;
    if (!koreanConsonantsOnly.test(query)) {
      const similarUniv = findSimilarUniversity(query, universities);
      if (similarUniv) return formatUniversityInfo(similarUniv);
    }

    if (typeof players !== 'undefined' && players.length > 0) {
      // 아무 매칭도 안 될 때: 랜덤 스트리머 / 랜덤 대학 정보를 반반 확률로 소개
      const showUniv = universities.length > 0 && Math.random() < 0.5;
      if (showUniv) {
        const randomUniv = universities[Math.floor(Math.random() * universities.length)];
        return formatChatNote(`🔍 '${query}'을(를) 찾을 수 없어 랜덤 대학 정보를 소개합니다!`) + formatUniversityInfo(randomUniv);
      }
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      return formatChatNote(`🔍 '${query}'을(를) 찾을 수 없어 랜덤 스트리머를 소개합니다!`) + formatPlayerBasicInfo(randomPlayer);
    }
    return '검색 자료가 없습니다.';
  }
  
  const tierRangeMatch = userMessage.match(/티어\s*([A-Z])\s*~\s*([A-Z])/i);
  if (tierRangeMatch) {
    const startTier = tierRangeMatch[1].toUpperCase();
    const endTier = tierRangeMatch[2].toUpperCase();
    return formatTierRangeSearch(startTier, endTier);
  }
  
  const tierAboveMatch = userMessage.match(/([A-Z])\s*티어\s*이상/i);
  if (tierAboveMatch) {
    const tier = tierAboveMatch[1].toUpperCase();
    return formatTierAboveSearch(tier);
  }
  
  const winRateMatch = userMessage.match(/승률\s*(\d+)%\s*이상/i);
  if (winRateMatch) {
    const minRate = parseInt(winRateMatch[1]);
    return formatWinRateSearch(minRate);
  }
  
  const racePlayersMatch = userMessage.match(/(저그|테란|프로토스)\s*선수/i);
  if (racePlayersMatch) {
    const race = racePlayersMatch[1];
    return formatRacePlayersSearch(race);
  }
  
  const dateRangeMatch = userMessage.match(/(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/);
  if (dateRangeMatch) {
    const startDate = dateRangeMatch[1];
    const endDate = dateRangeMatch[2];
    return formatDateRangeSearch(startDate, endDate);
  }
  
  const opponentMatch = userMessage.match(/(.+?)전$/);
  if (opponentMatch) {
    const opponentName = opponentMatch[1];
    return formatOpponentSearch(opponentName);
  }
  
  if (msg.includes('대회') || msg.includes('리그') || msg.includes('컵') || msg.includes('브라켓') || msg.includes('일정')) {
    if (msg.includes('일정') || msg.includes('브라켓')) {
      return formatTournamentSchedule();
    }
    if (msg.includes('리그') || msg.includes('컵')) {
      return formatTournamentList();
    }
    return formatTournamentSchedule();
  }
  
  const tournamentMatch = userMessage.match(/(.+?)\s+대회$/);
  if (tournamentMatch) {
    const tournamentName = tournamentMatch[1];
    return formatTournamentInfo(tournamentName);
  }
  
  const teamTournamentMatch = userMessage.match(/(.+?)\s+대회\s+기록$/);
  if (teamTournamentMatch) {
    const teamName = teamTournamentMatch[1];
    return formatTeamTournamentRecord(teamName);
  }
  
  const tournamentStatsMatch = userMessage.match(/(.+?)\s+대회\s+통계$/);
  if (tournamentStatsMatch) {
    const tournamentName = tournamentStatsMatch[1];
    return formatTournamentStats(tournamentName);
  }
  
  if (/^(안녕|ㅎㅇ|하이|hi|hello|hey|ㅋㅋ|반가|잘있었|오랜만)/i.test(msg)) {
    const greetings = [
      '안녕하세요! 저는 알등이입니다 😊 스트리머 전적, 대학 정보, 랭킹 뭐든지 물어보세요!',
      '안녕하세요! 알등이 챗봇입니다 🤖 \"도움\"을 입력하면 명령어를 알려드릴게요!',
      '반갑습니다! 스타대학 데이터 분석 AI 알등이입니다 ✨ 궁금한 스트리머 이름을 입력해보세요!',
    ];
    return greetings[Math.floor(Math.random()*greetings.length)];
  }

  if (/고마워|감사|최고|굿|잘했|대단/.test(msg)) {
    return '감사합니다 😊 더 궁금한 게 있으면 언제든지 물어보세요!';
  }

  return null;
}

try{
  window._chatbotHandleMainCommands = window._chatbotHandleMainCommands || _chatbotHandleMainCommands;
}catch(e){}
