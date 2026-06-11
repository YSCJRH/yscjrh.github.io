import { clamp } from "../math.mjs?v=response-chain-20260611";
import { evaluateGaussianMixture } from "./sample.mjs?v=response-chain-20260611";

const DETECTOR_PRESET_BOUNDARY =
  "Synthetic teaching detector response; not measured or calibrated real hardware responsivity.";

export const DETECTOR_PRESETS = Object.freeze({
  "ideal-flat": {
    label: "Ideal flat detector / 理想平坦检测器",
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: DETECTOR_PRESET_BOUNDARY,
  },
  "pmt-like-visible": {
    label: "Visible PMT-like teaching response / 可见区 PMT 风格教学响应",
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: DETECTOR_PRESET_BOUNDARY,
    peaks: [
      { centerNm: 420, fwhmNm: 260, amplitude: 0.95 },
      { centerNm: 610, fwhmNm: 220, amplitude: 0.45 },
    ],
  },
  "silicon-like": {
    label: "Silicon-like teaching response / 硅探测器风格教学响应",
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: DETECTOR_PRESET_BOUNDARY,
    peaks: [
      { centerNm: 650, fwhmNm: 420, amplitude: 0.72 },
      { centerNm: 840, fwhmNm: 260, amplitude: 0.48 },
    ],
  },
});

export const DETECTOR_PRESET_OPTIONS = Object.freeze(
  ["pmt-like-visible", "silicon-like", "ideal-flat"].map((id) =>
    Object.freeze({
      id,
      label: DETECTOR_PRESETS[id].label,
    })
  )
);

export function evaluateDetectorResponse(detectorId, wavelengthNm) {
  const preset = DETECTOR_PRESETS[detectorId] || DETECTOR_PRESETS["ideal-flat"];

  if (preset === DETECTOR_PRESETS["ideal-flat"]) {
    return 1;
  }

  return clamp(evaluateGaussianMixture(wavelengthNm, preset.peaks) + 0.01, 0, 1);
}
