/* ══════════════════════════════════════
   Match Builder CK
══════════════════════════════════════ */

function rCK(C,T){
  T.innerText='🤝 대학CK';
  if(!isLoggedIn && ckSub==='input') ckSub='records';
  const subOpts=(typeof applyTabLabels==='function')
    ? applyTabLabels('ck', [{id:'input',lbl:'📝 경기 입력',fn:`ckSub='input';render()`},{id:'records',lbl:'📋 기록',fn:`ckSub='records';openDetails={};render()`},{id:'rank',lbl:'🏅 순위',fn:`ckSub='rank';render()`}])
    : [{id:'input',lbl:'📝 경기 입력',fn:`ckSub='input';render()`},{id:'records',lbl:'📋 기록',fn:`ckSub='records';openDetails={};render()`},{id:'rank',lbl:'🏅 순위',fn:`ckSub='rank';render()`}];
  let h='';
  const extra = (ckSub!=='input' && typeof buildYearMonthFilterControls==='function')
    ? (buildYearMonthFilterControls('ck', true)
      + `<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`
      + `<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`)
    : '';
  h+=_buildMatchSubtabShell(ckSub, subOpts, '_ckFilterOpen', extra);
  if(ckSub==='input'&&isLoggedIn){
    if(!BLD['ck']){const saved=J('su_bld_ck')||{};BLD['ck']={date:'',membersA:saved.membersA||[],membersB:saved.membersB||[],sets:[]};}
    h+=buildCKInputHTML();
  }
  else if(ckSub==='rank'){h+=ckRankHTML();}
  else{h+=recSummaryListHTML(ckM,'ck','tab');}
  C.innerHTML=h;
}

function buildCKInputHTML(){
  const bld=BLD['ck'];const allU=getAllUnivs();
  const uO=`<option value="">대학 선택</option>`+allU.map(u=>`<option value="${u.name}">${u.name}</option>`).join('');
  const mA=bld.membersA||[];const mB=bld.membersB||[];
  const actionBar = _mbActionBar([
    `<button class="btn btn-p btn-sm mb-mini-btn" onclick="openCKPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button>`
  ], '');
  let h = _mbSectionCard('① 기본 정보', `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700;color:var(--blue)">날짜</label>
      <input type="date" value="${bld.date||''}" onchange="BLD['ck'].date=this.value">
    </div>`) + _mbSectionCard('② 스트리머 검색으로 빠른 팀 짜기', `
      <div style="position:relative;display:flex;gap:6px;align-items:center">
        <input type="text" id="ck-search-input" placeholder="스트리머/대학/별명 검색..." 
          style="flex:1;padding:8px 12px;border:1.5px solid var(--blue);border-radius:8px;font-size:13px"
          oninput="ckSearchPlayer()">
      </div>
      <div id="ck-search-results" style="display:none;margin-top:6px;background:var(--white);border:1px solid var(--border2);border-radius:8px;max-height:180px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,.1)"></div>
    `, '(이름·대학 검색 후 A팀/B팀 배정)') + _mbSectionCard('③ 팀 구성', `
    <div class="mb-split">
      <div class="ck-panel">
        <h4>🔵 팀 A 구성 (${mA.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <select id="ck-a-univ" style="flex:1" onchange="ckFilterPlayers('A')">${uO}</select>
          <select id="ck-a-player" style="flex:1"><option value="">대학 먼저 선택</option></select>
          <button class="btn btn-b btn-xs" onclick="ckAddMember('A')">+ 추가</button>
        </div>
        <div>${mA.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''}${m.race?'/'+m.race:''})</span><button onclick="BLD['ck'].membersA.splice(${i},1);BLD['ck'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">멤버를 추가하세요</span>'}</div>
      </div>
      <div class="ck-panel">
        <h4>🔴 팀 B 구성 (${mB.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <select id="ck-b-univ" style="flex:1" onchange="ckFilterPlayers('B')">${uO}</select>
          <select id="ck-b-player" style="flex:1"><option value="">대학 먼저 선택</option></select>
          <button class="btn btn-b btn-xs" onclick="ckAddMember('B')">+ 추가</button>
        </div>
        <div>${mB.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''}${m.race?'/'+m.race:''})</span><button onclick="BLD['ck'].membersB.splice(${i},1);BLD['ck'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">멤버를 추가하세요</span>'}</div>
      </div>
    </div>`) + _mbSectionCard('④ 경기 결과 입력', `${setBuilderHTML(bld,'ck')}`);
  return _mbFrame('🤝 대학CK 입력', actionBar, h, '');
}

function ckSearchPlayer(){
  const inp=document.getElementById('ck-search-input');
  const res=document.getElementById('ck-search-results');
  if(!inp||!res)return;
  const q0=inp.value.trim();
  const aliasName=_mbResolveAliasQuery(q0);
  const q=(aliasName||q0).toLowerCase();
  if(!q){res.style.display='none';res.innerHTML='';return;}
  const bld=BLD['ck']||{};
  let results=players.filter(p=>
    (p.name.toLowerCase().includes(q)||(p.univ||'').toLowerCase().includes(q)||(p.tier||'').toLowerCase().includes(q)||(p.race||'').toLowerCase().includes(q))
  ).slice(0,20);
  if(aliasName){
    const ap=players.find(p=>p.name===aliasName);
    if(ap){
      results=[ap, ...results.filter(x=>x.name!==ap.name)].slice(0,20);
    }
  }
  if(!results.length){res.innerHTML='<div style="padding:10px 12px;color:var(--gray-l);font-size:12px">검색 결과 없음</div>';res.style.display='block';return;}
  res.innerHTML=results.map(p=>{
    const col=gc(p.univ);
    const inA=(bld.membersA||[]).some(m=>m.name===p.name);
    const inB=(bld.membersB||[]).some(m=>m.name===p.name);
    const inTeam=inA||inB;
    const aliasTag = (aliasName && p.name===aliasName) ? `<span style="background:#ecfeff;color:#0e7490;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:800;margin-left:6px">별명: ${esc(q0)}</span>` : '';
    return `<div style="padding:8px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);${inTeam?'opacity:.5;':''}">
      <span style="width:28px;height:28px;border-radius:6px;background:${col};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${p.race||'?'}</span>
      <div style="flex:1;font-size:12px">
        <span style="font-weight:700">${p.name}</span>${aliasTag}
        <span style="color:var(--gray-l);font-size:11px;margin-left:4px">${p.univ} · ${p.tier||'-'} · ${p.race||'-'}</span>
        ${inA?'<span style="background:#dbeafe;color:#1d4ed8;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:700;margin-left:4px">A팀</span>':''}
        ${inB?'<span style="background:#fee2e2;color:#dc2626;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:700;margin-left:4px">B팀</span>':''}
      </div>
      ${!inTeam?`
      <button onclick="ckAddBySearch('A','${p.name}')" style="background:#2563eb;color:#fff;border:none;border-radius:5px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer">A팀</button>
      <button onclick="ckAddBySearch('B','${p.name}')" style="background:#dc2626;color:#fff;border:none;border-radius:5px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer">B팀</button>
      `:'<span style="font-size:11px;color:var(--gray-l)">배정됨</span>'}
    </div>`;
  }).join('');
  res.style.display='block';
}

function ckAddBySearch(team, name){
  if(!BLD['ck'])return;
  const arr=team==='A'?BLD['ck'].membersA:BLD['ck'].membersB;
  const other=team==='A'?BLD['ck'].membersB:BLD['ck'].membersA;
  if(arr.find(m=>m.name===name)||other.find(m=>m.name===name))return;
  const pObj=players.find(p=>p.name===name)||{};
  arr.push({name,univ:pObj.univ||'',race:pObj.race||'',tier:pObj.tier||''});
  BLD['ck'].sets=[];
  ckSearchPlayer();
  render();
}

function ckFilterPlayers(team){
  const univSel=document.getElementById(`ck-${team.toLowerCase()}-univ`);
  const playerSel=document.getElementById(`ck-${team.toLowerCase()}-player`);
  if(!univSel||!playerSel)return;
  const univ=univSel.value;
  const univMembers=univ?players.filter(p=>p.univ===univ):[];
  playerSel.innerHTML=univMembers.length?`<option value="">멤버 선택</option>`+univMembers.map(p=>`<option value="${p.name}">${p.name} [${p.tier||'-'}/${p.race||'-'}]</option>`).join(''):`<option value="">멤버 없음</option>`;
}

function ckAddMember(team){
  const univSel=document.getElementById(`ck-${team.toLowerCase()}-univ`);
  const playerSel=document.getElementById(`ck-${team.toLowerCase()}-player`);
  if(!univSel||!playerSel)return;
  const univ=univSel.value;const name=playerSel.value;
  if(!name)return alert('멤버를 선택하세요.');
  const arr=team==='A'?BLD['ck'].membersA:BLD['ck'].membersB;
  if(arr.find(m=>m.name===name))return alert('이미 추가됨');
  const pObj=players.find(p=>p.name===name)||{};
  arr.push({name,univ,race:pObj.race||'',tier:pObj.tier||''});BLD['ck'].sets=[];render();
}

function ckRankHTML(){
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['ck']||'rate';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['ck']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['ck']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['ck']='l';render()">패순</button></div>`;
  const _ckFiltered=typeof passDateFilter==='function'?ckM.filter(m=>passDateFilter(m.d||'')):ckM;
  const sc2={};
  getAllUnivs().forEach(u=>{sc2[u.name]={w:0,l:0,pts:0,total:0};});
  _ckFiltered.forEach(m=>{
    if(!sc2[m.a])sc2[m.a]={w:0,l:0,pts:0,total:0};if(!sc2[m.b])sc2[m.b]={w:0,l:0,pts:0,total:0};
    sc2[m.a].total++;sc2[m.b].total++;
    if(m.sa>m.sb){sc2[m.a].w++;sc2[m.a].pts+=3;sc2[m.b].l++;sc2[m.b].pts-=3;}
    else if(m.sb>m.sa){sc2[m.b].w++;sc2[m.b].pts+=3;sc2[m.a].l++;sc2[m.a].pts-=3;}
  });
  const sorted2=Object.entries(sc2).filter(([name,s])=>s.total>0&&name!=='무소속').sort((a,b)=>b[1].pts-a[1].pts||b[1].w-a[1].w);
  const delCol2=isLoggedIn?`<th class="no-export" style="width:36px"></th>`:'';
  let hUniv=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏆 대학CK 대학별 순위</div>`
  +`<table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">대학</th><th>승</th><th>패</th><th>포인트</th>${delCol2}</tr></thead><tbody>`;
  if(!sorted2.length)hUniv+=`<tr><td colspan="${isLoggedIn?6:5}" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  sorted2.forEach(([name,s],i)=>{
    const col=gc(name);let rnkH;
    if(i===0)rnkH=`<span class="rk1">1등</span>`;else if(i===1)rnkH=`<span class="rk2">2등</span>`;else if(i===2)rnkH=`<span class="rk3">3등</span>`;else rnkH=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    const sn=name.replace(/'/g,"\\'");
    const delBtn2=isLoggedIn?`<td class="no-export"><button onclick="deleteUnivFromRank('${sn}','ck')" style="padding:2px 6px;border-radius:4px;border:1px solid #fecaca;background:#fff5f5;color:#dc2626;font-size:11px;cursor:pointer" title="이 대학 CK 기록 삭제">🗑</button></td>`:'';
    hUniv+=`<tr><td style="text-align:left">${rnkH}</td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${sn}')">${name}</span></td><td class="wt" style="font-size:15px;font-weight:800">${s.w}</td><td class="lt" style="font-size:15px;font-weight:800">${s.l}</td><td class="${pC(s.pts)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">${pS(s.pts)}</td>${delBtn2}</tr>`;
  });
  hUniv+=`</tbody></table>`;
  const pS2={};
  _ckFiltered.forEach(m=>{
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        let wn,ln;
        if(g.wName&&g.lName){wn=g.wName;ln=g.lName;}
        else if(g.playerA&&g.playerB&&g.winner){wn=g.winner==='A'?g.playerA:g.playerB;ln=g.winner==='A'?g.playerB:g.playerA;}
        else return;
        if(!pS2[wn])pS2[wn]={w:0,l:0};
        if(!pS2[ln])pS2[ln]={w:0,l:0};
        pS2[wn].w++;pS2[ln].l++;
      });
    });
  });
  const pEntries=Object.entries(pS2).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}));
  pEntries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  let h=hUniv+`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏅 대학CK 개인 순위</div>${sortBar}`;
  if(!pEntries.length){h+=`<div style="padding:20px;text-align:center;color:var(--gray-l)">개인 기록 없음</div>`;return h;}
  if(!window._rankPage)window._rankPage={};
  const _PK_ck='ck_ind';
  const _PAGE_ck=20;
  if(window._rankPage[_PK_ck]===undefined)window._rankPage[_PK_ck]=0;
  const _tot_ck=pEntries.length;
  const _totP_ck=Math.ceil(_tot_ck/_PAGE_ck)||1;
  if(window._rankPage[_PK_ck]>=_totP_ck)window._rankPage[_PK_ck]=0;
  const _cp_ck=window._rankPage[_PK_ck];
  const _paged_ck=_tot_ck>_PAGE_ck?pEntries.slice(_cp_ck*_PAGE_ck,(_cp_ck+1)*_PAGE_ck):pEntries;
  h+=`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th style="text-align:left">대학</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
  _paged_ck.forEach((p,i)=>{
    const pObj=players.find(x=>x.name===p.name)||{};
    const col=gc(pObj.univ);
    const _ri=_cp_ck*_PAGE_ck+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')">${getPlayerPhotoHTML(p.name,'24px')}<span style="font-weight:700">${p.name}</span></span></td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col};font-size:10px" onclick="openUnivModal('${escJS(pObj.univ||'')}')">${pObj.univ||'-'}</span></td><td class="wt" style="font-weight:800">${p.w}</td><td class="lt" style="font-weight:800">${p.l}</td><td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td></tr>`;
  });
  const _pageNav_ck=_tot_ck>_PAGE_ck?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp_ck===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK_ck}']=${_cp_ck-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp_ck+1} / ${_totP_ck} (${_tot_ck}명)</span>
  <button class="btn btn-sm" ${_cp_ck>=_totP_ck-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK_ck}']=${_cp_ck+1};render()">다음 →</button>
</div>`:'';
  h+=`</tbody></table>`+_pageNav_ck;
  return h;
}
