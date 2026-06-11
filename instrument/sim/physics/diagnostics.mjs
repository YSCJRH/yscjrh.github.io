export function generateDiagnostics(state, derived) {
  const diagnostics = [];

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

  if (derived.collection.deltaDeg >= 3) {
    diagnostics.push({
      tone: "warn",
      evidenceKey: "ILAB-006",
      label: "90 degree geometry / 90° 几何",
      text: "Detector arm offset reduces collection and raises background risk in this conceptual model. / 在这个概念模型中，检测臂偏离会降低收集效率，并提高背景风险。",
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

  return diagnostics.slice(0, 5);
}
