import test from "node:test";
import assert from "node:assert/strict";

import { deriveArtifactRisks } from "../physics/artifacts.mjs";
import { DETECTOR_PRESETS, evaluateDetectorResponse } from "../physics/detector.mjs";
import { GEOMETRY_PRESETS, deriveGeometryResponse } from "../physics/geometry.mjs";
import { convolveLineShape } from "../physics/instrumentFunction.mjs";
import { composeRawSignal } from "../physics/radiometry.mjs";
import { buildScanAxis } from "../physics/scan.mjs";
import { evaluateGaussianMixture } from "../physics/sample.mjs";
import { TEACHING_SOURCE_PRESETS, evaluateSourceSpectrum } from "../physics/source.mjs";

function assertFiniteUnit(value, label) {
  assert.equal(Number.isFinite(value), true, `${label} should be finite`);
  assert.ok(value >= 0, `${label} should be non-negative`);
  assert.ok(value <= 1, `${label} should stay normalized`);
}

test("teaching source and detector presets stay finite and normalized across 200-900 nm", () => {
  for (const wavelengthNm of [200, 365, 520, 900]) {
    assertFiniteUnit(evaluateSourceSpectrum("ideal-flat", wavelengthNm), `flat source ${wavelengthNm}`);
    assertFiniteUnit(evaluateSourceSpectrum("led-365", wavelengthNm), `365 LED source ${wavelengthNm}`);
    assertFiniteUnit(evaluateDetectorResponse("ideal-flat", wavelengthNm), `flat detector ${wavelengthNm}`);
    assertFiniteUnit(evaluateDetectorResponse("pmt-like-visible", wavelengthNm), `PMT teaching detector ${wavelengthNm}`);
  }

  assert.ok(evaluateSourceSpectrum("led-365", 365) > evaluateSourceSpectrum("led-365", 520));
  assert.ok(evaluateDetectorResponse("pmt-like-visible", 520) > evaluateDetectorResponse("pmt-like-visible", 900));
});

test("teaching source and detector presets declare placeholder boundaries", () => {
  for (const [id, preset] of Object.entries(TEACHING_SOURCE_PRESETS)) {
    assert.equal(preset.claimLevel, "synthetic-teaching", `${id} source should stay synthetic`);
    assert.equal(preset.controlBinding, "simulator-control", `${id} source should be simulator-only`);
    assert.equal(preset.evidenceKey, "ILAB-008", `${id} source should cite the placeholder boundary`);
    assert.match(preset.boundary, /not.*measured|not.*real/i, `${id} source should not imply measured lamp data`);
  }

  for (const [id, preset] of Object.entries(DETECTOR_PRESETS)) {
    assert.equal(preset.claimLevel, "synthetic-teaching", `${id} detector should stay synthetic`);
    assert.equal(preset.controlBinding, "simulator-control", `${id} detector should be simulator-only`);
    assert.equal(preset.evidenceKey, "ILAB-008", `${id} detector should cite the placeholder boundary`);
    assert.match(preset.boundary, /not.*measured|not.*real|not.*calibrated/i, `${id} detector should not imply measured hardware response`);
  }
});

test("geometry presets declare conceptual teaching boundaries", () => {
  for (const [id, preset] of Object.entries(GEOMETRY_PRESETS)) {
    assert.equal(preset.claimLevel, "conceptual-teaching", `${id} geometry should stay conceptual`);
    assert.equal(preset.controlBinding, "simulator-control", `${id} geometry should be simulator-only`);
    assert.equal(preset.evidenceKey, "ILAB-006", `${id} geometry should cite the geometry boundary`);
    assert.match(preset.boundary, /conceptual teaching geometry/i, `${id} geometry should not imply measured optical performance`);
    assert.match(preset.boundary, /not selected wavelength/i, `${id} geometry should not move selected wavelength`);
  }
});

test("sample gaussian mixtures and instrument broadening avoid negative or non-finite values", () => {
  const axis = buildScanAxis("emission", { pointCount: 121 });
  const raw = axis.points.map((wavelengthNm) =>
    evaluateGaussianMixture(wavelengthNm, [
      { centerNm: 520, fwhmNm: 36, amplitude: 1 },
      { centerNm: 590, fwhmNm: 72, amplitude: 0.32 },
    ])
  );
  const broadened = convolveLineShape(axis.points, raw, { fwhmNm: 8 });

  assert.equal(broadened.length, raw.length);
  assert.ok(Math.max(...broadened) <= Math.max(...raw));
  broadened.forEach((value, index) => {
    assert.ok(Number.isFinite(value), `broadened point ${index} should be finite`);
    assert.ok(value >= 0, `broadened point ${index} should be non-negative`);
  });
});

test("geometry, artifacts, and raw-signal composition expose bounded teaching diagnostics", () => {
  const geometry = deriveGeometryResponse("right-angle-90", { detectorAngleDeg: 90, turbidityRelative: 0.1 });
  assertFiniteUnit(geometry.collectionFactor, "right-angle collection");
  assert.ok(geometry.scatterRisk >= 0);

  const artifacts = deriveArtifactRisks({
    excitationNm: 365,
    emissionNm: 365,
    bandpassNm: 5,
    geometry,
  });
  assert.equal(artifacts.rayleighRisk.level, "high");
  assert.equal(artifacts.secondOrderRisk.level, "low");

  const secondOrder = deriveArtifactRisks({
    excitationNm: 365,
    emissionNm: 730,
    bandpassNm: 5,
    geometry,
  });
  assert.equal(secondOrder.secondOrderRisk.level, "high");

  const signal = composeRawSignal({
    sourceAtExcitation: 0.8,
    excitationBandpassTransmission: 0.7,
    absorptionAtExcitation: 0.6,
    quantumYield: 0.4,
    emissionShapeAtWavelength: 0.9,
    emissionBandpassTransmission: 0.7,
    detectorResponseAtEmission: 0.85,
    collectionFactor: geometry.collectionFactor,
    integrationMs: 200,
    darkBaseline: 0.02,
    background: 0.03,
    saturationThreshold: 1.2,
  });

  assert.ok(Number.isFinite(signal.raw));
  assert.ok(signal.raw >= 0);
  assert.equal(signal.saturationRisk, "low");
});
