const SAMPLE_PRESET_BOUNDARY = Object.freeze({
  en: "Synthetic teaching preset controlled only by the simulator; not a measured sample spectrum.",
  zh: "仅由模拟器控制的合成教学预设，不是实测样品谱图。",
});

export const TEACHING_SAMPLE_PRESETS = Object.freeze({
  "low-background": {
    id: "low-background",
    label: {
      en: "Low-background sample",
      zh: "低背景样品",
    },
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: SAMPLE_PRESET_BOUNDARY,
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
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: SAMPLE_PRESET_BOUNDARY,
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
  "rhodamine-6g-like": {
    id: "rhodamine-6g-like",
    label: {
      en: "Rhodamine 6G-like dye",
      zh: "罗丹明 6G 类染料",
    },
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-013",
    boundary: SAMPLE_PRESET_BOUNDARY,
    absorption: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 530, fwhmNm: 78, amplitude: 1 }],
    },
    emission: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 560, fwhmNm: 58, amplitude: 1 }],
    },
    quantumYieldTeaching: 0.94,
    concentrationRelative: 0.22,
    innerFilterRisk: "low",
    notes: {
      en: "A synthetic analog of a classic bright dye; tune near green excitation and orange emission.",
      zh: "经典明亮染料的合成类比；可在绿色激发与橙色发射附近观察。",
    },
    classicSample: {
      kind: "synthetic-analog",
      sourceDerivedExampleId: "r6g-emission-ethylene-glycol",
      feedback: {
        en: "Rhodamine 6G-like dye preset: synthetic analog, best viewed near Ex 530 nm and Em 560 nm; the cited R6G source-derived spectrum remains display-only.",
        zh: "罗丹明 6G 类染料预设：合成类比样品，适合在 Ex 530 nm 与 Em 560 nm 附近观察；引用的 R6G 来源谱仍仅用于显示。",
      },
    },
    model: {
      baseline: 0.032,
      noise: 0.014,
      decay: 0.1,
    },
    sources: [],
  },
  "egfp-like": {
    id: "egfp-like",
    label: {
      en: "EGFP-like protein",
      zh: "EGFP 类荧光蛋白",
    },
    claimLevel: "synthetic-teaching",
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-013",
    boundary: SAMPLE_PRESET_BOUNDARY,
    absorption: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 488, fwhmNm: 48, amplitude: 1 }],
    },
    emission: {
      type: "gaussian-mixture",
      peaks: [{ centerNm: 510, fwhmNm: 44, amplitude: 1 }],
    },
    quantumYieldTeaching: 0.72,
    concentrationRelative: 0.2,
    innerFilterRisk: "low",
    notes: {
      en: "A synthetic analog of a fluorescent protein; tune near blue excitation and green emission.",
      zh: "荧光蛋白的合成类比；可在蓝光激发与绿色发射附近观察。",
    },
    classicSample: {
      kind: "synthetic-analog",
      sourceDerivedExampleId: "egfp-emission",
      feedback: {
        en: "EGFP-like protein preset: synthetic analog, best viewed near Ex 488 nm and Em 510 nm; the cited EGFP source-derived spectrum remains display-only.",
        zh: "EGFP 类荧光蛋白预设：合成类比样品，适合在 Ex 488 nm 与 Em 510 nm 附近观察；引用的 EGFP 来源谱仍仅用于显示。",
      },
    },
    model: {
      baseline: 0.035,
      noise: 0.016,
      decay: 0.18,
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
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: SAMPLE_PRESET_BOUNDARY,
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
    controlBinding: "simulator-control",
    evidenceKey: "ILAB-008",
    boundary: SAMPLE_PRESET_BOUNDARY,
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
    controlBinding: preset.controlBinding,
    evidenceKey: preset.evidenceKey,
    boundary: `${preset.boundary.en} / ${preset.boundary.zh}`,
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
    classicSample: preset.classicSample
      ? {
          kind: preset.classicSample.kind,
          sourceDerivedExampleId: preset.classicSample.sourceDerivedExampleId,
          feedback: `${preset.classicSample.feedback.en} / ${preset.classicSample.feedback.zh}`,
        }
      : null,
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
