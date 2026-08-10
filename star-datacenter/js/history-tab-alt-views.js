/* ══════════════════════════════════════════════════════════════
   대전기록 - 개별 탭(개인전/끝장전/대학전/프로리그) 보기모드 확장
   (신규기능, 2026-08-10, histviewmodes2)
   종합〉전체 통합 탭에 있던 미니카드(기본)/그리드/컴팩트 테이블형 렌더러를
   history-all-html.js에서 재사용해, 개인전·끝장전·프로리그 끝장전·대학전·
   프로리그(일반) 탭에도 "기본(기존 화면) / 미니 기본 / 그리드 / 컴팩트 테이블형"
   4종 보기모드를 추가한다. 기존 화면은 손대지 않고 '기본'으로 그대로 유지.
   (확장, 2026-08-10) 별도 상단탭인 "대학대전" 입력/관리 화면(시빌워/미니대전/
   대학대전/대학CK, match-builder-mini.js·match-builder-ck.js·match-builder-univ.js)
   의 "📋 기록" 화면에도 동일한 메커니즘을 재사용해 4종 보기모드를 추가한다.
   ══════════════════════════════════════════════════════════════ */

// 이 확장이 적용되는 탭 목록
// (대전기록 탭) ind/gj/progj/univm/pro
// (대학대전 입력탭) mini/civil/ck — univm은 두 위치에서 공유
const HIST_TAB_ALT_VIEW_IDS = ['ind', 'gj', 'progj', 'univm', 'pro', 'mini', 'civil', 'ck'];

function _histTabAltSupported(tabId){
  return HIST_TAB_ALT_VIEW_IDS.includes(tabId);
}

// 탭별 허용되는 보기모드 (기본값: 4종 전부)
// (요청, 2026-08-10) 대학CK/시빌워는 팀원이 많아 나열형이라 그리드·컴팩트 테이블형이
// 어울리지 않는다는 피드백에 따라 기본/미니 기본 2종만 노출
const _HIST_TAB_ALT_ALLOWED_MODES = {
  ck: ['basic', 'mini'],
  civil: ['basic', 'mini'],
  // (요청, 2026-08-10) 대전기록 > 대회 / 티어대회 : 기본·그리드·컴팩트 테이블형 3종
  histtourney: ['basic', 'mini', 'grid', 'compact'],
  histtt: ['basic', 'mini', 'grid', 'compact'],
  // (요청, 2026-08-10) 일반대회 조별리그 : 기본(기존 화면) + 미니 기본 / 그리드 토글
  cpleague: ['basic', 'mini', 'grid'],
  // (요청, 2026-08-10) 프로리그 대회 > 팀전 : 대학CK처럼 팀원이 많이 나열돼 컴팩트 테이블형은
  // 어울리지 않는다는 피드백에 따라 기본/미니 기본/그리드 3종만 노출 (컴팩트 테이블형 제외)
  pcteam: ['basic', 'mini', 'grid'],
};

function _histTabAltAllowedModes(tabId){
  return _HIST_TAB_ALT_ALLOWED_MODES[tabId] || ['basic', 'mini', 'grid', 'compact'];
}

// 탭별 보기모드 상태 (localStorage 키: su_hist_tab_view_mode_<tabId>)
window._histTabViewMode = window._histTabViewMode || {};
function getHistTabViewMode(tabId){
  if(window._histTabViewMode[tabId]) return window._histTabViewMode[tabId];
  let v = 'basic';
  try{ v = localStorage.getItem('su_hist_tab_view_mode_' + tabId) || 'basic'; }catch(e){}
  const allowed = _histTabAltAllowedModes(tabId);
  if(!allowed.includes(v)) v = 'basic';
  window._histTabViewMode[tabId] = v;
  return v;
}
function setHistTabViewMode(tabId, mode){
  const allowed = _histTabAltAllowedModes(tabId);
  const v = allowed.includes(mode) ? mode : 'basic';
  window._histTabViewMode = window._histTabViewMode || {};
  window._histTabViewMode[tabId] = v;
  try{ localStorage.setItem('su_hist_tab_view_mode_' + tabId, v); }catch(e){}
  window._histTabAltPage = window._histTabAltPage || {};
  window._histTabAltPage[tabId] = 0;
  render();
}

// 정렬 버튼 옆에 배치할 보기모드 전환 버튼줄
// bare=true면 감싸는 div 없이 버튼만 반환(기존 정렬 버튼줄 안에 이어붙이기용)
function histTabViewModeBarHTML(tabId, bare){
  const _cur = getHistTabViewMode(tabId);
  const _allModes = [
    { id: 'basic', lbl: '🗂 기본' },
    { id: 'mini', lbl: '🗂 미니 기본' },
    { id: 'grid', lbl: '🖼 그리드' },
    { id: 'compact', lbl: '📊 컴팩트 테이블형' },
  ];
  const _allowed = _histTabAltAllowedModes(tabId);
  const _modes = _allModes.filter(mo => _allowed.includes(mo.id));
  const _btns = _modes.map(mo =>
    `<button class="pill ${_cur === mo.id ? 'on' : ''}" style="flex-shrink:0;white-space:nowrap" onclick="setHistTabViewMode('${tabId}','${mo.id}')">${mo.lbl}</button>`
  ).join('');
  return bare ? _btns : `<div class="hist-ctrl-group" style="flex-shrink:0">${_btns}</div>`;
}

// 미니 기본/그리드/컴팩트 테이블형에서 공통으로 쓰는 타입 라벨/색상
const _HIST_TAB_ALT_TYPE_INFO = {
  ind: { lbl: '개인전', col: '#16a34a' },
  gj: { lbl: '끝장전', col: '#16a34a' },
  progj: { lbl: '프로리그 끝장전', col: '#0ea5e9' },
  univm: { lbl: '대학대전', col: '#2563eb' },
  pro: { lbl: '프로리그', col: '#0ea5e9' },
  mini: { lbl: '미니대전', col: '#7c3aed' },
  civil: { lbl: '시빌워', col: '#dc2626' },
  ck: { lbl: '대학CK', col: '#d97706' },
};

// 탭별 원본 데이터를 종합탭(histAllHTML)과 동일한 {type,d,m,idx} 아이템 배열로 정규화
function _histTabAltItems(tabId){
  const items = [];
  const _passDate = (d, key) => (typeof passDateFilter !== 'function') || passDateFilter(d || '', key);
  if(tabId === 'ind'){
    const src = (typeof indM !== 'undefined' && Array.isArray(indM)) ? indM : [];
    src.forEach((m, idx) => {
      if(!m || !m.wName || !m.lName) return;
      if(!_passDate(m.d, 'ind')) return;
      items.push({ type: 'ind', d: m.d || '', m, idx });
    });
  } else if(tabId === 'gj' || tabId === 'progj'){
    const src = (typeof gjM !== 'undefined' && Array.isArray(gjM)) ? gjM : [];
    src.forEach((m, idx) => {
      if(!m || !m.wName || !m.lName) return;
      const isPro = !!m._proLabel;
      if(tabId === 'progj' && !isPro) return;
      if(tabId === 'gj' && isPro) return;
      if(!_passDate(m.d, tabId)) return;
      items.push({ type: tabId, d: m.d || '', m, idx });
    });
  } else if(tabId === 'univm'){
    const src = (typeof univM !== 'undefined' && Array.isArray(univM)) ? univM : [];
    src.forEach((m, idx) => {
      if(!m || !m.a || !m.b) return;
      if(m.sa == null || m.sa === '' || m.sb == null || m.sb === '') return;
      if(!_passDate(m.d, 'univm')) return;
      items.push({ type: 'univm', d: m.d || '', m, idx });
    });
  } else if(tabId === 'pro'){
    const src = (typeof proM !== 'undefined' && Array.isArray(proM)) ? proM : [];
    src.forEach((m, idx) => {
      if(!m || !m.teamAMembers || !m.teamBMembers) return;
      if(m.sa == null || m.sa === '' || m.sb == null || m.sb === '') return;
      if(!_passDate(m.d, 'pro')) return;
      items.push({ type: 'pro', d: m.d || '', m, idx });
    });
  } else if(tabId === 'mini'){
    // "대학대전" 입력탭 내 미니대전(civil 아님) 기록
    const src = (typeof miniM !== 'undefined' && Array.isArray(miniM)) ? miniM : [];
    src.forEach((m, idx) => {
      if(!m || (m.type || 'mini') !== 'mini') return;
      if(!m.a || !m.b) return;
      if(m.sa == null || m.sa === '' || m.sb == null || m.sb === '') return;
      if(!_passDate(m.d, 'mini')) return;
      items.push({ type: 'mini', d: m.d || '', m, idx });
    });
  } else if(tabId === 'civil'){
    // "대학대전" 입력탭 내 시빌워 기록 (miniM 배열 공유, type==='civil')
    const src = (typeof miniM !== 'undefined' && Array.isArray(miniM)) ? miniM : [];
    src.forEach((m, idx) => {
      if(!m || !(m.type === 'civil' || (m.a === 'A팀' && m.b === 'B팀'))) return;
      if(!m.a || !m.b) return;
      if(m.sa == null || m.sa === '' || m.sb == null || m.sb === '') return;
      if(!_passDate(m.d, 'mini')) return;
      items.push({ type: 'civil', d: m.d || '', m, idx });
    });
  } else if(tabId === 'ck'){
    const src = (typeof ckM !== 'undefined' && Array.isArray(ckM)) ? ckM : [];
    src.forEach((m, idx) => {
      if(!m || !m.teamAMembers || !m.teamBMembers) return;
      if(m.sa == null || m.sa === '' || m.sb == null || m.sb === '') return;
      if(!_passDate(m.d, 'ck')) return;
      items.push({ type: 'ck', d: m.d || '', m, idx });
    });
  }
  const dir = (typeof recSortDir !== 'undefined' && recSortDir === 'asc') ? 'asc' : 'desc';
  items.sort((a, b) => dir === 'asc' ? (a.d || '').localeCompare(b.d || '') : (b.d || '').localeCompare(a.d || ''));
  return items;
}

// tabId의 보기모드가 '기본(basic)'이 아닐 때 대신 렌더할 HTML
function histTabAltRecordsHTML(tabId){
  const items = _histTabAltItems(tabId);
  if(!items.length){
    return `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  const pageSize = (typeof getHistPageSize === 'function') ? getHistPageSize() : 20;
  window._histTabAltPage = window._histTabAltPage || {};
  if(window._histTabAltPage[tabId] === undefined) window._histTabAltPage[tabId] = 0;
  const _loadedCount = (window._histTabAltPage[tabId] + 1) * pageSize;
  const paged = items.slice(0, _loadedCount);
  const _hasMore = items.length > paged.length;
  const mode = getHistTabViewMode(tabId);

  let h = '';
  if(mode === 'grid') h += histAllGridModeHTML(paged, _HIST_TAB_ALT_TYPE_INFO);
  else if(mode === 'compact') h += histAllCompactTableModeHTML(paged, _HIST_TAB_ALT_TYPE_INFO);
  else h += _histCardGridWithDayHeaders(paged, _HIST_TAB_ALT_TYPE_INFO); // '미니 기본'

  if(items.length > pageSize){
    h += `<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap">
      <span style="font-size:var(--fs-sm);color:var(--gray-l)">${paged.length} / ${items.length}건 표시 중</span>
      ${_hasMore ? `<button class="btn btn-sm" onclick="window._histTabAltPage['${tabId}']=${window._histTabAltPage[tabId] + 1};render()">더 보기 ↓</button>` : ''}
      ${window._histTabAltPage[tabId] > 0 ? `<button class="btn btn-sm btn-w" onclick="window._histTabAltPage['${tabId}']=0;render()">처음으로</button>` : ''}
    </div>`;
  }
  return h;
}

// history-render-tabs.js에서 호출: tabId 탭의 본문 HTML을 만든다.
// 보기모드가 '기본'이면 기존 렌더 함수(basicRenderFn)를 그대로 쓰고,
// 그 외 모드면 미니 기본/그리드/컴팩트 테이블형으로 대체한다.
// opts.suppressBar=true면 자체 보기모드 버튼줄(우측 정렬 줄)을 생략한다.
// (예: match-builder-mini/ck/univ.js처럼 정렬 버튼줄 안에 이미 버튼을 붙여둔 경우)
function histTabWithViewModes(tabId, basicRenderFn, opts){
  if(!_histTabAltSupported(tabId)){
    return typeof basicRenderFn === 'function' ? basicRenderFn() : '';
  }
  const mode = getHistTabViewMode(tabId);
  const suppressBar = !!(opts && opts.suppressBar);
  const bar = suppressBar ? '' : `<div class="no-export" style="display:flex;justify-content:flex-end;margin-bottom:8px">${histTabViewModeBarHTML(tabId)}</div>`;
  const body = (mode === 'basic')
    ? (typeof basicRenderFn === 'function' ? basicRenderFn() : '')
    : histTabAltRecordsHTML(tabId);
  return bar + body;
}
