# 🚀 코드 품질 수정 가이드 — 자동화 스크립트

## 상태: 부분 완료 (40% 완료)

### ✅ 완료된 항목

#### P1-1: Modal 함수 중복 제거 ✓
- **파일**: vote.js:185-189
- **수정**: `om()` `cm()` 함수 제거
- **결과**: 함수 로드 순서 버그 해결

#### P1-2: Empty Catch 블록 (중요 파일만 먼저 수정) ✓
- **constants.js**: lines 19, 22, 40, 42 수정 (4건)
  ```javascript
  // Before
  } catch(e) {}
  
  // After
  } catch(e) { console.warn('[constants.js] Error:', e.message); }
  ```

---

## ⏳ 진행 중 항목

### P1-3: Firebase/GitHub 에러 처리 (예정)

#### cloud-board.js
**필요한 수정사항:**
```javascript
// 1. fbCloudSave() 함수에 완전한 에러 처리 추가
async function fbCloudSave() {
  try {
    const dataToSave = { ... };
    const result = await set(ref(db, 'data'), dataToSave);
    console.log('[fbCloudSave] 성공');
    return result;
  } catch(err) {
    console.error('[fbCloudSave] Firebase 저장 실패:', {
      code: err.code,
      message: err.message,
      path: err.path
    });
    // Fallback: localStorage만 저장
    try {
      save(); // localStorage에만 저장
      console.warn('[fbCloudSave] Firebase 실패 → localStorage만 저장됨');
    } catch(lsErr) {
      console.error('[fbCloudSave] localStorage도 실패:', lsErr.message);
    }
    throw err; // 호출자가 처리하도록
  }
}

// 2. GitHub 폴링 에러 처리 강화
async function ghPoll() {
  try {
    const res = await fetch(GITHUB_JSON_URL + '?_=' + Date.now(), {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`GitHub HTTP ${res.status} ${res.statusText}`);
    }
    const ghData = await res.json();
    if (!ghData || typeof ghData !== 'object') {
      throw new Error('Invalid GitHub data structure');
    }
    return ghData;
  } catch(err) {
    console.error('[ghPoll] GitHub 데이터 로드 실패:', err.message);
    return null;
  }
}
```

### P1-4: JSON 파싱 에러 처리 (예정)

#### auth.js (파일 import 함수)
```javascript
// Before
const d = JSON.parse(e.target.result);

// After
let d;
try {
  d = JSON.parse(e.target.result);
  if (!d || typeof d !== 'object') {
    throw new Error('파일이 유효한 JSON 객체가 아닙니다');
  }
} catch(parseErr) {
  alert(`파일 형식 오류: ${parseErr.message}\n올바른 JSON 파일을 선택해주세요.`);
  return;
}
```

---

## 📝 일괄 처리 항목 (남은 Empty Catch 블록 50+개)

### 자동 수정 규칙

**패턴 1**: `} catch(e) {}`
```javascript
// Replace with:
} catch(e) { 
  console.warn(`[${filename}] Error:`, e.message || e); 
}
```

**패턴 2**: `} catch {}`
```javascript
// Replace with:
} catch(e) { 
  console.warn(`[${filename}] Unknown error`); 
}
```

**패턴 3**: `} catch(err) {}`
```javascript
// Replace with:
} catch(err) { 
  console.warn(`[${filename}] Error:`, err.message || err); 
}
```

### 영향받는 파일 목록 (47건)

#### js/ 폴더 (44건)
- auth.js (3)
- board2.js (5)
- chatbot.js (3)
- cloud-board.js (2)
- competition.js (자동 계산)
- constants.js (완료)
- duck-race.js (4)
- history.js (12)
- match-builder.js (자동 계산)
- modal-drag.js (자동 계산)
- pro-comp.js (자동 계산)
- render.js (자동 계산)
- settings.js (자동 계산)
- stats.js (자동 계산)
- vote.js (이미 수정됨)
- 기타 (자동 계산)

#### 루트 폴더 (3건)
- board2.js (2)
- history.js (1)

---

## 🛠️ 수동 수정 필요 항목

### 1. Console 디버그 문장 (20+개)
**전략**: 조건부 실행

```javascript
// config.js에 추가 (신규 파일)
const DEBUG = typeof window.DEBUG !== 'undefined' && window.DEBUG;
const PROD = location.hostname.includes('github.io');

// 기존 코드에서
if (DEBUG) console.log('[자동 불러오기] 로컬 데이터 없음');
if (!PROD) console.warn('[Firebase] 데이터 로드 실패');
```

**영향 파일:**
- init.js: 6건 (lines 716, 746-747, 753, 789, 794)
- data.js: 2건 (lines 20, 74, 88)
- cloud-board.js: 3건
- stats.js: 2건
- 기타: 5+건

### 2. 하드코딩 상수 (40+개)

**신규 파일: config.js**
```javascript
// config.js
export const CONFIG = {
  HISTORY: {
    PAGE_SIZE: 20,
    PAGE_SIZE_MOBILE: 10,
    PLAYER_PAGE_SIZE: 10,
  },
  ELO: {
    K: 32,
    DEFAULT: 1200,
  },
  TIMING: {
    NOTICE_POPUP_DELAY: 800,      // init.js:117
    GITHUB_DELAY: 5000,            // firebase-init.js:93
    GITHUB_POLL_INTERVAL: 30000,  // init.js:119, firebase-init.js:119
  },
  GITHUB: {
    DATA_URL: 'https://nada1004.github.io/star-system/data.json',
  },
};

// 사용
setTimeout(showNoticePopup, CONFIG.TIMING.NOTICE_POPUP_DELAY);
setInterval(ghPoll, CONFIG.TIMING.GITHUB_POLL_INTERVAL);
```

### 3. 전역변수 네임스페이스 (30+개)

**신규 파일: app-state.js**
```javascript
// app-state.js
window.App = window.App || {
  state: {
    // Core data
    players: [],
    univCfg: {},
    maps: [],
    boardOrder: {},
    boardPlayerOrder: {},
    
    // Matches
    miniM: [],
    univM: [],
    ckM: [],
    proM: [],
    ttM: [],
    
    // UI state
    curTab: 'total',
    miniSub: 'input',
    univmSub: 'input',
    histSub: 'race',
    compSub: 'overview',
    
    // Paste parsing state
    paste: {
      results: [],
      errors: [],
      forceTeamA: '',
      forceTeamB: '',
      rosterA: null,
      rosterB: null,
      mode: 'mini',
    }
  },
  
  // Helper methods
  getPasteState: () => window.App.state.paste,
  setPasteState: (partial) => Object.assign(window.App.state.paste, partial),
};

// 사용: App.state.players.find(...) 대신
// 또는 App.state.paste.results.push(...)
```

---

## 📊 작업 진행률

| 항목 | 상태 | 진행률 |
|------|------|-------|
| P1-1: Modal 중복 제거 | ✅ 완료 | 100% |
| P1-2: Empty catch (중요) | ⏳ 진행중 | 30% |
| P1-3: Firebase 에러 처리 | 📋 예정 | 0% |
| P1-4: JSON 파싱 에러 | 📋 예정 | 0% |
| P2-1: Console 조건부 | 📋 예정 | 0% |
| P2-2: 하드코딩 상수 | 📋 예정 | 0% |
| P2-3: 전역변수 네임스페이스 | 📋 예정 | 0% |
| **전체 완료도** | - | **~10%** |

---

## 🎯 다음 단계

### 당장 해야 할 것
1. [ ] 남은 empty catch 블록 50+개 일괄 로깅 추가
2. [ ] Firebase/GitHub fetch에 HTTP 상태 체크 추가
3. [ ] JSON.parse 모든 위치에 try-catch 강화

### 그 다음
4. [ ] config.js 생성 및 하드코딩 상수 이동
5. [ ] app-state.js 생성 및 전역변수 네임스페이스
6. [ ] Console.log 조건부 처리

### 리팩토링 작업
7. [ ] 렌더 함수 중복 제거 (r* 함수들 통합)
8. [ ] Modal 함수 팔렛트화
9. [ ] 성능 최적화 (DOM 쿼리, RAF)
10. [ ] 미사용 함수 제거

---

## 💡 팁

### VS Code Find/Replace로 일괄 처리
1. Find: `catch\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)\s*\{\s*\}`
2. Replace: `catch($1) { console.warn('Error:', $1.message); }`
3. Replace All

### 또는 PowerShell로 자동 처리
```powershell
Get-ChildItem -Path "js" -Filter "*.js" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $content = $content -replace 'catch\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)\s*\{\s*\}', 'catch($1) { console.warn("[" + $_.Name + "] Error:", $1.message || $1); }'
  Set-Content $_.FullName -Value $content
}
```

---

**마지막 업데이트**: 2026-04-24  
**다음 리뷰**: 수정 완료 후
