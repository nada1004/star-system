function formatUniversityInfo(univName) {
  if (typeof players === 'undefined') return '❌ 선수 데이터를 불러올 수 없습니다.';

  const univPlayers = players.filter(p => p.univ === univName);
  const inCfg = typeof univCfg !== 'undefined' && univCfg.some(u => u.name === univName);
  if (univPlayers.length === 0 && !inCfg) {
    const playerUnivs = [...new Set(players.map(p => p.univ))];
    const cfgUnivs = typeof univCfg !== 'undefined' ? univCfg.map(u => u.name) : [];
    const universities = [...new Set([...playerUnivs, ...cfgUnivs])];
    const similarUniv = findSimilarUniversity(univName, universities);
    if (similarUniv) {
      return `🤔 '${univName}' 대신 '${similarUniv}'을 찾았습니다.\n\n` + formatUniversityInfo(similarUniv);
    }
    return `❌ '${univName}' 대학을 찾을 수 없습니다. 다시 입력해주세요.`;
  }

  const uCfg = (typeof univCfg !== 'undefined') ? (univCfg.find(x => x.name === univName) || {}) : {};
  const logoUrl = uCfg.icon || (typeof UNIV_ICONS !== 'undefined' ? UNIV_ICONS[univName] : '') || '';
  const univColor = uCfg.color || '#1e3a8a';

  function hexToRgb(hex) {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    return {r,g,b};
  }
  const rgb = hexToRgb(univColor);
  const luminance = (rgb.r*299 + rgb.g*587 + rgb.b*114) / 1000;
  const textOnColor = luminance > 140 ? '#1a202c' : '#ffffff';
  const textSubOnColor = luminance > 140 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)';

  const ROLE_ORDER = {'이사장':0,'총장':1,'교수':2,'코치':3};
  const _tiersArr = (typeof TIERS !== 'undefined') ? TIERS : ['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스','미정'];
  const _tierIdx = t => { const i = _tiersArr.indexOf(t); return i < 0 ? 999 : i; };
  const sortedPlayers = [...univPlayers].sort((a,b) => {
    const ro = (ROLE_ORDER[a.role]??9) - (ROLE_ORDER[b.role]??9);
    if(ro !== 0) return ro;
    const to = _tierIdx(a.tier) - _tierIdx(b.tier);
    return to !== 0 ? to : (b.elo||0) - (a.elo||0);
  });

  const playerListHTML = sortedPlayers.map(p => {
    const tC = {'S':['#7c3aed','#ede9fe'],'A':['#2563eb','#dbeafe'],'B':['#16a34a','#dcfce7'],'C':['#d97706','#fef3c7'],'D':['#dc2626','#fee2e2']}[p.tier] || ['#64748b','#f1f5f9'];
    const raceIcon = p.race === '테란' ? '🔵' : p.race === '저그' ? '🟣' : p.race === '프로토스' ? '🟡' : '⚫';
    return `<div data-chatbot-quick="${escapeAttr(p.name)}" style="display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:9px;cursor:pointer;background:#f8fafc;margin-bottom:4px;border:1px solid #e8edf2"><span style="font-size:var(--fs-base);font-weight:700;color:#1a202c;flex:1">${escapeHtml(p.name)}</span><span style="font-size:var(--fs-caption);padding:2px 7px;border-radius:6px;font-weight:700;color:${tC[0]};background:${tC[1]}">${p.tier}티어</span><span style="font-size:var(--fs-caption);color:#64748b">${raceIcon} ${p.race}</span></div>`;
  }).join('');

  if (logoUrl) {
    return `<div style="border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.13)"><div style="background:${univColor}"><div style="display:flex;align-items:center;justify-content:center;padding:20px 20px 0"><img src="${logoUrl}" style="width:100%;max-width:100%;display:block;object-fit:contain" onerror="this.style.display='none'"></div><div style="padding:12px 14px 16px;text-align:center"><div style="font-size:20px;font-weight:900;color:${textOnColor};letter-spacing:-0.3px">${escapeHtml(univName)}</div><div style="font-size:var(--fs-sm);color:${textSubOnColor};margin-top:3px">소속 선수 ${univPlayers.length}명</div></div></div><div style="background:#fff;padding:8px 8px 4px"><div style="font-size:var(--fs-caption);font-weight:700;color:#94a3b8;padding:0 3px 5px;letter-spacing:0.4px">👥 선수 목록 (티어순 · 클릭하면 조회)</div>${playerListHTML}</div></div>`;
  }
  return `<div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)"><div style="background:${univColor};padding:24px 14px 18px;text-align:center"><div style="font-size:40px;margin-bottom:8px">🏫</div><div style="font-size:20px;font-weight:900;color:${textOnColor}">${escapeHtml(univName)}</div><div style="font-size:var(--fs-sm);color:${textSubOnColor};margin-top:3px">소속 선수 ${univPlayers.length}명</div></div><div style="background:#fff;padding:8px 8px 4px"><div style="font-size:var(--fs-caption);font-weight:700;color:#94a3b8;padding:0 3px 5px;letter-spacing:0.4px">👥 선수 목록 (티어순 · 클릭하면 조회)</div>${playerListHTML}</div></div>`;
}

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
  
  let univ1Wins = 0;
  let univ2Wins = 0;
  let totalMatches = 0;
  
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
    return `📭 ${univ1}과 ${univ2} 간의 대전 기록이 없습니다.`;
  }
  
  const winRate1 = totalMatches > 0 ? ((univ1Wins / totalMatches) * 100).toFixed(1) : 0;
  const winRate2 = totalMatches > 0 ? ((univ2Wins / totalMatches) * 100).toFixed(1) : 0;
  
  result += `총 대전: ${totalMatches}경기\n`;
  result += `${univ1}: ${univ1Wins}승 (${winRate1}%)\n`;
  result += `${univ2}: ${univ2Wins}승 (${winRate2}%)\n\n`;
  
  return result;
}

try{
  window.formatUniversityInfo = formatUniversityInfo;
  window.formatUniversityVsRecord = formatUniversityVsRecord;
}catch(e){}
