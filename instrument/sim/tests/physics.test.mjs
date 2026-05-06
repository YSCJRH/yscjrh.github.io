import test from "node:test";
import assert from "node:assert/strict";
import { createInstrumentState, gratingWavelengthForPart, setGeometryOffsets, setGratingWavelength } from "../state.mjs";
import { deriveInstrument } from "../physics/derive.mjs";
import {
  MONOCHROMATOR_GRATING_ANGLE_RANGE,
  gratingAngleFromWavelength,
  wavelengthFromGratingAngle,
} from "../physics/grating.mjs";
import { bandpassFromSlit, throughputFromSlit } from "../physics/monochromator.mjs";
import { deriveAlignment, collectionFromDetectorAngle } from "../physics/alignment.mjs";

test("grating angle derives a monotonic 200-900 nm teaching wavelength", () => {
  const minAngle = gratingAngleFromWavelength(200);
  const maxAngle = gratingAngleFromWavelength(900);
  const low = wavelengthFromGratingAngle(minAngle);
  const high = wavelengthFromGratingAngle(maxAngle);

  assert.ok(Math.abs(low - 200) < 0.001);
  assert.ok(Math.abs(high - 900) < 0.001);
  assert.ok(maxAngle > minAngle);
  assert.ok(high > low);
});

test("default grating wavelengths match the teaching channels", () => {
  const state = createInstrumentState();
  const derived = deriveInstrument(state);

  assert.equal(Math.round(derived.excitationNm), 365);
  assert.equal(Math.round(derived.emissionNm), 520);
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
  const shifted = deriveInstrument(state);

  assert.equal(Math.round(base.excitationNm), Math.round(shifted.excitationNm));
  assert.equal(Math.round(base.emissionNm), Math.round(shifted.emissionNm));
  assert.ok(shifted.alignment.overlapFactor < base.alignment.overlapFactor);
  assert.ok(shifted.beams.excitationIntensity < base.beams.excitationIntensity);
  assert.ok(shifted.beams.residualIntensity < base.beams.residualIntensity);
});

test("detector arm is best near 90 degrees", () => {
  const centered = collectionFromDetectorAngle(90);
  const tilted = collectionFromDetectorAngle(82);

  assert.ok(centered.collectionFactor > tilted.collectionFactor);
  assert.ok(tilted.backgroundRisk > centered.backgroundRisk);
});

test("detector angle changes collection without moving selected wavelengths", () => {
  const state = createInstrumentState();
  const base = deriveInstrument(state);

  state.detector.angleDeg = 82;
  const tilted = deriveInstrument(state);

  assert.equal(Math.round(base.excitationNm), Math.round(tilted.excitationNm));
  assert.equal(Math.round(base.emissionNm), Math.round(tilted.emissionNm));
  assert.ok(tilted.collection.collectionFactor < base.collection.collectionFactor);
  assert.ok(tilted.collection.backgroundRisk > base.collection.backgroundRisk);
});

test("mode changes chart axes but keeps source-derived controls separate", () => {
  const state = createInstrumentState();

  state.mode = "emission";
  const emission = deriveInstrument(state);
  assert.equal(emission.scanMeta.axisRange, "Emission 200-900 nm / 发射 200-900 nm");

  state.mode = "excitation";
  const excitation = deriveInstrument(state);
  assert.equal(excitation.scanMeta.axisRange, "Excitation 200-900 nm / 激发 200-900 nm");

  state.mode = "time";
  const time = deriveInstrument(state);
  assert.equal(time.scanMeta.axisRange, "Time 0-120 s / 时间 0-120 s");

  state.mode = "single";
  const single = deriveInstrument(state);
  assert.equal(single.scanMeta.axisRange, "Fixed Ex/Em monitor / 固定激发与发射监测");
  assert.equal(single.scanMeta.excitationBadge, "Fixed / 固定");
  assert.equal(single.scanMeta.emissionBadge, "Fixed / 固定");
});

test("single-point monitor responds to geometry without moving wavelengths", () => {
  const state = createInstrumentState();
  state.mode = "single";
  const base = deriveInstrument(state);
  const baseValues = base.spectrum.points.map((point) => point.rawY);

  state.source.offsetUm = 110;
  const offset = deriveInstrument(state);

  assert.equal(Math.round(base.excitationNm), Math.round(offset.excitationNm));
  assert.equal(Math.round(base.emissionNm), Math.round(offset.emissionNm));
  assert.ok(offset.spectrum.peak < base.spectrum.peak);
  assert.ok(baseValues.every((value) => value === baseValues[0]));
});

test("blank/background preset stays weak on fixed y scale", () => {
  const state = createInstrumentState();
  state.sample.preset = "blank";

  const derived = deriveInstrument(state);
  assert.ok(derived.spectrum.peak < 0.2);
  assert.equal(derived.spectrum.yScaleMax, 1.35);
});

test("3D grating angle updates clamp wavelengths without moving geometry", () => {
  const state = createInstrumentState();
  const base = deriveInstrument(state);

  setGeometryOffsets(state, {
    excitationAngleDeg: 99,
    emissionAngleDeg: -4,
  });
  const changed = deriveInstrument(state);

  assert.equal(state.exMono.gratingAngleDeg, MONOCHROMATOR_GRATING_ANGLE_RANGE.max);
  assert.equal(state.emMono.gratingAngleDeg, MONOCHROMATOR_GRATING_ANGLE_RANGE.min);
  assert.equal(Math.round(gratingWavelengthForPart(state, "excitation")), 900);
  assert.equal(Math.round(gratingWavelengthForPart(state, "emission")), 200);
  assert.notEqual(Math.round(base.excitationNm), Math.round(changed.excitationNm));
  assert.notEqual(Math.round(base.emissionNm), Math.round(changed.emissionNm));
  assert.equal(state.source.offsetUm, 0);
  assert.equal(state.sample.offsetUm, 0);
  assert.equal(state.detector.angleDeg, 90);
});

test("wavelength controls clamp both monochromators to 200-900 nm", () => {
  const state = createInstrumentState();

  setGratingWavelength(state, "excitation", 999);
  setGratingWavelength(state, "emission", 120);

  assert.equal(Math.round(gratingWavelengthForPart(state, "excitation")), 900);
  assert.equal(Math.round(gratingWavelengthForPart(state, "emission")), 200);
});

test("sample cell remains fixed when geometry offsets are applied", () => {
  const state = createInstrumentState();
  setGeometryOffsets(state, {
    sampleOffsetUm: 120,
    sourceOffsetUm: 80,
  });

  assert.equal(state.sample.offsetUm, 0);
  assert.equal(state.source.offsetUm, 80);
});
