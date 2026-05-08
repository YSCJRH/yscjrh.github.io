# Manual QA Checklist

Status: ready for governance sync and browser QA
Last prepared: 2026-04-24

This checklist is for manual verification of the current public site and local preview before or after small content/UX changes.

## 1. Setup

- Confirm you are in the repo root.
- Start a local preview server:

```powershell
python tools/serve.py
```

This helper keeps SVG assets rendering correctly in local browser QA on Windows and falls forward to the next available local port if `4173` is occupied. Use the URL printed by the command. If it is unavailable, fall back to `python -m http.server 4173` and check whether SVG assets still render.

- Open both:
  - the printed local preview URL, usually `http://127.0.0.1:4173/`
  - `https://yscjrh.github.io/`

Use the live site for reachability checks and the local server for pre-publish review.

## 2. Baseline Pages

Check these pages at minimum:

1. Homepage `/`
2. Projects hub `/projects/`
3. Notes hub `/notes/`
4. Build log note `/notes/build-logs-homepage-second-pass.html`
5. Research reflection note `/notes/when-a-fluorescence-signal-becomes-usable.html`
6. Instrument Lab `/instrument/`

Expected baseline:

- page loads without missing CSS or JS
- title and top navigation render correctly
- GitHub links are intentional
- no broken image placeholders or exposed decorative alt text appear
- `/review/` remains absent from the deployable page tree, excluded from `sitemap.xml`, and disallowed in `robots.txt`
- no private contact details appear

## 3. Desktop Checks

On a desktop-width viewport:

- homepage header stays readable when sticky
- anchor/navigation routes to `Research`, `Projects`, `Notes`, and `About` land cleanly
- hero section remains readable without visual overlap
- hero and project visual modules render as intended
- build cards remain scan-friendly and do not collapse awkwardly
- projects hub feels like the fuller gateway, not an accidental homepage duplicate
- notes teaser remains visually connected to the rest of the homepage
- notes hub cards remain readable and evenly spaced
- both note pages remain readable as article pages rather than homepage fragments

## 4. Mobile Checks

Use a narrow viewport around `360px` wide.

- mobile menu opens and closes correctly
- mobile menu closes after selecting a link
- scrolling does not feel locked after menu close
- hero text wraps cleanly
- research, project, and notes cards stack without clipping
- project card CTAs wrap cleanly without overlapping
- note pages remain readable without horizontal scrolling
- sticky header does not hide too much of the anchor target area

## 5. Mixed-Bilingual Copy

The current site is mixed-bilingual in the markup. It does not currently expose a language switcher.

On homepage, projects hub, notes hub, and note pages:

- confirm English/Chinese paired labels read intentionally
- confirm Chinese text does not overflow compact controls or cards
- confirm no stale UI claims refer to a language switcher

## 6. Interaction And Accessibility Checks

- tab through header controls and primary links
- confirm focus styles remain visible
- press `Escape` to close the mobile menu
- click outside the mobile menu to close it
- verify external GitHub links open intentionally
- verify skip link works
- verify project CTAs expose only live/demo/docs/repo-first paths that actually resolve

If available, also check reduced motion behavior:

- system reduced-motion enabled
- page still feels usable without reveal/parallax dependence

## 7. Notes Discoverability Checks

Run this exact path:

1. homepage -> build log note
2. build log note -> notes hub
3. notes hub -> research reflection note
4. research reflection note -> notes hub
5. notes hub -> homepage

Record whether the current path feels intentional or confusing.

Specifically note:

- whether the homepage links to both individual notes and the notes hub clearly enough
- whether the notes hub feels like a public destination or still like an internal staging page

## 8. Project Gateway And GitHub Surface Checks

Open the public GitHub profile and the five featured repositories.

- homepage story matches repository descriptions closely enough
- representative repo is easy to find
- profile wording does not contradict the homepage
- homepage URL, if present on GitHub, points to the live site
- README fragment links used by project CTAs still land on the intended sections
- AnswerLens demo and Skylattice docs remain reachable

Use `docs/github-coordination-checklist.md` during this step.

## 9. Result Format

When logging a QA pass, keep notes short:

```md
# QA Pass

- Date:
- Local or live:
- Pages checked:
- Confirmed:
- Issues found:
- Follow-up:
```
