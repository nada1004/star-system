(function(){
  function statsMapRankHTML(){
    const currentMap = String(window._mapRankSelMap||'');
    const histMaps=[...new Set((window.players||[]).flatMap(p=>(p.history||[]).map(h=>h.map).filter(m=>m&&m!=='-')))];
    const configMaps=((window.maps)||[]).filter(m=>m&&m!=='-');
    const allMaps=[...new Set([...histMaps,...configMaps])].sort();
    if(!allMaps.length) return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">맵 기록이 없습니다.<br><span style="font-size:var(--fs-caption)">설정에서 맵을 등록하거나 경기 기록에 맵 정보를 입력해 주세요.</span></p></div>`;
    if(!window._mapRankSelMap||!allMaps.includes(window._mapRankSelMap)) window._mapRankSelMap=allMaps[0];

    const mapData={};
    allMaps.forEach(m=>mapData[m]={});
    const countedMatchIds=new Set();
    (window.players||[]).forEach(p=>{
      window.statsNonProHist(p).forEach(h=>{
        if(!h.map||h.map==='-') return;
        if(!mapData[h.map]) mapData[h.map]={};
        if(!mapData[h.map][p.name]) mapData[h.map][p.name]={w:0,l:0,univ:p.univ,tier:p.tier};
        if(h.result==='승') mapData[h.map][p.name].w++;
        else mapData[h.map][p.name].l++;
        if(h.matchId) countedMatchIds.add(h.matchId+'_'+p.name);
      });
    });

    const tourMatchSets=[];
    (window.tourneys||[]).forEach(tn=>(tn.groups||[]).forEach(grp=>(grp.matches||[]).forEach(m=>tourMatchSets.push(m))));
    const allMatchSets=window.statsFilterMatches([...(window.miniM||[]),...(window.univM||[]),...(window.ckM||[]),...(window.comps||[]),...(window.proM||[]),...tourMatchSets]);
    allMatchSets.forEach(m=>{
      (m.sets||[]).forEach((set,si)=>{
        const setMap=set.map||(m.maps&&m.maps[si])||m.map||'';
        (set.games||[]).forEach(g=>{
          const mapName=g.map||setMap||'';
          if(!mapName||mapName==='-') return;
          const wn=g.winner==='A'?g.playerA:g.playerB;
          const ln=g.winner==='A'?g.playerB:g.playerA;
          const wmKey=g.matchId&&wn?g.matchId+'_'+wn:'';
          const lmKey=g.matchId&&ln?g.matchId+'_'+ln:'';
          if(!mapData[mapName]) mapData[mapName]={};
          if(wn&&!countedMatchIds.has(wmKey)){
            const p=window.statsP(wn);
            if(!mapData[mapName][wn])mapData[mapName][wn]={w:0,l:0,univ:p?.univ||'',tier:p?.tier||''};
            mapData[mapName][wn].w++;
          }
          if(ln&&!countedMatchIds.has(lmKey)){
            const p=window.statsP(ln);
            if(!mapData[mapName][ln])mapData[mapName][ln]={w:0,l:0,univ:p?.univ||'',tier:p?.tier||''};
            mapData[mapName][ln].l++;
          }
        });
      });
    });

    const mapSummary=allMaps.map(m=>{
      const entries=Object.values(mapData[m]||{});
      const rawTotal=entries.reduce((s,v)=>s+v.w+v.l,0);
      const total=Math.round(rawTotal/2);
      return{name:m,games:total,players:Object.keys(mapData[m]||{}).length};
    }).sort((a,b)=>b.games-a.games||a.name.localeCompare(b.name,'ko'));

    const selData=Object.entries(mapData[window._mapRankSelMap]||{})
      .map(([name,s])=>({name,w:s.w,l:s.l,univ:s.univ,tier:s.tier,tot:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}))
      .filter(p=>p.tot>=2)
      .sort((a,b)=>b.rate-a.rate||b.tot-a.tot);

    return`<div style="display:flex;flex-direction:column;gap:14px">
    <div class="ssec">
      <h4 style="margin-bottom:12px">🗺️ 맵별 경기 수 <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:400">클릭하여 선택</span></h4>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${mapSummary.map(m=>`
          <button onclick="window._mapRankSelMap='${m.name.replace(/'/g,"\\'")}';render()"
            style="padding:6px 14px;border-radius:8px;border:2px solid ${window._mapRankSelMap===m.name?'var(--blue)':'var(--border2)'};background:${window._mapRankSelMap===m.name?'var(--blue-l)':'var(--white)'};font-size:var(--fs-sm);font-weight:${window._mapRankSelMap===m.name?'700':'500'};color:${window._mapRankSelMap===m.name?'var(--blue)':'var(--text3)'};cursor:pointer;transition:.12s">
            ${m.name} <span style="font-size:10px;opacity:.6">${m.games}게임</span>
          </button>`).join('')}
      </div>
    </div>
    <div class="ssec" id="stats-maprank-sec">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <h4 style="margin:0">🏆 <span style="color:var(--blue)">${window._mapRankSelMap}</span> 맵 강자 <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:400">(2경기 이상)</span></h4>
      </div>
      ${selData.length===0?'<p style="color:var(--gray-l)">해당 맵 기록이 없습니다.</p>':`
      <div style="overflow-x:auto"><table>
        <thead><tr><th>순위</th><th>선수</th><th>대학</th><th>티어</th><th>승</th><th>패</th><th>승률</th><th>경기수</th></tr></thead><tbody>
          ${selData.map((p,i)=>`<tr style="cursor:pointer" onclick="openPlayerModal('${window.escJS(p.name)}')">
            <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
            <td style="font-weight:700;color:var(--blue)">${p.name}</td>
            <td><span class="ubadge" style="background:${window.gc(p.univ)}">${p.univ}</span></td>
            <td style="font-size:var(--fs-caption)">${p.tier||'-'}</td>
            <td class="wt">${p.w}</td><td class="lt">${p.l}</td>
            <td style="font-weight:800;color:${p.rate>=50?'var(--red)':'var(--text3)'}">
              ${p.rate}%
              <div style="width:48px;height:4px;background:var(--border2);border-radius:2px;display:inline-block;margin-left:4px;vertical-align:middle;overflow:hidden">
                <div style="width:${p.rate}%;height:100%;background:${p.rate>=50?'var(--red)':'var(--text3)'};border-radius:2px"></div>
              </div>
            </td>
            <td>${p.tot}</td>
          </tr>`).join('')}
        </tbody></table></div>`}
    </div></div>`;
  }

  window.statsMapRankHTML = statsMapRankHTML;
})();
