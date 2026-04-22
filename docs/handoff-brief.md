# Handoff Brief

Date: 2026-04-21

This brief turns the current repo state into a practical handoff artifact for the next maintainer. It reflects a read-first intake pass and does not change the public site.

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
2. Notes hub `/notes/`
3. First published note `/notes/build-logs-homepage-second-pass.html`
4. Review surface `/review/`
5. GitHub profile plus the five featured repository descriptions

Featured repositories currently surfaced on the homepage:

1. `ai-visibility-auditor`
2. `codex-via-phone`
3. `skylattice`
4. `mirror-sim`
5. `create-double-skill`

## 3. Content And Truthfulness Audit

### Confirmed

- The core repo rules are aligned between `personalweb.md` and `AGENTS.md`: calm researcher-builder identity, homepage-first structure, and strict no-invention boundaries.
- `PLANS.md` already frames the next phase as content evidence reinforcement, not redesign or migration.
- `CONTENT_GAPS.md` is the right source of truth for missing inputs. It already prioritizes:
  - strengthening `ai-visibility-auditor`
  - collecting one safe public example for each research direction
  - deciding the next notes publishing step
  - aligning homepage wording with GitHub surfaces
- Notes drafts under `content/notes/` are intentionally working-stage and follow the repo's truthfulness boundaries.

### Safe To Advance Without New Facts

- Maintaining the current site structure and design direction
- Improving maintainer documentation and decision scaffolding
- Running GitHub wording consistency checks against public repository descriptions
- Running manual QA on navigation, language switching, and notes discoverability

### Blocked On Owner-Provided Facts

These should not be strengthened by guesswork:

- one safe public-facing example for `Fluorescence Analysis`
- one safe public-facing example for `Fluorescence Analysis x Intelligent Algorithms`
- one safe public-facing example for `Fluorescence Instrumentation`
- creator-side context for why each featured repository exists, what workflow it improves, and why it belongs on the homepage
- the intended next public notes step beyond the current first note

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
- Bilingual behavior is implemented by rendering both language variants in the DOM and toggling visibility client-side.

### Maintainability Risks

1. Repeated public shell
   - Header, navigation, language switch, mobile menu, and footer are duplicated across the HTML files.
   - New pages will increase drift risk unless they are copied from one clear baseline.
2. Dual language-state coupling
   - `script.js` writes both `html[data-lang]` and `html[lang]`.
   - `styles.css` depends on both markers: one for text visibility, one for typography and layout.
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
- The first note page is live.

### Clarified During This Intake

- A maintainer-facing `README.md` did not exist before this pass.
- `docs/decisions/` did not exist before this pass.
- The homepage links directly to the first published note and also includes a secondary `notes/` path; the remaining question is how prominent the notes hub should be.

### Still Needs Manual Confirmation

- The exact GitHub Pages source setting in repository settings
- Intended public notes navigation model:
  - homepage -> first note only
  - homepage -> notes hub
  - or both
- Pinned repo order on the public GitHub profile

## 7. Risks And Gaps

Highest-risk gaps for the next maintainer:

1. Content evidence gap
   - The site structure is already credible enough to ship.
   - The limiting factor is fact-backed content, not layout.
2. Cross-surface drift
   - Homepage copy, notes copy, GitHub repository descriptions, and future profile wording can diverge unless checked in one pass.
3. Notes discoverability ambiguity
   - Notes are live, but the public entry path is not yet fully resolved.
4. Static maintenance overhead
   - Shared shell and repeated note summaries are still hand-maintained.
5. No decision log yet
   - This pass creates the directory, but no decision record exists yet.

## 8. Recommended Next Actions

Priority order for the next implementation pass:

1. Use `CONTENT_GAPS.md` to collect a minimum fact pack:
   - one safe public example for each research direction
   - one stronger origin/workflow/story input for each featured repository
2. Make one explicit notes discoverability decision:
   - homepage should feature only the first note
   - homepage should also expose the notes hub
   - or notes hub should stay intentionally secondary for one more iteration
3. Run one manual frontend QA pass focused on:
   - sticky-header anchor behavior
   - language switching persistence across pages
   - mobile navigation behavior
   - keyboard and reduced-motion behavior
4. Run one GitHub coordination pass:
   - compare pinned repos, repo descriptions, profile wording, and homepage emphasis together
5. After the next notes/content wave, re-evaluate whether static hand-maintenance is still acceptable before considering any generator migration

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
- `review/index.html`

## 10. Assumptions

- This handoff brief is intentionally conservative and does not expand public claims.
- The current design direction remains acceptable unless a concrete readability or maintenance blocker appears.
- A framework migration is out of scope until note growth or repeated shared-shell edits make static maintenance clearly painful.
- The next maintainer should treat missing facts as real blockers, not as invitations to invent stronger copy.
