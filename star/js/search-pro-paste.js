/* ═══════════════════════════════════════════════════
   프로리그 전용 붙여넣기 모달
═══════════════════════════════════════════════════ */
window._proPasteResults = null;
window._proPasteMode = 'game'; // 'game' | 'set'
window._proFormat = 0;         // 0=자유, 2/3/4=팀전 포맷
window._proForceTeamA = null;  // (요청사항) 프로리그 자동인식 팀명 직접 입력 — 대학CK와 동일한 방식
window._proForceTeamB = null;

// (요청사항) 팀명 입력칸 → 저장 시 사용할 레이블로 반영
function onProPasteTeamNameInput() {
  const a = (document.getElementById('pro-paste-team-a')?.value || '').trim();
  const b = (document.getElementById('pro-paste-team-b')?.value || '').trim();
  window._proForceTeamA = a || null;
  window._proForceTeamB = b || null;
}

function _proPasteResolvePlayer(name) {
  const raw = String(name || '').trim();
  if (!raw) return { name: '', player: null, candidates: [], similar: [] };
  try {
    if (typeof window.resolvePlayerName === 'function') {
      const info = window.resolvePlayerName(raw);
      if (info && info.player) {
        return {
          name: info.player.name,
          player: info.player,
          candidates: Array.isArray(info.candidates) && info.candidates.length ? info.candidates : [info.player],
          similar: []
        };
      }
      if (info && Array.isArray(info.candidates) && info.candidates.length) {
        return { name: raw, player: null, candidates: info.candidates, similar: [] };
      }
    }
  } catch (e) {}
  const match = (typeof findPlayerByPartialName === 'function')
    ? findPlayerByPartialName(raw)
    : { player: null, candidates: [], similar: [] };
  return {
    name: match && match.player ? match.player.name : raw,
    player: match ? match.player : null,
    candidates: match && Array.isArray(match.candidates) ? match.candidates : [],
    similar: match && Array.isArray(match.similar) ? match.similar : []
  };
}

// ── 새 포맷: "N. 정우T경모P (패) vs (승) 현제Z윤환Z" 파싱 ──
// 다음 줄 "(맵1,맵2 / 맵3,맵4)" 는 proPreview()에서 연결해서 넘긴다
function parseProNewFormat(line) {
  let s = String(line||'')
    .replace(/^\s*\d+\s*[.．。]\s*/, '') // 앞 번호 제거
    .replace(/[\u3164\u00A0\u200B]/g, '') // 비표준 공백 제거
    .trim();
  // (패) vs (승) 또는 (승) vs (패) 마크 위치 찾기
  const vsRe = /\s*(\((?:패|승)\))\s*(?:vs|🆚)\s*(\((?:패|승)\))\s*/i;
  const vsM = s.match(vsRe);
  if (!vsM) return null;
  const vsIdx = s.indexOf(vsM[0]);
  if (vsIdx <= 0) return null;
  const leftRaw  = s.slice(0, vsIdx).trim();
  const rightRaw = s.slice(vsIdx + vsM[0].length).trim();
  const leftMark = vsM[1];
  const rightMark= vsM[2];
  if (!leftRaw || !rightRaw) return null;

  // 이름+종족 토큰 분리: "정우T경모P" 또는 "정우T 경모P" (공백 있어도 처리)
  // 종족코드 [TZPNR] 뒤에 다음 이름 시작 or 끝
  function splitNameRace(str) {
    // 먼저 공백으로 분리 시도
    const bySpace = str.trim().split(/\s+/);
    if (bySpace.length >= 2) {
      // 각 토큰이 종족으로 끝나는지 확인
      const names = bySpace.slice(0, 2).map(t => {
        const m = t.match(/^(.+?)([TZPNRtzpnr])$/);
        return m ? m[1] : t; // 종족 있으면 제거, 없으면 그대로
      });
      if (names.every(n => n.length > 0)) return names;
    }
    // 공백 없는 경우: "정우T경모P" — 종족코드 위치로 분리
    const raceAt = [];
    for (let i = 0; i < str.length; i++) {
      if (/[TZPNRtzpnr]/.test(str[i]) && i > 0) raceAt.push(i);
    }
    if (raceAt.length >= 2) {
      const cut = raceAt[0]; // 첫 종족코드 위치
      const name1 = str.slice(0, cut);           // "정우"
      const rest  = str.slice(cut + 1).trim();   // "경모P"
      const m2 = rest.match(/^(.+?)[TZPNRtzpnr]$/i);
      const name2 = m2 ? m2[1] : rest.replace(/[TZPNRtzpnr]$/i, '').trim();
      if (name1 && name2) return [name1, name2];
    }
    return null;
  }

  const leftNames  = splitNameRace(leftRaw);
  const rightNames = splitNameRace(rightRaw);
  if (!leftNames || !rightNames) return null;

  const leftWin  = /승/.test(leftMark);
  const rightWin = /승/.test(rightMark);
  if (leftWin === rightWin) return null;
  const winnerSide = leftWin ? 'L' : 'R';

  const l0 = _proPasteResolvePlayer(leftNames[0]);
  const l1 = _proPasteResolvePlayer(leftNames[1]);
  const r0 = _proPasteResolvePlayer(rightNames[0]);
  const r1 = _proPasteResolvePlayer(rightNames[1]);
  const leftPlayers  = [l0.player, l1.player];
  const rightPlayers = [r0.player, r1.player];
  const ok = leftPlayers.every(Boolean) && rightPlayers.every(Boolean);
  const leftName  = `${l0.name || leftNames[0]}, ${l1.name || leftNames[1]}`;
  const rightName = `${r0.name || rightNames[0]}, ${r1.name || rightNames[1]}`;
  const winName   = winnerSide === 'L' ? leftName : rightName;
  const loseName  = winnerSide === 'L' ? rightName : leftName;
  return {
    isTeam: true, winnerSide,
    leftNames, rightNames, leftPlayers, rightPlayers,
    leftMeta: [l0, l1], rightMeta: [r0, r1],
    leftName, rightName, winName, loseName,
    map: '-', _teamOk: ok, _isNewFmt: true
  };
}

// "(맵1,맵2 / 맵3,맵4)" 맵라인 파싱 → 맵 배열 (공백·괄호 유연 처리)
function _parseNewFmtMapLine(line) {
  const s = String(line||'').trim();
  // 바깥 괄호 제거 (있으면)
  const inner = s.replace(/^\(/, '').replace(/\)$/, '').trim();
  const slashIdx = inner.indexOf('/');
  if (slashIdx < 0) return null;
  const leftPart  = inner.slice(0, slashIdx);
  const rightPart = inner.slice(slashIdx + 1);
  const leftMaps  = leftPart.split(',').map(x => resolveMapName(x.trim())).filter(Boolean);
  const rightMaps = rightPart.split(',').map(x => resolveMapName(x.trim())).filter(Boolean);
  if (!leftMaps.length && !rightMaps.length) return null;
  return [...leftMaps, ...rightMaps];
}

function _proNormLine(line){
  line = String(line||'').replace(/[\u3164\u00A0\u200B\u202F\u205F\u3000\uFEFF]/g, ' ').trim();
  const _pasteCompat = (localStorage.getItem('su_paste_compat') ?? '1') === '1';
  if (_pasteCompat) {
    line = line
      .replace(/[（]/g, '(').replace(/[）]/g, ')')
      .replace(/🆚️/g, '🆚')
      .replace(/ＶＳ/g, 'vs')
      .replace(/V\s*\.?\s*S\s*\.?/gi, 'vs');
  }
  line = line.replace(/\s*[\u{10000}-\u{10FFFF}]+\s*$/u, '').trimEnd();
  return line;
}

function _proExtractMapAndBody(line){
  let map = '-';
  line = _proNormLine(line);
  const headMap = line.match(/^\[([^\]]+)\]\s*/);
  if (headMap) {
    const alias = headMap[1].trim();
    if (!/^[TZPNR]$/i.test(alias)) {
      map = resolveMapName(alias);
      line = line.slice(headMap[0].length).trim();
    }
  }
  return { body: line, map };
}

function _proStripMarks(s){
  s = String(s||'').trim();
  s = s.replace(/\((?:승|패)\)/g, '').trim();
  s = s.replace(/\((?:✅|⭕|☑|🔵|🟢|🟦|○|❌|✖|⬜|🔴|🟥|●)\)/g, '').trim();
  s = s.replace(/[✅⭕☑🔵🟢🟦○❌✖⬜🔴🟥●]$/g, '').trim();
  return s;
}

function _proWinnerByMark(leftRaw, rightRaw){
  const l = String(leftRaw||'');
  const r = String(rightRaw||'');
  const leftWin = /\((?:승)\)/.test(l) || /[✅⭕☑🔵🟢🟦○]/.test(l);
  const leftLose = /\((?:패)\)/.test(l) || /[❌✖⬜🔴🟥●]/.test(l);
  const rightWin = /\((?:승)\)/.test(r) || /[✅⭕☑🔵🟢🟦○]/.test(r);
  const rightLose = /\((?:패)\)/.test(r) || /[❌✖⬜🔴🟥●]/.test(r);
  if (leftWin || rightLose) return 'L';
  if (rightWin || leftLose) return 'R';
  return null;
}

function _proSplitTeamNames(sideText){
  const t0 = _proStripMarks(sideText);
  let t = t0.replace(/\s+/g, ' ').trim();
  t = t.replace(/[\(\)\[\]]/g,' ').replace(/\s+/g,' ').trim();
  t = t.replace(/[TZPNR]$/i, '').trim();
  const tokens = t.split(/\s*(?:,|\/|\+|＆|&|·|ㆍ|、|\|)\s*/).map(x=>x.trim()).filter(Boolean);
  if (tokens.length !== 2) return null;
  return tokens;
}

function parseProTeamLine(line){
  const { body, map: headMap } = _proExtractMapAndBody(line);
  if (!body) return null;
  const parts = body.split(/\s*(?:vs|🆚)\s*/i);
  if (parts.length !== 2) return null;
  let leftPart = parts[0].trim();
  let rightPart = parts[1].trim();
  let map = headMap;
  if (map === '-') {
    const tailHy = rightPart.match(/\s*[-–—－]\s*([^\s]+)\s*$/);
    if (tailHy) {
      const alias = tailHy[1].trim();
      const resolved = resolveMapName(alias);
      if (resolved !== alias) {
        map = resolved;
        rightPart = rightPart.slice(0, tailHy.index).trim();
      }
    }
  }
  if (map === '-') {
    const tailMap = rightPart.match(/\[([^\]]+)\]\s*$/);
    if (tailMap) {
      const alias = tailMap[1].trim();
      if (!/^[TZPNR]$/i.test(alias)) {
        map = resolveMapName(alias);
        rightPart = rightPart.slice(0, tailMap.index).trim();
      }
    }
  }
  const winnerSide = _proWinnerByMark(leftPart, rightPart);
  if (!winnerSide) return null;
  const leftNames = _proSplitTeamNames(leftPart);
  const rightNames = _proSplitTeamNames(rightPart);
  if (!leftNames || !rightNames) return null;
  const l0 = _proPasteResolvePlayer(leftNames[0]);
  const l1 = _proPasteResolvePlayer(leftNames[1]);
  const r0 = _proPasteResolvePlayer(rightNames[0]);
  const r1 = _proPasteResolvePlayer(rightNames[1]);
  const leftPlayers = [l0.player, l1.player];
  const rightPlayers = [r0.player, r1.player];
  const ok = leftPlayers.every(Boolean) && rightPlayers.every(Boolean);
  const leftName = `${l0.name || leftNames[0]}, ${l1.name || leftNames[1]}`;
  const rightName = `${r0.name || rightNames[0]}, ${r1.name || rightNames[1]}`;
  const winName = winnerSide === 'L' ? leftName : rightName;
  const loseName = winnerSide === 'L' ? rightName : leftName;
  return {
    isTeam: true,
    winnerSide,
    leftNames,
    rightNames,
    leftPlayers,
    rightPlayers,
    leftMeta: [l0, l1],
    rightMeta: [r0, r1],
    leftName,
    rightName,
    winName,
    loseName,
    map: map || '-',
    _teamOk: ok
  };
}

/* ── 팀전 포맷 선택 ── */
function setProFormat(n) {
  window._proFormat = n;
  const fmts = [0, 2, 3, 4];
  fmts.forEach(f => {
    const btn = document.getElementById(`pro-fmt-${f}-btn`);
    if (!btn) return;
    const on = f === n;
    btn.style.border = on ? '1.5px solid #7c3aed' : '1.5px solid var(--border2)';
    btn.style.background = on ? '#f5f3ff' : 'var(--white)';
    btn.style.color = on ? '#7c3aed' : 'var(--text3)';
    btn.style.fontWeight = on ? '900' : '700';
  });
  const hint = document.getElementById('pro-fmt-hint');
  if (hint) {
    hint.textContent = n === 0
      ? '포맷 선택 시 경기당 게임 수가 자동 그룹화됩니다'
      : `${n}:${n} 포맷 — 경기당 ${n*2}게임 (팀당 ${n}개씩) 기준으로 자동 그룹화`;
  }
  if (window._proPasteResults) proPreview();
}

/* ── 경기 구분선 삽입 ── */
function insertProMatchSep() {
  const ta = document.getElementById('pro-paste-input');
  if (!ta) return;
  const sep = '\n===경기구분===\n';
  const pos = ta.selectionStart;
  ta.value = ta.value.slice(0, pos) + sep + ta.value.slice(pos);
  ta.selectionStart = ta.selectionEnd = pos + sep.length;
  ta.focus();
  proPreview();
}

function openProPasteModal() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  const ta = document.getElementById('pro-paste-input');
  const prev = document.getElementById('pro-paste-preview');
  const applyBtn = document.getElementById('pro-apply-btn');
  const badge = document.getElementById('pro-paste-badge');
  const warn = document.getElementById('pro-paste-warn');
  const swapRow = document.getElementById('pro-swap-row');
  const multiBadge = document.getElementById('pro-multi-badge');
  if (ta) ta.value = '';
  if (prev) prev.innerHTML = '';
  if (applyBtn) applyBtn.style.display = 'none';
  if (badge) badge.style.display = 'none';
  if (warn) warn.style.display = 'none';
  if (swapRow) swapRow.style.display = 'none';
  if (multiBadge) multiBadge.style.display = 'none';
  window._proPasteResults = null;
  window._proPasteMode = 'game';
  // 팀명 입력칸 초기화
  window._proForceTeamA = null;
  window._proForceTeamB = null;
  const tlA = document.getElementById('pro-paste-team-a');
  const tlB = document.getElementById('pro-paste-team-b');
  if (tlA) tlA.value = '';
  if (tlB) tlB.value = '';
  // 날짜
  const di = document.getElementById('pro-paste-date');
  if (di) di.value = new Date().toISOString().slice(0, 10); // Always reset to today
  // 경기방식·포맷 초기화
  setProPasteMode('game');
  setProFormat(0);
  om('proPasteModal');
}

function closeProPasteModal() {
  window._proPasteResults = null;
  cm('proPasteModal');
}

function setProPasteMode(mode) {
  window._proPasteMode = mode;
  const gl = document.getElementById('pro-mode-game-lbl');
  const sl = document.getElementById('pro-mode-set-lbl');
  if (gl) gl.style.cssText = mode==='game'
    ? 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1'
    : 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3)';
  if (sl) sl.style.cssText = mode==='set'
    ? 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1'
    : 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3)';
  if (window._proPasteResults) renderProPreview(window._proPasteResults);
}

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

function renderProPreview(results) {
  const previewEl = document.getElementById('pro-paste-preview');
  const applyBtn = document.getElementById('pro-apply-btn');
  const badge = document.getElementById('pro-paste-badge');
  const swapRow = document.getElementById('pro-swap-row');
  const warn = document.getElementById('pro-paste-warn');
  if (!previewEl) return;
  if (!results || !results.length) {
    previewEl.innerHTML = '';
    if(applyBtn) applyBtn.style.display='none';
    if(swapRow) swapRow.style.display='none';
    if(badge) badge.style.display='none';
    return;
  }

  const isSavableRow = (r) => {
    if (r?.isTeam) {
      const lp = Array.isArray(r.leftPlayers) ? r.leftPlayers : [];
      const rp = Array.isArray(r.rightPlayers) ? r.rightPlayers : [];
      return lp.length === 2 && rp.length === 2 && lp.every(Boolean) && rp.every(Boolean) && (r.winnerSide === 'L' || r.winnerSide === 'R');
    }
    return !!(r?.wPlayer && r?.lPlayer);
  };
  const isNeedPickRow = (r) => {
    if (r?.isTeam) {
      if (isSavableRow(r)) return false;
      const metas = [...(r.leftMeta||[]), ...(r.rightMeta||[])];
      return metas.some(m => (m?.candidates?.length||0) > 1);
    }
    return (r?.wCandidates?.length>1 || r?.lCandidates?.length>1) && !(r?.wPlayer && r?.lPlayer);
  };
  const savable = results.filter(isSavableRow);
  const needPick = results.filter(isNeedPickRow);
  if (badge) {
    badge.style.display = 'inline';
    badge.textContent = `✅ ${savable.length}/${results.length}건 인식`;
    badge.style.background = savable.length===results.length?'#dcfce7':'#fef9c3';
    badge.style.color = savable.length===results.length?'#16a34a':'#b45309';
    badge.style.border = `1px solid ${savable.length===results.length?'#bbf7d0':'#fcd34d'}`;
  }
  if (warn) warn.style.display = needPick.length ? 'inline' : 'none';

  const allMaps = [...new Set([...maps.filter(m=>m&&m!=='-'), ...results.map(r=>r.map).filter(m=>m&&m!=='-')])].sort();
  const maxSet = Math.max(...results.map(r=>r.setNum||1), 1);
  const fmt = window._proFormat || 0;
  const fmtLabel = fmt > 0 ? `${fmt}:${fmt}` : '';

  // ── matchGroup별로 결과 분리 ──
  const matchGroupNums = [...new Set(results.map(r => r.matchGroup||0))].sort((a,b)=>a-b);
  const isMultiMatch = matchGroupNums.length > 1;

  // 행 렌더링 헬퍼 (matchGroup에 속하는 results의 글로벌 인덱스 i를 사용)
  const renderRow = (r, i) => {
    const ok = isSavableRow(r);
    const isTeam = !!r.isTeam;
    const wOk = !isTeam && !!r.wPlayer;
    const lOk = !isTeam && !!r.lPlayer;
    const wAmbig = !isTeam && !wOk && (r.wCandidates?.length > 1);
    const lAmbig = !isTeam && !lOk && (r.lCandidates?.length > 1);

    const leftRaw  = r.leftName  || r.winName  || '';
    const rightRaw = r.rightName || r.loseName || '';
    const isLeftWinner = isTeam ? (r.winnerSide === 'L') : (leftRaw === r.winName);

    const leftPlayer  = (!isTeam && wOk && r.wPlayer.name === leftRaw)  ? r.wPlayer
                      : (!isTeam && lOk && r.lPlayer.name === leftRaw)  ? r.lPlayer : null;
    const rightPlayer = (!isTeam && lOk && r.lPlayer.name === rightRaw) ? r.lPlayer
                      : (!isTeam && wOk && r.wPlayer.name === rightRaw) ? r.wPlayer : null;

    const leftRole  = leftRaw  === (r.winName||'')  ? 'w' : 'l';
    const rightRole = rightRaw === (r.loseName||'') ? 'l' : 'w';
    const leftSim   = leftRole  === 'w' ? (r.wSimilar||[]) : (r.lSimilar||[]);
    const rightSim  = rightRole === 'l' ? (r.lSimilar||[]) : (r.wSimilar||[]);
    const leftCands  = leftRole  === 'w' ? (r.wCandidates||[]) : (r.lCandidates||[]);
    const rightCands = rightRole === 'l' ? (r.lCandidates||[]) : (r.wCandidates||[]);
    const leftAmbig  = !isTeam && !leftPlayer  && leftCands.length > 1;
    const rightAmbig = !isTeam && !rightPlayer && rightCands.length > 1;

    const aName = leftPlayer  ? leftPlayer.name  : leftRaw;
    const bName = rightPlayer ? rightPlayer.name : rightRaw;

    const ho = (bg,def) => `onmouseover="this.style.background='${bg}'" onmouseout="this.style.background='${def}'"`;
    const winBadge  = `<span style="font-size:10px;color:#16a34a;font-weight:700;background:#dcfce7;border:1px solid #86efac;border-radius:4px;padding:1px 5px">승</span>`;
    const loseBadge = `<span style="font-size:10px;color:#dc2626;font-weight:700;background:#fee2e2;border:1px solid #fca5a5;border-radius:4px;padding:1px 5px">패</span>`;

    const buildTeamCell = (sideKey) => {
      const isLeft = sideKey === 'L';
      const names = isLeft ? (r.leftNames||[]) : (r.rightNames||[]);
      const playersArr = isLeft ? (r.leftPlayers||[]) : (r.rightPlayers||[]);
      const bOk0 = !!playersArr?.[0];
      const bOk1 = !!playersArr?.[1];
      const winLose = isLeftWinner === isLeft ? winBadge : loseBadge;
      const v0 = names?.[0] || '';
      const v1 = names?.[1] || '';
      return `<div style="display:flex;flex-direction:column;gap:4px">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:var(--fs-caption);font-weight:800;color:${isLeft?'#1d4ed8':'#991b1b'}">${isLeft?'A팀':'B팀'}</span>
          ${winLose}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <input value="${v0}" onchange="proEditTeamName(this,${i},'${sideKey}',0)"
            style="width:90px;border:1px solid ${bOk0?'#86efac':'#fca5a5'};border-radius:6px;padding:2px 6px;font-size:var(--fs-sm);font-weight:800;color:${bOk0?'#14532d':'#dc2626'};background:#fff" placeholder="선수1">
          <input value="${v1}" onchange="proEditTeamName(this,${i},'${sideKey}',1)"
            style="width:90px;border:1px solid ${bOk1?'#86efac':'#fca5a5'};border-radius:6px;padding:2px 6px;font-size:var(--fs-sm);font-weight:800;color:${bOk1?'#14532d':'#dc2626'};background:#fff" placeholder="선수2">
        </div>
      </div>`;
    };

    const buildACell = () => {
      if (isTeam) return buildTeamCell('L');
      if (leftPlayer) {
        return `<div style="display:inline-flex;align-items:center;gap:6px">
          <button class="pro-name-flip" data-idx="${i}" ${ho('#bfdbfe','#dbeafe')}
            style="font-size:var(--fs-base);font-weight:900;color:#1d4ed8;background:#dbeafe;border:1.5px solid #93c5fd;border-radius:8px;padding:3px 10px;cursor:pointer;white-space:nowrap">
            ${aName}</button>${isLeftWinner ? winBadge : loseBadge}</div>`;
      }
      if (leftAmbig) {
        return `<div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-size:var(--fs-caption);color:#b45309;font-weight:700">${aName}</span>
          <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${leftCands.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${leftRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#fef3c7','#fffbeb')} style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div></div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:3px">
        <input value="${aName}" data-idx="${i}" data-role="${leftRole}" onchange="proEditName(this,${i},'${leftRole}')"
          style="width:90px;border:1px solid #fca5a5;border-radius:5px;padding:2px 6px;font-size:var(--fs-sm);font-weight:700;color:#dc2626;background:#fff5f5" placeholder="선수명">
        ${leftSim.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">
          <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>
          ${leftSim.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${leftRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#ede9fe','#faf5ff')} style="padding:2px 8px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div>` : ''}
      </div>`;
    };

    const buildBCell = () => {
      if (isTeam) return buildTeamCell('R');
      if (rightPlayer) {
        return `<div style="display:inline-flex;align-items:center;gap:6px">
          <button class="pro-name-flip" data-idx="${i}" ${ho('#fecaca','#fee2e2')}
            style="font-size:var(--fs-base);font-weight:900;color:#991b1b;background:#fee2e2;border:1.5px solid #fca5a5;border-radius:8px;padding:3px 10px;cursor:pointer;white-space:nowrap">
            ${bName}</button>${isLeftWinner ? loseBadge : winBadge}</div>`;
      }
      if (rightAmbig) {
        return `<div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-size:var(--fs-caption);color:#b45309;font-weight:700">${bName}</span>
          <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${rightCands.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${rightRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#fef3c7','#fffbeb')} style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div></div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:3px">
        <input value="${bName}" data-idx="${i}" data-role="${rightRole}" onchange="proEditName(this,${i},'${rightRole}')"
          style="width:90px;border:1px solid #fca5a5;border-radius:5px;padding:2px 6px;font-size:var(--fs-sm);font-weight:700;color:#dc2626;background:#fff5f5" placeholder="선수명">
        ${rightSim.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">
          <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>
          ${rightSim.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${rightRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#ede9fe','#faf5ff')} style="padding:2px 8px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div>` : ''}
      </div>`;
    };

    const mapOpts = `<option value="-">-</option>` +
      allMaps.map(m=>`<option value="${m}" ${m===r.map?'selected':''}>${m}</option>`).join('') +
      `<option value="__custom__">직접입력...</option>`;
    const mapCell = `<select class="pro-map-sel" data-idx="${i}"
      style="width:80px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:var(--fs-caption)">${mapOpts}</select>`;

    let setOpts='';
    for(let s=1;s<=Math.max(maxSet,3);s++) setOpts+=`<option value="${s}" ${s===(r.setNum||1)?'selected':''}>${s}세트</option>`;
    const setCell = `<select class="pro-set-sel" data-idx="${i}"
      style="width:56px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:var(--fs-caption)">${setOpts}</select>`;

    const flipBtn = `<button class="pro-flip-btn" data-idx="${i}" title="A팀↔B팀 교체"
      style="padding:3px 6px;border-radius:5px;border:1px solid #ddd6fe;background:#f5f3ff;font-size:var(--fs-base);cursor:pointer;transition:.12s"
      onmouseover="this.style.background='#ede9fe'" onmouseout="this.style.background='#f5f3ff'">⇄</button>`;

    const statusBadge = ok
      ? `<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">✓저장</span>`
      : (isNeedPickRow(r) || wAmbig || lAmbig)
        ? `<span style="background:#fef9c3;color:#b45309;border:1px solid #fcd34d;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">선택↑</span>`
        : `<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">미인식</span>`;

    const delBtn = `<button class="pro-del-btn" data-idx="${i}"
      style="padding:3px 6px;border-radius:5px;border:1px solid #fecaca;background:#fff5f5;font-size:var(--fs-sm);cursor:pointer;transition:.12s"
      onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fff5f5'">🗑</button>`;

    const rowBg = ok ? '#f8faff' : (isNeedPickRow(r) || wAmbig || lAmbig) ? '#fffbeb' : '#fff8f8';
    return `<tr style="background:${rowBg};border-bottom:1px solid #f0f0f0">
      <td style="padding:5px 6px">${setCell}</td>
      <td style="padding:5px 6px">${mapCell}</td>
      <td style="padding:5px 10px">${buildACell()}</td>
      <td style="padding:5px 4px;text-align:center">${flipBtn}</td>
      <td style="padding:5px 10px">${buildBCell()}</td>
      <td style="padding:5px 5px">${statusBadge}</td>
      <td style="padding:5px 4px;text-align:center">${delBtn}</td>
    </tr>`;
  };

  // ── matchGroup별 점수 요약 헬퍼 ──
  const renderGroupSummary = (groupRows) => {
    const gSavable = groupRows.filter(isSavableRow);
    if (!gSavable.length) return '';
    const mode = window._proPasteMode || 'game';
    const setMap2 = {};
    gSavable.forEach(r => {
      const sn = r.setNum||1;
      if(!setMap2[sn]) setMap2[sn]={A:0,B:0};
      const leftN = r.leftName || r.winName;
      const isLeftWinner = r.isTeam ? (r.winnerSide === 'L') : (leftN === r.winName);
      if (isLeftWinner) setMap2[sn].A++; else setMap2[sn].B++;
    });
    const multiSet = Object.keys(setMap2).length > 1;
    let sa=0, sb=0;
    const setRows = Object.keys(setMap2).sort((a,b)=>a-b).map(sn=>{
      const s=setMap2[sn]; const sw=s.A>s.B?'A':s.B>s.A?'B':'';
      if(sw==='A') sa++; else if(sw==='B') sb++;
      return `<span style="display:inline-flex;align-items:center;gap:4px;background:${sw?'#f0fdf4':'#f8fafc'};border:1px solid ${sw?'#86efac':'#e2e8f0'};border-radius:8px;padding:3px 10px;font-size:var(--fs-sm)">
        <span style="font-size:10px;color:var(--gray-l);font-weight:600">${sn}세트</span>
        <span style="font-weight:800;color:${sw==='A'?'#1d4ed8':'#64748b'}">${s.A}</span>:
        <span style="font-weight:800;color:${sw==='B'?'#16a34a':'#64748b'}">${s.B}</span>
        ${sw?`<span style="font-size:10px;font-weight:700;color:#16a34a">${sw}조 ✓</span>`:''}
      </span>`;
    }).join('');
    const totalA = (mode==='set'||multiSet) ? sa : Object.values(setMap2).reduce((s,v)=>s+v.A,0);
    const totalB = (mode==='set'||multiSet) ? sb : Object.values(setMap2).reduce((s,v)=>s+v.B,0);
    const winner = totalA>totalB?'🔵 A팀':totalB>totalA?'🔴 B팀':'무승부';
    const fmtBadge = fmtLabel ? `<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:#ede9fe;color:#6d28d9;border:1px solid #c4b5fd;font-weight:700">${fmtLabel}</span>` : '';
    return `<div style="padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:${multiSet?'6px':'0'}">
        ${fmtBadge}
        <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">📊 결과${multiSet?' (세트제)':''}</span>
        ${multiSet?'':'<span style="flex:1"></span>'}
        ${!multiSet?`<span style="font-weight:900;font-size:14px;color:#1d4ed8">🔵 A팀</span>
        <span style="font-weight:900;font-size:var(--fs-lg);color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
        <span style="font-size:var(--fs-sm);color:var(--gray-l)">:</span>
        <span style="font-weight:900;font-size:var(--fs-lg);color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
        <span style="font-weight:900;font-size:14px;color:#dc2626">🔴 B팀</span>
        <span style="font-size:var(--fs-sm);font-weight:700;padding:2px 10px;border-radius:var(--r);background:${totalA===totalB?'#f1f5f9':'#dcfce7'};color:${totalA===totalB?'#64748b':'#15803d'}">${totalA===totalB?'🤝 무승부':'🏆 '+winner+' 승'}</span>`:''}
      </div>
      ${multiSet?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px">${setRows}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-weight:900;font-size:14px;color:#1d4ed8">🔵 A팀</span>
        <span style="font-weight:900;font-size:var(--fs-lg);color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
        <span style="font-size:var(--fs-sm);color:var(--gray-l)">:</span>
        <span style="font-weight:900;font-size:var(--fs-lg);color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
        <span style="font-weight:900;font-size:14px;color:#dc2626">🔴 B팀</span>
        <span style="font-size:var(--fs-sm);font-weight:700;padding:2px 10px;border-radius:var(--r);background:${totalA===totalB?'#f1f5f9':'#dcfce7'};color:${totalA===totalB?'#64748b':'#15803d'}">${totalA===totalB?'🤝 무승부':'🏆 '+winner+' 승'}</span>
      </div>`:''}
    </div>`;
  };

  // ── 경기 그룹별 HTML 빌드 ──
  let html = '';
  matchGroupNums.forEach(mg => {
    const groupRows = results.map((r,i) => ({r,i})).filter(({r}) => (r.matchGroup||0) === mg);
    if (!groupRows.length) return;
    const dateVal = (window._proMatchDates||{})[mg] || document.getElementById('pro-paste-date')?.value || '';
    if (isMultiMatch) {
      html += `<div style="margin-bottom:10px;border:2px solid #7c3aed;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(90deg,#5b21b6,#7c3aed);color:#fff;padding:7px 14px;display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-base);font-weight:900">🏅 경기 ${mg+1}</span>
          ${dateVal?`<span style="font-size:var(--fs-caption);opacity:.8">${dateVal}</span>`:''}
          ${fmtLabel?`<span style="font-size:var(--fs-caption);background:rgba(255,255,255,.2);border-radius:8px;padding:1px 7px">${fmtLabel}</span>`:''}
        </div>`;
    }
    html += `<div style="${isMultiMatch?'padding:8px 10px':'border:1px solid #ddd6fe;border-radius:var(--r);overflow:hidden;margin-bottom:10px'}">
    <table style="margin:0;width:100%;font-size:var(--fs-sm);border-collapse:collapse">
    <thead><tr style="background:${isMultiMatch?'#f5f3ff':'linear-gradient(90deg,#5b21b6,#7c3aed)'};color:${isMultiMatch?'#5b21b6':'#fff'}">
      <th style="padding:6px 8px;font-size:10px;width:56px">세트</th>
      <th style="padding:6px 8px;font-size:10px;width:84px">맵</th>
      <th style="padding:6px 10px;font-size:var(--fs-caption);font-weight:900">🔵 A팀</th>
      <th style="padding:6px 4px;font-size:10px;width:44px;text-align:center">교체</th>
      <th style="padding:6px 10px;font-size:var(--fs-caption);font-weight:900">🔴 B팀</th>
      <th style="padding:6px 4px;font-size:10px;width:56px">상태</th>
      <th style="padding:6px 4px;font-size:10px;width:32px;text-align:center">삭제</th>
    </tr></thead><tbody>`;
    groupRows.forEach(({r,i}) => { html += renderRow(r, i); });
    html += `</tbody></table></div>`;
    html += renderGroupSummary(groupRows.map(({r})=>r));
    if (isMultiMatch) html += `</div>`;
  });

  // ── DOM 업데이트 ──
  previewEl.innerHTML = html;

  // ── 이벤트 등록 ──

  // 이름 클릭 → 승패 교체
  previewEl.querySelectorAll('.pro-name-flip').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      const r = window._proPasteResults?.[idx];
      if (!r) return;
      [r.winName, r.loseName] = [r.loseName, r.winName];
      [r.wPlayer, r.lPlayer] = [r.lPlayer, r.wPlayer];
      [r.wCandidates, r.lCandidates] = [r.lCandidates||[], r.wCandidates||[]];
      [r.wSimilar, r.lSimilar] = [r.lSimilar||[], r.wSimilar||[]];
      renderProPreview(window._proPasteResults);
    });
  });

  // 픽 버튼 (중복/유사이름)
  previewEl.querySelectorAll('.pro-pick-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      const role = this.dataset.role;
      const name = this.dataset.name;
      if (!window._proPasteResults?.[idx]) return;
      const r = window._proPasteResults[idx];
      const p = players.find(pl => pl.name === name);
      if (!p) return;

      // 별칭 자동 저장
      const origName = role==='w' ? r.winName : r.loseName;
      _proAutoSaveAlias(origName, p);

      if (role==='w') {
        r.winName = p.name; r.wPlayer = p; r.wCandidates = [p]; r.wSimilar = [];
      } else {
        r.loseName = p.name; r.lPlayer = p; r.lCandidates = [p]; r.lSimilar = [];
      }

      // 다른 행에서 같은 선수 후보 있으면 자동 선택
      window._proPasteResults.forEach((row, ri) => {
        if (ri === idx) return;
        if (!row.wPlayer && (row.winName===origName || row.wCandidates?.some(c=>c.name===p.name) || row.wSimilar?.some(c=>c.name===p.name))) {
          row.winName=p.name; row.wPlayer=p; row.wCandidates=[p]; row.wSimilar=[];
        }
        if (!row.lPlayer && (row.loseName===origName || row.lCandidates?.some(c=>c.name===p.name) || row.lSimilar?.some(c=>c.name===p.name))) {
          row.loseName=p.name; row.lPlayer=p; row.lCandidates=[p]; row.lSimilar=[];
        }
      });

      renderProPreview(window._proPasteResults);
    });
  });

  // 전체 교체 버튼
  previewEl.querySelectorAll('.pro-flip-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      const r = window._proPasteResults?.[idx];
      if (!r) return;
      if (r.isTeam) {
        [r.leftNames, r.rightNames] = [r.rightNames||['',''], r.leftNames||['','']];
        [r.leftPlayers, r.rightPlayers] = [r.rightPlayers||[null,null], r.leftPlayers||[null,null]];
        [r.leftMeta, r.rightMeta] = [r.rightMeta||[], r.leftMeta||[]];
        const ln0 = (r.leftNames?.[0]||'').trim();
        const ln1 = (r.leftNames?.[1]||'').trim();
        const rn0 = (r.rightNames?.[0]||'').trim();
        const rn1 = (r.rightNames?.[1]||'').trim();
        r.leftName = ln0 && ln1 ? `${ln0}, ${ln1}` : (ln0 || ln1 || '');
        r.rightName = rn0 && rn1 ? `${rn0}, ${rn1}` : (rn0 || rn1 || '');
        r.winnerSide = r.winnerSide === 'L' ? 'R' : 'L';
        r.winName = r.winnerSide === 'L' ? r.leftName : r.rightName;
        r.loseName = r.winnerSide === 'L' ? r.rightName : r.leftName;
      } else {
        [r.winName, r.loseName] = [r.loseName, r.winName];
        [r.wPlayer, r.lPlayer] = [r.lPlayer, r.wPlayer];
        [r.wCandidates, r.lCandidates] = [r.lCandidates||[], r.wCandidates||[]];
        [r.wSimilar, r.lSimilar] = [r.lSimilar||[], r.wSimilar||[]];
      }
      renderProPreview(window._proPasteResults);
    });
  });

  // 세트 드롭다운
  previewEl.querySelectorAll('.pro-set-sel').forEach(sel => {
    sel.addEventListener('change', function() {
      const idx = parseInt(this.dataset.idx);
      if (window._proPasteResults?.[idx]) {
        window._proPasteResults[idx].setNum = parseInt(this.value);
        renderProPreview(window._proPasteResults);
      }
    });
  });

  // 맵 드롭다운
  previewEl.querySelectorAll('.pro-map-sel').forEach(sel => {
    sel.addEventListener('change', function() {
      const idx = parseInt(this.dataset.idx);
      if (!window._proPasteResults?.[idx]) return;
      if (this.value === '__custom__') {
        const custom = prompt('맵 이름을 직접 입력하세요:');
        if (custom && custom.trim()) {
          window._proPasteResults[idx].map = custom.trim();
          if (!maps.includes(custom.trim())) { maps.push(custom.trim()); save(); }
        }
      } else {
        window._proPasteResults[idx].map = this.value;
        // 맵 별칭 학습
        const rawMap = window._proPasteResults[idx]._rawMapStr;
        if (rawMap && this.value && this.value !== '-' && rawMap !== this.value) {
          if (!userMapAlias) userMapAlias = {};
          if (!userMapAlias[rawMap]) { userMapAlias[rawMap] = this.value; save(); }
        }
      }
      renderProPreview(window._proPasteResults);
    });
  });

  // 삭제 버튼
  previewEl.querySelectorAll('.pro-del-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      window._proPasteResults?.splice(idx, 1);
      renderProPreview(window._proPasteResults);
    });
  });

  // 스왑 로우
  if (swapRow) swapRow.style.display = results && results.length > 0 ? 'flex' : 'none';
  if (applyBtn) {
    applyBtn.style.display = results && results.length > 0 ? 'inline-flex' : 'none';
    applyBtn.textContent = `✅ ${savable.length}건 프로리그에 저장`;
  }
}

function proEditName(input, idx, role) {
  const name = input.value.trim();
  if (!name || !window._proPasteResults) return;
  const m = _proPasteResolvePlayer(name);
  const r = window._proPasteResults[idx];
  if (!r) return;
  const origName = role==='w' ? r.winName : r.loseName;
  if (role==='w') {
    r.wPlayer = m.player; r.winName = m.name || name;
    r.wCandidates = m.candidates; r.wSimilar = m.similar||[];
  } else {
    r.lPlayer = m.player; r.loseName = m.name || name;
    r.lCandidates = m.candidates; r.lSimilar = m.similar||[];
  }
  // 별명 자동 저장: 직접 입력해서 매칭에 성공한 경우, 다음부터 자동 인식되도록 등록
  _proAutoSaveAlias(origName, m.player);
  renderProPreview(window._proPasteResults);
}

// 붙여넣기 화면에서 사용자가 직접 입력/선택해 매칭에 성공한 별명을
// 선수 메모에 등록해서 다음 붙여넣기부터 자동 인식되게 함
function _proAutoSaveAlias(origName, player) {
  if (!origName || !player || origName === player.name) return;
  try {
    const memos = (player.memo||'').split(/[\s,\n]+/).map(s=>s.trim()).filter(Boolean);
    if (memos.includes(origName)) return;
    player.memo = memos.length ? player.memo + ' ' + origName : origName;
    save();
    const toast = document.createElement('div');
    toast.textContent = `✅ "${origName}" → "${player.name}" 자동 인식 등록됨`;
    Object.assign(toast.style, {position:'fixed',bottom:'76px',left:'50%',transform:'translateX(-50%)',background:'#1e3a8a',color:'#fff',padding:'9px 18px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',zIndex:'99999',opacity:'0',transition:'opacity .25s',whiteSpace:'nowrap'});
    document.body.appendChild(toast);
    requestAnimationFrame(()=>{ toast.style.opacity='1'; });
    setTimeout(()=>{ toast.style.opacity='0'; setTimeout(()=>toast.remove(),300); },2800);
  } catch(e) {}
}

function proEditTeamName(input, idx, sideKey, slot) {
  if (!window._proPasteResults) return;
  const r = window._proPasteResults[idx];
  if (!r || !r.isTeam) return;
  const name = (input?.value || '').trim();
  const origName = sideKey === 'L' ? (r.leftNames?.[slot] || '') : (r.rightNames?.[slot] || '');
  const m = name ? _proPasteResolvePlayer(name) : { name: '', player: null, candidates: [], similar: [] };
  _proAutoSaveAlias(origName, m.player);
  if (sideKey === 'L') {
    if (!Array.isArray(r.leftNames)) r.leftNames = ['', ''];
    if (!Array.isArray(r.leftPlayers)) r.leftPlayers = [null, null];
    if (!Array.isArray(r.leftMeta)) r.leftMeta = [null, null];
    r.leftNames[slot] = m.name || name;
    r.leftPlayers[slot] = m.player;
    r.leftMeta[slot] = m;
  } else {
    if (!Array.isArray(r.rightNames)) r.rightNames = ['', ''];
    if (!Array.isArray(r.rightPlayers)) r.rightPlayers = [null, null];
    if (!Array.isArray(r.rightMeta)) r.rightMeta = [null, null];
    r.rightNames[slot] = m.name || name;
    r.rightPlayers[slot] = m.player;
    r.rightMeta[slot] = m;
  }
  const ln0 = (r.leftNames?.[0]||'').trim();
  const ln1 = (r.leftNames?.[1]||'').trim();
  const rn0 = (r.rightNames?.[0]||'').trim();
  const rn1 = (r.rightNames?.[1]||'').trim();
  r.leftName = ln0 && ln1 ? `${ln0}, ${ln1}` : (ln0 || ln1 || '');
  r.rightName = rn0 && rn1 ? `${rn0}, ${rn1}` : (rn0 || rn1 || '');
  r.winName = r.winnerSide === 'L' ? r.leftName : r.rightName;
  r.loseName = r.winnerSide === 'L' ? r.rightName : r.leftName;
  renderProPreview(window._proPasteResults);
}

function swapProTeams() {
  if (!window._proPasteResults) return;
  // 팀명 입력칸도 함께 교체
  const _tmpTeamName = window._proForceTeamA;
  window._proForceTeamA = window._proForceTeamB;
  window._proForceTeamB = _tmpTeamName;
  const tlA = document.getElementById('pro-paste-team-a');
  const tlB = document.getElementById('pro-paste-team-b');
  if (tlA) tlA.value = window._proForceTeamA || '';
  if (tlB) tlB.value = window._proForceTeamB || '';
  window._proPasteResults = window._proPasteResults.map(r => {
    if (r?.isTeam) {
      const leftNames = r.leftNames || ['', ''];
      const rightNames = r.rightNames || ['', ''];
      const leftPlayers = r.leftPlayers || [null, null];
      const rightPlayers = r.rightPlayers || [null, null];
      const leftMeta = r.leftMeta || [null, null];
      const rightMeta = r.rightMeta || [null, null];
      const winnerSide = r.winnerSide === 'L' ? 'R' : 'L';
      const ln0 = (rightNames?.[0]||'').trim();
      const ln1 = (rightNames?.[1]||'').trim();
      const rn0 = (leftNames?.[0]||'').trim();
      const rn1 = (leftNames?.[1]||'').trim();
      const leftName = ln0 && ln1 ? `${ln0}, ${ln1}` : (ln0 || ln1 || '');
      const rightName = rn0 && rn1 ? `${rn0}, ${rn1}` : (rn0 || rn1 || '');
      return {
        ...r,
        leftNames: rightNames,
        rightNames: leftNames,
        leftPlayers: rightPlayers,
        rightPlayers: leftPlayers,
        leftMeta: rightMeta,
        rightMeta: leftMeta,
        winnerSide,
        leftName,
        rightName,
        winName: winnerSide === 'L' ? leftName : rightName,
        loseName: winnerSide === 'L' ? rightName : leftName,
      };
    }
    return {
      ...r,
      winName: r.loseName, loseName: r.winName,
      wPlayer: r.lPlayer, lPlayer: r.wPlayer,
      wCandidates: r.lCandidates||[], lCandidates: r.wCandidates||[],
      wSimilar: r.lSimilar||[], lSimilar: r.wSimilar||[],
    };
  });
  renderProPreview(window._proPasteResults);
}

function proApply() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  if (!window._proPasteResults) return;
  const isSavableRow = (r) => {
    if (r?.isTeam) {
      const lp = Array.isArray(r.leftPlayers) ? r.leftPlayers : [];
      const rp = Array.isArray(r.rightPlayers) ? r.rightPlayers : [];
      return lp.length === 2 && rp.length === 2 && lp.every(Boolean) && rp.every(Boolean) && (r.winnerSide === 'L' || r.winnerSide === 'R');
    }
    return !!(r?.wPlayer && r?.lPlayer);
  };
  const savable = window._proPasteResults.filter(isSavableRow);
  if (!savable.length) return alert('저장 가능한 경기가 없습니다.');
  const defaultDate = document.getElementById('pro-paste-date')?.value || new Date().toISOString().slice(0,10);
  const mode = window._proPasteMode || 'game';
  const fmt = window._proFormat || 0;

  // (요청사항) 프로리그 자동인식 저장 전 중복 확인
  const _toAdd = savable.map(r => {
    const d = (window._proMatchDates||{})[(r.matchGroup||0)] || defaultDate;
    const leftN = r.leftName || r.winName;
    const rightN = r.rightName || r.loseName;
    const isLeftWinner = r.isTeam ? (r.winnerSide === 'L') : (leftN === r.winName);
    const w = isLeftWinner ? leftN : rightN;
    const l = isLeftWinner ? rightN : leftN;
    return { mode:'pro', d, w, l, map: r.map || '' };
  });
  if (!_confirmDupBeforeSave(_toAdd)) return;

  // A조/B조 판별 헬퍼
  const resolveTeam = (r) => {
    if (r?.isTeam) {
      const aPlayers = Array.isArray(r.leftPlayers) ? r.leftPlayers : [null, null];
      const bPlayers = Array.isArray(r.rightPlayers) ? r.rightPlayers : [null, null];
      const winner = r.winnerSide === 'L' ? 'A' : 'B';
      return { isTeam: true, aPlayers, bPlayers, winner };
    }
    const leftN = r.leftName || r.winName;
    const rightN = r.rightName || r.loseName;
    const leftPlayerObj = players.find(p => p.name === leftN) || r.wPlayer;
    const rightPlayerObj = players.find(p => p.name === rightN) || r.lPlayer;
    const playerA = leftPlayerObj || r.wPlayer;
    const playerB = rightPlayerObj || r.lPlayer;
    const isLeftWinner = (leftN === r.winName);
    return { playerA, playerB, winner: isLeftWinner ? 'A' : 'B' };
  };

  // matchGroup별로 그룹핑
  const matchGroupNums = [...new Set(savable.map(r => r.matchGroup||0))].sort((a,b)=>a-b);
  let totalSaved = 0;

  matchGroupNums.forEach(mg => {
    const groupRows = savable.filter(r => (r.matchGroup||0) === mg);
    if (!groupRows.length) return;
    const matchId = genId();
    const dateVal = (window._proMatchDates||{})[mg] || defaultDate;

    // setsSnap 구성
    const setMap2 = {};
    groupRows.forEach(r => {
      const sn = r.setNum||1;
      if(!setMap2[sn]) setMap2[sn]=[];
      setMap2[sn].push(r);
    });
    const setsSnap = Object.keys(setMap2).sort((a,b)=>a-b).map(sn => {
      const rows = setMap2[sn];
      const games = rows.map(r => {
        const t = resolveTeam(r);
        if (t.isTeam) {
          const a1 = t.aPlayers?.[0]?.name || '';
          const a2 = t.aPlayers?.[1]?.name || '';
          const b1 = t.bPlayers?.[0]?.name || '';
          const b2 = t.bPlayers?.[1]?.name || '';
          return {
            _isTeam: true,
            a1, a2, b1, b2,
            playerA: [a1, a2].filter(Boolean).join(','),
            playerB: [b1, b2].filter(Boolean).join(','),
            map: r.map||'-',
            winner: t.winner
          };
        }
        return { playerA: t.playerA.name, playerB: t.playerB.name, map: r.map||'-', winner: t.winner };
      });
      const scoreA = games.filter(g=>g.winner==='A').length;
      const scoreB = games.filter(g=>g.winner==='B').length;
      const setWinner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'A';
      return { scoreA, scoreB, winner: setWinner, games };
    });

    // 경기방식 스코어
    const isMultiSet = Object.keys(setMap2).length > 1;
    let sa, sb;
    if (mode==='set' || isMultiSet) {
      sa = setsSnap.filter(s=>s.winner==='A').length;
      sb = setsSnap.filter(s=>s.winner==='B').length;
    } else {
      sa = setsSnap.reduce((s,st)=>s+st.scoreA,0);
      sb = setsSnap.reduce((s,st)=>s+st.scoreB,0);
    }

    // A조/B조 멤버 목록
    const mA=[], mB=[];
    groupRows.forEach(r => {
      const t = resolveTeam(r);
      if (t.isTeam) {
        (t.aPlayers||[]).forEach(p => {
          if (!p) return;
          if(!mA.find(x=>x.name===p.name)) mA.push({name:p.name,univ:p.univ||'',race:p.race||'',tier:p.tier||''});
        });
        (t.bPlayers||[]).forEach(p => {
          if (!p) return;
          if(!mB.find(x=>x.name===p.name)) mB.push({name:p.name,univ:p.univ||'',race:p.race||'',tier:p.tier||''});
        });
      } else {
        if(!mA.find(x=>x.name===t.playerA.name)) mA.push({name:t.playerA.name,univ:t.playerA.univ||'',race:t.playerA.race||'',tier:t.playerA.tier||''});
        if(!mB.find(x=>x.name===t.playerB.name)) mB.push({name:t.playerB.name,univ:t.playerB.univ||'',race:t.playerB.race||'',tier:t.playerB.tier||''});
      }
    });

    proM.unshift({_id:matchId, d:dateVal, sa, sb,
      teamALabel:String(window._proForceTeamA||'').trim()||'A팀',
      teamBLabel:String(window._proForceTeamB||'').trim()||'B팀',
      teamAMembers:mA, teamBMembers:mB,
      sets:setsSnap, univWins:{}, univLosses:{},
      scoreMode: (mode==='set' || isMultiSet) ? 'set' : 'game',
      ...(fmt > 0 ? {fmt} : {})
    });
    totalSaved += groupRows.length;
  });

  if (typeof fixPoints==='function') fixPoints();
  save();
  if (typeof syncProM==='function') syncProM();
  render();
  closeProPasteModal();

  // 프로리그 탭으로 이동
  if(typeof window._goTopTab === 'function') window._goTopTab('pro');

  // 성공 토스트
  const matchCount = matchGroupNums.length;
  const toast = document.createElement('div');
  toast.textContent = matchCount > 1
    ? `✅ ${matchCount}경기 (${totalSaved}게임) 프로리그 저장 완료!`
    : `✅ ${totalSaved}건 프로리그 저장 완료!`;
  toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;padding:12px 24px;border-radius:var(--r);font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(), 2800);
}
