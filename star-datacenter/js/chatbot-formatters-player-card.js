const TEAM_COLORS = {
  '츠캄몬스타즈': { light: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', dark: 'linear-gradient(135deg,#78350f 0%,#92400e 100%)' },
  '케이대': { light: 'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)', dark: 'linear-gradient(135deg,#1e3a8a 0%,#1e40af 100%)' },
  '포스텍': { light: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', dark: 'linear-gradient(135deg,#064e3b 0%,#065f46 100%)' },
  '서울대': { light: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)', dark: 'linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)' },
  '연세대': { light: 'linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)', dark: 'linear-gradient(135deg,#4c1d95 0%,#5b21b6 100%)' },
  '고려대': { light: 'linear-gradient(135deg,#f97316 0%,#ea580c 100%)', dark: 'linear-gradient(135deg,#7c2d12 0%,#9a3412 100%)' },
  '성균관대': { light: 'linear-gradient(135deg,#06b6d4 0%,#0891b2 100%)', dark: 'linear-gradient(135deg,#164e63 0%,#155e75 100%)' },
  '한양대': { light: 'linear-gradient(135deg,#ec4899 0%,#db2777 100%)', dark: 'linear-gradient(135deg,#831843 0%,#9d174d 100%)' },
  '중앙대': { light: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)', dark: 'linear-gradient(135deg,#312e81 0%,#3730a3 100%)' },
  '경희대': { light: 'linear-gradient(135deg,#14b8a6 0%,#0d9488 100%)', dark: 'linear-gradient(135deg,#134e4a 0%,#115e59 100%)' },
  '기본': { light: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', dark: 'linear-gradient(135deg,#1e293b 0%,#334155 100%)' }
};

function getTeamColor(univ, isDark) {
  const colors = TEAM_COLORS[univ] || TEAM_COLORS['기본'];
  return isDark ? colors.dark : colors.light;
}

// player.tier는 데이터상 '2티어'처럼 이미 "티어"가 붙어있는 값과 'G'/'K'/'유스'/'미정'처럼
// 안붙어있는 값이 섞여있어, 무조건 "티어"를 붙이면 "2티어티어"가 되는 문제가 있었음 → 중복 방지.
function _pcTierLabel(tier) {
  const t = String(tier || '').trim();
  return t || '미정';
}

// player.race는 실제로는 'T'/'Z'/'P' 코드로 저장되어 있어 (전체기록/맵별전적 등 다른 챗봇
// 포맷터와 동일한 규칙), 기존에 '테란'/'저그'/'프로토스' 전체 텍스트와만 비교하던 로직이
// 항상 실패해서 "⚫ T" 처럼 어색하게 표시되던 문제를 수정.
function _pcRaceInfo(race) {
  const r = String(race || '').trim().toUpperCase();
  const map = {
    T: { code: 'T', label: '테란' },
    Z: { code: 'Z', label: '저그' },
    P: { code: 'P', label: '프로토스' },
    '테란': { code: 'T', label: '테란' },
    '저그': { code: 'Z', label: '저그' },
    '프로토스': { code: 'P', label: '프로토스' }
  };
  return map[r] || { code: 'N', label: r || '미정' };
}

// 최근전적/통계/전체기록 외 추가 조회 옵션을 접어둔 칩 형태로 제공.
// 순수 CSS(체크박스 해크)로 펼치기/접기를 구현해 버튼이 많아져도 카드가 지저분해지지 않도록 함.
function formatPlayerMoreOptions(player) {
  const uid = 'pcmore_' + Math.random().toString(36).slice(2, 9);
  const opts = [
    { label: '상대전적', q: `${player.name} 상대전적` },
    { label: '맵별승률', q: `${player.name} 맵별승률` },
    { label: '종족별전적', q: `${player.name} 종족별전적` },
    { label: '대회기록', q: `${player.name} 대회기록` },
    { label: 'ELO', q: `${player.name} elo` }
  ];
  const chips = opts.map(o => `<button class="pcm-chip" data-chatbot-quick="${escapeAttr(o.q)}">${o.label}</button>`).join('');

  return `<div style="padding:2px 10px 10px;background:var(--surface)">
<input type="checkbox" id="${uid}" class="pcm-toggle-input">
<label for="${uid}" class="pcm-toggle-label">
<span class="pcm-txt-more">더 많은 기록 보기</span><span class="pcm-txt-less">간단히 보기</span>
<span class="pcm-chev">›</span>
</label>
<div class="pcm-panel">${chips}</div>
<style>
.pcm-toggle-input{position:absolute;opacity:0;pointer-events:none;width:0;height:0}
.pcm-toggle-label{margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 0;cursor:pointer;font-size:var(--fs-sm);color:var(--text2);font-weight:700;user-select:none;border:1px solid var(--border);border-radius:10px;background:var(--white)}
.pcm-txt-less{display:none}
.pcm-chev{display:inline-block;font-size:11px;transform:rotate(90deg)}
.pcm-panel{display:none;grid-template-columns:1fr 1fr;gap:6px;padding-top:6px}
.pcm-chip{padding:9px 0;border-radius:10px;border:1px solid var(--blue-ll);background:var(--blue-l);color:var(--blue-d);font-size:var(--fs-sm);font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif}
.pcm-chip:nth-child(5){grid-column:1 / span 2}
#${uid}:checked ~ .pcm-panel{display:grid}
#${uid}:checked ~ label .pcm-txt-more{display:none}
#${uid}:checked ~ label .pcm-txt-less{display:inline}
#${uid}:checked ~ label .pcm-chev{transform:rotate(-90deg)}
</style>
</div>`;
}

function formatPlayerBasicInfo(player) {
  const total = player.win + player.loss;
  const rate = total > 0 ? ((player.win / total) * 100).toFixed(1) : 0;
  
  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const currentMonthName = monthNames[currentMonth];
  
  const safePlayerName = escapeHtml(player.name);
  const safeUniv = escapeHtml(player.univ);
  
  const _tc = _tierBadgeColors(player.tier);
  const tierColor = (typeof getTierBtnTextColor === 'function' && player.tier) ? (getTierBtnTextColor(player.tier) || _tc[0]) : _tc[0];
  const tierBg = (typeof getTierBtnColor === 'function' && player.tier) ? (getTierBtnColor(player.tier) || _tc[1]) : _tc[1];
  const tierLabel = _pcTierLabel(player.tier);
  const raceInfo = _pcRaceInfo(player.race);
  const raceClass = raceInfo.code === 'T' ? 'rT' : raceInfo.code === 'Z' ? 'rZ' : raceInfo.code === 'P' ? 'rP' : 'rN';

  const univColor = (typeof univCfg !== 'undefined' ? (univCfg.find(x=>x.name===player.univ)||{}) : {}).color || '#1e3a8a';
  const btnStyle = `flex:1;padding:10px 0;border:none;border-radius:10px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif`;
  const qRecent = `${player.name} 최근전적`;
  const qStats = `${player.name} 통계`;
  const qAll = `${player.name} 전체기록`;
  const quickBtns = `<div class="pcm-mainbtns" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:9px 10px 2px;background:var(--surface)">
<button data-chatbot-quick="${escapeAttr(qRecent)}" style="${btnStyle};background:var(--blue);color:#fff">최근전적</button>
<button data-chatbot-quick="${escapeAttr(qStats)}" style="${btnStyle};background:var(--blue);color:#fff">통계</button>
<button data-chatbot-quick="${escapeAttr(qAll)}" style="${btnStyle};background:#1e3a8a;color:#fff">전체기록</button>
</div>${formatPlayerMoreOptions(player)}`;

  const infoBadges = `<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:6px">
<span style="font-size:var(--fs-sm);font-weight:800;padding:3px 10px;border-radius:20px;color:${tierColor};background:${tierBg}">${escapeHtml(tierLabel)}</span>
<span class="rbadge ${raceClass}" style="font-size:var(--fs-sm);font-weight:800;padding:3px 10px;border-radius:20px">${escapeHtml(raceInfo.label)}</span>
<span style="font-size:var(--fs-sm);color:var(--text3)">ELO <b style="color:var(--text)">${player.elo}</b></span>
</div>
<div style="font-size:var(--fs-md);font-weight:800;margin-top:4px"><span style="color:#dc2626">${player.win}승</span> <span style="color:#2563eb">${player.loss}패</span> <span style="font-size:var(--fs-sm);font-weight:500;color:var(--text3)">(${rate}%)</span></div>`;

  if (player.photo && String(player.photo).trim()) {
    return `<div style="border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.14)"><div style="background:var(--surface)"><img src="${toHttpsUrl(player.photo)}" style="width:100%;height:340px;display:block;object-fit:cover;object-position:center 18%;image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges"></div><div style="background:var(--white);padding:14px 12px 6px"><div style="font-size:var(--fs-lg);font-weight:900;color:var(--text)">${safePlayerName}</div><div style="font-size:var(--fs-base);color:var(--text3);margin-top:1px">${safeUniv}</div>${infoBadges}</div>${quickBtns}</div>`;
  }

  return `<div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1)"><div style="background:${univColor};padding:18px 14px 14px;display:flex;align-items:center;gap:12px"><div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">👤</div><div><div style="font-size:var(--fs-lg);font-weight:900;color:#fff">${safePlayerName}</div><div style="font-size:var(--fs-base);color:rgba(255,255,255,0.8);margin-top:1px">${safeUniv}</div></div></div><div style="background:var(--white);padding:12px 12px 6px">${infoBadges}</div>${quickBtns}</div>`;
}

// 퍼지(부분일치/유사도) 검색 결과가 입력값과 다를 때: 자동으로 확정하지 않고
// "혹시 이 선수인가요?" 확인 카드를 보여준다. 사용자가 '맞아요'를 눌러야
// 실제 정보(followupCmd)가 표시된다. (예: "시조" 검색 시 "시조새"로 임의 확정되는 것 방지)
function formatFuzzyPlayerConfirm(query, player, followupCmd) {
  const cmd = followupCmd || player.name;
  const safeQuery = escapeHtml(query);
  const safeName = escapeHtml(player.name);
  const safeUniv = escapeHtml(player.univ || '');
  const _tc = _tierBadgeColors(player.tier);
  const tierColor = (typeof getTierBtnTextColor === 'function' && player.tier) ? (getTierBtnTextColor(player.tier) || _tc[0]) : _tc[0];
  const tierBg = (typeof getTierBtnColor === 'function' && player.tier) ? (getTierBtnColor(player.tier) || _tc[1]) : _tc[1];
  const tierLabel = _pcTierLabel(player.tier);
  const raceInfo = _pcRaceInfo(player.race);
  const raceClass = raceInfo.code === 'T' ? 'rT' : raceInfo.code === 'Z' ? 'rZ' : raceInfo.code === 'P' ? 'rP' : 'rN';

  return `<div style="display:flex;flex-direction:column;gap:6px">
<div style="font-size:var(--fs-sm);color:var(--text3);font-weight:700">🤔 '${safeQuery}' 선수를 찾을 수 없어요. 혹시 이 선수인가요?</div>
<div style="border-radius:12px;border:1px solid var(--border);padding:10px 12px;display:flex;align-items:center;gap:10px;background:var(--surface)">
<div style="width:38px;height:38px;border-radius:10px;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:var(--fs-lg);flex-shrink:0">👤</div>
<div style="flex:1;min-width:0">
<div style="font-weight:800;color:var(--text);font-size:var(--fs-base)">${safeName} <span style="font-weight:600;color:var(--text3);font-size:var(--fs-sm)">${safeUniv}</span></div>
<div style="font-size:var(--fs-sm);color:var(--text3);margin-top:2px;display:flex;align-items:center;gap:5px"><span class="rbadge ${raceClass}" style="padding:1px 8px;border-radius:10px;font-weight:700">${escapeHtml(raceInfo.label)}</span> · <span style="color:${tierColor};font-weight:700;background:${tierBg};padding:1px 8px;border-radius:10px">${escapeHtml(tierLabel)}</span></div>
</div>
<button data-chatbot-quick="${escapeAttr(cmd)}" style="padding:8px 14px;border:none;border-radius:9px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;background:#2563eb;color:#fff;flex-shrink:0;white-space:nowrap">맞아요</button>
</div>
</div>`;
}

// 퍼지 매칭 결과를 안내만 하는 가벼운 한 줄 표시 (클릭 필요 없음)
function formatFuzzyNote(query, actualName) {
  return `<div style="font-size:var(--fs-sm);color:var(--text3);font-weight:600;margin-bottom:2px">🔍 '${escapeHtml(query)}' → <b style="color:#2563eb">${escapeHtml(actualName)}</b></div>`;
}

try{
  window.getTeamColor = getTeamColor;
  window.formatPlayerBasicInfo = formatPlayerBasicInfo;
  window.formatFuzzyPlayerConfirm = formatFuzzyPlayerConfirm;
  window.formatFuzzyNote = formatFuzzyNote;
}catch(e){}
