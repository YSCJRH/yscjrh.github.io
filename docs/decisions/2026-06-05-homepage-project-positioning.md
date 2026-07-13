# Homepage Project Positioning

- Date: 2026-06-05
- Status: Implemented in the public homepage and Projects surface; retained as the current project-positioning baseline
- Scope: homepage and `/projects/` information architecture after the 2026-06-04 project inventory

## Context

This decision continues from `docs/project-inventory-ia-proposal-2026-06-04.md` and `WEBIMPROVE_PROGRESS.md`.
It originally recorded product-positioning defaults before public visual files were edited. The selected project order, WinChronicle placement, and Instrument Lab routing are now implemented in the public site and content model.

Inputs reviewed:

- Current repo and public-site structure.
- `webimprove.md`, especially the featured-project and Project Card guidance.
- `CONTENT_MODEL.md` and `CONTENT_GAPS.md`.
- Current homepage, `/projects/`, `/notes/`, and `/instrument/` source.
- Chrome benchmark pass across eight personal brand / research-builder sites.
- Product Design brief-first workflow: benchmark and positioning before visual redesign.
- Read-only subagent reviews for benchmark fit and positioning risk.

Primary constraint:

- Preserve the research-builder-open-tools tone: fluorescence analysis, method judgment, instrumentation thinking, inspectable tools, and working notes should read as one coherent person.

## Benchmark Pass

| Site | Category | Pattern to borrow | What not to borrow | IA implication for YSCJRH |
|---|---|---|---|---|
| [Simon Willison](https://simonwillison.net/) | Developer-writer, open-source maintainer | Current work, tools, writing, and notes all have clear entry paths. | Do not make the homepage mostly a high-frequency blog feed. | Keep the homepage curated, then route into projects and notes. |
| [Julia Evans](https://jvns.ca/) | Developer-writer, explainer | Plain personal voice and category-based technical writing archive. | Do not copy the product/zine emphasis where it is not relevant. | Keep the identity sentence direct and avoid over-marketing. |
| [Maggie Appleton](https://maggieappleton.com/) | Digital garden, designer-researcher | Notes/garden are treated as deliberate thinking surfaces. | Do not borrow a more whimsical visual personality too directly. | Notes should feel intentional, not like a leftover blog. |
| [Andy Matuschak](https://notes.andymatuschak.org/About_these_notes) | Digital garden, research-builder | Strong boundary around public working notes and research environment. | Do not make the first screen a dense note graph. | Use explicit boundaries for draft-like, concept, and route-only surfaces. |
| [Gwern Branwen](https://gwern.net/) | Digital garden, longform research | Deep taxonomy and durable archive structure. | Do not put archive density on the homepage. | Let `/projects/` and `/notes/` carry detail; homepage stays a routing surface. |
| [Red Blob Games](https://www.redblobgames.com/) | Research-builder, explorable explanations | Project-led explanation through inspectable artifacts. | Do not borrow the playful/game tone site-wide. | Instrument Lab can be a strong research route without becoming top nav. |
| [Bret Victor](https://worrydream.com/) | Research-builder, interactive essays | A long-term thesis connects many projects. | Do not copy the idiosyncratic archive density. | Lead with the research-builder thesis, then prove it with selected work. |
| [Mike Bostock](https://bost.ocks.org/mike/) | Open-source maintainer, research-builder | Current-work handoff plus past work organized by proof type. | Do not make the public archive too sparse for unfamiliar visitors. | Separate featured work, supporting systems, and archive/source entries. |

Benchmark synthesis:

1. The strongest comparable sites do not put every public repository on the homepage.
2. They give cold visitors a small set of proof-bearing entries, then preserve deeper archives elsewhere.
3. They make boundaries explicit for working notes, experiments, and systems that could be misread.
4. The top navigation should stay small and stable. Detail belongs in routed pages, not global nav expansion.

## Decision 1: WinChronicle As Featured System

Recommended default:

- `WinChronicle` should become a `Featured System / 重点系统` on `/projects/`.
- It should not become one of the homepage featured three yet.
- It should not become a hero shortcut until the boundary copy and public entry path are stable.

Rationale:

- The updated inventory classifies `WinChronicle` as public and proof-bearing enough for Projects-page inclusion.
- It strengthens the local-first open-tools story.
- It is also privacy- and safety-sensitive, so homepage promotion would shift the site toward a desktop-agent/tooling identity before the research/instrumentation balance is settled.

Required public boundary:

- Not official OpenAI Chronicle.
- Not default screen recording, OCR, keylogging, cloud memory, or desktop control.
- Not a promise of broad unattended agent operation.

Tradeoffs:

- Benefit: makes the public project inventory current and shows stronger local-first systems work.
- Cost: adds another agent/tooling surface that must not crowd out fluorescence analysis and instrumentation.
- Risk: if promoted too aggressively, visitors may read the site as mostly local-agent infrastructure rather than research-builder identity.

## Decision 2: Featured Project Order

Recommended default for the next implementation pass:

1. `AnswerLens / ai-visibility-auditor`
2. `skylattice`
3. `codex-via-phone`

Rationale:

- `AnswerLens` remains first because it has the clearest cold-visitor demo path.
- `skylattice` moves second because it best expresses the longer-term local-first runtime and systems direction in `webimprove.md`.
- `codex-via-phone` remains featured, but third, because it is strong and distinctive while also repo-first and security-sensitive.

Tradeoffs:

- Benefit: aligns the homepage with the strategic order in `webimprove.md` and with benchmark patterns that put broadly legible proof before narrower setup-heavy tools.
- Cost: changes the current shipped order and the older `personalweb.md` / `CONTENT_MODEL.md` priority sequence.
- Mitigation: update `CONTENT_MODEL.md` in the same implementation pass so the site and content model do not disagree.

Fallback if the owner prioritizes continuity:

- Keep the current shipped order: `AnswerLens -> codex-via-phone -> skylattice`.
- Still add boundary/proof fields and leave `WinChronicle` below the featured trio.

## Decision 3: Instrument Lab Navigation

Recommended default:

- Keep Instrument Lab route-only under Research.
- Do not promote it to the global navigation.
- Do not turn it into a standard Build project card.

Allowed placement:

- Research section evidence link.
- `/projects/` route/source appendix entry.
- Optional contextual link from a research or instrumentation note.

Rationale:

- The current `/instrument/` route is a conceptual teaching model with explicit calibration and measurement boundaries.
- It supports the fluorescence instrumentation pillar, but it is not a standalone product, public repository, validated simulator, or real instrument-control surface.
- Benchmarks support this split: strong research-builder sites route concept artifacts clearly without expanding top navigation for every artifact.

Tradeoffs:

- Benefit: preserves a small global nav and avoids overstating maturity.
- Cost: instrumentation is slightly less prominent than it would be with a dedicated nav item.
- Mitigation: keep Instrument Lab visibly linked from Research and make its conceptual boundary obvious.

## Implemented Files

The accepted defaults were implemented across:

- `CONTENT_MODEL.md`: adopt the new featured order, add `WinChronicle` as `Featured System / 重点系统`, and keep Instrument Lab route-only.
- `CONTENT_GAPS.md`: add or refine `WinChronicle` and `encourage-loop` story/proof gaps and boundary-copy requirements.
- `index.html`: reorder the three homepage featured cards and adjust supporting links only if the homepage keeps a compact more-work row.
- `projects/index.html`: add `WinChronicle` and `encourage-loop`, group projects by evidence role, expose proof/audience/boundary fields, and keep Instrument Lab in a route/source appendix.
- `styles.css`: only if the existing card/group styles cannot support proof, audience, and boundary fields without layout strain.
- `WEBIMPROVE_PROGRESS.md`: record the implementation checkpoint and validation.

No change is expected for:

- `script.js`, unless a new filter/toggle interaction is deliberately added.
- `sitemap.xml`, unless a new public route is created.
- `robots.txt`, unless publishing/indexing policy changes.

Rejected next-pass path:

- Promoting Instrument Lab to global navigation would require synchronized nav edits across public pages, including `index.html`, `projects/index.html`, `notes/index.html`, note article pages, and `instrument/index.html`. This is not recommended by this decision.

## Follow-up

Preserve paired English / Chinese public UI and create a new decision record before materially changing the featured trio, promoting WinChronicle into it, or moving Instrument Lab into global navigation.
