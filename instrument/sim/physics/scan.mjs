import { MONOCHROMATOR_WAVELENGTH_RANGE } from "./grating.mjs?v=response-chain-20260611";

export function buildScanAxis(mode = "emission", options = {}) {
  const pointCount = Math.max(Math.round(Number(options.pointCount ?? 96)), 2);
  const isTime = mode === "time";
  const min = isTime ? 0 : Number(options.minNm ?? MONOCHROMATOR_WAVELENGTH_RANGE.minNm);
  const max = isTime ? Number(options.maxSeconds ?? 120) : Number(options.maxNm ?? MONOCHROMATOR_WAVELENGTH_RANGE.maxNm);
  const points = Array.from({ length: pointCount }, (_, index) => {
    const progress = index / (pointCount - 1);
    return min + (max - min) * progress;
  });

  return {
    mode,
    unit: isTime ? "s" : "nm",
    min,
    max,
    points,
  };
}
