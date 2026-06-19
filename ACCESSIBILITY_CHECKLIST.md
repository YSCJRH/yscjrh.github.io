# Accessibility Checklist

Status: 2026-06-19 `/instrument/` interaction and language-mode evidence refreshed
Last updated: 2026-06-19
Latest local preview used: `http://127.0.0.1:4173/instrument/`

This checklist records the current accessibility baseline for the static personal site. It is not a replacement for assistive-technology testing, but it gives future Codex passes a concrete set of checks. The 2026-06-19 refresh includes the published Instrument Lab default-3D, single-language display, classic sample, sample picker, and sample-picker reveal passes.

## Scope

Core pages checked:

- `/`
- `/projects/`
- `/notes/`
- `/notes/build-logs-homepage-second-pass.html`
- `/notes/when-a-fluorescence-signal-becomes-usable.html`
- `/instrument/`

## Checks

- Heading structure: each core page has one main `<h1>` and section headings are present in a readable order.
- Skip link: each core page has a skip link that targets `#main`.
- Focus visible: global `:focus-visible` styles are present for links, buttons, mobile nav, project links, footer links, and instrument controls.
- Keyboard navigation: mobile menu opens from the toggle, moves focus into the menu, closes with Escape, and returns focus to the toggle.
- Mobile menu ARIA: toggle uses `aria-expanded`, `aria-controls="mobile-menu"`, and paired English / Chinese label text.
- Touch targets: sampled first-viewport links and buttons at 320px, 375px, 414px, and 768px are at least 40px in both dimensions after the M5 notes-link fix.
- Color contrast: Lighthouse accessibility audit reported no contrast failures on the homepage.
- Images and decorative graphics: decorative generated visuals are `aria-hidden`; meaningful SVG diagrams use accessible labels or titles where present.
- Reduced motion: CSS includes `prefers-reduced-motion: reduce`; JavaScript disables reveal/parallax dependence when reduced motion is requested.
- Bilingual language semantics: full-sentence Chinese blocks with `*-zh` classes or `[data-language="zh"]` spans carry `lang="zh-CN"`. Instrument optical-path detail notes are language-separable. Compact mixed labels such as `Projects / 项目` remain inline mixed-language labels.
- No forms, analytics, tracking scripts, backend flows, or private contact collection were introduced.

## Validation Commands

```powershell
git diff --check
python tools/check_site.py
node --check script.js
node --check instrument/instrument.js
node --check tools/check-instrument-browser.js
node tools/check-instrument-browser.js
npx --yes lighthouse http://127.0.0.1:4174/ "--only-categories=accessibility" --output=json --output-path=reports/lighthouse-a11y-home.json --chrome-flags="--headless=new"
npx --yes lighthouse http://127.0.0.1:4173/instrument/ "--only-categories=performance,accessibility,best-practices,seo" --output=json --output-path=reports/lighthouse-instrument-2026-06-11.json --chrome-flags="--headless=new"
npx --yes @axe-core/cli http://127.0.0.1:4174/ --exit
```

## Results

- 2026-06-19 `node tools/check-instrument-browser.js` passed for `/instrument/`: first viewport workbench, WebGL fallback status, fallback label collisions, console errors, mobile overflow, prefers-reduced-motion, language switch, language density, scene overlay language, keyboard activation, no-JS fallback, geometry mode, response-normalized view, classic samples, sample picker, default 3D scene, source-derived panel, source-derived language mode, and module failure fallback.
- 2026-06-19 `python tools/check_site.py` passed for 6 public HTML pages, `robots.txt`, `sitemap.xml`, and local references.
- 2026-06-19 syntax checks passed for `script.js`, `instrument/instrument.js`, and `tools/check-instrument-browser.js`.
- 2026-06-19 live route checks returned `200` for `/`, `/projects/`, `/notes/`, both published note pages, `/instrument/`, `/robots.txt`, `/sitemap.xml`, and `/assets/og-card.png`.
- 2026-06-19 Pages deployment `27801068726` for commit `66a8e30` completed successfully before this checklist refresh.
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
