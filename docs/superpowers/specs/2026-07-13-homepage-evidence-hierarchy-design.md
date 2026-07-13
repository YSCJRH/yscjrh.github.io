# Homepage Evidence Hierarchy Design

- Date: 2026-07-13
- Status: Approved for implementation by the user's `continue` instruction after the M0/M1 closeout named M2 as the next milestone
- Scope: homepage Research, Projects/Build, Notes, and About evidence semantics; static QA and browser QA coverage

## Goal

Make the homepage read as one evidence-backed research-builder identity: real research artifacts receive real links, missing research proof remains visibly bounded, inspectable projects appear before an abstract workflow explanation, and changed public explanations remain paired English / Chinese.

## Evidence Baseline

- `Fluorescence Analysis` has one related published framing note: `When A Fluorescence Signal Becomes Usable`. It is a reflection, not a result claim.
- `Fluorescence Analysis × Intelligent Algorithms` has no current fluorescence-specific public example. `CONTENT_GAPS.md` still requires owner-provided problem, algorithm role, and safe wording.
- `Fluorescence Instrumentation` has the bounded `/instrument/` concept route. It is not calibrated measurement, a validated simulator, or real instrument control.
- The three homepage projects already expose inspectable public paths in this order: AnswerLens, skylattice, and codex-via-phone.
- The current homepage places its four-step workflow before those projects and leaves several Build/About explanations English-only.

## Approaches Considered

### A. Semantic evidence reorder — selected

Use the existing Research cards and project cards. Give only sourced research artifacts anchor semantics, make the algorithm card an honest static direction statement, move the project grid before the workflow map, and complete the affected bilingual copy. This fixes the evidence hierarchy without adding a route, new personal facts, or a visual redesign.

### B. Add a new research-proof component — rejected for this milestone

A dedicated proof strip could make Research more prominent, but the algorithm direction lacks a real public artifact. A new component would add density and tempt the site to visually equalize unequal evidence.

### C. Create `/research/` — deferred

A separate Research page becomes useful only after more public examples exist. Creating it now would either repeat homepage summaries or require unsupported details.

## Research Card Contract

The three cards keep their current order and declare one machine-readable role:

| Direction | Role | Public treatment |
|---|---|---|
| Fluorescence Analysis | `published-reflection` | Link to the published framing note with `Published reflection / 已公开反思`; do not call it a result or validation artifact. |
| Fluorescence Analysis × Intelligent Algorithms | `direction-statement` | Remove interactive/spotlight treatment and show `Direction statement / 方向说明` plus `Public example pending / 公开示例待补充`. |
| Fluorescence Instrumentation | `concept-route` | Retain the `/instrument/` link and label it `Concept route / 概念页面` with `Explore bounded concept model / 查看受约束概念模型`. |

Only `<a>` elements may use `.research-card-link`. The algorithm card uses `.research-card-state`, which has readable text styling but no arrow, hover lift, focus behavior, or pointer semantics.

## Projects / Build Order

Keep the site-level order Hero → Research → Projects → Notes → About. Inside Projects, use:

1. module heading and `All Projects` entry;
2. `.build-grid` with AnswerLens → skylattice → codex-via-phone;
3. `.workflow-map` as a secondary explanation of working method;
4. supporting project routes.

The workflow does not claim that every featured repository implements or validates every step. It explains a general working pattern after visitors have seen inspectable evidence.

## Bilingual Copy Contract

- Add Chinese paragraphs to all four workflow explanations and all three `What to inspect` explanations; substantial Chinese paragraphs use `lang="zh-CN"`.
- Reuse the reviewed bilingual project-flow labels already present on `/projects/`.
- Pair the About fact labels, focus value, route labels, and route explanations.
- Pair the two published note titles in the homepage Notes summaries using their existing public Chinese titles.
- Do not add a Chinese counterpart to proper nouns, repository names, `CLI`, or `GitHub` when the surrounding label is already paired.

## Static And Browser Guardrails

`tools/check_site.py` will reject a homepage when:

- a `.research-card-link` is not an `<a>`;
- the set of Research evidence links differs from the published reflection and bounded Instrument Lab routes;
- either evidence link appears under the wrong Research role;
- the three `data-research-role` values differ from the declared contract;
- the direction-statement card retains `.surface-interactive`, `data-spotlight`, or any interactive descendant;
- `.workflow-map` appears before `.build-grid`;
- scoped Chinese blocks are missing, empty, outside their expected container, or lack `lang="zh-CN"`.

`tools/tests/test_homepage_contract.py` keeps focused negative cases for the direction-card link, a native focusable descendant, an ARIA widget role, a wrong-role evidence link, and empty scoped Chinese copy. The direction card uses a strict static-descendant allowlist so newly introduced unknown elements fail closed.

`tools/check-public-browser.js` will include `.research-card-link` in its mobile touch-target sample. Rendered QA will verify the new links, noninteractive algorithm state, DOM order, keyboard/mobile menu behavior, no-JS visibility, and no horizontal overflow.

## Files And Boundaries

Expected implementation files:

- `index.html`
- `styles.css`
- `tools/check_site.py`
- `tools/tests/test_homepage_contract.py`
- `tools/check-public-browser.js`
- `CONTENT_MODEL.md`
- `PLANS.md`
- `WEBIMPROVE_PROGRESS.md`
- `ACCESSIBILITY_CHECKLIST.md`
- `docs/decisions/2026-07-13-homepage-evidence-hierarchy.md`

Explicit exclusions:

- no new route or framework;
- no global navigation change;
- no project-priority change;
- no Instrument Lab behavior change;
- no invented research example, result, publication, institution, collaborator, metric, or contact detail;
- no analytics, form, backend, external runtime dependency, deployment, push, or GitHub Pages change.

## Success Criteria

- Cold visitors can distinguish a published reflection, an unproven direction statement, and a bounded concept route.
- All link-like Research affordances are real anchors; the algorithm gap is honest and noninteractive.
- Inspectable project evidence precedes the generalized workflow.
- Changed public explanations are paired English / Chinese.
- Static negative fixtures prove the new hierarchy checks fail before implementation and pass afterward.
- Existing static, syntax, 114-test Instrument Lab, data-package, desktop/mobile render, and diff gates remain green.
