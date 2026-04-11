/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
   ?�� 구버???�어?�???�이??1??마이그레?�션
?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */
let _ttMigrated = false;
function _migrateTierTourneys(){
  if(_ttMigrated) return;
  _ttMigrated = true;
  let changed = false;
  (tourneys||[]).filter(t=>t.type==='tier').forEach(tn=>{
    if(!tn.id){tn.id=genId();changed=true;}
    if(!tn.groups){tn.groups=[];changed=true;}
    if(!tn.bracket){tn.bracket={slots:{},winners:{},champ:''};changed=true;}
  });
  // 기존 브라�?기록(_proKey가 ptn_?�로 ?�작)??stage:'bkt' 추�? �?_proKey ?�거
  (ttM||[]).forEach(r=>{
    if(r._proKey && r._proKey.startsWith('ptn_')){
      if(!r.stage){ r.stage='bkt'; changed=true; }
      delete r._proKey; changed=true;
    }
  });
  if(changed) save();
}

/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
   ?�� ?�??경기 붙여?�기 ?�괄 ?�력
?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */
let _grpPasteState = null; // {mode:'grp', tnId, gi, mi} or {mode:'bkt', tnId, rnd, mi}

/* ?�?� 브라�?경기 붙여?�기 ?�?� */
function openBktPasteModal(){
  const {tnId,rnd,mi,teamA,teamB}=bracketMatchState;
  _grpPasteState={mode:'bkt',tnId,rnd,mi};
  const m=getBktMatch(tnId,rnd,mi);if(!m)return;
  const tA=document.getElementById('gm-a')?.value||teamA||m.a||'';
  const tB=document.getElementById('gm-b')?.value||teamB||m.b||'';
  window._grpPasteMode=true;
  const textarea=document.getElementById('paste-input');
  const previewEl=document.getElementById('paste-preview');
  const applyBtn=document.getElementById('paste-apply-btn');
  const badge=document.getElementById('paste-summary-badge');
  const pendWarn=document.getElementById('paste-pending-warn');
  if(textarea)textarea.value='';
  if(previewEl)previewEl.innerHTML='';
  if(applyBtn){applyBtn.style.display='none';applyBtn.textContent='???�트???�용';}
  if(badge)badge.style.display='none';
  if(pendWarn)pendWarn.style.display='none';
  window._pasteResults=null;window._pasteErrors=null;
  const dateInput=document.getElementById('paste-date');
  if(dateInput)dateInput.value=m.d||'';
  const modeSel=document.getElementById('paste-mode');
  if(modeSel){modeSel.value='comp';modeSel.style.display='none';}
  const modeLabel=document.getElementById('paste-mode-label');
  if(modeLabel)modeLabel.style.display='none';
  const hintEl=document.getElementById('paste-mode-hint');
  if(hintEl)hintEl.innerHTML=`<span style="color:#1d4ed8;font-weight:700">?�️ 브라�?경기 ?�력 모드</span>${tA||tB?` ??<b>?�A: ${tA}</b> vs <b>?�B: ${tB}</b>`:''}`;
  const compWrap=document.getElementById('paste-comp-wrap');
  if(compWrap){
    const setOpts=(m.sets||[]).map((s,i)=>{const lbl=i===2?'?�� ?�이?�전':`${i+1}?�트`;return`<option value="${i}">${lbl}</option>`;}).join('');
    const teamInputs=(!tA&&!tB)?`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <label style="font-size:12px;font-weight:700">?�A:</label>
      <input id="bkt-paste-ta" placeholder="?�?�명 ?�력" style="font-size:12px;padding:3px 8px;border:1px solid var(--border2);border-radius:6px;width:100px">
      <label style="font-size:12px;font-weight:700">?�B:</label>
      <input id="bkt-paste-tb" placeholder="?�?�명 ?�력" style="font-size:12px;padding:3px 8px;border:1px solid var(--border2);border-radius:6px;width:100px">
    </div>`:'';
    compWrap.innerHTML=teamInputs+`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700">?�용 ?�트:</label>
      <select id="grp-paste-set-sel" style="font-size:12px;padding:3px 8px;border:1px solid var(--border2);border-radius:6px">
        <option value="new">???�트 추�?</option>${setOpts}
      </select></div>`;
    compWrap.style.display='block';
  }
  om('pasteModal');
}

/* ?�?� ?�??경기 붙여?�기: ?�반 pasteModal???�활???�?� */
function openGrpPasteModal(){
  _grpPasteState = {...grpMatchState, mode:'grp'};
  const tn = tourneys.find(t=>t.id===grpMatchState.tnId); if(!tn) return;
  const autoDetect = (grpMatchState.gi===null||grpMatchState.gi===undefined);
  const grp = autoDetect ? null : tn.groups[grpMatchState.gi];
  const m = (grp&&grpMatchState.mi!=null) ? grp.matches[grpMatchState.mi] : null;
  const teamA = document.getElementById('gm-a')?.value||(m?m.a:'')||'';
  const teamB = document.getElementById('gm-b')?.value||(m?m.b:'')||'';

  // ?�반 pasteModal???�되 ?�???�트 ?�용 모드�??�시
  window._grpPasteMode = true; // pasteApply?�서 ?�???�트 ?�용?�로 분기

  // pasteModal 초기??(openPasteModal 로직 ?�라??
  const textarea  = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (textarea)  textarea.value  = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn)  { applyBtn.style.display = 'none'; applyBtn.textContent = '???�트???�용'; }
  if (badge)     badge.style.display = 'none';
  if (pendWarn)  pendWarn.style.display = 'none';
  window._pasteResults = null;
  window._pasteErrors  = null;

  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = (m&&m.d) || '';

  // ?�?�형???�역???�???� ?�보 ?�내�??��?(?��? 처리)
  const modeWrap = document.querySelector('#pasteModal [id="paste-mode"]')?.closest('div');
  // 모드 ?�택 ?�기�??�???�내 배너 추�?
  const modeSel = document.getElementById('paste-mode');
  if(modeSel){ modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if(modeLabel) modeLabel.style.display='none';
  const hintEl = document.getElementById('paste-mode-hint');
  if(hintEl){
    if(autoDetect)
      hintEl.innerHTML=`<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#16a34a;font-weight:700">?�� ?�동?�식 모드</span> ???�수 ?�속 ?�?�을 ?�동?�로 ?�식???�당 �?경기???�?�합?�다.<br><span style="font-size:11px;color:#6b7280">?�???�른 조일 경우 교류?�으�?추�??��? ?�인?�니??</span></div>`;
    else
      hintEl.innerHTML=`<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">?�� 경기 지??모드</span> ??<b>${teamA||'?�A'}</b> vs <b>${teamB||'?�B'}</b><br><span style="font-size:11px;color:#6b7280">?�트 ?�택 ??붙여?�기?�면 ?�당 ?�트???�?�됩?�다.</span></div>`;
  }

  // ?�트 ?�택 ?�롭?�운 (경기 지??모드?�서 ??�� ?�시)
  const compWrap = document.getElementById('paste-comp-wrap');
  if(compWrap){
    if(!autoDetect){
      const setOpts = (m?.sets||[]).map((s,i)=>{
        const lbl = i===2?'?�� ?�이?�전':`${i+1}?�트`;
        const cnt=(s.games||[]).length;
        return `<option value="${i}">${lbl}${cnt?` (${cnt}게임 기존)`:''}  ????��?�기</option>`;
      }).join('');
      compWrap.style.display='flex';
      compWrap.innerHTML = `
        <label style="font-size:12px;font-weight:700;white-space:nowrap">추�????�트:</label>
        <select id="grp-paste-set-sel" style="padding:5px 10px;border-radius:6px;border:1px solid var(--border2);font-size:12px">
          <option value="new">+ ???�트 추�?</option>
          ${setOpts}
        </select>`;
    } else {
      compWrap.style.display='none';
    }
  }

  // 불필?�한 ?�션 ?�기�?
  const _pasteDetails=document.querySelector('#pasteModal details');
  if(_pasteDetails)_pasteDetails.style.display='none';
  // 경기 방식(?�차???�트?? ?�택?� ?�?�에?�도 ?�용 ???�시 ?��?
  const _matchModeDiv=document.getElementById('paste-match-mode-game')?.closest('div[style]');
  if(_matchModeDiv)_matchModeDiv.style.display='flex';
  // ?�트??기본값으�?초기??
  setPasteMatchMode('set');
  const _pTitle=document.querySelector('#pasteModal .mtitle');
  if(_pTitle)_pTitle.textContent='?�� 결과 붙여?�기';

  om('pasteModal');
}

// grpPasteApply: ?�???�트 ?�용 버튼 ?�들??(HTML?�서 직접 ?�출)
function grpPasteApply(){
  if(!window._pasteResults) return;
  const savable = window._pasteResults.filter(r=>r.wPlayer&&r.lPlayer);
  if(!savable.length){ alert('?�??가?�한 경기가 ?�습?�다.'); return; }
  const ok = _grpPasteApplyLogic(savable);
  if(ok){
    window._grpPasteMode = false;
    cm('pasteModal');
    window._pasteResults = null;
    window._pasteErrors  = null;
  }
}

// grpPasteApply ?��? 로직
function _grpPasteApplyLogic(savable){
  if(!_grpPasteState && window._grpPasteState) _grpPasteState = window._grpPasteState;
  if(!_grpPasteState){ alert('붙여?�기 ?�태가 초기?�되지 ?�았?�니?? ?�시 ?�도?�주?�요.'); return false; }
  const tn = (typeof _findTourneyById==='function' ? _findTourneyById(_grpPasteState.tnId) : null) || tourneys.find(t=>t.id===_grpPasteState.tnId);
  if(!tn) return false;
  // ?�로컴프 브라�?모드 분기
  if(_grpPasteState.mode==='pcbkt'){
    return typeof _pcBktPasteApplyLogic==='function' ? _pcBktPasteApplyLogic(savable,tn) : false;
  }
  if(_grpPasteState.mode==='pcgj'){
    return typeof _pcGJPasteApplyLogic==='function' ? _pcGJPasteApplyLogic(savable,tn) : false;
  }
  if(_grpPasteState.mode==='pcbktedit'){
    return typeof _pcBktEditPasteApplyLogic==='function' ? _pcBktEditPasteApplyLogic(savable) : false;
  }
  // 브라�?모드 분기
  if(_grpPasteState.mode==='bkt'){
    return _bktPasteApplyLogic(savable,tn);
  }

  // ?�동?�식 모드: gi가 null?�면 ?�수 ?�속 ?�?�으�??�/�??�동 ?��?
  let gi = _grpPasteState.gi, mi = _grpPasteState.mi;
  const autoDetect = (gi===null||gi===undefined);
  if(autoDetect){
    // 1. ?�수 ?�속 ?�?�에???�A/B 추출
    const univCount={};
    savable.forEach(r=>{
      [r.wPlayer?.univ,r.lPlayer?.univ].forEach(u=>{if(u&&u!=='무소??)univCount[u]=(univCount[u]||0)+1;});
    });
    const univRanked=Object.entries(univCount).sort((a,b)=>b[1]-a[1]);
    if(univRanked.length<2){alert('?�수 ?�속 ?�?�을 ?�식?????�습?�다.\n조편?�에 ?�록???�수�??�력?�주?�요.');return false;}
    const autoA=univRanked[0][0], autoB=univRanked[1][0];
    // 2. ???�??같�? 조에 ?�는지 ?�인
    const groupIdx=tn.groups.findIndex(g=>g.univs.includes(autoA)&&g.univs.includes(autoB));
    if(groupIdx<0){
      // 같�? 조�? ?�니�?autoA??조에 교류?�으�?추�?
      const giA=tn.groups.findIndex(g=>g.univs.includes(autoA));
      const giB=tn.groups.findIndex(g=>g.univs.includes(autoB));
      if(giA<0&&giB<0){alert(`"${autoA}"?� "${autoB}" 모두 조편?�에 ?�습?�다.\n조편?�에???�당 ?�?�을 추�??�주?�요.`);return false;}
      const targetGi=giA>=0?giA:giB;
      const GL='ABCDEFGHIJ';
      const msg=(giA>=0&&giB>=0)
        ?`"${autoA}"(${GL[giA]}�??� "${autoB}"(${GL[giB]}�????�른 조입?�다.\n${GL[targetGi]}조에 교류?�으�?추�??�시겠습?�까?`
        :`"${giA<0?autoA:autoB}"??조편?�에 ?�습?�다.\n${GL[targetGi]}조에 경기�?추�??�시겠습?�까?`;
      if(!confirm(msg))return false;
      gi=targetGi;
    } else {
      gi=groupIdx;
    }
    // 3. 기존 경기 찾기 ?�는 ?�로 ?�성
    const grpM=tn.groups[gi].matches;
    let existIdx=grpM.findIndex(m=>(m.a===autoA&&m.b===autoB)||(m.a===autoB&&m.b===autoA));
    if(existIdx<0){
      grpM.push({a:autoA,b:autoB,sa:null,sb:null,sets:[]});
      existIdx=grpM.length-1;
    }
    mi=existIdx;
    _grpPasteState.gi=gi;_grpPasteState.mi=mi;
  }

  const m = tn.groups[gi].matches[mi];
  const teamA = document.getElementById('gm-a')?.value||m.a||'';
  const teamB = document.getElementById('gm-b')?.value||m.b||'';
  const isGameMode = window._pasteMatchMode !== 'set'; // ?�차??모드 ?��?

  const teamANamesSet = new Set(players.filter(p=>p.univ===teamA).map(p=>p.name));
  const teamBNamesSet = new Set(players.filter(p=>p.univ===teamB).map(p=>p.name));
  // ?� 배정: ?�속 ?�???�선, 무소?????�느 ?�?�도 ?�으�?붙여?�기 좌측 ?�치(leftName)�??�단
  const _isWinnerInA = (r) => {
    const wn = r.wPlayer.name;
    if(teamANamesSet.has(wn)) return true;
    if(teamBNamesSet.has(wn)) return false;
    return (r.leftName||r.winName) === wn; // 무소?? 붙여?�기 좌측=A?� 기�?
  };

  if(!m.sets) m.sets=[];
  if(!m.a) m.a=teamA;
  if(!m.b) m.b=teamB;

  let toastMsg='';

  if(isGameMode){
    // ?�?� ?�차??모드: 모든 게임???�일 ?�트???�적 ?�?�
    if(!m.sets[0]) m.sets.unshift({games:[],scoreA:0,scoreB:0,winner:'',label:'경기 기록'});
    const gset = m.sets[0];
    if(!gset.games) gset.games=[];
    savable.forEach(r=>{
      const wn=r.wPlayer.name; const ln=r.lPlayer.name;
      const wInA=_isWinnerInA(r);
      gset.games.push({playerA:wInA?wn:ln, playerB:wInA?ln:wn, winner:wInA?'A':'B', map:r.map||''});
    });
    let gA=0,gB=0;
    gset.games.forEach(g=>{ if(g.winner==='A')gA++; else if(g.winner==='B')gB++; });
    gset.scoreA=gA; gset.scoreB=gB; gset.winner=gA>gB?'A':gB>gA?'B':'';
    // 경기 ?�수 = �?게임 ?�수
    m.sa=gA; m.sb=gB;
    toastMsg=`??${savable.length}�?추�??? (경기 방식: ${gA}:${gB})`;
  } else {
    // ?�?� ?�트??모드: �?붙여?�기 = ???�트 ?�?�
    let setIdxEl = document.getElementById('grp-paste-set-sel');
    let setIdx = setIdxEl ? setIdxEl.value : 'new';
    if(setIdx==='new'||setIdx===undefined){
      if(m.sets.length>=3){ alert('최�? 3?�트까�?�?가?�합?�다.'); return false; }
      m.sets.push({games:[],scoreA:0,scoreB:0,winner:''});
      setIdx = m.sets.length-1;
    } else {
      setIdx = parseInt(setIdx);
      // 기존 ?�트???�이?��? ?�으�???��?�기 ?�인 ??초기??
      const existSet = m.sets[setIdx];
      if(existSet && existSet.games && existSet.games.length>0){
        if(!confirm(`${setIdx===2?'?�이?�전':(setIdx+1)+'?�트'}???��? ${existSet.games.length}게임???�습?�다.\n기존 기록??지?�고 ?�로 ?�력?�시겠습?�까?`))return false;
        existSet.games=[];
      }
    }
    const set = m.sets[setIdx];
    if(!set.games) set.games=[];
    savable.forEach(r=>{
      const wn=r.wPlayer.name; const ln=r.lPlayer.name;
      const wInA=_isWinnerInA(r);
      set.games.push({playerA:wInA?wn:ln, playerB:wInA?ln:wn, winner:wInA?'A':'B', map:r.map||''});
    });
    let sA=0,sB=0;
    set.games.forEach(g=>{ if(g.winner==='A')sA++; else if(g.winner==='B')sB++; });
    set.scoreA=sA; set.scoreB=sB; set.winner=sA>sB?'A':sB>sA?'B':'';
    // 경기 ?�수 = ?�트 ?�수
    let mSA=0,mSB=0;
    m.sets.forEach(s=>{ if(s.winner==='A')mSA++; else if(s.winner==='B')mSB++; });
    m.sa=mSA; m.sb=mSB;
    toastMsg=`??${savable.length}�?${setIdx===2?'?�이?�전':(setIdx+1)+'?�트'}??추�???`;
  }

  const dateEl = document.getElementById('paste-date');
  if(dateEl&&dateEl.value) m.d=dateEl.value;

  // 개인 ?�적 반영: 기존 기록 먼�? 롤백 ???�체 ?�트 ?�적??(grpSaveMatch?� ?�일 ?�턴 ???�중?�??방�?)
  if(m._id) revertMatchRecord({...m, _id:m._id});
  const matchId = genId();
  m._id = matchId;
  const dateStr = dateEl?.value || m.d || '';
  (m.sets||[]).forEach(set=>{
    (set.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(teamA||m.a||''):(teamB||m.b||'');
      const univL=g.winner==='A'?(teamB||m.b||''):(teamA||m.a||'');
      applyGameResult(wn,ln,dateStr,g.map||'',matchId,univW,univL,tn.type==='tier'?'?�어?�??:'조별리그');
    });
  });
  // ?�어?�?? ttM?�도 ?�기??(기록 ??��???�시?�도�?
  if(tn.type==='tier'){
    const _ei=ttM.findIndex(x=>x._id===matchId);
    const _rec={_id:matchId,d:dateStr||m.d,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,n:tn.name,compName:tn.name,teamALabel:m.a,teamBLabel:m.b,stage:'league'};
    if(_ei>=0)ttM[_ei]=_rec;else ttM.unshift(_rec);
  }

  save();
  // ?�중?�??방�?: ?�집 모달 + 붙여?�기 모달 모두 ?�기
  window._grpPasteMode = false;
  cm('grpMatchModal');
  cm('pasteModal');
  window._pasteResults = null;
  render();

  const toast=document.createElement('div');
  toast.textContent=toastMsg;
  toast.style.cssText='position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(),2500);
  return true;
}

function _bktPasteApplyLogic(savable, tn){
  const {rnd,mi}=_grpPasteState;
  const m=getBktMatch(tn.id,rnd,mi);if(!m)return false;
  let teamA=document.getElementById('gm-a')?.value||document.getElementById('bkt-paste-ta')?.value||m.a||bracketMatchState?.teamA||'';
  let teamB=document.getElementById('gm-b')?.value||document.getElementById('bkt-paste-tb')?.value||m.b||bracketMatchState?.teamB||'';
  // ?��?미설?????�수 ?�속 ?�?�으�??�동 감�? (붙여?�기 좌측=A?�, ?�측=B?�)
  if(!teamA&&!teamB&&savable.length>0){
    const leftCnt={},rightCnt={};
    savable.forEach(r=>{
      const isWinLeft=(r.leftName||r.winName)===r.wPlayer.name;
      const lpName=isWinLeft?r.wPlayer.name:r.lPlayer.name;
      const rpName=isWinLeft?r.lPlayer.name:r.wPlayer.name;
      const lu=players.find(p=>p.name===lpName)?.univ;
      const ru=players.find(p=>p.name===rpName)?.univ;
      if(lu)leftCnt[lu]=(leftCnt[lu]||0)+1;
      if(ru)rightCnt[ru]=(rightCnt[ru]||0)+1;
    });
    const topL=Object.entries(leftCnt).sort((a,b)=>b[1]-a[1])[0];
    const topR=Object.entries(rightCnt).sort((a,b)=>b[1]-a[1])[0];
    if(topL)teamA=topL[0];
    if(topR&&topR[0]!==teamA)teamB=topR[0];
  }
  let setIdxEl=document.getElementById('grp-paste-set-sel');
  let setIdx=setIdxEl?setIdxEl.value:'new';
  if(!m.sets)m.sets=[];
  if(setIdx==='new'||setIdx===undefined){
    if(m.sets.length>=3){alert('최�? 3?�트까�?�?가?�합?�다.');return false;}
    m.sets.push({games:[],scoreA:0,scoreB:0,winner:''});
    setIdx=m.sets.length-1;
  } else {
    setIdx=parseInt(setIdx);
    // 기존 ?�트???�이?��? ?�으�???��?�기 ?�인 ??초기??
    const existSet=m.sets[setIdx];
    if(existSet&&existSet.games&&existSet.games.length>0){
      if(!confirm(`${setIdx===2?'?�이?�전':(setIdx+1)+'?�트'}???��? ${existSet.games.length}게임???�습?�다.\n기존 기록??지?�고 ?�로 ?�력?�시겠습?�까?`))return false;
      existSet.games=[];
    }
  }
  const set=m.sets[setIdx];
  if(!set.games)set.games=[];
  const teamANamesSet=new Set(players.filter(p=>p.univ===teamA).map(p=>p.name));
  const teamBNamesSet=new Set(players.filter(p=>p.univ===teamB).map(p=>p.name));
  const _isWinnerInA=(r)=>{
    const wn=r.wPlayer.name;
    if(teamANamesSet.has(wn))return true;
    if(teamBNamesSet.has(wn))return false;
    return (r.leftName||r.winName)===wn;
  };
  savable.forEach(r=>{
    const wn=r.wPlayer.name;const ln=r.lPlayer.name;
    let pA='',pB='',winner='';
    if(_isWinnerInA(r)){pA=wn;pB=ln;winner='A';}
    else{pA=ln;pB=wn;winner='B';}
    set.games.push({playerA:pA,playerB:pB,winner:winner,map:r.map||''});
  });
  let sA=0,sB=0;
  set.games.forEach(g=>{if(g.winner==='A')sA++;else if(g.winner==='B')sB++;});
  set.scoreA=sA;set.scoreB=sB;set.winner=sA>sB?'A':sB>sA?'B':'';
  if(!m.a)m.a=teamA;if(!m.b)m.b=teamB;
  const dateEl=document.getElementById('paste-date');
  if(dateEl&&dateEl.value)m.d=dateEl.value;
  if(!m.d)m.d=new Date().toISOString().slice(0,10);
  // ?�체 ?�트 집계�?경기 최종 ?�코??갱신
  let mSA=0,mSB=0;
  (m.sets||[]).forEach(s=>{if(s.winner==='A')mSA++;else if(s.winner==='B')mSB++;});
  m.sa=mSA;m.sb=mSB;
  // 브라�??�자 ?�동 ?�데?�트 (?�동 추�? 경기 rnd===-1?� ?�킵)
  if(_grpPasteState.rnd!==-1){
    const _bw=mSA>mSB?m.a:mSB>mSA?m.b:'';
    if(_bw){const _bbr=getBracket(tn);_bbr.winners[`${_grpPasteState.rnd}-${_grpPasteState.mi}`]=_bw;}
  }
  // 개인 ?�적 반영: 기존 기록 먼�? 롤백 ???�체 ?�트 ?�적??(?�중?�??방�?)
  if(m._id) revertMatchRecord({...m, _id:m._id});
  const matchId=genId();
  m._id=matchId;
  const dateStr=m.d;
  (m.sets||[]).forEach(s=>{
    (s.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(m.a||''):(m.b||'');
      const univL=g.winner==='A'?(m.b||''):(m.a||'');
      applyGameResult(wn,ln,dateStr,g.map||'',matchId,univW,univL,'?�??);
    });
  });
  save();
  const _matchModal=document.getElementById('grpMatchModal');
  if(_matchModal&&_matchModal.style.display!=='none'&&_matchModal.offsetParent!==null){
    bktRefreshSets();
  } else {
    render();
  }
  const toast=document.createElement('div');
  toast.textContent=`??${savable.length}�?${setIdx===2?'?�이?�전':(setIdx+1)+'?�트'}??추�???`;
  toast.style.cssText='position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(),2500);
  return true;
}

/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
   ?�� ?�어?�??- CK 방식 경기 ?�력
?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */
// _ttSub, _ttCurComp: constants.js?�서 ?�언 �?localStorage 복원

function rTierTourTab(C, T){
  _migrateTierTourneys();
  T.innerText = '?�� ?�어?�??;
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const tierTourneys = (tourneys||[]).filter(t=>t.type==='tier');
  if(_ttCurComp && !tierTourneys.find(t=>t.name===_ttCurComp)) _ttCurComp='';
  if(!_ttCurComp && tierTourneys.length) _ttCurComp=tierTourneys[0].name;
  let h='';
  h+=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px">
    <span style="font-weight:700;color:#7c3aed;white-space:nowrap">?�� ?�어?�???�택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="_ttCurComp=this.value;render()">
      <option value="">???�?��? ?�택?�세????/option>
      ${tierTourneys.map(t=>{const _tDates=[];(t.groups||[]).forEach(g=>(g.matches||[]).forEach(m=>{if(m.d&&m.sa!=null)_tDates.push(m.d);}));(ttM||[]).filter(m=>m.compName===t.name&&m.d).forEach(m=>_tDates.push(m.d));_tDates.sort();const _ds=_tDates.length?` (${_tDates[0].slice(2).replace(/-/g,'/')}${_tDates.length>1&&_tDates[0]!==_tDates[_tDates.length-1]?'~'+_tDates[_tDates.length-1].slice(2).replace(/-/g,'/'):''})`:(t.createdAt?` (${t.createdAt.slice(0,10)})`:'');return`<option value="${t.name}"${_ttCurComp===t.name?' selected':''}>${t.name}${_ds}</option>`;}).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-p btn-xs" onclick="grpNewTierTourney()">+ 추�?</button>`:''}
    ${_ttCurComp&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="grpRenameTierTourney()" title="?�?�명 ?�정">?�️ ?�름?�정</button>
    <button class="btn btn-r btn-xs" onclick="grpDelTierTourney()" title="?�재 ?�어?�????��">?���???��</button>`:''}
  </div>`;
  if(!tierTourneys.length){
    h+=`<div style="padding:60px 20px;text-align:center;color:var(--gray-l)">?�성???�어?�?��? ?�습?�다.</div>`;
    C.innerHTML=h; return;
  }
  const _curTierTn=(tourneys||[]).find(t=>t.name===_ttCurComp&&t.type==='tier');
  // ?�효?��? ?��? _ttSub 리셋
  const _validSubs=['input','records','rank','league','grprank','tourschedule','tourrecords','grpedit'];
  if(!_validSubs.includes(_ttSub)) _ttSub='records';
  if(_ttSub==='input'&&!isLoggedIn) _ttSub='records';
  if(_ttSub==='grpedit'&&!isLoggedIn) _ttSub='records';
  const subOpts=[
    ...(isLoggedIn?[{id:'input',lbl:'?�� 경기 ?�력',fn:`_ttSub='input';render()`}]:[]),
    {id:'records',lbl:'?�� 기록',fn:`_ttSub='records';openDetails={};render()`},
    {id:'rank',lbl:'?�� 개인 ?�위',fn:`_ttSub='rank';render()`},
    {id:'league',lbl:'?�� 조별리그',fn:`_ttSub='league';render()`},
    {id:'grprank',lbl:'?�� 조별 ?�위',fn:`_ttSub='grprank';render()`},
    {id:'tourschedule',lbl:'?���??�너먼트',fn:`_ttSub='tourschedule';render()`},
    ...(isLoggedIn?[{id:'grpedit',lbl:'?���?조편??,fn:`_ttSub='grpedit';grpSub='edit';render()`}]:[]),
  ];
  h+=`<div class="stabs no-export">${subOpts.map(o=>`<button class="stab ${_ttSub===o.id?'on':''}" onclick="${o.fn}">${o.lbl}</button>`).join('')}</div>`;
  const _noTnMsg='<div style="padding:40px;text-align:center;color:var(--gray-l)">?�?��? ?�택?�세??</div>';
  if(_ttSub==='input' && isLoggedIn){
    if(!BLD['tt'])BLD['tt']={date:'',tiers:[],membersA:[],membersB:[],sets:[]};
    h+=buildTierTourInputHTML();
  } else if(_ttSub==='rank'){
    h+=ttPlayerRankHTML(_ttCurComp);
  } else if(_ttSub==='league'){
    h+=_curTierTn ? rCompLeague(_curTierTn) : _noTnMsg;
  } else if(_ttSub==='grprank'){
    h+=_curTierTn ? rCompGrpRankFull(_curTierTn) : _noTnMsg;
  } else if(_ttSub==='tourschedule'){
    h+=_curTierTn ? proCompBracket(_curTierTn) : _noTnMsg;
  } else if(_ttSub==='grpedit'){
    if(!_curTierTn){ h+=_noTnMsg; C.innerHTML=h; return; }
    // grpSub='list'?� rGrpEditInner??'??목록' 버튼?�서 발생 ??기록 ??���??�환
    if(grpSub!=='edit'){ _ttSub='records'; C.innerHTML=h; render(); return; }
    grpEditId=_curTierTn.id;
    h+=rGrpEditInner();
  } else {
    // records ??
    const _ttFiltered=_ttCurComp ? ttM.filter(m=>m.compName===_ttCurComp) : ttM;
    if(_ttCurComp) h+=`<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#7c3aed;font-weight:700">?�� ${_ttCurComp} 기록</div>`;
    
    h+=_ttFiltered.length?recSummaryListHTML(_ttFiltered,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">기록???�습?�다.</div>';
  }
  C.innerHTML=h;
}

// ?�트리머 ?�세 최근 기록?�서 ?�어?�???�릭 ???�당 경기�??�동
function navToTierMatch(matchId){
  let m=(ttM||[]).find(x=>x._id===matchId);
  if(!m&&matchId){for(const tn of (tourneys||[]).filter(t=>t.type==='tier')){for(const grp of (tn.groups||[])){const found=(grp.matches||[]).find(x=>x._id===matchId);if(found&&found.sa!=null){const _rec={_id:matchId,d:found.d,a:found.a,b:found.b,sa:found.sa,sb:found.sb,sets:found.sets,n:tn.name,compName:tn.name,teamALabel:found.a,teamBLabel:found.b,stage:'league'};if(!ttM)ttM=[];ttM.unshift(_rec);save();m=_rec;break;}}if(m)break;}}
  if(m&&m.compName) _ttCurComp=m.compName;
  _ttSub='records';
  _mergedCompSub='tiertour';
  openDetails={};
  if(!window.histPage) window.histPage={};
  window.histPage['tt']=0;
  cm('playerModal');
  curTab='tiertour';
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    b.classList.toggle('on',oc.includes("'tiertour'"));
  });
  render();
  if(matchId&&m){
    const idx=(ttM||[]).indexOf(m);
    const key='tiertour-tt-'+idx;
    setTimeout(()=>{
      const el=document.getElementById('det-'+key);
      if(el){
        if(!openDetails[key]) toggleDetail(key);
        setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'center'}),80);
      }
    },400);
  }
}

function ttPlayerRankHTML(compName){
  const filtered=compName ? ttM.filter(m=>m.compName===compName) : ttM;
  const sc={};
  filtered.forEach(m=>{
    (m.sets||[]).forEach(st=>{
      (st.games||[]).forEach(g=>{
        let wn, ln;
        if(g.wName&&g.lName){wn=g.wName;ln=g.lName;}
        else if(g.playerA&&g.playerB&&g.winner){wn=g.winner==='A'?g.playerA:g.playerB;ln=g.winner==='A'?g.playerB:g.playerA;}
        else return;
        if(!sc[wn])sc[wn]={w:0,l:0,univ:''};
        if(!sc[ln])sc[ln]={w:0,l:0,univ:''};
        sc[wn].w++;sc[ln].l++;
        if(!sc[wn].univ){const p=players.find(x=>x.name===wn);if(p)sc[wn].univ=p.univ||'';}
        if(!sc[ln].univ){const p=players.find(x=>x.name===ln);if(p)sc[ln].univ=p.univ||'';}
      });
    });
  });
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['tt']||'rate';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><span style="font-size:11px;font-weight:700;color:var(--text3)">?�렬:</span><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['tt']='rate';render()">?�률??/button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['tt']='w';render()">?�순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['tt']='l';render()">?�순</button></div>`;
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,univ:sc[name].univ}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l)">기록???�습?�다.<br><span style="font-size:11px">경기 ?�력 ???�수 매칭 ?�보가 ?�어??집계?�니??</span></div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='tt_rank';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=entries.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?entries.slice(_cp*_PAGE,(_cp+1)*_PAGE):entries;
  let h=sortBar+`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#7c3aed;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #ddd6fe">?�� ?�어?�??개인 ?�위${compName?` ??${compName}`:''}</div>
  <table><thead><tr><th>?�위</th><th style="text-align:left">?�트리머</th><th>게임 ??/th><th>게임 ??/th><th>?�률</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const col=gc(p.univ);
    const _ri=_cp*_PAGE+i;
    let rnk=_ri===0?`<span class="rk1">1??/span>`:_ri===1?`<span class="rk2">2??/span>`:_ri===2?`<span class="rk3">3??/span>`:`<span style="font-weight:900">${_ri+1}??/span>`;
    h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(p.name,'32px')}<span style="font-weight:700;font-size:14px">${p.name}</span>${p.univ?`<span class="ubadge" style="background:${col};font-size:9px">${p.univ}</span>`:''}</span></td><td class="wt">${p.w}</td><td class="lt">${p.l}</td><td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td></tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">???�전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}�?</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">?�음 ??/button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function rTierTour(){
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const subOpts=[
    {id:'input',lbl:'?�� 경기 ?�력',fn:`_ttSub='input';render()`},
    {id:'records',lbl:'?�� 기록',fn:`_ttSub='records';openDetails={};render()`}
  ];
  let h=stabs(_ttSub,subOpts);
  if(_ttSub==='input' && isLoggedIn){
    if(!BLD['tt'])BLD['tt']={date:'',tiers:[],membersA:[],membersB:[],sets:[]};
    h+=buildTierTourInputHTML();
  } else {
    // ?�재 ?�택???�?�의 기록�??�시
    const _curTnName=_ttCurComp||'';
    const _ttFiltered=_curTnName
      ? ttM.filter(m=>m.compName===_curTnName)
      : ttM;
    h+=_ttFiltered.length?recSummaryListHTML(_ttFiltered,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">기록???�습?�다.</div>';
  }
  return h;
}

function buildTierTourInputHTML(){
  const bld=BLD['tt'];
  if(!bld.tiers)bld.tiers=[];
  const tfs=bld.tiers;
  const eligible=players.filter(p=>tfs.length===0||tfs.includes(p.tier));
  const mA=bld.membersA||[];const mB=bld.membersB||[];
  const addedNames=[...mA,...mB].map(m=>m.name);

  let h=`<div class="match-builder"><h3>?�� ?�어?�???�력</h3>
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openTTPasteModal()" style="display:inline-flex;align-items:center;gap:5px">?�� ?�동?�식</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">?�스??붙여?�기 지??/span></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700;color:var(--blue)">?�짜</label>
      <input type="date" value="${bld.date||''}" onchange="BLD['tt'].date=this.value">
    </div>

    <!-- 참�? ?�어 ?�택 -->
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:10px 14px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">??참�? ?�어 <span style="font-weight:400;color:var(--gray-l)">(복수 ?�택)</span></div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="tier-filter-btn ${tfs.length===0?'on':''}" onclick="BLD['tt'].tiers=[];BLD['tt'].membersA=[];BLD['tt'].membersB=[];BLD['tt'].sets=[];render()">?�체</button>
        ${TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tfs.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="ttToggleTier('${t}')">${getTierLabel(t)}</button>`;}).join('')}
      </div>
      <div style="font-size:11px;color:var(--blue);margin-top:6px">?�???�수: <strong>${eligible.length}�?/strong></div>
    </div>

    <!-- ?�수 목록 ?�릭?�로 ?� 배정 -->
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">???�수 ?�릭 ???� 배정 <span style="font-weight:400;color:var(--gray-l);font-size:11px">(A?� 버튼 / B?� 버튼?�로 추�?)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;max-height:200px;overflow-y:auto">
        ${eligible.length===0
          ?'<span style="color:var(--gray-l);font-size:12px">?�어�??�택?�면 ?�수 목록???�시?�니??/span>'
          :eligible.map(p=>{
              const inA=mA.some(m=>m.name===p.name);
              const inB=mB.some(m=>m.name===p.name);
              const bg=inA?'#2563eb':inB?'#dc2626':gc(p.univ);
              if(inA||inB){
                return `<span style="display:inline-flex;align-items:center;gap:3px;background:${bg};color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;opacity:0.55">${p.name}<span style="opacity:.8;font-size:10px;margin-left:2px">${p.univ}/${p.tier}</span><span style="background:rgba(255,255,255,.3);border-radius:2px;padding:0 4px;font-size:9px;font-weight:800;margin-left:3px">${inA?'A?�':'B?�'}</span></span>`;
              }
              return `<span style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:#fff;padding:3px 6px;border-radius:6px;font-size:11px">
                <span style="font-weight:700">${p.name}</span><span style="opacity:.8;font-size:10px">${p.univ}/${p.tier}</span>
                <button onclick="ttAddPlayer('A','${p.name}')" style="background:var(--white);color:#2563eb;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer;margin-left:2px">A?�</button>
                <button onclick="ttAddPlayer('B','${p.name}')" style="background:var(--white);color:#dc2626;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer">B?�</button>
              </span>`;
            }).join('')
        }
      </div>
    </div>

    <!-- ?� 구성 ?�인 + 검??추�? -->
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px">
      <div class="ck-panel">
        <h4>?�� ?� A (${mA.length}�?</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-a-search" placeholder="?�� ?�름·메모 검??.." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('A')">
        </div>
        <div id="tt-a-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mA.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersA.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">?�수 ?�음</span>'}</div>
      </div>
      <div class="ck-panel">
        <h4>?�� ?� B (${mB.length}�?</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-b-search" placeholder="?�� ?�름·메모 검??.." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('B')">
        </div>
        <div id="tt-b-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mB.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersB.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">?�수 ?�음</span>'}</div>
      </div>
    </div>`;
  h+=setBuilderHTML(bld,'tt');h+=`</div>`;return h;
}

function ttToggleTier(t){
  const bld=BLD['tt'];if(!bld)return;
  if(!bld.tiers)bld.tiers=[];
  const i=bld.tiers.indexOf(t);
  if(i>=0)bld.tiers.splice(i,1);else bld.tiers.push(t);
  bld.membersA=[];bld.membersB=[];bld.sets=[];render();
}

function ttAddPlayer(team, name){
  const bld=BLD['tt'];if(!bld)return;
  const all=[...(bld.membersA||[]),...(bld.membersB||[])];
  if(all.find(m=>m.name===name))return;
  const pObj=players.find(p=>p.name===name)||{};
  const mem={name,univ:pObj.univ||'',race:pObj.race||'',tier:pObj.tier||''};
  if(team==='A')bld.membersA.push(mem);else bld.membersB.push(mem);
  bld.sets=[];render();
}

function ttSearchPlayer(team){
  const searchEl=document.getElementById(`tt-${team.toLowerCase()}-search`);
  const dropEl=document.getElementById(`tt-${team.toLowerCase()}-drop`);
  if(!searchEl||!dropEl)return;
  const q=searchEl.value.trim().toLowerCase();
  if(!q){dropEl.style.display='none';dropEl.innerHTML='';return;}
  const bld=BLD['tt']||{};
  const tfs=bld.tiers||[];
  const already=[...(bld.membersA||[]),...(bld.membersB||[])].map(m=>m.name);
  const results=players.filter(p=>
    (tfs.length===0||tfs.includes(p.tier)) &&
    !already.includes(p.name) &&
    (p.name.toLowerCase().includes(q)||(p.memo||'').toLowerCase().includes(q)||(p.univ||'').toLowerCase().includes(q))
  ).slice(0,15);
  if(!results.length){dropEl.innerHTML='<div style="padding:8px 12px;color:var(--gray-l);font-size:12px">결과 ?�음</div>';dropEl.style.display='block';return;}
  dropEl.innerHTML=results.map(p=>`<div onclick="ttAddPlayer('${team}','${p.name}')"
    style="padding:7px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:7px;font-size:12px"
    onmouseover="this.style.background='#f0f6ff'" onmouseout="this.style.background=''">
    <span style="width:26px;height:26px;border-radius:5px;background:${gc(p.univ)};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${p.race||'?'}</span>
    <div><div style="font-weight:700">${p.name} <span style="font-size:10px;color:var(--gray-l)">${p.univ} · ${p.tier||'-'}</span></div></div>
  </div>`).join('');
  dropEl.style.display='block';
}

function tierTourAutoGroup(){
  const st=_tierTourState;
  if(!st.groups.length){
    const n=parseInt(prompt('�?조로 ?�눌까요?','4')||'0');
    if(!n||n<2)return;
    st.groups=[];
    for(let i=0;i<n;i++) st.groups.push({name:'GROUP '+String.fromCharCode(65+i),players:[],matches:[]});
  }
  // ?�택???�어 ?�수???�어??배정
  const eligible=players.filter(p=>st.tiers.length===0||st.tiers.includes(p.tier));
  const shuffled=[...eligible].sort(()=>Math.random()-0.5);
  st.groups.forEach(g=>g.players=[]);
  if(st.groups.length>0)shuffled.forEach((p,i)=>{
    st.groups[i%st.groups.length].players.push(p.name);
  });
  render();
}

function grpRenameTourney(){
  const tn=tourneys.find(t=>t.name===curComp);
  if(!tn){alert('?�?��? 먼�? ?�택?�세??');return;}
  const newName=prompt('???�?�명???�력?�세??',tn.name);
  if(!newName||!newName.trim()||newName.trim()===tn.name)return;
  const trimmed=newName.trim();
  if(tourneys.find(t=>t.name===trimmed&&t.id!==tn.id)){alert('?��? 같�? ?�름???�?��? ?�습?�다.');return;}
  // comps?�서???�?�명 ?�데?�트
  comps.forEach(m=>{if(m.n===tn.name)m.n=trimmed;if(m.a===tn.name)m.a=trimmed;});
  curComp=trimmed;
  tn.name=trimmed;
  save();render();
}

function grpDelCurTourney(){
  const tn=tourneys.find(t=>t.name===curComp);
  if(!tn){alert('?�?��? 먼�? ?�택?�세??');return;}
  const matchCount=(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0);
  if(!confirm(`"${tn.name}" ?�?��? ??��?�시겠습?�까?\n(${(tn.groups||[]).length}�?�?· ${matchCount}경기 모두 ??��?�니??`))return;
  const ti=tourneys.indexOf(tn);
  tourneys.splice(ti,1);
  curComp=tourneys.length?tourneys[0].name:'';
  save();render();
}

function grpNewLeagueTourney(){
  const name=prompt('?�반 ?�?�명???�력?�세??');if(!name||!name.trim())return;
  const id=genId();tourneys.unshift({id,name:name.trim(),type:'league',groups:[],createdAt:new Date().toISOString()});
  curComp=name.trim();save();grpEditId=tourneys[0].id;grpSub='edit';compSub='grpedit';render();
}
function grpNewTierTourney(){
  const name=prompt('?�어 ?�?�명???�력?�세??');if(!name||!name.trim())return;
  const id=genId();tourneys.unshift({id,name:name.trim(),type:'tier',groups:[],createdAt:new Date().toISOString()});
  _ttCurComp=name.trim();curTab='tiertour';save();render();
}
function grpRenameTierTourney(){
  const tn=tourneys.find(t=>t.name===_ttCurComp&&t.type==='tier');
  if(!tn){alert('?�?��? 먼�? ?�택?�세??');return;}
  const newName=prompt('???�?�명???�력?�세??',tn.name);
  if(!newName||!newName.trim()||newName.trim()===tn.name)return;
  const trimmed=newName.trim();
  if(tourneys.find(t=>t.name===trimmed&&t.id!==tn.id)){alert('?��? 같�? ?�름???�?��? ?�습?�다.');return;}
  ttM.forEach(m=>{if(m.compName===tn.name){m.compName=trimmed;if(m.n===tn.name)m.n=trimmed;if(m.t===tn.name)m.t=trimmed;}});
  tn.name=trimmed;
  _ttCurComp=trimmed;
  save();render();
}
function grpDelTierTourney(){
  const tn=tourneys.find(t=>t.name===_ttCurComp&&t.type==='tier');
  if(!tn){alert('??��???�어?�?��? ?�택?�세??');return;}
  if(!confirm(`"${tn.name}" ?�어?�?��? ??��?�시겠습?�까?`))return;
  const ti=tourneys.indexOf(tn);
  tourneys.splice(ti,1);
  _ttCurComp=tourneys.filter(t=>t.type==='tier').length?(tourneys.find(t=>t.type==='tier')?.name||''):'';
  save();render();
}
function grpNewTourney(){grpNewLeagueTourney();}
function grpDelTourney(ti){
  if(!confirm(`"${tourneys[ti].name}" ?�?��? ??��?�시겠습?�까?`))return;
  if(curComp===tourneys[ti].name)curComp='';tourneys.splice(ti,1);save();render();
}
function grpFilterUnivSel(gi){
  const searchEl=document.getElementById(`grp-univ-search-${gi}`);
  const selEl=document.getElementById(`grp-univ-sel-${gi}`);
  if(!searchEl||!selEl)return;
  const q=searchEl.value.trim().toLowerCase();
  Array.from(selEl.options).forEach(opt=>{
    if(!opt.value)return;
    opt.style.display=(!q||opt.text.toLowerCase().includes(q))?'':'none';
  });
  // �?번째 매칭 ?�션 ?�동 ?�택
  const firstMatch=Array.from(selEl.options).find(o=>o.value&&o.style.display!=='none');
  if(firstMatch)selEl.value=firstMatch.value;
}

function grpAddGroup(tnId){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const name=`${'ABCDEFGHIJ'[tn.groups.length]||tn.groups.length+1}�?;
  tn.groups.push({name,univs:[],matches:[]});save();render();
}
function grpDelGroup(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!confirm(`"${tn.groups[gi].name}"????��?�시겠습?�까?`))return;
  tn.groups.splice(gi,1);save();render();
}
function grpAddUniv(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const sel=document.getElementById(`grp-univ-sel-${gi}`);const val=sel?sel.value:'';
  if(!val){alert('?�?�을 ?�택?�세??');return;}
  if(tn.groups[gi].univs.includes(val)){alert('?��? 추�????�?�입?�다.');return;}
  tn.groups[gi].univs.push(val);save();render();
}
function grpRemoveUniv(tnId,gi,ui){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  tn.groups[gi].univs.splice(ui,1);save();render();
}
/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═

/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
   ?�️ ?�정 ?�션 ?�힘 ?�태 ?�속 ?�퍼
?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */
function _cfgOpen(id){try{return !!(JSON.parse(localStorage.getItem('su_cfg_open')||'{}')[id]);}catch(e){return false;}}
function _cfgToggle(id,el){try{const o=JSON.parse(localStorage.getItem('su_cfg_open')||'{}');o[id]=el.open;localStorage.setItem('su_cfg_open',JSON.stringify(o));}catch(e){}}
function _cfgD(id,title,extra){return `<details class="ssec" ${_cfgOpen(id)?'open':''} ontoggle="_cfgToggle('${id}',this)"${extra?' '+extra:''}><summary style="cursor:pointer;list-style:none;outline:none;display:flex;align-items:center;gap:6px;-webkit-appearance:none"><h4 style="margin:0;display:inline">${title}</h4><span style="font-size:11px;color:var(--gray-l);font-weight:400">???�치�?/span></summary>`;}

/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
   ?�정
?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */
function rCfg(C,T){
  T.innerText='?�️ ?�정';
  if(!isLoggedIn){
    C.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px"><div style="font-size:48px">?��</div><div style="font-size:18px;font-weight:800;color:var(--text)">관리자 ?�용 ?�이지</div><div style="font-size:13px;color:var(--gray-l)">?�정 ??? 관리자 로그?????�용?????�습?�다.</div><button class="btn btn-b" onclick="om(\'loginModal\')">&#128273; 로그??/button></div>';
    return;
  }
  const typeOpts=[{v:'?��',l:'?�� ?�반 공�?'},{v:'?��',l:'?�� 중요'},{v:'?�️',l:'?�️ 경고/주의'},{v:'?��',l:'?�� ?�벤??}];
  let h=`${_cfgD('notice','?�� 공�? 관�?)}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">?�속 ???�업?�로 ?�시?�니?? ?�성?�된 공�?�?보여집니??</div>
    <div id="notice-list-area" style="margin-bottom:16px">
    ${notices.length===0?`<div style="padding:18px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px;font-size:13px">?�록??공�? ?�음</div>`:
      notices.map((n,i)=>`<div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;background:${n.active?'var(--white)':'var(--surface)'};opacity:${n.active?1:0.6}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:18px">${n.type||'?��'}</span>
          <span style="font-weight:700;flex:1;font-size:13px">${n.title||'(?�목 ?�음)'}</span>
          <span style="font-size:11px;color:var(--gray-l)">${n.date||''}</span>
          <button class="btn btn-xs" style="background:${n.active?'#f0fdf4':'#f1f5f9'};color:${n.active?'#16a34a':'#64748b'};border:1px solid ${n.active?'#86efac':'#cbd5e1'};min-width:52px"
            onclick="notices[${i}].active=!notices[${i}].active;save();render()">
            ${n.active?'???�성':'�?비활??}</button>
          <button class="btn btn-r btn-xs" onclick="if(confirm('공�?�???��?�까??')){notices.splice(${i},1);save();render()}">?���?/button>
        </div>
        ${(n.body||'').length>120
          ? `<div id="notice-body-${i}" style="font-size:12px;color:var(--text2);white-space:pre-wrap;max-height:60px;overflow:hidden">${(n.body||'').slice(0,120)}...</div>
             <button onclick="(function(){const el=document.getElementById('notice-body-${i}');const btn=document.getElementById('notice-exp-${i}');const open=el.style.maxHeight!=='none';el.style.maxHeight=open?'none':'60px';el.innerHTML=open?${JSON.stringify((n.body||''))}:${JSON.stringify((n.body||'').slice(0,120)+'...')};btn.textContent=open?'???�기':'???�체보기';})()" id="notice-exp-${i}" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;padding:2px 0;font-weight:600">???�체보기</button>`
          : `<div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${n.body||''}</div>`
        }
      </div>`).join('')
    }
    </div>
    <div style="border:1.5px dashed var(--border2);border-radius:12px;padding:16px;background:var(--surface)">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">+ ??공�? ?�성</div>
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <select id="new-notice-type" style="width:140px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
          ${typeOpts.map(o=>`<option value="${o.v}">${o.l}</option>`).join('')}
        </select>
        <input type="text" id="new-notice-title" placeholder="공�? ?�목" style="flex:1;min-width:180px">
      </div>
      <textarea id="new-notice-body" placeholder="공�? ?�용???�력?�세??.." style="width:100%;height:80px;resize:vertical;border:1px solid var(--border2);border-radius:8px;padding:8px 10px;font-size:13px;box-sizing:border-box"></textarea>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="new-notice-active" checked> 즉시 ?�성??
        </label>
        <button class="btn btn-b" style="margin-left:auto" onclick="
          const t=document.getElementById('new-notice-title').value.trim();
          const b=document.getElementById('new-notice-body').value.trim();
          const tp=document.getElementById('new-notice-type').value;
          const ac=document.getElementById('new-notice-active').checked;
          if(!t){alert('?�목???�력?�세??);return;}
          notices.unshift({id:Date.now(),type:tp,title:t,body:b,active:ac,date:new Date().toLocaleDateString('ko-KR')});
          save();render();">?�� 공�? ?�록</button>
      </div>
    </div>
  </details>
  ${(()=>{
    const seen={};const dupNames=[];
    players.forEach(p=>{if(seen[p.name])dupNames.push(p.name);else seen[p.name]=true;});
    const uniq=[...new Set(dupNames)];
    if(!uniq.length) return '';
    return `<div class="ssec" style="border:2px solid #fca5a5;background:#fff5f5">
      <h4 style="color:#dc2626">?�️ ?�명?�인 감�? (${uniq.length}�?</h4>
      <div style="font-size:12px;color:#7f1d1d;margin-bottom:12px">중복 ?�름???�으�??�패·기록???�섞?�니?? ??명의 ?�름??바꿔 구분?�세??</div>
      ${uniq.map(name=>{
        const dupes=players.map((p,i)=>({p,i})).filter(({p})=>p.name===name);
        return `<div style="background:var(--white);border:1px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-bottom:8px">
          <div style="font-weight:800;color:#dc2626;font-size:13px;margin-bottom:6px">?�� "${name}" ??${dupes.length}�?중복</div>
          ${dupes.map(({p,i})=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:11px;background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 7px;font-weight:700">${p.univ||'무소??}</span>
            <span style="font-size:11px;color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}</span>
            <input type="text" id="dupfix-${i}" placeholder="???�름..." style="flex:1;min-width:100px;padding:3px 7px;border-radius:5px;border:1px solid #fca5a5;font-size:12px">
            <button class="btn btn-xs" style="background:#dc2626;color:#fff;border-color:#dc2626" onclick="(function(){
              const inp=document.getElementById('dupfix-${i}');
              const nw=(inp?.value||'').trim();
              if(!nw){alert('???�름???�력?�세??');return;}
              if(players.find((x,xi)=>x.name===nw&&xi!==${i})){alert('?��? 존재?�는 ?�름?�니??');return;}
              editName=players[${i}].name;
              document.getElementById('emBody').innerHTML='';
              const oldN=players[${i}].name;
              players[${i}].name=nw;
              players.forEach(other=>{(other.history||[]).forEach(h=>{if(h.opp===oldN)h.opp=nw;});});
              [miniM,univM,comps,ckM,proM,ttM].forEach(arr=>(arr||[]).forEach(m=>{
                if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;
                (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(g.playerA===oldN)g.playerA=nw;if(g.playerB===oldN)g.playerB=nw;}));
              }));
              (tourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
                const br=tn.bracket||{};
                Object.values(br.matchDetails||{}).forEach(m=>{if(m&&m.a===oldN)m.a=nw;if(m&&m.b===oldN)m.b=nw;});
                (br.manualMatches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});
              });
              (proTourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
              });
              save();render();
            })()">???�용</button>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>`;
  })()}
  ${_cfgD('univ','?���??�??관�?)}
    <div style="font-size:11px;color:var(--gray-l);margin:8px 0 10px">?���??��? 처리???�?��? 비로그인 ?�태?�서 ?�황?�에 ?�시?��? ?�습?�다.</div>`;
  univCfg.forEach((u,i)=>{
    const isHidden = !!u.hidden;
    const isDissolved = !!u.dissolved;
    h+=`<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px;flex-wrap:wrap;gap:4px">
      <div class="cdot" style="background:${u.color};opacity:${isHidden?0.4:1}"></div>
      <input type="text" value="${u.name}" style="flex:1;max-width:130px;opacity:${isHidden?0.5:1}" onblur="const oldName=univCfg[${i}].name;const v=this.value.trim();if(!v){this.value=oldName;return;}if(v!==oldName&&univCfg.some((x,xi)=>xi!==${i}&&x.name===v)){alert('?��? 추�????�?�명?�니??');this.value=oldName;return;}if(v!==oldName){renameUnivAcrossData(oldName,v);univCfg[${i}].name=v;save();render();}">
      ${isDissolved?`<span style="font-size:10px;background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;border-radius:5px;padding:1px 6px;font-weight:700">?���??�체 ${u.dissolvedDate||''}</span>`:''}
      <input type="color" value="${u.color}" style="width:36px;height:30px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)" title="?�???�상" onchange="univCfg[${i}].color=this.value;this.previousElementSibling.previousElementSibling${isDissolved?'.previousElementSibling':''}.style.background=this.value;save();if(typeof renderBoard==='function')renderBoard()">
      ${isDissolved
        ? `<button class="btn btn-xs" style="background:#f0fdf4;color:#16a34a;border:1px solid #86efac" onclick="univCfg[${i}].dissolved=false;univCfg[${i}].hidden=false;delete univCfg[${i}].dissolvedDate;saveCfg();render()">?�� 복구</button>`
        : `<button class="btn btn-xs" style="background:${isHidden?'#fef2f2':'#f0fdf4'};color:${isHidden?'#dc2626':'#16a34a'};border:1px solid ${isHidden?'#fca5a5':'#86efac'};min-width:58px"
            onclick="univCfg[${i}].hidden=!univCfg[${i}].hidden;saveCfg();render()">
            ${isHidden?'?���??��?':'???�시'}</button>
          <button class="btn btn-xs" style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa" onclick="openDissolveModal(${i})">?���??�체</button>`
      }
      <button class="btn btn-r btn-xs" onclick="delUniv(${i})">?���???��</button>
    </div>`;
  });
  h+=`<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input type="text" id="nu-n" placeholder="???�?�명" style="width:150px">
    <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
    <button class="btn btn-b" onclick="addUniv()">+ ?�??추�?</button>
  </div></details>
  ${_cfgD('maps','?���?�?관�?)}<div id="map-list">`;
  maps.forEach((m,i)=>{
    h+=`<div class="srow">
      <span style="font-size:14px">?��</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">?���???��</button>
    </div>`;
  });
  h+=`</div><div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="??�??�름" style="width:200px" onkeydown="if(event.key==='Enter')addMap()">
    <button class="btn btn-b" onclick="addMap()">+ �?추�?</button>
  </div></details>
      <div class="ssec">
      <h4>?�� ?�루 관�?/h4>
      <div id="crew-list" style="margin-bottom:12px"></div>
      ${isLoggedIn?`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <input type="text" id="crew-name" placeholder="?�루 ?�름" style="width:120px;padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="text" id="crew-icon" placeholder="?�이�?(?�모지)" style="width:90px;padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="color" id="crew-color" value="#6366f1" style="width:40px;height:30px;border:1px solid var(--border2);border-radius:6px;cursor:pointer">
        <input type="text" id="crew-desc" placeholder="?�명 (?�택)" style="width:150px;padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <button class="btn btn-b btn-sm" onclick="addCrew()">+ ?�루 추�?</button>
      </div>`:``}
    </div>

    ${_cfgD('mAlias','??�??�자 관�?<span style="font-size:11px;font-weight:400;color:var(--gray-l)">붙여?�기 ?�력 ???�동 변??/span>')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
      ?�자�??�력?�면 경기 결과 붙여?�기 ???�동?�로 ?�체 �??�름?�로 변?�됩?�다.<br>
      <span style="color:var(--blue);font-weight:600">??</span> <code style="background:var(--surface);padding:1px 6px;border-radius:4px">?????�아??/code>, <code style="background:var(--surface);padding:1px 6px;border-radius:4px">?????�리?�이??/code>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">?�� 기본 ?�장 ?�자 <span style="font-weight:400;color:var(--gray-l);font-size:10px">(???�릭 ??비활?�화)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.entries(PASTE_MAP_ALIAS_DEFAULT).filter(([k,v])=>k!==v).map(([k,v])=>{
          const disabled=(userMapAlias||{}).hasOwnProperty(k+'__disabled');
          return disabled
            ? `<span style="display:inline-flex;align-items:center;gap:3px;background:#f1f5f9;border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px;opacity:.5;text-decoration:line-through"><span style="font-family:monospace"><b>${k}</b> ??${v}</span><button onclick="restoreDefaultMapAlias('${encodeURIComponent(k)}')" style="background:none;border:none;cursor:pointer;color:#16a34a;font-size:10px;padding:0 2px;line-height:1;text-decoration:none" title="복원">??/button></span>`
            : `<span style="display:inline-flex;align-items:center;gap:3px;background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px"><span style="font-family:monospace"><b>${k}</b> ??${v}</span><button onclick="delDefaultMapAlias('${encodeURIComponent(k)}','${encodeURIComponent(v)}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0 2px;line-height:1" title="비활?�화">??/button></span>`;
        }).join('')}
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">?�� ?�용???�의 ?�자</div>
    <div id="alias-list" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="alias-key" placeholder="?�자 (?? ??" style="width:90px" maxlength="10" onkeydown="if(event.key==='Enter')addMapAlias()">
      <span style="color:var(--gray-l)">??/span>
      <input type="text" id="alias-val" list="alias-val-list" placeholder="�??�름 ?�력..." autocomplete="off" style="width:180px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px" onkeydown="if(event.key==='Enter')addMapAlias()">
      <datalist id="alias-val-list">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b" onclick="addMapAlias()">+ ?�자 추�?</button>
    </div>
    <div id="alias-msg" style="font-size:12px;margin-top:6px;min-height:16px"></div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">?���??�트리머 ?�태 ?�이�?관�?/h4>
      <button id="cfg-si-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-si-body');const btn=document.getElementById('cfg-si-toggle');if(c.style.display==='none'){c.style.display='';_renderCfgSiList();btn.textContent='???�기';}else{c.style.display='none';btn.textContent='???�치�?;}})()">???�치�?/button>
    </div>
    <div id="cfg-si-body" style="display:none">
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">?�름 ?�측???�시???�태 ?�이콘을 ?�트리머별로 지?�합?�다. ?�황?�·순?�표·?��?지 ?�??모두 반영?�니??</div>
    <!-- 커스?� ?�이�?추�? (URL/링크) -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">?�� 커스?� ?�이�?추�? (URL · ?�모지)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input type="text" id="si-url" placeholder="?��?지 URL ?�는 ?�모지 ?�력" style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="text" id="si-label" placeholder="?�름 (?�택)" style="width:110px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <button class="btn btn-b btn-sm" onclick="var e=document.getElementById('si-url').value.trim(),l=document.getElementById('si-label').value.trim();if(!e){alert('URL ?�는 ?�모지�??�력?�세??');return;}addCustomStatusIcon(l||'커스?�',e);document.getElementById('si-url').value='';document.getElementById('si-label').value='';render()">+ 추�?</button>
      </div>
      ${_customStatusIcons.length?`<div style="display:flex;flex-wrap:wrap;gap:6px">${_customStatusIcons.map((c,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:7px;background:var(--white);border:1.5px solid var(--blue);font-size:14px"><span style="display:inline-flex;align-items:center">${_siRender(c.emoji,'20px')||c.emoji}</span><span style="font-size:11px;color:var(--gray-l);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.label||''}</span><button onclick="removeCustomStatusIcon(${i});render()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0;line-height:1;margin-left:2px" title="??��">×</button></span>`).join('')}</div>`
      :'<div style="font-size:11px;color:var(--gray-l)">추�???커스?� ?�이�??�음</div>'}
    </div>
    <!-- 기본 ?�이�?목록 -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">?�� 기본 ?�태 ?�이�?/div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STATUS_ICON_DEFS).filter(([id])=>id!=='none'&&!id.startsWith('_c')).map(([id,d])=>`<span style="padding:4px 10px;border-radius:7px;background:var(--white);border:1px solid var(--border);font-size:16px" title="${d.label}">${_siRender(d.emoji,'20px')||d.emoji}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">?�트리머 ?�보 ?�정 ?�는 ?�황???�릭 ?�업?�서 ?�이콘을 ?�정?�세??</div>
    </div>
    <!-- ?�트리머�??�이�?지??-->
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">?�트리머�??�태 ?�이�?지??/div>
    <div id="cfg-si-list" style="max-height:320px;overflow-y:auto;border:1px solid var(--border);border-radius:8px">
      <div style="padding:16px;text-align:center;color:var(--gray-l);font-size:12px">로딩 �?..</div>
    </div>
    <button class="btn btn-r btn-sm" style="margin-top:10px" onclick="if(confirm('모든 ?�태 ?�이콘을 초기?�할까요?')){playerStatusIcons={};localStorage.setItem('su_psi','{}');render();}">?�체 초기??/button>
    </div>
  </div>
  ${_cfgD('tier','?�� ?�어 관�?)}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${TIERS.map((t,i)=>`<div style="text-align:center;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:4px">
        ${getTierBadge(t)}
        <div style="font-size:10px;color:var(--gray-l)">${i+1}?�위</div>
        ${!['G','K','JA','J','S','0?�어'].includes(t)?`<button class="btn btn-r btn-xs" onclick="delTier('${t}')">?���???��</button>`:''}
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="nt-name" placeholder="?�어 ?�름 (?? 9?�어)" style="width:160px">
      <button class="btn btn-b" onclick="addTier()">+ ?�어 추�?</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">??기본 ?�어(G/K/JA/J/S/0?�어)????��?????�습?�다.</div>
  </details>
  ${_cfgD('acct','?�� 관리자 계정 관�?)}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:4px">??<b>관리자</b>: 모든 기능 + ?�정 ?�근 가??/div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">??<b>부관리자</b>: 경기 기록 ?�력�?가??(?�정/?�원관�?불�?)</div>
    <div style="margin-bottom:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">?�록??계정 (<span id="adm-count">-</span>�?</div>
      <div id="adm-list"></div>
      <button class="btn btn-r btn-xs" style="margin-top:10px" onclick="clearAllAdmins()">?�️ ?�체 초기??(기본�?리셋)</button>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">+ ??계정 추�?</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="adm-id" placeholder="?�이?? style="width:140px" autocomplete="off">
      <input type="password" id="adm-pw" placeholder="비�?번호 (4???�상)" style="width:150px" autocomplete="new-password">
      <select id="adm-role" style="border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
        <option value="admin">?�� 관리자</option>
        <option value="sub-admin">?�� 부관리자</option>
      </select>
      <button class="btn btn-p" onclick="addAdminAccount()">+ 추�?</button>
    </div>
    <div id="adm-msg" style="font-size:12px;min-height:18px"></div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">?�� 로컬 ?�?�소 ?�용??/h4>
      <button id="cfg-storage-toggle2" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-storage-wrap2');const btn=document.getElementById('cfg-storage-toggle2');if(c.style.display==='none'){c.style.display='';btn.textContent='???�기';renderStorageInfo();}else{c.style.display='none';btn.textContent='???�치�?;}})()">???�치�?/button>
    </div>
    <div id="cfg-storage-wrap2" style="display:none">
      <div id="cfg-storage-info"><div style="color:var(--gray-l);font-size:12px">계산 �?..</div></div>
      <button class="btn btn-w btn-sm" style="margin-top:8px" onclick="renderStorageInfo()">?�� ?�로고침</button>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">?�️ Firebase ?�시�??�기??/h4>
      <button id="cfg-fb-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-fb-body');const btn=document.getElementById('cfg-fb-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='???�기';}else{c.style.display='none';btn.textContent='???�치�?;}})()">???�치�?/button>
    </div>
    <div id="cfg-fb-body" style="display:none">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">관리자가 ?�이?��? ?�?�할 ??Firebase???�동?�로 ?�로?�됩?�다. ?�른 기기?�서???�시간으�?반영?�니??</p>
    <div id="cfg-fb-sync-panel" style="margin-bottom:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <span style="font-size:12px;font-weight:700;color:var(--blue)">?�� ?�기???�태</span>
        <button class="btn btn-w btn-xs" onclick="checkFbSyncStatus()">?�� 지�??�인</button>
      </div>
      <div id="cfg-fb-sync-result" style="font-size:12px;color:var(--gray-l)">?�인 버튼???�러 ?�태�??�인?�세??</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">Firebase 비�?번호</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">Firebase Security Rules?�서 ?�정??admin_pw 값을 ?�력?�세?? ?�??????비�?번호�??�기 ?�증?�니??</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-fb-pw" placeholder="Firebase 비�?번호 ?�력..." style="width:220px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveFbPw()">?�� ?�??/button>
        <button class="btn btn-r btn-xs" onclick="clearFbPw()">지?�기</button>
      </div>
      <div id="fb-pw-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_fb_pw')?'??비�?번호 ?�정??:'미설??}</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:8px">GitHub ?�큰 (관?�자 ?�천 �?무료 지??</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:6px">?�정 ?? ?�?�할 ??GitHub data.json???�동 ?�로????관?�자?�이 GitHub CDN?�서 ?�이?��? 받아 Firebase ?�시?�속 100�??�한 ?�이 ?�천 명도 무료�?지?�됩?�다.</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">GitHub ??Settings ??Developer settings ??Personal access tokens ??Fine-grained token ??Contents: Read and Write 권한 발급</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-gh-token" placeholder="ghp_xxxxxxxxxxxx" style="width:260px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveGhToken()">?�� ?�??/button>
        <button class="btn btn-r btn-xs" onclick="clearGhToken()">지?�기</button>
      </div>
      <div id="gh-token-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_gh_token')?'???�큰 ?�정??(?�????GitHub ?�동 ?�로???�성)':'미설??(관?�자??Firebase ?�용 �?'}</div>
    </div>
    </div>
  </div>
  ${_cfgD('season','?�� ?�즌 관�?,'id="cfg-season-sec"')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">?�즌???�의?�면 ?�?�기록·통�???모든 ??��???�즌 ?�위�??�터링할 ???�습?�다.</p>
    <div id="cfg-season-list" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">?�즌 ?�름</label>
        <input type="text" id="cfg-season-name" placeholder="?? 2025 ?�프�? style="width:140px;font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">?�작??/label>
        <input type="date" id="cfg-season-from" style="font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">종료??/label>
        <input type="date" id="cfg-season-to" style="font-size:12px">
      </div>
      <button class="btn btn-b btn-sm" onclick="addSeason()">+ ?�즌 추�?</button>
    </div>
  </details>
    <div class="ssec" id="cfg-bulk-edit-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">?�️ 경기 ?�괄 ?�정</h4>
      <button id="cfg-me-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-me-body');const btn=document.getElementById('cfg-me-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='???�기';}else{c.style.display='none';btn.textContent='???�치�?;}})()">???�치�?/button>
    </div>
    <div id="cfg-me-body" style="display:none">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">?�정 ?�짜 범위??경기 ?�짜·맵을 ??번에 ?�정?�거?? �??�름 ?��?�??�체 교체?�니??</p>

    <div style="display:flex;flex-direction:column;gap:14px">

      <!-- ?�짜 ?�괄 변�?-->
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:var(--blue);margin-bottom:10px">?�� ?�짜 ?�괄 변�?/div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">변�????�짜</label>
          <input type="date" id="bulk-date-from" style="font-size:12px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">??변�???/label>
          <input type="date" id="bulk-date-to" style="font-size:12px">
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <label style="font-size:11px;font-weight:600;color:var(--text3)">?�??</label>
          ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
          <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
            <input type="checkbox" id="bulk-date-chk-${m}" checked style="cursor:pointer">
            ${{ mini:'미니?�??, univm:'?�?��???, ck:'CK', pro:'?�로리그', tt:'?�어?�??, ind:'개인??, gj:'?�장??, comp:'?�?? }[m]}
          </label>`).join('')}
        </div>
        <button class="btn btn-b btn-sm" onclick="bulkChangeDate()">?�� ?�짜 ?�괄 변�?/button>
        <span id="bulk-date-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
      </div>

      <!-- �??�름 ?�괄 교체 -->
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:var(--blue);margin-bottom:10px">?���?�??�름 ?�괄 교체</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">교체 ??/label>
          <input type="text" id="bulk-map-from" placeholder="?? ?�혼II" style="font-size:12px;width:120px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">??교체 ??/label>
          <input type="text" id="bulk-map-to" placeholder="?? ?�혼" style="font-size:12px;width:120px">
        </div>
        <button class="btn btn-b btn-sm" onclick="bulkChangeMap()">?���?�??�괄 교체</button>
        <span id="bulk-map-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
      </div>

      <!-- ?�수 ?�괄 ?�어 변�?-->
      <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:#0369a1;margin-bottom:10px">?���??�수 ?�괄 ?�어 변�?/div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">?�재 ?�어</label>
          <select id="bulk-tier-from" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
            <option value="">?�체 (?��??�음)</option>
            ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
            <option value="미정">미정</option>
          </select>
          <label style="font-size:12px;font-weight:600;color:var(--text2)">??변경할 ?�어</label>
          <select id="bulk-tier-to" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
            <option value="">?�택</option>
            ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
            <option value="미정">미정</option>
          </select>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">?�???�??/label>
          <select id="bulk-tier-univ" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
            <option value="">?�체 ?�??/option>
            ${getAllUnivs().map(u=>`<option value="${u.name}">${u.name}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-b btn-sm" onclick="bulkChangeTier()">?���??�어 ?�괄 변�?/button>
        <span id="bulk-tier-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
      </div>

      <!-- ?�짜 범위 ?�괄 ??�� -->
      <div style="padding:14px;background:#fff5f5;border:1px solid #fca5a5;border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:#dc2626;margin-bottom:10px">?���??�짜 범위 ?�괄 ??��</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">?�작??/label>
          <input type="date" id="bulk-del-from" style="font-size:12px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">~</label>
          <input type="date" id="bulk-del-to" style="font-size:12px">
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <label style="font-size:11px;font-weight:600;color:var(--text3)">?�??</label>
          ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
          <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
            <input type="checkbox" id="bulk-del-chk-${m}" style="cursor:pointer">
            ${{ mini:'미니?�??, univm:'?�?��???, ck:'CK', pro:'?�로리그', tt:'?�어?�??, ind:'개인??, gj:'?�장??, comp:'?�?? }[m]}
          </label>`).join('')}
        </div>
        <button class="btn btn-r btn-sm" onclick="bulkDeleteByDate()">?���?범위 ??�� (?�돌�????�음)</button>
        <span id="bulk-del-result" style="font-size:12px;margin-left:8px;color:var(--red)"></span>
      </div>

      <!-- ?�트?�→게임???�산 ?�괄 변??-->
      <div style="padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:#92400e;margin-bottom:6px">?�� ?�트????게임???�산 ?�괄 변??/div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:10px">sets 배열??게임 ???�산?�로 sa/sb�??�계?�합?�다.<br>?�트 ?��? 게임 ?��? ?�른 경기�?변?�됩?�다.</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <label style="font-size:11px;font-weight:600;color:var(--text3)">?�??</label>
          ${['mini','univm','ck','pro','tt'].map(m=>`
          <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
            <input type="checkbox" id="bulk-conv-chk-${m}" checked style="cursor:pointer">
            ${{ mini:'미니?�??, univm:'?�?��???, ck:'CK', pro:'?�로리그', tt:'?�어?�?? }[m]}
          </label>`).join('')}
        </div>
        <button class="btn btn-b btn-sm" onclick="bulkConvertToGameScore()">?�� 게임???�산?�로 변??/button>
        <span id="bulk-conv-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
      </div>

    </div>
  </div>
  `;
  // 관리자 목록 + �??�자 목록 ?�더�?
  setTimeout(()=>{
    renderStorageInfo();
    renderSeasonList();
    _refreshCrewList();
    const el=document.getElementById('adm-count');
    const listEl=document.getElementById('adm-list');
    const accounts=getAdminAccounts();
    if(el)el.textContent=accounts.length;
    if(listEl){
      if(!accounts.length){listEl.innerHTML='<div style="font-size:12px;color:var(--gray-l)">?�록??계정 ?�음</div>';return;}
      listEl.innerHTML=accounts.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:13px;font-weight:600">${a.label||'(?�름?�음)'}</span>
          <span style="padding:2px 9px;border-radius:5px;font-size:10px;font-weight:700;${a.role==='sub-admin'?'background:#fef3c7;color:#92400e;border:1px solid #fde68a':'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe'}">${a.role==='sub-admin'?'?�� 부관리자':'?�� 관리자'}</span>
          <button class="btn btn-r btn-xs" onclick="deleteAdminAccount(${i})">?���???��</button>
        </div>`).join('');
    }
  },50);
  C.innerHTML=h;
  setTimeout(_refreshAliasList, 10);
  // FAB ???�정 초기??
  window.saveFabTabSetting = function(btnKey, tabId){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    settings[btnKey]=tabId;
    localStorage.setItem('su_fabTabs',JSON.stringify(settings));
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
  };
  window.initFabTabSettings = function(){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    const defaults={cal:'cal',comp:'comp',univm:'univm',ind:'ind',pro:'pro'};
    Object.keys(defaults).forEach(key=>{
      const el=document.getElementById('cfg-fab-'+key);
      if(el){
        el.value=settings[key]||defaults[key];
      }
    });
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
  };
  setTimeout(function(){window.initFabTabSettings();}, 50);
  function renderStorageInfo(){
    const el=document.getElementById('cfg-storage-info');
    if(!el)return;
    try{
      let total=0;const rows=[];
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i);const v=localStorage.getItem(k)||'';
        const bytes=(k.length+v.length)*2;total+=bytes;
        if(k.startsWith('su_'))rows.push({k,bytes});
      }
      rows.sort((a,b)=>b.bytes-a.bytes);
      const limit=5*1024*1024;
      const pct=Math.min(100,Math.round(total/limit*100));
      const barCol=pct>=90?'#dc2626':pct>=70?'#f59e0b':'#22c55e';
      const fmt=b=>b>=1024*1024?(b/1024/1024).toFixed(2)+'MB':b>=1024?(b/1024).toFixed(1)+'KB':b+'B';
      const LABELS={'su_p':'?�수 ?�이??,'su_pp':'?�수 ?�진','su_mm':'미니?�??,'su_um':'?�?��???,'su_ck':'?�?�CK','su_pro':'?�로리그','su_cm':'?�??,'su_tn':'?�너먼트','su_mb':'?�원관�?,'su_notices':'공�?','su_psi':'?�태?�이�?};
      el.innerHTML=`
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
          <span style="font-weight:700;color:var(--text)">${fmt(total)} / 5MB ?�용</span>
          <span style="font-weight:700;color:${barCol}">${pct}%</span>
        </div>
        <div style="height:10px;border-radius:5px;background:var(--border2);overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${barCol};border-radius:5px;transition:width .3s"></div>
        </div>
        ${pct>=70?`<div style="font-size:11px;color:${barCol};margin-top:5px;font-weight:600">${pct>=90?'?�️ ?�??공간??거의 가??찼습?�다! ?�이?��? ?�리??주세??':'?�️ ?�??공간??많이 ?�용?�고 ?�습?�다.'}</div>`:''}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">??���??�용??(?�위 10�?</div>
      <div style="font-size:11px;line-height:1.8">
        ${rows.slice(0,10).map(({k,bytes})=>{
          const label=LABELS[k]||k;
          const bpct=Math.min(100,Math.round(bytes/limit*100));
          return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="min-width:100px;color:var(--text2)">${label}</span>
            <div style="flex:1;height:6px;border-radius:3px;background:var(--border2);overflow:hidden"><div style="height:100%;width:${bpct}%;background:#60a5fa;border-radius:3px"></div></div>
            <span style="min-width:55px;text-align:right;color:var(--gray-l)">${fmt(bytes)}</span>
          </div>`;
        }).join('')}
      </div>`;
  }catch(e){el.innerHTML='<div style="color:var(--gray-l);font-size:12px">?�용??계산 불�?</div>';}
}
} // end first rCfg



/* ==========================================
   Statistics Tab
========================================== */
let statsSub='overview';
function rStats(C,T){
  T.innerText='📊 통계';
  C.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">통계 기능 준비 중...</div>';
}
