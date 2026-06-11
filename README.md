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
6. `WEBIMPROVE_PROGRESS.md` when continuing the current improvement pass

## Current State

- A mixed-bilingual static personal site with live public pages at `/`, `/projects/`, `/notes/`, two published note pages, and `/instrument/`.
- The former `/review/` internal review route is retired from the deployable tree; it remains excluded from `sitemap.xml` and disallowed in `robots.txt`.
- The current implementation has moved beyond the initial one-page version into a homepage-first small static site.
- The project gateway upgrade has landed on the homepage and `/projects/`.
- A visual depth pass is live; key homepage/project/note visuals are now local CSS/HTML modules rather than fragile image embeds.
- Current maintenance baselines now cover content model, design system, accessibility, performance/SEO, and site sanity checks.
- Instrument Lab now has a repeatable browser QA gate, source/synthetic separation checks, and a dated `refine.md` final audit for the 2026-06-11 reconstruction.
- Next likely work is routine public-surface maintenance, GitHub wording alignment, and evidence-backed content strengthening outside the closed Instrument Lab refine scope.
- Public claims must stay within the truthfulness boundaries defined in `personalweb.md` and `AGENTS.md`.

## Local Preview

Use this command from the repository root when doing browser QA in Codex or on Windows:

```powershell
python tools/serve.py
```

It is still a plain static preview server; it ensures SVG files are served as `image/svg+xml` and uses the next available local port if `4173` is occupied. Use the URL printed by the command; do not assume `4173` if the helper reports another port.

Fallback:

```powershell
python -m http.server 4173
```

Then open the URL printed by the server, for example:

```text
http://127.0.0.1:4173/
```

`http://localhost:<printed-port>/` is also available as an alias, but `127.0.0.1` is the preferred QA URL for Codex browser checks of local ES modules.

## Validation

Run the site sanity checker after scoped HTML, metadata, sitemap, robots, or link changes:

```powershell
python tools/check_site.py
```

For the Instrument Lab browser QA gates:

```powershell
node tools/check-instrument-browser.js
```

For browser and Lighthouse checks, start the local preview first. You can also force a specific port when needed:

```powershell
$env:PORT=4174; python tools/serve.py
```

Current Lighthouse baselines are documented in:

- `ACCESSIBILITY_CHECKLIST.md`
- `PERFORMANCE_CHECKLIST.md`

## Repo Surfaces

Main public surfaces:

- `index.html`
- `projects/index.html`
- `notes/index.html`
- `notes/build-logs-homepage-second-pass.html`
- `notes/when-a-fluorescence-signal-becomes-usable.html`
- `instrument/index.html`
- `robots.txt`
- `sitemap.xml`
- `assets/og-card.png`
- GitHub profile and featured repository descriptions

Main maintenance surfaces:

- `PLANS.md` for the current phase
- `WEBIMPROVE_PROGRESS.md` for milestone status during the current improvement pass
- `DESIGN_SYSTEM.md` for active visual tokens and component conventions
- `CONTENT_MODEL.md` for project and note field rules
- `ACCESSIBILITY_CHECKLIST.md` for the accessibility baseline and manual checks
- `PERFORMANCE_CHECKLIST.md` for SEO/performance baseline and tradeoffs
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
- Do not reintroduce `/review/` or another internal review surface into the deployable tree unless explicitly approved.
- Record major brand, IA, content-model, or tooling decisions under `docs/decisions/`.
