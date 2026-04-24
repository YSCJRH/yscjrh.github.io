# Handoff Brief

Date: 2026-04-21

This brief turns the repo state at the intake stage into a practical handoff artifact for the next maintainer. It predates the later formal redesign and should be read as intake context rather than the final site specification.

## 2026-04-24 Current Baseline

This section supersedes older status bullets below when they describe the public surface count or next phase.

- The repository is still a static GitHub Pages personal site with no build step.
- Current public surfaces are `/`, `/projects/`, `/notes/`, `notes/build-logs-homepage-second-pass.html`, `notes/when-a-fluorescence-signal-becomes-usable.html`, and `/review/`.
- `/review/` is live but marked `noindex, nofollow`; treat it as an internal review surface until the owner decides whether to keep or remove it.
- The project gateway upgrade has landed on the homepage and `/projects/`.
- A visual depth pass has landed; the homepage, projects hub, and notes hub now use local CSS/HTML visual modules instead of relying on fragile decorative image embeds.
- The next phase is governance sync, browser QA, GitHub surface alignment, and evidence collection for stronger public claims.
- The site currently has two public notes; the Method Notes item remains a draft source under `content/notes/`.

## 1. Project Baseline

- The repository is a static GitHub Pages personal site for YSCJRH / HJR.
- The working branch is `main`, tracking `origin/main`.
- The latest local commit at intake time is `231bd2e` with message `content: publish first public notes surface`.
- The live public surfaces verified during intake are:
  - `https://yscjrh.github.io/`
  - `https://yscjrh.github.io/notes/`
  - `https://yscjrh.github.io/notes/build-logs-homepage-second-pass.html`
- The homepage is still the core surface, but the site has already expanded beyond a strict single-file homepage into a small notes layer.
- The shared frontend stack is:
  - `index.html`
  - `notes/index.html`
  - `notes/build-logs-homepage-second-pass.html`
  - `styles.css`
  - `script.js`
- There is no build step, package manifest, CI workflow, or in-repo deployment automation.

## 2. Public Surface Definition

Treat these as the main public surfaces that must stay aligned:

1. Homepage `/`
2. Projects page `/projects/`
3. Notes hub `/notes/`
4. Build log note `/notes/build-logs-homepage-second-pass.html`
5. Research reflection note `/notes/when-a-fluorescence-signal-becomes-usable.html`
6. Review surface `/review/` as a noindex internal review artifact
7. GitHub profile plus the five featured repository descriptions

Featured repositories currently surfaced on the homepage:

1. `ai-visibility-auditor`
2. `codex-via-phone`
3. `skylattice`
4. `mirror-sim`
5. `create-double-skill`

## 3. Content And Truthfulness Audit

### Confirmed

- The core repo rules are aligned between `personalweb.md` and `AGENTS.md`: calm researcher-builder identity, homepage-first structure, and strict no-invention boundaries.
- `PLANS.md` now frames the next phase as governance sync, public surface verification, browser QA, and evidence intake.
- `CONTENT_GAPS.md` is the right source of truth for missing inputs. It already prioritizes:
  - collecting one safe public example for each research direction
  - collecting creator-side story inputs for the five featured repositories
  - validating project CTA durability and public proof paths
  - deciding the next Method Notes or project-specific notes step
  - aligning homepage wording with GitHub surfaces
- Notes drafts under `content/notes/` are intentionally working-stage and follow the repo's truthfulness boundaries. Two notes are now public HTML pages.

### Safe To Advance Without New Facts

- Maintaining the current site structure and design direction
- Improving maintainer documentation and decision scaffolding
- Running GitHub wording consistency checks against public repository descriptions
- Running manual QA on navigation, mixed-bilingual copy, project CTAs, and notes discoverability

### Blocked On Owner-Provided Facts

These should not be strengthened by guesswork:

- one safe public-facing example for `Fluorescence Analysis`
- one safe public-facing example for `Fluorescence Analysis x Intelligent Algorithms`
- one safe public-facing example for `Fluorescence Instrumentation`
- creator-side context for why each featured repository exists, what workflow it improves, and why it belongs on the homepage
- the intended next public notes step beyond the two current public notes

## 4. GitHub Alignment Snapshot

Public GitHub API checks on 2026-04-21 returned:

- user login: `YSCJRH`
- profile name: `HJR`
- profile bio: empty
- profile blog/homepage field: empty

Repository description comparison:

- `ai-visibility-auditor`
  - GitHub description matches the homepage lead closely.
- `codex-via-phone`
  - GitHub description matches the homepage lead closely.
- `skylattice`
  - GitHub description matches the homepage lead closely.
- `mirror-sim`
  - GitHub description currently emphasizes "inspired by Liu Cixin's The Mirror" while the homepage frames it as a constrained, evidence-backed scenario engine.
  - This is a wording divergence to review before making the homepage story stronger.
- `create-double-skill`
  - GitHub description is broader than the homepage lead.
  - This is acceptable for now, but it should be treated as a coordination item rather than assumed alignment.

Still not fully verified:

- GitHub pinned repository order
- whether the GitHub profile should expose the homepage URL
- whether the current profile wording should stay intentionally sparse or become more explicit

Use `docs/github-coordination-checklist.md` for the next coordination pass.

## 5. Frontend Structure And Maintenance Audit

### Confirmed Structure

- The frontend is a shared static stack, not a framework app.
- `notes` pages reuse `../styles.css` and `../script.js`.
- The homepage remains a section-anchored page with `#research`, `#build`, `#notes`, and `#about`.
- Mixed-bilingual copy is embedded directly in the public markup. There is no current language switcher.

### Maintainability Risks

1. Repeated public shell
   - Header, navigation, mobile menu, and footer are duplicated across the HTML files.
   - New pages will increase drift risk unless they are copied from one clear baseline.
2. Mixed-bilingual scaling
   - English and Chinese copy are hand-maintained in the same static markup.
   - Future multilingual growth could create drift unless a content model or generator becomes justified.
3. Notes duplication
   - The homepage notes teaser and the notes hub both describe the same public notes surface with separate markup.
   - Future note updates can drift unless one surface is treated as the source of truth.
4. Manual anchor and interaction QA
   - The header is sticky and navigation relies on hash anchors.
   - Anchor offset, current-nav state, keyboard flow, reduced-motion behavior, and mobile menu behavior still need an explicit manual QA pass.

### Important Boundary

The current conclusion is not "migrate to a framework now."

The correct next question is whether hand-written static HTML still scales after the next round of note growth and cross-page maintenance.

## 6. Delivery And Handoff Process Audit

### Confirmed

- `.nojekyll` is present.
- The repo is named `yscjrh.github.io`, which fits the GitHub Pages user-site convention.
- The live site is reachable.
- The notes hub is live.
- Both note pages are live.
- The projects page is live.
- The review page is live but noindexed.

### Clarified During This Intake

- A maintainer-facing `README.md` did not exist before this pass.
- `docs/decisions/` did not exist before this pass.
- The homepage links directly to the first published note and also includes a secondary `notes/` path; the remaining question is how prominent the notes hub should be.

### Still Needs Manual Confirmation

- The exact GitHub Pages source setting in repository settings
- Whether `/review/` should remain a live noindex surface or be removed from the deployed tree
- Whether the Method Notes draft should become the next public note
- Pinned repo order on the public GitHub profile

## 7. Risks And Gaps

Highest-risk gaps for the next maintainer:

1. Content evidence gap
   - The site structure is already credible enough to ship.
   - The limiting factor is fact-backed content, not layout.
2. Cross-surface drift
   - Homepage copy, notes copy, GitHub repository descriptions, and future profile wording can diverge unless checked in one pass.
3. Review surface ambiguity
   - `/review/` is live and noindexed, but its long-term public/deployed status still needs an owner decision.
4. Static maintenance overhead
   - Shared shell and repeated note summaries are still hand-maintained.
5. Decision log still sparse
   - Use `docs/decisions/` for public-surface and tooling decisions that should not live only in chat or commits.

## 8. Recommended Next Actions

Priority order for the next implementation pass:

1. Run one manual/frontend QA pass focused on:
   - sticky-header anchor behavior
   - mobile navigation behavior
   - keyboard and reduced-motion behavior
   - project CTA durability
2. Run one GitHub coordination pass:
   - compare pinned repos, repo descriptions, profile wording, homepage URL, and homepage emphasis together
3. Use `CONTENT_GAPS.md` to collect a minimum fact pack:
   - one safe public example for each research direction
   - one stronger origin/workflow/story input for each featured repository
4. Decide the next note step:
   - publish Method Notes
   - publish a project-specific build log
   - or hold notes steady until stronger evidence inputs exist
5. After the next notes/content wave, re-evaluate whether static hand-maintenance is still acceptable before considering any generator migration.

## 9. Validation Log

Commands run during this intake:

```powershell
git status --short --branch
git branch -vv
git log --oneline -5
Invoke-WebRequest https://yscjrh.github.io/
Invoke-WebRequest https://yscjrh.github.io/notes/
Invoke-WebRequest https://yscjrh.github.io/notes/build-logs-homepage-second-pass.html
Invoke-RestMethod https://api.github.com/users/YSCJRH
Invoke-RestMethod https://api.github.com/repos/YSCJRH/<repo>
```

Additional checks performed:

- reviewed `personalweb.md`, `AGENTS.md`, `PLANS.md`, `CONTENT_GAPS.md`
- reviewed the published and draft notes material under `content/notes/`
- verified the shared frontend structure across `index.html`, `notes/index.html`, and `notes/build-logs-homepage-second-pass.html`
- checked the public homepage, notes hub, and first note over the web

Supporting operational docs created during this intake:

- `README.md`
- `docs/manual-qa-checklist.md`
- `docs/github-coordination-checklist.md`
- `docs/public-surface-verification-2026-04-22.md`
- `docs/decisions/README.md`
- `review/index.html` as an internal review artifact rather than a formal public surface

## 10. Assumptions

- This handoff brief is intentionally conservative and does not expand public claims.
- The current design direction remains acceptable unless a concrete readability or maintenance blocker appears.
- A framework migration is out of scope until note growth or repeated shared-shell edits make static maintenance clearly painful.
- The next maintainer should treat missing facts as real blockers, not as invitations to invent stronger copy.
