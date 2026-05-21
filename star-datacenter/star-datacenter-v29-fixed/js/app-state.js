/* ══════════════════════════════════════
   App 전역 상태 네임스페이스
   모든 전역 변수를 App.state 객체로 통합
   로드 순서: constants.js → config.js → app-state.js
══════════════════════════════════════ */

if (!window.App) {
  window.App = {};
}

// 상태 관리 객체
window.App.state = {
  // ─── Core Data (constants.js에서 초기화됨)
  players: [],
  univCfg: {},
  maps: [],
  mapAlias: {},
  boardOrder: [],
  boardPlayerOrder: {},
  userMapAlias: {},
  playerStatusIcons: {},
  notices: [],
  seasons: [],
  curTab: 'total',

  // ─── Match Records
  miniM: [],
  univM: [],
  ckM: [],
  proM: [],
  ttM: [],
  indM: [],
  gjM: [],

  // ─── Tournaments & Competitions
  tourneys: [],
  comps: [],
  compNames: [],
  curComp: '',
  proTourneys: [],
  curProComp: '',

  // ─── Filtering & Sorting
  filterYear: '전체',
  filterMonth: '전체',
  yearOptions: [],
  fUniv: '',
  fTier: '',

  // ─── UI Sub-tabs
  miniSub: 'input',
  univmSub: 'input',
  ckSub: 'input',
  histSub: 'race',
  histSub2: 'mini',
  statsSub: 'u',
  compSub: 'league',

  // ─── 1v1 Comparison
  vsNameA: '',
  vsNameB: '',
  vsModeFilter: 'total',

  // ─── Paste Parsing System
  paste: {
    results: [],
    errors: [],
    forceTeamA: '',
    forceTeamB: '',
    rosterA: null,
    rosterB: null,
    rosterMode: 'manual',  // 'manual' or 'auto'
    matchMode: 'game',     // 'game' or 'set'
    forcedMode: null,      // 'mini', 'univm', 'comp', null
    grpPasteMode: false,   // 대회 세트 적용 모드
    previewMode: 'auto',   // 'auto' or 'manual'
  },

  // ─── Pro Paste System
  proPaste: {
    results: [],
    errors: [],
    format: 0,             // 2:2, 3:3, 4:4 등
    matchDates: {},        // matchGroup별 날짜
    currentMatch: 0,
    currentSet: 0,
  },

  // ─── Vote Data
  voteData: {},

  // ─── Authentication
  isLoggedIn: false,
  isSubAdmin: false,

  // ─── Board Settings
  boardMemoMode: 'none',
  boardNoteMode: 'none',

  // ─── Calendar
  calView: 'month',        // 'month', 'week', 'day'
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth() + 1,
  calWeekOffset: 0,
  calDayDate: null,
  calScheduled: [],

  // ─── Tier Tour
  _ttCurComp: '',
  _ttSub: 'records',

  // ─── History Extension
  histExtTarget: '',
  histExtProxy: '',
};

// ─── Helper Methods

/**
 * 붙여넣기 상태 초기화
 */
window.App.resetPasteState = function(forcedMode = null) {
  window.App.state.paste = {
    results: [],
    errors: [],
    forceTeamA: '',
    forceTeamB: '',
    rosterA: null,
    rosterB: null,
    rosterMode: 'manual',
    matchMode: 'game',
    forcedMode: forcedMode,
    grpPasteMode: false,
    previewMode: 'auto',
  };
};

/**
 * Pro 붙여넣기 상태 초기화
 */
window.App.resetProPasteState = function() {
  window.App.state.proPaste = {
    results: [],
    errors: [],
    format: 0,
    matchDates: {},
    currentMatch: 0,
    currentSet: 0,
  };
};

/**
 * 투표 데이터 초기화
 */
window.App.resetVoteData = function() {
  window.App.state.voteData = {};
};

/**
 * 필터 초기화
 */
window.App.resetFilters = function() {
  window.App.state.filterYear = '전체';
  window.App.state.filterMonth = '전체';
  window.App.state.fUniv = '';
  window.App.state.fTier = '';
};

/**
 * 상태 일괄 설정 (부분 업데이트)
 */
window.App.setState = function(partial) {
  if (typeof partial === 'object' && partial !== null) {
    Object.assign(window.App.state, partial);
  }
};

/**
 * 현재 상태 스냅샷 가져오기
 */
window.App.getState = function() {
  return JSON.parse(JSON.stringify(window.App.state));
};

/**
 * 상태 변경 감지 콜백 등록 (향후 확장용)
 */
window.App.onStateChange = function(callback) {
  // 향후 상태 변경 이벤트 시스템 추가
  // window.App._stateChangeCallbacks = window.App._stateChangeCallbacks || [];
  // window.App._stateChangeCallbacks.push(callback);
};
