// 알등이 챗봇 - 날짜별 경기 결과 조회
// "어제 경기", "오늘 경기결과", "미니대전 결과", "어제 미니대전 결과", "7월 18일 미니대전 결과" 등을 처리합니다.

// "어제"/"오늘"/"그제"/"7월 18일"/"2026-07-18" 같은 표현을 YYYY-MM-DD 문자열로 변환
function _resolveDateKeyword(text) {
  if (!text) return null;
  const now = new Date();
  const localStr = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  if (/그제|그저께/.test(text)) {
    const d = new Date(now); d.setDate(d.getDate() - 2);
    return localStr(d);
  }
  if (/어제/.test(text)) {
    const d = new Date(now); d.setDate(d.getDate() - 1);
    return localStr(d);
  }
  if (/오늘/.test(text)) {
    return localStr(now);
  }

  const ymd = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) {
    const mm = String(ymd[2]).padStart(2, '0');
    const dd = String(ymd[3]).padStart(2, '0');
    return `${ymd[1]}-${mm}-${dd}`;
  }

  const md = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (md) {
    const mm = String(md[1]).padStart(2, '0');
    const dd = String(md[2]).padStart(2, '0');
    let yyyy = now.getFullYear();
    // 연도가 없을 때: 해당 날짜가 미래면 작년으로 보정 (경기 기록은 항상 과거/오늘 기준)
    if (new Date(`${yyyy}-${mm}-${dd}`) > now) yyyy -= 1;
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function _dailyMatchesForDate(arr, dateStr) {
  return (arr || []).filter(m => m && m.d === dateStr);
}

// 대전 유형 하나(미니대전/대학대전/프로리그/CK리그)의 특정 날짜 결과
function formatDailyTypeResult(typeKey, dateStr, dateLabel) {
  const typeDefs = {
    '미니대전': { arr: (typeof miniM !== 'undefined' ? miniM : []), label: '미니대전', emoji: '⚡', color: 'linear-gradient(135deg,#7c3aed,#5b21b6)' },
    '대학대전': { arr: (typeof univM !== 'undefined' ? univM : []), label: '대학대전', emoji: '🏟️', color: 'linear-gradient(135deg,#0891b2,#0e7490)' },
    '프로리그': { arr: (typeof proM !== 'undefined' ? proM : []), label: '프로리그', emoji: '🏅', color: 'linear-gradient(135deg,#d97706,#b45309)', proStyle: true },
    'ck': { arr: (typeof ckM !== 'undefined' ? ckM : []), label: 'CK리그', emoji: '🔥', color: 'linear-gradient(135deg,#dc2626,#b91c1c)', proStyle: true },
  };
  const def = typeDefs[typeKey];
  if (!def) return null;

  let targetDate = dateStr;
  let usedFallback = false;
  let matches = _dailyMatchesForDate(def.arr, targetDate);

  // 날짜를 지정하지 않았으면(예: "미니대전 결과") 가장 최근 기록이 있는 날짜를 보여줌
  if (!dateStr) {
    const dates = [...new Set(def.arr.map(m => m && m.d).filter(Boolean))].sort();
    if (dates.length) {
      targetDate = dates[dates.length - 1];
      matches = _dailyMatchesForDate(def.arr, targetDate);
      usedFallback = true;
    }
  }

  if (!matches.length) {
    const label = dateLabel || targetDate || '해당 날짜';
    return _noRecordCard(def.emoji, `${label} ${def.label}`);
  }

  const titleDate = targetDate + (usedFallback ? ' (최근 기록일)' : '');
  const header = _matchCardHeader(def.emoji, `${titleDate} ${def.label} 결과`, `${matches.length}경기`, def.color);
  const rowFn = m => {
    const left = def.proStyle ? (m.teamALabel || m.a || 'A') : m.a;
    const right = def.proStyle ? (m.teamBLabel || m.b || 'B') : m.b;
    return _matchRow(m.d, `${left} vs ${right}`, `${m.sa}:${m.sb}`, '', m.sa > m.sb);
  };
  const rows = matches.map(rowFn).join('');
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white);padding:8px 8px 4px">${rows}</div></div>`;
}

// 특정 날짜의 전체 경기(미니대전/대학대전/프로리그/CK리그/개인전/끝장전) 결과를 한번에 모아서 보여줌
function formatDailyAllMatches(dateStr, dateLabel) {
  if (!dateStr) return '❌ 날짜를 확인할 수 없습니다. "어제 경기" 또는 "오늘 경기"처럼 물어봐줘.';

  const groups = [
    { key: '미니대전', arr: (typeof miniM !== 'undefined' ? miniM : []), emoji: '⚡' },
    { key: '대학대전', arr: (typeof univM !== 'undefined' ? univM : []), emoji: '🏟️' },
    { key: '프로리그', arr: (typeof proM !== 'undefined' ? proM : []), emoji: '🏅', proStyle: true },
    { key: 'CK리그', arr: (typeof ckM !== 'undefined' ? ckM : []), emoji: '🔥', proStyle: true },
    { key: '개인전', arr: (typeof indM !== 'undefined' ? indM : []), emoji: '⚔️', simple: true },
    { key: '끝장전', arr: (typeof gjM !== 'undefined' ? gjM : []), emoji: '💥', simple: true },
  ];

  let sections = '';
  let totalCount = 0;

  groups.forEach(g => {
    const matches = _dailyMatchesForDate(g.arr, dateStr);
    if (!matches.length) return;
    totalCount += matches.length;
    const rows = matches.map(m => {
      if (g.simple) {
        const won = true; // 승자 기준으로 항상 강조
        return _matchRow(m.d, `${m.wName || '?'} vs ${m.lName || '?'}`, '', m.map || '', won);
      }
      const left = g.proStyle ? (m.teamALabel || m.a || 'A') : m.a;
      const right = g.proStyle ? (m.teamBLabel || m.b || 'B') : m.b;
      return _matchRow(m.d, `${left} vs ${right}`, `${m.sa}:${m.sb}`, '', m.sa > m.sb);
    }).join('');
    sections += `<div style="margin:0 2px 10px">
      <div style="font-weight:800;font-size:var(--fs-sm);color:var(--text);margin-bottom:4px">${g.emoji} ${g.key} (${matches.length})</div>
      ${rows}
    </div>`;
  });

  if (!totalCount) return _noRecordCard('📅', `${dateLabel || dateStr} 경기`);

  const header = _matchCardHeader('📅', `${dateLabel || dateStr} 경기 결과`, `총 ${totalCount}경기`, 'linear-gradient(135deg,#1e3a8a,#2563eb)');
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white);padding:10px 8px 4px">${sections}</div></div>`;
}

try{
  window._resolveDateKeyword = _resolveDateKeyword;
  window.formatDailyTypeResult = formatDailyTypeResult;
  window.formatDailyAllMatches = formatDailyAllMatches;
}catch(e){}
