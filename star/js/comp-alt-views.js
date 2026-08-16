/* ══════════════════════════════════════════════════════════════
   대회 / 티어대회 보기모드 확장
   (신규기능, 2026-08-10, histviewmodes12)
   프로리그 대회 서브탭(pro-comp-alt-views.js)에 이미 적용된
   4종 보기모드(기본 / 미니 기본 / 그리드 / 컴팩트 테이블형)를
   - 일반대회: 조별리그 일정, 대진표(토너먼트) 기록
   - 티어대회: 일반 기록, 조별리그 기록, 토너먼트 기록
   에도 동일하게 제공한다. 기존 화면은 '기본' 모드로 그대로 유지된다.
   ══════════════════════════════════════════════════════════════ */

const COMP_ALT_TAB_IDS = ['cpnormal', 'cpleague', 'cpbkt', 'ttrecords', 'ttgrprecords', 'ttbktrecords'];

const _COMP_ALT_TYPE_INFO = {
  complg:   { lbl: '조별리그',      col: '#2563eb' },
  compbkt:  { lbl: '대진표 기록',   col: '#7c3aed' },
  ttgen:    { lbl: '티어대회',      col: '#7c3aed' },
  ttleague: { lbl: '조별리그 기록', col: '#16a34a' },
  ttbkt:    { lbl: '토너먼트 기록', col: '#7c3aed' },
  histcomp: { lbl: '대회',          col: '#2563eb' },
  compnormal:{ lbl: '일반경기',      col: '#0ea5e9' },
};

function compAltViewMode(tabId){
  return (typeof getHistTabViewMode === 'function') ? getHistTabViewMode(tabId) : 'basic';
}
function compAltViewModeBarHTML(tabId, bare){
  if(typeof histTabViewModeBarHTML !== 'function') return '';
  return histTabViewModeBarHTML(tabId, bare);
}

// (요청, 2026-08-10) 같은 버튼을 다시 누르면 '기본'으로 되돌아가는 토글형 보기모드 버튼
function compAltToggleMode(tabId, mode){
  const cur = compAltViewMode(tabId);
  const next = (cur === mode) ? 'basic' : mode;
  if(typeof setHistTabViewMode === 'function') setHistTabViewMode(tabId, next);
}
// (버그픽스, 2026-08-10) 기존 보기모드(카드형/컴팩트/조별뷰/매트릭스 등)를 누르면
// 확장 보기모드(미니/그리드)를 '기본'으로 되돌려 두 모드가 동시에 켜지지 않게 한다.
function compAltClearMode(tabId){
  if(typeof setHistTabViewMode === 'function') setHistTabViewMode(tabId, 'basic');
  else if(typeof render === 'function') render();
}
const _COMP_ALT_MODE_LABEL = {
  basic: '🗂 기본',
  mini: '🗂 미니 기본',
  grid: '🖼 그리드',
  compact: '📊 컴팩트 테이블형',
  broadcast: '📺 방송형',
};
// modes: 표시할 보기모드 id 배열 (예: ['mini','grid'])
function compAltToggleBarHTML(tabId, modes){
  const cur = compAltViewMode(tabId);
  return (modes || ['mini', 'grid']).map(id =>
    `<button class="pill ${cur === id ? 'on' : ''}" style="flex-shrink:0;white-space:nowrap" onclick="compAltToggleMode('${tabId}','${id}')">${_COMP_ALT_MODE_LABEL[id] || id}</button>`
  ).join('');
}

// (요청, 2026-08-10) 제목 우측에 "모드" 라벨 + 보기모드 버튼을 붙인 헤더 줄
// titleHTML: 제목(아이콘 포함) HTML, opts: {bg,bd,col,modes}
// (수정, 2026-08-10) 최신순/오래된순 + 보기모드 버튼이 상단 "연도" 필터 줄로 이동함에 따라,
// opts.controls=false를 주면 제목 배지만 표시하고 정렬/모드 버튼은 생략한다 (중복 방지)
function compAltTitleModeBarHTML(tabId, titleHTML, opts){
  const o = opts || {};
  const showControls = o.controls !== false;
  if(!showControls){
    return titleHTML ? `<span class="no-export" style="display:inline-block;font-size:var(--fs-sm);color:${o.col || 'var(--text3)'};font-weight:700;background:${o.bg || 'var(--surface)'};border:1px solid ${o.bd || 'var(--border2)'};border-radius:8px;padding:6px 12px;margin-bottom:10px">${titleHTML}</span>` : '';
  }
  const modes = o.modes || ['basic', 'mini', 'grid', 'compact', 'broadcast'];
  const cur = compAltViewMode(tabId);
  const btns = modes.map(id =>
    `<button class="pill ${cur === id ? 'on' : ''}" style="flex-shrink:0;white-space:nowrap" onclick="setHistTabViewMode('${tabId}','${id}')">${_COMP_ALT_MODE_LABEL[id] || id}</button>`
  ).join('');
  // (요청, 2026-08-10) 보기모드/정렬 버튼은 제목 줄의 '우측'으로 이동
  let sortBtns = '';
  if(o.sort){
    const dir = (typeof recSortDir !== 'undefined') ? recSortDir : 'desc';
    sortBtns = `<button class="pill ${dir === 'desc' ? 'on' : ''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`
      + `<button class="pill ${dir === 'asc' ? 'on' : ''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`
      + `<span class="hist-inline-sep"></span>`;
  }
  return `<div class="no-export" style="background:${o.bg || 'var(--surface)'};border:1px solid ${o.bd || 'var(--border2)'};border-radius:8px;padding:8px 14px;margin-bottom:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    ${titleHTML ? `<span style="font-size:var(--fs-sm);color:${o.col || 'var(--text3)'};font-weight:700">${titleHTML}</span>` : ''}
    <span class="hist-inline-sep"></span>
    ${sortBtns}
    <span style="font-size:11px;font-weight:800;color:var(--gray-l);flex-shrink:0">모드</span>
    ${btns}
    <span style="margin-left:auto"></span>
  </div>`;
}


function _compAltSort(items){
  const asc = (typeof recSortDir !== 'undefined') && recSortDir === 'asc';
  items.sort((a, b) => asc ? (a.d || '').localeCompare(b.d || '') : (b.d || '').localeCompare(a.d || ''));
  return items;
}

// 조별리그 경기 목록({a,b,sa,sb,d,map}) → 공통 아이템
function compAltLeagueItems(matches){
  const items = [];
  (matches || []).forEach((m, i) => {
    if(!m || !m.a || !m.b) return;
    if(m.sa == null || m.sb == null) return;
    items.push({ type: 'complg', d: m.d || '', idx: i, m: { a: m.a, b: m.b, sa: m.sa, sb: m.sb, d: m.d || '', map: m.map || '', sets: m.sets || [], wName: m.wName || '', lName: m.lName || '' } });
  });
  return _compAltSort(items);
}

// 대진표 기록(rBracketSchedule의 done 목록) → 공통 아이템
function compAltBktItems(matches){
  const items = [];
  (matches || []).forEach((mc, i) => {
    if(!mc) return;
    const det = mc.detail || {};
    const a = mc.teamA || det.a || '';
    const b = mc.teamB || det.b || '';
    if(!a || !b) return;
    if(det.sa == null || det.sb == null) return;
    items.push({ type: 'compbkt', d: det.d || '', idx: i, m: { a, b, sa: det.sa, sb: det.sb, d: det.d || '', map: det.map || '', sets: det.sets || mc.sets || [], wName: det.wName || '', lName: det.lName || '' } });
  });
  return _compAltSort(items);
}

// (버그픽스, 2026-08-10) 한 경기(다전제) 안의 개별 게임이 별도 기록으로도 저장돼 있으면
// 미니 기본/그리드/컴팩트 모드에서 "1경기 + 그 안의 게임들"이 따로따로 나열됐다.
// → 부모 경기(sets/games 보유)의 게임 매치업과 같은 날짜·같은 대진의 단일 게임 기록은 제외하고
//   부모 경기 1장으로만 보여준다.
function _compAltDropInnerGames(recs){
  try{
    const list = (recs || []).filter(Boolean);
    const norm = v => String(v || '').trim();
    const pairKey = (d, x, y) => `${norm(d)}|${[norm(x), norm(y)].sort().join('|')}`;
    const inner = new Set();
    let gameCount = 0;
    list.forEach(m => {
      const sets = Array.isArray(m.sets) ? m.sets : [];
      const games = [];
      sets.forEach(s => ((s && s.games) || []).forEach(g => { if(g) games.push(g); }));
      if(games.length < 2) return; // 다전제(부모) 경기만 내부 게임 목록으로 사용
      games.forEach(g => {
        const pa = norm(g.playerA), pb = norm(g.playerB);
        if(!pa || !pb) return;
        inner.add(pairKey(m.d, pa, pb));
        gameCount++;
      });
    });
    if(!gameCount) return list;
    return list.filter(m => {
      const sets = Array.isArray(m.sets) ? m.sets : [];
      const own = sets.reduce((n, s) => n + (((s && s.games) || []).length || 0), 0);
      if(own > 1) return true; // 다전제(부모) 경기는 항상 표시
      const a = norm(m.a || m.teamALabel || m.teamA);
      const b = norm(m.b || m.teamBLabel || m.teamB);
      if(!a || !b) return true;
      return !inner.has(pairKey(m.d, a, b));
    });
  }catch(e){ return recs || []; }
}

// 티어대회 기록 목록({a,b,sa,sb,d}) → 공통 아이템
function compAltRecItems(recs, type){
  const items = [];
  _compAltDropInnerGames(recs).forEach((m, i) => {
    if(!m) return;

    // (버그픽스, 2026-08-10) 팀 경기 기록은 a/b 대신 teamALabel/teamBLabel(또는 팀명)로 저장된다.
    // 예전에는 a/b가 없으면 통째로 걸러져서 미니/그리드/컴팩트 모드가 "기록 없음"으로 보였다.
    const _teamName = (v, list, fb) => {
      const t = String(v || '').trim();
      if(t) return t;
      if(Array.isArray(list) && list.length){
        const names = list.map(x => typeof x === 'string' ? x : (x && x.name) || '').filter(Boolean);
        if(names.length) return names.length > 2 ? `${names[0]} 외 ${names.length - 1}명` : names.join(', ');
      }
      return fb;
    };
    const a = _teamName(m.a || m.teamALabel || m.teamA, m.teamAMembers, 'A팀');
    const b = _teamName(m.b || m.teamBLabel || m.teamB, m.teamBMembers, 'B팀');
    if(!a || !b) return;
    items.push({ type: type || 'ttgen', d: m.d || '', idx: i, m: {
      a, b,
      sa: m.sa != null ? m.sa : '', sb: m.sb != null ? m.sb : '',
      d: m.d || '', map: m.map || '',
      // (버그픽스, 2026-08-10) 티어대회/대회 기록은 팀 단위라 팀명으로는 로고/프로필을 찾을 수 없다.
      // 미니 기본·그리드 보기모드에서 멤버 프로필 사진을 쓸 수 있도록 멤버 목록을 함께 전달한다.
      teamAMembers: m.teamAMembers || [], teamBMembers: m.teamBMembers || [],
      sets: m.sets || [],
    } });
  });
  return _compAltSort(items);
}

// 보기모드가 '기본'이 아닐 때 대신 렌더할 HTML
function compAltRenderHTML(tabId, items){
  const mode = compAltViewMode(tabId);
  if(mode === 'basic') return '';
  if(!items || !items.length){
    return `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  if(mode === 'broadcast' && typeof histBroadcastModeHTML === 'function') return histBroadcastModeHTML(items, _COMP_ALT_TYPE_INFO);
  if(mode === 'grid' && typeof histAllGridModeHTML === 'function') return histAllGridModeHTML(items, _COMP_ALT_TYPE_INFO);
  if(mode === 'compact' && typeof histAllCompactTableModeHTML === 'function') return histAllCompactTableModeHTML(items, _COMP_ALT_TYPE_INFO);
  if(typeof _histCardGridWithDayHeaders === 'function') return _histCardGridWithDayHeaders(items, _COMP_ALT_TYPE_INFO);
  return '';
}

if(typeof window !== 'undefined'){
  window.COMP_ALT_TAB_IDS = COMP_ALT_TAB_IDS;
  window.compAltViewMode = compAltViewMode;
  window.compAltViewModeBarHTML = compAltViewModeBarHTML;
  window.compAltToggleMode = compAltToggleMode;
  window.compAltToggleBarHTML = compAltToggleBarHTML;
  window.compAltTitleModeBarHTML = compAltTitleModeBarHTML;
  window.compAltLeagueItems = compAltLeagueItems;
  window.compAltBktItems = compAltBktItems;
  window.compAltRecItems = compAltRecItems;
  window.compAltRenderHTML = compAltRenderHTML;
  window.compAltClearMode = compAltClearMode;
}

