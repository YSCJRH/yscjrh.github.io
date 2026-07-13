# Homepage Evidence Hierarchy

- Date: 2026-07-13
- Status: Accepted and implemented locally
- Scope: Homepage Research, Build, Notes summary, About facts/routes, and static QA contract

## Context

The homepage showed three visually similar Research cards even though their public evidence differed: one had a published reflection, one had no public example, and one led to the bounded Instrument Lab concept route. Two cards used link-like text without anchors. The Build workflow also preceded the projects that visitors could actually inspect.

The site blueprint requires a clear researcher-builder identity, conservative public claims, paired English / Chinese visitor copy, and the fixed Hero → Research → Build → Notes → About order.

## Decision

Keep the existing page structure and card system, but make evidence maturity explicit:

1. `Fluorescence Analysis` is a `published-reflection` and links to the published framing note.
2. `Fluorescence Analysis × Intelligent Algorithms` is a noninteractive `direction-statement` with `Public example pending / 公开示例待补充`.
3. `Fluorescence Instrumentation` is a `concept-route` to the bounded Instrument Lab model.
4. Within Build, show the featured project grid before the generalized workflow map, then supporting work.
5. Pair the affected workflow, inspection, note-title, About-fact, and visitor-route copy in English / Chinese.
6. Enforce the role, link, order, and scoped language contract in `tools/check_site.py`.

## Why this approach

- It improves evidence hierarchy without adding a new route, component, framework, or public fact.
- It prevents visual affordances from implying evidence or destinations that do not exist.
- It lets inspectable work lead the Build story while retaining the existing method explanation.
- It keeps Instrument Lab in its approved Research role rather than promoting it into the featured project grid.

## Alternatives considered

- Add a new proof strip: rejected because it would duplicate existing card content and increase homepage density.
- Add a new `/research/` route: deferred because the current public research evidence does not justify a separate destination.
- Link the intelligent-algorithms card to a loosely related project: rejected because that would infer a public research example not established by the allowed sources.

## Consequences

- The algorithm direction remains visibly less interactive until owner-provided public evidence exists.
- The published fluorescence note is framed as a reflection, not a research result or publication.

## Boundaries

- Instrument Lab remains an educational concept model, not calibrated measurement, validated simulation, or real instrument control.
- No commit, push, deployment, analytics, form, backend, or external runtime dependency is part of this decision.

## Follow-up

- Future evidence promotion must start from owner-provided, fluorescence-specific public evidence.
- An approved promotion must update `CONTENT_MODEL.md`, the homepage contract and its negative tests, and this decision boundary or a superseding record.
- Until that evidence exists, keep the intelligent-algorithms card noninteractive and retain `Public example pending / 公开示例待补充`.
