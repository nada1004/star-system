/* 대회 브라켓 경기 입력/편집 모달 */

function getBktMatch(tnId,rnd,mi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return null;
  const br=getBracket(tn);
  if(rnd===-1){
    if(!br.manualMatches)br.manualMatches=[];
    if(!br.manualMatches[mi])br.manualMatches[mi]={a:'',b:'',d:new Date().toISOString().slice(0,10),rndLabel:'',sa:null,sb:null,sets:[],_id:null};
    return br.manualMatches[mi];
  }
  if(!br.matchDetails)br.matchDetails={};
  const key=`${rnd}-${mi}`;
  if(!br.matchDetails[key])br.matchDetails[key]={a:'',b:'',d:new Date().toISOString().slice(0,10),sa:null,sb:null,sets:[],_id:null};
  return br.matchDetails[key];
}

function bktToggleDet(id,btn){
  const el=document.getElementById(id);if(!el)return;
  const open=el.style.display==='none'||!el.style.display;
  el.style.display=open?'block':'none';
  el.classList.toggle('open', open);
  if(btn){btn.textContent=open?'🔼 닫기':'📂 상세';}
}

function openBracketMatchModal(tnId,rnd,mi,teamA,teamB){
  bracketMatchState={tnId,rnd,mi,teamA,teamB};
  const m=getBktMatch(tnId,rnd,mi);if(!m)return;
  if(!m.a&&teamA)m.a=teamA;
  if(!m.b&&teamB)m.b=teamB;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const isManual=(rnd===-1);
  let rLabel='';
  if(isManual){
    rLabel=m.rndLabel||'토너먼트 경기';
  } else {
    const totalRounds=(()=>{const _ng=(tn.groups&&tn.groups.length>=2)?tn.groups.length:0;const _pc=Math.floor(_ng/2)*2;let _nr1=_pc>0?_pc:4;if(_ng%2===1)_nr1++;let r=0,x=_nr1*2;while(x>1){x=Math.ceil(x/2);r++;}return r||1;})();
    const roundLabels={1:'결승',2:'4강',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};
    rLabel=roundLabels[totalRounds-rnd]||((totalRounds-rnd)+'강');
  }
  const isTierBkt=tn&&tn.type==='tier';
  const _bktNames=isTierBkt?(players||[]).map(p=>p.name):getAllUnivs().map(u=>u.name);
  const _bktLbl=isTierBkt?'선수':'대학';
  const uOpts=`<option value="">— ${_bktLbl} 선택 —</option>`+_bktNames.map(n=>`<option value="${n}"${m.a===n?' selected':''}>${n}</option>`).join('');
  const uOptsB=`<option value="">— ${_bktLbl} 선택 —</option>`+_bktNames.map(n=>`<option value="${n}"${m.b===n?' selected':''}>${n}</option>`).join('');
  window._bracketMatchMode=true;
  document.getElementById('grpMatchTitle').textContent=isManual?`토너먼트 경기 입력`:`${rLabel} ${mi+1}경기 결과 입력`;
  document.getElementById('grpMatchBody').innerHTML=`
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:14px;margin-bottom:16px">
      ${isManual?`<div style="margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:4px">⚔️ 라운드 (예: 8강, 준결승, 결승)</div>
        <input type="text" id="gm-rndlabel" value="${m.rndLabel||''}" placeholder="라운드명 입력 (예: 준결승)" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:7px;font-size:13px">
      </div>`:''}
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:1;min-width:130px">
          <div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:4px">🔵 팀 A</div>
          <select id="gm-a" onchange="bktRefreshSets();" style="width:100%">${uOpts}</select>
        </div>
        <div style="font-size:16px;font-weight:800;color:var(--gray-l);padding-top:22px">VS</div>
        <div style="flex:1;min-width:130px">
          <div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:4px">🔴 팀 B</div>
          <select id="gm-b" onchange="bktRefreshSets();" style="width:100%">${uOptsB}</select>
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
    <div style="display:flex;gap:8px;margin-top:12px;padding-bottom:16px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-b btn-sm" onclick="bktAddSet()">+ 1세트</button>
      <button class="btn btn-w btn-sm" onclick="bktAddSet2()">+ 2세트</button>
      <button class="btn btn-w btn-sm" onclick="bktAddSet3()">🎯 에이스전</button>
      <button class="btn btn-p btn-sm" onclick="openBktPasteModal()">📋 붙여넣기</button>
      <select id="gm-match-mode" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:12px;font-weight:700" title="경기방식">
        <option value="set"${(m.mode||'set')==='set'?' selected':''}>세트제</option>
        <option value="game"${m.mode==='game'?' selected':''}>게임수 합산</option>
      </select>
      <button class="btn btn-g btn-sm" style="margin-left:auto" onclick="bktSaveMatch()">✅ 저장</button>
      <button class="btn btn-w btn-sm" onclick="cm('grpMatchModal')">취소</button>
    </div>`;
  om('grpMatchModal');
  bktRefreshSets();
}

function bktRefreshSets(){
  const {tnId,rnd,mi}=bracketMatchState;
  const m=getBktMatch(tnId,rnd,mi);if(!m)return;
  const aEl=document.getElementById('gm-a');const bEl=document.getElementById('gm-b');
  if(!aEl)return;
  const teamA=aEl.value,teamB=bEl?bEl.value:'';
  const tfs=window._grpTierFilters||[];
  const _existNamesA=new Set(), _existNamesB=new Set();
  const _splitNames = (v)=>String(v||'').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
  (m.sets||[]).forEach(set=>{
    (set.games||[]).forEach(g=>{
      _splitNames(g.playerA).forEach(name=>_existNamesA.add(name));
      _splitNames(g.playerB).forEach(name=>_existNamesB.add(name));
      if(g.a1) _existNamesA.add(g.a1);
      if(g.a2) _existNamesA.add(g.a2);
      if(g.b1) _existNamesB.add(g.b1);
      if(g.b2) _existNamesB.add(g.b2);
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
  let h=`<div style="margin-bottom:10px;padding:10px 12px;border:1px solid rgba(99,102,241,.18);background:linear-gradient(135deg,rgba(238,242,255,.96),rgba(248,250,252,.98));border-radius:10px;font-size:11px;color:#0f172a;line-height:1.6">
    <strong style="color:#4338ca">2대2 수동 입력 가능</strong>
    <span style="color:#475569"> 각 경기의 </span>
    <span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:20px;padding:0 7px;border-radius:999px;background:#e0e7ff;color:#4338ca;font-size:10px;font-weight:900;vertical-align:middle">2:2</span>
    <span style="color:#475569"> 버튼을 누르면 </span>
    <strong>A1/A2 vs B1/B2</strong>
    <span style="color:#475569"> 형태로 입력됩니다.</span>
  </div>`;
  m.sets.forEach((set,si)=>{
    const lbl=si===2?'🎯 에이스전':`${si+1}세트`;
    const sA=set.scoreA||0,sB=set.scoreB||0;
    h+=`<div class="set-block${si===2?' ace':''}">
      <div class="set-title">
        <span class="set-badge${si===2?' ace':''}">${lbl}</span>
        <span style="font-size:12px;color:var(--gray-l)">경기 ${(set.games||[]).length}개 · <span class="${sA>sB?'wt':''}">${sA}</span>:<span class="${sB>sA?'wt':''}">${sB}</span></span>
        <button class="btn btn-r btn-xs" onclick="bktDelSet(${si})">세트 삭제</button>
      </div>`;
    (set.games||[]).forEach((g,gi2)=>{
      const _mapList=g.map&&!maps.includes(g.map)?[g.map,...maps]:maps;
      const mapOpts=_mapList.map(mp=>`<option value="${mp}"${g.map===mp?' selected':''}>${mp}${g.map===mp&&!maps.includes(mp)?' (기록값)':''}</option>`).join('');
      const bdlIdA=`bdl-a-${si}-${gi2}`, bdlIdB=`bdl-b-${si}-${gi2}`;
      const bdlA=mA.map(p=>`<option value="${p.name}${p.univ!==teamA?' ('+p.univ+')':''}">${p.name}</option>`).join('');
      const bdlB=mB.map(p=>`<option value="${p.name}${p.univ!==teamB?' ('+p.univ+')':''}">${p.name}</option>`).join('');
      const _resA = g.winner==='A'?'win':(g.winner==='B'?'lose':'');
      const _resB = g.winner==='B'?'win':(g.winner==='A'?'lose':'');
      const _stA = univSelectStyle((mA.find(p=>p.name===g.playerA)||{}).univ, _resA);
      const _stB = univSelectStyle((mB.find(p=>p.name===g.playerB)||{}).univ, _resB);
      const _stA1 = univSelectStyle((mA.find(p=>p.name===g.a1)||{}).univ, _resA);
      const _stA2 = univSelectStyle((mA.find(p=>p.name===g.a2)||{}).univ, _resA);
      const _stB1 = univSelectStyle((mB.find(p=>p.name===g.b1)||{}).univ, _resB);
      const _stB2 = univSelectStyle((mB.find(p=>p.name===g.b2)||{}).univ, _resB);
      h+=`<div class="game-row">
        <span style="font-size:11px;font-weight:700;color:var(--gray-l);min-width:40px">경기${gi2+1}</span>
        ${g._isTeam?`<button class="btn btn-xs btn-b" onclick="bktSetGame(${si},${gi2},'_isTeam',false);bktSetGame(${si},${gi2},'a1','');bktSetGame(${si},${gi2},'a2','');bktSetGame(${si},${gi2},'b1','');bktSetGame(${si},${gi2},'b2','');bktSetGame(${si},${gi2},'playerA','');bktSetGame(${si},${gi2},'playerB','');bktRefreshSets()" title="일반 1:1 입력으로 전환">2:2</button>`:''}
        <datalist id="${bdlIdA}">${bdlA}</datalist>
        <datalist id="${bdlIdB}">${bdlB}</datalist>
        ${g._isTeam
          ? `<input data-bkt-a1="${si}-${gi2}" list="${bdlIdA}" value="${g.a1||''}" placeholder="A1" style="${_stA1};flex:1;min-width:72px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="var v=this.value.split(' (')[0].trim();bktSetGame(${si},${gi2},'a1',v);bktSetGame(${si},${gi2},'playerA',[v,'${(g.a2||'').replace(/'/g,"\\'")}'].filter(Boolean).join(','))" onchange="var v=this.value.split(' (')[0].trim();bktSetGame(${si},${gi2},'a1',v);bktSetGame(${si},${gi2},'playerA',[v,(document.querySelector('[data-bkt-a2=&quot;${si}-${gi2}&quot;]')?.value||'').split(' (')[0].trim()].filter(Boolean).join(','));bktRefreshSets()">
             <input data-bkt-a2="${si}-${gi2}" list="${bdlIdA}" value="${g.a2||''}" placeholder="A2" style="${_stA2};flex:1;min-width:72px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="var v=this.value.split(' (')[0].trim();bktSetGame(${si},${gi2},'a2',v);bktSetGame(${si},${gi2},'playerA',[(document.querySelector('[data-bkt-a1=&quot;${si}-${gi2}&quot;]')?.value||'').split(' (')[0].trim(),v].filter(Boolean).join(','))" onchange="var v=this.value.split(' (')[0].trim();bktSetGame(${si},${gi2},'a2',v);bktSetGame(${si},${gi2},'playerA',[(document.querySelector('[data-bkt-a1=&quot;${si}-${gi2}&quot;]')?.value||'').split(' (')[0].trim(),v].filter(Boolean).join(','));bktRefreshSets()">
             <span style="font-size:11px;color:var(--gray-l)">vs</span>
             <input data-bkt-b1="${si}-${gi2}" list="${bdlIdB}" value="${g.b1||''}" placeholder="B1" style="${_stB1};flex:1;min-width:72px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="var v=this.value.split(' (')[0].trim();bktSetGame(${si},${gi2},'b1',v);bktSetGame(${si},${gi2},'playerB',[v,'${(g.b2||'').replace(/'/g,"\\'")}'].filter(Boolean).join(','))" onchange="var v=this.value.split(' (')[0].trim();bktSetGame(${si},${gi2},'b1',v);bktSetGame(${si},${gi2},'playerB',[v,(document.querySelector('[data-bkt-b2=&quot;${si}-${gi2}&quot;]')?.value||'').split(' (')[0].trim()].filter(Boolean).join(','));bktRefreshSets()">
             <input data-bkt-b2="${si}-${gi2}" list="${bdlIdB}" value="${g.b2||''}" placeholder="B2" style="${_stB2};flex:1;min-width:72px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="var v=this.value.split(' (')[0].trim();bktSetGame(${si},${gi2},'b2',v);bktSetGame(${si},${gi2},'playerB',[(document.querySelector('[data-bkt-b1=&quot;${si}-${gi2}&quot;]')?.value||'').split(' (')[0].trim(),v].filter(Boolean).join(','))" onchange="var v=this.value.split(' (')[0].trim();bktSetGame(${si},${gi2},'b2',v);bktSetGame(${si},${gi2},'playerB',[(document.querySelector('[data-bkt-b1=&quot;${si}-${gi2}&quot;]')?.value||'').split(' (')[0].trim(),v].filter(Boolean).join(','));bktRefreshSets()">`
          : `<input data-bkt-a1="${si}-${gi2}" list="${bdlIdA}" value="${g.playerA||''}" placeholder="A팀 스트리머 검색..." style="${_stA};flex:1;min-width:80px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="bktSetGame(${si},${gi2},'playerA',this.value.split(' (')[0].trim())" onchange="bktSetGame(${si},${gi2},'playerA',this.value.split(' (')[0].trim());bktRefreshSets()">
             <span style="font-size:11px;color:var(--gray-l)">vs</span>
             <input data-bkt-b1="${si}-${gi2}" list="${bdlIdB}" value="${g.playerB||''}" placeholder="B팀 스트리머 검색..." style="${_stB};flex:1;min-width:80px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="bktSetGame(${si},${gi2},'playerB',this.value.split(' (')[0].trim())" onchange="bktSetGame(${si},${gi2},'playerB',this.value.split(' (')[0].trim());bktRefreshSets()">`}
        <select onchange="bktSetGame(${si},${gi2},'map',this.value)" style="max-width:100px"><option value="">맵</option>${mapOpts}</select>
        <button class="win-btn ${g.winner==='A'?'win-sel':''}" onclick="bktSetGame(${si},${gi2},'winner','A');bktRefreshSets()">A 승</button>
        <button class="win-btn ${g.winner==='B'?'lose-sel':''}" onclick="bktSetGame(${si},${gi2},'winner','B');bktRefreshSets()">B 승</button>
        <button class="btn btn-r btn-xs" onclick="bktDelGame(${si},${gi2})">🗑️</button>
      </div>`;
    });
    h+=`<div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-w btn-sm" onclick="bktAddGame(${si},false)">+ 경기 추가</button>
      <button class="btn btn-b btn-sm" onclick="bktAddGame(${si},true)">+ 2:2 경기 추가</button>
    </div></div>`;
  });
  setsEl.innerHTML=h;
}

function bktSetGame(si,gi,field,val){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;
  if(m.sets[si]&&m.sets[si].games[gi])m.sets[si].games[gi][field]=val;
}
function bktAddSet(){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('최대 3세트(에이스전 포함)까지 가능합니다.');return;}
  m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});bktRefreshSets();
}
function bktAddSet2(){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('이미 최대 세트입니다.');return;}
  if(m.sets.length<1)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  if(m.sets.length<2)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  bktRefreshSets();
}
function bktAddSet3(){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('에이스전이 이미 있습니다.');return;}
  while(m.sets.length<3)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  bktRefreshSets();
}
function bktDelSet(si){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;
  m.sets.splice(si,1);bktRefreshSets();
}
function bktAddGame(si, isTeam){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;
  if(!m.sets||!m.sets[si])return;
  if(!m.sets[si].games)m.sets[si].games=[];
  m.sets[si].games.push({playerA:'',playerB:'',winner:'',map:'',_isTeam:!!isTeam,a1:'',a2:'',b1:'',b2:''});bktRefreshSets();
}
function bktDelGame(si,gi2){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;
  if(!m.sets||!m.sets[si]||!m.sets[si].games)return;
  m.sets[si].games.splice(gi2,1);bktRefreshSets();
}

function bktSaveMatch(){
  const {tnId,rnd,mi}=bracketMatchState;
  const m=getBktMatch(tnId,rnd,mi);if(!m)return;
  m.d=document.getElementById('gm-date')?.value||new Date().toISOString().slice(0,10);
  m.a=document.getElementById('gm-a')?.value||'';
  m.b=document.getElementById('gm-b')?.value||'';
  const _bktCaster=(document.getElementById('gm-caster')?.value??'').trim();
  if(_bktCaster) m.caster=_bktCaster; else delete m.caster;
  if(!m.a||!m.b){alert('두 팀을 선택하세요.');return;}
  if(m.a===m.b){alert('같은 팀은 선택할 수 없습니다.');return;}
  if(rnd===-1){
    const rl=document.getElementById('gm-rndlabel');
    if(rl)m.rndLabel=rl.value.trim()||'토너먼트 경기';
  }
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
  const _bktMode = document.getElementById('gm-match-mode')?.value||'set';
  m.mode = _bktMode;
  if(_bktMode==='game'){
    sa=(m.sets||[]).reduce((s,st)=>s+(st.scoreA||0),0);
    sb=(m.sets||[]).reduce((s,st)=>s+(st.scoreB||0),0);
  }
  m.sa=sa;m.sb=sb;
  const tn=tourneys.find(t=>t.id===tnId);
  if(tn&&rnd!==-1){
    const br=getBracket(tn);
    const w=sa>sb?m.a:sb>sa?m.b:'';
    if(w)br.winners[`${rnd}-${mi}`]=w;
  }
  const _bktModeLabel=tn&&tn.type==='tier'?'티어대회':'대회';
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
        applyTeamGameResult(aList, bList, side||'A', m.d||'', g.map||'', gameMatchId, _bktModeLabel);
      }else{
        const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
        const univW=g.winner==='A'?(m.a||''):(m.b||'');
        const univL=g.winner==='A'?(m.b||''):(m.a||'');
        applyGameResult(wn,ln,m.d,g.map||'',gameMatchId,univW,univL,_bktModeLabel);
      }
    });
  });
  if(tn&&tn.type==='tier'){
    const _ei=ttM.findIndex(x=>x._id===matchId);
    const _rec={_id:matchId,d:m.d,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,n:tn.name,compName:tn.name,teamALabel:m.a,teamBLabel:m.b,stage:'bkt'};
    if(_ei>=0)ttM[_ei]=_rec;else ttM.unshift(_rec);
  }
  window._bracketMatchMode=false;
  save();cm('grpMatchModal');render();
  try{ if(tn&&tn.type==='tier' && typeof syncTierTtMHistory==='function') syncTierTtMHistory(); }catch(e){}
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
}

try{
  window.getBktMatch = getBktMatch;
  window.bktToggleDet = bktToggleDet;
  window.openBracketMatchModal = openBracketMatchModal;
  window.bktRefreshSets = bktRefreshSets;
  window.bktSetGame = bktSetGame;
  window.bktAddSet = bktAddSet;
  window.bktAddSet2 = bktAddSet2;
  window.bktAddSet3 = bktAddSet3;
  window.bktDelSet = bktDelSet;
  window.bktAddGame = bktAddGame;
  window.bktDelGame = bktDelGame;
  window.bktSaveMatch = bktSaveMatch;
}catch(e){}
