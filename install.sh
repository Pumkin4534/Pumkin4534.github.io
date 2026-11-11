#!/usr/bin/env bash
# Public website bootstrap. The MCP source remains a private preview.
set -euo pipefail
umask 077

repository='Pumkin4534/arc-mcp'
ref='v0.1.1'
if [[ "$(uname -s)" != Darwin ]]; then
  printf '%s\n' 'Arc MCP currently supports macOS only. No installation changes were made.' >&2
  exit 1
fi
command -v gh >/dev/null || {
  printf '%s\n' 'Arc is a private preview. Install GitHub CLI (https://cli.github.com), sign in with gh auth login, and obtain access to Pumkin4534/arc-mcp first.' >&2
  exit 1
}
if ! gh api --hostname github.com "repos/$repository" --silent; then
  printf '%s\n' 'Repository access is required. Sign in with gh auth login and confirm you can access Pumkin4534/arc-mcp. No installation changes were made.' >&2
  exit 1
fi
for tool in cargo rustc node npm curl tar; do
  command -v "$tool" >/dev/null || { printf 'Required tool missing: %s\n' "$tool" >&2; exit 1; }
done
node -e 'if (Number(process.versions.node.split(".")[0]) < 20) process.exit(1)' || { printf '%s\n' 'Node.js 20+ is required.' >&2; exit 1; }
xcode-select -p >/dev/null 2>&1 || { printf '%s\n' 'Install Xcode command line tools first: xcode-select --install' >&2; exit 1; }
work="$(mktemp -d "${TMPDIR:-/tmp}/arc-install.XXXXXXXX")"
trap 'rm -rf "$work"' EXIT
gh api --hostname github.com "repos/$repository/tarball/$ref" > "$work/source.tar.gz"
mkdir "$work/source"
tar -xzf "$work/source.tar.gz" -C "$work/source" --strip-components=1
(
  cd "$work/source"
  npm ci --ignore-scripts --no-audit --no-fund
  node scripts/build.mjs
  node scripts/install.mjs --install
)
