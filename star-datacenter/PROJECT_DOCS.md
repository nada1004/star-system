# 스타대학 데이터 센터 — 상세 프로젝트 문서

> 이 문서는 Claude Code가 작업 시 참조하는 전체 기능 명세서입니다.
> 최종 업데이트: 2026-03-02

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
    ├── constants.js        # [필수 1번째 로드] 전역 변수 선언·상수·유틸
    ├── data.js             # revertMatchRecord() 매치 삭제 롤백
    ├── render.js           # sw() 탭전환, render() 라우터, save(), 모달
    ├── players.js          # rTotal() 스트리머목록, rTier() 티어순위
    ├── vs.js               # 1:1 상대전적 검색
    ├── history.js          # rHist() 대전기록 탭 (11개 서브탭)
    ├── match.js            # rRace() 종족별, rUniv() 대학별 탭
    ├── match-builder.js    # rMini() rCK() rUnivM() rPro() 경기입력
    ├── competition.js      # rComp() 대회·토너먼트·브래킷 관리
    ├── tier-tour.js        # rTierTour(), openGrpPasteModal() 대회붙여넣기
    ├── stats.js            # rStats() 20+ 통계 서브탭
    ├── calendar.js         # rCal() 캘린더 (월/주/일 뷰)
    ├── vote.js             # rVote() 승부예측
    ├── auth.js             # doLogin() SHA-256 인증
    ├── init.js             # init() 앱 시작, autoLoad() GitHub 자동로드
    ├── protection.js       # 우클릭·F12·Ctrl+U 차단
    ├── cloud-board.js      # cloudLoad() 수동동기화, rBoard() 현황판
    ├── search.js           # 글로벌 선수검색, 붙여넣기 파싱 전체 로직
    ├── modal-drag.js       # 모달 드래그 이동 (PC), 모바일 경기 상세
    └── mobile-bar.js       # 모바일 하단 내비 표시 제어
```

### 스크립트 로드 순서 (index.html 하단)
```
constants.js → data.js → render.js → players.js → vs.js → history.js
→ match.js → match-builder.js → competition.js → tier-tour.js
→ stats.js → calendar.js → vote.js → auth.js → init.js
```
> ⚠️ `constants.js`가 반드시 첫 번째여야 함 (전역변수 선언)

---

## 3. 화면(탭)별 기능

### 탭 라우팅 구조
```javascript
sw(tabName, el) → curTab 변경 → render() → switch(curTab) → r{탭명}(C, T)
```
- `C` = `#rcont` (콘텐츠 div)
- `T` = `#rtitle` (제목 span)

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

### render.js
| 함수 | 설명 |
|------|------|
| `sw(t, el)` | 탭 전환 + 서브탭 초기화 |
| `render()` | 현재 탭 재렌더링 |
| `om(id)` | 모달 열기 |
| `cm(id)` | 모달 닫기 |
| `openPlayerModal(name)` | 선수 상세 모달 |
| `openUnivModal(name)` | 대학 상세 모달 |
| `deletePlayerHist(idx, mode)` | 경기기록 삭제 + ELO 롤백 |
| `stabs(cur, opts)` | 서브탭 버튼 그룹 HTML |

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
| `playerModal` | render.js | 선수 상세 정보 |
| `univModal` | render.js | 대학 상세 정보 |
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

### 2026-04-13 — 4개 버그 수정 및 조별리그 기록 탭 추가

#### 1. cfg.js 설정 탭 복구 (cfg.js 906줄)
- **문제**: `} // end first rCfg` 주석이 남아있어 설정 탭이 정상적으로 렌더링되지 않음
- **수정**: 906줄의 `} // end first rCfg` 삭제

#### 2. tier-tour.js + cfg.js UTF-8 인코딩 수정
- **문제**: '??' 이모지가 깨져서 표시됨
- **수정**: tier-tour.js와 cfg.js 전체 파일 UTF-8로 다시 저장

#### 3. 조별리그 기록·토너먼트 기록 탭 추가 (tier-tour.js)
- **추가**: `_validSubs`에 `'leaguerecords'`, `'tourrecords'` 추가
- **추가**: `subOpts`에 레이블 및 렌더링 블록 추가
- **기능**: 조별리그 기록 탭, 토너먼트 기록 탭 새로 추가

#### 4. 스트리머 상세 최근 기록 중복 제거 버그 수정 (render.js)
- **문제**: 조별리그/티어대회에서 같은 경기 내 SET1과 SET2에서 동일 선수 조합 + 동일 맵이 나오면 중복으로 차단돼서 스트리머 상세 최근 경기에 1개만 등록됨
- **원인**: `_histDupKey` 함수가 matchId가 있으면 map을 무시하고 'mid:{matchId}' 하나의 키만 생성함
- **수정**: `_histDupKey` 함수에서 map을 키에 포함하도록 수정
  ```js
  // 수정 전
  if(h?.matchId) return `mid:${h.matchId}`;
  // 수정 후
  if(h?.matchId) return `mid:${h.matchId}|${h?.map||'-'}`;
  ```

#### 5. match.js 게임별 고유 ID 적용 (match.js)
- **문제**: match.js에서 applyGameResult에 경기 전체 ID(matchId)를 넘겨서 같은 경기 내 게임들이 중복 제거됨
- **수정**: 게임별 고유 ID 사용
  - sets 루프: `${matchId}_s${si}_g${gi}` 형태
  - freeGames 루프: `${matchId}_g${gi}` 형태
- **수정 위치**:
  - gj 모드 freeGames 루프 (366-373줄)
  - ind 모드 freeGames 루프 (384-391줄)
  - noSetMode freeGames 루프 (399-407줄)
  - gj 모드 sets 루프 (476-485줄)
  - 공통 sets 루프 (492-502줄)

---

### 향후 작업 시 참고사항

- 파싱 관련 수정 → `search.js` 의 `parsePasteLine`, `pastePreview`, `parseSetSeparator`
- 경기 저장 로직 → `match.js` 의 `saveMatch`, `setBuilderHTML`
- 대회 기능 → `competition.js` + `tier-tour.js` (pasteModal은 tier-tour.js에 있음)
- 선수 스탯 롤백 → `data.js` 의 `revertMatchRecord`
- 새 탭 추가 시 → `render.js` 의 `render()` switch문에 case 추가
- CSS 변수 수정 → `css/style.css` `:root` 섹션
