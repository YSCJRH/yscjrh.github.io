import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import * as spectrumUi from "../ui/spectrum.mjs";
import { SAMPLE_PRESET_OPTIONS } from "../data/samplePresets.mjs";
import { DETECTOR_PRESET_OPTIONS } from "../physics/detector.mjs";
import { GEOMETRY_PRESET_OPTIONS } from "../physics/geometry.mjs";
import { SOURCE_PRESET_OPTIONS } from "../physics/source.mjs";

const { collectInstrumentElements, updateControlsFromState, updateDiagnostics, updatePartChrome } = spectrumUi;

const here = dirname(fileURLToPath(import.meta.url));
const instrumentHtml = readFileSync(resolve(here, "../../index.html"), "utf8");
const instrumentScript = readFileSync(resolve(here, "../../instrument.js"), "utf8");
const sceneScript = readFileSync(resolve(here, "../scene/InstrumentScene.mjs"), "utf8");
const siteStyles = readFileSync(resolve(here, "../../../styles.css"), "utf8");

function blocksForClass(className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return instrumentHtml.match(new RegExp(`<([a-z]+)[^>]+class="[^"]*${escaped}[^"]*"[^>]*>[\\s\\S]*?<\\/\\1>`, "g")) || [];
}

function sampleSelectOptionsFromHtml() {
  const selectMatch = instrumentHtml.match(/<select data-control="sample">([\s\S]*?)<\/select>/);
  assert.ok(selectMatch, "sample preset select should exist");
  return Array.from(selectMatch[1].matchAll(/<option value="([^"]+)">([\s\S]*?)<\/option>/g)).map((match) => [
    match[1],
    match[2].trim(),
  ]);
}

function selectOptionsFromHtml(controlName) {
  const selectMatch = instrumentHtml.match(new RegExp(`<select data-control="${controlName}">([\\s\\S]*?)<\\/select>`));
  assert.ok(selectMatch, `${controlName} select should exist`);
  return Array.from(selectMatch[1].matchAll(/<option value="([^"]+)">([\s\S]*?)<\/option>/g)).map((match) => [
    match[1],
    match[2].trim(),
  ]);
}

function optionPairs(options) {
  return options.map((option) => [option.id, option.label]);
}

function textNode() {
  return { textContent: "" };
}

function hasCjk(text) {
  return /[\u3400-\u9fff]/.test(text);
}

test("advanced response-chain controls live in the simulator workbench", () => {
  const advancedStart = instrumentHtml.indexOf('<details class="advanced-geometry">');
  const sourceDataStart = instrumentHtml.indexOf("data-source-data-panel");

  assert.ok(advancedStart > 0);
  assert.ok(sourceDataStart > advancedStart);

  for (const controlName of [
    "source-type",
    "detector-type",
    "geometry-mode",
    "spectrum-view",
    "show-components",
    "show-noise",
    "show-artifacts",
  ]) {
    const controlIndex = instrumentHtml.indexOf(`data-control="${controlName}"`);
    assert.ok(controlIndex > advancedStart, `${controlName} should be inside the advanced simulator controls`);
    assert.ok(controlIndex < sourceDataStart, `${controlName} must stay separate from source-derived examples`);
  }
});

test("response-normalized teaching view is not framed as geometry-only", () => {
  const advancedStart = instrumentHtml.indexOf('<details class="advanced-geometry">');
  const advancedEnd = instrumentHtml.indexOf("</details>", advancedStart);
  const block = instrumentHtml.slice(advancedStart, advancedEnd);
  const summary = block.match(/<summary>[\s\S]*?<\/summary>/)?.[0] || "";

  assert.match(block, /Spectrum view \/ 谱图视图/);
  assert.match(block, /not a calibrated correction/);
  assert.match(summary, /Response|响应/);
  assert.doesNotMatch(summary, /Advanced geometry and offsets \/ 高级几何与偏移/);
});

test("advanced geometry copy separates geometry mode from detector arm offset", () => {
  const advancedStart = instrumentHtml.indexOf('<details class="advanced-geometry">');
  const sourceDataStart = instrumentHtml.indexOf("data-source-data-panel");
  const advancedCopy = instrumentHtml.slice(advancedStart, sourceDataStart);

  assert.match(advancedCopy, /Geometry mode \/ 几何模式/);
  assert.match(advancedCopy, /Detector arm offset \/ 检测臂偏离/);
});

test("geometry boundary teaching copy covers every selectable geometry mode", () => {
  assert.match(instrumentHtml, /Right-angle \/ 直角采集/);
  assert.match(instrumentHtml, /Front-face \/ 前表面采集/);
  assert.match(instrumentHtml, /Transmission \/ 透射路径/);
  assert.match(instrumentHtml, /direct excitation|background risk/i);
  assert.match(instrumentHtml, /直射激发光|背景风险/);
});

test("wavelength controls expose the teaching-range and false-color boundary", () => {
  const wavelengthControlBlock = instrumentHtml.slice(
    instrumentHtml.indexOf('data-control="excitation-wavelength"'),
    instrumentHtml.indexOf('data-control="slit"')
  );

  assert.match(wavelengthControlBlock, /200-900 nm/i);
  assert.match(wavelengthControlBlock, /teaching selector range/i);
  assert.match(wavelengthControlBlock, /source\/detector\/sample response/i);
  assert.match(wavelengthControlBlock, /UV\/NIR[\s\S]*false-color/i);
  assert.match(wavelengthControlBlock, /教学选通范围/);
  assert.match(wavelengthControlBlock, /伪色/);
});

test("optical path notes identify monochromator internals as schematic selection cues", () => {
  const detailsStart = instrumentHtml.indexOf('<details class="instrument-principle-details">');
  const detailsEnd = instrumentHtml.indexOf("</details>", detailsStart);
  const detailsBlock = instrumentHtml.slice(detailsStart, detailsEnd);

  assert.match(detailsBlock, /schematic selection cues/i);
  assert.match(detailsBlock, /not ray-traced/i);
  assert.match(detailsBlock, /示意/);
  assert.match(detailsBlock, /不是光线追迹/);
});

test("geometry mode drives the fallback light-path diagram", () => {
  assert.match(
    instrumentScript,
    /dataset\.geometryMode/,
    "runtime should expose the selected geometry mode on the instrument root"
  );

  for (const geometryId of ["right-angle-90", "front-face", "transmission"]) {
    assert.match(
      instrumentHtml,
      new RegExp(`data-geometry-visual="${geometryId}"`),
      `2D fallback should include a ${geometryId} geometry visual cue`
    );
    assert.match(
      siteStyles,
      new RegExp(`data-geometry-mode="${geometryId}"[\\s\\S]*data-geometry-visual="${geometryId}"`),
      `CSS should show the ${geometryId} geometry visual when selected`
    );
  }
});

test("mobile onboarding stays stacked and keeps explanatory copy visible", () => {
  const instrumentOnboardingIndex = siteStyles.indexOf(".instrument-onboarding {", siteStyles.indexOf("@media (max-width: 780px)", siteStyles.indexOf(".teaching-card-grid")));
  const nextMobileBlockIndex = siteStyles.indexOf("@media (max-width: 560px)", instrumentOnboardingIndex);
  assert.ok(instrumentOnboardingIndex > 0, "expected mobile instrument onboarding CSS");
  assert.ok(nextMobileBlockIndex > instrumentOnboardingIndex, "expected next mobile CSS block");
  const mobileBlock = siteStyles.slice(instrumentOnboardingIndex, nextMobileBlockIndex);
  const onboardingRule = mobileBlock.match(/\.instrument-onboarding\s*\{[\s\S]*?\}/)?.[0] || "";
  const onboardingSpanRule = mobileBlock.match(/\.instrument-onboarding span\s*\{[\s\S]*?\}/)?.[0] || "";

  assert.match(mobileBlock, /\.instrument-onboarding\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.doesNotMatch(onboardingRule, /overflow-x:\s*auto/);
  assert.doesNotMatch(onboardingSpanRule, /display:\s*none/);
});

test("instrument element collection includes advanced response-chain controls", () => {
  const selectors = [];
  const fakeRoot = {
    querySelector(selector) {
      selectors.push(selector);
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };

  const elements = collectInstrumentElements(fakeRoot);

  assert.equal(elements.controls.sourceType, null);
  assert.equal(elements.controls.detectorType, null);
  assert.equal(elements.controls.geometryMode, null);
  assert.equal(elements.controls.spectrumView, null);
  assert.equal(elements.controls.showComponents, null);
  assert.equal(elements.controls.showNoise, null);
  assert.equal(elements.controls.showArtifacts, null);
  assert.ok(selectors.includes('[data-control="source-type"]'));
  assert.ok(selectors.includes('[data-control="detector-type"]'));
  assert.ok(selectors.includes('[data-control="geometry-mode"]'));
  assert.ok(selectors.includes('[data-control="spectrum-view"]'));
  assert.ok(selectors.includes('[data-control="show-components"]'));
  assert.ok(selectors.includes('[data-control="show-noise"]'));
  assert.ok(selectors.includes('[data-control="show-artifacts"]'));
});

test("sample preset select can be synchronized from the shared preset options", () => {
  assert.equal(typeof spectrumUi.syncSamplePresetOptions, "function");
  const sampleSelect = {
    options: [],
    value: "",
    textContent: "stale fallback",
    append(...nodes) {
      this.options.push(...nodes);
    },
  };
  const fakeDocument = {
    createElement(tagName) {
      assert.equal(tagName, "option");
      return {
        value: "",
        textContent: "",
      };
    },
  };

  spectrumUi.syncSamplePresetOptions({ controls: { sample: sampleSelect } }, fakeDocument);

  assert.deepEqual(
    sampleSelect.options.map((option) => [option.value, option.textContent]),
    SAMPLE_PRESET_OPTIONS.map((option) => [option.id, option.label])
  );
});

test("source, detector, and geometry preset selects can be synchronized from shared preset options", () => {
  assert.equal(typeof spectrumUi.syncSimulatorPresetOptions, "function");
  const sourceSelect = {
    options: [],
    value: "",
    textContent: "stale source fallback",
    append(...nodes) {
      this.options.push(...nodes);
    },
  };
  const detectorSelect = {
    options: [],
    value: "",
    textContent: "stale detector fallback",
    append(...nodes) {
      this.options.push(...nodes);
    },
  };
  const geometrySelect = {
    options: [],
    value: "",
    textContent: "stale geometry fallback",
    append(...nodes) {
      this.options.push(...nodes);
    },
  };
  const fakeDocument = {
    createElement(tagName) {
      assert.equal(tagName, "option");
      return {
        value: "",
        textContent: "",
      };
    },
  };

  spectrumUi.syncSimulatorPresetOptions(
    { controls: { sourceType: sourceSelect, detectorType: detectorSelect, geometryMode: geometrySelect } },
    fakeDocument
  );

  assert.deepEqual(
    sourceSelect.options.map((option) => [option.value, option.textContent]),
    optionPairs(SOURCE_PRESET_OPTIONS)
  );
  assert.deepEqual(
    detectorSelect.options.map((option) => [option.value, option.textContent]),
    optionPairs(DETECTOR_PRESET_OPTIONS)
  );
  assert.deepEqual(
    geometrySelect.options.map((option) => [option.value, option.textContent]),
    optionPairs(GEOMETRY_PRESET_OPTIONS)
  );
});

test("sample preset no-JS fallback options match the shared preset options", () => {
  assert.deepEqual(
    sampleSelectOptionsFromHtml(),
    SAMPLE_PRESET_OPTIONS.map((option) => [option.id, option.label])
  );
});

test("sample control exposes classic fluorescence teaching presets with boundaries", () => {
  const sampleStart = instrumentHtml.indexOf('data-control="sample"');
  const sampleEnd = instrumentHtml.indexOf("</label>", sampleStart);
  const sampleBlock = instrumentHtml.slice(sampleStart, sampleEnd);

  assert.match(sampleBlock, /Rhodamine 6G-like dye/);
  assert.match(sampleBlock, /EGFP-like protein/);
  assert.match(sampleBlock, /synthetic analogs/i);
  assert.match(sampleBlock, /合成类比/);
});

test("sample cell exposes an accessible popup sample chooser", () => {
  assert.match(instrumentHtml, /data-sample-picker-trigger/);
  assert.match(instrumentHtml, /aria-haspopup="dialog"/);
  assert.match(instrumentHtml, /aria-controls="sample-picker"/);
  assert.match(instrumentHtml, /Open sample chooser \/ 打开样品选择/);
  assert.match(instrumentHtml, /id="sample-picker"[\s\S]*data-sample-picker[\s\S]*role="dialog"/);
  assert.match(instrumentHtml, /data-sample-picker-options/);
  assert.match(instrumentHtml, /data-sample-picker-close/);
  assert.match(instrumentHtml, /Choose a sample \/ 选择样品/);
  assert.match(instrumentHtml, /synthetic teaching presets|合成教学预设/);
  assert.match(instrumentScript, /openSamplePicker/);
  assert.match(instrumentScript, /data-sample-picker-option/);
  assert.match(sceneScript, /sample cell to open the sample chooser|点击样品池打开样品选择/);
});

test("source, detector, and geometry no-JS fallback options match the shared preset options", () => {
  assert.deepEqual(
    selectOptionsFromHtml("source-type"),
    optionPairs(SOURCE_PRESET_OPTIONS)
  );
  assert.deepEqual(
    selectOptionsFromHtml("detector-type"),
    optionPairs(DETECTOR_PRESET_OPTIONS)
  );
  assert.deepEqual(
    selectOptionsFromHtml("geometry-mode"),
    optionPairs(GEOMETRY_PRESET_OPTIONS)
  );
});

test("3D scene auto-starts with an honest no-JS fallback state", () => {
  const enableMatches = instrumentHtml.match(/data-action="enable-3d"/g) || [];
  assert.equal(enableMatches.length, 1, "instrument page should keep one retry/enable control for fallback recovery");

  const statusMatch = instrumentHtml.match(/<span[^>]*data-webgl-status[^>]*>([\s\S]*?)<\/span>/);
  assert.ok(statusMatch, "instrument page should include a WebGL status element");
  assert.match(statusMatch[0], /aria-live="polite"/);
  assert.match(statusMatch[0], /aria-atomic="true"/);
  assert.doesNotMatch(statusMatch[1], /Loading|正在加载/);
  assert.match(statusMatch[1], /2D|二维|fallback|备用/i);

  const defaultFallbackIndex = instrumentScript.lastIndexOf('root.classList.add("has-2d-fallback")');
  const applyStateIndex = instrumentScript.indexOf("applyState();", defaultFallbackIndex);
  const autoStartIndex = instrumentScript.indexOf("createScene();", applyStateIndex);
  const sourceDataIndex = instrumentScript.indexOf("initializeSourceDataWhenNeeded();", applyStateIndex);
  assert.ok(defaultFallbackIndex > 0, "runtime should preserve default fallback before JavaScript scene load");
  assert.ok(autoStartIndex > applyStateIndex, "runtime should auto-start the 3D scene after initial state is applied");
  assert.ok(sourceDataIndex > autoStartIndex, "3D scene should be started before deferred source-derived examples");
});

test("3D scene exposes geometry-mode teaching cues", () => {
  assert.match(
    sceneScript,
    /createGeometryModeCue/,
    "3D scene should create a geometry-mode cue instead of relying only on the 2D fallback SVG"
  );
  assert.match(
    sceneScript,
    /updateGeometryModeCue/,
    "3D scene should update the cue when geometry mode changes"
  );
  assert.match(
    sceneScript,
    /currentState\.geometry\?\.id/,
    "3D scene update should read the selected geometry mode from state"
  );
  assert.match(sceneScript, /Front-face boundary \/ 前表面边界/);
  assert.match(sceneScript, /Direct-path risk \/ 直射风险/);
});

test("3D overlay copy follows language-mode filtering", () => {
  const overlayMatch = instrumentHtml.match(/<div class="instrument-scene-overlay"[\s\S]*?<\/div>/);
  assert.ok(overlayMatch, "expected 3D overlay copy");
  assert.match(overlayMatch[0], /data-language="en"/);
  assert.match(overlayMatch[0], /data-language="zh"/);
  assert.match(overlayMatch[0], /lang="zh-CN"/);
});

test("3D scene de-emphasizes inactive labels and uses signal semantics after the detector", () => {
  assert.match(sceneScript, /isContextAnchor \? 0\.18 : 0\.035/);
  assert.match(sceneScript, /function createSignalLine/);
  assert.match(sceneScript, /LineDashedMaterial/);
  assert.match(sceneScript, /function setSignalLineBetween/);
  assert.match(sceneScript, /signal:\s*createSignalLine/);
  assert.doesNotMatch(sceneScript, /signal:\s*createBeam/);
});

test("mobile view keeps WebGL fallback status visible", () => {
  assert.match(
    siteStyles,
    /\.instrument-view-toolbar span:not\(\[data-webgl-status\]\)/,
    "mobile toolbar rule should not hide the WebGL status span"
  );
  assert.match(
    siteStyles,
    /\.instrument-view-toolbar \[data-webgl-status\]\s*{[\s\S]*?display: block;/,
    "mobile WebGL status should be explicitly restored as visible text"
  );
  assert.match(
    instrumentHtml,
    /class="instrument-fallback-status"[^>]*data-webgl-status/,
    "2D fallback should expose a visible WebGL status outside the hidden 3D stage"
  );
  assert.match(
    instrumentScript,
    /webglStatuses/,
    "runtime should keep all duplicated WebGL status regions synchronized"
  );
});

test("fallback diagram reserves space around status and scan labels", () => {
  assert.match(
    siteStyles,
    /--fallback-status-clearance:/,
    "fallback diagram should reserve explicit space for the WebGL status pill"
  );
  assert.match(
    siteStyles,
    /\.instrument-diagram\s*{[\s\S]*?top:\s*var\(--fallback-status-clearance\)/,
    "fallback SVG should start below the visible status pill instead of sitting under it"
  );

  const scanBadgeMatch = instrumentHtml.match(
    /<g class="scan-badge scan-badge-emission" transform="translate\(([-\d.]+) ([-\d.]+)\)">[\s\S]*?<text[^>]*y="([-\d.]+)"/
  );
  const rightAngleLabelMatch = instrumentHtml.match(
    /<text class="geometry-cue-label" x="[-\d.]+" y="([-\d.]+)">right-angle/
  );
  assert.ok(scanBadgeMatch, "expected emission scan badge coordinates");
  assert.ok(rightAngleLabelMatch, "expected right-angle geometry label coordinate");

  const scanBadgeTextY = Number(scanBadgeMatch[2]) + Number(scanBadgeMatch[3]);
  const rightAngleLabelY = Number(rightAngleLabelMatch[1]);

  assert.ok(
    Math.abs(scanBadgeTextY - rightAngleLabelY) >= 30,
    `emission scan badge and right-angle geometry label are too close: ${scanBadgeTextY} vs ${rightAngleLabelY}`
  );
});

test("primary instrument model spans the desktop workbench", () => {
  assert.match(
    siteStyles,
    /\.instrument-model-panel\s*{[\s\S]*?grid-column:\s*1\s*\/\s*-1;/,
    "desktop model panel should span the full workstation width"
  );
  assert.match(
    siteStyles,
    /\.instrument-side\s*{[\s\S]*?grid-column:\s*1\s*\/\s*-1;/,
    "secondary controls should sit below the full-width model panel"
  );
  assert.match(
    siteStyles,
    /\.instrument-stage-3d\s*{[\s\S]*?min-height:\s*clamp\(/,
    "primary 3D stage should use a viewport-aware height instead of the old half-page panel height"
  );
});

test("default 3D model leads the workbench visual order", () => {
  assert.match(
    siteStyles,
    /\.instrument-model-panel\s*{[\s\S]*?order:\s*1;/,
    "default 3D model should be the first visual item inside the workbench"
  );
  assert.match(
    siteStyles,
    /\.instrument-onboarding\s*{[\s\S]*?order:\s*2;/,
    "onboarding tips should follow the primary model instead of pushing it below the first workbench screen"
  );
  assert.match(
    siteStyles,
    /\.instrument-side\s*{[\s\S]*?order:\s*3;/,
    "secondary controls should remain after the primary model and onboarding tips in the workbench flow"
  );
});

test("module load failure updates every WebGL fallback status region", () => {
  assert.match(
    instrumentHtml,
    /querySelectorAll\("\[data-webgl-status\]"\)/,
    "module failure handler should collect all WebGL status regions, including the visible 2D fallback status"
  );
  assert.match(
    instrumentHtml,
    /statusElements\.forEach/,
    "module failure handler should update every duplicated WebGL status region"
  );
});

test("instrument page exposes a persistent language display framework", () => {
  assert.match(
    instrumentHtml,
    /data-instrument-lab[^>]*data-language-mode="bilingual"/,
    "instrument root should default to bilingual so no-JS remains readable"
  );

  const languageControlIndex = instrumentHtml.indexOf("data-language-mode-control");
  const workstationIndex = instrumentHtml.indexOf("instrument-workstation");
  assert.ok(languageControlIndex > 0, "language mode control should exist");
  assert.ok(languageControlIndex < workstationIndex, "language mode control should be discoverable before the workbench");

  for (const mode of ["en", "zh", "bilingual"]) {
    assert.match(
      instrumentHtml,
      new RegExp(`data-language-mode-option="${mode}"`),
      `missing ${mode} language mode button`
    );
  }

  assert.match(instrumentHtml, /data-language="en"/, "English long-form copy should be structurally marked");
  assert.match(instrumentHtml, /data-language="zh"/, "Chinese long-form copy should be structurally marked");
  assert.match(instrumentScript, /instrumentLanguageMode/, "language mode should use a stable localStorage key");
  assert.match(instrumentScript, /localStorage/, "language mode should persist locally");
});

test("single-language mode can collapse dense static workbench labels", () => {
  assert.match(
    instrumentScript,
    /syncLocalizedStaticText/,
    "runtime should relocalize static labels that are not data-language span pairs"
  );
  assert.match(
    instrumentScript,
    /data-localize-text/,
    "runtime should target explicit static localizable labels"
  );

  const denseLabelSources = [
    "Language / 语言",
    "Both / 双语",
    "1. Choose a mode / 选择模式",
    "3. Inspect a mono / 查看单色器",
    "Controls / 控制面板",
    "Explore the scan model / 探索扫描模型",
    "Mode / 模式",
    "Emission scan / 发射扫描",
    "Excitation wavelength / 激发波长",
    "Angle: / 光栅角：",
    "Teaching selector; not a calibrated range. / 教学选通，非校准量程。",
  ];

  for (const source of denseLabelSources) {
    const sourceIndex = instrumentHtml.indexOf(source);
    assert.ok(sourceIndex > 0, `missing dense label source: ${source}`);
    const tagStart = instrumentHtml.lastIndexOf("<", sourceIndex);
    const tagEnd = instrumentHtml.indexOf(">", tagStart);
    const openingTag = instrumentHtml.slice(tagStart, tagEnd + 1);
    assert.match(openingTag, /data-localize-text/, `dense label should be static-localized: ${source}`);
  }
});

test("instrument route cache key changes with the sample picker slice", () => {
  assert.match(
    instrumentHtml,
    /instrument\.js\?v=sample-picker-20260619/,
    "instrument.js cache key should be bumped when route-local runtime controls change"
  );
  assert.match(
    instrumentScript,
    /state\.mjs\?v=sample-picker-20260619/,
    "state module cache key should be bumped when preset runtime data changes"
  );
  assert.match(
    instrumentScript,
    /InstrumentScene\.mjs\?v=sample-picker-20260619/,
    "scene module cache key should be bumped when 3D scene rendering changes"
  );
});

test("instrument stylesheet cache key changes with the fallback overlap fix", () => {
  assert.match(
    instrumentHtml,
    /styles\.css\?v=fallback-overlap-20260611/,
    "instrument stylesheet cache key should be bumped when fallback SVG layout changes"
  );
});

test("language switch is touch-sized and non-misleading without JavaScript", () => {
  const languageButtons = Array.from(
    instrumentHtml.matchAll(/<button type="button"[^>]*data-language-mode-option="[^"]+"[^>]*>/g)
  ).map((match) => match[0]);
  assert.equal(languageButtons.length, 3, "expected three language mode buttons");
  languageButtons.forEach((button) => {
    assert.match(button, /disabled/, "language buttons should be disabled until JavaScript enables them");
  });

  assert.match(
    siteStyles,
    /\.instrument-language-switch button\s*{[\s\S]*?min-height:\s*(?:40px|2\.5rem)/,
    "language switch buttons should meet the 40px touch target baseline"
  );
  assert.match(
    instrumentScript,
    /enableLanguageModeControl/,
    "runtime should explicitly enable language mode buttons after JavaScript loads"
  );
  assert.match(
    instrumentScript,
    /button\.disabled\s*=\s*false/,
    "runtime should remove the no-JS disabled state from language mode buttons"
  );
});

test("long explanatory panels expose language-separable copy", () => {
  const introBlocks = blocksForClass("source-data-intro");
  assert.ok(introBlocks.length >= 3, "expected source/correction/geometry intro copy");
  introBlocks.forEach((block) => {
    assert.match(block, /data-language="en"/);
    assert.match(block, /data-language="zh"/);
  });

  const smallDisclaimers = blocksForClass("instrument-disclaimer-small");
  assert.ok(smallDisclaimers.length >= 2, "expected small boundary disclaimers");
  smallDisclaimers.forEach((block) => {
    assert.match(block, /data-language="en"/);
    assert.match(block, /data-language="zh"/);
  });

  const teachingCards = instrumentHtml.match(/<article[^>]+class="teaching-card"[\s\S]*?<\/article>/g) || [];
  assert.ok(teachingCards.length >= 10, "expected corrections and geometry teaching cards");
  teachingCards.forEach((card) => {
    assert.match(card, /data-language="en"/);
    assert.match(card, /data-language="zh"/);
  });

  const noscriptMatch = instrumentHtml.match(/<noscript>[\s\S]*?<\/noscript>/);
  assert.ok(noscriptMatch, "expected no-JS fallback copy");
  assert.match(noscriptMatch[0], /data-language="en"/);
  assert.match(noscriptMatch[0], /data-language="zh"/);
});

test("first-screen operation copy presents 3D as the default path with 2D fallback", () => {
  const onboardingStart = instrumentHtml.indexOf('<div class="instrument-onboarding"');
  const onboardingEnd = instrumentHtml.indexOf("</div>", onboardingStart);
  const onboarding = instrumentHtml.slice(onboardingStart, onboardingEnd);
  const sceneHintMatch = instrumentHtml.match(/<p class="instrument-operability-note"[\s\S]*?<\/p>/);
  const sceneHint = sceneHintMatch?.[0] || "";

  assert.match(instrumentHtml, /3D bench loads by default|默认加载 3D 光学平台/);
  assert.match(onboarding, /default 3D bench|默认 3D 光学平台/);
  assert.doesNotMatch(onboarding, /then drag the grating/);
  assert.match(sceneHint, /default 3D bench|默认 3D 光学平台/);
  assert.match(sceneHint, /drag .*grating|拖动.*光栅/);
});

test("optical path detail notes follow the language display framework", () => {
  const detailsStart = instrumentHtml.indexOf('<details class="instrument-principle-details">');
  const detailsEnd = instrumentHtml.indexOf("</details>", detailsStart);
  const block = instrumentHtml.slice(detailsStart, detailsEnd);
  const notes = block.match(/<p>[\s\S]*?<\/p>/g) || [];

  assert.ok(notes.length >= 5, "expected optical path notes plus the monochromator schematic boundary");
  notes.forEach((note) => {
    assert.match(note, /data-language="en"/);
    assert.match(note, /data-language="zh" lang="zh-CN"/);
  });
});

test("diagnostic cards expose machine-readable evidence keys", () => {
  const previousDocument = globalThis.document;
  const fakeDocument = {
    createElement(tagName) {
      return {
        tagName,
        attributes: {},
        children: [],
        className: "",
        hidden: false,
        textContent: "",
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        append(...children) {
          this.children.push(...children);
        },
      };
    },
  };
  const diagnosticsList = {
    textContent: "stale diagnostics",
    children: [],
    appendChild(node) {
      this.children.push(node);
    },
  };

  globalThis.document = fakeDocument;
  try {
    updateDiagnostics(
      { diagnosticsList },
      [
        {
          tone: "warn",
          evidenceKey: "ILAB-004",
          label: "Resolution tradeoff / 分辨率权衡",
          text: "Slit width changes throughput and bandpass. / 狭缝宽度改变通量和带宽。",
        },
      ]
    );
  } finally {
    globalThis.document = previousDocument;
  }

  assert.equal(diagnosticsList.textContent, "");
  assert.equal(diagnosticsList.children.length, 1);
  assert.equal(diagnosticsList.children[0].attributes["data-evidence-key"], "ILAB-004");
  assert.match(diagnosticsList.children[0].attributes["aria-label"], /ILAB-004/);
});

test("dynamic diagnostic cards follow the selected language mode", () => {
  const previousDocument = globalThis.document;
  const fakeDocument = {
    createElement(tagName) {
      return {
        tagName,
        attributes: {},
        children: [],
        className: "",
        hidden: false,
        textContent: "",
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        append(...children) {
          this.children.push(...children);
        },
      };
    },
  };

  function renderFor(languageMode) {
    const diagnosticsList = {
      textContent: "stale diagnostics",
      children: [],
      appendChild(node) {
        this.children.push(node);
      },
    };

    updateDiagnostics(
      { root: { dataset: { languageMode } }, diagnosticsList },
      [
        {
          tone: "warn",
          evidenceKey: "ILAB-004",
          label: "Resolution tradeoff / 分辨率权衡",
          text: "Slit width changes throughput and bandpass. / 狭缝宽度改变通量和带宽。",
        },
      ]
    );
    return diagnosticsList.children[0];
  }

  globalThis.document = fakeDocument;
  try {
    const english = renderFor("en");
    assert.equal(english.children[0].textContent, "Resolution tradeoff");
    assert.equal(english.children[2].textContent, "Slit width changes throughput and bandpass.");
    assert.equal(hasCjk(english.attributes["aria-label"]), false);

    const chinese = renderFor("zh");
    assert.equal(chinese.children[0].textContent, "分辨率权衡");
    assert.equal(chinese.children[2].textContent, "狭缝宽度改变通量和带宽。");
    assert.doesNotMatch(chinese.attributes["aria-label"], /Resolution tradeoff|Slit width changes/);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("dynamic selected-part guidance follows the selected language mode", () => {
  const elements = {
    root: { dataset: { languageMode: "en" } },
    partButtons: [],
    partTitle: textNode(),
    partCopy: textNode(),
    partHint: textNode(),
    sceneHint: textNode(),
  };

  updatePartChrome(elements, { selectedPart: "excitation" });

  assert.equal(elements.partTitle.textContent, "Excitation monochromator");
  assert.equal(hasCjk(elements.partCopy.textContent), false);
  assert.equal(hasCjk(elements.partHint.textContent), false);

  elements.root.dataset.languageMode = "zh";
  updatePartChrome(elements, { selectedPart: "excitation" });

  assert.equal(elements.partTitle.textContent, "激发单色器");
  assert.doesNotMatch(elements.partCopy.textContent, /Uses slits/);
  assert.doesNotMatch(elements.partHint.textContent, /Click the excitation monochromator/);
});

test("dynamic localizer preserves slash-heavy English labels", () => {
  const label = "Excitation wavelength / EEM heatmap / 激发波长 / EEM 热图";

  assert.equal(spectrumUi.localizedText(label, "en"), "Excitation wavelength / EEM heatmap");
  assert.equal(spectrumUi.localizedText(label, "zh"), "激发波长 / EEM 热图");
  assert.equal(spectrumUi.localizedText(label, "bilingual"), label);
});

test("workbench exposes response-chain factor readouts", () => {
  assert.match(instrumentHtml, /Alignment \/ geometry \/ 对准 \/ 几何/);

  for (const readout of ["response-source", "response-sample", "response-detector", "signal-headroom"]) {
    assert.match(
      instrumentHtml,
      new RegExp(`data-readout="${readout}"`),
      `${readout} should be visible in the main workbench`
    );
  }

  const textNode = () => ({ textContent: "" });
  const elements = {
    controls: {
      emissionWavelength: { disabled: true },
    },
    readouts: {
      excitationAngle: textNode(),
      emissionAngle: textNode(),
      excitation: textNode(),
      emission: textNode(),
      slit: textNode(),
      bandpass: textNode(),
      integration: textNode(),
      sourceOffset: textNode(),
      detectorAngle: textNode(),
      throughput: textNode(),
      overlap: textNode(),
      collection: textNode(),
      responseSource: textNode(),
      responseSample: textNode(),
      responseDetector: textNode(),
      signalHeadroom: textNode(),
    },
    sampleNote: textNode(),
    emissionLabel: textNode(),
  };

  updateControlsFromState(
    elements,
    {
      exMono: { gratingAngleDeg: 12.9 },
      emMono: { gratingAngleDeg: 18.5 },
      slit: { widthUm: 500 },
      integrationTimeMs: 200,
      source: { offsetUm: 0 },
      detector: { angleDeg: 90 },
    },
    {
      excitationNm: 365,
      emissionNm: 520,
      bandpassNm: 4.6,
      throughput: 0.75,
      alignment: { overlapFactor: 0.8 },
      detectorArm: { collectionFactor: 0.9 },
      scanMeta: { emissionControlLabel: "Emission wavelength / 发射波长" },
      spectrum: { profile: { description: "Synthetic teaching preset. / 合成教学预设。" } },
      responseChain: {
        source: { atExcitation: 0.64 },
        sample: { absorptionAtExcitation: 0.72 },
        detector: { atEmission: 0.58 },
        geometry: { collectionFactor: 0.42 },
        signal: { saturationRatio: 0.31 },
      },
    }
  );

  assert.equal(elements.readouts.collection.textContent, "42%");
  assert.equal(elements.readouts.responseSource.textContent, "64%");
  assert.equal(elements.readouts.responseSample.textContent, "72%");
  assert.equal(elements.readouts.responseDetector.textContent, "58%");
  assert.equal(elements.readouts.signalHeadroom.textContent, "69%");
});

test("workbench exposes raw and response-normalized spectrum view controls", () => {
  const sourceDataStart = instrumentHtml.indexOf("data-source-data-panel");
  const controlIndex = instrumentHtml.indexOf('data-control="spectrum-view"');

  assert.ok(controlIndex > 0, "spectrum view control should exist in the simulator workbench");
  assert.ok(controlIndex < sourceDataStart, "spectrum view control must stay separate from source-derived examples");
  assert.deepEqual(selectOptionsFromHtml("spectrum-view"), [
    ["raw", "Raw synthetic / 原始合成"],
    ["response-normalized", "Response-normalized teaching / 响应归一化教学"],
  ]);
  assert.match(instrumentHtml, /data-chart-scale/);
  assert.match(instrumentHtml, /not a calibrated correction|不是校准校正/);
});

test("workbench exposes noise and artifact teaching toggles", () => {
  const sourceDataStart = instrumentHtml.indexOf("data-source-data-panel");
  const noiseIndex = instrumentHtml.indexOf('data-control="show-noise"');
  const artifactsIndex = instrumentHtml.indexOf('data-control="show-artifacts"');

  assert.ok(noiseIndex > 0, "noise display toggle should exist in the simulator workbench");
  assert.ok(artifactsIndex > 0, "artifact display toggle should exist in the simulator workbench");
  assert.ok(noiseIndex < sourceDataStart, "noise toggle must stay separate from source-derived examples");
  assert.ok(artifactsIndex < sourceDataStart, "artifact toggle must stay separate from source-derived examples");
  assert.match(instrumentHtml, /Noise cue \/ 噪声提示/);
  assert.match(instrumentHtml, /Artifact cue \/ 伪影提示/);
  assert.match(instrumentHtml, /deterministic teaching perturbation|确定性教学扰动/);
  assert.match(instrumentHtml, /conceptual scatter\/background cues|概念散射与背景提示/);
});

test("workbench exposes synthetic component overlay controls and layers", () => {
  const sourceDataStart = instrumentHtml.indexOf("data-source-data-panel");
  const toggleIndex = instrumentHtml.indexOf('data-control="show-components"');
  const sampleLineIndex = instrumentHtml.indexOf('data-spectrum-component="sample"');
  const artifactLineIndex = instrumentHtml.indexOf('data-spectrum-component="artifact"');
  const noiseLineIndex = instrumentHtml.indexOf('data-spectrum-component="noise"');

  assert.ok(toggleIndex > 0, "component overlay toggle should exist in the simulator workbench");
  assert.ok(toggleIndex < sourceDataStart, "component overlay toggle must stay separate from source-derived examples");
  assert.ok(sampleLineIndex > 0, "sample component line should exist");
  assert.ok(artifactLineIndex > 0, "artifact/background component line should exist");
  assert.ok(noiseLineIndex > 0, "noise component line should exist");
  assert.match(instrumentHtml, /Component overlay \/ 组分叠加/);
  assert.match(instrumentHtml, /sample, baseline\/artifact, and noise cues|样品、基线\/伪影与噪声提示/);
  assert.match(instrumentHtml, /data-chart-components/);
  assert.match(siteStyles, /\.spectrum-component-trace/);
});

test("source-derived facts expose axes separately from processing and boundaries", () => {
  const factsIndex = instrumentHtml.indexOf("source-data-facts");
  const axesIndex = instrumentHtml.indexOf("data-source-axes");
  const processingIndex = instrumentHtml.indexOf("data-source-processing");
  const boundaryIndex = instrumentHtml.indexOf("data-source-boundary");

  assert.ok(factsIndex > 0, "source facts panel should exist");
  assert.ok(axesIndex > factsIndex, "source axes fact should exist in the facts panel");
  assert.ok(axesIndex < processingIndex, "axes should be visible before long processing notes");
  assert.ok(processingIndex < boundaryIndex, "processing and boundary facts should remain separate");
  assert.match(instrumentHtml, /Axes \/ 坐标轴/);
});

test("dynamic workbench status regions announce model changes accessibly", () => {
  const scanStateMatch = instrumentHtml.match(/<div class="scan-state-grid"[\s\S]*?>/);
  assert.ok(scanStateMatch, "expected scan-state-grid container");
  assert.match(scanStateMatch[0], /aria-live="polite"/);
  assert.match(scanStateMatch[0], /aria-atomic="false"/);

  const diagnosticsMatch = instrumentHtml.match(/<ul class="diagnostics-list"[^>]*data-diagnostics-list[^>]*>/);
  assert.ok(diagnosticsMatch, "expected diagnostics list");
  assert.match(diagnosticsMatch[0], /aria-live="polite"/);
  assert.match(diagnosticsMatch[0], /aria-relevant="additions text"/);
});
