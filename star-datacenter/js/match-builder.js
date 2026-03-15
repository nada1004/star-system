/* ══════════════════════════════════════
   미니대전
══════════════════════════════════════ */
function rMini(C,T){
  T.innerText = miniType==='civil' ? '⚔️ 시빌워' : '⚡ 미니대전';
  if(!isLoggedIn && miniSub==='input') miniSub='records';
  // 타입 토글
  const typeToggle=`<div style="display:flex;gap:6px;margin-bottom:10px">
    <button class="btn btn-sm ${miniType==='mini'?'btn-b':'btn-w'}" onclick="miniType='mini';miniSub='records';render()">⚡ 미니대전</button>
    <button class="btn btn-sm ${miniType==='civil'?'btn-b':'btn-w'}" onclick="miniType='civil';miniSub='records';render()">⚔️ 시빌워</button>
  </div>`;
  if(miniType==='civil' && miniSub==='rank') miniSub='records';
  const subOpts = miniType==='civil'
    ? [{id:'input',lbl:'📝 경기 입력',fn:`miniSub='input';render()`},{id:'records',lbl:'📋 기록',fn:`miniSub='records';openDetails={};render()`}]
    : [{id:'input',lbl:'📝 경기 입력',fn:`miniSub='input';render()`},{id:'rank',lbl:'🏆 순위',fn:`miniSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`miniSub='records';openDetails={};render()`}];
  let h=typeToggle+stabs(miniSub,subOpts);
  if(miniSub!=='input' && typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('mini');
  }
  const label = miniType==='civil' ? '⚔️ 시빌워' : '⚡ 미니대전';
  const _miniTypeFilter = m=>(m.type||'mini')===miniType;
  const filteredMini = miniM.filter(_miniTypeFilter);
  if(miniSub==='input'&&isLoggedIn){
    if(!BLD['mini'])BLD['mini']={date:'',title:'',teamA:'',teamB:'',sets:[]};
    h+=`<div class="match-builder"><h3>${label} 입력</h3><div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openMiniPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 결과 붙여넣기 일괄 입력</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">텍스트/이미지 OCR 지원</span></div>${setBuilderHTML(BLD['mini'],'mini')}</div>`;
  } else if(miniSub==='rank'){
    h+=miniRankHTML(filteredMini);
  } else {
    // miniM 전체(원본 인덱스 보존) + extraFilter로 타입 분리 → 공유카드 인덱스 오류 방지
    h+=recSummaryListHTML(miniM,'mini','tab',_miniTypeFilter);
  }
  C.innerHTML=h;
}

function miniRankHTML(data){
  data=data||miniM.filter(m=>(m.type||'mini')==='mini');
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
  // 개인 기여도 (sets.games 집계)
  const psc={};
  data.forEach(m=>{
    (m.sets||[]).forEach(st=>{
      (st.games||[]).forEach(g=>{
        if(!g.wName||!g.lName)return;
        if(!psc[g.wName])psc[g.wName]={w:0,l:0,univ:''};
        if(!psc[g.lName])psc[g.lName]={w:0,l:0,univ:''};
        psc[g.wName].w++;psc[g.lName].l++;
        if(!psc[g.wName].univ){const p=players.find(x=>x.name===g.wName);if(p)psc[g.wName].univ=p.univ||'';}
        if(!psc[g.lName].univ){const p=players.find(x=>x.name===g.lName);if(p)psc[g.lName].univ=p.univ||'';}
      });
    });
  });
  const psorted=Object.entries(psc).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l));
  if(psorted.length){
    h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:var(--blue);margin:18px 0 8px;padding-bottom:5px;border-bottom:2px solid var(--blue-ll)">👤 개인 기여도</div>
    <table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>게임 승</th><th>게임 패</th><th>승률</th></tr></thead><tbody>`;
    psorted.forEach(([name,s],i)=>{
      const total=s.w+s.l;const rate=total?Math.round(s.w/total*100):0;
      const col=gc(s.univ);
      let rnk=i===0?`<span class="rk1">1등</span>`:i===1?`<span class="rk2">2등</span>`:i===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${i+1}위</span>`;
      h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:5px;cursor:pointer" onclick="openPlayerModal('${name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(name,'22px')}<span style="font-weight:700">${name}</span>${s.univ?`<span class="ubadge" style="background:${col};font-size:9px">${s.univ}</span>`:''}</span></td><td class="wt">${s.w}</td><td class="lt">${s.l}</td><td style="font-weight:700;color:${rate>=50?'#16a34a':'#dc2626'}">${rate}%</td></tr>`;
    });
    h+=`</tbody></table>`;
  }
  return h;
}

/* ══════════════════════════════════════
   개인전
══════════════════════════════════════ */
let _indInput={date:'',playerA:'',playerB:'',games:[]};

function rInd(C,T){
  T.innerText='🎮 개인전';
  if(!isLoggedIn && indSub==='input') indSub='records';
  const subOpts=[
    {id:'input',lbl:'📝 경기 입력',fn:`indSub='input';render()`},
    {id:'rank',lbl:'🏆 순위',fn:`indSub='rank';render()`},
    {id:'records',lbl:'📋 기록',fn:`indSub='records';render()`}
  ];
  let h=stabs(indSub,subOpts);
  if(indSub!=='input' && typeof buildYearMonthFilter==='function') h+=buildYearMonthFilter('ind');
  if(indSub==='input'&&isLoggedIn){
    h+=indInputHTML();
  } else if(indSub==='rank'){
    h+=indRankHTML();
  } else {
    h+=indRecordsHTML();
  }
  C.innerHTML=h;
}

function indRankHTML(){
  const sc={};const vs={};
  players.forEach(p=>{sc[p.name]={w:0,l:0};});
  indM.forEach(m=>{
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
  const sk=window._rankSort['ind']||'rate';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><span style="font-size:11px;font-weight:700;color:var(--text3)">정렬:</span><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['ind']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['ind']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['ind']='l';render()">패순</button></div>`;
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return sortBar+`<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  let h=sortBar+`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>승</th><th>패</th><th>승률</th><th style="text-align:left">상대 전적</th></tr></thead><tbody>`;
  entries.forEach((p,i)=>{
    const pl=players.find(x=>x.name===p.name);
    const vsEntries=Object.entries(vs[p.name]||{}).sort((a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l));
    const vsHTML=vsEntries.map(([opp,r])=>{
      const col=r.w>r.l?'#16a34a':r.l>r.w?'#dc2626':'#6b7280';
      return `<span style="display:inline-flex;align-items:center;gap:3px;margin:1px 3px 1px 0;font-size:10px">${getPlayerPhotoHTML(opp,'14px')}<span style="cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${opp.replace(/'/g,"\\'")}')">${opp}</span><span style="font-weight:700;color:${col}">${r.w}승${r.l}패</span></span>`;
    }).join('');
    let rnk=i===0?`<span class="rk1">1등</span>`:i===1?`<span class="rk2">2등</span>`:i===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${i+1}위</span>`;
    h+=`<tr>
      <td>${rnk}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(p.name,'28px')}<span style="font-weight:700">${p.name}</span><span style="font-size:11px;color:var(--gray-l)">${pl?.univ||''}</span></span></td>
      <td class="wt">${p.w}</td><td class="lt">${p.l}</td>
      <td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td>
      <td style="text-align:left;min-width:120px">${vsHTML||'<span style="color:var(--gray-l);font-size:11px">—</span>'}</td>
    </tr>`;
  });
  return h+`</tbody></table>`;
}

function indRecordsHTML(){
  if(!indM.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  // 세션 그룹화: sid+페어 기준 (비연속 병합), 없으면 연속+날짜+페어 기준
  const sessions=[];
  const sidPairMap=new Map();
  let lastKey=null, lastSess=null;
  indM.forEach((m)=>{
    const pair=[m.wName,m.lName].sort();
    const k = m.sid ? `${m.sid}|${pair[0]}|${pair[1]}` : `${m.d||''}|${pair[0]}|${pair[1]}`;
    if(k!==lastKey||!lastSess){
      if(m.sid && sidPairMap.has(k)){
        lastSess=sidPairMap.get(k);lastKey=k;
      } else {
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[]};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  // 날짜 필터 적용
  const filteredSess=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSess.sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  const pageSize=getHistPageSize();
  const total=filteredSess.length;
  const totalPages=Math.ceil(total/pageSize)||1;
  if(histPage['ind']>=totalPages) histPage['ind']=Math.max(0,totalPages-1);
  const cur=histPage['ind'];
  const slice=total>pageSize?filteredSess.slice(cur*pageSize,(cur+1)*pageSize):filteredSess;
  let h='';
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const delBtn=isLoggedIn?`<button class="btn btn-r btn-xs" style="white-space:nowrap" onclick="deleteIndSession(${idsJson})">전체삭제</button>`:'';
    const shareBtn=`<button class="btn btn-b btn-xs" style="white-space:nowrap" onclick="event.stopPropagation();openIndShareCard('${s.p1.replace(/'/g,"\\'")}','${s.p2.replace(/'/g,"\\'")}',${p1wins},${p2wins},'${s.d}','${winner.replace(/'/g,"\\'")}')">📷 공유카드</button>`;
    h+=`<details style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden">
      <summary style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;list-style:none;background:var(--bg2)">
        <span style="font-size:11px;color:${s.d?'var(--gray-l)':'#f59e0b'};min-width:80px">${s.d||'날짜 미정'}</span>
        <span style="display:inline-flex;align-items:center;gap:4px">${getPlayerPhotoHTML(s.p1,'22px')}<span style="font-weight:700;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${s.p1.replace(/'/g,"\\'")}')">${s.p1}</span><span style="font-size:10px;color:var(--gray-l)">${players.find(x=>x.name===s.p1)?.univ||''}</span></span>
        <span style="font-size:13px;font-weight:900;color:var(--blue)">${p1wins} - ${p2wins}</span>
        <span style="display:inline-flex;align-items:center;gap:4px"><span style="font-weight:700;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${s.p2.replace(/'/g,"\\'")}')">${s.p2}</span><span style="font-size:10px;color:var(--gray-l)">${players.find(x=>x.name===s.p2)?.univ||''}</span>${getPlayerPhotoHTML(s.p2,'22px')}</span>
        ${winner?`<span style="font-size:11px;color:#16a34a;font-weight:700">(${winner} 승)</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${s.games.length}경기</span>
        <span style="margin-left:auto;display:flex;gap:4px">${shareBtn}${delBtn}</span>
      </summary>
      <table style="margin:0;border-radius:0"><thead><tr><th style="text-align:left">경기</th><th style="text-align:right">${s.p1}</th><th style="text-align:center;color:var(--gray-l)">vs</th><th style="text-align:left">${s.p2}</th><th style="text-align:left">맵</th>${isLoggedIn?'<th>관리</th>':''}</tr></thead><tbody>`;
    s.games.forEach((m,gi)=>{
      const origIdx=indM.findIndex(x=>x._id===m._id);
      const p1win=m.wName===s.p1;
      const p1photo=getPlayerPhotoHTML(s.p1,'18px',`vertical-align:middle;flex-shrink:0${p1win?'':';filter:blur(1px) grayscale(.2);opacity:.45'}`);
      const p2photo=getPlayerPhotoHTML(s.p2,'18px',`vertical-align:middle;flex-shrink:0${p1win?';filter:blur(1px) grayscale(.2);opacity:.45':''}`);
      h+=`<tr>
        <td style="font-size:11px;color:var(--gray-l)">${gi+1}경기</td>
        <td style="text-align:right"><span style="display:inline-flex;align-items:center;justify-content:flex-end;gap:4px">${p1photo}<span style="font-weight:${p1win?'900':'400'};color:${p1win?'var(--blue)':'#aaa'};cursor:pointer" onclick="openPlayerModal('${s.p1.replace(/'/g,"\\'")}')">${s.p1}</span></span></td>
        <td style="text-align:center;font-size:10px;color:var(--gray-l)">vs</td>
        <td><span style="display:inline-flex;align-items:center;gap:4px">${p2photo}<span style="font-weight:${p1win?'400':'900'};color:${p1win?'#aaa':'var(--blue)'};cursor:pointer" onclick="openPlayerModal('${s.p2.replace(/'/g,"\\'")}')">${s.p2}</span></span></td>
        <td style="font-size:11px">${m.map && m.map !== '-' ? m.map : ''}</td>
        ${isLoggedIn?`<td style="display:flex;gap:4px"><button class="btn btn-r btn-xs" onclick="_removeIndResult('${m.wName.replace(/'/g,"\\'")}','${m.lName.replace(/'/g,"\\'")}','${m.d||''}','${m.map||'-'}');indM.splice(${origIdx},1);save();render()">🗑️ 삭제</button></td>`:''}
      </tr>`;
    });
    h+=`</tbody></table></details>`;
  });
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=0;render()" ${cur===0?'disabled':''}>«</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.max(0,${cur}-1);render()" ${cur===0?'disabled':''}>‹</button>`;
    let s2=Math.max(0,cur-3),e2=Math.min(totalPages-1,s2+6);if(e2-s2<6)s2=Math.max(0,e2-6);
    for(let p=s2;p<=e2;p++) h+=`<button class="btn ${p===cur?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['ind']=${p};render()">${p+1}</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.min(${totalPages-1},${cur}+1);render()" ${cur===totalPages-1?'disabled':''}>›</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=${totalPages-1};render()" ${cur===totalPages-1?'disabled':''}>»</button>`;
    h+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}

function _removeIndResult(wName, lName, date, map){
  const w=players.find(p=>p.name===wName);
  const l=players.find(p=>p.name===lName);
  if(!w||!l)return;
  const nm=v=>(!v||v==='-')?'-':v;
  const wi=w.history.findIndex(h=>h.result==='승'&&h.opp===lName&&h.date===(date||'')&&nm(h.map)===nm(map));
  let delta=0;
  if(wi>=0){delta=w.history[wi].eloDelta||0;w.history.splice(wi,1);}
  const li=l.history.findIndex(h=>h.result==='패'&&h.opp===wName&&h.date===(date||'')&&nm(h.map)===nm(map));
  if(li>=0)l.history.splice(li,1);
  if(w.win>0)w.win--;if(l.loss>0)l.loss--;
  w.points-=3;l.points+=3;
  if(delta){w.elo=(w.elo||1200)-delta;l.elo=(l.elo||1200)+delta;}
}
function deleteIndSession(ids){
  if(!confirm(`${ids.length}경기를 삭제하시겠습니까?`))return;
  indM.filter(m=>ids.includes(m._id)).forEach(m=>_removeIndResult(m.wName,m.lName,m.d||'',m.map||'-'));
  indM=indM.filter(m=>!ids.includes(m._id));
  save();render();
}

/* ══════════════════════════════════════
   개인전 직접 입력
══════════════════════════════════════ */
function indInputHTML(){
  const gi=_indInput;
  const pA=gi.playerA, pB=gi.playerB;
  const pList=players.filter(p=>p.name).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  const pOpts=name=>`<option value="">— 스트리머 선택 —</option>`+pList.map(p=>`<option value="${p.name}"${p.name===name?' selected':''}>${p.name}${p.univ?` (${p.univ})`:''}</option>`).join('');
  const aWins=gi.games.filter(g=>g==='A').length, bWins=gi.games.filter(g=>g==='B').length;
  const pAObj=players.find(p=>p.name===pA)||{};
  const pBObj=players.find(p=>p.name===pB)||{};
  const aCol=gc(pAObj.univ)||'#2563eb', bCol=gc(pBObj.univ)||'#dc2626';
  let gameRows='';
  gi.games.forEach((w,i)=>{
    const wName=w==='A'?pA:pB, lName=w==='A'?pB:pA;
    gameRows+=`<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;background:var(--surface);border-radius:6px;margin-bottom:4px">
      <span style="font-size:11px;color:var(--gray-l);min-width:20px">${i+1}G</span>
      <span style="font-weight:700;color:${w==='A'?aCol:bCol};flex:1">${wName} 승</span>
      <span style="font-size:10px;color:var(--gray-l)">${lName} 패</span>
      <button onclick="_indInput.games.splice(${i},1);render()" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;padding:0 4px">✕</button>
    </div>`;
  });
  return `<div class="match-builder"><h3>🎮 개인전 입력</h3>
    <div style="margin-bottom:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <button class="btn btn-p btn-sm" onclick="openIndPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 붙여넣기 일괄 입력</button>
      <span style="font-size:11px;color:var(--gray-l)">텍스트 붙여넣기 지원</span>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:11px;color:#166534">
      💡 <strong>개인전</strong>: 선수 1:1 단순 승패 기록 &nbsp;|&nbsp; <strong>끝장전</strong>: 동일 대전 상대 연속 시리즈 (세트 승패 추적)
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:12px">① 날짜 & 대전 스트리머</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
        <label style="font-size:12px;font-weight:700">날짜</label>
        <input type="date" value="${gi.date||''}" onchange="_indInput.date=this.value" style="padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:140px">
          <div style="font-size:11px;font-weight:700;color:${aCol};margin-bottom:4px">🔵 A 스트리머</div>
          ${pA?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${aCol}18;border:2px solid ${aCol};border-radius:8px">
            ${getPlayerPhotoHTML(pA,'28px')}<span style="font-weight:800;color:${aCol}">${pA}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pAObj.univ||''}</span>
            <button onclick="_indInput.playerA='';_indInput.games=[];render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>`:`<select onchange="_indInput.playerA=this.value;_indInput.games=[];render()" style="width:100%;padding:6px;border:1px solid var(--border2);border-radius:6px;font-size:12px">${pOpts(pA)}</select>`}
        </div>
        <div style="display:flex;align-items:center;font-weight:900;color:var(--gray-l);padding-top:20px">VS</div>
        <div style="flex:1;min-width:140px">
          <div style="font-size:11px;font-weight:700;color:${bCol};margin-bottom:4px">🔴 B 스트리머</div>
          ${pB?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${bCol}18;border:2px solid ${bCol};border-radius:8px">
            ${getPlayerPhotoHTML(pB,'28px')}<span style="font-weight:800;color:${bCol}">${pB}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pBObj.univ||''}</span>
            <button onclick="_indInput.playerB='';_indInput.games=[];render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>`:`<select onchange="_indInput.playerB=this.value;_indInput.games=[];render()" style="width:100%;padding:6px;border:1px solid var(--border2);border-radius:6px;font-size:12px">${pOpts(pB)}</select>`}
        </div>
      </div>
    </div>
    ${pA&&pB?`<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">② 경기 결과 입력</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button onclick="_indInput.games.push('A');render()" style="flex:1;padding:12px;border-radius:10px;border:2px solid ${aCol};background:${aCol}18;font-size:14px;font-weight:800;color:${aCol};cursor:pointer">
          ${getPlayerPhotoHTML(pA,'20px')} ${pA} 승 (+1)
        </button>
        <button onclick="_indInput.games.push('B');render()" style="flex:1;padding:12px;border-radius:10px;border:2px solid ${bCol};background:${bCol}18;font-size:14px;font-weight:800;color:${bCol};cursor:pointer">
          ${getPlayerPhotoHTML(pB,'20px')} ${pB} 승 (+1)
        </button>
      </div>
      ${gi.games.length?`<div style="margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:6px">현재 스코어: <span style="color:${aCol};font-weight:900">${pA} ${aWins}</span> : <span style="color:${bCol};font-weight:900">${bWins} ${pB}</span></div>
        ${gameRows}
      </div>`:'<div style="font-size:11px;color:var(--gray-l);padding:10px 0">위 버튼으로 경기 결과를 추가하세요</div>'}
      ${gi.games.length?`<div style="display:flex;gap:8px">
        <button onclick="indDirectSave()" class="btn btn-b" style="flex:1">✅ 저장 (${gi.games.length}경기)</button>
        <button onclick="_indInput.games=[];render()" class="btn btn-r btn-xs">초기화</button>
      </div>`:''}
    </div>`:''}
  </div>`;
}

function indDirectSave(){
  const gi=_indInput;
  if(!gi.playerA||!gi.playerB){alert('스트리머 두 명을 선택하세요.');return;}
  if(!gi.games.length){alert('경기 결과를 1경기 이상 입력하세요.');return;}
  const sid=genId();
  const dateVal=gi.date||'';
  const newGames=gi.games.map(w=>({
    _id:genId(),sid,d:dateVal,
    wName:w==='A'?gi.playerA:gi.playerB,
    lName:w==='A'?gi.playerB:gi.playerA,
    map:''
  }));
  newGames.forEach(m=>{
    applyGameResult(m.wName,m.lName,dateVal,'',sid,'','','개인전');
  });
  indM.unshift(...newGames);
  _indInput={date:gi.date,playerA:gi.playerA,playerB:gi.playerB,games:[]};
  save();
  indSub='records';
  render();
}

/* ══════════════════════════════════════
   개인전 공유카드
══════════════════════════════════════ */
function openIndShareCard(p1, p2, p1wins, p2wins, date, winner) {
  _shareMode = 'match';
  openShareCardModal();
  setTimeout(() => renderIndShareCard(p1, p2, p1wins, p2wins, date, winner), 80);
}

function renderIndShareCard(p1, p2, p1wins, p2wins, date, winner) {
  const card = document.getElementById('share-card');
  if (!card) return;
  const pp1 = players.find(x => x.name === p1) || {};
  const pp2 = players.find(x => x.name === p2) || {};

  const games = indM.filter(m => {
    const pair = [m.wName, m.lName].sort();
    const pair2 = [p1, p2].sort();
    return (m.d||'') === date && pair[0] === pair2[0] && pair[1] === pair2[1];
  });

  const WC = '#111';
  const LC = '#94a3b8';

  const raceLabel = r => r==='T'?'테란':r==='Z'?'저그':r==='P'?'프로토스':'';
  const ct = t => t ? t.replace(/티어$/,'') : '';

  const playerInfoBlock = (name, pObj, isWinner, side) => {
    const photo = getPlayerPhotoHTML(name, '64px', `border-radius:50%;border:3px solid ${isWinner?'#0ea5e9':'#bae6fd'};box-shadow:${isWinner?'0 4px 16px rgba(14,165,233,.45)':'0 2px 8px rgba(0,0,0,.07)'};${!isWinner&&winner?'opacity:.4;filter:grayscale(.5)':''}`);
    const race = raceLabel(pObj.race||'');
    const tier = pObj.tier ? `<span style="background:${_TIER_BG[pObj.tier]||'#64748b'};color:${_TIER_TEXT[pObj.tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${ct(pObj.tier)}</span>` : '';
    const raceSpan = race ? `<span style="font-size:10px;color:#94a3b8">${race}</span>` : '';
    const isRight = side === 'right';
    const badges = isRight ? `${raceSpan}${tier}` : `${tier}${raceSpan}`;
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:${isRight?'flex-end':'flex-start'};gap:6px;min-width:0">
      <div style="flex-shrink:0;position:relative">
        ${photo}
        ${isWinner&&winner?`<div style="position:absolute;bottom:-2px;${isRight?'left:-2px':'right:-2px'};font-size:13px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.2))">🏆</div>`:''}
      </div>
      <div style="text-align:${isRight?'right':'left'};width:100%;min-width:0">
        <div style="font-size:13px;font-weight:${isWinner?'800':'500'};color:${isWinner?WC:LC};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
        <div style="display:flex;align-items:center;justify-content:${isRight?'flex-end':'flex-start'};gap:4px;flex-wrap:wrap;margin-top:3px">${badges}</div>
      </div>
    </div>`;
  };

  const gameRows = games.map((m, gi) => {
    const p1win = m.wName === p1;
    const p1Photo = getPlayerPhotoHTML(p1, '16px', `flex-shrink:0;border-radius:50%;${!p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const p2Photo = getPlayerPhotoHTML(p2, '16px', `flex-shrink:0;border-radius:50%;${p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const mapTxt = m.map && m.map !== '-' ? `<span style="color:#94a3b8;font-size:9px;margin-left:2px">📍${m.map}</span>` : '';
    return `<div style="display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:8px;background:${p1win?'rgba(14,165,233,.08)':'rgba(255,255,255,.5)'};margin-bottom:3px">
      <span style="font-size:9px;color:#0ea5e9;min-width:26px;font-weight:700">${gi+1}G</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1;justify-content:flex-end">
        ${p1Photo}<span style="font-size:11px;font-weight:${p1win?'700':'400'};color:${p1win?WC:LC}">${p1}</span>
      </span>
      <span style="font-size:9px;color:#bae6fd;flex-shrink:0">vs</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1">
        ${p2Photo}<span style="font-size:11px;font-weight:${p1win?'400':'700'};color:${p1win?LC:WC}">${p2}</span>
      </span>
      ${mapTxt}
    </div>`;
  }).join('');

  card.innerHTML = `<div style="background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 40%,#f0fdf4 100%);border-radius:22px;padding:20px 18px;font-family:'Noto Sans KR',sans-serif;color:#111;overflow:hidden;position:relative;box-shadow:0 8px 40px rgba(14,165,233,.15)">
    <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#38bdf8,#0ea5e9,#6366f1);border-radius:22px 22px 0 0"></div>
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:linear-gradient(135deg,#7dd3fc20,#38bdf810);pointer-events:none"></div>
    <div style="position:absolute;bottom:-30px;left:-30px;width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#bae6fd15,#6366f110);pointer-events:none"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;margin-top:4px">
      <div style="font-size:11px;font-weight:800;color:#0369a1;background:linear-gradient(90deg,#e0f2fe,#ede9fe);padding:4px 12px;border-radius:20px;border:1.5px solid #7dd3fc">🎮 개인전</div>
      <div style="font-size:10px;color:#0ea5e9;font-weight:600">${date||''}</div>
    </div>
    <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:${games.length?'14':'0'}px">
      ${playerInfoBlock(p1, pp1, p1===winner, 'left')}
      <div style="text-align:center;flex-shrink:0;padding:10px 2px 0">
        <div style="font-size:40px;font-weight:900;line-height:1;letter-spacing:-2px">
          <span style="color:${p1===winner?'#0369a1':'#bae6fd'}">${p1wins}</span>
          <span style="color:#bae6fd;font-size:22px;margin:0 1px">:</span>
          <span style="color:${p2===winner?'#0369a1':'#bae6fd'}">${p2wins}</span>
        </div>
        ${winner?`<div style="font-size:8px;background:linear-gradient(90deg,#0ea5e9,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;margin-top:5px;letter-spacing:1px">WIN</div>`:''}
      </div>
      ${playerInfoBlock(p2, pp2, p2===winner, 'right')}
    </div>
    ${games.length ? `<div style="background:rgba(255,255,255,.7);backdrop-filter:blur(4px);border-radius:14px;padding:10px;border:1px solid rgba(125,211,252,.4)">
      <div style="font-size:9px;color:#0ea5e9;font-weight:700;margin-bottom:8px;letter-spacing:.5px">경기 상세</div>
      ${gameRows}
    </div>` : ''}
    <div style="margin-top:12px;text-align:right;font-size:8px;color:#bae6fd;letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
  </div>`;
}

/* ══════════════════════════════════════
   끝장전 — 삭제 헬퍼
══════════════════════════════════════ */
function _removeGjResult(wName, lName, date, map, matchId){
  const w=players.find(p=>p.name===wName);
  const l=players.find(p=>p.name===lName);
  if(!w||!l)return;
  const nm=v=>(!v||v==='-')?'-':v;
  const wi=matchId
    ? w.history.findIndex(h=>h.matchId===matchId)
    : w.history.findIndex(h=>h.result==='승'&&h.opp===lName&&(date===''||h.date===date)&&nm(h.map)===nm(map));
  let delta=0;
  if(wi>=0){delta=w.history[wi].eloDelta||0;w.history.splice(wi,1);}
  const li=matchId
    ? l.history.findIndex(h=>h.matchId===matchId)
    : l.history.findIndex(h=>h.result==='패'&&h.opp===wName&&(date===''||h.date===date)&&nm(h.map)===nm(map));
  if(li>=0)l.history.splice(li,1);
  if(w.win>0)w.win--;if(l.loss>0)l.loss--;
  w.points-=3;l.points+=3;
  if(delta){w.elo=(w.elo||1200)-delta;l.elo=(l.elo||1200)+delta;}
}
function deleteGjGame(idx){
  const m=gjM[idx];if(!m)return;
  _removeGjResult(m.wName,m.lName,m.d||'',m.map||'-',m.matchId||undefined);
  gjM.splice(idx,1);save();render();
}
function deleteGjSession(idsArr){
  gjM.filter(m=>idsArr.includes(m._id)).forEach(m=>_removeGjResult(m.wName,m.lName,m.d||'',m.map||'-',m.matchId||undefined));
  gjM=gjM.filter(m=>!idsArr.includes(m._id));save();render();
}

/* ══════════════════════════════════════
   끝장전
══════════════════════════════════════ */
let _gjInput={date:'',playerA:'',playerB:'',games:[]};

function rGJ(C,T){
  T.innerText='⚔️ 끝장전';
  if(!isLoggedIn && gjSub==='input') gjSub='records';
  const subOpts=[
    {id:'input',lbl:'📝 경기 입력',fn:`gjSub='input';render()`},
    {id:'rank',lbl:'🏆 순위',fn:`gjSub='rank';render()`},
    {id:'records',lbl:'📋 기록',fn:`gjSub='records';render()`}
  ];
  let h=stabs(gjSub,subOpts);
  if(gjSub!=='input' && typeof buildYearMonthFilter==='function') h+=buildYearMonthFilter('gj');
  if(gjSub==='input'&&isLoggedIn){
    h+=gjInputHTML();
  } else if(gjSub==='rank'){
    h+=gjRankHTML();
  } else {
    h+=gjRecordsHTML();
  }
  C.innerHTML=h;
}

function gjInputHTML(){
  const gi=_gjInput;
  const pA=gi.playerA, pB=gi.playerB;
  const pList=players.filter(p=>p.name).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  const pOpts=name=>`<option value="">— 스트리머 선택 —</option>`+pList.map(p=>`<option value="${p.name}"${p.name===name?' selected':''}>${p.name}${p.univ?` (${p.univ})`:''}</option>`).join('');
  const aWins=gi.games.filter(g=>g==='A').length, bWins=gi.games.filter(g=>g==='B').length;
  const pAObj=players.find(p=>p.name===pA)||{};
  const pBObj=players.find(p=>p.name===pB)||{};
  const aCol=gc(pAObj.univ)||'#2563eb', bCol=gc(pBObj.univ)||'#dc2626';

  let gameRows='';
  gi.games.forEach((w,i)=>{
    const wName=w==='A'?pA:pB, lName=w==='A'?pB:pA;
    gameRows+=`<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;background:var(--surface);border-radius:6px;margin-bottom:4px">
      <span style="font-size:11px;color:var(--gray-l);min-width:20px">${i+1}G</span>
      <span style="font-weight:700;color:${w==='A'?aCol:bCol};flex:1">${wName} 승</span>
      <span style="font-size:10px;color:var(--gray-l)">${lName} 패</span>
      ${isLoggedIn?`<button onclick="_gjInput.games.splice(${i},1);render()" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;padding:0 4px">✕</button>`:''}
    </div>`;
  });

  return `<div class="match-builder"><h3>⚔️ 끝장전 입력</h3>
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openGJPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 붙여넣기 일괄 입력</button></div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:12px">① 날짜 & 대전 스트리머</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:6px">
          <label style="font-size:12px;font-weight:700">날짜</label>
          <input type="date" value="${gi.date||''}" onchange="_gjInput.date=this.value" style="padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:140px">
          <div style="font-size:11px;font-weight:700;color:${aCol};margin-bottom:4px">🔵 A 스트리머</div>
          ${pA?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${aCol}18;border:2px solid ${aCol};border-radius:8px">
            ${getPlayerPhotoHTML(pA,'28px')}
            <span style="font-weight:800;color:${aCol}">${pA}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pAObj.univ||''}</span>
            <button onclick="_gjInput.playerA='';_gjInput.games=[];render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>`:`<select onchange="_gjInput.playerA=this.value;_gjInput.games=[];render()" style="width:100%;padding:6px;border:1px solid var(--border2);border-radius:6px;font-size:12px">${pOpts(pA)}</select>`}
        </div>
        <div style="display:flex;align-items:center;font-weight:900;color:var(--gray-l);padding-top:20px">VS</div>
        <div style="flex:1;min-width:140px">
          <div style="font-size:11px;font-weight:700;color:${bCol};margin-bottom:4px">🔴 B 스트리머</div>
          ${pB?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${bCol}18;border:2px solid ${bCol};border-radius:8px">
            ${getPlayerPhotoHTML(pB,'28px')}
            <span style="font-weight:800;color:${bCol}">${pB}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pBObj.univ||''}</span>
            <button onclick="_gjInput.playerB='';_gjInput.games=[];render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>`:`<select onchange="_gjInput.playerB=this.value;_gjInput.games=[];render()" style="width:100%;padding:6px;border:1px solid var(--border2);border-radius:6px;font-size:12px">${pOpts(pB)}</select>`}
        </div>
      </div>
    </div>
    ${pA&&pB?`<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">② 경기 결과 입력</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button onclick="_gjInput.games.push('A');render()" style="flex:1;padding:12px;border-radius:10px;border:2px solid ${aCol};background:${aCol}18;font-size:14px;font-weight:800;color:${aCol};cursor:pointer">
          ${getPlayerPhotoHTML(pA,'20px')} ${pA} 승 (+1)
        </button>
        <button onclick="_gjInput.games.push('B');render()" style="flex:1;padding:12px;border-radius:10px;border:2px solid ${bCol};background:${bCol}18;font-size:14px;font-weight:800;color:${bCol};cursor:pointer">
          ${getPlayerPhotoHTML(pB,'20px')} ${pB} 승 (+1)
        </button>
      </div>
      ${gi.games.length?`<div style="margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:6px">현재 스코어: <span style="color:${aCol};font-weight:900">${pA} ${aWins}</span> : <span style="color:${bCol};font-weight:900">${bWins} ${pB}</span></div>
        ${gameRows}
      </div>`:'<div style="font-size:11px;color:var(--gray-l);padding:10px 0">위 버튼으로 경기 결과를 추가하세요</div>'}
      ${gi.games.length?`<div style="display:flex;gap:8px">
        <button onclick="gjDirectSave()" class="btn btn-b" style="flex:1">✅ 저장 (${gi.games.length}경기)</button>
        <button onclick="_gjInput.games=[];render()" class="btn btn-r btn-xs">초기화</button>
      </div>`:''}
    </div>`:''}
  </div>`;
}

function gjDirectSave(){
  const gi=_gjInput;
  if(!gi.playerA||!gi.playerB){alert('스트리머 두 명을 선택하세요.');return;}
  if(!gi.games.length){alert('경기 결과를 1경기 이상 입력하세요.');return;}
  const sid=genId();
  const dateVal=gi.date||new Date().toISOString().slice(0,10);
  const newGames=gi.games.map(w=>({
    _id:genId(),sid,d:dateVal,
    wName:w==='A'?gi.playerA:gi.playerB,
    lName:w==='A'?gi.playerB:gi.playerA,
    map:''
  }));
  // 개인 전적 반영
  newGames.forEach(m=>{
    applyGameResult(m.wName,m.lName,dateVal,'',sid,'','','끝장전');
  });
  gjM.unshift(...newGames);
  const p1w=gi.games.filter(g=>g==='A').length, p2w=gi.games.filter(g=>g==='B').length;
  const winner=p1w>p2w?gi.playerA:p2w>p1w?gi.playerB:'';
  _gjInput={date:gi.date,playerA:gi.playerA,playerB:gi.playerB,games:[]};
  save();
  gjSub='records';
  render();
  // 저장 직후 공유카드 열기 제안
  setTimeout(()=>{
    if(confirm(`✅ ${gi.games.length}경기 저장 완료!\n공유카드를 열겠습니까?`)){
      openGJShareCard(gi.playerA,gi.playerB,p1w,p2w,dateVal,winner);
    }
  },200);
}

function gjRankHTML(){
  const sc={};
  const vs={};
  gjM.forEach(m=>{
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
  const sk=window._rankSort['gj']||'rate';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><span style="font-size:11px;font-weight:700;color:var(--text3)">정렬:</span><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['gj']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['gj']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['gj']='l';render()">패순</button></div>`;
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return sortBar+`<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  let h=sortBar+`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>승</th><th>패</th><th>승률</th><th style="text-align:left">상대 전적</th></tr></thead><tbody>`;
  entries.forEach((p,i)=>{
    const pl=players.find(x=>x.name===p.name);
    const vsEntries=Object.entries(vs[p.name]||{}).sort((a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l));
    const vsHTML=vsEntries.map(([opp,r])=>{
      const col=r.w>r.l?'#16a34a':r.l>r.w?'#dc2626':'#6b7280';
      return `<span style="display:inline-flex;align-items:center;gap:3px;margin:1px 3px 1px 0;font-size:10px">${getPlayerPhotoHTML(opp,'14px')}<span style="cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${opp.replace(/'/g,"\\'")}')">${opp}</span><span style="font-weight:700;color:${col}">${r.w}승${r.l}패</span></span>`;
    }).join('');
    let rnk=i===0?`<span class="rk1">1등</span>`:i===1?`<span class="rk2">2등</span>`:i===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${i+1}위</span>`;
    h+=`<tr>
      <td>${rnk}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(p.name,'28px')}<span style="font-weight:700">${p.name}</span><span style="font-size:11px;color:var(--gray-l)">${pl?.univ||''}</span></span></td>
      <td class="wt">${p.w}</td><td class="lt">${p.l}</td>
      <td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td>
      <td style="text-align:left;min-width:120px">${vsHTML||'<span style="color:var(--gray-l);font-size:11px">—</span>'}</td>
    </tr>`;
  });
  return h+`</tbody></table>`;
}

function gjRecordsHTML(){
  if(!gjM.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  // 세션 그룹화
  // - sid 있음: sid+페어 기준 (비연속이어도 같은 페어끼리 합침 → 여러 쌍 동시 붙여넣기 지원)
  // - sid 없음: 연속된 같은 날짜+페어 기준 (기존 방식)
  const sessions=[];
  const sidPairMap=new Map(); // sid+pair→session (비연속 병합용)
  let lastKey=null, lastSess=null;
  gjM.forEach((m)=>{
    const pair=[m.wName,m.lName].sort();
    const k = m.sid ? `${m.sid}|${pair[0]}|${pair[1]}` : `${m.d||''}|${pair[0]}|${pair[1]}`;
    if(k!==lastKey||!lastSess){
      if(m.sid && sidPairMap.has(k)){
        // 같은 sid+페어 세션이 이미 존재하면 (비연속) 그쪽에 병합
        lastSess=sidPairMap.get(k);lastKey=k;
      } else {
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[]};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  const filteredSessGj=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSessGj.sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  const pageSize=getHistPageSize();
  const total=filteredSessGj.length;
  const totalPages=Math.ceil(total/pageSize);
  if(histPage['gj']>=totalPages) histPage['gj']=Math.max(0,totalPages-1);
  const cur=histPage['gj'];
  const slice=total>pageSize?filteredSessGj.slice(cur*pageSize,(cur+1)*pageSize):filteredSessGj;
  let h='';
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const delBtn=isLoggedIn?`<button class="btn btn-r btn-xs" style="white-space:nowrap" onclick="deleteGjSession(${idsJson})">전체삭제</button>`:'';
    const shareBtn=`<button class="btn btn-p btn-xs" style="white-space:nowrap" onclick="event.stopPropagation();openGJShareCard('${s.p1.replace(/'/g,"\\'")}','${s.p2.replace(/'/g,"\\'")}',${p1wins},${p2wins},'${s.d}','${winner.replace(/'/g,"\\'")}')">🎴 공유카드</button>`;
    h+=`<details style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden">
      <summary style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;list-style:none;background:var(--bg2)">
        <span style="font-size:11px;color:${s.d?'var(--gray-l)':'#f59e0b'};min-width:80px">${s.d||'날짜 미정'}</span>
        <span style="display:inline-flex;align-items:center;gap:4px">${getPlayerPhotoHTML(s.p1,'22px')}<span style="font-weight:700;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${s.p1.replace(/'/g,"\\'")}')">${s.p1}</span><span style="font-size:10px;color:var(--gray-l)">${players.find(x=>x.name===s.p1)?.univ||''}</span></span>
        <span style="font-size:13px;font-weight:900;color:var(--blue)">${p1wins} - ${p2wins}</span>
        <span style="display:inline-flex;align-items:center;gap:4px"><span style="font-weight:700;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${s.p2.replace(/'/g,"\\'")}')">${s.p2}</span><span style="font-size:10px;color:var(--gray-l)">${players.find(x=>x.name===s.p2)?.univ||''}</span>${getPlayerPhotoHTML(s.p2,'22px')}</span>
        ${winner?`<span style="font-size:11px;color:#16a34a;font-weight:700">(${winner} 승)</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${s.games.length}경기</span>
        <span style="margin-left:auto;display:flex;gap:4px">${shareBtn}${delBtn}</span>
      </summary>
      <table style="margin:0;border-radius:0"><thead><tr><th style="text-align:left">경기</th><th style="text-align:right">${s.p1}</th><th style="text-align:center;color:var(--gray-l)">vs</th><th style="text-align:left">${s.p2}</th><th style="text-align:left">맵</th>${isLoggedIn?'<th>관리</th>':''}</tr></thead><tbody>`;
    s.games.forEach((m,gi)=>{
      const origIdx=gjM.findIndex(x=>x._id===m._id);
      const p1win=m.wName===s.p1;
      const p1photo=getPlayerPhotoHTML(s.p1,'18px',`vertical-align:middle;flex-shrink:0${p1win?'':';filter:blur(1px) grayscale(.2);opacity:.45'}`);
      const p2photo=getPlayerPhotoHTML(s.p2,'18px',`vertical-align:middle;flex-shrink:0${p1win?';filter:blur(1px) grayscale(.2);opacity:.45':''}`);
      h+=`<tr>
        <td style="font-size:11px;color:var(--gray-l)">${gi+1}경기</td>
        <td style="text-align:right"><span style="display:inline-flex;align-items:center;justify-content:flex-end;gap:4px">${p1photo}<span style="font-weight:${p1win?'900':'400'};color:${p1win?'var(--blue)':'#aaa'};cursor:pointer" onclick="openPlayerModal('${s.p1.replace(/'/g,"\\'")}')">${s.p1}</span></span></td>
        <td style="text-align:center;font-size:10px;color:var(--gray-l)">vs</td>
        <td><span style="display:inline-flex;align-items:center;gap:4px">${p2photo}<span style="font-weight:${p1win?'400':'900'};color:${p1win?'#aaa':'var(--blue)'};cursor:pointer" onclick="openPlayerModal('${s.p2.replace(/'/g,"\\'")}')">${s.p2}</span></span></td>
        <td style="font-size:11px">${m.map && m.map !== '-' ? m.map : ''}</td>
        ${isLoggedIn?`<td style="display:flex;gap:4px"><button class="btn btn-o btn-xs" onclick="openRE('gj',${origIdx})">✏️ 수정</button><button class="btn btn-r btn-xs" onclick="deleteGjGame(${origIdx})">🗑️ 삭제</button></td>`:''}
      </tr>`;
    });
    h+=`</tbody></table></details>`;
  });
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=0;render()" ${cur===0?'disabled':''}>«</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=Math.max(0,${cur}-1);render()" ${cur===0?'disabled':''}>‹</button>`;
    let s2=Math.max(0,cur-3),e2=Math.min(totalPages-1,s2+6);if(e2-s2<6)s2=Math.max(0,e2-6);
    for(let p=s2;p<=e2;p++) h+=`<button class="btn ${p===cur?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['gj']=${p};render()">${p+1}</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=Math.min(${totalPages-1},${cur}+1);render()" ${cur===totalPages-1?'disabled':''}>›</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=${totalPages-1};render()" ${cur===totalPages-1?'disabled':''}>»</button>`;
    h+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}

/* ══════════════════════════════════════
   대학CK
══════════════════════════════════════ */
function rCK(C,T){
  T.innerText='🤝 대학CK';
  if(!isLoggedIn && ckSub==='input') ckSub='records';
  if(ckSub==='rank') ckSub='records';
  const subOpts=[{id:'input',lbl:'📝 경기 입력',fn:`ckSub='input';render()`},{id:'records',lbl:'📋 기록',fn:`ckSub='records';openDetails={};render()`}];
  let h=stabs(ckSub,subOpts);
  if(ckSub!=='input' && typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('ck');
  }
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
  let h=`<div class="match-builder"><h3>🤝 대학CK 입력</h3>
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openCKPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 결과 붙여넣기 일괄 입력</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">텍스트 붙여넣기 지원</span></div>
    <div style="margin-bottom:14px;display:flex;align-items:center;gap:10px">
      <label style="font-size:12px;font-weight:700;color:var(--blue)">날짜</label>
      <input type="date" value="${bld.date||''}" onchange="BLD['ck'].date=this.value">
    </div>

    <!-- 선수 검색으로 빠른 팀 짜기 -->
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:12px 14px;margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">🔍 선수 검색으로 빠른 팀 짜기 <span style="font-weight:400;color:var(--gray-l)">(이름·대학 검색 후 A팀/B팀 배정)</span></div>
      <div style="position:relative;display:flex;gap:6px;align-items:center">
        <input type="text" id="ck-search-input" placeholder="선수 이름 또는 대학 검색..." 
          style="flex:1;padding:8px 12px;border:1.5px solid var(--blue);border-radius:8px;font-size:13px"
          oninput="ckSearchPlayer()">
      </div>
      <div id="ck-search-results" style="display:none;margin-top:6px;background:var(--white);border:1px solid var(--border2);border-radius:8px;max-height:180px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,.1)"></div>
    </div>

    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px">
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
    </div>`;
  h+=setBuilderHTML(bld,'ck');h+=`</div>`;return h;
}

function ckSearchPlayer(){
  const inp=document.getElementById('ck-search-input');
  const res=document.getElementById('ck-search-results');
  if(!inp||!res)return;
  const q=inp.value.trim().toLowerCase();
  if(!q){res.style.display='none';res.innerHTML='';return;}
  const bld=BLD['ck']||{};
  const already=[...(bld.membersA||[]),...(bld.membersB||[])].map(m=>m.name);
  const results=players.filter(p=>
    (p.name.toLowerCase().includes(q)||(p.univ||'').toLowerCase().includes(q)||(p.tier||'').toLowerCase().includes(q)||(p.race||'').toLowerCase().includes(q))
  ).slice(0,20);
  if(!results.length){res.innerHTML='<div style="padding:10px 12px;color:var(--gray-l);font-size:12px">검색 결과 없음</div>';res.style.display='block';return;}
  res.innerHTML=results.map(p=>{
    const col=gc(p.univ);
    const inA=(bld.membersA||[]).some(m=>m.name===p.name);
    const inB=(bld.membersB||[]).some(m=>m.name===p.name);
    const inTeam=inA||inB;
    return `<div style="padding:8px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);${inTeam?'opacity:.5;':''}">
      <span style="width:28px;height:28px;border-radius:6px;background:${col};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${p.race||'?'}</span>
      <div style="flex:1;font-size:12px">
        <span style="font-weight:700">${p.name}</span>
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
  // 검색 결과 새로고침
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
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><span style="font-size:11px;font-weight:700;color:var(--text3)">정렬:</span><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['ck']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['ck']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['ck']='l';render()">패순</button></div>`;
  // 대학 순위
  const uS={};
  getAllUnivs().forEach(u=>{uS[u.name]={w:0,l:0,pts:0,total:0};});
  ckM.forEach(m=>{
    if(m.univWins)Object.entries(m.univWins).forEach(([u,c])=>{if(!uS[u])uS[u]={w:0,l:0,pts:0,total:0};uS[u].w+=c;uS[u].pts+=c*3;uS[u].total+=c;});
    if(m.univLosses)Object.entries(m.univLosses).forEach(([u,c])=>{if(!uS[u])uS[u]={w:0,l:0,pts:0,total:0};uS[u].l+=c;uS[u].pts-=c*3;uS[u].total+=c;});
  });
  const sortedU=Object.entries(uS).filter(([,s])=>s.total>0).sort((a,b)=>b[1].pts-a[1].pts);
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏆 대학CK 대학별 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">대학</th><th>게임 승</th><th>게임 패</th><th>포인트</th></tr></thead><tbody>`;
  if(!sortedU.length)h+=`<tr><td colspan="5" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  sortedU.forEach(([name,s],i)=>{
    const col=gc(name);let rnkHTML;
    if(i===0)rnkHTML=`<span class="rk1">1등</span>`;else if(i===1)rnkHTML=`<span class="rk2">2등</span>`;else if(i===2)rnkHTML=`<span class="rk3">3등</span>`;else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    h+=`<tr><td style="text-align:left">${rnkHTML}</td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${name}')">${name}</span></td><td class="wt" style="font-size:15px;font-weight:800">${s.w}</td><td class="lt" style="font-size:15px;font-weight:800">${s.l}</td><td class="${pC(s.pts)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">${pS(s.pts)}</td></tr>`;
  });
  h+=`</tbody></table>`;
  // 개인 순위
  const pS2={};
  ckM.forEach(m=>{
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        if(!pS2[wn])pS2[wn]={w:0,l:0};
        if(!pS2[ln])pS2[ln]={w:0,l:0};
        pS2[wn].w++;pS2[ln].l++;
      });
    });
  });
  const pEntries=Object.entries(pS2).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}));
  pEntries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏅 대학CK 개인 순위</div>${sortBar}`;
  if(!pEntries.length){h+=`<div style="padding:20px;text-align:center;color:var(--gray-l)">개인 기록 없음</div>`;return h;}
  h+=`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th style="text-align:left">대학</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
  pEntries.forEach((p,i)=>{
    const pObj=players.find(x=>x.name===p.name)||{};
    const col=gc(pObj.univ);
    let rnk=i===0?`<span class="rk1">1등</span>`:i===1?`<span class="rk2">2등</span>`:i===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${i+1}위</span>`;
    h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(p.name,'24px')}<span style="font-weight:700">${p.name}</span></span></td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col};font-size:10px" onclick="openUnivModal('${(pObj.univ||'').replace(/'/g,"\\'")}')">${pObj.univ||'-'}</span></td><td class="wt" style="font-weight:800">${p.w}</td><td class="lt" style="font-weight:800">${p.l}</td><td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td></tr>`;
  });
  h+=`</tbody></table>`;
  return h;
}

/* ══════════════════════════════════════
   대학대전
══════════════════════════════════════ */
function rUnivM(C,T){
  T.innerText='🏟️ 대학대전';
  if(!isLoggedIn && univmSub==='input') univmSub='records';
  const subOpts=[{id:'input',lbl:'📝 경기 입력',fn:`univmSub='input';render()`},{id:'rank',lbl:'🏆 순위',fn:`univmSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`univmSub='records';openDetails={};render()`}];
  let h=stabs(univmSub,subOpts);
  if(univmSub!=='input' && typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('univm');
  }
  if(univmSub==='input'&&isLoggedIn){if(!BLD['univm'])BLD['univm']={date:'',note:'',teamA:'',teamB:'',sets:[]};h+=`<div class="match-builder"><h3>🏟️ 대학대전 입력</h3><div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openUnivmPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 결과 붙여넣기 일괄 입력</button></div>${setBuilderHTML(BLD['univm'],'univm')}</div>`;}
  else if(univmSub==='rank'){h+=univMRankHTML();}
  else{h+=recSummaryListHTML(univM,'univm','tab');}
  C.innerHTML=h;
}

function univMRankHTML(){
  const sc={};
  getAllUnivs().forEach(u=>{sc[u.name]={w:0,l:0,pts:0,total:0};});
  univM.forEach(m=>{
    if(!sc[m.a])sc[m.a]={w:0,l:0,pts:0,total:0};if(!sc[m.b])sc[m.b]={w:0,l:0,pts:0,total:0};
    sc[m.a].total++;sc[m.b].total++;
    if(m.sa>m.sb){sc[m.a].w++;sc[m.a].pts+=3;sc[m.b].l++;sc[m.b].pts-=3;}
    else if(m.sb>m.sa){sc[m.b].w++;sc[m.b].pts+=3;sc[m.a].l++;sc[m.a].pts-=3;}
  });
  const sorted=Object.entries(sc).filter(([name,s])=>s.total>0&&name!=='무소속').sort((a,b)=>b[1].pts-a[1].pts);
  const delCol=isLoggedIn?`<th class="no-export" style="width:36px"></th>`:'';
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏆 대학대전 대학별 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">대학</th><th>승</th><th>패</th><th>포인트</th>${delCol}</tr></thead><tbody>`;
  if(!sorted.length)h+=`<tr><td colspan="${isLoggedIn?6:5}" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  sorted.forEach(([name,s],i)=>{
    const col=gc(name);let rnkHTML;
    if(i===0) rnkHTML=`<span class="rk1">1등</span>`;else if(i===1) rnkHTML=`<span class="rk2">2등</span>`;else if(i===2) rnkHTML=`<span class="rk3">3등</span>`;else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    const sn=name.replace(/'/g,"\\'");
    const delBtn=isLoggedIn?`<td class="no-export"><button onclick="deleteUnivFromRank('${sn}','univm')" style="padding:2px 6px;border-radius:4px;border:1px solid #fecaca;background:#fff5f5;color:#dc2626;font-size:11px;cursor:pointer" title="이 대학 대학대전 기록 삭제">🗑</button></td>`:'';
    h+=`<tr><td style="text-align:left">${rnkHTML}</td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${sn}')">${name}</span></td><td class="wt" style="font-size:15px;font-weight:800">${s.w}</td><td class="lt" style="font-size:15px;font-weight:800">${s.l}</td><td class="${pC(s.pts)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">${pS(s.pts)}</td>${delBtn}</tr>`;
  });
  return h+`</tbody></table>`;
}

/* ══════════════════════════════════════
   프로리그 (대학CK 방식)
══════════════════════════════════════ */
let proSub='records';

function rPro(C,T){
  T.innerText='🏅 프로리그';
  if(!isLoggedIn && proSub==='input') proSub='records';
  const subOpts=[
    {id:'input',lbl:'📝 경기 입력',fn:`proSub='input';render()`},
    {id:'rank',lbl:'🏆 순위',fn:`proSub='rank';render()`},
    {id:'records',lbl:'📋 기록',fn:`proSub='records';openDetails={};render()`}
  ];
  let h=stabs(proSub,subOpts);
  if(proSub!=='input' && typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('pro');
  }
  if(proSub==='input'&&isLoggedIn){
    if(!BLD['pro'])BLD['pro']={date:'',membersA:[],membersB:[],sets:[]};
    h+=buildProInputHTML();
  } else if(proSub==='rank'){
    h+=proRankHTML();
  } else {
    h+=recSummaryListHTML(proM,'pro','tab');
  }
  C.innerHTML=h;
}

function buildProInputHTML(){
  const bld=BLD['pro'];
  const mA=bld.membersA||[];const mB=bld.membersB||[];
  // 프로리그는 god~1티어까지만 허용
  const PRO_TIERS=['G','K','JA','J','S','0티어','1티어'];
  if(!bld.tierFilters)bld.tierFilters=[];
  const tf=bld.tierFilters;
  // god~1티어 선수 (클릭 목록: 기본 남자, 이미 팀에 추가된 여성은 포함)
  const allAddedNames=new Set([...(bld.membersA||[]),...(bld.membersB||[])].map(m=>m.name));
  const eligible=players.filter(p=>
    PRO_TIERS.includes(p.tier) &&
    (tf.length===0||tf.includes(p.tier)) &&
    (p.gender==='M' || allAddedNames.has(p.name)) // 여자는 이미 추가된 경우만 목록에 표시
  ).sort((a,b)=>{
    const ti=t=>PRO_TIERS.indexOf(t);
    return ti(a.tier)-ti(b.tier)||(a.name||'').localeCompare(b.name||'');
  });

  let h=`<div class="match-builder"><h3>🏅 프로리그 입력</h3>
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openProPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 결과 붙여넣기 일괄 입력</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">텍스트 붙여넣기 지원</span></div>
    <div style="margin-bottom:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700;color:var(--blue)">날짜</label>
      <input type="date" value="${bld.date||''}" onchange="BLD['pro'].date=this.value">
    </div>

    <!-- ① 참가 티어 선택 -->
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:10px 14px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">① 참가 티어 <span style="font-weight:400;color:var(--gray-l)">(복수 선택 · god~1티어 · 검색으로 여성 선수도 추가 가능)</span></div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="tier-filter-btn ${tf.length===0?'on':''}" onclick="BLD['pro'].tierFilters=[];BLD['pro'].membersA=[];BLD['pro'].membersB=[];BLD['pro'].sets=[];render()">전체</button>
        ${PRO_TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tf.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="proToggleTier('${t}')">${getTierLabel(t)}</button>`;}).join('')}
      </div>
      <div style="font-size:11px;color:var(--blue);margin-top:6px">대상 선수: <strong>${eligible.length}명</strong></div>
    </div>

    <!-- ② 선수 클릭 → 팀 배정 -->
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">② 선수 클릭 → 팀 배정 <span style="font-weight:400;color:var(--gray-l);font-size:11px">(A팀 / B팀 버튼으로 추가)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;max-height:220px;overflow-y:auto">
        ${eligible.length===0
          ?'<span style="color:var(--gray-l);font-size:12px">티어를 선택하면 선수 목록이 표시됩니다</span>'
          :eligible.map(p=>{
              const inA=mA.some(m=>m.name===p.name);
              const inB=mB.some(m=>m.name===p.name);
              const bg=inA?'#2563eb':inB?'#dc2626':gc(p.univ);
              if(inA||inB){
                return `<span style="display:inline-flex;align-items:center;gap:3px;background:${bg};color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;opacity:0.55">${p.name}${p.gender==='F'?'<span style="font-size:9px;color:#fda4af">♀</span>':''}<span style="opacity:.8;font-size:10px;margin-left:2px">${p.univ}/${p.tier}</span><span style="background:rgba(255,255,255,.3);border-radius:2px;padding:0 4px;font-size:9px;font-weight:800;margin-left:3px">${inA?'A팀':'B팀'}</span></span>`;
              }
              return `<span style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:#fff;padding:3px 6px;border-radius:6px;font-size:11px">
                <span style="font-weight:700">${p.name}${p.gender==='F'?'<span style="font-size:9px;color:#fda4af;margin-left:2px">♀</span>':''}</span><span style="opacity:.8;font-size:10px">${p.univ}/${p.tier}</span>
                <button onclick="proAddPlayer('A','${p.name}')" style="background:var(--white);color:#2563eb;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer;margin-left:2px">A팀</button>
                <button onclick="proAddPlayer('B','${p.name}')" style="background:var(--white);color:#dc2626;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer">B팀</button>
              </span>`;
            }).join('')
        }
      </div>
    </div>

    <!-- ③ 팀 구성 확인 + 검색 추가 -->
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px">
      <div class="ck-panel">
        <h4>🔵 팀 A (${mA.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="pro-a-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="proSearchPlayer('A')">
        </div>
        <div id="pro-a-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mA.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''}${m.race?'/'+m.race:''})</span><button onclick="BLD['pro'].membersA.splice(${i},1);BLD['pro'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">선수 없음</span>'}</div>
      </div>
      <div class="ck-panel">
        <h4>🔴 팀 B (${mB.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="pro-b-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="proSearchPlayer('B')">
        </div>
        <div id="pro-b-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mB.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''}${m.race?'/'+m.race:''})</span><button onclick="BLD['pro'].membersB.splice(${i},1);BLD['pro'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">선수 없음</span>'}</div>
      </div>
    </div>`;
  h+=setBuilderHTML(bld,'pro');h+=`</div>`;return h;
}

function proSearchPlayer(team){
  const searchEl=document.getElementById(`pro-${team.toLowerCase()}-search`);
  const dropEl=document.getElementById(`pro-${team.toLowerCase()}-drop`);
  if(!searchEl||!dropEl)return;
  const q=searchEl.value.trim().toLowerCase();
  if(!q){dropEl.style.display='none';dropEl.innerHTML='';return;}
  const PRO_TIERS=['G','K','JA','J','S','0티어','1티어'];
  const bld=BLD['pro']||{};
  const tf=bld.tierFilters||[];
  const already=[...(bld.membersA||[]),...(bld.membersB||[])].map(m=>m.name);
  // 검색 시에는 gender 제한 없음 (혼성 경기 지원) - 여자 선수는 티어 무관하게 검색 가능
  const results=players.filter(p=>
    (PRO_TIERS.includes(p.tier) || p.gender==='F') &&
    (tf.length===0||tf.includes(p.tier)||p.gender==='F') &&
    !already.includes(p.name) &&
    (p.name.toLowerCase().includes(q)||(p.memo||'').toLowerCase().includes(q)||(p.univ||'').toLowerCase().includes(q)||(p.tier||'').toLowerCase().includes(q))
  ).slice(0,20);
  if(!results.length){
    dropEl.innerHTML='<div style="padding:10px;color:var(--gray-l);font-size:12px;text-align:center">검색 결과 없음</div>';
    dropEl.style.display='block';return;
  }
  dropEl.innerHTML=results.map(p=>`<div onclick="proAddPlayer('${team}','${p.name}');document.getElementById('pro-${team.toLowerCase()}-search').value='';document.getElementById('pro-${team.toLowerCase()}-drop').style.display='none'"
    style="padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;font-size:12px"
    onmouseover="this.style.background='var(--blue-l)'" onmouseout="this.style.background=''">
    <span style="display:inline-block;width:28px;height:28px;border-radius:6px;background:${gc(p.univ)};color:#fff;text-align:center;line-height:28px;font-size:11px;font-weight:700;flex-shrink:0">${(p.race||'?').charAt(0)}</span>
    <div>
      <div style="font-weight:700">${p.name}${p.gender==='F'?'<span style="color:#ec4899;font-size:10px;margin-left:3px">♀</span>':''} <span style="font-size:10px;background:${gc(p.univ)};color:#fff;padding:1px 5px;border-radius:3px">${p.univ}</span></div>
      <div style="font-size:10px;color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}${p.memo?` · ${p.memo.slice(0,20)}`:''}</div>
    </div>
  </div>`).join('');
  dropEl.style.display='block';
}

function proAddPlayerDirect(team, name){
  const bld=BLD['pro'];if(!bld)return;
  const arr=team==='A'?bld.membersA:bld.membersB;
  if(arr.find(m=>m.name===name))return;
  const pObj=players.find(p=>p.name===name)||{};
  arr.push({name,univ:pObj.univ||'',race:pObj.race||'',tier:pObj.tier||''});
  bld.sets=[];
  const searchEl=document.getElementById(`pro-${team.toLowerCase()}-search`);
  const dropEl=document.getElementById(`pro-${team.toLowerCase()}-drop`);
  if(searchEl)searchEl.value='';
  if(dropEl){dropEl.style.display='none';dropEl.innerHTML='';}
  render();
}

function proAddPlayer(team, name){
  const bld=BLD['pro'];if(!bld)return;
  const all=[...(bld.membersA||[]),...(bld.membersB||[])];
  if(all.find(m=>m.name===name))return;
  const pObj=players.find(p=>p.name===name)||{};
  const mem={name,univ:pObj.univ||'',race:pObj.race||'',tier:pObj.tier||''};
  if(team==='A')bld.membersA.push(mem);else bld.membersB.push(mem);
  bld.sets=[];render();
}

function proToggleTier(t){
  const bld=BLD['pro'];if(!bld)return;
  if(!bld.tierFilters)bld.tierFilters=[];
  const idx=bld.tierFilters.indexOf(t);
  if(idx>=0)bld.tierFilters.splice(idx,1);else bld.tierFilters.push(t);
  bld.membersA=[];bld.membersB=[];bld.sets=[];render();
}

function proFilterPlayers(team){
  const univSel=document.getElementById(`pro-${team.toLowerCase()}-univ`);
  const playerSel=document.getElementById(`pro-${team.toLowerCase()}-player`);
  if(!univSel||!playerSel)return;
  const univ=univSel.value;
  const bld=BLD['pro']||{};const tf=(bld.tierFilters||[]);
  // 티어 필터 적용 (다중선택: 비어있으면 전체)
  const mems=univ?players.filter(p=>p.univ===univ&&p.gender==='M'&&(tf.length===0||tf.includes(p.tier))):[];
  playerSel.innerHTML=mems.length?`<option value="">멤버 선택</option>`+mems.map(p=>`<option value="${p.name}">${p.name} [${p.tier||'-'}/${p.race||'-'}]</option>`).join(''):`<option value="">멤버 없음</option>`;
}

function proAddMember(team){
  const univSel=document.getElementById(`pro-${team.toLowerCase()}-univ`);
  const playerSel=document.getElementById(`pro-${team.toLowerCase()}-player`);
  if(!univSel||!playerSel)return;
  const univ=univSel.value;const name=playerSel.value;
  if(!name)return alert('멤버를 선택하세요.');
  const arr=team==='A'?BLD['pro'].membersA:BLD['pro'].membersB;
  if(arr.find(m=>m.name===name))return alert('이미 추가됨');
  const pObj=players.find(p=>p.name===name)||{};
  arr.push({name,univ,race:pObj.race||'',tier:pObj.tier||''});BLD['pro'].sets=[];render();
}

function proRankHTML(){
  // 선수별 프로리그 승/패 집계
  const pStats={};
  proM.forEach(m=>{
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wName=g.winner==='A'?g.playerA:g.playerB;
        const lName=g.winner==='A'?g.playerB:g.playerA;
        if(!pStats[wName])pStats[wName]={w:0,l:0};
        if(!pStats[lName])pStats[lName]={w:0,l:0};
        pStats[wName].w++;
        pStats[lName].l++;
      });
    });
  });
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['pro']||'rate';
  const sorted=Object.entries(pStats)
    .map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l===0?0:Math.round(s.w/(s.w+s.l)*100)}))
    .filter(p=>p.total>0)
    .sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏅 프로 순위</div>
  <div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><span style="font-size:11px;font-weight:700;color:var(--text3)">정렬:</span><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['pro']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['pro']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['pro']='l';render()">패순</button></div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">선수</th><th style="text-align:left">대학</th><th>티어</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
  if(!sorted.length)h+=`<tr><td colspan="7" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  sorted.forEach((p,i)=>{
    const pObj=players.find(x=>x.name===p.name)||{};
    const col=gc(pObj.univ);
    let rnkHTML;
    if(i===0)rnkHTML=`<span class="rk1">1등</span>`;
    else if(i===1)rnkHTML=`<span class="rk2">2등</span>`;
    else if(i===2)rnkHTML=`<span class="rk3">3등</span>`;
    else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    h+=`<tr>
      <td style="text-align:left">${rnkHTML}</td>
      <td style="font-weight:700;cursor:pointer;color:var(--blue);text-align:left" onclick="openPlayerModal('${p.name}')"><span style="display:inline-flex;align-items:center;gap:6px">${getPlayerPhotoHTML(p.name,'32px')}${p.name}${getStatusIconHTML(p.name)}</span></td>
      <td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${pObj.univ||''}')">${pObj.univ||'-'}</span></td>
      <td style="text-align:center">${pObj.tier?getTierBadge(pObj.tier):'-'}</td>
      <td class="wt" style="font-size:15px;font-weight:800">${p.w}</td>
      <td class="lt" style="font-size:15px;font-weight:800">${p.l}</td>
      <td class="${p.rate>=50?'wt':'lt'}" style="font-weight:800">${p.rate}%</td>
    </tr>`;
  });
  return h+`</tbody></table>`;
}

/* ══════════════════════════════════════
   끝장전 공유카드
══════════════════════════════════════ */
function openGJShareCard(p1, p2, p1wins, p2wins, date, winner) {
  _shareMode = 'match';
  openShareCardModal();
  setTimeout(() => renderGJShareCard(p1, p2, p1wins, p2wins, date, winner), 80);
}

function renderGJShareCard(p1, p2, p1wins, p2wins, date, winner) {
  const card = document.getElementById('share-card');
  if (!card) return;
  const pp1 = players.find(x => x.name === p1) || {};
  const pp2 = players.find(x => x.name === p2) || {};
  const col1 = gc(pp1.univ || '');
  const col2 = gc(pp2.univ || '');
  const winnerCol = p1 === winner ? col1 : p2 === winner ? col2 : '#475569';

  // 해당 세션 게임 목록 gjM에서 필터링
  const pair = [p1, p2].sort();
  const games = gjM.filter(m => {
    const mp = [m.wName, m.lName].sort();
    return (m.d||'') === date && mp[0] === pair[0] && mp[1] === pair[1];
  });

  const WC = '#111';
  const LC = '#94a3b8';

  const raceLabel = r => r==='T'?'테란':r==='Z'?'저그':r==='P'?'프로토스':'';
  const ct = t => t ? t.replace(/티어$/,'') : '';
  const playerInfoBlock = (name, pObj, isWinner, side) => {
    const photo = getPlayerPhotoHTML(name, '64px', `border-radius:50%;border:3px solid ${isWinner?'#a855f7':'#e9d5ff'};box-shadow:${isWinner?'0 4px 16px rgba(168,85,247,.45)':'0 2px 8px rgba(0,0,0,.07)'};${!isWinner&&winner?'opacity:.4;filter:grayscale(.5)':''}`);
    const race = raceLabel(pObj.race||'');
    const tier = pObj.tier ? `<span style="background:${_TIER_BG[pObj.tier]||'#64748b'};color:${_TIER_TEXT[pObj.tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${ct(pObj.tier)}</span>` : '';
    const raceSpan = race ? `<span style="font-size:10px;color:#94a3b8">${race}</span>` : '';
    const isRight = side === 'right';
    const badges = isRight ? `${raceSpan}${tier}` : `${tier}${raceSpan}`;
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:${isRight?'flex-end':'flex-start'};gap:6px;min-width:0">
      <div style="flex-shrink:0;position:relative">
        ${photo}
        ${isWinner&&winner?`<div style="position:absolute;bottom:-2px;${isRight?'left:-2px':'right:-2px'};font-size:13px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.2))">🏆</div>`:''}
      </div>
      <div style="text-align:${isRight?'right':'left'};width:100%;min-width:0">
        <div style="font-size:13px;font-weight:${isWinner?'800':'500'};color:${isWinner?WC:LC};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
        <div style="display:flex;align-items:center;justify-content:${isRight?'flex-end':'flex-start'};gap:4px;flex-wrap:wrap;margin-top:3px">${badges}</div>
      </div>
    </div>`;
  };

  const gameRows = games.map((m, gi) => {
    const p1win = m.wName === p1;
    const p1Photo = getPlayerPhotoHTML(p1, '16px', `flex-shrink:0;border-radius:50%;${!p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const p2Photo = getPlayerPhotoHTML(p2, '16px', `flex-shrink:0;border-radius:50%;${p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const mapTxt = m.map && m.map !== '-' ? `<span style="color:#94a3b8;font-size:9px;margin-left:2px">📍${m.map}</span>` : '';
    return `<div style="display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:8px;background:${p1win?'rgba(168,85,247,.08)':'rgba(255,255,255,.5)'};margin-bottom:3px">
      <span style="font-size:9px;color:#a78bfa;min-width:26px;font-weight:700">${gi+1}G</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1;justify-content:flex-end">
        ${p1Photo}<span style="font-size:11px;font-weight:${p1win?'700':'400'};color:${p1win?WC:LC}">${p1}</span>
      </span>
      <span style="font-size:9px;color:#ddd6fe;flex-shrink:0">vs</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1">
        ${p2Photo}<span style="font-size:11px;font-weight:${p1win?'400':'700'};color:${p1win?LC:WC}">${p2}</span>
      </span>
      ${mapTxt}
    </div>`;
  }).join('');

  card.innerHTML = `<div style="background:linear-gradient(135deg,#f0f7ff 0%,#fdf4ff 50%,#fff7ed 100%);border-radius:22px;padding:20px 18px;font-family:'Noto Sans KR',sans-serif;color:#111;overflow:hidden;position:relative;box-shadow:0 8px 40px rgba(99,102,241,.15)">
    <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#6366f1,#a855f7,#ec4899);border-radius:22px 22px 0 0"></div>
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:linear-gradient(135deg,#a855f720,#ec489910);pointer-events:none"></div>
    <div style="position:absolute;bottom:-30px;left:-30px;width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#6366f115,#38bdf810);pointer-events:none"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;margin-top:4px">
      <div style="font-size:11px;font-weight:800;color:#7c3aed;background:linear-gradient(90deg,#ede9fe,#fae8ff);padding:4px 12px;border-radius:20px;border:1.5px solid #c4b5fd">⚔️ 끝장전</div>
      <div style="font-size:10px;color:#a78bfa;font-weight:600">${date||''}</div>
    </div>
    <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:${games.length?'14':'0'}px">
      ${playerInfoBlock(p1, pp1, p1===winner, 'left')}
      <div style="text-align:center;flex-shrink:0;padding:10px 2px 0">
        <div style="font-size:40px;font-weight:900;line-height:1;letter-spacing:-2px">
          <span style="color:${p1===winner?'#7c3aed':'#c4b5fd'}">${p1wins}</span>
          <span style="color:#ddd6fe;font-size:22px;margin:0 1px">:</span>
          <span style="color:${p2===winner?'#7c3aed':'#c4b5fd'}">${p2wins}</span>
        </div>
        ${winner?`<div style="font-size:8px;background:linear-gradient(90deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;margin-top:5px;letter-spacing:1px">WIN</div>`:''}
      </div>
      ${playerInfoBlock(p2, pp2, p2===winner, 'right')}
    </div>
    ${games.length ? `<div style="background:rgba(255,255,255,.7);backdrop-filter:blur(4px);border-radius:14px;padding:10px;border:1px solid rgba(196,181,253,.3)">
      <div style="font-size:9px;color:#a78bfa;font-weight:700;margin-bottom:8px;letter-spacing:.5px">경기 상세</div>
      ${gameRows}
    </div>` : ''}
    <div style="margin-top:12px;text-align:right;font-size:8px;color:#c4b5fd;letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
  </div>`;
}

/* ══════════════════════════════════════
   대학 순위 삭제 (관리자 전용)
══════════════════════════════════════ */
function deleteUnivFromRank(name, mode){
  if(!isLoggedIn) return;
  const label = mode==='univm'?'대학대전':'미니대전';
  if(!confirm(`"${name}" 대학의 모든 ${label} 경기 기록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;
  if(mode==='univm'){
    univM = univM.filter(m=>m.a!==name&&m.b!==name);
  } else {
    miniM = miniM.filter(m=>m.a!==name&&m.b!==name);
  }
  save(); render();
}
