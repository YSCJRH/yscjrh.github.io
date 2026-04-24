const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "instrument", "data");
const PROCESSED_DIR = path.join(DATA_DIR, "processed");
const GENERATED_AT = new Date().toISOString().slice(0, 10);
const PACKAGE_SIZE_LIMIT_BYTES = 350 * 1024;

const FILES = {
  r6g:
    "https://zenodo.org/api/records/569817/files/fluorescence_spectrum_R6G_in_EthyleneGlycol.csv/content",
  egfp:
    "https://zenodo.org/api/records/580169/files/Goedhart_Mastop_Abs-Em_Spectra-FPs.csv/content",
  domEmission:
    "https://zenodo.org/api/records/3737108/files/emission_lambda.txt/content",
  domEem:
    "https://zenodo.org/api/records/3737108/files/sample01EEM.txt/content",
};

const SOURCE_NOTES = {
  r6g:
    "Source fluorescence counts were passed through a narrow-spike suppression step because the Zenodo record notes visible room-light spikes, then bucket-averaged, clamped at zero, and normalized to max=1 for display. This package is educational, not a corrected reference spectrum.",
  egfp:
    "EGFP emission columns were extracted from the public fluorescent-protein table, downsampled by bucket averaging, clamped at zero, and normalized to max=1 for display.",
  dom:
    "sample01EEM.txt was clamped at zero, averaged into a compact heatmap, and normalized to max=1. emission_lambda.txt provides the row axis. The source description mentions excitation_lambda.txt, but that file is absent from the Zenodo record; the display excitation axis is inferred as 239-800 nm in 3 nm increments from matrix width and source notes.",
};

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function fetchText(label, url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${label}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseCsv(text) {
  return text
    .trim()
    .split(/\r\n|\n|\r/)
    .filter(Boolean)
    .map((line) => line.split(","));
}

function toFiniteNumber(value) {
  const parsed = Number(String(value || "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, digits = 5) {
  return Number(value.toFixed(digits));
}

function downsampleSeries(points, targetCount) {
  const finite = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  if (finite.length <= targetCount) {
    return finite;
  }

  const result = [];
  const bucketSize = finite.length / targetCount;

  for (let bucketIndex = 0; bucketIndex < targetCount; bucketIndex += 1) {
    const start = Math.floor(bucketIndex * bucketSize);
    const end = Math.max(start + 1, Math.floor((bucketIndex + 1) * bucketSize));
    const bucket = finite.slice(start, end);
    const x = bucket.reduce((sum, point) => sum + point.x, 0) / bucket.length;
    const y = bucket.reduce((sum, point) => sum + Math.max(point.y, 0), 0) / bucket.length;
    result.push({ x, y });
  }

  return result;
}

function median(values) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
}

function suppressNarrowSpikes(points, windowSize = 17, factor = 2.4) {
  const radius = Math.floor(windowSize / 2);

  return points.map((point, index) => {
    const start = Math.max(0, index - radius);
    const end = Math.min(points.length, index + radius + 1);
    const localValues = points.slice(start, end).map((candidate) => Math.max(candidate.y, 0));
    const localMedian = median(localValues);
    const isNarrowSpike = localMedian > 0 && point.y > localMedian * factor;

    return {
      x: point.x,
      y: isNarrowSpike ? localMedian : point.y,
    };
  });
}

function normalizeSeries(points) {
  const max = Math.max(...points.map((point) => Math.max(point.y, 0)), 0.000001);
  return points.map((point) => ({
    x: round(point.x, 3),
    y: round(clamp(Math.max(point.y, 0) / max, 0, 1), 5),
  }));
}

function makeSpectrum(id, label, x, y, options) {
  return {
    schemaVersion: 1,
    id,
    kind: "spectrum1d",
    label,
    xUnit: "nm",
    yUnit: "normalized a.u.",
    x,
    y,
    displayRange: {
      x: [Math.min(...x), Math.max(...x)],
      y: [0, 1],
    },
    notes: options.notes,
  };
}

function parseRhodamine(text) {
  const rows = parseCsv(text).slice(1);
  const points = rows
    .map(([wavelength, intensity]) => ({
      x: toFiniteNumber(wavelength),
      y: toFiniteNumber(intensity),
    }))
    .filter((point) => point.x !== null && point.y !== null);
  const despiked = suppressNarrowSpikes(points, 31, 1.8);
  const downsampled = downsampleSeries(despiked, 320);
  const displaySmoothed = suppressNarrowSpikes(downsampled, 25, 1.8);
  const normalized = normalizeSeries(displaySmoothed);

  return makeSpectrum(
    "r6g-emission-ethylene-glycol",
    "Rhodamine 6G emission in ethylene glycol",
    normalized.map((point) => point.x),
    normalized.map((point) => point.y),
    { notes: SOURCE_NOTES.r6g }
  );
}

function parseEgfp(text) {
  const rows = parseCsv(text);
  const header = rows[0];
  const emissionColumn = header.findIndex((name) => name === "Emission EGFP");
  const wavelengthColumn = emissionColumn - 1;

  if (emissionColumn < 0 || wavelengthColumn < 0) {
    throw new Error("Could not find EGFP emission columns in fluorescent-protein CSV.");
  }

  const points = rows
    .slice(1)
    .map((row) => ({
      x: toFiniteNumber(row[wavelengthColumn]),
      y: toFiniteNumber(row[emissionColumn]),
    }))
    .filter((point) => point.x !== null && point.y !== null);
  const normalized = normalizeSeries(downsampleSeries(points, 260));

  return makeSpectrum(
    "egfp-emission",
    "EGFP emission spectrum",
    normalized.map((point) => point.x),
    normalized.map((point) => point.y),
    { notes: SOURCE_NOTES.egfp }
  );
}

function parseNumericLines(text) {
  return text
    .trim()
    .split(/\r\n|\n|\r/)
    .filter(Boolean)
    .map((line) => toFiniteNumber(line))
    .filter((value) => value !== null);
}

function parseMatrix(text) {
  return text
    .trim()
    .split(/\r\n|\n|\r/)
    .filter(Boolean)
    .map((line) =>
      line
        .trim()
        .split(/\s+/)
        .map((value) => {
          const parsed = toFiniteNumber(value);
          return parsed === null ? 0 : parsed;
        })
    );
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function downsampleEem(matrix, excitation, emission, targetCols, targetRows) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;
  const rowStep = rows / targetRows;
  const colStep = cols / targetCols;
  const sampledEmission = [];
  const sampledExcitation = [];
  const sampledZ = [];

  for (let colIndex = 0; colIndex < targetCols; colIndex += 1) {
    const colStart = Math.floor(colIndex * colStep);
    const colEnd = Math.max(colStart + 1, Math.floor((colIndex + 1) * colStep));
    sampledExcitation.push(round(average(excitation.slice(colStart, colEnd)), 2));
  }

  for (let rowIndex = 0; rowIndex < targetRows; rowIndex += 1) {
    const rowStart = Math.floor(rowIndex * rowStep);
    const rowEnd = Math.max(rowStart + 1, Math.floor((rowIndex + 1) * rowStep));
    sampledEmission.push(round(average(emission.slice(rowStart, rowEnd)), 2));

    const outRow = [];
    for (let colIndex = 0; colIndex < targetCols; colIndex += 1) {
      const colStart = Math.floor(colIndex * colStep);
      const colEnd = Math.max(colStart + 1, Math.floor((colIndex + 1) * colStep));
      const bucket = [];

      for (let sourceRow = rowStart; sourceRow < rowEnd; sourceRow += 1) {
        for (let sourceCol = colStart; sourceCol < colEnd; sourceCol += 1) {
          bucket.push(Math.max(matrix[sourceRow]?.[sourceCol] || 0, 0));
        }
      }

      outRow.push(average(bucket));
    }

    sampledZ.push(outRow);
  }

  const max = Math.max(...sampledZ.flat(), 0.000001);
  const normalizedZ = sampledZ.map((row) =>
    row.map((value) => round(clamp(value / max, 0, 1), 5))
  );

  return {
    schemaVersion: 1,
    id: "fe-dom-sample01-eem",
    kind: "eem",
    label: "Fe(II)-DOM sample 01 EEM",
    excitationUnit: "nm",
    emissionUnit: "nm",
    zUnit: "normalized a.u.",
    sourceValueUnit: "Raman Units (RU)",
    excitation: sampledExcitation,
    emission: sampledEmission,
    z: normalizedZ,
    displayRange: {
      excitation: [sampledExcitation[0], sampledExcitation.at(-1)],
      emission: [sampledEmission[0], sampledEmission.at(-1)],
      z: [0, 1],
    },
    notes: SOURCE_NOTES.dom,
  };
}

function inferDomExcitationAxis(columnCount) {
  return Array.from({ length: columnCount }, (_, index) => 239 + index * 3);
}

async function buildArtifacts() {
  const [r6gText, egfpText, domEmissionText, domEemText] = await Promise.all([
    fetchText("Rhodamine 6G fluorescence CSV", FILES.r6g),
    fetchText("Fluorescent protein spectra CSV", FILES.egfp),
    fetchText("Fe-DOM emission axis", FILES.domEmission),
    fetchText("Fe-DOM sample01 EEM matrix", FILES.domEem),
  ]);

  const r6g = parseRhodamine(r6gText);
  const egfp = parseEgfp(egfpText);
  const domEmission = parseNumericLines(domEmissionText);
  const domMatrix = parseMatrix(domEemText);
  const domExcitation = inferDomExcitationAxis(domMatrix[0].length);
  const domEem = downsampleEem(domMatrix, domExcitation, domEmission, 64, 48);

  const manifest = {
    schemaVersion: 1,
    generatedAt: GENERATED_AT,
    disclaimer:
      "Displayed source-derived data are normalized/downsampled for educational visualization. They are not measurements from this website, not calibrated by this site, and not quantitative performance claims.",
    packageNotes: [
      "The synthetic Instrument Lab controls remain the default teaching model.",
      "Source-derived examples are shown separately so sliders are not mistaken for controls over real data.",
      "Runtime fetches are local-only under /instrument/data/.",
    ],
    datasets: [
      {
        id: r6g.id,
        kind: "spectrum1d",
        role: "dye-spectrum",
        label: r6g.label,
        dataUrl: "processed/r6g-emission-ethylene-glycol.json",
        source: {
          title: "Absorption and Fluorescence spectra of Rhodamine 6G",
          creators: ["Nyman, Robert Andrew"],
          doi: "10.5281/zenodo.569817",
          url: "https://zenodo.org/records/569817",
          license: "CC BY 4.0",
          licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
          sourceFile: "fluorescence_spectrum_R6G_in_EthyleneGlycol.csv",
          citation:
            "Nyman, R. A. (2017). Absorption and Fluorescence spectra of Rhodamine 6G. Zenodo. https://doi.org/10.5281/zenodo.569817",
        },
        measurement: {
          mode: "emission spectrum",
          sample: "Rhodamine 6G in ethylene glycol",
          xUnit: "nm",
          yUnit: "normalized a.u.",
        },
        processing: {
          normalization:
            "narrow room-light spikes suppressed, negative values clamped to zero, max intensity normalized to 1",
          downsampling: "bucket average to 320 points",
          sourceChecksumSha256: sha256(r6gText),
          notes: SOURCE_NOTES.r6g,
        },
      },
      {
        id: egfp.id,
        kind: "spectrum1d",
        role: "fluorescent-protein-spectrum",
        label: egfp.label,
        dataUrl: "processed/egfp-emission.json",
        source: {
          title: "Absorption and Emission spectra of fluorescent proteins",
          creators: ["Mastop, M.", "Bindels, D.S.", "Gadella Jr., T.W.J.", "Goedhart, J."],
          doi: "10.5281/zenodo.580169",
          url: "https://zenodo.org/records/580169",
          license: "CC BY 4.0",
          licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
          sourceFile: "Goedhart_Mastop_Abs-Em_Spectra-FPs.csv",
          citation:
            "Mastop, M., Bindels, D.S., Gadella Jr., T.W.J., & Goedhart, J. (2017). Absorption and Emission spectra of fluorescent proteins. Zenodo. https://doi.org/10.5281/zenodo.580169",
        },
        measurement: {
          mode: "emission spectrum",
          sample: "EGFP purified fluorescent protein table entry",
          xUnit: "nm",
          yUnit: "normalized a.u.",
        },
        processing: {
          normalization: "negative values clamped to zero; max intensity normalized to 1",
          downsampling: "bucket average to 260 points",
          sourceChecksumSha256: sha256(egfpText),
          notes: SOURCE_NOTES.egfp,
        },
      },
      {
        id: domEem.id,
        kind: "eem",
        role: "source-derived-eem",
        label: domEem.label,
        dataUrl: "processed/fe-dom-sample01-eem.json",
        source: {
          title:
            'Dataset for "Technical note: Effects of iron(II) on fluorescence properties of dissolved organic matter at circumneutral pH"',
          creators: ["Jia, Kun", "Manning, Cara C.", "Jollymore, Ashlee", "Beckie, Roger D."],
          doi: "10.5281/zenodo.3737108",
          url: "https://zenodo.org/records/3737108",
          license: "CC BY 4.0",
          licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
          sourceFile: "sample01EEM.txt + emission_lambda.txt",
          citation:
            "Jia, K., Manning, C. C., Jollymore, A., & Beckie, R. D. (2020). Dataset for Technical note: Effects of iron(II) on fluorescence properties of dissolved organic matter at circumneutral pH. Zenodo. https://doi.org/10.5281/zenodo.3737108",
        },
        measurement: {
          mode: "excitation-emission matrix",
          sample: "Sample 01 from Fe(II)-DOM dataset",
          xUnit: "excitation nm",
          yUnit: "emission nm",
          zUnit: "normalized a.u.",
          sourceValueUnit: "Raman Units (RU)",
        },
        processing: {
          normalization: "negative matrix values clamped to zero; max intensity normalized to 1",
          downsampling: "2D bucket average to 64 excitation bins x 48 emission bins",
          axisHandling:
            "emission axis read from emission_lambda.txt; excitation axis inferred as 239-800 nm in 3 nm increments because the source description names excitation_lambda.txt but the Zenodo record does not include that file",
          sourceChecksumSha256: sha256(domEemText),
          notes: SOURCE_NOTES.dom,
        },
      },
      {
        id: "nist-srm-fluorescence-correction-reference",
        kind: "reference",
        role: "calibration-reference",
        label: "NIST fluorescence correction SRM reference",
        dataUrl: null,
        source: {
          title: "NIST relative intensity correction standards for fluorescence spectroscopy",
          creators: ["National Institute of Standards and Technology"],
          doi: null,
          url: "https://www.nist.gov/programs-projects/relative-intensity-correction-standards-fluorescence-and-raman-spectroscopy",
          license: "Not embedded in this package",
          licenseUrl: null,
          sourceFile: null,
          citation:
            "NIST relative intensity correction standards are tracked as a reference-only candidate. No NIST data are embedded or plotted in this package.",
        },
        processing: {
          normalization: null,
          downsampling: null,
          notes:
            "Reference-only until an exact public NIST data file and reuse boundary are verified. Do not use this entry to claim calibration.",
        },
      },
    ],
  };

  return {
    manifest,
    processed: [
      ["r6g-emission-ethylene-glycol.json", r6g],
      ["egfp-emission.json", egfp],
      ["fe-dom-sample01-eem.json", domEem],
    ],
  };
}

async function writeArtifacts(artifacts) {
  await fs.mkdir(PROCESSED_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, "manifest.json"),
    `${JSON.stringify(artifacts.manifest, null, 2)}\n`,
    "utf8"
  );

  await Promise.all(
    artifacts.processed.map(([filename, data]) =>
      fs.writeFile(path.join(PROCESSED_DIR, filename), `${JSON.stringify(data, null, 2)}\n`, "utf8")
    )
  );
}

async function validateOutput() {
  const manifestPath = path.join(DATA_DIR, "manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  let packageBytes = (await fs.stat(manifestPath)).size;

  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.datasets)) {
    throw new Error("Manifest schema is invalid.");
  }

  for (const dataset of manifest.datasets) {
    if (!dataset.id || !dataset.kind || !dataset.source || !dataset.source.url || !dataset.source.license) {
      throw new Error(`Manifest dataset is missing provenance fields: ${dataset.id || "(unknown)"}`);
    }

    if (dataset.kind === "reference") {
      continue;
    }

    const dataPath = path.join(DATA_DIR, dataset.dataUrl);
    const data = JSON.parse(await fs.readFile(dataPath, "utf8"));
    packageBytes += (await fs.stat(dataPath)).size;

    if (dataset.kind === "spectrum1d") {
      if (!Array.isArray(data.x) || !Array.isArray(data.y) || data.x.length !== data.y.length) {
        throw new Error(`Invalid 1D spectrum arrays for ${dataset.id}`);
      }

      for (const value of [...data.x, ...data.y]) {
        if (!Number.isFinite(value)) {
          throw new Error(`Non-finite 1D value in ${dataset.id}`);
        }
      }
    }

    if (dataset.kind === "eem") {
      if (!Array.isArray(data.excitation) || !Array.isArray(data.emission) || !Array.isArray(data.z)) {
        throw new Error(`Invalid EEM arrays for ${dataset.id}`);
      }

      if (data.z.length !== data.emission.length) {
        throw new Error(`EEM row count does not match emission axis for ${dataset.id}`);
      }

      data.z.forEach((row) => {
        if (!Array.isArray(row) || row.length !== data.excitation.length) {
          throw new Error(`EEM column count does not match excitation axis for ${dataset.id}`);
        }

        row.forEach((value) => {
          if (!Number.isFinite(value)) {
            throw new Error(`Non-finite EEM value in ${dataset.id}`);
          }
        });
      });
    }
  }

  if (packageBytes > PACKAGE_SIZE_LIMIT_BYTES) {
    throw new Error(`Processed package is too large: ${packageBytes} bytes.`);
  }

  console.log(`Instrument data package validated (${packageBytes} bytes).`);
}

async function main() {
  const args = new Set(process.argv.slice(2));

  if (args.has("--validate")) {
    await validateOutput();
    return;
  }

  const artifacts = await buildArtifacts();

  if (args.has("--dry-run")) {
    console.log(
      `Prepared ${artifacts.processed.length} processed datasets and ${artifacts.manifest.datasets.length} manifest entries.`
    );
    return;
  }

  await writeArtifacts(artifacts);
  await validateOutput();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
