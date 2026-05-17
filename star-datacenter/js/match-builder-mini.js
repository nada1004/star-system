/* ══════════════════════════════════════
   Match Builder Mini
══════════════════════════════════════ */

function rMini(C,T){
  T.innerText = miniType==='civil' ? '⚔️ 시빌워' : '⚡ 미니대전';
  if(!isLoggedIn && miniSub==='input') miniSub='records';
  const subOpts = miniType==='civil'
    ? [{id:'input',lbl:'📝 경기 입력',fn:`miniSub='input';render()`},{id:'rank',lbl:'🏆 순위',fn:`miniSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`miniSub='records';openDetails={};render()`}]
    : [{id:'input',lbl:'📝 경기 입력',fn:`miniSub='input';render()`},{id:'rank',lbl:'🏆 순위',fn:`miniSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`miniSub='records';openDetails={};render()`}];
  const _miniCtx = miniType==='civil' ? 'mini' : 'mini';
  const _miniSubOpts = (typeof applyTabLabels==='function') ? applyTabLabels(_miniCtx, subOpts) : subOpts;
  let h='';
  const extra = (miniSub!=='input' && typeof buildYearMonthFilterControls==='function')
    ? (buildYearMonthFilterControls('mini', true)
      + `<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`
      + `<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`)
    : '';
  h+=_buildMatchSubtabShell(miniSub, _miniSubOpts, '_miniFilterOpen', extra);
  const label = miniType==='civil' ? '⚔️ 시빌워' : '⚡ 미니대전';
  const _miniTypeFilter = m=>(m.type||'mini')===miniType;
  const filteredMini = miniM.filter(_miniTypeFilter);
  if(miniSub==='input'&&isLoggedIn){
    if(!BLD['mini'])BLD['mini']={date:'',title:'',teamA:'',teamB:'',sets:[]};
    h+=`<div class="match-builder"><h3>${label} 입력</h3><div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openMiniPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button></div>${setBuilderHTML(BLD['mini'],'mini')}</div>`;
  } else if(miniSub==='rank'){
    h+=miniRankHTML(filteredMini);
  } else {
    h+=recSummaryListHTML(miniM,'mini','tab',_miniTypeFilter);
  }
  C.innerHTML=h;
}

function miniRankHTML(data){
  data=data||miniM.filter(m=>(m.type||'mini')==='mini');
  if(typeof passDateFilter==='function')data=data.filter(m=>passDateFilter(m.d||''));
  const sc={};
  getAllUnivs().forEach(u=>{sc[u.name]={w:0,l:0,pts:0,total:0};});
  data.forEach(m=>{
    if(!sc[m.a])sc[m.a]={w:0,l:0,pts:0,total:0};if(!sc[m.b])sc[m.b]={w:0,l:0,pts:0,total:0};
    sc[m.a].total++;sc[m.b].total++;
    if(m.sa>m.sb){sc[m.a].w++;sc[m.a].pts+=3;sc[m.b].l++;sc[m.b].pts-=3;}
    else if(m.sb>m.sa){sc[m.b].w++;sc[m.b].pts+=3;sc[m.a].l++;sc[m.a].pts-=3;}
  });
  const sorted=Object.entries(sc).filter(([,s])=>s.total>0).sort((a,b)=>b[1].pts-a[1].pts);
  const rankTitle = miniType==='civil'?'⚔️ 시빌워 팀별 순위':'🏆 미니대전 대학별 순위';
  const delCol=isLoggedIn?`<th class="no-export" style="width:36px"></th>`:'';
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">${rankTitle}</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">대학</th><th>승</th><th>패</th><th>포인트</th>${delCol}</tr></thead><tbody>`;
  if(!sorted.length)h+=`<tr><td colspan="${isLoggedIn?6:5}" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  sorted.forEach(([name,s],i)=>{
    const col=gc(name);let rnkHTML;
    if(i===0) rnkHTML=`<span class="rk1">1등</span>`;else if(i===1) rnkHTML=`<span class="rk2">2등</span>`;else if(i===2) rnkHTML=`<span class="rk3">3등</span>`;else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    const sn=name.replace(/'/g,"\\'");
    const delBtn=isLoggedIn?`<td class="no-export"><button onclick="deleteUnivFromRank('${sn}','mini')" style="padding:2px 6px;border-radius:4px;border:1px solid #fecaca;background:#fff5f5;color:#dc2626;font-size:11px;cursor:pointer" title="이 대학 미니대전 기록 삭제">🗑</button></td>`:'';
    h+=`<tr><td style="text-align:left">${rnkHTML}</td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${sn}')">${name}</span></td><td class="wt" style="font-size:15px;font-weight:800">${s.w}</td><td class="lt" style="font-size:15px;font-weight:800">${s.l}</td><td class="${pC(s.pts)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">${pS(s.pts)}</td>${delBtn}</tr>`;
  });
  h+=`</tbody></table>`;
  if(!window._rankSort)window._rankSort={};
  const msk=window._rankSort['mini']||'rate';
  const msortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${msk==='rate'?'on':''}" onclick="window._rankSort['mini']='rate';render()">승률순</button><button class="sort-btn ${msk==='w'?'on':''}" onclick="window._rankSort['mini']='w';render()">승순</button><button class="sort-btn ${msk==='l'?'on':''}" onclick="window._rankSort['mini']='l';render()">패순</button></div>`;
  const psc={};
  data.forEach(m=>{
    (m.sets||[]).forEach(st=>{
      (st.games||[]).forEach(g=>{
        let wn,ln;
        if(g.wName&&g.lName){wn=g.wName;ln=g.lName;}
        else if(g.playerA&&g.playerB&&g.winner){wn=g.winner==='A'?g.playerA:g.playerB;ln=g.winner==='A'?g.playerB:g.playerA;}
        else return;
        if(!psc[wn])psc[wn]={w:0,l:0,univ:''};
        if(!psc[ln])psc[ln]={w:0,l:0,univ:''};
        psc[wn].w++;psc[ln].l++;
        if(!psc[wn].univ){const p=players.find(x=>x.name===wn);if(p)psc[wn].univ=p.univ||'';}
        if(!psc[ln].univ){const p=players.find(x=>x.name===ln);if(p)psc[ln].univ=p.univ||'';}
      });
    });
  });
  const pEntries=Object.entries(psc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,univ:s.univ}));
  pEntries.sort((a,b)=>msk==='w'?b.w-a.w||b.rate-a.rate:msk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:var(--blue);margin:18px 0 8px;padding-bottom:5px;border-bottom:2px solid var(--blue-ll)">🏅 개인 순위</div>${msortBar}`;
  if(!pEntries.length){h+=`<div style="padding:20px;text-align:center;color:var(--gray-l)">개인 기록 없음</div>`;return h;}
  if(!window._rankPage)window._rankPage={};
  const _PK_mini='mini_ind';
  const _PAGE_mini=20;
  if(window._rankPage[_PK_mini]===undefined)window._rankPage[_PK_mini]=0;
  const _tot_mini=pEntries.length;
  const _totP_mini=Math.ceil(_tot_mini/_PAGE_mini)||1;
  if(window._rankPage[_PK_mini]>=_totP_mini)window._rankPage[_PK_mini]=0;
  const _cp_mini=window._rankPage[_PK_mini];
  const _paged_mini=_tot_mini>_PAGE_mini?pEntries.slice(_cp_mini*_PAGE_mini,(_cp_mini+1)*_PAGE_mini):pEntries;
  h+=`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>게임 승</th><th>게임 패</th><th>승률</th></tr></thead><tbody>`;
  _paged_mini.forEach((p,i)=>{
    const col=gc(p.univ);
    const _ri=_cp_mini*_PAGE_mini+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:5px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')">${getPlayerPhotoHTML(p.name,'22px')}<span style="font-weight:700">${p.name}</span>${p.univ?`<span class="ubadge" style="background:${col};font-size:9px">${p.univ}</span>`:''}</span></td><td class="wt">${p.w}</td><td class="lt">${p.l}</td><td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td></tr>`;
  });
  h+=`</tbody></table>`;
  const _pageNav_mini=_tot_mini>_PAGE_mini?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp_mini===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK_mini}']=${_cp_mini-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp_mini+1} / ${_totP_mini} (${_tot_mini}명)</span>
  <button class="btn btn-sm" ${_cp_mini>=_totP_mini-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK_mini}']=${_cp_mini+1};render()">다음 →</button>
</div>`:'';
  h+=_pageNav_mini;
  return h;
}
