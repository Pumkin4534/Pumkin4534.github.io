# Website verification

This repository contains website assets and a small authenticated installer
bootstrap, not the private MCP implementation or runtime state.

## Local checks

- Current revision: ten functional tests passed (five open-path/fade tests and
  five explorer-state tests), plus the two site/asset checks. The unchanged
  installer has four earlier access/error tests covering refusals before files.
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

## Hands-on feature explorer

The CSV-export demo was exercised through early completion refusal, planning,
checks, both simulated reviews, completion, source edits invalidating evidence,
a failed latest check, and reset. Keyboard activation and native touch taps in a
mobile browser context passed. State survives scrolling and the animated signal
lands on the corresponding workflow node. All outcomes are explicitly simulated.
The header's Install link and GitHub repository button were visible on mobile;
there is no motion-toggle button. Seven viewport widths and 200% zoom showed no
horizontal overflow.

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
one install command, no installation toggle, the active canvas, reshape controls,
and loaded assets. The separate MCP repository was checked
to remain private with no Pages deployment.

An additional full source-recompilation smoke test through the public bootstrap
exceeded its allotted runtime. It is **not** counted as a successful fresh
installation; no automatic replay was performed. The local installer access/error
tests and the earlier MCP source-installer validation are separate evidence.
