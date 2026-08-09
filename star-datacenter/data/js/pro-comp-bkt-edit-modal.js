/* ══════════════════════════════════════════════════════════════
   프로리그 - 대진표 개별경기 편집모달 (pro-comp-edit-bracket.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _bktEditRenderGames() {
  const cont = document.getElementById('_bktEditGameList');
  if (!cont) return;
  const tn = _findTourneyById(_bktEditTnId);
  const m = tn && tn.bracket ? tn.bracket[_bktEditRi]?.[_bktEditMi] : null;
  const aV = (document.getElementById('_bktEditA')?.value || document.getElementById('_bktEditAInp')?.value || '').trim() || m?.a || 'A';
  const bV = (document.getElementById('_bktEditB')?.value || document.getElementById('_bktEditBInp')?.value || '').trim() || m?.b || 'B';
  if (!_bktEditGames.length) { cont.innerHTML = '<div style="font-size:var(--fs-caption);color:var(--gray-l);padding:6px 0">게임 없음 — 아래 버튼으로 추가</div>'; return; }
  cont.innerHTML = _bktEditGames.map((g,i)=>`<div style="display:flex;gap:5px;align-items:center;padding:4px 0;border-top:1px solid var(--border)">
    <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:26px">${i+1}G</span>
    <select onchange="_bktEditGames[${i}].winner=this.value;_bktEditRenderGames()" style="flex:1;min-width:90px;font-size:var(--fs-caption);padding:3px">
      <option value="">승자</option>
      <option value="A"${g.winner==='A'?' selected':''}>🔵 ${aV}</option>
      <option value="B"${g.winner==='B'?' selected':''}>🔴 ${bV}</option>
    </select>
    <input type="text" value="${g.map||''}" placeholder="맵" style="flex:1;min-width:60px;padding:3px 6px;border:1px solid var(--border2);border-radius:5px;font-size:var(--fs-caption)" oninput="_bktEditGames[${i}].map=this.value">
    <button class="btn btn-r btn-xs" onclick="_bktEditGames.splice(${i},1);_bktEditRenderGames()">×</button>
  </div>`).join('');
}

function _bktEditAddGame() {
  _bktEditGames.push({winner:'', map:''});
  _bktEditRenderGames();
}

// (요청사항) 붙여넣기 없이 스코어(2:2 / 3:3 등)로 빠른 입력
function _bktEditApplyScore(){
  const a = parseInt(document.getElementById('_bktEditScoreA')?.value||'0',10) || 0;
  const b = parseInt(document.getElementById('_bktEditScoreB')?.value||'0',10) || 0;
  if(a<0||b<0) return alert('스코어는 0 이상이어야 합니다.');
  if(_bktEditGames.length){
    if(!confirm('현재 입력된 게임 목록을 스코어 기준으로 재설정할까요?')) return;
  }
  const games=[];
  for(let i=0;i<a;i++) games.push({winner:'A', map:''});
  for(let i=0;i<b;i++) games.push({winner:'B', map:''});
  _bktEditGames = games;
  _bktEditRenderGames();
}

function openBktEditPasteModal() {
  const tn = _findTourneyById(_bktEditTnId); if (!tn) return;
  const aV = (document.getElementById('_bktEditA')?.value || document.getElementById('_bktEditAInp')?.value || '').trim() || '';
  const bV = (document.getElementById('_bktEditB')?.value || document.getElementById('_bktEditBInp')?.value || '').trim() || '';
  if (!aV || !bV) return alert('A, B 선수를 먼저 선택하세요.');
  window._grpPasteState = {tnId: _bktEditTnId, ri: _bktEditRi, mi: _bktEditMi, mode: 'pcbktedit', aV, bV};
  window._grpPasteMode = true;
  const textarea = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn = document.getElementById('paste-apply-btn');
  const badge = document.getElementById('paste-summary-badge');
  const pendWarn = document.getElementById('paste-pending-warn');
  if (textarea) textarea.value = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn) { applyBtn.style.display='none'; applyBtn.textContent='✅ 게임 목록에 추가'; }
  if (badge) badge.style.display = 'none';
  if (pendWarn) pendWarn.style.display = 'none';
  window._pasteResults = null; window._pasteErrors = null;
  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = document.getElementById('_bktEditD')?.value || new Date().toISOString().slice(0,10);
  const modeSel = document.getElementById('paste-mode');
  if (modeSel) { modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if (modeLabel) modeLabel.style.display = 'none';
  const hintEl = document.getElementById('paste-mode-hint');
  if (hintEl) hintEl.innerHTML = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">📝 경기 결과 입력 (게임 목록에 추가)</span> — <b>${aV}</b> vs <b>${bV}</b><br><span style="font-size:var(--fs-caption);color:#6b7280">형식: <code>${aV} ${bV} [맵]</code> / <code>${bV} ${aV} [맵]</code></span></div>`;
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  const _pd = document.querySelector('#pasteModal details');
  if (_pd) _pd.style.display = 'none';
  const _pt = document.querySelector('#pasteModal .mtitle');
  if (_pt) _pt.textContent = '📋 결과 붙여넣기 (경기 수정)';
  if (typeof om === 'function') om('pasteModal');
}

function _pcBktEditPasteApplyLogic(savable) {
  const {aV, bV} = window._grpPasteState;
  const added = [];
  for (const r of savable) {
    if (!r.wPlayer || !r.lPlayer) continue;
    const wn = r.wPlayer.name;
    let winner = '';
    if (wn === aV) winner = 'A';
    else if (wn === bV) winner = 'B';
    else { alert(`"${wn}"은(는) 해당 경기 선수가 아닙니다.\n${aV} vs ${bV}`); return false; }
    added.push({winner, map: r.map || ''});
  }
  if (!added.length) { alert('인식된 게임이 없습니다.'); return false; }
  _bktEditGames.push(...added);
  _bktEditRenderGames();
  return true;
}

function _bktEditSave() {
  const tn = _findTourneyById(_bktEditTnId); if (!tn) return;
  if (!tn.bracket || !tn.bracket[_bktEditRi]) return;
  const m = tn.bracket[_bktEditRi][_bktEditMi]; if (!m) return;
  const aRaw = (document.getElementById('_bktEditA')?.value || document.getElementById('_bktEditAInp')?.value || '').trim();
  const bRaw = (document.getElementById('_bktEditB')?.value || document.getElementById('_bktEditBInp')?.value || '').trim();
  const aInfo = (typeof window.resolvePlayerName==='function') ? window.resolvePlayerName(aRaw) : {name:aRaw};
  const bInfo = (typeof window.resolvePlayerName==='function') ? window.resolvePlayerName(bRaw) : {name:bRaw};
  const aV = aInfo.name || aRaw;
  const bV = bInfo.name || bRaw;
  const dV = document.getElementById('_bktEditD')?.value || '';
  const casterV = (document.getElementById('_bktEditCaster')?.value||'').trim();
  const bktId = `pbn_${_bktEditTnId}_${_bktEditRi}_${_bktEditMi}`;
  const tieId = `${bktId}_tie`;
  if (m.winner) _revertProMatch(bktId);
  m.a = aV; m.b = bV; m.d = dV;
  if(casterV) m.caster=casterV; else delete m.caster;
  // (보완) 사용자 혼동 방지: 스코어 입력칸을 채웠는데 [적용]을 안 눌러도 저장 시 반영
  try{
    const sAEl = document.getElementById('_bktEditScoreA');
    const sBEl = document.getElementById('_bktEditScoreB');
    const sA = parseInt(sAEl?.value||'',10);
    const sB = parseInt(sBEl?.value||'',10);
    if (_bktEditGames.length===0 && (Number.isFinite(sA)||Number.isFinite(sB)) && ((sA||0)>0 || (sB||0)>0)) {
      const games=[];
      for(let i=0;i<(sA||0);i++) games.push({winner:'A', map:''});
      for(let i=0;i<(sB||0);i++) games.push({winner:'B', map:''});
      _bktEditGames = games;
    }
  }catch(e){}
  const validGames = _bktEditGames.filter(g => g.winner);
  if (validGames.length > 0) {
    m._games = validGames;
    const scoreA = validGames.filter(g=>g.winner==='A').length;
    const scoreB = validGames.filter(g=>g.winner==='B').length;
    if (scoreA !== scoreB) {
      // 기존 동률 기록이 있으면 제거
      try{ _revertDrawMatch(tieId); }catch(e){}
      m.winner = scoreA > scoreB ? 'A' : 'B';
      m.map = validGames.length === 1 ? validGames[0].map || '' : '';
      const nextMi = Math.floor(_bktEditMi/2), isA = _bktEditMi%2===0;
      if (tn.bracket[_bktEditRi+1] && tn.bracket[_bktEditRi+1][nextMi]) {
        const next = tn.bracket[_bktEditRi+1][nextMi];
        const wSlot = m.winner==='A' ? m.a : m.b;
        if (isA) next.a = wSlot; else next.b = wSlot;
      }
      const semiRi = tn.bracket.length-2;
      if (tn.thirdPlace && _bktEditRi===semiRi && tn.bracket.length>=2 && (_bktEditMi===0||_bktEditMi===1)) {
        const thirdKey=`pbn_${_bktEditTnId}_3rd`;
        if (tn.thirdPlace.winner) _revertProMatch(thirdKey);
        tn.thirdPlace.winner='';
        const loser=m.winner==='A'?m.b:m.a;
        if (_bktEditMi===0) tn.thirdPlace.a=loser||'TBD'; else tn.thirdPlace.b=loser||'TBD';
      }
    } else {
      m.winner = ''; m.map = '';
      // 동률도 "저장" 처리: 히스토리에 무승부 기록 추가(승/패/ELO 영향 없음)
      try{
        _revertDrawMatch(tieId);
        if(typeof applyDrawResult==='function' && (scoreA+scoreB)>0) applyDrawResult(m.a, m.b, m.d||'', m.map||'-', tieId, '', '', '프로리그대회(토너먼트)', scoreA, scoreB);
      }catch(e){}
    }
  } else {
    m.winner = ''; m._games = []; m.map = '';
    try{ _revertDrawMatch(tieId); }catch(e){}
  }
  // 동률/승자미정일 때는 히스토리 반영하지 않음
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  if(m.winner && !isBye(m.a) && !isBye(m.b)){
    _syncBktMatchToHistory(tn, m, bktId, _bktEditRi, _bktEditMi);
  }
  document.getElementById('_bktEditModal')?.remove();
  save(); render();
  // 저장 확인 토스트 (동률도 "저장됨"을 명확히 표시)
  try{
    const sA = Array.isArray(m._games) ? m._games.filter(g=>g.winner==='A').length : 0;
    const sB = Array.isArray(m._games) ? m._games.filter(g=>g.winner==='B').length : 0;
    if ((sA+sB) > 0) {
      if (sA === sB) showToast(`⚖️ 동률 저장됨 (${sA}:${sB})`, 3200);
      else showToast(`✅ 저장됨 (${sA}:${sB})`, 2200);
    } else {
      showToast('✅ 저장됨', 1800);
    }
  }catch(e){}
}

