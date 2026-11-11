// An explicitly simulated, in-memory workflow. No commands or models are called.
export function createDemo() {
  return { planned: false, version: 1, check: null, reviewVersion: null, finished: false };
}

export function demoReadiness(state) {
  if (!state.planned) return 'plan';
  if (!state.check) return 'unchecked';
  if (!state.check.passed) return 'failed';
  if (state.check.version !== state.version) return 'stale';
  if (state.reviewVersion !== state.version) return 'unreviewed';
  return state.finished ? 'finished' : 'ready';
}

export function nextDemoAction(state) {
  const status = demoReadiness(state);
  if (status === 'plan') return 'plan';
  if (['unchecked', 'failed', 'stale'].includes(status)) return 'check';
  if (status === 'unreviewed') return 'review';
  return status === 'ready' ? 'finish' : 'reset';
}

const blockers = {
  plan: ['SCOPE COMES FIRST', 'Not quite. Define the outcomes before calling the work done. Start with a plan.'],
  unchecked: ['EVIDENCE, NOT CONFIDENCE', 'The plan looks good—but no check has run. Arc needs a real result before review or completion.'],
  failed: ['A FAILURE STAYS A FAILURE', 'The latest check failed. An older pass cannot cover it up. Run the demo check again to repair the example.'],
  stale: ['SOURCE-BOUND EVIDENCE', 'The source changed after the check. Those results are now stale. Recheck this version, then get fresh reviews.'],
  unreviewed: ['TWO FRESH PERSPECTIVES', 'A passing check is only part of the story. Get correctness and adversarial reviews before finishing.'],
};

export function applyDemoAction(state, action) {
  const next = { ...state };
  const result = (feature, message, tone = 'info') => ({ state: next, feature, message, tone });
  const blocked = status => result(...blockers[status], 'blocked');
  const status = demoReadiness(state);
  if (action === 'reset') return { state: createDemo(), feature: 'A FRESH START', message: 'Same mission, clean slate. Try a different route—or throw a curveball after the plan.', tone: 'info' };
  if (action === 'plan') {
    next.planned = true;
    return result('FOCUSED PLANNING', 'Three ordered outcomes: define the CSV format, build the exporter, verify empty rows and errors. Small plan, full scope.');
  }
  if (action === 'check') {
    if (!state.planned) return blocked('plan');
    next.check = { version: state.version, passed: true };
    next.reviewVersion = null;
    next.finished = false;
    return result('CURRENT EVIDENCE', `The demo check passed on source v${state.version}. Its result is tied to this version. Next: two independent perspectives.`, 'success');
  }
  if (action === 'review') {
    if (!['unreviewed', 'ready', 'finished'].includes(status)) return blocked(status);
    next.reviewVersion = state.version;
    return result('TWO FRESH PERSPECTIVES', 'Correctness + adversarial: both example reviews pass. Each sees the evidence packet, not the writer’s conversation.', 'success');
  }
  if (action === 'finish') {
    if (!['ready', 'finished'].includes(status)) return blocked(status);
    next.finished = true;
    return result('YOU FOUND THE FINISH LINE', 'Example complete. Current checks and both reviews match. In Arc, these records remain native-advisory.', 'success');
  }
  if (action === 'edit') {
    if (!state.planned) return blocked('plan');
    next.version++;
    next.reviewVersion = null;
    next.finished = false;
    return result('SOURCE CHANGED', state.check ? `Now on source v${next.version}. The old evidence cannot establish success for this edit. Recheck, then review again.` : `Now on source v${next.version}. Run a check against this version before moving on.`, 'blocked');
  }
  if (action === 'fail') {
    if (!state.planned) return blocked('plan');
    next.check = { version: state.version, passed: false };
    next.reviewVersion = null;
    next.finished = false;
    return result('THE GATE HOLDS', 'An empty-row case failed in the example. Arc keeps that failure visible and blocks completion until a new check passes.', 'blocked');
  }
  throw new Error(`Unknown demo action: ${action}`);
}
