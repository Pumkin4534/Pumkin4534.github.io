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

for (const mode of ['unsupported-platform', 'missing-system-tools', 'missing-xcode']) {
  test(`installer: ${mode} refuses before creating installation files`, async t => {
    const home = await mkdtemp(join(tmpdir(), 'arc-site-test-'));
    t.after(() => rm(home, { recursive: true, force: true }));
    const bin = join(home, 'bin');
    await mkdir(bin);
    await writeFile(join(bin, 'uname'), `#!/bin/sh\nprintf '%s\\n' '${mode === 'unsupported-platform' ? 'Linux' : 'Darwin'}'\n`, { mode: 0o755 });
    if (mode === 'missing-xcode') {
      for (const tool of ['curl', 'tar', 'shasum']) await writeFile(join(bin, tool), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
      await writeFile(join(bin, 'xcode-select'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
    }
    await writeFile(join(bin, 'mktemp'), `#!/bin/sh\n/usr/bin/touch '${join(home, 'unexpected-temp')}'\nexit 1\n`, { mode: 0o755 });
    const result = spawnSync('/bin/bash', [join(root, 'install.sh')], { env: { HOME: home, PATH: bin, ARC_CONFIG_HOME: join(home, 'config') }, encoding: 'utf8' });
    assert.equal(result.status, 1, result.stderr);
    const expected = { 'unsupported-platform': /macOS only/, 'missing-system-tools': /Required macOS tool missing/, 'missing-xcode': /xcode-select --install/ };
    assert.match(result.stderr, expected[mode]);
    await assert.rejects(access(join(home, 'unexpected-temp')));
    await assert.rejects(access(join(home, 'config')));
  });
}

for (const mode of ['existing-tools', 'download-fails', 'recover-cargo-path', 'missing-rust', 'old-rust', 'bad-node-checksum']) {
  test(`public bootstrap: ${mode}`, async t => {
    const home = await mkdtemp(join(tmpdir(), 'arc-public-bootstrap-'));
    t.after(() => rm(home, { recursive: true, force: true }));
    const bin = join(home, 'bin'), temp = join(home, 'tmp');
    const source = join(home, 'fixture/scripts');
    await Promise.all([mkdir(bin), mkdir(temp), mkdir(source, { recursive: true })]);
    const which = name => execFileSync('/bin/sh', ['-c', `command -v ${name}`], { encoding: 'utf8' }).trim();
    for (const tool of ['mkdir', 'rm', 'tar', 'mktemp', 'shasum', 'mv']) await symlink(which(tool), join(bin, tool));
    if (mode !== 'bad-node-checksum') await symlink(process.execPath, join(bin, 'node'));
    await writeFile(join(bin, 'uname'), '#!/bin/sh\nif [ "$1" = "-m" ]; then printf "x86_64\\n"; else printf "Darwin\\n"; fi\n', { mode: 0o755 });
    for (const tool of ['npm', 'xcode-select']) await writeFile(join(bin, tool), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
    const cargoBin = mode === 'recover-cargo-path' ? join(home, '.cargo/bin') : bin;
    if (mode !== 'missing-rust') {
      await mkdir(cargoBin, { recursive: true });
      await writeFile(join(cargoBin, 'cargo'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
      await writeFile(join(cargoBin, 'rustc'), `#!/bin/sh\nprintf 'rustc 1.${mode === 'old-rust' ? '70' : '95'}.0 (fixture)\\n'\n`, { mode: 0o755 });
    }
    await writeFile(join(home, '.zshrc'), '# original shell profile\n');
    await writeFile(join(source, 'build.mjs'), "import fs from 'node:fs'; fs.writeFileSync(process.env.HOME + '/built', 'fixture');\n");
    await writeFile(join(source, 'install.mjs'), "import fs from 'node:fs'; if (!fs.existsSync(process.env.HOME + '/built')) process.exit(2); fs.writeFileSync(process.env.HOME + '/installed', 'fixture');\n");
    const archive = join(home, 'fixture.tar.gz');
    execFileSync(which('tar'), ['-czf', archive, '-C', home, 'fixture']);
    const rustupFixture = join(home, 'rustup-fixture.mjs');
    await writeFile(rustupFixture, `import fs from 'node:fs';import path from 'node:path';const bin=path.join(process.env.CARGO_HOME,'bin');fs.mkdirSync(bin,{recursive:true});fs.mkdirSync(process.env.RUSTUP_HOME,{recursive:true});fs.writeFileSync(path.join(bin,'cargo'),'#!/bin/sh\\nexit 0\\n',{mode:0o755});fs.writeFileSync(path.join(bin,'rustc'),"#!/bin/sh\\nprintf 'rustc 1.95.0 (fixture)\\\\n'\\n",{mode:0o755});fs.writeFileSync(process.env.HOME+'/rustup-args.json',JSON.stringify(process.argv.slice(2)));\n`);
    const quote = text => `'${text.replaceAll("'", "'\\''")}'`;
    const rustupScript = `#!/bin/sh\nexec ${quote(process.execPath)} ${quote(rustupFixture)} "$@"\n`;
    await writeFile(join(bin, 'curl'), `#!${process.execPath}\nconst fs = require('node:fs'); const args = process.argv.slice(2); fs.appendFileSync(process.env.HOME + '/curl-args.jsonl', JSON.stringify(args)+'\\n'); if (${mode === 'download-fails'}) process.exit(22); const output=args[args.indexOf('--output')+1]; if(args.includes('https://sh.rustup.rs'))fs.writeFileSync(output,${JSON.stringify(rustupScript)});else fs.copyFileSync(${JSON.stringify(archive)},output);\n`, { mode: 0o755 });
    const env = { HOME: home, PATH: bin, TMPDIR: temp, ARC_CONFIG_HOME: join(home, 'config') };
    assert.equal(spawnSync('/bin/sh', ['-c', 'command -v gh'], { env }).status, 1);
    const result = spawnSync('/bin/bash', [join(root, 'install.sh')], { env, encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, mode === 'download-fails' ? 22 : mode === 'bad-node-checksum' ? 1 : 0, result.stderr);
    const requests = (await readFile(join(home, 'curl-args.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
    for (const args of requests) {
      assert.ok(args.includes('-q') && args.includes('--fail') && args.includes('--proto-redir'));
      assert.ok(!args.some(arg => /Authorization|Bearer|--user/.test(arg)));
    }
    const rustSetup = ['missing-rust', 'old-rust'].includes(mode);
    assert.equal(requests.some(args => args.includes('https://sh.rustup.rs')), rustSetup);
    if (rustSetup) {
      const args = JSON.parse(await readFile(join(home, 'rustup-args.json'), 'utf8'));
      assert.ok(args.includes('--no-modify-path') && args.includes('minimal'));
      await access(join(home, '.local/share/arc-mcp/tools/cargo/bin/cargo'));
    }
    if (mode === 'old-rust') assert.match(await readFile(join(bin, 'rustc'), 'utf8'), /1\.70\.0/);
    assert.equal(await readFile(join(home, '.zshrc'), 'utf8'), '# original shell profile\n');
    if (mode === 'bad-node-checksum') {
      assert.ok(requests.some(args => args.includes('https://nodejs.org/dist/v22.23.4/node-v22.23.4-darwin-x64.tar.gz')));
      assert.ok(!requests.some(args => args.some(arg => arg.includes('codeload.github.com'))));
      assert.match(result.stdout + result.stderr, /checksum|FAILED/i);
    } else assert.ok(requests.at(-1).includes('https://codeload.github.com/Pumkin4534/arc-mcp/tar.gz/refs/tags/v0.1.1'));
    if (['download-fails', 'bad-node-checksum'].includes(mode)) {
      await assert.rejects(access(join(home, 'installed')));
      await assert.rejects(access(join(home, 'built')));
    } else assert.equal(await readFile(join(home, 'installed'), 'utf8'), 'fixture');
  });
}
