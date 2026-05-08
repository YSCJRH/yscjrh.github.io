# CONTENT_MODEL.md

## Purpose

This file defines the lightweight content model used by the static site. It exists to keep future project cards, note cards, and About copy truthful, consistent, and easy to validate.

Do not use this file to invent missing facts. When evidence is missing, keep the public copy higher-level or record the gap in `CONTENT_GAPS.md`.

## Project Card Model

Use these fields when adding or revising a public project card:

| Field | Meaning | Public rule |
|---|---|---|
| `name` | Public project name and optional repo name | Use the real repository/project name. |
| `one_liner` | What the project is | Stay close to the public README or already-reviewed site copy. |
| `status` | Current public maturity or entry state | Use conservative labels such as `Live demo`, `Public docs`, `Repo-first`, `Concept repo`, or `Tooling experiment`. |
| `audience` | Who should start here | Keep implicit in copy unless there is a sourced public audience. |
| `problem` | The constraint or question the project handles | Do not imply adoption, user demand, or outcomes. |
| `proof` | What a visitor can inspect now | Demo, docs, quick start, security model, examples, or README. |
| `tags` | Short scan labels | Keep tags descriptive, not promotional. |
| `links` | Ordered CTAs | Use `Demo/Try`, then `Docs/Setup`, then `GitHub` when those entries exist. |
| `not_for` | Boundary or non-claim | State boundaries for repo-first, concept, experimental, security-sensitive, or simulation work. |

## Current Project Statuses

| Project | Homepage role | Status | Clearest current proof path |
|---|---|---|---|
| `AnswerLens / ai-visibility-auditor` | Featured | `Live demo / 已有公开页面` | public demo, README, GitHub repo |
| `codex-via-phone` | Featured | `Repo-first / 当前以仓库为入口` | setup path, security model, GitHub repo |
| `skylattice` | Featured | `Public docs / 已有公开文档` | docs, quick start, GitHub repo |
| `mirror-sim` | Supporting | `Concept repo / 概念仓库` | concept README, three-minute demo path, GitHub repo |
| `create-double-skill` | Supporting | `Tooling experiment / 实验型工具` | first-run README path, examples, GitHub repo |

Homepage rule:

- Keep the homepage focused on three first-read projects: `AnswerLens`, `codex-via-phone`, and `skylattice`.
- Keep `mirror-sim` and `create-double-skill` available as supporting entries unless the owner provides stronger public proof or changes project priority.

Projects page rule:

- Show all five projects.
- Group them by current public entry strength, not by claimed importance.
- Do not add stars, forks, users, customers, institutions, awards, or adoption metrics.

## Note Card Model

Use these fields for note hub cards and homepage note summaries:

| Field | Meaning |
|---|---|
| `category` | Build Logs, Research Reflections, or Method Notes |
| `category_promise` | What kind of thinking belongs there |
| `latest_note` | Latest public note title, if published |
| `status` | Published count or draft state |
| `related` | Related project, research direction, or method area |
| `link` | Public note path or notes hub path |

Draft notes should stay clearly marked as repository drafts until a public HTML page exists.

## About Copy Boundaries

Allowed public About facts by default:

- `HJR / YSCJRH`
- GitHub handle: `YSCJRH`
- Research-builder focus across fluorescence analysis, intelligent algorithms, scientific instrumentation, open tools, and working notes
- GitHub as the current public entry point

Do not add:

- email, phone, location, institution, employer, degree, title, awards, publications, collaborators, testimonials, usage metrics, or private documents

If a missing fact would change public positioning, write a blocker brief in `WEBIMPROVE_PROGRESS.md` instead of guessing.
