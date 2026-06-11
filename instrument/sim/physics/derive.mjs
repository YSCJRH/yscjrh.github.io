import { wavelengthFromGratingAngle, wavelengthToColor } from "./grating.mjs?v=wavelength-control-20260429";
import { bandpassFromSlit, resolutionLabel, throughputFromSlit } from "./monochromator.mjs?v=wavelength-control-20260429";
import { collectionFromDetectorAngle, deriveAlignment } from "./alignment.mjs?v=wavelength-control-20260429";
import { generateSpectrum, scanMetaForMode } from "./spectrum.mjs?v=response-chain-20260611";
import { generateDiagnostics } from "./diagnostics.mjs?v=response-chain-20260611";
import { deriveArtifactRisks } from "./artifacts.mjs?v=response-chain-20260611";
import { evaluateDetectorResponse } from "./detector.mjs?v=response-chain-20260611";
import { deriveGeometryResponse } from "./geometry.mjs?v=response-chain-20260611";
import { composeRawSignal } from "./radiometry.mjs?v=response-chain-20260611";
import { evaluateGaussianMixture } from "./sample.mjs?v=response-chain-20260611";
import { evaluateSourceSpectrum } from "./source.mjs?v=response-chain-20260611";
import { clamp } from "../math.mjs?v=wavelength-control-20260429";
import { SAMPLE_PROFILES } from "../state.mjs?v=response-chain-20260611";

const DEFAULT_SOURCE_ID = "xenon-like";
const DEFAULT_DETECTOR_ID = "pmt-like-visible";
const DEFAULT_GEOMETRY_ID = "right-angle-90";

function profileToPeak(profile, peakKey, widthKey) {
  return [
    {
      centerNm: profile[peakKey],
      fwhmNm: Math.max(profile[widthKey] * 2, 1),
      amplitude: 1,
    },
  ];
}

function deriveResponseChain(state, physics) {
  const profile = SAMPLE_PROFILES[state.sample.preset] || SAMPLE_PROFILES["low-background"];
  const sourceId = state.source.id || DEFAULT_SOURCE_ID;
  const detectorId = state.detector.id || DEFAULT_DETECTOR_ID;
  const geometryId = state.geometry?.id || DEFAULT_GEOMETRY_ID;
  const turbidityRelative = profile.kind === "scattering" ? 0.55 : profile.kind === "blank" ? 0.05 : 0.12;
  const geometry = deriveGeometryResponse(geometryId, {
    detectorAngleDeg: state.detector.angleDeg,
    turbidityRelative,
  });
  const sourceAtExcitation = evaluateSourceSpectrum(sourceId, physics.excitationNm);
  const detectorAtEmission = evaluateDetectorResponse(detectorId, physics.emissionNm);
  const absorptionAtExcitation = evaluateGaussianMixture(
    physics.excitationNm,
    profileToPeak(profile, "excitationPeak", "excitationWidth")
  );
  const emissionAtEmission = evaluateGaussianMixture(
    physics.emissionNm,
    profileToPeak(profile, "emissionPeak", "emissionWidth")
  );
  const artifacts = deriveArtifactRisks({
    excitationNm: physics.excitationNm,
    emissionNm: physics.emissionNm,
    bandpassNm: physics.bandpassNm,
    geometry,
  });
  const signal = composeRawSignal({
    sourceAtExcitation,
    excitationBandpassTransmission: physics.throughput * physics.alignment.overlapFactor,
    absorptionAtExcitation,
    quantumYield: clamp(profile.amplitude ?? 0.8, 0, 1),
    emissionShapeAtWavelength: emissionAtEmission,
    emissionBandpassTransmission: physics.throughput,
    detectorResponseAtEmission: detectorAtEmission,
    collectionFactor: geometry.collectionFactor,
    darkBaseline: profile.baseline,
    background: artifacts.backgroundRisk.value * 0.05,
    saturationThreshold: 1.15,
    integrationMs: state.integrationTimeMs,
  });

  return {
    claimLevel: "synthetic-teaching",
    source: {
      id: sourceId,
      atExcitation: sourceAtExcitation,
    },
    monochromator: {
      excitationBandpassNm: physics.bandpassNm,
      emissionBandpassNm: physics.bandpassNm,
      throughput: physics.throughput,
    },
    sample: {
      id: state.sample.preset,
      absorptionAtExcitation,
      emissionAtEmission,
      quantumYieldTeaching: clamp(profile.amplitude ?? 0.8, 0, 1),
    },
    geometry,
    detector: {
      id: detectorId,
      atEmission: detectorAtEmission,
    },
    artifacts,
    signal,
    evidenceKeys: ["ILAB-001", "ILAB-003", "ILAB-004", "ILAB-005", "ILAB-006", "ILAB-007", "ILAB-008"],
  };
}

export function deriveInstrument(state) {
  const excitationNm = wavelengthFromGratingAngle(state.exMono.gratingAngleDeg);
  const emissionNm = wavelengthFromGratingAngle(state.emMono.gratingAngleDeg);
  const bandpassNm = bandpassFromSlit(state.slit.widthUm);
  const throughput = throughputFromSlit(state.slit.widthUm);
  const alignment = deriveAlignment(state.source.offsetUm);
  const collection = collectionFromDetectorAngle(state.detector.angleDeg);

  const physics = {
    excitationNm,
    emissionNm,
    bandpassNm,
    throughput,
    alignment,
    collection,
  };
  const responseChain = deriveResponseChain(state, physics);
  const spectrum = generateSpectrum(state, physics);
  const scanMeta = scanMetaForMode(state.mode, physics);

  const derived = {
    ...physics,
    responseChain,
    resolution: resolutionLabel(bandpassNm),
    spectrum,
    scanMeta,
    beams: {
      excitationColor: wavelengthToColor(excitationNm),
      emissionColor: wavelengthToColor(emissionNm),
      excitationIntensity: clamp(0.48 + alignment.sourceFactor * 0.38, 0.42, 0.86),
      residualIntensity: clamp(0.08 + alignment.overlapFactor * 0.12, 0.08, 0.2),
      emissionIntensity: clamp(0.2 + spectrum.peak * 0.54, 0.18, 0.88),
      signalIntensity: clamp(0.22 + spectrum.peak * 0.46, 0.2, 0.74),
    },
  };

  return {
    ...derived,
    diagnostics: generateDiagnostics(state, derived),
  };
}
