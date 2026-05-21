# 상세 상태 alias 제거 준비 문서

> 최종 업데이트: 2026-05-01
> 목적: 선수 상세/대학 상세 상태를 레거시 전역 alias 없이도 유지할 수 있도록 준비 상태를 정리

---

## 1. 현재 상태

상세 상태는 이제 두 개의 객체로 모이기 시작했다.

- `PlayerDetailState`
- `UnivDetailState`

그리고 기존 전역 이름은 `constants.js`에서 alias로 연결된다.

예:

- `_playerModalCurrentName`
- `_playerModalYear`
- `_playerModalYears`
- `_playerHistFilter`
- `_playerHistFilters`
- `_playerSeasonFilter`
- `_playerSeasonFilters`
- `_oppPage`
- `_oppSort`
- `_univModalCurrentName`
- `_univEditOpen`

즉, 기존 코드는 아직 옛 이름으로 접근해도 동작하지만,
실제 저장 위치는 상태 객체로 수렴하고 있다.

---

## 2. 이번까지 끝난 것

### 상태 객체 도입

- `constants.js`
  - `ensureDetailStateObjects()`
  - `PlayerDetailState`
  - `UnivDetailState`
  - alias 정의

### helper 도입

- `getPlayerDetailState()`
- `getUnivDetailState()`
- `resetPlayerDetailState()`
- `resetUnivDetailState()`

### 직접 사용 통일

현재 주요 파일은 `window._playerModalYear` 같은 직접 전역 접근 대신
상태 객체 또는 helper 기준으로 정리되어 있다.

대표 대상:

- `render-player-modal-entry.js`
- `render-player-style-prep.js`
- `render-player-detail-prep.js`
- `render-player-compute.js`
- `render-player-detail.js`
- `render-player-filters.js`
- `render-player-stats.js`
- `render-player-history-actions.js`
- `render-share-utils.js`
- `render-capture-utils.js`
- `render-standalone-utils.js`
- `render-univ-actions.js`
- `settings.js`
- `match.js`
- `cloud-board.js`

---

## 3. alias를 아직 바로 지우지 않는 이유

현재 alias는 단순 잔재가 아니라 “호환 레이어”다.

장점:

- 기존 함수/외부 파일이 바로 깨지지 않음
- 단계적으로 리팩터링 가능
- 테스트 범위를 작게 나눌 수 있음

위험:

- 새 코드가 실수로 alias를 다시 직접 쓰기 시작할 수 있음
- 상태 접근 방식이 섞이면 유지보수성이 떨어짐

따라서 지금은 “삭제”보다 “신규 코드가 helper만 쓰게 고정”하는 단계가 더 적절하다.

---

## 4. 다음 제거 조건

다음 조건이 충족되면 alias 제거를 검토할 수 있다.

1. JS 본문에서 상세 상태 구형 전역 이름 직접 사용이 0건
2. `settings.js`, `match.js`, `cloud-board.js` 같은 재오픈 경로까지 helper 사용 완료
3. 수동 스모크 테스트 1회 재실행
4. 브라우저에서 선수 상세/대학 상세/공유/캡처/기록 수정까지 정상 확인

---

## 5. 권장 제거 순서

### 1단계

신규 코드 규칙 고정:

- 상태 읽기: `getPlayerDetailState()`, `getUnivDetailState()`
- 상태 초기화: `resetPlayerDetailState()`, `resetUnivDetailState()`

### 2단계

검사용 grep 기준 추가:

- `_playerModal`
- `_playerHist`
- `_playerSeason`
- `_oppPage`
- `_oppSort`
- `_univModalCurrentName`
- `_univEditOpen`

이 패턴이 helper/alias 정의부 외에는 나오지 않게 유지

### 3단계

alias를 경고 모드로 변경 가능:

- 개발 중 `console.warn` 추가
- 또는 주석으로 “deprecated” 명시

### 4단계

최종 제거:

- `Object.defineProperty` alias 제거
- 직접 전역 제거

---

## 6. 실무 기준 권장안

지금 당장은 alias를 제거하지 말고 아래까지만 하는 것이 안전하다.

- helper 사용 통일 유지
- 신규 코드에서 alias 직접 사용 금지
- 문서화 완료

이후 별도 릴리즈 단위에서 alias 제거를 진행하는 것이 가장 안전하다.

---

## 7. 한 줄 결론

현재 상태는 **alias 제거 직전 준비 단계**다.

즉:

- 상태 객체화는 충분히 진행됨
- 직접 사용도 많이 정리됨
- 지금은 “제거”보다 “helper 기준 고정 + 회귀 테스트”가 맞다
