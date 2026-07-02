window._goPlayerHistPage = function(page, name){
  playerHistPage = page;
  const _p = players.find(x=>x.name===name);
  if(!_p) return;
  const _mb = document.getElementById('playerModalBody');
  if(!_mb) return;
  const _st = _mb.scrollTop;
  const _fn = (typeof window.buildPlayerDetailHTML==='function')
    ? window.buildPlayerDetailHTML
    : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
  _mb.innerHTML = _fn
    ? _fn(_p)
    : `<div style="font-size:12px;color:var(--gray-l);padding:10px 0">스트리머 상세 렌더러가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.</div>`;
  _mb.scrollTop = _st;
  injectUnivIcons(_mb);
};

window._goPlayerOppPage = function(page, name){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  st.oppPage = page;
  const _p = players.find(x=>x.name===name);
  if(!_p) return;
  const _mb = document.getElementById('playerModalBody');
  if(!_mb) return;
  const _st = _mb.scrollTop;
  const _fn = (typeof window.buildPlayerDetailHTML==='function')
    ? window.buildPlayerDetailHTML
    : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
  _mb.innerHTML = _fn
    ? _fn(_p)
    : `<div style="font-size:12px;color:var(--gray-l);padding:10px 0">스트리머 상세 렌더러가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.</div>`;
  _mb.scrollTop = _st;
  injectUnivIcons(_mb);
};

window._rebuildPlayerDetail = function(name){
  const _p = players.find(x=>x.name===name);
  if(!_p) return;
  const _mb = document.getElementById('playerModalBody');
  if(!_mb) return;
  const _fn = (typeof window.buildPlayerDetailHTML==='function')
    ? window.buildPlayerDetailHTML
    : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
  _mb.innerHTML = _fn
    ? _fn(_p)
    : `<div style="font-size:12px;color:var(--gray-l);padding:10px 0">스트리머 상세 렌더러가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.</div>`;
  injectUnivIcons(_mb);
};

window.refreshPlayerModalIfOpen = function(){
  try{
    const pm = document.getElementById('playerModal');
    if(!pm || pm.style.display==='none') return;
    const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
    const name = st.currentName || '';
    if(!name) return;
    if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(name);
  }catch(e){}
};

function _bindPlayerHistoryModalDelegatedEvents(){
  if(window._playerHistoryModalDelegatedBound) return;
  window._playerHistoryModalDelegatedBound = true;

  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-pha-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-pha-action');
    if(action === 'bulk-save'){
      e.preventDefault();
      if(typeof savePlayerHistBulkEdit === 'function') savePlayerHistBulkEdit(el.getAttribute('data-pha-player') || '');
      return;
    }
    if(action === 'modal-cancel'){
      e.preventDefault();
      cm('reModal');
    }
  });

  document.addEventListener('change', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-pha-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-pha-action');
    if(action === 'bulk-map-sync'){
      const v = el.value;
      const inp = document.getElementById('phe-bulk-map');
      if(v && inp) inp.value = v;
      return;
    }
    if(action === 'single-map-sync'){
      const v = el.value;
      const inp = document.getElementById('phe-map');
      if(v && inp) inp.value = v;
    }
  });
}

let _playerHistBulkSelected = new Set();
let _playerHistBulkMode = false;

function _canEditByDate(dateStr){
  if(typeof isLoggedIn==='undefined' || !isLoggedIn) return false;
  if(typeof isSubAdmin==='undefined' || !isSubAdmin) return true;
  const s=String(dateStr||'').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = new Date();
  t.setHours(0,0,0,0);
  const d = new Date(s+'T00:00:00');
  if(isNaN(d.getTime())) return false;
  const diffDays = Math.floor((t.getTime() - d.getTime()) / (24*60*60*1000));
  return diffDays >= 0 && diffDays <= 1;
}

function _guardRecentEdit(dateStr){
  if(_canEditByDate(dateStr)) return true;
  alert('부관리자는 최근 2일 경기만 수정/삭제할 수 있습니다.');
  return false;
}

function _findProTourStageRecordByMeta(meta){
  try{
    if(!meta || meta.sourceType !== 'proTourStage') return null;
    const tn = (typeof proTourneys!=='undefined' ? proTourneys : []).find(t=>String(t&&t.id||'')===String(meta.tnId||''));
    if(!tn || !tn.stageRecords) return null;
    const round = String(meta.round||'');
    const arr = Array.isArray(tn.stageRecords[round]) ? tn.stageRecords[round] : [];
    const idx = arr.findIndex(x=>x && String(x._id||'')===String(meta.sourceId||''));
    if(idx < 0) return null;
    return { tn, round, arr, idx, rec: arr[idx] };
  }catch(e){
    return null;
  }
}

function _findProTourGroupMatchByMeta(meta){
  try{
    if(!meta || meta.sourceType !== 'proTourGrp') return null;
    const tn = (typeof proTourneys!=='undefined' ? proTourneys : []).find(t=>String(t&&t.id||'')===String(meta.tnId||''));
    if(!tn) return null;
    const gi = Number(meta.grpIdx);
    const mi = Number(meta.matchIdx);
    if(!Number.isFinite(gi) || !Number.isFinite(mi)) return null;
    const grp = (tn.groups||[])[gi];
    if(!grp) return null;
    const arr = grp.matches || [];
    const rec = arr[mi];
    if(!rec) return null;
    return { tn, grp, arr, gi, mi, rec };
  }catch(e){
    return null;
  }
}

function _findTourGroupMatchByMeta(meta){
  try{
    if(!meta || meta.sourceType !== 'tourGrp') return null;
    const tn = (typeof tourneys!=='undefined' ? tourneys : []).find(t=>String(t&&t.id||'')===String(meta.tnId||''));
    if(!tn) return null;
    const gi = Number(meta.grpIdx);
    const mi = Number(meta.matchIdx);
    if(!Number.isFinite(gi) || !Number.isFinite(mi)) return null;
    const grp = (tn.groups||[])[gi];
    if(!grp) return null;
    const arr = grp.matches || [];
    const rec = arr[mi];
    if(!rec) return null;
    return { tn, grp, arr, gi, mi, rec };
  }catch(e){
    return null;
  }
}

function deletePlayerRecentEditableSource(playerName, meta){
  if(!isLoggedIn || !meta) return;
  if(meta.sourceType === 'proTourStage'){
    const found = _findProTourStageRecordByMeta(meta);
    if(!found || !found.rec) return;
    if(!_guardRecentEdit(found.rec.d||'')) return;
    if(!confirm('이 경기 기록을 삭제할까요?\n\n⚠️ ELO와 승패 기록이 차감됩니다.')) return;
    try{
      if(typeof window.pcDeleteStageRec === 'function'){
        window.pcDeleteStageRec(found.tn.id, found.round, found.idx);
      }else{
        const m = found.rec;
        if(m && m.winner && m._id && typeof _revertProMatch === 'function') try{ _revertProMatch(m._id); }catch(e){}
        found.arr.splice(found.idx,1);
        save(); render();
      }
    }catch(e){
      alert('삭제 실패: '+e.message);
      return;
    }
    refreshPlayerModalIfOpen();
  }
  else if(meta.sourceType === 'proTourGrp'){
    const found=_findProTourGroupMatchByMeta(meta);
    if(!found || !found.rec) return;
    if(!_guardRecentEdit(found.rec.d||'')) return;
    if(!confirm('이 경기 기록을 삭제할까요?')) return;
    try{
      if(typeof window.proCompDelMatch === 'function'){
        window.proCompDelMatch(found.tn.id, found.gi, found.mi);
      }else{
        found.arr.splice(found.mi,1);
        save(); render();
      }
    }catch(e){
      alert('삭제 실패: '+(e&&e.message?e.message:e));
      return;
    }
    refreshPlayerModalIfOpen();
  }
  else if(meta.sourceType === 'tourGrp'){
    const found=_findTourGroupMatchByMeta(meta);
    if(!found || !found.rec) return;
    if(!_guardRecentEdit(found.rec.d||'')) return;
    if(!confirm('이 경기 기록을 삭제할까요?')) return;
    try{
      if(typeof window.grpDelMatch === 'function'){
        window.grpDelMatch(found.tn.id, found.gi, found.mi);
      }else{
        found.arr.splice(found.mi,1);
        save(); render();
      }
    }catch(e){
      alert('삭제 실패: '+(e&&e.message?e.message:e));
      return;
    }
    refreshPlayerModalIfOpen();
  }
  else if(meta.sourceType === 'tourBkt'){
    const tnId = meta.tnId || '';
    const r = Number(meta.rnd);
    const mi = Number(meta.mi);
    if(!tnId || !Number.isFinite(r) || !Number.isFinite(mi)) return;
    if(!_guardRecentEdit(meta.d||'')) {
      // date가 없으면 차단이 과할 수 있어, 실제 기록을 찾아서 날짜로 재검증
      try{
        const tn = (typeof tourneys!=='undefined'?tourneys:[]).find(t=>String(t&&t.id||'')===String(tnId));
        const det = tn && tn.bracket && tn.bracket.matchDetails && tn.bracket.matchDetails[`${r}-${mi}`];
        if(det && !_guardRecentEdit(det.d||'')) return;
      }catch(e){ return; }
    }
    if(!confirm('이 경기 결과를 삭제할까요?')) return;
    try{
      if(typeof window.bktClearMatchResult === 'function'){
        window.bktClearMatchResult(tnId, r, mi);
      }else{
        const tn = (typeof tourneys!=='undefined'?tourneys:[]).find(t=>String(t&&t.id||'')===String(tnId));
        if(tn && tn.bracket && tn.bracket.matchDetails && tn.bracket.matchDetails[`${r}-${mi}`]){
          const det = tn.bracket.matchDetails[`${r}-${mi}`];
          det.sa=null; det.sb=null; det.sets=[]; det.winner='';
          save(); render();
        }
      }
    }catch(e){
      alert('삭제 실패: '+(e&&e.message?e.message:e));
      return;
    }
    refreshPlayerModalIfOpen();
  }
  else if(meta.sourceType === 'proTourGj'){
    const tnId=meta.tnId||'';
    const gjIdx=Number(meta.gjIdx);
    if(!tnId || !Number.isFinite(gjIdx)) return;
    try{
      const tn=(typeof proTourneys!=='undefined'?proTourneys:[]).find(t=>String(t&&t.id||'')===String(tnId));
      const gm=tn && tn.gjMatches && tn.gjMatches[gjIdx];
      if(gm && !_guardRecentEdit(gm.d||'')) return;
    }catch(e){}
    if(!confirm('이 경기 기록을 삭제할까요?')) return;
    try{
      const tn=(typeof proTourneys!=='undefined'?proTourneys:[]).find(t=>String(t&&t.id||'')===String(tnId));
      if(tn && tn.gjMatches){
        const m=tn.gjMatches[gjIdx];
        if(m && m._id && typeof _revertProMatch === 'function') try{ _revertProMatch(m._id); }catch(e){}
        tn.gjMatches.splice(gjIdx,1);
        save(); render();
      }
    }catch(e){
      alert('삭제 실패: '+(e&&e.message?e.message:e));
      return;
    }
    refreshPlayerModalIfOpen();
  }
  else if(meta.sourceType === 'ind'){
    const idx=Number(meta.idx);
    if(!Number.isFinite(idx)) return;
    try{
      const m=(typeof indM!=='undefined'?indM:[])[idx];
      if(m && !_guardRecentEdit(m.d||'')) return;
    }catch(e){}
    if(!confirm('이 경기 기록을 삭제할까요?\n\n⚠️ ELO와 승패 기록이 차감됩니다.')) return;
    try{
      const m=(typeof indM!=='undefined'?indM:[])[idx];
      if(m){
        if(m._id && typeof _revertProMatch === 'function') try{ _revertProMatch(m._id); }catch(e){}
        indM.splice(idx,1);
        save(); render();
      }
    }catch(e){
      alert('삭제 실패: '+(e&&e.message?e.message:e));
      return;
    }
    refreshPlayerModalIfOpen();
  }
  else if(meta.sourceType === 'gj'){
    const idx=Number(meta.idx);
    if(!Number.isFinite(idx)) return;
    try{
      const m=(typeof gjM!=='undefined'?gjM:[])[idx];
      if(m && !_guardRecentEdit(m.d||'')) return;
    }catch(e){}
    if(!confirm('이 경기 기록을 삭제할까요?\n\n⚠️ ELO와 승패 기록이 차감됩니다.')) return;
    try{
      const m=(typeof gjM!=='undefined'?gjM:[])[idx];
      if(m){
        if(m._id && typeof _revertProMatch === 'function') try{ _revertProMatch(m._id); }catch(e){}
        gjM.splice(idx,1);
        save(); render();
      }
    }catch(e){
      alert('삭제 실패: '+(e&&e.message?e.message:e));
      return;
    }
    refreshPlayerModalIfOpen();
  }
}

function openPlayerRecentEditableSourceEdit(playerName, meta){
  if(!isLoggedIn || !meta) return;
  if(meta.sourceType === 'proTourStage'){
    const found = _findProTourStageRecordByMeta(meta);
    if(!found || !found.rec) return;
    const rec = found.rec;
    if(!_guardRecentEdit(rec.d||'')) return;
    const selfIsA = rec.a === playerName;
  const currentOpp = selfIsA ? rec.b : rec.a;
  const currentResult = ((selfIsA && rec.winner==='A') || (!selfIsA && rec.winner==='B')) ? '승' : '패';
  const mapOpts=maps.map(m=>`<option value="${m}">${m}</option>`).join('');
  document.getElementById('reTitle').textContent=`✏️ 경기 수정 — ${playerName} vs ${currentOpp||''}`;
  document.getElementById('reBody').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:8px">
      <div><label>날짜</label><input id="phe-date" type="date" value="${rec.d||''}" style="width:100%"></div>
      <div><label>결과</label>
        <select id="phe-result" style="width:100%">
          <option value="승"${currentResult==='승'?' selected':''}>승</option>
          <option value="패"${currentResult==='패'?' selected':''}>패</option>
        </select>
      </div>
      <div><label>상대 이름</label><input id="phe-opp" type="text" value="${currentOpp||''}" style="width:100%"></div>
      <div><label>맵</label>
        <div style="display:flex;gap:6px">
          <select id="phe-map-sel" data-pha-action="single-map-sync" style="flex:1"><option value="">목록에서 선택</option>${mapOpts}</select>
          <input id="phe-map" type="text" value="${!rec.map||rec.map==='-'?'':rec.map}" placeholder="맵 이름 직접 입력" style="flex:1">
        </div>
      </div>
      <div><label>메모</label><input id="phe-note" type="text" value="${(rec.note||'').replace(/"/g,'&quot;')}" style="width:100%"></div>
    </div>`;
  const saveBtnOrig=document.querySelector('#reModal .btn-b');
  if(saveBtnOrig){
    const _prevOnclick=saveBtnOrig['onclick'];
    saveBtnOrig['onclick']=function(){
      const newDate=document.getElementById('phe-date').value;
      const newResult=document.getElementById('phe-result').value;
      const newOpp=(document.getElementById('phe-opp').value||'').trim();
      const newMap=document.getElementById('phe-map').value||'-';
      const newNote=(document.getElementById('phe-note').value||'').trim();
      if(!newOpp){
        alert('상대 이름을 입력해주세요.');
        return;
      }
      try{
        if(rec && rec.winner && rec._id && typeof _revertProMatch === 'function') try{ _revertProMatch(rec._id); }catch(e){}
        if(selfIsA){
          rec.a = playerName;
          rec.b = newOpp;
          rec.winner = (newResult==='승') ? 'A' : 'B';
        }else{
          rec.a = newOpp;
          rec.b = playerName;
          rec.winner = (newResult==='승') ? 'B' : 'A';
        }
        rec.d = newDate || rec.d || '';
        rec.map = newMap;
        rec.note = newNote;
        if(rec.winner && typeof applyGameResult === 'function'){
          applyGameResult(rec.winner==='A'?rec.a:rec.b, rec.winner==='A'?rec.b:rec.a, rec.d||'', rec.map||'', rec._id, '', '', '프로리그대회');
        }
        saveBtnOrig['onclick']=_prevOnclick;
        if(typeof fixPoints==='function')fixPoints();
        save();
        render();
        cm('reModal');
        refreshPlayerModalIfOpen();
      }catch(e){
        alert('수정 실패: '+e.message);
      }
    };
  }
    om('reModal');
    return;
  }
  if(meta.sourceType === 'proTourGrp'){
    const found=_findProTourGroupMatchByMeta(meta);
    if(!found || !found.rec) return;
    if(!_guardRecentEdit(found.rec.d||'')) return;
    if(typeof window.proCompEditMatch === 'function'){
      window.proCompEditMatch(found.tn.id, found.gi, found.mi);
    }
    return;
  }
  if(meta.sourceType === 'tourGrp'){
    const found=_findTourGroupMatchByMeta(meta);
    if(!found || !found.rec) return;
    if(!_guardRecentEdit(found.rec.d||'')) return;
    if(typeof window.leagueEditMatch === 'function'){
      window.leagueEditMatch(found.tn.id, found.gi, found.mi);
    }
    return;
  }
  if(meta.sourceType === 'tourBkt'){
    const tnId=meta.tnId||'';
    const r=Number(meta.rnd);
    const mi=Number(meta.mi);
    if(!tnId || !Number.isFinite(r) || !Number.isFinite(mi)) return;
    // 날짜 가드(가능하면 실제 기록에서)
    try{
      const tn=(typeof tourneys!=='undefined'?tourneys:[]).find(t=>String(t&&t.id||'')===String(tnId));
      const det=tn && tn.bracket && tn.bracket.matchDetails && tn.bracket.matchDetails[`${r}-${mi}`];
      if(det && !_guardRecentEdit(det.d||'')) return;
    }catch(e){}
    const teamA = meta.teamA || '';
    const teamB = meta.teamB || '';
    if(typeof window.openBracketMatchModal === 'function'){
      window.openBracketMatchModal(tnId, r, mi, teamA, teamB);
    }
    return;
  }
  if(meta.sourceType === 'proTourGj'){
    const tnId=meta.tnId||'';
    const gjIdx=Number(meta.gjIdx);
    if(!tnId || !Number.isFinite(gjIdx)) return;
    // 날짜 가드(가능하면 실제 기록에서)
    try{
      const tn=(typeof proTourneys!=='undefined'?proTourneys:[]).find(t=>String(t&&t.id||'')===String(tnId));
      const gm=tn && tn.gjMatches && tn.gjMatches[gjIdx];
      if(gm && !_guardRecentEdit(gm.d||'')) return;
    }catch(e){}
    // 프로리그 끝장전은 pro-comp-edit.js의 GJ 섹션에서 수정 가능
    if(typeof window.proCompSub === 'function' && typeof window.render === 'function'){
      window.proCompSub='gj';
      window.render();
    }
    return;
  }
  if(meta.sourceType === 'ind'){
    const idx=Number(meta.idx);
    if(!Number.isFinite(idx)) return;
    try{
      const m=(typeof indM!=='undefined'?indM:[])[idx];
      if(m && !_guardRecentEdit(m.d||'')) return;
    }catch(e){}
    // 개인전은 tier-tour.js의 editRow 함수로 수정 (함수가 없으면 기존 편집 모달 사용)
    if(typeof window.editRow === 'function'){
      window.reMode='ind';
      window.reIdx=idx;
      window.editRow('ind',idx);
    }else{
      console.warn('[ind edit] editRow 함수가 존재하지 않습니다. 기존 편집 모달로 대체합니다.');
      // 기존 편집 모달로 대체
      return;
    }
    return;
  }
  if(meta.sourceType === 'gj'){
    const idx=Number(meta.idx);
    if(!Number.isFinite(idx)) return;
    try{
      const m=(typeof gjM!=='undefined'?gjM:[])[idx];
      if(m && !_guardRecentEdit(m.d||'')) return;
    }catch(e){}
    // 끝장전은 tier-tour.js의 editRow 함수로 수정 (함수가 없으면 기존 편집 모달 사용)
    if(typeof window.editRow === 'function'){
      window.reMode='gj';
      window.reIdx=idx;
      window.editRow('gj',idx);
    }else{
      console.warn('[gj edit] editRow 함수가 존재하지 않습니다. 기존 편집 모달로 대체합니다.');
      // 기존 편집 모달로 대체
      return;
    }
    return;
  }
}

function deletePlayerHist(playerName, histIdx){
  if(!isLoggedIn)return;
  if(!confirm('이 경기 기록을 삭제할까요?\n\n⚠️ ELO와 승패 기록이 차감됩니다.'))return;
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history||!p.history[histIdx])return;
  const hh=p.history[histIdx];
  if(!_guardRecentEdit(hh.date)) return;
  if(hh.eloDelta!=null) p.elo=(p.elo||ELO_DEFAULT)-hh.eloDelta;
  if(hh.result==='승'){ p.win=Math.max(0,(p.win||0)-1); p.points=(p.points||0)-3; }
  else { p.loss=Math.max(0,(p.loss||0)-1); p.points=(p.points||0)+3; }
  const opp=players.find(x=>x.name===hh.opp);
  if(opp){
    const oppHist=opp.history||[];
    const oppIdx=oppHist.findIndex(o=>o.opp===playerName&&o.date===hh.date&&o.map===hh.map);
    if(oppIdx>=0){
      const oh=oppHist[oppIdx];
      if(oh.eloDelta!=null) opp.elo=(opp.elo||ELO_DEFAULT)-oh.eloDelta;
      if(oh.result==='승'){ opp.win=Math.max(0,(opp.win||0)-1); opp.points=(opp.points||0)-3; }
      else { opp.loss=Math.max(0,(opp.loss||0)-1); opp.points=(opp.points||0)+3; }
      oppHist.splice(oppIdx,1);
    }
  }
  p.history.splice(histIdx,1);
  if(hh.matchId){
    const mid=String(hh.matchId||'').trim();
    const baseMid=mid.replace(/_s\d+_g\d+$/,'').replace(/_g\d+$/,'');
    const _targetIds=new Set([mid, baseMid].filter(Boolean));
    const _arrMap={mini:miniM,univm:univM,ck:ckM,pro:proM,tt:ttM};
    const _modeArrKey={'미니대전':'mini','시빌워':'mini','대학대전':'univm','대학CK':'ck','프로리그':'pro','티어대회':'tt'};
    const _targetKey=hh.mode?_modeArrKey[hh.mode]:null;
    const _searchArrs=_targetKey?[[_targetKey,_arrMap[_targetKey]]]:Object.entries(_arrMap);
    for(const [,arr] of _searchArrs){
      if(!arr)continue;
      const idx=arr.findIndex(m=>_targetIds.has(String(m&&m._id||'').trim()));
      if(idx>=0){
        try{
          if(hh.mode==='티어대회' && typeof window._rememberDeletedTierGeneralRestoreMatch === 'function'){
            window._rememberDeletedTierGeneralRestoreMatch(arr[idx]);
          }
        }catch(e){}
        arr.splice(idx,1);
        break;
      }
    }
  }
  if(hh.mode==='개인전'||hh.mode==='프로리그'||hh.mode==='끝장전'||hh.mode==='프로리그끝장전'){
    const targetArr=(hh.mode==='개인전'||hh.mode==='프로리그')?indM:gjM;
    if(targetArr){
      const idx=targetArr.findIndex(m=>m._id===hh.matchId||(m.d===hh.date&&m.map===hh.map&&((m.wName===playerName&&m.lName===hh.opp)||(m.lName===playerName&&m.wName===hh.opp))));
      if(idx>=0){ targetArr.splice(idx,1); }
    }
  }
  if(typeof fixPoints==='function')fixPoints();
  save();
  render();
  const pb=document.getElementById('playerModalBody');
  if(pb){
    const p=players.find(x=>x.name===playerName);
    if(p){
      const _fn = (typeof window.buildPlayerDetailHTML==='function')
        ? window.buildPlayerDetailHTML
        : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
      pb.innerHTML = _fn
        ? _fn(p)
        : `<div style="font-size:12px;color:var(--gray-l);padding:10px 0">스트리머 상세 렌더러가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.</div>`;
      injectUnivIcons(pb);
    }
  }
}

function deletePlayerHistBulk(playerName){
  if(!isLoggedIn)return;
  if(_playerHistBulkSelected.size===0){
    alert('선택된 경기 기록이 없습니다.');
    return;
  }
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history)return;
  const idxArr=[..._playerHistBulkSelected];
  const blocked = idxArr.filter(i=>p.history[i] && !_canEditByDate(p.history[i].date));
  if(blocked.length){
    alert('부관리자는 최근 2일 경기만 수정/삭제할 수 있습니다.');
    return;
  }
  if(!confirm(`${_playerHistBulkSelected.size}개의 경기 기록을 삭제할까요?\n\n⚠️ ELO와 승패 기록이 차감됩니다.`))return;
  const sortedIdx=[..._playerHistBulkSelected].sort((a,b)=>b-a);
  sortedIdx.forEach(idx=>{
    if(p.history[idx]){
      const hh=p.history[idx];
      if(hh.eloDelta!=null) p.elo=(p.elo||ELO_DEFAULT)-hh.eloDelta;
      if(hh.result==='승'){ p.win=Math.max(0,(p.win||0)-1); p.points=(p.points||0)-3; }
      else { p.loss=Math.max(0,(p.loss||0)-1); p.points=(p.points||0)+3; }
      const opp=players.find(x=>x.name===hh.opp);
      if(opp){
        const oppHist=opp.history||[];
        const oppIdx=oppHist.findIndex(o=>o.opp===playerName&&o.date===hh.date&&o.map===hh.map);
        if(oppIdx>=0){
          const oh=oppHist[oppIdx];
          if(oh.eloDelta!=null) opp.elo=(opp.elo||ELO_DEFAULT)-oh.eloDelta;
          if(oh.result==='승'){ opp.win=Math.max(0,(opp.win||0)-1); opp.points=(opp.points||0)-3; }
          else { opp.loss=Math.max(0,(opp.loss||0)-1); opp.points=(opp.points||0)+3; }
          oppHist.splice(oppIdx,1);
        }
      }
      if(hh.matchId){
        const mid=String(hh.matchId||'').trim();
        const baseMid=mid.replace(/_s\d+_g\d+$/,'').replace(/_g\d+$/,'');
        const ids=new Set([mid, baseMid].filter(Boolean));
        const arrMap={mini:miniM,univm:univM,ck:ckM,pro:proM,tt:ttM};
        const modeArrKey={'미니대전':'mini','시빌워':'mini','대학대전':'univm','대학CK':'ck','프로리그':'pro','티어대회':'tt'};
        const targetKey=hh.mode?modeArrKey[hh.mode]:null;
        const searchArrs=targetKey?[[targetKey,arrMap[targetKey]]]:Object.entries(arrMap);
        for(const [,arr] of searchArrs){
          if(!arr) continue;
          const arrIdx=arr.findIndex(m=>ids.has(String(m&&m._id||'').trim()));
          if(arrIdx>=0){
            try{
              if(hh.mode==='티어대회' && typeof window._rememberDeletedTierGeneralRestoreMatch === 'function'){
                window._rememberDeletedTierGeneralRestoreMatch(arr[arrIdx]);
              }
            }catch(e){}
            arr.splice(arrIdx,1);
            break;
          }
        }
      }
      p.history.splice(idx,1);
    }
  });
  _playerHistBulkSelected.clear();
  if(typeof fixPoints==='function')fixPoints();
  save();
  {
    const _fn = (typeof window.buildPlayerDetailHTML==='function')
      ? window.buildPlayerDetailHTML
      : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
    const pb = document.getElementById('playerModalBody');
    if(pb){
      pb.innerHTML = _fn
        ? _fn(p)
        : `<div style="font-size:12px;color:var(--gray-l);padding:10px 0">스트리머 상세 렌더러가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.</div>`;
      injectUnivIcons(pb);
    }
  }
}

function togglePlayerHistBulkMode(){
  _playerHistBulkMode=!_playerHistBulkMode;
  _playerHistBulkSelected.clear();
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(st.currentName||'');
}

function togglePlayerHistSelect(idx){
  if(_playerHistBulkSelected.has(idx)) _playerHistBulkSelected.delete(idx);
  else _playerHistBulkSelected.add(idx);
  const btn=document.getElementById('bulk-delete-btn');
  if(btn) btn.textContent=`🗑 선택 삭제 (${_playerHistBulkSelected.size})`;
}

function togglePlayerHistSelectAll(playerName, allIndices){
  const p=players.find(x=>x.name===playerName);
  const allowed = (p&&p.history)?allIndices.filter(i=>p.history[i] && _canEditByDate(p.history[i].date)):allIndices;
  if(_playerHistBulkSelected.size===allowed.length) _playerHistBulkSelected.clear();
  else allowed.forEach(idx=>_playerHistBulkSelected.add(idx));
  const btn=document.getElementById('bulk-delete-btn');
  if(btn) btn.textContent=`🗑 선택 삭제 (${_playerHistBulkSelected.size})`;
  const editBtn=document.getElementById('bulk-edit-btn');
  if(editBtn) editBtn.textContent=`✏️ 선택 수정 (${_playerHistBulkSelected.size})`;
  const checkboxes=document.querySelectorAll('.hist-select-checkbox');
  checkboxes.forEach(cb=>cb.checked=_playerHistBulkSelected.has(parseInt(cb.value)));
}

function openPlayerHistBulkEdit(playerName){
  if(!isLoggedIn)return;
  if(_playerHistBulkSelected.size===0){
    alert('선택된 경기 기록이 없습니다.');
    return;
  }
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history)return;
  const idxArr=[..._playerHistBulkSelected];
  const blocked = idxArr.filter(i=>p.history[i] && !_canEditByDate(p.history[i].date));
  if(blocked.length){
    alert('부관리자는 최근 2일 경기만 수정/삭제할 수 있습니다.');
    return;
  }
  const selectedHists=[..._playerHistBulkSelected].map(idx=>p.history[idx]).filter(Boolean);
  const allModes=[...new Set(selectedHists.map(h=>h.mode).filter(Boolean))];
  document.getElementById('reTitle').textContent=`✏️ 일괄 경기 수정 — ${playerName} (${_playerHistBulkSelected.size}개)`;
  document.getElementById('reBody').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:10px;font-size:11px;color:#92400e">⚠️ 선택된 ${_playerHistBulkSelected.size}개의 경기 기록을 일괄 수정합니다.</div>
      <div>
        <label style="font-weight:700;font-size:12px;margin-bottom:4px;display:block">종목 변경</label>
        <select id="phe-bulk-mode" style="width:100%">
          <option value="">변경 안함</option>
          ${allModes.map(m=>`<option value="${m}">${m} (현재값)</option>`).join('')}
          <option value="개인전">개인전</option><option value="프로리그">프로리그</option><option value="끝장전">끝장전</option><option value="미니대전">미니대전</option><option value="시빌워">시빌워</option><option value="대학대전">대학대전</option><option value="대학CK">대학CK</option><option value="티어대회">티어대회</option>
        </select>
      </div>
      <div>
        <label style="font-weight:700;font-size:12px;margin-bottom:4px;display:block">맵 변경</label>
        <div style="display:flex;gap:6px">
          <select id="phe-bulk-map-sel" data-pha-action="bulk-map-sync" style="flex:1">
            <option value="">목록에서 선택</option>
            ${maps.map(m=>`<option value="${m}">${m}</option>`).join('')}
          </select>
          <input id="phe-bulk-map" type="text" placeholder="또는 직접 입력" style="flex:1">
        </div>
      </div>
      <div>
        <label style="font-weight:700;font-size:12px;margin-bottom:4px;display:block">날짜 변경</label>
        <input id="phe-bulk-date" type="date" placeholder="YYYY-MM-DD" style="width:100%">
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-g" data-pha-action="bulk-save" data-pha-player="${(typeof escJS==='function') ? escJS(playerName) : String(playerName||'').replace(/'/g,"\\'")}" style="flex:1">저장</button>
        <button class="btn btn-w" data-pha-action="modal-cancel" style="flex:1">취소</button>
      </div>
    </div>
  `;
  om('reModal');
}

function savePlayerHistBulkEdit(playerName){
  if(!isLoggedIn)return;
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history)return;
  const idxArr=[..._playerHistBulkSelected];
  const blocked = idxArr.filter(i=>p.history[i] && !_canEditByDate(p.history[i].date));
  if(blocked.length){
    alert('부관리자는 최근 2일 경기만 수정/삭제할 수 있습니다.');
    return;
  }
  const newMode=document.getElementById('phe-bulk-mode').value;
  const newMap=document.getElementById('phe-bulk-map').value;
  const newDate=document.getElementById('phe-bulk-date').value;
  if(!newMode&&!newMap&&!newDate){
    alert('변경할 항목을 선택해주세요.');
    return;
  }
  if(!confirm(`${_playerHistBulkSelected.size}개의 경기 기록을 수정할까요?`))return;
  const sortedIdx=[..._playerHistBulkSelected].sort((a,b)=>b-a);
  sortedIdx.forEach(idx=>{
    if(p.history[idx]){
      const hh=p.history[idx];
      if(newMode) hh.mode=newMode;
      if(newMap) hh.map=newMap;
      if(newDate) hh.date=newDate;
    }
  });
  _playerHistBulkSelected.clear();
  save();
  render();
  cm('reModal');
  const pb=document.getElementById('playerModalBody');
  if(pb){
    const p=players.find(x=>x.name===playerName);
    if(p){
      const _fn = (typeof window.buildPlayerDetailHTML==='function')
        ? window.buildPlayerDetailHTML
        : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
      pb.innerHTML = _fn
        ? _fn(p)
        : `<div style="font-size:12px;color:var(--gray-l);padding:10px 0">스트리머 상세 렌더러가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.</div>`;
      injectUnivIcons(pb);
    }
  }
}

function openPlayerHistEdit(playerName, histIdx){
  if(!isLoggedIn)return;
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history||!p.history[histIdx])return;
  const hh=p.history[histIdx];
  if(!_guardRecentEdit(hh.date)) return;
  const races=['T','Z','P'];
  const mapOpts=maps.map(m=>`<option value="${m}">${m}</option>`).join('');
  document.getElementById('reTitle').textContent=`✏️ 경기 수정 — ${playerName} vs ${hh.opp}`;
  document.getElementById('reBody').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:8px">
      <div><label>날짜</label><input id="phe-date" type="date" value="${hh.date||''}" style="width:100%"></div>
      <div><label>결과</label>
        <select id="phe-result" style="width:100%">
          <option value="승"${hh.result==='승'?' selected':''}>승</option>
          <option value="패"${hh.result==='패'?' selected':''}>패</option>
        </select>
      </div>
      <div><label>상대 이름</label><input id="phe-opp" type="text" value="${hh.opp||''}" style="width:100%"></div>
      <div><label>상대 종족</label><select id="phe-race" style="width:100%">${races.map(r=>`<option value="${r}"${hh.oppRace===r?' selected':''}>${r}</option>`).join('')}</select></div>
      <div><label>맵</label>
        <div style="display:flex;gap:6px">
          <select id="phe-map-sel" data-pha-action="single-map-sync" style="flex:1"><option value="">목록에서 선택</option>${mapOpts}</select>
          <input id="phe-map" type="text" value="${!hh.map||hh.map==='-'?'':hh.map}" placeholder="맵 이름 직접 입력" style="flex:1">
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:2px">기록값: ${hh.map||'-'}</div>
      </div>
      <div><label>당시 소속 대학</label>
        <select id="phe-univ" style="width:100%">
          <option value="">미지정</option>
          ${getAllUnivs().map(u=>`<option value="${u.name}"${(hh.univ||p.univ)===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <div style="font-size:10px;color:var(--gray-l);margin-top:2px">현재: ${p.univ||'무소속'} · 기록: ${hh.univ||'(미저장)'}</div>
      </div>
    </div>`;
  const saveBtnOrig=document.querySelector('#reModal .btn-b');
  if(saveBtnOrig){
    const _prevOnclick=saveBtnOrig['onclick'];
    saveBtnOrig['onclick']=function(){
      const oldDate=hh.date, oldMap=hh.map, oldOpp=hh.opp, oldResult=hh.result;
      const newDate=document.getElementById('phe-date').value;
      const newResult=document.getElementById('phe-result').value;
      const newOpp=document.getElementById('phe-opp').value;
      const newRace=document.getElementById('phe-race').value;
      const newMap=document.getElementById('phe-map').value||'-';
      const _newUniv=document.getElementById('phe-univ')?.value;
      if(newResult!==oldResult){
        if(hh.eloDelta!=null) p.elo=(p.elo||ELO_DEFAULT)-hh.eloDelta;
        if(oldResult==='승'){p.win=Math.max(0,(p.win||0)-1);p.points=(p.points||0)-3;}
        else{p.loss=Math.max(0,(p.loss||0)-1);p.points=(p.points||0)+3;}
        const newDelta=hh.eloDelta!=null?-hh.eloDelta:null;
        if(newDelta!=null){p.elo=(p.elo||ELO_DEFAULT)+newDelta;hh.eloDelta=newDelta;}
        if(newResult==='승'){p.win=(p.win||0)+1;p.points=(p.points||0)+3;}
        else{p.loss=(p.loss||0)+1;p.points=(p.points||0)-3;}
      }
      hh.date=newDate; hh.result=newResult; hh.opp=newOpp; hh.oppRace=newRace; hh.map=newMap; if(_newUniv) hh.univ=_newUniv;
      const oppPlayer=players.find(x=>x.name===oldOpp);
      if(oppPlayer){
        const oppH=(oppPlayer.history||[]).find(o=>o.opp===playerName&&o.date===oldDate&&(o.map||'-')===(oldMap||'-'));
        if(oppH){
          oppH.date=newDate; oppH.map=newMap; if(newOpp!==oldOpp) oppH.opp=newOpp;
          if(newResult!==oldResult){
            const oppOldResult=oppH.result;
            if(oppH.eloDelta!=null) oppPlayer.elo=(oppPlayer.elo||ELO_DEFAULT)-oppH.eloDelta;
            if(oppOldResult==='승'){oppPlayer.win=Math.max(0,(oppPlayer.win||0)-1);oppPlayer.points=(oppPlayer.points||0)-3;}
            else{oppPlayer.loss=Math.max(0,(oppPlayer.loss||0)-1);oppPlayer.points=(oppPlayer.points||0)+3;}
            const newOppDelta=oppH.eloDelta!=null?-oppH.eloDelta:null;
            if(newOppDelta!=null){oppPlayer.elo=(oppPlayer.elo||ELO_DEFAULT)+newOppDelta;oppH.eloDelta=newOppDelta;}
            oppH.result=oppOldResult==='승'?'패':'승';
            if(oppH.result==='승'){oppPlayer.win=(oppPlayer.win||0)+1;oppPlayer.points=(oppPlayer.points||0)+3;}
            else{oppPlayer.loss=(oppPlayer.loss||0)+1;oppPlayer.points=(oppPlayer.points||0)-3;}
          }
        }
      }
      if(hh.matchId && newDate){
        const mid=hh.matchId;
        const _flatArrs=[miniM,univM,ckM,proM,comps, typeof gjM!=='undefined'?gjM:[], typeof indM!=='undefined'?indM:[]];
        let found=false;
        for(const arr of _flatArrs){
          if(!arr)continue;
          const entry=arr.find(m=>m._id===mid);
          if(entry){entry.d=newDate;found=true;break;}
        }
        if(!found && typeof tourneys!=='undefined'){
          outer: for(const tn of tourneys){
            for(const grp of (tn.groups||[])){
              for(const m of (grp.matches||[])){
                if(m._id===mid){m.d=newDate;found=true;break outer;}
              }
            }
            const br=tn.bracket||{};
            for(const m of Object.values(br.matchDetails||{})){ if(m&&m._id===mid){m.d=newDate;found=true;break outer;} }
            for(const m of (br.manualMatches||[])){ if(m&&m._id===mid){m.d=newDate;found=true;break outer;} }
          }
        }
      }
      saveBtnOrig['onclick']=_prevOnclick;
      if(typeof fixPoints==='function')fixPoints();
      save();
      render();
      cm('reModal');
      const pb=document.getElementById('playerModalBody');
      if(pb){
        const p=players.find(x=>x.name===playerName);
        if(p){
          const _fn = (typeof window.buildPlayerDetailHTML==='function')
            ? window.buildPlayerDetailHTML
            : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
          pb.innerHTML = _fn
            ? _fn(p)
            : `<div style="font-size:12px;color:var(--gray-l);padding:10px 0">스트리머 상세 렌더러가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.</div>`;
          injectUnivIcons(pb);
        }
      }
    };
  }
  om('reModal');
}

try{
  _bindPlayerHistoryModalDelegatedEvents();
  window.deletePlayerHist = deletePlayerHist;
  window.deletePlayerHistBulk = deletePlayerHistBulk;
  window.togglePlayerHistBulkMode = togglePlayerHistBulkMode;
  window.togglePlayerHistSelect = togglePlayerHistSelect;
  window.togglePlayerHistSelectAll = togglePlayerHistSelectAll;
  window.openPlayerHistBulkEdit = openPlayerHistBulkEdit;
  window.savePlayerHistBulkEdit = savePlayerHistBulkEdit;
  window.openPlayerHistEdit = openPlayerHistEdit;
  window.deletePlayerRecentEditableSource = deletePlayerRecentEditableSource;
  window.openPlayerRecentEditableSourceEdit = openPlayerRecentEditableSourceEdit;
  window._canEditByDate = _canEditByDate;
}catch(e){}
