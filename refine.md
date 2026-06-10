# refine.md

# Codex /goal 重构规范：荧光仪器可视化实验室

> 目标仓库：`YSCJRH/yscjrh.github.io`
> 目标页面：`/instrument/`，即荧光仪器可视化实验室
> 任务类型：长周期、自主分析、自主打磨、证据驱动的静态站点重构
> 预算上限：500,000,000 tokens。预算很大，但不是漂移许可证。用它做深度分析、并行验证、反复 QA 和证据记录，而不是堆砌功能。

---

## 0. 总目标

把当前 `/instrument/` 从“说明很多的概念演示页”重构为一个 **交互优先、科学边界清楚、物理模型可扩展、数据来源可信、可测试、可维护** 的荧光分光光度计教学仿真系统。

最终系统应当像一台小型教学仪器，而不是一张贴满免责声明的海报：

- 首屏让用户先操作，再通过实时诊断理解物理后果。
- 物理模型从简单合成峰升级为明确的仪器响应链。
- 合成模型、公开来源数据、校正说明、模型边界彼此分离。
- 所有荧光仪器理论、校正、几何、响应、数据复用相关判断必须有来源依据。
- 不确定时先查资料，不允许凭直觉编物理。
- 保留项目既有真诚边界：概念模型，不是真实仪器控制，不是校准测量。

---

## 1. 必须先读的仓库上下文

开始编码前，先完成仓库侦察，并在工作日志中记录当前结构、约束和风险。

优先阅读：

1. `README.md`
2. `personalweb.md`
3. `AGENTS.md`
4. `PLANS.md`
5. `docs/handoff-brief.md`
6. `CONTENT_MODEL.md`
7. `DESIGN_SYSTEM.md`
8. `ACCESSIBILITY_CHECKLIST.md`
9. `PERFORMANCE_CHECKLIST.md`
10. `DATA_SOURCES.md`
11. `instrument/index.html`
12. `instrument/sim/**/*.mjs`
13. `instrument/data/manifest.json`
14. 与 `/instrument/` 有关的 CSS、脚本、数据处理文件和已有文档。

当前仓库的公开约束必须优先遵守，除非有明确理由并写入决策记录：

- 默认保持静态站点。
- 不轻易引入构建系统或包管理器。
- 不编造论文、机构、成果、指标、联系方式、实验结果或样品数据。
- GitHub Pages 是公开发布面。
- 重大 IA、品牌、内容模型、科学模型或工具决策写入 `docs/decisions/`。

---

## 2. 不可妥协的原则

### 2.1 科学诚实优先

任何涉及下列主题的实现或文案，若当前代码和已有文档没有可靠依据，必须先查资料：

- 荧光激发谱、发射谱、EEM 的解释。
- 激发单色器、发射单色器、狭缝带宽、光栅角色散。
- 光源光谱、激发通量校正、检测器响应校正。
- PMT、CCD、硅光电探测器、暗电流、读出噪声、饱和、线性范围。
- 90° 直角采集、前表面几何、透射几何、反射/散射风险。
- 瑞利散射、拉曼散射、杂散光、二级衍射、截止滤光片。
- 内滤效应、重吸收、浊度、温度、pH、猝灭、浓度线性。
- 荧光量子产率、摩尔吸光系数、brightness、吸收路径长度。
- 公开数据复用、NIST/USGS/IUPAC/厂商资料的使用边界和许可。

不允许写“看起来科学”的模糊句子来绕过不确定性。遇到不确定点时，执行：

1. 查询可靠来源。
2. 记录来源和具体结论。
3. 标明实现是定量、半定量、定性还是纯教学示意。
4. 若证据不足，保守处理并在 UI 中明确边界。

### 2.2 证据链必须落盘

新增或修改科学内容时，维护一个研究日志，例如：

`docs/instrument-research-log.md`

每条记录至少包含：

```md
## Claim: 狭缝变宽会提高通光量但降低光谱分辨率

- Date checked: YYYY-MM-DD
- Source(s): URL / DOI / manual page / standard / official documentation
- Evidence summary: 用自己的话概括，不长篇复制。
- Implementation boundary: 用于教学诊断；不声称复现某认证仪器的仪器函数。
- Code / UI touched: instrument/sim/physics/monochromator.mjs, instrument/index.html
- Confidence: high / medium / low
```

### 2.3 合成模型和来源数据永远分开

合成仪器模型可以被滑块控制。公开来源数据只能作为 display-only 示例，除非已经完成来源、许可、轴、处理方式和声明边界核验。

禁止让用户产生以下误解：

- 页面正在测量真实样品。
- 滑块能控制 NIST、USGS、论文或任何公开来源谱图。
- 当前输出是校准过的绝对强度。
- 当前模型能用于真实仪器设计、采购、定量分析或样品结论。

### 2.4 少写字，让系统自己说物理

当前页面的问题不是缺少边界，而是边界说明挤占了操作舞台。重构后应优先显示“操作 → 后果”的反馈。

长说明进入：

- `Model boundary / 模型边界`
- `Corrections & artifacts / 校正与伪影`
- `Sources / 来源数据`
- `About the model / 模型说明`

主工作区只保留短句、诊断、状态和交互。

### 2.5 可访问、可降级、可维护

- 所有控制项有 label、单位、范围、键盘可操作性和屏幕阅读器可理解文本。
- 没有 JS 时保留静态概念图和清楚提示。
- 3D 模型必须可选、可降级；2D 或 SVG 光路是可靠主干。
- 动效尊重 `prefers-reduced-motion`。
- 不引入沉重依赖，除非对教学价值和维护成本有明确收益。

---

## 3. 目标系统形态

### 3.1 信息架构

重构后的页面建议采用：

```text
Hero
  标题：Fluorescence Instrument Lab / 荧光仪器可视化实验室
  一句话：拖动控制项，观察光路、选通波长和谱图如何一起变化。
  边界徽章：Conceptual / Synthetic / Not calibrated / Sources separated

Main workbench
  左侧：2D/3D 光路视图
  右侧：核心控制面板 + 实时诊断 + 谱图

Tabs / Panels
  1. Instrument model / 仪器模型
  2. Source-derived examples / 来源谱图示例
  3. Corrections & artifacts / 校正与伪影
  4. Model boundary / 模型边界
  5. References / 参考依据
```

首屏不应被长免责声明淹没。免责声明保留，但变成结构化边界层。

### 3.2 首页级文案建议

首屏可使用类似文案：

```text
拖动一个控制项，观察荧光分光光度计的光路、选通波长和谱图如何联动。
这是教学模型，不是真实仪器控制；公开来源谱图只用于展示，不受模拟滑块控制。
```

英文对应：

```text
Move one control and watch the optical path, selected wavelengths, diagnostics, and synthetic trace respond together.
This is a teaching model, not real instrument control. Source-derived spectra are display-only and separate from the simulator.
```

### 3.3 语言策略

当前中英双语常驻会天然让说明翻倍。实现一个轻量语言策略：

- 默认根据页面现状选择双语或中文，但必须提供切换：`中文 / English / 双语`。
- 控制项和诊断支持短双语。
- 长说明在单语模式下只显示对应语言。
- 语言选择持久化到 localStorage。
- 没有 JS 时仍显示可读内容。

---

## 4. 物理模型目标

### 4.1 模型层级

不要把系统一次性做成严肃仪器仿真器。采用分层模型，既能教学，又能防止伪精确。

| Level | 名称 | 目标 | UI 声明 |
|---|---|---|---|
| v0 | Conceptual skeleton | 保留当前概念模型能力 | 示意合成谱图 |
| v1 | Instrument response | 加入光源、狭缝、响应曲线、噪声、饱和 | 教学仪器响应，不校准 |
| v2 | Sample physics | 加入吸收、发射、量子产率、浓度、内滤风险 | 半定性样品模型 |
| v3 | Geometry modes | 90°、前表面、透射几何切换 | 几何示意，不做真实光线追迹 |
| v4 | Correction literacy | raw/corrected 视图和校正解释 | 展示校正思想，不输出认证结果 |

默认可以停在 v1-v2 的可靠版本；v3-v4 若证据和时间足够再完整实现。若实现不完整，要做清楚的 UI 边界。

### 4.2 仪器响应链

目标是把当前“预设样品高斯峰 + 控制项”升级为清楚的信号链：

```text
source spectrum
  -> excitation monochromator bandpass
  -> sample absorption / brightness
  -> fluorescence generation
  -> geometry collection
  -> emission monochromator bandpass
  -> detector spectral responsivity
  -> electronics, saturation, integration, noise
  -> raw synthetic trace
  -> optional conceptual correction view
```

建议的教学公式：

```text
S_raw(λ_em | λ_ex)
= G · t_int · I0(λ_ex)
  · T_ex(λ_ex, slit_ex)
  · A_sample(λ_ex, c, L)
  · Φ
  · F_sample(λ_em)
  · T_em(λ_em, slit_em)
  · R_det(λ_em)
  · Ω_geom
  · C_bandpass
  + B_scatter
  + B_stray
  + B_dark
  + noise
```

其中每一项都必须有清楚边界：

- `I0`：归一化光源谱功率，不是某品牌灯的真实校准谱。
- `T_ex/T_em`：教学单色器通量和带宽模型。
- `A_sample`：样品吸收近似，可由归一化吸收谱或简化 Beer-Lambert 项表示。
- `Φ`：教学量子产率参数，不用于真实定量。
- `F_sample`：归一化发射谱形。
- `R_det`：归一化检测器响应。
- `Ω_geom`：几何收集因子。
- `C_bandpass`：仪器函数卷积，体现狭缝导致峰变宽。
- `B_scatter/B_stray/B_dark/noise`：教学伪影和噪声，不做真实仪器认证。

### 4.3 扫描模式行为

必须支持并解释：

1. **Emission scan / 发射扫描**
   固定激发波长，扫描发射单色器。谱形主要来自样品发射谱、发射单色器带宽和检测器响应。

2. **Excitation scan / 激发扫描**
   固定发射波长，扫描激发单色器。曲线受样品吸收/激发谱、光源谱功率、激发通量和固定发射通道共同影响。

3. **Time / kinetic scan / 时间扫描**
   固定激发和发射通道，显示合成强度随时间变化。明确不是荧光寿命测量。

4. **Single-point monitor / 单点监测**
   固定激发和发射通道，显示稳定读数和诊断。

### 4.4 样品预设

样品预设应从硬编码迁移为数据文件，例如：

```text
instrument/data/samples/*.json
```

建议 schema：

```json
{
  "id": "rhodamine6g-teaching",
  "label": {
    "en": "Rhodamine 6G-like teaching preset",
    "zh": "类 Rhodamine 6G 教学预设"
  },
  "claimLevel": "synthetic-teaching",
  "absorption": {
    "type": "gaussian-mixture",
    "peaks": [
      { "centerNm": 530, "fwhmNm": 36, "amplitude": 1.0 }
    ]
  },
  "emission": {
    "type": "gaussian-mixture",
    "peaks": [
      { "centerNm": 565, "fwhmNm": 42, "amplitude": 1.0 }
    ]
  },
  "quantumYieldTeaching": 0.75,
  "concentrationRelative": 0.25,
  "innerFilterRisk": "medium",
  "notes": {
    "en": "Synthetic teaching preset, not a real calibrated spectrum.",
    "zh": "合成教学预设，不是真实校准谱图。"
  },
  "sources": []
}
```

若使用真实材料名，需要谨慎：真实材料名容易让人误以为是实测谱图。可以使用：

- `narrow blue emitter teaching preset`
- `green fluorophore-like teaching preset`
- `broad humic-like teaching preset`
- `blank / background-dominant`
- `scattering sample`

真实名称仅在来源和边界充分时使用。

### 4.5 光源预设

建议加入：

- `ideal-flat`：平坦教学光源。
- `xenon-like`：宽带、UV-Vis 归一化形状，明确不是某灯校准数据。
- `led-365`：窄带 LED 教学源。
- `led-405`：窄带 LED 教学源。

如果使用真实灯谱，必须确认数据来源和许可。

### 4.6 检测器预设

建议加入：

- `ideal-flat`
- `pmt-like-visible`
- `silicon-like`

响应曲线默认用归一化教学曲线，不声称代表具体型号。

加入教学参数：

- dark current / dark baseline
- read noise
- shot noise
- saturation threshold
- linear range warning
- integration time scaling

噪声默认可关或用固定 seed，以保证演示可复现。

### 4.7 狭缝和仪器函数

狭缝不应只改变“峰宽文字”，而应进入谱图计算：

- 用高斯或近似三角仪器函数表示 bandpass。
- `FWHM_nm = f(slit_um, grating_dispersion, optical_factor)`，若无真实常数，使用教学映射并明确边界。
- 对样品谱进行卷积，表现峰变宽、峰高下降或面积近似保持的教学效果。
- 通光量随狭缝增加而上升，但要设置合理上限和饱和风险。

### 4.8 散射和伪影

在教学模式中可加入：

- Rayleigh scattering near `λ_em = λ_ex`。
- Second-order / stray-light warning，若实现必须查证并明确边界。
- Water Raman shift 可作为高级可选项；若不确定，不实现，只在边界说明。
- Blank/background-dominant 样品应显示基线和散射，而不是假装有发射峰。

### 4.9 内滤效应

内滤效应不应被轻率做成定量结论。推荐先做“风险诊断”：

```text
concentrationRelative ↑ or absorption at λ_ex ↑
  -> inner-filter risk: low / medium / high
  -> diagnostic: excitation attenuation and reabsorption may distort intensity and bandshape
```

若要实现简化公式，必须先查资料并记录：

- 公式来源。
- 适用几何。
- 适用吸光度范围。
- 为什么只是教学近似。

### 4.10 几何模式

实现三个概念几何：

1. `right-angle-90`
   默认。适合透明、稀释样品的教学心智模型。

2. `front-face`
   用于浓、浑浊、固体、表面样品的概念说明。不要声称真实前表面光学对准，除非真的实现了可解释的几何模型。

3. `transmission` 或 `inline`
   可选。用于说明为什么直接透射方向会带来激发光背景风险。

每个几何模式至少影响：

- 光路图。
- 收集因子。
- 背景/散射风险。
- 适用样品提示。
- 模型边界说明。

---

## 5. 代码架构建议

### 5.1 目录建议

保持静态模块风格，除非仓库整体约束允许更大变更。

```text
instrument/
  index.html
  README.md or MODEL.md
  data/
    manifest.json
    samples/
      *.json
    sources/
      *.json
    detectors/
      *.json
    schemas/
      sample.schema.json
      source.schema.json
      detector.schema.json
  sim/
    app.mjs
    state.mjs
    ui/
      controls.mjs
      diagnostics.mjs
      language.mjs
      spectrumPlot.mjs
      opticalBench2d.mjs
      opticalBench3d.mjs
      sourceExamples.mjs
    physics/
      math.mjs
      grating.mjs
      monochromator.mjs
      instrumentFunction.mjs
      source.mjs
      detector.mjs
      sample.mjs
      geometry.mjs
      artifacts.mjs
      correction.mjs
      radiometry.mjs
      scan.mjs
    data/
      loaders.mjs
      validators.mjs
    tests/
      physics.test.mjs
      data.test.mjs
      model-invariants.test.mjs
```

若现有目录不同，不要机械重命名；先分析依赖关系，再做最小但清晰的迁移。

### 5.2 模块原则

- `physics/*` 必须尽量纯函数化。
- `state.mjs` 只管理状态、派生状态和 reducer，不混 UI DOM 操作。
- `ui/*` 只负责渲染和事件绑定。
- `data/*` 负责加载、校验、来源边界。
- 谱图计算可测试、可复现。
- 任何随机噪声必须可 seed。
- 所有单位写进变量名或 JSDoc，例如 `wavelengthNm`, `slitUm`, `integrationMs`。

### 5.3 状态模型建议

```js
const state = {
  mode: 'emission',
  language: 'zh',
  wavelengths: {
    excitationNm: 365,
    emissionNm: 520
  },
  monochromators: {
    excitation: { slitUm: 500, gratingAngleDeg: 12.8 },
    emission: { slitUm: 500, gratingAngleDeg: 18.5 }
  },
  source: { id: 'xenon-like', intensity: 1.0, offsetUm: 0 },
  detector: { id: 'pmt-like-visible', gain: 1.0, angleDeg: 90 },
  sample: { id: 'green-fluorophore-like', concentrationRelative: 0.25 },
  geometry: { id: 'right-angle-90' },
  display: {
    spectrumView: 'raw',
    showNoise: true,
    showArtifacts: true,
    showAdvanced: false
  }
};
```

### 5.4 派生状态建议

`deriveInstrumentState(state)` 输出：

```js
{
  scanAxis: { label, unit, minNm, maxNm, points },
  fixedChannel: { label, wavelengthNm },
  bandpass: { excitationFwhmNm, emissionFwhmNm },
  throughput: { excitation, emission, total },
  sample: { absorptionAtEx, emissionAtEm, brightness, innerFilterRisk },
  geometry: { collectionFactor, backgroundRisk, notes },
  detector: { responseAtEm, darkBaseline, saturationRisk },
  artifacts: { rayleighRisk, ramanRisk, strayLightRisk },
  diagnostics: [
    { severity: 'info' | 'warn' | 'danger', label, body, evidenceKey }
  ],
  spectrum: {
    x: number[],
    raw: number[],
    corrected?: number[],
    components?: Record<string, number[]>
  }
}
```

Diagnostics 应是第一等公民，不是 UI 临时拼字符串。

---

## 6. UI / UX 细化

### 6.1 主控制项

默认只展示 4-6 个核心控制项：

- Mode / 模式
- Excitation wavelength / 激发波长
- Emission wavelength / 发射波长
- Slit width / 狭缝宽度
- Integration time / 积分时间
- Sample preset / 样品预设

高级控制折叠：

- Source type / 光源类型
- Detector type / 检测器类型
- Detector angle / 检测角
- Geometry mode / 几何模式
- Source offset / 光源偏移
- Noise / artifacts toggles
- Raw / corrected view

### 6.2 实时诊断卡

控制项变化时，显示后果而不是长篇理论。

例：狭缝变宽：

```text
Slit opened / 狭缝变宽
Signal ↑
Bandpass ↑
Peak resolution ↓
Saturation risk: medium
```

例：激发波长移动：

```text
Excitation moved / 激发通道改变
Source output at Ex: 64%
Sample absorption match: 72%
Current trace remains synthetic, not calibrated.
```

例：检测角偏离 90°：

```text
Detector arm offset / 检测臂偏离
Collection factor ↓
Direct excitation / scatter risk ↑
Wavelength selection unchanged.
```

### 6.3 谱图视图

至少支持：

- raw synthetic trace
- optional corrected teaching trace
- component overlay 开关：sample emission、detector response、scatter/background、noise envelope
- 坐标轴单位清晰
- a.u. 标记清晰
- 当前模式和固定通道显示清楚

不要默认展示过多曲线。默认干净，高级开关展开。

### 6.4 来源数据示例

公开来源数据区域必须明显与仿真器分开。

建议加入“数据边界条”：

```text
Display-only source example. It does not respond to the instrument controls above.
```

展示 manifest 中的：

- source
- DOI / URL
- license
- processing
- source file
- claim boundary
- axes
- normalization / downsampling notes

如果 manifest 缺字段，先补数据模型，不要模糊展示。

---

## 7. 并行子代理策略

允许使用 Codex app 的并行线程、isolated worktrees 或子代理。建议总协调线程负责集成和验收，其他代理并行探索。每个代理必须提交可审查结果，不直接把未经验证的东西混入主线。

### 7.1 Orchestrator / 总协调代理

职责：

- 读仓库规则。
- 建立任务板和验收清单。
- 分派子任务。
- 合并各代理结论。
- 防止科学声明失控。
- 最终跑完整 QA。

### 7.2 Repo Cartographer / 仓库制图代理

职责：

- 梳理 `/instrument/` 文件、依赖、CSS、数据流。
- 画出现状架构。
- 标出可安全重构点和高风险点。
- 输出 `docs/decisions/` 或临时分析文档。

### 7.3 Fluorescence Physics Researcher / 荧光仪器理论代理

职责：

- 查证仪器响应链、单色器、狭缝、校正、几何、散射、内滤效应。
- 优先使用 NIST、IUPAC、USGS、标准、厂商手册、同行评议文献。
- 维护 `docs/instrument-research-log.md`。
- 给实现代理提供保守公式和边界文案。

### 7.4 Radiometry & Model Engineer / 辐射度与模型实现代理

职责：

- 实现 `physics/*` 纯函数模块。
- 写模型不变量测试。
- 确保所有参数单位明确。
- 保证模型输出平滑、可复现、不会出现 NaN、负强度或奇怪跳变。

### 7.5 UI / IA Designer / 信息架构与界面代理

职责：

- 精简主界面文字。
- 实现标签页、折叠边界、诊断卡、语言切换。
- 保证首屏“能操作”。
- 保持视觉风格与站点设计系统一致。

### 7.6 Visualization Engineer / 光路与谱图代理

职责：

- 维护 2D/3D 光路。
- 确保 3D 可选、性能可控、失败可降级。
- 优化谱图绘制、组件叠加、坐标轴和可访问文本。

### 7.7 Data Provenance Guardian / 数据来源与许可代理

职责：

- 审核 `instrument/data/manifest.json`。
- 补齐来源、许可、处理方式和 claim boundary。
- 阻止未核验公开数据进入图表。
- 维护数据 schema。

### 7.8 QA / Accessibility / Performance 代理

职责：

- 运行 `python tools/check_site.py`。
- 启动 `python tools/serve.py` 做浏览器 QA。
- 做键盘、屏幕阅读器语义、移动端、reduced motion、无 JS fallback 检查。
- 记录 Lighthouse 或等价性能检查结果。

### 7.9 Scientific Copy Editor / 科学文案代理

职责：

- 把长说明改成短诊断。
- 检查中英一致性。
- 删除伪精确、过度承诺和重复免责声明。
- 确保每个科学声明能在研究日志中找到依据。

---

## 8. 推荐实施阶段

### Phase 0：基线与证据

完成：

- 读取仓库规则。
- 启动本地预览。
- 跑现有检查。
- 截取或记录当前 `/instrument/` 状态。
- 梳理当前模型数据流。
- 创建 `docs/instrument-research-log.md` 初版。

不得跳过。先摸清地形再开挖，别把光栅当门把手拧。

### Phase 1：信息架构瘦身

完成：

- 首屏重构为 hero + workbench。
- 说明压缩到 tabs / disclosure。
- 来源数据区域独立。
- 静态初始值中的 `0%`, `0.00` 等误导读数改成 `--` 或 loading 状态。
- 添加语言切换框架。

### Phase 2：物理模型模块化

完成：

- 新增或重构 `source.mjs`, `detector.mjs`, `sample.mjs`, `geometry.mjs`, `artifacts.mjs`, `instrumentFunction.mjs`, `radiometry.mjs`, `scan.mjs`。
- 保留现有功能，不造成页面断裂。
- 增加模型不变量测试。
- 输出 `instrument/MODEL.md`，解释模型、公式、边界。

### Phase 3：仪器响应链接入 UI

完成：

- 控制项驱动派生状态。
- 诊断卡由派生状态生成。
- 谱图显示 raw synthetic trace。
- 可选 corrected teaching trace。
- 光路颜色、选通波长、谱图、诊断联动。

### Phase 4：几何和伪影

完成：

- 90° 几何默认。
- front-face / transmission 作为高级模式或边界模式。
- 散射、背景、内滤风险、饱和风险进入诊断。
- 若实现 Rayleigh/Raman/stray light 曲线，必须有研究日志依据。

### Phase 5：来源数据和许可整理

完成：

- manifest schema 清晰。
- 来源示例不受仿真滑块控制。
- 每个数据集显示来源、许可、处理方式、边界。
- 未核验数据不展示。

### Phase 6：QA 和 polish

完成：

- Browser QA。
- 键盘操作。
- 移动端布局。
- reduced motion。
- 无 JS fallback。
- 性能检查。
- 站点检查。
- 科学文案审查。
- 研究日志和决策记录更新。

### Phase 7：最终验收

完成：

- 写最终变更摘要。
- 列出修改文件。
- 列出运行过的命令。
- 列出仍未解决的边界或后续任务。
- 明确哪些功能是概念、哪些是半定性、哪些未实现。

---

## 9. 验收标准 / Definition of Done

只有当以下条件满足，目标才算完成。

### 9.1 产品体验

- `/instrument/` 首屏是交互工作台，不是说明墙。
- 用户能在 30 秒内理解：改一个控制项会让光路、谱图和诊断变化。
- 合成谱图和来源数据区域清楚分离。
- 说明文字减少，但科学边界没有消失。
- 中英切换可用，或至少双语显示被有效整理。

### 9.2 科学模型

- 有清楚的仪器响应链。
- 光源、单色器、样品、几何、检测器、噪声/伪影至少在 v1 层级有模块化表示。
- 狭缝影响进入谱图形状和诊断。
- 激发扫描不被错误呈现为纯样品响应。
- 时间扫描明确不是荧光寿命。
- 内滤效应、几何、校正、散射等边界不夸大。

### 9.3 证据和文档

- `docs/instrument-research-log.md` 存在并覆盖新增科学声明。
- `instrument/MODEL.md` 或等价文档说明公式、参数、边界。
- 重大架构和内容决策进入 `docs/decisions/`。
- 所有来源数据有 manifest 记录。
- 没有未核验真实数据被绘图。

### 9.4 工程质量

- 不破坏静态站点约束。
- JS 控制台无明显错误。
- 无 NaN、Infinity、负强度泄露到 UI。
- 模型函数有测试或等价验证。
- `python tools/check_site.py` 通过，除非已有非本任务导致的已知问题，并需记录。
- 本地预览可运行。

### 9.5 可访问性和性能

- 关键控制项可键盘操作。
- 表单 label 完整。
- Canvas/SVG/3D 有文本替代或说明。
- reduced motion 生效。
- 移动端可用。
- 3D 加载失败时页面仍可教学。

### 9.6 真诚边界

- 页面没有暗示真实仪器控制。
- 页面没有暗示输出是校准测量。
- 页面没有暗示公开数据由滑块生成。
- 页面没有编造样品、仪器、校准、来源或实验结论。

---

## 10. 推荐查证来源种子

优先从以下类型来源开始，但不要局限于这些。资料过时、范围不合或互相冲突时，继续查证。

### 10.1 官方 / 标准 / 权威资料

- NIST fluorescence correction standards and SRM materials
  https://www.nist.gov/programs-projects/relative-intensity-correction-standards-fluorescence-and-raman-spectroscopy

- NIST / ASTM-style practice for relative spectral correction factors of emission signal in fluorescence spectrometers
  https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913001

- NIST fluorescence spectrometer qualification / recommendations documents
  Search NIST Publications for fluorescence spectrometer correction, excitation correction, emission correction, front-face geometry.

- IUPAC Gold Book: inner filter effect
  https://goldbook.iupac.org/terms/view/I03047

- IUPAC Gold Book: brightness
  https://goldbook.iupac.org/terms/view/BT07338

- USGS field techniques for fluorescence measurements targeting DOM, wastewater, and hydrocarbons
  https://pubs.usgs.gov/publication/tm1D11/full

- USGS turbidity / fDOM sensor correction work
  Search current USGS Publications for fDOM fluorescence turbidity correction.

### 10.2 Vendor educational sources and manuals

Use vendor sources for instrument architecture and practical descriptions, but avoid turning marketing claims into general scientific truth.

- HORIBA: fluorescence measurement basics
  https://www.horiba.com/int/scientific/technologies/fluorescence-spectroscopy/what-is-a-fluorescence-measurement/

- HORIBA / Edinburgh / JASCO / Agilent / Shimadzu manuals or technical notes for excitation/emission correction, PMT response, slits, monochromators, EEMs.

### 10.3 Peer-reviewed sources

Use peer-reviewed papers when official sources do not answer a detailed modeling question, especially for:

- Inner-filter correction approximations.
- Quantum yield measurement protocols.
- EEM scatter masking.
- Fluorescence correction methods.
- Turbidity and temperature effects.

Record DOI and scope.

---

## 11. Anti-patterns to avoid

Do not do any of the following:

- Add more paragraphs to solve the “too much explanation” problem.
- Put every caveat in the hero.
- Make the model look calibrated by using overly precise numbers.
- Use real material names for synthetic presets without boundaries.
- Plot public data without license and processing notes.
- Copy long chunks from standards, manuals, or papers.
- Introduce a large framework just to organize a single static page.
- Hide scientific uncertainty from users.
- Treat vendor marketing copy as a standard.
- Make 3D graphics the only way to understand the system.
- Let parallel agents merge incompatible assumptions.

---

## 12. Suggested final report format for Codex

At the end, report in this structure:

```md
# Final Report: Instrument Lab Refactor

## Outcome
- One paragraph summary.

## Major changes
- IA / UI
- Physics model
- Data provenance
- Accessibility / performance
- Documentation

## Science evidence added
- List research-log entries and sources.

## Validation run
- Commands run
- Browser QA performed
- Known limitations

## Files changed
- Important files and why.

## Remaining risks / next tasks
- Only honest unresolved items.
```

---

## 13. Compact implementation compass

When lost, return to this compass:

```text
操作优先。
边界清楚。
物理链完整。
来源可追踪。
模型可测试。
不懂先查。
宁可保守，不要伪精确。
```
