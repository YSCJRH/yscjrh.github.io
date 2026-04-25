const sourceChart = {
  left: 54,
  top: 34,
  right: 588,
  bottom: 258,
};

const sourceState = {
  manifest: null,
  datasets: [],
  cache: new Map(),
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setElementText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function formatNumber(value, digits = 0) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return Number(value.toFixed(digits)).toString();
}

function colorChannel(start, end, amount) {
  return Math.round(start + (end - start) * amount);
}

function heatmapColor(value) {
  const t = clamp(value, 0, 1);
  const stops = [
    [8, 12, 24],
    [39, 85, 145],
    [77, 237, 207],
    [154, 242, 111],
  ];
  const scaled = t * (stops.length - 1);
  const index = Math.min(Math.floor(scaled), stops.length - 2);
  const local = scaled - index;
  const start = stops[index];
  const end = stops[index + 1];
  return `rgb(${colorChannel(start[0], end[0], local)}, ${colorChannel(start[1], end[1], local)}, ${colorChannel(start[2], end[2], local)})`;
}

function setSourceLink(elements, dataset) {
  const link = elements.sourceLink;

  if (!link || !dataset?.source) {
    return;
  }

  link.href = dataset.source.doi ? `https://doi.org/${dataset.source.doi}` : dataset.source.url;
  link.textContent = dataset.source.doi || "Source link";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}

function hideSourceHeatmap(elements) {
  if (elements.sourceHeatmap) {
    elements.sourceHeatmap.textContent = "";
    elements.sourceHeatmap.setAttribute("hidden", "");
  }
}

function renderSourceLine(elements, dataset, data) {
  if (!elements.sourceLine) {
    return;
  }

  hideSourceHeatmap(elements);
  elements.sourceLine.removeAttribute("hidden");

  const xValues = data.x || [];
  const yValues = data.y || [];
  const xMin = data.displayRange?.x?.[0] ?? Math.min(...xValues);
  const xMax = data.displayRange?.x?.[1] ?? Math.max(...xValues);
  const width = sourceChart.right - sourceChart.left;
  const height = sourceChart.bottom - sourceChart.top;
  const points = xValues
    .map((x, index) => {
      const y = yValues[index];
      const xProgress = (x - xMin) / Math.max(xMax - xMin, 1);
      const chartX = sourceChart.left + xProgress * width;
      const chartY = sourceChart.bottom - clamp(y, 0, 1) * height;
      return `${chartX.toFixed(1)},${chartY.toFixed(1)}`;
    })
    .join(" ");

  elements.sourceLine.setAttribute("points", points);
  setElementText(elements.sourceXStart, `${formatNumber(xMin)} nm`);
  setElementText(elements.sourceXEnd, `${formatNumber(xMax)} nm`);
  setElementText(elements.sourceYStart, "0");
  setElementText(elements.sourceYEnd, "1");
  setElementText(elements.sourceYLabel, "a.u.");
  setElementText(elements.sourceModeLabel, "Emission wavelength");
  setElementText(elements.sourceKind, dataset.role || "spectrum1d");
}

function renderSourceEem(elements, dataset, data) {
  if (!elements.sourceHeatmap || !elements.sourceLine) {
    return;
  }

  elements.sourceLine.setAttribute("hidden", "");
  elements.sourceLine.setAttribute("points", "");
  elements.sourceHeatmap.removeAttribute("hidden");
  elements.sourceHeatmap.textContent = "";

  const namespace = "http://www.w3.org/2000/svg";
  const rows = data.z || [];
  const emission = data.emission || [];
  const excitation = data.excitation || [];
  const rowCount = rows.length;
  const colCount = excitation.length;
  const cellWidth = (sourceChart.right - sourceChart.left) / Math.max(colCount, 1);
  const cellHeight = (sourceChart.bottom - sourceChart.top) / Math.max(rowCount, 1);

  rows.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const rect = document.createElementNS(namespace, "rect");
      rect.setAttribute("x", String(sourceChart.left + colIndex * cellWidth));
      rect.setAttribute("y", String(sourceChart.bottom - (rowIndex + 1) * cellHeight));
      rect.setAttribute("width", String(cellWidth + 0.2));
      rect.setAttribute("height", String(cellHeight + 0.2));
      rect.setAttribute("fill", heatmapColor(value));
      rect.setAttribute("opacity", String(0.36 + clamp(value, 0, 1) * 0.62));
      elements.sourceHeatmap.appendChild(rect);
    });
  });

  setElementText(elements.sourceXStart, `${formatNumber(excitation[0])} nm`);
  setElementText(elements.sourceXEnd, `${formatNumber(excitation.at(-1))} nm`);
  setElementText(elements.sourceYStart, `${formatNumber(emission[0])} nm`);
  setElementText(elements.sourceYEnd, `${formatNumber(emission.at(-1))} nm`);
  setElementText(elements.sourceYLabel, "Em");
  setElementText(elements.sourceModeLabel, "Excitation wavelength / heatmap");
  setElementText(elements.sourceKind, dataset.role || "EEM heatmap");
}

function updateSourceMetadata(elements, dataset, data) {
  const source = dataset.source || {};
  const processing = dataset.processing || {};
  setElementText(elements.sourceName, source.title || dataset.label);
  setElementText(elements.sourceLicense, source.license || "Recorded in manifest");
  setElementText(elements.sourceProcessing, processing.notes || data.notes || "Normalized/downsampled for display.");
  setSourceLink(elements, dataset);
  setElementText(elements.sourceCaption, source.citation || "Source-derived educational example.");
  setElementText(elements.sourceChartTitle, dataset.label);
  setElementText(
    elements.sourceChartDesc,
    `${dataset.label}. ${processing.notes || data.notes || "Normalized and downsampled for educational visualization."}`
  );
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.json();
}

async function showSourceDataset(elements, datasetId) {
  const dataset = sourceState.datasets.find((entry) => entry.id === datasetId) || sourceState.datasets[0];

  if (!dataset) {
    setElementText(elements.sourceStatus, "No plotted source-derived datasets are available.");
    return;
  }

  try {
    setElementText(elements.sourceStatus, `Loading ${dataset.label}...`);

    if (!sourceState.cache.has(dataset.id)) {
      sourceState.cache.set(dataset.id, await fetchJson(`data/${dataset.dataUrl}`));
    }

    const data = sourceState.cache.get(dataset.id);
    updateSourceMetadata(elements, dataset, data);

    if (dataset.kind === "eem") {
      renderSourceEem(elements, dataset, data);
    } else {
      renderSourceLine(elements, dataset, data);
    }

    setElementText(elements.sourceStatus, "Loaded local source-derived example.");
  } catch (error) {
    console.error(error);
    setElementText(elements.sourceStatus, "Source-derived data could not be loaded. The synthetic model above still works.");
  }
}

export async function initializeSourceData(root) {
  const sourcePanel = root.querySelector("[data-source-data-panel]");
  const sourceSelect = root.querySelector("[data-source-dataset]");
  const elements = {
    sourceName: root.querySelector("[data-source-name]"),
    sourceLink: root.querySelector("[data-source-link]"),
    sourceLicense: root.querySelector("[data-source-license]"),
    sourceProcessing: root.querySelector("[data-source-processing]"),
    sourceStatus: root.querySelector("[data-source-status]"),
    sourceKind: root.querySelector("[data-source-kind]"),
    sourceLine: root.querySelector("[data-source-line]"),
    sourceHeatmap: root.querySelector("[data-source-heatmap]"),
    sourceXStart: root.querySelector("[data-source-x-start]"),
    sourceXEnd: root.querySelector("[data-source-x-end]"),
    sourceYStart: root.querySelector("[data-source-y-start]"),
    sourceYEnd: root.querySelector("[data-source-y-end]"),
    sourceYLabel: root.querySelector("[data-source-y-label]"),
    sourceModeLabel: root.querySelector("[data-source-mode-label]"),
    sourceCaption: root.querySelector("[data-source-caption]"),
    sourceDisclaimer: root.querySelector("[data-source-disclaimer]"),
    sourceReferenceNote: root.querySelector("[data-source-reference-note]"),
    sourceChartTitle: root.querySelector("[data-source-chart-title]"),
    sourceChartDesc: root.querySelector("[data-source-chart-desc]"),
  };

  if (!sourcePanel || !sourceSelect || !("fetch" in window)) {
    return;
  }

  try {
    sourceState.manifest = await fetchJson("data/manifest.json");
    sourceState.datasets = sourceState.manifest.datasets.filter((dataset) => dataset.dataUrl);
    sourceSelect.textContent = "";

    sourceState.datasets.forEach((dataset) => {
      const option = document.createElement("option");
      option.value = dataset.id;
      option.textContent = dataset.label;
      sourceSelect.appendChild(option);
    });

    const reference = sourceState.manifest.datasets.find((dataset) => dataset.kind === "reference");
    setElementText(elements.sourceDisclaimer, sourceState.manifest.disclaimer);

    if (reference) {
      setElementText(
        elements.sourceReferenceNote,
        `Reference-only: ${reference.label}. ${reference.processing?.notes || "No reference curve is embedded."}`
      );
    }

    sourceSelect.addEventListener("change", () => showSourceDataset(elements, sourceSelect.value));
    await showSourceDataset(elements, sourceState.datasets[0]?.id);
  } catch (error) {
    console.error(error);
    sourceSelect.disabled = true;
    setElementText(elements.sourceStatus, "Source-derived manifest unavailable. Synthetic controls remain available.");
  }
}
