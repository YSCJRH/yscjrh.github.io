import { clamp } from "../math.mjs?v=wavelength-control-20260429";

export const TEACHING_GRATING = Object.freeze({
  grooveDensityPerMm: 1200,
  diffractionOrder: 1,
  halfDeviationAngleDeg: 10,
});

export const MONOCHROMATOR_WAVELENGTH_RANGE = Object.freeze({
  minNm: 200,
  maxNm: 900,
});

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI;
}

export function gratingSpacingNm(config = TEACHING_GRATING) {
  return 1_000_000 / config.grooveDensityPerMm;
}

export function wavelengthFromGratingAngle(angleDeg, config = TEACHING_GRATING) {
  const dNm = gratingSpacingNm(config);
  const kRad = degreesToRadians(config.halfDeviationAngleDeg);
  const phiRad = degreesToRadians(angleDeg);
  const wavelength =
    (2 * dNm * Math.cos(kRad) * Math.sin(phiRad)) / Math.max(config.diffractionOrder, 1);

  return clamp(wavelength, MONOCHROMATOR_WAVELENGTH_RANGE.minNm, MONOCHROMATOR_WAVELENGTH_RANGE.maxNm);
}

export function gratingAngleFromWavelength(wavelengthNm, config = TEACHING_GRATING) {
  const dNm = gratingSpacingNm(config);
  const kRad = degreesToRadians(config.halfDeviationAngleDeg);
  const clampedWavelength = clamp(
    wavelengthNm,
    MONOCHROMATOR_WAVELENGTH_RANGE.minNm,
    MONOCHROMATOR_WAVELENGTH_RANGE.maxNm
  );
  const ratio = (clampedWavelength * Math.max(config.diffractionOrder, 1)) / (2 * dNm * Math.cos(kRad));
  return radiansToDegrees(Math.asin(clamp(ratio, -1, 1)));
}

export const MONOCHROMATOR_GRATING_ANGLE_RANGE = Object.freeze({
  min: gratingAngleFromWavelength(MONOCHROMATOR_WAVELENGTH_RANGE.minNm),
  max: gratingAngleFromWavelength(MONOCHROMATOR_WAVELENGTH_RANGE.maxNm),
});

export function wavelengthToColor(wavelengthNm) {
  const wavelength = clamp(wavelengthNm, MONOCHROMATOR_WAVELENGTH_RANGE.minNm, MONOCHROMATOR_WAVELENGTH_RANGE.maxNm);

  if (wavelength < 260) {
    return "#8577ff";
  }

  if (wavelength < 380) {
    return "#6f88ff";
  }

  if (wavelength < 440) {
    return "#6d7dff";
  }

  if (wavelength < 490) {
    return "#4fb6ff";
  }

  if (wavelength < 540) {
    return "#52f0d3";
  }

  if (wavelength < 590) {
    return "#9af26f";
  }

  if (wavelength < 640) {
    return "#ffd36a";
  }

  if (wavelength <= 700) {
    return "#ff7f70";
  }

  return "#ff6f8f";
}
