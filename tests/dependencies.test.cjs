const { test } = require('node:test');
const assert = require('node:assert/strict');

test('patched navigation dependencies parse and serialize Arabic query parameters', async () => {
  const { getStateFromPath } = await import('../node_modules/@react-navigation/core/lib/module/getStateFromPath.js');
  const { getPathFromState } = await import('../node_modules/@react-navigation/core/lib/module/getPathFromState.js');
  const config = { screens: { Home: '', Chat: 'chat' } };
  const state = getStateFromPath('/chat?stageId=m18&name=%D9%8A%D9%88%D8%B3%D9%81', config);
  assert.equal(state.routes[0].params.name, 'يوسف');
  assert.equal(state.routes[0].params.stageId, 'm18');
  assert.match(getPathFromState(state, config), /stageId=m18/);
  assert.doesNotThrow(() => getStateFromPath('/chat?name=%E0%A4%A', config));
});

test('Xcode project IDs still work with the patched UUID dependency', () => {
  const project = require('xcode').project('/tmp/mumai-test.pbxproj');
  project.hash = { project: { objects: {} } };
  const first = project.generateUuid();
  assert.match(first, /^[A-F0-9]{24}$/);
  assert.notEqual(first, project.generateUuid());
});
