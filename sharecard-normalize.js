(function(){
  window.SharecardModules = window.SharecardModules || {};

  function _winnerSide(raw, pa, pb){
    const w = String(raw||'').trim();
    if(!w) return '';
    if(w==='A' || w==='B') return w;
    if(w===pa) return 'A';
    if(w===pb) return 'B';
    return '';
  }

  function _normalizeGame(game, fallbackA, fallbackB){
    const g = game || {};
    const pa = String(g.playerA || g.wName || fallbackA || 'A').trim();
    const pb = String(g.playerB || g.lName || fallbackB || 'B').trim();
    const winner = _winnerSide(g.winner || g.wName || '', pa, pb);
    return {
      ...g,
      playerA: pa,
      playerB: pb,
      winner,
      map: g.map || ''
    };
  }

  function _normalizeGames(games, fallbackA, fallbackB){
    return (Array.isArray(games) ? games : [])
      .map(g=>_normalizeGame(g, fallbackA, fallbackB))
      .filter(g=>g.playerA || g.playerB || g.winner || g.map);
  }

  function _normalizeSet(set, idx, fallbackA, fallbackB){
    const src = set || {};
    const rawGames = Array.isArray(src.games) ? src.games
      : Array.isArray(src._games) ? src._games
      : Array.isArray(src.matches) ? src.matches
      : [];
    const games = _normalizeGames(rawGames, fallbackA, fallbackB);
    const scoreA = (src.scoreA!=null) ? (Number(src.scoreA)||0) : games.filter(g=>g.winner==='A').length;
    const scoreB = (src.scoreB!=null) ? (Number(src.scoreB)||0) : games.filter(g=>g.winner==='B').length;
    const winner = _winnerSide(src.winner || '', fallbackA, fallbackB) || (scoreA>scoreB ? 'A' : scoreB>scoreA ? 'B' : '');
    return {
      ...src,
      label: src.label!=null ? src.label : `${idx+1}세트`,
      games,
      scoreA,
      scoreB,
      winner
    };
  }

  function _distributeFlatGamesToSets(sets, flatGames, fallbackA, fallbackB){
    const games = _normalizeGames(flatGames, fallbackA, fallbackB);
    if(!Array.isArray(sets) || !sets.length || !games.length) return sets;
    let cursor = 0;
    return sets.map((set, idx)=>{
      const hasGames = Array.isArray(set?.games) && set.games.some(g=>g && (g.playerA || g.playerB || g.winner || g.map));
      if(hasGames) return set;
      const capacity = Math.max(0, (Number(set?.scoreA)||0) + (Number(set?.scoreB)||0));
      const take = capacity > 0 ? capacity : (idx===sets.length-1 ? (games.length-cursor) : 0);
      const picked = take > 0 ? games.slice(cursor, cursor + take) : [];
      cursor += picked.length;
      const scoreA = picked.filter(g=>g.winner==='A').length;
      const scoreB = picked.filter(g=>g.winner==='B').length;
      return {
        ...set,
        games: picked,
        scoreA: capacity>0 ? (Number(set?.scoreA)||0) : scoreA,
        scoreB: capacity>0 ? (Number(set?.scoreB)||0) : scoreB,
        winner: set?.winner || (scoreA>scoreB?'A':scoreB>scoreA?'B':'')
      };
    });
  }

  function _inferScoreMode(matchObj, sets){
    const sm = String(matchObj?.scoreMode || '').trim();
    if(sm==='set' || sm==='game') return sm;
    let setWins = 0;
    (sets||[]).forEach(s=>{
      if(s && (s.winner==='A' || s.winner==='B')) setWins += 1;
    });
    return setWins >= 2 ? 'set' : 'game';
  }

  function _calcScoreFromSets(sets, scoreMode){
    let sa = 0, sb = 0;
    (sets||[]).forEach(s=>{
      if(!s) return;
      if(scoreMode==='set'){
        if(s.winner==='A') sa += 1;
        else if(s.winner==='B') sb += 1;
      }else{
        sa += Number(s.scoreA)||0;
        sb += Number(s.scoreB)||0;
      }
    });
    return {sa, sb};
  }

  function normalizeShareMatchObjData(obj){
    try{
      const m = obj ? {...obj} : null;
      if(!m) return null;
      if(['ind','gj','progj'].includes(String(m._matchType||''))){
        m._usePlayerPhoto = true;
        m._noUnivIcon = false;
        if(m._subLabel==null) m._subLabel = '';
      }

      const A = String(m.a || m.pA || m.playerA || m.wName || 'A').trim();
      const B = String(m.b || m.pB || m.playerB || m.lName || 'B').trim();
      m.a = A;
      m.b = B;

      if(Array.isArray(m.sets) && m.sets.length){
        let sets = m.sets.map((s, i)=>_normalizeSet(s, i, A, B));
        const flatGames = Array.isArray(m.games) && m.games.length ? m.games : (Array.isArray(m._games) && m._games.length ? m._games.map(g=>({playerA:A, playerB:B, winner:g.winner, map:g.map||''})) : []);
        if(flatGames.length) sets = _distributeFlatGamesToSets(sets, flatGames, A, B);
        const scoreMode = _inferScoreMode(m, sets);
        const sc = _calcScoreFromSets(sets, scoreMode);
        m.sets = sets;
        m.scoreMode = scoreMode;
        m.sa = sc.sa;
        m.sb = sc.sb;
        return m;
      }

      if(Array.isArray(m.games) && m.games.length){
        const games = _normalizeGames(m.games, A, B);
        const sa = games.filter(g=>g.winner==='A').length;
        const sb = games.filter(g=>g.winner==='B').length;
        m.sa = sa; m.sb = sb;
        m.scoreMode = 'game';
        m.sets = [{ label:'1세트', scoreA: sa, scoreB: sb, winner: sa>sb?'A':sb>sa?'B':'', games }];
        return m;
      }

      if(m.wName || m.lName){
        const pa = A || String(m.wName||'').trim() || 'A';
        const pb = B || String(m.lName||'').trim() || 'B';
        const winnerSide = _winnerSide(m.wName || m.winner || '', pa, pb);
        m.a = pa; m.b = pb;
        m.sa = winnerSide==='A' ? 1 : 0;
        m.sb = winnerSide==='B' ? 1 : 0;
        m.scoreMode = 'game';
        m.sets = [{ label:'1세트', scoreA: m.sa, scoreB: m.sb, winner: winnerSide, games:[{ playerA: pa, playerB: pb, winner: winnerSide, map: m.map || '' }] }];
        return m;
      }

      return m;
    }catch(e){
      return obj || null;
    }
  }

  window._normalizeShareMatchObjData = normalizeShareMatchObjData;
  window.SharecardModules.normalize = {
    normalizeShareMatchObjData,
    calcScoreFromSets: _calcScoreFromSets
  };
})();
