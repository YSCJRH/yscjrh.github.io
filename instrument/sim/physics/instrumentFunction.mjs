import { fwhmToSigma } from "./sample.mjs?v=response-chain-20260611";

export function gaussianInstrumentWeight(deltaNm, fwhmNm) {
  const sigma = fwhmToSigma(fwhmNm);
  const normalized = Number(deltaNm) / sigma;
  return Math.exp(-0.5 * normalized * normalized);
}

export function convolveLineShape(axisNm, values, options = {}) {
  const fwhmNm = Math.max(Number(options.fwhmNm ?? 1), 0.001);

  if (!Array.isArray(axisNm) || !Array.isArray(values) || axisNm.length !== values.length) {
    return [];
  }

  return axisNm.map((xNm) => {
    let weighted = 0;
    let weightTotal = 0;

    axisNm.forEach((otherNm, index) => {
      const weight = gaussianInstrumentWeight(Number(xNm) - Number(otherNm), fwhmNm);
      const value = Math.max(Number(values[index]) || 0, 0);
      weighted += value * weight;
      weightTotal += weight;
    });

    return weightTotal > 0 ? weighted / weightTotal : 0;
  });
}
