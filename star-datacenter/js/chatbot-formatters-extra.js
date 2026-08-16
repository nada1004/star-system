// ══════════════════════════════════════════════════════════
// chatbot-formatters-extra.js — 챗봇 확장 명령어 포맷터
// 스트리머 ELO / 맵별 승률 / 상대종족별 전적(요약) / 이번주·이번달 MVP /
// 대학순위 / 대학 승패기록
// 의존: chatbot-utils.js(escapeHtml 등), board2-briefing-data.js·
//       board2-briefing.js·board2-core.js(주간·월간 MVP/대학 통계 계산 헬퍼)
// ══════════════════════════════════════════════════════════

// ─── 스트리머 ELO 카드 ──────────────────────────────
function formatPlayerElo(player) {
  if (!player) return '❌ 선수 데이터를 불러올 수 없습니다.';
  const total = (player.win || 0) + (player.loss || 0);
  const rate = total > 0 ? ((player.win / total) * 100).toFixed(1) : 0;
  const tC = _tierBadgeColors(player.tier);
  const header = _matchCardHeader('⚡', `${escapeHtml(player.name)} ELO`, escapeHtml(player.univ || '무소속'), 'linear-gradient(135deg,#1e3a8a,#2563eb)');
  const body = `<div style="background:var(--white);padding:16px 14px;text-align:center">
    <div style="font-size:34px;font-weight:900;color:var(--text)">${escapeHtml(player.elo ?? '-')}</div>
    <div style="font-size:var(--fs-sm);color:var(--text3);font-weight:700;margin-top:2px">ELO 포인트</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;flex-wrap:wrap">
      <span style="font-size:var(--fs-sm);font-weight:800;padding:3px 10px;border-radius:20px;color:${tC[0]};background:${tC[1]}">${escapeHtml(player.tier || '미정')}티어</span>
      <span style="font-size:var(--fs-sm);color:var(--text2);font-weight:700">${escapeHtml(player.win || 0)}승 ${escapeHtml(player.loss || 0)}패 (${rate}%)</span>
    </div>
  </div>`;
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}${body}</div>`;
}

// ─── 스트리머 맵별 승률 전체 요약 ──────────────────
function formatPlayerMapWinRates(player) {
  if (!player) return '❌ 선수 데이터를 불러올 수 없습니다.';
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  const byMap = {};
  player.history.forEach(h => {
    const m = String(h.map || '').trim();
    if (!m) return;
    if (!byMap[m]) byMap[m] = { w: 0, l: 0 };
    if (h.result === '승') byMap[m].w++; else byMap[m].l++;
  });
  const rows = Object.entries(byMap)
    .map(([map, s]) => ({ map, ...s, total: s.w + s.l, rate: (s.w + s.l) ? Math.round(s.w / (s.w + s.l) * 100) : 0 }))
    .sort((a, b) => b.total - a.total || b.rate - a.rate);
  if (rows.length === 0) return `📭 ${player.name}의 맵 기록이 없습니다.`;

  const header = _matchCardHeader('🗺️', `${escapeHtml(player.name)} 맵별 승률`, `${rows.length}개 맵`, 'linear-gradient(135deg,#0f766e,#14b8a6)');
  const body = rows.map(r => {
    const barColor = r.rate >= 50 ? '#16a34a' : '#dc2626';
    return `<div style="padding:8px 12px;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text)">${escapeHtml(r.map)}</span>
        <span style="font-size:var(--fs-sm);font-weight:900;color:${barColor}">${r.rate}%</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
        <div style="flex:1;height:6px;border-radius:999px;background:var(--surface);overflow:hidden">
          <div style="height:100%;width:${r.rate}%;background:${barColor}"></div>
        </div>
        <span style="font-size:var(--fs-caption);color:var(--text3);white-space:nowrap">${r.w}승 ${r.l}패 · ${r.total}경기</span>
      </div>
    </div>`;
  }).join('');
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white)">${body}</div></div>`;
}

// ─── 스트리머 상대종족별 전적 요약(저그/테란/프로토스 한번에) ─
function formatPlayerRaceBreakdown(player) {
  if (!player) return '❌ 선수 데이터를 불러올 수 없습니다.';
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  const agg = { P: { w: 0, l: 0 }, T: { w: 0, l: 0 }, Z: { w: 0, l: 0 } };
  const raceLabel = { P: '프로토스', T: '테란', Z: '저그' };
  const raceEmoji = { P: '🟡', T: '🔵', Z: '🟣' };
  player.history.forEach(h => {
    let r = String(h.oppRace || '').trim().toUpperCase();
    if (!agg[r]) {
      const oppPlayer = (typeof players !== 'undefined') ? players.find(p => p.name === h.opp) : null;
      r = String(oppPlayer?.race === '테란' ? 'T' : oppPlayer?.race === '저그' ? 'Z' : oppPlayer?.race === '프로토스' ? 'P' : '').trim();
    }
    if (!agg[r]) return;
    if (h.result === '승') agg[r].w++; else agg[r].l++;
  });

  const header = _matchCardHeader('🎮', `${escapeHtml(player.name)} 상대종족별 전적`, null, 'linear-gradient(135deg,#7c2d12,#ea580c)');
  const body = ['Z', 'T', 'P'].map(r => {
    const s = agg[r];
    const total = s.w + s.l;
    const rate = total ? Math.round(s.w / total * 100) : 0;
    const barColor = rate >= 50 ? '#16a34a' : '#dc2626';
    return `<div style="padding:10px 12px;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text)">${raceEmoji[r]} ${raceLabel[r]}전</span>
        <span style="font-size:var(--fs-sm);font-weight:900;color:${total ? barColor : 'var(--text3)'}">${total ? rate + '%' : '기록없음'}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
        <div style="flex:1;height:6px;border-radius:999px;background:var(--surface);overflow:hidden">
          <div style="height:100%;width:${rate}%;background:${barColor}"></div>
        </div>
        <span style="font-size:var(--fs-caption);color:var(--text3);white-space:nowrap">${s.w}승 ${s.l}패 · ${total}경기</span>
      </div>
    </div>`;
  }).join('');
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white)">${body}</div></div>`;
}

// ─── 주간/월간 MVP 계산 공통 헬퍼 ──────────────────
// board2-briefing-data.js / board2-briefing.js / board2-core.js 에 이미 있는
// 집계 로직(_b2WeeklyGetDefaultRange, _b2WeeklyUnivStats, _b2WeeklyMVP 등)을
// 그대로 재사용해, 브리핑 탭에서 보여주는 실제 MVP와 챗봇 답변이 항상 일치하도록 한다.
function _chatbotComputeMvp(isMonthly) {
  if (typeof players === 'undefined' || !Array.isArray(players)) return null;
  if (typeof _b2WeeklyUnivStats !== 'function' || typeof _b2WeeklyMVP !== 'function') return null;
  const range = isMonthly
    ? (typeof _b2MonthlyGetDefaultRange === 'function' ? _b2MonthlyGetDefaultRange(0, false) : null)
    : (typeof _b2WeeklyGetDefaultRange === 'function' ? _b2WeeklyGetDefaultRange(0) : null);
  if (!range) return null;

  const univList = (typeof _b2VisUnivs === 'function' ? _b2VisUnivs() : []).filter(u => u.name && u.name !== '무소속');
  const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard);
  const stats = _b2WeeklyUnivStats(vis, range.from, range.to, univList);
  const mvp1 = _b2WeeklyMVP(stats);
  const mvp2 = (typeof _b2WeeklyMVP2 === 'function') ? _b2WeeklyMVP2(stats, mvp1) : null;
  const worst = (typeof _b2WeeklyWorst === 'function') ? _b2WeeklyWorst(stats) : null;
  return { range, mvp1, mvp2, worst };
}

function _mvpRowHtml(rankEmoji, label, s, accentColor) {
  if (!s || !s.p) return '';
  const total = s.wins + s.losses;
  const rate = total ? Math.round(s.wins / total * 100) : 0;
  return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--border);margin-bottom:6px" data-chatbot-quick="${escapeAttr(s.p.name)}">
    <span style="font-size:22px">${rankEmoji}</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:var(--fs-base);font-weight:900;color:var(--text)">${escapeHtml(s.p.name)} <span style="font-weight:600;color:var(--text3);font-size:var(--fs-caption)">${escapeHtml(s.p.univ || '무소속')}</span></div>
      <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:700;margin-top:2px">${label}</div>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div style="font-size:var(--fs-base);font-weight:900;color:${accentColor}">${s.wins}승 ${s.losses}패</div>
      <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:700">승률 ${rate}%</div>
    </div>
  </div>`;
}

function formatWeeklyMvp() {
  const data = _chatbotComputeMvp(false);
  if (!data) return '❌ MVP 정보를 불러올 수 없습니다.';
  const { range, mvp1, mvp2, worst } = data;
  const header = _matchCardHeader('🏆', '이번주 MVP', `${escapeHtml(range.from)} ~ ${escapeHtml(range.to)}`, 'linear-gradient(135deg,#b45309,#f59e0b)');
  if (!mvp1) {
    return _noRecordCard('🏆', '이번주 MVP');
  }
  let body = _mvpRowHtml('🥇', '이번주 MVP', mvp1, '#dc2626');
  if (mvp2) body += _mvpRowHtml('🥈', '이번주 2위', mvp2, '#2563eb');
  if (worst) body += _mvpRowHtml('😭', '이번주 최다패', worst, '#64748b');
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white);padding:8px 8px 4px">${body}</div></div>`;
}

function formatMonthlyMvp() {
  const data = _chatbotComputeMvp(true);
  if (!data) return '❌ MVP 정보를 불러올 수 없습니다.';
  const { range, mvp1, mvp2, worst } = data;
  const header = _matchCardHeader('🏆', '이달의 MVP', `${escapeHtml(range.from)} ~ ${escapeHtml(range.to)}`, 'linear-gradient(135deg,#6d28d9,#a855f7)');
  if (!mvp1) {
    return _noRecordCard('🏆', '이달의 MVP');
  }
  let body = _mvpRowHtml('🥇', '이달의 MVP', mvp1, '#dc2626');
  if (mvp2) body += _mvpRowHtml('🥈', '이달의 2위', mvp2, '#2563eb');
  if (worst) body += _mvpRowHtml('😭', '이달의 최다패', worst, '#64748b');
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white);padding:8px 8px 4px">${body}</div></div>`;
}

// ─── 대학 순위 ──────────────────────────────────────
// period: null(전체 누적) | 'week'(이번주) | 'month'(이번달)
function formatUniversityRanking(period) {
  if (typeof players === 'undefined' || !Array.isArray(players)) return '❌ 선수 데이터를 불러올 수 없습니다.';

  if (period === 'week' || period === 'month') {
    if (typeof _b2WeeklyUnivStats !== 'function') return '❌ 대학 순위 계산 모듈을 불러올 수 없습니다.';
    const range = period === 'week'
      ? (typeof _b2WeeklyGetDefaultRange === 'function' ? _b2WeeklyGetDefaultRange(0) : null)
      : (typeof _b2MonthlyGetDefaultRange === 'function' ? _b2MonthlyGetDefaultRange(0, false) : null);
    if (!range) return '❌ 대학 순위 계산 모듈을 불러올 수 없습니다.';
    const univList = (typeof _b2VisUnivs === 'function' ? _b2VisUnivs() : []).filter(u => u.name && u.name !== '무소속');
    const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard);
    const stats = _b2WeeklyUnivStats(vis, range.from, range.to, univList).filter(s => s.tg > 0);
    if (stats.length === 0) return _noRecordCard('🏫', `대학 순위(${range.from}~${range.to})`);
    const sorted = [...stats].sort((a, b) => b.tw - a.tw || ((b.wr ?? -1) - (a.wr ?? -1)) || b.tg - a.tg);
    const title = period === 'week' ? '이번주 대학 순위' : '이번달 대학 순위';
    const header = _matchCardHeader('🏫', title, `${range.from} ~ ${range.to}`, 'linear-gradient(135deg,#1e3a8a,#2563eb)');
    const medal = ['🥇', '🥈', '🥉'];
    const rows = sorted.map((s, i) => `<div data-chatbot-quick="${escapeAttr(s.u.name)}" style="display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:9px;cursor:pointer;background:var(--surface);margin-bottom:4px;border:1px solid var(--border)">
      <span style="font-size:var(--fs-base);font-weight:900;color:var(--text3);min-width:26px">${medal[i] || (i + 1)}</span>
      <span style="font-size:var(--fs-base);font-weight:700;color:var(--text);flex:1;min-width:0">${escapeHtml(s.u.name)}</span>
      <span style="font-size:var(--fs-sm);color:var(--text);font-weight:800;white-space:nowrap">${s.tw}승 ${s.tl}패 (${s.wr ?? 0}%)</span>
    </div>`).join('');
    return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white);padding:8px 8px 4px">${rows}</div></div>`;
  }

  // 전체 누적 순위: 선수별 win/loss 총합을 대학 단위로 집계
  const universities = (typeof window !== 'undefined' && typeof window._chatbotGetUniversities === 'function')
    ? window._chatbotGetUniversities()
    : [...new Set(players.map(p => p.univ).filter(Boolean))];
  const agg = {};
  players.forEach(p => {
    const u = String(p.univ || '').trim();
    if (!u || u === '무소속' || u === 'YB') return;
    if (!agg[u]) agg[u] = { name: u, w: 0, l: 0, members: 0 };
    agg[u].w += (p.win || 0);
    agg[u].l += (p.loss || 0);
    agg[u].members++;
  });
  const rows = Object.values(agg).filter(u => u.w + u.l > 0);
  if (rows.length === 0) return _noRecordCard('🏫', '대학 순위');
  rows.forEach(u => { u.total = u.w + u.l; u.rate = u.total ? Math.round(u.w / u.total * 100) : 0; });
  rows.sort((a, b) => b.w - a.w || b.rate - a.rate || b.total - a.total);

  const header = _matchCardHeader('🏫', '대학 순위 (전체 누적)', `${rows.length}개 대학`, 'linear-gradient(135deg,#1e3a8a,#2563eb)');
  const medal = ['🥇', '🥈', '🥉'];
  const body = rows.map((u, i) => `<div data-chatbot-quick="${escapeAttr(u.name)}" style="display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:9px;cursor:pointer;background:var(--surface);margin-bottom:4px;border:1px solid var(--border)">
    <span style="font-size:var(--fs-base);font-weight:900;color:var(--text3);min-width:26px">${medal[i] || (i + 1)}</span>
    <span style="font-size:var(--fs-base);font-weight:700;color:var(--text);flex:1;min-width:0">${escapeHtml(u.name)} <span style="font-weight:600;color:var(--text3);font-size:var(--fs-caption)">${u.members}명</span></span>
    <span style="font-size:var(--fs-sm);color:var(--text);font-weight:800;white-space:nowrap">${u.w}승 ${u.l}패 (${u.rate}%)</span>
  </div>`).join('');
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white);padding:8px 8px 4px">${body}</div></div>`;
}

// ─── 대학 승패 기록(특정 대학 상세) ────────────────
function formatUniversityRecord(univName) {
  if (typeof players === 'undefined' || !Array.isArray(players)) return '❌ 선수 데이터를 불러올 수 없습니다.';
  if (univName === 'YB') return `❌ 'YB'는 대학이 아니라 미소속 선수 표기입니다.`;

  const univPlayers = players.filter(p => p.univ === univName);
  if (univPlayers.length === 0) return `❌ '${univName}' 대학을 찾을 수 없습니다.`;

  const totalW = univPlayers.reduce((a, p) => a + (p.win || 0), 0);
  const totalL = univPlayers.reduce((a, p) => a + (p.loss || 0), 0);
  const total = totalW + totalL;
  const rate = total ? Math.round(totalW / total * 100) : 0;

  const uCfg = (typeof univCfg !== 'undefined') ? (univCfg.find(x => x.name === univName) || {}) : {};
  const univColor = uCfg.color || '#1e3a8a';

  const header = `<div style="background:${univColor};padding:16px 14px;text-align:center">
    <div style="font-size:18px;font-weight:900;color:#fff">🏫 ${escapeHtml(univName)} 승패 기록</div>
    <div style="font-size:var(--fs-sm);color:rgba(255,255,255,0.85);margin-top:2px">소속 선수 ${univPlayers.length}명</div>
  </div>`;

  const summary = `<div style="background:var(--white);padding:14px;text-align:center;border-bottom:1px solid var(--border)">
    <div style="font-size:28px;font-weight:900;color:var(--text)">${totalW}승 ${totalL}패</div>
    <div style="font-size:var(--fs-sm);color:var(--text3);font-weight:700;margin-top:2px">전체 승률 ${rate}% · 총 ${total}경기</div>
  </div>`;

  const sorted = [...univPlayers].sort((a, b) => (b.win || 0) - (a.win || 0));
  const rows = sorted.map(p => {
    const pt = (p.win || 0) + (p.loss || 0);
    const pr = pt ? Math.round((p.win || 0) / pt * 100) : 0;
    return `<div data-chatbot-quick="${escapeAttr(p.name)}" style="display:flex;align-items:center;gap:8px;padding:7px 11px;border-radius:9px;cursor:pointer;background:var(--surface);margin-bottom:4px;border:1px solid var(--border)">
      <span style="font-size:var(--fs-sm);font-weight:700;color:var(--text);flex:1;min-width:0">${escapeHtml(p.name)}</span>
      <span style="font-size:var(--fs-caption);color:var(--text3);font-weight:700">${p.win || 0}승 ${p.loss || 0}패 (${pt ? pr + '%' : '-'})</span>
    </div>`;
  }).join('');

  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}${summary}<div style="background:var(--white);padding:8px 8px 4px">${rows}</div></div>`;
}

// ─── 스트리머 상대전적 (상대별 승패 전체 요약) ─────
function formatPlayerOpponentRecord(player) {
  if (!player) return '❌ 선수 데이터를 불러올 수 없습니다.';
  if (!player.history || player.history.length === 0) {
    return `📭 ${player.name}의 경기 기록이 없습니다.`;
  }
  const opps = {};
  player.history.forEach(h => {
    const opp = String(h.opp || '').trim();
    if (!opp) return;
    if (!opps[opp]) opps[opp] = { w: 0, l: 0 };
    if (h.result === '승') opps[opp].w++; else opps[opp].l++;
  });
  const rows = Object.entries(opps)
    .map(([opp, s]) => ({ opp, ...s, total: s.w + s.l, rate: (s.w + s.l) ? Math.round(s.w / (s.w + s.l) * 100) : 0 }))
    .sort((a, b) => b.total - a.total || b.rate - a.rate);
  if (rows.length === 0) return `📭 ${player.name}의 상대전적이 없습니다.`;

  const header = _matchCardHeader('⚔️', `${escapeHtml(player.name)} 상대전적`, `${rows.length}명과 대전`, 'linear-gradient(135deg,#1e3a8a,#2563eb)');
  const shown = rows.slice(0, 20);
  const body = shown.map(r => {
    const barColor = r.rate >= 50 ? '#16a34a' : '#dc2626';
    const q = `${player.name} vs ${r.opp}`;
    return `<div data-chatbot-quick="${escapeAttr(q)}" style="display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:9px;cursor:pointer;background:var(--surface);margin-bottom:4px;border:1px solid var(--border)">
      <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(r.opp)}</span>
      <span style="font-size:var(--fs-caption);color:var(--text3);font-weight:700;white-space:nowrap">${r.w}승 ${r.l}패</span>
      <span style="font-size:var(--fs-sm);font-weight:900;color:${barColor};min-width:40px;text-align:right">${r.rate}%</span>
    </div>`;
  }).join('');
  const more = rows.length > shown.length
    ? `<div style="padding:6px 11px;text-align:center;color:var(--text3);font-size:var(--fs-caption)">외 ${rows.length - shown.length}명 더 있음 (특정 상대는 "${escapeHtml(player.name)} vs 상대명"으로 조회)</div>`
    : '';
  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white);padding:8px 8px 4px">${body}${more}</div></div>`;
}

try {
  window.formatPlayerOpponentRecord = window.formatPlayerOpponentRecord || formatPlayerOpponentRecord;
} catch (e) {}

try {
  window.formatPlayerElo = window.formatPlayerElo || formatPlayerElo;
  window.formatPlayerMapWinRates = window.formatPlayerMapWinRates || formatPlayerMapWinRates;
  window.formatPlayerRaceBreakdown = window.formatPlayerRaceBreakdown || formatPlayerRaceBreakdown;
  window.formatWeeklyMvp = window.formatWeeklyMvp || formatWeeklyMvp;
  window.formatMonthlyMvp = window.formatMonthlyMvp || formatMonthlyMvp;
  window.formatUniversityRanking = window.formatUniversityRanking || formatUniversityRanking;
  window.formatUniversityRecord = window.formatUniversityRecord || formatUniversityRecord;
} catch (e) {}
