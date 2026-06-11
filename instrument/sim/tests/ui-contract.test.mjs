import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import * as spectrumUi from "../ui/spectrum.mjs";
import { SAMPLE_PRESET_OPTIONS } from "../data/samplePresets.mjs";
import { DETECTOR_PRESET_OPTIONS } from "../physics/detector.mjs";
import { SOURCE_PRESET_OPTIONS } from "../physics/source.mjs";

const { collectInstrumentElements, updateControlsFromState, updateDiagnostics } = spectrumUi;

const here = dirname(fileURLToPath(import.meta.url));
const instrumentHtml = readFileSync(resolve(here, "../../index.html"), "utf8");
const instrumentScript = readFileSync(resolve(here, "../../instrument.js"), "utf8");
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

test("advanced response-chain controls live in the simulator workbench", () => {
  const advancedStart = instrumentHtml.indexOf('<details class="advanced-geometry">');
  const sourceDataStart = instrumentHtml.indexOf("data-source-data-panel");

  assert.ok(advancedStart > 0);
  assert.ok(sourceDataStart > advancedStart);

  for (const controlName of ["source-type", "detector-type", "geometry-mode"]) {
    const controlIndex = instrumentHtml.indexOf(`data-control="${controlName}"`);
    assert.ok(controlIndex > advancedStart, `${controlName} should be inside the advanced simulator controls`);
    assert.ok(controlIndex < sourceDataStart, `${controlName} must stay separate from source-derived examples`);
  }
});

test("advanced geometry copy separates geometry mode from detector arm offset", () => {
  const advancedStart = instrumentHtml.indexOf('<details class="advanced-geometry">');
  const sourceDataStart = instrumentHtml.indexOf("data-source-data-panel");
  const advancedCopy = instrumentHtml.slice(advancedStart, sourceDataStart);

  assert.match(advancedCopy, /Geometry mode \/ 几何模式/);
  assert.match(advancedCopy, /Detector arm offset \/ 检测臂偏离/);
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
  assert.ok(selectors.includes('[data-control="source-type"]'));
  assert.ok(selectors.includes('[data-control="detector-type"]'));
  assert.ok(selectors.includes('[data-control="geometry-mode"]'));
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

test("source and detector preset selects can be synchronized from shared preset options", () => {
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
    { controls: { sourceType: sourceSelect, detectorType: detectorSelect } },
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
});

test("sample preset no-JS fallback options match the shared preset options", () => {
  assert.deepEqual(
    sampleSelectOptionsFromHtml(),
    SAMPLE_PRESET_OPTIONS.map((option) => [option.id, option.label])
  );
});

test("source and detector no-JS fallback options match the shared preset options", () => {
  assert.deepEqual(
    selectOptionsFromHtml("source-type"),
    optionPairs(SOURCE_PRESET_OPTIONS)
  );
  assert.deepEqual(
    selectOptionsFromHtml("detector-type"),
    optionPairs(DETECTOR_PRESET_OPTIONS)
  );
});

test("3D scene is optional with an honest initial fallback state", () => {
  const enableMatches = instrumentHtml.match(/data-action="enable-3d"/g) || [];
  assert.equal(enableMatches.length, 1, "instrument page should expose one explicit 3D enable button");

  const statusMatch = instrumentHtml.match(/<span data-webgl-status>([\s\S]*?)<\/span>/);
  assert.ok(statusMatch, "instrument page should include a WebGL status element");
  assert.doesNotMatch(statusMatch[1], /Loading|正在加载/);
  assert.match(statusMatch[1], /2D|二维|fallback|备用/i);
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

  const teachingCards = instrumentHtml.match(/<article class="teaching-card">[\s\S]*?<\/article>/g) || [];
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
