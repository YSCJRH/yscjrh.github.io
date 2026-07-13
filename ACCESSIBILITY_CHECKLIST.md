# Accessibility Checklist

Status: 2026-07-13 responsive generated Hero figure, bilingual image description, caption language semantics, keyboard navigation, no-JS behavior, and evidence hierarchy refreshed
Last updated: 2026-07-13
Latest local preview used: `http://127.0.0.1:4173/`

This checklist records the current accessibility baseline for the static personal site. It is not a replacement for assistive-technology testing, but it gives future Codex passes a concrete set of checks. The 2026-06-19 refresh includes the published Instrument Lab default-3D, single-language display, classic sample, sample picker, and sample-picker reveal passes.

## Scope

Core pages checked:

- `/`
- `/404.html`
- `/projects/`
- `/notes/`
- `/notes/build-logs-homepage-second-pass.html`
- `/notes/when-a-fluorescence-signal-becomes-usable.html`
- `/instrument/`

## Checks

- Homepage Hero image: one semantic `<figure><picture>` provides exact local responsive sources; the meaningful `<img>` carries the paired English / Chinese description, the Chinese concept-boundary sentence uses `lang="zh-CN"`, the caption remains outside the image in normal flow, and no duplicate `role="img"` or decorative mobile substitute is exposed.
- Heading structure: each core page has one main `<h1>` and section headings are present in a readable order.
- Skip link: each core page has a skip link that targets `#main`, and that skip link must be the first link in DOM order.
- Fragment links and IDs: checked pages must not contain duplicate `id` values, and local `#fragment` links must resolve to an existing HTML target.
- ARIA references: `aria-controls`, `aria-labelledby`, `aria-describedby`, and related idref attributes must point to existing IDs in the same page.
- Focus visible: global `:focus-visible` styles are present for links, buttons, mobile nav, project links, footer links, and instrument controls.
- Keyboard navigation: mobile menu opens from the toggle, moves focus into the menu, closes with Escape, and returns focus to the toggle.
- No-JS navigation: shared public pages keep a compact visible primary nav on mobile when JavaScript is disabled; the inactive hamburger toggle is hidden in that mode, and checked page bodies must start with the `no-js` class.
- Mobile menu ARIA: toggle uses `aria-expanded`, `aria-controls="mobile-menu"`, and paired English / Chinese label text.
- Touch targets: sampled first-viewport links and buttons at 320px, 375px, 390px, 414px, and 768px are at least 40px in both dimensions in `tools/check-public-browser.js`; homepage Research evidence anchors are included in that selector. The `/instrument/` 3D toolbar reset buttons are covered by the 2026-06-19 browser QA touch-target check.
- Viewport metadata: each checked page must keep exactly one `width=device-width, initial-scale=1` viewport meta tag so mobile rendering remains predictable.
- Color contrast: Lighthouse accessibility audit reported no contrast failures on the homepage.
- Images and decorative graphics: `<img>` elements must carry `alt`; empty `alt` is allowed only when the image is explicitly decorative with `aria-hidden="true"` or `role="presentation"` / `role="none"`. Inline `<svg>` elements must either be decorative with `aria-hidden="true"` / presentation role or provide an accessible name through `aria-label`, `aria-labelledby`, or a child `<title>`.
- Reduced motion: CSS includes `prefers-reduced-motion: reduce`; JavaScript disables reveal/parallax dependence when reduced motion is requested.
- Shared assets and body state: each checked page loads the shared stylesheet and deferred shared JavaScript, and keeps the `body.no-js` bootstrap class so skip-link, focus, no-JS, reduced-motion, and mobile-navigation behavior remain consistent.
- Bilingual language semantics: each checked page keeps root `<html lang="en">`, while full-sentence Chinese blocks with `*-zh` classes or `[data-language="zh"]` spans carry `lang="zh-CN"`. Instrument optical-path detail notes are language-separable. Compact mixed labels such as `Projects / 项目` remain inline mixed-language labels.
- Research interaction semantics: only Research cards with a current public evidence route expose anchors and interactive spotlight styling. The intelligent-algorithms direction has no link, pointer affordance, spotlight, or keyboard stop while its public example remains pending.
- New-tab links: every `target="_blank"` link must include `rel="noopener noreferrer"` and is enforced by `tools/check_site.py`.
- No forms, analytics, tracking scripts, inline event-handler attributes, `javascript:` URLs, backend flows, or private contact collection were introduced.

## Validation Commands

```powershell
git diff --check
python tools/check_site.py
node --check script.js
node --check tools/check-public-browser.js
node --check instrument/instrument.js
node --check tools/check-instrument-browser.js
node tools/check-public-browser.js
node tools/check-instrument-browser.js
npx --yes lighthouse http://127.0.0.1:4174/ "--only-categories=accessibility" --output=json --output-path=reports/lighthouse-a11y-home.json --chrome-flags="--headless=new"
npx --yes lighthouse http://127.0.0.1:4173/instrument/ "--only-categories=performance,accessibility,best-practices,seo" --output=json --output-path=reports/lighthouse-instrument-2026-06-11.json --chrome-flags="--headless=new"
npx --yes @axe-core/cli http://127.0.0.1:4174/ --exit
```

## Results

- 2026-07-13 targeted direct Chromium checks passed for the homepage at 1280 x 900 and 390 x 900: exactly two Research evidence anchors were at least 40px high, the evidence-pending algorithm direction was noninteractive, Build projects preceded the workflow in DOM and visual order, scoped Chinese blocks carried `lang="zh-CN"`, the mobile menu opened from the keyboard and returned focus after Escape, no console errors appeared, and horizontal overflow was `0`.
- 2026-07-13 targeted no-JS Chromium check passed at 390 x 900: `body.no-js` remained present, the inactive hamburger was hidden, five navigation links stayed visible, and horizontal overflow was `0`.
- 2026-07-13 `tools/check_site.py` gained a homepage contract that rejects non-anchor Research link styling, evidence links placed under the wrong Research role, descendants outside the algorithm card's strict static allowlist, role/tabindex/contenteditable/draggable interaction semantics, workflow-before-project ordering, and scoped Chinese copy that is absent, empty, outside its expected container, or missing `lang="zh-CN"`. Six focused Python tests cover the current page plus five negative paths.
- 2026-06-19 follow-up `node tools/check-public-browser.js` passed for `/`, `/404.html`, `/projects/`, `/notes/`, and both published note pages, including mobile structure, horizontal overflow, and sampled touch-target checks at 320px, 375px, 390px, 414px, and 768px; no-JS mobile navigation is now checked across the same width set. It also covers one `h1`, skip link to `#main`, no console errors, mobile menu keyboard open/Escape close, custom 404 content, and reduced-motion parallax guard.
- 2026-06-19 follow-up `/instrument/` mobile review found the `Reset view / 重置视角` and `Reset alignment / 重置对准` 3D toolbar buttons at about 23 px high on a 390 px viewport; the toolbar now enforces a 40 px minimum touch height and `node tools/check-instrument-browser.js` checks the toolbar buttons.
- 2026-06-19 `node tools/check-instrument-browser.js` passed for `/instrument/`: first viewport workbench, WebGL fallback status, fallback label collisions, console errors, mobile overflow, prefers-reduced-motion, language switch, language density, scene overlay language, keyboard activation, no-JS fallback, geometry mode, response-normalized view, classic samples, sample picker, default 3D scene, source-derived panel, source-derived language mode, and module failure fallback.
- 2026-06-19 `python tools/check_site.py` passed for 7 HTML pages, 1 CSS file, `robots.txt`, `sitemap.xml`, and local references.
- 2026-06-19 `tools/check_site.py` now rejects checked HTML pages whose first link is not the `skip-link` to `#main`; temporary negative checks confirmed a homepage link inserted before the skip link fails.
- 2026-06-19 `tools/check_site.py` now rejects checked HTML pages whose `<body>` lacks the `no-js` bootstrap class; temporary negative checks confirmed a homepage `body class="js-enabled"` regression fails.
- 2026-06-19 `tools/check_site.py` now rejects wrong root `<html lang>` values; temporary negative checks confirmed `lang="zh-CN"` on the homepage root fails while `lang="en"` passes.
- 2026-06-19 `tools/check_site.py` now rejects wrong shared stylesheet targets and non-deferred shared `script.js`; temporary negative checks confirmed both regressions are caught.
- 2026-06-19 `tools/check_site.py` now rejects missing `<img>` alt text and non-decorative empty image alt text; temporary negative checks confirmed both failures are caught while explicitly decorative empty-alt images are allowed.
- 2026-06-19 `tools/check_site.py` now rejects inline SVGs that are neither explicitly decorative nor given an accessible name; temporary checks confirmed unlabeled meaningful SVGs fail while `aria-hidden` and titled SVGs pass.
- 2026-06-19 syntax checks passed for `script.js`, `instrument/instrument.js`, and `tools/check-instrument-browser.js`.
- 2026-06-19 live route checks returned `200` for `/`, `/projects/`, `/notes/`, both published note pages, `/instrument/`, `/robots.txt`, `/sitemap.xml`, and `/assets/og-card.png`.
- Post-push Pages run IDs are recorded in the release report for each commit. This checklist records the accessibility baseline and repeatable local/browser gates rather than a single latest deployment number.
- 2026-06-11 `node tools/check-instrument-browser.js` passed for `/instrument/`: first viewport workbench, WebGL fallback status, console errors, mobile overflow, prefers-reduced-motion, language switch, keyboard activation, no-JS fallback, geometry mode, response-normalized view, optional 3D scene, source-derived panel, source-derived language mode, and module failure fallback.
- 2026-06-11 `/instrument/` Lighthouse accessibility score was `100`; the same run reported Performance `86`, Best Practices `100`, and SEO `100`.
- 2026-06-10 `python tools/check_site.py` passed for 6 public HTML pages, `robots.txt`, `sitemap.xml`, and local references.
- 2026-06-10 `git diff --check` passed.
- 2026-06-10 syntax checks passed for shared and Instrument Lab JavaScript modules.
- 2026-06-10 Chrome CDP checks covered the six public HTML pages at 390px, 768px, and 1366px: each page had one `h1`, a skip link to `#main`, no document/body horizontal overflow, no sampled sub-32px visible controls, and no console errors.
- 2026-06-10 note article metadata ARIA labels were paired as `Note metadata / 笔记元信息`, `Reader path / 阅读路径`, and `Continue exploring / 继续阅读`.
- Earlier M6 Lighthouse accessibility score for `/`: `100`.
- Earlier optional axe CLI could not run in this environment because ChromeDriver targeted Chrome 148 while local Chrome was 147. This remains an environment/tooling mismatch, not a confirmed site failure.

## Remaining Manual Checks

- Test with an actual screen reader before a public release if article-level bilingual reading quality becomes important.
- Recheck `/instrument/` with keyboard-only interaction after any future changes to custom SVG controls or Three.js controls. The 2026-06-19 browser QA covered keyboard activation, reduced motion, no-JS fallback, module failure fallback, source-derived language mode, default 3D availability, classic samples, and the sample picker, but it is still automated browser evidence rather than a screen-reader session.
- If compact slash labels become longer, consider replacing them with separate language spans and explicit `lang` attributes.
