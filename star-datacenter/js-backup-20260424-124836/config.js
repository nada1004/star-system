/* ══════════════════════════════════════
   설정 상수 (하드코딩된 값들을 한곳에 정리)
   변경 사항이 있으면 이 파일만 수정하면 됨
══════════════════════════════════════ */

const CONFIG = {
  // UI 페이지네이션
  HISTORY: {
    PAGE_SIZE: 20,           // 데스크톱 대전기록 한 페이지
    PAGE_SIZE_MOBILE: 10,    // 모바일 대전기록 한 페이지
    PLAYER_PAGE_SIZE: 10,    // 선수별 기록 한 페이지
  },

  // ELO 레이팅 시스템
  ELO: {
    K: 32,           // K-factor (한 경기당 ELO 변화량)
    DEFAULT: 1200,   // 신입 선수 기본 ELO
  },

  // 타이밍 (밀리초)
  TIMING: {
    NOTICE_POPUP_DELAY: 800,           // 공지 팝업 표시 지연
    INIT_PARAM_CHECK_DELAY: 1200,      // URL 파라미터 확인 지연
    GITHUB_FIRST_CHECK_DELAY: 5000,    // 첫 GitHub 체크 지연 (Firebase 완성 대기)
    GITHUB_POLL_INTERVAL: 30000,       // GitHub 폴링 주기
    MODAL_DRAG_THRESHOLD_PX: 3,        // 모달 드래그 감지 픽셀
  },

  // GitHub 데이터 소스
  GITHUB: {
    DATA_URL: 'https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data.json',
  },

  // 기능 플래그
  DEBUG: typeof window.DEBUG !== 'undefined' && window.DEBUG,
  PROD: typeof location !== 'undefined' && location.hostname.includes('github.io'),

  // 선수 모양 기본값
  PROFILE: {
    SHAPE: 'circle',  // 'circle' or 'square'
    SIZE_DEFAULT: 34,
    BOX_SIZE_DEFAULT: 46,
  },

  // 토너먼트 기본 구조
  TOURNAMENT: {
    EMPTY_TIER_COUNT: 15,  // Array(15).fill('')로 생성되는 티어 수
  },

  // 로컬스토리지 키 접두사
  STORAGE_PREFIX: 'su_',

  // 레이저 차트 기본값
  CHART: {
    PLAYER_RADAR_MAX: 100,
  },
};

// DEBUG 모드에서만 콘솔 출력 활성화
window.LOG = function(tag, ...args) {
  if (CONFIG.DEBUG) {
    console.log(`[${tag}]`, ...args);
  }
};

window.WARN = function(tag, ...args) {
  if (CONFIG.DEBUG || !CONFIG.PROD) {
    console.warn(`[${tag}]`, ...args);
  }
};

window.ERROR = function(tag, ...args) {
  console.error(`[${tag}]`, ...args);
};
