# personalweb.md

> 版本：v0.2  
> 日期：2026-04-18  
> 用途：`yscjrh.github.io` 个人品牌网站蓝图 + Codex app 自主执行说明  
> 备注：GitHub Pages 用户站仓库名应使用小写形式，因此本蓝图统一以 `yscjrh.github.io` 作为规范仓库名。  
> 更新：v0.2 增加与 `AGENTS.md` v0.2 配套的子代理（subagents）启用规则、默认模型策略、并行边界与停止条件。  
> 适用对象：你本人、Codex app、以及后续在网页版 GPT 5.4 Pro 中参与策略讨论的你我双方。

---

## 0. 本文档的定位

这不是网站文案稿，而是**网站产品蓝图 + Codex 的执行契约**。

目标不是让用户手工搭网站，而是让 Codex app 在本地仓库中尽可能自主地完成以下工作：

1. 读取蓝图，理解网站目标与边界  
2. 先规划，再实现  
3. 在仓库内创建和维护必要文件  
4. 对复杂、读多写少、边界清楚的任务，按规则启用 bounded subagents 进行并行审查、探索、QA 或诊断  
5. 本地预览、自检、修正、提交  
6. 将可持续迭代的网站发布到 GitHub Pages  
7. 当问题超出边界时，暂停并生成一份清晰的问题摘要，交由网页版 GPT 5.4 Pro 讨论

### 0.1 v0.2 变更摘要

本版主要补充子代理治理规则，使 `personalweb.md` 与新版 `AGENTS.md` 保持一致：

- 明确子代理不是默认“越多越好”，而是用于有边界的并行探索、审查和诊断。
- 明确父代理始终是最终整合者和决策者。
- 明确默认子代理模型为 `gpt-5.4`，reasoning effort 为 `high`。
- 明确默认子代理只读，最多允许一个写入代理。
- 明确不允许递归子代理、无边界 fan-out、多个代理同时写同一文件。
- 明确如果子代理在个人事实、品牌方向、架构或部署上产生冲突，应暂停并生成 blocker brief。

---

## 1. 给 Codex 的执行指令（最重要）

> 只要你是 Codex，并且正在这个仓库里工作，就先完整阅读本文件，再开始任何规划或编码。

### 1.1 默认工作方式

- 把我视为“长期协作者”，而不是一次性问答助手。
- 对复杂任务先做计划，再实现。
- 对多阶段任务，不要每做一步都停下来索要“下一步指示”；除非触发暂停条件，否则应自主推进。
- 每个阶段结束时，主动给出：
  - 已完成内容
  - 改动文件
  - 运行过的命令
  - 验证结果
  - 剩余风险 / 待确认事项

### 1.2 文档优先级与分工

如果后续仓库内同时存在 `personalweb.md`、`AGENTS.md`、`PLANS.md`，先理解它们的分工：

- `personalweb.md`：网站产品蓝图、品牌定位、信息架构、长期方向和公开表达边界。
- `AGENTS.md`：Codex 的具体执行协议，包括工具使用、验证方式、子代理、自动化、权限和停止条件。
- `PLANS.md`：当前阶段的执行计划，不应覆盖上面两个文件的长期约束。

优先级如下：

1. 最新的用户直接指令
2. `personalweb.md` 中关于品牌、公开事实、个人身份表达、网站长期方向的规则
3. `AGENTS.md` 中关于 Codex 执行、安全、子代理、验证、写权限和暂停条件的规则
4. `PLANS.md`
5. 现有代码与旧文档

如果冲突发生在品牌方向、公开事实、个人身份表达上，以 `personalweb.md` 为准并暂停上报。  
如果冲突发生在执行方式、子代理调度、写权限、验证方式上，以 `AGENTS.md` 的更具体规则为准。  
如果无法判断冲突类型，先生成 blocker brief，不要一边实现一边猜。

### 1.3 Codex 的第一项仓库内任务

Codex 进入仓库后的第一个稳定动作应当是：

1. 读取 `personalweb.md`
2. 生成或更新 `AGENTS.md`
3. 若 `AGENTS.md` 已包含子代理规则，不得删除或弱化这些规则
4. 若任务跨多个里程碑或预计需要较长时间，生成 `PLANS.md`
5. 判断本轮任务是否适合启用子代理；若适合，只能按第 12A 节和 `AGENTS.md` 的规则启用
6. 再开始正式实现

### 1.4 子代理使用原则摘要

本项目允许 Codex 在边界清楚、收益明确的任务中启用子代理，但子代理不是默认越多越好。

战略原则如下：

- `personalweb.md` 只定义子代理的高层使用原则；具体执行细则以 `AGENTS.md` 为准。
- 子代理适合用于并行审查、仓库探索、视觉 QA、SEO / metadata 检查、可访问性检查、链接检查、文案真实性审查等读多写少的工作。
- 子代理不适合用于简单单文件修改、无边界头脑风暴、多个代理同时修改同一文件、部署 / 域名 / 隐私 / 账户相关任务。
- 父代理始终是最终整合者和决策者。子代理输出建议，父代理负责筛选、合并、实施和验证。
- 默认子代理应为只读审查者或探索者；同一时间最多一个写入代理。
- 默认所有子代理使用最强模型：`gpt-5.4`，并使用 high reasoning。除非用户明确要求优先速度或成本，否则不得默认降级到更轻模型。
- 若子代理之间对品牌方向、公开事实、架构迁移或发布行为产生冲突，应暂停并生成 blocker brief，而不是继续猜测。

---

## 2. 工作流总原则

这个项目采用如下分工：

### 2.1 我（站点拥有者）负责

- 给出长期方向与核心身份
- 审核高层定位是否偏航
- 提供真实材料：研究方向、项目、笔记、联系方式
- 在关键分叉口做最终决定

### 2.2 Codex app 负责

- 将蓝图转成可执行计划
- 根据第 12A 节判断是否启用 bounded subagents
- 进行仓库脚手架搭建
- 实现页面、样式、交互和部署配置
- 做本地预览、差异检查、基础 QA
- 根据仓库内容持续重构与优化
- 维护 `AGENTS.md` / `PLANS.md` / 发布说明
- 在不触发暂停条件的前提下自主推进

### 2.3 网页版 GPT 5.4 Pro 负责

当出现下列问题时，Codex 不应强行拍板，而应整理一份问题摘要，再交给网页版 GPT 5.4 Pro 讨论：

- 品牌定位不清，首页叙事摇摆
- 视觉方向分歧较大
- 需要对外表达可能影响个人长期形象
- 出现难解的技术架构权衡
- 存在真实性风险（例如缺少真实内容、容易误写成夸大描述）
- 需要做 SEO / 信息架构 / 公共表达层面的高层判断

---

## 3. 网站的核心定位

### 3.1 网站不是“公司官网”

这是一个**研究者 + 构建者型个人品牌站**，不是泛 SaaS 官网，也不是纯学术简历页。

### 3.2 网站要传达的主身份

我处在三个维度的交叉点：

1. **荧光分析研究者**  
2. **开源工具构建者**  
3. **记录想法、实验和判断的思考者**

### 3.3 推荐的一句话定位

优先围绕这条主线表达：

> 我在荧光分析、智能算法与科学仪器之间工作，也把一部分方法与工作流做成开源工具。

这句话可以作为首页 Hero 的语义基底，但不是唯一文案。Codex 可以在不改变核心意义的前提下，推导更适合网页首屏的版本。

### 3.4 应有气质

- 冷静
- 准确
- 技术可信
- 有研究感
- 有个人风格
- 不浮夸

### 3.5 应避免的气质

- 泛 AI 营销腔
- 空泛励志风
- 过度公司化
- 过度包装
- 模糊不清的“我做很多事”

---

## 4. 目标受众

网站至少服务四类访客：

1. **科研同行 / 潜在合作者**  
   他们关心我研究什么、方法能力在哪里、是否值得合作。

2. **技术型访客 / 开发者**  
   他们关心我做过什么开源项目、代码方向、技术品味。

3. **潜在项目使用者**  
   他们可能从 GitHub 或搜索结果来到这里，希望快速理解项目和作者。

4. **未来可能的合作方**  
   他们关心我的交叉能力是否清晰、可信、可持续。

---

## 5. 网站阶段性目标

### Phase 1：建立可信、清晰的单页站

首版只需要做成一个**质量高的单页主页**，不要过早做复杂站点系统。

必须包含：

- Hero
- Research
- Build
- Notes
- About / Contact

### Phase 2：从单页扩展到多页

当内容积累起来后，再考虑拆分：

- `/projects/`
- `/notes/`
- `/about/`
- `/research/`

### Phase 3：持续打磨和自动维护

- 更新代表项目
- 增加案例和笔记
- 对文案、结构、SEO 做小步快跑优化
- 使用 Codex automations 做例行检查

---

## 6. 信息架构（首版必须遵循）

首版页面结构固定为以下顺序，除非有明确理由，否则不要改变：

1. **Hero**
2. **Research**
3. **Build**
4. **Notes**
5. **About / Contact**

### 6.1 Hero

任务：让第一次访问的人在 5–10 秒内知道“你是谁”。

Hero 至少要包含：

- 一句定位
- 一句补充说明
- 1 个主要行动按钮（如：查看 GitHub）
- 1 个次要行动按钮（如：浏览项目 / 了解研究方向）

### 6.2 Research

不要做成纯论文清单。  
应当优先展示三条能力主线：

- 荧光分析
- 荧光分析 × 智能算法
- 荧光仪器研制

每个模块应当回答：

- 我关注什么问题
- 我具备什么能力
- 为什么这件事重要

如果细节不足，允许用高层概述；**不允许编造论文、专利、奖项、数据。**

### 6.3 Build

Build 区块要体现：**我不仅做研究，也把方法和判断做成真实工具。**

优先展示当前公开仓库中的代表项目。  
首版推荐的展示优先级：

1. `ai-visibility-auditor`
2. `codex-via-phone`
3. `skylattice`
4. `mirror-sim`
5. `create-double-skill`（可作为实验性项目或后排项目）

展示方式应优先采用项目卡片，而不是一长串列表。

### 6.4 Notes

Notes 不要做成“杂物区”。  
建议命名可在以下中选择：

- Notes
- Field Notes
- Lab Notes
- Working Notes

内容方向以三类为主：

- 研究思考
- 构建日志
- 未完成但值得记录的想法

首版即便只有 3–5 条占位内容，也可以上线。  
如果缺少成熟文章，可先用简短条目和“即将完善”方式承接。

### 6.5 About / Contact

内容应简洁：

- 简短自我介绍
- GitHub 链接
- 可公开的联系入口（只有在我明确提供后才展示邮箱）
- 可选：一句关于长期兴趣或工作方式的说明

---

## 7. 内容真实性规则（绝对约束）

Codex 必须遵守以下规则：

### 7.1 允许使用的信息来源

按优先级从高到低：

1. 用户直接提供的文本
2. 本仓库中的蓝图与内容文件
3. 用户公开 GitHub 仓库中已存在的描述
4. 用户确认过的页面文案

### 7.2 禁止行为

- 编造论文
- 编造奖项
- 编造项目 star / fork / 使用人数
- 编造工作经历
- 编造合作单位
- 编造联系方式
- 编造研究成果细节

### 7.3 缺信息时的正确做法

如果某部分缺少真实内容：

- 用更抽象但真实的描述代替
- 或明确标记为 `待补充`
- 或在内部 issue brief 中指出缺口

**不要为了让页面“完整”而虚构内容。**

---

## 8. 技术策略

### 8.1 首版技术栈

首版默认采用：

- 纯静态站
- `index.html`
- `styles.css`
- `script.js`
- `.nojekyll`

理由：

- 对 GitHub Pages 友好
- 无需复杂构建链
- 便于 Codex 快速实现和后续重构
- 便于我这个网站新手低成本维护

### 8.2 GitHub Pages 规则

首版应可直接发布到 GitHub Pages。  
入口文件优先使用 `index.html`。  
不要默认引入复杂框架。

### 8.3 何时允许升级框架

只有在满足以下条件之一时，才允许从纯静态站升级到 Astro 或其他静态站点生成器：

- Notes 数量明显增加
- 需要多页面和模板复用
- 需要双语结构
- 需要内容系统化管理
- 纯 HTML 维护成本已经明显上升

若要升级框架，必须先写 `PLANS.md`，说明迁移理由、收益、风险和回退方案。

### 8.4 不要做的事

首版不要做：

- 后端服务
- 用户登录
- 评论系统
- 表单收集敏感信息
- 第三方追踪分析脚本
- 复杂动画
- CMS
- 过早国际化
- 过早博客引擎化

---

## 9. 设计原则

### 9.1 视觉方向

首版视觉应接近：

- 技术型个人站
- 研究者主页
- 冷静的产品页面
- 有留白和排版感的作品集

可以参考的感觉是：

- 干净
- 稳定
- 字体层级清晰
- 不依赖炫技动画
- 移动端友好

### 9.2 不要长成这样

- 千篇一律的 AI SaaS 首页
- 密集卡片墙
- 过度渐变
- 强销售导向
- 看起来像模板市场套壳

### 9.3 页面观感要求

- 首屏必须清楚
- 留白要够
- 段落不要过长
- 项目卡片信息层级清晰
- 手机端不要拥挤
- 页脚要克制

---

## 10. 推荐的仓库结构

首版建议逐步形成如下结构：

```text
.
├── personalweb.md
├── AGENTS.md
├── index.html
├── styles.css
├── script.js
├── .nojekyll
├── assets/
│   ├── img/
│   └── icons/
├── content/
│   ├── bio.md
│   ├── research.md
│   ├── projects.md
│   └── notes/
├── docs/
│   └── decisions/
└── README.md
```

说明：

- `personalweb.md`：最高层蓝图
- `AGENTS.md`：Codex 运行说明
- `content/`：后续可扩展的真实内容来源
- `docs/decisions/`：记录关键设计/技术决策，方便日后回看

首版可以先不把所有目录都做满，但应预留可扩展空间。

---

## 11. Codex 的自主决策边界

### 11.1 可以自主决定的事项

以下事项，Codex 可在不额外询问的前提下自主决定：

- 具体 HTML 结构
- CSS 组织方式
- 页面布局和间距系统
- 卡片样式
- 按钮文案的细微措辞
- 响应式断点
- 文件拆分方式
- 基础交互（滚动、导航高亮、轻量动画）
- 使用 worktree 的任务拆分
- 按第 12A 节启用只读或单写入子代理
- 本地预览与自检方法
- Git commit 颗粒度

### 11.2 必须暂停并上报的问题

出现以下情况时，Codex 不得擅自继续：

- 需要公开邮箱但用户未提供
- 需要写入个人简历式细节但没有真实来源
- 想引入框架迁移
- 想加入追踪 / 分析 / 第三方脚本
- 想购买或绑定自定义域名
- 想加入表单、留言、认证、数据库
- 想重写品牌定位
- 想发布可能泄露隐私的信息
- 在多个视觉方向之间无法判断哪一个更适合
- 网站已实现，但核心叙事仍然模糊
- 想让多个子代理或线程同时写同一批文件
- 子代理之间对个人事实、品牌方向、技术架构或部署动作产生冲突

### 11.3 遇到阻塞时的输出格式

暂停时，应生成一个简短问题摘要，格式如下：

```md
## Blocker
- 问题：
- 影响范围：
- 已尝试：
- 备选方案 A：
- 备选方案 B：
- 我建议：
- 需要用户 / GPT 5.4 Pro 决定的点：
```

---

## 12. 在 Codex app 中的标准操作流

### 12.1 线程类型

建议默认使用四类主线程：

1. **Plan 线程**  
   负责信息架构、策略、文案方向

2. **Build 线程**  
   负责实现页面与样式

3. **QA 线程**  
   负责检查响应式、链接、可读性、命名、结构

4. **Polish 线程**  
   负责细化文案、视觉层级和体验优化

注意：这些是面向阶段性工作的主线程或 worktree 线程；子代理不是第五类长期线程，而是由父代理在特定任务中临时派生的 bounded reviewer / explorer / debugger。子代理完成任务后应返回摘要，由父代理整合，不应长期漂移成独立路线。

### 12.2 复杂任务先走 `/plan`

遇到下列任务时，先进入计划模式：

- 首次搭建网站
- 大规模重构
- 框架迁移
- 多页面拆分
- 双语化
- Notes 系统化
- 品牌文案大修

### 12.3 并行任务用 worktree

在同一仓库中并行推进不同方向时，优先使用 worktree：

- 一个 worktree 做结构和文案
- 一个 worktree 做视觉和 CSS
- 一个 worktree 做 QA / 可访问性检查

这样可以避免线程相互覆盖。

### 12.4 页面预览用 in-app browser

只要是在本地静态服务器或无需登录的页面上，就优先用 in-app browser 做可视检查。

检查重点：

- 首屏是否一眼能懂
- 布局是否失衡
- 手机端是否拥挤
- 文案是否过长
- 卡片是否难读
- 按钮是否明确

### 12.5 例行验证

每完成一个阶段，至少做这些检查：

- 页面能本地打开
- 链接不报错
- Git diff 可读
- 手机端基本可用
- 标题和 meta 信息存在
- 内容没有明显编造痕迹
- 结构与蓝图一致

---

## 12A. 子代理（Subagents）启用蓝图

本节定义 `personalweb.md` 层面的子代理策略。更具体的执行细则应写入并遵循 `AGENTS.md`。

### 12A.1 基本判断

子代理的价值在于把噪声较大的探索、审查、测试、日志分析和专项检查从主线程中分离出来，让主线程保留需求、约束、决策和最终输出。

但子代理不是默认越多越好。若任务边界不清、多个代理同时写同一文件、或只是泛泛地“多提意见”，子代理会增加 token 消耗、协调成本和结果冲突，反而削弱执行质量。

### 12A.2 Standing authorization

本项目允许 Codex 在满足本节规则时，自主启用 bounded subagents。

Codex 不必每次都询问“是否可以启用子代理”，但必须在启用前明确说明：

- 为什么此任务适合子代理
- 准备启用几个子代理
- 每个子代理的角色、范围和是否只读
- 是否等待所有子代理结果再继续
- 父代理如何整合结果

如果无法说清这些点，就不要启用子代理。

### 12A.3 适合启用子代理的任务

优先在这些场景中使用子代理：

- 多维度审查首版网站：文案、视觉、SEO、可访问性、真实性
- 页面上线前 QA：链接、metadata、响应式、公开信息边界
- 大改前仓库探索：一个代理梳理文件结构，一个代理审查内容来源
- UI 问题诊断：一个代理看渲染页面，一个代理看相关 HTML/CSS
- 框架迁移或多页化前的方案比较
- Notes / Projects 内容结构扩展前的风险盘点
- 自动化运行后的结果归因与轻量 triage

### 12A.4 不适合启用子代理的任务

以下任务默认不要启用子代理：

- 简单单文件改动
- 日常文案小修
- 格式整理
- 没有明确输出格式的 brainstorm
- 让多个代理同时重写首页
- 多个代理同时编辑 `index.html` / `styles.css`
- 涉及联系方式、隐私、账号、token、域名、部署权限的任务
- 需要补充个人履历、论文、机构、成果等事实但缺少来源的任务
- 任何会鼓励代理“猜测我是谁”的任务

### 12A.5 默认模型与推理强度

本项目的子代理默认使用最强模型：

```toml
model = "gpt-5.4"
model_reasoning_effort = "high"
```

不得默认降级到更快或更便宜的模型。只有当用户明确说“优先速度 / 成本”时，才可临时调整。

如果后续创建 `.codex/agents/` 下的自定义 agent 文件，应在每个相关 agent 文件中显式写入同样的模型策略，除非用户后来给出相反指令。

### 12A.6 并发上限

若项目引入 `.codex/config.toml`，建议采用：

```toml
[agents]
max_threads = 4
max_depth = 1
```

项目内实践默认值：

- 普通复杂任务：2 个子代理
- 较大审查：3 个子代理
- 未经用户额外批准的上限：4 个子代理
- 禁止嵌套子代理
- 禁止递归 delegation

选择 `max_threads = 4` 是项目级保守策略，不是因为 Codex 只能支持 4 个线程。它的目标是降低协调噪声，让个人站这种中小型项目保持可控。

### 12A.7 写权限规则

默认子代理只读。

推荐模式：

- 多个只读子代理分别审查不同问题，父代理综合后修改文件
- 一个只读探索代理先梳理文件，父代理或单个写入代理做小范围修改
- 一个浏览器/渲染审查代理负责页面现象，一个代码审查代理定位文件，父代理最终修复

禁止模式：

- 两个以上写入代理同时改同一文件
- 一个子代理改文案、另一个子代理同时改同一页面布局
- 子代理各自提交或推送
- 子代理绕过父代理直接决定品牌方向、公开事实或部署动作

如果确实需要并行写入实验，应使用不同 worktree，并由父代理统一比较、挑选和合并。

### 12A.8 父代理职责

父代理必须：

1. 定义子代理任务边界
2. 等待必要结果
3. 整理冲突与共识
4. 决定哪些建议可执行
5. 执行或指派唯一写入路径
6. 运行验证
7. 在总结中说明哪些建议被采纳、哪些被拒绝，以及理由

子代理提供输入，不负责最终方向。

### 12A.9 推荐子代理角色

在个人网站项目中，可优先使用这些窄角色：

```text
site_explorer
- read-only
- 梳理仓库结构、内容来源、受影响文件

copy_reviewer
- read-only
- 检查首页叙事、术语清晰度、真实性和是否过度营销

visual_qa
- read-only unless explicitly assigned
- 检查 spacing、层级、移动端、渲染页面问题

metadata_reviewer
- read-only
- 检查 title、meta description、Open Graph、链接、alt text、基础可访问性

implementation_worker
- write-enabled only when assigned
- 在父代理选定方案后，做最小、可验证的实现修改
```

不要创建泛泛的 “make_it_better_agent” 或 “creative_agent”。角色越窄，结果越可控。

### 12A.10 标准子代理提示词模板

父代理启用子代理时，应使用类似结构：

```text
Use bounded parallel subagents for this review.

Spawn:
1. copy_reviewer — read-only; review index.html and content files for clarity, truthfulness, and unsupported claims.
2. visual_qa — read-only; inspect styles.css and the rendered page for hierarchy, mobile layout, and obvious visual issues.
3. metadata_reviewer — read-only; inspect index.html for title, meta description, Open Graph, links, and accessibility basics.

All subagents must use gpt-5.4 with high reasoning.
Do not let subagents edit files.
Wait for all results.
Return one consolidated report with:
- confirmed issues
- file references
- recommended fixes
- disagreements or uncertainty
- which fixes the parent agent will implement
```

### 12A.11 停止条件

出现以下情况，立刻停止子代理流程，回到父代理主线程：

- 子代理开始越界编辑
- 多个代理试图改同一文件
- 任务变得比原提示更宽泛
- 结果依赖缺失的个人事实
- 结果可能发布隐私或敏感信息
- 代理之间产生冲突品牌方向
- 子代理带来的噪声超过单线程方案
- 子代理建议引入框架、第三方脚本、表单、域名或部署变更

此时应生成 blocker brief，而不是继续扩大并行范围。

### 12A.12 与 worktree 的关系

worktree 用来隔离文件改动和分支实验；子代理用来隔离认知任务和审查任务。

实践规则：

- 读多写少：优先子代理
- 多个实现方案并行实验：优先 worktree
- 既要审查又要实现：先子代理只读审查，再由父代理或单个写入代理实现
- 自动化后台任务：优先跑在 worktree；如需子代理，默认只读并输出 triage 结果

---

## 13. 自动化策略（上线后使用）

在网站首版稳定后，可逐步启用以下 automations。

### 13.1 每周站点健康检查

目标：

- 检查死链
- 检查标题和描述缺失
- 检查页面是否出现布局回退
- 检查新仓库是否值得加入 Build 区块

建议运行方式：

- project automation
- background worktree
- 每周一次

### 13.2 每两周内容盘点

目标：

- 回顾近期 GitHub 更新
- 判断是否要更新首页 Build 卡片
- 梳理是否有可转成 Notes 的新内容

### 13.3 每月设计整洁度检查

目标：

- 清理冗余 CSS
- 检查视觉是否逐渐“模板化”
- 保持首页简洁

### 13.4 自动化使用前提

如果要依赖 Codex app 的 project-scoped automations，必须确保：

- Codex app 正在运行
- 项目目录在本地可访问
- 自动化默认跑在 worktree 中，除非有明确理由在本地目录直接运行

### 13.5 自动化中的子代理规则

自动化可以使用子代理，但默认更保守：

- 只允许 read-only 子代理，除非用户明确授权自动修复
- 默认最多 2 个子代理
- 不允许自动化子代理进行发布、域名、联系方式、隐私或账号相关操作
- 若自动化发现需要公开内容判断，应只在 Triage 中报告，不要自行改写个人事实
- 若自动化发现需要写入，父代理应先给出计划与 diff 摘要，再进入修改

---

## 14. 里程碑计划

### M0：仓库初始化

目标：

- 建立 `yscjrh.github.io`
- 放入 `personalweb.md`
- 创建基础文件
- 生成 `AGENTS.md`

完成标准：

- 仓库结构成立
- Codex 能解释当前蓝图
- 本地可启动简单预览

### M1：内容框架与首屏确定

目标：

- 输出首页结构
- 产出 2–3 个 Hero 版本
- 确认 Research / Build / Notes 的信息密度

完成标准：

- 首页文案方向明确
- 没有明显公司官网腔
- 三个身份维度能被一个人串起来

### M2：视觉系统

目标：

- 确定字体层级、颜色、间距、卡片样式
- 先做桌面端，再适配手机端

完成标准：

- 页面一眼有秩序
- 没有强模板感
- 技术感与个人感平衡

### M3：首版实现

目标：

- 完成 `index.html` / `styles.css` / `script.js`
- 项目卡片可点击
- 页面可本地预览

完成标准：

- 页面结构齐全
- 响应式基本完成
- 自检通过

### M4：发布与部署

目标：

- 推送到 GitHub Pages
- 确认线上页面正常

完成标准：

- 线上可访问
- HTTPS 正常
- 主页链接可用

### M5：GitHub 主页协同

目标：

- 创建或更新用户同名仓库 README
- 配置 pinned repositories
- 让 GitHub 主页与网站形成互相导流

完成标准：

- GitHub 主页顶部信息清晰
- pinned 项目与网站重点一致

### M6：持续打磨

目标：

- 增加真实研究案例
- 增加 Notes
- 优化首页表达

完成标准：

- 网站逐渐从“可用”走向“有辨识度”
- 每次迭代都可解释其价值

---

## 15. 给 Codex 的首条启动提示词（可直接粘贴）

```text
Read personalweb.md completely and treat it as the primary blueprint for this repository.

Your job is to turn this repo into a clean personal brand website for YSCJRH / yscjrh.github.io.

Workflow:
1. Audit the current repo state.
2. Create or update AGENTS.md based on personalweb.md.
3. If the work spans multiple milestones, create PLANS.md.
4. Decide whether the subagent policy applies.
5. Propose a concrete execution plan for M0–M3.
6. Implement the first shippable version of the site.
7. Run a local preview.
8. Review your own diff and fix obvious issues.
9. If useful, run bounded read-only subagents for copy / visual / metadata review.
10. Summarize what changed, what was validated, and what remains.

Rules:
- Use only truthful content.
- Do not invent publications, awards, or metrics.
- Keep the first version static and simple.
- Avoid generic corporate AI language.
- Preserve the three-part identity: research, build, notes.
- Use worktrees for parallel implementation experiments when useful.
- Use bounded subagents only for clearly scoped exploration, review, QA, or diagnosis.
- All subagents must default to gpt-5.4 with high reasoning.
- Default subagents are read-only; use at most one writer.
- Use the in-app browser for webpage review when possible.
- Do not stop for permission unless a blocker from personalweb.md is triggered.
```

---

## 16. 给 Codex 的审查提示词（首版出来后使用）

```text
Review the current website against personalweb.md.

Check:
1. clarity of hero section
2. whether Research / Build / Notes feel like one coherent person
3. mobile layout issues
4. weak copy or generic phrases
5. broken links
6. missing metadata
7. anything that feels invented, overstated, or too corporate

Then:
- if the review is broad, use bounded read-only subagents for copy, visual, and metadata checks
- propose fixes
- implement the safe fixes directly through the parent agent or one assigned writer
- list any items that require escalation
```

---

## 17. 给 Codex 的自动化提示词（网站稳定后使用）

```text
Create a weekly project automation for this repository.

Task:
- check for broken links
- review homepage metadata
- inspect whether newly updated GitHub repos should change the Build section
- report findings in Triage
- if nothing important changed, archive the run

Run in:
- background worktree

Subagent rule:
- use at most 2 read-only subagents if the audit is broad
- all subagents use gpt-5.4 with high reasoning
- parent agent must synthesize findings before any file edit

Do not:
- rewrite site identity
- publish new personal claims
- modify contact info
- let multiple agents edit files at once
```

---

## 18. 当前公开 GitHub 项目（作为 Build 区块素材）

以下项目可作为首版 Build 区块的真实素材来源：

| 项目 | 当前公开定位 | 首版建议角色 |
|---|---|---|
| `ai-visibility-auditor` | CLI-first AI visibility auditor for product websites | 前排代表作 |
| `codex-via-phone` | Phone-friendly private control layer for local Codex sessions on Windows | 前排代表作 |
| `skylattice` | Local-first AI agent runtime for persistent memory, governed repo tasks, and Git-native self-improvement | 前排代表作 |
| `mirror-sim` | Constrained multi-agent scenario simulation engine inspired by *The Mirror* | 前排代表作 / 风格化项目 |
| `create-double-skill` | Build a private digital double and editable model of how you think and present yourself | 实验性项目 / 后排项目 |

Codex 可以基于这些真实描述做适度重写，但不得改变事实边界。

---

## 19. 与 GitHub 主页协同的规则

网站不是孤立存在的，必须和 GitHub 个人主页互相支撑。

后续应完成：

1. 创建用户同名仓库 `YSCJRH`
2. 在根目录放 `README.md`
3. 让该 README 成为 GitHub profile README
4. 将网站重点项目同步到 pinned repositories
5. 网站首页显式链接到 GitHub
6. GitHub profile README 也链接回网站

这样访客无论从网站进入 GitHub，还是从 GitHub 进入网站，都能看到同一套身份叙事。

---

## 20. 网站完成的最低标准

只有当以下条件都成立时，才可以把首版视为“可上线”：

- 主页叙事清晰
- 三个身份维度能被一个逻辑串起来
- 页面本地和线上都能正常打开
- 手机端不明显崩坏
- Build 区块使用真实项目
- Notes 区块即便简短，也不显得敷衍
- 没有虚构信息
- 视觉上不像通用 SaaS 模板
- 代码结构可继续维护
- Codex 已留下清晰的后续迭代路径

---

## 21. 当需要回到 GPT 5.4 Pro 讨论时，Codex 应如何准备材料

如果需要把问题带回网页版 GPT 5.4 Pro，Codex 应先准备一份简报，包含：

1. 当前目标
2. 已完成的内容
3. 当前页面截图或结构描述
4. 遇到的问题
5. 备选方案
6. 自己倾向的方案与理由
7. 哪些地方属于品牌判断，哪些地方属于技术判断

目标是让下一轮讨论聚焦，不从零开始。

---

## 22. 未来扩展方向（不是首版要求）

下面这些方向是未来可能演进，不是首版必做：

- 研究案例页
- 双语页面
- Notes 多页面体系
- 项目详情页
- 演讲 / 分享 / 读书页
- 更完整的 About 页面
- 自定义域名
- 自动生成 Open Graph 图
- 根据 GitHub 活动自动更新项目卡片

如果做这些增强，优先保持网站的清晰度和真实性，不要为了“看起来更完整”而快速膨胀。

---

## 23. 最后的总原则

这个网站要呈现的不是“我做了很多零散的事”，而是：

> 我在一个很稀缺的交叉点上持续工作：荧光分析、智能算法、科学仪器，以及把这些经验转成开源工具和思考记录。

Codex 的工作不是把页面堆满，而是把这条主线表达清楚。

---

## 24. v0.2 变更摘要

相比 v0.1，本版主要补充了子代理并行工作的战略规则：

- 明确 `personalweb.md` 只保留高层策略，日常执行细节放在 `AGENTS.md`。
- 授权 Codex 在边界清楚的复杂审查 / 探索任务中使用子代理。
- 规定默认子代理使用 `gpt-5.4` + high reasoning。
- 规定默认只读、父代理整合、最多一个写入代理。
- 补充子代理适用场景、禁用场景、停止条件和推荐提示词。
- 明确 `personalweb.md` 与 `AGENTS.md` 的分工：前者管品牌与方向，后者管执行与代理调度。
- 同步更新首条启动提示词、首版审查提示词和自动化边界。

---

## 25. 参考资料（供人类阅读）

- Codex best practices: https://developers.openai.com/codex/learn/best-practices
- AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Codex subagents concepts: https://developers.openai.com/codex/concepts/subagents
- Codex subagents setup: https://developers.openai.com/codex/subagents
- Codex configuration reference: https://developers.openai.com/codex/config-reference
- Codex app overview: https://developers.openai.com/codex/app
- Codex worktrees: https://developers.openai.com/codex/app/worktrees
- Codex in-app browser: https://developers.openai.com/codex/app/browser
- Codex automations: https://developers.openai.com/codex/app/automations
- PLANS.md / ExecPlans: https://developers.openai.com/cookbook/articles/codex_exec_plans
- GitHub Pages quickstart: https://docs.github.com/en/pages/quickstart
- Creating a GitHub Pages site: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- GitHub profile README: https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme
- Pinning items to your profile: https://docs.github.com/en/account-and-profile/how-tos/profile-customization/pinning-items-to-your-profile
