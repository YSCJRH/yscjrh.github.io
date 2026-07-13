# Homepage Generated Hero Illustration Design

- Date: 2026-07-13
- Status: Visual direction approved by the user; written specification awaiting user review
- Scope: homepage Hero illustration, responsive image delivery, caption semantics, and focused visual/performance QA

## Goal

Replace the current abstract CSS-built Hero scene with one calm, legible scientific editorial illustration. Once visible, the new visual should make fluorescence instrumentation recognizable at a glance without implying a real device, experiment, spectrum, or research result.

The change must preserve the homepage's current research-builder positioning, bilingual public interface, static architecture, section order, and evidence boundaries.

## Current Problem

The current desktop Hero visual is assembled from more than twenty decorative elements in `index.html` and a large group of `.lab-*` rules in `styles.css`. It combines an optical path, microscope-like form, slide, nodes, spectrum card, haze, and grid effects. This creates several problems:

- no single object reads as the focal point;
- diagram, interface, and still-life visual grammars compete with one another;
- purple haze and low contrast weaken the site's calm, precise character;
- the overlaid bilingual note competes with the synthetic spectrum card;
- the separate mobile CSS decoration does not preserve the same visual subject as desktop.

The replacement is a focused visual change, not a broader homepage redesign.

## Approaches Considered

### A. Editorial fluorescent sample-cell still life — selected

Use a semi-realistic 3D scientific editorial illustration centered on one fluorescent sample cell. Show a restrained excitation path and perpendicular collection path with only the optical components needed to explain the scene.

This direction gives the Hero a clear subject, matches the fluorescence-instrumentation identity, and remains visibly conceptual rather than pretending to be a documentary lab photograph.

### B. Real laboratory photography — rejected

A photographic scene could feel immediate, but a generated or stock-looking laboratory image risks implying a real instrument, laboratory, institution, or experimental setup associated with the owner. It would also make factual provenance and future visual consistency harder to maintain.

### C. Detailed optical-bench cutaway — rejected

A cutaway diagram could explain more components, but it would repeat the current density problem and shift the homepage toward an instrument manual. Detailed teaching remains the role of the bounded `/instrument/` route.

## Approved Visual Direction

### Subject and light path

- Make one transparent cuvette or generic sample cell the unmistakable focal point.
- Place the cell on a matte graphite optical bench with restrained neutral-metal fixtures.
- Send one violet-blue excitation beam into the cell from the left.
- Show cyan-teal fluorescence in the cell and a perpendicular collection path leading toward one compact, unbranded detector module.
- Keep supporting optics minimal and physically legible; do not add a microscope, slide, floating UI card, spectrum chart, network nodes, or decorative apparatus.

### Style and palette

- Use a semi-realistic 3D scientific editorial illustration, not a laboratory photograph and not a flat schematic.
- Keep the background graphite black with matte surfaces and controlled reflections.
- Use cyan-teal as the main emitted-light color and violet-blue only for the excitation path and limited reflections.
- Avoid broad purple fog, neon cyberpunk treatment, glossy SaaS-style gradients, and excessive bloom.
- Preserve enough local contrast for the sample cell, light paths, and detector to remain readable at mobile size.

### Composition

- Place the sample-cell center within `x = 40–60%` and `y = 35–65%` of the master canvas. Keep every essential part of the excitation and collection paths within `x = 15–85%` and `y = 20–80%` so both crops remain viable.
- Reserve low-detail breathing room around the edges so the master can support both 5:4 and 16:9 crops.
- Use a three-quarter, slightly elevated camera angle that shows the cell volume and the perpendicular light paths without making the apparatus look like a specific commercial product.
- Keep the visual hierarchy to three levels: sample cell first, light paths second, supporting bench and detector third.

## Truthfulness and Generation Contract

The illustration is a concept image. It must not be presented as a photograph, experiment record, calibrated optical model, commercial instrument, or research result.

The generated image must not contain:

- text, letters, numbers, labels, logos, watermarks, brand marks, model names, or scale markings;
- spectra, plots, readouts, numerical data, code, notebooks, or screen interfaces;
- people, institutions, recognizable laboratories, or recognizable commercial instruments;
- claims about performance, sensitivity, wavelength, geometry, or measurement quality;
- impossible duplicated components, malformed sample-cell geometry, disconnected beams, or a collection path that does not read as perpendicular to excitation.

The user-supplied screenshot is diagnostic context for what should be replaced. It is not an image-editing source and should not be reproduced inside the new artwork.

## Generation and Asset Contract

Create one landscape master at no less than 1536 × 1024 pixels with the central-safe composition above, then derive three optimized WebP assets from the same image:

| View | File | Dimensions | Crop | Target size |
|---|---|---:|---:|---:|
| Desktop | `assets/img/hero-fluorescence-desktop-v1.webp` | 1200 × 960 | 5:4 | at most 200 KiB |
| Tablet | `assets/img/hero-fluorescence-tablet-v1.webp` | 1280 × 720 | 16:9 | at most 150 KiB |
| Mobile | `assets/img/hero-fluorescence-mobile-v1.webp` | 720 × 405 | 16:9 | at most 90 KiB |

Derive tablet and mobile images by cropping the approved master, not by stretching it or generating unrelated scenes. Do not overwrite the unused historical `assets/img/hero-lab.svg`; use the versioned filenames above and leave deletion of unrelated legacy assets outside this scope.

The parent agent approves the master only after inspecting it at full size against the asset-review checklist in this specification. This is an internal production gate, not a claim of publication or separate user approval. Only approved, optimized web assets should remain in the committed public tree. Do not add an external image URL, CDN, font, script, package manager, or build step.

## Markup and Responsive Delivery

Replace the decorative `.lab-*` element tree with a single semantic `<figure>` containing:

1. one `<picture>` element;
2. mobile and tablet `<source>` elements selected by the existing `780px` and `1100px` breakpoints;
3. one desktop `<img>` fallback with explicit intrinsic dimensions and `decoding="async"`;
4. one bilingual `<figcaption>` outside the image surface.

Use this accessible image description:

> Conceptual illustration of a fluorescent sample cell and perpendicular light paths / 荧光样品池与垂直光路的概念插图

Use this visible caption boundary with separate language spans:

```html
<figcaption>
  <span>Concept illustration, not an experimental record.</span>
  <span lang="zh-CN">概念插图，非实验记录。</span>
</figcaption>
```

The same figure must remain visible on desktop, tablet, and mobile. Remove the separate `.hero-mobile-visual` decoration rather than maintaining two different subjects or duplicate meaningful images. On mobile, the figure follows the complete Hero copy block and is not required to fit inside the initial 390 × 900 viewport. Mobile validation must confirm its exact document position and full visibility on scroll; the visual's immediate focal read applies when it enters the viewport. No interleaving markup refactor is required.

CSS must give the image a stable aspect ratio at each breakpoint, use `object-fit: cover`, preserve the existing restrained border/surface language, and place the caption in normal flow rather than as an image overlay. The image must not depend on JavaScript or motion.

Reuse of `.hero-visual` must remove or neutralize its existing `::before` and `::after` overlays, remove the `display: none` mobile rule, and remove the panel's `--hero-panel-translate` transform and transition. The figure remains visible and static at every breakpoint even if the surrounding Hero copy retains its existing reduced-motion-safe behavior.

The breakpoint-specific figure or picture wrapper supplies the stable 5:4 or 16:9 layout box before image decode. The `<img>` keeps its 1200 × 960 intrinsic dimensions; the responsive CSS aspect ratio owns tablet/mobile layout reservation. Do not add `fetchpriority="high"` unless rendered/Lighthouse evidence shows that the figure is the relevant LCP element at that viewport and that the priority does not regress mobile loading.

## Cleanup Boundary

After the responsive figure renders correctly, remove only the obsolete Hero visual implementation:

- the `.lab-*` spans and their pseudo-elements;
- the three-span `.hero-mobile-visual` decoration;
- CSS selectors used exclusively by those elements;
- overlay positioning that belonged to the old `.hero-visual-note` treatment.

Do not refactor unrelated token layers, shared cards, Instrument Lab styles, navigation, Hero copy, CTAs, section order, project evidence, or Notes/About content.

## Failure Handling

- Reject and regenerate or edit any image that contains generated text, logos, false data, malformed optical geometry, unclear focal hierarchy, or recognizable commercial hardware. Do not hide these defects with a dark overlay.
- If a responsive crop removes the sample cell or breaks the 90-degree light-path read, recrop from the master while keeping the same scene.
- If a file misses its size target, lower WebP quality conservatively and inspect the result before reducing dimensions.
- If the image fails to load, the bilingual `alt` text and the surrounding Hero copy remain the truthful fallback; no script-based fallback is needed.

## Validation

### Asset review

- Inspect the master and all three responsive derivatives at full size.
- Confirm there is no generated text, logo, watermark, false chart, malformed cell, duplicated detector, or disconnected beam.
- Confirm the desktop and responsive crops depict the same scene and keep the sample cell as the focal point.
- Confirm dimensions, WebP format, and file-size limits from filesystem byte counts, where `1 KiB = 1024 bytes`.

### Static checks

- Extend the homepage static contract so it verifies the responsive Hero sources, local asset existence, non-empty bilingual `alt`, visible bilingual concept boundary, and absence of the old `.lab-*` / `.hero-mobile-visual` markup.
- Run `python tools/check_site.py`.
- Run the focused Python contract tests and the following current repository gates:
  - `python -m py_compile tools/check_site.py`
  - `python -m unittest discover -s tools/tests -p "test_*.py" -v`
  - `node --check script.js`
  - `node --check instrument/instrument.js`
  - `node --check tools/check-public-browser.js`
  - `node --check tools/check-instrument-browser.js`
  - `node --test instrument/sim/tests/*.mjs`
  - `node tools/preprocess-instrument-data.js --validate`
  - `node tools/check-public-browser.js`
  - `node tools/check-instrument-browser.js`
- If an aggregate browser runner cannot complete in the environment, record the incomplete command honestly and replace only its changed-surface evidence with direct Chromium checks at the declared viewports; do not report the aggregate runner as passed.
- Run `git diff --check` and review the complete diff.

### Rendered checks

Render the homepage at minimum at:

- 1280 × 900 for the 5:4 desktop image;
- 1024 × 900 for the 16:9 tablet image;
- 390 × 900 for the 16:9 mobile image.

For each viewport, verify the selected `currentSrc`, focal crop, caption placement, no overlap, no horizontal overflow, no console errors, and no regression in navigation or Hero actions. On desktop and tablet, also inspect first-viewport hierarchy. On mobile, verify that the figure is fully visible at its declared post-copy document position when scrolled into view. Retain the existing broader mobile-width and no-JS checks where the project runner covers them.

Update `WEBIMPROVE_PROGRESS.md` with the final asset names, validation evidence, visual review result, and any remaining subjective limitation.

## Files Expected to Change During Implementation

- `index.html`
- `styles.css`
- `assets/img/hero-fluorescence-desktop-v1.webp`
- `assets/img/hero-fluorescence-tablet-v1.webp`
- `assets/img/hero-fluorescence-mobile-v1.webp`
- `tools/check_site.py`
- focused tests under `tools/tests/`
- `WEBIMPROVE_PROGRESS.md`
- `ACCESSIBILITY_CHECKLIST.md`
- `PERFORMANCE_CHECKLIST.md`

The implementation plan may narrow documentation/test files if existing contracts already cover a requirement, but it may not widen the public feature scope.

## Explicit Exclusions

- no change to homepage positioning copy, CTA labels, project order, Research evidence roles, Notes, or About;
- no change to `/instrument/` behavior or scientific model;
- no real or synthetic spectrum/data display inside the image;
- no framework, package manager, image CDN, analytics, form, backend, or third-party runtime;
- no deletion of unrelated assets or broad CSS token consolidation;
- no push, deployment, or GitHub Pages publication without a separate user instruction.

## Success Criteria

- When the Hero figure is visible, it has one immediate, attractive focal subject: a fluorescent sample cell.
- The excitation and perpendicular emission/collection paths remain legible without becoming a dense diagram.
- The image reads as a calm scientific editorial illustration and avoids generic AI-template or cyberpunk styling.
- Desktop, tablet, and mobile use responsive crops of the same approved scene.
- The visible bilingual caption makes the conceptual boundary explicit and does not overlap the image.
- No unsupported personal, scientific, institutional, or commercial claim is introduced.
- The optimized images meet the declared dimensions and file-size targets.
- Static, accessibility, responsive-browser, performance, and diff checks pass after integration.
