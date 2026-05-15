// ─────────────────────────────────────────────
// 대진표 기록(라운드 기록) 입력 모달
// ─────────────────────────────────────────────
window.openPcStageRecModal = function(tnId, round, idx){
  const tn=_findTourneyById(tnId);
  if(!tn) return;
  _pcEnsureStageRecords(tn);
  const r = _pcNormalizeStageRound(round);
  const arr = tn.stageRecords[r];
  const m = (idx>=0 && arr[idx]) ? arr[idx] : {a:'',b:'',winner:'',d:new Date().toISOString().slice(0,10),map:''};
  const mid = m._id || `ptr_${tnId}_${r}_${idx>=0?idx:Date.now().toString(36)}`;
  const modal=document.createElement('div');
  modal.id='_pcStageRecModal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML=`<div style="background:var(--white);border-radius:14px;padding:18px;width:min(520px,100%);box-shadow:0 10px 40px rgba(0,0,0,.25)">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="font-weight:900;font-size:14px">🗂️ ${r} 기록 ${idx>=0?'수정':'추가'}</div>
      <button class="btn btn-w btn-xs" style="margin-left:auto" onclick="document.getElementById('_pcStageRecModal')?.remove()">닫기</button>
    </div>
    <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
      <div style="font-size:12px;font-weight:800;color:var(--text2)">날짜</div>
      <input id="_pcsr_d" type="date" value="${m.d||''}" style="padding:8px 10px;border:1px solid var(--border2);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2)">A</div>
      <input id="_pcsr_a" type="text" value="${(m.a||'').replace(/\"/g,'&quot;')}" placeholder="선수명" style="padding:8px 10px;border:1px solid var(--border2);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2)">B</div>
      <input id="_pcsr_b" type="text" value="${(m.b||'').replace(/\"/g,'&quot;')}" placeholder="선수명" style="padding:8px 10px;border:1px solid var(--border2);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2)">승자</div>
      <select id="_pcsr_w" style="padding:8px 10px;border:1px solid var(--border2);border-radius:10px;font-weight:900">
        <option value="" ${!m.winner?'selected':''}>미정</option>
        <option value="A" ${m.winner==='A'?'selected':''}>A 승</option>
        <option value="B" ${m.winner==='B'?'selected':''}>B 승</option>
      </select>
      <div style="font-size:12px;font-weight:800;color:var(--text2)">맵</div>
      <input id="_pcsr_map" type="text" value="${(m.map||'').replace(/\"/g,'&quot;')}" placeholder="맵(선택)" style="padding:8px 10px;border:1px solid var(--border2);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2)">참고</div>
      <input id="_pcsr_note" type="text" value="${(m.note||'').replace(/\"/g,'&quot;')}" placeholder="참고 메모(선택)" style="padding:8px 10px;border:1px solid var(--border2);border-radius:10px">
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="pcSaveStageRec('${tnId}','${r}',${idx},'${mid.replace(/'/g,"\\'")}')">✅ 저장</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_pcStageRecModal')?.remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
};

window.pcSaveStageRec = function(tnId, round, idx, mid){
  const tn=_findTourneyById(tnId); if(!tn) return;
  _pcEnsureStageRecords(tn);
  const r = _pcNormalizeStageRound(round);
  const arr = tn.stageRecords[r];
  const d = document.getElementById('_pcsr_d')?.value || '';
  const aRaw = (document.getElementById('_pcsr_a')?.value || '').trim();
  const bRaw = (document.getElementById('_pcsr_b')?.value || '').trim();
  const w = document.getElementById('_pcsr_w')?.value || '';
  const map = (document.getElementById('_pcsr_map')?.value || '').trim();
  const note = (document.getElementById('_pcsr_note')?.value || '').trim();
  if(!aRaw || !bRaw) return alert('A/B 선수명을 입력하세요.');
  const aInfo = (typeof window.resolvePlayerName==='function') ? window.resolvePlayerName(aRaw) : {name:aRaw,candidates:[]};
  const bInfo = (typeof window.resolvePlayerName==='function') ? window.resolvePlayerName(bRaw) : {name:bRaw,candidates:[]};
  const a = aInfo.name || aRaw;
  const b = bInfo.name || bRaw;
  // 자동 매칭된 경우 입력값도 정규화해서 보여주기
  try{ const elA=document.getElementById('_pcsr_a'); if(elA && a && elA.value.trim()!==a) elA.value=a; }catch(e){}
  try{ const elB=document.getElementById('_pcsr_b'); if(elB && b && elB.value.trim()!==b) elB.value=b; }catch(e){}
  // 후보가 있는데 못 고른 경우 안내(저장은 진행)
  try{
    if(aInfo && aInfo.match==='none' && aInfo.candidates && aInfo.candidates.length){
      console.log('[대진표 기록] A 후보:', aInfo.candidates.map(x=>x.name).join(', '));
    }
    if(bInfo && bInfo.match==='none' && bInfo.candidates && bInfo.candidates.length){
      console.log('[대진표 기록] B 후보:', bInfo.candidates.map(x=>x.name).join(', '));
    }
  }catch(e){}
  const prev = (idx>=0 && arr[idx]) ? arr[idx] : null;
  if(prev && prev.winner && prev._id) try{ _revertProMatch(prev._id); }catch(e){}
  const obj = {a,b,winner:w,d,map,note,_id:mid};
  if(idx>=0 && arr[idx]) arr[idx]=obj;
  else arr.push(obj);
  if(w) try{ applyGameResult(w==='A'?a:b, w==='A'?b:a, d, map, mid, '', '', '프로리그대회'); }catch(e){}
  try{ document.getElementById('_pcStageRecModal')?.remove(); }catch(e){}
  save(); render();
};

window.pcDeleteStageRec = function(tnId, round, idx){
  if(!confirm('기록을 삭제하시겠습니까?')) return;
  const tn=_findTourneyById(tnId); if(!tn||!tn.stageRecords) return;
  const r = _pcNormalizeStageRound(round);
  const arr = tn.stageRecords[r]||[];
  const m = arr[idx];
  if(m && m.winner && m._id) try{ _revertProMatch(m._id); }catch(e){}
  arr.splice(idx,1);
  tn.stageRecords[r]=arr;
  save(); render();
};

window.openPcStageActionMenu = function(btnEl, tnId, round, idx, src, ri, mi){
  try{
    const items=[];
    if(src==='stage'){
      items.push({t:'📂 상세', on:()=>openPcStageRecModal(tnId, round, idx)});
      if(isLoggedIn){
        items.push({t:'✏️ 수정', on:()=>openPcStageRecModal(tnId, round, idx)});
        items.push({t:'🗑️ 결과 삭제', on:()=>pcDeleteStageRec(tnId, round, idx)});
      }
      const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';
      if(!_adm || isLoggedIn){
        items.push({t:'🎴 공유카드', on:()=>openPcStageRecShareCard(tnId, round, idx)});
      }
    }else if(src==='bkt'){
      items.push({t:'🗂️ 대진표', on:()=>{ proCompSub='tour'; render(); }});
      const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';
      if((!_adm || isLoggedIn) && ri>=0 && mi>=0){
        items.push({t:'🎴 공유카드', on:()=>_openProCompBktShareCard(tnId, ri, mi)});
      }
      if(isLoggedIn && ri>=0 && mi>=0){
        items.push({t:'🗑️ 결과 삭제', on:()=>proCompClearBktMatch(tnId, ri, mi)});
      }
    }
    if(window.HistoryActionUtils && typeof window.HistoryActionUtils.openSimpleActionMenu==='function'){
      window.HistoryActionUtils.openSimpleActionMenu(btnEl, items);
    }
  }catch(e){}
};

window.openPcStageRecShareCard = function(tnId, round, idx){
  const tn=_findTourneyById(tnId);
  if(!tn || !tn.stageRecords) return;
  const r=_pcNormalizeStageRound(round);
  const m=(tn.stageRecords[r]||[])[idx];
  if(!m || !m.winner) return alert('승자가 있는 기록만 공유카드를 만들 수 있습니다.');
  const scoreA = m.winner==='A' ? 1 : 0;
  const scoreB = m.winner==='B' ? 1 : 0;
  const shareObj = {
    a:m.a||'', b:m.b||'',
    sa:scoreA, sb:scoreB,
    d:m.d||'', n:tn.name||'프로리그 대회',
    _subLabel:`${r} 기록`,
    sets:[{ label:r, scoreA, scoreB, winner:m.winner, games:[{ playerA:m.a||'', playerB:m.b||'', winner:m.winner, map:m.map||'' }] }],
    _noUnivIcon:false, _usePlayerPhoto:true, _matchType:'procomp-bkt'
  };
  if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(shareObj);
};

function _pcStageResolveAliasName(name0){
  const stripRace = (s)=> String(s||'').trim().replace(/\s*[TZPNtzpn]$/,'').trim();
  const nfc = (s)=> (s&&s.normalize) ? s.normalize('NFC') : String(s||'');
  const normKey = (s)=> nfc(String(s||'')).replace(/\s+/g,'').toLowerCase();
  const aliasMap = (()=>{ try{ return JSON.parse(localStorage.getItem('su_player_alias_map')||'{}')||{}; }catch(e){ return {}; } })();
  const name = stripRace(name0);
  if(!name) return '';
  if(aliasMap && (name in aliasMap)) return String(aliasMap[name]||'') || name;
  const nk = normKey(name);
  for(const k in (aliasMap||{})){
    if(normKey(k)===nk) return String(aliasMap[k]||'') || name;
  }
  return name;
}

function _pcStageResolvePlayerName(name0){
  const aliasName = _pcStageResolveAliasName(name0);
  try{
    if(typeof findPlayerByPartialName === 'function'){
      const m = findPlayerByPartialName(aliasName);
      if(m && m.player && m.player.name) return m.player.name;
      if(Array.isArray(m && m.candidates) && m.candidates[0] && m.candidates[0].name) return m.candidates[0].name;
    }
  }catch(e){}
  try{
    if(typeof window.resolvePlayerName === 'function'){
      const info = window.resolvePlayerName(aliasName);
      if(info && info.name) return info.name;
    }
  }catch(e){}
  return aliasName || String(name0||'').trim();
}

function _pcStageBuildBulkResults(text, defaultDate){
  const raw = String(text||'').trim();
  if(!raw) return [];
  const out = [];
  const lines = (typeof splitPasteLines === 'function')
    ? splitPasteLines(raw)
    : raw.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);

  lines.forEach(line=>{
    const trimmed = String(line||'').trim();
    if(!trimmed) return;
    if (/^\[(?:승|패)\]/.test(trimmed)) return;
    if (/\((?:승|패)\)\s*\d+\s*[：:]\s*\d+\s*\((?:승|패)\)/.test(trimmed)) return;

    let lineForParse = trimmed;
    let lineDate = String(defaultDate||'');
    let lineNote = '';
    let directTsv = null;
    try{
      const cols = trimmed.split('\t').map(x=>x.trim());
      if(cols.length >= 4 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0]||'')){
        lineDate = cols[0] || lineDate;
        const rawW = String(cols[1]||'').trim();
        const rawL = String(cols[2]||'').trim();
        const rawMap = String(cols[3]||'').trim() || '-';
        lineNote = cols.slice(4).filter(Boolean).join(' · ');
        if(rawW && rawL){
          const wName = _pcStageResolveAliasName(rawW);
          const lName = _pcStageResolveAliasName(rawL);
          const wMatch = (typeof findPlayerByPartialName === 'function') ? findPlayerByPartialName(wName) : {player:null,candidates:[],similar:[]};
          const lMatch = (typeof findPlayerByPartialName === 'function') ? findPlayerByPartialName(lName) : {player:null,candidates:[],similar:[]};
          directTsv = {
            d: lineDate || String(defaultDate||''),
            wName,
            lName,
            map: rawMap,
            note: lineNote,
            wPlayer: wMatch.player || null,
            lPlayer: lMatch.player || null,
            wCandidates: wMatch.candidates || [],
            lCandidates: lMatch.candidates || [],
            wSimilar: wMatch.similar || [],
            lSimilar: lMatch.similar || []
          };
        }
        lineForParse = `${rawW} ${rawL} ${rawMap}`.trim();
      }
    }catch(e){}

    if(directTsv){
      out.push(directTsv);
      return;
    }

    let parsed = null;
    try{
      if(typeof parsePasteLine === 'function') parsed = parsePasteLine(lineForParse);
    }catch(e){}

    if(parsed){
      const wName = _pcStageResolveAliasName(parsed.winName);
      const lName = _pcStageResolveAliasName(parsed.loseName);
      const wMatch = (typeof findPlayerByPartialName === 'function') ? findPlayerByPartialName(wName) : {player:null,candidates:[],similar:[]};
      const lMatch = (typeof findPlayerByPartialName === 'function') ? findPlayerByPartialName(lName) : {player:null,candidates:[],similar:[]};
      if(wName && lName){
        out.push({
          d: lineDate || String(defaultDate||''),
          wName,
          lName,
          map: parsed.map || '-',
          note: lineNote || '',
          wPlayer: wMatch.player || null,
          lPlayer: lMatch.player || null,
          wCandidates: wMatch.candidates || [],
          lCandidates: lMatch.candidates || [],
          wSimilar: wMatch.similar || [],
          lSimilar: lMatch.similar || []
        });
        return;
      }
    }

    const parts = String(lineForParse||trimmed).split(/[\s\t]+/).filter(Boolean);
    if(parts.length < 2) return;
    const wName = _pcStageResolveAliasName(parts[0]);
    const lName = _pcStageResolveAliasName(parts[1]);
    const map = parts.slice(2).join(' ').trim() || '-';
    if(!wName || !lName) return;
    const wMatch = (typeof findPlayerByPartialName === 'function') ? findPlayerByPartialName(wName) : {player:null,candidates:[],similar:[]};
    const lMatch = (typeof findPlayerByPartialName === 'function') ? findPlayerByPartialName(lName) : {player:null,candidates:[],similar:[]};
    out.push({
      d: lineDate || String(defaultDate||''),
      wName,
      lName,
      map,
      note: lineNote || '',
      wPlayer: wMatch.player || null,
      lPlayer: lMatch.player || null,
      wCandidates: wMatch.candidates || [],
      lCandidates: lMatch.candidates || [],
      wSimilar: wMatch.similar || [],
      lSimilar: lMatch.similar || []
    });
  });

  return out;
}

function _pcStageParseBulkEntries(text, defaultDate){
  return _pcStageBuildBulkResults(text, defaultDate)
    .filter(r => r.wPlayer && r.lPlayer)
    .map(r => ({
      d: r.d || String(defaultDate||''),
      wName: r.wPlayer.name,
      lName: r.lPlayer.name,
      map: r.map || '-',
      note: r.note || ''
    }));
}

function pcStageBulkPreview(tnId, round){
  const raw = (document.getElementById('_pcStageBulkText')?.value || '').trim();
  const badge = document.getElementById('_pcStageBulkBadge');
  const previewEl = document.getElementById('_pcStageBulkPreview');
  const saveBtn = document.getElementById('_pcStageBulkApplyBtn');
  const baseDate = (document.getElementById('_pcStageBulkDate')?.value || '').trim() || new Date().toISOString().slice(0,10);
  if(!previewEl) return;
  if(!raw){
    previewEl.innerHTML = '';
    if(badge) badge.style.display = 'none';
    if(saveBtn) saveBtn.disabled = false;
    window._pcStageBulkResults = [];
    return;
  }
  const results = _pcStageBuildBulkResults(raw, baseDate);
  const prev = window._pcStageBulkResults || [];
  if(prev && prev.length === results.length){
    results.forEach((r, i)=>{
      const p = prev[i];
      if(!p || p.wName !== r.wName || p.lName !== r.lName) return;
      if (p.wPlayer && !r.wPlayer) { r.wPlayer = p.wPlayer; r.wCandidates = p.wCandidates; r.wSimilar = p.wSimilar; }
      if (p.lPlayer && !r.lPlayer) { r.lPlayer = p.lPlayer; r.lCandidates = p.lCandidates; r.lSimilar = p.lSimilar; }
      if (p.map && p.map !== '-') r.map = p.map;
    });
  }
  window._pcStageBulkResults = results;
  _renderPcStageBulkPreview(tnId, round);
}

function _renderPcStageBulkPreview(tnId, round){
  const results = window._pcStageBulkResults || [];
  const badge = document.getElementById('_pcStageBulkBadge');
  const previewEl = document.getElementById('_pcStageBulkPreview');
  const saveBtn = document.getElementById('_pcStageBulkApplyBtn');
  const warnEl = document.getElementById('_pcStageBulkWarn');
  if(!previewEl) return;
  const savable = results.filter(r => r.wPlayer && r.lPlayer);
  const unresolved = results.filter(r => !(r.wPlayer && r.lPlayer));
  if(badge){
    badge.style.display = results.length ? 'inline' : 'none';
    badge.textContent = `✅ ${savable.length}/${results.length}건 인식`;
    badge.style.background = savable.length === results.length ? '#dcfce7' : '#fef9c3';
    badge.style.color = savable.length === results.length ? '#16a34a' : '#b45309';
    badge.style.border = `1px solid ${savable.length === results.length ? '#bbf7d0' : '#fcd34d'}`;
  }
  if(warnEl) warnEl.style.display = unresolved.length ? 'inline' : 'none';
  if(saveBtn) saveBtn.disabled = results.length > 0 && !savable.length;
  if(!results.length){
    previewEl.innerHTML = '<div style="margin-top:12px;padding:16px 14px;border-radius:12px;border:1px dashed var(--border2);background:var(--surface);font-size:12px;color:var(--gray-l);text-align:center;line-height:1.7">붙여넣기하면 여기에 자동인식 미리보기가 표시됩니다.<br><span style="font-size:11px">선수 선택, 승패 뒤집기, 맵/날짜 수정 후 저장할 수 있습니다.</span></div>';
    return;
  }
  const allMaps = [...new Set([...maps.filter(m=>m&&m!=='-'), ...results.map(r=>r.map).filter(m=>m&&m!=='-')])].sort();
  const buildCell = (i, ok, ambig, player, rawName, cands, similar, role) => {
    if (ok) return `<button onclick="pcStageBulkPick(${i},${JSON.stringify(role)},${JSON.stringify(player.name)},${JSON.stringify(tnId)},${JSON.stringify(round)})" style="font-size:12px;font-weight:900;color:${role==='w'?'#1d4ed8':'#991b1b'};background:${role==='w'?'#dbeafe':'#fee2e2'};border:1.5px solid ${role==='w'?'#93c5fd':'#fca5a5'};border-radius:7px;padding:2px 8px;cursor:pointer;white-space:nowrap">${player.name}</button>`;
    if (ambig) return `<div><span style="color:#b45309;font-size:10px;font-weight:700">${rawName}</span><div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">${(cands||[]).map(c=>`<button onclick="pcStageBulkPick(${i},${JSON.stringify(role)},${JSON.stringify(c.name)},${JSON.stringify(tnId)},${JSON.stringify(round)})" style="padding:2px 6px;border-radius:4px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:10px;cursor:pointer">${c.name}</button>`).join('')}</div></div>`;
    return `<div><span style="color:#dc2626;font-size:11px;font-weight:700">${rawName||'?'}</span>${(similar||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">${similar.map(c=>`<button onclick="pcStageBulkPick(${i},${JSON.stringify(role)},${JSON.stringify(c.name)},${JSON.stringify(tnId)},${JSON.stringify(round)})" style="padding:2px 6px;border-radius:4px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:10px;cursor:pointer">${c.name}</button>`).join('')}</div>`:''}</div>`;
  };
  let h = `<div style="overflow-x:auto;border-radius:8px;border:1px solid var(--border);margin-top:8px"><table style="width:100%;border-collapse:collapse;font-size:11px">
    <thead><tr style="background:var(--surface)">
      <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--text3)">승자</th>
      <th style="padding:5px 3px;width:28px"></th>
      <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--text3)">패자</th>
      <th style="padding:5px 6px;text-align:left;font-weight:700;color:var(--text3)">맵</th>
      <th style="padding:5px 6px;text-align:left;font-weight:700;color:var(--text3)">날짜</th>
      <th style="padding:5px 6px;text-align:left;font-weight:700;color:var(--text3)">참고</th>
      <th style="padding:5px 4px;width:28px"></th>
    </tr></thead><tbody>`;
  results.forEach((r, i) => {
    const wOk = !!r.wPlayer, lOk = !!r.lPlayer, ok = wOk && lOk;
    const wAmbig = !wOk && (r.wCandidates||[]).length > 1;
    const lAmbig = !lOk && (r.lCandidates||[]).length > 1;
    const wCell = buildCell(i, wOk, wAmbig, r.wPlayer, r.wName, r.wCandidates, r.wSimilar, 'w');
    const lCell = buildCell(i, lOk, lAmbig, r.lPlayer, r.lName, r.lCandidates, r.lSimilar, 'l');
    const mapOpts = `<option value="-">-</option>` + allMaps.map(m=>`<option value="${m}" ${m===r.map?'selected':''}>${m}</option>`).join('') + `<option value="__c__">직접입력</option>`;
    const mapSel = `<select onchange="if(this.value==='__c__'){const v=prompt('맵 이름:');if(v){window._pcStageBulkResults[${i}].map=v;_renderPcStageBulkPreview(${JSON.stringify(tnId)},${JSON.stringify(round)})}}else{window._pcStageBulkResults[${i}].map=this.value}" style="width:75px;border:1px solid var(--border2);border-radius:5px;padding:2px 3px;font-size:10px">${mapOpts}</select>`;
    const dateInp = `<input type="date" value="${(r.d||'').replace(/"/g,'&quot;')}" onchange="window._pcStageBulkResults[${i}].d=this.value;_renderPcStageBulkPreview(${JSON.stringify(tnId)},${JSON.stringify(round)})" style="width:132px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:10px">`;
    const noteCell = r.note
      ? `<div style="max-width:220px;font-size:10px;line-height:1.5;color:var(--gray-l);white-space:normal;word-break:break-word">${String(r.note).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`
      : `<span style="font-size:10px;color:#cbd5e1">-</span>`;
    const flipBtn = `<button onclick="pcStageBulkFlip(${i},${JSON.stringify(tnId)},${JSON.stringify(round)})" title="승패 교체" style="padding:2px 5px;border-radius:4px;border:1px solid #ddd6fe;background:#f5f3ff;font-size:12px;cursor:pointer">⇄</button>`;
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
      <td style="padding:5px 5px">${dateInp}</td>
      <td style="padding:5px 6px">${noteCell}</td>
      <td style="padding:5px 4px;text-align:center">${status}</td>
    </tr>`;
  });
  h += `</tbody></table></div>`;
  previewEl.innerHTML = h;
}

window.pcStageBulkPick = function(i, role, name, tnId, round){
  const r = (window._pcStageBulkResults||[])[i];
  if(!r) return;
  const p = players.find(pl => pl.name === name);
  if(!p) return;
  if(role === 'w'){ r.wPlayer = p; r.wCandidates = [p]; }
  else { r.lPlayer = p; r.lCandidates = [p]; }
  _renderPcStageBulkPreview(tnId, round);
};

window.pcStageBulkFlip = function(i, tnId, round){
  const r = (window._pcStageBulkResults||[])[i];
  if(!r) return;
  [r.wName, r.lName] = [r.lName, r.wName];
  [r.wPlayer, r.lPlayer] = [r.lPlayer, r.wPlayer];
  [r.wCandidates, r.lCandidates] = [r.lCandidates, r.wCandidates];
  [r.wSimilar, r.lSimilar] = [r.lSimilar, r.wSimilar];
  _renderPcStageBulkPreview(tnId, round);
};

window.openPcStageBulkPasteModal = function(tnId, round){
  const tn=_findTourneyById(tnId); if(!tn) return;
  const r = _pcNormalizeStageRound(round);
  const today = new Date().toISOString().slice(0,10);
  const modal=document.createElement('div');
  modal.id='_pcStageBulkPaste';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML=`<div class="umbox" style="width:780px;max-width:97vw;max-height:92vh;overflow:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div class="mtitle" style="margin-bottom:0">🏅 프로리그 대회 ${r} 경기 결과 붙여넣기</div>
      <div style="display:flex;gap:6px;align-items:center">
        <span id="_pcStageBulkBadge" style="display:none;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0"></span>
        <button class="btn btn-w btn-sm" onclick="document.getElementById('_pcStageBulkPaste')?.remove()">✕ 닫기</button>
      </div>
    </div>
    <details style="margin-bottom:12px">
      <summary style="font-size:12px;font-weight:700;color:#7c3aed;cursor:pointer;padding:6px 10px;background:#f5f3ff;border-radius:8px;border:1px solid #ddd6fe;list-style:none;display:flex;align-items:center;gap:5px">📌 사용법 보기</summary>
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:0 0 8px 8px;padding:10px 14px;font-size:12px;color:#5b21b6;line-height:1.9;margin-top:-1px">
        형식 A: <span style="font-family:monospace;background:#ede9fe;padding:1px 6px;border-radius:4px">승자이름 패자이름 [맵]</span><br>
        형식 B: <span style="font-family:monospace;background:#ede9fe;padding:1px 6px;border-radius:4px">[맵] 홍길동T (승) vs (패) 이순신Z</span><br>
        형식 C: <span style="font-family:monospace;background:#ede9fe;padding:1px 6px;border-radius:4px">2026-05-02[TAB]승자[TAB]패자[TAB]맵</span><br>
        <span style="color:#7c3aed;font-size:11px">💡 일반 경기 결과 자동인식과 같은 방식으로 선수/맵을 인식하고, 애매하면 아래 미리보기에서 직접 선택할 수 있습니다.</span>
      </div>
    </details>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <label style="font-size:12px;font-weight:700;color:var(--text2)">📅 기본 날짜</label>
      <input type="date" id="_pcStageBulkDate" value="${today}" onchange="pcStageBulkPreview('${tnId}','${r}')" style="border:1px solid var(--border2);border-radius:7px;padding:5px 10px;font-size:13px">
      <div style="font-size:11px;color:var(--gray-l)">줄마다 날짜가 없으면 이 날짜로 저장됩니다.</div>
    </div>
    <div style="position:relative">
      <textarea id="_pcStageBulkText" oninput="pcStageBulkPreview('${tnId}','${r}')" style="width:100%;min-height:160px;font-size:13px;border:1.5px solid #ddd6fe;border-radius:10px;padding:12px 36px 12px 12px;resize:vertical;font-family:'Noto Sans KR',monospace;line-height:1.8;box-sizing:border-box" placeholder="예)&#10;[실피드] 홍길동T (승) vs (패) 임꺽정Z&#10;또는&#10;홍길동 임꺽정 투혼&#10;또는&#10;2026-05-02\t홍길동\t임꺽정\t투혼"></textarea>
      <button onclick="document.getElementById('_pcStageBulkText').value='';pcStageBulkPreview('${tnId}','${r}')"
        title="입력 지우기"
        style="position:absolute;top:8px;right:8px;background:var(--border2);border:none;border-radius:5px;width:22px;height:22px;font-size:13px;line-height:1;cursor:pointer;color:var(--text3);display:flex;align-items:center;justify-content:center;transition:.15s;"
        onmouseover="this.style.background='#dc2626';this.style.color='#fff'"
        onmouseout="this.style.background='var(--border2)';this.style.color='var(--text3)'">✕</button>
    </div>
    <div id="_pcStageBulkPreview"></div>
    <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;align-items:center">
      <span id="_pcStageBulkWarn" style="display:none;font-size:11px;color:#b45309;font-weight:600">⚠️ 선택 필요한 항목이 있습니다</span>
      <button class="btn btn-w" onclick="document.getElementById('_pcStageBulkPaste')?.remove()">취소</button>
      <button id="_pcStageBulkApplyBtn" class="btn btn-g" onclick="pcApplyStageBulkPaste('${tnId}','${r}')">✅ 저장하기</button>
    </div>
  </div>`;
  window._pcStageBulkResults = [];
  document.body.appendChild(modal);
  _renderPcStageBulkPreview(tnId, r);
};

window.pcApplyStageBulkPaste = function(tnId, round){
  const tn=_findTourneyById(tnId); if(!tn) return;
  _pcEnsureStageRecords(tn);
  const r = _pcNormalizeStageRound(round);
  const text=(document.getElementById('_pcStageBulkText')?.value||'').trim();
  if(!text) return;
  const d = (document.getElementById('_pcStageBulkDate')?.value || '').trim() || new Date().toISOString().slice(0,10);
  const previewList = Array.isArray(window._pcStageBulkResults) ? window._pcStageBulkResults : [];
  const entries = (previewList.length ? previewList.filter(x=>x && x.wPlayer && x.lPlayer).map(x=>({
    d: x.d || d,
    wName: x.wPlayer.name,
    lName: x.lPlayer.name,
    map: x.map || '-',
    note: x.note || ''
  })) : _pcStageParseBulkEntries(text, d));
  if(!entries.length){
    alert('인식된 경기 결과가 없습니다.\n일반 경기 결과 자동인식 형식이나 "승자 패자 맵" 형식으로 입력해주세요.');
    return;
  }
  let added=0;
  entries.forEach(entry=>{
    const wName = entry.wName;
    const lName = entry.lName;
    const map = entry.map || '-';
    const note = entry.note || '';
    const recDate = entry.d || d;
    const a=wName, b=lName, winner='A';
    const mid=`ptr_${tnId}_${r}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;
    tn.stageRecords[r].push({a,b,winner,d:recDate,map,note,_id:mid});
    try{ applyGameResult(wName, lName, recDate, map, mid, '', '', '프로리그대회'); }catch(e){}
    added++;
  });
  try{ document.getElementById('_pcStageBulkPaste')?.remove(); }catch(e){}
  save(); render();
  if(added>0) alert(`${added}경기가 추가되었습니다.`);
};
function _pcCollectSeedCandidates(tn){
  const s=new Set();
  // 1) 브라켓에 이미 들어간 선수
  (tn.bracket||[]).forEach(rnd=>(rnd||[]).forEach(m=>{
    if(m&&m.a&&m.a!=='TBD') s.add(m.a);
    if(m&&m.b&&m.b!=='TBD') s.add(m.b);
  }));
  // 2) 조별리그가 있으면 1,2위 후보도 포함
  try{
    (tn.groups||[]).forEach(grp=>{
      const ranks = (typeof _calcProGrpRank==='function') ? _calcProGrpRank(grp) : [];
      if(ranks[0]?.name) s.add(ranks[0].name);
      if(ranks[1]?.name) s.add(ranks[1].name);
    });
  }catch(e){}
  return Array.from(s).filter(Boolean).sort((a,b)=>a.localeCompare(b));
}
function proCompOpenSeedModal(tnId){
  const tn=_findTourneyById(tnId);
  if(!tn) return;
  if(!tn.bracket || !tn.bracket.length) return alert('먼저 토너먼트 대진표를 생성/생성(직접 만들기) 해주세요.');
  if(!tn.seedStarts) tn.seedStarts = {};
  const firstSize = (tn.bracket[0]||[]).length*2;
  if(!firstSize) return alert('대진표 크기를 확인할 수 없습니다.');
  const sizes=[];
  for(let s=firstSize; s>=2; s=Math.floor(s/2)) sizes.push(s);
  const opts = sizes.map((s,i)=>`<option value="${s}">${i===0?`${_pcRoundLabelBySize(s)}(첫 라운드)`:`${_pcRoundLabelBySize(s)}부터`}</option>`).join('');
  const cand=_pcCollectSeedCandidates(tn);
  if(!cand.length) return alert('시드 후보를 찾을 수 없습니다.');

  const modal=document.createElement('div');
  modal.id='_pcSeedModal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML=`<div style="background:var(--white);border-radius:14px;padding:18px;width:min(520px,100%);max-height:90vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.25)">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:14px">🎫 시드/부전승(라운드 합류)</div>
      <div style="margin-left:auto;display:flex;gap:6px">
        <button class="btn btn-b btn-sm" onclick="proCompApplySeedStarts('${tnId}')">✅ 적용(자동 배치)</button>
        <button class="btn btn-w btn-sm" onclick="document.getElementById('_pcSeedModal')?.remove()">닫기</button>
      </div>
    </div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">
      32강 대회에서 일부 선수가 16강/8강부터 합류하는 케이스를 지원합니다. <b>적용</b>을 누르면 “시작 라운드가 첫 라운드가 아닌 선수”는 해당 라운드의 빈 슬롯에 자동 배치됩니다.<br>
      <span style="font-size:11px">※ 정확한 위치 재배치는 각 경기의 <b>✏️ 경기수정</b>에서 선수(A/B)를 바꾸면 됩니다.</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${cand.map(name=>{
        const cur = parseInt(tn.seedStarts[name]||firstSize,10)||firstSize;
        return `<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--border);border-radius:10px;padding:10px 12px;background:var(--surface)">
          <div style="font-weight:900;font-size:12px;min-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          <select data-seed-player="${name.replace(/\"/g,'&quot;')}" style="flex:1;padding:6px 10px;border-radius:10px;border:1px solid var(--border2);font-weight:800;font-size:12px">
            ${sizes.map((s,i)=>`<option value="${s}" ${s===cur?'selected':''}>${i===0?`${_pcRoundLabelBySize(s)}(첫 라운드)`:`${_pcRoundLabelBySize(s)}부터`}</option>`).join('')}
          </select>
        </div>`;
      }).join('')}
    </div>
  </div>`;
  document.body.appendChild(modal);
}
function proCompApplySeedStarts(tnId){
  const tn=_findTourneyById(tnId);
  if(!tn||!tn.bracket||!tn.bracket.length) return;
  const wrap=document.getElementById('_pcSeedModal');
  if(!wrap) return;
  const firstSize=(tn.bracket[0]||[]).length*2;
  if(!tn.seedStarts) tn.seedStarts={};
  // UI 값 저장
  wrap.querySelectorAll('select[data-seed-player]').forEach(sel=>{
    const name=sel.getAttribute('data-seed-player')||'';
    const v=parseInt(sel.value,10)||firstSize;
    if(!name) return;
    tn.seedStarts[name]=v;
  });
  if(!confirm('선택한 “시작 라운드” 기준으로 자동 배치할까요?\n(첫 라운드가 아닌 선수는 기존 위치에서 제거 후, 해당 라운드의 빈 슬롯에 배치됩니다.)')) return;

  const sizes=[];
  for(let s=firstSize;s>=2;s=Math.floor(s/2)) sizes.push(s);
  const sizeToRi=(sz)=>{
    const ratio = firstSize / sz;
    const ri = Math.round(Math.log2(ratio));
    return Math.max(0, Math.min((tn.bracket.length-1), ri));
  };
  const normEmpty=v=>!v||v==='TBD'||v==='BYE';

  // 1) 첫 라운드가 아닌 시드만 대상으로, 기존 위치 제거
  Object.entries(tn.seedStarts||{}).forEach(([name,sz])=>{
    const v=parseInt(sz,10)||firstSize;
    if(v>=firstSize) return;
    (tn.bracket||[]).forEach(rnd=>{
      (rnd||[]).forEach(m=>{
        if(!m) return;
        if(m.a===name) m.a='TBD';
        if(m.b===name) m.b='TBD';
        if(m.winner && (m.winner==='A'&&m.a!=='TBD'&&m.a!==name)===false && (m.winner==='B'&&m.b!=='TBD'&&m.b!==name)===false){
          // 참가자 제거로 승자 무효화될 수 있어 초기화
          m.winner='';
        }
      });
    });
  });

  // 2) 대상 시드들을 라운드별로 위에서 아래로 채움
  const targets = Object.entries(tn.seedStarts||{})
    .map(([name,sz])=>({name,sz:parseInt(sz,10)||firstSize}))
    .filter(x=>x.name && x.sz<firstSize)
    .sort((a,b)=>a.sz-b.sz||a.name.localeCompare(b.name)); // 더 늦게 합류(작은 강수) 먼저 채우면 자리 부족 방지

  const failed=[];
  targets.forEach(({name,sz})=>{
    const ri=sizeToRi(sz);
    const rnd = tn.bracket[ri]||[];
    let placed=false;
    for(let mi=0;mi<rnd.length&&!placed;mi++){
      const m=rnd[mi]; if(!m) continue;
      if(normEmpty(m.a)){ m.a=name; placed=true; break; }
      if(normEmpty(m.b)){ m.b=name; placed=true; break; }
    }
    if(!placed) failed.push(`${name}(${_pcRoundLabelBySize(sz)})`);
  });
  save(); render();
  if(failed.length) alert('빈 슬롯이 부족해 일부 시드를 배치하지 못했습니다:\n- '+failed.join('\n- '));
}

/* 대진표 초기화 (그룹 순위 기반) */
function proCompInitBracket(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  // 각 조 1,2위 추출
  const seeds = [];
  tn.groups.forEach(grp => {
    const ranks = _calcProGrpRank(grp);
    if (ranks[0]) seeds.push(ranks[0].name);
    if (ranks[1]) seeds.push(ranks[1].name);
  });
  if (seeds.length < 2) { alert('대진표 생성을 위해 각 조에 선수가 필요합니다.'); return; }
  // 올림으로 2의 거듭제곱 맞춤
  let sz = 2;
  while (sz < seeds.length) sz *= 2;
  while (seeds.length < sz) seeds.push('TBD');
  // 1라운드 매치
  const firstRound = [];
  for (let i=0; i<sz; i+=2) firstRound.push({a:seeds[i], b:seeds[i+1], winner:'', d:'', map:''});
  // 이후 라운드 구성
  const rounds = [firstRound];
  let cur = firstRound.length;
  while (cur > 1) {
    cur = Math.floor(cur/2);
    const rnd = [];
    for (let i=0; i<cur; i++) rnd.push({a:'TBD', b:'TBD', winner:'', d:'', map:''});
    rounds.push(rnd);
  }
  tn.bracket = rounds;
  save(); render();
}

function proCompSetBktWinner(tnId, ri, mi, winner) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const _isByeMatch = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  // (요청사항) 부전승(BYE/TBD) 경기: 승자 전파만 하고 개인 전적/대전기록에는 반영하지 않음
  const byeSide =
    (!_isByeMatch(m.a) && _isByeMatch(m.b)) ? 'A'
    : (_isByeMatch(m.a) && !_isByeMatch(m.b)) ? 'B'
    : '';
  const prevWinner = m.winner;
  const tieId = `pbn_${tnId}_${ri}_${mi}_tie`;
  // 이전에 동률 저장이 있었다면, 승자 확정 시 동률 기록은 제거
  const hadTie = (!prevWinner && Array.isArray(m._games) && m._games.length>0 &&
    (m._games.filter(g=>g.winner==='A').length === m._games.filter(g=>g.winner==='B').length));
  m.winner = m.winner===winner ? '' : winner;
  const nextMi = Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    if (m.winner) {
      // 승자 전파
      const wName = m.winner==='A'?m.a:m.b;
      if (isA) next.a=wName; else next.b=wName;
    } else {
      // 승자 취소 시 다음 라운드 해당 슬롯 초기화 + 이후 라운드 연쇄 초기화
      if (isA) next.a='TBD'; else next.b='TBD';
      next.winner='';
      // 이후 라운드 연쇄 초기화
      let curMi=nextMi;
      for (let r=ri+2; r<tn.bracket.length; r++) {
        const nxt2Mi=Math.floor(curMi/2);
        const isA2=curMi%2===0;
        if (!tn.bracket[r]||!tn.bracket[r][nxt2Mi]) break;
        if (isA2) tn.bracket[r][nxt2Mi].a='TBD'; else tn.bracket[r][nxt2Mi].b='TBD';
        tn.bracket[r][nxt2Mi].winner='';
        curMi=nxt2Mi;
      }
    }
  }
  // 준결승 패자 시 3위전 자동 배정 (3위전이 추가된 경우에만)
  const semiRi = tn.bracket.length - 2;
  if (tn.thirdPlace && ri === semiRi && tn.bracket.length >= 2 && (mi === 0 || mi === 1)) {
    const thirdKey = `pbn_${tnId}_3rd`;
    if (tn.thirdPlace.winner) _revertProMatch(thirdKey);
    tn.thirdPlace.winner = '';
    const loser = m.winner==='A'?m.b:(m.winner==='B'?m.a:'');
    if (mi === 0) tn.thirdPlace.a = loser||'TBD';
    else tn.thirdPlace.b = loser||'TBD';
  }
  // player history 반영
  const bktMatchId = `pbn_${tnId}_${ri}_${mi}`;
  if(!byeSide && !_isByeMatch(m.a) && !_isByeMatch(m.b)){
    if (hadTie && m.winner) { try{ _revertDrawMatch(tieId); }catch(e){} }
    if (prevWinner && m.a && m.b) _revertProMatch(bktMatchId);
    _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
  }
  save(); render();
}

// (요청사항) 부전승 자동 처리: BYE/TBD 상대일 때 자동 승자 지정 + 다음 라운드 전파
function proCompApplyBye(tnId, ri, mi){
  const tn=_findTourneyById(tnId);
  const m=tn?.bracket?.[ri]?.[mi];
  if(!tn||!m) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  const side = (!isBye(m.a) && isBye(m.b)) ? 'A' : (isBye(m.a) && !isBye(m.b)) ? 'B' : '';
  if(!side) return alert('부전승 처리 가능한 경기가 아닙니다.');
  m.winner = side;
  const nextMi=Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    const wName = side==='A'?m.a:m.b;
    if (isA) next.a=wName; else next.b=wName;
  }
  save(); render();
}

// (요청사항) 특정 토너먼트 경기 삭제(초기화) + 히스토리 롤백 + 이후 라운드 전파 초기화
function proCompClearBktMatch(tnId, ri, mi){
  const tn=_findTourneyById(tnId);
  if(!tn||!tn.bracket||!tn.bracket[ri]||!tn.bracket[ri][mi]) return;
  const m=tn.bracket[ri][mi];
  if(!confirm('이 토너먼트 경기 기록을 삭제(초기화)할까요?')) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  const bktMatchId=`pbn_${tnId}_${ri}_${mi}`;
  const tieId = `${bktMatchId}_tie`;
  // 기존 히스토리 롤백 (BYE 제외)
  if(m.winner && !isBye(m.a) && !isBye(m.b)){
    try{ _revertProMatch(bktMatchId); }catch(e){}
  }
  // 동률(무승부) 기록도 롤백
  try{ _revertDrawMatch(tieId); }catch(e){}
  // 3위전 연결된 준결승이면 3위전도 초기화
  const semiRi = tn.bracket.length - 2;
  if(tn.thirdPlace && ri===semiRi && (mi===0||mi===1)){
    const thirdKey=`pbn_${tnId}_3rd`;
    if(tn.thirdPlace.winner) { try{ _revertProMatch(thirdKey); }catch(e){} }
    tn.thirdPlace.winner=''; tn.thirdPlace.map=''; tn.thirdPlace.d=''; tn.thirdPlace._games=[];
    if(mi===0) tn.thirdPlace.a='TBD';
    if(mi===1) tn.thirdPlace.b='TBD';
  }
  // 이 경기 초기화
  m.winner=''; m.map=''; m.d=''; m._games=[];
  // 다음 라운드 슬롯 초기화 + 이후 연쇄 초기화
  const nextMi=Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    if (isA) next.a='TBD'; else next.b='TBD';
    next.winner=''; next.map=''; next.d=''; next._games=[];
    let curMi=nextMi;
    for (let r=ri+2; r<tn.bracket.length; r++) {
      const nxt2Mi=Math.floor(curMi/2);
      const isA2=curMi%2===0;
      if (!tn.bracket[r]||!tn.bracket[r][nxt2Mi]) break;
      if (isA2) tn.bracket[r][nxt2Mi].a='TBD'; else tn.bracket[r][nxt2Mi].b='TBD';
      tn.bracket[r][nxt2Mi].winner=''; tn.bracket[r][nxt2Mi].map=''; tn.bracket[r][nxt2Mi].d=''; tn.bracket[r][nxt2Mi]._games=[];
      curMi=nxt2Mi;
    }
  }
  save(); render();
}

// (요청사항) 대진표 자체 삭제
function proCompDeleteBracket(tnId){
  const tn=_findTourneyById(tnId);
  if(!tn) return;
  if(!confirm('현재 대회의 대진표(토너먼트)를 삭제할까요?\n\n⚠️ 토너먼트 경기 결과/스트리머 최근 경기 반영도 함께 제거됩니다.')) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  const _rmRecordById = (mid)=>{
    if(!mid) return;
    try{
      const pi = (typeof proM!=='undefined'?proM:[]).findIndex(x=>x && x._id===mid);
      if(pi>=0) proM.splice(pi,1);
    }catch(e){}
    try{
      const ti = (typeof ttM!=='undefined'?ttM:[]).findIndex(x=>x && x._id===mid);
      if(ti>=0) ttM.splice(ti,1);
    }catch(e){}
  };
  const _buildMatchObj = (mid, m)=>{
    // revertMatchRecord가 gameMatchId(mid_s0_g#)까지 지울 수 있게 sets/games 구조로 구성
    const games = (m && Array.isArray(m._games) ? m._games : []);
    return {
      _id: mid,
      d: (m && m.d) ? m.d : '',
      sets: [{
        games: games.map(g=>({
          playerA: g.winName || '',
          playerB: g.loseName || '',
          winner: 'A',
          map: g.map || ''
        }))
      }]
    };
  };
  // 히스토리/기록 롤백 (player history + proM/ttM)
  (tn.bracket||[]).forEach((rnd,ri)=>{
    (rnd||[]).forEach((m,mi)=>{
      const mid = `pbn_${tnId}_${ri}_${mi}`;
      // 동률 저장(무승부) 롤백
      try{
        const hasGames = m && Array.isArray(m._games) && m._games.length>0;
        const sA = hasGames ? m._games.filter(g=>g.winner==='A').length : 0;
        const sB = hasGames ? m._games.filter(g=>g.winner==='B').length : 0;
        if(m && !m.winner && hasGames && sA===sB && (sA+sB)>0 && !isBye(m.a) && !isBye(m.b)){
          _revertDrawMatch(`${mid}_tie`);
        }
      }catch(e){}
      if(m && m.winner && !isBye(m.a) && !isBye(m.b)){
        try{
          if(typeof revertMatchRecord==='function') revertMatchRecord(_buildMatchObj(mid,m));
          else _revertProMatch(mid);
        }catch(e){}
        _rmRecordById(mid);
      }
    });
  });
  if(tn.thirdPlace && tn.thirdPlace.winner){
    const mid = `pbn_${tnId}_3rd`;
    try{
      if(typeof revertMatchRecord==='function') revertMatchRecord(_buildMatchObj(mid, tn.thirdPlace));
      else _revertProMatch(mid);
    }catch(e){}
    _rmRecordById(mid);
  }
  tn.bracket = [];
  tn.thirdPlace = null;
  tn.seedStarts = {};
  save(); render();
}

/* ══════════════════════════════════════════════════════════════
   대진표 결과 일괄 입력 (붙여넣기)
   ══════════════════════════════════════════════════════════════ */
function proCompOpenBktPasteModal(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket.length) { alert('대진표가 생성되지 않았습니다.\n(대진표 메뉴에서 대진표 생성 버튼)'); return; }
  const rounds = tn.bracket;
  const totalRounds = rounds.length;
  const rndLabel = ri => ri===totalRounds-1?'결승':ri===totalRounds-2?'준결승':ri===totalRounds-3?'4강':`${Math.pow(2,totalRounds-ri)}강`;
  // 진행 가능한 경기 목록 (a, b 모두 있는 경기)
  const pending = [];
  rounds.forEach((rnd, ri) => rnd.forEach((m, mi) => {
    if (m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD') pending.push({ri, mi, a:m.a, b:m.b, round:rndLabel(ri), done:!!m.winner});
  }));
  const pendHTML = pending.length
    ? `<div style="font-size:11px;color:var(--text3);margin-bottom:8px;padding:8px;background:var(--surface);border-radius:8px;line-height:1.9">
        ${pending.map(p=>`<span style="display:inline-block;margin:1px 4px;padding:1px 8px;border-radius:10px;background:${p.done?'#dcfce7':'#fef3c7'};color:${p.done?'#16a34a':'#92400e'};font-size:10px;font-weight:700">${p.round}: ${p.a} vs ${p.b}${p.done?' 완료':''}</span>`).join('')}
       </div>` : '';
  const modal = document.createElement('div');
  modal.id = '_bktPasteModal';
  modal.className = 'modal-compact-overlay';
  modal.innerHTML = `<div class="modal-compact-box" style="width:440px;max-height:90vh;overflow-y:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
      <div style="font-weight:900;font-size:15px">대진표 결과 일괄 입력</div>
      <span class="btn btn-w btn-xs" style="margin-left:auto">선택 경기 ${pending.length}</span>
    </div>
    <div style="font-size:11px;color:var(--text3);background:var(--surface);border-radius:8px;padding:10px;margin-bottom:10px;line-height:1.8">
      한 줄에 한 경기 (공백/탭 구분):<br>
      <code>승자이름 패자이름 [맵]</code><br>
      대진표에 등록된 선수명과 일치해야 자동 배정됩니다.
    </div>
    ${pendHTML}
    <textarea id="_bkt_text" rows="8" placeholder="${pending.slice(0,3).map(p=>`${p.a} ${p.b} 맵이름`).join('\n')||'승자이름 패자이름 맵이름'}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:12px;box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
    <div id="_bkt_preview" style="margin-top:6px;font-size:11px;color:var(--text3)"></div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveBktPaste('${tnId}')">적용</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktPasteModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompSaveBktPaste(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket) return;
  const text = (document.getElementById('_bkt_text')||{}).value||'';
  document.getElementById('_bktPasteModal').remove();
  if (!text.trim()) return;
  const lines = text.trim().split('\n').map(l=>l.trim()).filter(Boolean);
  let applied = 0, skipped = 0;

  // (개선) TSV(날짜/승자/패자/맵/...) 입력 지원 + 종족 접미사(Z/P/T) 제거 + 별명 매핑 지원
  const aliasMap = (()=>{ try{ return JSON.parse(localStorage.getItem('su_player_alias_map')||'{}')||{}; }catch(e){ return {}; } })();
  const nfc = (s)=> (s&&s.normalize) ? s.normalize('NFC') : String(s||'');
  const normKey = (s)=> nfc(String(s||'')).replace(/\s+/g,'').toLowerCase();
  const stripRace = (s)=>{
    const t = String(s||'').trim();
    if(!t) return '';
    // "박상현Z" / "박상현 Z" → "박상현"
    return t.replace(/\s*[TZPNtzpn]$/,'').trim();
  };
  const resolveAlias = (name0)=>{
    const name = stripRace(name0);
    if(!name) return '';
    // 직접 일치
    if(aliasMap && (name in aliasMap)) return String(aliasMap[name]||'') || name;
    // 정규화(공백/대소문자/종족접미사 제거) 기반 일치
    const nk = normKey(name);
    for(const k in (aliasMap||{})){
      if(normKey(k)===nk) return String(aliasMap[k]||'') || name;
    }
    return name;
  };

  lines.forEach(line => {
    let wRaw='', lRaw='', mapRaw='';
    // TSV 형식: 2026-04-13\t승자\t패자\t맵\t...
    const cols = line.split('\t').map(x=>x.trim()).filter(x=>x!=='' || x==='' );
    if(cols.length>=4 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0]||'')){
      wRaw = cols[1]||''; lRaw = cols[2]||''; mapRaw = cols[3]||'';
    }else{
      const parts = line.split(/[\s\t]+/).filter(Boolean);
      if (parts.length < 2) return;
      wRaw = parts[0]||''; lRaw = parts[1]||''; mapRaw = parts.slice(2).join(' ');
    }
    const wName = resolveAlias(wRaw);
    const lName = resolveAlias(lRaw);
    const map = (typeof resolveMapName==='function' ? resolveMapName(mapRaw) : mapRaw);
    if (!wName||!lName||wName===lName) return;

    // 브라켓에서 해당 슬롯 찾기
    let found = false;
    for (let ri=0; ri<tn.bracket.length; ri++) {
      for (let mi=0; mi<tn.bracket[ri].length; mi++) {
        const m = tn.bracket[ri][mi];
        if (!m.a||!m.b) continue;

        let winner = '';
        // 1. 선수 이름으로 정확히 매칭 (우선순위)
        if (m.a===wName && m.b===lName) winner='A';
        else if (m.b===wName && m.a===lName) winner='B';
        
        // 2. 대학명으로 매칭 (보조 - 대진표에 선수명이 있어도 대학명으로 붙여넣는 경우 대비)
        if (!winner) {
          const pa = players.find(x=>x.name===m.a)||null, pb = players.find(x=>x.name===m.b)||null;
          if (pa && pb) {
            if (pa.univ===wName && pb.univ===lName) winner='A';
            else if (pb.univ===wName && pa.univ===lName) winner='B';
          }
        }

        if (!winner) continue;
        if (map) m.map = map;
        const prevWinner = m.winner;
        m.winner = winner;
        const nextMi = Math.floor(mi/2), isA = mi%2===0;
        if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
          const next = tn.bracket[ri+1][nextMi];
          const wn = m.winner==='A'?m.a:m.b;
          if (isA) next.a=wn; else next.b=wn;
        }
        // 준결승 패자 시 3위전
        const semiRi = tn.bracket.length-2;
        if (tn.thirdPlace&&ri===semiRi&&tn.bracket.length>=2&&(mi===0||mi===1)) {
          if (tn.thirdPlace.winner) _revertProMatch(`pbn_${tnId}_3rd`);
          tn.thirdPlace.winner='';
          const loser=m.winner==='A'?m.b:m.a;
          if (mi===0) tn.thirdPlace.a=loser; else tn.thirdPlace.b=loser;
        }
        // player history 반영
        const bktMatchId=`pbn_${tnId}_${ri}_${mi}`;
        if (prevWinner&&m.a&&m.b) _revertProMatch(bktMatchId);
        _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
        applied++; found=true; break;
      }
      if (found) break;
    }
    if (!found) skipped++;
  });
  save(); render();
  alert(`총 ${applied}경기 적용${skipped>0?`, ${skipped}건 미매칭`:''}`);
}

function proCompBktSetDate(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const modal = document.createElement('div');
  modal.className = 'modal-compact-overlay';
  modal.innerHTML = `<div class="modal-compact-box modal-compact-box--sm" style="min-width:230px">
    <div style="font-weight:900;font-size:14px;margin-bottom:10px">🗓️ 날짜 입력</div>
    <input id="_bktDateInp" type="date" value="${m.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box;margin-bottom:10px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_bktDateInp').value;const t2=_findTourneyById('${tnId}');if(t2&&t2.bracket&&t2.bracket[${ri}]&&t2.bracket[${ri}][${mi}]){const m2=t2.bracket[${ri}][${mi}];m2.d=v; if(m2.winner)_syncBktMatchToHistory(t2,m2,'pbn_${tnId}_${ri}_${mi}',${ri},${mi});}document.body.removeChild(document.getElementById('_bktDateModal'));save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.body.removeChild(document.getElementById('_bktDateModal'))">취소</button>
    </div>
  </div>`;
  modal.id = '_bktDateModal';
  document.body.appendChild(modal);
}

function proCompBktSetMap(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const modal = document.createElement('div');
  modal.id = '_bktMapModal';
  modal.className = 'modal-compact-overlay';
  modal.innerHTML = `<div class="modal-compact-box" style="width:320px">
    <div style="font-weight:900;font-size:15px;margin-bottom:10px">🗺️ 맵 설정</div>
    <input id="_bktMapInp" value="${(m.map||'').replace(/"/g,'&quot;')}" placeholder="맵 이름 입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:13px;box-sizing:border-box;margin-bottom:10px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_bktMapInp').value.trim();const t2=_findTourneyById('${tnId}');if(t2&&t2.bracket&&t2.bracket[${ri}]&&t2.bracket[${ri}][${mi}]){const m2=t2.bracket[${ri}][${mi}];m2.map=v; if(m2.winner)_syncBktMatchToHistory(t2,m2,'pbn_${tnId}_${ri}_${mi}',${ri},${mi});}document.getElementById('_bktMapModal').remove();save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktMapModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('_bktMapInp').focus();
}

let _bktEditGames = [], _bktEditTnId = '', _bktEditRi = -1, _bktEditMi = -1;

function _bktEditRenderGames() {
  const cont = document.getElementById('_bktEditGameList');
  if (!cont) return;
  const tn = _findTourneyById(_bktEditTnId);
  const m = tn && tn.bracket ? tn.bracket[_bktEditRi]?.[_bktEditMi] : null;
  const aV = (document.getElementById('_bktEditA')?.value || document.getElementById('_bktEditAInp')?.value || '').trim() || m?.a || 'A';
  const bV = (document.getElementById('_bktEditB')?.value || document.getElementById('_bktEditBInp')?.value || '').trim() || m?.b || 'B';
  if (!_bktEditGames.length) { cont.innerHTML = '<div style="font-size:11px;color:var(--gray-l);padding:6px 0">게임 없음 — 아래 버튼으로 추가</div>'; return; }
  cont.innerHTML = _bktEditGames.map((g,i)=>`<div style="display:flex;gap:5px;align-items:center;padding:4px 0;border-top:1px solid var(--border)">
    <span style="font-size:11px;color:var(--gray-l);min-width:26px">${i+1}G</span>
    <select onchange="_bktEditGames[${i}].winner=this.value;_bktEditRenderGames()" style="flex:1;min-width:90px;font-size:11px;padding:3px">
      <option value="">승자</option>
      <option value="A"${g.winner==='A'?' selected':''}>🔵 ${aV}</option>
      <option value="B"${g.winner==='B'?' selected':''}>🔴 ${bV}</option>
    </select>
    <input type="text" value="${g.map||''}" placeholder="맵" style="flex:1;min-width:60px;padding:3px 6px;border:1px solid var(--border2);border-radius:5px;font-size:11px" oninput="_bktEditGames[${i}].map=this.value">
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
  if (hintEl) hintEl.innerHTML = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">📝 경기 결과 입력 (게임 목록에 추가)</span> — <b>${aV}</b> vs <b>${bV}</b><br><span style="font-size:11px;color:#6b7280">형식: <code>${aV} ${bV} [맵]</code> / <code>${bV} ${aV} [맵]</code></span></div>`;
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
  const bktId = `pbn_${_bktEditTnId}_${_bktEditRi}_${_bktEditMi}`;
  const tieId = `${bktId}_tie`;
  if (m.winner) _revertProMatch(bktId);
  m.a = aV; m.b = bV; m.d = dV;
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
      <label style="font-size:11px;font-weight:700;color:var(--text3)">A 선수</label>
      <select id="_bktEditA" onchange="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.a||'')}</select>
      <input id="_bktEditAInp" placeholder="직접 입력" value="${pList.some(p=>p.name===m.a)?'':m.a||''}" oninput="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="margin-bottom:8px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">B 선수</label>
      <select id="_bktEditB" onchange="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.b||'')}</select>
      <input id="_bktEditBInp" placeholder="직접 입력" value="${pList.some(p=>p.name===m.b)?'':m.b||''}" oninput="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">날짜</label>
      <input id="_bktEditD" type="date" value="${m.d||''}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:10px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:11px;font-weight:900;color:var(--text3);margin-bottom:6px">⚖️ 스코어로 빠른 입력 (2:2 / 3:3 등)</div>
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
        <label style="font-size:11px;font-weight:700;color:var(--text3)">게임 결과</label>
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
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:320px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:14px">🗺️ 3·4위전 맵 설정</div>
    <input id="_thirdMapInp" value="${((tn.thirdPlace.map)||'').replace(/"/g,'&quot;')}" placeholder="맵 이름 입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:13px;box-sizing:border-box;margin-bottom:14px">
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
function proCompGrpEdit() {
  const tn = getCurrentProTourney();
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px">🏗️ 조편성 관리 ${tn?' ('+tn.name+')':''}</div>`;
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
        <span style="font-weight:900;font-size:13px">GROUP ${GL[gi]}</span>
        <input value="${grp.name||''}" placeholder="조 이름" style="background:#fff3;border:1px solid #fff5;border-radius:6px;padding:3px 8px;font-size:12px;color:#fff;width:120px"
          onchange="proCompRenameGrp('${tn.id}',${gi},this.value)">
        <span style="margin-left:8px;font-size:11px;font-weight:900;opacity:.9">기록 반영</span>
        <select style="padding:4px 8px;border-radius:8px;border:1px solid #fff7;background:#0002;color:#fff;font-weight:900;font-size:11px"
          onchange="proCompSetGrpRecTarget('${tn.id}',${gi},this.value)">
          <option value="" ${!recTarget?'selected':''}>선택</option>
          <option value="pro" ${recTarget==='pro'?'selected':''}>프로리그</option>
          <option value="stage" ${recTarget==='stage'?'selected':''}>대진표 기록</option>
          <option value="none" ${recTarget==='none'?'selected':''}>반영안함</option>
        </select>
        ${recTarget==='stage'?`<select style="padding:4px 8px;border-radius:8px;border:1px solid #fff7;background:#0002;color:#fff;font-weight:900;font-size:11px"
          onchange="proCompSetGrpRecRound('${tn.id}',${gi},this.value)">
          ${_PC_STAGE_ROUNDS.map(r=>`<option value="${r}" ${recRound===r?'selected':''}>${r}</option>`).join('')}
        </select>`:''}
        <button class="btn btn-r btn-xs" style="margin-left:auto" onclick="proCompDelGrp('${tn.id}',${gi})">🗑️ 조 삭제</button>
      </div>
      <div style="padding:12px 16px;background:var(--white)">
        <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">선수 목록 (${(grp.players||[]).length}명)</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${(grp.players||[]).map((p,pi)=>`<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--surface);border-radius:20px;border:1px solid var(--border)">
            <span style="font-size:12px;font-weight:600">${p}</span>
            <button onclick="proCompRemovePlayer('${tn.id}',${gi},${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:12px;padding:0;line-height:1">×</button>
          </div>`).join('')}
          ${!(grp.players||[]).length?`<span style="color:var(--gray-l);font-size:12px">아직 선수가 없습니다</span>`:''}
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <input id="proAddP_${gi}" placeholder="선수 이름 검색" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);font-size:12px;width:160px"
            oninput="proCompSearchPlayerSug('${tn.id}',${gi})">
          <button class="btn btn-b btn-sm" onclick="proCompAddPlayerManual('${tn.id}',${gi})">+ 추가</button>
        </div>
        <div id="proSug_${gi}" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px"></div>
        <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px">
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">경기 목록 (${(grp.matches||[]).length}경기)</div>
          ${(grp.matches||[]).map((m,mi)=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--surface);border-radius:8px;margin-bottom:4px;font-size:12px">
            <span style="font-weight:600">${m.a||'?'}</span>
            <span style="color:var(--gray-l)">vs</span>
            <span style="font-weight:600">${m.b||'?'}</span>
            ${m.winner?`<span style="font-size:10px;background:#dcfce7;color:#16a34a;padding:1px 6px;border-radius:10px;font-weight:700">${m.winner==='A'?m.a:m.b} 승</span>`:'<span style="font-size:10px;color:var(--gray-l)">미완료</span>'}
            ${m.d?`<span style="font-size:11px;font-weight:600;color:var(--text3)">${m.d}</span>`:''}
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
    style="padding:4px 10px;border-radius:12px;border:1px solid var(--border);background:var(--white);font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px">
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
function proCompOpenBktMatchPaste(tnId, ri, mi) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const m = (tn.bracket||[])[ri]?.[mi];
  if (!m||!m.a||!m.b||m.a==='TBD'||m.b==='TBD') return alert('양 선수가 모두 확정된 경기에서만 이용 가능합니다.');

  const modal = document.createElement('div');
  modal.id = '_pcBktMatchPaste';
  modal.className = 'modal-compact-overlay';
  const defDate = m.d || new Date().toISOString().slice(0,10);
  modal.innerHTML = `<div class="modal-compact-box" style="width:400px">
    <div style="font-weight:900;font-size:15px;margin-bottom:6px">📋 결과 붙여넣기</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:8px;line-height:1.55">
      <b>${m.a}</b> vs <b>${m.b}</b><br>
      이 경기 결과만 저장합니다. 여러 줄 입력 가능<br>
      형식: <code>A [맵]</code> / <code>B [맵]</code> 또는 <code>승자이름 패자이름 [맵]</code>
    </div>
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);min-width:44px">날짜</div>
      <input id="_pcBktPasteDate" type="date" value="${defDate}" style="flex:1;padding:8px;border-radius:10px;border:1.5px solid var(--border);box-sizing:border-box">
    </div>
    <textarea id="_pcBktPasteText" rows="5" placeholder="A 투혼" style="width:100%;padding:10px;border-radius:12px;border:1.5px solid var(--border);font-size:13px;box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
    <div style="display:flex;gap:10px;margin-top:10px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveBktMatchPaste('${tnId}',${ri},${mi})">적용</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_pcBktMatchPaste').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  const ta = document.getElementById('_pcBktPasteText');
  if (ta) ta.focus();
}

function proCompSaveBktMatchPaste(tnId, ri, mi) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const m = (tn.bracket||[])[ri]?.[mi];
  if (!m||!m.a||!m.b) return;

  const text = (document.getElementById('_pcBktPasteText')||{}).value||'';
  if (!text.trim()) return;
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  if (!lines.length) return;

  const games = [];
  // TSV(날짜/승자/패자/맵/...) 지원 + 종족 접미사 제거 + 별명 매핑
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

  for (const line of lines) {
    // TSV(외부표) 입력이면: 날짜/승자/패자/맵...
    let raw = line;
    const cols = line.split('\t').map(x=>x.trim());
    if(cols.length>=4 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0]||'')){
      raw = `${cols[1]||''}\t${cols[2]||''}\t${cols[3]||''}`;
    }
    const parts = raw.split(/[\s\t]+/).filter(Boolean);
    if (!parts.length) continue;

    let wName = resolveAlias(parts[0] || '');
    const wTok = (wName||'').toUpperCase();
    let winner = '';
    let lName = '';
    let map = '';

    if (wTok === 'A' || wTok === 'B') {
      winner = wTok;
      map = parts.slice(1).join(' ').trim();
    } else {
      if (parts.length >= 2) {
        lName = resolveAlias(parts[1] || '');
        map = parts.slice(2).join(' ').trim();
      } else {
        map = parts.slice(1).join(' ').trim();
      }

      if (!wName) continue;
      // 입력이 별명/본명 등으로 들어와도 매칭되게: m.a/m.b도 정규화해서 비교
      const aN = resolveAlias(m.a);
      const bN = resolveAlias(m.b);
      const inMatch = (wName===aN || wName===bN || wName===m.a || wName===m.b);
      if (!inMatch) return alert(`"${wName}"은(는) 해당 경기 선수가 아닙니다.\n${m.a} vs ${m.b}`);

      winner = (wName === aN || wName === m.a) ? 'A' : 'B';
      const expectedLoser = winner === 'A' ? m.b : m.a;
      if (lName && lName !== resolveAlias(expectedLoser) && lName !== expectedLoser) return alert(`패자 이름이 일치하지 않습니다.\n입력: ${wName} ${lName}\n대상: ${m.a} vs ${m.b}`);
    }

    if (!winner) continue;
    if (typeof resolveMapName === 'function') map = resolveMapName(map);
    games.push({ winner, map });
  }

  if (!games.length) return alert('저장 가능한 경기가 없습니다.');
  const scoreA = games.filter(g => g.winner === 'A').length;
  const scoreB = games.filter(g => g.winner === 'B').length;
  if (scoreA === scoreB) return alert(`승패가 동률입니다.\nA:${scoreA} / B:${scoreB}\n한 줄 더 추가하거나 수동으로 승자를 지정하세요.`);

  const winner = scoreA > scoreB ? 'A' : 'B';

  const dateVal = (document.getElementById('_pcBktPasteDate')||{}).value || '';
  if (dateVal) m.d = dateVal;
  m._games = games.map(g => ({ winner: g.winner, map: g.map || '' }));
  const onlyOne = games.length === 1;
  if (onlyOne && games[0].map) m.map = games[0].map;
  else if (!onlyOne) m.map = '';

  const bktMatchId = `pbn_${tnId}_${ri}_${mi}`;
  if (m.winner) _revertProMatch(bktMatchId);
  m.winner = winner;

  const nextMi = Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1] && tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    const wSlot = winner==='A'?m.a:m.b;
    if (isA) next.a = wSlot; else next.b = wSlot;
  }

  const semiRi = tn.bracket.length - 2;
  if (tn.thirdPlace && ri === semiRi && tn.bracket.length >= 2 && (mi === 0 || mi === 1)) {
    const thirdKey = `pbn_${tnId}_3rd`;
    if (tn.thirdPlace.winner) _revertProMatch(thirdKey);
    tn.thirdPlace.winner = '';
    const loser = winner==='A'?m.b:m.a;
    if (mi === 0) tn.thirdPlace.a = loser||'TBD';
    else tn.thirdPlace.b = loser||'TBD';
  }

  _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
  const modal = document.getElementById('_pcBktMatchPaste');
  if (modal) modal.remove();
  save(); render();
}

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
    const matchList = confirmed.length ? `<br><span style="font-size:11px;color:#6b7280">진행 중인 경기: ${confirmed.join(' / ')}</span>` : '';
    hintEl.innerHTML = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">🏆 토너먼트 여러 경기 일괄 입력</span><br><span style="font-size:11px;color:#6b7280">형식: <code>승자이름 패자이름 [맵]</code> — 선수 이름으로 경기 자동 인식${matchList}</span></div>`;
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
      <span style="font-size:11px;color:#6b7280">가능하면 라운드별로 붙여넣기 해주세요 (예: 64강 버튼 → 64강 결과 붙여넣기). 여러 라운드가 섞이면 정확도가 떨어질 수 있습니다.</span>
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
  if (hintEl) hintEl.innerHTML=`<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">🏆 토너먼트 경기 결과 입력</span> — <b>${m.a}</b> vs <b>${m.b}</b><br><span style="font-size:11px;color:#6b7280">형식: <code>${m.a} ${m.b} [맵]</code> / <code>${m.b} ${m.a} [맵]</code> — 여러 줄 입력 가능</span></div>`;
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
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:22px;width:420px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:6px">📋 결과 붙여넣기 (3·4위전)</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:10px;line-height:1.6">
      <b>${tp.a}</b> vs <b>${tp.b}</b><br>
      이 경기 결과만 저장합니다. 여러 줄 입력 가능<br>
      형식: <code>A [맵]</code> / <code>B [맵]</code> 또는 <code>승자이름 패자이름 [맵]</code>
    </div>
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);min-width:44px">날짜</div>
      <input id="_pcThirdPasteDate" type="date" value="${defDate}" style="flex:1;padding:8px;border-radius:10px;border:1.5px solid var(--border);box-sizing:border-box">
    </div>
    <textarea id="_pcThirdPasteText" rows="5" placeholder="A 투혼" style="width:100%;padding:10px;border-radius:12px;border:1.5px solid var(--border);font-size:13px;box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
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
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:340px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:4px">대상 조 선택</div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:14px">${date} 경기 결과를 입력할 조를 선택하세요.</div>
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
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:420px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3);margin:auto">
    <div style="font-weight:900;font-size:15px;margin-bottom:12px">📝 경기 추가</div>
    <!-- 자동 인식 섹션 -->
    <div style="background:var(--surface);border:1.5px dashed var(--border2);border-radius:10px;padding:12px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:6px">⚡ 자동 인식</div>
      <textarea id="pcm_auto_txt" rows="3" placeholder="경기 결과 붙여넣기 (승자🆚패자, 승/패 형식 등)" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:12px;font-family:monospace;resize:vertical;box-sizing:border-box" oninput="proCompAutoPreview('${tnId}',${gi})"></textarea>
      <div style="display:flex;align-items:center;gap:6px;margin-top:5px">
        <span id="pcm_auto_badge" style="display:none;font-size:11px;padding:2px 8px;border-radius:8px;font-weight:700;border:1px solid transparent"></span>
        <button class="btn btn-w btn-sm" style="margin-left:auto" onclick="document.getElementById('pcm_auto_txt').value='';proCompAutoPreview('${tnId}',${gi})">지우기</button>
      </div>
      <div id="pcm_auto_preview" style="margin-top:6px"></div>
      <div id="pcm_auto_save" style="display:none;margin-top:8px">
        <button class="btn btn-b" style="width:100%" onclick="proCompAutoApply('${tnId}',${gi})">⚡ 자동 추가</button>
      </div>
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:10px;display:flex;align-items:center;gap:6px"><span style="flex:1;height:1px;background:var(--border)"></span>또는 직접 입력<span style="flex:1;height:1px;background:var(--border)"></span></div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">A 선수</label>
      <select id="pm_a" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
        <option value="">선수 선택</option>${pOpts}
      </select>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">B 선수</label>
      <select id="pm_b" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
        <option value="">선수 선택</option>${pOpts}
      </select>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">날짜</label>
      <input id="pm_d" type="date" value="${defDate}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">맵(선택)</label>
      <input id="pm_map" placeholder="선택입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">승자 (확정 경기만 선택)</label>
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
    previewEl.innerHTML = '<div style="font-size:11px;color:#dc2626;text-align:center;padding:8px">인식된 경기 없음</div>';
    return;
  }
  const allMaps = [...new Set([...maps.filter(m=>m&&m!=='-'), ...results.map(r=>r.map).filter(m=>m&&m!=='-')])].sort();
  const tId = JSON.stringify(tnId);
  const buildCell = (i, ok, ambig, player, rawName, cands, similar, role) => {
    if (ok) return `<button onclick="proCompPcPick(${i},${JSON.stringify(role)},${JSON.stringify(player.name)},${tId},${gi})" style="font-size:12px;font-weight:900;color:${role==='w'?'#1d4ed8':'#991b1b'};background:${role==='w'?'#dbeafe':'#fee2e2'};border:1.5px solid ${role==='w'?'#93c5fd':'#fca5a5'};border-radius:7px;padding:2px 8px;cursor:pointer;white-space:nowrap">${player.name}</button>`;
    if (ambig) return `<div><span style="color:#b45309;font-size:10px;font-weight:700">${rawName}</span><div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">${cands.map(c=>`<button onclick="proCompPcPick(${i},${JSON.stringify(role)},${JSON.stringify(c.name)},${tId},${gi})" style="padding:2px 6px;border-radius:4px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:10px;cursor:pointer">${c.name}</button>`).join('')}</div></div>`;
    return `<div><span style="color:#dc2626;font-size:11px;font-weight:700">${rawName||'?'}</span>${similar.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">${similar.map(c=>`<button onclick="proCompPcPick(${i},${JSON.stringify(role)},${JSON.stringify(c.name)},${tId},${gi})" style="padding:2px 6px;border-radius:4px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:10px;cursor:pointer">${c.name}</button>`).join('')}</div>`:''}</div>`;
  };
  let h = `<div style="overflow-x:auto;border-radius:8px;border:1px solid var(--border)"><table style="width:100%;border-collapse:collapse;font-size:11px">
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
    const flipBtn = `<button onclick="proCompPcFlip(${i},${tId},${gi})" title="승패 교체" style="padding:2px 5px;border-radius:4px;border:1px solid #ddd6fe;background:#f5f3ff;font-size:12px;cursor:pointer">⇄</button>`;
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
  let added = 0;
  savable.forEach(r => {
    const mid = 'pco_' + (Date.now()+added).toString(36) + Math.random().toString(36).slice(2,5);
    const mapVal = r.map && r.map !== '-' ? r.map : '';
    const dVal = (r._lineDate && /^\d{4}-\d{2}-\d{2}$/.test(r._lineDate)) ? r._lineDate : defDate;
    const aName = r.wPlayer.name, bName = r.lPlayer.name;
    const noteVal = r.note || '';
    const newObj = { a: aName, b: bName, winner: 'A', d: dVal, map: mapVal, note: noteVal, _id: mid };
    grp.matches.push(newObj);
    if (recTarget === 'pro') {
      applyGameResult(aName, bName, dVal, mapVal, mid, '', '', '프로리그대회');
    } else if (recTarget === 'stage') {
      _pcEnsureStageRecords(tn);
      const sid = `ptr_${tnId}_${recRound}_${mid}`;
      newObj._stageRecId = sid;
      newObj._stageRecRound = recRound;
      tn.stageRecords[recRound].push({a:aName,b:bName,winner:'A',d:dVal,map:mapVal,note:noteVal,_id:sid});
      applyGameResult(aName, bName, dVal, mapVal, sid, '', '', '프로리그대회');
    }
    added++;
  });
  save();
  document.getElementById('proMatchModal').remove();
  render();
  setTimeout(() => alert(`${added}건의 경기가 추가되었습니다.`), 100);
}

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
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:340px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:16px">?�️ 경기 결과 ?�력</div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">A ?�수</label>
      ${pList.length>=2
        ?`<select id="pm_a" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box"><option value="">?�수 ?�택</option>${pOptsA}</select>`
        :`<input id="pm_a" value="${m.a||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">`}
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">B ?�수</label>
      ${pList.length>=2
        ?`<select id="pm_b" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box"><option value="">?�수 ?�택</option>${pOptsB}</select>`
        :`<input id="pm_b" value="${m.b||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">`}
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">승자</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="pm_winA" class="btn ${m.winner==='A'?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winA').className='btn btn-b';document.getElementById('pm_winB').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">A 승</button>
        <button id="pm_winB" class="btn ${m.winner==='B'?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winB').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">B 승</button>
        <button id="pm_winNone" class="btn ${!m.winner?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winNone').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winB').className='btn btn-w'">미정</button>
      </div>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">날짜</label>
      <input id="pm_d" type="date" value="${m.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">맵</label>
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
    <div style="background:var(--white);border-radius:16px;padding:24px;width:400px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
      <div style="font-weight:900;font-size:16px;margin-bottom:8px">📋 대진표 결과 일괄 입력</div>
      <div style="font-size:12px;color:var(--gray-l);margin-bottom:16px;line-height:1.5">
        한 줄에 한 경기씩 입력하세요.<br>
        형식: <b>승자이름 패자이름 [맵이름]</b><br>
        <span style="color:var(--blue)">예) 홍길동 임꺽정 투혼</span>
      </div>
      <textarea id="_bktBatchText" style="width:100%;height:200px;padding:12px;border-radius:10px;border:1.5px solid var(--border);font-size:13px;margin-bottom:16px;box-sizing:border-box;resize:none" placeholder="여기에 복사해서 붙여넣으세요..."></textarea>
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

