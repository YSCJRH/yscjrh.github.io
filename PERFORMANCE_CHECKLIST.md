# Performance And SEO Checklist

Status: 2026-06-10 refreshed baseline complete
Last updated: 2026-06-10
Latest local preview used: `http://127.0.0.1:4180/`

## Scope

Core public pages:

- `/`
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
- `sitemap.xml` `lastmod` values were refreshed to `2026-06-10` after the published visual, metadata, and Instrument Lab fixes.
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
npx --yes lighthouse http://127.0.0.1:4174/ "--only-categories=performance,seo,best-practices" --output=json --output-path=reports/lighthouse-seo-perf-home.json --chrome-flags="--headless=new"
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:4174/robots.txt
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:4174/sitemap.xml
```

## Results

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
