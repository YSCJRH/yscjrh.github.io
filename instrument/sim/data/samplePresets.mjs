export const TEACHING_SAMPLE_PRESETS = Object.freeze({
  "low-background": {
    id: "low-background",
    label: {
      en: "Low-background sample",
      zh: "低背景样品",
    },
    claimLevel: "synthetic-teaching",
    absorption: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 365, fwhmNm: 84, amplitude: 1 }],
    },
    emission: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 468, fwhmNm: 72, amplitude: 1 }],
    },
    quantumYieldTeaching: 1,
    concentrationRelative: 0.18,
    innerFilterRisk: "low",
    notes: {
      en: "A clean illustrative sample with a distinct synthetic emission feature.",
      zh: "一个干净的示意样品，具有清晰的合成发射特征。",
    },
    model: {
      baseline: 0.025,
      noise: 0.018,
      decay: 0.2,
    },
    sources: [],
  },
  "broad-emission": {
    id: "broad-emission",
    label: {
      en: "Broad-emission sample",
      zh: "宽发射样品",
    },
    claimLevel: "synthetic-teaching",
    absorption: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 405, fwhmNm: 144, amplitude: 1 }],
    },
    emission: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 552, fwhmNm: 148, amplitude: 1 }],
    },
    quantumYieldTeaching: 0.86,
    concentrationRelative: 0.24,
    innerFilterRisk: "low",
    notes: {
      en: "A conceptual sample with broader excitation and emission response.",
      zh: "一个概念样品，具有更宽的激发和发射响应。",
    },
    model: {
      baseline: 0.04,
      noise: 0.015,
      decay: 0.12,
    },
    sources: [],
  },
  blank: {
    id: "blank",
    label: {
      en: "Blank / background-dominant",
      zh: "空白或背景主导",
    },
    claimLevel: "synthetic-teaching",
    absorption: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 330, fwhmNm: 120, amplitude: 1 }],
    },
    emission: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 430, fwhmNm: 96, amplitude: 1 }],
    },
    quantumYieldTeaching: 0.02,
    concentrationRelative: 0.02,
    innerFilterRisk: "low",
    notes: {
      en: "Mostly baseline plus small background/scatter; not a true fluorescence band.",
      zh: "主要由基线和少量背景或散射组成，不是真正的荧光峰带。",
    },
    model: {
      kind: "blank",
      baseline: 0.026,
      noise: 0.008,
      decay: 0.02,
    },
    sources: [],
  },
  scattering: {
    id: "scattering",
    label: {
      en: "Scattering sample",
      zh: "散射样品",
    },
    claimLevel: "synthetic-teaching",
    absorption: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 320, fwhmNm: 112, amplitude: 1 }],
    },
    emission: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 440, fwhmNm: 84, amplitude: 1 }],
    },
    quantumYieldTeaching: 0.38,
    concentrationRelative: 0.52,
    innerFilterRisk: "medium",
    notes: {
      en: "A conceptual case where background and scatter compete with fluorescence.",
      zh: "一个背景和散射会与荧光竞争的概念情形。",
    },
    model: {
      kind: "scattering",
      baseline: 0.12,
      noise: 0.026,
      decay: 0.08,
    },
    sources: [],
  },
});

function firstPeak(block) {
  return block.peaks[0];
}

function toProfile(preset) {
  const absorptionPeak = firstPeak(preset.absorption);
  const emissionPeak = firstPeak(preset.emission);

  return {
    name: `${preset.label.en} / ${preset.label.zh}`,
    description: `${preset.notes.en} / ${preset.notes.zh}`,
    kind: preset.model.kind,
    claimLevel: preset.claimLevel,
    excitationPeak: absorptionPeak.centerNm,
    excitationWidth: absorptionPeak.fwhmNm / 2,
    emissionPeak: emissionPeak.centerNm,
    emissionWidth: emissionPeak.fwhmNm / 2,
    amplitude: preset.quantumYieldTeaching,
    baseline: preset.model.baseline,
    noise: preset.model.noise,
    decay: preset.model.decay,
    innerFilterRisk: preset.innerFilterRisk,
    concentrationRelative: preset.concentrationRelative,
  };
}

export const SAMPLE_PROFILES = Object.freeze(
  Object.fromEntries(Object.entries(TEACHING_SAMPLE_PRESETS).map(([id, preset]) => [id, toProfile(preset)]))
);

export const SAMPLE_PRESET_OPTIONS = Object.freeze(
  Object.entries(SAMPLE_PROFILES).map(([id, profile]) => ({
    id,
    label: profile.name,
  }))
);
