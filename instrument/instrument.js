(() => {
  const root = document.querySelector("[data-instrument-lab]");

  if (!root) {
    return;
  }

  const modeButtons = Array.from(root.querySelectorAll("[data-mode]"));
  const partButtons = Array.from(root.querySelectorAll("[data-part]"));
  const controls = {
    excitation: root.querySelector('[data-control="excitation"]'),
    emission: root.querySelector('[data-control="emission"]'),
    slit: root.querySelector('[data-control="slit"]'),
    integration: root.querySelector('[data-control="integration"]'),
    sample: root.querySelector('[data-control="sample"]'),
  };
  const readouts = {
    excitation: root.querySelector('[data-readout="excitation"]'),
    emission: root.querySelector('[data-readout="emission"]'),
    slit: root.querySelector('[data-readout="slit"]'),
    integration: root.querySelector('[data-readout="integration"]'),
  };
  const emissionLabel = root.querySelector("[data-emission-label]");
  const modeSummary = root.querySelector("[data-mode-summary]");
  const partTitle = root.querySelector("[data-part-title]");
  const partCopy = root.querySelector("[data-part-copy]");
  const trace = root.querySelector("[data-spectrum-trace]");
  const xAxisStart = root.querySelector("[data-x-axis-start]");
  const xAxisEnd = root.querySelector("[data-x-axis-end]");
  const spectrumModeLabel = root.querySelector("[data-spectrum-mode-label]");
  const intensityReadout = root.querySelector("[data-intensity-readout]");
  const scanAxisReadout = root.querySelector("[data-scan-axis-readout]");
  const fixedChannelReadout = root.querySelector("[data-fixed-channel-readout]");
  const chartModeReadout = root.querySelector("[data-chart-mode]");
  const chartAxisReadout = root.querySelector("[data-chart-axis]");
  const chartFixedReadout = root.querySelector("[data-chart-fixed]");
  const sampleNote = root.querySelector("[data-sample-note]");
  const excitationBadge = root.querySelector("[data-badge-excitation]");
  const emissionBadge = root.querySelector("[data-badge-emission]");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const chart = {
    left: 54,
    top: 34,
    right: 588,
    bottom: 248,
  };

  const samples = {
    "low-background": {
      name: "Low-background sample",
      description: "A clean illustrative sample with a distinct synthetic emission feature.",
      excitationPeak: 365,
      excitationWidth: 42,
      emissionPeak: 468,
      emissionWidth: 36,
      amplitude: 1,
      baseline: 0.025,
      noise: 0.018,
      decay: 0.2,
    },
    "broad-emission": {
      name: "Broad-emission sample",
      description: "A conceptual sample with broader excitation and emission response.",
      excitationPeak: 405,
      excitationWidth: 72,
      emissionPeak: 552,
      emissionWidth: 74,
      amplitude: 0.86,
      baseline: 0.04,
      noise: 0.015,
      decay: 0.12,
    },
    blank: {
      name: "Blank / background-dominant",
      description: "Mostly baseline plus small background/scatter; not a true fluorescence band.",
      kind: "blank",
      excitationPeak: 330,
      excitationWidth: 60,
      emissionPeak: 430,
      emissionWidth: 48,
      amplitude: 0.02,
      baseline: 0.026,
      noise: 0.008,
      decay: 0.02,
    },
    scattering: {
      name: "Scattering sample",
      description: "A conceptual case where background and scatter compete with fluorescence.",
      excitationPeak: 320,
      excitationWidth: 56,
      emissionPeak: 440,
      emissionWidth: 42,
      amplitude: 0.38,
      baseline: 0.12,
      noise: 0.026,
      decay: 0.08,
    },
  };

  const parts = {
    source: {
      title: "Light source",
      copy: "Provides excitation energy for the model. In a flexible spectrofluorometer, a broadband source is commonly narrowed by the excitation-side optics.",
    },
    excitation: {
      title: "Excitation monochromator",
      copy: "Selects a conceptual excitation wavelength. The blue path is kept as a straight incident axis so the optical direction is easy to read.",
    },
    sample: {
      title: "Sample cell",
      copy: "The excitation beam enters on one axis. Fluorescence is collected from the side arm at roughly 90 degrees, while the remaining incident beam is shown as stopped.",
    },
    emission: {
      title: "Emission monochromator",
      copy: "Sits on the 90-degree collection arm and selects the emission-side wavelength band before the detector receives the signal.",
    },
    detector: {
      title: "Detector",
      copy: "Receives selected emission-side light after the 90-degree geometry and emission monochromator have reduced direct excitation light.",
    },
    output: {
      title: "Spectrum display",
      copy: "Shows a generated trace for the selected conceptual mode. The line from detector to display is a signal path, not another optical beam.",
    },
  };

  const modeText = {
    emission: {
      summary: "Emission scan: keep excitation fixed, scan the emission-side monochromator across the output range.",
      axis: "Emission wavelength",
      start: "380 nm",
      end: "700 nm",
      emissionLabel: "Emission range",
      emissionReadout: "380-700 nm",
    },
    excitation: {
      summary: "Excitation scan: keep the emission wavelength fixed, scan the excitation-side monochromator.",
      axis: "Excitation wavelength",
      start: "250 nm",
      end: "550 nm",
      emissionLabel: "Fixed emission wavelength",
    },
    time: {
      summary: "Time / kinetic scan: keep excitation and emission wavelengths fixed, then track a reaction- or stability-style synthetic intensity trend over time. Not a fluorescence lifetime measurement.",
      axis: "Time",
      start: "0 s",
      end: "120 s",
      emissionLabel: "Fixed emission wavelength",
    },
  };

  let state = {
    mode: "emission",
  };

  const yScaleMax = 1.15;

  function gaussian(value, center, width) {
    const normalized = (value - center) / Math.max(width, 1);
    return Math.exp(-0.5 * normalized * normalized);
  }

  function deterministicNoise(index, seed) {
    const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
    return value - Math.floor(value) - 0.5;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getValues() {
    return {
      excitation: Number(controls.excitation.value),
      emission: Number(controls.emission.value),
      slit: Number(controls.slit.value),
      integration: Number(controls.integration.value),
      sample: controls.sample.value,
    };
  }

  function signalScale(values, profile) {
    const slitScale = 0.62 + values.slit * 0.075;
    const integrationScale = 0.72 + Math.sqrt(values.integration / 1000) * 0.5;
    return profile.amplitude * slitScale * integrationScale;
  }

  function calculatePoint(mode, x, index, values, profile) {
    const seed = values.excitation * 0.01 + values.emission * 0.02 + values.slit + values.integration * 0.001;
    const noise = deterministicNoise(index, seed) * profile.noise;
    const baseline = profile.baseline + values.slit * 0.002;
    const scale = signalScale(values, profile);

    if (profile.kind === "blank") {
      if (mode === "emission") {
        const weakScatter = gaussian(x, values.excitation + 18, 18 + values.slit) * 0.035;
        return baseline + weakScatter + noise * 0.7;
      }

      if (mode === "excitation") {
        const weakBackground = gaussian(x, values.emission - 28, 32 + values.slit) * 0.024;
        return baseline + weakBackground + noise * 0.7;
      }

      const slowDrift = Math.sin(x / 34) * 0.004 + (x / 120) * 0.006;
      return baseline + slowDrift + noise * 0.6;
    }

    if (mode === "emission") {
      const excitationFit = gaussian(values.excitation, profile.excitationPeak, profile.excitationWidth);
      const shiftedPeak = profile.emissionPeak + (values.excitation - profile.excitationPeak) * 0.08;
      const fluorescence = gaussian(x, shiftedPeak, profile.emissionWidth + values.slit * 1.7);
      const scatter = profile.name === "Scattering sample" ? gaussian(x, values.excitation + 18, 18 + values.slit) * 0.22 : 0;
      return baseline + scale * excitationFit * fluorescence + scatter + noise;
    }

    if (mode === "excitation") {
      const emissionFit = gaussian(values.emission, profile.emissionPeak, profile.emissionWidth + values.slit);
      const excitation = gaussian(x, profile.excitationPeak, profile.excitationWidth + values.slit * 1.2);
      const scatter = profile.name === "Scattering sample" ? gaussian(x, values.emission - 24, 26) * 0.15 : 0;
      return baseline + scale * emissionFit * excitation + scatter + noise;
    }

    const time = x;
    const excitationFit = gaussian(values.excitation, profile.excitationPeak, profile.excitationWidth);
    const emissionFit = gaussian(values.emission, profile.emissionPeak, profile.emissionWidth + values.slit);
    const settle = 1 - Math.exp(-time / 16);
    const decay = 1 - profile.decay * (1 - Math.exp(-time / 72));
    const ripple = Math.sin(time / 9 + values.slit * 0.4) * 0.025;
    return baseline + scale * excitationFit * emissionFit * settle * decay + ripple + noise;
  }

  function generateSeries(mode, values) {
    const profile = samples[values.sample] || samples["low-background"];
    const ranges = {
      emission: [380, 700],
      excitation: [250, 550],
      time: [0, 120],
    };
    const [min, max] = ranges[mode];
    const count = 86;
    const raw = [];

    for (let index = 0; index < count; index += 1) {
      const progress = index / (count - 1);
      const x = min + (max - min) * progress;
      raw.push({
        x,
        y: clamp(calculatePoint(mode, x, index, values, profile), 0, 1.35),
      });
    }

    const peak = Math.max(...raw.map((point) => point.y), 0.01);
    const scaled = raw.map((point) => ({
      x: point.x,
      y: point.y / yScaleMax,
      rawY: point.y,
    }));

    return { min, max, points: scaled, peak };
  }

  function pointsToPolyline(series) {
    const width = chart.right - chart.left;
    const height = chart.bottom - chart.top;

    return series.points
      .map((point) => {
        const xProgress = (point.x - series.min) / Math.max(series.max - series.min, 1);
        const x = chart.left + xProgress * width;
        const y = chart.bottom - clamp(point.y, 0, 1) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  function updateReadouts(values) {
    const profile = samples[values.sample] || samples["low-background"];
    const modeLabel = modeButtons.find((button) => button.dataset.mode === state.mode)?.textContent || "Emission scan";

    readouts.excitation.textContent = `${values.excitation} nm`;
    readouts.slit.textContent = `${values.slit} nm`;
    readouts.integration.textContent = `${values.integration} ms`;
    sampleNote.textContent = profile.description;

    if (state.mode === "emission") {
      readouts.emission.textContent = modeText.emission.emissionReadout;
      controls.emission.disabled = true;
      controls.emission.setAttribute("aria-describedby", "emission-range-help");
    } else {
      readouts.emission.textContent = `${values.emission} nm`;
      controls.emission.disabled = false;
      controls.emission.removeAttribute("aria-describedby");
    }

    if (state.mode === "emission") {
      scanAxisReadout.textContent = "Emission 380-700 nm";
      fixedChannelReadout.textContent = `Excitation ${values.excitation} nm`;
      chartAxisReadout.textContent = "Emission 380-700 nm";
      chartFixedReadout.textContent = `Excitation ${values.excitation} nm`;
    } else if (state.mode === "excitation") {
      scanAxisReadout.textContent = "Excitation 250-550 nm";
      fixedChannelReadout.textContent = `Emission ${values.emission} nm`;
      chartAxisReadout.textContent = "Excitation 250-550 nm";
      chartFixedReadout.textContent = `Emission ${values.emission} nm`;
    } else {
      scanAxisReadout.textContent = "Time 0-120 s";
      fixedChannelReadout.textContent = `Ex ${values.excitation} nm / Em ${values.emission} nm`;
      chartAxisReadout.textContent = "Time 0-120 s";
      chartFixedReadout.textContent = `Ex ${values.excitation} nm / Em ${values.emission} nm`;
    }

    chartModeReadout.textContent = modeLabel;
  }

  function updateModeChrome() {
    modeButtons.forEach((button) => {
      const isActive = button.dataset.mode === state.mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    const currentText = modeText[state.mode];
    modeSummary.textContent = currentText.summary;
    spectrumModeLabel.textContent = currentText.axis;
    xAxisStart.textContent = currentText.start;
    xAxisEnd.textContent = currentText.end;
    emissionLabel.textContent = currentText.emissionLabel;

    excitationBadge.textContent = state.mode === "excitation" ? "Scanning" : "Fixed";
    emissionBadge.textContent = state.mode === "emission" ? "Scanning" : "Fixed";
  }

  function updateSpectrum() {
    const values = getValues();
    const series = generateSeries(state.mode, values);
    const peak = series.peak;
    trace.setAttribute("points", pointsToPolyline(series));
    intensityReadout.textContent = `Peak ${peak.toFixed(2)} a.u.`;
    root.style.setProperty("--emission-intensity", String(clamp(0.22 + peak * 0.62, 0.22, 0.9)));
    root.style.setProperty("--signal-intensity", String(clamp(0.22 + peak * 0.58, 0.22, 0.82)));
    updateReadouts(values);
  }

  function updatePart(part) {
    const nextPart = parts[part] ? part : "source";

    partButtons.forEach((button) => {
      const isActive = button.dataset.part === nextPart;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    partTitle.textContent = parts[nextPart].title;
    partCopy.textContent = parts[nextPart].copy;
    root.dataset.activePart = nextPart;
  }

  function setMode(mode) {
    if (!modeText[mode]) {
      return;
    }

    state.mode = mode;
    root.dataset.scanMode = mode;
    updateModeChrome();
    updateSpectrum();
  }

  function applyReducedMotionPreference() {
    root.classList.toggle("is-reduced-motion", reduceMotionQuery.matches);
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  partButtons.forEach((button) => {
    button.addEventListener("click", () => updatePart(button.dataset.part));

    if (button.tagName.toLowerCase() !== "button") {
      button.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        updatePart(button.dataset.part);
      });
    }
  });

  Object.values(controls).forEach((control) => {
    control.addEventListener("input", updateSpectrum);
    control.addEventListener("change", updateSpectrum);
  });

  if ("addEventListener" in reduceMotionQuery) {
    reduceMotionQuery.addEventListener("change", applyReducedMotionPreference);
  } else if ("addListener" in reduceMotionQuery) {
    reduceMotionQuery.addListener(applyReducedMotionPreference);
  }

  applyReducedMotionPreference();
  root.dataset.scanMode = state.mode;
  updateModeChrome();
  updatePart("source");
  updateSpectrum();
})();
