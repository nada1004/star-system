/* ── 대회 > 일반 경기 탭 ──────────────────────────────────────────
   tn.normalMatches = [{_id, d, a, b, sa, sb, sets, memo, caster}]
   - 조별리그와 무관한 단순 스코어 경기를 대회 단위로 기록
   - 미니대전 스타일 인라인 빌더 방식으로 입력
────────────────────────────────────────────────────────────────── */

/* ── 인라인 빌더 상태 ── */
var _nmBLD = null;  // 현재 입력 중인 경기 데이터
// {tnId, editIdx, date, teamA, teamB, freeGames:[], memo, _dirty}

function _nmBLDInit(tnId, editIdx) {
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId);
  if (!tn) return;
  const today = new Date().toISOString().slice(0, 10);
  if (editIdx >= 0 && tn.normalMatches && tn.normalMatches[editIdx]) {
    const m = tn.normalMatches[editIdx];
    // 기존 경기 수정: sets.games에서 freeGames 복원
    const freeGames = [];
    (m.sets || []).forEach(s => {
      (s.games || []).forEach(g => {
        freeGames.push({
          _id: g._id || '',
          playerA: g.playerA || '',
          playerB: g.playerB || '',
          winner: g.winner || '',
          map: g.map || '',
          _isTeam: !!g._isTeam,
          a1: g.a1 || '', a2: g.a2 || '',
          b1: g.b1 || '', b2: g.b2 || ''
        });
      });
    });
    _nmBLD = { tnId, editIdx, date: m.d || today, teamA: m.a || '', teamB: m.b || '', freeGames, memo: m.memo || '', _dirty: false };
  } else {
    _nmBLD = { tnId, editIdx: -1, date: today, teamA: '', teamB: '', freeGames: [], memo: '', _dirty: false };
  }
}

/* ── 일반 경기 목록 + 인라인 빌더 렌더 ── */
function rCompNormalMatches(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const nm = tn.normalMatches || [];
  let h = '';

  // ── 인라인 빌더 (로그인 시) ──
  if (isLoggedIn) {
    h += _nmBuilderHTML(tn);
  }

  // ── 경기 목록 헤더 ──
  if (nm.length) {
    h += `<div style="margin-top:${isLoggedIn?'18px':'0'};margin-bottom:6px;display:flex;align-items:center;gap:8px">
      <span style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">📋 경기 목록</span>
      <span style="font-size:var(--fs-sm);color:var(--gray-l)">총 ${nm.length}경기</span>
    </div>`;
  }

  if (!nm.length && !isLoggedIn) {
    return h + `<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:40px;margin-bottom:12px">🎮</div>
      <div style="font-size:var(--fs-md);font-weight:700;margin-bottom:8px">일반 경기 기록이 없습니다</div>
      <div style="color:var(--gray-l)">조별리그와 관계없는 단순 경기를 기록할 수 있습니다</div>
    </div>`;
  }

  if (!nm.length) return h;

  // 날짜별 그룹화
  const sorted = [...nm].map((m, i) => ({ m, i })).sort((a, b) => (b.m.d || '').localeCompare(a.m.d || ''));
  const byDate = {};
  sorted.forEach(({ m, i }) => {
    const dk = m.d || '날짜 미정';
    if (!byDate[dk]) byDate[dk] = [];
    byDate[dk].push({ m, i });
  });

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])).forEach(([dk, items]) => {
    let dateLabel = dk;
    if (dk !== '날짜 미정') {
      const dt = new Date(dk + 'T00:00:00');
      dateLabel = `${dt.getFullYear()}년 ${dt.getMonth() + 1}월 ${dt.getDate()}일 (${days[dt.getDay()]})`;
    }
    h += `<div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base);color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #6366f1;border-radius:0 8px 8px 0">📅 ${dateLabel}</div>
      </div>`;

    items.forEach(({ m, i }) => {
      const a = m.a || '', b = m.b || '';
      const ca = gc(a), cb = gc(b);
      const isDone = m.sa != null && m.sb != null;
      const aWin = isDone && Number(m.sa) > Number(m.sb), bWin = isDone && Number(m.sb) > Number(m.sa);
      const _winRgb = (c) => { const s = String(c || '').replace('#', ''); if (s.length === 6) { const r = parseInt(s.slice(0, 2), 16), g = parseInt(s.slice(2, 4), 16), bv = parseInt(s.slice(4, 6), 16); if (![r, g, bv].some(isNaN)) return r + ',' + g + ',' + bv; } return '100,116,139'; };
      const winRgb = aWin ? _winRgb(ca) : bWin ? _winRgb(cb) : '100,116,139';
      const _fxCfg = (typeof _getRecSideFxCfg === 'function') ? _getRecSideFxCfg() : { on: true, mode: 'soft', intensity: 68, length: 25 };
      const _fxOn = !!_fxCfg.on;
      const _fxMetrics = (typeof _buildRecSideFxMetrics === 'function') ? _buildRecSideFxMetrics(_fxCfg) : null;
      const _fxMode = _fxMetrics ? _fxMetrics.mode : 'soft';
      const _fxVars = (_fxOn && typeof _recSideFxVarStyle === 'function') ? _recSideFxVarStyle(ca || '#6366f1', cb || '#8b5cf6', _fxCfg) : '';
      const _hexRgb = (hx) => { const s = String(hx || '').replace('#', ''); if (s.length === 6) { const r = parseInt(s.slice(0, 2), 16), g = parseInt(s.slice(2, 4), 16), bv = parseInt(s.slice(4, 6), 16); if (![r, g, bv].some(isNaN)) return r + ',' + g + ',' + bv; } return '100,116,139'; };
      const _sideRgbVars = `--rec-side-left-rgb:${_hexRgb(ca || '#6366f1')};--rec-side-right-rgb:${_hexRgb(cb || '#8b5cf6')};`;

      const aMemSet = new Set(), bMemSet = new Set();
      (m.sets || []).forEach(s => (s.games || []).forEach(g => { if (g.playerA) aMemSet.add(g.playerA); if (g.playerB) bMemSet.add(g.playerB); }));
      const aMembers = [...aMemSet].map(n => ({ name: n }));
      const bMembers = [...bMemSet].map(n => ({ name: n }));
      const aMemJson = JSON.stringify(aMembers).replace(/"/g, "'");
      const bMemJson = JSON.stringify(bMembers).replace(/"/g, "'");

      const _sideAB = { a: aMembers, b: bMembers };
      const _sideM = { ...m, a, b, teamAMembers: aMembers, teamBMembers: bMembers };
      const _compSide = (typeof window._buildCompSidePanel === 'function')
        ? window._buildCompSidePanel(a, b, aWin, bWin, ca, cb, _sideM)
        : (typeof window._buildRecSideProfilePanel === 'function')
          ? window._buildRecSideProfilePanel(_sideM, _sideAB, aWin, bWin, ca, cb)
          : { left: '', right: '' };

      const _univIconA = (() => { const url = a ? (typeof UNIV_ICONS !== 'undefined' ? UNIV_ICONS[a] : '') : ''; const cfg = (typeof univCfg !== 'undefined' ? univCfg : []).find(x => x.name === a) || {}; const u = url || (cfg.icon || ''); return u ? `<img src="${typeof toHttpsUrl === 'function' ? toHttpsUrl(u) : u}" style="width:22px;height:22px;object-fit:contain;border-radius:var(--r);flex-shrink:0" onerror="this.style.display='none'">` : ''; })();
      const _univIconB = (() => { const url = b ? (typeof UNIV_ICONS !== 'undefined' ? UNIV_ICONS[b] : '') : ''; const cfg = (typeof univCfg !== 'undefined' ? univCfg : []).find(x => x.name === b) || {}; const u = url || (cfg.icon || ''); return u ? `<img src="${typeof toHttpsUrl === 'function' ? toHttpsUrl(u) : u}" style="width:22px;height:22px;object-fit:contain;border-radius:var(--r);flex-shrink:0" onerror="this.style.display='none'">` : ''; })();

      const _adm = (localStorage.getItem('su_share_admin_only') || '0') === '1';
      const okShare = (!_adm || isLoggedIn) && isDone;

      // 현재 편집중인 경기인지 확인
      const isEditing = isLoggedIn && _nmBLD && _nmBLD.tnId === tn.id && _nmBLD.editIdx === i;

      const _nmActions = [
        isLoggedIn ? { t: isEditing ? '✏️ 편집중' : '✏️ 수정', d: '경기 수정', kind: 'normal', on: () => nmStartEdit(tn.id, i) } : null,
        okShare ? { t: '🎴 공유카드', d: '공유용 카드 생성', kind: 'accent', on: () => nmOpenShareCard(tn.id, i) } : null,
        isLoggedIn && !isSubAdmin ? { t: '🗑️ 삭제', d: '경기 삭제', kind: 'danger', on: () => nmDelMatch(tn.id, i) } : null
      ].filter(Boolean);
      const _nmMenu = (_nmActions.length && typeof _compActionMenuHTML === 'function') ? _compActionMenuHTML(_nmActions) : '';

      h += `<div class="grp-match-wrap" style="margin-bottom:8px">
        <div class="grp-card-meta-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
          <span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:99px">🎮 일반 경기</span>
          <span class="grp-meta-spacer" style="flex:1"></span>
          ${_nmMenu ? `<span class="grp-meta-menu">${_nmMenu}</span>` : ''}
        </div>
        <div class="grp-match-card match-card-v3 tc-card${_fxOn ? ' grp-sidefx grp-sidefx--' + _fxMode : ''}${(_compSide.left || _compSide.right) ? ' has-side-panels' : ''}" style="--tc-win-rgb:${winRgb};${_sideRgbVars}${_fxVars}background:var(--white);margin-bottom:0;border:1px solid var(--border);border-left:4px solid ${_fxOn ? (ca || '#6366f1') : '#6366f1'};${_fxOn ? `border-right:4px solid ${cb || '#8b5cf6'};` : ''}${isDone ? 'cursor:pointer' : ''}" ${isDone ? `onclick="nmOpenDetailModal('${tn.id}',${i})"` : ''}>
          ${_compSide.left || ''}
          <div class="grp-match-main" style="flex:1;display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap">
            <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
              <div class="grp-team-chip" style="--chip-col:${ca || '#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb,var(--chip-col) 92%,#fff 8%),color-mix(in srgb,var(--chip-col) 78%,#000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);cursor:pointer" onclick="event.stopPropagation();openUnivModal('${a}')">
                ${_univIconA}
                <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${a || '미정'}</span>
              </div>
              ${aMembers.length ? `<button class="grp-mem-btn" style="--mem-col:${(isDone&&bWin)?'#94a3b8':(ca||'#6366f1')};${(isDone&&bWin)?'opacity:.45;filter:grayscale(1);':''}" onclick="event.stopPropagation();openProMembersPopup('${a.replace(/'/g,"\\'")}','${ca}',${aMemJson})"><span class="mem-ico">👥</span><span>${aMembers.length}명</span></button>` : ''}
            </div>
            <div class="grp-score-col" style="text-align:center;min-width:80px;display:flex;flex-direction:column;align-items:center;gap:3px">
              ${isDone
                ? `<div class="grp-match-score score-click" style="cursor:pointer" onclick="event.stopPropagation();nmOpenDetailModal('${tn.id}',${i})" title="경기 상세 보기">
                    <span style="${aWin ? 'color:var(--win-col)' : bWin ? 'color:var(--lose-col)' : ''};font-size:22px">${m.sa}</span>
                    <span class="score-sep" style="color:var(--text2);font-size:0.72em;font-weight:900;margin:0 5px;opacity:0.8">:</span>
                    <span style="${bWin ? 'color:var(--win-col)' : aWin ? 'color:var(--lose-col)' : ''};font-size:22px">${m.sb}</span>
                  </div>`
                : `<div class="grp-vs-text" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:#6366f1;text-shadow:0 1px 8px #6366f144">VS</div>`
              }
              ${m.memo ? `<div style="font-size:10px;color:var(--gray-l);margin-top:2px">${m.memo}</div>` : ''}
            </div>
            <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
              <div class="grp-team-chip" style="--chip-col:${cb || '#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb,var(--chip-col) 92%,#fff 8%),color-mix(in srgb,var(--chip-col) 78%,#000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);cursor:pointer" onclick="event.stopPropagation();openUnivModal('${b}')">
                ${_univIconB}
                <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${b || '미정'}</span>
              </div>
              ${bMembers.length ? `<button class="grp-mem-btn" style="--mem-col:${(isDone&&aWin)?'#94a3b8':(cb||'#8b5cf6')};${(isDone&&aWin)?'opacity:.45;filter:grayscale(1);':''}" onclick="event.stopPropagation();openProMembersPopup('${b.replace(/'/g,"\\'")}','${cb}',${bMemJson})"><span class="mem-ico">👥</span><span>${bMembers.length}명</span></button>` : ''}
            </div>
          </div>
          ${_compSide.right || ''}
        </div>
      </div>`;
    });
    h += `</div>`;
  });

  return h;
}

/* ── 인라인 빌더 HTML ── */
function _nmBuilderHTML(tn) {
  const tnId = tn.id;
  const bld = (_nmBLD && _nmBLD.tnId === tnId) ? _nmBLD : null;
  const isEdit = bld && bld.editIdx >= 0;

  // 대학 옵션
  const knownUnivs = [...new Set([
    ...(typeof univCfg !== 'undefined' ? univCfg.filter(u => u && !u.dissolved).map(u => u.name) : []),
    ...(tn.groups || []).flatMap(g => g.univs || [])
  ])].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ko'));

  const uOptA = `<option value="">— 팀 A 선택 —</option>` + knownUnivs.map(u => `<option value="${u}"${bld && bld.teamA === u ? ' selected' : ''}>${u}</option>`).join('');
  const uOptB = `<option value="">— 팀 B 선택 —</option>` + knownUnivs.map(u => `<option value="${u}"${bld && bld.teamB === u ? ' selected' : ''}>${u}</option>`).join('');

  const colA = bld && bld.teamA ? (gc(bld.teamA) || '#2563eb') : '#6366f1';
  const colB = bld && bld.teamB ? (gc(bld.teamB) || '#dc2626') : '#8b5cf6';

  // 스코어 계산
  let fgA = 0, fgB = 0;
  if (bld) {
    (bld.freeGames || []).forEach(g => { if (g.winner === 'A') fgA++; else if (g.winner === 'B') fgB++; });
  }

  // 맵 옵션
  const mapOpts = (typeof maps !== 'undefined' ? maps : []).map(m => `<option value="${m}">${m}</option>`).join('');

  // 선수 목록 (팀별)
  const mA = bld && bld.teamA ? (typeof getMembers === 'function' ? getMembers(bld.teamA) : []) : [];
  const mB = bld && bld.teamB ? (typeof getMembers === 'function' ? getMembers(bld.teamB) : []) : [];

  let h = `<div class="match-builder match-builder--refined" style="margin-bottom:4px">
    <div class="match-builder-head">
      <div>
        <div class="match-builder-title">🎮 일반 경기 ${isEdit ? '수정' : '입력'}</div>
      </div>
      <div class="mb-actions">
        <button class="btn btn-p btn-sm" onclick="nmOpenPasteModal('${tnId}')">📋 자동인식</button>
        ${bld ? `<button class="btn btn-w btn-sm" onclick="_nmBLD=null;render()">🔄 초기화</button>` : ''}
      </div>
    </div>`;

  // ① 날짜 & 팀 선택 카드
  h += `<div class="mb-card">
    <div class="mb-card-title">① 날짜 &amp; 팀 선택</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">날짜</label>
      <input type="date" value="${bld ? bld.date : new Date().toISOString().slice(0, 10)}" onchange="if(!_nmBLD)_nmBLDInit('${tnId}',-1);_nmBLD.date=this.value" style="padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--blue);margin-left:8px">메모</label>
      <input type="text" placeholder="메모 (선택)" value="${bld ? (bld.memo || '') : ''}" oninput="if(!_nmBLD)_nmBLDInit('${tnId}',-1);_nmBLD.memo=this.value" style="flex:1;min-width:100px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:140px">
        <label style="font-size:var(--fs-sm);font-weight:700;display:block;margin-bottom:5px" style="color:${colA}">🔵 팀 A</label>
        <select onchange="if(!_nmBLD)_nmBLDInit('${tnId}',-1);_nmBLD.teamA=this.value;_nmBLD.freeGames=[];render()" style="width:100%">${uOptA}</select>
        ${bld && bld.teamA ? `<div style="margin-top:5px"><span class="ubadge" style="background:${colA}">${bld.teamA}</span></div>` : ''}
      </div>
      <div style="flex:1;min-width:140px">
        <label style="font-size:var(--fs-sm);font-weight:700;display:block;margin-bottom:5px" style="color:${colB}">🔴 팀 B</label>
        <select onchange="if(!_nmBLD)_nmBLDInit('${tnId}',-1);_nmBLD.teamB=this.value;_nmBLD.freeGames=[];render()" style="width:100%">${uOptB}</select>
        ${bld && bld.teamB ? `<div style="margin-top:5px"><span class="ubadge" style="background:${colB}">${bld.teamB}</span></div>` : ''}
      </div>
    </div>
  </div>`;

  // ② 경기 결과 입력 (팀이 모두 선택된 경우)
  if (bld && bld.teamA && bld.teamB) {
    const freeGames = bld.freeGames || [];

    // 간편 승수 입력
    h += `<div class="mb-card">
      <div class="mb-card-title">② 경기 결과 입력</div>
      <div class="score-board" style="margin-bottom:12px">
        <span style="font-weight:700;color:${colA}">${bld.teamA}</span>
        <span class="score-num wt">${fgA}</span>
        <span style="color:var(--gray-l);font-size:20px;font-weight:700">:</span>
        <span class="score-num lt">${fgB}</span>
        <span style="font-weight:700;color:${colB}">${bld.teamB}</span>
        <span style="font-size:var(--fs-caption);color:var(--gray-l);margin-left:auto">총 ${freeGames.length}경기</span>
      </div>`;
    h += `<div style="margin-bottom:10px;padding:10px 12px;border:1px solid rgba(99,102,241,.18);background:linear-gradient(135deg,rgba(238,242,255,.96),rgba(248,250,252,.98));border-radius:var(--r);font-size:var(--fs-caption);color:#0f172a;line-height:1.6">
      <strong style="color:#4338ca">2대2 수동 입력 가능</strong>
      <span style="color:#475569"> 각 경기의 </span>
      <span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:20px;padding:0 7px;border-radius:999px;background:#e0e7ff;color:#4338ca;font-size:10px;font-weight:900;vertical-align:middle">2:2</span>
      <span style="color:#475569"> 버튼을 누르면 </span>
      <strong>A1/A2 vs B1/B2</strong>
      <span style="color:#475569"> 형태로 입력됩니다.</span>
    </div>`;

    // 간편 승수만 입력 (선수 미지정)
    h += `<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap;padding:10px 12px;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
      <span style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">⚡ 간편 승수 입력</span>
      <span style="font-size:var(--fs-sm)">${bld.teamA}:</span>
      <input type="number" min="0" max="99" value="${bld.directSA != null ? bld.directSA : ''}" style="width:60px;text-align:center;font-weight:700;font-size:14px" placeholder="0" oninput="_nmBLD.directSA=parseInt(this.value)||0;render()">
      <span style="font-size:var(--fs-sm)">${bld.teamB}:</span>
      <input type="number" min="0" max="99" value="${bld.directSB != null ? bld.directSB : ''}" style="width:60px;text-align:center;font-weight:700;font-size:14px" placeholder="0" oninput="_nmBLD.directSB=parseInt(this.value)||0;render()">
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">(선수 미지정 시 승수만 저장)</span>
    </div>`;

    // 게임별 입력
    freeGames.forEach((g, gi) => {
      const optsA = mA.map(p => `<option value="${p.name}"${g.playerA === p.name ? ' selected' : ''}>${p.name}[${p.tier || '-'}/${p.race || '-'}]</option>`).join('');
      const optsB = mB.map(p => `<option value="${p.name}"${g.playerB === p.name ? ' selected' : ''}>${p.name}[${p.tier || '-'}/${p.race || '-'}]</option>`).join('');
      const _resA = g.winner === 'A' ? 'win' : (g.winner === 'B' ? 'lose' : '');
      const _resB = g.winner === 'B' ? 'win' : (g.winner === 'A' ? 'lose' : '');
      const _stA = univSelectStyle((mA.find(p => p.name === g.playerA) || {}).univ, _resA);
      const _stB = univSelectStyle((mB.find(p => p.name === g.playerB) || {}).univ, _resB);
      const _stA1 = univSelectStyle((mA.find(p => p.name === g.a1) || {}).univ, _resA);
      const _stA2 = univSelectStyle((mA.find(p => p.name === g.a2) || {}).univ, _resA);
      const _stB1 = univSelectStyle((mB.find(p => p.name === g.b1) || {}).univ, _resB);
      const _stB2 = univSelectStyle((mB.find(p => p.name === g.b2) || {}).univ, _resB);
      h += `<div class="game-row">
        <span style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);min-width:40px">경기${gi + 1}</span>
        ${g._isTeam?`<button class="btn btn-xs btn-b" onclick="_nmBLD.freeGames[${gi}]._isTeam=false;_nmBLD.freeGames[${gi}].a1='';_nmBLD.freeGames[${gi}].a2='';_nmBLD.freeGames[${gi}].b1='';_nmBLD.freeGames[${gi}].b2='';_nmBLD.freeGames[${gi}].playerA='';_nmBLD.freeGames[${gi}].playerB='';render()" title="일반 1:1 입력으로 전환">2:2</button>`:''}
        ${g._isTeam
          ? `<select style="${_stA1};flex:1;min-width:72px" onchange="var g=_nmBLD.freeGames[${gi}];g._isTeam=true;g.a1=this.value;g.playerA=[g.a1,g.a2].filter(Boolean).join(',');render()"><option value="">A1</option>${mA.map(p => `<option value="${p.name}"${g.a1 === p.name ? ' selected' : ''}>${p.name}[${p.tier || '-'}/${p.race || '-'}]</option>`).join('')}</select>
             <select style="${_stA2};flex:1;min-width:72px" onchange="var g=_nmBLD.freeGames[${gi}];g._isTeam=true;g.a2=this.value;g.playerA=[g.a1,g.a2].filter(Boolean).join(',');render()"><option value="">A2</option>${mA.map(p => `<option value="${p.name}"${g.a2 === p.name ? ' selected' : ''}>${p.name}[${p.tier || '-'}/${p.race || '-'}]</option>`).join('')}</select>
             <span style="font-size:var(--fs-caption);color:var(--gray-l)">vs</span>
             <select style="${_stB1};flex:1;min-width:72px" onchange="var g=_nmBLD.freeGames[${gi}];g._isTeam=true;g.b1=this.value;g.playerB=[g.b1,g.b2].filter(Boolean).join(',');render()"><option value="">B1</option>${mB.map(p => `<option value="${p.name}"${g.b1 === p.name ? ' selected' : ''}>${p.name}[${p.tier || '-'}/${p.race || '-'}]</option>`).join('')}</select>
             <select style="${_stB2};flex:1;min-width:72px" onchange="var g=_nmBLD.freeGames[${gi}];g._isTeam=true;g.b2=this.value;g.playerB=[g.b1,g.b2].filter(Boolean).join(',');render()"><option value="">B2</option>${mB.map(p => `<option value="${p.name}"${g.b2 === p.name ? ' selected' : ''}>${p.name}[${p.tier || '-'}/${p.race || '-'}]</option>`).join('')}</select>`
          : `<select style="${_stA};flex:1;min-width:80px" onchange="_nmBLD.freeGames[${gi}].playerA=this.value;render()"><option value="">A 선택</option>${optsA}</select>
             <span style="font-size:var(--fs-caption);color:var(--gray-l)">vs</span>
             <select style="${_stB};flex:1;min-width:80px" onchange="_nmBLD.freeGames[${gi}].playerB=this.value;render()"><option value="">B 선택</option>${optsB}</select>`}
        <select onchange="_nmBLD.freeGames[${gi}].map=this.value" style="max-width:100px"><option value="">맵</option>${mapOpts}${g.map && !(typeof maps !== 'undefined' && maps.includes(g.map)) ? `<option value="${g.map}" selected>${g.map}</option>` : ''}</select>
        <button class="win-btn ${g.winner === 'A' ? 'win-sel' : ''}" onclick="_nmBLD.freeGames[${gi}].winner='A';render()">A 승</button>
        <button class="win-btn ${g.winner === 'B' ? 'lose-sel' : ''}" onclick="_nmBLD.freeGames[${gi}].winner='B';render()">B 승</button>
        <button class="btn btn-r btn-xs" onclick="_nmBLD.freeGames.splice(${gi},1);render()">🗑️</button>
      </div>`;
    });

    h += `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;margin-bottom:12px">
      <button class="btn btn-w btn-sm" onclick="_nmBLD.freeGames.push({playerA:'',playerB:'',winner:'',map:'',_isTeam:false,a1:'',a2:'',b1:'',b2:''});render()">+ 경기 추가</button>
      <button class="btn btn-b btn-sm" onclick="_nmBLD.freeGames.push({playerA:'',playerB:'',winner:'',map:'',_isTeam:true,a1:'',a2:'',b1:'',b2:''});render()">+ 2:2 경기 추가</button>
    </div>`;

    // 저장 바
    h += `<div class="mb-savebar" style="margin-top:10px;padding-top:12px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
      <div style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:700">저장 전 스코어와 경기 구성을 확인하세요.</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-g" onclick="nmSaveFromBuilder()">✅ ${isEdit ? '수정 저장' : '저장'}</button>
        <button class="btn btn-w" onclick="_nmBLD=null;render()">취소</button>
      </div>
    </div>`;
    h += `</div>`; // mb-card close
  }

  h += `</div>`; // match-builder close
  return h;
}

/* ── 수정 시작 ── */
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

/* ── 일반 경기 상세 팝업 ── */
function nmOpenDetailModal(tnId, idx) {
  const _mdDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_md_design_mode')||'classic').trim(); return ['classic','glass','editorial','neon','midnight','sunset','aurora','mono'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
  const _mdLayoutMode = (()=>{ try{ const v=(localStorage.getItem('su_md_layout_mode')||'default').trim(); return ['default','compact','focus','broadcast','split','poster'].includes(v)?v:'default'; }catch(e){ return 'default'; } })();
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return;
  const m = (tn.normalMatches || [])[idx]; if (!m) return;
  const caBase = gc(m.a || ''), cbBase = gc(m.b || '');
  const ca = (typeof _getMatchDetailTeamHeaderColor === 'function') ? _getMatchDetailTeamHeaderColor('', 'A', caBase) : caBase;
  const cb = (typeof _getMatchDetailTeamHeaderColor === 'function') ? _getMatchDetailTeamHeaderColor('', 'B', cbBase) : cbBase;
  const isDone = m.sa != null && m.sb != null;
  const aWin = isDone && m.sa > m.sb, bWin = isDone && m.sb > m.sa;

  try {
    const titleEl = document.getElementById('cmdTitle');
    const subEl = document.getElementById('cmdSub');
    const bar = document.getElementById('cmdScoreBar');
    const headActions = document.getElementById('cmdHeadActions');
    const safe = (s) => String(s || '').replace(/[<>]/g, '');
    if (titleEl) titleEl.textContent = `📊 ${tn.name || '대회'} · 일반 경기`;
    const dStr = m.d ? String(m.d).slice(0, 10) : '';
    if (subEl) subEl.textContent = dStr ? `📅 ${dStr}` : '';
    if (bar) {
      if (isDone) {
        const loseA = bWin, loseB = aWin;
        const aBg = loseA ? 'linear-gradient(180deg,rgba(248,250,252,.98),rgba(241,245,249,.96))' : (ca || '#6366f1');
        const bBg = loseB ? 'linear-gradient(180deg,rgba(248,250,252,.98),rgba(241,245,249,.96))' : (cb || '#8b5cf6');
        const aBd = loseA ? 'rgba(203,213,225,.88)' : _compMenuTint(ca || '#6366f1', .46);
        const bBd = loseB ? 'rgba(203,213,225,.88)' : _compMenuTint(cb || '#8b5cf6', .46);
        const aFg = loseA ? '#1f2937' : '#ffffff';
        const bFg = loseB ? '#1f2937' : '#ffffff';
        const uicon = (team) => {
          try {
            const url = (window.UNIV_ICONS && window.UNIV_ICONS[team]) || ((univCfg.find(x => x && x.name === team) || {}).icon) || '';
            return url ? `<span style="display:inline-flex;align-items:center;justify-content:center"><img class="cmd-uicon" src="${toHttpsUrl(url)}" style="object-fit:contain;border-radius:var(--su_univ_logo_radius,12px);background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);padding:7px" onerror="this.parentNode.style.display='none'"></span>` : '';
          } catch (e) { return ''; }
        };
        bar.innerHTML = `<div class="cmd-score">
          <div class="cmd-team" style="background:${aBg};border:1px solid ${aBd};justify-content:center;text-align:center;position:relative;color:${aFg};padding:0 18px"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:1000;font-size:22px;text-align:center;display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:calc(100% - 78px);white-space:nowrap">${uicon(m.a || '')}<span>${safe(m.a || 'A팀')}</span></span></div>
          <div class="cmd-mid"><span style="color:${aWin ? 'var(--win-col)' : bWin ? 'var(--lose-col)' : '#111827'}">${m.sa}</span><span class="cmd-colon">:</span><span style="color:${bWin ? 'var(--win-col)' : aWin ? 'var(--lose-col)' : '#111827'}">${m.sb}</span></div>
          <div class="cmd-team" style="background:${bBg};border:1px solid ${bBd};justify-content:center;text-align:center;position:relative;color:${bFg};padding:0 18px"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:1000;font-size:22px;text-align:center;display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:calc(100% - 78px);white-space:nowrap">${uicon(m.b || '')}<span>${safe(m.b || 'B팀')}</span></span></div>
        </div>`;
        bar.style.display = 'block';
      } else { bar.innerHTML = ''; bar.style.display = 'none'; }
    }
    if (headActions) {
      const _adm = (localStorage.getItem('su_share_admin_only') || '0') === '1';
      const okShare = (!_adm || isLoggedIn) && isDone;
      let btnHtml = '';
      if (isLoggedIn) {
        btnHtml += `<button class="btn btn-w btn-xs" style="display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:999px;font-weight:700" onclick="cm('compMatchDetailModal');nmStartEdit('${tnId}',${idx})">✏️ 수정</button>`;
      }
      if (okShare) {
        btnHtml += `<button class="btn btn-p btn-xs" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:104px;padding:7px 12px;border-radius:999px;background:linear-gradient(135deg,#7c3aed,#2563eb);border:1px solid rgba(255,255,255,.24);box-shadow:0 8px 20px rgba(37,99,235,.22);color:#fff;font-weight:900" onclick="nmOpenShareCard('${tnId}',${idx})">🎴 공유 카드</button>`;
      }
      headActions.innerHTML = btnHtml;
    }
    window._cmdDetailState = { tnId, gi: null, mi: null, rnd: null, isManual: false, isNm: true, nmIdx: idx };
  } catch (e) { }

  const content = document.getElementById('compMatchDetailContent');
  if (content) {
    const _editRefNm = isLoggedIn ? `nm:${tnId}:${idx}` : null;
    const _mForDetail = _editRefNm ? { ...m, _editRef: _editRefNm } : m;
    window.__detailCtx = 'compModal';
    content.innerHTML = `<div class="cmd-detail">${(typeof buildDetailHTML === 'function') ? buildDetailHTML(_mForDetail, 'mini', m.a || 'A팀', m.b || 'B팀', ca, cb, aWin, bWin) : '<div style="color:var(--gray-l);padding:20px;text-align:center">상세 기록이 없습니다</div>'}</div>`;
  }
  try{
    const modal=document.getElementById('compMatchDetailModal');
    if(modal){
      modal.setAttribute('data-md-mode', _mdDesignMode);
      modal.setAttribute('data-md-layout', _mdLayoutMode);
    }
  }catch(e){}
  try { if (typeof om === 'function') om('compMatchDetailModal'); } catch (e) { }
}

/* ── 일반 경기 공유카드 ── */
async function nmOpenShareCard(tnId, idx) {
  try {
    if (typeof window._ensureStatsLoaded === 'function') await window._ensureStatsLoaded();
    const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return;
    const m = (tn.normalMatches || [])[idx]; if (!m || m.sa == null) return;
    const payload = {
      ...m, a: m.a || '', b: m.b || '', sa: m.sa, sb: m.sb, d: m.d || '',
      n: tn.name, compName: tn.name, teamALabel: m.a || '', teamBLabel: m.b || '',
      sets: m.sets || [], stage: 'league', _matchType: 'comp', grpName: '일반 경기', grpLetter: 'N'
    };
    if (typeof window._openShareMatchObjCard === 'function') window._openShareMatchObjCard(payload);
    else if (typeof openShareCardModal === 'function') {
      window._shareMatchObj = payload; window._shareMode = 'match'; openShareCardModal();
      const _run = () => { try { if (window._shareMatchObj && typeof renderShareCardByMatchObj === 'function') renderShareCardByMatchObj(window._shareMatchObj); } catch (e) { } };
      if (typeof window._shareCardDeferRender === 'function') window._shareCardDeferRender(_run);
      else setTimeout(_run, 0);
    }
  } catch (e) { console.error('[nmOpenShareCard]', e); }
}

/* ── 삭제 ── */
function nmDelMatch(tnId, idx) {
  // 브라우저 기본 confirm 대신 역산 불가 경고를 포함한 커스텀 모달 사용
  _nmConfirmDel(function() {
    const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return;
    tn.normalMatches = tn.normalMatches || [];
    const m = tn.normalMatches[idx];
    if (m && m._id) {
      const matchId = m._id;
      const gameIds = new Set();
      (m.sets || []).forEach((s, si) => (s.games || []).forEach((_, gi) => {
        gameIds.add(`${matchId}_s${si}_g${gi}`);
        gameIds.add(`${matchId}_g${gi}`); // 구버전 ID 호환
      }));
      if (Array.isArray(typeof players !== 'undefined' ? players : [])) {
        players.forEach(p => {
          if (!Array.isArray(p.history)) return;
          p.history = p.history.filter(h => h.matchId !== matchId && !gameIds.has(h.matchId));
        });
      }
    }
    tn.normalMatches.splice(idx, 1);
    if (_nmBLD && _nmBLD.tnId === tnId && _nmBLD.editIdx === idx) _nmBLD = null;
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
    try { if (typeof window.refreshPlayerModalIfOpen === 'function') window.refreshPlayerModalIfOpen(); } catch (e) { }

    // 삭제 완료 토스트
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 20px;border-radius:20px;font-size:var(--fs-base);font-weight:700;z-index:var(--z-top);pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.3)';
    toast.innerHTML = '🗑️ 삭제 완료 · 승패/ELO는 <b>설정 › 전체 재계산</b>에서 갱신해 주세요';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  });
}

/* ── 삭제 확인 모달 (역산 불가 사전 안내 포함) ── */
function _nmConfirmDel(onConfirm) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML = `
    <div style="background:var(--white);border-radius:14px;padding:24px 22px 18px;max-width:340px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,.3)">
      <div style="font-size:var(--fs-md);font-weight:800;color:var(--text);margin-bottom:10px">🗑️ 일반 경기 삭제</div>
      <div style="font-size:var(--fs-base);color:var(--text2);line-height:1.6;margin-bottom:6px">이 경기를 삭제하시겠습니까?</div>
      <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;padding:10px 12px;font-size:var(--fs-sm);color:#92400E;line-height:1.6;margin-bottom:18px">
        ⚠️ <b>삭제 후 승패·ELO는 자동으로 역산되지 않습니다.</b><br>
        삭제 완료 후 <b>설정 › 전체 재계산</b>을 실행해야 수치가 반영됩니다.
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="_nmDelCancel" style="padding:7px 16px;border-radius:8px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-base);font-weight:700;cursor:pointer;color:var(--text2)">취소</button>
        <button id="_nmDelOk" style="padding:7px 16px;border-radius:8px;border:none;background:#EF4444;color:#fff;font-size:var(--fs-base);font-weight:700;cursor:pointer">삭제</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const close = () => { try { ov.remove(); } catch(e) {} };
  ov.querySelector('#_nmDelCancel').addEventListener('click', close);
  ov.querySelector('#_nmDelOk').addEventListener('click', function() { close(); onConfirm(); });
  ov.addEventListener('click', function(e) { if (e.target === ov) close(); });
}

/* ── 자동인식 (pasteModal 재활용) ── */
function nmOpenPasteModal(tnId) {
  _nmPasteApply_tnId = tnId;
  _nmSetupPasteModal(tnId);
}

var _nmPasteApply_tnId = null;

function _nmSetupPasteModal(tnId) {
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return;
  const bld = (_nmBLD && _nmBLD.tnId === tnId) ? _nmBLD : null;
  const teamA = bld ? bld.teamA : null;
  const teamB = bld ? bld.teamB : null;

  const textarea = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn = document.getElementById('paste-apply-btn');
  const badge = document.getElementById('paste-summary-badge');
  const pendWarn = document.getElementById('paste-pending-warn');
  if (textarea) textarea.value = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn) { applyBtn.style.display = 'none'; applyBtn.textContent = '✅ 일반 경기에 적용'; }
  if (badge) badge.style.display = 'none';
  if (pendWarn) pendWarn.style.display = 'none';
  window._pasteResults = null; window._pasteErrors = null;

  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = (bld && bld.date) || '';

  const modeSel = document.getElementById('paste-mode');
  const modeLabel = document.getElementById('paste-mode-label');
  if (modeSel) { modeSel.value = 'comp'; modeSel.style.display = 'none'; }
  if (modeLabel) modeLabel.style.display = 'none';

  const hintEl = document.getElementById('paste-mode-hint');
  if (hintEl) {
    if (teamA && teamB) {
      hintEl.innerHTML = `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#16a34a;font-weight:700">🎮 일반 경기 자동인식</span> — <b>${teamA}</b> vs <b>${teamB}</b><br><span style="font-size:var(--fs-caption);color:#6b7280">경기 결과를 자동 인식해 빌더에 불러옵니다.</span></div>`;
    } else {
      hintEl.innerHTML = `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#16a34a;font-weight:700">🎮 일반 경기 자동인식</span> — 선수 소속 대학을 자동 인식합니다.<br><span style="font-size:var(--fs-caption);color:#6b7280">팀 정보가 없으면 소속 대학 기준으로 자동 구분합니다.</span></div>`;
    }
  }

  const setSelWrap = document.getElementById('grp-paste-set-wrap');
  if (setSelWrap) setSelWrap.style.display = 'none';

  window._grpPasteMode = true;
  window._grpPasteState = { mode: 'normal_match', tnId, idx: -1, teamA, teamB };
  _grpPasteState = { mode: 'normal_match', tnId, idx: -1, teamA, teamB };

  if (typeof om === 'function') om('pasteModal');
}

/* ── 자동인식 적용 — 빌더에 games 불러오기 [개선: 저장이 아닌 빌더 채우기] ── */
function _nmPasteApplyLogic(savable) {
  const state = window._grpPasteState || _grpPasteState;
  if (!state) return false;
  const { tnId } = state;
  let { teamA, teamB } = state;
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return false;

  // 팀 자동 추출 (미지정인 경우)
  if (!teamA || !teamB) {
    const univCount = {};
    savable.forEach(r => {
      [r.wPlayer?.univ, r.lPlayer?.univ].forEach(u => { if (u && u !== '무소속') univCount[u] = (univCount[u] || 0) + 1; });
    });
    // [개선] 동수 시 가나다 정렬 타이브레이커
    const univRanked = Object.entries(univCount).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'));
    if (univRanked.length < 2) { alert('선수 소속 대학을 인식할 수 없습니다.\n팀을 먼저 선택해주세요.'); return false; }
    teamA = univRanked[0][0]; teamB = univRanked[1][0];
  }

  // savable → freeGames 변환
  const teamANamesSet = new Set(); const teamBNamesSet = new Set();
  savable.forEach(r => {
    const wn = r.wPlayer?.name, wu = r.wPlayer?.univ;
    const ln = r.lPlayer?.name, lu = r.lPlayer?.univ;
    if (wn) { if (wu === teamA) teamANamesSet.add(wn); else if (wu === teamB) teamBNamesSet.add(wn); }
    if (ln) { if (lu === teamA) teamANamesSet.add(ln); else if (lu === teamB) teamBNamesSet.add(ln); }
  });

  const _isWinnerInA = (r) => {
    const wn = r.wPlayer.name;
    if (teamANamesSet.has(wn)) return true;
    if (teamBNamesSet.has(wn)) return false;
    return (r.leftName || r.winName) === wn;
  };

  const freeGames = [];
  savable.forEach(r => {
    if (r._scoreOnly) {
      for (let i = 0; i < (r._scoreA || 0); i++) freeGames.push({ playerA: '', playerB: '', winner: 'A', map: '' });
      for (let i = 0; i < (r._scoreB || 0); i++) freeGames.push({ playerA: '', playerB: '', winner: 'B', map: '' });
      return;
    }
    const wn = r.wPlayer.name, ln = r.lPlayer.name;
    const wInA = _isWinnerInA(r);
    freeGames.push({ playerA: wInA ? wn : ln, playerB: wInA ? ln : wn, winner: wInA ? 'A' : 'B', map: r.map || '' });
  });

  const dateEl = document.getElementById('paste-date');
  const dateStr = dateEl?.value || new Date().toISOString().slice(0, 10);

  // [개선] 저장하지 않고 빌더에 채운 후 사용자가 확인 후 저장
  if (!_nmBLD || _nmBLD.tnId !== tnId) {
    _nmBLDInit(tnId, -1);
  }
  _nmBLD.teamA = teamA;
  _nmBLD.teamB = teamB;
  _nmBLD.date = dateStr;
  _nmBLD.freeGames = freeGames;
  _nmBLD.directSA = null;
  _nmBLD.directSB = null;

  window._grpPasteMode = false;
  if (typeof cm === 'function') cm('pasteModal');
  window._pasteResults = null;
  compSub = 'normal';
  if (typeof render === 'function') render();

  // 빌더로 스크롤
  setTimeout(() => {
    const el = document.querySelector('.match-builder--refined');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);

  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 20px;border-radius:20px;font-size:var(--fs-base);font-weight:700;z-index:var(--z-top);pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.3)';
  toast.textContent = `📋 ${freeGames.length}경기 자동인식 완료 — 확인 후 저장하세요`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
  return true;
}

/* ── getTourneyMatches에 normalMatches 포함 ── */
function getNormalMatchesForHistory() {
  const result = [];
  if (!Array.isArray(typeof tourneys !== 'undefined' ? tourneys : null)) return result;
  tourneys.forEach((tn, ti) => {
    if (tn.type === 'tier') return;
    (tn.normalMatches || []).forEach((m, mi) => {
      if (!m.a || !m.b) return;
      if (m.sa == null || m.sb == null) return;
      result.push({
        _src: 'tour_normal', _tnId: tn.id, _nmi: mi,
        d: m.d || '', n: tn.name, a: m.a, b: m.b,
        sa: m.sa, sb: m.sb, sets: m.sets || [],
        grpName: '일반경기', grpLetter: 'N', grpColor: '#6366f1',
        compName: tn.name
      });
    });
  });
  return result;
}

/* ── 스트리머 상세 — 대회 일반경기 전적 스캔 ── [BUGFIX: inA 미사용 수정] ── */
function scanNormalMatchesForPlayer(playerName, onMatch) {
  if (!Array.isArray(typeof tourneys !== 'undefined' ? tourneys : null)) return;
  tourneys.forEach(tn => {
    if (tn.type === 'tier') return;
    (tn.normalMatches || []).forEach(m => {
      if (!m.a || !m.b || m.sa == null || m.sb == null) return;
      // [BUGFIX] 실제로 해당 선수가 참여한 경기만 콜백
      const participated = (m.sets || []).some(s =>
        (s.games || []).some(g => g.playerA === playerName || g.playerB === playerName)
      );
      if (participated && onMatch) onMatch(m, tn);
    });
  });
}

/* ── 하위 호환: 구버전 팝업 함수 alias ── */
function nmAddMatch(tnId) { if (!_nmBLD || _nmBLD.tnId !== tnId) _nmBLDInit(tnId, -1); render(); }
function nmAddMatchByDate(tnId, dateStr) {
  _nmBLDInit(tnId, -1);
  if (_nmBLD) _nmBLD.date = dateStr === '날짜 미정' ? '' : dateStr;
  render();
}
function nmEditMatch(tnId, idx) { nmStartEdit(tnId, idx); }

try {
  window.rCompNormalMatches = rCompNormalMatches;
  window.nmAddMatch = nmAddMatch;
  window.nmAddMatchByDate = nmAddMatchByDate;
  window.nmEditMatch = nmEditMatch;
  window.nmDelMatch = nmDelMatch;
  window.nmSaveFromBuilder = nmSaveFromBuilder;
  window.nmStartEdit = nmStartEdit;
  window._nmOpenEditModal = _nmOpenEditModal;
  window._nmRenderEditModal = _nmRenderEditModal;
  window.nmCloseEditModal = nmCloseEditModal;
  window.nmSaveFromBuilderModal = nmSaveFromBuilderModal;
  window.nmOpenPasteModal = nmOpenPasteModal;
  window._nmPasteApplyLogic = _nmPasteApplyLogic;
  window._nmBLDInit = _nmBLDInit;
  window.nmOpenDetailModal = nmOpenDetailModal;
  window.nmOpenShareCard = nmOpenShareCard;
  window.getNormalMatchesForHistory = getNormalMatchesForHistory;
  window.scanNormalMatchesForPlayer = scanNormalMatchesForPlayer;
} catch (e) { }
