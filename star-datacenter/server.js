/**
 * 스타대학 데이터 센터 - 로컬/자체호스팅 서버
 * - 정적 파일 서빙 + AI봇 프록시(/api/aibot)
 *
 * 사용:
 *   node server.js
 *   PORT=8005 node server.js
 *
 * AI봇 사용:
 * - Groq API 키는 "환경변수" 또는 ".env" 파일로 설정
 *   GROQ_API_KEY=...
 *   GROQ_MODEL=llama-3.3-70b-versatile
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// .env 지원(의존성 없이 간단 파서)
try{
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split(/\r?\n/).forEach(line=>{
      const s = line.trim();
      if (!s || s.startsWith('#')) return;
      const idx = s.indexOf('=');
      if (idx <= 0) return;
      const k = s.slice(0, idx).trim();
      let v = s.slice(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (k && typeof process.env[k] === 'undefined') process.env[k] = v;
    });
    console.log('[server] .env loaded');
  }
}catch(e){}

const PORT = parseInt(process.env.PORT || '8005', 10);
const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();
const GROQ_MODEL = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim();

const ROOT_DIR = __dirname; // star-datacenter_fixed_v129 폴더

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function send(res, status, body, headers = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body || ''), 'utf8');
  res.writeHead(status, { 'Content-Length': buf.length, ...headers });
  res.end(buf);
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  send(res, status, body, { 'Content-Type': 'application/json; charset=utf-8' });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function handleAIBot(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });
  if (!GROQ_API_KEY) return sendJson(res, 500, { error: 'Server missing GROQ_API_KEY' });

  let payload = null;
  try{
    const raw = await readBody(req);
    payload = raw ? JSON.parse(raw) : {};
  }catch(e){
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const userMessages = Array.isArray(payload.messages) ? payload.messages : null;
  const prompt = (payload.prompt || '').toString();

  const system = {
    role: 'system',
    content:
      '너는 "AI봇"이다. 한국어로 대답하고, 짧고 명확하게 답한다. ' +
      '민감정보(토큰/API키)는 요구하거나 되풀이하지 않는다.',
  };

  const messages = userMessages && userMessages.length
    ? [system, ...userMessages.slice(-16)]
    : [system, { role: 'user', content: prompt || '' }];

  try{
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.5,
      }),
    });

    const j = await r.json().catch(() => null);
    if (!r.ok) {
      return sendJson(res, r.status, { error: (j && (j.error?.message || j.message)) || 'Groq API error' });
    }
    const text = j?.choices?.[0]?.message?.content ?? '';
    return sendJson(res, 200, { text });
  }catch(e){
    return sendJson(res, 500, { error: e.message || String(e) });
  }
}

function safePath(urlPath) {
  // prevent path traversal
  const decoded = decodeURIComponent(urlPath);
  const clean = decoded.replace(/\0/g, '');
  const p = path.normalize(clean).replace(/^(\.\.(\/|\\|$))+/, '');
  return p;
}

function serveStatic(req, res, urlObj) {
  let reqPath = urlObj.pathname || '/';
  // 호환: 예전 경로(/star-datacenter_fixed_v129/...)로 들어와도 동작하게 prefix 제거
  if (reqPath.startsWith('/star-datacenter_fixed_v129/')) {
    reqPath = reqPath.replace('/star-datacenter_fixed_v129', '') || '/';
  }
  if (reqPath === '/') reqPath = '/index.html';
  const rel = safePath(reqPath);
  const filePath = path.join(ROOT_DIR, rel);

  if (!filePath.startsWith(ROOT_DIR)) return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    fs.readFile(filePath, (e, buf) => {
      if (e) return send(res, 500, 'Internal Error', { 'Content-Type': 'text/plain; charset=utf-8' });
      send(res, 200, buf, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);

    // CORS/프리플라이트(개발용)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (req.method === 'OPTIONS') return send(res, 204, '');

    if (urlObj.pathname === '/api/aibot') return await handleAIBot(req, res);

    return serveStatic(req, res, urlObj);
  } catch (e) {
    return send(res, 500, 'Internal Error', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
});

server.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}/`);
  console.log(`[server] static root: ${ROOT_DIR}`);
  console.log(`[server] aibot proxy: /api/aibot (model=${GROQ_MODEL})`);
  if (!GROQ_API_KEY) console.log('[server] WARNING: GROQ_API_KEY is not set');
});
