import { clamp } from "../math.mjs?v=response-chain-20260611";
import { evaluateGaussianMixture } from "./sample.mjs?v=response-chain-20260611";

const SOURCE_PRESET_BOUNDARY =
  "Synthetic teaching source shape; not measured lamp spectrum or real hardware output.";

export const TEACHING_SOURCE_PRESETS = Object.freeze({
  "ideal-flat": {
    label: "Ideal flat teaching source / 理想平坦教学光源",
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: SOURCE_PRESET_BOUNDARY,
  },
  "xenon-like": {
    label: "Broadband teaching source / 宽带教学光源",
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: SOURCE_PRESET_BOUNDARY,
    peaks: [
      { centerNm: 290, fwhmNm: 130, amplitude: 0.52 },
      { centerNm: 450, fwhmNm: 360, amplitude: 0.72 },
      { centerNm: 760, fwhmNm: 280, amplitude: 0.4 },
    ],
  },
  "led-365": {
    label: "365 nm LED teaching source / 365 nm LED 教学光源",
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: SOURCE_PRESET_BOUNDARY,
    peaks: [{ centerNm: 365, fwhmNm: 18, amplitude: 1 }],
  },
  "led-405": {
    label: "405 nm LED teaching source / 405 nm LED 教学光源",
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: SOURCE_PRESET_BOUNDARY,
    peaks: [{ centerNm: 405, fwhmNm: 20, amplitude: 1 }],
  },
});

export function evaluateSourceSpectrum(sourceId, wavelengthNm) {
  const preset = TEACHING_SOURCE_PRESETS[sourceId] || TEACHING_SOURCE_PRESETS["ideal-flat"];

  if (preset === TEACHING_SOURCE_PRESETS["ideal-flat"]) {
    return 1;
  }

  return clamp(evaluateGaussianMixture(wavelengthNm, preset.peaks) + 0.015, 0, 1);
}
