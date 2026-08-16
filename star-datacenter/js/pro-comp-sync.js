/* ══════════════════════════════════════════════════════════════
   프로리그 - 이력 동기화 (pro-comp-core.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   프로리그 개인 대회
   - proTourneys: [{id,name,groups:[{name,players:[],matches:[{a,b,winner,d,map}]}]}]
   - 조별리그 + 조별순위 + 대진표 + 조편성 관리
   ══════════════════════════════════════════════════════════════ */

/* 프로리그 proTourneys 실시간 동기화 (기존 데이터 player.history 반영) */
function _proCompSyncSilent() {
  const existing = new Set();
  players.forEach(p => (p.history||[]).forEach(h => { if(h.matchId) existing.add(h.matchId); }));
  let cnt = 0;
  proTourneys.forEach(tn => {
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if (!m.winner || !m.a || !m.b) return;
        if (!m._id) m._id = 'pco_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
        if (existing.has(m._id)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', m._id, '', '', '프로리그대회');
        existing.add(m._id); cnt++;
      });
    });
    (tn.bracket||[]).forEach((rnd, ri) => {
      rnd.forEach((m, mi) => {
        if (!m.winner || !m.a || !m.b) return;
        const bktId = `pbn_${tn.id}_${ri}_${mi}`;
        if (existing.has(bktId)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', bktId, '', '', '프로리그대회');
        existing.add(bktId); cnt++;
      });
    });
    if (tn.thirdPlace && tn.thirdPlace.winner && tn.thirdPlace.a && tn.thirdPlace.b) {
      const thirdId = `pbn_${tn.id}_3rd`;
      if (!existing.has(thirdId)) {
        const tp = tn.thirdPlace;
        applyGameResult(tp.winner==='A'?tp.a:tp.b, tp.winner==='A'?tp.b:tp.a, tp.d||'', tp.map||'', thirdId, '', '', '프로리그대회');
        existing.add(thirdId); cnt++;
      }
    }
    // 팀전 게임
    (tn.teamMatches||[]).forEach(tm => {
      (tm.games||[]).forEach(g => {
        if (!g.wName||!g.lName) return;
        if (!g._id) g._id = 'ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
        if (existing.has(g._id)) return;
        applyGameResult(g.wName, g.lName, tm.d||'', g.map||'', g._id, '', '', '프로리그대회');
        existing.add(g._id); cnt++;
      });
    });
  });
  if (cnt > 0) save();
}

// 승리 색(대학색) → "r,g,b" 변환 (대회 카드 테마용)
function _tcHexToRgbStr(hex){
  const h=String(hex||'').replace('#','').trim();
  if(h.length===3){
    const r=parseInt(h[0]+h[0],16), g=parseInt(h[1]+h[1],16), b=parseInt(h[2]+h[2],16);
    if([r,g,b].some(x=>isNaN(x))) return '100,116,139';
    return `${r},${g},${b}`;
  }
  if(h.length>=6){
    const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    if([r,g,b].some(x=>isNaN(x))) return '100,116,139';
    return `${r},${g},${b}`;
  }
  return '100,116,139';
}

function proCompSyncHistory() {
  // 현재 player.history에 있는 matchId 집합
  const existing = new Set();
  players.forEach(p => (p.history||[]).forEach(h => { if(h.matchId) existing.add(h.matchId); }));
  let cnt = 0;
  proTourneys.forEach(tn => {
    // 조별리그
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if (!m.winner || !m.a || !m.b) return;
        if (!m._id) m._id = 'pco_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
        if (existing.has(m._id)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', m._id, '', '', '프로리그대회');
        existing.add(m._id);
        cnt++;
      });
    });
    // 대진표
    (tn.bracket||[]).forEach((rnd, ri) => {
      rnd.forEach((m, mi) => {
        if (!m.winner || !m.a || !m.b) return;
        const bktId = `pbn_${tn.id}_${ri}_${mi}`;
        if (existing.has(bktId)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', bktId, '', '', '프로리그대회');
        existing.add(bktId);
        cnt++;
      });
    });
    // 3위전
    if (tn.thirdPlace && tn.thirdPlace.winner && tn.thirdPlace.a && tn.thirdPlace.b) {
      const thirdId = `pbn_${tn.id}_3rd`;
      if (!existing.has(thirdId)) {
        const tp = tn.thirdPlace;
        applyGameResult(tp.winner==='A'?tp.a:tp.b, tp.winner==='A'?tp.b:tp.a, tp.d||'', tp.map||'', thirdId, '', '', '프로리그대회');
        existing.add(thirdId);
        cnt++;
      }
    }
    // 팀전 게임
    (tn.teamMatches||[]).forEach(tm => {
      (tm.games||[]).forEach(g => {
        if (!g.wName||!g.lName) return;
        if (!g._id) g._id = 'ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
        if (existing.has(g._id)) return;
        applyGameResult(g.wName, g.lName, tm.d||'', g.map||'', g._id, '', '', '프로리그대회');
        existing.add(g._id);
        cnt++;
      });
    });
  });
  if (cnt > 0) {
    save();
    alert(`총 ${cnt}경기 전적 동기화`);
    render();
  } else alert('이미 모두 동기화되어 있습니다.');
}

