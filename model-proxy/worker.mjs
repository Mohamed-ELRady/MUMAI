const DEFAULT_ORIGINS = ['https://mohamed-elrady.github.io'];
const MAX_BODY_BYTES = 30000;
const MAX_REPLY_CHARS = 20000;
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 20;
const requestBuckets = new Map();

function cors(origin, allowed) {
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(value, status, headers) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });
}

function outputText(response) {
  if (typeof response.output_text === 'string' && response.output_text.trim()) return response.output_text.trim();
  return Array.isArray(response.output) ? response.output.flatMap((item) => Array.isArray(item?.content) ? item.content : [])
    .filter((item) => item?.type === 'output_text' && typeof item.text === 'string').map((item) => item.text).join('\n').trim() : '';
}

function validMessage(item) {
  return item && typeof item === 'object' && (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string';
}

function tooManyRequests(request) {
  const now = Date.now();
  const key = request.headers.get('CF-Connecting-IP') || request.headers.get('Origin') || 'native';
  const current = requestBuckets.get(key);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestBuckets.set(key, { count: 1, startedAt: now });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function firstSourceUrl(grounding) {
  return grounding.match(/https?:\/\/[^\s)>\]]+/)?.[0]?.replace(/[.,;:]+$/, '') ?? '';
}

export async function handleRequest(request, env, fetcher = fetch) {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = (env.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS.join(',')).split(',').map((item) => item.trim()).filter(Boolean);
  const headers = cors(origin, allowed);
  if (request.method === 'OPTIONS') return new Response(null, { status: allowed.includes(origin) ? 204 : 403, headers });
  if (request.method === 'GET' && new URL(request.url).pathname.endsWith('/health')) return json({ ok: true, modelConfigured: Boolean(env.OPENAI_API_KEY) }, 200, headers);
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);
  if (origin && !allowed.includes(origin)) return json({ error: 'Origin not allowed' }, 403, headers);
  if (!env.OPENAI_API_KEY) return json({ error: 'Assistant is not configured' }, 503, headers);
  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: 'Request too large' }, 413, headers);
    body = JSON.parse(raw);
  } catch { return json({ error: 'Invalid JSON' }, 400, headers); }
  if (!body || typeof body.query !== 'string' || !body.query.trim() || body.query.length > 2000
    || typeof body.grounding !== 'string' || !body.grounding.trim() || body.grounding.length > 18000
    || !body.context || typeof body.context !== 'object') return json({ error: 'Invalid request' }, 400, headers);
  if (tooManyRequests(request)) return json({ error: 'Too many requests' }, 429, { ...headers, 'Retry-After': '60' });
  const history = Array.isArray(body.history) ? body.history.filter(validMessage).slice(-12).map((item) => ({
    role: item.role, content: item.text.slice(0, 2000),
  })) : [];
  const instructions = `You are MUMAI, an educational child-development assistant for parents. Answer warmly and directly in the language requested in the supplied context.
Medical factual claims MUST come only from TRUSTED GROUNDING below. Do not browse, diagnose, name an ungrounded condition, recommend a medicine, or invent a milestone. Separate meaningful words from babbling and supported from independent movement. Treat reference ages as skills most children can do by that age, not deadlines or predictions. If a later skill is not expected yet, say so without saying it is impossible. If the parent reports loss of a skill, no response to sounds, breathing difficulty, loss of consciousness, or seizures, preserve the urgent guidance in the grounding. Ask at most one useful follow-up question. Keep the answer under 350 words. Include the most relevant source URL from the grounding.

TRUSTED GROUNDING:
${body.grounding}`;
  const input = [...history, { role: 'user', content: body.query.trim() }];
  let upstream;
  try {
    upstream = await fetcher('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: env.OPENAI_MODEL || 'gpt-5-mini', instructions, input, max_output_tokens: 900, store: false, text: { verbosity: 'low' } }),
    });
  } catch { return json({ error: 'Model service unavailable' }, 502, headers); }
  if (!upstream.ok) return json({ error: 'Model service unavailable' }, 502, headers);
  let data;
  try { data = await upstream.json(); } catch { return json({ error: 'Invalid model response' }, 502, headers); }
  const reply = outputText(data);
  if (!reply || reply.length > MAX_REPLY_CHARS) return json({ error: 'Invalid model response' }, 502, headers);
  const sourceUrl = firstSourceUrl(body.grounding);
  const groundedReply = sourceUrl && !reply.includes(sourceUrl) ? `${reply}\n\n${sourceUrl}` : reply;
  return json({ reply: groundedReply }, 200, headers);
}

export default { fetch: handleRequest };
