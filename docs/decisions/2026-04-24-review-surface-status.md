# Review Surface Status

- Date: 2026-04-24
- Status: Superseded by `2026-05-08-retire-review-route.md`

## Context

The repository contains `review/index.html`, and the public Pages URL `/review/` is reachable. The page includes internal audit framing and links to repository docs/source files, but it is marked `noindex, nofollow`.

## Decision

Keep `/review/` in place for now as a live but unindexed internal review surface. Do not promote it in primary navigation, and do not remove it from the deployed tree without an explicit owner decision.

## Consequences

- Maintainers should include `/review/` in public surface checks because it is still published.
- Search engines should be discouraged from indexing it, but `noindex` is not access control.
- If the owner wants a cleaner public tree later, removing or moving `/review/` should be handled as a separate publishing decision.

## Follow-up

- Superseded on 2026-05-08: `/review/` was removed from the deployable tree for the webimprove release after release review identified it as a public-surface risk.
