function _bindPlayerHeaderDelegatedEvents(){
  if(window._playerHeaderDelegatedBound) return;
  window._playerHeaderDelegatedBound = true;

  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-pph-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-pph-action');
    if(action === 'open-univ'){
      e.preventDefault();
      try{ cm('playerModal'); }catch(_){}
      const univ = el.getAttribute('data-pph-univ') || '';
      setTimeout(()=>{
        if(typeof openUnivModal === 'function') openUnivModal(univ);
      }, 100);
    }
  });
}

function buildPlayerHeaderCardHTML(opts){
  const {
    player,
    hdrBg='',
    photoHTML='',
    channelHTML='',
    col='',
    p2h=(v=>'00'),
    statsTint=8,
    pmCardR=18,
    pmHdrPad='18px 18px 16px',
    pmPhotoSz=76,
    pmPhotoR=16,
    pmNameFs=20,
    pmMetaFs=11,
    pmMetaPad='3px 10px',
    pmMetaPad2='3px 9px',
    pmStatsPad='14px 6px',
    pmStatsNum1=14,
    pmStatsBig=22,
    tot=0,
    wr=0,
    cWin='#16a34a',
    cLoss='#dc2626',
    eloVal=1000,
    eloColor='#16a34a',
    eloSparkHTML=''
  } = opts || {};
  const p = player;
  if(!p) return '';
  return `<div style="background:var(--white);border:1.5px solid var(--border2);border-radius:${pmCardR}px;margin-bottom:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
    <div style="background:${hdrBg};padding:${pmHdrPad};position:relative;overflow:hidden">
      <div style="position:absolute;top:-25px;right:-25px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.09);pointer-events:none"></div>
      <div style="position:absolute;bottom:-40px;left:5px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none"></div>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;position:relative">
        <div style="width:${pmPhotoSz}px;height:${pmPhotoSz}px;border-radius:${pmPhotoR}px;background:rgba(255,255,255,.2);border:2.5px solid rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative;box-shadow:0 3px 14px rgba(0,0,0,.2)">${photoHTML}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:6px">
            <span style="font-size:${pmNameFs}px;font-weight:900;color:#fff;text-shadow:0 1px 5px rgba(0,0,0,.2)">${p.name}${genderIcon(p.gender)}</span>
            ${p.role?getRoleBadgeHTML(p.role,'11px'):''}
            ${p.tier?`<span style="background:rgba(255,255,255,.22);border:1.5px solid rgba(255,255,255,.38);border-radius:6px;padding:2px 9px;font-size:11px;font-weight:800;color:#fff">${getTierLabel(p.tier)||p.tier}</span>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span class="ubadge${p.univ&&p.univ!=='무소속'?' clickable-univ':''}" data-icon-done="1"
              ${p.univ&&p.univ!=='무소속'?`data-pph-action="open-univ" data-pph-univ="${String(p.univ).replace(/"/g,'&quot;')}"`:''}
              style="background:rgba(255,255,255,.22);color:#fff;border:1.5px solid rgba(255,255,255,.38);font-size:${pmMetaFs}px;padding:${pmMetaPad};display:inline-flex;align-items:center;gap:4px;border-radius:20px;font-weight:800${p.univ&&p.univ!=='무소속'?';cursor:pointer':''}"
              >${gUI(p.univ,'12px')}${p.univ||'무소속'}</span>
            <span style="background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);border-radius:20px;padding:${pmMetaPad2};font-size:${pmMetaFs}px;font-weight:800;color:#fff">${p.race||''} ${RNAME[p.race]||''}</span>
            ${channelHTML}
          </div>
        </div>
      </div>
    </div>
    <div style="background:${col}${p2h(statsTint)};display:grid;grid-template-columns:repeat(4,1fr)">
      <div style="text-align:center;padding:${pmStatsPad};border-right:1px solid ${col}30">
        <div style="font-size:9px;font-weight:800;color:var(--text3);letter-spacing:.6px;margin-bottom:5px">전적</div>
        <div style="font-weight:900;font-size:${pmStatsNum1}px"><span style="color:${cWin}">${p.win}W</span> <span style="color:${cLoss}">${p.loss}L</span></div>
      </div>
      <div style="text-align:center;padding:${pmStatsPad};border-right:1px solid ${col}30">
        <div style="font-size:9px;font-weight:800;color:var(--text3);letter-spacing:.6px;margin-bottom:5px">승률</div>
        <div style="font-weight:900;font-size:${pmStatsBig}px;line-height:1;color:${tot?(wr>=50?cWin:cLoss):'var(--gray-l)'}">${tot?wr+'%':'-'}</div>
      </div>
      <div style="text-align:center;padding:${pmStatsPad};border-right:1px solid ${col}30">
        <div style="font-size:9px;font-weight:800;color:var(--text3);letter-spacing:.6px;margin-bottom:5px">포인트</div>
        <div style="font-weight:900;font-size:20px;line-height:1;color:${(p.points||0)>=0?cWin:cLoss}">${pS(p.points)}</div>
      </div>
      <div style="text-align:center;padding:${pmStatsPad}">
        <div style="font-size:9px;font-weight:800;color:var(--text3);letter-spacing:.6px;margin-bottom:5px">ELO</div>
        <div style="font-weight:900;font-size:20px;line-height:1;color:${eloColor}">${eloVal}</div>
        ${eloSparkHTML}
      </div>
    </div>
  </div>`;
}

function buildPlayerSummaryStripHTML(opts){
  const {
    histAll=[],
    player,
    cWin='#16a34a',
    cLoss='#dc2626'
  } = opts || {};
  const p = player;
  if(!p) return '';
  const hist = histAll.slice();
  let streak = 0, streakType = '';
  for(const h of hist) {
    if(streak===0){ streak=1; streakType=h.result; }
    else if(h.result===streakType) streak++;
    else break;
  }
  const isWinStreak = streakType==='승';
  const streakBg = isWinStreak ? '#dcfce7' : '#fee2e2';
  const streakCol = isWinStreak ? cWin : cLoss;
  const streakBd = isWinStreak ? '#bbf7d0' : '#fecaca';
  const streakEmoji = isWinStreak ? '🔥' : '❄️';
  const streakHTML = streak>=2
    ? `<span style="font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;background:${streakBg};color:${streakCol};border:1px solid ${streakBd}">${streakEmoji} ${streak}연${streakType}</span>`
    : '';
  const allRanked=[...players].filter(q=>!q.retired).sort((a,b)=>(b.points||0)-(a.points||0)||(b.win||0)-(a.win||0));
  const myRank = allRanked.findIndex(q=>q.name===p.name)+1;
  const rankChange = typeof getRankChangeBadge==='function' ? getRankChangeBadge(p.name, myRank) : '';
  const rankHTML = myRank ? `<span style="font-size:11px;font-weight:800;color:var(--text3)">🏅 전체 ${myRank}위</span> ${rankChange}` : '';
  const recent10 = hist.slice(0,10);
  const formHTML = recent10.length>=3 ? `<div style="display:flex;gap:2px;align-items:center">
    ${recent10.map(h=>`<span style="width:14px;height:14px;border-radius:50%;background:${h.result==='승'?'#16a34a':(h.result==='무'?'#a3a3a3':'#dc2626')};display:inline-block;flex-shrink:0" title="${h.result} vs ${h.opp||''}"></span>`).join('')}
    <span style="font-size:10px;color:var(--gray-l);margin-left:3px">최근${recent10.length}</span>
  </div>` : '';
  if(!(streakHTML||rankHTML||formHTML)) return '';
  return `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 12px;margin-bottom:14px">
    ${rankHTML}
    ${streakHTML}
    ${formHTML}
  </div>`;
}

try{
  _bindPlayerHeaderDelegatedEvents();
  window.buildPlayerHeaderCardHTML = buildPlayerHeaderCardHTML;
  window.buildPlayerSummaryStripHTML = buildPlayerSummaryStripHTML;
}catch(e){}
