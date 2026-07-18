function openPcBktBulkPasteModal(tnId) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const rounds = tn.bracket || [];
  // Collect all confirmed matches for hint
  const confirmed = [];
  rounds.forEach((rnd, ri) => rnd.forEach((m, mi) => {
    if (m.a && m.b && m.a !== 'TBD' && m.b !== 'TBD' && !m.winner)
      confirmed.push(`${m.a} vs ${m.b}`);
  }));
  // (버그픽스) pasteModal 초기화는 공통 openPasteModal로 수행 (모바일에서 클릭/입력 불가 현상 방지)
  if(typeof openPasteModal==='function') openPasteModal();
  window._grpPasteState = {tnId, ri: null, mi: null, mode: 'pcbkt'};
  window._grpPasteMode = true;
  const textarea = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn = document.getElementById('paste-apply-btn');
  const badge = document.getElementById('paste-summary-badge');
  const pendWarn = document.getElementById('paste-pending-warn');
  if (textarea) textarea.value = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn) { applyBtn.style.display='none'; applyBtn.textContent='✅ 경기 결과 적용'; }
  if (badge) badge.style.display = 'none';
  if (pendWarn) pendWarn.style.display = 'none';
  window._pasteResults = null; window._pasteErrors = null;
  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);
  const modeSel = document.getElementById('paste-mode');
  if (modeSel) { modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if (modeLabel) modeLabel.style.display = 'none';
  const hintEl = document.getElementById('paste-mode-hint');
  if (hintEl) {
    const matchList = confirmed.length ? `<br><span style="font-size:var(--fs-caption);color:#6b7280">진행 중인 경기: ${confirmed.join(' / ')}</span>` : '';
    hintEl.innerHTML = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">🏆 토너먼트 여러 경기 일괄 입력</span><br><span style="font-size:var(--fs-caption);color:#6b7280">형식: <code>승자이름 패자이름 [맵]</code> — 선수 이름으로 경기 자동 인식${matchList}</span></div>`;
  }
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  const _pd = document.querySelector('#pasteModal details');
  if (_pd) _pd.style.display = 'none';
  const _pt = document.querySelector('#pasteModal .mtitle');
  if (_pt) _pt.textContent = '📋 결과 붙여넣기 (여러 경기)';
  if (textarea) textarea.focus();
}

// (요청사항) 토너먼트 대진표 자동인식(자동 생성)
function openPcBktAutoBuildModal(tnId){
  const tn=_findTourneyById(tnId);
  if(!tn) return;
  if(typeof openPasteModal==='function') openPasteModal();
  window._grpPasteState = { tnId, mode:'pcbktbuild' };
  window._grpPasteMode = true;
  const hintEl=document.getElementById('paste-mode-hint');
  if(hintEl){
    hintEl.innerHTML = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px">
      <b style="color:#1d4ed8">🧠 토너먼트 대진표 자동생성</b><br>
      <span style="font-size:var(--fs-caption);color:#6b7280">가능하면 라운드별로 붙여넣기 해주세요 (예: 64강 버튼 → 64강 결과 붙여넣기). 여러 라운드가 섞이면 정확도가 떨어질 수 있습니다.</span>
    </div>`;
  }
  // 저장 형식 숨김
  const modeSel = document.getElementById('paste-mode');
  if (modeSel) { modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if (modeLabel) modeLabel.style.display = 'none';
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  const _pd = document.querySelector('#pasteModal details');
  if (_pd) _pd.style.display = 'none';
  const _pt = document.querySelector('#pasteModal .mtitle');
  if (_pt) _pt.textContent = '🧠 토너먼트 대진표 자동인식';
  const textarea = document.getElementById('paste-input');
  if(textarea) textarea.focus();
}

function openPcBktPasteModal(tnId, ri, mi) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const m = (tn.bracket||[])[ri]?.[mi];
  if (!m) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  // (요청사항) 부전승이면 붙여넣기 대신 부전승 처리 안내
  if (isBye(m.a) || isBye(m.b)) return alert('부전승(BYE/TBD) 경기는 "부전승" 버튼으로 처리해주세요.');
  if (!m.a || !m.b || m.a==='TBD' || m.b==='TBD') return alert('양 선수가 모두 확정된 경기에서만 이용 가능합니다.');
  if(typeof openPasteModal==='function') openPasteModal();
  window._grpPasteState = {tnId, ri, mi, mode:'pcbkt'};
  window._grpPasteMode = true;
  const textarea = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn = document.getElementById('paste-apply-btn');
  const badge = document.getElementById('paste-summary-badge');
  const pendWarn = document.getElementById('paste-pending-warn');
  if (textarea) textarea.value = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn) { applyBtn.style.display='none'; applyBtn.textContent='✅ 경기 결과 적용'; }
  if (badge) badge.style.display = 'none';
  if (pendWarn) pendWarn.style.display = 'none';
  window._pasteResults = null; window._pasteErrors = null;
  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = m.d || new Date().toISOString().slice(0,10);
  const modeSel = document.getElementById('paste-mode');
  if (modeSel) { modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if (modeLabel) modeLabel.style.display = 'none';
  const hintEl = document.getElementById('paste-mode-hint');
  if (hintEl) hintEl.innerHTML=`<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">🏆 토너먼트 경기 결과 입력</span> — <b>${m.a}</b> vs <b>${m.b}</b><br><span style="font-size:var(--fs-caption);color:#6b7280">형식: <code>${m.a} ${m.b} [맵]</code> / <code>${m.b} ${m.a} [맵]</code> — 여러 줄 입력 가능</span></div>`;
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  const _pd = document.querySelector('#pasteModal details');
  if (_pd) _pd.style.display = 'none';
  const _pt = document.querySelector('#pasteModal .mtitle');
  if (_pt) _pt.textContent = '📋 결과 붙여넣기';
  if (textarea) textarea.focus();
}

function _pcBktPasteApplyLogic(savable, tn) {
  const {ri: stateRi, mi: stateMi} = window._grpPasteState;
  const isBulk = stateRi === null;
  const dateEl = document.getElementById('paste-date');
  const dateVal = dateEl ? dateEl.value : '';

  // Helper: apply games array to a single bracket match
  function _applyToMatch(m, matchRi, matchMi, games) {
    const scoreA = games.filter(g=>g.winner==='A').length;
    const scoreB = games.filter(g=>g.winner==='B').length;
    const isTie = (scoreA === scoreB);
    const winner = isTie ? '' : (scoreA > scoreB ? 'A' : 'B');
    if (dateVal) m.d = dateVal;
    m._games = games;
    if (games.length === 1 && games[0].map) m.map = games[0].map; else if (games.length > 1) m.map = '';
    const bktMatchId = `pbn_${tn.id}_${matchRi}_${matchMi}`;
    const tieId = `${bktMatchId}_tie`;
    const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
    // 이전 승자 기록이 있었다면 롤백(BYE 제외)
    if (m.winner && !isBye(m.a) && !isBye(m.b)) {
      try{ _revertProMatch(bktMatchId); }catch(e){}
    }
    // 동률 기록은 승자 확정/취소와 독립이므로, 항상 기존 동률 기록은 제거 후 필요시 재저장
    try{ _revertDrawMatch(tieId); }catch(e){}
    m.winner = winner; // tie면 '' (승자 미정)
    const nextMi = Math.floor(matchMi/2), isA = matchMi%2===0;
    const clearCascadeFromNext = ()=>{
      if (!(tn.bracket[matchRi+1] && tn.bracket[matchRi+1][nextMi])) return;
      const next = tn.bracket[matchRi+1][nextMi];
      if (isA) next.a = 'TBD'; else next.b = 'TBD';
      next.winner = '';
      let curMi = nextMi;
      for (let r = matchRi+2; r < tn.bracket.length; r++) {
        const nxt2Mi = Math.floor(curMi/2);
        const isA2 = curMi%2===0;
        if (!tn.bracket[r] || !tn.bracket[r][nxt2Mi]) break;
        if (isA2) tn.bracket[r][nxt2Mi].a='TBD'; else tn.bracket[r][nxt2Mi].b='TBD';
        tn.bracket[r][nxt2Mi].winner='';
        curMi = nxt2Mi;
      }
    };
    if (isTie) {
      // 동률: 전파/히스토리 반영하지 않고, 다음 라운드 슬롯은 비움
      clearCascadeFromNext();
      // 동률도 저장(스트리머 상세/기록에서 확인 가능)
      try{
        if(!isBye(m.a) && !isBye(m.b) && typeof applyDrawResult==='function' && (scoreA+scoreB)>0){
          applyDrawResult(m.a, m.b, m.d||'', m.map||'-', tieId, '', '', '프로리그대회(토너먼트)', scoreA, scoreB);
        }
      }catch(e){}
    } else if (tn.bracket[matchRi+1] && tn.bracket[matchRi+1][nextMi]) {
      const next = tn.bracket[matchRi+1][nextMi];
      const wSlot = winner==='A'?m.a:m.b;
      if (isA) next.a = wSlot; else next.b = wSlot;
    }
    const semiRi = tn.bracket.length-2;
    if (tn.thirdPlace && matchRi===semiRi && tn.bracket.length>=2 && (matchMi===0||matchMi===1)) {
      const thirdKey=`pbn_${tn.id}_3rd`;
      if (tn.thirdPlace.winner) _revertProMatch(thirdKey);
      tn.thirdPlace.winner='';
      const loser = winner==='A'?m.b:(winner==='B'?m.a:'');
      if (matchMi===0) tn.thirdPlace.a=loser||'TBD'; else tn.thirdPlace.b=loser||'TBD';
    }
    // 동률일 때는 승자 미정이므로 히스토리 반영을 하지 않음(승자 확정 시 반영)
    if (!isTie && !isBye(m.a) && !isBye(m.b)) {
      _syncBktMatchToHistory(tn, m, bktMatchId, matchRi, matchMi);
    }
    return true;
  }

  if (!isBulk) {
    // Single match mode (per-match 📋 button)
    const m = (tn.bracket||[])[stateRi]?.[stateMi];
    if (!m || !m.a || !m.b) return false;
    const games = [];
    for (const r of savable) {
      if (r._scoreOnly) {
        const a = (r._scoreA||0), b = (r._scoreB||0);
        for(let i=0;i<a;i++) games.push({winner:'A', map:''});
        for(let i=0;i<b;i++) games.push({winner:'B', map:''});
        continue;
      }
      if (!r.wPlayer || !r.lPlayer) continue;
      const wn = r.wPlayer.name;
      let winner = '';
      if (wn === m.a) winner = 'A';
      else if (wn === m.b) winner = 'B';
      else { alert(`"${wn}"은(는) 해당 경기 선수가 아닙니다.\n${m.a} vs ${m.b}`); return false; }
      games.push({ winner, map: r.map||'' });
    }
    if (!games.length) { alert('저장 가능한 경기가 없습니다.'); return false; }
    const ok = _applyToMatch(m, stateRi, stateMi, games);
    if (!ok) return false;
    save();
    return true;
  }

  // Bulk mode: auto-detect which match each game belongs to
  const rounds = tn.bracket || [];
  // Build lookup: playerName → {ri, mi, side:'A'|'B'}
  const playerMap = {};
  rounds.forEach((rnd, ri) => rnd.forEach((m, mi) => {
    if (!m.a || !m.b || m.a==='TBD' || m.b==='TBD') return;
    const key = `${ri}-${mi}`;
    if (!playerMap[m.a]) playerMap[m.a] = [];
    if (!playerMap[m.b]) playerMap[m.b] = [];
    playerMap[m.a].push({ri, mi, side:'A', key});
    playerMap[m.b].push({ri, mi, side:'B', key});
  }));

  // Group parsed results by match key
  const matchGroups = {}; // key → {ri, mi, games:[]}
  const unmatched = [];
  for (const r of savable) {
    if (r._scoreOnly) continue; // 여러경기 일괄 모드에서는 스코어만 라인은 지원하지 않음
    if (!r.wPlayer || !r.lPlayer) continue;
    const wn = r.wPlayer.name;
    const ln = r.lPlayer.name;
    // Find a match that has both players
    const wEntries = playerMap[wn] || [];
    let found = null;
    for (const e of wEntries) {
      const m = rounds[e.ri]?.[e.mi];
      if (!m) continue;
      const other = e.side==='A' ? m.b : m.a;
      if (other === ln) { found = e; break; }
    }
    if (!found) { unmatched.push(`${wn} vs ${ln}`); continue; }
    const key = found.key;
    if (!matchGroups[key]) matchGroups[key] = {ri: found.ri, mi: found.mi, games: []};
    const winner = found.side; // winner is wPlayer's side
    matchGroups[key].games.push({winner, map: r.map||''});
  }

  const keys = Object.keys(matchGroups);
  if (!keys.length) {
    // (요청사항) 대진표가 아직 TBD라 매칭이 안 되는 경우가 많음 → 붙여넣기만으로 대진표 자동 생성/채움 시도
    // 조건: savable(선수 인식된 경기)이 있고, 라운드 정보가 있거나(64강/32강...) 전체 토너먼트를 입력하는 경우
    const _hasSavable = savable.some(r=>r && r.wPlayer && r.lPlayer);
    const _hasRoundHint = savable.some(r=>{
      const rl = (r && (r._rndLabel || r.rndLabel || r._roundLabel)) || '';
      const memo = (r && (r._lineMemo || r.memo)) || '';
      return /(?:\d{1,3}강|결승|준결승|4강)/.test(String(rl)) || /(?:\d{1,3}강|결승|준결승|4강)/.test(String(memo));
    });
    if (_hasSavable && (tn.bracket==null || tn.bracket.length===0 || _hasRoundHint)) {
      // 기존 브라켓에 결과가 있으면 덮어쓰기 확인
      const _hasAnyWinner = (tn.bracket||[]).some(rnd=>(rnd||[]).some(m=>m && m.winner));
      if(_hasAnyWinner){
        if(!confirm('현재 대진표에 이미 입력된 결과가 있습니다.\n붙여넣기 내용으로 대진표를 자동 생성/재구성하면 기존 입력이 덮어써질 수 있습니다.\n\n계속할까요?')) return false;
      }
      try{
        const ok = (typeof _pcBktBuildFromPasteApplyLogic==='function') ? _pcBktBuildFromPasteApplyLogic(savable, tn) : false;
        if(ok){
          alert('대진표를 자동으로 채운 뒤 결과를 반영했습니다.');
          return true;
        }
      }catch(e){}
    }
    const msg = unmatched.length ? `인식된 경기가 없습니다.\n미인식: ${unmatched.join(', ')}` : '저장 가능한 경기가 없습니다.';
    alert(msg);
    return false;
  }

  let saved = 0;
  for (const key of keys) {
    const {ri, mi, games} = matchGroups[key];
    const m = rounds[ri]?.[mi];
    if (!m) continue;
    const ok = _applyToMatch(m, ri, mi, games);
    if (ok) saved++;
  }

  if (unmatched.length) alert(`일부 경기를 인식하지 못했습니다:\n${unmatched.join('\n')}`);
  if (!saved) return false;
  save();
  try{ render(); }catch(e){}
  return true;
}

function proCompOpenThirdPaste(tnId) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const tp = tn.thirdPlace;
  if (!tp || !tp.a || !tp.b || tp.a==='TBD' || tp.b==='TBD') return alert('양 선수가 모두 확정된 경기에서만 이용 가능합니다.');

  const modal = document.createElement('div');
  modal.id = '_pcThirdPaste';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  const defDate = tp.d || new Date().toISOString().slice(0,10);
  modal.innerHTML = `<div style="background:var(--white);border-radius:var(--r2);padding:22px;width:420px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:6px">📋 결과 붙여넣기 (3·4위전)</div>
    <div style="font-size:var(--fs-sm);color:var(--text3);margin-bottom:10px;line-height:1.6">
      <b>${tp.a}</b> vs <b>${tp.b}</b><br>
      이 경기 결과만 저장합니다. 여러 줄 입력 가능<br>
      형식: <code>A [맵]</code> / <code>B [맵]</code> 또는 <code>승자이름 패자이름 [맵]</code>
    </div>
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text3);min-width:44px">날짜</div>
      <input id="_pcThirdPasteDate" type="date" value="${defDate}" style="flex:1;padding:8px;border-radius:var(--r);border:1.5px solid var(--border);box-sizing:border-box">
    </div>
    <textarea id="_pcThirdPasteText" rows="5" placeholder="A 투혼" style="width:100%;padding:10px;border-radius:12px;border:1.5px solid var(--border);font-size:var(--fs-base);box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveThirdPaste('${tnId}')">적용</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_pcThirdPaste').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  const ta = document.getElementById('_pcThirdPasteText');
  if (ta) ta.focus();
}

function proCompSaveThirdPaste(tnId) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const tp = tn.thirdPlace;
  if (!tp || !tp.a || !tp.b) return;

  const text = (document.getElementById('_pcThirdPasteText')||{}).value||'';
  if (!text.trim()) return;
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  if (!lines.length) return;

  const games = [];
  for (const line of lines) {
    const parts = line.split(/[\s\t]+/).filter(Boolean);
    if (!parts.length) continue;

    let wName = parts[0] || '';
    const wTok = (wName||'').toUpperCase();
    let winner = '';
    let lName = '';
    let map = '';

    if (wTok === 'A' || wTok === 'B') {
      winner = wTok;
      map = parts.slice(1).join(' ').trim();
    } else {
      if (parts.length >= 2) {
        lName = parts[1] || '';
        map = parts.slice(2).join(' ').trim();
      } else {
        map = parts.slice(1).join(' ').trim();
      }
      if (!wName) continue;
      if (wName !== tp.a && wName !== tp.b) return alert(`"${wName}"은(는) 해당 경기 선수가 아닙니다.\n${tp.a} vs ${tp.b}`);
      winner = wName === tp.a ? 'A' : 'B';
      const expectedLoser = winner === 'A' ? tp.b : tp.a;
      if (lName && lName !== expectedLoser) return alert(`패자 이름이 일치하지 않습니다.\n입력: ${wName} ${lName}\n대상: ${tp.a} vs ${tp.b}`);
    }

    if (!winner) continue;
    games.push({ winner, map });
  }

  if (!games.length) return alert('저장 가능한 경기가 없습니다.');
  const scoreA = games.filter(g => g.winner === 'A').length;
  const scoreB = games.filter(g => g.winner === 'B').length;
  if (scoreA === scoreB) return alert(`승패가 동률입니다.\nA:${scoreA} / B:${scoreB}\n한 줄 더 추가하거나 수동으로 승자를 지정하세요.`);
  const winner = scoreA > scoreB ? 'A' : 'B';

  const dateVal = (document.getElementById('_pcThirdPasteDate')||{}).value || '';
  if (dateVal) tp.d = dateVal;
  tp._games = games.map(g => ({ winner: g.winner, map: g.map || '' }));
  const onlyOne = games.length === 1;
  if (onlyOne && games[0].map) tp.map = games[0].map;
  else if (!onlyOne) tp.map = '';

  const bktMatchId = `pbn_${tnId}_3rd`;
  if (tp.winner) _revertProMatch(bktMatchId);
  tp.winner = winner;
  _syncBktMatchToHistory(tn, tp, bktMatchId, '3rd', 0);

  const modal = document.getElementById('_pcThirdPaste');
  if (modal) modal.remove();
  save(); render();
}

// 조별리그 날짜별 붙여넣기
function proCompOpenDatePaste(tnId, date) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const groups = tn.groups||[];
  if (!groups.length) return alert('조편성을 먼저 설정하세요.');
  if (groups.length === 1) {
    proCompOpenPasteModal(tnId, 0, date);
    return;
  }
  // 여러 조가 있을 때 선택 다이얼로그
  const modal = document.createElement('div');
  modal.id = '_pcDatePasteGrpSel';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  const GL='ABCDEFGHIJ';
  const btns = groups.map((_,gi)=>{
    const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    return `<button class="btn btn-sm" style="background:${col};color:#fff;border-color:${col}" onclick="document.getElementById('_pcDatePasteGrpSel').remove();proCompOpenPasteModal('${tnId}',${gi},'${date}')">GROUP ${GL[gi]}</button>`;
  }).join('');
  modal.innerHTML = `<div style="background:var(--white);border-radius:var(--r2);padding:24px;width:340px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:4px">대상 조 선택</div>
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:14px">${date} 경기 결과를 입력할 조를 선택하세요.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${btns}</div>
    <button class="btn btn-w" style="width:100%" onclick="document.getElementById('_pcDatePasteGrpSel').remove()">취소</button>
  </div>`;
  document.body.appendChild(modal);
}

function proCompOpenPasteModal(tnId, gi, preDate) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  if (typeof openPasteModal !== 'function') return;
  // 공통 pasteModal 활성화 (경기입력 붙여넣기와 동일한 UI)
  _grpPasteState = {mode:'procomp-league', tnId, gi};
  openPasteModal();
  window._grpPasteMode = true;
  // 개인전 방식 고정 (승자이름 패자이름 [맵])
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ind'; sel.style.display = 'none'; if(typeof onPasteModeChange==='function') onPasteModeChange('ind'); }
  if (lbl) lbl.style.display = 'none';
  const gl = 'ABCDEFGHIJ'[gi];
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = `<span style="color:#1d4ed8;font-weight:700">${tn.name} ${gl}조 결과 입력</span>`;
  const title = document.querySelector('#pasteModal .mtitle');
  if (title) title.textContent = `조별리그 결과 일괄 입력 (${gl}조)`;
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  if (preDate) { const dateEl = document.getElementById('paste-date'); if (dateEl) dateEl.value = preDate; }
}

// 공통 pasteModal 연동 시 프로리그 조별리그 적용 로직
function _proCompLeaguePasteApplyLogic(savable) {
  const {tnId, gi} = _grpPasteState;
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return false;
  const grp = tn.groups[gi];
  // (요청사항) 조별 "기록 반영" 설정(pro/stage/none)을 붙여넣기에도 동일 적용
  const recTarget = (grp._recTarget||'').trim(); // pro | stage | none
  if (!recTarget) { alert('조편성 관리에서 해당 조의 “기록 반영”을 먼저 선택하세요.'); return false; }
  const recRound = _pcNormalizeStageRound(grp._recRound||'16강');
  const dateEl = document.getElementById('paste-date');
  const defDate = dateEl?.value || new Date().toISOString().slice(0,10);
  if (!grp.matches) grp.matches = [];
  let added = 0;
  savable.forEach(r => {
    if (!r.wPlayer||!r.lPlayer) return;
    // (요청사항) 날짜가 라인별로 포함된 경우(_lineDate) 그 날짜로 저장
    const d = (r._lineDate && /^\d{4}-\d{2}-\d{2}$/.test(r._lineDate)) ? r._lineDate : defDate;
    const newMid = 'pco_'+(Date.now()+added).toString(36)+Math.random().toString(36).slice(2,5);
    const aName = r.wPlayer.name;
    const bName = r.lPlayer.name;
    const mapVal = r.map&&r.map!=='-' ? r.map : '';
      const noteVal = r.note || '';
      const newObj = {a:aName, b:bName, winner:'A', d, map:mapVal, note:noteVal, _id:newMid};
    grp.matches.push(newObj);
    if (recTarget === 'pro') {
      applyGameResult(aName, bName, d, mapVal, newMid, '', '', '프로리그대회');
    } else if (recTarget === 'stage') {
      _pcEnsureStageRecords(tn);
      const sid = `ptr_${tnId}_${recRound}_${newMid}`;
      newObj._stageRecId = sid;
      newObj._stageRecRound = recRound;
        tn.stageRecords[recRound].push({a:aName,b:bName,winner:'A',d,map:mapVal,note:noteVal,_id:sid});
      applyGameResult(aName, bName, d, mapVal, sid, '', '', '프로리그대회');
    } // none: 반영 안함
    added++;
  });
  save(); render();
  if (added > 0) setTimeout(()=>alert(`${added}건의 경기가 추가되었습니다.`), 100);
  return true;
}

function proCompSavePaste(tnId, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const grp = tn.groups[gi];
  const recTarget = (grp._recTarget||'').trim(); // pro | stage | none
  if (!recTarget) { alert('조편성 관리에서 해당 조의 “기록 반영”을 먼저 선택하세요.'); return; }
  const recRound = _pcNormalizeStageRound(grp._recRound||'16강');
  const text = (document.getElementById('_pcPasteText')||{}).value||'';
  const defDate = (document.getElementById('_pcPasteDate')||{}).value || new Date().toISOString().slice(0,10);
  document.getElementById('_pcPasteModal').remove();
  if (!text.trim()) return;
  const lines = text.trim().split('\n').map(l=>l.trim()).filter(Boolean);
  let added = 0;
  lines.forEach(line => {
    const parts = line.split(/[\s\t]+/);
    if (parts.length < 2) return;
    let d = defDate, a = '', b = '', winnerRaw = '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
      d = parts[0]; a = parts[1]||''; b = parts[2]||''; winnerRaw = parts[3]||'';
    } else {
      a = parts[0]; b = parts[1]||''; winnerRaw = parts[2]||'';
    }
    if (!a||!b||a===b) return;
    let winner = '';
    if (winnerRaw==='A') winner='A';
    else if (winnerRaw==='B') winner='B';
    else if (winnerRaw===a) winner='A';
    else if (winnerRaw===b) winner='B';
    const newMid = 'pco_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    if (!grp.matches) grp.matches = [];
    const newObj = {a,b,winner,d,map:'',_id:newMid};
    grp.matches.push(newObj);
    if (winner) {
      if (recTarget === 'pro') {
        applyGameResult(winner==='A'?a:b, winner==='A'?b:a, d, '', newMid, '', '', '프로리그대회');
      } else if (recTarget === 'stage') {
        if(!tn.stageRecords) tn.stageRecords={};
        if(!Array.isArray(tn.stageRecords[recRound])) tn.stageRecords[recRound]=[];
        const sid = `ptr_${tnId}_${recRound}_${newMid}`;
        newObj._stageRecId = sid;
        newObj._stageRecRound = recRound;
        tn.stageRecords[recRound].push({a,b,winner,d,map:'',_id:sid});
        applyGameResult(winner==='A'?a:b, winner==='A'?b:a, d, '', sid, '', '', '프로리그대회');
      }
    }
    added++;
  });
  save(); render();
  if (added>0) alert(`${added}건의 경기가 추가되었습니다.`);
}

function proCompAddMatch(tnId, gi, preDate) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const grp = tn.groups[gi];
  if ((grp.players||[]).length < 2) { alert('조에 선수가 2명 이상 필요합니다.'); return; }
  proCompMatchState = {tnId, gi, mi: -1}; // -1 = new match
  const pList = grp.players||[];
  const pOpts = pList.map(p=>`<option value="${p}">${p}</option>`).join('');
  const defDate = preDate || new Date().toISOString().slice(0,10);
  const modal = document.createElement('div');
  modal.id = 'proMatchModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:var(--r2);padding:24px;width:420px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3);margin:auto">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:12px">📝 경기 추가</div>
    <!-- 자동 인식 섹션 -->
    <div style="background:var(--surface);border:1.5px dashed var(--border2);border-radius:var(--r);padding:12px;margin-bottom:14px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--blue);margin-bottom:6px">⚡ 자동 인식</div>
      <textarea id="pcm_auto_txt" rows="3" placeholder="경기 결과 붙여넣기 (승자🆚패자, 승/패 형식 등)" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:var(--fs-sm);font-family:monospace;resize:vertical;box-sizing:border-box" oninput="proCompAutoPreview('${tnId}',${gi})"></textarea>
      <div style="display:flex;align-items:center;gap:6px;margin-top:5px">
        <span id="pcm_auto_badge" style="display:none;font-size:var(--fs-caption);padding:2px 8px;border-radius:8px;font-weight:700;border:1px solid transparent"></span>
        <button class="btn btn-w btn-sm" style="margin-left:auto" onclick="document.getElementById('pcm_auto_txt').value='';proCompAutoPreview('${tnId}',${gi})">지우기</button>
      </div>
      <div id="pcm_auto_preview" style="margin-top:6px"></div>
      <div id="pcm_auto_save" style="display:none;margin-top:8px">
        <button class="btn btn-b" style="width:100%" onclick="proCompAutoApply('${tnId}',${gi})">⚡ 자동 추가</button>
      </div>
    </div>
    <div style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);margin-bottom:10px;display:flex;align-items:center;gap:6px"><span style="flex:1;height:1px;background:var(--border)"></span>또는 직접 입력<span style="flex:1;height:1px;background:var(--border)"></span></div>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">A 선수</label>
      <select id="pm_a" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
        <option value="">선수 선택</option>${pOpts}
      </select>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">B 선수</label>
      <select id="pm_b" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
        <option value="">선수 선택</option>${pOpts}
      </select>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">날짜</label>
      <input id="pm_d" type="date" value="${defDate}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">맵(선택)</label>
      <input id="pm_map" placeholder="선택입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">승자 (확정 경기만 선택)</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="pm_winA" class="btn btn-w" style="flex:1" onclick="document.getElementById('pm_winA').className='btn btn-b';document.getElementById('pm_winB').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">A 승</button>
        <button id="pm_winB" class="btn btn-w" style="flex:1" onclick="document.getElementById('pm_winB').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">B 승</button>
        <button id="pm_winNone" class="btn btn-b" style="flex:1" onclick="document.getElementById('pm_winNone').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winB').className='btn btn-w'">미정</button>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveMatch()">추가</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('proMatchModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

// ── 자동 인식 (parsePasteLine 기반) ──
function proCompAutoPreview(tnId, gi) {
  const raw = (document.getElementById('pcm_auto_txt')||{}).value||'';
  const badge = document.getElementById('pcm_auto_badge');
  const previewEl = document.getElementById('pcm_auto_preview');
  const saveDiv = document.getElementById('pcm_auto_save');
  if (!previewEl) return;
  if (!raw.trim()) {
    previewEl.innerHTML = '';
    if (badge) badge.style.display = 'none';
    if (saveDiv) saveDiv.style.display = 'none';
    window._pcAutoResults = null;
    return;
  }
  const lines = typeof splitPasteLines === 'function' ? splitPasteLines(raw) : raw.trim().split('\n');
  const results = [];
  // TSV(외부표) 입력 지원 + 종족 접미사(T/Z/P) 제거 + 선수 별명 매핑
  const aliasMap = (()=>{ try{ return JSON.parse(localStorage.getItem('su_player_alias_map')||'{}')||{}; }catch(e){ return {}; } })();
  const nfc = (s)=> (s&&s.normalize) ? s.normalize('NFC') : String(s||'');
  const normKey = (s)=> nfc(String(s||'')).replace(/\s+/g,'').toLowerCase();
  const stripRace = (s)=> String(s||'').trim().replace(/\s*[TZPNtzpn]$/,'').trim();
  const resolveAlias = (name0)=>{
    const name = stripRace(name0);
    if(!name) return '';
    if(aliasMap && (name in aliasMap)) return String(aliasMap[name]||'') || name;
    const nk = normKey(name);
    for(const k in (aliasMap||{})){
      if(normKey(k)===nk) return String(aliasMap[k]||'') || name;
    }
    return name;
  };
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/^\[(?:승|패)\]/.test(trimmed)) return;
    if (/\((?:승|패)\)\s*\d+\s*[：:]\s*\d+\s*\((?:승|패)\)/.test(trimmed)) return;
    // 1) TSV 포맷: 날짜\t승자\t패자\t맵\t... → parsePasteLine용으로 변환
    let lineForParse = line;
    let lineDate = '';
    try{
      const cols = String(line||'').split('\t').map(x=>x.trim());
      if(cols.length>=4 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0]||'')){
        lineDate = cols[0]||'';
        const wn = cols[1]||'', ln = cols[2]||'', mp = cols[3]||'';
        lineForParse = `${wn} ${ln} ${mp}`.trim();
      }
    }catch(e){}

    const parsed = parsePasteLine(lineForParse);
    if (!parsed) return;
    // 2) 이름 정규화(별명/종족 접미사)
    const wn2 = resolveAlias(parsed.winName);
    const ln2 = resolveAlias(parsed.loseName);
    const wMatch = findPlayerByPartialName(wn2);
    const lMatch = findPlayerByPartialName(ln2);
    results.push({
      winName: wn2, loseName: ln2,
      map: parsed.map || '-',
      wPlayer: wMatch.player, lPlayer: lMatch.player,
      wCandidates: wMatch.candidates||[], lCandidates: lMatch.candidates||[],
      wSimilar: wMatch.similar||[], lSimilar: lMatch.similar||[],
      _lineDate: lineDate || ''
    });
  });
  // 이전 후보 선택 복원
  const prev = window._pcAutoResults;
  if (prev && prev.length === results.length) {
    results.forEach((r, i) => {
      const p = prev[i];
      if (!p || p.winName !== r.winName || p.loseName !== r.loseName) return;
      if (p.wPlayer && !r.wPlayer) { r.wPlayer = p.wPlayer; r.wCandidates = p.wCandidates; }
      if (p.lPlayer && !r.lPlayer) { r.lPlayer = p.lPlayer; r.lCandidates = p.lCandidates; }
      if (p.map && p.map !== '-') r.map = p.map;
    });
  }
  window._pcAutoResults = results;
  _renderPcAutoPreview(tnId, gi);
}

function _renderPcAutoPreview(tnId, gi) {
  const results = window._pcAutoResults || [];
  const badge = document.getElementById('pcm_auto_badge');
  const previewEl = document.getElementById('pcm_auto_preview');
  const saveDiv = document.getElementById('pcm_auto_save');
  if (!previewEl) return;
  const savable = results.filter(r => r.wPlayer && r.lPlayer);
  if (badge) {
    badge.style.display = results.length ? 'inline' : 'none';
    badge.textContent = `✅ ${savable.length}/${results.length}건 인식`;
    badge.style.background = savable.length === results.length ? '#dcfce7' : '#fef9c3';
    badge.style.color = savable.length === results.length ? '#16a34a' : '#b45309';
    badge.style.borderColor = savable.length === results.length ? '#bbf7d0' : '#fcd34d';
  }
  if (saveDiv) saveDiv.style.display = savable.length ? '' : 'none';
  if (!results.length) {
    previewEl.innerHTML = '<div style="font-size:var(--fs-caption);color:#dc2626;text-align:center;padding:8px">인식된 경기 없음</div>';
    return;
  }
  const allMaps = [...new Set([...maps.filter(m=>m&&m!=='-'), ...results.map(r=>r.map).filter(m=>m&&m!=='-')])].sort();
  const tId = JSON.stringify(tnId);
  const buildCell = (i, ok, ambig, player, rawName, cands, similar, role) => {
    if (ok) return `<button onclick="proCompPcPick(${i},${JSON.stringify(role)},${JSON.stringify(player.name)},${tId},${gi})" style="font-size:var(--fs-sm);font-weight:900;color:${role==='w'?'#1d4ed8':'#991b1b'};background:${role==='w'?'#dbeafe':'#fee2e2'};border:1.5px solid ${role==='w'?'#93c5fd':'#fca5a5'};border-radius:7px;padding:2px 8px;cursor:pointer;white-space:nowrap">${player.name}</button>`;
    if (ambig) return `<div><span style="color:#b45309;font-size:10px;font-weight:700">${rawName}</span><div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">${cands.map(c=>`<button onclick="proCompPcPick(${i},${JSON.stringify(role)},${JSON.stringify(c.name)},${tId},${gi})" style="padding:2px 6px;border-radius:4px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:10px;cursor:pointer">${c.name}</button>`).join('')}</div></div>`;
    return `<div><span style="color:#dc2626;font-size:var(--fs-caption);font-weight:700">${rawName||'?'}</span>${similar.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">${similar.map(c=>`<button onclick="proCompPcPick(${i},${JSON.stringify(role)},${JSON.stringify(c.name)},${tId},${gi})" style="padding:2px 6px;border-radius:4px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:10px;cursor:pointer">${c.name}</button>`).join('')}</div>`:''}</div>`;
  };
  let h = `<div style="overflow-x:auto;border-radius:8px;border:1px solid var(--border)"><table style="width:100%;border-collapse:collapse;font-size:var(--fs-caption)">
    <thead><tr style="background:var(--surface)">
      <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--text3)">승자</th>
      <th style="padding:5px 3px;width:28px"></th>
      <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--text3)">패자</th>
      <th style="padding:5px 6px;text-align:left;font-weight:700;color:var(--text3)">맵</th>
      <th style="padding:5px 4px;width:28px"></th>
    </tr></thead><tbody>`;
  results.forEach((r, i) => {
    const wOk = !!r.wPlayer, lOk = !!r.lPlayer, ok = wOk && lOk;
    const wAmbig = !wOk && r.wCandidates.length > 1;
    const lAmbig = !lOk && r.lCandidates.length > 1;
    const wCell = buildCell(i, wOk, wAmbig, r.wPlayer, r.winName, r.wCandidates, r.wSimilar, 'w');
    const lCell = buildCell(i, lOk, lAmbig, r.lPlayer, r.loseName, r.lCandidates, r.lSimilar, 'l');
    const mapOpts = `<option value="-">-</option>` + allMaps.map(m=>`<option value="${m}" ${m===r.map?'selected':''}>${m}</option>`).join('') + `<option value="__c__">직접입력</option>`;
    const mapSel = `<select onchange="if(this.value==='__c__'){const v=prompt('맵 이름:');if(v){window._pcAutoResults[${i}].map=v;_renderPcAutoPreview(${tId},${gi})}}else{window._pcAutoResults[${i}].map=this.value}" style="width:65px;border:1px solid var(--border2);border-radius:5px;padding:2px 3px;font-size:10px">${mapOpts}</select>`;
    const flipBtn = `<button onclick="proCompPcFlip(${i},${tId},${gi})" title="승패 교체" style="padding:2px 5px;border-radius:4px;border:1px solid #ddd6fe;background:#f5f3ff;font-size:var(--fs-sm);cursor:pointer">⇄</button>`;
    const status = ok
      ? `<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:1px 4px;border-radius:6px">✓</span>`
      : (wAmbig||lAmbig)
        ? `<span style="background:#fef9c3;color:#b45309;border:1px solid #fcd34d;font-size:10px;font-weight:700;padding:1px 4px;border-radius:6px">?</span>`
        : `<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:1px 4px;border-radius:6px">✗</span>`;
    h += `<tr style="background:${ok?'#f8faff':(wAmbig||lAmbig)?'#fffbeb':'#fff8f8'};border-bottom:1px solid #f0f0f0">
      <td style="padding:5px 6px">${wCell}</td>
      <td style="padding:5px 3px;text-align:center">${flipBtn}</td>
      <td style="padding:5px 6px">${lCell}</td>
      <td style="padding:5px 5px">${mapSel}</td>
      <td style="padding:5px 4px;text-align:center">${status}</td>
    </tr>`;
  });
  h += `</tbody></table></div>`;
  previewEl.innerHTML = h;
}

function proCompPcPick(i, role, name, tnId, gi) {
  const r = (window._pcAutoResults||[])[i];
  if (!r) return;
  const p = players.find(pl => pl.name === name);
  if (!p) return;
  if (role === 'w') { r.wPlayer = p; r.wCandidates = [p]; }
  else { r.lPlayer = p; r.lCandidates = [p]; }
  _renderPcAutoPreview(tnId, gi);
}

function proCompPcFlip(i, tnId, gi) {
  const r = (window._pcAutoResults||[])[i];
  if (!r) return;
  [r.winName, r.loseName] = [r.loseName, r.winName];
  [r.wPlayer, r.lPlayer] = [r.lPlayer, r.wPlayer];
  [r.wCandidates, r.lCandidates] = [r.lCandidates, r.wCandidates];
  [r.wSimilar, r.lSimilar] = [r.lSimilar, r.wSimilar];
  _renderPcAutoPreview(tnId, gi);
}

function proCompAutoApply(tnId, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn || !tn.groups[gi]) return;
  const grp = tn.groups[gi];
  const recTarget = (grp._recTarget||'').trim(); // pro | stage | none
  if (!recTarget) { alert('조편성 관리에서 해당 조의 “기록 반영”을 먼저 선택하세요.'); return; }
  const recRound = _pcNormalizeStageRound(grp._recRound||'16강');
  const savable = (window._pcAutoResults||[]).filter(r => r.wPlayer && r.lPlayer);
  if (!savable.length) return alert('저장 가능한 경기가 없습니다.');
  const defDate = (document.getElementById('pm_d')||{}).value || new Date().toISOString().slice(0,10);
  if (!grp.matches) grp.matches = [];

  // (요청사항) 같은 두 선수의 경기는 여러 줄이어도 매치 1건으로 합쳐서 저장
  // - 매치 안에는 _games[] 로 게임별 승자/맵/날짜를 보관
  const pairMap = new Map(); // key: 정렬된 두 선수 이름 → { aName, bName, games:[] }
  savable.forEach(r => {
    const aName = r.wPlayer.name, bName = r.lPlayer.name;
    const key = [aName, bName].slice().sort().join('|');
    let pair = pairMap.get(key);
    if (!pair) { pair = { aName, bName, games: [] }; pairMap.set(key, pair); }
    const mapVal = r.map && r.map !== '-' ? r.map : '';
    const dVal = (r._lineDate && /^\d{4}-\d{2}-\d{2}$/.test(r._lineDate)) ? r._lineDate : defDate;
    // pair.aName 기준으로 이번 게임의 승자를 A/B로 환산
    const winSide = (aName === pair.aName) ? 'A' : 'B';
    pair.games.push({ winner: winSide, map: mapVal, d: dVal, note: r.note || '' });
  });

  let added = 0;
  pairMap.forEach(pair => {
    const mid = 'pco_' + (Date.now()+added).toString(36) + Math.random().toString(36).slice(2,5);
    const games = pair.games;
    const scoreA = games.filter(g=>g.winner==='A').length;
    const scoreB = games.filter(g=>g.winner==='B').length;
    const winnerVal = scoreA>scoreB ? 'A' : scoreB>scoreA ? 'B' : '';
    const lastGame = games[games.length-1];
    const dVal = lastGame.d || defDate;
    const mapVal = games.length===1 ? (games[0].map||'') : '';
    const noteVal = games.map(g=>g.note).filter(Boolean).join(' / ');
    const newObj = { a: pair.aName, b: pair.bName, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: mid, _games: games };
    grp.matches.push(newObj);
    if (recTarget === 'pro') {
      games.forEach((g, idx) => {
        const gameId = `${mid}_s0_g${idx}`;
        applyGameResult(g.winner==='A'?pair.aName:pair.bName, g.winner==='A'?pair.bName:pair.aName, g.d, g.map||'', gameId, '', '', '프로리그대회');
      });
    } else if (recTarget === 'stage') {
      _pcEnsureStageRecords(tn);
      const sid = `ptr_${tnId}_${recRound}_${mid}`;
      newObj._stageRecId = sid;
      newObj._stageRecRound = recRound;
      tn.stageRecords[recRound].push({a:pair.aName,b:pair.bName,winner:winnerVal,d:dVal,map:mapVal,note:noteVal,_id:sid,_games:games});
      games.forEach((g, idx) => {
        const gameId = `${sid}_s0_g${idx}`;
        applyGameResult(g.winner==='A'?pair.aName:pair.bName, g.winner==='A'?pair.bName:pair.aName, g.d, g.map||'', gameId, '', '', '프로리그대회');
      });
    }
    added++;
  });
  save();
  document.getElementById('proMatchModal').remove();
  render();
  setTimeout(() => alert(`${pairMap.size}건의 매치(총 ${savable.length}경기)가 추가되었습니다.`), 100);
}

// (요청사항) 예전에 자동인식으로 한 줄씩 따로 저장된 경기들을 같은 두 선수 기준으로 합치는 마이그레이션 도구
// - 조별리그(모든 조)를 훑어서 같은 대결(선수 페어)이 매치 여러 건으로 나뉘어 있으면 하나로 합침
// - 기존 개인 전적(history)은 먼저 롤백 후, 합쳐진 매치 기준(새 matchId + _s0_g{n})으로 다시 반영
function proCompMergeDuplicateMatches(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn || !Array.isArray(tn.groups)) { alert('대회를 찾을 수 없습니다.'); return; }
  if (!confirm('같은 두 선수의 경기를 매치 1건으로 합칩니다.\n개인 전적은 자동으로 다시 계산되어 반영됩니다.\n계속하시겠습니까?')) return;

  let mergedMatchCount = 0, groupTouchedCount = 0;

  tn.groups.forEach(grp => {
    const matches = grp.matches || [];
    if (matches.length < 2) return;
    const recTarget = (grp._recTarget||'').trim();

    // 1) 같은 두 선수(순서 무관) 기준으로 그룹핑
    const pairMap = new Map(); // key -> { canonA, canonB, items:[] }
    matches.forEach(m => {
      if (!m.a || !m.b) return;
      const key = [m.a, m.b].slice().sort().join('|');
      let pair = pairMap.get(key);
      if (!pair) { pair = { canonA: m.a, canonB: m.b, items: [] }; pairMap.set(key, pair); }
      pair.items.push(m);
    });

    let groupTouched = false;
    pairMap.forEach(pair => {
      if (pair.items.length < 2) return; // 이미 1건뿐이면 합칠 필요 없음
      groupTouched = true;

      // 2) 기존 게임들을 canonA/canonB 기준으로 환산해 모으고, 기존 전적은 롤백
      const mergedGames = [];
      pair.items.forEach(item => {
        const subGames = (Array.isArray(item._games) && item._games.length)
          ? item._games
          : [{ winner: item.winner, map: item.map || '', d: item.d || '', note: item.note || '' }];
        subGames.forEach(g => {
          if (!g.winner) return;
          const winnerName = g.winner === 'A' ? item.a : item.b;
          const winnerCanon = winnerName === pair.canonA ? 'A' : 'B';
          mergedGames.push({ winner: winnerCanon, map: g.map || '', d: g.d || item.d || '', note: g.note || item.note || '' });
        });
        // 기존 전적 롤백 (stage 반영분이면 stageRecords에서도 제거)
        if (item._stageRecId) {
          try { _revertProMatch(item._stageRecId); } catch(e) {}
          try {
            const rr = item._stageRecRound || '16강';
            if (tn.stageRecords && Array.isArray(tn.stageRecords[rr])) {
              const si = tn.stageRecords[rr].findIndex(x => x && x._id === item._stageRecId);
              if (si >= 0) tn.stageRecords[rr].splice(si, 1);
            }
          } catch(e) {}
        } else if (item._id) {
          try { _revertProMatch(item._id); } catch(e) {}
        }
      });
      if (!mergedGames.length) return;

      // 3) 합쳐진 매치 1건 생성
      const mid = 'pco_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '_' + mergedMatchCount;
      const scoreA = mergedGames.filter(g => g.winner === 'A').length;
      const scoreB = mergedGames.filter(g => g.winner === 'B').length;
      const winnerVal = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : '';
      const lastGame = mergedGames[mergedGames.length - 1];
      const dVal = lastGame.d || '';
      const mapVal = mergedGames.length === 1 ? (mergedGames[0].map || '') : '';
      const noteVal = mergedGames.map(g => g.note).filter(Boolean).join(' / ');
      const newObj = { a: pair.canonA, b: pair.canonB, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: mid, _games: mergedGames };

      const recRound = _pcNormalizeStageRound(grp._recRound || '16강');
      if (recTarget === 'pro') {
        mergedGames.forEach((g, idx) => {
          const gameId = `${mid}_s0_g${idx}`;
          applyGameResult(g.winner === 'A' ? pair.canonA : pair.canonB, g.winner === 'A' ? pair.canonB : pair.canonA, g.d, g.map || '', gameId, '', '', '프로리그대회');
        });
      } else if (recTarget === 'stage') {
        _pcEnsureStageRecords(tn);
        const sid = `ptr_${tnId}_${recRound}_${mid}`;
        newObj._stageRecId = sid;
        newObj._stageRecRound = recRound;
        tn.stageRecords[recRound].push({ a: pair.canonA, b: pair.canonB, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: sid, _games: mergedGames });
        mergedGames.forEach((g, idx) => {
          const gameId = `${sid}_s0_g${idx}`;
          applyGameResult(g.winner === 'A' ? pair.canonA : pair.canonB, g.winner === 'A' ? pair.canonB : pair.canonA, g.d, g.map || '', gameId, '', '', '프로리그대회');
        });
      }

      // 4) 기존 여러 건 제거 후 합쳐진 1건으로 교체
      pair.items.forEach(item => {
        const idx = grp.matches.indexOf(item);
        if (idx >= 0) grp.matches.splice(idx, 1);
      });
      grp.matches.push(newObj);
      mergedMatchCount++;
    });
    if (groupTouched) groupTouchedCount++;
  });

  if (!mergedMatchCount) {
    alert('합칠 수 있는 중복 경기가 없습니다. (이미 정리되어 있거나 대결마다 1경기뿐입니다)');
    return;
  }
  save();
  render();
  setTimeout(() => alert(`${groupTouchedCount}개 조에서 ${mergedMatchCount}건의 매치로 합쳤습니다.`), 100);
}

try { window.proCompMergeDuplicateMatches = proCompMergeDuplicateMatches; } catch(e) {}

function proCompEditMatch(tnId, gi, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const m = tn.groups[gi].matches[mi];
  if (!m) return;
  proCompMatchState = {tnId, gi, mi};
  const pList = (tn.groups[gi].players||[]);
  const pOptsA = pList.map(p=>`<option value="${p}"${m.a===p?' selected':''}>${p}</option>`).join('');
  const pOptsB = pList.map(p=>`<option value="${p}"${m.b===p?' selected':''}>${p}</option>`).join('');
  const modal = document.createElement('div');
  modal.id = 'proMatchModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:var(--r2);padding:24px;width:340px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:16px">?�️ 경기 결과 ?�력</div>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">A ?�수</label>
      ${pList.length>=2
        ?`<select id="pm_a" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box"><option value="">?�수 ?�택</option>${pOptsA}</select>`
        :`<input id="pm_a" value="${m.a||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">`}
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">B ?�수</label>
      ${pList.length>=2
        ?`<select id="pm_b" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box"><option value="">?�수 ?�택</option>${pOptsB}</select>`
        :`<input id="pm_b" value="${m.b||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">`}
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">승자</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="pm_winA" class="btn ${m.winner==='A'?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winA').className='btn btn-b';document.getElementById('pm_winB').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">A 승</button>
        <button id="pm_winB" class="btn ${m.winner==='B'?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winB').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">B 승</button>
        <button id="pm_winNone" class="btn ${!m.winner?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winNone').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winB').className='btn btn-w'">미정</button>
      </div>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">날짜</label>
      <input id="pm_d" type="date" value="${m.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">맵</label>
      <input id="pm_map" value="${m.map||''}" placeholder="선택입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveMatch()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('proMatchModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function _revertProMatch(matchId) {
  if (!matchId) return;
  const pref = matchId + '_s';
  players.forEach(p => {
    if (!p.history) return;
    // (요청사항) 대진표는 matchId 아래로 gameId가 여러개 생길 수 있음(matchId_s0_g0 ...)
    // → base matchId로 롤백 시 해당 prefix 전부 롤백
    const hits = p.history.filter(x => x.matchId === matchId || (x.matchId && x.matchId.startsWith(pref)));
    if (!hits.length) return;
    hits.forEach(h => {
      if (h.result === '승') { p.win = Math.max(0,(p.win||0)-1); p.points = (p.points||0)-3; }
      else if (h.result === '패') { p.loss = Math.max(0,(p.loss||0)-1); p.points = (p.points||0)+3; }
      if (h.eloDelta != null) p.elo = (p.elo||1200) - h.eloDelta;
    });
    p.history = p.history.filter(x => !(x.matchId === matchId || (x.matchId && x.matchId.startsWith(pref))));
  });
}

// (요청사항) 무승부(2:2 등) 히스토리 롤백 — 승/패/포인트/ELO 조정 없음
function _revertDrawMatch(matchId){
  if(!matchId) return;
  players.forEach(p=>{
    if(!p.history) return;
    const has = p.history.some(x=>x.matchId===matchId && x.result==='무');
    if(!has) return;
    p.history = p.history.filter(x=>x.matchId!==matchId);
  });
}

function proCompSaveMatch() {
  const {tnId, gi, mi} = proCompMatchState;
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const grp = tn.groups[gi];
  // (요청사항) 조별 "기록 반영 대상" 선택이 필수
  const recTarget = (grp._recTarget||'').trim(); // pro | stage | none
  if (!recTarget) { alert('조편성 관리에서 해당 조의 “기록 반영”을 먼저 선택하세요.'); return; }
  const recRound = _pcNormalizeStageRound(grp._recRound||'16강');
  const aRaw = document.getElementById('pm_a').value.trim();
  const bRaw = document.getElementById('pm_b').value.trim();
  if (!aRaw || !bRaw) { alert('A, B 선수를 모두 선택하세요.'); return; }
  const aInfo = (typeof window.resolvePlayerName==='function') ? window.resolvePlayerName(aRaw) : {name:aRaw};
  const bInfo = (typeof window.resolvePlayerName==='function') ? window.resolvePlayerName(bRaw) : {name:bRaw};
  const aVal = aInfo.name || aRaw;
  const bVal = bInfo.name || bRaw;
  const winA = document.getElementById('pm_winA').classList.contains('btn-b');
  const winB = document.getElementById('pm_winB').classList.contains('btn-b');
  const winVal = winA?'A':winB?'B':'';
  const dVal = document.getElementById('pm_d').value;
  const mapVal = document.getElementById('pm_map').value.trim();
  if (mi === -1) {
    // 새 경기 추가
    if (!tn.groups[gi].matches) tn.groups[gi].matches = [];
    const newMid = 'pco_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const newObj = {a:aVal, b:bVal, winner:winVal, d:dVal, map:mapVal, _id:newMid};
    tn.groups[gi].matches.push(newObj);
    if (winVal) {
      if (recTarget === 'pro') {
        applyGameResult(winVal==='A'?aVal:bVal, winVal==='A'?bVal:aVal, dVal, mapVal, newMid, '', '', '프로리그대회');
      } else if (recTarget === 'stage') {
        if(!tn.stageRecords) tn.stageRecords={};
        if(!Array.isArray(tn.stageRecords[recRound])) tn.stageRecords[recRound]=[];
        const sid = `ptr_${tnId}_${recRound}_${newMid}`;
        newObj._stageRecId = sid;
        newObj._stageRecRound = recRound;
        tn.stageRecords[recRound].push({a:aVal,b:bVal,winner:winVal,d:dVal,map:mapVal,_id:sid});
        applyGameResult(winVal==='A'?aVal:bVal, winVal==='A'?bVal:aVal, dVal, mapVal, sid, '', '', '프로리그대회');
      }
    }
  } else {
    const m = tn.groups[gi].matches[mi];
    if (!m) return;
    if (!m._id) m._id = 'pco_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    // 기존 반영 롤백
    if (m.winner) {
      if (m._stageRecId) {
        try{ _revertProMatch(m._stageRecId); }catch(e){}
        try{
          const rr=m._stageRecRound||recRound;
          if(tn.stageRecords && Array.isArray(tn.stageRecords[rr])){
            const si=tn.stageRecords[rr].findIndex(x=>x && x._id===m._stageRecId);
            if(si>=0) tn.stageRecords[rr].splice(si,1);
          }
        }catch(e){}
        m._stageRecId = ''; m._stageRecRound='';
      } else {
        _revertProMatch(m._id);
      }
    }
    const noteVal = (document.getElementById('pm_note')?.value || m.note || '').trim();
    m.a = aVal; m.b = bVal; m.d = dVal; m.map = mapVal; m.note = noteVal; m.winner = winVal;
    if (winVal) {
      if (recTarget === 'pro') {
        applyGameResult(winVal==='A'?aVal:bVal, winVal==='A'?bVal:aVal, dVal, mapVal, m._id, '', '', '프로리그대회');
      } else if (recTarget === 'stage') {
        if(!tn.stageRecords) tn.stageRecords={};
        if(!Array.isArray(tn.stageRecords[recRound])) tn.stageRecords[recRound]=[];
        const sid = m._stageRecId || `ptr_${tnId}_${recRound}_${m._id}`;
        m._stageRecId = sid;
        m._stageRecRound = recRound;
        // 기존 동일 id 있으면 업데이트, 없으면 추가
        const si = tn.stageRecords[recRound].findIndex(x=>x && x._id===sid);
        const recObj = {a:aVal,b:bVal,winner:winVal,d:dVal,map:mapVal,note:noteVal,_id:sid};
        if(si>=0) tn.stageRecords[recRound][si]=recObj;
        else tn.stageRecords[recRound].push(recObj);
        applyGameResult(winVal==='A'?aVal:bVal, winVal==='A'?bVal:aVal, dVal, mapVal, sid, '', '', '프로리그대회');
      }
    }
  }
  document.getElementById('proMatchModal').remove();
  save(); render();
}

function proCompDelMatch(tnId, gi, mi) {
  if (!confirm('경기를 삭제하시겠습니까?')) return;
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const m = tn.groups[gi].matches[mi];
  if (m && m.winner) {
    if (m._stageRecId) {
      try{ _revertProMatch(m._stageRecId); }catch(e){}
      try{
        const rr = m._stageRecRound || '16강';
        if(tn.stageRecords && Array.isArray(tn.stageRecords[rr])){
          const si=tn.stageRecords[rr].findIndex(x=>x && x._id===m._stageRecId);
          if(si>=0) tn.stageRecords[rr].splice(si,1);
        }
      }catch(e){}
    } else if (m._id) {
      _revertProMatch(m._id);
    }
  }
  tn.groups[gi].matches.splice(mi, 1);
  save(); render();
}

// 대진표 결과 일괄 입력 모달
function proCompOpenBktBatchModal(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn || !tn.bracket || !tn.bracket.length) return;
  
  const modal = document.createElement('div');
  modal.id = '_bktBatchModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `
    <div style="background:var(--white);border-radius:var(--r2);padding:24px;width:400px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
      <div style="font-weight:900;font-size:16px;margin-bottom:8px">📋 대진표 결과 일괄 입력</div>
      <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:16px;line-height:1.5">
        한 줄에 한 경기씩 입력하세요.<br>
        형식: <b>승자이름 패자이름 [맵이름]</b><br>
        <span style="color:var(--blue)">예) 홍길동 임꺽정 투혼</span>
      </div>
      <textarea id="_bktBatchText" style="width:100%;height:200px;padding:12px;border-radius:var(--r);border:1.5px solid var(--border);font-size:var(--fs-base);margin-bottom:16px;box-sizing:border-box;resize:none" placeholder="여기에 복사해서 붙여넣으세요..."></textarea>
      <div style="display:flex;gap:10px">
        <button class="btn btn-b" style="flex:1" onclick="proCompSaveBktBatch('${tnId}')">적용하기</button>
        <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktBatchModal').remove()">취소</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function proCompSaveBktBatch(tnId) {
  const text = document.getElementById('_bktBatchText').value.trim();
  if (!text) return;
  const tn = _findTourneyById(tnId);
  if (!tn || !tn.bracket) return;

  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  let applied = 0;

  lines.forEach(line => {
    const parts = line.split(/[\s\t]+/);
    if (parts.length < 2) return;
    const p1 = parts[0], p2 = parts[1], map = parts[2] || '';

    // 대진표 전체를 돌며 매칭되는 경기 찾기
    let found = false;
    for (let ri=0; ri<tn.bracket.length; ri++) {
      for (let mi=0; mi<tn.bracket[ri].length; mi++) {
        const m = tn.bracket[ri][mi];
        if (!m.a || !m.b || m.a==='TBD' || m.b==='TBD') continue;

        let winner = '';
        if (m.a===p1 && m.b===p2) winner = 'A';
        else if (m.a===p2 && m.b===p1) winner = 'B';
        if (!winner) {
          const pa = players.find(x=>x.name===m.a)||null;
          const pb = players.find(x=>x.name===m.b)||null;
          if (pa && pb) {
            if (pa.univ===p1 && pb.univ===p2) winner = 'A';
            else if (pa.univ===p2 && pb.univ===p1) winner = 'B';
          }
        }

        if (winner) {
          const prevWinner = m.winner;
          const bktMatchId = `pbn_${tnId}_${ri}_${mi}`;
          
          if (prevWinner) _revertProMatch(bktMatchId);
          
          m.winner = winner;
          if (map) m.map = map;
          _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
          applied++;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    
    // 3위전도 확인
    if (!found && tn.thirdPlace) {
      const tp = tn.thirdPlace;
      if (tp.a && tp.b && tp.a!=='TBD' && tp.b!=='TBD') {
        let winner = '';
        if (tp.a===p1 && tp.b===p2) winner = 'A';
        else if (tp.a===p2 && tp.b===p1) winner = 'B';
        if (!winner) {
          const pa = players.find(x=>x.name===tp.a)||null;
          const pb = players.find(x=>x.name===tp.b)||null;
          if (pa && pb) {
            if (pa.univ===p1 && pb.univ===p2) winner = 'A';
            else if (pa.univ===p2 && pb.univ===p1) winner = 'B';
          }
        }

        if (winner) {
          const bktMatchId = `pbn_${tnId}_3rd`;
          if (tp.winner) _revertProMatch(bktMatchId);
          tp.winner = winner;
          if (map) tp.map = map;
          _syncBktMatchToHistory(tn, tp, bktMatchId, '3rd', 0);
          applied++;
        }
      }
    }
  });

  document.getElementById('_bktBatchModal').remove();
  save(); render();
  if (applied > 0) alert(`${applied}경기의 결과가 반영되었습니다.`);
  else alert('일치하는 경기를 찾지 못했습니다. 이름을 확인해주세요.');
}
