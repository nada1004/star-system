function calcElo(winnerElo, loserElo){
  const exp=1/(1+Math.pow(10,(loserElo-winnerElo)/400));
  return Math.round(ELO_K*(1-exp));
}

function applyGameResult(winName, loseName, date, map, matchId, univW, univL, mode){
  // 정확한 이름 일치 우선, 없으면 메모 별명 fallback, 그 다음 공백 제거 후 일치
  function _findPlayer(name){
    let p=players.find(x=>x.name===name);
    if(p)return p;
    const low=name.toLowerCase();
    p=players.find(x=>x.memo&&x.memo.split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
    if(p)return p;
    const ns=name.replace(/\s+/g,'');
    return players.find(x=>x.name.replace(/\s+/g,'')===ns)||null;
  }
  const w=_findPlayer(winName);
  const l=_findPlayer(loseName);
  if(!w||!l||w===l)return;
  if(!w.history)w.history=[];
  if(!l.history)l.history=[];
  // 중복 체크: gameId(_sN_gN 포함)면 matchId 자체가 고유 → matchId만 비교
  // 경기 단위 matchId면 matchId+opp 조합으로 비교, 없으면 date+map+opp fallback
  const d=date||new Date().toISOString().slice(0,10);
  const m=map||'-';
  const isGameId=matchId&&matchId.includes('_s')&&matchId.includes('_g');
  const wDup=matchId
    ?(isGameId
      ?(w.history||[]).find(h=>h.matchId===matchId)
      :(w.history||[]).find(h=>h.matchId===matchId&&h.opp===l.name))
    :(w.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===l.name);
  const lDup=matchId
    ?(isGameId
      ?(l.history||[]).find(h=>h.matchId===matchId)
      :(l.history||[]).find(h=>h.matchId===matchId&&h.opp===w.name))
    :(l.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===w.name);
  if(wDup||lDup)return; // 이미 기록되어 있으면 중단
  w.win++;l.loss++;w.points+=3;l.points-=3;
  // ELO 계산
  const wElo=w.elo||ELO_DEFAULT;
  const lElo=l.elo||ELO_DEFAULT;
  const delta=calcElo(wElo,lElo);
  w.elo=wElo+delta;
  l.elo=lElo-delta;
  const t=Date.now();
  // 경기 시점 대학 저장 (나중에 대학을 옮겨도 당시 소속 대학으로 집계)
  const wu=univW||w.univ||'';
  const lu=univL||l.univ||'';
  w.history.unshift({date:d,time:t,result:'승',opp:l.name,oppRace:l.race,map:m,matchId:matchId||'',eloDelta:delta,eloAfter:w.elo,univ:wu,mode:mode||''});
  l.history.unshift({date:d,time:t,result:'패',opp:w.name,oppRace:w.race,map:m,matchId:matchId||'',eloDelta:-delta,eloAfter:l.elo,univ:lu,mode:mode||''});
}
