/* ══════════════════════════════════════════════════════════════
   프로리그 - 경기 수정/삭제/되돌리기 (pro-comp-edit-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
