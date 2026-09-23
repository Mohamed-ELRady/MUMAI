const { test } = require('node:test');
const assert = require('node:assert/strict');
const { genderizeChildText } = require('../src/domain/child.ts');
const { ruleBasedReply, buildGrounding } = require('../src/services/aiChatService.ts');

test('child-facing Arabic and English copy follows the selected gender', () => {
  assert.equal(
    genderizeChildText('الطفل خديجة عمره 18 شهر وبيعملها بنفسه', 'female', 'ar'),
    'الطفلة خديجة عمرها 18 شهر وبتعملها بنفسها',
  );
  assert.equal(
    genderizeChildText('He holds his head and calms himself', 'female', 'en'),
    'She holds her head and calms herself',
  );
  assert.equal(genderizeChildText('الطفل يوسف عمره 18 شهر', 'male', 'ar'), 'الطفل يوسف عمره 18 شهر');
});

test('female chat answers, milestones and specialist route use feminine grammar', () => {
  const context = { babyName: 'خديجة', gender: 'female', ageMonths: 18, currentStageId: 'm18', lang: 'ar' };
  const coaching = ruleBasedReply('إزاي أساعدها تتكلم؟', context);
  assert.match(coaching, /بتستخدمها|تساعديها|لو قالت كلمة|طفلتك/);
  assert.doesNotMatch(coaching, /بيستخدمها|تساعديه(?!ا)|لو قال كلمة|طفلك/);
  const overview = ruleBasedReply('إيه المهارات المناسبة لعمرها؟', context);
  assert.match(overview, /تمشي بمفردها|تحاول تقول/);
  const specialist = ruleBasedReply('خديجة مش بتمشي، أكشف عند دكتور إيه؟', context);
  assert.match(specialist, /يراجع الطفلة ككل|عمر الطفلة/);
  assert.doesNotMatch(specialist, /يراجع الطفل(?!ة) ككل|عمر الطفل(?!ة)/);
  assert.match(buildGrounding('إيه المهارات المناسبة لعمرها؟', context), /Child gender: female/);
});
