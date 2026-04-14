/* ══════════════════════════════════════
   🔧 기존 데이터 마이그레이션: 티어대전 → 티어대회
══════════════════════════════════════ */
let _tierTourNameMigrated = false;
function _migrateTierTourName(){
  if(_tierTourNameMigrated) return;
  _tierTourNameMigrated = true;
  let changed = false;
  players.forEach(p=>{
    if(!p.history) return;
    p.history.forEach(h=>{
      if(h.mode==='티어대전'){
        h.mode='티어대회';
        changed=true;
      }
    });
  });
  if(changed){
    save();
    console.log('[마이그레이션] 티어대전 → 티어대회 명칭 변경 완료');
  }
}

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

  matchObj.sets.forEach((set, si)=>{
    if(!set.games)return;
    set.games.forEach((g, gi)=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wName=g.winner==='A'?g.playerA:g.playerB;
      const lName=g.winner==='A'?g.playerB:g.playerA;
      const w=players.find(p=>p.name===wName);
      const l=players.find(p=>p.name===lName);
      // 게임 레벨 ID (새 포맷) 및 매치 레벨 ID (구 데이터) 모두 지원
      const gameMatchId=mid?`${mid}_s${si}_g${gi}`:null;

      if(w){
        if(!w.history)w.history=[];
        let idx=-1;
        if(gameMatchId) idx=w.history.findIndex(h=>h.matchId===gameMatchId&&h.result==='승'&&h.opp===lName);
        if(idx<0&&mid) idx=w.history.findIndex(h=>h.matchId===mid&&h.result==='승'&&h.opp===lName);
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
        if(gameMatchId) idx=l.history.findIndex(h=>h.matchId===gameMatchId&&h.result==='패'&&h.opp===wName);
        if(idx<0&&mid) idx=l.history.findIndex(h=>h.matchId===mid&&h.result==='패'&&h.opp===wName);
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
    (m.sets||[]).forEach((set, setIdx)=>{
      (set.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const univW=g.winner==='A'?(m.a||''):(m.b||'');
        const univL=g.winner==='A'?(m.b||''):(m.a||'');
        applyGameResult(wn,ln,m.d,g.map||'',gameMatchId,univW,univL,modeLabel);
        existingIds.add(gameMatchId);
        added++;
      });
    });
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
  // 이미 history에 있는 matchId 수집
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  // indM (개인전)
  (typeof indM!=='undefined'?indM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'프로리그':'개인전';
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);
    added++;
  });
  // gjM (끝장전)
  (typeof gjM!=='undefined'?gjM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'프로리그끝장전':'끝장전';
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);
    added++;
  });
  if(added>0)save();
  return added;
}
function syncIndHistoryBtn(){
  const n=syncIndHistory();
  if(n>0){alert('✅ '+n+'건의 개인전/끝장전이 선수 최근 기록에 소급 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 개인전/끝장전 기록이 반영되어 있습니다.');}
}

// 개별 소스별 동기화 함수들
function syncIndM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof indM!=='undefined'?indM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'프로리그':'개인전';
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);
    added++;
  });
  if(added>0)save();
  return added;
}
function syncGjM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof gjM!=='undefined'?gjM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'프로리그끝장전':'끝장전';
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);
    added++;
  });
  if(added>0)save();
  return added;
}
function syncMiniM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof miniM!=='undefined'?miniM:[]).forEach(m=>{
    if(!m._id)return;
    const label=m.type==='civil'?'시빌워':'미니대전';
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,m.a||'',m.b||'',label);
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncUnivM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof univM!=='undefined'?univM:[]).forEach(m=>{
    if(!m._id)return;
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const wUniv=g.winner==='A'?m.a:m.b;
        const lUniv=g.winner==='A'?m.b:m.a;
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wUniv,lUniv,'대학대전');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncCkM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof ckM!=='undefined'?ckM:[]).forEach(m=>{
    if(!m._id)return;
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wM?wM.univ||'':'',lM?lM.univ||'':'','대학CK');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncProM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof proM!=='undefined'?proM:[]).forEach(m=>{
    if(!m._id)return;
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wM?wM.univ||'':'',lM?lM.univ||'':'','프로리그');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncTtM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof ttM!=='undefined'?ttM:[]).forEach(m=>{
    if(!m._id)return;
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,m.a||'',m.b||'','티어대회');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncTourneys(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id)return;
        (m.sets||[]).forEach((s, setIdx)=>{
          (s.games||[]).forEach((g, gameIdx)=>{
            if(!g.playerA||!g.playerB||!g.winner)return;
            const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
            if(existingIds.has(gameMatchId))return;
            const wn=g.winner==='A'?g.playerA:g.playerB;
            const ln=g.winner==='A'?g.playerB:g.playerA;
            const mode=tn.type==='tier'?'티어대회':'조별리그';
            applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,m.a||'',m.b||'',mode);
            existingIds.add(gameMatchId);
            added++;
          });
        });
      });
    });
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if(!m._id)return;
      (m.sets||[]).forEach((s, setIdx)=>{
        (s.games||[]).forEach((g, gameIdx)=>{
          if(!g.playerA||!g.playerB||!g.winner)return;
          const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
          if(existingIds.has(gameMatchId))return;
          const wn=g.winner==='A'?g.playerA:g.playerB;
          const ln=g.winner==='A'?g.playerB:g.playerA;
          applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,m.a||'',m.b||'','대회');
          existingIds.add(gameMatchId);
          added++;
        });
      });
    });
  });
  if(added>0)save();
  return added;
}

// 개별 동기화 버튼 함수들
function syncIndMBtn(){
  const n=syncIndM();
  if(n>0){alert('✅ '+n+'건의 개인전 기록이 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 개인전 기록이 반영되어 있습니다.');}
}
function syncGjMBtn(){
  const n=syncGjM();
  if(n>0){alert('✅ '+n+'건의 끝장전 기록이 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 끝장전 기록이 반영되어 있습니다.');}
}
function syncMiniMBtn(){
  const n=syncMiniM();
  if(n>0){alert('✅ '+n+'건의 미니대전/시빌워 기록이 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 미니대전/시빌워 기록이 반영되어 있습니다.');}
}
function syncUnivMBtn(){
  const n=syncUnivM();
  if(n>0){alert('✅ '+n+'건의 대학대전 기록이 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 대학대전 기록이 반영되어 있습니다.');}
}
function syncCkMBtn(){
  const n=syncCkM();
  if(n>0){alert('✅ '+n+'건의 대학CK 기록이 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 대학CK 기록이 반영되어 있습니다.');}
}
function syncProMBtn(){
  const n=syncProM();
  if(n>0){alert('✅ '+n+'건의 프로리그 기록이 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 프로리그 기록이 반영되어 있습니다.');}
}
function syncTtMBtn(){
  const n=syncTtM();
  if(n>0){alert('✅ '+n+'건의 티어대회 기록이 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 티어대회 기록이 반영되어 있습니다.');}
}
function syncTourneysBtn(){
  const n=syncTourneys();
  if(n>0){alert('✅ '+n+'건의 대회 기록이 반영되었습니다.');render();}
  else{alert('✅ 이미 모든 대회 기록이 반영되어 있습니다.');}
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
    (m.sets||[]).forEach((set,setIdx)=>{
      (set.games||[]).forEach((g,gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        // 각 게임에 고유 matchId 부여 (matchId_setIndex_gameIndex)
        const gameMatchId = `${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const uW=g.winner==='A'?(univAName||m.a||''):(univBName||m.b||'');
        const uL=g.winner==='A'?(univBName||m.b||''):(univAName||m.a||'');
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,uW,uL,modeLabel);
        existingIds.add(gameMatchId);
        added++;
      });
    });
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
    (m.sets||[]).forEach((set,setIdx)=>{
      (set.games||[]).forEach((g,gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId = `${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wM?wM.univ||'':'',lM?lM.univ||'':'','대학CK');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });

  // proM (프로리그) — teamAMembers/teamBMembers
  (typeof proM!=='undefined'?proM:[]).forEach(m=>{
    if(!m||!m._id)return;
    (m.sets||[]).forEach((set,setIdx)=>{
      (set.games||[]).forEach((g,gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId = `${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wM?wM.univ||'':'',lM?lM.univ||'':'','프로리그');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });

  // ttM (티어대회) — sets[].games[] 구조
  (typeof ttM!=='undefined'?ttM:[]).forEach(m=>{
    if(!m||!m._id)return;
    (m.sets||[]).forEach((set,setIdx)=>{
      (set.games||[]).forEach((g,gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId = `${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,'','','티어대회');
        existingIds.add(gameMatchId);
        added++;
      });
    });
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
    (m.sets||[]).forEach((set, setIdx)=>{
      (set.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const univW=g.winner==='A'?(m.a||''):(m.b||'');
        const univL=g.winner==='A'?(m.b||''):(m.a||'');
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,univW,univL,modeLabel);
        existingIds.add(gameMatchId);
        added++;
      });
    });
  }
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    const isTier=tn.type==='tier';
    (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>processTourneyMatch(m,isTier?'티어대회':'조별리그'));});
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>processTourneyMatch(m,isTier?'티어대회':'대회'));
    (br.manualMatches||[]).forEach(m=>{if(m)processTourneyMatch(m,isTier?'티어대회':'대회');});
  });

  // tourneys(type=tier) 경기를 ttM에도 동기화
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn => {
    if(tn.type !== 'tier') return;
    // 조별리그
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if(!m||!m._id) return;
        const exists = ttM.some(x => x._id === m._id);
        if(!exists) {
          ttM.unshift({_id:m._id, d:m.d, a:m.a, b:m.b, sa:m.sa, sb:m.sb,
            sets:m.sets, n:tn.name, compName:tn.name,
            teamALabel:m.a, teamBLabel:m.b, stage:'league'});
          added++;
        }
      });
    });
    // 브라켓(토너먼트)
    const br = tn.bracket || {};
    [...Object.values(br.matchDetails||{}), ...(br.manualMatches||[])].forEach(m => {
      if(!m||!m._id) return;
      const exists = ttM.some(x => x._id === m._id);
      if(!exists) {
        ttM.unshift({_id:m._id, d:m.d, a:m.a, b:m.b, sa:m.sa, sb:m.sb,
          sets:m.sets, n:tn.name, compName:tn.name,
          teamALabel:m.a, teamBLabel:m.b, stage:'bkt'});
        added++;
      }
    });
  });

  if(added>0)save();
  return added;
}

/* ══════════════════════════════════════
   누락 기록 복구 — 승패/ELO 건드리지 않고 history 표시 항목만 추가
   (history가 잘려서 최근 기록이 안 보일 때 사용)
══════════════════════════════════════ */
function repairMissingHistory(){
  if(!confirm('승패/ELO는 변경하지 않고, 스트리머 최근 기록에서 누락된 표시 항목만 복구합니다.\n계속하시겠습니까?')) return;

  // 선수별 기존 matchId 수집
  const existingIds = {};
  players.forEach(p => {
    existingIds[p.name] = new Set((p.history||[]).map(h=>h.matchId).filter(Boolean));
  });

  let added = 0;

  function addEntry(wn, ln, date, map, matchId, univW, univL, mode) {
    const w = players.find(p=>p.name===wn);
    const l = players.find(p=>p.name===ln);
    if(!w||!l) return;
    if(!existingIds[wn]) existingIds[wn]=new Set();
    if(!existingIds[ln]) existingIds[ln]=new Set();
    if(!existingIds[wn].has(matchId)) {
      if(!w.history) w.history=[];
      w.history.push({date:date||'',result:'승',opp:ln,map:map||'-',matchId,univ:univW||w.univ||'',mode:mode||''});
      existingIds[wn].add(matchId);
      added++;
    }
    if(!existingIds[ln].has(matchId)) {
      if(!l.history) l.history=[];
      l.history.push({date:date||'',result:'패',opp:wn,map:map||'-',matchId,univ:univL||l.univ||'',mode:mode||''});
      existingIds[ln].add(matchId);
      added++;
    }
  }

  function processSets(m, mode) {
    if(!m||!m._id) return;
    (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const uW=g.winner==='A'?(m.a||''):(m.b||'');
      const uL=g.winner==='A'?(m.b||''):(m.a||'');
      addEntry(wn,ln,m.d,g.map,m._id,uW,uL,mode);
    }));
  }

  (typeof miniM!=='undefined'?miniM:[]).forEach(m=>processSets(m,m.type==='civil'?'시빌워':'미니대전'));
  (typeof univM!=='undefined'?univM:[]).forEach(m=>processSets(m,'대학대전'));
  (typeof ckM!=='undefined'?ckM:[]).forEach(m=>{
    if(!m||!m._id) return;
    (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const mA=m.teamAMembers||[],mB=m.teamBMembers||[];
      const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
      const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
      addEntry(wn,ln,m.d,g.map,m._id,wM?wM.univ||'':'',lM?lM.univ||'':'','대학CK');
    }));
  });
  (typeof proM!=='undefined'?proM:[]).forEach(m=>{
    if(!m||!m._id) return;
    (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const mA=m.teamAMembers||[],mB=m.teamBMembers||[];
      const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
      const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
      addEntry(wn,ln,m.d,g.map,m._id,wM?wM.univ||'':'',lM?lM.univ||'':'','프로리그');
    }));
  });
  (typeof indM!=='undefined'?indM:[]).forEach(m=>{
    if(!m||!m._id||!m.wName||!m.lName) return;
    addEntry(m.wName,m.lName,m.d,m.map,m._id,'','',m._proLabel?'프로리그':'개인전');
  });
  (typeof gjM!=='undefined'?gjM:[]).forEach(m=>{
    if(!m||!m._id||!m.wName||!m.lName) return;
    addEntry(m.wName,m.lName,m.d,m.map,m._id,'','',m._proLabel?'프로리그끝장전':'끝장전');
  });

  // 날짜순 정렬 (최신이 앞)
  players.forEach(p=>{
    if(p.history) p.history.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  });

  if(added>0){ save(); alert('✅ 누락 기록 복구 완료: '+added+'건 추가\n승패/ELO는 변경되지 않았습니다.'); render(); }
  else{ alert('✅ 누락된 기록이 없습니다.'); }
}

function syncAllHistoryBtn(){
  if(!confirm('모든 대전 기록(미니/대학/CK/프로/티어/개인전/대회 등)을 스트리머 최근 경기에 소급 반영합니다.\n이미 반영된 경기는 중복 추가되지 않습니다.\n계속하시겠습니까?'))return;
  const n=syncAllHistory();
  if(n>0){alert('✅ '+n+'건의 경기가 스트리머 최근 경기에 소급 반영되었습니다.\n스트리머 상세 페이지에서 확인하세요.');render();}
  else{alert('✅ 이미 모든 기록이 반영되어 있습니다.');}
}

/* ══════════════════════════════════════
   2025년 이전 경기 기록 일괄 삭제
   - miniM/univM/ckM/proM/indM/gjM/ttM 필터
   - player.history 필터 후 win/loss/points/ELO 재계산
══════════════════════════════════════ */
function cleanupPlayerHistoryDuplicates(){
  if(!confirm('모든 선수의 최근 경기 기록에서 중복을 제거하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.\n날짜+맵+상대+결과 조합으로 중복을 판단합니다.')) return;
  
  let totalRemoved = 0;
  
  players.forEach(p => {
    if(!p.history || !p.history.length) return;
    
    const seen = new Set();
    const deduped = [];
    
    p.history.forEach(h => {
      // 항상 복합 키 사용 (matchId 유무와 관계없이)
      const key = `${h.date||''}|${h.map||'-'}|${h.opp||''}|${h.result||''}`;
      
      if(seen.has(key)){
        totalRemoved++;
        // 중복 기록이면 승/패/포인트/ELO 차감
        if(h.result === '승'){
          p.win = Math.max(0, (p.win||0) - 1);
          p.points = (p.points||0) - 3;
        } else if(h.result === '패'){
          p.loss = Math.max(0, (p.loss||0) - 1);
          p.points = (p.points||0) + 3;
        }
        if(h.eloDelta != null){
          p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
        }
      } else {
        seen.add(key);
        deduped.push(h);
      }
    });
    
    p.history = deduped;
  });
  
  save();
  render();
  alert(`✅ 중복 제거 완료\n총 ${totalRemoved}건의 중복 기록이 제거되었습니다.`);
}

function purgeOldRecords(){
  const cutoff = '2026-01-01';
  const cutoffLabel = '2025년 12월 31일';
  if(!confirm(`⚠️ ${cutoffLabel} 이전 모든 경기 기록을 삭제합니다.\n\n삭제 대상:\n• 미니/대학/CK/프로/개인전/끝장전/티어 대전 기록\n• 스트리머 개인 기록(history)\n• 승패·포인트·ELO 재계산\n\n⚠️ 되돌릴 수 없습니다. 먼저 JSON 백업을 권장합니다.\n\n계속하시겠습니까?`)) return;

  const isNew = d => d && d >= cutoff;

  // 1) 경기 배열 필터
  const _filter = arr => { const keep = arr.filter(m => isNew(m.d)); arr.length=0; arr.push(...keep); };
  _filter(miniM);
  _filter(univM);
  _filter(ckM);
  _filter(proM);
  if(typeof indM!=='undefined') _filter(indM);
  if(typeof gjM!=='undefined')  _filter(gjM);
  if(typeof ttM!=='undefined')  _filter(ttM);

  // 2) 선수 history 필터 + 스탯 재계산
  let playerCount = 0;
  players.forEach(p => {
    if(!p.history || !p.history.length) return;
    const before = p.history.length;
    p.history = p.history.filter(h => h.date && h.date >= cutoff);
    if(p.history.length === before) return; // 변경 없음
    playerCount++;

    // 승/패/포인트 재계산
    p.win    = p.history.filter(h => h.result === '승').length;
    p.loss   = p.history.filter(h => h.result === '패').length;
    p.points = p.win * 3 - p.loss * 3;

    // ELO: history는 최신이 앞(unshift). [0]이 가장 최근 기록
    const lastH = p.history.find(h => h.eloAfter != null);
    p.elo = lastH ? lastH.eloAfter : (typeof ELO_DEFAULT!=='undefined' ? ELO_DEFAULT : 1500);
  });

  save();
  render();
  alert(`✅ ${cutoffLabel} 이전 기록 삭제 완료\n\n스트리머 ${playerCount}명 스탯 재계산 완료`);
}
