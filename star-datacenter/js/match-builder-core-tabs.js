/* ══════════════════════════════════════
   Match Builder Core Tabs
══════════════════════════════════════ */

function rInd(C,T){
  T.innerText='🎮 개인전';
  if(typeof players==='undefined' || !Array.isArray(players)){
    C.innerHTML=`<div style="padding:40px 20px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
    return;
  }
  if(typeof indM==='undefined' || !Array.isArray(indM)) window.indM = [];
  if(typeof indSub==='undefined') window.indSub = 'records';
  if(typeof recSortDir==='undefined') window.recSortDir = 'desc';
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li && indSub==='input') indSub='records';
  const subOpts=(typeof applyTabLabels==='function') ? applyTabLabels('ind',[
    {id:'input',lbl:'📝 경기 입력',fn:`indSub='input';render()`},
    {id:'rank',lbl:'🏆 순위',fn:`indSub='rank';render()`},
    {id:'records',lbl:'📋 기록',fn:`indSub='records';render()`}
  ]) : [
    {id:'input',lbl:'📝 경기 입력',fn:`indSub='input';render()`},
    {id:'rank',lbl:'🏆 순위',fn:`indSub='rank';render()`},
    {id:'records',lbl:'📋 기록',fn:`indSub='records';render()`}
  ];
  let h='';
  const extra = (indSub!=='input' && typeof buildYearMonthFilterControls==='function')
    ? (buildYearMonthFilterControls('ind', true)
      + `<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`
      + `<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`)
    : '';
  h+=_buildMatchSubtabShell(indSub, subOpts, '_indFilterOpen', extra, 'ind');
  if(indSub==='input'&&_li){
    h+=indInputHTML();
  } else if(indSub==='rank'){
    h+=indRankHTML();
  } else {
    h+=indRecordsHTML();
  }
  C.innerHTML=h;
}

function _removeGjResult(wName, lName, date, map, matchId){
  const w=players.find(p=>p.name===wName);
  const l=players.find(p=>p.name===lName);
  if(!w||!l)return;
  if(!w.history)w.history=[];
  if(!l.history)l.history=[];
  const nm=v=>(!v||v==='-')?'-':v;
  // matchId 우선, 없으면(또는 못 찾으면) 날짜/상대/맵 기반으로 최대한 제거
  let wi = -1;
  if(matchId) wi = w.history.findIndex(h=>h.matchId===matchId);
  if(wi<0) wi = w.history.findIndex(h=>h.result==='승'&&h.opp===lName&&(date===''||h.date===date)&&nm(h.map)===nm(map));
  if(wi<0) wi = w.history.findIndex(h=>h.result==='승'&&h.opp===lName&&(date===''||h.date===date)); // 맵 누락/불일치 fallback
  let delta=0;
  if(wi>=0){delta=w.history[wi].eloDelta||0;w.history.splice(wi,1);}
  let li = -1;
  if(matchId) li = l.history.findIndex(h=>h.matchId===matchId);
  if(li<0) li = l.history.findIndex(h=>h.result==='패'&&h.opp===wName&&(date===''||h.date===date)&&nm(h.map)===nm(map));
  if(li<0) li = l.history.findIndex(h=>h.result==='패'&&h.opp===wName&&(date===''||h.date===date));
  if(li>=0)l.history.splice(li,1);
  if(wi>=0||li>=0){
    if(w.win>0)w.win--;if(l.loss>0)l.loss--;
    w.points-=3;l.points+=3;
    if(delta){w.elo=(w.elo||ELO_DEFAULT)-delta;l.elo=(l.elo||ELO_DEFAULT)+delta;}
  }
}

function deleteGjGame(idx){
  if(typeof gjM==='undefined' || !Array.isArray(gjM)) return;
  const m=gjM[idx];if(!m)return;
  _removeGjResult(m.wName,m.lName,m.d||'',m.map||'-',m._id||m.matchId||undefined);
  gjM.splice(idx,1);
  try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
  save();render();
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
}

function rGJ(C,T,proOnly,proInput){
  // proOnly=true면 "프로리그 끝장전" 컨텍스트로 간주
  if(typeof players==='undefined' || !Array.isArray(players)){
    C.innerHTML=`<div style="padding:40px 20px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
    return;
  }
  if(typeof gjM==='undefined' || !Array.isArray(gjM)) window.gjM = [];
  if(typeof gjSub==='undefined') window.gjSub = 'records';
  if(typeof recSortDir==='undefined') window.recSortDir = 'desc';
  if(!window.BLD) window.BLD = {};
  // ✅ 버그픽스: 수정 모드(_editCtx)일 때는 proMode 전환 시 BLD/_gjInput 초기화를 건너뜀
  //   - openGJSessionEdit → curTab 변경 → rGJ 재호출 순서에서
  //     _newProMode !== _gjProMode 조건으로 BLD가 null이 되어 수정 데이터가 날아가는 문제 방지
  const _newProMode=!!proOnly;
  const _hasEditCtxNow = !!(window.BLD && window.BLD['gj'] && window.BLD['gj']._editCtx);
  if(_newProMode!==_gjProMode && !_hasEditCtxNow){_gjInput={date:'',playerA:'',playerB:'',games:[]};BLD['gj']=null;}
  _gjProMode=_newProMode;
  T.innerText=proOnly?'🏅 프로리그 끝장전':'⚔️ 끝장전';
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li && gjSub==='input') gjSub='records';
  const showInput=!proOnly||proInput;
  const subOpts = _gjCanInput()
    ?[{id:'input',lbl:'📝 경기 입력',fn:`gjSub='input';render()`},{id:'rank',lbl:'🏆 순위',fn:`gjSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`gjSub='records';render()`}]
    :[{id:'rank',lbl:'🏆 순위',fn:`gjSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`gjSub='records';render()`}];
  const _gjSubOpts = (typeof applyTabLabels==='function') ? applyTabLabels('gj', subOpts) : subOpts;
  if(!showInput&&gjSub==='input') gjSub='records';
  let h='';
  const extra = (gjSub!=='input' && typeof buildYearMonthFilterControls==='function')
    ? (buildYearMonthFilterControls('gj', true)
      + `<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`
      + `<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`)
    : '';
  h+=_buildMatchSubtabShell(gjSub, _gjSubOpts, '_gjFilterOpen', extra, proOnly?'progj':'gj');
  if(gjSub==='input'&&_li&&showInput){
    h+=gjInputHTML();
  } else if(gjSub==='rank'){
    h+=gjRankHTML(proOnly);
  } else {
    h+=gjRecordsHTML(proOnly);
  }
  C.innerHTML=h;
}

function deleteUnivFromRank(name, mode){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  const label = mode==='univm'?'대학대전':'미니대전';
  if(!confirm(`"${name}" 대학의 모든 ${label} 경기 기록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;
  if(mode==='univm'){
    if(typeof univM==='undefined' || !Array.isArray(univM)) return;
    univM = univM.filter(m=>m.a!==name&&m.b!==name);
  } else {
    if(typeof miniM==='undefined' || !Array.isArray(miniM)) return;
    miniM = miniM.filter(m=>m.a!==name&&m.b!==name);
  }
  save(); render();
}
