/* ══════════════════════════════════════
   🔧 구버전 티어대회 데이터 1회 마이그레이션
══════════════════════════════════════ */
let _ttMigrated = false;
function _migrateTierTourneys(){
  if(_ttMigrated) return;
  _ttMigrated = true;
  let changed = false;
  const _tourneys = (typeof tourneys!=='undefined' && Array.isArray(tourneys)) ? tourneys : [];
  const _ttm = (typeof ttM!=='undefined' && Array.isArray(ttM)) ? ttM : [];
  _tourneys.filter(t=>t && t.type==='tier').forEach(tn=>{
    if(!tn.id){tn.id=genId();changed=true;}
    if(!tn.groups){tn.groups=[];changed=true;}
    if(!tn.bracket){tn.bracket={slots:{},winners:{},champ:''};changed=true;}
  });
  // _id 없는 조별리그/브라켓 경기에 ID 생성 (기존 데이터 호환)
  _tourneys.filter(t=>t && t.type==='tier').forEach(tn=>{
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
  _ttm.forEach(r=>{
    if(r._proKey && r._proKey.startsWith('ptn_')){
      if(!r.stage){ r.stage='bkt'; changed=true; }
      delete r._proKey; changed=true;
    }
  });
  // 구버전 stage 값 보정
  // - 'grp'는 조별리그와 동일한 의미로 사용되던 케이스가 있어 'league'로 통일
  _ttm.forEach(r=>{
    if(r && r.stage==='grp'){ r.stage='league'; changed=true; }
  });
  // (보강) compName 누락 보정
  // - 티어대회 탭은 compName 기준으로 필터링하므로 비어 있으면 기록이 "사라진 것처럼" 보일 수 있음
  try{
    const firstTierName = _tourneys.find(t=>t && t.type==='tier' && t.name)?.name || '';
    _ttm.forEach(r=>{
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
  _ttm.forEach(r=>{
    if(!r.stage&&!r._proKey){ r.stage='general'; changed=true; }
  });
  // tourneys 조별리그 경기 → ttM 동기화 (기존 기록 반영)
  const _ttIds=new Set(_ttm.map(r=>r._id).filter(Boolean));
  _tourneys.filter(t=>t && t.type==='tier').forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id||_ttIds.has(m._id)||m.sa==null) return;
        if(typeof ttM!=='undefined' && Array.isArray(ttM)) ttM.unshift({_id:m._id,d:m.d||'',a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,sets:m.sets||[],n:tn.name,compName:tn.name,teamALabel:m.a||'',teamBLabel:m.b||'',stage:'league'});
        _ttIds.add(m._id);
        changed=true;
      });
    });
    // tourneys 브라켓 경기 → ttM 동기화
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if(!m._id||_ttIds.has(m._id)||m.sa==null) return;
      if(typeof ttM!=='undefined' && Array.isArray(ttM)) ttM.unshift({_id:m._id,d:m.d||'',a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,sets:m.sets||[],n:tn.name,compName:tn.name,teamALabel:m.a||'',teamBLabel:m.b||'',stage:'bkt'});
      _ttIds.add(m._id);
      changed=true;
    });
    ((tn.bracket||{}).manualMatches||[]).forEach(m=>{
      if(!m._id||_ttIds.has(m._id)||m.sa==null) return;
      if(typeof ttM!=='undefined' && Array.isArray(ttM)) ttM.unshift({_id:m._id,d:m.d||'',a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,sets:m.sets||[],n:tn.name,compName:tn.name,teamALabel:m.a||'',teamBLabel:m.b||'',stage:'bkt'});
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
  // 일반 경기 모드
  if(_grpPasteState.mode==='normal_match'){
    return typeof window._nmPasteApplyLogic==='function' ? window._nmPasteApplyLogic(savable) : false;
  }
  // 브라켓 모드 분기
  if(_grpPasteState.mode==='bkt'){
    return _bktPasteApplyLogic(savable,tn);
  }
  // [BUGFIX] comp-league 모드: openCompLeaguePasteModal에서 설정 → grp 모드와 동일하게 처리
  if(_grpPasteState.mode==='comp-league'){
    _grpPasteState.mode='grp'; // grp 로직으로 위임
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
  // [BUGFIX] 토너먼트 경기를 ttM에도 동기화 (기록탭 표시용)
  try{
    if(typeof ttM!=='undefined' && Array.isArray(ttM) && tn && tn.name){
      const _bktEi=ttM.findIndex(x=>x._id===matchId);
      const _bktRec={_id:matchId,d:m.d||dateStr,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,n:tn.name,compName:tn.name,teamALabel:m.a,teamBLabel:m.b,stage:'bkt'};
      if(_bktEi>=0)ttM[_bktEi]=_bktRec;else ttM.unshift(_bktRec);
    }
  }catch(e){}
  save();
  try{ if(typeof syncTierTtMHistory==='function') syncTierTtMHistory(); }catch(e){}
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
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

