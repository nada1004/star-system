/**
 * sw.js — Service Worker (GitHub Pages / 정적 호스팅용 캐싱)
 *
 * 전략:
 *  - 번들 청크 (dist/js/)          : Cache First — 1년 캐시, 백그라운드 업데이트 없음
 *  - 버전 쿼리 JS/CSS (?v=...)     : Cache First — 1년 캐시
 *  - index.html                    : Network First — 오프라인 폴백만
 *  - JSON 데이터                   : Network First (1분 캐시) — 최신 데이터 우선
 *  - 폰트 / 이미지                 : Cache First — 1주일
 *  - CDN 외부 스크립트             : Cache First — 7일
 *  - API 요청 (/api/)              : Network Only — 캐시하지 않음
 *
 * 업데이트:
 *  빌드 버전이 바뀌면 CACHE_VERSION을 올리면 됩니다.
 *  → 이전 캐시가 모두 삭제되고 새 버전으로 교체됩니다.
 */

const CACHE_VERSION = 'v20260708-02';

const CACHE_NAMES = {
  immutable: `immutable-${CACHE_VERSION}`,  // 번들/버전 쿼리 파일 (장기 캐시)
  pages:     `pages-${CACHE_VERSION}`,       // HTML
  data:      `data-${CACHE_VERSION}`,        // JSON 데이터
  assets:    `assets-${CACHE_VERSION}`,      // 폰트/이미지
  cdn:       `cdn-${CACHE_VERSION}`,         // CDN 외부 리소스
};

// 모든 캐시 이름 목록
const ALL_CACHES = Object.values(CACHE_NAMES);

// ─────────────────────────────────────────
// Install: 핵심 파일 사전 캐싱
// ─────────────────────────────────────────
const PRECACHE_URLS = [
  '/',
  '/index.dist.html',
  '/dist/css/bundle.css',
  '/dist/js/chunk-core.js',
  '/dist/js/chunk-match.js',
  '/dist/js/chunk-search.js',
  '/dist/js/chunk-procomp.js',
  '/dist/js/chunk-board.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAMES.immutable).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        // 일부 실패해도 SW 설치는 계속
        console.warn('[SW] 사전 캐싱 일부 실패:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─────────────────────────────────────────
// Activate: 이전 버전 캐시 정리
// ─────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => !ALL_CACHES.includes(k))
          .map(k => {
            console.log('[SW] 이전 캐시 삭제:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────
// 요청 분류
// ─────────────────────────────────────────
function classify(url) {
  const { pathname, search, hostname } = url;
  try{
    if(self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') return 'network-only';
  }catch(e){}

  // API — 캐시 안 함
  if (pathname.startsWith('/api/')) return 'network-only';

  // 외부 도메인 (CDN)
  if (hostname !== self.location.hostname) {
    // Groq API 등 동적 API는 캐시 안 함
    if (hostname.includes('groq.com') || hostname.includes('firebase') || hostname.includes('github.com')) {
      return 'network-only';
    }
    return 'cdn';  // jsdelivr, cdnjs 등 → Cache First 7일
  }

  // HTML
  if (pathname.endsWith('.html') || pathname === '/' || pathname === '') return 'page';

  // JSON 데이터
  if (pathname.endsWith('.json')) return 'data';

  // 번들 청크 (dist/js/)
  if (pathname.startsWith('/dist/js/')) return 'immutable';

  // 버전 쿼리 포함 JS/CSS
  if (search.includes('v=') && (pathname.endsWith('.js') || pathname.endsWith('.css'))) {
    return 'immutable';
  }

  // 폰트/이미지
  if (['.woff','.woff2','.ttf','.png','.jpg','.jpeg','.gif','.svg','.webp','.ico']
      .some(e => pathname.endsWith(e))) return 'asset';

  // 기타 CSS/JS (버전 없음) → 짧은 캐시
  return 'asset';
}

// ─────────────────────────────────────────
// 전략별 핸들러
// ─────────────────────────────────────────

/** Cache First: 캐시 우선, 없으면 네트워크 → 캐시 저장 */
async function cacheFirst(request, cacheName, maxAgeMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // maxAgeMs 초과 여부 확인 (Date 헤더 기반)
    if (maxAgeMs) {
      const dateStr = cached.headers.get('date');
      if (dateStr) {
        const age = Date.now() - new Date(dateStr).getTime();
        if (age > maxAgeMs) {
          // 백그라운드 갱신 후 일단 캐시 반환
          fetch(request).then(res => {
            if (res && res.ok) cache.put(request, res.clone());
          }).catch(() => {});
        }
      }
    }
    return cached;
  }

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

/** Network First: 네트워크 우선, 실패 시 캐시 폴백 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // 완전 오프라인 — 기본 오프라인 응답
    return new Response('오프라인 상태입니다. 네트워크를 확인해주세요.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// ─────────────────────────────────────────
// Fetch 인터셉트
// ─────────────────────────────────────────
self.addEventListener('fetch', event => {
  // POST 등 non-GET은 그냥 통과
  if (event.request.method !== 'GET') return;

  let url;
  try { url = new URL(event.request.url); } catch { return; }

  const type = classify(url);

  switch (type) {
    case 'network-only':
      // 아무것도 안 함 → 브라우저 기본 동작
      return;

    case 'immutable':
      // 1년 캐시 — 버전이 바뀌지 않으면 절대 갱신 안 함
      event.respondWith(cacheFirst(event.request, CACHE_NAMES.immutable, null));
      break;

    case 'page':
      // HTML — 항상 최신 시도, 오프라인 시 캐시
      event.respondWith(networkFirst(event.request, CACHE_NAMES.pages));
      break;

    case 'data':
      // JSON — 1분마다 갱신 시도
      event.respondWith(networkFirst(event.request, CACHE_NAMES.data));
      break;

    case 'asset':
      // 이미지/폰트/기타 — 7일 캐시
      event.respondWith(cacheFirst(event.request, CACHE_NAMES.assets, 7 * 24 * 60 * 60 * 1000));
      break;

    case 'cdn':
      // CDN — 7일 캐시
      event.respondWith(cacheFirst(event.request, CACHE_NAMES.cdn, 7 * 24 * 60 * 60 * 1000));
      break;

    default:
      return;
  }
});

// ─────────────────────────────────────────
// 메시지 처리 (앱에서 SW 제어)
// ─────────────────────────────────────────
self.addEventListener('message', event => {
  if (!event.data) return;

  // 캐시 전체 삭제 (강제 새로고침)
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => {
      event.ports[0]?.postMessage({ ok: true });
    });
  }

  // 즉시 활성화 (새 SW 대기 없이 바로 적용)
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
