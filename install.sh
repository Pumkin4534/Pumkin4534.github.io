#!/usr/bin/env bash
# Public, unauthenticated installation from the pinned source release.
set -euo pipefail
umask 077

repository='Pumkin4534/arc-mcp'
ref='v0.1.1'
if [[ "$(uname -s)" != Darwin ]]; then
  printf '%s\n' 'Arc MCP currently supports macOS only. No installation changes were made.' >&2
  exit 1
fi
for tool in curl tar shasum; do
  command -v "$tool" >/dev/null || { printf 'Required macOS tool missing: %s\n' "$tool" >&2; exit 1; }
done
xcode-select -p >/dev/null 2>&1 || { printf '%s\n' 'Install Xcode command line tools first: xcode-select --install' >&2; exit 1; }
work="$(mktemp -d "${TMPDIR:-/tmp}/arc-install.XXXXXXXX")"
trap 'rm -rf "$work"' EXIT

fetch() {
  curl -q --fail --silent --show-error --location --proto '=https' --proto-redir '=https' --tlsv1.2 "$1" --output "$2"
}
tools_root="${ARC_TOOLS_HOME:-${XDG_DATA_HOME:-$HOME/.local/share}/arc-mcp/tools}"
case "$tools_root" in /*) ;; *) printf '%s\n' 'ARC_TOOLS_HOME must be an absolute path.' >&2; exit 1;; esac

rust_ready() {
  command -v cargo >/dev/null 2>&1 && command -v rustc >/dev/null 2>&1 || return 1
  cargo --version >/dev/null 2>&1 || return 1
  local version
  version="$(rustc --version 2>/dev/null)" || return 1
  [[ "$version" =~ ^rustc\ ([0-9]+)\.([0-9]+)\. ]] || return 1
  (( BASH_REMATCH[1] > 1 || (BASH_REMATCH[1] == 1 && BASH_REMATCH[2] >= 88) ))
}
if ! rust_ready; then
  # Recover a normal Rust installation that simply is not on this shell's PATH.
  export PATH="${CARGO_HOME:-$HOME/.cargo}/bin:$PATH"
fi
if ! rust_ready; then
  # Keep automatically prepared build tools separate from existing toolchains
  # and shell profiles. These variables apply only to this installer process.
  export CARGO_HOME="$tools_root/cargo"
  export RUSTUP_HOME="$tools_root/rustup"
  export RUSTUP_TOOLCHAIN=stable
  export PATH="$CARGO_HOME/bin:$PATH"
  if ! rust_ready; then
    printf '%s\n' 'Preparing Rust and Cargo for the Arc build…'
    if [[ -x "$CARGO_HOME/bin/rustup" ]]; then
      "$CARGO_HOME/bin/rustup" toolchain install stable --profile minimal
    else
      fetch 'https://sh.rustup.rs' "$work/rustup-init.sh"
      /bin/sh "$work/rustup-init.sh" -y --profile minimal --default-toolchain stable --no-modify-path
    fi
  fi
fi
printf '%s\n' 'Checking the Rust/Cargo toolchain…'
rust_ready || { printf '%s\n' 'Rust/Cargo setup did not complete successfully.' >&2; exit 1; }

node_ready() {
  command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 || return 1
  node -e 'if (Number(process.versions.node.split(".")[0]) < 20) process.exit(1)' >/dev/null 2>&1 && npm --version >/dev/null 2>&1
}
if ! node_ready; then
  node_version='22.23.4'
  # Official nodejs.org SHASUMS256.txt for this pinned LTS release.
  case "$(uname -m)" in
    x86_64) node_arch='x64'; node_sha='efcc2b0db6f94bf53eddb038fe2b370277a042bd29e4f19b8f8e23598795b819';;
    arm64|aarch64) node_arch='arm64'; node_sha='c9e1dbc748b33ed2d14f42445191ecaf14c56259c7a9a26d0042c49ec2b66428';;
    *) printf '%s\n' 'Unsupported macOS architecture for automatic Node.js setup.' >&2; exit 1;;
  esac
  node_dir="$tools_root/node-v$node_version-darwin-$node_arch"
  export PATH="$node_dir/bin:$PATH"
  if ! node_ready; then
    [[ ! -e "$node_dir" && ! -L "$node_dir" ]] || { printf 'Incomplete managed Node.js directory; inspect it before retrying: %s\n' "$node_dir" >&2; exit 1; }
    printf '%s\n' 'Preparing Node.js and npm for the Arc installer…'
    fetch "https://nodejs.org/dist/v$node_version/node-v$node_version-darwin-$node_arch.tar.gz" "$work/node.tar.gz"
    printf '%s  %s\n' "$node_sha" "$work/node.tar.gz" | shasum -a 256 -c -
    mkdir "$work/node"
    tar -xzf "$work/node.tar.gz" -C "$work/node" --strip-components=1
    mkdir -p "$tools_root"
    mv "$work/node" "$node_dir"
  fi
fi
node_ready || { printf '%s\n' 'Node.js/npm setup did not complete successfully.' >&2; exit 1; }

printf '%s\n' 'Build tools ready. Downloading and building Arc MCP…'
fetch "https://codeload.github.com/$repository/tar.gz/refs/tags/$ref" "$work/source.tar.gz"
mkdir "$work/source"
tar -xzf "$work/source.tar.gz" -C "$work/source" --strip-components=1
(
  cd "$work/source"
  npm ci --ignore-scripts --no-audit --no-fund
  node scripts/build.mjs
  node scripts/install.mjs --install
)
