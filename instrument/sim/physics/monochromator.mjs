import { clamp } from "../state.mjs?v=sample-fixed-20260428";

export function bandpassFromSlit(widthUm) {
  return clamp(0.7 + widthUm * 0.0077, 1.2, 8.6);
}

export function throughputFromSlit(widthUm) {
  const normalized = clamp(widthUm / 1000, 0.1, 1);
  return clamp(0.22 + 0.78 * Math.pow(normalized, 0.78), 0.2, 1);
}

export function resolutionLabel(bandpassNm) {
  if (bandpassNm <= 3) {
    return "narrow bandpass / higher resolution / 窄带宽 / 较高分辨率";
  }

  if (bandpassNm >= 7) {
    return "wide bandpass / lower resolution / 宽带宽 / 较低分辨率";
  }

  return "moderate bandpass / 中等带宽";
}
