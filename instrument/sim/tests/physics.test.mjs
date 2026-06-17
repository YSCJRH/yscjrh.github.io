import test from "node:test";
import assert from "node:assert/strict";
import {
  applyControlValue,
  createInstrumentState,
  gratingWavelengthForPart,
  setGeometryOffsets,
  setGratingWavelength,
} from "../state.mjs";
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

function componentVariance(points, componentKey) {
  const values = points.map((point) => Number(point.components?.[componentKey]) || 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  const mean = points.reduce((sum, point, index) => sum + point.x * values[index], 0) / total;
  return points.reduce((sum, point, index) => sum + (point.x - mean) ** 2 * values[index], 0) / total;
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

test("default spectrum view is raw synthetic", () => {
  const state = createInstrumentState();
  const derived = deriveInstrument(state);

  assert.equal(state.display.spectrumView, "raw");
  assert.equal(state.display.showNoise, true);
  assert.equal(state.display.showArtifacts, true);
  assert.equal(state.display.showComponents, false);
  assert.equal(derived.spectrum.view.id, "raw");
  assert.equal(derived.spectrum.display.showComponents, false);
  assert.match(derived.spectrum.view.scaleLabel, /not calibrated/i);
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

test("response-normalized teaching view preserves raw trace and changes displayed spectrum", () => {
  const rawState = createInstrumentState();
  rawState.source.id = "led-405";
  rawState.detector.id = "silicon-like";
  const raw = deriveInstrument(rawState);

  const normalizedState = createInstrumentState();
  normalizedState.source.id = "led-405";
  normalizedState.detector.id = "silicon-like";
  applyControlValue(normalizedState, "spectrum-view", "response-normalized");
  const normalized = deriveInstrument(normalizedState);

  assert.equal(normalized.spectrum.view.id, "response-normalized");
  assert.match(normalized.spectrum.view.scaleLabel, /teaching/i);
  assert.equal(normalized.spectrum.points.length, raw.spectrum.points.length);
  assert.equal(normalized.spectrum.rawPeak, raw.spectrum.rawPeak);

  const changedPoint = normalized.spectrum.points.find((point, index) => {
    assert.equal(point.rawY, raw.spectrum.points[index].rawY);
    assert.equal(point.responseNormalizedY >= point.rawY, true);
    return Math.abs(point.y - raw.spectrum.points[index].y) > 1e-6;
  });

  assert.ok(changedPoint, "expected at least one displayed point to change after response normalization");

  const labels = normalized.diagnostics.map((diagnostic) => diagnostic.label);
  assert.ok(labels.includes("Response-normalized view / 响应归一化视图"));
});

test("noise and artifact display toggles change the synthetic trace without moving wavelengths", () => {
  const baseline = createInstrumentState();
  baseline.sample.preset = "scattering";
  baseline.geometry.id = "transmission";
  const baselineDerived = deriveInstrument(baseline);

  const quiet = createInstrumentState();
  quiet.sample.preset = "scattering";
  quiet.geometry.id = "transmission";
  applyControlValue(quiet, "show-noise", false);
  const quietDerived = deriveInstrument(quiet);

  const clean = createInstrumentState();
  clean.sample.preset = "scattering";
  clean.geometry.id = "transmission";
  applyControlValue(clean, "show-artifacts", false);
  const cleanDerived = deriveInstrument(clean);

  assert.equal(quiet.display.showNoise, false);
  assert.equal(clean.display.showArtifacts, false);
  assert.equal(Math.round(baselineDerived.excitationNm), Math.round(quietDerived.excitationNm));
  assert.equal(Math.round(baselineDerived.emissionNm), Math.round(cleanDerived.emissionNm));
  assert.ok(
    baselineDerived.spectrum.points.some((point, index) => Math.abs(point.rawY - quietDerived.spectrum.points[index].rawY) > 1e-6),
    "turning off deterministic noise should change at least one plotted raw point"
  );
  assert.ok(
    baselineDerived.spectrum.points.reduce((total, point) => total + point.rawY, 0) >
      cleanDerived.spectrum.points.reduce((total, point) => total + point.rawY, 0),
    "turning off artifact cues should reduce the scattering/background contribution"
  );

  assert.ok(quietDerived.diagnostics.some((item) => item.label === "Noise cue hidden / 噪声提示隐藏"));
  assert.ok(cleanDerived.diagnostics.some((item) => item.label === "Artifact cues hidden / 伪影提示隐藏"));
});

test("component overlay toggle exposes component display state without changing synthetic trace", () => {
  const baseline = createInstrumentState();
  const baselineDerived = deriveInstrument(baseline);

  const overlay = createInstrumentState();
  applyControlValue(overlay, "show-components", true);
  const overlayDerived = deriveInstrument(overlay);

  assert.equal(overlay.display.showComponents, true);
  assert.equal(overlayDerived.spectrum.display.showComponents, true);
  assert.equal(overlayDerived.spectrum.points.length, baselineDerived.spectrum.points.length);
  overlayDerived.spectrum.points.forEach((point, index) => {
    const baselinePoint = baselineDerived.spectrum.points[index];
    assert.equal(point.rawY, baselinePoint.rawY);
    assert.equal(point.y, baselinePoint.y);
    assert.ok(Number.isFinite(point.components.sampleInstrumentY));
    assert.ok(Number.isFinite(point.components.baselineY));
    assert.ok(Number.isFinite(point.components.scatterY));
    assert.ok(Number.isFinite(point.components.noiseY));
  });
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

  const hiddenArtifactTrace = createInstrumentState();
  setGratingWavelength(hiddenArtifactTrace, "emission", 730);
  applyControlValue(hiddenArtifactTrace, "show-artifacts", false);
  const hiddenArtifactLabels = deriveInstrument(hiddenArtifactTrace).diagnostics.map((diagnostic) => diagnostic.label);
  assert.ok(hiddenArtifactLabels.includes("Artifact risk / 伪影风险"));
  assert.ok(hiddenArtifactLabels.includes("Artifact cues hidden / 伪影提示隐藏"));

  const highTrace = createInstrumentState();
  highTrace.integrationTimeMs = 1000;
  highTrace.slit.widthUm = 1000;
  highTrace.source.id = "ideal-flat";
  highTrace.detector.id = "ideal-flat";
  const highTraceLabels = deriveInstrument(highTrace).diagnostics.map((diagnostic) => diagnostic.label);
  assert.ok(highTraceLabels.includes("Signal headroom / 信号余量"));
});

test("classic sample presets produce sample-specific synthetic feedback", () => {
  const cases = [
    { id: "rhodamine-6g-like", ex: 530, em: 560, label: /Rhodamine 6G-like/i },
    { id: "egfp-like", ex: 488, em: 510, label: /EGFP-like/i },
  ];

  for (const item of cases) {
    const matched = createInstrumentState();
    matched.sample.preset = item.id;
    matched.source.id = "ideal-flat";
    matched.detector.id = "ideal-flat";
    setGratingWavelength(matched, "excitation", item.ex);
    setGratingWavelength(matched, "emission", item.em);
    const matchedDerived = deriveInstrument(matched);

    const mismatched = createInstrumentState();
    mismatched.sample.preset = item.id;
    mismatched.source.id = "ideal-flat";
    mismatched.detector.id = "ideal-flat";
    const mismatchedDerived = deriveInstrument(mismatched);

    const feedback = matchedDerived.diagnostics.find((diagnostic) => diagnostic.label === "Classic sample preset / 经典样品预设");
    assert.ok(feedback, `${item.id} should show classic sample feedback`);
    assert.equal(feedback.evidenceKey, "ILAB-013");
    assert.match(feedback.text, item.label);
    assert.match(feedback.text, /synthetic analog/i);
    assert.match(feedback.text, /合成类比/);
    assert.ok(matchedDerived.responseChain.signal.normalized > mismatchedDerived.responseChain.signal.normalized);
    assert.ok(matchedDerived.spectrum.peak > mismatchedDerived.spectrum.peak);
  }
});

test("inner-filter risk remains a categorical diagnostic, not a correction", () => {
  const lowRisk = createInstrumentState();
  const lowRiskDerived = deriveInstrument(lowRisk);
  assert.equal(lowRiskDerived.responseChain.sample.concentrationRelative, 0.18);
  assert.equal(lowRiskDerived.responseChain.sample.innerFilterRisk.level, "low");
  assert.ok(!lowRiskDerived.diagnostics.some((diagnostic) => diagnostic.label === "Inner-filter risk / 内滤风险"));

  const scattering = createInstrumentState();
  scattering.sample.preset = "scattering";
  const derived = deriveInstrument(scattering);
  const sample = derived.responseChain.sample;
  const diagnostic = derived.diagnostics.find((item) => item.label === "Inner-filter risk / 内滤风险");

  assert.equal(sample.concentrationRelative, 0.52);
  assert.equal(sample.innerFilterRisk.level, "medium");
  assert.ok(sample.innerFilterRisk.score > lowRiskDerived.responseChain.sample.innerFilterRisk.score);
  assert.equal(diagnostic?.evidenceKey, "ILAB-005");
  assert.match(diagnostic?.text || "", /attenuation/i);
  assert.match(diagnostic?.text || "", /reabsorption/i);
  assert.match(diagnostic?.text || "", /内滤|重吸收/);
  assert.doesNotMatch(diagnostic?.text || "", /calibrated|quantitative|corrected spectrum/i);
});

test("display toggle diagnostics remain visible in busy warning states", () => {
  const state = createInstrumentState();
  state.display.spectrumView = "response-normalized";
  state.slit.widthUm = 1000;
  state.source.offsetUm = 120;
  state.detector.angleDeg = 82;
  state.geometry.id = "transmission";
  state.sample.preset = "scattering";
  setGratingWavelength(state, "emission", 730);
  applyControlValue(state, "show-noise", false);
  applyControlValue(state, "show-artifacts", false);

  const labels = deriveInstrument(state).diagnostics.map((diagnostic) => diagnostic.label);

  assert.ok(labels.length <= 5);
  assert.ok(labels.includes("Noise cue hidden / 噪声提示隐藏"));
  assert.ok(labels.includes("Artifact cues hidden / 伪影提示隐藏"));
});

test("diagnostics separate geometry mode from detector arm offset", () => {
  const state = createInstrumentState();
  state.geometry.id = "transmission";
  state.detector.angleDeg = 82;

  const labels = deriveInstrument(state).diagnostics.map((diagnostic) => diagnostic.label);

  assert.ok(labels.includes("Geometry mode / 几何模式"));
  assert.ok(labels.includes("Detector arm offset / 检测臂偏离"));
  assert.ok(!labels.includes("90 degree geometry / 90° 几何"));
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

test("detector angle changes detector-arm response without moving selected wavelengths", () => {
  const state = createInstrumentState();
  const base = deriveInstrument(state);

  state.detector.angleDeg = 82;
  const tilted = deriveInstrument(state);

  assert.equal(Math.round(base.excitationNm), Math.round(tilted.excitationNm));
  assert.equal(Math.round(base.emissionNm), Math.round(tilted.emissionNm));
  assert.ok(tilted.detectorArm.collectionFactor < base.detectorArm.collectionFactor);
  assert.ok(tilted.detectorArm.backgroundRisk > base.detectorArm.backgroundRisk);
  assert.equal(Object.hasOwn(tilted, "collection"), false);
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

  applyControlValue(state, "show-artifacts", false);
  const hiddenArtifactTrace = deriveInstrument(state);
  assert.equal(hiddenArtifactTrace.spectrum.peak, expectedRaw);
  hiddenArtifactTrace.spectrum.points.forEach((point) => {
    assert.equal(point.rawY, expectedRaw);
    assert.equal(point.y, expectedRaw / hiddenArtifactTrace.spectrum.yScaleMax);
  });
});

test("emission scan exposes an instrument-function broadened sample component", () => {
  const state = createInstrumentState();
  state.mode = "emission";
  state.source.id = "ideal-flat";
  state.detector.id = "ideal-flat";
  applyControlValue(state, "show-noise", false);
  applyControlValue(state, "show-artifacts", false);

  const derived = deriveInstrument(state);

  assert.ok(
    derived.spectrum.points.some((point) => point.components?.sampleInstrumentY !== point.components?.sampleRawY),
    "at least one emission point should differ after teaching instrument-function broadening"
  );

  derived.spectrum.points.forEach((point) => {
    assert.ok(Number.isFinite(point.components.sampleRawY));
    assert.ok(Number.isFinite(point.components.sampleInstrumentY));
    assert.ok(point.components.sampleRawY >= 0);
    assert.ok(point.components.sampleInstrumentY >= 0);
    assert.equal(point.components.noiseY, 0);
    assert.equal(point.components.scatterY, 0);
    assert.ok(
      Math.abs(point.rawY - (point.components.baselineY + point.components.sampleInstrumentY)) < 1e-12,
      "raw point should be composed from baseline plus instrument-broadened sample component when cues are hidden"
    );
  });
});

test("wider slit broadens the instrument-function sample component without moving wavelengths", () => {
  const narrow = createInstrumentState();
  narrow.mode = "emission";
  narrow.source.id = "ideal-flat";
  narrow.detector.id = "ideal-flat";
  narrow.slit.widthUm = 150;
  applyControlValue(narrow, "show-noise", false);
  applyControlValue(narrow, "show-artifacts", false);
  const narrowDerived = deriveInstrument(narrow);

  const wide = createInstrumentState();
  wide.mode = "emission";
  wide.source.id = "ideal-flat";
  wide.detector.id = "ideal-flat";
  wide.slit.widthUm = 1000;
  applyControlValue(wide, "show-noise", false);
  applyControlValue(wide, "show-artifacts", false);
  const wideDerived = deriveInstrument(wide);

  assert.equal(Math.round(narrowDerived.excitationNm), Math.round(wideDerived.excitationNm));
  assert.equal(Math.round(narrowDerived.emissionNm), Math.round(wideDerived.emissionNm));
  assert.ok(
    componentVariance(wideDerived.spectrum.points, "sampleInstrumentY") >
      componentVariance(narrowDerived.spectrum.points, "sampleInstrumentY")
  );
  assert.ok(
    Math.abs(
      componentVariance(wideDerived.spectrum.points, "sampleRawY") -
        componentVariance(narrowDerived.spectrum.points, "sampleRawY")
    ) < 1e-9
  );
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
    profile.emissionWidth
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
    darkBaseline: 0,
    background: 0,
    saturationThreshold: 1.15,
  });

  assert.equal(point.x, scannedEmissionNm);
  assert.ok(signal.raw > 0);
  assert.ok(Math.abs(point.components.baselineY - baseline) < 1e-12);
  assert.ok(Math.abs(point.components.sampleRawY - signal.raw) < 1e-12);
  assert.ok(
    Math.abs(
      point.rawY -
        (point.components.baselineY +
          point.components.sampleInstrumentY +
          point.components.scatterY +
          point.components.noiseY)
    ) < 1e-12
  );
  assert.equal(point.components.scatterY, 0);
  assert.ok(Math.abs(point.components.noiseY - noise) < 1e-12);
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
  assert.ok(Math.abs(point.components.baselineY - baseline) < 1e-12);
  assert.ok(Math.abs(point.components.sampleRawY - (signal.raw - baseline)) < 1e-12);
  assert.ok(Math.abs(point.rawY - (signal.raw + noise)) < 1e-12);
  assert.equal(point.components.scatterY, 0);
  assert.ok(Math.abs(point.components.noiseY - noise) < 1e-12);
});

test("time scan uses response-chain fixed-channel signal while preserving teaching dynamics", () => {
  const state = createInstrumentState();
  state.mode = "time";
  const timePointIndex = 48;

  const derived = deriveInstrument(state);
  const point = derived.spectrum.points[timePointIndex];
  const profile = derived.spectrum.profile;
  const seed =
    derived.excitationNm * 0.011 +
    derived.emissionNm * 0.017 +
    derived.bandpassNm +
    state.integrationTimeMs * 0.001;
  const noise = deterministicNoise(timePointIndex, seed) * profile.noise;
  const baseline =
    profile.baseline +
    derived.bandpassNm * 0.002 +
    derived.responseChain.geometry.backgroundRisk * 0.028;
  const steadySignal = composeRawSignal({
    sourceAtExcitation: derived.responseChain.source.atExcitation,
    excitationBandpassTransmission: derived.throughput * derived.alignment.overlapFactor,
    absorptionAtExcitation: derived.responseChain.sample.absorptionAtExcitation,
    quantumYield: profile.amplitude,
    emissionShapeAtWavelength: derived.responseChain.sample.emissionAtEmission,
    emissionBandpassTransmission: derived.throughput,
    detectorResponseAtEmission: derived.responseChain.detector.atEmission,
    collectionFactor: derived.responseChain.geometry.collectionFactor,
    integrationMs: state.integrationTimeMs,
    darkBaseline: baseline,
    background: 0,
    saturationThreshold: 1.15,
  });
  const settle = 1 - Math.exp(-point.x / 16);
  const decay = 1 - profile.decay * (1 - Math.exp(-point.x / 72));
  const ripple = Math.sin(point.x / 9 + derived.bandpassNm * 0.4) * 0.025;
  const dynamicSignal = (steadySignal.raw - baseline) * settle * decay;

  assert.ok(point.x > 0);
  assert.ok(steadySignal.raw > baseline);
  assert.ok(Math.abs(point.rawY - (baseline + dynamicSignal + ripple + noise)) < 1e-12);
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

test("invalid control values cannot leak NaN or unknown presets into derived UI state", () => {
  const state = createInstrumentState();
  const previous = {
    slitUm: state.slit.widthUm,
    integrationMs: state.integrationTimeMs,
    sourceOffsetUm: state.source.offsetUm,
    detectorAngleDeg: state.detector.angleDeg,
    sourceId: state.source.id,
    detectorId: state.detector.id,
    geometryId: state.geometry.id,
  };

  applyControlValue(state, "slit", "bad-number");
  applyControlValue(state, "integration", Number.NaN);
  applyControlValue(state, "source-offset", "Infinity");
  applyControlValue(state, "detector-angle", undefined);
  applyControlValue(state, "source-type", "unknown-source");
  applyControlValue(state, "detector-type", "unknown-detector");
  applyControlValue(state, "geometry-mode", "unknown-geometry");

  assert.equal(state.slit.widthUm, previous.slitUm);
  assert.equal(state.integrationTimeMs, previous.integrationMs);
  assert.equal(state.source.offsetUm, previous.sourceOffsetUm);
  assert.equal(state.detector.angleDeg, previous.detectorAngleDeg);
  assert.equal(state.source.id, previous.sourceId);
  assert.equal(state.detector.id, previous.detectorId);
  assert.equal(state.geometry.id, previous.geometryId);

  const derived = deriveInstrument(state);
  assert.equal(derived.responseChain.source.id, previous.sourceId);
  assert.equal(derived.responseChain.detector.id, previous.detectorId);
  assert.equal(derived.responseChain.geometry.id, previous.geometryId);
  for (const point of derived.spectrum.points) {
    assert.equal(Number.isFinite(point.x), true);
    assert.equal(Number.isFinite(point.y), true);
    assert.equal(Number.isFinite(point.rawY), true);
    assert.ok(point.y >= 0 && point.y <= 1);
    assert.ok(point.rawY >= 0 && point.rawY <= derived.spectrum.yScaleMax);
  }
});
