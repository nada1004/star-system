/* ══════════════════════════════════════
   대전 기록 삭제 시 선수 스탯 완전 롤백
   - matchId 있으면 matchId로 정확히 제거
   - matchId 없으면(구 데이터) 날짜+상대 조합으로 제거
   - 어떤 경우에도 win/loss/points 차감
══════════════════════════════════════ */
function revertMatchRecord(matchObj){
  if(!matchObj)return;
  const mid=matchObj._id||null;
  const mdate=matchObj.d||'';

  // ttM(티어대회 기록)에서도 동기화된 데이터 삭제
  if(mid){
    const ttIdx=ttM.findIndex(m=>m._id===mid);
    if(ttIdx>=0) ttM.splice(ttIdx,1);
  }

  // sets 없는 경우(스코어만 입력된 경기): matchId 기반으로 history에서 직접 제거
  if(!matchObj.sets||!matchObj.sets.length){
    if(!mid)return;
    players.forEach(p=>{
      if(!p.history)p.history=[];
      const idx=p.history.findIndex(h=>h.matchId===mid);
      if(idx>=0){
        const hr=p.history[idx];
        if(hr.result==='승'){p.win=Math.max(0,(p.win||0)-1);p.points=(p.points||0)-3;if(hr.eloDelta!=null)p.elo=(p.elo||ELO_DEFAULT)-hr.eloDelta;}
        else if(hr.result==='패'){p.loss=Math.max(0,(p.loss||0)-1);p.points=(p.points||0)+3;if(hr.eloDelta!=null)p.elo=(p.elo||ELO_DEFAULT)-hr.eloDelta;}
        p.history.splice(idx,1);
      }
    });
    return;
  }

  matchObj.sets.forEach(set=>{
    if(!set.games)return;
    set.games.forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wName=g.winner==='A'?g.playerA:g.playerB;
      const lName=g.winner==='A'?g.playerB:g.playerA;
      const w=players.find(p=>p.name===wName);
      const l=players.find(p=>p.name===lName);

      if(w){
        if(!w.history)w.history=[];
        let idx=-1;
        if(mid) idx=w.history.findIndex(h=>h.matchId===mid&&h.result==='승'&&h.opp===lName);
        if(idx<0) idx=w.history.findIndex(h=>h.result==='승'&&h.opp===lName&&h.date===mdate);
        if(idx<0){ idx=w.history.findIndex(h=>h.result==='승'&&h.opp===lName); if(idx>=0)console.warn('[revert] matchId/날짜 없이 상대명으로만 기록 삭제:', wName,'vs',lName,'— 여러 기록이 있으면 오래된 것부터 삭제됨'); }
        if(idx>=0){
          const hr=w.history[idx];
          w.win=Math.max(0,(w.win||0)-1);w.points=(w.points||0)-3;
          if(hr.eloDelta!=null){w.elo=(w.elo||ELO_DEFAULT)-hr.eloDelta;}
          w.history.splice(idx,1);
        }
      }
      if(l){
        if(!l.history)l.history=[];
        let idx=-1;
        if(mid) idx=l.history.findIndex(h=>h.matchId===mid&&h.result==='패'&&h.opp===wName);
        if(idx<0) idx=l.history.findIndex(h=>h.result==='패'&&h.opp===wName&&h.date===mdate);
        if(idx<0){ idx=l.history.findIndex(h=>h.result==='패'&&h.opp===wName); if(idx>=0)console.warn('[revert] matchId/날짜 없이 상대명으로만 기록 삭제:', lName,'vs',wName,'— 여러 기록이 있으면 오래된 것부터 삭제됨'); }
        if(idx>=0){
          const hr=l.history[idx];
          l.loss=Math.max(0,(l.loss||0)-1);l.points=(l.points||0)+3;
          if(hr.eloDelta!=null){l.elo=(l.elo||ELO_DEFAULT)-hr.eloDelta;}
          l.history.splice(idx,1);
        }
      }
    });
  });
}

/* ══════════════════════════════════════
   대회/티어대회 경기 → 선수 최근 기록 소급 동기화
   - tourneys의 모든 경기를 스캔해 p.history에 없는 것만 추가
   - 이미 반영된 경기(matchId 중복)는 건너뜀
══════════════════════════════════════ */
function syncTourneyHistory(){
  const existingIds=new Set();
  players.forEach(p=>{
    (p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});
  });

  let added=0;

  function processMatch(m, modeLabel){
    if(!m||!m._id)return;
    if(existingIds.has(m._id))return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const univW=g.winner==='A'?(m.a||''):(m.b||'');
        const univL=g.winner==='A'?(m.b||''):(m.a||'');
        applyGameResult(wn,ln,m.d,g.map||'',m._id,univW,univL,modeLabel);
        added++;
      });
    });
    existingIds.add(m._id);
  }

  tourneys.forEach(tn=>{
    const isTier=tn.type==='tier';
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>processMatch(m, isTier?'티어대회':'조별리그'));
    });
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>processMatch(m, isTier?'티어대회':'대회'));
    (br.manualMatches||[]).forEach(m=>{if(m)processMatch(m, isTier?'티어대회':'대회');});
  });

  if(added>0){save();}
  return added;
}

function syncTourneyHistoryBtn(){
  const n=syncTourneyHistory();
  if(n>0){alert('✅ '+n+'건의 경기가 선수 최근 기록에 소급 반영되었습니다.\n선수 상세 페이지에서 확인하세요.');render();}
  else{alert('✅ 이미 모든 대회 경기가 반영되어 있습니다.');}
}

function syncIndHistory(){
  console.log('syncIndHistory: Starting synchronization...');
  
  // Check if required variables are available
  if (typeof players === 'undefined') {
    console.error('syncIndHistory: players is undefined');
    return 0;
  }
  
  if (typeof indM === 'undefined') {
    console.error('syncIndHistory: indM is undefined');
    return 0;
  }
  
  if (typeof applyGameResult === 'undefined') {
    console.error('syncIndHistory: applyGameResult is undefined');
    return 0;
  }
  
  console.log('syncIndHistory: players length:', players.length);
  console.log('syncIndHistory: indM length:', indM.length);
  
  // already have matchId in history
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  console.log('syncIndHistory: existing matchIds count:', existingIds.size);
  
  let added=0;
  // indM (individual matches)
  indM.forEach(m=>{
    if(!m._id||!m.wName||!m.lName){
      console.warn('syncIndHistory: Skipping invalid match:', m);
      return;
    }
    if(existingIds.has(m._id)){
      return;
    }
    const mode=m._proLabel?'프로리그':'개인전';
    console.log('syncIndHistory: Processing match:', m._id, m.wName, 'vs', m.lName);
    try {
      applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
      existingIds.add(m._id);
      added++;
    } catch (error) {
      console.error('syncIndHistory: Error applying game result for match', m._id, ':', error);
    }
  });
  
  // gjM (end matches)
  if (typeof gjM !== 'undefined') {
    gjM.forEach(m=>{
      if(!m._id||!m.wName||!m.lName){
        console.warn('syncIndHistory: Skipping invalid gjM match:', m);
        return;
      }
      if(existingIds.has(m._id)){
        return;
      }
      const mode=m._proLabel?'프로리그끝장전':'끝장전';
      console.log('syncIndHistory: Processing gjM match:', m._id, m.wName, 'vs', m.lName);
      try {
        applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
        existingIds.add(m._id);
        added++;
      } catch (error) {
        console.error('syncIndHistory: Error applying gjM game result for match', m._id, ':', error);
      }
    });
  }
  
  if(added>0)save();
  console.log('syncIndHistory: Completed. Added', added, 'matches to history');
  return added;
}
function syncIndHistoryBtn(){
  const n=syncIndHistory();
  if(n>0){alert('✅ '+n+'건의 개인전/끝장전이 선수 최근 기록에 소급 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 개인전/끝장전 기록이 반영되어 있습니다.');}
}

/* ══════════════════════════════════════
   전체 대전 기록 → 선수 최근 기록 소급 동기화
   miniM, univM, ckM, proM, ttM, comps, indM, gjM, tourneys 모두 처리
══════════════════════════════════════ */
function syncAllHistory(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;

  // sets[].games[] 구조를 가진 매치 배열 처리 공통 함수
  function processSetsMatch(m, modeLabel, univAName, univBName){
    if(!m||!m._id)return;
    if(existingIds.has(m._id))return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const uW=g.winner==='A'?(univAName||m.a||''):(univBName||m.b||'');
        const uL=g.winner==='A'?(univBName||m.b||''):(univAName||m.a||'');
        applyGameResult(wn,ln,m.d||'',g.map||'',m._id,uW,uL,modeLabel);
        added++;
      });
    });
    existingIds.add(m._id);
  }

  // miniM (미니대전/시빌워)
  (typeof miniM!=='undefined'?miniM:[]).forEach(m=>{
    const label=m.type==='civil'?'시빌워':'미니대전';
    processSetsMatch(m, label, m.a, m.b);
  });

  // univM (대학대전)
  (typeof univM!=='undefined'?univM:[]).forEach(m=>processSetsMatch(m,'대학대전',m.a,m.b));

  // ckM (대학CK) — teamAMembers/teamBMembers로 소속 대학 결정
  (typeof ckM!=='undefined'?ckM:[]).forEach(m=>{
    if(!m||!m._id)return;
    if(existingIds.has(m._id))return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',m._id,wM?wM.univ||'':'',lM?lM.univ||'':'','대학CK');
        added++;
      });
    });
    existingIds.add(m._id);
  });

  // proM (프로리그) — teamAMembers/teamBMembers
  (typeof proM!=='undefined'?proM:[]).forEach(m=>{
    if(!m||!m._id)return;
    if(existingIds.has(m._id))return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',m._id,wM?wM.univ||'':'',lM?lM.univ||'':'','프로리그');
        added++;
      });
    });
    existingIds.add(m._id);
  });

  // ttM (티어대전) — sets[].games[] 구조
  (typeof ttM!=='undefined'?ttM:[]).forEach(m=>{
    if(!m||!m._id)return;
    if(existingIds.has(m._id))return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        applyGameResult(wn,ln,m.d||'',g.map||'',m._id,'','','티어대전');
        added++;
      });
    });
    existingIds.add(m._id);
  });

  // comps (조별리그/대회) — sets[].games[] 구조
  (typeof comps!=='undefined'?comps:[]).forEach(m=>processSetsMatch(m,'조별리그',m.a,m.b));

  // indM / gjM — wName/lName 직접 기록
  (typeof indM!=='undefined'?indM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'프로리그':'개인전';
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);added++;
  });
  (typeof gjM!=='undefined'?gjM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'프로리그끝장전':'끝장전';
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);added++;
  });

  // tourneys (대회/티어대회)
  function processTourneyMatch(m, modeLabel){
    if(!m||!m._id)return;
    if(existingIds.has(m._id))return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const univW=g.winner==='A'?(m.a||''):(m.b||'');
        const univL=g.winner==='A'?(m.b||''):(m.a||'');
        applyGameResult(wn,ln,m.d||'',g.map||'',m._id,univW,univL,modeLabel);
        added++;
      });
    });
    existingIds.add(m._id);
  }
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    const isTier=tn.type==='tier';
    (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>processTourneyMatch(m,isTier?'티어대회':'조별리그'));});
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>processTourneyMatch(m,isTier?'티어대회':'대회'));
    (br.manualMatches||[]).forEach(m=>{if(m)processTourneyMatch(m,isTier?'티어대회':'대회');});
  });

  if(added>0)save();
  return added;
}

function syncAllHistoryBtn(){
  if(!confirm('모든 대전 기록(미니/대학/CK/프로/티어/개인전/대회 등)을 스트리머 최근 경기에 소급 반영합니다.\n이미 반영된 경기는 중복 추가되지 않습니다.\n계속하시겠습니까?'))return;
  const n=syncAllHistory();
  if(n>0){alert('✅ '+n+'건의 경기가 스트리머 최근 경기에 소급 반영되었습니다.\n스트리머 상세 페이지에서 확인하세요.');render();}
  else{alert('✅ 이미 모든 기록이 반영되어 있습니다.');}
}
