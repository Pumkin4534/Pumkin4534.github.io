# Arc MCP — public website

Website-only repository for [Arc MCP](https://pumkin4534.github.io/arc-mcp-site/).
The MCP implementation remains in the separate **private** repository.

The site shows one public bootstrap command. Installing the private preview still
requires GitHub CLI authentication and access to `Pumkin4534/arc-mcp`. The bootstrap
checks access before creating installation files, fetches the pinned `v0.1.1`
source through GitHub CLI, and uses the audited source installer. No credentials
are embedded in the website, URL, or command.

## Design and motion

Original warm graphite / ivory / copper identity, generated canvas geometry and
SVG workflow illustration. No external images, fonts, libraries or analytics.
The user supplied a high-motion reference name that could not be verified; this
is an original composition, not a claimed recreation of that site.

- Pointer-reactive projected 3D field, with three morphing geometries. It cycles
  while visible; the reshape button also gives direct mouse/keyboard control.
- Click/tap ripples and contour-travelling signals.
- Signals use fractional arc-length motion on the same closed contours that are
  drawn. Tangent-matched return curves prevent end-to-start jumps; shape morphs
  use time-based easing rather than per-frame position snaps.
- Scroll-linked path connecting the illustrated workflow stages.
- Explicit pause/resume, reduced-motion support, no scroll interception.
- Canvas stops when out of view or the document is hidden; DPR/frame rate capped.
- Copy button handles unavailable clipboard access without hiding the command.

Preview with a static server, for example `python3 -m http.server 4174 --bind
127.0.0.1`. GitHub Pages serves the main branch root. This repository must not
contain MCP source, local runtime records, installation backups or credentials.

Static checks: `node --check app.js`, `bash -n install.sh`, and
`node --test tests/*.test.mjs`.

The site is MIT licensed. The illustration is original programmatic artwork.
