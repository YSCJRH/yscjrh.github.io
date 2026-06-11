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
import { evaluateDetectorResponse } from "../physics/detector.mjs";
import { composeRawSignal } from "../physics/radiometry.mjs";
import { evaluateSourceSpectrum } from "../physics/source.mjs";

function gaussian(value, center, width) {
  const normalized = (value - center) / Math.max(width, 1);
  return Math.exp(-0.5 * normalized * normalized);
}

function deterministicNoise(index, seed) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value) - 0.5;
}

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

test("derived state exposes a bounded instrument response chain", () => {
  const state = createInstrumentState();
  const derived = deriveInstrument(state);

  assert.equal(derived.responseChain.claimLevel, "synthetic-teaching");
  assert.equal(derived.responseChain.source.id, "xenon-like");
  assert.equal(derived.responseChain.detector.id, "pmt-like-visible");
  assert.equal(derived.responseChain.geometry.id, "right-angle-90");

  for (const value of [
    derived.responseChain.source.atExcitation,
    derived.responseChain.detector.atEmission,
    derived.responseChain.sample.absorptionAtExcitation,
    derived.responseChain.sample.emissionAtEmission,
    derived.responseChain.signal.normalized,
  ]) {
    assert.ok(Number.isFinite(value));
    assert.ok(value >= 0);
    assert.ok(value <= 1);
  }

  assert.ok(["low", "medium", "high"].includes(derived.responseChain.signal.saturationRisk));
  assert.ok(["low", "medium", "high"].includes(derived.responseChain.artifacts.rayleighRisk.level));
  assert.ok(derived.responseChain.evidenceKeys.includes("ILAB-003"));
});

test("teaching source spectrum affects the synthetic emission trace", () => {
  const matched = createInstrumentState();
  matched.source.id = "led-365";
  const matchedDerived = deriveInstrument(matched);

  const mismatched = createInstrumentState();
  mismatched.source.id = "led-405";
  const mismatchedDerived = deriveInstrument(mismatched);

  assert.ok(matchedDerived.responseChain.source.atExcitation > mismatchedDerived.responseChain.source.atExcitation);
  assert.ok(matchedDerived.spectrum.peak > mismatchedDerived.spectrum.peak);
});

test("detector response affects both response chain and synthetic trace", () => {
  const flat = createInstrumentState();
  flat.detector.id = "ideal-flat";
  const flatDerived = deriveInstrument(flat);

  const pmt = createInstrumentState();
  pmt.detector.id = "pmt-like-visible";
  const pmtDerived = deriveInstrument(pmt);

  assert.ok(flatDerived.responseChain.detector.atEmission > pmtDerived.responseChain.detector.atEmission);
  assert.ok(flatDerived.responseChain.signal.normalized > pmtDerived.responseChain.signal.normalized);
  const flatTotal = flatDerived.spectrum.points.reduce((total, point) => total + point.rawY, 0);
  const pmtTotal = pmtDerived.spectrum.points.reduce((total, point) => total + point.rawY, 0);
  assert.ok(flatTotal > pmtTotal);
});

test("geometry mode affects both response chain and synthetic trace without moving wavelengths", () => {
  const rightAngle = createInstrumentState();
  rightAngle.geometry.id = "right-angle-90";
  const rightAngleDerived = deriveInstrument(rightAngle);

  const transmission = createInstrumentState();
  transmission.geometry.id = "transmission";
  const transmissionDerived = deriveInstrument(transmission);

  assert.equal(Math.round(rightAngleDerived.excitationNm), Math.round(transmissionDerived.excitationNm));
  assert.equal(Math.round(rightAngleDerived.emissionNm), Math.round(transmissionDerived.emissionNm));
  assert.ok(rightAngleDerived.responseChain.geometry.collectionFactor > transmissionDerived.responseChain.geometry.collectionFactor);
  assert.ok(rightAngleDerived.responseChain.signal.normalized > transmissionDerived.responseChain.signal.normalized);
  assert.ok(rightAngleDerived.spectrum.peak > transmissionDerived.spectrum.peak);
});

test("integration time scales response-chain signal and bounded synthetic trace", () => {
  const shortIntegration = createInstrumentState();
  shortIntegration.integrationTimeMs = 20;
  const shortDerived = deriveInstrument(shortIntegration);

  const longIntegration = createInstrumentState();
  longIntegration.integrationTimeMs = 1000;
  const longDerived = deriveInstrument(longIntegration);

  assert.ok(longDerived.responseChain.signal.saturationRatio > shortDerived.responseChain.signal.saturationRatio);
  assert.ok(longDerived.responseChain.signal.normalized >= shortDerived.responseChain.signal.normalized);
  assert.ok(longDerived.spectrum.peak > shortDerived.spectrum.peak);

  for (const point of longDerived.spectrum.points) {
    assert.ok(Number.isFinite(point.rawY));
    assert.ok(point.rawY >= 0);
    assert.ok(point.rawY <= longDerived.spectrum.yScaleMax);
  }
});

test("diagnostics carry research-log evidence keys", () => {
  const state = createInstrumentState();
  state.slit.widthUm = 1000;
  state.detector.angleDeg = 82;
  state.sample.preset = "blank";
  const derived = deriveInstrument(state);

  assert.ok(derived.diagnostics.length >= 4);
  for (const diagnostic of derived.diagnostics) {
    assert.match(diagnostic.evidenceKey, /^ILAB-\d{3}$/);
    assert.equal(typeof diagnostic.label, "string");
    assert.equal(typeof diagnostic.text, "string");
  }

  const evidenceKeys = new Set(derived.diagnostics.map((diagnostic) => diagnostic.evidenceKey));
  assert.ok(evidenceKeys.has("ILAB-004"));
  assert.ok(evidenceKeys.has("ILAB-006"));
  assert.ok(evidenceKeys.has("ILAB-008"));
});

test("diagnostics surface response-chain consequences", () => {
  const weakSource = createInstrumentState();
  weakSource.source.id = "led-405";
  const weakSourceLabels = deriveInstrument(weakSource).diagnostics.map((diagnostic) => diagnostic.label);
  assert.ok(weakSourceLabels.includes("Low source output / 光源输出较低"));

  const weakDetector = createInstrumentState();
  weakDetector.detector.id = "silicon-like";
  const weakDetectorLabels = deriveInstrument(weakDetector).diagnostics.map((diagnostic) => diagnostic.label);
  assert.ok(weakDetectorLabels.includes("Detector response / 检测器响应"));

  const transmission = createInstrumentState();
  transmission.geometry.id = "transmission";
  const transmissionLabels = deriveInstrument(transmission).diagnostics.map((diagnostic) => diagnostic.label);
  assert.ok(transmissionLabels.includes("Geometry mode / 几何模式"));

  const secondOrder = createInstrumentState();
  setGratingWavelength(secondOrder, "emission", 730);
  const secondOrderLabels = deriveInstrument(secondOrder).diagnostics.map((diagnostic) => diagnostic.label);
  assert.ok(secondOrderLabels.includes("Artifact risk / 伪影风险"));

  const highTrace = createInstrumentState();
  highTrace.integrationTimeMs = 1000;
  highTrace.slit.widthUm = 1000;
  highTrace.source.id = "ideal-flat";
  highTrace.detector.id = "ideal-flat";
  const highTraceLabels = deriveInstrument(highTrace).diagnostics.map((diagnostic) => diagnostic.label);
  assert.ok(highTraceLabels.includes("Signal headroom / 信号余量"));
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

test("single-point monitor is anchored to the response-chain signal", () => {
  const state = createInstrumentState();
  state.mode = "single";
  const derived = deriveInstrument(state);
  const expectedRaw = Math.min(derived.responseChain.signal.raw, derived.spectrum.yScaleMax);

  assert.ok(expectedRaw > 0);
  assert.equal(derived.spectrum.points.length, 12);
  assert.equal(derived.spectrum.peak, expectedRaw);
  derived.spectrum.points.forEach((point) => {
    assert.equal(point.rawY, expectedRaw);
    assert.equal(point.y, expectedRaw / derived.spectrum.yScaleMax);
  });
});

test("emission scan main fluorescence term is composed from response-chain factors per scanned wavelength", () => {
  const state = createInstrumentState();
  state.mode = "emission";
  const emissionPointIndex = 44;
  const scannedEmissionNm = 200 + ((900 - 200) * emissionPointIndex) / 95;
  setGratingWavelength(state, "emission", scannedEmissionNm);

  const derived = deriveInstrument(state);
  const point = derived.spectrum.points[emissionPointIndex];
  const profile = derived.spectrum.profile;
  const seed =
    derived.excitationNm * 0.011 +
    derived.emissionNm * 0.017 +
    derived.bandpassNm +
    state.integrationTimeMs * 0.001;
  const noise = deterministicNoise(emissionPointIndex, seed) * profile.noise;
  const baseline =
    profile.baseline +
    derived.bandpassNm * 0.002 +
    derived.responseChain.geometry.backgroundRisk * 0.028;
  const shiftedPeak = profile.emissionPeak + (derived.excitationNm - profile.excitationPeak) * 0.05;
  const emissionShapeAtWavelength = gaussian(
    point.x,
    shiftedPeak,
    profile.emissionWidth + derived.bandpassNm * 2.2
  );
  const signal = composeRawSignal({
    sourceAtExcitation: derived.responseChain.source.atExcitation,
    excitationBandpassTransmission: derived.throughput * derived.alignment.overlapFactor,
    absorptionAtExcitation: derived.responseChain.sample.absorptionAtExcitation,
    quantumYield: profile.amplitude,
    emissionShapeAtWavelength,
    emissionBandpassTransmission: derived.throughput,
    detectorResponseAtEmission: evaluateDetectorResponse(state.detector.id, point.x),
    collectionFactor: derived.responseChain.geometry.collectionFactor,
    integrationMs: state.integrationTimeMs,
    darkBaseline: baseline,
    background: 0,
    saturationThreshold: 1.15,
  });

  assert.equal(point.x, scannedEmissionNm);
  assert.ok(signal.raw > baseline);
  assert.ok(Math.abs(point.rawY - (signal.raw + noise)) < 1e-12);
});

test("excitation scan main fluorescence term is composed from response-chain factors per scanned wavelength", () => {
  const state = createInstrumentState();
  state.mode = "excitation";
  const excitationPointIndex = 22;

  const derived = deriveInstrument(state);
  const point = derived.spectrum.points[excitationPointIndex];
  const profile = derived.spectrum.profile;
  const seed =
    derived.excitationNm * 0.011 +
    derived.emissionNm * 0.017 +
    derived.bandpassNm +
    state.integrationTimeMs * 0.001;
  const noise = deterministicNoise(excitationPointIndex, seed) * profile.noise;
  const baseline =
    profile.baseline +
    derived.bandpassNm * 0.002 +
    derived.responseChain.geometry.backgroundRisk * 0.028;
  const emissionShapeAtWavelength = gaussian(
    derived.emissionNm,
    profile.emissionPeak,
    profile.emissionWidth + derived.bandpassNm
  );
  const absorptionAtExcitation = gaussian(
    point.x,
    profile.excitationPeak,
    profile.excitationWidth + derived.bandpassNm * 1.35
  );
  const signal = composeRawSignal({
    sourceAtExcitation: evaluateSourceSpectrum(state.source.id, point.x),
    excitationBandpassTransmission: derived.throughput * derived.alignment.overlapFactor,
    absorptionAtExcitation,
    quantumYield: profile.amplitude,
    emissionShapeAtWavelength,
    emissionBandpassTransmission: derived.throughput,
    detectorResponseAtEmission: evaluateDetectorResponse(state.detector.id, derived.emissionNm),
    collectionFactor: derived.responseChain.geometry.collectionFactor,
    integrationMs: state.integrationTimeMs,
    darkBaseline: baseline,
    background: 0,
    saturationThreshold: 1.15,
  });

  assert.ok(Math.abs(point.x - 362.1052631578947) < 1e-12);
  assert.ok(signal.raw > baseline);
  assert.ok(Math.abs(point.rawY - (signal.raw + noise)) < 1e-12);
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
