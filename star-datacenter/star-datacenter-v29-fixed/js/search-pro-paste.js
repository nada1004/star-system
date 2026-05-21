/* ═══════════════════════════════════════════════════
   프로리그 전용 붙여넣기 모달
═══════════════════════════════════════════════════ */
window._proPasteResults = null;
window._proPasteMode = 'game'; // 'game' | 'set'
window._proFormat = 0;         // 0=자유, 2/3/4=팀전 포맷

/* ── 팀전 포맷 선택 ── */
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
    ? 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1'
    : 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3)';
  if (sl) sl.style.cssText = mode==='set'
    ? 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1'
    : 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3)';
  if (window._proPasteResults) renderProPreview(window._proPasteResults);
}

function proPreview() {
  const raw = (document.getElementById('pro-paste-input')?.value || '').trim();
  if (!raw) {
    document.getElementById('pro-paste-preview').innerHTML = '';
    document.getElementById('pro-apply-btn').style.display = 'none';
    document.getElementById('pro-swap-row').style.display = 'none';
    document.getElementById('pro-paste-badge').style.display = 'none';
    window._proPasteResults = null;
    return;
  }
  // 기존 parsePasteLine / splitPasteLines / parseSetSeparator 재사용
  const lines = splitPasteLines(raw);
  const results = [];
  let currentSet = 1;
  let currentMatch = 0;  // 경기 구분선으로 나뉘는 경기 그룹 번호
  // 경기 그룹별 날짜 추적
  const matchDates = {};
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    // [승]/[패] 세트 결과 요약 라인 무시
    if (/^\[(?:승|패)\]/.test(trimmed)) return;
    if (/\((?:승|패)\)\s*\d+\s*[：:]\s*\d+\s*\((?:승|패)\)/.test(trimmed)) return;
    // 경기 구분선 감지 (===경기구분=== 등) — 새 경기 그룹 시작
    if (/경기\s*구분/.test(trimmed)) {
      currentMatch++;
      currentSet = 1;
      return;
    }
    const sepResult = parseSetSeparator(trimmed);
    if (sepResult !== null) {
      if (sepResult === 0) currentSet++;
      else currentSet = sepResult;
      const setRem = trimmed.replace(/^\d+\s*(?:세트|셋|set)\s*/i, '').trim();
      if (setRem && setRem !== trimmed) {
        const r2 = parsePasteLine(setRem);
        if (r2) {
          const wM2 = findPlayerByPartialName(r2.winName);
          const lM2 = findPlayerByPartialName(r2.loseName);
          results.push({ winName: r2.winName, loseName: r2.loseName,
            leftName: r2.leftName||r2.winName, rightName: r2.rightName||r2.loseName,
            map: r2.map||'-', setNum: currentSet, matchGroup: currentMatch,
            wPlayer: wM2.player, lPlayer: lM2.player,
            wCandidates: wM2.candidates, lCandidates: lM2.candidates,
            wSimilar: wM2.similar||[], lSimilar: lM2.similar||[], lineNum: idx+1 });
        }
      }
      return;
    }
    // 날짜 줄 감지 → 현재 경기 그룹 날짜로 저장
    const _proDateM = trimmed.match(/^(?:일자|날짜)\s*[:：]\s*(\d{4}-\d{2}-\d{2})/);
    if (_proDateM) {
      matchDates[currentMatch] = _proDateM[1];
      // 첫 번째 경기면 날짜 입력창도 업데이트
      if (currentMatch === 0) {
        const _pdi = document.getElementById('pro-paste-date');
        if (_pdi) _pdi.value = _proDateM[1];
      }
      return;
    }
    const parsed = parsePasteLine(line);
    if (!parsed) return;
    // 이름으로 선수 찾기
    const wMatch = findPlayerByPartialName(parsed.winName);
    const lMatch = findPlayerByPartialName(parsed.loseName);
    results.push({
      winName: parsed.winName, loseName: parsed.loseName,
      leftName: parsed.leftName || parsed.winName, rightName: parsed.rightName || parsed.loseName,
      map: parsed.map || '-', setNum: currentSet, matchGroup: currentMatch,
      wPlayer: wMatch.player, lPlayer: lMatch.player,
      wCandidates: wMatch.candidates, lCandidates: lMatch.candidates,
      wSimilar: wMatch.similar||[], lSimilar: lMatch.similar||[],
      lineNum: idx+1
    });
  });
  // 경기 그룹별 날짜를 결과에 반영
  window._proMatchDates = matchDates;
  // 기존 선택 복원: 사용자가 이미 유사이름을 선택한 경우 재파싱 시 유지
  if (window._proPasteResults && window._proPasteResults.length === results.length) {
    results.forEach((r, i) => {
      const prev = window._proPasteResults[i];
      if (!prev) return;
      // 같은 라인이면 이전 선택 복원
      if (prev.winName === r.winName && prev.loseName === r.loseName) {
        if (prev.wPlayer && !r.wPlayer) { r.wPlayer = prev.wPlayer; r.wCandidates = prev.wCandidates; r.wSimilar = prev.wSimilar; }
        if (prev.lPlayer && !r.lPlayer) { r.lPlayer = prev.lPlayer; r.lCandidates = prev.lCandidates; r.lSimilar = prev.lSimilar; }
        if (prev.map && prev.map !== '-' && (r.map === '-' || !r.map)) r.map = prev.map;
        if (prev.setNum) r.setNum = prev.setNum;
      }
    });
  }
  // 파싱 결과가 비었는데 textarea에 내용이 있고 이전 결과가 있으면 인식창 유지
  if (results.length === 0 && raw.trim()) {
    const prev = window._proPasteResults;
    if (prev && prev.length > 0) return;
  }
  window._proPasteResults = results;
  renderProPreview(results);
}

function renderProPreview(results) {
  const previewEl = document.getElementById('pro-paste-preview');
  const applyBtn = document.getElementById('pro-apply-btn');
  const badge = document.getElementById('pro-paste-badge');
  const swapRow = document.getElementById('pro-swap-row');
  const warn = document.getElementById('pro-paste-warn');
  if (!previewEl) return;
  if (!results || !results.length) {
    previewEl.innerHTML = '';
    if(applyBtn) applyBtn.style.display='none';
    if(swapRow) swapRow.style.display='none';
    if(badge) badge.style.display='none';
    return;
  }

  const savable = results.filter(r => r.wPlayer && r.lPlayer);
  const needPick = results.filter(r => (r.wCandidates?.length>1||r.lCandidates?.length>1) && !(r.wPlayer&&r.lPlayer));
  if (badge) {
    badge.style.display = 'inline';
    badge.textContent = `✅ ${savable.length}/${results.length}건 인식`;
    badge.style.background = savable.length===results.length?'#dcfce7':'#fef9c3';
    badge.style.color = savable.length===results.length?'#16a34a':'#b45309';
    badge.style.border = `1px solid ${savable.length===results.length?'#bbf7d0':'#fcd34d'}`;
  }
  if (warn) warn.style.display = needPick.length ? 'inline' : 'none';

  const allMaps = [...new Set([...maps.filter(m=>m&&m!=='-'), ...results.map(r=>r.map).filter(m=>m&&m!=='-')])].sort();
  const maxSet = Math.max(...results.map(r=>r.setNum||1), 1);
  const fmt = window._proFormat || 0;
  const fmtLabel = fmt > 0 ? `${fmt}:${fmt}` : '';

  // ── matchGroup별로 결과 분리 ──
  const matchGroupNums = [...new Set(results.map(r => r.matchGroup||0))].sort((a,b)=>a-b);
  const isMultiMatch = matchGroupNums.length > 1;

  // 행 렌더링 헬퍼 (matchGroup에 속하는 results의 글로벌 인덱스 i를 사용)
  const renderRow = (r, i) => {
    const wOk = !!r.wPlayer;
    const lOk = !!r.lPlayer;
    const wAmbig = !wOk && (r.wCandidates?.length > 1);
    const lAmbig = !lOk && (r.lCandidates?.length > 1);
    const ok = wOk && lOk;

    const leftRaw  = r.leftName  || r.winName  || '';
    const rightRaw = r.rightName || r.loseName || '';
    const isLeftWinner = (leftRaw === r.winName);

    const leftPlayer  = (wOk && r.wPlayer.name === leftRaw)  ? r.wPlayer
                      : (lOk && r.lPlayer.name === leftRaw)  ? r.lPlayer : null;
    const rightPlayer = (lOk && r.lPlayer.name === rightRaw) ? r.lPlayer
                      : (wOk && r.wPlayer.name === rightRaw) ? r.wPlayer : null;

    const leftRole  = leftRaw  === (r.winName||'')  ? 'w' : 'l';
    const rightRole = rightRaw === (r.loseName||'') ? 'l' : 'w';
    const leftSim   = leftRole  === 'w' ? (r.wSimilar||[]) : (r.lSimilar||[]);
    const rightSim  = rightRole === 'l' ? (r.lSimilar||[]) : (r.wSimilar||[]);
    const leftCands  = leftRole  === 'w' ? (r.wCandidates||[]) : (r.lCandidates||[]);
    const rightCands = rightRole === 'l' ? (r.lCandidates||[]) : (r.wCandidates||[]);
    const leftAmbig  = !leftPlayer  && leftCands.length > 1;
    const rightAmbig = !rightPlayer && rightCands.length > 1;

    const aName = leftPlayer  ? leftPlayer.name  : leftRaw;
    const bName = rightPlayer ? rightPlayer.name : rightRaw;

    const ho = (bg,def) => `onmouseover="this.style.background='${bg}'" onmouseout="this.style.background='${def}'"`;
    const winBadge  = `<span style="font-size:10px;color:#16a34a;font-weight:700;background:#dcfce7;border:1px solid #86efac;border-radius:4px;padding:1px 5px">승</span>`;
    const loseBadge = `<span style="font-size:10px;color:#dc2626;font-weight:700;background:#fee2e2;border:1px solid #fca5a5;border-radius:4px;padding:1px 5px">패</span>`;

    const buildACell = () => {
      if (leftPlayer) {
        return `<div style="display:inline-flex;align-items:center;gap:6px">
          <button class="pro-name-flip" data-idx="${i}" ${ho('#bfdbfe','#dbeafe')}
            style="font-size:13px;font-weight:900;color:#1d4ed8;background:#dbeafe;border:1.5px solid #93c5fd;border-radius:8px;padding:3px 10px;cursor:pointer;white-space:nowrap">
            ${aName}</button>${isLeftWinner ? winBadge : loseBadge}</div>`;
      }
      if (leftAmbig) {
        return `<div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-size:11px;color:#b45309;font-weight:700">${aName}</span>
          <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${leftCands.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${leftRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#fef3c7','#fffbeb')} style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:11px;font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div></div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:3px">
        <input value="${aName}" data-idx="${i}" data-role="${leftRole}" onchange="proEditName(this,${i},'${leftRole}')"
          style="width:90px;border:1px solid #fca5a5;border-radius:5px;padding:2px 6px;font-size:12px;font-weight:700;color:#dc2626;background:#fff5f5" placeholder="선수명">
        ${leftSim.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">
          <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>
          ${leftSim.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${leftRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#ede9fe','#faf5ff')} style="padding:2px 8px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:11px;font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div>` : ''}
      </div>`;
    };

    const buildBCell = () => {
      if (rightPlayer) {
        return `<div style="display:inline-flex;align-items:center;gap:6px">
          <button class="pro-name-flip" data-idx="${i}" ${ho('#fecaca','#fee2e2')}
            style="font-size:13px;font-weight:900;color:#991b1b;background:#fee2e2;border:1.5px solid #fca5a5;border-radius:8px;padding:3px 10px;cursor:pointer;white-space:nowrap">
            ${bName}</button>${isLeftWinner ? loseBadge : winBadge}</div>`;
      }
      if (rightAmbig) {
        return `<div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-size:11px;color:#b45309;font-weight:700">${bName}</span>
          <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${rightCands.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${rightRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#fef3c7','#fffbeb')} style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:11px;font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div></div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:3px">
        <input value="${bName}" data-idx="${i}" data-role="${rightRole}" onchange="proEditName(this,${i},'${rightRole}')"
          style="width:90px;border:1px solid #fca5a5;border-radius:5px;padding:2px 6px;font-size:12px;font-weight:700;color:#dc2626;background:#fff5f5" placeholder="선수명">
        ${rightSim.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">
          <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>
          ${rightSim.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${rightRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#ede9fe','#faf5ff')} style="padding:2px 8px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:11px;font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div>` : ''}
      </div>`;
    };

    const mapOpts = `<option value="-">-</option>` +
      allMaps.map(m=>`<option value="${m}" ${m===r.map?'selected':''}>${m}</option>`).join('') +
      `<option value="__custom__">직접입력...</option>`;
    const mapCell = `<select class="pro-map-sel" data-idx="${i}"
      style="width:80px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:11px">${mapOpts}</select>`;

    let setOpts='';
    for(let s=1;s<=Math.max(maxSet,3);s++) setOpts+=`<option value="${s}" ${s===(r.setNum||1)?'selected':''}>${s}세트</option>`;
    const setCell = `<select class="pro-set-sel" data-idx="${i}"
      style="width:56px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:11px">${setOpts}</select>`;

    const flipBtn = `<button class="pro-flip-btn" data-idx="${i}" title="A팀↔B팀 교체"
      style="padding:3px 6px;border-radius:5px;border:1px solid #ddd6fe;background:#f5f3ff;font-size:13px;cursor:pointer;transition:.12s"
      onmouseover="this.style.background='#ede9fe'" onmouseout="this.style.background='#f5f3ff'">⇄</button>`;

    const statusBadge = ok
      ? `<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">✓저장</span>`
      : (wAmbig||lAmbig)
        ? `<span style="background:#fef9c3;color:#b45309;border:1px solid #fcd34d;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">선택↑</span>`
        : `<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">미인식</span>`;

    const delBtn = `<button class="pro-del-btn" data-idx="${i}"
      style="padding:3px 6px;border-radius:5px;border:1px solid #fecaca;background:#fff5f5;font-size:12px;cursor:pointer;transition:.12s"
      onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fff5f5'">🗑</button>`;

    const rowBg = ok ? '#f8faff' : (wAmbig||lAmbig) ? '#fffbeb' : '#fff8f8';
    return `<tr style="background:${rowBg};border-bottom:1px solid #f0f0f0">
      <td style="padding:5px 6px">${setCell}</td>
      <td style="padding:5px 6px">${mapCell}</td>
      <td style="padding:5px 10px">${buildACell()}</td>
      <td style="padding:5px 4px;text-align:center">${flipBtn}</td>
      <td style="padding:5px 10px">${buildBCell()}</td>
      <td style="padding:5px 5px">${statusBadge}</td>
      <td style="padding:5px 4px;text-align:center">${delBtn}</td>
    </tr>`;
  };

  // ── matchGroup별 점수 요약 헬퍼 ──
  const renderGroupSummary = (groupRows) => {
    const gSavable = groupRows.filter(r => r.wPlayer && r.lPlayer);
    if (!gSavable.length) return '';
    const mode = window._proPasteMode || 'game';
    const setMap2 = {};
    gSavable.forEach(r => {
      const sn = r.setNum||1;
      if(!setMap2[sn]) setMap2[sn]={A:0,B:0};
      const leftN = r.leftName || r.winName;
      const isLeftWinner = (leftN === r.winName);
      if (isLeftWinner) setMap2[sn].A++; else setMap2[sn].B++;
    });
    const multiSet = Object.keys(setMap2).length > 1;
    let sa=0, sb=0;
    const setRows = Object.keys(setMap2).sort((a,b)=>a-b).map(sn=>{
      const s=setMap2[sn]; const sw=s.A>s.B?'A':s.B>s.A?'B':'';
      if(sw==='A') sa++; else if(sw==='B') sb++;
      return `<span style="display:inline-flex;align-items:center;gap:4px;background:${sw?'#f0fdf4':'#f8fafc'};border:1px solid ${sw?'#86efac':'#e2e8f0'};border-radius:8px;padding:3px 10px;font-size:12px">
        <span style="font-size:10px;color:var(--gray-l);font-weight:600">${sn}세트</span>
        <span style="font-weight:800;color:${sw==='A'?'#1d4ed8':'#64748b'}">${s.A}</span>:
        <span style="font-weight:800;color:${sw==='B'?'#16a34a':'#64748b'}">${s.B}</span>
        ${sw?`<span style="font-size:10px;font-weight:700;color:#16a34a">${sw}조 ✓</span>`:''}
      </span>`;
    }).join('');
    const totalA = (mode==='set'||multiSet) ? sa : Object.values(setMap2).reduce((s,v)=>s+v.A,0);
    const totalB = (mode==='set'||multiSet) ? sb : Object.values(setMap2).reduce((s,v)=>s+v.B,0);
    const winner = totalA>totalB?'🔵 A팀':totalB>totalA?'🔴 B팀':'무승부';
    const fmtBadge = fmtLabel ? `<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:#ede9fe;color:#6d28d9;border:1px solid #c4b5fd;font-weight:700">${fmtLabel}</span>` : '';
    return `<div style="padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:${multiSet?'6px':'0'}">
        ${fmtBadge}
        <span style="font-size:11px;font-weight:700;color:var(--text3)">📊 결과${multiSet?' (세트제)':''}</span>
        ${multiSet?'':'<span style="flex:1"></span>'}
        ${!multiSet?`<span style="font-weight:900;font-size:14px;color:#1d4ed8">🔵 A팀</span>
        <span style="font-weight:900;font-size:18px;color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
        <span style="font-size:12px;color:var(--gray-l)">:</span>
        <span style="font-weight:900;font-size:18px;color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
        <span style="font-weight:900;font-size:14px;color:#dc2626">🔴 B팀</span>
        <span style="font-size:12px;font-weight:700;padding:2px 10px;border-radius:10px;background:${totalA===totalB?'#f1f5f9':'#dcfce7'};color:${totalA===totalB?'#64748b':'#15803d'}">${totalA===totalB?'🤝 무승부':'🏆 '+winner+' 승'}</span>`:''}
      </div>
      ${multiSet?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px">${setRows}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-weight:900;font-size:14px;color:#1d4ed8">🔵 A팀</span>
        <span style="font-weight:900;font-size:18px;color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
        <span style="font-size:12px;color:var(--gray-l)">:</span>
        <span style="font-weight:900;font-size:18px;color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
        <span style="font-weight:900;font-size:14px;color:#dc2626">🔴 B팀</span>
        <span style="font-size:12px;font-weight:700;padding:2px 10px;border-radius:10px;background:${totalA===totalB?'#f1f5f9':'#dcfce7'};color:${totalA===totalB?'#64748b':'#15803d'}">${totalA===totalB?'🤝 무승부':'🏆 '+winner+' 승'}</span>
      </div>`:''}
    </div>`;
  };

  // ── 경기 그룹별 HTML 빌드 ──
  let html = '';
  matchGroupNums.forEach(mg => {
    const groupRows = results.map((r,i) => ({r,i})).filter(({r}) => (r.matchGroup||0) === mg);
    if (!groupRows.length) return;
    const dateVal = (window._proMatchDates||{})[mg] || document.getElementById('pro-paste-date')?.value || '';
    if (isMultiMatch) {
      html += `<div style="margin-bottom:10px;border:2px solid #7c3aed;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(90deg,#5b21b6,#7c3aed);color:#fff;padding:7px 14px;display:flex;align-items:center;gap:8px">
          <span style="font-size:13px;font-weight:900">🏅 경기 ${mg+1}</span>
          ${dateVal?`<span style="font-size:11px;opacity:.8">${dateVal}</span>`:''}
          ${fmtLabel?`<span style="font-size:11px;background:rgba(255,255,255,.2);border-radius:8px;padding:1px 7px">${fmtLabel}</span>`:''}
        </div>`;
    }
    html += `<div style="${isMultiMatch?'padding:8px 10px':'border:1px solid #ddd6fe;border-radius:10px;overflow:hidden;margin-bottom:10px'}">
    <table style="margin:0;width:100%;font-size:12px;border-collapse:collapse">
    <thead><tr style="background:${isMultiMatch?'#f5f3ff':'linear-gradient(90deg,#5b21b6,#7c3aed)'};color:${isMultiMatch?'#5b21b6':'#fff'}">
      <th style="padding:6px 8px;font-size:10px;width:56px">세트</th>
      <th style="padding:6px 8px;font-size:10px;width:84px">맵</th>
      <th style="padding:6px 10px;font-size:11px;font-weight:900">🔵 A팀</th>
      <th style="padding:6px 4px;font-size:10px;width:44px;text-align:center">교체</th>
      <th style="padding:6px 10px;font-size:11px;font-weight:900">🔴 B팀</th>
      <th style="padding:6px 4px;font-size:10px;width:56px">상태</th>
      <th style="padding:6px 4px;font-size:10px;width:32px;text-align:center">삭제</th>
    </tr></thead><tbody>`;
    groupRows.forEach(({r,i}) => { html += renderRow(r, i); });
    html += `</tbody></table></div>`;
    html += renderGroupSummary(groupRows.map(({r})=>r));
    if (isMultiMatch) html += `</div>`;
  });

  // ── DOM 업데이트 ──
  previewEl.innerHTML = html;

  // ── 이벤트 등록 ──

  // 이름 클릭 → 승패 교체
  previewEl.querySelectorAll('.pro-name-flip').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      const r = window._proPasteResults?.[idx];
      if (!r) return;
      [r.winName, r.loseName] = [r.loseName, r.winName];
      [r.wPlayer, r.lPlayer] = [r.lPlayer, r.wPlayer];
      [r.wCandidates, r.lCandidates] = [r.lCandidates||[], r.wCandidates||[]];
      [r.wSimilar, r.lSimilar] = [r.lSimilar||[], r.wSimilar||[]];
      renderProPreview(window._proPasteResults);
    });
  });

  // 픽 버튼 (중복/유사이름)
  previewEl.querySelectorAll('.pro-pick-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      const role = this.dataset.role;
      const name = this.dataset.name;
      if (!window._proPasteResults?.[idx]) return;
      const r = window._proPasteResults[idx];
      const p = players.find(pl => pl.name === name);
      if (!p) return;

      // 별칭 자동 저장
      const origName = role==='w' ? r.winName : r.loseName;
      if (origName && origName !== p.name) {
        const memos = (p.memo||'').split(/[\s,\n]+/).map(s=>s.trim()).filter(Boolean);
        if (!memos.includes(origName)) {
          p.memo = memos.length ? p.memo + ' ' + origName : origName;
          save();
          const toast = document.createElement('div');
          toast.textContent = `✅ "${origName}" → "${p.name}" 자동 인식 등록됨`;
          Object.assign(toast.style, {position:'fixed',bottom:'76px',left:'50%',transform:'translateX(-50%)',background:'#1e3a8a',color:'#fff',padding:'9px 18px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',zIndex:'99999',opacity:'0',transition:'opacity .25s',whiteSpace:'nowrap'});
          document.body.appendChild(toast);
          requestAnimationFrame(()=>{ toast.style.opacity='1'; });
          setTimeout(()=>{ toast.style.opacity='0'; setTimeout(()=>toast.remove(),300); },2800);
        }
      }

      if (role==='w') {
        r.winName = p.name; r.wPlayer = p; r.wCandidates = [p]; r.wSimilar = [];
      } else {
        r.loseName = p.name; r.lPlayer = p; r.lCandidates = [p]; r.lSimilar = [];
      }

      // 다른 행에서 같은 선수 후보 있으면 자동 선택
      window._proPasteResults.forEach((row, ri) => {
        if (ri === idx) return;
        if (!row.wPlayer && (row.winName===origName || row.wCandidates?.some(c=>c.name===p.name) || row.wSimilar?.some(c=>c.name===p.name))) {
          row.winName=p.name; row.wPlayer=p; row.wCandidates=[p]; row.wSimilar=[];
        }
        if (!row.lPlayer && (row.loseName===origName || row.lCandidates?.some(c=>c.name===p.name) || row.lSimilar?.some(c=>c.name===p.name))) {
          row.loseName=p.name; row.lPlayer=p; row.lCandidates=[p]; row.lSimilar=[];
        }
      });

      renderProPreview(window._proPasteResults);
    });
  });

  // 전체 교체 버튼
  previewEl.querySelectorAll('.pro-flip-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      const r = window._proPasteResults?.[idx];
      if (!r) return;
      [r.winName, r.loseName] = [r.loseName, r.winName];
      [r.wPlayer, r.lPlayer] = [r.lPlayer, r.wPlayer];
      [r.wCandidates, r.lCandidates] = [r.lCandidates||[], r.wCandidates||[]];
      [r.wSimilar, r.lSimilar] = [r.lSimilar||[], r.wSimilar||[]];
      renderProPreview(window._proPasteResults);
    });
  });

  // 세트 드롭다운
  previewEl.querySelectorAll('.pro-set-sel').forEach(sel => {
    sel.addEventListener('change', function() {
      const idx = parseInt(this.dataset.idx);
      if (window._proPasteResults?.[idx]) {
        window._proPasteResults[idx].setNum = parseInt(this.value);
        renderProPreview(window._proPasteResults);
      }
    });
  });

  // 맵 드롭다운
  previewEl.querySelectorAll('.pro-map-sel').forEach(sel => {
    sel.addEventListener('change', function() {
      const idx = parseInt(this.dataset.idx);
      if (!window._proPasteResults?.[idx]) return;
      if (this.value === '__custom__') {
        const custom = prompt('맵 이름을 직접 입력하세요:');
        if (custom && custom.trim()) {
          window._proPasteResults[idx].map = custom.trim();
          if (!maps.includes(custom.trim())) { maps.push(custom.trim()); save(); }
        }
      } else {
        window._proPasteResults[idx].map = this.value;
        // 맵 별칭 학습
        const rawMap = window._proPasteResults[idx]._rawMapStr;
        if (rawMap && this.value && this.value !== '-' && rawMap !== this.value) {
          if (!userMapAlias) userMapAlias = {};
          if (!userMapAlias[rawMap]) { userMapAlias[rawMap] = this.value; save(); }
        }
      }
      renderProPreview(window._proPasteResults);
    });
  });

  // 삭제 버튼
  previewEl.querySelectorAll('.pro-del-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.idx);
      window._proPasteResults?.splice(idx, 1);
      renderProPreview(window._proPasteResults);
    });
  });

  // 스왑 로우
  if (swapRow) swapRow.style.display = results && results.length > 0 ? 'flex' : 'none';
  if (applyBtn) {
    applyBtn.style.display = results && results.length > 0 ? 'inline-flex' : 'none';
    applyBtn.textContent = `✅ ${savable.length}건 프로리그에 저장`;
  }
}

function proEditName(input, idx, role) {
  const name = input.value.trim();
  if (!name || !window._proPasteResults) return;
  const m = findPlayerByPartialName(name);
  const r = window._proPasteResults[idx];
  if (!r) return;
  if (role==='w') {
    r.wPlayer = m.player; r.winName = name;
    r.wCandidates = m.candidates; r.wSimilar = m.similar||[];
  } else {
    r.lPlayer = m.player; r.loseName = name;
    r.lCandidates = m.candidates; r.lSimilar = m.similar||[];
  }
  // 맵 별칭 학습: 입력된 이름과 실제 맵 이름이 다르면 alias에 추가
  renderProPreview(window._proPasteResults);
}

function swapProTeams() {
  if (!window._proPasteResults) return;
  window._proPasteResults = window._proPasteResults.map(r => ({
    ...r,
    winName: r.loseName, loseName: r.winName,
    wPlayer: r.lPlayer, lPlayer: r.wPlayer,
    wCandidates: r.lCandidates||[], lCandidates: r.wCandidates||[],
    wSimilar: r.lSimilar||[], lSimilar: r.wSimilar||[],
  }));
  renderProPreview(window._proPasteResults);
}

function proApply() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  if (!window._proPasteResults) return;
  const savable = window._proPasteResults.filter(r => r.wPlayer && r.lPlayer);
  if (!savable.length) return alert('저장 가능한 경기가 없습니다.');
  const defaultDate = document.getElementById('pro-paste-date')?.value || new Date().toISOString().slice(0,10);
  const mode = window._proPasteMode || 'game';
  const fmt = window._proFormat || 0;

  // (요청사항) 프로리그 자동인식 저장 전 중복 확인
  const _toAdd = savable.map(r => {
    const d = (window._proMatchDates||{})[(r.matchGroup||0)] || defaultDate;
    const leftN = r.leftName || r.winName;
    const rightN = r.rightName || r.loseName;
    const isLeftWinner = (leftN === r.winName);
    const w = isLeftWinner ? leftN : rightN;
    const l = isLeftWinner ? rightN : leftN;
    return { mode:'pro', d, w, l, map: r.map || '' };
  });
  if (!_confirmDupBeforeSave(_toAdd)) return;

  // A조/B조 판별 헬퍼
  const resolveTeam = (r) => {
    const leftN = r.leftName || r.winName;
    const rightN = r.rightName || r.loseName;
    const leftPlayerObj = players.find(p => p.name === leftN) || r.wPlayer;
    const rightPlayerObj = players.find(p => p.name === rightN) || r.lPlayer;
    const playerA = leftPlayerObj || r.wPlayer;
    const playerB = rightPlayerObj || r.lPlayer;
    const isLeftWinner = (leftN === r.winName);
    return { playerA, playerB, winner: isLeftWinner ? 'A' : 'B' };
  };

  // matchGroup별로 그룹핑
  const matchGroupNums = [...new Set(savable.map(r => r.matchGroup||0))].sort((a,b)=>a-b);
  let totalSaved = 0;

  matchGroupNums.forEach(mg => {
    const groupRows = savable.filter(r => (r.matchGroup||0) === mg);
    if (!groupRows.length) return;
    const matchId = genId();
    const dateVal = (window._proMatchDates||{})[mg] || defaultDate;

    // setsSnap 구성
    const setMap2 = {};
    groupRows.forEach(r => {
      const sn = r.setNum||1;
      if(!setMap2[sn]) setMap2[sn]=[];
      setMap2[sn].push(r);
    });
    const setsSnap = Object.keys(setMap2).sort((a,b)=>a-b).map(sn => {
      const rows = setMap2[sn];
      const games = rows.map(r => {
        const t = resolveTeam(r);
        return { playerA: t.playerA.name, playerB: t.playerB.name, map: r.map||'-', winner: t.winner };
      });
      const scoreA = games.filter(g=>g.winner==='A').length;
      const scoreB = games.filter(g=>g.winner==='B').length;
      const setWinner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'A';
      return { scoreA, scoreB, winner: setWinner, games };
    });

    // 경기방식 스코어
    const isMultiSet = Object.keys(setMap2).length > 1;
    let sa, sb;
    if (mode==='set' || isMultiSet) {
      sa = setsSnap.filter(s=>s.winner==='A').length;
      sb = setsSnap.filter(s=>s.winner==='B').length;
    } else {
      sa = setsSnap.reduce((s,st)=>s+st.scoreA,0);
      sb = setsSnap.reduce((s,st)=>s+st.scoreB,0);
    }

    // A조/B조 멤버 목록
    const mA=[], mB=[];
    groupRows.forEach(r => {
      const t = resolveTeam(r);
      if(!mA.find(x=>x.name===t.playerA.name)) mA.push({name:t.playerA.name,univ:t.playerA.univ||'',race:t.playerA.race||'',tier:t.playerA.tier||''});
      if(!mB.find(x=>x.name===t.playerB.name)) mB.push({name:t.playerB.name,univ:t.playerB.univ||'',race:t.playerB.race||'',tier:t.playerB.tier||''});
    });

    proM.unshift({_id:matchId, d:dateVal, sa, sb,
      teamALabel:'A팀', teamBLabel:'B팀',
      teamAMembers:mA, teamBMembers:mB,
      sets:setsSnap, univWins:{}, univLosses:{},
      ...(fmt > 0 ? {fmt} : {})
    });
    totalSaved += groupRows.length;
  });

  if (typeof fixPoints==='function') fixPoints();
  save();
  if (typeof syncProM==='function') syncProM();
  render();
  closeProPasteModal();

  // 프로리그 탭으로 이동
  if(typeof window._goTopTab === 'function') window._goTopTab('pro');

  // 성공 토스트
  const matchCount = matchGroupNums.length;
  const toast = document.createElement('div');
  toast.textContent = matchCount > 1
    ? `✅ ${matchCount}경기 (${totalSaved}게임) 프로리그 저장 완료!`
    : `✅ ${totalSaved}건 프로리그 저장 완료!`;
  toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(), 2800);
}
