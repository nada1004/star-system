/* ══════════════════════════════════════════════════════════════
   프로리그 - 대진표 기록 병합(스테이지 머지) (pro-comp-core.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompToggleStageMergeMode(){
  window._pcStageMergeMode = !window._pcStageMergeMode;
  window._pcStageMergeSel = new Set();
  render();
}
function proCompToggleStageMergeSel(key){
  window._pcStageMergeSel = window._pcStageMergeSel || new Set();
  if (window._pcStageMergeSel.has(key)) window._pcStageMergeSel.delete(key);
  else window._pcStageMergeSel.add(key);
  render();
}
function proCompMergeSelectedStageMatches(tnId){
  const tn = _findTourneyById(tnId); if (!tn) return;
  _pcEnsureStageRecords(tn);
  const sel = [...(window._pcStageMergeSel || [])];
  if (sel.length < 2) { alert('합칠 경기를 2건 이상 선택하세요.'); return; }
  const parsed = sel.map(k => { const p = k.indexOf('__'); return { rnd: k.slice(0, p), id: k.slice(p + 2) }; });
  const rnd0 = parsed[0].rnd;
  if (parsed.some(p => p.rnd !== rnd0)) { alert('같은 라운드의 경기만 합칠 수 있습니다.'); return; }
  const arr = tn.stageRecords[rnd0] || [];
  const items = parsed.map(p => p.id.startsWith('idx_') ? arr[Number(p.id.slice(4))] : arr.find(x => x && x._id === p.id)).filter(Boolean);
  if (items.length < 2) { alert('선택한 경기를 찾을 수 없습니다. (다시 선택해주세요)'); return; }
  const norm = (m) => [m.a, m.b].slice().sort().join('|');
  const key0 = norm(items[0]);
  if (items.some(it => norm(it) !== key0)) { alert('같은 두 선수(팀)의 경기만 합칠 수 있습니다.'); return; }
  if (!confirm(`선택한 ${items.length}건의 경기를 1건으로 합칩니다.\n개인 전적은 자동으로 다시 계산되어 반영됩니다.\n계속하시겠습니까?`)) return;

  const canonA = items[0].a, canonB = items[0].b;
  const mergedGames = [];
  items.forEach(item => {
    const subGames = (Array.isArray(item._games) && item._games.length)
      ? item._games
      : [{ winner: item.winner, map: item.map || '', d: item.d || '', note: item.note || '' }];
    subGames.forEach(g => {
      if (!g.winner) return;
      const winnerName = g.winner === 'A' ? item.a : item.b;
      const winnerCanon = winnerName === canonA ? 'A' : 'B';
      mergedGames.push({ winner: winnerCanon, map: g.map || '', d: g.d || item.d || '', note: g.note || item.note || '' });
    });
    if (item._id) { try { _revertProMatch(item._id); } catch(e) {} }
  });
  if (!mergedGames.length) { alert('합칠 게임 결과가 없습니다.'); return; }

  items.forEach(item => { const i = arr.indexOf(item); if (i >= 0) arr.splice(i, 1); });

  const mid = `ptr_${tnId}_${rnd0}_` + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const scoreA = mergedGames.filter(g => g.winner === 'A').length;
  const scoreB = mergedGames.filter(g => g.winner === 'B').length;
  const winnerVal = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : '';
  const lastGame = mergedGames[mergedGames.length - 1];
  const dVal = lastGame.d || '';
  const mapVal = mergedGames.length === 1 ? (mergedGames[0].map || '') : '';
  const noteVal = mergedGames.map(g => g.note).filter(Boolean).join(' / ');
  arr.push({ a: canonA, b: canonB, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: mid, _games: mergedGames });
  mergedGames.forEach((g, idx) => {
    const gameId = `${mid}_s0_g${idx}`;
    applyGameResult(g.winner === 'A' ? canonA : canonB, g.winner === 'A' ? canonB : canonA, g.d, g.map || '', gameId, '', '', '프로리그대회');
  });

  window._pcStageMergeSel = new Set();
  window._pcStageMergeMode = false;
  save();
  render();
  setTimeout(() => alert(`${items.length}건의 경기를 1건으로 합쳤습니다.`), 100);
}
try {
  window.proCompToggleStageMergeMode = proCompToggleStageMergeMode;
  window.proCompToggleStageMergeSel = proCompToggleStageMergeSel;
  window.proCompMergeSelectedStageMatches = proCompMergeSelectedStageMatches;
} catch(e) {}
