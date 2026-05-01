/* ══════════════════════════════════════
   Render Share Utilities
══════════════════════════════════════ */
function openBoardUnivShareCard(univName){
  if(!univName||univName==='전체')return;
  _shareMode='univ';
  _shareUnivSearch=univName;
  openShareCardModal();
  setTimeout(()=>renderShareCardByUniv(univName),80);
}

function openShareCardFromPlayer(){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const name=st.currentName;
  if(!name)return;
  cm('playerModal');
  _shareMode='player';
  _sharePlayerSearch=name;
  openShareCardModal();
  setTimeout(()=>renderShareCardByPlayer(name),80);
}

function openShareCardFromUniv(){
  const st = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  const name=st.currentName;
  if(!name)return;
  cm('univModal');
  _shareMode='univ';
  _shareUnivSearch=name;
  openShareCardModal();
  setTimeout(()=>renderShareCardByUniv(name),80);
}

function openProCompMatchShare(a,b,sa,sb,d){
  const A=String(a||'A팀'), B=String(b||'B팀');
  const ds=String(d||'').slice(0,10);
  const _eq=(x,y)=>String(x||'')===String(y||'');
  const _pairEq=(a1,b1,a2,b2)=>(_eq(a1,a2)&&_eq(b1,b2))||(_eq(a1,b2)&&_eq(b1,a2));
  const _invWinner=w=>w==='A'?'B':w==='B'?'A':w;

  let share={
    a:A,b:B,sa:Number(sa||0),sb:Number(sb||0),d:ds,
    n:'',_matchType:'pro',_subLabel:'프로리그',_noUnivIcon:false,_usePlayerPhoto:true
  };

  try{
    const tourneys=Array.isArray(proTourneys)?proTourneys:[];
    outerTeam:
    for(const tn of tourneys){
      for(const tm of (tn.teamMatches||[])){
        const tmd=String(tm.d||'').slice(0,10);
        if(ds && tmd && tmd!==ds) continue;
        if(!_pairEq(tm.teamAName, tm.teamBName, A, B)) continue;
        const swap = !_eq(tm.teamAName,A);
        const teamAName = swap ? (tm.teamBName||B) : (tm.teamAName||A);
        const teamBName = swap ? (tm.teamAName||A) : (tm.teamBName||B);
        const games=(tm.games||[]).map(g=>{
          const sideW = swap ? _invWinner(g._sideW) : g._sideW;
          if(sideW==='A') return { playerA:g.wName||'', playerB:g.lName||'', winner:'A', map:g.map||'' };
          if(sideW==='B') return { playerA:g.lName||'', playerB:g.wName||'', winner:'B', map:g.map||'' };
          return { playerA:g.lName||'', playerB:g.wName||'', winner:'', map:g.map||'' };
        }).filter(x=>x.playerA||x.playerB);
        const scoreA=games.filter(g=>g.winner==='A').length;
        const scoreB=games.filter(g=>g.winner==='B').length;
        share={
          a:teamAName,b:teamBName,sa:scoreA,sb:scoreB,d:tmd||ds,
          n:tn.name||'',_matchType:'procomp-team',_subLabel:(tn.name?`${tn.name} · 팀전`:'팀전'),
          _noUnivIcon:true,_usePlayerPhoto:false,
          sets:[{label:'팀전',scoreA,scoreB,games}]
        };
        break outerTeam;
      }
    }

    if(!share.sets){
      outerBkt:
      for(const tn of tourneys){
        const totalRnd=(tn.bracket||[]).length||0;
        const rndLabel = (ri)=>{
          if(ri==='3rd') return '3·4위전';
          const r=Number(ri);
          if(!isFinite(r) || totalRnd<=0) return '토너먼트';
          return r===totalRnd-1?'결승':r===totalRnd-2?'4강':r===totalRnd-3?'8강':`${Math.pow(2,totalRnd-r)}강`;
        };
        for(let ri=0; ri<(tn.bracket||[]).length; ri++){
          const rnd=tn.bracket[ri]||[];
          for(let mi=0; mi<rnd.length; mi++){
            const m=rnd[mi];
            if(!m||!m.a||!m.b) continue;
            const md=String(m.d||'').slice(0,10);
            if(ds && md && md!==ds) continue;
            if(!_pairEq(m.a,m.b,A,B)) continue;
            const swapped = _eq(m.a,B) && _eq(m.b,A);
            const gamesRaw = Array.isArray(m._games) && m._games.length ? m._games : [{winner:m.winner, map:m.map||''}];
            const games = gamesRaw.map(g=>({
              playerA:A,
              playerB:B,
              winner: swapped ? _invWinner(g.winner) : (g.winner||''),
              map: g.map||m.map||''
            })).filter(x=>x.playerA||x.playerB);
            const scoreA=games.filter(g=>g.winner==='A').length;
            const scoreB=games.filter(g=>g.winner==='B').length;
            const lbl=rndLabel(ri);
            share={
              a:A,b:B,sa:scoreA,sb:scoreB,d:md||ds,
              n:tn.name||'',_matchType:'procomp-bkt',_subLabel:(tn.name?`${tn.name} · ${lbl}`:lbl),
              _noUnivIcon:false,_usePlayerPhoto:true,
              sets:[{label:lbl,scoreA,scoreB,games}]
            };
            break outerBkt;
          }
        }
        if(tn.thirdPlace && tn.thirdPlace.a && tn.thirdPlace.b){
          const m=tn.thirdPlace;
          const md=String(m.d||'').slice(0,10);
          if(ds && md && md!==ds) continue;
          if(_pairEq(m.a,m.b,A,B)){
            const swapped = _eq(m.a,B) && _eq(m.b,A);
            const games = [{playerA:A,playerB:B,winner: swapped ? _invWinner(m.winner) : (m.winner||''), map:m.map||''}];
            const scoreA=games.filter(g=>g.winner==='A').length;
            const scoreB=games.filter(g=>g.winner==='B').length;
            const lbl=rndLabel('3rd');
            share={
              a:A,b:B,sa:scoreA,sb:scoreB,d:md||ds,
              n:tn.name||'',_matchType:'procomp-bkt',_subLabel:(tn.name?`${tn.name} · ${lbl}`:lbl),
              _noUnivIcon:false,_usePlayerPhoto:true,
              sets:[{label:lbl,scoreA,scoreB,games}]
            };
            break;
          }
        }
      }
    }

    if(!share.sets){
      outerGrp:
      for(const tn of tourneys){
        for(const grp of (tn.groups||[])){
          for(const m of (grp.matches||[])){
            if(!m||!m.a||!m.b) continue;
            const md=String(m.d||'').slice(0,10);
            if(ds && md && md!==ds) continue;
            if(!_pairEq(m.a,m.b,A,B)) continue;
            const swapped = _eq(m.a,B) && _eq(m.b,A);
            const winner = swapped ? _invWinner(m.winner) : (m.winner||'');
            const games=[{playerA:A,playerB:B,winner,map:m.map||''}];
            const scoreA=winner==='A'?1:0;
            const scoreB=winner==='B'?1:0;
            const lbl=(grp.stage||grp.name||'조별리그');
            share={
              a:A,b:B,sa:scoreA,sb:scoreB,d:md||ds,
              n:tn.name||'',_matchType:'pro',_subLabel:(tn.name?`${tn.name} · ${lbl}`:lbl),
              _noUnivIcon:false,_usePlayerPhoto:true,
              sets:[{label:lbl,scoreA,scoreB,games}]
            };
            break outerGrp;
          }
        }
      }
    }
  }catch(e){}

  window._shareMatchObj=share;
  _shareMode='match';
  openShareCardModal();
  setTimeout(function(){
    if(window._shareMatchObj) renderShareCardByMatchObj(window._shareMatchObj);
  },80);
}

function openShareCardFromMatch(mode,idx){
  const arr=mode==='mini'?miniM
    :mode==='univm'?univM
    :mode==='ck'?ckM
    :mode==='comp'?comps
    :mode==='pro'?proM
    :mode==='tt'?(typeof ttM!=='undefined'?ttM:[])
    :miniM;
  const m=arr[idx]||null;
  const isCKorPro=(mode==='ck'||mode==='pro');
  const isTier = (mode==='tt');
  const isTierTeamStyle = isTier && m && (
    (Array.isArray(m.teamAMembers) && m.teamAMembers.length) ||
    (Array.isArray(m.teamBMembers) && m.teamBMembers.length) ||
    (!m.a && !m.b) ||
    (String(m.a||'').trim()==='A팀' && String(m.b||'').trim()==='B팀')
  );
  window._shareMatchObj=m?{...m,
    _matchType:isCKorPro?mode:(isTier?'tt':''),
    _noUnivIcon:isCKorPro || isTierTeamStyle,
    _usePlayerPhoto:isTier ? (!isTierTeamStyle) : (m._usePlayerPhoto||false),
    ...(isTierTeamStyle ? {a:'A팀', b:'B팀'} : {})
  }:null;
  _shareMode='match';
  (async()=>{
    const ok = await _ensureStatsFeatureReady();
    if(!ok) return;
    if(typeof window.openShareCardModal==='function') window.openShareCardModal();
    setTimeout(()=>{
      try{
        if(window._shareMatchObj && typeof window.renderShareCardByMatchObj==='function'){
          window.renderShareCardByMatchObj(window._shareMatchObj);
        }
      }catch(e){}
    },80);
  })();
}

try{
  window.openBoardUnivShareCard = openBoardUnivShareCard;
  window.openShareCardFromPlayer = openShareCardFromPlayer;
  window.openShareCardFromUniv = openShareCardFromUniv;
  window.openProCompMatchShare = openProCompMatchShare;
  window.openShareCardFromMatch = openShareCardFromMatch;
}catch(e){}
