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
  // 구버전 stage 값 보정
  // - 'grp'는 조별리그와 동일한 의미로 사용되던 케이스가 있어 'league'로 통일
  (ttM||[]).forEach(r=>{
    if(r && r.stage==='grp'){ r.stage='league'; changed=true; }
  });
  // (보강) compName 누락 보정
  // - 티어대회 탭은 compName 기준으로 필터링하므로 비어 있으면 기록이 "사라진 것처럼" 보일 수 있음
  try{
    const firstTierName = (tourneys||[]).find(t=>t && t.type==='tier' && t.name)?.name || '';
    (ttM||[]).forEach(r=>{
      if(!r) return;
      const comp = String(r.compName||'').trim();
      const n = String(r.n||r.t||'').trim();
      if(!comp){
        r.compName = n || String(firstTierName||'').trim();
        if(r.compName) changed=true;
      }
      // 표시용 name(n)도 비어 있으면 채움(공유/라벨 등에서 사용)
      if(!String(r.n||'').trim() && String(r.compName||'').trim()){
        r.n = String(r.compName||'').trim();
        changed=true;
      }
    });
  }catch(e){}
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

window.ensureTierTourRecords = function(){
  try{
    if(typeof ttM==='undefined' || !Array.isArray(ttM)) window.ttM = [];
  }catch(e){}
  let before = 0;
  try{ before = Array.isArray(ttM) ? ttM.length : 0; }catch(e){}
  try{
    _ttMigrated = false;
    _migrateTierTourneys();
  }catch(e){}
  let after = 0;
  try{ after = Array.isArray(ttM) ? ttM.length : 0; }catch(e){}
  try{
    if(!after && typeof window._seedTierTtM==='function') window._seedTierTtM();
  }catch(e){}
  return { before, after, recovered: Math.max(0, after - before) };
};

// (원복 지원) 티어대회 토너먼트 대진표를 "프로리그 대회 대진표 방식"(tn.bracket = rounds 배열)으로 통일하기 위한 변환
// - 실험 버전에서 tn.bracket이 {slots,winners,matchDetails} 객체로 저장된 경우가 있어
//   proCompBracket에서는 "대진표 없음"으로 보일 수 있음.
// - tourschedule 렌더 직전에 1회 변환한다(가능한 범위: 1R 슬롯/승자/게임).
function _migrateTierBracketToRoundsIfNeeded(tn){
  try{
    if(!tn || tn.type!=='tier') return false;
    if(Array.isArray(tn.bracket)) return false;
    const legacy = tn.bracket || {};
    const slots = legacy.slots || {};
    const winners = legacy.winners || {};
    const matchDetails = legacy.matchDetails || {};

    let sz = parseInt(tn.bracketOverrideSize||'0',10)||0;
    if(sz<2){
      let maxMi = -1;
      Object.keys(slots).forEach(k=>{
        const m = String(k).match(/^0-(\d+)-[ab]$/);
        if(m) maxMi = Math.max(maxMi, parseInt(m[1],10));
      });
      sz = (maxMi>=0) ? (maxMi+1)*2 : 8;
    }
    // 2의 거듭제곱으로 보정
    let p=1; while(p<sz) p*=2; sz=p;

    const firstRound=[];
    for(let i=0;i<sz;i+=2){
      const mi = Math.floor(i/2);
      const a = String(slots[`0-${mi}-a`]||'').trim();
      const b = String(slots[`0-${mi}-b`]||'').trim();
      const md = matchDetails[`0-${mi}`] || null;
      const m = {a:a||'TBD', b:b||'TBD', winner:'', d:(md?.d||''), map:(md?.map||'')};
      // 세부 게임 이관(가능하면)
      try{
        const games = md?.sets?.[0]?.games || [];
        if(Array.isArray(games) && games.length){
          m._games = games.map(g=>({winner:g.winner||'', map:g.map||''})).filter(x=>x.winner);
        }
      }catch(e){}
      const wName = String(winners[`0-${mi}`]||'').trim();
      if(wName && wName===m.a) m.winner='A';
      else if(wName && wName===m.b) m.winner='B';
      firstRound.push(m);
    }
    const rounds=[firstRound];
    let cur=firstRound.length;
    while(cur>1){
      cur=Math.floor(cur/2);
      const rnd=[];
      for(let i=0;i<cur;i++) rnd.push({a:'TBD', b:'TBD', winner:'', d:'', map:''});
      rounds.push(rnd);
    }
    // 승자 전파(표시/다음 라운드 슬롯)
    for(let ri=0; ri<rounds.length-1; ri++){
      (rounds[ri]||[]).forEach((m,mi)=>{
        if(!m || !m.winner) return;
        const nextMi=Math.floor(mi/2);
        const isA = mi%2===0;
        const w = m.winner==='A'?m.a:m.b;
        if(rounds[ri+1] && rounds[ri+1][nextMi]){
          if(isA) rounds[ri+1][nextMi].a = w;
          else rounds[ri+1][nextMi].b = w;
        }
      });
    }

    tn.bracket = rounds;
    save();
    return true;
  }catch(e){
    return false;
  }
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
  if(hintEl)hintEl.innerHTML=`<span style="color:#1d4ed8;font-weight:700">⚔️ 브라켓 경기 입력 모드</span>${tA||tB?` — <b>팀A: ${tA}</b> vs <b>팀B: ${tB}</b>`:''}`;
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
  // 붙여넣기 모달이 경기 수정 모달 뒤에 깔리는 문제 방지: 기존 모달을 먼저 닫고 열기
  try{ cm('grpMatchModal'); }catch(e){}
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
  if (applyBtn)  { applyBtn.style.display = 'none'; applyBtn.textContent = '✅ 세트에 적용'; }
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
      hintEl.innerHTML=`<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#16a34a;font-weight:700">🤖 자동인식 모드</span> — 선수 소속 대학을 자동으로 인식해 해당 조 경기에 저장합니다.<br><span style="font-size:11px;color:#6b7280">팀이 다른 조일 경우 교류전으로 추가할지 확인합니다.</span></div>`;
    else
      hintEl.innerHTML=`<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">🏆 경기 지정 모드</span> — <b>${teamA||'팀A'}</b> vs <b>${teamB||'팀B'}</b><br><span style="font-size:11px;color:#6b7280">세트 선택 후 붙여넣기하면 해당 세트에 저장됩니다.</span></div>`;
  }

  // 세트 선택 드롭다운 (경기 지정 모드에서 항상 표시)
  const compWrap = document.getElementById('paste-comp-wrap');
  if(compWrap){
    if(!autoDetect){
      const setOpts = (m?.sets||[]).map((s,i)=>{
        const lbl = i===2?'🎯 에이스전':`${i+1}세트`;
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
  // 경기 방식(승차수/세트제) 선택은 대회에서도 사용 — 표시 유지
  const _matchModeDiv=document.getElementById('paste-match-mode-game')?.closest('div[style]');
  if(_matchModeDiv)_matchModeDiv.style.display='flex';
  // 세트제 기본값으로 초기화
  setPasteMatchMode('set');
  const _pTitle=document.querySelector('#pasteModal .mtitle');
  if(_pTitle)_pTitle.textContent='📋 결과 붙여넣기';

  // 붙여넣기 모달이 경기 수정 모달 뒤에 깔리는 문제 방지
  try{ cm('grpMatchModal'); }catch(e){}
  om('pasteModal');
}

// grpPasteApply: 대회 세트 적용 버튼 핸들러 (HTML에서 직접 호출)
function grpPasteApply(){
  if(!window._pasteResults) return;
  const savable = window._pasteResults.filter(r=>(r.wPlayer&&r.lPlayer)||r._scoreOnly);
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
  // 다른 화면(토너먼트 대진표 자동인식 등)에서 window._grpPasteState로 상태를 주입하므로 항상 동기화
  if(window._grpPasteState) _grpPasteState = window._grpPasteState;
  if(!_grpPasteState){ alert('붙여넣기 상태가 초기화되지 않았습니다. 다시 시도해주세요.'); return false; }
  const tn = (typeof _findTourneyById==='function' ? _findTourneyById(_grpPasteState.tnId) : null) || tourneys.find(t=>t.id===_grpPasteState.tnId);
  if(!tn) return false;
  // 프로컴프 브라켓 모드 분기
  if(_grpPasteState.mode==='pcbkt'){
    return typeof _pcBktPasteApplyLogic==='function' ? _pcBktPasteApplyLogic(savable,tn) : false;
  }
  // (요청사항) 프로리그/티어대회 토너먼트 대진표 자동생성
  if(_grpPasteState.mode==='pcbktbuild'){
    return typeof _pcBktBuildFromPasteApplyLogic==='function' ? _pcBktBuildFromPasteApplyLogic(savable,tn) : false;
  }
  if(_grpPasteState.mode==='pcgj'){
    return typeof _pcGJPasteApplyLogic==='function' ? _pcGJPasteApplyLogic(savable,tn) : false;
  }
  if(_grpPasteState.mode==='pcbktedit'){
    return typeof _pcBktEditPasteApplyLogic==='function' ? _pcBktEditPasteApplyLogic(savable) : false;
  }
  // 프로리그 대회 조별리그/팀전 붙여넣기 모드
  if(_grpPasteState.mode==='procomp-league'){
    return typeof _proCompLeaguePasteApplyLogic==='function' ? _proCompLeaguePasteApplyLogic(savable) : false;
  }
  if(_grpPasteState.mode==='procomp-team'){
    return typeof _proCompTeamPasteApplyLogic==='function' ? _proCompTeamPasteApplyLogic(savable) : false;
  }
  // 브라켓 모드 분기
  if(_grpPasteState.mode==='bkt'){
    return _bktPasteApplyLogic(savable,tn);
  }

  // 자동인식 모드: gi가 null이면 팀/선수로 조/경기 자동 탐지
  let gi = _grpPasteState.gi, mi = _grpPasteState.mi;
  const autoDetect = (gi===null||gi===undefined);
  if(autoDetect){
    const isTier = tn && tn.type==='tier';
    // 1) 티어대회(개인전): 선수 이름 기반으로 A/B 추출
    let autoA='', autoB='';
    if(isTier){
      const nameCount={};
      savable.forEach(r=>{
        const wn=r.wPlayer?.name, ln=r.lPlayer?.name;
        if(wn) nameCount[wn]=(nameCount[wn]||0)+1;
        if(ln) nameCount[ln]=(nameCount[ln]||0)+1;
      });
      const ranked=Object.entries(nameCount).sort((a,b)=>b[1]-a[1]);
      if(ranked.length<2){alert('선수 이름을 인식할 수 없습니다.\n조편성에 등록된 선수를 입력해주세요.');return false;}
      autoA=ranked[0][0]; autoB=ranked[1][0];
    } else {
      // 1) 일반(대학전): 선수 소속 대학에서 팀A/B 추출
      const univCount={};
      savable.forEach(r=>{
        [r.wPlayer?.univ,r.lPlayer?.univ].forEach(u=>{if(u&&u!=='무소속')univCount[u]=(univCount[u]||0)+1;});
      });
      const univRanked=Object.entries(univCount).sort((a,b)=>b[1]-a[1]);
      if(univRanked.length<2){alert('선수 소속 대학을 인식할 수 없습니다.\n조편성에 등록된 선수를 입력해주세요.');return false;}
      autoA=univRanked[0][0]; autoB=univRanked[1][0];
    }

    // 2. 두 대상이 같은 조에 있는지 확인
    const groupIdx=tn.groups.findIndex(g=>g.univs.includes(autoA)&&g.univs.includes(autoB));
    if(groupIdx<0){
      // 같은 조가 아니면 autoA의 조에 교류전으로 추가
      const giA=tn.groups.findIndex(g=>g.univs.includes(autoA));
      const giB=tn.groups.findIndex(g=>g.univs.includes(autoB));
      if(giA<0&&giB<0){
        // (요청사항) 티어대회(개인전)는 자동으로 조편성(선수)을 구성해서 저장 진행
        if(isTier){
          if(!tn.groups) tn.groups=[];
          if(!tn.groups.length) tn.groups.push({name:'A조',univs:[],matches:[]});
          const g0=tn.groups[0];
          if(!g0.univs) g0.univs=[];
          // 붙여넣기에서 등장한 선수들을 자동 추가
          const addSet=new Set();
          savable.forEach(r=>{ if(r.wPlayer?.name) addSet.add(r.wPlayer.name); if(r.lPlayer?.name) addSet.add(r.lPlayer.name); });
          addSet.forEach(n=>{ if(n && !g0.univs.includes(n)) g0.univs.push(n); });
          gi=0;
        } else {
          alert(`"${autoA}"와 "${autoB}" 모두 조편성에 없습니다.\n조편성에서 해당 ${isTier?'선수':'대학'}을(를) 추가해주세요.`);
          return false;
        }
      }
      if(gi==null){
        const targetGi=giA>=0?giA:giB;
        // (요청사항) 티어대회(개인전)는 조에 없으면 자동으로 해당 조에 추가
        if(isTier){
          const tgt=tn.groups[targetGi];
          if(tgt){
            if(!tgt.univs) tgt.univs=[];
            if(giA<0 && !tgt.univs.includes(autoA)) tgt.univs.push(autoA);
            if(giB<0 && !tgt.univs.includes(autoB)) tgt.univs.push(autoB);
          }
          gi=targetGi;
        } else {
          const GL='ABCDEFGHIJ';
          const msg=(giA>=0&&giB>=0)
            ?`"${autoA}"(${GL[giA]}조)와 "${autoB}"(${GL[giB]}조)는 다른 조입니다.\n${GL[targetGi]}조에 교류전으로 추가하시겠습니까?`
            :`"${giA<0?autoA:autoB}"는 조편성에 없습니다.\n${GL[targetGi]}조에 경기를 추가하시겠습니까?`;
          if(!confirm(msg))return false;
          gi=targetGi;
        }
      }
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

  const isTier = tn && tn.type==='tier';
  const teamANamesSet = isTier ? new Set([teamA]) : new Set(players.filter(p=>p.univ===teamA).map(p=>p.name));
  const teamBNamesSet = isTier ? new Set([teamB]) : new Set(players.filter(p=>p.univ===teamB).map(p=>p.name));
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
      if(r._scoreOnly){
        const a=(r._scoreA||0), b=(r._scoreB||0);
        for(let i=0;i<a;i++) gset.games.push({playerA:'',playerB:'',winner:'A',map:''});
        for(let i=0;i<b;i++) gset.games.push({playerA:'',playerB:'',winner:'B',map:''});
        return;
      }
      const wn=r.wPlayer.name; const ln=r.lPlayer.name;
      const wInA=_isWinnerInA(r);
      gset.games.push({playerA:wInA?wn:ln, playerB:wInA?ln:wn, winner:wInA?'A':'B', map:r.map||''});
    });
    let gA=0,gB=0;
    gset.games.forEach(g=>{ if(g.winner==='A')gA++; else if(g.winner==='B')gB++; });
    gset.scoreA=gA; gset.scoreB=gB; gset.winner=gA>gB?'A':gB>gA?'B':'';
    // 경기 점수 = 총 게임 승수
    m.sa=gA; m.sb=gB;
    toastMsg=`✅ ${savable.length}건 추가됨! (경기 방식: ${gA}:${gB})`;
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
      if(r._scoreOnly){
        const a=(r._scoreA||0), b=(r._scoreB||0);
        for(let i=0;i<a;i++) set.games.push({playerA:'',playerB:'',winner:'A',map:''});
        for(let i=0;i<b;i++) set.games.push({playerA:'',playerB:'',winner:'B',map:''});
        return;
      }
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

  // 개인 전적 반영: 기존 기록 먼저 롤백 후 전체 세트 재적용 (grpSaveMatch와 동일 패턴 → 이중저장 방지)
  const matchId = m._id || genId();
  if(m._id) revertMatchRecord({...m, _id:matchId});
  m._id = matchId;
  const dateStr = dateEl?.value || m.d || '';
  (m.sets||[]).forEach((set, si)=>{
    (set.games||[]).forEach((g, gi)=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(teamA||m.a||''):(teamB||m.b||'');
      const univL=g.winner==='A'?(teamB||m.b||''):(teamA||m.a||'');
      const gameId = g._id || `${matchId}_s${si}_g${gi}`;
      applyGameResult(wn,ln,dateStr,g.map||'',gameId,univW,univL,tn.type==='tier'?'티어대회':'조별리그');
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
  try{ if(typeof syncTierTtMHistory==='function') syncTierTtMHistory(); }catch(e){}
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}

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
    if(r._scoreOnly){
      const a=(r._scoreA||0), b=(r._scoreB||0);
      for(let i=0;i<a;i++) set.games.push({playerA:'',playerB:'',winner:'A',map:''});
      for(let i=0;i<b;i++) set.games.push({playerA:'',playerB:'',winner:'B',map:''});
      return;
    }
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
  if(m._id) revertMatchRecord({...m, _id:matchId});
  m._id=matchId;
  const dateStr=m.d;
  (m.sets||[]).forEach((s, si)=>{
    (s.games||[]).forEach((g, gi)=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(m.a||''):(m.b||'');
      const univL=g.winner==='A'?(m.b||''):(m.a||'');
      const gameId = g._id || `${matchId}_s${si}_g${gi}`;
      applyGameResult(wn,ln,dateStr,g.map||'',gameId,univW,univL,'티어대회 토너먼트');
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
  toast.textContent=`✅ ${savable.length}건 ${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 추가됨!`;
  toast.style.cssText='position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(),2500);
  return true;
}

/* ══════════════════════════════════════
   🎯 티어대회 - CK 방식 경기 입력
══════════════════════════════════════ */
// _ttSub, _ttCurComp: constants.js에서 선언 및 localStorage 복원

function rTierTourTab(C, T){
  _migrateTierTourneys();
  T.innerText = '🎯 티어대회';
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const tierTourneys = (tourneys||[]).filter(t=>t.type==='tier');
  // (보강) ttM 기록의 compName/n/t 값이 누락되거나 공백이 섞여도 현재 대회로 필터링되게
  const _eqComp = (m, compName)=>{
    const c = String(compName||'').trim();
    if(!c) return true;
    const a = String(m?.compName||'').trim();
    const b = String(m?.n||'').trim();
    const d = String(m?.t||'').trim();
    return a===c || b===c || d===c;
  };
  // (보강) tourneys에 없는 "기록만 있는 티어대회(compName)"도 선택 가능하게
  const _ttmCompNames = (() => {
    try{
      const set=new Set();
      (ttM||[]).forEach(m=>{
        const n = String(m?.compName||m?.n||m?.t||'').trim();
        if(n) set.add(n);
      });
      return [...set];
    }catch(e){ return []; }
  })();
  const _allCompNames = (() => {
    const set=new Set((tierTourneys||[]).map(t=>String(t?.name||'').trim()).filter(Boolean));
    _ttmCompNames.forEach(n=>set.add(n));
    return [...set];
  })();

  if(_ttCurComp && !_allCompNames.includes(String(_ttCurComp).trim())) _ttCurComp='';
  if(!_ttCurComp && _allCompNames.length) _ttCurComp=_allCompNames[0];
  let h='';
  h+=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px">
    <span style="font-weight:700;color:#7c3aed;white-space:nowrap">🎯 티어대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="_ttCurComp=this.value;render()">
      <option value="">— 대회를 선택하세요 —</option>
      ${_allCompNames.map(name=>{
        const t = (tierTourneys||[]).find(x=>String(x?.name||'').trim()===String(name||'').trim());
        const _tDates=[];
        if(t){
          (t.groups||[]).forEach(g=>(g.matches||[]).forEach(m=>{if(m.d&&m.sa!=null)_tDates.push(m.d);})); 
          // 브라켓/수동 경기 날짜도 포함
          try{
            const br=t.bracket||{};
            Object.values(br.matchDetails||{}).forEach(m=>{if(m&&m.d&&m.sa!=null)_tDates.push(m.d);});
            (br.manualMatches||[]).forEach(m=>{if(m&&m.d&&m.sa!=null)_tDates.push(m.d);});
          }catch(e){}
        }
        (ttM||[]).filter(m=>_eqComp(m,name)&&m.d).forEach(m=>_tDates.push(m.d));
        _tDates.sort();
        const _ds=_tDates.length?` (${_tDates[0].slice(2).replace(/-/g,'/')}${_tDates.length>1&&_tDates[0]!==_tDates[_tDates.length-1]?'~'+_tDates[_tDates.length-1].slice(2).replace(/-/g,'/'):''})`
          :(t && t.createdAt?` (${String(t.createdAt).slice(0,10)})`:'');
        const hint = t ? '' : ' (기록만)';
        return `<option value="${name}"${String(_ttCurComp).trim()===String(name).trim()?' selected':''}>${name}${hint}${_ds}</option>`;
      }).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-p btn-xs" onclick="grpNewTierTourney()">+ 추가</button>`:''}
    ${_ttCurComp&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="grpRenameTierTourney()" title="대회명 수정">✏️ 이름수정</button>
    <button class="btn btn-r btn-xs" onclick="grpDelTierTourney()" title="현재 티어대회 삭제">🗑️ 삭제</button>`:''}
  </div>`;
  if(!_allCompNames.length){
    h+=`<div style="padding:60px 20px;text-align:center;color:var(--gray-l)">생성된 티어대회가 없습니다.</div>`;
    C.innerHTML=h; return;
  }
  const _curTierTn=(tourneys||[]).find(t=>t.name===_ttCurComp&&t.type==='tier') || null;
  // 유효하지 않은 _ttSub 리셋
  const _validSubs=['input','records','rank','league','grprecords','grprank','tourschedule','bktrecords','grpedit'];
  if(!_validSubs.includes(_ttSub)) _ttSub='records';
  if(_ttSub==='input'&&!isLoggedIn) _ttSub='records';
  if(_ttSub==='grpedit'&&!isLoggedIn) _ttSub='records';
  // (롤백) 티어대회 서브메뉴: 단일 라인 탭(기록/입력/대진표/관리로 묶지 않음)
  const subOpts=[
    ...(isLoggedIn?[{id:'input',lbl:'📝 일반',fn:`_ttSub='input';render()`}]:[]),
    {id:'records',lbl:'📋 일반 기록',fn:`_ttSub='records';openDetails={};render()`},
    {id:'rank',lbl:'🏆 개인 순위',fn:`_ttSub='rank';render()`,hasContext:true},
    {id:'league',lbl:'📅 조별리그',fn:`_ttSub='league';render()`},
    {id:'grprecords',lbl:'📋 조별리그 기록',fn:`_ttSub='grprecords';openDetails={};render()`},
    {id:'grprank',lbl:'📊 조별 순위',fn:`_ttSub='grprank';render()`},
    {id:'tourschedule',lbl:'🗂️ 토너먼트',fn:`_ttSub='tourschedule';render()`,hasContext:true},
    {id:'bktrecords',lbl:'🏆 토너먼트 기록',fn:`_ttSub='bktrecords';openDetails={};render()`},
    ...(isLoggedIn?[{id:'grpedit',lbl:'🏗️ 조편성',fn:`_ttSub='grpedit';grpSub='edit';render()`}]:[]),
  ];
  const _subOpts = (typeof applyTabLabels==='function') ? applyTabLabels('tiertour', subOpts) : subOpts;
  h+=`<div class="fbar utilbar utilbar--scroll merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    ${_subOpts.map(o=>`<button class="pill ${_ttSub===o.id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="${o.fn}"${o.hasContext?` oncontextmenu="${o.id==='rank'?'showRankContext(event)':'showTournamentContext(event)'};return false"`:''}>${o.lbl}</button>`).join('')}
  </div>`;

  // 조편성 화면 진입 보정(일부 상태값 남는 케이스 방지)
  if(_ttSub==='grpedit'){
    try{ if(typeof grpSub==='undefined') window.grpSub='edit'; }catch(e){}
    try{ if(grpSub!=='edit') grpSub='edit'; }catch(e){ window.grpSub='edit'; }
  }
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
    // (원복) 티어대회 토너먼트 대진표를 프로리그 대회 대진표 방식(proCompBracket)으로 통일
    if(_curTierTn){
      try{ _migrateTierBracketToRoundsIfNeeded(_curTierTn); }catch(e){}
      h+= (typeof proCompBracket==='function') ? proCompBracket(_curTierTn) : _noTnMsg;
    } else h+=_noTnMsg;
  } else if(_ttSub==='bktrecords'){
    const _bktRecs=ttM.filter(m=>_eqComp(m,_ttCurComp)&&m.stage==='bkt');
    // 브라켓 matchDetails에서 아직 ttM에 없는 경기도 포함
    const _bktIds=new Set(_bktRecs.map(m=>m._id));
    const _bktFromBracket=[];
    if(_curTierTn){
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
    }
    // (버그픽스) 브라켓에만 있고 ttM에 없는 기록은 ttM으로 동기화
    // - 그래야 recSummaryListHTML의 "일괄 선택/삭제"가 인덱스/ID 불일치로 깨지지 않음
    if(_bktFromBracket.length){
      try{
        _bktFromBracket.forEach(m=>{
          if(!m || !m._id) return;
          if(ttM.some(x=>x && x._id===m._id)) return;
          ttM.unshift({...m, n:_ttCurComp, compName:_ttCurComp, stage:'bkt'});
        });
        save();
      }catch(e){}
    }
    const _allBkt=ttM.filter(m=>_eqComp(m,_ttCurComp)&&m.stage==='bkt').sort((a,b)=>(b.d||'').localeCompare(a.d||''));
    if(_ttCurComp) h+=`<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#7c3aed;font-weight:700">🏆 ${_ttCurComp} 토너먼트 기록</div>`;
    h+=`<div class="no-export" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      ${typeof buildYearMonthFilterControls==='function'?buildYearMonthFilterControls('tt',true):''}
      <button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>
      <button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    </div>`;
    if(isLoggedIn && _curTierTn){
      h+=`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:-2px 0 12px">
        <button class="btn btn-p btn-sm" onclick="openTierBktPasteModal('${_curTierTn.id}')">📋 경기 결과 붙여넣기(자동인식)</button>
        <span style="font-size:11px;color:var(--gray-l)">결과는 “토너먼트 기록”으로 저장됩니다. (대진표 자동 반영은 하지 않음)</span>
      </div>`;
    }
    h+=_allBkt.length?recSummaryListHTML(_allBkt,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">토너먼트 기록이 없습니다.<br><span style="font-size:11px">🗂️ 토너먼트 탭에서 경기 결과를 입력하세요.</span></div>';
  } else if(_ttSub==='grpedit'){
    if(!_curTierTn){ h+=_noTnMsg; C.innerHTML=h; return; }
    // grpSub='list'은 rGrpEditInner의 '← 목록' 버튼에서 발생 → 기록 탭으로 전환
    if(grpSub!=='edit'){ _ttSub='records'; C.innerHTML=h; render(); return; }
    grpEditId=_curTierTn.id;
    h+=rGrpEditInner();
  } else if(_ttSub==='grprecords'){
    const _grpRecs=ttM.filter(m=>_eqComp(m,_ttCurComp)&&m.stage==='league');
    // tourneys 조별리그에서 아직 ttM에 없는 기존 경기도 포함 (fallback)
    const _grpIds=new Set(_grpRecs.map(m=>m._id));
    const _grpFromTn=[];
    if(_curTierTn){
      (_curTierTn.groups||[]).forEach(grp=>{
        (grp.matches||[]).forEach(m=>{
          if(!m._id||_grpIds.has(m._id)||m.sa==null) return;
          _grpFromTn.push({_id:m._id,d:m.d||'',a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,sets:m.sets||[],compName:_ttCurComp,stage:'league'});
        });
      });
    }
    // (버그픽스) 조별리그도 tourneys에만 있고 ttM에 없는 기록은 ttM으로 동기화
    if(_grpFromTn.length){
      try{
        _grpFromTn.forEach(m=>{
          if(!m || !m._id) return;
          if(ttM.some(x=>x && x._id===m._id)) return;
          ttM.unshift({...m, n:_ttCurComp, compName:_ttCurComp, stage:'league'});
        });
        save();
      }catch(e){}
    }
    const _allGrp=ttM.filter(m=>_eqComp(m,_ttCurComp)&&m.stage==='league').sort((a,b)=>(b.d||'').localeCompare(a.d||''));
    if(_ttCurComp) h+=`<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#16a34a;font-weight:700">📅 ${_ttCurComp} 조별리그 기록</div>`;
    h+=`<div class="no-export" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      ${typeof buildYearMonthFilterControls==='function'?buildYearMonthFilterControls('tt',true):''}
      <button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>
      <button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    </div>`;
    h+=_allGrp.length?recSummaryListHTML(_allGrp,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">조별리그 기록이 없습니다.<br><span style="font-size:11px">📅 조별리그 탭에서 경기 결과를 입력하세요.</span></div>';
  } else {
    // records 탭 (일반 기록)
    const _ttGeneralBase = ttM.filter(m=>!m?.stage || m.stage==='general' || m.stage==='normal');
    let _ttFiltered=_ttCurComp
      ? _ttGeneralBase.filter(m=>_eqComp(m,_ttCurComp))
      : _ttGeneralBase.slice();
    if(_ttCurComp && !_ttFiltered.length){
      const _orphans = _ttGeneralBase.filter(m=>!String(m?.compName||m?.n||m?.t||'').trim());
      if(_orphans.length){
        try{
          _orphans.forEach(m=>{
            if(!m) return;
            m.compName = _ttCurComp;
            if(!String(m.n||'').trim()) m.n = _ttCurComp;
            if(!String(m.t||'').trim()) m.t = _ttCurComp;
          });
          save();
        }catch(e){}
        _ttFiltered = _ttGeneralBase.filter(m=>_eqComp(m,_ttCurComp));
      }
    }
    if(_ttCurComp) h+=`<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#7c3aed;font-weight:700">🎯 ${_ttCurComp} 일반 기록</div>`;
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
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,univ:sc[name].univ}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l)">기록이 없습니다.<br><span style="font-size:11px">경기 입력 시 선수 매칭 정보가 있어야 집계됩니다.</span></div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='tt_rank';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=entries.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?entries.slice(_cp*_PAGE,(_cp+1)*_PAGE):entries;
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#7c3aed;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #ddd6fe">🏆 티어대회 개인 순위${compName?` — ${compName}`:''}</div>
  <table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>게임 승</th><th>게임 패</th><th>승률</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const col=gc(p.univ);
    const _ri=_cp*_PAGE+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(p.name,'32px')}<span style="font-weight:700;font-size:14px">${p.name}</span>${p.univ?`<span class="ubadge" style="background:${col};font-size:9px">${p.univ}</span>`:''}</span></td><td class="wt">${p.w}</td><td class="lt">${p.l}</td><td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td></tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function rTierTour(){
  try{
    if((typeof ttM==='undefined' || !Array.isArray(ttM) || !ttM.length) && typeof window.ensureTierTourRecords==='function'){
      window.ensureTierTourRecords();
    }
  }catch(e){}
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const subOpts=[
    {id:'input',lbl:'📝 경기 입력',fn:`_ttSub='input';render()`},
    {id:'records',lbl:'📋 기록',fn:`_ttSub='records';openDetails={};render()`}
  ];
  const _subOpts = (typeof applyTabLabels==='function') ? applyTabLabels('tiertour', subOpts) : subOpts;
  let h=stabs(_ttSub,_subOpts);
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

  let h=`<div class="match-builder"><h3>🎯 티어대회 입력</h3>
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openTTPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button></div>
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
        <h4>🔵 팀 A (${mA.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-a-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('A')">
        </div>
        <div id="tt-a-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mA.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersA.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">선수 없음</span>'}</div>
      </div>
      <div class="ck-panel">
        <h4>🔴 팀 B (${mB.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-b-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('B')">
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
  const compName = String(_ttCurComp||'').trim();
  if(!compName){ alert('삭제할 티어대회를 선택하세요.'); return; }

  // tourneys에 없는 "기록만(ttM만)" 대회도 삭제 지원
  const tn = (tourneys||[]).find(t=>t && t.type==='tier' && String(t.name||'').trim()===compName) || null;
  const _eqComp = (m)=>{
    const c = compName;
    const a = String(m?.compName||'').trim();
    const b = String(m?.n||'').trim();
    const d = String(m?.t||'').trim();
    return a===c || b===c || d===c;
  };

  const msg = tn
    ? `"${compName}" 티어대회를 삭제하시겠습니까?\n(대회 정보 + 기록(ttM) + 스트리머 최근 경기 반영까지 모두 제거됩니다)`
    : `"${compName}" 티어대회 기록을 삭제하시겠습니까?\n(tourneys에는 없고 기록(ttM)만 있는 상태입니다)`;
  if(!confirm(msg)) return;

  // 1) 삭제 대상 경기(롤백용) 수집
  const byId = new Set();
  const toRevert = [];
  // ttM 기반
  try{
    (ttM||[]).forEach(m=>{
      if(!m || !_eqComp(m)) return;
      const id = String(m._id||'');
      if(id && byId.has(id)) return;
      if(id) byId.add(id);
      toRevert.push(m);
    });
  }catch(e){}
  // tourneys 기반(조별/브라켓) — ttM에 없는 경기까지 포함
  try{
    if(tn){
      (tn.groups||[]).forEach(g=>{
        (g.matches||[]).forEach(m=>{
          if(!m || !m._id) return;
          if(byId.has(m._id)) return;
          byId.add(m._id);
          toRevert.push({...m, _id:m._id, d:m.d||'', sets:m.sets||[]});
        });
      });
      const br = tn.bracket || {};
      Object.values(br.matchDetails||{}).forEach(m=>{
        if(!m || !m._id) return;
        if(byId.has(m._id)) return;
        byId.add(m._id);
        toRevert.push({...m, _id:m._id, d:m.d||'', sets:m.sets||[]});
      });
      (br.manualMatches||[]).forEach(m=>{
        if(!m || !m._id) return;
        if(byId.has(m._id)) return;
        byId.add(m._id);
        toRevert.push({...m, _id:m._id, d:m.d||'', sets:m.sets||[]});
      });
    }
  }catch(e){}

  // 2) 스트리머 history/포인트/ELO 롤백 + ttM에서 제거(revertMatchRecord 내부에서 처리)
  try{
    if(typeof revertMatchRecord==='function'){
      toRevert.forEach(m=>{ try{ revertMatchRecord(m); }catch(e){} });
    }
  }catch(e){}

  // 3) 남아있는 ttM 중 compName 같은 것 정리(혹시 _id 없는 레코드 등)
  try{
    if(typeof ttM!=='undefined' && Array.isArray(ttM)){
      ttM = ttM.filter(m=>!(m && _eqComp(m)));
    }
  }catch(e){}

  // 4) tourneys에서 삭제
  try{
    if(tn){
      const ti = (tourneys||[]).indexOf(tn);
      if(ti>=0) tourneys.splice(ti,1);
    }
  }catch(e){}

  // 5) 현재 선택 대회 갱신
  try{
    const remainTier = (tourneys||[]).filter(t=>t && t.type==='tier').map(t=>String(t.name||'').trim()).filter(Boolean);
    const remainFromTtM = (()=>{ const s=new Set(); (ttM||[]).forEach(m=>{ const n=String(m?.compName||m?.n||m?.t||'').trim(); if(n) s.add(n); }); return [...s]; })();
    const all = [...new Set([...remainTier, ...remainFromTtM])];
    _ttCurComp = all.length ? all[0] : '';
  }catch(e){ _ttCurComp=''; }

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
  if(!val){alert(tn.type==='tier'?'선수를 선택하세요.':'대학을 선택하세요.');return;}
  if(tn.groups[gi].univs.includes(val)){alert(tn.type==='tier'?'이미 추가된 선수입니다.':'이미 추가된 대학입니다.');return;}
  tn.groups[gi].univs.push(val);save();render();
}
function grpRemoveUniv(tnId,gi,ui){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  tn.groups[gi].univs.splice(ui,1);save();render();
}
/* ══════════════════════════════════════

/* ══════════════════════════════════════
   ⚙️ 설정 섹션 접힘 상태 영속 헬퍼
══════════════════════════════════════ */
function _cfgOpen(id){try{return !!(JSON.parse(localStorage.getItem('su_cfg_open')||'{}')[id]);}catch(e){return false;}}
function _cfgToggle(id,el){try{const o=JSON.parse(localStorage.getItem('su_cfg_open')||'{}');o[id]=el.open;localStorage.setItem('su_cfg_open',JSON.stringify(o));const sp=el.querySelector('summary .cfg-toggle-txt');if(sp)sp.textContent=el.open?'▴ 접기':'▾ 펼치기';}catch(e){}}
function _cfgD(id,title,extra){const isOpen=_cfgOpen(id);return `<details class="ssec" ${isOpen?'open':''} ontoggle="_cfgToggle('${id}',this)"${extra?' '+extra:''}><summary style="cursor:pointer;list-style:none;outline:none;display:flex;align-items:center;gap:6px;-webkit-appearance:none"><h4 style="margin:0;display:inline">${title}</h4><span class="cfg-toggle-txt" style="font-size:11px;color:var(--gray-l);font-weight:400">${isOpen?'▴ 접기':'▾ 펼치기'}</span></summary>`;}

/* ══════════════════════════════════════
   설정
══════════════════════════════════════ */
function rTierTourCfg(C,T){
  T.innerText='⚙️ 설정';
  if(!isLoggedIn || isSubAdmin){
    C.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px"><div style="font-size:48px">🔒</div><div style="font-size:18px;font-weight:800;color:var(--text)">총관리자 전용 페이지</div><div style="font-size:13px;color:var(--gray-l)">설정 탭은 총관리자만 이용할 수 있습니다.</div>'+(!isLoggedIn?'<button class="btn btn-b" onclick="om(\'loginModal\')">&#128273; 로그인</button>':'')+'</div>';
    return;
  }
  const typeOpts=[{v:'📢',l:'📢 일반 공지'},{v:'🔥',l:'🔥 중요'},{v:'⚠️',l:'⚠️ 경고/주의'},{v:'🎉',l:'🎉 이벤트'}];
  let h=`${_cfgD('notice','📢 공지 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">접속 시 팝업으로 표시됩니다. 활성화된 공지만 보여집니다.</div>
    <div id="notice-list-area" style="margin-bottom:16px">
    ${notices.length===0?`<div style="padding:18px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px;font-size:13px">등록된 공지 없음</div>`:
      notices.map((n,i)=>`<div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;background:${n.active?'var(--white)':'var(--surface)'};opacity:${n.active?1:0.6}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:18px">${n.type||'📢'}</span>
          <span style="font-weight:700;flex:1;font-size:13px">${n.title||'(제목 없음)'}</span>
          <span style="font-size:11px;color:var(--gray-l)">${n.date||''}</span>
          <button class="btn btn-xs" style="background:${n.active?'#f0fdf4':'#f1f5f9'};color:${n.active?'#16a34a':'#64748b'};border:1px solid ${n.active?'#86efac':'#cbd5e1'};min-width:52px"
            onclick="notices[${i}].active=!notices[${i}].active;save();render()">
            ${n.active?'✅ 활성':'⭕ 비활성'}</button>
          <button class="btn btn-r btn-xs" onclick="if(confirm('공지를 삭제할까요?')){notices.splice(${i},1);save();render()}">🗑️</button>
        </div>
        ${(n.body||'').length>120
          ? `<div id="notice-body-${i}" style="font-size:12px;color:var(--text2);white-space:pre-wrap;max-height:60px;overflow:hidden">${(n.body||'').slice(0,120)}...</div>
             <button onclick="(function(){const el=document.getElementById('notice-body-${i}');const btn=document.getElementById('notice-exp-${i}');const open=el.style.maxHeight!=='none';el.style.maxHeight=open?'none':'60px';el.textContent=open?notices[${i}].body:notices[${i}].body.slice(0,120)+'...';btn.textContent=open?'▲ 접기':'▼ 전체보기';})()" id="notice-exp-${i}" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;padding:2px 0;font-weight:600">▼ 전체보기</button>`
          : `<div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${n.body||''}</div>`
        }
      </div>`).join('')
    }
    </div>
    <div style="border:1.5px dashed var(--border2);border-radius:12px;padding:16px;background:var(--surface)">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">+ 새 공지 작성</div>
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <select id="new-notice-type" style="width:140px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
          ${typeOpts.map(o=>`<option value="${o.v}">${o.l}</option>`).join('')}
        </select>
        <input type="text" id="new-notice-title" placeholder="공지 제목" style="flex:1;min-width:180px">
      </div>
      <textarea id="new-notice-body" placeholder="공지 내용을 입력하세요..." style="width:100%;height:80px;resize:vertical;border:1px solid var(--border2);border-radius:8px;padding:8px 10px;font-size:13px;box-sizing:border-box"></textarea>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="new-notice-active" checked> 즉시 활성화
        </label>
        <button class="btn btn-b" style="margin-left:auto" onclick="
          const t=document.getElementById('new-notice-title').value.trim();
          const b=document.getElementById('new-notice-body').value.trim();
          const tp=document.getElementById('new-notice-type').value;
          const ac=document.getElementById('new-notice-active').checked;
          if(!t){alert('제목을 입력하세요');return;}
          notices.unshift({id:Date.now(),type:tp,title:t,body:b,active:ac,date:new Date().toLocaleDateString('ko-KR')});
          save();render();">📢 공지 등록</button>
      </div>
    </div>
  </details>
  ${(()=>{
    const seen={};const dupNames=[];
    players.forEach(p=>{if(seen[p.name])dupNames.push(p.name);else seen[p.name]=true;});
    const uniq=[...new Set(dupNames)];
    if(!uniq.length) return '';
    return `<div class="ssec" style="border:2px solid #fca5a5;background:#fff5f5">
      <h4 style="color:#dc2626">⚠️ 동명이인 감지 (${uniq.length}건)</h4>
      <div style="font-size:12px;color:#7f1d1d;margin-bottom:12px">중복 이름이 있으면 승패·기록이 뒤섞입니다. 한 명의 이름을 바꿔 구분하세요.</div>
      ${uniq.map(name=>{
        const dupes=players.map((p,i)=>({p,i})).filter(({p})=>p.name===name);
        return `<div style="background:var(--white);border:1px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-bottom:8px">
          <div style="font-weight:800;color:#dc2626;font-size:13px;margin-bottom:6px">👥 "${name}" — ${dupes.length}명 중복</div>
          ${dupes.map(({p,i})=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:11px;background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 7px;font-weight:700">${p.univ||'무소속'}</span>
            <span style="font-size:11px;color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}</span>
            <input type="text" id="dupfix-${i}" placeholder="새 이름..." style="flex:1;min-width:100px;padding:3px 7px;border-radius:5px;border:1px solid #fca5a5;font-size:12px">
            <button class="btn btn-xs" style="background:#dc2626;color:#fff;border-color:#dc2626" onclick="(function(){
              const inp=document.getElementById('dupfix-${i}');
              const nw=(inp?.value||'').trim();
              if(!nw){alert('새 이름을 입력하세요.');return;}
              if(players.find((x,xi)=>x.name===nw&&xi!==${i})){alert('이미 존재하는 이름입니다.');return;}
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
            })()">✅ 적용</button>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>`;
  })()}
  ${_cfgD('univ','🏛️ 대학 관리')}
    <div style="font-size:11px;color:var(--gray-l);margin:8px 0 10px">👁️ 숨김 처리된 대학은 비로그인 상태에서 현황판에 표시되지 않습니다.</div>`;
  univCfg.forEach((u,i)=>{
    const isHidden = !!u.hidden;
    const isDissolved = !!u.dissolved;
    h+=`<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px;flex-wrap:wrap;gap:4px">
      <div class="cdot" style="background:${u.color};opacity:${isHidden?0.4:1}"></div>
      <input type="text" value="${u.name}" style="flex:1;max-width:130px;opacity:${isHidden?0.5:1}" onblur="const oldName=univCfg[${i}].name;const v=this.value.trim();if(!v){this.value=oldName;return;}if(v!==oldName&&univCfg.some((x,xi)=>xi!==${i}&&x.name===v)){alert('이미 추가된 대학명입니다.');this.value=oldName;return;}if(v!==oldName){renameUnivAcrossData(oldName,v);univCfg[${i}].name=v;save();render();}">
      ${isDissolved?`<span style="font-size:10px;background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;border-radius:5px;padding:1px 6px;font-weight:700">🏚️ 해체 ${u.dissolvedDate||''}</span>`:''}
      <input type="color" value="${u.color}" style="width:36px;height:30px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)" title="대학 색상" onchange="univCfg[${i}].color=this.value;this.previousElementSibling.previousElementSibling${isDissolved?'.previousElementSibling':''}.style.background=this.value;save();if(typeof renderBoard==='function')renderBoard()">
      ${isDissolved
        ? `<button class="btn btn-xs" style="background:#f0fdf4;color:#16a34a;border:1px solid #86efac" onclick="univCfg[${i}].dissolved=false;univCfg[${i}].hidden=false;delete univCfg[${i}].dissolvedDate;saveCfg();render()">🔄 복구</button>`
        : `<button class="btn btn-xs" style="background:${isHidden?'#fef2f2':'#f0fdf4'};color:${isHidden?'#dc2626':'#16a34a'};border:1px solid ${isHidden?'#fca5a5':'#86efac'};min-width:58px"
            onclick="univCfg[${i}].hidden=!univCfg[${i}].hidden;saveCfg();render()">
            ${isHidden?'👁️ 숨김':'✅ 표시'}</button>
          <button class="btn btn-xs" style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa" onclick="openDissolveModal(${i})">🏚️ 해체</button>`
      }
      <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
    </div>`;
  });
  h+=`<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input type="text" id="nu-n" placeholder="새 대학명" style="width:150px">
    <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
    <button class="btn btn-b" onclick="addUniv()">+ 대학 추가</button>
  </div></details>
  ${_cfgD('maps','🗺️ 맵 관리')}<div id="map-list">`;
  maps.forEach((m,i)=>{
    h+=`<div class="srow">
      <span style="font-size:14px">📍</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
    </div>`;
  });
  h+=`</div><div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="새 맵 이름" style="width:200px" onkeydown="if(event.key==='Enter')addMap()">
    <button class="btn btn-b" onclick="addMap()">+ 맵 추가</button>
  </div></details>
  ${_cfgD('mAlias','⚡ 맵 약자 관리 <span style="font-size:11px;font-weight:400;color:var(--gray-l)">붙여넣기 입력 시 자동 변환</span>')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
      약자를 입력하면 경기 결과 붙여넣기 시 자동으로 전체 맵 이름으로 변환됩니다.<br>
      <span style="color:var(--blue);font-weight:600">예:</span> <code style="background:var(--surface);padding:1px 6px;border-radius:4px">녹 → 녹아웃</code>, <code style="background:var(--surface);padding:1px 6px;border-radius:4px">폴 → 폴리포이드</code>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">📦 기본 내장 약자 <span style="font-weight:400;color:var(--gray-l);font-size:10px">(✕ 클릭 시 비활성화)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.entries(PASTE_MAP_ALIAS_DEFAULT).filter(([k,v])=>k!==v).map(([k,v])=>{
          const disabled=(userMapAlias||{}).hasOwnProperty(k+'__disabled');
          return disabled
            ? `<span style="display:inline-flex;align-items:center;gap:3px;background:#f1f5f9;border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px;opacity:.5;text-decoration:line-through"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="restoreDefaultMapAlias('${encodeURIComponent(k)}')" style="background:none;border:none;cursor:pointer;color:#16a34a;font-size:10px;padding:0 2px;line-height:1;text-decoration:none" title="복원">↩</button></span>`
            : `<span style="display:inline-flex;align-items:center;gap:3px;background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="delDefaultMapAlias('${encodeURIComponent(k)}','${encodeURIComponent(v)}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0 2px;line-height:1" title="비활성화">✕</button></span>`;
        }).join('')}
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🔧 사용자 정의 약자</div>
    <div id="alias-list" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="alias-key" placeholder="약자 (예: 녹)" style="width:90px" maxlength="10" onkeydown="if(event.key==='Enter')addMapAlias()">
      <span style="color:var(--gray-l)">→</span>
      <input type="text" id="alias-val" list="alias-val-list" placeholder="맵 이름 입력..." autocomplete="off" style="width:180px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px" onkeydown="if(event.key==='Enter')addMapAlias()">
      <datalist id="alias-val-list">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b" onclick="addMapAlias()">+ 약자 추가</button>
    </div>
    <div id="alias-msg" style="font-size:12px;margin-top:6px;min-height:16px"></div>
  </details>
  ${_cfgD('si','🏷️ 스트리머 상태 아이콘 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">이름 우측에 표시될 상태 아이콘을 스트리머별로 지정합니다. 현황판·순위표·이미지 저장 모두 반영됩니다.</div>
    <!-- 커스텀 아이콘 추가 (URL/링크) -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🔗 커스텀 아이콘 추가 (URL · 이모지)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input type="text" id="si-url" placeholder="이미지 URL 또는 이모지 입력" style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="text" id="si-label" placeholder="이름 (선택)" style="width:110px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <button class="btn btn-b btn-sm" onclick="var e=document.getElementById('si-url').value.trim(),l=document.getElementById('si-label').value.trim();if(!e){alert('URL 또는 이모지를 입력하세요.');return;}addCustomStatusIcon(l||'커스텀',e);document.getElementById('si-url').value='';document.getElementById('si-label').value='';render()">+ 추가</button>
      </div>
      ${_customStatusIcons.length?`<div style="display:flex;flex-wrap:wrap;gap:6px">${_customStatusIcons.map((c,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:7px;background:var(--white);border:1.5px solid var(--blue);font-size:14px"><span style="display:inline-flex;align-items:center">${_siRender(c.emoji,'20px')||c.emoji}</span><span style="font-size:11px;color:var(--gray-l);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.label||''}</span><button onclick="removeCustomStatusIcon(${i});render()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0;line-height:1;margin-left:2px" title="삭제">×</button></span>`).join('')}</div>`
      :'<div style="font-size:11px;color:var(--gray-l)">추가된 커스텀 아이콘 없음</div>'}
    </div>
    <!-- 기본 아이콘 목록 -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🎭 기본 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STATUS_ICON_DEFS).filter(([id])=>id!=='none'&&!id.startsWith('_c')).map(([id,d])=>`<span style="padding:4px 10px;border-radius:7px;background:var(--white);border:1px solid var(--border);font-size:16px" title="${d.label}">${_siRender(d.emoji,'20px')||d.emoji}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">스트리머 정보 수정 또는 현황판 클릭 팝업에서 아이콘을 설정하세요.</div>
    </div>
    <!-- 스트리머별 아이콘 지정 -->
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">스트리머별 상태 아이콘 지정</div>
    <div id="cfg-si-list" style="max-height:320px;overflow-y:auto;border:1px solid var(--border);border-radius:8px">
      <div style="padding:16px;text-align:center;color:var(--gray-l);font-size:12px">로딩 중...</div>
    </div>
    <button class="btn btn-r btn-sm" style="margin-top:10px" onclick="if(confirm('모든 상태 아이콘을 초기화할까요?')){playerStatusIcons={};playerStatusExpiry={};if(typeof _iconPersistState==='function')_iconPersistState();render();}">전체 초기화</button>
  </details>
  ${_cfgD('tier','🎭 티어 관리')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${TIERS.map((t,i)=>`<div style="text-align:center;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:4px">
        ${getTierBadge(t)}
        <div style="font-size:10px;color:var(--gray-l)">${i+1}순위</div>
        ${!['G','K','JA','J','S','0티어'].includes(t)?`<button class="btn btn-r btn-xs" onclick="delTier('${t}')">🗑️ 삭제</button>`:''}
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="nt-name" placeholder="티어 이름 (예: 9티어)" style="width:160px">
      <button class="btn btn-b" onclick="addTier()">+ 티어 추가</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 기본 티어(G/K/JA/J/S/0티어)는 삭제할 수 없습니다.</div>
  </details>
  ${_cfgD('acct','👤 관리자 계정 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:4px">• <b>총관리자</b>: 모든 기능 + 설정 접근 가능</div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">• <b>부관리자</b>: 경기 기록 입력만 가능 (설정/회원관리 불가)</div>
    <div style="margin-bottom:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">등록된 계정 (<span id="adm-count">-</span>명)</div>
      <div id="adm-list"></div>
      <button class="btn btn-r btn-xs" style="margin-top:10px" onclick="clearAllAdmins()">⚠️ 전체 초기화 (기본값 리셋)</button>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">+ 새 계정 추가</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="adm-id" placeholder="아이디" style="width:140px" autocomplete="off">
      <input type="password" id="adm-pw" placeholder="비밀번호 (8자 이상)" style="width:150px" autocomplete="new-password">
      <select id="adm-role" style="border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
        <option value="admin">👑 총관리자</option>
        <option value="sub-admin">🔰 부관리자</option>
      </select>
      <button class="btn btn-p" onclick="addAdminAccount()">+ 추가</button>
    </div>
    <div id="adm-msg" style="font-size:12px;min-height:18px"></div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">💾 로컬 저장소 사용량</h4>
      <button id="cfg-storage-toggle2" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-storage-wrap2');const btn=document.getElementById('cfg-storage-toggle2');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';renderStorageInfo();}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-storage-wrap2" style="display:none">
      <div id="cfg-storage-info"><div style="color:var(--gray-l);font-size:12px">계산 중...</div></div>
      <button class="btn btn-w btn-sm" style="margin-top:8px" onclick="renderStorageInfo()">🔄 새로고침</button>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;flex-wrap:wrap">
      <h4 style="margin:0">☁️ 동기화 관리</h4>
      <button class="btn btn-w btn-xs" onclick="openUnifiedSyncSettings()">설정탭에서 열기 ↗</button>
    </div>
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:6px">동기화 설정은 한 곳에서만 관리됩니다.</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        실제 데이터 원본은 GitHub에 저장되고, 보조 신호 채널은 다른 기기에 새 데이터 알림을 더 빠르게 전달합니다.<br>
        비밀번호, 토큰, 누락 월 다시받기, 전체 다시 동기화는 설정탭 <b>☁️ GitHub 동기화</b> 섹션에서만 관리합니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="openUnifiedSyncSettings()">☁️ 동기화 설정 열기</button>
        <button class="btn btn-w btn-sm" onclick="(async()=>{try{if(typeof window.fbForceSync==='function') await window.fbForceSync();}catch(e){console.error(e);}})()">🔄 지금 동기화</button>
      </div>
    </div>
  </div>
  ${_cfgD('season','🏆 시즌 관리','id="cfg-season-sec"')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">시즌을 정의하면 대전기록·통계 등 모든 탭에서 시즌 단위로 필터링할 수 있습니다.</p>
    <div id="cfg-season-list" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시즌 이름</label>
        <input type="text" id="cfg-season-name" placeholder="예: 2025 스프링" style="width:140px;font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시작일</label>
        <input type="date" id="cfg-season-from" style="font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">종료일</label>
        <input type="date" id="cfg-season-to" style="font-size:12px">
      </div>
      <button class="btn btn-b btn-sm" onclick="addSeason()">+ 시즌 추가</button>
    </div>
  </details>
    <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">📅 날짜 일괄 변경</h4>
      <button id="cfg-bulk-date-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-date-body');const btn=document.getElementById('cfg-bulk-date-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-date-body" style="display:none">
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">변경 전 날짜</label>
        <input type="date" id="bulk-date-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경 후</label>
        <input type="date" id="bulk-date-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-date-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeDate()">📅 날짜 일괄 변경</button>
      <span id="bulk-date-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🗺️ 맵 이름 일괄 교체</h4>
      <button id="cfg-bulk-map-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-map-body');const btn=document.getElementById('cfg-bulk-map-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-map-body" style="display:none">
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">교체 전</label>
        <input type="text" id="bulk-map-from" placeholder="예: 투혼II" style="font-size:12px;width:120px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 교체 후</label>
        <input type="text" id="bulk-map-to" placeholder="예: 투혼" style="font-size:12px;width:120px">
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeMap()">🗺️ 맵 일괄 교체</button>
      <span id="bulk-map-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🎖️ 선수 일괄 티어 변경</h4>
      <button id="cfg-bulk-tier-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-tier-body');const btn=document.getElementById('cfg-bulk-tier-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-tier-body" style="display:none">
    <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">현재 티어</label>
        <select id="bulk-tier-from" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 (상관없음)</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경할 티어</label>
        <select id="bulk-tier-to" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">선택</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">대상 대학</label>
        <select id="bulk-tier-univ" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 대학</option>
          ${getAllUnivs().map(u=>`<option value="${u.name}">${u.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeTier()">🎖️ 티어 일괄 변경</button>
      <span id="bulk-tier-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🗑️ 날짜 범위 일괄 삭제</h4>
      <button id="cfg-bulk-del-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-del-body');const btn=document.getElementById('cfg-bulk-del-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-del-body" style="display:none">
    <div style="padding:14px;background:#fff5f5;border:1px solid #fca5a5;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">시작일</label>
        <input type="date" id="bulk-del-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">~</label>
        <input type="date" id="bulk-del-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-del-chk-${m}" style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-r btn-sm" onclick="bulkDeleteByDate()">🗑️ 범위 삭제 (되돌릴 수 없음)</button>
      <span id="bulk-del-result" style="font-size:12px;margin-left:8px;color:var(--red)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🔄 세트제 → 게임수 합산 일괄 변환</h4>
      <button id="cfg-bulk-conv-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-conv-body');const btn=document.getElementById('cfg-bulk-conv-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-conv-body" style="display:none">
    <div style="padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:10px">
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">sets 배열의 게임 수 합산으로 sa/sb를 재계산합니다.<br>세트 수와 게임 수가 다른 경기만 변환됩니다.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-conv-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkConvertToGameScore()">🔄 게임수 합산으로 변환</button>
      <span id="bulk-conv-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🖼️ 현황판 라벨 배경 이미지별 설정</h4>
      <button id="cfg-board-bg-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-board-bg-body');const btn=document.getElementById('cfg-board-bg-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-board-bg-body" style="display:none">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">각 대학 라벨에 배경 이미지를 설정할 수 있습니다. 이미지 위치와 크기도 조절 가능합니다.</p>
    <div style="margin-bottom:14px;padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
      <div style="font-size:12px;font-weight:700;color:#0369a1;margin-bottom:10px">📋 일괄 설정 (전체 대학)</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">이미지 URL:</label>
        <input type="text" id="bulk-bg-img-url" placeholder="https://..." style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">위치:</label>
        <select id="bulk-bg-img-pos" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="top left">좌상단</option>
          <option value="top center">중상단</option>
          <option value="top right">우상단</option>
          <option value="center left">좌중앙</option>
          <option value="center center" selected>중앙</option>
          <option value="center right">우중앙</option>
          <option value="bottom left">좌하단</option>
          <option value="bottom center">중하단</option>
          <option value="bottom right">우하단</option>
        </select>
        <label style="font-size:12px;font-weight:600;color:var(--text2)">크기:</label>
        <select id="bulk-bg-img-size" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cover" selected>채우기 (cover)</option>
          <option value="contain">맞춤 (contain)</option>
          <option value="fill">늘리기 (fill)</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px">
        <button class="btn btn-b btn-sm" onclick="bulkSetBoardBgImg()">📋 전체 적용</button>
        <button class="btn btn-r btn-sm" onclick="bulkClearBoardBgImg()">🗑️ 전체 삭제</button>
      </div>
    </div>
    <div id="cfg-board-bg-list" style="max-height:400px;overflow-y:auto"></div>
    </div>
  </div>
  ${_cfgD('sync','🔄 데이터 동기화')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">경기 기록을 각 탭 기록 및 스트리머 최근 경기에 반영합니다.</div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const n=syncAllHistory?syncAllHistory():0;
          alert('✅ 티어대회 기록 동기화 + '+n+'건 스트리머 반영 완료');render();">🔄 전체 동기화 (기록탭 + 스트리머)</button>
        <span style="font-size:11px;color:var(--gray-l)">티어대회 기록탭·대전기록 반영 + 스트리머 최근 경기 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const before=ttM.length;save();render();
          alert('✅ 티어대회 기록 동기화 완료\\n추가된 기록: '+(ttM.length-before)+'건');">🎯 티어대회 기록 동기화</button>
        <span style="font-size:11px;color:var(--gray-l)">조별리그·토너먼트 경기를 기록탭·대전기록에 반영 (누락 시 사용)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="syncAllHistoryBtn()">📋 스트리머 최근 경기 반영</button>
        <span style="font-size:11px;color:var(--gray-l)">모든 경기를 스트리머 상세의 최근 경기에 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-w btn-sm" onclick="
          const seen=new Set();let removed=0;
          ttM=ttM.filter(m=>{if(!m._id)return true;if(seen.has(m._id)){removed++;return false;}seen.add(m._id);return true;});
          save();render();alert('✅ ttM 중복 제거 완료: '+removed+'건 삭제');
        ">🗑️ 중복 경기 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">같은 _id로 이중 등록된 티어대회 경기 제거</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-y btn-sm" onclick="deduplicatePlayerHistory()">🧹 중복 기록 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">스트리머 history에서 중복 항목만 제거 (승패/ELO 재계산)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-r btn-sm" onclick="rebuildAllPlayerHistory()">🔄 전체 경기 기록 복구</button>
        <span style="font-size:11px;color:var(--gray-l)">대전 데이터에서 스트리머 history 재구성 (기존 history 초기화됨)</span>
      </div>
    </div>
  </details>
  ${_cfgD('b2layout','📐 이미지탭 레이아웃')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭(프로필 탭)의 좌우 비율과 높이를 설정합니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">좌측(이미지) 너비</label>
          <span id="cfg-b2-left-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">55%</span>
        </div>
        <input type="range" id="cfg-b2-left-size" min="30" max="70" step="1" value="55" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-left-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-right-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-right-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">우측(목록) 너비</label>
          <span id="cfg-b2-right-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">45%</span>
        </div>
        <input type="range" id="cfg-b2-right-size" min="30" max="70" step="1" value="45" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-right-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-left-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-left-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">PC 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-pc-height" value="600" min="400" max="900" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">태블릿 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-tablet-height" value="400" min="300" max="700" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">모바일 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-mobile-height" value="320" min="200" max="600" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:4px">
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:700">
            <input type="checkbox" id="cfg-b2-auto-resize" checked style="width:15px;height:15px"> 자동 크기 조절
          </label>
        </div>
      </div>
      <button class="btn btn-b" onclick="saveB2LayoutSettings()" style="align-self:flex-start">💾 레이아웃 저장</button>
    </div>
  </details>
  ${_cfgD('imgsettings','🖼️ 이미지탭 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭 ⚙️ 버튼과 동일한 설정입니다. 크기·밝기·배치·위치를 조절하면 즉시 반영됩니다.</div>
    <div id="cfg-b2-img-settings-wrap" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px;padding:0 2px">※ 스트리머 상세 모달 이미지 설정은 아래 별도 항목에서 설정</div>
  </details>
  ${_cfgD('imgmodalsettings','🖼️ 스트리머 상세 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">스트리머 상세 모달의 이미지 크기·밝기를 설정합니다.</div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">모바일/태블릿/PC 크기를 따로 저장합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:600">
        <input type="checkbox" id="cfg-img-fill" style="width:14px;height:14px"> 이미지 채우기 (cover) — 해제 시 맞춤 (contain)
      </label>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 크기</label>
          <span id="cfg-img-scale-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.5x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 밝기</label>
          <span id="cfg-img-brightness-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-brightness" min="0.3" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-brightness-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.3x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">모바일 크기</label>
          <span id="cfg-img-scale-left-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-left" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-left-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">태블릿 크기</label>
          <span id="cfg-img-scale-tablet-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-tablet" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-tablet-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">PC 크기</label>
          <span id="cfg-img-scale-right-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-right" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-right-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <button class="btn btn-b" onclick="saveImageSettings()" style="align-self:flex-start">💾 설정 저장</button>
    </div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🎨 스트리머 상세 스타일 설정</h4>
      <button id="cfg-pd-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-pd-body');const btn=document.getElementById('cfg-pd-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';_renderCfgPdSection();}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-pd-body" style="display:none"></div>
  </div>
  ${_cfgD('fab','🔘 FAB 버튼 탭 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">하단 FAB 버튼 클릭 시 이동할 탭을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">캘린더:</label>
        <select id="cfg-fab-cal" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cal">📅 캘린더</option>
          <option value="stats">📊 통계</option>
          <option value="roulette">🎰 룰렛</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">대회:</label>
        <select id="cfg-fab-comp" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="comp">🏆 대회</option>
          <option value="pro">🏅 프로리그</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">대학대전:</label>
        <select id="cfg-fab-univm" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="univm">🏫 대학대전</option>
          <option value="ck">🏆 CK</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">개인전:</label>
        <select id="cfg-fab-ind" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="ind">👤 개인전</option>
          <option value="gj">⚔️ 끝장전</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">프로리그:</label>
        <select id="cfg-fab-pro" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="pro">🏅 프로리그</option>
          <option value="comp">🏆 대회</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">FAB 버튼 표시 설정</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="cfg-fab-hide-mobile" onchange="saveFabVisibilitySettings()">
          모바일에서 숨기기
        </label>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="cfg-fab-hide-pc" onchange="saveFabVisibilitySettings()">
          PC에서 숨기기
        </label>
      </div>
    </div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🎨 구현황판 카드 배경/라벨 밝기 조절</h4>
      <button id="cfg-old-bright-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-old-bright-body');const btn=document.getElementById('cfg-old-bright-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-old-bright-body" style="display:none">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">구현황판 카드의 배경과 라벨 밝기를 조절합니다. (구현황판 툴바에서도 조절 가능)</p>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">배경 밝기:</label>
        <input type="range" id="cfg-b2-bg-alpha" min="0" max="30" value="9" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-bg-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-bg-alpha-val">9%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">라벨 밝기:</label>
        <input type="range" id="cfg-b2-label-alpha" min="0" max="40" value="16" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-label-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-label-alpha-val">16%</span>
      </div>
      <button class="btn btn-b" onclick="saveOldDashboardBrightness()">💾 저장</button>
    </div>
    </div>
  </div>
  `;

  // 관리자 목록 + 맵 약자 목록 렌더링
  setTimeout(()=>{
    if(typeof _renderCfgSiList==='function') _renderCfgSiList();
    renderStorageInfo();
    renderSeasonList();
    const el=document.getElementById('adm-count');
    const listEl=document.getElementById('adm-list');
    const accounts=getAdminAccounts();
    if(el)el.textContent=accounts.length;
    if(listEl){
      if(!accounts.length){listEl.innerHTML='<div style="font-size:12px;color:var(--gray-l)">등록된 계정 없음</div>';return;}
      listEl.innerHTML=accounts.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:13px;font-weight:600">${a.label||'(이름없음)'}</span>
          <span style="padding:2px 9px;border-radius:5px;font-size:10px;font-weight:700;${a.role==='sub-admin'?'background:#fef3c7;color:#92400e;border:1px solid #fde68a':'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe'}">${a.role==='sub-admin'?'🔰 부관리자':'👑 총관리자'}</span>
          <button class="btn btn-r btn-xs" onclick="deleteAdminAccount(${i})">🗑️ 삭제</button>
        </div>`).join('');
    }
    // 현황판 배경 설정 렌더링
    const bgListEl=document.getElementById('cfg-board-bg-list');
    if(bgListEl){
      bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div class="cdot" style="background:${u.color}"></div>
          <span style="flex:1;font-weight:700;font-size:13px">${u.name}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
          ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
        </div>
        ${u.bgImg?`<div style="margin-top:8px">
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
          <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
            <option value="top left" ${u.bgImgPos==='top left'?' selected':''}>좌상단</option>
            <option value="top center" ${u.bgImgPos==='top center'?' selected':''}>중상단</option>
            <option value="top right" ${u.bgImgPos==='top right'?' selected':''}>우상단</option>
            <option value="center left" ${u.bgImgPos==='center left'?' selected':''}>좌중앙</option>
            <option value="center center" ${u.bgImgPos==='center center'?' selected':''}>중앙</option>
            <option value="center right" ${u.bgImgPos==='center right'?' selected':''}>우중앙</option>
            <option value="bottom left" ${u.bgImgPos==='bottom left'?' selected':''}>좌하단</option>
            <option value="bottom center" ${u.bgImgPos==='bottom center'?' selected':''}>중하단</option>
            <option value="bottom right" ${u.bgImgPos==='bottom right'?' selected':''}>우하단</option>
          </select>
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
          <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
            <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
            <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
            <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
          </select>
        </div>`:''}
      </div>`).join('');
    }
    // 이미지탭 레이아웃 설정 초기화
    const b2Layout=JSON.parse(localStorage.getItem('su_b2_layout')||'{}');
    const _b2ls=b2Layout.leftSize||55, _b2rs=b2Layout.rightSize||45;
    const _b2lEl=document.getElementById('cfg-b2-left-size'), _b2rEl=document.getElementById('cfg-b2-right-size');
    if(_b2lEl){_b2lEl.value=_b2ls;const v=document.getElementById('cfg-b2-left-size-val');if(v)v.textContent=_b2ls+'%';}
    if(_b2rEl){_b2rEl.value=_b2rs;const v=document.getElementById('cfg-b2-right-size-val');if(v)v.textContent=_b2rs+'%';}
    if(document.getElementById('cfg-b2-pc-height'))document.getElementById('cfg-b2-pc-height').value=b2Layout.pcHeight||600;
    if(document.getElementById('cfg-b2-mobile-height'))document.getElementById('cfg-b2-mobile-height').value=b2Layout.mobileHeight||320;
    if(document.getElementById('cfg-b2-tablet-height'))document.getElementById('cfg-b2-tablet-height').value=b2Layout.tabletHeight||400;
    if(document.getElementById('cfg-b2-auto-resize'))document.getElementById('cfg-b2-auto-resize').checked=b2Layout.autoResize!==false;
    // 이미지탭 이미지 설정 (board2 전역 설정) 렌더링
    const _cfgB2ImgWrap=document.getElementById('cfg-b2-img-settings-wrap');
    if(_cfgB2ImgWrap&&typeof _b2BuildImageControlGroup==='function'){
      _cfgB2ImgWrap.innerHTML=`
        <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px">이미지 1 (기본 이미지)</div>
        ${_b2BuildImageControlGroup('','primary','이미지 1',true)}
        <div style="font-weight:700;font-size:12px;color:var(--text2);margin:14px 0 10px">이미지 2 (두번째 이미지)</div>
        ${_b2BuildImageControlGroup('','secondary','이미지 2',true)}
      `;
    }
    // 스트리머 상세 이미지 설정 초기화
    const imgSettings = (typeof suReadImgSettings==='function')
      ? suReadImgSettings()
      : (JSON.parse(localStorage.getItem('su_img_settings')||'{}'));
    if(document.getElementById('cfg-img-fill'))document.getElementById('cfg-img-fill').checked=imgSettings.fill||false;
    if(document.getElementById('cfg-img-scale')){document.getElementById('cfg-img-scale').value=imgSettings.scale||1;document.getElementById('cfg-img-scale-val').textContent=(imgSettings.scale||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-brightness')){document.getElementById('cfg-img-brightness').value=imgSettings.brightness||1;document.getElementById('cfg-img-brightness-val').textContent=(imgSettings.brightness||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-left')){document.getElementById('cfg-img-scale-left').value=imgSettings.scaleMb||1;document.getElementById('cfg-img-scale-left-val').textContent=(imgSettings.scaleMb||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-tablet')){document.getElementById('cfg-img-scale-tablet').value=imgSettings.scaleTb||1;document.getElementById('cfg-img-scale-tablet-val').textContent=(imgSettings.scaleTb||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-right')){document.getElementById('cfg-img-scale-right').value=imgSettings.scalePc||1;document.getElementById('cfg-img-scale-right-val').textContent=(imgSettings.scalePc||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-random'))document.getElementById('cfg-img-random').checked=imgSettings.randomRotation||false;
    if(document.getElementById('cfg-img-interval'))document.getElementById('cfg-img-interval').value=imgSettings.interval||5;
    // 구현황판 밝기 설정 초기화
    const b2LabelAlpha=parseInt(localStorage.getItem('su_b2la')||'16');
    const b2BgAlpha=parseInt(localStorage.getItem('su_b2ba')||'9');
    if(document.getElementById('cfg-b2-label-alpha')){document.getElementById('cfg-b2-label-alpha').value=b2LabelAlpha;document.getElementById('cfg-b2-label-alpha-val').textContent=b2LabelAlpha+'%';}
    if(document.getElementById('cfg-b2-bg-alpha')){document.getElementById('cfg-b2-bg-alpha').value=b2BgAlpha;document.getElementById('cfg-b2-bg-alpha-val').textContent=b2BgAlpha+'%';}
    // 레이아웃 자동 저장 이벤트 리스너
    ['cfg-b2-left-size','cfg-b2-right-size','cfg-b2-pc-height','cfg-b2-mobile-height','cfg-b2-tablet-height'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveB2LayoutSettings);
    });
    const autoResizeEl=document.getElementById('cfg-b2-auto-resize');
    if(autoResizeEl)autoResizeEl.addEventListener('change',saveB2LayoutSettings);
    // 스트리머 상세 이미지 설정 자동 저장 이벤트 리스너
    ['cfg-img-fill','cfg-img-scale','cfg-img-brightness','cfg-img-scale-left','cfg-img-scale-tablet','cfg-img-scale-right','cfg-img-random','cfg-img-interval'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveImageSettings);
    });
  },50);
  C.innerHTML=h;
  setTimeout(_refreshAliasList, 10);
  setTimeout(function(){
    try{ if(typeof window.initFabTabSettings==='function') window.initFabTabSettings(); }catch(e){}
    try{ if(typeof window.initFabVisibilitySettings==='function') window.initFabVisibilitySettings(); }catch(e){}
  }, 50);
} // end first rCfg

/* ══════════════════════════════════════
   (버그픽스) 설정탭 버튼 누락 함수들
   - settings.js / tier-tour.js UI에서 호출하지만 정의가 없던 함수들을 추가
   - 안전한 범위에서만 일괄 수정/삭제 수행
══════════════════════════════════════ */
function _bulkArrMapAll(){
  // 존재하는 배열만 포함
  const m = { mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM, ind: (typeof indM!=='undefined'?indM:[]), gj:(typeof gjM!=='undefined'?gjM:[]), comp:comps };
  return m;
}

// 티어대회(토너먼트 탭)에서 경기 결과 붙여넣기(자동인식) → "토너먼트 기록"으로 저장
// - 대진표 자동 생성/자동 반영은 하지 않음(사용자가 슬롯/승자 수동 입력)
function openTierBktPasteModal(tnId){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  const tn=(tourneys||[]).find(t=>t && t.id===tnId) || null;
  if(tn && tn.name) _ttCurComp = tn.name;
  try{ window._pasteFromTierBkt = true; }catch(e){}
  try{ window._pasteFromHistExt = false; }catch(e){}
  try{
    if(typeof openTTPasteModal==='function') openTTPasteModal();
  }catch(e){}
  // 대회명 자동 채우기
  setTimeout(()=>{
    try{
      const inp=document.getElementById('paste-comp-name');
      if(inp && tn && tn.name) inp.value = tn.name;
    }catch(e){}
  }, 40);
}

// (추가) 설정탭 전용: "스트리머별 상태 아이콘 지정"만 보여주는 목록
function _renderCfgSiAssignList(){
  const el=document.getElementById('cfg-si-assign-list');
  if(!el) return;
  if(!players.length){
    el.innerHTML='<div style="padding:20px;text-align:center;color:var(--gray-l)">등록된 선수 없음</div>';
    return;
  }
  const q = String(window._cfgSiAssignQ || '').trim().toLowerCase();
  const iconOptCache = Object.entries(STATUS_ICON_DEFS);
  const match = (p)=>{
    if(!q) return true;
    const hay = `${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.memo||'')}`.toLowerCase();
    return hay.includes(q);
  };
  const list = [...players].filter(match).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  el.innerHTML = list.map(p=>{
    const cur = playerStatusIcons[p.name] || '';
    const pN = p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const encN=encodeURIComponent(p.name);
    const opts = iconOptCache.map(([id,d])=>`<option value="${id}"${(!cur&&id==='none')||(cur&&(cur===id||cur===d.emoji)&&id!=='none')?' selected':''}>${!_siIsImg(d.emoji)&&d.emoji?d.emoji+' ':''}${d.label}</option>`).join('');
    const clrBtn = cur ? `<button class="btn btn-w btn-xs" style="border-color:var(--border2);color:#dc2626" onclick="setStatusIcon('${pN}','none');_cfgRefreshSiAssignRow('${pN}')">×</button>` : '';
    return `<div style="border-bottom:1px solid var(--border);padding:8px 10px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="flex-shrink:0">${getPlayerPhotoHTML(p.name,'30px')}</span>
        <span style="font-weight:800;flex:1;min-width:140px">${p.name}<span style="font-size:10px;color:var(--gray-l);margin-left:6px">${p.univ||''}·${p.tier||''}</span></span>
        <span id="cfg-si-assign-prev-${encN}" style="min-width:26px;text-align:center;display:inline-flex;align-items:center;justify-content:center">${cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):''}</span>
        <select onchange="setStatusIcon('${pN}',this.value);_cfgRefreshSiAssignRow('${pN}')" style="font-size:12px;padding:5px 8px;border:1px solid var(--border2);border-radius:10px;min-width:140px">${opts}</select>
        <span id="cfg-si-assign-clr-${encN}">${clrBtn}</span>
      </div>
    </div>`;
  }).join('') || '<div style="padding:18px;text-align:center;color:var(--gray-l);font-size:12px">검색 결과 없음</div>';
}
function _cfgRefreshSiAssignRow(name){
  const encN=encodeURIComponent(name);
  const cur=playerStatusIcons[name]||'';
  const prevEl=document.getElementById('cfg-si-assign-prev-'+encN);
  if(prevEl) prevEl.innerHTML=cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):'';
  const clrEl=document.getElementById('cfg-si-assign-clr-'+encN);
  if(clrEl){
    const pN=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    clrEl.innerHTML=cur?`<button class="btn btn-w btn-xs" style="border-color:var(--border2);color:#dc2626" onclick="setStatusIcon('${pN}','none');_cfgRefreshSiAssignRow('${pN}')">×</button>`:'';
  }
}
try{ window._renderCfgSiAssignList = _renderCfgSiAssignList; }catch(e){}

// ── (요청사항) 조편성 관리: 조별 경기 결과 일괄 입력(1줄=1게임) ──
// competition.js(대회/티어대회 조편성)에서 호출
window.openCompLeaguePasteModal = function(tnId, gi){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  const tn = (typeof _findTourneyById==='function' ? _findTourneyById(tnId) : null) || (typeof tourneys!=='undefined' ? tourneys.find(t=>t.id===tnId) : null);
  if(!tn || !tn.groups || !tn.groups[gi]) return;
  // 티어대회 조편성 관리용(선수 vs 선수)
  _grpPasteState = {mode:'comp-league', tnId, gi};
  window._grpPasteMode = true;

  // pasteModal 초기화 (openGrpPasteModal과 동일 패턴)
  const textarea  = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (textarea)  textarea.value  = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn)  { applyBtn.style.display = 'none'; applyBtn.textContent = '✅ 조에 저장'; }
  if (badge)     badge.style.display = 'none';
  if (pendWarn)  pendWarn.style.display = 'none';
  window._pasteResults = null;
  window._pasteErrors  = null;

  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

  const modeSel = document.getElementById('paste-mode');
  if(modeSel){ modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if(modeLabel) modeLabel.style.display='none';
  const hintEl = document.getElementById('paste-mode-hint');
  if(hintEl){
    const GL='ABCDEFGHIJ';
    hintEl.innerHTML = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px">
      <span style="color:#1d4ed8;font-weight:800">🏆 조별리그 일괄 입력</span>
      — <b>${tn.name}</b> · <b>GROUP ${GL[gi]||gi}조</b><br>
      <span style="font-size:11px;color:#6b7280">형식: 날짜 승자 패자 [맵] (여러 줄)</span>
    </div>`;
  }
  const compWrap = document.getElementById('paste-comp-wrap');
  if(compWrap){ compWrap.style.display='none'; compWrap.innerHTML=''; }
  const _pasteDetails=document.querySelector('#pasteModal details');
  if(_pasteDetails) _pasteDetails.style.display='none';

  // 세트/게임 모드 선택은 의미 없으니 숨김
  const _matchModeDiv=document.getElementById('paste-match-mode-game')?.closest('div[style]');
  if(_matchModeDiv) _matchModeDiv.style.display='none';

  const _pTitle=document.querySelector('#pasteModal .mtitle');
  if(_pTitle) _pTitle.textContent='📋 결과 붙여넣기';
  om('pasteModal');
};
function _bulkSelected(keys, prefix, defaultChecked=true){
  return keys.filter(k=>{
    const el=document.getElementById(prefix+k);
    return el ? !!el.checked : defaultChecked;
  });
}
function bulkChangeDate(){
  // (QA 드라이런/호환) 일부 환경은 isLoggedIn이 top-level let 으로 선언되어 window.isLoggedIn과 분리됨
  // - 드라이런은 window.isLoggedIn을 조작하므로 둘 다 허용
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  const from=document.getElementById('bulk-date-from')?.value||'';
  const to=document.getElementById('bulk-date-to')?.value||'';
  if(!from||!to){ alert('변경 전/후 날짜를 입력하세요.'); return; }
  const keys=_bulkSelected(['mini','univm','ck','pro','tt','ind','gj','comp'],'bulk-date-chk-');
  if(!keys.length){ alert('대상을 선택하세요.'); return; }
  const arrMap=_bulkArrMapAll();
  let changed=0;
  keys.forEach(k=>{
    const arr=arrMap[k]||[];
    arr.forEach(m=>{ if(m && m.d===from){ m.d=to; changed++; } });
  });
  if(changed){ save(); render(); }
  const el=document.getElementById('bulk-date-result');
  if(el){ el.textContent = changed?`✅ ${changed}건 변경 완료!`:'변경할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
}
function bulkChangeMap(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li){ alert('로그인이 필요합니다.'); return; }
  const from=(document.getElementById('bulk-map-from')?.value||'').trim();
  const to=(document.getElementById('bulk-map-to')?.value||'').trim();
  if(!from||!to){ alert('교체 전/후 맵 이름을 입력하세요.'); return; }
  // (보강) 사용자가 '투혼 II' vs '투혼II' 같이 띄어쓰기 차이로 입력하는 경우가 많아서
  // - 비교는 "공백 제거 + 소문자"로 한 번 더 수행한다.
  const norm = (s)=>String(s||'').trim().toLowerCase().replace(/\s+/g,'');
  const fromN = norm(from);
  const arrMap=_bulkArrMapAll();
  const keys=Object.keys(arrMap); // 맵 교체는 전체 적용
  let changed=0;
  const rep=(obj)=>{
    if(!obj||typeof obj!=='object') return;
    if(typeof obj.map==='string'){
      const cur=obj.map.trim();
      if(cur===from || norm(cur)===fromN){ obj.map=to; changed++; }
    }
    // 세트/게임 내부도 체크
    (obj.sets||[]).forEach(st=>{
      if(typeof st.map==='string'){
        const cur=st.map.trim();
        if(cur===from || norm(cur)===fromN){ st.map=to; changed++; }
      }
      (st.games||[]).forEach(g=>{
        if(typeof g.map==='string'){
          const cur=g.map.trim();
          if(cur===from || norm(cur)===fromN){ g.map=to; changed++; }
        }
      });
    });
  };
  keys.forEach(k=>{ (arrMap[k]||[]).forEach(rep); });
  // 대회(tourneys) 내부의 games(map)도 교체
  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=> (grp.matches||[]).forEach(rep));
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(rep);
    (br.manualMatches||[]).forEach(rep);
  });
  // 맵 목록 자체도 교체(선택지 통일)
  try{
    if(Array.isArray(maps)){
      maps = maps.map(m=> ((String(m||'').trim()===from || norm(m)===fromN)?to:m));
    }
  }catch(e){}
  if(changed){ save(); render(); }
  const el=document.getElementById('bulk-map-result');
  if(el){ el.textContent = changed?`✅ ${changed}개 맵명 교체 완료!`:'교체할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
}
function bulkDeleteByDate(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  const from=document.getElementById('bulk-del-from')?.value||'';
  const to=document.getElementById('bulk-del-to')?.value||'';
  if(!from||!to){ alert('시작/종료 날짜를 입력하세요.'); return; }
  if(!confirm(`⚠️ ${from} ~ ${to} 범위의 기록을 삭제합니다. 되돌릴 수 없습니다.\n계속할까요?`)) return;
  const keys=_bulkSelected(['mini','univm','ck','pro','tt','ind','gj','comp'],'bulk-del-chk-', false);
  // bulk-del 체크박스는 기본 미체크라서, element 없으면 false가 자연스러움
  const arrMap=_bulkArrMapAll();
  let removed=0;
  const inRange=(d)=> d && d>=from && d<=to;
  keys.forEach(k=>{
    const arr=arrMap[k]||[];
    const before=arr.length;
    const next=arr.filter(m=> !(m && inRange(m.d)) );
    removed += (before-next.length);
    arrMap[k].length = 0;
    arrMap[k].push(...next);
  });
  if(removed){ save(); render(); }
  const el=document.getElementById('bulk-del-result');
  if(el){ el.textContent = removed?`✅ ${removed}건 삭제 완료!`:'삭제할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
}

function addSeason(){
  if(!isLoggedIn) return;
  const name=(document.getElementById('cfg-season-name')?.value||'').trim();
  const from=(document.getElementById('cfg-season-from')?.value||'').trim();
  const to=(document.getElementById('cfg-season-to')?.value||'').trim();
  if(!name||!from||!to){ alert('시즌 이름/시작일/종료일을 입력하세요.'); return; }
  seasons = Array.isArray(seasons) ? seasons : [];
  seasons.push({name, from, to});
  // 정렬
  try{ seasons.sort((a,b)=>(a.from||'').localeCompare(b.from||'')); }catch(e){}
  save(); render();
  try{ renderSeasonList(); }catch(e){}
}
function editSeason(i){
  if(!isLoggedIn) return;
  const s = (seasons||[])[i]; if(!s) return;
  const name = prompt('시즌 이름', s.name||''); if(name===null) return;
  const from = prompt('시작일(YYYY-MM-DD)', s.from||''); if(from===null) return;
  const to   = prompt('종료일(YYYY-MM-DD)', s.to||''); if(to===null) return;
  seasons[i] = {name:String(name).trim(), from:String(from).trim(), to:String(to).trim()};
  try{ seasons.sort((a,b)=>(a.from||'').localeCompare(b.from||'')); }catch(e){}
  save(); render();
  try{ renderSeasonList(); }catch(e){}
}
function deleteSeason(i){
  if(!isLoggedIn) return;
  const s=(seasons||[])[i]; if(!s) return;
  if(!confirm(`시즌 '${s.name}'을(를) 삭제할까요?`)) return;
  seasons.splice(i,1);
  save(); render();
  try{ renderSeasonList(); }catch(e){}
}

function bulkChangeTier(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  const fromTier=document.getElementById('bulk-tier-from')?.value||'';
  const toTier=document.getElementById('bulk-tier-to')?.value||'';
  const targetUniv=document.getElementById('bulk-tier-univ')?.value||'';
  if(!toTier){alert('변경할 티어를 선택하세요.');return;}
  const targets=players.filter(p=>{
    if(fromTier && (p.tier||'미정')!==fromTier) return false;
    if(targetUniv && p.univ!==targetUniv) return false;
    return true;
  });
  if(!targets.length){alert('해당하는 선수가 없습니다.');return;}
  if(!confirm(`${targets.length}명의 티어를 '${toTier}'으로 변경할까요?\n\n${targets.slice(0,5).map(p=>p.name).join(', ')}${targets.length>5?` 외 ${targets.length-5}명`:''}`)) return;
  targets.forEach(p=>{ p.tier=toTier; });
  save(); render();
  const el=document.getElementById('bulk-tier-result');
  if(el){ el.textContent=`✅ ${targets.length}명 변경 완료!`; setTimeout(()=>{if(el)el.textContent='';},3000); }
}

/* ══════════════════════════════════════
   경기 일괄 수정 함수들
══════════════════════════════════════ */
function bulkConvertToGameScore(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  let converted = 0;
  targets.forEach(key=>{
    const arr = arrMap[key]||[];
    arr.forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA = m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB = m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      // 세트 수와 다를 때만 변환
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
  });

  // 대회(tourneys) 조별리그도 변환
  (tourneys||[]).forEach(tn=>{
    if(!tn.groups) return;
    tn.groups.forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.sets||!m.sets.length) return;
        const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
        const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
        if(gA!==m.sa||gB!==m.sb){
          m.sa=gA; m.sb=gB;
          m.scoreMode='game';
          converted++;
        }
      });
    });
    // 브라켓 경기도 변환
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{
      if(!m||!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
    (br.manualMatches||[]).forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
  });

  if(converted===0){
    const el=document.getElementById('bulk-conv-result');
    if(el) el.textContent='변환할 경기가 없습니다. (이미 게임수 합산으로 저장됨)';
    return;
  }
  save(); render();
  const el=document.getElementById('bulk-conv-result');
  if(el) el.textContent='✅ '+converted+'건 변환 완료!';
  setTimeout(()=>{ if(el) el.textContent=''; }, 3000);
}


// ttFixOrphanRecords: IIFE 블록 제거로 전역 정의로 이동
function ttFixOrphanRecords(compName,includeWrong){
  const orphans=ttM.filter(m=>!m.compName||m.compName==='');
  const wrongComp=includeWrong?ttM.filter(m=>m.compName&&m.compName!==compName):[];
  const targets=[...orphans,...wrongComp];
  if(!targets.length){alert('연결할 기록이 없습니다.');return;}
  const wrongNames=[...new Set(wrongComp.map(m=>m.compName))].join(', ');
  const msg=`기록 ${targets.length}건을 "${compName}"에 연결합니다.${wrongNames?`\n(다른 대회명: ${wrongNames})`:''}\n계속할까요?`;
  if(!confirm(msg))return;
  targets.forEach(m=>{m.compName=compName;if(!m.n)m.n=compName;});
  save();render();
}

function setBoardMemo2(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memo2=text;
  save();
}
function setBoardNote(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bMemo=text;
  save();
}
function addBoardNoteImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.push(dataUrl);
  save();render();
}
function removeBoardNoteImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.splice(idx,1);
  save();render();
}
function setBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memoImg=dataUrl;
  save();render();
}
function addBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.push(dataUrl);
  save();render();
}
function removeBoardMemoImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.splice(idx,1);
  save();render();
}

function setBoardBgImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImg=dataUrl;
  save();render();
}
function removeBoardBgImg(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  delete u.bgImg;
  delete u.bgImgPos;
  save();render();
}
function setBoardBgImgPos(univName, pos){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgPos=pos;
  save();render();
}
function setBoardBgImgSize(univName, size){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgSize=size;
  save();render();
}
function promptBoardBgImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const cur=u.bgImg&&!u.bgImg.startsWith('data:')?u.bgImg:'';
  const url=prompt('배경 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)',cur);
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  setBoardBgImg(univName,trimmed);
}
function bulkSetBoardBgImg(){
  const url=(document.getElementById('bulk-bg-img-url')?.value||'').trim();
  const pos=document.getElementById('bulk-bg-img-pos')?.value||'center center';
  const size=document.getElementById('bulk-bg-img-size')?.value||'cover';
  if(!url){showToast('이미지 URL을 입력해주세요.');return;}
  if(!confirm('모든 대학에 동일한 배경 이미지를 적용하시겠습니까?'))return;
  univCfg.forEach(u=>{
    u.bgImg=url;
    u.bgImgPos=pos;
    u.bgImgSize=size;
  });
  save();render();
  showToast('전체 대학에 배경 이미지가 적용되었습니다.');
  // 리스트 갱신
  const bgListEl=document.getElementById('cfg-board-bg-list');
  if(bgListEl){
    bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div class="cdot" style="background:${u.color}"></div>
        <span style="flex:1;font-weight:700;font-size:13px">${u.name}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
        ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
      </div>
      ${u.bgImg?`<div style="margin-top:8px">
        <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
        <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="top left" ${u.bgImgPos==='top left'?' selected':''}>좌상단</option>
          <option value="top center" ${u.bgImgPos==='top center'?' selected':''}>중상단</option>
          <option value="top right" ${u.bgImgPos==='top right'?' selected':''}>우상단</option>
          <option value="center left" ${u.bgImgPos==='center left'?' selected':''}>좌중앙</option>
          <option value="center center" ${u.bgImgPos==='center center'?' selected':''}>중앙</option>
          <option value="center right" ${u.bgImgPos==='center right'?' selected':''}>우중앙</option>
          <option value="bottom left" ${u.bgImgPos==='bottom left'?' selected':''}>좌하단</option>
          <option value="bottom center" ${u.bgImgPos==='bottom center'?' selected':''}>중하단</option>
          <option value="bottom right" ${u.bgImgPos==='bottom right'?' selected':''}>우하단</option>
        </select>
        <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
        <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
          <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
          <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
        </select>
      </div>`:''}
    </div>`).join('');
  }
}
function bulkClearBoardBgImg(){
  if(!confirm('모든 대학의 배경 이미지를 삭제하시겠습니까?'))return;
  univCfg.forEach(u=>{
    delete u.bgImg;
    delete u.bgImgPos;
    delete u.bgImgSize;
  });
  save();render();
  showToast('전체 대학의 배경 이미지가 삭제되었습니다.');
  // 리스트 갱신
  const bgListEl=document.getElementById('cfg-board-bg-list');
  if(bgListEl){
    bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div class="cdot" style="background:${u.color}"></div>
        <span style="flex:1;font-weight:700;font-size:13px">${u.name}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
        ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
      </div>
      ${u.bgImg?`<div style="margin-top:8px">
        <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
        <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="top left" ${u.bgImgPos==='top left'?' selected':''}>좌상단</option>
          <option value="top center" ${u.bgImgPos==='top center'?' selected':''}>중상단</option>
          <option value="top right" ${u.bgImgPos==='top right'?' selected':''}>우상단</option>
          <option value="center left" ${u.bgImgPos==='center left'?' selected':''}>좌중앙</option>
          <option value="center center" ${u.bgImgPos==='center center'?' selected':''}>중앙</option>
          <option value="center right" ${u.bgImgPos==='center right'?' selected':''}>우중앙</option>
          <option value="bottom left" ${u.bgImgPos==='bottom left'?' selected':''}>좌하단</option>
          <option value="bottom center" ${u.bgImgPos==='bottom center'?' selected':''}>중하단</option>
          <option value="bottom right" ${u.bgImgPos==='bottom right'?' selected':''}>우하단</option>
        </select>
        <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
        <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
          <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
          <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
        </select>
      </div>`:''}
    </div>`).join('');
  }
}
function promptBoardMemoImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('사이드 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardMemoImg(univName,trimmed);
}
function promptBoardNoteImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('하단 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardNoteImg(univName,trimmed);
}

/* ══════════════════════════════════════
   선수 CRUD
══════════════════════════════════════ */
// 등록 타입 변경 시 폼 필드 동적 표시/숨김
function onRegTypeChange() {
  const type = document.getElementById('p-reg-type')?.value || 'starcraft';
  const scFields = ['p-univ','p-tier','p-race'];
  const genderField = document.getElementById('p-gender');
  const displayNameField = document.getElementById('p-display-name');

  // 스타크래프트 전용 필드
  scFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = (type === 'starcraft') ? '' : 'none';
  });

  // 성별/프로필이름 (종합게임)
  if (genderField) genderField.style.display = (type === 'general') ? '' : 'none';
  if (displayNameField) displayNameField.style.display = (type === 'general') ? '' : 'none';
}

function addPlayer(){
  const n=document.getElementById('p-name').value.trim();
  if(!n)return alert('이름을 입력하세요.');
  if(players.find(p=>p.name===n)&&!confirm(`"${n}" 이름이 이미 있습니다.\n동명이인으로 등록할까요?`))return;
  const _pRegType=(document.getElementById('p-reg-type')?.value||'starcraft');
  const _pRole=(document.getElementById('p-role')?.value||'').trim();
  const _pPhoto=(document.getElementById('p-photo')?.value||'').trim();
  const _pDisplayName=(document.getElementById('p-display-name')?.value||'').trim();
  if(_pPhoto){
    if(_pPhoto.startsWith('data:')){alert('base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용');return;}
    if(_pPhoto.length>2000&&!confirm(`이미지 URL이 매우 깁니다 (${_pPhoto.length}자). 계속할까요?`))return;
  }
  const _pHideBoard=document.getElementById('p-hide-board')?.checked||false;
  const _pGender=document.getElementById('p-gender')?.value||'M';

  let playerData;

  if(_pRegType==='starcraft'){
    // 순수 스타크래프트 스트리머
    playerData={name:n,univ:document.getElementById('p-univ').value,tier:document.getElementById('p-tier').value,
      race:document.getElementById('p-race').value,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
      gameType:'starcraft',win:0,loss:0,points:0,history:[]};

  } else if(_pRegType==='general'){
    // 종합게임 스트리머
    playerData={name:n,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,displayName:_pDisplayName||undefined,
      hideFromBoard:_pHideBoard||undefined,
      gameType:'종합게임',
      win:0,loss:0,points:0,history:[]};
  } else {
    playerData={name:n,univ:'무소속',gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
      gameType:'starcraft',win:0,loss:0,points:0,history:[]};
  }

  players.push(playerData);
  document.getElementById('p-name').value='';
  document.getElementById('p-photo').value='';
  if(document.getElementById('p-display-name')) document.getElementById('p-display-name').value='';
  document.getElementById('p-hide-board').checked=false;
  save();render();
}
function bulkAddPlayers(){
  if(!isLoggedIn){alert('관리자만 사용 가능합니다.');return;}
  const raw=document.getElementById('bulk-player-input')?.value||'';
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);
  if(!lines.length){alert('등록할 스트리머를 입력하세요.');return;}
  const RACES=new Set(['T','Z','P','N']);
  const TIER_SET=new Set(typeof TIERS!=='undefined'?TIERS:['G','K','JA','J','S']);
  let added=0;const skipped=[];
  lines.forEach(line=>{
    const parts=line.split(/\s+/);
    if(!parts[0])return;
    const name=parts[0];
    let race='T',tier='',showOnBoard=false,gender='M';
    const univParts=[];
    parts.slice(1).forEach(tok=>{
      if(tok.toLowerCase()==='show'){showOnBoard=true;return;}
      if(tok.toLowerCase()==='hide'){return;} // hide는 기본값이므로 무시
      if(tok==='남자'||tok.toUpperCase()==='M'){gender='M';return;}
      if(tok==='여자'||tok.toUpperCase()==='F'){gender='F';return;}
      if(RACES.has(tok.toUpperCase())){race=tok.toUpperCase();return;}
      if(TIER_SET.has(tok)){tier=tok;return;}
      univParts.push(tok);
    });
    const univ=univParts.join(' ')||'무소속';
    if(players.find(p=>p.name===name)){skipped.push(name);return;}
    players.push({name,univ,tier:tier||'미정',race,gender,hideFromBoard:showOnBoard?undefined:true,win:0,loss:0,points:0,history:[]});
    added++;
  });
  if(added>0){save();render();}
  const resultEl=document.getElementById('bulk-player-result');
  if(resultEl){
    let msg=`✅ ${added}명 등록 완료`;
    if(skipped.length)msg+=`\n⚠️ 중복 스킵 (${skipped.length}명): ${skipped.join(', ')}`;
    resultEl.innerHTML=msg.replace('\n','<br>');
    resultEl.style.display='block';
    if(added>0)document.getElementById('bulk-player-input').value='';
  }
}
window.openEP=function(name){
  editName=name;const p=players.find(x=>x.name===name);
  if(!p) return;
  document.getElementById('emBody').innerHTML=`
    <label>스트리머 이름</label><input type="text" id="ed-n" value="${p.name}">
    <label>티어</label><select id="ed-t">${TIERS.map(t=>`<option value="${t}"${p.tier===t?' selected':''}>${getTierLabel(t)}</option>`).join('')}</select>
    <label>대학</label>
    <div style="display:flex;gap:6px;align-items:center">
      <select id="ed-u" style="flex:1">${getAllUnivs().filter(u=>!u.dissolved||u.name===p.univ).map(u=>`<option value="${u.name}"${p.univ===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      ${p.univ!=='무소속'?`<button type="button" onclick="document.getElementById('ed-u').value='무소속'" style="flex-shrink:0;padding:4px 10px;border-radius:7px;border:1.5px solid #9ca3af;background:var(--surface);color:#6b7280;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">🚶 무소속</button>`:''}
    </div>
    <label>종족</label><select id="ed-r"><option value="T"${p.race==='T'?' selected':''}>테란</option><option value="Z"${p.race==='Z'?' selected':''}>저그</option><option value="P"${p.race==='P'?' selected':''}>프로토스</option><option value="N"${p.race==='N'?' selected':''}>종족미정</option></select>
    <label>성별</label><select id="ed-g"><option value="F"${(p.gender||'F')==='F'?' selected':''}>👩 여자</option><option value="M"${p.gender==='M'?' selected':''}>👨 남자</option></select>
    <label>직책 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(이사장/선장/동아리장/반장/총장/부총장/총괄/교수/코치는 정렬 우선순위 적용)</span></label>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
      ${MAIN_ROLES.map(r=>{const ic=ROLE_ICONS[r]||'🏷️';const col=ROLE_COLORS[r]||'#6b7280';return `<button type="button" onclick="const el=document.getElementById('ed-role');el.value=el.value===this.dataset.role?'':this.dataset.role;" data-role="${r}" style="padding:3px 8px;border-radius:6px;border:1.5px solid ${col};background:${p.role===r?col+'22':'var(--white)'};color:${col};font-size:11px;font-weight:700;cursor:pointer">${ic} ${r}</button>`;}).join('')}
      <button type="button" onclick="document.getElementById('ed-role').value=''" style="padding:3px 8px;border-radius:6px;border:1.5px solid #9ca3af;background:var(--white);color:#9ca3af;font-size:11px;font-weight:700;cursor:pointer">✕ 없음</button>
    </div>
    <input type="text" id="ed-role" value="${p.role||''}" placeholder="직책 직접 입력 또는 위 버튼 클릭" style="width:100%">
    <label>🖼 프로필 사진 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(현황판 카드에 표시 · 비워두면 기본 아이콘)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-photo" value="${p.photo||''}" placeholder="https://... 이미지 URL 입력" style="flex:1" oninput="(function(el){const v=el.value.trim();const img=document.getElementById('ed-photo-preview');const warn=document.getElementById('ed-photo-warn');if(v&&v.startsWith('data:')){el.style.borderColor='#dc2626';if(warn){warn.style.color='#dc2626';warn.textContent='❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용';}}else{el.style.borderColor='';if(warn){warn.textContent='이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.';warn.style.color='var(--gray-l)';}}const wrap=document.getElementById('ed-photo-preview-wrap');if(v&&!v.startsWith('data:')){img.src=v;img.style.display='block';if(wrap)wrap.style.display='inline-block';}else{if(wrap)wrap.style.display='none';}})(this)">
      <span id="ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.photo&&!p.photo.startsWith('data:')?'inline-block':'none'}">
        <img id="ed-photo-preview" src="${p.photo&&!p.photo.startsWith('data:')?toHttpsUrl(p.photo):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none';const w=document.getElementById('ed-photo-warn');if(w){w.style.color='#d97706';w.textContent='⚠️ 이미지를 불러올 수 없습니다. 다른 도메인에서 차단됐거나 URL이 잘못됐을 수 있습니다.';}">
      </span>
    </div>
    <div id="ed-photo-warn" style="font-size:10px;color:${p.photo&&p.photo.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-top:-6px">${p.photo&&p.photo.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.'}</div>
    <label>🏠 방송국 홈 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(홈 아이콘 클릭 시 이동)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-channel" value="${p.channelUrl||''}" placeholder="https://chzzk.naver.com/... 또는 https://twitch.tv/..." style="flex:1">
      ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" style="font-size:18px;text-decoration:none" title="방송국 바로가기">🏠</a>`:''}
    </div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">치지직/트위치/유튜브 등 방송국 주소. 스트리머 상세에서 홈 아이콘으로 이동됩니다.</div>
    <div style="margin-top:14px;padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#15803d;margin-bottom:10px">🎭 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="ed-icon-btns">
        ${(()=>{const cur=getStatusIcon(p.name);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const isSelected=(id==='none'&&!cur)||(d.emoji&&cur===d.emoji);const iconHTML=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'18px'):d.emoji):'<span style="font-size:11px;font-weight:700">없음</span>';return `<button type="button" onclick="setStatusIconFromModal(this,'${p.name}','${id}')" data-icon-id="${id}" title="${d.label}" style="padding:5px 10px;border-radius:7px;border:2px solid ${isSelected?'#16a34a':'var(--border)'};background:${isSelected?'#dcfce7':'var(--white)'};cursor:pointer;min-width:38px;transition:.12s;font-family:'Noto Sans KR',sans-serif;">${iconHTML}</button>`}).join('')})()}
      </div>
      <div id="ed-icon-label" style="font-size:11px;color:var(--gray-l);margin-top:7px">선택: ${(()=>{const c=getStatusIcon(p.name);const found=Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===c);const expiry=playerStatusExpiry[p.name];const expTxt=expiry?` (${expiry} 만료)`:'';return (found?found[1].label:'없음')+expTxt;})()}</div>
      <div id="ed-icon-expiry-row" style="display:${getStatusIcon(p.name)?'flex':'none'};align-items:center;gap:7px;margin-top:8px">
        <input type="checkbox" id="ed-icon-expiry" ${playerStatusExpiry[p.name]?'checked':''} onchange="onStatusExpiryChange('${p.name}')" style="width:14px;height:14px;cursor:pointer;accent-color:#16a34a">
        <label for="ed-icon-expiry" style="font-size:11px;color:#15803d;font-weight:600;cursor:pointer;margin:0">10일 후 자동으로 없음으로 변경</label>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--blue);margin-bottom:12px">📊 승패 직접 조정</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">승 (현재: ${p.win})</div>
          <input type="number" id="ed-win" value="${p.win}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">패 (현재: ${p.loss})</div>
          <input type="number" id="ed-loss" value="${p.loss}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">포인트 (현재: ${p.points})</div>
          <input type="number" id="ed-pts" value="${p.points}" style="width:100%">
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-o btn-sm" onclick="
          if(confirm('승패와 히스토리를 모두 초기화하시겠습니까?')){
            const p=players.find(x=>x.name===editName);
            p.win=0;p.loss=0;p.points=0;p.history=[];
            document.getElementById('ed-win').value=0;
            document.getElementById('ed-loss').value=0;
            document.getElementById('ed-pts').value=0;
            save();render();
          }
        ">🔄 승패 전체 초기화</button>
        <button class="btn btn-w btn-sm" onclick="
          const p=players.find(x=>x.name===editName);
          p.win=parseInt(document.getElementById('ed-win').value)||0;
          p.loss=parseInt(document.getElementById('ed-loss').value)||0;
          p.points=parseInt(document.getElementById('ed-pts').value)||0;
          save();render();
          document.getElementById('emBody').querySelector('.apply-ok').style.display='inline-block';
          setTimeout(()=>document.getElementById('emBody').querySelector('.apply-ok').style.display='none',1500);
        " style="border-color:var(--green);color:var(--green)">✅ 승패 적용</button>
        <span class="apply-ok" style="display:none;color:var(--green);font-weight:700;font-size:12px;align-self:center">적용됨!</span>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">※ 승패 초기화 시 개인 경기 기록(히스토리)도 함께 삭제됩니다. 대전 기록(미니/대학대전 등)은 유지됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-retired" ${p.retired?'checked':''} style="width:16px;height:16px;cursor:pointer">
        🎗️ 은퇴 (현황판에서만 숨김, 경기 기록은 유지)
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-inactive" ${p.inactive?'checked':''} style="width:16px;height:16px;cursor:pointer">
        ⏸️ 임시 상태 (휴학/활동중단) — 현황판에서 반투명 표시, 은퇴와 달리 숨기지 않음
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-hide-board" ${p.hideFromBoard?'checked':''} style="width:16px;height:16px;cursor:pointer">
        👁️ 현황판에서 숨기기 (스탯·기록은 유지, 구현황판·신현황판 모두 적용)
      </label>
    </div>
    <!-- (요청사항) 보라크루 기능 삭제: 크루 소속 항목 제거 -->
    <div style="margin-top:14px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#b45309;margin-bottom:8px">📝 선수 메모</div>
      <textarea id="ed-memo" style="width:100%;min-height:70px;font-size:12px;border:1px solid #fde68a;border-radius:6px;padding:8px;background:#fff;resize:vertical;font-family:'Noto Sans KR',sans-serif;line-height:1.6;box-sizing:border-box;" placeholder="선수에 대한 메모를 입력하세요...">${p.memo||''}</textarea>
    </div>`;
  om('emModal');
}
function savePlayer(){
  try{
  const p=players.find(x=>x.name===editName);
  if(!p){alert('선수를 찾을 수 없습니다.\n현재 editName: "'+editName+'"');return;}
  const newName=(document.getElementById('ed-n')?.value||'').trim();
  if(!newName){alert('이름을 입력하세요.');return;}
  const oldName=editName;

  // 이름 변경 시 모든 기록 자동 갱신
  if(newName !== oldName){
    if(players.some(x=>x.name===newName)&&!confirm(`"${newName}" 이름의 스트리머가 이미 존재합니다.\n동명이인으로 변경하시겠습니까?`))return;
    players.forEach(other=>{
      (other.history||[]).forEach(h=>{if(h.opp===oldName)h.opp=newName;});
    });
    const renameInMatches=(arr)=>{
      (arr||[]).forEach(m=>{
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
        (m.teamAMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
        (m.teamBMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
      });
    };
    renameInMatches(miniM);renameInMatches(univM);renameInMatches(comps);
    renameInMatches(ckM);renameInMatches(proM);renameInMatches(ttM);
    // 🔧 개인전/끝장전: wName/lName 갱신
    [indM, gjM].forEach(arr=>{
      (arr||[]).forEach(m=>{
        if(m.wName===oldName) m.wName=newName;
        if(m.lName===oldName) m.lName=newName;
      });
    });
    tourneys.forEach(tn=>{
      (tn.groups||[]).forEach(grp=>{
        (grp.matches||[]).forEach(m=>{
          (m.sets||[]).forEach(set=>{
            (set.games||[]).forEach(g=>{
              if(g.playerA===oldName)g.playerA=newName;
              if(g.playerB===oldName)g.playerB=newName;
            });
          });
        });
      });
      // 브라켓 경기 이름 갱신
      const br=tn.bracket||{};
      Object.values(br.matchDetails||{}).forEach(m=>{
        if(!m)return;
        if(m.a===oldName)m.a=newName;
        if(m.b===oldName)m.b=newName;
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
      });
      (br.manualMatches||[]).forEach(m=>{
        if(!m)return;
        if(m.a===oldName)m.a=newName;
        if(m.b===oldName)m.b=newName;
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
      });
    });
  }

  p.name=newName;
  editName=p.name;
  p.tier=document.getElementById('ed-t')?.value||p.tier||'';
  p.univ=document.getElementById('ed-u')?.value||p.univ||'';
  p.race=document.getElementById('ed-r')?.value||p.race||'N';
  p.gender=document.getElementById('ed-g')?.value||p.gender||'F';
  const _rv=(document.getElementById('ed-role')?.value||'').trim();
  p.role=(!p.univ||p.univ==='무소속')?undefined:(_rv||undefined);
  const _photo=(document.getElementById('ed-photo')?.value||'').trim();
  if(_photo){
    if(_photo.startsWith('data:')){
      alert('❌ 프로필 사진에 base64 이미지(data:...)를 직접 붙여넣으면 동기화 저장이 실패할 수 있습니다.\n\n이미지를 imgur.com, Discord 등에 업로드한 후 URL을 사용하세요.');
      return;
    }
    if(_photo.length>2000){
      if(!confirm(`⚠️ 사진 URL이 매우 깁니다 (${_photo.length}자).\n정상 URL인지 확인하세요. 계속 저장하시겠습니까?`)) return;
    }
  }
  p.photo=_photo||undefined;
  const _win=document.getElementById('ed-win');
  const _loss=document.getElementById('ed-loss');
  const _pts=document.getElementById('ed-pts');
  if(_win)p.win=parseInt(_win.value)||0;
  if(_loss)p.loss=parseInt(_loss.value)||0;
  if(_pts)p.points=parseInt(_pts.value)||0;
  p.retired=document.getElementById('ed-retired')?.checked||false;
  if(!p.retired)p.retired=undefined;
  p.inactive=document.getElementById('ed-inactive')?.checked||false;
  if(!p.inactive)p.inactive=undefined;
  p.hideFromBoard=document.getElementById('ed-hide-board')?.checked||false;
  if(!p.hideFromBoard)p.hideFromBoard=undefined;
  // (요청사항) 보라크루 기능 삭제: crewName/isCrew 저장 제거 (기존 값 유지)
  const _memo=(document.getElementById('ed-memo')?.value||'').trim();
  p.memo=_memo||undefined;
  const _channel=(document.getElementById('ed-channel')?.value||'').trim();
  p.channelUrl=_channel||undefined;
  save();
  cm('emModal');
  
  // (요청사항) 보라크루 기능 삭제: 크루 뷰 자동 전환 제거
  
  render();
  if(typeof openPlayerModal==='function'){
    const _savedName=p.name;
    setTimeout(()=>{
      const _p=players.find(x=>x.name===_savedName);
      if(_p) openPlayerModal(_savedName);
    },100);
  }
  }catch(e){
    console.error('[savePlayer] 오류:',e);
    alert('저장 중 오류가 발생했습니다:\n'+e.message+'\n\nF12 콘솔에서 자세한 내용을 확인하세요.');
  }
}
function setAllFemale(){
  if(!confirm(`모든 스트리머 ${players.length}명을 여자로 일괄 변경하시겠습니까?\n이후 남자 선수는 개별 수정으로 변경하세요.`))return;
  players.forEach(p=>p.gender='F');
  save();render();
  alert(`완료! 총 ${players.length}명이 여자로 변경되었습니다.`);
}

function delPlayer(){
  if(!confirm(`"${editName}" 선수를 완전 삭제할까요?\n\n⚠️ 선수 정보와 모든 경기 기록이 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`)) return;
  const name = editName;
  // 1. players 배열에서 완전 제거
  const idx = players.findIndex(x => x.name === name);
  if(idx >= 0) players.splice(idx, 1);
  // 2. 모든 경기 배열에서 해당 선수 관련 기록 제거
  // 개인전/끝장전: 해당 선수가 포함된 게임 제거
  if(typeof indM !== 'undefined') indM = indM.filter(m => m.wName !== name && m.lName !== name);
  if(typeof gjM !== 'undefined') gjM = gjM.filter(m => m.wName !== name && m.lName !== name);
  // 미니/대학대전/CK/프로/티어대회: 해당 선수가 포함된 세트의 게임 제거
  function _removePlayerFromMatches(arr) {
    arr.forEach(m => {
      if(!m.sets) return;
      m.sets.forEach(set => {
        if(!set.games) return;
        set.games = set.games.filter(g => g.playerA !== name && g.playerB !== name);
      });
    });
  }
  _removePlayerFromMatches(miniM);
  _removePlayerFromMatches(univM);
  _removePlayerFromMatches(ckM);
  _removePlayerFromMatches(proM);
  _removePlayerFromMatches(ttM);
  // 3. 다른 선수의 history에서 해당 선수와의 기록 제거 + win/loss/points/ELO 재계산
  players.forEach(p => {
    if(!p.history) return;
    const removed = p.history.filter(h => h.opp === name);
    if(!removed.length) return;
    p.history = p.history.filter(h => h.opp !== name);
    // 제거된 기록만큼 전적 차감
    removed.forEach(h => {
      if(h.result === '승') {
        p.win = Math.max(0, (p.win||0) - 1);
        p.points = (p.points||0) - 3;
        if(h.eloDelta != null) p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
      } else if(h.result === '패') {
        p.loss = Math.max(0, (p.loss||0) - 1);
        p.points = (p.points||0) + 3;
        if(h.eloDelta != null) p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
      }
    });
  });
  save();
  render();
  cm('emModal');
  cm('playerModal');
}

function openRE(mode,idx){
  reMode=mode;reIdx=idx;const allU=getAllUnivs();
  const _calcSetGameCounts = (sets)=>{
    const out = {gameA:0, gameB:0, setA:0, setB:0};
    try{
      (sets||[]).forEach(s=>{
        if(!s) return;
        const games = Array.isArray(s.games) ? s.games : [];
        const gA = (s.scoreA!=null) ? (parseInt(s.scoreA,10)||0) : games.filter(g=>g && g.winner==='A').length;
        const gB = (s.scoreB!=null) ? (parseInt(s.scoreB,10)||0) : games.filter(g=>g && g.winner==='B').length;
        out.gameA += gA; out.gameB += gB;
        const w = s.winner || (gA>gB?'A':gB>gA?'B':'');
        if(w==='A') out.setA += 1;
        else if(w==='B') out.setB += 1;
      });
    }catch(e){}
    return out;
  };
  let body='',tit='';
  if(mode==='mini'){
    const m=miniM[idx];tit='⚡ 미니대전 수정';
    const cnt = _calcSetGameCounts(m.sets||[]);
    const mSetsA=cnt.gameA, mSetsB=cnt.gameB;
    const mSetWA=cnt.setA,  mSetWB=cnt.setB;
    const mDefMode = (m.scoreMode||'') ? String(m.scoreMode) : ((mSetWA+mSetWB>1)?'set':'game');
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A 대학</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>점수 방식</label>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
        <select id="re-scoremode" style="padding:6px;border-radius:8px;border:1px solid var(--border);font-size:12px">
          <option value="game" ${mDefMode==='game'?'selected':''}>경기제(게임수)</option>
          <option value="set" ${mDefMode==='set'?'selected':''}>세트제(세트승)</option>
        </select>
        <button type="button" class="btn btn-w btn-xs" onclick="(function(){const sm=document.getElementById('re-scoremode').value; if(sm==='set'){document.getElementById('re-sa').value=${mSetWA||0};document.getElementById('re-sb').value=${mSetWB||0};}else{document.getElementById('re-sa').value=${mSetsA||0};document.getElementById('re-sb').value=${mSetsB||0};}})()">적용</button>
        <span style="font-size:11px;color:var(--gray-l)">세트수 ${mSetWA}:${mSetWB} / 게임수 ${mSetsA}:${mSetsB}</span>
      </div>
      <label>팀 A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${mSetsA!==null&&mSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${mSetsA};document.getElementById('re-sb').value=${mSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${mSetsA}:${mSetsB})</button>`:''}
      </div>
      <label>팀 B 대학</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>팀 B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${mSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${mSetWA} / B ${mSetWB} | 게임 수: A ${mSetsA} / B ${mSetsB}</div>`:''}`;
  } else if(mode==='univm'){
    const m=univM[idx];tit='🏟️ 대학대전 수정';
    const cnt = _calcSetGameCounts(m.sets||[]);
    const uSetsA=cnt.gameA, uSetsB=cnt.gameB;
    const uSetWA=cnt.setA,  uSetWB=cnt.setB;
    const uDefMode = (m.scoreMode||'') ? String(m.scoreMode) : ((uSetWA+uSetWB>1)?'set':'game');
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>점수 방식</label>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
        <select id="re-scoremode" style="padding:6px;border-radius:8px;border:1px solid var(--border);font-size:12px">
          <option value="game" ${uDefMode==='game'?'selected':''}>경기제(게임수)</option>
          <option value="set" ${uDefMode==='set'?'selected':''}>세트제(세트승)</option>
        </select>
        <button type="button" class="btn btn-w btn-xs" onclick="(function(){const sm=document.getElementById('re-scoremode').value; if(sm==='set'){document.getElementById('re-sa').value=${uSetWA||0};document.getElementById('re-sb').value=${uSetWB||0};}else{document.getElementById('re-sa').value=${uSetsA||0};document.getElementById('re-sb').value=${uSetsB||0};}})()">적용</button>
        <span style="font-size:11px;color:var(--gray-l)">세트수 ${uSetWA}:${uSetWB} / 게임수 ${uSetsA}:${uSetsB}</span>
      </div>
      <label>A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${uSetsA!==null&&uSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${uSetsA};document.getElementById('re-sb').value=${uSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${uSetsA}:${uSetsB})</button>`:''}
      </div>
      <label>팀 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${uSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${uSetWA} / B ${uSetWB} | 게임 수: A ${uSetsA} / B ${uSetsB}</div>`:''}`;
  } else if(mode==='comp'){
    const c=comps[idx];tit='🎖️ 대회 수정';
    const cnt = _calcSetGameCounts(c.sets||[]);
    const cGA=cnt.gameA, cGB=cnt.gameB;
    const cWA=cnt.setA,  cWB=cnt.setB;
    const cDefMode = (c.scoreMode||'') ? String(c.scoreMode) : ((cWA+cWB>1)?'set':'game');
    body=`<label>날짜</label><input type="date" id="re-d" value="${c.d}">
      <label>대회명</label><input type="text" id="re-cn" value="${c.n}">
      <label>대학 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${(c.a||c.u)===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>점수 방식</label>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
        <select id="re-scoremode" style="padding:6px;border-radius:8px;border:1px solid var(--border);font-size:12px">
          <option value="game" ${cDefMode==='game'?'selected':''}>경기제(게임수)</option>
          <option value="set" ${cDefMode==='set'?'selected':''}>세트제(세트승)</option>
        </select>
        <button type="button" class="btn btn-w btn-xs" onclick="(function(){const sm=document.getElementById('re-scoremode').value; if(sm==='set'){document.getElementById('re-sa').value=${cWA||0};document.getElementById('re-sb').value=${cWB||0};}else{document.getElementById('re-sa').value=${cGA||0};document.getElementById('re-sb').value=${cGB||0};}})()">적용</button>
        <span style="font-size:11px;color:var(--gray-l)">세트수 ${cWA}:${cWB} / 게임수 ${cGA}:${cGB}</span>
      </div>
      <label>A 점수 (sa)</label><input type="number" id="re-sa" value="${c.sa||0}">
      <label>대학 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${c.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 점수 (sb)</label><input type="number" id="re-sb" value="${c.sb||0}">`;
  } else if(mode==='pro'){
    const m=proM[idx];tit='🏅 프로리그 수정';
    const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
    const pSetsGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const pSetsGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const pSetsWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const pSetsWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    const pDefMode = (m.scoreMode||'') ? String(m.scoreMode) : ((pSetsWA!=null && pSetsWA+pSetsWB>1) ? 'set' : 'game');
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A팀 레이블</label><input type="text" id="re-tla" value="${m.teamALabel||''}">
      <label>점수 방식</label>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
        <select id="re-scoremode" style="padding:6px;border-radius:8px;border:1px solid var(--border);font-size:12px">
          <option value="game" ${pDefMode==='game'?'selected':''}>경기제(게임수)</option>
          <option value="set" ${pDefMode==='set'?'selected':''}>세트제(세트승)</option>
        </select>
        <button type="button" class="btn btn-w btn-xs" onclick="(function(){const sm=document.getElementById('re-scoremode').value; if(sm==='set'){document.getElementById('re-sa').value=${pSetsWA||0};document.getElementById('re-sb').value=${pSetsWB||0};}else{document.getElementById('re-sa').value=${pSetsGA||0};document.getElementById('re-sb').value=${pSetsGB||0};}})()">적용</button>
        <span style="font-size:11px;color:var(--gray-l)">세트수 ${pSetsWA??0}:${pSetsWB??0} / 게임수 ${pSetsGA??0}:${pSetsGB??0}</span>
      </div>
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
      </div>
      <label>B팀 레이블</label><input type="text" id="re-tlb" value="${m.teamBLabel||''}">
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${pSetsGA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${pSetsWA} / B ${pSetsWB} | 게임 수: A ${pSetsGA} / B ${pSetsGB}</div>`:''}
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='tt'){
    const m=ttM[idx];tit='🎯 티어대회 수정';
    const ttGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const ttGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const ttWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const ttWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    const ttDefMode = (m.scoreMode||'') ? String(m.scoreMode) : ((ttWA!=null && ttWA+ttWB>1) ? 'set' : 'game');
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>대회명 (기록 분류 기준)</label><input type="text" id="re-ttcomp" value="${m.compName||m.n||m.t||''}">
      <label>점수 방식</label>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
        <select id="re-scoremode" style="padding:6px;border-radius:8px;border:1px solid var(--border);font-size:12px">
          <option value="game" ${ttDefMode==='game'?'selected':''}>경기제(게임수)</option>
          <option value="set" ${ttDefMode==='set'?'selected':''}>세트제(세트승)</option>
        </select>
        <button type="button" class="btn btn-w btn-xs" onclick="(function(){const sm=document.getElementById('re-scoremode').value; if(sm==='set'){document.getElementById('re-sa').value=${ttWA||0};document.getElementById('re-sb').value=${ttWB||0};}else{document.getElementById('re-sa').value=${ttGA||0};document.getElementById('re-sb').value=${ttGB||0};}})()">적용</button>
        <span style="font-size:11px;color:var(--gray-l)">세트수 ${ttWA??0}:${ttWB??0} / 게임수 ${ttGA??0}:${ttGB??0}</span>
      </div>
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
      </div>
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${ttGA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${ttWA} / B ${ttWB} | 게임 수: A ${ttGA} / B ${ttGB}</div>`:''}
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='ck'){
    const m=ckM[idx];tit='🤝 대학CK 수정';
    const cnt=_calcSetGameCounts(m.sets||[]);
    const cGA=cnt.gameA, cGB=cnt.gameB;
    const cWA=cnt.setA,  cWB=cnt.setB;
    const cDefMode=(m.scoreMode||'')?String(m.scoreMode):((cWA+cWB>1)?'set':'game');
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>점수 방식</label>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
        <select id="re-scoremode" style="padding:6px;border-radius:8px;border:1px solid var(--border);font-size:12px">
          <option value="game" ${cDefMode==='game'?'selected':''}>경기제(게임수)</option>
          <option value="set" ${cDefMode==='set'?'selected':''}>세트제(세트승)</option>
        </select>
        <button type="button" class="btn btn-w btn-xs" onclick="(function(){const sm=document.getElementById('re-scoremode').value; if(sm==='set'){document.getElementById('re-sa').value=${cWA||0};document.getElementById('re-sb').value=${cWB||0};}else{document.getElementById('re-sa').value=${cGA||0};document.getElementById('re-sb').value=${cGB||0};}})()">적용</button>
        <span style="font-size:11px;color:var(--gray-l)">세트수 ${cWA}:${cWB} / 게임수 ${cGA}:${cGB}</span>
      </div>
      <label>A조 점수 (sa)</label><input type="number" id="re-sa" value="${m.sa||0}">
      <label>B조 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='gj'){
    const m=gjM[idx];tit='⚔️ 끝장전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">`;
  } else if(mode==='ind'){
    const m=indM[idx];tit='🎮 개인전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">`;
  }
  document.getElementById('reTitle').innerText=tit;
  document.getElementById('reBody').innerHTML=body;om('reModal');
}
function saveRow(){
  const d=document.getElementById('re-d')?.value||'';
  if(reMode==='mini'){
    miniM[reIdx].d=d;
    miniM[reIdx].a=document.getElementById('re-a')?.value||miniM[reIdx].a;
    miniM[reIdx].b=document.getElementById('re-b')?.value||miniM[reIdx].b;
    miniM[reIdx].sa=parseInt(document.getElementById('re-sa').value)||0;
    miniM[reIdx].sb=parseInt(document.getElementById('re-sb').value)||0;
    try{ const sm=document.getElementById('re-scoremode')?.value; if(sm) miniM[reIdx].scoreMode=sm; }catch(e){}
    // miniM에 _id가 없으면 생성
    if(!miniM[reIdx]._id)miniM[reIdx]._id=genId();
    // 선수 history 업데이트
    (miniM[reIdx].sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=miniM[reIdx]._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'mini');
      });
    });
  } else if(reMode==='univm'){
    const m=univM[reIdx];m.d=d;m.a=document.getElementById('re-a').value;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.b=document.getElementById('re-b').value;m.sb=parseInt(document.getElementById('re-sb').value)||0;
    try{ const sm=document.getElementById('re-scoremode')?.value; if(sm) m.scoreMode=sm; }catch(e){}
    // univM에 _id가 없으면 생성
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'univ');
      });
    });
  } else if(reMode==='comp'){
    const c=comps[reIdx];c.d=d;c.n=document.getElementById('re-cn').value;
    c.a=document.getElementById('re-a').value;c.u=c.a;c.hostUniv=c.a;
    c.sa=parseInt(document.getElementById('re-sa').value)||0;
    c.b=document.getElementById('re-b').value;c.sb=parseInt(document.getElementById('re-sb').value)||0;
    try{ const sm=document.getElementById('re-scoremode')?.value; if(sm) c.scoreMode=sm; }catch(e){}
  } else if(reMode==='pro'){
    const m=proM[reIdx];m.d=d;
    m.teamALabel=document.getElementById('re-tla')?.value||m.teamALabel;
    m.teamBLabel=document.getElementById('re-tlb')?.value||m.teamBLabel;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    try{ const sm=document.getElementById('re-scoremode')?.value; if(sm) m.scoreMode=sm; }catch(e){}
    // proM에 _id가 없으면 생성
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'pro');
      });
    });
  } else if(reMode==='tt'){
    const m=ttM[reIdx];m.d=d;
    const ttn=document.getElementById('re-ttcomp')?.value;
    if(ttn!==undefined){m.compName=ttn;m.n=ttn;m.t=ttn;}
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    try{ const sm=document.getElementById('re-scoremode')?.value; if(sm) m.scoreMode=sm; }catch(e){}
    // ttM에 _id가 없으면 생성 (기록 탭에서 표시되도록)
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'tier');
      });
    });
  } else if(reMode==='ck'){
    const m=ckM[reIdx];m.d=d;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    try{ const sm=document.getElementById('re-scoremode')?.value; if(sm) m.scoreMode=sm; }catch(e){}
  } else if(reMode==='gj'){
    const m=gjM[reIdx];m.d=d;
    m.wName=document.getElementById('re-gj-w')?.value.trim()||m.wName;
    m.lName=document.getElementById('re-gj-l')?.value.trim()||m.lName;
    m.map=document.getElementById('re-gj-map')?.value.trim()||m.map;
  } else if(reMode==='ind'){
    const m=indM[reIdx];m.d=d;
    m.wName=document.getElementById('re-gj-w')?.value.trim()||m.wName;
    m.lName=document.getElementById('re-gj-l')?.value.trim()||m.lName;
    m.map=document.getElementById('re-gj-map')?.value.trim()||m.map;
  }
  save();render();cm('reModal');
}

function renameUnivAcrossData(oldName,newName){
  oldName=(oldName||'').trim();
  newName=(newName||'').trim();
  if(!oldName||!newName||oldName===newName) return false;

  const _renameHistory=(h)=>{
    if(!h) return;
    ['univ','myUniv','oppUniv','team','oppTeam','teamA','teamB','teamALabel','teamBLabel'].forEach(k=>{
      if(h[k]===oldName) h[k]=newName;
    });
  };
  const _renameMember=(m)=>{
    if(m&&m.univ===oldName) m.univ=newName;
  };
  const _renameMatch=(m)=>{
    if(!m) return;
    ['a','b','u','hostUniv','teamALabel','teamBLabel'].forEach(k=>{
      if(m[k]===oldName) m[k]=newName;
    });
    (m.teamAMembers||[]).forEach(_renameMember);
    (m.teamBMembers||[]).forEach(_renameMember);
    (m.membersA||[]).forEach(_renameMember);
    (m.membersB||[]).forEach(_renameMember);
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        ['univA','univB','wUniv','lUniv','teamA','teamB'].forEach(k=>{
          if(g[k]===oldName) g[k]=newName;
        });
      });
    });
  };

  (players||[]).forEach(p=>{
    if(p.univ===oldName) p.univ=newName;
    (p.history||[]).forEach(_renameHistory);
  });

  [miniM,univM,comps,ckM,proM,ttM,indM,gjM].forEach(arr=>{
    (arr||[]).forEach(_renameMatch);
  });

  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      if(Array.isArray(grp.univs)) grp.univs=grp.univs.map(u=>u===oldName?newName:u);
      (grp.matches||[]).forEach(_renameMatch);
    });
    const br=tn.bracket||{};
    Object.keys(br.slots||{}).forEach(k=>{ if(br.slots[k]===oldName) br.slots[k]=newName; });
    Object.keys(br.winners||{}).forEach(k=>{ if(br.winners[k]===oldName) br.winners[k]=newName; });
    if(br.champ===oldName) br.champ=newName;
    Object.values(br.matchDetails||{}).forEach(_renameMatch);
    (br.manualMatches||[]).forEach(_renameMatch);
  });

  (proTourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      if(Array.isArray(grp.univs)) grp.univs=grp.univs.map(u=>u===oldName?newName:u);
      (grp.matches||[]).forEach(_renameMatch);
    });
  });

  if(typeof boardPlayerOrder!=='undefined' && boardPlayerOrder && boardPlayerOrder[oldName]){
    if(!boardPlayerOrder[newName]) boardPlayerOrder[newName]=boardPlayerOrder[oldName];
    delete boardPlayerOrder[oldName];
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }

  return true;
}

function addUniv(){const n=document.getElementById('nu-n').value.trim();const c=document.getElementById('nu-c').value;if(!n)return;univCfg.push({name:n,color:c});save();render();refreshSel();}
function delUniv(i){if(confirm(`"${univCfg[i].name}" 삭제?`)){univCfg.splice(i,1);save();render();refreshSel();}}
// settings.js와 전역 변수명이 충돌 방지
let _ttUnivDragSrc=-1;
function _univDragStart(e,i){_ttUnivDragSrc=i;e.currentTarget.style.opacity='0.4';e.dataTransfer.effectAllowed='move';}
function _univDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';return false;}
function _univDrop(e,i){
  e.stopPropagation();
  if(_ttUnivDragSrc===i)return false;
  const moved=univCfg.splice(_ttUnivDragSrc,1)[0];
  univCfg.splice(i,0,moved);
  save();render();
  return false;
}
function _univDragEnd(e){e.currentTarget.style.opacity='1';}

// settings.js와 전역 변수 충돌 방지
let _ttDissolveIdx = -1;
function openDissolveModal(i){
  _ttDissolveIdx = i;
  const u = univCfg[i];
  document.getElementById('dissolve-title').textContent = `"${u.name}" 해체 처리`;
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('dissolve-date').value = today;
  const cnt = players.filter(p=>p.univ===u.name).length;
  document.getElementById('dissolve-player-count').textContent = cnt ? `현재 소속 선수 ${cnt}명` : '소속 선수 없음';
  document.getElementById('dissolve-move-players').checked = cnt > 0;
  om('dissolveModal');
}
function confirmDissolve(){
  if(_ttDissolveIdx < 0) return;
  const u = univCfg[_ttDissolveIdx];
  const date = document.getElementById('dissolve-date').value || new Date().toISOString().slice(0,10);
  const movePlayers = document.getElementById('dissolve-move-players').checked;
  u.dissolved = true;
  u.hidden = true;
  u.dissolvedDate = date;
  if(movePlayers){
    players.forEach(p=>{ if(p.univ===u.name){ p.univ='무소속'; p.role=undefined; } });
  }
  // 해체된 대학의 현황판 수동 순서 데이터 정리
  if(typeof boardPlayerOrder !== 'undefined' && boardPlayerOrder[u.name]){
    delete boardPlayerOrder[u.name];
    if(typeof saveBoardPlayerOrder === 'function') saveBoardPlayerOrder();
  }
  save();
  cm('dissolveModal');
  render();
  if(typeof renderBoard==='function') renderBoard();
}
function _renderCfgSiList(){
  const el=document.getElementById('cfg-si-list');
  if(!el)return;
  if(!players.length){el.innerHTML='<div style="padding:20px;text-align:center;color:var(--gray-l)">등록된 선수 없음</div>';return;}
  const _showPhoto = (localStorage.getItem('su_si_show_photo') ?? '0') === '1';
  const iconOptCache=Object.entries(STATUS_ICON_DEFS);
  el.innerHTML=[...players].sort((a,b)=>a.name.localeCompare(b.name,'ko')).map(p=>{
    const cur=playerStatusIcons[p.name]||'';
    const pN=p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const encN=encodeURIComponent(p.name);
    const opts=iconOptCache.map(([id,d])=>`<option value="${id}"${(!cur&&id==='none')||(cur&&(cur===id||cur===d.emoji)&&id!=='none')?' selected':''}>${!_siIsImg(d.emoji)&&d.emoji?d.emoji+' ':''}${d.label}</option>`).join('');
    const delBtn=p.photo?`<button onclick="setProfilePhoto('${pN}','')" style="font-size:11px;padding:2px 6px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;cursor:pointer;flex-shrink:0" title="이미지 삭제">🗑️</button>`:'';
    const clrBtn=cur?`<button onclick="setStatusIcon('${pN}','none');_cfgRefreshSiRow('${pN}')" style="background:none;border:1px solid var(--border2);border-radius:4px;color:#dc2626;cursor:pointer;font-size:12px;padding:2px 7px" title="아이콘 제거">×</button>`:'';
    return `<div style="border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;padding:7px 12px 4px">
        <span id="cfg-photo-wrap-${encN}" style="flex-shrink:0">${getPlayerPhotoHTML(p.name,'32px')}</span>
        <span style="font-weight:600;flex:1;min-width:0;font-size:13px">${p.name}<span style="font-size:10px;color:var(--gray-l);margin-left:4px">${p.univ||''}·${p.tier||''}</span></span>
        <span id="cfg-si-prev-${encN}" style="min-width:26px;text-align:center;display:inline-flex;align-items:center;justify-content:center">${cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):''}</span>
        <select onchange="setStatusIcon('${pN}',this.value);_cfgRefreshSiRow('${pN}')" style="font-size:12px;padding:3px 6px;border:1px solid var(--border2);border-radius:5px;max-width:120px">${opts}</select>
        <span id="cfg-si-clr-${encN}">${clrBtn}</span>
      </div>
      <div class="cfg-si-photo-row" style="display:${_showPhoto?'flex':'none'};align-items:center;gap:5px;padding:0 12px 6px 52px">
        <span style="font-size:10px;color:var(--gray-l);white-space:nowrap">🖼️ 프로필</span>
        <input type="text" id="cfg-photo-url-${encN}" placeholder="이미지 URL 입력..." value="${(p.photo||'').replace(/"/g,'&quot;')}" style="flex:1;min-width:0;font-size:11px;padding:2px 6px;border:1px solid var(--border2);border-radius:5px" onkeydown="if(event.key==='Enter')setProfilePhoto('${pN}',this.value)">
        <button onclick="setProfilePhoto('${pN}',document.getElementById('cfg-photo-url-${encN}').value)" style="font-size:11px;padding:2px 8px;border-radius:5px;border:1px solid var(--blue);background:var(--blue-ll);color:var(--blue);cursor:pointer;white-space:nowrap;flex-shrink:0">저장</button>
        ${delBtn}
      </div>
    </div>`;
  }).join('');
}

function _cfgRefreshSiRow(name){
  const encN=encodeURIComponent(name);
  const cur=playerStatusIcons[name]||'';
  const prevEl=document.getElementById('cfg-si-prev-'+encN);
  if(prevEl) prevEl.innerHTML=cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):'';
  const clrEl=document.getElementById('cfg-si-clr-'+encN);
  if(clrEl){
    const pN=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    clrEl.innerHTML=cur?`<button onclick="setStatusIcon('${pN}','none');_cfgRefreshSiRow('${pN}')" style="background:none;border:1px solid var(--border2);border-radius:4px;color:#dc2626;cursor:pointer;font-size:12px;padding:2px 7px" title="아이콘 제거">×</button>`:'';
  }
}

function setProfilePhoto(name, url){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  const trimmed=(url||'').trim();
  if(trimmed) p.photo=trimmed; else delete p.photo;
  savePhotos();
  const encN=encodeURIComponent(name);
  const wrap=document.getElementById('cfg-photo-wrap-'+encN);
  if(wrap) wrap.innerHTML=getPlayerPhotoHTML(name,'32px');
  const urlInp=document.getElementById('cfg-photo-url-'+encN);
  if(urlInp) urlInp.value=trimmed;
  const row=urlInp&&urlInp.parentElement;
  if(row){
    const delBtn=row.querySelector('button[title="이미지 삭제"]');
    const pN=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    if(trimmed&&!delBtn){
      const b=document.createElement('button');
      b.title='이미지 삭제';
      b.style.cssText='font-size:11px;padding:2px 6px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;cursor:pointer;flex-shrink:0';
      b.textContent='🗑️';
      b.onclick=()=>setProfilePhoto(pN,'');
      row.appendChild(b);
    } else if(!trimmed&&delBtn){
      delBtn.remove();
    }
  }
}

function addTier(){
  const n=document.getElementById('nt-name').value.trim();
  if(!n)return alert('티어 이름을 입력하세요.');
  if(TIERS.includes(n))return alert('이미 존재하는 티어입니다.');
  TIERS.push(n);
  // TIERS는 const이므로 push 가능
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
}
function delTier(t){
  const protectedTiers=['G','K','JA','J','S','0티어'];
  if(protectedTiers.includes(t))return alert('기본 티어는 삭제할 수 없습니다.');
  if(!confirm(`"${t}" 티어를 삭제하시겠습니까?\n해당 티어의 선수는 기본 티어로 변경되지 않습니다.`))return;
  const idx=TIERS.indexOf(t);
  if(idx>=0)TIERS.splice(idx,1);
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t2=>`<option value="${t2}">${getTierLabel(t2)}</option>`).join('');
}

async function addAdminAccount(){
  const id=document.getElementById('adm-id').value.trim();
  const pw=document.getElementById('adm-pw').value;
  const roleEl=document.getElementById('adm-role');
  const role=roleEl?roleEl.value:'admin';
  const msg=document.getElementById('adm-msg');
  if(!id||!pw){msg.style.color='var(--red)';msg.textContent='아이디와 비밀번호를 모두 입력하세요.';return;}
  if(pw.length<8){msg.style.color='var(--red)';msg.textContent='비밀번호는 8자 이상이어야 합니다.';return;}
  const token=(localStorage.getItem('su_gh_token')||'').trim();
  if(!token){msg.style.color='var(--red)';msg.textContent='원격 관리자 계정 관리를 위해 GitHub 토큰을 먼저 설정하세요.';return;}
  try{ if(typeof pullAdminAccountsRemote==='function') await pullAdminAccountsRemote(true); }catch(e){}
  const accounts=getAdminAccounts();
  const idNorm=String(id||'').trim().toLowerCase();
  const idHash=await sha256(idNorm);
  if(accounts.some(a=>String(a.idHash||'')===idHash)){msg.style.color='var(--gold)';msg.textContent='이미 동일한 아이디가 등록되어 있습니다.';return;}
  if(role==='admin' && accounts.some(a=>(a && a.role)!=='sub-admin')){msg.style.color='var(--red)';msg.textContent='총관리자 계정은 1명만 등록할 수 있습니다.';return;}
  const rec=(typeof createAdminAccountRecord==='function') ? await createAdminAccountRecord(id,pw,role,id) : {hash:await sha256(id+':'+pw),role,label:id};
  const next=accounts.concat([rec]);
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(next));
  try{ localStorage.setItem('su_admin_hashes_updated_at', String(Date.now())); }catch(e){}
  const ok=(typeof pushAdminAccountsRemote==='function') ? await pushAdminAccountsRemote(next) : false;
  if(!ok){
    localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(accounts));
    msg.style.color='var(--red)';
    msg.textContent='원격 관리자 계정 저장에 실패했습니다. 다시 시도해 주세요.';
    return;
  }
  msg.style.color='var(--green)';
  const roleLabel=role==='sub-admin'?'부관리자':'총관리자';
  msg.textContent=`✅ ${roleLabel} 계정이 추가되었습니다. 총 ${next.length}명`;
  document.getElementById('adm-id').value='';
  document.getElementById('adm-pw').value='';
  reCfg();
}

async function clearAllAdmins(){
  if(!confirm('모든 관리자 계정을 삭제할까요?\n원격 관리자 계정 목록도 함께 비워집니다.'))return;
  const token=(localStorage.getItem('su_gh_token')||'').trim();
  if(!token){ alert('원격 관리자 계정 관리를 위해 GitHub 토큰을 먼저 설정하세요.'); return; }
  const prev=getAdminAccounts();
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify([]));
  try{ localStorage.setItem('su_admin_hashes_updated_at', String(Date.now())); }catch(e){}
  const ok=(typeof pushAdminAccountsRemote==='function') ? await pushAdminAccountsRemote([]) : false;
  if(!ok){
    localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(prev));
    alert('원격 관리자 계정 삭제에 실패했습니다. 다시 시도해 주세요.');
    return;
  }
  doLogout();
  alert('초기화 완료. 원격 관리자 계정 목록이 비워졌습니다.');
}

function openUnifiedSyncSettings(){
  try{
    if(typeof window.openCfgDataSync === 'function') window.openCfgDataSync();
    else if(typeof window._goCfgSection === 'function') window._goCfgSection('💾 데이터');
    else if(typeof sw==='function') sw('cfg');
  }catch(e){}
  setTimeout(()=>{
    try{
      if(typeof cfgApplyCat==='function') cfgApplyCat('💾 데이터');
    }catch(e){}
    try{
      if(typeof checkFbSyncStatus==='function') checkFbSyncStatus();
    }catch(e){}
    try{
      const sec=document.getElementById('cfg-sec-firebase');
      if(sec){
        sec.open = true;
        sec.scrollIntoView({behavior:'smooth', block:'start'});
      }
    }catch(e){}
  }, 80);
}
function saveFbPw(){
  const pw = document.getElementById('cfg-fb-pw')?.value.trim();
  const statusEl = document.getElementById('fb-pw-status');
  if (!pw) { if(statusEl) statusEl.textContent = '⚠️ 보조 신호 비밀번호를 입력하세요.'; return; }
  localStorage.setItem('su_fb_pw', pw);
  if (statusEl) statusEl.textContent = '✅ 보조 신호 비밀번호 저장됨';
  const input = document.getElementById('cfg-fb-pw');
  if (input) input.value = '';
}
function clearFbPw(){
  localStorage.removeItem('su_fb_pw');
  const statusEl = document.getElementById('fb-pw-status');
  if (statusEl) statusEl.textContent = '미설정';
}
function saveGhToken(){
  const val = document.getElementById('cfg-gh-token')?.value.trim();
  const statusEl = document.getElementById('gh-token-status');
  if (!val) { if(statusEl) statusEl.textContent = '⚠️ 토큰을 입력하세요.'; return; }
  localStorage.setItem('su_gh_token', val);
  if(statusEl) statusEl.textContent = '✅ 토큰 저장됨 (수동 GitHub 업로드 가능)';
  const input = document.getElementById('cfg-gh-token');
  if(input) input.value = '';
}
function clearGhToken(){
  localStorage.removeItem('su_gh_token');
  const statusEl = document.getElementById('gh-token-status');
  if(statusEl) statusEl.textContent = '미설정 (GitHub 저장 불가 / 로컬만 저장)';
}

function _setPdFontSize(size){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.font_size=size;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
}

function _setPdProfileSize(val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.profile_size=parseInt(val)||100;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}

function _setPdColorPreset(cp){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.color_preset=cp;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
}

function _setPdTint(type,val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s[type+'_tint']=parseInt(val)||0;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}

function _setPdUnivDarken(univ,val,idx){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  if(!s.univ_darken) s.univ_darken={};
  s.univ_darken[univ]=parseFloat(val)||0;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  const el=document.getElementById('pd-dv-'+idx);
  if(el) el.textContent=Math.round(val*100)+'%';
}




// (주의) 통계 탭 구현은 stats.js에서 담당한다.
// 과거 임시 코드가 tier-tour.js에도 포함돼 있었는데, settings.js / stats.js와 전역 변수 충돌로
// tier-tour.js 자체가 로드 실패하는 문제가 생겨 제거함.

// 개인 순위 버튼 우클릭 메뉴
function showRankContext(e){
  e.preventDefault();
  e.stopPropagation();
  
  const existingMenu = document.getElementById('rank-context-menu');
  if(existingMenu) existingMenu.remove();
  
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['tt']||'rate';
  
  const menu = document.createElement('div');
  menu.id = 'rank-context-menu';
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
         onclick="window._rankSort['tt']='rate';render();document.getElementById('rank-context-menu').remove();">
      <span style="font-size: 14px">📊</span>
      <span>승률순</span>
    </div>
    <div style="padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px;"
         onmouseover="this.style.background='#f9fafb'" 
         onmouseout="this.style.background='white'"
         onclick="window._rankSort['tt']='w';render();document.getElementById('rank-context-menu').remove();">
      <span style="font-size: 14px">🏆</span>
      <span>승순</span>
    </div>
    <div style="padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px;"
         onmouseover="this.style.background='#f9fafb'" 
         onmouseout="this.style.background='white'"
         onclick="window._rankSort['tt']='l';render();document.getElementById('rank-context-menu').remove();">
      <span style="font-size: 14px">📉</span>
      <span>패순</span>
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
      <span style="font-size: 14px">🏆</span>
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

