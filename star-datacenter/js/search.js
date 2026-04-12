// ── 검색바 실시간 DOM 필터링 (render() 없이 한글 IME 호환) ──────────────────
function recFilterInPlace(mode, query) {
  const q = (query || '').toLowerCase().trim();
  const container = document.getElementById('rec-list-' + mode);
  if (!container) return;
  const items = container.querySelectorAll('.rec-summary[data-hay]');
  let shown = 0;
  items.forEach(el => {
    const hay = (el.getAttribute('data-hay') || '').toLowerCase();
    const match = !q || hay.includes(q);
    el.style.display = match ? '' : 'none';
    if (match) shown++;
  });
  // 결과 카운트 업데이트
  const countEl = document.getElementById('rq-count-' + mode);
  if (countEl) countEl.textContent = q ? shown + '건' : '';
  // X 버튼 표시/숨김
  const clearBtn = document.getElementById('rq-clear-' + mode);
  if (clearBtn) clearBtn.style.display = q ? 'inline-block' : 'none';
  // 빈 결과 메시지
  const emptyEl = document.getElementById('rq-empty-' + mode);
  if (emptyEl) emptyEl.style.display = (q && shown === 0) ? 'block' : 'none';
  // 저장
  if (!window._recQ) window._recQ = {};
  window._recQ[mode] = query;
}

function recClearSearch(mode) {
  if (!window._recQ) window._recQ = {};
  window._recQ[mode] = '';
  const inp = document.getElementById('rq-' + mode);
  if (inp) { inp.value = ''; inp.focus(); }
  recFilterInPlace(mode, '');
}

/* ══════════════════════════════════════
   붙여넣기 자동 입력 기능
══════════════════════════════════════ */

// 맵 약자 → 전체 이름 매핑 (시스템 maps 배열에도 없으면 그대로 사용)
const PASTE_MAP_ALIAS_DEFAULT = {
  // ── 전체 이름 ──
  '투혼':'투혼','라데온':'라데온','라데리안':'라데온','녹아웃':'녹아웃','리트리트':'리트리트',
  '폴리포이드':'폴리포이드','플스타':'플스타','옥타곤':'옥타곤',
  '에티튜드':'에티튜드','매치포인트':'매치포인트','도미네이터':'도미네이터',
  '실피드':'실피드','블리츠':'블리츠','서킷':'서킷','신 개마고원':'신 개마고원',
  '아이언포리스트':'아이언포리스트','파이썬':'파이썬','화랑':'화랑','지옥섬':'지옥섬',
  '투영':'투영','네오리게이트':'네오리게이트','메트로폴리스':'메트로폴리스',
  // ── 약자 ──
  '라데':'라데온','라':'라데온','라데리안':'라데온',
  '녹아':'녹아웃','녹':'녹아웃',
  '리트':'리트리트','리':'리트리트',
  '폴':'폴리포이드','폴리':'폴리포이드','폴스':'폴리포이드',   // 폴스 추가
  '플스':'플스타','플립':'플스타',                             // 플립 추가
  '옥':'옥타곤','옥타':'옥타곤',                               // 옥타 추가
  '에티':'에티튜드','에':'에티튜드',
  '매':'매치포인트','매치':'매치포인트',
  '도미':'도미네이터','도':'도미네이터',
  '실':'실피드','실피':'실피드',
  '블리':'블리츠','블':'블리츠',
  '서':'서킷',
  '투':'투혼',
  '메트':'메트로폴리스','메':'메트로폴리스',
  '개마':'신 개마고원','신개마':'신 개마고원','개':'신 개마고원',
  '아이':'아이언포리스트','포리':'아이언포리스트','아이언':'아이언포리스트',
  '파이':'파이썬','파':'파이썬',
  '화':'화랑',
  '지옥':'지옥섬','지':'지옥섬',
  '네오':'네오리게이트','리게':'네오리게이트',
};

// 기본 약자 + 사용자 정의 약자를 합쳐 반환
function getMapAlias() {
  const user = typeof userMapAlias !== 'undefined' ? userMapAlias : {};
  const merged = Object.assign({}, PASTE_MAP_ALIAS_DEFAULT, user);
  // __disabled 마커가 있는 기본 약자 제외
  Object.keys(user).forEach(k => {
    if(k.endsWith('__disabled')) {
      const orig = k.replace('__disabled','');
      delete merged[orig];
      delete merged[k];
    }
  });
  return merged;
}

// 맵 이름 변환: exact alias → prefix 매칭(2자 이상) → 원본 반환
function resolveMapName(alias) {
  if (!alias) return alias;
  const dict = getMapAlias();
  if (dict[alias]) return dict[alias];
  if (alias.length < 2) return alias;
  // 등록된 전체 맵 이름 중 prefix 일치
  const allFull = [...new Set(Object.values(dict))];
  const pre = allFull.find(m => m.startsWith(alias));
  if (pre) return pre;
  // 사용자가 직접 등록한 maps 배열에서도 prefix 매칭
  const regPre = (typeof maps !== 'undefined' ? maps : []).find(m => m.startsWith(alias));
  if (regPre) return regPre;
  return alias;
}

/**
 * 형식 C 파싱: N세트 맵약자 선수A 누적A:누적B 선수B
 * 예) "1세트 실피 이재호 0:1 변현제"
 * 누적 스코어를 이전 줄과 비교해 이번 세트 승자를 판별.
 * prevScore = {a, b} (직전까지의 누적), null이면 0:0 기준
 * 반환: { winName, loseName, map, nextScore:{a,b} } | null
 */
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
    const isPlayerName = typeof players !== 'undefined' && players.some(p => p.name === tok0);
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
  const trimmed = namePart.replace(/[\u3164\u00A0\u200B\u202F\u205F\u3000\uFEFF]/g, ' ').trim();
  if (!trimmed) return { player: null, candidates: [], similar: [] };

  // 공백 정규화 버전: "안    아" → "안아"
  const noSpace = trimmed.replace(/\s+/g, '');

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
  const memoExact = players.filter(p => {
    if (!p.memo) return false;
    const memoNorm = _nfc(p.memo);
    if (memoNorm.trim().toLowerCase() === _trimmedLow) return true; // 메모 전체 일치
    const memos = memoNorm.split(/[\s,，\r\n]+/).map(m=>m.trim()).filter(Boolean);
    return memos.some(m => m.toLowerCase() === _trimmedLow);
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
      const tokens = memoNorm.split(/[\s,，\r\n]+/).map(m=>m.replace(/\s+/g,'').toLowerCase()).filter(Boolean);
      return tokens.some(t => t === _noSpaceLow);
    });
    if (memoNS.length === 1) return { player: memoNS[0], candidates: memoNS, similar: [] };
    if (memoNS.length > 1)   return { player: null, candidates: memoNS, similar: [] };
  }

  // 2.7) 메모 포함 일치 (별명 우선 — 이름 부분일치보다 먼저 확인)
  // 이름 부분일치(step3)보다 앞에 두어야 짧은 선수명이 입력된 별명을 가로채는 것을 방지
  if (trimmed.length >= 2) {
    const memoPartial = players.filter(p => {
      if (!p.memo) return false;
      const memoNorm = _nfc(p.memo);
      return memoNorm.includes(_trimmedLow) || memoNorm.toLowerCase().includes(_trimmedLow);
    });
    if (memoPartial.length === 1) return { player: memoPartial[0], candidates: memoPartial, similar: [] };
    if (memoPartial.length > 1)   return { player: null, candidates: memoPartial, similar: [] };
  }

  // 2.8) 종족 접미사(T/Z/P, 대소문자 무관) 제거 후 재시도
  // "샤이니T" → "샤이니" 로 재검색. parsePartWithRace가 종족을 못 걸러낸 경우 또는
  // 사용자가 종족 포함 이름을 그대로 입력했을 때도 메모/이름 매칭이 되도록 보장
  const _raceStripped = trimmed.replace(/\s*[TZPtzp]$/i, '').trim();
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
      const toks = mn.split(/[\s,，\n]+/).map(m => m.trim()).filter(Boolean);
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
        return memoNorm.includes(_rsLow) || memoNorm.toLowerCase().includes(_rsLow);
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
      p.memo.split(/[\s,，\n]+/).map(m=>m.trim()).filter(Boolean).some(t=>t===trimmed) ||
      p.memo.includes(trimmed)
    )).forEach(p => { if (!similar.some(q => q.name === p.name)) similar.push(p); });
  }
  return { player: null, candidates: [], similar };
}

// 붙여넣기 텍스트를 경기 단위 줄 배열로 분리
// 처리: 1️⃣(N티어)..2️⃣(N티어).. 처럼 한 줄에 붙은 경우 분리
function splitPasteLines(raw) {
  if (!raw) return [];
  // 줄바꿈 1차 분리
  const lines = raw.split(/\r?\n/);
  const result = [];
  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    // 숫자+키캡이모지(\uFE0F\u20E3) 또는 ①~⑳이 index>0에서 나타나면 그 앞에서 분리
    // 예: "1️⃣...라2️⃣...실" → ["1️⃣...라", "2️⃣...실"]
    // 경계 패턴: 숫자(0x30-0x39) + \uFE0F + \u20E3  or  ①~⑳(\u2460-\u2473)
    const positions = [];
    for (let i = 0; i < line.length; i++) {
      const code = line.charCodeAt(i);
      // 숫자 문자 뒤에 \uFE0F + \u20E3 가 오면 keycap
      if (code >= 0x30 && code <= 0x39) {
        if (line.charCodeAt(i+1) === 0xFE0F && line.charCodeAt(i+2) === 0x20E3) {
          if (i > 0) positions.push(i); // index 0이면 접두어라 분리 안함
          i += 2; // FE0F, 20E3 건너뜀
          continue;
        }
      }
      // ①~⑳ (\u2460~\u2473)
      if (code >= 0x2460 && code <= 0x2473) {
        if (i > 0) positions.push(i);
      }
    }
    if (positions.length === 0) {
      result.push(line);
      return;
    }
    let prev = 0;
    positions.forEach(pos => {
      const seg = line.slice(prev, pos).trim();
      if (seg) result.push(seg);
      prev = pos;
    });
    const last = line.slice(prev).trim();
    if (last) result.push(last);
  });
  return result;
}

/**
 * 새 형식 (Format D) 파싱:
 * N경기 - N티어\n패배!\n이름T\nVS\n이름Z\n승리!\n맵: 맵이름\n경기일 기준...
 */
function parseFormatD_blocks(raw) {
  const results = [];
  const lines = raw.split(/\r?\n/).map(l=>l.trim());
  // 빈 줄 제외 없이 인덱스로 처리
  let i=0;
  const nonEmpty = lines.filter(l=>l); // 빈줄 제외 배열

  // 여러 줄에 걸쳐 이름+종족 수집 헬퍼
  // 종족 단독줄: T, Z, P, T선픽, P선픽, Z선픽, T후픽, 선픽, 후픽 등
  const isRaceLine = l => /^([TZP](선픽|후픽)?|선픽|후픽)$/.test(l.trim());
  const isResultLine = l => l==='승리!'||l==='패배!';
  const isVsLine = l => /^VS$/i.test(l);
  const isMapLine = l => l.startsWith('맵:');
  const isGameHeader = l => /^\d+경기/.test(l);
  const isStatLine = l => l.includes('상대전적')||l.includes('경기일');

  // 전처리: 연속된 이름+종족줄을 합치는 로직
  // ex) ["키링P"] 또는 ["키링","P"] 또는 ["뀨알","P선픽"] → "키링P" or "뀨알P"
  function collectName(arr, startIdx) {
    // arr[startIdx]가 이름(또는 이름+종족), 다음줄이 종족 단독줄이면 합침
    let name = arr[startIdx] || '';
    let nextIdx = startIdx + 1;
    // 다음 줄이 종족/픽 단독줄이면 붙임
    if(nextIdx < arr.length && isRaceLine(arr[nextIdx]) && !isResultLine(arr[nextIdx]) && !isVsLine(arr[nextIdx]) && !isMapLine(arr[nextIdx])){
      name += arr[nextIdx];
      nextIdx++;
    }
    // 또 다음 줄이 선픽/후픽이면 붙임 (이름P\n선픽 형태)
    if(nextIdx < arr.length && /^(선픽|후픽)$/.test(arr[nextIdx])){
      name += arr[nextIdx];
      nextIdx++;
    }
    // 이름에서 종족+픽옵션 제거하여 순수 이름 추출
    const cleaned = name.replace(/[TZP](선픽|후픽)?$/, '').replace(/(선픽|후픽)$/, '').trim();
    return { name: cleaned, consumed: nextIdx - startIdx };
  }

  let ni = 0; // nonEmpty 인덱스
  while(ni < nonEmpty.length){
    const line = nonEmpty[ni];

    // ── 패턴 A: N경기로 시작하는 헤더 방식 ──
    // 지원: 헤더→result1→name1→VS→name2→result2→맵
    //       헤더→result1→·→result2→name1→VS→name2→맵 (이미지 형태)
    if(isGameHeader(line)){
      ni++;

      let result1=null, result2=null, name1='', name2='', mapName='-';
      if(ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result1=nonEmpty[ni];ni++;}
      else{ni++;continue;}

      // · 구분자 스킵
      while(ni<nonEmpty.length && /^[·•·\-–—~]+$/.test(nonEmpty[ni])) ni++;

      // result2가 바로 이어서 나오는 경우 (헤더→result1→·→result2→이름)
      if(ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result2=nonEmpty[ni];ni++;}

      // name1
      if(ni<nonEmpty.length && !isVsLine(nonEmpty[ni]) && !isMapLine(nonEmpty[ni]) && !isGameHeader(nonEmpty[ni])){
        const r = collectName(nonEmpty, ni);
        name1 = r.name;
        ni += r.consumed;
      }

      // VS 줄
      if(ni<nonEmpty.length && isVsLine(nonEmpty[ni])) ni++;

      // name2
      if(ni<nonEmpty.length && !isResultLine(nonEmpty[ni]) && !isMapLine(nonEmpty[ni]) && !isGameHeader(nonEmpty[ni])){
        const r = collectName(nonEmpty, ni);
        name2 = r.name;
        ni += r.consumed;
      }

      // result2 (이름 뒤에 나오는 경우)
      if(!result2 && ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result2=nonEmpty[ni];ni++;}

      // 맵 + 통계줄 스킵
      while(ni<nonEmpty.length){
        const ml=nonEmpty[ni];
        if(isMapLine(ml)){
          const rawMap=ml.replace('맵:','').trim();
          const alias=getMapAlias();
          mapName=alias[rawMap]||rawMap;
          ni++;break;
        }
        if(isGameHeader(ml)||isResultLine(ml))break;
        ni++;
      }
      // 통계줄 스킵 (최근 N일, 25년 이후, N:N, 상대전적)
      while(ni<nonEmpty.length && (/최근\s*\d+일|^\d+년|^\d+경기\s*[-—]|\d+\s*:\s*\d+/.test(nonEmpty[ni])||isStatLine(nonEmpty[ni]))){ni++;}

      if(name1&&name2&&result1&&result2){
        let winName='',loseName='';
        if(result1==='승리!'&&result2==='패배!'){winName=name1;loseName=name2;}
        else if(result1==='패배!'&&result2==='승리!'){winName=name2;loseName=name1;}
        // result2 early (result1·result2→name1→name2): result1=승리!=name1승, result2=패배!=name2패
        else if(result2&&result1==='승리!'&&result2==='패배!'){winName=name1;loseName=name2;}
        else if(result2&&result1==='패배!'&&result2==='승리!'){winName=name2;loseName=name1;}
        if(winName&&loseName) results.push({winName,loseName,map:mapName});
      }
      continue;
    }

    // ── 패턴 B: 승리!/패배! → (·구분자) → 이름 → VS → 이름 → 승리!/패배! → 맵 ──
    // 예: 승리!\n·\n패배!\n비재희\nZ\nVS\n엄보리\nP\n맵: 실피드\n최근 90일...\n6경기-2티어
    if(isResultLine(line)){
      let result1=line; ni++;
      // '·' 같은 구분자 스킵
      while(ni<nonEmpty.length && /^[·•·\-–—~]+$/.test(nonEmpty[ni])) ni++;
      // result2 (바로 이어서 나오는 승리!/패배!)
      let result2_early=null;
      if(ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result2_early=nonEmpty[ni];ni++;}
      // 이름1 수집
      let name1='', name2='', mapName='-', result2=result2_early;
      if(ni<nonEmpty.length && !isResultLine(nonEmpty[ni]) && !isVsLine(nonEmpty[ni]) && !isMapLine(nonEmpty[ni])){
        const r=collectName(nonEmpty,ni); name1=r.name; ni+=r.consumed;
      }
      // VS
      if(ni<nonEmpty.length && isVsLine(nonEmpty[ni])) ni++;
      // 이름2
      if(ni<nonEmpty.length && !isResultLine(nonEmpty[ni]) && !isVsLine(nonEmpty[ni]) && !isMapLine(nonEmpty[ni])){
        const r=collectName(nonEmpty,ni); name2=r.name; ni+=r.consumed;
      }
      // result2 (이름 뒤에 나오는 경우)
      if(!result2 && ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result2=nonEmpty[ni];ni++;}
      // 맵
      while(ni<nonEmpty.length){
        const ml=nonEmpty[ni];
        if(isMapLine(ml)){
          const rawMap=ml.replace('맵:','').trim();
          const alias=getMapAlias();
          mapName=alias[rawMap]||rawMap;
          ni++;break;
        }
        // 통계줄 스킵: '최근 N일', '25년 이후', 'N경기 - N티어' 형태
        if(/최근\s*\d+일|^\d+년|^\d+경기\s*[-—]|\d+\s*:\s*\d+/.test(ml)){ni++;continue;}
        if(isResultLine(ml)||isVsLine(ml)||isGameHeader(ml))break;
        ni++;
      }
      // 통계/부가정보 줄 추가 스킵
      while(ni<nonEmpty.length && (/최근\s*\d+일|^\d+년|^\d+경기\s*[-—]|\d+\s*:\s*\d+/.test(nonEmpty[ni])||isStatLine(nonEmpty[ni]))){ni++;}

      if(name1&&name2&&result1&&result2){
        let winName='',loseName='';
        if(result1==='승리!'&&result2==='패배!'){winName=name1;loseName=name2;}
        else if(result1==='패배!'&&result2==='승리!'){winName=name2;loseName=name1;}
        // result2_early: 승/패가 첫 블록에 몰린 경우 (승리!·패배! → 이름1 VS 이름2 → 맵)
        // 이 경우엔 result1=첫결과, result2=두번째결과, name1이 result1에 해당, name2가 result2에 해당
        if(!winName&&!loseName&&result2_early&&name1&&name2){
          if(result1==='승리!'&&result2_early==='패배!'){winName=name1;loseName=name2;}
          else if(result1==='패배!'&&result2_early==='승리!'){winName=name2;loseName=name1;}
        }
        if(winName&&loseName) results.push({winName,loseName,map:mapName});
      }
      continue;
    }

    ni++;
  }
  return results;
}

function parsePasteLine(line) {
  // \u3164(한글 채움 문자) 등 비표준 공백 → 일반 공백으로 정규화
  line = line.replace(/[\u3164\u00A0\u200B\u202F\u205F\u3000\uFEFF]/g, ' ').trim();
  if (!line) return null;
  // 꼬리 장식 이모지 제거 (예: [라] 👈 → [라])
  line = line.replace(/\s*[\u{10000}-\u{10FFFF}]+\s*$/u, '').trimEnd();

  // 앞쪽 번호/기호 제거
  // "1.", "1)", "1경기", "1경기.", "①~⑳", "1️⃣", "-", "•", "▶" 등
  // 1️⃣(6티어) 형태 분리: 앞 접두어 제거 후 실제 경기 내용만 추출
  // 예: "1️⃣(6티어)타밍T❌🆚✅하악Z🌐라" → "타밍T❌🆚✅하악Z🌐라"
  // 키캡 이모지(\uFE0F\u20E3) 포함 접두어를 문자 단위로 제거
  (function(){
    const code0 = line.charCodeAt(0);
    // 숫자+\uFE0F+\u20E3 (keycap 이모지) 제거
    if (code0 >= 0x30 && code0 <= 0x39 &&
        line.charCodeAt(1) === 0xFE0F && line.charCodeAt(2) === 0x20E3) {
      line = line.slice(3).trimStart();
    }
    // ①~⑳ 제거
    else if (code0 >= 0x2460 && code0 <= 0x2473) {
      line = line.slice(1).trimStart();
    }
    // 🅰️ (에이스전, U+1F170 surrogate: 0xD83C 0xDD70) 제거
    else if (code0 === 0xD83C && line.charCodeAt(1) === 0xDD70) {
      line = line.slice(2).trimStart();
      if (line.charCodeAt(0) === 0xFE0F) line = line.slice(1).trimStart();
    }
  })();
  line = line
    .replace(/^\(\d+티어\)\s*/i, '')              // (N티어) 괄호 제거
    .replace(/^\[\d+티어\]\s*/i, '')              // [N티어] 제거
    .replace(/^[\d]+\s*경기[\.\)·\s]*/i, '')      // N경기
    .replace(/^경기\s*[\d]+[\:\.\)·\s]*/i, '')    // 경기N:
    .replace(/^[\d]+[R라r][\.\)·\s]*/i, '')       // NR, N라운드
    .replace(/^[\d]+[\.\)]\s*/, '')               // N. N)
    .replace(/^[-•·▶▷>\s]+/, '')
    .trim();

  if (!line) return null;

  // ── 형식 B: 이모지 형식 (🆚) ──
  if (line.includes('🆚')) {
    const vsIdx = line.indexOf('🆚');
    let leftPart  = line.slice(0, vsIdx).trim();
    let rightPart = line.slice(vsIdx + '🆚'.length).trim();
    leftPart  = leftPart.replace(/️/g, '').replace(/\u3164/g, ' ').trim();
    rightPart = rightPart.replace(/️/g, '').replace(/\u3164/g, ' ').trim();
    // 장식용 이모지 제거 (👊 등)
    leftPart  = leftPart.replace(/👊/g, '').trim();
    rightPart = rightPart.replace(/👊/g, '').trim();

    const WIN_MARKS  = ['✅', '⭕', '☑', '🔵', '🟢', '🟦', '○'];
    const LOSE_MARKS = ['❌', '✖', '⬜', '🔴', '🟥', '●'];
    const ALL_MARKS  = [...WIN_MARKS, ...LOSE_MARKS];

    let leftMark = null;
    for (const mk of ALL_MARKS) {
      if (leftPart.endsWith(mk)) { leftMark = mk; leftPart = leftPart.slice(0, -mk.length).trim(); break; }
    }
    let rightMark = null;
    for (const mk of ALL_MARKS) {
      if (rightPart.startsWith(mk)) { rightMark = mk; rightPart = rightPart.slice(mk.length).trim(); break; }
    }

    // (이모지마크) 괄호 형태 폴백: (❌) (🔵) 등
    if (!leftMark) {
      for (const mk of ALL_MARKS) {
        if (leftPart.endsWith('('+mk+')')) {
          leftMark = mk; leftPart = leftPart.slice(0, -(mk.length+2)).trim(); break;
        }
      }
    }
    if (!rightMark) {
      for (const mk of ALL_MARKS) {
        if (rightPart.startsWith('('+mk+')')) {
          rightMark = mk; rightPart = rightPart.slice(mk.length+2).trim(); break;
        }
      }
    }

    // (승)/(패) 텍스트 마크 폴백 (예: "P마토 (승) 🆚️ T뚜미 (패) [폴리]")
    if (!leftMark) {
      const mL = leftPart.match(/\((승|패)\)\s*$/);
      if (mL) {
        leftMark = mL[1]==='승' ? '✅' : '❌';
        leftPart = leftPart.slice(0, leftPart.lastIndexOf('('+mL[1]+')')).trim();
      }
    }
    if (!rightMark) {
      const mR = rightPart.match(/\((승|패)\)/);
      if (mR) {
        rightMark = mR[1]==='승' ? '✅' : '❌';
        rightPart = rightPart.replace(mR[0], ' ').trim();
      }
    }

    if (!leftMark || !rightMark) return null;

    const leftWin  = WIN_MARKS.includes(leftMark);
    const rightWin = WIN_MARKS.includes(rightMark);
    if (leftWin === rightWin) return null;

    let map = '-';
    let rightClean = rightPart;

    // 맵 추출: 🌐맵 / 🌍맵 이모지 방식 또는 [맵약자] 브라켓 방식 모두 지원
    // ※ [🌐🌍] 문자클래스는 서로게이트 쌍을 개별 코드유닛으로 처리해 오작동 → alternation 사용
    const mapEmoji = rightPart.match(/(?:🌐|🌍)\s*(\S+)/);
    const mapBracket = rightPart.match(/\[([^\]]+)\]\s*$/);

    if (mapEmoji) {
      // 이모지 방식: 선수명🌐맵
      const alias = mapEmoji[1].trim();
      map = resolveMapName(alias);
      rightClean = rightPart.slice(0, mapEmoji.index).trim();
    } else if (mapBracket) {
      // 브라켓 방식 (우측 끝): 선수명 [맵약자]
      const alias = mapBracket[1].trim();
      map = resolveMapName(alias);
      rightClean = rightPart.slice(0, mapBracket.index).trim();
    } else {
      // (맵약자) 소괄호 방식 (우측 끝): 선수명 P (라데)
      const mapParen = rightPart.match(/\(([^)]+)\)\s*$/);
      if (mapParen) {
        const alias = mapParen[1].trim();
        // 마크 이모지가 아닌 경우만 맵으로 처리
        const isMarkEmoji = ALL_MARKS.includes(alias);
        if (!isMarkEmoji) {
          map = resolveMapName(alias);
          rightClean = rightPart.slice(0, mapParen.index).trim();
        }
      }
    }

    // 좌측 앞 [맵약자] 방식: [폴리] 이지다⬜🆚✅경콩이
    if (map === '-') {
      const leftBracket = leftPart.match(/^\[([^\]]+)\]\s*/);
      if (leftBracket) {
        map = resolveMapName(leftBracket[1].trim());
        leftPart = leftPart.slice(leftBracket[0].length).trim();
      }
    }

    const splitNR = (s) => {
      // [Z]이름 형식 (종족 브라켓이 앞에, 앞에 장식 있어도 허용)
      const frontBracketM = s.match(/^[^\[]*\[([TZPN])\](.+)$/);
      if (frontBracketM && frontBracketM[2].trim()) return { name: frontBracketM[2].trim(), race: frontBracketM[1] };
      // 앞 종족 접두사 제거: Z조이, P마토, T주양 → 조이, 마토, 주양
      const prefixM = s.match(/^([TZPN])(.+)$/);
      if (prefixM && prefixM[2].trim()) return { name: prefixM[2].trim(), race: prefixM[1] };
      const bracketM = s.match(/^(.+?)\[(\d*)([TZPN])\]$/);
      if (bracketM) return { name: bracketM[1].trim(), race: bracketM[3] };
      const simpleM = s.match(/^(.+?)([TZP])$/);
      if (simpleM) return { name: simpleM[1].trim(), race: simpleM[2] };
      return { name: s.trim(), race: '' };
    };
    const left  = splitNR(leftPart);
    const right = splitNR(rightClean);
    if (!left.name || !right.name) return null;

    // rawMapStr for format B (from emoji/bracket extraction)
    const _bRawMap = mapEmoji ? mapEmoji[1].trim() : (mapBracket ? mapBracket[1].trim() : '');
    return {
      winName:  leftWin  ? left.name  : right.name,
      loseName: leftWin  ? right.name : left.name,
      map, _rawMapStr: _bRawMap,
      leftName: left.name, rightName: right.name
    };
  }

  // ── 형식 E: 맵약자 선수A[WIN][LOSE]선수B (🆚 없음, 마크 인접) ──
  // 예: "녹 예리✅⬜복실" → map=녹두전선, 예리승 / "도 상문⬜✅병구" → 병구승
  {
    const WIN_MARKS_E  = ['✅', '⭕', '☑'];
    const LOSE_MARKS_E = ['❌', '⬜'];
    let markPairIdx = -1, markPairLen = 2, leftIsWin = false;
    for (let i = 0; i < line.length - 1; i++) {
      const c1 = line[i], c2 = line[i + 1];
      if (WIN_MARKS_E.includes(c1) && LOSE_MARKS_E.includes(c2)) {
        markPairIdx = i; leftIsWin = true; break;
      }
      if (LOSE_MARKS_E.includes(c1) && WIN_MARKS_E.includes(c2)) {
        markPairIdx = i; leftIsWin = false; break;
      }
    }
    if (markPairIdx > 0) {
      const beforePart = line.slice(0, markPairIdx).trim();
      const afterPart  = line.slice(markPairIdx + markPairLen).trim();
      let mapAlias = '', leftPlayerStr = beforePart;
      const spaceIdx = beforePart.indexOf(' ');
      if (spaceIdx > 0) {
        const candidate = beforePart.slice(0, spaceIdx).trim();
        const resolved  = resolveMapName(candidate);
        if (resolved !== candidate) {
          mapAlias = candidate;
          leftPlayerStr = beforePart.slice(spaceIdx + 1).trim();
        }
      }
      const eMap = mapAlias ? resolveMapName(mapAlias) : '-';
      const splitNR_E = (s) => {
        const prefixM = s.match(/^([TZP])(.+)$/);
        if (prefixM && prefixM[2].trim()) return { name: prefixM[2].trim(), race: prefixM[1] };
        const bracketM = s.match(/^(.+?)\[(\d*)([TZP])\]$/);
        if (bracketM) return { name: bracketM[1].trim(), race: bracketM[3] };
        const simpleM = s.match(/^(.+?)([TZP])$/);
        if (simpleM) return { name: simpleM[1].trim(), race: simpleM[2] };
        return { name: s.trim(), race: '' };
      };
      const left  = splitNR_E(leftPlayerStr);
      const right = splitNR_E(afterPart);
      if (left.name && right.name) {
        return {
          winName:  leftIsWin ? left.name  : right.name,
          loseName: leftIsWin ? right.name : left.name,
          map: eMap, _rawMapStr: mapAlias,
          leftName: left.name, rightName: right.name
        };
      }
    }
  }

  // ── 형식 F: 이모지 마크 + vs 형식 ──
  // 예: "⭕라박이 vs 영주❌", "❌라박이 vs 영주⭕ (폴)", "라박이⭕ vs ❌영주 [라]"
  {
    const vsMatchF = line.match(/^(.+?)\s+vs\s+(.+)$/i);
    if (vsMatchF) {
      const WIN_F  = ['✅', '⭕', '☑'];
      const LOSE_F = ['❌', '⬜'];
      const ALL_F  = [...WIN_F, ...LOSE_F];
      let lp = vsMatchF[1].replace(/️/g, '').trim();
      let rp = vsMatchF[2].replace(/️/g, '').trim();
      // 맵을 마크 검사 전에 먼저 추출: [맵] 또는 (맵) 형식
      let fMap = '-';
      const mbF = rp.match(/\[([^\]]+)\]\s*$/) || rp.match(/\(([^)]+)\)\s*$/);
      if (mbF) {
        const cand = mbF[1].trim();
        const res = resolveMapName(cand);
        if (res !== cand || getMapAlias()[cand] || (typeof maps !== 'undefined' && maps.includes(cand))) {
          fMap = res; rp = rp.slice(0, mbF.index).trim();
        }
      }
      let lMark = null, rMark = null;
      for (const mk of ALL_F) { if (lp.startsWith(mk)) { lMark = mk; lp = lp.slice(mk.length).trim(); break; } }
      if (!lMark) { for (const mk of ALL_F) { if (lp.endsWith(mk)) { lMark = mk; lp = lp.slice(0,-mk.length).trim(); break; } } }
      for (const mk of ALL_F) { if (rp.startsWith(mk)) { rMark = mk; rp = rp.slice(mk.length).trim(); break; } }
      if (!rMark) { for (const mk of ALL_F) { if (rp.endsWith(mk)) { rMark = mk; rp = rp.slice(0,-mk.length).trim(); break; } } }
      if (lMark && rMark) {
        const lWin = WIN_F.includes(lMark), rWin = WIN_F.includes(rMark);
        if (lWin !== rWin) {
          const splitNR_F = (s) => {
            const pm = s.match(/^([TZP])(.+)$/); if (pm && pm[2].trim()) return { name: pm[2].trim(), race: pm[1] };
            const bm = s.match(/^(.+?)\[(\d*)([TZP])\]$/); if (bm) return { name: bm[1].trim(), race: bm[3] };
            const sm = s.match(/^(.+?)([TZP])$/); if (sm) return { name: sm[1].trim(), race: sm[2] };
            return { name: s.trim(), race: '' };
          };
          const left = splitNR_F(lp), right = splitNR_F(rp);
          if (left.name && right.name) {
            return { winName: lWin ? left.name : right.name, loseName: lWin ? right.name : left.name,
              map: fMap, leftName: left.name, rightName: right.name };
          }
        }
      }
    }
  }

  // ── 형식 G: 선수A vs 선수B → 승자 승 | 맵 ──
  // 예: "야생땃쥐 vs 요시 → 요시 승 | 폴리포이드"
  {
    const arrowIdx = line.indexOf('→');
    if (arrowIdx > 0) {
      let gLeft = line.slice(0, arrowIdx).trim();
      let gRight = line.slice(arrowIdx + 1).trim();
      // | 맵명 추출
      let gMap = '-';
      const pipeSep = gRight.match(/\|\s*(.+)$/);
      if (pipeSep) {
        gMap = resolveMapName(pipeSep[1].trim());
        gRight = gRight.slice(0, pipeSep.index).trim();
      }
      // "승자 승" 또는 "승자 승리"
      const winMatch = gRight.match(/^(.+?)\s+(승|승리)$/);
      if (winMatch) {
        const winnerRaw = winMatch[1].trim();
        const vsParts = gLeft.split(/\s+vs\s+/i);
        if (vsParts.length === 2) {
          const nameA = vsParts[0].trim();
          const nameB = vsParts[1].trim();
          if (nameA && nameB && winnerRaw) {
            // 승자가 A측인지 B측인지 판별 (포함 관계로 매칭)
            const aIsWinner = nameA === winnerRaw || nameA.includes(winnerRaw) || winnerRaw.includes(nameA);
            return {
              winName:  aIsWinner ? nameA : nameB,
              loseName: aIsWinner ? nameB : nameA,
              map: gMap,
              leftName: nameA, rightName: nameB
            };
          }
        }
      }
    }
  }

  // ── 형식 A: [맵] 이름(승/패) vs (승/패)이름 ──
  // 맵 추출: 줄 맨 앞 [xxx] 또는 줄 끝 [xxx] 또는 줄 끝 단어(약자/등록맵)
  let map = '-';
  // 1) 맨 앞 [맵]
  const mapMatch = line.match(/^\[([^\]]+)\]/);
  let _rawMapStr = '';
  if (mapMatch) {
    const rawAlias = mapMatch[1].trim();
    _rawMapStr = rawAlias;
    map = getMapAlias()[rawAlias] || rawAlias;
    line = line.slice(mapMatch[0].length).trim();
  } else {
    // 2) 줄 끝 [맵]
    const mapEnd = line.match(/\[([^\]]+)\]\s*$/);
    if (mapEnd) {
      const rawAlias = mapEnd[1].trim();
      _rawMapStr = rawAlias;
      map = getMapAlias()[rawAlias] || rawAlias;
      line = line.slice(0, mapEnd.index).trim();
    } else {
      // 3) 줄 끝 단어가 alias/maps에 있으면 맵으로 처리
      const lastWord = line.match(/(\S+)\s*$/);
      if (lastWord) {
        const lw = lastWord[1];
        const _aDict = getMapAlias();
        const _resolved = resolveMapName(lw);
        if (_aDict[lw] || (typeof maps !== 'undefined' && maps.includes(lw)) || (_resolved !== lw && lw.length >= 2)) {
          _rawMapStr = lw;
          map = _resolved;
          line = line.slice(0, lastWord.index).trim();
        }
      }
    }
  }

  // vs 구분자로 좌/우 분리
  // 지원: " vs ", " VS ", " v ", " Vs "
  const vsSplit = line.split(/\s+vs\s+|\s+VS\s+|\s+Vs\s+/i);

  // ── 형식 A-1: 종족 있음 "이름T(승/패)" ──
  const parsePartWithRace = (s) => {
    s = s.trim();
    // 이름 종족(선택) (승/패) : "장윤철T(패)", "장윤철 T (패)", "장윤철(패)"
    const m = s.match(/^(.+?)\s*([TZP])?\s*\((승|패)\)$/);
    if (m) return { name: m[1].trim(), race: m[2] || '', result: m[3] };
    // (승/패) 이름 종족(선택) 형식: "(패) 이재호T", "(승)이재호"
    const m2 = s.match(/^\((승|패)\)\s*(.+?)\s*([TZP])?$/);
    if (m2) return { name: m2[2].trim(), race: m2[3] || '', result: m2[1] };
    return null;
  };

  if (vsSplit.length >= 2) {
    const p1 = parsePartWithRace(vsSplit[0]);
    const p2 = parsePartWithRace(vsSplit[1]);
    if (p1 && p2) {
      if (p1.result === '승' && p2.result === '패') return { winName: p1.name, loseName: p2.name, map, leftName: p1.name, rightName: p2.name };
      if (p1.result === '패' && p2.result === '승') return { winName: p2.name, loseName: p1.name, map, _rawMapStr, leftName: p1.name, rightName: p2.name };
    }
  }

  // ── 형식 A-2: vs 없이 두 선수가 순서대로 나열된 경우 ──
  // 예: "[에티] 장윤철(패) (승)이재호" (vs 생략)
  {
    const parts = [];
    const pat = /(.+?)\s*([TZP])?\s*\((승|패)\)|(\((?:승|패)\))\s*(.+?)\s*([TZP])?(?=\s|$)/g;
    let m3;
    while ((m3 = pat.exec(line)) !== null) {
      if (m3[1]) parts.push({ name: m3[1].trim(), result: m3[3] });
      else if (m3[4]) parts.push({ name: m3[5].trim(), result: m3[4].replace(/[()]/g,'') });
    }
    if (parts.length >= 2) {
      const [q1, q2] = parts;
      if (q1.result === '승' && q2.result === '패') return { winName: q1.name, loseName: q2.name, map, _rawMapStr, leftName: q1.name, rightName: q2.name };
      if (q1.result === '패' && q2.result === '승') return { winName: q2.name, loseName: q1.name, map, _rawMapStr, leftName: q1.name, rightName: q2.name };
    }
  }

  // ── 형식 H: 승자:패자 초간단 형식 ──
  // 예: "이영호:박정석" / "이영호:박정석 라데" / "이영호:박정석 라데리안"
  {
    const hm = line.match(/^([^:\s][^:]*):([^:\s][^:]*)(?:\s+(\S.*))?$/);
    if (hm) {
      const hWin = hm[1].trim(), hLose = hm[2].trim();
      const hMapRaw = (hm[3]||'').trim();
      // 순수 숫자(스코어)는 제외: "3:2" 같은 패턴 차단
      if (hWin && hLose && !/^\d+$/.test(hWin) && !/^\d+$/.test(hLose)) {
        const hMap = hMapRaw ? resolveMapName(hMapRaw) : '-';
        return { winName: hWin, loseName: hLose, map: hMap, _rawMapStr: hMapRaw,
          leftName: hWin, rightName: hLose };
      }
    }
  }

  return null;
}

// 세트 구분선 판별 및 세트 번호 추출
// 반환: null(아님) 또는 숫자(세트번호, 0=증가)
function parseSetSeparator(line) {
  const t = line.trim();
  if (!t) return null;

  // 세트 번호 추출 헬퍼
  const extractSetNum = (s) => {
    const m1 = s.match(/(\d+)\s*세트/); if(m1) return parseInt(m1[1]);
    const m2 = s.match(/(\d+)\s*셋/);   if(m2) return parseInt(m2[1]);
    const m3 = s.match(/⚔?\s*(\d+)\s*SET/i); if(m3) return parseInt(m3[1]);
    if(/ACE|에이스/i.test(s)) return 3;
    return null;
  };

  // ⚔NSET 형식 최우선 (예: ⚔1SET 5/3, ⚔2SET, ⚔3SET ACE)
  if(/⚔/.test(t)){
    const n=extractSetNum(t);
    return n!==null?n:0;
  }

  // ▶Nset 형식 (예: ▶1set 5/3 [ 0:3 팀명 승 ], ▶슈에, ▶슈퍼에이스)
  if(/^[▶►▸]/.test(t)){
    const inner=t.replace(/^[▶►▸]\s*/,'');
    if(/슈에|슈퍼\s*에이스|super\s*ace/i.test(inner)) return 99;
    const n=extractSetNum(inner);
    return n!==null?n:0;
  }

  // 구분선 문자 집합: ═ ─ = - ㅡ _ ~ * ·
  const SEP = /[═─=\-ㅡ_~*·]/;

  // 패턴 1: 구분선 문자가 3개 이상 포함된 줄 (세트 숫자 유무 무관)
  // 예: ─────1세트─────, =====2세트=====, 1셋ㅡㅡㅡㅡ, --2세트--, ======
  // 구분선: 특수문자 3개 이상 + 줄 길이의 40% 이상이 구분선 문자여야 세트구분으로 인식
  // (이름에 하이픈 있는 경우 오파싱 방지)
  const sepCount = (t.match(/[═─=\-ㅡ_~]/g) || []).length;
  const isSepLine = sepCount >= 3 && sepCount >= Math.floor(t.length * 0.4);
  if (isSepLine) {
    const n = extractSetNum(t);
    return n !== null ? n : 0; // 0 = 번호 없으면 자동 증가
  }

  // 패턴 2: "N세트" 또는 "N셋" 단독 줄 (구분선 없어도)
  // 예: "2세트", "세트 3", "3셋", "에이스전"
  if (/^(\d+\s*세트|세트\s*\d+|\d+\s*셋|셋\s*\d+|에이스전?|ace)$/i.test(t)) {
    const n = extractSetNum(t);
    return n !== null ? n : 0;
  }

  // 패턴 3: "1SET", "2SET", "3SET" 형식 (대소문자 무관, 단독 줄)
  // 예: "1SET", "2 SET", "3SET ACE"
  if (/^\d+\s*SET/i.test(t)) {
    const n = parseInt(t.match(/(\d+)/)[1]);
    return n;
  }

  // 패턴 4: ===1세트=== / ---2세트--- 형식 (구분선 비율 낮아도 숫자+세트 있으면 세트구분)
  if (/(\d+)\s*(세트|셋|SET)/i.test(t) && /[═─=\-ㅡ_~*·]/.test(t)) {
    const n = extractSetNum(t);
    return n !== null ? n : 0;
  }

  // 패턴 5: 이모지 등 접두어 + "N SET" 형식 (경기결과 마커 없는 경우만)
  // 예: "🔥 1 SET", "🔥 2 SET", "🔥 3 SET SUPER ACE"
  if (!t.includes('🆚') && !t.includes('✅') && !t.includes('❌') && !t.includes('⬜') && !t.includes('⭕')) {
    const m5 = t.match(/(\d+)\s*SET/i);
    if (m5) return parseInt(m5[1]);

    // 패턴 5b: SUPER ACE / 슈퍼에이스 단독 줄 → 3세트
    if (/SUPER\s*ACE|슈퍼\s*에이스/i.test(t)) return 3;
  }

  return null;
}

// TSV 5번째 열에서 저장 경로 타입 감지
// 인식 키워드: mini/미니/미니대전 → 'mini', gj/끝장전 → 'gj', ind/개인전 → 'ind'
function _parseTsvType(s) {
  if (!s) return null;
  const t = s.trim().toLowerCase();
  if (['mini','미니','미니대전'].includes(t)) return 'mini';
  if (['gj','끝장전'].includes(t)) return 'gj';
  if (['ind','개인전','individual'].includes(t)) return 'ind';
  return null;
}

function pastePreview() {
  const raw = (document.getElementById('paste-input')?.value || '').trim();
  const previewEl = document.getElementById('paste-preview');
  const applyBtn = document.getElementById('paste-apply-btn');
  if (!previewEl) return;
  if (!raw) { previewEl.innerHTML = ''; if(applyBtn) applyBtn.style.display='none'; return; }

  // ── 형식 D 우선 감지: 패배!/승리! 형식 (N경기 - N티어\n패배!\n이름\nVS\n이름\n승리!\n맵: ...) ──
  if (raw.includes('패배!') || raw.includes('승리!')) {
    const dResults = parseFormatD_blocks(raw);
    if (dResults.length > 0) {
      const results = dResults.map((r, i) => {
        const wMatch = findPlayerByPartialName(r.winName);
        const lMatch = findPlayerByPartialName(r.loseName);
        return {
          winName: r.winName, loseName: r.loseName, map: r.map,
          setNum: r.setNum || 1,
          wPlayer: wMatch.player, lPlayer: lMatch.player,
          wCandidates: wMatch.candidates, lCandidates: lMatch.candidates,
          wSimilar: wMatch.similar||[], lSimilar: lMatch.similar||[],
          lineNum: i + 1, rawLine: r.winName + ' vs ' + r.loseName
        };
      });
      window._pasteResults = results;
      window._pasteErrors = [];
      renderPastePreview(results, []);
      return;
    }
  }

  const lines = splitPasteLines(raw); // 한줄 붙은 복수경기 자동 분리
  const results = [];
  const errors = [];
  let currentSet = 1;
  let currentLineDate = null; // "일자: YYYY-MM-DD" 줄로 설정되는 현재 날짜
  let formatCScore = null;   // 형식 C 누적 스코어 상태 { a, b }
  let isFormatC    = false;  // 이번 블록이 형식 C인지

  // 팀 로스터 초기화 (라인 "팀명 : 멤버1 멤버2..." 감지)
  window._pasteRosterA = null;
  window._pasteRosterB = null;
  // 이미 수동으로 설정된 팀명이 없으면 초기화
  if (!window._pasteForceTeamA) window._pasteForceTeamA = null;
  if (!window._pasteForceTeamB) window._pasteForceTeamB = null;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // ── 무시할 라인 패턴 ──
    // 팀 스코어: "(승) 수술대 3:1 늪지대 (패)" / "팀명 (승/패) N:M (승/패) 팀명" 등
    if (/\((?:승|패)\)\s*\d+\s*[：:]\s*\d+\s*\((?:승|패)\)/.test(trimmed)) return;
    if (/^\((?:승|패)\)/.test(trimmed) && /\d+\s*[：:]\s*\d+/.test(trimmed) && /\((?:승|패)\)\s*$/.test(trimmed)) return;
    // [승]/[패] 세트 결과 요약 라인: "[승] 수술대 3:1 늪지대" 등
    if (/^\[(?:승|패)\]/.test(trimmed)) return;
    // [ 0 : 3 팀명 승 ] 형태 인라인 스코어 (▶Nset 헤더 안에 포함된 경우 별도 줄로 올 수도 있음)
    if (/^\[\s*\d+\s*[：:]\s*\d+\s+\S+\s+(?:승|패)\s*\]$/.test(trimmed)) return;
    // 메타 정보: "[nSET - ...]", "[슈 에] - ...", "밴" 등 대괄호 제목/주석 라인
    if (/^\[.*\]\s*[-–—]/.test(trimmed)) return;
    // 밴/엔트리 정보: "다린,애공 밴" 등 (승/패/🆚 없고, 쉼표+한글+밴으로 끝나는 라인)
    if (/[,，]\s*\S+\s+밴\s*$/.test(trimmed) && !trimmed.includes('🆚') && !trimmed.includes('vs')) return;

    // 무승부 라인: 🐱🆚🐱 → 무승부로 스킵
    if (/🐱[^🆚]*🆚[^🐱]*🐱/.test(trimmed) || (trimmed.includes('🆚') && (trimmed.match(/🐱/g)||[]).length>=2 && !trimmed.includes('✅') && !trimmed.includes('❌'))) return;

    // ── 날짜 줄 감지: "일자: YYYY-MM-DD" or "날짜: YYYY-MM-DD" or "YYYY년 MM월 DD일 ..." or "YYYY-MM-DD ..." ──
    // "YYYY-MM-DD" 단독 줄 or "YYYY-MM-DD " + 게임줄 형식 처리
    const _isoDateM = trimmed.match(/^(\d{4}-\d{2}-\d{2})(\s+(.+))?$/);
    if (_isoDateM && /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(_isoDateM[1])) {
      const _id = _isoDateM[1];
      currentLineDate = _id;
      const _dateInput = document.getElementById('paste-date');
      if (_dateInput) _dateInput.value = _id;
      const _restLine = (_isoDateM[3] || '').trim();
      if (_restLine) {
        // 탭 구분 TSV 형식: 날짜가 이미 추출됐으므로 나머지 컬럼만 파싱
        if (_restLine.includes('\t')) {
          const _tc = _restLine.split('\t');
          const _tEx = s => { const m = s.trim().match(/^(.+?)\s*\([TZPN]\)\s*$/i); return m ? m[1].trim() : s.trim(); };

          // ── 1인칭 TSV: 기준 선수 설정 시 ──
          // 형식: 상대(종족)\t맵\t±점수\t...\t스코어
          // 예)  유민.(P)\t써킷\t+14.0\t\t3/2
          const _refPlayer = document.getElementById('paste-ref-player')?.value?.trim();
          if (_refPlayer && _tc.length >= 3) {
            const _scoreStr = (_tc[2] || '').trim();
            if (/^[+\-][\d.]+$/.test(_scoreStr)) {
              const _isWin = _scoreStr.startsWith('+');
              const _oppName = _tEx(_tc[0]);
              const _tMap = _tc[1] ? resolveMapName(_tc[1].trim()) : '-';
              const winName = _isWin ? _refPlayer : _oppName;
              const loseName = _isWin ? _oppName : _refPlayer;
              const _wM = findPlayerByPartialName(winName), _lM = findPlayerByPartialName(loseName);
              results.push({ winName, loseName, map: _tMap, _rawMapStr: _tc[1]||'', setNum: currentSet,
                wPlayer: _wM.player, lPlayer: _lM.player,
                wCandidates: _wM.candidates, lCandidates: _lM.candidates,
                wSimilar: _wM.similar||[], lSimilar: _lM.similar||[],
                lineNum: idx+1, rawLine: trimmed, _lineDate: _id });
              return;
            }
          }

          // ── 2인칭 TSV: 선수1(종족)\t선수2(종족)\t맵\t승/패(ELO)\t[타입] ──
          const _tRes = (_tc[3] || '').trim();
          const _tIsW = _tRes.startsWith('승'), _tIsL = _tRes.startsWith('패');
          if (_tc.length >= 4 && (_tIsW || _tIsL) && _tc[0] && _tc[1]) {
            const _tP1 = _tEx(_tc[0]), _tP2 = _tEx(_tc[1]);
            const _tMap = _tc[2] ? resolveMapName(_tc[2].trim()) : '-';
            const winName = _tIsW ? _tP1 : _tP2, loseName = _tIsW ? _tP2 : _tP1;
            const _wM = findPlayerByPartialName(winName), _lM = findPlayerByPartialName(loseName);
            // 5번째 열: 저장 경로 타입 (mini·gj·ind 등)
            const _lineType = _parseTsvType(_tc[4]);
            results.push({ winName, loseName, map: _tMap, _rawMapStr: _tc[2]||'', setNum: currentSet,
              wPlayer: _wM.player, lPlayer: _lM.player,
              wCandidates: _wM.candidates, lCandidates: _lM.candidates,
              wSimilar: _wM.similar||[], lSimilar: _lM.similar||[],
              lineNum: idx+1, rawLine: trimmed, _lineDate: _id,
              ...(_lineType ? { _lineType } : {}) });
            return;
          }
        }
        const _rp = parsePasteLine(_restLine);
        if (_rp) {
          const _wM = findPlayerByPartialName(_rp.winName);
          const _lM = findPlayerByPartialName(_rp.loseName);
          results.push({ ..._rp, _rawMapStr: _rp._rawMapStr||'', setNum: currentSet,
            wPlayer: _wM.player, lPlayer: _lM.player,
            wCandidates: _wM.candidates, lCandidates: _lM.candidates,
            wSimilar: _wM.similar||[], lSimilar: _lM.similar||[],
            lineNum: idx+1, rawLine: trimmed, _lineDate: _id });
        }
      }
      return;
    }
    // "YYYY년 MM월 DD일" 형식 — 단독 줄 or 게임 줄 앞에 붙은 경우 모두 처리
    const _korDateM = trimmed.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일(?:\s+|$)/);
    if (_korDateM) {
      const _kd = `${_korDateM[1]}-${String(_korDateM[2]).padStart(2,'0')}-${String(_korDateM[3]).padStart(2,'0')}`;
      currentLineDate = _kd;
      const _dateInput = document.getElementById('paste-date');
      if (_dateInput) _dateInput.value = _kd; // 항상 덮어씀 (한국식 날짜가 명시된 경우 우선)
      // 날짜 부분 제거 후 나머지를 게임 줄로 재처리
      const _restLine = trimmed.slice(_korDateM[0].length).trim();
      if (_restLine) {
        const _rp = parsePasteLine(_restLine);
        if (_rp) {
          const _wM = findPlayerByPartialName(_rp.winName);
          const _lM = findPlayerByPartialName(_rp.loseName);
          results.push({ ..._rp, _rawMapStr: _rp._rawMapStr||'', setNum: currentSet,
            wPlayer: _wM.player, lPlayer: _lM.player,
            wCandidates: _wM.candidates, lCandidates: _lM.candidates,
            wSimilar: _wM.similar||[], lSimilar: _lM.similar||[],
            lineNum: idx+1, rawLine: trimmed, _lineDate: _kd });
        }
      }
      return;
    }
    // 직전 결과에 날짜+메모 적용 (경기 다음 줄 포맷). 결과 없으면 currentLineDate로 이후 적용.
    // 어느 모드든 paste-date 입력 필드도 자동으로 채움.
    const _dateLineM = trimmed.match(/^(?:일자|날짜)\s*[:：]\s*(\d{4}-\d{2}-\d{2})(?:.*?[|｜]\s*메모\s*[:：]\s*(.+))?/);
    if (_dateLineM) {
      const _dl = _dateLineM[1];
      const _dm = (_dateLineM[2] || '').trim();
      // 날짜 입력 필드 자동 채움
      const _dateInput = document.getElementById('paste-date');
      if (_dateInput && !_dateInput.value) _dateInput.value = _dl;
      if (results.length > 0) {
        results[results.length - 1]._lineDate = _dl;
        if (_dm) results[results.length - 1]._lineMemo = _dm;
      } else {
        currentLineDate = _dl;
      }
      return;
    }

    // ── 팀명 직접 지정: "팀A: 공주대" / "A팀: 공주대" → _pasteForceTeamA 강제 설정 ──
    // 형식: "팀A:", "A팀:", "팀B:", "B팀:" 뒤에 오는 대학/팀명을 A팀/B팀으로 고정
    const _teamForceM = trimmed.match(/^(?:(팀\s*A|A\s*팀)|(팀\s*B|B\s*팀))\s*[：:]\s*(.+)$/);
    if (_teamForceM) {
      const _tfName = _teamForceM[3].trim();
      if (_teamForceM[1]) window._pasteForceTeamA = _tfName;
      else                window._pasteForceTeamB = _tfName;
      return;
    }

    // ── [N세트] 팀A(score) : 팀B(score) 헤더 처리 ──
    const _setHeaderM = trimmed.match(/^\[(\d+)\s*(?:세트|셋)\]\s*(.+?)\s*[：:]\s*(.+)$/);
    if (_setHeaderM) {
      currentSet = parseInt(_setHeaderM[1]);
      const _hTeamA = _setHeaderM[2].replace(/\s*\(\d+\)\s*$/, '').trim();
      const _hTeamB = _setHeaderM[3].replace(/\s*\(\d+\)\s*$/, '').trim();
      if (_hTeamA && !window._pasteForceTeamA) window._pasteForceTeamA = _hTeamA;
      if (_hTeamB && !window._pasteForceTeamB) window._pasteForceTeamB = _hTeamB;
      return;
    }

    // ── 팀 로스터 라인 감지: "팀명 : 멤버1 멤버2 멤버3 ..." (CK 모드 제외) ──
    const _curMode = window._forcedPasteMode || document.getElementById('paste-mode')?.value || '';
    if (_curMode !== 'ck' &&
        !trimmed.includes('🆚') && !trimmed.includes('✅') && !trimmed.includes('❌') && !trimmed.includes('⬜') &&
        !/^[▶►▸]/.test(trimmed) &&
        !/^\d+\s*(?:세트|셋)\s/.test(trimmed)) {
      const rosterM = trimmed.match(/^([^\s:：][^:：]{0,20}?)\s*[：:]\s*(\S+(?:\s+\S+){1,})$/);
      if (rosterM) {
        const tName = rosterM[1].trim();
        const mems = rosterM[2].trim().split(/\s+/).filter(n => n.length > 0 && n.length <= 8);
        if (mems.length >= 2) {
          if (!window._pasteRosterA) {
            window._pasteRosterA = { teamName: tName, members: mems };
            if (!window._pasteForceTeamA) window._pasteForceTeamA = tName;
          } else if (!window._pasteRosterB) {
            window._pasteRosterB = { teamName: tName, members: mems };
            if (!window._pasteForceTeamB) window._pasteForceTeamB = tName;
          }
          return;
        }
      }
    }

    // ── 형식 C 우선 시도: N세트 맵 선수A 누적A:누적B 선수B ──
    const cParsed = parseFormatC(trimmed, formatCScore);
    if (cParsed) {
      // 형식 C 세트 번호 추출 (줄 앞 "N세트/N셋")
      const setNumM = trimmed.match(/^(\d+)\s*(?:세트|셋)/);
      if (setNumM) currentSet = parseInt(setNumM[1]);
      formatCScore = cParsed.nextScore;
      isFormatC = true;
      const wMatch = findPlayerByPartialName(cParsed.winName);
      const lMatch = findPlayerByPartialName(cParsed.loseName);
      results.push({
        winName: cParsed.winName, loseName: cParsed.loseName, map: cParsed.map,
        setNum: currentSet,
        wPlayer: wMatch.player, lPlayer: lMatch.player,
        wCandidates: wMatch.candidates, lCandidates: lMatch.candidates,
        wSimilar: wMatch.similar||[], lSimilar: lMatch.similar||[],
        lineNum: idx + 1, rawLine: trimmed,
        ...(currentLineDate ? { _lineDate: currentLineDate } : {})
      });
      return;
    }

    // 형식 C 블록이 끝나면 스코어 초기화
    if (isFormatC) { formatCScore = null; isFormatC = false; }

    // 세트 구분선 처리
    const sepResult = parseSetSeparator(trimmed);
    if (sepResult !== null) {
      if (sepResult === 0) currentSet++;
      else currentSet = sepResult;
      // 같은 줄에 경기 결과가 있을 수 있음 (예: "1set ⭕선수A vs 선수B❌")
      const setRem = trimmed.replace(/^\d+\s*(?:세트|셋|set)\s*/i, '').trim();
      if (setRem && setRem !== trimmed) {
        const r2 = parsePasteLine(setRem);
        if (r2) {
          const wM2 = findPlayerByPartialName(r2.winName);
          const lM2 = findPlayerByPartialName(r2.loseName);
          results.push({ ...r2, _rawMapStr: r2._rawMapStr||'', setNum: currentSet,
            wPlayer: wM2.player, lPlayer: lM2.player,
            wCandidates: wM2.candidates, lCandidates: lM2.candidates,
            wSimilar: wM2.similar||[], lSimilar: lM2.similar||[],
            lineNum: idx+1, rawLine: trimmed,
            ...(currentLineDate ? { _lineDate: currentLineDate } : {}) });
        }
      }
      return;
    }

    // ── 형식 G: 탭 구분 ELO 형식 ──
    // 날짜\t선수1(종족)\t선수2(종족)\t맵\t승(+N)/패(-N)\t유형\t...
    if (trimmed.includes('\t')) {
      const cols = trimmed.split('\t');
      const _tsvDate = cols[0] && /^\d{4}-\d{2}-\d{2}$/.test(cols[0].trim()) ? cols[0].trim() : null;
      const _tsvResult = cols[4] ? cols[4].trim() : '';
      const _tsvIsWin  = _tsvResult.startsWith('승');
      const _tsvIsLose = _tsvResult.startsWith('패');
      if (_tsvDate && cols.length >= 5 && (_tsvIsWin || _tsvIsLose) && cols[1] && cols[2]) {
        // 선수명 추출: "디임(P)" → 디임 / "디임" → 디임
        const _tsvExtract = s => { const m = s.trim().match(/^(.+?)\s*\([TZPN]\)\s*$/i); return m ? m[1].trim() : s.trim(); };
        const _tsvP1 = _tsvExtract(cols[1]);
        const _tsvP2 = _tsvExtract(cols[2]);
        const _tsvMap = cols[3] ? resolveMapName(cols[3].trim()) : '-';
        const winName  = _tsvIsWin  ? _tsvP1 : _tsvP2;
        const loseName = _tsvIsWin  ? _tsvP2 : _tsvP1;
        currentLineDate = _tsvDate;
        const _dateInput = document.getElementById('paste-date');
        if (_dateInput) _dateInput.value = _tsvDate;
        const wM = findPlayerByPartialName(winName);
        const lM = findPlayerByPartialName(loseName);
        results.push({ winName, loseName, map: _tsvMap, _rawMapStr: cols[3]||'',
          setNum: currentSet,
          wPlayer: wM.player, lPlayer: lM.player,
          wCandidates: wM.candidates, lCandidates: lM.candidates,
          wSimilar: wM.similar||[], lSimilar: lM.similar||[],
          lineNum: idx+1, rawLine: trimmed, _lineDate: _tsvDate });
        return;
      }
    }

    const parsed = parsePasteLine(line);
    if (!parsed) {
      errors.push({ line: idx + 1, raw: trimmed });
      return;
    }
    const wMatch = findPlayerByPartialName(parsed.winName);
    const lMatch = findPlayerByPartialName(parsed.loseName);
    results.push({
      ...parsed,
      _rawMapStr: parsed._rawMapStr || '',
      setNum: currentSet,
      wPlayer: wMatch.player,
      lPlayer: lMatch.player,
      wCandidates: wMatch.candidates,
      lCandidates: lMatch.candidates,
      wSimilar: wMatch.similar||[],
      lSimilar: lMatch.similar||[],
      lineNum: idx + 1, rawLine: trimmed,
      ...(currentLineDate ? { _lineDate: currentLineDate } : {})
    });
  });

  // 파싱 결과 저장 (기존에 사용자가 선택한 선수 유지)
  if (window._pasteResults) {
    results.forEach((r, i) => {
      const prev = window._pasteResults[i];
      if (!prev) return;
      // 같은 경기인지 확인 (인덱스 오정렬 방지)
      if (prev.winName !== r.winName || prev.loseName !== r.loseName) return;
      // 이미 단일 선수로 확정된 경우(중복 해소됨) → 유지
      // winName/loseName은 덮어쓰지 않음 (leftName 비교에 사용되므로)
      if (prev.wPlayer && prev.wCandidates.length === 1) {
        r.wPlayer     = prev.wPlayer;
        r.wCandidates = [prev.wPlayer];
        r.wSimilar    = [];
      }
      if (prev.lPlayer && prev.lCandidates.length === 1) {
        r.lPlayer     = prev.lPlayer;
        r.lCandidates = [prev.lPlayer];
        r.lSimilar    = [];
      }
    });
  }
  // 파싱 결과가 비었는데 textarea에 내용이 있고 이전 결과가 있으면 인식창 유지
  // (입력 수정 중 인식창이 사라지는 현상 방지)
  if (results.length === 0 && raw.trim()) {
    const prev = window._pasteResults;
    if (prev && prev.length > 0) return; // 이전 결과 그대로 유지 (덮어쓰지 않음)
  }

  window._pasteResults = results;
  window._pasteErrors  = errors;

  renderPastePreview(results, errors);
}

function renderPastePreview(results, errors) {
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (!previewEl) return;

  const savable  = (results || []).filter(r => r.wPlayer && r.lPlayer);
  const ambig    = (results || []).filter(r => (!r.wPlayer && r.wCandidates?.length > 1) || (!r.lPlayer && r.lCandidates?.length > 1));
  const hasSimilar = (r) => (!r.wPlayer && !r.wCandidates?.length && r.wSimilar?.length) || (!r.lPlayer && !r.lCandidates?.length && r.lSimilar?.length);
  const similarRows = (results || []).filter(r => !r.wPlayer || !r.lPlayer).filter(r => hasSimilar(r) && !ambig.includes(r));
  const missing  = (results || []).filter(r => (!r.wPlayer && !r.wCandidates?.length && !r.wSimilar?.length) || (!r.lPlayer && !r.lCandidates?.length && !r.lSimilar?.length));

  // 상단 뱃지
  if (badge) {
    if (results && results.length > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = `✅ ${savable.length}건 저장 가능`;
      if (ambig.length) badge.textContent += ` · ⚠️ ${ambig.length}건 선택 필요`;
      if (similarRows.length) badge.textContent += ` · 🔍 ${similarRows.length}건 유사이름`;
      if (missing.length) badge.textContent += ` · ❌ ${missing.length}건 미등록`;
      badge.style.background = savable.length === results.length ? '#dcfce7' : '#fef9c3';
      badge.style.color      = savable.length === results.length ? '#16a34a' : '#b45309';
      badge.style.border     = `1px solid ${savable.length === results.length ? '#bbf7d0' : '#fcd34d'}`;
    } else {
      badge.style.display = 'none';
    }
  }

  // 하단 경고
  if (pendWarn) pendWarn.style.display = ambig.length ? 'inline' : 'none';

  let html = '';
  let teamAPreview = window._pasteForceTeamA || 'A팀';
  let teamBPreview = window._pasteForceTeamB || 'B팀';

  if (results && results.length > 0) {
    // 맵 목록 (드롭다운용) — 설정 맵 + 약자 전체값 + 이번 파싱에서 인식된 맵 포함
    const parsedMaps = results.map(r => r.map).filter(m => m && m !== '-');
    const allMaps = [...new Set([...maps.filter(m=>m&&m!=='-'), ...parsedMaps])].filter(Boolean).sort();

    // 최대 세트번호 계산 (세트 드롭다운용)
    const maxSet = Math.max(...results.map(r => r.setNum || 1), 3);

    // ── 팀 인식: leftName(A칸)/rightName(B칸) 기준으로 소속 대학 빈도 계산 ──
    const _savableForTeam = results.filter(r => r.wPlayer && r.lPlayer);
    const _univA2 = {}, _univB2 = {};
    _savableForTeam.forEach(r => {
      // A칸=좌측선수, B칸=우측선수 → 좌측이 승자면 ap=wPlayer, 패자면 ap=lPlayer
      const _leftIsWinT = (r.leftName||r.winName) === r.winName;
      const ap = _leftIsWinT ? r.wPlayer : r.lPlayer;
      const bp = _leftIsWinT ? r.lPlayer : r.wPlayer;
      const ua = ap?.univ||''; const ub = bp?.univ||'';
      if(ua && ua!=='무소속') _univA2[ua] = (_univA2[ua]||0)+1;
      if(ub && ub!=='무소속') _univB2[ub] = (_univB2[ub]||0)+1;
    });
    const _rA2 = Object.entries(_univA2).sort((a,b)=>b[1]-a[1]);
    const _rB2 = Object.entries(_univB2).sort((a,b)=>b[1]-a[1]);
    let _autoTeamA = _rA2[0]?.[0] || '';
    let _autoTeamB = _rB2[0]?.[0] || '';
    // A팀과 B팀이 같으면 B팀을 다른 대학으로 교정
    if (_autoTeamA && _autoTeamA === _autoTeamB) {
      _autoTeamB = _rB2.find(([u])=>u!==_autoTeamA)?.[0] || _rA2.find(([u])=>u!==_autoTeamA)?.[0] || '';
    }
    const _isCKMode = !!(window._forcedPasteMode === 'ck' || document.getElementById('paste-mode')?.value === 'ck');
    teamAPreview = _isCKMode ? 'A조' : (window._pasteForceTeamA || _autoTeamA || 'A팀');
    teamBPreview = _isCKMode ? 'B조' : (window._pasteForceTeamB || _autoTeamB || 'B팀');
    // 테이블 헤더
    const _teamALabel = '🔵 ' + teamAPreview;
    const _teamBLabel = '🔴 ' + teamBPreview;

    html += `<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px">`;
    html += `<table style="margin:0;width:100%;font-size:12px"><thead><tr>
      <th style="text-align:left;padding:6px 8px;font-size:11px;width:76px">세트</th>
      <th style="text-align:left;padding:6px 8px;font-size:11px;width:90px">맵</th>
      <th style="text-align:left;padding:6px 8px;font-size:11px">${_teamALabel}</th>
      <th style="text-align:left;padding:6px 8px;font-size:11px">${_teamBLabel}</th>
      <th style="text-align:left;padding:6px 8px;font-size:11px;width:70px">상태</th>
      <th style="text-align:center;padding:6px 8px;font-size:11px;width:52px">관리</th>
    </tr></thead><tbody>`;

    // 날짜 구분선 표시: ind/gj 모드에서 _lineDate가 있는 경우 날짜별 구분선 추가
    const _pasteMode = window._forcedPasteMode || document.getElementById('paste-mode')?.value || '';
    const _showDateSep = ['ind','gj'].includes(_pasteMode) && results.some(r => r._lineDate);
    let _prevRowDate = null;

    results.forEach((r, i) => {
      const wOk    = !!r.wPlayer;
      const lOk    = !!r.lPlayer;
      const wAmbig = !wOk && r.wCandidates?.length > 1;
      const lAmbig = !lOk && r.lCandidates?.length > 1;
      const ok     = wOk && lOk;

      const wDisplayName = wOk ? r.wPlayer.name : r.winName;
      const lDisplayName = lOk ? r.lPlayer.name : r.loseName;

      // ── 선수 셀 빌더 ──
      const buildCell = (isWin, displayName, resolved, isAmbig, candidates, similar, role) => {
        const style = resolved ? (isWin ? 'color:#ea580c;font-weight:700' : 'color:#dc2626;font-weight:700') : 'color:#b45309;font-weight:700';
        let cell = `<span style="${style}">${displayName}</span>`;
        if (resolved) {
          const p = isWin ? r.wPlayer : r.lPlayer;
          if (p?.univ) cell += `<span style="font-size:10px;color:var(--gray-l);margin-left:4px">(${p.univ})</span>`;
          // 닉네임(메모) 매칭 표시: 입력한 이름과 실제 선수 이름이 다를 때
          const inputName = isWin ? r.winName : r.loseName;
          if (inputName && inputName !== displayName) {
            cell += ` <span style="font-size:10px;background:#fef3c7;border:1px solid #fcd34d;color:#92400e;border-radius:4px;padding:1px 5px;margin-left:2px" title="닉네임 매칭">🏷️ ${inputName}</span>`;
          }
        } else if (isAmbig) {
          cell += `<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px;align-items:center">
            <span style="font-size:10px;color:#b45309;font-weight:600">선택:</span>` +
            candidates.map(c =>
              `<button class="paste-pick-btn" data-idx="${i}" data-role="${role}" data-name="${c.name.replace(/"/g,'&quot;')}"
                style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:11px;font-weight:700;cursor:pointer;transition:.12s"
                onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                ${c.name}${c.univ?`<span style="font-size:9px;opacity:.7;margin-left:2px">(${c.univ})</span>`:''}</button>`
            ).join('') + `</div>`;
        } else {
          // 미등록: 유사 이름 제안 + +등록 버튼
          const safeName = displayName.replace(/"/g,'&quot;');
          // 유사 이름 후보가 있으면 제안 버튼 표시
          if (similar && similar.length > 0) {
            cell += `<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px;align-items:center">
              <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>` +
              similar.map(c =>
                `<button class="paste-pick-btn" data-idx="${i}" data-role="${role}" data-name="${c.name.replace(/"/g,'&quot;')}"
                  style="padding:3px 9px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:11px;font-weight:700;cursor:pointer;transition:.12s"
                  onmouseover="this.style.background='#ede9fe'" onmouseout="this.style.background='#faf5ff'"
                  title="${c.univ||''}">
                  ${c.name}${c.univ?`<span style="font-size:9px;opacity:.7;margin-left:2px">(${c.univ})</span>`:''}</button>`
              ).join('') +
              `<button class="paste-reg-btn" data-idx="${i}" data-role="${role}" data-name="${safeName}"
                style="padding:2px 7px;border-radius:4px;border:1px solid #86efac;background:#f0fdf4;color:#16a34a;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.12s"
                onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">+등록</button>
              </div>`;
          } else {
            cell += `<button class="paste-reg-btn" data-idx="${i}" data-role="${role}" data-name="${safeName}"
              style="margin-left:5px;padding:2px 7px;border-radius:4px;border:1px solid #86efac;background:#f0fdf4;color:#16a34a;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.12s"
              onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">+등록</button>`;
          }
        }
        return cell;
      };

      // A칸/B칸 배정: 로스터 있으면 로스터 소속 기반, 없으면 leftName 텍스트 위치 기반
      const _rosterA = window._pasteRosterA;
      const _rosterB = window._pasteRosterB;
      const _isRosterMode = !!(_rosterA && _rosterB);
      const _inRA = (nm) => _rosterA?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
      const _inRB = (nm) => _rosterB?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
      const _isCKPreview = _isCKMode;
      let aPlayer, bPlayer, aIsWin;
      let aOk, aName, aAmbig, aCands, aSim, aRole;
      let bOk, bName, bAmbig, bCands, bSim, bRole;
      if (_isRosterMode && !_isCKPreview) {
        // 승자(winName)가 rosterA 소속이면 A칸=승자, rosterB면 A칸=패자
        const _wInA = _inRA(r.winName), _wInB = _inRB(r.winName);
        aIsWin  = _wInA ? true : _wInB ? false : ((r.leftName||r.winName) === r.winName);
        aPlayer = aIsWin ? r.wPlayer : r.lPlayer;
        bPlayer = aIsWin ? r.lPlayer : r.wPlayer;
        aOk     = !!aPlayer;
        bOk     = !!bPlayer;
        aName   = aPlayer ? aPlayer.name : (aIsWin ? r.winName : r.loseName);
        bName   = bPlayer ? bPlayer.name : (aIsWin ? r.loseName : r.winName);
        aAmbig  = !aOk && (aIsWin ? wAmbig : lAmbig);
        bAmbig  = !bOk && (aIsWin ? lAmbig : wAmbig);
        aCands  = aIsWin ? (r.wCandidates||[]) : (r.lCandidates||[]);
        bCands  = aIsWin ? (r.lCandidates||[]) : (r.wCandidates||[]);
        aSim    = aIsWin ? (r.wSimilar||[]) : (r.lSimilar||[]);
        bSim    = aIsWin ? (r.lSimilar||[]) : (r.wSimilar||[]);
        aRole   = aIsWin ? 'w' : 'l';
        bRole   = aIsWin ? 'l' : 'w';
      } else {
        // 기존 방식: leftName(텍스트 왼쪽)=A칸, rightName(텍스트 오른쪽)=B칸
        // wPlayer=항상승자, lPlayer=항상패자 → _leftIsWin에 따라 직접 배정
        const _leftRaw  = r.leftName  || r.winName  || '';
        const _rightRaw = r.rightName || r.loseName || '';
        const _leftIsWin = (_leftRaw === r.winName);
        // 선수 DB 소속으로 A/B 배정 우선 시도 (자동 팀 인식된 경우, CK 모드 제외)
        let _univBased = false;
        if (!_isCKPreview && r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
            r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
            teamAPreview && teamAPreview !== 'A팀' && teamAPreview !== 'A조' &&
            teamBPreview && teamBPreview !== 'B팀' && teamBPreview !== 'B조') {
          const _wInA = r.wPlayer.univ === teamAPreview;
          const _lInA = r.lPlayer.univ === teamAPreview;
          if (_wInA || _lInA) { aIsWin = _wInA; _univBased = true; }
        }
        if (!_univBased) aIsWin = _leftIsWin;
        aPlayer = aIsWin ? (wOk ? r.wPlayer : null) : (lOk ? r.lPlayer : null);
        bPlayer = aIsWin ? (lOk ? r.lPlayer : null) : (wOk ? r.wPlayer : null);
        aOk     = aIsWin ? wOk : lOk;
        bOk     = aIsWin ? lOk : wOk;
        aName   = aPlayer ? aPlayer.name : (aIsWin ? r.winName : r.loseName);
        bName   = bPlayer ? bPlayer.name : (aIsWin ? r.loseName : r.winName);
        aAmbig  = !aOk && (aIsWin ? wAmbig : lAmbig);
        bAmbig  = !bOk && (!aIsWin ? wAmbig : lAmbig);
        aCands  = aIsWin ? (r.wCandidates||[]) : (r.lCandidates||[]);
        bCands  = !aIsWin ? (r.wCandidates||[]) : (r.lCandidates||[]);
        aSim    = aIsWin ? (r.wSimilar||[]) : (r.lSimilar||[]);
        bSim    = !aIsWin ? (r.wSimilar||[]) : (r.lSimilar||[]);
        aRole   = aIsWin ? 'w' : 'l';
        bRole   = aIsWin ? 'l' : 'w';
      }
      const bIsWin = !aIsWin;
      const aWon   = aIsWin;
      const aCell  = buildCell(aIsWin, aName, aOk, aAmbig, aCands, aSim, aRole);
      const bCell  = buildCell(bIsWin, bName, bOk, bAmbig, bCands, bSim, bRole);
      // A팀/B팀 결과 뱃지 (클릭으로 승패 반전, 선수 위치는 고정)
      const _winBadge  = (idx) => `<button class="paste-flip-btn" data-idx="${idx}" style="background:#2563eb;color:#fff;font-size:9px;font-weight:900;padding:1px 6px;border-radius:4px;margin-left:4px;vertical-align:middle;border:none;cursor:pointer">이겼다</button>`;
      const _loseBadge = (idx) => `<button class="paste-flip-btn" data-idx="${idx}" style="background:#dc2626;color:#fff;font-size:9px;font-weight:900;padding:1px 6px;border-radius:4px;margin-left:4px;vertical-align:middle;border:none;cursor:pointer">졌다</button>`;
      const aResultBadge = ok ? (aWon ? _winBadge(i) : _loseBadge(i)) : '';
      const bResultBadge = ok ? (!aWon ? _winBadge(i) : _loseBadge(i)) : '';
      const wSim = !wOk && !wAmbig && (r.wSimilar||[]).length > 0;
      const lSim = !lOk && !lAmbig && (r.lSimilar||[]).length > 0;
      const statusBadge = ok
        ? `<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;white-space:nowrap">저장가능</span>`
        : (wAmbig || lAmbig)
          ? `<span style="background:#fef9c3;color:#b45309;border:1px solid #fcd34d;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;white-space:nowrap">선택필요</span>`
          : (wSim || lSim)
            ? `<span style="background:#faf5ff;color:#6d28d9;border:1px solid #c4b5fd;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;white-space:nowrap">유사이름</span>`
            : `<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;white-space:nowrap">미등록</span>`;

      // ── 세트 드롭다운 ──
      const setOpts = Array.from({length: Math.max(maxSet, r.setNum||1)}, (_,k) => k+1)
        .map(n => `<option value="${n}" ${(r.setNum||1)===n?'selected':''}>${n}세트</option>`).join('');
      const setCell = `<select class="paste-set-sel" data-idx="${i}"
        style="font-size:11px;font-weight:700;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;color:${(r.setNum||1)>=3?'#7c3aed':'var(--blue)'};background:var(--white);cursor:pointer;max-width:72px"
        onchange="pasteChangeSet(${i},parseInt(this.value))">${setOpts}</select>`;

      // ── 맵 드롭다운 ──
      const mapVal = r.map && r.map !== '-' ? r.map : '';
      const mapOpts = `<option value="">-</option>` +
        allMaps.map(m => `<option value="${m}" ${mapVal===m?'selected':''}>${m}</option>`).join('');
      const mapCell = `<select class="paste-map-sel" data-idx="${i}"
        style="font-size:11px;border:1px solid ${mapVal?'#7dd3fc':'var(--border2)'};border-radius:5px;padding:2px 4px;background:${mapVal?'#e0f2fe':'var(--white)'};color:${mapVal?'#0369a1':'var(--gray-l)'};cursor:pointer;max-width:88px"
        onchange="pasteChangeMap(${i},this.value)">${mapOpts}</select>`;


      // ── 행 삭제 버튼 ──
      const delBtn = `<button class="paste-del-btn" data-idx="${i}" title="이 행 삭제"
        style="padding:2px 6px;border-radius:4px;border:1px solid #fecaca;background:#fff5f5;font-size:12px;cursor:pointer;transition:.12s;line-height:1.4"
        onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fff5f5'">🗑</button>`;

      const _hasSim = wSim||lSim;
      // 날짜 구분선
      if (_showDateSep) {
        const _rowDate = r._lineDate || null;
        if (_rowDate !== _prevRowDate) {
          _prevRowDate = _rowDate;
          if (_rowDate) {
            html += `<tr><td colspan="6" style="padding:4px 8px;background:#eff6ff;border-top:2px solid #bfdbfe;border-bottom:1px solid #bfdbfe">
              <span style="font-size:11px;font-weight:700;color:#1d4ed8">📅 ${_rowDate}</span>
              <span style="font-size:10px;color:#6b7280;margin-left:6px">이후 경기 날짜</span>
            </td></tr>`;
          }
        }
      }
      const _memoTag = r._lineMemo ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">📝 ${r._lineMemo.replace(/</g,'&lt;')}</div>` : '';
      const _typeBadge = r._lineType ? ({
        mini: '<span style="background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;font-size:10px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px">미니</span>',
        gj:   '<span style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;font-size:10px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px">끝장전</span>',
        ind:  '<span style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;font-size:10px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px">개인전</span>',
      }[r._lineType] || '') : '';
      html += `<tr style="background:${ok ? '' : wAmbig||lAmbig ? '#fffbeb' : _hasSim ? '#fdf4ff' : '#fff5f5'}">
        <td style="padding:4px 6px">${setCell}${_typeBadge}</td>
        <td style="padding:4px 6px">${mapCell}${_memoTag}</td>
        <td style="padding:4px 8px">${aCell}${aResultBadge}</td>
        <td style="padding:4px 8px">${bCell}${bResultBadge}</td>
        <td style="padding:4px 6px">${statusBadge}</td>
        <td style="padding:4px 6px;text-align:center">${delBtn}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;

    // ── 세트 결과 요약 미리보기 ──
    // 로스터 기반이면 소속으로, 없으면 leftName 기준으로 A/B 판단
    const _sprRA = window._pasteRosterA, _sprRB = window._pasteRosterB;
    const _sprInA = (nm) => _sprRA?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
    const _sprInB = (nm) => _sprRB?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
    const setPreviewMap = {};
    savable.forEach(r => {
      const sn = r.setNum || 1;
      if(!setPreviewMap[sn]) setPreviewMap[sn] = {A:0, B:0};
      let aWins;
      if (_isCKMode) {
        aWins = ((r.leftName||r.winName) === r.winName);
      } else if (_sprRA && _sprRB) {
        aWins = !!_sprInA(r.winName);
        if (!aWins && !_sprInB(r.winName)) aWins = ((r.leftName||r.winName) === r.winName);
      } else if (!_isCKMode && r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
                 r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
                 teamAPreview && teamAPreview !== 'A팀' && teamAPreview !== 'A조' &&
                 teamBPreview && teamBPreview !== 'B팀' && teamBPreview !== 'B조') {
        aWins = r.wPlayer.univ === teamAPreview;
      } else {
        aWins = ((r.leftName||r.winName) === r.winName);
      }
      setPreviewMap[sn][aWins ? 'A' : 'B']++;
    });
    const multiSetPreview = Object.keys(setPreviewMap).length > 1;
    let setScoreA = 0, setScoreB = 0;
    const setRows = Object.keys(setPreviewMap).sort((a,b)=>a-b).map(sn => {
      const s = setPreviewMap[sn];
      const sw = s.A > s.B ? 'A' : s.B > s.A ? 'B' : '';
      if(sw === 'A') setScoreA++; else if(sw === 'B') setScoreB++;
      const acol = sw==='A' ? '#16a34a' : s.A>0 ? '#64748b' : '#9ca3af';
      const bcol = sw==='B' ? '#16a34a' : s.B>0 ? '#64748b' : '#9ca3af';
      return `<span style="display:inline-flex;align-items:center;gap:4px;background:${sw?'#f0fdf4':'#f8fafc'};border:1px solid ${sw?'#86efac':'#e2e8f0'};border-radius:8px;padding:3px 10px;font-size:12px">
        <span style="font-size:10px;color:var(--gray-l);font-weight:600">${sn}세트</span>
        <span style="font-weight:800;color:${acol}">${s.A}</span>
        <span style="color:var(--gray-l)">:</span>
        <span style="font-weight:800;color:${bcol}">${s.B}</span>
        ${sw?`<span style="font-size:10px;font-weight:700;color:#16a34a">${sw==='A'?'A팀':'B팀'} ✓</span>`:''}
      </span>`;
    }).join('');

    if(savable.length > 0) {
      const _matchModePreview = window._pasteMatchMode || 'game';
      const _useSetScore = _matchModePreview === 'set' || multiSetPreview;
      // A/B팀 게임 승리 수
      let teamAWins = 0, teamBWins = 0;
      savable.forEach(r => {
        let aW;
        if (_isCKMode) {
          aW = ((r.leftName||r.winName) === r.winName);
        } else if (_sprRA && _sprRB) {
          aW = !!_sprInA(r.winName);
          if (!aW && !_sprInB(r.winName)) aW = ((r.leftName||r.winName) === r.winName);
        } else if (r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
                   r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
                   teamAPreview && teamAPreview !== 'A팀' && teamAPreview !== 'A조' &&
                   teamBPreview && teamBPreview !== 'B팀' && teamBPreview !== 'B조') {
          aW = r.wPlayer.univ === teamAPreview;
        } else {
          aW = ((r.leftName||r.winName) === r.winName);
        }
        aW ? teamAWins++ : teamBWins++;
      });
      const totalA = _useSetScore ? setScoreA : teamAWins;
      const totalB = _useSetScore ? setScoreB : teamBWins;
      const _dA='A팀';
      const _dB='B팀';
      const winner = totalA > totalB ? _dA : totalB > totalA ? _dB : '무승부';
      html += `<div style="margin-top:8px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
        <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">📊 현재 결과 미리보기 ${multiSetPreview?'(세트제)':'(개인전)'}</div>
        ${multiSetPreview ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">${setRows}</div>` : ''}
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-weight:800;font-size:14px;color:${totalA>totalB?'#2563eb':'#64748b'}">${_dA}</span>
          <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px">
            <span style="color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
            <span style="color:var(--gray-l);font-size:14px"> : </span>
            <span style="color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
          </span>
          <span style="font-weight:800;font-size:14px;color:${totalB>totalA?'#dc2626':'#64748b'}">${_dB}</span>
          <span style="font-size:12px;font-weight:700;padding:2px 10px;border-radius:12px;background:${winner==='무승부'?'#f1f5f9':'#dcfce7'};color:${winner==='무승부'?'#64748b':'#15803d'}">
            ${winner==='무승부'?'🤝 무승부':'🏆 '+winner+' 승'}
          </span>
        </div>
      </div>`;
    }
  }

  if (errors && errors.length > 0) {
    html += `<div style="background:#fff5f5;border:1.5px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-top:6px">
      <div style="font-size:12px;font-weight:700;color:#dc2626;margin-bottom:6px">⛔ 인식 실패 ${errors.length}줄 — 저장되지 않습니다</div>
      ${errors.map(e => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="flex-shrink:0;font-size:10px;font-weight:700;background:#fecaca;color:#dc2626;padding:1px 6px;border-radius:4px">${e.line}행</span>
        <code style="font-size:10px;color:#991b1b;background:#fff1f2;padding:2px 7px;border-radius:4px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${e.raw.replace(/"/g,'&quot;')}">${e.raw.slice(0,90)}${e.raw.length>90?'…':''}</code>
      </div>`).join('')}
    </div>`;
  }

  if (applyBtn) {
    applyBtn.style.display = results && results.length > 0 ? 'inline-flex' : 'none';
    applyBtn.textContent = `✅ ${savable.length}건 저장하기`;
  }

  // 팀 스왑 UI 업데이트 (이미 위에서 계산한 teamAPreview/teamBPreview 재사용)
  const swapRow = document.getElementById('paste-team-swap-row');
  const teamALbl = document.getElementById('paste-team-a-label');
  const teamBLbl = document.getElementById('paste-team-b-label');
  if(swapRow && teamALbl && teamBLbl && savable.length > 0) {
    teamALbl.textContent = teamAPreview && teamAPreview !== 'A팀' ? '🔵 ' + teamAPreview : '🔵 A팀';
    teamBLbl.textContent = teamBPreview && teamBPreview !== 'B팀' ? '🔴 ' + teamBPreview : '🔴 B팀';
    swapRow.style.display = 'flex';
    window._previewTeamA = teamAPreview;
    window._previewTeamB = teamBPreview;
  } else if(swapRow) {
    swapRow.style.display = 'none';
  }

  previewEl.innerHTML = html;

  // ── 이벤트 등록 ──

  // 중복 선택 버튼
  previewEl.querySelectorAll('.paste-pick-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteSelectPlayer(parseInt(this.dataset.idx), this.dataset.role, this.dataset.name);
    });
  });

  // 미등록 선수 +등록 버튼
  previewEl.querySelectorAll('.paste-reg-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteQuickRegister(parseInt(this.dataset.idx), this.dataset.role, this.dataset.name);
    });
  });

  // 승패 반전 버튼
  previewEl.querySelectorAll('.paste-flip-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteFlipResult(parseInt(this.dataset.idx));
    });
  });

  // 행 삭제 버튼
  previewEl.querySelectorAll('.paste-del-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteDeleteRow(parseInt(this.dataset.idx));
    });
  });

}

// ── 승패 반전 ──
function pasteFlipResult(idx) {
  if (!window._pasteResults || !window._pasteResults[idx]) return;
  const r = window._pasteResults[idx];
  // 승자↔패자 전체 스왑
  [r.winName,  r.loseName]  = [r.loseName,  r.winName];
  [r.wPlayer,  r.lPlayer]   = [r.lPlayer,   r.wPlayer];
  [r.wCandidates, r.lCandidates] = [r.lCandidates, r.wCandidates];
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

// ── 맵 직접 변경 ──
function pasteChangeMap(idx, mapVal) {
  if (!window._pasteResults || !window._pasteResults[idx]) return;
  const r = window._pasteResults[idx];
  r.map = mapVal || '-';
  // 원래 입력한 이름과 선택된 맵이 다르면 alias로 저장 (자동 기억)
  const rawName = (r._rawMapStr||'').trim();
  if(rawName && mapVal && mapVal !== '-' && rawName !== mapVal) {
    if(!userMapAlias) userMapAlias = {};
    if(!userMapAlias[rawName]) {
      userMapAlias[rawName] = mapVal;
      save(); // 자동 저장
    }
  }
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

// ── 세트 번호 변경 ──
function pasteChangeSet(idx, setNum) {
  if (!window._pasteResults || !window._pasteResults[idx]) return;
  window._pasteResults[idx].setNum = setNum;
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

// ── 행 삭제 ──
function pasteDeleteRow(idx) {
  if (!window._pasteResults) return;
  window._pasteResults.splice(idx, 1);
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

// ── 미등록 선수 즉시 등록 ──
function pasteQuickRegister(idx, role, name) {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');

  // 간단 입력 폼 모달 (인라인 생성)
  const allUnivs = getAllUnivs().map(u => `<option value="${u.name}">${u.name}</option>`).join('');
  const tierOpts = TIERS.map(t => `<option value="${t}">${t}</option>`).join('');

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:14px;padding:22px 24px;width:320px;box-shadow:0 20px 60px rgba(0,0,0,.25);font-family:'Noto Sans KR',sans-serif">
      <div style="font-weight:900;font-size:15px;margin-bottom:16px;color:#1a202c">👤 선수 즉시 등록</div>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:13px">
        <div><label style="font-size:11px;font-weight:700;color:#2563eb;display:block;margin-bottom:3px">이름</label>
          <input id="qreg-name" value="${name.replace(/"/g,'&quot;')}" style="width:100%;padding:7px 10px;border:1px solid #cdd3dc;border-radius:7px;font-size:13px;box-sizing:border-box"></div>
        <div><label style="font-size:11px;font-weight:700;color:#2563eb;display:block;margin-bottom:3px">대학</label>
          <select id="qreg-univ" style="width:100%;padding:7px 10px;border:1px solid #cdd3dc;border-radius:7px;font-size:13px"><option value="">선택 안함</option>${allUnivs}</select></div>
        <div style="display:flex;gap:8px">
          <div style="flex:1"><label style="font-size:11px;font-weight:700;color:#2563eb;display:block;margin-bottom:3px">티어</label>
            <select id="qreg-tier" style="width:100%;padding:7px 6px;border:1px solid #cdd3dc;border-radius:7px;font-size:12px">${tierOpts}</select></div>
          <div style="flex:1"><label style="font-size:11px;font-weight:700;color:#2563eb;display:block;margin-bottom:3px">종족</label>
            <select id="qreg-race" style="width:100%;padding:7px 6px;border:1px solid #cdd3dc;border-radius:7px;font-size:12px">
              <option value="T">테란</option><option value="Z">저그</option><option value="P">프로토스</option></select></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:18px;justify-content:flex-end">
        <button id="qreg-cancel" style="padding:7px 16px;border-radius:7px;border:1px solid #cdd3dc;background:#f7f9fc;font-size:13px;font-weight:600;cursor:pointer">취소</button>
        <button id="qreg-ok" style="padding:7px 16px;border-radius:7px;border:none;background:#2563eb;color:#fff;font-size:13px;font-weight:700;cursor:pointer">등록하기</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('qreg-cancel').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.getElementById('qreg-ok').onclick = () => {
    const newName = document.getElementById('qreg-name').value.trim();
    if (!newName) return alert('이름을 입력하세요.');
    if (players.find(p => p.name === newName)) return alert('이미 등록된 선수입니다.');
    const newPlayer = {
      name: newName,
      univ: document.getElementById('qreg-univ').value,
      tier: document.getElementById('qreg-tier').value,
      race: document.getElementById('qreg-race').value,
      gender: 'M', win: 0, loss: 0, points: 0, history: []
    };
    players.push(newPlayer);
    save();
    overlay.remove();
    // 등록한 선수를 해당 행에 자동 반영
    if (window._pasteResults && window._pasteResults[idx]) {
      const r = window._pasteResults[idx];
      if (role === 'w') {
        r.winName = newPlayer.name; r.wPlayer = newPlayer; r.wCandidates = [newPlayer];
      } else {
        r.loseName = newPlayer.name; r.lPlayer = newPlayer; r.lCandidates = [newPlayer];
      }
    }
    renderPastePreview(window._pasteResults, window._pasteErrors || []);
  };
}

// 중복 선수 선택 — 재파싱 없이 렌더링만 갱신
function pasteSelectPlayer(idx, role, name) {
  if (!window._pasteResults || !window._pasteResults[idx]) return;
  const r = window._pasteResults[idx];
  const p = players.find(pl => pl.name === name);
  if (!p) return;

  // ── 선택 시 → 메모에 별칭 자동 저장 (다음번 자동 인식) ──
  // 유사이름(혹시:) 선택뿐 아니라 후보 목록에서 선택할 때도 저장
  const originalName = (role === 'w' ? r.winName : r.loseName) || '';
  const shouldSaveAlias = originalName && originalName !== p.name;

  if (shouldSaveAlias) {
    const alias = originalName.trim();
    if (alias && alias !== p.name) {
      const existingMemo = (p.memo || '').trim();
      const memoTokens = existingMemo ? existingMemo.split(/[\s,\n]+/).map(s=>s.trim()).filter(Boolean) : [];
      if (!memoTokens.includes(alias)) {
        p.memo = memoTokens.length ? existingMemo + ' ' + alias : alias;
        save();
        // 토스트 안내
        (function(){
          const t = document.createElement('div');
          t.textContent = '✅ "' + alias + '" → "' + p.name + '" 자동 인식 등록됨';
          Object.assign(t.style, {
            position:'fixed', bottom:'76px', left:'50%', transform:'translateX(-50%)',
            background:'#1e3a8a', color:'#fff', padding:'9px 18px', borderRadius:'20px',
            fontSize:'13px', fontWeight:'600', zIndex:'99999', pointerEvents:'none',
            opacity:'0', transition:'opacity .25s', fontFamily:'"Noto Sans KR",sans-serif',
            whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,.3)'
          });
          document.body.appendChild(t);
          requestAnimationFrame(()=>{ t.style.opacity='1'; });
          setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(), 300); }, 2800);
        })();
      }
    }
  }

  if (role === 'w') {
    r.winName = p.name; r.wPlayer = p; r.wCandidates = [p]; r.wSimilar = [];
  } else {
    r.loseName = p.name; r.lPlayer = p; r.lCandidates = [p]; r.lSimilar = [];
  }

  // 다른 모든 행에서 같은 선수를 가리키는 항목 자동 처리
  // 조건 1: 원본이름 일치(공백 정규화 포함)  OR  조건 2: candidates/similar 중 같은 선수 포함
  const origNoSpace = originalName ? originalName.replace(/\s+/g,'') : '';
  const _sameOrig = (rawName) => {
    if (!originalName || !rawName) return false;
    if (rawName === originalName) return true;
    // 공백 제거 후 비교: "안    아" vs "안아"
    return rawName.replace(/\s+/g,'') === origNoSpace && origNoSpace.length >= 1;
  };
  window._pasteResults.forEach((row, ri) => {
    if (ri === idx) return;
    // 승자 칸
    if (!row.wPlayer) {
      const inCands = row.wCandidates?.some(c => c.name === p.name);
      const inSimilar = row.wSimilar?.some(c => c.name === p.name);
      if (_sameOrig(row.winName) || inCands || inSimilar) {
        row.winName = p.name; row.wPlayer = p; row.wCandidates = [p]; row.wSimilar = [];
      }
    }
    // 패자 칸
    if (!row.lPlayer) {
      const inCands = row.lCandidates?.some(c => c.name === p.name);
      const inSimilar = row.lSimilar?.some(c => c.name === p.name);
      if (_sameOrig(row.loseName) || inCands || inSimilar) {
        row.loseName = p.name; row.lPlayer = p; row.lCandidates = [p]; row.lSimilar = [];
      }
    }
  });

  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

function pasteApply() {
  if (!window._pasteResults) return;
  if (!isLoggedIn) return alert('로그인이 필요합니다.');

  // 대회 경기 세트 적용 모드 분기
  if (window._grpPasteMode) {
    const savable = window._pasteResults.filter(r => r.wPlayer && r.lPlayer);
    if (!savable.length) return alert('저장 가능한 경기가 없습니다.');
    const ok = _grpPasteApplyLogic(savable);
    if (ok) {
      window._grpPasteMode = false;
      cm('pasteModal');
      window._pasteResults = null;
      window._pasteErrors  = null;
      // 저장 형식 원복
      const compWrap = document.getElementById('paste-comp-wrap');
      if(compWrap) { compWrap.style.display='none'; compWrap.innerHTML='<input type="text" id="paste-comp-name" placeholder="대회명 입력" style="border:1px solid var(--border2);border-radius:7px;padding:5px 10px;font-size:13px;width:180px">'; }
      const hintEl = document.getElementById('paste-mode-hint');
      if(hintEl) hintEl.textContent='';
      const applyBtn = document.getElementById('paste-apply-btn');
      if(applyBtn) applyBtn.textContent='✅ 저장하기';
    }
    return;
  }

  const mode = window._forcedPasteMode || document.getElementById('paste-mode')?.value || 'individual';
  const dateVal = document.getElementById('paste-date')?.value || new Date().toISOString().slice(0, 10);
  const compName = document.getElementById('paste-comp-name')?.value?.trim() || '';

  if (mode === 'comp' && !compName) return alert('대회명을 입력하세요.');

  const savable = window._pasteResults.filter(r => r.wPlayer && r.lPlayer);
  if (!savable.length) return alert('저장 가능한 경기가 없습니다.');

  const matchId = genId();

  // ── A팀/B팀 결정: 로스터 있으면 소속 기반, 없으면 leftName 위치 기반 ──
  const _applyRA = window._pasteRosterA, _applyRB = window._pasteRosterB;
  const _applyInRA = (nm) => _applyRA?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
  const _applyInRB = (nm) => _applyRB?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
  const resolveAB = (r) => {
    if (_applyRA && _applyRB) {
      const wInA = _applyInRA(r.winName), wInB = _applyInRB(r.winName);
      const winnerIsA = wInA ? true : wInB ? false : ((r.leftName||r.winName) === r.winName);
      return winnerIsA
        ? { playerA: r.wPlayer, playerB: r.lPlayer, winner: 'A' }
        : { playerA: r.lPlayer, playerB: r.wPlayer, winner: 'B' };
    }
    // 선수 DB 소속 기반 배정 시도 (미리보기에서 인식된 팀명 사용)
    const _paTA = window._previewTeamA, _paTB = window._previewTeamB;
    if (r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
        r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
        _paTA && _paTA !== 'A팀' && _paTB && _paTB !== 'B팀') {
      const _wInA = r.wPlayer.univ === _paTA;
      const _lInA = r.lPlayer.univ === _paTA;
      if (_wInA || _lInA) {
        return _wInA
          ? { playerA: r.wPlayer, playerB: r.lPlayer, winner: 'A' }
          : { playerA: r.lPlayer, playerB: r.wPlayer, winner: 'B' };
      }
    }
    // leftName 기준: 좌측이 승자면 playerA=wPlayer, 패자면 playerA=lPlayer
    const leftIsWin = (r.leftName||r.winName) === r.winName;
    return {
      playerA: leftIsWin ? r.wPlayer : r.lPlayer,
      playerB: leftIsWin ? r.lPlayer : r.wPlayer,
      winner:  leftIsWin ? 'A' : 'B'
    };
  };

  // A팀/B팀 소속 대학 결정 (빈도 기반, 겹치지 않도록)
  const _univA = {}, _univB = {};
  savable.forEach(r => {
    const ab = resolveAB(r);
    const ua = ab.playerA?.univ||''; const ub = ab.playerB?.univ||'';
    if (ua && ua !== '무소속') _univA[ua] = (_univA[ua]||0)+1;
    if (ub && ub !== '무소속') _univB[ub] = (_univB[ub]||0)+1;
  });
  const _rA = Object.entries(_univA).sort((a,b)=>b[1]-a[1]);
  const _rB = Object.entries(_univB).sort((a,b)=>b[1]-a[1]);
  let finalTeamA = window._pasteForceTeamA || _rA[0]?.[0] || '';
  let finalTeamB = window._pasteForceTeamB || _rB[0]?.[0] || '';
  if (finalTeamA && finalTeamA === finalTeamB) {
    finalTeamB = _rB.find(([u])=>u!==finalTeamA)?.[0] || _rA.find(([u])=>u!==finalTeamA)?.[0] || '';
  }
  const univWins = {};
  savable.forEach(r => {
    const ab = resolveAB(r);
    const wu = ab.winner==='A' ? ab.playerA?.univ : ab.playerB?.univ;
    if (wu) univWins[wu] = (univWins[wu]||0)+1;
  });

  // ── setsSnap 구성 ──
  const setMap = {};
  savable.forEach(r => {
    const sn = r.setNum || 1;
    if (!setMap[sn]) setMap[sn] = [];
    setMap[sn].push(r);
  });

  const setsSnap = Object.keys(setMap).sort((a,b) => a-b).map(sn => {
    const rows = setMap[sn];
    const games = rows.map(r => {
      const ab = resolveAB(r);
      return { playerA: ab.playerA?.name||'', playerB: ab.playerB?.name||'', map: r.map && r.map !== '-' ? r.map : '', winner: ab.winner };
    });
    const scoreA = games.filter(g=>g.winner==='A').length;
    const scoreB = games.filter(g=>g.winner==='B').length;
    return { scoreA, scoreB, winner: scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'A', games };
  });

  // 경기방식: 'set'=세트제(세트 승리 수), 'game'=경기방식(총 게임 승리 수)
  const _matchMode = window._pasteMatchMode || 'game';
  const isMultiSet = Object.keys(setMap).length > 1;
  let sa, sb;

  if (_matchMode === 'set' || isMultiSet) {
    sa = setsSnap.filter(s => s.winner === 'A').length;
    sb = setsSnap.filter(s => s.winner === 'B').length;
  } else {
    sa = setsSnap.reduce((acc,s)=>acc+s.scoreA,0);
    sb = setsSnap.reduce((acc,s)=>acc+s.scoreB,0);
  }

  // 개인 전적 반영 (경기 시점 대학도 저장)
  // ind/gj는 dup 체크 후 반영해야 하므로 아래 모드별 섹션에서 처리
  const _gjProFlag = !!window._gjProPaste;
  const _pasteModeLabel=mode==='mini'?(window._miniPasteType==='civil'?'시빌워':'미니대전'):mode==='gj'?(_gjProFlag?'프로리그끝장전':'끝장전'):{univm:'대학대전',ck:'대학CK',pro:'프로리그',tt:'티어대회',comp:'조별리그',individual:'개인전',ind:'개인전'}[mode]||'';

  // ── 혼합 타입 모드: _lineType이 하나라도 있으면 타입별 분리 저장 ──
  const _hasMixedTypes = savable.some(r => r._lineType);
  if (_hasMixedTypes) {
    const _mixGroups = { mini: [], gj: [], ind: [] };
    savable.forEach(r => {
      const t = r._lineType || (mode === 'gj' ? 'gj' : mode === 'mini' ? 'mini' : 'ind');
      if (_mixGroups[t]) _mixGroups[t].push(r);
      else _mixGroups.ind.push(r);
    });
    const _normMap2 = s => resolveMapName((s||'').trim()) || (s||'').trim();
    // ind 저장
    if (_mixGroups.ind.length) {
      const _idDup = { count: 0, dup: [] };
      const _indDG = {};
      _mixGroups.ind.forEach(r => { const d=r._lineDate||dateVal; (_indDG[d]||(_indDG[d]=[])).push(r); });
      Object.entries(_indDG).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,grp])=>{
        const sid=genId();
        const gameSet = new Set();
        const dedupedGrp = grp.filter(r => {
          const key = `${r.wPlayer.name}|${r.lPlayer.name}|${r.map||'-'}`;
          if (gameSet.has(key)) {
            _idDup.count++;
            _idDup.dup.push({ w: r.wPlayer.name, l: r.lPlayer.name, m: r.map });
            return false;
          }
          gameSet.add(key);
          return true;
        });
        // 개인전은 동기화 함수에서 처리하므로 저장 시 applyGameResult 호출 제거
        // dedupedGrp.forEach(r=>applyGameResult(r.wPlayer.name,r.lPlayer.name,d,r.map||'-',genId(),'','','개인전'));
        const games=dedupedGrp.map(r=>({_id:genId(),sid,d,wName:r.wPlayer.name,lName:r.lPlayer.name,map:r.map&&r.map!=='-'?r.map:'',...(r._lineMemo?{memo:r._lineMemo}:{})}));
        if(games.length) indM.unshift(...games);
      });
      if (_idDup.count > 0) alert(`개인전(혼합) 중복 ${_idDup.count}건 제거됨`);
    }
    // gj 저장
    if (_mixGroups.gj.length) {
      const _gjDup = { count: 0, dup: [] };
      const _gjDG = {};
      _mixGroups.gj.forEach(r => { const d=r._lineDate||dateVal; (_gjDG[d]||(_gjDG[d]=[])).push(r); });
      Object.entries(_gjDG).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,grp])=>{
        const sid=genId();
        const gameSet = new Set();
        const dedupedGrp = grp.filter(r => {
          const key = `${r.wPlayer.name}|${r.lPlayer.name}|${r.map||'-'}`;
          if (gameSet.has(key)) {
            _gjDup.count++;
            _gjDup.dup.push({ w: r.wPlayer.name, l: r.lPlayer.name, m: r.map });
            return false;
          }
          gameSet.add(key);
          return true;
        });
        // 끝장전은 동기화 함수에서 처리하므로 저장 시 applyGameResult 호출 제거
        // dedupedGrp.forEach(r=>applyGameResult(r.wPlayer.name,r.lPlayer.name,d,r.map||'-',genId(),'','','끝장전'));
        const games=dedupedGrp.map(r=>({_id:genId(),sid,d,wName:r.wPlayer.name,lName:r.lPlayer.name,map:r.map&&r.map!=='-'?r.map:'',...(r._lineMemo?{memo:r._lineMemo}:{})}));
        if(games.length) gjM.unshift(...games);
      });
      if (_gjDup.count > 0) alert(`끝장전(혼합) 중복 ${_gjDup.count}건 제거됨`);
    }
    // mini 저장
    if (_mixGroups.mini.length) {
      const _miniDG = {};
      _mixGroups.mini.forEach(r => { const d=r._lineDate||dateVal; (_miniDG[d]||(_miniDG[d]=[])).push(r); });
      Object.entries(_miniDG).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,grp])=>{
        const sid=genId();
        // 팀 경기는 동기화 함수에서 처리하므로 저장 시 applyGameResult 호출 제거
        // grp.forEach(r=>applyGameResult(r.wPlayer.name,r.lPlayer.name,d,r.map||'-',genId(),'','','미니대전'));
        const games=grp.map(r=>({playerA:r.wPlayer?.name||'',playerB:r.lPlayer?.name||'',map:r.map&&r.map!=='-'?r.map:'',winner:'A'}));
        miniM.unshift({_id:sid,d,a:'A팀',b:'B팀',sa:grp.filter(r=>true).length,sb:0,sets:[{scoreA:grp.length,scoreB:0,winner:'A',games}],type:'mini'});
      });
    }
    save();
    const _tot = savable.length;
    const _iC=_mixGroups.ind.length, _gC=_mixGroups.gj.length, _mC=_mixGroups.mini.length;
    alert(`✅ 혼합 저장 완료\n개인전 ${_iC}건 / 끝장전 ${_gC}건 / 미니대전 ${_mC}건 (총 ${_tot}건)`);
    cm('pasteModal');
    render();
    return;
  }

  if (mode !== 'ind' && mode !== 'gj') {
    // 팀 경기는 동기화 함수에서 처리하므로 저장 시 applyGameResult 호출 제거
    // savable.forEach(r => {
    //   const _ab = resolveAB(r);
    //   const _univW = _ab.winner==='A' ? (finalTeamA||_ab.playerA?.univ||'') : (finalTeamB||_ab.playerB?.univ||'');
    //   const _univL = _ab.winner==='A' ? (finalTeamB||_ab.playerB?.univ||'') : (finalTeamA||_ab.playerA?.univ||'');
    //   applyGameResult(r.wPlayer.name, r.lPlayer.name, dateVal, r.map || '-', matchId, _univW, _univL, _pasteModeLabel);
    // });
  }

  // 모드별 기록 추가
  if (mode === 'mini') {
    const _mType = window._miniPasteType || 'mini';
    let _a = finalTeamA || 'A팀';
    let _b = finalTeamB || (_mType === 'civil' ? 'B팀' : '?');
    if (_mType === 'civil' && (!_b || _a === _b)) { _a = 'A팀'; _b = 'B팀'; }
    miniM.unshift({ _id: matchId, d: dateVal, a: _a, b: _b, sa, sb, sets: setsSnap, type: _mType });
  } else if (mode === 'univm') {
    univM.unshift({ _id: matchId, d: dateVal, a: finalTeamA, b: finalTeamB, sa, sb, sets: setsSnap });
  } else if (mode === 'pro') {
    // 프로리그: wPlayer(A팀)=승자, lPlayer(B팀)=패자
    const proSA = setsSnap.reduce((acc,s)=>acc+s.scoreA,0);
    const proSB = setsSnap.reduce((acc,s)=>acc+s.scoreB,0);
    const mA=[], mB=[];
    savable.forEach(r=>{
      if(!mA.find(x=>x.name===r.wPlayer.name)) mA.push({name:r.wPlayer.name,univ:r.wPlayer.univ||'',race:r.wPlayer.race||'',tier:r.wPlayer.tier||''});
      if(!mB.find(x=>x.name===r.lPlayer.name)) mB.push({name:r.lPlayer.name,univ:r.lPlayer.univ||'',race:r.lPlayer.race||'',tier:r.lPlayer.tier||''});
    });
    proM.unshift({_id:matchId,d:dateVal,sa:proSA,sb:proSB,
      teamALabel:'A팀',teamBLabel:'B팀',teamAMembers:mA,teamBMembers:mB,sets:setsSnap,univWins:{},univLosses:{}});
  } else if (mode === 'ck') {
    // CK: 좌측=A팀, 우측=B팀 절대 고정 (resolveAB 우회)
    const ckAB = (r) => {
      const leftIsWin = r.leftName ? (r.leftName === r.winName) : true;
      return {
        playerA: leftIsWin ? r.wPlayer : r.lPlayer,
        playerB: leftIsWin ? r.lPlayer : r.wPlayer,
        winner:  leftIsWin ? 'A' : 'B'
      };
    };
    const ckSetsSnap = Object.keys(setMap).sort((a,b)=>a-b).map(sn=>{
      const rows=setMap[sn];
      const games=rows.map(r=>{
        const ab=ckAB(r);
        return {playerA:ab.playerA?.name||'',playerB:ab.playerB?.name||'',map:r.map && r.map !== '-' ? r.map : '',winner:ab.winner};
      });
      const scoreA=games.filter(g=>g.winner==='A').length;
      const scoreB=games.filter(g=>g.winner==='B').length;
      return {scoreA,scoreB,winner:scoreA>scoreB?'A':scoreB>scoreA?'B':'A',games};
    });
    const mA=[], mB=[];
    savable.forEach(r=>{
      const ab=ckAB(r);
      if(ab.playerA && !mA.find(x=>x.name===ab.playerA.name)) mA.push({name:ab.playerA.name,univ:ab.playerA.univ||'',race:ab.playerA.race||'',tier:ab.playerA.tier||''});
      if(ab.playerB && !mB.find(x=>x.name===ab.playerB.name)) mB.push({name:ab.playerB.name,univ:ab.playerB.univ||'',race:ab.playerB.race||'',tier:ab.playerB.tier||''});
    });
    const ckSA=ckSetsSnap.filter(s=>s.winner==='A').length;
    const ckSB=ckSetsSnap.filter(s=>s.winner==='B').length;
    ckM.unshift({_id:matchId,d:dateVal,sa:ckSA,sb:ckSB,teamALabel:'A조',teamBLabel:'B조',teamAMembers:mA,teamBMembers:mB,sets:ckSetsSnap,univWins:{},univLosses:{}});
  } else if (mode === 'comp') {
    if (compName && !compNames.includes(compName)) compNames.push(compName);
    curComp = compName;
    comps.unshift({ _id: matchId, d: dateVal, n: compName, a: finalTeamA||'', b: finalTeamB||'', sa, sb, sets: setsSnap });
  } else if (mode === 'ind') {
    // _lineDate 있으면 날짜별 다른 sid로 분리 저장
    const _indDateGroups = {};
    savable.forEach(r => {
      const d = r._lineDate || dateVal;
      if (!_indDateGroups[d]) _indDateGroups[d] = [];
      _indDateGroups[d].push(r);
    });
    const _idDup = { count: 0, dup: [] };
    Object.entries(_indDateGroups).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,group])=>{
      const indSid = genId();
      const gameSet = new Set();
      const dedupedGames = group.filter(r => {
        const key = `${r.wPlayer.name}|${r.lPlayer.name}|${r.map||'-'}`;
        if (gameSet.has(key)) {
          _idDup.count++;
          _idDup.dup.push({ w: r.wPlayer.name, l: r.lPlayer.name, m: r.map });
          return false;
        }
        gameSet.add(key);
        return true;
      });
      dedupedGames.forEach(r => {
        // 개인전은 동기화 함수에서 처리하므로 저장 시 applyGameResult 호출 제거
        // applyGameResult(r.wPlayer.name, r.lPlayer.name, d, r.map || '-', genId(), '', '', _pasteModeLabel);
      });
      const games = dedupedGames.map(r => ({ _id: genId(), sid: indSid, d, wName: r.wPlayer.name, lName: r.lPlayer.name, map: r.map && r.map !== '-' ? r.map : '', ...(r._lineMemo ? { memo: r._lineMemo } : {}) }));
      if(games.length) indM.unshift(...games);
    });
    if (_idDup.count > 0) alert(`개인전 중복 ${_idDup.count}건 제거됨 (중복: ${_idDup.dup.map(x=>`${x.w} vs ${x.l}`).join(', ')})`);
  } else if (mode === 'gj') {
    const _gjPro = !!window._gjProPaste;
    // _lineDate 있으면 날짜별 다른 sid로 분리 저장
    const _gjDateGroups = {};
    savable.forEach(r => {
      const d = r._lineDate || dateVal;
      if (!_gjDateGroups[d]) _gjDateGroups[d] = [];
      _gjDateGroups[d].push(r);
    });
    const _gjDup = { count: 0, dup: [] };
    Object.entries(_gjDateGroups).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,group])=>{
      const gjSid = genId();
      const gameSet = new Set();
      const dedupedGames = group.filter(r => {
        const key = `${r.wPlayer.name}|${r.lPlayer.name}|${r.map||'-'}`;
        if (gameSet.has(key)) {
          _gjDup.count++;
          _gjDup.dup.push({ w: r.wPlayer.name, l: r.lPlayer.name, m: r.map });
          return false;
        }
        gameSet.add(key);
        return true;
      });
      dedupedGames.forEach(r => {
        // 끝장전은 동기화 함수에서 처리하므로 저장 시 applyGameResult 호출 제거
        // applyGameResult(r.wPlayer.name, r.lPlayer.name, d, r.map || '-', genId(), '', '', _pasteModeLabel);
      });
      const games = dedupedGames.map(r => ({ _id: genId(), sid: gjSid, d, wName: r.wPlayer.name, lName: r.lPlayer.name, map: r.map && r.map !== '-' ? r.map : '', ...(_gjPro?{_proLabel:true}:{}), ...(r._lineMemo ? { memo: r._lineMemo } : {}) }));
      if(games.length) gjM.unshift(...games);
    });
    if (_gjDup.count > 0) alert(`끝장전 중복 ${_gjDup.count}건 제거됨 (중복: ${_gjDup.dup.map(x=>`${x.w} vs ${x.l}`).join(', ')})`);
  } else if (mode === 'tt') {
    const ttAB = (r) => {
      const leftIsWin = r.leftName ? (r.leftName === r.winName) : true;
      return { playerA: leftIsWin ? r.wPlayer : r.lPlayer, playerB: leftIsWin ? r.lPlayer : r.wPlayer, winner: leftIsWin ? 'A' : 'B' };
    };
    const ttSetsSnap = Object.keys(setMap).sort((a,b)=>a-b).map(sn=>{
      const rows=setMap[sn];
      const games=rows.map(r=>{ const ab=ttAB(r); return {playerA:ab.playerA?.name||'',playerB:ab.playerB?.name||'',map:r.map && r.map !== '-' ? r.map : '',winner:ab.winner}; });
      const scoreA=games.filter(g=>g.winner==='A').length, scoreB=games.filter(g=>g.winner==='B').length;
      return {scoreA,scoreB,winner:scoreA>scoreB?'A':scoreB>scoreA?'B':'A',games};
    });
    const mA=[], mB=[];
    savable.forEach(r=>{ const ab=ttAB(r);
      if(ab.playerA&&!mA.find(x=>x.name===ab.playerA.name)) mA.push({name:ab.playerA.name,univ:ab.playerA.univ||'',race:ab.playerA.race||'',tier:ab.playerA.tier||''});
      if(ab.playerB&&!mB.find(x=>x.name===ab.playerB.name)) mB.push({name:ab.playerB.name,univ:ab.playerB.univ||'',race:ab.playerB.race||'',tier:ab.playerB.tier||''});
    });
    const ttSA=ttSetsSnap.filter(s=>s.winner==='A').length, ttSB=ttSetsSnap.filter(s=>s.winner==='B').length;
    const _ttSaveComp=compName||(typeof _ttCurComp!=='undefined'?_ttCurComp:'')||'';
    ttM.unshift({_id:matchId,d:dateVal,n:_ttSaveComp,sa:ttSA,sb:ttSB,teamALabel:'A팀',teamBLabel:'B팀',teamAMembers:mA,teamBMembers:mB,sets:ttSetsSnap,univWins:{},univLosses:{},compName:_ttSaveComp});
  }
  // individual: 개인 전적만 (이미 applyGameResult 처리됨)

  if (typeof fixPoints === 'function') fixPoints();
  save();
  render();

  // 모달 닫고 완료 알림
  cm('pasteModal');
  window._pasteResults = null;
  window._pasteErrors  = null;

  // 저장 형식에 따라 해당 탭으로 자동 이동
  const tabMap = { mini:'mini', univm:'univm', pro:'pro', comp:'comp', ck:'univck', ind:'ind', gj:'gj' };
  if (tabMap[mode]) {
    const tabBtn = document.querySelector(`.tab[onclick*="sw('${tabMap[mode]}'"]`);
    if (tabBtn) tabBtn.click();
  }

  // 성공 토스트
  const modeLabel = { individual:'개인 전적', mini:'미니대전', univm:'대학대전', pro:'프로리그', comp:'대회' }[mode] || '';
  const toast = document.createElement('div');
  toast.textContent = `✅ ${savable.length}건 저장 완료${modeLabel ? ' → ' + modeLabel : ''}!`;
  toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function cleanupIndGjDuplicates(){
  if(!confirm('4월 1일부터 현재까지의 개인전/끝장전/프로리그 끝장전 중복 데이터를 제거하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) return;
  
  const _normMap = s => resolveMapName((s||'').trim()) || (s||'').trim();
  const startDate = '2024-04-01';
  const today = new Date().toISOString().slice(0, 10);
  
  let indRemoved = 0;
  let gjRemoved = 0;
  
  // indM 중복 제거 (맵+날짜+선수쌍 비교, 4월1일부터만)
  if(typeof indM!=='undefined' && indM.length){
    const seen = new Set();
    const uniqueInd = [];
    indM.forEach(m => {
      if(!m.wName || !m.lName) return;
      if(m.d < startDate || m.d > today) return; // 날짜 범위 필터
      const key = `${m.d||''}|${_normMap(m.map)}|[${[m.wName,m.lName].sort().join('|')}]`;
      if(seen.has(key)){
        indRemoved++;
      } else {
        seen.add(key);
        uniqueInd.push(m);
      }
    });
    // 전체 배열에서 중복 제거
    const seenAll = new Set();
    const finalInd = [];
    indM.forEach(m => {
      if(!m.wName || !m.lName) {
        finalInd.push(m);
        return;
      }
      const key = `${m.d||''}|${_normMap(m.map)}|[${[m.wName,m.lName].sort().join('|')}]`;
      if(seenAll.has(key)){
        indRemoved++;
      } else {
        seenAll.add(key);
        finalInd.push(m);
      }
    });
    indM.length = 0;
    indM.push(...finalInd);
  }
  
  // gjM 중복 제거 (맵+날짜+선수쌍 비교, 4월1일부터만, 프로리그 끝장전 포함)
  if(typeof gjM!=='undefined' && gjM.length){
    const seenAll = new Set();
    const finalGj = [];
    gjM.forEach(m => {
      if(!m.wName || !m.lName) {
        finalGj.push(m);
        return;
      }
      if(m.d < startDate || m.d > today) return; // 날짜 범위 필터
      const key = `${m.d||''}|${_normMap(m.map)}|[${[m.wName,m.lName].sort().join('|')}]`;
      if(seenAll.has(key)){
        gjRemoved++;
      } else {
        seenAll.add(key);
        finalGj.push(m);
      }
    });
    gjM.length = 0;
    gjM.push(...finalGj);
  }
  
  save();
  render();
  alert(`✅ 중복 제거 완료 (4월 1일 ~ ${today})\n개인전: ${indRemoved}건 제거\n끝장전: ${gjRemoved}건 제거`);
}

function clearAllIndRecords(){
  if(!confirm('개인전 기록 전체를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.\n관련 선수들의 개인 전적 히스토리도 함께 정리됩니다.')) return;

  let indRemoved = 0;

  // indM 전체 삭제
  if(typeof indM!=='undefined' && indM.length){
    indRemoved = indM.length;
    indM.length = 0;
  }

  // 선수들의 개인전 관련 히스토리 정리
  if(typeof players!=='undefined' && players.length){
    players.forEach(p => {
      if(p.history && p.history.length){
        p.history = p.history.filter(h => h.mode !== '개인전');
      }
    });
  }

  save();
  render();
  alert(`✅ 개인전 기록 ${indRemoved}건 삭제 완료`);
}

function recalculateAllELO(){
  if(!confirm('모든 선수의 ELO를 처음부터 다시 계산하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.\n- 모든 ELO가 기본값으로 초기화됩니다\n- 승/패/포인트가 재계산됩니다\n- 모든 기록이 날짜순으로 다시 적용됩니다')) return;

  // 기존 기록 백업
  const backupHistory = {};
  if(typeof players!=='undefined' && players.length){
    players.forEach(p => {
      if(p.history && p.history.length){
        backupHistory[p.name] = [...p.history];
      }
    });
  }

  // 모든 선수 초기화
  if(typeof players!=='undefined' && players.length){
    players.forEach(p => {
      p.elo = ELO_DEFAULT;
      p.win = 0;
      p.loss = 0;
      p.points = 0;
      p.history = [];
    });
  }

  // 모든 경기 기록 수집
  const allGames = [];

  // miniM (미니대전)
  if(typeof miniM!=='undefined' && miniM.length){
    miniM.forEach(m => {
      if(m.a && m.b && m.winner){
        const wName = m.winner === 'A' ? m.a : m.b;
        const lName = m.winner === 'A' ? m.b : m.a;
        allGames.push({wName, lName, date: m.d || '', map: m.map || '-', mode: m.type === 'civil' ? '시빌워' : '미니대전'});
      }
    });
  }

  // univM (대학대전)
  if(typeof univM!=='undefined' && univM.length){
    univM.forEach(m => {
      if(m.a && m.b && m.winner){
        const wName = m.winner === 'A' ? m.a : m.b;
        const lName = m.winner === 'A' ? m.b : m.a;
        allGames.push({wName, lName, date: m.d || '', map: m.map || '-', mode: '대학대전'});
      }
    });
  }

  // ckM (대학CK)
  if(typeof ckM!=='undefined' && ckM.length){
    ckM.forEach(m => {
      if(m.a && m.b && m.winner){
        const wName = m.winner === 'A' ? m.a : m.b;
        const lName = m.winner === 'A' ? m.b : m.a;
        allGames.push({wName, lName, date: m.d || '', map: m.map || '-', mode: '대학CK'});
      }
    });
  }

  // proM (프로리그)
  if(typeof proM!=='undefined' && proM.length){
    proM.forEach(m => {
      (m.sets||[]).forEach(s => {
        (s.games||[]).forEach(g => {
          if(g.playerA && g.playerB && g.winner){
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            allGames.push({wName, lName, date: m.d || '', map: g.map || '-', mode: '프로리그'});
          }
        });
      });
    });
  }

  // indM (개인전)
  if(typeof indM!=='undefined' && indM.length){
    indM.forEach(m => {
      if(m.wName && m.lName){
        allGames.push({wName: m.wName, lName: m.lName, date: m.d || '', map: m.map || '-', mode: m._proLabel ? '프로리그' : '개인전'});
      }
    });
  }

  // gjM (끝장전)
  if(typeof gjM!=='undefined' && gjM.length){
    gjM.forEach(m => {
      if(m.wName && m.lName){
        allGames.push({wName: m.wName, lName: m.lName, date: m.d || '', map: m.map || '-', mode: m._proLabel ? '프로리그끝장전' : '끝장전'});
      }
    });
  }

  // ttM (티어대회)
  if(typeof ttM!=='undefined' && ttM.length){
    ttM.forEach(m => {
      (m.sets||[]).forEach(s => {
        (s.games||[]).forEach(g => {
          if(g.playerA && g.playerB && g.winner){
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            allGames.push({wName, lName, date: m.d || '', map: g.map || '-', mode: '티어대회'});
          }
        });
      });
    });
  }

  // tourneys (대회)
  if(typeof tourneys!=='undefined' && tourneys.length){
    tourneys.forEach(tn => {
      (tn.groups||[]).forEach(grp => {
        (grp.matches||[]).forEach(m => {
          // 개별 게임이 있는 경우
          let hasGames = false;
          (m.sets||[]).forEach(s => {
            (s.games||[]).forEach(g => {
              if(g.playerA && g.playerB && g.winner){
                const wName = g.winner === 'A' ? g.playerA : g.playerB;
                const lName = g.winner === 'A' ? g.playerB : g.playerA;
                const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
                // 원본 matchId 보존
                allGames.push({wName, lName, date: date, map: g.map || '-', mode: tn.type === 'tier' ? '티어대회' : '조별리그', matchId: m._id || ''});
                hasGames = true;
              }
            });
          });
          // 개별 게임이 없고 점수만 있는 경우 (팀 단위 결과)
          if(!hasGames && m.sa != null && m.sb != null && m.a && m.b){
            const teamAPlayers = players.filter(p => p.univ === m.a);
            const teamBPlayers = players.filter(p => p.univ === m.b);
            // 각 팀의 랜덤 선수 1명씩 대전으로 처리 (단순화)
            if(teamAPlayers.length > 0 && teamBPlayers.length > 0){
              const wName = m.sa > m.sb ? teamAPlayers[0].name : teamBPlayers[0].name;
              const lName = m.sa > m.sb ? teamBPlayers[0].name : teamAPlayers[0].name;
              const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
              allGames.push({wName, lName, date: date, map: '-', mode: tn.type === 'tier' ? '티어대회' : '조별리그', matchId: m._id || ''});
            }
          }
        });
      });
      Object.values((tn.bracket||{}).matchDetails||{}).forEach(m => {
        let hasGames = false;
        (m.sets||[]).forEach(s => {
          (s.games||[]).forEach(g => {
            if(g.playerA && g.playerB && g.winner){
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
              allGames.push({wName, lName, date: date, map: g.map || '-', mode: '토너먼트', matchId: m._id || ''});
              hasGames = true;
            }
          });
        });
        if(!hasGames && m.sa != null && m.sb != null && m.a && m.b){
          const teamAPlayers = players.filter(p => p.univ === m.a);
          const teamBPlayers = players.filter(p => p.univ === m.b);
          if(teamAPlayers.length > 0 && teamBPlayers.length > 0){
            const wName = m.sa > m.sb ? teamAPlayers[0].name : teamBPlayers[0].name;
            const lName = m.sa > m.sb ? teamBPlayers[0].name : teamAPlayers[0].name;
            const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
            allGames.push({wName, lName, date: date, map: '-', mode: '토너먼트', matchId: m._id || ''});
          }
        }
      });
    });
  }

  // 날짜순 정렬 (오래된 순서)
  allGames.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // applyGameResult로 다시 적용 (중복 제거 안함)
  let appliedCount = 0;
  allGames.forEach(g => {
    applyGameResult(g.wName, g.lName, g.date, g.map, g.matchId || '', '', '', g.mode);
    appliedCount++;
  });

  // 백업에서 처리되지 않은 기록 복구
  let restoredCount = 0;
  Object.entries(backupHistory).forEach(([playerName, history]) => {
    const p = players.find(x => x.name === playerName);
    if(!p) return;
    history.forEach(h => {
      const key = `${h.opp === p.name ? h.opp : p.name}|${h.opp === p.name ? p.name : h.opp}|${h.date}|${h.map}`;
      if(!processedKeys.has(key)){
        // 백업된 기록을 그대로 복구 (ELO는 재계산되지 않음)
        p.history.push(h);
        restoredCount++;
      }
    });
  });

  save();
  render();
  alert(`✅ ELO 재계산 완료\n총 ${appliedCount}경기 재계산\n${restoredCount}건 백업 복구`);
}

function onPasteModeChange(val) {
  const compWrap = document.getElementById('paste-comp-wrap');
  const hint     = document.getElementById('paste-mode-hint');
  if (compWrap) compWrap.style.display = val === 'comp' ? 'flex' : 'none';
  const hints = {
    individual: '개인 전적 히스토리에만 기록됩니다.',
    mini:       '미니대전 기록으로 저장됩니다. 팀은 승자/패자 소속 대학으로 자동 결정됩니다.',
    univm:      '대학대전 기록으로 저장됩니다. 팀은 승자/패자 소속 대학으로 자동 결정됩니다.',
    pro:        '프로리그 기록으로 저장됩니다. 승자는 A팀, 패자는 B팀으로 분류됩니다.',
    comp:       '대회 기록으로 저장됩니다. 아래 대회명을 입력하세요.',
  };
  if (hint) hint.textContent = hints[val] || '';
  // 기준 선수 입력란: 개인전 모드일 때만 표시
  const refWrap = document.getElementById('paste-ref-player-wrap');
  if (refWrap) refWrap.style.display = (val === 'ind') ? 'flex' : 'none';
  if (val === 'ind') {
    const dl = document.getElementById('paste-ref-player-list');
    if (dl && typeof players !== 'undefined') {
      dl.innerHTML = players.flatMap(p => {
        const opts = [`<option value="${(p.name||'').replace(/"/g,'&quot;')}">`];
        if (p.memo) {
          p.memo.split(/[\s,，\n]+/).map(m=>m.trim()).filter(m=>m&&m!==p.name&&m.length>=2)
            .forEach(alias => opts.push(`<option value="${alias.replace(/"/g,'&quot;')}">`));
        }
        return opts;
      }).join('');
    }
  }
}

function setPasteMatchMode(mode){
  window._pasteMatchMode = mode;
  const lblGame = document.getElementById('match-mode-label-game');
  const lblSet  = document.getElementById('match-mode-label-set');
  const hint    = document.getElementById('paste-match-mode-hint');
  if(lblGame){
    if(mode==='game'){
      lblGame.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1;transition:.15s';
      lblSet.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3);transition:.15s';
      if(hint) hint.textContent='경기 방식: 1경기·2경기·3경기 → 이긴 경기 수 많은 팀 우승';
    } else {
      lblSet.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1;transition:.15s';
      lblGame.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3);transition:.15s';
      if(hint) hint.textContent='세트제: 세트별로 경기를 묶어 세트를 많이 이긴 팀 우승';
    }
  }
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

function swapPasteTeams(){
  // A↔B 팀 교체: 모든 경기의 wPlayer(A칸)↔lPlayer(B칸) 스왑
  if (!window._pasteResults) return;
  // 팀 전체 교체: A↔B (leftName/rightName + win/lose 모두 반전)
  window._pasteForceTeamA = window._previewTeamB || null;
  window._pasteForceTeamB = window._previewTeamA || null;
  window._pasteResults = window._pasteResults.map(r => ({
    ...r,
    winName:     r.loseName,
    loseName:    r.winName,
    leftName:    r.rightName || r.loseName,
    rightName:   r.leftName  || r.winName,
    wPlayer:     r.lPlayer,
    lPlayer:     r.wPlayer,
    wCandidates: r.lCandidates || [],
    lCandidates: r.wCandidates || [],
    wSimilar:    r.lSimilar || [],
    lSimilar:    r.wSimilar || [],
  }));
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

function closePasteModal() {
  window._gjProPaste = false;
  // 강제 모드(미니/대학대전)였다면 모드 선택기 원복
  if (window._forcedPasteMode) {
    window._forcedPasteMode = null;
    const modeSel = document.getElementById('paste-mode');
    const modeLbl = document.getElementById('paste-mode-label');
    if (modeSel) modeSel.style.display = '';
    if (modeLbl) modeLbl.style.display = '';
    const hintEl = document.getElementById('paste-mode-hint');
    if (hintEl) hintEl.textContent = '';
  }
  // 대회 세트 모드였다면 UI 원복
  if (window._grpPasteMode) {
    window._grpPasteMode = false;
    const _pd=document.querySelector('#pasteModal details');if(_pd)_pd.style.display='';
    const _md=document.getElementById('paste-match-mode-game')?.closest('div[style]');if(_md)_md.style.display='';
    const _pt=document.querySelector('#pasteModal .mtitle');if(_pt)_pt.textContent='📋 경기 결과 붙여넣기 입력';
    const compWrap = document.getElementById('paste-comp-wrap');
    if(compWrap) {
      compWrap.style.display='none';
      compWrap.innerHTML='<input type="text" id="paste-comp-name" placeholder="대회명 입력" style="border:1px solid var(--border2);border-radius:7px;padding:5px 10px;font-size:13px;width:180px">';
    }
    const hintEl = document.getElementById('paste-mode-hint');
    if(hintEl) hintEl.textContent='';
    const modeSel = document.getElementById('paste-mode');
    if(modeSel) { modeSel.style.display=''; }
    const modeLabel = document.getElementById('paste-mode-label');
    if(modeLabel) { modeLabel.style.display=''; }
    const applyBtn = document.getElementById('paste-apply-btn');
    if(applyBtn) applyBtn.textContent='✅ 저장하기';
  }
  window._pasteForceTeamA = null;
  window._pasteForceTeamB = null;
  window._pasteMatchMode = 'game';
  const swapRow = document.getElementById('paste-team-swap-row');
  if(swapRow) swapRow.style.display='none';
  // Reset match mode UI
  const lblGame = document.getElementById('match-mode-label-game');
  const lblSet  = document.getElementById('match-mode-label-set');
  if(lblGame) lblGame.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1;transition:.15s';
  if(lblSet)  lblSet.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3);transition:.15s';
  cm('pasteModal');
}

function openPasteModal() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  window._grpPasteMode = false; // 일반 모드로 초기화
  window._forcedPasteMode = null; // 강제 모드 초기화
  // 매번 열 때 초기화
  const textarea  = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (textarea)  textarea.value  = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn)  applyBtn.style.display = 'none';
  if (badge)     badge.style.display = 'none';
  if (pendWarn)  pendWarn.style.display = 'none';
  window._pasteResults = null;
  window._pasteErrors  = null;
  window._pasteRosterA = null;
  window._pasteRosterB = null;
  window._pasteForceTeamA = null;
  window._pasteForceTeamB = null;
  const refWrap = document.getElementById('paste-ref-player-wrap');
  if (refWrap) refWrap.style.display = 'none';
  const refInput = document.getElementById('paste-ref-player');
  if (refInput) refInput.value = '';

  const dateInput = document.getElementById('paste-date');
  if (dateInput) {
    // Don't load from localStorage, but keep existing value if set
    if (!dateInput.value) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
  }

  // 모드 선택기 원상 복구
  const modeSel = document.getElementById('paste-mode');
  const modeLbl = document.getElementById('paste-mode-label');
  if (modeSel) modeSel.style.display = '';
  if (modeLbl) modeLbl.style.display = '';

  // 모드 힌트 초기화
  const modeEl = document.getElementById('paste-mode');
  if (modeEl) onPasteModeChange(modeEl.value);

  om('pasteModal');
}

/* ── 미니대전 전용 붙여넣기 ── */
function openMiniPasteModal() {
  window._miniPasteType = (typeof miniType !== 'undefined' ? miniType : 'mini');
  openPasteModal();
  window._forcedPasteMode = 'mini';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'mini'; sel.style.display = 'none'; onPasteModeChange('mini'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  const isCivil = window._miniPasteType === 'civil';
  if (hint) hint.innerHTML = `<span style="color:#7c3aed;font-weight:700">${isCivil?'⚔️ 시빌워':'⚡ 미니대전'} 경기 결과 입력 모드</span>`;
}

/* ── 대학CK 전용 붙여넣기 ── */
function openCKPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'ck';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ck'; sel.style.display = 'none'; onPasteModeChange('ck'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">🤝 대학CK 경기 결과 입력 모드</span>';
}

/* ── 개인전 전용 붙여넣기 ── */
function openIndPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'ind';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ind'; sel.style.display = 'none'; onPasteModeChange('ind'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">🎮 개인전 경기 결과 입력 모드</span>';
  // 기준 선수 입력란 표시 + 자동완성 채우기
  const refWrap = document.getElementById('paste-ref-player-wrap');
  if (refWrap) refWrap.style.display = 'flex';
  const dl = document.getElementById('paste-ref-player-list');
  if (dl && typeof players !== 'undefined') {
    dl.innerHTML = players.flatMap(p => {
      const opts = [`<option value="${(p.name||'').replace(/"/g,'&quot;')}">`];
      if (p.memo) {
        p.memo.split(/[\s,，\n]+/).map(m=>m.trim()).filter(m=>m&&m!==p.name&&m.length>=2)
          .forEach(alias => opts.push(`<option value="${alias.replace(/"/g,'&quot;')}">`));
      }
      return opts;
    }).join('');
  }
}

/* ── 끝장전 전용 붙여넣기 ── */
function openGJPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'gj';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ind'; sel.style.display = 'none'; onPasteModeChange('ind'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">⚔️ 끝장전 경기 결과 입력 모드</span>';
}

/* ── 티어대회 전용 붙여넣기 ── */
function openTTPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'tt';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'mini'; sel.style.display = 'none'; }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">🎯 티어대회 경기 결과 입력 모드</span>';
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) {
    const inp = compWrap.querySelector('#paste-comp-name');
    if (inp) { inp.placeholder = '티어대회명 입력 (선택)'; inp.value = _ttCurComp||''; }
    compWrap.style.display = 'flex';
  }
}

/* ── 대회 전용 붙여넣기 ── */
function openCompPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'comp';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'comp'; sel.style.display = 'none'; onPasteModeChange('comp'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">🎖️ 대회 경기 결과 입력 모드</span>';
}

/* ── 대학대전 전용 붙여넣기 ── */
function openUnivmPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'univm';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'univm'; sel.style.display = 'none'; onPasteModeChange('univm'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">🏟️ 대학대전 경기 결과 입력 모드</span>';
}

/* ═══════════════════════════════════════════════════
   프로리그 전용 붙여넣기 모달
═══════════════════════════════════════════════════ */
window._proPasteResults = null;
window._proPasteMode = 'game'; // 'game' | 'set'

function openProPasteModal() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  const ta = document.getElementById('pro-paste-input');
  const prev = document.getElementById('pro-paste-preview');
  const applyBtn = document.getElementById('pro-apply-btn');
  const badge = document.getElementById('pro-paste-badge');
  const warn = document.getElementById('pro-paste-warn');
  const swapRow = document.getElementById('pro-swap-row');
  if (ta) ta.value = '';
  if (prev) prev.innerHTML = '';
  if (applyBtn) applyBtn.style.display = 'none';
  if (badge) badge.style.display = 'none';
  if (warn) warn.style.display = 'none';
  if (swapRow) swapRow.style.display = 'none';
  window._proPasteResults = null;
  window._proPasteMode = 'game';
  // 날짜
  const di = document.getElementById('pro-paste-date');
  if (di) di.value = new Date().toISOString().slice(0, 10); // Always reset to today
  // 경기방식 버튼 초기화
  setProPasteMode('game');
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
    ? 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1'
    : 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3)';
  if (sl) sl.style.cssText = mode==='set'
    ? 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1'
    : 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3)';
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
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    // [승]/[패] 세트 결과 요약 라인 무시
    if (/^\[(?:승|패)\]/.test(trimmed)) return;
    if (/\((?:승|패)\)\s*\d+\s*[：:]\s*\d+\s*\((?:승|패)\)/.test(trimmed)) return;
    const sepResult = parseSetSeparator(trimmed);
    if (sepResult !== null) {
      if (sepResult === 0) currentSet++;
      else currentSet = sepResult;
      const setRem = trimmed.replace(/^\d+\s*(?:세트|셋|set)\s*/i, '').trim();
      if (setRem && setRem !== trimmed) {
        const r2 = parsePasteLine(setRem);
        if (r2) {
          const wM2 = findPlayerByPartialName(r2.winName);
          const lM2 = findPlayerByPartialName(r2.loseName);
          results.push({ winName: r2.winName, loseName: r2.loseName,
            leftName: r2.leftName||r2.winName, rightName: r2.rightName||r2.loseName,
            map: r2.map||'-', setNum: currentSet,
            wPlayer: wM2.player, lPlayer: lM2.player,
            wCandidates: wM2.candidates, lCandidates: lM2.candidates,
            wSimilar: wM2.similar||[], lSimilar: lM2.similar||[], lineNum: idx+1 });
        }
      }
      return;
    }
    // 날짜 줄 감지 → pro-paste-date 자동 채움 (항상 덮어씀 — 프로는 경기 단위 날짜)
    const _proDateM = trimmed.match(/^(?:일자|날짜)\s*[:：]\s*(\d{4}-\d{2}-\d{2})/);
    if (_proDateM) {
      const _pdi = document.getElementById('pro-paste-date');
      if (_pdi) _pdi.value = _proDateM[1];
      return;
    }
    const parsed = parsePasteLine(line);
    if (!parsed) return;
    // 이름으로 선수 찾기
    const wMatch = findPlayerByPartialName(parsed.winName);
    const lMatch = findPlayerByPartialName(parsed.loseName);
    results.push({
      winName: parsed.winName, loseName: parsed.loseName,
      leftName: parsed.leftName || parsed.winName, rightName: parsed.rightName || parsed.loseName,
      map: parsed.map || '-', setNum: currentSet,
      wPlayer: wMatch.player, lPlayer: lMatch.player,
      wCandidates: wMatch.candidates, lCandidates: lMatch.candidates,
      wSimilar: wMatch.similar||[], lSimilar: lMatch.similar||[],
      lineNum: idx+1
    });
  });
  // 기존 선택 복원: 사용자가 이미 유사이름을 선택한 경우 재파싱 시 유지
  if (window._proPasteResults && window._proPasteResults.length === results.length) {
    results.forEach((r, i) => {
      const prev = window._proPasteResults[i];
      if (!prev) return;
      // 같은 라인이면 이전 선택 복원
      if (prev.winName === r.winName && prev.loseName === r.loseName) {
        if (prev.wPlayer && !r.wPlayer) { r.wPlayer = prev.wPlayer; r.wCandidates = prev.wCandidates; r.wSimilar = prev.wSimilar; }
        if (prev.lPlayer && !r.lPlayer) { r.lPlayer = prev.lPlayer; r.lCandidates = prev.lCandidates; r.lSimilar = prev.lSimilar; }
        if (prev.map && prev.map !== '-' && (r.map === '-' || !r.map)) r.map = prev.map;
        if (prev.setNum) r.setNum = prev.setNum;
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

  const savable = results.filter(r => r.wPlayer && r.lPlayer);
  const needPick = results.filter(r => (r.wCandidates?.length>1||r.lCandidates?.length>1) && !(r.wPlayer&&r.lPlayer));
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

  let html = `<div style="border:1px solid #ddd6fe;border-radius:10px;overflow:hidden;margin-bottom:10px">
  <table style="margin:0;width:100%;font-size:12px;border-collapse:collapse">
  <thead><tr style="background:linear-gradient(90deg,#5b21b6,#7c3aed);color:#fff">
    <th style="padding:6px 8px;font-size:10px;width:56px">세트</th>
    <th style="padding:6px 8px;font-size:10px;width:84px">맵</th>
    <th style="padding:6px 10px;font-size:11px;font-weight:900">🔵 A팀</th>
    <th style="padding:6px 4px;font-size:10px;width:44px;text-align:center">교체</th>
    <th style="padding:6px 10px;font-size:11px;font-weight:900">🔴 B팀</th>
    <th style="padding:6px 4px;font-size:10px;width:56px">상태</th>
    <th style="padding:6px 4px;font-size:10px;width:32px;text-align:center">삭제</th>
  </tr></thead><tbody>`;

  results.forEach((r, i) => {
    const wOk = !!r.wPlayer;
    const lOk = !!r.lPlayer;
    const wAmbig = !wOk && (r.wCandidates?.length > 1);
    const lAmbig = !lOk && (r.lCandidates?.length > 1);
    const ok = wOk && lOk;

    // A조 = 텍스트 왼쪽(leftName), B조 = 텍스트 오른쪽(rightName)
    const leftRaw  = r.leftName  || r.winName  || '';
    const rightRaw = r.rightName || r.loseName || '';
    const isLeftWinner = (leftRaw === r.winName);

    const leftPlayer  = (wOk && r.wPlayer.name === leftRaw)  ? r.wPlayer
                      : (lOk && r.lPlayer.name === leftRaw)  ? r.lPlayer : null;
    const rightPlayer = (lOk && r.lPlayer.name === rightRaw) ? r.lPlayer
                      : (wOk && r.wPlayer.name === rightRaw) ? r.wPlayer : null;

    const leftRole  = leftRaw  === (r.winName||'')  ? 'w' : 'l';
    const rightRole = rightRaw === (r.loseName||'') ? 'l' : 'w';
    const leftSim   = leftRole  === 'w' ? (r.wSimilar||[]) : (r.lSimilar||[]);
    const rightSim  = rightRole === 'l' ? (r.lSimilar||[]) : (r.wSimilar||[]);
    const leftCands  = leftRole  === 'w' ? (r.wCandidates||[]) : (r.lCandidates||[]);
    const rightCands = rightRole === 'l' ? (r.lCandidates||[]) : (r.wCandidates||[]);
    const leftAmbig  = !leftPlayer  && leftCands.length > 1;
    const rightAmbig = !rightPlayer && rightCands.length > 1;

    const aName = leftPlayer  ? leftPlayer.name  : leftRaw;
    const bName = rightPlayer ? rightPlayer.name : rightRaw;

    const ho = (bg,def) => `onmouseover="this.style.background='${bg}'" onmouseout="this.style.background='${def}'"`;
    const winBadge  = `<span style="font-size:10px;color:#16a34a;font-weight:700;background:#dcfce7;border:1px solid #86efac;border-radius:4px;padding:1px 5px">승</span>`;
    const loseBadge = `<span style="font-size:10px;color:#dc2626;font-weight:700;background:#fee2e2;border:1px solid #fca5a5;border-radius:4px;padding:1px 5px">패</span>`;

    // ── A조 셀 (텍스트 왼쪽 선수) ──
    const buildACell = () => {
      if (leftPlayer) {
        return `<div style="display:inline-flex;align-items:center;gap:6px">
          <button class="pro-name-flip" data-idx="${i}" ${ho('#bfdbfe','#dbeafe')}
            style="font-size:13px;font-weight:900;color:#1d4ed8;background:#dbeafe;border:1.5px solid #93c5fd;border-radius:8px;padding:3px 10px;cursor:pointer;white-space:nowrap">
            ${aName}</button>${isLeftWinner ? winBadge : loseBadge}</div>`;
      }
      if (leftAmbig) {
        return `<div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-size:11px;color:#b45309;font-weight:700">${aName}</span>
          <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${leftCands.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${leftRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#fef3c7','#fffbeb')} style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:11px;font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div></div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:3px">
        <input value="${aName}" data-idx="${i}" data-role="${leftRole}" onchange="proEditName(this,${i},'${leftRole}')"
          style="width:90px;border:1px solid #fca5a5;border-radius:5px;padding:2px 6px;font-size:12px;font-weight:700;color:#dc2626;background:#fff5f5" placeholder="선수명">
        ${leftSim.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">
          <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>
          ${leftSim.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${leftRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#ede9fe','#faf5ff')} style="padding:2px 8px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:11px;font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div>` : ''}
      </div>`;
    };

    // ── B조 셀 (텍스트 오른쪽 선수) ──
    const buildBCell = () => {
      if (rightPlayer) {
        return `<div style="display:inline-flex;align-items:center;gap:6px">
          <button class="pro-name-flip" data-idx="${i}" ${ho('#fecaca','#fee2e2')}
            style="font-size:13px;font-weight:900;color:#991b1b;background:#fee2e2;border:1.5px solid #fca5a5;border-radius:8px;padding:3px 10px;cursor:pointer;white-space:nowrap">
            ${bName}</button>${isLeftWinner ? loseBadge : winBadge}</div>`;
      }
      if (rightAmbig) {
        return `<div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-size:11px;color:#b45309;font-weight:700">${bName}</span>
          <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${rightCands.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${rightRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#fef3c7','#fffbeb')} style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:11px;font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div></div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:3px">
        <input value="${bName}" data-idx="${i}" data-role="${rightRole}" onchange="proEditName(this,${i},'${rightRole}')"
          style="width:90px;border:1px solid #fca5a5;border-radius:5px;padding:2px 6px;font-size:12px;font-weight:700;color:#dc2626;background:#fff5f5" placeholder="선수명">
        ${rightSim.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">
          <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>
          ${rightSim.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${rightRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#ede9fe','#faf5ff')} style="padding:2px 8px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:11px;font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div>` : ''}
      </div>`;
    };

    // 맵 드롭다운
    const mapOpts = `<option value="-">-</option>` +
      allMaps.map(m=>`<option value="${m}" ${m===r.map?'selected':''}>${m}</option>`).join('') +
      `<option value="__custom__">직접입력...</option>`;
    const mapCell = `<select class="pro-map-sel" data-idx="${i}"
      style="width:80px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:11px">${mapOpts}</select>`;

    // 세트 드롭다운
    let setOpts='';
    for(let s=1;s<=Math.max(maxSet,3);s++) setOpts+=`<option value="${s}" ${s===(r.setNum||1)?'selected':''}>${s}세트</option>`;
    const setCell = `<select class="pro-set-sel" data-idx="${i}"
      style="width:56px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:11px">${setOpts}</select>`;

    // 전체 교체 버튼 (중앙)
    const flipBtn = `<button class="pro-flip-btn" data-idx="${i}" title="A팀↔B팀 교체"
      style="padding:3px 6px;border-radius:5px;border:1px solid #ddd6fe;background:#f5f3ff;font-size:13px;cursor:pointer;transition:.12s"
      onmouseover="this.style.background='#ede9fe'" onmouseout="this.style.background='#f5f3ff'">⇄</button>`;

    // 상태
    const statusBadge = ok
      ? `<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">✓저장</span>`
      : (wAmbig||lAmbig)
        ? `<span style="background:#fef9c3;color:#b45309;border:1px solid #fcd34d;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">선택↑</span>`
        : `<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">미인식</span>`;

    const delBtn = `<button class="pro-del-btn" data-idx="${i}"
      style="padding:3px 6px;border-radius:5px;border:1px solid #fecaca;background:#fff5f5;font-size:12px;cursor:pointer;transition:.12s"
      onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fff5f5'">🗑</button>`;

    const rowBg = ok ? '#f8faff' : (wAmbig||lAmbig) ? '#fffbeb' : '#fff8f8';
    html += `<tr style="background:${rowBg};border-bottom:1px solid #f0f0f0">
      <td style="padding:5px 6px">${setCell}</td>
      <td style="padding:5px 6px">${mapCell}</td>
      <td style="padding:5px 10px">${buildACell()}</td>
      <td style="padding:5px 4px;text-align:center">${flipBtn}</td>
      <td style="padding:5px 10px">${buildBCell()}</td>
      <td style="padding:5px 5px">${statusBadge}</td>
      <td style="padding:5px 4px;text-align:center">${delBtn}</td>
    </tr>`;
  });
  html += `</tbody></table></div>`;

  // 세트별 점수 요약
  if (savable.length > 0) {
    const mode = window._proPasteMode || 'game';
    const setMap2 = {};
    savable.forEach(r => {
      const sn = r.setNum||1;
      if(!setMap2[sn]) setMap2[sn]={A:0,B:0};
      // leftName이 있으면: 왼쪽 선수가 A조, 오른쪽이 B조
      // 왼쪽 선수가 이겼으면 A++, 오른쪽 선수가 이겼으면 B++
      const leftN = r.leftName || r.winName;
      const isLeftWinner = (leftN === r.winName);
      if (isLeftWinner) setMap2[sn].A++; else setMap2[sn].B++;
    });
    const multiSet = Object.keys(setMap2).length > 1;
    let sa=0, sb=0;
    const setRows = Object.keys(setMap2).sort((a,b)=>a-b).map(sn=>{
      const s=setMap2[sn]; const sw=s.A>s.B?'A':s.B>s.A?'B':'';
      if(sw==='A') sa++; else if(sw==='B') sb++;
      return `<span style="display:inline-flex;align-items:center;gap:4px;background:${sw?'#f0fdf4':'#f8fafc'};border:1px solid ${sw?'#86efac':'#e2e8f0'};border-radius:8px;padding:3px 10px;font-size:12px">
        <span style="font-size:10px;color:var(--gray-l);font-weight:600">${sn}세트</span>
        <span style="font-weight:800;color:${sw==='A'?'#1d4ed8':'#64748b'}">${s.A}</span>:
        <span style="font-weight:800;color:${sw==='B'?'#16a34a':'#64748b'}">${s.B}</span>
        ${sw?`<span style="font-size:10px;font-weight:700;color:#16a34a">${sw}조 ✓</span>`:''}
      </span>`;
    }).join('');
    const totalA = (mode==='set'||multiSet) ? sa : Object.values(setMap2).reduce((s,v)=>s+v.A,0);
    const totalB = (mode==='set'||multiSet) ? sb : Object.values(setMap2).reduce((s,v)=>s+v.B,0);
    const winner = totalA>totalB?'🔵 A팀':totalB>totalA?'🔴 B팀':'무승부';
    html += `<div style="padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">📊 결과 미리보기${multiSet?' (세트제)':''}</div>
      ${multiSet?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">${setRows}</div>`:''}
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-weight:900;font-size:14px;color:#1d4ed8">🔵 A팀</span>
        <span style="font-weight:900;font-size:22px">
          <span style="color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
          <span style="color:var(--gray-l);font-size:14px"> : </span>
          <span style="color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
        </span>
        <span style="font-weight:900;font-size:14px;color:#dc2626">🔴 B팀</span>
        <span style="font-size:12px;font-weight:700;padding:3px 12px;border-radius:12px;background:${totalA===totalB?'#f1f5f9':'#dcfce7'};color:${totalA===totalB?'#64748b':'#15803d'}">
          ${totalA===totalB?'🤝 무승부':'🏆 '+winner+' 승'}
        </span>
      </div>
    </div>`;
  }

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
      if (origName && origName !== p.name) {
        const memos = (p.memo||'').split(/[\s,\n]+/).map(s=>s.trim()).filter(Boolean);
        if (!memos.includes(origName)) {
          p.memo = memos.length ? p.memo + ' ' + origName : origName;
          save();
          const toast = document.createElement('div');
          toast.textContent = `✅ "${origName}" → "${p.name}" 자동 인식 등록됨`;
          Object.assign(toast.style, {position:'fixed',bottom:'76px',left:'50%',transform:'translateX(-50%)',background:'#1e3a8a',color:'#fff',padding:'9px 18px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',zIndex:'99999',opacity:'0',transition:'opacity .25s',whiteSpace:'nowrap'});
          document.body.appendChild(toast);
          requestAnimationFrame(()=>{ toast.style.opacity='1'; });
          setTimeout(()=>{ toast.style.opacity='0'; setTimeout(()=>toast.remove(),300); },2800);
        }
      }

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
      [r.winName, r.loseName] = [r.loseName, r.winName];
      [r.wPlayer, r.lPlayer] = [r.lPlayer, r.wPlayer];
      [r.wCandidates, r.lCandidates] = [r.lCandidates||[], r.wCandidates||[]];
      [r.wSimilar, r.lSimilar] = [r.lSimilar||[], r.wSimilar||[]];
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
  const m = findPlayerByPartialName(name);
  const r = window._proPasteResults[idx];
  if (!r) return;
  if (role==='w') {
    r.wPlayer = m.player; r.winName = name;
    r.wCandidates = m.candidates; r.wSimilar = m.similar||[];
  } else {
    r.lPlayer = m.player; r.loseName = name;
    r.lCandidates = m.candidates; r.lSimilar = m.similar||[];
  }
  // 맵 별칭 학습: 입력된 이름과 실제 맵 이름이 다르면 alias에 추가
  renderProPreview(window._proPasteResults);
}

function swapProTeams() {
  if (!window._proPasteResults) return;
  window._proPasteResults = window._proPasteResults.map(r => ({
    ...r,
    winName: r.loseName, loseName: r.winName,
    wPlayer: r.lPlayer, lPlayer: r.wPlayer,
    wCandidates: r.lCandidates||[], lCandidates: r.wCandidates||[],
    wSimilar: r.lSimilar||[], lSimilar: r.wSimilar||[],
  }));
  renderProPreview(window._proPasteResults);
}

function proApply() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  if (!window._proPasteResults) return;
  const savable = window._proPasteResults.filter(r => r.wPlayer && r.lPlayer);
  if (!savable.length) return alert('저장 가능한 경기가 없습니다.');
  const dateVal = document.getElementById('pro-paste-date')?.value || new Date().toISOString().slice(0,10);
  const matchId = genId();
  const mode = window._proPasteMode || 'game';

  // ── A조/B조 판별: 텍스트에서 왼쪽 선수 = A조, 오른쪽 선수 = B조 ──
  // parsePasteLine이 leftName/rightName을 보존하므로 이를 활용
  // leftName의 선수가 A조, rightName의 선수가 B조
  const resolveTeam = (r) => {
    // leftName/rightName이 있으면 그것을 기준으로 배정
    const leftN = r.leftName || r.winName;   // 텍스트에서 왼쪽 선수 이름
    const rightN = r.rightName || r.loseName; // 텍스트에서 오른쪽 선수 이름
    // 실제 선수 객체 찾기
    const leftPlayerObj = players.find(p => p.name === leftN) || r.wPlayer;
    const rightPlayerObj = players.find(p => p.name === rightN) || r.lPlayer;
    // null safety: 찾을 수 없으면 fallback
    const playerA = leftPlayerObj || r.wPlayer;
    const playerB = rightPlayerObj || r.lPlayer;
    // 왼쪽 선수가 A조
    const isLeftWinner = (leftN === r.winName);
    return {
      playerA,   // A조 (텍스트 왼쪽)
      playerB,   // B조 (텍스트 오른쪽)
      winner: isLeftWinner ? 'A' : 'B'  // 승자가 A조이면 'A', B조이면 'B'
    };
  };

  // setsSnap 구성
  const setMap2 = {};
  savable.forEach(r => {
    const sn = r.setNum||1;
    if(!setMap2[sn]) setMap2[sn]=[];
    setMap2[sn].push(r);
  });
  const setsSnap = Object.keys(setMap2).sort((a,b)=>a-b).map(sn => {
    const rows = setMap2[sn];
    const games = rows.map(r => {
      const t = resolveTeam(r);
      return {
        playerA: t.playerA.name,
        playerB: t.playerB.name,
        map: r.map||'-',
        winner: t.winner
      };
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
    const totalA = setsSnap.reduce((s,st)=>s+st.scoreA,0);
    const totalB = setsSnap.reduce((s,st)=>s+st.scoreB,0);
    sa = totalA; sb = totalB;
  }

  // 개인 전적 반영 - 팀 경기는 동기화 함수에서 처리하므로 저장 시 applyGameResult 호출 제거
  // savable.forEach(r => applyGameResult(r.wPlayer.name, r.lPlayer.name, dateVal, r.map||'-', matchId, '', '', '프로리그'));

  // A조/B조 멤버 목록 (팀 배정 기준으로)
  const mA=[], mB=[];
  savable.forEach(r => {
    const t = resolveTeam(r);
    if(!mA.find(x=>x.name===t.playerA.name)) mA.push({name:t.playerA.name,univ:t.playerA.univ||'',race:t.playerA.race||'',tier:t.playerA.tier||''});
    if(!mB.find(x=>x.name===t.playerB.name)) mB.push({name:t.playerB.name,univ:t.playerB.univ||'',race:t.playerB.race||'',tier:t.playerB.tier||''});
  });

  proM.unshift({_id:matchId, d:dateVal, sa, sb,
    teamALabel:'A팀', teamBLabel:'B팀',
    teamAMembers:mA, teamBMembers:mB,
    sets:setsSnap, univWins:{}, univLosses:{}});

  if (typeof fixPoints==='function') fixPoints();
  save();
  render();
  closeProPasteModal();

  // 프로리그 탭으로 이동
  const tabBtn = document.querySelector(`.tab[onclick*="sw('pro'"]`);
  if (tabBtn) tabBtn.click();

  // 성공 토스트
  const toast = document.createElement('div');
  toast.textContent = `✅ ${savable.length}건 프로리그 저장 완료!`;
  toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(), 2800);
}

