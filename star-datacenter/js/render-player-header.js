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
    hdrBgLayer=null,
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
    histAll=[],
    eloVal=1000,
    eloColor='#16a34a',
    eloSparkHTML='',
    isMobile=false
  } = opts || {};
  const _isMobile = isMobile || (typeof window!=='undefined' && window.innerWidth<=768);
  const p = player;
  if(!p) return '';
  const _bgSize = hdrBgLayer?.fit==='fill' ? '100% 100%' : (hdrBgLayer?.fit==='cover' ? 'cover' : 'contain');
  const _bgScale = Math.max(40, Math.min(220, Number(hdrBgLayer?.scale||100)));
  const _bgPos = String(hdrBgLayer?.pos || 'center center').trim() || 'center center';
  return `<div style="background:linear-gradient(180deg,#ffffff,#f8fafc);border:1px solid rgba(148,163,184,.18);border-radius:${pmCardR+4}px;margin-bottom:16px;overflow:hidden;box-shadow:0 18px 42px rgba(15,23,42,.10)">
    <div style="background:${hdrBg};padding:${pmHdrPad};position:relative;overflow:hidden">
      ${hdrBgLayer?.url ? `<div style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl(hdrBgLayer.url).replace(/'/g,"%27")}');background-repeat:no-repeat;background-position:${_bgPos};background-size:${_bgSize};transform:scale(${_bgScale/100});transform-origin:center center;opacity:.42;pointer-events:none"></div>` : ''}
      <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(15,23,42,.10),rgba(15,23,42,.28));pointer-events:none"></div>
      <div style="position:absolute;top:-25px;right:-25px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.09);pointer-events:none"></div>
      <div style="position:absolute;bottom:-40px;left:5px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none"></div>
      <div style="position:absolute;right:16px;bottom:12px;font-size:52px;line-height:1;opacity:.08;pointer-events:none">👤</div>
      ${_isMobile ? `
      <div style="display:flex;flex-direction:column;gap:10px;position:relative">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:${pmPhotoSz+12}px;height:${pmPhotoSz+12}px;border-radius:var(--su_profile_radius,${pmPhotoR+4}px);clip-path:var(--su_profile_clip,none);background:rgba(255,255,255,.16);border:2.5px solid rgba(255,255,255,.42);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative;box-shadow:var(--su_profile_fx, 0 8px 24px rgba(0,0,0,.18));backdrop-filter:blur(8px)">${photoHTML}</div>
          <div style="min-width:0;flex:1">
            <div style="font-size:${pmNameFs+3}px;font-weight:1000;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.22);line-height:1.2;word-break:keep-all">${p.name}${genderIcon(p.gender)}</div>
            <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:5px">
              ${p.role?getRoleBadgeHTML(p.role,'10px'):''}
              ${p.tier?`<span style="background:rgba(255,255,255,.20);border:1.5px solid rgba(255,255,255,.34);border-radius:999px;padding:2px 8px;font-size:10px;font-weight:900;color:#fff">${getTierLabel(p.tier)||p.tier}</span>`:''}
            </div>
            <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:5px">
              <span class="ubadge${p.univ&&p.univ!=='무소속'?' clickable-univ':''}" data-icon-done="1"
                ${p.univ&&p.univ!=='무소속'?`data-pph-action="open-univ" data-pph-univ="${String(p.univ).replace(/"/g,'&quot;')}"`:''}
                style="background:rgba(255,255,255,.18);color:#fff;border:1.5px solid rgba(255,255,255,.32);font-size:10px;padding:2px 8px;display:inline-flex;align-items:center;gap:3px;border-radius:999px;font-weight:800;backdrop-filter:blur(6px)${p.univ&&p.univ!=='무소속'?';cursor:pointer':''}"
                >${gUI(p.univ,'11px')}${p.univ||'무소속'}</span>
              <span style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.32);border-radius:999px;padding:2px 7px;font-size:10px;font-weight:800;color:#fff;backdrop-filter:blur(6px)">${p.race||''} ${RNAME[p.race]||''}</span>
              ${channelHTML}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:stretch">
          <div style="flex:1;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.24);border-radius:12px;padding:7px 10px;text-align:center;backdrop-filter:blur(8px)">
            <div style="font-size:8px;letter-spacing:.7px;font-weight:900;color:rgba(255,255,255,.74)">ELO RATING</div>
            <div style="font-size:22px;font-weight:1000;color:#fff;line-height:1.1;margin-top:2px">${eloVal}</div>
          </div>
          ${eloSparkHTML?`<div style="flex:1;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:6px 8px;backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center">${eloSparkHTML}</div>`:''}
        </div>
      </div>` : `
      <div style="display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;position:relative">
        <div style="width:${pmPhotoSz+12}px;height:${pmPhotoSz+12}px;border-radius:var(--su_profile_radius,${pmPhotoR+4}px);clip-path:var(--su_profile_clip,none);background:rgba(255,255,255,.16);border:2.5px solid rgba(255,255,255,.42);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative;box-shadow:var(--su_profile_fx, 0 8px 24px rgba(0,0,0,.18));backdrop-filter:blur(8px)">${photoHTML}</div>
        <div style="min-width:0">
          <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:${pmNameFs+2}px;font-weight:1000;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.22)">${p.name}${genderIcon(p.gender)}</span>
            ${p.role?getRoleBadgeHTML(p.role,'11px'):''}
            ${p.tier?`<span style="background:rgba(255,255,255,.20);border:1.5px solid rgba(255,255,255,.34);border-radius:999px;padding:3px 10px;font-size:11px;font-weight:900;color:#fff">${getTierLabel(p.tier)||p.tier}</span>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span class="ubadge${p.univ&&p.univ!=='무소속'?' clickable-univ':''}" data-icon-done="1"
              ${p.univ&&p.univ!=='무소속'?`data-pph-action="open-univ" data-pph-univ="${String(p.univ).replace(/"/g,'&quot;')}"`:''}
              style="background:rgba(255,255,255,.18);color:#fff;border:1.5px solid rgba(255,255,255,.32);font-size:${pmMetaFs}px;padding:${pmMetaPad};display:inline-flex;align-items:center;gap:4px;border-radius:999px;font-weight:800;backdrop-filter:blur(6px)${p.univ&&p.univ!=='무소속'?';cursor:pointer':''}"
              >${gUI(p.univ,'12px')}${p.univ||'무소속'}</span>
            <span style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.32);border-radius:999px;padding:${pmMetaPad2};font-size:${pmMetaFs}px;font-weight:800;color:#fff;backdrop-filter:blur(6px)">${p.race||''} ${RNAME[p.race]||''}</span>
            ${channelHTML}
          </div>
        </div>
        <div style="min-width:110px;display:flex;flex-direction:column;gap:8px">
          <div style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.24);border-radius:14px;padding:8px 10px;text-align:center;backdrop-filter:blur(8px)">
            <div style="font-size:9px;letter-spacing:.8px;font-weight:900;color:rgba(255,255,255,.74)">ELO RATING</div>
            <div style="font-size:24px;font-weight:1000;color:#fff;line-height:1.05;margin-top:4px">${eloVal}</div>
          </div>
          ${eloSparkHTML?`<div style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:6px 8px;backdrop-filter:blur(8px)">${eloSparkHTML}</div>`:''}
        </div>
      </div>`}
    </div>
    <div style="padding:14px;background:linear-gradient(180deg,#ffffff,${col}${p2h(statsTint)})">
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px">
        <div style="text-align:center;padding:${pmStatsPad};border:1px solid rgba(148,163,184,.18);border-radius:14px;background:rgba(255,255,255,.82);box-shadow:0 8px 18px rgba(15,23,42,.04)">
          <div style="font-size:9px;font-weight:900;color:var(--gray-l);letter-spacing:.7px;margin-bottom:6px">전적</div>
          <div style="font-weight:1000;font-size:${pmStatsNum1+1}px"><span style="color:${cWin}">${p.win}W</span> <span style="color:${cLoss}">${p.loss}L</span></div>
        </div>
        <div style="text-align:center;padding:${pmStatsPad};border:1px solid rgba(148,163,184,.18);border-radius:14px;background:rgba(255,255,255,.82);box-shadow:0 8px 18px rgba(15,23,42,.04)">
          <div style="font-size:9px;font-weight:900;color:var(--gray-l);letter-spacing:.7px;margin-bottom:6px">승률</div>
          <div style="font-weight:1000;font-size:${pmStatsBig}px;line-height:1;color:${tot?(wr>=50?cWin:cLoss):'var(--gray-l)'}">${tot?wr+'%':'-'}</div>
        </div>
        <div style="text-align:center;padding:${pmStatsPad};border:1px solid rgba(148,163,184,.18);border-radius:14px;background:rgba(255,255,255,.82);box-shadow:0 8px 18px rgba(15,23,42,.04)">
          <div style="font-size:9px;font-weight:900;color:var(--gray-l);letter-spacing:.7px;margin-bottom:6px">포인트</div>
          <div style="font-weight:1000;font-size:20px;line-height:1;color:${(p.points||0)>=0?cWin:cLoss}">${pS(p.points)}</div>
        </div>
        <div style="text-align:center;padding:${pmStatsPad};border:1px solid rgba(148,163,184,.18);border-radius:14px;background:rgba(255,255,255,.82);box-shadow:0 8px 18px rgba(15,23,42,.04)">
          <div style="font-size:9px;font-weight:900;color:var(--gray-l);letter-spacing:.7px;margin-bottom:6px">상태</div>
          <div style="font-weight:1000;font-size:18px;line-height:1;color:#0f172a">${p.retired?'은퇴':'활동중'}</div>
        </div>
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
  return `<div style="background:linear-gradient(135deg,#ffffff,#f8fafc);border:1px solid rgba(148,163,184,.18);border-radius:14px;padding:10px 12px 11px;margin-bottom:14px;box-shadow:0 10px 22px rgba(15,23,42,.04)">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    ${rankHTML}
    ${streakHTML}
    ${formHTML}
    </div>
  </div>`;
}

try{
  _bindPlayerHeaderDelegatedEvents();
  window.buildPlayerHeaderCardHTML = buildPlayerHeaderCardHTML;
  window.buildPlayerSummaryStripHTML = buildPlayerSummaryStripHTML;
}catch(e){}
