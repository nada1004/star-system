// 알등이 챗봇 - 업데이트/개선사항 안내
// 새 기능을 추가하거나 개선할 때마다, 아래 CHATBOT_CHANGELOG 배열의 맨 앞에 새 항목을 추가해주세요.
// 형식: { date: 'YYYY-MM-DD', title: '한줄 요약', items: ['상세 설명 1', '상세 설명 2'] }
const CHATBOT_CHANGELOG = [
  {
    date: '2026-07-19',
    title: '경기 결과 조회 & 업데이트 안내 기능 추가',
    items: [
      '"어제 경기" / "오늘 경기"라고 물으면 그날 있었던 모든 대전 결과(미니대전·대학대전·프로리그·CK리그·개인전·끝장전)를 한번에 볼 수 있어요.',
      '"미니대전 결과", "어제 미니대전 결과", "7월 18일 미니대전 결과"처럼 물으면 해당 날짜의 미니대전 결과만 따로 볼 수 있어요. (대학대전·프로리그·CK리그도 동일하게 지원)',
      '"업데이트" 또는 "개선사항"이라고 물으면 알등이의 최신 변경 내역을 알려드려요.',
    ],
  },
];

function formatChangelog(limit) {
  const list = (typeof CHATBOT_CHANGELOG !== 'undefined' ? CHATBOT_CHANGELOG : []).slice(0, limit || 5);
  if (!list.length) return '아직 등록된 업데이트 내역이 없어요.';

  const header = _matchCardHeader('🛠️', '알등이 업데이트 내역', `최근 ${list.length}건`, 'linear-gradient(135deg,#334155,#1e293b)');
  const rows = list.map(entry => {
    const itemsHtml = (entry.items || []).map(t => `<div style="padding:2px 0 2px 2px;color:#334155;font-size:var(--fs-sm);line-height:1.4">• ${t}</div>`).join('');
    return `<div style="padding:9px 12px;border-bottom:1px solid #e8edf2">
      <div style="font-weight:800;font-size:var(--fs-sm);color:#0f172a;margin-bottom:3px">🗓️ ${entry.date} · ${entry.title}</div>
      ${itemsHtml}
    </div>`;
  }).join('');

  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:#fff">${rows}</div></div>`;
}

try{
  window.CHATBOT_CHANGELOG = CHATBOT_CHANGELOG;
  window.formatChangelog = formatChangelog;
}catch(e){}
