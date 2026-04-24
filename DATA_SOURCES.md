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

## Deferred Sources

| Candidate | Status | Reason to defer |
| --- | --- | --- |
| PhotochemCAD common compounds spectra | Citation/reference candidate only | Useful common-compound spectra, but redistribution and site embedding terms must be verified before use. |
| MDPI/Mendeley EVOO fluorescence EEM ageing dataset | Candidate for later material/story examples | Domain-specific and needs license, format, and reuse-boundary review before embedding. |
| Zenodo DOM storage experiment Aqualog EEM dataset, DOI `10.5281/zenodo.5497806` | Candidate for later EEM examples | CC BY 4.0, but raw `Aqualog.zip` is about 41 MB; do not copy the full dataset into the site. |
| USGS McKenzie River Basin absorbance/EEM/PARAFAC data | Candidate for later environmental-fluorescence context | Needs exact data package, public-domain/license review, and a small-subset extraction plan. |
| PANGAEA North Sea surface microlayer EEM data | Candidate for later EEM examples | Needs exact license and format review before embedding; likely better as a later domain example. |
| OpenFluor PARAFAC component reference | Interpretation/reference candidate | Useful for component context, but not a raw first-pass spectrum package. |
| Zenodo fluorescence lifetime database, DOI `10.5281/zenodo.11083940` | Reference candidate only | The current page uses fixed-wavelength time / kinetic scans, not fluorescence lifetime measurements. Use only if a lifetime-specific explanation is added. |

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
- `dataUrl` for plotted data, or `null` for reference-only entries
- `source`: title, creators, DOI if available, URL, license, source file, citation
- `measurement`: mode, sample/context, units
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
