# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

스타크래프트 스트리머 리그 관리 시스템 ("스타대학 데이터 센터"). 빌드 도구 없이 `index.html`을 브라우저에서 직접 열면 작동한다. 서버나 패키지 설치 불필요.

**실행 방법**: `index.html`을 브라우저로 열기. (로컬 파일 CORS 이슈가 발생하면 VS Code Live Server 또는 `npx serve .` 사용)

빌드/테스트/lint 커맨드 없음. 브라우저 콘솔(F12)로 직접 디버깅.

## 아키텍처

### 데이터 흐름
- **저장소**: `localStorage` 전용 (서버 없음). 모든 키는 `su_` 접두사.
- **읽기**: `J(key)` 함수 (constants.js) — JSON.parse + try/catch 래퍼.
- **쓰기**: `save()` 함수 (render.js) — 모든 글로벌 변수를 한꺼번에 localStorage에 저장.
- **GitHub 동기화**: `cloudLoad()` (cloud-board.js) — raw/jsdelivr/GitHub API/CORS proxy 4단계 폴백으로 `data.json`을 불러와 localStorage에 덮어씀.

### 주요 글로벌 변수 (constants.js에 선언)
| 변수 | localStorage 키 | 설명 |
|------|----------------|------|
| `players` | `su_p` | 선수 배열. 각 선수: `{name, tier, race, gender, univ, win, loss, points, elo, history[], role, subRole}` |
| `univCfg` | `su_u` | 대학 설정 `[{name, color}]` |
| `miniM` | `su_mm` | 미니대전 기록 |
| `univM` | `su_um` | 대학대전 기록 |
| `comps` | `su_cm` | 대회 데이터 |
| `ckM` | `su_ck` | 대학CK 기록 |
| `proM` | `su_pro` | 프로리그 기록 |
| `tourneys` | `su_tn` | 조별 토너먼트 |
| `members` | `su_mb` | 회원 관리 |

### 렌더링 패턴
```
사용자 탭 클릭 → sw(탭명, el)  →  render()  →  r{탭명}(C, T)
```
- `C` = `#rcont` (콘텐츠 컨테이너 div)
- `T` = `#rtitle` (탭 제목 element)
- 각 탭 함수는 `C.innerHTML = ...`으로 전체 재렌더링
- `rBoard`는 cloud-board.js에 있음 (나머지 탭 함수들과 다른 파일)

### 매치 데이터 구조
```js
{
  _id: string,        // 고유 ID
  d: 'YYYY-MM-DD',   // 날짜
  a, b: string,       // 팀A, 팀B 이름
  sa, sb: number,     // 세트 스코어
  sets: [{
    games: [{ playerA, playerB, winner:'A'|'B', map, raceA, raceB, eloDelta }]
  }],
  memo: string
}
```

## JS 파일별 역할

| 파일 | 역할 |
|------|------|
| `constants.js` | 티어/종족/역할 상수, 배지 함수, 글로벌 데이터 변수 선언 |
| `data.js` | `revertMatchRecord()` — 매치 삭제 시 선수 스탯 롤백 |
| `render.js` | `sw()`, `render()` 탭 전환, 선수/대학 모달, `save()`, 다크모드 |
| `players.js` | `rTotal()` 스트리머 목록, `rTier()` 티어 순위표 |
| `vs.js` | 1:1 상대전적 검색/표시 |
| `history.js` | `rHist()` 대전 기록 탭, 히스토리 필터링/페이지네이션 |
| `match.js` | `rRace()` 종족별, `rUniv()` 대학별 탭 |
| `match-builder.js` | `rMini()`, `rCK()`, `rUnivM()`, `rPro()` — 경기 입력 UI |
| `competition.js` | `rComp()`, 리그/브래킷/조편성, `rCompTour()` |
| `tier-tour.js` | `rTierTour()` 티어별 토너먼트, `openGrpPasteModal()` 대회 붙여넣기 |
| `stats.js` | `rStats()` — ELO 차트, 승률, 히트맵, 시즌별 통계 등 20+ 서브탭 |
| `calendar.js` | `rCal()` 캘린더 탭 |
| `vote.js` | `rVote()` 승부예측 탭 |
| `auth.js` | SHA-256 로그인 (`doLogin()`), `isLoggedIn` 상태, 관리자 잠금 |
| `init.js` | `init()` 초기화, `autoLoad()` 첫 접속 GitHub 자동 로드 |
| `protection.js` | 우클릭/F12/Ctrl+U 차단 |
| `cloud-board.js` | `cloudLoad()` 수동 불러오기, `rBoard()` 현황판 탭 |
| `search.js` | `recFilterInPlace()` 실시간 검색, 붙여넣기 파싱 전체 로직 |
| `modal-drag.js` | 모달 드래그 이동(PC), `openMobileMatchSheet()` 모바일 경기 상세 |
| `mobile-bar.js` | 모바일 하단 내비게이션 표시 여부 제어 |

## 붙여넣기 파싱 (search.js)

메뉴별로 전용 모달 함수가 분리되어 있음:
- `openMiniPasteModal()` — 미니대전 전용 (mode=mini 고정, 모드 선택기 숨김)
- `openUnivmPasteModal()` — 대학대전 전용 (mode=univm 고정)
- `openProPasteModal()` — 프로리그 전용 (별도 모달 `#proPasteModal`)
- `openGrpPasteModal()` — 대회 전용 (tier-tour.js, `#pasteModal` 재활용 + `_grpPasteMode=true`)

**강제 모드 흐름**: `openMiniPasteModal()` / `openUnivmPasteModal()` → `window._forcedPasteMode` 설정 → `closePasteModal()`에서 모드 선택기 원복.

### 파싱 형식 (parsePasteLine)
- **형식 A**: `[맵] 선수명종족 (승) vs (패) 선수명종족`
- **형식 B (🆚)**: `선수명[티어종족]❌🆚⭕선수명[티어종족]🌐맵` 또는 `P선수명✅🆚️⬜Z선수명 [맵약자]`
  - `Z조이✅🆚️⬜Z블비` 처럼 **앞에 붙은 종족(P/T/Z) 접두사는 자동 제거**
  - `🅰️` (에이스전) 접두사도 자동 제거
- **형식 C**: `1세트 맵 선수A 0:1 선수B` (누적 스코어 자동 판별)
- **형식 D**: 여러 줄 `패배!\n이름\nVS\n이름\n승리!\n맵: 맵명` 형식

### 팀 로스터 라인 감지
붙여넣기에 `팀명 : 멤버1 멤버2 멤버3` 형식 줄이 있으면 자동으로 팀A/B 이름 설정:
```
츠캄몬 : 마토 주랑 주양 조이 땅콩   →  window._pasteForceTeamA = '츠캄몬'
늪지대 : 롱빡 슈슈 예실 블비 라츄   →  window._pasteForceTeamB = '늪지대'
```
- `_pasteRosterA` / `_pasteRosterB` 에 `{teamName, members[]}` 저장
- 게임 결과 라인이 아닌 것(🆚/✅/❌/⬜ 없음)만 로스터로 인식

### 세트 구분 인식 (parseSetSeparator)
- `⚔1SET 5/3` → setNum=1, `⚔3SET ACE` → setNum=3 (최우선)
- `━━━━━` (U+2501) — 구분선으로 인식 안됨, errors에 추가됨 (무해)
- `----------` (하이픈 3개 이상, 전체 길이의 40% 이상) → 세트 증가
- `1세트`, `2SET`, `에이스전` 단독 줄도 인식

### 맵 약자 시스템
`getMapAlias()` (constants.js) — 약자→정식 맵명 매핑. 예: `녹아→녹아웃`, `라데→라데리안`, `실피→실피드`. `[맵약자]` 브라켓 또는 🌐 이모지 뒤에 붙여 지정.

## 티어 시스템
`G > K > JA > J > S > 0티어 > 1티어 > ... > 8티어 > 유스`

- `_TIER_BG`, `_TIER_TEXT` (constants.js): 티어 색상 맵. CSS 클래스 `.tbadge-*`와 동일한 색상 사용.
- `getTierBadge(tier)` — HTML 뱃지 스팬 반환.
- `TIERS` 배열은 `J('su_tiers')`로 커스터마이즈 가능.

## ELO 시스템
- 기본값: `ELO_DEFAULT = 1200`
- 승: +점수, 패: -점수 (K-factor 기반)
- `player.history[].eloDelta`에 각 게임의 ELO 변화량 저장
- `revertMatchRecord()` 호출 시 `eloDelta` 롤백

## 인증
- `auth.js`의 `doLogin()` — `sha256(id+':'+pw)` 해시를 `su_admin_hashes` 배열과 비교
- `isLoggedIn` 글로벌 변수로 관리자 기능(편집/삭제 버튼) 표시 여부 결정
- 기본 계정: `admin99` / `99admin`

## 모달 패턴
- `om(id)` — 모달 열기 (`display:flex`)
- `cm(id)` — 모달 닫기 (`display:none`)
- `.mbox` 클래스 컨테이너, `.modal` 오버레이
- PC에서 `.mtitle` 드래그로 모달 이동 가능 (modal-drag.js)

## CSS 구조 (style.css)
CSS 변수는 `:root`에 정의. 주요 변수:
- `--blue`, `--blue-d`, `--blue-l`, `--blue-ll` — 파란색 계열
- `--god`, `--king`, `--jack`, `--joker`, `--spade` — 티어 색상
- `--r` — border-radius 기본값 (8px)
- `--sh`, `--sh2` — box-shadow 프리셋
- 다크모드: `body.dark` 선택자로 CSS 변수 덮어쓰기 (style.css 하단 `/* ══ 다크모드 */` 섹션)

## 주의사항
- **스크립트 로드 순서 중요**: `constants.js`가 반드시 먼저 로드되어야 함 (글로벌 변수 선언). `render.js`의 `save()` 함수는 모든 데이터 변수가 선언된 후 호출됨.
- **`rBoard`는 cloud-board.js에 있음** — 다른 탭 렌더 함수(`r*`)들이 각각의 파일에 있는 것과 다르게 board 탭은 cloud-board.js 하단에 위치.
- **`openGrpPasteModal`는 tier-tour.js에 있음** — 경쟁 스크립트가 competition.js이지만 대회 붙여넣기 함수는 tier-tour.js 최상단에 위치.
- **글로벌 `window._paste*` 변수들**: 붙여넣기 모달 상태를 전역으로 공유. `_pasteResults`, `_pasteErrors`, `_pasteForceTeamA/B`, `_pasteRosterA/B`, `_forcedPasteMode`, `_grpPasteMode` 등.
