/* ─────────────────────────────────────────
   data.js (복구본)
   - 기존 파일이 인코딩/깨진 문자열로 SyntaxError를 내면서
     설정/렌더 흐름이 중간에 끊기는 문제가 있어, 안전한 구현으로 재작성했습니다.
   - 필요한 핵심 기능만 유지:
     1) revertMatchRecord: 경기 삭제 시 선수 전적/포인트/elo 롤백
     2) syncTourneyHistory: 대회 경기 → 최근 기록(history) 동기화
     3) syncIndHistory: 개인전/끝장전 → 최근 기록(history) 동기화
───────────────────────────────────────── */

/* global players, tourneys, ttM, indM, gjM, ELO_DEFAULT, save, render, applyGameResult */

function _safeArr(x){ return Array.isArray(x) ? x : []; }
function _safeStr(x){ return (x==null) ? '' : String(x); }

// ─────────────────────────────────────────
// 1) 경기 삭제 롤백
// ─────────────────────────────────────────
function revertMatchRecord(matchObj){
  try{
    if(!matchObj) return;
    const mid = matchObj._id || null;
    const mdate = _safeStr(matchObj.d);

    // 티어대회 기록 배열(ttM)에서 제거(있을 때만)
    try{
      if(mid && typeof ttM!=='undefined' && Array.isArray(ttM)){
        const i = ttM.findIndex(m=>m && m._id===mid);
        if(i>=0) ttM.splice(i,1);
      }
    }catch(e){}

    // 세트/게임이 없는 경우: matchId 기반으로만 롤백
    if(!matchObj.sets || !matchObj.sets.length){
      if(!mid) return;
      _safeArr(players).forEach(p=>{
        if(!p || !Array.isArray(p.history)) p.history=[];
        const idx=p.history.findIndex(h=>h && h.matchId===mid);
        if(idx<0) return;
        const hr=p.history[idx]||{};
        if(hr.result==='승'){
          p.win=Math.max(0,(p.win||0)-1);
          p.points=(p.points||0)-3;
        }else if(hr.result==='패'){
          p.loss=Math.max(0,(p.loss||0)-1);
          p.points=(p.points||0)+3;
        }
        if(hr.eloDelta!=null) p.elo=(p.elo||ELO_DEFAULT)-hr.eloDelta;
        p.history.splice(idx,1);
      });
      return;
    }

    // 세트/게임이 있는 경우: gameMatchId → mid 순으로 제거
    (matchObj.sets||[]).forEach((set, si)=>{
      (set.games||[]).forEach((g, gi)=>{
        if(!g || !g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner==='A' ? g.playerA : g.playerB;
        const lName = g.winner==='A' ? g.playerB : g.playerA;
        const gameMatchId = mid ? `${mid}_s${si}_g${gi}` : null;

        const w = _safeArr(players).find(p=>p && p.name===wName);
        const l = _safeArr(players).find(p=>p && p.name===lName);

        if(w){
          if(!Array.isArray(w.history)) w.history=[];
          let idx=-1;
          if(gameMatchId) idx=w.history.findIndex(h=>h && h.matchId===gameMatchId && h.result==='승' && h.opp===lName);
          if(idx<0 && mid) idx=w.history.findIndex(h=>h && h.matchId===mid && h.result==='승' && h.opp===lName);
          if(idx<0) idx=w.history.findIndex(h=>h && h.result==='승' && h.opp===lName && h.date===mdate);
          if(idx<0) idx=w.history.findIndex(h=>h && h.result==='승' && h.opp===lName);
          if(idx>=0){
            const hr=w.history[idx]||{};
            w.win=Math.max(0,(w.win||0)-1);
            w.points=(w.points||0)-3;
            if(hr.eloDelta!=null) w.elo=(w.elo||ELO_DEFAULT)-hr.eloDelta;
            w.history.splice(idx,1);
          }
        }
        if(l){
          if(!Array.isArray(l.history)) l.history=[];
          let idx=-1;
          if(gameMatchId) idx=l.history.findIndex(h=>h && h.matchId===gameMatchId && h.result==='패' && h.opp===wName);
          if(idx<0 && mid) idx=l.history.findIndex(h=>h && h.matchId===mid && h.result==='패' && h.opp===wName);
          if(idx<0) idx=l.history.findIndex(h=>h && h.result==='패' && h.opp===wName && h.date===mdate);
          if(idx<0) idx=l.history.findIndex(h=>h && h.result==='패' && h.opp===wName);
          if(idx>=0){
            const hr=l.history[idx]||{};
            l.loss=Math.max(0,(l.loss||0)-1);
            l.points=(l.points||0)+3;
            if(hr.eloDelta!=null) l.elo=(l.elo||ELO_DEFAULT)-hr.eloDelta;
            l.history.splice(idx,1);
          }
        }
      });
    });
  }catch(e){
    console.warn('[revertMatchRecord] failed:', e && e.message ? e.message : e);
  }
}

// ─────────────────────────────────────────
// 2) 대회 경기 → 최근 기록 동기화
// ─────────────────────────────────────────
function syncTourneyHistory(){
  if(typeof applyGameResult!=='function') return 0;
  const existingIds=new Set();
  _safeArr(players).forEach(p=>_safeArr(p?.history).forEach(h=>{ if(h && h.matchId) existingIds.add(h.matchId); }));

  let added=0;
  function processMatch(m, modeLabel){
    if(!m || !m.sets || !m.sets.length) return;
    const mid = m._id || null;
    (m.sets||[]).forEach((set, si)=>{
      (set.games||[]).forEach((g, gi)=>{
        if(!g || !g.playerA || !g.playerB || !g.winner) return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        const univW=g.winner==='A'?(m.a||''):(m.b||'');
        const univL=g.winner==='A'?(m.b||''):(m.a||'');
        const gameMatchId = mid ? `${mid}_s${si}_g${gi}` : null;
        if(gameMatchId && existingIds.has(gameMatchId)) return;
        applyGameResult(wn, ln, m.d||'', g.map||'', gameMatchId, univW, univL, modeLabel);
        if(gameMatchId) existingIds.add(gameMatchId);
        added++;
      });
    });
  }

  _safeArr(typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    const isTier = (tn && tn.type==='tier');
    _safeArr(tn?.groups).forEach(grp=>{
      _safeArr(grp?.matches).forEach(m=>processMatch(m, isTier?'티어대회':'조별리그'));
    });
    const br = tn?.bracket || {};
    Object.values(br.matchDetails||{}).forEach(m=>processMatch(m, isTier?'티어대회':'토너먼트'));
    _safeArr(br.manualMatches).forEach(m=>processMatch(m, isTier?'티어대회':'토너먼트'));
  });

  if(added>0){ try{ save && save(); }catch(e){} }
  return added;
}

function syncTourneyHistoryBtn(){
  const n=syncTourneyHistory();
  if(n>0){ alert(`✅ ${n}개의 대회 경기를 최근 기록에 반영했습니다.`); try{ render && render(); }catch(e){} }
  else { alert('이미 모든 대회 경기가 반영되어 있습니다.'); }
}

// ─────────────────────────────────────────
// 3) 개인전/끝장전 → 최근 기록 동기화
// ─────────────────────────────────────────
function syncIndHistory(){
  if(typeof applyGameResult!=='function') return 0;
  const existingIds=new Set();
  _safeArr(players).forEach(p=>_safeArr(p?.history).forEach(h=>{ if(h && h.matchId) existingIds.add(h.matchId); }));

  let added=0;
  const src = []
    .concat(_safeArr(typeof indM!=='undefined'?indM:[]).map(m=>({m, mode:'개인전'})))
    .concat(_safeArr(typeof gjM!=='undefined'?gjM:[]).map(m=>({m, mode:(m && m._proLabel)?'프로리그 끝장전':'끝장전'})));

  src.forEach(({m, mode})=>{
    if(!m || !m.wName || !m.lName) return;
    const mid = m._id || null;
    if(mid && existingIds.has(mid)) return;
    // applyGameResult(winner, loser, date, map, matchId, univW, univL, modeLabel)
    applyGameResult(m.wName, m.lName, m.d||'', m.map||'', mid, '', '', mode);
    if(mid) existingIds.add(mid);
    added++;
  });

  if(added>0){ try{ save && save(); }catch(e){} }
  return added;
}

function syncIndHistoryBtn(){
  const n=syncIndHistory();
  if(n>0){ alert(`✅ ${n}개의 개인전/끝장전 경기를 최근 기록에 반영했습니다.`); try{ render && render(); }catch(e){} }
  else { alert('이미 모든 개인전/끝장전 경기가 반영되어 있습니다.'); }
}

