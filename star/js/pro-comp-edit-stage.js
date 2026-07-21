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
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">날짜</div>
      <input id="_pcsr_d" type="date" value="${m.d||''}" style="padding:8px 10px;border:1px solid var(--border2);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">A</div>
      <input id="_pcsr_a" type="text" value="${(m.a||'').replace(/\"/g,'&quot;')}" placeholder="선수명" style="padding:8px 10px;border:1px solid var(--border2);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">B</div>
      <input id="_pcsr_b" type="text" value="${(m.b||'').replace(/\"/g,'&quot;')}" placeholder="선수명" style="padding:8px 10px;border:1px solid var(--border2);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">승자</div>
      <select id="_pcsr_w" style="padding:8px 10px;border:1px solid var(--border2);border-radius:var(--r);font-weight:900">
        <option value="" ${!m.winner?'selected':''}>미정</option>
        <option value="A" ${m.winner==='A'?'selected':''}>A 승</option>
        <option value="B" ${m.winner==='B'?'selected':''}>B 승</option>
      </select>
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">맵</div>
      <input id="_pcsr_map" type="text" value="${(m.map||'').replace(/\"/g,'&quot;')}" placeholder="맵(선택)" style="padding:8px 10px;border:1px solid var(--border2);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">참고</div>
      <input id="_pcsr_note" type="text" value="${(m.note||'').replace(/\"/g,'&quot;')}" placeholder="참고 메모(선택)" style="padding:8px 10px;border:1px solid var(--border2);border-radius:var(--r)">
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

window.openPcStageAddMenu = function(btnEl, tnId){
  try{
    const rounds = (typeof _PC_STAGE_ROUNDS !== 'undefined' && Array.isArray(_PC_STAGE_ROUNDS)) ? _PC_STAGE_ROUNDS : ['64강','32강','16강','8강','4강','결승'];
    const items = rounds.map(r => ({ t:`+ ${r} 추가`, on:()=>openPcStageRecModal(tnId, r, -1) }));
    if(window.HistoryActionUtils && typeof window.HistoryActionUtils.openSimpleActionMenu==='function'){
      window.HistoryActionUtils.openSimpleActionMenu(btnEl, items);
      return;
    }
    const pick = prompt(`라운드를 선택하세요:\n${rounds.map((r,i)=>`${i+1}. ${r}`).join('\n')}`, '3');
    const idx = parseInt(String(pick||''), 10);
    if(!idx || idx<1 || idx>rounds.length) return;
    openPcStageRecModal(tnId, rounds[idx-1], -1);
  }catch(e){}
};

window.openPcStagePasteMenu = function(btnEl, tnId){
  try{
    const rounds = (typeof _PC_STAGE_ROUNDS !== 'undefined' && Array.isArray(_PC_STAGE_ROUNDS)) ? _PC_STAGE_ROUNDS : ['64강','32강','16강','8강','4강','결승'];
    const items = [{ t:'📋 전체 라운드', on:()=>openPcStageBulkPasteModal(tnId, 'ALL') }]
      .concat(rounds.map(r => ({ t:`📋 ${r}`, on:()=>openPcStageBulkPasteModal(tnId, r) })));
    if(window.HistoryActionUtils && typeof window.HistoryActionUtils.openSimpleActionMenu==='function'){
      window.HistoryActionUtils.openSimpleActionMenu(btnEl, items);
      return;
    }
    const menu = ['전체 라운드', ...rounds];
    const pick = prompt(`붙여넣기 라운드를 선택하세요:\n${menu.map((r,i)=>`${i+1}. ${r}`).join('\n')}`, '1');
    const idx = parseInt(String(pick||''), 10);
    if(!idx || idx<1 || idx>menu.length) return;
    const sel = menu[idx-1];
    openPcStageBulkPasteModal(tnId, sel==='전체 라운드' ? 'ALL' : sel);
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
  const _extractRound0 = (s)=>{
    const m = String(s||'').match(/(64강|32강|16강|8강|4강|결승|준결승)/);
    if(!m) return '';
    const v = (m[1] === '준결승') ? '4강' : m[1];
    try{ return (typeof _pcNormalizeStageRound === 'function') ? _pcNormalizeStageRound(v) : v; }catch(e){ return v; }
  };
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
    let lineRound = _extractRound0(trimmed);
    let directTsv = null;
    try{
      const cols = trimmed.split('\t').map(x=>x.trim());
      if(cols.length >= 4 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0]||'')){
        lineDate = cols[0] || lineDate;
        const rawW = String(cols[1]||'').trim();
        const rawL = String(cols[2]||'').trim();
        const rawMap = String(cols[3]||'').trim() || '-';
        lineNote = cols.slice(4).filter(Boolean).join(' · ');
        if(!lineRound) lineRound = _extractRound0(lineNote);
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
            round: lineRound || '',
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

    if(!lineRound) lineRound = _extractRound0(lineForParse);
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
          round: lineRound || '',
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
      round: lineRound || '',
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
      note: r.note || '',
      round: String(r.round||'').trim()
    }));
}

function pcStageBulkPreview(tnId, round){
  const raw = (document.getElementById('_pcStageBulkText')?.value || '').trim();
  const badge = document.getElementById('_pcStageBulkBadge');
  const previewEl = document.getElementById('_pcStageBulkPreview');
  const saveBtn = document.getElementById('_pcStageBulkApplyBtn');
  const baseDate = (document.getElementById('_pcStageBulkDate')?.value || '').trim() || new Date().toISOString().slice(0,10);
  if(!previewEl) return;
  const isAll = String(round||'').toUpperCase() === 'ALL';
  if(!raw){
    previewEl.innerHTML = '';
    if(badge) badge.style.display = 'none';
    if(saveBtn) saveBtn.disabled = false;
    window._pcStageBulkResults = [];
    return;
  }
  const results = _pcStageBuildBulkResults(raw, baseDate);
  if(isAll){
    const defRound = String(document.getElementById('_pcStageBulkRoundDefault')?.value || '16강').trim() || '16강';
    results.forEach(r => { if(r && !String(r.round||'').trim()) r.round = defRound; });
  }
  const prev = window._pcStageBulkResults || [];
  if(prev && prev.length === results.length){
    results.forEach((r, i)=>{
      const p = prev[i];
      if(!p || p.wName !== r.wName || p.lName !== r.lName) return;
      if (p.wPlayer && !r.wPlayer) { r.wPlayer = p.wPlayer; r.wCandidates = p.wCandidates; r.wSimilar = p.wSimilar; }
      if (p.lPlayer && !r.lPlayer) { r.lPlayer = p.lPlayer; r.lCandidates = p.lCandidates; r.lSimilar = p.lSimilar; }
      if (p.map && p.map !== '-') r.map = p.map;
      if (String(p.round||'').trim() && !String(r.round||'').trim()) r.round = p.round;
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
  const isAll = String(round||'').toUpperCase() === 'ALL';
  const stageRounds = (typeof _PC_STAGE_ROUNDS !== 'undefined' && Array.isArray(_PC_STAGE_ROUNDS)) ? _PC_STAGE_ROUNDS : ['64강','32강','16강','8강','4강','결승'];
  const _isValidRound = (v)=> stageRounds.includes(String(v||'').trim());
  const savable = results.filter(r => r && r.wPlayer && r.lPlayer && (!isAll || _isValidRound(r.round)));
  const unresolved = results.filter(r => !(r && r.wPlayer && r.lPlayer) || (isAll && !_isValidRound(r.round)));
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
    previewEl.innerHTML = '<div style="margin-top:12px;padding:16px 14px;border-radius:12px;border:1px dashed var(--border2);background:var(--surface);font-size:var(--fs-sm);color:var(--gray-l);text-align:center;line-height:1.7">붙여넣기하면 여기에 자동인식 미리보기가 표시됩니다.<br><span style="font-size:var(--fs-caption)">선수 선택, 승패 뒤집기, 맵/날짜 수정 후 저장할 수 있습니다.</span></div>';
    return;
  }
  const allMaps = [...new Set([...maps.filter(m=>m&&m!=='-'), ...results.map(r=>r.map).filter(m=>m&&m!=='-')])].sort();
  const buildCell = (i, ok, ambig, player, rawName, cands, similar, role) => {
    if (ok) return `<button onclick="pcStageBulkPick(${i},${JSON.stringify(role)},${JSON.stringify(player.name)},${JSON.stringify(tnId)},${JSON.stringify(round)})" style="font-size:var(--fs-sm);font-weight:900;color:${role==='w'?'#1d4ed8':'#991b1b'};background:${role==='w'?'#dbeafe':'#fee2e2'};border:1.5px solid ${role==='w'?'#93c5fd':'#fca5a5'};border-radius:7px;padding:2px 8px;cursor:pointer;white-space:nowrap">${player.name}</button>`;
    if (ambig) return `<div><span style="color:#b45309;font-size:10px;font-weight:700">${rawName}</span><div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">${(cands||[]).map(c=>`<button onclick="pcStageBulkPick(${i},${JSON.stringify(role)},${JSON.stringify(c.name)},${JSON.stringify(tnId)},${JSON.stringify(round)})" style="padding:2px 6px;border-radius:4px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:10px;cursor:pointer">${c.name}</button>`).join('')}</div></div>`;
    return `<div><span style="color:#dc2626;font-size:var(--fs-caption);font-weight:700">${rawName||'?'}</span>${(similar||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">${similar.map(c=>`<button onclick="pcStageBulkPick(${i},${JSON.stringify(role)},${JSON.stringify(c.name)},${JSON.stringify(tnId)},${JSON.stringify(round)})" style="padding:2px 6px;border-radius:4px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:10px;cursor:pointer">${c.name}</button>`).join('')}</div>`:''}</div>`;
  };
  let h = `<div style="overflow-x:auto;border-radius:8px;border:1px solid var(--border);margin-top:8px"><table style="width:100%;border-collapse:collapse;font-size:var(--fs-caption)">
    <thead><tr style="background:var(--surface)">
      ${isAll?`<th style="padding:5px 6px;text-align:left;font-weight:700;color:var(--text3)">라운드</th>`:''}
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
    const rOk = !isAll || _isValidRound(r.round);
    const okAll = ok && rOk;
    const wCell = buildCell(i, wOk, wAmbig, r.wPlayer, r.wName, r.wCandidates, r.wSimilar, 'w');
    const lCell = buildCell(i, lOk, lAmbig, r.lPlayer, r.lName, r.lCandidates, r.lSimilar, 'l');
    const mapOpts = `<option value="-">-</option>` + allMaps.map(m=>`<option value="${m}" ${m===r.map?'selected':''}>${m}</option>`).join('') + `<option value="__c__">직접입력</option>`;
    const mapSel = `<select onchange="if(this.value==='__c__'){const v=prompt('맵 이름:');if(v){window._pcStageBulkResults[${i}].map=v;_renderPcStageBulkPreview(${JSON.stringify(tnId)},${JSON.stringify(round)})}}else{window._pcStageBulkResults[${i}].map=this.value}" style="width:75px;border:1px solid var(--border2);border-radius:5px;padding:2px 3px;font-size:10px">${mapOpts}</select>`;
    const dateInp = `<input type="date" value="${(r.d||'').replace(/"/g,'&quot;')}" onchange="window._pcStageBulkResults[${i}].d=this.value;_renderPcStageBulkPreview(${JSON.stringify(tnId)},${JSON.stringify(round)})" style="width:132px;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;font-size:10px">`;
    const noteCell = r.note
      ? `<div style="max-width:220px;font-size:10px;line-height:1.5;color:var(--gray-l);white-space:normal;word-break:break-word">${String(r.note).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`
      : `<span style="font-size:10px;color:#cbd5e1">-</span>`;
    const flipBtn = `<button onclick="pcStageBulkFlip(${i},${JSON.stringify(tnId)},${JSON.stringify(round)})" title="승패 교체" style="padding:2px 5px;border-radius:4px;border:1px solid #ddd6fe;background:#f5f3ff;font-size:var(--fs-sm);cursor:pointer">⇄</button>`;
    const status = okAll
      ? `<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:1px 4px;border-radius:6px">✓</span>`
      : (wAmbig||lAmbig)
        ? `<span style="background:#fef9c3;color:#b45309;border:1px solid #fcd34d;font-size:10px;font-weight:700;padding:1px 4px;border-radius:6px">?</span>`
        : `<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:1px 4px;border-radius:6px">✗</span>`;
    const roundSel = isAll
      ? (() => {
          const cur = String(r.round||'').trim();
          const opts = stageRounds.map(rr => `<option value="${rr}" ${rr===cur?'selected':''}>${rr}</option>`).join('');
          return `<select onchange="window._pcStageBulkResults[${i}].round=this.value;_renderPcStageBulkPreview(${JSON.stringify(tnId)},${JSON.stringify(round)})" style="width:70px;border:1px solid var(--border2);border-radius:5px;padding:2px 3px;font-size:10px;font-weight:800">${opts}</select>`;
        })()
      : '';
    h += `<tr style="background:${okAll?'#f8faff':(wAmbig||lAmbig)?'#fffbeb':'#fff8f8'};border-bottom:1px solid #f0f0f0">
      ${isAll?`<td style="padding:5px 5px">${roundSel}</td>`:''}
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
  const isAll = String(round||'').toUpperCase() === 'ALL';
  const r = isAll ? 'ALL' : _pcNormalizeStageRound(round);
  const today = new Date().toISOString().slice(0,10);
  const modal=document.createElement('div');
  modal.id='_pcStageBulkPaste';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  const stageRounds = (typeof _PC_STAGE_ROUNDS !== 'undefined' && Array.isArray(_PC_STAGE_ROUNDS)) ? _PC_STAGE_ROUNDS : ['64강','32강','16강','8강','4강','결승'];
  const roundDefaultSel = isAll
    ? `<label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">🏷️ 기본 라운드</label>
      <select id="_pcStageBulkRoundDefault" onchange="pcStageBulkPreview('${tnId}','${r}')" style="border:1px solid var(--border2);border-radius:7px;padding:5px 10px;font-size:var(--fs-base);font-weight:800">
        ${stageRounds.map(rr=>`<option value="${rr}" ${rr==='16강'?'selected':''}>${rr}</option>`).join('')}
      </select>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">줄에 라운드(예: 64강)가 없으면 이 값으로 저장됩니다.</div>`
    : '';
  modal.innerHTML=`<div class="umbox" style="width:780px;max-width:97vw;max-height:92vh;overflow:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div class="mtitle" style="margin-bottom:0">🏅 프로리그 대회 ${isAll?'전체 라운드':r} 경기 결과 붙여넣기</div>
      <div style="display:flex;gap:6px;align-items:center">
        <span id="_pcStageBulkBadge" style="display:none;font-size:var(--fs-sm);font-weight:700;padding:3px 10px;border-radius:20px;background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0"></span>
        <button class="btn btn-w btn-sm" onclick="document.getElementById('_pcStageBulkPaste')?.remove()">✕ 닫기</button>
      </div>
    </div>
    <details style="margin-bottom:12px">
      <summary style="font-size:var(--fs-sm);font-weight:700;color:#7c3aed;cursor:pointer;padding:6px 10px;background:#f5f3ff;border-radius:8px;border:1px solid #ddd6fe;list-style:none;display:flex;align-items:center;gap:5px">📌 사용법 보기</summary>
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:0 0 8px 8px;padding:10px 14px;font-size:var(--fs-sm);color:#5b21b6;line-height:1.9;margin-top:-1px">
        형식 A: <span style="font-family:monospace;background:#ede9fe;padding:1px 6px;border-radius:4px">승자이름 패자이름 [맵]</span><br>
        형식 B: <span style="font-family:monospace;background:#ede9fe;padding:1px 6px;border-radius:4px">[맵] 홍길동T (승) vs (패) 이순신Z</span><br>
        형식 C: <span style="font-family:monospace;background:#ede9fe;padding:1px 6px;border-radius:4px">2026-05-02[TAB]승자[TAB]패자[TAB]맵</span><br>
        ${isAll?`<div style="margin-top:6px;font-size:var(--fs-caption);color:#6d28d9">💡 한 번에 여러 라운드를 넣으려면 줄에 라운드를 포함하세요. 예: <span style="font-family:monospace;background:#ede9fe;padding:1px 6px;border-radius:4px">64강 홍길동 임꺽정 투혼</span> / <span style="font-family:monospace;background:#ede9fe;padding:1px 6px;border-radius:4px">결승 홍길동 이순신 투혼</span></div>`:''}
        <span style="color:#7c3aed;font-size:var(--fs-caption)">💡 일반 경기 결과 자동인식과 같은 방식으로 선수/맵을 인식하고, 애매하면 아래 미리보기에서 직접 선택할 수 있습니다.</span>
      </div>
    </details>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">📅 기본 날짜</label>
      <input type="date" id="_pcStageBulkDate" value="${today}" onchange="pcStageBulkPreview('${tnId}','${r}')" style="border:1px solid var(--border2);border-radius:7px;padding:5px 10px;font-size:var(--fs-base)">
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">줄마다 날짜가 없으면 이 날짜로 저장됩니다.</div>
      ${roundDefaultSel}
    </div>
    <div style="position:relative">
      <textarea id="_pcStageBulkText" oninput="pcStageBulkPreview('${tnId}','${r}')" style="width:100%;min-height:160px;font-size:var(--fs-base);border:1.5px solid #ddd6fe;border-radius:var(--r);padding:12px 36px 12px 12px;resize:vertical;font-family:'Noto Sans KR',monospace;line-height:1.8;box-sizing:border-box" placeholder="예)&#10;[실피드] 홍길동T (승) vs (패) 임꺽정Z&#10;또는&#10;홍길동 임꺽정 투혼&#10;또는&#10;2026-05-02\t홍길동\t임꺽정\t투혼"></textarea>
      <button onclick="document.getElementById('_pcStageBulkText').value='';pcStageBulkPreview('${tnId}','${r}')"
        title="입력 지우기"
        style="position:absolute;top:8px;right:8px;background:var(--border2);border:none;border-radius:5px;width:22px;height:22px;font-size:var(--fs-base);line-height:1;cursor:pointer;color:var(--text3);display:flex;align-items:center;justify-content:center;transition:.15s;"
        onmouseover="this.style.background='#dc2626';this.style.color='#fff'"
        onmouseout="this.style.background='var(--border2)';this.style.color='var(--text3)'">✕</button>
    </div>
    <div id="_pcStageBulkPreview"></div>
    <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;align-items:center">
      <span id="_pcStageBulkWarn" style="display:none;font-size:var(--fs-caption);color:#b45309;font-weight:600">⚠️ 선택 필요한 항목이 있습니다</span>
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
  const isAll = String(round||'').toUpperCase() === 'ALL';
  const stageRounds = (typeof _PC_STAGE_ROUNDS !== 'undefined' && Array.isArray(_PC_STAGE_ROUNDS)) ? _PC_STAGE_ROUNDS : ['64강','32강','16강','8강','4강','결승'];
  const _normRound = (v)=>{
    const s = String(v||'').trim();
    if(stageRounds.includes(s)) return s;
    try{
      const n = (typeof _pcNormalizeStageRound === 'function') ? _pcNormalizeStageRound(s) : s;
      return stageRounds.includes(n) ? n : '';
    }catch(e){ return ''; }
  };
  const r = isAll ? '' : _pcNormalizeStageRound(round);
  const text=(document.getElementById('_pcStageBulkText')?.value||'').trim();
  if(!text) return;
  const d = (document.getElementById('_pcStageBulkDate')?.value || '').trim() || new Date().toISOString().slice(0,10);
  const defRound = isAll ? _normRound(document.getElementById('_pcStageBulkRoundDefault')?.value || '16강') : '';
  const previewList = Array.isArray(window._pcStageBulkResults) ? window._pcStageBulkResults : [];
  const entries = (previewList.length ? previewList.filter(x=>x && x.wPlayer && x.lPlayer).map(x=>({
    d: x.d || d,
    wName: x.wPlayer.name,
    lName: x.lPlayer.name,
    map: x.map || '-',
    note: x.note || '',
    round: String(x.round||'').trim()
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
    const rr = isAll ? (_normRound(entry.round) || defRound) : r;
    if(isAll && !rr) return;
    const a=wName, b=lName, winner='A';
    const mid=`ptr_${tnId}_${rr}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;
    tn.stageRecords[rr].push({a,b,winner,d:recDate,map,note,_id:mid});
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
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">
      32강 대회에서 일부 선수가 16강/8강부터 합류하는 케이스를 지원합니다. <b>적용</b>을 누르면 “시작 라운드가 첫 라운드가 아닌 선수”는 해당 라운드의 빈 슬롯에 자동 배치됩니다.<br>
      <span style="font-size:var(--fs-caption)">※ 정확한 위치 재배치는 각 경기의 <b>✏️ 경기수정</b>에서 선수(A/B)를 바꾸면 됩니다.</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${cand.map(name=>{
        const cur = parseInt(tn.seedStarts[name]||firstSize,10)||firstSize;
        return `<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;background:var(--surface)">
          <div style="font-weight:900;font-size:var(--fs-sm);min-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          <select data-seed-player="${name.replace(/\"/g,'&quot;')}" style="flex:1;padding:6px 10px;border-radius:var(--r);border:1px solid var(--border2);font-weight:800;font-size:var(--fs-sm)">
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
