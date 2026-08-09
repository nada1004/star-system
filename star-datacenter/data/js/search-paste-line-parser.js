/* ══════════════════════════════════════════════════════════════
   검색 - 붙여넣기 라인 파서 (parsePasteLine) (search-parsing.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
