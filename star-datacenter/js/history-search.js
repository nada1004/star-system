/* ══════════════════════════════════════
   대전 기록 > 선수별 검색 탭
══════════════════════════════════════ */
function _histPSearchModeLabel(hh){
  const st=String(hh?._sourceType||'').trim();
  const mode=String(hh?.mode||'').trim();
  const round=String(hh?._stageRound||hh?._sourceRound||'').trim();
  if(st==='proTourGrp') return '프로리그대회 조별리그';
  if(st==='proTourStage') return round ? `프로리그대회 토너먼트(${round})` : '프로리그대회 토너먼트';
  if(st==='proTourGj') return '프로리그대회 끝장전';
  if(st==='tourGrp') return mode==='티어대회' ? '티어대회 조별리그' : '일반대회 조별리그';
  if(st==='tourBkt') return mode==='티어대회' ? '티어대회 토너먼트' : '일반대회 토너먼트';
  if(st==='tourNormal') return '일반대회 일반경기';
  if(mode==='대회(일반경기)') return '일반대회 일반경기';
  if(mode==='조별리그') return '일반대회 조별리그';
  if(mode==='대회') return '일반대회 토너먼트';
  return mode;
}

function _histPSearchModeColor(label){
  const s=String(label||'').trim();
  if(!s) return '#6b7280';
  if(s.indexOf('프로리그대회 조별리그')!==-1) return '#0f766e';
  if(s.indexOf('프로리그대회 토너먼트')!==-1) return '#0f766e';
  if(s.indexOf('프로리그대회 끝장전')!==-1) return '#7c3aed';
  if(s.indexOf('일반대회 조별리그')!==-1) return '#2563eb';
  if(s.indexOf('일반대회 토너먼트')!==-1) return '#7c3aed';
  if(s.indexOf('일반대회 일반경기')!==-1) return '#b45309';
  if(s.indexOf('티어대회 조별리그')!==-1 || s.indexOf('티어대회 토너먼트')!==-1 || s.indexOf('티어대회')!==-1) return '#f59e0b';
  if(s.indexOf('미니대전')!==-1) return '#2563eb';
  if(s.indexOf('시빌워')!==-1) return '#db2777';
  if(s.indexOf('대학대전')!==-1) return '#7c3aed';
  if(s.indexOf('대학CK')!==-1) return '#dc2626';
  if(s.indexOf('프로리그')!==-1) return '#0891b2';
  if(s.indexOf('끝장전')!==-1) return '#8b5cf6';
  if(s.indexOf('개인전')!==-1 || s.indexOf('개인')!==-1) return '#8b5cf6';
  return '#6b7280';
}

function _histPSearchOpponentMeta(hh,p){
  let opp=String(hh?.opp||'').trim();
  let oppP=opp ? players.find(x=>x.name===opp) : null;
  const st=String(hh?._sourceType||'').trim();
  const isTeamSource=(st==='tourNormal' || st==='tourGrp' || st==='tourBkt');
  let kind=(oppP || !isTeamSource) ? 'player' : (opp ? 'team' : 'player');
  if(!opp){
    const a=String(hh?._sourceTeamA||'').trim();
    const b=String(hh?._sourceTeamB||'').trim();
    if(hh?._sourceType==='proTourGrp' || hh?._sourceType==='proTourStage' || hh?._sourceType==='proTourGj'){
      opp = p?.name===a ? b : (p?.name===b ? a : '');
    }else{
      const pu=String(p?.univ||'').trim();
      opp = pu && pu===a ? b : (pu && pu===b ? a : '');
    }
    oppP = opp ? players.find(x=>x.name===opp) : null;
    if(!oppP && opp) kind='team';
  }
  return {
    text: opp || '-',
    clickable: !!oppP,
    race: String(hh?.oppRace||oppP?.race||'').trim(),
    color: oppP ? gc(oppP.univ) : (kind==='team' ? gc(opp||'') : '#6b7280'),
    kind
  };
}

function _histPSearchResultsHTML(q){
  if(!q){
    return`<div class="empty-state"><div class="empty-state-icon"></div><div class="empty-state-title">스트리머 이름을 입력하세요</div><div class="empty-state-desc">선수의 전체 경기 기록에서 검색합니다</div></div>`;
  }
  const ql=q.toLowerCase();
  const matched=players.filter(p=>p.name.toLowerCase().includes(ql));
  if(!matched.length){
    return`<div class="empty-state"><div class="empty-state-icon"></div><div class="empty-state-title">스트리머를 찾을 수 없습니다</div><div class="empty-state-desc">"${q}"와 일치하는 스트리머가 없습니다</div></div>`;
  }
  let h='';
  matched.forEach(p=>{
    const histSource = (typeof _tpHistAllForPlayer === 'function')
      ? _tpHistAllForPlayer(p)
      : (Array.isArray(p.history) ? p.history : []);
    const hist=(histSource||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
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
        <span style="font-size:12px;font-weight:700;color:#dc2626">${wins}승</span>
        <span style="font-size:12px;font-weight:700;color:#2563eb">${losses}패</span>
        <span style="font-size:12px;padding:2px 8px;border-radius:20px;background:${wr>=50?'#dcfce7':'#fee2e2'};color:${wr>=50?'#16a34a':'#dc2626'};font-weight:800">${wr}%</span>
      </div>
      <div style="overflow-x:auto">
        <table style="margin:0;border:none;border-radius:0;font-size:12px"><thead><tr>
          <th style="white-space:nowrap">날짜</th><th>종류</th><th>결과</th><th>상대 선수/팀</th><th>종족</th><th>맵</th><th>ELO</th>
        </tr></thead><tbody>`;
    filteredHist.forEach(hh=>{
      const isWin=hh.result==='승';
      const modeLabel=_histPSearchModeLabel(hh);
      const mc=_histPSearchModeColor(modeLabel);
      const oppMeta=_histPSearchOpponentMeta(hh,p);
      const eloStr=hh.eloDelta!=null?`<span style="font-weight:700;font-size:11px;color:${hh.eloDelta>0?'#16a34a':'#dc2626'}">${hh.eloDelta>0?'+':''}${hh.eloDelta}</span>`:'-';
      const modeTitle=[modeLabel, hh._compName||''].filter(Boolean).join(' · ');
      const oppKindChip=oppMeta.kind==='team'
        ? `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:999px;background:${oppMeta.color}18;border:1px solid ${oppMeta.color}55;color:${oppMeta.color};font-size:10px;font-weight:900;line-height:1">팀</span>`
        : '';
      const oppCellInner=`<span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:${oppMeta.color};display:inline-block;flex-shrink:0"></span><span style="color:${oppMeta.clickable?'var(--blue)':'var(--text)'}">${oppMeta.text}</span>${oppKindChip}</span>`;
      h+=`<tr style="background:${isWin?'#fef2f2':'#eff6ff'}10">
        <td style="color:var(--text3);font-size:12px;font-weight:600;white-space:nowrap">${hh.date||''}</td>
        <td><span title="${modeTitle.replace(/"/g,'&quot;')}" style="background:${mc};color:#fff;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap">${modeLabel||''}</span></td>
        <td>${isWin?`<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">WIN</span>`:`<span style="background:#dbeafe;color:#2563eb;border:1px solid #bfdbfe;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">LOSE</span>`}</td>
        <td title="${oppMeta.kind==='team'?'선수 정보가 없어 상대 팀명으로 표시 중':''}" style="font-weight:700;${oppMeta.clickable?'cursor:pointer':''}" ${oppMeta.clickable?`onclick="openPlayerModal('${oppMeta.text.replace(/'/g,"\\'")}')"`:''}>${oppCellInner}</td>
        <td>${oppMeta.race?`<span class="rbadge r${oppMeta.race}" style="font-size:10px">${oppMeta.race||''}</span>`:`<span style="color:var(--gray-l);font-size:11px">-</span>`}</td>
        <td style="color:var(--gray-l);font-size:11px">${hh.map&&hh.map!=='-'?hh.map:''}</td>
        <td>${eloStr}</td>
      </tr>`;
    });
    h+=`</tbody></table></div></div>`;
  });
  return h||`<div class="empty-state"><div class="empty-state-icon"></div><div class="empty-state-title">경기 기록이 없습니다</div></div>`;
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
    const _mini = (typeof miniM!=='undefined' && Array.isArray(miniM)) ? miniM : (Array.isArray(window.miniM) ? window.miniM : []);
    const _univm = (typeof univM!=='undefined' && Array.isArray(univM)) ? univM : (Array.isArray(window.univM) ? window.univM : []);
    const _ck = (typeof ckM!=='undefined' && Array.isArray(ckM)) ? ckM : (Array.isArray(window.ckM) ? window.ckM : []);
    const _pro = (typeof proM!=='undefined' && Array.isArray(proM)) ? proM : (Array.isArray(window.proM) ? window.proM : []);
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
      {arr:_mini, label:'미니'},
      {arr:_univm, label:'대학대전'},
      {arr:_ck,   label:'CK', isCK:true},
      {arr:_pro,  label:'프로', isCK:true},
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
            <td style="text-align:right;padding:6px 10px;cursor:pointer;color:${sA.col};font-weight:700" onclick="cm('univModal');openPlayerModal('${(sA.ace?.name||'').replace(/'/g,"\'")}');">${sA.ace?.name||'-'}</td>
            <td style="text-align:center;padding:6px 8px;color:var(--gray-l);font-size:11px">에이스</td>
            <td style="text-align:left;padding:6px 10px;cursor:pointer;color:${sB.col};font-weight:700" onclick="cm('univModal');openPlayerModal('${(sB.ace?.name||'').replace(/'/g,"\'")}');">${sB.ace?.name||'-'}</td>
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
      <input type="text" id="hist-psearch-input" placeholder="스트리머 이름 입력..." value="${q.replace(/"/g,'&quot;')}"
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
    const br = tn.bracket || {};
    const _bktFirstSize = (typeof _bktComputeBracketSize === 'function')
      ? _bktComputeBracketSize(tn)
      : (Number(br.size)||0) || 8;
    let _bktTotalRounds = 0;
    let _n = Math.max(2, _bktFirstSize);
    while(_n > 1){ _n = Math.ceil(_n/2); _bktTotalRounds++; }
    if(_bktTotalRounds <= 0) _bktTotalRounds = 1;
    const _bktRoundLabels = {1:'결승',2:'4강',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};
    const _bktRndLabel = (key)=>{
      try{
        const parts = String(key||'').split('-');
        const r = parseInt(parts[0], 10);
        if(Number.isNaN(r) || r < 0) return '';
        const rNum = _bktTotalRounds - r;
        return _bktRoundLabels[rNum] || (Math.pow(2, rNum) + '강');
      }catch(e){
        return '';
      }
    };

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
    Object.entries(br.matchDetails||{}).forEach(([key,m])=>{
      if(!m||!m.a||!m.b||m.sa==null||m.sb==null)return;
      result.push({
        _src:'tour_bracket',_tnId:tn.id,_bktKey:key,
        d:m.d||'',n:tn.name,a:m.a,b:m.b,
        sa:m.sa,sb:m.sb,sets:m.sets||[],
        rndLabel:_bktRndLabel(key),
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
        rndLabel:_bktRndLabel(key),
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
        rndLabel:m.rndLabel||'',
        grpName:'토너먼트',grpLetter:'T',grpColor:'#7c3aed'
      });
    });
  });
  return result;
}
function compSummaryListHTML(context){
  // tourneys 경기 + normalMatches + comps 배열 모두 합산
  const tourItems=(typeof getTourneyMatches==='function') ? getTourneyMatches() : [];
  const nmItems=(typeof getNormalMatchesForHistory==='function')?getNormalMatchesForHistory():[];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
  const compItems=[..._comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const allItems=[...tourItems,...nmItems,...compItems];
  if(!allItems.length)return`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  // 날짜 필터 적용 후 정렬
  const filtered=allItems.filter(m=>
    typeof passDateFilter!=='function'||passDateFilter(m.d||'')
  );
  filtered.sort((a,b)=>_sortDir==='asc'
    ?(a.d||'').localeCompare(b.d||'')
    :(b.d||'').localeCompare(a.d||''));
  const sortBar=``;
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
    const _pms=_collectMatchParticipantsAny(m);
    const _pmJson=JSON.stringify(_pms).replace(/"/g,"'");
    const _pmCol=(aWin?ca:bWin?cb:(ca||cb||'#64748b'));
    h+=`<div class="rec-summary rec-mode-comp${_recSideFxClass('comp')}" data-rec-mode="comp" style="--rec-mode-col:#3b82f6;--rec-mode-rgb:59,130,246;${_recSideFxStyle('comp',ca,cb)}">
      <div class="rec-sum-header">
        <span style="color:var(--text3);font-size:12px;font-weight:600;min-width:72px">${m.d||''}</span>
        <span style="font-weight:700;font-size:13px">🎖️ ${m.n||'대회'}${grpBadge}</span>
        ${_pms.length?`<button class="btn btn-w btn-xs rc-mem-btn" style="margin-left:8px" onclick="event.stopPropagation();openProMembersPopup('참여자', '${_pmCol}', ${_pmJson})">👥 참여자 ${_pms.length}</button>`:''}
        ${(() => {
          // 대회 탭 멤버 추출 (가능한 모든 포맷 대응)
          let aMembers = m.teamAMembers || [];
          let bMembers = m.teamBMembers || [];
          if (!aMembers.length && !bMembers.length && m.sets) {
            const aSet = new Set(), bSet = new Set();
            m.sets.forEach(s => {
              (s.games || []).forEach(g => {
                if (g.playerA) String(g.playerA).split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>aSet.add(x));
                if (g.playerB) String(g.playerB).split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>bSet.add(x));
                if (g.a1) aSet.add(String(g.a1).trim());
                if (g.a2) aSet.add(String(g.a2).trim());
                if (g.b1) bSet.add(String(g.b1).trim());
                if (g.b2) bSet.add(String(g.b2).trim());
                if (g.winner === 'A' && g.wName) { aSet.add(g.wName); if (g.lName) bSet.add(g.lName); }
                else if (g.winner === 'B' && g.wName) { bSet.add(g.wName); if (g.lName) aSet.add(g.lName); }
              });
            });
            aMembers = Array.from(aSet).map(n => ({ name: n }));
            bMembers = Array.from(bSet).map(n => ({ name: n }));
          }
          // 그래도 비어있으면 공통 유틸로 한 번 더 시도
          if((!aMembers.length && !bMembers.length) && typeof _collectMatchTeamMembersAB === 'function'){
            const ab = _collectMatchTeamMembersAB(m);
            aMembers = ab.a || [];
            bMembers = ab.b || [];
          }
          const aBtnColor = ca || '#3b82f6';
          const bBtnColor = cb || '#ef4444';
          const aMemJson = JSON.stringify(aMembers).replace(/"/g, "'");
          const bMemJson = JSON.stringify(bMembers).replace(/"/g, "'");
          // 맵 정보 추출
          const maps = [];
          (m.sets || []).forEach(s => {
            (s.games || []).forEach(g => { if (g.map && !maps.includes(g.map)) maps.push(g.map); });
          });
          const mapStr = maps.slice(0, 2).join(', ') + (maps.length > 2 ? ` 외 ${maps.length - 2}` : '');
          return `
        <div class="rec-sum-vs" style="flex-wrap:wrap;align-items:center">
          <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
            ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>`:''}
            ${aMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${aBtnColor}15,${aBtnColor}08);border:1.5px solid ${aBtnColor}40;color:${aBtnColor};font-weight:700;box-shadow:0 2px 8px ${aBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${aBtnColor}30,0 2px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px ${aBtnColor}20,0 1px 3px rgba(0,0,0,0.08)'" onclick="event.stopPropagation();openProMembersPopup('${a.replace(/'/g,"\\'")}', '${ca}', ${aMemJson})">
              <span class="mem-ico">👥</span><span>${aMembers.length}명</span>
            </button>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세보기">
              <span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa||0}</span>
              <span class="score-sep" style="color:var(--text2);font-size:0.72em;font-weight:900;margin:0 4px;opacity:0.8">:</span>
              <span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb||0}</span>
            </div>`:''}
            ${mapStr ? `<span style="font-size:10px;color:var(--gray-l);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${maps.join(', ')}">${mapStr}</span>` : ''}
            ${aWin ? `<span style="font-size:11px;color:#dc2626;font-weight:700">${a} 승</span>` : bWin ? `<span style="font-size:11px;color:#dc2626;font-weight:700">${b} 승</span>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
            ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>`:''}
            ${bMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${bBtnColor}15,${bBtnColor}08);border:1.5px solid ${bBtnColor}40;color:${bBtnColor};font-weight:700;box-shadow:0 2px 8px ${bBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${bBtnColor}30,0 2px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px ${bBtnColor}20,0 1px 3px rgba(0,0,0,0.08)'" onclick="event.stopPropagation();openProMembersPopup('${b.replace(/'/g,"\\'")}', '${cb}', ${bMemJson})">
              <span class="mem-ico">👥</span><span>${bMembers.length}명</span>
            </button>` : ''}
          </div>
        </div>`;
        })()}
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
              canEdit:${((rIdx>=0 || m._src==='tour') && isLoggedIn && !isSubAdmin)?'true':'false'},
              canDel:${(rIdx>=0 && isLoggedIn && !isSubAdmin)?'true':'false'},
              shareFn:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1'; if(_adm && !isLoggedIn) return 'null'; return `()=>window._openShareMatchObjCard&&window._openShareMatchObjCard(_getCompMatchObj(${listIdx},'${context}'))`;})()},
              editFn:${m._src==='tour' ? `()=>leagueEditMatch('${m._tnId}',${m._gi},${m._mi})` : 'null'},
              canMove:false
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
    const tourItems=(typeof getTourneyMatches==='function') ? getTourneyMatches() : [];
    const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
    const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
    const compItems=[..._comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
    const all=[...tourItems,...compItems].filter(m=>typeof passDateFilter!=='function'||passDateFilter(m.d||''));
    all.sort((a,b)=>_sortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
    window._compListCache[context]=all;
  }
  const m = window._compListCache[context][listIdx]||null;
  if(!m) return null;
  return {...m,_matchType:'comp',compName:m.compName||m.n||'',teamALabel:m.teamALabel||m.a||'',teamBLabel:m.teamBLabel||m.b||''};
}

/* ══════════════════════════════════════
   경기 이동 (탭 간 이동)
══════════════════════════════════════ */
var _movePop=null;
function _showMovePop(btn,opts){
  closeMovePop();
  const pop=document.createElement('div');
  pop.id='_movePop';
  pop.style.cssText='position:fixed;z-index:var(--z-top);background:var(--white,#fff);border:1px solid var(--border2,#cbd5e1);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:6px;min-width:180px;font-family:\'Noto Sans KR\',sans-serif';
  const r=btn.getBoundingClientRect();
  pop.style.top=(r.bottom+4)+'px';
  pop.style.right=(window.innerWidth-r.right)+'px';
  let html='';
  opts.forEach((o,i)=>{
    html+=`<button onclick="_movePop_pick(${i})" style="display:block;width:100%;text-align:left;padding:8px 12px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:7px;color:var(--text,#1e293b)" onmouseenter="this.style.background='rgba(37,99,235,.08)'" onmouseleave="this.style.background='none'">${o.l}</button>`;
  });
  html+=`<button onclick="closeMovePop()" style="display:block;width:100%;text-align:left;padding:6px 12px;border:none;background:none;cursor:pointer;font-size:12px;border-radius:7px;color:var(--gray-l,#94a3b8)" onmouseenter="this.style.background='rgba(0,0,0,.04)'" onmouseleave="this.style.background='none'">취소</button>`;
  pop.innerHTML=html;
  document.body.appendChild(pop);
  _movePop=pop;
  window._movePopOpts=opts;
  setTimeout(()=>document.addEventListener('click',_movePopOutside,{once:true}),0);
}
function _movePopOutside(e){ if(_movePop&&!_movePop.contains(e.target)) closeMovePop(); }
function _movePop_pick(i){ const fn=window._movePopOpts&&window._movePopOpts[i]&&window._movePopOpts[i].fn; closeMovePop(); if(fn) fn(); }
function closeMovePop(){ if(_movePop){_movePop.remove();_movePop=null;} document.removeEventListener('click',_movePopOutside); }

// 팀 경기 이동 (mini ↔ univm ↔ civil)
function moveTeamMatch(srcMode, srcIdx, destMode, _batch=false){
  const srcArr=srcMode==='mini'?miniM:univM;
  const m=srcArr[srcIdx];
  if(!m)return;
  const srcType=m.type||'mini'; // 'mini'|'civil' (miniM 전용)
  const oldLabel=srcMode==='univm'?'대학대전':srcType==='civil'?'시빌워':'미니대전';
  const newLabel=destMode==='univm'?'대학대전':destMode==='civil'?'시빌워':'미니대전';
  if(oldLabel===newLabel)return;
  // 배열 이동
  srcArr.splice(srcIdx,1);
  if(destMode==='univm'){
    const {type:_t,...rest}=m; // type 필드 제거
    univM.unshift(rest);
    var moved=rest;
  } else {
    m.type=destMode==='civil'?'civil':'mini';
    miniM.unshift(m);
    var moved=m;
  }
  // player.history mode 레이블 업데이트
  const mid=moved._id;
  players.forEach(p=>(p.history||[]).forEach(h=>{if(h.matchId===mid)h.mode=newLabel;}));
  if(!_batch){if(typeof fixPoints==='function')fixPoints();save();render();}
}

// ── 일괄 선택 이동 ───────────────────────────────────────────
let _bulkModes = {}; // {key:bool} — 'mini'|'civil'|'univm'

function toggleBulkMode(key){
  _bulkModes[key]=!_bulkModes[key];
  render();
}
function bulkToggleAll(key,checked){
  document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`).forEach(cb=>cb.checked=checked);
  _bulkCountUpdate(key);
}
function _bulkCountUpdate(key){
  const n=[...document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]:checked`)].length;
  const el=document.getElementById('bulk-cnt-'+key);
  if(el)el.textContent=n+'개 선택됨';
  const allCbs=document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`);
  const allChk=document.getElementById('bulk-all-'+key);
  if(allChk&&allCbs.length) allChk.indeterminate=n>0&&n<allCbs.length, allChk.checked=n===allCbs.length;
}
function bulkMoveTeam(bulkKey,destMode){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 경기가 없습니다.');return;}
  const indices=cbs.map(cb=>parseInt(cb.dataset.bidx)).sort((a,b)=>b-a);
  if(!confirm(indices.length+'개 경기를 이동하시겠습니까?'))return;
  const srcMode=bulkKey==='univm'?'univm':'mini';
  indices.forEach(idx=>moveTeamMatch(srcMode,idx,destMode,true));
  _bulkModes[bulkKey]=false;
  if(typeof fixPoints==='function')fixPoints();
  save();render();
}
function bulkDeleteRecs(bulkKey){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 경기가 없습니다.');return;}
  const arr=bulkKey==='univm'?univM:bulkKey==='ck'?ckM:bulkKey==='pro'?proM:bulkKey==='tt'?ttM:miniM;
  const resolved = [];
  cbs.forEach(cb=>{
    const idx = parseInt(cb.dataset.bidx,10);
    if(isFinite(idx) && idx>=0 && idx<arr.length && arr[idx]){ resolved.push(idx); return; }
    const mid = String(cb.dataset.bmid||'').trim();
    if(mid){
      const found = arr.findIndex(x=>{
        const id = x && (x._id || x.sid || x.matchId);
        return id && String(id) === mid;
      });
      if(found>=0) resolved.push(found);
    }
  });
  const indices = [...new Set(resolved)].sort((a,b)=>b-a);
  if(!indices.length){alert('선택된 경기가 없습니다.');return;}
  if(!confirm(indices.length+'개 경기를 삭제하시겠습니까?\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.'))return;
  const deletedIds=new Set();
  indices.forEach(idx=>{
    const matchObj=arr[idx];
    if(matchObj){
      if(bulkKey==='tt'){
        try{ if(typeof window._rememberDeletedTierGeneralRestoreMatch === 'function') window._rememberDeletedTierGeneralRestoreMatch(matchObj); }catch(e){}
      }
      if(matchObj._id){
        deletedIds.add(matchObj._id);
        // 게임 레벨 ID도 추가 (sets 기반 저장: matchId_sN_gN 포맷)
        (matchObj.sets||[]).forEach((set,si)=>{
          (set.games||[]).forEach((g,gi)=>{
            deletedIds.add(`${matchObj._id}_s${si}_g${gi}`);
          });
        });
      }
      arr.splice(idx,1);
      revertMatchRecord(matchObj);
      // (버그픽스) 티어대회(tt)는 tourneys(조별/브라켓)에도 같은 _id 기록이 남아 있으면
      // 다음 렌더/마이그레이션에서 다시 ttM으로 복구되어 "삭제가 안 된 것처럼" 보일 수 있음.
      if(bulkKey==='tt' && matchObj._id) {
        try{ _removeTierTourneyMatchById(matchObj._id); }catch(e){}
      }
    }
  });
  // 안전 처리: revertMatchRecord가 놓친 history 항목 직접 정리
  if(deletedIds.size>0){
    players.forEach(p=>{
      if(!p.history)return;
      const removed=p.history.filter(h=>h.matchId&&deletedIds.has(h.matchId));
      if(!removed.length)return;
      p.history=p.history.filter(h=>!h.matchId||!deletedIds.has(h.matchId));
      removed.forEach(hr=>{
        if(hr.result==='승'){p.win=Math.max(0,(p.win||0)-1);p.points=(p.points||0)-3;}
        else if(hr.result==='패'){p.loss=Math.max(0,(p.loss||0)-1);p.points=(p.points||0)+3;}
        if(hr.eloDelta!=null)p.elo=(p.elo||1500)-hr.eloDelta;
      });
    });
  }
  _bulkModes[bulkKey]=false;
  if(typeof fixPoints==='function')fixPoints();
  save();render();
  try{ if(typeof window.refreshPlayerModalIfOpen === 'function') window.refreshPlayerModalIfOpen(); }catch(e){}
}

// (버그픽스) 티어대회 삭제 시 tourneys 내부(조별/브라켓)에 남은 같은 _id 기록도 같이 제거
function _removeTierTourneyMatchById(matchId){
  const id = String(matchId||'').trim();
  if(!id) return 0;
  let removed = 0;
  try{
    (tourneys||[]).filter(t=>t && t.type==='tier').forEach(tn=>{
      // 조별리그 matches
      (tn.groups||[]).forEach(grp=>{
        if(!grp || !Array.isArray(grp.matches)) return;
        const before = grp.matches.length;
        grp.matches = grp.matches.filter(m=>!(m && String(m._id||'')===id));
        removed += (before - grp.matches.length);
      });
      // 브라켓 matchDetails/manualMatches
      const br = tn.bracket || {};
      if(br.matchDetails){
        Object.keys(br.matchDetails).forEach(k=>{
          const m = br.matchDetails[k];
          if(m && String(m._id||'')===id){
            delete br.matchDetails[k];
            removed++;
            try{ if(br.winners) delete br.winners[k]; }catch(e){}
          }
        });
      }
      if(Array.isArray(br.manualMatches)){
        const before = br.manualMatches.length;
        br.manualMatches = br.manualMatches.filter(m=>!(m && String(m._id||'')===id));
        removed += (before - br.manualMatches.length);
      }
    });
  }catch(e){}
  return removed;
}
// ─────────────────────────────────────────────────────────────

// 팀 경기 이동 팝업 열기
function openMoveMatchPop(btn,srcMode,srcIdx){
  const arr=srcMode==='mini'?miniM:univM;
  const m=arr[srcIdx];if(!m)return;
  const srcType=m.type||'mini';
  const opts=[];
  if(srcMode==='mini'&&srcType==='mini'){
    opts.push({l:'⚔️ 시빌워로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'civil')});
    opts.push({l:'🏟️ 대학대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'univm')});
  } else if(srcMode==='mini'&&srcType==='civil'){
    opts.push({l:'⚡ 미니대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'mini')});
    opts.push({l:'🏟️ 대학대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'univm')});
  } else if(srcMode==='univm'){
    opts.push({l:'⚡ 미니대전으로 이동',fn:()=>moveTeamMatch('univm',srcIdx,'mini')});
    opts.push({l:'⚔️ 시빌워로 이동',fn:()=>moveTeamMatch('univm',srcIdx,'civil')});
  }
  _showMovePop(btn,opts);
}

function delRec(mode,i,matchId){
  if(!confirm('삭제하시겠습니까?\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.'))return;
  // 개인전/끝장전/프로 끝장전은 기존 delRec 로직(팀 대전 revertMatchRecord)과 구조가 달라서
  // 별도 삭제 처리 필요 (요청사항: 삭제가 안됨 해결)
  const _m = String(mode||'');
  if(_m==='ind' || _m==='individual'){
    const m = (typeof indM!=='undefined' && indM) ? indM[i] : null;
    if(!m) return;
    try{ if(typeof _removeIndResult==='function') _removeIndResult(m.wName,m.lName,m.d||'',m.map||'-',m._id); }catch(e){}
    try{ indM.splice(i,1); }catch(e){}
    // (버그픽스) 전역 window.indM 동기화 + 캐시 강제 갱신
    // — _restoreStableIndGj가 삭제 후 render 시 이전 캐시로 복원하는 문제 방지
    try{ window.indM = indM; }catch(e){}
    try{ window.__lastGoodIndM = indM.slice(); window.__indGjCacheSet_ind = true; }catch(e){}
    try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
    save();render();
    try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
    return;
  }
  if(_m==='gj' || _m==='progj'){
    try{
      const isPro = (_m==='progj');
      const pool = (typeof gjM!=='undefined' && Array.isArray(gjM))
        ? gjM.filter(x=>isPro ? !!x._proLabel : !x._proLabel)
        : [];
      const tgt = pool[i] || null;
      if(!tgt) return;
      const gi = (typeof gjM!=='undefined' && Array.isArray(gjM)) ? gjM.indexOf(tgt) : -1;
      if(gi>=0){
        try{ if(typeof _removeGjResult==='function') _removeGjResult(tgt.wName,tgt.lName,tgt.d||'',tgt.map||'-',tgt._id||tgt.matchId||undefined); }catch(e){}
        gjM.splice(gi,1);
      }
    }catch(e){}
    // (버그픽스) 전역 window.gjM 동기화 + 캐시 강제 갱신
    // — _restoreStableIndGj가 삭제 후 render 시 이전 캐시로 복원하는 문제 방지
    try{ window.gjM = gjM; }catch(e){}
    try{ window.__lastGoodGjM = gjM.slice(); window.__indGjCacheSet_gj = true; }catch(e){}
    try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
    save();render();
    try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
    return;
  }
  let matchObj=null;
  const _mid = String(matchId||'').trim();
  const _pickById = (arr)=>{
    if(!Array.isArray(arr) || !_mid) return -1;
    const idx = arr.findIndex(x=>{
      const id = x && (x._id || x.sid || x.matchId);
      return id && String(id) === _mid;
    });
    return idx;
  };
  const _safeIndex = (arr, idxHint)=>{
    const idx = Number(idxHint);
    if(Array.isArray(arr) && isFinite(idx) && idx>=0 && idx<arr.length && arr[idx]) return idx;
    const byId = _pickById(arr);
    if(byId>=0) return byId;
    return -1;
  };
  if(mode==='mini' || mode==='civil'){
    const idx = _safeIndex(miniM, i);
    if(idx>=0){ matchObj=miniM[idx]; miniM.splice(idx,1); }
  }
  else if(mode==='univm'){
    const idx = _safeIndex(univM, i);
    if(idx>=0){ matchObj=univM[idx]; univM.splice(idx,1); }
  }
  else if(mode==='comp'){
    const idx = _safeIndex(comps, i);
    if(idx>=0){ matchObj=comps[idx]; comps.splice(idx,1); }
  }
  else if(mode==='ck'){
    const idx = _safeIndex(ckM, i);
    if(idx>=0){ matchObj=ckM[idx]; ckM.splice(idx,1); }
  }
  else if(mode==='pro'){
    const idx = _safeIndex(proM, i);
    if(idx>=0){ matchObj=proM[idx]; proM.splice(idx,1); }
  }
  else if(mode==='tt'){
    const idx = _safeIndex(ttM, i);
    if(idx>=0){
      matchObj=ttM[idx];
      try{ if(typeof window._rememberDeletedTierGeneralRestoreMatch === 'function') window._rememberDeletedTierGeneralRestoreMatch(matchObj); }catch(e){}
      ttM.splice(idx,1);
    }
  }
  if(matchObj) {
    revertMatchRecord(matchObj);
    if(mode==='tt' && matchObj._id) {
      try{ _removeTierTourneyMatchById(matchObj._id); }catch(e){}
    }
  }
  if(typeof fixPoints==='function')fixPoints();
  save();render();
  try{ if(typeof window.refreshPlayerModalIfOpen === 'function') window.refreshPlayerModalIfOpen(); }catch(e){}
}


function _ensureHistDetailModal(){
  let m=document.getElementById('histDetModal');
  if(m) return m;
  m=document.createElement('div');
  m.id='histDetModal';
  m.className='modal modal--matchdetail no-export';
  m.style.cssText='z-index:var(--z-modal-4);display:none';
  m.setAttribute('onclick',"document.getElementById('histDetModal').style.display='none'");
  m.innerHTML=`
    <div class="mbox mbox--matchdetail" onclick="event.stopPropagation()">
      <div class="cmd-head">
        <div class="cmd-head__txt">
          <div id="hmdTitle" class="cmd-title">📅 경기 상세</div>
          <div id="hmdSub" class="cmd-sub"></div>
        </div>
        <div class="cmd-head-actions no-export">
          <button id="hmdActCopy" class="cmd-hbtn" title="결과 복사">📤</button>
          <button id="hmdActShare" class="cmd-hbtn" title="공유 카드">🎴</button>
        </div>
        <button class="cmd-close" onclick="document.getElementById('histDetModal').style.display='none'" aria-label="닫기">✕</button>
      </div>
      <div id="hmdScoreBar" class="cmd-scorebar" style="display:none"></div>
      <div id="histDetBody" class="cmd-body"></div>
      <div class="cmd-actions no-export">
        <button class="btn btn-w" onclick="document.getElementById('histDetModal').style.display='none'">닫기</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  return m;
}

window._refreshOpenHistDetailAfterEdit = function(editedMode, editedIdx){
  try{
    const st = window._lastHistDetailState || null;
    if(!st || !st.key) return;
    if(String(st.mode||'') !== String(editedMode||'')) return;
    if(Number(st.idx) !== Number(editedIdx)) return;
    const arrMap = { mini: miniM, univm: univM, ck: ckM, pro: proM, tt: ttM, comp: comps, ind: indM, gj: gjM, progj: gjM };
    const src = arrMap[String(editedMode||'')] || null;
    if(src && src[editedIdx] && window._detReg && window._detReg[st.key]){
      window._detReg[st.key].m = src[editedIdx];
    }
    if(typeof openHistDetailModal === 'function') openHistDetailModal(st.key);
  }catch(e){}
};

function _getMatchDetailTeamHeaderColor(modeKey, side, fallback){
  try{
    const mode = String(modeKey||'').trim();
    const sd = (String(side||'A').toUpperCase()==='B') ? 'b' : 'a';
    if(mode==='ck' || mode==='pro' || mode==='tt'){
      const key = `su_md_team_hdr_${mode}_${sd}`;
      const v = String(localStorage.getItem(key)||'').trim();
      if(/^#[0-9a-fA-F]{6}$/.test(v)) return v;
    }
  }catch(e){}
  return fallback;
}

function _applyOpenHistDetailTeamHeaderColors(){
  try{
    const m=document.getElementById('histDetModal');
    if(!m || m.style.display==='none') return;
    const mode = m.dataset.mode || '';
    const baseA = m.dataset.teamColorA || '#64748b';
    const baseB = m.dataset.teamColorB || '#64748b';
    const ca = _getMatchDetailTeamHeaderColor(mode, 'A', baseA);
    const cb = _getMatchDetailTeamHeaderColor(mode, 'B', baseB);
    const teams = m.querySelectorAll('.cmd-score .cmd-team');
    if(teams[0]) teams[0].style.background = `linear-gradient(135deg,${ca},${ca}cc)`;
    if(teams[1]) teams[1].style.background = `linear-gradient(135deg,${cb},${cb}cc)`;
  }catch(e){}
}

function openHistDetailModal(key){
  const reg=(window._detReg||{})[key];
  if(!reg || !reg.m) return;
  const _mdDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_md_design_mode')||'classic').trim(); return ['classic','glass','editorial','neon','midnight','sunset','aurora','mono'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
  const _mdLayoutMode = (()=>{ try{ const v=(localStorage.getItem('su_md_layout_mode')||'default').trim(); return ['default','compact','focus','broadcast','split','poster'].includes(v)?v:'default'; }catch(e){ return 'default'; } })();
  try{
    window._lastHistDetailState = {
      key,
      mode: String(reg.mode||''),
      idx: (reg.idx!==undefined && reg.idx!==null) ? Number(reg.idx) : null
    };
  }catch(e){}
  try{ window.__detailCtx = 'histModal'; }catch(_){}
  const m=_ensureHistDetailModal();
  try{
    if(m){
      m.setAttribute('data-md-mode', _mdDesignMode);
      m.setAttribute('data-md-layout', _mdLayoutMode);
      const box = m.querySelector('.mbox--matchdetail');
      const body = m.querySelector('.cmd-body');
      if(box){
        box.setAttribute('data-md-mode', _mdDesignMode);
        box.setAttribute('data-md-layout', _mdLayoutMode);
      }
      if(body){
        body.setAttribute('data-md-mode', _mdDesignMode);
        body.setAttribute('data-md-layout', _mdLayoutMode);
      }
    }
  }catch(e){}
  const titleEl=document.getElementById('hmdTitle');
  const subEl=document.getElementById('hmdSub');
  const bar=document.getElementById('hmdScoreBar');
  const bodyEl=document.getElementById('histDetBody');
  const match=reg.m;
  const idx = (reg.idx!==undefined && reg.idx!==null) ? reg.idx : null;
  const modeKey = reg.mode || '';
  try{
    const mode = String(modeKey||'').trim();
    const modeForEdit = (mode==='civil') ? 'mini' : mode;
    const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin) && idx!=null;
    const editable = ['mini','univm','ck','pro','tt','comp'].includes(modeForEdit);
    if(canEdit && editable && match && !match._editRef){
      match._editRef = `${modeForEdit}:${idx}`;
    }
  }catch(e){}
  try{
    document.querySelectorAll('#histDetModal .cmd-detail-shell').forEach(el=>{
      el.setAttribute('data-md-mode', _mdDesignMode);
      el.setAttribute('data-md-layout', _mdLayoutMode);
    });
  }catch(e){}
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
  const _resolveOriginalShareSource = ()=> typeof window._resolveHistoryShareSource==='function'
    ? window._resolveHistoryShareSource(match, modeKey, idx)
    : null;
  // 공유카드: 인덱스 기반이 어려운 케이스(comp 통합/대회 포함)에서는 match 객체로 직접 오픈
  const _buildDetailSharePayload = ()=>{
    try{
      if(typeof window._buildHistoryDetailSharePayload==='function'){
        return window._buildHistoryDetailSharePayload(match, modeKey, idx);
      }
      if(!match) return null;
      const source = _resolveOriginalShareSource();
      if(source) return source;
      if((match.a||match.b) && match.sa!=null && match.sb!=null){
        return {...match, _matchType:(modeKey||'')};
      }
      const A = reg.lA || match.a || match.wName || 'A';
      const B = reg.lB || match.b || match.lName || 'B';
      if(Array.isArray(match.games) && match.games.length){
        const games = match.games.map(g=>{
          const w = g.wName || (g.winner==='A'?A:(g.winner==='B'?B:''));
          return {
            playerA: A,
            playerB: B,
            winner: w===A ? 'A' : 'B',
            map: g.map||''
          };
        });
        const sa = games.filter(g=>g.winner==='A').length;
        const sb = games.filter(g=>g.winner==='B').length;
        return { a:A, b:B, sa, sb, d:match.d||'', n:match.n||'', sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}], _usePlayerPhoto:true, _matchType:(modeKey||'') };
      }
      if(match.wName || match.lName){
        const w = match.wName||'';
        const sa = w===A ? 1 : 0;
        const sb = w===B ? 1 : 0;
        return { a:A, b:B, sa, sb, d:match.d||'', n:match.n||'', sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games:[{playerA:A, playerB:B, winner:sa>sb?'A':'B', map:match.map||''}]}], _usePlayerPhoto:true, _matchType:(modeKey||'') };
      }
    }catch(e){}
    return null;
  };
  const _openShareByObj = (obj)=>{
    try{
      // 티어대회(tt) 등에서 공유카드 표기 보정
      const _mt = modeKey==='tt' ? 'tt' : (obj?._matchType || (modeKey||''));
      const _usePhoto = modeKey==='tt' ? true : (obj?._usePlayerPhoto || false);
      const _payload = obj ? {...obj, _matchType:_mt, _usePlayerPhoto:_usePhoto} : null;
      if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(_payload);
    }catch(e){}
  };
  // 헤더 액션(고정)
  try{
    const copyBtn=document.getElementById('hmdActCopy');
    if(copyBtn){
      copyBtn.onclick = (e)=>{
        try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
        const a=(match.a||reg.lA||''); const b=(match.b||reg.lB||'');
        copyMatchResult(String(a), match.sa||0, String(b), match.sb||0, match.d||'', modeKey, idx??0);
      };
    }
    const shareBtn=document.getElementById('hmdActShare');
    if(shareBtn){
      const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';
      const canShare = (!_adm || isLoggedIn);
      shareBtn.style.display = canShare ? '' : 'none';
      shareBtn.onclick = (e)=>{
        try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
        if(!canShare) return;
        const _payload = _buildDetailSharePayload();
        if(_payload){
          _openShareByObj(_payload);
          return;
        }
        // comp 포함 전 모드 지원
        if(typeof openShareCardFromMatch==='function' && idx!==null && modeKey!=='comp'){
          openShareCardFromMatch(modeKey, idx);
          return;
        }
        if(typeof openShareCardFromMatch==='function' && idx!==null && modeKey==='comp' && Array.isArray(comps) && comps[idx]){
          openShareCardFromMatch('comp', idx);
          return;
        }
        // fallback: match 객체로 직접 (대회 통합/인덱스 없는 케이스)
        _openShareByObj({...match, _matchType:(modeKey||'')});
      };
    }
  }catch(e){}
  const labelA=reg.lA || match.a || 'A';
  const labelB=reg.lB || match.b || 'B';
  const isDone=(match.sa!=null && match.sb!=null);
  const aWin=isDone && (match.sa>match.sb);
  const bWin=isDone && (match.sb>match.sa);
  const score=isDone ? `${match.sa}:${match.sb}` : '';

  // 헤더 텍스트
  if(titleEl) titleEl.textContent = `📅 ${labelA} vs ${labelB}${score?` (${score})`:''}`;
  if(subEl){
    const parts=[];
    if(match.d) parts.push(`📅 ${String(match.d).slice(0,10)}`);
    if(match.t) parts.push(String(match.t));
    if(match.n) parts.push(String(match.n));
    if(match.memo) parts.push(`📝 ${String(match.memo)}`);
    subEl.textContent = parts.join(' · ');
  }

  // 스코어바(가능할 때만)
  try{
    if(bar){
      if(isDone){
        const safe=(s)=>String(s||'').replace(/[<>]/g,'');
        const _icon = (name)=>{
          try{
            const url=UNIV_ICONS[name]||(univCfg.find(x=>x.name===name)||{}).icon||'';
            if(url) return `<img class="cmd-uicon" src="${toHttpsUrl(url)}" style="object-fit:contain;border-radius:var(--su_univ_logo_radius,12px);background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);padding:7px" onerror="this.style.display='none'">`;
          }catch(e){}
          return '';
        };
        const _playerMeta = (name, col, isLose) => {
          try{
            const p = (players||[]).find(x=>x && x.name===name);
            if(!p) return '';
            const race = p.race ? `<span class="rbadge cmd-head-race r${p.race}" style="font-size:10px">${p.race}</span>` : '';
            const tierTxt = p.tier ? String(p.tier).replace(/티어$/,'') : '';
            const tier = p.tier ? `<span class="cmd-head-tier" style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'}">${tierTxt}</span>` : '';
            return `<span class="cmd-team-meta">${tier}${race}</span>`;
          }catch(e){
            return '';
          }
        };
        const _resolvePlayerCol = (name, fallback) => {
          try{
            const p = (players||[]).find(x=>x && x.name===name);
            return (p && gc(p.univ)) || fallback || '#64748b';
          }catch(e){
            return fallback || '#64748b';
          }
        };
        const caBase=_resolvePlayerCol(labelA, reg.ca||'#64748b');
        const cbBase=_resolvePlayerCol(labelB, reg.cb||'#64748b');
        const ca=_getMatchDetailTeamHeaderColor(modeKey, 'A', caBase);
        const cb=_getMatchDetailTeamHeaderColor(modeKey, 'B', cbBase);
        const loseTeamA = isDone && !aWin && !!(match.sa!=null || match.sb!=null);
        const loseTeamB = isDone && !bWin && !!(match.sa!=null || match.sb!=null);
        const metaA = _playerMeta(labelA, caBase, loseTeamA);
        const metaB = _playerMeta(labelB, cbBase, loseTeamB);
        try{
          m.dataset.mode = String(modeKey||'');
          m.dataset.teamColorA = caBase;
          m.dataset.teamColorB = cbBase;
        }catch(e){}
        bar.innerHTML = `<div class="cmd-score">
          <div class="cmd-team ${aWin?'is-win':''} ${loseTeamA?'is-lose':''}" style="background:${loseTeamA?'linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))':`linear-gradient(135deg,${ca},${ca}cc)`};border-color:${loseTeamA?'rgba(203,213,225,.88)':'rgba(255,255,255,.28)'};padding:0 18px;color:${loseTeamA?'#64748b':'#fff'}"><span class="cmd-team-text" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);align-items:center;text-align:center;justify-content:center;gap:3px;max-width:calc(100% - 82px)"><span style="display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:100%">${_icon(labelA)}<span class="cmd-team-name" style="font-weight:1000">${safe(labelA)}</span></span>${metaA}</span></div>
          <div class="cmd-mid"><span style="color:${aWin?'var(--win-col)':bWin?'var(--lose-col)':'#111827'}">${match.sa??''}</span><span class="cmd-colon">:</span><span style="color:${bWin?'var(--win-col)':aWin?'var(--lose-col)':'#111827'}">${match.sb??''}</span></div>
          <div class="cmd-team ${bWin?'is-win':''} ${loseTeamB?'is-lose':''}" style="background:${loseTeamB?'linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))':`linear-gradient(135deg,${cb},${cb}cc)`};border-color:${loseTeamB?'rgba(203,213,225,.88)':'rgba(255,255,255,.28)'};padding:0 18px;color:${loseTeamB?'#64748b':'#fff'}"><span class="cmd-team-text" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);align-items:center;text-align:center;justify-content:center;gap:3px;max-width:calc(100% - 82px)"><span style="display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:100%">${_icon(labelB)}<span class="cmd-team-name" style="font-weight:1000">${safe(labelB)}</span></span>${metaB}</span></div>
        </div>`;
        bar.style.display='block';
      }else{
        bar.style.display='none';
        bar.innerHTML='';
      }
    }
  }catch(e){}
  if(bodyEl){
    bodyEl.innerHTML = (typeof buildDetailHTML==='function'
      ? `<div class="cmd-detail">${buildDetailHTML(match, reg.mode, labelA, labelB, reg.ca, reg.cb, reg.aW, reg.bW)}</div>`
      : '<div style="padding:10px;color:var(--gray-l)">상세 렌더 함수를 찾을 수 없습니다.</div>');
    try{ injectUnivIcons(bodyEl); }catch(e){}
    try{ bodyEl.scrollTop = 0; }catch(e){}
  }
  try{
    const box = m.querySelector('.mbox--matchdetail');
    if(box) box.scrollTop = 0;
  }catch(e){}
  if(typeof om==='function') om('histDetModal');
  else m.style.display='block';
}

function toggleDetail(key){
  // (요청사항) 상세는 인라인 펼치기 대신 팝업으로 표시
  openHistDetailModal(key);
}

function _histSearchSplitSideNames(v){
  return String(v || '').split(/[,+，]/).map(s => s.trim()).filter(Boolean);
}
function _histSearchGameSideNames(g, side){
  if (!g) return [];
  if (side === 'A') {
    if (Array.isArray(g.teamA) && g.teamA.length) return g.teamA.map(x => typeof x === 'object' ? x.name : x).filter(Boolean);
    if (g.a1 || g.a2) return [g.a1, g.a2].filter(Boolean);
    return _histSearchSplitSideNames(g.playerA);
  }
  if (Array.isArray(g.teamB) && g.teamB.length) return g.teamB.map(x => typeof x === 'object' ? x.name : x).filter(Boolean);
  if (g.b1 || g.b2) return [g.b1, g.b2].filter(Boolean);
  return _histSearchSplitSideNames(g.playerB);
}
function _histSearchEscHtml(v){
  return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function _histSearchEscJs(v){
  return String(v ?? '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
}
function _histSearchTeamBadge(names){
  return (names || []).length >= 2
    ? `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:18px;padding:0 6px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-size:10px;font-weight:900;flex-shrink:0">2:2</span>`
    : '';
}
function _histSearchRenderNameList(names){
  const safeNames = (names || []).filter(Boolean);
  if (!safeNames.length) return '?';
  return safeNames.map(name => {
    const safeJs = _histSearchEscJs(name);
    return `<span onclick="openPlayerModal('${safeJs}')" style="cursor:pointer;text-decoration:underline dotted">${_histSearchEscHtml(name)}</span>`;
  }).join(`<span style="color:var(--text3)"> / </span>`);
}
function _histSearchTeamText(names){
  const safeNames = (names || []).filter(Boolean);
  return safeNames.length ? safeNames.join(' / ') : '?';
}

/* ══════════════════════════════════════
   대전기록 액션 메뉴(⋯)
   - (개선) 아이콘 버튼(복사/공유/상세/수정/삭제/이동)을 한 곳에 모아 UI 복잡도 감소
══════════════════════════════════════ */
// 대전기록 > 외부2 (관리자 전용, iframe)
// 외부2 / 외부3 UI는 `js/history-external-ui.js`로 분리

function buildSingleSetHTML(m, si, labelA, labelB, ca, cb){
  if(!m.sets||!m.sets[si])return`<div style="font-size:11px;color:var(--gray-l)">세트 기록 없음</div>`;
  const set=m.sets[si];
  const isAce=(si===m.sets.length-1&&m.sets.length>=3);
  const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
  const swA=set.scoreA||0,swB=set.scoreB||0;
  const setAWin=swA>swB,setBWin=swB>swA;
  let h=`<div style="font-size:11px;font-weight:700;color:${isAce?'#7c3aed':'var(--blue)'};margin-bottom:8px">${sLabel} — ${labelA} <span class="${setAWin?'wt':'lt'}">${swA}</span>:<span class="${setBWin?'wt':'lt'}">${swB}</span> ${labelB}</div>`;
  if(set.games&&set.games.length){
    set.games.forEach((g,gi)=>{
      if(!g.playerA&&!g.playerB)return;
      const sideA = _histSearchGameSideNames(g, 'A');
      const sideB = _histSearchGameSideNames(g, 'B');
      const isTeamA = sideA.length >= 2;
      const isTeamB = sideB.length >= 2;
      const pA=(!isTeamA && g.playerA) ? players.find(p=>p.name===g.playerA) : null;
      const pB=(!isTeamB && g.playerB) ? players.find(p=>p.name===g.playerB) : null;
      const pca=(pA&&gc(pA.univ))||ca;
      const pcb=(pB&&gc(pB.univ))||cb;
      const aIsWinner=g.winner==='A';const bIsWinner=g.winner==='B';const hasWinner=!!g.winner;
      const winBgA=(typeof getMatchWinTint==='function'?getMatchWinTint(pca):(pca+'22'));
      const winBgB=(typeof getMatchWinTint==='function'?getMatchWinTint(pcb):(pcb+'22'));
      const winBorderA=pca+'66',winBorderB=pcb+'66';
      const styleA=hasWinner?(aIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgA};border:2px solid ${winBorderA};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pca}12;border:1px solid ${pca}33;opacity:0.72;`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pca}12;border:1px solid ${pca}33;`;
      const styleB=hasWinner?(bIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgB};border:2px solid ${winBorderB};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pcb}12;border:1px solid ${pcb}33;opacity:0.72;`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pcb}12;border:1px solid ${pcb}33;`;
      const cA=g.playerA?`onclick="openPlayerModal('${g.playerA}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const cB=g.playerB?`onclick="openPlayerModal('${g.playerB}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const mapStr=g.map?`<span style="background:var(--surface);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-size:10px">${g.map}</span>`:'';
      const teamANameHTML = `${_histSearchTeamBadge(sideA)}<strong style="font-size:14px;display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap">${_histSearchRenderNameList(sideA)}</strong>`;
      const teamBNameHTML = `${_histSearchTeamBadge(sideB)}<strong style="font-size:14px;display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap">${_histSearchRenderNameList(sideB)}</strong>`;
      h+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
        <span style="color:var(--gray-l);font-size:11px;font-weight:900;min-width:54px;text-align:center">경기 ${gi+1}</span>
        <div style="${styleA}">${isTeamA ? teamANameHTML : `${pA?getPlayerPhotoHTML(pA.name,'30px','margin-right:4px'):''} ${pA?`<span class="rbadge r${pA.race}" style="font-size:11px;padding:2px 6px">${pA.race}</span>`:''}<strong style="font-size:14px" ${cA}>${g.playerA||'?'}</strong>${pA?genderIcon(pA.gender):''}`}<span style="font-size:11px;color:${ca};font-weight:700;margin-left:2px">(${labelA})</span>${aIsWinner&&hasWinner?`<span style="background:${ca};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        <span style="color:var(--gray-l);font-size:12px;font-weight:700">vs</span>
        <div style="${styleB}">${isTeamB ? teamBNameHTML : `${pB?getPlayerPhotoHTML(pB.name,'30px','margin-right:4px'):''} ${pB?`<span class="rbadge r${pB.race}" style="font-size:11px;padding:2px 6px">${pB.race}</span>`:''}<strong style="font-size:14px" ${cB}>${g.playerB||'?'}</strong>${pB?genderIcon(pB.gender):''}`}<span style="font-size:11px;color:${cb};font-weight:700;margin-left:2px">(${labelB})</span>${bIsWinner&&hasWinner?`<span style="background:${cb};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        ${mapStr}
      </div>`;
    });
  }
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 대회 탭
══════════════════════════════════════ */
function histProCompHTML() {
  // (요청사항) 대전기록 > 프로리그 > 대회 탭 아래 하위메뉴:
  // 조별리그 / 토너먼트 / 팀전 / 중장전
  if(!window._histProCompSub) window._histProCompSub='league'; // league | tourney | team | gj
  const sub = window._histProCompSub;
  // 프로리그 대회 하위탭 색상: 청록(teal) 계열
  const _pcOn=(id)=>sub===id?'background:linear-gradient(135deg,#075985,#0891b2 58%,#38bdf8);border-color:rgba(56,189,248,.30);box-shadow:0 12px 26px rgba(8,145,178,.24);color:#fff;font-weight:800;':'';
  const _pcSubBar=`<div class="fbar merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    <button class="pill ${sub==='league'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_pcOn('league')}" onclick="window._histProCompSub='league';render()">📅 조별리그</button>
    <button class="pill ${sub==='tourney'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_pcOn('tourney')}" onclick="window._histProCompSub='tourney';render()">🗂️ 토너먼트</button>
    <button class="pill ${sub==='team'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_pcOn('team')}" onclick="window._histProCompSub='team';render()">🤝 팀전</button>
    <button class="pill ${sub==='gj'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_pcOn('gj')}" onclick="window._histProCompSub='gj';render()">⚔️ 중장전</button>
  </div>`;
  let inner = '';
  if(sub==='league') inner = _histProCompLeagueListHTML();
  else if(sub==='tourney') inner = histProCompTourneyHTML(true);
  else if(sub==='team') inner = histProCompTeamHTML(true);
  else if(sub==='gj') inner = histProCompGJHTML(true);
  else inner = _histProCompLeagueListHTML();
  return _pcSubBar + inner;
}

function _pcRecDetailEsc(s){
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _pcRecDetailPhotoHTML(name, size, isLose){
  const safeName = _pcRecDetailEsc(name || '?');
  const click = name ? `onclick="event.stopPropagation();openPlayerModal('${escJS(name)}')"` : '';
  const loseStyle = isLose ? 'filter:grayscale(1);opacity:.58;' : '';
  try{
    if (typeof getPlayerPhotoHTML === 'function') {
      const html = getPlayerPhotoHTML(name, `${size}px`, `object-fit:cover;vertical-align:middle;${loseStyle}`);
      if (html) {
        return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;overflow:hidden;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);flex-shrink:0;cursor:pointer;${loseStyle}" ${click}>${html}</span>`;
      }
    }
  }catch(e){}
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);background:var(--surface);border:1px solid var(--border);font-size:${Math.max(11, Math.round(size*.42))}px;font-weight:900;color:var(--gray-l);flex-shrink:0;${loseStyle}" ${click}>${safeName.slice(0,1)}</span>`;
}
function _pcRecDetailPlayerHTML(name, isWin, size){
  const safeName = _pcRecDetailEsc(name || '?');
  const click = name ? `onclick="event.stopPropagation();openPlayerModal('${escJS(name)}')"` : '';
  const isLose = !isWin;
  let race = '';
  let univ = '';
  let tier = '';
  let univCol = '';
  try{
    const ps = (typeof players!=='undefined' && Array.isArray(players)) ? players : (Array.isArray(window.players) ? window.players : []);
    const p = name ? ps.find(x=>x && x.name===name) : null;
    if (p) {
      race = String(p.race || '').trim();
      univ = String(p.univ || '').trim();
      tier = String(p.tier || '').trim();
      if (univ && typeof gc === 'function') univCol = String(gc(univ) || '');
    }
  }catch(e){}
  const tierHTML = tier ? `${typeof _getTierBadge === 'function' ? _getTierBadge(tier) : `<span style="display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;background:#475569;color:#fff;font-size:10px;font-weight:800">${_pcRecDetailEsc(tier)}</span>`}` : '';
  const raceHTML = race ? `<span class="rbadge r${_pcRecDetailEsc(race)}" style="font-size:10px;padding:2px 6px">${_pcRecDetailEsc(race)}</span>` : '';
  const univHTML = univ ? `<span class="ubadge" style="background:${_pcRecDetailEsc(univCol||'#64748b')};font-size:10px;padding:2px 8px">${_pcRecDetailEsc(univ)}</span>` : '';
  const metaHTML = (tierHTML || raceHTML || univHTML) ? `<span class="pcd-player__meta">${tierHTML}${raceHTML}${univHTML}</span>` : '';
  return `<span class="pcd-player ${isWin?'is-win':'is-lose'}" style="display:inline-flex;align-items:center;gap:10px;min-width:0">
    <span class="pcd-player__photo">
      ${_pcRecDetailPhotoHTML(name, size, isLose)}
    </span>
    <span class="pcd-player__info">
      <span class="pcd-player__name" ${click} style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;font-size:14px;font-weight:${isWin?'900':'800'};color:${isWin?'#86efac':'#f8fafc'};${isLose?'opacity:.92;':''}">${safeName}</span>
      ${metaHTML}
    </span>
  </span>`;
}
function _pcRecDetailSummaryMetaHTML(payload){
  const games = Array.isArray(payload?.games) ? payload.games : [];
  const first = games[0] || {};
  const bits = [];
  if (first.map) bits.push(`<span class="pcd-meta2__item pcd-meta2__item--map">🗺️ ${_pcRecDetailEsc(first.map)}</span>`);
  if (first.note) bits.push(`<span class="pcd-meta2__item pcd-meta2__item--note">📝 ${_pcRecDetailEsc(first.note)}</span>`);
  if (!bits.length) return '';
  return `<div class="pcd-meta2">${bits.join('')}</div>`;
}
function _pcRecDetailRowsHTML(payload){
  const p1 = String(payload?.p1 || '');
  const p2 = String(payload?.p2 || '');
  const p1Col = String(payload?.p1Col || '#2563eb');
  const p2Col = String(payload?.p2Col || '#dc2626');
  const games = Array.isArray(payload?.games) ? payload.games : [];
  if (!games.length) {
    return `<div style="font-size:12px;color:var(--gray-l);padding:12px 2px">상세 게임 기록이 없습니다.</div>`;
  }
  if (games.length === 1) return '';
  return games.map((g, idx) => {
    const row = g || {};
    let left = p1 || '?';
    let right = p2 || '?';
    let winSide = '';
    let leftNames = [];
    let rightNames = [];
    if (row.wName || row.lName) {
      leftNames = _histSearchSplitSideNames(row.wName || left);
      rightNames = _histSearchSplitSideNames(row.lName || right);
      left = _histSearchTeamText(leftNames);
      right = _histSearchTeamText(rightNames);
      winSide = 'left';
    } else {
      leftNames = _histSearchGameSideNames(row, 'A');
      rightNames = _histSearchGameSideNames(row, 'B');
      left = leftNames.length ? _histSearchTeamText(leftNames) : String(row.a || left);
      right = rightNames.length ? _histSearchTeamText(rightNames) : String(row.b || right);
      const winner = String(row.winner || '');
      if (winner === 'A' || winner === left || winner === p1) winSide = 'left';
      else if (winner === 'B' || winner === right || winner === p2) winSide = 'right';
    }
    const map = row.map ? _pcRecDetailEsc(row.map) : '';
    const note = row.note ? _pcRecDetailEsc(row.note) : '';
    const leftBadge = _histSearchTeamBadge(leftNames);
    const rightBadge = _histSearchTeamBadge(rightNames);
    const isTeam = leftNames.length >= 2 || rightNames.length >= 2;
    const memberHTML = (name, isLose) => {
      const safe = _pcRecDetailEsc(name || '?');
      const click = name ? `onclick="event.stopPropagation();openPlayerModal('${escJS(name)}')"` : '';
      return `<div class="pcd-member">
        ${_pcRecDetailPhotoHTML(name, 28, isLose)}
        <span class="pcd-member__name" ${click}>${safe}</span>
      </div>`;
    };
    const teamHTML = (names, side) => {
      const isWin = winSide === side;
      const isLose = winSide && winSide !== side;
      const badge = _histSearchTeamBadge(names);
      const members = (names||[]).slice(0, 2).map(n => memberHTML(n, isLose)).join('');
      const sideCol = side === 'left' ? p1Col : p2Col;
      return `<div class="pcd-team pcd-team--${side} ${isWin?'is-win':''} ${isLose?'is-lose':''}" style="--pcd-team-col:${_pcRecDetailEsc(sideCol)}">
        <div class="pcd-team__head">
          <span class="pcd-team__badge">${badge || ''}</span>
          ${isWin?`<span class="pcd-row__win">WIN</span>`:''}
        </div>
        <div class="pcd-team__members">${members}</div>
      </div>`;
    };
    if (isTeam) {
      return `<div class="pcd-row pcd-row--team">
        ${teamHTML(leftNames, 'left')}
        <div class="pcd-mid">
          <div class="pcd-mid__idx">${idx+1}경기</div>
          ${map?`<div class="pcd-mid__map">🗺️ ${map}</div>`:''}
          ${note?`<div class="pcd-mid__note">📝 ${note}</div>`:''}
        </div>
        ${teamHTML(rightNames, 'right')}
      </div>`;
    }
    return `<div class="pcd-row">
      <span class="pcd-row__idx">${idx+1}경기</span>
      ${winSide==='left'?`<span class="pcd-row__win">WIN</span>`:''}
      <span class="pcd-row__side" style="font-weight:${winSide==='left'?'900':'700'};color:${winSide==='left'?'var(--win-col,#dc2626)':winSide==='right'?'var(--lose-col,#2563eb)':'var(--text)'}">${leftBadge}<span class="pcd-row__name">${_pcRecDetailEsc(left)}</span></span>
      <span class="pcd-row__vs">vs</span>
      <span class="pcd-row__side" style="font-weight:${winSide==='right'?'900':'700'};color:${winSide==='right'?'var(--win-col,#dc2626)':winSide==='left'?'var(--lose-col,#2563eb)':'var(--text)'}">${rightBadge}<span class="pcd-row__name">${_pcRecDetailEsc(right)}</span></span>
      ${winSide==='right'?`<span class="pcd-row__win pcd-row__win--right">WIN</span>`:''}
      ${map?`<span class="pcd-row__map">🗺️ ${map}</span>`:'<span class="pcd-row__map"></span>'}
      ${note?`<span class="pcd-row__note">📝 ${note}</span>`:''}
    </div>`;
  }).join('');
}
window.openProCompRecordDetailPopup = window.openProCompRecordDetailPopup || function(encodedPayload){
  try{
    const payload = typeof encodedPayload === 'string'
      ? JSON.parse(decodeURIComponent(encodedPayload))
      : (encodedPayload || {});
    const p1 = String(payload.p1 || payload.a || '?');
    const p2 = String(payload.p2 || payload.b || '?');
    const p1Score = Number(payload.p1Score ?? payload.sa ?? 0);
    const p2Score = Number(payload.p2Score ?? payload.sb ?? 0);
    const winner = String(payload.winner || '');
    const seriesWinner = winner===p1 ? 'A' : winner===p2 ? 'B' : (p1Score>p2Score?'A':p2Score>p1Score?'B':'');
    const _colByName = (name, fallback) => {
      try{
        const p = (players||[]).find(x=>x && String(x.name||'').trim()===String(name||'').trim());
        const col = p && p.univ ? gc(p.univ) : '';
        return (col && col !== '#6b7280') ? col : (fallback || gc(name||'') || '#64748b');
      }catch(e){
        return fallback || '#64748b';
      }
    };
    const ca = _colByName(p1, String(payload.p1Col || payload.ca || '#2563eb'));
    const cb = _colByName(p2, String(payload.p2Col || payload.cb || '#dc2626'));
    const gamesRaw = Array.isArray(payload.games) ? payload.games : [];
    const games = gamesRaw.map((g)=>{
      const ga = String(g?.a || g?.playerA || p1);
      const gb = String(g?.b || g?.playerB || p2);
      const w = String(g?.winner||'');
      const ww = (w==='A'||w==='B') ? w : (w===ga?'A':w===gb?'B':'');
      return {
        playerA: ga,
        playerB: gb,
        winner: ww || '',
        map: String(g?.map||'')
      };
    });
    const match = {
      a: p1,
      b: p2,
      sa: p1Score,
      sb: p2Score,
      d: String(payload.date || payload.d || ''),
      t: String(payload.title || payload.t || ''),
      n: String(payload.subtitle || payload.n || ''),
      sets: [{
        scoreA: p1Score,
        scoreB: p2Score,
        winner: seriesWinner,
        games
      }]
    };
    const key = `procomp:detail:${Date.now()}:${Math.random().toString(36).slice(2,7)}`;
    window._detReg = window._detReg || {};
    window._detReg[key] = {
      m: match,
      mode: 'procomp',
      lA: p1,
      lB: p2,
      ca,
      cb,
      aW: p1Score>p2Score,
      bW: p2Score>p1Score,
      idx: null
    };
    if(typeof openHistDetailModal === 'function'){
      openHistDetailModal(key);
      return;
    }
  }catch(e){
    console.warn('openProCompRecordDetailPopup failed', e);
  }
};
function _histProCompH2HCardHTML(opts){
  const o = opts || {};
  const p1 = String(o.p1||'');
  const p2 = String(o.p2||'');
  const p1Col = o.p1Col || '#3b82f6';
  const p2Col = o.p2Col || '#ef4444';
  const p1Score = Number(o.p1Score||0);
  const p2Score = Number(o.p2Score||0);
  const winner = String(o.winner||'');
  const badges = Array.isArray(o.badges) ? o.badges.filter(Boolean) : [];
  const actionHtml = o.actionHtml || '';
  const detailOnClick = o.detailOnClick ? String(o.detailOnClick) : '';
  const isMb = (typeof _h2hIsMobile === 'function') ? _h2hIsMobile() : (window.innerWidth <= 768);
  const scorePad = (typeof _h2hScorePadPx === 'function') ? _h2hScorePadPx() : (isMb ? 6 : 10);
  const scoreGap = (typeof _h2hScoreGapPx === 'function') ? _h2hScoreGapPx() : (isMb ? 8 : 10);
  const isTie = !winner && p1Score === p2Score && (p1Score + p2Score) > 0;
  const p1Bg = (typeof _h2hPlayerBgPanel === 'function')
    ? _h2hPlayerBgPanel(p1, winner === p1, !!winner && winner !== p1)
    : `<div style="padding:10px 12px;font-weight:900">${p1||'?'}</div>`;
  const p2Bg = (typeof _h2hPlayerBgPanel === 'function')
    ? _h2hPlayerBgPanel(p2, winner === p2, !!winner && winner !== p2)
    : `<div style="padding:10px 12px;font-weight:900">${p2||'?'}</div>`;
  const mode = (typeof _h2hCardMode === 'function') ? _h2hCardMode() : 'panel';
  const scoreColP1 = winner === p1 ? 'var(--win-col)' : winner === p2 ? 'var(--lose-col)' : (isTie ? '#b45309' : 'var(--text2)');
  const scoreColP2 = winner === p2 ? 'var(--win-col)' : winner === p1 ? 'var(--lose-col)' : (isTie ? '#b45309' : 'var(--text2)');
  const body = (typeof _h2hCardBody === 'function')
    ? _h2hCardBody(mode, { p1, p2, d:o.date||'', games:o.games||[] }, p1Score, p2Score, winner, p1Col, p2Col, '1fr auto 1fr', isMb, scorePad, scoreGap, '', p1Bg, p2Bg, scoreColP1, scoreColP2)
    : `<div style="display:flex;align-items:center;justify-content:space-between;padding:${isMb?'10px':'14px'}"><div>${p1}</div><div style="font-weight:900">${p1Score}:${p2Score}</div><div>${p2}</div></div>`;
  const wrapFx = (typeof _safeHeadToHeadSideFx === 'function') ? _safeHeadToHeadSideFx(p1Col, p2Col) : 'background:var(--white);';
  return `<div class="h2h-rec-card" style="border:var(--h2h-card-border,1px solid var(--border));border-bottom:var(--h2h-card-border-bottom,none);border-radius:var(--h2h-card-radius,12px);margin-bottom:var(--h2h-card-gap,8px);overflow:hidden;box-shadow:var(--h2h-card-shadow,none);${wrapFx||'background:var(--white);'}">
    <div${detailOnClick?` style="cursor:pointer" onclick="${detailOnClick}" title="경기 상세 열기"`:''}>
      ${body}
    </div>
    <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:${isMb?'7px 10px':'8px 14px'};background:var(--bg2);flex-wrap:wrap">
      ${badges.join('')}
      <span style="margin-left:auto"></span>
      ${actionHtml?`<span onclick="event.stopPropagation()">${actionHtml}</span>`:''}
    </div>
  </div>`;
}

// 대전기록 > 프로리그 > 대회 > 조별리그(리스트)
function _histProCompLeagueListHTML(){
  // proTourneys에서 완료된 경기만 추출 (조별리그)
  const allItems = [];
  (proTourneys||[]).forEach(tn => {
    // 조별리그 경기
    (tn.groups||[]).forEach((grp, gi) => {
      const gl = 'ABCDEFGHIJ'[gi]||gi;
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach((m, mi) => {
        if (!m.a||!m.b||!m.winner) return;
        // (요청사항) 조편성 관리에서 "기록 반영=대진표 기록(stage)"인 경우
        // 조별리그 기록 목록에 중복으로 노출되지 않도록 제외
        if (m._stageRecId || (grp._recTarget||'')==='stage') return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _gi:gi, _mi:mi, _stage:'조별리그', _stageDetail:`GROUP ${gl}`, _stageColor:col});
      });
    });
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar = ``;
  if (!allItems.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🏅</div><div class="empty-state-title">프로리그 대회 기록이 없습니다</div><div class="empty-state-desc">대회 경기를 입력하면 여기에 표시됩니다</div></div>`;

  let h = '';
  // 대회명별 그룹화
  const groups = {};
  allItems.forEach(m => {
    if (!groups[m._tnName]) groups[m._tnName] = [];
    groups[m._tnName].push(m);
  });

  const _tb = p => p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb = p => p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _avaPx = (()=>{ try{ const pc=parseInt(localStorage.getItem('su_procomp_avatar_pc')||'52',10)||52; const mb=parseInt(localStorage.getItem('su_procomp_avatar_mb')||'40',10)||40; const isMb=window.innerWidth<=768; return Math.max(18, Math.min(160, isMb?mb:pc)); }catch(e){ return 22; } })();
  const _avaFit = (()=>{ try{ const v=String(localStorage.getItem('su_procomp_avatar_fit')||'cover').trim(); return (v==='contain'||v==='cover'||v==='fill')?v:'cover'; }catch(e){ return 'cover'; } })();
  const _photo = (name)=>{ try{ return (typeof getPlayerPhotoHTML==='function') ? getPlayerPhotoHTML(name, _avaPx+'px', `margin-right:3px;object-fit:${_avaFit};vertical-align:middle;`) : ''; }catch(e){ return ''; } };

  h += sortBar;
  Object.entries(groups).forEach(([tnName, items]) => {
    h += `<div style="background:linear-gradient(135deg,var(--blue-l) 0%,var(--white) 100%);border:1.5px solid var(--blue-ll);border-left:4px solid #0891b2;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🏅</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#0891b2">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#0891b2;background:#e0f2fe;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m => {
      const pa = players.find(p=>String(p.name||'').trim()===String(m.a||'').trim());
      const pb = players.find(p=>String(p.name||'').trim()===String(m.b||'').trim());
      const aWin = m.winner==='A';
      const bWin = m.winner==='B';
      const _gcByUniv = (name, p)=>{
        try{
          const u = p && p.univ ? gc(p.univ) : '';
          return (u && u !== '#6b7280') ? u : gc(name||'');
        }catch(e){
          return gc(name||'');
        }
      };
      const ca = _gcByUniv(m.a, pa);
      const cb = _gcByUniv(m.b, pb);
      const _detailPayload = encodeURIComponent(JSON.stringify({
        title:'프로리그 대회 조별리그',
        subtitle:`${m._tnName||''} · ${m._stageDetail||''}`,
        p1:m.a, p2:m.b, p1Score:aWin?1:0, p2Score:bWin?1:0,
        winner:aWin?m.a:(bWin?m.b:''), date:m.d||'', games:[m]
      }));
      const _menuBtn = `<button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
        onclick="openRecActionMenu(event,{
          _btnEl:this,
          hideDetail:true,
          a:'${(m.a||'').replace(/'/g,"\\'")}',
          sa:${aWin?1:0},
          b:'${(m.b||'').replace(/'/g,"\\'")}',
          sb:${bWin?1:0},
          d:'${m.d||''}',
          mode:'procomp',
          idx:0,
          key:'',
          canShare:true,
          shareFn:()=>openProCompMatchShare('${(m.a||'').replace(/'/g,"\\'")}','${(m.b||'').replace(/'/g,"\\'")}',${aWin?1:0},${bWin?1:0},'${m.d||''}'),
          canEdit:${isLoggedIn?'true':'false'},
          canDel:${isLoggedIn?'true':'false'},
          editFn:${isLoggedIn?`()=>proCompEditMatch('${m._tnId||''}',${m._gi||0},${m._mi||0})`:'null'},
          delFn:${isLoggedIn?`()=>proCompDelMatch('${m._tnId||''}',${m._gi||0},${m._mi||0})`:'null'},
          canMove:false
        })">⋯</button>`;
      h += _histProCompH2HCardHTML({
        p1:m.a, p2:m.b, p1Col:ca, p2Col:cb,
        p1Score:aWin?1:0, p2Score:bWin?1:0,
        winner:aWin?m.a:(bWin?m.b:''),
        date:m.d||'', games:[m],
        badges:[
          `<span style="font-size:11px;color:var(--gray-l)">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e0f2fe;color:#0891b2">조별리그</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${m._stageColor};color:#fff">${m._stageDetail}</span>`,
          m.map?`<span style="font-size:11px;color:var(--gray-l)">🗺️ ${m.map}</span>`:'',
          pa&&pa.univ?`<span style="font-size:11px;color:${ca};font-weight:800">${pa.univ}</span>`:'',
          pb&&pb.univ?`<span style="font-size:11px;color:${cb};font-weight:800">${pb.univ}</span>`:''
        ],
        detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`,
        actionHtml:_menuBtn
      });
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 토너먼트 탭 (대진표 + 3위전)
══════════════════════════════════════ */
function histProCompTourneyHTML(_omitBar) {
  const _pcSubBar2=_omitBar?'':`<div class="fbar merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';histSub='procomp';render()">📅 조별리그</button>
    <button class="pill on" style="flex-shrink:0;white-space:nowrap">🗂️ 토너먼트</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';histSub='procomp';render()">🤝 팀전</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='gj';histSub='procomp';render()">⚔️ 중장전</button>
  </div>`;
  const allItems = [];
  (proTourneys||[]).forEach(tn => {
    // 1) (신규) 대진표 기록(라운드 기록) 기반
    if(tn && tn.stageRecords){
      const st = tn.stageRecords || {};
      const order=['64강','32강','16강','8강','4강','결승'];
      const colOf = (r)=>r==='결승'?'#f59e0b':r==='4강'?'#7c3aed':r==='8강'?'#dc2626':'#2563eb';
      let hasStageItems = false;
      order.forEach(r=>{
        (st[r]||[]).forEach((m, idx)=>{
          if(!m||!m.a||!m.b||!m.winner) return;
          if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
          hasStageItems = true;
          allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _round:r, _idx:idx, _stage:'토너먼트', _stageDetail:r, _stageColor:colOf(r), d:m.d||''});
        });
      });
      if(hasStageItems) return;
    }
    // 2) (호환) 기존 대진표(bracket) 기반
    const rounds = tn.bracket||[];
    const totalRounds = rounds.length;
    rounds.forEach((rnd, ri) => {
      // 라운드 표기: 16강/8강/4강/결승 (※ 4강=준결승)
      const rndLabel = ri===totalRounds-1?'결승':ri===totalRounds-2?'4강':ri===totalRounds-3?'8강':`${Math.pow(2,totalRounds-ri)}강`;
      const stageColor = ri===totalRounds-1?'#f59e0b':ri===totalRounds-2?'#7c3aed':ri===totalRounds-3?'#dc2626':'#2563eb';
      rnd.forEach(m => {
        if (!m.a||!m.b) return;
        const scoreA = (m._games||[]).filter(g=>g.winner==='A').length;
        const scoreB = (m._games||[]).filter(g=>g.winner==='B').length;
        const isTieSaved = (!m.winner && Array.isArray(m._games) && m._games.length>0 && scoreA===scoreB && (scoreA+scoreB)>0);
        if (!m.winner && !isTieSaved) return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _ri:ri, _mi:(m._mi!==undefined?m._mi:null), _stage:'토너먼트', _stageDetail:rndLabel, _stageColor:stageColor, d:m.d||'', _isTie:isTieSaved, _scoreA:scoreA, _scoreB:scoreB});
      });
    });
    if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.winner) {
      if (!(typeof passDateFilter==='function'&&!passDateFilter(tn.thirdPlace.d||''))) {
        allItems.push({...tn.thirdPlace, _tnName:tn.name, _tnId:tn.id, _ri:'3rd', _mi:0, _stage:'토너먼트', _stageDetail:'3위전', _stageColor:'#cd7f32', d:tn.thirdPlace.d||''});
      }
    }
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=``;
  if (!allItems.length) return _pcSubBar2+sortBar+`<div class="empty-state"><div class="empty-state-icon">🗂️</div><div class="empty-state-title">토너먼트 기록이 없습니다</div><div class="empty-state-desc">대진표 기록에서 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const groups={};
  allItems.forEach(m=>{if(!groups[m._tnName])groups[m._tnName]=[];groups[m._tnName].push(m);});
  const _tb=p=>p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _avaPx = (()=>{ try{ const pc=parseInt(localStorage.getItem('su_procomp_avatar_pc')||'52',10)||52; const mb=parseInt(localStorage.getItem('su_procomp_avatar_mb')||'40',10)||40; const isMb=window.innerWidth<=768; return Math.max(18, Math.min(160, isMb?mb:pc)); }catch(e){ return 22; } })();
  const _avaFit = (()=>{ try{ const v=String(localStorage.getItem('su_procomp_avatar_fit')||'cover').trim(); return (v==='contain'||v==='cover'||v==='fill')?v:'cover'; }catch(e){ return 'cover'; } })();
  const _photo = (name)=>{ try{ return (typeof getPlayerPhotoHTML==='function') ? getPlayerPhotoHTML(name, _avaPx+'px', `margin-right:3px;object-fit:${_avaFit};vertical-align:middle;`) : ''; }catch(e){ return ''; } };
  let h=_pcSubBar2+sortBar;
  Object.entries(groups).forEach(([tnName,items])=>{
    h+=`<div style="background:linear-gradient(135deg,#f5f3ff 0%,var(--white) 100%);border:1.5px solid #ddd6fe;border-left:4px solid #7c3aed;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🗂️</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#7c3aed">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#7c3aed;background:#f5f3ff;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m=>{
      const pa=players.find(p=>String(p.name||'').trim()===String(m.a||'').trim());
      const pb=players.find(p=>String(p.name||'').trim()===String(m.b||'').trim());
      const aWin=m.winner==='A', bWin=m.winner==='B';
      const _gcByUniv = (name, p)=>{
        try{
          const u = p && p.univ ? gc(p.univ) : '';
          return (u && u !== '#6b7280') ? u : gc(name||'');
        }catch(e){
          return gc(name||'');
        }
      };
      const ca = _gcByUniv(m.a, pa);
      const cb = _gcByUniv(m.b, pb);
      const _detailPayload = encodeURIComponent(JSON.stringify({
        title:'프로리그 대회 토너먼트',
        subtitle:`${m._tnName||''} · ${m._stageDetail||''}`,
        p1:m.a, p2:m.b,
        p1Score:m._isTie?(m._scoreA||0):(aWin?1:0),
        p2Score:m._isTie?(m._scoreB||0):(bWin?1:0),
        winner:m._isTie?'':(aWin?m.a:(bWin?m.b:'')),
        date:m.d||'',
        games:(Array.isArray(m._games)&&m._games.length)?m._games:[m]
      }));
      const _menuBtn = `<button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
        onclick="openRecActionMenu(event,{
          _btnEl:this,
          hideDetail:true,
          a:'${(m.a||'').replace(/'/g,"\\'")}',
          sa:${m._isTie?(m._scoreA||0):(aWin?1:0)},
          b:'${(m.b||'').replace(/'/g,"\\'")}',
          sb:${m._isTie?(m._scoreB||0):(bWin?1:0)},
          d:'${m.d||''}',
          mode:'procomptn',
          idx:0,
          key:'',
          canShare:true,
          shareFn:()=>openProCompMatchShare('${(m.a||'').replace(/'/g,"\\'")}','${(m.b||'').replace(/'/g,"\\'")}',${m._isTie?(m._scoreA||0):(aWin?1:0)},${m._isTie?(m._scoreB||0):(bWin?1:0)},'${m.d||''}'),
          canEdit:${isLoggedIn?'true':'false'},
          canDel:false,
          editFn:${isLoggedIn?`()=>{ try{ if(typeof openPcStageRecModal==='function' && m._round) openPcStageRecModal('${(m._tnId||'').replace(/'/g,"\\'")}', '${(m._round||'').replace(/'/g,"\\'")}', ${m._idx||0}); else if(typeof openPcBktPasteModal==='function') openPcBktPasteModal('${(m._tnId||'').replace(/'/g,"\\'")}', ${JSON.stringify(m._ri)}, ${m._mi||0}); }catch(e){} }`:'null'},
          canMove:false
        })">⋯</button>`;
      h+=_histProCompH2HCardHTML({
        p1:m.a, p2:m.b, p1Col:ca, p2Col:cb,
        p1Score:m._isTie?(m._scoreA||0):(aWin?1:0),
        p2Score:m._isTie?(m._scoreB||0):(bWin?1:0),
        winner:m._isTie?'':(aWin?m.a:(bWin?m.b:'')),
        date:m.d||'', games:m._games||[m],
        badges:[
          `<span style="font-size:11px;color:var(--gray-l)">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#f5f3ff;color:#7c3aed">토너먼트</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${m._stageColor};color:#fff">${m._stageDetail}</span>`,
          m._isTie?`<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:99px;background:#fffbeb;color:#b45309">⚖️ ${m._scoreA||0}:${m._scoreB||0}</span>`:'',
          m.map?`<span style="font-size:11px;color:var(--gray-l)">🗺️ ${m.map}</span>`:'',
          pa&&pa.univ?`<span style="font-size:11px;color:${ca};font-weight:800">${pa.univ}</span>`:'',
          pb&&pb.univ?`<span style="font-size:11px;color:${cb};font-weight:800">${pb.univ}</span>`:''
        ],
        detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`,
        actionHtml:_menuBtn
      });
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 팀전 탭
══════════════════════════════════════ */
function histProCompTeamHTML(_omitBar) {
  // proTourneys.teamMatches 전체 추출
  const tmList = []; // [{tnName, tm}]
  (proTourneys||[]).forEach(tn => {
    (tn.teamMatches||[]).forEach(tm => {
      const games = (tm.games||[]).filter(g=>g.wName&&g.lName);
      if (!games.length) return;
      if (typeof passDateFilter==='function'&&!passDateFilter(tm.d||'')) return;
      tmList.push({tnName:tn.name, tm});
    });
  });
  tmList.sort((a,b)=>recSortDir==='asc'?(a.tm.d||'').localeCompare(b.tm.d||''):(b.tm.d||'').localeCompare(a.tm.d||''));
  const totalGames = tmList.reduce((s,x)=>s+(x.tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
  const sortBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
    <span style="font-size:11px;color:var(--gray-l)">${totalGames}경기 / ${tmList.length}팀전</span>
  </div>`;
  if (!tmList.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🤝</div><div class="empty-state-title">팀전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 팀전 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const _tb=p=>p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _avaPx = (()=>{ try{ const pc=parseInt(localStorage.getItem('su_procomp_avatar_pc')||'52',10)||52; const mb=parseInt(localStorage.getItem('su_procomp_avatar_mb')||'40',10)||40; const isMb=window.innerWidth<=768; return Math.max(18, Math.min(160, isMb?mb:pc)); }catch(e){ return 22; } })();
  const _avaFit = (()=>{ try{ const v=String(localStorage.getItem('su_procomp_avatar_fit')||'cover').trim(); return (v==='contain'||v==='cover'||v==='fill')?v:'cover'; }catch(e){ return 'cover'; } })();
  const _photo = (name)=>{ try{ return (typeof getPlayerPhotoHTML==='function') ? getPlayerPhotoHTML(name, _avaPx+'px', `margin-right:3px;object-fit:${_avaFit};vertical-align:middle;`) : ''; }catch(e){ return ''; } };
  const _proSideCols = getFixedSideColors('pro');
  const colA=_proSideCols.a, colB=_proSideCols.b;
  let h=sortBar;
  // 대회명별 그룹
  const byTn={};
  tmList.forEach(({tnName,tm})=>{ if(!byTn[tnName])byTn[tnName]=[]; byTn[tnName].push(tm); });
  Object.entries(byTn).forEach(([tnName,tms])=>{
    const gCnt=tms.reduce((s,tm)=>s+(tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
    h+=`<div style="background:linear-gradient(135deg,#ecfdf5 0%,var(--white) 100%);border:1.5px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🤝</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#16a34a">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;border-radius:20px;padding:2px 10px;margin-left:auto">${tms.length}팀전 · ${gCnt}경기</span>
    </div>`;
    tms.forEach(tm=>{
      const aWin=tm.sa>tm.sb, bWin=tm.sb>tm.sa;
      const games=(tm.games||[]).filter(g=>g.wName&&g.lName);
      const _teamDetailPayload = encodeURIComponent(JSON.stringify({
        title:'프로리그 대회 팀전',
        subtitle:`${tnName||''} · ${tm.teamAName||'A팀'} vs ${tm.teamBName||'B팀'}`,
        p1:tm.teamAName||'A팀', p2:tm.teamBName||'B팀',
        p1Score:tm.sa||0, p2Score:tm.sb||0,
        winner:aWin?(tm.teamAName||'A팀'):(bWin?(tm.teamBName||'B팀'):''),
        date:tm.d||'', games:games
      }));
      h+=`<div class="rec-summary${_recSideFxClass('procompteam')}" data-rec-mode="procompteam" style="border:1.5px solid var(--border);border-radius:10px;padding:0;margin-bottom:10px;${_recSideFxStyle('procompteam',colA,colB)}">
        <div class="rec-sum-header rec-sum-header--stack" style="padding:10px 14px">
          <div class="rec-topline">
            <div class="rec-meta-row">
              <span class="rec-meta-chip">📅 ${tm.d||'날짜 미정'}</span>
              <span class="rec-meta-chip" style="background:#e0f2fe;border-color:#bae6fd;color:#0284c7">팀전</span>
              <span class="rec-meta-chip" style="background:${aWin?colA:bWin?colB:'#64748b'};border-color:${aWin?colA:bWin?colB:'#64748b'};color:#fff;cursor:pointer" onclick="window.openProCompRecordDetailPopup('${_teamDetailPayload}')" title="경기 상세 열기">${tm.sa||0}:${tm.sb||0}</span>
              <span class="rec-meta-chip">${games.length}경기</span>
            </div>
            <div class="rec-actions rec-actions--inline no-export">
              <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
                onclick="openRecActionMenu(event,{
                  _btnEl:this,
                  hideDetail:true,
                  a:'${(tm.teamAName||'A팀').replace(/'/g,"\\'")}',
                  sa:${tm.sa||0},
                  b:'${(tm.teamBName||'B팀').replace(/'/g,"\\'")}',
                  sb:${tm.sb||0},
                  d:'${tm.d||''}',
                  mode:'procomp-team',
                  idx:0,
                  key:'',
                  canShare:true,
                  shareFn:()=>openProCompMatchShare('${(tm.teamAName||'A팀').replace(/'/g,"\\'")}','${(tm.teamBName||'B팀').replace(/'/g,"\\'")}',${tm.sa||0},${tm.sb||0},'${tm.d||''}'),
                  canEdit:false,
                  canDel:false,
                  canMove:false
                })">⋯</button>
            </div>
          </div>
          <div class="rec-sum-vs" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center">
            <span style="font-weight:${aWin?900:700};color:${aWin?colA:'var(--text)'};font-size:14px">${tm.teamAName||'A팀'}</span>
            <span style="font-size:12px;color:var(--gray-l);font-weight:900">vs</span>
            <span style="font-weight:${bWin?900:700};color:${bWin?colB:'var(--text)'};font-size:14px">${tm.teamBName||'B팀'}</span>
          </div>
        </div>
        ${games.map(g=>{
          const pw=players.find(p=>p.name===g.wName), pl=players.find(p=>p.name===g.lName);
          const wNames = _histSearchSplitSideNames(g.wName);
          const lNames = _histSearchSplitSideNames(g.lName);
          const wDisplay = _histSearchTeamText(wNames);
          const lDisplay = _histSearchTeamText(lNames);
          const isTeamGame = wNames.length >= 2 || lNames.length >= 2;
          const sideWin=g._sideW==='A'?tm.teamAName||'A팀':tm.teamBName||'B팀';
          const winCol = g._sideW==='A' ? colA : colB;
          const loseCol = g._sideW==='A' ? colB : colA;
          const _detailPayload = encodeURIComponent(JSON.stringify({
            title:'프로리그 대회 팀전 세트',
            subtitle:`${tnName||''} · ${sideWin}`,
            p1:wDisplay, p2:lDisplay, p1Score:1, p2Score:0, winner:wDisplay, date:tm.d||'', games:[g]
          }));
          return _histProCompH2HCardHTML({
            p1:wDisplay, p2:lDisplay, p1Col:winCol, p2Col:loseCol,
            p1Score:1, p2Score:0, winner:wDisplay, date:tm.d||'', games:[g],
            badges:[
              `<span style="font-size:11px;color:var(--gray-l)">${tm.d?tm.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
              `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${winCol};color:#fff">${sideWin}</span>`,
              `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e0f2fe;color:#0284c7">${isTeamGame ? '2:2' : '팀전'}</span>`,
              g.map?`<span style="font-size:11px;color:var(--gray-l)">🗺️ ${g.map}</span>`:'',
              pw&&pw.univ?`<span style="font-size:11px;color:${winCol};font-weight:800">${pw.univ}</span>`:'',
              pl&&pl.univ?`<span style="font-size:11px;color:${loseCol};font-weight:800">${pl.univ}</span>`:''
            ],
            detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`
          });
        }).join('')}
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   ⚔️ 프로리그 대회 중장전 기록
══════════════════════════════════════ */
function histProCompGJHTML(_omitBar){
  const _pcGjBar=_omitBar?'':`<div class="fbar merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';histSub='procomp';render()">📅 조별리그</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='tourney';histSub='procomp';render()">🗂️ 토너먼트</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';histSub='procomp';render()">🤝 팀전</button>
    <button class="pill on" style="flex-shrink:0;white-space:nowrap">⚔️ 중장전</button>
  </div>`;
  const allSess=[];
  (proTourneys||[]).forEach(tn=>{
    (tn.gjMatches||[]).forEach(sess=>{
      allSess.push({...sess,tnName:tn.name});
    });
  });
  if(!allSess.length)return _pcGjBar+`<div class="empty-state"><div class="empty-state-icon">⚔️</div><div class="empty-state-title">프로리그 대회 중장전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 탭 → 중장전에서 입력하세요</div></div>`;
  allSess.sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  let h=_pcGjBar;
  allSess.forEach(sess=>{
    const p1w=(sess.games||[]).filter(g=>g.winner===sess.a).length;
    const p2w=(sess.games||[]).filter(g=>g.winner===sess.b).length;
    const winner=p1w>p2w?sess.a:p2w>p1w?sess.b:'';
    const _sid = String(sess._id||'').replace(/'/g,"\\'");
    const pa = players.find(p=>String(p.name||'').trim()===String(sess.a||'').trim());
    const pb = players.find(p=>String(p.name||'').trim()===String(sess.b||'').trim());
    const _gcByUniv = (name, p)=>{
      try{
        const u = p && p.univ ? gc(p.univ) : '';
        return (u && u !== '#6b7280') ? u : gc(name||'');
      }catch(e){
        return gc(name||'');
      }
    };
    const _pcgjColA=_gcByUniv(sess.a, pa);
    const _pcgjColB=_gcByUniv(sess.b, pb);
    const _detailBtn = `<button class="btn btn-w btn-xs no-export" onclick="openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')">📂 경기 상세</button>`;
    h += _histProCompH2HCardHTML({
      p1:sess.a, p2:sess.b, p1Col:_pcgjColA, p2Col:_pcgjColB,
      p1Score:p1w, p2Score:p2w, winner:winner,
      date:sess.d||'', games:(sess.games||[]),
      badges:[
        `<span style="font-size:11px;color:var(--gray-l)">${sess.d||'날짜 미정'}</span>`,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#dcfce7;color:#166534">중장전</span>`,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#0891b2;color:#fff">🎖️ ${sess.tnName||''}</span>`,
        `<span style="font-size:11px;color:var(--gray-l)">${(sess.games||[]).length}게임</span>`,
        pa&&pa.univ?`<span style="font-size:11px;color:${_pcgjColA};font-weight:800">${pa.univ}</span>`:'',
        pb&&pb.univ?`<span style="font-size:11px;color:${_pcgjColB};font-weight:800">${pb.univ}</span>`:'',
        winner?`<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:99px;background:${winner===sess.a?_pcgjColA:_pcgjColB};color:#fff">${winner} 승</span>`:''
      ],
      detailOnClick:`openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')`,
      actionHtml:_detailBtn
    });
  });
  return h;
}

// 팀 멤버 팝업 (프로리그, 미니, 대학, 티어, 토너먼트 등)
function openProMembersPopup(teamLabel, teamColor, members){
  try{
    if(!members || !members.length) return;

    // 이미 열린 모달이 있으면 닫기
    const existing = document.getElementById('proMembersModal');
    if(existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'proMembersModal';
    // modal-drag.js가 인식하도록 class 부여 (PC에서 헤더 드래그 이동)
    modal.className = 'modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:var(--z-top);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

    const membersHTML = members.map(mem => {
      const memName = typeof mem === 'string' ? mem : (mem.name || mem);
      const p = players.find(x => x.name === memName) || {};
      const pColor = gc(p.univ) || '#64748b';
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
          <span style="cursor:pointer" onclick="openPlayerModal('${memName.replace(/'/g,"\\'")}')">
            ${getPlayerPhotoHTML(memName, '44px')}
          </span>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:14px;color:#1f2937;cursor:pointer" onclick="openPlayerModal('${memName.replace(/'/g,"\\'")}')">${memName}</div>
            <div style="font-size:11px;color:#6b7280;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              ${p.univ ? `<span class="ubadge" style="background:${pColor};font-size:10px;padding:1px 6px;">${p.univ}</span>` : ''}
              ${p.tier ? `<span style="background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)};font-size:10px;padding:1px 6px;border-radius:4px;font-weight:700;">${p.tier}</span>` : ''}
              ${p.race ? `<span class="rbadge r${p.race}" style="font-size:10px;padding:1px 5px;">${p.race}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="mbox" style="background:#ffffff;border-radius:16px;max-width:420px;width:100%;max-height:80vh;overflow:auto;padding:18px 18px 16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div class="mtitle" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;cursor:move;user-select:none">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            <span style="width:12px;height:12px;border-radius:50%;background:${teamColor};flex-shrink:0"></span>
            <div style="min-width:0">
              <div style="margin:0;font-size:16px;font-weight:900;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${teamLabel} 참가자</div>
              <div style="font-size:12px;color:#6b7280;margin-top:2px">총 ${members.length}명</div>
            </div>
          </div>
          <button onclick="document.getElementById('proMembersModal').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;line-height:1">×</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${membersHTML}
        </div>
        <div style="margin-top:14px;display:flex;justify-content:center;">
          <button class="btn btn-w" onclick="document.getElementById('proMembersModal').remove()">닫기</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }catch(e){
    console.error('[openProMembersPopup] 오류:', e);
  }
}
