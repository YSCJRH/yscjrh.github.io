# Instrument Lab Research Log

This log records the evidence used to change scientific copy, model behavior, source-data handling, and validation boundaries for `/instrument/`.

Rules:

- Every new scientific claim needs a claim ID and an entry here before it becomes public UI or model behavior.
- Entries distinguish teaching approximations from calibrated or quantitative methods.
- Source-derived data remain display-only unless source, license, axes, processing, and claim boundary are verified.
- Do not copy long source text into this file; summarize the evidence and keep the source link.

## Claim ILAB-001: Fluorescence spectrometers commonly use one fixed wavelength selector and one scanned selector for emission and excitation scans

- Date checked: 2026-06-11
- Source(s):
  - NISTIR 7457, "Recommendations and Guidelines for Standardization of Fluorescence Spectroscopy": https://nvlpubs.nist.gov/nistpubs/ir/2007/ir7457.pdf
- Evidence summary: NIST describes conventional fluorescence spectrometers as having excitation and emission wavelength selectors. Fixing excitation and scanning emission gives an emission spectrum; fixing emission and scanning excitation gives an excitation spectrum.
- Implementation boundary: Use this to label scan modes and diagnostics. Do not imply the site measures real spectra or follows a validated NIST procedure.
- Code / UI touched: `instrument/sim/physics/spectrum.mjs`, `instrument/sim/physics/scan.mjs`, `instrument/sim/physics/diagnostics.mjs`, `instrument/index.html`, `instrument/sim/tests/physics.test.mjs`.
- Confidence: high

## Claim ILAB-002: Corrected excitation and EEM displays require excitation-flux and emission-response correction assumptions

- Date checked: 2026-06-11
- Source(s):
  - IUPAC Gold Book, "excitation-emission spectrum": https://goldbook.iupac.org/terms/view/E02249
  - IUPAC Gold Book, "corrected excitation spectrum": https://goldbook.iupac.org/terms/view/C01344/pdf
- Evidence summary: IUPAC defines an excitation-emission spectrum as emission spectra collected at incremental excitation wavelengths. Corrected EES requires emission correction for instrumental wavelength response and constant exciting radiation flux; corrected excitation spectra assume constant incident photon flux plus dilute-solution conditions.
- Implementation boundary: Source-derived EEM examples may be displayed as normalized/downsampled teaching examples. The simulator must not call its EEM or excitation traces "corrected" unless the required correction model is explicitly implemented and bounded.
- Code / UI touched: `instrument/sim/ui/source-data.mjs`, `instrument/data/manifest.json`, `instrument/sim/tests/source-data.test.mjs`.
- Confidence: high

## Claim ILAB-003: Instrument spectral responsivity changes fluorescence spectral shape and must be corrected for quantitative comparison

- Date checked: 2026-06-11
- Source(s):
  - NIST, "Relative Intensity Correction Standards for Fluorescence and Raman Spectroscopy": https://www.nist.gov/programs-projects/relative-intensity-correction-standards-fluorescence-and-raman-spectroscopy
  - NISTIR 7915, "Standard Practice for Determining the Relative Spectral Correction Factors for the Emission Signal of Fluorescence Spectrometers": https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913001
- Evidence summary: NIST states that fluorescence instruments have unique spectral responsivity, so the apparent shape and intensity of a sample can differ between instruments and over time. NISTIR 7915 describes relative emission correction factors for grating-based fluorescence spectrometers and emphasizes wavelength accuracy and detector linear range.
- Implementation boundary: Use this to justify detector-response teaching curves, raw/corrected literacy, and "not calibrated" copy. The response-normalized teaching view divides the raw synthetic trace by normalized teaching source, detector, and geometry response cues to demonstrate correction logic; it is not a calibrated correction and does not embed NIST correction curves. Do not claim calibration unless a specific public data file and reuse boundary are verified.
- Code / UI touched: `instrument/sim/physics/detector.mjs`, `instrument/sim/physics/derive.mjs`, `instrument/sim/physics/spectrum.mjs`, `instrument/sim/physics/diagnostics.mjs`, `instrument/data/manifest.json`, `DATA_SOURCES.md`.
- Confidence: high

## Claim ILAB-004: Slit width and spectral bandpass are linked to spectral resolution, throughput, and wavelength-selector checks

- Date checked: 2026-06-11
- Source(s):
  - NISTIR 7458, "Standard Guide to Fluorescence Instrument Calibration and Correction": https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir7458.pdf
  - NISTIR 7915: https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913001
- Evidence summary: NISTIR 7458 treats spectral slit width accuracy through measured spectral bandwidth and FWHM of a narrow line. NISTIR 7915 notes that correction procedures depend on defined instrument settings and detector linear range.
- Implementation boundary: Slit width may enter a teaching instrument-function model and diagnostics. The mapping from slit micrometers to FWHM must be labeled as a teaching mapping unless real monochromator constants are introduced with evidence.
- Code / UI touched: `instrument/sim/physics/monochromator.mjs`, `instrument/sim/physics/instrumentFunction.mjs`, `instrument/sim/physics/spectrum.mjs`, `instrument/sim/physics/diagnostics.mjs`, `instrument/sim/tests/model-invariants.test.mjs`, `instrument/sim/tests/physics.test.mjs`.
- Confidence: high for qualitative tradeoff; medium for any numeric mapping until the teaching constants are documented.

## Claim ILAB-005: Inner-filter effects can reduce apparent emission yield and distort bandshape

- Date checked: 2026-06-11
- Source(s):
  - IUPAC Gold Book, "inner filter effect": https://goldbook.iupac.org/terms/view/I03047
- Evidence summary: IUPAC defines inner-filter effect as apparent emission quantum-yield decrease or bandshape distortion caused by reabsorption of emitted radiation, and also as absorption of incident radiation by another species during irradiation.
- Implementation boundary: First implementation should use an inner-filter risk diagnostic, not a quantitative correction, unless geometry and absorbance assumptions are added with sources.
- Code / UI touched: `instrument/sim/physics/sample.mjs`, `instrument/sim/physics/artifacts.mjs`, `instrument/sim/physics/diagnostics.mjs`, `instrument/data/samples/*.json`, `instrument/sim/tests/sample-data.test.mjs`.
- Confidence: high for risk language; low for any correction formula until researched separately.

## Claim ILAB-006: Right-angle geometry is a conventional model for dilute transparent samples; front-face and transmission geometries need explicit boundary copy

- Date checked: 2026-06-11
- Source(s):
  - NISTIR 7457: https://nvlpubs.nist.gov/nistpubs/ir/2007/ir7457.pdf
  - HORIBA Fluorolog-3 manual: https://www.horiba.com/fileadmin/uploads/Scientific/Downloads/UserArea/Fluorescence/Legacy/Complete_FluoroLog3_Manual.pdf
- Evidence summary: NISTIR 7457 describes 0/90 right-angle geometry for dilute transparent samples, front-face geometry for optically dense samples, and 0°/180° transmitting geometry as a distinct geometry family. The Fluorolog-3 manual similarly distinguishes right-angle and front-face collection and links front-face use to solid, turbid, or highly absorbent samples.
- Implementation boundary: Keep the current 90-degree view as the default conceptual geometry. Front-face and transmission teaching mode selections may change collection and background risk diagnostics, but they are not manufacturer-specific reconstructions. The transmission mode is a conservative direct-path/background risk teaching boundary, not an implemented inline fluorescence optics model.
- Code / UI touched: `instrument/sim/physics/alignment.mjs`, `instrument/sim/physics/geometry.mjs`, `instrument/sim/physics/derive.mjs`, `instrument/sim/scene/InstrumentScene.mjs`, `instrument/index.html`, `instrument/sim/tests/physics.test.mjs`.
- Confidence: high

## Claim ILAB-007: Scatter and second-order warnings are real operating concerns, but the site should initially present them as diagnostics rather than calibrated artifact curves

- Date checked: 2026-06-11
- Source(s):
  - Thermo Fisher SpectraSYSTEM Fluorescence Detector reference manual: https://documents.thermofisher.com/TFS-Assets/CMD/manuals/Man-A0099-564-SpectraSYSTEM-FL-Fluorescence-Ref-ManA0099564-E-EN.pdf
  - NISTIR 7458: https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir7458.pdf
- Evidence summary: The Thermo manual warns that excitation and emission wavelength choices near scattering conditions can require optical filtering. NISTIR 7458 discusses water Raman and wavelength-selector calibration contexts, showing that scatter features are part of fluorescence-instrument qualification practice.
- Implementation boundary: Add conservative Rayleigh/second-order risk diagnostics before drawing quantitative scatter curves. The artifact display toggle may hide conceptual scatter/background cues from the synthetic trace for teaching clarity, but it is not calibrated artifact subtraction. If Rayleigh/Raman/stray-light components are plotted quantitatively, create separate evidence entries and tests first.
- Code / UI touched: `instrument/sim/physics/artifacts.mjs`, `instrument/sim/physics/spectrum.mjs`, `instrument/sim/physics/diagnostics.mjs`, `instrument/index.html`, `instrument/sim/tests/model-invariants.test.mjs`.
- Confidence: medium for UI warnings; low for plotted component amplitudes until modeled.

## Claim ILAB-008: Teaching source, detector, geometry, artifact, and radiometry modules are normalized placeholders until wired to sourced public UI behavior

- Date checked: 2026-06-11
- Source(s):
  - `refine.md`, sections 4 and 5.
  - NIST relative intensity correction standards: https://www.nist.gov/programs-projects/relative-intensity-correction-standards-fluorescence-and-raman-spectroscopy
  - NISTIR 7915: https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913001
- Evidence summary: `refine.md` calls for an explicit response chain and pure physics modules. NIST sources justify treating detector/source response as important correction factors, but they do not provide this site's teaching preset curves.
- Implementation boundary: `source.mjs`, `detector.mjs`, `geometry.mjs`, `artifacts.mjs`, `instrumentFunction.mjs`, `radiometry.mjs`, `scan.mjs`, and `sample.mjs` are normalized teaching components. Their non-flat preset shapes are qualitative placeholders and are not public evidence of a real lamp, PMT, CCD, silicon detector, or calibrated response curve.
- Code / UI touched: `instrument/sim/physics/source.mjs`, `instrument/sim/physics/detector.mjs`, `instrument/sim/physics/geometry.mjs`, `instrument/sim/physics/artifacts.mjs`, `instrument/sim/physics/instrumentFunction.mjs`, `instrument/sim/physics/radiometry.mjs`, `instrument/sim/physics/scan.mjs`, `instrument/sim/physics/sample.mjs`, `instrument/sim/tests/model-invariants.test.mjs`.
- Confidence: high for placeholder boundary; medium for qualitative shapes; low for any future quantitative use without additional sources.

## Claim ILAB-009: Source-derived examples must declare display-only control binding separately from synthetic simulator controls

- Date checked: 2026-06-11
- Source(s):
  - `refine.md`, sections 2.3 and 6.4.
  - `DATA_SOURCES.md`, "Initial Demo Package" and "Proposed Data Schema".
  - `instrument/data/manifest.json`.
- Evidence summary: The refactor specification requires public source-derived spectra to remain display-only unless source, license, axes, processing, and claim boundary are verified. The current manifest already records DOI/URL, license, source file, processing, and claim boundaries for plotted examples and reference-only entries. During validation, the EGFP processed payload was found to include empty source rows that had been converted to `0` wavelengths; the preprocessing and validation rules now reject empty numeric cells, non-increasing wavelength axes, and mismatched display ranges.
- Implementation boundary: Add machine-readable `claimLevel` and `controlBinding` fields to the source manifest. Use `source-derived-display` only for plotted, normalized/downsampled examples and `reference-only` for unplotted references. Keep `controlBinding: display-only` so UI code and tests can verify that source-derived examples are not controlled by simulator sliders. Axis cleanup fixes processing integrity only; it does not add new scientific interpretation or calibration claims.
- Code / UI touched: `instrument/data/manifest.json`, `instrument/data/processed/egfp-emission.json`, `instrument/sim/ui/source-data.mjs`, `instrument/sim/tests/source-data.test.mjs`, `tools/preprocess-instrument-data.js`, `DATA_SOURCES.md`.
- Confidence: high for the display-only boundary; this does not add new scientific interpretation of the source data.

## Claim ILAB-010: Deterministic noise and headroom cues are teaching placeholders, not a detector-noise model

- Date checked: 2026-06-11
- Source(s):
  - NISTIR 7458, "Standard Guide to Fluorescence Instrument Calibration and Correction": https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir7458.pdf
  - Hamamatsu Photonics PMT FAQ: https://www.hamamatsu.com/us/en/product/optical-sensors/pmt/faq.html
  - Ibsen Photonics, "Understanding noise in spectroscopic detectors": https://ibsen.com/resources/detector-resources/noise-in-detectors/
  - NIST, "Procedure for Benchmarking a Fluorescent Microscope": https://www.nist.gov/video/procedure-benchmarking-fluorescent-microscope
- Evidence summary: NISTIR 7458 treats detector linear range as something that must be determined for an instrument and emphasizes keeping calibration intensities inside that range. Hamamatsu describes PMT dark current as signal present in darkness from tube and environmental mechanisms. Ibsen separates useful signal from dark current and baseline and describes read-noise, shot-noise, and dark-current-limited regimes. NIST microscope benchmarking separately names detection threshold, saturation, and linear dynamic range as measured performance properties.
- Implementation boundary: The current `spectrum.mjs` perturbation is deterministic pseudo-noise seeded from the selected channels, bandpass, and integration time so visual traces are reproducible. The noise display toggle may hide that perturbation from the synthetic trace, but it does not create a real noise-free measurement. `composeRawSignal()` exposes headroom and saturation-risk cues, but it does not model detector-specific dark current, read noise, photon shot noise, photon counting statistics, or a measured linear dynamic range. Do not describe the output as measured SNR, detection limit, or detector saturation.
- Code / UI touched: `instrument/sim/physics/spectrum.mjs`, `instrument/sim/physics/radiometry.mjs`, `instrument/sim/physics/diagnostics.mjs`, `instrument/MODEL.md`, `instrument/sim/tests/evidence-docs.test.mjs`.
- Confidence: high for boundary language; low for quantitative detector-noise claims until a detector-specific model and sourced constants are added.

## Claim ILAB-011: The Gaussian instrument function is a teaching convolution, not a measured monochromator line-spread function

- Date checked: 2026-06-11
- Source(s):
  - NISTIR 7458, "Standard Guide to Fluorescence Instrument Calibration and Correction": https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir7458.pdf
  - HORIBA, "Bandpass and Resolution": https://www.horiba.com/usa/bandpass-resolution/
- Evidence summary: NISTIR 7458 describes spectral slit-width accuracy through measured spectral bandwidth, taken as the FWHM of a single line. HORIBA describes bandpass as the spectral interval isolated by an instrument and notes that it depends on grating width, aberrations, detector spatial resolution, and entrance/exit slit widths.
- Implementation boundary: `instrumentFunction.mjs` uses a normalized Gaussian weighting to smooth teaching spectra so wider slit settings visibly broaden features and lower peak height. This is a qualitative teaching convolution. It is not a measured slit function, not a wavelength-accuracy procedure, not a real monochromator model, and not a claim that the current slit-width-to-FWHM mapping matches a manufacturer instrument.
- Code / UI touched: `instrument/sim/physics/instrumentFunction.mjs`, `instrument/sim/physics/monochromator.mjs`, `instrument/sim/physics/spectrum.mjs`, `instrument/MODEL.md`, `instrument/sim/tests/evidence-docs.test.mjs`.
- Confidence: high for qualitative bandpass/resolution boundary; medium for the teaching Gaussian choice; low for any future quantitative FWHM mapping without instrument constants.

## Open Evidence Backlog

- Source spectra presets: `ideal-flat`, `xenon-like`, and LED presets now declare `claimLevel: synthetic-teaching`, `controlBinding: simulator-control`, `evidenceKey: ILAB-008`, and an explicit not-measured boundary. Add evidence before using real lamp spectra.
- Detector response presets: `ideal-flat`, `pmt-like-visible`, and `silicon-like` now declare `claimLevel: synthetic-teaching`, `controlBinding: simulator-control`, `evidenceKey: ILAB-008`, and an explicit not-measured/not-calibrated boundary. Add evidence before using real detector responsivity curves.
- Noise model: ILAB-010 covers the current deterministic teaching perturbation and headroom boundary. Add a new evidence entry before introducing real shot/read/dark-noise formulas, SNR, detection-limit, or detector-linearity claims.
- Instrument function: ILAB-011 covers the current Gaussian teaching convolution. Add a new evidence entry before claiming a measured slit function, wavelength accuracy, or manufacturer-specific bandpass mapping.
- Sample presets: JSON-backed teaching presets now declare `claimLevel: synthetic-teaching`, `controlBinding: simulator-control`, `evidenceKey: ILAB-008`, and a bilingual not-measured sample boundary. Continue avoiding real material names unless source support is sufficient.
- Source-derived data: keep `instrument/data/manifest.json` as the authority for DOI, license, processing, axes, claim boundaries, `claimLevel`, and display-only control binding.
