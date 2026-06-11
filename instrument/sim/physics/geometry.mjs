import { clamp } from "../math.mjs?v=response-chain-20260611";

export const GEOMETRY_PRESETS = Object.freeze({
  "right-angle-90": {
    label: "Right-angle 90 degree / 90° 直角收集",
    claimLevel: "conceptual-teaching",
  },
  "front-face": {
    label: "Front-face teaching geometry / 前表面教学几何",
    claimLevel: "conceptual-teaching",
  },
  transmission: {
    label: "Transmission teaching geometry / 透射教学几何",
    claimLevel: "conceptual-teaching",
  },
});

export const GEOMETRY_PRESET_OPTIONS = Object.freeze(
  ["right-angle-90", "front-face", "transmission"].map((id) =>
    Object.freeze({
      id,
      label: GEOMETRY_PRESETS[id].label,
    })
  )
);

export function deriveGeometryResponse(geometryId, options = {}) {
  const detectorAngleDeg = Number(options.detectorAngleDeg ?? 90);
  const turbidityRelative = clamp(Number(options.turbidityRelative ?? 0), 0, 1);
  const deltaDeg = Math.abs(detectorAngleDeg - 90);
  const angleFactor = Math.exp(-0.5 * Math.pow(deltaDeg / 6.5, 2));

  if (geometryId === "front-face") {
    return {
      id: "front-face",
      collectionFactor: clamp(0.78 - turbidityRelative * 0.08, 0.35, 0.9),
      scatterRisk: clamp(0.18 + turbidityRelative * 0.42, 0, 1),
      backgroundRisk: clamp(0.16 + turbidityRelative * 0.36, 0, 1),
    };
  }

  if (geometryId === "transmission") {
    return {
      id: "transmission",
      collectionFactor: clamp(0.34 * angleFactor, 0.05, 0.5),
      scatterRisk: clamp(0.42 + turbidityRelative * 0.42, 0, 1),
      backgroundRisk: clamp(0.48 + turbidityRelative * 0.4, 0, 1),
    };
  }

  return {
    id: "right-angle-90",
    collectionFactor: clamp(angleFactor * (1 - turbidityRelative * 0.18), 0.05, 1),
    scatterRisk: clamp(0.05 + turbidityRelative * 0.38 + deltaDeg / 30, 0, 1),
    backgroundRisk: clamp(0.04 + turbidityRelative * 0.28 + deltaDeg / 18, 0, 1),
  };
}
