async function _chatbotHandleMainCommands(msg, userMessage){
  function _getExactPlayer(name){
    try{
      if (typeof window !== 'undefined' && typeof window._chatbotGetPlayerByName === 'function') {
        return window._chatbotGetPlayerByName(name);
      }
    }catch(e){}
    return typeof players !== 'undefined' ? players.find(p => p.name === name) : null;
  }

  // 🏆 이번주 / 이번달 MVP
  if (/^(이번\s*주|주간)\s*mvp$/.test(userMessage) && typeof formatWeeklyMvp === 'function') {
    return formatWeeklyMvp();
  }
  if (/^(이번\s*달|이번달|월간)\s*mvp$/.test(userMessage) && typeof formatMonthlyMvp === 'function') {
    return formatMonthlyMvp();
  }

  // 🏫 대학 순위 (전체 누적 / 이번주 / 이번달)
  if (/^(이번\s*주|주간)\s*대학\s*(순위|랭킹)$/.test(userMessage) && typeof formatUniversityRanking === 'function') {
    return formatUniversityRanking('week');
  }
  if (/^(이번\s*달|이번달|월간)\s*대학\s*(순위|랭킹)$/.test(userMessage) && typeof formatUniversityRanking === 'function') {
    return formatUniversityRanking('month');
  }
  if (/^대학\s*(순위|랭킹)$/.test(userMessage) && typeof formatUniversityRanking === 'function') {
    return formatUniversityRanking(null);
  }

  // 🏫 대학 승패 기록 (예: "케이대 승패기록", "케이대 승패 기록")
  const univRecordMatch = userMessage.match(/^(.+?)\s*(승패\s*기록)$/);
  if (univRecordMatch && typeof formatUniversityRecord === 'function') {
    const rawName = univRecordMatch[1].trim();
    const universitiesForRecord = (typeof window !== 'undefined' && typeof window._chatbotGetUniversities === 'function')
      ? window._chatbotGetUniversities()
      : [];
    if (universitiesForRecord.length > 0) {
      const univMatch = universitiesForRecord.includes(rawName) ? rawName : findSimilarUniversity(rawName, universitiesForRecord);
      if (univMatch) return formatUniversityRecord(univMatch);
    }
  }

  // 📅 날짜별 "전체 경기결과" 조회 (예: "어제 경기", "오늘 경기결과", "그제 경기")
  const dailyAllMatch = userMessage.match(/^(어제|오늘|그제|그저께)\s*(경기|경기결과|결과)?$/);
  if (dailyAllMatch && typeof formatDailyAllMatches === 'function') {
    const keyword = dailyAllMatch[1];
    const dateStr = typeof _resolveDateKeyword === 'function' ? _resolveDateKeyword(keyword) : null;
    return formatDailyAllMatches(dateStr, `${keyword}(${dateStr})`);
  }

  // 📅 날짜별 "특정 대전유형 결과" 조회 (예: "미니대전 결과", "어제 미니대전 결과", "7월 18일 미니대전 결과")
  const dailyTypeMatch = userMessage.match(/^(어제|오늘|그제|그저께|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}월\s*\d{1,2}일)?\s*(미니대전|대학대전|프로리그|ck)\s*(결과)?$/i);
  if (dailyTypeMatch && (dailyTypeMatch[1] || dailyTypeMatch[3]) && typeof formatDailyTypeResult === 'function') {
    const dateKeyword = dailyTypeMatch[1] || '';
    const dateStr = dateKeyword && typeof _resolveDateKeyword === 'function' ? _resolveDateKeyword(dateKeyword) : null;
    const typeKey = dailyTypeMatch[2].toLowerCase() === 'ck' ? 'ck' : dailyTypeMatch[2];
    return formatDailyTypeResult(typeKey, dateStr, dateKeyword || null);
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
  
  // ⚔️ 스트리머 상대전적 (예: "우힝이 상대전적" → 상대별 승패 전체 요약)
  const oppRecordMatch = userMessage.match(/^([^\s]+)\s*상대\s*전적$/);
  if (oppRecordMatch && typeof formatPlayerOpponentRecord === 'function') {
    const playerName = oppRecordMatch[1];
    let player = _getExactPlayer(playerName);
    if (!player) player = findSimilarPlayer(playerName);
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerOpponentRecord(player);
    return formatPlayerOpponentRecord(player);
  }

  // ⚡ 스트리머 ELO (예: "홍길동 elo", "홍길동 ELO")
  const eloMatch = userMessage.match(/^([^\s]+)\s+elo$/i);
  if (eloMatch && typeof formatPlayerElo === 'function') {
    const playerName = eloMatch[1];
    let player = _getExactPlayer(playerName);
    if (!player) player = findSimilarPlayer(playerName);
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerElo(player);
    return formatPlayerElo(player);
  }

  // 🗺️ 스트리머 맵별 승률 전체 요약 (예: "홍길동 맵별승률", "홍길동 맵별 전적")
  const mapWinRateMatch = userMessage.match(/^([^\s]+)\s*(맵별\s*승률|맵별\s*전적|맵승률)$/);
  if (mapWinRateMatch && typeof formatPlayerMapWinRates === 'function') {
    const playerName = mapWinRateMatch[1];
    let player = _getExactPlayer(playerName);
    if (!player) player = findSimilarPlayer(playerName);
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerMapWinRates(player);
    return formatPlayerMapWinRates(player);
  }

  // 🎮 스트리머 상대종족별 전적 요약(저그/테란/프로토스 한번에)
  const raceBreakdownMatch = userMessage.match(/^([^\s]+)\s*(상대\s*종족별\s*전적|종족별\s*전적|상대종족전적|종족전적)$/);
  if (raceBreakdownMatch && typeof formatPlayerRaceBreakdown === 'function') {
    const playerName = raceBreakdownMatch[1];
    let player = _getExactPlayer(playerName);
    if (!player) player = findSimilarPlayer(playerName);
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    if (player.name !== playerName) return formatFuzzyNote(playerName, player.name) + formatPlayerRaceBreakdown(player);
    return formatPlayerRaceBreakdown(player);
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
    const name1 = h2hMatch[1];
    const name2 = h2hMatch[2];

    // 대학 vs 대학 비교인지 먼저 확인 (선수 이름 매칭보다 우선)
    const universitiesForVs = (typeof window !== 'undefined' && typeof window._chatbotGetUniversities === 'function')
      ? window._chatbotGetUniversities()
      : [];
    if (universitiesForVs.length > 0) {
      const univ1 = universitiesForVs.includes(name1) ? name1 : findSimilarUniversity(name1, universitiesForVs);
      const univ2 = universitiesForVs.includes(name2) ? name2 : findSimilarUniversity(name2, universitiesForVs);
      if (univ1 && univ2) return formatUniversityVsRecord(univ1, univ2);
    }

    const player1Name = name1;
    const player2Name = name2;

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
  
  const tierRangeMatch = userMessage.match(/티어\s*([^\s~]+)\s*~\s*([^\s~]+)/i);
  if (tierRangeMatch) {
    const startTier = tierRangeMatch[1];
    const endTier = tierRangeMatch[2];
    return formatTierRangeSearch(startTier, endTier);
  }
  
  const tierAboveMatch = userMessage.match(/(\S+?)\s*티어\s*이상/i) || userMessage.match(/(유스|미정)\s*이상/i);
  if (tierAboveMatch) {
    const tier = tierAboveMatch[1];
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
