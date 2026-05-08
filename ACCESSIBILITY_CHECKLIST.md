# Accessibility Checklist

Status: M6 baseline complete  
Last updated: 2026-05-08  
Local preview used: `http://127.0.0.1:4174/`

This checklist records the current accessibility baseline for the static personal site. It is not a replacement for assistive-technology testing, but it gives future Codex passes a concrete set of checks.

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

- `git diff --check` passed with line-ending warnings only.
- Lighthouse accessibility score for `/`: `100`.
- The initial Lighthouse run exposed accessible-name mismatches caused by redundant `aria-label` attributes on visible brand/GitHub links; those labels were removed and the rerun had no score-0 accessibility audits.
- Optional axe CLI could not run in this environment because ChromeDriver targeted Chrome 148 while local Chrome was 147. This is recorded as an environment/tooling mismatch, not a site failure.

## Remaining Manual Checks

- Test with an actual screen reader before a public release if article-level bilingual reading quality becomes important.
- Recheck `/instrument/` with keyboard-only interaction after any future changes to custom SVG controls or Three.js controls. The 2026-05-08 release pass included mobile menu keyboard flow and route-level Lighthouse coverage for `/instrument/`.
- If compact slash labels become longer, consider replacing them with separate language spans and explicit `lang` attributes.
