/* ══════════════════════════════════════════════════════════════
   검색 - 프로리그 붙여넣기 파싱 (search-pro-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
