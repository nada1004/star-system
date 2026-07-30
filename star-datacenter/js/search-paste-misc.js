/* ══════════════════════════════════════════════════════════════
   검색 - 세트구분선/TSV 타입 판별 (search-parsing.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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

