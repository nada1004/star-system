function _b2WeeklyGetDefaultRange(offsetWeeks) {
  const now = new Date();
  const offset = offsetWeeks || 0;
  const day = now.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon + offset * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = d => d.toISOString().slice(0, 10);
  return { from: fmt(mon), to: fmt(sun) };
}
function _b2MonthlyGetDefaultRange(offsetMonths, fullMonth) {
  const now = new Date();
  const offset = offsetMonths || 0;
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const from = new Date(base.getFullYear(), base.getMonth(), 1);
  const to = fullMonth
    ? new Date(base.getFullYear(), base.getMonth() + 1, 0)
    : (offset === 0 ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : new Date(base.getFullYear(), base.getMonth() + 1, 0));
  const fmt = d => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}
function _b2EnsureStyleTag(id, cssText) {
  try {
    const head = document.head || (document.getElementsByTagName && document.getElementsByTagName('head')[0]);
    if (!head) return;
    const css = String(cssText || '');
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      el.type = 'text/css';
      el.appendChild(document.createTextNode(css));
      head.appendChild(el);
      return;
    }
    if ((el.textContent || '') !== css) el.textContent = css;
  } catch (e) {}
}
function _b2IsValidDateStr(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '').trim());
}
function _b2NormalizeBriefingRange(from, to) {
  const f = String(from || '').trim().slice(0, 10);
  const t = String(to || '').trim().slice(0, 10);
  if (!_b2IsValidDateStr(f) || !_b2IsValidDateStr(t)) return { from: f, to: t, swapped: false };
  const fn = parseInt(f.replace(/-/g, ''), 10) || 0;
  const tn = parseInt(t.replace(/-/g, ''), 10) || 0;
  if (fn && tn && fn > tn) return { from: t, to: f, swapped: true };
  return { from: f, to: t, swapped: false };
}
function _b2BriefingLoadState() {
  try {
    const raw = localStorage.getItem('b2w2_state_v1');
    if (!raw) return null;
    const st = JSON.parse(raw);
    if (!st || typeof st !== 'object') return null;
    const preset = String(st.preset || '').trim();
    const from = String(st.from || '').trim();
    const to = String(st.to || '').trim();
    const univ = String(st.univ || '').trim() || '전체';
    const okPreset = ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'custom'].includes(preset);
    const norm = _b2NormalizeBriefingRange(from, to);
    return {
      preset: okPreset ? preset : null,
      from: _b2IsValidDateStr(norm.from) ? norm.from : null,
      to: _b2IsValidDateStr(norm.to) ? norm.to : null,
      univ
    };
  } catch (e) {
    return null;
  }
}
function _b2BriefingSaveState() {
  try {
    const preset = String(window._b2WeeklyPreset || '').trim();
    const from = String(window._b2WeeklyDateFrom || '').trim();
    const to = String(window._b2WeeklyDateTo || '').trim();
    const univ = String(window._b2WeeklyUniv || '전체').trim() || '전체';
    const payload = {
      preset: ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'custom'].includes(preset) ? preset : 'custom',
      from,
      to,
      univ
    };
    localStorage.setItem('b2w2_state_v1', JSON.stringify(payload));
  } catch (e) {}
}
function _b2BriefingPresetRange(preset) {
  const key = String(preset || 'thisWeek');
  if (key === 'lastWeek') return _b2WeeklyGetDefaultRange(-1);
  if (key === 'thisMonth') return _b2MonthlyGetDefaultRange(0, false);
  if (key === 'lastMonth') return _b2MonthlyGetDefaultRange(-1, true);
  return _b2WeeklyGetDefaultRange(0);
}
function _b2SetBriefingPreset(preset) {
  const r = _b2BriefingPresetRange(preset);
  window._b2WeeklyPreset = String(preset || 'thisWeek');
  window._b2WeeklyDateFrom = r.from;
  window._b2WeeklyDateTo = r.to;
  _b2BriefingSaveState();
  if (typeof render === 'function') render();
}
function _b2GetBriefingInputValues() {
  const f = document.getElementById('b2w2-from');
  const t = document.getElementById('b2w2-to');
  const s = document.getElementById('b2w2-univ');
  const fallback = _b2BriefingPresetRange('thisWeek');
  return {
    from: (f && f.value) || window._b2WeeklyDateFrom || fallback.from,
    to: (t && t.value) || window._b2WeeklyDateTo || fallback.to,
    univ: (s && s.value) || window._b2WeeklyUniv || '전체'
  };
}
function _b2SyncBriefingCustomInputs(applyNow) {
  const v = _b2GetBriefingInputValues();
  const norm = _b2NormalizeBriefingRange(v.from, v.to);
  window._b2WeeklyDateFrom = norm.from;
  window._b2WeeklyDateTo = norm.to;
  window._b2WeeklyUniv = v.univ;
  window._b2WeeklyPreset = 'custom';
  if (norm.swapped) {
    const f = document.getElementById('b2w2-from');
    const t = document.getElementById('b2w2-to');
    if (f) f.value = norm.from;
    if (t) t.value = norm.to;
  }
  _b2BriefingSaveState();
  if (applyNow && typeof render === 'function') render();
}
function _b2ApplyBriefingCustomFromInputs() {
  _b2SyncBriefingCustomInputs(true);
}
function _b2ActivateBriefingCustom(focusInput) {
  _b2SyncBriefingCustomInputs(true);
  if (focusInput) {
    setTimeout(() => {
      const el = document.getElementById('b2w2-from');
      if (el && typeof el.focus === 'function') el.focus();
      try{ if (el && typeof el.showPicker === 'function') el.showPicker(); }catch(e){}
    }, 30);
  }
}
function _b2SetBriefingRecentDays(days) {
  const n = Math.max(1, Number(days) || 7);
  const to = new Date();
  to.setHours(0,0,0,0);
  const from = new Date(to);
  from.setDate(to.getDate() - (n - 1));
  const fmt = d => d.toISOString().slice(0, 10);
  window._b2WeeklyPreset = 'custom';
  window._b2WeeklyDateFrom = fmt(from);
  window._b2WeeklyDateTo = fmt(to);
  _b2BriefingSaveState();
  if (typeof render === 'function') render();
}
function _b2OpenBriefingDateInput(which) {
  const id = which === 'to' ? 'b2w2-to' : 'b2w2-from';
  const el = document.getElementById(id);
  if (!el) return;
  try { if (typeof el.focus === 'function') el.focus(); } catch(e){}
  try {
    if (typeof el.showPicker === 'function') {
      el.showPicker();
      return;
    }
  } catch(e){}
  const current = String(el.value || (which === 'to' ? window._b2WeeklyDateTo : window._b2WeeklyDateFrom) || '').trim();
  const input = window.prompt('날짜를 YYYY-MM-DD 형식으로 입력하세요.', current);
  if (input == null) return;
  const raw = String(input).trim().replace(/\./g,'-').replace(/\//g,'-');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    alert('날짜 형식은 YYYY-MM-DD 로 입력해주세요.');
    return;
  }
  el.value = raw;
  _b2SyncBriefingCustomInputs(true);
}


// 데이터 집계 헬퍼(_b2WeeklyAggregate 등)는 board2-briefing-data.js 로 분리됨

function _b2WeeklyBriefingView() {
  try {
    if (
      typeof window._b2WeeklyPreset === 'undefined' ||
      !window._b2WeeklyDateFrom ||
      !window._b2WeeklyDateTo ||
      typeof window._b2WeeklyUniv === 'undefined'
    ) {
      const st = _b2BriefingLoadState();
      if (st) {
        if (typeof window._b2WeeklyPreset === 'undefined' && st.preset) window._b2WeeklyPreset = st.preset;
        if (!window._b2WeeklyDateFrom && st.from) window._b2WeeklyDateFrom = st.from;
        if (!window._b2WeeklyDateTo && st.to) window._b2WeeklyDateTo = st.to;
        if (typeof window._b2WeeklyUniv === 'undefined' && st.univ) window._b2WeeklyUniv = st.univ;
      }
    }
    if (typeof window._b2WeeklyPreset === 'undefined') window._b2WeeklyPreset = 'thisWeek';
    if (!window._b2WeeklyDateFrom || !window._b2WeeklyDateTo) {
      const def = _b2BriefingPresetRange(window._b2WeeklyPreset);
      window._b2WeeklyDateFrom = def.from;
      window._b2WeeklyDateTo = def.to;
    }
    if (typeof window._b2WeeklyUniv === 'undefined') window._b2WeeklyUniv = '전체';
    const _normInit = _b2NormalizeBriefingRange(window._b2WeeklyDateFrom, window._b2WeeklyDateTo);
    window._b2WeeklyDateFrom = _normInit.from;
    window._b2WeeklyDateTo = _normInit.to;
    const preset = String(window._b2WeeklyPreset || 'thisWeek');
    const dateFrom = window._b2WeeklyDateFrom;
    const dateTo   = window._b2WeeklyDateTo;

    // 이전주 범위 계산
    const fmtN = s => parseInt(String(s||'').replace(/[-\.\/]/g,''))||0;
    const diffDays = Math.round((new Date(dateTo) - new Date(dateFrom)) / 86400000) + 1;
    const prevTo   = new Date(dateFrom); prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);   prevFrom.setDate(prevFrom.getDate() - (diffDays - 1));
    const fmt = d => d.toISOString().slice(0, 10);
    const prevDateFrom = fmt(prevFrom), prevDateTo = fmt(prevTo);

    const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : [])
      .filter(u => u.dissolved || u.hidden).map(u => String(u.name||'').trim()));
    const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet.has(String(p?.univ||'').trim()));
    const univList = (_b2VisUnivs ? _b2VisUnivs() : []).filter(u => u.name && u.name !== '무소속');

    const selUniv  = window._b2WeeklyUniv || '전체';
    const fmtDate  = s => String(s||'').slice(0,10).replace(/-/g,'.');
    const _briefingMeta = {
      thisWeek:  { kicker:'Weekly Briefing', title:'브리핑', short:'이번주', prevLabel:'지난주', desc:'이번 주 활동과 흐름을 카드 위주로 빠르게 훑어볼 수 있도록 정리한 화면입니다.' },
      lastWeek:  { kicker:'Weekly Briefing', title:'브리핑', short:'지난주', prevLabel:'그 전 주', desc:'지난주 활동 흐름과 주요 변화를 되짚어보기 좋게 정리한 화면입니다.' },
      thisMonth: { kicker:'Monthly Briefing', title:'월간 브리핑', short:'이번달', prevLabel:'지난달', desc:'이번 달 활동 흐름과 월간 변화 포인트를 한 화면에서 보기 좋게 정리한 화면입니다.' },
      lastMonth: { kicker:'Monthly Briefing', title:'월간 브리핑', short:'지난달', prevLabel:'그 전 달', desc:'지난달 활동 흐름과 월간 요약을 되돌아보기 좋게 정리한 화면입니다.' },
      custom:    { kicker:'Period Briefing', title:'기간 브리핑', short:'사용자 기간', prevLabel:'이전 기간', desc:'직접 지정한 기간의 활동 흐름과 핵심 변화를 비교해서 보는 화면입니다.' }
    };
    const _briefingInfo = _briefingMeta[preset] || _briefingMeta.custom;
    const _isMonthly = preset === 'thisMonth' || preset === 'lastMonth';
    const _isCustom = preset === 'custom';
    const _mvpLabel = preset === 'thisMonth' ? '이달 MVP' : preset === 'lastMonth' ? '지난달 MVP' : '이번 주 MVP';
    const _topLabel = _isMonthly ? '활동 많은 대학 TOP 5' : '활동 많은 대학 TOP 3';
    const _topLimit = _isMonthly ? 5 : 3;

    // 이번주 & 이전주 집계
    const curStats  = _b2WeeklyUnivStats(vis, dateFrom, dateTo, univList);
    const prevStats = _b2WeeklyUnivStats(vis, prevDateFrom, prevDateTo, univList);
    const prevMap   = {};
    prevStats.forEach(ud => { prevMap[ud.u.name] = ud; });

    // 필터
    const targetStats = selUniv === '전체' ? curStats : curStats.filter(ud => ud.u.name === selUniv);

    // 전체 MVP
    const mvp = _b2WeeklyMVP(curStats);
    const mvp2 = _b2WeeklyMVP2(curStats, mvp);
    const worstPlayer = _b2WeeklyWorst(curStats);
    // ── 풀배경 사진형 MVP 카드 빌더 (하이라이트 카드 + MVP 트리플 배너 공용) ──
    const _mkMvpCard = (s, rank, isWorst, extraClass) => {
      if (!s) return '';
      const mp = s.p;
      const univCol = gc ? gc(String(mp?.univ||'')) : (isWorst ? '#ef4444' : (rank===1?'#f59e0b':'#94a3b8'));
      const tc  = typeof getTierBtnColor==='function'&&mp.tier?getTierBtnColor(mp.tier):'#475569';
      const tt  = typeof getTierBtnTextColor==='function'&&mp.tier?(getTierBtnTextColor(mp.tier)||'#fff'):'#fff';
      const rIco = mp.race==='P'?'🔮':mp.race==='T'?'⚔️':mp.race==='Z'?'🦎':'';
      const photo = mp.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(mp.photo):mp.photo) : '';
      const initial = String(mp.name||'-').trim().slice(0,1);
      const nameEsc = String(mp.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");

      const cardClass = isWorst ? 'b2w2-mvp-worst' : (rank===1 ? 'b2w2-mvp-first' : 'b2w2-mvp-second');
      const _isMini = extraClass === 'b2w2-mvp-card-mini';
      const badgeText = _isMini
        ? (isWorst ? '3등' : (rank===1 ? '1등' : '2등'))
        : (isWorst ? (_isMonthly?'이달의 최악':'이번주 최악') : (rank===1 ? _mvpLabel : (_isMonthly?'이달의 2위':'이번주 2위')));
      const badgeEmoji = isWorst ? '💀' : (rank===1 ? '🏆' : '🥈');

      const winColor   = 'b2w2-mvp-sv-win';
      const lossColor  = 'b2w2-mvp-sv-loss';
      const rateColor  = 'b2w2-mvp-sv-rate';

      const _statItem = (val, label, colorClass) =>
        `<span class="b2w2-mvp-stat"><b class="b2w2-mvp-sv ${colorClass}">${val}</b><i class="b2w2-mvp-sl">${label}</i></span>`;
      const _sep = `<span class="b2w2-mvp-statline-sep"></span>`;

      const statsHtml = isWorst
        ? `${_statItem(s.losses,'패',lossColor)}${_sep}${_statItem(s.wins,'승',winColor)}${_sep}${_statItem((s.winRate??0)+'%','승률',rateColor)}`
        : `${_statItem(s.wins,'승',winColor)}${_sep}${_statItem(s.losses,'패',lossColor)}${_sep}${_statItem((s.winRate??0)+'%','승률',rateColor)}`;

      return `<div class="b2w2-mvp-card ${cardClass}${extraClass ? ' '+extraClass : ''}" onclick="openPlayerModal('${nameEsc}')">
        ${photo
          ? `<img class="b2w2-mvp-bg" src="${photo}" alt="${mp.name||''}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <div class="b2w2-mvp-bg-fallback" style="${photo?'display:none':''}">${initial}</div>
        <div class="b2w2-mvp-overlay"></div>
        <div class="b2w2-mvp-top-badge">${badgeEmoji} ${badgeText}</div>
        <div class="b2w2-mvp-bottom">
          <div class="b2w2-mvp-id">
            <div class="b2w2-mvp-name">${mp.name||'-'}</div>
            <div class="b2w2-mvp-meta">
              <span class="b2w2-mvp-univ">${String(mp.univ||'무소속')}</span>
              ${mp.tier?`<span class="b2w2-mvp-tier" style="background:${tc};color:${tt}">${mp.tier}</span>`:''}
            </div>
          </div>
          <div class="b2w2-mvp-statline">
            ${statsHtml}
            <div class="b2w2-mvp-statline-form">${_b2WeeklyForm(s.hist)}</div>
          </div>
        </div>
      </div>`;
    };
    const curPlayerStats = _b2WeeklyAggregate(vis, dateFrom, dateTo);
    const prevPlayerStats = _b2WeeklyAggregate(vis, prevDateFrom, prevDateTo);
    const prevPlayerMap = {};
    prevPlayerStats.forEach(s => { prevPlayerMap[s.p?.name || ''] = s; });
    const activePlayers = curPlayerStats.filter(s => s.total > 0);
    const topUnivs = [...curStats]
      .filter(ud => ud.tg > 0)
      .sort((a, b) => (b.tg - a.tg) || (b.active.length - a.active.length) || ((b.wr ?? -1) - (a.wr ?? -1)))
      .slice(0, _topLimit);
    const silentUnivs = curStats.filter(ud => ud.tg === 0).map(ud => ud.u.name);
    const risingPlayers = activePlayers
      .map(s => {
        const prev = prevPlayerMap[s.p?.name || ''] || null;
        const prevWr = prev && prev.total > 0 ? (prev.winRate ?? 0) : 0;
        const prevTotal = prev ? (prev.total || 0) : 0;
        return {
          ...s,
          wrDelta: (s.winRate ?? 0) - prevWr,
          totalDelta: s.total - prevTotal,
          prevTotal
        };
      })
      .filter(s => s.total >= 2)
      .sort((a, b) => (b.wrDelta - a.wrDelta) || (b.totalDelta - a.totalDelta) || (b.wins - a.wins));
    const hotPlayer = risingPlayers[0] || null;
    // 하락세 — 승률이 떨어졌고 표본이 있는 선수만 (전주 활동이 있었던 경우)
    const decliningPlayers = risingPlayers
      .filter(s => s.prevTotal >= 2 && s.wrDelta < 0)
      .slice()
      .sort((a, b) => (a.wrDelta - b.wrDelta) || (a.totalDelta - b.totalDelta));
    const coldPlayer = decliningPlayers[0] || null;
    // 연승/연패 스트릭 — 기간 내 최근 경기부터 거슬러 올라가며 연속 결과 카운트
    const _calcStreak = (hist, want) => {
      const sorted = [...hist].sort((a,b)=>{
        const da=parseInt(String(a.date||'').replace(/[-\.\/]/g,''))||0;
        const db=parseInt(String(b.date||'').replace(/[-\.\/]/g,''))||0;
        return db!==da?db-da:(b.time||0)-(a.time||0);
      });
      let streak = 0;
      for (const h of sorted) {
        if (h.result === want) streak++;
        else break;
      }
      return streak;
    };
    const streakPlayers = activePlayers
      .map(s => ({ ...s, streak: _calcStreak(s.hist, '승') }))
      .filter(s => s.streak >= 2)
      .sort((a, b) => b.streak - a.streak);
    const streakPlayer = streakPlayers[0] || null;
    const loseStreakPlayers = activePlayers
      .map(s => ({ ...s, streak: _calcStreak(s.hist, '패') }))
      .filter(s => s.streak >= 2)
      .sort((a, b) => b.streak - a.streak);
    const loseStreakPlayer = loseStreakPlayers[0] || null;
    // 최고 승률 — 최소 3전 이상 표본 보장
    const bestWrPlayers = activePlayers
      .filter(s => s.total >= 3)
      .slice()
      .sort((a, b) => ((b.winRate ?? -1) - (a.winRate ?? -1)) || (b.total - a.total));
    const bestWrPlayer = bestWrPlayers[0] || null;
    const mostActivePlayers = activePlayers
      .filter(s => s.total > 0)
      .slice()
      .sort((a, b) => (b.total - a.total) || ((b.winRate ?? -1) - (a.winRate ?? -1)));
    const mostActivePlayer = mostActivePlayers[0] || null;
    const monthlyTopPlayers = [...activePlayers]
      .sort((a, b) => (b.total - a.total) || (b.wins - a.wins) || ((b.winRate ?? -1) - (a.winRate ?? -1)))
      .slice(0, 5);
    const monthlyMvp = monthlyTopPlayers[0] || null;
    const _rankSort = (a, b) =>
      (b.tw - a.tw) ||
      ((b.wr ?? -1) - (a.wr ?? -1)) ||
      (b.tg - a.tg) ||
      (b.active.length - a.active.length) ||
      String(a.u?.name || '').localeCompare(String(b.u?.name || ''), 'ko', { sensitivity: 'base' });
    const _buildRankedUnivs = (list, prevList) => {
      const prevRankMap = {};
      (prevList || [])
        .filter(ud => ud.tg > 0)
        .slice()
        .sort(_rankSort)
        .forEach((ud, idx) => { prevRankMap[ud.u.name] = idx + 1; });
      return (list || [])
        .filter(ud => ud.tg > 0)
        .slice()
        .sort(_rankSort)
        .map((ud, idx) => {
          const rank = idx + 1;
          const prevRank = prevRankMap[ud.u.name] || null;
          const rankDelta = prevRank ? (prevRank - rank) : null;
          return { ...ud, rank, prevRank, rankDelta };
        });
    };
    const rankedUnivs = _buildRankedUnivs(curStats, prevStats);
    const rankedUnivLeaders = rankedUnivs;
    const monthlyUnivAces = rankedUnivs
      .map(ud => ({ ...ud, ace: _b2WeeklyUnivMVP(ud.active) }));
    const _monthlyPreviewCount = rankedUnivLeaders.length; // 이번달 대학 순위는 전체 노출 (더보기 없이 전부 표시)
    const _monthlyRankMoreId = `b2w2-monthly-ranks-more-${preset}`;
    const _monthlyRankBtnId = `b2w2-monthly-ranks-btn-${preset}`;
    const _monthlyAceMoreId = `b2w2-monthly-aces-more-${preset}`;
    const _monthlyAceBtnId = `b2w2-monthly-aces-btn-${preset}`;
    const monthlyAceSpotlight = monthlyUnivAces.find(item => item.ace) || null;
    const _heroSummary = (() => {
      const parts = [];
      if (_isMonthly && rankedUnivs[0]) {
        parts.push(`${rankedUnivs[0].u.name} ${rankedUnivs[0].tw}승 ${rankedUnivs[0].tl}패 · 승률 ${rankedUnivs[0].wr ?? 0}%로 1위`);
      } else if (topUnivs[0]) {
        parts.push(`${topUnivs[0].u.name} 활동량 1위 · ${topUnivs[0].tg}전 · 활동 ${topUnivs[0].active.length}명`);
      }
      if (hotPlayer && hotPlayer.wrDelta > 0) parts.push(`${hotPlayer.p?.name || '-'} 승률 변동 ${hotPlayer.wrDelta > 0 ? '+' : ''}${hotPlayer.wrDelta}%p`);
      if (_isMonthly && monthlyAceSpotlight) parts.push(`${monthlyAceSpotlight.u.name} 에이스 ${monthlyAceSpotlight.ace.p?.name || '-'}`);
      if (silentUnivs.length) parts.push(`기록 없는 대학 ${silentUnivs.length}곳`);
      return parts.length ? `${parts.join(' · ')}.` : '선택 기간 활동량과 비교 지표를 정리했습니다.';
    })();
    const _heroSpotlight = (() => {
      if (_isMonthly && rankedUnivs[0]) {
        const leader = rankedUnivs[0];
        const rankDeltaTxt = leader.rankDelta === null ? '첫 집계' : (leader.rankDelta > 0 ? `전기 대비 ▲${leader.rankDelta}` : leader.rankDelta < 0 ? `전기 대비 ▼${Math.abs(leader.rankDelta)}` : '전기와 동일');
        return `${leader.u.name} 1위 · ${leader.tw}승 ${leader.tl}패 · 승률 ${leader.wr ?? 0}% · ${rankDeltaTxt}`;
      }
      if (topUnivs[0]) return `${topUnivs[0].u.name} 활동량 1위 · ${topUnivs[0].tg}전 · 활동 ${topUnivs[0].active.length}명`;
      return '선택 기간 핵심 지표를 빠르게 확인할 수 있도록 정리했습니다';
    })();
    const _heroFocusLabel = _isMonthly ? '집계 범위' : (_isCustom ? '사용자 기간' : '주간 범위');
    const _heroFocusValue = _isMonthly
      ? `대학 ${rankedUnivs.length}곳`
      : `활동 ${activePlayers.length}명`;
    const _heroCompareText = `${_briefingInfo.prevLabel} ${fmtDate(prevDateFrom)} ~ ${fmtDate(prevDateTo)}`;

    const css = `
      /* ── 브리핑 래퍼: 신문/매거진 컨셉 유지, 가독성·계층·색상 전면 강화 ── */
      .b2w2-wrap {
        width: min(100%, 1320px);
        max-width: 1320px;
        margin: 0 auto;
        font-family: 'Noto Sans KR', -apple-system, sans-serif;
        /* 토큰 */
        --b2w-accent: var(--blue, #2563eb);
        --b2w-accent-strong: var(--blue-d, #1d4ed8);
        --b2w-accent-soft: var(--blue-l, rgba(37,99,235,.08));
        --b2w-ink: var(--text1, #111827);
        --b2w-ink-mid: var(--text2, #374151);
        --b2w-ink-soft: var(--text3, #6b7280);
        --b2w-rule: var(--border, rgba(17,24,39,.15));
        --b2w-rule-hard: var(--border2, rgba(17,24,39,.55));
        --b2w-rule-soft: var(--border, rgba(17,24,39,.10));
        --b2w-paper: var(--surface, #f8fafc);
        --b2w-paper-alt: var(--white, #fff);
        --b2w-paper-warm: var(--surface, #f8fafc);
        --b2w-shadow: var(--sh2, 0 6px 20px rgba(0,0,0,.06));
        --b2w-shadow-sm: var(--sh, 0 2px 4px rgba(0,0,0,.04));
        --b2w-r: 12px;
        --b2w-r-lg: 18px;
        --b2w-accent-border: rgba(37,99,235,.22);
        --b2w-accent-shadow: rgba(37,99,235,.10);
        --b2w-accent-shadow-strong: rgba(37,99,235,.16);
        --b2w-btn-text: #fff;
        --b2w-tag-bg: var(--surface, #f1f5f9);
        --b2w-tag-border: var(--border, #e2e8f0);
        --b2w-tag-text: var(--text2, #374151);
        --b2w-tag-muted: var(--text3, #6b7280);
        --b2w-tag-accent-bg: var(--blue-l, #eff6ff);
        --b2w-tag-accent-border: rgba(37,99,235,.22);
      }
      body.dark .b2w2-wrap {
        --b2w-accent-border: rgba(96,165,250,.30);
        --b2w-accent-shadow: rgba(96,165,250,.14);
        --b2w-accent-shadow-strong: rgba(96,165,250,.20);
        --b2w-btn-text: #0f172a;
        --b2w-tag-accent-border: rgba(96,165,250,.28);
      }
      .b2w2-wrap *, .b2w2-wrap *::before, .b2w2-wrap *::after { box-sizing: border-box; }
      .b2w2-wrap b, .b2w2-wrap strong { font-weight: 800 }

      /* ── Masthead ── */
      .b2w2-masthead {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0 12px;
        margin-bottom: 6px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .18em;
        text-transform: uppercase;
        color: var(--b2w-ink-soft);
      }
      .b2w2-masthead::after {
        content: '';
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--b2w-accent) 0%, var(--b2w-accent) 38%, var(--b2w-rule-hard) 38%, var(--b2w-rule-hard) 100%);
        opacity: .9;
      }
      .b2w2-masthead-brand {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: var(--b2w-ink);
      }
      .b2w2-masthead-mark {
        width: 16px; height: 16px;
        border-radius: 4px;
        background: linear-gradient(135deg, var(--b2w-accent), var(--b2w-accent-strong));
        box-shadow: 0 2px 6px var(--b2w-accent-shadow-strong, rgba(37,99,235,.2));
        flex-shrink: 0;
      }

      /* ── Hero ── */
      .b2w2-hero {
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        padding: 20px 22px 22px;
        margin-bottom: 20px;
        border-bottom: 3px double var(--b2w-rule-hard);
        background:
          radial-gradient(circle at 6px 6px, var(--b2w-rule-soft) 1px, transparent 1.6px) 0 0/18px 18px,
          linear-gradient(180deg, var(--b2w-accent-soft) 0%, transparent 65%);
        border-radius: var(--b2w-r-lg) var(--b2w-r-lg) 0 0;
      }
      .b2w2-hero-main { display: flex; flex-direction: column; gap: 10px; min-width: 0; flex: 1 }
      .b2w2-hero-title {
        position: relative;
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 36px;
        font-weight: 900;
        letter-spacing: -.02em;
        color: var(--b2w-ink);
        line-height: 1.04;
        background: linear-gradient(180deg, var(--b2w-ink) 55%, var(--b2w-ink-mid) 130%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .b2w2-hero-desc {
        position: relative;
        margin-top: 4px;
        font-size: 13px;
        line-height: 1.75;
        color: var(--b2w-ink-mid);
        max-width: 880px;
        font-family: 'Noto Serif KR', Georgia, serif;
        font-style: italic;
        border-left: 3px solid var(--b2w-accent);
        padding-left: 13px;
        background: var(--b2w-accent-soft);
        padding-top: 6px;
        padding-bottom: 6px;
        border-radius: 0 var(--b2w-r) var(--b2w-r) 0;
      }
      .b2w2-hero-spotlight {
        padding: 14px 0 0;
        border-top: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-hero-spotlight-kicker {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .16em;
        text-transform: uppercase;
        color: var(--b2w-accent);
      }
      .b2w2-hero-spotlight-title {
        margin-top: 5px;
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 19px;
        font-weight: 800;
        letter-spacing: -.01em;
        line-height: 1.3;
        color: var(--b2w-ink);
      }
      .b2w2-hero-spotlight-sub { margin-top: 8px; display: flex; gap: 14px; flex-wrap: wrap }
      .b2w2-hero-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        background: none;
        border: none;
        font-size: 11px;
        font-weight: 700;
        color: var(--b2w-ink-soft);
      }
      .b2w2-hero-pill:not(:last-child) { border-right: 1px solid var(--b2w-rule-soft); padding-right: 14px }
      .b2w2-hero-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px }
      .b2w2-hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border: 1px solid var(--b2w-rule-soft);
        background: var(--b2w-paper-alt);
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        color: var(--b2w-ink-soft);
        letter-spacing: .02em;
      }
      .b2w2-hero-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0,1fr));
        gap: 0;
        min-width: min(100%, 260px);
        border: 1px solid var(--b2w-rule);
        border-radius: var(--b2w-r-lg);
        overflow: hidden;
        background: var(--b2w-paper-alt);
        box-shadow: var(--b2w-shadow-sm);
        flex-shrink: 0;
      }
      .b2w2-hero-stat {
        padding: 14px 16px;
        border-right: 1px solid var(--b2w-rule-soft);
        border-bottom: 1px solid var(--b2w-rule-soft);
        transition: background .14s ease;
      }
      .b2w2-hero-stat:hover { background: var(--b2w-accent-soft) }
      .b2w2-hero-stat:nth-child(2n) { border-right: none }
      .b2w2-hero-stat:nth-last-child(-n+2) { border-bottom: none }
      .b2w2-hero-stat-label { font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); text-transform: uppercase; letter-spacing: .1em }
      .b2w2-hero-stat-value {
        margin-top: 6px;
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -.01em;
        color: var(--b2w-ink);
        line-height: 1.15;
      }
      .b2w2-hero-stat-sub { margin-top: 4px; font-size: 10px; font-weight: 600; color: var(--b2w-ink-soft) }

      /* ── KPI Grid ── */
      .b2w2-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0,1fr));
        gap: 10px;
        margin-bottom: 20px;
      }
      .b2w2-kpi-card {
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid var(--b2w-rule);
        background: linear-gradient(165deg, var(--b2w-paper-alt) 0%, var(--b2w-paper-alt) 70%, color-mix(in srgb, var(--kpi-accent, var(--b2w-accent)) 7%, var(--b2w-paper-alt)) 100%);
        box-shadow: var(--b2w-shadow-sm);
        transition: transform .16s cubic-bezier(.2,.8,.3,1.2), box-shadow .16s ease, border-color .16s ease;
        position: relative;
        overflow: hidden;
      }
      .b2w2-kpi-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--kpi-accent, var(--b2w-accent)), color-mix(in srgb, var(--kpi-accent, var(--b2w-accent)) 40%, transparent));
        border-radius: 14px 14px 0 0;
      }
      .b2w2-kpi-card::after {
        content: '';
        position: absolute;
        top: -20px; right: -20px;
        width: 70px; height: 70px;
        border-radius: 50%;
        background: radial-gradient(circle, color-mix(in srgb, var(--kpi-accent, var(--b2w-accent)) 16%, transparent), transparent 70%);
        pointer-events: none;
      }
      .b2w2-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 26px rgba(0,0,0,.10); border-color: color-mix(in srgb, var(--kpi-accent, var(--b2w-accent)) 35%, var(--b2w-rule)) }
      .b2w2-kpi-label { font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); letter-spacing: .1em; text-transform: uppercase }
      .b2w2-kpi-value {
        margin-top: 6px;
        font-size: 28px;
        font-weight: 900;
        letter-spacing: -.03em;
        color: var(--b2w-ink);
        line-height: 1.1;
      }
      .b2w2-kpi-sub { margin-top: 4px; font-size: 11px; font-weight: 600; color: var(--b2w-ink-soft); line-height: 1.4 }

      /* ── 컨트롤 헤더 ── */
      .b2w2-hdr {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        padding: 10px 14px;
        border: 1px solid var(--b2w-rule);
        border-radius: var(--b2w-r-lg);
        margin-bottom: 16px;
        background: var(--b2w-paper);
        box-shadow: var(--b2w-shadow-sm);
      }
      .b2w2-din {
        padding: 5px 10px;
        border-radius: var(--b2w-r);
        border: 1px solid var(--b2w-rule);
        font-size: 12px;
        background: var(--white);
        color: var(--text2);
        box-shadow: var(--b2w-shadow-sm);
        min-width: 132px;
        cursor: pointer;
        transition: border-color .14s ease;
      }
      .b2w2-din:focus { border-color: var(--b2w-accent); outline: none }
      .b2w2-datebtn {
        padding: 5px 10px;
        border-radius: var(--b2w-r);
        border: 1px solid var(--b2w-rule);
        background: var(--b2w-paper-alt);
        font-size: 12px;
        font-weight: 700;
        color: var(--b2w-ink-mid);
        cursor: pointer;
        box-shadow: var(--b2w-shadow-sm);
        transition: border-color .14s ease, color .14s ease, background .14s ease;
      }
      .b2w2-datebtn:hover { border-color: var(--b2w-accent); color: var(--b2w-accent); background: var(--b2w-accent-soft) }
      .b2w2-din::-webkit-calendar-picker-indicator { cursor: pointer; opacity: .95 }
      .b2w2-sel {
        padding: 5px 10px;
        border-radius: var(--b2w-r);
        border: 1px solid var(--b2w-rule);
        font-size: 12px;
        background: var(--white);
        color: var(--text2);
        max-width: 220px;
        box-shadow: var(--b2w-shadow-sm);
      }
      .b2w2-btn {
        padding: 6px 16px;
        border-radius: var(--b2w-r);
        background: var(--b2w-accent);
        color: var(--b2w-btn-text);
        border: none;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        letter-spacing: .02em;
        box-shadow: var(--b2w-shadow-sm);
        transition: background .14s ease, transform .1s ease;
      }
      .b2w2-btn:hover { background: var(--b2w-accent-strong); transform: translateY(-1px) }
      .b2w2-btn:focus-visible { outline: 2px solid var(--b2w-accent); outline-offset: 2px }

      /* ── 모드 선택 바 ── */
      .b2w2-modebar {
        display: grid;
        grid-template-columns: repeat(3, minmax(0,1fr));
        gap: 10px;
        margin-bottom: 20px;
      }
      .b2w2-modecard {
        padding: 16px 18px;
        border-radius: var(--b2w-r-lg);
        border: 1.5px solid var(--b2w-rule);
        background: var(--b2w-paper);
        box-shadow: var(--b2w-shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: border-color .16s ease, box-shadow .16s ease, background .16s ease, transform .16s ease;
        cursor: pointer;
      }
      .b2w2-modecard:hover {
        border-color: var(--b2w-accent-border);
        background: var(--b2w-paper-warm);
        box-shadow: 0 4px 14px var(--b2w-accent-shadow);
        transform: translateY(-1px);
      }
      .b2w2-modecard.is-active {
        background: var(--b2w-paper-alt);
        border-color: var(--b2w-accent);
        box-shadow: 0 0 0 3px var(--b2w-accent-soft), 0 4px 14px var(--b2w-accent-shadow-strong);
      }
      .b2w2-modecard.is-active .b2w2-modekicker { color: var(--b2w-accent) }
      .b2w2-modecard.is-active .b2w2-modetitle { color: var(--b2w-ink) }
      .b2w2-modecard.is-active .b2w2-modebadge {
        border-color: var(--b2w-accent);
        color: var(--b2w-accent);
        background: var(--b2w-accent-soft);
      }
      .b2w2-modehead { display: flex; align-items: center; justify-content: space-between; gap: 8px }
      .b2w2-modekicker { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--b2w-ink-soft) }
      .b2w2-modetitle {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 17px;
        font-weight: 800;
        color: var(--b2w-ink-mid);
        letter-spacing: -.01em;
      }
      .b2w2-modedesc { font-size: 11px; line-height: 1.65; color: var(--b2w-ink-soft) }
      .b2w2-presetrow { display: flex; gap: 6px; flex-wrap: wrap }
      .b2w2-preset {
        padding: 4px 11px;
        border-radius: 999px;
        border: 1px solid var(--b2w-rule);
        background: var(--white);
        font-size: 11px;
        font-weight: 700;
        color: var(--b2w-ink-mid);
        cursor: pointer;
        transition: border-color .12s ease, background .12s ease, color .12s ease;
      }
      .b2w2-preset:hover { border-color: var(--b2w-accent); color: var(--b2w-accent); background: var(--b2w-accent-soft) }
      .b2w2-preset.on { background: var(--b2w-accent); color: var(--b2w-btn-text); border-color: var(--b2w-accent) }
      .b2w2-preset:focus-visible { outline: 2px solid var(--b2w-accent); outline-offset: 2px }
      .b2w2-modebadge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 999px;
        border: 1px solid var(--b2w-rule);
        background: var(--white);
        font-size: 10px;
        font-weight: 800;
        color: var(--b2w-ink-soft);
        letter-spacing: .03em;
        white-space: nowrap;
      }

      /* ── MVP 트리플 배너 ── */
      .b2w2-mvp-triple {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      /* ── 전체 이미지형 MVP 카드 ── */
      .b2w2-mvp-card {
        border-radius: 16px;
        border: none;
        position: relative;
        overflow: hidden;
        aspect-ratio: 4/3;
        min-height: 150px;
        cursor: pointer;
        transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease;
        isolation: isolate;
      }
      .b2w2-mvp-card:hover { transform: translateY(-4px) scale(1.012); box-shadow: 0 20px 48px rgba(0,0,0,.22) }

      /* 배경 이미지 레이어 */
      .b2w2-mvp-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        transition: transform .3s ease;
        z-index: 0;
      }
      .b2w2-mvp-card:hover .b2w2-mvp-bg { transform: scale(1.04) }

      /* 이미지 없을 때 폴백 배경 */
      .b2w2-mvp-bg-fallback {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 72px;
        font-weight: 900;
        z-index: 0;
        letter-spacing: -.04em;
      }

      /* 요청에 따라 프로필 이미지 위 그라디언트 효과 제거 — 원본 그대로 노출 */
      .b2w2-mvp-overlay {
        display: none;
      }

      /* 배경 이미지 없을 때 색상 */
      .b2w2-mvp-first .b2w2-mvp-bg-fallback  { background: linear-gradient(160deg,#fef3c7,#f59e0b); color: #92400e }
      .b2w2-mvp-second .b2w2-mvp-bg-fallback { background: linear-gradient(160deg,#e2e8f0,#94a3b8); color: #334155 }
      .b2w2-mvp-worst .b2w2-mvp-bg-fallback  { background: linear-gradient(160deg,#fee2e2,#ef4444); color: #7f1d1d }

      /* 상단 뱃지 */
      .b2w2-mvp-top-badge {
        position: absolute;
        top: 9px;
        left: 9px;
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .05em;
        text-transform: uppercase;
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        white-space: nowrap;
      }
      .b2w2-mvp-first .b2w2-mvp-top-badge  { background: rgba(251,191,36,.85); color: #78350f; border: 1px solid rgba(245,158,11,.5) }
      .b2w2-mvp-second .b2w2-mvp-top-badge { background: rgba(255,255,255,.75); color: #334155; border: 1px solid rgba(148,163,184,.4) }
      .b2w2-mvp-worst .b2w2-mvp-top-badge  { background: rgba(239,68,68,.82); color: #fff; border: 1px solid rgba(239,68,68,.6) }

      /* 우측 상단 종족 아이콘 */
      .b2w2-mvp-race-badge {
        position: absolute;
        top: 9px;
        right: 9px;
        z-index: 3;
        font-size: 15px;
        filter: drop-shadow(0 1px 4px rgba(0,0,0,.5));
      }

      /* 하단 콘텐츠 — 이미지 위 효과 없음, 텍스트 자체 그림자로만 가독성 확보 */
      .b2w2-mvp-bottom {
        position: absolute;
        bottom: 0;
        left: 0; right: 0;
        z-index: 2;
        padding: 10px 10px 9px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .b2w2-mvp-name {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 15px;
        font-weight: 900;
        color: #fff;
        letter-spacing: -.02em;
        line-height: 1.15;
        text-shadow: 0 1px 8px rgba(0,0,0,.6);
        cursor: pointer;
        transition: opacity .12s;
      }
      .b2w2-mvp-name:hover { opacity: .88 }

      .b2w2-mvp-id { display: flex; flex-direction: column; gap: 3px; }

      .b2w2-mvp-meta {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .b2w2-mvp-univ {
        font-size: 10px;
        font-weight: 700;
        color: rgba(255,255,255,.78);
        letter-spacing: .01em;
        text-shadow: 0 1px 4px rgba(0,0,0,.5);
      }

      /* 스탯 + 최근 폼 통합 라인 — 글라스 배경 */
      .b2w2-mvp-statline {
        display: flex;
        align-items: center;
        gap: 7px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.16);
        backdrop-filter: blur(14px) saturate(160%);
        -webkit-backdrop-filter: blur(14px) saturate(160%);
        background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.04));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 6px 16px rgba(0,0,0,.18);
        padding: 6px 10px;
      }
      .b2w2-mvp-stat {
        display: flex;
        align-items: baseline;
        gap: 3px;
        flex-shrink: 0;
      }
      .b2w2-mvp-statline-sep {
        width: 1px;
        height: 10px;
        background: rgba(255,255,255,.22);
        flex-shrink: 0;
      }
      .b2w2-mvp-sv {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: -.02em;
        line-height: 1;
        color: #fff;
      }
      .b2w2-mvp-sl {
        font-size: 8px;
        font-style: normal;
        font-weight: 800;
        color: rgba(255,255,255,.62);
        letter-spacing: .02em;
      }
      .b2w2-mvp-first .b2w2-mvp-sv-win   { color: #4ade80 }
      .b2w2-mvp-first .b2w2-mvp-sv-loss  { color: #f87171 }
      .b2w2-mvp-first .b2w2-mvp-sv-rate  { color: #fbbf24 }
      .b2w2-mvp-second .b2w2-mvp-sv-win  { color: #6ee7b7 }
      .b2w2-mvp-second .b2w2-mvp-sv-loss { color: #fca5a5 }
      .b2w2-mvp-second .b2w2-mvp-sv-rate { color: #e2e8f0 }
      .b2w2-mvp-worst .b2w2-mvp-sv-win   { color: #86efac }
      .b2w2-mvp-worst .b2w2-mvp-sv-loss  { color: #ff6b6b }
      .b2w2-mvp-worst .b2w2-mvp-sv-rate  { color: #fca5a5 }

      /* 최근 폼 dots — statline 우측 정렬 */
      .b2w2-mvp-statline-form {
        display: flex;
        align-items: center;
        gap: 3px;
        margin-left: auto;
        flex-shrink: 0;
        padding-left: 7px;
        border-left: 1px solid rgba(255,255,255,.16);
      }

      /* 티어 뱃지 */
      .b2w2-mvp-tier {
        display: inline-flex;
        align-items: center;
        padding: 1px 7px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .02em;
      }

      /* ── 하이라이트 그리드용 단일 MVP 카드 (더 길게) ── */
      .b2w2-mvp-card.b2w2-mvp-card-lead {
        aspect-ratio: 3/4;
        min-height: 280px;
      }

      /* ── MVP 트리플 배너용 미니 카드 (약 1/3 크기, 세로형) ── */
      .b2w2-mvp-card.b2w2-mvp-card-mini {
        aspect-ratio: 3/4;
        min-height: 170px;
        width: 160px;
        flex: 0 0 160px;
      }
      .b2w2-mvp-card-mini .b2w2-mvp-top-badge {
        top: 6px; left: 6px; gap: 3px;
        padding: 2px 6px;
        font-size: 7px;
      }
      .b2w2-mvp-card-mini .b2w2-mvp-race-badge {
        top: 6px; right: 6px;
        font-size: 11px;
      }
      .b2w2-mvp-card-mini .b2w2-mvp-bottom {
        padding: 7px 7px 7px;
        gap: 4px;
      }
      .b2w2-mvp-card-mini .b2w2-mvp-name { font-size: 12px; }
      .b2w2-mvp-card-mini .b2w2-mvp-univ { font-size: 8.5px; }
      .b2w2-mvp-card-mini .b2w2-mvp-tier { font-size: 7px; padding: 1px 5px; }
      .b2w2-mvp-card-mini .b2w2-mvp-statline { border-radius: 999px; padding: 4px 7px; gap: 5px; }
      .b2w2-mvp-card-mini .b2w2-mvp-sv { font-size: 10px; }
      .b2w2-mvp-card-mini .b2w2-mvp-sl { font-size: 6px; }
      .b2w2-mvp-card-mini .b2w2-mvp-statline-form { gap: 2px; padding-left: 5px; }
      .b2w2-mvp-card-mini .b2w2-mvp-statline-form span {
        width: 11px !important;
        height: 11px !important;
        font-size: 6px !important;
      }
      @media (max-width: 640px) {
        .b2w2-mvp-triple { flex-direction: column; align-items: center }
        .b2w2-mvp-card { aspect-ratio: 4/3; min-height: 130px }
        .b2w2-mvp-card.b2w2-mvp-card-mini { aspect-ratio: 3/4; min-height: 170px; width: 200px; flex: 0 0 auto }
      }
      @media (min-width: 641px) and (max-width: 900px) {
        .b2w2-mvp-card { min-height: 140px }
      }

      /* ── 차트 박스 ── */
      .b2w2-chart-box {
        background: var(--b2w-paper);
        border: 1px solid var(--b2w-rule);
        border-radius: var(--b2w-r-lg);
        padding: 18px 20px;
        margin-bottom: 20px;
        box-shadow: var(--b2w-shadow-sm);
      }
      .b2w2-chart-title {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 14px;
        font-weight: 800;
        color: var(--b2w-ink);
        margin-bottom: 14px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--b2w-rule-soft);
      }

      /* ── 하이라이트 그리드 (상단 요약 카드들) ── */
      .b2w2-highlight-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
        gap: 12px;
        margin-bottom: 22px;
      }
      .b2w2-lead-card { background: var(--b2w-paper-alt) }
      .b2w2-lead-card .b2w2-highlight-title { font-size: 21px }
      .b2w2-lead-card .b2w2-highlight-desc { font-size: 13px; line-height: 1.75 }
      .b2w2-highlight-card {
        padding: 16px 18px;
        border-radius: 10px;
        border: 1px solid var(--b2w-rule);
        background: var(--b2w-paper);
        box-shadow: var(--b2w-shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;
        overflow: hidden;
        transition: box-shadow .18s ease, transform .18s ease, border-color .18s ease;
      }
      .b2w2-highlight-card::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, var(--hc-top, var(--b2w-rule-soft)), color-mix(in srgb, var(--hc-top, var(--b2w-rule-soft)) 30%, transparent));
        border-radius: 10px 10px 0 0;
      }
      .b2w2-highlight-card::before {
        content: '';
        position: absolute;
        top: -30px; right: -30px;
        width: 90px; height: 90px;
        border-radius: 50%;
        background: radial-gradient(circle, color-mix(in srgb, var(--hc-top, var(--b2w-accent)) 10%, transparent), transparent 70%);
        pointer-events: none;
      }
      .b2w2-highlight-card:hover {
        box-shadow: 0 6px 24px rgba(0,0,0,.11);
        transform: translateY(-3px);
        border-color: color-mix(in srgb, var(--hc-top, var(--b2w-accent)) 30%, var(--b2w-rule));
      }
      .b2w2-highlight-kicker {
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--b2w-ink-soft);
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .b2w2-highlight-title {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -.01em;
        color: var(--b2w-ink);
        line-height: 1.25;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-highlight-desc { font-size: 12px; line-height: 1.7; color: var(--b2w-ink-mid) }
      .b2w2-highlight-list { display: flex; flex-direction: column; gap: 0 }
      .b2w2-highlight-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 7px 0;
        border-bottom: 1px solid var(--b2w-rule-soft);
        transition: background .1s ease;
      }
      .b2w2-highlight-row:last-child { border-bottom: none }

      /* ── 듀얼 블록 ── */
      .b2w2-dual-card { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--b2w-rule-soft) }
      .b2w2-dual-block {
        padding: 10px 0;
        border-bottom: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-dual-block:last-child { border-bottom: none }
      .b2w2-dual-head { display: flex; align-items: center; justify-content: space-between; gap: 10px }
      .b2w2-dual-title {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 13px;
        font-weight: 800;
        color: var(--b2w-ink);
        letter-spacing: -.01em;
      }
      .b2w2-dual-sub { margin-top: 3px; font-size: 11px; color: var(--b2w-ink-soft) }
      .b2w2-mini-list { display: flex; flex-direction: column; gap: 4px; margin-top: 7px; padding-top: 7px; border-top: 1px dashed var(--b2w-rule-soft) }
      .b2w2-mini-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 11px; font-weight: 700 }

      /* ── 데이터 범위 노트 ── */
      .b2w2-note-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        padding: 10px 14px;
        border: 1px solid var(--b2w-rule-soft);
        border-radius: var(--b2w-r-lg);
        background: var(--b2w-paper-alt);
        margin-bottom: 18px;
      }
      .b2w2-note-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 999px;
        background: var(--white);
        border: 1px solid var(--b2w-rule-soft);
        font-size: 11px;
        font-weight: 700;
        color: var(--b2w-ink-mid);
        box-shadow: var(--b2w-shadow-sm);
      }

      /* ── 월간 그리드 ── */
      .b2w2-monthly-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 22px;
      }

      /* ── 월간 순위 리스트 ── */
      .b2w2-rank-list, .b2w2-ace-list { display: flex; flex-direction: column; gap: 0 }
      .b2w2-rank-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 4px;
        border-bottom: 1px solid var(--b2w-rule-soft);
        transition: background .1s ease;
      }
      .b2w2-rank-row:hover { background: var(--b2w-paper-alt); margin: 0 -4px; padding-left: 8px; padding-right: 8px; border-radius: var(--b2w-r); cursor: pointer; }
      .b2w2-rank-row:last-child { border-bottom: none }
      .b2w2-rank-main { display: flex; align-items: center; gap: 10px; min-width: 0 }
      .b2w2-rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 800;
        flex-shrink: 0;
        border: 1.5px solid currentColor;
      }
      .b2w2-rank-name { font-size: 14px; font-weight: 800; color: var(--b2w-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
      .b2w2-rank-sub { margin-top: 3px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 6px; flex-wrap: wrap }
      .b2w2-rank-delta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
        padding: 4px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
        border: 1px solid transparent;
      }
      .b2w2-rank-delta.up { color: #15803d; background: #f0fdf4; border-color: #bbf7d0 }
      .b2w2-rank-delta.down { color: #b91c1c; background: #fef2f2; border-color: #fecaca }
      .b2w2-rank-delta.same { color: var(--b2w-ink-soft); background: var(--b2w-paper-alt); border-color: var(--b2w-rule-soft) }
      .b2w2-rank-delta.new { color: #5b21b6; background: #f5f3ff; border-color: #ddd6fe }

      /* ── More 버튼 ── */
      .b2w2-more-stack { display: flex; flex-direction: column; gap: 0; margin-top: 0 }
      .b2w2-more-btn {
        margin-top: 10px;
        width: 100%;
        padding: 9px 12px;
        border-radius: var(--b2w-r);
        border: 1px dashed var(--b2w-rule);
        background: none;
        font-size: 11px;
        font-weight: 800;
        color: var(--b2w-ink-soft);
        cursor: pointer;
        letter-spacing: .04em;
        transition: border-color .14s ease, color .14s ease, background .14s ease;
      }
      .b2w2-more-btn:hover { border-color: var(--b2w-accent); color: var(--b2w-accent); background: var(--b2w-accent-soft) }
      .b2w2-more-btn:focus-visible { outline: 2px solid var(--b2w-accent); outline-offset: 2px }
      .b2w2-datebtn:focus-visible, .b2w2-din:focus-visible, .b2w2-sel:focus-visible { outline: 2px solid var(--b2w-accent); outline-offset: 2px }

      /* ── 에이스 카드 ── */
      .b2w2-ace-card {
        padding: 12px 4px;
        border-bottom: 1px solid var(--b2w-rule-soft);
        background: none;
        box-shadow: none;
      }
      .b2w2-ace-card:last-child { border-bottom: none }
      .b2w2-ace-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 9px }
      .b2w2-ace-univ { display: flex; align-items: center; gap: 8px; min-width: 0 }
      .b2w2-ace-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0 }
      .b2w2-ace-univ-name {
        font-size: 11px;
        font-weight: 800;
        color: var(--b2w-ink-mid);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-transform: uppercase;
        letter-spacing: .04em;
      }
      .b2w2-ace-rank {
        font-size: 10px;
        font-weight: 800;
        color: var(--b2w-ink-soft);
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--b2w-paper-alt);
        border: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-ace-player { display: flex; align-items: center; justify-content: space-between; gap: 10px }
      .b2w2-ace-player-name {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 17px;
        font-weight: 800;
        color: var(--b2w-ink);
        letter-spacing: -.01em;
        cursor: pointer;
        transition: color .12s ease;
      }
      .b2w2-ace-player-name:hover { color: var(--b2w-accent) }
      .b2w2-ace-player-sub { margin-top: 4px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 7px; flex-wrap: wrap }
      .b2w2-ace-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 9px }
      .b2w2-ace-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 800;
        border: 1px solid var(--b2w-rule-soft);
        background: var(--white);
        color: var(--b2w-ink-mid);
      }
      .b2w2-ace-empty { padding: 13px 4px; border-bottom: 1px dashed var(--b2w-rule-soft) }
      .b2w2-ace-empty-title { font-size: 14px; font-weight: 800; color: var(--b2w-ink-mid) }
      .b2w2-ace-empty-sub { margin-top: 5px; font-size: 11px; line-height: 1.6; color: var(--b2w-ink-soft) }

      /* ── 월간 MVP ── */
      .b2w2-monthly-mvp {
        padding: 14px 4px;
        border-top: 2px solid var(--b2w-ink);
      }
      .b2w2-monthly-mvp-head { display: flex; align-items: center; justify-content: space-between; gap: 10px }
      .b2w2-monthly-mvp-name {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 18px;
        font-weight: 800;
        color: var(--b2w-ink);
        letter-spacing: -.01em;
        cursor: pointer;
        transition: color .12s ease;
      }
      .b2w2-monthly-mvp-name:hover { color: #92651b }
      .b2w2-monthly-mvp-sub { margin-top: 4px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 6px; flex-wrap: wrap }
      .b2w2-monthly-mvp-metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0,1fr));
        gap: 0;
        margin-top: 12px;
        border: 1px solid var(--b2w-rule-soft);
        border-radius: var(--b2w-r);
        overflow: hidden;
      }
      .b2w2-monthly-mvp-metric {
        padding: 10px 10px;
        text-align: center;
        background: var(--b2w-paper-alt);
        border-right: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-monthly-mvp-metric:last-child { border-right: none }
      .b2w2-monthly-mvp-metric-label { font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); text-transform: uppercase; letter-spacing: .04em }
      .b2w2-monthly-mvp-metric-value { margin-top: 5px; font-family: 'Noto Serif KR', Georgia, serif; font-size: 17px; font-weight: 800; color: var(--b2w-ink) }
      .b2w2-monthly-mvp-form { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px dotted var(--b2w-rule-soft) }

      /* ── 대학별 카드 ── */
      .b2w2-card {
        background: var(--b2w-paper);
        border: 1px solid var(--b2w-rule);
        border-radius: var(--b2w-r-lg);
        margin-bottom: 14px;
        overflow: hidden;
        box-shadow: var(--b2w-shadow-sm);
        transition: box-shadow .18s ease, transform .18s ease;
      }
      .b2w2-card:hover { box-shadow: var(--b2w-shadow); transform: translateY(-1px) }
      .b2w2-card-head {
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 18px;
        cursor: pointer;
        transition: filter .14s ease;
        border-bottom: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-card-head:hover { filter: brightness(.97) }
      .b2w2-chip { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px }
      .b2w2-card-title { display: flex; align-items: flex-start; gap: 10px; min-width: 0 }
      .b2w2-card-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0 }
      .b2w2-card-name {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 18px;
        font-weight: 800;
        color: var(--b2w-ink);
        letter-spacing: -.01em;
      }
      .b2w2-card-sub { margin-top: 4px; font-size: 11px; font-weight: 600; color: var(--b2w-ink-mid); display: flex; gap: 8px; flex-wrap: wrap }
      .b2w2-card-chevron { margin-left: auto; font-size: 12px; color: var(--b2w-ink-soft); padding-top: 3px; flex-shrink: 0 }
      .b2w2-card-body { padding: 14px 18px 18px }
      .b2w2-card-summary { display: grid; grid-template-columns: minmax(0,1.2fr) minmax(260px,.8fr); gap: 14px; padding-bottom: 14px }
      .b2w2-card-kpis {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(118px,1fr));
        gap: 0;
        border: 1px solid var(--b2w-rule-soft);
        border-radius: var(--b2w-r);
        overflow: hidden;
      }
      .b2w2-card-kpi { padding: 12px 14px; border-right: 1px solid var(--b2w-rule-soft); background: var(--b2w-paper-alt) }
      .b2w2-card-kpi:last-child { border-right: none }
      .b2w2-card-kpi-label { font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); text-transform: uppercase; letter-spacing: .04em }
      .b2w2-card-kpi-value { margin-top: 6px; font-family: 'Noto Serif KR', Georgia, serif; font-size: 20px; font-weight: 800; letter-spacing: -.01em; color: var(--b2w-ink) }
      .b2w2-card-kpi-sub { margin-top: 3px; font-size: 11px; font-weight: 600; color: var(--b2w-ink-soft) }
      .b2w2-card-spotlight {
        padding: 14px 16px;
        border-radius: var(--b2w-r);
        border: 1.5px solid var(--gold-b, rgba(180,83,9,.2));
        background: linear-gradient(135deg, var(--gold-bg, #fffbeb), var(--gold-b, #fef9c3));
      }
      .b2w2-card-spotlight-kicker { font-size: 10px; font-weight: 800; color: var(--gold, #92651b); letter-spacing: .08em; text-transform: uppercase }
      .b2w2-card-spotlight-title { margin-top: 6px; font-family: 'Noto Serif KR', Georgia, serif; font-size: 16px; font-weight: 800; color: var(--b2w-ink); display: flex; align-items: center; gap: 6px; flex-wrap: wrap }
      .b2w2-card-spotlight-sub { margin-top: 5px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 8px; flex-wrap: wrap }

      /* ── 테이블 ── */
      .b2w2-table-wrap { border: 1px solid var(--b2w-rule-soft); border-radius: var(--b2w-r); overflow: hidden; background: var(--white) }
      .b2w2-tbl { width: 100%; border-collapse: collapse }
      .b2w2-tbl th {
        font-size: 10px;
        font-weight: 800;
        color: var(--b2w-ink-soft);
        padding: 9px 12px;
        text-align: left;
        border-bottom: 1.5px solid var(--b2w-rule);
        background: var(--b2w-paper-alt);
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: .06em;
      }
      .b2w2-tbl td { font-size: 11px; font-weight: 600; padding: 9px 12px; border-bottom: 1px solid var(--b2w-rule-soft); vertical-align: middle }
      .b2w2-tbl tr:last-child td { border-bottom: none }
      .b2w2-tbl tr:hover td { background: var(--b2w-paper-alt) }

      /* ── 종족전 박스 ── */
      .b2w2-race-box { margin-top: 14px; padding: 14px 16px; border: 1px solid var(--b2w-rule-soft); border-radius: var(--b2w-r); background: var(--b2w-paper-alt) }
      .b2w2-race-title { font-size: 11px; font-weight: 800; color: var(--b2w-ink-soft); margin-bottom: 10px; text-transform: uppercase; letter-spacing: .05em }
      .b2w2-race-table { display: flex; flex-direction: column; gap: 6px }
      .b2w2-race-head, .b2w2-race-row { display: grid; grid-template-columns: minmax(110px,1.4fr) repeat(4,minmax(0,.7fr)); align-items: center; gap: 8px }
      .b2w2-race-head { padding: 0 12px; font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); letter-spacing: .04em; text-transform: uppercase }
      .b2w2-race-head span { text-align: center }
      .b2w2-race-head span:first-child { text-align: left }
      .b2w2-race-row { padding: 8px 12px; border-radius: var(--b2w-r); border: 1px solid var(--b2w-rule-soft); background: var(--white); box-shadow: var(--b2w-shadow-sm); transition: box-shadow .12s ease }
      .b2w2-race-row:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08) }
      .b2w2-race-cell { display: flex; align-items: center; justify-content: center }
      .b2w2-race-cell-main { justify-content: flex-start; gap: 8px }
      .b2w2-race-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 800 }
      .b2w2-race-pill.win { background: #f0fdf4; color: #15803d }
      .b2w2-race-pill.loss { background: #fef2f2; color: #b91c1c }
      .b2w2-race-count { font-size: 12px; font-weight: 800; color: var(--b2w-ink) }
      .b2w2-race-rate { display: inline-flex; align-items: center; justify-content: center; min-width: 52px; padding: 4px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1px solid var(--b2w-rule-soft) }

      /* ── 빈 상태 ── */
      .b2w2-empty { text-align: center; padding: 40px 16px; color: var(--b2w-ink-soft); font-size: 13px; font-family: 'Noto Serif KR', Georgia, serif }

      /* ── 반응형 ── */
      @media(min-width:1180px){
        .b2w2-highlight-grid{grid-template-columns:repeat(5,minmax(0,1fr))}
        .b2w2-lead-card{grid-column:span 2}
        /* 기간 요약(2칸) + 일반 카드 6개(6칸) + MVP 카드(2칸) = 10칸 = 5열 x 2줄로 정확히 채움.
           MVP 카드를 1칸으로 두면 9칸이 되어 마지막 줄에 빈 슬롯이 하나 남는 문제를 방지. */
        .b2w2-mvp-card-lead{grid-column:span 2}
      }
      @media(max-width:900px){
        .b2w2-hero{flex-direction:column}
        .b2w2-hero-stats{width:100%;border-top:1px solid var(--b2w-rule-soft);grid-template-columns:repeat(2,minmax(0,1fr));padding-top:12px}
      }
      @media(max-width:600px){
        .b2w2-hero{padding:0 0 14px}
        .b2w2-hero-title{font-size:26px}
        .b2w2-hero-stats{grid-template-columns:1fr}
        .b2w2-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-modebar{grid-template-columns:1fr;gap:8px}
        .b2w2-highlight-grid{grid-template-columns:1fr;gap:8px}
        .b2w2-monthly-grid{grid-template-columns:1fr;gap:8px}
        .b2w2-card-summary{grid-template-columns:1fr}
        .b2w2-card-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-race-head,.b2w2-race-row{grid-template-columns:minmax(92px,1.1fr) repeat(4,minmax(0,.7fr));gap:6px}
        .b2w2-tbl th:nth-child(5),.b2w2-tbl td:nth-child(5),
        .b2w2-tbl th:nth-child(4),.b2w2-tbl td:nth-child(4){display:none}
      }
      @media(min-width:601px) and (max-width:960px){
        .b2w2-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-modebar{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-highlight-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-monthly-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-card-summary{grid-template-columns:1fr}
      }
      @media(min-width:961px) and (max-width:1179px){
        .b2w2-highlight-grid{grid-template-columns:repeat(3,minmax(0,1fr));}
        /* 1180px 미만에서는 lead/MVP 카드의 span 2가 적용되지 않으므로(미디어쿼리 스코프 밖)
           모든 카드가 1칸씩 차지해 자연스럽게 흐른다. 이 구간에서만 별도 span 처리는 불필요. */
      }

      /* ── 은은한 등장 애니메이션 ── */
      @keyframes b2w2FadeUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .b2w2-kpi-card, .b2w2-highlight-card, .b2w2-mvp-card, .b2w2-card {
        animation: b2w2FadeUp .42s cubic-bezier(.2,.7,.3,1) both;
      }
      .b2w2-kpi-grid .b2w2-kpi-card:nth-child(1){animation-delay:.02s}
      .b2w2-kpi-grid .b2w2-kpi-card:nth-child(2){animation-delay:.06s}
      .b2w2-kpi-grid .b2w2-kpi-card:nth-child(3){animation-delay:.10s}
      .b2w2-kpi-grid .b2w2-kpi-card:nth-child(4){animation-delay:.14s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(1){animation-delay:.04s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(2){animation-delay:.08s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(3){animation-delay:.12s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(4){animation-delay:.16s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(5){animation-delay:.20s}
      @media (prefers-reduced-motion: reduce) {
        .b2w2-kpi-card, .b2w2-highlight-card, .b2w2-mvp-card, .b2w2-card { animation: none }
      }
    `;
    _b2EnsureStyleTag('b2w2-style', css);
    let h = '';

    const _totalGames = curStats.reduce((s,ud)=>s+(ud.tg||0),0);
    const _activeUnivs = curStats.filter(ud=>ud.tg>0).length;
    const _periodDays = diffDays;

    // ── 헤더 컨트롤
    h += `<div class="b2w2-wrap" id="b2w2-export-root">
      <div class="b2w2-masthead">
        <span class="b2w2-masthead-brand"><span class="b2w2-masthead-mark"></span>STAR DATACENTER</span>
        <span>${fmtDate(dateFrom)} ~ ${fmtDate(dateTo)} 발행</span>
      </div>
      <section class="b2w2-hero">
        <div class="b2w2-hero-main">
          <div style="font-size:11px;font-weight:900;letter-spacing:.08em;color:var(--b2w-accent);text-transform:uppercase">${_briefingInfo.kicker}</div>
          <div class="b2w2-hero-title">${_briefingInfo.title}</div>
          <div class="b2w2-hero-desc">${_heroSummary}</div>
          <div class="b2w2-hero-spotlight">
            <div class="b2w2-hero-spotlight-kicker">핵심 지표</div>
            <div class="b2w2-hero-spotlight-title">${_heroSpotlight}</div>
            <div class="b2w2-hero-spotlight-sub">
              <span class="b2w2-hero-pill">${_heroFocusLabel}</span>
              <span class="b2w2-hero-pill">${_heroFocusValue}</span>
              <span class="b2w2-hero-pill">${_heroCompareText}</span>
            </div>
          </div>
          <div class="b2w2-hero-badges">
            <span class="b2w2-hero-badge">${_briefingInfo.short}</span>
            <span class="b2w2-hero-badge">선택 기간 ${fmtDate(dateFrom)} ~ ${fmtDate(dateTo)}</span>
            <span class="b2w2-hero-badge">필터 ${selUniv}</span>
          </div>
        </div>
        <div class="b2w2-hero-stats">
          <div class="b2w2-hero-stat">
            <div class="b2w2-hero-stat-label">선택 범위</div>
            <div class="b2w2-hero-stat-value">${selUniv==='전체'?'전체 대학':selUniv}</div>
            <div class="b2w2-hero-stat-sub">필터 즉시 변경 가능</div>
          </div>
          <div class="b2w2-hero-stat">
            <div class="b2w2-hero-stat-label">비교 기준</div>
            <div class="b2w2-hero-stat-value">${_briefingInfo.prevLabel}</div>
            <div class="b2w2-hero-stat-sub">${fmtDate(prevDateFrom)} ~ ${fmtDate(prevDateTo)}</div>
          </div>
        </div>
      </section>
      <div class="b2w2-modebar">
        <div class="b2w2-modecard ${(!_isMonthly && !_isCustom)?'is-active':''}" onclick="_b2SetBriefingPreset('thisWeek')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">주간 모드</div>
              <div class="b2w2-modetitle">주간</div>
            </div>
            <span class="b2w2-modebadge">${(!_isMonthly && !_isCustom)?'선택됨':'빠른 확인'}</span>
          </div>
          <div class="b2w2-modedesc">이번주와 지난주 흐름을 빠르게 비교할 때 보기 좋습니다.</div>
          <div class="b2w2-presetrow">
            ${[
              ['thisWeek','이번주'],
              ['lastWeek','지난주']
            ].map(([key,label])=>`<button type="button" class="b2w2-preset${preset===key?' on':''}" onclick="event.stopPropagation();_b2SetBriefingPreset('${key}')">${label}</button>`).join('')}
          </div>
        </div>
        <div class="b2w2-modecard ${_isMonthly?'is-active':''}" onclick="_b2SetBriefingPreset('thisMonth')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">월간 모드</div>
              <div class="b2w2-modetitle">월간</div>
            </div>
            <span class="b2w2-modebadge">${_isMonthly?'선택됨':'깊게 보기'}</span>
          </div>
          <div class="b2w2-modedesc">이번달과 지난달 흐름을 조금 더 넓게 확인할 때 적합합니다.</div>
          <div class="b2w2-presetrow">
            ${[
              ['thisMonth','이번달'],
              ['lastMonth','지난달']
            ].map(([key,label])=>`<button type="button" class="b2w2-preset${preset===key?' on':''}" onclick="event.stopPropagation();_b2SetBriefingPreset('${key}')">${label}</button>`).join('')}
          </div>
        </div>
        <div class="b2w2-modecard ${_isCustom?'is-active':''}" onclick="_b2ActivateBriefingCustom(true)">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">사용자 기간</div>
              <div class="b2w2-modetitle">기간</div>
            </div>
            <span class="b2w2-modebadge">${_isCustom?'사용 중':'직접 지정'}</span>
          </div>
          <div class="b2w2-modedesc">원하는 날짜 범위를 직접 입력해 특정 기간 브리핑으로 볼 수 있습니다.</div>
          <div class="b2w2-presetrow">
            <button type="button" class="b2w2-preset${_isCustom && _periodDays===7?' on':''}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(7)">최근 7일</button>
            <button type="button" class="b2w2-preset${_isCustom && _periodDays===14?' on':''}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(14)">최근 14일</button>
            <button type="button" class="b2w2-preset${_isCustom && _periodDays===30?' on':''}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(30)">최근 30일</button>
            <button type="button" class="b2w2-preset${_isCustom && ![7,14,30].includes(_periodDays)?' on':''}" onclick="event.stopPropagation();_b2ActivateBriefingCustom(true)">직접 지정</button>
            <button type="button" class="b2w2-preset${_isCustom && ![7,14,30].includes(_periodDays)?' on':''}" onclick="event.stopPropagation();_b2ApplyBriefingCustomFromInputs()">${_isCustom ? `${fmtDate(dateFrom)} ~ ${fmtDate(dateTo)}` : '입력값 조회'}</button>
          </div>
        </div>
      </div>
      <div class="b2w2-hdr">
      <span style="font-size:16px">📅</span>
      <span style="font-size:14px;font-weight:900;color:var(--text1)">${_briefingInfo.title}</span>
      <input type="date" class="b2w2-din" id="b2w2-from" value="${dateFrom}" onchange="_b2SyncBriefingCustomInputs(true)" title="시작 날짜 변경">
      <button type="button" class="b2w2-datebtn" onclick="_b2OpenBriefingDateInput('from')" title="시작 날짜 선택">📅 시작일</button>
      <span style="font-size:12px;color:var(--text3);font-weight:700">~</span>
      <input type="date" class="b2w2-din" id="b2w2-to" value="${dateTo}" onchange="_b2SyncBriefingCustomInputs(true)" title="종료 날짜 변경">
      <button type="button" class="b2w2-datebtn" onclick="_b2OpenBriefingDateInput('to')" title="종료 날짜 선택">📅 종료일</button>
      <select class="b2w2-sel" id="b2w2-univ" onchange="_b2SyncBriefingCustomInputs(true)">
        <option value="전체"${selUniv==='전체'?' selected':''}>🏫 전체 대학</option>
        ${univList.map(u=>`<option value="${u.name}"${selUniv===u.name?' selected':''}>${u.name}</option>`).join('')}
      </select>
      <button type="button" class="b2w2-btn" onclick="_b2ApplyBriefingCustomFromInputs()">조회</button>
      <button type="button" class="b2w2-btn no-export" onclick="captureBriefingArticle('split')" style="background:#111827">📰 저장(분할)</button>
      <button type="button" class="b2w2-btn no-export" onclick="captureBriefingArticle('single')" style="background:#334155">📰 저장(1장)</button>
      <span style="font-size:11px;color:var(--text3);margin-left:auto">${fmtDate(dateFrom)} ~ ${fmtDate(dateTo)}</span>
      <span style="font-size:10px;color:var(--text3)">(${_briefingInfo.prevLabel}: ${fmtDate(prevDateFrom)}~${fmtDate(prevDateTo)})</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 2px 10px;border-bottom:1px dashed var(--b2w-rule-soft);margin-bottom:16px">
      <span style="font-size:10px;font-weight:800;color:var(--b2w-tag-muted);letter-spacing:.06em;text-transform:uppercase;flex-shrink:0">데이터 범위</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">미니대전</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대학대전</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대학CK</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대회 · 일반</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대회 · 조별리그</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">대회 · 대진표기록</span>
      <span style="font-size:10px;color:var(--b2w-accent);background:var(--b2w-tag-accent-bg);border:1px solid var(--b2w-tag-accent-border);border-radius:4px;padding:2px 7px;font-weight:700">티어대회 · 일반</span>
      <span style="font-size:10px;color:var(--b2w-accent);background:var(--b2w-tag-accent-bg);border:1px solid var(--b2w-tag-accent-border);border-radius:4px;padding:2px 7px;font-weight:700">티어대회 · 조별리그</span>
      <span style="font-size:10px;color:var(--b2w-accent);background:var(--b2w-tag-accent-bg);border:1px solid var(--b2w-tag-accent-border);border-radius:4px;padding:2px 7px;font-weight:700">티어대회 · 대진표기록</span>
      <span style="font-size:10px;color:var(--b2w-tag-muted);margin-left:2px">※ 개인전·끝장전·프로리그 기록은 브리핑 집계에서 제외됩니다</span>
    </div>`;

    const hasData = targetStats.some(ud => ud.tg > 0);
    if (!hasData) {
      h += `<div class="b2w2-empty"><div style="font-size:28px;margin-bottom:8px">📭</div>해당 기간에 기록된 경기가 없습니다.<div style="font-size:11px;margin-top:4px">기간을 변경해보세요</div></div></div>`;
      return h;
    }

    const _leaderForKpi = _isMonthly ? rankedUnivs[0] : topUnivs[0];
    const _leaderLabel = _isMonthly ? '선두 대학' : '활동량 1위 대학';
    const _leaderValue = _leaderForKpi ? _leaderForKpi.u.name : '-';
    const _leaderColor = _leaderForKpi && typeof gc === 'function'
      ? (gc(_leaderForKpi.u.name) || '#f59e0b')
      : '#f59e0b';
    const _leaderSub = _leaderForKpi
      ? (_isMonthly
          ? `${_leaderForKpi.tw}승 ${_leaderForKpi.tl}패 · 승률 ${_leaderForKpi.wr ?? 0}%`
          : `${_leaderForKpi.tg}전 · 활동 ${_leaderForKpi.active.length}명`)
      : '집계 데이터 없음';
    const _bestWrSub = bestWrPlayer ? `${bestWrPlayer.p?.name || '-'} · ${bestWrPlayer.total}전` : '표본 부족';
    h += `<section class="b2w2-kpi-grid">
      <article class="b2w2-kpi-card" style="--kpi-accent:#6366f1">
        <div class="b2w2-kpi-label">🏫 활동 대학</div>
        <div class="b2w2-kpi-value">${_activeUnivs}<span style="font-size:14px;font-weight:700;color:var(--b2w-ink-soft);margin-left:2px">곳</span></div>
        <div class="b2w2-kpi-sub">경기 기록 있는 대학 수</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:#0ea5e9">
        <div class="b2w2-kpi-label">🎮 총 경기 수</div>
        <div class="b2w2-kpi-value">${_totalGames}<span style="font-size:14px;font-weight:700;color:var(--b2w-ink-soft);margin-left:2px">전</span></div>
        <div class="b2w2-kpi-sub">${_periodDays}일 집계 기준</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:${_leaderColor}">
        <div class="b2w2-kpi-label">👑 ${_leaderLabel}</div>
        <div class="b2w2-kpi-value" style="font-size:18px;margin-top:8px">${_leaderValue}</div>
        <div class="b2w2-kpi-sub">${_leaderSub}</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:#10b981">
        <div class="b2w2-kpi-label">🎯 최고 승률</div>
        <div class="b2w2-kpi-value" style="color:#10b981">${bestWrPlayer ? `${bestWrPlayer.winRate}%` : '-'}</div>
        <div class="b2w2-kpi-sub">${_bestWrSub}</div>
      </article>
    </section>`;

    h += `<section class="b2w2-highlight-grid">
      <article class="b2w2-highlight-card b2w2-lead-card" style="border-color:var(--b2w-accent-border);--hc-top:var(--b2w-accent)">
        <div class="b2w2-highlight-kicker" style="color:var(--b2w-accent)">기간 요약</div>
        <div class="b2w2-highlight-title">기간 핵심 요약</div>
        <div class="b2w2-highlight-desc">${_heroSummary}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="b2w2-note-chip" style="border-color:var(--b2w-tag-accent-border);color:var(--b2w-accent);background:var(--b2w-tag-accent-bg)">활동 스트리머 ${activePlayers.length}명</span>
          <span class="b2w2-note-chip">${_periodDays}일 집계</span>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#f59e0b">
        <div class="b2w2-highlight-kicker" style="color:#b45309">🏫 대학 활동량</div>
        <div class="b2w2-highlight-title">${_topLabel}</div>
        <div class="b2w2-highlight-list">
          ${topUnivs.length ? topUnivs.map((ud, idx) => `
            <div class="b2w2-highlight-row">
              <div style="display:flex;align-items:center;gap:8px;min-width:0">
                <span style="font-size:11px;font-weight:900;color:${gc ? gc(ud.u.name) : '#64748b'}">${idx + 1}</span>
                <span style="font-size:12px;font-weight:900;color:var(--text1)">${ud.u.name}</span>
              </div>
              <div style="font-size:11px;font-weight:800;color:var(--text3)">${ud.tg}전 · 활동 ${ud.active.length}명</div>
            </div>
          `).join('') : `<div class="b2w2-highlight-desc">활동 대학이 없습니다.</div>`}
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#10b981">
        <div class="b2w2-highlight-kicker" style="color:#15803d">📈 승률 변동</div>
        <div class="b2w2-highlight-title">전기 대비 승률 변화</div>
        <div class="b2w2-dual-card">
          <div class="b2w2-dual-block">
            ${hotPlayer ? `
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#15803d">상승세</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${hotPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${hotPlayer.p?.name || '-'}</span> · ${String(hotPlayer.p?.univ || '무소속')}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#bbf7d0;color:#15803d;background:#f0fdf4">${hotPlayer.wrDelta >= 0 ? '+' : ''}${hotPlayer.wrDelta}%p</span>
              </div>
              <div class="b2w2-mini-list">
                <div class="b2w2-mini-row"><span style="color:var(--text3)">전적</span><span style="color:var(--text1)">${hotPlayer.wins}승 ${hotPlayer.losses}패</span></div>
                <div class="b2w2-mini-row"><span style="color:var(--text3)">경기 수 변화</span><span style="color:var(--text1)">${hotPlayer.totalDelta >= 0 ? '+' : ''}${hotPlayer.totalDelta}전</span></div>
                ${risingPlayers[1] ? `<div class="b2w2-mini-row"><span style="color:var(--text3)">다음</span><span style="color:#15803d">${risingPlayers[1].p?.name || '-'} ${risingPlayers[1].wrDelta >= 0 ? '+' : ''}${risingPlayers[1].wrDelta}%p</span></div>` : ''}
              </div>
            ` : `<div class="b2w2-highlight-desc">전주와 비교할 만큼 상승한 스트리머가 없습니다.</div>`}
          </div>
          <div class="b2w2-dual-block">
            ${coldPlayer ? `
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#dc2626">하락세</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${coldPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${coldPlayer.p?.name || '-'}</span> · ${String(coldPlayer.p?.univ || '무소속')}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#fecaca;color:#dc2626;background:#fef2f2">${coldPlayer.wrDelta}%p</span>
              </div>
              <div class="b2w2-mini-list">
                <div class="b2w2-mini-row"><span style="color:var(--text3)">전적</span><span style="color:var(--text1)">${coldPlayer.wins}승 ${coldPlayer.losses}패</span></div>
                <div class="b2w2-mini-row"><span style="color:var(--text3)">경기 수 변화</span><span style="color:var(--text1)">${coldPlayer.totalDelta >= 0 ? '+' : ''}${coldPlayer.totalDelta}전</span></div>
                ${decliningPlayers[1] ? `<div class="b2w2-mini-row"><span style="color:var(--text3)">다음</span><span style="color:#dc2626">${decliningPlayers[1].p?.name || '-'} ${decliningPlayers[1].wrDelta}%p</span></div>` : ''}
              </div>
            ` : `<div class="b2w2-highlight-desc">전주와 비교할 만큼 하락한 스트리머가 없습니다.</div>`}
          </div>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#0891b2">
        <div class="b2w2-highlight-kicker" style="color:#0891b2">🔥 연속 기록</div>
        <div class="b2w2-highlight-title">연승 / 연패 현황</div>
        <div class="b2w2-dual-card">
          <div class="b2w2-dual-block">
            ${streakPlayer ? `
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#0891b2">연승</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${streakPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${streakPlayer.p?.name || '-'}</span> · ${String(streakPlayer.p?.univ || '무소속')}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#a5f3fc;color:#0891b2;background:#ecfeff">🔥 ${streakPlayer.streak}연승</span>
              </div>
              <div class="b2w2-mini-list">
                ${streakPlayers.slice(1, 3).map((s, idx) => `
                  <div class="b2w2-mini-row">
                    <span style="color:var(--text1)">${idx + 2}. ${s.p?.name || '-'}</span>
                    <span style="color:#0891b2">${s.streak}연승</span>
                  </div>
                `).join('') || `<div class="b2w2-mini-row"><span style="color:var(--text3)">보조 랭크</span><span style="color:#0891b2">단독 선두</span></div>`}
              </div>
            ` : `<div class="b2w2-highlight-desc">2연승 이상 기록 중인 스트리머가 없습니다.</div>`}
          </div>
          <div class="b2w2-dual-block">
            ${loseStreakPlayer ? `
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#7c3aed">연패</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${loseStreakPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${loseStreakPlayer.p?.name || '-'}</span> · ${String(loseStreakPlayer.p?.univ || '무소속')}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#ddd6fe;color:#7c3aed;background:#f5f3ff">💧 ${loseStreakPlayer.streak}연패</span>
              </div>
              <div class="b2w2-mini-list">
                ${loseStreakPlayers.slice(1, 3).map((s, idx) => `
                  <div class="b2w2-mini-row">
                    <span style="color:var(--text1)">${idx + 2}. ${s.p?.name || '-'}</span>
                    <span style="color:#7c3aed">${s.streak}연패</span>
                  </div>
                `).join('') || `<div class="b2w2-mini-row"><span style="color:var(--text3)">보조 랭크</span><span style="color:#7c3aed">단독 집계</span></div>`}
              </div>
            ` : `<div class="b2w2-highlight-desc">2연패 이상 기록 중인 스트리머가 없습니다.</div>`}
          </div>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#16a34a">
        <div class="b2w2-highlight-kicker" style="color:#16a34a">🏅 승률 지표</div>
        <div class="b2w2-highlight-title">최고 승률</div>
        ${bestWrPlayer ? `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:18px;font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${bestWrPlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${bestWrPlayer.p?.name || '-'}</div>
              <div style="font-size:12px;color:var(--text3);margin-top:4px">${String(bestWrPlayer.p?.univ || '무소속')}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#bbf7d0;color:#16a34a;background:#f0fdf4">${bestWrPlayer.winRate}%</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:11px;color:var(--text3)">전적</span><strong style="font-size:12px;color:var(--text1)">${bestWrPlayer.total}전 ${bestWrPlayer.wins}승 ${bestWrPlayer.losses}패</strong></div>
          </div>
          ${bestWrPlayers.length > 1 ? `
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${bestWrPlayers.slice(1, 3).map((s, idx) => `
              <div class="b2w2-highlight-row">
                <span style="font-size:12px;font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${s.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${idx + 2}. ${s.p?.name || '-'}</span>
                <strong style="font-size:11px;color:#16a34a">${s.winRate}%</strong>
              </div>
            `).join('')}
          </div>` : ''}
        ` : `<div class="b2w2-highlight-desc">3전 이상 기록한 스트리머가 없습니다.</div>`}
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#7c3aed">
        <div class="b2w2-highlight-kicker" style="color:#7c3aed">⚔️ 전체 경기 지표</div>
        <div class="b2w2-highlight-title">최다 전체 경기</div>
        ${mostActivePlayer ? `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:18px;font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${mostActivePlayer.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${mostActivePlayer.p?.name || '-'}</div>
              <div style="font-size:12px;color:var(--text3);margin-top:4px">${String(mostActivePlayer.p?.univ || '무소속')}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#ddd6fe;color:#7c3aed;background:#f5f3ff">${mostActivePlayer.total}전</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:11px;color:var(--text3)">전체 전적</span><strong style="font-size:12px;color:var(--text1)">${mostActivePlayer.wins}승 ${mostActivePlayer.losses}패 · ${mostActivePlayer.winRate ?? '-'}%</strong></div>
          </div>
          ${mostActivePlayers.length > 1 ? `
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${mostActivePlayers.slice(1, 3).map((s, idx) => `
              <div class="b2w2-highlight-row">
                <span style="font-size:12px;font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${s.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${idx + 2}. ${s.p?.name || '-'}</span>
                <strong style="font-size:11px;color:#7c3aed">${s.total}전</strong>
              </div>
            `).join('')}
          </div>` : ''}
        ` : `<div class="b2w2-highlight-desc">경기 기록이 없습니다.</div>`}
      </article>
      ${(() => {
        const _profileMvp = mvp || monthlyTopPlayers[0] || null;
        if (!_profileMvp) {
          return `<article class="b2w2-highlight-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;--hc-top:#f59e0b">
            <div class="b2w2-highlight-kicker" style="color:#b45309">🏆 ${_mvpLabel}</div>
            <div class="b2w2-highlight-desc">집계할 기록이 없습니다.</div>
          </article>`;
        }
        return _mkMvpCard(_profileMvp, 1, false, 'b2w2-mvp-card-lead');
      })()}
    </section>`;

    const _renderMonthlyRankRows = (list) => {
      if (!list.length) return `<div class="b2w2-highlight-desc">월간 대학 순위를 계산할 기록이 없습니다.</div>`;
      const _renderRow = (ud) => {
        const col = (typeof gc === 'function' ? gc(ud.u.name) : '#64748b') || '#64748b';
        const deltaClass = ud.rankDelta === null ? 'new' : ud.rankDelta > 0 ? 'up' : ud.rankDelta < 0 ? 'down' : 'same';
        const deltaText = ud.rankDelta === null ? 'NEW' : ud.rankDelta > 0 ? `▲${ud.rankDelta}` : ud.rankDelta < 0 ? `▼${Math.abs(ud.rankDelta)}` : '유지';
        const univNameJs = ud.u.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        return `
              <div class="b2w2-rank-row" style="cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univNameJs}')">
                <div class="b2w2-rank-main">
                  <span class="b2w2-rank-badge" style="background:${col}18;color:${col}">${ud.rank}</span>
                  <div style="min-width:0">
                    <div class="b2w2-rank-name">${ud.u.name}</div>
                    <div class="b2w2-rank-sub">
                      <span>${ud.tw}승 ${ud.tl}패</span>
                      <span>승률 ${ud.wr ?? 0}%</span>
                      <span>${ud.tg}전</span>
                    </div>
                  </div>
                </div>
                <span class="b2w2-rank-delta ${deltaClass}">${deltaText}</span>
              </div>`;
      };
      const visible = list.slice(0, _monthlyPreviewCount);
      const hidden = list.slice(_monthlyPreviewCount);
      return `${visible.map(_renderRow).join('')}${hidden.length ? `
        <div id="${_monthlyRankMoreId}" class="b2w2-more-stack" style="display:none">${hidden.map(_renderRow).join('')}</div>
        <button type="button" id="${_monthlyRankBtnId}" class="b2w2-more-btn" onclick="(function(){const more=document.getElementById('${_monthlyRankMoreId}');const btn=document.getElementById('${_monthlyRankBtnId}');if(!more||!btn)return;const isOpen=more.style.display!=='none';more.style.display=isOpen?'none':'';btn.textContent=isOpen?'순위 더 보기':'순위 접기';})()">순위 더 보기</button>
      ` : ''}`;
    };
    const _renderMonthlyAceCards = (list) => {
      if (!list.length) return `<div class="b2w2-highlight-desc">대학별 에이스를 뽑을 수 있는 기록이 없습니다.</div>`;
      const _renderCard = (item) => {
        const col = (typeof gc === 'function' ? gc(item.u.name) : '#64748b') || '#64748b';
        const ace = item.ace;
        if (!ace) {
          return `
              <div class="b2w2-ace-empty">
                <div class="b2w2-ace-head" style="margin-bottom:0">
                  <div class="b2w2-ace-univ">
                    <span class="b2w2-ace-dot" style="background:${col}"></span>
                    <span class="b2w2-ace-univ-name">${item.u.name}</span>
                  </div>
                  <span class="b2w2-ace-rank">${item.rank}위 대학</span>
                </div>
                <div class="b2w2-ace-empty-title">확실한 에이스 없음</div>
                <div class="b2w2-ace-empty-sub">이번 기간은 기준을 만족한 선수가 없습니다. 최소 3전, 승률 50% 이상, 순승 우세 조건을 적용했습니다.</div>
              </div>`;
        }
        const aceTone = (ace.winRate ?? 0) >= 70 && (ace.netWins ?? 0) >= 3
          ? { bg:'var(--b2w-paper-alt)', badgeBg:'color-mix(in srgb, var(--green) 14%, transparent)', badgeCol:'var(--green)', badgeBorder:'color-mix(in srgb, var(--green) 36%, transparent)', label:'고승률' }
          : (ace.winRate ?? 0) >= 60
            ? { bg:'var(--b2w-paper-alt)', badgeBg:'var(--b2w-tag-accent-bg)', badgeCol:'var(--b2w-accent)', badgeBorder:'var(--b2w-tag-accent-border)', label:'에이스' }
            : { bg:'var(--b2w-paper)', badgeBg:'var(--b2w-paper-alt)', badgeCol:'var(--b2w-ink-mid)', badgeBorder:'var(--b2w-rule)', label:'근소 우세' };
        return `
              <div class="b2w2-ace-card" style="background:${aceTone.bg};border-color:${col}22">
                <div class="b2w2-ace-head">
                  <div class="b2w2-ace-univ">
                    <span class="b2w2-ace-dot" style="background:${col}"></span>
                    <span class="b2w2-ace-univ-name">${item.u.name}</span>
                  </div>
                  <span class="b2w2-ace-rank">${item.rank}위 대학</span>
                </div>
                <div class="b2w2-ace-player">
                  <div style="min-width:0">
                    <div class="b2w2-ace-player-name" onclick="openPlayerModal('${ace.p?.name?.replace(/\\/g,'\\\\').replace(/'/g,"\\'") || ''}')">${ace.p?.name || '-'}</div>
                    <div class="b2w2-ace-player-sub">
                      <span>${ace.wins}승 ${ace.losses}패</span>
                      <span style="color:${(ace.winRate ?? 0) >= 60 ? 'var(--green)' : (ace.winRate ?? 0) >= 50 ? 'var(--b2w-accent)' : 'var(--gray)'}">승률 ${ace.winRate ?? 0}%</span>
                      <span>순승 +${ace.netWins ?? 0}</span>
                      <span>${ace.total}전</span>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:3px;flex-shrink:0">${_b2WeeklyForm(ace.hist)}</div>
                </div>
                <div class="b2w2-ace-badges">
                  <span class="b2w2-ace-badge" style="background:${aceTone.badgeBg};color:${aceTone.badgeCol};border-color:${aceTone.badgeBorder}">${aceTone.label}</span>
                  ${(ace.netWins || 0) >= 3 ? `<span class="b2w2-ace-badge">순승 강세</span>` : ''}
                </div>
              </div>`;
      };
      const visible = list.slice(0, _monthlyPreviewCount);
      const hidden = list.slice(_monthlyPreviewCount);
      return `${visible.map(_renderCard).join('')}${hidden.length ? `
        <div id="${_monthlyAceMoreId}" class="b2w2-more-stack" style="display:none">${hidden.map(_renderCard).join('')}</div>
        <button type="button" id="${_monthlyAceBtnId}" class="b2w2-more-btn" onclick="(function(){const more=document.getElementById('${_monthlyAceMoreId}');const btn=document.getElementById('${_monthlyAceBtnId}');if(!more||!btn)return;const isOpen=more.style.display!=='none';more.style.display=isOpen?'none':'';btn.textContent=isOpen?'에이스 더 보기':'에이스 접기';})()">에이스 더 보기</button>
      ` : ''}`;
    };
    if (_isMonthly && selUniv === '전체') {
      h += `<section class="b2w2-monthly-grid">
        <article class="b2w2-highlight-card">
          <div class="b2w2-highlight-kicker">University Ranking</div>
          <div class="b2w2-highlight-title">${preset==='thisMonth' ? '이번달 대학 순위' : '지난달 대학 순위'}</div>
          <div class="b2w2-highlight-desc">승 수를 우선으로 정렬하고, 동률일 때 승률과 경기 수를 함께 반영했습니다.</div>
          <div class="b2w2-rank-list">
            ${_renderMonthlyRankRows(rankedUnivLeaders)}
          </div>
        </article>
        <article class="b2w2-highlight-card">
          <div class="b2w2-highlight-kicker">University Aces</div>
          <div class="b2w2-highlight-title">${preset==='thisMonth' ? '대학별 에이스' : '지난달 대학별 에이스'}</div>
          <div class="b2w2-highlight-desc">최소 3전, 승률 50% 이상, 순승 우선 기준으로 뽑았습니다. 조건 미달 대학은 별도 안내로 표시합니다.</div>
          <div class="b2w2-ace-list">
            ${_renderMonthlyAceCards(monthlyUnivAces)}
          </div>
        </article>
      </section>`;
    }

    if (silentUnivs.length) {
      h += `<div class="b2w2-note-row">
        <span style="font-size:11px;font-weight:900;color:var(--text3)">기록 없는 대학</span>
        ${silentUnivs.slice(0, 8).map(name => `<span class="b2w2-note-chip">${name}</span>`).join('')}
        ${silentUnivs.length > 8 ? `<span style="font-size:11px;color:var(--text3);font-weight:800">외 ${silentUnivs.length - 8}곳</span>` : ''}
      </div>`;
    }

    // ── MVP 트리플 배너 (MVP + 2위 + 이번주 최악) — 제거됨: 위쪽 하이라이트 카드와 중복되어 삭제

    // ── 전체 대학 차트 (전체 탭일 때만)
    if (selUniv === '전체' && curStats.some(ud=>ud.tg>0)) {
      h += `<div class="b2w2-chart-box">
        <div class="b2w2-chart-title">📊 대학별 전적 현황 (이번 기간)</div>
        ${_b2WeeklyBarChart(curStats)}
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#10b981;opacity:.9"></div><span style="font-size:10px;color:var(--text3)">승</span></div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#64748b;opacity:.3"></div><span style="font-size:10px;color:var(--text3)">패</span></div>
          <span style="font-size:10px;color:var(--text3)">우측: 승률 / 경기수</span>
        </div>
      </div>`;
    }

    // ── 전체 종족 메타 (선택 범위 기준 — 상대 종족전 승률)
    const _metaRaceCount = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    targetStats.forEach(ud => { ['P','T','Z'].forEach(r => { _metaRaceCount[r].w += ud.raceCount[r].w; _metaRaceCount[r].l += ud.raceCount[r].l; }); });
    const _metaHasRace = ['P','T','Z'].some(r => _metaRaceCount[r].w + _metaRaceCount[r].l > 0);
    if (_metaHasRace) {
      const _metaRaceRanked = ['P','T','Z'].map(r => {
        const { w, l } = _metaRaceCount[r];
        const t = w + l;
        return { r, t, wr: t ? Math.round(w/t*100) : null };
      }).filter(x => x.t > 0).sort((a,b) => (b.wr ?? -1) - (a.wr ?? -1));
      const _metaTop = _metaRaceRanked[0];
      const _metaRaceLabel = { P:'프로토스', T:'테란', Z:'저그' };
      h += `<div class="b2w2-chart-box">
        <div class="b2w2-chart-title">⚔️ 종족전 메타 (${selUniv==='전체'?'전체':selUniv} · ${_briefingInfo.short})</div>
        ${_b2WeeklyRaceStats(_metaRaceCount)}
        ${_metaTop ? `<div style="margin-top:8px;font-size:11px;font-weight:700;color:var(--text3)">${_metaRaceLabel[_metaTop.r]} 진영이 상대 종족전 승률 ${_metaTop.wr}%로 가장 강세입니다.</div>` : ''}
      </div>`;
    }

    // ── 대학별 카드
    targetStats.filter(ud=>ud.tg>0).forEach((ud, ui) => {
      const { u, active, tw, tl, tg, wr, raceCount } = ud;
      const color   = (gc ? gc(u.name) : '#64748b') || '#64748b';
      const prevUd  = prevMap[u.name];
      const prevWr  = prevUd && prevUd.tg > 0 ? prevUd.wr : null;
      const wrClass = wr===null?'':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
      const cid     = `b2w2-body-${ui}`;
      const icid    = `b2w2-ic-${ui}`;

      // 대학 MVP
      const univMVP = _b2WeeklyUnivMVP(active);

      // 정렬: 승률→경기수
      const sorted = [...active].sort((a,b) => {
        const ra = a.total?a.wins/a.total:0, rb = b.total?b.wins/b.total:0;
        return ra!==rb?rb-ra:b.total-a.total;
      });

      h += `<div class="b2w2-card" style="border-top:3px solid ${color}">
        <div class="b2w2-card-head" style="background:linear-gradient(135deg, ${color}17 0%, ${color}08 55%, transparent 100%)" onclick="(function(){
          const b=document.getElementById('${cid}');
          const ic=document.getElementById('${icid}');
          if(!b)return;
          const show=b.style.display==='none';
          b.style.display=show?'':'none';
          if(ic)ic.textContent=show?'▼':'▶';
        })()">
          <div class="b2w2-card-title">
            <span class="b2w2-card-dot" style="background:${color}"></span>
            <div style="min-width:0">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <div class="b2w2-card-name">${u.name}</div>
                <button type="button" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${u.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')" style="font-size:10px;font-weight:800;padding:3px 9px;border-radius:999px;border:1.5px solid ${color};background:var(--b2w-paper-alt);color:${color};cursor:pointer;white-space:nowrap;line-height:1.6;box-shadow:0 1px 3px rgba(0,0,0,.08)">🏫 대학상세</button>
              </div>
              <div class="b2w2-card-sub">
                <span>활동 ${active.length}명</span>
                <span>${tg}전 ${tw}승 ${tl}패</span>
                ${wr!==null?`<span style="font-weight:900;color:${wrClass}">승률 ${wr}%${_b2WeeklyDelta(wr,prevWr)}</span>`:''}
              </div>
            </div>
          </div>
          <span id="${icid}" class="b2w2-card-chevron">▼</span>
        </div>
        <div id="${cid}" class="b2w2-card-body">
          <div class="b2w2-card-summary">
            <div class="b2w2-card-kpis">
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">활동 인원</div>
                <div class="b2w2-card-kpi-value">${active.length}명</div>
                <div class="b2w2-card-kpi-sub">이번 기간 출전 선수</div>
              </div>
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">팀 전적</div>
                <div class="b2w2-card-kpi-value">${tw}<span style="color:#10b981">승</span> ${tl}<span style="color:#ef4444">패</span></div>
                <div class="b2w2-card-kpi-sub">총 ${tg}전 소화</div>
              </div>
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">팀 승률</div>
                <div class="b2w2-card-kpi-value" style="color:${wrClass}">${wr!==null?`${wr}%`:'-'}</div>
                <div class="b2w2-card-kpi-sub">${prevWr!==null&&wr!==null?`전기 대비 ${_b2WeeklyDelta(wr,prevWr)}`:'비교 데이터 없음'}</div>
              </div>
            </div>
            <div class="b2w2-card-spotlight">
              ${univMVP ? `
                <div class="b2w2-card-spotlight-kicker">대학별 에이스</div>
                <div class="b2w2-card-spotlight-title">
                  <span onclick="openPlayerModal(this.dataset.n);event.stopPropagation()" data-n="${univMVP.p.name}" style="cursor:pointer;border-bottom:1.5px solid ${color}55">${univMVP.p.name}</span>
                  ${univMVP.p.tier?`<span style="font-size:10px;padding:2px 6px;border-radius:999px;background:${typeof getTierBtnColor==='function' ? getTierBtnColor(univMVP.p.tier) : '#64748b'};color:${typeof getTierBtnTextColor==='function' ? (getTierBtnTextColor(univMVP.p.tier)||'#fff') : '#fff'}">${univMVP.p.tier}</span>`:''}
                </div>
                <div class="b2w2-card-spotlight-sub">
                  <span>${univMVP.wins}승 ${univMVP.losses}패</span>
                  <span>승률 ${univMVP.winRate}%</span>
                </div>
              ` : `
                <div class="b2w2-card-spotlight-kicker">대학별 에이스</div>
                <div class="b2w2-card-spotlight-title">이번 기간 확실한 에이스 없음</div>
                <div class="b2w2-card-spotlight-sub">최소 경기 수와 승률 기준을 동시에 만족한 선수가 없습니다.</div>
              `}
            </div>
          </div>`;

      // 선수 테이블
      h += `<div class="b2w2-table-wrap"><table class="b2w2-tbl"><thead><tr>
        <th style="width:28px">#</th>
        <th>선수</th>
        <th>전체 전적</th>
        <th>최근 폼</th>
      </tr></thead><tbody>`;

      sorted.forEach((s, i) => {
        const { p, wins, losses, total, winRate, offWins, offLosses } = s;
        const wrCls  = winRate===null?'#94a3b8':winRate>=60?'#10b981':winRate>=40?'#f59e0b':'#ef4444';
        const tc2    = typeof getTierBtnColor==='function'&&p.tier?getTierBtnColor(p.tier):'#64748b';
        const tt2    = typeof getTierBtnTextColor==='function'&&p.tier?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
        const rIco   = p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
        const medal  = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
        const isMVP  = univMVP && univMVP.p === p;

        // 이전주 비교 (사전 계산된 맵 재사용 — 매 선수마다 재집계하지 않음)
        const prevS    = prevPlayerMap[p.name] || null;
        const prevWr2  = prevS && prevS.total>0 ? prevS.winRate : null;

        h += `<tr ${isMVP?'style="background:#fef9c322"':''}>
          <td style="font-size:11px;font-weight:900;color:var(--text3);text-align:center">${medal}</td>
          <td>
            <span onclick="openPlayerModal(this.dataset.n);event.stopPropagation()" data-n="${p.name}" style="font-weight:900;color:var(--text1);cursor:pointer;border-bottom:1.5px solid var(--border2);padding-bottom:1px">${p.name}</span>
            ${rIco?`<span style="font-size:11px;margin-left:2px">${rIco}</span>`:''}
            ${p.tier?`<span style="font-size:10px;padding:1px 5px;border-radius:4px;background:${tc2};color:${tt2};margin-left:3px">${p.tier}</span>`:''}
            ${isMVP?`<span style="font-size:9px;background:#fef9c3;color:#b45309;padding:1px 4px;border-radius:4px;margin-left:3px;font-weight:800">MVP</span>`:''}
          </td>
          <td>
            <span style="font-weight:900;color:var(--text1)">${total}전</span>
            <span style="color:#10b981;font-size:11px"> ${wins}승</span>
            <span style="color:#ef4444;font-size:11px"> ${losses}패</span>
            ${winRate!==null?`<span style="font-size:11px;font-weight:800;color:${wrCls};margin-left:3px">${winRate}%</span>${_b2WeeklyDelta(winRate,prevWr2)}`:''}
          </td>
          <td><div style="display:flex;align-items:center;gap:2px">${_b2WeeklyForm(s.hist)}</div></td>
        </tr>`;
      });

      h += `</tbody></table></div>`;

      // 종족별 통계
      const hasRace = ['P','T','Z'].some(r => raceCount[r].w+raceCount[r].l > 0);
      if (hasRace) {
        h += `<div class="b2w2-race-box">
          <div class="b2w2-race-title">⚔️ 종족별 상대 전적 (대학 전체)</div>
          ${_b2WeeklyRaceStats(raceCount)}
        </div>`;
      }

      h += `</div></div>`;
    });

    h += `</div>`;
    return h;

  } catch(e) {
    console.error('[_b2WeeklyBriefingView v2] 오류:', e);
    return `<div style="padding:40px;text-align:center;color:#dc2626">브리핑 오류: ${e.message}</div>`;
  }
}
