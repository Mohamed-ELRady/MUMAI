const { test } = require('node:test');
const assert = require('node:assert/strict');
const { monthsBetween, toDateInputValue, parseCalendarDate, validBirthDate, currentStageForAge } = require('../src/data/ageHelpers.ts');
const { restoreState, createWriteQueue, validateProfile } = require('../src/store/persistedState.ts');
const { MILESTONES, RED_FLAGS, AGE_STAGES } = require('../src/data/milestones.ts');

test('calendar birthdays do not shift in Cairo, Los Angeles or Tokyo', () => {
  const oldTZ = process.env.TZ;
  try {
    for (const zone of ['Africa/Cairo', 'America/Los_Angeles', 'Asia/Tokyo']) {
      process.env.TZ = zone;
      assert.equal(toDateInputValue(parseCalendarDate('2024-05-06')), '2024-05-06');
      assert.equal(monthsBetween('2024-05-06', '2025-05-06'), 12);
      assert.equal(monthsBetween('2024-05-06', '2025-05-05'), 11);
    }
  } finally { if (oldTZ === undefined) delete process.env.TZ; else process.env.TZ = oldTZ; }
});

test('birthdays handle month ends, leap years, invalid dates and future input', () => {
  assert.equal(monthsBetween('2024-01-31', '2024-02-29'), 1);
  assert.equal(monthsBetween('2024-02-29', '2025-02-28'), 12);
  assert.equal(monthsBetween('bad', '2025-02-28'), 0);
  assert.equal(monthsBetween('2025-02-28', '2024-02-29'), 0);
  for (const value of ['2025-02-30', '2025-13-01', 'bad', '', '2999-01-01']) assert.equal(validBirthDate(value), null);
});

test('stages unlock on the reference birthday, never a month early', () => {
  assert.equal(currentStageForAge(1).id, 'm1');
  assert.equal(currentStageForAge(2).id, 'm2');
  assert.equal(currentStageForAge(5).id, 'm4');
  assert.equal(currentStageForAge(6).id, 'm6');
  assert.equal(currentStageForAge(17).id, 'm15');
  assert.equal(currentStageForAge(18).id, 'm18');
  assert.equal(currentStageForAge(60).id, 'y5');
});

test('restoration rejects corrupt profiles and removes unknown or duplicate checkmarks', () => {
  const profile = { name: '  يوسف  ', birthDateISO: '2024-01-02' };
  const restored = restoreState(JSON.stringify({ profile, completedMilestoneIds: ['ms-m1-1', 'ms-m1-1', 42, null, 'unknown', 'ms-m9-3'] }));
  assert.equal(restored.profile.name, 'يوسف');
  assert.deepEqual(restored.milestoneStatuses, { 'ms-m1-1': 'achieved' });
  assert.deepEqual(restored.weeklyActivityChecks, {});
  assert.deepEqual(restored.observations, []);
  assert.deepEqual(restored.savedQuestions, []);
  assert.deepEqual(restoreState(null), { profile: null, milestoneStatuses: {}, weeklyActivityChecks: {}, observations: [], savedQuestions: [] });
  for (const raw of ['{broken', 'null', '[]', '{"profile":42}', '{"profile":{"name":"x","birthDateISO":"tomorrow"}}']) assert.throws(() => restoreState(raw));
  assert.equal(validateProfile({ name: ' ', birthDateISO: '2024-01-02' }), null);
});

test('legacy timestamp profiles migrate to a calendar birthday', () => {
  const date = new Date(2024, 0, 2, 12);
  const restored = restoreState(JSON.stringify({ profile: { name: 'Y', birthDateISO: date.toISOString() }, completedMilestoneIds: [] }));
  assert.equal(restored.profile.birthDateISO, '2024-01-02');
});

test('restoration validates status, weekly activity and observation records', () => {
  const raw = JSON.stringify({
    profile: { name: 'Y', birthDateISO: '2024-01-31' },
    milestoneStatuses: { 'ms-m1-1': 'emerging', 'ms-m1-2': 'bad', unknown: 'achieved' },
    weeklyActivityChecks: { '2026-09-07': ['weekly-a', 'weekly-a', 5], bad: ['x'] },
    observations: [
      { id: 'n1', text: '  بدأ يبتسم  ', createdAt: '2026-09-09T10:00:00.000Z', milestoneId: 'ms-m1-1' },
      { id: 'n2', text: '', createdAt: 'bad' },
    ],
    savedQuestions: [{ id: 'q1', text: '  إمتى يبدأ الكلام؟ ', createdAt: '2026-09-09T11:00:00.000Z' }, { id: 'bad', text: '', createdAt: 'bad' }],
  });
  const restored = restoreState(raw);
  assert.deepEqual(restored.milestoneStatuses, { 'ms-m1-1': 'emerging' });
  assert.deepEqual(restored.weeklyActivityChecks, { '2026-09-07': ['weekly-a'] });
  assert.deepEqual(restored.observations, [{ id: 'n1', text: 'بدأ يبتسم', createdAt: '2026-09-09T10:00:00.000Z', milestoneId: 'ms-m1-1' }]);
  assert.deepEqual(restored.savedQuestions, [{ id: 'q1', text: 'إمتى يبدأ الكلام؟', createdAt: '2026-09-09T11:00:00.000Z' }]);
});

test('serialized writes preserve the newest state even if a previous write fails', async () => {
  const started = [];
  let release;
  const queue = createWriteQueue(async (value) => {
    started.push(value);
    if (value === 'first') await new Promise((resolve) => { release = resolve; });
    if (value === 'bad') throw new Error('disk unavailable');
  });
  const first = queue('first');
  const second = queue('second');
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(started, ['first']);
  release();
  await Promise.all([first, second]);
  await assert.rejects(queue('bad'));
  await queue('latest');
  assert.deepEqual(started, ['first', 'second', 'bad', 'latest']);
});

test('every skill and warning has a valid stage, unique ID and both translations', () => {
  const items = [...MILESTONES, ...RED_FLAGS];
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  for (const item of items) {
    assert.ok(AGE_STAGES.some((stage) => stage.id === item.ageStageId));
    const text = item.title ?? item.warningSign;
    assert.ok(text.ar.trim()); assert.ok(text.en.trim());
  }
});
