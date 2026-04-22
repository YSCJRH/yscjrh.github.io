# Manual QA Checklist

Status: ready for the next implementation pass  
Last prepared: 2026-04-21

This checklist is for manual verification of the current public site and local preview before or after small content/UX changes.

## 1. Setup

- Confirm you are in the repo root.
- Start a local preview server:

```powershell
python -m http.server 4173
```

- Open both:
  - `http://localhost:4173/`
  - `https://yscjrh.github.io/`

Use the live site for reachability checks and the local server for pre-publish review.

## 2. Baseline Pages

Check these pages at minimum:

1. Homepage `/`
2. Notes hub `/notes/`
3. First published note `/notes/build-logs-homepage-second-pass.html`

Expected baseline:

- page loads without missing CSS or JS
- title and top navigation render correctly
- GitHub links are intentional
- no private contact details appear

## 3. Desktop Checks

On a desktop-width viewport:

- homepage header stays readable when sticky
- anchor navigation to `Research`, `Build`, `Notes`, and `About` lands cleanly
- hero section remains readable without visual overlap
- build cards remain scan-friendly and do not collapse awkwardly
- notes teaser remains visually connected to the rest of the homepage
- notes hub cards remain readable and evenly spaced
- first note page remains readable as an article page rather than a homepage fragment

## 4. Mobile Checks

Use a narrow viewport around `360px` wide.

- mobile menu opens and closes correctly
- mobile menu closes after selecting a link
- scrolling does not feel locked after menu close
- hero text wraps cleanly
- research, build, and notes cards stack without clipping
- note pages remain readable without horizontal scrolling
- sticky header does not hide too much of the anchor target area

## 5. Language Switching

On homepage, notes hub, and first note page:

- switch from `EN` to `中文`
- confirm both copy and typography change together
- navigate to another page and confirm the language choice persists
- refresh once and confirm the saved language still applies

Watch for:

- English text hidden while English typography remains
- Chinese text shown with English typography
- one page remembering language while another page resets unexpectedly

## 6. Interaction And Accessibility Checks

- tab through header controls and primary links
- confirm focus styles remain visible
- press `Escape` to close the mobile menu
- click outside the mobile menu to close it
- verify external GitHub links open intentionally
- verify skip link works

If available, also check reduced motion behavior:

- system reduced-motion enabled
- page still feels usable without reveal/parallax dependence

## 7. Notes Discoverability Checks

Run this exact path:

1. homepage -> featured note
2. first note -> notes hub
3. notes hub -> homepage

Record whether the current path feels intentional or confusing.

Specifically note:

- whether the homepage should also link more directly to the notes hub
- whether the notes hub feels like a public destination or still like an internal staging page

## 8. GitHub Surface Checks

Open the public GitHub profile and the five featured repositories.

- homepage story matches repository descriptions closely enough
- representative repo is easy to find
- profile wording does not contradict the homepage
- homepage URL, if present on GitHub, points to the live site

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

