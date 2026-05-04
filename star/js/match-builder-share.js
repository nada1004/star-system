/* match-builder-share.js: extracted from match-builder.js */
/* ══════════════════════════════════════
   끝장전 공유카드
══════════════════════════════════════ */
function openGJShareCard(p1, p2, p1wins, p2wins, date, winner, modeKey='gj') {
  try{
    const pair = [p1, p2].sort();
    const games = gjM.filter(m => {
      const mp = [m.wName, m.lName].sort();
      const samePair = mp[0] === pair[0] && mp[1] === pair[1];
      const sameDate = (m.d||'') === date;
      const wantPro = String(modeKey||'') === 'progj';
      const sameKind = wantPro ? !!m._proLabel : !m._proLabel;
      return sameDate && samePair && sameKind;
    });
    const shareObj = {
      a: p1||'',
      b: p2||'',
      wName: winner||'',
      lName: winner===p1 ? (p2||'') : (p1||''),
      sa: Number(p1wins||0),
      sb: Number(p2wins||0),
      d: date||'',
      _matchType: String(modeKey||'gj'),
      _subLabel: String(modeKey||'')==='progj' ? '프로리그 끝장전' : '끝장전',
      _shareCardStyle: 'solo-match',
      _usePlayerPhoto: true,
      sets: [{
        label:String(modeKey||'')==='progj' ? '프로리그 끝장전' : '끝장전',
        scoreA:Number(p1wins||0),
        scoreB:Number(p2wins||0),
        winner: winner===p1 ? 'A' : winner===p2 ? 'B' : '',
        games: games.map(g=>({
          playerA:p1||'',
          playerB:p2||'',
          winner:g.wName===p1?'A':g.wName===p2?'B':'',
          map:g.map||''
        }))
      }]
    };
    if(typeof window.HistoryActionUtils?.normalizeMatchShareObjForCard === 'function' &&
       typeof window.HistoryActionUtils?.openUnifiedMatchShareCard === 'function'){
      return window.HistoryActionUtils.openUnifiedMatchShareCard(
        window.HistoryActionUtils.normalizeMatchShareObjForCard(shareObj, String(modeKey||'gj'))
      );
    }
  }catch(e){}
  _shareMode = 'match';
  openShareCardModal();
  setTimeout(() => renderGJShareCard(p1, p2, p1wins, p2wins, date, winner), 80);
}

function renderGJShareCard(p1, p2, p1wins, p2wins, date, winner) {
  const card = document.getElementById('share-card');
  if (!card) return;
  const pp1 = players.find(x => x.name === p1) || {};
  const pp2 = players.find(x => x.name === p2) || {};
  const col1 = gc(pp1.univ || '');
  const col2 = gc(pp2.univ || '');
  const winnerCol = p1 === winner ? col1 : p2 === winner ? col2 : '#475569';

  // 해당 세션 게임 목록 gjM에서 필터링
  const pair = [p1, p2].sort();
  const games = gjM.filter(m => {
    const mp = [m.wName, m.lName].sort();
    return (m.d||'') === date && mp[0] === pair[0] && mp[1] === pair[1];
  });

  const WC = '#111';
  const LC = '#94a3b8';

  const raceLabel = r => r==='T'?'테란':r==='Z'?'저그':r==='P'?'프로토스':'';
  const ct = t => t ? t.replace(/티어$/,'') : '';
  const playerInfoBlock = (name, pObj, isWinner, side) => {
    const photo = getPlayerPhotoHTML(name, '64px', `border:3px solid ${isWinner?'#a855f7':'#e9d5ff'};box-shadow:${isWinner?'0 4px 16px rgba(168,85,247,.45)':'0 2px 8px rgba(0,0,0,.07)'};${!isWinner&&winner?'opacity:.4;filter:grayscale(.5)':''}`);
    const race = raceLabel(pObj.race||'');
    const tier = pObj.tier ? `<span style="background:${getTierBtnColor(pObj.tier)||'#64748b'};color:${getTierBtnTextColor(pObj.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${ct(pObj.tier)}</span>` : '';
    const raceSpan = race ? `<span style="font-size:10px;color:#94a3b8">${race}</span>` : '';
    const isRight = side === 'right';
    const badges = isRight ? `${raceSpan}${tier}` : `${tier}${raceSpan}`;
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:${isRight?'flex-end':'flex-start'};gap:6px;min-width:0">
      <div style="flex-shrink:0;position:relative">
        ${photo}
        ${isWinner&&winner?`<div style="position:absolute;bottom:-2px;${isRight?'left:-2px':'right:-2px'};font-size:13px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.2))">🏆</div>`:''}
      </div>
      <div style="text-align:${isRight?'right':'left'};width:100%;min-width:0">
        <div style="font-size:13px;font-weight:${isWinner?'800':'500'};color:${isWinner?WC:LC};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
        <div style="display:flex;align-items:center;justify-content:${isRight?'flex-end':'flex-start'};gap:4px;flex-wrap:wrap;margin-top:3px">${badges}</div>
      </div>
    </div>`;
  };

  const gameRows = games.map((m, gi) => {
    const p1win = m.wName === p1;
    const p1Photo = getPlayerPhotoHTML(p1, '16px', `flex-shrink:0;${!p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const p2Photo = getPlayerPhotoHTML(p2, '16px', `flex-shrink:0;${p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const mapTxt = m.map && m.map !== '-' ? `<span style="color:#94a3b8;font-size:9px;margin-left:2px">📍${m.map}</span>` : '';
    return `<div style="display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:8px;background:${p1win?'rgba(168,85,247,.08)':'rgba(255,255,255,.5)'};margin-bottom:3px">
      <span style="font-size:9px;color:#a78bfa;min-width:26px;font-weight:700">${gi+1}G</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1;justify-content:flex-end">
        ${p1Photo}<span style="font-size:11px;font-weight:${p1win?'700':'400'};color:${p1win?WC:LC}">${p1}</span>
      </span>
      <span style="font-size:9px;color:#ddd6fe;flex-shrink:0">vs</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1">
        ${p2Photo}<span style="font-size:11px;font-weight:${p1win?'400':'700'};color:${p1win?LC:WC}">${p2}</span>
      </span>
      ${mapTxt}
    </div>`;
  }).join('');

  card.innerHTML = `<div style="background:linear-gradient(135deg,#f0f7ff 0%,#fdf4ff 50%,#fff7ed 100%);border-radius:22px;padding:20px 18px;font-family:'Noto Sans KR',sans-serif;color:#111;overflow:hidden;position:relative;box-shadow:0 8px 40px rgba(99,102,241,.15)">
    <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#6366f1,#a855f7,#ec4899);border-radius:22px 22px 0 0"></div>
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:linear-gradient(135deg,#a855f720,#ec489910);pointer-events:none"></div>
    <div style="position:absolute;bottom:-30px;left:-30px;width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#6366f115,#38bdf810);pointer-events:none"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:16px;margin-top:4px">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <div style="font-size:11px;font-weight:900;color:#7c3aed;background:linear-gradient(90deg,#ede9fe,#fae8ff);padding:5px 12px;border-radius:999px;border:1.5px solid #c4b5fd">⚔️ 끝장전</div>
        <div style="font-size:10px;font-weight:800;color:#7c3aed;background:rgba(255,255,255,.72);padding:5px 10px;border-radius:999px;border:1px solid rgba(168,85,247,.18)">공유 카드</div>
      </div>
      <div style="font-size:10px;color:#a78bfa;font-weight:700;background:rgba(255,255,255,.7);padding:5px 10px;border-radius:999px;border:1px solid rgba(168,85,247,.18)">${date||''}</div>
    </div>
    <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:${games.length?'14':'0'}px">
      ${playerInfoBlock(p1, pp1, p1===winner, 'left')}
      <div style="text-align:center;flex-shrink:0;padding:10px 2px 0">
        <div style="font-size:40px;font-weight:900;line-height:1;letter-spacing:-2px">
          <span style="color:${p1===winner?'#7c3aed':'#c4b5fd'}">${p1wins}</span>
          <span style="color:#ddd6fe;font-size:22px;margin:0 1px">:</span>
          <span style="color:${p2===winner?'#7c3aed':'#c4b5fd'}">${p2wins}</span>
        </div>
        ${winner?`<div style="font-size:8px;background:linear-gradient(90deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;margin-top:5px;letter-spacing:1px">WIN</div>`:''}
      </div>
      ${playerInfoBlock(p2, pp2, p2===winner, 'right')}
    </div>
    ${games.length ? `<div style="background:rgba(255,255,255,.7);backdrop-filter:blur(4px);border-radius:14px;padding:10px;border:1px solid rgba(196,181,253,.3)">
      <div style="font-size:9px;color:#a78bfa;font-weight:700;margin-bottom:8px;letter-spacing:.5px">경기 상세</div>
      ${gameRows}
    </div>` : ''}
    <div style="margin-top:12px;text-align:right;font-size:8px;color:#c4b5fd;letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
  </div>`;
}

