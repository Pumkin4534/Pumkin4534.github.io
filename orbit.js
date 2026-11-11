// A closed contour with a tangent-matched return curve. Rendering and signal
// sampling share this path, so a marker cannot teleport across an open seam.
export function buildOrbit(points) {
  const count = points.length / 2;
  if (!Number.isInteger(count) || count < 2) throw new Error('An orbit needs at least two XY points');
  const firstX = points[0], firstY = points[1];
  const lastX = points[points.length - 2], lastY = points[points.length - 1];
  const gap = Math.hypot(firstX - lastX, firstY - lastY);
  const steps = Math.max(8, Math.min(64, Math.ceil(gap / 8)));
  const vertices = new Float64Array((count + steps) * 2);
  vertices.set(points);
  const outX = lastX - points[points.length - 4];
  const outY = lastY - points[points.length - 3];
  const inX = points[2] - firstX, inY = points[3] - firstY;
  const outLength = Math.hypot(outX, outY) || 1;
  const inLength = Math.hypot(inX, inY) || 1;
  const handle = gap * .4;
  const c1x = lastX + outX / outLength * handle;
  const c1y = lastY + outY / outLength * handle;
  const c2x = firstX - inX / inLength * handle;
  const c2y = firstY - inY / inLength * handle;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, s = 1 - t;
    const at = (count + i - 1) * 2;
    vertices[at] = s ** 3 * lastX + 3 * s * s * t * c1x + 3 * s * t * t * c2x + t ** 3 * firstX;
    vertices[at + 1] = s ** 3 * lastY + 3 * s * s * t * c1y + 3 * s * t * t * c2y + t ** 3 * firstY;
  }
  const lengths = new Float64Array(count + steps);
  for (let i = 1; i < lengths.length; i++) {
    lengths[i] = lengths[i - 1] + Math.hypot(vertices[i * 2] - vertices[i * 2 - 2], vertices[i * 2 + 1] - vertices[i * 2 - 1]);
  }
  return { vertices, lengths, length: lengths[lengths.length - 1] };
}

// Fractional, arc-length-based sampling gives even travel over both densely and
// sparsely sampled parts of the contour, including the closing curve.
export function sampleOrbit(orbit, phase) {
  const { vertices, lengths, length } = orbit;
  if (!length) return { x: vertices[0], y: vertices[1] };
  const distance = ((phase % 1 + 1) % 1) * length;
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
  };
}
