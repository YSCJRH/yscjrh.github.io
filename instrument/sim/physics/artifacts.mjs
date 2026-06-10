function riskLevel(value) {
  if (value >= 0.68) return "high";
  if (value >= 0.34) return "medium";
  return "low";
}

function proximityRisk(distanceNm, toleranceNm) {
  const normalized = Math.abs(distanceNm) / Math.max(toleranceNm, 0.001);
  return Math.max(0, 1 - normalized);
}

export function deriveArtifactRisks(options = {}) {
  const excitationNm = Number(options.excitationNm);
  const emissionNm = Number(options.emissionNm);
  const bandpassNm = Math.max(Number(options.bandpassNm ?? 5), 0.001);
  const geometry = options.geometry || {};

  if (!Number.isFinite(excitationNm) || !Number.isFinite(emissionNm)) {
    return {
      rayleighRisk: { value: 0, level: "low" },
      secondOrderRisk: { value: 0, level: "low" },
      backgroundRisk: { value: 0, level: "low" },
    };
  }

  const rayleighValue = proximityRisk(emissionNm - excitationNm, Math.max(18, bandpassNm * 3));
  const secondOrderValue = proximityRisk(emissionNm - excitationNm * 2, Math.max(18, bandpassNm * 3));
  const backgroundValue = Math.max(Number(geometry.backgroundRisk) || 0, Number(geometry.scatterRisk) || 0);

  return {
    rayleighRisk: { value: rayleighValue, level: riskLevel(rayleighValue) },
    secondOrderRisk: { value: secondOrderValue, level: riskLevel(secondOrderValue) },
    backgroundRisk: { value: backgroundValue, level: riskLevel(backgroundValue) },
  };
}
