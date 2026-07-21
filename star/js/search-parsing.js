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
  // 애티튜드 표기 통일 (에티튜드도 호환)
  '애티튜드':'애티튜드','에티튜드':'애티튜드',
  '매치포인트':'매치포인트','도미네이터':'도미네이터',
  '실피드':'실피드','블리츠':'블리츠','서킷':'서킷','신 개마고원':'신 개마고원',
  '아이언포리스트':'아이언포리스트','파이썬':'파이썬','화랑':'화랑','지옥섬':'지옥섬',
  '투영':'투영','네오리게이트':'네오리게이트','메트로폴리스':'메트로폴리스',
  // 제인스
  '제인스':'제인스',
  // ── 약자 ──
  '라데':'라데온','라':'라데온','라데리안':'라데온',
  '녹아':'녹아웃','녹':'녹아웃',
  '리트':'리트리트','리':'리트리트',
  '폴':'폴리포이드','폴리':'폴리포이드','폴스':'폴리포이드',   // 폴스 추가
  '플스':'플스타','플립':'플스타',                             // 플립 추가
  '옥':'옥타곤','옥타':'옥타곤',                               // 옥타 추가
  // 애티튜드
  '에티':'애티튜드','애티':'애티튜드','에':'애티튜드',
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
  // 제인스
  '제인':'제인스',
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

/* ─────────────────────────────────────────────────────────────
   (요청사항) 자동인식 출력 포맷(전역)
   - 설정에서 어떤 입력이 와도 결과를 동일 포맷으로 출력할 수 있도록 통합
   - 변환툴/자동인식(표시·복사·출력)에서 공용으로 사용
───────────────────────────────────────────────────────────── */
const _AUTO_OUTFMT_KEY = 'su_auto_outfmt';
function _autoOutfmtDefault(){
  return {
    includeRace: true,      // 선수(종족)
    includeMap: true,       // [맵]
    mapBrackets: true,      // 맵을 [ ] 로 감쌈
    winnerEmphasis: 'none', // none | star | md
    winMark: '✅',
    loseMark: '⬜',
    vsMark: '🆚️',
    hideUnknownRace: true   // 종족이 N/미정이면 표시 안 함
  };
}
function autoOutfmtLoad(){
  try{
    const raw = localStorage.getItem(_AUTO_OUTFMT_KEY);
    if(!raw) return _autoOutfmtDefault();
    const obj = JSON.parse(raw) || {};
    return {..._autoOutfmtDefault(), ...obj};
  }catch(e){
    return _autoOutfmtDefault();
  }
}
function autoOutfmtSave(next){
  try{ localStorage.setItem(_AUTO_OUTFMT_KEY, JSON.stringify({..._autoOutfmtDefault(), ...(next||{})})); }catch(e){}
}
function _autoGetRace(name){
  try{
    if(typeof players !== 'undefined' && Array.isArray(players)){
      const p = players.find(x=>x && x.name===name);
      const r = (p && p.race) ? String(p.race).trim().toUpperCase() : '';
      if(r==='T'||r==='Z'||r==='P'||r==='N') return r;
    }
  }catch(e){}
  return '';
}
function autoFormatMatchLine(winName, loseName, mapName){
  const fmt = autoOutfmtLoad();
  const w = String(winName||'').trim();
  const l = String(loseName||'').trim();
  const m = String(mapName||'').trim();
  if(!w || !l) return '';

  const racePart = (nm)=>{
    if(!fmt.includeRace) return '';
    const r = _autoGetRace(nm);
    if(!r) return '';
    if(fmt.hideUnknownRace && r==='N') return '';
    return `(${r})`;
  };
  const emph = (nm)=>{
    if(fmt.winnerEmphasis==='md') return `**${nm}**`;
    if(fmt.winnerEmphasis==='star') return `★${nm}`;
    return nm;
  };
  const mapPart = ()=>{
    if(!fmt.includeMap) return '';
    if(!m || m==='-') return '';
    return fmt.mapBrackets ? `[${m}]` : m;
  };

  const mp = mapPart();
  return `${emph(w)}${racePart(w)} ${fmt.winMark} ${fmt.vsMark} ${fmt.loseMark} ${l}${racePart(l)}${mp ? ' ' + mp : ''}`.trim();
}

// 전역 노출(다른 모듈/설정에서 재사용)
try{
  window.autoOutfmtLoad = autoOutfmtLoad;
  window.autoOutfmtSave = autoOutfmtSave;
  window.autoFormatMatchLine = autoFormatMatchLine;
}catch(e){}

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

    // (버그/개선) 일반 숫자 구분자도 분리 지원
    // - "1. xxx 2. yyy" / "1) xxx 2) yyy" / "1경기 ... 2경기 ..." 처럼 한 줄에 여러 경기 붙은 경우
    // - 날짜(2026-04-22, 4/22)나 점수(3:2)와 혼동을 줄이기 위해, 앞글자가 공백/구분자일 때만 경계로 인정
    const isSepPrev = (idx) => {
      const prev = line[idx-1] || '';
      return /\s/.test(prev) || /[|·•\-–—~]/.test(prev);
    };
    try{
      const rxNumDot = /(\d{1,2})[.)]\s+/g;         // 1. , 2) ...
      const rxGameK  = /(\d{1,2})(경기|세트)(?=\s|$)/g;   // 1경기, 2세트 ...
      let m;
      while((m = rxNumDot.exec(line))){
        const idx = m.index;
        if(idx>0 && isSepPrev(idx)) positions.push(idx);
      }
      while((m = rxGameK.exec(line))){
        const idx = m.index;
        if(idx>0 && isSepPrev(idx)) positions.push(idx);
      }
    }catch(e){}

    if (positions.length === 0) {
      result.push(line);
      return;
    }
    // 중복/정렬
    positions.sort((a,b)=>a-b);
    const uniq=[];
    positions.forEach(p=>{ if(!uniq.length || uniq[uniq.length-1]!==p) uniq.push(p); });
    let prev = 0;
    uniq.forEach(pos => {
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
  const isRaceLine = l => /^([TZPN](선픽|후픽)?|선픽|후픽)$/.test(l.trim());
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
    const cleaned = name.replace(/[TZPN](선픽|후픽)?$/, '').replace(/(선픽|후픽)$/, '').trim();
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
  // (호환) 전각 괄호/VS/🆚 등 정규화 (설정에서 끌 수 있음)
  const _pasteCompat = (localStorage.getItem('su_paste_compat') ?? '1') === '1';
  if (_pasteCompat) {
    line = line
      .replace(/[（]/g, '(').replace(/[）]/g, ')')
      // 🆚️(variation selector 포함) → 🆚 로만 정리 (🆚를 'vs'로 바꾸면 파서 분기가 꼬일 수 있음)
      .replace(/🆚️/g, '🆚')
      .replace(/ＶＳ/g, 'vs')
      .replace(/V\s*\.?\s*S\s*\.?/gi, 'vs');
  }
  // 꼬리 장식 이모지 제거 (예: [라] 👈 → [라])
  line = line.replace(/\s*[\u{10000}-\u{10FFFF}]+\s*$/u, '').trimEnd();

  // (요청사항) "1경기" 번호를 미리 추출해 보관 (후속 prefix 제거로 사라지지 않게)
  // - 예: "1경기 [실피] 도재욱P (패) vs (승) 임홍규Z"
  let _gameNum = null;
  const _gm = line.match(/^\s*(\d+)\s*경기\b/);
  if (_gm) _gameNum = parseInt(_gm[1]);

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
    .replace(/^\[매치\]\s*/i, '')                 // [매치] 제거
    .replace(/^[\d]+\s*경기[\.\)·\s]*/i, '')      // N경기
    .replace(/^경기\s*[\d]+[\:\.\)·\s]*/i, '')    // 경기N:
    .replace(/^[\d]+[R라r][\.\)·\s]*/i, '')       // NR, N라운드
    .replace(/^[\d]+[\.\)]\s*/, '')               // N. N)
    .replace(/^[-•·▶▷>\s]+/, '')
    .trim();

  if (!line) return null;

  // ── 형식 A-1: 일반 텍스트 VS + (⭕/❌) 마크 ──
  // 예: "[라데] 면추가 Z (⭕) vs 김말랑 T (❌)"
  // - ⭕ = 승 / ❌ = 패 (반대도 지원)
  // - 앞쪽 [맵] 표기 지원, 뒤쪽 [맵] 표기도 지원
  // - 종족(T/Z/P/N) 표기는 입력에 있어도 applyGameResult에서 처리 가능하지만, 여기서도 일부 정규화
  if (/\bvs\b/i.test(line)) {
    const WIN_MARKS  = ['✅', '⭕', '☑', '🔵', '🟢', '🟦', '○'];
    const LOSE_MARKS = ['❌', '✖', '⬜', '🔴', '🟥', '●'];
    const ALL_MARKS  = [...WIN_MARKS, ...LOSE_MARKS];

    let map = '-';
    // 앞쪽 [맵] 추출
    const headMap = line.match(/^\[([^\]]+)\]\s*/);
    if (headMap) {
      const alias = headMap[1].trim();
      // (버그) [P]/[T]/[Z] 같은 "종족 표기"를 맵으로 오인하는 문제 방지
      // - 실제 맵 약자(예: [라], [폴])는 1글자일 수 있으므로, 종족 1글자만 예외 처리
      if (!/^[TZPNR]$/i.test(alias)) {
        map = resolveMapName(alias);
        line = line.slice(headMap[0].length).trim();
      }
    }

    // 좌/우 분리
    // (호환) "vs" 주변 공백이 없어도 인식
    const parts = line.split(/\s*vs\s*/i);
    if (parts.length === 2) {
      let leftPart = parts[0].trim();
      let rightPart = parts[1].trim();

      // 우측 끝 "- 맵약자" 추출 (예: "- 폴", "- 라", "- 녹")
      // - 입력기/폰트에 따라 하이픈이 '－'(전각)으로 들어오는 케이스도 있어 포함
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

      // 우측 끝 [맵] 추출 (맵이 아직 없을 때만)
      if (map === '-') {
        const tailMap = rightPart.match(/\[([^\]]+)\]\s*$/);
        if (tailMap) {
          const alias = tailMap[1].trim();
          // (버그) 우측 이름 뒤 [T]/[P] 종족 브라켓을 맵으로 오인 방지
          if (!/^[TZPNR]$/i.test(alias)) {
            map = resolveMapName(alias);
            rightPart = rightPart.slice(0, tailMap.index).trim();
          }
        }
      }

      // 마크 추출: (⭕) / (❌) 또는 끝에 ⭕/❌
      const pickMarkEnd = (s) => {
        for (const mk of ALL_MARKS) {
          if (s.endsWith('(' + mk + ')')) return {mark: mk, text: s.slice(0, -(mk.length + 2)).trim()};
          if (s.endsWith(mk)) return {mark: mk, text: s.slice(0, -mk.length).trim()};
        }
        // (승)/(패) 텍스트도 지원
        const m = s.match(/\((승|패)\)\s*$/);
        if (m) return {mark: m[1] === '승' ? '✅' : '❌', text: s.slice(0, s.lastIndexOf('(' + m[1] + ')')).trim()};
        return {mark: null, text: s.trim()};
      };
      const pickMarkStart = (s) => {
        // "(승) 이름" / "(패) 이름" 형태 지원
        const m = s.match(/^\((승|패)\)\s*/);
        if (m) {
          const mark = m[1] === '승' ? '✅' : '❌';
          const text = s.slice(m[0].length).trim();
          return {mark, text};
        }
        // "✅ 이름" / "❌ 이름" 형태도 지원
        for (const mk of ALL_MARKS) {
          if (s.startsWith(mk)) return {mark: mk, text: s.slice(mk.length).trim()};
          if (s.startsWith('(' + mk + ')')) return {mark: mk, text: s.slice(mk.length + 2).trim()};
        }
        return {mark: null, text: s.trim()};
      };
      let L = pickMarkEnd(leftPart);
      if (!L.mark) L = pickMarkStart(leftPart);
      let R = pickMarkEnd(rightPart);
      if (!R.mark) R = pickMarkStart(rightPart);
      if (!L.mark || !R.mark) {
        // 마크가 없으면 이 분기에서는 처리하지 않음 (다른 파서로 넘김)
      } else {
        const leftWin = WIN_MARKS.includes(L.mark);
        const rightWin = WIN_MARKS.includes(R.mark);
        if (leftWin === rightWin) return null;

        const stripRaceSuffix = (s) => {
          let t = String(s || '').trim();
        // [P]이름 / 이름[T] 형태의 브라켓 종족 제거
        t = t.replace(/\s*\[[TZPRN]\]\s*/gi, ' ').trim();
        // 혹시 남아있는 "- 맵약자" 꼬리 제거(하이픈 변종 포함)
        // ※ map 파싱에 실패했을 때 이름에 맵이 붙어 유사매칭 오작동하는 것을 방지
        t = t.replace(/\s*[-–—－]\s*[^\s]+?\s*$/,'').trim();
          // "(P)" 같은 종족 괄호 제거
          t = t.replace(/\s*\([TZPRN]\)\s*$/i, '').trim();
          // "이광용P" 같은 종족 1글자 접미 제거
          t = t.replace(/\s*[TZPRN]$/i, '').trim();
        // 한글 사이 공백 제거(예: "요　시" → "요시")
        t = t.replace(/([가-힣])\s+([가-힣])/g, '$1$2').replace(/\s{2,}/g, ' ').trim();
          return t;
        };
        const leftName = stripRaceSuffix(L.text);
        const rightName = stripRaceSuffix(R.text);

        const winName = leftWin ? leftName : rightName;
        const loseName = leftWin ? rightName : leftName;

        if (winName && loseName) return { winName, loseName, map, leftName, rightName, ...( _gameNum ? { gameNum: _gameNum } : {} ) };
      }
    }
  }

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

    // 맵 추출: 🌐맵 / 🌍맵 이모지 방식 또는 [맵약자] 브라켓 방식 또는 "- 맵약자" 방식 지원
    // ※ [🌐🌍] 문자클래스는 서로게이트 쌍을 개별 코드유닛으로 처리해 오작동 → alternation 사용
    // 1) "- 라 / - 폴 / - 녹" 처럼 하이픈 꼬리 우선 처리 (전각 하이픈 포함)
    const mapHy = rightPart.match(/\s*[-–—－]\s*([^\s]+)\s*$/);
    const mapEmoji = rightPart.match(/(?:🌐|🌍)\s*(\S+)/);
    const mapBracket = rightPart.match(/\[([^\]]+)\]\s*$/);

    if (mapHy) {
      const alias = mapHy[1].trim();
      const resolved = resolveMapName(alias);
      if (resolved !== alias) {
        map = resolved;
        rightClean = rightPart.slice(0, mapHy.index).trim();
      }
    } else if (mapEmoji) {
      // 이모지 방식: 선수명🌐맵
      const alias = mapEmoji[1].trim();
      map = resolveMapName(alias);
      rightClean = rightPart.slice(0, mapEmoji.index).trim();
    } else if (mapBracket) {
      // 브라켓 방식 (우측 끝): 선수명 [맵약자]
      const alias = mapBracket[1].trim();
      // (버그) [T]/[P]/[Z]/[N] 종족 브라켓을 맵으로 오인 방지
      if (!/^[TZPNR]$/i.test(alias)) {
        map = resolveMapName(alias);
        rightClean = rightPart.slice(0, mapBracket.index).trim();
      }
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
        const alias = leftBracket[1].trim();
        if (!/^[TZPNR]$/i.test(alias)) {
          map = resolveMapName(alias);
          leftPart = leftPart.slice(leftBracket[0].length).trim();
        }
      }
    }

    const splitNR = (s) => {
      let t = String(s||'').trim();
      // 1) [P]요시 / [T]김세주 (앞 브라켓 종족)
      const front = t.match(/^\[([TZPNR])\]\s*(.+)$/i);
      if (front && front[2].trim()) {
        t = front[2].trim();
        const nm = t.replace(/([가-힣])\s+([가-힣])/g,'$1$2').replace(/\s{2,}/g,' ').trim();
        return { name: nm, race: front[1].toUpperCase() };
      }
      // 2) 요시[T] / 김세주[P] (끝 브라켓 종족)
      const tail = t.match(/^(.+?)\s*\[([TZPNR])\]\s*$/i);
      if (tail && tail[1].trim()) {
        t = tail[1].trim();
        const nm = t.replace(/([가-힣])\s+([가-힣])/g,'$1$2').replace(/\s{2,}/g,' ').trim();
        return { name: nm, race: tail[2].toUpperCase() };
      }
      // 3) 앞 종족 접두사: Z조이 / P마토 / T주양
      const prefixM = t.match(/^([TZPNR])(.+)$/i);
      if (prefixM && prefixM[2].trim()) return { name: prefixM[2].trim(), race: prefixM[1].toUpperCase() };
      // 4) 뒤 종족 접미: 요시P / 김세주T
      const simpleM = t.match(/^(.+?)([TZPNR])$/i);
      if (simpleM) return { name: simpleM[1].trim(), race: simpleM[2].toUpperCase() };
      // 하이픈 꼬리 제거(맵이 남아 이름 매칭을 망치는 것 방지)
      t = t.replace(/\s*[-–—－]\s*[^\s]+?\s*$/,'').trim();
      // 한글 사이 공백 제거(예: "요　시" → "요시")
      t = t.replace(/([가-힣])\s+([가-힣])/g,'$1$2').replace(/\s{2,}/g,' ').trim();
      return { name: t.trim(), race: '' };
    };
    const left  = splitNR(leftPart);
    const right = splitNR(rightClean);
    if (!left.name || !right.name) return null;

    // rawMapStr for format B (from emoji/bracket extraction)
    const _bRawMap = mapEmoji ? mapEmoji[1].trim() : (mapBracket ? mapBracket[1].trim() : '');
    const winName = leftWin  ? left.name  : right.name;
    const loseName = leftWin  ? right.name : left.name;
    // 화면 표기용(요청): 요시(P) ⬜ 🆚️ ✅ 김세주(T) [폴리포이드] 형태를 만들 수 있게 메타도 저장
    const _normWinMark  = '✅';
    const _normLoseMark = '⬜';
    const leftMarkNorm  = leftWin ? _normWinMark : _normLoseMark;
    const rightMarkNorm = leftWin ? _normLoseMark : _normWinMark;
    return {
      winName:  leftWin  ? left.name  : right.name,
      loseName: leftWin  ? right.name : left.name,
      map, _rawMapStr: _bRawMap,
      leftName: left.name, rightName: right.name,
      leftRace: left.race || '', rightRace: right.race || '',
      leftMark: leftMarkNorm, rightMark: rightMarkNorm
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
        const prefixM = s.match(/^([TZPN])(.+)$/);
        if (prefixM && prefixM[2].trim()) return { name: prefixM[2].trim(), race: prefixM[1] };
        const bracketM = s.match(/^(.+?)\[(\d*)([TZPN])\]$/);
        if (bracketM) return { name: bracketM[1].trim(), race: bracketM[3] };
        const simpleM = s.match(/^(.+?)([TZPN])$/);
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
            const pm = s.match(/^([TZPN])(.+)$/); if (pm && pm[2].trim()) return { name: pm[2].trim(), race: pm[1] };
            const bm = s.match(/^(.+?)\[(\d*)([TZPN])\]$/); if (bm) return { name: bm[1].trim(), race: bm[3] };
            const sm = s.match(/^(.+?)([TZPN])$/); if (sm) return { name: sm[1].trim(), race: sm[2] };
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
  // (호환) 공백 유무 상관없이 vs 인식
  const vsSplit = line.split(/\s*(?:vs)\s*/i);

  // ── 형식 A-1: 종족 있음 "이름T(승/패)" ──
  const parsePartWithRace = (s) => {
    s = s.trim();
    // 이름 종족(선택) (승/패) : "장윤철T(패)", "장윤철 T (패)", "장윤철(패)"
    const m = s.match(/^(.+?)\s*([TZPN])?\s*\((승|패)\)$/);
    if (m) return { name: m[1].trim(), race: m[2] || '', result: m[3] };
    // (승/패) 이름 종족(선택) 형식: "(패) 이재호T", "(승)이재호"
    const m2 = s.match(/^\((승|패)\)\s*(.+?)\s*([TZPN])?$/);
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
    const pat = /(.+?)\s*([TZPN])?\s*\((승|패)\)|(\((?:승|패)\))\s*(.+?)\s*([TZPN])?(?=\s|$)/g;
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

  // 패턴 6: "1세트 2경기 ..." 처럼 세트 번호가 문장 앞에 붙는 경우도 세트 헤더로 인식
  // (기존에는 '1세트' 단독 줄만 인식해서, 같은 줄에 경기 정보가 있으면 세트가 항상 1로 보일 수 있었음)
  const m6 = t.match(/^(\d+)\s*(?:세트|셋|set)\b/i);
  if (m6) return parseInt(m6[1]);

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

