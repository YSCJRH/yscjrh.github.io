import { wavelengthFromGratingAngle, wavelengthToColor } from "./grating.mjs";
import { bandpassFromSlit, resolutionLabel, throughputFromSlit } from "./monochromator.mjs";
import { collectionFromDetectorAngle, deriveAlignment } from "./alignment.mjs";
import { generateSpectrum, scanMetaForMode } from "./spectrum.mjs";
import { generateDiagnostics } from "./diagnostics.mjs";
import { clamp } from "../state.mjs";

export function deriveInstrument(state) {
  const excitationNm = wavelengthFromGratingAngle(state.exMono.gratingAngleDeg);
  const emissionNm = wavelengthFromGratingAngle(state.emMono.gratingAngleDeg);
  const bandpassNm = bandpassFromSlit(state.slit.widthUm);
  const throughput = throughputFromSlit(state.slit.widthUm);
  const alignment = deriveAlignment(state.source.offsetUm, state.sample.offsetUm);
  const collection = collectionFromDetectorAngle(state.detector.angleDeg);

  const physics = {
    excitationNm,
    emissionNm,
    bandpassNm,
    throughput,
    alignment,
    collection,
  };
  const spectrum = generateSpectrum(state, physics);
  const scanMeta = scanMetaForMode(state.mode, physics);

  const derived = {
    ...physics,
    resolution: resolutionLabel(bandpassNm),
    spectrum,
    scanMeta,
    beams: {
      excitationColor: wavelengthToColor(excitationNm),
      emissionColor: wavelengthToColor(emissionNm),
      excitationIntensity: 0.86,
      residualIntensity: 0.18,
      emissionIntensity: clamp(0.2 + spectrum.peak * 0.54, 0.18, 0.88),
      signalIntensity: clamp(0.22 + spectrum.peak * 0.46, 0.2, 0.74),
    },
  };

  return {
    ...derived,
    diagnostics: generateDiagnostics(state, derived),
  };
}
