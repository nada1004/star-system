function preparePlayerDetailComputedData(opts){
  const {
    player,
    histAll=[],
    year='',
    normMap=(v=>String(v||'-')),
    modeTint=10,
    cWin='#16a34a',
    cLoss='#dc2626'
  } = opts || {};
  const p = player;
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  if(!p){
    return {
      hist: [],
      modeHist: [],
      availYears: [],
      opps: {},
      vsUnivs: [],
      rv: {T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0},N:{w:0,l:0}},
      tot: 0,
      wr: 0,
      eloVal: ELO_DEFAULT,
      eloColor: '#16a34a',
      eloChartPts: [],
      fixedModes: [],
      modeColors: {},
      modeTint,
      cWin,
      cLoss
    };
  }
  const hist = year ? histAll.filter(h=>{
    const y=(h.date||'').slice(0,4);
    if(st.years&&st.years.length>0) return st.years.includes(y);
    return y.startsWith(year);
  }) : histAll;

  if(st.histFilter===undefined) st.histFilter='';
  const modeHist=(st.histFilters&&st.histFilters.length>0)
    ? hist.filter(hh=>st.histFilters.includes(hh.mode))
    : (st.histFilter ? hist.filter(hh=>hh.mode===st.histFilter) : hist);

  const availYears=[...new Set(histAll.map(h=>(h.date||'').slice(0,4)).filter(y=>y.length===4))].sort().reverse();
  const opps={},rv={T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0},N:{w:0,l:0}};
  const vsUnivs = calcPlayerVsUniversityRecords(p, { year, years: st.years||[] });
  modeHist.forEach(h=>{
    if(!opps[h.opp])opps[h.opp]={w:0,l:0,race:h.oppRace};
    if(h.result==='승'){opps[h.opp].w++;if(rv[h.oppRace])rv[h.oppRace].w++;}
    else{opps[h.opp].l++;if(rv[h.oppRace])rv[h.oppRace].l++;}
  });

  const tot=p.win+p.loss;
  const wr=tot?Math.round(p.win/tot*100):0;
  const eloVal=p.elo||ELO_DEFAULT;
  const eloColor=eloVal>=1400?'#7c3aed':eloVal>=1300?'#d97706':eloVal>=1200?'#16a34a':'#dc2626';
  const eloChartPts=modeHist.filter(h=>h.eloDelta!=null||h.eloAfter!=null);

  const modeColors={'미니대전':'#7c3aed','대학대전':'#2563eb','대학CK':'#dc2626','끝장전':'#8b5cf6','개인전':'#0891b2','티어대회':'#f59e0b','대회':'#d97706','프로리그':'#16a34a'};
  const histModeStats={};
  modeHist.forEach(hh=>{
    if(hh.mode){
      if(!histModeStats[hh.mode]) histModeStats[hh.mode]={w:0,l:0};
      if(hh.result==='승') histModeStats[hh.mode].w++;
      else histModeStats[hh.mode].l++;
    }
  });
  let compW=(histModeStats['대회']?.w||0)+(histModeStats['조별리그']?.w||0)+(histModeStats['토너먼트']?.w||0);
  let compL=(histModeStats['대회']?.l||0)+(histModeStats['조별리그']?.l||0)+(histModeStats['토너먼트']?.l||0);
  const histMatchIds=new Set(histAll.map(h=>h.matchId).filter(Boolean));
  function cGame(g,matchId){
    if(!g.playerA||!g.playerB||!g.winner)return;
    if(histMatchIds.has(matchId))return;
    const wn=g.winner==='A'?g.playerA:g.playerB;
    const ln=g.winner==='A'?g.playerB:g.playerA;
    if(wn===p.name) compW++;
    else if(ln===p.name) compL++;
  }
  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>cGame(g,m._id||''));});});});
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>cGame(g,m._id||''));});});
  });
  const gjW=(gjM||[]).filter(g=>g.wName===p.name&&(!year||(g.d||'').startsWith(year))).length;
  const gjL=(gjM||[]).filter(g=>g.lName===p.name&&(!year||(g.d||'').startsWith(year))).length;
  const fixedModes=[
    {key:'미니대전',w:histModeStats['미니대전']?.w||0,l:histModeStats['미니대전']?.l||0},
    {key:'대학대전',w:histModeStats['대학대전']?.w||0,l:histModeStats['대학대전']?.l||0},
    {key:'대학CK',w:histModeStats['대학CK']?.w||0,l:histModeStats['대학CK']?.l||0},
    {key:'끝장전',w:gjW,l:gjL},
    {key:'개인전',w:histModeStats['개인전']?.w||0,l:histModeStats['개인전']?.l||0},
    {key:'티어대회',w:histModeStats['티어대회']?.w||0,l:histModeStats['티어대회']?.l||0},
    {key:'대회',w:compW,l:compL},
    {key:'프로리그',w:histModeStats['프로리그']?.w||0,l:histModeStats['프로리그']?.l||0},
  ];

  return {
    hist,
    modeHist,
    availYears,
    opps,
    vsUnivs,
    rv,
    tot,
    wr,
    eloVal,
    eloColor,
    eloChartPts,
    fixedModes,
    modeColors,
    modeTint,
    cWin,
    cLoss
  };
}

function calcPlayerAffiliationRecord(player, univName, histSource){
  const p = player || {};
  const scopeUniv = String(univName||'').trim();
  const hist = Array.isArray(histSource) ? histSource : (Array.isArray(p.history) ? p.history : []);
  let w=0, l=0, d=0, pts=0;
  hist.forEach(h=>{
    if(String(h?.univ||'').trim() !== scopeUniv) return;
    if(h.result==='승'){ w++; pts+=3; }
    else if(h.result==='패'){ l++; pts-=3; }
    else if(h.result==='무'){ d++; }
  });
  const tot = w + l;
  const wr = tot ? Math.round(w / tot * 100) : 0;
  return { w, l, d, tot, wr, pts };
}

function calcMembersAffiliationSummary(members, univName){
  const arr = Array.isArray(members) ? members : [];
  const byPlayer = {};
  let wins=0, losses=0, draws=0, pts=0;
  arr.forEach(p=>{
    const rec = calcPlayerAffiliationRecord(p, univName, p?.history||[]);
    const key = String(p?.name||'').trim();
    if(key) byPlayer[key] = rec;
    wins += rec.w;
    losses += rec.l;
    draws += rec.d;
    pts += rec.pts;
  });
  const tot = wins + losses;
  const wr = tot ? Math.round(wins / tot * 100) : 0;
  return { byPlayer, wins, losses, draws, tot, wr, pts };
}

function calcPlayerAffiliationRecordsList(player, histSource){
  const p = player || {};
  const hist = Array.isArray(histSource) ? histSource : (Array.isArray(p.history) ? p.history : []);
  const order = [];
  const seen = new Set();
  hist.forEach(h=>{
    const u = String(h?.univ||'').trim();
    if(!u || seen.has(u)) return;
    seen.add(u);
    order.push(u);
  });
  if(p.univ && !seen.has(String(p.univ).trim())){
    order.unshift(String(p.univ).trim());
  }
  const list = order
    .map(univ=>({ univ, ...calcPlayerAffiliationRecord(p, univ, hist) }))
    .filter(row=>row.tot || row.d);
  list.sort((a,b)=>{
    if(String(a.univ)===String(p.univ||'')) return -1;
    if(String(b.univ)===String(p.univ||'')) return 1;
    return (b.tot - a.tot) || (b.w - a.w) || String(a.univ).localeCompare(String(b.univ), 'ko');
  });
  return list;
}

function calcPlayerVsUniversityRecords(player, opts){
  const p = player || {};
  const o = opts || {};
  const year = String(o.year || '').trim();
  const years = Array.isArray(o.years) ? o.years : [];
  const knownUnivs = new Set(((typeof univCfg!=='undefined' ? univCfg : (window.univCfg||[]))||[]).map(u=>String(u?.name||'').trim()).filter(Boolean));
  const passYear = (dateStr)=>{
    const y = String(dateStr||'').slice(0,4);
    if(years.length > 0) return years.includes(y);
    if(year) return y.startsWith(year);
    return true;
  };
  const map = new Map();
  const seenGameIds = new Set();
  const add = (univ, isWin, gameId)=>{
    const key = String(univ||'').trim();
    if(!key || key==='A팀' || key==='B팀' || (knownUnivs.size>0 && !knownUnivs.has(key))) return;
    const gid = String(gameId||'').trim();
    if(gid){
      if(seenGameIds.has(gid)) return;
      seenGameIds.add(gid);
    }
    const row = map.get(key) || { univ:key, w:0, l:0, tot:0, wr:0 };
    if(isWin) row.w++;
    else row.l++;
    row.tot = row.w + row.l;
    row.wr = row.tot ? Math.round(row.w / row.tot * 100) : 0;
    map.set(key, row);
  };
  const scanMatches = (arr, getSides, skipMatch)=>{
    (arr||[]).forEach(m=>{
      if(skipMatch && skipMatch(m)) return;
      if(!passYear(m?.d||'')) return;
      const sides = getSides ? getSides(m) : null;
      const sideA = String(sides?.a||'').trim();
      const sideB = String(sides?.b||'').trim();
      if(!sideA || !sideB) return;
      if((knownUnivs.size>0 && (!knownUnivs.has(sideA) || !knownUnivs.has(sideB)))) return;
      (m.sets||[]).forEach((set,setIdx)=>{
        (set.games||[]).forEach((g,gameIdx)=>{
          if(!g?.playerA || !g?.playerB || !g?.winner) return;
          const isA = g.playerA===p.name;
          const isB = g.playerB===p.name;
          if(!isA && !isB) return;
          const isWin = (isA && g.winner==='A') || (isB && g.winner==='B');
          const oppUniv = isA ? sideB : sideA;
          const gid = g._id || `${m._id||'m'}_s${setIdx}_g${gameIdx}`;
          add(oppUniv, isWin, gid);
        });
      });
    });
  };

  scanMatches((typeof miniM!=='undefined'?miniM:[]), (m)=>({a:m.a,b:m.b}), (m)=>m?.type==='civil' || (m?.a==='A팀' && m?.b==='B팀'));
  scanMatches((typeof univM!=='undefined'?univM:[]), (m)=>({a:m.a,b:m.b}));
  scanMatches((typeof comps!=='undefined'?comps:[]), (m)=>({a:(m.a||m.u||''),b:m.b}));
  (typeof tourneys!=='undefined' ? (tourneys||[]) : []).filter(tn=>tn && tn.type!=='tier').forEach(tn=>{
    scanMatches((tn.groups||[]).flatMap(grp=>grp.matches||[]), (m)=>({a:m.a,b:m.b}));
    scanMatches(Object.values((tn.bracket||{}).matchDetails||{}), (m)=>({a:m.a,b:m.b}));
    scanMatches(((tn.bracket||{}).manualMatches||[]), (m)=>({a:m.a,b:m.b}));
  });

  return [...map.values()].sort((a,b)=>(b.tot-a.tot)||(b.w-a.w)||String(a.univ).localeCompare(String(b.univ),'ko'));
}

try{
  window.preparePlayerDetailComputedData = preparePlayerDetailComputedData;
  window.calcPlayerAffiliationRecord = calcPlayerAffiliationRecord;
  window.calcMembersAffiliationSummary = calcMembersAffiliationSummary;
  window.calcPlayerAffiliationRecordsList = calcPlayerAffiliationRecordsList;
  window.calcPlayerVsUniversityRecords = calcPlayerVsUniversityRecords;
}catch(e){}
