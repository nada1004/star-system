/* ══════════════════════════════════════
   Match Builder Ranks
══════════════════════════════════════ */

function indRankHTML(){
  const sc={};const vs={};
  players.forEach(p=>{sc[p.name]={w:0,l:0};});
  const _indFiltered=typeof passDateFilter==='function'?indM.filter(m=>passDateFilter(m.d||'')):indM;
  _indFiltered.forEach(m=>{
    if(!sc[m.wName])sc[m.wName]={w:0,l:0};
    if(!sc[m.lName])sc[m.lName]={w:0,l:0};
    sc[m.wName].w++; sc[m.lName].l++;
    if(!vs[m.wName])vs[m.wName]={};
    if(!vs[m.wName][m.lName])vs[m.wName][m.lName]={w:0,l:0};
    vs[m.wName][m.lName].w++;
    if(!vs[m.lName])vs[m.lName]={};
    if(!vs[m.lName][m.wName])vs[m.lName][m.wName]={w:0,l:0};
    vs[m.lName][m.wName].l++;
  });
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['ind']||'w';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['ind']='w';render()">승순</button><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['ind']='rate';render()">승률순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['ind']='l';render()">패순</button></div>`;
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return sortBar+`<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='ind';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=entries.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?entries.slice(_cp*_PAGE,(_cp+1)*_PAGE):entries;
  let h=sortBar+`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>승</th><th>패</th><th>승률</th><th style="text-align:left">상대 전적</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const pl=players.find(x=>x.name===p.name);
    const vsEntries=Object.entries(vs[p.name]||{}).sort((a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l));
    const mkVsSpan=([opp,r])=>{
      const col=r.w>r.l?'#16a34a':r.l>r.w?'#dc2626':'#6b7280';
      return `<span style="display:inline-flex;align-items:center;gap:3px;margin:1px 3px 1px 0;font-size:var(--fs-caption)">${getPlayerPhotoHTML(opp,'18px')}<span style="cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${escJS(opp)}')">${opp}</span><span style="font-weight:700;color:${col}">${r.w}승${r.l}패</span></span>`;
    };
    const vsTop=vsEntries.slice(0,3).map(mkVsSpan).join('');
    const vsRest=vsEntries.slice(3);
    const uid=`indvs_${_cp}_${i}`;
    const vsHTML=!vsEntries.length?''
      : vsRest.length===0 ? vsTop
      : vsTop
        +`<span id="${uid}_m" style="display:none">${vsRest.map(mkVsSpan).join('')}</span>`
        +`<button id="${uid}_b" onclick="var m=document.getElementById('${uid}_m'),b=document.getElementById('${uid}_b');if(m.style.display==='none'){m.style.display='inline';b.textContent='접기'}else{m.style.display='none';b.textContent='+${vsRest.length}명 더보기'}" style="font-size:10px;color:var(--blue);background:none;border:1px solid var(--blue-ll);border-radius:8px;padding:1px 7px;cursor:pointer;margin-left:2px;white-space:nowrap">+${vsRest.length}명 더보기</button>`;
    const _ri=_cp*_PAGE+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr>
      <td>${rnk}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')">${getPlayerPhotoHTML(p.name,'34px')}<span style="font-weight:700;font-size:14px">${p.name}</span><span style="font-size:var(--fs-caption);color:var(--gray-l)">${pl?.univ||''}</span></span></td>
      <td class="wt">${p.w}</td><td class="lt">${p.l}</td>
      <td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td>
      <td style="text-align:left;min-width:120px">${vsHTML||'<span style="color:var(--gray-l);font-size:var(--fs-caption)">—</span>'}</td>
    </tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:var(--fs-sm);color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function gjRankHTML(proOnly){
  const sc={};
  const vs={};
  const _gjSrc=proOnly?gjM.filter(m=>m._proLabel):gjM.filter(m=>!m._proLabel);
  _gjSrc.forEach(m=>{
    if(!sc[m.wName])sc[m.wName]={w:0,l:0};
    if(!sc[m.lName])sc[m.lName]={w:0,l:0};
    sc[m.wName].w++; sc[m.lName].l++;
    if(!vs[m.wName])vs[m.wName]={};
    if(!vs[m.wName][m.lName])vs[m.wName][m.lName]={w:0,l:0};
    vs[m.wName][m.lName].w++;
    if(!vs[m.lName])vs[m.lName]={};
    if(!vs[m.lName][m.wName])vs[m.lName][m.wName]={w:0,l:0};
    vs[m.lName][m.wName].l++;
  });
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['gj']||'w';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['gj']='w';render()">승순</button><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['gj']='rate';render()">승률순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['gj']='l';render()">패순</button></div>`;
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return sortBar+`<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='gj';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=entries.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?entries.slice(_cp*_PAGE,(_cp+1)*_PAGE):entries;
  if(!window._gjVsOpen) window._gjVsOpen={};
  let h=sortBar+`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>승</th><th>패</th><th>승률</th><th style="text-align:left">상대 전적</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const pl=players.find(x=>x.name===p.name);
    const vsEntries=Object.entries(vs[p.name]||{}).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)||(b[1].w-b[1].l)-(a[1].w-a[1].l));
    const mkVsSpan=([opp,r])=>{
      const col=r.w>r.l?'#16a34a':r.l>r.w?'#dc2626':'#6b7280';
      return `<span style="display:inline-flex;align-items:center;gap:3px;margin:1px 3px 1px 0;font-size:var(--fs-caption);white-space:nowrap">${getPlayerPhotoHTML(opp,'18px')}<span style="cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${escJS(opp)}')">${opp}</span><span style="font-weight:700;color:${col}">${r.w}승${r.l}패</span></span>`;
    };
    const isOpen=!!window._gjVsOpen[p.name];
    const top3HTML=vsEntries.slice(0,3).map(mkVsSpan).join('');
    const rest=vsEntries.slice(3);
    const moreBtn=rest.length?`<span style="display:${isOpen?'inline':'none'}">${rest.map(mkVsSpan).join('')}</span><button onclick="event.stopPropagation();window._gjVsOpen['${escJS(p.name)}'] =!window._gjVsOpen['${escJS(p.name)}'];render()" style="font-size:10px;padding:1px 7px;border-radius:var(--r);border:1px solid var(--border2);background:var(--surface);cursor:pointer;color:var(--blue);margin-left:3px;white-space:nowrap">${isOpen?'▲ 접기':'▼ +'+rest.length+'명'}</button>`:'';
    const vsHTML=(top3HTML||moreBtn)?top3HTML+moreBtn:'<span style="color:var(--gray-l);font-size:var(--fs-caption)">—</span>';
    const _ri=_cp*_PAGE+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr>
      <td>${rnk}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(p.name,'34px')}<span style="font-weight:700;font-size:14px">${p.name}</span><span style="font-size:var(--fs-caption);color:var(--gray-l)">${pl?.univ||''}</span></span></td>
      <td class="wt">${p.w}</td><td class="lt">${p.l}</td>
      <td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td>
      <td style="text-align:left;max-width:260px">${vsHTML}</td>
    </tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:var(--fs-sm);color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}
