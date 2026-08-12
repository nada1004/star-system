// competition-normal-matches.js에서 분리됨 (대회 일반경기 - 목록 렌더/빌더HTML)
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
  const nmAll = tn.normalMatches || [];
  let h = '';

  // ── 인라인 빌더 (로그인 시) ──
  if (isLoggedIn) {
    h += _nmBuilderHTML(tn);
  }

  if (!nmAll.length && !isLoggedIn) {
    return h + `<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:40px;margin-bottom:12px">🎮</div>
      <div style="font-size:var(--fs-md);font-weight:700;margin-bottom:8px">일반 경기 기록이 없습니다</div>
      <div style="color:var(--gray-l)">조별리그와 관계없는 단순 경기를 기록할 수 있습니다</div>
    </div>`;
  }

  if (!nmAll.length) return h;

  // ── 상태값 초기화 (검색/필터/정렬/접기) ──
  if (typeof window._nmSortAsc === 'undefined') window._nmSortAsc = false;
  if (typeof window._nmResultFilter === 'undefined') window._nmResultFilter = 'all';
  if (typeof window._nmSearchQ === 'undefined') window._nmSearchQ = '';
  if (!window._nmCollapsedDates) window._nmCollapsedDates = {};

  const doneCount = nmAll.filter(m => m.sa != null && m.sb != null).length;
  const pendingCount = nmAll.length - doneCount;

  // ── 검색어 / 결과 필터 적용 ──
  const _q = String(window._nmSearchQ || '').trim().toLowerCase();
  const nm = nmAll.map((m, i) => ({ m, i })).filter(({ m }) => {
    const isDone = m.sa != null && m.sb != null;
    if (window._nmResultFilter === 'done' && !isDone) return false;
    if (window._nmResultFilter === 'pending' && isDone) return false;
    if (_q) {
      const hay = `${m.a || ''} ${m.b || ''} ${m.memo || ''}`.toLowerCase();
      if (!hay.includes(_q)) return false;
    }
    return true;
  });

  // ── 경기 목록 툴바 (검색 · 결과필터 · 정렬 · CSV) ──
  h += `<div style="margin-top:${isLoggedIn?'18px':'0'};margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <span style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">📋 경기 목록</span>
      <span style="font-size:var(--fs-sm);color:var(--gray-l)">총 ${nmAll.length}경기 (✅ 완료 ${doneCount} · ⏳ 미정 ${pendingCount})</span>
      ${nm.length !== nmAll.length ? `<span style="font-size:var(--fs-caption);color:var(--blue);font-weight:700">· 필터링됨 ${nm.length}건</span>` : ''}
      <button class="btn btn-w btn-xs no-export" style="margin-left:auto" onclick="_nmExportCsv('${tn.id}')">⬇️ CSV 내보내기</button>
    </div>
    <div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      <input id="nm-search-input" type="text" placeholder="🔍 팀 이름/메모 검색" value="${String(window._nmSearchQ||'').replace(/"/g,'&quot;')}"
        oninput="window._searchFocusId='nm-search-input';window._nmSearchQ=this.value;render()"
        onfocus="window._searchFocusId='nm-search-input'"
        style="flex:1;min-width:140px;max-width:240px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm)">
      <button class="pill ${window._nmResultFilter==='all'?'on':''}" onclick="window._nmResultFilter='all';render()">전체</button>
      <button class="pill ${window._nmResultFilter==='done'?'on':''}" onclick="window._nmResultFilter='done';render()">✅ 완료</button>
      <button class="pill ${window._nmResultFilter==='pending'?'on':''}" onclick="window._nmResultFilter='pending';render()">⏳ 미정</button>
      <button class="pill" onclick="window._nmSortAsc=!window._nmSortAsc;render()">${window._nmSortAsc?'🔼 오래된순':'🔽 최신순'}</button>
    </div>
  </div>`;

  if (!nm.length) {
    return h + `<div style="padding:40px 20px;text-align:center;color:var(--gray-l)">검색/필터 조건에 맞는 경기가 없습니다.</div>`;
  }

  // 날짜별 그룹화 (정렬 방향 적용)
  const sorted = [...nm].sort((a, b) => window._nmSortAsc
    ? (a.m.d || '').localeCompare(b.m.d || '')
    : (b.m.d || '').localeCompare(a.m.d || ''));
  const byDate = {};
  sorted.forEach(({ m, i }) => {
    const dk = m.d || '날짜 미정';
    if (!byDate[dk]) byDate[dk] = [];
    byDate[dk].push({ m, i });
  });

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateKeys = Object.keys(byDate).sort((a, b) => window._nmSortAsc ? a.localeCompare(b) : b.localeCompare(a));
  dateKeys.forEach((dk) => {
    const items = byDate[dk];
    let dateLabel = dk;
    if (dk !== '날짜 미정') {
      const dt = new Date(dk + 'T00:00:00');
      dateLabel = `${dt.getFullYear()}년 ${dt.getMonth() + 1}월 ${dt.getDate()}일 (${days[dt.getDay()]})`;
    }
    const _ckey = `${tn.id}::${dk}`;
    const _collapsed = !!window._nmCollapsedDates[_ckey];
    h += `<div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;cursor:pointer" onclick="_nmToggleDateCollapse('${_ckey.replace(/'/g,"\\'")}')">
        <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base);color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #6366f1;border-radius:0 8px 8px 0">📅 ${dateLabel} <span style="font-weight:700;color:var(--gray-l);font-size:var(--fs-caption)">(${items.length}경기)</span></div>
        <span class="no-export" style="color:var(--gray-l);font-size:var(--fs-sm);white-space:nowrap">${_collapsed?'▶ 펼치기':'▼ 접기'}</span>
      </div>`;
    if (!_collapsed) {
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
                <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${a || '미정'}</span>
                ${_univIconA}
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
    }
    h += `</div>`;
  });

  return h;
}

/* ── [개선] 날짜 그룹 접기/펼치기 ── */
function _nmToggleDateCollapse(ckey) {
  if (!window._nmCollapsedDates) window._nmCollapsedDates = {};
  window._nmCollapsedDates[ckey] = !window._nmCollapsedDates[ckey];
  render();
}

/* ── [개선] 경기 목록 CSV 내보내기 ── */
function _nmExportCsv(tnId) {
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId);
  if (!tn) return;
  const nm = tn.normalMatches || [];
  if (!nm.length) { alert('내보낼 경기가 없습니다.'); return; }
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const rows = [['날짜', '팀A', '팀B', '스코어A', '스코어B', '메모']];
  [...nm].sort((a, b) => (a.d || '').localeCompare(b.d || '')).forEach(m => {
    rows.push([m.d || '날짜 미정', m.a || '', m.b || '', m.sa ?? '', m.sb ?? '', m.memo || '']);
  });
  const csv = '\uFEFF' + rows.map(r => r.map(esc).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(tn.name || '대회')}_일반경기.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
