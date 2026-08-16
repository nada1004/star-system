// 알등이 - 스타대학 데이터 분석 챗봇
// Aldeungi - StarCraft University Data Analysis Chatbot

let chatHistory = [];
let chatbotOpen = false;
let chatbotMode = 'aldeungi'; // 'aldeungi' | 'aibot'
// 알등이 메모(사용자 저장 요청 대응)
let alMemo = JSON.parse(localStorage.getItem('al_memo') || '{}');
function saveAlMemo(){ try{ localStorage.setItem('al_memo', JSON.stringify(alMemo)); }catch(e){} }

function _lsKeyForMode(mode){
  return mode === 'aibot' ? 'su_chat_history_ai' : 'su_chat_history_aldeungi';
}
function _titleForMode(mode){
  if (mode === 'aibot') return { title:'펨붕이붓', sub:'펨붕이 AI', avatar:'⚽' };
  return { title:'알등이', sub:'스타대학 데이터 분석 AI', avatarImg:'https://i.ibb.co/Y7GXGXtv/11e55f999b9d.png' };
}

// ── 알등이 메모 동기화 ──
// settings-store.js(SettingsStore)를 통해 su_settings.json으로 통합 동기화합니다.
function _alIsAdmin(){
  try{ return !!(window.SettingsStore && window.SettingsStore.isAdmin && window.SettingsStore.isAdmin()); }catch(e){}
  // fallback
  try{
    if (typeof isLoggedIn !== 'undefined' && isLoggedIn) {
      if (typeof isSubAdmin !== 'undefined' && isSubAdmin) return false;
      return true;
    }
  }catch(e){}
  return false;
}

// 챗봇 응답 생성
async function generateResponse(msg) {
  if (!msg || msg.trim() === '') {
    return '메시지를 입력해주세요.';
  }
  
  const userMessage = msg.trim().toLowerCase();

  if (chatbotMode === 'aibot') {
    if (typeof window._generateAiBotResponse === 'function') {
      return await window._generateAiBotResponse(msg);
    }
    return { format:'text', content: 'AI봇 모듈이 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.' };
  }

  // (AI API 기능 제거됨)
  if (typeof window._chatbotHandleMetaCommands === 'function') {
    const r = await window._chatbotHandleMetaCommands(msg, userMessage);
    if (r) return r;
  }
  if (typeof window._chatbotHandleMainCommands === 'function') {
    const r = await window._chatbotHandleMainCommands(msg, userMessage);
    if (r) return r;
  }

  // 기본 응답 - 랜덤 스트리머 소개 (모든 입력에 대해)
  if (typeof players !== 'undefined' && players.length > 0) {
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const fn = (typeof window !== 'undefined' && typeof window.formatPlayerBasicInfo === 'function')
      ? window.formatPlayerBasicInfo
      : (typeof formatPlayerBasicInfo === 'function' ? formatPlayerBasicInfo : null);
    return fn ? (formatChatNote('🎲 랜덤 스트리머를 소개합니다!') + fn(randomPlayer)) : '검색 자료가 없습니다.';
  }
  return `질문을 이해하지 못했어요 😅\n"도움"을 입력하면 사용법을 알려드릴게요!`;
}
