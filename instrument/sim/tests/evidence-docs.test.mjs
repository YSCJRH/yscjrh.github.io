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
