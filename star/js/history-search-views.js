/* history-search-views.js: extracted from history.js */
/* ══════════════════════════════════════
   대전 기록 > 선수별 검색 탭
══════════════════════════════════════ */
function _histPSearchResultsHTML(q){
  const modeBadgeColors={'조별리그':'#2563eb','대회':'#b45309','미니대전':_histModeAccent('mini'),'시빌워':'#db2777','대학대전':'#7c3aed','대학CK':_histModeAccent('ck'),'프로리그':_histModeAccent('pro'),'티어대회':'#f59e0b','끝장전':_histModeAccent('gj'),'개인전':_histModeAccent('ind'),'개인':_histModeAccent('ind')};
  if(!q){
    return`<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">스트리머 이름을 입력하세요</div><div class="empty-state-desc">선수의 최근 기록(p.history)에서 검색합니다</div></div>`;
  }
  const ql=q.toLowerCase();
  const matched=players.filter(p=>p.name.toLowerCase().includes(ql));
  if(!matched.length){
    return`<div class="empty-state"><div class="empty-state-icon">😅</div><div class="empty-state-title">스트리머를 찾을 수 없습니다</div><div class="empty-state-desc">"${q}"와 일치하는 스트리머가 없습니다</div></div>`;
  }
  let h='';
  matched.forEach(p=>{
    const hist=(p.history||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
    // 날짜 필터 적용
    const filteredHist=typeof passDateFilter==='function'?hist.filter(h=>passDateFilter(h.date||'')):hist;
    if(!filteredHist.length)return;
    const col=gc(p.univ)||'#6b7280';
    const wins=filteredHist.filter(hh=>hh.result==='승').length;
    const losses=filteredHist.length-wins;
    const wr=filteredHist.length?Math.round(wins/filteredHist.length*100):0;
    h+=`<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px">
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">
        <span style="width:10px;height:10px;border-radius:50%;background:${col};display:inline-block;flex-shrink:0"></span>
        <span style="font-weight:800;font-size:15px;color:var(--text)">${p.name}</span>
        <span style="font-size:12px;color:var(--gray-l)">${p.univ||''}</span>
        <span style="margin-left:auto;font-size:12px;font-weight:700;color:var(--text3)">${filteredHist.length}게임</span>
        <span style="font-size:12px;font-weight:700;color:#16a34a">${wins}승</span>
        <span style="font-size:12px;font-weight:700;color:#dc2626">${losses}패</span>
        <span style="font-size:12px;padding:2px 8px;border-radius:20px;background:${wr>=50?'#dcfce7':'#fee2e2'};color:${wr>=50?'#16a34a':'#dc2626'};font-weight:800">${wr}%</span>
      </div>
      <div style="overflow-x:auto">
        <table style="margin:0;border:none;border-radius:0;font-size:12px"><thead><tr>
          <th style="white-space:nowrap">날짜</th><th>종류</th><th>결과</th><th>상대</th><th>종족</th><th>맵</th><th>ELO</th>
        </tr></thead><tbody>`;
    filteredHist.forEach(hh=>{
      const isWin=hh.result==='승';
      const mc=modeBadgeColors[hh.mode||'']||'#6b7280';
      const oppP=players.find(x=>x.name===hh.opp);const oppCol=oppP?gc(oppP.univ):'#6b7280';
      const eloStr=hh.eloDelta!=null?`<span style="font-weight:700;font-size:11px;color:${hh.eloDelta>0?'#16a34a':'#dc2626'}">${hh.eloDelta>0?'+':''}${hh.eloDelta}</span>`:'-';
      h+=`<tr style="background:${isWin?'#f0fdf4':'#fef2f2'}10">
        <td style="color:var(--text3);font-size:12px;font-weight:600;white-space:nowrap">${hh.date||''}</td>
        <td><span style="background:${mc};color:#fff;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap">${hh.mode||''}</span></td>
        <td>${isWin?`<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">WIN</span>`:`<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">LOSE</span>`}</td>
        <td style="cursor:pointer;font-weight:700" onclick="openPlayerModal('${(hh.opp||'').replace(/'/g,"\\'")}')"><span style="display:inline-flex;align-items:center;gap:3px"><span style="width:10px;height:10px;border-radius:3px;background:${oppCol};display:inline-block;flex-shrink:0"></span><span style="color:var(--blue)">${hh.opp||''}</span></span></td>
        <td><span class="rbadge r${hh.oppRace}" style="font-size:10px">${hh.oppRace||''}</span></td>
        <td style="color:var(--gray-l);font-size:11px">${hh.map&&hh.map!=='-'?hh.map:''}</td>
        <td>${eloStr}</td>
      </tr>`;
    });
    h+=`</tbody></table></div></div>`;
  });
  return h||`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">경기 기록이 없습니다</div></div>`;
}

function _psearchUpdate(val){
  window._histPSearchQ=val;
  const r=document.getElementById('hist-psearch-results');
  if(r) r.innerHTML=_histPSearchResultsHTML(val.trim());
}

/* ══════════════════════════════════════
   대학 전력 비교
══════════════════════════════════════ */
var _univCompA = '', _univCompB = '';

function histUnivCompHTML(){
  const allU = getAllUnivs().filter(u=>!u.hidden||isLoggedIn).filter(u=>u.name!=='무소속');
  // 처음 진입 시 자동으로 첫 두 대학 선택
  if(!_univCompA && allU.length>=1) _univCompA = allU[0].name;
  if(!_univCompB && allU.length>=2) _univCompB = allU[1].name;
  const uOpts = name => `<option value="">— 대학 선택 —</option>`
    + allU.map(u=>`<option value="${u.name}"${u.name===name?' selected':''}>${u.name}</option>`).join('');

  // 선택된 대학 비교 카드
  function univStats(univName){
    if(!univName) return null;
    const col = gc(univName);
    const members = players.filter(p=>p.univ===univName&&!p.retired);
    const activeM = members.filter(p=>(p.win+p.loss)>0);
    const avgElo = activeM.length ? Math.round(activeM.reduce((s,p)=>s+(p.elo||ELO_DEFAULT),0)/activeM.length) : ELO_DEFAULT;
    const totalW = members.reduce((s,p)=>s+(p.win||0),0);
    const totalL = members.reduce((s,p)=>s+(p.loss||0),0);
    const wr = (totalW+totalL) ? Math.round(totalW/(totalW+totalL)*100) : 0;
    const ace = [...members].sort((a,b)=>(b.points||0)-(a.points||0))[0];
    // 전체 팀전 전적 (미니/대학대전/CK/프로)
    const _allTeamArrs = [
      {arr:miniM, label:'미니'},
      {arr:univM, label:'대학대전'},
      {arr:ckM,   label:'CK', isCK:true},
      {arr:proM,  label:'프로', isCK:true},
    ];
    let mW=0,mL=0;
    _allTeamArrs.forEach(({arr,isCK})=>{
      (arr||[]).forEach(m=>{
        if(m.sa==null||m.sb==null) return;
        const myA = isCK
          ? (m.teamAMembers||[]).some(x=>x.univ===univName)
          : m.a===univName;
        const myB = isCK
          ? (m.teamBMembers||[]).some(x=>x.univ===univName)
          : m.b===univName;
        if(myA&&m.sa>m.sb) mW++;
        else if(myB&&m.sb>m.sa) mW++;
        else if(myA&&m.sa<m.sb) mL++;
        else if(myB&&m.sb<m.sa) mL++;
      });
    });
    // 직접 대결 (전체 팀전)
    let vsW=0,vsL=0;
    if(_univCompA&&_univCompB){
      const opp=univName===_univCompA?_univCompB:_univCompA;
      _allTeamArrs.forEach(({arr,isCK})=>{
        (arr||[]).filter(m=>m.sa!=null).forEach(m=>{
          const myA=isCK?(m.teamAMembers||[]).some(x=>x.univ===univName):m.a===univName;
          const myB=isCK?(m.teamBMembers||[]).some(x=>x.univ===univName):m.b===univName;
          const oppA=isCK?(m.teamAMembers||[]).some(x=>x.univ===opp):m.a===opp;
          const oppB=isCK?(m.teamBMembers||[]).some(x=>x.univ===opp):m.b===opp;
          const hasOpp=oppA||oppB;
          if(!hasOpp) return;
          const myWin=(myA&&m.sa>m.sb)||(myB&&m.sb>m.sa);
          const myLoss=(myA&&m.sa<m.sb)||(myB&&m.sb<m.sa);
          if(myWin)vsW++; else if(myLoss)vsL++;
        });
      });
    }
    return {col,members,activeM,avgElo,totalW,totalL,wr,ace,mW,mL,vsW,vsL};
  }

  const sA = univStats(_univCompA);
  const sB = univStats(_univCompB);

  function statRow(label,va,vb,higherBetter=true){
    const na=parseFloat(va),nb=parseFloat(vb);
    const aWins=!isNaN(na)&&!isNaN(nb)&&(higherBetter?na>nb:na<nb);
    const bWins=!isNaN(na)&&!isNaN(nb)&&(higherBetter?nb>na:nb<na);
    const ca=sA?sA.col:'#2563eb', cb=sB?sB.col:'#dc2626';
    return `<tr>
      <td style="text-align:right;padding:6px 10px;font-weight:${aWins?800:600};color:${aWins?ca:'var(--text)'}">${va}${aWins?` <span style="color:${ca}">◀</span>`:''}</td>
      <td style="text-align:center;padding:6px 8px;color:var(--gray-l);font-size:11px;white-space:nowrap">${label}</td>
      <td style="text-align:left;padding:6px 10px;font-weight:${bWins?800:600};color:${bWins?cb:'var(--text)'}">${bWins?`<span style="color:${cb}">▶</span> `:''}${vb}</td>
    </tr>`;
  }

  return `<div>
    <!-- 선택 UI -->
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px">
      <select onchange="_univCompA=this.value;render()" style="flex:1;min-width:120px;padding:7px 10px;border-radius:8px;border:1.5px solid ${sA?sA.col+'99':'var(--border2)'};font-size:13px;font-weight:700;background:var(--white)">
        ${uOpts(_univCompA)}
      </select>
      <span style="font-weight:900;font-size:16px;color:var(--gray-l)">VS</span>
      <select onchange="_univCompB=this.value;render()" style="flex:1;min-width:120px;padding:7px 10px;border-radius:8px;border:1.5px solid ${sB?sB.col+'99':'var(--border2)'};font-size:13px;font-weight:700;background:var(--white)">
        ${uOpts(_univCompB)}
      </select>
    </div>

    ${(!sA||!sB)?`<div style="text-align:center;padding:40px;color:var(--gray-l)">두 대학을 선택하면 전력을 비교합니다</div>`:`
    <!-- 비교 카드 -->
    <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <!-- A 대학 -->
      <div style="flex:1;min-width:130px;background:${sA.col}18;border:2px solid ${sA.col}44;border-radius:12px;padding:14px;text-align:center">
        <div style="font-weight:900;font-size:16px;color:${sA.col};margin-bottom:4px">${_univCompA}</div>
        <div style="font-size:11px;color:var(--gray-l)">${sA.members.length}명</div>
        ${sA.vsW>sA.vsL?`<div style="margin-top:6px;font-size:10px;font-weight:800;color:${sA.col}">🏆 직접 대결 우세</div>`:''}
      </div>
      <!-- 스코어 -->
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:80px">
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">직접 대결</div>
        <div style="font-size:28px;font-weight:900">
          <span style="color:${sA.vsW>sA.vsL?sA.col:'var(--text3)'}">${sA.vsW}</span>
          <span style="color:var(--gray-l);font-size:18px">:</span>
          <span style="color:${sB.vsW>sB.vsL?sB.col:'var(--text3)'}">${sB.vsW}</span>
        </div>
        <div style="font-size:10px;color:var(--gray-l)">팀전 전체 기준</div>
      </div>
      <!-- B 대학 -->
      <div style="flex:1;min-width:130px;background:${sB.col}18;border:2px solid ${sB.col}44;border-radius:12px;padding:14px;text-align:center">
        <div style="font-weight:900;font-size:16px;color:${sB.col};margin-bottom:4px">${_univCompB}</div>
        <div style="font-size:11px;color:var(--gray-l)">${sB.members.length}명</div>
        ${sB.vsW>sB.vsL?`<div style="margin-top:6px;font-size:10px;font-weight:800;color:${sB.col}">🏆 직접 대결 우세</div>`:''}
      </div>
    </div>

    <!-- 스탯 비교 테이블 -->
    <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:14px">
      <table style="margin:0;border:none;border-radius:0;table-layout:fixed">
        <thead><tr>
          <th style="text-align:right;color:${sA.col};width:40%">${_univCompA}</th>
          <th style="text-align:center;color:var(--gray-l);width:20%">항목</th>
          <th style="text-align:left;color:${sB.col};width:40%">${_univCompB}</th>
        </tr></thead>
        <tbody>
          ${statRow('평균 ELO', sA.avgElo, sB.avgElo)}
          ${statRow('전체 승률', sA.wr+'%', sB.wr+'%')}
          ${statRow('전체 승', sA.totalW, sB.totalW)}
          ${statRow('전체 패', sA.totalL, sB.totalL, false)}
          ${statRow('팀전 승(전체)', sA.mW, sB.mW)}
          ${statRow('팀전 패(전체)', sA.mL, sB.mL, false)}
          ${statRow('선수 수', sA.members.length, sB.members.length)}
          <tr>
            <td style="text-align:right;padding:6px 10px;cursor:pointer;color:${sA.col};font-weight:700" onclick="cm('univModal');setTimeout(()=>openPlayerModal('${(sA.ace?.name||'').replace(/'/g,"\'")}'),80)">${sA.ace?.name||'-'}</td>
            <td style="text-align:center;padding:6px 8px;color:var(--gray-l);font-size:11px">에이스</td>
            <td style="text-align:left;padding:6px 10px;cursor:pointer;color:${sB.col};font-weight:700" onclick="cm('univModal');setTimeout(()=>openPlayerModal('${(sB.ace?.name||'').replace(/'/g,"\'")}'),80)">${sB.ace?.name||'-'}</td>
          </tr>
        </tbody>
      </table>
    </div>`}
  </div>`;
}

function histPlayerSearchHTML(){
  const q=(window._histPSearchQ||'').trim();
  return`<div style="margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input type="text" id="hist-psearch-input" placeholder="🔍 스트리머 이름 입력..." value="${q.replace(/"/g,'&quot;')}"
        oninput="_psearchUpdate(this.value)"
        style="flex:1;min-width:160px;max-width:280px;padding:7px 12px;border:1.5px solid var(--blue);border-radius:8px;font-size:13px;font-weight:600;outline:none" autofocus>
      ${q?`<button onclick="window._histPSearchQ='';document.getElementById('hist-psearch-input').value='';document.getElementById('hist-psearch-results').innerHTML=_histPSearchResultsHTML('')" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:18px;line-height:1;padding:0 2px">✕</button>`:''}
    </div>
  </div>
  <div id="hist-psearch-results">${_histPSearchResultsHTML(q)}</div>`;
}

// tourneys에서 완료된 모든 경기를 flat하게 추출
function getTourneyMatches(){
  const result=[];
  if(!Array.isArray(tourneys))return result;
  (tourneys||[]).forEach(tn=>{
    // 조별리그 경기
    (tn.groups||[]).forEach((grp,gi)=>{
      const gl='ABCDEFGHIJ'[gi]||String(gi);
      const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach((m,mi)=>{
        if(!m.a||!m.b)return;
        if(m.sa==null||m.sb==null)return;
        result.push({
          _src:'tour',_tnId:tn.id,_gi:gi,_mi:mi,
          d:m.d||'',n:tn.name,a:m.a,b:m.b,
          sa:m.sa,sb:m.sb,sets:m.sets||[],
          grpName:grp.name,grpLetter:gl,grpColor:col
        });
      });
    });
    // 브라켓 경기 (matchDetails)
    const br=tn.bracket||{};
    Object.entries(br.matchDetails||{}).forEach(([key,m])=>{
      if(!m||!m.a||!m.b||m.sa==null||m.sb==null)return;
      result.push({
        _src:'tour_bracket',_tnId:tn.id,_bktKey:key,
        d:m.d||'',n:tn.name,a:m.a,b:m.b,
        sa:m.sa,sb:m.sb,sets:m.sets||[],
        grpName:'토너먼트',grpLetter:'T',grpColor:'#2563eb'
      });
    });
    // 브라켓 winner-only 경기 (matchDetails에 a/b 없거나 없는 키)
    Object.entries(br.winners||{}).forEach(([key,winner])=>{
      if(!winner)return;
      const det=(br.matchDetails||{})[key];
      if(det&&det.a&&det.b&&det.sa!=null&&det.sb!=null)return; // 이미 위에서 처리
      const parts=key.split('-');
      const r=parseInt(parts[0]),mi=parseInt(parts[1]);
      const a=(det&&det.a)||((br.slots||{})[`${r}-${mi}-a`])||(r>0?((br.winners||{})[`${r-1}-${mi*2}`]||''):'');
      const b=(det&&det.b)||((br.slots||{})[`${r}-${mi}-b`])||(r>0?((br.winners||{})[`${r-1}-${mi*2+1}`]||''):'');
      if(!a||!b)return;
      result.push({
        _src:'tour_bracket',_tnId:tn.id,_bktKey:key,
        d:(det&&det.d)||'',n:tn.name,a,b,
        sa:winner===a?1:0,sb:winner===b?1:0,sets:[],
        grpName:'토너먼트',grpLetter:'T',grpColor:'#2563eb'
      });
    });
    // 수동 추가 브라켓 경기 (manualMatches)
    (br.manualMatches||[]).forEach((m,idx)=>{
      if(!m||!m.a||!m.b||m.sa==null||m.sb==null)return;
      result.push({
        _src:'tour_manual',_tnId:tn.id,_manualIdx:idx,
        d:m.d||'',n:tn.name,a:m.a,b:m.b,
        sa:m.sa,sb:m.sb,sets:m.sets||[],
        grpName:m.rndLabel||'토너먼트',grpLetter:'T',grpColor:'#7c3aed'
      });
    });
  });
  return result;
}
function compSummaryListHTML(context){
  // tourneys 경기 + comps 배열 모두 합산
  const tourItems=getTourneyMatches();
  const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const allItems=[...tourItems,...compItems];
  if(!allItems.length)return`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  // 날짜 필터 적용 후 정렬
  const filtered=allItems.filter(m=>
    typeof passDateFilter!=='function'||passDateFilter(m.d||'')
  );
  filtered.sort((a,b)=>recSortDir==='asc'
    ?(a.d||'').localeCompare(b.d||'')
    :(b.d||'').localeCompare(a.d||''));
  const sortBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
    <span style="font-size:11px;color:var(--text3)"></span>
    <button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    
  </div>`;
  if(!filtered.length)return sortBar+`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
  let h=sortBar;
  filtered.forEach((m,listIdx)=>{
    const a=m.a||m.hostUniv||m.u||'';const b=m.b||'';
    const ca=gc(a);const cb=gc(b);
    const aWin=m.sa>m.sb;const bWin=m.sb>m.sa;
    const key=`${context}-comp-${listIdx}`;
    const rIdx=(m._src==='comps')?m._origIdx:-1;
    // GROUP 배지 (tourneys 경기)
    const grpBadge=m._src==='tour'
      ?`<span style="background:${m.grpColor};color:#fff;font-size:10px;font-weight:700;padding:1px 8px;border-radius:4px;margin-left:6px">GROUP ${m.grpLetter}</span>`:'';
    h+=`<div class="rec-summary rec-mode-comp" data-rec-mode="comp" style="--rec-mode-col:#3b82f6;--rec-mode-rgb:59,130,246">
      <div class="rec-sum-header">
        <span style="color:var(--text3);font-size:12px;font-weight:600;min-width:72px">${m.d||''}</span>
        <span style="font-weight:700;font-size:13px">🎖️ ${m.n||'대회'}${grpBadge}</span>
        <div class="rec-sum-vs">
          ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>`:''}
          ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세보기">
            <span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa||0}</span>
            <span style="color:var(--gray-l);font-size:14px">:</span>
            <span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb||0}</span>
          </div>`:''}
          ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>`:''}
          ${(a&&b)?`<span style="font-size:12px;font-weight:700;color:${aWin?ca:bWin?cb:'#888'}">
            ${aWin?'▶ '+a+' 승':bWin?'▶ '+b+' 승':'무승부'}
          </span>`:''}
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:4px;flex-shrink:0" class="no-export">
          <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
            onclick="openRecActionMenu(event,{
              _btnEl:this,
              a:'${a.replace(/'/g,"\\'")}',
              sa:${m.sa||0},
              b:'${b.replace(/'/g,"\\'")}',
              sb:${m.sb||0},
              d:'${m.d||''}',
              mode:'comp',
              idx:${rIdx>=0?rIdx:'null'},
              key:'${key}',
              canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
              canEdit:${((rIdx>=0 && isLoggedIn && !isSubAdmin) || (m._src==='tour' && isLoggedIn && !isSubAdmin))?'true':'false'},
              canDel:${(rIdx>=0 && isLoggedIn && !isSubAdmin)?'true':'false'},
              canMove:false,
              editKind:'${m._src==='tour'?'league':''}',
              tnId:'${m._tnId||''}',
              gi:${m._gi ?? 'null'},
              mi:${m._mi ?? 'null'}
            })">⋯</button>
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,rIdx>=0?{...m,_editRef:'comp:'+rIdx}:m,'comp',a,b,ca,cb,aWin,bWin, rIdx)}
      </div>
    </div>`;
  });
  return h||`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
}
// 공유카드용 - context별 캐시된 filtered 배열에서 m 객체 반환 헬퍼
window._compListCache={};
function _getCompMatchObj(listIdx,context){
  // 캐시 없거나 데이터 변경 시 재생성
  if(!window._compListCache||!window._compListCache[context]){
    if(!window._compListCache)window._compListCache={};
    const tourItems=getTourneyMatches();
    const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
    const all=[...tourItems,...compItems].filter(m=>typeof passDateFilter!=='function'||passDateFilter(m.d||''));
    all.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
    window._compListCache[context]=all;
  }
  return window._compListCache[context][listIdx]||null;
}

