function loadChatHistory() {
  const key = _lsKeyForMode(chatbotMode);
  const saved = localStorage.getItem(key);
  if (saved) {
    try{
      const parsed = JSON.parse(saved);
      chatHistory = Array.isArray(parsed) ? parsed : [];
    }catch(e){
      chatHistory = [];
    }
  } else chatHistory = [];

  try{
    chatHistory = (chatHistory || []).map(m=>{
      const role = (m && m.role) ? String(m.role) : 'bot';
      const content = (m && typeof m.content !== 'undefined') ? String(m.content) : '';
      const timestamp = (m && m.timestamp) ? m.timestamp : null;
      const format = (m && m.format) ? String(m.format) : 'text';
      return { role, content, timestamp, format };
    });
  }catch(e){
    chatHistory = [];
  }
}

function saveChatHistory() {
  localStorage.setItem(_lsKeyForMode(chatbotMode), JSON.stringify(chatHistory));
}

function renderMarkdownText(text) {
  if (!text || typeof text !== 'string') return '';

  let html = escapeHtml(text);

  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background:var(--surface);padding:12px;border-radius:8px;overflow-x:auto"><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code style="background:var(--surface);padding:2px 6px;border-radius:4px;font-family:monospace">$1</code>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');

  if (typeof players !== 'undefined') {
    const playerNames = players.map(p => p.name).filter(Boolean);
    const universities = [...new Set(players.map(p => p.univ).filter(Boolean))];

    // 선수명/대학명을 각각 따로 여러 번 replace하면, 어떤 이름이 다른 이름의
    // 부분 문자열일 때(예: '아리송이' 안에 '송이'가 포함) 이미 삽입된
    // <span data-chatbot-player="아리송이" ...> 속성값 안의 '송이'까지 다시 매칭되어
    // 태그 중간에 태그가 끼어들며 HTML이 깨지는 문제가 있었다.
    // → 선수명+대학명을 합쳐 '한 번의 패스'로만 치환하고, 긴 이름을 먼저 매칭해
    //   부분 문자열 충돌을 원천 차단한다.
    const candidates = [];
    const seenNames = new Set();
    playerNames.forEach(n => {
      if (n && !seenNames.has(n)) { seenNames.add(n); candidates.push({ name: n, type: 'player' }); }
    });
    universities.forEach(n => {
      if (n && !seenNames.has(n)) { seenNames.add(n); candidates.push({ name: n, type: 'univ' }); }
    });
    // 긴 이름부터 매칭되도록 정렬 (짧은 이름이 긴 이름 안쪽을 잘라먹지 않도록)
    candidates.sort((a, b) => b.name.length - a.name.length);

    if (candidates.length) {
      const typeByName = new Map(candidates.map(c => [c.name, c.type]));
      const pattern = candidates.map(c => _escapeRegExp(c.name)).join('|');
      const regex = new RegExp(`(${pattern})`, 'g');
      html = html.replace(regex, (matched) => {
        const type = typeByName.get(matched);
        const attr = type === 'univ' ? 'data-chatbot-univ' : 'data-chatbot-player';
        return `<span ${attr}="${escapeAttr(matched)}" style="color:var(--blue);cursor:pointer;text-decoration:underline">${escapeHtml(matched)}</span>`;
      });
    }
  }

  return html;
}

function openPlayerDetail(playerName) {
  let player = null;
  try{
    if (typeof window !== 'undefined' && typeof window._chatbotGetPlayerByName === 'function') {
      player = window._chatbotGetPlayerByName(playerName);
    }
  }catch(e){}
  if (!player) player = typeof players !== 'undefined' ? players.find(p => p.name === playerName) : null;
  try{
    if(typeof window.openPlayerModal === 'function' && playerName){
      window.openPlayerModal(playerName);
      return;
    }
  }catch(e){}
  if (player) {
    const _fn = (typeof window.buildPlayerDetailHTML==='function')
      ? window.buildPlayerDetailHTML
      : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
    const modalBody = document.getElementById('playerModalBody');
    if (modalBody) {
      modalBody.innerHTML = _fn
        ? _fn(player)
        : `<div style="font-size:var(--fs-sm);color:var(--gray-l);padding:10px 0">스트리머 상세 렌더러가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.</div>`;
      if (typeof injectUnivIcons !== 'undefined') {
        injectUnivIcons(modalBody);
      }
      if(typeof om === 'function') om('playerModal');
      else document.getElementById('playerModal').style.display = 'flex';
    }
  }
}

function openUnivDetail(univName) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = univName;
    sendMessage();
  }
}

function _renderChatbotHeaderByMode(){
  try{
    const meta=_titleForMode(chatbotMode);
    const hdr=document.querySelector('#chatbotSheet .chatbot-sheet-title');
    if(!hdr) return;
    if(chatbotMode === 'aibot'){
      hdr.innerHTML = `<div style="width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:var(--fs-lg)">⚽</div>
        <div><div>${meta.title}</div><div class="chatbot-sheet-title-sub">${meta.sub}</div></div>`;
    }else{
      hdr.innerHTML = `<img src="${meta.avatarImg}" style="width:28px;height:28px;object-fit:contain;border-radius:8px;background:rgba(255,255,255,0.15);padding:3px">
        <div><div>${meta.title}</div><div class="chatbot-sheet-title-sub">${meta.sub}</div></div>`;
    }
  }catch(e){}
}

function renderChatHistory() {
  _renderChatbotHeaderByMode();
  const container = document.getElementById('chatMessages');
  if (!container) {
    console.warn('Chat messages container not found');
    return;
  }
  
  container.innerHTML = '';

  if (chatHistory.length === 0) {
    if (chatbotMode === 'aibot') {
      container.innerHTML = `
        <div class="chat-message bot-message chat-msg-new">
          <div class="chat-avatar">⚽</div>
          <div class="chat-content">펨붕이붓 채팅창입니다.</div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="chat-message bot-message chat-msg-new">
          <div class="chat-avatar"><img src="https://i.ibb.co/Y7GXGXtv/11e55f999b9d.png" style="width:26px;height:26px;object-fit:contain"></div>
          <div class="chat-content">안녕하세요! 알등이입니다. 😊<br>선수명, 대학명을 입력하거나 <b>도움</b>을 입력하면 명령어 목록을 볼 수 있어요!</div>
        </div>`;
    }
  }
  
  chatHistory.forEach((msg, index) => {
    const msgDiv = document.createElement('div');
    const isLast = index === chatHistory.length - 1;
    msgDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'bot-message'}${isLast ? ' chat-msg-new' : ''}`;
    
    const avatar = msg.role === 'user' ? '👤' : '<img src="https://i.ibb.co/Y7GXGXtv/11e55f999b9d.png" style="width:100%;height:100%;object-fit:cover;border-radius:8px">';
    const content = msg.content;
    const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
    const copyBtn = msg.role === 'bot' ? `<button data-chatbot-copy-index="${index}" style="background:none;border:none;font-size:var(--fs-sm);color:var(--text3);cursor:pointer;padding:4px;border-radius:4px;margin-left:auto">📋</button>` : '';
    
    const isHtml = (msg && msg.format === 'html');
    const wsStyle = isHtml ? 'white-space:normal' : 'white-space:pre-wrap';
    const padStyle = isHtml ? 'padding:4px 0' : '';
    msgDiv.innerHTML = `
      <div class="chat-avatar">${avatar}</div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <div class="chat-content ${isHtml ? 'chat-content-card' : ''}" style="${wsStyle};${padStyle}">${isHtml ? String(content || '') : renderMarkdownText(String(content || ''))}</div>
        <div style="display:flex;justify-content:flex-end;align-items:center;margin-top:3px;gap:8px">
          ${timestamp ? `<span style="font-size:var(--fs-caption);color:var(--text3)">${timestamp}</span>` : ''}
          ${copyBtn}
        </div>
      </div>
    `;
    
    container.appendChild(msgDiv);
  });
  
  container.scrollTop = container.scrollHeight;
}

function copyChatMessage(index) {
  const msg = chatHistory[index];
  if (msg) {
    const textContent = String(msg.content || '').replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(textContent).then(() => {
      alert('메시지가 복사되었습니다.');
    }).catch(err => {
      console.error('복사 실패:', err);
    });
  }
}

function addMessage(role, content, opts) {
  let format = (opts && opts.format) ? String(opts.format) : '';
  if (!format) {
    if (role === 'user') format = 'text';
    else {
      const s = String(content || '');
      // '<'로 "시작"하는지만 보면, 안내 문구(🔍/🤔 등)가 카드 앞에 붙은 경우
      // (예: "🔍 '...' 찾을 수 없어 랜덤 스트리머를 소개합니다!\n\n<div>...") html로 인식되지 않아
      // 태그가 그대로 텍스트로 노출되는 문제가 있었음 → 문자열 어디든 HTML 태그가 있으면 html로 판정
      format = /<[a-z][^>]*>/i.test(s) ? 'html' : 'text';
    }
  }
  chatHistory.push({ role, content: String(content || ''), timestamp: Date.now(), format });
  saveChatHistory();
  renderChatHistory();
}

function openChatbot(mode) {
  chatbotOpen = true;
  chatbotMode = (mode === 'aibot') ? 'aibot' : 'aldeungi';
  loadChatHistory();
  renderChatHistory();
  const overlay = document.getElementById('chatbotOverlay');
  if (overlay) {
    overlay.classList.add('open');
    overlay.style.display = 'flex';
    setTimeout(() => {
      document.getElementById('chatInput')?.focus();
    }, 100);
  }
}

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

function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  addMessage('user', message, { format: 'text' });
  input.value = '';
  
  const container = document.getElementById('chatMessages');
  if (container) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message bot-message';
    loadingDiv.id = 'chatbot-loading';
    loadingDiv.innerHTML = `
      <div class="chat-avatar"><img src="https://i.ibb.co/Y7GXGXtv/11e55f999b9d.png" style="width:32px;height:32px;object-fit:contain"></div>
      <div class="chat-content"><span class="chat-typing-dots"><span></span><span></span><span></span></span></div>
    `;
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
  }
  
  setTimeout(async () => {
    const loadingEl = document.getElementById('chatbot-loading');
    if (loadingEl) loadingEl.remove();
    
    const response = await generateResponse(message);
    if (response && typeof response === 'object' && ('content' in response)) {
      addMessage('bot', response.content, { format: response.format || 'text' });
    } else {
      addMessage('bot', String(response || ''));
    }
  }, 300);
}

function handleChatInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function clearChatHistory() {
  if (confirm('채팅 기록을 모두 지우시겠습니까?')) {
    chatHistory = [];
    saveChatHistory();
    renderChatHistory();
  }
}

function setChatbotMode(mode){
  chatbotMode = (mode === 'aibot') ? 'aibot' : 'aldeungi';
  loadChatHistory();
  renderChatHistory();
  try{ document.getElementById('chatInput')?.focus(); }catch(e){}
}

function sendQuickMessage(message) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = message;
    sendMessage();
  }
}

function initChatbot() {
  loadChatHistory();
  renderChatHistory();
  try{ if(window.SettingsStore && typeof window.SettingsStore.pullOnSignal==='function') window.SettingsStore.pullOnSignal({silent:true}); }catch(e){}
  try{
    if(window.SettingsStore){
      const m=window.SettingsStore.getMemo();
      if(m){ alMemo.last=m.last||''; alMemo.updatedAt=m.updatedAt||null; saveAlMemo(); }
    }
  }catch(e){}

  try{
    if (!window._chatbotDelegatedClicksBound) {
      window._chatbotDelegatedClicksBound = true;
      const overlay = document.getElementById('chatbotOverlay');
      (overlay || document).addEventListener('click', (e) => {
        const el = e.target && e.target.closest ? e.target.closest('[data-chatbot-quick],[data-chatbot-player],[data-chatbot-univ],[data-chatbot-nav-key],[data-chatbot-copy-index]') : null;
        if (!el) return;

        if (el.hasAttribute('data-chatbot-quick')) {
          const q = el.getAttribute('data-chatbot-quick') || '';
          if (q) { e.preventDefault(); sendQuickMessage(q); }
          return;
        }

        if (el.hasAttribute('data-chatbot-player')) {
          const name = el.getAttribute('data-chatbot-player') || '';
          if (name) { e.preventDefault(); openPlayerDetail(name); }
          return;
        }

        if (el.hasAttribute('data-chatbot-univ')) {
          const un = el.getAttribute('data-chatbot-univ') || '';
          if (un) { e.preventDefault(); openUnivDetail(un); }
          return;
        }

        if (el.hasAttribute('data-chatbot-nav-key')) {
          const key = el.getAttribute('data-chatbot-nav-key') || '';
          const dir = parseInt(el.getAttribute('data-chatbot-nav-dir') || '0', 10) || 0;
          if (key && dir && typeof chatNavPage === 'function') { e.preventDefault(); chatNavPage(key, dir); }
          return;
        }

        if (el.hasAttribute('data-chatbot-copy-index')) {
          const idx = parseInt(el.getAttribute('data-chatbot-copy-index') || '-1', 10);
          if (idx >= 0) { e.preventDefault(); copyChatMessage(idx); }
          return;
        }
      }, true);
    }
  }catch(e){}
}

try{
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => setTimeout(initChatbot, 1000));
  } else {
    setTimeout(initChatbot, 1000);
  }
}catch(e){}

try{
  window.initChatbot = initChatbot;
  window.loadChatHistory = loadChatHistory;
  window.saveChatHistory = saveChatHistory;
  window.renderChatHistory = renderChatHistory;
  window.openChatbot = openChatbot;
  window.closeChatbot = closeChatbot;
  window.sendMessage = sendMessage;
  window.handleChatInputKeydown = handleChatInputKeydown;
  window.clearChatHistory = clearChatHistory;
  window.copyChatMessage = copyChatMessage;
  window.setChatbotMode = setChatbotMode;
  window.sendQuickMessage = sendQuickMessage;
  window.openPlayerDetail = openPlayerDetail;
  window.openUnivDetail = openUnivDetail;
}catch(e){}
