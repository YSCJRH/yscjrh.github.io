export function generateDiagnostics(state, derived) {
  const diagnostics = [];
  const displayDiagnostics = [];

  if (state.mode === "emission") {
    diagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-001",
      label: "Emission scan / 发射扫描",
      text: `Excitation is fixed at ${Math.round(derived.excitationNm)} nm while the emission arm is scanned. / 激发固定在 ${Math.round(derived.excitationNm)} nm，发射臂正在扫描。`,
    });
  } else if (state.mode === "excitation") {
    diagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-001",
      label: "Excitation scan / 激发扫描",
      text: `Emission is fixed at ${Math.round(derived.emissionNm)} nm while the excitation monochromator is scanned. / 发射固定在 ${Math.round(derived.emissionNm)} nm，激发单色器正在扫描。`,
    });
  } else if (state.mode === "time") {
    diagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-008",
      label: "Kinetic scan / 动力学扫描",
      text: "Both channels are fixed. This is a synthetic intensity-over-time trace, not lifetime decay. / 两个通道均固定；这里显示的是合成强度随时间变化，不是荧光寿命衰减。",
    });
  } else {
    diagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-008",
      label: "Single-point monitor / 单点监测",
      text: "Both channels are fixed. The readout changes with slit width, alignment, sample preset, and integration time. / 两个通道均固定；读数会随狭缝宽度、对准、样品预设和积分时间变化。",
    });
  }

  if (state.display?.spectrumView === "response-normalized") {
    diagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-003",
      label: "Response-normalized view / 响应归一化视图",
      text: "The chart divides the raw synthetic trace by selected teaching source, detector, and geometry response cues. It demonstrates correction logic, not calibrated correction. / 谱图按当前教学光源、检测器和几何响应提示对原始合成谱线做归一化，用于展示校正思路，不是校准校正。",
    });
  }

  if (state.display?.showNoise === false) {
    displayDiagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-010",
      label: "Noise cue hidden / 噪声提示隐藏",
      text: "The deterministic teaching perturbation is hidden from the chart. This does not create a real noise-free measurement. / 谱图已隐藏确定性教学扰动；这不代表真实无噪声测量。",
    });
  }

  if (state.display?.showArtifacts === false) {
    displayDiagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-007",
      label: "Artifact cues hidden / 伪影提示隐藏",
      text: "Conceptual scatter and background cues are hidden from the synthetic trace. Risk diagnostics remain teaching boundaries, not calibrated artifact curves. / 合成谱线已隐藏概念散射与背景提示；风险诊断仍是教学边界，不是校准伪影曲线。",
    });
  }

  if (derived.bandpassNm >= 7) {
    diagnostics.push({
      tone: "warn",
      evidenceKey: "ILAB-004",
      label: "Resolution tradeoff / 分辨率权衡",
      text: "The slit is wide: throughput increases, but spectral features broaden in the teaching model. / 狭缝较宽：通光量增加，但教学模型中的谱峰会变宽。",
    });
  } else if (derived.bandpassNm <= 3) {
    diagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-004",
      label: "Narrow bandpass / 窄带宽",
      text: "The slit is narrow: resolution improves, but less light reaches the detector. / 狭缝较窄：分辨率提高，但到达检测器的光更少。",
    });
  }

  if (derived.alignment.overlapFactor < 0.72) {
    diagnostics.push({
      tone: "warn",
      evidenceKey: "ILAB-008",
      label: "Alignment / 对准",
      text: "Source entrance offset lowers overlap and intensity; the fixed sample cell stays in the measurement holder and selected wavelength does not move. / 光源入口偏移会降低重叠和强度；固定样品池仍在测量架中，选通波长不会移动。",
    });
  }

  if (derived.detectorArm.deltaDeg >= 3) {
    diagnostics.push({
      tone: "warn",
      evidenceKey: "ILAB-006",
      label: "Detector arm offset / 检测臂偏离",
      text: "The detector arm is away from the 90 degree teaching position, reducing collection and raising background risk without moving selected wavelengths. / 检测臂偏离 90° 教学位置，会降低收集效率并提高背景风险，但不会移动选通波长。",
    });
  }

  if (derived.responseChain?.source?.atExcitation <= 0.2) {
    diagnostics.push({
      tone: "warn",
      evidenceKey: "ILAB-008",
      label: "Low source output / 光源输出较低",
      text: "The selected teaching source is weak at the excitation wavelength, so the synthetic trace drops. This is a normalized teaching source, not a measured lamp spectrum. / 当前教学光源在激发波长处较弱，因此合成谱线降低；这是归一化教学光源，不是实测灯谱。",
    });
  }

  if (derived.responseChain?.detector?.atEmission <= 0.65) {
    diagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-003",
      label: "Detector response / 检测器响应",
      text: "The detector preset has lower normalized response at the selected emission wavelength, changing the synthetic signal shape. It is not a calibration curve. / 检测器预设在当前发射波长处归一化响应较低，会改变合成信号形状；它不是校准曲线。",
    });
  }

  const geometry = derived.responseChain?.geometry;
  if (geometry && geometry.id !== "right-angle-90") {
    diagnostics.push({
      tone: geometry.backgroundRisk >= 0.34 ? "warn" : "info",
      evidenceKey: "ILAB-006",
      label: "Geometry mode / 几何模式",
      text: "The selected geometry changes collection and background risk in the teaching model. It does not move the selected wavelengths. / 当前几何模式会改变教学模型中的收集效率和背景风险，但不会移动选通波长。",
    });
  }

  const artifacts = derived.responseChain?.artifacts;
  const artifactRisk = artifacts
    ? [artifacts.rayleighRisk, artifacts.secondOrderRisk, artifacts.backgroundRisk].find((risk) => risk?.level !== "low")
    : null;
  if (artifactRisk) {
    diagnostics.push({
      tone: artifactRisk.level === "high" ? "warn" : "info",
      evidenceKey: "ILAB-007",
      label: "Artifact risk / 伪影风险",
      text: "The current wavelength pairing or geometry raises a conceptual scatter, second-order, or background warning. This is a diagnostic cue, not a calibrated artifact curve. / 当前波长组合或几何关系触发概念性的散射、二级衍射或背景提示；这是诊断提示，不是校准伪影曲线。",
    });
  }

  const headroomPeak = derived.spectrum.rawPeak ?? derived.spectrum.peak;
  if (headroomPeak / Math.max(derived.spectrum.yScaleMax, 0.001) >= 0.85) {
    diagnostics.push({
      tone: "warn",
      evidenceKey: "ILAB-008",
      label: "Signal headroom / 信号余量",
      text: "The synthetic trace is close to the fixed display scale, so headroom is limited in this teaching view. It is not a real detector saturation claim. / 合成谱线接近固定显示量程，因此此教学视图中的余量有限；这不是真实检测器饱和声明。",
    });
  }

  if (derived.spectrum.profile.kind === "blank") {
    diagnostics.push({
      tone: "info",
      evidenceKey: "ILAB-008",
      label: "Blank preset / 空白预设",
      text: "The blank/background preset is intentionally weak: mostly baseline plus small scatter/background. / 空白或背景主导预设被有意设为弱信号，主要是基线和少量散射或背景。",
    });
  }

  const warnings = diagnostics.filter((diagnostic) => diagnostic.tone === "warn");
  const notes = diagnostics.filter((diagnostic) => diagnostic.tone !== "warn");
  const displaySlots = displayDiagnostics.length;
  const warningSlots = Math.max(0, 5 - displaySlots);
  return [...warnings.slice(0, warningSlots), ...displayDiagnostics, ...notes].slice(0, 5);
}
