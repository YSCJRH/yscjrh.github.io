import test from "node:test";
import assert from "node:assert/strict";
import { findClosestIndex, findEemPeak, getEemSlice } from "../ui/source-data.mjs";

const demoEem = {
  excitation: [250, 300, 350],
  emission: [400, 450],
  z: [
    [0.1, 0.8, 0.2],
    [0.05, 1, 0.25],
  ],
};

test("findClosestIndex resolves wavelength defaults without requiring exact axis values", () => {
  assert.equal(findClosestIndex(demoEem.excitation, 292), 1);
  assert.equal(findClosestIndex(demoEem.emission, 440), 1);
});

test("findEemPeak returns the strongest matrix coordinate", () => {
  const peak = findEemPeak(demoEem);

  assert.equal(peak.row, 1);
  assert.equal(peak.col, 1);
  assert.equal(peak.value, 1);
});

test("getEemSlice extracts display-only emission and excitation cross-sections", () => {
  const emissionSlice = getEemSlice(demoEem, "emission", 1);
  const excitationSlice = getEemSlice(demoEem, "excitation", 1);

  assert.deepEqual(emissionSlice.x, demoEem.emission);
  assert.deepEqual(emissionSlice.y, [0.8, 1]);
  assert.match(emissionSlice.fixedLabel, /Fixed Ex 300 nm/);

  assert.deepEqual(excitationSlice.x, demoEem.excitation);
  assert.deepEqual(excitationSlice.y, [0.05, 1, 0.25]);
  assert.match(excitationSlice.fixedLabel, /Fixed Em 450 nm/);
});

test("getEemSlice clamps out-of-range slice indexes", () => {
  const lowEmissionSlice = getEemSlice(demoEem, "emission", -10);
  const highEmissionSlice = getEemSlice(demoEem, "emission", 99);
  const highExcitationSlice = getEemSlice(demoEem, "excitation", 99);

  assert.deepEqual(lowEmissionSlice.y, [0.1, 0.05]);
  assert.match(lowEmissionSlice.fixedLabel, /Fixed Ex 250 nm/);
  assert.deepEqual(highEmissionSlice.y, [0.2, 0.25]);
  assert.match(highEmissionSlice.fixedLabel, /Fixed Ex 350 nm/);
  assert.match(highExcitationSlice.fixedLabel, /Fixed Em 450 nm/);
});

test("EEM helpers tolerate empty or malformed inputs without throwing", () => {
  assert.equal(findClosestIndex([], 300), 0);
  assert.deepEqual(findEemPeak({ z: [] }), { row: 0, col: 0, value: 0 });

  const emptySlice = getEemSlice({}, "emission", 4);
  assert.deepEqual(emptySlice.x, []);
  assert.deepEqual(emptySlice.y, []);
  assert.match(emptySlice.fixedLabel, /Fixed Ex -- nm/);
});
