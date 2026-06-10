import { clamp } from "../math.mjs?v=response-chain-20260611";

export function composeRawSignal(terms = {}) {
  const integrationMs = Math.max(Number(terms.integrationMs ?? 200), 1);
  const integrationGain = Math.sqrt(integrationMs / 200);
  const multiplicative = [
    terms.sourceAtExcitation,
    terms.excitationBandpassTransmission,
    terms.absorptionAtExcitation,
    terms.quantumYield,
    terms.emissionShapeAtWavelength,
    terms.emissionBandpassTransmission,
    terms.detectorResponseAtEmission,
    terms.collectionFactor,
  ].reduce((product, value) => product * clamp(Number(value) || 0, 0, 1), 1);
  const darkBaseline = Math.max(Number(terms.darkBaseline) || 0, 0);
  const background = Math.max(Number(terms.background) || 0, 0);
  const saturationThreshold = Math.max(Number(terms.saturationThreshold ?? 1), 0.001);
  const raw = multiplicative * integrationGain + darkBaseline + background;
  const saturationRatio = raw / saturationThreshold;

  return {
    raw,
    normalized: clamp(raw / saturationThreshold, 0, 1),
    saturationRatio,
    saturationRisk: saturationRatio >= 0.92 ? "high" : saturationRatio >= 0.72 ? "medium" : "low",
  };
}
