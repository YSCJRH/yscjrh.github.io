# Homepage Generated Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's abstract CSS laboratory collage with one truthful, responsive, generated fluorescence sample-cell illustration that remains attractive and legible across desktop, tablet, and mobile.

**Architecture:** Generate one approved 3:2 master, derive three deterministic WebP crops, and deliver them through one semantic `<figure><picture>` component. Keep the public contract in `tools/check_site.py`, rendered responsive behavior in `tools/check-public-browser.js`, and the visual treatment in the existing Hero CSS boundary; do not change site copy, section order, or `/instrument/` behavior.

**Tech Stack:** Built-in image generation, static HTML5, CSS media queries, Python 3 standard library, Pillow 10.1.0 for deterministic crop/resize/WebP encoding, `unittest`, Node.js, Playwright CLI browser QA, Git.

## Global Constraints

- Follow `docs/superpowers/specs/2026-07-13-homepage-generated-hero-design.md` as the approved visual and truthfulness contract.
- Use one transparent generic sample cell as the focal point, with violet-blue excitation from the left and cyan-teal perpendicular collection toward an unbranded detector.
- Generate no text, letters, numbers, labels, logos, watermarks, charts, data, code, people, institutions, or recognizable commercial hardware inside the image.
- Treat the image only as a concept illustration, never as a photograph, experiment record, instrument claim, calibrated model, or research result.
- Produce exactly `assets/img/hero-fluorescence-desktop-v1.webp` at 1200 × 960 and at most 200 KiB.
- Produce exactly `assets/img/hero-fluorescence-tablet-v1.webp` at 1280 × 720 and at most 150 KiB.
- Produce exactly `assets/img/hero-fluorescence-mobile-v1.webp` at 720 × 405 and at most 90 KiB.
- Derive all three WebP files from the same approved master; do not stretch or independently regenerate responsive scenes.
- Keep the mobile figure after the complete Hero copy block; it is not required to fit inside the initial 390 × 900 viewport, but must be fully visible when scrolled into view.
- Use paired English / Chinese visitor-facing copy, with `lang="zh-CN"` on the Chinese caption sentence.
- Keep the site static: no framework, package manifest, CDN, external media URL, analytics, form, backend, font, or runtime dependency.
- Do not delete or overwrite `assets/img/hero-lab.svg`; it is outside this scope.
- Do not change Hero positioning copy, CTAs, Research evidence roles, project order, Notes, About, navigation, or `/instrument/`.
- Do not add `fetchpriority="high"`; the approved design does not require it without separate rendered/Lighthouse evidence.
- Do not push, deploy, or publish during this plan.
- Only one write-enabled actor edits the shared worktree at a time.

## File Structure

### Create

- `assets/img/hero-fluorescence-desktop-v1.webp` — 5:4 desktop delivery asset.
- `assets/img/hero-fluorescence-tablet-v1.webp` — 16:9 tablet delivery asset.
- `assets/img/hero-fluorescence-mobile-v1.webp` — 16:9 mobile delivery asset.
- `tools/tests/test_homepage_hero_contract.py` — focused negative and positive tests for the Hero markup contract.

### Modify

- `index.html` — replace the old mobile decoration and desktop `.lab-*` tree with one semantic responsive figure.
- `styles.css` — remove obsolete Hero collage rules and style the static picture/caption across current breakpoints.
- `tools/check_site.py` — enforce exact Hero assets, semantics, bilingual description, concept boundary, and legacy-markup removal.
- `tools/check-public-browser.js` — assert responsive `currentSrc`, static figure behavior, caption flow, mobile document position, and overflow.
- `instrument/sim/tests/browser-qa-tool.test.mjs` — require the responsive Hero browser-QA contract.
- `PLANS.md` — make this the current local milestone while preserving the preceding published milestone as history.
- `WEBIMPROVE_PROGRESS.md` — record the local implementation, validation evidence, truth boundary, and no-publish state.
- `ACCESSIBILITY_CHECKLIST.md` — record picture alt text, Chinese language semantics, and caption behavior.
- `PERFORMANCE_CHECKLIST.md` — record local WebP delivery, dimensions, size caps, and no external dependency.

### Temporary, not committed

- `tmp/hero-fluorescence-master-v1.png` — approved generation master used only to derive public assets.
- `tmp/hero-desktop-1280x900.png` — desktop visual-QA capture.
- `tmp/hero-tablet-1024x900.png` — tablet visual-QA capture.
- `tmp/hero-mobile-390x900.png` — mobile visual-QA capture.

---

### Task 1: Generate and normalize the responsive image assets

**Files:**
- Create: `assets/img/hero-fluorescence-desktop-v1.webp`
- Create: `assets/img/hero-fluorescence-tablet-v1.webp`
- Create: `assets/img/hero-fluorescence-mobile-v1.webp`
- Temporary: `tmp/hero-fluorescence-master-v1.png`

**Interfaces:**
- Consumes: the approved visual and generation contract in `docs/superpowers/specs/2026-07-13-homepage-generated-hero-design.md`.
- Produces: three local WebP files with the exact paths, dimensions, and byte ceilings consumed by Task 2.

- [ ] **Step 1: Confirm a clean baseline and absent target assets**

Run:

```powershell
git status --short
python tools/check_site.py
Get-Item -LiteralPath `
  'assets/img/hero-fluorescence-desktop-v1.webp', `
  'assets/img/hero-fluorescence-tablet-v1.webp', `
  'assets/img/hero-fluorescence-mobile-v1.webp' `
  -ErrorAction SilentlyContinue
```

Expected:

- `git status --short` prints nothing.
- `python tools/check_site.py` ends with `Site check passed.`
- `Get-Item` prints nothing because the versioned targets do not exist yet.

- [ ] **Step 2: Generate one high-resolution master with the built-in image generator**

Invoke the built-in image generator for a new image with no reference-image parameter. Use this prompt verbatim:

```text
Create a high-resolution 3:2 landscape scientific editorial illustration for the hero of a calm researcher-builder personal website. One transparent generic fluorescence sample cell is the unmistakable focal point on a matte graphite optical bench, seen from a slightly elevated three-quarter angle. A restrained violet-blue excitation beam enters the sample cell from the left. The cell emits a controlled cyan-teal fluorescence glow, and a clearly perpendicular collection path leads from the cell toward one compact, neutral, unbranded detector module. Use only the minimal neutral-metal fixtures needed to make the optical relationship legible. Keep the sample-cell center within the central 40–60% horizontally and 35–65% vertically; keep all essential light paths inside the central 15–85% horizontally and 20–80% vertically so 5:4 and 16:9 crops remain viable. Style: semi-realistic 3D scientific editorial illustration, graphite black background, matte materials, precise controlled reflections, cyan-teal main light, violet-blue secondary light, restrained bloom, high local contrast at small sizes. This is visibly a concept illustration, not a laboratory photograph. No text, letters, numbers, labels, scale marks, logos, watermarks, brands, charts, spectra, readouts, interfaces, code, notebooks, people, institutions, recognizable laboratory, recognizable commercial instrument, microscope, slide, floating UI, network nodes, decorative apparatus, cyberpunk fog, broad purple haze, glossy SaaS gradients, malformed glassware, duplicated components, or disconnected beams.
```

Expected: one landscape master at no less than 1536 × 1024 pixels. The image-generation call must be the last action of its turn; do not append commentary after the generated image.

- [ ] **Step 3: Inspect and approve the master at full size**

On the next execution turn, open the generated file with `view_image` at original detail. Reject it if any of these are present:

- generated text, logo, watermark, number, chart, or screen;
- recognizable brand or commercial instrument;
- malformed or duplicated sample cell/detector;
- excitation and collection paths that do not read as perpendicular;
- a focal point outside the declared safe coordinates;
- broad purple haze, excessive bloom, cyberpunk treatment, or stock-laboratory appearance.

If any rejection condition is present, edit the generated image with the built-in image generator using `num_last_images_to_include: 1` and omit `referenced_image_paths`. Use this correction prompt, again as the last action of the turn:

```text
Revise this concept illustration while preserving the same scene and camera angle. Make one geometrically clean transparent sample cell the sole focal point. Keep one violet-blue excitation beam entering from the left and one clearly perpendicular cyan-teal collection path leading to a single compact unbranded detector. Remove every visible letter, number, label, logo, watermark, chart, interface, brand cue, duplicated component, malformed glass edge, disconnected beam, broad purple fog, and excessive bloom. Keep the central crop-safe composition, matte graphite background, restrained scientific editorial 3D style, and controlled local contrast.
```

Expected: the parent agent records the master as approved only after every rejection condition is absent. Preserve the exact local output path returned by the approved generation or correction result as `approvedMasterPath`; do not infer it from timestamps or another generated image.

- [ ] **Step 4: Copy the most recent approved generation into the workspace**

Use the exact `approvedMasterPath` returned by the image-generation result. Bind that exact value into the PowerShell session before running the following commands; do not scan `generated_images` by `LastWriteTime`:

```powershell
if (-not $approvedMasterPath) { throw 'approvedMasterPath was not bound from the image-generation result.' }
if (-not (Test-Path -LiteralPath $approvedMasterPath)) {
  throw "Approved image-generation output does not exist: $approvedMasterPath"
}
Copy-Item -LiteralPath $approvedMasterPath -Destination 'tmp\hero-fluorescence-master-v1.png'
Get-Item -LiteralPath 'tmp\hero-fluorescence-master-v1.png' | Select-Object FullName, Length
```

Expected: `tmp\hero-fluorescence-master-v1.png` exists inside the workspace and has a non-zero byte length.

- [ ] **Step 5: Derive exact crops and encode within the approved byte ceilings**

Run this deterministic Pillow transform. Pillow is used only for center-crop, resize, and WebP encoding; no creative retouching occurs here.

```powershell
@'
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps

source = Path("tmp/hero-fluorescence-master-v1.png")
targets = [
    (Path("assets/img/hero-fluorescence-desktop-v1.webp"), (1200, 960), 200 * 1024),
    (Path("assets/img/hero-fluorescence-tablet-v1.webp"), (1280, 720), 150 * 1024),
    (Path("assets/img/hero-fluorescence-mobile-v1.webp"), (720, 405), 90 * 1024),
]

if not source.is_file():
    raise SystemExit(f"Missing approved master: {source}")

existing = [str(path) for path, _, _ in targets if path.exists()]
if existing:
    raise SystemExit(f"Refusing to overwrite existing versioned assets: {existing}")

with Image.open(source) as opened:
    if opened.width < 1536 or opened.height < 1024:
        raise SystemExit(f"Master is too small: {opened.size}")
    master = opened.convert("RGB")

for path, size, byte_limit in targets:
    frame = ImageOps.fit(
        master,
        size,
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )
    payload = None
    selected_quality = None
    for quality in range(86, 49, -2):
        buffer = BytesIO()
        frame.save(buffer, format="WEBP", quality=quality, method=6)
        candidate = buffer.getvalue()
        if len(candidate) <= byte_limit:
            payload = candidate
            selected_quality = quality
            break
    if payload is None:
        raise SystemExit(f"Could not meet byte limit for {path} without going below quality 50")
    path.write_bytes(payload)
    print(f"{path}: {size[0]}x{size[1]}, {len(payload)} bytes, quality={selected_quality}")
'@ | python -
```

Expected: three lines report the exact target dimensions and byte counts below their respective ceilings.

- [ ] **Step 6: Validate file format, dimensions, and byte limits mechanically**

Run:

```powershell
@'
from pathlib import Path
from PIL import Image

expected = {
    Path("assets/img/hero-fluorescence-desktop-v1.webp"): ((1200, 960), 200 * 1024),
    Path("assets/img/hero-fluorescence-tablet-v1.webp"): ((1280, 720), 150 * 1024),
    Path("assets/img/hero-fluorescence-mobile-v1.webp"): ((720, 405), 90 * 1024),
}

for path, (size, byte_limit) in expected.items():
    with Image.open(path) as image:
        assert image.format == "WEBP", (path, image.format)
        assert image.size == size, (path, image.size, size)
    byte_count = path.stat().st_size
    assert byte_count <= byte_limit, (path, byte_count, byte_limit)
    print(f"PASS {path}: {size[0]}x{size[1]}, {byte_count} bytes")
'@ | python -
```

Expected: three `PASS` lines and no assertion error.

- [ ] **Step 7: Inspect all responsive crops visually**

Open each file with `view_image` at original detail:

```text
D:\personal website\assets\img\hero-fluorescence-desktop-v1.webp
D:\personal website\assets\img\hero-fluorescence-tablet-v1.webp
D:\personal website\assets\img\hero-fluorescence-mobile-v1.webp
```

Expected: all three show the same scene; the sample cell remains the first focal point; both light paths remain legible; no crop removes the detector or the 90-degree relationship; compression does not create visible banding around the glow.

- [ ] **Step 8: Commit the approved responsive assets**

Run:

```powershell
git status --short
git add -- `
  assets/img/hero-fluorescence-desktop-v1.webp `
  assets/img/hero-fluorescence-tablet-v1.webp `
  assets/img/hero-fluorescence-mobile-v1.webp
git diff --cached --check
git commit -m "site: add responsive fluorescence hero assets"
```

Expected: one commit containing only the three new WebP files; `tmp/hero-fluorescence-master-v1.png` remains uncommitted.

---

### Task 2: Enforce the semantic Hero contract and replace the markup

**Files:**
- Create: `tools/tests/test_homepage_hero_contract.py`
- Modify: `tools/check_site.py:13-90, 500-640, 847-849`
- Modify: `index.html:128-132, 163-212`

**Interfaces:**
- Consumes: the three exact WebP paths from Task 1.
- Produces: `check_homepage_hero_figure(parser: SiteParser, text: str) -> list[str]` and one semantic `.hero-visual` figure consumed by Task 3 CSS/browser QA.

- [ ] **Step 1: Write focused contract tests before the checker exists**

Create `tools/tests/test_homepage_hero_contract.py` with:

```python
from __future__ import annotations

from pathlib import Path
import unittest

from tools.check_site import SiteParser, check_homepage_hero_figure


ROOT = Path(__file__).resolve().parents[2]
EXPECTED_ALT = (
    "Conceptual illustration of a fluorescent sample cell and perpendicular light paths / "
    "荧光样品池与垂直光路的概念插图"
)


def hero_errors(html: str) -> list[str]:
    parser = SiteParser()
    parser.feed(html)
    return check_homepage_hero_figure(parser, html)


class HomepageHeroContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.homepage = (ROOT / "index.html").read_text(encoding="utf-8")

    def test_current_homepage_satisfies_contract(self) -> None:
        self.assertEqual(hero_errors(self.homepage), [])

    def test_rejects_non_figure_hero_container(self) -> None:
        mutated = self.homepage.replace(
            '<figure class="hero-visual">',
            '<aside class="hero-visual">',
            1,
        ).replace("</figure>", "</aside>", 1)
        self.assertIn(
            "index.html: expected one semantic hero figure",
            hero_errors(mutated),
        )

    def test_rejects_wrong_mobile_source(self) -> None:
        mutated = self.homepage.replace(
            'srcset="assets/img/hero-fluorescence-mobile-v1.webp"',
            'srcset="assets/img/hero-lab.svg"',
            1,
        )
        self.assertIn(
            "index.html: hero responsive sources must match mobile then tablet WebP contract",
            hero_errors(mutated),
        )

    def test_rejects_missing_bilingual_alt(self) -> None:
        mutated = self.homepage.replace(f'alt="{EXPECTED_ALT}"', 'alt=""', 1)
        self.assertIn(
            "index.html: hero image must match the desktop asset, dimensions, decode mode, and bilingual alt",
            hero_errors(mutated),
        )

    def test_rejects_unscoped_chinese_caption(self) -> None:
        mutated = self.homepage.replace(
            '<span class="hero-visual-note-zh" lang="zh-CN">',
            '<span class="hero-visual-note-zh">',
            1,
        )
        self.assertIn(
            "index.html: hero concept caption must keep paired English and lang=zh-CN Chinese text",
            hero_errors(mutated),
        )

    def test_rejects_changed_concept_boundary(self) -> None:
        mutated = self.homepage.replace(
            "Concept illustration, not an experimental record.",
            "Experimental record.",
            1,
        )
        self.assertIn(
            "index.html: hero concept caption must keep paired English and lang=zh-CN Chinese text",
            hero_errors(mutated),
        )

    def test_rejects_legacy_lab_markup(self) -> None:
        mutated = self.homepage.replace(
            "</figure>",
            '<span class="lab-source" aria-hidden="true"></span></figure>',
            1,
        )
        self.assertIn(
            "index.html: legacy hero lab/mobile markup must be removed",
            hero_errors(mutated),
        )


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the new test and verify the red path**

Run:

```powershell
python -m unittest tools.tests.test_homepage_hero_contract -v
```

Expected: import failure for `check_homepage_hero_figure`, proving the new contract is not implemented yet.

- [ ] **Step 3: Add the exact Hero contract to `tools/check_site.py`**

Add these constants after the existing homepage constants:

```python
HOME_HERO_ALT = (
    "Conceptual illustration of a fluorescent sample cell and perpendicular light paths / "
    "荧光样品池与垂直光路的概念插图"
)
HOME_HERO_SOURCE_CONTRACT = [
    (
        "(max-width: 780px)",
        "assets/img/hero-fluorescence-mobile-v1.webp",
        "image/webp",
    ),
    (
        "(max-width: 1100px)",
        "assets/img/hero-fluorescence-tablet-v1.webp",
        "image/webp",
    ),
]
HOME_HERO_IMAGE_CONTRACT = {
    "src": "assets/img/hero-fluorescence-desktop-v1.webp",
    "alt": HOME_HERO_ALT,
    "width": "1200",
    "height": "960",
    "decoding": "async",
}
HOME_HERO_CAPTION_TEXT = {
    "hero-visual-note-en": "Concept illustration, not an experimental record.",
    "hero-visual-note-zh": "概念插图，非实验记录。",
}
HOME_HERO_ASSET_PATHS = [
    Path("assets/img/hero-fluorescence-desktop-v1.webp"),
    Path("assets/img/hero-fluorescence-tablet-v1.webp"),
    Path("assets/img/hero-fluorescence-mobile-v1.webp"),
]
```

Add these functions immediately before `check_homepage_evidence_hierarchy`:

```python
def element_texts_by_class(text: str, class_name: str) -> list[str]:
    pattern = re.compile(
        rf'<(?P<tag>[a-z][\w:-]*)\b(?=[^>]*\bclass="[^"]*\b{re.escape(class_name)}\b[^"]*")[^>]*>'
        rf'(?P<body>.*?)</(?P=tag)>',
        re.IGNORECASE | re.DOTALL,
    )
    return [
        re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", match.group("body"))).strip()
        for match in pattern.finditer(text)
    ]


def check_homepage_hero_figure(parser: SiteParser, text: str) -> list[str]:
    errors: list[str] = []
    figures = [
        (tag, attrs)
        for tag, attrs in parser.tags
        if "hero-visual" in tag_classes(attrs)
    ]
    if len(figures) != 1 or figures[0][0] != "figure":
        errors.append("index.html: expected one semantic hero figure")

    pictures = [
        attrs
        for tag, attrs in parser.tags
        if tag == "picture" and "hero-visual-picture" in tag_classes(attrs)
    ]
    captions = [
        attrs
        for tag, attrs in parser.tags
        if tag == "figcaption" and "hero-visual-note" in tag_classes(attrs)
    ]
    if len(pictures) != 1 or len(captions) != 1:
        errors.append("index.html: hero picture and caption must each appear exactly once")

    source_contract = [
        (attrs.get("media", ""), attrs.get("srcset", ""), attrs.get("type", ""))
        for tag, attrs in parser.tags
        if tag == "source" and "hero-visual-source" in tag_classes(attrs)
    ]
    if source_contract != HOME_HERO_SOURCE_CONTRACT:
        errors.append(
            "index.html: hero responsive sources must match mobile then tablet WebP contract"
        )

    images = [
        attrs
        for tag, attrs in parser.tags
        if tag == "img" and "hero-illustration" in tag_classes(attrs)
    ]
    if len(images) != 1 or any(
        images[0].get(name, "") != expected
        for name, expected in HOME_HERO_IMAGE_CONTRACT.items()
    ):
        errors.append(
            "index.html: hero image must match the desktop asset, dimensions, decode mode, and bilingual alt"
        )

    caption_en = [
        attrs
        for tag, attrs in parser.tags
        if tag == "span" and "hero-visual-note-en" in tag_classes(attrs)
    ]
    caption_zh = [
        attrs
        for tag, attrs in parser.tags
        if tag == "span" and "hero-visual-note-zh" in tag_classes(attrs)
    ]
    caption_text_matches = all(
        element_texts_by_class(text, class_name) == [expected_text]
        for class_name, expected_text in HOME_HERO_CAPTION_TEXT.items()
    )
    if (
        len(caption_en) != 1
        or len(caption_zh) != 1
        or caption_zh[0].get("lang", "") != "zh-CN"
        or not caption_text_matches
    ):
        errors.append(
            "index.html: hero concept caption must keep paired English and lang=zh-CN Chinese text"
        )

    class_tokens = [
        class_name
        for _, attrs in parser.tags
        for class_name in tag_classes(attrs)
    ]
    if any(
        class_name in {"hero-mobile-visual", "hero-lab-visual"}
        or class_name.startswith("lab-")
        or class_name.startswith("scope-")
        for class_name in class_tokens
    ):
        errors.append("index.html: legacy hero lab/mobile markup must be removed")

    for asset_path in HOME_HERO_ASSET_PATHS:
        if not (ROOT / asset_path).is_file():
            errors.append(f"index.html: missing responsive hero asset {asset_path.as_posix()}")

    return errors
```

In the `path == Path("index.html")` branch, call both homepage contracts:

```python
    if path == Path("index.html"):
        errors.extend(check_homepage_evidence_hierarchy(parser))
        errors.extend(check_homepage_hero_figure(parser, text))
```

- [ ] **Step 4: Verify the checker now rejects the old homepage**

Run:

```powershell
python -m unittest `
  tools.tests.test_homepage_hero_contract.HomepageHeroContractTests.test_current_homepage_satisfies_contract `
  -v
```

Expected: failure containing `expected one semantic hero figure`, `hero responsive sources`, and `legacy hero lab/mobile markup`.

- [ ] **Step 5: Replace the old Hero markup with the semantic responsive figure**

Delete the complete `div.hero-mobile-visual` block from `index.html:128-132`. Replace the old `aside.hero-visual` block at `index.html:163-212` with:

```html
                <figure class="hero-visual">
                  <picture class="hero-visual-picture">
                    <source
                      class="hero-visual-source"
                      media="(max-width: 780px)"
                      srcset="assets/img/hero-fluorescence-mobile-v1.webp"
                      type="image/webp"
                    >
                    <source
                      class="hero-visual-source"
                      media="(max-width: 1100px)"
                      srcset="assets/img/hero-fluorescence-tablet-v1.webp"
                      type="image/webp"
                    >
                    <img
                      class="hero-illustration"
                      src="assets/img/hero-fluorescence-desktop-v1.webp"
                      alt="Conceptual illustration of a fluorescent sample cell and perpendicular light paths / 荧光样品池与垂直光路的概念插图"
                      width="1200"
                      height="960"
                      decoding="async"
                    >
                  </picture>
                  <figcaption class="hero-visual-note">
                    <span class="hero-visual-note-en">Concept illustration, not an experimental record.</span>
                    <span class="hero-visual-note-zh" lang="zh-CN">概念插图，非实验记录。</span>
                  </figcaption>
                </figure>
```

Do not retain `data-reveal`, `role="img"`, or the old `aria-label`; the real `<img alt>` is the single accessible image name.

- [ ] **Step 6: Run the focused and full static contracts**

Run:

```powershell
python -m unittest tools.tests.test_homepage_hero_contract -v
python -m unittest discover -s tools/tests -p "test_*.py" -v
python -m py_compile tools/check_site.py
python tools/check_site.py
```

Expected:

- all Hero contract tests pass;
- the existing homepage evidence tests still pass;
- compilation succeeds;
- `tools/check_site.py` ends with `Site check passed.`

- [ ] **Step 7: Commit the semantic markup and static contract**

Run:

```powershell
git add -- index.html tools/check_site.py tools/tests/test_homepage_hero_contract.py
git diff --cached --check
git diff --cached --stat
git commit -m "site: add semantic responsive hero figure"
```

Expected: one commit containing only the homepage markup, static checker, and focused test file.

---

### Task 3: Replace the CSS collage and add rendered responsive QA

**Files:**
- Modify: `styles.css:806-873, 2454-2925, 3807-4208, 6601-6620`
- Modify: `tools/check-public-browser.js:19-30, 166-418`
- Modify: `instrument/sim/tests/browser-qa-tool.test.mjs`
- Temporary: `tmp/hero-desktop-1280x900.png`
- Temporary: `tmp/hero-tablet-1024x900.png`
- Temporary: `tmp/hero-mobile-390x900.png`

**Interfaces:**
- Consumes: `.hero-visual`, `.hero-visual-picture`, `.hero-visual-source`, `.hero-illustration`, `.hero-visual-note`, `.hero-visual-note-en`, and `.hero-visual-note-zh` from Task 2.
- Produces: static 5:4/16:9 rendering and `HERO_RESPONSIVE_VIEWPORTS` browser evidence for desktop, tablet, and mobile.

- [ ] **Step 1: Add a failing contract for the browser-QA tool**

Append this test to `instrument/sim/tests/browser-qa-tool.test.mjs`:

```javascript
test("public browser QA verifies responsive homepage hero delivery", () => {
  assert.equal(existsSync(publicQaToolPath), true, "expected tools/check-public-browser.js");

  const script = readFileSync(publicQaToolPath, "utf8");
  assert.match(
    script,
    /HERO_RESPONSIVE_VIEWPORTS\s*=\s*\[[\s\S]*?1280[\s\S]*?1024[\s\S]*?390[\s\S]*?\]/,
    "public browser QA should declare desktop, tablet, and mobile Hero viewports"
  );
  for (const asset of [
    "hero-fluorescence-desktop-v1.webp",
    "hero-fluorescence-tablet-v1.webp",
    "hero-fluorescence-mobile-v1.webp",
  ]) {
    assert.match(script, new RegExp(asset.replaceAll(".", "\\.")), `missing Hero asset check: ${asset}`);
  }
  assert.match(script, /currentSrc/, "Hero QA should verify the selected responsive source");
  assert.match(script, /captionAfterImage/, "Hero QA should verify that the caption stays outside the image");
  assert.match(script, /afterScrollFullyVisible/, "Hero QA should verify full figure visibility after scroll");
  assert.match(script, /responsive hero image/i, "Hero QA should expose a stable result marker");
});
```

- [ ] **Step 2: Run the test and verify it fails before browser-QA implementation**

Run:

```powershell
node --test instrument/sim/tests/browser-qa-tool.test.mjs
```

Expected: failure stating that `HERO_RESPONSIVE_VIEWPORTS` or the responsive Hero marker is missing.

- [ ] **Step 3: Replace the old Hero CSS with the static figure treatment**

Do not replace the generic `.hero-visual`, `.hero-visual::before`, or `.hero-visual::after` rules around `styles.css:806-846`: `404.html` uses `aside.hero-visual` and must retain its current behavior. Add this homepage-only component block immediately after the existing generic `.hero-visual-note` rules:

```css
figure.hero-visual {
  position: relative;
  display: grid;
  grid-template-rows: auto auto;
  gap: 0.65rem;
  align-items: stretch;
  min-width: 0;
  margin: 0;
  padding: clamp(0.7rem, 1.1vw, 0.9rem);
  border: 1px solid rgba(138, 166, 255, 0.14);
  border-radius: 1.15rem;
  background: rgba(6, 10, 18, 0.74);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 20px 46px rgba(0, 0, 0, 0.34);
  transform: none;
  transition: none;
}

figure.hero-visual::before,
figure.hero-visual::after {
  content: none;
}

figure.hero-visual .hero-visual-picture {
  display: block;
  aspect-ratio: 5 / 4;
  overflow: hidden;
  border-radius: 0.95rem;
  background: #05060a;
}

figure.hero-visual .hero-illustration {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: cover;
  object-position: center;
}

figure.hero-visual .hero-visual-note {
  position: static;
  display: grid;
  gap: 0.12rem;
  max-width: none;
  margin: 0;
  padding: 0.05rem 0.15rem 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  backdrop-filter: none;
}

figure.hero-visual .hero-visual-note span {
  display: block;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}
```

Keep the existing generic active-theme `.hero-visual` block around `styles.css:2454` for the 404 surface. Add this more-specific homepage override after it:

```css
figure.hero-visual {
  min-height: 34rem;
  background: rgba(5, 6, 10, 0.78);
}
```

Delete every complete selector block used only by the old collage:

```text
.hero-lab-visual and its pseudo-elements
every .lab-* selector
every .scope-* selector
.hero-mobile-visual and its pseudo-element/child selectors
the .hero-lab-visual half of shared responsive selectors
the 420px .hero-lab-visual selector
.lab-aura from the reduced-motion selector list
```

Retain generic `.hero-visual` responsive behavior for `404.html`. At `max-width: 1100px`, remove only `.hero-lab-visual` from the old min-height pair, then add:

```css
  figure.hero-visual {
    min-height: 0;
  }

  figure.hero-visual .hero-visual-picture {
    aspect-ratio: 16 / 9;
  }
```

At `max-width: 780px`, leave the generic `.hero-visual { display: none; }` rule in place for the 404 surface, remove `.hero-lab-visual` from that selector, and add this higher-specificity homepage override after it:

```css
  figure.hero-visual {
    display: grid;
    min-height: 0;
  }
```

At `max-width: 420px`, leave the generic 404 rules intact and add:

```css
  figure.hero-visual {
    min-height: 0;
  }
```

The 16:9 picture treatment continues through both narrower breakpoints. Do not change `aside.hero-visual` or its pseudo-elements, transform, transition, background, or mobile visibility.

- [ ] **Step 4: Extend `tools/check-public-browser.js` with exact Hero scenarios**

Add this constant after `PUBLIC_MOBILE_VIEWPORT_HEIGHT`:

```javascript
const HERO_RESPONSIVE_VIEWPORTS = [
  {
    name: "desktop",
    width: 1280,
    height: 900,
    expectedPath: "/assets/img/hero-fluorescence-desktop-v1.webp",
    requiresInitialVisibility: true,
    requiresCopyBeforeFigure: false,
  },
  {
    name: "tablet",
    width: 1024,
    height: 900,
    expectedPath: "/assets/img/hero-fluorescence-tablet-v1.webp",
    requiresInitialVisibility: true,
    requiresCopyBeforeFigure: false,
  },
  {
    name: "mobile",
    width: 390,
    height: 900,
    expectedPath: "/assets/img/hero-fluorescence-mobile-v1.webp",
    requiresInitialVisibility: false,
    requiresCopyBeforeFigure: true,
  },
];
```

Add `"responsive hero image"` to `MARKERS`. Insert this check after the public-route desktop/mobile loop and before mobile-menu keyboard QA:

```javascript
    progress("checking responsive hero image");
    const heroResponsive = runCode(
      `async (page) => {
        const scenarios = ${JSON.stringify(HERO_RESPONSIVE_VIEWPORTS)};
        const results = [];
        for (const scenario of scenarios) {
          await page.setViewportSize({ width: scenario.width, height: scenario.height });
          await page.goto('${baseUrl}', { waitUntil: 'networkidle' });
          await page.waitForFunction(() => {
            const image = document.querySelector('.hero-illustration');
            return Boolean(image && image.complete && image.naturalWidth > 0);
          });
          results.push(await page.evaluate(async (currentScenario) => {
            const figure = document.querySelector('figure.hero-visual');
            const picture = document.querySelector('.hero-visual-picture');
            const image = document.querySelector('.hero-illustration');
            const caption = document.querySelector('figcaption.hero-visual-note');
            const copy = document.querySelector('.hero-copy');
            if (!figure || !picture || !image || !caption || !copy) {
              return { ...currentScenario, missing: true };
            }

            const initialFigureRect = figure.getBoundingClientRect();
            const pictureRect = picture.getBoundingClientRect();
            const captionRect = caption.getBoundingClientRect();
            const copyBeforeFigure = Boolean(
              copy.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING
            );
            const result = {
              ...currentScenario,
              missing: false,
              currentPath: new URL(image.currentSrc).pathname,
              imageLoaded: image.complete && image.naturalWidth > 0,
              initialInViewport:
                initialFigureRect.top < window.innerHeight && initialFigureRect.bottom > 0,
              captionAfterImage: captionRect.top >= pictureRect.bottom - 1,
              captionPosition: getComputedStyle(caption).position,
              staticFigure: getComputedStyle(figure).transform === 'none',
              copyBeforeFigure,
              overflowX: Math.max(
                0,
                document.documentElement.scrollWidth - document.documentElement.clientWidth
              ),
            };

            const centeredTop =
              initialFigureRect.top +
              window.scrollY -
              Math.max(0, (window.innerHeight - initialFigureRect.height) / 2);
            window.scrollTo(0, Math.max(0, centeredTop));
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const scrolledFigureRect = figure.getBoundingClientRect();
            result.afterScrollFullyVisible =
              scrolledFigureRect.top >= -1 && scrolledFigureRect.bottom <= window.innerHeight + 1;
            return result;
          }, scenario));
        }
        return results;
      }`
    );
    assertCheck(
      Array.isArray(heroResponsive) &&
        heroResponsive.length === HERO_RESPONSIVE_VIEWPORTS.length &&
        heroResponsive.every((entry) =>
          entry.missing === false &&
          entry.currentPath === entry.expectedPath &&
          entry.imageLoaded === true &&
          entry.captionAfterImage === true &&
          entry.captionPosition === "static" &&
          entry.staticFigure === true &&
          entry.afterScrollFullyVisible === true &&
          entry.overflowX === 0 &&
          (!entry.requiresInitialVisibility || entry.initialInViewport === true) &&
          (!entry.requiresCopyBeforeFigure || entry.copyBeforeFigure === true)
        ),
      "responsive hero image delivery failed",
      heroResponsive
    );
    record("responsive hero image");
```

- [ ] **Step 5: Run focused syntax and contract checks**

Run:

```powershell
node --check tools/check-public-browser.js
node --test instrument/sim/tests/browser-qa-tool.test.mjs
python -m unittest tools.tests.test_homepage_hero_contract -v
python tools/check_site.py
rg -n "hero-mobile-visual|hero-lab-visual|lab-|scope-" index.html styles.css
```

Expected:

- JavaScript syntax passes;
- the browser-QA contract test passes;
- the Hero static contract passes;
- the site check passes;
- `rg` prints no matches.

- [ ] **Step 6: Run the automated rendered-page gate**

Run:

```powershell
node tools/check-public-browser.js
```

Expected: `Public browser QA passed.` and `Markers:` includes `responsive hero image`. The result data must confirm desktop, tablet, and mobile each selected the expected WebP, the figure transform is `none`, the caption is in normal flow, the complete figure fits inside the viewport after scrolling, mobile copy precedes the figure, and horizontal overflow is zero.

If the aggregate runner remains resident in the current environment, stop it without claiming a pass and run direct Chromium checks for the same three `HERO_RESPONSIVE_VIEWPORTS`; record that substitution honestly in Task 4.

- [ ] **Step 7: Capture and inspect the three real Hero layouts**

Use the `playwright` skill against the local URL printed by:

```powershell
python tools/serve.py
```

Capture these exact files. For the mobile capture, first call `locator("figure.hero-visual").scrollIntoViewIfNeeded()` and wait for two animation frames before taking the viewport screenshot, so the full figure and caption—not merely an intersecting edge—are visible:

```text
D:\personal website\tmp\hero-desktop-1280x900.png
D:\personal website\tmp\hero-tablet-1024x900.png
D:\personal website\tmp\hero-mobile-390x900.png
```

Open all three with `view_image`. Confirm:

- desktop first viewport has a clear sample-cell focal point and no caption overlap;
- tablet uses the 16:9 crop without cutting the sample cell or detector;
- mobile figure appears after the complete copy block, becomes fully visible on scroll, and keeps the same scene;
- the image does not read as a real experiment, commercial product, stock lab, AI SaaS card, or purple cyberpunk collage;
- existing Hero actions, navigation, direction strip, and bilingual text remain visually unchanged.

- [ ] **Step 8: Commit the CSS and rendered-QA contract**

Run:

```powershell
git add -- styles.css tools/check-public-browser.js instrument/sim/tests/browser-qa-tool.test.mjs
git diff --cached --check
git diff --cached --stat
git commit -m "site: refine responsive hero presentation"
```

Expected: one commit containing the scoped Hero CSS cleanup and browser-QA additions; no temporary screenshots are staged.

---

### Task 4: Record the milestone and run final verification

**Files:**
- Modify: `PLANS.md:1-30`
- Modify: `WEBIMPROVE_PROGRESS.md:1-40`
- Modify: `ACCESSIBILITY_CHECKLIST.md:1-40`
- Modify: `PERFORMANCE_CHECKLIST.md:1-65`

**Interfaces:**
- Consumes: all asset, static-check, rendered-browser, and visual-review evidence from Tasks 1–3.
- Produces: a truthful unpublished handoff with current milestone state and complete verification evidence.

- [ ] **Step 1: Make the generated Hero the current local milestone in `PLANS.md`**

Prepend this section and change the existing first heading to `# Previous Phase: Homepage Evidence Hierarchy And Bilingual Surface Integrity`:

```markdown
# Current Phase: Generated Homepage Hero Illustration

## Goal
- Replace the abstract CSS laboratory collage with one generated, concept-only fluorescent sample-cell illustration.
- Deliver one coherent scene through exact desktop, tablet, and mobile WebP crops.
- Preserve homepage copy, evidence roles, section order, bilingual semantics, static architecture, and publication boundaries.

## Current Baseline
- The approved design is recorded in `docs/superpowers/specs/2026-07-13-homepage-generated-hero-design.md`.
- The implementation plan is recorded in `docs/superpowers/plans/2026-07-13-homepage-generated-hero.md`.
- The image is a conceptual editorial illustration, not an experiment record, device claim, calibrated model, or result.
- The implementation remains local until the user separately authorizes publication.

## Validation
1. Validate exact WebP format, dimensions, and KiB ceilings.
2. Run the focused Hero contract, all Python static tests, and `tools/check_site.py`.
3. Run JavaScript syntax, Instrument Lab regression tests, data-package validation, and public/instrument browser QA.
4. Inspect desktop 1280 × 900, tablet 1024 × 900, and mobile 390 × 900 screenshots.
5. Review the complete diff, repository status, public-claim boundary, and no-publish state.

---
```

- [ ] **Step 2: Add the implementation checkpoint to `WEBIMPROVE_PROGRESS.md`**

Replace the current milestone header with this local state and insert the checkpoint before the preceding homepage evidence section:

```markdown
## Current milestone
- Active: Generated homepage Hero illustration
- Status: Implemented and verified locally; not published.
- Last updated: 2026-07-13

## 2026-07-13 Generated responsive homepage Hero illustration
- Status: Implemented and verified locally; not published.
- Trigger:
  - The previous CSS-built Hero mixed instrument parts, a microscope, slide, nodes, spectrum card, and purple haze without one clear focal point.
  - Desktop and mobile used different abstract subjects, and the overlaid caption competed with the spectrum decoration.
- Changes:
  - Replaced the decorative span tree with one semantic `figure` and responsive `picture`.
  - Added desktop 5:4, tablet 16:9, and mobile 16:9 WebP crops derived from one approved master.
  - Used a bilingual alt description and a visible bilingual concept-only boundary in normal flow.
  - Removed the legacy `.lab-*`, `.scope-*`, `.hero-lab-visual`, and `.hero-mobile-visual` implementation.
  - Added static and rendered QA for asset paths, semantics, `currentSrc`, caption flow, figure motion, mobile document position, and overflow.
- Validation result:
  - Green: all three WebP files passed exact format, dimension, and KiB-ceiling checks.
  - Green: focused Hero contract tests, the full Python test set, Python compilation, and `python tools/check_site.py` passed.
  - Green: JavaScript syntax, Instrument Lab regression tests, and instrument data-package validation passed.
  - Green: desktop 1280 × 900, tablet 1024 × 900, and mobile 390 × 900 checks selected the expected responsive source with no caption overlap, figure parallax, console error, or horizontal overflow.
  - Visual review: the sample cell remained the focal point in every crop; the two light paths remained legible; no generated text, brand, false data, or commercial hardware was present.
- Boundary:
  - The image is a concept illustration, not an experiment record, real device, calibrated model, instrument specification, or research result.
  - No Hero copy, CTA, Research evidence role, project order, navigation, Notes/About content, or `/instrument/` behavior changed.
  - No external media, dependency, framework, analytics, form, backend, push, deployment, or publication was added.
- Remaining note:
  - Aesthetic appeal is a reviewed judgment rather than a machine-verifiable fact; the recorded evidence covers composition, truthfulness, responsive integrity, accessibility, and performance boundaries.
```

If the aggregate public browser runner did not complete, replace only its corresponding `Green` sentence with the exact direct-Chromium checks that completed; do not describe the aggregate runner as passed.

- [ ] **Step 3: Refresh accessibility and performance records**

Update `ACCESSIBILITY_CHECKLIST.md` status to:

```text
Status: 2026-07-13 responsive generated Hero figure, bilingual image description, caption language semantics, keyboard navigation, no-JS behavior, and evidence hierarchy refreshed
```

Add this check under `## Checks`:

```markdown
- Homepage Hero image: one semantic `<figure><picture>` provides exact local responsive sources; the meaningful `<img>` carries the paired English / Chinese description, the Chinese concept-boundary sentence uses `lang="zh-CN"`, the caption remains outside the image in normal flow, and no duplicate `role="img"` or decorative mobile substitute is exposed.
```

Update `PERFORMANCE_CHECKLIST.md` status and date to 2026-07-13, then add these lines under `## Performance Baseline`:

```markdown
- Homepage Hero delivery uses three local WebP files derived from one master: 1200 × 960 desktop at no more than 200 KiB, 1280 × 720 tablet at no more than 150 KiB, and 720 × 405 mobile at no more than 90 KiB.
- The Hero uses native `<picture>` source selection, explicit desktop intrinsic dimensions, breakpoint-owned aspect-ratio reservation, `decoding="async"`, and no external image request, JavaScript image loader, animation, or unverified high-priority fetch hint.
```

- [ ] **Step 4: Run the full local verification chain after documentation edits**

Run:

```powershell
python -m py_compile tools/check_site.py
python -m unittest discover -s tools/tests -p "test_*.py" -v
python tools/check_site.py
node --check script.js
node --check instrument/instrument.js
node --check tools/check-public-browser.js
node --check tools/check-instrument-browser.js
node --test instrument/sim/tests/*.mjs
node tools/preprocess-instrument-data.js --validate
node tools/check-public-browser.js
node tools/check-instrument-browser.js
git diff --check
git diff --stat
git status --short
```

Expected:

- all Python tests pass and `Site check passed.` appears;
- all JavaScript syntax checks pass;
- the full Instrument Lab test set passes;
- the instrument data validator reports the current validated package;
- both browser-QA tools pass, or the public aggregate exception is documented with completed direct checks exactly as allowed above;
- `git diff --check` prints nothing;
- only the four documentation files are uncommitted at this point.

- [ ] **Step 5: Run one final read-only review against the approved spec**

Use a read-only reviewer to compare:

```text
docs/superpowers/specs/2026-07-13-homepage-generated-hero-design.md
index.html
styles.css
tools/check_site.py
tools/tests/test_homepage_hero_contract.py
tools/check-public-browser.js
instrument/sim/tests/browser-qa-tool.test.mjs
assets/img/hero-fluorescence-desktop-v1.webp
assets/img/hero-fluorescence-tablet-v1.webp
assets/img/hero-fluorescence-mobile-v1.webp
```

Require a `ready` verdict with no Important finding. Resolve any concrete finding in the owning task's files, rerun that task's focused checks, then rerun Step 4 before committing documentation.

- [ ] **Step 6: Commit the milestone records**

Run:

```powershell
git add -- PLANS.md WEBIMPROVE_PROGRESS.md ACCESSIBILITY_CHECKLIST.md PERFORMANCE_CHECKLIST.md
git diff --cached --check
git diff --cached --stat
git commit -m "docs: record responsive homepage hero evidence"
git status --short
```

Expected: one documentation commit and a clean working tree. Do not push or publish.

## Completion Handoff

The final unpublished handoff must report:

- the four implementation commit IDs;
- the three exact WebP paths, dimensions, and byte counts;
- static, unit, syntax, Instrument Lab, data-package, and browser-QA results;
- the three screenshot paths and visual-review conclusion;
- any aggregate-browser substitution or remaining subjective limitation;
- confirmation that no push, deployment, or publication occurred;
- the next safe action: request explicit publication authorization if the user wants the live site updated.
