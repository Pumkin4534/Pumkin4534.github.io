# Website verification

This repository contains website assets and a small authenticated installer
bootstrap, not the private MCP implementation or runtime state.

## Local checks

- Six Node tests passed: one install command/no install toggle, no website
  network integrations, unsupported OS, missing GitHub CLI, denied repository
  access and missing toolchain. Refusals occurred before installation files.
- JavaScript syntax and Bash syntax checks passed.
- Browser layouts checked at 360, 390, 600, 768, 850, 1100 and 1440 CSS pixels
  without horizontal overflow; 200% zoom also checked.
- Automatic three-shape morphing and explicit reshape worked. Pointer/tap input
  controls only the local illustration, not commands or models.
- Pause/resume, reduced-motion preference, out-of-view suspension and hidden-tab
  suspension were exercised. Rendering stopped when paused/hidden/offscreen.
- Command copy success and denied-clipboard fallback were tested with an
  in-memory clipboard replacement; the operator's system clipboard was not used.
- Keyboard skip navigation and visible focus styles were checked. Local computed
  text/background contrast checks reported no below-threshold combinations.
- No browser console errors were observed during these checks.

The illustration is original programmatic artwork, not a real product session.
These browser checks do not establish compatibility with every browser/device.

## Publication boundary

Only the website repository is public. The bootstrap downloads the pinned MCP
source through authenticated GitHub CLI and needs access to the private repository.
No credential is embedded in the site or its copyable command. No website analytics,
remote fonts, external JavaScript libraries, or model services are loaded.

## Live publication

GitHub Pages serves https://pumkin4534.github.io/arc-mcp-site/ publicly. The page
and installer endpoint returned HTTP 200. Live desktop/mobile checks confirmed
one install command, no installation toggle, the active canvas, reshape and
pause/resume controls, and loaded assets. The separate MCP repository was checked
to remain private with no Pages deployment.

An additional full source-recompilation smoke test through the public bootstrap
exceeded its allotted runtime. It is **not** counted as a successful fresh
installation; no automatic replay was performed. The local installer access/error
tests and the earlier MCP source-installer validation are separate evidence.
