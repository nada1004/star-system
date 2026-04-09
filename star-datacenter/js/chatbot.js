// 알등이 - 스타대학 데이터 분석 챗봇
// Aldeungi - StarCraft University Data Analysis Chatbot

let chatHistory = [];
let chatbotOpen = false;

// 챗봇 초기화
function initChatbot() {
  loadChatHistory();
  renderChatHistory();
}

// 페이지 로드 시 챗봇 초기화 (데이터 로드 후 실행)
window.addEventListener('DOMContentLoaded', function() {
  // 데이터 로드 대기
  setTimeout(initChatbot, 1000);
});

// 채팅 기록 로드
function loadChatHistory() {
  const saved = localStorage.getItem('su_chat_history');
  if (saved) {
    chatHistory = JSON.parse(saved);
  }
}

// 채팅 기록 저장
function saveChatHistory() {
  localStorage.setItem('su_chat_history', JSON.stringify(chatHistory));
}

// 채팅 기록 렌더링
function renderChatHistory() {
  const container = document.getElementById('chatMessages');
  if (!container) {
    console.warn('Chat messages container not found');
    return;
  }
  
  container.innerHTML = '';
  
  chatHistory.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`;
    
    const avatar = msg.role === 'user' ? '👤' : '<img src="https://i.ibb.co/Y7GXGXtv/11e55f999b9d.png" style="width:32px;height:32px;object-fit:contain">';
    const content = msg.content;
    
    msgDiv.innerHTML = `
      <div class="chat-avatar">${avatar}</div>
      <div class="chat-content">${content}</div>
    `;
    
    container.appendChild(msgDiv);
  });
  
  // 스크롤을 하단으로
  container.scrollTop = container.scrollHeight;
}

// 메시지 추가
function addMessage(role, content) {
  chatHistory.push({ role, content, timestamp: Date.now() });
  saveChatHistory();
  renderChatHistory();
}

// 챗봇 모달 열기
function openChatbot() {
  chatbotOpen = true;
  const overlay = document.getElementById('chatbotOverlay');
  if (overlay) {
    overlay.classList.add('open');
    overlay.style.display = 'flex';
    setTimeout(() => {
      document.getElementById('chatInput')?.focus();
    }, 100);
  }
}

// 챗봇 모달 닫기
function closeChatbot(e) {
  if (e && e.target !== document.getElementById('chatbotOverlay')) return;
  chatbotOpen = false;
  const overlay = document.getElementById('chatbotOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  }
}

// 메시지 전송
function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // 사용자 메시지 추가
  addMessage('user', message);
  input.value = '';
  
  // 로딩 인디케이터 추가
  const container = document.getElementById('chatMessages');
  if (container) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message bot-message';
    loadingDiv.id = 'chatbot-loading';
    loadingDiv.innerHTML = `
      <div class="chat-avatar"><img src="https://i.ibb.co/Y7GXGXtv/11e55f999b9d.png" style="width:32px;height:32px;object-fit:contain"></div>
      <div class="chat-content">...</div>
    `;
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
  }
  
  // 챗봇 응답 생성
  setTimeout(() => {
    // 로딩 인디케이터 제거
    const loadingEl = document.getElementById('chatbot-loading');
    if (loadingEl) loadingEl.remove();
    
    const response = generateResponse(message);
    addMessage('bot', response);
  }, 300);
}

// 엔터키로 메시지 전송
function handleChatInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// 채팅 기록 지우기
function clearChatHistory() {
  if (confirm('채팅 기록을 모두 지우시겠습니까?')) {
    chatHistory = [];
    saveChatHistory();
    renderChatHistory();
  }
}

// 퍼지 매칭을 위한 유사도 계산
function findSimilarPlayer(name) {
  if (typeof players === 'undefined') return null;
  
  const lowerName = name.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  
  players.forEach(player => {
    const lowerPlayerName = player.name.toLowerCase();
    // 정확히 일치하면 점수 100
    if (lowerPlayerName === lowerName) {
      bestMatch = player;
      bestScore = 100;
      return;
    }
    
    // 포함되면 점수 80
    if (lowerPlayerName.includes(lowerName) || lowerName.includes(lowerPlayerName)) {
      if (bestScore < 80) {
        bestMatch = player;
        bestScore = 80;
      }
      return;
    }
    
    // 레벤슈타인 거리 계산
    const distance = levenshteinDistance(lowerName, lowerPlayerName);
    const maxLen = Math.max(lowerName.length, lowerPlayerName.length);
    const similarity = ((maxLen - distance) / maxLen) * 100;
    
    if (similarity > 60 && similarity > bestScore) {
      bestMatch = player;
      bestScore = similarity;
    }
  });
  
  return bestScore >= 70 ? bestMatch : null;
}

// 레벤슈타인 거리 계산
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }
  
  return dp[m][n];
}

// 챗봇 응답 생성
function generateResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  // 도움말
  if (msg.includes('도움') || msg.includes('help') || msg.includes('?') || msg.includes('명령')) {
    return `🤖 알등이 사용 가능한 명령어 모음\n\n` +
           `1️⃣ 선수 정보 조회\n` +
           `• '스트리머명' : 프로필, 티어, 전체 전적\n` +
           `• '스트리머명 최근전적' : 최근 30경기 기록\n` +
           `• '스트리머명 통계' : 통계\n` +
           `• '스트리머명 5월 전적' : 특정 월 전적\n` +
           `• '스트리머명 저그전' : 특정 종족전 승률\n` +
           `• '스트리머명 맵명' : 특정 맵 전적\n\n` +
           `2️⃣ 대학 정보\n` +
           `• '대학명' : 소속 선수 및 대학 로고`;
  }
  
  // 선수 이름 + 최근전적 (선수 관련 패턴 먼저 체크)
  if (msg.includes('최근전적')) {
    const nameMatch = userMessage.match(/([^\s]+)\s+최근전적/);
    if (nameMatch) {
      const playerName = nameMatch[1];
      let player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
      // 퍼지 매칭 시도
      if (!player) player = findSimilarPlayer(playerName);
      if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
      if (player.name !== playerName) return `🤔 '${playerName}' 대신 '${player.name}'을 찾았습니다.\n\n` + formatPlayerRecentRecord(player);
      return formatPlayerRecentRecord(player);
    }
  }
  
  // 선수 이름 + 통계
  if (msg.includes('통계')) {
    const nameMatch = userMessage.match(/([^\s]+)\s+통계/);
    if (nameMatch) {
      const playerName = nameMatch[1];
      let player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
      if (!player) player = findSimilarPlayer(playerName);
      if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
      if (player.name !== playerName) return `🤔 '${playerName}' 대신 '${player.name}'을 찾았습니다.\n\n` + formatPlayerStats(player);
      return formatPlayerStats(player);
    }
  }
  
  // 선수 이름 + 월 전적
  const monthMatch = userMessage.match(/([^\s]+)\s+(\d+월)\s+전적/);
  if (monthMatch) {
    const playerName = monthMatch[1];
    const month = monthMatch[2];
    let player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
    if (!player) player = findSimilarPlayer(playerName);
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    if (player.name !== playerName) return `🤔 '${playerName}' 대신 '${player.name}'을 찾았습니다.\n\n` + formatPlayerMonthRecord(player, month);
    return formatPlayerMonthRecord(player, month);
  }
  
  // 선수 이름 + 종족전
  const raceMatch = userMessage.match(/([^\s]+)\s+(저그전|테란전|프로토스전)/);
  if (raceMatch) {
    const playerName = raceMatch[1];
    const race = raceMatch[2];
    let player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
    if (!player) player = findSimilarPlayer(playerName);
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    if (player.name !== playerName) return `🤔 '${playerName}' 대신 '${player.name}'을 찾았습니다.\n\n` + formatPlayerRaceRecord(player, race);
    return formatPlayerRaceRecord(player, race);
  }
  
  // 선수 이름 + 맵명 (맵별 전적)
  const mapMatch = userMessage.match(/([^\s]+)\s+(.+)$/);
  if (mapMatch && !msg.includes('전적') && !msg.includes('최근') && !msg.includes('통계') && !msg.includes('vs')) {
    const playerName = mapMatch[1];
    const mapName = mapMatch[2];
    let player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
    if (!player) player = findSimilarPlayer(playerName);
    if (player) {
      if (player.name !== playerName) return `🤔 '${playerName}' 대신 '${player.name}'을 찾았습니다.\n\n` + formatPlayerMapRecord(player, mapName);
      return formatPlayerMapRecord(player, mapName);
    }
  }
  
  // 선수 대 선수 전적 (head-to-head)
  const h2hMatch = userMessage.match(/([^\s]+)\s+vs\s+([^\s]+)/i);
  if (h2hMatch) {
    const player1Name = h2hMatch[1];
    const player2Name = h2hMatch[2];
    
    let player1 = typeof players !== 'undefined' ? players.find(p => p.name === player1Name) : null;
    let player2 = typeof players !== 'undefined' ? players.find(p => p.name === player2Name) : null;
    
    if (!player1) player1 = findSimilarPlayer(player1Name);
    if (!player2) player2 = findSimilarPlayer(player2Name);
    
    if (!player1) return `❌ '${player1Name}' 선수를 찾을 수 없습니다.`;
    if (!player2) return `❌ '${player2Name}' 선수를 찾을 수 없습니다.`;
    
    let resultMsg = '';
    if (player1.name !== player1Name) resultMsg = `🤔 '${player1Name}' 대신 '${player1.name}'을 찾았습니다.\n\n`;
    if (player2.name !== player2Name) resultMsg += `🤔 '${player2Name}' 대신 '${player2.name}'을 찾았습니다.\n\n`;
    
    return resultMsg + formatHeadToHeadRecord(player1, player2);
  }
  
  // 티어 랭킹
  if (msg.includes('랭킹')) {
    const tierMatch = userMessage.match(/([^\s]+)\s+랭킹/);
    if (tierMatch) {
      const tier = tierMatch[1];
      return formatTierRanking(tier);
    }
    return formatTierRanking('');
  }
  
  // 대학 대항전 비교 (더 구체적인 패턴)
  const univVsMatch = userMessage.match(/([^\s]+)\s+vs\s+([^\s]+)/i);
  if (univVsMatch) {
    const univ1 = univVsMatch[1];
    const univ2 = univVsMatch[2];
    return formatUniversityVsRecord(univ1, univ2);
  }
  
  // 선수 이름만 입력된 경우 - 기본 정보
  const playerOnlyMatch = userMessage.match(/^([^\s]+)$/);
  if (playerOnlyMatch) {
    const playerName = playerOnlyMatch[1];
    // 선수 먼저 확인
    let player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
    // 퍼지 매칭 시도
    if (!player) player = findSimilarPlayer(playerName);
    if (player) {
      if (player.name !== playerName) return `🤔 '${playerName}' 대신 '${player.name}'을 찾았습니다.\n\n` + formatPlayerBasicInfo(player);
      return formatPlayerBasicInfo(player);
    }
    
    // 선수가 없으면 대학 정보 확인
    return formatUniversityInfo(playerName);
  }
  
  // 인사
  if (msg.includes('안녕') || msg.includes('hello') || msg.includes('hi')) {
    return '안녕하세요! 알등이입니다. 스타대학 데이터에 대해 궁금한 점이 있으신가요? 😊';
  }
  
  // 기본 응답
  return `죄송합니다, 질문을 잘 이해하지 못했어요. 😅\n` +
         `도움말을 보려면 "도움" 또는 "?"를 입력해주세요!`;
}

// 선수 기본 정보
function formatPlayerBasicInfo(player) {
  const total = player.win + player.loss;
  const rate = total > 0 ? ((player.win / total) * 100).toFixed(1) : 0;
  
  if (player.photo) {
    // 프로필 사진 카드로 전체 표시
    return `<div style="display:flex;flex-direction:column;align-items:center;padding:16px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;margin-bottom:12px">
      <img src="${player.photo}" style="width:120px;height:120px;object-fit:cover;border-radius:50%;border:4px solid rgba(255,255,255,0.3);box-shadow:0 4px 15px rgba(0,0,0,0.2)">
      <div style="color:white;text-align:center;margin-top:12px">
        <div style="font-size:18px;font-weight:700;margin-bottom:4px">${player.name}</div>
        <div style="font-size:14px;opacity:0.9">${player.univ}</div>
        <div style="font-size:12px;margin-top:8px;opacity:0.8">
          🎖️ ${player.tier} | 🎮 ${player.race} | ⭐ ${player.elo}
        </div>
        <div style="font-size:14px;margin-top:8px;font-weight:600">
          ${player.win}승 ${player.loss}패 (${rate}%)
        </div>
      </div>
    </div>
    <div style="margin-top:12px">
      <div style="font-size:14px;color:var(--text3)">📝 총 ${total}경기</div>
    </div>`;
  }
  
  // 사진이 없는 경우 기본 텍스트 표시
  return `👤 ${player.name} 선수 정보\n\n` +
         `🏫 소속: ${player.univ}\n` +
         `🎖️ 티어: ${player.tier}\n` +
         `🎮 종족: ${player.race}\n` +
         `⭐ ELO: ${player.elo}\n` +
         `📊 전체 전적: ${player.win}승 ${player.loss}패 (${rate}%)\n` +
         `📝 총 경기 수: ${total}경기`;
}

// 선수 최근 전적
function formatPlayerRecentRecord(player) {
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  
  const recentGames = player.history.slice(-30).reverse();
  const wins = recentGames.filter(h => h.result === '승').length;
  const losses = recentGames.length - wins;
  const rate = recentGames.length > 0 ? ((wins / recentGames.length) * 100).toFixed(1) : 0;
  
  let result = `📊 ${player.name} 최근 30경기 전적\n\n`;
  result += `승: ${wins} | 패: ${losses} | 승률: ${rate}%\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  recentGames.forEach(h => {
    result += `📅 ${h.date} | ${h.map} | ${h.result} vs ${h.opp}\n`;
  });
  
  return result;
}

// 선수 통계
function formatPlayerStats(player) {
  const total = player.win + player.loss;
  const rate = total > 0 ? ((player.win / total) * 100).toFixed(1) : 0;
  
  let stats = `📊 ${player.name} 통계\n\n`;
  stats += `━━━━━━━━━━━━━━━━━━\n`;
  stats += `👤 기본 정보\n`;
  stats += `이름: ${player.name}\n`;
  stats += `소속: ${player.univ}\n`;
  stats += `티어: ${player.tier}\n`;
  stats += `종족: ${player.race}\n`;
  stats += `ELO: ${player.elo}\n\n`;
  
  stats += `📈 전적\n`;
  stats += `승: ${player.win}\n`;
  stats += `패: ${player.loss}\n`;
  stats += `승률: ${rate}%\n`;
  stats += `총 경기 수: ${total}\n\n`;
  
  // 최근 10경기 승률
  if (player.history && player.history.length > 0) {
    const recentMatches = player.history.slice(-10);
    const recentWins = recentMatches.filter(h => h.result === '승').length;
    const recentRate = recentMatches.length > 0 ? ((recentWins / recentMatches.length) * 100).toFixed(1) : 0;
    
    stats += `🕐 최근 10경기 승률\n`;
    stats += `${recentWins}승 ${recentMatches.length - recentWins}패 (${recentRate}%)\n\n`;
  }
  
  return stats;
}

// 선수 월별 전적
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

// 선수 맵별 전적
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

// 선수 종족전 승률
function formatPlayerRaceRecord(player, raceType) {
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  
  const raceMap = { '저그전': '저그', '테란전': '테란', '프로토스전': '프로토스' };
  const targetRace = raceMap[raceType];
  
  // oppRace 필드가 있는 경우 사용, 없으면 필터링 건너뜀
  const raceGames = player.history.filter(h => h.oppRace === targetRace);
  if (raceGames.length === 0) {
    return `📭 ${player.name}의 ${raceType} 기록이 없습니다.\n(상대 종족 정보가 기록에 없을 수 있습니다.)`;
  }
  
  const wins = raceGames.filter(h => h.result === '승').length;
  const losses = raceGames.length - wins;
  const rate = raceGames.length > 0 ? ((wins / raceGames.length) * 100).toFixed(1) : 0;
  
  return `🎮 ${player.name} ${raceType} 승률\n\n` +
         `승: ${wins} | 패: ${losses} | 승률: ${rate}%\n` +
         `총 경기 수: ${raceGames.length}경기`;
}

// 티어 랭킹
function formatTierRanking(tier) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  let filteredPlayers = players;
  if (tier) {
    filteredPlayers = players.filter(p => p.tier === tier);
  }
  
  if (filteredPlayers.length === 0) return `❌ '${tier}' 티어의 선수를 찾을 수 없습니다.`;
  
  // ELO 순으로 정렬
  const sortedPlayers = filteredPlayers.sort((a, b) => b.elo - a.elo).slice(0, 10);
  
  let result = `🏆 ${tier || '전체'} 랭킹 (TOP 10)\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  sortedPlayers.forEach((p, i) => {
    result += `${i + 1}. ${p.name} (${p.univ}) - ELO: ${p.elo}\n`;
  });
  
  return result;
}

// 대학 정보
function formatUniversityInfo(univName) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  const univPlayers = players.filter(p => p.univ === univName);
  if (univPlayers.length === 0) return `❌ '${univName}' 대학을 찾을 수 없습니다.`;
  
  let result = '';
  
  // 대학 로고 추가 (UNIV_ICONS가 있는 경우)
  if (typeof UNIV_ICONS !== 'undefined' && UNIV_ICONS[univName]) {
    result += `<img src="${UNIV_ICONS[univName]}" style="width:80px;height:80px;object-fit:contain;display:block;margin:0 auto 10px auto">\n\n`;
  }
  
  result += `🏫 ${univName} 대학 정보\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  result += `소속 선수: ${univPlayers.length}명\n\n`;
  result += `👤 선수 목록:\n`;
  
  univPlayers.forEach(p => {
    result += `• ${p.name} (${p.tier}, ${p.race})\n`;
  });
  
  return result;
}

// 선수 대 선수 전적 (head-to-head)
function formatHeadToHeadRecord(player1, player2) {
  if (!player1.history || player1.history.length === 0) {
    return `📭 ${player1.name}의 경기 기록이 없습니다.`;
  }
  
  // player1의 history에서 player2와의 대전 기록 찾기
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

// 대학 대항전 기록 비교
function formatUniversityVsRecord(univ1, univ2) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  const univ1Players = players.filter(p => p.univ === univ1);
  const univ2Players = players.filter(p => p.univ === univ2);
  
  if (univ1Players.length === 0) return `❌ '${univ1}' 대학을 찾을 수 없습니다.`;
  if (univ2Players.length === 0) return `❌ '${univ2}' 대학을 찾을 수 없습니다.`;
  
  let result = `⚔️ ${univ1} vs ${univ2} 대항전\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  result += `${univ1}: ${univ1Players.length}명\n`;
  result += `${univ2}: ${univ2Players.length}명\n\n`;
  
  // 선수별 대전 기록 확인
  let univ1Wins = 0;
  let univ2Wins = 0;
  let totalMatches = 0;
  
  // univ1 선수들의 history에서 univ2 선수들과의 대전 확인
  univ1Players.forEach(p1 => {
    if (p1.history) {
      p1.history.forEach(h => {
        const oppPlayer = univ2Players.find(p2 => p2.name === h.opp);
        if (oppPlayer) {
          totalMatches++;
          if (h.result === '승') {
            univ1Wins++;
          } else {
            univ2Wins++;
          }
        }
      });
    }
  });
  
  if (totalMatches === 0) {
    result += `� 두 대학 간의 대전 기록이 없습니다.`;
  } else {
    const univ1Rate = ((univ1Wins / totalMatches) * 100).toFixed(1);
    const univ2Rate = ((univ2Wins / totalMatches) * 100).toFixed(1);
    
    result += `�� 대전 기록 (총 ${totalMatches}경기)\n`;
    result += `${univ1}: ${univ1Wins}승 (${univ1Rate}%)\n`;
    result += `${univ2}: ${univ2Wins}승 (${univ2Rate}%)\n\n`;
    
    // 최근 대전 기록
    result += `━━━━━━━━━━━━━━━━━━\n`;
    result += `🕐 최근 대전 기록 (최근 5경기)\n`;
    
    let recentMatches = [];
    univ1Players.forEach(p1 => {
      if (p1.history) {
        p1.history.forEach(h => {
          const oppPlayer = univ2Players.find(p2 => p2.name === h.opp);
          if (oppPlayer) {
            recentMatches.push({
              date: h.date,
              map: h.map,
              result: h.result,
              p1: p1.name,
              p2: oppPlayer.name
            });
          }
        });
      }
    });
    
    recentMatches.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).forEach(m => {
      result += `📅 ${m.date} | ${m.map} | ${m.result} (${m.p1} vs ${m.p2})\n`;
    });
  }
  
  return result;
}
