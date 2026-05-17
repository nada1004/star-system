/* 대회 조별 경기 입력/편집 모달 */

function grpAddMatchByDate(tnId, date){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const validGrp=tn.groups.find(g=>g.univs.length>=2)||tn.groups[0];
  if(!validGrp){alert('조를 먼저 만들어 주세요.');return;}
  const gi=tn.groups.indexOf(validGrp);
  validGrp.matches.push({a:'',b:'',d:date,sa:null,sb:null,sets:[]});
  const mi=validGrp.matches.length-1;
  save();grpMatchState={tnId,gi,mi};grpOpenMatchModal(tn,gi,mi);
}

function grpAddMatch(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const grp=tn.groups[gi];
  if(grp.univs.length<2){alert(tn.type==='tier'?'먼저 선수를 2명 이상 추가하세요.':'먼저 대학을 2개 이상 추가하세요.');return;}
  tn.groups[gi].matches.push({a:'',b:'',d:'',sa:null,sb:null,sets:[]});
  const mi=tn.groups[gi].matches.length-1;
  save();grpMatchState={tnId,gi,mi};grpOpenMatchModal(tn,gi,mi);
}

function grpEditMatch(tnId,gi,mi){
  grpMatchState={tnId,gi,mi};const tn=tourneys.find(t=>t.id===tnId);if(tn)grpOpenMatchModal(tn,gi,mi);
}

function grpDelMatch(tnId,gi,mi){
  if(!confirm('경기를 삭제하시겠습니까?\n⚠️ 선수 개인 전적도 롤백됩니다.'))return;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!tn.groups||!tn.groups[gi]||!tn.groups[gi].matches||!tn.groups[gi].matches[mi])return;
  revertMatchRecord(tn.groups[gi].matches[mi]);
  tn.groups[gi].matches.splice(mi,1);save();render();
}

function grpOpenMatchModal(tn,gi,mi){
  const grp=tn.groups[gi];const m=grp.matches[mi];
  const GL=['A','B','C','D','E','F','G','H','I','J'];const gl=GL[gi]||String.fromCharCode(65+gi);
  const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
  const isTierGrp=tn.type==='tier';
  const _glbl=isTierGrp?'선수':'대학';
  const _badgeColGrp=(name)=>isTierGrp?gc((players||[]).find(p=>p.name===name)?.univ||''):gc(name);
  const uOpts=`<option value="">— ${_glbl} 선택 —</option>`+grp.univs.map(u=>`<option value="${u}"${m.a===u?' selected':''}>${u}</option>`).join('');
  const uOptsB=`<option value="">— ${_glbl} 선택 —</option>`+grp.univs.map(u=>`<option value="${u}"${m.b===u?' selected':''}>${u}</option>`).join('');
  document.getElementById('grpMatchTitle').textContent=`GROUP ${gl}조 ${mi+1}경기 결과 입력`;
  document.getElementById('grpMatchBody').innerHTML=`
    <div style="background:${col}10;border:1px solid ${col}44;border-radius:10px;padding:14px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:${col};margin-bottom:10px">
        📋 GROUP ${gl}조 소속 ${_glbl}: ${grp.univs.map(u=>`<span style="background:${_badgeColGrp(u)};color:#fff;padding:1px 8px;border-radius:4px;font-size:11px;margin-left:4px">${u}</span>`).join('')}
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:1;min-width:130px">
          <div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:4px">🔵 ${isTierGrp?'선수 A':'팀 A 대학'}</div>
          <select id="gm-a" onchange="grpRefreshSets();" style="width:100%">${uOpts}</select>
        </div>
        <div style="font-size:16px;font-weight:800;color:var(--gray-l);padding-top:22px">VS</div>
        <div style="flex:1;min-width:130px">
          <div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:4px">🔴 ${isTierGrp?'선수 B':'팀 B 대학'}</div>
          <select id="gm-b" onchange="grpRefreshSets();" style="width:100%">${uOptsB}</select>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">📅 날짜</div>
          <input type="date" id="gm-date" value="${m.d||new Date().toISOString().slice(0,10)}" style="width:145px">
        </div>
      </div>
    </div>
    <div id="gm-sets"></div>
    <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;background:#fef9ee;border:1px solid #f59e0b44;border-radius:8px;padding:8px 12px">
      <span style="font-size:11px;font-weight:700;color:#f59e0b;white-space:nowrap">🎙️ 캐스터/스트리머</span>
      <input type="text" id="gm-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)" style="flex:1;min-width:0;padding:5px 9px;border:1px solid var(--border2);border-radius:7px;font-size:12px">
    </div>
    <div style="display:flex;gap:8px;margin-top:12px;padding-bottom:0;flex-wrap:wrap;align-items:center">
      <button class="btn btn-b btn-sm" onclick="grpAddSet()">+ 1세트</button>
      <button class="btn btn-w btn-sm" onclick="grpAddSet2()">+ 2세트</button>
      <button class="btn btn-w btn-sm" onclick="grpAddSet3()">🎯 에이스전</button>
      <button class="btn btn-p btn-sm" onclick="openGrpPasteModal()">📋 자동인식</button>
      <select id="gm-match-mode" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:12px;font-weight:700" title="경기방식">
        <option value="set">세트제</option>
        <option value="game">게임수 합산</option>
      </select>
      <button class="btn btn-g btn-sm" style="margin-left:auto" onclick="grpSaveMatch()">✅ 저장</button>
      <button class="btn btn-w btn-sm" onclick="cm('grpMatchModal')">취소</button>
    </div>`;
  om('grpMatchModal');
  grpRefreshSets();
}

function grpUpdateMemberList(){
  function mHTML(univ){
    if(!univ)return '';
    const mems=players.filter(p=>p.univ===univ);
    if(!mems.length)return `<span style="color:var(--gray-l)">스트리머 없음</span>`;
    return `<div style="display:flex;flex-wrap:wrap;gap:3px">${mems.map(p=>`<span style="font-size:11px;background:${gc(univ)}12;border:1px solid ${gc(univ)}44;padding:2px 7px;border-radius:4px">${p.name}<span style="color:var(--gray-l)">[${p.tier||'-'}/${p.race||'-'}]</span></span>`).join('')}</div>`;
  }
  const aEl=document.getElementById('gm-a'),bEl=document.getElementById('gm-b');
  const aDiv=document.getElementById('gm-a-mems'),bDiv=document.getElementById('gm-b-mems');
  if(aEl&&aDiv)aDiv.innerHTML=mHTML(aEl.value);
  if(bEl&&bDiv)bDiv.innerHTML=mHTML(bEl.value);
}

function grpRefreshSets(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  if(grpMatchState.gi==null||grpMatchState.mi==null)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];
  const aEl=document.getElementById('gm-a');const bEl=document.getElementById('gm-b');
  if(!aEl)return;
  const teamA=aEl.value,teamB=bEl?bEl.value:'';
  const tfs=window._grpTierFilters||[];
  const _existNamesA=new Set(), _existNamesB=new Set();
  (m.sets||[]).forEach(set=>{
    (set.games||[]).forEach(g=>{
      if(g.playerA) _existNamesA.add(g.playerA);
      if(g.playerB) _existNamesB.add(g.playerB);
    });
  });
  const mARaw=players.filter(p=>(p.univ===teamA||(teamA&&_existNamesA.has(p.name)))&&(tfs.length===0||tfs.includes(p.tier)));
  const mBRaw=players.filter(p=>(p.univ===teamB||(teamB&&_existNamesB.has(p.name)))&&(tfs.length===0||tfs.includes(p.tier)));
  const mA=[...new Map(mARaw.map(p=>[p.name,p])).values()];
  const mB=[...new Map(mBRaw.map(p=>[p.name,p])).values()];
  const tfLabel=tfs.length?` [${tfs.join('+')}]`:'';
  const optsA=`<option value="">A팀 스트리머${tfLabel}</option>`+mA.map(p=>`<option value="${p.name}"${_existNamesA.has(p.name)&&p.univ!==teamA?` style="color:#f59e0b"`:''} >${p.name}${p.univ!==teamA?` (${p.univ||'무소속'})`:''} [${p.tier||'-'}/${p.race||'-'}]</option>`).join('');
  const optsB=`<option value="">B팀 스트리머${tfLabel}</option>`+mB.map(p=>`<option value="${p.name}"${_existNamesB.has(p.name)&&p.univ!==teamB?` style="color:#f59e0b"`:''} >${p.name}${p.univ!==teamB?` (${p.univ||'무소속'})`:''} [${p.tier||'-'}/${p.race||'-'}]</option>`).join('');
  const setsEl=document.getElementById('gm-sets');if(!setsEl)return;
  if(!m.sets||!m.sets.length){setsEl.innerHTML='<div style="color:var(--gray-l);font-size:12px;margin:12px 0;padding:14px;background:var(--surface);border-radius:8px;text-align:center">세트를 추가하세요 ↓</div>';return;}
  let h='';
  m.sets.forEach((set,si)=>{
    const lbl=set.label||(si===2?'🎯 에이스전':`${si+1}세트`);
    const sA=set.scoreA||0,sB=set.scoreB||0;
    h+=`<div class="set-block${si===2?' ace':''}">
      <div class="set-title">
        <span class="set-badge${si===2?' ace':''}">${lbl}</span>
        <span style="font-size:12px;color:var(--gray-l)">경기 ${(set.games||[]).length}개 · <span class="${sA>sB?'wt':''}">${sA}</span>:<span class="${sB>sA?'wt':''}">${sB}</span></span>
        <button class="btn btn-r btn-xs" onclick="grpDelSet(${si})">세트 삭제</button>
      </div>`;
    (set.games||[]).forEach((g,gi2)=>{
      const _mapList=g.map&&!maps.includes(g.map)?[g.map,...maps]:maps;
      const mapOpts=_mapList.map(mp=>`<option value="${mp}"${g.map===mp?' selected':''}>${mp}${g.map===mp&&!maps.includes(mp)?' (기록값)':''}</option>`).join('');
      const dlIdA=`dl-a-${si}-${gi2}`, dlIdB=`dl-b-${si}-${gi2}`;
      const dlA=mA.map(p=>`<option value="${p.name}${p.univ!==teamA?' ('+p.univ+')':''}">${p.name}</option>`).join('');
      const dlB=mB.map(p=>`<option value="${p.name}${p.univ!==teamB?' ('+p.univ+')':''}">${p.name}</option>`).join('');
      h+=`<div class="game-row">
        <span style="font-size:11px;font-weight:700;color:var(--gray-l);min-width:40px">경기${gi2+1}</span>
        <datalist id="${dlIdA}">${dlA}</datalist>
        <input list="${dlIdA}" value="${g.playerA||''}" placeholder="A팀 스트리머 검색..." style="flex:1;min-width:80px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="grpSetGame(${si},${gi2},'playerA',this.value.split(' (')[0].trim())" onchange="grpSetGame(${si},${gi2},'playerA',this.value.split(' (')[0].trim())">
        <span style="font-size:11px;color:var(--gray-l)">vs</span>
        <datalist id="${dlIdB}">${dlB}</datalist>
        <input list="${dlIdB}" value="${g.playerB||''}" placeholder="B팀 스트리머 검색..." style="flex:1;min-width:80px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="grpSetGame(${si},${gi2},'playerB',this.value.split(' (')[0].trim())" onchange="grpSetGame(${si},${gi2},'playerB',this.value.split(' (')[0].trim())">
        <select onchange="grpSetGame(${si},${gi2},'map',this.value)" style="max-width:100px"><option value="">맵</option>${mapOpts}</select>
        <button class="win-btn ${g.winner==='A'?'win-sel':''}" onclick="grpSetGame(${si},${gi2},'winner','A');grpRefreshSets()">A 승</button>
        <button class="win-btn ${g.winner==='B'?'lose-sel':''}" onclick="grpSetGame(${si},${gi2},'winner','B');grpRefreshSets()">B 승</button>
        <button class="btn btn-r btn-xs" onclick="grpDelGame(${si},${gi2})">🗑️ 삭제</button>
      </div>`;
    });
    h+=`<button class="btn btn-w btn-sm" onclick="grpAddGame(${si})">+ 경기 추가</button></div>`;
  });
  setsEl.innerHTML=h;
}

function grpSetGame(si,gi,field,val){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];
  if(m.sets[si]&&m.sets[si].games[gi])m.sets[si].games[gi][field]=val;
}

function grpAddSet(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('최대 3세트(에이스전 포함)까지 가능합니다.');return;}
  m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});grpRefreshSets();
}

function grpAddSet2(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('이미 최대 세트입니다.');return;}
  if(m.sets.length<1)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  if(m.sets.length<2)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  grpRefreshSets();
}

function grpAddSet3(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('에이스전이 이미 있습니다.');return;}
  while(m.sets.length<3)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  grpRefreshSets();
}

function grpDelSet(si){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];m.sets.splice(si,1);grpRefreshSets();
}

function grpAddGame(si){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];
  if(!m||!m.sets||!m.sets[si])return;
  if(!m.sets[si].games)m.sets[si].games=[];
  m.sets[si].games.push({playerA:'',playerB:'',winner:'',map:''});grpRefreshSets();
}

function grpDelGame(si,gi2){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];m.sets[si].games.splice(gi2,1);grpRefreshSets();
}

function updateHistoryFromGame(game, date) {
  if (!game.playerA || !game.playerB) return;
  const pA = players.find(p => p.name === game.playerA);
  const pB = players.find(p => p.name === game.playerB);
  if (!pA || !pB) return;
  const isWinA = game.winner === 'A' || game.winner === game.playerA;
  if (!pA.history) pA.history = [];
  pA.history.unshift({
    opp: pB.name,
    result: isWinA ? '승' : '패',
    date: date || new Date().toISOString().slice(0,10),
    map: game.map || '',
    type: 'teamGame'
  });
  if (!pB.history) pB.history = [];
  pB.history.unshift({
    opp: pA.name,
    result: isWinA ? '패' : '승',
    date: date || new Date().toISOString().slice(0,10),
    map: game.map || '',
    type: 'teamGame'
  });
}

function grpSaveMatch(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const {gi,mi}=grpMatchState;const m=tn.groups[gi].matches[mi];
  m.d=document.getElementById('gm-date')?.value||'';
  m.a=document.getElementById('gm-a')?.value||'';
  m.b=document.getElementById('gm-b')?.value||'';
  const _grpCaster=(document.getElementById('gm-caster')?.value??'').trim();
  if(_grpCaster) m.caster=_grpCaster; else delete m.caster;
  if(!m.a||!m.b){alert('두 팀을 선택하세요.');return;}
  const matchId=m._id||genId();
  if(m._id)revertMatchRecord({...m,_id:matchId});
  m._id=matchId;
  let sa=0,sb=0;
  (m.sets||[]).forEach(set=>{
    let sA=0,sB=0;
    (set.games||[]).forEach(g=>{if(g.winner==='A')sA++;else if(g.winner==='B')sB++;});
    set.scoreA=sA;set.scoreB=sB;set.winner=sA>sB?'A':sB>sA?'B':'';
    if(set.winner==='A')sa++;else if(set.winner==='B')sb++;
  });
  const _grpMode = document.getElementById('gm-match-mode')?.value||'set';
  if(_grpMode==='game'){
    sa=(m.sets||[]).reduce((s,st)=>s+(st.scoreA||0),0);
    sb=(m.sets||[]).reduce((s,st)=>s+(st.scoreB||0),0);
  }
  m.sa=sa;m.sb=sb;
  const _modeLabel=tn.type==='tier'?'티어대회':'조별리그';
  (m.sets||[]).forEach((set, si)=>{
    (set.games||[]).forEach((g, gi)=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const gameMatchId = g._id || `${matchId}_s${si}_g${gi}`;
      g._id = gameMatchId;
      const sp = (x)=>String(x||'').split(/[,+，]/).map(v=>v.trim()).filter(Boolean);
      const aList = Array.isArray(g.teamA) ? g.teamA : (g.a1||g.a2 ? [g.a1,g.a2].filter(Boolean) : sp(g.playerA));
      const bList = Array.isArray(g.teamB) ? g.teamB : (g.b1||g.b2 ? [g.b1,g.b2].filter(Boolean) : sp(g.playerB));
      const isTeam = !!(g._isTeam || aList.length>=2 || bList.length>=2);
      if(isTeam && typeof applyTeamGameResult==='function'){
        let side = (g.winner==='A'||g.winner==='B') ? g.winner : '';
        if(!side){
          const w = String(g.winner||'').trim();
          if(aList.includes(w)) side='A';
          else if(bList.includes(w)) side='B';
        }
        applyTeamGameResult(aList, bList, side||'A', m.d||'', g.map||'', gameMatchId, _modeLabel);
      }else{
        const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
        const univW=g.winner==='A'?(m.a||''):(m.b||'');
        const univL=g.winner==='A'?(m.b||''):(m.a||'');
        applyGameResult(wn,ln,m.d,g.map||'',gameMatchId,univW,univL,_modeLabel);
      }
    });
  });
  if(tn.type==='tier'){
    const _ei=ttM.findIndex(x=>x._id===matchId);
    const _rec={_id:matchId,d:m.d,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,n:tn.name,compName:tn.name,teamALabel:m.a,teamBLabel:m.b,stage:'league'};
    if(_ei>=0)ttM[_ei]=_rec;else ttM.unshift(_rec);
  }
  save();cm('grpMatchModal');render();
  try{ if(tn.type==='tier' && typeof syncTierTtMHistory==='function') syncTierTtMHistory(); }catch(e){}
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
}

try{
  window.grpAddMatchByDate = grpAddMatchByDate;
  window.grpAddMatch = grpAddMatch;
  window.grpEditMatch = grpEditMatch;
  window.grpDelMatch = grpDelMatch;
  window.grpOpenMatchModal = grpOpenMatchModal;
  window.grpUpdateMemberList = grpUpdateMemberList;
  window.grpRefreshSets = grpRefreshSets;
  window.grpSetGame = grpSetGame;
  window.grpAddSet = grpAddSet;
  window.grpAddSet2 = grpAddSet2;
  window.grpAddSet3 = grpAddSet3;
  window.grpDelSet = grpDelSet;
  window.grpAddGame = grpAddGame;
  window.grpDelGame = grpDelGame;
  window.updateHistoryFromGame = updateHistoryFromGame;
  window.grpSaveMatch = grpSaveMatch;
}catch(e){}
