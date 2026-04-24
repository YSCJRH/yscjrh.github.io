# Public Surface Verification

Date: 2026-04-24
Scope: governance sync, static markup verification, and link-target QA for the current public surfaces

## Surfaces Checked

1. `index.html`
2. `projects/index.html`
3. `notes/index.html`
4. `notes/build-logs-homepage-second-pass.html`
5. `notes/when-a-fluorescence-signal-becomes-usable.html`
6. `review/index.html`
7. `styles.css`
8. `script.js`
9. `tools/serve.py`

## Current Public Surface

- `/`
- `/projects/`
- `/notes/`
- `/notes/build-logs-homepage-second-pass.html`
- `/notes/when-a-fluorescence-signal-becomes-usable.html`
- `/review/`

`/review/` is public in the deployed tree but marked with `noindex, nofollow`. Treat it as an internal review surface until the owner explicitly decides to keep, hide, or remove it.

## Confirmed Markup State

- All checked HTML pages declare a viewport meta tag, title, description, canonical URL, shared stylesheet, favicon, and deferred shared script.
- The homepage still follows the required order: Hero, Research, Projects / Build, Notes, About.
- `/projects/` is the fuller project gateway and mirrors the homepage CTA hierarchy without inventing standalone pages for repo-first projects.
- `/notes/` links to two public notes and leaves Method Notes as a draft/repo-backed area.
- Public HTML and `script.js` do not include forms, analytics snippets, tracking scripts, `fetch`, or `XMLHttpRequest`.

## Confirmed Local Link Model

- Homepage links to `/projects/`, `/notes/`, both note pages, GitHub, AnswerLens, and Skylattice.
- Projects hub links back to the homepage, notes hub, GitHub profile, and five project entry paths.
- Notes hub links back to the homepage and to both public notes.
- Note pages link back to the notes hub, homepage, and projects hub.
- Review page links to local docs and source files, which is why it should remain noindexed unless intentionally promoted.

## Verification Run

Commands/checks run on 2026-04-24:

- Local static href/src resolution across all checked HTML pages: passed.
- Scan for analytics, forms, `fetch`, and `XMLHttpRequest` in public HTML plus `script.js`: passed.
- Local preview via `python -m http.server 4173`: all six current public surfaces returned HTTP 200.
- Browser QA found that Windows `python -m http.server` served `.svg` as `image/svg`, which caused the hero SVG to appear as broken in the in-app browser.
- Added `tools/serve.py` as a dependency-free preview helper that serves `.svg` as `image/svg+xml`.
- Re-ran in-app browser QA through `tools/serve.py`: homepage rendered without the broken hero-image alt text, mobile navigation opened and closed with `Escape`, and all six checked pages reported one `main`, one `h1`, and zero captured console errors.
- Live reachability for `/`, `/projects/`, `/notes/`, both note pages, `/review/`, AnswerLens, Skylattice docs, Skylattice quickstart, and GitHub repository CTAs: all checked URLs returned HTTP 200.
- Raw README heading checks found the fragment-backed sections used by repo-first CTAs:
  - `codex-via-phone`: `快速开始`, `安全默认模型`
  - `mirror-sim`: `3-minute demo path`, `3 分钟上手路径`
  - `create-double-skill`: `三分钟跑通第一次`, `示例`

## Project CTA Watchlist

These links are useful current CTAs but should be rechecked during QA because they depend on external pages or GitHub heading fragments:

- `https://yscjrh.github.io/ai-visibility-auditor/`
- `https://yscjrh.github.io/skylattice/`
- `https://yscjrh.github.io/skylattice/quickstart/`
- `https://github.com/YSCJRH/codex-via-phone#快速开始`
- `https://github.com/YSCJRH/codex-via-phone#安全默认模型`
- `https://github.com/YSCJRH/mirror-sim#3-minute-demo-path--3-分钟上手路径`
- `https://github.com/YSCJRH/create-double-skill#三分钟跑通第一次`
- `https://github.com/YSCJRH/create-double-skill#示例`

## Validation Gaps

- GitHub Pages source setting still requires repository-settings confirmation.
- GitHub profile homepage field and pinned repository order still require manual GitHub profile review.
- Full multi-viewport visual QA still requires a broader browser pass, especially desktop/tablet comparisons, focus order, and sticky-anchor landing positions.
- README fragment links can degrade if repository headings change, even though the referenced headings existed during this check.

## Post-Visual-Publish Addendum

After the visual depth pass was committed and pushed on 2026-04-24, the live homepage was checked again at `https://yscjrh.github.io/?v=a0db505`.

Confirmed:

- the published homepage returned the expected title
- no `<img>` elements remained on the homepage visual surface
- the hero lab visual, five project visuals, and three note thumbnails were present as CSS/HTML modules
- no captured console errors were reported by the in-app browser check

## Result

The public surface is broader than the 2026-04-21 intake docs described. Maintainer docs should now treat the site as a homepage-first small static site with a project gateway, notes hub, two public notes, and a noindex review surface.
