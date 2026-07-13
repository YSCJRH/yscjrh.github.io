# Homepage Evidence Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder homepage evidence so sourced research artifacts and inspectable projects are clearly distinguished from unproven directions and generalized workflow explanation.

**Architecture:** Preserve the static one-page structure and existing cards. Add a narrow homepage contract to the Python static checker, use machine-readable Research roles, move the existing project grid before the workflow map, and complete affected bilingual copy without adding a route or new public fact.

**Tech Stack:** Static HTML, shared CSS, vanilla JavaScript browser QA, Python standard-library static checker, Playwright/Chromium for rendered verification.

## Global Constraints

- Preserve Hero → Research → Projects → Notes → About.
- Use only current repository evidence; do not invent research examples, results, publications, people, institutions, metrics, or contact details.
- `Fluorescence Analysis` may link only to the published framing note; do not frame it as a result.
- `Fluorescence Analysis × Intelligent Algorithms` remains a noninteractive direction statement until owner-provided public evidence exists.
- `Fluorescence Instrumentation` remains a bounded `/instrument/` concept route, not a calibrated simulator or real instrument control surface.
- Keep English / Chinese public copy paired; substantial Chinese paragraphs use `lang="zh-CN"`.
- Do not add a framework, package manager, build pipeline, new route, analytics, form, backend, external runtime dependency, or global navigation item.
- Do not commit, push, publish, or change GitHub Pages in this implementation.

---

### Task 1: Add Homepage Evidence Hierarchy Guards

**Files:**
- Modify: `tools/check_site.py`
- Add: `tools/tests/test_homepage_contract.py`
- Test: `python tools/check_site.py`
- Test: `python -m unittest discover -s tools/tests -p "test_*.py" -v`

**Interfaces:**
- Consumes: parsed `index.html` tags from `SiteParser.tags`.
- Produces: `check_homepage_evidence_hierarchy(parser) -> list[str]` errors for invalid Research role/link semantics, wrong project/workflow order, or missing scoped bilingual copy.

- [x] **Step 1: Add exact homepage constants and class helpers**

Add:

```python
HOME_RESEARCH_ROLES = ["published-reflection", "direction-statement", "concept-route"]
HOME_RESEARCH_EVIDENCE_HREFS = [
    "notes/when-a-fluorescence-signal-becomes-usable.html",
    "instrument/",
]
HOME_BILINGUAL_CLASS_COUNTS = {
    "workflow-copy-zh": 4,
    "project-why-copy-zh": 3,
    "about-route-copy-zh": 2,
}


def tag_classes(attrs: dict[str, str]) -> set[str]:
    return set(attrs.get("class", "").split())
```

- [x] **Step 2: Add the homepage contract function**

Implement `check_homepage_evidence_hierarchy(parser: SiteParser) -> list[str]` so it:

1. collects every tag containing `.research-card-link` and requires every tag to be `a`;
2. requires the ordered Research evidence hrefs to equal `HOME_RESEARCH_EVIDENCE_HREFS`;
3. collects `article[data-research-role]` in DOM order and requires `HOME_RESEARCH_ROLES`;
4. requires the `direction-statement` article to omit `.surface-interactive` and the `data-spotlight` attribute;
5. requires the first `.build-grid` tag to occur before the first `.workflow-map` tag;
6. requires each class in `HOME_BILINGUAL_CLASS_COUNTS` to occur exactly the declared number of times and every matching tag to use `lang="zh-CN"`.

Use path-specific messages such as:

```python
errors.append("index.html: every research-card-link must be an anchor")
errors.append("index.html: build-grid must precede workflow-map")
errors.append(
    f"index.html: expected {expected_count} lang=zh-CN elements with class {class_name}"
)
```

- [x] **Step 3: Call the contract from `check_html` only for the homepage**

After generic HTML validation:

```python
if path == Path("index.html"):
    errors.extend(check_homepage_evidence_hierarchy(parser))
```

- [x] **Step 4: Run the checker and verify the intended red result**

Run: `python tools/check_site.py`

Expected: FAIL on current `index.html` because Research roles are absent, two `.research-card-link` elements are spans, project/workflow order is reversed, and the scoped Chinese copy classes do not exist.

- [x] **Step 5: Bind evidence and language checks to their semantic containers**

After final review, add focused negative tests and hierarchy capture so the checker also rejects:

1. any interactive descendant inside the `direction-statement` card, even without `.research-card-link`;
2. a valid evidence href moved under the wrong Research role;
3. scoped Chinese elements that keep the expected class and `lang` but contain no Chinese text or sit outside their expected container.

Run the focused tests before and after implementation to preserve the three-failure red, the two-case interactive-coverage red, and six-test green evidence.

### Task 2: Correct Research Card Semantics And Mobile Coverage

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tools/check-public-browser.js`
- Test: `python tools/check_site.py`
- Test: `node --check tools/check-public-browser.js`

**Interfaces:**
- Consumes: the Task 1 role/link contract.
- Produces: two real Research evidence anchors and one explicitly noninteractive direction state.

- [x] **Step 1: Declare Research roles and correct the first card**

Add `data-research-role="published-reflection"` to the Fluorescence Analysis article. Replace its footer with:

```html
<div class="research-card-footer">
  <div class="research-card-action">
    <span class="research-card-kicker">Published reflection / 已公开反思</span>
    <a class="research-card-link" href="notes/when-a-fluorescence-signal-becomes-usable.html">
      Read published reflection / 阅读已公开反思
    </a>
  </div>
  <span class="card-hint" aria-hidden="true">01</span>
</div>
```

- [x] **Step 2: Make the algorithm card an honest static state**

Change its opening article to omit `surface-interactive` and `data-spotlight`, retain `data-reveal`, and add `data-research-role="direction-statement"`. Replace the footer action with:

```html
<div class="research-card-action">
  <span class="research-card-kicker">Direction statement / 方向说明</span>
  <span class="research-card-state">Public example pending / 公开示例待补充</span>
</div>
```

- [x] **Step 3: Tighten the Instrument Lab role label**

Add `data-research-role="concept-route"`; use:

```html
<span class="research-card-kicker">Concept route / 概念页面</span>
<a class="research-card-link" href="instrument/">
  Explore bounded concept model / 查看受约束概念模型
</a>
```

- [x] **Step 4: Add noninteractive state styling**

In the existing Research footer rules, add:

```css
.research-card-state {
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  color: var(--color-text-soft);
  font-size: 0.76rem;
  font-weight: 600;
  opacity: 0.72;
}
```

Do not give this class an arrow, hover state, transform, pointer cursor, or focus style.

- [x] **Step 5: Add Research links to mobile touch-target QA**

Add `'.research-card-link'` to the `interactiveSelector` array in `tools/check-public-browser.js`.

- [x] **Step 6: Run focused checks**

Run:

```powershell
python tools/check_site.py
node --check tools/check-public-browser.js
```

Expected: the Research link/role errors disappear; the checker still fails on the not-yet-fixed Build order and bilingual class counts.

### Task 3: Put Project Evidence Before Method And Complete Homepage Pairing

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Test: `python tools/check_site.py`

**Interfaces:**
- Consumes: current `.build-grid`, `.workflow-map`, `.project-why`, `.project-flow`, `.fact-list`, `.about-routes`, and Notes card components.
- Produces: DOM order `build-grid → workflow-map → supporting-projects` plus scoped bilingual copy classes required by Task 1.

- [x] **Step 1: Move the whole workflow map after the whole project grid**

Preserve the internal project order and workflow-step order. Insert the workflow map immediately after `.build-grid` and before `.supporting-projects`.

Add spacing without a new component:

```css
.build-grid + .workflow-map {
  margin-top: 1.1rem;
}
```

- [x] **Step 2: Pair all four workflow explanations**

After each existing English paragraph add a `<p class="workflow-copy-zh" lang="zh-CN">` with, in order:

```text
从需要更清楚处理的信号、界面、仓库任务或访问问题开始。
把问题整理成边界明确的方法，并公开关键假设与取舍。
优先做成可从公开入口试用、阅读或复查的小型可检视系统。
用文档、演示、仓库链接与笔记留下可再次进入的路径。
```

- [x] **Step 3: Pair project inspection explanations and flow labels**

Add exactly three `<p class="project-why-copy project-why-copy-zh" lang="zh-CN">` paragraphs:

```text
它让读者在进入仓库细节之前，先检查公开站点表面。
它先提供文档路径，让读者理解复杂的本地运行时，再检查仓库内部。
它展示远程访问如何保持实用，同时不把安全与信任边界当作事后补充。
```

Replace the project-flow items with the reviewed bilingual strings from `/projects/`:

```text
Site surface / 站点表面
CLI audit / CLI 审查
Reviewable report / 可复查报告
Docs first / 先读文档
Quick start / 快速开始
Governed tasks / 治理任务
Local session / 本地会话
Trusted device / 可信设备
Phone control / 手机控制
```

- [x] **Step 4: Pair About facts and visitor routes**

Use paired fact labels: `Public name / 公开名称`, `GitHub handle / GitHub 用户名`, `Focus / 关注方向`, and `Public entry / 公开入口`. Pair the Focus value as `Fluorescence analysis · Intelligent algorithms · Scientific instrumentation / 荧光分析 · 智能算法 · 科学仪器`.

Use paired route headings. Add exactly two route-copy paragraphs/spans with class `about-route-copy-zh` and `lang="zh-CN"`:

```text
通过文档、演示与仓库优先入口检视项目。
阅读研究反思、构建决策与方法备忘。
```

- [x] **Step 5: Pair published note titles on the homepage**

Use:

```text
Why The Homepage Needed A Second Pass / 为什么首页需要第二次优化
When A Fluorescence Signal Becomes Usable / 当一个荧光信号真正变得可用
```

Do not change their destinations or published status.

- [x] **Step 6: Run the checker and verify green**

Run: `python tools/check_site.py`

Expected: PASS for all existing static gates plus the homepage evidence hierarchy and two published-note contracts.

### Task 4: Record The Durable Decision And Current State

**Files:**
- Modify: `CONTENT_MODEL.md`
- Modify: `PLANS.md`
- Modify: `WEBIMPROVE_PROGRESS.md`
- Modify: `ACCESSIBILITY_CHECKLIST.md`
- Create: `docs/decisions/2026-07-13-homepage-evidence-hierarchy.md`
- Test: `git diff --check`

**Interfaces:**
- Consumes: the implemented homepage contract and validation evidence.
- Produces: durable Research role rules, current milestone truth, accessibility coverage, and the evidence-before-method IA decision.

- [x] **Step 1: Add a Homepage Research Evidence Model to `CONTENT_MODEL.md`**

Record the three roles, destinations, and boundaries exactly as defined in the design spec. State that only proof-bearing roles receive anchors and that the algorithm direction remains static until owner-approved fluorescence-specific evidence exists.

- [x] **Step 2: Update the current phase in `PLANS.md`**

Replace the future-tense homepage preparation bullet with the implemented evidence hierarchy. Preserve M0/M1 and all Instrument Lab history below it.

- [x] **Step 3: Add the M2 checkpoint to `WEBIMPROVE_PROGRESS.md`**

Record trigger, changes, negative/positive static checks, rendered desktop/mobile evidence, aggregate browser-runner boundary, no-publish boundary, and remaining algorithm-proof gap.

- [x] **Step 4: Refresh `ACCESSIBILITY_CHECKLIST.md`**

Record that real Research links are included in mobile touch-target sampling, the algorithm card is intentionally noninteractive, and changed Chinese explanations use explicit language semantics.

- [x] **Step 5: Create the decision record**

Use sections `Context`, `Decision`, `Consequences`, `Boundaries`, and `Follow-up`. State project evidence before workflow, Research role semantics, and the future gate for upgrading the algorithm card.

- [x] **Step 6: Review documentation diff**

Run: `git diff --check`

Expected: PASS with at most Windows line-ending warnings; no unrelated strategy, personal claim, or publish state appears.

### Task 5: Full Verification And Read-only Review

**Files:**
- Verify: all files changed by Tasks 1-4

**Interfaces:**
- Consumes: completed M2 implementation.
- Produces: fresh local evidence and a reviewer verdict suitable for a no-publish handoff.

- [x] **Step 1: Run all local gates**

```powershell
python tools/check_site.py
python -m unittest discover -s tools/tests -p "test_*.py" -v
python -m py_compile tools/check_site.py tools/serve.py
node --check script.js
node --check tools/check-public-browser.js
node --check instrument/instrument.js
node --check tools/check-instrument-browser.js
node --test instrument/sim/tests/*.mjs
node tools/preprocess-instrument-data.js --validate
git diff --check
```

Expected: all commands pass; Instrument Lab reports 114/114 and the data package reports 65,160 bytes.

- [x] **Step 2: Run rendered homepage checks**

At desktop 1280 x 900 and mobile 390 x 900, verify:

- the two real Research anchors are keyboard reachable and at least 40px high;
- the algorithm card contains no anchor, spotlight, hover-lift, or arrow state;
- `.build-grid` precedes `.workflow-map` visually and in DOM order;
- mobile menu opens, Escape closes it, and focus returns to the toggle;
- JavaScript-disabled content remains visible;
- one `h1`, first-link skip link, no console errors, and no horizontal overflow remain true.

- [x] **Step 3: Handle the aggregate browser runner conservatively**

Run `node tools/check-public-browser.js` only if its Playwright CLI session can complete. If it remains resident during startup, stop only the verified owned process tree, record the runner as not completed, and use direct Playwright/Chromium rendered checks without claiming the aggregate runner passed.

- [x] **Step 4: Run one read-only final review**

Ask the reviewer to verify public claims, Research role/link semantics, Build order, bilingual copy, checker false-positive paths, documentation truth, and scope. Fix all Critical/Important findings and re-run affected gates.

- [x] **Step 5: Review final worktree state**

Run:

```powershell
git status --short
git diff --stat
git diff
```

Confirm no secrets, contact data, unsupported claims, dependency files, new routes, publication action, staged files, commits, or pushed state were introduced.
