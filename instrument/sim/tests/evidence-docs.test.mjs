import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyControlValue, createInstrumentState, setGratingWavelength } from "../state.mjs";
import { deriveInstrument } from "../physics/derive.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const researchLog = readFileSync(resolve(here, "../../../docs/instrument-research-log.md"), "utf8");
const modelNotes = readFileSync(resolve(here, "../../MODEL.md"), "utf8");
const instrumentHtml = readFileSync(resolve(here, "../../index.html"), "utf8");
const finalAudit = readFileSync(resolve(here, "../../../docs/instrument-refine-final-audit-2026-06-11.md"), "utf8");

function teachingCards() {
  return instrumentHtml.match(/<article class="teaching-card"[\s\S]*?<\/article>/g) || [];
}

function assertTeachingCardEvidence(label, evidenceKey) {
  const card = teachingCards().find((entry) => entry.includes(label));
  assert.ok(card, `expected teaching card for ${label}`);
  assert.match(card, new RegExp(`data-evidence-key="${evidenceKey}"`));
}

function assertEvidenceKeyExists(evidenceKey) {
  assert.match(researchLog, new RegExp(`Claim ${evidenceKey}:`), `${evidenceKey} should exist in the research log`);
}

test("research log covers noise and instrument-function teaching boundaries", () => {
  assert.match(researchLog, /Claim ILAB-010:[\s\S]*deterministic noise/i);
  assert.match(researchLog, /Claim ILAB-011:[\s\S]*instrument function/i);
  assert.doesNotMatch(researchLog, /Noise model:\s*document deterministic seed/i);
  assert.doesNotMatch(researchLog, /Instrument function:\s*document the Gaussian/i);
});

test("model notes describe deterministic noise and Gaussian instrument-function limits", () => {
  assert.match(modelNotes, /deterministic noise/i);
  assert.match(modelNotes, /unseeded random/i);
  assert.match(modelNotes, /Gaussian instrument-function/i);
  assert.match(modelNotes, /teaching convolution/i);
});

test("model notes match the current instrument-function hookup by scan mode", () => {
  assert.match(modelNotes, /emission scan[\s\S]*Gaussian[\s\S]*convolution/i);
  assert.match(modelNotes, /excitation scan[\s\S]*simplified width broadening/i);
  assert.doesNotMatch(modelNotes, /Gaussian[\s\S]*emission and excitation scan sample components/i);
});

test("model notes describe inner-filter risk as categorical teaching guidance", () => {
  assert.match(modelNotes, /inner-filter risk/i);
  assert.match(modelNotes, /categorical/i);
  assert.match(modelNotes, /ILAB-005/i);
  assert.match(modelNotes, /not a quantitative correction/i);
});

test("research log covers the selectable transmission geometry boundary", () => {
  assert.match(researchLog, /Claim ILAB-006:[\s\S]*0°\/180° transmitting geometry/i);
  assert.match(researchLog, /Claim ILAB-006:[\s\S]*transmission teaching mode/i);
  assert.match(researchLog, /Claim ILAB-006:[\s\S]*background risk/i);
});

test("static teaching cards are machine-linked to recorded ILAB evidence", () => {
  const cards = teachingCards();
  assert.ok(cards.length >= 10, "expected correction and geometry teaching cards");

  cards.forEach((card) => {
    const keyMatch = card.match(/data-evidence-key="(ILAB-\d{3})"/);
    assert.ok(keyMatch, `teaching card is missing data-evidence-key:\n${card}`);
    assert.match(researchLog, new RegExp(`Claim ${keyMatch[1]}:`), `${keyMatch[1]} should exist in the research log`);
  });

  assertTeachingCardEvidence("Detector response", "ILAB-003");
  assertTeachingCardEvidence("Excitation flux", "ILAB-002");
  assertTeachingCardEvidence("Slit bandpass", "ILAB-004");
  assertTeachingCardEvidence("Scatter bands", "ILAB-007");
  assertTeachingCardEvidence("Inner-filter effect", "ILAB-005");
  assertTeachingCardEvidence("Linearity & saturation", "ILAB-010");
  assertTeachingCardEvidence("Right-angle", "ILAB-006");
  assertTeachingCardEvidence("Front-face", "ILAB-006");
  assertTeachingCardEvidence("Transmission", "ILAB-006");
  assertTeachingCardEvidence("Sample environment", "ILAB-012");
  assertTeachingCardEvidence("Future data gate", "ILAB-009");
});

test("dynamic diagnostic evidence keys exist in the research log", () => {
  const scenarios = [];

  scenarios.push(createInstrumentState());

  const normalized = createInstrumentState();
  applyControlValue(normalized, "spectrum-view", "response-normalized");
  scenarios.push(normalized);

  const hiddenNoise = createInstrumentState();
  applyControlValue(hiddenNoise, "show-noise", false);
  scenarios.push(hiddenNoise);

  const busyWarning = createInstrumentState();
  busyWarning.slit.widthUm = 1000;
  busyWarning.detector.angleDeg = 82;
  busyWarning.sample.preset = "blank";
  scenarios.push(busyWarning);

  const geometryAndArtifacts = createInstrumentState();
  geometryAndArtifacts.geometry.id = "transmission";
  geometryAndArtifacts.sample.preset = "scattering";
  setGratingWavelength(geometryAndArtifacts, "emission", 730);
  scenarios.push(geometryAndArtifacts);

  const highTrace = createInstrumentState();
  highTrace.integrationTimeMs = 1000;
  highTrace.slit.widthUm = 1000;
  highTrace.source.id = "ideal-flat";
  highTrace.detector.id = "ideal-flat";
  scenarios.push(highTrace);

  const evidenceKeys = new Set(
    scenarios.flatMap((state) => deriveInstrument(state).diagnostics.map((diagnostic) => diagnostic.evidenceKey))
  );

  assert.ok(evidenceKeys.has("ILAB-010"), "expected headroom/noise evidence to be exercised");
  evidenceKeys.forEach(assertEvidenceKeyExists);
});

test("sample environment evidence covers environmental fluorescence effects", () => {
  assert.match(researchLog, /Claim ILAB-012:[\s\S]*temperature[\s\S]*pH[\s\S]*quench/i);
  assert.match(researchLog, /Claim ILAB-012:[\s\S]*(solvent|matrix)/i);
  assertTeachingCardEvidence("Sample environment", "ILAB-012");
});

test("classic named sample presets are bounded as synthetic analogs", () => {
  assert.match(researchLog, /Claim ILAB-013:/);
  assert.match(researchLog, /classic named sample presets/i);
  assert.match(researchLog, /synthetic analogs/i);
  assert.match(researchLog, /Rhodamine 6G/i);
  assert.match(researchLog, /EGFP/i);
  assert.match(researchLog, /source-derived examples remain display-only/i);
});

test("final refine audit maps every Definition of Done section to current evidence", () => {
  for (const section of ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6"]) {
    assert.match(finalAudit, new RegExp(`refine\\.md ${section}`), `missing DoD section ${section}`);
  }

  for (const command of [
    "node --test instrument/sim/tests/*.mjs",
    "node tools/preprocess-instrument-data.js --validate",
    "python tools/check_site.py",
    "node tools/check-instrument-browser.js",
    "git diff --check",
  ]) {
    assert.match(finalAudit, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing validation command ${command}`);
  }

  assert.match(finalAudit, /Status:\s*Satisfied/i);
  assert.match(finalAudit, /not a human comprehension study/i);
  assert.match(finalAudit, /no calibrated measurement/i);
  assert.match(finalAudit, /source-derived examples are display-only/i);
});
