/* ══════════════════════════════════════
   대전 기록 삭제 시 선수 스탯 완전 롤백
   - matchId 있으면 matchId로 정확히 제거
   - matchId 없으면(구 데이터) 날짜+상대 조합으로 제거
   - 어떤 경우에도 win/loss/points 차감
══════════════════════════════════════ */
function revertMatchRecord(matchObj){
  if(!matchObj||!matchObj.sets)return;
  const mid=matchObj._id||null;
  const mdate=matchObj.d||'';

  matchObj.sets.forEach(set=>{
    if(!set.games)return;
    set.games.forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wName=g.winner==='A'?g.playerA:g.playerB;
      const lName=g.winner==='A'?g.playerB:g.playerA;
      const w=players.find(p=>p.name===wName);
      const l=players.find(p=>p.name===lName);

      if(w){
        w.win=Math.max(0,(w.win||0)-1);
        w.points=(w.points||0)-3;
        // matchId 우선, 없으면 날짜+결과+상대 방식 (찾는 즉시 1건만 제거)
        let idx=-1;
        if(mid) idx=w.history.findIndex(h=>h.matchId===mid&&h.result==='승'&&h.opp===lName);
        if(idx<0) idx=w.history.findIndex(h=>h.result==='승'&&h.opp===lName&&h.date===mdate);
        if(idx<0) idx=w.history.findIndex(h=>h.result==='승'&&h.opp===lName);
        if(idx>=0){const hr=w.history[idx];if(hr.eloDelta!=null){w.elo=(w.elo||ELO_DEFAULT)-hr.eloDelta;}w.history.splice(idx,1);}
      }
      if(l){
        l.loss=Math.max(0,(l.loss||0)-1);
        l.points=(l.points||0)+3;
        let idx=-1;
        if(mid) idx=l.history.findIndex(h=>h.matchId===mid&&h.result==='패'&&h.opp===wName);
        if(idx<0) idx=l.history.findIndex(h=>h.result==='패'&&h.opp===wName&&h.date===mdate);
        if(idx<0) idx=l.history.findIndex(h=>h.result==='패'&&h.opp===wName);
        if(idx>=0){const hr=l.history[idx];if(hr.eloDelta!=null){l.elo=(l.elo||ELO_DEFAULT)-hr.eloDelta;}l.history.splice(idx,1);}
      }
    });
  });
}
