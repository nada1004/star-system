/* ══════════════════════════════════════════════════════════════
   프로리그 - 조별리그/3,4위전 붙여넣기 저장 (pro-comp-edit-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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

