/**
 * 간단 프록시 서버 (Node 18+)
 * - POST /api/aibot  → Groq Chat Completions 호출 후 { text } 반환
 *
 * 실행:
 *   GROQ_API_KEY=... node server.js
 *
 * 또는 (env 파일 사용 시):
 *   # Linux/macOS
 *   export GROQ_API_KEY=...
 *   node server.js
 */

const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();
const MAX_BODY_BYTES = process.env.MAX_BODY_BYTES ? Number(process.env.MAX_BODY_BYTES) : 1_000_000;
const GROQ_TIMEOUT_MS = process.env.GROQ_TIMEOUT_MS ? Number(process.env.GROQ_TIMEOUT_MS) : 15_000;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

function readJson(req, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    req.on('data', (c) => {
      bytes += c.length || 0;
      if (bytes > maxBytes) {
        const err = new Error('Payload too large');
        err.statusCode = 413;
        try{ req.destroy(); }catch(e){}
        reject(err);
        return;
      }
      body += c;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        const err = new Error('Invalid JSON');
        err.statusCode = 400;
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function groqChat(messages) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY가 설정되어 있지 않습니다.');
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => {
    try{ ctrl.abort(); }catch(e){}
  }, GROQ_TIMEOUT_MS);
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.2,
      max_tokens: 700,
    }),
    signal: ctrl.signal,
  }).finally(() => clearTimeout(t));

  const j = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = (j && (j.error?.message || j.error || j.message)) || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  const text = j?.choices?.[0]?.message?.content || '';
  return text;
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://${req.headers.host}`);

    // CORS (로컬 개발 편의)
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.end();

    if (req.method === 'POST' && u.pathname === '/api/aibot') {
      const ct = (req.headers['content-type'] || '').toString();
      if (ct && !ct.includes('application/json')) {
        return send(res, 415, { error: 'Content-Type must be application/json' });
      }
      const body = await readJson(req);
      const messages = Array.isArray(body.messages) ? body.messages : [];
      if (!messages.length) return send(res, 400, { error: 'messages가 비어있습니다.' });

      const text = await groqChat(messages);
      return send(res, 200, { text });
    }

    // 간단 헬스체크
    if (req.method === 'GET' && u.pathname === '/api/health') {
      return send(res, 200, { ok: true });
    }

    return send(res, 404, { error: 'Not found' });
  } catch (e) {
    const code = Number(e && e.statusCode) || 500;
    return send(res, code, { error: String(e?.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
