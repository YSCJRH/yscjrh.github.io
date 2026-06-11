import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { collectInstrumentElements, updateControlsFromState, updateDiagnostics } from "../ui/spectrum.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const instrumentHtml = readFileSync(resolve(here, "../../index.html"), "utf8");
const instrumentScript = readFileSync(resolve(here, "../../instrument.js"), "utf8");

function blocksForClass(className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return instrumentHtml.match(new RegExp(`<([a-z]+)[^>]+class="[^"]*${escaped}[^"]*"[^>]*>[\\s\\S]*?<\\/\\1>`, "g")) || [];
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
      collection: { collectionFactor: 0.9 },
      scanMeta: { emissionControlLabel: "Emission wavelength / 发射波长" },
      spectrum: { profile: { description: "Synthetic teaching preset. / 合成教学预设。" } },
      responseChain: {
        source: { atExcitation: 0.64 },
        sample: { absorptionAtExcitation: 0.72 },
        detector: { atEmission: 0.58 },
        signal: { saturationRatio: 0.31 },
      },
    }
  );

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
