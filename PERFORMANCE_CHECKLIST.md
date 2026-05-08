# Performance And SEO Checklist

Status: M7 baseline complete  
Last updated: 2026-05-08  
Local preview used: `http://127.0.0.1:4174/`

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

- `git diff --check` passed with line-ending warnings only.
- `robots.txt`, `sitemap.xml`, and `assets/og-card.png` returned `200` from local preview.
- Metadata presence check passed for title, description, canonical, favicon, Open Graph, and Twitter Card fields on all checked HTML pages.
- `/review/` is not present as an HTML page in the deployable tree; it remains excluded from `sitemap.xml` and disallowed in `robots.txt`.
- Lighthouse score for `/`:
  - Performance: `99`
  - Best Practices: `100`
  - SEO: `100`
- Lighthouse listed CSS minification, unused CSS, local-server text compression/cache lifetime, and render-blocking CSS as opportunities. These are not treated as blockers for the static v1 site because there is no build pipeline and the requested scope forbids framework/tooling migration.
