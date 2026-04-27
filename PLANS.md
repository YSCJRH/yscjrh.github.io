# Current Phase: Instrument Lab Teaching Depth And Causal Hints

## Goal
- Move `/instrument/` from a feature-complete 3D teaching skeleton toward a more legible cause-and-effect teaching instrument.
- Keep the static Three.js architecture and the educational boundary: no real instrument control, no calibrated measurement, no validated simulator claim, and no manufacturer UI.
- Improve four visitor-facing weak points: operation discoverability, monochromator cause-and-effect, misalignment feedback, and source-derived EEM framing.

## Implementation Notes
1. Clarify current baseline and vendor notes:
   - TransformControls is now an active bounded alignment dependency for `/instrument/`
   - the page remains static and local to GitHub Pages
2. Improve operation discovery:
   - add a lightweight scene hint near the 3D panel
   - add part-specific hints for source, sample, detector, monochromators, and output
   - make the advanced geometry summary explicitly mention detector angle
3. Deepen teaching visuals without adding claims:
   - make the selected monochromator band and slit opening more visible
   - make source/sample misalignment dim or disturb the optical feedback more clearly
   - make detector-angle deviation visibly connect to collection/background diagnostics
4. Keep source-derived examples secondary:
   - keep the Fe(II)-DOM EEM as a processed educational display
   - do not add an `eemPreview` main simulator mode until state, axes, caveats, and tests are specified

## Validation
1. Run syntax checks and unit tests for grating, slit, alignment, detector angle, scan modes, blank/background, and single-point behavior.
2. Preview `/instrument/` in desktop and narrow layouts with Browser Use.
3. Confirm selected-part hints, detector handle, misalignment feedback, and EEM wording are visible and not overstated.
4. Confirm no CDN runtime dependency, analytics, form, secret, personal data, or new public scientific claim was introduced.

---

# Previous Phase: Instrument Lab Causal Readability And Detector/EEM Refinement

## Goal
- Move `/instrument/` from a feature-complete 3D teaching skeleton toward a clearer optical-causal explainer.
- Keep the static Three.js architecture and the educational boundary: no real instrument control, no calibrated measurement, no validated simulator claim, and no manufacturer UI.
- Improve three visitor-facing weak points: first-glance optical path readability, detector/emission-arm causality, and source-derived EEM discoverability.

## Implementation Notes
1. Refine the 3D teaching stage:
   - use shorter floating labels and let the side legend carry longer explanations
   - show residual excitation as a dim segmented path that terminates in the beam stop
   - keep excitation, emission, and detector-to-spectrum signal visually distinct
2. Add detector-arm direct manipulation:
   - select detector to reveal a bounded 80-100 degree arm handle
   - default stays 90 degree collection
   - detector-angle changes collection/background diagnostics and signal strength, not selected wavelength or sample peak position
3. Clarify scan and spectrum semantics:
   - keep emission, excitation, time / kinetic, and single-point modes
   - make single-point readout a fixed Ex/Em intensity level rather than a pseudo time trace
   - keep fixed synthetic a.u. / not calibrated visible in the chart chrome
4. Improve source-derived examples:
   - expose spectra and EEM through clear dataset cards in addition to the select control
   - keep source-derived examples separate from simulator sliders
   - keep DOI, license, preprocessing, and reference-only caveats visible

## Validation
1. Run syntax checks and unit tests for grating, slit, alignment, detector angle, scan modes, blank/background, and single-point behavior.
2. Preview `/instrument/` in desktop and narrow layouts with Browser Use.
3. Confirm the detector handle is bounded, the beam stop reads as absorption, and EEM remains a processed source-derived example.
4. Confirm no CDN runtime dependency, analytics, form, secret, personal data, or new public scientific claim was introduced.

---

# Previous Phase: Instrument Lab Causal Teaching Controls

## Goal
- Move `/instrument/` from a usable 3D teaching skeleton toward a clearer causal instrument model.
- Prioritize visual correctness before adding complexity: the beam stop must read as an absorbing beam dump, not a reflector, mirror, or grating.
- Keep the page as an educational simulation, not real instrument control, calibrated measurement, validated scientific software, or manufacturer UI.

## Implementation Notes
1. Refine the optical bench visual language:
   - beam stop as a dark non-reflective absorber that terminates the residual excitation path
   - monochromator cutaways with slits, mirrors, teaching grating, dispersion fan, and selected band
   - no reflected beam from the beam stop and no decorative particle effects
2. Add bounded direct manipulation for source/sample alignment:
   - use local Three.js `TransformControls`
   - constrain movement to a small teaching offset
   - keep sliders synchronized with 3D dragging
   - moving source/sample affects intensity/overlap, not selected wavelength
3. Improve user hierarchy:
   - keep 90 degree fluorescence collection as the default mental model
   - move detector-arm perturbation into an advanced geometry area
   - keep mode, grating angle, slit width, sample preset, and integration time as the primary controls
4. Extend scan modes conservatively:
   - keep emission, excitation, and time / kinetic scan
   - add single-point monitor as a fixed Ex/Em teaching readout
   - keep EEM/source-derived data separate from simulator sliders

## Validation
1. Run JavaScript syntax checks and unit tests for grating, slit, alignment, detector angle, scan modes, blank/background, and single-point behavior.
2. Preview `/instrument/` locally in desktop, tablet, 390px, and 360px layouts.
3. Confirm the beam stop cannot be read as a mirror/grating and that the residual excitation beam terminates there.
4. Confirm no CDN runtime dependency, analytics, form, secret, personal data, or new public scientific claim was introduced.

---

# Previous Phase: Instrument Lab Static Three.js Skeleton

## Goal
- Upgrade `/instrument/` from a 2D SVG concept diagram into a local, static Three.js teaching skeleton.
- Keep the page as an educational simulation, not real instrument control, calibrated measurement, or validated scientific software.
- Preserve the existing 2D SVG as a fallback and keep source-derived data examples separate from synthetic controls.

## Implementation Notes
1. Use local vendored Three.js ESM only for `/instrument/`; do not add React, R3F, Vite, npm scripts, or a site-wide build chain.
2. Add a single state source and pure physics modules for:
   - grating angle to selected wavelength
   - slit width to bandpass/throughput
   - source/sample alignment to intensity overlap
   - detector arm angle to collection/background risk
   - scan mode to spectrum axis and fixed-channel labels
3. Use a 3D open optical bench as the primary visual when WebGL is available:
   - source -> excitation monochromator -> sample -> beam stop
   - 90 degree emission arm -> emission monochromator -> detector -> spectrum
   - detector-to-display is a signal line, not an optical beam
4. Keep the current source-derived spectra/EEM package as a separate cited examples area. These examples are not controlled by the simulator sliders.
5. Maintain conservative wording: conceptual, source-derived, normalized, downsampled, not calibrated, not quantitative comparison.

## Validation
1. Run syntax checks for the entry module and scene/UI modules.
2. Run unit tests for grating wavelength, slit bandpass/throughput, alignment, scan mode, detector angle, and blank/background behavior.
3. Preview `/instrument/` locally and check desktop, tablet, 390px, and 360px layouts.
4. Confirm no CDN runtime dependency, analytics, form, secret, or new public claim was introduced.

---

# Previous Phase: Homepage Entry Hierarchy Correction

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
Status: completed and superseded by the current local Three.js teaching-skeleton phase.

1. Create `/instrument/` with:
   - a simplified fluorescence spectrophotometer chain
   - animated excitation and emission paths
   - mode selector for emission scan, excitation scan, and time / kinetic scan
   - conceptual controls for wavelength, slit width, integration time, and sample preset
   - synthetic spectrum output that responds to controls
   - hotspots and short explanations for each instrument part
2. Original v1 constraint: use SVG and vanilla JavaScript; do not add Canvas, WebGL, Three.js, a framework, or a build step. This constraint applied to the first concept demo only. The current phase intentionally upgrades `/instrument/` with local vendored Three.js while still avoiding frameworks, package managers, CDNs, and a site-wide build step.
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
