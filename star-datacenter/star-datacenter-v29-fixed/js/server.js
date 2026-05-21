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

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

async function groqChat(messages) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY가 설정되어 있지 않습니다.');
  }

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      // Groq 모델은 종종 deprecation이 있으므로 최신 권장 모델 사용
      // (이전: llama-3.1-70b-versatile → decommissioned)
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.2,
      max_tokens: 700,
    }),
  });

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.end();

    if (req.method === 'POST' && u.pathname === '/api/aibot') {
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
    return send(res, 500, { error: String(e?.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
