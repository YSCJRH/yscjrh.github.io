import { MONOCHROMATOR_WAVELENGTH_RANGE } from "./grating.mjs?v=wavelength-control-20260429";
import { evaluateDetectorResponse } from "./detector.mjs?v=response-chain-20260611";
import { evaluateSourceSpectrum } from "./source.mjs?v=response-chain-20260611";
import { convolveLineShape } from "./instrumentFunction.mjs?v=response-chain-20260611";
import { composeRawSignal } from "./radiometry.mjs?v=response-chain-20260611";
import { clamp } from "../math.mjs?v=wavelength-control-20260429";
import { SAMPLE_PROFILES, SPECTRUM_VIEW_OPTIONS } from "../state.mjs?v=display-toggles-20260611";

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

function isNoiseVisible(state) {
  return state.display?.showNoise !== false;
}

function areArtifactCuesVisible(state) {
  return state.display?.showArtifacts !== false;
}

function spectralResponseForPoint(mode, x, state, physics) {
  const sourceId = state.source.id || "xenon-like";
  const detectorId = state.detector.id || "pmt-like-visible";
  const sourceWavelengthNm = mode === "excitation" ? x : physics.excitationNm;
  const detectorWavelengthNm = mode === "emission" ? x : physics.emissionNm;

  return {
    source: evaluateSourceSpectrum(sourceId, sourceWavelengthNm),
    detector: evaluateDetectorResponse(detectorId, detectorWavelengthNm),
  };
}

function spectrumViewForState(state) {
  return (
    SPECTRUM_VIEW_OPTIONS.find((option) => option.id === state.display?.spectrumView) ||
    SPECTRUM_VIEW_OPTIONS[0]
  );
}

function responseNormalizerForPoint(mode, x, state, physics, responseChain) {
  const spectralResponse = spectralResponseForPoint(mode, x, state, physics);
  const source = mode === "excitation"
    ? spectralResponse.source
    : responseChain?.source?.atExcitation ?? spectralResponse.source;
  const detector = mode === "emission"
    ? spectralResponse.detector
    : responseChain?.detector?.atEmission ?? spectralResponse.detector;
  const collection = responseChain?.geometry?.collectionFactor ?? physics.detectorArm.collectionFactor;

  return clamp(source * detector * collection, 0.22, 1);
}

function gainForState(mode, x, state, physics, profile, responseChain) {
  const integrationGain = 0.72 + Math.sqrt(state.integrationTimeMs / 1000) * 0.5;
  const spectralResponse = spectralResponseForPoint(mode, x, state, physics);
  const collectionFactor = responseChain?.geometry?.collectionFactor ?? physics.detectorArm.collectionFactor;

  return (
    profile.amplitude *
    physics.throughput *
    physics.alignment.overlapFactor *
    collectionFactor *
    spectralResponse.source *
    spectralResponse.detector *
    integrationGain
  );
}

function createComponents({ baselineY = 0, sampleRawY = 0, scatterY = 0, noiseY = 0 } = {}) {
  const safeBaseline = Math.max(Number(baselineY) || 0, 0);
  const safeSample = Math.max(Number(sampleRawY) || 0, 0);
  const safeScatter = Math.max(Number(scatterY) || 0, 0);
  const safeNoise = Number(noiseY) || 0;

  return {
    baselineY: safeBaseline,
    sampleRawY: safeSample,
    sampleInstrumentY: safeSample,
    scatterY: safeScatter,
    noiseY: safeNoise,
  };
}

function sumComponents(components) {
  return components.baselineY + components.sampleInstrumentY + components.scatterY + components.noiseY;
}

function calculatePointComponents(mode, x, index, state, physics, profile, responseChain) {
  const showNoise = isNoiseVisible(state);
  const showArtifacts = areArtifactCuesVisible(state);
  const seed =
    physics.excitationNm * 0.011 +
    physics.emissionNm * 0.017 +
    physics.bandpassNm +
    state.integrationTimeMs * 0.001;
  const noise = showNoise ? pointNoise(index, seed, profile) : 0;
  const backgroundRisk = showArtifacts
    ? responseChain?.geometry?.backgroundRisk ?? physics.detectorArm.backgroundRisk
    : 0;
  const baseline =
    profile.baseline +
    physics.bandpassNm * 0.002 +
    backgroundRisk * (profile.kind === "blank" ? 0.018 : 0.028);

  if (profile.kind === "blank") {
    if (mode === "emission") {
      const scatter = showArtifacts ? gaussian(x, physics.excitationNm + 18, 18 + physics.bandpassNm) * 0.032 : 0;
      return createComponents({ baselineY: baseline, scatterY: scatter, noiseY: noise * 0.7 });
    }

    if (mode === "excitation") {
      const scatter = showArtifacts ? gaussian(x, physics.emissionNm - 28, 32 + physics.bandpassNm) * 0.024 : 0;
      return createComponents({ baselineY: baseline, scatterY: scatter, noiseY: noise * 0.7 });
    }

    if (mode === "single") {
      return createComponents({ baselineY: baseline });
    }

    const drift = showArtifacts ? Math.sin(x / 34) * 0.004 + (x / 120) * 0.006 : 0;
    return createComponents({ baselineY: baseline, scatterY: drift, noiseY: noise * 0.6 });
  }

  if (mode === "emission") {
    const shiftedPeak = profile.emissionPeak + (physics.excitationNm - profile.excitationPeak) * 0.05;
    const fluorescence = gaussian(x, shiftedPeak, profile.emissionWidth);
    const scatter =
      showArtifacts && profile.kind === "scattering"
        ? gaussian(x, physics.excitationNm + 18, 18 + physics.bandpassNm) * (0.13 + backgroundRisk * 0.25)
        : 0;
    const spectralResponse = spectralResponseForPoint(mode, x, state, physics);
    const signal = composeRawSignal({
      sourceAtExcitation: responseChain?.source?.atExcitation ?? spectralResponse.source,
      excitationBandpassTransmission: physics.throughput * physics.alignment.overlapFactor,
      absorptionAtExcitation: responseChain?.sample?.absorptionAtExcitation ?? 0,
      quantumYield: profile.amplitude,
      emissionShapeAtWavelength: fluorescence,
      emissionBandpassTransmission: physics.throughput,
      detectorResponseAtEmission: spectralResponse.detector,
      collectionFactor: responseChain?.geometry?.collectionFactor ?? physics.detectorArm.collectionFactor,
      integrationMs: state.integrationTimeMs,
      darkBaseline: 0,
      background: 0,
      saturationThreshold: 1.15,
    });
    return createComponents({ baselineY: baseline, sampleRawY: signal.raw, scatterY: scatter, noiseY: noise });
  }

  if (mode === "excitation") {
    const emissionFit = gaussian(
      physics.emissionNm,
      profile.emissionPeak,
      profile.emissionWidth + physics.bandpassNm
    );
    const excitation = gaussian(x, profile.excitationPeak, profile.excitationWidth + physics.bandpassNm * 1.35);
    const scatter =
      showArtifacts && profile.kind === "scattering"
        ? gaussian(x, physics.emissionNm - 24, 26 + physics.bandpassNm) * (0.1 + backgroundRisk * 0.2)
        : 0;
    const spectralResponse = spectralResponseForPoint(mode, x, state, physics);
    const signal = composeRawSignal({
      sourceAtExcitation: spectralResponse.source,
      excitationBandpassTransmission: physics.throughput * physics.alignment.overlapFactor,
      absorptionAtExcitation: excitation,
      quantumYield: profile.amplitude,
      emissionShapeAtWavelength: emissionFit,
      emissionBandpassTransmission: physics.throughput,
      detectorResponseAtEmission: responseChain?.detector?.atEmission ?? spectralResponse.detector,
      collectionFactor: responseChain?.geometry?.collectionFactor ?? physics.detectorArm.collectionFactor,
      integrationMs: state.integrationTimeMs,
      darkBaseline: baseline,
      background: 0,
      saturationThreshold: 1.15,
    });
    return createComponents({
      baselineY: baseline,
      sampleRawY: signal.raw - baseline,
      scatterY: scatter,
      noiseY: noise,
    });
  }

  if (mode === "single") {
    const gain = gainForState(mode, x, state, physics, profile, responseChain);
    const excitationFit = gaussian(physics.excitationNm, profile.excitationPeak, profile.excitationWidth);
    const emissionFit = gaussian(physics.emissionNm, profile.emissionPeak, profile.emissionWidth + physics.bandpassNm);
    return createComponents({ baselineY: baseline, sampleRawY: gain * excitationFit * emissionFit });
  }

  const time = x;
  const excitationFit = gaussian(physics.excitationNm, profile.excitationPeak, profile.excitationWidth);
  const emissionFit = gaussian(physics.emissionNm, profile.emissionPeak, profile.emissionWidth + physics.bandpassNm);
  const spectralResponse = spectralResponseForPoint(mode, x, state, physics);
  const steadySignal = composeRawSignal({
    sourceAtExcitation: responseChain?.source?.atExcitation ?? spectralResponse.source,
    excitationBandpassTransmission: physics.throughput * physics.alignment.overlapFactor,
    absorptionAtExcitation: responseChain?.sample?.absorptionAtExcitation ?? excitationFit,
    quantumYield: profile.amplitude,
    emissionShapeAtWavelength: responseChain?.sample?.emissionAtEmission ?? emissionFit,
    emissionBandpassTransmission: physics.throughput,
    detectorResponseAtEmission: responseChain?.detector?.atEmission ?? spectralResponse.detector,
    collectionFactor: responseChain?.geometry?.collectionFactor ?? physics.detectorArm.collectionFactor,
    integrationMs: state.integrationTimeMs,
    darkBaseline: baseline,
    background: 0,
    saturationThreshold: 1.15,
  });
  const settle = 1 - Math.exp(-time / 16);
  const decay = 1 - profile.decay * (1 - Math.exp(-time / 72));
  const ripple = Math.sin(time / 9 + physics.bandpassNm * 0.4) * 0.025;
  return createComponents({
    baselineY: baseline,
    sampleRawY: (steadySignal.raw - baseline) * settle * decay,
    scatterY: ripple,
    noiseY: noise,
  });
}

export function generateSpectrum(state, physics, responseChain = null) {
  const profile = SAMPLE_PROFILES[state.sample.preset] || SAMPLE_PROFILES["low-background"];
  const view = spectrumViewForState(state);
  const display = {
    showNoise: isNoiseVisible(state),
    showArtifacts: areArtifactCuesVisible(state),
  };
  const ranges = {
    emission: [MONOCHROMATOR_WAVELENGTH_RANGE.minNm, MONOCHROMATOR_WAVELENGTH_RANGE.maxNm],
    excitation: [MONOCHROMATOR_WAVELENGTH_RANGE.minNm, MONOCHROMATOR_WAVELENGTH_RANGE.maxNm],
    time: [0, 120],
    single: [0, 1],
  };
  const [min, max] = ranges[state.mode] || ranges.emission;
  const count = state.mode === "single" ? 12 : 96;
  const singlePointRawSignal = Number(responseChain?.signal?.raw);
  const singlePointRawY = state.mode === "single" && Number.isFinite(singlePointRawSignal)
    ? clamp(singlePointRawSignal, 0, FIXED_Y_SCALE_MAX)
    : null;
  const componentRows = [];

  for (let index = 0; index < count; index += 1) {
    const progress = index / (count - 1);
    const x = min + (max - min) * progress;
    const components = singlePointRawY === null
      ? calculatePointComponents(state.mode, x, index, state, physics, profile, responseChain)
      : createComponents({ sampleRawY: singlePointRawY });
    componentRows.push({ x, components });
  }

  if (state.mode === "emission") {
    const broadenedSample = convolveLineShape(
      componentRows.map((row) => row.x),
      componentRows.map((row) => row.components.sampleRawY),
      { fwhmNm: physics.bandpassNm }
    );

    componentRows.forEach((row, index) => {
      row.components.sampleInstrumentY = Math.max(Number(broadenedSample[index]) || 0, 0);
    });
  }

  const points = componentRows.map(({ x, components }) => {
    const rawY = clamp(sumComponents(components), 0, FIXED_Y_SCALE_MAX);
    const responseNormalizer = responseNormalizerForPoint(state.mode, x, state, physics, responseChain);
    const responseNormalizedY = clamp(rawY / responseNormalizer, 0, FIXED_Y_SCALE_MAX);
    const displayY = view.id === "response-normalized" ? responseNormalizedY : rawY;
    return {
      x,
      y: displayY / FIXED_Y_SCALE_MAX,
      rawY,
      responseNormalizedY,
      components,
    };
  });

  const rawPeak = Math.max(...points.map((point) => point.rawY), 0);
  const responseNormalizedPeak = Math.max(...points.map((point) => point.responseNormalizedY), 0);
  const peak = view.id === "response-normalized" ? responseNormalizedPeak : rawPeak;

  return {
    min,
    max,
    points,
    peak,
    rawPeak,
    responseNormalizedPeak,
    view,
    display,
    yScaleMax: FIXED_Y_SCALE_MAX,
    profile,
  };
}

export function scanMetaForMode(mode, physics) {
  if (mode === "excitation") {
    return {
      axisLabel: "Excitation wavelength / 激发波长",
      axisRange: "Excitation 200-900 nm / 激发 200-900 nm",
      fixedChannel: `Emission ${Math.round(physics.emissionNm)} nm / 发射 ${Math.round(physics.emissionNm)} nm`,
      startLabel: "200 nm",
      endLabel: "900 nm",
      emissionControlLabel: "Fixed emission wavelength / 固定发射波长",
      excitationBadge: "Scanning / 扫描",
      emissionBadge: "Fixed / 固定",
    };
  }

  if (mode === "time") {
    return {
      axisLabel: "Time / 时间",
      axisRange: "Time 0-120 s / 时间 0-120 s",
      fixedChannel: `Ex ${Math.round(physics.excitationNm)} nm / 激发 ${Math.round(physics.excitationNm)} nm · Em ${Math.round(physics.emissionNm)} nm / 发射 ${Math.round(physics.emissionNm)} nm`,
      startLabel: "0 s",
      endLabel: "120 s",
      emissionControlLabel: "Fixed emission wavelength / 固定发射波长",
      excitationBadge: "Fixed / 固定",
      emissionBadge: "Fixed / 固定",
    };
  }

  if (mode === "single") {
    return {
      axisLabel: "Single-point readout / 单点读数",
      axisRange: "Fixed Ex/Em monitor / 固定激发与发射监测",
      fixedChannel: `Ex ${Math.round(physics.excitationNm)} nm / 激发 ${Math.round(physics.excitationNm)} nm · Em ${Math.round(physics.emissionNm)} nm / 发射 ${Math.round(physics.emissionNm)} nm`,
      startLabel: "fixed Ex / 固定激发",
      endLabel: "fixed Em / 固定发射",
      emissionControlLabel: "Fixed emission wavelength / 固定发射波长",
      excitationBadge: "Fixed / 固定",
      emissionBadge: "Fixed / 固定",
    };
  }

  return {
    axisLabel: "Emission wavelength / 发射波长",
    axisRange: "Emission 200-900 nm / 发射 200-900 nm",
    fixedChannel: `Excitation ${Math.round(physics.excitationNm)} nm / 激发 ${Math.round(physics.excitationNm)} nm`,
    startLabel: "200 nm",
    endLabel: "900 nm",
    emissionControlLabel: "Emission wavelength / 发射波长",
    excitationBadge: "Fixed / 固定",
    emissionBadge: "Scanning / 扫描",
  };
}
