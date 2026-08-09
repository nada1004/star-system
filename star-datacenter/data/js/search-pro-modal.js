/* ══════════════════════════════════════════════════════════════
   검색 - 프로리그 붙여넣기 모달 제어 (search-pro-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function setProFormat(n) {
  window._proFormat = n;
  const fmts = [0, 2, 3, 4];
  fmts.forEach(f => {
    const btn = document.getElementById(`pro-fmt-${f}-btn`);
    if (!btn) return;
    const on = f === n;
    btn.style.border = on ? '1.5px solid #7c3aed' : '1.5px solid var(--border2)';
    btn.style.background = on ? '#f5f3ff' : 'var(--white)';
    btn.style.color = on ? '#7c3aed' : 'var(--text3)';
    btn.style.fontWeight = on ? '900' : '700';
  });
  const hint = document.getElementById('pro-fmt-hint');
  if (hint) {
    hint.textContent = n === 0
      ? '포맷 선택 시 경기당 게임 수가 자동 그룹화됩니다'
      : `${n}:${n} 포맷 — 경기당 ${n*2}게임 (팀당 ${n}개씩) 기준으로 자동 그룹화`;
  }
  if (window._proPasteResults) proPreview();
}

/* ── 경기 구분선 삽입 ── */
function insertProMatchSep() {
  const ta = document.getElementById('pro-paste-input');
  if (!ta) return;
  const sep = '\n===경기구분===\n';
  const pos = ta.selectionStart;
  ta.value = ta.value.slice(0, pos) + sep + ta.value.slice(pos);
  ta.selectionStart = ta.selectionEnd = pos + sep.length;
  ta.focus();
  proPreview();
}

function openProPasteModal() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  const ta = document.getElementById('pro-paste-input');
  const prev = document.getElementById('pro-paste-preview');
  const applyBtn = document.getElementById('pro-apply-btn');
  const badge = document.getElementById('pro-paste-badge');
  const warn = document.getElementById('pro-paste-warn');
  const swapRow = document.getElementById('pro-swap-row');
  const multiBadge = document.getElementById('pro-multi-badge');
  if (ta) ta.value = '';
  if (prev) prev.innerHTML = '';
  if (applyBtn) applyBtn.style.display = 'none';
  if (badge) badge.style.display = 'none';
  if (warn) warn.style.display = 'none';
  if (swapRow) swapRow.style.display = 'none';
  if (multiBadge) multiBadge.style.display = 'none';
  window._proPasteResults = null;
  window._proPasteMode = 'game';
  // 팀명 입력칸 초기화
  window._proForceTeamA = null;
  window._proForceTeamB = null;
  const tlA = document.getElementById('pro-paste-team-a');
  const tlB = document.getElementById('pro-paste-team-b');
  if (tlA) tlA.value = '';
  if (tlB) tlB.value = '';
  const compNameInp = document.getElementById('pro-paste-comp-name');
  if (compNameInp) compNameInp.value = '';
  // 날짜
  const di = document.getElementById('pro-paste-date');
  if (di) di.value = new Date().toISOString().slice(0, 10); // Always reset to today
  // 경기방식·포맷 초기화
  setProPasteMode('game');
  setProFormat(0);
  om('proPasteModal');
}

function closeProPasteModal() {
  window._proPasteResults = null;
  cm('proPasteModal');
}

function setProPasteMode(mode) {
  window._proPasteMode = mode;
  const gl = document.getElementById('pro-mode-game-lbl');
  const sl = document.getElementById('pro-mode-set-lbl');
  if (gl) gl.style.cssText = mode==='game'
    ? 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1'
    : 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3)';
  if (sl) sl.style.cssText = mode==='set'
    ? 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1'
    : 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3)';
  if (window._proPasteResults) renderProPreview(window._proPasteResults);
}

