/**
 * 스타대학 데이터센터 — 통합 서버 (Node 18+)
 *
 * 기능:
 *  1. 정적 파일 서빙 (HTTP/1.1 + 캐싱 헤더 최적화)
 *  2. POST /api/aibot  → Groq Chat Completions 프록시
 *  3. GET  /api/health → 헬스체크
 *
 * 캐싱 전략:
 *  - dist/js/chunk-*.js, dist/js/lazy-*.js
 *      : Cache-Control: public, max-age=31536000, immutable
 *        (빌드 시 내용이 바뀌면 파일명이 달라지므로 1년 캐시)
 *  - js/*.js?v=xxxxx  (원본 소스, 버전 쿼리스트링 포함)
 *      : Cache-Control: public, max-age=31536000, immutable
 *  - css/*.css?v=xxxxx
 *      : Cache-Control: public, max-age=31536000, immutable
 *  - index.html / index.dist.html
 *      : Cache-Control: no-cache  (항상 최신 확인)
 *  - *.json (데이터 파일)
 *      : Cache-Control: public, max-age=60  (1분)
 *  - 기타
 *      : Cache-Control: public, max-age=3600  (1시간)
 *
 * HTTP/2:
 *  TLS 인증서가 있으면 HTTP/2로 자동 업그레이드.
 *  인증서 없으면 HTTP/1.1로 폴백 (개발 환경).
 *  인증서 경로: SSL_CERT, SSL_KEY 환경변수로 지정.
 *  mkcert 로컬 인증서 예시:
 *    mkcert localhost && SSL_CERT=localhost.pem SSL_KEY=localhost-key.pem node server.js
 *
 * 실행:
 *   node server.js                   # HTTP/1.1, 포트 8005
 *   PORT=3000 node server.js         # 포트 변경
 *   SSL_CERT=cert.pem SSL_KEY=key.pem node server.js  # HTTP/2
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { URL } = require('url');

// ─────────────────────────────────────────
// 환경 변수
// ─────────────────────────────────────────
const PORT         = Number(process.env.PORT || 8005);
const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();
const MAX_BODY     = Number(process.env.MAX_BODY_BYTES || 1_000_000);
const GROQ_TIMEOUT = Number(process.env.GROQ_TIMEOUT_MS || 15_000);
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
const SSL_CERT     = process.env.SSL_CERT || '';
const SSL_KEY      = process.env.SSL_KEY  || '';
const ROOT         = __dirname;  // 정적 파일 루트

// ─────────────────────────────────────────
// MIME 타입
// ─────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.webp': 'image/webp',
  '.txt':  'text/plain; charset=utf-8',
};

function getMime(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

// ─────────────────────────────────────────
// 캐싱 헤더 결정
// ─────────────────────────────────────────
function getCacheControl(urlPath) {
  const p = urlPath.split('?')[0];  // 쿼리스트링 제거

  // HTML — 항상 재검증 (새 배포 즉시 반영)
  if (p.endsWith('.html') || p === '/') {
    return 'no-cache';
  }

  // 번들 청크 (dist/js/) — 1년 캐시 + immutable
  // 내용 변경 시 build.mjs가 파일을 새로 생성하므로 안전
  if (p.startsWith('/dist/js/')) {
    return 'public, max-age=31536000, immutable';
  }

  // 버전 쿼리스트링 포함 JS/CSS — 1년 캐시 + immutable
  // ?v=20260629-split 같은 패턴이 있으면 내용 불변으로 간주
  if (/\?v=/.test(urlPath) && (p.endsWith('.js') || p.endsWith('.css'))) {
    return 'public, max-age=31536000, immutable';
  }

  // JSON 데이터 — 짧은 캐시 (1분)
  if (p.endsWith('.json')) {
    return 'public, max-age=60, must-revalidate';
  }

  // 폰트 — 1년
  if (['.woff','.woff2','.ttf'].some(e => p.endsWith(e))) {
    return 'public, max-age=31536000, immutable';
  }

  // 이미지 — 1주일
  if (['.png','.jpg','.jpeg','.gif','.svg','.webp','.ico'].some(e => p.endsWith(e))) {
    return 'public, max-age=604800';
  }

  // 기타 JS/CSS (버전 없음) — 1시간
  if (p.endsWith('.js') || p.endsWith('.css')) {
    return 'public, max-age=3600';
  }

  // 기타
  return 'public, max-age=3600';
}

// ─────────────────────────────────────────
// 정적 파일 서빙
// ─────────────────────────────────────────
function serveStatic(req, res, urlPath) {
  // 경로 순회 공격 방어
  const cleanPath = path.normalize(urlPath.split('?')[0]);
  if (cleanPath.includes('..')) {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }

  // / → index.dist.html 우선, 없으면 index.html
  let filePath;
  if (cleanPath === '/' || cleanPath === '') {
    const distHtml = path.join(ROOT, 'index.dist.html');
    filePath = fs.existsSync(distHtml)
      ? distHtml
      : path.join(ROOT, 'index.html');
  } else {
    filePath = path.join(ROOT, cleanPath);
  }

  // 디렉터리 접근 차단
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
  } catch {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  const cacheControl = getCacheControl(urlPath);
  const mime = getMime(filePath);

  // ETag (파일 수정시각 기반 간이 ETag)
  const stat = fs.statSync(filePath);
  const etag = `"${stat.size}-${stat.mtimeMs.toFixed(0)}"`;

  // 조건부 요청 처리 (304 Not Modified)
  if (req.headers['if-none-match'] === etag) {
    res.statusCode = 304;
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', cacheControl);
    res.end();
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('ETag', etag);

  // 보안 헤더
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // gzip 인코딩 지원 여부 확인 후 스트리밍
  // (Node 기본 http는 자동 gzip 없음 — 프로덕션엔 nginx/Cloudflare 권장)
  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('error', () => {
    try { res.statusCode = 500; res.end('Internal Server Error'); } catch {}
  });
}

// ─────────────────────────────────────────
// CORS 헤더
// ─────────────────────────────────────────
function setCors(req, res) {
  const origin = req.headers.origin ? String(req.headers.origin) : '';
  if (CORS_ORIGINS.length) {
    if (origin && CORS_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, HEAD');
}

// ─────────────────────────────────────────
// JSON 바디 파싱
// ─────────────────────────────────────────
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '', bytes = 0;
    req.on('data', c => {
      bytes += c.length || 0;
      if (bytes > MAX_BODY) {
        const e = Object.assign(new Error('Payload too large'), { statusCode: 413 });
        try { req.destroy(); } catch {}
        reject(e); return;
      }
      body += c;
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(Object.assign(new Error('Invalid JSON'), { statusCode: 400 })); }
    });
    req.on('error', reject);
  });
}

// ─────────────────────────────────────────
// Groq API 프록시
// ─────────────────────────────────────────
async function groqChat(messages) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY가 설정되어 있지 않습니다.');
  const ctrl = new AbortController();
  const t = setTimeout(() => { try { ctrl.abort(); } catch {} }, GROQ_TIMEOUT);
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.2, max_tokens: 700 }),
    signal: ctrl.signal,
  }).finally(() => clearTimeout(t));
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error((j && (j.error?.message || j.error || j.message)) || `HTTP ${r.status}`);
  return j?.choices?.[0]?.message?.content || '';
}

// ─────────────────────────────────────────
// 요청 핸들러 (HTTP/1.1 & HTTP/2 공용)
// ─────────────────────────────────────────
async function handleRequest(req, res) {
  try {
    const rawUrl = req.url || '/';
    const u = new URL(rawUrl, `http://${req.headers.host || 'localhost'}`);

    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

    // ── API 라우트 ──────────────────────────
    if (req.method === 'POST' && u.pathname === '/api/aibot') {
      const ct = String(req.headers['content-type'] || '');
      if (ct && !ct.includes('application/json')) {
        res.statusCode = 415; res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Content-Type must be application/json' })); return;
      }
      const body = await readJson(req);
      const messages = Array.isArray(body.messages) ? body.messages : [];
      if (!messages.length) {
        res.statusCode = 400; res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'messages가 비어있습니다.' })); return;
      }
      const text = await groqChat(messages);
      res.statusCode = 200; res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ text })); return;
    }

    if (req.method === 'GET' && u.pathname === '/api/health') {
      res.statusCode = 200; res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, http2: !!req.stream })); return;
    }

    // ── 정적 파일 ───────────────────────────
    if (req.method === 'GET' || req.method === 'HEAD') {
      serveStatic(req, res, u.pathname + u.search);
      return;
    }

    res.statusCode = 405; res.end('Method Not Allowed');
  } catch (e) {
    const code = Number(e?.statusCode) || 500;
    try {
      res.statusCode = code;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: String(e?.message || e) }));
    } catch {}
  }
}

// ─────────────────────────────────────────
// 서버 기동 (HTTP/2 or HTTP/1.1 자동 선택)
// ─────────────────────────────────────────
function startServer() {
  if (SSL_CERT && SSL_KEY) {
    // HTTP/2 (TLS 필수)
    const http2 = require('http2');
    let cert, key;
    try {
      cert = fs.readFileSync(SSL_CERT);
      key  = fs.readFileSync(SSL_KEY);
    } catch (e) {
      console.error(`[server] SSL 인증서 로드 실패: ${e.message}`);
      console.error('  → HTTP/1.1 모드로 폴백합니다.');
      return startHttp1();
    }

    const server = http2.createSecureServer(
      {
        cert, key,
        allowHTTP1: true,  // HTTP/1.1 클라이언트도 수용
        settings: {
          // HTTP/2 서버 푸시 대신 Early Hints 권장 (푸시는 Chrome에서 제거됨)
          headerTableSize: 4096,
          enablePush: false,
        },
      },
      handleRequest
    );

    server.on('error', e => console.error('[server] HTTP/2 오류:', e));
    server.listen(PORT, () => {
      console.log(`✅ [server] HTTP/2 (TLS) — https://localhost:${PORT}`);
      printCacheInfo();
    });
  } else {
    startHttp1();
  }
}

function startHttp1() {
  const http = require('http');
  const server = http.createServer(handleRequest);
  server.on('error', e => console.error('[server] 오류:', e));
  server.listen(PORT, () => {
    console.log(`✅ [server] HTTP/1.1 — http://localhost:${PORT}`);
    console.log('   💡 HTTP/2 사용하려면: SSL_CERT=cert.pem SSL_KEY=key.pem node server.js');
    console.log('      (mkcert localhost 로 로컬 인증서 생성 가능)');
    printCacheInfo();
  });
}

function printCacheInfo() {
  console.log('\n📦 캐싱 전략:');
  console.log('   index.html      → no-cache (항상 최신 확인)');
  console.log('   dist/js/*.js    → 1년 + immutable (번들 청크)');
  console.log('   js/*.js?v=...   → 1년 + immutable (버전 쿼리)');
  console.log('   css/*.css?v=... → 1년 + immutable (버전 쿼리)');
  console.log('   *.json          → 1분 (데이터 파일)');
  console.log('   기타            → 1시간');
  console.log('\n   ETag + 304 Not Modified 지원 ✓');
}

startServer();
