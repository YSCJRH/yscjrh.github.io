# Instrument Lab Model Notes

This document describes the current `/instrument/` model and the target direction from `refine.md`. It is a maintainer document, not a calibration manual.

## Public Boundary

The Instrument Lab is a static teaching simulator:

- It is not real instrument control.
- It is not a calibrated measurement system.
- It does not validate real samples or real instrument performance.
- Synthetic controls drive only the synthetic model.
- Source-derived examples are display-only and stay separate from simulator controls.

## Current Model Baseline

Current implementation files:

- State and control writes: `instrument/sim/state.mjs`
- Derived state: `instrument/sim/physics/derive.mjs`
- Grating/wavelength mapping: `instrument/sim/physics/grating.mjs`
- Slit teaching mapping: `instrument/sim/physics/monochromator.mjs`
- Alignment and detector-arm collection: `instrument/sim/physics/alignment.mjs`
- Synthetic teaching sample presets: `instrument/data/samples/*.json` and `instrument/sim/data/samplePresets.mjs`
- Synthetic traces and scan metadata: `instrument/sim/physics/spectrum.mjs`
- Diagnostics: `instrument/sim/physics/diagnostics.mjs`
- Response-chain scaffold: `instrument/sim/physics/source.mjs`, `instrument/sim/physics/detector.mjs`, `instrument/sim/physics/sample.mjs`, `instrument/sim/physics/geometry.mjs`, `instrument/sim/physics/artifacts.mjs`, `instrument/sim/physics/instrumentFunction.mjs`, `instrument/sim/physics/radiometry.mjs`, `instrument/sim/physics/scan.mjs`
- 3D/2D scene bridge: `instrument/sim/scene/InstrumentScene.mjs`
- Source-derived examples: `instrument/sim/ui/source-data.mjs` and `instrument/data/manifest.json`

The current synthetic chain is compact:

```text
state
  -> grating angles produce selected excitation/emission wavelengths
  -> slit width produces teaching bandpass and throughput
  -> source alignment and detector angle scale intensity/background risk
  -> synthetic sample preset data supplies excitation/emission Gaussian-mixture teaching shape
  -> responseChain exposes normalized source, sample, geometry, detector, artifact, and signal terms
  -> spectrum.mjs generates a normalized synthetic trace
  -> diagnostics.mjs emits short bilingual status cards with research-log evidence keys
```

This is useful as a conceptual skeleton. As of 2026-06-11, `deriveInstrument()` exposes a bounded `responseChain`, and source/detector teaching response factors affect the synthetic trace. Sample, source, and detector presets carry machine-readable synthetic-teaching boundaries so they cannot be mistaken for measured sample spectra, lamp curves, or hardware responsivity. The chain is still teaching-level and is composed with deliberately simplified scan-shape terms, so it must not be presented as a calibrated radiometric model.

The 2026-06-11 response-chain scaffold is now connected to derived state, diagnostics evidence keys, the synthetic trace, and the single-point monitor. The single-point mode is anchored directly to `responseChain.signal.raw`. The emission scan now composes its main fluorescence term through `composeRawSignal()` at each scanned emission wavelength, while keeping the existing teaching emission shape, scattering, blank/background, deterministic noise, and fixed y-scale behavior. The excitation scan now composes its main fluorescence term through `composeRawSignal()` at each scanned excitation wavelength, while keeping the existing teaching excitation shape, fixed emission channel, scattering, blank/background, deterministic noise, and fixed y-scale behavior. Time scan now takes its fixed-channel signal amplitude from `composeRawSignal()` and applies the existing settle, decay, ripple, and deterministic-noise teaching dynamics on top. It remains a synthetic fixed-channel kinetic-style trace, not a fluorescence lifetime model.

The main workbench now labels the compact alignment/geometry readout explicitly and uses `responseChain.geometry.collectionFactor` for the geometry value when the response chain is available. Detector-arm offset diagnostics are separately labeled as local arm perturbations rather than as the geometry mode itself. The remaining detector-arm helper is exposed as `derived.detectorArm`, so code-level naming no longer presents the local arm response as the geometry-mode collection factor.

The spectrum display now has two teaching views. `raw` remains the default and plots the raw synthetic trace. `response-normalized` keeps the same `rawY` values in each point, then divides the displayed curve by bounded teaching source, detector, and geometry response cues. This is correction literacy only: it shows why instrument response matters, but it is not a NIST-style corrected spectrum, not a calibrated correction, and not a quantitative comparison tool.

Inner-filter risk is currently a categorical teaching diagnostic covered by `ILAB-005`. The sample module can classify risk from the selected teaching preset, but the simulator does not apply an inner-filter correction, does not model absorbance-path geometry, and must not describe this cue as a quantitative correction.

The geometry selector exposes right-angle, front-face, and transmission teaching modes. `ILAB-006` covers the right-angle/front-face distinction and records NISTIR 7457's 0°/180° transmitting geometry reference. The current transmission mode is a direct-path/background-risk teaching boundary that changes collection/background diagnostics; it is not an implemented inline optical design and does not move selected wavelengths. The 2D fallback diagram and optional 3D scene now switch between geometry-specific teaching cues for these three modes; those cues are visual boundaries, not ray-traced reconstructions of front-face or inline optics.

## Noise, Headroom, And Instrument Function Boundaries

The current trace uses deterministic noise in `spectrum.mjs`, not unseeded random noise. The seed is derived from the selected excitation/emission channels, teaching bandpass, and integration time so the same control state produces the same visible perturbation. This keeps the browser demo reproducible and testable. It is a visual teaching perturbation only; it is not a detector-specific shot-noise, read-noise, dark-current, SNR, limit-of-detection, or photon-counting model.

The advanced display toggles can hide the deterministic noise cue and the conceptual scatter/background artifact cue from the plotted synthetic trace. These are display controls for teaching clarity. They do not imply a real noise-free measurement, a calibrated artifact subtraction, or a change to source-derived examples.

`composeRawSignal()` uses a compact multiplicative response chain plus baseline/background terms to produce a raw synthetic intensity and a saturation/headroom cue. The cue warns that the plotted trace is near the fixed teaching display scale. It must not be read as a measured detector linear range or real saturation threshold.

`instrumentFunction.mjs` uses a Gaussian instrument-function weighting as a teaching convolution. It is currently wired into the emission scan sample component: wider slit settings broaden the instrument-function sample component before the final raw teaching trace is composed. The excitation scan uses a simplified width broadening shortcut in the teaching excitation shape rather than the same Gaussian convolution path. The Gaussian choice, simplified width broadening, and slit-width-to-FWHM mapping are not a measured monochromator line-spread function, not a wavelength-accuracy check, and not a manufacturer-specific bandpass model.

## Inner-filter Risk Boundary

The current sample response exposes a categorical inner-filter risk cue from `concentrationRelative`, the declared sample preset risk, and normalized absorption at the selected excitation wavelength. This uses research-log evidence key `ILAB-005`.

The cue is teaching guidance only. Medium or high risk can produce an `Inner-filter risk / 内滤风险` diagnostic explaining that excitation attenuation and reabsorption may distort intensity or bandshape. It is not a quantitative correction, not an absorbance calculation, not a geometry-specific inner-filter formula, and not a claim that the synthetic trace has been corrected for a real sample.

## Target Response Chain

The next stable model should make these factors explicit and testable:

```text
source spectrum
  -> excitation monochromator bandpass
  -> sample absorption / brightness
  -> fluorescence generation
  -> geometry collection
  -> emission monochromator bandpass
  -> detector spectral responsivity
  -> electronics, saturation, integration, noise
  -> raw synthetic trace
  -> optional conceptual correction view
```

The target chain is teaching-level unless a future decision record documents calibrated constants and data reuse rights.

## Required Modeling Boundaries

- `source spectrum`: normalized teaching spectrum unless a source and license are recorded.
- `excitation/emission monochromator`: teaching bandpass and throughput model; not a manufacturer-specific optical reconstruction.
- `sample absorption / emission`: synthetic presets unless source-derived and license-reviewed.
- `inner-filter risk`: categorical diagnostic only; no quantitative correction without additional sourced geometry and absorbance assumptions.
- `geometry`: 90-degree default; front-face/transmission modes need separate diagnostics and boundary copy.
- `detector response`: normalized teaching responsivity; not a specific PMT/CCD/silicon detector curve unless sourced.
- `noise/artifacts`: deterministic and reproducible by default; no random unseeded UI changes.
- `correction view`: correction literacy only unless required NIST/IUPAC-style correction assumptions are implemented.

## Current Verification Baseline

Fresh baseline from 2026-06-11:

- `node --check instrument/instrument.js`: passed.
- `node --test instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs`: 17 tests passed.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs`: 20 tests passed after adding the response-chain scaffold.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs`: 23 tests passed after wiring `responseChain`, source/detector trace factors, and diagnostic evidence keys.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs instrument/sim/tests/ui-contract.test.mjs`: 25 tests passed after adding advanced source, detector, and geometry controls to the simulator workbench.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs instrument/sim/tests/ui-contract.test.mjs`: 29 tests passed after routing geometry mode into the synthetic trace and surfacing response-chain diagnostics for source, detector, geometry, artifacts, and signal headroom.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs instrument/sim/tests/ui-contract.test.mjs instrument/sim/tests/sample-data.test.mjs`: 31 tests passed after moving teaching sample presets into static JSON plus a runtime data module.
- `node --test instrument/sim/tests/physics.test.mjs`: 20 tests passed after anchoring the single-point monitor to `responseChain.signal.raw`.
- `node --test instrument/sim/tests/model-invariants.test.mjs`: 4 tests passed after adding source/detector preset boundary metadata for `claimLevel`, `controlBinding`, `evidenceKey`, and placeholder wording.
- `node --test instrument/sim/tests/physics.test.mjs`: 21 tests passed after routing the emission scan main fluorescence term through `composeRawSignal()` per scanned emission wavelength.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs instrument/sim/tests/sample-data.test.mjs instrument/sim/tests/ui-contract.test.mjs`: 45 tests passed after the emission-scan response-chain slice.
- `node --test instrument/sim/tests/physics.test.mjs`: 22 tests passed after routing the excitation scan main fluorescence term through `composeRawSignal()` per scanned excitation wavelength.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs instrument/sim/tests/sample-data.test.mjs instrument/sim/tests/ui-contract.test.mjs`: 46 tests passed after the excitation-scan response-chain slice.
- `node --test instrument/sim/tests/physics.test.mjs`: 23 tests passed after routing the time scan fixed-channel signal amplitude through `composeRawSignal()` while preserving teaching dynamics.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs instrument/sim/tests/sample-data.test.mjs instrument/sim/tests/ui-contract.test.mjs`: 47 tests passed after the time-scan response-chain baseline slice.
- `node --test instrument/sim/tests/physics.test.mjs`: 24 tests passed after separating detector-arm offset diagnostics from geometry-mode diagnostics.
- `node --test instrument/sim/tests/ui-contract.test.mjs`: 9 tests passed after routing the compact workbench geometry readout through `responseChain.geometry.collectionFactor` and separating advanced geometry copy.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs instrument/sim/tests/sample-data.test.mjs instrument/sim/tests/ui-contract.test.mjs instrument/sim/tests/evidence-docs.test.mjs`: 54 tests passed after synchronizing public sample preset options from shared runtime data while preserving the no-JS fallback.
- `node --test instrument/sim/tests/sample-data.test.mjs`: 2 tests passed after adding sample preset `controlBinding`, `evidenceKey`, and bilingual not-measured boundary metadata.
- `node --test instrument/sim/tests/ui-contract.test.mjs`: 14 tests passed after synchronizing source, detector, and sample preset select options from shared runtime data while preserving no-JS fallback order.
- `node --test instrument/sim/tests/ui-contract.test.mjs`: 14 tests passed after extending shared preset synchronization to geometry mode and aligning the runtime geometry label with the no-JS fallback.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs instrument/sim/tests/sample-data.test.mjs instrument/sim/tests/ui-contract.test.mjs instrument/sim/tests/evidence-docs.test.mjs`: 62 tests passed after adding deterministic noise and conceptual artifact display toggles plus busy-state diagnostic prioritization.
- `node --test instrument/sim/tests/model-invariants.test.mjs instrument/sim/tests/physics.test.mjs instrument/sim/tests/source-data.test.mjs instrument/sim/tests/sample-data.test.mjs instrument/sim/tests/ui-contract.test.mjs instrument/sim/tests/evidence-docs.test.mjs`: 64 tests passed after wiring the Gaussian teaching instrument function into the emission scan sample component, documenting excitation scan simplified width broadening, and exposing component-level spectrum assertions.
- `node --test instrument/sim/tests/*.mjs`: 76 tests passed after adding source-derived axes facts, preprocessing validation for structured axes metadata, and visible mobile fallback WebGL status coverage.
- Local Chrome DevTools Protocol browser check passed for the advanced display toggles: disabling both cues changed the synthetic trace, showed the paired hidden-cue diagnostics, and kept the WebGL status live region active.
- `node tools/preprocess-instrument-data.js --validate`: passed.
- `python tools/check_site.py`: passed for 6 public HTML pages plus `robots.txt`, `sitemap.xml`, and local references.
- `git diff --check`: passed.
- `node --test instrument/sim/tests/*.mjs`: 96 tests passed after completing the final `refine.md` DoD audit, first-screen 2D/optional-3D copy contract, optical-path language-mode contract, dynamic diagnostic evidence-key coverage, and response-normalized browser QA coverage.
- `node tools/preprocess-instrument-data.js --validate`: passed for the final closeout data package.
- `python tools/check_site.py`: passed for the final closeout public site check.
- `node tools/check-instrument-browser.js`: passed for first viewport workbench, WebGL fallback status, console errors, mobile overflow, prefers-reduced-motion, language switch, keyboard activation, no-JS fallback, geometry mode, response-normalized view, optional 3D scene, source-derived panel, source-derived language mode, and module failure fallback.
- `docs/instrument-refine-final-audit-2026-06-11.md`: records the requirement-by-requirement `refine.md` section 9 closeout crosswalk.

## Next Model Slices

1. Continue decomposing hard-coded teaching sample profiles only if future source or governance needs justify moving more runtime sample data into separate data records.
