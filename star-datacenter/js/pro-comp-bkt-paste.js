/* ══════════════════════════════════════════════════════════════
   프로리그 - 대진표 붙여넣기 모달/파싱 (pro-comp-edit-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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

