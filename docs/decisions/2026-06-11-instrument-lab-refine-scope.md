# Instrument Lab Refine Reconstruction Scope

- Date: 2026-06-11
- Status: Accepted for current long-running goal

## Context

`refine.md` introduces a broader goal for `/instrument/`: move from a heavily explained concept page toward a static, interaction-first, evidence-backed fluorescence instrument teaching simulator.

The existing page already has a useful 3D/2D optical bench, 200-900 nm wavelength controls, source-derived examples, EEM slice viewing, diagnostics, and tests. It does not yet have the full modular response chain, language switcher, model documentation, research log, or complete Definition of Done coverage requested by `refine.md`.

## Decision

Proceed as an evidence-first staged reconstruction while preserving the current static-site architecture.

Near-term scope:

- Track `refine.md` as the active reconstruction specification.
- Add `docs/instrument-research-log.md` before adding new scientific claims.
- Add `instrument/MODEL.md` to describe current and target model boundaries.
- Keep source-derived data separate from synthetic controls.
- Keep the current Three.js route-local implementation and 2D fallback.
- Implement future behavior changes with tests first where they affect model or UI behavior.

## Consequences

- The refactor will be multi-commit and cannot be honestly marked complete until every `refine.md` DoD item is verified.
- Scientific or correction claims without a local research-log entry are out of scope.
- Any real data embedding beyond the current manifest requires source/license/axis/processing review.
- Framework migration, analytics, backend, forms, authentication, or public data fetching remain out of scope unless a later decision record overrides this.

## Follow-up

- Update `PLANS.md` to make this the current phase.
- Add model-invariant tests before replacing current spectrum behavior.
- Add a dated final audit when the full `refine.md` DoD is satisfied.
