/* ══════════════════════════════════════════════════════════════
   프로리그 - 경기 추가 & 자동 매칭 미리보기 (pro-comp-edit-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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

