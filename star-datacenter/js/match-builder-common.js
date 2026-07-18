/* ══════════════════════════════════════
   Match Builder Common Helpers
══════════════════════════════════════ */

function _matchPlayerPoolHTML(side, type) {
  const pList = players.filter(p => p.name).sort((a,b) => a.name.localeCompare(b.name));
  const poolId = `pool_${type}_${side}`;
  const searchId = `search_${type}_${side}`;
  return `
    <div style="margin-top:10px;border:1px solid var(--border);border-radius:var(--r);background:var(--white);overflow:hidden">
      <div style="padding:8px 12px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">
        <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">스트리머 선택</span>
        <input type="text" id="${searchId}" placeholder="이름 검색..." 
          oninput="_matchFilterPool('${searchId}', '${poolId}')" 
          style="flex:1;padding:4px 10px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-caption)">
      </div>
      <div id="${poolId}" style="padding:8px;max-height:160px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:4px">
        ${pList.map(p => `
          <button class="p-sel-btn" data-name="${p.name}" onclick="_matchSelectPlayer('${p.name.replace(/'/g, "\\'")}', '${side}', '${type}')"
            style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:12px;border:1px solid var(--border);background:var(--white);font-size:var(--fs-caption);cursor:pointer">
            <span style="font-weight:700">${p.name}</span>
            <span style="font-size:9px;color:var(--gray-l)">${p.univ||''}</span>
          </button>`).join('')}
      </div>
    </div>`;
}

function _matchFilterPool(searchId, poolId) {
  const q0 = document.getElementById(searchId).value.trim();
  const q = _mbResolveAliasQuery(q0) || q0;
  const pool = document.getElementById(poolId);
  if (!pool) return;
  pool.querySelectorAll('.p-sel-btn').forEach(btn => {
    const nm = btn.getAttribute('data-name')||'';
    btn.style.display = q === '' || nm.includes(q) ? '' : 'none';
  });
}

function _matchSelectPlayer(name, side, type) {
  if (type === 'ind') {
    if (side === 'A') _indInput.playerA = name; else _indInput.playerB = name;
    _indInput.games = [];
  } else if (type === 'gj') {
    if (side === 'A') _gjInput.playerA = name; else _gjInput.playerB = name;
    _gjInput.games = [];
  } else if (type === 'pcgj') {
    if (side === 'A') _pcgjA = name; else _pcgjB = name;
    _pcgjGames = [];
  }
  render();
}

function _matchPlayerAssignPoolHTML(type) {
  const pList = players.filter(p => p.name).sort((a,b) => a.name.localeCompare(b.name));
  const poolId = `pool_${type}_AB`;
  const searchId = `search_${type}_AB`;
  const st = type==='ind'
    ? {a:_indInput.playerA||'', b:_indInput.playerB||''}
    : type==='gj'
      ? {a:_gjInput.playerA||'', b:_gjInput.playerB||''}
      : {a:'', b:''};

  return `
    <div style="margin-top:10px;border:1px solid var(--border);border-radius:var(--r);background:var(--white);overflow:hidden">
      <div style="padding:8px 12px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">
        <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">스트리머 클릭 → A/B 배정</span>
        <input type="text" id="${searchId}" placeholder="이름·대학·티어 검색..." 
          oninput="_matchFilterAssignPool('${searchId}', '${poolId}')" 
          style="flex:1;padding:4px 10px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-caption)">
      </div>
      <div id="${poolId}" style="padding:8px;max-height:200px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:6px">
        ${pList.map(p => {
          const inA = st.a===p.name;
          const inB = st.b===p.name;
          const bg = inA ? '#2563eb' : inB ? '#dc2626' : gc(p.univ);
          const dim = (inA||inB) ? 'opacity:.6' : '';
          const info = `${p.univ||''}${p.tier?`/${p.tier}`:''}`;
          return `
            <span class="p-ab-row" data-q="${(p.name+' '+(p.univ||'')+' '+(p.tier||'')).toLowerCase()}"
              style="display:inline-flex;align-items:center;gap:6px;background:${bg};color:#fff;padding:4px 8px;border-radius:8px;font-size:var(--fs-caption);${dim}">
              <span style="font-weight:800">${p.name}</span>
              ${info?`<span style="opacity:.85;font-size:10px">${info}</span>`:''}
              <button onclick="_matchSelectPlayer('${p.name.replace(/'/g, "\\'")}', 'A', '${type}')"
                style="background:rgba(255,255,255,.92);color:#2563eb;border:none;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:900;cursor:pointer">A</button>
              <button onclick="_matchSelectPlayer('${p.name.replace(/'/g, "\\'")}', 'B', '${type}')"
                style="background:rgba(255,255,255,.92);color:#dc2626;border:none;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:900;cursor:pointer">B</button>
              ${(inA||inB)?`<span style="background:rgba(255,255,255,.28);border-radius:4px;padding:1px 5px;font-size:9px;font-weight:900">${inA?'A':''}${inB?'B':''}선택</span>`:''}
            </span>`;
        }).join('')}
      </div>
    </div>`;
}

function _matchFilterAssignPool(searchId, poolId) {
  const q0 = (document.getElementById(searchId)?.value||'').trim();
  const q = (_mbResolveAliasQuery(q0) || q0).toLowerCase();
  const pool = document.getElementById(poolId);
  if (!pool) return;
  pool.querySelectorAll('.p-ab-row').forEach(el => {
    const hay = el.getAttribute('data-q')||'';
    el.style.display = q==='' || hay.includes(q) ? '' : 'none';
  });
}

function _mbResolveAliasQuery(q){
  const s = String(q||'').trim();
  if(!s) return '';
  try{
    const amap = JSON.parse(localStorage.getItem('su_player_alias_map')||'{}')||{};
    const nfc = t => (t||'').normalize ? (t||'').normalize('NFC') : (t||'');
    const norm = t => nfc(String(t||'')).replace(/\s+/g,'').toLowerCase();
    const q1 = norm(s);
    const q2 = norm(s.replace(/\s*[TZPNtzpn]$/i,'')); 
    for(const k in amap){
      const nk = norm(k);
      if(!nk) continue;
      if(nk===q1 || nk===q2){
        const v = String(amap[k]||'').trim();
        return v || '';
      }
    }
  }catch(e){}
  return '';
}

function _buildMatchSubtabShell(currentSub, subOpts, filterStateKey, extraHTML, modeId){
  const _enableSubFilter = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  const _lockOpen = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
  if(window[filterStateKey]===undefined) window[filterStateKey]=_lockOpen;
  if(_lockOpen) window[filterStateKey]=true;
  // 모드별 색상 주입 (id가 없는 opts의 경우 modeId 색상으로 통일)
  if(modeId && typeof _getTabPillOnStyle==='function'){
    const _modeStyle = _getTabPillOnStyle(modeId, true);
    if(_modeStyle) subOpts = subOpts.map(o=>o.color?o:{...o, color:_modeStyle});
  }
  let h='';
  if(_enableSubFilter && !_lockOpen){
    h+=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
      <button class="pill ${window[filterStateKey]?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window['${filterStateKey}']=!window['${filterStateKey}'];render()">🔍 필터 ${window[filterStateKey]?'▲':'▼'}</button>
    </div>`;
  }
  if(!_enableSubFilter || window[filterStateKey]){
    h+=typeof stabsInline==='function' ? stabsInline(currentSub, subOpts, extraHTML||'') : stabs(currentSub, subOpts) + (extraHTML?`<div>${extraHTML}</div>`:'');
  }
  return h;
}

function _mbActionBar(buttons, hint){
  return `<div class="mb-actions">${(buttons||[]).filter(Boolean).join('')}${hint?`<span class="mb-hint">${hint}</span>`:''}</div>`;
}

function _mbSectionCard(title, body, muted){
  return `<div class="mb-card"><div class="mb-card-title">${title}${muted?` <span class="muted">${muted}</span>`:''}</div>${body}</div>`;
}

function _mbFrame(title, actionHTML, bodyHTML, subHTML){
  return `<div class="match-builder match-builder--refined">
    <div class="match-builder-head">
      <div>
        <div class="match-builder-title">${title}</div>
        ${subHTML?`<div class="match-builder-sub">${subHTML}</div>`:''}
      </div>
      ${actionHTML||''}
    </div>
    ${bodyHTML||''}
  </div>`;
}
