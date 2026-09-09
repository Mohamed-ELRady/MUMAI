import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../model-proxy/worker.mjs';

const origin = 'https://mohamed-elrady.github.io';
const env = { OPENAI_API_KEY: 'test', ALLOWED_ORIGINS: origin, OPENAI_MODEL: 'gpt-5-mini' };
const request = (body, requestOrigin = origin) => new Request('https://worker.example/chat', {
  method: 'POST', headers: { Origin: requestOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const valid = { query: 'إزاي أساعده يتكلم؟', context: { ageMonths: 7, lang: 'ar' }, history: [], grounding: 'Age: 7. CDC https://www.cdc.gov/act-early/milestones/6-months.html' };

test('proxy sends bounded grounded input to Responses API and returns output text', async () => {
  let sent;
  const response = await handleRequest(request(valid), env, async (url, options) => {
    sent = { url, options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ output: [{ content: [{ type: 'output_text', text: 'رد مناسب مع المصدر' }] }] }), { status: 200 });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reply: 'رد مناسب مع المصدر\n\nhttps://www.cdc.gov/act-early/milestones/6-months.html' });
  assert.equal(sent.url, 'https://api.openai.com/v1/responses');
  assert.equal(sent.body.store, false);
  assert.match(sent.body.instructions, /TRUSTED GROUNDING/);
  assert.match(sent.body.instructions, /not deadlines or predictions/);
});

test('proxy rejects unknown origins, invalid requests and missing configuration', async () => {
  assert.equal((await handleRequest(request(valid, 'https://evil.example'), env)).status, 403);
  assert.equal((await handleRequest(request({ query: '', context: {}, grounding: '' }), env)).status, 400);
  assert.equal((await handleRequest(request(valid), { ALLOWED_ORIGINS: origin })).status, 503);
});

test('proxy accepts native requests without a browser Origin header', async () => {
  const native = new Request('https://worker.example/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
  const response = await handleRequest(native, env, async () => new Response(JSON.stringify({ output_text: 'Native reply' }), { status: 200 }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reply: 'Native reply\n\nhttps://www.cdc.gov/act-early/milestones/6-months.html' });
});

test('proxy limits repeated requests before calling the model', async () => {
  const limitedRequest = () => new Request('https://worker.example/chat', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.8' },
    body: JSON.stringify(valid),
  });
  let calls = 0;
  const fetcher = async () => {
    calls += 1;
    return new Response(JSON.stringify({ output_text: 'Reply' }), { status: 200 });
  };
  for (let index = 0; index < 20; index += 1) assert.equal((await handleRequest(limitedRequest(), env, fetcher)).status, 200);
  const blocked = await handleRequest(limitedRequest(), env, fetcher);
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('Retry-After'), '60');
  assert.equal(calls, 20);
});

test('proxy never exposes provider failures or malformed output as a reply', async () => {
  assert.equal((await handleRequest(request(valid), env, async () => new Response('no', { status: 429 }))).status, 502);
  assert.equal((await handleRequest(request(valid), env, async () => new Response(JSON.stringify({ output: [] }), { status: 200 }))).status, 502);
});
