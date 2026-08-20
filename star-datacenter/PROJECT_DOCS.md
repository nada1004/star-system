# 스타대학 데이터 센터 — 상세 프로젝트 문서

> 이 문서는 Claude Code가 작업 시 참조하는 전체 기능 명세서입니다.
> 최종 업데이트: 2026-04-18

---

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [파일 구조](#2-파일-구조)
3. [화면(탭)별 기능](#3-화면탭별-기능)
4. [핵심 데이터 구조](#4-핵심-데이터-구조)
5. [핵심 함수 목록](#5-핵심-함수-목록)
6. [모달 목록](#6-모달-목록)
7. [붙여넣기 파싱 시스템](#7-붙여넣기-파싱-시스템)
8. [지금까지 진행한 작업 이력](#8-지금까지-진행한-작업-이력)

---

## 1. 프로젝트 개요

**이름**: 스타대학 데이터 센터 (Star University Data Center)
**목적**: 스타크래프트 스트리머 대학리그 통합 관리 시스템
**기술**: 순수 HTML/CSS/JS — 빌드 없음, 서버 없음
**데이터 저장**: localStorage 전용 (`su_` 접두사)
**GitHub 동기화**: `data.json` 폴백 자동 로드 (init.js `autoLoad()`)
**GitHub 저장소**: `nada1004/star-system`
**배포 URL**: `https://nada1004.github.io/star-system/star-datacenter/index.html`

---

## 2. 파일 구조

```
star-datacenter/
├── index.html              # 단일 HTML 파일. 모든 탭·모달 포함
├── css/
│   └── style.css           # 전체 스타일. CSS변수로 테마 관리
└── js/
    ├── constants.js                # [필수 1번째 로드] 전역 변수 선언·상수·유틸
    ├── data.js                     # revertMatchRecord() 매치 삭제 롤백
    ├── year-utils.js               # 연도 검증/연도 옵션 추출 공통 유틸
    ├── render-core.js              # 메인 render()/renderNow(), 탭별 렌더 switch
    ├── render-lazy-utils.js        # 지연 로딩 보조
    ├── render-nav-lazy.js          # 탭/기능 지연 로딩 네비게이션 보조
    ├── render-iconify-ui.js        # 이모지 → SVG 아이콘 치환
    ├── render-capture-utils.js     # 이미지 저장/캡처 보조
    ├── render-share-utils.js       # 공유 카드/공유 이미지 보조
    ├── render-merged-tabs.js       # 병합 탭 렌더 보조
    ├── render-standalone-utils.js  # 독립 렌더 유틸
    ├── render-player-detail.js     # 선수 상세 조립 오케스트레이션
    ├── render-player-style-prep.js # 선수 상세 스타일/필터 준비
    ├── render-player-detail-prep.js# 선수 상세 헤더/최근기록 준비
    ├── render-player-compute.js    # 선수 상세 통계 계산
    ├── render-player-history-prune.js
    ├── render-player-history-collector.js
    ├── render-player-header.js
    ├── render-player-stats.js
    ├── render-player-recent-history.js
    ├── render-player-extra-sections.js
    ├── render-player-filters.js
    ├── render-player-history-actions.js
    ├── render-player-modal-entry.js
    ├── render-match-id-prepare.js  # 외부 경기 기록 `_id` 보정
    ├── render-univ-detail.js       # 대학 상세 조립 오케스트레이션
    ├── render-univ-style-prep.js   # 대학 상세 스타일/헤더 준비
    ├── render-univ-compute.js      # 대학 상세 통계 계산
    ├── render-univ-sections.js
    ├── render-univ-recent.js
    ├── render-univ-actions.js
    ├── players.js                  # rTotal() 스트리머목록, rTier() 티어순위
    ├── vs.js                       # 1:1 상대전적 검색
    ├── history.js                  # rHist() 대전기록 탭
    ├── match.js                    # 연도 옵션, 기록 관련 렌더 보조
    ├── match-builder.js            # 경기 입력/세트 빌더
    ├── competition.js              # 대회·토너먼트·브래킷 관리
    ├── tier-tour.js                # 티어대회/붙여넣기 로직
    ├── auth.js                     # SHA-256 인증
    ├── cloud-board.js              # 수동 동기화, 현황판
    ├── init.js                     # 앱 시작, autoLoad(), 드래그 스크롤
    ├── search.js                   # 글로벌 선수검색, 붙여넣기 파싱
    ├── modal-drag.js               # 모달 드래그 이동 (PC)
    └── mobile-bar.js               # 모바일 하단 내비 표시 제어
```

### 스크립트 로드 순서 (index.html 하단)
```
constants.js → data.js → year-utils.js → auth.js → settings 계열
→ competition.js → render-lazy-utils.js → render-core.js
→ render-player-* / render-univ-* / render-share-utils 계열
→ players.js → vs.js → history.js → match.js → match-builder.js
→ search.js → cloud-board.js → init.js
```
> ⚠️ `constants.js`는 반드시 첫 번째여야 하며, `render-core.js`는 선수/대학 상세 조립 파일보다 먼저 로드되어야 한다.

---

## 3. 화면(탭)별 기능

### 탭 라우팅 구조
```javascript
sw(tabName, el) → curTab 변경 → render() → switch(curTab) → r{탭명}(C, T)
```
- `C` = `#rcont` (콘텐츠 div)
- `T` = `#rtitle` (제목 span)
- 실제 render 실행 코어는 현재 `render-core.js`에 있음

---

### 📋 스트리머 탭 (`rTotal`, `rTier` — players.js)

**`rTotal()` — 스트리머 목록**
- 대학별 그룹 테이블
- 필터: 종족(T/Z/P), 경기기록 없는 선수 숨기기, 이름·대학·티어·성별 검색
- 역할 계층 (이사장/총장... — 상단 노란색 섹션)
- 관리자: 수정/삭제 버튼
- 선수 클릭 → `openPlayerModal(name)`

**`rTier()` — 티어 순위표**
- 정렬 6종: 티어순/다승순/승률순/승차순/역승차순/최근경기순
- 대학·티어·종족 필터
- TOP 3 메달 배지 (🥇🥈🥉)
- 최근 경기 출처 표시 (mini/univm/comp/ck/pro/tourney/tierTour 통합)

---

### 📊 현황판 탭 (`rBoard` — cloud-board.js)

- 대학별 팀 현황 카드 타일
- 선수 사진·역할 배지
- 팀 순서 드래그 재배치 (`boardOrder`)
- 이미지 캡처/저장 기능

---

### ⚔️ 대전기록 탭 (`rHist` — history.js)

**서브탭 11개:**
1. 🧬 종족승률 — T/Z/P 3×3 매트릭스
2. ⚡ 미니대전 — miniM 기록 목록
3. 🤝 대학CK — ckM 기록 목록
4. 🏟️ 대학대전 — univM 기록 목록
5. 🎖️ 대회 — comps 기록 (대회명별 그룹)
6. 🎯 티어대회 — ttM 기록 목록
7. 🏛️ 대학별 — 대학 선택 후 누적 통계
8. 🏛️ 대학별 포인트 순위 — 승점 기반 순위
9. 🏅 프로리그 — proM 기록 목록
10. 👤 선수별 — 선수 선택 후 전체 기록
11. ⚔️ 1:1 상대전적 — 두 선수 간 통계

**공통 기능**: 연도·월 필터, 최신순/오래된순 정렬, 페이지네이션 (PC:20 / 모바일:10)

---

### ⚡ 미니대전 탭 (`rMini` — match-builder.js)

**서브탭**: 경기 입력 / 순위 / 기록

**경기 입력 (`miniSub='input'`)**:
- 날짜·팀A·팀B 선택
- 세트 방식 또는 세트 없이 입력
- `setBuilderHTML(BLD['mini'], 'mini')` 로 폼 생성
- `openMiniPasteModal()` — 미니대전 전용 붙여넣기 (mode 고정)
- 저장: `saveMatch('mini')` → `miniM[]` 에 추가

**순위**: 대학별 승점(승+3/패-3) 집계 테이블
**기록**: `recSummaryListHTML(miniM, 'mini', 'tab')` 요약 목록

---

### 🤝 대학CK 탭 (`rCK` — match-builder.js)

- 멤버 직접 구성 (대학별 선수 선택)
- 팀A/팀B 각각 대학 → 멤버 추가
- 선수 검색(`ckSearchPlayer()`) 으로 빠른 팀 구성
- 세트 기반 경기 입력
- 대학별 순위 (대학 누적 승/패/승점)

---

### 🏟️ 대학대전 탭 (`rUnivM` — match-builder.js)

- 구조는 미니대전과 동일
- `openUnivmPasteModal()` — 대학대전 전용 붙여넣기 (mode 고정)
- 저장: `saveMatch('univm')` → `univM[]` 에 추가

---

### 🎖️ 대회 탭 (`rComp` — competition.js)

**서브탭 (리그형)**:
- 📅 조별리그 — 날짜·조 필터 매치 목록
- 📊 조별순위 — 승점·득실차·티브레이커 순위표
- 🏆 대진표 — 자동/수동 토너먼트 브래킷
- 👤 개인순위 — 선수별 포인트 순위
- ⚙️ 조편성관리 — 그룹/대학 추가·삭제

**매치 입력 (`grpOpenMatchModal`)**:
- 팀A/팀B 선택
- 세트·게임 단위 입력
- `openGrpPasteModal()` — 대회 전용 붙여넣기 (tier-tour.js에 위치)
- 세트 선택 (기존/새 세트 추가)

**브래킷 자동 생성**:
- 그룹 1위들 → 대각선 시딩
- 수동 오버라이드 가능

---

### 🏅 프로리그 탭 (`rPro` — match-builder.js)

- 참가 티어 필터 (god~1티어)
- 선수 클릭/검색으로 팀 구성
- 여자 선수는 검색으로만 추가
- `openProPasteModal()` — 프로리그 전용 붙여넣기 (별도 `#proPasteModal`)
- 선수별 승/패/승률 순위

---

### 📊 통계 탭 (`rStats` — stats.js)

**20+ 서브탭:**
- 🏛️ 종합 — 대학순위, 종족매트릭스, 맵통계, 최근폼 TOP10, 연패 현황
- 📈 ELO 그래프 — Canvas 차트, 선수 선택, 시간축 ELO 변화
- 🏆 이달의 선수 — 월별 MVP
- 🎖️ 최다 기록 — 기록 보유자
- 🕸️ 대학 레이더 — 레이더 차트 비교
- 📅 활동 히트맵 — 날짜별 활동량
- 🎯 티어별 승률 — 티어 간 매치업 통계
- 🗺️ 맵별 특화 — 선수별 맵 특화도
- 기타 10+ 분석 뷰

---

### 📅 캘린더 탭 (`rCal` — calendar.js)

**3가지 뷰**:
- **월간**: 날짜 그리드, 일별 경기 수 뱃지, 클릭 → 상세 확장
- **주간**: 7일 뷰, 날짜별 경기 카드
- **일간**: 선택 날짜의 전체 경기 상세 (세트·게임 구조)

**상태 변수**: `calView`, `calYear/calMonth`, `calWeekOffset`, `calDayDate`

---

### 🔮 승부예측 탭 (`rVote` — vote.js)

- 미결 미니대전에 팀 투표
- 실시간 투표 수·퍼센트 바
- 중복 투표 방지, 취소 가능
- 결과 확인: 정답(✅)/오답(❌) 표시
- 데이터: `su_votes` → `{matchId: {a: n, b: n}, matchId_my: 'a'|'b'}`

---

### 👥 회원관리 탭 (관리자 전용)

- 회원 추가·수정·삭제
- 밴 타입: 30h/60h/100h/10일/30일/60일/영구
- 카테고리: ⚠️ 주의 / 😡 악성 / 🔍 의심
- 밴 이력·메모·신고 내용
- 검색 필터

---

### ⚙️ 설정 탭 (관리자 전용)

- 대학 추가·수정·삭제 (색상 포함)
- 맵 목록 관리
- 맵 약자(alias) 등록
- 티어 목록 커스터마이즈
- 연도 필터 항목 관리
- 비밀번호 변경

---

## 4. 핵심 데이터 구조

### localStorage 키 전체 목록

| 키 | 변수 | 설명 |
|----|------|------|
| `su_p` | `players` | 선수 배열 |
| `su_u` | `univCfg` | 대학 설정 |
| `su_m` | `maps` | 맵 목록 |
| `su_mAlias` | `mapAlias` | 맵 약자 |
| `su_mm` | `miniM` | 미니대전 기록 |
| `su_um` | `univM` | 대학대전 기록 |
| `su_cm` | `comps` | 대회 데이터 |
| `su_cn` | `compNames` | 대회명 목록 |
| `su_cc` | `curComp` | 현재 대회명 |
| `su_ck` | `ckM` | 대학CK 기록 |
| `su_pro` | `proM` | 프로리그 기록 |
| `su_tn` | `tourneys` | 리그형 토너먼트 |
| `su_ttm` | `ttM` | 티어대회 기록 |
| `su_mb` | `members` | 회원 관리 |
| `su_tiers` | `TIERS` | 티어 목록 |
| `su_boardOrder` | `boardOrder` | 현황판 순서 |
| `su_psi` | `playerStatusIcons` | 선수 상태 이모지 |
| `su_votes` | `voteData` | 승부예측 |
| `su_admin_hashes` | — | 관리자 비밀번호 해시 |

### 선수(Player) 객체
```js
{
  name: string,           // 닉네임
  univ: string,           // 소속 대학
  tier: string,           // 'G'|'K'|'JA'|'J'|'S'|'0티어'...'8티어'|'유스'
  race: string,           // 'T'|'Z'|'P'
  gender: 'M'|'F',
  role: string,           // '이사장'|'총장'|...|'코치'
  subRole: string,
  photo: string,          // URL
  channelUrl: string,
  memo: string,           // 별칭 포함 (붙여넣기 자동 인식용)
  elo: number,            // ELO 레이팅 (기본 1200)
  win: number,
  loss: number,
  points: number,         // 승점 (+3/-3)
  history: [
    { date, opponent, result:'W'|'L', map, mode, matchId, eloDelta }
  ]
}
```

### 매치(Match) 공통 구조
```js
{
  _id: string,            // genId() 고유 ID
  d: 'YYYY-MM-DD',        // 날짜
  a: string,              // 팀A 이름 (대학명 또는 팀명)
  b: string,              // 팀B 이름
  sa: number,             // 팀A 세트 스코어
  sb: number,             // 팀B 세트 스코어
  sets: [
    {
      scoreA: number,
      scoreB: number,
      winner: 'A'|'B',
      games: [
        { playerA, playerB, winner:'A'|'B', map, raceA, raceB, eloDelta }
      ]
    }
  ],
  memo: string
}
```

### 토너먼트(Tourney) 구조
```js
{
  id: string,
  name: string,
  type: 'league'|'tier',
  groups: [
    {
      name: string,       // 'GROUP A'|'GROUP B'...
      univs: string[],    // 참가 대학명 배열
      matches: [매치 객체]
    }
  ],
  bracket: { /* 수동 오버라이드 데이터 */ }
}
```

---

## 5. 핵심 함수 목록

### constants.js
| 함수 | 설명 |
|------|------|
| `J(key)` | localStorage JSON.parse 래퍼 |
| `save()` | 전체 상태 localStorage 저장 |
| `gc(univName)` | 대학 색상 hex 반환 |
| `getTierBadge(tier)` | 티어 뱃지 HTML |
| `getTierLabel(tier)` | 티어 한글 레이블 |
| `applyGameResult(w,l,d,m,id)` | 개인 전적·ELO 반영 |
| `calcElo(winner, loser)` | ELO 변화량 계산 |
| `getAllUnivs()` | 전체 대학 목록 |
| `getMapAlias()` | 맵 약자→정식명 매핑 |
| `genId()` | 고유 ID 생성 |
| `genderIcon(g)` | 성별 아이콘 |
| `getStatusIconHTML(name)` | 선수 상태 이모지 HTML |

### render-core.js
| 함수 | 설명 |
|------|------|
| `sw(t, el)` | 탭 전환 + 서브탭 초기화 |
| `render()` | 현재 탭 재렌더링 |
| `renderNow()` | 즉시 렌더 실행 |
| `_renderImpl()` | 탭별 switch + 후처리 코어 |

### render-player-detail.js
| 함수 | 설명 |
|------|------|
| `buildPlayerDetailHTML(player)` | 선수 상세 전체 HTML 조립 |

### render-univ-detail.js
| 함수 | 설명 |
|------|------|
| `buildUnivDetailHTML(univName)` | 대학 상세 전체 HTML 조립 |

### data.js
| 함수 | 설명 |
|------|------|
| `revertMatchRecord(matchObj)` | 매치 삭제 시 선수 스탯 전체 롤백 |

### match.js
| 함수 | 설명 |
|------|------|
| `saveMatch(mode)` | 매치 저장 (mode별 배열에 추가) |
| `setBuilderHTML(bld, mode)` | 세트·게임 입력 폼 생성 |
| `recalcSet(mode, si)` | 세트 점수 자동 계산 |

### search.js — 붙여넣기 파싱
| 함수 | 설명 |
|------|------|
| `openMiniPasteModal()` | 미니대전 전용 (mode=mini 고정) |
| `openUnivmPasteModal()` | 대학대전 전용 (mode=univm 고정) |
| `openProPasteModal()` | 프로리그 전용 (#proPasteModal) |
| `openPasteModal()` | 일반 붙여넣기 모달 열기 |
| `closePasteModal()` | 모달 닫기 + 강제모드 복구 |
| `pastePreview()` | 텍스트 파싱 + 미리보기 갱신 |
| `parsePasteLine(line)` | 단일 줄 파싱 (형식A/B) |
| `parseSetSeparator(line)` | 세트 구분선 판별 |
| `splitPasteLines(raw)` | 붙여넣기 텍스트 줄 분리 |
| `parseFormatD_blocks(raw)` | 형식D (승리!/패배! 멀티라인) |
| `findPlayerByPartialName(q)` | 이름 부분/약자 매칭 |
| `pasteApply()` | 파싱 결과 → 매치 저장 |
| `renderPastePreview(results, errors)` | 미리보기 테이블 렌더링 |
| `swapPasteTeams()` | A↔B 팀 교체 |

### tier-tour.js
| 함수 | 설명 |
|------|------|
| `openGrpPasteModal()` | 대회 전용 붙여넣기 (#pasteModal 재활용) |
| `grpPasteApply()` | 파싱 결과 → 대회 세트에 적용 |
| `_grpPasteApplyLogic(savable)` | 실제 적용 로직 |

---

## 6. 모달 목록

| ID | 파일 | 용도 |
|----|------|------|
| `pasteModal` | index.html | 붙여넣기 일괄 입력 (미니·대학대전·대회 공용) |
| `proPasteModal` | index.html | 프로리그 전용 붙여넣기 |
| `grpPasteModal` | index.html | 대회 세트 전용 붙여넣기 |
| `grpMatchModal` | competition.js HTML | 대회 경기 입력 |
| `playerModal` | render-player-detail.js / render-player-modal-entry.js | 선수 상세 정보 |
| `univModal` | render-univ-detail.js | 대학 상세 정보 |
| `emModal` | players.js | 선수 추가·수정 |
| `reModal` | history.js | 매치 기록 수정 |
| `memberModal` | players.js | 회원 추가·수정 |
| `loginModal` | auth.js | 관리자 로그인 |
| `cnModal` | competition.js | 대회명 관리 |

**모달 패턴**: `om(id)` = display:flex / `cm(id)` = display:none

---

## 7. 붙여넣기 파싱 시스템

### 메뉴별 모달 분리 (2025년 이후 구조)

| 메뉴 | 함수 | 모달 | mode 고정 |
|------|------|------|----------|
| 미니대전 | `openMiniPasteModal()` | `#pasteModal` | mini |
| 대학대전 | `openUnivmPasteModal()` | `#pasteModal` | univm |
| 프로리그 | `openProPasteModal()` | `#proPasteModal` | — |
| 대회 | `openGrpPasteModal()` (tier-tour.js) | `#pasteModal` | comp |

**강제 모드 흐름**:
```
openMiniPasteModal() → openPasteModal() 호출 후
  window._forcedPasteMode = 'mini'
  모드 선택 드롭다운 숨김
  힌트 텍스트 변경
closePasteModal() 시 → _forcedPasteMode 초기화 + 드롭다운 복원
```

### 지원 입력 형식

**형식 A** (승/패 괄호):
```
[실피드] 마토P (승) vs (패) 롱빡P
```

**형식 B (🆚)** — 가장 많이 사용:
```
1️⃣Z조이✅🆚️⬜Z블비 [녹아]
P마토⬜🆚️✅P롱빡 [실피]
🅰️P마토⬜🆚️✅P롱빡 [라데]
```
- 앞 종족 `P/T/Z` 자동 제거: `Z조이` → `조이`
- `🅰️` (에이스전) 앞 자동 제거
- `✅` = 승자 / `⬜` = 패자 / `❌` = 패자

**형식 C** (누적 스코어):
```
1세트 실피드 마토 0:1 롱빡
```

**형식 D** (멀티라인):
```
1경기 - 3티어
패배!
마토P
VS
롱빡P
승리!
맵: 실피드
```

### 팀 로스터 라인 자동 감지
```
츠캄몬 : 마토 주랑 주양 조이 땅콩   → _pasteForceTeamA = '츠캄몬'
늪지대 : 롱빡 슈슈 예실 블비 라츄   → _pasteForceTeamB = '늪지대'
```
- `🆚/✅/❌/⬜` 없는 줄 + 콜론 뒤 2개 이상 단어 → 로스터로 인식
- `_pasteRosterA/B` = `{ teamName, members[] }` 저장

### 세트 구분 인식 (parseSetSeparator)
| 패턴 | 예시 | setNum |
|------|------|--------|
| ⚔ SET | `⚔1SET 5/3` | 1 |
| ⚔ ACE | `⚔3SET ACE` | 3 |
| 구분선(40%+) | `------------------` | 자동 증가 |
| N세트 단독 | `2세트` | 2 |
| N SET | `3SET` | 3 |
| ━━━ (U+2501) | 인식 안됨 (errors에 추가, 무해) |

### 전역 상태 변수 (`window._paste*`)
```
_pasteResults         파싱된 경기 결과 배열
_pasteErrors          파싱 실패 줄 배열
_pasteForceTeamA/B    팀명 수동 지정
_pasteRosterA/B       {teamName, members[]}
_forcedPasteMode      'mini'|'univm'|null
_grpPasteMode         true = 대회 세트 적용 모드
_pasteMatchMode       'game'|'set'
_proPasteResults      프로리그 파싱 결과
```

---

## 8. 지금까지 진행한 작업 이력

### 2026-03-02 — 초기 push 및 파싱 수정

**커밋**: `Add star-datacenter and backup directories`
- `star-datacenter/` 폴더 전체 GitHub에 최초 push
- `backup/` 폴더 (이전 버전 백업) 함께 push

**커밋**: `Fix paste parsing: strip P/T/Z race prefix, ace emoji; separate mini/univm modals`

#### 1. P/T/Z 종족 접두사 자동 제거 (search.js `parsePasteLine`)
- **문제**: `Z조이✅🆚️⬜Z블비` 파싱 시 `Z조이`, `Z블비`로 인식 → DB에서 선수 매칭 실패
- **수정**: `splitNR()` 함수에 leading T/Z/P 제거 로직 추가
  ```js
  // 전: simpleM (trailing만 처리)
  // 후: prefixM = s.match(/^([TZP])(.+)$/)  → leading도 처리
  ```

#### 2. 🅰️ 에이스전 접두사 제거 (search.js `parsePasteLine`)
- **문제**: `🅰️P마토⬜🆚️✅P롱빡` → 🅰️ 제거 안됨
- **수정**: 접두사 제거 블록에 U+1F170 (🅰) surrogate pair 처리 추가
  ```js
  if (code0 === 0xD83C && line.charCodeAt(1) === 0xDD70) {
    line = line.slice(2); // surrogate pair 제거
    if (line.charCodeAt(0) === 0xFE0F) line = line.slice(1); // variation selector
  }
  ```

#### 3. 팀 로스터 라인 감지 (search.js `pastePreview`)
- **추가**: `tsAsimiliM : 마토 주랑 주양 조이 땅콩` 형식 → 팀A/B 이름 자동 설정
  ```js
  window._pasteRosterA = { teamName, members }
  window._pasteForceTeamA = teamName
  ```

#### 4. 메뉴별 붙여넣기 모달 분리 (search.js, match-builder.js)
- **추가**: `openMiniPasteModal()` — 미니대전 전용, mode=mini 고정
- **추가**: `openUnivmPasteModal()` — 대학대전 전용, mode=univm 고정
- **수정**: `closePasteModal()` — `_forcedPasteMode` 복구 로직 추가
- **수정**: `openPasteModal()` — `_forcedPasteMode` / `_pasteRosterA/B` 초기화 추가
- **수정**: match-builder.js — 각 버튼을 새 전용 함수로 연결

**커밋**: `Update CLAUDE.md with paste parsing architecture and modal separation details`
- CLAUDE.md 아키텍처 문서 대폭 개선
- 붙여넣기 모달 분리 구조 명시
- `window._paste*` 전역 변수 목록 추가

---

### 2026-03-18 — Firebase 즉시 반영 / 직책 순서 / 대학 해체 버그 수정

#### 1. 뷰어 즉시 반영 안 되는 버그 수정 (firebase-init.js)
- **문제**: GitHub data.json에 `savedAt`이 있으면 `off(dataRef)` 호출로 `onValue` 연결 끊김 → GitHub 30초 폴링만 남아 즉시 반영 안 됨
- **수정**: `off(dataRef)` 제거. `onValue`는 항상 유지하고 GitHub 폴링은 보조 백업으로만 사용

#### 2. 직책 순서 flicker 및 다른 기기 순서 불일치 수정 (cloud-board.js)
- **문제**: `boardPlayerOrder`가 Firebase에 저장 안 됨 → Firebase 수신 시 다른 기기에서 순서 달라짐
- **수정**:
  - `fbCloudSave()` `dataObj`에 `boardPlayerOrder` 추가
  - `_applyCloudData()`: `d.boardPlayerOrder`가 있으면 `Object.assign`으로 복원 + localStorage 저장

#### 3. 대학 해체 시 boardPlayerOrder 잔재 데이터 정리 (tier-tour.js)
- **문제**: `confirmDissolve()` 에서 `boardPlayerOrder[u.name]` 삭제 없음 → 해체된 대학 순서 데이터 남아있음
- **수정**: `delete boardPlayerOrder[u.name]; saveBoardPlayerOrder();` 추가

---

### 2026-03-18 — Firebase 누락 필드 동기화 + 프로필 사진 검증 버그 수정

#### 1. Firebase에 누락된 필드들 추가 (cloud-board.js)
- **문제**: `fbCloudSave()` dataObj에 `userMapAlias`, `boardOrder`, `playerStatusIcons`, `notices`, `curProComp`, `_ttCurComp` 없음 → 다른 기기에서 맵 약자/대학 순서/상태 아이콘/공지사항이 반영 안 됨
- **수정**: 위 6개 필드 추가, `_applyCloudData()`에서도 복원 처리

#### 2. boardPlayerOrder 머지 → 교체 수정 (cloud-board.js)
- **문제**: `Object.assign(boardPlayerOrder, d.boardPlayerOrder)` — 삭제된 대학 키가 로컬에 남음
- **수정**: `Object.keys().forEach(delete)` 후 `Object.assign` — 완전 교체

#### 3. Firebase 페이로드 크기 경고 추가 (cloud-board.js)
- **추가**: 저장 전 JSON 크기 계산 → 2MB 초과 시 황색 경고 메시지
- **추가**: Firebase 저장 실패 시 에러 메시지에 구체적인 오류 내용 표시

#### 4. 프로필 사진 base64 URL 차단 (tier-tour.js)
- **문제**: `data:image/...` base64 URL 붙여넣기 → Firebase 페이로드 수십MB → 저장 실패
- **수정**: `savePlayer()` + `addPlayer()`에서 `data:` 시작 URL 차단 알림
- **추가**: 편집 모달 사진 입력 필드에 실시간 경고 표시 + 2000자 초과 확인 요청

---

### 2026-04-15 — 설정탭 테마 메뉴 / 프로리그 자동인식 개선 / 엘보드 관리자 전용

#### 1. 설정탭 카테고리 → 2×2 테마 카드 메뉴 (settings.js)
- **변경**: 기존 탭 pill 스타일 → 2×2 그리드 카드 스타일로 교체
- **카드 구성**: 아이콘 + 카테고리명 + 설명 텍스트 (예: "공지/티어/시즌/경기 운영")
- **활성 상태**: 선택된 카드에 파란 테두리 + 파란 배경 강조
- **바로가기 줄**: 카드 아래 구분선 후 동일하게 유지

#### 2. 프로리그 자동인식 — 여러 경기 별도 레코드로 저장 (search.js)
- **변경**: `===경기구분===` 구분선이 세트 번호 증가 대신 새 **경기 그룹** 시작으로 동작
- `proPreview()`: `/경기\s*구분/` 패턴 감지 시 `currentMatch++`, `currentSet` 리셋
- 각 결과 객체에 `matchGroup` 필드 추가
- 경기 그룹별 날짜: 블록 내 `일자: YYYY-MM-DD` 줄이 있으면 해당 그룹 날짜로 저장 (`window._proMatchDates[mg]`)
- `proApply()`: matchGroup별로 반복 → **각 그룹을 별도 proM 레코드로 저장**
- 저장 토스트: 여러 경기일 때 "N경기 (M게임) 저장 완료" 표시

#### 3. 프로리그 자동인식 — 포맷(2:2/3:3/4:4) proM에 저장 (search.js, history.js)
- `proApply()`: `window._proFormat > 0` 이면 proM 레코드에 `fmt: N` 필드 저장
- `renderProPreview()`: 멀티매치 헤더 및 결과 요약에 포맷 배지 표시
- `recSummaryListHTML()` (history.js): proM 목록에서 `m.fmt > 0` 이면 날짜 옆에 `N:N` 보라색 배지 표시

#### 4. 프로리그 자동인식 — renderProPreview matchGroup별 분리 렌더링 (search.js)
- 단일 경기: 기존과 동일한 단일 테이블
- 여러 경기: 각 경기 그룹을 보라색 테두리 카드로 래핑, 헤더에 "경기 N" + 날짜 + 포맷 배지

#### 5. 엘보드(최근전적) 탭 — 관리자 전용 접근 제한 (elboard.js)
- `rElboard()` 시작 부분에 `isLoggedIn` 체크 추가
- 비로그인 시 설정 탭과 동일한 잠금 UI 표시

---

### 2026-04-18 — 스트리머 상세 중복 경기 제거 / 경기 상세 팝업 오류 수정 / 팝업 닫기 설정

#### Task 9: 스트리머 상세에 중복 경기 제거 (render.js)
- **문제**: `buildPlayerDetailHTML()` 에서 `p.history`와 `_otherMatches` 모두 렌더링 → 같은 경기가 2번 표시됨
- **원인**: gjM/indM/tourneys/comps/proTourneys가 `_id` 필드를 갖지 않아 매치ID 검색이 실패하고, 중복 필터링이 작동 안 함
- **수정**:
  1. `buildPlayerDetailHTML()` 시작에 gjM/indM/tourneys/comps/proTourneys에 `_id` 미리 할당
     - 각 데이터타입별 일관성 있는 key 포맷: `gj_`, `ind_`, `tour_`, `comp_`, `protour_` 접두사
  2. `_gjMatches`/`_indMatches` 추출 시 매치ID 생성 강화 (기존 _id 없으면 생성)
  3. `isDupInHist()` 함수로 `_otherMatches`와 `_extraMatches` 필터링 (p.history와 비교)
  4. `_tourMatches` 추출 시 매치ID 없으면 일관된 형식으로 생성하고 반환 (조기 종료 제거)

#### Task 10: 경기 상세 팝업 오류 수정 + 팝업 닫기 설정 (history.js, render.js, settings.js)
- **문제**: 경기 상세 아이콘(종목 배지) 클릭 시 "해당 경기 상세 데이터를 찾을 수 없습니다" 오류 발생
  - 끝장전, 프로리그 끝장전, 개인전, 조별리그, 대회, 토너먼트, 프로리그대회 등 모든 경기 타입 영향
- **원인**: 
  - `openMatchDetailByMatchId()` (history.js)에서 gjM, indM, proTourneys.gjMatches 검색 누락
  - matchId 검색 풀이 불완전함
- **수정**:
  1. history.js `openMatchDetailByMatchId()` 수정
     - `끝장전` 레이블 → gjM 검색
     - `개인전` 레이블 → indM 검색  
     - `프로리그끝장전` 레이블 → proTourneys[0].gjMatches 검색
     - fallback 풀 확장: gjM, indM, 그리고 모든 proTourneys.gjMatches 추가
  2. render.js match badge onclick 수정: 조건부 팝업 닫기 (아래 설정 참고)
  3. settings.js 스트리머 상세 스타일 섹션에 새 토글 추가
     - "종목 클릭 시 팝업 닫기" 체크박스 (기본값: true)
     - 설정 저장: `su_pd_style.close_on_badge` 불린값

#### 기술 상세
- **중복 제거 핵심**: `_histDupKey` 기반 필터링
  ```js
  const _histDupKey = (m) => `${m.d||''}|${(m.a||m.wName||'').replace(/\s+/g,'')}|${(m.b||m.lName||'').replace(/\s+/g,'')}`;
  const _dedupedHistory = [];
  for(const h of p.history) {
    const k = _histDupKey(h);
    if(!_dedupedHistory.some(x => _histDupKey(x) === k)) _dedupedHistory.push(h);
  }
  ```
- **matchID 생성 포맷**: `${prefix}_${date}${a_or_wName}${b_or_lName}${map_if_exists}`
- **팝업 닫기 조건부 실행**: `close_on_badge !== false` 로 기본값 유지

---

### 향후 작업 시 참고사항

- 파싱 관련 수정 → `search.js` 의 `parsePasteLine`, `pastePreview`, `parseSetSeparator`
- 경기 저장 로직 → `match.js` 의 `saveMatch`, `setBuilderHTML`
- 대회 기능 → `competition.js` + `tier-tour.js` (pasteModal은 tier-tour.js에 있음)
- 선수 스탯 롤백 → `data.js` 의 `revertMatchRecord`
- 새 탭 추가 시 → `render-core.js` 의 `_renderImpl()` switch문에 case 추가
- CSS 변수 수정 → `css/style.css` `:root` 섹션

### 2026-07-23 — 통계탭 새 서브탭: 👤 선수 리포트

**요청**: 외부 사이트(선수 개인 리포트 페이지) 레이아웃을 참고해 통계탭에 선수 검색형 종합 리포트 탭 추가.

- **주의**: `js/stats.js` 는 죽은 파일(어디서도 로드되지 않음) — 실제 rStats는 `js/stats-core.js`. 서브탭 추가는 `stats-core.js`에만 반영함. `stats.js`는 미사용이므로 추후 삭제 검토 필요.
- 신규 파일: `js/stats-player-report.js` (통계탭 지연로딩 목록 — `render-lazy-utils.js` `_ensureStatsLoaded()` 및 `build.mjs` `lazy-stats.js` 청크에 등록)
- `stats-core.js`: `_statsGroups`의 "🔍 기록실" 그룹에 `{id:preport, lbl:선수 리포트}` 추가, `_coreIds`에 포함, 라우터에 `statsPlayerReportHTML` 연결
- 기능: 선수 검색(+최근검색 localStorage `su_prReportRecent`) → 프로필 히어로(사진/종족/대학/티어+순위/ELO/ELO보드 외부링크) → 기간 필터(30일/90일/올해/전체) → 종족별 승률 카드 → 규칙 기반 AI 코멘트(템플릿 문장, 외부 API 미사용) → 최근 중요경기 W/L 스트립(미니대전 제외 토글) → 동일 티어 상대전적(최근 90일, 🔥/🥶 표시) → 1:1 상대 비교 + ELO 표준공식 기반 승부예측 → 최근 경기 표(기존 `buildPlayerRecentHistoryRowHTML` 재사용, 읽기전용)
- ELO 보드는 개인 URL 등록 기능이 없어 `eloboard.com` 검색 링크로만 연결

### 2026-07-23 (2) — 선수 리포트 개선 + 알등이봇 AI 분석 코멘트

- 최근 중요경기 스트립 승패색: 빨강(승)/파랑(패)로 통일 (`var(--score-win)`/`var(--score-lose)`)
- 동일 티어 상대전적 각 행에 프로필 사진(마우스오버 시 2번째 프로필 자동 스왑, 클릭시 상세팝업 — `getPlayerPhotoHTML` 내장기능 재사용) + "상세프로필" 버튼 추가
- 1:1 상대 비교 프로필 이미지 56px → 92px 확대
- 알등이봇에 AI 분석 코멘트 기능 추가: `chatbot-formatters-stats.js`의 `formatPlayerAiAnalysis()` (선수 리포트와 동일한 규칙 기반 로직, 최근 90일 기준 + 대회 경기 병합), `chatbot-handlers.js`에 "OOO AI분석" / "OOO 분석코멘트" 명령어 트리거 추가, `formatPlayerMoreOptions` 더보기 칩에도 노출

### 2026-07-23 (3) — 렌더링 오류 수정: statsPlayerReportHTML is not defined

**원인**: 실서비스는 `index.dist.html` + `dist/js/*` 번들(esbuild로 사전 빌드된 정적 청크)을 서빙하는데, 새 기능은 소스 파일(`js/stats-player-report.js`, 챗봇 AI분석)에만 추가했고 `dist/js/lazy-stats.js` / `lazy-chatbot.js` 번들은 재빌드하지 않아 실제 배포본에는 새 함수가 아예 없었음 → statsSub==='preport'일 때 `_safeRender(statsPlayerReportHTML, ...)`가 인자 평가 단계에서 바로 ReferenceError.

**조치**: `npm install`(esbuild) 후 `node build.mjs` 재실행 → `dist/js/lazy-stats.js`(30개 파일 병합, statsPlayerReportHTML 포함), `dist/js/lazy-chatbot.js`(formatPlayerAiAnalysis 포함) 등 전체 번들 재생성 완료.

**중요 — 앞으로 매 패치마다 지켜야 할 것**: 이 프로젝트는 `js/*.js` 소스와 `dist/js/*` 번들이 분리되어 있고, 실서비스(`index.dist.html`)는 번들만 봄. 소스 js 파일을 수정한 뒤에는 반드시 `node build.mjs`로 dist를 재빌드해야 실제 사이트에 반영됩니다. (`index.html`로 직접 개발 테스트할 때는 소스 파일이 바로 적용되어 이 문제가 안 보임 — 그래서 그동안 놓치기 쉬웠음)

### 2026-07-30 — 현황판 대학비교/레이더 정리: 레이더는 삭제(통계탭 중복), 대학비교는 통계탭으로 이동

**요청**: 현황판탭(board2)의 대학비교/레이더를 통계탭으로 이동하고, 이미 통계탭에 있는 기능이면 삭제.

- **레이더(🕸️)**: 통계탭에 이미 `대학 레이더`(statsRadarHTML, stats-overview-elo.js)가 동일 기능(비교선택 포함)으로 존재 → 완전 중복으로 판단해 현황판에서 `_b2RadarView()` 함수와 관련 탭/버튼을 모두 삭제(이동하지 않음).
- **대학비교(⚔️)**: 통계탭에는 선수 단위 `스트리머 비교`만 있고 대학 단위 직접대결/티어·종족 비교는 없어 중복이 아니므로, 현황판의 `_b2CompareView()`를 `js/stats-overview-elo.js`의 `statsUnivCompareHTML()`로 그대로 이식하고 현황판에서는 삭제.
  - 이식 과정에서 board2 전용 의존 함수를 통계탭 전용으로 독립 구현: `_b2HasRole` → `_statsCvHasRole`, `_b2NameTag` → `_statsCvNameTag`(getPlayerPhotoHTML/openPlayerModal 재사용), `_b2VisUnivs()` → `getAllUnivs()`. 전역 변수도 `_b2CompareA/B` → `_statsCompareA/B`로 분리해 현황판 청크가 로드되지 않은 상태(통계탭 단독 진입)에서도 오류 없이 동작하도록 함.
  - select onchange 시 기존 `document.getElementById('b2-content').innerHTML=...` 방식 대신 통계탭 표준 패턴인 `render()` 재호출로 변경.
- **수정 파일**: `js/board2-core.js`(버튼/탭정의/dispatch 제거), `js/board2-analytics.js`(`_b2RadarView`, `_b2CompareView` 함수 삭제), `js/stats-overview-elo.js`(`statsUnivCompareHTML` 신규), `js/stats-core.js`(🏛️ 대학 그룹에 `⚔️ 대학비교` 서브탭 추가 및 라우터 연결), `js/settings/tabs.js`(하위탭 라벨 목록 정리)
- `node build.mjs` 재빌드 완료 (dist/js/chunk-board.js에서 관련 함수 완전 제거 확인, dist/js/lazy-stats.js에 statsUnivCompareHTML 포함 확인)

### 2026-08-20 — 설정탭 "🎞️ 브리핑 디자인 & 효과" 카테고리 이동 (현황판/펨코 → UI/테마)

**요청**: 일반 대회(대회탭) 브리핑도 설정탭에서 여러 디자인 중 선택 가능해야 하고, "브리핑 디자인 & 효과" 섹션이 지금 위치(카테고리)가 맞지 않는 것 같으니 올바른 카테고리로 옮겨달라는 요청.

- **확인**: 일반 대회 브리핑 디자인 테마 선택 기능은 이미 구현되어 있었음 — `js/competition-briefing.js`의 `_cbBriefingThemeLoad()`(`su_cb_briefing_theme`, auto/mono/navy/crimson/forest/luxury 6종) + `js/settings-render-sec4.js`의 "🎪 대회 브리핑 디자인 테마" select(`briefingfx` 섹션 안)에서 이미 정상 동작. 별도 신규 구현 불필요.
- **문제**: `briefingfx`(🎞️ 브리핑 디자인 & 효과 — 기본/주간 브리핑, 프로리그, 프로리그 끝장전, 프로리그 대회, 일반 대회 브리핑까지 전부 아우르는 디자인 테마 + MVP 카드 효과 설정)가 `_DEFAULT_CATSECS`(`js/settings-b2img.js`)에서 `🧩 현황판/펨코` 카테고리에 속해 있었음 — 이 카테고리는 "현황판/펨코스타일/순서/칩/밝기/배경" 전용인데, `briefingfx`는 현황판뿐 아니라 프로리그·일반 대회 브리핑까지 포괄하는 범용 "디자인 테마" 설정이라 성격이 맞지 않음.
- **수정**: `js/settings-b2img.js`의 `_DEFAULT_CATSECS`에서 `briefingfx`를 `🧩 현황판/펨코` → `🎨 UI/테마`(탭/버튼/필터/폰트/모바일크기/테마 등 디자인 테마류를 모아둔 카테고리)로 이동.
- **기존 사용자 레이아웃 호환**: 설정 메뉴 정리 기능으로 사용자가 이미 저장해 둔 `su_cfg_menu_layout_v1`에는 `briefingfx`가 옛 카테고리에 그대로 박혀 있어 `_DEFAULT_CATSECS`만 바꿔서는 반영되지 않음 → `js/settings-femco-cfg.js` `_cfgMenuNormalize()`에 일회성 마이그레이션 추가(`su_cfg_mig_briefingfx_uitheme_v1` 플래그로 1회만 실행): 기존 레이아웃에서 `briefingfx`를 어느 카테고리에 있든 제거한 뒤 "누락된 섹션은 기본 위치에 추가" 로직에 의해 새 기본 카테고리(`🎨 UI/테마`)로 자동 편입되게 함. 마이그레이션 이후 사용자가 다시 다른 카테고리로 옮기면 그 선택은 유지됨.
- **수정 파일**: `js/settings-b2img.js`(`_DEFAULT_CATSECS`), `js/settings-femco-cfg.js`(`_cfgMenuNormalize` 일회성 이전 로직), `js/settings-render.js`(`🎨 UI/테마` 카테고리 설명에 "브리핑 디자인" 문구 추가)
- `node build.mjs` 재빌드 완료 (dist/js/chunk-core.js에 새 카테고리 배치 반영 확인)

### 2026-08-20 (2) — 현황판(기본/주간) 브리핑 라이트 고정 디자인 (프로리그 브리핑 방식 참고)

**요청**: 프로리그 브리핑을 참고해서 현황판(기본/주간) 브리핑탭도 라이트하게 디자인 변경. 대회 브리핑과는 약간 달라야 하고, 테마도 10가지 정도 있어야 함.

- **확인**: 현황판 브리핑(`.b2w2-wrap`)은 이미 14개 디자인 테마(classic/minimal/vivid/mono/elegant/pastel/luxury/sports/esports/pop/nature/ocean/sunset/neon)와 설정탭 선택 UI(`js/settings-render-sec4.js`, `su_b2_briefing_theme`)가 구현되어 있었음 — 테마 개수 요건은 이미 충족.
- **문제 파악**: `css/board2-briefing.css`에 "다크모드 강제 오버라이드"가 있어 사이트 전체가 `body.dark`일 때 라이트 테마들(classic/minimal/vivid/…)도 어둡게 덮어써지고 있었음. 반면 프로리그 브리핑(`.plb-wrap`)·프로리그 대회(`.pcb-wrap`)·프로리그 끝장전(`.plgb-wrap`)은 애초에 사이트 라이트/다크 모드와 무관하게 항상 고유 톤(다크 네이비 계열)으로 고정되도록 설계돼 있음(각 CSS에 `body.dark` 셀렉터 자체가 없음). "프로리그 브리핑을 참고해서 라이트하게"라는 요청은 이 "사이트 테마와 무관하게 고정" 방식을 현황판 브리핑에도 적용하되, 이번엔 라이트 톤으로 고정하라는 의미로 해석.
- **수정**: `css/board2-briefing.css`
  - `body.dark`/`html.dark`일 때 `.b2w2-wrap`의 paper/ink/rule/shadow 변수를 어둡게 덮어쓰던 2개 오버라이드 블록(베이스 + 테마별) 전부 제거.
  - 기본(classic) 테마 토큰이 `var(--surface, #f8f8f5)`, `var(--text1, #111827)` 등 **전역 사이트 테마 변수**를 우선 참조하던 부분을 전부 고정 hex 값으로 교체 — 전역 다크모드 값이 새어 들어와 카드가 어두워지는 경로 자체를 차단.
  - `.b2w2-din`, `.b2w2-sel`, `.b2w2-preset`, `.b2w2-modebadge`, `.b2w2-rank-badge`, `.b2w2-rank-track`, `.b2w2-racetable-cell`, `.b2w2-card-spotlight` 등 곳곳에 남아있던 `var(--white)`/`var(--text2)`/`var(--text1)`/`var(--surface)`/`var(--border)`/`var(--gold)` 전역 변수 참조를 전부 브리핑 전용 스코프 토큰(`--b2w-*`)으로 교체.
  - dark 전용 테마(luxury/esports/neon)는 원래도 자체적으로 다크 톤이라 영향 없음 — 나머지 11개 라이트 테마가 사이트 다크모드 여부와 무관하게 항상 밝게 유지됨.
  - 대회 브리핑(`.cbs-wrap`)은 이번 변경 대상에서 제외 — 기존대로 사이트 다크모드를 따라가므로, 현황판 브리핑과 자연스럽게 구분됨(요청하신 "대회 브리핑과 약간 달라야 함" 충족).
- **빌드**: `npm install` 후 `node build.mjs` 재빌드 완료 — `dist/css/bundle.css`에 반영 확인(`.b2w2-wrap` 관련 `body.dark` 오버라이드 0건, `--b2w-paper` 고정 hex 값 확인).
- **수정 파일**: `css/board2-briefing.css`

### 2026-08-20 (3) — 현황판 브리핑 기본 디자인, 프로리그 브리핑 구조 참고해 라이트 리뉴얼 + 테마 컬러 다양화

**요청**: 현황판 브리핑탭 기본 디자인을 프로리그 브리핑 기본과 유사한 UI/UX로 라이트하게 개선, 브리핑 전체 디자인 테마들의 색상도 더 다양하게 개선.

- **마스트헤드 → 티커 바**: `.b2w2-masthead`를 얇은 텍스트 줄에서 프로리그 브리핑(`.plb-ticker`)처럼 둥근 알약형 라이트 배너로 교체. 정적 3색 밑줄 대신 accent→accent2 은은한 그라디언트 배경 + 펄스 애니메이션 라이브 닷(`b2wLivePulse`)으로 "지금 이 순간" 방송 느낌을 라이트 톤으로 재현.
- **히어로 배너 리뉴얼**: `.b2w2-hero`를 신문 느낌의 세리프 텍스트클립 타이틀 + 굵은 이중선 구분자에서, 프로리그 브리핑(`.plb-hero`)처럼 accent/accent2 투톤 라디얼 글로우가 번지는 둥근 카드형 배너로 교체. 타이틀은 산세리프 굵게, 설명문은 이탤릭 인용구 대신 알약형 헤드라인 칩으로, `.b2w2-hero-meta-kicker`는 accent→accent2 그라디언트 배지로 변경.
- **KPI 카드**: 상단 3px 라인 방식에서 프로리그 브리핑(`.plb-kpi-card`)처럼 좌측 4px 컬러 스트라이프 방식으로 변경, 모서리를 더 둥글게(14px), 배경을 은은한 컬러워시로 정리.
- **섹션 타이틀**: `.b2w2-highlight-title`에 프로리그 브리핑(`.plb-section-title`)의 다이아몬드 불릿 마커 추가, 세리프 → 산세리프로 통일.
- **타이포그래피 전면 정리**: 브리핑 전 구간(15곳)에서 쓰이던 `Noto Serif KR` 신문체를 모두 `Noto Sans KR` 산세리프로 교체해 프로리그 브리핑과 톤을 맞춤.
- **테마 컬러 다양화**: 14개 테마(classic 포함) 전체에 새 토큰 `--b2w-accent2`(보조색)를 추가해, 설정탭 라벨에 적힌 의도된 배색(예: 비비드=보라·핑크, 팝=오렌지·틸, 스포츠=레드·블루, e스포츠=퍼플·시안, 오션=블루 그라디언트 등)이 히어로/티커/KPI 카드의 실제 투톤 그라디언트로 드러나도록 함. 기존엔 이 보조색이 `rgba()` 안에만 파묻혀 있어 테마 간 차이가 잘 안 느껴졌던 문제를 해결.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/css/bundle.css`에 `--b2w-accent2` 14종 전체 및 `b2wLivePulse` 애니메이션 반영 확인.
- **수정 파일**: `css/board2-briefing.css`

### 2026-08-20 (4) — 현황판 브리핑 "안 바뀐 것처럼 보이는" 문제 원인 발견·해결: 레거시 !important 레이어 제거 + 대회 브리핑 수준으로 재조정

**요청**: (사용자가 대회 브리핑 스크린샷을 첨부하며) "딱히 바뀐거 없는데? 캡쳐 이미지처럼 좀 개선하면 안되나?"

- **근본 원인 발견**: (2), (3) 세션에서 `css/board2-briefing.css`를 아무리 고쳐도 실제 화면에 반영되지 않았던 이유를 확인함 — `css/ui-custom-v3.css`에 `#b2-content .b2w2-hero`, `.b2w2-kpi-card`, `.b2w2-masthead` 등을 `!important`로 통째로 재정의하는 507줄짜리 "1. 브리핑 디자인 개선" 섹션이 별도로 존재했고(구버전 리퀘스트로 추가된 레이어), 이게 항상 board2-briefing.css의 새 스타일을 덮어쓰고 있었음. 게다가 `css/dark-mode-fixes.css`에도 이 레이어의 "다크 대응" 자동 생성 규칙 39건이 있어, 지난 세션(2)에서 "사이트 다크모드와 무관하게 항상 라이트 고정"을 목표로 board2-briefing.css를 고쳤음에도 이 별도 파일이 여전히 `:is(body.dark,html.dark) #b2-content .b2w2-hero{...!important}` 등으로 어둡게 강제하고 있었음.
- **스크린샷 분석**: 첨부 스크린샷은 사실 현황판(주간) 브리핑이 아니라 **대회 브리핑(종합, cbs-wrap + 내부 b2w2-wrap/cbf-sec 조합)** 화면이었음 — `.cbs-metabar`(플랫 상단바)/`.cbs-hero`(라디얼 글로우 없는 단순 2색 그라디언트 + 대시라인 키커)/`.cbs-kpi-card`(좌측 3px 컬러바, 플랫 화이트 카드) 레시피를 그대로 확인해 현황판 브리핑에도 동일 레시피를 적용.
- **수정 1 (`css/board2-briefing.css`)**: masthead를 알약형에서 대회 브리핑과 같은 플랫 바(하단 보더 + 작은 이슈 배지)로, hero를 라디얼 글로우/알약칩에서 단순 상하 그라디언트 + 대시라인 키커(`.b2w2-hero-kicker`, 신규) + 플레인 본문 텍스트로, kpi-card를 색상 워시 배경에서 플랫 화이트 배경 + 얇은 좌측 컬러바로 재조정. hero와 kpi-grid를 각각 독립된 둥근 카드로 분리(DOM상 사이에 modebar/hdr가 끼어 있어 이어붙이면 시각적으로 끊겨 보이는 문제 방지).
- **수정 2 (`js/board2-briefing-view.js`)**: 히어로 상단의 인라인 스타일 키커 문구를 `.b2w2-hero-kicker` 클래스로 교체(대시라인 장식 적용 가능하도록).
- **수정 3 (`css/ui-custom-v3.css`)**: 위 레거시 "1. 브리핑 디자인 개선" 섹션(507줄, `#b2-content .b2w2-*` `!important` 전체) 삭제 — board2-briefing.css의 전면 재설계로 완전히 대체됨.
- **수정 4 (`css/dark-mode-fixes.css`)**: `.b2w2-*`/`#b2-content .b2w2-*`를 대상으로 한 다크모드 `!important` 규칙 39건 전부 제거 — 현황판 브리핑은 이제 어떤 레이어에서도 사이트 다크모드에 반응하지 않고 항상 라이트 톤 유지.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료. `dist/css/bundle.css`에서 `#b2-content .b2w2-hero` 관련 규칙 0건, 다크모드 `.b2w2-*` 강제 규칙 0건 확인.
- **수정 파일**: `css/board2-briefing.css`, `js/board2-briefing-view.js`, `css/ui-custom-v3.css`, `css/dark-mode-fixes.css`

### 2026-08-20 (5) — 현황판 브리핑 박스/배경 색상화 + 테마 인식형 다크모드 재도입

**요청**: 네모 박스에 흰색인 부분 색 넣기, 각 테마별로 색상 다르게, 바탕 배경도 색상 있어야 하고 각 테마색으로, 다크모드시 작동 안되는 부분 다크모드 되게 하기.

- **박스(카드) 색상화**: KPI 카드·히어로 메타 패널 등이 참조하는 `--b2w-paper-alt`가 11개 라이트 테마 전부 `#ffffff` 고정값이었던 것을, `color-mix(in srgb, var(--b2w-accent) 5%, #ffffff)`로 교체 — 이제 테마의 accent 색이 옅게 배어든 카드 배경이 되어 테마마다 박스 색이 달라짐(모노 테마는 원래도 세피아 톤이라 제외).
- **배경(canvas) 색상화**: `--b2w-paper`(페이지 캔버스)도 하드코딩 hex 대신 `color-mix(in srgb, var(--b2w-accent) 9%, #f8fafc)`(+ paper-warm은 accent2 11%)로 교체해 테마별 색이 더 뚜렷하게 드러나도록 강화.
- **다크모드 재도입(테마 인식형)**: 세션 (2)에서 "항상 라이트로 고정"하며 다크모드 대응 자체를 없앴던 것을, 이번엔 색상화 인프라(`--b2w-accent` 기반 `color-mix()`)를 활용해 **테마마다 다른 색을 유지하면서** 다크모드에서도 제대로 어두워지도록 재도입. 기존(예전 세션 이전) 방식은 모든 라이트 테마를 똑같은 남색 하나로 덮어써서 "테마를 뭘 골라도 다크모드에선 똑같아 보이는" 문제가 있었는데, `:is(body.dark,html.dark) .b2w2-wrap:not([data-theme="luxury"]):not([data-theme="esports"]):not([data-theme="neon"])` 규칙에서 `var(--b2w-accent)`/`var(--b2w-accent2)`를 어두운 배경에 섞어 테마 고유 색감이 다크모드에서도 유지되도록 함. 다크 전용 테마(luxury/esports/neon)는 이미 항상 다크라 제외.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료. `dist/css/bundle.css`에서 `--b2w-paper`/`--b2w-paper-alt`의 라이트·다크 `color-mix()` 규칙과 4개 다크 전용/세피아 테마의 고정값이 모두 정상 반영된 것을 확인.
- **수정 파일**: `css/board2-briefing.css`

### 2026-08-20 (6) — 흰 박스 잔존 문제 해결: 카드류가 캔버스와 같은 변수를 써서 안 보이던 색

**요청**: (스크린샷 3장 첨부) 대학별 카드(JSA/케이대 등), TOP3/승률변동 등 하이라이트 카드, 대학별 전적현황·종족전 메타 표가 여전히 흰색으로 보임 — 흰색 부분에 색 넣고 테마별로 다르게.

- **원인**: 세션 (5)에서 `--b2w-paper-alt`(카드용)와 `--b2w-paper`(페이지 캔버스용)를 다르게 색상화했는데, `.b2w2-card`(대학별 카드), `.b2w2-highlight-card`(TOP3/승률변동 등), `.b2w2-chart-box`(대학별 전적현황·종족전 메타), `.b2w2-hdr`(필터바), `.b2w2-modecard`, `.b2w2-ace-empty` 6곳이 실수로 카드용 `--b2w-paper-alt`가 아니라 **캔버스용 `--b2w-paper`를 그대로 쓰고 있었음** — 카드와 배경이 정확히 같은 색이 되어버려 "카드가 흰 배경에 묻혀 안 보이는" 것처럼 보였던 것.
- **수정**: 위 6곳 전부 `background: var(--b2w-paper)` → `background: var(--b2w-paper-alt)`로 교체. 이제 대학별 카드·하이라이트 카드·차트 박스가 캔버스보다 살짝 더 진하게 테마색이 배어든 카드 배경으로 캔버스와 뚜렷하게 구분되어 보임.
- **점검**: b2w2 전 구간(masthead~kpi-grid~highlight~카드~테이블)에서 하드코딩된 `#fff`/`white`/`var(--white)` 배경이 남아있지 않은지 재검사 완료 — 전부 테마 토큰(`--b2w-paper-alt`)을 통해 렌더링됨.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/css/bundle.css`에서 `.b2w2-card`/`.b2w2-highlight-card`/`.b2w2-chart-box`가 모두 `var(--b2w-paper-alt)`를 사용함을 확인.
- **수정 파일**: `css/board2-briefing.css`

### 2026-08-20 (7) — 태그/칩 배경이 전 테마 공통 회색·모드카드 호버색이 히어로와 동일했던 문제 수정

**요청**: 주간/월간/기간/MVP 모드카드에 마우스를 올렸을 때 배경색이 상단 히어로 배너와 같아서 어색함. 스크린샷(케이대 카드, 데이터범위 필터칩 행) 참고해 박스 밖의 흰색(회색) 부분에도 색 넣기. 두 번째 스크린샷 체크 표시 부분(마스트헤드, 모드카드, 데이터범위 필터칩 행) 색상 보완.

- **모드카드 호버 색상 분리**: `.b2w2-modecard:hover`가 `.b2w2-hero`와 동일한 `--b2w-paper-warm` 변수를 그대로 재사용하고 있어서 호버 시 히어로 배너와 똑같은 톤으로 보였음 → `color-mix(in srgb, var(--b2w-accent) 6%, var(--b2w-paper-alt))`로 교체해 카드 자체 톤과 연속성은 유지하되 히어로와는 다른 은은한 강조색으로 분리.
- **태그/필터칩 배경 테마화**: "데이터 범위" 필터칩 행(미니대전/대학대전/대회·조별리그 등)과 노트칩(활동 스트리머 N명), 티어대회 칩 등이 참조하는 `--b2w-tag-bg`/`--b2w-tag-border`/`--b2w-tag-text`/`--b2w-tag-muted`/`--b2w-tag-accent-bg`/`--b2w-tag-accent-border`가 14개 테마 전부 똑같은 고정 회색·고정 블루(`#f1f5f9`/`#eff6ff` 등)였던 것을, 베이스 토큰 하나만 `color-mix(in srgb, var(--b2w-accent) N%, ...)` 형태로 바꿔 CSS 커스텀 프로퍼티의 값 해석 특성상(참조되는 시점의 최종 캐스케이드 값을 따름) 14개 테마 전부에 자동으로 각 테마 accent가 반영되도록 함 — 테마 블록을 하나하나 고칠 필요 없이 한 곳 수정으로 전체 적용.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/css/bundle.css`에서 `--b2w-tag-bg`가 `color-mix()` 형태로, `.b2w2-modecard:hover`가 히어로와 다른 색상 공식을 쓰는 것을 확인.
- **수정 파일**: `css/board2-briefing.css`

### 2026-08-20 (8) — 색상 강도 상향: 색이 섞이긴 했는데 눈에 잘 안 띄던 문제

**요청**: (스크린샷 4장) 데이터 범위 필터칩 행, 마스트헤드 STAR DATACENTER 배지 주변, 대학별 스트리머 테이블 등이 여전히 흰색으로 보임 — 색상을 더 예쁘게.

- **원인**: 색상화 자체는 다 적용돼 있었지만 `color-mix()` 혼합 비율이 5~10% 수준으로 너무 낮아서, 옅은 톤의 accent 색(특히 파랑 계열)은 흰 배경과 거의 구분이 안 갈 정도로 옅게 나왔음. 카드(`--b2w-paper-alt`)를 상속하는 대학별 카드 본문·스트리머 테이블(`.b2w2-table-wrap`/`.b2w2-tbl`)도 같은 이유로 여전히 "흰색"으로 인지됨.
- **수정**: `css/board2-briefing.css`의 색상 토큰 혼합 비율을 전반적으로 상향
  - `--b2w-paper-alt`(카드): 5% → 10%
  - `--b2w-paper`(캔버스): 9% → 13%
  - `--b2w-paper-warm`: 11% → 16%
  - `--b2w-tag-bg`(일반 필터칩): 7% → 13%, `--b2w-tag-border`: 16% → 26%
  - `--b2w-tag-accent-bg`(티어대회 칩 등): 10% → 16%, `--b2w-tag-accent-border`: 26% → 34%
  - 카드·테이블·필터칩·마스트헤드 배지 등은 전부 이 토큰들을 참조하므로 한 곳 수정으로 전체 반영됨 (테마 14종 전부 동일 비율로 일괄 상향).
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/css/bundle.css`에서 상향된 비율 반영 확인.
- **수정 파일**: `css/board2-briefing.css`

### 2026-08-20 (9) — "대회 브리핑처럼 깔끔하지 않다" 피드백 반영: 색 강도 대폭 하향(과다 채색 교정)

**요청**: 대회 브리핑처럼 깔끔하게 안 되나? 지금은 깔끔하지 않음.

- **원인**: 직전 (8)에서 "흰색으로 보인다"는 피드백에 맞춰 색 혼합 비율을 5~16%까지 계속 올렸는데, 정작 참고 대상인 대회 브리핑(cbs)의 실제 레시피는 카드가 순백(`--cbs-card:#fff`)에 가깝고 캔버스도 아주 옅은 오프화이트(`--cbs-paper-2:#faf8f3`)뿐이며, 색은 좌측 포인트바·배지·버튼 등 "강조 요소"에만 집중되어 있음. (8)의 상향이 카드 배경 전체를 진하게 물들이면서 오히려 그 "여백 있는 깔끔함"에서 멀어졌음.
- **수정**: 대회 브리핑 실제 비율에 맞춰 대폭 하향 조정
  - `--b2w-paper-alt`(카드): 10% → 3% (거의 순백에 가깝게, cbs-card와 동일한 톤)
  - `--b2w-paper`(캔버스): 13% → 5%
  - `--b2w-paper-warm`: 16% → 7%
  - `--b2w-tag-bg`: 13% → 5%, `--b2w-tag-border`: 26% → 14%
  - `--b2w-tag-accent-bg`: 16% → 6%, `--b2w-tag-accent-border`: 34% → 24%
  - 카드·좌측 포인트바(kpi-card)·배지·버튼 등 "강조 요소"의 색은 그대로 유지하고, 배경만 절제해 대회 브리핑과 같은 여백감 있는 화이트 톤으로 되돌림.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/css/bundle.css`에서 하향된 비율 반영 확인.
- **수정 파일**: `css/board2-briefing.css`

### 2026-08-20 (10) — 브리핑탭 바깥 여백도 테마색으로, 모드카드 선택 테두리는 이미 테마색이었음(확인)

**요청**: 브리핑 탭 전체 배경색이 흰색인데 테마색으로. 주간/월간/기간/MVP 선택 시 파란 테두리가 생기는데 테마에 맞게.

- **바깥 여백 배경**: `.b2w2-wrap`은 `max-width:1320px; margin:0 auto`로 가운데 정렬되는 카드라, 좌우/상하 여백은 부모 컨테이너(`#b2-content`)의 배경이 그대로 드러나 있었음 — 지금까지 이 부분은 어떤 색상화 작업도 닿지 않는 흰 배경이었음. CSS 커스텀 프로퍼티는 자식→부모 방향으로 상속되지 않아 `.b2w2-wrap`에 정의된 `--b2w-accent`를 조상인 `#b2-content`에서 그대로 쓸 수 없으므로, `#b2-content:has(> .b2w2-wrap[data-theme="..."])` 형태로 14개 테마의 accent hex를 직접 매핑해 부모 배경도 테마 톤에 맞게 물들임(다크 전용 테마 3종은 그 테마 고유의 어두운 페이퍼 색을, 나머지는 라이트/다크모드 각각의 톤을 반영).
- **모드카드(주간/월간/기간/MVP) 선택 테두리**: 코드 확인 결과 `.b2w2-modecard.is-active`는 처음부터 `border-color: var(--b2w-accent)`로 테마 종속적이었고, 다른 CSS 파일에서 이를 오버라이드하는 규칙도 없음 — 즉 이미 테마별로 색이 바뀌도록 되어 있음. 기본(classic) 테마의 accent가 파란색(#2563eb)이라 다른 테마로 바꿔보지 않으면 "항상 파랗다"고 느껴질 수 있음. 설정탭에서 "브리핑 전체 디자인 테마"를 classic 외의 것으로 바꿔서 확인 부탁드립니다 — 별도 코드 수정은 하지 않음.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/css/bundle.css`에서 `#b2-content:has(>.b2w2-wrap[data-theme=...])` 규칙 14종(라이트/다크 각각)이 정상 반영된 것을 확인.
- **수정 파일**: `css/board2-briefing.css`

### 2026-08-20 (11) — 색 강도 재조정(중간값)과 모드카드 선택 테두리 소프트화

**요청**: 카드 배경/페이지 배경/필터칩/대학별 스트리머 카드가 너무 연해서 흰색 같음 — 색상 더 넣기. 주간/월간/기간 선택 시 파란 테두리가 생기는데 각각 테마색으로 하되 연하게.

- **색 강도 재조정**: (9)에서 대회 브리핑처럼 절제된 톤(3~7%)으로 낮췄던 것을, 여전히 흰색처럼 보인다는 피드백에 맞춰 중간 수준으로 다시 올림
  - `--b2w-paper-alt`(카드): 3% → 7%
  - `--b2w-paper`(캔버스): 5% → 8%
  - `--b2w-paper-warm`: 7% → 10%
  - `--b2w-tag-bg`: 5% → 9%, `--b2w-tag-border`: 14% → 20%
  - `--b2w-tag-accent-bg`: 6% → 11%, `--b2w-tag-accent-border`: 24% → 28%
  - `#b2-content` 바깥 여백 배경(라이트): 5% → 8%
- **모드카드 선택 테두리 소프트화**: `.b2w2-modecard.is-active`의 `border-color`가 `var(--b2w-accent)`(100% 순색)이라 테마와 무관하게 항상 "쨍한 원색 테두리"로 보였음 → `color-mix(in srgb, var(--b2w-accent) 55%, var(--b2w-paper-alt))`로 바꿔, 여전히 테마별로 다른 색이면서 카드 배경(paper-alt)과 섞인 훨씬 연한 톤으로 완화.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/css/bundle.css`에서 조정된 비율과 소프트화된 모드카드 테두리 반영 확인.
- **수정 파일**: `css/board2-briefing.css`

### 2026-08-20 (12) — 스트리머 테이블 줄무늬가 전역 회색으로 하드코딩돼 있던 버그 발견, 클래식 테마 보라색 제거

**요청**: (스크린샷) 대학별 스트리머 목록 테이블에 왜 색이 없는지, 클래식(기본) 테마가 보라색 계열로 보이는데 다른 색으로, 주간/월간/기간/MVP 선택 시 여전히 파란 테두리가 있음(모드카드 테두리를 말하는 것).

- **스트리머 테이블 줄무늬 버그(진짜 원인)**: `js/board2-briefing-view.js`의 대학별 선수 순위 테이블에서 홀수 행 배경이 `const _zebraBg = i % 2 === 1 ? 'var(--surface,#f8fafc)' : 'transparent'`로, 브리핑 테마 토큰이 아니라 **사이트 전역 `--surface` 변수를 그대로 하드코딩**하고 있었음 — 그래서 테이블 안 절반 가까운 행이 테마와 무관하게 항상 흰색/연회색으로 보였던 것. `var(--b2w-paper-warm)`로 교체.
- **부수 정리**: `대학별 전적 현황` 정렬 토글 버튼 배경도 `var(--surface,#f1f5f9)` → `var(--b2w-tag-bg)`로, 활성 버튼 배경도 `var(--b2w-paper,#fff)`(캔버스색, 카드와 안 어울림) → `var(--b2w-paper-alt,#fff)`로 교체.
- **클래식 테마 보라색 제거**: 클래식(기본) 테마의 `--b2w-accent2`가 보라(`#7c3aed`)로 설정돼 있어, 이 값을 참조하는 히어로/KPI 패널 배경(`--b2w-paper-warm`)이 파란 accent와 안 어울리는 보라 톤으로 물들었음 → 클래식의 보조색을 원래 있던 골드(`#b8862c`, 매거진 느낌의 블루+골드 조합)로 교체.
- **모드카드 선택 테두리 재조정**: 클래식 테마의 accent가 파란색인 이상 그 테두리도 파란 계열로 나오는 게 테마상 정상 동작이지만(다른 테마를 고르면 그 테마 색으로 바뀜), "여전히 진하다"는 피드백을 반영해 혼합 비율을 55% → 32%로 한 번 더 낮춤.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/js/chunk-board.js`에서 줄무늬가 `var(--b2w-paper-warm)`을 쓰는 것과 `dist/css/bundle.css`에서 클래식 accent2가 골드로 바뀐 것을 확인.
- **수정 파일**: `js/board2-briefing-view.js`, `css/board2-briefing.css`

### 2026-08-20 (13) — 이달의 인기 MVP 투표 카드 색상화, 대학 로고 추가, 클래식 accent2 블루로 재변경, 테이블 호버 효과 강화

**요청**: (스크린샷) "이달의 인기 MVP" 투표 목록도 흰색, 대학명 좌측에 대학 로고가 없음(있어야 함), 골드색(블루+골드 조합)이 안 어울리니 파란 계열로, 효과 더 있으면 좋겠음.

- **투표 행 색상화**: `js/board2-briefing-mvp-vote.js`의 `.b2w2-mvpvote-row`가 미선택 상태일 때 `background: var(--white)`, `border: var(--border)`로 사이트 전역 변수를 하드코딩하고 있었음 → `var(--b2w-paper-alt)`/`var(--b2w-rule)`로 교체해 테마 톤을 따라가도록 함.
- **대학 로고 추가**: 후보 행의 대학명 뱃지(`${c.univ}`) 앞에 로고가 없었음 → 다른 화면에서 쓰는 대학 아이콘 헬퍼 `gUI(univName, size)`를 그대로 재사용해 대학명 왼쪽에 로고 아이콘을 추가.
- **클래식 테마 보조색 재변경**: 직전 세션에서 골드(#b8862c, 블루+골드 조합)로 바꿨던 것이 안 어울린다는 피드백을 받아, 파란 계열 모노톤(#1d4ed8, 진한 블루)으로 재변경 — 이제 클래식 테마는 메인 accent(#2563eb)와 보조색이 둘 다 블루 계열로 통일된 톤.
- **효과 보강**: 투표 행에 호버 시 살짝 떠오르는(translateY) + 그림자 효과 추가. 대학별 스트리머 테이블(`b2w2-tbl`) 행 호버 시 배경 전환에 트랜지션을 추가하고, 첫 번째 셀에 accent색 좌측 강조선이 나타나도록 해서 상호작용감을 높임.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/js/chunk-board.js`에서 `gUI(c.univ...)` 로고 호출과 `dist/css/bundle.css`에서 클래식 accent2가 블루로 바뀐 것을 확인.
- **수정 파일**: `js/board2-briefing-mvp-vote.js`, `css/board2-briefing.css`

### 2026-08-20 (14) — 스트리머 테이블 색상 더 강하게(전용 공식으로 분리), 1위 배지 골드→테마색, 은은한 펄스 효과 추가

**요청**: (진한 블루로 바꾼 것에) 효과 있으면 좋겠음. 스트리머/전체전적/최근폼 아래 스트리머 테이블 배경이 계속 흰색으로 보임(반복 지적). 이번달 대학 순위의 골드색 배지가 배경과 안 어울림 — 어울리는 색으로.

- **스트리머 테이블 색상 강화**: 공유 토큰(`--b2w-paper-warm` 등)을 계속 만졌다가 다른 요소까지 같이 흔들리는 문제가 있어, 이번엔 테이블 전용으로 `color-mix(in srgb, var(--b2w-accent) 9%, var(--b2w-paper-alt))`(홀수 행)와 `color-mix(in srgb, var(--b2w-accent) 6%, var(--b2w-paper-alt))`(테이블 감싸는 `.b2w2-table-wrap` 자체)를 새로 지정 — 공유 토큰 값과 무관하게 이 테이블만 확실히 진하게 보이도록 분리.
- **1위 순위 배지 골드 → 테마색**: `.b2w2-rank-badge.gold`(대학별 전적 현황 차트의 1위 배지 등)가 고정 노란/주황 그라디언트(`#fde68a→#f59e0b`)였던 것을, 페이지 accent 색 그라디언트로 교체해 배경과 확실히 어울리게 함. 은메달은 무채색 그대로 두고, 동메달은 accent2를 살짝 섞어 톤을 맞춤.
- **효과 추가**: 1위 배지에 은은하게 그림자가 커졌다 작아졌다 하는 펄스 애니메이션(`b2wGoldPulse`) 추가(모션 최소화 설정 시 자동 비활성).
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료, `dist/css/bundle.css`/`dist/js/chunk-board.js`에서 전부 반영 확인.
- **수정 파일**: `css/board2-briefing.css`, `js/board2-briefing-view.js`

### 2026-08-20 (15) — 투표 문구 굵게+명칭 변경, 카드 내 KPI 셀 색상 보강, 히어로/KPI패널 그라디언트 깊이감, 클래식 보조색 재조정(단조로운 블루 탈피)

**요청**: 투표 설명 문구를 진하게, "이달의 인기 MVP" → "이달의 인기 투표"로 명칭 변경. 여전히 흰 부분이 있음(대학 카드 안 활동인원/팀전적/팀승률 셀). 색이 점점 진해지는 그라디언트 효과, 상단 배너에도 효과. 전체적으로 파란 계열 일색이라 단조로움.

- **문구 수정**: `js/board2-briefing-view.js`에서 섹션 제목을 "🗳️ 이달의 인기 MVP" → "🗳️ 이달의 인기 투표"로, 안내 설명문에 `font-weight:700`을 추가해 진하게.
- **카드 내부 KPI 셀 보강**: `.b2w2-card-kpi`(대학 카드의 활동인원/팀전적/팀승률 3칸)가 카드 배경과 완전히 같은 색이라 구분이 안 갔음 → accent를 6% 추가로 섞어 카드 배경보다 한 톤 더 진하게 분리.
- **그라디언트 깊이감 추가**: `.b2w2-hero`와 `.b2w2-kpi-grid`를 단색/2단 그라디언트에서, 대각선으로 갈수록 accent 색이 점점 진해지는 3단 그라디언트로 교체 — "색이 점점 진해지는 효과" 요청 반영.
- **클래식 테마 보조색 재조정**: 직전 세션에 진한 블루(#1d4ed8)로 바꿨더니 전체가 블루 일색으로 단조롭다는 피드백을 받아, 파란 계열이면서도 시각적으로 구분되는 시안·틸 톤(#0891b2)으로 교체 — 메인(블루)·보조(시안) 투톤으로 단조로움 완화.
- **빌드**: `npm install` → `node build.mjs` 재빌드 완료. 미니파이된 번들은 한글이 `\uXXXX` 유니코드 이스케이프로 저장되는데, 디코드해서 "이달의 인기 투표"·굵은 설명문·새 accent2·3단 그라디언트가 전부 정상 반영된 것을 확인.
- **수정 파일**: `js/board2-briefing-view.js`, `css/board2-briefing.css`
