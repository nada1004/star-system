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
  // 일반대회 일반경기 팀전적 반영
  if(typeof getNormalMatchesForHistory==='function'){
    getNormalMatchesForHistory().forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  }

  const scoped = (typeof calcMembersAffiliationSummary==='function')
    ? calcMembersAffiliationSummary(members, univName)
    : { byPlayer:{}, wins:0, losses:0, draws:0, tot:0, wr:0, pts:0 };
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

  // comps (구형 대회 기록) 수집
  const _compOldMatches = [];
  (typeof comps!=='undefined' ? comps : []).forEach(m=>{
    const a = m.a||m.u||'';
    const b = m.b||'';
    if(!a||!b||m.sa==null||m.sb==null) return;
    if(a!==univName&&b!==univName) return;
    _compOldMatches.push({...m, a, b, mode:'대회(구)', _compName:m.n||m.compName||''});
  });

  const myMatches=[
    ...(miniM||[]).filter(m=>m.type!=='civil'&&(m.a===univName||m.b===univName)).map(m=>({...m,mode:'미니대전'})),
    ...(miniM||[]).filter(m=>m.type==='civil'&&(m.a===univName||m.b===univName)).map(m=>({...m,mode:'시빌워'})),
    ...(univM||[]).filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'대학대전'})),
    ..._grpMatches,
    ..._nmMatches,
    ..._bktMatches,
    ..._compOldMatches,
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
