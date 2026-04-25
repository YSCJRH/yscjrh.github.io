export const MODES = Object.freeze({
  emission: {
    label: "Emission scan",
    summary: "Emission scan: keep excitation fixed, scan the emission-side monochromator across the output range.",
  },
  excitation: {
    label: "Excitation scan",
    summary: "Excitation scan: keep emission fixed, scan the excitation-side monochromator.",
  },
  time: {
    label: "Time / kinetic scan",
    summary:
      "Time / kinetic scan: keep excitation and emission fixed, then track a reaction- or stability-style synthetic intensity trend over time. Not a fluorescence lifetime measurement.",
  },
  single: {
    label: "Single-point monitor",
    summary:
      "Single-point monitor: keep excitation and emission fixed, then show one steady synthetic intensity readout. It is educational, not a quantitative measurement.",
  },
});

export const PARTS = Object.freeze({
  source: {
    title: "Light source",
    copy:
      "Provides excitation energy for the model. A broadband source is narrowed by excitation-side optics before the sample.",
  },
  excitation: {
    title: "Excitation monochromator",
    copy:
      "Uses slits, mirrors, and a teaching grating angle to choose a conceptual excitation band. Rotating the grating changes the selected wavelength.",
  },
  sample: {
    title: "Sample cell",
    copy:
      "The excitation beam enters on the incident axis. Fluorescence is collected from the side arm at roughly 90 degrees, while remaining transmitted excitation is absorbed by the beam stop.",
  },
  emission: {
    title: "Emission monochromator",
    copy:
      "Sits on the 90-degree collection arm and selects the emission-side wavelength band before detection.",
  },
  detector: {
    title: "Detector",
    copy:
      "Receives selected emission-side light. Geometry and emission-side optics reduce direct excitation light before the detector.",
  },
  output: {
    title: "Spectrum display",
    copy:
      "Shows a generated trace for the selected conceptual mode. The detector-to-display connection is an electronic signal path, not another light beam.",
  },
});

export const SAMPLE_PROFILES = Object.freeze({
  "low-background": {
    name: "Low-background sample",
    description: "A clean illustrative sample with a distinct synthetic emission feature.",
    excitationPeak: 365,
    excitationWidth: 42,
    emissionPeak: 468,
    emissionWidth: 36,
    amplitude: 1,
    baseline: 0.025,
    noise: 0.018,
    decay: 0.2,
  },
  "broad-emission": {
    name: "Broad-emission sample",
    description: "A conceptual sample with broader excitation and emission response.",
    excitationPeak: 405,
    excitationWidth: 72,
    emissionPeak: 552,
    emissionWidth: 74,
    amplitude: 0.86,
    baseline: 0.04,
    noise: 0.015,
    decay: 0.12,
  },
  blank: {
    name: "Blank / background-dominant",
    description: "Mostly baseline plus small background/scatter; not a true fluorescence band.",
    kind: "blank",
    excitationPeak: 330,
    excitationWidth: 60,
    emissionPeak: 430,
    emissionWidth: 48,
    amplitude: 0.02,
    baseline: 0.026,
    noise: 0.008,
    decay: 0.02,
  },
  scattering: {
    name: "Scattering sample",
    description: "A conceptual case where background and scatter compete with fluorescence.",
    excitationPeak: 320,
    excitationWidth: 56,
    emissionPeak: 440,
    emissionWidth: 42,
    amplitude: 0.38,
    baseline: 0.12,
    noise: 0.026,
    decay: 0.08,
  },
});

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function createInstrumentState() {
  return {
    mode: "emission",
    selectedPart: "source",
    source: {
      offsetUm: 0,
    },
    exMono: {
      gratingAngleDeg: 13.4,
    },
    emMono: {
      gratingAngleDeg: 19.1,
    },
    slit: {
      widthUm: 500,
    },
    sample: {
      preset: "low-background",
      offsetUm: 0,
    },
    detector: {
      angleDeg: 90,
    },
    integrationTimeMs: 200,
  };
}

export function applyControlValue(state, controlName, rawValue) {
  const numeric = Number(rawValue);

  switch (controlName) {
    case "excitation-angle":
      state.exMono.gratingAngleDeg = clamp(numeric, 9.5, 21.5);
      break;
    case "emission-angle":
      state.emMono.gratingAngleDeg = clamp(numeric, 14, 27);
      break;
    case "slit":
      state.slit.widthUm = clamp(numeric, 100, 1000);
      break;
    case "integration":
      state.integrationTimeMs = clamp(numeric, 20, 1000);
      break;
    case "sample":
      state.sample.preset = SAMPLE_PROFILES[rawValue] ? rawValue : "low-background";
      break;
    case "source-offset":
      state.source.offsetUm = clamp(numeric, -120, 120);
      break;
    case "sample-offset":
      state.sample.offsetUm = clamp(numeric, -120, 120);
      break;
    case "detector-angle":
      state.detector.angleDeg = clamp(numeric, 80, 100);
      break;
    default:
      break;
  }
}

export function setMode(state, mode) {
  if (MODES[mode]) {
    state.mode = mode;
  }
}

export function setSelectedPart(state, part) {
  if (PARTS[part]) {
    state.selectedPart = part;
  }
}

export function resetGeometry(state) {
  state.source.offsetUm = 0;
  state.sample.offsetUm = 0;
  state.detector.angleDeg = 90;
}

export function setGeometryOffsets(state, changes = {}) {
  if (Number.isFinite(changes.sourceOffsetUm)) {
    state.source.offsetUm = clamp(Math.round(changes.sourceOffsetUm), -120, 120);
  }

  if (Number.isFinite(changes.sampleOffsetUm)) {
    state.sample.offsetUm = clamp(Math.round(changes.sampleOffsetUm), -120, 120);
  }
}
