import {
  DETECTOR_PRESET_OPTIONS,
  GEOMETRY_PRESET_OPTIONS,
  MODES,
  PARTS,
  SAMPLE_PRESET_OPTIONS,
  SPECTRUM_VIEW_OPTIONS,
  SOURCE_PRESET_OPTIONS,
} from "../state.mjs?v=control-hardening-20260611";

const chart = {
  left: 54,
  top: 34,
  right: 588,
  bottom: 248,
};

function splitLanguagePair(text) {
  const value = String(text ?? "");
  const separator = " / ";
  const firstCjkIndex = value.search(/[\u3400-\u9fff]/);

  if (firstCjkIndex === -1) {
    return { en: value, zh: value };
  }

  const separatorIndex = value.lastIndexOf(separator, firstCjkIndex);
  if (separatorIndex !== -1) {
    return {
      en: value.slice(0, separatorIndex).trim(),
      zh: value.slice(separatorIndex + separator.length).trim(),
    };
  }

  return { en: value, zh: value };
}

export function localizedText(text, languageMode = "bilingual") {
  const value = String(text ?? "");
  if (languageMode === "bilingual") {
    return value;
  }

  const pair = splitLanguagePair(value);
  return languageMode === "zh" ? pair.zh : pair.en;
}

function languageModeForElements(elements) {
  const mode = elements?.root?.dataset?.languageMode;
  return mode === "en" || mode === "zh" || mode === "bilingual" ? mode : "bilingual";
}

function setText(element, text, languageMode = "bilingual") {
  if (element) {
    element.textContent = localizedText(text, languageMode);
  }
}

function setDisabled(element, disabled) {
  if (!element) {
    return;
  }

  element.disabled = disabled;
}

function selectOptionPairs(select) {
  return Array.from(select?.options || []).map((option) => [option.value, option.textContent]);
}

function syncPresetSelectOptions(select, options, documentRef = globalThis.document) {
  if (!select || !documentRef?.createElement) {
    return;
  }

  const desiredPairs = options.map((option) => [option.id, option.label]);
  if (JSON.stringify(selectOptionPairs(select)) === JSON.stringify(desiredPairs)) {
    return;
  }

  const previousValue = select.value;
  if (Array.isArray(select.options)) {
    select.options.length = 0;
  }
  select.textContent = "";

  options.forEach((option) => {
    const node = documentRef.createElement("option");
    node.value = option.id;
    node.textContent = option.label;
    select.append(node);
  });

  select.value = options.some((option) => option.id === previousValue)
    ? previousValue
    : options[0]?.id || "";
}

export function syncSamplePresetOptions(elements, documentRef = globalThis.document) {
  syncPresetSelectOptions(elements?.controls?.sample, SAMPLE_PRESET_OPTIONS, documentRef);
}

export function syncSimulatorPresetOptions(elements, documentRef = globalThis.document) {
  syncSamplePresetOptions(elements, documentRef);
  syncPresetSelectOptions(elements?.controls?.sourceType, SOURCE_PRESET_OPTIONS, documentRef);
  syncPresetSelectOptions(elements?.controls?.detectorType, DETECTOR_PRESET_OPTIONS, documentRef);
  syncPresetSelectOptions(elements?.controls?.geometryMode, GEOMETRY_PRESET_OPTIONS, documentRef);
  syncPresetSelectOptions(elements?.controls?.spectrumView, SPECTRUM_VIEW_OPTIONS, documentRef);
}

function percentText(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return "--";
  }

  return `${Math.round(Math.min(Math.max(numeric, 0), 1) * 100)}%`;
}

function headroomText(saturationRatio) {
  const numeric = Number(saturationRatio);

  if (!Number.isFinite(numeric)) {
    return "--";
  }

  return percentText(1 - numeric);
}

function pointsToPolyline(series) {
  return normalizedPointsToPolyline(series.points, series.min, series.max, (point) => point.y);
}

function normalizedPointsToPolyline(points, min, max, normalizedValueForPoint) {
  const width = chart.right - chart.left;
  const height = chart.bottom - chart.top;

  return points
    .map((point) => {
      const xProgress = (point.x - min) / Math.max(max - min, 1);
      const x = chart.left + xProgress * width;
      const y = chart.bottom - Math.min(Math.max(normalizedValueForPoint(point), 0), 1) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function componentScaleForPoint(point, viewId) {
  if (viewId !== "response-normalized") {
    return 1;
  }

  const raw = Number(point.rawY);
  const normalized = Number(point.responseNormalizedY);
  if (!Number.isFinite(raw) || raw <= 0 || !Number.isFinite(normalized)) {
    return 1;
  }

  return normalized / raw;
}

function componentValueForPoint(point, componentKey, viewId) {
  const components = point.components || {};
  const scale = componentScaleForPoint(point, viewId);

  if (componentKey === "sample") {
    return Math.max(Number(components.sampleInstrumentY) || 0, 0) * scale;
  }

  if (componentKey === "artifact") {
    return (
      Math.max(Number(components.baselineY) || 0, 0) +
      Math.max(Number(components.scatterY) || 0, 0)
    ) * scale;
  }

  if (componentKey === "noise") {
    return Math.abs(Number(components.noiseY) || 0) * scale;
  }

  return 0;
}

function pointsToComponentPolyline(series, componentKey) {
  const yScaleMax = Math.max(Number(series.yScaleMax) || 1, 1);
  return normalizedPointsToPolyline(
    series.points,
    series.min,
    series.max,
    (point) => componentValueForPoint(point, componentKey, series.view?.id) / yScaleMax
  );
}

function setComponentTrace(line, series, componentKey, isVisible) {
  if (!line) {
    return;
  }

  line.toggleAttribute("hidden", !isVisible);
  line.setAttribute("data-visible", String(isVisible));
  line.setAttribute("points", isVisible ? pointsToComponentPolyline(series, componentKey) : "");
}

function setHidden(element, hidden) {
  if (!element) {
    return;
  }

  element.hidden = hidden;
}

export function collectInstrumentElements(root) {
  const controls = {
    excitationWavelength: root.querySelector('[data-control="excitation-wavelength"]'),
    emissionWavelength: root.querySelector('[data-control="emission-wavelength"]'),
    slit: root.querySelector('[data-control="slit"]'),
    integration: root.querySelector('[data-control="integration"]'),
    sample: root.querySelector('[data-control="sample"]'),
    sourceType: root.querySelector('[data-control="source-type"]'),
    detectorType: root.querySelector('[data-control="detector-type"]'),
    geometryMode: root.querySelector('[data-control="geometry-mode"]'),
    spectrumView: root.querySelector('[data-control="spectrum-view"]'),
    showComponents: root.querySelector('[data-control="show-components"]'),
    showNoise: root.querySelector('[data-control="show-noise"]'),
    showArtifacts: root.querySelector('[data-control="show-artifacts"]'),
    sourceOffset: root.querySelector('[data-control="source-offset"]'),
    detectorAngle: root.querySelector('[data-control="detector-angle"]'),
  };

  return {
    root,
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
      responseSource: root.querySelector('[data-readout="response-source"]'),
      responseSample: root.querySelector('[data-readout="response-sample"]'),
      responseDetector: root.querySelector('[data-readout="response-detector"]'),
      signalHeadroom: root.querySelector('[data-readout="signal-headroom"]'),
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
    chartViewReadout: root.querySelector("[data-chart-view]"),
    chartScaleReadout: root.querySelector("[data-chart-scale]"),
    chartComponentsReadout: root.querySelector("[data-chart-components]"),
    componentLegend: root.querySelector("[data-component-legend]"),
    componentTraces: {
      sample: root.querySelector('[data-spectrum-component="sample"]'),
      artifact: root.querySelector('[data-spectrum-component="artifact"]'),
      noise: root.querySelector('[data-spectrum-component="noise"]'),
    },
    sampleNote: root.querySelector("[data-sample-note]"),
    excitationBadge: root.querySelector("[data-badge-excitation]"),
    emissionBadge: root.querySelector("[data-badge-emission]"),
    diagnosticsList: root.querySelector("[data-diagnostics-list]"),
  };
}

export function updateControlsFromState(elements, state, derived) {
  const { controls, readouts } = elements;
  const languageMode = languageModeForElements(elements);
  syncSimulatorPresetOptions(elements);

  setText(readouts.excitationAngle, `${state.exMono.gratingAngleDeg.toFixed(1)} deg`);
  setText(readouts.emissionAngle, `${state.emMono.gratingAngleDeg.toFixed(1)} deg`);
  setText(readouts.excitation, `${Math.round(derived.excitationNm)} nm`);
  setText(readouts.emission, `${Math.round(derived.emissionNm)} nm`);
  setText(readouts.slit, `${state.slit.widthUm} um`);
  setText(readouts.bandpass, `~${derived.bandpassNm.toFixed(1)} nm teaching bandpass / 教学带宽`, languageMode);
  setText(readouts.integration, `${state.integrationTimeMs} ms`);
  setText(readouts.sourceOffset, `${state.source.offsetUm} um`);
  setText(readouts.detectorAngle, `${state.detector.angleDeg.toFixed(1)} deg`);
  setText(readouts.throughput, `${Math.round(derived.throughput * 100)}%`);
  setText(readouts.overlap, `${Math.round(derived.alignment.overlapFactor * 100)}%`);
  setText(
    readouts.collection,
    `${Math.round((derived.responseChain?.geometry?.collectionFactor ?? derived.detectorArm.collectionFactor) * 100)}%`
  );
  setText(readouts.responseSource, percentText(derived.responseChain?.source?.atExcitation));
  setText(readouts.responseSample, percentText(derived.responseChain?.sample?.absorptionAtExcitation));
  setText(readouts.responseDetector, percentText(derived.responseChain?.detector?.atEmission));
  setText(readouts.signalHeadroom, headroomText(derived.responseChain?.signal?.saturationRatio));
  setText(elements.sampleNote, derived.spectrum.profile.description, languageMode);
  if (controls.spectrumView) controls.spectrumView.value = state.display?.spectrumView || "raw";
  if (controls.showComponents) controls.showComponents.checked = state.display?.showComponents === true;
  if (controls.showNoise) controls.showNoise.checked = state.display?.showNoise !== false;
  if (controls.showArtifacts) controls.showArtifacts.checked = state.display?.showArtifacts !== false;

  setDisabled(controls.emissionWavelength, false);
  setText(elements.emissionLabel, derived.scanMeta.emissionControlLabel, languageMode);
}

export function updateModeChrome(elements, state, derived) {
  const languageMode = languageModeForElements(elements);
  elements.modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === state.mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  setText(elements.modeSummary, MODES[state.mode]?.summary || MODES.emission.summary, languageMode);
  setText(elements.spectrumModeLabel, derived.scanMeta.axisLabel, languageMode);
  setText(elements.xAxisStart, derived.scanMeta.startLabel);
  setText(elements.xAxisEnd, derived.scanMeta.endLabel);
  setText(elements.excitationBadge, derived.scanMeta.excitationBadge, languageMode);
  setText(elements.emissionBadge, derived.scanMeta.emissionBadge, languageMode);
  setText(elements.scanAxisReadout, derived.scanMeta.axisRange, languageMode);
  setText(elements.fixedChannelReadout, derived.scanMeta.fixedChannel, languageMode);
  setText(elements.chartModeReadout, MODES[state.mode]?.label || "Emission scan / 发射扫描", languageMode);
  setText(elements.chartAxisReadout, derived.scanMeta.axisRange, languageMode);
  setText(elements.chartFixedReadout, derived.scanMeta.fixedChannel, languageMode);
  setText(elements.chartViewReadout, derived.spectrum.view.label, languageMode);
  setText(elements.chartScaleReadout, derived.spectrum.view.scaleLabel, languageMode);
  setText(
    elements.chartComponentsReadout,
    derived.spectrum.display?.showComponents ? "On / 开启" : "Off / 关闭",
    languageMode
  );
}

export function updatePartChrome(elements, state) {
  const part = PARTS[state.selectedPart] ? state.selectedPart : "source";
  const languageMode = languageModeForElements(elements);

  elements.partButtons.forEach((button) => {
    const isActive = button.dataset.part === part;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  setText(elements.partTitle, PARTS[part].title, languageMode);
  setText(elements.partCopy, PARTS[part].copy, languageMode);
  setText(elements.partHint, PARTS[part].hint, languageMode);
  setText(elements.sceneHint, PARTS[part].hint, languageMode);
}

export function updateSpectrumChrome(root, elements, state, derived) {
  if (elements.trace) {
    elements.trace.setAttribute("points", pointsToPolyline(derived.spectrum));
  }

  const showComponents = derived.spectrum.display?.showComponents === true;
  for (const [componentKey, trace] of Object.entries(elements.componentTraces || {})) {
    setComponentTrace(trace, derived.spectrum, componentKey, showComponents);
  }
  setHidden(elements.componentLegend, !showComponents);

  setText(
    elements.intensityReadout,
    `${localizedText(state.mode === "single" ? "Point / 单点" : "Peak / 峰值", languageModeForElements(elements))} ${derived.spectrum.peak.toFixed(2)} a.u.`
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

  const languageMode = languageModeForElements(elements);
  elements.diagnosticsList.textContent = "";
  diagnostics.forEach((item) => {
    const li = document.createElement("li");
    const evidenceKey = item.evidenceKey || "untracked";
    const labelText = localizedText(item.label, languageMode);
    const copyText = localizedText(item.text, languageMode);
    li.className = `diagnostic-item diagnostic-item-${item.tone || "info"}`;
    li.setAttribute("data-evidence-key", evidenceKey);
    li.setAttribute("aria-label", `${labelText}: ${copyText}. ${localizedText("Evidence key / 证据编号", languageMode)}: ${evidenceKey}`);
    const label = document.createElement("strong");
    const separator = document.createElement("span");
    const copy = document.createElement("span");
    label.textContent = labelText;
    separator.hidden = true;
    separator.textContent = ": ";
    copy.textContent = copyText;
    li.append(label, separator, copy);
    elements.diagnosticsList.appendChild(li);
  });
}
