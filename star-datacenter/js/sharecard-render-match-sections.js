(function(){
  function buildShareMatchSetsHTML(args){
    const { m, theme, variant, ca, cb, a, b, dispA, dispB, getPlayerPhotoHTML } = args || {};
    if(!(m && m.sets && m.sets.length)) return '';
    return m.sets.map((s,si)=>{
      const rawLabel=s.label ? String(s.label) : `${si+1}세트`;
      const isAce=/에이스/.test(rawLabel);
      const sLabel=rawLabel.replace(/⚡\s*/g,'').replace(/에이스결전|에이스전/g, `${si+1}세트`);
      const swA=s.scoreA||0,swB=s.scoreB||0;
      const sAW=swA>swB,sBW=swB>swA;
      const gameList=(s.games||[]).filter(g=>g.playerA||g.playerB);
      const games=gameList.map((g,gi)=>{
        const aW=g.winner==='A',bW=g.winner==='B';
        const loserA=!aW&&bW?';filter:grayscale(.45) brightness(.92);opacity:.74':'';
        const loserB=!bW&&aW?';filter:grayscale(.45) brightness(.92);opacity:.74':'';
        const photoA=g.playerA?`<span onclick="openPlayerModal('${String(g.playerA).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}')" title="스트리머 상세" style="cursor:pointer;display:inline-flex;flex-shrink:0">${getPlayerPhotoHTML(g.playerA,'28px',`flex-shrink:0${loserA}`)}</span>`:'';
        const photoB=g.playerB?`<span onclick="openPlayerModal('${String(g.playerB).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}')" title="스트리머 상세" style="cursor:pointer;display:inline-flex;flex-shrink:0">${getPlayerPhotoHTML(g.playerB,'28px',`flex-shrink:0${loserB}`)}</span>`:'';
        const winA=aW?`<span style="background:${ca};color:#fff;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:800;flex-shrink:0">WIN</span>`:'';
        const winB=bW?`<span style="background:${cb};color:#fff;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:800;flex-shrink:0">WIN</span>`:'';
        return`<div class="share-match-game-row" style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid ${theme.divider}">
          <span class="share-match-game-idx" style="color:${theme.textDim};min-width:38px;font-size:10px;text-align:center;flex-shrink:0;font-weight:800">경기${gi+1}</span>
          <div class="share-match-game-player share-match-game-player--a" style="flex:1;display:flex;align-items:center;justify-content:flex-end;gap:4px;min-width:0;${aW?'':'opacity:.6'}">
            ${winA}
            <span class="share-match-game-name" style="font-weight:${aW?'900':'600'};color:${aW?theme.text:theme.textDim};font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${g.playerA||'?'}</span>
            ${photoA}
          </div>
          <span class="share-match-game-vs" style="color:${theme.textDim};font-size:10px;flex-shrink:0;font-weight:900">vs</span>
          <div class="share-match-game-player share-match-game-player--b" style="flex:1;display:flex;align-items:center;gap:4px;min-width:0;${bW?'':'opacity:.6'}">
            ${photoB}
            <span class="share-match-game-name" style="font-weight:${bW?'900':'600'};color:${bW?theme.text:theme.textDim};font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${g.playerB||'?'}</span>
            ${winB}
          </div>
          ${g.map?`<span class="share-match-game-map" style="color:${theme.textDim};font-size:10px;flex-shrink:0;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📍${g.map}</span>`:''}
        </div>`;
      }).join('');
      const setBg=isAce?`${theme.accentDark}15`:variant.setBg;
      const setBorder=isAce?`${theme.accentDark}30`:variant.setBorder;
      return`<div style="background:${setBg};border:1px solid ${setBorder};border-radius:var(--r);padding:10px 12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:${gameList.length?'7':'0'}px">
          <span style="font-size:var(--fs-caption);font-weight:900;color:${isAce?theme.accentDark:theme.textDim};letter-spacing:.3px;min-width:60px;text-align:center">${sLabel}</span>
          <span style="font-weight:900;background:${sAW?ca:'transparent'};${sAW?'':'border:1px solid '+theme.divider};color:${sAW?'#fff':theme.textDim};padding:2px 10px;border-radius:6px;font-size:var(--fs-sm);text-align:center">${dispA}</span>
          <span style="font-weight:900;font-size:16px;letter-spacing:2px;min-width:48px;text-align:center">
            <span style="color:${sAW?ca:theme.textDim}">${swA}</span>
            <span style="color:${theme.textDim};font-size:var(--fs-sm);margin:0 4px">:</span>
            <span style="color:${sBW?cb:theme.textDim}">${swB}</span>
          </span>
          <span style="font-weight:900;background:${sBW?cb:'transparent'};${sBW?'':'border:1px solid '+theme.divider};color:${sBW?'#fff':theme.textDim};padding:2px 10px;border-radius:6px;font-size:var(--fs-sm);text-align:center">${dispB}</span>
          <span style="font-size:var(--fs-caption);color:${theme.textDim};white-space:nowrap;font-weight:800">${sAW?'▶ '+a:sBW?'▶ '+b:'무승부'}</span>
        </div>
        ${games}
      </div>`;
    }).join('');
  }

  // (요청사항) 공유카드 "이번 경기 개인 기록" 표시 옵션 — su_sc_show_tally 토글 시에만 사용
  function buildShareMatchPlayerTallyHTML(args){
    const { m, theme, getPlayerPhotoHTML } = args || {};
    if(!(m && m.sets && m.sets.length)) return '';
    const tally = {};
    m.sets.forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g || !g.playerA || !g.playerB || (g.teamA && g.teamA.length) || (g.teamB && g.teamB.length) || !g.winner) return;
        const nameA=g.playerA, nameB=g.playerB;
        if(!tally[nameA]) tally[nameA]={w:0,l:0};
        if(!tally[nameB]) tally[nameB]={w:0,l:0};
        if(g.winner==='A'){ tally[nameA].w++; tally[nameB].l++; }
        else if(g.winner==='B'){ tally[nameB].w++; tally[nameA].l++; }
      });
    });
    const entries=Object.entries(tally).filter(([,s])=>s.w+s.l>0);
    if(!entries.length) return '';
    entries.sort((a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l)||b[1].w-a[1].w);
    const chips=entries.map(([name,s])=>{
      const photo=getPlayerPhotoHTML?`<span style="display:inline-flex;flex-shrink:0">${getPlayerPhotoHTML(name,'18px','flex-shrink:0')}</span>`:'';
      return `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid ${theme.divider};font-size:11px;font-weight:800;white-space:nowrap">
        ${photo}<span style="color:${theme.text}">${name}</span>
        <span style="color:#16a34a">${s.w}승</span><span style="color:${theme.textDim}">·</span><span style="color:#dc2626">${s.l}패</span>
      </span>`;
    }).join('');
    return `<div class="share-match-tally" style="margin-top:10px;padding-top:10px;border-top:1px dashed ${theme.divider}">
      <div style="font-size:9px;font-weight:800;color:${theme.textDim};letter-spacing:.3px;margin-bottom:6px">🧑‍🤝‍🧑 이번 경기 개인 기록</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${chips}</div>
    </div>`;
  }

  function buildShareMatchSummaryHTML(args){
    const { variant, theme, winnerColor, summaryCards, setsHTML, teamMode } = args || {};
    return `<div class="share-match-summary-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:${setsHTML||teamMode?'12':'0'}px">
      ${(summaryCards||[]).map(it=>`<div style="padding:10px 10px 9px;border-radius:14px;background:rgba(255,255,255,.88);border:1px solid ${variant.setBorder};box-shadow:0 8px 22px rgba(15,23,42,.06)">
        <div style="font-size:9px;font-weight:800;color:${theme.textDim};letter-spacing:.3px;margin-bottom:4px">${it.label}</div>
        <div class="share-match-summary-value" style="font-size:var(--fs-sm);font-weight:900;color:${it.tone||winnerColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.value}</div>
      </div>`).join('')}
    </div>`;
  }

  window._buildShareMatchSetsHTML = buildShareMatchSetsHTML;
  window._buildShareMatchSummaryHTML = buildShareMatchSummaryHTML;
  window._buildShareMatchPlayerTallyHTML = buildShareMatchPlayerTallyHTML;
})();
