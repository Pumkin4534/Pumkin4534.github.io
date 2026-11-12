#!/usr/bin/env bash
set -euo pipefail
umask 077
work="$(mktemp -d "${TMPDIR:-/tmp}/arc-bootstrap.XXXXXXXX")"
trap 'rm -rf "$work"' EXIT
curl -q --fail --silent --show-error --location --proto '=https' --proto-redir '=https' --tlsv1.2 \
  'https://raw.githubusercontent.com/Pumkin4534/arc-mcp/main/install.sh' --output "$work/install.sh"
/bin/bash "$work/install.sh"
