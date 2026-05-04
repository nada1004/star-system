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

  let wins=0, tot=0;
  players.forEach(p=>{
    (p.history||[]).forEach(h=>{
      if((h.univ||p.univ)===univName){
        tot++;
        if(h.result==='승') wins++;
      }
    });
  });
  const pts=(members||[]).reduce((s,p)=>s+p.points,0);
  const wr=tot?Math.round(wins/tot*100):0;

  const myMatches=[
    ...(miniM||[]).filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'미니대전'})),
    ...(univM||[]).filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'대학대전'})),
  ].sort((a,b)=>(b.d||'').localeCompare(a.d||''));

  return {
    oppStats,
    wins,
    tot,
    pts,
    wr,
    myMatches
  };
}

try{
  window.prepareUnivDetailComputedData = prepareUnivDetailComputedData;
}catch(e){}
