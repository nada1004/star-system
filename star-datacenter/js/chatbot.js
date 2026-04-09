// 알등이 - 스타대학 데이터 분석 챗봇
// Aldeungi - StarCraft University Data Analysis Chatbot

let chatHistory = [];
let chatbotOpen = false;

// 대회 데이터 구조 (예시)
const tournaments = [
  {
    name: '2024 스타대학 리그',
    date: '2024-03-15',
    status: '진행중',
    teams: ['츠캄몬스타즈', '케이대', '포스텍', '서울대'],
    bracket: [
      { round: '8강', match1: { team1: '츠캄몬스타즈', team2: '케이대', result: '2-1' }, match2: { team1: '포스텍', team2: '서울대', result: '1-2' } },
      { round: '4강', match1: { team1: '츠캄몬스타즈', team2: '서울대', result: '2-0' } }
    ]
  },
  {
    name: '2024 스타대학 컵',
    date: '2024-06-20',
    status: '예정',
    teams: ['연세대', '고려대', '성균관대', '한양대'],
    bracket: []
  }
];

// 대회별 경기 기록
const tournamentMatches = [
  { tournament: '2024 스타대학 리그', date: '2024-03-15', team1: '츠캄몬스타즈', team2: '케이대', result: '2-1', map: 'Cactus Valley' },
  { tournament: '2024 스타대학 리그', date: '2024-03-15', team1: '포스텍', team2: '서울대', result: '1-2', map: 'Terraform' },
  { tournament: '2024 스타대학 리그', date: '2024-03-20', team1: '츠캄몬스타즈', team2: '서울대', result: '2-0', map: 'Neon Violet Square' }
];

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

// 마크다운 렌더링
function renderMarkdown(text) {
  if (!text) return '';
  
  // HTML 태그가 포함된 경우 그대로 반환
  if (text.includes('<')) return text;
  
  // 간단한 마크다운 파싱
  let html = text;
  
  // **bold** -> <b>bold</b>
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  
  // *italic* -> <i>italic</i>
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
  
  // `code` -> <code>code</code>
  html = html.replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace">$1</code>');
  
  // ```code block``` -> <pre><code>code block</code></pre>
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background:#f1f5f9;padding:12px;border-radius:8px;overflow-x:auto"><code>$1</code></pre>');
  
  // 선수명/대학명만 선택적으로 클릭 가능하게
  if (typeof players !== 'undefined') {
    const playerNames = players.map(p => p.name);
    const universities = [...new Set(players.map(p => p.univ))];
    
    // 선수명 먼저 교체
    playerNames.forEach(playerName => {
      const escapedName = escapeHtml(playerName);
      const safeName = escapedName.replace(/'/g, "\\'");
      const regex = new RegExp(`(${playerName})`, 'g');
      html = html.replace(regex, `<span onclick="openPlayerDetail('${safeName}')" style="color:var(--blue);cursor:pointer;text-decoration:underline">${escapedName}</span>`);
    });
    
    // 대학명 교체
    universities.forEach(univName => {
      const escapedName = escapeHtml(univName);
      const safeName = escapedName.replace(/'/g, "\\'");
      const regex = new RegExp(`(${univName})`, 'g');
      html = html.replace(regex, `<span onclick="openUnivDetail('${safeName}')" style="color:var(--blue);cursor:pointer;text-decoration:underline">${escapedName}</span>`);
    });
  }
  
  // 줄바꿈 -> <br>
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

// 선수 상세 모달 열기
function openPlayerDetail(playerName) {
  const player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
  if (player && typeof buildPlayerDetailHTML !== 'undefined') {
    const modalBody = document.getElementById('playerModalBody');
    if (modalBody) {
      modalBody.innerHTML = buildPlayerDetailHTML(player);
      if (typeof injectUnivIcons !== 'undefined') {
        injectUnivIcons(modalBody);
      }
      document.getElementById('playerModal').style.display = 'flex';
    }
  }
}

// 대학 상세 모달 열기 (챗봇에서 쿼리)
function openUnivDetail(univName) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = univName;
    sendMessage();
  }
}

// 채팅 기록 렌더링
function renderChatHistory() {
  const container = document.getElementById('chatMessages');
  if (!container) {
    console.warn('Chat messages container not found');
    return;
  }
  
  container.innerHTML = '';
  
  chatHistory.forEach((msg, index) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`;
    
    const avatar = msg.role === 'user' ? '👤' : '<img src="https://i.ibb.co/Y7GXGXtv/11e55f999b9d.png" style="width:32px;height:32px;object-fit:contain">';
    const content = msg.content;
    
    // 타임스탬프 형식화 (없으면 빈 문자열)
    const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
    
    // 봇 메시지에 복사 버튼 추가
    const copyBtn = msg.role === 'bot' ? `<button onclick="copyChatMessage(${index})" style="background:none;border:none;font-size:12px;color:#94a3b8;cursor:pointer;padding:4px;border-radius:4px;margin-left:auto">📋</button>` : '';
    
    msgDiv.innerHTML = `
      <div class="chat-avatar">${avatar}</div>
      <div style="flex:1;display:flex;flex-direction:column">
        <div class="chat-content" style="white-space:pre-wrap">${renderMarkdown(content)}</div>
        <div style="display:flex;justify-content:flex-end;align-items:center;margin-top:4px;gap:8px">
          ${timestamp ? `<span style="font-size:11px;color:#94a3b8">${timestamp}</span>` : ''}
          ${copyBtn}
        </div>
      </div>
    `;
    
    container.appendChild(msgDiv);
  });
  
  // 스크롤을 하단으로
  container.scrollTop = container.scrollHeight;
}

// 채팅 메시지 복사
function copyChatMessage(index) {
  const msg = chatHistory[index];
  if (msg) {
    const textContent = msg.content.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(textContent).then(() => {
      alert('메시지가 복사되었습니다.');
    }).catch(err => {
      console.error('복사 실패:', err);
    });
  }
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
           `• '대학명' : 소속 선수 및 대학 로고\n\n` +
           `3️⃣ 대회 정보\n` +
           `• '대회 일정' 또는 '브라켓' : 대회 일정 및 브라켓\n` +
           `• '대회 목록' : 전체 대회 목록\n` +
           `• '대회명 대회' : 특정 대회 정보\n\n` +
           `4️⃣ 검색 기능\n` +
           `• '티어 A~B' : 티어 범위 검색\n` +
           `• 'A 티어 이상' : 티어 이상 검색\n` +
           `• '승률 50% 이상' : 승률 범위 검색\n` +
           `• '저그 선수' : 종족별 선수 검색\n` +
           `• '2024-01-01 ~ 2024-01-31' : 날짜 범위 검색\n` +
           `• '마토전' : 상대별 검색`;
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
  const monthMatch = userMessage.match(/([^\s]+)\s+(\d+)월\s+전적/i);
  if (monthMatch) {
    const playerName = monthMatch[1];
    const month = monthMatch[2];
    let player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
    if (!player) player = findSimilarPlayer(playerName);
    if (player) {
      if (player.name !== playerName) return `🤔 '${playerName}' 대신 '${player.name}'을 찾았습니다.\n\n` + formatPlayerMonthRecord(player, month);
      return formatPlayerMonthRecord(player, month);
    }
  }
  
  // 선수 이름 + 이번달 전적 / 이번년도 전적
  const thisMonthMatch = userMessage.match(/([^\s]+)\s+(이번달|이번년도)\s+전적/i);
  if (thisMonthMatch) {
    const playerName = thisMonthMatch[1];
    const period = thisMonthMatch[2];
    let player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
    if (!player) player = findSimilarPlayer(playerName);
    if (player) {
      if (player.name !== playerName) return `🤔 '${playerName}' 대신 '${player.name}'을 찾았습니다.\n\n` + formatPlayerPeriodRecord(player, period);
      return formatPlayerPeriodRecord(player, period);
    }
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
  
  // 종족전만 입력한 경우 (예: "저그전")
  const raceOnlyMatch = userMessage.match(/^(저그전|테란전|프로토스전)$/);
  if (raceOnlyMatch) {
    const race = raceOnlyMatch[1];
    return formatRacePlayersSearch(race === '저그전' ? '저그' : race === '테란전' ? '테란' : '프로토스');
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
  
  // 대학 관련 검색 (대학명 검색을 먼저 체크)
  const universityMatch = userMessage.match(/([^\s]+)/);
  if (universityMatch) {
    const univName = universityMatch[1];
    const universities = typeof players !== 'undefined' ? [...new Set(players.map(p => p.univ))] : [];
    // 대학명이거나 "대"가 포함된 경우 대학 정보 우선
    if (universities.includes(univName) || univName.includes('대') || univName.includes('학')) {
      return formatUniversityInfo(univName);
    }
  }
  
  // 선수 이름 검색 (단순 이름)
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
  
  // 티어 범위 검색 (예: "티어 A~B" 또는 "A 티어 이상")
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
  
  // 승률 범위 검색 (예: "승률 50% 이상")
  const winRateMatch = userMessage.match(/승률\s*(\d+)%\s*이상/i);
  if (winRateMatch) {
    const minRate = parseInt(winRateMatch[1]);
    return formatWinRateSearch(minRate);
  }
  
  // 종족별 선수 검색 (예: "저그 선수" 또는 "테란 선수")
  const racePlayersMatch = userMessage.match(/(저그|테란|프로토스)\s*선수/i);
  if (racePlayersMatch) {
    const race = racePlayersMatch[1];
    return formatRacePlayersSearch(race);
  }
  
  // 날짜 범위 검색 (예: "2024-01-01 ~ 2024-01-31" 또는 "1월 1일 ~ 1월 31일")
  const dateRangeMatch = userMessage.match(/(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/);
  if (dateRangeMatch) {
    const startDate = dateRangeMatch[1];
    const endDate = dateRangeMatch[2];
    return formatDateRangeSearch(startDate, endDate);
  }
  
  // 상대별 검색 (예: "마토전" 또는 "vs 마토")
  const opponentMatch = userMessage.match(/(.+?)전$/);
  if (opponentMatch) {
    const opponentName = opponentMatch[1];
    return formatOpponentSearch(opponentName);
  }
  
  // 대회 관련 검색
  if (msg.includes('대회') || msg.includes('리그') || msg.includes('컵') || msg.includes('브라켓') || msg.includes('일정')) {
    if (msg.includes('일정') || msg.includes('브라켓')) {
      return formatTournamentSchedule();
    }
    if (msg.includes('리그') || msg.includes('컵')) {
      return formatTournamentList();
    }
    return formatTournamentSchedule();
  }
  
  // 특정 대회 정보 검색
  const tournamentMatch = userMessage.match(/(.+?)\s+대회$/);
  if (tournamentMatch) {
    const tournamentName = tournamentMatch[1];
    return formatTournamentInfo(tournamentName);
  }
  
  // 팀 대회 기록 검색
  const teamTournamentMatch = userMessage.match(/(.+?)\s+대회\s+기록$/);
  if (teamTournamentMatch) {
    const teamName = teamTournamentMatch[1];
    return formatTeamTournamentRecord(teamName);
  }
  
  // 대회 통계 검색
  const tournamentStatsMatch = userMessage.match(/(.+?)\s+대회\s+통계$/);
  if (tournamentStatsMatch) {
    const tournamentName = tournamentStatsMatch[1];
    return formatTournamentStats(tournamentName);
  }
  
  // 인사
  if (msg.includes('안녕') || msg.includes('hello') || msg.includes('hi')) {
    return '안녕하세요! 알등이입니다. 스타대학 데이터에 대해 궁금한 점이 있으신가요? 😊';
  }
  
  // 기본 응답
  return `죄송합니다, 질문을 잘 이해하지 못했어요. 😅\n` +
         `도움말을 보려면 "도움" 또는 "?"를 입력해주세요!`;
}

// 대학별 팀 색상 매핑
const TEAM_COLORS = {
  '츠캄몬스타즈': { light: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', dark: 'linear-gradient(135deg,#78350f 0%,#92400e 100%)' },
  '케이대': { light: 'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)', dark: 'linear-gradient(135deg,#1e3a8a 0%,#1e40af 100%)' },
  '포스텍': { light: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', dark: 'linear-gradient(135deg,#064e3b 0%,#065f46 100%)' },
  '서울대': { light: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)', dark: 'linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)' },
  '연세대': { light: 'linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)', dark: 'linear-gradient(135deg,#4c1d95 0%,#5b21b6 100%)' },
  '고려대': { light: 'linear-gradient(135deg,#f97316 0%,#ea580c 100%)', dark: 'linear-gradient(135deg,#7c2d12 0%,#9a3412 100%)' },
  '성균관대': { light: 'linear-gradient(135deg,#06b6d4 0%,#0891b2 100%)', dark: 'linear-gradient(135deg,#164e63 0%,#155e75 100%)' },
  '한양대': { light: 'linear-gradient(135deg,#ec4899 0%,#db2777 100%)', dark: 'linear-gradient(135deg,#831843 0%,#9d174d 100%)' },
  '중앙대': { light: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)', dark: 'linear-gradient(135deg,#312e81 0%,#3730a3 100%)' },
  '경희대': { light: 'linear-gradient(135deg,#14b8a6 0%,#0d9488 100%)', dark: 'linear-gradient(135deg,#134e4a 0%,#115e59 100%)' },
  '기본': { light: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', dark: 'linear-gradient(135deg,#1e293b 0%,#334155 100%)' }
};

// 대학 색상 가져오기
function getTeamColor(univ, isDark) {
  const colors = TEAM_COLORS[univ] || TEAM_COLORS['기본'];
  return isDark ? colors.dark : colors.light;
}

// 선수 기본 정보
function formatPlayerBasicInfo(player) {
  const total = player.win + player.loss;
  const rate = total > 0 ? ((player.win / total) * 100).toFixed(1) : 0;
  
  // 현재 월 계산
  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const currentMonthName = monthNames[currentMonth];
  
  // 선수명 이스케이프
  const safePlayerName = escapeHtml(player.name);
  const safeUniv = escapeHtml(player.univ);
  
  if (player.photo) {
    // 프로필 사진과 정보 분리 (컴팩트한 크기)
    return `<div style="display:flex;flex-direction:column;align-items:center;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:8px">
      <img src="${player.photo}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px;border:2px solid var(--blue)">
      <div style="display:none;width:80px;height:80px;background:var(--blue);border-radius:8px;align-items:center;justify-content:center;font-size:32px;color:white;margin-bottom:8px;border:2px solid var(--blue)">👤</div>
      <div style="text-align:center;width:100%">
        <div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:2px">${safePlayerName}</div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:4px">${safeUniv}</div>
        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:4px;font-size:11px;color:var(--text2)">
          <span>🎖️${player.tier}</span>
          <span>🎮${player.race}</span>
          <span>⭐${player.elo}</span>
        </div>
        <div style="font-size:14px;font-weight:700;color:var(--blue);margin-bottom:4px">
          ${player.win}승 ${player.loss}패 (${rate}%)
        </div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px">
          총 ${total}경기
        </div>
      </div>
      <div style="width:100%;border-top:1px solid var(--border);padding-top:6px;margin-top:4px">
        <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap">
          <button onclick="sendQuickMessage('${safePlayerName} 최근전적')" style="padding:4px 8px;background:var(--blue);color:white;border:none;border-radius:4px;font-size:10px;cursor:pointer">최근</button>
          <button onclick="sendQuickMessage('${safePlayerName} 통계')" style="padding:4px 8px;background:var(--blue);color:white;border:none;border-radius:4px;font-size:10px;cursor:pointer">통계</button>
          <button onclick="sendQuickMessage('${safePlayerName} 이번달 전적')" style="padding:4px 8px;background:var(--blue);color:white;border:none;border-radius:4px;font-size:10px;cursor:pointer">이번달</button>
          <button onclick="sendQuickMessage('${safePlayerName} 저그전')" style="padding:4px 8px;background:var(--blue);color:white;border:none;border-radius:4px;font-size:10px;cursor:pointer">저그</button>
          <button onclick="sendQuickMessage('${safePlayerName} 테란전')" style="padding:4px 8px;background:var(--blue);color:white;border:none;border-radius:4px;font-size:10px;cursor:pointer">테란</button>
          <button onclick="sendQuickMessage('${safePlayerName} 프로토스전')" style="padding:4px 8px;background:var(--blue);color:white;border:none;border-radius:4px;font-size:10px;cursor:pointer">프로</button>
        </div>
      </div>
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

// 빠른 메시지 전송 (퀵 액션 버튼용)
function sendQuickMessage(message) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = message;
    sendMessage();
  }
}

// 특수문자 이스케이프 함수
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// 선수 최근 전적
function formatPlayerRecentRecord(player) {
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  
  // 날짜 기준으로 정렬 (최신순)
  const sortedHistory = [...player.history].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentGames = sortedHistory.slice(0, 30);
  const wins = recentGames.filter(h => h.result === '승').length;
  const losses = recentGames.length - wins;
  const rate = recentGames.length > 0 ? ((wins / recentGames.length) * 100).toFixed(1) : 0;
  
  let result = `📊 ${player.name} 최근 30경기 전적\n\n`;
  result += `승: ${wins} | 패: ${losses} | 승률: ${rate}%\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  recentGames.forEach(h => {
    const safeOpp = escapeHtml(h.opp);
    const safeOppForClick = safeOpp.replace(/'/g, "\\'").replace(/"/g, '\\"');
    // 상대명 클릭 가능하게
    const oppPlayer = typeof players !== 'undefined' ? players.find(p => p.name === h.opp) : null;
    const oppDisplay = oppPlayer ? `<span onclick="sendQuickMessage('${safeOppForClick}')" style="color:var(--blue);cursor:pointer;text-decoration:underline">${safeOpp}</span>` : safeOpp;
    result += `📅 ${h.date} | ${h.map} | ${h.result} vs ${oppDisplay}\n`;
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

// 선수 기간별 전적 (이번달, 이번년도)
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
  
  // 날짜 기준 정렬 (최신순)
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
  
  // oppRace 필드가 있는 경우 사용, 없으면 상대 선수의 종족으로 추정
  const raceGames = player.history.filter(h => {
    if (h.oppRace) {
      return h.oppRace === targetRace;
    }
    // oppRace가 없는 경우, 상대 선수 찾아서 종족 확인
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
  
  // 날짜 기준 정렬
  const sortedRaceGames = [...raceGames].sort((a, b) => new Date(b.date) - new Date(a.date));
  sortedRaceGames.slice(0, 10).forEach(h => {
    result += `📅 ${h.date} | ${h.map} | ${h.result} vs ${h.opp}\n`;
  });
  
  return result;
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
  if (univPlayers.length === 0) {
    // 대학명 퍼지 매칭 시도 (개선된 알고리즘)
    const universities = [...new Set(players.map(p => p.univ))];
    const similarUniv = findSimilarUniversity(univName, universities);
    if (similarUniv) {
      return `🤔 '${univName}' 대신 '${similarUniv}'을 찾았습니다.\n\n` + formatUniversityInfo(similarUniv);
    }
    return `❌ '${univName}' 대학을 찾을 수 없습니다.`;
  }
  
  let result = '';
  
  // 대학 로고와 정보 분리 (컴팩트한 크기)
  if (typeof UNIV_ICONS !== 'undefined' && UNIV_ICONS[univName]) {
    result += `<div style="display:flex;flex-direction:column;align-items:center;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:8px">
      <img src="${UNIV_ICONS[univName]}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width:60px;height:60px;object-fit:contain;border-radius:8px;margin-bottom:8px;border:2px solid var(--blue)">
      <div style="display:none;width:60px;height:60px;background:var(--blue);border-radius:8px;align-items:center;justify-content:center;font-size:24px;color:white;margin-bottom:8px;border:2px solid var(--blue)">🏫</div>
      <div style="text-align:center">
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">${univName}</div>
        <div style="font-size:12px;color:var(--blue);font-weight:600;background:rgba(59,130,246,0.1);padding:2px 10px;border-radius:12px;display:inline-block">소속 ${univPlayers.length}명</div>
      </div>
    </div>\n\n`;
  } else {
    result += `🏫 ${univName} 대학 정보\n\n`;
    result += `━━━━━━━━━━━━━━━━━━\n`;
    result += `소속 선수: ${univPlayers.length}명\n\n`;
  }
  
  result += `👤 선수 목록:\n`;
  
  univPlayers.forEach(p => {
    result += `• ${p.name} (${p.tier}, ${p.race})\n`;
  });
  
  return result;
}

// 대학명 퍼지 매칭 (개선된 알고리즘)
function findSimilarUniversity(input, universities) {
  const inputLower = input.toLowerCase();
  
  // 정확히 일치
  if (universities.includes(input)) return input;
  
  // 부분 일치 (입력이 대학명에 포함)
  const partialMatch = universities.find(u => u.toLowerCase().includes(inputLower));
  if (partialMatch) return partialMatch;
  
  // 대학명이 입력에 포함
  const reverseMatch = universities.find(u => inputLower.includes(u.toLowerCase()));
  if (reverseMatch) return reverseMatch;
  
  // Levenshtein 거리 계산
  let bestMatch = null;
  let bestScore = Infinity;
  
  universities.forEach(u => {
    const score = levenshteinDistance(inputLower, u.toLowerCase());
    if (score < bestScore && score <= 3) {
      bestScore = score;
      bestMatch = u;
    }
  });
  
  return bestMatch;
}

// Levenshtein 거리 계산
function levenshteinDistance(a, b) {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
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

// 티어 범위 검색
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

// 티어 이상 검색
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

// 승률 범위 검색
function formatWinRateSearch(minRate) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';
  
  const filteredPlayers = players.filter(p => {
    const total = p.win + p.loss;
    if (total === 0) return false;
    const rate = (p.win / total) * 100;
    return rate >= minRate;
  });
  
  if (filteredPlayers.length === 0) return `❌ 승률 ${minRate}% 이상의 선수를 찾을 수 없습니다.`;
  
  // 승률 순으로 정렬
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

// 종족별 선수 검색
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

// 날짜 범위 검색
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

// 상대별 검색
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

// 대회 일정/브라켓 정보
function formatTournamentSchedule() {
  if (tournaments.length === 0) return '❌ 대회 정보가 없습니다.';
  
  let result = `🏆 대회 일정 및 브라켓\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  tournaments.forEach(t => {
    result += `📅 ${t.date} | ${t.name} (${t.status})\n`;
    result += `참가 팀: ${t.teams.join(', ')}\n\n`;
    
    if (t.bracket.length > 0) {
      result += `브라켓:\n`;
      t.bracket.forEach(b => {
        result += `  ${b.round}:\n`;
        Object.keys(b).forEach(key => {
          if (key.startsWith('match')) {
            const m = b[key];
            result += `    ${m.team1} vs ${m.team2} (${m.result})\n`;
          }
        });
      });
      result += '\n';
    }
  });
  
  return result;
}

// 대회 목록
function formatTournamentList() {
  if (tournaments.length === 0) return '❌ 대회 정보가 없습니다.';
  
  let result = `🏆 대회 목록\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  tournaments.forEach((t, index) => {
    result += `${index + 1}. ${t.name}\n`;
    result += `   📅 ${t.date} | 상태: ${t.status}\n`;
    result += `   참가 팀: ${t.teams.join(', ')}\n\n`;
  });
  
  return result;
}

// 특정 대회 정보
function formatTournamentInfo(tournamentName) {
  const tournament = tournaments.find(t => t.name.includes(tournamentName) || tournamentName.includes(t.name));
  
  if (!tournament) return `❌ '${tournamentName}' 대회를 찾을 수 없습니다.`;
  
  let result = `🏆 ${tournament.name}\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  result += `📅 일자: ${tournament.date}\n`;
  result += `상태: ${tournament.status}\n`;
  result += `참가 팀: ${tournament.teams.join(', ')}\n\n`;
  
  if (tournament.bracket.length > 0) {
    result += `브라켓:\n`;
    tournament.bracket.forEach(b => {
      result += `  ${b.round}:\n`;
      Object.keys(b).forEach(key => {
        if (key.startsWith('match')) {
          const m = b[key];
          result += `    ${m.team1} vs ${m.team2} (${m.result})\n`;
        }
      });
    });
  }
  
  return result;
}

// 팀별 대회 기록
function formatTeamTournamentRecord(teamName) {
  const teamMatches = tournamentMatches.filter(m => m.team1 === teamName || m.team2 === teamName);
  
  if (teamMatches.length === 0) return `❌ '${teamName}'의 대회 기록이 없습니다.`;
  
  let result = `🏆 ${teamName} 대회 기록\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  teamMatches.forEach(m => {
    const opponent = m.team1 === teamName ? m.team2 : m.team1;
    const teamResult = m.team1 === teamName ? m.result.split('-')[0] : m.result.split('-')[1];
    result += `📅 ${m.date} | ${m.tournament}\n`;
    result += `   ${teamName} vs ${opponent} (${m.result}) | ${m.map}\n`;
  });
  
  return result;
}

// 대회별 통계
function formatTournamentStats(tournamentName) {
  const tournament = tournaments.find(t => t.name.includes(tournamentName) || tournamentName.includes(t.name));
  
  if (!tournament) return `❌ '${tournamentName}' 대회를 찾을 수 없습니다.`;
  
  const matches = tournamentMatches.filter(m => m.tournament === tournament.name);
  
  if (matches.length === 0) return `❌ '${tournamentName}' 경기 기록이 없습니다.`;
  
  let result = `📊 ${tournament.name} 통계\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  result += `총 경기 수: ${matches.length}경기\n\n`;
  
  // 팀별 승률
  const teamStats = {};
  matches.forEach(m => {
    if (!teamStats[m.team1]) teamStats[m.team1] = { wins: 0, losses: 0 };
    if (!teamStats[m.team2]) teamStats[m.team2] = { wins: 0, losses: 0 };
    
    const score1 = parseInt(m.result.split('-')[0]);
    const score2 = parseInt(m.result.split('-')[1]);
    
    if (score1 > score2) {
      teamStats[m.team1].wins++;
      teamStats[m.team2].losses++;
    } else {
      teamStats[m.team1].losses++;
      teamStats[m.team2].wins++;
    }
  });
  
  result += `팀별 승률:\n`;
  Object.keys(teamStats).forEach(team => {
    const total = teamStats[team].wins + teamStats[team].losses;
    const rate = total > 0 ? ((teamStats[team].wins / total) * 100).toFixed(1) : 0;
    result += `  ${team}: ${teamStats[team].wins}승 ${teamStats[team].losses}패 (${rate}%)\n`;
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
