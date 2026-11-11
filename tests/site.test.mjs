import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, access, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('exactly one install command and no install toggle', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/id="install-command"/g) ?? []).length, 1);
  assert.equal((html.match(/curl -fsSL/g) ?? []).length, 1);
  assert.ok(!html.includes('type="radio"'));
  assert.ok(html.includes('no account required'));
  assert.ok(!html.includes('Private preview'));
  assert.ok(!html.includes('GitHub CLI, signed in'));
  assert.ok(!html.includes('noindex'));
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (!match[1].startsWith('https:')) await access(join(root, match[1].split('?')[0]));
  }
});

test('website has no network integrations or private source imports', async () => {
  const js = await readFile(join(root, 'app.js'), 'utf8');
  assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|https?:\/\//.test(js));
  assert.ok(js.includes('prefers-reduced-motion'));
  assert.ok(js.includes('document.hidden'));
  assert.ok(js.includes('cancelAnimationFrame'));
});

for (const mode of ['unsupported-platform', 'missing-toolchain']) {
  test(`installer: ${mode} refuses before creating installation files`, async t => {
    const home = await mkdtemp(join(tmpdir(), 'arc-site-test-'));
    t.after(() => rm(home, { recursive: true, force: true }));
    const bin = join(home, 'bin');
    await mkdir(bin);
    await writeFile(join(bin, 'uname'), `#!/bin/sh\nprintf '%s\\n' '${mode === 'unsupported-platform' ? 'Linux' : 'Darwin'}'\n`, { mode: 0o755 });
    await writeFile(join(bin, 'mktemp'), `#!/bin/sh\n/usr/bin/touch '${join(home, 'unexpected-temp')}'\nexit 1\n`, { mode: 0o755 });
    const result = spawnSync('/bin/bash', [join(root, 'install.sh')], { env: { HOME: home, PATH: bin, ARC_CONFIG_HOME: join(home, 'config') }, encoding: 'utf8' });
    assert.equal(result.status, 1, result.stderr);
    const expected = { 'unsupported-platform': /macOS only/, 'missing-toolchain': /Required tool missing/ };
    assert.match(result.stderr, expected[mode]);
    await assert.rejects(access(join(home, 'unexpected-temp')));
    await assert.rejects(access(join(home, 'config')));
  });
}

for (const downloadFails of [false, true]) {
  test(`public bootstrap ${downloadFails ? 'stops on download failure' : 'runs without GitHub CLI or credentials'}`, async t => {
    const home = await mkdtemp(join(tmpdir(), 'arc-public-bootstrap-'));
    t.after(() => rm(home, { recursive: true, force: true }));
    const bin = join(home, 'bin'), temp = join(home, 'tmp');
    const source = join(home, 'fixture/scripts');
    await Promise.all([mkdir(bin), mkdir(temp), mkdir(source, { recursive: true })]);
    const which = name => execFileSync('/bin/sh', ['-c', `command -v ${name}`], { encoding: 'utf8' }).trim();
    for (const tool of ['mkdir', 'rm', 'tar', 'mktemp']) await symlink(which(tool), join(bin, tool));
    await symlink(process.execPath, join(bin, 'node'));
    await writeFile(join(bin, 'uname'), '#!/bin/sh\nprintf "Darwin\\n"\n', { mode: 0o755 });
    for (const tool of ['cargo', 'rustc', 'npm', 'xcode-select']) await writeFile(join(bin, tool), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
    await writeFile(join(source, 'build.mjs'), "import fs from 'node:fs'; fs.writeFileSync(process.env.HOME + '/built', 'fixture');\n");
    await writeFile(join(source, 'install.mjs'), "import fs from 'node:fs'; if (!fs.existsSync(process.env.HOME + '/built')) process.exit(2); fs.writeFileSync(process.env.HOME + '/installed', 'fixture');\n");
    const archive = join(home, 'fixture.tar.gz');
    execFileSync(which('tar'), ['-czf', archive, '-C', home, 'fixture']);
    await writeFile(join(bin, 'curl'), `#!${process.execPath}\nconst fs = require('node:fs'); const args = process.argv.slice(2); fs.writeFileSync(process.env.HOME + '/curl-args.json', JSON.stringify(args)); if (${downloadFails}) process.exit(22); fs.copyFileSync(${JSON.stringify(archive)}, args[args.indexOf('--output') + 1]);\n`, { mode: 0o755 });
    const env = { HOME: home, PATH: bin, TMPDIR: temp, ARC_CONFIG_HOME: join(home, 'config') };
    assert.equal(spawnSync('/bin/sh', ['-c', 'command -v gh'], { env }).status, 1);
    const result = spawnSync('/bin/bash', [join(root, 'install.sh')], { env, encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, downloadFails ? 22 : 0, result.stderr);
    const args = JSON.parse(await readFile(join(home, 'curl-args.json'), 'utf8'));
    assert.ok(args.includes('https://codeload.github.com/Pumkin4534/arc-mcp/tar.gz/refs/tags/v0.1.1'));
    assert.ok(args.includes('-q') && args.includes('--fail') && args.includes('--proto-redir'));
    assert.ok(!args.some(arg => /Authorization|Bearer|--user/.test(arg)));
    if (downloadFails) {
      await assert.rejects(access(join(home, 'installed')));
      await assert.rejects(access(join(home, 'built')));
    } else assert.equal(await readFile(join(home, 'installed'), 'utf8'), 'fixture');
  });
}
