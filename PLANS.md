# Current Phase: Homepage Entry Hierarchy Correction

## Goal
- Keep Instrument Lab visible as a secondary concept model rather than a primary homepage feature.
- Preserve AnswerLens, Skylattice, and the broader Projects / Build path as the main public project entries.
- Avoid adding Instrument Lab to top navigation or the featured Build grid until it has its own repo, docs, or release path.

## Implementation Notes
1. Keep the hero shortcut, but demote its visual treatment and keep it last in the shortcut order.
2. Keep the strongest contextual entry under the Fluorescence Instrumentation research card.
3. Use restrained wording such as "Explore concept model / 查看概念模型" instead of product-like language.
4. Do not change `/instrument/` functionality or scientific content in this hierarchy pass.

## Validation
1. Check homepage desktop and mobile hierarchy in the browser.
2. Confirm `/projects/` still focuses on public repositories and project workflows.
3. Verify no new public claims, dependencies, tracking, or external services were introduced.

---

# Previous Phase: Instrument Lab Source-derived Data Layer

## Goal
- Add a small, cited data layer to `/instrument/` without changing the conceptual demo into a calibrated simulator.
- Keep the existing synthetic scan model as the default interaction.
- Load only local, compact, processed JSON under `/instrument/data/`; do not fetch Zenodo, NIST, or other external sources at page runtime.

## Implementation Notes
1. Add `DATA_SOURCES.md` as the public maintainer record for recommended, deferred, and reference-only fluorescence data sources.
2. Create `instrument/data/manifest.json` plus small processed JSON examples:
   - one Rhodamine 6G emission spectrum
   - one EGFP emission spectrum
   - one Fe(II)-DOM EEM heatmap
   - one NIST reference-only calibration/correction entry with no plotted data
3. Add a source-derived examples panel to `/instrument/` that is visually and behaviorally separate from the synthetic scan controls.
4. Every displayed source example must show DOI/source/license/preprocessing caveats.
5. Do not claim calibration, quantitative comparability, material optimization, or real instrument measurement.

## Validation
1. Run the preprocessing validator.
2. Run JavaScript syntax checks.
3. Check local `/instrument/` in the browser for synthetic fallback, 1D spectra, EEM heatmap, citations, mobile layout, and console errors.

---

# Previous Phase: Instrument Lab Concept Demo - Closed

## Goal
- Add a static `/instrument/` route that visualizes the conceptual workflow of a fluorescence spectrophotometer.
- Make the instrumentation direction easier to understand without claiming real instrument control, calibration, validation, or manufacturer-specific UI behavior.
- Keep the site GitHub Pages friendly: static HTML, shared CSS, and small vanilla JavaScript only.

## Current Status
- The homepage, `/projects/`, `/notes/`, two note pages, and `/review/` are live.
- The homepage exposes an Instrument Lab entry point from the hero shortcut area and the Fluorescence Instrumentation research card.
- The new page is treated as a concept demo rather than a mature open-source project.
- The current Instrument Lab implementation has passed local syntax, link, responsive, reduced-motion, and 360px overflow checks.
- The main risk is overclaiming scientific accuracy, so all synthetic data and diagrams must be explicitly framed as conceptual.
- The optical layout refinement should emphasize the common right-angle fluorescence collection geometry: excitation travels along the incident axis, while emission is collected from a perpendicular side arm.

## Closure Notes
- This phase is now feature-complete for the conceptual website demo.
- The page should not receive more visual complexity until there is a clear evidence-backed reason.
- Future scientific upgrades should be evidence-driven: real-paper spectra, owner-provided spectra, or clearly cited datasets should inform the next pass.
- The current synthetic traces remain educational placeholders, not material evidence, calibration data, or performance claims.

## Next Candidate Phase: Real-paper Spectra Evidence Intake
1. Collect source papers or owner-provided references before changing the model.
2. For each spectrum, record citation, material/system, measurement mode, wavelength settings, sample context, and what may be reused publicly.
3. Prefer transformed, clearly cited numerical summaries or redrawn conceptual traces over copying published figures.
4. Keep any future material optimization language conservative unless the source supports it directly.
5. If the next phase changes public claims or introduces source-derived data, add a dated documentation note before publishing.

## Phase 1A: Scientific Geometry Refinement
1. Keep the diagram original and conceptual, but align it with the owner-provided light-path reference and public spectrofluorometer descriptions.
2. Show the remaining incident excitation path as stopped or rejected rather than routed toward the detector.
3. Render the detector-to-spectrum connection as an electronic/synthetic signal path, not as another optical beam.
4. Keep visual beams straight and uncluttered so the page remains educational for first-time visitors.

## Phase 1B: Dual-audience Teaching Refinement
1. Address fluorescence-expert review findings:
   - rename plain time scan to fixed-wavelength `Time / kinetic scan`
   - keep time scan distinct from fluorescence lifetime measurement
   - use a shared fixed y-scale so weak and blank traces remain visibly weak
   - decouple excitation beam brightness from detected synthetic signal
   - keep blank/background traces as baseline plus small scatter/background, not a real fluorescence band
2. Address ordinary-user review findings:
   - add a three-step onboarding strip for first-run comprehension
   - show which monochromator is scanning or fixed for each mode
   - add short help text for slit width, integration time, and sample presets
   - simplify mobile diagram labels while preserving the 90-degree workflow
3. Keep all new wording conservative: synthetic traces are illustrative only and do not represent calibrated spectra, real samples, or instrument validation.

## Phase 1: Concept Demo Implementation
1. Create `/instrument/` with:
   - a simplified fluorescence spectrophotometer chain
   - animated excitation and emission paths
   - mode selector for emission scan, excitation scan, and time / kinetic scan
   - conceptual controls for wavelength, slit width, integration time, and sample preset
   - synthetic spectrum output that responds to controls
   - hotspots and short explanations for each instrument part
2. Use SVG and vanilla JavaScript; do not add Canvas, WebGL, Three.js, a framework, or a build step.
3. Include the disclaimer: "Conceptual model only. Not real instrument control. Not calibrated measurement."

## Phase 2: Homepage Integration
1. Add a hero shortcut to `/instrument/` labeled "Instrument Lab / Instrument Visualization".
2. Link the "Fluorescence Instrumentation" research card to `/instrument/`.
3. Do not list the page as a mature Build project in this pass.

## Phase 3: QA
1. Preview locally with `python tools/serve.py`.
2. Use the Codex in-app browser to check:
   - `/`
   - `/instrument/`
   - `/projects/`
   - `/notes/`
3. Verify no console errors, no horizontal mobile overflow, visible focus states, reduced-motion behavior, and working homepage links.

## Deliverables
- `/instrument/index.html`
- `/instrument/instrument.js`
- updated shared CSS for instrument-specific layout and visuals
- homepage entry links
- updated evidence gaps for future real diagrams, validated spectra, workflow note, and possible repo extraction

## Constraints
- No framework, package manager, Pages setting, analytics, tracking, external service, form, backend, secret, or domain changes.
- No claims of calibrated measurement, scientific accuracy, real instrument control, validation, manufacturer compatibility, usage metrics, affiliations, awards, publications, or contact methods.
- Do not copy a commercial instrument interface or imply a protected manufacturer design.

---

# Previous Phase: Governance Sync And Evidence QA

## Goal
- Keep the repository documentation aligned with the current public site surface.
- Validate the homepage, project gateway, notes pages, and public CTAs without changing site claims.
- Preserve the static GitHub Pages architecture until there is clear evidence that manual HTML maintenance is too costly.

## Current Status
- The project gateway upgrade has landed on the homepage and `/projects/`.
- The visual depth pass has landed and is live; the next visual work should be targeted QA or small refinements, not another broad redesign.
- The live/public site surface now includes `/`, `/projects/`, `/notes/`, two note pages, and `/review/`.
- `/review/` is treated as a live but unindexed internal review surface until the owner decides otherwise.
- The main remaining content gap is evidence, not layout: safe research examples, project origin/workflow context, screenshots, and first-run proof.

## Phase 1: Documentation Baseline Sync
1. Update maintainer-facing docs to reflect the current surface:
   - homepage
   - projects hub
   - notes hub
   - two published notes
   - noindex review surface
2. Mark older intake notes as historical when they predate the current release surface.
3. Re-baseline `CONTENT_GAPS.md` so it tracks remaining evidence gaps instead of already-shipped structure.

## Phase 2: Public Surface Verification
1. Verify local static resolution for shared CSS, JS, SVG assets, and internal page links.
2. Verify live reachability for:
   - `https://yscjrh.github.io/`
   - `https://yscjrh.github.io/projects/`
   - `https://yscjrh.github.io/notes/`
   - both published note pages
   - `https://yscjrh.github.io/review/`
3. Verify primary project CTAs and record brittle README fragment links as maintenance risks.

## Phase 3: Browser QA
1. Preview locally with `python tools/serve.py`.
2. Check desktop and narrow mobile layouts for:
   - sticky header anchor behavior
   - mobile navigation
   - project card readability
   - note page readability
   - visible focus states
3. Record results in a dated verification note rather than changing page copy during QA.

## Phase 4: Evidence Intake
1. Collect owner-provided, safe public examples for the three research directions.
2. Collect origin/workflow/representative-role inputs for the five featured repositories.
3. Only after those inputs exist, consider homepage or project-card copy updates.

## Deliverables
- updated maintainer docs
- dated public surface verification note
- explicit provisional decision for `/review/`
- clear remaining evidence gaps

## Constraints
- No framework, package manager, or Pages setting changes.
- No invented metrics, users, customers, awards, affiliations, research results, or contact methods.
- No public copy strengthening without a trustworthy source.
- No removal of `/review/` without an explicit owner decision.
