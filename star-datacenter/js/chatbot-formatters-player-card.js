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

function formatPlayerBasicInfo(player) {
  const total = player.win + player.loss;
  const rate = total > 0 ? ((player.win / total) * 100).toFixed(1) : 0;
  
  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const currentMonthName = monthNames[currentMonth];
  
  const safePlayerName = escapeHtml(player.name);
  const safeUniv = escapeHtml(player.univ);
  
  const _tc = _tierBadgeColors(player.tier);
  const tierColor = _tc[0];
  const tierBg = _tc[1];
  const raceIcon = player.race === '테란' ? '🔵' : player.race === '저그' ? '🟣' : player.race === '프로토스' ? '🟡' : '⚫';

  const univColor = (typeof univCfg !== 'undefined' ? (univCfg.find(x=>x.name===player.univ)||{}) : {}).color || '#1e3a8a';
  const btnStyle = `flex:1;padding:9px 0;border:none;border-radius:9px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif`;
  const qRecent = `${player.name} 최근전적`;
  const qStats = `${player.name} 통계`;
  const qAll = `${player.name} 전체기록`;
  const quickBtns = `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;padding:8px 10px;background:#f8fafc">
<button data-chatbot-quick="${escapeAttr(qRecent)}" style="${btnStyle};background:#2563eb;color:#fff">최근전적</button>
<button data-chatbot-quick="${escapeAttr(qStats)}" style="${btnStyle};background:#2563eb;color:#fff">통계</button>
<button data-chatbot-quick="${escapeAttr(qAll)}" style="${btnStyle};background:#1e3a8a;color:#fff">전체기록</button>
</div>`;

  const infoBadges = `<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:6px">
<span style="font-size:var(--fs-sm);font-weight:800;padding:3px 10px;border-radius:20px;color:${tierColor};background:${tierBg}">${player.tier}티어</span>
<span style="font-size:var(--fs-sm);color:#475569;font-weight:600">${raceIcon} ${player.race}</span>
<span style="font-size:var(--fs-sm);color:#94a3b8">ELO <b style="color:#334155">${player.elo}</b></span>
</div>
<div style="font-size:14px;font-weight:800;margin-top:4px"><span style="color:#dc2626">${player.win}승</span> <span style="color:#2563eb">${player.loss}패</span> <span style="font-size:var(--fs-sm);font-weight:500;color:#94a3b8">(${rate}%)</span></div>`;

  if (player.photo && String(player.photo).trim()) {
    return `<div style="border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.14)"><div style="background:#f1f5f9"><img src="${toHttpsUrl(player.photo)}" style="width:100%;height:340px;display:block;object-fit:cover;object-position:center 18%;image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges"></div><div style="background:#fff;padding:14px 12px 6px"><div style="font-size:var(--fs-lg);font-weight:900;color:#1a202c">${safePlayerName}</div><div style="font-size:var(--fs-base);color:#64748b;margin-top:1px">${safeUniv}</div>${infoBadges}</div>${quickBtns}</div>`;
  }

  return `<div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1)"><div style="background:${univColor};padding:18px 14px 14px;display:flex;align-items:center;gap:12px"><div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">👤</div><div><div style="font-size:19px;font-weight:900;color:#fff">${safePlayerName}</div><div style="font-size:var(--fs-base);color:rgba(255,255,255,0.8);margin-top:1px">${safeUniv}</div></div></div><div style="background:#fff;padding:12px 12px 6px">${infoBadges}</div>${quickBtns}</div>`;
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
  const tierColor = _tc[0];
  const tierBg = _tc[1];
  const raceIcon = player.race === '테란' ? '🔵' : player.race === '저그' ? '🟣' : player.race === '프로토스' ? '🟡' : '⚫';

  return `<div style="display:flex;flex-direction:column;gap:6px">
<div style="font-size:var(--fs-sm);color:#64748b;font-weight:700">🤔 '${safeQuery}' 선수를 찾을 수 없어요. 혹시 이 선수인가요?</div>
<div style="border-radius:12px;border:1px solid #e2e8f0;padding:10px 12px;display:flex;align-items:center;gap:10px;background:#f8fafc">
<div style="width:38px;height:38px;border-radius:10px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">👤</div>
<div style="flex:1;min-width:0">
<div style="font-weight:800;color:#1a202c;font-size:var(--fs-base)">${safeName} <span style="font-weight:600;color:#94a3b8;font-size:var(--fs-sm)">${safeUniv}</span></div>
<div style="font-size:var(--fs-sm);color:#64748b;margin-top:2px">${raceIcon} ${escapeHtml(player.race||'')} · <span style="color:${tierColor};font-weight:700;background:${tierBg};padding:1px 7px;border-radius:10px">${escapeHtml(player.tier||'')}티어</span></div>
</div>
<button data-chatbot-quick="${escapeAttr(cmd)}" style="padding:8px 14px;border:none;border-radius:9px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;background:#2563eb;color:#fff;flex-shrink:0;white-space:nowrap">맞아요</button>
</div>
</div>`;
}

// 퍼지 매칭 결과를 안내만 하는 가벼운 한 줄 표시 (클릭 필요 없음)
function formatFuzzyNote(query, actualName) {
  return `<div style="font-size:var(--fs-sm);color:#94a3b8;font-weight:600;margin-bottom:2px">🔍 '${escapeHtml(query)}' → <b style="color:#2563eb">${escapeHtml(actualName)}</b></div>`;
}

try{
  window.getTeamColor = getTeamColor;
  window.formatPlayerBasicInfo = formatPlayerBasicInfo;
  window.formatFuzzyPlayerConfirm = formatFuzzyPlayerConfirm;
  window.formatFuzzyNote = formatFuzzyNote;
}catch(e){}
