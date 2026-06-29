// ══════════════════════════════════════════════════════════
// board2-briefing-data.js — 브리핑 데이터 집계/계산 헬퍼
// board2-briefing.js 에서 분리됨
// 의존: constants.js (players, univCfg 등 전역)
// ══════════════════════════════════════════════════════════

// ─── 데이터 집계 헬퍼 ─────────────────────────
function _b2WeeklyAggregate(players, dateFrom, dateTo) {
  const dateNum = s => parseInt(String(s || '').replace(/[-\.\/]/g, '')) || 0;
  const fromN = dateNum(dateFrom), toN = dateNum(dateTo);
  const inRange = d => { const dn = dateNum(d); return dn >= fromN && dn <= toN; };
  const isOff   = mode => { const m = String(mode||'').trim(); return m && !['스폰서','스크리미지','연습',''].includes(m); };
  const isPro   = mode => String(mode||'').indexOf('프로리그') !== -1;
  // 브리핑 집계 제외 모드: 개인전 / 끝장전 / 프로리그 기록은 반영하지 않음
  const isBriefingExcluded = mode => {
    const m = String(mode||'').trim();
    return m.indexOf('프로리그') !== -1 || m.indexOf('개인전') !== -1 || m.indexOf('끝장전') !== -1;
  };

  // ── 외부 소스에서 플레이어별 경기 목록 구성 ──────────────────
  // key: playerName → [{date,result,oppRace,mode}]
  const extMap = {};
  const addExt = (name, date, result, oppRace, mode) => {
    if (!name || !date || !result) return;
    if (!inRange(date)) return;
    if (isBriefingExcluded(mode)) return;
    if (!extMap[name]) extMap[name] = [];
    extMap[name].push({ date, result, oppRace: oppRace||'', mode: mode||'' });
  };
  const _b2TeamNames = (side) => {
    if (Array.isArray(side)) {
      return side.map(x => {
        if (x && typeof x === 'object') return String(x.name || '').trim();
        return String(x || '').trim();
      }).filter(Boolean);
    }
    return String(side || '').split(/[,+，]/).map(x => x.trim()).filter(Boolean);
  };
  const _b2AddTeamGameExt = (game, date, modeLabel) => {
    if (!game || !date || !game.winner) return;
    const teamA = (Array.isArray(game.teamA) && game.teamA.length)
      ? _b2TeamNames(game.teamA)
      : (game.a1 || game.a2)
        ? [game.a1, game.a2].filter(Boolean)
        : _b2TeamNames(game.playerA);
    const teamB = (Array.isArray(game.teamB) && game.teamB.length)
      ? _b2TeamNames(game.teamB)
      : (game.b1 || game.b2)
        ? [game.b1, game.b2].filter(Boolean)
        : _b2TeamNames(game.playerB);
    if (teamA.length >= 2 && teamB.length >= 2) {
      const winTeam = game.winner === 'A' ? teamA : teamB;
      const loseTeam = game.winner === 'A' ? teamB : teamA;
      winTeam.forEach(name => addExt(name, date, '승', '', modeLabel));
      loseTeam.forEach(name => addExt(name, date, '패', '', modeLabel));
      return true;
    }
    return false;
  };

  // 개인전 (indM)
  try { (typeof indM!=='undefined'&&Array.isArray(indM)?indM:[]).forEach(m=>{
    if (!m || !m.d || !m.wName || !m.lName) return;
    const wp = players.find(p=>p.name===m.wName), lp = players.find(p=>p.name===m.lName);
    addExt(m.wName, m.d, '승', lp?.race||'', m.mode||'개인전');
    addExt(m.lName, m.d, '패', wp?.race||'', m.mode||'개인전');
  }); } catch(e){}

  // 끝장전 (gjM)
  try { (typeof gjM!=='undefined'&&Array.isArray(gjM)?gjM:[]).forEach(m=>{
    if (!m || !m.d || !m.wName || !m.lName) return;
    if (m._proLabel) return;
    const wp = players.find(p=>p.name===m.wName), lp = players.find(p=>p.name===m.lName);
    addExt(m.wName, m.d, '승', lp?.race||'', m.mode||'끝장전');
    addExt(m.lName, m.d, '패', wp?.race||'', m.mode||'끝장전');
  }); } catch(e){}

  // 티어대회 (ttM)
  try { (typeof ttM!=='undefined'&&Array.isArray(ttM)?ttM:[]).forEach(m=>{
    if (!m || !m.d) return;
    (m.sets||[]).forEach(s=>{
      (s.games||[]).forEach(g=>{
        if (_b2AddTeamGameExt(g, m.d, '티어대회')) return;
        if (!g || !g.playerA || !g.playerB || !g.winner) return;
        const pA = players.find(p=>p.name===g.playerA), pB = players.find(p=>p.name===g.playerB);
        const wA = g.winner==='A', wB = g.winner==='B';
        addExt(g.playerA, m.d, wA?'승':'패', pB?.race||'', '티어대회');
        addExt(g.playerB, m.d, wB?'승':'패', pA?.race||'', '티어대회');
      });
    });
  }); } catch(e){}

  // 팀전 (miniM/univM/ckM/proM) - 게임 단위 개인 전적 집계
  const _scanTeamMatches = (arr, modeLabel) => {
    try { (Array.isArray(arr)?arr:[]).forEach(m=>{
      if (!m || !m.d) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if (!g || !g.winner) return;
          if (_b2AddTeamGameExt(g, m.d, modeLabel)) return;
          // 개인전 형식 (playerA/B)
          if (g.playerA && g.playerB) {
            const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
            addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', modeLabel);
            addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', modeLabel);
          }
        });
      });
    }); } catch(e){}
  };
  _scanTeamMatches(typeof miniM!=='undefined'?miniM:[], '미니대전');
  _scanTeamMatches(typeof univM!=='undefined'?univM:[], '대학대전');
  _scanTeamMatches(typeof ckM!=='undefined'?ckM:[], '대학CK');

  // 대회 (tourneys) - 조별/브라켓/일반
  try { (typeof tourneys!=='undefined'&&Array.isArray(tourneys)?tourneys:[]).forEach(tn=>{
    // 조별리그
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if (!m || !m.d) return;
        (m.sets||[]).forEach(s=>{
          (s.games||[]).forEach(g=>{
            if (_b2AddTeamGameExt(g, m.d, '대회')) return;
            if (!g || !g.playerA || !g.playerB || !g.winner) return;
            const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
            addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', '대회');
            addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', '대회');
          });
        });
      });
    });
    // 브라켓
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if (!m || !m.d) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if (_b2AddTeamGameExt(g, m.d, '대회')) return;
          if (!g || !g.playerA || !g.playerB || !g.winner) return;
          const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
          addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', '대회');
          addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', '대회');
        });
      });
    });
    // 일반 경기
    (tn.normalMatches||[]).forEach(m=>{
      if (!m || !m.d) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if (_b2AddTeamGameExt(g, m.d, '대회')) return;
          if (!g || !g.playerA || !g.playerB || !g.winner) return;
          const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
          addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', '대회');
          addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', '대회');
        });
      });
    });
  }); } catch(e){}

  return players.map(p => {
    // p.history (직접 기록) + 외부 소스 경기 합산
    const phist = (Array.isArray(p.history) ? p.history : [])
      .filter(h => inRange(h.date || h.d || '') && !isBriefingExcluded(h.mode || h.label || h.type || h.kind || h.cat || ''));
    const extHist = (extMap[p.name] || []).filter(h => !isBriefingExcluded(h.mode || ''));

    // 중복 제거: p.history에 이미 있는 날짜+결과+oppRace 조합은 외부에서 제외
    const histKeys = new Set(phist.map(h => `${h.date||h.d||''}|${h.result||''}`));
    const extFiltered = extHist.filter(h => !histKeys.has(`${h.date||''}|${h.result||''}`));

    const hist = [...phist, ...extFiltered];
    const wins   = hist.filter(h => h.result === '승').length;
    const losses = hist.filter(h => h.result === '패').length;
    const total  = wins + losses;
    const offH   = hist.filter(h => isOff(h.mode));
    const spH    = hist.filter(h => !isOff(h.mode));
    // 종족별 상대 전적
    const vsRace = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    hist.forEach(h => {
      const r = String(h.oppRace||'').trim().toUpperCase();
      if (vsRace[r]) { h.result==='승' ? vsRace[r].w++ : vsRace[r].l++; }
    });
    return {
      p, wins, losses, total, winRate: total ? Math.round(wins/total*100) : null,
      offWins: offH.filter(h=>h.result==='승').length, offLosses: offH.filter(h=>h.result==='패').length,
      spWins:  spH.filter(h=>h.result==='승').length,  spLosses:  spH.filter(h=>h.result==='패').length,
      vsRace, hist
    };
  });
}

// ─── 유니브 집계 ──────────────────────────────
function _b2WeeklyUnivStats(players, dateFrom, dateTo, univList) {
  const stats = _b2WeeklyAggregate(players, dateFrom, dateTo);
  return univList.map(u => {
    const members = stats.filter(s => String(s.p?.univ||'').trim() === u.name);
    const active  = members.filter(s => s.total > 0);
    const tw = active.reduce((a,s)=>a+s.wins,0);
    const tl = active.reduce((a,s)=>a+s.losses,0);
    const tg = tw + tl;
    const raceCount = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    active.forEach(s => { ['P','T','Z'].forEach(r => { raceCount[r].w+=s.vsRace[r].w; raceCount[r].l+=s.vsRace[r].l; }); });
    return { u, members, active, tw, tl, tg, wr: tg ? Math.round(tw/tg*100) : null, raceCount };
  }).sort((a,b) => b.tg - a.tg);
}

// ─── MVP 선정 ─────────────────────────────────
function _b2WeeklyMVP(univStats) {
  let best = null, bestScore = -1;
  univStats.forEach(ud => {
    ud.active.forEach(s => {
      if (s.total < 3) return; // 최소 3경기
      if (String(s.p?.gender||'').trim() !== 'F') return;
      const score = s.wins * 3 + (s.total > 0 ? (s.wins/s.total)*10 : 0) + (s.offWins * 2);
      if (score > bestScore) { bestScore = score; best = s; }
    });
  });
  return best;
}
// ─── MVP 2위 선정 ─────────────────────────────
function _b2WeeklyMVP2(univStats, mvp1) {
  let best = null, bestScore = -1;
  const mvp1Name = mvp1?.p?.name || null;
  univStats.forEach(ud => {
    ud.active.forEach(s => {
      if (s.total < 3) return;
      if (String(s.p?.gender||'').trim() !== 'F') return;
      if (mvp1Name && s.p?.name === mvp1Name) return; // MVP 1위 제외
      const score = s.wins * 3 + (s.total > 0 ? (s.wins/s.total)*10 : 0) + (s.offWins * 2);
      if (score > bestScore) { bestScore = score; best = s; }
    });
  });
  return best;
}
// ─── 이번주 최악(최다 패배) 선정 ──────────────
function _b2WeeklyWorst(univStats) {
  let worst = null, worstScore = -1;
  univStats.forEach(ud => {
    ud.active.forEach(s => {
      if (s.total < 2) return; // 최소 2경기
      if (String(s.p?.gender||'').trim() !== 'F') return;
      // 패배 수 우선, 동률이면 낮은 승률
      const score = s.losses * 3 + (s.total > 0 ? ((s.total - s.wins)/s.total)*10 : 0);
      if (score > worstScore) { worstScore = score; worst = s; }
    });
  });
  return worst;
}

// ─── 대학별 MVP ───────────────────────────────
function _b2WeeklyUnivMVP(active) {
  const candidates = (Array.isArray(active) ? active : [])
    .filter(s => s && s.total > 0)
    .map(s => {
      const netWins = (s.wins || 0) - (s.losses || 0);
      const winRate = s.total > 0 ? (s.winRate ?? Math.round((s.wins || 0) / s.total * 100)) : null;
      const offTotal = (s.offWins || 0) + (s.offLosses || 0);
      return {
        ...s,
        netWins,
        offTotal,
        aceQualified: (s.total >= 3) && ((winRate ?? 0) >= 50) && (netWins >= 1),
        aceScore: netWins * 100 + (winRate ?? 0) * 2 + offTotal * 4 + (s.wins || 0)
      };
    });
  const sorter = (a, b) =>
    (b.aceScore - a.aceScore) ||
    (b.netWins - a.netWins) ||
    ((b.winRate ?? -1) - (a.winRate ?? -1)) ||
    (b.offTotal - a.offTotal) ||
    (b.total - a.total) ||
    (b.wins - a.wins);
  const qualified = candidates.filter(s => s.aceQualified).sort(sorter);
  if (qualified.length) return qualified[0];
  return null;
}

// ─── 최근 폼 렌더 ─────────────────────────────
function _b2WeeklyForm(hist) {
  const sorted = [...hist].sort((a,b)=>{
    const da=parseInt(String(a.date||'').replace(/[-\.\/]/g,''))||0;
    const db=parseInt(String(b.date||'').replace(/[-\.\/]/g,''))||0;
    return da!==db?da-db:(a.time||0)-(b.time||0);
  });
  return sorted.slice(-5).map(h => {
    const c = h.result==='승'?'#10b981':h.result==='패'?'#ef4444':'#94a3b8';
    const t = h.result==='승'?'W':h.result==='패'?'L':'-';
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:${c};font-size:9px;color:#fff;font-weight:900;flex-shrink:0">${t}</span>`;
  }).join('');
}

// ─── 막대 차트 SVG ────────────────────────────
function _b2WeeklyBarChart(univStats) {
  const visible = univStats.filter(ud => ud.tg > 0).slice(0, 10);
  if (!visible.length) return '';
  const maxGames = Math.max(...visible.map(ud => ud.tg), 1);
  const BAR_H = 28, GAP = 6, LEFT = 90, RIGHT = 160, TOP = 14, BOT = 10;
  const H = visible.length * (BAR_H + GAP) + TOP + BOT;
  const W = '100%';
  let rows = '';
  visible.forEach((ud, i) => {
    const y = TOP + i * (BAR_H + GAP);
    const color = (gc ? gc(ud.u.name) : '#64748b') || '#64748b';
    const wBarW = `${Math.round(ud.tw / maxGames * 100)}%`;
    const lBarW = `${Math.round(ud.tl / maxGames * 100)}%`;
    const wr = ud.wr !== null ? `${ud.wr}%` : '-';
    const wrColor = ud.wr===null?'#94a3b8':ud.wr>=60?'#10b981':ud.wr>=40?'#f59e0b':'#ef4444';
    rows += `
      <text x="${LEFT - 6}" y="${y + BAR_H/2 + 4}" text-anchor="end" font-size="11" font-weight="700" fill="var(--text2)" style="font-family:inherit">${ud.u.name.length > 6 ? ud.u.name.slice(0,6)+'…' : ud.u.name}</text>
      <rect x="${LEFT}" y="${y}" width="0" height="${BAR_H * 0.55}" rx="3" fill="${color}" opacity="0.85">
        <animate attributeName="width" from="0" to="${wBarW}" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/>
      </rect>
      <rect x="${LEFT}" y="${y + BAR_H * 0.58}" width="0" height="${BAR_H * 0.38}" rx="3" fill="${color}" opacity="0.35">
        <animate attributeName="width" from="0" to="${lBarW}" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/>
      </rect>
      <text x="${LEFT + 4}" y="${y + BAR_H * 0.55 - 5}" font-size="10" fill="${color}" font-weight="800">${ud.tw}승</text>
      <text x="${LEFT + 4}" y="${y + BAR_H - 4}" font-size="10" fill="${color}" opacity="0.7">${ud.tl}패</text>
      <text x="calc(${LEFT}px + ${wBarW})" y="${y + BAR_H/2 + 4}" font-size="12" font-weight="900" fill="${wrColor}" style="font-family:inherit">${wr}</text>`;
  });

  // foreignObject로 반응형 처리
  return `<div style="width:100%;overflow:hidden;padding:4px 0">
    <svg viewBox="0 0 520 ${H}" width="100%" style="overflow:visible;display:block">
      <defs>
        <style>.b2wchart-label{font-family:inherit}</style>
      </defs>
      ${visible.map((ud, i) => {
        const y = TOP + i * (BAR_H + GAP);
        const color = (gc ? gc(ud.u.name) : '#64748b') || '#64748b';
        const wPct  = Math.round(ud.tw / maxGames * (520 - LEFT - RIGHT));
        const lPct  = Math.round(ud.tl / maxGames * (520 - LEFT - RIGHT));
        const wr = ud.wr !== null ? `${ud.wr}%` : '-';
        const wrColor = ud.wr===null?'#94a3b8':ud.wr>=60?'#10b981':ud.wr>=40?'#f59e0b':'#ef4444';
        const name = ud.u.name.length > 6 ? ud.u.name.slice(0,6)+'…' : ud.u.name;
        const MAX_W = 520 - LEFT - RIGHT;
        return `
          <text x="${LEFT-6}" y="${y+BAR_H*0.62}" text-anchor="end" font-size="11" font-weight="700" fill="var(--text2)">${name}</text>
          <rect x="${LEFT}" y="${y}" width="${wPct}" height="${BAR_H*0.52}" rx="3" fill="${color}" opacity="0.9"/>
          <rect x="${LEFT}" y="${y+BAR_H*0.56}" width="${lPct}" height="${BAR_H*0.38}" rx="3" fill="${color}" opacity="0.3"/>
          ${ud.tw>0?`<text x="${LEFT+wPct+4}" y="${y+BAR_H*0.44}" font-size="10" font-weight="900" fill="${color}">${ud.tw}승</text>`:''}
          ${ud.tl>0?`<text x="${LEFT+lPct+4}" y="${y+BAR_H*0.88}" font-size="10" fill="${color}" opacity="0.7">${ud.tl}패</text>`:''}
          <text x="${520-RIGHT+8}" y="${y+BAR_H*0.62}" font-size="13" font-weight="900" fill="${wrColor}">${wr}</text>
          <text x="${520-RIGHT+50}" y="${y+BAR_H*0.62}" font-size="11" fill="var(--text3)">${ud.tg}전 ${ud.active.length}명</text>`;
      }).join('')}
    </svg>
  </div>`;
}

// ─── 종족별 통계 렌더 ─────────────────────────
function _b2WeeklyRaceStats(raceCount) {
  const races = [
    { key:'P', label:'프로토스', ico:'🔮', color:'#8b5cf6' },
    { key:'T', label:'테란',     ico:'⚔️', color:'#3b82f6' },
    { key:'Z', label:'저그',     ico:'🦎', color:'#f59e0b' }
  ];
  const rows = races.map(({ key, label, ico, color }) => {
    const { w, l } = raceCount[key];
    const t = w + l;
    const wr = t ? Math.round(w/t*100) : null;
    const wrColor = wr===null ? '#94a3b8' : wr>=60 ? '#10b981' : wr>=40 ? '#f59e0b' : '#ef4444';
    return `<div class="b2w2-race-row">
      <div class="b2w2-race-cell b2w2-race-cell-main">
        <span style="font-size:13px;width:20px;text-align:center;flex-shrink:0">${ico}</span>
        <span style="font-size:11px;font-weight:800;color:var(--text2);white-space:nowrap">${label}</span>
      </div>
      <div class="b2w2-race-cell"><span class="b2w2-race-pill win">${w}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-pill loss">${l}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-count">${t}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-rate" style="color:${wrColor};border-color:${color}2e;background:${color}10">${wr!==null?`${wr}%`:'-'}</span></div>
    </div>`;
  }).join('');
  return `<div class="b2w2-race-table">
    <div class="b2w2-race-head">
      <span>상대 종족</span>
      <span>승</span>
      <span>패</span>
      <span>총전</span>
      <span>승률</span>
    </div>
    ${rows}
  </div>`;
}

// ─── 이전주 비교 배지 ─────────────────────────
function _b2WeeklyDelta(curr, prev) {
  if (prev === null || curr === null) return '';
  const d = curr - prev;
  if (d === 0) return `<span style="font-size:10px;color:var(--text3);margin-left:4px">━ ${prev}%</span>`;
  const arrow = d > 0 ? '▲' : '▼';
  const col   = d > 0 ? '#10b981' : '#ef4444';
  return `<span style="font-size:10px;font-weight:800;color:${col};margin-left:4px">${arrow}${Math.abs(d)}%</span><span style="font-size:10px;color:var(--text3);margin-left:2px">vs 전주</span>`;
}

// ═══════════════════════════════════════════════
//  메인 렌더 함수
// ═══════════════════════════════════════════════
