import { clamp } from "../math.mjs?v=response-chain-20260611";

export function fwhmToSigma(fwhmNm) {
  return Math.max(Number(fwhmNm), 0.001) / 2.354820045;
}

export function evaluateGaussianMixture(wavelengthNm, peaks = []) {
  const x = Number(wavelengthNm);

  if (!Number.isFinite(x) || !Array.isArray(peaks) || !peaks.length) {
    return 0;
  }

  const value = peaks.reduce((total, peak) => {
    const centerNm = Number(peak.centerNm);
    const amplitude = Number(peak.amplitude ?? 1);
    const sigma = fwhmToSigma(peak.fwhmNm ?? 1);

    if (!Number.isFinite(centerNm) || !Number.isFinite(amplitude)) {
      return total;
    }

    const normalized = (x - centerNm) / sigma;
    return total + Math.max(amplitude, 0) * Math.exp(-0.5 * normalized * normalized);
  }, 0);

  return clamp(value, 0, 1);
}
