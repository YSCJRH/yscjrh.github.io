# Instrument Lab Data Sources

This file records the public data sources that may be used to improve `/instrument/`.
The page remains an educational visualization: source-derived data are normalized, downsampled, and not presented as calibrated measurements from this website.

## Initial Demo Package

| Use | Dataset | License | Intended site use | Processing boundary |
| --- | --- | --- | --- | --- |
| Dye spectrum | Robert Andrew Nyman, [Absorption and Fluorescence spectra of Rhodamine 6G](https://zenodo.org/records/569817), DOI `10.5281/zenodo.569817` | CC BY 4.0 | One normalized Rhodamine 6G emission line example | Suppress narrow room-light spikes reported by the source, bucket-average, clamp at zero, normalize to display a.u.; this is not a corrected reference spectrum. |
| Fluorescent protein spectrum | Mastop, Bindels, Gadella Jr., Goedhart, [Absorption and Emission spectra of fluorescent proteins](https://zenodo.org/records/580169), DOI `10.5281/zenodo.580169` | CC BY 4.0 | One normalized EGFP emission line example | Extract EGFP emission columns, bucket-average, clamp at zero, normalize to display a.u. |
| EEM heatmap | Jia, Manning, Jollymore, Beckie, [Fe(II)-DOM fluorescence dataset](https://zenodo.org/records/3737108), DOI `10.5281/zenodo.3737108` | CC BY 4.0 | One compact excitation-emission matrix heatmap | Use `sample01EEM.txt` and `emission_lambda.txt`; clamp negative values, downsample to a browser-sized heatmap, normalize to display a.u. The source PDF names `excitation_lambda.txt`, but that file is absent from the Zenodo record, so the display excitation axis is explicitly recorded as inferred. |
| Reference / calibration context | NIST, [Relative intensity correction standards for fluorescence and Raman spectroscopy](https://www.nist.gov/programs-projects/relative-intensity-correction-standards-fluorescence-and-raman-spectroscopy) | Not embedded | Reference-only citation for future calibration/correction discussion | No NIST curve is embedded or plotted until an exact public data file and reuse boundary are verified. Do not claim calibration from this entry. |

## Source Triage Categories

Use these statuses before any new public data or material example is embedded:

| Status | Meaning | Public boundary |
| --- | --- | --- |
| `displayable data` | Small numerical data can be processed into local JSON after source, license, axis, and claim review. | Display as source-derived, normalized/downsampled, not calibrated, and not quantitatively comparable. |
| `reference-only` | Source can support teaching copy or caveats, but no curve, table, or figure is embedded. | Cite as context only; do not imply the page applies the method or standard. |
| `teaching context` | Source helps explain an instrument concept, artifact, or sample limitation. | Use short conservative explanations, not copied figures or method claims. |
| `defer` | Source is promising but currently too large, ambiguous, domain-specific, or unclear for public reuse. | Keep in this file until a smaller, licensed, well-described subset exists. |

## Synthetic Teaching Sample Presets

`instrument/data/samples/*.json` stores the simulator's synthetic sample presets. These files are not source-derived spectra and do not claim to represent calibrated materials.

- `claimLevel` is `synthetic-teaching`.
- `controlBinding` is `simulator-control`, so these presets are explicitly controlled by the simulator rather than by source-derived data.
- `evidenceKey` points to the current research-log boundary for normalized teaching placeholders.
- `boundary` is bilingual and states that the preset is synthetic, simulator-controlled, and not a measured sample spectrum.
- `sources` remains an empty array unless a future preset is backed by reviewed source data and a decision record.
- The runtime module `instrument/sim/data/samplePresets.mjs` derives compact legacy profile fields from those teaching presets for the current static ES module simulator.
- Source-derived examples remain indexed by `instrument/data/manifest.json` and stay separate from these simulator controls.

## Candidate Sources And Current Status

| Candidate | Current status | Intended use | Reason / gate before embedding |
| --- | --- | --- | --- |
| PhotochemCAD common compounds spectra | `reference-only` for now | Common-compound context | Useful spectra, but redistribution and site embedding terms must be verified before plotting. |
| NIST fluorescence SRM / correction materials | `reference-only` | Correction-literacy notes: detector response, excitation flux, wavelength accuracy, linearity, standards | No NIST curve is embedded or plotted until exact public data files and reuse boundaries are verified. Do not imply calibration. |
| NIST fluorescence measurement guidance | `teaching context` | Explain why spectra differ between instruments and why corrected spectra need standards | Use as caveat support only; the page does not apply NIST correction procedures. |
| OpenFluor / PARAFAC component references | `reference-only` | Explain that EEM interpretation can involve published components and model context | Do not infer component identity from the current single Fe-DOM EEM display. |
| USGS fDOM field/lab methods and data releases | `teaching context`, possible later `displayable data` | Environmental fluorescence caveats, interferences, QA, possible compact DOM example | Needs exact data package, public-domain/license review, small subset plan, and no source-attribution claim. |
| MDPI/Mendeley EVOO fluorescence EEM ageing dataset | `defer` | Material/food fluorescence teaching example | CC BY 4.0 page exists, but keep deferred until exact file selection, format review, processing notes, and no quality-classification claim are complete. |
| Zenodo DOM storage experiment Aqualog EEM dataset, DOI `10.5281/zenodo.5497806` | `defer` | Later EEM example | CC BY 4.0, but raw `Aqualog.zip` is about 41 MB; do not copy the full dataset into the site. |
| PANGAEA North Sea surface microlayer EEM data | `defer` | Later EEM example | Needs exact license and format review before embedding. |
| Zenodo fluorescence lifetime database, DOI `10.5281/zenodo.11083940` | `reference-only` | Lifetime-specific context only | Current page uses fixed-wavelength time / kinetic scans, not lifetime measurements. |

## Next Teaching Enhancements

- EEM slice explorer: use the existing Fe(II)-DOM processed EEM to show emission or excitation cross-sections. This is display-only and remains separate from synthetic sliders.
- Corrections and artifacts: add short caveat cards for detector response, excitation flux, slit bandpass, Rayleigh/Raman scatter, inner-filter effects, and linearity/saturation.
- Sample and geometry boundaries: clarify that the current right-angle model is useful for clear dilute samples, while dense/turbid/solid samples may require other geometries such as front-face collection.
- Data provenance as UI: show DOI/link, license, source file, processing notes, claim boundary, and reference-only status directly in the page.

## Proposed Data Schema

`instrument/data/manifest.json` is the public index loaded by the page.

Required manifest fields:

- `schemaVersion`
- `generatedAt`
- `disclaimer`
- `datasets[]`

Required dataset fields:

- `id`
- `kind`: `spectrum1d`, `eem`, or `reference`
- `role`
- `label`
- `claimLevel`: `source-derived-display` for plotted source-derived examples, or `reference-only` for unplotted references
- `controlBinding`: currently always `display-only`; source-derived examples must not bind to simulator controls
- optional `teachingTags`
- optional `displayModes`, for example `line`, `eem`, `eem-slice`, or `reference-only`
- optional `defaultSlices` for EEM cross-section controls
- optional `claimBoundary`
- `dataUrl` for plotted data, or `null` for reference-only entries
- `source`: title, creators, DOI if available, URL, license, source file, citation
- `measurement`: mode, sample/context, units
- `axes`: plotted coordinate labels, units, and source/processing notes; inferred axes must be explicitly marked
- `processing`: normalization, downsampling, axis handling, checksum, display-only notes

1D spectrum files contain:

- `x`: wavelength values
- `y`: normalized intensities
- `xUnit: "nm"`
- `yUnit: "normalized a.u."`
- `displayRange`
- `notes`

EEM files contain:

- `excitation`: excitation wavelength axis
- `emission`: emission wavelength axis
- `z`: normalized intensity matrix, shaped as `emission x excitation`
- `zUnit: "normalized a.u."`
- `sourceValueUnit` when known
- `displayRange`
- `notes`

## Preprocessing Plan

- Use `tools/preprocess-instrument-data.js`; it relies only on Node built-ins and creates the static JSON package.
- Do not commit large raw datasets.
- Commit only `instrument/data/manifest.json` and compact processed JSON files.
- Normalize each source-derived example independently unless a source explicitly supports calibrated comparison.
- Validate processed axes as positive, finite, and strictly increasing; display ranges must match axis endpoints.
- Validate plotted examples with `claimLevel: source-derived-display`, `controlBinding: display-only`, axis-handling notes, and source checksums.
- Keep source citations and preprocessing caveats visible on the page.
- Keep source-derived examples separate from the synthetic controls so visitors do not think sliders control real datasets.

## Public Copy Boundary

Allowed:

- "source-derived"
- "normalized/downsampled for educational visualization"
- "not calibrated"
- "not quantitative comparison"

Avoid:

- "validated by"
- "calibrated measurement"
- "instrument-corrected by this site"
- "material optimization result"
- "real-time instrument data"
