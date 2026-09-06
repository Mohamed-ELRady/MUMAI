const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ruleBasedReply, buildGrounding, getAssistantResponse } = require('../src/services/aiChatService.ts');
const { currentStageForAge } = require('../src/data/ageHelpers.ts');

const context = (age, lang = 'ar') => ({ babyName: 'Mohamed', ageMonths: age, currentStageId: currentStageForAge(age).id, lang });

test('the screenshot question starts with seven-month expectations and practical pre-speech activities', () => {
  const reply = ruleBasedReply('إزاي أساعده يتكلم؟', context(7));
  assert.match(reply.split('\n\n')[1], /الكلام بكلمات واضحة لسه مش متوقّع/);
  assert.match(reply, /عمر 7 شهر/);
  assert.match(reply, /يتبادل الأصوات/);
  assert.match(reply, /قلّدي أصواته/);
  assert.match(reply, /اديه فرصة يرد/);
  assert.doesNotMatch(reply, /مستحيل|12 شهر|15 شهر|مرحلة لاحقة|يفهم كلمة لا|علامات للنقاش/);
});

for (const [age, expected] of [[3, /غير البكاء/], [7, /يتبادل الأصوات/], [9, /مقاطع صوتية/], [11, /مقاطع صوتية/]]) {
  test(`speech coaching uses current precursor skills at ${age} months`, () => {
    const reply = ruleBasedReply('كيف أعلمه الكلام؟', context(age));
    assert.match(reply, expected);
    assert.match(reply, /لسه مش متوقّع/);
    assert.doesNotMatch(reply, /3 كلمات|كلمتين|مرحلة لاحقة/);
  });
}

for (const [age, expected] of [[12, /بمعنى واضح/], [15, /كلمة أو كلمتين غير/], [18, /3 كلمات أو أكثر/], [24, /جملًا من كلمتين/]]) {
  test(`missing speech at ${age} months uses the appropriate expectation without infant reassurance`, () => {
    const reply = ruleBasedReply('مش بيتكلم', context(age));
    assert.match(reply, expected);
    assert.match(reply, /اطلبي تقييم النمو/);
    assert.doesNotMatch(reply, /لسه مش متوقّع|غياب الكلمات لوحده/);
  });
}

test('timing questions get a qualified timeline while coaching does not get a future checklist', () => {
  const reply = ruleBasedReply('امتى يبدأ الكلام؟', context(7));
  assert.match(reply, /للتوقيت التقريبي/);
  assert.match(reply, /مش موعد ثابت/);
  assert.ok(reply.indexOf('يتبادل الأصوات') < reply.indexOf('للتوقيت التقريبي'));
  assert.doesNotMatch(ruleBasedReply('إزاي أساعده يتكلم؟', context(7)), /15 شهر|للتوقيت التقريبي/);
});

test('mixed absence of words and response to sounds is not dismissed as early speech', () => {
  const reply = ruleBasedReply('٧ شهور مش بيتكلم ومش بيسمع', context(18));
  assert.match(reply, /عمر 7 شهر/);
  assert.match(reply, /تقييم السمع/);
  assert.match(reply, /ما تستنيش ظهور الكلمات/);
  assert.match(reply, /تقييم النمو/);
});

test('absent babbling at seven months is assessed as a current skill, not dismissed with absent words', () => {
  const reply = ruleBasedReply('عنده سبعة شهور مش بيناغي', context(18));
  assert.match(reply, /يتبادل الأصوات/);
  assert.match(reply, /اطلبي تقييم النمو/);
  assert.doesNotMatch(reply, /غياب الكلمات لوحده مش معناه تأخر/);
});

test('loss of early vocalization takes precedence over age and online generation', async () => {
  for (const query of ['عنده ٧ شهور كان بيناغي وبطل', 'بنتي كانت بتناغي وبطلت', 'بطل يناغي', 'my baby stopped babbling']) {
    const reply = await getAssistantResponse(query, context(7));
    assert.equal(reply.source, 'local');
    assert.match(reply.text, /تقييم طبي سريع/);
    assert.doesNotMatch(reply.text, /لسه مش متوقّع|غياب الكلمات/);
  }
});

test('follow-up age corrections update the expectation without losing the topic', () => {
  const history = [{ role: 'user', text: 'ابني مش بيتكلم' }, { role: 'assistant', text: 'الكلمات عند 18 شهر' }];
  const reply = ruleBasedReply('هو عنده ٧ شهور', context(18), history);
  assert.match(reply, /عمر 7 شهر/);
  assert.match(reply, /الكلام بكلمات واضحة لسه مش متوقّع/);
  assert.doesNotMatch(reply, /18 شهر|3 كلمات/);
  const next = ruleBasedReply('طيب أعمل إيه؟', context(18), [...history, { role: 'user', text: 'هو عنده ٧ شهور' }]);
  assert.match(next, /قلّدي أصواته/);
  assert.match(next, /عمر 7 شهر/);
});

test('English seven-month coaching and explicit written age match the Arabic reasoning', () => {
  const reply = ruleBasedReply('How can I help my seven month old talk?', context(18, 'en'));
  assert.match(reply, /7 months/);
  assert.match(reply, /Meaningful words are not usually expected yet/);
  assert.match(reply, /Takes turns vocalizing/);
  assert.doesNotMatch(reply, /three words|later stage|impossible/);
});

test('walking advice respects the precursor, emerging, and independent phases', () => {
  assert.match(ruleBasedReply('ازاي أعلمه يمشي؟', context(7)), /المشي لوحده لسه مش متوقّع/);
  assert.match(ruleBasedReply('مش بيمشي', context(12)), /وهو ماسك في أثاث ثابت/);
  const older = ruleBasedReply('مش بيمشي', context(18));
  assert.match(older, /يمشي بمفرده/);
  assert.match(older, /تقييم النمو/);
  assert.doesNotMatch(older, /لسه مش متوقّع/);
});

test('sitting advice distinguishes support from independent sitting', () => {
  assert.match(ruleBasedReply('إزاي أساعده يقعد؟', context(3)), /الجلوس لوحده لسه مش متوقّع/);
  const seven = ruleBasedReply('مش بيقعد حتى بمساعدة', context(7));
  assert.match(seven, /يسند نفسه بيديه/);
  assert.match(seven, /تقييم النمو/);
  const nine = ruleBasedReply('مش بيقعد', context(9));
  assert.match(nine, /يجلس من غير مساندة/);
  assert.match(nine, /طبيب الأطفال/);
  assert.doesNotMatch(nine, /لسه مش متوقّع/);
});

test('mixed movement and speech questions retain both age-appropriate topics', () => {
  const reply = ruleBasedReply('مش بيتكلم ومش بيقعد', context(7));
  assert.match(reply, /يتبادل الأصوات/);
  assert.match(reply, /يسند نفسه بيديه/);
  assert.match(reply, /تقييم النمو/);
});

test('online grounding uses the same age plan without contradictory future reference skills', () => {
  const grounding = buildGrounding('إزاي أساعده يتكلم؟', context(7));
  assert.match(grounding, /Child age for this answer: 7 months/);
  assert.match(grounding, /Reference skill at 6 months:.*يتبادل الأصوات/);
  assert.doesNotMatch(grounding, /Reference skill at (9|12|15|18) months|يفهم كلمة لا/);
  assert.match(grounding, /A skill not yet expected is not impossible/);
});

test('moving from a timing question to coaching keeps the topic but changes the answer intent', () => {
  const reply = ruleBasedReply('طيب أعمل إيه؟', context(7), [{ role: 'user', text: 'امتى يبدأ الكلام؟' }]);
  assert.match(reply, /قلّدي أصواته/);
  assert.doesNotMatch(reply, /للتوقيت التقريبي|15 شهر/);
});

test('other skill questions also avoid future checklists and keep useful answers', () => {
  const hearing = ruleBasedReply('مش بيستجيب للأصوات', context(7));
  assert.match(hearing, /فحص سمع/);
  assert.doesNotMatch(hearing, /مرحلة لاحقة|9 شهر/);
  const rolling = ruleBasedReply('إزاي أساعده يتقلب؟', context(3));
  assert.match(rolling, /مرحلة أكبر/);
  assert.doesNotMatch(rolling, /خارج دليل النمو/);
});
