/* ══════════════════════════════════════════════════════════════
   검색 - 붙여넣기 미리보기 렌더 (search-preview.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function renderPastePreview(results, errors) {
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (!previewEl) return;

  const savable  = (results || []).filter(r => (r.wPlayer && r.lPlayer) || r._scoreOnly);
  const ambig    = (results || []).filter(r => !r._scoreOnly).filter(r => (!r.wPlayer && r.wCandidates?.length > 1) || (!r.lPlayer && r.lCandidates?.length > 1));
  const hasSimilar = (r) => (!r.wPlayer && !r.wCandidates?.length && r.wSimilar?.length) || (!r.lPlayer && !r.lCandidates?.length && r.lSimilar?.length);
  const similarRows = (results || []).filter(r => !r._scoreOnly).filter(r => !r.wPlayer || !r.lPlayer).filter(r => hasSimilar(r) && !ambig.includes(r));
  const missing  = (results || []).filter(r => !r._scoreOnly).filter(r => (!r.wPlayer && !r.wCandidates?.length && !r.wSimilar?.length) || (!r.lPlayer && !r.lCandidates?.length && !r.lSimilar?.length));

  // 상단 뱃지
  if (badge) {
    if (results && results.length > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = `✅ ${savable.length}건 저장 가능`;
      if (ambig.length) badge.textContent += ` · ⚠️ ${ambig.length}건 선택 필요`;
      if (similarRows.length) badge.textContent += ` · 🔍 ${similarRows.length}건 유사이름`;
      if (missing.length) badge.textContent += ` · ❌ ${missing.length}건 미등록`;
      badge.style.background = savable.length === results.length ? '#dcfce7' : '#fef9c3';
      badge.style.color      = savable.length === results.length ? '#16a34a' : '#b45309';
      badge.style.border     = `1px solid ${savable.length === results.length ? '#bbf7d0' : '#fcd34d'}`;
    } else {
      badge.style.display = 'none';
    }
  }

  // 하단 경고
  if (pendWarn) pendWarn.style.display = ambig.length ? 'inline' : 'none';

  let html = '';
  let teamAPreview = window._pasteForceTeamA || 'A팀';
  let teamBPreview = window._pasteForceTeamB || 'B팀';

  if (results && results.length > 0) {
    // 맵 목록 (드롭다운용) — 설정 맵 + 약자 전체값 + 이번 파싱에서 인식된 맵 포함
    const parsedMaps = results.map(r => r.map).filter(m => m && m !== '-');
    const allMaps = [...new Set([...maps.filter(m=>m&&m!=='-'), ...parsedMaps])].filter(Boolean).sort();

    // 최대 세트번호 계산 (세트 드롭다운용)
    const maxSet = Math.max(...results.map(r => r.setNum || 1), 3);
    const _matchModePreview = window._pasteMatchMode || 'game';
    // (요청사항) Nada Dark 전용: A/B 카드 UI + 반응형
    const _useCardUI = document.body.classList.contains('design-v2') && document.body.classList.contains('designv2-nada');

    // ── 팀 인식: leftName(A칸)/rightName(B칸) 기준으로 소속 대학 빈도 계산 ──
    const _savableForTeam = results.filter(r => r.wPlayer && r.lPlayer);
    const _univA2 = {}, _univB2 = {};
    _savableForTeam.forEach(r => {
      // A칸=좌측선수, B칸=우측선수 → 좌측이 승자면 ap=wPlayer, 패자면 ap=lPlayer
      const _leftIsWinT = (typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName);
      const ap = _leftIsWinT ? r.wPlayer : r.lPlayer;
      const bp = _leftIsWinT ? r.lPlayer : r.wPlayer;
      const ua = ap?.univ||''; const ub = bp?.univ||'';
      if(ua && ua!=='무소속') _univA2[ua] = (_univA2[ua]||0)+1;
      if(ub && ub!=='무소속') _univB2[ub] = (_univB2[ub]||0)+1;
    });
    const _rA2 = Object.entries(_univA2).sort((a,b)=>b[1]-a[1]);
    const _rB2 = Object.entries(_univB2).sort((a,b)=>b[1]-a[1]);
    let _autoTeamA = _rA2[0]?.[0] || '';
    let _autoTeamB = _rB2[0]?.[0] || '';
    // A팀과 B팀이 같으면 B팀을 다른 대학으로 교정
    if (_autoTeamA && _autoTeamA === _autoTeamB) {
      _autoTeamB = _rB2.find(([u])=>u!==_autoTeamA)?.[0] || _rA2.find(([u])=>u!==_autoTeamA)?.[0] || '';
    }
    const _isCKMode = !!(window._forcedPasteMode === 'ck' || document.getElementById('paste-mode')?.value === 'ck');
    teamAPreview = _isCKMode ? 'A조' : (window._pasteForceTeamA || _autoTeamA || 'A팀');
    teamBPreview = _isCKMode ? 'B조' : (window._pasteForceTeamB || _autoTeamB || 'B팀');
    const _teamALabel = '🔵 ' + teamAPreview;
    const _teamBLabel = '🔴 ' + teamBPreview;

    const _colLabel = _matchModePreview==='set' ? '세트/경기' : '경기';
    if(_useCardUI){
      html += `<div class="pv-wrap">
        <div class="pv-head">
          <div class="pv-head-col pv-meta">${_colLabel}</div>
          <div class="pv-head-col pv-map">맵/메모</div>
          <div class="pv-head-col pv-team pv-a">${_teamALabel}</div>
          <div class="pv-head-col pv-team pv-b">${_teamBLabel}</div>
        </div>
        <div class="pv-cards">`;
    }else{
      html += `<div style="border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-bottom:10px">`;
      html += `<table style="margin:0;width:100%;font-size:var(--fs-sm)"><thead><tr>
        <th style="text-align:left;padding:6px 8px;font-size:var(--fs-caption);width:86px">${_colLabel}</th>
        <th style="text-align:left;padding:6px 8px;font-size:var(--fs-caption);width:90px">맵</th>
        <th style="text-align:left;padding:6px 8px;font-size:var(--fs-caption)">${_teamALabel}</th>
        <th style="text-align:left;padding:6px 8px;font-size:var(--fs-caption)">${_teamBLabel}</th>
        <th style="text-align:left;padding:6px 8px;font-size:var(--fs-caption);width:70px">상태</th>
        <th style="text-align:center;padding:6px 8px;font-size:var(--fs-caption);width:52px">관리</th>
      </tr></thead><tbody>`;
    }

    // 날짜 구분선 표시: ind/gj 모드에서 _lineDate가 있는 경우 날짜별 구분선 추가
    const _pasteMode = window._forcedPasteMode || document.getElementById('paste-mode')?.value || '';
    const _showDateSep = ['ind','gj'].includes(_pasteMode) && results.some(r => r._lineDate);
    let _prevRowDate = null;

    results.forEach((r, i) => {
      // 스코어만 입력 (예: 2:2)
      if (r._scoreOnly) {
        const sA = r._scoreA ?? 0;
        const sB = r._scoreB ?? 0;
        if(_useCardUI){
          html += `<div class="pv-card pv-score">
            <div class="pv-top">
              <div class="pv-meta"><span class="pv-game">${_matchModePreview==='set' ? `${r.setNum||1}세트` : '스코어'}</span></div>
              <div class="pv-map"><span class="pv-map-txt">스코어</span></div>
              <div class="pv-status"><span class="pv-ok">✅</span></div>
            </div>
            <div class="pv-sides">
              <div class="pv-side pv-a"><span class="pv-score-a">${sA}</span></div>
              <div class="pv-side pv-b"><span class="pv-score-b">${sB}</span></div>
            </div>
          </div>`;
        }else{
          html += `<tr style="border-top:1px solid var(--border);background:#f8fafc">
            <td style="padding:8px 8px;font-weight:900;white-space:nowrap">${_matchModePreview==='set' ? `${r.setNum||1}세트` : '스코어'}</td>
            <td style="padding:8px 8px;color:var(--gray-l);white-space:nowrap">스코어</td>
            <td style="padding:8px 8px;font-weight:1000;color:#2563eb">${sA}</td>
            <td style="padding:8px 8px;font-weight:1000;color:#dc2626">${sB}</td>
            <td style="padding:8px 8px;white-space:nowrap"><span style="font-weight:900;color:#16a34a">✅</span></td>
            <td style="padding:8px 8px;text-align:center;color:var(--gray-l)">-</td>
          </tr>`;
        }
        return;
      }
      const wOk    = !!r.wPlayer;
      const lOk    = !!r.lPlayer;
      const wAmbig = !wOk && r.wCandidates?.length > 1;
      const lAmbig = !lOk && r.lCandidates?.length > 1;
      const ok     = wOk && lOk;

      const wDisplayName = r.winName;
      const lDisplayName = r.loseName;

      // ── 선수 셀 빌더 ──
      const buildCell = (isWin, displayName, displayRace, resolved, isAmbig, candidates, similar, role) => {
        const style = resolved ? (isWin ? 'color:#ea580c;font-weight:700' : 'color:#dc2626;font-weight:700') : 'color:#b45309;font-weight:700';
        const raceHtml = displayRace ? `<span style="font-size:10px;color:var(--gray-l);font-weight:800;margin-left:3px">(${displayRace})</span>` : '';
        let cell = `<span style="${style}">${displayName}${raceHtml}</span>`;
        if (resolved) {
          const p = isWin ? r.wPlayer : r.lPlayer;
          // 실제 선수 이름과 입력 이름이 다를 때 실제 선수 이름 표시
          if (p?.name && p.name !== displayName) {
            cell += ` <span style="font-size:10px;color:#16a34a;font-weight:600;margin-left:4px">→ ${p.name}</span>`;
          }
          if (p?.univ) cell += `<span style="font-size:10px;color:var(--gray-l);margin-left:4px">(${p.univ})</span>`;
        } else if (isAmbig) {
          cell += `<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px;align-items:center">
            <span style="font-size:10px;color:#b45309;font-weight:600">선택:</span>` +
            candidates.map(c =>
              `<button class="paste-pick-btn" data-idx="${i}" data-role="${role}" data-name="${c.name.replace(/"/g,'&quot;')}"
                style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:var(--fs-caption);font-weight:700;cursor:pointer;transition:.12s"
                onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                ${c.name}${c.univ?`<span style="font-size:9px;opacity:.7;margin-left:2px">(${c.univ})</span>`:''}</button>`
            ).join('') + `</div>`;
        } else {
          // 미등록: 유사 이름 제안 + +등록 버튼
          const safeName = displayName.replace(/"/g,'&quot;');
          // 유사 이름 후보가 있으면 제안 버튼 표시
          if (similar && similar.length > 0) {
            cell += `<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px;align-items:center">
              <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>` +
              similar.map(c =>
                `<button class="paste-pick-btn" data-idx="${i}" data-role="${role}" data-name="${c.name.replace(/"/g,'&quot;')}"
                  style="padding:3px 9px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:var(--fs-caption);font-weight:700;cursor:pointer;transition:.12s"
                  onmouseover="this.style.background='#ede9fe'" onmouseout="this.style.background='#faf5ff'"
                  title="${c.univ||''}">
                  ${c.name}${c.univ?`<span style="font-size:9px;opacity:.7;margin-left:2px">(${c.univ})</span>`:''}</button>`
              ).join('') +
              `<button class="paste-reg-btn" data-idx="${i}" data-role="${role}" data-name="${safeName}"
                style="padding:2px 7px;border-radius:4px;border:1px solid #86efac;background:#f0fdf4;color:#16a34a;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.12s"
                onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">+등록</button>
              </div>`;
          } else {
            cell += `<button class="paste-reg-btn" data-idx="${i}" data-role="${role}" data-name="${safeName}"
              style="margin-left:5px;padding:2px 7px;border-radius:4px;border:1px solid #86efac;background:#f0fdf4;color:#16a34a;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.12s"
              onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">+등록</button>`;
          }
        }
        return cell;
      };

      // A칸/B칸 배정: 로스터 있으면 로스터 소속 기반, 없으면 leftName 텍스트 위치 기반
      const _rosterA = window._pasteRosterA;
      const _rosterB = window._pasteRosterB;
      const _isRosterMode = !!(_rosterA && _rosterB);
      const _inRA = (nm) => _rosterA?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
      const _inRB = (nm) => _rosterB?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
      const _isCKPreview = _isCKMode;
      let aPlayer, bPlayer, aIsWin;
      let aOk, aName, aAmbig, aCands, aSim, aRole;
      let bOk, bName, bAmbig, bCands, bSim, bRole;
      if (_isRosterMode && !_isCKPreview) {
        // 승자(winName)가 rosterA 소속이면 A칸=승자, rosterB면 A칸=패자
        const _wInA = _inRA(r.winName), _wInB = _inRB(r.winName);
        aIsWin  = _wInA ? true : _wInB ? false : ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
        aPlayer = aIsWin ? r.wPlayer : r.lPlayer;
        bPlayer = aIsWin ? r.lPlayer : r.wPlayer;
        aOk     = !!aPlayer;
        bOk     = !!bPlayer;
        aName   = aPlayer ? aPlayer.name : (aIsWin ? r.winName : r.loseName);
        bName   = bPlayer ? bPlayer.name : (aIsWin ? r.loseName : r.winName);
        aAmbig  = !aOk && (aIsWin ? wAmbig : lAmbig);
        bAmbig  = !bOk && (aIsWin ? lAmbig : wAmbig);
        aCands  = aIsWin ? (r.wCandidates||[]) : (r.lCandidates||[]);
        bCands  = aIsWin ? (r.lCandidates||[]) : (r.wCandidates||[]);
        aSim    = aIsWin ? (r.wSimilar||[]) : (r.lSimilar||[]);
        bSim    = aIsWin ? (r.lSimilar||[]) : (r.wSimilar||[]);
        aRole   = aIsWin ? 'w' : 'l';
        bRole   = aIsWin ? 'l' : 'w';
      } else {
        // 기존 방식: leftName(텍스트 왼쪽)=A칸, rightName(텍스트 오른쪽)=B칸
        // wPlayer=항상승자, lPlayer=항상패자 → _leftIsWin에 따라 직접 배정
        const _leftRaw  = r.leftName  || r.winName  || '';
        const _rightRaw = r.rightName || r.loseName || '';
        const _leftIsWin = (typeof r._leftIsWin === 'boolean') ? r._leftIsWin : (_leftRaw === r.winName);
        // 선수 DB 소속으로 A/B 배정 우선 시도 (자동 팀 인식된 경우, CK 모드 제외)
        let _univBased = false;
        if (!_isCKPreview && r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
            r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
            teamAPreview && teamAPreview !== 'A팀' && teamAPreview !== 'A조' &&
            teamBPreview && teamBPreview !== 'B팀' && teamBPreview !== 'B조') {
          const _wInA = r.wPlayer.univ === teamAPreview;
          const _lInA = r.lPlayer.univ === teamAPreview;
          if (_wInA || _lInA) { aIsWin = _wInA; _univBased = true; }
        }
        if (!_univBased) aIsWin = _leftIsWin;
        aPlayer = aIsWin ? (wOk ? r.wPlayer : null) : (lOk ? r.lPlayer : null);
        bPlayer = aIsWin ? (lOk ? r.lPlayer : null) : (wOk ? r.wPlayer : null);
        aOk     = aIsWin ? wOk : lOk;
        bOk     = aIsWin ? lOk : wOk;
        aName   = aPlayer ? aPlayer.name : (aIsWin ? r.winName : r.loseName);
        bName   = bPlayer ? bPlayer.name : (aIsWin ? r.loseName : r.winName);
        aAmbig  = !aOk && (aIsWin ? wAmbig : lAmbig);
        bAmbig  = !bOk && (!aIsWin ? wAmbig : lAmbig);
        aCands  = aIsWin ? (r.wCandidates||[]) : (r.lCandidates||[]);
        bCands  = !aIsWin ? (r.wCandidates||[]) : (r.lCandidates||[]);
        aSim    = aIsWin ? (r.wSimilar||[]) : (r.lSimilar||[]);
        bSim    = !aIsWin ? (r.wSimilar||[]) : (r.lSimilar||[]);
        aRole   = aIsWin ? 'w' : 'l';
        bRole   = aIsWin ? 'l' : 'w';
      }
      const bIsWin = !aIsWin;
      const aWon   = aIsWin;
      const _eqNS = (x,y)=>String(x||'').replace(/\s+/g,'')===String(y||'').replace(/\s+/g,'');
      const _aRace = _eqNS(aName, r.leftName) ? (r.leftRace||'') : _eqNS(aName, r.rightName) ? (r.rightRace||'') : '';
      const _bRace = _eqNS(bName, r.rightName) ? (r.rightRace||'') : _eqNS(bName, r.leftName) ? (r.leftRace||'') : '';
      const aCell  = buildCell(aIsWin, aName, _aRace, aOk, aAmbig, aCands, aSim, aRole);
      const bCell  = buildCell(bIsWin, bName, _bRace, bOk, bAmbig, bCands, bSim, bRole);
      // A팀/B팀 결과 뱃지 (클릭으로 승패 반전, 선수 위치는 고정)
      const _winBadge  = (idx) => `<button class="paste-flip-btn" data-idx="${idx}" style="background:#2563eb;color:#fff;font-size:9px;font-weight:900;padding:1px 6px;border-radius:4px;margin-left:4px;vertical-align:middle;border:none;cursor:pointer">이겼다</button>`;
      const _loseBadge = (idx) => `<button class="paste-flip-btn" data-idx="${idx}" style="background:#dc2626;color:#fff;font-size:9px;font-weight:900;padding:1px 6px;border-radius:4px;margin-left:4px;vertical-align:middle;border:none;cursor:pointer">졌다</button>`;
      const aResultBadge = ok ? (aWon ? _winBadge(i) : _loseBadge(i)) : '';
      const bResultBadge = ok ? (!aWon ? _winBadge(i) : _loseBadge(i)) : '';
      const wSim = !wOk && !wAmbig && (r.wSimilar||[]).length > 0;
      const lSim = !lOk && !lAmbig && (r.lSimilar||[]).length > 0;
      const statusBadge = ok
        ? `<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 6px;border-radius:var(--r);white-space:nowrap">저장가능</span>`
        : (wAmbig || lAmbig)
          ? `<span style="background:#fef9c3;color:#b45309;border:1px solid #fcd34d;font-size:10px;font-weight:700;padding:2px 6px;border-radius:var(--r);white-space:nowrap">선택필요</span>`
          : (wSim || lSim)
            ? `<span style="background:#faf5ff;color:#6d28d9;border:1px solid #c4b5fd;font-size:10px;font-weight:700;padding:2px 6px;border-radius:var(--r);white-space:nowrap">유사이름</span>`
            : `<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 6px;border-radius:var(--r);white-space:nowrap">미등록</span>`;

      // ── 경기/세트 표시 ──
      const gn = r.gameNum || r.game || r.gameNo || null;
      const gameTag = `<span style="font-size:var(--fs-caption);font-weight:900;color:var(--text3);white-space:nowrap">${(gn|| (i+1))}경기</span>`;
      let setCell = '';
      if(_matchModePreview==='set'){
        // 세트 드롭다운 + 경기번호
        const setOpts = Array.from({length: Math.max(maxSet, r.setNum||1)}, (_,k) => k+1)
          .map(n => `<option value="${n}" ${(r.setNum||1)===n?'selected':''}>${n}세트</option>`).join('');
        const setSel = `<select class="paste-set-sel" data-idx="${i}"
          style="font-size:var(--fs-caption);font-weight:700;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;color:${(r.setNum||1)>=3?'#7c3aed':'var(--blue)'};background:var(--white);cursor:pointer;max-width:72px"
          onchange="pasteChangeSet(${i},parseInt(this.value))">${setOpts}</select>`;
        setCell = `<div style="display:flex;flex-direction:column;gap:2px">${setSel}<span style="font-size:10px;color:var(--gray-l);font-weight:800">${(gn|| (i+1))}경기</span></div>`;
      } else {
        // 경기 방식: 경기번호만 표시
        setCell = gameTag;
      }

      // ── 맵 드롭다운 ──
      const mapVal = r.map && r.map !== '-' ? r.map : '';
      const mapOpts = `<option value="">-</option>` +
        allMaps.map(m => `<option value="${m}" ${mapVal===m?'selected':''}>${m}</option>`).join('');
      const mapCell = `<select class="paste-map-sel" data-idx="${i}"
        style="font-size:var(--fs-caption);border:1px solid ${mapVal?'#7dd3fc':'var(--border2)'};border-radius:5px;padding:2px 4px;background:${mapVal?'#e0f2fe':'var(--white)'};color:${mapVal?'#0369a1':'var(--gray-l)'};cursor:pointer;max-width:88px"
        onchange="pasteChangeMap(${i},this.value)">${mapOpts}</select>`;


      // ── 행 삭제 버튼 ──
      const delBtn = `<button class="paste-del-btn" data-idx="${i}" title="이 행 삭제"
        style="padding:2px 6px;border-radius:4px;border:1px solid #fecaca;background:#fff5f5;font-size:var(--fs-sm);cursor:pointer;transition:.12s;line-height:1.4"
        onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fff5f5'">🗑</button>`;

      const _hasSim = wSim||lSim;
      // 날짜 구분선
      if (_showDateSep) {
        const _rowDate = r._lineDate || null;
        if (_rowDate !== _prevRowDate) {
          _prevRowDate = _rowDate;
          if (_rowDate) {
            if(_useCardUI){
              html += `<div class="pv-date">📅 ${_rowDate} <span class="pv-date-sub">이후 경기 날짜</span></div>`;
            }else{
              html += `<tr><td colspan="6" style="padding:4px 8px;background:#eff6ff;border-top:2px solid #bfdbfe;border-bottom:1px solid #bfdbfe">
                <span style="font-size:var(--fs-caption);font-weight:700;color:#1d4ed8">📅 ${_rowDate}</span>
                <span style="font-size:10px;color:#6b7280;margin-left:6px">이후 경기 날짜</span>
              </td></tr>`;
            }
          }
        }
      }
      const _memoTag = r._lineMemo ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">📝 ${r._lineMemo.replace(/</g,'&lt;')}</div>` : '';
      const _normTag = (() => {
        try{
          if(!r.leftName || !r.rightName || !r.map || r.map==='-') return '';
          const lr = r.leftRace ? `(${r.leftRace})` : '';
          const rr = r.rightRace ? `(${r.rightRace})` : '';
          const lm = r.leftMark || '';
          const rm = r.rightMark || '';
          // 요청 포맷: 요시(P) ⬜ 🆚️ ✅ 김세주(T) [폴리포이드]
          const s = `${r.leftName}${lr} ${lm} 🆚️ ${rm} ${r.rightName}${rr} [${r.map}]`.trim();
          return `<div style="font-size:10px;color:var(--text3);margin-top:3px;line-height:1.25">인식: ${s}</div>`;
        }catch(e){ return ''; }
      })();
      const _typeBadge = r._lineType ? ({
        mini: '<span style="background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;font-size:10px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px">미니</span>',
        gj:   '<span style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;font-size:10px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px">끝장전</span>',
        ind:  '<span style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;font-size:10px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px">개인전</span>',
      }[r._lineType] || '') : '';
      if(_useCardUI){
        const bg = ok ? 'ok' : (wAmbig||lAmbig) ? 'ambig' : _hasSim ? 'sim' : 'bad';
        html += `<div class="pv-card pv-${bg}">
          <div class="pv-top">
            <div class="pv-meta">${setCell}${_typeBadge}</div>
            <div class="pv-map">${mapCell}${_memoTag}${_normTag}</div>
            <div class="pv-status">${statusBadge}${delBtn}</div>
          </div>
          <div class="pv-sides">
            <div class="pv-side pv-a">${aCell}${aResultBadge}</div>
            <div class="pv-side pv-b">${bCell}${bResultBadge}</div>
          </div>
        </div>`;
      }else{
        html += `<tr style="background:${ok ? '' : wAmbig||lAmbig ? '#fffbeb' : _hasSim ? '#fdf4ff' : '#fff5f5'}">
          <td style="padding:4px 6px">${setCell}${_typeBadge}</td>
          <td style="padding:4px 6px">${mapCell}${_memoTag}${_normTag}</td>
          <td style="padding:4px 8px">${aCell}${aResultBadge}</td>
          <td style="padding:4px 8px">${bCell}${bResultBadge}</td>
          <td style="padding:4px 6px">${statusBadge}</td>
          <td style="padding:4px 6px;text-align:center">${delBtn}</td>
        </tr>`;
      }
    });
    html += _useCardUI ? `</div></div>` : `</tbody></table></div>`;

    // ── 세트 결과 요약 미리보기 ──
    // 로스터 기반이면 소속으로, 없으면 leftName 기준으로 A/B 판단
    const _sprRA = window._pasteRosterA, _sprRB = window._pasteRosterB;
    const _sprInA = (nm) => _sprRA?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
    const _sprInB = (nm) => _sprRB?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
    const setPreviewMap = {};
    savable.forEach(r => {
      const sn = r.setNum || 1;
      if(!setPreviewMap[sn]) setPreviewMap[sn] = {A:0, B:0};
      let aWins;
      if (_isCKMode) {
        aWins = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
      } else if (_sprRA && _sprRB) {
        aWins = !!_sprInA(r.winName);
        if (!aWins && !_sprInB(r.winName)) aWins = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
      } else if (!_isCKMode && r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
                 r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
                 teamAPreview && teamAPreview !== 'A팀' && teamAPreview !== 'A조' &&
                 teamBPreview && teamBPreview !== 'B팀' && teamBPreview !== 'B조' &&
                 (r.wPlayer.univ === teamAPreview || r.wPlayer.univ === teamBPreview) &&
                 (r.lPlayer.univ === teamAPreview || r.lPlayer.univ === teamBPreview) &&
                 r.wPlayer.univ !== r.lPlayer.univ) {
        // 승자/패자 소속이 정확히 A팀/B팀 둘 중 하나씩일 때만 소속 기준으로 판단
        // (소속이 A/B 어느쪽과도 다른 제3의 소속이면 오분류 방지 → 좌우 위치 기준으로 폴백)
        aWins = r.wPlayer.univ === teamAPreview;
      } else {
        aWins = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
      }
      setPreviewMap[sn][aWins ? 'A' : 'B']++;
    });
    const multiSetPreview = Object.keys(setPreviewMap).length > 1;
    let setScoreA = 0, setScoreB = 0;
    const setRows = Object.keys(setPreviewMap).sort((a,b)=>a-b).map(sn => {
      const s = setPreviewMap[sn];
      const sw = s.A > s.B ? 'A' : s.B > s.A ? 'B' : '';
      if(sw === 'A') setScoreA++; else if(sw === 'B') setScoreB++;
      const acol = sw==='A' ? '#16a34a' : s.A>0 ? '#64748b' : '#9ca3af';
      const bcol = sw==='B' ? '#16a34a' : s.B>0 ? '#64748b' : '#9ca3af';
      return `<span style="display:inline-flex;align-items:center;gap:4px;background:${sw?'#f0fdf4':'#f8fafc'};border:1px solid ${sw?'#86efac':'#e2e8f0'};border-radius:8px;padding:3px 10px;font-size:var(--fs-sm)">
        <span style="font-size:10px;color:var(--gray-l);font-weight:600">${sn}세트</span>
        <span style="font-weight:800;color:${acol}">${s.A}</span>
        <span style="color:var(--gray-l)">:</span>
        <span style="font-weight:800;color:${bcol}">${s.B}</span>
        ${sw?`<span style="font-size:10px;font-weight:700;color:#16a34a">${sw==='A'?'A팀':'B팀'} ✓</span>`:''}
      </span>`;
    }).join('');

    if(savable.length > 0) {
      const _useSetScore = _matchModePreview === 'set' || multiSetPreview;
      // A/B팀 게임 승리 수
      let teamAWins = 0, teamBWins = 0;
      savable.forEach(r => {
        let aW;
        if (_isCKMode) {
          aW = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
        } else if (_sprRA && _sprRB) {
          aW = !!_sprInA(r.winName);
          if (!aW && !_sprInB(r.winName)) aW = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
        } else if (r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
                   r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
                   teamAPreview && teamAPreview !== 'A팀' && teamAPreview !== 'A조' &&
                   teamBPreview && teamBPreview !== 'B팀' && teamBPreview !== 'B조' &&
                   (r.wPlayer.univ === teamAPreview || r.wPlayer.univ === teamBPreview) &&
                   (r.lPlayer.univ === teamAPreview || r.lPlayer.univ === teamBPreview) &&
                   r.wPlayer.univ !== r.lPlayer.univ) {
          // 승자/패자 소속이 정확히 A팀/B팀 둘 중 하나씩일 때만 소속 기준으로 판단
          // (소속이 A/B 어느쪽과도 다른 제3의 소속이면 오분류 방지 → 좌우 위치 기준으로 폴백)
          aW = r.wPlayer.univ === teamAPreview;
        } else {
          aW = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
        }
        aW ? teamAWins++ : teamBWins++;
      });
      const totalA = _useSetScore ? setScoreA : teamAWins;
      const totalB = _useSetScore ? setScoreB : teamBWins;
      const _dA='A팀';
      const _dB='B팀';
      const winner = totalA > totalB ? _dA : totalB > totalA ? _dB : '무승부';
      html += `<div style="margin-top:8px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
        <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:6px">📊 현재 결과 미리보기 ${multiSetPreview?'(세트제)':'(개인전)'}</div>
        ${multiSetPreview ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">${setRows}</div>` : ''}
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-weight:800;font-size:14px;color:${totalA>totalB?'#2563eb':'#64748b'}">${_dA}</span>
          <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px">
            <span style="color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
            <span style="color:var(--gray-l);font-size:14px"> : </span>
            <span style="color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
          </span>
          <span style="font-weight:800;font-size:14px;color:${totalB>totalA?'#dc2626':'#64748b'}">${_dB}</span>
          <span style="font-size:var(--fs-sm);font-weight:700;padding:2px 10px;border-radius:12px;background:${winner==='무승부'?'#f1f5f9':'#dcfce7'};color:${winner==='무승부'?'#64748b':'#15803d'}">
            ${winner==='무승부'?'🤝 무승부':'🏆 '+winner+' 승'}
          </span>
        </div>
      </div>`;
    }
  }

  if (errors && errors.length > 0) {
    html += `<div style="background:#fff5f5;border:1.5px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-top:6px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:#dc2626;margin-bottom:6px">⛔ 인식 실패 ${errors.length}줄 — 저장되지 않습니다</div>
      ${errors.map(e => {
        const _line = e.line ?? e.lineNum ?? '';
        const _raw = String(e.raw ?? e.rawLine ?? '');
        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="flex-shrink:0;font-size:10px;font-weight:700;background:#fecaca;color:#dc2626;padding:1px 6px;border-radius:4px">${_line}행</span>
        <code style="font-size:10px;color:#991b1b;background:#fff1f2;padding:2px 7px;border-radius:4px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${_raw.replace(/"/g,'&quot;')}">${_raw.slice(0,90)}${_raw.length>90?'…':''}</code>
      </div>`;
      }).join('')}
    </div>`;
  }

  if (applyBtn) {
    applyBtn.style.display = results && results.length > 0 ? 'inline-flex' : 'none';
    applyBtn.textContent = `✅ ${savable.length}건 저장하기`;
  }

  // 팀 스왑 UI 업데이트 (이미 위에서 계산한 teamAPreview/teamBPreview 재사용)
  const swapRow = document.getElementById('paste-team-swap-row');
  const teamALbl = document.getElementById('paste-team-a-label');
  const teamBLbl = document.getElementById('paste-team-b-label');
  if(swapRow && teamALbl && teamBLbl && savable.length > 0) {
    teamALbl.textContent = teamAPreview && teamAPreview !== 'A팀' ? '🔵 ' + teamAPreview : '🔵 A팀';
    teamBLbl.textContent = teamBPreview && teamBPreview !== 'B팀' ? '🔴 ' + teamBPreview : '🔴 B팀';
    swapRow.style.display = 'flex';
    window._previewTeamA = teamAPreview;
    window._previewTeamB = teamBPreview;
  } else if(swapRow) {
    swapRow.style.display = 'none';
  }

  previewEl.innerHTML = html;

  // ── 이벤트 등록 ──

  // 중복 선택 버튼
  previewEl.querySelectorAll('.paste-pick-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteSelectPlayer(parseInt(this.dataset.idx), this.dataset.role, this.dataset.name);
    });
  });

  // 미등록 선수 +등록 버튼
  previewEl.querySelectorAll('.paste-reg-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteQuickRegister(parseInt(this.dataset.idx), this.dataset.role, this.dataset.name);
    });
  });

  // 승패 반전 버튼
  previewEl.querySelectorAll('.paste-flip-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteFlipResult(parseInt(this.dataset.idx));
    });
  });

  // 행 삭제 버튼
  previewEl.querySelectorAll('.paste-del-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteDeleteRow(parseInt(this.dataset.idx));
    });
  });

}

// ── 승패 반전 ──
