/* ══════════════════════════════════════════════════════════════
   프로리그 - 대진표 선수편집 & 3/4위전 (pro-comp-edit-bracket.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompBktEditPlayers(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  _bktEditTnId = tnId; _bktEditRi = ri; _bktEditMi = mi;
  _bktEditGames = Array.isArray(m._games) ? m._games.map(g=>({...g})) : [];
  const pList = players.filter(p=>p.name).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  const pOpts = (sel) => `<option value="">직접 입력</option>` + pList.map(p=>`<option value="${p.name}"${p.name===sel?' selected':''}>${p.name}${p.univ?` (${p.univ})`:''}</option>`).join('');
  const modal = document.createElement('div');
  modal.id = '_bktEditModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:14px;padding:20px;width:360px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.2)">
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">📝 대진표 경기 수정</div>
    <div style="margin-bottom:8px">
      <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">A 선수</label>
      <select id="_bktEditA" onchange="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.a||'')}</select>
      <input id="_bktEditAInp" placeholder="직접 입력" value="${pList.some(p=>p.name===m.a)?'':m.a||''}" oninput="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:var(--fs-sm)">
    </div>
    <div style="margin-bottom:8px">
      <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">B 선수</label>
      <select id="_bktEditB" onchange="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.b||'')}</select>
      <input id="_bktEditBInp" placeholder="직접 입력" value="${pList.some(p=>p.name===m.b)?'':m.b||''}" oninput="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:var(--fs-sm)">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">날짜</label>
      <input id="_bktEditD" type="date" value="${m.d||''}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;background:#fef9ee;border:1px solid #f59e0b44;border-radius:8px;padding:8px 12px">
      <label style="font-size:var(--fs-caption);font-weight:700;color:#f59e0b;white-space:nowrap">🎙️ 캐스터/스트리머</label>
      <input type="text" id="_bktEditCaster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)" style="flex:1;min-width:0;padding:5px 9px;border:1px solid var(--border);border-radius:7px;font-size:var(--fs-sm)">
    </div>
    <div style="margin-bottom:10px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-caption);font-weight:900;color:var(--text3);margin-bottom:6px">⚖️ 스코어로 빠른 입력 (2:2 / 3:3 등)</div>
      <div style="display:flex;gap:6px;align-items:center">
        <input id="_bktEditScoreA" type="number" min="0" value="0" style="width:70px;padding:6px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box">
        <span style="font-weight:900;color:var(--gray-l)">:</span>
        <input id="_bktEditScoreB" type="number" min="0" value="0" style="width:70px;padding:6px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box">
        <button class="btn btn-w btn-xs" style="margin-left:auto" onclick="_bktEditApplyScore()">적용</button>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:6px;line-height:1.4">
        • 동률이면 승자 미정으로 저장되며 다음 라운드로 전파되지 않습니다.<br>
        • 이후 승자가 확정되면 게임별 승자를 다시 입력하면 됩니다.
      </div>
    </div>
    <div style="margin-bottom:4px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">게임 결과</label>
        <div style="display:flex;gap:4px">
          <button class="btn btn-b btn-xs" onclick="_bktEditAddGame()">+ 게임 추가</button>
          <button class="btn btn-p btn-xs" onclick="openBktEditPasteModal()">📋 붙여넣기</button>
        </div>
      </div>
      <div id="_bktEditGameList"></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="_bktEditSave()">✅ 저장</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktEditModal')?.remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  _bktEditRenderGames();
}

function proCompInitBracketManual(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const szStr = prompt('대진표 규모를 선택하세요\n2 = 결승\n4 = 4강\n8 = 8강\n16 = 16강\n\n참가 인원을 숫자로 입력하세요', '4');
  if (!szStr) return;
  let sz = parseInt(szStr);
  if (isNaN(sz)||sz<2) return alert('2 이상의 숫자를 입력하세요');
  // 올림으로 2의 거듭제곱
  let p=1; while(p<sz) p*=2; sz=p;
  const firstRound=[];
  for(let i=0;i<sz;i+=2) firstRound.push({a:'',b:'',winner:''});
  const rounds=[firstRound];
  let cur=firstRound.length;
  while(cur>1){cur=Math.floor(cur/2);const rnd=[];for(let i=0;i<cur;i++)rnd.push({a:'',b:'',winner:''});rounds.push(rnd);}
  tn.bracket=rounds;
  save(); render();
}

function proCompAddThirdPlace(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  tn.thirdPlace = {a:'', b:'', winner:'', map:''};
  // 준결승 결과가 있을 경우 패자 자동 배정
  const semiRi = (tn.bracket||[]).length - 2;
  if (semiRi >= 0) {
    const semiRnd = tn.bracket[semiRi] || [];
    if (semiRnd[0] && semiRnd[0].winner && semiRnd[0].a && semiRnd[0].b)
      tn.thirdPlace.a = semiRnd[0].winner==='A' ? semiRnd[0].b : semiRnd[0].a;
    if (semiRnd[1] && semiRnd[1].winner && semiRnd[1].a && semiRnd[1].b)
      tn.thirdPlace.b = semiRnd[1].winner==='A' ? semiRnd[1].b : semiRnd[1].a;
  }
  save(); render();
}

function proCompRemoveThirdPlace(tnId) {
  if (!confirm('3·4위전을 제거하시겠습니까?')) return;
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const thirdKey = `pbn_${tnId}_3rd`;
  if (tn.thirdPlace && tn.thirdPlace.winner) _revertProMatch(thirdKey);
  tn.thirdPlace = null;
  save(); render();
}

function proCompResetBracket(tnId) {
  if (!confirm('대진표를 초기화하시겠습니까?')) return;
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  tn.bracket = [];
  tn.thirdPlace = null;
  save(); render();
}

function proCompSetThirdWinner(tnId, winner) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.thirdPlace) return;
  const m = tn.thirdPlace;
  const thirdKey = `pbn_${tnId}_3rd`;
  if (m.winner) _revertProMatch(thirdKey);
  m.winner = m.winner===winner ? '' : winner;
  _syncBktMatchToHistory(tn, m, thirdKey, '3rd', 0);
  save(); render();
}

function proCompSetThirdDate(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.thirdPlace) return;
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.id = '_thirdDateModal';
  modal.innerHTML = `<div style="background:var(--white);border-radius:14px;padding:20px;min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,.2)">
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">🗓️ 3·4위전 날짜 입력</div>
    <input id="_thirdDateInp" type="date" value="${tn.thirdPlace.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box;margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_thirdDateInp').value;const t2=_findTourneyById('${tnId}');if(t2&&t2.thirdPlace){const tp=t2.thirdPlace;tp.d=v;if(tp.winner)_syncBktMatchToHistory(t2,tp,'pbn_${tnId}_3rd','3rd',0);}document.body.removeChild(document.getElementById('_thirdDateModal'));save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.body.removeChild(document.getElementById('_thirdDateModal'))">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompSetThirdMap(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.thirdPlace) return;
  const modal = document.createElement('div');
  modal.id = '_thirdMapModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:var(--r2);padding:24px;width:320px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:14px">🗺️ 3·4위전 맵 설정</div>
    <input id="_thirdMapInp" value="${((tn.thirdPlace.map)||'').replace(/"/g,'&quot;')}" placeholder="맵 이름 입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:var(--fs-base);box-sizing:border-box;margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_thirdMapInp').value.trim();const t2=_findTourneyById('${tnId}');if(t2&&t2.thirdPlace){const tp=t2.thirdPlace;tp.map=v;if(tp.winner)_syncBktMatchToHistory(t2,tp,'pbn_${tnId}_3rd','3rd',0);}document.getElementById('_thirdMapModal').remove();save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_thirdMapModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('_thirdMapInp').focus();
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   조편??관�??�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
