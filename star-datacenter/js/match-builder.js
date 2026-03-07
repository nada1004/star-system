/* ══════════════════════════════════════
   미니대전
══════════════════════════════════════ */
function rMini(C,T){
  T.innerText='⚡ 미니대전';
  if(!isLoggedIn && miniSub==='input') miniSub='records';
  const subOpts=[{id:'input',lbl:'📝 경기 입력',fn:`miniSub='input';render()`},{id:'rank',lbl:'🏆 순위',fn:`miniSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`miniSub='records';openDetails={};render()`}];
  let h=stabs(miniSub,subOpts);
  if(miniSub!=='input' && typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('mini');
  }
  if(miniSub==='input'&&isLoggedIn){if(!BLD['mini'])BLD['mini']={date:'',title:'',teamA:'',teamB:'',sets:[]};h+=`<div class="match-builder"><h3>⚡ 미니대전 입력</h3><div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openMiniPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 결과 붙여넣기 일괄 입력</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">텍스트/이미지 OCR 지원</span></div>${setBuilderHTML(BLD['mini'],'mini')}</div>`;}
  else if(miniSub==='rank'){h+=miniRankHTML();}
  else{h+=recSummaryListHTML(miniM,'mini','tab');}
  C.innerHTML=h;
}

function miniRankHTML(){
  const sc={};
  getAllUnivs().forEach(u=>{sc[u.name]={w:0,l:0,pts:0,total:0};});
  miniM.forEach(m=>{
    if(!sc[m.a])sc[m.a]={w:0,l:0,pts:0,total:0};if(!sc[m.b])sc[m.b]={w:0,l:0,pts:0,total:0};
    sc[m.a].total++;sc[m.b].total++;
    if(m.sa>m.sb){sc[m.a].w++;sc[m.a].pts+=3;sc[m.b].l++;sc[m.b].pts-=3;}
    else if(m.sb>m.sa){sc[m.b].w++;sc[m.b].pts+=3;sc[m.a].l++;sc[m.a].pts-=3;}
  });
  const sorted=Object.entries(sc).filter(([,s])=>s.total>0).sort((a,b)=>b[1].pts-a[1].pts);
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏆 미니대전 대학별 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">대학</th><th>승</th><th>패</th><th>포인트</th></tr></thead><tbody>`;
  if(!sorted.length)h+=`<tr><td colspan="5" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  sorted.forEach(([name,s],i)=>{
    const col=gc(name);let rnkHTML;
    if(i===0) rnkHTML=`<span class="rk1">1등</span>`;else if(i===1) rnkHTML=`<span class="rk2">2등</span>`;else if(i===2) rnkHTML=`<span class="rk3">3등</span>`;else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    h+=`<tr><td style="text-align:left">${rnkHTML}</td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${name}')">${name}</span></td><td class="wt" style="font-size:15px;font-weight:800">${s.w}</td><td class="lt" style="font-size:15px;font-weight:800">${s.l}</td><td class="${pC(s.pts)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">${pS(s.pts)}</td></tr>`;
  });
  return h+`</tbody></table>`;
}

/* ══════════════════════════════════════
   개인전
══════════════════════════════════════ */
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
    h+=`<div class="match-builder"><h3>🎮 개인전 입력</h3>
      <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openIndPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 결과 붙여넣기 일괄 입력</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">텍스트 붙여넣기 지원</span></div>
      <div style="font-size:12px;color:var(--gray-l);padding:16px;text-align:center;border:1.5px dashed var(--border);border-radius:10px">붙여넣기 버튼으로 경기 결과를 일괄 입력하세요</div>
    </div>`;
  } else if(indSub==='rank'){
    h+=indRankHTML();
  } else {
    h+=indRecordsHTML();
  }
  C.innerHTML=h;
}

function indRankHTML(){
  const sc={};
  players.forEach(p=>{sc[p.name]={w:0,l:0};});
  indM.forEach(m=>{
    if(!sc[m.wName])sc[m.wName]={w:0,l:0};
    if(!sc[m.lName])sc[m.lName]={w:0,l:0};
    sc[m.wName].w++; sc[m.lName].l++;
  });
  const sorted=Object.entries(sc).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l));
  if(!sorted.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  let h=`<table><thead><tr><th>순위</th><th style="text-align:left">선수</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
  sorted.forEach(([name,s],i)=>{
    const total=s.w+s.l;const rate=total?Math.round(s.w/total*100):0;
    const p=players.find(x=>x.name===name);
    h+=`<tr><td style="font-weight:900">${i+1}</td><td style="text-align:left"><span style="font-weight:700">${name}</span><span style="font-size:11px;color:var(--gray-l);margin-left:4px">${p?.univ||''}</span></td><td class="wt">${s.w}</td><td class="lt">${s.l}</td><td style="font-weight:700;color:${rate>=50?'#16a34a':'#dc2626'}">${rate}%</td></tr>`;
  });
  return h+`</tbody></table>`;
}

function indRecordsHTML(){
  if(!indM.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  const pageSize=getHistPageSize();
  const total=indM.length;
  const totalPages=Math.ceil(total/pageSize);
  if(histPage['ind']>=totalPages) histPage['ind']=Math.max(0,totalPages-1);
  const cur=histPage['ind'];
  const slice=total>pageSize?indM.slice(cur*pageSize,(cur+1)*pageSize):indM;
  let h=`<table><thead><tr><th style="text-align:left">날짜</th><th style="text-align:left">승자</th><th style="text-align:left">패자</th><th style="text-align:left">맵</th>${isLoggedIn?'<th>삭제</th>':''}</tr></thead><tbody>`;
  slice.forEach((m)=>{
    const origIdx=indM.indexOf(m);
    const wp=players.find(x=>x.name===m.wName);const lp=players.find(x=>x.name===m.lName);
    h+=`<tr>
      <td style="font-size:11px;color:var(--gray-l)">${m.d||''}</td>
      <td><span class="wt" style="font-weight:700">${m.wName}</span><span style="font-size:10px;color:var(--gray-l);margin-left:3px">${wp?.univ||''}</span></td>
      <td><span class="lt" style="font-weight:700">${m.lName}</span><span style="font-size:10px;color:var(--gray-l);margin-left:3px">${lp?.univ||''}</span></td>
      <td style="font-size:11px">${m.map && m.map !== '-' ? m.map : ''}</td>
      ${isLoggedIn?`<td><button class="btn btn-r btn-xs" onclick="indM.splice(${origIdx},1);save();render()">삭제</button></td>`:''}
    </tr>`;
  });
  h+=`</tbody></table>`;
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=0;render()" ${cur===0?'disabled':''}>«</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.max(0,${cur}-1);render()" ${cur===0?'disabled':''}>‹</button>`;
    let s=Math.max(0,cur-3),e=Math.min(totalPages-1,s+6);if(e-s<6)s=Math.max(0,e-6);
    for(let p=s;p<=e;p++) h+=`<button class="btn ${p===cur?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['ind']=${p};render()">${p+1}</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.min(${totalPages-1},${cur}+1);render()" ${cur===totalPages-1?'disabled':''}>›</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=${totalPages-1};render()" ${cur===totalPages-1?'disabled':''}>»</button>`;
    h+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}

/* ══════════════════════════════════════
   끝장전
══════════════════════════════════════ */
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
    h+=`<div class="match-builder"><h3>⚔️ 끝장전 입력</h3>
      <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openGJPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 결과 붙여넣기 일괄 입력</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">텍스트 붙여넣기 지원</span></div>
      <div style="font-size:12px;color:var(--gray-l);padding:16px;text-align:center;border:1.5px dashed var(--border);border-radius:10px">붙여넣기 버튼으로 경기 결과를 일괄 입력하세요</div>
    </div>`;
  } else if(gjSub==='rank'){
    h+=gjRankHTML();
  } else {
    h+=gjRecordsHTML();
  }
  C.innerHTML=h;
}

function gjRankHTML(){
  const sc={};
  players.forEach(p=>{sc[p.name]={w:0,l:0};});
  gjM.forEach(m=>{
    if(!sc[m.wName])sc[m.wName]={w:0,l:0};
    if(!sc[m.lName])sc[m.lName]={w:0,l:0};
    sc[m.wName].w++; sc[m.lName].l++;
  });
  const sorted=Object.entries(sc).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l));
  if(!sorted.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  let h=`<table><thead><tr><th>순위</th><th style="text-align:left">선수</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
  sorted.forEach(([name,s],i)=>{
    const total=s.w+s.l;const rate=total?Math.round(s.w/total*100):0;
    const p=players.find(x=>x.name===name);
    h+=`<tr><td style="font-weight:900">${i+1}</td><td style="text-align:left"><span style="font-weight:700">${name}</span><span style="font-size:11px;color:var(--gray-l);margin-left:4px">${p?.univ||''}</span></td><td class="wt">${s.w}</td><td class="lt">${s.l}</td><td style="font-weight:700;color:${rate>=50?'#16a34a':'#dc2626'}">${rate}%</td></tr>`;
  });
  return h+`</tbody></table>`;
}

function gjRecordsHTML(){
  if(!gjM.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  // 세션 그룹화: (날짜, 정렬된 선수쌍) 기준
  const sessions=[];
  const sessionMap=new Map();
  gjM.forEach((m)=>{
    const pair=[m.wName,m.lName].sort();
    const k=`${m.d||''}|${pair[0]}|${pair[1]}`;
    if(!sessionMap.has(k)){
      const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[]};
      sessionMap.set(k,s);sessions.push(s);
    }
    const s=sessionMap.get(k);s.games.push(m);s.ids.push(m._id);
  });
  const pageSize=getHistPageSize();
  const total=sessions.length;
  const totalPages=Math.ceil(total/pageSize);
  if(histPage['gj']>=totalPages) histPage['gj']=Math.max(0,totalPages-1);
  const cur=histPage['gj'];
  const slice=total>pageSize?sessions.slice(cur*pageSize,(cur+1)*pageSize):sessions;
  let h='';
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const delBtn=isLoggedIn?`<button class="btn btn-r btn-xs" style="white-space:nowrap" onclick="gjM=gjM.filter(m=>!${JSON.stringify(s.ids)}.includes(m._id));save();render()">전체삭제</button>`:'';
    const shareBtn=`<button class="btn btn-b btn-xs" style="white-space:nowrap" onclick="event.stopPropagation();openGJShareCard('${s.p1.replace(/'/g,"\\'")}','${s.p2.replace(/'/g,"\\'")}',${p1wins},${p2wins},'${s.d}','${winner.replace(/'/g,"\\'")}')">📷 공유카드</button>`;
    h+=`<details style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden">
      <summary style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;list-style:none;background:var(--bg2)">
        <span style="font-size:11px;color:var(--gray-l);min-width:80px">${s.d}</span>
        <span style="display:inline-flex;align-items:center;gap:4px">${getPlayerPhotoHTML(s.p1,'22px')}<span style="font-weight:700;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${s.p1.replace(/'/g,"\\'")}')">${s.p1}</span><span style="font-size:10px;color:var(--gray-l)">${players.find(x=>x.name===s.p1)?.univ||''}</span></span>
        <span style="font-size:13px;font-weight:900;color:var(--blue)">${p1wins} - ${p2wins}</span>
        <span style="display:inline-flex;align-items:center;gap:4px"><span style="font-weight:700;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${s.p2.replace(/'/g,"\\'")}')">${s.p2}</span><span style="font-size:10px;color:var(--gray-l)">${players.find(x=>x.name===s.p2)?.univ||''}</span>${getPlayerPhotoHTML(s.p2,'22px')}</span>
        ${winner?`<span style="font-size:11px;color:#16a34a;font-weight:700">(${winner} 승)</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${s.games.length}경기</span>
        <span style="margin-left:auto;display:flex;gap:4px">${shareBtn}${delBtn}</span>
      </summary>
      <table style="margin:0;border-radius:0"><thead><tr><th style="text-align:left">경기</th><th style="text-align:left">승자</th><th style="text-align:left">패자</th><th style="text-align:left">맵</th>${isLoggedIn?'<th>관리</th>':''}</tr></thead><tbody>`;
    s.games.forEach((m,gi)=>{
      const origIdx=gjM.findIndex(x=>x._id===m._id);
      h+=`<tr>
        <td style="font-size:11px;color:var(--gray-l)">${gi+1}경기</td>
        <td><span style="font-weight:900;color:#111">${m.wName}</span></td>
        <td><span style="font-weight:400;color:#999">${m.lName}</span></td>
        <td style="font-size:11px">${m.map && m.map !== '-' ? m.map : ''}</td>
        ${isLoggedIn?`<td style="display:flex;gap:4px"><button class="btn btn-o btn-xs" onclick="openRE('gj',${origIdx})">수정</button><button class="btn btn-r btn-xs" onclick="gjM.splice(${origIdx},1);save();render()">삭제</button></td>`:''}
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
  const subOpts=[{id:'input',lbl:'📝 경기 입력',fn:`ckSub='input';render()`},{id:'rank',lbl:'🏆 대학 순위',fn:`ckSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`ckSub='records';openDetails={};render()`}];
  let h=stabs(ckSub,subOpts);
  if(ckSub!=='input' && typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('ck');
  }
  if(ckSub==='input'&&isLoggedIn){if(!BLD['ck'])BLD['ck']={date:'',membersA:[],membersB:[],sets:[]};h+=buildCKInputHTML();}
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
  const uS={};
  getAllUnivs().forEach(u=>{uS[u.name]={w:0,l:0,pts:0,total:0};});
  ckM.forEach(m=>{
    if(m.univWins)Object.entries(m.univWins).forEach(([u,c])=>{if(!uS[u])uS[u]={w:0,l:0,pts:0,total:0};uS[u].w+=c;uS[u].pts+=c*3;uS[u].total+=c;});
    if(m.univLosses)Object.entries(m.univLosses).forEach(([u,c])=>{if(!uS[u])uS[u]={w:0,l:0,pts:0,total:0};uS[u].l+=c;uS[u].pts-=c*3;uS[u].total+=c;});
  });
  const sorted=Object.entries(uS).filter(([,s])=>s.total>0).sort((a,b)=>b[1].pts-a[1].pts);
  let h=`<div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">※ 대학 순위만 표시 (소속 멤버 개별 표시 없음)</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">대학</th><th>게임 승</th><th>게임 패</th><th>포인트</th></tr></thead><tbody>`;
  if(!sorted.length)h+=`<tr><td colspan="5" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  sorted.forEach(([name,s],i)=>{
    const col=gc(name);let rnkHTML;
    if(i===0) rnkHTML=`<span class="rk1">1등</span>`;else if(i===1) rnkHTML=`<span class="rk2">2등</span>`;else if(i===2) rnkHTML=`<span class="rk3">3등</span>`;else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    h+=`<tr><td style="text-align:left">${rnkHTML}</td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${name}')">${name}</span></td><td class="wt" style="font-size:15px;font-weight:800">${s.w}</td><td class="lt" style="font-size:15px;font-weight:800">${s.l}</td><td class="${pC(s.pts)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">${pS(s.pts)}</td></tr>`;
  });
  return h+`</tbody></table>`;
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
  const sorted=Object.entries(sc).filter(([,s])=>s.total>0).sort((a,b)=>b[1].pts-a[1].pts);
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏆 대학대전 대학별 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">대학</th><th>승</th><th>패</th><th>포인트</th></tr></thead><tbody>`;
  if(!sorted.length)h+=`<tr><td colspan="5" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  sorted.forEach(([name,s],i)=>{
    const col=gc(name);let rnkHTML;
    if(i===0) rnkHTML=`<span class="rk1">1등</span>`;else if(i===1) rnkHTML=`<span class="rk2">2등</span>`;else if(i===2) rnkHTML=`<span class="rk3">3등</span>`;else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    h+=`<tr><td style="text-align:left">${rnkHTML}</td><td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${name}')">${name}</span></td><td class="wt" style="font-size:15px;font-weight:800">${s.w}</td><td class="lt" style="font-size:15px;font-weight:800">${s.l}</td><td class="${pC(s.pts)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">${pS(s.pts)}</td></tr>`;
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
  const sorted=Object.entries(pStats)
    .map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l===0?0:Math.round(s.w/(s.w+s.l)*100)}))
    .filter(p=>p.total>0)
    .sort((a,b)=>b.rate-a.rate||b.w-a.w||a.l-b.l);
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏅 프로 순위</div>
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

  const WC = '#111';   // 승자: 볼드 검정
  const LC = '#aaa';   // 패자: 연한 회색

  const playerBlock = (name, pObj, wins, isWinner, side) => {
    const photoSize = '72px';
    const loserFilter = !isWinner && winner ? ';filter:blur(1px) grayscale(.2);opacity:.55' : '';
    const photo = getPlayerPhotoHTML(name, photoSize, `border:3px solid ${isWinner ? winnerCol : '#e2e8f0'};box-shadow:${isWinner ? `0 0 0 2px ${winnerCol}66` : 'none'}${loserFilter}`);
    const align = side === 'left' ? 'flex-end' : 'flex-start';
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:${align};gap:6px;min-width:0">
      ${photo}
      <div style="font-size:17px;font-weight:${isWinner?'900':'400'};color:${isWinner?WC:LC};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px">${name}</div>
      <div style="font-size:11px;color:#888">${pObj.univ||''}</div>
      <div style="font-size:50px;font-weight:900;color:${isWinner?WC:LC};line-height:1">${wins}</div>
      ${isWinner?`<span style="background:${winnerCol}18;border:1px solid ${winnerCol}55;color:${winnerCol};font-size:9px;font-weight:800;padding:2px 10px;border-radius:20px">🏆 승리</span>`:`<div style="font-size:10px;color:${LC};font-weight:400">패배</div>`}
    </div>`;
  };

  const gameRows = games.map((m, gi) => {
    const wIsP1 = m.wName === p1;
    const wPhoto = getPlayerPhotoHTML(m.wName, '18px', 'flex-shrink:0');
    const lPhoto = getPlayerPhotoHTML(m.lName, '18px', 'flex-shrink:0;filter:blur(1px) grayscale(.2);opacity:.55');
    const mapTxt = m.map && m.map !== '-' ? `<span style="color:#aaa;font-size:9px;margin-left:4px">📍${m.map}</span>` : '';
    return `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;background:#f8fafc;margin-bottom:4px">
      <span style="font-size:9px;color:#bbb;min-width:32px">${gi+1}경기</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1;justify-content:flex-end">
        ${wPhoto}<span style="font-size:11px;font-weight:900;color:${WC}">${m.wName}</span>
      </span>
      <span style="font-size:10px;color:#ccc;flex-shrink:0">승</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1">
        ${lPhoto}<span style="font-size:11px;color:${LC}">${m.lName}</span>
      </span>
      ${mapTxt}
    </div>`;
  }).join('');

  card.innerHTML = `<div style="background:#fff;border:1px solid #e2e8f0;padding:24px;color:#111;position:relative;overflow:hidden;border-radius:18px;font-family:'Noto Sans KR',sans-serif">
    <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:${winnerCol}0d;pointer-events:none"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-size:13px;font-weight:800;color:${winnerCol};background:${winnerCol}15;padding:2px 12px;border-radius:20px">⚔️ 끝장전</div>
      <div style="font-size:11px;color:#999">${date||''}</div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:${games.length?'16':'0'}px">
      ${playerBlock(p1, pp1, p1wins, p1===winner, 'left')}
      <div style="font-size:22px;font-weight:900;color:#ccc;flex-shrink:0;text-align:center">VS</div>
      ${playerBlock(p2, pp2, p2wins, p2===winner, 'right')}
    </div>
    ${games.length ? `<div style="border-top:1px solid #e2e8f0;padding-top:12px">
      <div style="font-size:10px;color:#999;font-weight:700;margin-bottom:6px;letter-spacing:.5px">경기 상세</div>
      ${gameRows}
    </div>` : ''}
    <div style="margin-top:14px;text-align:right;font-size:9px;color:#ccc;letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
  </div>`;
}
