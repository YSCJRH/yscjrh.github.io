const sourceChart = {
  left: 54,
  top: 34,
  right: 588,
  bottom: 258,
};

const sliceChart = {
  left: 54,
  top: 26,
  right: 588,
  bottom: 142,
};

const sourceState = {
  manifest: null,
  datasets: [],
  cache: new Map(),
  activeDataset: null,
  activeData: null,
  requestId: 0,
  slice: {
    axis: "emission",
    index: 0,
  },
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

function xToChart(value, min, max, chart) {
  const progress = (value - min) / Math.max(max - min, 1);
  return chart.left + clamp(progress, 0, 1) * (chart.right - chart.left);
}

function yToChart(value, min, max, chart) {
  const progress = (value - min) / Math.max(max - min, 1);
  return chart.bottom - clamp(progress, 0, 1) * (chart.bottom - chart.top);
}

export function findClosestIndex(values, target) {
  if (!Array.isArray(values) || !values.length || !Number.isFinite(target)) {
    return 0;
  }

  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  values.forEach((value, index) => {
    const distance = Math.abs(value - target);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export function findEemPeak(data) {
  const rows = data?.z || [];
  let peak = {
    row: 0,
    col: 0,
    value: -Infinity,
  };

  rows.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (Number.isFinite(value) && value > peak.value) {
        peak = { row: rowIndex, col: colIndex, value };
      }
    });
  });

  return peak.value === -Infinity ? { row: 0, col: 0, value: 0 } : peak;
}

export function getEemSlice(data, axis, index) {
  const excitation = data?.excitation || [];
  const emission = data?.emission || [];
  const rows = data?.z || [];

  if (axis === "excitation") {
    const rowIndex = clamp(Math.round(index), 0, Math.max(emission.length - 1, 0));
    return {
      axis: "excitation",
      fixedNm: emission[rowIndex],
      fixedLabel: `Fixed Em ${formatNumber(emission[rowIndex], 1)} nm / 固定发射 ${formatNumber(emission[rowIndex], 1)} nm`,
      kindLabel: "Excitation slice / 激发切片",
      modeLabel: "Excitation wavelength / 激发波长",
      x: excitation,
      y: rows[rowIndex] || [],
    };
  }

  const colIndex = clamp(Math.round(index), 0, Math.max(excitation.length - 1, 0));
  return {
    axis: "emission",
    fixedNm: excitation[colIndex],
    fixedLabel: `Fixed Ex ${formatNumber(excitation[colIndex], 1)} nm / 固定激发 ${formatNumber(excitation[colIndex], 1)} nm`,
    kindLabel: "Emission slice / 发射切片",
    modeLabel: "Emission wavelength / 发射波长",
    x: emission,
    y: rows.map((row) => row[colIndex] || 0),
  };
}

function setSourceLink(elements, dataset) {
  let link = elements.sourceLink;

  if (!link || !dataset?.source) {
    return;
  }

  if (link.tagName.toLowerCase() !== "a") {
    const anchor = document.createElement("a");
    anchor.dataset.sourceLink = "";
    link.replaceWith(anchor);
    elements.sourceLink = anchor;
    link = anchor;
  }

  link.href = dataset.source.doi ? `https://doi.org/${dataset.source.doi}` : dataset.source.url;
  link.textContent = dataset.source.doi || "Source link / 来源链接";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}

function datasetKindLabel(dataset) {
  if (dataset.kind === "eem") {
    return "Processed EEM display / 处理后的 EEM 显示";
  }

  if (String(dataset.role || "").includes("protein")) {
    return "Protein emission / 蛋白发射谱";
  }

  if (String(dataset.role || "").includes("dye")) {
    return "Dye spectrum / 染料谱图";
  }

  return dataset.kind ? `${dataset.kind} / 数据类型` : "Spectrum / 谱图";
}

function updateDatasetCards(elements, datasetId) {
  const cards = elements.sourceCards ? Array.from(elements.sourceCards.querySelectorAll("[data-source-card]")) : [];
  cards.forEach((card) => {
    const active = card.dataset.sourceCard === datasetId;
    card.classList.toggle("is-active", active);
    card.setAttribute("aria-pressed", String(active));
  });
}

function createDatasetCard(dataset, onSelect) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "source-dataset-card";
  button.dataset.sourceCard = dataset.id;
  button.dataset.sourceCardKind = dataset.kind;
  button.setAttribute("aria-pressed", "false");

  const tag = document.createElement("span");
  tag.className = "source-dataset-card__tag";
  tag.textContent = datasetKindLabel(dataset);

  const label = document.createElement("strong");
  label.textContent = dataset.label;

  const note = document.createElement("span");
  note.className = "source-dataset-card__note";
  note.textContent = dataset.kind === "eem"
    ? "Processed educational EEM heatmap with slice view; separate from simulator sliders. / 处理后的教学 EEM 热图，带切片查看；和模拟器滑块分离。"
    : "Normalized 1D example; display only. / 归一化一维示例，仅用于显示。";

  button.append(tag, label, note);
  button.addEventListener("click", () => onSelect(dataset.id));
  return button;
}

function hideSourceHeatmap(elements) {
  if (elements.sourceHeatmap) {
    elements.sourceHeatmap.textContent = "";
    elements.sourceHeatmap.setAttribute("hidden", "");
  }

  if (elements.sourceSliceMarker) {
    elements.sourceSliceMarker.textContent = "";
  }
}

function hideSourceSlice(elements) {
  elements.sourceSlicePanel?.setAttribute("hidden", "");
  elements.sourceSliceChartWrap?.setAttribute("hidden", "");
  if (elements.sourceSliceLine) {
    elements.sourceSliceLine.setAttribute("points", "");
  }
  if (elements.sourceSliceMarker) {
    elements.sourceSliceMarker.textContent = "";
  }
}

function renderSourceLine(elements, dataset, data) {
  if (!elements.sourceLine) {
    return;
  }

  hideSourceHeatmap(elements);
  hideSourceSlice(elements);
  elements.sourceLine.removeAttribute("hidden");

  const xValues = data.x || [];
  const yValues = data.y || [];
  const xMin = data.displayRange?.x?.[0] ?? Math.min(...xValues);
  const xMax = data.displayRange?.x?.[1] ?? Math.max(...xValues);
  const points = xValues
    .map((x, index) => {
      const y = yValues[index];
      const chartX = xToChart(x, xMin, xMax, sourceChart);
      const chartY = yToChart(clamp(y, 0, 1), 0, 1, sourceChart);
      return `${chartX.toFixed(1)},${chartY.toFixed(1)}`;
    })
    .join(" ");

  elements.sourceLine.setAttribute("points", points);
  setElementText(elements.sourceXStart, `${formatNumber(xMin)} nm`);
  setElementText(elements.sourceXEnd, `${formatNumber(xMax)} nm`);
  setElementText(elements.sourceYStart, "0");
  setElementText(elements.sourceYEnd, "1");
  setElementText(elements.sourceYLabel, "a.u.");
  setElementText(elements.sourceModeLabel, "Emission wavelength / 发射波长");
  setElementText(elements.sourceKind, datasetKindLabel(dataset));
}

function renderSourceEemHeatmap(elements, dataset, data) {
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
  setElementText(elements.sourceModeLabel, "Excitation wavelength / EEM heatmap / 激发波长 / EEM 热图");
  setElementText(elements.sourceKind, datasetKindLabel(dataset));
}

function syncSliceControlRange(elements, data) {
  const axis = sourceState.slice.axis;
  const values = axis === "excitation" ? data.emission || [] : data.excitation || [];
  const max = Math.max(values.length - 1, 0);
  sourceState.slice.index = clamp(sourceState.slice.index, 0, max);

  if (elements.sourceSliceIndex) {
    elements.sourceSliceIndex.min = "0";
    elements.sourceSliceIndex.max = String(max);
    elements.sourceSliceIndex.step = "1";
    elements.sourceSliceIndex.value = String(sourceState.slice.index);
  }

  if (elements.sourceSliceAxis) {
    elements.sourceSliceAxis.value = axis;
  }

  const slice = getEemSlice(data, axis, sourceState.slice.index);
  setElementText(elements.sourceSliceReadout, slice.fixedLabel);
  elements.sourceSliceIndex?.setAttribute("aria-valuetext", slice.fixedLabel);
}

function configureSliceControls(elements, dataset, data) {
  if (!elements.sourceSlicePanel || !elements.sourceSliceAxis || !elements.sourceSliceIndex) {
    return;
  }

  if (dataset.kind !== "eem") {
    hideSourceSlice(elements);
    return;
  }

  const peak = findEemPeak(data);
  const defaults = dataset.defaultSlices || {};
  sourceState.slice.axis = defaults.sliceAxis === "excitation" ? "excitation" : "emission";
  sourceState.slice.index = sourceState.slice.axis === "excitation"
    ? findClosestIndex(data.emission || [], defaults.emissionNm ?? data.emission?.[peak.row])
    : findClosestIndex(data.excitation || [], defaults.excitationNm ?? data.excitation?.[peak.col]);

  elements.sourceSlicePanel.removeAttribute("hidden");
  elements.sourceSliceChartWrap?.removeAttribute("hidden");
  syncSliceControlRange(elements, data);
}

function renderSliceMarker(elements, data) {
  const marker = elements.sourceSliceMarker;
  if (!marker) {
    return;
  }

  marker.textContent = "";
  const namespace = "http://www.w3.org/2000/svg";
  const excitation = data.excitation || [];
  const emission = data.emission || [];

  if (sourceState.slice.axis === "excitation") {
    const emissionValue = emission[sourceState.slice.index];
    const y = yToChart(emissionValue, emission[0], emission.at(-1), sourceChart);
    const line = document.createElementNS(namespace, "line");
    line.setAttribute("x1", String(sourceChart.left));
    line.setAttribute("x2", String(sourceChart.right));
    line.setAttribute("y1", y.toFixed(1));
    line.setAttribute("y2", y.toFixed(1));
    marker.appendChild(line);
    return;
  }

  const excitationValue = excitation[sourceState.slice.index];
  const x = xToChart(excitationValue, excitation[0], excitation.at(-1), sourceChart);
  const line = document.createElementNS(namespace, "line");
  line.setAttribute("x1", x.toFixed(1));
  line.setAttribute("x2", x.toFixed(1));
  line.setAttribute("y1", String(sourceChart.top));
  line.setAttribute("y2", String(sourceChart.bottom));
  marker.appendChild(line);
}

function renderSliceChart(elements, data) {
  if (!elements.sourceSliceLine || !elements.sourceSliceChartWrap) {
    return;
  }

  const slice = getEemSlice(data, sourceState.slice.axis, sourceState.slice.index);
  const xValues = slice.x || [];
  const yValues = slice.y || [];
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const points = xValues
    .map((x, index) => {
      const chartX = xToChart(x, xMin, xMax, sliceChart);
      const chartY = yToChart(clamp(yValues[index] || 0, 0, 1), 0, 1, sliceChart);
      return `${chartX.toFixed(1)},${chartY.toFixed(1)}`;
    })
    .join(" ");

  elements.sourceSliceChartWrap.removeAttribute("hidden");
  elements.sourceSliceLine.setAttribute("points", points);
  setElementText(elements.sourceSliceKind, slice.kindLabel);
  setElementText(elements.sourceSliceFixed, slice.fixedLabel);
  setElementText(elements.sourceSliceReadout, slice.fixedLabel);
  setElementText(elements.sourceSliceXStart, `${formatNumber(xMin)} nm`);
  setElementText(elements.sourceSliceXEnd, `${formatNumber(xMax)} nm`);
  setElementText(elements.sourceSliceModeLabel, slice.modeLabel);
  setElementText(elements.sourceSliceChartTitle, slice.kindLabel);
  setElementText(
    elements.sourceSliceChartDesc,
    `${slice.kindLabel}; ${slice.fixedLabel}. Processed EEM cross-section for display only. / ${slice.kindLabel}；${slice.fixedLabel}。处理后 EEM 切片，仅用于显示。`
  );
}

function refreshSliceView(elements) {
  const data = sourceState.activeData;
  const dataset = sourceState.activeDataset;
  if (!data || dataset?.kind !== "eem") {
    return;
  }

  syncSliceControlRange(elements, data);
  renderSliceMarker(elements, data);
  renderSliceChart(elements, data);
}

function updateSourceMetadata(elements, dataset, data) {
  const source = dataset.source || {};
  const processing = dataset.processing || {};
  const boundary = dataset.claimBoundary || "Display-only educational example. / 仅作教学显示。";
  setElementText(elements.sourceName, source.title || dataset.label);
  setElementText(elements.sourceLicense, source.license || "Recorded in manifest / 已记录在 manifest 中");
  setElementText(
    elements.sourceProcessing,
    processing.notes || data.notes || "Normalized/downsampled for display. / 已归一化并降采样用于显示。"
  );
  setElementText(elements.sourceFile, source.sourceFile || "Reference-only or recorded in manifest / 仅作参考或已记录在 manifest 中");
  setElementText(elements.sourceBoundary, boundary);
  setSourceLink(elements, dataset);
  setElementText(
    elements.sourceCaption,
    source.citation
      ? `${source.citation} ${boundary}`
      : `Source-derived educational example. / 引用来源教学示例。 ${boundary}`
  );
  setElementText(elements.sourceChartTitle, dataset.label);
  setElementText(
    elements.sourceChartDesc,
    `${dataset.label}. ${processing.notes || data.notes || "Normalized and downsampled for educational visualization. / 已为教学可视化归一化并降采样。"}`
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
  const requestId = sourceState.requestId + 1;
  sourceState.requestId = requestId;
  const dataset = sourceState.datasets.find((entry) => entry.id === datasetId) || sourceState.datasets[0];

  if (!dataset) {
    setElementText(elements.sourceStatus, "No plotted source-derived datasets are available. / 暂无可绘制的引用数据集。");
    return;
  }

  try {
    setElementText(elements.sourceStatus, `Loading ${dataset.label}... / 正在加载 ${dataset.label}...`);

    if (!sourceState.cache.has(dataset.id)) {
      sourceState.cache.set(dataset.id, await fetchJson(`data/${dataset.dataUrl}`));
    }

    if (requestId !== sourceState.requestId) {
      return;
    }

    const data = sourceState.cache.get(dataset.id);
    sourceState.activeDataset = dataset;
    sourceState.activeData = data;
    updateSourceMetadata(elements, dataset, data);

    if (dataset.kind === "eem") {
      configureSliceControls(elements, dataset, data);
      renderSourceEemHeatmap(elements, dataset, data);
      refreshSliceView(elements);
    } else {
      renderSourceLine(elements, dataset, data);
    }

    updateDatasetCards(elements, dataset.id);
    setElementText(elements.sourceStatus, "Loaded local source-derived example. / 已加载本地引用数据示例。");
  } catch (error) {
    if (requestId !== sourceState.requestId) {
      return;
    }

    console.error(error);
    setElementText(
      elements.sourceStatus,
      "Source-derived data could not be loaded. The synthetic model above still works. / 引用数据无法加载；上方合成模型仍可使用。"
    );
  }
}

export async function initializeSourceData(root) {
  const sourcePanel = root.querySelector("[data-source-data-panel]");
  const sourceSelect = root.querySelector("[data-source-dataset]");
  const elements = {
    sourceCards: root.querySelector("[data-source-cards]"),
    sourceName: root.querySelector("[data-source-name]"),
    sourceLink: root.querySelector("[data-source-link]"),
    sourceLicense: root.querySelector("[data-source-license]"),
    sourceProcessing: root.querySelector("[data-source-processing]"),
    sourceFile: root.querySelector("[data-source-file]"),
    sourceBoundary: root.querySelector("[data-source-boundary]"),
    sourceStatus: root.querySelector("[data-source-status]"),
    sourceKind: root.querySelector("[data-source-kind]"),
    sourceLine: root.querySelector("[data-source-line]"),
    sourceHeatmap: root.querySelector("[data-source-heatmap]"),
    sourceSliceMarker: root.querySelector("[data-source-slice-marker]"),
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
    sourceSlicePanel: root.querySelector("[data-source-slice-panel]"),
    sourceSliceAxis: root.querySelector("[data-source-slice-axis]"),
    sourceSliceIndex: root.querySelector("[data-source-slice-index]"),
    sourceSliceReadout: root.querySelector("[data-source-slice-readout]"),
    sourceSliceChartWrap: root.querySelector("[data-source-slice-chart-wrap]"),
    sourceSliceLine: root.querySelector("[data-source-slice-line]"),
    sourceSliceKind: root.querySelector("[data-source-slice-kind]"),
    sourceSliceFixed: root.querySelector("[data-source-slice-fixed]"),
    sourceSliceXStart: root.querySelector("[data-source-slice-x-start]"),
    sourceSliceXEnd: root.querySelector("[data-source-slice-x-end]"),
    sourceSliceModeLabel: root.querySelector("[data-source-slice-mode-label]"),
    sourceSliceChartTitle: root.querySelector("[data-source-slice-chart-title]"),
    sourceSliceChartDesc: root.querySelector("[data-source-slice-chart-desc]"),
  };

  if (!sourcePanel || !sourceSelect || !("fetch" in window)) {
    return;
  }

  try {
    sourceState.manifest = await fetchJson("data/manifest.json");
    sourceState.datasets = sourceState.manifest.datasets.filter((dataset) => dataset.dataUrl);
    sourceSelect.textContent = "";
    if (elements.sourceCards) {
      elements.sourceCards.textContent = "";
    }

    sourceState.datasets.forEach((dataset) => {
      const option = document.createElement("option");
      option.value = dataset.id;
      option.textContent = dataset.label;
      sourceSelect.appendChild(option);
      elements.sourceCards?.appendChild(createDatasetCard(dataset, (datasetId) => {
        sourceSelect.value = datasetId;
        showSourceDataset(elements, datasetId);
      }));
    });

    const reference = sourceState.manifest.datasets.find((dataset) => dataset.kind === "reference");
    setElementText(elements.sourceDisclaimer, sourceState.manifest.disclaimer);

    if (reference) {
      setElementText(
        elements.sourceReferenceNote,
        `Reference-only / 仅作参考：${reference.label}. ${reference.processing?.notes || "No reference curve is embedded. / 未嵌入参考曲线。"}`
      );
    }

    sourceSelect.addEventListener("change", () => showSourceDataset(elements, sourceSelect.value));

    elements.sourceSliceAxis?.addEventListener("change", () => {
      if (!sourceState.activeData) {
        return;
      }

      const peak = findEemPeak(sourceState.activeData);
      sourceState.slice.axis = elements.sourceSliceAxis.value === "excitation" ? "excitation" : "emission";
      sourceState.slice.index = sourceState.slice.axis === "excitation" ? peak.row : peak.col;
      refreshSliceView(elements);
    });

    elements.sourceSliceIndex?.addEventListener("input", () => {
      sourceState.slice.index = Number(elements.sourceSliceIndex.value);
      refreshSliceView(elements);
    });

    await showSourceDataset(elements, sourceState.datasets[0]?.id);
  } catch (error) {
    console.error(error);
    sourceSelect.disabled = true;
    setElementText(
      elements.sourceStatus,
      "Source-derived manifest unavailable. Synthetic controls remain available. / 引用数据 manifest 不可用；合成控制项仍可使用。"
    );
  }
}
