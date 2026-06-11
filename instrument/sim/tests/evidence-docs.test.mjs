import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const researchLog = readFileSync(resolve(here, "../../../docs/instrument-research-log.md"), "utf8");
const modelNotes = readFileSync(resolve(here, "../../MODEL.md"), "utf8");

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
