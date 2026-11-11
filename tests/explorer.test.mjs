import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, applyDemoAction, nextDemoAction, demoReadiness } from '../explorer.js';
const act = (state, action) => applyDemoAction(state, action).state;
function completed() { return ['plan', 'check', 'review', 'finish'].reduce(act, createDemo()); }

test('early completion and out-of-order review explain missing work without changing it', () => {
  const state = createDemo();
  for (const action of ['finish', 'review', 'check']) {
    const result = applyDemoAction(state, action);
    assert.deepEqual(result.state, state);
    assert.equal(result.tone, 'blocked');
    assert.equal(result.feature, 'SCOPE COMES FIRST');
  }
});
test('guided steps reach a complete example with current checks and two reviews', () => {
  let state = createDemo();
  for (const action of ['plan', 'check', 'review', 'finish']) {
    assert.equal(nextDemoAction(state), action);
    state = act(state, action);
  }
  assert.equal(demoReadiness(state), 'finished');
  assert.equal(state.reviewVersion, state.version);
  assert.equal(nextDemoAction(state), 'reset');
});
test('editing a completed example invalidates evidence and requires fresh review', () => {
  let state = act(completed(), 'edit');
  assert.equal(demoReadiness(state), 'stale');
  assert.equal(state.finished, false);
  assert.equal(applyDemoAction(state, 'review').tone, 'blocked');
  assert.equal(applyDemoAction(state, 'finish').tone, 'blocked');
  state = act(state, 'check');
  assert.equal(demoReadiness(state), 'unreviewed');
  state = act(act(state, 'review'), 'finish');
  assert.equal(demoReadiness(state), 'finished');
  assert.equal(state.version, 2);
});
test('a failed check overrides old success; re-clicking plan cannot clear it', () => {
  let state = act(completed(), 'fail');
  state = act(state, 'plan');
  assert.equal(demoReadiness(state), 'failed');
  assert.equal(applyDemoAction(state, 'finish').tone, 'blocked');
  assert.equal(state.reviewVersion, null);
  assert.equal(nextDemoAction(state), 'check');
});
test('reset restores the original mission without retaining outcomes', () => {
  assert.deepEqual(act(act(completed(), 'edit'), 'reset'), createDemo());
});
