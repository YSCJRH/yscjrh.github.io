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

- Homepage-first personal site with live public pages at `/`, `/notes/`, and one published note page.
- Current phase is not a visual reset. The main work is evidence reinforcement, notes rollout decisions, GitHub wording alignment, and maintenance hardening.
- Public claims must stay within the truthfulness boundaries defined in `personalweb.md` and `AGENTS.md`.

## Local Preview

Use one of these commands from the repository root:

```powershell
python -m http.server 4173
```

or:

```powershell
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

## Repo Surfaces

Main public surfaces:

- `index.html`
- `notes/index.html`
- `notes/build-logs-homepage-second-pass.html`
- `review/index.html`
- GitHub profile and featured repository descriptions

Main maintenance surfaces:

- `PLANS.md` for the current phase
- `CONTENT_GAPS.md` for missing factual inputs
- `docs/handoff-brief.md` for the latest intake summary
- `docs/manual-qa-checklist.md` for manual site verification
- `docs/github-coordination-checklist.md` for GitHub/profile consistency checks
- `docs/decisions/` for future decision records

## Working Rules

- Keep the site static by default.
- Do not invent publications, affiliations, results, metrics, or contact methods.
- Treat GitHub Pages as public publishing.
- Record major brand, IA, content-model, or tooling decisions under `docs/decisions/`.
