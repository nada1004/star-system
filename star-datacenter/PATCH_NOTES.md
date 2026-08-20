# 일반대회 브리핑 수정 패치 (2026-08-20)

`js/competition-briefing.js` + 관련 빌드 산출물 갱신 패치입니다.

## 수정 내역

1. **음성듣기(TTS) 동작 — 프로리그 패턴 통일**
   - `window._cbBriefingSpeakSnapshot`을 3개 브리핑(조별/토너먼트/종합) 모두에서 채우도록 추가
   - `_cbBriefingBuildSpeakQueue()` 큐 생성기 신설
   - `_cbBriefingToggleSpeak(btn)`에서 `window.SUTTS.speak(queue, {onEnd})`로 실제 큐 전달
   - 버튼 라벨 `🔊 음성듣기 / ⏸ 일시정지 / ▶ 이어듣기` 토글 동작

2. **대회 MVP 위 초록선 제거**
   - 진행률 바의 100% 색을 `#16a34a` → `var(--cbs-accent)`로 교체
   - `.cbs-wrap .b2w2-card`에 `border-top:1px solid !important` 명시 (4px 컬러 top border 차단)
   - cbf-sec 상단 라인도 `var(--cbs-rule)` 토큰으로 통일

3. **다크모드 지원 추가**
   - `--cbs-paper / --cbs-card / --cbs-ink / --cbs-rule` 등 다크 토큰 도입
   - `body.dark .cbs-wrap.tone-{mt,pc,lv}` 3개 톤 모두 다크 변수 오버라이드
   - `cbs-wrap .b2w2-wrap`의 `--b2w-*` 변수를 cbs-* 토큰으로 재매핑
   - b2w2-wrap `data-theme="dark"` 실제 동작하도록 매핑 추가
   - 인라인 `style="background:#fff"` / `color:#0f172a` 등 하드코딩 색까지 `[style*="..."]` 셀렉터로 자동 치환

4. **일반 기록 섹션 — 일반 탭 기록만 반영 + 데이터 없으면 숨김**
   - `_cbGeneralRecordHTML(tn)` 시그니처 변경
   - 전역 `players[].history`(전체 시즌 통산) → `tn.normalMatches`(이 대회의 일반 탭) 만 집계
   - 완료된 일반 탭 경기가 0건이면 섹션 자체 미렌더
   - 라벨: "시즌 통산 전적" → "**일반 탭 통산**", "ALL TIME" → "일반 탭"
   - 활동 스트리머 카운트도 이 대회 일반 탭 활동 명수

5. **흰색 배경 다크 미적용 문제 해결**
   - 모든 하드코딩 흰색을 `var(--cbs-card)` 토큰으로 치환
   - 다크 모드에서 자동으로 어두운 색으로 전환

## 적용 방법

### 방법 A — 원본 소스 패치 (권장)
- `js/competition-briefing.js` 교체
- `index.html` 교체 (캐시 버전 갱신됨)

### 방법 B — 번들 버전 사용
- `index.dist.html` → `index.html`로 교체
- `dist/js/chunk-match.js`, `dist/css/bundle.css` 그대로 사용
- `sw.js` 교체 (캐시 버전 갱신됨)

## 빌드 정보
- `node build.mjs` 결과: 8.66 MB → 7.28 MB (-16.0%)
- HTTP 요청: ~148개 → 12개
- `sw.js` CACHE_VERSION: `v20260820-191100b34a` → `v20260820-65943875e5`
- `index.html` cache 쿼리: `?v=20260820-plbpcbdark1` → `?v=20260820-cbgen1`
