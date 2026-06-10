# Instrument Lab Refine Phase 0-1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the evidence, documentation, and first IA slice needed to safely begin the `refine.md` reconstruction of `/instrument/`.

**Architecture:** Preserve the static route and existing module layout while adding documentation and tests before behavior changes. Phase 1 should reorganize the visible page into an interaction-first workbench without weakening model boundaries or source-data separation.

**Tech Stack:** Static HTML/CSS, vanilla ES modules, local vendored Three.js on `/instrument/`, Node built-in test runner, `tools/serve.py`, `tools/check_site.py`.

---

### Task 1: Phase 0 Evidence Baseline

**Files:**
- Create: `docs/instrument-research-log.md`
- Create: `instrument/MODEL.md`
- Create: `docs/decisions/2026-06-11-instrument-lab-refine-scope.md`
- Modify: `PLANS.md`

- [ ] **Step 1: Run baseline validation**

Run:

```powershell
node --check instrument/instrument.js
node --test instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs
node tools/preprocess-instrument-data.js --validate
python tools/check_site.py
git diff --check
```

Expected:

```text
All commands exit 0. The original Node test command reports 17 passing tests at the starting baseline; after the response-chain scaffold lands, the combined model test command reports 20 passing tests.
```

- [ ] **Step 2: Create the research log**

Write `docs/instrument-research-log.md` with entries for scan modes, corrected excitation/EEM assumptions, detector responsivity, slit-width tradeoffs, inner-filter risk, right-angle/front-face geometry, and scatter warnings.

- [ ] **Step 3: Create model notes**

Write `instrument/MODEL.md` with the current chain, target chain, public boundary, and baseline validation commands.

- [ ] **Step 4: Record the reconstruction decision**

Write `docs/decisions/2026-06-11-instrument-lab-refine-scope.md` documenting the static, evidence-first staged refactor.

- [ ] **Step 5: Update current plan**

Add a new top section to `PLANS.md` naming the active phase and its immediate validation gates.

- [ ] **Step 6: Re-run documentation-safe validation**

Run:

```powershell
python tools/check_site.py
git diff --check
```

Expected:

```text
Site check passed.
git diff --check exits 0.
```

### Task 2: Model Invariant Test Scaffold

**Files:**
- Create: `instrument/sim/tests/model-invariants.test.mjs`
- Modify: model modules only after failing tests are observed.

- [ ] **Step 1: Add failing invariant tests for target behavior**

Test finite/non-negative outputs, scan-mode axis semantics, source-data separation, and deterministic noise expectations.

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --test instrument/sim/tests/model-invariants.test.mjs
```

Expected: fails because target response-chain helpers do not exist yet.

- [ ] **Step 3: Implement minimal pure helpers**

Add the smallest pure modules needed for the first invariant group. Prefer new modules under `instrument/sim/physics/` and keep DOM code untouched.

- [ ] **Step 4: Verify GREEN**

Run:

```powershell
node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs
```

Expected: all tests pass.

2026-06-11 status: RED was observed as `ERR_MODULE_NOT_FOUND` for the missing response-chain modules. GREEN was then verified with 20 passing tests across `model-invariants.test.mjs`, `physics.test.mjs`, and `source-data.test.mjs`.

### Task 3: Phase 1 IA Workbench Slice

**Files:**
- Modify: `instrument/index.html`
- Modify: route-specific sections of `styles.css`
- Modify: `instrument/instrument.js` only if needed for tabs/language state.

- [ ] **Step 1: Write a DOM/state test or browser assertion for the workbench boundary**

Add a lightweight verification script or documented browser assertion that proves the first viewport keeps the simulator controls, diagnostics, and spectrum above long explanation panels.

- [ ] **Step 2: Verify RED**

Run the assertion against the current page and record why it fails or what visual debt remains.

- [ ] **Step 3: Move long explanations into panels**

Keep the hero short, keep the workbench primary, and move long model/source/correction/boundary copy into structured sections.

- [ ] **Step 4: Preserve no-JS fallback**

Confirm the static 2D optical path and noscript copy still make sense without the 3D scene.

- [ ] **Step 5: Verify page behavior**

Run:

```powershell
node --check instrument/instrument.js
python tools/check_site.py
git diff --check
```

Then use local browser QA on `/instrument/` for desktop, narrow layout, keyboard focus, console errors, and source-derived separation.
