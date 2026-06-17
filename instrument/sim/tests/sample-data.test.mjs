import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  SAMPLE_PRESET_OPTIONS,
  SAMPLE_PROFILES,
  TEACHING_SAMPLE_PRESETS,
} from "../data/samplePresets.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const samplesDir = resolve(here, "../../data/samples");

function assertLocalizedText(value, label) {
  assert.equal(typeof value?.en, "string", `${label}.en should exist`);
  assert.equal(typeof value?.zh, "string", `${label}.zh should exist`);
  assert.ok(value.en.length > 0, `${label}.en should not be empty`);
  assert.ok(value.zh.length > 0, `${label}.zh should not be empty`);
}

function assertGaussianMixture(block, label) {
  assert.equal(block?.type, "gaussian-mixture", `${label} should be a gaussian mixture`);
  assert.ok(Array.isArray(block.peaks), `${label}.peaks should be an array`);
  assert.ok(block.peaks.length >= 1, `${label}.peaks should not be empty`);

  block.peaks.forEach((peak, index) => {
    assert.equal(Number.isFinite(peak.centerNm), true, `${label}.peaks[${index}].centerNm should be finite`);
    assert.equal(Number.isFinite(peak.fwhmNm), true, `${label}.peaks[${index}].fwhmNm should be finite`);
    assert.equal(Number.isFinite(peak.amplitude), true, `${label}.peaks[${index}].amplitude should be finite`);
    assert.ok(peak.centerNm >= 200 && peak.centerNm <= 900, `${label}.peaks[${index}].centerNm should stay in teaching range`);
    assert.ok(peak.fwhmNm > 0, `${label}.peaks[${index}].fwhmNm should be positive`);
    assert.ok(peak.amplitude >= 0 && peak.amplitude <= 1, `${label}.peaks[${index}].amplitude should be normalized`);
  });
}

test("sample presets are backed by static JSON data with teaching boundaries", () => {
  assert.equal(existsSync(samplesDir), true, "instrument/data/samples should exist");

  const sampleFiles = readdirSync(samplesDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();
  const sampleIds = Object.keys(TEACHING_SAMPLE_PRESETS).sort();

  assert.deepEqual(
    sampleFiles,
    sampleIds.map((id) => `${id}.json`)
  );

  sampleFiles.forEach((fileName) => {
    const sample = JSON.parse(readFileSync(resolve(samplesDir, fileName), "utf8"));
    const expectedId = fileName.replace(/\.json$/, "");

    assert.equal(sample.id, expectedId);
    assert.equal(sample.claimLevel, "synthetic-teaching");
    assert.equal(sample.controlBinding, "simulator-control");
    assert.match(sample.evidenceKey, /^ILAB-(008|013)$/);
    assertLocalizedText(sample.label, `${sample.id}.label`);
    assertLocalizedText(sample.notes, `${sample.id}.notes`);
    assertLocalizedText(sample.boundary, `${sample.id}.boundary`);
    assertGaussianMixture(sample.absorption, `${sample.id}.absorption`);
    assertGaussianMixture(sample.emission, `${sample.id}.emission`);
    assert.equal(Number.isFinite(sample.quantumYieldTeaching), true);
    assert.ok(sample.quantumYieldTeaching >= 0 && sample.quantumYieldTeaching <= 1);
    assert.equal(Number.isFinite(sample.concentrationRelative), true);
    assert.ok(sample.concentrationRelative >= 0 && sample.concentrationRelative <= 1);
    assert.ok(["low", "medium", "high"].includes(sample.innerFilterRisk));
    assert.ok(Array.isArray(sample.sources));
    assert.equal(sample.sources.length, 0, "synthetic teaching presets should not imply sourced sample spectra");
  });
});

test("classic fluorescence sample presets stay synthetic and source-separated", () => {
  const classicIds = ["egfp-like", "rhodamine-6g-like"];

  for (const id of classicIds) {
    const preset = TEACHING_SAMPLE_PRESETS[id];
    const profile = SAMPLE_PROFILES[id];

    assert.ok(preset, `${id} should exist as a teaching preset`);
    assert.equal(preset.claimLevel, "synthetic-teaching");
    assert.equal(preset.controlBinding, "simulator-control");
    assert.equal(preset.evidenceKey, "ILAB-013");
    assert.equal(preset.sources.length, 0, "classic presets must not imply measured spectra");
    assert.equal(preset.classicSample?.kind, "synthetic-analog");
    assert.match(preset.classicSample?.sourceDerivedExampleId || "", /r6g-emission|egfp-emission/);
    assertLocalizedText(preset.classicSample?.feedback, `${id}.classicSample.feedback`);
    assert.match(preset.notes.en, /synthetic/i);
    assert.match(preset.notes.zh, /合成/);
    assert.equal(profile.classicSample.kind, "synthetic-analog");
    assert.equal(profile.classicSample.sourceDerivedExampleId, preset.classicSample.sourceDerivedExampleId);
    assert.equal(profile.classicSample.feedback, `${preset.classicSample.feedback.en} / ${preset.classicSample.feedback.zh}`);
  }
});

test("runtime sample profiles are derived from sample preset data", () => {
  const presetIds = Object.keys(TEACHING_SAMPLE_PRESETS).sort();

  assert.deepEqual(Object.keys(SAMPLE_PROFILES).sort(), presetIds);
  assert.deepEqual(SAMPLE_PRESET_OPTIONS.map((option) => option.id).sort(), presetIds);

  for (const id of presetIds) {
    const preset = TEACHING_SAMPLE_PRESETS[id];
    const profile = SAMPLE_PROFILES[id];
    const option = SAMPLE_PRESET_OPTIONS.find((item) => item.id === id);

    assert.equal(profile.name, `${preset.label.en} / ${preset.label.zh}`);
    assert.equal(profile.description, `${preset.notes.en} / ${preset.notes.zh}`);
    assert.equal(profile.excitationPeak, preset.absorption.peaks[0].centerNm);
    assert.equal(profile.emissionPeak, preset.emission.peaks[0].centerNm);
    assert.equal(profile.amplitude, preset.quantumYieldTeaching);
    assert.equal(profile.claimLevel, "synthetic-teaching");
    assert.equal(profile.controlBinding, "simulator-control");
    assert.match(profile.evidenceKey, /^ILAB-(008|013)$/);
    assert.equal(profile.boundary, `${preset.boundary.en} / ${preset.boundary.zh}`);
    assert.equal(option.label, profile.name);
  }
});
