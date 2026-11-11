// Preserve the supplied open contour exactly. There is no closing segment.
export function buildPath(points) {
  const count = points.length / 2;
  if (!Number.isInteger(count) || count < 2) throw new Error('A path needs at least two XY points');
  const vertices = Float64Array.from(points);
  const lengths = new Float64Array(count);
  for (let i = 1; i < count; i++) {
    lengths[i] = lengths[i - 1] + Math.hypot(vertices[i * 2] - vertices[i * 2 - 2], vertices[i * 2 + 1] - vertices[i * 2 - 1]);
  }
  return { vertices, lengths, length: lengths[count - 1] };
}

// Fractional arc-length sampling keeps travel even. Smooth endpoint fades hide
// the cycle reset: nothing is visible jumping from the end back to the start.
export function samplePath(path, phase) {
  const { vertices, lengths, length } = path;
  if (length < 1e-8) return { x: vertices[0], y: vertices[1], opacity: 0 };
  const progress = (phase % 1 + 1) % 1;
  const fade = t => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  const opacity = fade(progress / .07) * fade((1 - progress) / .07);
  const distance = progress * length;
  let low = 1, high = lengths.length - 1;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (lengths[middle] < distance) low = middle + 1;
    else high = middle;
  }
  const start = (low - 1) * 2;
  const span = lengths[low] - lengths[low - 1];
  const t = span ? (distance - lengths[low - 1]) / span : 0;
  return {
    x: vertices[start] + (vertices[start + 2] - vertices[start]) * t,
    y: vertices[start + 1] + (vertices[start + 3] - vertices[start + 1]) * t,
    opacity,
  };
}
