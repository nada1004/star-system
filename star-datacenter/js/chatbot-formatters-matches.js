function _getSetsText(sets, playerName) {
  if (!sets || !sets.length) return '';
  let wins = 0, losses = 0;
  sets.forEach(set => {
    if (!set.games) return;
    set.games.forEach(g => {
      if (!g.playerA || !g.playerB || !g.winner) return;
      const isA = g.playerA === playerName;
      const isB = g.playerB === playerName;
      if (!isA && !isB) return;
      const won = (isA && g.winner === 'A') || (isB && g.winner === 'B');
      if (won) wins++; else losses++;
    });
  });
  return wins + losses > 0 ? `${wins}승${losses}패` : '';
}

function _getMemberResult(sets, memberName) {
  let wins = 0, losses = 0;
  sets.forEach(set => {
    if (!set.games) return;
    set.games.forEach(g => {
      if (!g.playerA || !g.playerB || !g.winner) return;
      const isA = g.playerA === memberName;
      const isB = g.playerB === memberName;
      if (!isA && !isB) return;
      const won = (isA && g.winner === 'A') || (isB && g.winner === 'B');
      if (won) wins++; else losses++;
    });
  });
  return { wins, losses };
}

function _matchCardHeader(emoji, title, subtitle, color) {
  return `<div style="background:${color||'linear-gradient(135deg,#1e3a8a,#2563eb)'};border-radius:12px 12px 0 0;padding:12px 14px;display:flex;align-items:center;gap:8px">
    <span style="font-size:20px">${emoji}</span>
    <div>
      <div style="font-size:14px;font-weight:900;color:#fff">${title}</div>
      ${subtitle ? `<div style="font-size:var(--fs-caption);color:rgba(255,255,255,0.75)">${subtitle}</div>` : ''}
    </div>
  </div>`;
}

function _noRecordCard(emoji, label) {
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;color:#94a3b8;font-size:var(--fs-base)">${emoji} ${label} 기록이 없습니다.</div>`;
}

function _matchRow(date, leftText, score, rightText, highlight) {
  const bg = highlight ? '#eff6ff' : '#f8fafc';
  const border = highlight ? '#bfdbfe' : '#e8edf2';
  return `<div style="display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:8px;background:${bg};border:1px solid ${border};margin-bottom:4px;font-size:var(--fs-sm)">
    <span style="color:#94a3b8;min-width:70px">${date||''}</span>
    <span style="font-weight:700;color:#1a202c;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${leftText}</span>
    ${score ? `<span style="font-weight:900;color:#2563eb;min-width:32px;text-align:center">${score}</span>` : ''}
    <span style="color:#64748b;flex:1;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${rightText||''}</span>
  </div>`;
}

function _calcWL_sets(items, playerName) {
  let w=0, l=0;
  items.forEach(m => { const r=_getMemberResult(m.sets||[], playerName); w+=r.wins; l+=r.losses; });
  return {w, l};
}
function _calcWL_simple(items, playerName) {
  const w = items.filter(m=>m.wName===playerName).length;
  return {w, l: items.length - w};
}

function formatPlayerMiniM(player) {
  if (typeof miniM === 'undefined' || !miniM.length) return _noRecordCard('⚡','미니대전');
  const matches = miniM.filter(m => m.sets&&m.sets.some(s=>s.games&&s.games.some(g=>g.playerA===player.name||g.playerB===player.name)));
  if (!matches.length) return _noRecordCard('⚡', `${player.name} 미니대전`);
  const totalWL = _calcWL_sets(matches, player.name);
  const header = _matchCardHeader('⚡', `${player.name} 미니대전 기록`, `${matches.length}건__STATS__`, 'linear-gradient(135deg,#7c3aed,#5b21b6)');
  const rowFn = m => {
    const {wins,losses} = _getMemberResult(m.sets, player.name);
    const teamWon = (m.a===player.univ&&m.sa>m.sb)||(m.b===player.univ&&m.sb>m.sa);
    return _matchRow(m.d, `${m.a} vs ${m.b}`, `${m.sa}:${m.sb}`, `개인 ${wins}승${losses}패`, teamWon);
  };
  return _renderPaged(`mini_${player.name}`, matches, 0, 20, header, rowFn, totalWL);
}

function formatPlayerUnivM(player) {
  if (typeof univM === 'undefined' || !univM.length) return _noRecordCard('🏟️','대학대전');
  const matches = univM.filter(m => m.sets&&m.sets.some(s=>s.games&&s.games.some(g=>g.playerA===player.name||g.playerB===player.name)));
  if (!matches.length) return _noRecordCard('🏟️', `${player.name} 대학대전`);
  const totalWL = _calcWL_sets(matches, player.name);
  const header = _matchCardHeader('🏟️', `${player.name} 대학대전 기록`, `${matches.length}건__STATS__`, 'linear-gradient(135deg,#0891b2,#0e7490)');
  const rowFn = m => {
    const {wins,losses} = _getMemberResult(m.sets, player.name);
    const teamWon = (m.a===player.univ&&m.sa>m.sb)||(m.b===player.univ&&m.sb>m.sa);
    return _matchRow(m.d, `${m.a} vs ${m.b}`, `${m.sa}:${m.sb}`, `개인 ${wins}승${losses}패`, teamWon);
  };
  return _renderPaged(`univm_${player.name}`, matches, 0, 20, header, rowFn, totalWL);
}

function formatPlayerProM(player) {
  if (typeof proM === 'undefined' || !proM.length) return _noRecordCard('🏅','프로리그');
  const matches = proM.filter(m=>[...(m.teamAMembers||[]),...(m.teamBMembers||[])].some(mb=>mb.name===player.name));
  if (!matches.length) return _noRecordCard('🏅', `${player.name} 프로리그`);
  const totalWL = _calcWL_sets(matches, player.name);
  const header = _matchCardHeader('🏅', `${player.name} 프로리그 기록`, `${matches.length}건__STATS__`, 'linear-gradient(135deg,#d97706,#b45309)');
  const rowFn = m => {
    const {wins,losses} = _getMemberResult(m.sets, player.name);
    const inA = (m.teamAMembers||[]).some(mb=>mb.name===player.name);
    const myScore=inA?m.sa:m.sb, oppScore=inA?m.sb:m.sa;
    const myLabel=inA?m.teamALabel:m.teamBLabel, oppLabel=inA?m.teamBLabel:m.teamALabel;
    return _matchRow(m.d, `${myLabel} vs ${oppLabel}`, `${myScore}:${oppScore}`, `개인 ${wins}승${losses}패`, myScore>oppScore);
  };
  return _renderPaged(`pro_${player.name}`, matches, 0, 20, header, rowFn, totalWL);
}

function formatPlayerCkM(player) {
  if (typeof ckM === 'undefined' || !ckM.length) return _noRecordCard('🔥','CK리그');
  const matches = ckM.filter(m=>[...(m.teamAMembers||[]),...(m.teamBMembers||[])].some(mb=>mb.name===player.name));
  if (!matches.length) return _noRecordCard('🔥', `${player.name} CK리그`);
  const totalWL = _calcWL_sets(matches, player.name);
  const header = _matchCardHeader('🔥', `${player.name} CK리그 기록`, `${matches.length}건__STATS__`, 'linear-gradient(135deg,#dc2626,#b91c1c)');
  const rowFn = m => {
    const {wins,losses} = _getMemberResult(m.sets, player.name);
    const inA = (m.teamAMembers||[]).some(mb=>mb.name===player.name);
    const myScore=inA?m.sa:m.sb, oppScore=inA?m.sb:m.sa;
    return _matchRow(m.d, `${m.teamALabel||'A조'} vs ${m.teamBLabel||'B조'}`, `${myScore}:${oppScore}`, `개인 ${wins}승${losses}패`, myScore>oppScore);
  };
  return _renderPaged(`ck_${player.name}`, matches, 0, 20, header, rowFn, totalWL);
}

function formatPlayerIndM(player) {
  if (typeof indM === 'undefined' || !indM.length) return _noRecordCard('⚔️','개인전');
  const matches = indM.filter(m=>m.wName===player.name||m.lName===player.name);
  if (!matches.length) return _noRecordCard('⚔️', `${player.name} 개인전`);
  const totalWL = _calcWL_simple(matches, player.name);
  const header = _matchCardHeader('⚔️', `${player.name} 개인전 기록`, `${matches.length}건__STATS__`, 'linear-gradient(135deg,#16a34a,#15803d)');
  const rowFn = m => {
    const won = m.wName===player.name;
    return _matchRow(m.d, won?m.lName:m.wName, won?'✅승':'❌패', m.map||'', won);
  };
  return _renderPaged(`ind_${player.name}`, matches, 0, 20, header, rowFn, totalWL);
}

function formatPlayerGjM(player) {
  if (typeof gjM === 'undefined' || !gjM.length) return _noRecordCard('💥','끝장전');
  const matches = gjM.filter(m=>m.wName===player.name||m.lName===player.name);
  if (!matches.length) return _noRecordCard('💥', `${player.name} 끝장전`);
  const totalWL = _calcWL_simple(matches, player.name);
  const header = _matchCardHeader('💥', `${player.name} 끝장전 기록`, `${matches.length}건__STATS__`, 'linear-gradient(135deg,#ea580c,#c2410c)');
  const rowFn = m => {
    const won = m.wName===player.name;
    return _matchRow(m.d, won?m.lName:m.wName, won?'✅승':'❌패', m.map||'', won);
  };
  return _renderPaged(`gj_${player.name}`, matches, 0, 20, header, rowFn, totalWL);
}

function formatPlayerCompOnly(player) {
  const compMatches = (typeof comps !== 'undefined' ? comps : []).filter(m =>
    m.sets&&m.sets.some(s=>s.games&&s.games.some(g=>g.playerA===player.name||g.playerB===player.name))
  );

  const tourGroupRows = [];
  (typeof tourneys !== 'undefined' ? tourneys : []).forEach(tn => {
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if(m.sets&&m.sets.some(s=>s.games&&s.games.some(g=>g.playerA===player.name||g.playerB===player.name))) {
          tourGroupRows.push({_tnName:tn.name, _grpName:grp.name, _isTour:true, sets:m.sets, d:m.d||'', a:grp.name, b:'', sa:0, sb:0, n:tn.name});
        }
      });
    });
  });

  const tourBracketRows = [];
  (typeof tourneys !== 'undefined' ? tourneys : []).forEach(tn => {
    const bracket = tn.bracket || {};
    Object.values(bracket.matchDetails||{}).forEach(md => {
      if(md.sets&&md.sets.some(s=>s.games&&s.games.some(g=>g.playerA===player.name||g.playerB===player.name))) {
        tourBracketRows.push({_tnName:tn.name, _isBracket:true, sets:md.sets, d:md.d||'', a:md.a||'', b:md.b||'', sa:md.sa||0, sb:md.sb||0, n:tn.name});
      }
    });
  });

  const proTourRows = [];
  (typeof proTourneys !== 'undefined' ? proTourneys : []).forEach(tn => {
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if(m.a===player.name||m.b===player.name) {
          proTourRows.push({_tnName:tn.name, _isProTour:true, d:m.d||'', a:m.a||'', b:m.b||'', winner:m.winner, map:m.map, n:tn.name});
        }
      });
    });
  });

  const allRows = [
    ...compMatches.map(m=>({...m,_type:'comp'})),
    ...tourGroupRows.map(m=>({...m,_type:'tourGroup'})),
    ...tourBracketRows.map(m=>({...m,_type:'tourBracket'})),
    ...proTourRows.map(m=>({...m,_type:'proTour'})),
  ];

  if (!allRows.length) return _noRecordCard('🏆', `${player.name} 대회`);

  let tw=0,tl=0;
  compMatches.forEach(m=>{const r=_getMemberResult(m.sets,player.name);tw+=r.wins;tl+=r.losses;});
  tourGroupRows.forEach(m=>{const r=_getMemberResult(m.sets,player.name);tw+=r.wins;tl+=r.losses;});
  tourBracketRows.forEach(m=>{const r=_getMemberResult(m.sets,player.name);tw+=r.wins;tl+=r.losses;});
  proTourRows.forEach(m=>{if(m.winner===player.name)tw++;else tl++;});
  const totalWL = {wins:tw,losses:tl};

  const header = _matchCardHeader('🏆', `${player.name} 대회 기록`, `${allRows.length}건__STATS__`, 'linear-gradient(135deg,#1e3a8a,#1d4ed8)');
  const rowFn = m => {
    if(m._type==='comp') {
      const {wins,losses} = _getMemberResult(m.sets, player.name);
      const teamWon = (m.a===player.univ&&m.sa>m.sb)||(m.b===player.univ&&m.sb>m.sa);
      return _matchRow(m.d, `[${m.n||'대회'}] ${m.a} vs ${m.b}`, `${m.sa}:${m.sb}`, `개인 ${wins}승${losses}패`, teamWon);
    } else if(m._type==='tourGroup') {
      const {wins,losses} = _getMemberResult(m.sets, player.name);
      return _matchRow(m.d, `[${m._tnName} ${m._grpName||'조별리그'}]`, `개인전`, `${wins}승${losses}패`, wins>losses);
    } else if(m._type==='tourBracket') {
      const {wins,losses} = _getMemberResult(m.sets, player.name);
      const myA = m.a===player.univ||m.a===player.name;
      const myScore=myA?m.sa:m.sb, oppScore=myA?m.sb:m.sa;
      return _matchRow(m.d, `[${m._tnName} 토너먼트] ${m.a} vs ${m.b}`, `${myScore}:${oppScore}`, `개인 ${wins}승${losses}패`, wins>losses);
    } else {
      const won = m.winner===player.name;
      const opp = m.a===player.name?m.b:m.a;
      return _matchRow(m.d, `[${m._tnName}] vs ${opp}`, m.map||'', won?'승':'패', won);
    }
  };
  return _renderPaged(`comp_${player.name}`, allRows, 0, 20, header, rowFn, totalWL);
}

function formatPlayerTtM(player) {
  const matches = (typeof ttM !== 'undefined' ? ttM : []).filter(m =>
    [...(m.teamAMembers||[]),...(m.teamBMembers||[])].some(mb=>mb.name===player.name) ||
    (m.a===player.name || m.b===player.name)
  );
  if (!matches.length) return _noRecordCard('🎖️', `${player.name} 티어대회`);
  const totalWL = _calcWL_sets(matches, player.name);
  const header = _matchCardHeader('🎖️', `${player.name} 티어대회 기록`, `${matches.length}건__STATS__`, 'linear-gradient(135deg,#059669,#047857)');
  const rowFn = m => {
    const {wins,losses} = _getMemberResult(m.sets, player.name);
    const inA = (m.teamAMembers||[]).some(mb=>mb.name===player.name);
    const myScore=inA?m.sa:m.sb, oppScore=inA?m.sb:m.sa;
    const label = m.compName?`[${m.compName}]`:`[${m.tierLabel||''}]`;
    return _matchRow(m.d, `${label} ${m.teamALabel} vs ${m.teamBLabel}`, `${myScore}:${oppScore}`, `개인 ${wins}승${losses}패`, myScore>oppScore);
  };
  return _renderPaged(`tt_${player.name}`, matches, 0, 20, header, rowFn, totalWL);
}

function formatPlayerAllRecords(player) {
  const hasMember = m => [...(m.teamAMembers||[]),...(m.teamBMembers||[])].some(mb=>mb.name===player.name);
  const hasInSets = m => m.sets&&m.sets.some(s=>s.games&&s.games.some(g=>g.playerA===player.name||g.playerB===player.name));

  function cs(arr,fn){ let w=0,l=0; (arr||[]).filter(fn).forEach(m=>{const r=_getMemberResult(m.sets||[],player.name);w+=r.wins;l+=r.losses;}); return {w,l}; }
  function ss(arr){ const ms=(arr||[]).filter(m=>m.wName===player.name||m.lName===player.name); return {w:ms.filter(m=>m.wName===player.name).length,l:ms.filter(m=>m.lName===player.name).length}; }

  const mini=cs(miniM,hasInSets), univm=cs(univM,hasInSets), pro=cs(proM,hasMember);
  const ck=cs(ckM,hasMember), tt=cs(ttM,hasMember);
  const ind=ss(indM), gj=ss(gjM);
  let compW=0,compL=0;
  (typeof comps!=='undefined'?comps:[]).filter(hasInSets).forEach(m=>{const r=_getMemberResult(m.sets||[],player.name);compW+=r.wins;compL+=r.losses;});
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(hasInSets(m)){const r=_getMemberResult(m.sets||[],player.name);compW+=r.wins;compL+=r.losses;}});});
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{if(hasInSets(m)){const r=_getMemberResult(m.sets||[],player.name);compW+=r.wins;compL+=r.losses;}});
  });
  (typeof proTourneys!=='undefined'?proTourneys:[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===player.name||m.b===player.name){if(m.winner===player.name)compW++;else compL++;}});});
  });
  const comp={w:compW,l:compL};
  const total={w:mini.w+univm.w+pro.w+ck.w+comp.w+tt.w+ind.w+gj.w, l:mini.l+univm.l+pro.l+ck.l+comp.l+tt.l+ind.l+gj.l};
  const totalRate = total.w+total.l>0?((total.w/(total.w+total.l))*100).toFixed(1):0;

  function row(emoji,label,data,key){
    if(!data.w&&!data.l) return '';
    const r=data.w+data.l>0?((data.w/(data.w+data.l))*100).toFixed(1):0;
    const q = `${player.name} ${key}`;
    return `<div style="display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:8px;background:#f8fafc;border:1px solid #e8edf2;margin-bottom:4px"><span style="font-size:14px">${emoji}</span><span style="flex:1;font-size:var(--fs-sm);font-weight:700;color:#1a202c">${label}</span><span style="font-size:var(--fs-sm);color:#2563eb;font-weight:800">${data.w}승${data.l}패</span><span style="font-size:var(--fs-caption);color:#94a3b8;margin-left:2px">(${r}%)</span><span data-chatbot-quick="${escapeAttr(q)}" style="color:#2563eb;cursor:pointer;font-size:var(--fs-caption);margin-left:4px;text-decoration:underline">조회▶</span></div>`;
  }

  const rows=[
    row('⚡','미니대전',mini,'미니대전'),
    row('🏟️','대학대전',univm,'대학대전'),
    row('🏅','프로리그',pro,'프로리그'),
    row('🔥','CK리그',ck,'CK'),
    row('🏆','대회',comp,'대회기록'),
    row('🎖️','티어대회',tt,'티어대회'),
    row('⚔️','개인전',ind,'개인전'),
    row('💥','끝장전',gj,'끝장전'),
  ].filter(Boolean).join('');

  if(!rows) return _noRecordCard('📊',`${player.name}의 대전`);
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${_matchCardHeader('📊',`${player.name} 전체 기록 요약`,`총 ${total.w}승 ${total.l}패 (${totalRate}%)`,'linear-gradient(135deg,#1e293b,#334155)')}<div style="background:#fff;padding:8px 8px 4px">${rows}</div></div>`;
}

try{
  window.formatPlayerMiniM = formatPlayerMiniM;
  window.formatPlayerUnivM = formatPlayerUnivM;
  window.formatPlayerProM = formatPlayerProM;
  window.formatPlayerCkM = formatPlayerCkM;
  window.formatPlayerIndM = formatPlayerIndM;
  window.formatPlayerGjM = formatPlayerGjM;
  window.formatPlayerCompOnly = formatPlayerCompOnly;
  window.formatPlayerTtM = formatPlayerTtM;
  window.formatPlayerAllRecords = formatPlayerAllRecords;
}catch(e){}
