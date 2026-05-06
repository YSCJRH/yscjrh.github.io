import { clamp } from "../math.mjs?v=wavelength-control-20260429";

function gaussianOffset(offsetUm, toleranceUm) {
  const normalized = offsetUm / Math.max(toleranceUm, 1);
  return Math.exp(-0.5 * normalized * normalized);
}

export function deriveAlignment(sourceOffsetUm) {
  const sourceFactor = gaussianOffset(sourceOffsetUm, 92);
  const sampleFactor = 1;

  return {
    sourceFactor,
    sampleFactor,
    overlapFactor: clamp(sourceFactor * sampleFactor, 0, 1),
  };
}

export function collectionFromDetectorAngle(angleDeg) {
  const delta = Math.abs(angleDeg - 90);
  const collectionFactor = Math.exp(-0.5 * Math.pow(delta / 6.5, 2));
  const backgroundRisk = clamp(0.04 + delta / 18, 0.04, 0.75);

  return {
    deltaDeg: delta,
    collectionFactor: clamp(collectionFactor, 0.05, 1),
    backgroundRisk,
  };
}
