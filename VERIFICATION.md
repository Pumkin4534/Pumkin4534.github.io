# Website verification

This repository contains website assets and a small public source-installer
bootstrap, not the MCP implementation or runtime state.

## Local checks

- The scroll restoration passed the two site/asset checks and JavaScript syntax
  validation. Baseline coverage also includes five open-path/fade regressions and
  four installer access/error checks covering refusals before installation files.
- Public-release checks: all 11 current Node tests passed, including source
  download dispatch without GitHub CLI/credentials, download failure, unsupported
  platform and missing toolchain. The bootstrap dispatch test uses a fixture
  archive and build steps; it is not a full Rust compilation test.
- JavaScript syntax and Bash syntax checks passed.
- Browser layouts checked at 360, 390, 600, 768, 850, 1100 and 1440 CSS pixels
  without horizontal overflow; 200% zoom also checked.
- Automatic three-shape morphing and explicit reshape worked. Pointer/tap input
  controls only the local illustration, not commands or models.
- Motion now follows the system reduced-motion preference without a visible
  toggle. Reduced-motion rendering suspension was rechecked. Out-of-view and
  hidden-tab suspension remain as previously exercised.
- Command copy success and denied-clipboard fallback were tested with an
  in-memory clipboard replacement; the operator's system clipboard was not used.
- Keyboard skip navigation and visible focus styles were checked. Local computed
  text/background contrast checks reported no below-threshold combinations.
- No browser console errors were observed during these checks.

## Open paths and endpoint fades

Closing connector curves have been removed. The path vertices exactly match the
original open contours, with fractional arc-length travel and smooth fades at both
ends. Five regressions cover no added connector, endpoint invisibility, continuous
sub-vertex movement, even speed, and finite degenerate paths.
A browser capture observed 451 frames, one cycle reset with opacity below 0.00051,
and a maximum visible per-frame displacement of 1.24 CSS pixels. Each drawn contour
had exactly its original 95 segments. These are local observations, not device-wide
FPS guarantees.

## Restored scroll-driven workflow

The second section uses its original illustrated CSV-export panel again. Scrolling
advances the drawn path and the plan/check/review example states; scrolling upward
rewinds it. All three stages and reverse scrolling passed a browser check.
The interactive mission controls and their controller were removed.

The header navigation links now share centered alignment and equal vertical
padding. Browser measurements placed all three text boxes on the same vertical
coordinates. Desktop and mobile checks passed with no horizontal overflow; the
GitHub button remains available and there is no visible motion toggle.

The illustration is original programmatic artwork, not a real product session.
These browser checks do not establish compatibility with every browser/device.

## Publication boundary

The website and MCP source repositories are public with owner approval. The
bootstrap uses curl to download a pinned source archive over HTTPS without
authentication. No credential is embedded in the site or its copyable command.
No website analytics, remote fonts, external JavaScript libraries, or model
services are loaded.

## Live publication

GitHub Pages serves https://pumkin4534.github.io/arc-mcp-site/ publicly. The page
and installer endpoint returned HTTP 200. Live desktop/mobile checks confirmed
one install command, no installation toggle, the active canvas, reshape controls,
and loaded assets. The MCP repository remained private during the website-only
launch; the owner subsequently authorized publication of the MCP source.

An additional full source-recompilation smoke test through the public bootstrap
exceeded its allotted runtime. It is **not** counted as a successful fresh
installation; no automatic replay was performed. The local installer access/error
tests and the earlier MCP source-installer validation are separate evidence.
