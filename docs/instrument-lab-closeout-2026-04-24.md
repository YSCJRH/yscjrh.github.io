# Instrument Lab Closeout - 2026-04-24

## Scope
- Added `/instrument/` as a static concept demo for the fluorescence spectrophotometer workflow.
- Integrated the page from the homepage hero shortcut area and the Fluorescence Instrumentation research card.
- Kept the implementation static: HTML, shared CSS, and page-local vanilla JavaScript.

## Scientific Framing
- The page is a conceptual visual model only.
- It is not real instrument control software.
- It is not a calibrated simulator or validated measurement tool.
- Synthetic traces are educational placeholders and should not be treated as material evidence.

## Implemented Behavior
- Right-angle fluorescence collection geometry:
  - blue excitation axis into the sample
  - dim straight-through residual path to a beam stop
  - cyan side emission collection arm through the emission monochromator
  - detector-to-spectrum connection as a signal path, not an optical beam
- Three conceptual modes:
  - Emission scan
  - Excitation scan
  - Time / kinetic scan
- Controls:
  - excitation wavelength
  - emission wavelength/range
  - slit width
  - integration time
  - sample preset
- Six part hotspots with short explanations.
- Fixed synthetic y-scale so blank/background cases remain visibly weak.
- Reduced-motion support for animated beams.

## QA Summary
- `node --check instrument\instrument.js` passed.
- `git diff --check` passed, with Windows CRLF warnings only.
- Local reachability checks returned 200 for:
  - `/`
  - `/instrument/`
  - `/projects/`
  - `/notes/`
  - shared CSS, JS, favicon, and instrument script
- Structural check found no duplicate IDs and no missing `aria-labelledby` references in `instrument/index.html`.
- Browser/CDP checks covered desktop, tablet, and 360px mobile.
- 360px mobile had no horizontal overflow after the title-width adjustment.
- `prefers-reduced-motion: reduce` disabled beam animation.

## Files In Scope
- `instrument/index.html`
- `instrument/instrument.js`
- `styles.css`
- `index.html`
- `PLANS.md`
- `CONTENT_GAPS.md`

## Remaining Gaps
- No real spectra are used yet.
- No paper-derived material insight is published yet.
- No real instrument reference diagram is embedded.
- No claim of calibration, validation, material optimization, or experimental performance should be added without source evidence.

## Next Phase Candidate
The next phase should be evidence intake from real papers or owner-provided spectra. For each source, capture:
- citation or DOI
- material/system
- spectrum type
- measurement settings
- public reuse boundary
- source-supported optimization insight
- caveats

Prefer cited summaries, redrawn conceptual traces, or source-labeled approximate data over copying published spectrum figures.
