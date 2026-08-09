const _pagState = {};

function _renderPaged(key, items, page, perPage, headerHtml, rowFn, totalWL) {
  const total = items.length;
  const maxPage = Math.max(0, Math.ceil(total / perPage) - 1);
  page = Math.max(0, Math.min(page, maxPage));
  _pagState[key] = { items, page, perPage, headerHtml, rowFn, totalWL };

  const slice = items.slice(page * perPage, (page + 1) * perPage);
  const rows = slice.map(rowFn).join('');

  const pageInfo = `${page * perPage + 1}–${Math.min((page + 1) * perPage, total)} / 전체 ${total}건`;
  const prevBtn = page > 0
    ? `<button data-chatbot-nav-key="${escapeAttr(key)}" data-chatbot-nav-dir="-1" style="padding:5px 12px;background:#2563eb;color:#fff;border:none;border-radius:7px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">◀ 이전</button>`
    : `<button style="padding:5px 12px;background:var(--border);color:var(--text3);border:none;border-radius:7px;font-size:var(--fs-sm);cursor:default">◀ 이전</button>`;
  const nextBtn = page < maxPage
    ? `<button data-chatbot-nav-key="${escapeAttr(key)}" data-chatbot-nav-dir="1" style="padding:5px 12px;background:#2563eb;color:#fff;border:none;border-radius:7px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">다음 ▶</button>`
    : `<button style="padding:5px 12px;background:var(--border);color:var(--text3);border:none;border-radius:7px;font-size:var(--fs-sm);cursor:default">다음 ▶</button>`;

  const winRate = totalWL && totalWL.w + totalWL.l > 0 ? ((totalWL.w/(totalWL.w+totalWL.l))*100).toFixed(1) : null;
  const statsText = totalWL ? ` · 개인 ${totalWL.w}승${totalWL.l}패${winRate ? ` (${winRate}%)` : ''}` : '';

  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${headerHtml.replace('__STATS__', statsText)}<div style="background:var(--white);padding:8px 8px 4px">${rows}</div><div style="background:var(--surface);padding:7px 10px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border)">${prevBtn}<span style="font-size:var(--fs-caption);color:var(--text3)">${pageInfo}</span>${nextBtn}</div></div>`;
}

function chatNavPage(key, dir) {
  const s = _pagState[key];
  if (!s) return;
  s.page = Math.max(0, Math.min(s.page + dir, Math.ceil(s.items.length / s.perPage) - 1));
  const msg = _renderPaged(key, s.items, s.page, s.perPage, s.headerHtml, s.rowFn, s.totalWL);
  const lastBotIdx = chatHistory.map(m=>m.role).lastIndexOf('bot');
  if (lastBotIdx >= 0) {
    chatHistory[lastBotIdx].content = msg;
    saveChatHistory();
    renderChatHistory();
  }
}
try{
  window.chatNavPage = chatNavPage;
}catch(e){}
