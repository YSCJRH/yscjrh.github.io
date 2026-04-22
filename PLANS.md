# Next Phase: Project Gateway Upgrade

## Goal
- Turn the site’s Build area into a clearer project gateway rather than a repository list.
- Preserve the current redesign direction while improving real public entry points, CTA hierarchy, and project card usability.
- Keep the implementation static, bilingual, calm, and GitHub Pages friendly.

## Current Status
- The redesigned homepage, notes hub, projects page, and article pages are live.
- AnswerLens and Skylattice already have verified public Pages/docs.
- The remaining repo-first projects still need more honest, structured entry logic.
- Verified README deep links can now support setup, demo, and example CTAs for the repo-first projects without inventing standalone public pages.

## Phase 1: Gateway Link Audit
1. Verify current primary public entry for each featured project.
2. Confirm which projects have:
   - public Pages or docs
   - stable README-backed setup path
   - first-run proof or screenshots
3. Record unverifiable paths in `CONTENT_GAPS.md` instead of inventing them.

## Phase 2: Homepage Entry Upgrade
1. Add a compact hero shortcut strip for:
   - AnswerLens demo
   - Skylattice docs
   - all projects
2. Rename the section to `Projects / Build`.
3. Upgrade project cards so each one has:
   - short positioning
   - why-it-matters line
   - status tag
   - primary CTA
   - optional secondary CTA only when verified
   - GitHub repo link

## Phase 3: Projects Page Alignment
1. Make `/projects/` the fuller gateway page rather than a homepage duplicate.
2. Keep CTA hierarchy aligned with homepage cards.
3. Make repo-first projects feel intentional rather than underdeveloped.

## Phase 4: Validation
1. Verify homepage, `/projects/`, and all CTA targets locally.
2. Recheck desktop, tablet, and `360px` mobile readability.
3. Confirm:
   - no invented demo/docs paths were added
   - AnswerLens and Skylattice lead with public entries
   - repo-first projects are still honest and usable

## Deliverables
- improved project gateway on homepage
- aligned CTA model on `/projects/`
- updated `CONTENT_GAPS.md` for missing public project assets
- small, reviewable static-site diff

## Constraints
- No framework, package manager, or Pages setting changes.
- No invented metrics, users, customers, awards, or traction.
- No inclusion of `yscjrh.github.io` as a normal Build project.
- No unverified secondary CTA for repo-first projects.
