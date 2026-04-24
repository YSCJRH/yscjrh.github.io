# yscjrh.github.io

This repository hosts YSCJRH / HJR's personal brand website on GitHub Pages.

The site is intentionally simple:

- static HTML at the repo root
- shared `styles.css` and `script.js`
- no build step
- no package manager
- no automated deployment config in-repo

## Read First

When taking over this repo, read these files in order:

1. `personalweb.md`
2. `AGENTS.md`
3. `PLANS.md`
4. `docs/handoff-brief.md`
5. `CONTENT_GAPS.md`

## Current State

- A mixed-bilingual static personal site with live public pages at `/`, `/projects/`, `/notes/`, two published note pages, and `/review/`.
- The current implementation has moved beyond the initial one-page version into a homepage-first small static site.
- The project gateway upgrade has landed on the homepage and `/projects/`.
- A visual depth pass is live; key homepage/project/note visuals are now local CSS/HTML modules rather than fragile image embeds.
- `/review/` is currently a live but unindexed internal review surface; do not remove or promote it without an explicit decision.
- The next work is documentation sync, browser QA, GitHub wording alignment, and continued evidence-backed content strengthening.
- Public claims must stay within the truthfulness boundaries defined in `personalweb.md` and `AGENTS.md`.

## Local Preview

Use this command from the repository root when doing browser QA in Codex or on Windows:

```powershell
python tools/serve.py
```

It is still a plain static preview server; it only ensures SVG files are served as `image/svg+xml`.

Fallback:

```powershell
python -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

## Repo Surfaces

Main public surfaces:

- `index.html`
- `projects/index.html`
- `notes/index.html`
- `notes/build-logs-homepage-second-pass.html`
- `notes/when-a-fluorescence-signal-becomes-usable.html`
- `review/index.html` as a noindex internal review surface
- GitHub profile and featured repository descriptions

Main maintenance surfaces:

- `PLANS.md` for the current phase
- `CONTENT_GAPS.md` for missing factual inputs
- `docs/handoff-brief.md` for the latest intake summary
- `docs/manual-qa-checklist.md` for manual site verification
- `docs/github-coordination-checklist.md` for GitHub/profile consistency checks
- `docs/public-surface-verification-*.md` for dated public surface checks
- `docs/decisions/` for future decision records

## Working Rules

- Keep the site static by default.
- Do not invent publications, affiliations, results, metrics, or contact methods.
- Treat GitHub Pages as public publishing.
- Record major brand, IA, content-model, or tooling decisions under `docs/decisions/`.
