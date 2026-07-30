/* ══════════════════════════════════════════════════════════════
   프로리그 - 조편성 관리 (pro-comp-edit-bracket.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompGrpEdit() {
  const tn = getCurrentProTourney();
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue);margin-bottom:14px">🏗️ 조편성 관리 ${tn?' ('+tn.name+')':''}</div>`;
  if (!tn) {
    h += `<div style="padding:40px;text-align:center;color:var(--gray-l)">먼저 대회를 선택하거나 생성하세요.</div>`;
    return h;
  }
  h += `<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn btn-b btn-sm" onclick="proCompAddGrp('${tn.id}')">+ 조 추가</button>
  </div>`;
  const GL = 'ABCDEFGHIJ';
  tn.groups.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const recTarget = grp._recTarget || ''; // pro | stage | none
    const recRound = grp._recRound || '16강'; // stage일 때만 사용
    h += `<div style="margin-bottom:16px;border-radius:12px;overflow:hidden;border:1.5px solid ${col}44">
      <div style="padding:10px 16px;background:linear-gradient(135deg,${col},${col}cc);color:#fff;display:flex;align-items:center;gap:8px">
        <span style="font-weight:900;font-size:var(--fs-base)">GROUP ${GL[gi]}</span>
        <input value="${grp.name||''}" placeholder="조 이름" style="background:#fff3;border:1px solid #fff5;border-radius:6px;padding:3px 8px;font-size:var(--fs-sm);color:#fff;width:120px"
          onchange="proCompRenameGrp('${tn.id}',${gi},this.value)">
        <span style="margin-left:8px;font-size:var(--fs-caption);font-weight:900;opacity:.9">기록 반영</span>
        <select style="padding:4px 8px;border-radius:8px;border:1px solid #fff7;background:#0002;color:#fff;font-weight:900;font-size:var(--fs-caption)"
          onchange="proCompSetGrpRecTarget('${tn.id}',${gi},this.value)">
          <option value="" ${!recTarget?'selected':''}>선택</option>
          <option value="pro" ${recTarget==='pro'?'selected':''}>프로리그</option>
          <option value="stage" ${recTarget==='stage'?'selected':''}>대진표 기록</option>
          <option value="none" ${recTarget==='none'?'selected':''}>반영안함</option>
        </select>
        ${recTarget==='stage'?`<select style="padding:4px 8px;border-radius:8px;border:1px solid #fff7;background:#0002;color:#fff;font-weight:900;font-size:var(--fs-caption)"
          onchange="proCompSetGrpRecRound('${tn.id}',${gi},this.value)">
          ${_PC_STAGE_ROUNDS.map(r=>`<option value="${r}" ${recRound===r?'selected':''}>${r}</option>`).join('')}
        </select>`:''}
        <button class="btn btn-r btn-xs" style="margin-left:auto" onclick="proCompDelGrp('${tn.id}',${gi})">🗑️ 조 삭제</button>
      </div>
      <div style="padding:12px 16px;background:var(--white)">
        <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:8px">선수 목록 (${(grp.players||[]).length}명)</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${(grp.players||[]).map((p,pi)=>`<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--surface);border-radius:20px;border:1px solid var(--border)">
            <span style="font-size:var(--fs-sm);font-weight:600">${p}</span>
            <button onclick="proCompRemovePlayer('${tn.id}',${gi},${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:var(--fs-sm);padding:0;line-height:1">×</button>
          </div>`).join('')}
          ${!(grp.players||[]).length?`<span style="color:var(--gray-l);font-size:var(--fs-sm)">아직 선수가 없습니다</span>`:''}
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <input id="proAddP_${gi}" placeholder="선수 이름 검색" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);font-size:var(--fs-sm);width:160px"
            oninput="proCompSearchPlayerSug('${tn.id}',${gi})">
          <button class="btn btn-b btn-sm" onclick="proCompAddPlayerManual('${tn.id}',${gi})">+ 추가</button>
        </div>
        <div id="proSug_${gi}" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px"></div>
        <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:8px">경기 목록 (${(grp.matches||[]).length}경기)</div>
          ${(grp.matches||[]).map((m,mi)=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--surface);border-radius:8px;margin-bottom:4px;font-size:var(--fs-sm)">
            <span style="font-weight:600">${m.a||'?'}</span>
            <span style="color:var(--gray-l)">vs</span>
            <span style="font-weight:600">${m.b||'?'}</span>
            ${m.winner?`<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:var(--r);font-weight:700">${m.winner==='A'?m.a:m.b} 승</span>`:'<span style="font-size:10px;color:var(--gray-l)">미완료</span>'}
            ${m.d?`<span style="font-size:var(--fs-caption);font-weight:600;color:var(--text3)">${m.d}</span>`:''}
            <button class="btn btn-b btn-xs" style="margin-left:auto" onclick="proCompEditMatch('${tn.id}',${gi},${mi})">✏️</button>
            <button class="btn btn-r btn-xs" onclick="proCompDelMatch('${tn.id}',${gi},${mi})">🗑️</button>
          </div>`).join('')}
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
            <button class="btn btn-b btn-sm" onclick="proCompAddMatch('${tn.id}',${gi})">+ 경기 추가</button>
            <button class="btn btn-p btn-sm" onclick="proCompOpenPasteModal('${tn.id}',${gi})">📋 경기 결과 붙여넣기</button>
            ${(grp.players||[]).length>=2?`<button class="btn btn-w btn-sm" onclick="proCompGenRoundRobin('${tn.id}',${gi})" title="선수 목록 기반 라운드로빈 경기 자동 생성">🔄 라운드로빈 생성</button>`:''}
          </div>
        </div>
      </div>
    </div>`;
  });
  return h;
}

function proCompGenRoundRobin(tnId, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const grp = tn.groups[gi];
  const ps = grp.players||[];
  if (ps.length < 2) return alert('선수가 2명 이상이어야 합니다.');
  // 기존 미완료 경기 수 확인
  const pairs = [];
  for (let i=0;i<ps.length;i++) for (let j=i+1;j<ps.length;j++) pairs.push({a:ps[i],b:ps[j]});
  // 이미 있는 조합 제외
  const newPairs = pairs.filter(p => !(grp.matches||[]).some(m=>(m.a===p.a&&m.b===p.b)||(m.a===p.b&&m.b===p.a)));
  if (!newPairs.length) { alert('모든 라운드로빈 경기가 이미 등록되어 있습니다.'); return; }
  if (!confirm(`${newPairs.length}경기를 추가하시겠습니까?\n(이미 있는 대진은 제외됩니다)`)) return;
  if (!grp.matches) grp.matches=[];
  newPairs.forEach(p => grp.matches.push({a:p.a,b:p.b,winner:'',map:'',d:''}));
  save(); render();
}

function proCompSearchPlayerSug(tnId, gi) {
  const input = document.getElementById(`proAddP_${gi}`);
  const sug = document.getElementById(`proSug_${gi}`);
  if (!input||!sug) return;
  const q = input.value.trim();
  if (!q) { sug.innerHTML=''; return; }
  const tn = _findTourneyById(tnId);
  const already = (tn&&tn.groups[gi]&&tn.groups[gi].players)||[];
  const matched = players.filter(p=>p.name.includes(q)&&!already.includes(p.name)).slice(0,8);
  sug.innerHTML = matched.map(p=>`<button onclick="proCompAddPlayer('${tnId}',${gi},'${p.name.replace(/'/g,"\\'")}',document.getElementById('proAddP_${gi}'))"
    style="padding:4px 10px;border-radius:12px;border:1px solid var(--border);background:var(--white);font-size:var(--fs-sm);cursor:pointer;display:flex;align-items:center;gap:4px">
    ${p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:18px;height:18px;border-radius:var(--su_profile_radius,50%);object-fit:cover" onerror="this.style.display='none'">`:''}
    ${p.name}
    ${p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;padding:1px 4px;border-radius:3px">${p.tier}</span>`:''}
  </button>`).join('');
}

function proCompAddPlayer(tnId, gi, name, inputEl) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  if (!tn.groups[gi].players) tn.groups[gi].players = [];
  if (!tn.groups[gi].players.includes(name)) tn.groups[gi].players.push(name);
  if (inputEl) inputEl.value = '';
  const sug = document.getElementById(`proSug_${gi}`);
  if (sug) sug.innerHTML = '';
  save(); render();
}

function proCompAddPlayerManual(tnId, gi) {
  const input = document.getElementById(`proAddP_${gi}`);
  if (!input) return;
  const name = input.value.trim();
  if (!name) return;
  proCompAddPlayer(tnId, gi, name, input);
}

function proCompRemovePlayer(tnId, gi, pi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  tn.groups[gi].players.splice(pi, 1);
  save(); render();
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   경기 CRUD
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompAddMatchOnDate(tnId, date) {
  const tn = _findTourneyById(tnId);
  if (!tn || !tn.groups.length) { alert('조를 먼저 만들어 주세요'); return; }
  if (tn.groups.length === 1) {
    proCompAddMatch(tnId, 0, date);
  } else {
    // 조 선택 팝업
    const GL = 'ABCDEFGHIJ';
    const grpOpts = tn.groups.map((g,i)=>`<option value="${i}">GROUP ${GL[i]} · ${g.name||GL[i]+'조'}</option>`).join('');
    const sel = document.createElement('div');
    sel.id = 'proGrpSelModal';
    sel.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:10000;display:flex;align-items:center;justify-content:center';
    sel.innerHTML = `<div style="background:var(--white);border-radius:12px;padding:20px;width:280px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,.25)">
      <div style="font-weight:900;font-size:14px;margin-bottom:12px">어느 조에 추가할까요?</div>
      <select id="proGrpSelSel" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-bottom:14px;box-sizing:border-box">${grpOpts}</select>
      <div style="display:flex;gap:8px">
        <button class="btn btn-b" style="flex:1" onclick="var _gi=parseInt(document.getElementById('proGrpSelSel').value);document.getElementById('proGrpSelModal').remove();proCompAddMatch('${tnId}',_gi,'${date}')">선택</button>
        <button class="btn btn-w" style="flex:1" onclick="document.getElementById('proGrpSelModal').remove()">취소</button>
      </div>
    </div>`;
    document.body.appendChild(sel);
  }
}

// 대진표 경기에 붙여넣기
