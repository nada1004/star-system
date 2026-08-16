// competition-normal-matches.js에서 분리됨 (대회 일반경기 - 수정 모달)
function nmStartEdit(tnId, idx) {
  _nmBLDInit(tnId, idx);
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId);
  if (!tn) return;
  // 어디서 호출되든 항상 모달로 수정창 표시
  _nmOpenEditModal(tn, idx);
}

/* ── 일반경기 수정 모달 ── */
var _nmEditModalOpen = false;

function _nmOpenEditModal(tn, editIdx) {
  _nmEditModalOpen = true;
  window._nmEditTn = tn;

  const _old = document.getElementById('nmEditModal');
  if (_old) _old.remove();

  const ov = document.createElement('div');
  ov.id = 'nmEditModal';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:var(--z-modal-5,9999);display:flex;align-items:flex-start;justify-content:center;padding:20px 12px;overflow-y:auto';

  const box = document.createElement('div');
  box.style.cssText = 'background:var(--white,#fff);border-radius:var(--r2);width:100%;max-width:580px;box-shadow:0 10px 50px rgba(0,0,0,.35);overflow:hidden;margin:auto';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:10px;padding:16px 18px 14px;border-bottom:1px solid var(--border,#e5e7eb)';
  header.innerHTML = `<span style="font-size:var(--fs-md);font-weight:800;color:var(--text,#111);flex:1">✏️ 일반 경기 수정 <span style="font-size:var(--fs-caption);font-weight:600;color:var(--text2,#64748b)">${tn.name || ''}</span></span><button onclick="nmCloseEditModal()" style="background:none;border:none;cursor:pointer;font-size:var(--fs-lg);color:var(--gray-l,#94a3b8);padding:2px 6px;border-radius:6px;line-height:1" title="닫기">✕</button>`;

  const body = document.createElement('div');
  body.id = 'nmEditModalBody';
  body.style.cssText = 'padding:16px 18px 20px;max-height:80vh;overflow-y:auto';

  box.appendChild(header);
  box.appendChild(body);
  ov.appendChild(box);
  document.body.appendChild(ov);

  ov.addEventListener('click', function(e) { if (e.target === ov) nmCloseEditModal(); });

  _nmRenderEditModal(tn);
}

function _nmRenderEditModal(tn) {
  if (!_nmEditModalOpen) return;
  const body = document.getElementById('nmEditModalBody');
  if (!body) return;
  const tnId = tn.id;
  const bld = (_nmBLD && _nmBLD.tnId === tnId) ? _nmBLD : null;
  if (!bld) { nmCloseEditModal(); return; }

  const knownUnivs = [...new Set([
    ...(typeof univCfg !== 'undefined' ? univCfg.filter(u => u && !u.dissolved).map(u => u.name) : []),
    ...(tn.groups || []).flatMap(g => g.univs || [])
  ])].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ko'));

  const colA = bld.teamA ? (gc(bld.teamA) || '#2563eb') : '#6366f1';
  const colB = bld.teamB ? (gc(bld.teamB) || '#dc2626') : '#8b5cf6';

  const uOptA = `<option value="">— 팀 A 선택 —</option>` + knownUnivs.map(u => `<option value="${u}"${bld.teamA === u ? ' selected' : ''}>${u}</option>`).join('');
  const uOptB = `<option value="">— 팀 B 선택 —</option>` + knownUnivs.map(u => `<option value="${u}"${bld.teamB === u ? ' selected' : ''}>${u}</option>`).join('');

  const mA = bld.teamA ? (typeof getMembers === 'function' ? getMembers(bld.teamA) : []) : [];
  const mB = bld.teamB ? (typeof getMembers === 'function' ? getMembers(bld.teamB) : []) : [];
  const mapOpts = (typeof maps !== 'undefined' ? maps : []).map(mp => `<option value="${mp}">${mp}</option>`).join('');

  let fgA = 0, fgB = 0;
  (bld.freeGames || []).forEach(g => { if (g.winner === 'A') fgA++; else if (g.winner === 'B') fgB++; });

  let h = `<div style="background:var(--surface,#f8fafc);border:1px solid var(--border,#e5e7eb);border-radius:var(--r);padding:14px;margin-bottom:14px">
    <div style="font-size:var(--fs-caption);font-weight:800;color:var(--blue,#2563eb);margin-bottom:10px">① 날짜 &amp; 팀 선택</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2,#64748b)">날짜</label>
      <input type="date" value="${bld.date}" onchange="_nmBLD.date=this.value" style="padding:5px 8px;border:1px solid var(--border2,#cbd5e1);border-radius:6px;font-size:var(--fs-sm)">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2,#64748b);margin-left:8px">메모</label>
      <input type="text" placeholder="메모 (선택)" value="${bld.memo || ''}" oninput="_nmBLD.memo=this.value" style="flex:1;min-width:100px;padding:5px 8px;border:1px solid var(--border2,#cbd5e1);border-radius:6px;font-size:var(--fs-sm)">
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:130px">
        <div style="font-size:var(--fs-caption);font-weight:700;color:${colA};margin-bottom:4px">🔵 팀 A</div>
        <select onchange="_nmBLD.teamA=this.value;_nmBLD.freeGames=[];_nmRenderEditModal(window._nmEditTn)" style="width:100%;padding:5px 7px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">${uOptA}</select>
      </div>
      <div style="flex:1;min-width:130px">
        <div style="font-size:var(--fs-caption);font-weight:700;color:${colB};margin-bottom:4px">🔴 팀 B</div>
        <select onchange="_nmBLD.teamB=this.value;_nmBLD.freeGames=[];_nmRenderEditModal(window._nmEditTn)" style="width:100%;padding:5px 7px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">${uOptB}</select>
      </div>
    </div>
  </div>`;

  if (bld.teamA && bld.teamB) {
    const freeGames = bld.freeGames || [];
    h += `<div style="margin-bottom:10px;padding:10px 12px;border:1px solid rgba(99,102,241,.18);background:linear-gradient(135deg,rgba(238,242,255,.96),rgba(248,250,252,.98));border-radius:var(--r);font-size:var(--fs-caption);color:#0f172a;line-height:1.6">
      <strong style="color:#4338ca">2대2 수동 입력 가능</strong>
      <span style="color:#475569"> 각 경기의 </span>
      <span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:20px;padding:0 7px;border-radius:999px;background:#e0e7ff;color:#4338ca;font-size:10px;font-weight:900;vertical-align:middle">2:2</span>
      <span style="color:#475569"> 버튼을 누르면 </span>
      <strong>A1/A2 vs B1/B2</strong>
      <span style="color:#475569"> 형태로 입력됩니다.</span>
    </div>`;
    h += `<div style="background:var(--surface,#f8fafc);border:1px solid var(--border,#e5e7eb);border-radius:var(--r);padding:14px;margin-bottom:14px">
      <div style="font-size:var(--fs-caption);font-weight:800;color:var(--blue,#2563eb);margin-bottom:10px">② 경기 결과 입력</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px;justify-content:center">
        <span style="color:${colA}">${bld.teamA}</span>
        <span style="color:var(--blue,#2563eb)">${fgA}</span>
        <span style="color:var(--gray-l,#94a3b8)">:</span>
        <span style="color:var(--red,#dc2626)">${fgB}</span>
        <span style="color:${colB}">${bld.teamB}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;padding:10px 12px;background:rgba(99,102,241,.07);border-radius:8px;border:1px solid rgba(99,102,241,.2)">
        <span style="font-size:var(--fs-sm);font-weight:700;color:#6366f1">⚡ 간편 승수</span>
        <span style="font-size:var(--fs-sm)">${bld.teamA}:</span>
        <input type="number" min="0" max="99" value="${bld.directSA != null ? bld.directSA : ''}" style="width:55px;text-align:center;font-weight:700;font-size:14px;padding:4px;border:1px solid var(--border2);border-radius:6px" placeholder="0" oninput="_nmBLD.directSA=parseInt(this.value)||0">
        <span style="font-size:var(--fs-sm)">${bld.teamB}:</span>
        <input type="number" min="0" max="99" value="${bld.directSB != null ? bld.directSB : ''}" style="width:55px;text-align:center;font-weight:700;font-size:14px;padding:4px;border:1px solid var(--border2);border-radius:6px" placeholder="0" oninput="_nmBLD.directSB=parseInt(this.value)||0">
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">(선수 미지정 시)</span>
      </div>`;

    freeGames.forEach((g, gi) => {
      const optsA = mA.map(p => `<option value="${p.name}"${g.playerA === p.name ? ' selected' : ''}>${p.name} [${p.tier || '-'}/${p.race || '-'}]</option>`).join('');
      const optsB = mB.map(p => `<option value="${p.name}"${g.playerB === p.name ? ' selected' : ''}>${p.name} [${p.tier || '-'}/${p.race || '-'}]</option>`).join('');
      const _resA = g.winner === 'A' ? 'win' : (g.winner === 'B' ? 'lose' : '');
      const _resB = g.winner === 'B' ? 'win' : (g.winner === 'A' ? 'lose' : '');
      const _stA = univSelectStyle((mA.find(p => p.name === g.playerA) || {}).univ, _resA);
      const _stB = univSelectStyle((mB.find(p => p.name === g.playerB) || {}).univ, _resB);
      const _stA1 = univSelectStyle((mA.find(p => p.name === g.a1) || {}).univ, _resA);
      const _stA2 = univSelectStyle((mA.find(p => p.name === g.a2) || {}).univ, _resA);
      const _stB1 = univSelectStyle((mB.find(p => p.name === g.b1) || {}).univ, _resB);
      const _stB2 = univSelectStyle((mB.find(p => p.name === g.b2) || {}).univ, _resB);
      h += `<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:6px;padding:7px 10px;background:var(--white,#fff);border:1px solid var(--border,#e5e7eb);border-radius:8px">
        <span style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);min-width:38px">경기${gi + 1}</span>
        ${g._isTeam?`<button class="btn btn-xs btn-b" onclick="_nmBLD.freeGames[${gi}]._isTeam=false;_nmBLD.freeGames[${gi}].a1='';_nmBLD.freeGames[${gi}].a2='';_nmBLD.freeGames[${gi}].b1='';_nmBLD.freeGames[${gi}].b2='';_nmBLD.freeGames[${gi}].playerA='';_nmBLD.freeGames[${gi}].playerB='';_nmRenderEditModal(window._nmEditTn)" title="일반 1:1 입력으로 전환">2:2</button>`:''}
        ${g._isTeam
          ? `<select onchange="var g=_nmBLD.freeGames[${gi}];g._isTeam=true;g.a1=this.value;g.playerA=[g.a1,g.a2].filter(Boolean).join(',');_nmRenderEditModal(window._nmEditTn)" style="${_stA1};flex:1;min-width:72px;font-size:var(--fs-sm);padding:4px 6px;border:1px solid var(--border2);border-radius:6px"><option value="">A1</option>${mA.map(p => `<option value="${p.name}"${g.a1 === p.name ? ' selected' : ''}>${p.name} [${p.tier || '-'}/${p.race || '-'}]</option>`).join('')}</select>
             <select onchange="var g=_nmBLD.freeGames[${gi}];g._isTeam=true;g.a2=this.value;g.playerA=[g.a1,g.a2].filter(Boolean).join(',');_nmRenderEditModal(window._nmEditTn)" style="${_stA2};flex:1;min-width:72px;font-size:var(--fs-sm);padding:4px 6px;border:1px solid var(--border2);border-radius:6px"><option value="">A2</option>${mA.map(p => `<option value="${p.name}"${g.a2 === p.name ? ' selected' : ''}>${p.name} [${p.tier || '-'}/${p.race || '-'}]</option>`).join('')}</select>
             <span style="font-size:var(--fs-caption);color:var(--gray-l)">vs</span>
             <select onchange="var g=_nmBLD.freeGames[${gi}];g._isTeam=true;g.b1=this.value;g.playerB=[g.b1,g.b2].filter(Boolean).join(',');_nmRenderEditModal(window._nmEditTn)" style="${_stB1};flex:1;min-width:72px;font-size:var(--fs-sm);padding:4px 6px;border:1px solid var(--border2);border-radius:6px"><option value="">B1</option>${mB.map(p => `<option value="${p.name}"${g.b1 === p.name ? ' selected' : ''}>${p.name} [${p.tier || '-'}/${p.race || '-'}]</option>`).join('')}</select>
             <select onchange="var g=_nmBLD.freeGames[${gi}];g._isTeam=true;g.b2=this.value;g.playerB=[g.b1,g.b2].filter(Boolean).join(',');_nmRenderEditModal(window._nmEditTn)" style="${_stB2};flex:1;min-width:72px;font-size:var(--fs-sm);padding:4px 6px;border:1px solid var(--border2);border-radius:6px"><option value="">B2</option>${mB.map(p => `<option value="${p.name}"${g.b2 === p.name ? ' selected' : ''}>${p.name} [${p.tier || '-'}/${p.race || '-'}]</option>`).join('')}</select>`
          : `<select onchange="_nmBLD.freeGames[${gi}].playerA=this.value;_nmRenderEditModal(window._nmEditTn)" style="${_stA};flex:1;min-width:80px;font-size:var(--fs-sm);padding:4px 6px;border:1px solid var(--border2);border-radius:6px"><option value="">A 선택</option>${optsA}</select>
             <span style="font-size:var(--fs-caption);color:var(--gray-l)">vs</span>
             <select onchange="_nmBLD.freeGames[${gi}].playerB=this.value;_nmRenderEditModal(window._nmEditTn)" style="${_stB};flex:1;min-width:80px;font-size:var(--fs-sm);padding:4px 6px;border:1px solid var(--border2);border-radius:6px"><option value="">B 선택</option>${optsB}</select>`}
        <select onchange="_nmBLD.freeGames[${gi}].map=this.value" style="max-width:90px;font-size:var(--fs-sm);padding:4px 6px;border:1px solid var(--border2);border-radius:6px"><option value="">맵</option>${mapOpts}${g.map && !(typeof maps !== 'undefined' && maps.includes(g.map)) ? `<option value="${g.map}" selected>${g.map} (기록값)</option>` : ''}</select>
        <button class="win-btn ${g.winner === 'A' ? 'win-sel' : ''}" onclick="_nmBLD.freeGames[${gi}].winner='A';_nmRenderEditModal(window._nmEditTn)">A 승</button>
        <button class="win-btn ${g.winner === 'B' ? 'lose-sel' : ''}" onclick="_nmBLD.freeGames[${gi}].winner='B';_nmRenderEditModal(window._nmEditTn)">B 승</button>
        <button class="btn btn-r btn-xs" onclick="_nmBLD.freeGames.splice(${gi},1);_nmRenderEditModal(window._nmEditTn)">🗑️</button>
      </div>`;
    });

    h += `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
      <button class="btn btn-w btn-sm" onclick="_nmBLD.freeGames.push({playerA:'',playerB:'',winner:'',map:'',_isTeam:false,a1:'',a2:'',b1:'',b2:''});_nmRenderEditModal(window._nmEditTn)">+ 경기 추가</button>
      <button class="btn btn-b btn-sm" onclick="_nmBLD.freeGames.push({playerA:'',playerB:'',winner:'',map:'',_isTeam:true,a1:'',a2:'',b1:'',b2:''});_nmRenderEditModal(window._nmEditTn)">+ 2:2 경기 추가</button>
    </div>`;
    h += `</div>`;
  }

  h += `<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
    <button class="btn btn-w" onclick="nmCloseEditModal()">취소</button>
    <button class="btn btn-g" onclick="nmSaveFromBuilderModal()">✅ 수정 저장</button>
  </div>`;

  body.innerHTML = h;
}

function nmCloseEditModal() {
  _nmEditModalOpen = false;
  _nmBLD = null;
  window._nmEditTn = null;
  const el = document.getElementById('nmEditModal');
  if (el) el.remove();
}

function nmSaveFromBuilderModal() {
  nmSaveFromBuilder();
  _nmEditModalOpen = false;
  window._nmEditTn = null;
  const el = document.getElementById('nmEditModal');
  if (el) el.remove();
}

/* ── 빌더에서 저장 ── */
function nmSaveFromBuilder() {
  const bld = _nmBLD;
  if (!bld) return;
  const { tnId, editIdx } = bld;
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId);
  if (!tn) return;
  if (!tn.normalMatches) tn.normalMatches = [];

  if (!bld.teamA || !bld.teamB) { alert('팀 A와 팀 B를 모두 선택하세요.'); return; }
  if (bld.teamA === bld.teamB) { alert('같은 팀은 선택할 수 없습니다.'); return; }

  const freeGames = bld.freeGames || [];
  const date = bld.date || new Date().toISOString().slice(0, 10);

  // 점수 계산
  let gA = 0, gB = 0;
  if (bld.directSA != null || bld.directSB != null) {
    gA = bld.directSA || 0;
    gB = bld.directSB || 0;
  } else {
    freeGames.forEach(g => { if (g.winner === 'A') gA++; else if (g.winner === 'B') gB++; });
  }

  // sa/sb 불일치 경고 (자동인식 기존 sets가 있는 수정 시)
  if (editIdx >= 0 && tn.normalMatches[editIdx]) {
    const existing = tn.normalMatches[editIdx];
    const prevGamesCount = (existing.sets || []).reduce((sum, s) => sum + (s.games || []).length, 0);
    if (prevGamesCount > 0 && freeGames.length > 0 && (gA + gB) !== freeGames.filter(g => g.winner).length) {
      // 무시 - 승수만 체크
    }
  }

  // 기존 기록 삭제 처리 (수정 시)
  if (editIdx >= 0 && tn.normalMatches[editIdx]) {
    const old = tn.normalMatches[editIdx];
    if (old._id) {
      const oldMatchId = old._id;
      const oldGameIds = new Set();
      (old.sets || []).forEach((s, si) => (s.games || []).forEach((_, gi) => oldGameIds.add(`${oldMatchId}_s${si}_g${gi}`)));
      if (Array.isArray(typeof players !== 'undefined' ? players : [])) {
        players.forEach(p => {
          if (!Array.isArray(p.history)) return;
          p.history = p.history.filter(h => h.matchId !== oldMatchId && !oldGameIds.has(h.matchId));
        });
      }
    }
  }

  // 게임 ID 부여
  const matchId = (editIdx >= 0 && tn.normalMatches[editIdx]?._id) || (typeof genId === 'function' ? genId() : Date.now().toString(36));
  freeGames.forEach((g, gi) => { g._id = `${matchId}_s0_g${gi}`; });

  // 개인/팀전 전적 반영
  freeGames.forEach(g => {
    if (!g.playerA || !g.playerB || !g.winner) return;
    if (g._isTeam && typeof applyTeamGameResult === 'function') {
      const ta = [g.a1, g.a2].filter(Boolean);
      const tb = [g.b1, g.b2].filter(Boolean);
      applyTeamGameResult(ta, tb, g.winner, date, g.map || '', g._id, '대회', { sideUnivA: bld.teamA, sideUnivB: bld.teamB });
    } else {
      const wName = g.winner === 'A' ? g.playerA : g.playerB;
      const lName = g.winner === 'A' ? g.playerB : g.playerA;
      const univW = g.winner === 'A' ? bld.teamA : bld.teamB;
      const univL = g.winner === 'A' ? bld.teamB : bld.teamA;
      if (typeof applyGameResult === 'function') applyGameResult(wName, lName, date, g.map || '', g._id, univW, univL, '대회');
    }
  });

  const setsSnap = freeGames.length ? [{
    scoreA: gA, scoreB: gB,
    winner: gA > gB ? 'A' : gB > gA ? 'B' : '',
    label: '일반 경기',
    games: freeGames.map(g => ({ ...g, ...(g._isTeam ? { teamA: [g.a1, g.a2].filter(Boolean), teamB: [g.b1, g.b2].filter(Boolean) } : {}) }))
  }] : [];

  const newM = {
    _id: matchId,
    d: date,
    a: bld.teamA, b: bld.teamB,
    sa: gA, sb: gB,
    sets: setsSnap,
    memo: bld.memo || ''
  };

  if (editIdx >= 0) {
    tn.normalMatches[editIdx] = newM;
  } else {
    tn.normalMatches.unshift(newM);
  }

  _nmBLD = null;
  if (typeof save === 'function') save();
  if (typeof fixPoints === 'function') fixPoints();
  if (typeof render === 'function') render();
  try { if (typeof window.refreshPlayerModalIfOpen === 'function') window.refreshPlayerModalIfOpen(); } catch (e) { }

  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 20px;border-radius:20px;font-size:var(--fs-base);font-weight:700;z-index:var(--z-top);pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.3)';
  toast.textContent = `✅ 일반 경기 ${bld.teamA} ${gA}:${gB} ${bld.teamB} 저장!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

