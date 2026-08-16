/* ══════════════════════════════════════════════════════════════
   프로리그 - 자동 적용 & 중복 경기 병합 (pro-comp-edit-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompAutoApply(tnId, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn || !tn.groups[gi]) return;
  const grp = tn.groups[gi];
  const recTarget = (grp._recTarget||'').trim(); // pro | stage | none
  if (!recTarget) { alert('조편성 관리에서 해당 조의 “기록 반영”을 먼저 선택하세요.'); return; }
  const recRound = _pcNormalizeStageRound(grp._recRound||'16강');
  const savable = (window._pcAutoResults||[]).filter(r => r.wPlayer && r.lPlayer);
  if (!savable.length) return alert('저장 가능한 경기가 없습니다.');
  const defDate = (document.getElementById('pm_d')||{}).value || new Date().toISOString().slice(0,10);
  if (!grp.matches) grp.matches = [];

  // (요청사항) 같은 두 선수의 경기는 여러 줄이어도 매치 1건으로 합쳐서 저장
  // - 매치 안에는 _games[] 로 게임별 승자/맵/날짜를 보관
  const pairMap = new Map(); // key: 정렬된 두 선수 이름 → { aName, bName, games:[] }
  savable.forEach(r => {
    const aName = r.wPlayer.name, bName = r.lPlayer.name;
    const key = [aName, bName].slice().sort().join('|');
    let pair = pairMap.get(key);
    if (!pair) { pair = { aName, bName, games: [] }; pairMap.set(key, pair); }
    const mapVal = r.map && r.map !== '-' ? r.map : '';
    const dVal = (r._lineDate && /^\d{4}-\d{2}-\d{2}$/.test(r._lineDate)) ? r._lineDate : defDate;
    // pair.aName 기준으로 이번 게임의 승자를 A/B로 환산
    const winSide = (aName === pair.aName) ? 'A' : 'B';
    pair.games.push({ winner: winSide, map: mapVal, d: dVal, note: r.note || '' });
  });

  let added = 0;
  pairMap.forEach(pair => {
    const mid = 'pco_' + (Date.now()+added).toString(36) + Math.random().toString(36).slice(2,5);
    const games = pair.games;
    const scoreA = games.filter(g=>g.winner==='A').length;
    const scoreB = games.filter(g=>g.winner==='B').length;
    const winnerVal = scoreA>scoreB ? 'A' : scoreB>scoreA ? 'B' : '';
    const lastGame = games[games.length-1];
    const dVal = lastGame.d || defDate;
    const mapVal = games.length===1 ? (games[0].map||'') : '';
    const noteVal = games.map(g=>g.note).filter(Boolean).join(' / ');
    const newObj = { a: pair.aName, b: pair.bName, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: mid, _games: games };
    grp.matches.push(newObj);
    if (recTarget === 'pro') {
      games.forEach((g, idx) => {
        const gameId = `${mid}_s0_g${idx}`;
        applyGameResult(g.winner==='A'?pair.aName:pair.bName, g.winner==='A'?pair.bName:pair.aName, g.d, g.map||'', gameId, '', '', '프로리그대회');
      });
    } else if (recTarget === 'stage') {
      _pcEnsureStageRecords(tn);
      const sid = `ptr_${tnId}_${recRound}_${mid}`;
      newObj._stageRecId = sid;
      newObj._stageRecRound = recRound;
      tn.stageRecords[recRound].push({a:pair.aName,b:pair.bName,winner:winnerVal,d:dVal,map:mapVal,note:noteVal,_id:sid,_games:games});
      games.forEach((g, idx) => {
        const gameId = `${sid}_s0_g${idx}`;
        applyGameResult(g.winner==='A'?pair.aName:pair.bName, g.winner==='A'?pair.bName:pair.aName, g.d, g.map||'', gameId, '', '', '프로리그대회');
      });
    }
    added++;
  });
  save();
  document.getElementById('proMatchModal').remove();
  render();
  setTimeout(() => alert(`${pairMap.size}건의 매치(총 ${savable.length}경기)가 추가되었습니다.`), 100);
}

// (요청사항) 예전에 자동인식으로 한 줄씩 따로 저장된 경기들을 같은 두 선수 기준으로 합치는 마이그레이션 도구
// - 조별리그(모든 조)를 훑어서 같은 대결(선수 페어)이 매치 여러 건으로 나뉘어 있으면 하나로 합침
// - 기존 개인 전적(history)은 먼저 롤백 후, 합쳐진 매치 기준(새 matchId + _s0_g{n})으로 다시 반영
function proCompMergeDuplicateMatches(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn || !Array.isArray(tn.groups)) { alert('대회를 찾을 수 없습니다.'); return; }
  if (!confirm('같은 두 선수의 경기를 매치 1건으로 합칩니다.\n개인 전적은 자동으로 다시 계산되어 반영됩니다.\n계속하시겠습니까?')) return;

  let mergedMatchCount = 0, groupTouchedCount = 0;

  tn.groups.forEach(grp => {
    const matches = grp.matches || [];
    if (matches.length < 2) return;
    const recTarget = (grp._recTarget||'').trim();

    // 1) 같은 두 선수(순서 무관) 기준으로 그룹핑
    const pairMap = new Map(); // key -> { canonA, canonB, items:[] }
    matches.forEach(m => {
      if (!m.a || !m.b) return;
      const key = [m.a, m.b].slice().sort().join('|');
      let pair = pairMap.get(key);
      if (!pair) { pair = { canonA: m.a, canonB: m.b, items: [] }; pairMap.set(key, pair); }
      pair.items.push(m);
    });

    let groupTouched = false;
    pairMap.forEach(pair => {
      if (pair.items.length < 2) return; // 이미 1건뿐이면 합칠 필요 없음
      groupTouched = true;

      // 2) 기존 게임들을 canonA/canonB 기준으로 환산해 모으고, 기존 전적은 롤백
      const mergedGames = [];
      pair.items.forEach(item => {
        const subGames = (Array.isArray(item._games) && item._games.length)
          ? item._games
          : [{ winner: item.winner, map: item.map || '', d: item.d || '', note: item.note || '' }];
        subGames.forEach(g => {
          if (!g.winner) return;
          const winnerName = g.winner === 'A' ? item.a : item.b;
          const winnerCanon = winnerName === pair.canonA ? 'A' : 'B';
          mergedGames.push({ winner: winnerCanon, map: g.map || '', d: g.d || item.d || '', note: g.note || item.note || '' });
        });
        // 기존 전적 롤백 (stage 반영분이면 stageRecords에서도 제거)
        if (item._stageRecId) {
          try { _revertProMatch(item._stageRecId); } catch(e) {}
          try {
            const rr = item._stageRecRound || '16강';
            if (tn.stageRecords && Array.isArray(tn.stageRecords[rr])) {
              const si = tn.stageRecords[rr].findIndex(x => x && x._id === item._stageRecId);
              if (si >= 0) tn.stageRecords[rr].splice(si, 1);
            }
          } catch(e) {}
        } else if (item._id) {
          try { _revertProMatch(item._id); } catch(e) {}
        }
      });
      if (!mergedGames.length) return;

      // 3) 합쳐진 매치 1건 생성
      const mid = 'pco_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '_' + mergedMatchCount;
      const scoreA = mergedGames.filter(g => g.winner === 'A').length;
      const scoreB = mergedGames.filter(g => g.winner === 'B').length;
      const winnerVal = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : '';
      const lastGame = mergedGames[mergedGames.length - 1];
      const dVal = lastGame.d || '';
      const mapVal = mergedGames.length === 1 ? (mergedGames[0].map || '') : '';
      const noteVal = mergedGames.map(g => g.note).filter(Boolean).join(' / ');
      const newObj = { a: pair.canonA, b: pair.canonB, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: mid, _games: mergedGames };

      const recRound = _pcNormalizeStageRound(grp._recRound || '16강');
      if (recTarget === 'pro') {
        mergedGames.forEach((g, idx) => {
          const gameId = `${mid}_s0_g${idx}`;
          applyGameResult(g.winner === 'A' ? pair.canonA : pair.canonB, g.winner === 'A' ? pair.canonB : pair.canonA, g.d, g.map || '', gameId, '', '', '프로리그대회');
        });
      } else if (recTarget === 'stage') {
        _pcEnsureStageRecords(tn);
        const sid = `ptr_${tnId}_${recRound}_${mid}`;
        newObj._stageRecId = sid;
        newObj._stageRecRound = recRound;
        tn.stageRecords[recRound].push({ a: pair.canonA, b: pair.canonB, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: sid, _games: mergedGames });
        mergedGames.forEach((g, idx) => {
          const gameId = `${sid}_s0_g${idx}`;
          applyGameResult(g.winner === 'A' ? pair.canonA : pair.canonB, g.winner === 'A' ? pair.canonB : pair.canonA, g.d, g.map || '', gameId, '', '', '프로리그대회');
        });
      }

      // 4) 기존 여러 건 제거 후 합쳐진 1건으로 교체
      pair.items.forEach(item => {
        const idx = grp.matches.indexOf(item);
        if (idx >= 0) grp.matches.splice(idx, 1);
      });
      grp.matches.push(newObj);
      mergedMatchCount++;
    });
    if (groupTouched) groupTouchedCount++;
  });

  if (!mergedMatchCount) {
    alert('합칠 수 있는 중복 경기가 없습니다. (이미 정리되어 있거나 대결마다 1경기뿐입니다)');
    return;
  }
  save();
  render();
  setTimeout(() => alert(`${groupTouchedCount}개 조에서 ${mergedMatchCount}건의 매치로 합쳤습니다.`), 100);
}

try { window.proCompMergeDuplicateMatches = proCompMergeDuplicateMatches; } catch(e) {}

