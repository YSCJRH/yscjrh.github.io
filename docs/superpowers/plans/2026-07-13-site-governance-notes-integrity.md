# Site Governance And Notes Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the repository's active plan, published-note sources, bilingual public bodies, and automated static checks agree without changing the site's architecture or adding unsupported public facts.

**Architecture:** Keep the existing static HTML/CSS/JavaScript site and make `content/notes/*.md` the editorial source for published status, publication date, and bilingual note text. Extend `tools/check_site.py` with a narrow source-to-public-page contract, then update the two published notes and governance records until the new contract and the full existing validation suite pass.

**Tech Stack:** Static HTML, CSS, Markdown, Python standard library, vanilla JavaScript.

## Global Constraints

- Keep the site static with no framework, package manager, build pipeline, analytics, forms, backend, database, authentication, external font, or third-party runtime script.
- Preserve the public identity boundary: no invented publications, institutions, titles, metrics, research results, contact methods, collaborators, employers, or project adoption claims.
- Preserve paired English / Chinese visitor-facing copy; substantial Chinese paragraphs use `lang="zh-CN"`.
- Do not publish, push, or change GitHub Pages settings in this implementation.
- Treat `tools/check_site.py` as the authoritative static gate and prove new guards with a red-green cycle.

---

### Task 1: Add Published-Note Source Contracts

**Files:**
- Modify: `tools/check_site.py`
- Test: `python tools/check_site.py`

**Interfaces:**
- Consumes: the `Status:` and `Published:` fields plus `### EN` and `### 中文` sections in each published Markdown source.
- Produces: `check_published_note(source_path, html_path)` errors for draft status, missing/invalid publication date, missing bilingual source sections, missing semantic `<time datetime="YYYY-MM-DD">`, or a public article body without substantial Chinese text and `lang="zh-CN"`.

- [x] **Step 1: Add the published-note mapping and parser/check functions**

```python
PUBLISHED_NOTES = {
    Path("content/notes/build-logs-homepage-second-pass.md"): Path(
        "notes/build-logs-homepage-second-pass.html"
    ),
    Path("content/notes/research-reflections-signals-and-judgment.md"): Path(
        "notes/when-a-fluorescence-signal-becomes-usable.html"
    ),
}

NOTE_FIELD_PATTERN = re.compile(r"^(Status|Published):\s*(.+?)\s*$", re.MULTILINE)
NOTE_PUBLISHED_DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
HAN_CHARACTER_PATTERN = re.compile(r"[\u3400-\u9fff]")
```

The checker must require exact `Status: published`, a valid ISO date, non-empty English and Chinese source sections, a matching `<time datetime>` in the public page, and at least 80 Han characters inside the public `.article-body` together with `lang="zh-CN"`.

- [x] **Step 2: Run the checker and verify the intended red result**

Run: `python tools/check_site.py`

Expected: FAIL because both source files still say `draft`, lack `Published:`, and both public article bodies lack substantial Chinese body copy.

- [x] **Step 3: Confirm the failure is specific**

Expected errors include the affected Markdown/HTML paths and the missing `Status: published`, `Published: YYYY-MM-DD`, and bilingual public-body contracts. Fix checker syntax only if the command errors rather than reporting those content failures.

### Task 2: Align Published Note Sources And Public Pages

**Files:**
- Modify: `content/notes/build-logs-homepage-second-pass.md`
- Modify: `content/notes/research-reflections-signals-and-judgment.md`
- Modify: `notes/build-logs-homepage-second-pass.html`
- Modify: `notes/when-a-fluorescence-signal-becomes-usable.html`
- Test: `python tools/check_site.py`

**Interfaces:**
- Consumes: Task 1's published-note contract.
- Produces: two public bilingual working notes whose source status/date and semantic public metadata agree.

- [x] **Step 1: Update source metadata**

Use these exact source fields:

```text
Status: published
Published: 2026-04-21
```

for the homepage build log, and:

```text
Status: published
Published: 2026-04-22
```

for the fluorescence research reflection.

- [x] **Step 2: Make each Markdown source contain the complete public English and Chinese article**

Keep the existing four-section public structure for each note. Preserve the current English claims, add natural Chinese counterparts from the existing source text, and do not add research results or project-performance claims.

- [x] **Step 3: Replace QA-date metadata with publication metadata**

Use semantic dates such as:

```html
<dd><time datetime="2026-04-21">2026-04-21</time></dd>
```

Replace the former `Updated` QA tile with:

```html
<dt>Format / 形式</dt>
<dd>Bilingual working note / 双语工作笔记</dd>
```

- [x] **Step 4: Add paired Chinese text to every public article section**

Use English paragraphs/lists first and Chinese paragraphs/lists immediately after them. Each substantial Chinese block must use `lang="zh-CN"`, for example:

```html
<p lang="zh-CN">一个荧光信号不会仅仅因为能够测量，就自动变得可用。</p>
```

- [x] **Step 5: Run the checker and verify green**

Run: `python tools/check_site.py`

Expected: PASS for 7 HTML pages, 1 CSS file, `robots.txt`, `sitemap.xml`, local references, and both published-note source contracts.

### Task 3: Reset Governance Baseline

**Files:**
- Modify: `PLANS.md`
- Modify: `WEBIMPROVE_PROGRESS.md`
- Modify: `docs/decisions/README.md`
- Modify: `docs/decisions/2026-06-05-homepage-project-positioning.md`
- Modify: `docs/decisions/2026-04-25-instrument-static-three.md`
- Test: `rg -n "Current Phase|Status: Satisfied|Implemented|TransformControls" PLANS.md WEBIMPROVE_PROGRESS.md docs/decisions`

**Interfaces:**
- Consumes: the completed Instrument Lab final audit and the approved M0+M1 optimization direction.
- Produces: one current phase named `Site Content Integrity And Research Evidence`, an archived Instrument Lab reconstruction phase, and decision records that describe the implementation currently in the repository.

- [x] **Step 1: Prepend the new current phase in `PLANS.md`**

The current goal is to align published-note sources, bilingual public copy, active planning records, and static regression checks before evidence-backed homepage restructuring. Preserve all Instrument Lab constraints and historical phases below it.

- [x] **Step 2: Record the completed checkpoint in `WEBIMPROVE_PROGRESS.md`**

Set the milestone to continuous site optimization, record the Notes source contract and bilingual repair, list fresh validation commands/results, and explicitly state that no deployment or new public personal/scientific claim was made.

- [x] **Step 3: Correct stale decision-record state**

State that the decision directory contains active records; mark the homepage project-positioning decision as implemented; mark the old TransformControls note as historical and superseded by the current loaded restricted-manipulation implementation.

- [x] **Step 4: Review the documentation diff**

Run: `git diff -- PLANS.md WEBIMPROVE_PROGRESS.md docs/decisions`

Expected: only current-state truth corrections and the new checkpoint; no new strategy beyond the approved M0+M1 scope.

### Task 4: Full Verification And Visual Review

**Files:**
- Verify: all files changed by Tasks 1-3

**Interfaces:**
- Consumes: the completed content, checker, and governance changes.
- Produces: fresh local evidence suitable for a no-publish handoff.

- [x] **Step 1: Run focused static and syntax validation**

```powershell
python tools/check_site.py
python -m py_compile tools/check_site.py tools/serve.py
node --check script.js
node --check instrument/instrument.js
git diff --check
```

- [x] **Step 2: Run the full Instrument regression gates**

```powershell
node --test instrument/sim/tests/*.mjs
node tools/preprocess-instrument-data.js --validate
```

- [x] **Step 3: Run browser QA where the local Playwright CLI is available**

```powershell
node tools/check-public-browser.js
node tools/check-instrument-browser.js
```

If the on-demand CLI startup blocks again, record it as missing automated-browser evidence and use the local browser for `/notes/` plus both note articles at 1440x900 and 390x844. Do not report the automated gates as passed without completed output.

- [x] **Step 4: Review status and complete a read-only final review**

Run `git status --short`, `git diff --stat`, and `git diff`. Confirm no secrets, contacts, institutions, unsupported claims, analytics, forms, dependencies, framework migration, publish action, or unrelated files were added.
