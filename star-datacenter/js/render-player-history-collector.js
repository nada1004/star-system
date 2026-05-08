function collectPlayerExtraHistoryData(opts){
  const {
    player,
    dedupedHistory=[],
    prunedHistory=[],
    prunedHistory2=[],
    existingMatchIds=new Set(),
    existingKeys=new Set(),
    histNoResSet=new Set(),
    histDupKey,
    normMap,
    hasDetailedKey=new Set()
  } = opts || {};
  const p = player;
  if(!p || typeof histDupKey!=='function' || typeof normMap!=='function'){
    return { histAll:[...prunedHistory2] };
  }

  function _findHistEloMeta(meta){
    try{
      const hist = Array.isArray(p.history) ? p.history : [];
      const mid = String(meta?.matchId||'').trim();
      if(mid){
        const byId = hist.find(h => h && String(h.matchId||'').trim() === mid);
        if(byId) return byId;
      }
      const d = String(meta?.date||'').trim();
      const opp = String(meta?.opp||'').trim();
      const result = String(meta?.result||'').trim();
      const map = normMap(meta?.map||'-');
      const mode = String(meta?.mode||'').trim();
      const byFields = hist.find(h=>{
        if(!h) return false;
        if(String(h.date||'').trim() !== d) return false;
        if(String(h.opp||'').trim() !== opp) return false;
        if(String(h.result||'').trim() !== result) return false;
        if(normMap(h.map||'-') !== map) return false;
        if(mode && String(h.mode||'').trim() && String(h.mode||'').trim() !== mode) return false;
        return true;
      });
      if(byFields) return byFields;
    }catch(e){}
    return null;
  }

  function _attachHistElo(obj){
    const hh = _findHistEloMeta(obj);
    if(hh){
      if(hh.eloDelta!=null) obj.eloDelta = hh.eloDelta;
      if(hh.eloAfter!=null) obj.eloAfter = hh.eloAfter;
      return obj;
    }
    try{
      const oppP = players.find(x=>x && x.name===obj.opp);
      const oppHist = Array.isArray(oppP?.history) ? oppP.history : [];
      const mid = String(obj.matchId||'').trim();
      let mirrored = null;
      if(mid){
        mirrored = oppHist.find(h => h && String(h.matchId||'').trim() === mid);
      }
      if(!mirrored){
        const d = String(obj.date||'').trim();
        const map = normMap(obj.map||'-');
        const result = obj.result==='승'?'패':obj.result==='패'?'승':obj.result;
        mirrored = oppHist.find(h=>{
          if(!h) return false;
          if(String(h.date||'').trim() !== d) return false;
          if(String(h.opp||'').trim() !== p.name) return false;
          if(String(h.result||'').trim() !== result) return false;
          if(normMap(h.map||'-') !== map) return false;
          return true;
        });
      }
      if(mirrored && mirrored.eloDelta!=null){
        obj.eloDelta = -mirrored.eloDelta;
        return obj;
      }
    }catch(e){}
    try{
      const oppP = players.find(x=>x && x.name===obj.opp);
      const myElo = Number(p.elo||ELO_DEFAULT) || ELO_DEFAULT;
      const oppElo = Number(oppP?.elo||ELO_DEFAULT) || ELO_DEFAULT;
      if(typeof calcElo === 'function'){
        if(obj.result === '승') obj.eloDelta = calcElo(myElo, oppElo);
        else if(obj.result === '패') obj.eloDelta = -calcElo(oppElo, myElo);
        else if(obj.result === '무') obj.eloDelta = 0;
      }
    }catch(e){}
    return obj;
  }

  const indMatches=(typeof indM!=='undefined'?indM:[]).filter(m=>m.wName===p.name||m.lName===p.name).map(m=>{
    const matchId=m._id||`ind_${m.d||''}${m.map||''}${(m.wName||'').replace(/\s+/g,'')}${(m.lName||'').replace(/\s+/g,'')}`;
    const d=String(m.d||'').trim();
    const map=normMap(m.map||'-');
    const opp=(m.wName===p.name?m.lName:m.wName);
    const pair=[p.name, opp].filter(Boolean).sort().join('|');
    const mm = m._proLabel ? 'ind_pro' : 'ind';
    if(d && opp && histNoResSet.has(`${d}|${map}|${pair}|${mm}`)) return null;
    return _attachHistElo({
      date:m.d||'',time:0,result:m.wName===p.name?'승':'패',
      opp:m.wName===p.name?m.lName:m.wName,
      oppRace:(players.find(x=>x.name===(m.wName===p.name?m.lName:m.wName))||{}).race||'',
      map:normMap(m.map||'-'),matchId,mode:m._proLabel?'프로리그':'개인전',
      _dupKey:`${m.d||''}|${m.map||''}|${[m.wName,m.lName].sort().join('|')}`,
      _id:matchId
    });
  }).filter(Boolean);

  const gjMatches=(typeof gjM!=='undefined'?gjM:[]).filter(m=>m.wName===p.name||m.lName===p.name).map(m=>{
    const matchId=m._id||`gj_${m.d||''}${m.map||''}${(m.wName||'').replace(/\s+/g,'')}${(m.lName||'').replace(/\s+/g,'')}`;
    const d=String(m.d||'').trim();
    const map=normMap(m.map||'-');
    const opp=(m.wName===p.name?m.lName:m.wName);
    const pair=[p.name, opp].filter(Boolean).sort().join('|');
    const mm = m._proLabel ? 'gj_pro' : 'gj';
    if(d && opp && histNoResSet.has(`${d}|${map}|${pair}|${mm}`)) return null;
    return _attachHistElo({
      date:m.d||'',time:0,result:m.wName===p.name?'승':'패',
      opp:m.wName===p.name?m.lName:m.wName,
      oppRace:(players.find(x=>x.name===(m.wName===p.name?m.lName:m.wName))||{}).race||'',
      map:normMap(m.map||'-'),matchId,mode:m._proLabel?'프로리그끝장전':'끝장전',
      _dupKey:`${m.d||''}|${m.map||''}|${[m.wName,m.lName].sort().join('|')}`,
      _id:matchId
    });
  }).filter(Boolean);

  const otherMatches=[];
  function pushTeamGameIfAny(m, s, g, setIdx, gameIdx, modeLabel){
    try{
      if(!g || !g.winner || !g._isTeam || !Array.isArray(g.teamA) || !Array.isArray(g.teamB)) return false;
      const inA = g.teamA.includes(p.name);
      const inB = g.teamB.includes(p.name);
      if(!inA && !inB) return false;
      const oppTeam = (inA ? g.teamB : g.teamA).filter(Boolean).join(',');
      const winnerTeam = (g.winner==='A') ? g.teamA : g.teamB;
      const isWin = winnerTeam.includes(p.name);
      const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
      const isDupInHist = dedupedHistory.some(h =>
        h.matchId===gameId || (h.date===m.d && h.map===(g.map||'-') && h.opp===oppTeam)
      );
      if(isDupInHist) return true;
      otherMatches.push(_attachHistElo({
        date:m.d||'', time:0, result:isWin?'승':'패',
        opp: oppTeam, oppRace:'', map:g.map||'-',
        matchId: gameId, mode: modeLabel,
        _dupKey:`mid:${gameId}`, _team:true
      }));
      return true;
    }catch(e){
      return false;
    }
  }

  function scanSetMatchArray(arr, modeLabelResolver){
    (arr||[]).forEach(m=>{
      (m.sets||[]).forEach((s,setIdx)=>{
        (s.games||[]).forEach((g,gameIdx)=>{
          const modeLabel = typeof modeLabelResolver==='function' ? modeLabelResolver(m,g) : modeLabelResolver;
          if(g.winner && (pushTeamGameIfAny(m,s,g,setIdx,gameIdx,modeLabel) || (g.playerA===p.name||g.playerB===p.name))){
            const opp=g.playerA===p.name?g.playerB:g.playerA;
            const oppP=players.find(x=>x.name===opp);
            const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
            const isDupInHist = dedupedHistory.some(h =>
              h.matchId===gameId || (h.date===m.d && h.map===(g.map||'-') && h.opp===opp)
            );
            if(!isDupInHist){
              otherMatches.push(_attachHistElo({
                date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
                opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:gameId,mode:modeLabel,
                _dupKey:`mid:${gameId}`
              }));
            }
          }
        });
      });
    });
  }

  scanSetMatchArray((typeof miniM!=='undefined'&&miniM.length)?miniM:[], (m)=>((m.type==='civil')?'시빌워':'미니대전'));
  scanSetMatchArray((typeof univM!=='undefined'&&univM.length)?univM:[], '대학대전');
  scanSetMatchArray((typeof ckM!=='undefined'&&ckM.length)?ckM:[], '대학CK');
  scanSetMatchArray((typeof proM!=='undefined'&&proM.length)?proM:[], '프로리그');

  if(typeof tourneys!=='undefined'&&tourneys.length){
    (tourneys.filter(t=>t.type==='tier')).forEach(tn=>{
      (tn.groups||[]).forEach(grp=>{
        (grp.matches||[]).forEach(m=>{
          (m.sets||[]).forEach((s,setIdx)=>{
            (s.games||[]).forEach((g,gameIdx)=>{
              if(g.winner && (pushTeamGameIfAny(m,s,g,setIdx,gameIdx,'티어대회') || (g.playerA===p.name||g.playerB===p.name))){
                const opp=g.playerA===p.name?g.playerB:g.playerA;
                const oppP=players.find(x=>x.name===opp);
                otherMatches.push(_attachHistElo({
                  date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
                  opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:m._id||'',mode:'티어대회',
                  _dupKey:`${m.d||''}|${g.map||''}|${[g.playerA,g.playerB].sort().join('|')}`
                }));
              }
            });
          });
        });
      });
      Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
        (m.sets||[]).forEach((s,setIdx)=>{
          (s.games||[]).forEach((g,gameIdx)=>{
            if(g.winner && (pushTeamGameIfAny(m,s,g,setIdx,gameIdx,'티어대회') || (g.playerA===p.name||g.playerB===p.name))){
              const opp=g.playerA===p.name?g.playerB:g.playerA;
              const oppP=players.find(x=>x.name===opp);
              otherMatches.push({
                date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
                opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:m._id||'',mode:'티어대회',
                _dupKey:`${m.d||''}|${g.map||''}|${[g.playerA,g.playerB].sort().join('|')}`
              });
            }
          });
        });
      });
    });
  }

  if(typeof ttM!=='undefined' && Array.isArray(ttM) && ttM.length){
    ttM.forEach(m=>{
      if(!m || !m._id || !m.sets) return;
      (m.sets||[]).forEach((s,setIdx)=>{
        (s.games||[]).forEach((g,gameIdx)=>{
          if(!g || !g.playerA || !g.playerB || !g.winner) return;
          const sp = (x)=>String(x||'').split(/[,+，]/).map(v=>v.trim()).filter(Boolean);
          const aList = sp(g.playerA), bList = sp(g.playerB);
          const hasMe = (g.playerA===p.name || g.playerB===p.name || aList.includes(p.name) || bList.includes(p.name));
          const pushedTeam = pushTeamGameIfAny(m,s,g,setIdx,gameIdx,'티어대회');
          if(!pushedTeam && !hasMe) return;
          const opp = (g.playerA===p.name || aList.includes(p.name)) ? g.playerB : g.playerA;
          const oppP=players.find(x=>x.name===opp);
          const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
          let _ed=null,_ea=null;
          try{
            const hh = (p.history||[]).find(h=>h && h.matchId===gameId);
            if(hh){ _ed = (hh.eloDelta!=null ? hh.eloDelta : null); _ea = (hh.eloAfter!=null ? hh.eloAfter : null); }
          }catch(e){}
          const isDupInHist = dedupedHistory.some(h =>
            h.matchId===gameId || (h.date===(m.d||'') && h.map===(g.map||'-') && h.opp===opp)
          );
          if(!isDupInHist){
            otherMatches.push(_attachHistElo({
              date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
              opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:gameId,mode:'티어대회',
              eloDelta:_ed, eloAfter:_ea,
              _dupKey:`mid:${gameId}`
            }));
          }
        });
      });
    });
  }

  const tourMatches=[];
  (typeof proTourneys!=='undefined'?proTourneys:[]).forEach(tn=>{
    (tn.groups||[]).forEach((grp,gi)=>{
      (grp.matches||[]).forEach((m,mi)=>{
        const mid=m._id||`protour_${tn.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
        if(existingMatchIds.has(mid))return;
        if(m.a!==p.name&&m.b!==p.name)return;
        const wn=m.winner===m.a?m.a:m.winner===m.b?m.b:null;
        if(!wn)return;
        const ln=wn===m.a?m.b:m.a;
        const opp=wn===p.name?ln:wn;
        const oppP=players.find(x=>x.name===opp);
        // 프로리그 대회 조별리그는 pro-comp.js에서 수정/삭제 가능 → editableSource로 연결
        tourMatches.push(_attachHistElo({
          date:m.d||'',time:0,result:wn===p.name?'승':'패',opp,oppRace:oppP?.race||'',map:m.map||'-',
          matchId:mid,mode:'프로리그대회',
          _readOnly:true,
          _editableSource:true,
          _sourceType:'proTourGrp',
          _sourceTnId:tn.id||'',
          _sourceGrpIdx:gi,
          _sourceMatchIdx:mi,
          _sourceId:mid
        }));
      });
    });
    const _stageRounds = ['64강','32강','16강','8강','4강','결승'];
    _stageRounds.forEach(round=>{
      ((tn.stageRecords||{})[round]||[]).forEach(m=>{
        const mid=m._id||`protour_stage_${tn.id||''}_${round}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
        if(existingMatchIds.has(mid)) return;
        if(m.a!==p.name&&m.b!==p.name) return;
        const isWin = (m.winner==='A' && m.a===p.name) || (m.winner==='B' && m.b===p.name);
        const isLose = (m.winner==='A' && m.b===p.name) || (m.winner==='B' && m.a===p.name);
        if(!isWin && !isLose) return;
        const opp = m.a===p.name ? m.b : m.a;
        const oppP=players.find(x=>x.name===opp);
        tourMatches.push(_attachHistElo({
          date:m.d||'',
          time:0,
          result:isWin?'승':'패',
          opp,
          oppRace:oppP?.race||'',
          map:m.map||'-',
          matchId:mid,
          mode:'프로리그대회',
          _readOnly:true,
          _editableSource:true,
          _sourceType:'proTourStage',
          _sourceTnId:tn.id||'',
          _sourceRound:round,
          _sourceId:mid,
          _stageRound:round,
          _dupKey:`${m.d||''}|${m.map||''}|${[m.a,m.b].sort().join('|')}|프로리그대회|${round}`
        }));
      });
    });
    (tn.gjMatches||[]).forEach(m=>{
      const mid=m._id||`protour_${tn.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
      if(existingMatchIds.has(mid))return;
      if(m.a!==p.name&&m.b!==p.name)return;
      const wn=m.winner===m.a?m.a:m.winner===m.b?m.b:null;
      if(!wn)return;
      const ln=wn===m.a?m.b:m.a;
      const opp=wn===p.name?ln:wn;
      const oppP=players.find(x=>x.name===opp);
      tourMatches.push(_attachHistElo({date:m.d||'',time:0,result:wn===p.name?'승':'패',opp,oppRace:oppP?.race||'',map:m.map||'-',matchId:mid,mode:'프로리그끝장전',_readOnly:true}));
    });
  });

  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    (tn.groups||[]).forEach((grp,gi)=>{
      (grp.matches||[]).forEach((m,mi)=>{
        const mid=m._id||`tour_${tn.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
        if(existingMatchIds.has(mid))return;
        (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
          if(!g.playerA||!g.playerB||!g.winner)return;
          const wn=g.winner==='A'?g.playerA:g.playerB;
          const ln=g.winner==='A'?g.playerB:g.playerA;
          if(wn!==p.name&&ln!==p.name)return;
          const opp=wn===p.name?ln:wn;
          const oppP=players.find(x=>x.name===opp);
          const isDupInHist = prunedHistory.some(h =>
            h.matchId===mid || (h.date===m.d && h.map===(g.map||'-') && h.opp===opp)
          );
          if(!isDupInHist){
            // 일반 대회/티어대회 조별리그는 competition.js에서 수정/삭제 가능 → editableSource로 연결
            tourMatches.push(_attachHistElo({
              date:m.d||'',time:0,result:wn===p.name?'승':'패',opp,oppRace:oppP?.race||'',map:g.map||'-',
              matchId:mid,mode:tn.type==='tier'?'티어대회':'조별리그',
              _readOnly:true,
              _editableSource:true,
              _sourceType:'tourGrp',
              _sourceTnId:tn.id||'',
              _sourceGrpIdx:gi,
              _sourceMatchIdx:mi,
              _sourceId:mid
            }));
          }
        });});
      });
    });
    Object.entries((tn.bracket||{}).matchDetails||{}).forEach(([k,m])=>{
      const mid=m? (m._id||`tour_${tn.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`) : (`tour_${tn.id||''}_${k}`);
      if(existingMatchIds.has(mid))return;
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        if(wn!==p.name&&ln!==p.name)return;
        const opp=wn===p.name?ln:wn;
        const oppP=players.find(x=>x.name===opp);
        const isDupInHist = prunedHistory.some(h =>
          h.matchId===mid || (h.date===m.d && h.map===(g.map||'-') && h.opp===opp)
        );
        if(!isDupInHist){
          let rr=null, mm=null;
          try{
            const parts=String(k||'').split('-');
            if(parts.length===2){ rr=parseInt(parts[0],10); mm=parseInt(parts[1],10); if(isNaN(rr)) rr=null; if(isNaN(mm)) mm=null; }
          }catch(e){}
          // 일반 대회/티어대회 토너먼트는 competition.js에서 수정/삭제 가능 → editableSource로 연결
          tourMatches.push(_attachHistElo({
            date:m.d||'',time:0,result:wn===p.name?'승':'패',opp,oppRace:oppP?.race||'',map:g.map||'-',
            matchId:mid,mode:tn.type==='tier'?'티어대회':'대회',
            _readOnly:true,
            _editableSource:true,
            _sourceType:'tourBkt',
            _sourceTnId:tn.id||'',
            _sourceRnd:rr,
            _sourceMi:mm,
            _sourceTeamA:m.a||'',
            _sourceTeamB:m.b||'',
            _sourceId:mid
          }));
        }
      });});
    });
  });

  const extraMatches=[...indMatches,...gjMatches,...otherMatches,...tourMatches].filter(h=>{
    if(h.matchId && existingMatchIds.has(h.matchId)) return false;
    if(existingKeys.has(histDupKey(h))) return false;
    if(!h.matchId && prunedHistory.some(dh => dh.date === h.date && dh.map === h.map && dh.opp === h.opp)) return false;
    const mk=normMap(h.map||'-');
    if(mk==='-'){
      const k=`${String(h.date||'').trim()}|${String(h.opp||'').trim()}|${String(h.mode||'').trim()}|${String(h.result||'').trim()}`;
      if(hasDetailedKey.has(k)) return false;
    }
    return true;
  });

  const histAll=[...prunedHistory2,...extraMatches].sort((a,b)=>((b.date||'')+'').localeCompare((a.date||'')+'')||((b.time||0)-(a.time||0)));
  return { histAll };
}

try{
  window.collectPlayerExtraHistoryData = collectPlayerExtraHistoryData;
}catch(e){}
