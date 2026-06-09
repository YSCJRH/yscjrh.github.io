---
name: site-public-surface-review
description: Use when reviewing or improving the public surfaces of this personal GitHub Pages site, especially homepage, Projects, Notes, Instrument Lab, navigation, links, responsive layout, metadata, or public-claim boundaries.
---

# Site Public Surface Review

Review the site as a public research-builder surface, not as a generic portfolio or SaaS landing page. Keep changes small, source-backed, bilingual where visitor-facing, and static-site friendly.

## Source Order

Read current sources before judging visuals:

1. `AGENTS.md`, `personalweb.md`, `DESIGN_SYSTEM.md`, `CONTENT_MODEL.md`
2. `WEBIMPROVE_PROGRESS.md`, `ACCESSIBILITY_CHECKLIST.md`, `PERFORMANCE_CHECKLIST.md`
3. Relevant HTML/CSS/JS route files

Use current files over historical screenshots or old fixed-port notes.

## Review Loop

1. Run or reuse `python tools/serve.py`; use the printed `127.0.0.1` URL.
2. Inspect rendered pages before editing. Cover `/`, `/projects/`, `/notes/`, and `/instrument/` when affected.
3. Identify the highest-impact issue that can be fixed without new facts, dependencies, forms, analytics, backend, or architecture migration.
4. Make one reviewable change. Prefer existing tokens/classes in `styles.css`.
5. Validate with at least:
   - `python tools/check_site.py`
   - `git diff --check`
6. Re-render affected desktop and mobile views before claiming improvement.
7. Update `WEBIMPROVE_PROGRESS.md` with the checkpoint, validation, and remaining risk.

If acting as a read-only reviewer or subagent, do not edit files or update the progress log. Report issues, evidence, validation seen or missing, and the smallest recommended fix.

## What To Check

| Surface | Check |
|---|---|
| Hero | Cold visitor understands fluorescence + methods + instruments + open tools within one viewport. |
| Projects | Cards expose entry, audience, proof path, and boundary without becoming a dense wall. |
| Notes | Published notes outrank drafts visually; draft surfaces do not look equally proven. |
| Instrument | Stays a bounded concept/teaching route, not a product or calibrated simulator. |
| Navigation | Stable, compact, no wrapping at common desktop widths, keyboard friendly on mobile. |
| Visuals | Calm scientific notebook + precise instrument panel; avoid purple haze overuse, generic AI template feel, and decorative clutter. |
| Public claims | No invented titles, institutions, users, metrics, publications, contact methods, or validation claims. |

## Common Mistakes

- Editing CSS before looking at the rendered page.
- Treating `/instrument/` as a global primary nav item when current docs keep it route-only under Research.
- Adding separate public claims to make cards feel complete.
- Trusting old `tmp/` screenshots, stale `/review/` notes, or a fixed port instead of current server output.
- Reporting "published" or "passed" without fresh command output.
