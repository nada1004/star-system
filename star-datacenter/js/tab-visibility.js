/* ══════════════════════════════════════════════════════════════
   탭 표시 관리(TabVis) — 탭/하위탭/모드 단위로 PC·모바일 노출 ON/OFF
   - OFF: 로그인(관리자) 상태가 아니면 해당 버튼/요소가 완전히 사라짐(존재 자체를 숨김)
         로그인 상태면 평소처럼 계속 보임(관리자는 항상 접근 가능)
   - 저장: localStorage su_tab_visibility_v1 = { [key]: {pc:1|0, mobile:1|0} }
   - 설정 UI(트리+토글)는 js/settings-render-sec4.js 의 'tabvis' 섹션에서 렌더
   ══════════════════════════════════════════════════════════════ */
(function () {
  if (window.TabVis) return;

  const KEY = 'su_tab_visibility_v1';

  // 트리 레지스트리: 설정 화면에 표시할 계층 구조(탭 > 하위탭 > 하위의하위탭/모드)
  // kind: 'tab' | 'sub' | 'sub2' | 'mode' — 표시용 구분자일 뿐 로직에는 영향 없음.
  // 새 항목을 실제로 숨기려면: (1) 아래 TREE에 등록 + (2) 렌더 코드에서
  //   TabVis.visible('키') 또는 TabVis.gate('키', html) 로 감싸면 됨.
  const TREE = [
    { key: 'main.total', label: '📋 스트리머', kind: 'tab', children: [
        { key: 'total.mode.gallery', label: '🪪 카드형 보기', kind: 'mode' },
        {
          key: 'total.mode.focus', label: '🧾 상세형 보기', kind: 'mode', children: [
            { key: 'total.mode.focus.hero', label: '🖼️ 기본형', kind: 'mode' },
            { key: 'total.mode.focus.photo', label: '📋 포토형', kind: 'mode' },
          ]
        },
        { key: 'total.mode.table', label: '☰ 리스트형 보기', kind: 'mode' },
        { key: 'total.mode.simple', label: '✨ 심플형 보기', kind: 'mode' },
        { key: 'total.mode.designskin', label: '🎨 디자인/레이아웃/UI 스킨', kind: 'mode' },
      ]
    },
    {
      key: 'main.board2', label: '📊 현황판', kind: 'tab', children: [
        { key: 'b2.weekly', label: '📅 브리핑', kind: 'sub' },
        {
          key: 'b2.live', label: '📺 라이브', kind: 'sub', children: [
            { key: 'b2.live.mode.card', label: '🖼️ 카드형', kind: 'mode' },
            { key: 'b2.live.mode.theater', label: '🎬 시청형', kind: 'mode' },
          ]
        },
        {
          key: 'b2.lineup', label: '🎽 라인업', kind: 'sub', children: [
            { key: 'b2.lineup.mode.default', label: '🖼️ 기본 카드 모드', kind: 'mode' },
            { key: 'b2.lineup.mode.stat', label: '📊 통계카드 모드', kind: 'mode' },
            { key: 'b2.lineup.mode.table', label: '🗂️ 테이블 모드', kind: 'mode' },
            { key: 'b2.lineup.mode.intro', label: '🎬 애니메이션 인트로 재생', kind: 'mode' },
          ]
        },
        {
          key: 'b2.univ', label: '🏟️ 대학별', kind: 'sub', children: [
            { key: 'b2.univ.hoverpopup', label: '스트리머 호버 팝업', kind: 'sub2' },
            { key: 'b2.univ.mode.designskin', label: '🎨 디자인모드 스킨', kind: 'mode' },
          ]
        },
        { key: 'b2.femco', label: '🧩 펨코', kind: 'sub' },
        {
          key: 'b2.free', label: '🚶 무소속', kind: 'sub', children: [
            { key: 'b2.free.mode.default', label: '🖼️ 기본', kind: 'mode' },
            { key: 'b2.free.mode.stat', label: '📊 통계카드', kind: 'mode' },
            { key: 'b2.free.mode.table', label: '🗂️ 테이블', kind: 'mode' },
          ]
        },
        { key: 'b2.players', label: '프로필 보기', kind: 'sub' },
        { key: 'b2.ranking', label: '🥇 랭킹', kind: 'sub' },
        { key: 'b2.heatmap', label: '🗺️ 히트맵', kind: 'sub' },
        { key: 'b2.bubble', label: '🌐 버블맵', kind: 'sub' },
        { key: 'b2.summary', label: '📊 요약', kind: 'sub' },
        { key: 'b2.old', label: '📊 구현황판', kind: 'sub' },
      ]
    },
    {
      key: 'main.tier', label: '🎯 티어 순위표', kind: 'tab', children: [
        { key: 'tier.mode.magazine', label: '📷 매거진/룩북 뷰', kind: 'mode' },
        { key: 'tier.mode.podium', label: '🏆 포디움 뷰', kind: 'mode' },
        { key: 'tier.mode.tiergroup', label: '🎖️ 티어별 그룹 뷰', kind: 'mode' },
        { key: 'tier.mode.compact', label: '📝 컴팩트 뷰', kind: 'mode' },
      ]
    },
    // 대전기록/대회/프로리그대회 "보기모드"(기본/그리드/컴팩트/방송형 등)는
    // 아래 _cfgTabVisSectionHTML()의 "🎛️ 대전기록/대회/프로리그대회 보기모드" 표에서
    // mode.<탭id>.<모드id> 키로 이미 전부 관리되므로 여기서는 중복 등록하지 않음.
    // 여기 children은 대전기록/대회 탭 "내부 서브탭 네비게이션" 자체를 관리한다(history-hist-nav.js/competition-core.js).
    {
      key: 'main.hist', label: '🗂️ 대전 기록', kind: 'tab', children: [
        { kind: 'divider', label: '종합' },
        { key: 'hist.sub.all', label: '전체 통합', kind: 'sub' },
        { key: 'hist.sub.psearch', label: '스트리머별 검색', kind: 'sub' },
        { kind: 'divider', label: '개인' },
        { key: 'hist.sub.ind', label: '🎮 개인전', kind: 'sub' },
        { key: 'hist.sub.gj', label: '⚔️ 끝장전', kind: 'sub' },
        { kind: 'divider', label: '팀경기' },
        { key: 'hist.sub.civil', label: '⚔️ 시빌워', kind: 'sub' },
        { key: 'hist.sub.mini', label: '⚡ 미니대전', kind: 'sub' },
        { key: 'hist.sub.univm', label: '🏟️ 대학대전', kind: 'sub' },
        { key: 'hist.sub.ck', label: '🤝 대학CK', kind: 'sub' },
        { kind: 'divider', label: '대회' },
        { key: 'hist.sub.tourney', label: '🎖️ 대회(토너먼트)', kind: 'sub' },
        { key: 'hist.sub.tiertour', label: '🎯 티어대회', kind: 'sub' },
        { kind: 'divider', label: '프로리그' },
        { key: 'hist.sub.pro', label: '🏅 프로리그 일반', kind: 'sub' },
        { key: 'hist.sub.progj', label: '⚔️ 프로리그 끝장전', kind: 'sub' },
        { key: 'hist.sub.procomp', label: '🏆 프로리그 대회 기록', kind: 'sub' },
      ]
    },
    { key: 'main.ind', label: '⚔️ 개인전/끝장전', kind: 'tab' },
    { key: 'main.univm', label: '🏟️ 대학전', kind: 'tab' },
    {
      key: 'main.comp', label: '🏆 대회/티어', kind: 'tab', children: [
        { key: 'comp.sub.normal', label: '🎮 일반', kind: 'sub' },
        { key: 'comp.sub.league', label: '📅 조별리그 일정', kind: 'sub' },
        { key: 'comp.sub.grprank', label: '📊 조별 순위', kind: 'sub' },
        { key: 'comp.sub.tour', label: '🗂️ 대진표', kind: 'sub' },
        { key: 'comp.sub.tourschedule', label: '📋 대진표 기록', kind: 'sub' },
        { key: 'comp.sub.comprank', label: '🏅 개인 순위', kind: 'sub' },
        { key: 'comp.sub.compbrief', label: '📰 대회 브리핑', kind: 'sub' },
        { key: 'comp.sub.tiertour', label: '🎯 티어대회(티어대회 선택 시)', kind: 'sub' },
      ]
    },
    { key: 'main.pro', label: '🥇 프로리그', kind: 'tab' },
    {
      key: 'main.stats', label: '📈 통계', kind: 'tab', children: [
        // ── 🏆 개인 ──
        { kind: 'divider', label: '🏆 개인' },
        { key: 'stats.overview', label: '🏛️ 종합', kind: 'sub' },
        { key: 'stats.tierRank', label: '🚀 티어 랭킹', kind: 'sub' },
        { key: 'stats.levelRank', label: '🎮 레벨/등급 순위표', kind: 'sub' },
        { key: 'stats.starsystem', label: '⭐ 스타시스템', kind: 'sub' },
        { key: 'stats.promosim', label: '🔮 승급 시뮬레이션', kind: 'sub' },
        { key: 'stats.elo', label: '📈 ELO 그래프', kind: 'sub' },
        { key: 'stats.growth', label: '📊 성장 곡선', kind: 'sub' },
        { key: 'stats.award', label: '🏆 이번 주/달 MVP', kind: 'sub' },
        { key: 'stats.records', label: '🎖️ 최다 기록', kind: 'sub' },
        { key: 'stats.killer', label: '🗡️ 킬러/피해자', kind: 'sub' },
        { key: 'stats.streakhist', label: '🔥 역대 연속 기록', kind: 'sub' },
        { key: 'stats.playervs', label: '⚔️ 스트리머 비교', kind: 'sub' },
        // ── 🏛️ 대학 ──
        { kind: 'divider', label: '🏛️ 대학' },
        { key: 'stats.radar', label: '🕸️ 대학 레이더', kind: 'sub' },
        { key: 'stats.univcompare', label: '⚔️ 대학비교', kind: 'sub' },
        { key: 'stats.univmatrix', label: '🏛️ 대학 매트릭스', kind: 'sub' },
        { key: 'stats.univmatrix2', label: '🏛️ 대학 매트릭스+', kind: 'sub' },
        { key: 'stats.univwinbar', label: '📊 대학별 승률', kind: 'sub' },
        { key: 'stats.univstat', label: '🏛️ 대학별 기록', kind: 'sub' },
        { key: 'stats.univrank', label: '🏛️ 대학별 포인트', kind: 'sub' },
        // ── 📊 경기 ──
        { kind: 'divider', label: '📊 경기' },
        { key: 'stats.period', label: '🗓️ 주간/월간 분석', kind: 'sub' },
        { key: 'stats.mismatch', label: '⚡ 미스매치', kind: 'sub' },
        { key: 'stats.heatmap', label: '📅 활동 히트맵', kind: 'sub' },
        { key: 'stats.tierwin', label: '🎯 티어별 승률(개인)', kind: 'sub' },
        { key: 'stats.tiermatch', label: '🎖️ 티어별 승률(팀전)', kind: 'sub' },
        { key: 'stats.maprank', label: '🗺️ 맵별 특화', kind: 'sub' },
        { key: 'stats.race', label: '⚔️ 종족 승률', kind: 'sub' },
        { key: 'stats.racetrend', label: '🔬 종족 트렌드', kind: 'sub' },
        { key: 'stats.seasonal', label: '📅 요일/시즌 승률', kind: 'sub' },
        // ── 🔍 리포트 ──
        { kind: 'divider', label: '🔍 리포트' },
        { key: 'stats.preport', label: '📺 스트리머 리포트', kind: 'sub' },
        { key: 'stats.sharecard', label: '🎴 공유 카드', kind: 'sub' },
        { key: 'stats.csvexport', label: '📥 CSV 내보내기', kind: 'sub' },
      ]
    },
    { key: 'main.cal', label: '🗓️ 캘린더', kind: 'tab' },
    {
      key: 'main.roulette', label: '🎰 룰렛/게임', kind: 'tab', children: [
        // ── 🎰 룰렛·추첨 ──
        { kind: 'divider', label: '🎰 룰렛·추첨' },
        { key: 'roulette.player', label: '🎰 구슬뽑기', kind: 'sub' },
        { key: 'roulette.map', label: '🗺️ 맵뽑기', kind: 'sub' },
        { key: 'roulette.ladder', label: '🪜 사다리', kind: 'sub' },
        { key: 'roulette.duck', label: '🐥 경주', kind: 'sub' },
        { key: 'roulette.wheel', label: '🎡 휠', kind: 'sub' },
        { key: 'roulette.ppopgi', label: '🎁 뽑기', kind: 'sub' },
        { key: 'roulette.teamsplit', label: '👥 팀나누기', kind: 'sub' },
        { key: 'roulette.bracket', label: '🏆 대진표', kind: 'sub' },
        // ── 🎮 미니게임 ──
        { kind: 'divider', label: '🎮 미니게임' },
        { key: 'roulette.teammatch', label: '🧩 소속매칭', kind: 'sub' },
        { key: 'roulette.tiermatch', label: '🎖️ 티어매칭', kind: 'sub' },
        { key: 'roulette.quiz', label: '🖼️ 얼굴맞추기', kind: 'sub' },
        { key: 'roulette.memory', label: '🃏 짝맞추기', kind: 'sub' },
        { key: 'roulette.mole', label: '🐹 두더지', kind: 'sub' },
        { key: 'roulette.omok', label: '⚫⚪ 오목', kind: 'sub' },
        { key: 'roulette.janggi', label: '♟️ 장기', kind: 'sub' },
        { key: 'roulette.othello', label: '🟢 오델로', kind: 'sub' },
      ]
    },
  ];

  function _load() {
    try { return (typeof J === 'function' ? (J(KEY) || {}) : (JSON.parse(localStorage.getItem(KEY) || '{}') || {})); }
    catch (e) { return {}; }
  }
  function _save(m) {
    try {
      if (typeof _lsSave === 'function') _lsSave(KEY, m);
      else localStorage.setItem(KEY, JSON.stringify(m));
    } catch (e) { }
    try { if (window.SettingsStore && typeof window.SettingsStore.markPrefsChanged === 'function') window.SettingsStore.markPrefsChanged(); } catch (e) { }
  }
  function _isMobile() { try { return window.innerWidth <= 768; } catch (e) { return false; } }
  function _loggedIn() {
    try { return !!(typeof isLoggedIn !== 'undefined' ? isLoggedIn : window.isLoggedIn); }
    catch (e) { return false; }
  }

  function _flatten(nodes, out) {
    out = out || [];
    (nodes || []).forEach(n => {
      if (n.kind !== 'divider') out.push(n); // 구분선(divider)은 토글 상태가 없으므로 FLAT 조회 대상에서 제외
      if (n.children) _flatten(n.children, out);
    });
    return out;
  }
  const FLAT = _flatten(TREE);

  function getState(key) {
    const m = _load();
    const v = m[key];
    return { pc: (v && v.pc === 0) ? 0 : 1, mobile: (v && v.mobile === 0) ? 0 : 1 };
  }
  function setState(key, patch) {
    const m = _load();
    const cur = m[key] || { pc: 1, mobile: 1 };
    m[key] = {
      pc: ('pc' in patch) ? (patch.pc ? 1 : 0) : cur.pc,
      mobile: ('mobile' in patch) ? (patch.mobile ? 1 : 0) : cur.mobile,
    };
    _save(m);
    try { apply(); } catch (e) { }
    try { if (typeof curTab !== 'undefined' && curTab === 'cfg' && typeof render === 'function') render(); } catch (e) { }
  }
  function resetAll() {
    _save({});
    try { apply(); } catch (e) { }
    try { if (typeof curTab !== 'undefined' && curTab === 'cfg' && typeof render === 'function') render(); } catch (e) { }
  }

  // 특정 노드 + 그 하위(children) 전체를 한 번에 켜기/끄기 (설정 UI의 "그룹 전체" 버튼용)
  function _descKeys(node, out) {
    out = out || [];
    if (node.kind !== 'divider') out.push(node.key); // 구분선은 실제 저장 키가 없으므로 제외(그렇지 않으면 'undefined' 키가 저장됨)
    (node.children || []).forEach(c => _descKeys(c, out));
    return out;
  }
  function setGroup(key, patch) {
    const node = FLAT.find(n => n.key === key);
    if (!node) return;
    const keys = _descKeys(node);
    const m = _load();
    keys.forEach(k => {
      const cur = m[k] || { pc: 1, mobile: 1 };
      m[k] = {
        pc: ('pc' in patch) ? (patch.pc ? 1 : 0) : cur.pc,
        mobile: ('mobile' in patch) ? (patch.mobile ? 1 : 0) : cur.mobile,
      };
    });
    _save(m);
    try { apply(); } catch (e) { }
    try { if (typeof curTab !== 'undefined' && curTab === 'cfg' && typeof render === 'function') render(); } catch (e) { }
  }
  // 노드(+하위 전체)가 전부 ON인지 확인 (그룹 버튼의 현재 상태 표시용)
  function groupAllOn(key, field) {
    const node = FLAT.find(n => n.key === key);
    if (!node) return true;
    return _descKeys(node).every(k => getState(k)[field]);
  }
  // TREE에 등록되지 않은 임의의 키 목록(예: 동적 모드 그룹)을 한 번에 켜기/끄기
  function setMany(keys, patch) {
    if (!Array.isArray(keys) || !keys.length) return;
    const m = _load();
    keys.forEach(k => {
      const cur = m[k] || { pc: 1, mobile: 1 };
      m[k] = {
        pc: ('pc' in patch) ? (patch.pc ? 1 : 0) : cur.pc,
        mobile: ('mobile' in patch) ? (patch.mobile ? 1 : 0) : cur.mobile,
      };
    });
    _save(m);
    try { apply(); } catch (e) { }
    try { if (typeof curTab !== 'undefined' && curTab === 'cfg' && typeof render === 'function') render(); } catch (e) { }
  }
  function allOn(keys, field) {
    if (!Array.isArray(keys) || !keys.length) return true;
    return keys.every(k => getState(k)[field]);
  }

  // key가 미등록이어도 항상 동작(등록 여부와 무관하게 저장된 값 기준으로 판단)
  function visible(key) {
    if (!key) return true;
    const st = getState(key);
    const on = _isMobile() ? st.mobile : st.pc;
    if (on) return true;
    return _loggedIn();
  }
  function gate(key, html) {
    return visible(key) ? html : '';
  }
  // 배열형 탭 정의({id,...})를 id 접두사(prefix)로 필터링
  function filterDefs(defs, prefix, idField) {
    idField = idField || 'id';
    if (!Array.isArray(defs)) return defs;
    return defs.filter(it => visible(prefix + '.' + it[idField]));
  }

  // 메인 탭바(.tab 버튼, index.html)에 즉시 적용
  function apply() {
    try {
      document.querySelectorAll('.tab[onclick*="sw("]').forEach(btn => {
        try {
          const oc = btn.getAttribute('onclick') || '';
          const m = oc.match(/sw\(['"]([^'"]+)['"]/);
          const id = m ? m[1] : '';
          if (!id) return;
          const key = 'main.' + id;
          if (!FLAT.some(n => n.key === key)) return; // 등록되지 않은(고정) 탭은 건드리지 않음
          btn.style.display = visible(key) ? '' : 'none';
        } catch (e) { }
      });
    } catch (e) { }
  }

  window.addEventListener('resize', () => { try { apply(); } catch (e) { } });
  document.addEventListener('DOMContentLoaded', () => { try { apply(); } catch (e) { } });

  window.TabVis = { KEY, TREE, FLAT, getState, setState, resetAll, setGroup, groupAllOn, setMany, allOn, visible, gate, filterDefs, apply, isMobile: _isMobile, isLoggedIn: _loggedIn };
})();
