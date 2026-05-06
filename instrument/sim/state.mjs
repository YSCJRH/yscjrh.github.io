import { clamp } from "./math.mjs?v=wavelength-control-20260429";
import {
  MONOCHROMATOR_GRATING_ANGLE_RANGE,
  MONOCHROMATOR_WAVELENGTH_RANGE,
  gratingAngleFromWavelength,
  wavelengthFromGratingAngle,
} from "./physics/grating.mjs?v=wavelength-control-20260429";

export { clamp };

export const MODES = Object.freeze({
  emission: {
    label: "Emission scan / 发射扫描",
    summary:
      "Emission scan: keep excitation fixed, scan the emission-side monochromator across the output range. / 发射扫描：固定激发通道，扫描发射侧单色器的输出范围。",
  },
  excitation: {
    label: "Excitation scan / 激发扫描",
    summary:
      "Excitation scan: keep emission fixed, scan the excitation-side monochromator. / 激发扫描：固定发射通道，扫描激发侧单色器。",
  },
  time: {
    label: "Time / kinetic scan / 时间或动力学扫描",
    summary:
      "Time / kinetic scan: keep excitation and emission fixed, then track a reaction- or stability-style synthetic intensity trend over time. Not a fluorescence lifetime measurement. / 时间或动力学扫描：固定激发和发射通道，观察反应或稳定性风格的合成强度随时间变化；这不是荧光寿命测量。",
  },
  single: {
    label: "Single-point monitor / 单点监测",
    summary:
      "Single-point monitor: keep excitation and emission fixed, then show one steady synthetic intensity readout. It is educational, not a quantitative measurement. / 单点监测：固定激发和发射通道，只显示一个稳定的合成强度读数；它用于教学，不是定量测量。",
  },
});

export const PARTS = Object.freeze({
  source: {
    title: "Light source / 光源",
    copy:
      "Provides excitation energy for the model. A broadband source is narrowed by excitation-side optics before the sample. / 为模型提供激发能量；宽带光源在到达样品前由激发侧光学系统选窄。",
    hint:
      "Select source in the 3D view, then drag the blue Z-axis handle or use Source offset. Alignment changes intensity, not wavelength. / 在 3D 视图中选择光源后，可拖动蓝色 Z 轴手柄或使用 Source offset；对准只改变强度，不改变波长。",
  },
  excitation: {
    title: "Excitation monochromator / 激发单色器",
    copy:
      "Uses slits, mirrors, and a teaching grating angle to choose a conceptual excitation band. Rotating the grating changes the selected wavelength. / 通过狭缝、反射镜和教学化的光栅角选择概念激发带；旋转光栅会改变选通波长。",
    hint:
      "Click the excitation monochromator to open the blackened housing, then drag the internal grating handle or use arrow keys. / 点击激发单色器打开黑化外壳，然后拖动内部光栅手柄或使用方向键。",
  },
  sample: {
    title: "Sample cell / 样品池",
    copy:
      "The excitation beam enters on the incident axis. Fluorescence is collected from the side arm at roughly 90 degrees, while remaining transmitted excitation is absorbed by the beam stop. / 激发光沿入射轴进入样品；荧光从约 90° 的侧向臂收集，剩余透射激发光由光束终止器吸收。",
    hint:
      "The sample cell is fixed in the holder. Select it to inspect the light path and 90-degree collection geometry; use sample preset to change illustrative sample behavior. / 样品池固定在样品架中；选择它用于查看光路和 90° 收集几何，使用样品预设改变示意样品行为。",
  },
  emission: {
    title: "Emission monochromator / 发射单色器",
    copy:
      "Sits on the 90-degree collection arm and selects the emission-side wavelength band before detection. / 位于 90° 收集臂上，在检测前选择发射侧波长带。",
    hint:
      "Click the emission monochromator to open the blackened housing, then drag the internal grating handle or use arrow keys. / 点击发射单色器打开黑化外壳，然后拖动内部光栅手柄或使用方向键。",
  },
  detector: {
    title: "Detector / 检测器",
    copy:
      "Receives selected emission-side light. Geometry and emission-side optics reduce direct excitation light before the detector. / 接收经过发射侧选择的光；几何关系和发射侧光学系统在检测器前降低直接激发光影响。",
    hint:
      "Select detector to reveal the cyan arm handle. Drag within the 80-100 degree teaching range; signal collection is best near 90 degrees. / 选择检测器会显示青色旋转手柄；可在 80-100° 教学范围内拖动，信号收集在接近 90° 时最好。",
  },
  output: {
    title: "Spectrum display / 谱图显示",
    copy:
      "Shows a generated trace for the selected conceptual mode. The detector-to-display connection is an electronic signal path, not another light beam. / 显示当前概念模式生成的谱线；检测器到显示区之间是电子信号路径，不是另一束光。",
    hint:
      "The trace is derived from the current model state. Source-derived examples below stay separate from these synthetic controls. / 谱线由当前模型状态派生；下方引用数据示例与这些合成控制项保持分离。",
  },
});

export const SAMPLE_PROFILES = Object.freeze({
  "low-background": {
    name: "Low-background sample / 低背景样品",
    description: "A clean illustrative sample with a distinct synthetic emission feature. / 一个干净的示意样品，具有清晰的合成发射特征。",
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
    name: "Broad-emission sample / 宽发射样品",
    description: "A conceptual sample with broader excitation and emission response. / 一个概念样品，具有更宽的激发和发射响应。",
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
    name: "Blank / background-dominant / 空白或背景主导",
    description: "Mostly baseline plus small background/scatter; not a true fluorescence band. / 主要由基线和少量背景或散射组成，不是真正的荧光峰带。",
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
    name: "Scattering sample / 散射样品",
    description: "A conceptual case where background and scatter compete with fluorescence. / 一个背景和散射会与荧光竞争的概念情形。",
    kind: "scattering",
    excitationPeak: 320,
    excitationWidth: 56,
    emissionPeak: 440,
    emissionWidth: 42,
    amplitude: 0.38,
    baseline: 0.12,
    noise: 0.026,
    decay: 0.08,
  },
});

export function createInstrumentState() {
  return {
    mode: "emission",
    selectedPart: "source",
    source: {
      offsetUm: 0,
    },
    exMono: {
      gratingAngleDeg: gratingAngleFromWavelength(365),
    },
    emMono: {
      gratingAngleDeg: gratingAngleFromWavelength(520),
    },
    slit: {
      widthUm: 500,
    },
    sample: {
      preset: "low-background",
      offsetUm: 0,
    },
    detector: {
      angleDeg: 90,
    },
    integrationTimeMs: 200,
  };
}

export function applyControlValue(state, controlName, rawValue) {
  const numeric = Number(rawValue);

  switch (controlName) {
    case "excitation-wavelength":
      setGratingWavelength(state, "excitation", numeric);
      break;
    case "emission-wavelength":
      setGratingWavelength(state, "emission", numeric);
      break;
    case "excitation-angle":
      setGratingAngle(state, "excitation", numeric);
      break;
    case "emission-angle":
      setGratingAngle(state, "emission", numeric);
      break;
    case "slit":
      state.slit.widthUm = clamp(numeric, 100, 1000);
      break;
    case "integration":
      state.integrationTimeMs = clamp(numeric, 20, 1000);
      break;
    case "sample":
      state.sample.preset = SAMPLE_PROFILES[rawValue] ? rawValue : "low-background";
      break;
    case "source-offset":
      state.source.offsetUm = clamp(numeric, -120, 120);
      break;
    case "detector-angle":
      state.detector.angleDeg = clamp(numeric, 80, 100);
      break;
    default:
      break;
  }
}

export function setMode(state, mode) {
  if (MODES[mode]) {
    state.mode = mode;
  }
}

export function setSelectedPart(state, part) {
  if (PARTS[part]) {
    state.selectedPart = part;
  }
}

export function setGratingAngle(state, part, angleDeg) {
  const numeric = Number(angleDeg);

  if (!Number.isFinite(numeric)) {
    return;
  }

  if (part === "excitation") {
    state.exMono.gratingAngleDeg = clamp(
      numeric,
      MONOCHROMATOR_GRATING_ANGLE_RANGE.min,
      MONOCHROMATOR_GRATING_ANGLE_RANGE.max
    );
  } else if (part === "emission") {
    state.emMono.gratingAngleDeg = clamp(
      numeric,
      MONOCHROMATOR_GRATING_ANGLE_RANGE.min,
      MONOCHROMATOR_GRATING_ANGLE_RANGE.max
    );
  }
}

export function setGratingWavelength(state, part, wavelengthNm) {
  const numeric = Number(wavelengthNm);

  if (!Number.isFinite(numeric)) {
    return;
  }

  const clamped = clamp(numeric, MONOCHROMATOR_WAVELENGTH_RANGE.minNm, MONOCHROMATOR_WAVELENGTH_RANGE.maxNm);
  setGratingAngle(state, part, gratingAngleFromWavelength(clamped));
}

export function gratingWavelengthForPart(state, part) {
  const angleDeg = part === "emission"
    ? state.emMono.gratingAngleDeg
    : state.exMono.gratingAngleDeg;

  return wavelengthFromGratingAngle(angleDeg);
}

export function resetGeometry(state) {
  state.source.offsetUm = 0;
  state.sample.offsetUm = 0;
  state.detector.angleDeg = 90;
}

export function setGeometryOffsets(state, changes = {}) {
  if (Number.isFinite(changes.sourceOffsetUm)) {
    state.source.offsetUm = clamp(Math.round(changes.sourceOffsetUm), -120, 120);
  }

  if (Number.isFinite(changes.detectorAngleDeg)) {
    state.detector.angleDeg = clamp(Number(changes.detectorAngleDeg), 80, 100);
  }

  if (Number.isFinite(changes.excitationAngleDeg)) {
    setGratingAngle(state, "excitation", changes.excitationAngleDeg);
  }

  if (Number.isFinite(changes.emissionAngleDeg)) {
    setGratingAngle(state, "emission", changes.emissionAngleDeg);
  }
}
