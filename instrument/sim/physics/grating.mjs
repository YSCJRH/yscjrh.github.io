import { clamp } from "../state.mjs?v=teaching-depth-20260427b";

export const TEACHING_GRATING = Object.freeze({
  grooveDensityPerMm: 1200,
  diffractionOrder: 1,
  halfDeviationAngleDeg: 10,
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

  return clamp(wavelength, 220, 820);
}

export function gratingAngleFromWavelength(wavelengthNm, config = TEACHING_GRATING) {
  const dNm = gratingSpacingNm(config);
  const kRad = degreesToRadians(config.halfDeviationAngleDeg);
  const ratio = (wavelengthNm * Math.max(config.diffractionOrder, 1)) / (2 * dNm * Math.cos(kRad));
  return radiansToDegrees(Math.asin(clamp(ratio, -1, 1)));
}

export function wavelengthToColor(wavelengthNm) {
  const wavelength = clamp(wavelengthNm, 260, 700);

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

  return "#ff7f70";
}
