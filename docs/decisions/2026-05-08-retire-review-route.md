# Retire Review Route From Deployable Tree

- Date: 2026-05-08
- Status: accepted for the webimprove release

## Context

The site previously kept `/review/` as a live but noindex internal review surface. During release preparation for the `webimprove.md` pass, two read-only release reviewers independently flagged the route as a publish risk because it exposed maintainer-facing review framing and links to repository operating documents from the deployed tree.

## Decision

Remove `review/index.html` from the deployable site tree for this release.

Keep the boundary markers:

- `robots.txt` continues to disallow `/review/`.
- `sitemap.xml` continues to exclude `/review/`.
- `tools/check_site.py` fails if `review/index.html` is reintroduced without an intentional update.

## Rationale

This narrows the public surface before publishing without changing the public identity, information architecture, or technology stack. The review material remains available in tracked maintenance documents rather than as a visitor-reachable page.

## Consequences

- `https://yscjrh.github.io/review/` should become 404 after deployment.
- Future review artifacts should stay in docs or local QA files unless the owner explicitly approves a public review page.
- If a public review/status page is needed later, create a new decision record and strip maintainer-only links before publishing it.
