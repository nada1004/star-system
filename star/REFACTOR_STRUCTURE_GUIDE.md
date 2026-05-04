# 스타대학 데이터 센터 리팩터링 구조 가이드

> 최종 리팩터링 기준 렌더 구조와 파일 역할을 빠르게 파악하기 위한 문서
> 최종 업데이트: 2026-05-01

---

## 1. 핵심 요약

현재 구조는 예전의 거대한 `render.js`를 여러 책임 단위 파일로 분리한 상태다.

핵심 방향:

- `render-core.js`
  - 탭 전환 후 실제 렌더를 실행하는 코어
  - `render()`, `renderNow()`, 탭별 switch, 후처리 담당

- 선수 상세 파이프라인
  - `render-player-detail.js`
  - `render-player-style-prep.js`
  - `render-player-detail-prep.js`
  - `render-player-compute.js`
  - `render-player-history-prune.js`
  - `render-player-history-collector.js`
  - `render-player-header.js`
  - `render-player-stats.js`
  - `render-player-recent-history.js`
  - `render-player-extra-sections.js`
  - `render-player-filters.js`
  - `render-player-history-actions.js`
  - `render-match-id-prepare.js`
  - `render-player-modal-entry.js`

- 대학 상세 파이프라인
  - `render-univ-detail.js`
  - `render-univ-style-prep.js`
  - `render-univ-compute.js`
  - `render-univ-sections.js`
  - `render-univ-recent.js`
  - `render-univ-actions.js`

- 공통 UI/유틸
  - `render-iconify-ui.js`
  - `render-lazy-utils.js`
  - `render-nav-lazy.js`
  - `render-capture-utils.js`
  - `render-share-utils.js`
  - `render-standalone-utils.js`
  - `year-utils.js`

`render.js`는 더 이상 사용하지 않으며, 로드에서도 제거된 상태다.

---

## 2. 현재 렌더 흐름

### 메인 탭 렌더

1. `sw(tabName, el)` 또는 초기화 로직이 현재 탭 상태를 바꾼다
2. `render()` 호출
3. `render-core.js`의 `_renderImpl()` 실행
4. 탭에 따라 각 탭 렌더 함수 호출
5. 렌더 후 후처리 수행
   - `injectUnivIcons(...)`
   - `iconifyUI(...)`
   - 포커스 복원
   - 드래그 스크롤 활성화

### 선수 상세

1. `openPlayerModal(name)` 호출
2. `render-player-modal-entry.js`
   - 모달 상태 초기화
   - `buildPlayerDetailHTML(player)` 호출
3. `render-player-detail.js`
   - 스타일 준비
   - 기록 정리/수집
   - 계산 데이터 준비
   - 섹션별 HTML 조립
4. `initPEloChart(name)` 후속 실행

### 대학 상세

1. `openUnivModal(univName)` 호출
2. `buildUnivDetailHTML(univName)` 호출
3. `render-univ-detail.js`
   - 스타일 준비
   - 계산 데이터 준비
   - 헤더/멤버/상대전적/최근기록/에이스 카드 조립

---

## 3. 파일 역할 상세

### 3-1. 렌더 코어

#### `js/render-core.js`

역할:

- 메인 `render()`/`renderNow()`
- 탭별 본문 렌더 분기
- 렌더 후 공통 후처리
- 디바운스 처리

주의:

- 이 파일은 다른 렌더 유틸보다 먼저 로드돼야 한다
- 지연 로딩 안내 주석도 이 파일 기준으로 이해하면 된다

---

### 3-2. 선수 상세

#### `js/render-player-detail.js`

역할:

- 선수 상세 전체 조립 오케스트레이션
- 아래 준비/계산/섹션 유틸을 호출해서 HTML을 순서대로 이어 붙임

직접 담당하는 것은 최소화되어야 한다.

#### `js/render-player-style-prep.js`

역할:

- 선수 상세 헤더 배경
- 카드 반경/패딩/폰트/칩 크기
- 종목/연도 필터 바 준비

#### `js/render-player-detail-prep.js`

역할:

- 상단 표시용 준비값
  - 사진
  - 채널 링크
  - ELO 스파크라인
- 최근 경기 섹션용 페이지/시즌 준비

#### `js/render-player-compute.js`

역할:

- 승률/전적/ELO
- 연도 필터 적용
- 모드별/상대별 집계
- 차트용 데이터 준비

#### `js/render-player-history-prune.js`

역할:

- 원본 히스토리 정리
- 중복성 높은 기록 제거

#### `js/render-player-history-collector.js`

역할:

- 외부 경기 소스에서 선수 관련 기록 수집
- 기존 히스토리와 합치기

#### `js/render-match-id-prepare.js`

역할:

- 외부 경기 소스에 `_id`가 없을 때 공통 방식으로 보정

#### `js/render-player-header.js`

역할:

- 선수 헤더 카드 HTML
- 요약 스트립 HTML

#### `js/render-player-stats.js`

역할:

- 모드별 전적
- 상대 종족별 전적
- 상대 전적 테이블
- 맵 통계

#### `js/render-player-recent-history.js`

역할:

- 최근 경기 기록 섹션 HTML
- 페이지네이션 렌더

#### `js/render-player-extra-sections.js`

역할:

- 같은 대학 팀원
- 메모 등 부가 섹션

#### `js/render-player-filters.js`

역할:

- 연도/종목/시즌 필터 UI
- 상세 재빌드 트리거

주의:

- 아직 전역 상태와 문자열 `onclick` 의존이 남아 있음

#### `js/render-player-history-actions.js`

역할:

- 최근 경기 기록 수정/삭제/선택 액션

#### `js/render-player-modal-entry.js`

역할:

- 선수 상세 모달 진입
- 수정창 진입 fallback

---

### 3-3. 대학 상세

#### `js/render-univ-detail.js`

역할:

- 대학 상세 전체 조립 오케스트레이션

#### `js/render-univ-style-prep.js`

역할:

- 대학 색상
- 뷰포트 판정
- 멤버 목록
- 로고 크기 준비

#### `js/render-univ-compute.js`

역할:

- 상대 대학 전적
- 개인 전적 기반 집계
- 총 포인트/승률
- 최근 대전 목록 준비

#### `js/render-univ-sections.js`

역할:

- 헤더 카드
- 멤버 테이블
- 상대 대학 전적
- 에이스 카드

#### `js/render-univ-recent.js`

역할:

- 최근 대전 기록 섹션 HTML

#### `js/render-univ-actions.js`

역할:

- 대학 모달 관련 액션 보조

---

### 3-4. 공통 유틸

#### `js/render-iconify-ui.js`

역할:

- 버튼/탭 텍스트 앞 이모지를 SVG로 치환

#### `js/year-utils.js`

역할:

- 앱에서 사용하는 연도 검증 공통 기준
- 연도 옵션 추출/병합

핵심 함수:

- `isValidAppYear(year)`
- `extractValidYearsFromMatches(matches, dateKey)`
- `mergeValidYearsIntoOptions(targetOptions, matches, dateKey)`

---

## 4. 현재 남은 구조 리스크

### 전역 상태 의존

아직 다음 상태들은 전역에 퍼져 있다.

- `_playerModalYear`
- `_playerModalYears`
- `_playerHistFilters`
- `_playerSeasonFilter`
- `_oppPage`
- `_oppSort`

장기적으로는 다음처럼 묶는 것이 좋다.

- `window.PlayerDetailState`
- `window.UnivDetailState`
- `window.RenderState`

### 문자열 `onclick`

HTML 문자열 내부에서 전역 함수 호출이 여전히 많다.

영향:

- 함수명 변경에 약함
- 리팩터링 내성이 낮음
- 테스트 자동화가 불편함

장기 개선 방향:

- 이벤트 위임
- `data-action`, `data-name`, `data-mode` 기반 바인딩

### 스크립트 로드 순서 민감성

현재도 빌드 없는 순수 스크립트 구조라 `index.html` 로드 순서가 중요하다.

따라서:

- 새 파일 추가 시 반드시 `index.html` 순서를 검토
- 준비 유틸은 조립 함수보다 먼저 로드
- 조립 함수는 모달 진입 파일보다 먼저 로드

---

## 5. 지금 이후 권장 작업

### 1순위

- 스모크 테스트 체크리스트 기준 실제 수동 점검 반복
- 리팩터링 후 기능 회귀 없는지 확인

### 2순위

- 선수/대학 상세 전역 상태 객체화

### 3순위

- 문자열 `onclick` 제거

### 4순위

- `PROJECT_DOCS.md`의 예전 `render.js` 설명 최신화

---

## 6. 빠른 판단 기준

### 파일을 고칠 때 어디부터 볼까?

- 탭 렌더가 안 뜬다
  - `render-core.js`

- 선수 상세가 깨진다
  - `render-player-detail.js`
  - 관련 `render-player-*`

- 대학 상세가 깨진다
  - `render-univ-detail.js`
  - 관련 `render-univ-*`

- 연도 옵션이 이상하다
  - `year-utils.js`
  - `match.js`
  - `auth.js`
  - `cloud-board.js`
  - `init.js`

- 탭/필터 바 드래그가 이상하다
  - `init.js`의 `enableDragScroll()`

---

## 7. 결론

현재 구조는 이미 “큰 파일 1개에 모든 책임이 몰린 상태”에서 벗어났다.

이제부터는:

- 기능 추가보다 회귀 테스트
- 전역 상태 축소
- 이벤트 위임 전환

이 3개가 다음 단계의 핵심이다.
