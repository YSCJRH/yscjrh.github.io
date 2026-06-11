import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { collectInstrumentElements } from "../ui/spectrum.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const instrumentHtml = readFileSync(resolve(here, "../../index.html"), "utf8");

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
