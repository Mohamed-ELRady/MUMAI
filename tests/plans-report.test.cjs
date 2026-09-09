const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildWeeklyPlan, weekKey } = require('../src/services/weeklyPlan.ts');
const { generateReportHtml, statusCounts } = require('../src/services/reportService.ts');

test('weekly plan selects three current-stage activities and prioritizes developing skills', () => {
  const statuses = { 'ms-m6-1': 'achieved', 'ms-m6-2-v2': 'emerging', 'ms-m6-3': 'not_observed' };
  const plan = buildWeeklyPlan(7, statuses);
  assert.equal(plan.length, 3);
  assert.equal(plan[0].milestoneId, 'ms-m6-2-v2');
  assert.equal(new Set(plan.map((item) => item.domain)).size, 3);
  assert.ok(plan.every((item) => item.instruction.ar && item.instruction.en));
});

test('week keys start on Monday and stay calendar-date safe', () => {
  assert.equal(weekKey(new Date(2026, 8, 9, 12)), '2026-09-07');
  assert.equal(weekKey(new Date(2026, 8, 13, 23)), '2026-09-07');
});

test('doctor report includes current statuses, dated notes, source and escaped family input', () => {
  const html = generateReportHtml({
    profile: { name: '<Mohamed>', birthDateISO: '2026-02-09' }, ageMonths: 7, lang: 'ar',
    milestoneStatuses: { 'ms-m6-2-v2': 'emerging', 'ms-m6-3': 'not_observed', 'ms-m6-4': 'achieved' },
    observations: [{ id: '1', text: '<script>alert(1)</script> بدأ يناغي', createdAt: '2026-09-09T10:00:00.000Z' }],
    savedQuestions: [{ id: 'q1', text: 'إزاي أساعده يتكلم؟', createdAt: '2026-09-09T11:00:00.000Z' }],
    generatedAt: new Date('2026-09-09T12:00:00.000Z'),
  });
  assert.match(html, /ملخص متابعة النمو/);
  assert.match(html, /بيحاول/);
  assert.match(html, /لسه ملاحظناهاش/);
  assert.match(html, /CDC/);
  assert.match(html, /إزاي أساعده يتكلم/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.deepEqual(statusCounts({ 'ms-m6-2-v2': 'emerging', 'ms-m6-4': 'achieved' }, 'm6'), { achieved: 1, emerging: 1, notObserved: 0, unrecorded: 3, total: 5 });
});
