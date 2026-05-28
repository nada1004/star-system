/* LEGACY - NOT LOADED — 레거시 파일. index.html에서 로드되지 않습니다. */
/* ══════════════════════════════════════
   Firebase/GitHub 수신 데이터 적용
══════════════════════════════════════ */

// 클라우드 데이터를 전역 변수에 반영 (cloudLoad + onFirebaseLoad 공통)
// 🔧 Firebase 배열→객체 변환 대응 헬퍼
// Firebase Realtime DB는 배열을 {0:...,1:...,2:...} 객체로 저장할 수 있음
// 수신 시 객체면 배열로 변환, null 슬롯 제거
function _fbArr(val, fallback) {
  if(!val) return fallback||[];
  if(Array.isArray(val)) return val;
  if(typeof val === 'object') {
    return Object.keys(val)
      .sort((a,b)=>Number(a)-Number(b))
      .map(k=>val[k])
      .filter(v=>v!=null);
  }
  return fallback||[];
}

function _decompressCloudData(d) {
  if (d && typeof d._lz === 'string') {
    try {
      const json = LZString.decompressFromBase64(d._lz);
      return JSON.parse(json);
    } catch(e) { console.warn('[_decompressCloudData] 압축 해제 실패:', e); }
  }
  return d;
}

function _pcMergeById(remoteArr, localArr, keyFn){
  const out = [];
  const seen = new Set();
  const keyOf = (v, i)=>{
    try{
      return String(keyFn ? keyFn(v, i) : (v && v._id) || i);
    }catch(e){
      return String(i);
    }
  };
  (Array.isArray(remoteArr) ? remoteArr : []).forEach((v, i)=>{
    out.push(v);
    seen.add(keyOf(v, i));
  });
  (Array.isArray(localArr) ? localArr : []).forEach((v, i)=>{
    const k = keyOf(v, i);
    if(seen.has(k)) return;
    out.push(v);
    seen.add(k);
  });
  return out;
}

function _mergeRecordLike(remoteItem, localItem){
  const r = { ...(remoteItem||{}) };
  const l = localItem || {};
  const keepIfEmpty = ['a','b','wName','lName','d','map','memo','note','n','compName','teamALabel','teamBLabel','winner','stage','hostUniv','u','type','rndLabel'];
  keepIfEmpty.forEach(k=>{
    if((r[k]===undefined || r[k]===null || r[k]==='' ) && l[k]!==undefined && l[k]!==null && l[k]!=='') r[k] = l[k];
  });
  ['sa','sb'].forEach(k=>{
    if((r[k]===undefined || r[k]===null) && l[k]!==undefined && l[k]!==null) r[k] = l[k];
  });
  if((!Array.isArray(r.sets) || !r.sets.length) && Array.isArray(l.sets) && l.sets.length) r.sets = l.sets;
  if((!Array.isArray(r.games) || !r.games.length) && Array.isArray(l.games) && l.games.length) r.games = l.games;
  if((!Array.isArray(r.teamAMembers) || !r.teamAMembers.length) && Array.isArray(l.teamAMembers) && l.teamAMembers.length) r.teamAMembers = l.teamAMembers;
  if((!Array.isArray(r.teamBMembers) || !r.teamBMembers.length) && Array.isArray(l.teamBMembers) && l.teamBMembers.length) r.teamBMembers = l.teamBMembers;
  if((!Array.isArray(r.teamA) || !r.teamA.length) && Array.isArray(l.teamA) && l.teamA.length) r.teamA = l.teamA;
  if((!Array.isArray(r.teamB) || !r.teamB.length) && Array.isArray(l.teamB) && l.teamB.length) r.teamB = l.teamB;
  if((!r.univWins || !Object.keys(r.univWins||{}).length) && l.univWins) r.univWins = l.univWins;
  if((!r.univLosses || !Object.keys(r.univLosses||{}).length) && l.univLosses) r.univLosses = l.univLosses;
  return r;
}

function _mergeRecordCollection(remoteArr, localArr, keyFn){
  const keyOf = (m, i)=>{
    try{
      return String(keyFn ? keyFn(m, i) : (m && (m._id || m.sid || `${m.d||''}|${m.a||m.wName||''}|${m.b||m.lName||''}|${m.map||''}`)) || i);
    }catch(e){
      return String(i);
    }
  };
  const localMap = new Map();
  (Array.isArray(localArr) ? localArr : []).forEach((m, i)=> localMap.set(keyOf(m, i), m));
  const out = [];
  const seen = new Set();
  (Array.isArray(remoteArr) ? remoteArr : []).forEach((m, i)=>{
    const k = keyOf(m, i);
    out.push(_mergeRecordLike(m, localMap.get(k)));
    seen.add(k);
  });
  // [BUGFIX] remote가 더 최신일 때는 local-only 항목을 추가하지 않음.
  // remote에 없다는 것은 "삭제됨"을 의미하므로 부활을 방지.
  // remote savedAt을 알 수 없는 초기 로드 등에서는 기존 동작(추가) 유지.
  if(!window._mergeRemoteIsNewer){
    (Array.isArray(localArr) ? localArr : []).forEach((m, i)=>{
      const k = keyOf(m, i);
      if(seen.has(k)) return;
      out.push(m);
    });
  }
  return out;
}

function _pcMergeStageRecordArrays(remoteArr, localArr){
  const keyFn = (m, i)=> (m && (m._id || `${m.a||''}|${m.b||''}|${m.d||''}|${m.map||''}|${m.winner||''}`)) || i;
  return _pcMergeById(remoteArr, localArr, keyFn);
}
// _pcMergeGroupMatches: keyFn 동일 → alias
const _pcMergeGroupMatches = _pcMergeStageRecordArrays;

function _pcMergeBracket(remoteBracket, localBracket){
  const rB = _fbArr(remoteBracket, []);
  const lB = _fbArr(localBracket, []);
  const len = Math.max(rB.length, lB.length);
  const out = [];
  for(let ri=0; ri<len; ri++){
    const rr = _fbArr(rB[ri], []);
    const lr = _fbArr(lB[ri], []);
    const mlen = Math.max(rr.length, lr.length);
    const row = [];
    for(let mi=0; mi<mlen; mi++){
      const rm = rr[mi];
      const lm = lr[mi];
      if(!rm && lm){ row.push(lm); continue; }
      if(rm && !lm){ row.push(rm); continue; }
      if(!rm && !lm){ row.push(null); continue; }
      const merged = { ...(rm||{}) };
      if((!merged.a || merged.a==='TBD') && lm && lm.a) merged.a = lm.a;
      if((!merged.b || merged.b==='TBD') && lm && lm.b) merged.b = lm.b;
      if(!merged.winner && lm && lm.winner) merged.winner = lm.winner;
      if(!merged.d && lm && lm.d) merged.d = lm.d;
      if(!merged.map && lm && lm.map) merged.map = lm.map;
      if((!Array.isArray(merged._games) || !merged._games.length) && lm && Array.isArray(lm._games) && lm._games.length) merged._games = lm._games;
      row.push(merged);
    }
    out.push(row.filter(v=>v!=null));
  }
  return out;
}

function _mergeGenericGroups(remoteGroups, localGroups){
  const rg = _fbArr(remoteGroups, []);
  const lg = _fbArr(localGroups, []);
  const out = rg.map((g, gi)=>{
    const gl = lg[gi] || lg.find(x=>x && g && x.name===g.name) || {};
    const mg = { ...(g||{}) };
    mg.univs = _pcMergeById(_fbArr(mg.univs, []), _fbArr(gl.univs, []), (v,i)=>String(v||i));
    mg.players = _pcMergeById(_fbArr(mg.players, []), _fbArr(gl.players, []), (v,i)=>String(v||i));
    mg.matches = _mergeRecordCollection(_fbArr(mg.matches, []), _fbArr(gl.matches, []));
    return mg;
  });
  lg.forEach((g, gi)=>{
    const exists = out.some((x, i)=> i===gi || (x && g && x.name && g.name && x.name===g.name));
    if(!exists) out.push(g);
  });
  return out;
}

function _mergeBracketDetailObject(remoteObj, localObj){
  const r = (remoteObj && typeof remoteObj==='object') ? remoteObj : {};
  const l = (localObj && typeof localObj==='object') ? localObj : {};
  const out = { ...r };
  Object.keys(l).forEach(k=>{
    if(!out[k]) out[k] = l[k];
    else out[k] = _mergeRecordLike(out[k], l[k]);
  });
  return out;
}

function _mergeSingleTourney(remoteTn, localTn){
  const rt = { ...(remoteTn||{}) };
  const lt = localTn || {};
  if((!rt.name) && lt.name) rt.name = lt.name;
  if((!rt.type) && lt.type) rt.type = lt.type;
  if((!rt.createdAt) && lt.createdAt) rt.createdAt = lt.createdAt;
  rt.groups = _mergeGenericGroups(rt.groups, lt.groups);
  if(rt.bracket || lt.bracket){
    const rb = (rt.bracket && typeof rt.bracket==='object') ? { ...rt.bracket } : {};
    const lb = (lt.bracket && typeof lt.bracket==='object') ? lt.bracket : {};
    if((!rb.manualMatches || !rb.manualMatches.length) && Array.isArray(lb.manualMatches) && lb.manualMatches.length) rb.manualMatches = lb.manualMatches;
    else rb.manualMatches = _mergeRecordCollection(_fbArr(rb.manualMatches, []), _fbArr(lb.manualMatches, []));
    rb.matchDetails = _mergeBracketDetailObject(rb.matchDetails, lb.matchDetails);
    Object.keys(lb).forEach(k=>{
      if(rb[k]===undefined || rb[k]===null || rb[k]==='') rb[k] = lb[k];
    });
    rt.bracket = rb;
  }
  return rt;
}

function _mergeTourneysRemoteWithLocal(remoteArr, localArr){
  const remote = _fbArr(remoteArr, []);
  const local = _fbArr(localArr, []);
  const out = remote.map(rt=>{
    const id = String(rt && rt.id || '');
    const lt = local.find(x=>String(x && x.id || '')===id);
    return lt ? _mergeSingleTourney(rt, lt) : rt;
  });
  // [BUGFIX] remote가 더 최신일 때는 local-only 대회를 추가하지 않음.
  // remote에 없는 대회는 "삭제됨"을 의미하므로 부활 방지.
  if(!window._mergeRemoteIsNewer){
    local.forEach(lt=>{
      const id = String(lt && lt.id || '');
      if(!out.some(rt=>String(rt && rt.id || '')===id)) out.push(lt);
    });
  }
  return out;
}

function _mergeSingleProTourney(remoteTn, localTn){
  const rt = { ...(remoteTn||{}) };
  const lt = localTn || {};
  if((!rt.name) && lt.name) rt.name = lt.name;
  if((!rt.createdAt) && lt.createdAt) rt.createdAt = lt.createdAt;

  const rGroups = _fbArr(rt.groups, []);
  const lGroups = _fbArr(lt.groups, []);
  rt.groups = rGroups.map((g, gi)=>{
    const lg = lGroups[gi] || lGroups.find(x=>x && g && x.name===g.name) || {};
    const mg = { ...(g||{}) };
    mg.players = _pcMergeById(_fbArr(g && g.players, []), _fbArr(lg.players, []), (v,i)=>String(v||i));
    mg.univs = _pcMergeById(_fbArr(g && g.univs, []), _fbArr(lg.univs, []), (v,i)=>String(v||i));
    mg.matches = _pcMergeGroupMatches(_fbArr(g && g.matches, []), _fbArr(lg.matches, []));
    return mg;
  });
  lGroups.forEach((lg, gi)=>{
    const exists = rt.groups.some((g, i)=> i===gi || (g && lg && g.name && lg.name && g.name===lg.name));
    if(!exists) rt.groups.push(lg);
  });

  const rStage = (rt.stageRecords && typeof rt.stageRecords==='object') ? rt.stageRecords : {};
  const lStage = (lt.stageRecords && typeof lt.stageRecords==='object') ? lt.stageRecords : {};
  const rounds = new Set([...Object.keys(rStage), ...Object.keys(lStage)]);
  rt.stageRecords = {};
  rounds.forEach(r=>{
    rt.stageRecords[r] = _pcMergeStageRecordArrays(_fbArr(rStage[r], []), _fbArr(lStage[r], []));
  });

  rt.bracket = _pcMergeBracket(rt.bracket, lt.bracket);
  if(!rt.thirdPlace && lt.thirdPlace) rt.thirdPlace = lt.thirdPlace;
  else if(rt.thirdPlace && lt.thirdPlace){
    const tp = { ...rt.thirdPlace };
    if((!tp.a || tp.a==='TBD') && lt.thirdPlace.a) tp.a = lt.thirdPlace.a;
    if((!tp.b || tp.b==='TBD') && lt.thirdPlace.b) tp.b = lt.thirdPlace.b;
    if(!tp.winner && lt.thirdPlace.winner) tp.winner = lt.thirdPlace.winner;
    if(!tp.d && lt.thirdPlace.d) tp.d = lt.thirdPlace.d;
    if(!tp.map && lt.thirdPlace.map) tp.map = lt.thirdPlace.map;
    if((!Array.isArray(tp._games) || !tp._games.length) && Array.isArray(lt.thirdPlace._games) && lt.thirdPlace._games.length) tp._games = lt.thirdPlace._games;
    rt.thirdPlace = tp;
  }
  rt.teamMatches = _pcMergeById(_fbArr(rt.teamMatches, []), _fbArr(lt.teamMatches, []), (m,i)=> (m && m._id) || i);
  return rt;
}

function _mergeProTourneysRemoteWithLocal(remoteArr, localArr){
  const remote = _fbArr(remoteArr, []);
  const local = _fbArr(localArr, []);
  const out = remote.map(rt=>{
    const id = String(rt && rt.id || '');
    const lt = local.find(x=>String(x && x.id || '')===id);
    return lt ? _mergeSingleProTourney(rt, lt) : rt;
  });
  // [BUGFIX] remote가 더 최신일 때는 local-only 프로리그 대회를 추가하지 않음.
  if(!window._mergeRemoteIsNewer){
    local.forEach(lt=>{
      const id = String(lt && lt.id || '');
      if(!out.some(rt=>String(rt && rt.id || '')===id)) out.push(lt);
    });
  }
  return out;
}

function _applyCloudData(d) {
  d = _decompressCloudData(d);
  try{ window._applyingCloudData = true; }catch(e){}
  const _has = (key) => d[key] !== undefined && d[key] !== null;

  // [BUGFIX] remote savedAt이 local보다 최신이면 _mergeRemoteIsNewer = true.
  // 이 플래그가 true일 때 _mergeRecordCollection / _mergeTourneysRemoteWithLocal 등은
  // local-only 항목을 추가하지 않아 삭제된 데이터가 다른 기기에서 부활하는 것을 막음.
  try{
    const remoteSavedAt = Number(d && d.savedAt || 0) || 0;
    const localSavedAt  = Math.max(
      Number(window._lastAdminSaveTime || 0) || 0,
      Number(localStorage.getItem('su_last_admin_save') || 0) || 0
    );
    // remote가 local보다 1초(1000ms) 이상 최신이면 "remote가 진실 공급원"으로 취급
    window._mergeRemoteIsNewer = remoteSavedAt > 0 && remoteSavedAt > localSavedAt + 1000;
  }catch(e){
    window._mergeRemoteIsNewer = false;
  }

  {
    const v = d.players||d.player;
    if(v !== undefined) {
      players=_fbArr(v, []);
      players.forEach(p=>{ if(p.history) p.history=_fbArr(p.history, []); });
      try{
        const pm = d.playerPhotos || d.pPhotoMap || d.playerPhotoMap || null;
        if(pm){
          players.forEach(p=>{ if(p && p.name && !p.photo && pm[p.name]) p.photo = pm[p.name]; });
        }
      }catch(e){}
    }
  }
  if(_has('univCfg')||_has('univConfig')||_has('universities')) univCfg=_fbArr(d.univCfg||d.univConfig||d.universities, univCfg);
  if(_has('maps')) maps=_fbArr(d.maps||d.map, maps);
  if(_has('tourD')) tourD=_fbArr(d.tourD||d.tournamentDates, Array(15).fill(''));

  {
    const v = d.miniM||d.mini||d.miniMatches;
    const arr = v ? _fbArr(v,[]) : (_has('miniM') ? [] : null);
    if(arr !== null){ miniM=_mergeRecordCollection(arr, _fbArr(typeof miniM!=='undefined'?miniM:[],[])); miniM.forEach(m=>{ if(m.sets)m.sets=_fbArr(m.sets,[]); m.sets&&m.sets.forEach(s=>{if(s.games)s.games=_fbArr(s.games,[]);}); }); }
  }
  {
    const v = d.univM||d.univ||d.univMatches;
    const arr = v ? _fbArr(v,[]) : (_has('univM') ? [] : null);
    if(arr !== null){ univM=_mergeRecordCollection(arr, _fbArr(typeof univM!=='undefined'?univM:[],[])); univM.forEach(m=>{if(m.sets)m.sets=_fbArr(m.sets,[]);m.sets&&m.sets.forEach(s=>{if(s.games)s.games=_fbArr(s.games,[]);});}); }
  }
  {
    const v = d.comps||d.comp||d.competitions;
    const arr = v ? _fbArr(v,[]) : (_has('comps') ? [] : null);
    if(arr !== null) comps=_mergeRecordCollection(arr, _fbArr(typeof comps!=='undefined'?comps:[],[]));
  }
  {
    const v = d.ckM||d.ck||d.ckMatches;
    const arr = v ? _fbArr(v,[]) : (_has('ckM') ? [] : null);
    if(arr !== null){ ckM=_mergeRecordCollection(arr, _fbArr(typeof ckM!=='undefined'?ckM:[],[])); ckM.forEach(m=>{if(m.sets)m.sets=_fbArr(m.sets,[]);if(m.teamAMembers)m.teamAMembers=_fbArr(m.teamAMembers,[]);if(m.teamBMembers)m.teamBMembers=_fbArr(m.teamBMembers,[]);m.sets&&m.sets.forEach(s=>{if(s.games)s.games=_fbArr(s.games,[]);});}); }
  }
  if(_has('compNames')) compNames=_fbArr(d.compNames||d.competitionNames, []);
  if(_has('curComp')||d.savedAt) curComp=d.curComp||d.currentComp||'';
  {
    const v = d.proM||d.pro||d.proMatches;
    const arr = v ? _fbArr(v,[]) : (_has('proM') ? [] : null);
    if(arr !== null){ proM=_mergeRecordCollection(arr, _fbArr(typeof proM!=='undefined'?proM:[],[])); proM.forEach(m=>{if(m.sets)m.sets=_fbArr(m.sets,[]);if(m.teamAMembers)m.teamAMembers=_fbArr(m.teamAMembers,[]);if(m.teamBMembers)m.teamBMembers=_fbArr(m.teamBMembers,[]);m.sets&&m.sets.forEach(s=>{if(s.games)s.games=_fbArr(s.games,[]);});}); }
  }
  {
    const v = d.proTourneys;
    const arr = v ? _fbArr(v,[]) : (_has('proTourneys') ? [] : null);
    if(arr !== null){
      const localProTourneys = _fbArr(typeof proTourneys!=='undefined' ? proTourneys : [], []);
      proTourneys = _mergeProTourneysRemoteWithLocal(arr, localProTourneys);
    }
  }
  {
    const v = d.tourneys||d.tournaments||d.tourney;
    const arr = v ? _fbArr(v,[]) : (_has('tourneys') ? [] : null);
    if(arr !== null){
      tourneys=_mergeTourneysRemoteWithLocal(arr, _fbArr(typeof tourneys!=='undefined'?tourneys:[],[]));
      tourneys.forEach(tn=>{
        tn.groups=_fbArr(tn.groups,[]);
        tn.groups.forEach(g=>{
          g.univs=_fbArr(g.univs,[]);
          g.matches=_fbArr(g.matches,[]);
          g.matches.forEach(m=>{m.sets=_fbArr(m.sets,[]);});
        });
      });
    }
  }
  {
    const v = d.ttM||d.tiertour||d.tierTourM;
    const arr = v ? _fbArr(v,[]) : (_has('ttM') ? [] : null);
    if(arr !== null){
      ttM = _mergeRecordCollection(arr, _fbArr(typeof ttM!=='undefined'?ttM:[],[]));
      try{
        (ttM||[]).forEach(m=>{
          if(m.sets) m.sets=_fbArr(m.sets,[]);
          (m.sets||[]).forEach(s=>{ if(s.games) s.games=_fbArr(s.games,[]); });
        });
      }catch(e){}
      try{ if(typeof _ttMigrated!=='undefined') _ttMigrated=false; }catch(e){}
    }
  }
  {
    const v = d.indM||d.ind;
    const arr = v ? _fbArr(v,[]) : (_has('indM') ? [] : null);
    if(arr !== null) indM=_mergeRecordCollection(arr, _fbArr(typeof indM!=='undefined'?indM:[],[]));
  }
  {
    const v = d.gjM;
    const arr = v ? _fbArr(v,[]) : (_has('gjM') ? [] : null);
    if(arr !== null) gjM=_mergeRecordCollection(arr, _fbArr(typeof gjM!=='undefined'?gjM:[],[]));
  }
  if(d.tiers&&d.tiers.length&&typeof TIERS!=='undefined'){TIERS.splice(0,TIERS.length,...d.tiers);}
  if(d.boardPlayerOrder!==undefined&&typeof boardPlayerOrder!=='undefined'){
    Object.keys(boardPlayerOrder).forEach(k=>delete boardPlayerOrder[k]);
    Object.assign(boardPlayerOrder, d.boardPlayerOrder||{});
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }
  if(d.boardOrder!==undefined&&typeof boardOrder!=='undefined') boardOrder=d.boardOrder;
  if(d.userMapAlias!==undefined&&typeof userMapAlias!=='undefined') userMapAlias=d.userMapAlias;
  if(d.playerStatusIcons!==undefined&&typeof playerStatusIcons!=='undefined'){
    Object.keys(playerStatusIcons).forEach(k=>delete playerStatusIcons[k]);
    Object.assign(playerStatusIcons, d.playerStatusIcons||{});
    try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}
  }
  if(d.notices!==undefined&&typeof notices!=='undefined') notices=d.notices;
  if(d.seasons!==undefined&&typeof seasons!=='undefined') seasons=_fbArr(d.seasons,[]);
  if(d.calScheduled!==undefined&&typeof calScheduled!=='undefined'){
    calScheduled=_fbArr(d.calScheduled,[]);
    window._calScheduled=calScheduled;
  }
  if(d.voteAgg!==undefined&&typeof voteData!=='undefined'){
    const myVotes={};
    Object.entries(voteData||{}).forEach(([k,v])=>{ if(k.endsWith('_my')) myVotes[k]=v; });
    Object.keys(voteData).forEach(k=>delete voteData[k]);
    Object.assign(voteData, d.voteAgg||{}, myVotes);
    localStorage.setItem('su_votes', JSON.stringify(voteData));
  }
  if(d.curProComp!==undefined&&typeof curProComp!=='undefined') curProComp=d.curProComp;
  if(d._ttCurComp!==undefined&&typeof _ttCurComp!=='undefined') _ttCurComp=d._ttCurComp;
  if(d.appSettings!==undefined){
    const s=d.appSettings;
    if(s.fabTabs) localStorage.setItem('su_fabTabs', JSON.stringify(s.fabTabs));
    if(s.globalImgSettings) localStorage.setItem('su_b2_global_img_settings', JSON.stringify(s.globalImgSettings));
    if(s.imgSettings) localStorage.setItem('su_img_settings', JSON.stringify(s.imgSettings));
    if(s.fabHideMobile!==undefined) localStorage.setItem('su_fabHideMobile', s.fabHideMobile?'1':'0');
    if(s.fabHidePC!==undefined) localStorage.setItem('su_fabHidePC', s.fabHidePC?'1':'0');
    if(s.darkMode!==undefined) localStorage.setItem('su_dark', s.darkMode?'1':'0');
    if(s.b2LabelAlpha!==undefined) localStorage.setItem('su_b2la', s.b2LabelAlpha);
    if(s.b2BgAlpha!==undefined) localStorage.setItem('su_b2ba', s.b2BgAlpha);
    try{
      const ls = s.ls || s.localStorage || null;
      if(ls && typeof ls==='object'){
        let localExtTs = 0, cloudExtTs = 0;
        try{ localExtTs = Number(localStorage.getItem('su_hist_ext_last_modified')||0) || 0; }catch(e){}
        try{ cloudExtTs = Number(ls.su_hist_ext_last_modified||0) || 0; }catch(e){}
        const extKeys = new Set([
          'su_hist_ext_data_v1',
          'su_hist_ext_proxy_presets_v1',
          'su_hist_ext_proxy_preset_sel_v1',
          'su_hist_ext_last_modified'
        ]);
        Object.entries(ls).forEach(([k,v])=>{
          if(!k || typeof k!=='string') return;
          if(!k.startsWith('su_')) return;
          if(k.startsWith('su_pp')) return;
          if(k==='su_fb_pw' || k==='su_gh_token' || k==='su_admin_hash' || k==='su_admin_hashes') return;
          if(k==='su_last_admin_save' || k==='su_last_save_time') return;
          if(extKeys.has(k) && localExtTs && localExtTs > cloudExtTs) return;
          try{ localStorage.setItem(k, String(v)); }catch(e){}
        });
      }
    }catch(e){}
    if(typeof updateFabVisibility==='function') updateFabVisibility();
    if(typeof updateFabButtonOnclick==='function') updateFabButtonOnclick();
    try{ if(typeof applyProfileShapeVars==='function') applyProfileShapeVars(); }catch(e){}
    if(s.darkMode!==undefined){
      document.body.classList.toggle('dark', s.darkMode);
      if(window._fixHdrBtns) window._fixHdrBtns();
    }
    if(s.b2LabelAlpha!==undefined) b2LabelAlpha = parseInt(s.b2LabelAlpha);
    if(s.b2BgAlpha!==undefined) b2BgAlpha = parseInt(s.b2BgAlpha);
    const b2Content=document.getElementById('b2-content');
    if(b2Content && typeof _b2UnivView==='function'){
      b2Content.innerHTML=_b2UnivView();
      if(typeof injectUnivIcons==='function') injectUnivIcons(b2Content);
    }
    try{
      if(s.bgmEnabled!==undefined) localStorage.setItem('su_bgm_enabled', s.bgmEnabled ? '1' : '0');
      if(s.bgmShuffle!==undefined) localStorage.setItem('su_bgm_shuffle', s.bgmShuffle ? '1' : '0');
      if(s.bgmVolume!==undefined) localStorage.setItem('su_bgm_volume', String(s.bgmVolume));
      if(s.bgmList!==undefined) localStorage.setItem('su_bgm_list', String(s.bgmList||''));
      if(s.soopList!==undefined) localStorage.setItem('su_soop_list', String(s.soopList||''));
      if(typeof window.bgmApplySettings==='function') window.bgmApplySettings();
      if(typeof window.soopApplySettings==='function') window.soopApplySettings();
    }catch(e){}
    try{
      if(s.histExtData!==undefined) localStorage.setItem('su_hist_ext_data_v1', String(s.histExtData||''));
      if(s.histExtProxyPresets!==undefined) localStorage.setItem('su_hist_ext_proxy_presets_v1', String(s.histExtProxyPresets||''));
      if(s.histExtProxyPresetSel!==undefined) localStorage.setItem('su_hist_ext_proxy_preset_sel_v1', String(s.histExtProxyPresetSel||''));
    }catch(e){}
    try{
      if(s.designV2On!==undefined) localStorage.setItem('su_design_v2', s.designV2On ? '1' : '0');
      if(s.designV2Preset!==undefined) localStorage.setItem('su_design_v2_preset', String(s.designV2Preset||'base'));
      if(s.designV2Bright!==undefined) localStorage.setItem('su_design_v2_bright', String(s.designV2Bright||'0'));
      if(s.designV2Dark!==undefined) localStorage.setItem('su_design_v2_dark', String(s.designV2Dark||'0'));
      if(s.designV2Colors!==undefined) localStorage.setItem('su_design_v2_colors', String(s.designV2Colors||'{}'));
      if(s.designV2Effects!==undefined) localStorage.setItem('su_design_v2_effects', String(s.designV2Effects||'{}'));
      if(s.appFontPreset!==undefined) localStorage.setItem('su_app_font_preset', String(s.appFontPreset||'noto'));
      if(s.appFontCss!==undefined) localStorage.setItem('su_app_font_css', String(s.appFontCss||''));
      if(s.appFontFamily!==undefined) localStorage.setItem('su_app_font_family', String(s.appFontFamily||''));
      if(s.appFontCssText!==undefined) localStorage.setItem('su_app_font_css_text', String(s.appFontCssText||''));
      if(s.appFontAliasMap!==undefined) localStorage.setItem('su_app_font_alias_map', String(s.appFontAliasMap||'{}'));
      if(s.appFontScalePct!==undefined) localStorage.setItem('su_app_font_scale_pct', String(s.appFontScalePct||'100'));
      if(s.appFontScalePcPct!==undefined) localStorage.setItem('su_app_font_scale_pc_pct', String(s.appFontScalePcPct||'100'));
      if(s.appFontScaleTbPct!==undefined) localStorage.setItem('su_app_font_scale_tb_pct', String(s.appFontScaleTbPct||'100'));
      if(s.appFontScaleMbPct!==undefined) localStorage.setItem('su_app_font_scale_mb_pct', String(s.appFontScaleMbPct||'100'));
      if(s.uiScalePct!==undefined) localStorage.setItem('su_ui_scale_pct', String(s.uiScalePct||'100'));
      if(s.uiScalePcPct!==undefined) localStorage.setItem('su_ui_scale_pc_pct', String(s.uiScalePcPct||'100'));
      if(s.uiScaleTbPct!==undefined) localStorage.setItem('su_ui_scale_tb_pct', String(s.uiScaleTbPct||'100'));
      if(s.uiScaleMbPct!==undefined) localStorage.setItem('su_ui_scale_mb_pct', String(s.uiScaleMbPct||'100'));
      if(typeof window._applyAppFont==='function') window._applyAppFont();
      if(typeof window._applyAppFontScale==='function') window._applyAppFontScale();
      if(typeof window.applyDesignV2==='function') window.applyDesignV2();
      if(typeof window._applyUiScale==='function') window._applyUiScale();
    }catch(e){}
    // 펨코스타일 설정 복원 (su_ 접두사 없어서 ls에 미포함 → 별도 처리)
    try{
      if(s.femcoSettings != null) localStorage.setItem('b2_femco_settings_v1', String(s.femcoSettings));
      if(s.femcoUniv != null) localStorage.setItem('cfg_femco_univ', String(s.femcoUniv));
    }catch(e){}
  }
  try{ window._applyingCloudData = false; }catch(e){}
  // [BUGFIX] _mergeRemoteIsNewer 플래그 초기화 (다음 호출을 위해)
  try{ window._mergeRemoteIsNewer = false; }catch(e){}
}

window.onFirebaseLoad = function(data) {
  const { admin_pw: _, ...clean } = data;
  try{window._lastFbDataSize=JSON.stringify(data).length;window._lastFbLoadTime=Date.now();}catch(e){}
  const _getSavedAt = (obj)=>{
    try{ return Number(obj && obj.savedAt || 0) || 0; }catch(e){ return 0; }
  };
  const _getLocalSavedAt = ()=>{
    try{
      const a = Number(window._lastAdminSaveTime||0) || 0;
      const b = Number(localStorage.getItem('su_last_admin_save')||0) || 0;
      return Math.max(a,b);
    }catch(e){
      return Number(window._lastAdminSaveTime||0) || 0;
    }
  };
  const _markReceiveMeta = (sa)=>{
    try{
      if(sa) localStorage.setItem('su_sync_last_remote_saved_at', String(sa));
      localStorage.setItem('su_sync_last_received_at', String(Date.now()));
    }catch(e){}
  };
  try{
    const sa = _getSavedAt(clean);
    const localSavedAt = _getLocalSavedAt();
    const lastApplied = Number(window._lastAppliedSavedAt||0) || 0;
    if(!window._forcingSync && window._isSaving){
      const pendingSa = _getSavedAt(window._fbPendingData);
      if(!window._fbPendingData || sa >= pendingSa){
        window._fbPendingData = clean;
      }
      const fbTs = document.getElementById('fbLastSync');
      if(fbTs) fbTs.textContent = '⏳ 저장 중 수신 대기';
      return;
    }
    if(!window._forcingSync && sa && lastApplied && sa <= lastApplied){
      _markReceiveMeta(sa);
      const fbTs = document.getElementById('fbLastSync');
      if(fbTs) fbTs.textContent = '🔄 ' + new Date().toLocaleTimeString('ko-KR');
      return;
    }
    if(!window._forcingSync && sa && localSavedAt && sa < localSavedAt){
      console.warn('[sync] stale remote ignored', { remoteSavedAt: sa, localSavedAt });
      try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('⏭️ 오래된 원격 데이터 무시', '#d97706'); }catch(e){}
      _markReceiveMeta(sa);
      return;
    }
    if(sa) window._lastAppliedSavedAt = Math.max(lastApplied, sa);
    _markReceiveMeta(sa);
  }catch(e){}
  _applyCloudData(clean);
  if (typeof localSave === 'function') localSave();
  try{ if(typeof window._primeMatchSyncSignature === 'function') window._primeMatchSyncSignature(true); }catch(e){}
  if (typeof fixPoints === 'function') fixPoints();
  window._compListCache = {}; window._shareAllMatchesCached = null; window._histTourneyCache = {};
  if (typeof render === 'function') render();
  const _openModal = document.getElementById('playerModal');
  const pst = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  if (_openModal && _openModal.style.display !== 'none' && pst.currentName) {
    if (typeof openPlayerModal === 'function') openPlayerModal(pst.currentName);
  }
  const _openUnivModal = document.getElementById('univModal');
  const ust = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  if (_openUnivModal && _openUnivModal.style.display !== 'none' && ust.currentName) {
    if (typeof openUnivModal === 'function') openUnivModal(ust.currentName);
  }
  const fbTs = document.getElementById('fbLastSync');
  if(fbTs) fbTs.textContent = '🔄 ' + new Date().toLocaleTimeString('ko-KR');
};

try{ window._fbArr = _fbArr; }catch(e){}
try{ window._decompressCloudData = _decompressCloudData; }catch(e){}
try{ window._applyCloudData = _applyCloudData; }catch(e){}
