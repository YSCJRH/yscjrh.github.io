# Project Inventory And IA Proposal - 2026-06-04

## Scope

This document is a research and planning artifact for the next personal-site redesign pass.
It does not implement visual changes.

The inventory classifies every public repository visible from the YSCJRH GitHub repositories page during this checkpoint, plus the public Instrument Lab route because it is a visitor-facing project-like surface inside this site.

Primary constraints:

- Preserve the research-builder-open-tools tone.
- Preserve paired English / Chinese public UI when later implementing.
- Do not invent personal facts, project adoption, usage metrics, institutions, awards, contact methods, or maturity claims.
- Treat homepage promotion as a public-positioning decision when it would change the current featured set.

## Evidence Base

Local repository sources:

- `personalweb.md:273-277` and `personalweb.md:1037-1041` define the original five representative Build projects.
- `CONTENT_MODEL.md:9-42` defines the current project card model and homepage/projects rules.
- `CONTENT_GAPS.md:147-243` records missing story inputs, proof gaps, and first-run proof gaps.
- `webimprove.md:995-1225` defines the richer project card model, `not_for` boundaries, and recommended featured priority.
- `index.html:142-173` shows the current Hero CTA and shortcut load.
- `index.html:349-523` shows the current homepage Projects / Build section.
- `projects/index.html:124-302` shows the current `/projects/` grouping and project cards.
- `instrument/index.html:137-154` establishes Instrument Lab as a bounded concept route.

External public sources checked:

- GitHub profile repositories page: `https://github.com/YSCJRH?tab=repositories`
- Repository pages for `ai-visibility-auditor`, `codex-via-phone`, `skylattice`, `mirror-sim`, `create-double-skill`, `WinChronicle`, `encourage-loop`, and `yscjrh.github.io`

Evidence limitation:

- `gh repo view` and unauthenticated GitHub REST API calls failed in this environment because of GraphQL EOF / rate limiting. Public GitHub HTML pages were readable and are used as the live external evidence source for this checkpoint.

## Inventory Fields

Use these normalized fields for the next content-model pass:

| Field | Meaning |
|---|---|
| `audience` | Who should start with this project. Keep public copy implicit unless the audience is directly supported by README/site evidence. |
| `maturity` | Conservative public maturity: `live-demo`, `public-docs`, `repo-first`, `concept`, `experiment`, `route-concept`, `site-infra`, or `candidate-featured`. |
| `proof` | What a visitor can inspect now: live route, docs, quick start, README, examples, security model, tests/checks, source-derived caveats. |
| `public_entry` | The first visitor path that should be linked. |
| `homepage_priority` | `featured`, `supporting`, `route-only`, `candidate`, `site-infra`, or `none`. |
| `boundary` | What the card must not imply. This becomes the visible `not_for` / boundary field on `/projects/`. |
| `notes` | Local evidence gaps or positioning concerns. |

## Public Project Inventory

| Project | Audience | Maturity | Proof Now | Public Entry | Homepage Priority | Boundary / Not For |
|---|---|---|---|---|---|---|
| `AnswerLens / ai-visibility-auditor` | Product-site maintainers, open-source maintainers, AI discoverability readers | `live-demo` | Public demo, README, repository | `https://yscjrh.github.io/ai-visibility-auditor/` | `featured`; keep first | Not an AI ranking promise; not a consumer AI UI scraping claim |
| `skylattice` | Developers interested in local-first agent runtime, memory, Git-native automation, governed repo work | `public-docs` | Public docs, quick start, repository | `https://yscjrh.github.io/skylattice/` | `featured`; strong candidate for second | Not a hosted hidden-autonomy assistant; not a generic chat wrapper |
| `codex-via-phone` | Windows local Codex users who need phone-friendly continuation, approval, or private control | `repo-first` + `security-sensitive` | README setup path, security model, repository | GitHub README anchors | `featured`; current shipped order puts it second | Not public remote-control SaaS; do not imply broad unattended access |
| `mirror-sim` | Developers/readers interested in constrained simulation, scenario boundaries, evidence trails | `concept` / repo-first | README, public demo-mode description, three-minute path, repository | GitHub repository | `supporting` | Not real-world prediction; not real-person profiling; not sensitive-domain decision automation |
| `create-double-skill` | Users interested in local editable self-modeling, profile material, reusable working preferences | `experiment` / repo-first | README, first-run path, examples, repository | GitHub README anchors | `supporting` | Not a public identity database; not psychological diagnosis; not public personal-data storage |
| `WinChronicle` | Windows developers and agent users who need local-first workflow memory with privacy boundaries | `candidate-featured` / public repo | README, privacy architecture docs, install/run path, deterministic fixture/demo path | GitHub repository | `candidate`; do not add to homepage without owner decision | Not official OpenAI Chronicle; not screen recorder/OCR/keylogger/cloud memory/desktop-control tool by default |
| `encourage-loop` | Developers using long-running coding agents who need plan cursors, evidence gates, and handoff notes | `repo-first` / tooling experiment | README, CLI commands, skill/plugin packaging, tests path | GitHub repository | `candidate-supporting` | Not autonomous framework, daemon, command injector, judge, or replacement for tests/review |
| `yscjrh.github.io` | Maintainers or readers who want to inspect the site source and static publishing boundary | `site-infra` | Live site, repository README, static architecture | Current site and GitHub repository | `site-infra`; footer/source link only | Not a separate product/project card unless the site-building process becomes the story |
| `Instrument Lab` | Research/instrumentation readers and visitors learning the fluorescence spectrophotometer concept model | `route-concept` | Live `/instrument/` route, source-derived examples, explicit conceptual/calibration boundaries | `/instrument/` | `route-only`; Research entry, not Build inventory by default | Conceptual teaching model only; not real instrument control, calibrated measurement, validated simulator, or manufacturer UI |

## Immediate Inventory Conclusions

1. The current five-project gateway is no longer the complete public-project universe; the public profile now also exposes `WinChronicle` and `encourage-loop`.
2. The current homepage featured set remains defensible because it is anchored in `personalweb.md`, `CONTENT_MODEL.md`, and shipped site copy.
3. `WinChronicle` has enough public proof to deserve Projects-page consideration, but adding it to the homepage would materially change the public tool identity and should be a human positioning decision.
4. `encourage-loop` fits the open-tools / agent-workflow theme but currently reads as supporting tooling rather than a homepage-defining project.
5. `Instrument Lab` should stay route-only unless the owner wants it promoted from research concept route to public project. Its current evidence and boundaries are stronger as a Research / instrumentation support surface than as a Build card.
6. The most important missing field across current cards is not another visual treatment; it is visible boundary/proof language, especially for `AnswerLens`, `codex-via-phone`, and `mirror-sim`.

## Inventory Checkpoint Status

Inventory complete for planning purposes.
The next checkpoint is the homepage and `/projects/` IA proposal.

---

## Homepage IA Proposal

### North Star

The homepage should stay an identity-and-routing surface:

> fluorescence analysis -> method judgment -> instrument thinking -> inspectable open tools -> working notes

It should not become a full repository list, a SaaS landing page, or a demo-first product page.

### Recommended Order

Keep the global order required by `personalweb.md` and `AGENTS.md`, but split the current `Projects / Build` section internally:

1. `Hero / 首页`
2. `Research / 研究`
3. `Featured Projects / 重点项目`
4. `Build Method / Open Tools / 构建方法 / 开放工具`
5. `Notes / 笔记`
6. `About / 关于`

This preserves the repo-level spine while aligning with `webimprove.md:478-489`, which separates `Featured Projects` from `Build Method / Open Tools`.

### Header Navigation

Keep the current navigation vocabulary:

- `Research / 研究`
- `Projects / 项目`
- `Notes / 笔记`
- `About / 关于`
- `GitHub`

Do not reintroduce `Build / 构建` as the main navigation label. It is weaker information scent for cold visitors and duplicates `Projects / 项目`.

### Hero Routing

Recommended Hero content model:

- One positioning headline.
- One supporting English sentence and one natural Chinese counterpart.
- Two main CTAs:
  - `Explore projects / 查看项目`
  - `Read notes / 阅读笔记`
- A compact secondary-entry strip with no more than three entries.

Recommended secondary entries:

1. `AnswerLens demo / AnswerLens 演示`
2. `Skylattice docs / Skylattice 文档`
3. `Instrument Lab / 仪器可视化` if the owner wants the instrumentation route visible from the first screen; otherwise move it to Research only.

Recommended change from current rendered page:

- Remove `GitHub profile / GitHub 主页` from the Hero shortcut strip because GitHub already exists in the header/footer and competes with project-specific first paths.
- Keep GitHub as the site-wide external utility link.

### Research Section

Keep the three research directions:

- `Fluorescence Analysis / 荧光分析`
- `Fluorescence Analysis x Intelligent Algorithms / 荧光分析 x 智能算法`
- `Fluorescence Instrumentation / 荧光仪器`

Add an evidence link pattern for each direction before strengthening copy:

| Direction | Evidence route now | Gap |
|---|---|---|
| Fluorescence Analysis | Research reflection note | Needs one owner-provided public example from `CONTENT_GAPS.md` |
| Fluorescence x Algorithms | Related method note is still draft-level | Needs safe public algorithmic workflow example |
| Fluorescence Instrumentation | `/instrument/` concept route | Strong concept route exists; must keep conceptual/calibration boundary visible |

### Featured Projects Section

Homepage should show exactly three featured project cards.

Recommended strategic order for the next proposal:

1. `AnswerLens / ai-visibility-auditor`
2. `skylattice`
3. `codex-via-phone`

Rationale:

- `AnswerLens` has the clearest live demo entry for cold visitors.
- `skylattice` has public docs and best expresses longer-term local-first agent/runtime direction.
- `codex-via-phone` is strong but security-sensitive and repo-first, so it benefits from context after the first two.

Implementation caution:

- The current shipped order is `AnswerLens`, `codex-via-phone`, `skylattice`.
- Changing the order is a public-positioning choice. It is acceptable as a proposal, but implementation should either get owner confirmation or record a decision note.

### Supporting Public Work

Homepage should not list every public repository as a full card.

Recommended supporting treatment:

- Compact `More public work / 更多公开项目` row or link panel.
- Include, in conservative order:
  - `mirror-sim`
  - `create-double-skill`
  - `WinChronicle`
  - `encourage-loop`
- Keep all four subordinate to the featured trio.
- Do not include repository stars, forks, commit counts, or adoption metrics.

Alternative if the owner wants a quieter homepage:

- Remove supporting project cards from the homepage entirely.
- Use a single `All projects / 全部项目` CTA after the featured trio.
- Let `/projects/` carry the complete inventory.

### Build Method Section

Move the current four-step workflow map after the featured projects.

Reason:

- Visitors first need to know which projects to inspect.
- The method explanation is useful once the reader has seen concrete entries.

Recommended steps:

1. `Find the constraint / 找到约束`
2. `Shape the method / 形成方法`
3. `Build the tool / 做成工具`
4. `Keep the trail / 留下证据`

Keep this as work-method framing, not a substitute for project proof.

### Notes Section

Keep the current three buckets:

- `Build Logs / 构建日志`
- `Research Reflections / 研究反思`
- `Method Notes / 方法备忘`

Add project cross-links only when they are real:

- `AnswerLens` can later link to a build log if one is written.
- `skylattice`, `codex-via-phone`, `mirror-sim`, and `create-double-skill` still need project-specific notes listed in `CONTENT_GAPS.md`.
- `Method Notes` remains draft-only until a public HTML note exists.

---

## Projects IA Proposal

### Role Of `/projects/`

`/projects/` should become the complete evidence-first reading index for public work.

It should answer, for each project:

- Who should start here?
- What is it?
- What can be inspected now?
- What is the current maturity?
- What is the boundary / what is it not?
- Where should the visitor click first?

### Recommended Page Structure

1. `Projects with public entry points / 有公开入口的项目`
   - Short route lead.
   - Explain that the page is ordered by public entry strength and evidence, not by metrics.

2. `Featured first / 先看这三项`
   - `AnswerLens / ai-visibility-auditor`
   - `skylattice`
   - `codex-via-phone`

3. `Local-first agent and workflow tools / 本地优先的 agent 与工作流工具`
   - `WinChronicle`
   - `encourage-loop`

4. `Concept and reflective experiments / 概念与反思型实验`
   - `mirror-sim`
   - `create-double-skill`

5. `Research route and site source / 研究路线与站点源码`
   - `Instrument Lab` as route-only concept model
   - `yscjrh.github.io` as site-infra/source link

6. `How to read these projects / 如何阅读这些项目`
   - Keep the existing project-reading workflow explainer, but place it after the grouped inventory.

### Project Card Schema

Use the same fields on `/projects/` for every full card:

| Field | Public label pattern |
|---|---|
| Status | `Status / 状态` |
| Audience | `Best for / 适合谁` |
| Proof | `Proof path / 可检视证据` |
| Boundary | `Boundary / 边界` or `Not for / 不是什么` |
| Entry | Ordered CTA group |
| Related | Optional note or route, only when real |

Homepage cards may stay shorter, but `/projects/` should expose the full evidence model.

### Recommended Project Grouping

| Group | Projects | Reason |
|---|---|---|
| Featured first | `AnswerLens`, `skylattice`, `codex-via-phone` | Best current mix of public entry, docs/setup path, and brand relevance |
| Local-first agent/workflow tools | `WinChronicle`, `encourage-loop` | Newer public repos that strengthen the open-tools/local-agent story but require positioning before homepage promotion |
| Concept and reflective experiments | `mirror-sim`, `create-double-skill` | Useful, distinctive, but boundary-sensitive and less homepage-defining |
| Route/source appendix | `Instrument Lab`, `yscjrh.github.io` | Public surfaces worth linking, but not standard project cards by default |

### Required Boundary Copy Before Implementation

Before any visual redesign of cards, add or reserve space for these boundaries:

- `AnswerLens`: not a ranking promise and not consumer-AI scraping.
- `codex-via-phone`: not public remote-control SaaS and not broad unattended access.
- `skylattice`: not a hosted autonomous assistant or generic chat wrapper.
- `mirror-sim`: not real-world prediction, real-person profiling, or sensitive-domain decision automation.
- `create-double-skill`: not psychological diagnosis, identity database, or public personal-data store.
- `WinChronicle`: not official OpenAI Chronicle, not default screenshot/OCR/keylogging/cloud upload/desktop control.
- `encourage-loop`: not an autonomous framework, daemon, command injector, judge, or replacement for tests/review.
- `Instrument Lab`: not real instrument control, calibrated measurement, validated simulator, or manufacturer UI.

### Human Positioning Decisions Before Visual Implementation

The inventory and IA proposal are complete, but implementation should stop for human confirmation on these points:

1. Should `WinChronicle` enter the public `/projects/` page in the next redesign pass?
2. Should `WinChronicle` stay Projects-only, or should it compete for homepage featured status later?
3. Should the featured homepage order change from the current shipped `AnswerLens -> codex-via-phone -> skylattice` to the `webimprove.md` strategic order `AnswerLens -> skylattice -> codex-via-phone`?
4. Should Instrument Lab remain a Research route only, or become a sixth project-like entry?

Recommended default until answered:

- Update `/projects/` IA to account for `WinChronicle` and `encourage-loop`.
- Do not change the homepage featured set beyond the existing three.
- Keep Instrument Lab route-only under Research.
- If reordering the featured trio, record the rationale in `docs/decisions/`.

## IA Checkpoint Status

Inventory and IA proposal are complete.
No visual implementation has been made.
