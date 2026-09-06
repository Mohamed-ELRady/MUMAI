const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { ruleBasedReply, getAssistantResponse, buildGrounding, PROXY_TIMEOUT_MS } = require('../src/services/aiChatService.ts');
const { ageInQuery, resolveConversation, urgentKind } = require('../src/services/chatUnderstanding.ts');
const { normalizeArabic, overlapScore } = require('../src/services/textMatch.ts');
const { MILESTONES } = require('../src/data/milestones.ts');
const ctx = { babyName: 'يوسف', ageMonths: 18, currentStageId: 'm18', lang: 'ar' };
const originalFetch = global.fetch;
const originalURL = process.env.EXPO_PUBLIC_AI_PROXY_URL;
afterEach(() => {
  global.fetch = originalFetch;
  if (originalURL === undefined) delete process.env.EXPO_PUBLIC_AI_PROXY_URL;
  else process.env.EXPO_PUBLIC_AI_PROXY_URL = originalURL;
});

for (const [query, expected] of [
  ['ابني مش بيتكلم', /3 كلمات/], ['بنتي مبتتكلمش', /3 كلمات/],
  ['ابني مش بيمشي', /يمشي/], ['بنتي مش بتقعد', /الجلوس|يجلس/],
  ['ابني مش بيستجيب لاسمه', /اسمه|السمع|الأصوات/], ['إيه المهارات المناسبة لعمره؟', /3 كلمات/],
  ['إزاي أساعده يتكلم؟', /كتاب صور/], ['طفلي ٦ شهور مش بيتقلب', /يتقلب/],
  ['My baby is not talking', /3 كلمات/],
  ['طفلي مش بيحبي', /الزحف/],
]) test(`answers a real parent question: ${query}`, () => {
  const reply = ruleBasedReply(query, ctx);
  assert.match(reply, expected);
  assert.doesNotMatch(reply, /معنديش|خارج دليل/);
});

test('Egyptian and formal Arabic refer to the same skill without prefix collisions', () => {
  assert.equal(normalizeArabic('أَكْل ١٨ shهور'), 'اكل 18 shهور');
  assert.ok(overlapScore('مش بيتكلم', 'يقول ثلاث كلمات') >= 3);
  assert.equal(overlapScore('الطقس النهارده', 'يتحدث بوضوح'), 0);
});

for (const [query, age] of [
  ['عمره ١٨ شهر', 18], ['بنتي سنتين ونص', 30], ['عمره سنة ونص', 18], ['عنده سنة و 3 شهور', 15],
  ['عندها تلاتة شهور', 3], ['my two year old', 24], ['2 years and 3 months old', 27], ['بيقول 3 كلمات', undefined],
  ['مش بيتكلم من 3 شهور', undefined], ['بيمشي بقاله سنة', undefined],
]) test(`extracts ages, not word counts: ${query}`, () => assert.equal(ageInQuery(query), age));

test('explicit age overrides a stale profile and labels future milestones', () => {
  const reply = ruleBasedReply('ابني عنده ٦ شهور ومش بيمشي', ctx);
  assert.match(reply, /عمر 6 شهر/);
  assert.match(reply, /مرحلة لاحقة/);
  assert.doesNotMatch(reply, /علامات للنقاش|طيف التوحد/);
});

test('speech at 18 months uses the verified milestone and not the old 10-word threshold', () => {
  const reply = ruleBasedReply('ابني مش بيتكلم', ctx);
  assert.match(reply, /3 كلمات.*غير ماما وبابا/);
  assert.doesNotMatch(reply, /10 كلمات|أقل من 6/);
});

test('a positive observation or general question does not produce warning signs', () => {
  assert.doesNotMatch(ruleBasedReply('ابني بيمشي كويس', ctx), /علامات للنقاش|لا يمشي|لا يقف/);
  assert.doesNotMatch(ruleBasedReply('امتى يبدأ الكلام؟', ctx), /علامات للنقاش/);
});

test('short follow-ups use prior user topic and age, but topic changes do not', () => {
  const history = [{ role: 'user', text: 'ابني عنده سنتين مش بيتكلم' }, { role: 'assistant', text: 'المشي والجلوس' }];
  const reply = ruleBasedReply('طيب أعمل إيه؟', ctx, history);
  assert.match(reply, /عمر 2 سنة/);
  assert.match(reply, /كتاب صور/);
  assert.equal(resolveConversation('مش بيمشي', history), 'مش بيمشي');
  assert.equal(resolveConversation('ما عاصمة فرنسا', history), 'ما عاصمة فرنسا');
});

test('remaining-skills replies use actual checkmarks in the selected stage', () => {
  const ids = MILESTONES.filter((item) => item.ageStageId === 'm18').map((item) => item.id);
  assert.match(ruleBasedReply('إيه المهارات المتبقية؟', { ...ctx, completedMilestoneIds: ids }), /كل مهارات المرحلة/);
  const reply = ruleBasedReply('إيه المهارات المتبقية؟', { ...ctx, completedMilestoneIds: [ids[0]] });
  assert.doesNotMatch(reply, /3 كلمات/);
  assert.match(reply, /يمشي/);
});

test('greetings, unrelated questions and ages outside the guide have honest useful replies', () => {
  assert.match(ruleBasedReply('السلام عليكم', ctx), /أهلاً/);
  assert.match(ruleBasedReply('شكرا', ctx), /العفو/);
  assert.match(ruleBasedReply('ما عاصمة فرنسا', ctx), /خارج دليل النمو/);
  assert.match(ruleBasedReply('طفلي 8 سنوات مش بيتكلم', ctx), /لحد 5 سنين/);
});

test('regression and emergency symptoms bypass age filtering and remote generation', async () => {
  process.env.EXPO_PUBLIC_AI_PROXY_URL = 'https://example.com/chat';
  global.fetch = () => { throw new Error('must not call'); };
  for (const query of ['كان بيتكلم وبطل', 'فقد مهارات', 'used to walk but stopped']) {
    assert.equal(urgentKind(query), 'regression');
    const reply = await getAssistantResponse(query, { ...ctx, ageMonths: 6, currentStageId: 'm6' });
    assert.match(reply.text, /تقييم طبي سريع/);
    assert.equal(reply.connectionFailed, undefined);
  }
  const reply = await getAssistantResponse('ابني مش بيتنفس', ctx);
  assert.match(reply.text, /الطوارئ فورًا/);
  assert.equal(reply.connectionFailed, undefined);
});

test('English replies and bilingual retrieval work regardless of input language', () => {
  const reply = ruleBasedReply('My baby is not walking', { ...ctx, lang: 'en' });
  assert.match(reply, /Walks independently/);
  assert.doesNotMatch(reply, /Speech-language|three words|one-step direction/);
});

test('a configured proxy receives bounded history, age context and nonempty grounding', async () => {
  process.env.EXPO_PUBLIC_AI_PROXY_URL = 'https://example.com/chat';
  global.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(url, 'https://example.com/chat');
    assert.equal(body.context.ageMonths, 24);
    assert.equal(body.history.length, 1);
    assert.match(body.grounding, /كتاب صور/);
    assert.ok(options.signal);
    return { ok: true, json: async () => ({ reply: '  رد مفيد  ' }) };
  };
  assert.deepEqual(await getAssistantResponse('طيب أعمل إيه؟', ctx, [{ role: 'user', text: 'عمره سنتين مش بيتكلم' }]), { source: 'proxy', text: 'رد مفيد' });
});

for (const bad of [null, {}, { reply: '' }, { reply: '   ' }, { reply: 42 }, { reply: 'x'.repeat(20001) }]) {
  test(`invalid proxy payload falls back: ${JSON.stringify(bad).slice(0, 50)}`, async () => {
    process.env.EXPO_PUBLIC_AI_PROXY_URL = 'https://example.com/chat';
    global.fetch = async () => ({ ok: true, json: async () => bad });
    const reply = await getAssistantResponse('مش بيتكلم', ctx);
    assert.equal(reply.source, 'local');
    assert.equal(reply.connectionFailed, true);
    assert.match(reply.text, /3 كلمات/);
  });
}

test('network, HTTP and JSON errors return an explicit local fallback', async () => {
  process.env.EXPO_PUBLIC_AI_PROXY_URL = 'https://example.com/chat';
  for (const mock of [async () => { throw new Error('offline'); }, async () => ({ ok: false, status: 500 }), async () => ({ ok: true, json: async () => { throw new Error('invalid json'); } })]) {
    global.fetch = mock;
    assert.equal((await getAssistantResponse('مش بيمشي', ctx)).connectionFailed, true);
  }
});

test('a hung proxy, including one ignoring abort, cannot hang the chat', async (t) => {
  process.env.EXPO_PUBLIC_AI_PROXY_URL = 'https://example.com/chat';
  let signal;
  global.fetch = (_url, options) => { signal = options.signal; return new Promise(() => {}); };
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = getAssistantResponse('مش بيمشي', ctx);
  t.mock.timers.tick(PROXY_TIMEOUT_MS + 1);
  const reply = await pending;
  assert.equal(reply.connectionFailed, true);
  assert.equal(signal.aborted, true);
});

test('unsafe URLs fail locally and no AI key is needed for offline answers', async () => {
  global.fetch = () => { throw new Error('must not call'); };
  process.env.EXPO_PUBLIC_AI_PROXY_URL = 'http://example.com/chat';
  assert.equal((await getAssistantResponse('مش بيمشي', ctx)).connectionFailed, true);
  delete process.env.EXPO_PUBLIC_AI_PROXY_URL;
  assert.equal((await getAssistantResponse('مش بيمشي', ctx)).connectionFailed, undefined);
  assert.match(buildGrounding('إيه المهارات المناسبة لعمره؟', ctx), /3 كلمات/);
});
