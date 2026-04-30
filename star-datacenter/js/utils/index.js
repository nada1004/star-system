/* ══════════════════════════════════════
   유틸리티 함수 중앙화
   - 중복되는 유틸리티 함수를 단일 파일로 통합
   - 전역 escHTML 함수 정의 (기존 호환성 유지)
══════════════════════════════════════ */

// HTML escape (XSS 방지)
function escHTML(s){
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 전역에 노출 (기존 코드 호환성 유지)
window.escHTML = escHTML;

// 일반 escape (설정 화면 템플릿용)
function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

// 고유 ID 생성
function genId(){
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 날짜 포맷 (YYYY-MM-DD)
function formatDate(date){
  if(!date) return '';
  const d = new Date(date);
  if(isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 안전한 배열 변환
function safeArr(x){
  return Array.isArray(x) ? x : [];
}

// 안전한 문자열 변환
function safeStr(x){
  return (x == null) ? '' : String(x);
}

// 객체 깊은 복사
function cloneDeep(obj){
  try{
    return JSON.parse(JSON.stringify(obj));
  }catch(e){
    return obj;
  }
}

// 로컬 스토리지 래퍼
const Storage = {
  get(key, defaultValue){
    try{
      const raw = localStorage.getItem(key);
      if(raw === null) return defaultValue;
      // LZString 압축 데이터 자동 해제
      if(raw.startsWith('{') || raw.startsWith('[')){
        try{
          return JSON.parse(raw);
        }catch(e){
          return raw;
        }
      }
      return raw;
    }catch(e){
      return defaultValue;
    }
  },
  set(key, value){
    try{
      if(typeof value === 'object'){
        localStorage.setItem(key, JSON.stringify(value));
      }else{
        localStorage.setItem(key, String(value));
      }
      return true;
    }catch(e){
      console.warn('[Storage.set] failed:', e.message);
      return false;
    }
  },
  remove(key){
    try{
      localStorage.removeItem(key);
      return true;
    }catch(e){
      return false;
    }
  }
};

// ─────────────────────────────────────────────────────────────
// 에러 핸들러 (중앙화된 예외 처리)
// ─────────────────────────────────────────────────────────────
class AppError extends Error {
  constructor(message, code = 'UNKNOWN', context = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

const ErrorHandler = {
  // 에러 코드 정의
  codes: {
    NETWORK: 'NETWORK_ERROR',
    STORAGE: 'STORAGE_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    RENDER: 'RENDER_ERROR',
    DATA: 'DATA_ERROR',
    AUTH: 'AUTH_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
  },

  // 에러 처리
  handle(error, context = 'Unknown', options = {}) {
    const { silent = false, log = true } = options;
    
    if (log) {
      console.error(`[${context}]`, error);
    }

    // 사용자 알림 (silent가 아닌 경우)
    if (!silent && typeof window.showToast === 'function') {
      const message = this.getUserMessage(error);
      window.showToast(message, 'error');
    }

    // 에러 로깅 서비스 전송 (나중에 구현)
    // this.logToService(error, context);
  },

  // 사용자 친화적 메시지 생성
  getUserMessage(error) {
    if (error instanceof AppError) {
      const messages = {
        [this.codes.NETWORK]: '네트워크 오류가 발생했습니다.',
        [this.codes.STORAGE]: '데이터 저장 오류가 발생했습니다.',
        [this.codes.VALIDATION]: '입력값을 확인해주세요.',
        [this.codes.RENDER]: '화면 표시 오류가 발생했습니다.',
        [this.codes.DATA]: '데이터 처리 오류가 발생했습니다.',
        [this.codes.AUTH]: '인증 오류가 발생했습니다.'
      };
      return messages[error.code] || error.message || '오류가 발생했습니다.';
    }
    return error.message || '오류가 발생했습니다.';
  },

  // 안전한 함수 실행 (래퍼)
  safe(fn, context = 'Unknown', options = {}) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, context, options);
        if (options.defaultValue !== undefined) {
          return options.defaultValue;
        }
        return null;
      }
    };
  },

  // 비동기 안전 실행
  safeAsync(fn, context = 'Unknown', options = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, context, options);
        if (options.defaultValue !== undefined) {
          return options.defaultValue;
        }
        return null;
      }
    };
  }
};

// 유틸리티 객체로 내보내기
const Utils = {
  escHTML,
  esc,
  genId,
  formatDate,
  safeArr,
  safeStr,
  cloneDeep,
  Storage,
  ErrorHandler,
  AppError
};

// 전역에 노출
window.Utils = Utils;
window.ErrorHandler = ErrorHandler;
window.AppError = AppError;
