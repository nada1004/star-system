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
