# Current Phase: Governance Sync And Evidence QA

## Goal
- Keep the repository documentation aligned with the current public site surface.
- Validate the homepage, project gateway, notes pages, and public CTAs without changing site claims.
- Preserve the static GitHub Pages architecture until there is clear evidence that manual HTML maintenance is too costly.

## Current Status
- The project gateway upgrade has landed on the homepage and `/projects/`.
- The visual depth pass has landed and is live; the next visual work should be targeted QA or small refinements, not another broad redesign.
- The live/public site surface now includes `/`, `/projects/`, `/notes/`, two note pages, and `/review/`.
- `/review/` is treated as a live but unindexed internal review surface until the owner decides otherwise.
- The main remaining content gap is evidence, not layout: safe research examples, project origin/workflow context, screenshots, and first-run proof.

## Phase 1: Documentation Baseline Sync
1. Update maintainer-facing docs to reflect the current surface:
   - homepage
   - projects hub
   - notes hub
   - two published notes
   - noindex review surface
2. Mark older intake notes as historical when they predate the current release surface.
3. Re-baseline `CONTENT_GAPS.md` so it tracks remaining evidence gaps instead of already-shipped structure.

## Phase 2: Public Surface Verification
1. Verify local static resolution for shared CSS, JS, SVG assets, and internal page links.
2. Verify live reachability for:
   - `https://yscjrh.github.io/`
   - `https://yscjrh.github.io/projects/`
   - `https://yscjrh.github.io/notes/`
   - both published note pages
   - `https://yscjrh.github.io/review/`
3. Verify primary project CTAs and record brittle README fragment links as maintenance risks.

## Phase 3: Browser QA
1. Preview locally with `python tools/serve.py`.
2. Check desktop and narrow mobile layouts for:
   - sticky header anchor behavior
   - mobile navigation
   - project card readability
   - note page readability
   - visible focus states
3. Record results in a dated verification note rather than changing page copy during QA.

## Phase 4: Evidence Intake
1. Collect owner-provided, safe public examples for the three research directions.
2. Collect origin/workflow/representative-role inputs for the five featured repositories.
3. Only after those inputs exist, consider homepage or project-card copy updates.

## Deliverables
- updated maintainer docs
- dated public surface verification note
- explicit provisional decision for `/review/`
- clear remaining evidence gaps

## Constraints
- No framework, package manager, or Pages setting changes.
- No invented metrics, users, customers, awards, affiliations, research results, or contact methods.
- No public copy strengthening without a trustworthy source.
- No removal of `/review/` without an explicit owner decision.
