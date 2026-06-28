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

  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background:#f1f5f9;padding:12px;border-radius:8px;overflow-x:auto"><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace">$1</code>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');

  if (typeof players !== 'undefined') {
    const playerNames = players.map(p => p.name).filter(Boolean);
    const universities = [...new Set(players.map(p => p.univ).filter(Boolean))];

    playerNames.forEach(playerName => {
      const escapedName = escapeHtml(playerName);
      const regex = new RegExp(`(${_escapeRegExp(playerName)})`, 'g');
      html = html.replace(regex, `<span data-chatbot-player="${escapeAttr(playerName)}" style="color:var(--blue);cursor:pointer;text-decoration:underline">${escapedName}</span>`);
    });

    universities.forEach(univName => {
      const escapedName = escapeHtml(univName);
      const regex = new RegExp(`(${_escapeRegExp(univName)})`, 'g');
      html = html.replace(regex, `<span data-chatbot-univ="${escapeAttr(univName)}" style="color:var(--blue);cursor:pointer;text-decoration:underline">${escapedName}</span>`);
    });
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
  if (player && typeof buildPlayerDetailHTML !== 'undefined') {
    const modalBody = document.getElementById('playerModalBody');
    if (modalBody) {
      modalBody.innerHTML = buildPlayerDetailHTML(player);
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
      hdr.innerHTML = `<div style="width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:18px">⚽</div>
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
        <div class="chat-message bot-message">
          <div class="chat-avatar">⚽</div>
          <div class="chat-content">펨붕이붓 채팅창입니다.</div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="chat-message bot-message">
          <div class="chat-avatar"><img src="https://i.ibb.co/Y7GXGXtv/11e55f999b9d.png" style="width:26px;height:26px;object-fit:contain"></div>
          <div class="chat-content">안녕하세요! 알등이입니다. 😊<br>선수명, 대학명을 입력하거나 <b>도움</b>을 입력하면 명령어 목록을 볼 수 있어요!</div>
        </div>`;
    }
  }
  
  chatHistory.forEach((msg, index) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`;
    
    const avatar = msg.role === 'user' ? '👤' : '<img src="https://i.ibb.co/Y7GXGXtv/11e55f999b9d.png" style="width:100%;height:100%;object-fit:cover;border-radius:8px">';
    const content = msg.content;
    const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
    const copyBtn = msg.role === 'bot' ? `<button data-chatbot-copy-index="${index}" style="background:none;border:none;font-size:12px;color:#94a3b8;cursor:pointer;padding:4px;border-radius:4px;margin-left:auto">📋</button>` : '';
    
    const isHtml = (msg && msg.format === 'html');
    const wsStyle = isHtml ? 'white-space:normal' : 'white-space:pre-wrap';
    const padStyle = isHtml ? 'padding:4px 0' : '';
    msgDiv.innerHTML = `
      <div class="chat-avatar">${avatar}</div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <div class="chat-content ${isHtml ? 'chat-content-card' : ''}" style="${wsStyle};${padStyle}">${isHtml ? String(content || '') : renderMarkdownText(String(content || ''))}</div>
        <div style="display:flex;justify-content:flex-end;align-items:center;margin-top:3px;gap:8px">
          ${timestamp ? `<span style="font-size:10px;color:#94a3b8">${timestamp}</span>` : ''}
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
      format = s.trimStart().startsWith('<') ? 'html' : 'text';
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
      <div class="chat-content">...</div>
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
