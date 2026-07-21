// heatmap-day-popup.js
// 히트맵 TOP 5 날짜 클릭 시 해당 날짜에 경기한 스트리머 카드 팝업

(function(){

function _toHttps(url){
  if(!url)return '';
  try{
    if(typeof toHttpsUrl==='function') return toHttpsUrl(url);
    return url.replace(/^http:\/\//,'https://');
  }catch(e){ return url||''; }
}

function _getPlayersOnDate(dateStr){
  const ds = String(dateStr||'');
  if(!ds) return [];

  const found = {}; // name -> {player, wins, losses, games}

  const addP = (name, result) => {
    if(!name) return;
    const p = (window.players||[]).find(x=>x.name===name);
    if(!p) return;
    if(!found[name]) found[name] = { player: p, wins:0, losses:0, games:0 };
    found[name].games++;
    if(result==='승') found[name].wins++;
    else if(result==='패') found[name].losses++;
  };

  // 개인전
  try{(window.indM||[]).forEach(m=>{
    if((m.d||'').slice(0,10)===ds){
      addP(m.wName,'승'); addP(m.lName,'패');
    }
  });}catch(e){}

  // 끝장전
  try{(window.gjM||[]).forEach(m=>{
    if((m.d||'').slice(0,10)===ds){
      addP(m.wName,'승'); addP(m.lName,'패');
    }
  });}catch(e){}

  // 팀전 (miniM, univM, ckM)
  const scanTeam = (arr) => {
    try{(arr||[]).forEach(m=>{
      if((m.d||'').slice(0,10)!==ds) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if(!g||!g.winner) return;
          const pA = g.playerA||(Array.isArray(g.teamA)?g.teamA:null);
          const pB = g.playerB||(Array.isArray(g.teamB)?g.teamB:null);
          const names = (names, winner) => {
            (Array.isArray(names)?names:[names]).filter(Boolean).forEach(n=>{
              const name = typeof n==='object'?n.name:n;
              if(name) addP(name, winner?'승':'패');
            });
          };
          names(pA, g.winner==='A');
          names(pB, g.winner==='B');
        });
      });
    });}catch(e){}
  };
  scanTeam(window.miniM);
  scanTeam(window.univM);
  scanTeam(window.ckM);
  scanTeam(window.proM);
  scanTeam(window.comps);

  // 개인 히스토리 (승기록)
  try{(window.players||[]).forEach(p=>{
    if(found[p.name]) return; // 이미 있으면 skip
    (p.history||[]).forEach(h=>{
      if((h.date||'').slice(0,10)===ds){
        addP(p.name, h.result||'');
      }
    });
  });}catch(e){}

  return Object.values(found).sort((a,b)=>{
    if(b.wins!==a.wins) return b.wins-a.wins;
    return b.games-a.games;
  });
}

function _raceColor(race){
  const r = String(race||'').toUpperCase();
  if(r==='T') return {bg:'linear-gradient(135deg,#dbeafe,#bfdbfe)',col:'#1e40af',border:'#bfdbfe'};
  if(r==='P') return {bg:'linear-gradient(135deg,#ede9fe,#ddd6fe)',col:'#6d28d9',border:'#ddd6fe'};
  if(r==='Z') return {bg:'linear-gradient(135deg,#fee2e2,#fecaca)',col:'#b91c1c',border:'#fecaca'};
  return {bg:'linear-gradient(135deg,#f1f5f9,#e2e8f0)',col:'#475569',border:'#e2e8f0'};
}

function _univColor(univName){
  try{ if(typeof gc==='function') return gc(univName)||'#64748b'; }catch(e){}
  return '#64748b';
}

window.openHeatmapDayPopup = function(dateStr, gameCount){
  const existing = document.getElementById('heatmap-day-popup');
  if(existing) existing.remove();

  const entries = _getPlayersOnDate(dateStr);
  const displayDate = String(dateStr).replace(/-/g,'.');

  const cardsHtml = entries.length
    ? entries.map(({player:p, wins, losses, games}) => {
        const rc = _raceColor(p.race);
        const uc = _univColor(p.univ);
        const photo = p.photo || p.media1 || '';
        const imgHtml = photo
          ? `<img class="hm-player-img" src="${_toHttps(photo)}" alt="${p.name||''}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            + `<div class="hm-player-fallback" style="display:none;background:${rc.bg};color:${rc.col};border-color:${rc.border}">${(p.name||'?')[0]}</div>`
          : `<div class="hm-player-fallback" style="background:${rc.bg};color:${rc.col};border-color:${rc.border}">${(p.name||'?')[0]}</div>`;

        const raceIco = p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
        const tierColor = (typeof getTierBtnColor==='function'&&p.tier)?getTierBtnColor(p.tier):'#64748b';
        const tierTxt = (typeof getTierBtnTextColor==='function'&&p.tier)?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';

        return `<div class="hm-player-card" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')">
          ${imgHtml}
          <div class="hm-player-name">${p.name||'-'}</div>
          <div class="hm-player-sub">
            ${p.univ?`<span style="color:${uc};font-weight:800;font-size:10px">${p.univ}</span>`:''}
            ${raceIco?`<span style="font-size:var(--fs-caption)">${raceIco}</span>`:''}
            ${p.tier?`<span style="background:${tierColor};color:${tierTxt};font-size:9px;font-weight:800;padding:1px 6px;border-radius:999px">${p.tier}</span>`:''}
          </div>
          ${wins>0||losses>0?`<div class="hm-player-wins">⚔️ ${wins}승 ${losses}패</div>`:''}
        </div>`;
      }).join('')
    : `<div style="text-align:center;padding:32px;color:var(--gray-l);font-size:var(--fs-base);font-weight:700;grid-column:1/-1">이 날 경기 기록을 찾을 수 없습니다</div>`;

  const overlay = document.createElement('div');
  overlay.id = 'heatmap-day-popup';
  overlay.innerHTML = `
    <div class="hm-popup-box">
      <div class="hm-popup-header">
        <div>
          <div class="hm-popup-title">📅 ${displayDate}</div>
          <div class="hm-popup-subtitle">총 <b style="color:var(--blue)">${gameCount}</b>경기 · 참여 스트리머 <b style="color:var(--green)">${entries.length}</b>명</div>
        </div>
        <button class="hm-popup-close" onclick="document.getElementById('heatmap-day-popup').remove()">✕</button>
      </div>
      <div class="hm-popup-grid">${cardsHtml}</div>
    </div>`;

  overlay.addEventListener('click', e => {
    if(e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
};

})();
