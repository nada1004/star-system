(function(){
  function _statsTodayYmd(){
    const fn = (typeof window._statsDateYmd==='function') ? window._statsDateYmd : (d=>'');
    return fn(new Date());
  }

  function _statsCurrentWeekRange(){
    const now=new Date();
    const day=(now.getDay()+6)%7;
    const start=new Date(now);
    start.setHours(0,0,0,0);
    start.setDate(start.getDate()-day);
    return { from:window._statsDateYmd(start), to:_statsTodayYmd() };
  }

  function _statsCurrentMonthRange(){
    const now=new Date();
    const start=new Date(now.getFullYear(), now.getMonth(), 1);
    return { from:window._statsDateYmd(start), to:_statsTodayYmd() };
  }

  function _statsInRange(dateStr, from, to){
    const d=String(dateStr||'').trim();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
    if(from && d<from) return false;
    if(to && d>to) return false;
    return true;
  }

  function _statsAnalyzePeriod(label, from, to){
    const sourceDefs = [
      {key:'mini', label:'미니대전', arr:(window.miniM||[]), team:false},
      {key:'univm', label:'대학대전', arr:(window.univM||[]), team:true},
      {key:'ck', label:'대학CK', arr:(window.ckM||[]), team:true},
      {key:'pro', label:'프로리그', arr:(window.proM||[]), team:true},
      {key:'ind', label:'개인전', arr:(window.indM||[]), team:false},
      {key:'gj', label:'끝장전', arr:(window.gjM||[]), team:false},
      {key:'comp', label:'대회', arr:(window.comps||[]), team:false},
      {key:'tt', label:'티어대회', arr:(window.ttM||[]), team:false},
    ];
    const bySource = [];
    let totalMatches=0, totalGames=0, teamMatches=0, soloMatches=0;
    const teamWins = new Map();
    sourceDefs.forEach(src=>{
      const arr = (src.arr||[]).filter(m=>_statsInRange(m?.d||m?.date||'', from, to));
      const count = arr.length;
      if(!count) return;
      totalMatches += count;
      if(src.team) teamMatches += count; else soloMatches += count;
      arr.forEach(m=>{
        const games = Array.isArray(m?.sets) ? m.sets.reduce((s,set)=>s + ((Array.isArray(set?.games)?set.games.length:0)), 0) : 0;
        totalGames += games || 1;
        if(src.team){
          const aName = String(m?.teamALabel || m?.a || '').trim();
          const bName = String(m?.teamBLabel || m?.b || '').trim();
          const sa = Number(m?.sa);
          const sb = Number(m?.sb);
          if(aName && sa>sb) teamWins.set(aName, (teamWins.get(aName)||0)+1);
          if(bName && sb>sa) teamWins.set(bName, (teamWins.get(bName)||0)+1);
        }
      });
      bySource.push({label:src.label, count, pct:0});
    });
    bySource.forEach(x=>{ x.pct = totalMatches ? Math.round(x.count/totalMatches*100) : 0; });
    bySource.sort((a,b)=>b.count-a.count);
    const activeDays = new Set();
    sourceDefs.forEach(src=>{
      (src.arr||[]).forEach(m=>{
        const d=String(m?.d||m?.date||'').trim();
        if(_statsInRange(d,from,to)) activeDays.add(d);
      });
    });
    const playerRows = ((window.players)||[]).map(p=>{
      const hist = ((p?.history)||[]).filter(h=>_statsInRange(h?.date||h?.d||'', from, to));
      const wins = hist.filter(h=>h?.result==='승').length;
      const losses = hist.filter(h=>h?.result==='패').length;
      const total = wins + losses;
      return total ? {name:p.name, univ:p.univ, wins, losses, total, rate:Math.round(wins/total*100)} : null;
    }).filter(Boolean);
    const topWinners = playerRows.slice().sort((a,b)=>b.wins-a.wins||b.total-a.total||a.name.localeCompare(b.name)).slice(0,5);
    const topPlayers = playerRows.slice().sort((a,b)=>b.total-a.total||b.wins-a.wins||a.name.localeCompare(b.name)).slice(0,5);
    const topTeams = [...teamWins.entries()].map(([name,wins])=>({name,wins})).sort((a,b)=>b.wins-a.wins||a.name.localeCompare(b.name)).slice(0,5);
    return {
      label, from, to, totalMatches, totalGames, teamMatches, soloMatches,
      activeDays: activeDays.size,
      bySource, topWinners, topPlayers, topTeams
    };
  }

  window._statsTodayYmd = _statsTodayYmd;
  window._statsCurrentWeekRange = _statsCurrentWeekRange;
  window._statsCurrentMonthRange = _statsCurrentMonthRange;
  window._statsInRange = _statsInRange;
  window._statsAnalyzePeriod = _statsAnalyzePeriod;
})();
