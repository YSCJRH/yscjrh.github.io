# Decision: Local Static Three.js For Instrument Lab

Date: 2026-04-25

## Context
The `/instrument/` page had become a useful 2D SVG concept model, but the next milestone is to make the instrument skeleton more spatial and easier to reason about: grating-driven monochromators, 90 degree collection geometry, sample alignment, detector angle, diagnostics, and a clearer separation between synthetic controls and source-derived spectra.

## Decision
Use a local, vendored Three.js ESM bundle only on `/instrument/`.

Included local files:
- `instrument/vendor/three/three.module.js`
- `instrument/vendor/three/three.core.js`
- `instrument/vendor/three/addons/controls/OrbitControls.js`
- `instrument/vendor/three/addons/controls/TransformControls.js`
- `instrument/vendor/three/addons/capabilities/WebGL.js`

The page keeps the existing 2D SVG diagram as a fallback for unavailable WebGL, script failure, and simplified reading.

The vendored control add-ons use relative local imports rather than browser import maps. This keeps the static route easier to serve from GitHub Pages and from the repository's lightweight local server.

Historical runtime note: the initial MVP loaded the Three.js core, `OrbitControls.js`, and `WebGL.js` while reserving `TransformControls.js` for a later phase. The current implementation now imports and instantiates `TransformControls.js` inside `instrument/sim/scene/InstrumentScene.mjs` for bounded source/sample alignment handles. It remains route-local and does not change the static-site architecture decided here.

## Why Not R3F Or Vite Now
- The rest of the site is a static GitHub Pages site with no build step.
- The first 3D milestone is one page, not a reusable app shell.
- Adding React/R3F/Vite would introduce a build chain before the maintenance cost is justified.
- A local ESM module keeps the upgrade narrow and reviewable.

## Boundaries
- No CDN runtime dependency.
- No analytics, forms, backend, secrets, or GitHub Pages setting changes.
- No real instrument control, calibration claim, quantitative performance claim, or manufacturer-specific UI.
- Source-derived data examples remain separate from simulator sliders.
- The 3D payload must stay route-local to `/instrument/`; the homepage and project/notes gateways must not import Three.js.

## Follow-up Gate
Reconsider a build tool only if `/instrument/` accumulates enough reusable components, route-level templates, or data-preprocessing needs that manual static modules become a real maintenance burden.
