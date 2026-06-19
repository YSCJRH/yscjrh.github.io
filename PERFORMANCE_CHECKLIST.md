# Performance And SEO Checklist

Status: 2026-06-19 public route, 404 fallback, `/instrument/`, sitemap, and release evidence refreshed
Last updated: 2026-06-19
Latest local preview used: `http://127.0.0.1:4173/instrument/`

## Scope

Core public pages:

- `/`
- `/404.html`
- `/projects/`
- `/notes/`
- `/notes/build-logs-homepage-second-pass.html`
- `/notes/when-a-fluorescence-signal-becomes-usable.html`
- `/instrument/`

## SEO Baseline

- Each HTML page has a descriptive `<title>`.
- Each HTML page has a meta description.
- Each public page has a canonical URL.
- Open Graph title, description, type, URL, site name, locale, and image metadata are present.
- Twitter large-image card metadata is present.
- Shared social image: `assets/og-card.png`, 1200 x 630.
- Favicon: `assets/favicon.svg`.
- `robots.txt` exists and disallows `/review/`.
- `sitemap.xml` exists and excludes `/review/`.
- `404.html` exists as a custom bilingual fallback, is checked for metadata/local references, and is intentionally excluded from `sitemap.xml`.
- `sitemap.xml` keeps the shared public pages at `2026-06-10`; `/instrument/` is refreshed to `2026-06-19` after the published default-3D, language-mode, classic-sample, and sample-picker interaction releases.
- The former `/review/` internal review route is retired from the deployable tree.
- JSON-LD was intentionally not added because encoding personal identity facts should wait until About content is more stable.
- `feed.xml` was intentionally deferred; current published notes are few enough that a feed maintenance flow would add more overhead than value.

## Performance Baseline

- Static site with no build step and no third-party analytics or tracking scripts.
- Shared CSS: `styles.css`.
- Shared JS: `script.js`, deferred.
- Route-scoped heavier JavaScript is limited to `/instrument/`.
- Images are SVG or small static PNG assets; the share card is about 80 KB.
- Reduced-motion CSS and JS handling remain in place.

## Validation Commands

```powershell
git diff --check
python tools/check_site.py
node --check script.js
node --check instrument/instrument.js
node --check tools/check-public-browser.js
node --check tools/check-instrument-browser.js
node tools/preprocess-instrument-data.js --validate
node tools/check-public-browser.js
node tools/check-instrument-browser.js
npx --yes lighthouse http://127.0.0.1:4174/ "--only-categories=performance,seo,best-practices" --output=json --output-path=reports/lighthouse-seo-perf-home.json --chrome-flags="--headless=new"
npx --yes lighthouse http://127.0.0.1:4173/instrument/ "--only-categories=performance,accessibility,best-practices,seo" --output=json --output-path=reports/lighthouse-instrument-2026-06-11.json --chrome-flags="--headless=new"
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:4174/robots.txt
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:4174/sitemap.xml
```

## Results

- 2026-06-19 `python tools/check_site.py` passed for 7 HTML pages, `robots.txt`, `sitemap.xml`, and local references, with `/404.html` checked but excluded from `sitemap.xml`.
- 2026-06-19 `node tools/check-public-browser.js` passed for `/`, `/404.html`, `/projects/`, `/notes/`, and both published note pages, including the custom 404 content marker, no-JS mobile navigation, mobile keyboard menu behavior, desktop/mobile overflow checks, and reduced-motion guard.
- 2026-06-19 `node tools/preprocess-instrument-data.js --validate` passed for the 65,160 byte instrument data package.
- 2026-06-19 syntax checks passed for `script.js`, `instrument/instrument.js`, and `tools/check-instrument-browser.js`.
- 2026-06-19 `git diff --check` passed during this checklist refresh with only Windows line-ending normalization warnings.
- 2026-06-19 `node tools/check-instrument-browser.js` passed for first viewport, WebGL fallback, fallback label collisions, console errors, mobile overflow, reduced motion, language switching, keyboard activation, no-JS fallback, geometry mode, response-normalized view, classic samples, sample picker, default 3D scene, source-derived examples, source-derived language mode, and module-failure fallback.
- 2026-06-19 live route checks returned `200` for `/`, `/404.html`, `/projects/`, `/notes/`, both published note pages, `/instrument/`, `/robots.txt`, `/sitemap.xml`, and `/assets/og-card.png`; an unknown route returned HTTP `404` with the custom bilingual fallback content.
- 2026-06-19 GitHub Pages reported `built` from `main` and deployment `27801068726` for commit `66a8e30` completed successfully before this checklist refresh.
- 2026-06-11 `/instrument/` Lighthouse on local preview:
  - Performance: `86`
  - Accessibility: `100`
  - Best Practices: `100`
  - SEO: `100`
  - LCP: `3.2 s`
  - CLS: `0`
  - TBT: `60 ms`
  - Report artifact: `reports/lighthouse-instrument-2026-06-11.json` (ignored local QA output).
- 2026-06-11 `/instrument/` Lighthouse opportunities were shared static CSS unused on the single route, local-server text compression/cache lifetime, and render-blocking CSS. These are recorded as static-site tradeoffs, not blockers, because the project intentionally has no build pipeline and no route-specific CSS bundling.
- 2026-06-10 `python tools/check_site.py` passed for 6 public HTML pages, `robots.txt`, `sitemap.xml`, and local references.
- 2026-06-10 `git diff --check` passed.
- 2026-06-10 local and live route checks returned `200` for `/`, `/projects/`, `/notes/`, both published note pages, `/instrument/`, `/robots.txt`, `/sitemap.xml`, and `/assets/og-card.png`.
- 2026-06-10 local and live `/review/` checks returned `404`; the former internal review route remains absent from the deployable tree, excluded from `sitemap.xml`, and disallowed in `robots.txt`.
- 2026-06-10 external link check returned `200` for 20 checked GitHub, GitHub Pages, NIST, and USGS URLs.
- 2026-06-10 metadata presence check passed for title, description, canonical, favicon, Open Graph, and Twitter Card fields on all checked HTML pages.
- 2026-06-10 note article share-card alt metadata was updated to the current bilingual `fluorescence, methods, instruments, and open tools / 荧光、方法、仪器与开放工具` wording.
- Earlier M7 Lighthouse score for `/`:
  - Performance: `99`
  - Best Practices: `100`
  - SEO: `100`
- Lighthouse listed CSS minification, unused CSS, local-server text compression/cache lifetime, and render-blocking CSS as opportunities. These are not treated as blockers for the static v1 site because there is no build pipeline and the requested scope forbids framework/tooling migration.
