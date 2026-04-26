# Content Gaps

These are the missing inputs that would make the homepage more credible without forcing the site to invent proof or overstate progress.

## Current Baseline
- The project gateway is already present on the homepage and `/projects/`.
- The notes hub is public.
- Two notes are public:
  - `notes/build-logs-homepage-second-pass.html`
  - `notes/when-a-fluorescence-signal-becomes-usable.html`
- The Method Notes item is still represented by a draft under `content/notes/`.
- The remaining work is evidence and proof collection, not adding volume for its own sake.

## Priority Order
1. add one public-facing example for each research direction
2. collect creator-side story inputs for the five featured repositories
3. validate project CTA durability and public proof paths
4. decide whether the Method Notes draft should become the next public note
5. align homepage wording with GitHub profile and pinned repositories

## Instrument Lab Follow-up Inputs

The `/instrument/` page is a conceptual visualization only. Future improvements should be based on owner-provided or clearly cited material rather than inferred instrument behavior.

### Current Source-derived Data Baseline
- Added a small public demo data package under `instrument/data/`:
  - Rhodamine 6G emission spectrum from Zenodo DOI `10.5281/zenodo.569817`
  - EGFP emission spectrum from Zenodo DOI `10.5281/zenodo.580169`
  - Fe(II)-DOM sample 01 EEM heatmap from Zenodo DOI `10.5281/zenodo.3737108`
  - NIST fluorescence correction standards as reference-only context, with no embedded or plotted NIST data
- Boundary:
  - these examples are source-derived, normalized, downsampled, and educational
  - they are not site-generated measurements, calibrated spectra, quantitative comparisons, or material optimization results
- Maintenance note:
  - `DATA_SOURCES.md` is now the source-selection and reuse-boundary record for `/instrument/`

### Real Instrument Reference Diagrams
- Needed:
  - safe reference diagrams or owner-provided sketches for the optical path
  - confirmation of which details are appropriate for public explanation
  - optional reference photos or sketches for an open optical bench skeleton, if the 3D model should move beyond a generic teaching layout
- Good input format:
  - `Diagram/source:`
  - `Safe public detail:`
  - `Details to avoid:`

### Validated Spectra Or Example Datasets
- Needed:
  - spectra or example datasets that are explicitly allowed for public use
  - context explaining what the data represents and what it does not prove
  - optional examples for fixed-wavelength time / kinetic scans if the page later moves beyond synthetic traces
  - source-specific caveats for EEM axes, preprocessing, blank subtraction, correction state, and normalization if heatmaps are used for comparison
- Good input format:
  - `Dataset/source:`
  - `Allowed use:`
  - `Caveats:`

### Real-paper Spectrum Intake Protocol
- Needed before material-optimization work:
  - paper citation or DOI
  - material/system name exactly as reported
  - spectrum type, such as excitation, emission, time / kinetic, quantum-yield-related, or stability-related
  - reported excitation wavelength, emission wavelength or range, slit/bandpass if available, solvent/matrix, concentration, instrument conditions, and normalization method
  - whether the spectrum is a primary result, supporting comparison, or illustrative reference
  - what the site may publicly reuse: cited summary, redrawn conceptual trace, digitized numeric approximation, or no public reuse
- Boundaries:
  - do not copy published spectrum figures into the site by default
  - do not claim material optimization, validation, or performance unless the paper directly supports that statement
  - keep digitized curves labeled as approximate and source-derived if they are ever used
  - separate "evidence-backed material insight" from "website visualization improvement"
- Good input format:
  - `Paper/source:`
  - `Material/system:`
  - `Spectrum type:`
  - `Measurement settings:`
  - `What can be reused publicly:`
  - `Optimization insight supported by the source:`
  - `Caveats:`

### Future Workflow Note
- Needed:
  - a short note explaining the fluorescence spectrophotometer workflow in educational terms
  - a clear boundary between conceptual explanation and real measurement practice
  - a short caveat distinguishing fixed-wavelength time scans from fluorescence lifetime measurements
  - a practical explanation of how grating angle, slit width, alignment, and detector geometry affect a teaching model without becoming instrument specifications
  - optional owner-provided wording for beam stop / 光束终止器 so the public explanation is precise but still approachable
  - optional real fixed-wavelength kinetic examples if the page later moves beyond synthetic time traces
  - source-specific EEM caveats before any heatmap is used for comparison rather than display-only context
  - optional owner-reviewed wording for the detector-arm teaching control, especially how to explain 90° collection without implying a calibrated geometry model
- Good input format:
  - `Workflow step:`
  - `Why it matters:`
  - `Public caveat:`

### Possible Open-source Extraction
- Needed:
  - decision on whether the Instrument Lab should remain a website page or become a separate public repository later
  - scope of any reusable visualization code if extracted
- Good input format:
  - `Extraction reason:`
  - `Reusable parts:`
  - `What should stay site-specific:`

## Research Proof

### Fluorescence Analysis
- Needed:
  - one concrete analytical problem or recurring question that can be described safely in public
  - one short line explaining why this problem matters
- Good input format:
  - `Problem:`
  - `Why it matters:`
  - `Safe public wording:`

### Fluorescence Analysis × Intelligent Algorithms
- Needed:
  - one example of how algorithmic workflows help with fluorescence-related interpretation, comparison, or decision support
  - one line clarifying the role of algorithms without implying unpublished results
- Good input format:
  - `Problem:`
  - `What algorithms help with:`
  - `Safe public wording:`

### Fluorescence Instrumentation
- Needed:
  - one safe public description of instrumentation-related thinking or work
  - one line explaining how sensing, control, or method design connect in practice
- Good input format:
  - `System concern:`
  - `Why it matters:`
  - `Safe public wording:`

## Build Story Inputs

Public README support already exists for the baseline function of these repositories.
What is still missing is mostly creator-side context: origin, representative value, and why each repo deserves its current role on the homepage.

### ai-visibility-auditor
- Needed:
  - why this project was made
  - what workflow it improves
  - why it should remain the homepage’s representative project
- Good input format:
  - `Origin:`
  - `Workflow improved:`
  - `Why representative:`

### codex-via-phone
- Needed:
  - what real access or control constraint it responds to
  - what makes the phone-first angle worth exposing publicly
- Good input format:
  - `Constraint:`
  - `Why it matters:`

### skylattice
- Needed:
  - what repo-governance or memory problem it is trying to solve
  - why this belongs on a personal research/build homepage
- Good input format:
  - `Problem:`
  - `Why this repo belongs here:`

### mirror-sim
- Needed:
  - what kind of scenario or exploration it is for
  - what makes it more than a style experiment
- Good input format:
  - `Scenario focus:`
  - `Why it matters:`

### create-double-skill
- Needed:
  - why editable self-modeling matters in the broader research/build identity
  - whether this should stay as a supporting project or move later
- Good input format:
  - `Why it exists:`
  - `Role on homepage:`

## Project Gateway Gaps

This section tracks which projects still need stronger public proof beyond the current gateway.

Some repo-first cards now use README deep links, but they still do not count as dedicated public pages. Treat those links as useful current CTAs, not as permanent proof artifacts.

### Public Pages
- `ai-visibility-auditor`
  - public entry exists
- `skylattice`
  - public docs exist
- `codex-via-phone`
  - still needs a dedicated public page if it should move beyond repo-first entry
- `mirror-sim`
  - still needs a dedicated public page if it should move beyond repo-first entry
- `create-double-skill`
  - still needs a dedicated public page if it should move beyond repo-first entry

### Screenshots
- `ai-visibility-auditor`
  - would benefit from a stable screenshot set for the live report/demo path
- `skylattice`
  - would benefit from screenshots or proof snapshots of the docs and quick-start outcome
- `codex-via-phone`
  - needs first public screenshots if it is to become more than a repo-first card
- `mirror-sim`
  - needs first public screenshots or visual proof
- `create-double-skill`
  - needs first public screenshots or generated-output visuals

### First-Run Proof
- `codex-via-phone`
  - README quick-start and security-model sections are now linkable, but there is still no standalone public first-run proof page
- `mirror-sim`
  - README now exposes a three-minute demo path, but proof is still repo-bound rather than independently public
- `create-double-skill`
  - README first-run and examples sections are linkable, but a cleaner public example path is still missing
- `skylattice`
  - quick start exists, but stronger proof artifacts would make the gateway more persuasive

### Build Logs Or Notes Worth Adding
- `ai-visibility-auditor`
  - build log on why the public demo/report flow matters
- `codex-via-phone`
  - setup or security-model note
- `mirror-sim`
  - concept note or three-minute demo note
- `create-double-skill`
  - first-run note or example-output note
- `skylattice`
  - note on quick-start reasoning or governance model

## Notes Starter Topics

Starter drafts now exist in `content/notes/`.
The notes hub is public at `notes/index.html`.
Two note pages are public and linked from both the homepage and notes hub.
The remaining gap is deciding whether the Method Notes draft should become the next public note, and whether any project-specific build log should be prepared before that.

### Research Reflections
- Current public note:
  - `notes/when-a-fluorescence-signal-becomes-usable.html`
- Helpful inputs:
  - one recurring ambiguity
  - one framing shift
  - one sentence on why the ambiguity matters

### Build Logs
- Current public note:
  - `notes/build-logs-homepage-second-pass.html`
- Helpful inputs:
  - one design or implementation tradeoff
  - one constraint
  - one thing intentionally left out

### Method Notes
- Current status:
  - draft only in `content/notes/method-notes-evidence-first-project-storytelling.md`
- Possible next note:
  - one reusable workflow, heuristic, or rule of thumb worth keeping
- Helpful inputs:
  - the workflow
  - when it helps
  - when it fails

## Public Identity / Contact
- Optional later input:
  - one safe public sentence about what kinds of collaboration are most relevant
- Only add if explicitly desired:
  - one verified public contact path beyond GitHub

## What Should Stay Unchanged Until Better Evidence Exists
- do not add publications, affiliations, patents, awards, or metrics
- do not imply research outcomes that are not already public
- do not add email, institution, location, or social links without explicit confirmation
- do not make Notes sound finished before real notes exist
