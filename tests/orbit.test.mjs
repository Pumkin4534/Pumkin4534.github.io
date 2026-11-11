import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPath, samplePath } from '../orbit.js';
const points = Float64Array.from(Array.from({ length: 64 }, (_, i) => {
  const angle = i / 63 * Math.PI * 1.78;
  return [200 * Math.cos(angle), 150 * Math.sin(angle)];
}).flat());
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('open contour contains exactly the supplied vertices, with no connector', () => {
  const path = buildPath(points);
  assert.deepEqual(path.vertices, points);
  assert.notEqual(path.vertices[0], path.vertices.at(-2));
});

test('signals fade in and out, becoming invisible across the cycle reset', () => {
  const path = buildPath(points);
  const start = [0, .01, .035, .07].map(t => samplePath(path, t).opacity);
  const end = [.93, .965, .99, 1 - 1e-6].map(t => samplePath(path, t).opacity);
  assert.equal(start[0], 0);
  assert.equal(samplePath(path, 1).opacity, 0);
  assert.equal(samplePath(path, .5).opacity, 1);
  assert.ok(start.every((v, i) => i === 0 || v > start[i - 1]));
  assert.ok(end.every((v, i) => i === 0 || v < end[i - 1]));
  assert.ok(samplePath(path, 1 - 1e-6).opacity < 1e-8);
  assert.ok(samplePath(path, 1e-6).opacity < 1e-8);
  assert.ok(distance(samplePath(path, 1 - 1e-6), samplePath(path, 1e-6)) > 10);
});

test('fractional time advances between vertices without position snapping', () => {
  const path = buildPath(points);
  const samples = [0, .00001, .00002, .00003].map(t => samplePath(path, t));
  for (let i = 1; i < samples.length; i++) assert.ok(Math.abs(distance(samples[i - 1], samples[i]) - path.length * .00001) < 1e-7);
});

test('uneven vertex density does not change travel speed', () => {
  const path = buildPath(new Float64Array([0, 0, 1, 0, 2, 0, 100, 0, 101, 0, 300, 0]));
  for (const start of [3, 15, 99, 120, 250]) assert.ok(Math.abs(distance(samplePath(path, start / path.length), samplePath(path, (start + 12) / path.length)) - 12) < 1e-9);
});

test('a collapsed path stays finite, stationary and invisible', () => {
  const path = buildPath(new Float64Array([8, 12, 8, 12, 8, 12]));
  for (const phase of [-10, 0, .5, 1, 25]) assert.deepEqual(samplePath(path, phase), { x: 8, y: 12, opacity: 0 });
});
