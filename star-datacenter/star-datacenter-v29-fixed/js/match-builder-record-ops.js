/* ══════════════════════════════════════
   Match Builder Record Ops
══════════════════════════════════════ */

function _removeIndResult(wName, lName, date, map, matchId){
  const w=players.find(p=>p.name===wName);
  const l=players.find(p=>p.name===lName);
  if(!w||!l)return;
  if(!w.history)w.history=[];
  if(!l.history)l.history=[];
  const nm=v=>(!v||v==='-')?'-':v;
  let wi=matchId?w.history.findIndex(h=>h.matchId===matchId&&h.result==='승'&&h.opp===lName):-1;
  if(wi<0)wi=w.history.findIndex(h=>h.result==='승'&&h.opp===lName&&h.date===(date||'')&&nm(h.map)===nm(map));
  let delta=0;
  if(wi>=0){delta=w.history[wi].eloDelta||0;w.history.splice(wi,1);}
  let li=matchId?l.history.findIndex(h=>h.matchId===matchId&&h.result==='패'&&h.opp===wName):-1;
  if(li<0)li=l.history.findIndex(h=>h.result==='패'&&h.opp===wName&&h.date===(date||'')&&nm(h.map)===nm(map));
  if(li>=0)l.history.splice(li,1);
  if(wi>=0||li>=0){
    if(w.win>0)w.win--;if(l.loss>0)l.loss--;
    w.points-=3;l.points+=3;
    if(delta){w.elo=(w.elo||ELO_DEFAULT)-delta;l.elo=(l.elo||ELO_DEFAULT)+delta;}
  }
}

function deleteIndSession(ids){
  if(!confirm(`${ids.length}경기를 삭제하시겠습니까?\n\n⚠️ 선수 성적에서 차감됩니다.`))return;
  indM.filter(m=>ids.includes(m._id)).forEach(m=>_removeIndResult(m.wName,m.lName,m.d||'',m.map||'-',m._id));
  indM=indM.filter(m=>!ids.includes(m._id));
  // (버그픽스) 전역 window.indM 동기화 + 캐시 강제 갱신
  // — _restoreStableIndGj가 삭제 후 렌더 시 이전 캐시로 복원하는 문제 방지
  try{ window.indM = indM; }catch(e){}
  try{ window.__lastGoodIndM = indM.slice(); window.__indGjCacheSet_ind = true; }catch(e){}
  // (버그픽스) 과거 데이터 중 일부는 history의 matchId가 sid 등으로 저장돼 있어
  // 개별 제거 로직으로는 "스트리머 상세 최근 경기"에 남는 경우가 있음.
  // → 현재 데이터(indM/gjM 등) 기준으로 history를 재구성해서 완전히 동기화.
  try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
  save();render();
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
}

function moveIndSession(idsArr, srcMode, destMode, _batch=false){
  const srcArr=(srcMode==='ind')?indM:gjM;
  const games=srcArr.filter(m=>idsArr.includes(m._id));
  if(!games.length)return;
  const sid=games[0].sid||games[0]._id;
  let newLabel='';

  if(destMode==='ind'){
    idsArr.forEach(id=>{const idx=srcArr.findIndex(m=>m._id===id);if(idx>=0)srcArr.splice(idx,1);});
    games.forEach(g=>{delete g._proLabel;});
    indM.unshift(...games);
    newLabel='개인전';
  } else if(destMode==='gj'){
    idsArr.forEach(id=>{const idx=srcArr.findIndex(m=>m._id===id);if(idx>=0)srcArr.splice(idx,1);});
    games.forEach(g=>{delete g._proLabel;});
    gjM.unshift(...games);
    newLabel='끝장전';
  } else if(destMode==='progj'){
    if(srcMode==='ind'){
      idsArr.forEach(id=>{const idx=indM.findIndex(m=>m._id===id);if(idx>=0)indM.splice(idx,1);});
      games.forEach(g=>{g._proLabel=true;});
      gjM.unshift(...games);
    } else {
      games.forEach(g=>{g._proLabel=true;});
    }
    newLabel='프로리그';
  } else if(destMode==='ungj'){
    games.forEach(g=>{delete g._proLabel;});
    newLabel='끝장전';
  }

  if(newLabel){
    players.forEach(p=>(p.history||[]).forEach(h=>{
      if(h.matchId===sid||idsArr.includes(h.matchId))h.mode=newLabel;
    }));
  }
  if(!_batch){save();render();}
}

function _indBulkCountUpdate(key){
  const n=[...document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]:checked`)].length;
  const el=document.getElementById('bulk-cnt-'+key);
  if(el)el.textContent=n+'개 선택됨';
  const allCbs=document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`);
  const allChk=document.getElementById('bulk-all-'+key);
  if(allChk&&allCbs.length) allChk.indeterminate=n>0&&n<allCbs.length, allChk.checked=n===allCbs.length;
}

function indBulkToggleAll(key,checked){
  document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`).forEach(cb=>cb.checked=checked);
  _indBulkCountUpdate(key);
}

function bulkMoveInd(bulkKey,destMode){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 세션이 없습니다.');return;}
  const allIds=cbs.map(cb=>JSON.parse(cb.dataset.bids.replace(/'/g,'"')));
  if(!confirm(allIds.length+'개 세션을 이동하시겠습니까?'))return;
  const srcMode=bulkKey==='ind'?'ind':'gj';
  allIds.forEach(ids=>moveIndSession(ids,srcMode,destMode,true));
  if(typeof _bulkModes!=='undefined') _bulkModes[bulkKey]=false;
  save();render();
}

function bulkDeleteInd(bulkKey){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 세션이 없습니다.');return;}
  const allIds=cbs.flatMap(cb=>JSON.parse(cb.dataset.bids.replace(/'/g,'"')));
  if(!confirm(cbs.length+'개 세션('+allIds.length+'경기)을 삭제하시겠습니까?\n\n⚠️ 선수 성적에서 차감됩니다.'))return;
  const srcArr=bulkKey==='ind'?indM:gjM;
  srcArr.filter(m=>allIds.includes(m._id)).forEach(m=>_removeIndResult(m.wName,m.lName,m.d||'',m.map||'-',m._id));
  const keep=new Set(allIds);
  if(bulkKey==='ind') indM=indM.filter(m=>!keep.has(m._id));
  else gjM=gjM.filter(m=>!keep.has(m._id));
  if(typeof _bulkModes!=='undefined') _bulkModes[bulkKey]=false;
  try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
  save();render();
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
}

function openMoveIndPop(btn, idsArr, srcMode){
  const opts=[];
  if(srcMode==='ind'){
    opts.push({l:'⚔️ 끝장전으로 이동',fn:()=>moveIndSession(idsArr,'ind','gj')});
    opts.push({l:'🏅 프로리그 끝장전으로 이동',fn:()=>moveIndSession(idsArr,'ind','progj')});
  } else if(srcMode==='gj'){
    opts.push({l:'🎮 개인전으로 이동',fn:()=>moveIndSession(idsArr,'gj','ind')});
    opts.push({l:'🏅 프로리그 끝장전으로 이동',fn:()=>moveIndSession(idsArr,'gj','progj')});
  } else if(srcMode==='pro_gj'){
    opts.push({l:'⚔️ 일반 끝장전으로 이동',fn:()=>moveIndSession(idsArr,'pro_gj','ungj')});
    opts.push({l:'🎮 개인전으로 이동',fn:()=>moveIndSession(idsArr,'pro_gj','ind')});
  }
  if(typeof _showMovePop==='function') _showMovePop(btn,opts);
}

function deleteGjSession(idsArr){
  if(!confirm(`${idsArr.length}경기를 삭제하시겠습니까?\n\n⚠️ 선수 성적에서 차감됩니다.`))return;
  gjM.filter(m=>idsArr.includes(m._id)).forEach(m=>_removeGjResult(m.wName,m.lName,m.d||'',m.map||'-',m._id||m.matchId||undefined));
  gjM=gjM.filter(m=>!idsArr.includes(m._id));
  // (버그픽스) 전역 window.gjM 동기화 + 캐시 강제 갱신
  // — _restoreStableIndGj가 삭제 후 렌더 시 이전 캐시로 복원하는 문제 방지
  try{ window.gjM = gjM; }catch(e){}
  try{ window.__lastGoodGjM = gjM.slice(); window.__indGjCacheSet_gj = true; }catch(e){}
  try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
  save();render();
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
}

function bulkEditGjDate(idsJson, curDate){
  const nd=prompt('날짜 일괄 변경 (YYYY-MM-DD)', curDate||'');
  if(nd===null)return;
  const ids=JSON.parse(idsJson.replace(/'/g,'"'));
  gjM.forEach(m=>{if(ids.includes(m._id))m.d=nd;});
  save();render();
}
