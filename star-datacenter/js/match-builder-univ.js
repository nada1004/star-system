/* ══════════════════════════════════════
   Match Builder Univ Match
══════════════════════════════════════ */

function rUnivM(C,T){
  T.innerText='🏟️ 대학대전';
  if(typeof players==='undefined' || !Array.isArray(players)){
    C.innerHTML=`<div style="padding:40px 20px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
    return;
  }
  if(typeof univM==='undefined' || !Array.isArray(univM)) window.univM = [];
  if(typeof univmSub==='undefined') window.univmSub = 'records';
  if(typeof recSortDir==='undefined') window.recSortDir = 'desc';
  if(!window.BLD) window.BLD = {};
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li && univmSub==='input') univmSub='records';
  const subOpts=(typeof applyTabLabels==='function')
    ? applyTabLabels('univm', [{id:'input',lbl:'📝 경기 입력',fn:`univmSub='input';render()`},{id:'rank',lbl:'🏆 순위',fn:`univmSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`univmSub='records';openDetails={};render()`}])
    : [{id:'input',lbl:'📝 경기 입력',fn:`univmSub='input';render()`},{id:'rank',lbl:'🏆 순위',fn:`univmSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`univmSub='records';openDetails={};render()`}];
  let h='';
  const extra = (univmSub!=='input' && typeof buildYearMonthFilterControls==='function')
    ? (buildYearMonthFilterControls('univm', true))
    : '';
  h+=_buildMatchSubtabShell(univmSub, subOpts, '_univmFilterOpen', extra, 'univm');
  if(univmSub==='input'&&_li){
    if(!BLD['univm'])BLD['univm']={date:'',note:'',teamA:'',teamB:'',sets:[]};
    h+=_mbFrame('🏟️ 대학대전 입력', _mbActionBar([`<button class="btn btn-p btn-sm mb-mini-btn" onclick="openUnivmPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button>`], ''), _mbSectionCard('대학대전 입력', `${setBuilderHTML(BLD['univm'],'univm')}`), '');
  }
  else if(univmSub==='rank'){h+=univMRankHTML();}
  else{h+=recSummaryListHTML(univM,'univm','tab');}
  C.innerHTML=h;
}

function univMRankHTML(){
  if(typeof players==='undefined' || !Array.isArray(players)) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
  if(typeof getAllUnivs!=='function') return `<div style="padding:30px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
  const _univM = (typeof univM!=='undefined' && Array.isArray(univM)) ? univM : [];
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const sc={};
  getAllUnivs().forEach(u=>{sc[u.name]={w:0,l:0,pts:0,total:0};});
  const _univFiltered=typeof passDateFilter==='function'?_univM.filter(m=>passDateFilter(m.d||'')):_univM;
  _univFiltered.forEach(m=>{
    if(!sc[m.a])sc[m.a]={w:0,l:0,pts:0,total:0};if(!sc[m.b])sc[m.b]={w:0,l:0,pts:0,total:0};
    sc[m.a].total++;sc[m.b].total++;
    if(m.sa>m.sb){sc[m.a].w++;sc[m.a].pts+=3;sc[m.b].l++;sc[m.b].pts-=3;}
    else if(m.sb>m.sa){sc[m.b].w++;sc[m.b].pts+=3;sc[m.a].l++;sc[m.a].pts-=3;}
  });
  const sorted=Object.entries(sc).filter(([name,s])=>s.total>0&&name!=='무소속').sort((a,b)=>b[1].pts-a[1].pts||b[1].w-a[1].w);
  const delCol=_li?`<th class="no-export" style="width:36px"></th>`:'';
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏆 대학대전 대학별 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">대학</th><th>승</th><th>패</th><th>포인트</th>${delCol}</tr></thead><tbody>`;
  if(!sorted.length)h+=`<tr><td colspan="${_li?6:5}" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  sorted.forEach(([name,s],i)=>{
    const col=gc(name);let rnkHTML;
    if(i===0) rnkHTML=`<span class="rk1">1등</span>`;else if(i===1) rnkHTML=`<span class="rk2">2등</span>`;else if(i===2) rnkHTML=`<span class="rk3">3등</span>`;else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base)">${i+1}위</span>`;
    const sn=(typeof escJS==='function') ? escJS(name) : String(name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    const delBtn=_li?`<td class="no-export"><button onclick="deleteUnivFromRank('${sn}','univm')" style="padding:2px 6px;border-radius:4px;border:1px solid #fecaca;background:#fff5f5;color:#dc2626;font-size:var(--fs-caption);cursor:pointer" title="이 대학 대학대전 기록 삭제">🗑</button></td>`:'';
    h+=`<tr><td style="text-align:left">${rnkHTML}</td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${sn}')">${name}</span></td><td class="wt" style="font-size:var(--fs-md);font-weight:800">${s.w}</td><td class="lt" style="font-size:var(--fs-md);font-weight:800">${s.l}</td><td class="${pC(s.pts)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">${pS(s.pts)}</td>${delBtn}</tr>`;
  });
  h+=`</tbody></table>`;
  if(!window._rankSort)window._rankSort={};
  const usk=window._rankSort['univm']||'w';
  const usortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${usk==='w'?'on':''}" onclick="window._rankSort['univm']='w';render()">승순</button><button class="sort-btn ${usk==='rate'?'on':''}" onclick="window._rankSort['univm']='rate';render()">승률순</button><button class="sort-btn ${usk==='l'?'on':''}" onclick="window._rankSort['univm']='l';render()">패순</button></div>`;
  const upsc={};
  const _univSplit=(v)=>String(v||'').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
  const _univSides=(g)=>{
    if(g.wName&&g.lName) return {w:[g.wName], l:[g.lName]};
    if(!g.winner) return null;
    const aList=Array.isArray(g.teamA)?g.teamA:(g.a1||g.a2?[g.a1,g.a2].filter(Boolean):_univSplit(g.playerA));
    const bList=Array.isArray(g.teamB)?g.teamB:(g.b1||g.b2?[g.b1,g.b2].filter(Boolean):_univSplit(g.playerB));
    if(!aList.length||!bList.length) return null;
    return g.winner==='A' ? {w:aList,l:bList} : {w:bList,l:aList};
  };
  _univFiltered.forEach(m=>{
    (m.sets||[]).forEach(st=>{
      (st.games||[]).forEach(g=>{
        const sides=_univSides(g);
        if(!sides) return;
        sides.w.forEach(wn=>{
          if(!upsc[wn])upsc[wn]={w:0,l:0,univ:''};
          upsc[wn].w++;
          if(!upsc[wn].univ){const p=players.find(x=>x.name===wn);if(p)upsc[wn].univ=p.univ||'';}
        });
        sides.l.forEach(ln=>{
          if(!upsc[ln])upsc[ln]={w:0,l:0,univ:''};
          upsc[ln].l++;
          if(!upsc[ln].univ){const p=players.find(x=>x.name===ln);if(p)upsc[ln].univ=p.univ||'';}
        });
      });
    });
  });
  const upEntries=Object.entries(upsc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,univ:s.univ}));
  upEntries.sort((a,b)=>usk==='w'?b.w-a.w||b.rate-a.rate:usk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue);margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏅 대학대전 개인 순위</div>${usortBar}`;
  if(!upEntries.length){h+=`<div style="padding:20px;text-align:center;color:var(--gray-l)">개인 기록 없음</div>`;return h;}
  if(!window._rankPage)window._rankPage={};
  const _PK_um='univm_ind';
  const _PAGE_um=20;
  if(window._rankPage[_PK_um]===undefined)window._rankPage[_PK_um]=0;
  const _tot_um=upEntries.length;
  const _totP_um=Math.ceil(_tot_um/_PAGE_um)||1;
  if(window._rankPage[_PK_um]>=_totP_um)window._rankPage[_PK_um]=0;
  const _cp_um=window._rankPage[_PK_um];
  const _paged_um=_tot_um>_PAGE_um?upEntries.slice(_cp_um*_PAGE_um,(_cp_um+1)*_PAGE_um):upEntries;
  h+=`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th style="text-align:left">대학</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
  _paged_um.forEach((p,i)=>{
    const col=gc(p.univ);
    const _ri=_cp_um*_PAGE_um+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:5px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')">${getPlayerPhotoHTML(p.name,'22px')}<span style="font-weight:700">${p.name}</span></span></td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col};font-size:10px" onclick="openUnivModal('${escJS(p.univ||'')}')">${p.univ||'-'}</span></td><td class="wt" style="font-weight:800">${p.w}</td><td class="lt" style="font-weight:800">${p.l}</td><td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td></tr>`;
  });
  const _pageNav_um=_tot_um>_PAGE_um?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp_um===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK_um}']=${_cp_um-1};render()">← 이전</button>
  <span style="font-size:var(--fs-sm);color:var(--gray-l)">${_cp_um+1} / ${_totP_um} (${_tot_um}명)</span>
  <button class="btn btn-sm" ${_cp_um>=_totP_um-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK_um}']=${_cp_um+1};render()">다음 →</button>
</div>`:'';
  h+=`</tbody></table>`+_pageNav_um;
  return h;
}
