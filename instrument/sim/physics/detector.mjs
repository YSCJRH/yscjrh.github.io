import { clamp } from "../math.mjs?v=response-chain-20260611";
import { evaluateGaussianMixture } from "./sample.mjs?v=response-chain-20260611";

export const DETECTOR_PRESETS = Object.freeze({
  "ideal-flat": {
    label: "Ideal flat detector / 理想平坦检测器",
    claimLevel: "synthetic-teaching",
  },
  "pmt-like-visible": {
    label: "Visible PMT-like teaching response / 可见区 PMT 风格教学响应",
    claimLevel: "synthetic-teaching",
    peaks: [
      { centerNm: 420, fwhmNm: 260, amplitude: 0.95 },
      { centerNm: 610, fwhmNm: 220, amplitude: 0.45 },
    ],
  },
  "silicon-like": {
    label: "Silicon-like teaching response / 硅探测器风格教学响应",
    claimLevel: "synthetic-teaching",
    peaks: [
      { centerNm: 650, fwhmNm: 420, amplitude: 0.72 },
      { centerNm: 840, fwhmNm: 260, amplitude: 0.48 },
    ],
  },
});

export function evaluateDetectorResponse(detectorId, wavelengthNm) {
  const preset = DETECTOR_PRESETS[detectorId] || DETECTOR_PRESETS["ideal-flat"];

  if (preset === DETECTOR_PRESETS["ideal-flat"]) {
    return 1;
  }

  return clamp(evaluateGaussianMixture(wavelengthNm, preset.peaks) + 0.01, 0, 1);
}
