import { clamp } from "../state.mjs";

export function bandpassFromSlit(widthUm) {
  return clamp(0.7 + widthUm * 0.0077, 1.2, 8.6);
}

export function throughputFromSlit(widthUm) {
  const normalized = clamp(widthUm / 1000, 0.1, 1);
  return clamp(0.22 + 0.78 * Math.pow(normalized, 0.78), 0.2, 1);
}

export function resolutionLabel(bandpassNm) {
  if (bandpassNm <= 3) {
    return "narrow bandpass / higher resolution";
  }

  if (bandpassNm >= 7) {
    return "wide bandpass / lower resolution";
  }

  return "moderate bandpass";
}
