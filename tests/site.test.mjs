import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('exactly one install command and no install toggle', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/id="install-command"/g) ?? []).length, 1);
  assert.equal((html.match(/curl -fsSL/g) ?? []).length, 1);
  assert.ok(!html.includes('type="radio"'));
  assert.ok(html.includes('GitHub repository access required'));
  assert.ok(!html.includes('noindex'));
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (!match[1].startsWith('https:')) await access(join(root, match[1]));
  }
});

test('website has no network integrations or private source imports', async () => {
  const js = await readFile(join(root, 'app.js'), 'utf8');
  assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|https?:\/\//.test(js));
  assert.ok(js.includes('prefers-reduced-motion'));
  assert.ok(js.includes('document.hidden'));
  assert.ok(js.includes('cancelAnimationFrame'));
});

for (const mode of ['unsupported-platform', 'missing-gh', 'denied-access', 'missing-toolchain']) {
  test(`installer: ${mode} refuses before creating installation files`, async t => {
    const home = await mkdtemp(join(tmpdir(), 'arc-site-test-'));
    t.after(() => rm(home, { recursive: true, force: true }));
    const bin = join(home, 'bin');
    await mkdir(bin);
    await writeFile(join(bin, 'uname'), `#!/bin/sh\nprintf '%s\\n' '${mode === 'unsupported-platform' ? 'Linux' : 'Darwin'}'\n`, { mode: 0o755 });
    if (mode !== 'missing-gh') await writeFile(join(bin, 'gh'), `#!/bin/sh\nexit ${mode === 'denied-access' ? '1' : '0'}\n`, { mode: 0o755 });
    await writeFile(join(bin, 'mktemp'), `#!/bin/sh\ntouch '${join(home, 'unexpected-temp')}'\nexit 1\n`, { mode: 0o755 });
    const result = spawnSync('/bin/bash', [join(root, 'install.sh')], { env: { HOME: home, PATH: bin, ARC_CONFIG_HOME: join(home, 'config') }, encoding: 'utf8' });
    assert.equal(result.status, 1, result.stderr);
    const expected = { 'unsupported-platform': /macOS only/, 'missing-gh': /private preview/, 'denied-access': /Repository access is required/, 'missing-toolchain': /Required tool missing/ };
    assert.match(result.stderr, expected[mode]);
    await assert.rejects(access(join(home, 'unexpected-temp')));
    await assert.rejects(access(join(home, 'config')));
  });
}
