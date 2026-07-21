# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ 필수: 작업 시작 전 반드시 읽을 것

**모든 프롬프트 처리 전, 다음 파일을 먼저 읽어라:**

```
star-datacenter/PROJECT_DOCS.md
```

이 문서에는 전체 화면·기능 명세, 파일별 역할, 핵심 함수 목록, 데이터 구조,
붙여넣기 파싱 시스템 상세, 그리고 **지금까지 진행한 작업 이력**이 모두 담겨 있다.
먼저 읽지 않으면 기존 구현과 충돌하거나 중복 작업이 발생할 수 있다.

---

## 프로젝트 개요

스타크래프트 스트리머 리그 관리 시스템 ("스타대학 데이터 센터").
빌드 도구 없이 `index.html`을 브라우저에서 직접 열면 작동한다. 서버나 패키지 설치 불필요.

**실행 방법**: `index.html`을 브라우저로 열기. (로컬 파일 CORS 이슈 시 VS Code Live Server 또는 `npx serve .`)
**빌드/테스트/lint 없음** — 브라우저 콘솔(F12)로 직접 디버깅.
**배포 URL**: `https://nada1004.github.io/star-system/star-datacenter/index.html`

---

## 아키텍처 요약

### 데이터 흐름
- **저장소**: `localStorage` 전용 (서버 없음). 모든 키는 `su_` 접두사.
- **읽기**: `J(key)` (constants.js) — JSON.parse + try/catch 래퍼.
- **쓰기**: `save()` (render.js) — 모든 글로벌 변수를 한꺼번에 저장.
- **GitHub 동기화**: `autoLoad()` (init.js) — 첫 방문 시 `data.json` 자동 로드.

### 렌더링 패턴
```
탭 클릭 → sw(탭명, el) → render() → r{탭명}(C, T) → C.innerHTML = HTML
```
- `C` = `#rcont`, `T` = `#rtitle`
- 전체 재렌더링 방식 (가상 DOM 없음)

### 스크립트 로드 순서 (constants.js 반드시 첫 번째)
```
constants.js → data.js → render.js → players.js → vs.js → history.js
→ match.js → match-builder.js → competition.js → tier-tour.js
→ stats.js → calendar.js → vote.js → auth.js → init.js
```

### 주요 전역 변수 (constants.js)
| 변수 | 키 | 설명 |
|------|-----|------|
| `players` | `su_p` | 선수 배열 |
| `miniM/univM/ckM/proM` | `su_mm/um/ck/pro` | 경기 기록 |
| `tourneys` | `su_tn` | 리그형 토너먼트 |
| `comps` | `su_cm` | 대회 데이터 |

---

## 모달 패턴
- `om(id)` → 열기, `cm(id)` → 닫기
- PC에서 `.mtitle` 드래그 이동 가능 (modal-drag.js)

## 인증
- `isLoggedIn` 글로벌로 관리자 UI 제어
- `doLogin()` — `sha256(id+':'+pw)` 해시 검증 (auth.js)
- 기본 계정: `admin99` / `99admin`

## 주의사항
- `rBoard`는 cloud-board.js에 있음 (다른 탭과 다른 파일)
- `openGrpPasteModal()`는 tier-tour.js 최상단에 있음 (competition.js 아님)
- 붙여넣기 파싱 전체 로직은 search.js에 집중되어 있음
- 작업 완료 후 `PROJECT_DOCS.md` 의 **작업 이력 섹션**을 업데이트할 것
