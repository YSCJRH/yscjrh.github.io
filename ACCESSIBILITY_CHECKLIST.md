# Accessibility Checklist

Status: 2026-06-10 refreshed baseline complete
Last updated: 2026-06-10
Latest local preview used: `http://127.0.0.1:4180/`

This checklist records the current accessibility baseline for the static personal site. It is not a replacement for assistive-technology testing, but it gives future Codex passes a concrete set of checks. The 2026-06-10 refresh includes the published Instrument Lab scroll-boundary fix and note metadata bilingual cleanup.

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
- Bilingual language semantics: full-sentence Chinese blocks with `*-zh` classes now carry `lang="zh-CN"`. Compact mixed labels such as `Projects / 项目` remain inline mixed-language labels.
- No forms, analytics, tracking scripts, backend flows, or private contact collection were introduced.

## Validation Commands

```powershell
git diff --check
npx --yes lighthouse http://127.0.0.1:4174/ "--only-categories=accessibility" --output=json --output-path=reports/lighthouse-a11y-home.json --chrome-flags="--headless=new"
npx --yes @axe-core/cli http://127.0.0.1:4174/ --exit
```

## Results

- 2026-06-10 `python tools/check_site.py` passed for 6 public HTML pages, `robots.txt`, `sitemap.xml`, and local references.
- 2026-06-10 `git diff --check` passed.
- 2026-06-10 syntax checks passed for shared and Instrument Lab JavaScript modules.
- 2026-06-10 Chrome CDP checks covered the six public HTML pages at 390px, 768px, and 1366px: each page had one `h1`, a skip link to `#main`, no document/body horizontal overflow, no sampled sub-32px visible controls, and no console errors.
- 2026-06-10 note article metadata ARIA labels were paired as `Note metadata / 笔记元信息`, `Reader path / 阅读路径`, and `Continue exploring / 继续阅读`.
- Earlier M6 Lighthouse accessibility score for `/`: `100`.
- Earlier optional axe CLI could not run in this environment because ChromeDriver targeted Chrome 148 while local Chrome was 147. This remains an environment/tooling mismatch, not a confirmed site failure.

## Remaining Manual Checks

- Test with an actual screen reader before a public release if article-level bilingual reading quality becomes important.
- Recheck `/instrument/` with keyboard-only interaction after any future changes to custom SVG controls or Three.js controls. The 2026-05-08 release pass included mobile menu keyboard flow and route-level Lighthouse coverage for `/instrument/`; the 2026-06-10 refresh covered route-level DOM, overflow, and console behavior.
- If compact slash labels become longer, consider replacing them with separate language spans and explicit `lang` attributes.
