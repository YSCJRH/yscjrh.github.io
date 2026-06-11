import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const researchLog = readFileSync(resolve(here, "../../../docs/instrument-research-log.md"), "utf8");
const modelNotes = readFileSync(resolve(here, "../../MODEL.md"), "utf8");
const instrumentHtml = readFileSync(resolve(here, "../../index.html"), "utf8");

function teachingCards() {
  return instrumentHtml.match(/<article class="teaching-card"[\s\S]*?<\/article>/g) || [];
}

function assertTeachingCardEvidence(label, evidenceKey) {
  const card = teachingCards().find((entry) => entry.includes(label));
  assert.ok(card, `expected teaching card for ${label}`);
  assert.match(card, new RegExp(`data-evidence-key="${evidenceKey}"`));
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
  assertTeachingCardEvidence("Sample environment", "ILAB-008");
  assertTeachingCardEvidence("Future data gate", "ILAB-009");
});
