# Instrument Lab Refine Final Audit

- Date: 2026-06-11
- Scope: `/instrument/` Fluorescence Instrument Lab
- Spec: `refine.md`
- Status: Satisfied

This is a closeout evidence crosswalk for the long-running `refine.md` reconstruction. It is not a usability study, not a calibration report, and no calibrated measurement is claimed. It is not a scientific validation of the synthetic model. It records whether the current static site satisfies the requested teaching-simulator Definition of Done with current repository evidence.

## Validation Evidence

Fresh closeout commands used for this audit:

- `node --check instrument/instrument.js`
- `node --check tools/check-instrument-browser.js`
- `node --test instrument/sim/tests/*.mjs`
- `node tools/preprocess-instrument-data.js --validate`
- `python tools/check_site.py`
- `node tools/check-instrument-browser.js`
- `git diff --check`

Current validation result after the final closeout edits:

- JavaScript syntax checks passed.
- Full Instrument Lab test suite passed.
- Instrument data package validation passed.
- Site sanity check passed for the six public HTML pages, `robots.txt`, `sitemap.xml`, and local references.
- Browser QA passed for first viewport workbench, WebGL fallback status, console errors, mobile overflow, prefers-reduced-motion, language switch, keyboard activation, no-JS fallback, geometry mode, response-normalized view, optional 3D scene, source-derived panel, source-derived language mode, and module failure fallback.
- `git diff --check` passed, with only expected Windows line-ending normalization warnings when applicable.

## refine.md 9.1 Product Experience

Verdict: Satisfied.

Evidence:

- The first viewport exposes the interactive workbench rather than only a text explanation: `tools/check-instrument-browser.js` checks `.instrument-workstation`, mode/control presence, diagnostics, spectrum trace, and viewport intersection.
- The first-screen copy now separates the default 2D fallback from optional 3D dragging. Users are told to use visible controls and part buttons first, then enable optional 3D to drag monochromator grating handles.
- The control-to-consequence loop is visible through wavelength controls, mode buttons, diagnostics, beam colors, spectrum trace, and source-derived separation. The browser QA checks the live workbench and response-normalized interaction; model/UI tests check wavelength, geometry, response-chain, component overlay, and diagnostic updates.
- Synthetic traces and source-derived examples are separated in UI and tests. Source-derived examples remain under a separate panel, use `controlBinding: display-only`, and are verified by `source-data.test.mjs` and browser QA.
- Explanation density is moved into structured disclosures and panels: model boundary, corrections/artifacts, source-derived examples, and optical path notes.
- Language display is supported by `English`, `中文`, and `Both / 双语` modes. Runtime source-derived cards, diagnostics, selected-part guidance, and long optical-path detail notes use language-separable copy.

Boundary:

- The “30 seconds understand” criterion is not a human comprehension study. The current evidence is a heuristic product review plus browser checks proving that the first viewport contains the workbench, concise operation steps, controls, diagnostics, and spectrum feedback.

## refine.md 9.2 Scientific Model

Verdict: Satisfied at the requested teaching v1 level.

Evidence:

- `instrument/MODEL.md` documents the current response chain and public boundary.
- Modular physics files cover grating/wavelength selection, monochromator bandpass/throughput, source response, detector response, sample presets, geometry response, artifacts, instrument function, radiometry, scan axes, diagnostics, and spectrum generation.
- `deriveInstrument()` exposes `responseChain` and routes source, sample, geometry, detector, signal, and artifact terms into diagnostics and the synthetic trace.
- Slit width affects throughput, teaching bandpass, diagnostics, and spectrum shape through the instrument-function convolution tests.
- Excitation scan is tested as response-chain composition over scanned excitation wavelengths, not as a pure sample-response curve.
- Time / kinetic scan is documented and tested as a fixed-channel synthetic intensity trace, not fluorescence lifetime.
- Inner-filter effect remains a categorical risk diagnostic under `ILAB-005`, not a quantitative correction.
- Geometry modes affect collection/background risk, 2D fallback cues, optional 3D cues, and diagnostics without moving selected wavelengths.
- Response-normalized view is correction literacy only. It is not a calibrated correction.

Boundary:

- The simulator remains a conceptual, normalized teaching model. It is not a calibrated measurement, not real instrument control, and not a manufacturer-specific reconstruction.

## refine.md 9.3 Evidence And Documentation

Verdict: Satisfied.

Evidence:

- `docs/instrument-research-log.md` exists and records `ILAB-001` through `ILAB-012` with sources, evidence summaries, implementation boundaries, touched code/UI, and confidence.
- `instrument/MODEL.md` explains formulas, response-chain boundaries, deterministic noise, instrument function, geometry modes, source-derived separation, and verification history.
- `docs/decisions/2026-06-11-instrument-lab-refine-scope.md` records the major reconstruction decision, static-site boundary, source/data constraints, and final-audit requirement.
- `instrument/data/manifest.json` records source-derived dataset claim level, control binding, source URL/DOI, license, source file, axes, processing, checksum, and claim boundary.
- `tools/preprocess-instrument-data.js --validate` verifies the compact source-derived data package.
- `evidence-docs.test.mjs`, `source-data.test.mjs`, `sample-data.test.mjs`, and `model-invariants.test.mjs` verify that teaching cards, diagnostics, manifests, geometry presets, sample presets, source presets, and detector presets carry conservative boundaries and evidence keys.

Boundary:

- Reference-only sources such as NIST correction materials are not plotted. Source-derived examples are display-only and separate from synthetic controls.

## refine.md 9.4 Engineering Quality

Verdict: Satisfied.

Evidence:

- The site remains static: no React, Vite, npm app, backend, analytics, forms, authentication, or runtime public data fetches were introduced.
- `/instrument/` uses route-local ES modules and local static JSON data.
- JavaScript syntax checks pass for the route entry and browser QA tool.
- Model functions are covered by focused tests and invariant tests. Current tests cover finite outputs, 200-900 nm wavelength clamping, invalid control handling, monotonic grating mapping, response-chain composition, deterministic display behavior, source-derived data validity, and no-JS fallback parity.
- `node tools/preprocess-instrument-data.js --validate` passes for the source-derived data package.
- `python tools/check_site.py` passes for the public site.
- `node tools/check-instrument-browser.js` passes with zero normal-load console errors under the checked browser path.

Boundary:

- Browser QA is automated evidence. It does not replace manual assistive-technology testing or a formal user study.

## refine.md 9.5 Accessibility And Performance

Verdict: Satisfied for the static-site scope.

Evidence:

- Core controls are native buttons, range inputs, selects, checkboxes, or details/summary controls with labels and units.
- Keyboard QA covers mode activation and SVG part marker activation.
- The language switch is disabled until JavaScript enables it, preventing misleading no-JS controls.
- Long explanatory panels, diagnostics, source-derived runtime cards, and optical path details now expose language-separable copy with substantial Chinese spans marked `lang="zh-CN"`.
- The 2D fallback SVG carries accessible labeling, and the optional 3D model is explicitly optional.
- `prefers-reduced-motion` is checked in browser QA and reflected in page state.
- Mobile overflow is checked in browser QA.
- Module failure and no-JS fallback are checked in browser QA; the static concept route remains usable without the route module.
- `ACCESSIBILITY_CHECKLIST.md` records the 2026-06-11 `/instrument/` refine evidence and Lighthouse accessibility score.

Boundary:

- Actual screen-reader testing remains a future manual check if article-level bilingual reading quality becomes critical.

## refine.md 9.6 Truth Boundary

Verdict: Satisfied.

Evidence:

- Public boundary copy states conceptual model only, not real instrument control, and not calibrated measurement.
- Diagnostics, model notes, teaching cards, and source-derived metadata avoid calibrated, validated, measured-performance, material-optimization, or real-control claims.
- Synthetic controls drive only the synthetic model.
- Source-derived examples are display-only and do not respond to simulator controls.
- Reference-only correction sources are not embedded, plotted, or used to claim calibration.
- Sample presets are synthetic teaching presets with `controlBinding: simulator-control`, not measured sample spectra.
- Geometry, source, detector, noise, instrument-function, inner-filter, and response-normalized views all carry conservative teaching boundaries.

Boundary:

- Future additions involving real spectra, detector curves, calibration factors, quantitative inner-filter formulas, Raman/scatter curves, sample chemistry, or data reuse must add a new research-log entry and tests before public UI changes.

## Remaining Non-Blocking Notes

- The closeout satisfies the current `refine.md` Definition of Done for a static teaching simulator. It does not claim scientific validation, calibration, or real instrument performance.
- The first-viewport comprehension criterion has strong interface and browser evidence, but it is still not a controlled user test.
- Future work can reduce duplicated historical validation logs, but that cleanup is not required for the simulator to meet the current DoD.
