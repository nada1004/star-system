# 성능 최적화 가이드

## 적용된 최적화 목록

### 1. 번들링 (build.mjs)
146개 JS 파일 → **초기 로딩 5개 청크**로 통합

| 청크 | 포함 내용 |
|------|-----------|
| `dist/js/chunk-core.js` | 코어 (config, constants, settings, render 등) |
| `dist/js/chunk-match.js` | 경기/대전 기록 (match-builder, history, competition) |
| `dist/js/chunk-search.js` | 검색, 선수 관련 |
| `dist/js/chunk-procomp.js` | 프로대회 |
| `dist/js/chunk-board.js` | 랭킹보드, 클라우드보드 |

탭 진입 시 지연 로드되는 청크:

| 청크 | 조건 |
|------|------|
| `dist/js/lazy-stats.js` | 통계탭 진입 시 |
| `dist/js/lazy-roulette.js` | 룰렛탭 진입 시 |
| `dist/js/lazy-calendar.js` | 캘린더탭 진입 시 |
| `dist/js/lazy-chatbot.js` | 챗봇 사용 시 |
| `dist/js/lazy-elboard.js` | ELO보드 진입 시 |
| `dist/js/lazy-vote.js` | 투표탭 진입 시 |

### 2. Minification (esbuild)
- 전체 JS **5.0MB → 4.1MB (-18%)**
- 공백, 주석, 불필요한 코드 제거

### 3. 캐싱 헤더 (server.js)
| 파일 유형 | Cache-Control |
|-----------|---------------|
| `index.html` | `no-cache` (항상 최신 확인) |
| `dist/js/chunk-*.js` | `public, max-age=31536000, immutable` (1년) |
| `js/*.js?v=...` | `public, max-age=31536000, immutable` (1년) |
| `css/*.css?v=...` | `public, max-age=31536000, immutable` (1년) |
| `*.json` | `public, max-age=60` (1분) |
| 폰트/이미지 | `public, max-age=604800` (1주일) |

**ETag + 304 Not Modified** 지원으로 재방문 시 대역폭 절약.

### 4. HTTP/2 (server.js)
TLS 인증서가 있을 때 자동으로 HTTP/2 활성화.

```bash
# 로컬 인증서 생성 (mkcert)
brew install mkcert   # macOS
mkcert -install
mkcert localhost

# HTTP/2로 실행
SSL_CERT=localhost.pem SSL_KEY=localhost-key.pem node server.js
```

HTTP/2 장점:
- 멀티플렉싱: TCP 연결 1개로 여러 파일 동시 전송
- 헤더 압축 (HPACK)
- 서버 푸시 (비활성 — Chrome에서 제거됨)

### 5. Service Worker (sw.js)
GitHub Pages처럼 서버 설정이 불가한 환경에서 캐싱 적용.

```
첫 방문: 네트워크에서 로드 → 캐시 저장
재방문:  캐시에서 즉시 로드 (오프라인도 동작)
```

---

## 빌드 및 배포

```bash
# 빌드 (번들 생성)
npm run build

# 로컬 서버 실행 (HTTP/1.1)
node server.js

# 로컬 서버 실행 (HTTP/2, mkcert 필요)
SSL_CERT=localhost.pem SSL_KEY=localhost-key.pem node server.js
```

배포 시 `index.dist.html` → `index.html`로 교체하면 번들 버전으로 서빙됩니다.

---

## SW 버전 업데이트 방법

배포 내용이 바뀔 때마다 `sw.js` 상단의 버전을 올립니다:

```js
// sw.js
const CACHE_VERSION = 'v20260629-02';  // ← 날짜/버전 변경
```

변경하면 이전 캐시가 자동으로 삭제되고 새 파일로 교체됩니다.

---

## 예상 성능 개선 효과

| 시나리오 | 이전 | 이후 (예상) |
|----------|------|-------------|
| 최초 방문 HTTP 요청 수 | ~140개 | 5~8개 |
| 최초 방문 JS 전송량 | 5.0MB | 4.1MB |
| 재방문 (캐시 HIT) | 매번 전체 로드 | 거의 0 (304 or SW 캐시) |
| HTTP/2 적용 시 | — | 멀티플렉싱으로 추가 단축 |
