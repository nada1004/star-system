function formatPlayerRecentRecord(player) {
  const _existIds = new Set((player.history||[]).map(h=>h.matchId).filter(Boolean));
  const _tourExtra = [];
  (typeof tourneys !== 'undefined' ? tourneys : []).forEach(tn => {
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if(!m._id||_existIds.has(m._id)) return;
        (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
          if(!g.playerA||!g.playerB||!g.winner) return;
          const wn=g.winner==='A'?g.playerA:g.playerB;
          const ln=g.winner==='A'?g.playerB:g.playerA;
          if(wn!==player.name&&ln!==player.name) return;
          _tourExtra.push({date:m.d||'',result:wn===player.name?'승':'패',opp:wn===player.name?ln:wn,map:g.map||'-',mode:tn.type==='tier'?'티어대회':'조별리그'});
        });});
      });
    });
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if(!m._id||_existIds.has(m._id)) return;
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner) return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        if(wn!==player.name&&ln!==player.name) return;
        _tourExtra.push({date:m.d||'',result:wn===player.name?'승':'패',opp:wn===player.name?ln:wn,map:g.map||'-',mode:'대회'});
      });});
    });
  });

  const allHistory = [...(player.history||[]), ..._tourExtra];
  if (!allHistory.length) {
    return `<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;color:var(--text3);font-size:var(--fs-base)">📭 ${escapeHtml(player.name)}의 경기 기록이 없습니다.</div>`;
  }

  const sortedHistory = [...allHistory].sort((a, b) => (b.date||'').localeCompare(a.date||''));
  const recentGames = sortedHistory.slice(0, 30);
  const wins = recentGames.filter(h => h.result === '승').length;
  const losses = recentGames.length - wins;
  const rate = recentGames.length > 0 ? ((wins / recentGames.length) * 100).toFixed(1) : 0;
  
  const safePlayerName = escapeHtml(player.name);
  const header = `<div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;padding:12px 14px">
    <div style="font-size:var(--fs-md);font-weight:900">📊 ${safePlayerName} 최근 30경기 전적</div>
    <div style="font-size:var(--fs-sm);font-weight:800;opacity:.92;margin-top:4px">승 ${escapeHtml(wins)} · 패 ${escapeHtml(losses)} · 승률 ${escapeHtml(rate)}%</div>
  </div>`;

  const rows = recentGames.map(h=>{
    const safeDate = escapeHtml(h.date || '-');
    const safeMap = escapeHtml(h.map || '-');
    const safeRes = escapeHtml(h.result || '-');
    const oppRaw = String(h.opp || '');
    const safeOpp = escapeHtml(oppRaw || '?');
    const oppPlayer = typeof players !== 'undefined' ? players.find(p => p.name === oppRaw) : null;
    const oppDisplay = oppPlayer
      ? `<span data-chatbot-quick="${escapeAttr(oppRaw)}" style="color:var(--blue);cursor:pointer;text-decoration:underline">${safeOpp}</span>`
      : safeOpp;
    const resColor = (h.result === '승') ? '#dc2626' : (h.result === '패') ? '#2563eb' : '#64748b';
    return `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--border);font-size:var(--fs-sm)">
      <span style="color:var(--text3);font-weight:700;min-width:72px">${safeDate}</span>
      <span style="color:${resColor};font-weight:900;min-width:22px;text-align:center">${safeRes}</span>
      <span style="color:var(--text2);font-weight:700;min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeMap}</span>
      <span style="color:var(--text);font-weight:800;white-space:nowrap">vs ${oppDisplay}</span>
    </div>`;
  }).join('');

  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white)">${rows}</div></div>`;
}

try{
  window.formatPlayerRecentRecord = formatPlayerRecentRecord;
}catch(e){}
