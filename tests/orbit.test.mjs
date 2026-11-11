import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOrbit, sampleOrbit } from '../orbit.js';

function openArc() {
  return Float64Array.from(Array.from({ length: 64 }, (_, i) => {
    const angle = i / 63 * Math.PI * 1.78;
    return [200 * Math.cos(angle), 150 * Math.sin(angle)];
  }).flat());
}
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('open arc closes continuously across the wrap, without a position jump', () => {
  const orbit = buildOrbit(openArc());
  assert.deepEqual(sampleOrbit(orbit, 0), sampleOrbit(orbit, 1));
  const before = sampleOrbit(orbit, 1 - 1e-6);
  const after = sampleOrbit(orbit, 1e-6);
  assert.ok(distance(before, after) <= orbit.length * 2.01e-6);
  assert.deepEqual(sampleOrbit(orbit, -.25), sampleOrbit(orbit, .75));
});

test('fractional time advances between vertices instead of snapping to them', () => {
  const orbit = buildOrbit(openArc());
  const points = [0, .00001, .00002, .00003].map(t => sampleOrbit(orbit, t));
  for (let i = 1; i < points.length; i++) {
    assert.ok(distance(points[i - 1], points[i]) > 0);
    assert.ok(Math.abs(distance(points[i - 1], points[i]) - orbit.length * .00001) < 1e-7);
  }
});

test('uneven vertex density does not change travel speed on straight spans', () => {
  const orbit = buildOrbit(new Float64Array([0, 0, 1, 0, 2, 0, 100, 0, 101, 0, 300, 0]));
  const travel = 12;
  for (const start of [3, 15, 99, 120, 250]) {
    const a = sampleOrbit(orbit, start / orbit.length);
    const b = sampleOrbit(orbit, (start + travel) / orbit.length);
    assert.ok(Math.abs(distance(a, b) - travel) < 1e-9);
  }
});

test('a collapsed contour stays finite and stationary', () => {
  const orbit = buildOrbit(new Float64Array([8, 12, 8, 12, 8, 12]));
  for (const phase of [-10, 0, .5, 1, 25]) assert.deepEqual(sampleOrbit(orbit, phase), { x: 8, y: 12 });
});
