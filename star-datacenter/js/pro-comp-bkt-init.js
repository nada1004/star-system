/* ══════════════════════════════════════════════════════════════
   프로리그 - 대진표 초기화/승자설정/삭제 (pro-comp-edit-bracket.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompInitBracket(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  // 각 조 1,2위 추출
  const seeds = [];
  tn.groups.forEach(grp => {
    const ranks = _calcProGrpRank(grp);
    if (ranks[0]) seeds.push(ranks[0].name);
    if (ranks[1]) seeds.push(ranks[1].name);
  });
  if (seeds.length < 2) { alert('대진표 생성을 위해 각 조에 선수가 필요합니다.'); return; }
  // 올림으로 2의 거듭제곱 맞춤
  let sz = 2;
  while (sz < seeds.length) sz *= 2;
  while (seeds.length < sz) seeds.push('TBD');
  // 1라운드 매치
  const firstRound = [];
  for (let i=0; i<sz; i+=2) firstRound.push({a:seeds[i], b:seeds[i+1], winner:'', d:'', map:''});
  // 이후 라운드 구성
  const rounds = [firstRound];
  let cur = firstRound.length;
  while (cur > 1) {
    cur = Math.floor(cur/2);
    const rnd = [];
    for (let i=0; i<cur; i++) rnd.push({a:'TBD', b:'TBD', winner:'', d:'', map:''});
    rounds.push(rnd);
  }
  tn.bracket = rounds;
  save(); render();
}

function proCompSetBktWinner(tnId, ri, mi, winner) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const _isByeMatch = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  // (요청사항) 부전승(BYE/TBD) 경기: 승자 전파만 하고 개인 전적/대전기록에는 반영하지 않음
  const byeSide =
    (!_isByeMatch(m.a) && _isByeMatch(m.b)) ? 'A'
    : (_isByeMatch(m.a) && !_isByeMatch(m.b)) ? 'B'
    : '';
  const prevWinner = m.winner;
  const tieId = `pbn_${tnId}_${ri}_${mi}_tie`;
  // 이전에 동률 저장이 있었다면, 승자 확정 시 동률 기록은 제거
  const hadTie = (!prevWinner && Array.isArray(m._games) && m._games.length>0 &&
    (m._games.filter(g=>g.winner==='A').length === m._games.filter(g=>g.winner==='B').length));
  m.winner = m.winner===winner ? '' : winner;
  const nextMi = Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    if (m.winner) {
      // 승자 전파
      const wName = m.winner==='A'?m.a:m.b;
      if (isA) next.a=wName; else next.b=wName;
    } else {
      // 승자 취소 시 다음 라운드 해당 슬롯 초기화 + 이후 라운드 연쇄 초기화
      if (isA) next.a='TBD'; else next.b='TBD';
      next.winner='';
      // 이후 라운드 연쇄 초기화
      let curMi=nextMi;
      for (let r=ri+2; r<tn.bracket.length; r++) {
        const nxt2Mi=Math.floor(curMi/2);
        const isA2=curMi%2===0;
        if (!tn.bracket[r]||!tn.bracket[r][nxt2Mi]) break;
        if (isA2) tn.bracket[r][nxt2Mi].a='TBD'; else tn.bracket[r][nxt2Mi].b='TBD';
        tn.bracket[r][nxt2Mi].winner='';
        curMi=nxt2Mi;
      }
    }
  }
  // 준결승 패자 시 3위전 자동 배정 (3위전이 추가된 경우에만)
  const semiRi = tn.bracket.length - 2;
  if (tn.thirdPlace && ri === semiRi && tn.bracket.length >= 2 && (mi === 0 || mi === 1)) {
    const thirdKey = `pbn_${tnId}_3rd`;
    if (tn.thirdPlace.winner) _revertProMatch(thirdKey);
    tn.thirdPlace.winner = '';
    const loser = m.winner==='A'?m.b:(m.winner==='B'?m.a:'');
    if (mi === 0) tn.thirdPlace.a = loser||'TBD';
    else tn.thirdPlace.b = loser||'TBD';
  }
  // player history 반영
  const bktMatchId = `pbn_${tnId}_${ri}_${mi}`;
  if(!byeSide && !_isByeMatch(m.a) && !_isByeMatch(m.b)){
    if (hadTie && m.winner) { try{ _revertDrawMatch(tieId); }catch(e){} }
    if (prevWinner && m.a && m.b) _revertProMatch(bktMatchId);
    _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
  }
  save(); render();
}

// (요청사항) 부전승 자동 처리: BYE/TBD 상대일 때 자동 승자 지정 + 다음 라운드 전파
function proCompApplyBye(tnId, ri, mi){
  const tn=_findTourneyById(tnId);
  const m=tn?.bracket?.[ri]?.[mi];
  if(!tn||!m) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  const side = (!isBye(m.a) && isBye(m.b)) ? 'A' : (isBye(m.a) && !isBye(m.b)) ? 'B' : '';
  if(!side) return alert('부전승 처리 가능한 경기가 아닙니다.');
  m.winner = side;
  const nextMi=Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    const wName = side==='A'?m.a:m.b;
    if (isA) next.a=wName; else next.b=wName;
  }
  save(); render();
}

// (요청사항) 특정 토너먼트 경기 삭제(초기화) + 히스토리 롤백 + 이후 라운드 전파 초기화
function proCompClearBktMatch(tnId, ri, mi){
  const tn=_findTourneyById(tnId);
  if(!tn||!tn.bracket||!tn.bracket[ri]||!tn.bracket[ri][mi]) return;
  const m=tn.bracket[ri][mi];
  if(!confirm('이 토너먼트 경기 기록을 삭제(초기화)할까요?')) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  const bktMatchId=`pbn_${tnId}_${ri}_${mi}`;
  const tieId = `${bktMatchId}_tie`;
  // 기존 히스토리 롤백 (BYE 제외)
  if(m.winner && !isBye(m.a) && !isBye(m.b)){
    try{ _revertProMatch(bktMatchId); }catch(e){}
  }
  // 동률(무승부) 기록도 롤백
  try{ _revertDrawMatch(tieId); }catch(e){}
  // 3위전 연결된 준결승이면 3위전도 초기화
  const semiRi = tn.bracket.length - 2;
  if(tn.thirdPlace && ri===semiRi && (mi===0||mi===1)){
    const thirdKey=`pbn_${tnId}_3rd`;
    if(tn.thirdPlace.winner) { try{ _revertProMatch(thirdKey); }catch(e){} }
    tn.thirdPlace.winner=''; tn.thirdPlace.map=''; tn.thirdPlace.d=''; tn.thirdPlace._games=[];
    if(mi===0) tn.thirdPlace.a='TBD';
    if(mi===1) tn.thirdPlace.b='TBD';
  }
  // 이 경기 초기화
  m.winner=''; m.map=''; m.d=''; m._games=[];
  // 다음 라운드 슬롯 초기화 + 이후 연쇄 초기화
  const nextMi=Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    if (isA) next.a='TBD'; else next.b='TBD';
    next.winner=''; next.map=''; next.d=''; next._games=[];
    let curMi=nextMi;
    for (let r=ri+2; r<tn.bracket.length; r++) {
      const nxt2Mi=Math.floor(curMi/2);
      const isA2=curMi%2===0;
      if (!tn.bracket[r]||!tn.bracket[r][nxt2Mi]) break;
      if (isA2) tn.bracket[r][nxt2Mi].a='TBD'; else tn.bracket[r][nxt2Mi].b='TBD';
      tn.bracket[r][nxt2Mi].winner=''; tn.bracket[r][nxt2Mi].map=''; tn.bracket[r][nxt2Mi].d=''; tn.bracket[r][nxt2Mi]._games=[];
      curMi=nxt2Mi;
    }
  }
  save(); render();
}

// (요청사항) 대진표 자체 삭제
function proCompDeleteBracket(tnId){
  const tn=_findTourneyById(tnId);
  if(!tn) return;
  if(!confirm('현재 대회의 대진표(토너먼트)를 삭제할까요?\n\n⚠️ 토너먼트 경기 결과/스트리머 최근 경기 반영도 함께 제거됩니다.')) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  const _rmRecordById = (mid)=>{
    if(!mid) return;
    try{
      const pi = (typeof proM!=='undefined'?proM:[]).findIndex(x=>x && x._id===mid);
      if(pi>=0) proM.splice(pi,1);
    }catch(e){}
    try{
      const ti = (typeof ttM!=='undefined'?ttM:[]).findIndex(x=>x && x._id===mid);
      if(ti>=0) ttM.splice(ti,1);
    }catch(e){}
  };
  const _buildMatchObj = (mid, m)=>{
    // revertMatchRecord가 gameMatchId(mid_s0_g#)까지 지울 수 있게 sets/games 구조로 구성
    const games = (m && Array.isArray(m._games) ? m._games : []);
    return {
      _id: mid,
      d: (m && m.d) ? m.d : '',
      sets: [{
        games: games.map(g=>({
          playerA: g.winName || '',
          playerB: g.loseName || '',
          winner: 'A',
          map: g.map || ''
        }))
      }]
    };
  };
  // 히스토리/기록 롤백 (player history + proM/ttM)
  (tn.bracket||[]).forEach((rnd,ri)=>{
    (rnd||[]).forEach((m,mi)=>{
      const mid = `pbn_${tnId}_${ri}_${mi}`;
      // 동률 저장(무승부) 롤백
      try{
        const hasGames = m && Array.isArray(m._games) && m._games.length>0;
        const sA = hasGames ? m._games.filter(g=>g.winner==='A').length : 0;
        const sB = hasGames ? m._games.filter(g=>g.winner==='B').length : 0;
        if(m && !m.winner && hasGames && sA===sB && (sA+sB)>0 && !isBye(m.a) && !isBye(m.b)){
          _revertDrawMatch(`${mid}_tie`);
        }
      }catch(e){}
      if(m && m.winner && !isBye(m.a) && !isBye(m.b)){
        try{
          if(typeof revertMatchRecord==='function') revertMatchRecord(_buildMatchObj(mid,m));
          else _revertProMatch(mid);
        }catch(e){}
        _rmRecordById(mid);
      }
    });
  });
  if(tn.thirdPlace && tn.thirdPlace.winner){
    const mid = `pbn_${tnId}_3rd`;
    try{
      if(typeof revertMatchRecord==='function') revertMatchRecord(_buildMatchObj(mid, tn.thirdPlace));
      else _revertProMatch(mid);
    }catch(e){}
    _rmRecordById(mid);
  }
  tn.bracket = [];
  tn.thirdPlace = null;
  tn.seedStarts = {};
  save(); render();
}

/* ══════════════════════════════════════════════════════════════
   대진표 결과 일괄 입력 (붙여넣기)
   ══════════════════════════════════════════════════════════════ */
