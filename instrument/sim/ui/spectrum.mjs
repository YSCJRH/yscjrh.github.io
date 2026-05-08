import { MODES, PARTS } from "../state.mjs?v=wavelength-control-20260429";

const chart = {
  left: 54,
  top: 34,
  right: 588,
  bottom: 248,
};

function setText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function setDisabled(element, disabled) {
  if (!element) {
    return;
  }

  element.disabled = disabled;
}

function pointsToPolyline(series) {
  const width = chart.right - chart.left;
  const height = chart.bottom - chart.top;

  return series.points
    .map((point) => {
      const xProgress = (point.x - series.min) / Math.max(series.max - series.min, 1);
      const x = chart.left + xProgress * width;
      const y = chart.bottom - Math.min(Math.max(point.y, 0), 1) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function collectInstrumentElements(root) {
  const controls = {
    excitationWavelength: root.querySelector('[data-control="excitation-wavelength"]'),
    emissionWavelength: root.querySelector('[data-control="emission-wavelength"]'),
    slit: root.querySelector('[data-control="slit"]'),
    integration: root.querySelector('[data-control="integration"]'),
    sample: root.querySelector('[data-control="sample"]'),
    sourceOffset: root.querySelector('[data-control="source-offset"]'),
    detectorAngle: root.querySelector('[data-control="detector-angle"]'),
  };

  return {
    controls,
    modeButtons: Array.from(root.querySelectorAll("[data-mode]")),
    partButtons: Array.from(root.querySelectorAll("[data-part]")),
    enableSceneButtons: Array.from(root.querySelectorAll('[data-action="enable-3d"]')),
    resetViewButtons: Array.from(root.querySelectorAll('[data-action="reset-view"]')),
    resetGeometryButtons: Array.from(root.querySelectorAll('[data-action="reset-geometry"]')),
    fallbackDiagram: root.querySelector("[data-fallback-diagram]"),
    sceneHost: root.querySelector("[data-scene-host]"),
    webglStatus: root.querySelector("[data-webgl-status]"),
    readouts: {
      excitationAngle: root.querySelector('[data-readout="excitation-angle"]'),
      emissionAngle: root.querySelector('[data-readout="emission-angle"]'),
      excitation: root.querySelector('[data-readout="excitation"]'),
      emission: root.querySelector('[data-readout="emission"]'),
      slit: root.querySelector('[data-readout="slit"]'),
      bandpass: root.querySelector('[data-readout="bandpass"]'),
      integration: root.querySelector('[data-readout="integration"]'),
      sourceOffset: root.querySelector('[data-readout="source-offset"]'),
      detectorAngle: root.querySelector('[data-readout="detector-angle"]'),
      throughput: root.querySelector('[data-readout="throughput"]'),
      overlap: root.querySelector('[data-readout="overlap"]'),
      collection: root.querySelector('[data-readout="collection"]'),
    },
    emissionLabel: root.querySelector("[data-emission-label]"),
    modeSummary: root.querySelector("[data-mode-summary]"),
    partTitle: root.querySelector("[data-part-title]"),
    partCopy: root.querySelector("[data-part-copy]"),
    partHint: root.querySelector("[data-part-hint]"),
    sceneHint: root.querySelector("[data-scene-hint]"),
    trace: root.querySelector("[data-spectrum-trace]"),
    xAxisStart: root.querySelector("[data-x-axis-start]"),
    xAxisEnd: root.querySelector("[data-x-axis-end]"),
    spectrumModeLabel: root.querySelector("[data-spectrum-mode-label]"),
    intensityReadout: root.querySelector("[data-intensity-readout]"),
    scanAxisReadout: root.querySelector("[data-scan-axis-readout]"),
    fixedChannelReadout: root.querySelector("[data-fixed-channel-readout]"),
    chartModeReadout: root.querySelector("[data-chart-mode]"),
    chartAxisReadout: root.querySelector("[data-chart-axis]"),
    chartFixedReadout: root.querySelector("[data-chart-fixed]"),
    sampleNote: root.querySelector("[data-sample-note]"),
    excitationBadge: root.querySelector("[data-badge-excitation]"),
    emissionBadge: root.querySelector("[data-badge-emission]"),
    diagnosticsList: root.querySelector("[data-diagnostics-list]"),
  };
}

export function updateControlsFromState(elements, state, derived) {
  const { controls, readouts } = elements;

  setText(readouts.excitationAngle, `${state.exMono.gratingAngleDeg.toFixed(1)} deg`);
  setText(readouts.emissionAngle, `${state.emMono.gratingAngleDeg.toFixed(1)} deg`);
  setText(readouts.excitation, `${Math.round(derived.excitationNm)} nm`);
  setText(readouts.emission, `${Math.round(derived.emissionNm)} nm`);
  setText(readouts.slit, `${state.slit.widthUm} um`);
  setText(readouts.bandpass, `${derived.bandpassNm.toFixed(1)} nm bandpass / 带宽`);
  setText(readouts.integration, `${state.integrationTimeMs} ms`);
  setText(readouts.sourceOffset, `${state.source.offsetUm} um`);
  setText(readouts.detectorAngle, `${state.detector.angleDeg.toFixed(1)} deg`);
  setText(readouts.throughput, `${Math.round(derived.throughput * 100)}%`);
  setText(readouts.overlap, `${Math.round(derived.alignment.overlapFactor * 100)}%`);
  setText(readouts.collection, `${Math.round(derived.collection.collectionFactor * 100)}%`);
  setText(elements.sampleNote, derived.spectrum.profile.description);

  setDisabled(controls.emissionWavelength, false);
  setText(elements.emissionLabel, derived.scanMeta.emissionControlLabel);
}

export function updateModeChrome(elements, state, derived) {
  elements.modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === state.mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  setText(elements.modeSummary, MODES[state.mode]?.summary || MODES.emission.summary);
  setText(elements.spectrumModeLabel, derived.scanMeta.axisLabel);
  setText(elements.xAxisStart, derived.scanMeta.startLabel);
  setText(elements.xAxisEnd, derived.scanMeta.endLabel);
  setText(elements.excitationBadge, derived.scanMeta.excitationBadge);
  setText(elements.emissionBadge, derived.scanMeta.emissionBadge);
  setText(elements.scanAxisReadout, derived.scanMeta.axisRange);
  setText(elements.fixedChannelReadout, derived.scanMeta.fixedChannel);
  setText(elements.chartModeReadout, MODES[state.mode]?.label || "Emission scan / 发射扫描");
  setText(elements.chartAxisReadout, derived.scanMeta.axisRange);
  setText(elements.chartFixedReadout, derived.scanMeta.fixedChannel);
}

export function updatePartChrome(elements, state) {
  const part = PARTS[state.selectedPart] ? state.selectedPart : "source";

  elements.partButtons.forEach((button) => {
    const isActive = button.dataset.part === part;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  setText(elements.partTitle, PARTS[part].title);
  setText(elements.partCopy, PARTS[part].copy);
  setText(elements.partHint, PARTS[part].hint);
  setText(elements.sceneHint, PARTS[part].hint);
}

export function updateSpectrumChrome(root, elements, state, derived) {
  if (elements.trace) {
    elements.trace.setAttribute("points", pointsToPolyline(derived.spectrum));
  }

  setText(
    elements.intensityReadout,
    `${state.mode === "single" ? "Point / 单点" : "Peak / 峰值"} ${derived.spectrum.peak.toFixed(2)} a.u.`
  );
  root.style.setProperty("--beam-intensity", String(derived.beams.excitationIntensity));
  root.style.setProperty("--emission-intensity", String(derived.beams.emissionIntensity));
  root.style.setProperty("--signal-intensity", String(derived.beams.signalIntensity));
  root.style.setProperty("--excitation-color", derived.beams.excitationColor);
  root.style.setProperty("--emission-color", derived.beams.emissionColor);

  updateControlsFromState(elements, state, derived);
  updateModeChrome(elements, state, derived);
}

export function updateDiagnostics(elements, diagnostics) {
  if (!elements.diagnosticsList) {
    return;
  }

  elements.diagnosticsList.textContent = "";
  diagnostics.forEach((item) => {
    const li = document.createElement("li");
    li.className = `diagnostic-item diagnostic-item-${item.tone || "info"}`;
    li.setAttribute("aria-label", `${item.label}: ${item.text}`);
    const label = document.createElement("strong");
    const separator = document.createElement("span");
    const copy = document.createElement("span");
    label.textContent = item.label;
    separator.hidden = true;
    separator.textContent = ": ";
    copy.textContent = item.text;
    li.append(label, separator, copy);
    elements.diagnosticsList.appendChild(li);
  });
}
