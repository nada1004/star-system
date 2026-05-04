function prepareUnivDetailComputedData(opts){
  const {
    univName='',
    members=[]
  } = opts || {};
  const oppStats={};
  function addOpp(myU,oppU,myWin){
    if(myU!==univName)return;
    if(oppU===univName)return;
    if(!oppStats[oppU])oppStats[oppU]={w:0,l:0};
    if(myWin)oppStats[oppU].w++;else oppStats[oppU].l++;
  }
  (miniM||[]).forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  (univM||[]).forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  (comps||[]).forEach(m=>{const a=m.a||m.u||'';addOpp(a,m.b,m.sa>m.sb);addOpp(m.b,a,m.sb>m.sa);});

  const scoped = (typeof calcMembersAffiliationSummary==='function')
    ? calcMembersAffiliationSummary(members, univName)
    : { byPlayer:{}, wins:0, losses:0, draws:0, tot:0, wr:0, pts:0 };
  const wins = scoped.wins || 0;
  const losses = scoped.losses || 0;
  const tot = scoped.tot || 0;
  const pts = scoped.pts || 0;
  const wr = scoped.wr || 0;

  const myMatches=[
    ...(miniM||[]).filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'미니대전'})),
    ...(univM||[]).filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'대학대전'})),
  ].sort((a,b)=>(b.d||'').localeCompare(a.d||''));

  return {
    oppStats,
    byPlayer: scoped.byPlayer || {},
    wins,
    losses,
    tot,
    pts,
    wr,
    myMatches
  };
}

try{
  window.prepareUnivDetailComputedData = prepareUnivDetailComputedData;
}catch(e){}
