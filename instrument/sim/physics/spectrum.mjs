import { SAMPLE_PROFILES, clamp } from "../state.mjs";

export const FIXED_Y_SCALE_MAX = 1.35;

function gaussian(value, center, width) {
  const normalized = (value - center) / Math.max(width, 1);
  return Math.exp(-0.5 * normalized * normalized);
}

function deterministicNoise(index, seed) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value) - 0.5;
}

function pointNoise(index, derivedSeed, profile) {
  return deterministicNoise(index, derivedSeed) * profile.noise;
}

function gainForState(state, physics, profile) {
  const integrationGain = 0.72 + Math.sqrt(state.integrationTimeMs / 1000) * 0.5;
  return (
    profile.amplitude *
    physics.throughput *
    physics.alignment.overlapFactor *
    physics.collection.collectionFactor *
    integrationGain
  );
}

function calculatePoint(mode, x, index, state, physics, profile) {
  const seed =
    physics.excitationNm * 0.011 +
    physics.emissionNm * 0.017 +
    physics.bandpassNm +
    state.integrationTimeMs * 0.001;
  const noise = pointNoise(index, seed, profile);
  const baseline =
    profile.baseline +
    physics.bandpassNm * 0.002 +
    physics.collection.backgroundRisk * (profile.kind === "blank" ? 0.018 : 0.028);
  const gain = gainForState(state, physics, profile);

  if (profile.kind === "blank") {
    if (mode === "emission") {
      return baseline + gaussian(x, physics.excitationNm + 18, 18 + physics.bandpassNm) * 0.032 + noise * 0.7;
    }

    if (mode === "excitation") {
      return baseline + gaussian(x, physics.emissionNm - 28, 32 + physics.bandpassNm) * 0.024 + noise * 0.7;
    }

    if (mode === "single") {
      return baseline;
    }

    return baseline + Math.sin(x / 34) * 0.004 + (x / 120) * 0.006 + noise * 0.6;
  }

  if (mode === "emission") {
    const excitationFit = gaussian(
      physics.excitationNm,
      profile.excitationPeak,
      profile.excitationWidth + physics.bandpassNm
    );
    const shiftedPeak = profile.emissionPeak + (physics.excitationNm - profile.excitationPeak) * 0.05;
    const fluorescence = gaussian(x, shiftedPeak, profile.emissionWidth + physics.bandpassNm * 2.2);
    const scatter =
      profile.name === "Scattering sample"
        ? gaussian(x, physics.excitationNm + 18, 18 + physics.bandpassNm) * (0.13 + physics.collection.backgroundRisk * 0.25)
        : 0;
    return baseline + gain * excitationFit * fluorescence + scatter + noise;
  }

  if (mode === "excitation") {
    const emissionFit = gaussian(
      physics.emissionNm,
      profile.emissionPeak,
      profile.emissionWidth + physics.bandpassNm
    );
    const excitation = gaussian(x, profile.excitationPeak, profile.excitationWidth + physics.bandpassNm * 1.35);
    const scatter =
      profile.name === "Scattering sample"
        ? gaussian(x, physics.emissionNm - 24, 26 + physics.bandpassNm) * (0.1 + physics.collection.backgroundRisk * 0.2)
        : 0;
    return baseline + gain * emissionFit * excitation + scatter + noise;
  }

  if (mode === "single") {
    const excitationFit = gaussian(physics.excitationNm, profile.excitationPeak, profile.excitationWidth);
    const emissionFit = gaussian(physics.emissionNm, profile.emissionPeak, profile.emissionWidth + physics.bandpassNm);
    return baseline + gain * excitationFit * emissionFit;
  }

  const time = x;
  const excitationFit = gaussian(physics.excitationNm, profile.excitationPeak, profile.excitationWidth);
  const emissionFit = gaussian(physics.emissionNm, profile.emissionPeak, profile.emissionWidth + physics.bandpassNm);
  const settle = 1 - Math.exp(-time / 16);
  const decay = 1 - profile.decay * (1 - Math.exp(-time / 72));
  const ripple = Math.sin(time / 9 + physics.bandpassNm * 0.4) * 0.025;
  return baseline + gain * excitationFit * emissionFit * settle * decay + ripple + noise;
}

export function generateSpectrum(state, physics) {
  const profile = SAMPLE_PROFILES[state.sample.preset] || SAMPLE_PROFILES["low-background"];
  const ranges = {
    emission: [380, 700],
    excitation: [250, 550],
    time: [0, 120],
    single: [0, 1],
  };
  const [min, max] = ranges[state.mode] || ranges.emission;
  const count = state.mode === "single" ? 12 : 96;
  const points = [];

  for (let index = 0; index < count; index += 1) {
    const progress = index / (count - 1);
    const x = min + (max - min) * progress;
    const rawY = clamp(calculatePoint(state.mode, x, index, state, physics, profile), 0, FIXED_Y_SCALE_MAX);
    points.push({
      x,
      y: rawY / FIXED_Y_SCALE_MAX,
      rawY,
    });
  }

  const peak = Math.max(...points.map((point) => point.rawY), 0);

  return {
    min,
    max,
    points,
    peak,
    yScaleMax: FIXED_Y_SCALE_MAX,
    profile,
  };
}

export function scanMetaForMode(mode, physics) {
  if (mode === "excitation") {
    return {
      axisLabel: "Excitation wavelength",
      axisRange: "Excitation 250-550 nm",
      fixedChannel: `Emission ${Math.round(physics.emissionNm)} nm`,
      startLabel: "250 nm",
      endLabel: "550 nm",
      emissionControlLabel: "Fixed emission channel",
      excitationBadge: "Scanning",
      emissionBadge: "Fixed",
    };
  }

  if (mode === "time") {
    return {
      axisLabel: "Time",
      axisRange: "Time 0-120 s",
      fixedChannel: `Ex ${Math.round(physics.excitationNm)} nm / Em ${Math.round(physics.emissionNm)} nm`,
      startLabel: "0 s",
      endLabel: "120 s",
      emissionControlLabel: "Fixed emission channel",
      excitationBadge: "Fixed",
      emissionBadge: "Fixed",
    };
  }

  if (mode === "single") {
    return {
      axisLabel: "Single-point readout",
      axisRange: "Fixed Ex/Em monitor",
      fixedChannel: `Ex ${Math.round(physics.excitationNm)} nm / Em ${Math.round(physics.emissionNm)} nm`,
      startLabel: "fixed Ex",
      endLabel: "fixed Em",
      emissionControlLabel: "Fixed emission channel",
      excitationBadge: "Fixed",
      emissionBadge: "Fixed",
    };
  }

  return {
    axisLabel: "Emission wavelength",
    axisRange: "Emission 380-700 nm",
    fixedChannel: `Excitation ${Math.round(physics.excitationNm)} nm`,
    startLabel: "380 nm",
    endLabel: "700 nm",
    emissionControlLabel: "Emission grating angle",
    excitationBadge: "Fixed",
    emissionBadge: "Scanning",
  };
}
