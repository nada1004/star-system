/* competition-rank.js: extracted from competition.js */
function rCompPlayerRank(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const pStats={};
  function countGames(m){
    if(m.sa==null)return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
        if(!pStats[wn])pStats[wn]={w:0,l:0};if(!pStats[ln])pStats[ln]={w:0,l:0};
        pStats[wn].w++;pStats[ln].l++;
      });
    });
  }
  (tn.groups||[]).forEach(grp=>{
    (grp.matches||[]).forEach(m=>countGames(m));
  });
  // 브라켓 경기 포함
  const br=getBracket(tn);
  Object.values(br.matchDetails||{}).forEach(m=>countGames(m));
  (br.manualMatches||[]).forEach(m=>{if(m)countGames(m);});
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['comp']||'rate';
  const sorted=Object.entries(pStats)
    .map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}))
    .filter(p=>p.total>0)
    .sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['comp']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['comp']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['comp']='l';render()">패순</button></div>`;
  if(!sorted.length) return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">⏳ 아직 기록된 경기 결과가 없습니다.</div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='comp_rank';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=sorted.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?sorted.slice(_cp*_PAGE,(_cp+1)*_PAGE):sorted;
  let h=sortBar+`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px">🏅 ${tn.name} 개인 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">이름</th><th style="text-align:left">소속</th><th>승</th><th>패</th><th>승차</th><th>승률</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const pObj=players.find(x=>x.name===p.name);const col=pObj?gc(pObj.univ):'#888';
    const diff=p.w-p.l;
    const _ri=_cp*_PAGE+i;
    h+=`<tr>
      <td style="text-align:left">${_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`${_ri+1}위`}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:7px">${typeof getPlayerPhotoHTML==='function'?getPlayerPhotoHTML(p.name,'34px'):''}<span class="clickable-name" style="font-weight:700;font-size:14px" onclick="openPlayerModal('${escJS(p.name)}')">${p.name}</span></span></td>
      <td style="text-align:left">${pObj?`<span class="ubadge" style="background:${col};font-size:11px">${pObj.univ}</span>`:'-'}</td>
      <td class="wt" style="font-weight:800">${p.w}</td><td class="lt" style="font-weight:800">${p.l}</td>
      <td style="font-weight:800;color:${diff>0?'var(--green)':diff<0?'var(--red)':'var(--gray-l)'}">${diff>=0?'+':''}${diff}</td>
      <td style="font-weight:700;color:${p.rate>=50?'var(--green)':'var(--red)'}">${p.total?p.rate+'%':'-'}</td>
    </tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

