function preparePlayerHistoryBaseData(player){
  const p = player;
  const normMap = (v)=>{
    const s=String(v||'-');
    return s.replace(/^📍\s*/,'').trim() || '-';
  };
  const histDupKey = h=>{
    if(h?.matchId) return `mid:${h.matchId}`;
    const date = (h?.date||'').trim();
    const map = normMap(h?.map||'-');
    const opp = (h?.opp||'').trim();
    const mode = (h?.mode||'').trim();
    const result = (h?.result||'').trim();
    return `${date}|${map}|${[p.name,opp].filter(x=>x).sort().join('|')}|${mode}|${result}`;
  };
  const historySet=new Set();
  const dedupedHistory=(p.history||[]).filter(h=>{
    const k=histDupKey(h);
    if(historySet.has(k))return false;
    historySet.add(k);
    return true;
  });

  const normHistMode = (m)=>{
    const s=String(m||'').trim();
    if(s==='끝장전') return 'gj';
    if(s==='프로리그끝장전' || s==='프로리그대회끝장전') return 'gj_pro';
    if(s==='개인전') return 'ind';
    if(s==='프로리그') return 'ind_pro';
    return s;
  };
  const histNoResSet = new Set();
  dedupedHistory.forEach(h=>{
    const d=String(h?.date||'').trim();
    const map=normMap(h?.map||'-');
    const opp=String(h?.opp||'').trim();
    const mm=normHistMode(h?.mode||'');
    if(!d || !opp) return;
    const pair=[p.name, opp].filter(Boolean).sort().join('|');
    histNoResSet.add(`${d}|${map}|${pair}|${mm}`);
  });

  const hasDetailedKey=new Set();
  dedupedHistory.forEach(h=>{
    const mk=normMap(h?.map||'-');
    if(mk && mk!=='-'){
      hasDetailedKey.add(`${(h?.date||'').trim()}|${(h?.opp||'').trim()}|${(h?.mode||'').trim()}|${(h?.result||'').trim()}`);
    }
  });
  const prunedHistory=dedupedHistory.filter(h=>{
    const mk=normMap(h?.map||'-');
    if(mk && mk!=='-') return true;
    const k=`${(h?.date||'').trim()}|${(h?.opp||'').trim()}|${(h?.mode||'').trim()}|${(h?.result||'').trim()}`;
    return !hasDetailedKey.has(k);
  });

  const existsInGj = (h)=>{
    const arr = (typeof gjM!=='undefined' ? (gjM||[]) : []);
    const d=String(h?.date||'').trim();
    const map=normMap(h?.map||'-');
    const opp=String(h?.opp||'').trim();
    const res=String(h?.result||'').trim();
    if(h?.matchId && arr.some(m=>m._id===h.matchId)) return true;
    return arr.some(m=>{
      if((m.d||'')!==d) return false;
      if(normMap(m.map||'-')!==map) return false;
      const isWin = (res==='승');
      return isWin ? (m.wName===p.name && m.lName===opp) : (m.lName===p.name && m.wName===opp);
    });
  };
  const existsInInd = (h)=>{
    const arr = (typeof indM!=='undefined' ? (indM||[]) : []);
    const d=String(h?.date||'').trim();
    const map=normMap(h?.map||'-');
    const opp=String(h?.opp||'').trim();
    const res=String(h?.result||'').trim();
    const mode=String(h?.mode||'').trim();
    if(h?.matchId && arr.some(m=>m._id===h.matchId)) return true;
    return arr.some(m=>{
      if((m.d||'')!==d) return false;
      if(normMap(m.map||'-')!==map) return false;
      const isWin = (res==='승');
      const okPair = isWin ? (m.wName===p.name && m.lName===opp) : (m.lName===p.name && m.wName===opp);
      if(!okPair) return false;
      if(mode==='프로리그') return !!m._proLabel;
      if(mode==='개인전') return !m._proLabel;
      return true;
    });
  };
  const prunedHistory2=prunedHistory.filter(h=>{
    const mode=String(h?.mode||'').trim();
    const hasElo = h?.eloDelta!=null;
    if(hasElo) return true;
    if(mode==='끝장전' || mode==='프로리그끝장전') return existsInGj(h);
    if(mode==='개인전' || mode==='프로리그') return existsInInd(h);
    return true;
  });

  const existingMatchIds=new Set(prunedHistory2.map(h=>h.matchId).filter(Boolean));
  const existingKeys=new Set(prunedHistory2.map(h=>histDupKey(h)));

  return {
    normMap,
    histDupKey,
    dedupedHistory,
    histNoResSet,
    hasDetailedKey,
    prunedHistory,
    prunedHistory2,
    existingMatchIds,
    existingKeys,
  };
}

try{
  window.preparePlayerHistoryBaseData = preparePlayerHistoryBaseData;
}catch(e){}
