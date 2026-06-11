import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveInternalSpectrumOutputDirection,
  resolveMonochromatorInternalPath,
} from "../scene/InstrumentScene.mjs";

test("emission monochromator interior exits toward detector side after scene rotation", () => {
  const excitationPath = resolveMonochromatorInternalPath("excitation", 0);
  const emissionPath = resolveMonochromatorInternalPath("emission", 0);

  assert.ok(
    excitationPath.selectedEnd.x > excitationPath.selectedStart.x,
    "excitation monochromator selected ray should exit toward the sample-side x direction"
  );
  assert.ok(
    emissionPath.selectedEnd.x < emissionPath.selectedStart.x,
    "emission monochromator selected ray should use local -x so the rotated module exits toward the detector"
  );
  assert.ok(
    emissionPath.incomingStart.x > emissionPath.incomingEnd.x,
    "emission monochromator incoming ray should enter from the sample side before leaving toward detector"
  );
  assert.equal(resolveInternalSpectrumOutputDirection("excitation"), 1);
  assert.equal(resolveInternalSpectrumOutputDirection("emission"), -1);
});
