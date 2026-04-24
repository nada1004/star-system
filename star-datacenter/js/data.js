/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   ?뵩 湲곗〈 ?곗씠??留덉씠洹몃젅?댁뀡: ?곗뼱??????곗뼱???
?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */
let _tierTourNameMigrated = false;
function _migrateTierTourName(){
  if(_tierTourNameMigrated) return;
  _tierTourNameMigrated = true;
  let changed = false;
  players.forEach(p=>{
    if(!p.history) return;
    p.history.forEach(h=>{
      if(h.mode==='?곗뼱???){
        h.mode='?곗뼱???;
        changed=true;
      }
    });
  });
  if(changed){
    save();
    if (!CONFIG.PROD) console.log('[留덉씠洹몃젅?댁뀡] ?곗뼱??????곗뼱???紐낆묶 蹂寃??꾨즺');
  }
}

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   ???湲곕줉 ??젣 ???좎닔 ?ㅽ꺈 ?꾩쟾 濡ㅻ갚
   - matchId ?덉쑝硫?matchId濡??뺥솗???쒓굅
   - matchId ?놁쑝硫?援??곗씠?? ?좎쭨+?곷? 議고빀?쇰줈 ?쒓굅
   - ?대뼡 寃쎌슦?먮룄 win/loss/points 李④컧
?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */
function revertMatchRecord(matchObj){
  if(!matchObj)return;
  const mid=matchObj._id||null;
  const mdate=matchObj.d||'';

  // ttM(?곗뼱???湲곕줉)?먯꽌???숆린?붾맂 ?곗씠????젣
  if(mid){
    const ttIdx=ttM.findIndex(m=>m._id===mid);
    if(ttIdx>=0) ttM.splice(ttIdx,1);
  }

  // sets ?녿뒗 寃쎌슦(?ㅼ퐫?대쭔 ?낅젰??寃쎄린): matchId 湲곕컲?쇰줈 history?먯꽌 吏곸젒 ?쒓굅
  if(!matchObj.sets||!matchObj.sets.length){
    if(!mid)return;
    players.forEach(p=>{
      if(!p.history)p.history=[];
      const idx=p.history.findIndex(h=>h.matchId===mid);
      if(idx>=0){
        const hr=p.history[idx];
        if(hr.result==='??){p.win=Math.max(0,(p.win||0)-1);p.points=(p.points||0)-3;if(hr.eloDelta!=null)p.elo=(p.elo||ELO_DEFAULT)-hr.eloDelta;}
        else if(hr.result==='??){p.loss=Math.max(0,(p.loss||0)-1);p.points=(p.points||0)+3;if(hr.eloDelta!=null)p.elo=(p.elo||ELO_DEFAULT)-hr.eloDelta;}
        p.history.splice(idx,1);
      }
    });
    return;
  }

  matchObj.sets.forEach((set, si)=>{
    if(!set.games)return;
    set.games.forEach((g, gi)=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wName=g.winner==='A'?g.playerA:g.playerB;
      const lName=g.winner==='A'?g.playerB:g.playerA;
      const w=players.find(p=>p.name===wName);
      const l=players.find(p=>p.name===lName);
      // 寃뚯엫 ?덈꺼 ID (???щ㎎) 諛?留ㅼ튂 ?덈꺼 ID (援??곗씠?? 紐⑤몢 吏??
      const gameMatchId=mid?`${mid}_s${si}_g${gi}`:null;

      if(w){
        if(!w.history)w.history=[];
        let idx=-1;
        if(gameMatchId) idx=w.history.findIndex(h=>h.matchId===gameMatchId&&h.result==='??&&h.opp===lName);
        if(idx<0&&mid) idx=w.history.findIndex(h=>h.matchId===mid&&h.result==='??&&h.opp===lName);
        if(idx<0) idx=w.history.findIndex(h=>h.result==='??&&h.opp===lName&&h.date===mdate);
        if(idx<0){ idx=w.history.findIndex(h=>h.result==='??&&h.opp===lName); if(idx>=0)console.warn('[revert] matchId/?좎쭨 ?놁씠 ?곷?紐낆쑝濡쒕쭔 湲곕줉 ??젣:', wName,'vs',lName,'???щ윭 湲곕줉???덉쑝硫??ㅻ옒??寃껊?????젣??); }
        if(idx>=0){
          const hr=w.history[idx];
          w.win=Math.max(0,(w.win||0)-1);w.points=(w.points||0)-3;
          if(hr.eloDelta!=null){w.elo=(w.elo||ELO_DEFAULT)-hr.eloDelta;}
          w.history.splice(idx,1);
        }
      }
      if(l){
        if(!l.history)l.history=[];
        let idx=-1;
        if(gameMatchId) idx=l.history.findIndex(h=>h.matchId===gameMatchId&&h.result==='??&&h.opp===wName);
        if(idx<0&&mid) idx=l.history.findIndex(h=>h.matchId===mid&&h.result==='??&&h.opp===wName);
        if(idx<0) idx=l.history.findIndex(h=>h.result==='??&&h.opp===wName&&h.date===mdate);
        if(idx<0){ idx=l.history.findIndex(h=>h.result==='??&&h.opp===wName); if(idx>=0)console.warn('[revert] matchId/?좎쭨 ?놁씠 ?곷?紐낆쑝濡쒕쭔 湲곕줉 ??젣:', lName,'vs',wName,'???щ윭 湲곕줉???덉쑝硫??ㅻ옒??寃껊?????젣??); }
        if(idx>=0){
          const hr=l.history[idx];
          l.loss=Math.max(0,(l.loss||0)-1);l.points=(l.points||0)+3;
          if(hr.eloDelta!=null){l.elo=(l.elo||ELO_DEFAULT)-hr.eloDelta;}
          l.history.splice(idx,1);
        }
      }
    });
  });
}

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   ????곗뼱???寃쎄린 ???좎닔 理쒓렐 湲곕줉 ?뚭툒 ?숆린??
   - tourneys??紐⑤뱺 寃쎄린瑜??ㅼ틪??p.history???녿뒗 寃껊쭔 異붽?
   - ?대? 諛섏쁺??寃쎄린(matchId 以묐났)??嫄대꼫?
?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */
function syncTourneyHistory(){
  const existingIds=new Set();
  players.forEach(p=>{
    (p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});
  });

  let added=0;

  function processMatch(m, modeLabel){
    if(!m||!m._id)return;
    (m.sets||[]).forEach((set, setIdx)=>{
      (set.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const univW=g.winner==='A'?(m.a||''):(m.b||'');
        const univL=g.winner==='A'?(m.b||''):(m.a||'');
        applyGameResult(wn,ln,m.d,g.map||'',gameMatchId,univW,univL,modeLabel);
        existingIds.add(gameMatchId);
        added++;
      });
    });
  }

  tourneys.forEach(tn=>{
    const isTier=tn.type==='tier';
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>processMatch(m, isTier?'?곗뼱???:'議곕퀎由ш렇'));
    });
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>processMatch(m, isTier?'?곗뼱???:'???));
    (br.manualMatches||[]).forEach(m=>{if(m)processMatch(m, isTier?'?곗뼱???:'???);});
  });

  if(added>0){save();}
  return added;
}

function syncTourneyHistoryBtn(){
  const n=syncTourneyHistory();
  if(n>0){alert('??'+n+'嫄댁쓽 寃쎄린媛 ?좎닔 理쒓렐 湲곕줉???뚭툒 諛섏쁺?섏뿀?듬땲??\n?좎닔 ?곸꽭 ?섏씠吏?먯꽌 ?뺤씤?섏꽭??');render();}
  else{alert('???대? 紐⑤뱺 ???寃쎄린媛 諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}

function syncIndHistory(){
  // ?대? history???덈뒗 matchId ?섏쭛
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  // indM (媛쒖씤??
  (typeof indM!=='undefined'?indM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'?꾨줈由ш렇':'媛쒖씤??;
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);
    added++;
  });
  // gjM (?앹옣??
  (typeof gjM!=='undefined'?gjM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'?꾨줈由ш렇?앹옣??:'?앹옣??;
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);
    added++;
  });
  if(added>0)save();
  return added;
}
function syncIndHistoryBtn(){
  const n=syncIndHistory();
  if(n>0){alert('??'+n+'嫄댁쓽 媛쒖씤???앹옣?꾩씠 ?좎닔 理쒓렐 湲곕줉???뚭툒 諛섏쁺?섏뿀?듬땲??');render();}
  else{alert('???대? 紐⑤뱺 媛쒖씤???앹옣??湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}

// 媛쒕퀎 ?뚯뒪蹂??숆린???⑥닔??
function syncIndM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof indM!=='undefined'?indM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'?꾨줈由ш렇':'媛쒖씤??;
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);
    added++;
  });
  if(added>0)save();
  return added;
}
function syncGjM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof gjM!=='undefined'?gjM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'?꾨줈由ш렇?앹옣??:'?앹옣??;
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);
    added++;
  });
  if(added>0)save();
  return added;
}
function syncMiniM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof miniM!=='undefined'?miniM:[]).forEach(m=>{
    if(!m._id)return;
    const label=m.type==='civil'?'?쒕퉴??:'誘몃땲???;
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,m.a||'',m.b||'',label);
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncUnivM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof univM!=='undefined'?univM:[]).forEach(m=>{
    if(!m._id)return;
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const wUniv=g.winner==='A'?m.a:m.b;
        const lUniv=g.winner==='A'?m.b:m.a;
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wUniv,lUniv,'??숇???);
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncCkM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof ckM!=='undefined'?ckM:[]).forEach(m=>{
    if(!m._id)return;
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wM?wM.univ||'':'',lM?lM.univ||'':'','??섴K');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncProM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof proM!=='undefined'?proM:[]).forEach(m=>{
    if(!m._id)return;
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wM?wM.univ||'':'',lM?lM.univ||'':'','?꾨줈由ш렇');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncTtM(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof ttM!=='undefined'?ttM:[]).forEach(m=>{
    if(!m._id)return;
    (m.sets||[]).forEach((s, setIdx)=>{
      (s.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,m.a||'',m.b||'','?곗뼱???);
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });
  if(added>0)save();
  return added;
}
function syncTourneys(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id)return;
        (m.sets||[]).forEach((s, setIdx)=>{
          (s.games||[]).forEach((g, gameIdx)=>{
            if(!g.playerA||!g.playerB||!g.winner)return;
            const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
            if(existingIds.has(gameMatchId))return;
            const wn=g.winner==='A'?g.playerA:g.playerB;
            const ln=g.winner==='A'?g.playerB:g.playerA;
            const mode=tn.type==='tier'?'?곗뼱???:'議곕퀎由ш렇';
            applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,m.a||'',m.b||'',mode);
            existingIds.add(gameMatchId);
            added++;
          });
        });
      });
    });
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if(!m._id)return;
      (m.sets||[]).forEach((s, setIdx)=>{
        (s.games||[]).forEach((g, gameIdx)=>{
          if(!g.playerA||!g.playerB||!g.winner)return;
          const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
          if(existingIds.has(gameMatchId))return;
          const wn=g.winner==='A'?g.playerA:g.playerB;
          const ln=g.winner==='A'?g.playerB:g.playerA;
          applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,m.a||'',m.b||'','???);
          existingIds.add(gameMatchId);
          added++;
        });
      });
    });
  });
  if(added>0)save();
  return added;
}

// 媛쒕퀎 ?숆린??踰꾪듉 ?⑥닔??
function syncIndMBtn(){
  const n=syncIndM();
  if(n>0){alert('??'+n+'嫄댁쓽 媛쒖씤??湲곕줉??諛섏쁺?섏뿀?듬땲??');render();}
  else{alert('???대? 紐⑤뱺 媛쒖씤??湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}
function syncGjMBtn(){
  const n=syncGjM();
  if(n>0){alert('??'+n+'嫄댁쓽 ?앹옣??湲곕줉??諛섏쁺?섏뿀?듬땲??');render();}
  else{alert('???대? 紐⑤뱺 ?앹옣??湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}
function syncMiniMBtn(){
  const n=syncMiniM();
  if(n>0){alert('??'+n+'嫄댁쓽 誘몃땲????쒕퉴??湲곕줉??諛섏쁺?섏뿀?듬땲??');render();}
  else{alert('???대? 紐⑤뱺 誘몃땲????쒕퉴??湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}
function syncUnivMBtn(){
  const n=syncUnivM();
  if(n>0){alert('??'+n+'嫄댁쓽 ??숇???湲곕줉??諛섏쁺?섏뿀?듬땲??');render();}
  else{alert('???대? 紐⑤뱺 ??숇???湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}
function syncCkMBtn(){
  const n=syncCkM();
  if(n>0){alert('??'+n+'嫄댁쓽 ??섴K 湲곕줉??諛섏쁺?섏뿀?듬땲??');render();}
  else{alert('???대? 紐⑤뱺 ??섴K 湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}
function syncProMBtn(){
  const n=syncProM();
  if(n>0){alert('??'+n+'嫄댁쓽 ?꾨줈由ш렇 湲곕줉??諛섏쁺?섏뿀?듬땲??');render();}
  else{alert('???대? 紐⑤뱺 ?꾨줈由ш렇 湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}
function syncTtMBtn(){
  const n=syncTtM();
  if(n>0){alert('??'+n+'嫄댁쓽 ?곗뼱???湲곕줉??諛섏쁺?섏뿀?듬땲??');render();}
  else{alert('???대? 紐⑤뱺 ?곗뼱???湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}
function syncTourneysBtn(){
  const n=syncTourneys();
  if(n>0){alert('??'+n+'嫄댁쓽 ???湲곕줉??諛섏쁺?섏뿀?듬땲??');render();}
  else{alert('???대? 紐⑤뱺 ???湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   ?꾩껜 ???湲곕줉 ???좎닔 理쒓렐 湲곕줉 ?뚭툒 ?숆린??
   miniM, univM, ckM, proM, ttM, comps, indM, gjM, tourneys 紐⑤몢 泥섎━
?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */
function syncAllHistory(){
  const existingIds=new Set();
  players.forEach(p=>{(p.history||[]).forEach(h=>{if(h.matchId)existingIds.add(h.matchId);});});
  let added=0;

  // sets[].games[] 援ъ“瑜?媛吏?留ㅼ튂 諛곗뿴 泥섎━ 怨듯넻 ?⑥닔
  function processSetsMatch(m, modeLabel, univAName, univBName){
    if(!m||!m._id)return;
    (m.sets||[]).forEach((set,setIdx)=>{
      (set.games||[]).forEach((g,gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        // 媛?寃뚯엫??怨좎쑀 matchId 遺??(matchId_setIndex_gameIndex)
        const gameMatchId = `${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const uW=g.winner==='A'?(univAName||m.a||''):(univBName||m.b||'');
        const uL=g.winner==='A'?(univBName||m.b||''):(univAName||m.a||'');
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,uW,uL,modeLabel);
        existingIds.add(gameMatchId);
        added++;
      });
    });
  }

  // miniM (誘몃땲????쒕퉴??
  (typeof miniM!=='undefined'?miniM:[]).forEach(m=>{
    const label=m.type==='civil'?'?쒕퉴??:'誘몃땲???;
    processSetsMatch(m, label, m.a, m.b);
  });

  // univM (??숇???
  (typeof univM!=='undefined'?univM:[]).forEach(m=>processSetsMatch(m,'??숇???,m.a,m.b));

  // ckM (??섴K) ??teamAMembers/teamBMembers濡??뚯냽 ???寃곗젙
  (typeof ckM!=='undefined'?ckM:[]).forEach(m=>{
    if(!m||!m._id)return;
    (m.sets||[]).forEach((set,setIdx)=>{
      (set.games||[]).forEach((g,gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId = `${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wM?wM.univ||'':'',lM?lM.univ||'':'','??섴K');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });

  // proM (?꾨줈由ш렇) ??teamAMembers/teamBMembers
  (typeof proM!=='undefined'?proM:[]).forEach(m=>{
    if(!m||!m._id)return;
    (m.sets||[]).forEach((set,setIdx)=>{
      (set.games||[]).forEach((g,gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId = `${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
        const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
        const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,wM?wM.univ||'':'',lM?lM.univ||'':'','?꾨줈由ш렇');
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });

  // ttM (?곗뼱??? ??sets[].games[] 援ъ“
  (typeof ttM!=='undefined'?ttM:[]).forEach(m=>{
    if(!m||!m._id)return;
    (m.sets||[]).forEach((set,setIdx)=>{
      (set.games||[]).forEach((g,gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId = `${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,'','','?곗뼱???);
        existingIds.add(gameMatchId);
        added++;
      });
    });
  });

  // comps (議곕퀎由ш렇/??? ??sets[].games[] 援ъ“
  (typeof comps!=='undefined'?comps:[]).forEach(m=>processSetsMatch(m,'議곕퀎由ш렇',m.a,m.b));

  // indM / gjM ??wName/lName 吏곸젒 湲곕줉
  (typeof indM!=='undefined'?indM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'?꾨줈由ш렇':'媛쒖씤??;
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);added++;
  });
  (typeof gjM!=='undefined'?gjM:[]).forEach(m=>{
    if(!m._id||!m.wName||!m.lName)return;
    if(existingIds.has(m._id))return;
    const mode=m._proLabel?'?꾨줈由ш렇?앹옣??:'?앹옣??;
    applyGameResult(m.wName,m.lName,m.d||'',m.map||'',m._id,'','',mode);
    existingIds.add(m._id);added++;
  });

  // tourneys (????곗뼱???
  function processTourneyMatch(m, modeLabel){
    if(!m||!m._id)return;
    (m.sets||[]).forEach((set, setIdx)=>{
      (set.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const gameMatchId=`${m._id}_s${setIdx}_g${gameIdx}`;
        if(existingIds.has(gameMatchId))return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const univW=g.winner==='A'?(m.a||''):(m.b||'');
        const univL=g.winner==='A'?(m.b||''):(m.a||'');
        applyGameResult(wn,ln,m.d||'',g.map||'',gameMatchId,univW,univL,modeLabel);
        existingIds.add(gameMatchId);
        added++;
      });
    });
  }
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    const isTier=tn.type==='tier';
    (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>processTourneyMatch(m,isTier?'?곗뼱???:'議곕퀎由ш렇'));});
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>processTourneyMatch(m,isTier?'?곗뼱???:'???));
    (br.manualMatches||[]).forEach(m=>{if(m)processTourneyMatch(m,isTier?'?곗뼱???:'???);});
  });

  // tourneys(type=tier) 寃쎄린瑜?ttM?먮룄 ?숆린??
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn => {
    if(tn.type !== 'tier') return;
    // 議곕퀎由ш렇
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if(!m||!m._id) return;
        const exists = ttM.some(x => x._id === m._id);
        if(!exists) {
          ttM.unshift({_id:m._id, d:m.d, a:m.a, b:m.b, sa:m.sa, sb:m.sb,
            sets:m.sets, n:tn.name, compName:tn.name,
            teamALabel:m.a, teamBLabel:m.b, stage:'league'});
          added++;
        }
      });
    });
    // 釉뚮씪耳??좊꼫癒쇳듃)
    const br = tn.bracket || {};
    [...Object.values(br.matchDetails||{}), ...(br.manualMatches||[])].forEach(m => {
      if(!m||!m._id) return;
      const exists = ttM.some(x => x._id === m._id);
      if(!exists) {
        ttM.unshift({_id:m._id, d:m.d, a:m.a, b:m.b, sa:m.sa, sb:m.sb,
          sets:m.sets, n:tn.name, compName:tn.name,
          teamALabel:m.a, teamBLabel:m.b, stage:'bkt'});
        added++;
      }
    });
  });

  if(added>0)save();
  return added;
}

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   ?꾨씫 湲곕줉 蹂듦뎄 ???뱁뙣/ELO 嫄대뱶由ъ? ?딄퀬 history ?쒖떆 ??ぉ留?異붽?
   (history媛 ?섎젮??理쒓렐 湲곕줉????蹂댁씪 ???ъ슜)
?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */
function repairMissingHistory(){
  if(!confirm('?뱁뙣/ELO??蹂寃쏀븯吏 ?딄퀬, ?ㅽ듃由щ㉧ 理쒓렐 湲곕줉?먯꽌 ?꾨씫???쒖떆 ??ぉ留?蹂듦뎄?⑸땲??\n怨꾩냽?섏떆寃좎뒿?덇퉴?')) return;

  // ?좎닔蹂?湲곗〈 matchId ?섏쭛
  const existingIds = {};
  players.forEach(p => {
    existingIds[p.name] = new Set((p.history||[]).map(h=>h.matchId).filter(Boolean));
  });

  let added = 0;

  function addEntry(wn, ln, date, map, matchId, univW, univL, mode) {
    const w = players.find(p=>p.name===wn);
    const l = players.find(p=>p.name===ln);
    if(!w||!l) return;
    if(!existingIds[wn]) existingIds[wn]=new Set();
    if(!existingIds[ln]) existingIds[ln]=new Set();
    if(!existingIds[wn].has(matchId)) {
      if(!w.history) w.history=[];
      w.history.push({date:date||'',result:'??,opp:ln,map:map||'-',matchId,univ:univW||w.univ||'',mode:mode||''});
      existingIds[wn].add(matchId);
      added++;
    }
    if(!existingIds[ln].has(matchId)) {
      if(!l.history) l.history=[];
      l.history.push({date:date||'',result:'??,opp:wn,map:map||'-',matchId,univ:univL||l.univ||'',mode:mode||''});
      existingIds[ln].add(matchId);
      added++;
    }
  }

  function processSets(m, mode) {
    if(!m||!m._id) return;
    (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const uW=g.winner==='A'?(m.a||''):(m.b||'');
      const uL=g.winner==='A'?(m.b||''):(m.a||'');
      addEntry(wn,ln,m.d,g.map,m._id,uW,uL,mode);
    }));
  }

  (typeof miniM!=='undefined'?miniM:[]).forEach(m=>processSets(m,m.type==='civil'?'?쒕퉴??:'誘몃땲???));
  (typeof univM!=='undefined'?univM:[]).forEach(m=>processSets(m,'??숇???));
  (typeof ckM!=='undefined'?ckM:[]).forEach(m=>{
    if(!m||!m._id) return;
    (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const mA=m.teamAMembers||[],mB=m.teamBMembers||[];
      const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
      const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
      addEntry(wn,ln,m.d,g.map,m._id,wM?wM.univ||'':'',lM?lM.univ||'':'','??섴K');
    }));
  });
  (typeof proM!=='undefined'?proM:[]).forEach(m=>{
    if(!m||!m._id) return;
    (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const mA=m.teamAMembers||[],mB=m.teamBMembers||[];
      const wM=(g.winner==='A'?mA:mB).find(x=>x.name===wn);
      const lM=(g.winner==='A'?mB:mA).find(x=>x.name===ln);
      addEntry(wn,ln,m.d,g.map,m._id,wM?wM.univ||'':'',lM?lM.univ||'':'','?꾨줈由ш렇');
    }));
  });
  (typeof indM!=='undefined'?indM:[]).forEach(m=>{
    if(!m||!m._id||!m.wName||!m.lName) return;
    addEntry(m.wName,m.lName,m.d,m.map,m._id,'','',m._proLabel?'?꾨줈由ш렇':'媛쒖씤??);
  });
  (typeof gjM!=='undefined'?gjM:[]).forEach(m=>{
    if(!m||!m._id||!m.wName||!m.lName) return;
    addEntry(m.wName,m.lName,m.d,m.map,m._id,'','',m._proLabel?'?꾨줈由ш렇?앹옣??:'?앹옣??);
  });

  // ?좎쭨???뺣젹 (理쒖떊????
  players.forEach(p=>{
    if(p.history) p.history.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  });

  if(added>0){ save(); alert('???꾨씫 湲곕줉 蹂듦뎄 ?꾨즺: '+added+'嫄?異붽?\n?뱁뙣/ELO??蹂寃쎈릺吏 ?딆븯?듬땲??'); render(); }
  else{ alert('???꾨씫??湲곕줉???놁뒿?덈떎.'); }
}

function syncAllHistoryBtn(){
  if(!confirm('紐⑤뱺 ???湲곕줉(誘몃땲/???CK/?꾨줈/?곗뼱/媛쒖씤??????????ㅽ듃由щ㉧ 理쒓렐 寃쎄린???뚭툒 諛섏쁺?⑸땲??\n?대? 諛섏쁺??寃쎄린??以묐났 異붽??섏? ?딆뒿?덈떎.\n怨꾩냽?섏떆寃좎뒿?덇퉴?'))return;
  const n=syncAllHistory();
  if(n>0){alert('??'+n+'嫄댁쓽 寃쎄린媛 ?ㅽ듃由щ㉧ 理쒓렐 寃쎄린???뚭툒 諛섏쁺?섏뿀?듬땲??\n?ㅽ듃由щ㉧ ?곸꽭 ?섏씠吏?먯꽌 ?뺤씤?섏꽭??');render();}
  else{alert('???대? 紐⑤뱺 湲곕줉??諛섏쁺?섏뼱 ?덉뒿?덈떎.');}
}

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   2025???댁쟾 寃쎄린 湲곕줉 ?쇨큵 ??젣
   - miniM/univM/ckM/proM/indM/gjM/ttM ?꾪꽣
   - player.history ?꾪꽣 ??win/loss/points/ELO ?ш퀎??
?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */
function cleanupPlayerHistoryDuplicates(){
  if(!confirm('紐⑤뱺 ?좎닔??理쒓렐 寃쎄린 湲곕줉?먯꽌 以묐났???쒓굅?섏떆寃좎뒿?덇퉴?\n\n???묒뾽? ?섎룎由????놁뒿?덈떎.\n?좎쭨+留??곷?+寃곌낵 議고빀?쇰줈 以묐났???먮떒?⑸땲??')) return;
  
  let totalRemoved = 0;
  
  players.forEach(p => {
    if(!p.history || !p.history.length) return;
    
    const seen = new Set();
    const deduped = [];
    
    p.history.forEach(h => {
      // ??긽 蹂듯빀 ???ъ슜 (matchId ?좊Т? 愿怨꾩뾾??
      const key = `${h.date||''}|${h.map||'-'}|${h.opp||''}|${h.result||''}`;
      
      if(seen.has(key)){
        totalRemoved++;
        // 以묐났 湲곕줉?대㈃ ?????ъ씤??ELO 李④컧
        if(h.result === '??){
          p.win = Math.max(0, (p.win||0) - 1);
          p.points = (p.points||0) - 3;
        } else if(h.result === '??){
          p.loss = Math.max(0, (p.loss||0) - 1);
          p.points = (p.points||0) + 3;
        }
        if(h.eloDelta != null){
          p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
        }
      } else {
        seen.add(key);
        deduped.push(h);
      }
    });
    
    p.history = deduped;
  });
  
  save();
  render();
  alert(`??以묐났 ?쒓굅 ?꾨즺\n珥?${totalRemoved}嫄댁쓽 以묐났 湲곕줉???쒓굅?섏뿀?듬땲??`);
}

function purgeOldRecords(){
  const cutoff = '2026-01-01';
  const cutoffLabel = '2025??12??31??;
  if(!confirm(`?좑툘 ${cutoffLabel} ?댁쟾 紐⑤뱺 寃쎄린 湲곕줉????젣?⑸땲??\n\n??젣 ???\n??誘몃땲/???CK/?꾨줈/媛쒖씤???앹옣???곗뼱 ???湲곕줉\n???ㅽ듃由щ㉧ 媛쒖씤 湲곕줉(history)\n???뱁뙣쨌?ъ씤?맞텲LO ?ш퀎??n\n?좑툘 ?섎룎由????놁뒿?덈떎. 癒쇱? JSON 諛깆뾽??沅뚯옣?⑸땲??\n\n怨꾩냽?섏떆寃좎뒿?덇퉴?`)) return;

  const isNew = d => d && d >= cutoff;

  // 1) 寃쎄린 諛곗뿴 ?꾪꽣
  const _filter = arr => { const keep = arr.filter(m => isNew(m.d)); arr.length=0; arr.push(...keep); };
  _filter(miniM);
  _filter(univM);
  _filter(ckM);
  _filter(proM);
  if(typeof indM!=='undefined') _filter(indM);
  if(typeof gjM!=='undefined')  _filter(gjM);
  if(typeof ttM!=='undefined')  _filter(ttM);

  // 2) ?좎닔 history ?꾪꽣 + ?ㅽ꺈 ?ш퀎??
  let playerCount = 0;
  players.forEach(p => {
    if(!p.history || !p.history.length) return;
    const before = p.history.length;
    p.history = p.history.filter(h => h.date && h.date >= cutoff);
    if(p.history.length === before) return; // 蹂寃??놁쓬
    playerCount++;

    // ?????ъ씤???ш퀎??
    p.win    = p.history.filter(h => h.result === '??).length;
    p.loss   = p.history.filter(h => h.result === '??).length;
    p.points = p.win * 3 - p.loss * 3;

    // ELO: history??理쒖떊????unshift). [0]??媛??理쒓렐 湲곕줉
    const lastH = p.history.find(h => h.eloAfter != null);
    p.elo = lastH ? lastH.eloAfter : (typeof ELO_DEFAULT!=='undefined' ? ELO_DEFAULT : 1500);
  });

  save();
  render();
  alert(`??${cutoffLabel} ?댁쟾 湲곕줉 ??젣 ?꾨즺\n\n?ㅽ듃由щ㉧ ${playerCount}紐??ㅽ꺈 ?ш퀎???꾨즺`);
}

