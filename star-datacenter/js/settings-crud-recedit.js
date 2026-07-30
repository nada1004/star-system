/* ══════════════════════════════════════════════════════════════
   설정 - 팀경기 멤버/기록(row) 편집 (settings-crud.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _gjPlayerDatalistHTML(){
  const allNames = (typeof players !== 'undefined' && Array.isArray(players))
    ? players.map(p=>p.name).filter(Boolean).sort((a,b)=>a.localeCompare(b,'ko'))
    : [];
  const dlOpts = allNames.map(n=>`<option value="${n.replace(/"/g,'&quot;')}">`).join('');
  return `<datalist id="re-gjind-player-dl">${dlOpts}</datalist>`;
}

function _buildMemberEditHTML(members, side, label){
  const allNames = (typeof players !== 'undefined' && Array.isArray(players))
    ? players.map(p=>p.name).filter(Boolean).sort((a,b)=>a.localeCompare(b,'ko'))
    : [];
  const datalistId = `re-member-dl-${side}`;
  const rows = (Array.isArray(members) && members.length > 0)
    ? members.map((mb,i)=>{
        const n = String(mb&&mb.name||'').trim();
        return `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px" id="re-mem-row-${side}-${i}">
          <input type="text" list="${datalistId}" id="re-mem-${side}-${i}" value="${n.replace(/"/g,'&quot;')}" placeholder="스트리머 이름"
            style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:var(--fs-base);background:var(--surface);color:var(--text1)">
          <button type="button" onclick="_reMemDel('${side}',${i})"
            style="padding:4px 8px;border-radius:8px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;font-size:var(--fs-sm);font-weight:700;cursor:pointer;flex-shrink:0">✕</button>
        </div>`;
      }).join('')
    : `<div style="font-size:var(--fs-sm);color:var(--gray-l);padding:4px 0">참가자 없음</div>`;
  const dlOpts = allNames.map(n=>`<option value="${n.replace(/"/g,'&quot;')}">`).join('');
  return `
  <datalist id="${datalistId}">${dlOpts}</datalist>
  <div style="padding:10px;background:var(--surface-alt,#f8fafc);border:1px solid var(--border);border-radius:var(--r)">
    <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">${label} 참가자</div>
    <div id="re-mem-list-${side}">${rows}</div>
    <button type="button" onclick="_reMemAdd('${side}')"
      style="margin-top:4px;padding:5px 12px;border-radius:8px;border:1.5px dashed var(--blue,#2563eb);background:transparent;color:var(--blue,#2563eb);font-size:var(--fs-sm);font-weight:700;cursor:pointer;width:100%">+ 참가자 추가</button>
  </div>`;
}
window._reMemDel = function(side, i){
  const el = document.getElementById(`re-mem-row-${side}-${i}`);
  if(el) el.remove();
};
window._reMemAdd = function(side){
  const list = document.getElementById(`re-mem-list-${side}`);
  if(!list) return;
  const allNames = (typeof players !== 'undefined' && Array.isArray(players))
    ? players.map(p=>p.name).filter(Boolean).sort((a,b)=>a.localeCompare(b,'ko')) : [];
  const datalistId = `re-member-dl-${side}`;
  const idx = list.querySelectorAll('[id^="re-mem-row-"]').length;
  const div = document.createElement('div');
  div.id = `re-mem-row-${side}-${idx}`;
  div.style.cssText = 'display:flex;align-items:center;gap:4px;margin-bottom:4px';
  div.innerHTML = `<input type="text" list="${datalistId}" id="re-mem-${side}-${idx}" value="" placeholder="스트리머 이름"
    style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:var(--fs-base);background:var(--surface);color:var(--text1)">
    <button type="button" onclick="_reMemDel('${side}',${idx})"
      style="padding:4px 8px;border-radius:8px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;font-size:var(--fs-sm);font-weight:700;cursor:pointer;flex-shrink:0">✕</button>`;
  list.appendChild(div);
};
// 멤버 편집 결과를 읽어 배열로 반환
function _reReadMembers(side, originalMembers){
  const list = document.getElementById(`re-mem-list-${side}`);
  if(!list) return originalMembers || [];
  const inputs = list.querySelectorAll(`input[id^="re-mem-${side}-"]`);
  const result = [];
  inputs.forEach(inp=>{
    const n = String(inp.value||'').trim();
    if(!n) return;
    const orig = (originalMembers||[]).find(m=>m&&m.name===n) || {};
    const pObj = (typeof players !== 'undefined' && Array.isArray(players)) ? (players.find(p=>p.name===n)||{}) : {};
    result.push({ name:n, univ:orig.univ||pObj.univ||'', race:orig.race||pObj.race||'', tier:orig.tier||pObj.tier||'', gender:orig.gender||pObj.gender||'' });
  });
  return result;
}
// ── /참가자 수정 UI 헬퍼 ────────────────────────────────────────────────

function openRE(mode,idx){
  // alias/필터 모드 보정
  mode = (mode==='individual') ? 'ind' : mode;
  // civil(시빌워)은 mini 배열 공유
  if(mode==='civil') mode = 'mini';
  // progj는 gjM 내 _proLabel=true 항목만 필터링된 인덱스일 수 있어 실제 인덱스로 매핑
  if(mode==='progj'){
    try{
      const pool = (Array.isArray(gjM)?gjM.filter(x=>!!x._proLabel):[]);
      const tgt = pool[idx] || null;
      const realIdx = tgt ? gjM.indexOf(tgt) : -1;
      if(realIdx>=0) idx = realIdx;
    }catch(e){}
  }
  reMode=mode;reIdx=idx;const allU=getAllUnivs();
  const _allUActive=allU.filter(u=>!u.dissolved);
  // 해체된 대학은 목록에서 숨기되, 이미 그 경기에 지정된 대학이면(과거 기록) 계속 선택 가능하게 유지
  const _univOpts=(selVal)=>{
    let list=_allUActive;
    if(selVal && !list.some(u=>u.name===selVal)){
      list=[...list,(allU.find(u=>u.name===selVal)||{name:selVal})];
    }
    return list.map(u=>`<option value="${u.name}"${selVal===u.name?' selected':''}>${u.name}</option>`).join('');
  };
  let body='',tit='';
  if(mode==='mini'){
    const m=miniM[idx];tit='⚡ 미니대전 수정';
    const mSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const mSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const _miniMemA = m.teamAMembers||[]; const _miniMemB = m.teamBMembers||[];
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A 대학</label><select id="re-a">${_univOpts(m.a)}</select>
      <label>팀 A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${mSetsA!==null&&mSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${mSetsA};document.getElementById('re-sb').value=${mSetsB}" style="font-size:var(--fs-caption);padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${mSetsA}:${mSetsB})</button>`:''}
      </div>
      <label>팀 B 대학</label><select id="re-b">${_univOpts(m.b)}</select>
      <label>팀 B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${mSetsA!==null?`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${mSetsA} / B ${mSetsB}</div>`:''}
      ${(_miniMemA.length||_miniMemB.length)?_buildMemberEditHTML(_miniMemA,'A','A팀'):''}
      ${(_miniMemA.length||_miniMemB.length)?_buildMemberEditHTML(_miniMemB,'B','B팀'):''}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  } else if(mode==='univm'){
    const m=univM[idx];tit='🏟️ 대학대전 수정';
    const uSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const uSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const _univMemA = m.teamAMembers||[]; const _univMemB = m.teamBMembers||[];
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A</label><select id="re-a">${_univOpts(m.a)}</select>
      <label>A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${uSetsA!==null&&uSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${uSetsA};document.getElementById('re-sb').value=${uSetsB}" style="font-size:var(--fs-caption);padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${uSetsA}:${uSetsB})</button>`:''}
      </div>
      <label>팀 B</label><select id="re-b">${_univOpts(m.b)}</select>
      <label>B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${uSetsA!==null?`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${uSetsA} / B ${uSetsB}</div>`:''}
      ${_buildMemberEditHTML(_univMemA,'A','A팀')}
      ${_buildMemberEditHTML(_univMemB,'B','B팀')}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  
  } else if(mode==='comp'){
    const c=comps[idx];tit='🎖️ 대회 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${c.d}">
      <label>대회명</label><input type="text" id="re-cn" value="${c.n}">
      <label>대학 A</label><select id="re-a">${_univOpts(c.a||c.u)}</select>
      <label>A 세트 승</label><input type="number" id="re-sa" value="${c.sa||0}">
      <label>대학 B</label><select id="re-b">${_univOpts(c.b)}</select>
      <label>B 세트 승</label><input type="number" id="re-sb" value="${c.sb||0}">
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${c.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  } else if(mode==='pro'){
    const m=proM[idx];tit='🏅 프로리그 수정';
    const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
    const pSetsGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const pSetsGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const pSetsWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const pSetsWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A팀 레이블</label><input type="text" id="re-tla" value="${m.teamALabel||''}">
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
        ${pSetsGA!==null&&pSetsGA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${pSetsGA};document.getElementById('re-sb').value=${pSetsGB}" style="font-size:var(--fs-caption);padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer">🔄 게임수(${pSetsGA}:${pSetsGB})</button>`:''}
        ${pSetsWA!==null&&pSetsWA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${pSetsWA};document.getElementById('re-sb').value=${pSetsWB}" style="font-size:var(--fs-caption);padding:2px 8px;background:#dbeafe;border:1px solid #2563eb;border-radius:6px;cursor:pointer">🔄 세트수(${pSetsWA}:${pSetsWB})</button>`:''}
      </div>
      <label>B팀 레이블</label><input type="text" id="re-tlb" value="${m.teamBLabel||''}">
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${pSetsGA!==null?`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:2px">세트 수: A ${pSetsWA} / B ${pSetsWB} | 게임 수: A ${pSetsGA} / B ${pSetsGB}</div>`:''}
      ${_buildMemberEditHTML(mA,'A','A팀')}
      ${_buildMemberEditHTML(mB,'B','B팀')}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">
      <div style="margin-top:6px;font-size:var(--fs-caption);color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='tt'){
    const m=ttM[idx];tit='🎯 티어대회 수정';
    const ttGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const ttGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const ttWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const ttWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    const _ttMemA = m.teamAMembers||[]; const _ttMemB = m.teamBMembers||[];
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>대회명 (기록 분류 기준)</label><input type="text" id="re-ttcomp" value="${m.compName||m.n||m.t||''}">
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
        ${ttGA!==null&&ttGA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${ttGA};document.getElementById('re-sb').value=${ttGB}" style="font-size:var(--fs-caption);padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer">🔄 게임수(${ttGA}:${ttGB})</button>`:''}
        ${ttWA!==null&&ttWA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${ttWA};document.getElementById('re-sb').value=${ttWB}" style="font-size:var(--fs-caption);padding:2px 8px;background:#dbeafe;border:1px solid #2563eb;border-radius:6px;cursor:pointer">🔄 세트수(${ttWA}:${ttWB})</button>`:''}
      </div>
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${ttGA!==null?`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:2px">세트 수: A ${ttWA} / B ${ttWB} | 게임 수: A ${ttGA} / B ${ttGB}</div>`:''}
      ${_buildMemberEditHTML(_ttMemA,'A','A팀')}
      ${_buildMemberEditHTML(_ttMemB,'B','B팀')}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">
      <div style="margin-top:6px;font-size:var(--fs-caption);color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='ck'){
    const m=ckM[idx];tit='🤝 대학CK 수정';
    const _ckMemA = m.teamAMembers||[]; const _ckMemB = m.teamBMembers||[];
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A팀 레이블</label><input type="text" id="re-tla" value="${m.teamALabel||''}" placeholder="미입력 시 A조">
      <label>A조 세트 승</label><input type="number" id="re-sa" value="${m.sa||0}">
      <label>B팀 레이블</label><input type="text" id="re-tlb" value="${m.teamBLabel||''}" placeholder="미입력 시 B조">
      <label>B조 세트 승</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${_buildMemberEditHTML(_ckMemA,'A','A팀')}
      ${_buildMemberEditHTML(_ckMemB,'B','B팀')}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">
      <div style="margin-top:10px;font-size:var(--fs-caption);color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='progj'){
    const m=gjM[idx];tit='🏅 프로리그 끝장전 수정';
    body=`${_gjPlayerDatalistHTML()}<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" list="re-gjind-player-dl" id="re-gj-w" value="${m.wName||''}" placeholder="스트리머 이름 (다른 사람으로 변경 가능)">
      <label>패자</label><input type="text" list="re-gjind-player-dl" id="re-gj-l" value="${m.lName||''}" placeholder="스트리머 이름 (다른 사람으로 변경 가능)">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  } else if(mode==='gj'){
    const m=gjM[idx];tit='⚔️ 끝장전 수정';
    body=`${_gjPlayerDatalistHTML()}<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" list="re-gjind-player-dl" id="re-gj-w" value="${m.wName||''}" placeholder="스트리머 이름 (다른 사람으로 변경 가능)">
      <label>패자</label><input type="text" list="re-gjind-player-dl" id="re-gj-l" value="${m.lName||''}" placeholder="스트리머 이름 (다른 사람으로 변경 가능)">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  } else if(mode==='ind'){
    const m=indM[idx];tit='🎮 개인전 수정';
    body=`${_gjPlayerDatalistHTML()}<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" list="re-gjind-player-dl" id="re-gj-w" value="${m.wName||''}" placeholder="스트리머 이름 (다른 사람으로 변경 가능)">
      <label>패자</label><input type="text" list="re-gjind-player-dl" id="re-gj-l" value="${m.lName||''}" placeholder="스트리머 이름 (다른 사람으로 변경 가능)">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  }
  document.getElementById('reTitle').innerText=tit;
  document.getElementById('reBody').innerHTML=body;
  // 헤더 색상 모드별 적용
  const _reHeadEl = document.getElementById('reModal-title');
  const _reHeadColor = {mini:'#7c3aed',univm:'#16a34a',ck:'#f59e0b',pro:'#0ea5e9',tt:'#10b981',comp:'#2563eb',gj:'#dc2626',progj:'#dc2626',ind:'#2563eb'}[reMode]||'#2563eb';
  if(_reHeadEl) _reHeadEl.style.background=`linear-gradient(135deg,${_reHeadColor}15,${_reHeadColor}07,#f8fafc)`;
  om('reModal');
}
function saveRow(){
  const d=document.getElementById('re-d')?.value||'';
  // (버그픽스) reIdx가 범위 밖이거나 해당 배열 항목이 없으면 조기 종료
  const _RE_ARR_GUARD = { mini: miniM, univm: univM, comp: comps, ck: ckM, pro: proM, tt: ttM, progj: gjM, gj: gjM, ind: indM };
  const _guardArr = _RE_ARR_GUARD[reMode];
  if(_guardArr && (reIdx < 0 || reIdx >= _guardArr.length || !_guardArr[reIdx])){ console.warn('[saveRow] invalid reIdx or missing item', reMode, reIdx); return; }
  if(reMode==='mini'){
    miniM[reIdx].d=d;
    miniM[reIdx].a=document.getElementById('re-a')?.value||miniM[reIdx].a;
    miniM[reIdx].b=document.getElementById('re-b')?.value||miniM[reIdx].b;
    miniM[reIdx].sa=parseInt(document.getElementById('re-sa').value)||0;
    miniM[reIdx].sb=parseInt(document.getElementById('re-sb').value)||0;
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', miniM[reIdx].teamAMembers);
    const _newMemB = _reReadMembers('B', miniM[reIdx].teamBMembers);
    if(_newMemA.length) miniM[reIdx].teamAMembers = _newMemA;
    if(_newMemB.length) miniM[reIdx].teamBMembers = _newMemB;
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
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', m.teamAMembers);
    const _newMemB = _reReadMembers('B', m.teamBMembers);
    if(_newMemA.length) m.teamAMembers = _newMemA;
    if(_newMemB.length) m.teamBMembers = _newMemB;
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
  } else if(reMode==='pro'){
    const m=proM[reIdx];m.d=d;
    m.teamALabel=document.getElementById('re-tla')?.value||m.teamALabel;
    m.teamBLabel=document.getElementById('re-tlb')?.value||m.teamBLabel;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', m.teamAMembers);
    const _newMemB = _reReadMembers('B', m.teamBMembers);
    if(_newMemA.length) m.teamAMembers = _newMemA;
    if(_newMemB.length) m.teamBMembers = _newMemB;
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
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', m.teamAMembers);
    const _newMemB = _reReadMembers('B', m.teamBMembers);
    if(_newMemA.length) m.teamAMembers = _newMemA;
    if(_newMemB.length) m.teamBMembers = _newMemB;
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
    m.teamALabel=document.getElementById('re-tla')?.value||m.teamALabel;
    m.teamBLabel=document.getElementById('re-tlb')?.value||m.teamBLabel;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', m.teamAMembers);
    const _newMemB = _reReadMembers('B', m.teamBMembers);
    if(_newMemA.length) m.teamAMembers = _newMemA;
    if(_newMemB.length) m.teamBMembers = _newMemB;
  } else if(reMode==='progj'){
    const m=gjM[reIdx];m.d=d;
    const _gjw=document.getElementById('re-gj-w')?.value.trim(); if(_gjw!==undefined&&_gjw!=='') m.wName=_gjw; else if(document.getElementById('re-gj-w')) m.wName=_gjw||m.wName;
    const _gjl=document.getElementById('re-gj-l')?.value.trim(); if(_gjl!==undefined&&_gjl!=='') m.lName=_gjl; else if(document.getElementById('re-gj-l')) m.lName=_gjl||m.lName;
    // (버그픽스) 맵을 빈 문자열로 지울 수 있도록: 입력란이 존재하면 무조건 그 값 사용
    const _gjmapEl=document.getElementById('re-gj-map'); if(_gjmapEl) m.map=_gjmapEl.value.trim();
    m._proLabel=true;
  } else if(reMode==='gj'){
    const m=gjM[reIdx];m.d=d;
    const _gjw=document.getElementById('re-gj-w')?.value.trim(); if(_gjw) m.wName=_gjw;
    const _gjl=document.getElementById('re-gj-l')?.value.trim(); if(_gjl) m.lName=_gjl;
    // (버그픽스) 맵을 빈 문자열로 지울 수 있도록: 입력란이 존재하면 무조건 그 값 사용
    const _gjmapEl=document.getElementById('re-gj-map'); if(_gjmapEl) m.map=_gjmapEl.value.trim();
  } else if(reMode==='ind'){
    const m=indM[reIdx];m.d=d;
    const _gjw=document.getElementById('re-gj-w')?.value.trim(); if(_gjw) m.wName=_gjw;
    const _gjl=document.getElementById('re-gj-l')?.value.trim(); if(_gjl) m.lName=_gjl;
    // (버그픽스) 맵을 빈 문자열로 지울 수 있도록: 입력란이 존재하면 무조건 그 값 사용
    const _gjmapEl=document.getElementById('re-gj-map'); if(_gjmapEl) m.map=_gjmapEl.value.trim();
  }
  // 🎙️ 캐스터/스트리머 저장 (모든 mode 공통)
  const _reCaster = (document.getElementById('re-caster')?.value ?? '').trim();
  // mode → 데이터 배열 매핑 (캐스터/스트리머 공통 저장)
  const _RE_ARR_MAP = { mini: miniM, univm: univM, comp: comps, ck: ckM, pro: proM, tt: ttM, progj: gjM, gj: gjM, ind: indM };
  const _reArr = _RE_ARR_MAP[reMode] ?? null;
  if(_reArr && _reArr[reIdx]) {
    if(_reCaster) _reArr[reIdx].caster = _reCaster; else delete _reArr[reIdx].caster;
  }
  save();render();cm('reModal');try{ if(typeof window._refreshOpenHistDetailAfterEdit==='function') window._refreshOpenHistDetailAfterEdit(reMode, reIdx); }catch(e){}
}

/* ════════════════════════════════════════════════════════
   §5  대학 CRUD 및 데이터 일관성
════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════
// 대학/티어/색상/계정 관련 함수는 settings-crud-univ.js 로 분리됨
// renameUnivAcrossData, addUniv, delUniv, addTier, delTier,
// cfgTierTheme*, cfgShowColorPalette, saveFbPw 등
// ══════════════════════════════════════════════════════════
