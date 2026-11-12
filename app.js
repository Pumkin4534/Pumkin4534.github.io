// Original local illustration. No services, analytics, model calls or libraries.
import { buildPath, samplePath } from './orbit.js?v=3';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !reduced.matches;
const motionListeners = new Set();

function updateMotion() {
  motion = !reduced.matches;
  root.dataset.motion = motion ? 'on' : 'off';
  for (const listener of motionListeners) listener();
}
reduced.addEventListener('change', updateMotion);
updateMotion();

// One install command. Copy failures leave it selectable; no other install mode.
const visitorPlatform = navigator.userAgentData?.platform ?? navigator.platform ?? '';
if (/win/i.test(visitorPlatform)) {
  document.querySelector('#install-command').textContent = 'irm https://pumkin4534.github.io/install.ps1 | iex';
  document.querySelector('#install-platform').textContent = 'WINDOWS POWERSHELL';
}
const copyButton = document.querySelector('#copy');
const copyStatus = document.querySelector('#copy-status');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.querySelector('#install-command').textContent.trim());
    copyStatus.textContent = 'Copied. Run it in your terminal, then restart OpenCode.';
    copyButton.querySelector('span').textContent = 'Copied';
    copyButton.classList.add('copied');
  } catch {
    copyStatus.textContent = 'Select the command to copy it manually.';
    copyButton.querySelector('span').textContent = 'Copy command';
    copyButton.classList.remove('copied');
    document.querySelector('.command-row pre').focus();
  }
});

// Subtle physical response without moving focus targets or replacing the cursor.
for (const button of document.querySelectorAll('.magnetic')) {
  button.addEventListener('pointermove', event => {
    if (!motion || event.pointerType !== 'mouse') return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * .055;
    const y = (event.clientY - rect.top - rect.height / 2) * .09;
    button.style.transform = `translate(${x}px,${y}px)`;
  });
  const reset = () => { button.style.transform = ''; };
  button.addEventListener('pointerleave', reset);
  button.addEventListener('blur', reset);
  motionListeners.add(reset);
}

// A projected 3D point sculpture, not a video or decorative screenshot.
const field = document.querySelector('.field');
const canvas = document.querySelector('#field-canvas');
const context = canvas.getContext('2d', { alpha: true });
const reshapeButton = document.querySelector('#reshape');
if (context) {
  field.classList.add('has-canvas');
  const bands = 10;
  const segments = 96;
  const count = bands * segments;
  const positions = new Float32Array(count * 3);
  const targets = Array.from({ length: 3 }, () => new Float32Array(count * 3));
  const projected = new Float32Array(count * 3);
  const contourPoints = new Float64Array(segments * 2);
  const morphFrom = new Float32Array(count * 3);
  const names = ['FOCUS FIELD', 'EVIDENCE STREAM', 'REVIEW ORBITS'];
  let mode = 0;
  let morphClock = 0;
  let morphElapsed = 2400;
  let orbitPhase = 0;
  let width = 0, height = 0, phase = 0, last = 0, frame = 0;
  let inView = true, pulse = 0, pulseTarget = 0;
  let pointer = { x: 0, y: 0 }, aim = { x: 0, y: 0 };
  const palette = Array.from({ length: 16 }, (_, i) => `rgba(${182 + i * 4},${128 + i * 5},${76 + i * 6},${.18 + i * .044})`);

  for (let band = 0; band < bands; band++) {
    for (let j = 0; j < segments; j++) {
      const index = (band * segments + j) * 3;
      const u = j / segments * Math.PI * 2;
      const v = band / bands * Math.PI * 2;
      // The first shape has an open seam: an arc rather than a closed donut.
      const arc = .28 + j / (segments - 1) * Math.PI * 1.78;
      const radius = .91 + .205 * Math.cos(v + arc * .36);
      targets[0].set([radius * Math.cos(arc), radius * Math.sin(arc), .235 * Math.sin(v + arc * .36)], index);
      const helix = u * 2 + v * .26;
      targets[1].set([Math.cos(helix) * (.4 + band * .018), (j / (segments - 1) - .5) * 2.1, Math.sin(helix) * (.4 + band * .018)], index);
      const side = band < bands / 2 ? -1 : 1;
      const minor = (band % 5 - 2) * .035;
      targets[2].set([Math.cos(u) * (.67 + minor) + side * .32, Math.sin(u) * (.82 + minor), side * Math.sin(u) * .38 + Math.cos(u) * .16], index);
    }
  }
  positions.set(targets[0]);
  morphFrom.set(positions);

  function nextShape() {
    morphFrom.set(positions);
    mode = (mode + 1) % targets.length;
    morphElapsed = 0;
    morphClock = 0;
    updateShapeLabel();
  }

  function draw(animate = false, elapsed = 0) {
    if (!width || !height) return;
    if (animate) {
      phase += elapsed * .00013;
      orbitPhase = (orbitPhase + elapsed / 18000) % 1;
      morphClock += elapsed;
      if (morphClock > 10000) {
        nextShape();
      }
      const response = -Math.expm1(-elapsed / 180);
      aim.x += (pointer.x - aim.x) * response;
      aim.y += (pointer.y - aim.y) * response;
      pulse += (pulseTarget - pulse) * response;
      pulseTarget *= Math.exp(-elapsed / 500);
      morphElapsed = Math.min(2400, morphElapsed + elapsed);
      const t = morphElapsed / 2400;
      const ease = t * t * t * (t * (t * 6 - 15) + 10);
      const target = targets[mode];
      for (let i = 0; i < positions.length; i++) positions[i] = morphFrom[i] + (target[i] - morphFrom[i]) * ease;
    }
    context.clearRect(0, 0, width, height);
    const cx = width * (width < 500 ? .5 : .55);
    const cy = height * .49;
    const scale = Math.min(width * .36, height * .355);
    const tiltX = -.54 + aim.y * .3;
    const tiltY = -.53 + Math.sin(phase) * .25 + aim.x * .4;
    const tiltZ = -.36 + Math.sin(phase * .65) * .16;
    const sx = Math.sin(tiltX), cosX = Math.cos(tiltX);
    const sy = Math.sin(tiltY), cosY = Math.cos(tiltY);
    const sz = Math.sin(tiltZ), cosZ = Math.cos(tiltZ);

    // A quiet coordinate plane gives the shape depth without a stock space image.
    context.strokeStyle = 'rgba(190,155,111,.075)';
    context.lineWidth = .6;
    context.beginPath();
    for (let n = -4; n <= 4; n++) {
      const x = cx + n * scale * .3;
      context.moveTo(x, cy + scale * .9);
      context.lineTo(cx + n * scale * .8, cy + scale * 1.55);
    }
    for (let n = 0; n < 4; n++) {
      const y = cy + scale * (.95 + n * .17);
      context.moveTo(cx - scale * (1.2 + n * .3), y);
      context.lineTo(cx + scale * (1.2 + n * .3), y);
    }
    context.stroke();

    for (let i = 0; i < count; i++) {
      const at = i * 3;
      let x = positions[at], y = positions[at + 1], z = positions[at + 2];
      const ripple = 1 + pulse * .12 * Math.sin(i * .035 + phase * 8);
      x *= ripple; y *= ripple;
      const yy = y * cosX - z * sx;
      z = y * sx + z * cosX;
      y = yy;
      const xx = x * cosY + z * sy;
      z = -x * sy + z * cosY;
      x = xx;
      const xz = x * cosZ - y * sz;
      y = x * sz + y * cosZ;
      x = xz;
      const perspective = 3.4 / (3.4 - z);
      projected[at] = cx + x * scale * perspective;
      projected[at + 1] = cy + y * scale * perspective;
      projected[at + 2] = perspective;
    }
    // Keep the original open contours: signals fade at their ends instead of
    // drawing extra connector lines across the sculpture's open space.
    const orbits = new Map();
    for (let band = 0; band < bands; band += 2) {
      for (let j = 0; j < segments; j++) {
        const at = (band * segments + j) * 3;
        contourPoints[j * 2] = projected[at];
        contourPoints[j * 2 + 1] = projected[at + 1];
      }
      const orbit = buildPath(contourPoints);
      orbits.set(band, orbit);
      context.beginPath();
      for (let j = 0; j < orbit.vertices.length; j += 2) {
        if (j === 0) context.moveTo(orbit.vertices[j], orbit.vertices[j + 1]);
        else context.lineTo(orbit.vertices[j], orbit.vertices[j + 1]);
      }
      context.strokeStyle = `rgba(211,163,107,${.13 + band * .005})`;
      context.lineWidth = .6;
      context.stroke();
    }
    for (let i = 0; i < count; i++) {
      const at = i * 3;
      const depth = projected[at + 2];
      const intensity = Math.max(0, Math.min(15, Math.floor((depth - .72) * 27)));
      const size = Math.max(.8, depth * (i % 9 === 0 ? 2.15 : 1.35));
      context.fillStyle = palette[intensity];
      context.fillRect(projected[at] - size / 2, projected[at + 1] - size / 2, size, size);
    }
    // Small moving signals travel on the outer contour, not random sparkles.
    for (let signal = 0; signal < 3; signal++) {
      const point = samplePath(orbits.get(signal * 4), orbitPhase + signal / 3);
      context.globalAlpha = point.opacity;
      context.beginPath();
      context.arc(point.x, point.y, 3.1, 0, Math.PI * 2);
      context.fillStyle = '#f6d3a7';
      context.fill();
      context.beginPath();
      context.arc(point.x, point.y, 7, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(230,177,123,.22)';
      context.lineWidth = .8;
      context.stroke();
      context.globalAlpha = 1;
    }
  }

  function canAnimate() { return motion && inView && !document.hidden; }
  function tick(now) {
    frame = 0;
    if (!canAnimate()) { last = 0; return; }
    const interval = width < 500 ? 1000 / 30 : 1000 / 60;
    if (!last || now - last >= interval - .5) {
      draw(true, last ? Math.min(now - last, 60) : interval);
      last = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!canAnimate()) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; last = 0;
      return;
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }
  function resize() {
    const rect = field.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(false); schedule();
  }
  new ResizeObserver(resize).observe(field);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }, { threshold: .05 }).observe(field);
  document.addEventListener('visibilitychange', schedule);
  motionListeners.add(() => { schedule(); if (!motion) draw(false); });
  field.addEventListener('pointermove', event => {
    if (!motion || event.pointerType !== 'mouse') return;
    const rect = field.getBoundingClientRect();
    pointer = { x: (event.clientX - rect.left) / rect.width * 2 - 1, y: (event.clientY - rect.top) / rect.height * 2 - 1 };
  });
  field.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; });
  canvas.addEventListener('pointerdown', () => { if (motion) pulseTarget = 1; });
  function updateShapeLabel() {
    document.querySelector('#field-name').textContent = names[mode];
    reshapeButton.setAttribute('aria-label', `Reshape particle field. Current shape: ${names[mode].toLowerCase()}`);
  }
  reshapeButton.addEventListener('click', () => {
    nextShape();
    if (!motion) {
      positions.set(targets[mode]);
      morphFrom.set(positions);
      morphElapsed = 2400;
      draw(false);
    } else schedule();
  });
  resize();
} else {
  reshapeButton.hidden = true;
}

// The line follows reading progress; native scroll is never intercepted.
const steps = [...document.querySelectorAll('.flow-step')];
const trace = document.querySelector('#trace-progress');
const signal = document.querySelector('#trace-signal');
const journey = document.querySelector('.journey');
const traceLength = trace.getTotalLength();
const exampleStates = [
  'Scope → headers, encoding, empty rows.',
  'Checks → example tests pass on current source.',
  'Review → two example judgments recorded.',
];
trace.style.strokeDasharray = traceLength;
let scrollFrame = 0;
function updateJourney() {
  scrollFrame = 0;
  const middle = innerHeight * .58;
  let active = 0;
  steps.forEach((step, index) => {
    const rect = step.getBoundingClientRect();
    if (rect.top < middle) active = index;
    if (rect.top < innerHeight * .9) step.classList.add('seen');
  });
  const rect = journey.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (middle - rect.top) / Math.max(1, rect.height - innerHeight * .2)));
  const length = traceLength * progress;
  trace.style.strokeDashoffset = traceLength - length;
  const point = trace.getPointAtLength(length);
  signal.setAttribute('cx', point.x); signal.setAttribute('cy', point.y);
  steps.forEach((step, index) => step.classList.toggle('active', index === active));
  document.querySelectorAll('[data-node]').forEach(node => node.classList.toggle('active', Number(node.dataset.node) <= active));
  document.querySelector('#trace-output').textContent = exampleStates[active];
}
function requestJourneyUpdate() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateJourney); }
addEventListener('scroll', requestJourneyUpdate, { passive: true });
addEventListener('resize', requestJourneyUpdate);
root.classList.add('enhanced');
updateJourney();
