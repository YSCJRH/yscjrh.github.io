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

export function deriveInnerFilterRisk({ declaredRisk = "low", concentrationRelative = 0, absorptionAtExcitation = 0 } = {}) {
  const declaredBase = {
    low: 0.08,
    medium: 0.32,
    high: 0.68,
  }[declaredRisk] ?? 0.08;
  const concentration = clamp(Number(concentrationRelative) || 0, 0, 1);
  const absorption = clamp(Number(absorptionAtExcitation) || 0, 0, 1);
  const score = clamp(declaredBase + concentration * absorption * 0.45, 0, 1);
  const level = score >= 0.7 ? "high" : score >= 0.32 ? "medium" : "low";

  return {
    level,
    score: Number(score.toFixed(3)),
    declaredRisk: ["low", "medium", "high"].includes(declaredRisk) ? declaredRisk : "low",
    concentrationRelative: concentration,
    absorptionAtExcitation: absorption,
  };
}
