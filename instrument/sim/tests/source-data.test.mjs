import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findClosestIndex,
  findEemPeak,
  formatSourceAxes,
  getEemSlice,
  isPlottableSourceDataset,
  setElementText,
  setLanguagePair,
  sourceDatasetBoundaryNote,
  splitLanguagePair,
} from "../ui/source-data.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(here, "../../data/manifest.json"), "utf8"));

function assertStrictlyIncreasing(values, label) {
  assert.ok(Array.isArray(values), `${label} should be an array`);
  assert.ok(values.length >= 2, `${label} should contain at least two points`);

  values.forEach((value, index) => {
    assert.equal(Number.isFinite(value), true, `${label}[${index}] should be finite`);
    assert.ok(value > 0, `${label}[${index}] should be a positive wavelength`);
    if (index > 0) {
      assert.ok(value > values[index - 1], `${label}[${index}] should be greater than previous wavelength`);
    }
  });
}

function assertNormalized(values, label) {
  assert.ok(Array.isArray(values), `${label} should be an array`);
  values.forEach((value, index) => {
    assert.equal(Number.isFinite(value), true, `${label}[${index}] should be finite`);
    assert.ok(value >= 0 && value <= 1, `${label}[${index}] should stay in [0, 1]`);
  });
}

function assertDisplayRangeMatches(data, axisKey, label) {
  const axis = data[axisKey];
  const range = data.displayRange?.[axisKey] || data.displayRange?.x;
  assert.deepEqual(range, [axis[0], axis.at(-1)], `${label} display range should match axis endpoints`);
}

const demoEem = {
  excitation: [250, 300, 350],
  emission: [400, 450],
  z: [
    [0.1, 0.8, 0.2],
    [0.05, 1, 0.25],
  ],
};

test("findClosestIndex resolves wavelength defaults without requiring exact axis values", () => {
  assert.equal(findClosestIndex(demoEem.excitation, 292), 1);
  assert.equal(findClosestIndex(demoEem.emission, 440), 1);
});

test("findEemPeak returns the strongest matrix coordinate", () => {
  const peak = findEemPeak(demoEem);

  assert.equal(peak.row, 1);
  assert.equal(peak.col, 1);
  assert.equal(peak.value, 1);
});

test("getEemSlice extracts display-only emission and excitation cross-sections", () => {
  const emissionSlice = getEemSlice(demoEem, "emission", 1);
  const excitationSlice = getEemSlice(demoEem, "excitation", 1);

  assert.deepEqual(emissionSlice.x, demoEem.emission);
  assert.deepEqual(emissionSlice.y, [0.8, 1]);
  assert.match(emissionSlice.fixedLabel, /Fixed Ex 300 nm/);

  assert.deepEqual(excitationSlice.x, demoEem.excitation);
  assert.deepEqual(excitationSlice.y, [0.05, 1, 0.25]);
  assert.match(excitationSlice.fixedLabel, /Fixed Em 450 nm/);
});

test("getEemSlice clamps out-of-range slice indexes", () => {
  const lowEmissionSlice = getEemSlice(demoEem, "emission", -10);
  const highEmissionSlice = getEemSlice(demoEem, "emission", 99);
  const highExcitationSlice = getEemSlice(demoEem, "excitation", 99);

  assert.deepEqual(lowEmissionSlice.y, [0.1, 0.05]);
  assert.match(lowEmissionSlice.fixedLabel, /Fixed Ex 250 nm/);
  assert.deepEqual(highEmissionSlice.y, [0.2, 0.25]);
  assert.match(highEmissionSlice.fixedLabel, /Fixed Ex 350 nm/);
  assert.match(highExcitationSlice.fixedLabel, /Fixed Em 450 nm/);
});

test("EEM helpers tolerate empty or malformed inputs without throwing", () => {
  assert.equal(findClosestIndex([], 300), 0);
  assert.deepEqual(findEemPeak({ z: [] }), { row: 0, col: 0, value: 0 });

  const emptySlice = getEemSlice({}, "emission", 4);
  assert.deepEqual(emptySlice.x, []);
  assert.deepEqual(emptySlice.y, []);
  assert.match(emptySlice.fixedLabel, /Fixed Ex -- nm/);
});

test("source-derived manifest entries declare display-only control boundaries", () => {
  assert.ok(Array.isArray(manifest.datasets));
  assert.ok(manifest.datasets.length > 0);

  manifest.datasets.forEach((dataset) => {
    assert.equal(dataset.controlBinding, "display-only", `${dataset.id} should not bind to simulator controls`);
    assert.ok(
      ["source-derived-display", "reference-only"].includes(dataset.claimLevel),
      `${dataset.id} should declare a conservative claim level`
    );
    assert.match(dataset.claimBoundary, /only|仅|参考|display/i);
    assert.ok(dataset.source?.url, `${dataset.id} should record a source URL`);
    assert.ok(dataset.source?.license, `${dataset.id} should record a license or non-embedded boundary`);
    assert.ok(dataset.source?.citation, `${dataset.id} should record a citation or reference note`);

    if (dataset.dataUrl) {
      assert.equal(dataset.claimLevel, "source-derived-display");
      assert.notEqual(dataset.displayModes?.[0], "reference-only");
      assert.ok(dataset.processing?.normalization, `${dataset.id} should record normalization`);
      assert.ok(dataset.processing?.downsampling, `${dataset.id} should record downsampling`);
    } else {
      assert.equal(dataset.claimLevel, "reference-only");
      assert.deepEqual(dataset.displayModes, ["reference-only"]);
    }
  });
});

test("processed source-derived data axes and provenance are valid for plotting", () => {
  manifest.datasets
    .filter((dataset) => dataset.dataUrl)
    .forEach((dataset) => {
      const data = JSON.parse(readFileSync(resolve(here, "../../data", dataset.dataUrl), "utf8"));

      assert.match(dataset.processing?.sourceChecksumSha256 || "", /^[a-f0-9]{64}$/);
      assert.equal(typeof dataset.processing?.axisHandling, "string", `${dataset.id} should document axis handling`);
      assert.ok(dataset.processing.axisHandling.length > 0, `${dataset.id} axis handling should not be empty`);

      if (dataset.kind === "spectrum1d") {
        assertStrictlyIncreasing(data.x, `${dataset.id}.x`);
        assert.equal(data.x.length, data.y.length, `${dataset.id} x/y lengths should match`);
        assertNormalized(data.y, `${dataset.id}.y`);
        assertDisplayRangeMatches(data, "x", dataset.id);
      }

      if (dataset.kind === "eem") {
        assertStrictlyIncreasing(data.excitation, `${dataset.id}.excitation`);
        assertStrictlyIncreasing(data.emission, `${dataset.id}.emission`);
        assert.deepEqual(data.displayRange?.excitation, [data.excitation[0], data.excitation.at(-1)]);
        assert.deepEqual(data.displayRange?.emission, [data.emission[0], data.emission.at(-1)]);
        assert.deepEqual(data.displayRange?.z, [0, 1]);
        assert.equal(data.z.length, data.emission.length, `${dataset.id} EEM rows should match emission axis`);
        data.z.forEach((row, rowIndex) => {
          assert.equal(row.length, data.excitation.length, `${dataset.id} row ${rowIndex} should match excitation axis`);
          assertNormalized(row, `${dataset.id}.z[${rowIndex}]`);
        });
      }
    });
});

test("plottable source-derived datasets declare structured axes for the facts panel", () => {
  manifest.datasets.filter(isPlottableSourceDataset).forEach((dataset) => {
    assert.equal(typeof dataset.axes, "object", `${dataset.id} should declare axes`);

    if (dataset.kind === "eem") {
      for (const key of ["excitation", "emission", "intensity"]) {
        assert.equal(typeof dataset.axes[key]?.label, "string", `${dataset.id}.${key} should have label`);
        assert.equal(typeof dataset.axes[key]?.unit, "string", `${dataset.id}.${key} should have unit`);
        assert.equal(typeof dataset.axes[key]?.source, "string", `${dataset.id}.${key} should have source`);
      }
      assert.equal(dataset.axes.excitation.inferred, true, `${dataset.id} excitation axis should be marked inferred`);
    } else {
      for (const key of ["x", "y"]) {
        assert.equal(typeof dataset.axes[key]?.label, "string", `${dataset.id}.${key} should have label`);
        assert.equal(typeof dataset.axes[key]?.unit, "string", `${dataset.id}.${key} should have unit`);
        assert.equal(typeof dataset.axes[key]?.source, "string", `${dataset.id}.${key} should have source`);
      }
    }
  });
});

test("source axis facts are concise paired public copy", () => {
  const spectrum = manifest.datasets.find((dataset) => dataset.id === "r6g-emission-ethylene-glycol");
  const eem = manifest.datasets.find((dataset) => dataset.id === "fe-dom-sample01-eem");

  const spectrumCopy = formatSourceAxes(spectrum);
  const eemCopy = formatSourceAxes(eem);

  assert.match(spectrumCopy, /X: wavelength .*nm/i);
  assert.match(spectrumCopy, /Y: normalized intensity .*a\.u\./i);
  assert.match(spectrumCopy, /坐标轴/);
  assert.match(eemCopy, /Excitation: .*inferred/i);
  assert.match(eemCopy, /Emission: .*emission_lambda\.txt/i);
  assert.match(eemCopy, /激发/);
});

test("source dataset card boundary notes are short paired display-only copy", () => {
  const plotted = manifest.datasets.find((dataset) => dataset.dataUrl);
  const reference = manifest.datasets.find((dataset) => dataset.kind === "reference");

  assert.match(sourceDatasetBoundaryNote(plotted), /Display-only source example/);
  assert.match(sourceDatasetBoundaryNote(plotted), /模拟器滑块分离/);
  assert.match(sourceDatasetBoundaryNote(reference), /Reference-only/);
  assert.match(sourceDatasetBoundaryNote(reference), /未绘制/);
});

test("runtime only treats source-derived display-only datasets as plottable", () => {
  const plotted = manifest.datasets.find((dataset) => dataset.dataUrl);
  const reference = manifest.datasets.find((dataset) => dataset.kind === "reference");

  assert.equal(isPlottableSourceDataset(plotted), true);
  assert.equal(isPlottableSourceDataset(reference), false);
  assert.equal(isPlottableSourceDataset({ ...plotted, claimLevel: "reference-only" }), false);
  assert.equal(isPlottableSourceDataset({ ...plotted, controlBinding: "simulator-control" }), false);
  assert.equal(isPlottableSourceDataset({ ...plotted, dataUrl: null }), false);
});

test("runtime source-data copy can preserve language mode structure", () => {
  const created = [];
  const fakeDocument = {
    createElement(tagName) {
      const node = {
        tagName,
        dataset: {},
        attributes: {},
        textContent: "",
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
      };
      created.push(node);
      return node;
    },
  };
  const fakeElement = {
    ownerDocument: fakeDocument,
    textContent: "stale mixed copy",
    children: [],
    append(...nodes) {
      this.children.push(...nodes);
    },
  };

  setLanguagePair(fakeElement, { en: "Display-only runtime copy.", zh: "仅显示的运行时文案。" });

  assert.equal(fakeElement.textContent, "");
  assert.equal(fakeElement.children.length, 2);
  assert.equal(fakeElement.children[0].dataset.language, "en");
  assert.equal(fakeElement.children[0].textContent, "Display-only runtime copy.");
  assert.equal(fakeElement.children[1].dataset.language, "zh");
  assert.equal(fakeElement.children[1].attributes.lang, "zh-CN");
  assert.equal(fakeElement.children[1].textContent, "仅显示的运行时文案。");
});

test("source-data language splitting preserves slash-heavy English labels", () => {
  assert.deepEqual(
    splitLanguagePair("Excitation wavelength / EEM heatmap / 激发波长 / EEM 热图"),
    {
      en: "Excitation wavelength / EEM heatmap",
      zh: "激发波长 / EEM 热图",
    }
  );
});

test("source-data localized text uses language spans for HTML but keeps SVG text plain", () => {
  const fakeDocument = {
    createElement(tagName) {
      return {
        tagName,
        dataset: {},
        attributes: {},
        textContent: "",
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
      };
    },
  };
  const htmlElement = {
    namespaceURI: "http://www.w3.org/1999/xhtml",
    ownerDocument: fakeDocument,
    textContent: "stale",
    children: [],
    append(...nodes) {
      this.children.push(...nodes);
    },
  };
  const svgText = {
    namespaceURI: "http://www.w3.org/2000/svg",
    textContent: "stale",
  };

  setElementText(htmlElement, "Loaded local source-derived example. / 已加载本地引用数据示例。");
  setElementText(svgText, "Emission wavelength / 发射波长");

  assert.equal(htmlElement.textContent, "");
  assert.equal(htmlElement.children.length, 2);
  assert.equal(htmlElement.children[0].dataset.language, "en");
  assert.equal(htmlElement.children[0].textContent, "Loaded local source-derived example.");
  assert.equal(htmlElement.children[1].dataset.language, "zh");
  assert.equal(htmlElement.children[1].textContent, "已加载本地引用数据示例。");
  assert.equal(svgText.textContent, "Emission wavelength / 发射波长");
});
