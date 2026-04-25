import test from "node:test";
import assert from "node:assert/strict";
import { createInstrumentState } from "../state.mjs";
import { deriveInstrument } from "../physics/derive.mjs";
import { wavelengthFromGratingAngle } from "../physics/grating.mjs";
import { bandpassFromSlit, throughputFromSlit } from "../physics/monochromator.mjs";
import { deriveAlignment, collectionFromDetectorAngle } from "../physics/alignment.mjs";

test("grating angle derives a monotonic teaching wavelength", () => {
  const low = wavelengthFromGratingAngle(12);
  const high = wavelengthFromGratingAngle(20);

  assert.ok(low > 330 && low < 350);
  assert.ok(high > 520 && high < 570);
  assert.ok(high > low);
});

test("wider slit increases bandpass and throughput", () => {
  const narrowBandpass = bandpassFromSlit(150);
  const wideBandpass = bandpassFromSlit(900);
  const narrowThroughput = throughputFromSlit(150);
  const wideThroughput = throughputFromSlit(900);

  assert.ok(wideBandpass > narrowBandpass);
  assert.ok(wideThroughput > narrowThroughput);
});

test("alignment offset lowers intensity without changing selected wavelength", () => {
  const state = createInstrumentState();
  const base = deriveInstrument(state);

  state.source.offsetUm = 100;
  state.sample.offsetUm = 80;
  const shifted = deriveInstrument(state);

  assert.equal(Math.round(base.excitationNm), Math.round(shifted.excitationNm));
  assert.equal(Math.round(base.emissionNm), Math.round(shifted.emissionNm));
  assert.ok(shifted.alignment.overlapFactor < base.alignment.overlapFactor);
});

test("detector arm is best near 90 degrees", () => {
  const centered = collectionFromDetectorAngle(90);
  const tilted = collectionFromDetectorAngle(82);

  assert.ok(centered.collectionFactor > tilted.collectionFactor);
  assert.ok(tilted.backgroundRisk > centered.backgroundRisk);
});

test("mode changes chart axes but keeps source-derived controls separate", () => {
  const state = createInstrumentState();

  state.mode = "emission";
  const emission = deriveInstrument(state);
  assert.equal(emission.scanMeta.axisRange, "Emission 380-700 nm");

  state.mode = "excitation";
  const excitation = deriveInstrument(state);
  assert.equal(excitation.scanMeta.axisRange, "Excitation 250-550 nm");

  state.mode = "time";
  const time = deriveInstrument(state);
  assert.equal(time.scanMeta.axisRange, "Time 0-120 s");

  state.mode = "single";
  const single = deriveInstrument(state);
  assert.equal(single.scanMeta.axisRange, "Fixed Ex/Em monitor");
  assert.equal(single.scanMeta.excitationBadge, "Fixed");
  assert.equal(single.scanMeta.emissionBadge, "Fixed");
});

test("single-point monitor responds to geometry without moving wavelengths", () => {
  const state = createInstrumentState();
  state.mode = "single";
  const base = deriveInstrument(state);

  state.source.offsetUm = 110;
  state.sample.offsetUm = 100;
  const offset = deriveInstrument(state);

  assert.equal(Math.round(base.excitationNm), Math.round(offset.excitationNm));
  assert.equal(Math.round(base.emissionNm), Math.round(offset.emissionNm));
  assert.ok(offset.spectrum.peak < base.spectrum.peak);
});

test("blank/background preset stays weak on fixed y scale", () => {
  const state = createInstrumentState();
  state.sample.preset = "blank";

  const derived = deriveInstrument(state);
  assert.ok(derived.spectrum.peak < 0.2);
  assert.equal(derived.spectrum.yScaleMax, 1.35);
});
