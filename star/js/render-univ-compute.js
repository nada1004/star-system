function prepareUnivDetailComputedData(opts){
  const {
    univName='',
    members=[]
  } = opts || {};
  // 소속 스트리머 목록의 승/패/승률은 스트리머 상세와 동일하게
  // 선수 개인 통합 전적(p.win/p.loss, 전체 대학·전체 경기종류 합산)을 그대로 반영한다.
  // (기존에는 이 대학 소속 + 특정 경기종류로만 필터링한 하위 집계를 써서 스트리머 상세와 수치가 달랐음)
  const _memberScopedSummary = (() => {
    const arr = Array.isArray(members) ? members : [];
    const byPlayer = {};
    let wins = 0, losses = 0, draws = 0, pts = 0;
    arr.forEach(p => {
      const w = Number(p?.win) || 0;
      const l = Number(p?.loss) || 0;
      const t = w + l;
      const wrP = t ? Math.round(w / t * 100) : 0;
      const ptsP = (w * 3) - (l * 3);
      const rec = { w, l, d: 0, tot: t, wr: wrP, pts: ptsP };
      const key = String(p?.name || '').trim();
      if(key) byPlayer[key] = rec;
      wins += w;
      losses += l;
      pts += ptsP;
    });
    const tot = wins + losses;
    const wr = tot ? Math.round(wins / tot * 100) : 0;
    return { byPlayer, wins, losses, draws, tot, wr, pts };
  })();
  const oppStats={};
  function addOpp(myU,oppU,myWin){
    if(myU!==univName)return;
    if(oppU===univName)return;
    if(!oppStats[oppU])oppStats[oppU]={w:0,l:0};
    if(myWin)oppStats[oppU].w++;else oppStats[oppU].l++;
  }
  (miniM||[]).forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  (univM||[]).forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  // 일반대회 일반경기 팀전적 반영
  if(typeof getNormalMatchesForHistory==='function'){
    getNormalMatchesForHistory().forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  }

  const scoped = _memberScopedSummary;
  const wins = scoped.wins || 0;
  const losses = scoped.losses || 0;
  const tot = scoped.tot || 0;
  const pts = scoped.pts || 0;
  const wr = scoped.wr || 0;

  // 조별리그 경기 수집 (tourneys.groups[].matches)
  const _grpMatches = [];
  if(typeof tourneys !== 'undefined' && Array.isArray(tourneys)){
    tourneys.forEach(tn=>{
      if(tn.type==='tier') return;
      (tn.groups||[]).forEach((grp,gi)=>{
        (grp.matches||[]).forEach(m=>{
          if(!m.a||!m.b||m.sa==null||m.sb==null) return;
          if(m.a!==univName&&m.b!==univName) return;
          const gl='ABCDEFGHIJ'[gi]||String(gi+1);
          _grpMatches.push({...m, mode:`조별리그(${gl}조)`, _compName:tn.name, _src:'grp'});
        });
      });
    });
  }

  // 일반대회 일반경기 수집 (tourneys.normalMatches)
  const _nmMatches = [];
  if(typeof getNormalMatchesForHistory==='function'){
    getNormalMatchesForHistory().forEach(m=>{
      if(!m.a||!m.b||m.sa==null||m.sb==null) return;
      if(m.a!==univName&&m.b!==univName) return;
      _nmMatches.push({...m, mode:`일반대회`, _compName:m.compName||m.n||''});
    });
  }

  // 일반대회 토너먼트(대진표) 경기 수집 (tourneys[].bracket.matchDetails)
  const _bktMatches = [];
  if(typeof tourneys !== 'undefined' && Array.isArray(tourneys)){
    // 브라켓 라운드 라벨 헬퍼
    const _bktRndLabel = (tn, key) => {
      try{
        const br = tn.bracket || {};
        const firstSize = (typeof _bktComputeBracketSize==='function')
          ? _bktComputeBracketSize(tn)
          : (Number(br.size)||8);
        let totalRounds = 0, n = Math.max(2, firstSize);
        while(n > 1){ n = Math.ceil(n/2); totalRounds++; }
        if(totalRounds <= 0) totalRounds = 1;
        const rndMap = {1:'결승',2:'4강',3:'8강',4:'16강',5:'32강',6:'64강'};
        const parts = String(key||'').split('-');
        const r = parseInt(parts[0], 10);
        if(Number.isNaN(r)||r<0) return '토너먼트';
        const rNum = totalRounds - r;
        return rndMap[rNum] || (Math.pow(2,rNum)+'강');
      }catch(e){ return '토너먼트'; }
    };
    tourneys.forEach(tn=>{
      if(tn.type==='tier') return;
      const br = tn.bracket || {};
      // matchDetails: 브라켓 대진표 경기
      Object.entries(br.matchDetails||{}).forEach(([key,m])=>{
        if(!m||!m.a||!m.b||m.sa==null||m.sb==null) return;
        if(m.a!==univName&&m.b!==univName) return;
        _bktMatches.push({
          ...m,
          mode:`대진표(${_bktRndLabel(tn,key)})`,
          _compName: tn.name,
          _src:'tour_bracket', _tnId:tn.id, _bktKey:key
        });
      });
    });
  }

  const myMatches=[
    ...(miniM||[]).filter(m=>m.type!=='civil'&&(m.a===univName||m.b===univName)).map(m=>({...m,mode:'미니대전'})),
    ...(univM||[]).filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'대학대전'})),
    ..._grpMatches,
    ..._nmMatches,
    ..._bktMatches,
  ].sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  const teamWins = myMatches.filter(m=>{
    const isA = m.a === univName;
    const myS = isA ? Number(m.sa) : Number(m.sb);
    const oppS = isA ? Number(m.sb) : Number(m.sa);
    return Number.isFinite(myS) && Number.isFinite(oppS) && myS > oppS;
  }).length;
  const teamLosses = myMatches.filter(m=>{
    const isA = m.a === univName;
    const myS = isA ? Number(m.sa) : Number(m.sb);
    const oppS = isA ? Number(m.sb) : Number(m.sa);
    return Number.isFinite(myS) && Number.isFinite(oppS) && myS < oppS;
  }).length;
  const teamTot = teamWins + teamLosses;
  const teamWr = teamTot ? Math.round(teamWins / teamTot * 100) : 0;

  return {
    oppStats,
    byPlayer: scoped.byPlayer || {},
    wins: teamWins,
    losses: teamLosses,
    tot: teamTot,
    pts,
    wr: teamWr,
    myMatches,
    playerWins: wins,
    playerLosses: losses,
    playerTot: tot,
    playerWr: wr
  };
}

try{
  window.prepareUnivDetailComputedData = prepareUnivDetailComputedData;
}catch(e){}
