﻿/* ══════════════════════════════════════
   🔧 구버전 티어대회 데이터 1회 마이그레이션
══════════════════════════════════════ */
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
  // _id 없는 조별리그/브라켓 경기에 ID 생성 (기존 데이터 호환)
  (tourneys||[]).filter(t=>t.type==='tier').forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id){m._id=genId();changed=true;}
      });
    });
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if(m&&!m._id){m._id=genId();changed=true;}
    });
    ((tn.bracket||{}).manualMatches||[]).forEach(m=>{
      if(!m._id){m._id=genId();changed=true;}
    });
  });
  // 기존 브라켓 기록(_proKey가 ptn_으로 시작)에 stage:'bkt' 추가 및 _proKey 제거
  (ttM||[]).forEach(r=>{
    if(r._proKey && r._proKey.startsWith('ptn_')){
      if(!r.stage){ r.stage='bkt'; changed=true; }
      delete r._proKey; changed=true;
    }
  });
  // ttM에 없는 stage 미설정 레코드에 stage:'general' 적용
  (ttM||[]).forEach(r=>{
    if(!r.stage&&!r._proKey){ r.stage='general'; changed=true; }
  });
  // tourneys 조별리그 경기 → ttM 동기화 (기존 기록 반영)
  const _ttIds=new Set((ttM||[]).map(r=>r._id).filter(Boolean));
  (tourneys||[]).filter(t=>t.type==='tier').forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id||_ttIds.has(m._id)||m.sa==null) return;
        ttM.unshift({_id:m._id,d:m.d||'',a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,sets:m.sets||[],n:tn.name,compName:tn.name,teamALabel:m.a||'',teamBLabel:m.b||'',stage:'league'});
        _ttIds.add(m._id);
        changed=true;
      });
    });
    // tourneys 브라켓 경기 → ttM 동기화
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if(!m._id||_ttIds.has(m._id)||m.sa==null) return;
      ttM.unshift({_id:m._id,d:m.d||'',a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,sets:m.sets||[],n:tn.name,compName:tn.name,teamALabel:m.a||'',teamBLabel:m.b||'',stage:'bkt'});
      _ttIds.add(m._id);
      changed=true;
    });
    ((tn.bracket||{}).manualMatches||[]).forEach(m=>{
      if(!m._id||_ttIds.has(m._id)||m.sa==null) return;
      ttM.unshift({_id:m._id,d:m.d||'',a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,sets:m.sets||[],n:tn.name,compName:tn.name,teamALabel:m.a||'',teamBLabel:m.b||'',stage:'bkt'});
      _ttIds.add(m._id);
      changed=true;
    });
  });
  if(changed) save();
}

let _ttDupNameMigrated=false;
function _migrateTierTourneyDuplicateNames(){
  if(_ttDupNameMigrated) return;
  _ttDupNameMigrated=true;
  const tiers=(tourneys||[]).filter(t=>t&&t.type==='tier'&&(t.name||'').trim());
  if(!tiers.length) return;
  const byName={};
  tiers.forEach((tn, idx)=>{
    const n=(tn.name||'').trim();
    if(!byName[n]) byName[n]=[];
    byName[n].push({tn, idx});
  });
  let changed=false;
  Object.keys(byName).forEach(n=>{
    const list=byName[n]||[];
    if(list.length<=1) return;
    const used=new Set();
    list.forEach(it=>{
      const dates=[];
      (it.tn.groups||[]).forEach(g=>(g.matches||[]).forEach(m=>{ if(m&&m.d) dates.push(m.d); }));
      dates.sort();
      const ds=dates.length
        ? ` (${dates[0].slice(2).replace(/-/g,'/')}${dates[dates.length-1]!==dates[0]?'~'+dates[dates.length-1].slice(2).replace(/-/g,'/'):''})`
        : ` (#${it.idx+1})`;
      let nn=(n+ds).trim();
      let k=2;
      while(used.has(nn)) nn=(n+ds+'-'+(k++)).trim();
      used.add(nn);
      if(it.tn.name!==nn){ it.tn.name=nn; changed=true; }
    });
  });
  if(!changed) return;

  const matchToName={};
  (tourneys||[]).filter(t=>t&&t.type==='tier').forEach(tn=>{
    const tnName=(tn.name||'').trim();
    (tn.groups||[]).forEach(g=>(g.matches||[]).forEach(m=>{ if(m&&m._id) matchToName[m._id]=tnName; }));
  });
  if(typeof ttM!=='undefined' && Array.isArray(ttM)){
    ttM.forEach(m=>{
      const nn=matchToName[m._id];
      if(nn){
        if(m.compName!==nn){ m.compName=nn; changed=true; }
        if(m.n && m.n!==nn){ m.n=nn; changed=true; }
        if(m.t && m.t!==nn){ m.t=nn; changed=true; }
      }
    });
  }
  if(typeof _ttCurComp!=='undefined'){
    const ok=(tourneys||[]).some(t=>t&&t.type==='tier'&&t.name===_ttCurComp);
    if(!ok){
      const first=(tourneys||[]).find(t=>t&&t.type==='tier');
      _ttCurComp=first?first.name:'';
      changed=true;
    }
  }
  if(changed && typeof save==='function') save();
}

/* ══════════════════════════════════════
   📋 대회 경기 붙여넣기 일괄 입력
══════════════════════════════════════ */
let _grpPasteState = null; // {mode:'grp', tnId, gi, mi} or {mode:'bkt', tnId, rnd, mi}

/* ── 브라켓 경기 붙여넣기 ── */
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
  if(applyBtn){applyBtn.style.display='none';applyBtn.textContent='✅ 세트에 적용';}
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
  if(hintEl)hintEl.innerHTML=`<span style="color:#1d4ed8;font-weight:700">📋 브라켓 경기 입력 모드</span>${tA||tB?` ➔ <b>팀A: ${tA}</b> vs <b>팀B: ${tB}</b>`:''}`;
  const compWrap=document.getElementById('paste-comp-wrap');
  if(compWrap){
    const setOpts=(m.sets||[]).map((s,i)=>{const lbl=i===2?'🎯 에이스전':`${i+1}세트`;return`<option value="${i}">${lbl}</option>`;}).join('');
    const teamInputs=(!tA&&!tB)?`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <label style="font-size:12px;font-weight:700">팀A:</label>
      <input id="bkt-paste-ta" placeholder="대학명 입력" style="font-size:12px;padding:3px 8px;border:1px solid var(--border2);border-radius:6px;width:100px">
      <label style="font-size:12px;font-weight:700">팀B:</label>
      <input id="bkt-paste-tb" placeholder="대학명 입력" style="font-size:12px;padding:3px 8px;border:1px solid var(--border2);border-radius:6px;width:100px">
    </div>`:'';
    compWrap.innerHTML=teamInputs+`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700">적용 세트:</label>
      <select id="grp-paste-set-sel" style="font-size:12px;padding:3px 8px;border:1px solid var(--border2);border-radius:6px">
        <option value="new">새 세트 추가</option>${setOpts}
      </select></div>`;
    compWrap.style.display='block';
  }
  om('pasteModal');
}

/* ── 대회 경기 붙여넣기: 일반 pasteModal을 재활용 ── */
function openGrpPasteModal(){
  _grpPasteState = {...grpMatchState, mode:'grp'};
  const tn = tourneys.find(t=>t.id===grpMatchState.tnId); if(!tn) return;
  const autoDetect = (grpMatchState.gi===null||grpMatchState.gi===undefined);
  const grp = autoDetect ? null : tn.groups[grpMatchState.gi];
  const m = (grp&&grpMatchState.mi!=null) ? grp.matches[grpMatchState.mi] : null;
  const teamA = document.getElementById('gm-a')?.value||(m?m.a:'')||'';
  const teamB = document.getElementById('gm-b')?.value||(m?m.b:'')||'';

  // 일반 pasteModal을 열되 대회 세트 적용 모드로 표시
  window._grpPasteMode = true; // pasteApply에서 대회 세트 적용으로 분기

  // pasteModal 초기화 (openPasteModal 로직 인라인)
  const textarea  = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (textarea)  textarea.value  = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn)  { applyBtn.style.display = 'none'; applyBtn.textContent = '? 세트에 적용'; }
  if (badge)     badge.style.display = 'none';
  if (pendWarn)  pendWarn.style.display = 'none';
  window._pasteResults = null;
  window._pasteErrors  = null;

  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = (m&&m.d) || '';

  // 저장형식 영역에 대회 팀 정보 안내로 대체 (숨김 처리)
  const modeWrap = document.querySelector('#pasteModal [id="paste-mode"]')?.closest('div');
  // 모드 선택 숨기고 대회 안내 배너 추가
  const modeSel = document.getElementById('paste-mode');
  if(modeSel){ modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if(modeLabel) modeLabel.style.display='none';
  const hintEl = document.getElementById('paste-mode-hint');
  if(hintEl){
    if(autoDetect)
      hintEl.innerHTML=`<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#16a34a;font-weight:700">?? 자동인식 모드</span> ? 선수 소속 대학을 자동으로 인식해 해당 조 경기에 저장합니다.<br><span style="font-size:11px;color:#6b7280">팀이 다른 조일 경우 교류전으로 추가할지 확인합니다.</span></div>`;
    else
      hintEl.innerHTML=`<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">?? 경기 지정 모드</span> ? <b>${teamA||'팀A'}</b> vs <b>${teamB||'팀B'}</b><br><span style="font-size:11px;color:#6b7280">세트 선택 후 붙여넣기하면 해당 세트에 저장됩니다.</span></div>`;
  }

  // 세트 선택 드롭다운 (경기 지정 모드에서 항상 표시)
  const compWrap = document.getElementById('paste-comp-wrap');
  if(compWrap){
    if(!autoDetect){
      const setOpts = (m?.sets||[]).map((s,i)=>{
        const lbl = i===2?'?? 에이스전':`${i+1}세트`;
        const cnt=(s.games||[]).length;
        return `<option value="${i}">${lbl}${cnt?` (${cnt}게임 기존)`:''}  ← 덮어쓰기</option>`;
      }).join('');
      compWrap.style.display='flex';
      compWrap.innerHTML = `
        <label style="font-size:12px;font-weight:700;white-space:nowrap">추가할 세트:</label>
        <select id="grp-paste-set-sel" style="padding:5px 10px;border-radius:6px;border:1px solid var(--border2);font-size:12px">
          <option value="new">+ 새 세트 추가</option>
          ${setOpts}
        </select>`;
    } else {
      compWrap.style.display='none';
    }
  }

  // 불필요한 섹션 숨기기
  const _pasteDetails=document.querySelector('#pasteModal details');
  if(_pasteDetails)_pasteDetails.style.display='none';
  // 경기 방식(승차수/세트제) 선택은 대회에서도 사용 ? 표시 유지
  const _matchModeDiv=document.getElementById('paste-match-mode-game')?.closest('div[style]');
  if(_matchModeDiv)_matchModeDiv.style.display='flex';
  // 세트제 기본값으로 초기화
  setPasteMatchMode('set');
  const _pTitle=document.querySelector('#pasteModal .mtitle');
  if(_pTitle)_pTitle.textContent='?? 결과 붙여넣기';

  om('pasteModal');
}

// grpPasteApply: 대회 세트 적용 버튼 핸들러 (HTML에서 직접 호출)
function grpPasteApply(){
  if(!window._pasteResults) return;
  const savable = window._pasteResults.filter(r=>r.wPlayer&&r.lPlayer);
  if(!savable.length){ alert('저장 가능한 경기가 없습니다.'); return; }
  const ok = _grpPasteApplyLogic(savable);
  if(ok){
    window._grpPasteMode = false;
    cm('pasteModal');
    window._pasteResults = null;
    window._pasteErrors  = null;
  }
}

// grpPasteApply 내부 로직
function _grpPasteApplyLogic(savable){
  if(!_grpPasteState && window._grpPasteState) _grpPasteState = window._grpPasteState;
  if(!_grpPasteState){ alert('붙여넣기 상태가 초기화되지 않았습니다. 다시 시도해주세요.'); return false; }
  const tn = (typeof _findTourneyById==='function' ? _findTourneyById(_grpPasteState.tnId) : null) || tourneys.find(t=>t.id===_grpPasteState.tnId);
  if(!tn) return false;
  // 프로컴프 브라켓 모드 분기
  if(_grpPasteState.mode==='pcbkt'){
    return typeof _pcBktPasteApplyLogic==='function' ? _pcBktPasteApplyLogic(savable,tn) : false;
  }
  if(_grpPasteState.mode==='pcgj'){
    return typeof _pcGJPasteApplyLogic==='function' ? _pcGJPasteApplyLogic(savable,tn) : false;
  }
  if(_grpPasteState.mode==='pcbktedit'){
    return typeof _pcBktEditPasteApplyLogic==='function' ? _pcBktEditPasteApplyLogic(savable) : false;
  }
  // 브라켓 모드 분기
  if(_grpPasteState.mode==='bkt'){
    return _bktPasteApplyLogic(savable,tn);
  }

  // 자동인식 모드: gi가 null이면 선수 소속 대학으로 팀/조 자동 탐지
  let gi = _grpPasteState.gi, mi = _grpPasteState.mi;
  const autoDetect = (gi===null||gi===undefined);
  if(autoDetect){
    // 1. 선수 소속 대학에서 팀A/B 추출
    const univCount={};
    savable.forEach(r=>{
      [r.wPlayer?.univ,r.lPlayer?.univ].forEach(u=>{if(u&&u!=='무소속')univCount[u]=(univCount[u]||0)+1;});
    });
    const univRanked=Object.entries(univCount).sort((a,b)=>b[1]-a[1]);
    if(univRanked.length<2){alert('선수 소속 대학을 인식할 수 없습니다.\n조편성에 등록된 선수를 입력해주세요.');return false;}
    const autoA=univRanked[0][0], autoB=univRanked[1][0];
    // 2. 두 팀이 같은 조에 있는지 확인
    const groupIdx=tn.groups.findIndex(g=>g.univs.includes(autoA)&&g.univs.includes(autoB));
    if(groupIdx<0){
      // 같은 조가 아니면 autoA의 조에 교류전으로 추가
      const giA=tn.groups.findIndex(g=>g.univs.includes(autoA));
      const giB=tn.groups.findIndex(g=>g.univs.includes(autoB));
      if(giA<0&&giB<0){alert(`"${autoA}"와 "${autoB}" 모두 조편성에 없습니다.\n조편성에서 해당 대학을 추가해주세요.`);return false;}
      const targetGi=giA>=0?giA:giB;
      const GL='ABCDEFGHIJ';
      const msg=(giA>=0&&giB>=0)
        ?`"${autoA}"(${GL[giA]}조)와 "${autoB}"(${GL[giB]}조)는 다른 조입니다.\n${GL[targetGi]}조에 교류전으로 추가하시겠습니까?`
        :`"${giA<0?autoA:autoB}"는 조편성에 없습니다.\n${GL[targetGi]}조에 경기를 추가하시겠습니까?`;
      if(!confirm(msg))return false;
      gi=targetGi;
    } else {
      gi=groupIdx;
    }
    // 3. 기존 경기 찾기 또는 새로 생성
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
  const isGameMode = window._pasteMatchMode !== 'set'; // 승차수 모드 여부

  const teamANamesSet = new Set(players.filter(p=>p.univ===teamA).map(p=>p.name));
  const teamBNamesSet = new Set(players.filter(p=>p.univ===teamB).map(p=>p.name));
  // 팀 배정: 소속 대학 우선, 무소속 등 어느 팀에도 없으면 붙여넣기 좌측 위치(leftName)로 판단
  const _isWinnerInA = (r) => {
    const wn = r.wPlayer.name;
    if(teamANamesSet.has(wn)) return true;
    if(teamBNamesSet.has(wn)) return false;
    return (r.leftName||r.winName) === wn; // 무소속: 붙여넣기 좌측=A팀 기준
  };

  if(!m.sets) m.sets=[];
  if(!m.a) m.a=teamA;
  if(!m.b) m.b=teamB;

  let toastMsg='';

  if(isGameMode){
    // ── 승차수 모드: 모든 게임을 단일 세트에 누적 ──
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
    // 경기 점수 = 총 게임 승수
    m.sa=gA; m.sb=gB;
    toastMsg=`? ${savable.length}건 추가됨! (경기 방식: ${gA}:${gB})`;
  } else {
    // ── 세트제 모드: 각 붙여넣기 = 새 세트 ──
    let setIdxEl = document.getElementById('grp-paste-set-sel');
    let setIdx = setIdxEl ? setIdxEl.value : 'new';
    if(setIdx==='new'||setIdx===undefined){
      if(m.sets.length>=3){ alert('최대 3세트까지만 가능합니다.'); return false; }
      m.sets.push({games:[],scoreA:0,scoreB:0,winner:''});
      setIdx = m.sets.length-1;
    } else {
      setIdx = parseInt(setIdx);
      // 기존 세트에 데이터가 있으면 덮어쓰기 확인 후 초기화
      const existSet = m.sets[setIdx];
      if(existSet && existSet.games && existSet.games.length>0){
        if(!confirm(`${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 이미 ${existSet.games.length}게임이 있습니다.\n기존 기록을 지우고 새로 입력하시겠습니까?`))return false;
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
    // 경기 점수 = 세트 승수
    let mSA=0,mSB=0;
    m.sets.forEach(s=>{ if(s.winner==='A')mSA++; else if(s.winner==='B')mSB++; });
    m.sa=mSA; m.sb=mSB;
    toastMsg=`✅ ${savable.length}건 ${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 추가됨!`;
  }

  const dateEl = document.getElementById('paste-date');
  if(dateEl&&dateEl.value) m.d=dateEl.value;

  // 1순위: 정확한 게임 레벨 ID 매칭
  const matchId = m._id || genId();
  // matchId와 날짜를 조합하여 고유성 강화
  const uniqueMatchId = `${matchId}_${m.d||'nodate'}`;
  if(m._id) revertMatchRecord({...m, _id:uniqueMatchId});
  m._id = matchId; // 데이터에는 원래 ID 저장
  const dateStr = dateEl?.value || m.d || '';
  (m.sets||[]).forEach((set, si)=>{
    (set.games||[]).forEach((g, gi)=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(teamA||m.a||''):(teamB||m.b||'');
      const univL=g.winner==='A'?(teamB||m.b||''):(teamA||m.a||'');
      const gameMatchId = `${uniqueMatchId}_s${si}_g${gi}`;
      applyGameResult(wn,ln,dateStr,g.map||'',gameMatchId,univW,univL,tn.type==='tier'?'티어대회':'조별리그');
    });
  });
  // 티어대회: ttM에도 동기화 (기록 탭에서 표시되도록)
  if(tn.type==='tier'){
    const _ei=ttM.findIndex(x=>x._id===matchId);
    const _rec={_id:matchId,d:dateStr||m.d,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,n:tn.name,compName:tn.name,teamALabel:m.a,teamBLabel:m.b,stage:'league'};
    if(_ei>=0)ttM[_ei]=_rec;else ttM.unshift(_rec);
  }

  save();
  // 이중저장 방지: 편집 모달 + 붙여넣기 모달 모두 닫기
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
  // 팀명 미설정 시 선수 소속 대학으로 자동 감지 (붙여넣기 좌측=A팀, 우측=B팀)
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
    if(m.sets.length>=3){alert('최대 3세트까지만 가능합니다.');return false;}
    m.sets.push({games:[],scoreA:0,scoreB:0,winner:''});
    setIdx=m.sets.length-1;
  } else {
    setIdx=parseInt(setIdx);
    // 기존 세트에 데이터가 있으면 덮어쓰기 확인 후 초기화
    const existSet=m.sets[setIdx];
    if(existSet&&existSet.games&&existSet.games.length>0){
      if(!confirm(`${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 이미 ${existSet.games.length}게임이 있습니다.\n기존 기록을 지우고 새로 입력하시겠습니까?`))return false;
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
  // 전체 세트 집계로 경기 최종 스코어 갱신
  let mSA=0,mSB=0;
  (m.sets||[]).forEach(s=>{if(s.winner==='A')mSA++;else if(s.winner==='B')mSB++;});
  m.sa=mSA;m.sb=mSB;
  // 브라켓 승자 자동 업데이트 (수동 추가 경기 rnd===-1은 스킵)
  if(_grpPasteState.rnd!==-1){
    const _bw=mSA>mSB?m.a:mSB>mSA?m.b:'';
    if(_bw){const _bbr=getBracket(tn);_bbr.winners[`${_grpPasteState.rnd}-${_grpPasteState.mi}`]=_bw;}
  }
  // 개인 전적 반영: 기존 기록 먼저 롤백 후 전체 세트 재적용 (이중저장 방지)
  const matchId=m._id||genId();
  // matchId와 날짜를 조합하여 고유성 강화
  const uniqueMatchId = `${matchId}_${m.d||'nodate'}`;
  if(m._id) revertMatchRecord({...m, _id:uniqueMatchId});
  m._id=matchId; // 데이터에는 원래 ID 저장
  const dateStr=m.d;
  (m.sets||[]).forEach((s, si)=>{
    (s.games||[]).forEach((g, gi)=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(m.a||''):(m.b||'');
      const univL=g.winner==='A'?(m.b||''):(m.a||'');
      const gameMatchId = `${uniqueMatchId}_s${si}_g${gi}`;
      applyGameResult(wn,ln,dateStr,g.map||'',gameMatchId,univW,univL,'티어대회 토너먼트');
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
  toast.textContent=`? ${savable.length}건 ${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 추가됨!`;
  toast.style.cssText='position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(),2500);
  return true;
}

/* ══════════════════════════════════════
   🏆 티어대회 - CK 방식 경기 입력
══════════════════════════════════════ */
// _ttSub, _ttCurComp: constants.js에서 선언 및 localStorage 복원

function rTierTourTab(C, T){
  _migrateTierTourneys();
  T.innerText = '🏆 티어대회';
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const tierTourneys = (tourneys||[]).filter(t=>t.type==='tier');
  if(_ttCurComp && !tierTourneys.find(t=>t.name===_ttCurComp)) _ttCurComp='';
  if(!_ttCurComp && tierTourneys.length) _ttCurComp=tierTourneys[0].name;
  let h='';
  h+=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px">
    <span style="font-weight:700;color:#7c3aed;white-space:nowrap">🏆 티어대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="_ttCurComp=this.value;render()">
      <option value="">? 대회를 선택하세요 ?</option>
      ${tierTourneys.map(t=>{const _tDates=[];(t.groups||[]).forEach(g=>(g.matches||[]).forEach(m=>{if(m.d&&m.sa!=null)_tDates.push(m.d);}));(ttM||[]).filter(m=>m.compName===t.name&&m.d).forEach(m=>_tDates.push(m.d));_tDates.sort();const _ds=_tDates.length?` (${_tDates[0].slice(2).replace(/-/g,'/')}${_tDates.length>1&&_tDates[0]!==_tDates[_tDates.length-1]?'~'+_tDates[_tDates.length-1].slice(2).replace(/-/g,'/'):''})`:(t.createdAt?` (${t.createdAt.slice(0,10)})`:'');return`<option value="${t.name}"${_ttCurComp===t.name?' selected':''}>${t.name}${_ds}</option>`;}).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-p btn-xs" onclick="grpNewTierTourney()">+ 추가</button>`:''}
    ${_ttCurComp&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="grpRenameTierTourney()" title="대회명 수정">📝 이름수정</button>
    <button class="btn btn-r btn-xs" onclick="grpDelTierTourney()" title="현재 티어대회 삭제">🗑️ 삭제</button>`:''}
  </div>`;
  if(!tierTourneys.length){
    h+=`<div style="padding:60px 20px;text-align:center;color:var(--gray-l)">생성된 티어대회가 없습니다.</div>`;
    C.innerHTML=h; return;
  }
  const _curTierTn=(tourneys||[]).find(t=>t.name===_ttCurComp&&t.type==='tier');
  // 유효하지 않은 _ttSub 리셋
  const _validSubs=['input','records','rank','league','grprecords','grprank','tourschedule','bktrecords','grpedit'];
  if(!_validSubs.includes(_ttSub)) _ttSub='records';
  if(_ttSub==='input'&&!isLoggedIn) _ttSub='records';
  if(_ttSub==='grpedit'&&!isLoggedIn) _ttSub='records';
  const subOpts=[
    ...(isLoggedIn?[{id:'input',lbl:'⌨️ 일반',fn:`_ttSub='input';render()`}]:[]),
    {id:'records',lbl:'📜 일반 기록',fn:`_ttSub='records';openDetails={};render()`},
    {id:'rank',lbl:'📊 개인 순위',fn:`_ttSub='rank';render()`},
    {id:'league',lbl:'🏟️ 조별리그',fn:`_ttSub='league';render()`},
    {id:'grprecords',lbl:'📝 조별리그 기록',fn:`_ttSub='grprecords';openDetails={};render()`},
    {id:'grprank',lbl:'🏆 조별 순위',fn:`_ttSub='grprank';render()`},
    {id:'tourschedule',lbl:'📅 토너먼트',fn:`_ttSub='tourschedule';render()`,hasContext:true},
    {id:'bktrecords',lbl:'📋 토너먼트 기록',fn:`_ttSub='bktrecords';openDetails={};render()`},
    ...(isLoggedIn?[{id:'grpedit',lbl:'⚙️ 조편성',fn:`_ttSub='grpedit';grpSub='edit';render()`}]:[]),
  ];
  h+=`<div class="stabs no-export">${subOpts.map(o=>`<button class="stab ${_ttSub===o.id?'on':''}" onclick="${o.fn}"${o.hasContext?` oncontextmenu="showTournamentContext(event);return false"`:''}>${o.lbl}</button>`).join('')}</div>`;
  const _noTnMsg='<div style="padding:40px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>';
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
  } else if(_ttSub==='bktrecords'){
    if(!_curTierTn){ h+=_noTnMsg; C.innerHTML=h; return; }
    // stage 필드가 'bkt'이거나, stage가 없는데 토너먼트 데이터 구조(sets)를 가진 경우 포함
    const _bktRecs=ttM.filter(m=>m.compName===_ttCurComp && (m.stage==='bkt' || (!m.stage && m.sets)));
    // 브라켓 matchDetails에서 아직 ttM에 없는 경기도 포함
    const _bktIds=new Set(_bktRecs.map(m=>m._id));
    const _bktFromBracket=[];
    const _br=_curTierTn.bracket||{};
    Object.values(_br.matchDetails||{}).forEach(m=>{
      if(m._id&&!_bktIds.has(m._id)&&m.sa!=null){
        _bktFromBracket.push({_id:m._id,d:m.d,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,compName:_ttCurComp,stage:'bkt'});
      }
    });
    (_br.manualMatches||[]).forEach(m=>{
      if(m._id&&!_bktIds.has(m._id)&&m.sa!=null){
        _bktFromBracket.push({_id:m._id,d:m.d,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,compName:_ttCurComp,stage:'bkt',rndLabel:m.rndLabel||'토너먼트 경기'});
      }
    });
    const _allBkt=[..._bktRecs,..._bktFromBracket].sort((a,b)=>(b.d||'').localeCompare(a.d||''));
    if(_ttCurComp) h+=`<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#7c3aed;font-weight:700">🏆 ${_ttCurComp} 토너먼트 기록</div>`;
    h+=_allBkt.length?recSummaryListHTML(_allBkt,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">토너먼트 기록이 없습니다.<br><span style="font-size:11px">💡 토너먼트 탭에서 경기 결과를 입력하세요.</span></div>';
  } else if(_ttSub==='grpedit'){
    if(!_curTierTn){ h+=_noTnMsg; C.innerHTML=h; return; }
    // grpSub='list'은 rGrpEditInner의 '← 목록' 버튼에서 발생 → 기록 탭으로 전환
    if(grpSub!=='edit'){ _ttSub='records'; C.innerHTML=h; render(); return; }
    grpEditId=_curTierTn.id;
    h+=rGrpEditInner();
  } else if(_ttSub==='grprecords'){
    if(!_curTierTn){ h+=_noTnMsg; C.innerHTML=h; return; }
    // stage 필드가 'league'이거나, stage가 없는데 리그 데이터 구조를 가진 경우 포함
    const _grpRecs=ttM.filter(m=>m.compName===_ttCurComp && (m.stage==='league' || (!m.stage && m.sets)));
    // tourneys 조별리그에서 아직 ttM에 없는 기존 경기도 포함 (fallback)
    const _grpIds=new Set(_grpRecs.map(m=>m._id));
    const _grpFromTn=[];
    (_curTierTn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id||_grpIds.has(m._id)||m.sa==null) return;
        _grpFromTn.push({_id:m._id,d:m.d||'',a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,sets:m.sets||[],compName:_ttCurComp,stage:'league'});
      });
    });
    const _allGrp=[..._grpRecs,..._grpFromTn].sort((a,b)=>(b.d||'').localeCompare(a.d||''));
    if(_ttCurComp) h+=`<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#16a34a;font-weight:700">?? ${_ttCurComp} 조별리그 기록</div>`;
    h+=_allGrp.length?recSummaryListHTML(_allGrp,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">조별리그 기록이 없습니다.<br><span style="font-size:11px">?? 조별리그 탭에서 경기 결과를 입력하세요.</span></div>';
  } else {
    // records 탭 (일반 기록)
    const _ttFiltered=_ttCurComp
      ? ttM.filter(m=>m.compName===_ttCurComp&&(!m.stage||m.stage==='general'))
      : ttM.filter(m=>!m.stage||m.stage==='general');
    if(_ttCurComp) h+=`<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#7c3aed;font-weight:700">?? ${_ttCurComp} 일반 기록</div>`;
    h+=_ttFiltered.length?recSummaryListHTML(_ttFiltered,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">일반 기록이 없습니다.</div>';
  }
  C.innerHTML=h;
}

// 스트리머 상세 최근 기록에서 티어대회 클릭 → 해당 경기로 이동
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
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><span style="font-size:11px;font-weight:700;color:var(--text3)">정렬:</span><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['tt']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['tt']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['tt']='l';render()">패순</button></div>`;
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,univ:sc[name].univ}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l)">기록이 없습니다.<br><span style="font-size:11px">경기 입력 시 선수 매칭 정보가 있어야 집계됩니다.</span></div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='tt_rank';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=entries.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?entries.slice(_cp*_PAGE,(_cp+1)*_PAGE):entries;
  let h=sortBar+`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#7c3aed;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #ddd6fe">?? 티어대회 개인 순위${compName?` ? ${compName}`:''}</div>
  <table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>게임 승</th><th>게임 패</th><th>승률</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const col=gc(p.univ);
    const _ri=_cp*_PAGE+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')">${getPlayerPhotoHTML(p.name,'32px')}<span style="font-weight:700;font-size:14px">${p.name}</span>${p.univ?`<span class="ubadge" style="background:${col};font-size:9px">${p.univ}</span>`:''}</span></td><td class="wt">${p.w}</td><td class="lt">${p.l}</td><td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td></tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function rTierTour(){
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const subOpts=[
    {id:'input',lbl:'?? 경기 입력',fn:`_ttSub='input';render()`},
    {id:'records',lbl:'?? 기록',fn:`_ttSub='records';openDetails={};render()`}
  ];
  let h=stabs(_ttSub,subOpts);
  if(_ttSub==='input' && isLoggedIn){
    if(!BLD['tt'])BLD['tt']={date:'',tiers:[],membersA:[],membersB:[],sets:[]};
    h+=buildTierTourInputHTML();
  } else {
    // 현재 선택된 대회의 기록만 표시
    const _curTnName=_ttCurComp||'';
    const _ttFiltered=_curTnName
      ? ttM.filter(m=>m.compName===_curTnName)
      : ttM;
    h+=_ttFiltered.length?recSummaryListHTML(_ttFiltered,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">기록이 없습니다.</div>';
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

  let h=`<div class="match-builder"><h3>?? 티어대회 입력</h3>
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openTTPasteModal()" style="display:inline-flex;align-items:center;gap:5px">?? 자동인식</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">텍스트 붙여넣기 지원</span></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700;color:var(--blue)">날짜</label>
      <input type="date" value="${bld.date||''}" onchange="BLD['tt'].date=this.value">
    </div>

    <!-- 참가 티어 선택 -->
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:10px 14px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">① 참가 티어 <span style="font-weight:400;color:var(--gray-l)">(복수 선택)</span></div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="tier-filter-btn ${tfs.length===0?'on':''}" onclick="BLD['tt'].tiers=[];BLD['tt'].membersA=[];BLD['tt'].membersB=[];BLD['tt'].sets=[];render()">전체</button>
        ${TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tfs.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="ttToggleTier('${t}')">${getTierLabel(t)}</button>`;}).join('')}
      </div>
      <div style="font-size:11px;color:var(--blue);margin-top:6px">대상 선수: <strong>${eligible.length}명</strong></div>
    </div>

    <!-- 선수 목록 클릭으로 팀 배정 -->
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">② 선수 클릭 → 팀 배정 <span style="font-weight:400;color:var(--gray-l);font-size:11px">(A팀 버튼 / B팀 버튼으로 추가)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;max-height:200px;overflow-y:auto">
        ${eligible.length===0
          ?'<span style="color:var(--gray-l);font-size:12px">티어를 선택하면 선수 목록이 표시됩니다</span>'
          :eligible.map(p=>{
              const inA=mA.some(m=>m.name===p.name);
              const inB=mB.some(m=>m.name===p.name);
              const bg=inA?'#2563eb':inB?'#dc2626':gc(p.univ);
              if(inA||inB){
                return `<span style="display:inline-flex;align-items:center;gap:3px;background:${bg};color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;opacity:0.55">${p.name}<span style="opacity:.8;font-size:10px;margin-left:2px">${p.univ}/${p.tier}</span><span style="background:rgba(255,255,255,.3);border-radius:2px;padding:0 4px;font-size:9px;font-weight:800;margin-left:3px">${inA?'A팀':'B팀'}</span></span>`;
              }
              return `<span style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:#fff;padding:3px 6px;border-radius:6px;font-size:11px">
                <span style="font-weight:700">${p.name}</span><span style="opacity:.8;font-size:10px">${p.univ}/${p.tier}</span>
                <button onclick="ttAddPlayer('A','${p.name}')" style="background:var(--white);color:#2563eb;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer;margin-left:2px">A팀</button>
                <button onclick="ttAddPlayer('B','${p.name}')" style="background:var(--white);color:#dc2626;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer">B팀</button>
              </span>`;
            }).join('')
        }
      </div>
    </div>

    <!-- 팀 구성 확인 + 검색 추가 -->
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px">
      <div class="ck-panel">
        <h4>?? 팀 A (${mA.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-a-search" placeholder="?? 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('A')">
        </div>
        <div id="tt-a-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mA.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersA.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">선수 없음</span>'}</div>
      </div>
      <div class="ck-panel">
        <h4>?? 팀 B (${mB.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-b-search" placeholder="?? 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('B')">
        </div>
        <div id="tt-b-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mB.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersB.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">선수 없음</span>'}</div>
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
  if(!results.length){dropEl.innerHTML='<div style="padding:8px 12px;color:var(--gray-l);font-size:12px">결과 없음</div>';dropEl.style.display='block';return;}
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
    const n=parseInt(prompt('몇 조로 나눌까요?','4')||'0');
    if(!n||n<2)return;
    st.groups=[];
    for(let i=0;i<n;i++) st.groups.push({name:'GROUP '+String.fromCharCode(65+i),players:[],matches:[]});
  }
  // 선택된 티어 선수들 섞어서 배정
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
  if(!tn){alert('대회를 먼저 선택하세요.');return;}
  const newName=prompt('새 대회명을 입력하세요:',tn.name);
  if(!newName||!newName.trim()||newName.trim()===tn.name)return;
  const trimmed=newName.trim();
  if(tourneys.find(t=>t.name===trimmed&&t.id!==tn.id)){alert('이미 같은 이름의 대회가 있습니다.');return;}
  // comps에서도 대회명 업데이트
  comps.forEach(m=>{if(m.n===tn.name)m.n=trimmed;if(m.a===tn.name)m.a=trimmed;});
  curComp=trimmed;
  tn.name=trimmed;
  save();render();
}

function grpDelCurTourney(){
  const tn=tourneys.find(t=>t.name===curComp);
  if(!tn){alert('대회를 먼저 선택하세요.');return;}
  const matchCount=(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0);
  if(!confirm(`"${tn.name}" 대회를 삭제하시겠습니까?\n(${(tn.groups||[]).length}개 조 · ${matchCount}경기 모두 삭제됩니다)`))return;
  const ti=tourneys.indexOf(tn);
  tourneys.splice(ti,1);
  curComp=tourneys.length?tourneys[0].name:'';
  save();render();
}

function grpNewLeagueTourney(){
  const name=prompt('일반 대회명을 입력하세요:');if(!name||!name.trim())return;
  const id=genId();tourneys.unshift({id,name:name.trim(),type:'league',groups:[],createdAt:new Date().toISOString()});
  curComp=name.trim();save();grpEditId=tourneys[0].id;grpSub='edit';compSub='grpedit';render();
}
function grpNewTierTourney(){
  const name=prompt('티어 대회명을 입력하세요:');if(!name||!name.trim())return;
  const id=genId();tourneys.unshift({id,name:name.trim(),type:'tier',groups:[],createdAt:new Date().toISOString()});
  _ttCurComp=name.trim();curTab='tiertour';save();render();
}
function grpRenameTierTourney(){
  const tn=tourneys.find(t=>t.name===_ttCurComp&&t.type==='tier');
  if(!tn){alert('대회를 먼저 선택하세요.');return;}
  const newName=prompt('새 대회명을 입력하세요:',tn.name);
  if(!newName||!newName.trim()||newName.trim()===tn.name)return;
  const trimmed=newName.trim();
  if(tourneys.find(t=>t.name===trimmed&&t.id!==tn.id)){alert('이미 같은 이름의 대회가 있습니다.');return;}
  ttM.forEach(m=>{if(m.compName===tn.name){m.compName=trimmed;if(m.n===tn.name)m.n=trimmed;if(m.t===tn.name)m.t=trimmed;}});
  tn.name=trimmed;
  _ttCurComp=trimmed;
  save();render();
}
function grpDelTierTourney(){
  const tn=tourneys.find(t=>t.name===_ttCurComp&&t.type==='tier');
  if(!tn){alert('삭제할 티어대회를 선택하세요.');return;}
  if(!confirm(`"${tn.name}" 티어대회를 삭제하시겠습니까?`))return;
  const ti=tourneys.indexOf(tn);
  tourneys.splice(ti,1);
  _ttCurComp=tourneys.filter(t=>t.type==='tier').length?(tourneys.find(t=>t.type==='tier')?.name||''):'';
  save();render();
}
function grpNewTourney(){grpNewLeagueTourney();}
function grpDelTourney(ti){
  if(!confirm(`"${tourneys[ti].name}" 대회를 삭제하시겠습니까?`))return;
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
  // 첫 번째 매칭 옵션 자동 선택
  const firstMatch=Array.from(selEl.options).find(o=>o.value&&o.style.display!=='none');
  if(firstMatch)selEl.value=firstMatch.value;
}

function grpAddGroup(tnId){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const name=`${'ABCDEFGHIJ'[tn.groups.length]||tn.groups.length+1}조`;
  tn.groups.push({name,univs:[],matches:[]});save();render();
}
function grpDelGroup(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!confirm(`"${tn.groups[gi].name}"을 삭제하시겠습니까?`))return;
  tn.groups.splice(gi,1);save();render();
}
function grpAddUniv(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const sel=document.getElementById(`grp-univ-sel-${gi}`);const val=sel?sel.value:'';
  if(!val){alert('대학을 선택하세요.');return;}
  if(tn.groups[gi].univs.includes(val)){alert('이미 추가된 대학입니다.');return;}
  tn.groups[gi].univs.push(val);save();render();
}
function grpRemoveUniv(tnId,gi,ui){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  tn.groups[gi].univs.splice(ui,1);save();render();
}
/* ??????????????????????????????????????
   UTILS
?????????????????????????????????????? */
// 토너먼트 버튼 우클릭 메뉴
function showTournamentContext(e){
  e.preventDefault();
  e.stopPropagation();
  
  const existingMenu = document.getElementById('tournament-context-menu');
  if(existingMenu) existingMenu.remove();
  
  const menu = document.createElement('div');
  menu.id = 'tournament-context-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 99999;
    min-width: 160px;
    padding: 4px 0;
  `;
  
  menu.innerHTML = `
    <div style="padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px;"
         onmouseover="this.style.background='#f9fafb'" 
         onmouseout="this.style.background='white'"
         onclick="goToTournamentRecords()">
      <span style="font-size: 14px">??</span>
      <span>토너먼트 기록</span>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  const closeMenu = (ev) => {
    if(!menu.contains(ev.target)){
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 10);
}

// 대전기록 탭의 티어대회 토너먼트 서브탭으로 이동
function goToTournamentRecords(){
  const menu = document.getElementById('tournament-context-menu');
  if(menu) menu.remove();
  
  curTab = 'hist';
  histSub = 'tiertour-bkt';
  openDetails = {};
  if(!window.histPage) window.histPage = {};
  window.histPage['tiertour-bkt'] = 0;
  render();
}
