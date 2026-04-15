/* ══════════════════════════════════════
   📡 elboard.js — 최근전적 (인라인 렌더)
   - iframe 방식 제거 → 로컬 데이터 직접 렌더
   - recent-preview.html 불필요 (404/CSP 문제 해결)
══════════════════════════════════════ */

function rElboard(C, T) {
  T.innerText = '🧾 최근전적';

  /* ── 관리자 전용 ── */
  if (!isLoggedIn) {
    C.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px">
      <div style="font-size:48px">🔒</div>
      <div style="font-size:18px;font-weight:800;color:var(--text)">관리자 전용 페이지</div>
      <div style="font-size:13px;color:var(--gray-l)">최근전적 탭은 관리자 로그인 후 이용할 수 있습니다.</div>
      <button class="btn btn-b" onclick="om('loginModal')">🔑 로그인</button>
    </div>`;
    return;
  }

  /* ── 필터 상태 ── */
  if (!window._elSrc) window._elSrc = 'all';
  if (!window._elLimit) window._elLimit = 30;

  const srcOpts = [
    { id: 'all',  lbl: '전체' },
    { id: 'mini', lbl: '⚡ 미니대전' },
    { id: 'univm',lbl: '🏟️ 대학대전' },
    { id: 'ck',   lbl: '🤝 대학CK' },
    { id: 'pro',  lbl: '🏅 프로리그' },
    { id: 'tt',   lbl: '🎯 티어대회' },
  ];

  /* ── 전체 경기 수집 ── */
  const gc2 = (univ) => {
    if (!univ) return '#6b7280';
    const cfg = (typeof univCfg !== 'undefined' ? univCfg : []).find(u => u.name === univ);
    return cfg?.color || '#6b7280';
  };

  let all = [];

  // miniM
  (typeof miniM !== 'undefined' ? miniM : []).forEach((m, i) => {
    if (!m.a || !m.b || m.sa == null || m.sb == null) return;
    all.push({ src: 'mini', srcLabel: '⚡ 미니대전', m, i,
      aLabel: m.a, bLabel: m.b, aColor: gc2(m.a), bColor: gc2(m.b) });
  });

  // univM
  (typeof univM !== 'undefined' ? univM : []).forEach((m, i) => {
    if (!m.a || !m.b || m.sa == null || m.sb == null) return;
    all.push({ src: 'univm', srcLabel: '🏟️ 대학대전', m, i,
      aLabel: m.a, bLabel: m.b, aColor: gc2(m.a), bColor: gc2(m.b) });
  });

  // ckM
  (typeof ckM !== 'undefined' ? ckM : []).forEach((m, i) => {
    if (!m.teamAMembers || !m.teamBMembers || m.sa == null || m.sb == null) return;
    all.push({ src: 'ck', srcLabel: '🤝 대학CK', m, i,
      aLabel: m.teamALabel || 'A팀', bLabel: m.teamBLabel || 'B팀',
      aColor: '#2563eb', bColor: '#dc2626' });
  });

  // proM
  (typeof proM !== 'undefined' ? proM : []).forEach((m, i) => {
    if (!m.teamAMembers || !m.teamBMembers || m.sa == null || m.sb == null) return;
    all.push({ src: 'pro', srcLabel: '🏅 프로리그', m, i,
      aLabel: m.teamALabel || 'A팀', bLabel: m.teamBLabel || 'B팀',
      aColor: '#7c3aed', bColor: '#dc2626' });
  });

  // ttM
  (typeof ttM !== 'undefined' ? ttM : []).forEach((m, i) => {
    const la = (m.teamALabel || (m.teamAMembers ? 'A팀' : (m.a || 'A')));
    const lb = (m.teamBLabel || (m.teamBMembers ? 'B팀' : (m.b || 'B')));
    if (m.sa == null || m.sb == null) return;
    all.push({ src: 'tt', srcLabel: '🎯 티어대회', m, i,
      aLabel: la, bLabel: lb, aColor: '#d97706', bColor: '#0891b2' });
  });

  // 날짜 내림차순 정렬
  all.sort((a, b) => (b.m.d || '').localeCompare(a.m.d || ''));

  // 소스 필터
  const filtered = window._elSrc === 'all' ? all : all.filter(x => x.src === window._elSrc);
  const shown    = filtered.slice(0, window._elLimit);

  /* ── 소스 탭 ── */
  let h = `<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:12px">
    ${srcOpts.map(o => `<button class="pill ${window._elSrc===o.id?'on':''}" style="flex-shrink:0;white-space:nowrap"
      onclick="window._elSrc='${o.id}';window._elLimit=30;render()">${o.lbl}</button>`).join('')}
  </div>`;

  if (!shown.length) {
    h += `<div class="empty-state"><div class="empty-state-icon">📭</div>
      <div class="empty-state-title">최근 경기 없음</div>
      <div class="empty-state-desc">경기 데이터가 추가되면 여기에 표시됩니다</div></div>`;
    C.innerHTML = h;
    return;
  }

  /* ── 리스트 ── */
  h += `<div id="elboard-list">`;

  /* 날짜 그룹핑 */
  let lastDate = null;
  shown.forEach(({ src, srcLabel, m, i, aLabel, bLabel, aColor, bColor }) => {
    const date = m.d || '날짜미정';
    if (date !== lastDate) {
      if (lastDate !== null) h += `<div style="height:4px"></div>`;
      h += `<div style="padding:6px 0 4px;font-size:12px;font-weight:800;color:var(--text3);letter-spacing:.03em">${date}</div>`;
      lastDate = date;
    }

    const sa = Number(m.sa), sb = Number(m.sb);
    const aWin = sa > sb, bWin = sb > sa;

    // 멤버 미리보기 (CK/PRO 전용)
    const isCK = src === 'ck' || src === 'pro' || src === 'tt';
    let membersHtml = '';
    if (isCK && m.teamAMembers && m.teamBMembers) {
      const mA = (m.teamAMembers || []).slice(0, 4).map(p => p.name).join(', ');
      const mB = (m.teamBMembers || []).slice(0, 4).map(p => p.name).join(', ');
      membersHtml = `<div style="font-size:11px;color:var(--gray-l);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap">
        <span><b style="color:#2563eb">A</b> ${mA}${(m.teamAMembers||[]).length>4?'…':''}</span>
        <span><b style="color:#dc2626">B</b> ${mB}${(m.teamBMembers||[]).length>4?'…':''}</span>
      </div>`;
    } else if (!isCK && m.sets && m.sets.length) {
      // 미니/대학대전: 세트별 선수 요약
      const gameCount = m.sets.reduce((s, st) => s + (st.games ? st.games.length : (st.playerA ? 1 : 0)), 0);
      if (gameCount) membersHtml = `<div style="font-size:11px;color:var(--gray-l);margin-top:3px">${gameCount}게임</div>`;
    }

    // 대회명/티어
    const subLabel = m.n ? `<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:var(--surface);border:1px solid var(--border);color:var(--text3)">${m.n}</span>` :
      m._label ? `<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:var(--surface);border:1px solid var(--border);color:var(--text3)">${m._label}</span>` : '';

    h += `<div class="rec-summary" style="margin-bottom:6px">
      <div class="rec-sum-header" style="flex-wrap:wrap;gap:8px">
        <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:var(--surface);border:1px solid var(--border);color:var(--text3);white-space:nowrap">${srcLabel}</span>
        ${subLabel}
        <div class="rec-sum-vs" style="flex:1;min-width:200px">
          <span style="font-size:13px;font-weight:900;padding:3px 10px;border-radius:8px;color:#fff;background:${aColor};opacity:${aWin?1:.65}">${aLabel}</span>
          <div style="display:flex;align-items:center;gap:4px;font-size:18px;font-weight:900">
            <span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text3)'}">${sa}</span>
            <span style="color:var(--gray-l);font-size:13px">:</span>
            <span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text3)'}">${sb}</span>
          </div>
          <span style="font-size:13px;font-weight:900;padding:3px 10px;border-radius:8px;color:#fff;background:${bColor};opacity:${bWin?1:.65}">${bLabel}</span>
          <span style="font-size:11px;font-weight:700;color:${aWin?'#16a34a':bWin?'#16a34a':'#6b7280'}">
            ${aWin?'▶ '+aLabel+' 승':bWin?'▶ '+bLabel+' 승':'🤝 무승부'}
          </span>
        </div>
      </div>
      ${membersHtml}
    </div>`;
  });

  h += `</div>`;

  // 더보기
  if (filtered.length > window._elLimit) {
    const remain = filtered.length - window._elLimit;
    h += `<div style="text-align:center;padding:12px">
      <button class="btn btn-w" onclick="window._elLimit+=${Math.min(remain,30)};render()">
        ▼ ${remain}건 더 보기
      </button>
    </div>`;
  }

  h += `<div style="text-align:center;padding-top:4px;font-size:11px;color:var(--gray-l)">
    총 ${filtered.length}건 · 전체 ${all.length}건
  </div>`;

  C.innerHTML = h;
}
