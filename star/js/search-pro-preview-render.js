/* ══════════════════════════════════════════════════════════════
   검색 - 프로리그 미리보기 렌더 (search-pro-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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

  const isSavableRow = (r) => {
    if (r?.isTeam) {
      const lp = Array.isArray(r.leftPlayers) ? r.leftPlayers : [];
      const rp = Array.isArray(r.rightPlayers) ? r.rightPlayers : [];
      return lp.length === 2 && rp.length === 2 && lp.every(Boolean) && rp.every(Boolean) && (r.winnerSide === 'L' || r.winnerSide === 'R');
    }
    return !!(r?.wPlayer && r?.lPlayer);
  };
  const isNeedPickRow = (r) => {
    if (r?.isTeam) {
      if (isSavableRow(r)) return false;
      const metas = [...(r.leftMeta||[]), ...(r.rightMeta||[])];
      return metas.some(m => (m?.candidates?.length||0) > 1);
    }
    return (r?.wCandidates?.length>1 || r?.lCandidates?.length>1) && !(r?.wPlayer && r?.lPlayer);
  };
  const savable = results.filter(isSavableRow);
  const needPick = results.filter(isNeedPickRow);
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
    const ok = isSavableRow(r);
    const isTeam = !!r.isTeam;
    const wOk = !isTeam && !!r.wPlayer;
    const lOk = !isTeam && !!r.lPlayer;
    const wAmbig = !isTeam && !wOk && (r.wCandidates?.length > 1);
    const lAmbig = !isTeam && !lOk && (r.lCandidates?.length > 1);

    const leftRaw  = r.leftName  || r.winName  || '';
    const rightRaw = r.rightName || r.loseName || '';
    const isLeftWinner = isTeam ? (r.winnerSide === 'L') : (leftRaw === r.winName);

    const leftPlayer  = (!isTeam && wOk && r.wPlayer.name === leftRaw)  ? r.wPlayer
                      : (!isTeam && lOk && r.lPlayer.name === leftRaw)  ? r.lPlayer : null;
    const rightPlayer = (!isTeam && lOk && r.lPlayer.name === rightRaw) ? r.lPlayer
                      : (!isTeam && wOk && r.wPlayer.name === rightRaw) ? r.wPlayer : null;

    const leftRole  = leftRaw  === (r.winName||'')  ? 'w' : 'l';
    const rightRole = rightRaw === (r.loseName||'') ? 'l' : 'w';
    const leftSim   = leftRole  === 'w' ? (r.wSimilar||[]) : (r.lSimilar||[]);
    const rightSim  = rightRole === 'l' ? (r.lSimilar||[]) : (r.wSimilar||[]);
    const leftCands  = leftRole  === 'w' ? (r.wCandidates||[]) : (r.lCandidates||[]);
    const rightCands = rightRole === 'l' ? (r.lCandidates||[]) : (r.wCandidates||[]);
    const leftAmbig  = !isTeam && !leftPlayer  && leftCands.length > 1;
    const rightAmbig = !isTeam && !rightPlayer && rightCands.length > 1;

    const aName = leftPlayer  ? leftPlayer.name  : leftRaw;
    const bName = rightPlayer ? rightPlayer.name : rightRaw;

    const ho = (bg,def) => `onmouseover="this.style.background='${bg}'" onmouseout="this.style.background='${def}'"`;
    const winBadge  = `<span style="font-size:10px;color:#16a34a;font-weight:700;background:#dcfce7;border:1px solid #86efac;border-radius:4px;padding:1px 5px">승</span>`;
    const loseBadge = `<span style="font-size:10px;color:#dc2626;font-weight:700;background:#fee2e2;border:1px solid #fca5a5;border-radius:4px;padding:1px 5px">패</span>`;

    const buildTeamCell = (sideKey) => {
      const isLeft = sideKey === 'L';
      const names = isLeft ? (r.leftNames||[]) : (r.rightNames||[]);
      const playersArr = isLeft ? (r.leftPlayers||[]) : (r.rightPlayers||[]);
      const bOk0 = !!playersArr?.[0];
      const bOk1 = !!playersArr?.[1];
      const winLose = isLeftWinner === isLeft ? winBadge : loseBadge;
      const v0 = names?.[0] || '';
      const v1 = names?.[1] || '';
      return `<div style="display:flex;flex-direction:column;gap:4px">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:var(--fs-caption);font-weight:800;color:${isLeft?'#1d4ed8':'#991b1b'}">${isLeft?'A팀':'B팀'}</span>
          ${winLose}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <input value="${v0}" onchange="proEditTeamName(this,${i},'${sideKey}',0)"
            style="width:90px;border:1px solid ${bOk0?'#86efac':'#fca5a5'};border-radius:6px;padding:2px 6px;font-size:var(--fs-sm);font-weight:800;color:${bOk0?'#14532d':'#dc2626'};background:#fff" placeholder="선수1">
          <input value="${v1}" onchange="proEditTeamName(this,${i},'${sideKey}',1)"
            style="width:90px;border:1px solid ${bOk1?'#86efac':'#fca5a5'};border-radius:6px;padding:2px 6px;font-size:var(--fs-sm);font-weight:800;color:${bOk1?'#14532d':'#dc2626'};background:#fff" placeholder="선수2">
        </div>
      </div>`;
    };

    const buildACell = () => {
      if (isTeam) return buildTeamCell('L');
      if (leftPlayer) {
        return `<div style="display:inline-flex;align-items:center;gap:6px">
          <button class="pro-name-flip" data-idx="${i}" ${ho('#bfdbfe','#dbeafe')}
            style="font-size:var(--fs-base);font-weight:900;color:#1d4ed8;background:#dbeafe;border:1.5px solid #93c5fd;border-radius:8px;padding:3px 10px;cursor:pointer;white-space:nowrap">
            ${aName}</button>${isLeftWinner ? winBadge : loseBadge}</div>`;
      }
      if (leftAmbig) {
        return `<div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-size:var(--fs-caption);color:#b45309;font-weight:700">${aName}</span>
          <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${leftCands.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${leftRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#fef3c7','#fffbeb')} style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div></div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:3px">
        <input value="${aName}" data-idx="${i}" data-role="${leftRole}" onchange="proEditName(this,${i},'${leftRole}')"
          style="width:90px;border:1px solid #fca5a5;border-radius:5px;padding:2px 6px;font-size:var(--fs-sm);font-weight:700;color:#dc2626;background:#fff5f5" placeholder="선수명">
        ${leftSim.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">
          <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>
          ${leftSim.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${leftRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#ede9fe','#faf5ff')} style="padding:2px 8px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div>` : ''}
      </div>`;
    };

    const buildBCell = () => {
      if (isTeam) return buildTeamCell('R');
      if (rightPlayer) {
        return `<div style="display:inline-flex;align-items:center;gap:6px">
          <button class="pro-name-flip" data-idx="${i}" ${ho('#fecaca','#fee2e2')}
            style="font-size:var(--fs-base);font-weight:900;color:#991b1b;background:#fee2e2;border:1.5px solid #fca5a5;border-radius:8px;padding:3px 10px;cursor:pointer;white-space:nowrap">
            ${bName}</button>${isLeftWinner ? loseBadge : winBadge}</div>`;
      }
      if (rightAmbig) {
        return `<div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-size:var(--fs-caption);color:#b45309;font-weight:700">${bName}</span>
          <div style="display:flex;flex-wrap:wrap;gap:3px">
          ${rightCands.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${rightRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#fef3c7','#fffbeb')} style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div></div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:3px">
        <input value="${bName}" data-idx="${i}" data-role="${rightRole}" onchange="proEditName(this,${i},'${rightRole}')"
          style="width:90px;border:1px solid #fca5a5;border-radius:5px;padding:2px 6px;font-size:var(--fs-sm);font-weight:700;color:#dc2626;background:#fff5f5" placeholder="선수명">
        ${rightSim.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">
          <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>
          ${rightSim.map(c=>`<button class="pro-pick-btn" data-idx="${i}" data-role="${rightRole}" data-name="${c.name.replace(/"/g,'&quot;')}"
            ${ho('#ede9fe','#faf5ff')} style="padding:2px 8px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${c.name}</button>`).join('')}
          </div>` : ''}
      </div>`;
    };

    const mapOpts = `<option value="-">-</option>` +
      allMaps.map(m=>`<option value="${m}" ${m===r.map?'selected':''}>${m}</option>`).join('') +
      `<option value="__custom__">직접입력...</option>`;
    const mapCell = `<select class="pro-map-sel" data-idx="${i}"
      style="width:80px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:var(--fs-caption)">${mapOpts}</select>`;

    let setOpts='';
    for(let s=1;s<=Math.max(maxSet,3);s++) setOpts+=`<option value="${s}" ${s===(r.setNum||1)?'selected':''}>${s}세트</option>`;
    const setCell = `<select class="pro-set-sel" data-idx="${i}"
      style="width:56px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:var(--fs-caption)">${setOpts}</select>`;

    const flipBtn = `<button class="pro-flip-btn" data-idx="${i}" title="A팀↔B팀 교체"
      style="padding:3px 6px;border-radius:5px;border:1px solid #ddd6fe;background:#f5f3ff;font-size:var(--fs-base);cursor:pointer;transition:.12s"
      onmouseover="this.style.background='#ede9fe'" onmouseout="this.style.background='#f5f3ff'">⇄</button>`;

    const statusBadge = ok
      ? `<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">✓저장</span>`
      : (isNeedPickRow(r) || wAmbig || lAmbig)
        ? `<span style="background:#fef9c3;color:#b45309;border:1px solid #fcd34d;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">선택↑</span>`
        : `<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 5px;border-radius:8px;white-space:nowrap">미인식</span>`;

    const delBtn = `<button class="pro-del-btn" data-idx="${i}"
      style="padding:3px 6px;border-radius:5px;border:1px solid #fecaca;background:#fff5f5;font-size:var(--fs-sm);cursor:pointer;transition:.12s"
      onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fff5f5'">🗑</button>`;

    const rowBg = ok ? '#f8faff' : (isNeedPickRow(r) || wAmbig || lAmbig) ? '#fffbeb' : '#fff8f8';
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
    const gSavable = groupRows.filter(isSavableRow);
    if (!gSavable.length) return '';
    const mode = window._proPasteMode || 'game';
    const setMap2 = {};
    gSavable.forEach(r => {
      const sn = r.setNum||1;
      if(!setMap2[sn]) setMap2[sn]={A:0,B:0};
      const leftN = r.leftName || r.winName;
      const isLeftWinner = r.isTeam ? (r.winnerSide === 'L') : (leftN === r.winName);
      if (isLeftWinner) setMap2[sn].A++; else setMap2[sn].B++;
    });
    const multiSet = Object.keys(setMap2).length > 1;
    let sa=0, sb=0;
    const setRows = Object.keys(setMap2).sort((a,b)=>a-b).map(sn=>{
      const s=setMap2[sn]; const sw=s.A>s.B?'A':s.B>s.A?'B':'';
      if(sw==='A') sa++; else if(sw==='B') sb++;
      return `<span style="display:inline-flex;align-items:center;gap:4px;background:${sw?'#f0fdf4':'#f8fafc'};border:1px solid ${sw?'#86efac':'#e2e8f0'};border-radius:8px;padding:3px 10px;font-size:var(--fs-sm)">
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
        <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">📊 결과${multiSet?' (세트제)':''}</span>
        ${multiSet?'':'<span style="flex:1"></span>'}
        ${!multiSet?`<span style="font-weight:900;font-size:14px;color:#1d4ed8">🔵 A팀</span>
        <span style="font-weight:900;font-size:var(--fs-lg);color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
        <span style="font-size:var(--fs-sm);color:var(--gray-l)">:</span>
        <span style="font-weight:900;font-size:var(--fs-lg);color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
        <span style="font-weight:900;font-size:14px;color:#dc2626">🔴 B팀</span>
        <span style="font-size:var(--fs-sm);font-weight:700;padding:2px 10px;border-radius:var(--r);background:${totalA===totalB?'#f1f5f9':'#dcfce7'};color:${totalA===totalB?'#64748b':'#15803d'}">${totalA===totalB?'🤝 무승부':'🏆 '+winner+' 승'}</span>`:''}
      </div>
      ${multiSet?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px">${setRows}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-weight:900;font-size:14px;color:#1d4ed8">🔵 A팀</span>
        <span style="font-weight:900;font-size:var(--fs-lg);color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
        <span style="font-size:var(--fs-sm);color:var(--gray-l)">:</span>
        <span style="font-weight:900;font-size:var(--fs-lg);color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
        <span style="font-weight:900;font-size:14px;color:#dc2626">🔴 B팀</span>
        <span style="font-size:var(--fs-sm);font-weight:700;padding:2px 10px;border-radius:var(--r);background:${totalA===totalB?'#f1f5f9':'#dcfce7'};color:${totalA===totalB?'#64748b':'#15803d'}">${totalA===totalB?'🤝 무승부':'🏆 '+winner+' 승'}</span>
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
          <span style="font-size:var(--fs-base);font-weight:900">🏅 경기 ${mg+1}</span>
          ${dateVal?`<span style="font-size:var(--fs-caption);opacity:.8">${dateVal}</span>`:''}
          ${fmtLabel?`<span style="font-size:var(--fs-caption);background:rgba(255,255,255,.2);border-radius:8px;padding:1px 7px">${fmtLabel}</span>`:''}
        </div>`;
    }
    html += `<div style="${isMultiMatch?'padding:8px 10px':'border:1px solid #ddd6fe;border-radius:var(--r);overflow:hidden;margin-bottom:10px'}">
    <table style="margin:0;width:100%;font-size:var(--fs-sm);border-collapse:collapse">
    <thead><tr style="background:${isMultiMatch?'#f5f3ff':'linear-gradient(90deg,#5b21b6,#7c3aed)'};color:${isMultiMatch?'#5b21b6':'#fff'}">
      <th style="padding:6px 8px;font-size:10px;width:56px">세트</th>
      <th style="padding:6px 8px;font-size:10px;width:84px">맵</th>
      <th style="padding:6px 10px;font-size:var(--fs-caption);font-weight:900">🔵 A팀</th>
      <th style="padding:6px 4px;font-size:10px;width:44px;text-align:center">교체</th>
      <th style="padding:6px 10px;font-size:var(--fs-caption);font-weight:900">🔴 B팀</th>
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
      _proAutoSaveAlias(origName, p);

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
      if (r.isTeam) {
        [r.leftNames, r.rightNames] = [r.rightNames||['',''], r.leftNames||['','']];
        [r.leftPlayers, r.rightPlayers] = [r.rightPlayers||[null,null], r.leftPlayers||[null,null]];
        [r.leftMeta, r.rightMeta] = [r.rightMeta||[], r.leftMeta||[]];
        const ln0 = (r.leftNames?.[0]||'').trim();
        const ln1 = (r.leftNames?.[1]||'').trim();
        const rn0 = (r.rightNames?.[0]||'').trim();
        const rn1 = (r.rightNames?.[1]||'').trim();
        r.leftName = ln0 && ln1 ? `${ln0}, ${ln1}` : (ln0 || ln1 || '');
        r.rightName = rn0 && rn1 ? `${rn0}, ${rn1}` : (rn0 || rn1 || '');
        r.winnerSide = r.winnerSide === 'L' ? 'R' : 'L';
        r.winName = r.winnerSide === 'L' ? r.leftName : r.rightName;
        r.loseName = r.winnerSide === 'L' ? r.rightName : r.leftName;
      } else {
        [r.winName, r.loseName] = [r.loseName, r.winName];
        [r.wPlayer, r.lPlayer] = [r.lPlayer, r.wPlayer];
        [r.wCandidates, r.lCandidates] = [r.lCandidates||[], r.wCandidates||[]];
        [r.wSimilar, r.lSimilar] = [r.lSimilar||[], r.wSimilar||[]];
      }
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

