# Website verification

This repository contains website assets and platform-installer wrappers, not the
MCP implementation or runtime state.

## Current cross-platform website checks

- Nine site/orbit tests passed, plus JavaScript syntax, Bash syntax and whitespace
  checks. Open contours and endpoint fades retain their regression coverage.
- Fresh browser contexts with Windows, macOS and Linux platform values each
  showed exactly one appropriate command. Copying matched the displayed command
  using an in-memory clipboard fixture; no system clipboard was changed.
- At 390 × 844, all three platform cases had no horizontal overflow or page
  errors and honored reduced motion. At 1440 × 1000, the three navigation links
  shared identical vertical bounds and the GitHub button linked to the MCP repo.
- The website wrappers delegate to the core repository's canonical installers.
  Those installers verify prebuilt release bundles and reuse or prepare Node.js;
  no compiler is needed. Actual OS installation is tested in the MCP repository's
  six-platform workflow. Browser platform emulation is not a Windows runtime test.
- Release publication must precede the website update. Keep the legacy installer
  URL forwarding to the main domain and restart OpenCode after installation.

## Historical 0.1.1 checks

The sections below record the earlier source-build installer and original visual
checks. The 0.2.0 prebuilt installer supersedes the Rust/Cargo prerequisites.

### Original local checks

- The scroll restoration passed the two site/asset checks and JavaScript syntax
  validation. Baseline coverage also includes five open-path/fade regressions and
  four installer access/error checks covering refusals before installation files.
- Public-release checks: all 11 current Node tests passed, including source
  download dispatch without GitHub CLI/credentials, download failure, unsupported
  platform and missing toolchain. The bootstrap dispatch test uses a fixture
  archive and build steps; it is not a full Rust compilation test.

## Fresh-machine prerequisites

The bootstrap now prepares missing Rust/Cargo and Node.js/npm automatically.
The current bootstrap/site suite has 11 passing tests covering supported existing
tools, Rust outside PATH, absent/old Rust, retained shell profiles, failed downloads,
Node checksum rejection, missing Apple developer tools and public access.
Dependency preparation in these unit tests uses explicit fixtures.

A separate real-tool test started with no Cargo, rustc, Node, npm or GitHub CLI on
PATH and no user toolchains in its isolated home. Official rustup installed a
minimal stable toolchain. Its first startup exceeded the test deadline; that
initial run is not counted as a completed install. Direct version diagnostics
then confirmed the installed Cargo and rustc. A deliberate continuation reused
that verified toolchain without reinstalling it, downloaded and checksum-verified
Node.js 22.23.4, compiled Arc, and installed it successfully. Version 0.1.1, all
seven MCP tools, config/plugin contents, build-path removal and preserved shell
profiles were verified. This is staged validation, not a claim that the initial
clean-home invocation completed uninterrupted.
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
current platform bootstraps download pinned release bundles over HTTPS without
authentication. No credential is embedded in the site or its copyable command.
No website analytics, remote fonts, external JavaScript libraries, or model
services are loaded.

## Historical live 0.1.1 publication

GitHub Pages serves https://pumkin4534.github.io/ publicly. The page
and installer endpoint returned HTTP 200. Live desktop/mobile checks confirmed
one install command, no installation toggle, the active canvas, reshape controls,
and loaded assets. The MCP repository remained private during the website-only
launch; the owner subsequently authorized publication of the MCP source.

## Historical anonymous 0.1.1 installation

After removing authentication requirements, a new end-to-end check downloaded
the deployed public bootstrap and built the pinned public source in a fresh home
without GitHub/provider credentials. The actual release build and installation
passed. Installed configuration and plugin contents, binary version 0.1.1,
absence of checked identifying build paths, MCP initialization and its seven-tool
catalog were verified. Existing operator configuration was not the target.

An earlier authenticated-bootstrap recompilation attempt timed out and was not
counted as a pass. The successful anonymous check used the changed public download
path and a new isolated home; it was not an automatic replay of that attempt.
