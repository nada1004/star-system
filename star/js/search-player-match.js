/* ══════════════════════════════════════════════════════════════
   검색 - C포맷 파싱 & 선수명 유사매칭 (search-parsing.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function parseFormatC(line, prevScore) {
  const t = line.trim();

  // 형식 C-1: N세트 맵 선수A 점수A:점수B 선수B  (맵 있음, 5토큰)
  // 형식 C-2: N세트 선수A 점수A:점수B 선수B      (맵 없음, 4토큰)
  // 앞의 "N세트 / N셋" 접두어 제거 후 파싱
  const stripped = t.replace(/^\d+\s*(?:세트|셋)\s+/, '');

  // C-1 시도: 맵 선수A 점수:점수 선수B (5토큰)
  const m1 = stripped.match(/^(\S+)\s+(\S+)\s+(\d+)\s*:\s*(\d+)\s+(\S+)$/);
  // C-2 시도: 선수A 점수:점수 선수B (3토큰, 가운데 점수)
  const m2 = stripped.match(/^(\S+)\s+(\d+)\s*:\s*(\d+)\s+(\S+)$/);

  let mapRaw = null, playerA, playerB, scoreA, scoreB;

  if (m1) {
    const alias = getMapAlias();
    const tok0 = m1[1];
    // tok0이 맵 약자/이름이면 C-1, 아니면 C-2(맵 없음)로 처리
    // 판단 기준: alias에 있거나, maps[]에 있거나, 선수 이름이 아닌 한글 단어(맵명 추정)
    const inAlias = !!alias[tok0];
    const inMaps  = typeof maps !== 'undefined' && maps.includes(tok0);
    // tok0이 "선수 이름"인지 판별:
    // - 기존: players.name 정확 일치만 확인 → 메모 별명(예: 샤이니)이면 선수로 인식 못해서
    //        tok0을 맵으로 오판(C-1)하는 문제 발생
    // - 개선: findPlayerByPartialName(메모/별명 포함) 결과까지 반영
    const _fp = (typeof findPlayerByPartialName === 'function')
      ? findPlayerByPartialName(tok0)
      : { player: null, candidates: [] };
    const isPlayerName = (typeof players !== 'undefined' && players.some(p => p.name === tok0))
      || !!_fp.player
      || ((_fp.candidates||[]).length > 0);
    // 맵 판별:
    //  1) alias에 있거나 maps[]에 있으면 → 맵
    //  2) 선수 이름에 해당하면 → 선수(C-2 시도)
    //  3) 둘 다 아니면 → 맵으로 추정 (알 수 없는 맵명 허용)
    const isMapToken = inAlias || inMaps || !isPlayerName;
    if (isMapToken) {
      // C-1: 맵 있음
      mapRaw  = tok0;
      playerA = m1[2];
      scoreA  = parseInt(m1[3]);
      scoreB  = parseInt(m1[4]);
      playerB = m1[5];
    } else if (m2) {
      // tok0이 맵이 아니면 C-2로 재시도 (tok0 = 선수A)
      playerA = m2[1];
      scoreA  = parseInt(m2[2]);
      scoreB  = parseInt(m2[3]);
      playerB = m2[4];
    } else {
      // m1만 매칭, tok0이 맵도 아닌 경우: tok0=선수A, m1[2]=선수B처럼 보이지만
      // 스코어가 가운데에 없으므로 형식C가 아님
      return null;
    }
  } else if (m2) {
    playerA = m2[1];
    scoreA  = parseInt(m2[2]);
    scoreB  = parseInt(m2[3]);
    playerB = m2[4];
  } else {
    return null;
  }

  // 맵 이름 확정
  let map = '-';
  if (mapRaw) {
    map = resolveMapName(mapRaw);
    // 맵 자동 등록 금지 (저장 시에만 반영)
  }

  // 누적 스코어 변화로 이번 세트 승패 판별
  const prev = prevScore || { a: 0, b: 0 };
  const deltaA = scoreA - prev.a;
  const deltaB = scoreB - prev.b;
  if (!((deltaA===1&&deltaB===0)||(deltaA===0&&deltaB===1))) return null;

  const aWon = deltaA === 1;
  return {
    winName:   aWon ? playerA : playerB,
    loseName:  aWon ? playerB : playerA,
    map,
    nextScore: { a: scoreA, b: scoreB }
  };
}

/**
 * 한 줄 파싱 → {winName, loseName, map} | null
 *
 * 지원 형식 A: [맵] 선수명종족 (승) vs (패) 선수명종족
 * 지원 형식 B: 선수명종족 ✅ 🆚 ⬜ 선수명종족 🌍맵  (이모지 형식)
 * 지원 형식 C: N세트 맵약자 선수A 누적A:누적B 선수B
 *   앞 번호(1. 1️⃣ ① 등) 자동 제거
 */
// 부분 이름으로 선수 찾기 (약자 매칭)
// ── 유사도 계산 (Levenshtein distance 기반) ──────────────────
function _editDistance(a, b) {
  const m=a.length, n=b.length;
  const dp=Array.from({length:m+1},(_,i)=>{const r=new Array(n+1).fill(0);r[0]=i;return r;});
  for(let j=0;j<=n;j++) dp[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
    dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  }
  return dp[m][n];
}

// 유사 이름 후보 탐색 (미등록 이름에 대해 최대 5명 추천)
function _findSimilarPlayers(namePart, maxResults=5) {
  if (!namePart || !players.length) return [];
  const q = namePart.trim().toLowerCase();
  if (!q) return [];
  // 각 선수에 대해 유사도 점수 계산
  const scored = players.map(p => {
    const pn = p.name.toLowerCase();
    const pnNS = pn.replace(/\s+/g,''); // 공백 제거 버전
    const dist = _editDistance(q, pn);
    // 공통 문자 비율 (교집합)
    const qSet = new Set([...q]);
    const pSet = new Set([...pn]);
    const common = [...qSet].filter(c=>pSet.has(c)).length;
    const similarity = common / Math.max(qSet.size, pSet.size, 1);
    // 약자/줄임 보너스: 선수이름이 검색어를 포함하거나(접두/접미/부분), 검색어가 선수이름을 포함하면 점수 향상
    const containsBonus = (pnNS.includes(q) || q.includes(pnNS)) ? -1.5 : 0;
    // prefix/suffix 보너스: 선수이름이 검색어로 시작하거나 끝나면 추가 점수
    const prefixSuffixBonus = (pnNS.startsWith(q) || pnNS.endsWith(q)) ? -0.5 : 0;
    // 최종 점수: 거리 낮을수록, 공통문자 높을수록, 약자 관계일수록 좋음
    const score = dist - similarity * 2 + containsBonus + prefixSuffixBonus;
    const isContains = containsBonus !== 0;
    return { player: p, score, dist, isContains };
  });
  // 거리 기준: 이름 길이의 70% 이하 OR 포함 관계인 것
  const maxDist = Math.max(2, Math.ceil(namePart.length * 0.7));
  return scored
    .filter(s => s.dist <= maxDist || s.isContains)
    .sort((a,b) => a.score - b.score)
    .slice(0, maxResults)
    .map(s => s.player);
}

function findPlayerByPartialName(namePart) {
  if (!namePart) return { player: null, candidates: [], similar: [] };
  // \u3164(한글 채움 문자), \u00A0(non-breaking), 기타 비표준 공백 → 일반 공백으로 정규화
  const trimmed = namePart
    .replace(/[\u3164\u00A0\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .replace(/^[\[\(\{<「『"“‘]+/, '')
    .replace(/[\]\)\}>」』"”’]+$/, '')
    .trim();
  if (!trimmed) return { player: null, candidates: [], similar: [] };

  // 공백 정규화 버전: "안    아" → "안아"
  const noSpace = trimmed.replace(/\s+/g, '');
  // 종족 접미사 제거 버전: "샤이니P" → "샤이니" (메모/별명 매칭용)
  const noRace = trimmed.replace(/\s*[TZPNtzpn]$/i,'').trim();
  const noRaceNS = noSpace.replace(/\s*[TZPNtzpn]$/i,'').trim();

  // 1) 정확 일치 (이름)
  const exact = players.filter(p => p.name === trimmed);
  if (exact.length === 1) return { player: exact[0], candidates: exact, similar: [] };
  if (exact.length > 1)   return { player: null, candidates: exact, similar: [] };

  // 2) 메모 완전 일치 (짭제 → 박상현처럼 메모에 닉네임 저장)
  // - 토큰 분리 일치 + 대소문자 무시 + 원본 메모 전체 일치도 지원
  // - NFC 정규화: 다른 앱에서 복사 시 유니코드 형식 불일치 방지
  const _nfc = s => (s||'').normalize ? (s||'').normalize('NFC') : (s||'');
  const _trimmedLow = _nfc(trimmed).toLowerCase();
  const _noSpaceLow = _nfc(noSpace).toLowerCase();
  const _noRaceLow = _nfc(noRace).toLowerCase();
  const _noRaceNSLow = _nfc(noRaceNS).toLowerCase();
  // 메모 토큰 분리: 공백/쉼표뿐 아니라 ":" "/" "()" "[]" 등도 구분자로 처리
  const _memoTokens = (memoNorm) => {
    return String(memoNorm||'')
      .split(/[\s,，;|\/\\\r\n:\(\)\[\]\{\}<>]+/)
      .map(m=>m.trim())
      .filter(Boolean);
  };
  const memoExact = players.filter(p => {
    if (!p.memo) return false;
    const memoNorm = _nfc(p.memo);
    // 메모 전체 일치(원문/종족 제거)
    if (memoNorm.trim().toLowerCase() === _trimmedLow) return true;
    if (_noRaceLow && memoNorm.trim().toLowerCase() === _noRaceLow) return true;
    const memos = _memoTokens(memoNorm);
    return memos.some(m => {
      const ml = m.toLowerCase();
      return ml === _trimmedLow || (_noRaceLow && ml === _noRaceLow);
    });
  });
  if (memoExact.length === 1) {
    // 메모 일치 시 실제 스트리머 이름으로 변환하여 반환
    return { player: memoExact[0], candidates: memoExact, similar: [], memoMatch: true };
  }
  if (memoExact.length > 1)   return { player: null, candidates: memoExact, similar: [] };

  // 2.5) 공백 제거 후 정확 일치: "안    아" → "안아"
  if (noSpace !== trimmed && noSpace.length >= 1) {
    const nsExact = players.filter(p => p.name.replace(/\s+/g,'') === noSpace);
    if (nsExact.length === 1) return { player: nsExact[0], candidates: nsExact, similar: [] };
    if (nsExact.length > 1)   return { player: null, candidates: nsExact, similar: [] };
  }

  // 2.6) 메모 공백 제거 후 정확 일치: 메모에 "이 광 용" 처럼 공백 포함 저장된 경우
  if (_noSpaceLow.length >= 1) {
    const memoNS = players.filter(p => {
      if (!p.memo) return false;
      const memoNorm = _nfc(p.memo);
      const tokens = _memoTokens(memoNorm).map(m=>m.replace(/\s+/g,'').toLowerCase()).filter(Boolean);
      return tokens.some(t => t === _noSpaceLow || (_noRaceNSLow && t === _noRaceNSLow));
    });
    if (memoNS.length === 1) return { player: memoNS[0], candidates: memoNS, similar: [] };
    if (memoNS.length > 1)   return { player: null, candidates: memoNS, similar: [] };
  }

  // 2.65) 사용자 별명 매핑 (설정탭에서 등록)
  // - localStorage: su_player_alias_map = { "샤이니": "김재현", ... }
  // - 정확 이름 매칭(1,2.5,2.6) 이후에만 적용하여, 실명 입력이 별명에 의해 덮이지 않게 함
  try{
    const amap = JSON.parse(localStorage.getItem('su_player_alias_map')||'{}')||{};
    const _nfc2 = s => (s||'').normalize ? (s||'').normalize('NFC') : (s||'');
    const q1 = _nfc2(trimmed).replace(/\s+/g,'').toLowerCase();
    const q2 = _nfc2(noSpace).replace(/\s+/g,'').toLowerCase();
    const rs = _nfc2(trimmed.replace(/\s*[TZPNtzpn]$/i,'')).replace(/\s+/g,'').toLowerCase();
    let target = '';
    for(const k in amap){
      const nk = _nfc2(k).replace(/\s+/g,'').toLowerCase();
      if(!nk) continue;
      if(nk===q1 || nk===q2 || (rs && nk===rs)){ target = String(amap[k]||'').trim(); break; }
    }
    if(target){
      const p = (players||[]).find(p=>p && p.name===target);
      if(p) return { player: p, candidates: [p], similar: [], aliasMatch: true };
    }
  }catch(e){}

  // 2.7) 메모 포함 일치 (별명 우선 — 이름 부분일치보다 먼저 확인)
  // 이름 부분일치(step3)보다 앞에 두어야 짧은 선수명이 입력된 별명을 가로채는 것을 방지
  if (trimmed.length >= 2) {
    const memoPartial = players.filter(p => {
      if (!p.memo) return false;
      const memoNorm = _nfc(p.memo);
      // 토큰 단위 포함(권장) + 원문 포함(호환)
      const toks = _memoTokens(memoNorm).map(t=>t.toLowerCase());
      return toks.some(t => t.includes(_trimmedLow)) || memoNorm.toLowerCase().includes(_trimmedLow);
    });
    if (memoPartial.length === 1) return { player: memoPartial[0], candidates: memoPartial, similar: [] };
    if (memoPartial.length > 1)   return { player: null, candidates: memoPartial, similar: [] };
  }

  // 2.8) 종족 접미사(T/Z/P, 대소문자 무관) 제거 후 재시도
  // "샤이니T" → "샤이니" 로 재검색. parsePartWithRace가 종족을 못 걸러낸 경우 또는
  // 사용자가 종족 포함 이름을 그대로 입력했을 때도 메모/이름 매칭이 되도록 보장
  const _raceStripped = trimmed.replace(/\s*[TZPNtzpn]$/i, '').trim();
  if (_raceStripped && _raceStripped !== trimmed) {
    const _rsLow = _nfc(_raceStripped).toLowerCase();
    const _rsNS  = _nfc(_raceStripped).replace(/\s+/g,'').toLowerCase();
    // 이름 정확 일치
    const rsExact = players.filter(p => p.name === _raceStripped);
    if (rsExact.length === 1) return { player: rsExact[0], candidates: rsExact, similar: [] };
    // 메모 정확 일치 + 공백 제거 일치
    const rsMemo = players.filter(p => {
      if (!p.memo) return false;
      const mn = _nfc(p.memo);
      if (mn.trim().toLowerCase() === _rsLow) return true;
      const toks = _memoTokens(mn);
      return toks.some(t => t.toLowerCase() === _rsLow) ||
             toks.some(t => t.replace(/\s+/g,'').toLowerCase() === _rsNS);
    });
    if (rsMemo.length === 1) return { player: rsMemo[0], candidates: rsMemo, similar: [] };
    if (rsMemo.length > 1)   return { player: null, candidates: rsMemo, similar: [] };
    // 메모 포함 일치 (별명 우선)
    if (_raceStripped.length >= 2) {
      const rsMemoPartial = players.filter(p => {
        if (!p.memo) return false;
        const memoNorm = _nfc(p.memo);
        const toks = _memoTokens(memoNorm).map(t=>t.toLowerCase());
        return toks.some(t => t.includes(_rsLow)) || memoNorm.toLowerCase().includes(_rsLow);
      });
      if (rsMemoPartial.length === 1) return { player: rsMemoPartial[0], candidates: rsMemoPartial, similar: [] };
      if (rsMemoPartial.length > 1) return { player: null, candidates: rsMemoPartial, similar: [] };
    }
    // 이름 부분 일치
    if (_raceStripped.length >= 2) {
      const rsPartial = players.filter(p =>
        p.name.includes(_raceStripped) || _raceStripped.includes(p.name));
      if (rsPartial.length === 1) return { player: rsPartial[0], candidates: rsPartial, similar: [] };
      if (rsPartial.length > 1) {
        const rsSW = rsPartial.filter(p => p.name.startsWith(_raceStripped));
        if (rsSW.length === 1) return { player: rsSW[0], candidates: rsPartial, similar: [] };
        return { player: null, candidates: rsPartial, similar: [] };
      }
    }
  }

  // 3) 이름 부분 일치 — 2글자 이상
  if (trimmed.length >= 2) {
    const partial = players.filter(p =>
      p.name.includes(trimmed) || trimmed.includes(p.name)
    );
    if (partial.length === 1) return { player: partial[0], candidates: partial, similar: [] };
    if (partial.length > 1) {
      // startsWith 우선 (홍길 → 홍길동 우선 매핑)
      const sw = partial.filter(p => p.name.startsWith(trimmed));
      if (sw.length === 1) return { player: sw[0], candidates: partial, similar: [] };
      return { player: null, candidates: partial, similar: [] };
    }

    // 4.5) 공백 제거 후 부분 일치
    if (noSpace !== trimmed && noSpace.length >= 2) {
      const nsPartial = players.filter(p => {
        const pns = p.name.replace(/\s+/g,'');
        return pns.includes(noSpace) || noSpace.includes(pns);
      });
      if (nsPartial.length === 1) return { player: nsPartial[0], candidates: nsPartial, similar: [] };
      if (nsPartial.length > 1)   return { player: null, candidates: nsPartial, similar: [] };
    }

    // 4.7) 문자 포함 검색: noSpace의 모든 글자가 선수 이름에 포함된 경우
    // 예: "안아" → 이름에 '안'과 '아'가 모두 있는 선수
    const searchStr = noSpace.length >= 2 ? noSpace : trimmed;
    if (searchStr.length >= 2) {
      const chars = [...new Set([...searchStr])];
      const charMatch = players.filter(p => {
        const pn = p.name.replace(/\s+/g,'');
        return chars.every(ch => pn.includes(ch));
      });
      if (charMatch.length === 1) return { player: charMatch[0], candidates: charMatch, similar: [] };
      if (charMatch.length > 1)   return { player: null, candidates: charMatch, similar: [] };
    }
  }
  // 5) 미인식 → 유사 이름 후보 제안 (Levenshtein 기반)
  const similar = _findSimilarPlayers(trimmed);
  // 공백 제거 버전으로도 유사 검색
  const similarNS = noSpace !== trimmed ? _findSimilarPlayers(noSpace) : [];
  similarNS.forEach(p => { if (!similar.some(q => q.name === p.name)) similar.push(p); });
  // 메모 기반 후보도 '혹시:' 목록에 추가 (Levenshtein으로 찾을 수 없는 별명 대비)
  if (trimmed.length >= 2) {
    players.filter(p => p.memo && (
      _memoTokens(p.memo).some(t=>t===trimmed) ||
      p.memo.includes(trimmed)
    )).forEach(p => { if (!similar.some(q => q.name === p.name)) similar.push(p); });
  }
  return { player: null, candidates: [], similar };
}

// 붙여넣기 텍스트를 경기 단위 줄 배열로 분리
// 처리: 1️⃣(N티어)..2️⃣(N티어).. 처럼 한 줄에 붙은 경우 분리
