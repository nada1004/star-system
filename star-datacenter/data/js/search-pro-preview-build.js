/* ══════════════════════════════════════════════════════════════
   검색 - 프로리그 미리보기 생성 (search-pro-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proPreview() {
  const raw = (document.getElementById('pro-paste-input')?.value || '').trim();
  if (!raw) {
    document.getElementById('pro-paste-preview').innerHTML = '';
    document.getElementById('pro-apply-btn').style.display = 'none';
    document.getElementById('pro-swap-row').style.display = 'none';
    document.getElementById('pro-paste-badge').style.display = 'none';
    window._proPasteResults = null;
    return;
  }
  // 기존 parsePasteLine / splitPasteLines / parseSetSeparator 재사용
  const lines = splitPasteLines(raw);
  const results = [];
  let currentSet = 1;
  let currentMatch = 0;  // 경기 구분선으로 나뉘는 경기 그룹 번호
  // 경기 그룹별 날짜 추적
  const matchDates = {};
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    // [승]/[패] 세트 결과 요약 라인 무시
    if (/^\[(?:승|패)\]/.test(trimmed)) return;
    if (/\((?:승|패)\)\s*\d+\s*[：:]\s*\d+\s*\((?:승|패)\)/.test(trimmed)) return;
    // 경기 구분선 감지 (===경기구분=== 등) — 새 경기 그룹 시작
    if (/경기\s*구분/.test(trimmed)) {
      currentMatch++;
      currentSet = 1;
      return;
    }
    const sepResult = parseSetSeparator(trimmed);
    if (sepResult !== null) {
      if (sepResult === 0) currentSet++;
      else currentSet = sepResult;
      const setRem = trimmed.replace(/^\d+\s*(?:세트|셋|set)\s*/i, '').trim();
      if (setRem && setRem !== trimmed) {
        const t2 = parseProTeamLine(setRem);
        if (t2) {
          results.push({ ...t2, setNum: currentSet, matchGroup: currentMatch, lineNum: idx+1 });
        } else {
          const r2 = parsePasteLine(setRem);
          if (r2) {
            const wM2 = _proPasteResolvePlayer(r2.winName);
            const lM2 = _proPasteResolvePlayer(r2.loseName);
            results.push({ winName: wM2.name || r2.winName, loseName: lM2.name || r2.loseName,
              leftName: r2.leftName||r2.winName, rightName: r2.rightName||r2.loseName,
              map: r2.map||'-', setNum: currentSet, matchGroup: currentMatch,
              wPlayer: wM2.player, lPlayer: lM2.player,
              wCandidates: wM2.candidates, lCandidates: lM2.candidates,
              wSimilar: wM2.similar||[], lSimilar: lM2.similar||[], lineNum: idx+1 });
          }
        }
      }
      return;
    }
    // 날짜 줄 감지 → 현재 경기 그룹 날짜로 저장
    const _proDateM = trimmed.match(/^(?:일자|날짜)\s*[:：]\s*(\d{4}-\d{2}-\d{2})/);
    if (_proDateM) {
      matchDates[currentMatch] = _proDateM[1];
      // 첫 번째 경기면 날짜 입력창도 업데이트
      if (currentMatch === 0) {
        const _pdi = document.getElementById('pro-paste-date');
        if (_pdi) _pdi.value = _proDateM[1];
      }
      return;
    }
    // 새 포맷: "N. 이름T이름P (패) vs (승) 이름Z이름Z"
    const tNew = parseProNewFormat(line);
    if (tNew) {
      results.push({ ...tNew, setNum: currentSet, matchGroup: currentMatch, lineNum: idx+1, _pendingMapLine: true });
      return;
    }
    // 맵라인 "(맵1,맵2 / 맵3,맵4)" — 가장 가까운 미처리 새포맷 결과에 연결
    // 괄호로 시작하고 / 포함한 줄
    if (/^\(/.test(trimmed) && trimmed.includes('/') && results.length > 0) {
      // 뒤에서부터 _isNewFmt && _pendingMapLine 찾기
      let pendingIdx = -1;
      for (let ri = results.length - 1; ri >= 0; ri--) {
        if (results[ri] && results[ri]._isNewFmt && results[ri]._pendingMapLine) { pendingIdx = ri; break; }
        if (results[ri] && results[ri]._isNewFmt && !results[ri]._pendingMapLine) break; // 이미 처리됨
      }
      if (pendingIdx >= 0) {
        const mapArr = _parseNewFmtMapLine(trimmed);
        if (mapArr && mapArr.length > 0) {
          results[pendingIdx].map = mapArr[0];
          results[pendingIdx]._allMaps = mapArr;
          delete results[pendingIdx]._pendingMapLine;
          return;
        }
      }
    }
    const t = parseProTeamLine(line);
    if (t) {
      results.push({ ...t, setNum: currentSet, matchGroup: currentMatch, lineNum: idx+1 });
      return;
    }
    const parsed = parsePasteLine(line);
    if (!parsed) return;
    const wMatch = _proPasteResolvePlayer(parsed.winName);
    const lMatch = _proPasteResolvePlayer(parsed.loseName);
    results.push({
      winName: wMatch.name || parsed.winName, loseName: lMatch.name || parsed.loseName,
      leftName: parsed.leftName || parsed.winName, rightName: parsed.rightName || parsed.loseName,
      map: parsed.map || '-', setNum: currentSet, matchGroup: currentMatch,
      wPlayer: wMatch.player, lPlayer: lMatch.player,
      wCandidates: wMatch.candidates, lCandidates: lMatch.candidates,
      wSimilar: wMatch.similar||[], lSimilar: lMatch.similar||[],
      lineNum: idx+1
    });
  });
  // 경기 그룹별 날짜를 결과에 반영
  window._proMatchDates = matchDates;
  // 기존 선택 복원: 사용자가 이미 유사이름을 선택한 경우 재파싱 시 유지
  if (window._proPasteResults && window._proPasteResults.length === results.length) {
    results.forEach((r, i) => {
      const prev = window._proPasteResults[i];
      if (!prev) return;
      // 같은 라인이면 이전 선택 복원
      if (prev.isTeam && r.isTeam) {
        if (prev.leftName === r.leftName && prev.rightName === r.rightName) {
          if (prev.leftPlayers && r.leftPlayers) r.leftPlayers = prev.leftPlayers;
          if (prev.rightPlayers && r.rightPlayers) r.rightPlayers = prev.rightPlayers;
          if (prev.leftNames && r.leftNames) r.leftNames = prev.leftNames;
          if (prev.rightNames && r.rightNames) r.rightNames = prev.rightNames;
          if (prev.winnerSide) r.winnerSide = prev.winnerSide;
          if (prev.map && prev.map !== '-' && (r.map === '-' || !r.map)) r.map = prev.map;
          if (prev.setNum) r.setNum = prev.setNum;
        }
      } else if (!prev.isTeam && !r.isTeam) {
        if (prev.winName === r.winName && prev.loseName === r.loseName) {
          if (prev.wPlayer && !r.wPlayer) { r.wPlayer = prev.wPlayer; r.wCandidates = prev.wCandidates; r.wSimilar = prev.wSimilar; }
          if (prev.lPlayer && !r.lPlayer) { r.lPlayer = prev.lPlayer; r.lCandidates = prev.lCandidates; r.lSimilar = prev.lSimilar; }
          if (prev.map && prev.map !== '-' && (r.map === '-' || !r.map)) r.map = prev.map;
          if (prev.setNum) r.setNum = prev.setNum;
        }
      }
    });
  }
  // 파싱 결과가 비었는데 textarea에 내용이 있고 이전 결과가 있으면 인식창 유지
  if (results.length === 0 && raw.trim()) {
    const prev = window._proPasteResults;
    if (prev && prev.length > 0) return;
  }
  window._proPasteResults = results;
  renderProPreview(results);
}

