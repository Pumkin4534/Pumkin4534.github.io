# Arc MCP — public website

Website-only repository for [Arc MCP](https://pumkin4534.github.io/arc-mcp-site/).
The MCP implementation is in the public [Arc MCP repository](https://github.com/Pumkin4534/arc-mcp).

The site shows one public bootstrap command. It fetches the pinned `v0.1.1`
source archive over HTTPS and uses the source installer. GitHub CLI, credentials
and repository invitations are not needed. The installer builds locally and
preserves existing OpenCode settings.

## Design and motion

Original warm graphite / ivory / copper identity, generated canvas geometry and
a scroll-driven SVG workflow. No remotely loaded images, fonts, libraries or analytics.
The embedded GitHub mark comes from Octicons; see `THIRD-PARTY-NOTICES.md`.
The user supplied a high-motion reference name that could not be verified; this
is an original composition, not a claimed recreation of that site.

- Pointer-reactive projected 3D field, with three morphing geometries. It cycles
  while visible; the reshape button also gives direct mouse/keyboard control.
- Click/tap ripples and contour-travelling signals.
- Signals use fractional arc-length motion on the original open contours, fading
  out at the end and back in at the start. No closing connector lines are drawn.
  Shape morphs use time-based easing rather than per-frame position snaps.
- The original illustrated CSV-export path advances through plan, check and review
  as visitors scroll. It is an illustration; nothing invokes a model or commands.
- System reduced-motion preferences are respected automatically, with no visible
  motion toggle and no scroll interception.
- Canvas stops when out of view or the document is hidden; DPR/frame rate capped.
- Copy button handles unavailable clipboard access without hiding the command.

Preview with a static server, for example `python3 -m http.server 4174 --bind
127.0.0.1`. GitHub Pages serves the main branch root. This repository must not
contain MCP source, local runtime records, installation backups or credentials.

Static checks: `node --check app.js`, `bash -n install.sh`, and
`node --test tests/*.test.mjs`.

The site is MIT licensed. The illustration is original programmatic artwork.
