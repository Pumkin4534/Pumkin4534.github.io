import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname,join,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');

test('one install display, supported platforms and valid local assets',async()=>{
 const html=await readFile(join(root,'index.html'),'utf8');
 assert.equal((html.match(/id="install-command"/g)??[]).length,1);
 assert.equal((html.match(/curl -fsSL/g)??[]).length,1);
 assert.ok(!html.includes('type="radio"'));
 for(const text of ['Windows','Ubuntu','no Cargo or compiler required','no account required'])assert.ok(html.includes(text));
 assert.ok(!html.includes('Private preview'));
 for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!match[1].startsWith('https:'))await access(join(root,match[1].split('?')[0]));
});
test('platform command selection is local, without analytics requests',async()=>{
 const js=await readFile(join(root,'app.js'),'utf8');
 assert.ok(js.includes('irm https://pumkin4534.github.io/install.ps1 | iex'));
 assert.ok(!/fetch\(|XMLHttpRequest|WebSocket/.test(js));
 assert.ok(js.includes('prefers-reduced-motion')&&js.includes('document.hidden'));
});
test('Unix wrapper delegates to canonical public installer over HTTPS',async()=>{
 const script=await readFile(join(root,'install.sh'),'utf8');
 assert.ok(script.includes('https://raw.githubusercontent.com/Pumkin4534/arc-mcp/main/install.sh'));
 assert.ok(script.includes("--proto '=https' --proto-redir '=https'"));
 assert.ok(!script.includes('gh api'));
});
test('PowerShell wrapper restores TLS and uses canonical public installer',async()=>{
 const script=await readFile(join(root,'install.ps1'),'utf8');
 assert.ok(script.includes('https://raw.githubusercontent.com/Pumkin4534/arc-mcp/main/install.ps1'));
 assert.ok(script.includes('finally')&&script.includes('SecurityProtocol = $previousTls'));
});
