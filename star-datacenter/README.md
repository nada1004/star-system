# 스타대학 데이터 센터 — 배포 패키지

이 폴더는 **두 가지 버전**을 모두 포함합니다. 호스팅 환경에 맞게 골라 쓰세요.

---

## 🅰️ 원본 소스 버전 (권장: 개발/디버깅)

진입점: **`index.html`**

- `js/` 330개 + `css/` 17개 + `data/` + 루트 JSON = **약 18 MB**
- 모든 파일이 원본 그대로. 수정/디버깅이 쉬움
- 초기 로딩 시 200+개 HTTP 요청 발생 (느릴 수 있음)
- **BGM 자동재생 + 로컬저장 메시지 패치 이미 반영됨** (`js/board2-player-bgm.js`, `js/constants-save.js`)

```
index.html          ← 진입점
sw.js               ← 서비스 워커 (캐싱)
data.json
ttm_seed_part1.json ← 시드 데이터
ttm_seed_part2.json
css/                ← 17개 CSS
js/                 ← 330개 JS (개별 로드)
data/               ← JSON 데이터
```

---

## 🅱️ 번들(dist) 버전 (권장: 프로덕션)

진입점: **`index.dist.html`** (또는 `index.html`로 이름 변경 후 사용)

- `dist/css/bundle.css` + `dist/js/chunk-*.js` + `dist/js/lazy-*.js`
- 초기 로딩 6개 청크 + 지연 청크 = **약 8 MB**
- 훨씬 빠름 (gzip 후 ~2 MB)
- BGM/저장 패치도 `dist/js/chunk-core.js`, `dist/js/chunk-board.js`에 반영됨

```
index.dist.html     ← 진입점 (index.html로 이름 변경 가능)
dist/               ← 번들 (CSS 1 + JS 5 chunks + 7 lazy)
sw.js
data.json
data/
js/tabs-scroll-init.js   ← dist에서 직접 참조하는 단일 파일
```

**번들 버전으로 전환**: `index.dist.html` → `index.html`로 이름만 바꾸세요.

---

## 🚀 호스팅

| 호스팅 | 방법 |
|---|---|
| **Netlify / Vercel / Cloudflare Pages** | 이 폴더 그대로 드래그 앤 드롭 |
| **GitHub Pages** | 압축 해제 → `git init && git add . && git commit -m "init" && git push` |
| **S3 / nginx / Apache** | document root로 지정 (또는 서브폴더로 서빙) |
| **로컬 테스트** | `python3 -m http.server 8000` 후 `http://localhost:8000` |

`index.html`이 루트에 있어야 하고, `sw.js`는 같은 도메인의 `/sw.js`에 있어야 서비스 워커가 정상 동작합니다.

---

## ✅ 패치 내역

### 1. BGM 자동재생 (스트리머 선택 시)

**파일**: `js/board2-player-bgm.js` (또는 번들: `dist/js/chunk-board.js`)

- `unMute()`를 setInterval(300ms)이 아닌 동기 컨텍스트에서 즉시 시도
- 페이지 첫 클릭/키 입력 시 유튜브 플레이어 사전 워밍 (capture phase 리스너)
- 결과: 볼륨 버튼을 따로 누르지 않아도 BGM 자동 재생

### 2. "⚠️ 로컬만 저장" 메시지 깜빡임 제거

**파일**: `js/constants-save.js` (또는 번들: `dist/js/chunk-core.js`)

- 토큰 없을 때: 매 저장마다 경고 → **세션 1회 친절 안내 + 이후엔 "💾 로컬 저장됨"**
- 경고 아이콘(⚠️) 제거, 색상을 경고색 → 정상 녹색으로
