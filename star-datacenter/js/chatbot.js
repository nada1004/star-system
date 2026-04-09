// 알등이 - 스타대학 데이터 분석 챗봇
// Aldeungi - StarCraft University Data Analysis Chatbot

let chatHistory = [];
let chatbotOpen = false;

// 챗봇 초기화
function initChatbot() {
  loadChatHistory();
  renderChatHistory();
}

// 페이지 로드 시 챗봇 초기화
window.addEventListener('DOMContentLoaded', initChatbot);

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
  if (!container) return;
  
  container.innerHTML = '';
  
  chatHistory.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`;
    
    const avatar = msg.role === 'user' ? '👤' : '🤖';
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
  
  // 챗봇 응답 생성
  setTimeout(() => {
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
           `• '스트리머명 저그전' : 특정 종족전 승률\n\n` +
           `2️⃣ 랭킹 및 대학 정보\n` +
           `• '티어 랭킹' : 순위표\n` +
           `• '대학명' : 소속 선수 및 최근 대학 전적\n` +
           `• '대학1 대학2' : 대학 대항전 기록 비교`;
  }
  
  // 선수 이름만 입력된 경우 - 기본 정보
  const playerOnlyMatch = userMessage.match(/^([^\s]+)$/);
  if (playerOnlyMatch) {
    const playerName = playerOnlyMatch[1];
    const player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    return formatPlayerBasicInfo(player);
  }
  
  // 선수 이름 + 최근전적
  if (msg.includes('최근전적')) {
    const nameMatch = userMessage.match(/([^\s]+)\s+최근전적/);
    if (nameMatch) {
      const playerName = nameMatch[1];
      const player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
      if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
      return formatPlayerRecentRecord(player);
    }
  }
  
  // 선수 이름 + 통계
  if (msg.includes('통계')) {
    const nameMatch = userMessage.match(/([^\s]+)\s+통계/);
    if (nameMatch) {
      const playerName = nameMatch[1];
      const player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
      if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
      return formatPlayerStats(player);
    }
  }
  
  // 선수 이름 + 월 전적
  const monthMatch = userMessage.match(/([^\s]+)\s+(\d+월)\s+전적/);
  if (monthMatch) {
    const playerName = monthMatch[1];
    const month = monthMatch[2];
    const player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    return formatPlayerMonthRecord(player, month);
  }
  
  // 선수 이름 + 종족전
  const raceMatch = userMessage.match(/([^\s]+)\s+(저그전|테란전|프로토스전)/);
  if (raceMatch) {
    const playerName = raceMatch[1];
    const race = raceMatch[2];
    const player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
    if (!player) return `❌ '${playerName}' 선수를 찾을 수 없습니다.`;
    return formatPlayerRaceRecord(player, race);
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
  
  // 대학 정보
  const univMatch = userMessage.match(/^([^\s]+)$/);
  if (univMatch) {
    const univName = univMatch[1];
    return formatUniversityInfo(univName);
  }
  
  // 대학 대항전 비교
  const univVsMatch = userMessage.match(/([^\s]+)\s+([^\s]+)/);
  if (univVsMatch) {
    const univ1 = univVsMatch[1];
    const univ2 = univVsMatch[2];
    return formatUniversityVsRecord(univ1, univ2);
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
  
  recentGames.slice(0, 10).forEach(h => {
    result += `📅 ${h.date} | ${h.map} | ${h.result} vs ${h.opp}\n`;
  });
  
  if (recentGames.length > 10) {
    result += `\n... (총 ${recentGames.length}경기)`;
  }
  
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

// 선수 종족전 승률
function formatPlayerRaceRecord(player, raceType) {
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  
  const raceMap = { '저그전': '저그', '테란전': '테란', '프로토스전': '프로토스' };
  const targetRace = raceMap[raceType];
  
  const raceGames = player.history.filter(h => h.oppRace === targetRace);
  if (raceGames.length === 0) {
    return `📭 ${player.name}의 ${raceType} 기록이 없습니다.`;
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
  
  let result = `🏫 ${univName} 대학 정보\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  result += `소속 선수: ${univPlayers.length}명\n\n`;
  result += `👤 선수 목록:\n`;
  
  univPlayers.forEach(p => {
    result += `• ${p.name} (${p.tier}, ${p.race})\n`;
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
  result += `📊 상세 비교 기능은 준비 중입니다.`;
  
  return result;
}
