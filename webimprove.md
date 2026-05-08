# webimprove.md

> 版本：v1.0  
> 生成日期：2026-05-08  
> 目标站点：<https://yscjrh.github.io/>  
> 目标仓库：<https://github.com/YSCJRH/yscjrh.github.io>  
> 用途：个人网站改造蓝图 + Codex CLI `/goal` 长线执行契约  
> 重要边界：本文基于公开网页、公开 GitHub 仓库、官方/权威实践文档进行调研；视觉细节、移动端真实观感、Lighthouse 分数、浏览器兼容性仍需 Codex 在本地仓库与浏览器中验证。

> 发布执行注记（2026-05-08）：M0-M9 完成后的发布前复核将 `/review/` 从“保留 noindex 内部页面”收紧为“从可部署页面树移除”。早期 milestone 中关于 `/review/` noindex 检查的描述保留为执行历史，最终发布边界以 `docs/decisions/2026-05-08-retire-review-route.md`、`robots.txt`、`sitemap.xml` 与 `tools/check_site.py` 为准。

---

## 0. 文档用途

这份文档有四个用途：

1. **给站点拥有者阅读**  
   帮你判断 `yscjrh.github.io` 目前已经做对了什么、下一步最值得优化什么、哪些地方不应过度包装。

2. **给 GPT / Codex 继续讨论**  
   它把网站定位、信息架构、视觉系统、内容模型、工程检查与风险边界整理成统一上下文，避免后续讨论反复从零开始。

3. **给 Codex CLI `/goal` 模式执行**  
   本文后半部分把改造拆成 M0–M9 milestones。每个 milestone 都包含目标、范围、步骤、验证命令、人工验收点、完成标准、风险与回滚方式，适合 Codex 按 `/goal` 长线推进。

4. **给后续 PR / issue / roadmap 拆分**  
   每个 milestone 都可以转成一个 issue、PR 或本地工作分支。建议 Codex 同步维护 `WEBIMPROVE_PROGRESS.md`，把已完成内容、验证命令与剩余风险记录下来。

---

## 0.1 调研边界与结论分级

本文中的判断分为四类：

- **直接观察**：来自公开页面或公开仓库。  
- **最佳实践**：来自权威来源，如 OpenAI Codex 文档、NN/g、Google web.dev / Search Central、W3C WCAG、GitHub Docs、Chrome Lighthouse 文档。  
- **推断**：基于公开页面与源码结构的合理判断，但没有在本地浏览器或 Lighthouse 中跑验证。  
- **Codex 本地验证**：必须由 Codex 在本地仓库执行命令、打开浏览器、检查实际 DOM / CSS / 性能报告后确认。

当前可确认的公开事实：

- 站点首页的核心表达是 `Researcher · Builder · Thinker` 与 `Fluorescence Methods. Open Tools.`，并以 `Research / Build / Notes / About / Projects / GitHub` 作为主要入口。
- 首页已展示四个主题标签：`Fluorescence Analysis`、`Intelligent Algorithms`、`Scientific Instrumentation`、`Working Notes`。
- 首页与 `/projects/` 已展示五个代表项目：`AnswerLens / ai-visibility-auditor`、`codex-via-phone`、`skylattice`、`mirror-sim`、`create-double-skill`。
- `/notes/` 已有三类笔记结构：`Build Logs`、`Research Reflections`、`Method Notes`，其中前两类已有公开笔记，`Method Notes` 当前为草稿。
- GitHub 仓库 `YSCJRH/yscjrh.github.io` 的 README 表示当前站点是纯静态站：根目录静态 HTML、共享 `styles.css` 与 `script.js`、无构建步骤、无包管理器、无仓库内自动部署配置。
- 仓库已包含 `AGENTS.md`、`personalweb.md`、`PLANS.md`、`CONTENT_GAPS.md`、`docs/manual-qa-checklist.md` 等维护文件，说明这不是一个空白站点，而是已经有早期 Codex 协作痕迹的个人站项目。

本文的核心态度：

> 这个网站的问题不是“没有内容”，而是需要让已有内容在视觉、层级、项目可信度、访问路径与可验证工程流程上变得更清晰。

---

## 1. 当前网站定位判断

### 1.1 已有优势

#### 1.1.1 个人身份已经有基本形状

当前首页没有把自己写成泛泛的“全栈开发者”或“AI 产品专家”，而是明确使用：

- `Researcher · Builder · Thinker`
- `Fluorescence Methods. Open Tools.`
- `HJR / YSCJRH`

这说明站点已经有一个可继续打磨的主轴：**研究者 + 构建者 + 开源工具维护者**。

推荐保留这个方向，但建议将首屏文案进一步压缩成更强的一句话身份：

> 我在荧光分析、智能算法与科学仪器之间工作，也把一部分方法与工作流做成可检查的开源工具。  
> I work across fluorescence analysis, intelligent algorithms, and scientific instrumentation, and turn part of that work into inspectable open tools.

#### 1.1.2 研究方向已经明确

当前 Research 区域已经围绕三条线展开：

1. `Fluorescence Analysis / 荧光分析`
2. `Fluorescence Analysis × Intelligent Algorithms / 荧光分析 × 智能算法`
3. `Fluorescence Instrumentation / 荧光仪器`

这三条线有内在关联，不是随意堆叠。它们共同构成了站点的“稀缺交叉身份”。

应当继续强化这种交叉性，而不是把站点做成普通作品集模板。

#### 1.1.3 开源项目入口已经存在

首页和 `/projects/` 都已展示项目，并且每个项目已经有：

- 项目名
- 一句话说明
- 简短价值解释
- 若干标签
- GitHub / docs / demo 入口

这比很多个人站只放 GitHub 链接更好。后续重点不是“从零增加项目”，而是把项目从“列表卡片”升级成“可快速判断价值与可信度的项目入口”。

#### 1.1.4 中英文双语气质已经建立

站点目前大量使用 `English / 中文` 成对表达，例如：

- `Research / 研究`
- `Build / 构建`
- `Notes / 笔记`
- `Projects / 项目`
- `View live demo / 查看在线演示`

这是一种重要的个人风格。建议保留，但要控制密度：短标签适合成对，长段落不应强行逐句镜像。

#### 1.1.5 已有笔记系统雏形

`/notes/` 已有三类内容：

- `Build Logs / 构建日志`
- `Research Reflections / 研究反思`
- `Method Notes / 方法备忘`

这很适合研究型开源开发者。它让站点不只是项目入口，也能记录方法、约束、判断与演化。

### 1.2 核心问题

#### 1.2.1 首屏行动入口略分散

首页当前同时出现：

- GitHub
- View Projects
- AnswerLens demo
- Skylattice docs
- All projects
- Instrument Lab

这些入口都合理，但它们在首屏过早并列时，访问者可能不知道“第一步最该点哪里”。

建议：

- 首屏只保留 2 个主 CTA：
  - Primary：`View Projects / 查看项目`
  - Secondary：`Open GitHub / 查看 GitHub`
- 次级入口移到 Hero 下方的 `Featured entry strip`，并明确标注它们适合谁：
  - `Try AnswerLens demo`
  - `Read Skylattice docs`
  - `Browse Notes`

#### 1.2.2 视觉层级需要进一步减少竞争

从文本结构看，首页包含许多编号、标签、双语短句、项目入口、主题 chip。它们都在争夺注意力。

需要 Codex 本地验证的视觉问题：

- Hero 标题、标签、CTA、主题 chip 是否在首屏过多。
- 项目卡片的标题、状态、解释文字、列表、标签、链接是否层级足够清楚。
- 研究方向卡片是否与项目卡片视觉区分明显。
- 中英文成对文案是否造成纵向高度过大。
- 移动端是否出现“每个卡片都很长，扫读困难”的问题。

#### 1.2.3 项目可信度表达不够系统

当前项目卡片已经有“看什么 / What to inspect”，这是很好的方向。但它们还缺少稳定字段：

- 当前状态：Live / Stable / Concept / Experimental / Repo-first
- 适合谁：researcher / developer / maintainer / product team
- 最近可信证据：demo、release、docs、test、proof artifact、quickstart
- 不是什么：尤其对 `mirror-sim`、`AnswerLens`、`codex-via-phone` 这类容易被误解的项目很重要
- 最近更新：可以来自 GitHub release / docs / README，但不要编造

#### 1.2.4 导航信息气味可再增强

`Research / Build / Notes / About / Projects` 对熟悉你的人是清楚的，但对冷访问者来说，`Build` 与 `Projects` 的边界可能模糊。

建议：

- 顶部导航减少重复：桌面端 `Research / Projects / Notes / About / GitHub`
- 首页内保留 `Build` 作为叙事章节，不一定作为主导航项。
- 若保留 `Build`，应改成 `Build / Open Tools` 或 `Build / 工具`，增强信息气味。

#### 1.2.5 前端可维护性存在隐性压力

公开仓库 README 确认当前为纯静态站，无构建步骤、无包管理器。这个选择对 GitHub Pages 友好，也方便快速维护。但同时：

- `styles.css` 在 GitHub 页面显示约 102 KB、数千行，可能已经接近纯手写 CSS 的维护压力点。
- 页面已经从单页扩展到 `/projects/`、`/notes/`、若干 note 页面、`/review/`。
- 如果继续增加项目详情页、笔记、设计 token、SEO meta，纯 HTML 重复会增加。

建议近期不急于迁移框架，但要先做“内容模型 + CSS 模块边界 + 验证脚本”。只有当 Notes 与 Projects 明显增长后，再讨论 Astro / Eleventy / Jekyll 等静态内容系统。

#### 1.2.6 性能、SEO、可访问性缺少公开验证基线

当前能看到 skip link，这是可访问性加分项。但仍需 Codex 本地验证：

- 每页是否只有一个清晰 `<h1>`
- heading 层级是否连续
- focus visible 是否明显
- mobile nav 是否键盘可用
- `lang` 是否适合中英文混排
- Open Graph / Twitter Card 是否完整
- canonical 是否正确
- Lighthouse mobile 分数
- Core Web Vitals 模拟指标
- 图片是否有尺寸和 alt
- CSS 是否阻塞过多
- JS 是否必要且体积可控

---

## 2. 目标用户与访问场景

### 2.1 开源项目用户

他们想知道：

- 这个项目解决什么问题？
- 我能不能马上试？
- 是否有 README / Quick Start / Demo？
- 是否可信、安全、可回退？
- 作者是否仍在维护？

最可能点击：

- `View Projects`
- `AnswerLens demo`
- `Skylattice docs`
- GitHub repo
- Quick Start

当前可能卡住：

- 首页项目很多，但项目状态和使用路径不够统一。
- “看什么 / What to inspect” 很好，但还不能替代“我该怎么开始”。
- 对实验性项目的边界说明需要更醒目。

改造后路径：

1. 首页 Hero 明确身份。
2. `Featured Projects` 展示 3 个最高优先项目。
3. 每个项目卡片提供 `Try / Docs / GitHub` 三类入口。
4. 项目详情或外部 README 中提供明确 first-run path。
5. 对安全敏感项目提供 `Security model / 安全模型` 入口。

### 2.2 GitHub 访问者

他们想知道：

- 这个 GitHub 账号背后的人是谁？
- 哪些项目最能代表作者？
- 是否有清晰的技术品味和维护方式？
- 个人网站是否能帮我快速筛选仓库？

最可能点击：

- GitHub profile
- Featured projects
- Project docs
- Notes / Build Logs

当前可能卡住：

- GitHub 是主入口，但项目之间的优先级仍需更清楚。
- 网站和各仓库 README 的说法需要持续对齐。
- 部分项目可能在 GitHub README 中很强，但个人站卡片没有充分借力。

改造后路径：

1. 首页用 3 个精选项目表达“最值得先看”。
2. `/projects/` 作为 GitHub 的阅读索引，而不是仓库列表复制。
3. 每个卡片明确“为什么值得看”。
4. Footer 统一提供 GitHub profile / Projects / Notes。

### 2.3 研究同行

他们想知道：

- 你研究的核心问题是什么？
- 荧光分析、算法、仪器三者如何关联？
- 是否有真实方法积累？
- 你是否谨慎地区分观察、假设和结论？

最可能点击：

- Research
- Notes / Research Reflections
- Instrument Lab
- About

当前可能卡住：

- Research 三方向存在，但缺少“研究问题 → 方法能力 → 工具/笔记证据”的连线。
- 没有论文/成果时，不能用空泛语言替代可信证据。
- `Notes` 是好入口，但需要更稳定的分类与摘要。

改造后路径：

1. Research 区域保持三方向。
2. 每个方向附 1 个“当前问题”和 1 个“相关笔记/项目”。
3. Research Reflections 保持边界感，避免结果夸大。
4. About 说明研究兴趣与工作方法。

### 2.4 潜在合作方

他们想知道：

- 这个人擅长把不清楚的问题变成可执行工具吗？
- 是否能处理研究、算法、仪器、工程之间的跨界问题？
- 是否可信、克制、有长期维护意识？

最可能点击：

- About
- Featured Projects
- Notes
- GitHub

当前可能卡住：

- 项目卡片还没有把“合作价值”翻译成访问者语言。
- 没有清晰联系方式时，应避免假装有完整 contact system。
- 需要更多“工作方法”证据，而不是营销化承诺。

改造后路径：

1. 首页 Hero 明确交叉能力。
2. About 提供紧凑工作方式。
3. Projects 展示可检查的工具与文档。
4. Notes 展示判断与边界。

### 2.5 招聘方 / 项目评审者

他们想知道：

- 这个人有什么代表性能力？
- 项目是否真实可运行？
- 是否有工程质量意识？
- 是否能写清楚复杂系统？

最可能点击：

- Projects
- GitHub
- About
- Notes

当前可能卡住：

- 当前站点没有 Resume 式结构，这可以接受，但需要更强“证据路径”。
- 项目卡片应让评审者在 30 秒内知道优先看哪三个项目。
- 需要避免“所有项目看起来同等重要”。

改造后路径：

1. 首页显示 3 个精选项目。
2. `/projects/` 保留全部项目，但按状态和成熟度分组。
3. 每个项目给出“可验证入口”。
4. About 简短说明能力结构，不写虚假经历。

### 2.6 未来的自己

你未来会想知道：

- 当时为什么这样设计网站？
- 哪些内容可以安全公开？
- 哪些文案不能夸大？
- Codex 改过什么，为什么改？
- 下一次维护从哪里继续？

最可能点击：

- `WEBIMPROVE_PROGRESS.md`
- `DESIGN_SYSTEM.md`
- `CONTENT_MODEL.md`
- `docs/decisions/`
- Notes / Build Logs

当前可能卡住：

- 已有 `PLANS.md`、`AGENTS.md`，但本轮改造还需要更明确的进度日志。
- CSS 与内容重复增长后，未来维护会更难。

改造后路径：

1. Codex 每个 milestone 更新 `WEBIMPROVE_PROGRESS.md`。
2. 重要 IA / 视觉 / 技术决策记录进 `docs/decisions/`。
3. 内容模型单独放入 `CONTENT_MODEL.md`。
4. 验证清单独立维护。

---

## 3. 改造总目标

北极星目标：

> 将 `yscjrh.github.io` 从“内容已经存在但表达仍偏分散的研究者个人站”，升级为“研究方向清晰、开源项目可信、视觉表达克制而高级、可持续维护、可由 Codex 长线验证推进的研究型开源开发者主页”。

### 3.1 子目标

1. **更强的首页第一屏**  
   在 5–10 秒内回答：我是谁、我做什么、你下一步该看哪里。

2. **更清晰的项目展示**  
   把项目从“仓库说明卡片”升级成“价值、状态、证据、入口、边界”清楚的项目索引。

3. **更统一的设计系统**  
   让颜色、字体、间距、卡片、按钮、标签、链接、状态标记稳定下来，避免 CSS 越写越散。

4. **更好的移动端体验**  
   让首屏、导航、项目卡片、笔记列表在手机上仍然容易扫读，不因双语内容变得拥挤。

5. **更强的可访问性**  
   保留 skip link，系统检查 heading、键盘导航、focus visible、contrast、alt text、reduced motion、语义 HTML。

6. **更可验证的性能目标**  
   建立 Lighthouse / PageSpeed / Core Web Vitals 基线，避免视觉打磨带来性能退化。

7. **更适合持续写作与项目更新**  
   建立 Notes 与 Projects 的内容模型，让未来每新增项目/笔记都能按同一结构进入站点。

8. **更适合 Codex 自动维护**  
   让 Codex 按 milestone 小步推进，每步运行验证、记录进度、遇到产品/事实风险再暂停。

---

## 4. 信息架构重构方案

### 4.1 推荐导航结构

#### 桌面端主导航

建议从：

```text
Research / Build / Notes / About / Projects / GitHub
```

调整为：

```text
Research / 研究
Projects / 项目
Notes / 笔记
About / 关于
GitHub
```

理由：

- `Projects` 比 `Build` 更符合冷访问者预期。
- `Build` 可以保留为首页内部叙事章节，表达工作方式。
- `GitHub` 是外链，应在视觉上与站内导航区分。
- 顶部导航数量控制在 4–5 个，减少第一眼负担。

#### 移动端导航

建议：

- Header 固定或半固定，但高度克制。
- 左侧品牌：`HJR / YSCJRH`
- 右侧按钮：`Menu / 菜单`
- 展开后显示：
  - `Research / 研究`
  - `Projects / 项目`
  - `Notes / 笔记`
  - `About / 关于`
  - `GitHub ↗`
- 展开菜单需要：
  - `aria-expanded`
  - `aria-controls`
  - Escape 关闭
  - 点击链接后自动关闭
  - focus trap 可选，至少保证键盘顺序可用

### 4.2 首页滚动结构

建议首页顺序：

1. **Hero**  
   一句话身份 + 一句话价值 + 2 个 CTA + 3–4 个主题标签。

2. **Featured Projects**  
   展示 3 个精选项目：`AnswerLens`、`skylattice`、`codex-via-phone`。  
   其余项目放到 `/projects/` 或首页后部紧凑列表。

3. **Research Directions**  
   三个研究方向，每个方向包含：
   - 关注问题
   - 方法线索
   - 相关项目/笔记入口

4. **Build Method / Open Tools**  
   保留当前 “Find the constraint → Shape the method → Build the tool → Keep the trail” 的四步方法，但减少文字量，让它成为工作方法而非项目替代品。

5. **Notes**  
   三类笔记：Build Logs / Research Reflections / Method Notes。  
   每类显示最新 1 篇或状态。

6. **About**  
   紧凑个人介绍，不写成完整简历。

7. **Footer**  
   GitHub / Projects / Notes / License / RSS（若加入）/ Last updated。

### 4.3 页面层级建议

```text
/
├── #hero
├── #featured-projects
├── #research
├── #build-method
├── #notes
└── #about

/projects/
├── Featured
├── Tools
├── Experiments
├── Concept / Research Simulations
└── Archive / Later

/notes/
├── Build Logs
├── Research Reflections
└── Method Notes

/about/   （可选，不急）
```

近期不要盲目新增页面。优先把现有 `/projects/`、`/notes/` 与首页内部区块打磨好。`/about/` 可等 About 内容足够稳定后再拆。

---

## 5. 视觉设计方向

### 5.1 整体气质关键词

推荐视觉关键词：

- 理性
- 开放
- 清晰
- 可检视
- 轻微科技感
- 研究感
- 温和而不冰冷
- 可信而不过度营销

避免：

- 赛博霓虹
- 过度玻璃拟态
- 大面积 AI SaaS 渐变
- 密集卡片墙
- 炫技动效
- 公司官网式夸张 CTA
- “革命性 / 世界级 / 行业领先”叙事

### 5.2 色彩系统

建议采用低饱和研究型色彩：

```css
:root {
  color-scheme: light;

  --color-bg: #f7f8f6;
  --color-surface: #ffffff;
  --color-surface-muted: #eef3ef;
  --color-text: #18201d;
  --color-text-muted: #5d6a63;
  --color-border: #d9e1dc;

  --color-accent: #23675a;
  --color-accent-strong: #17483f;
  --color-accent-soft: #dcebe6;

  --color-research: #2f5f73;
  --color-tool: #5a6540;
  --color-note: #7a5b35;
  --color-warning: #8a5a00;

  --shadow-card: 0 14px 40px rgba(20, 35, 30, 0.08);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
}
```

原则：

- 背景不要纯白刺眼，可以用轻微暖灰/绿灰。
- 主色建议接近深绿/蓝绿，呼应荧光与科学仪器，但不要发光。
- 状态色只用于辅助，不要让页面变成五颜六色的 badge 集合。

### 5.3 字体建议

优先使用系统字体，减少加载成本：

```css
:root {
  --font-sans:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "Noto Sans",
    "Noto Sans SC",
    "PingFang SC",
    "Microsoft YaHei",
    sans-serif;

  --font-mono:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    Menlo,
    monospace;
}
```

原则：

- 英文标题可以略紧凑，中文说明保持清晰行高。
- 中文不要过小；正文建议 `16px–18px`。
- 项目卡片说明行高建议 `1.65`。
- 代码/命令使用 monospace，但不要让命令块过宽溢出。

### 5.4 中英文混排原则

短标签：

```text
Projects / 项目
Research / 研究
View demo / 查看演示
```

长段落：

```text
I work across fluorescence analysis, algorithmic methods, instrumentation, and working notes.
我的工作位于荧光分析、算法方法、科学仪器与工作笔记的交叉处。
```

不要把每个英文短语都硬翻译成同一行。移动端尤其应允许中英文分行。

建议 CSS：

```css
.bilingual-pair {
  display: grid;
  gap: 0.35rem;
}

.bilingual-pair .en {
  color: var(--color-text);
}

.bilingual-pair .zh {
  color: var(--color-text-muted);
  line-height: 1.75;
}
```

### 5.5 间距系统

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4.5rem;
  --space-9: 6rem;
}
```

使用原则：

- Section 垂直间距：桌面 `72–96px`，移动端 `48–64px`。
- 卡片内部间距：`20–28px`。
- 标签之间：`8px`。
- Hero 内部元素不超过 5 组，否则首屏会显得“满”。

### 5.6 卡片系统

统一三类卡片：

1. **Project Card**：信息最多，含状态、价值、入口。
2. **Research Card**：更安静，强调问题和方向。
3. **Note Card**：轻量，强调标题、摘要、类别、日期。

Project Card 示例结构：

```html
<article class="project-card" data-status="live">
  <div class="project-card__meta">
    <span class="eyebrow">Featured / 重点项目</span>
    <span class="status status--live">Live</span>
  </div>
  <h3>AnswerLens / ai-visibility-auditor</h3>
  <p class="project-card__value">CLI-first auditor for how AI systems read product websites.</p>
  <ul class="project-card__facts">
    <li>For: product teams, maintainers, technical marketers</li>
    <li>Proof: live demo report, GitHub Action docs, reproducible fixture demo</li>
  </ul>
  <div class="tag-row">
    <span>AI Visibility</span>
    <span>CLI</span>
    <span>GitHub-native</span>
  </div>
  <div class="action-row">
    <a class="button button--primary" href="...">View demo / 查看演示</a>
    <a class="button button--secondary" href="...">GitHub ↗</a>
  </div>
</article>
```

### 5.7 标签系统

标签分为三类：

- Topic：`Fluorescence Analysis`、`Scientific Instrumentation`
- Tech / Method：`CLI`、`Local-first`、`Git-native`
- Status：`Live`、`Stable`、`Repo-first`、`Concept`、`Experimental`

不要让所有标签视觉相同。状态标签应更克制、更信息化。

```css
.tag {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.7);
}

.status {
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 650;
}

.status--live {
  color: var(--color-accent-strong);
  background: var(--color-accent-soft);
}
```

### 5.8 按钮系统

最多三类：

- Primary：主要下一步
- Secondary：次要入口
- Ghost/Text：低优先链接

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.72rem 1rem;
  border-radius: 999px;
  font-weight: 650;
  text-decoration: none;
}

.button--primary {
  color: #fff;
  background: var(--color-accent);
}

.button--secondary {
  color: var(--color-accent-strong);
  background: var(--color-accent-soft);
  border: 1px solid rgba(35, 103, 90, 0.25);
}

.button:focus-visible {
  outline: 3px solid rgba(35, 103, 90, 0.35);
  outline-offset: 3px;
}
```

### 5.9 链接样式

正文链接：

- 保留下划线或明显边界。
- 外链添加 `↗` 或 `aria-label`，但不要过度装饰。
- 不要只用颜色区分链接。

### 5.10 页面最大宽度

```css
:root {
  --page-max: 1120px;
  --content-max: 760px;
  --wide-max: 1280px;
}
```

正文页建议 `720–780px`，项目网格可到 `1120px`。

### 5.11 响应式断点

```css
:root {
  --bp-sm: 480px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
}
```

建议：

- `< 768px`：单列，导航折叠，Hero CTA 纵向或自动换行。
- `768–1024px`：两列项目卡片可用，但注意文字高度。
- `> 1024px`：Hero 可使用两栏，但不要强行加复杂装饰图。

### 5.12 暗色模式是否值得做

近期建议：**不作为优先 milestone**。

原因：

- 当前更重要的是内容层级、项目可信度、移动端与可访问性。
- 暗色模式会扩大视觉 QA 范围。
- 若做，应在设计 token 稳定后进行，并尊重 `prefers-color-scheme`。

可作为后续 enhancement：

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #111715;
    --color-surface: #18201d;
    --color-text: #edf4ef;
    --color-text-muted: #a8b5ad;
    --color-border: #2b3832;
  }
}
```

### 5.13 动效原则

允许：

- hover 轻微上移 `translateY(-2px)`
- focus outline
- section 轻量 fade-in，必须尊重 `prefers-reduced-motion`
- mobile menu 展开收起

避免：

- 大面积视差
- 自动播放动画
- 滚动劫持
- 鼠标追踪光效
- 复杂 canvas 背景

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 6. 首页第一屏重写方案

### 6.1 方案 A：研究者优先

```text
eyebrow:
Researcher · Builder · Open Tools

headline:
Fluorescence analysis, made inspectable.

subtitle:
I work across fluorescence analysis, intelligent algorithms, and scientific instrumentation, and turn part of that work into open tools and working notes.
我在荧光分析、智能算法与科学仪器之间工作，也把一部分方法与工作流做成可检查的开源工具和笔记。

primary CTA:
View research directions / 查看研究方向

secondary CTA:
Browse projects / 浏览项目

supporting tags:
Fluorescence Analysis
Scientific Instrumentation
Working Notes
Open Tools
```

适合强调研究身份。风险是开源项目入口会稍弱，因此要在下一屏立刻接 `Featured Projects`。

### 6.2 方案 B：开源工具优先

```text
eyebrow:
Open-source tools for inspectable work

headline:
Small tools for clearer methods.

subtitle:
I build and document tools that make analytical workflows, AI-facing evidence, and local agent experiments easier to inspect, revisit, and improve.
我构建并记录一些小型工具，让分析流程、AI 可见性证据与本地 agent 实验更容易被检查、回看和改进。

primary CTA:
View featured projects / 查看重点项目

secondary CTA:
Open GitHub / 打开 GitHub

supporting tags:
CLI Tools
Git-native Workflows
Local-first Agents
Research Notes
```

适合从 GitHub 或开源项目入口来的访客。风险是荧光研究身份会被弱化，需要在 Hero 下方用 `Research Directions` 补回来。

### 6.3 方案 C：交叉身份优先（推荐）

```text
eyebrow:
HJR / YSCJRH · Researcher & Builder

headline:
Signals, methods, instruments, and open tools.

subtitle:
I work where fluorescence analysis, intelligent algorithms, scientific instrumentation, and working notes inform one another.
我的工作位于荧光分析、智能算法、科学仪器与工作笔记的交叉处；我也把一部分方法做成可检视、可复用的开源工具。

primary CTA:
Explore projects / 查看项目

secondary CTA:
Read notes / 阅读笔记

supporting tags:
Fluorescence Analysis
Intelligent Algorithms
Scientific Instrumentation
Open Tools
```

推荐使用方案 C 作为主方向。它最能保留当前站点的独特性，也能避免站点变成纯作品集或纯学术主页。

---

## 7. 项目展示改造方案

### 7.1 当前项目展示的不足

当前项目卡片已经有较好的基本结构，但仍有四个问题：

1. **状态不够稳定**  
   有些卡片写 `Live demo`，有些写 `Repo-first`，有些写 `Concept repo`。这些是有价值的信息，但需要统一成状态字段。

2. **适用对象不够明确**  
   访问者需要知道“这个项目适合我吗”。例如 AnswerLens 更适合产品站点维护者/技术营销/开源维护者；Skylattice 更适合 agent runtime / Git-native automation 关注者。

3. **可信证据没有固定位置**  
   有些项目有 live demo，有些有 docs，有些有 README，有些有 quickstart。建议固定显示 `Proof / 证据`。

4. **入口层级需要一致**  
   建议每个项目都尽量提供：
   - `Try / Demo`
   - `Docs`
   - `GitHub`
   若某项不存在，明确用 `Not available yet / 暂无` 或不展示，不要伪造。

### 7.2 新 Project Card 模型

字段：

```yaml
name:
slug:
one_liner:
status:
audience:
problem:
solution:
proof:
links:
  demo:
  docs:
  github:
tags:
why_worth_reading:
not_for:
last_verified:
```

视觉结构：

1. 顶部：状态 + 项目类型
2. 标题：项目名
3. 一句话价值
4. 适合谁 / 解决什么问题
5. Proof / 最近可信证据
6. 标签
7. CTA
8. 边界说明（可选）

### 7.3 示例卡片草稿

#### 7.3.1 AnswerLens / ai-visibility-auditor

```yaml
name: AnswerLens / ai-visibility-auditor
status: Live / Public demo
type: CLI-first auditor
one_liner: Audit how AI systems read and summarize product websites.
audience: 产品站点维护者、开源项目维护者、技术营销、AI discoverability 研究者
problem: AI answer systems may miss key pages, weak evidence, pricing, comparisons, or source material.
solution: Use a CLI / GitHub-native workflow to generate reviewable reports, scorecards, recommendations, and PR-ready artifacts.
proof: Live demo report, GitHub Action docs, reproducible fixture demo, report artifacts.
links:
  demo: AnswerLens demo
  docs: GitHub README / docs
  github: YSCJRH/ai-visibility-auditor
tags:
  - AI Visibility
  - CLI
  - GitHub-native
  - Report-driven
why_worth_reading: It is the clearest current example of turning an ambiguous AI visibility problem into inspectable artifacts.
not_for: Not a “rank #1 in ChatGPT” promise; not consumer AI UI scraping.
last_verified: Codex 本地验证：检查 README、release、demo URL、latest docs。
```

首页卡片文案：

> **AnswerLens / ai-visibility-auditor**  
> CLI-first auditor for how AI systems read product websites. It turns vague AI visibility concerns into reviewable reports, scorecards, and fix lists.  
> 让产品站点的 AI 可见性检查变成可以在 GitHub 中复查的报告与证据，而不是排名承诺。

CTA：

- `View demo / 查看演示`
- `Read docs / 阅读文档`
- `GitHub ↗`

#### 7.3.2 codex-via-phone

```yaml
name: codex-via-phone
status: Repo-first / Security-sensitive
type: Phone-friendly control layer
one_liner: Phone-friendly private control layer for local Codex sessions on Windows.
audience: 在 Windows 上本地运行 Codex、希望用手机查看/续接/审批的人
problem: Local Codex sessions are tied to the desktop, but remote access can easily weaken trust boundaries.
solution: Provide a self-hosted layer with localhost-first defaults, trusted device approval, and clearly named access modes.
proof: README setup path, security model, mode descriptions, desktop approval flow.
links:
  demo: none
  docs: setup path / security model
  github: YSCJRH/codex-via-phone
tags:
  - Windows
  - Local Codex
  - Trusted Device
  - Private Control
why_worth_reading: It shows a practical remote-access workflow that treats safety boundaries as product requirements.
not_for: Not a public remote-control SaaS; public-funnel mode must never be default.
last_verified: Codex 本地验证：检查 README、SECURITY、install scripts、runtime config。
```

首页卡片文案：

> **codex-via-phone**  
> A phone-friendly private control layer for local Codex sessions on Windows, built around localhost-first defaults and explicit device trust.  
> 面向本地 Codex 会话的手机控制层，重点不是“随时公网访问”，而是访问模式、设备信任与安全边界。

CTA：

- `Read setup path / 阅读上手路径`
- `Security model / 安全模型`
- `GitHub ↗`

#### 7.3.3 skylattice

```yaml
name: skylattice
status: Stable docs / Local-first runtime
type: Agent runtime
one_liner: Local-first AI agent runtime for persistent memory, governed repo tasks, and Git-native iteration.
audience: 关注 local-first agents、Git-native automation、可审计 agent runtime 的开发者
problem: Agent automation often hides state, memory, approvals, and rollback boundaries.
solution: Keep state local, use tracked validation, expose proof artifacts, and make repo tasks governed and inspectable.
proof: Public docs, quickstart, stable release docs, zero-credential verification path, sample outputs.
links:
  demo: App Preview / docs preview
  docs: Skylattice docs
  github: YSCJRH/skylattice
tags:
  - Local-first
  - Agent Runtime
  - Memory
  - Git-native
  - Governance
why_worth_reading: It is the strongest systems-oriented project and can anchor the “open tools” side of the site.
not_for: Not a hidden-autonomy hosted assistant; not a generic chat wrapper.
last_verified: Codex 本地验证：检查 current stable release、quickstart、docs URL、README claims。
```

首页卡片文案：

> **skylattice**  
> Local-first agent runtime for persistent memory, governed repository tasks, and Git-native reviewability.  
> 一个强调本地状态、治理边界、验证命令与可回退 Git 轨迹的 agent runtime。

CTA：

- `Read docs / 阅读文档`
- `Quick start / 快速开始`
- `GitHub ↗`

#### 7.3.4 mirror-sim

```yaml
name: mirror-sim
status: Concept / Public demo mode
type: Constrained scenario simulation
one_liner: A constrained, evidence-backed scenario simulation engine for fictional or explicitly authorized worlds.
audience: 对可追溯情景推演、多代理模拟、证据约束感兴趣的开发者/研究者
problem: Scenario simulation can easily be mistaken for open-world prediction or real-person profiling.
solution: Restrict the corpus, expose the pipeline, keep runs deterministic, and separate claims from evidence.
proof: README, public demo mode description, corpus-to-eval pipeline, explicit “What Mirror Is Not” boundaries.
links:
  demo: public demo if available
  docs: concept / README
  github: YSCJRH/mirror-sim
tags:
  - Simulation
  - Scenario
  - Evidence
  - Safety Boundaries
why_worth_reading: It shows a strong boundary-aware approach to simulation instead of prediction theater.
not_for: Not real-world prediction; not real-person profiling; not decision automation for sensitive domains.
last_verified: Codex 本地验证：检查 README safety claims、demo URL、public flags。
```

首页卡片文案：

> **mirror-sim**  
> A constrained scenario simulation engine that keeps corpus, claims, evidence, and evaluation visible.  
> 它适合展示“受约束的情景推演”如何保持边界，而不是把模拟包装成开放世界预测。

CTA：

- `Read concept / 阅读概念`
- `3-minute path / 三分钟路径`
- `GitHub ↗`

#### 7.3.5 create-double-skill

```yaml
name: create-double-skill
status: Experimental tool
type: Private self-modeling utility
one_liner: Create a private, editable profile of how you think, choose, and present yourself.
audience: 想把个人偏好、判断方式、协作风格整理成可编辑材料的用户
problem: Personal working style is often implicit, scattered, and hard to reuse across tools.
solution: Guide users through questions and generate local profile material such as profile.md and SKILL.md.
proof: README first-run command, demo mode, generated profile examples, Python scripts.
links:
  demo: local demo path
  docs: README examples
  github: YSCJRH/create-double-skill
tags:
  - Identity Tools
  - Profiles
  - Skills
  - Local-first
why_worth_reading: It connects personal reflection with practical agent instructions and editable local artifacts.
not_for: Not a public identity database; not a psychological diagnosis tool.
last_verified: Codex 本地验证：检查 privacy boundary、outputs、sample commands。
```

首页卡片文案：

> **create-double-skill**  
> A small local tool for turning guided self-modeling into editable profile and skill materials.  
> 它把“我如何思考、选择和表达”整理成可以继续修改的本地材料。

CTA：

- `Run first double / 跑通第一次`
- `Examples / 示例`
- `GitHub ↗`

### 7.4 首页精选顺序建议

推荐首页只突出 3 个项目：

1. **AnswerLens**：最容易被冷访问者理解，demo 和报告证据强。
2. **skylattice**：最能体现系统工程能力和长期方向。
3. **codex-via-phone**：与 Codex / local tooling 相关，且安全边界清楚。

`mirror-sim` 与 `create-double-skill` 可在 `/projects/` 中完整展示，首页只做紧凑 secondary row。

---

## 8. Notes / 笔记系统改造方案

### 8.1 Notes 的定位

Notes 不应是“博客杂物箱”。建议定位为：

> 公开工作笔记，用来记录研究问题、构建决策、方法备忘与边界意识。

三类：

1. **Build Logs / 构建日志**  
   记录站点、工具、项目为什么这样设计。适合连接项目和工程决策。

2. **Research Reflections / 研究反思**  
   记录荧光信号、重复性、仪器、算法、判断边界等研究型思考。

3. **Method Notes / 方法备忘**  
   记录可复用方法、检查清单、prompt/agent workflow、实验规则。

### 8.2 列表页结构

每类笔记建议：

```text
Section title
One-sentence category promise
Latest note card
2–3 compact older note links
Status: published / draft / planned
```

Note Card 字段：

```yaml
title:
category:
date:
status:
summary:
related_project:
related_research_direction:
reading_time:
tags:
```

### 8.3 标签系统

建议 tags 控制在 8–12 个，不要无限增长：

- `fluorescence`
- `instrumentation`
- `algorithmic-methods`
- `open-tools`
- `codex`
- `agent-workflows`
- `site-building`
- `research-notes`
- `method`
- `constraints`
- `evidence`

### 8.4 摘要写法

摘要建议回答一个问题：

- 这篇笔记保留了什么判断？
- 为什么未来值得回看？
- 它与哪个项目或研究方向有关？

示例：

```text
A short build log about why the homepage should feel more like evidence than a landing page.
一篇关于首页二次优化的构建日志：为什么研究者型主页应更像证据入口，而不是营销落地页。
```

### 8.5 更新时间展示

建议每篇 note 显示：

- `Published`
- `Updated`
- `Status`
- `Related`

不要只显示分类与标题。

### 8.6 草稿与已发布内容

草稿不建议在公网列出正文，除非明确作为 `Draft / 草稿` 标注。

可在 `/notes/` 显示：

```text
Method Notes / 方法备忘
1 draft in repo / 1 篇仓库草稿
```

但不要链接到未完成公开页面，除非内容已经通过隐私与真实性检查。

### 8.7 RSS / Atom 是否值得加入

建议加入，但不放在 M0–M3。

原因：

- 当前已有 Notes 体系，RSS 对长期写作有价值。
- 纯静态站也可以维护一个简单 `feed.xml`。
- 但如果手工维护过重，可能出错。

建议放在 M8：

- 若继续纯 HTML：Codex 创建 `feed.xml` 并更新维护说明。
- 若迁移静态站框架：由框架生成 feed。

### 8.8 Notes 与项目互相引用

每个项目卡片可显示：

```text
Related notes:
- Why the homepage needed a second pass
- When a fluorescence signal becomes usable
```

每篇笔记页底部显示：

```text
Related project:
- AnswerLens
- Skylattice
```

这会让站点从“几个页面”变成“可回看的知识网络”。

---

## 9. About 页面改造方案

### 9.1 About 的结构

建议 About 不写成长简历，而写成紧凑公开说明。

结构：

1. **短简介**
2. **研究兴趣**
3. **构建方向**
4. **开源项目**
5. **工作方法**
6. **联系方式 / 当前公开入口**
7. **不写什么**

### 9.2 About 文案草稿

```markdown
# About / 关于

I am HJR / YSCJRH, a researcher-builder working across fluorescence analysis, intelligent algorithms, scientific instrumentation, and open tools.

我是 HJR / YSCJRH，一名位于荧光分析、智能算法、科学仪器与开放工具交叉处的研究者与构建者。

## Research interests / 研究兴趣

I care about how fluorescence signals become reliable enough to support analytical judgment: not only whether a signal is visible, but whether the sample condition, instrument behavior, repeatability, and interpretation chain can carry meaning.

我关注荧光信号如何变得足以支撑分析判断：不只是信号是否可见，也包括样品状态、仪器行为、重复性与解释链条是否足够可信。

## Building direction / 构建方向

I build small, inspectable tools around methods, evidence, local workflows, and agent-assisted development. The goal is not to make every idea look finished, but to leave a trail that can be reviewed, reused, and corrected.

我会围绕方法、证据、本地工作流与 agent 辅助开发构建一些小型工具。目标不是把每个想法都包装成成熟产品，而是留下可以检查、复用和修正的路径。

## Open projects / 开源项目

Representative public projects include AnswerLens, Skylattice, codex-via-phone, mirror-sim, and create-double-skill. They cover AI visibility auditing, local-first agent runtime design, phone-friendly Codex control, constrained scenario simulation, and editable self-modeling.

当前代表性公开项目包括 AnswerLens、Skylattice、codex-via-phone、mirror-sim 与 create-double-skill，分别对应 AI 可见性审查、本地优先 agent runtime、手机端 Codex 控制、受约束情景推演与可编辑自我建模。

## Working method / 工作方法

I prefer small systems with visible assumptions, documented boundaries, and reviewable outputs. When evidence is incomplete, I would rather mark the boundary than make the page look more certain than it is.

我偏好小型、可检查、边界清楚的系统。证据不足时，我更愿意标出边界，而不是让页面看起来比实际更确定。

## Public entry / 公开入口

The clearest current public entry is GitHub. Notes on this site record selected build decisions, research reflections, and method reminders.

当前最清楚的公开入口是 GitHub。本站 Notes 会记录部分构建决策、研究反思与方法备忘。
```

### 9.3 不写什么

不要写：

- 未提供的真实姓名扩展信息
- 私人邮箱
- 电话
- 具体地理位置
- 未确认机构
- 未确认论文、专利、奖项
- 工作经历
- 夸大的影响力指标
- “行业领先”“世界级”“革命性”等空泛词

---

## 10. 前端工程改造建议

### 10.1 当前仓库已确认事项

公开 README 显示当前站点：

- 根目录静态 HTML
- 共享 `styles.css`
- 共享 `script.js`
- 无构建步骤
- 无包管理器
- 无仓库内自动部署配置
- 使用 GitHub Pages 作为公开站点
- 本地预览可用 `python tools/serve.py`，fallback 为 `python -m http.server 4173`

这意味着当前最稳路线是：**继续纯静态，小步重构，不引入框架，不增加复杂构建链**。

### 10.2 Codex 仓库检查步骤

Codex 在 M0 必须执行：

```bash
pwd
git status --short
find . -maxdepth 3 -type f | sort
```

读取：

```text
README.md
personalweb.md
AGENTS.md
PLANS.md
CONTENT_GAPS.md
docs/manual-qa-checklist.md
index.html
projects/index.html
notes/index.html
styles.css
script.js
```

识别：

- 技术栈
- 页面入口
- 样式文件
- JS 职责
- 构建命令
- 部署方式
- 内容源
- 测试 / lint / format
- SEO meta
- sitemap / robots / RSS
- public noindex 页面
- 未完成草稿与公开边界

建议 Codex 生成：

```text
WEBIMPROVE_PROGRESS.md
```

并记录：

```markdown
## M0 Baseline
- Date:
- Branch:
- Public pages:
- Local preview command:
- Tech stack:
- Validation commands available:
- Missing validation:
- Known risks:
- Next milestone:
```

### 10.3 情况 A：纯 HTML / CSS / JS

当前仓库属于此类。

处理原则：

- 不引入框架。
- 先整理设计 token 与组件 class。
- 减少重复 HTML，但不要过早模板化。
- 对多页面重复 header/footer，短期可以接受；中期可用 Codex 小心同步。
- 通过 `docs/decisions/` 记录何时需要框架迁移。

建议动作：

```text
M1–M3:
- 改 index.html / projects/index.html / styles.css 为主
- 不大改 script.js，除非移动导航或可访问性需要

M4–M8:
- 增加内容模型文档
- 增加 sitemap/robots/feed/metadata
- 增加验证脚本
```

### 10.4 情况 B：Jekyll / GitHub Pages

若 Codex 本地发现 `_config.yml`、`_layouts/`、`_includes/`，则按 Jekyll 处理。

原则：

- 不直接把纯 HTML 假设套进去。
- 使用 layout/include 减少 header/footer 重复。
- 保留 GitHub Pages 支持的插件范围。
- 本地用 `bundle exec jekyll serve` 验证。
- 注意 GitHub Pages build error。

### 10.5 情况 C：Vite / React / Vue / Svelte

若发现 `package.json`、`vite.config.*`、`src/` 等：

- 先运行现有 install / build / test。
- 不直接重写组件库。
- 先建立 `data/projects.*` 或内容数组，避免卡片硬编码散落。
- Lighthouse 与 Playwright 可作为验证。
- 保持静态导出适配 GitHub Pages。

### 10.6 情况 D：Astro / Next.js / Nuxt 等静态站点框架

若已迁移或计划迁移：

- 先确认是否真的需要框架。
- Astro 更适合内容型个人站；Next/Nuxt 只有在需要 app 行为时才值得。
- 保证 GitHub Pages base path、静态输出、404、sitemap、feed。
- 框架迁移必须单独成为新 `/goal`，不可混入视觉 polish。

### 10.7 不建议近期做的工程事项

- 上 CMS
- 加评论系统
- 加 analytics / 第三方追踪脚本
- 加后端 contact form
- 加登录
- 加复杂 animation library
- 框架迁移与视觉改造同时进行

---

## 11. 性能、SEO、可访问性检查清单

### 11.1 性能

目标：

- Lighthouse Performance mobile ≥ 90（静态站合理目标）
- Lighthouse Performance desktop ≥ 95
- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1
- 总 JS 尽可能小；若 JS 只用于导航，保持最小
- CSS 阻塞可接受，但应避免无用巨大样式

检查：

```bash
python tools/serve.py
# fallback:
python -m http.server 4173
```

浏览器打开：

```text
http://127.0.0.1:4173/
http://127.0.0.1:4173/projects/
http://127.0.0.1:4173/notes/
```

Lighthouse：

```bash
npx --yes lighthouse http://127.0.0.1:4173/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path=reports/lighthouse-home.html
```

若没有 Node / Chrome：

- 使用 Chrome DevTools Lighthouse 手动跑。
- 记录报告截图或保存 HTML。
- 不阻塞 M1–M3，但 M7 必须建立基线。

重点检查：

- 首屏 LCP 元素是什么
- 是否有未设尺寸图片导致 CLS
- 字体是否外链阻塞
- CSS 是否过大且无组织
- JS 是否阻塞首屏
- 图片是否压缩
- 是否有无用动画
- 移动端首屏是否需要过多滚动才能看到 CTA

### 11.2 可访问性

检查项：

- 页面有 skip link，且 focus 后可见。
- 每页只有一个主 `<h1>`。
- heading 层级不跳跃。
- 导航使用 `<nav>`。
- 当前页面或当前区块状态可被理解。
- 所有交互元素可键盘访问。
- focus visible 明显。
- 颜色对比达到 WCAG AA。
- 图片有 `alt`；装饰图 `alt=""`。
- 按钮与链接语义正确：链接跳转，按钮触发行为。
- mobile menu 有 `aria-expanded`。
- 外链说明不要只靠图标。
- 支持 `prefers-reduced-motion`。
- 中英文页面至少有合理 `lang` 基线；局部中文可考虑 `lang="zh-CN"`。
- 触控目标不小于约 44px。
- 文本缩放到 200% 后不遮挡关键内容。
- 不用颜色作为唯一信息来源。

建议工具：

```bash
# 可选，Codex 可创建 package 后再用；当前无 package 不强制
npx --yes @axe-core/cli http://127.0.0.1:4173/
```

### 11.3 SEO / 分享

每个公开页面检查：

- `<title>` 描述性且唯一
- `<meta name="description">`
- `<link rel="canonical">`
- Open Graph:
  - `og:title`
  - `og:description`
  - `og:type`
  - `og:url`
  - `og:image`
- Twitter Card:
  - `twitter:card`
  - `twitter:title`
  - `twitter:description`
  - `twitter:image`
- favicon
- `robots.txt`
- `sitemap.xml`
- 可选 `feed.xml`
- JSON-LD：只在 About 与身份内容稳定后加入，不要编码弱事实
- `/review/` 保持 noindex，不要误推到主导航
- 内链 anchor 清楚，不要大量 `Read more`

建议 meta 策略：

```html
<title>HJR / YSCJRH — Fluorescence Analysis, Open Tools, Working Notes</title>
<meta name="description" content="Research-oriented personal website for HJR / YSCJRH across fluorescence analysis, intelligent algorithms, scientific instrumentation, open tools, and working notes.">
<link rel="canonical" href="https://yscjrh.github.io/">
```

---

## 12. Codex CLI `/goal` 执行蓝图

### 执行总原则

Codex 必须：

- 先读 `webimprove.md`、`README.md`、`personalweb.md`、`AGENTS.md`、`PLANS.md`。
- 从 M0 开始，不跳步。
- 每个 milestone 限定文件范围。
- 每完成一个 milestone 更新 `WEBIMPROVE_PROGRESS.md`。
- 每完成一个 milestone 运行对应验证。
- 验证失败先修复，不继续推进。
- 发现技术栈与本文假设不一致，先更新计划。
- 不编造个人事实、论文、奖项、联系方式、指标。
- 不引入第三方脚本、表单、后端、analytics，除非用户明确同意。
- `/review/` 是 unindexed internal review surface，不要擅自删除或推广。
- 需要产品方向或事实确认时，生成 blocker brief。

---

### M0：仓库侦察与基线记录

**目标**  
确认当前技术栈、页面、样式、脚本、验证方式与公开边界，创建 `WEBIMPROVE_PROGRESS.md`。

**修改范围**

- 新增或更新：`WEBIMPROVE_PROGRESS.md`
- 只读检查：`README.md`、`personalweb.md`、`AGENTS.md`、`PLANS.md`、`CONTENT_GAPS.md`、`index.html`、`projects/index.html`、`notes/index.html`、`styles.css`、`script.js`

**实施步骤**

1. 运行：

```bash
git status --short
find . -maxdepth 3 -type f | sort
```

2. 读取核心文档：

```text
README.md
personalweb.md
AGENTS.md
PLANS.md
CONTENT_GAPS.md
docs/manual-qa-checklist.md
```

3. 记录页面入口：

```text
/
 /projects/
 /notes/
 /notes/build-logs-homepage-second-pass.html
 /notes/when-a-fluorescence-signal-becomes-usable.html
 /review/
```

4. 识别：

- 技术栈
- 本地预览命令
- 是否有 SEO meta
- 是否有 sitemap / robots / RSS
- 是否有 tests / lint / format
- JS 的职责
- CSS 的主要模块结构

5. 创建 `WEBIMPROVE_PROGRESS.md`。

**验证命令**

```bash
python tools/serve.py
# fallback:
python -m http.server 4173
```

人工打开：

```text
http://127.0.0.1:4173/
http://127.0.0.1:4173/projects/
http://127.0.0.1:4173/notes/
```

**人工验收点**

- 页面能打开。
- 现有内容没有被修改。
- 进度日志准确记录现状。
- 没有执行发布动作。

**完成标准**

- `WEBIMPROVE_PROGRESS.md` 存在。
- M0 baseline 完整。
- 下一个 milestone 明确。

**风险与回滚**

- 风险：误改内容。  
  回滚：M0 只允许新增进度文件，不改页面。

---

### M1：首页信息架构与 Hero 改造

**目标**  
让首页第一屏更清晰，减少 CTA 竞争，明确访问者下一步。

**修改范围**

- `index.html`
- `styles.css`
- 必要时 `script.js`

**实施步骤**

1. 选择 Hero 方案 C 作为默认文案。
2. 首屏只保留 2 个主要 CTA：
   - `Explore projects / 查看项目`
   - `Read notes / 阅读笔记` 或 `Open GitHub / 打开 GitHub`
3. 将 AnswerLens / Skylattice / Instrument Lab 等次级入口移到 Hero 下方 compact strip。
4. 保留四个主题标签。
5. 确保中英文文案自然，不逐词堆叠。
6. 检查 heading：
   - 首页一个 `<h1>`
   - section 标题从 `<h2>` 开始

**验证命令**

```bash
python tools/serve.py
```

人工检查：

- 360px mobile viewport
- 768px tablet
- 1280px desktop

**人工验收点**

- 5 秒内能看出“研究者 + 构建者 + 开源工具”。
- CTA 不超过 2 个主按钮。
- 不引入夸大宣传。
- Hero 不遮挡导航。
- 移动端首屏不显得拥挤。

**完成标准**

- 首页 Hero 文案更新。
- CTA 层级清楚。
- `WEBIMPROVE_PROGRESS.md` 记录修改与截图/检查结果。

**风险与回滚**

- 风险：改得过度营销化。  
  回滚：恢复旧文案或采用方案 A 的研究者优先版本。

---

### M2：设计系统与全局样式整理

**目标**  
建立稳定 design tokens 与组件样式，减少视觉不一致。

**修改范围**

- `styles.css`
- 可选新增：`DESIGN_SYSTEM.md`

**实施步骤**

1. 在 `:root` 中整理：
   - color
   - typography
   - spacing
   - radius
   - shadow
   - breakpoints
2. 标准化：
   - `.button`
   - `.tag`
   - `.status`
   - `.card`
   - `.section`
   - `.eyebrow`
3. 保证 focus visible。
4. 加入 `prefers-reduced-motion`。
5. 不做暗色模式，除非 token 已稳定且影响很小。
6. 记录在 `DESIGN_SYSTEM.md`。

**验证命令**

```bash
python tools/serve.py
```

可选：

```bash
npx --yes lighthouse http://127.0.0.1:4173/ \
  --only-categories=accessibility,best-practices \
  --output=html \
  --output-path=reports/lighthouse-m2.html
```

**人工验收点**

- Hero / Research / Projects / Notes / About 风格一致。
- 项目卡片和研究卡片有区分。
- Focus outline 清楚。
- 没有明显色彩冲突。
- 移动端间距合理。

**完成标准**

- 设计 token 可读。
- 主要组件样式统一。
- `DESIGN_SYSTEM.md` 说明基本规则。

**风险与回滚**

- 风险：大规模 CSS 重排导致页面破碎。  
  回滚：按 section revert，保持旧布局可运行。

---

### M3：项目卡片与项目详情入口改造

**目标**  
将项目展示升级为统一的价值/状态/证据/入口模型。

**修改范围**

- `index.html`
- `projects/index.html`
- `styles.css`
- 可选新增：`CONTENT_MODEL.md`

**实施步骤**

1. 定义 Project Card 字段：
   - name
   - one_liner
   - status
   - audience
   - problem
   - proof
   - tags
   - links
   - not_for
2. 首页只突出 3 个精选项目。
3. `/projects/` 展示全部项目。
4. 对每个项目补充状态：
   - AnswerLens：Live / Public demo
   - skylattice：Stable docs / Local-first runtime
   - codex-via-phone：Repo-first / Security-sensitive
   - mirror-sim：Concept / Public demo mode
   - create-double-skill：Experimental tool
5. 所有项目入口使用统一 CTA 顺序：
   - Demo / Try
   - Docs
   - GitHub
6. 不编造 star、用户数、下载量、机构背书。

**验证命令**

```bash
python tools/serve.py
```

可选 link check：

```bash
python tools/check_links.py
```

如果没有该脚本，Codex 可在 M8 创建。

**人工验收点**

- 冷访问者能知道先看哪 3 个项目。
- 每张卡片都回答“为什么值得看”。
- 实验项目边界清楚。
- 项目不是模板化广告卡片。

**完成标准**

- 首页与 `/projects/` 项目结构一致。
- 项目状态与入口清楚。
- `CONTENT_MODEL.md` 初版记录项目字段。

**风险与回滚**

- 风险：项目描述与 README 不一致。  
  回滚：以各项目 README 为准，缩短网站卡片。

---

### M4：Notes / About 内容结构优化

**目标**  
让 Notes 成为可持续工作笔记系统，让 About 更有记忆点但不过度包装。

**修改范围**

- `index.html`
- `notes/index.html`
- note 页面
- 可选新增：`CONTENT_MODEL.md`

**实施步骤**

1. Notes 列表加入：
   - category promise
   - latest note
   - status
   - related project / direction
2. note 页面加入：
   - Published / Updated
   - Related
   - Back links
3. About 使用本文草稿，但必须检查与 `personalweb.md` 一致。
4. 不新增联系方式，除非已在仓库中明确提供。
5. 不编造个人事实。

**验证命令**

```bash
python tools/serve.py
```

**人工验收点**

- Notes 不像占位区。
- About 不像营销页。
- 中英文混排自然。
- 没有新增敏感私人信息。

**完成标准**

- `/notes/` 分类更清楚。
- About 文案清楚、克制。
- 进度日志记录事实边界。

**风险与回滚**

- 风险：About 过度包装。  
  回滚：恢复更短版本，只保留已确认事实。

---

### M5：响应式与移动端导航优化

**目标**  
确保手机端导航、首屏、项目卡片、笔记列表可读可用。

**修改范围**

- `styles.css`
- `script.js`
- header HTML in pages

**实施步骤**

1. 检查 mobile header 是否重复或拥挤。
2. 确保 mobile menu：
   - `aria-expanded`
   - keyboard usable
   - Escape close
   - focus order logical
3. 优化项目卡片移动端：
   - 单列
   - CTA 换行
   - tags 不挤压
4. 优化 Notes 列表移动端。
5. 检查触控目标大小。

**验证命令**

```bash
python tools/serve.py
```

人工用浏览器模拟：

- 320px
- 375px
- 414px
- 768px

**人工验收点**

- 手机端无横向滚动。
- 菜单可键盘操作。
- CTA 不重叠。
- 项目卡片能扫读。

**完成标准**

- 移动端核心页面可用。
- `WEBIMPROVE_PROGRESS.md` 记录断点检查结果。

**风险与回滚**

- 风险：桌面端布局被移动端 CSS 破坏。  
  回滚：使用 media query 缩小影响范围。

---

### M6：可访问性修复

**目标**  
消除明显 accessibility blocker。

**修改范围**

- HTML pages
- `styles.css`
- `script.js`
- 可选新增：`ACCESSIBILITY_CHECKLIST.md`

**实施步骤**

1. heading audit。
2. skip link audit。
3. focus visible audit。
4. keyboard nav audit。
5. color contrast audit。
6. alt text audit。
7. mobile menu ARIA audit。
8. reduced motion audit。
9. bilingual lang audit。
10. 记录清单。

**验证命令**

```bash
npx --yes lighthouse http://127.0.0.1:4173/ \
  --only-categories=accessibility \
  --output=html \
  --output-path=reports/lighthouse-a11y-home.html
```

可选：

```bash
npx --yes @axe-core/cli http://127.0.0.1:4173/
```

**人工验收点**

- Tab 顺序可理解。
- focus 清楚。
- 颜色对比无明显问题。
- 读屏结构基本合理。
- 链接文本不是大量 `Read more`。

**完成标准**

- 无明显 accessibility blocker。
- `ACCESSIBILITY_CHECKLIST.md` 存在。
- 进度日志记录未解决项。

**风险与回滚**

- 风险：为了通过工具分数乱加 ARIA。  
  回滚：优先语义 HTML，移除无意义 ARIA。

---

### M7：性能与 SEO 优化

**目标**  
建立性能、SEO、分享预览基线。

**修改范围**

- HTML `<head>`
- assets
- `robots.txt`
- `sitemap.xml`
- 可选 `feed.xml`
- 可选 `PERFORMANCE_CHECKLIST.md`

**实施步骤**

1. 为每页检查 `<title>` 与 description。
2. 加 canonical。
3. 加 Open Graph / Twitter Card。
4. 检查 favicon。
5. 创建或更新 `robots.txt`。
6. 创建或更新 `sitemap.xml`。
7. 检查 `/review/` noindex。
8. 优化图片尺寸与 alt。
9. 跑 Lighthouse / PageSpeed。
10. 记录性能基线。

**验证命令**

```bash
npx --yes lighthouse http://127.0.0.1:4173/ \
  --only-categories=performance,seo,best-practices \
  --output=html \
  --output-path=reports/lighthouse-seo-perf-home.html
```

可选：

```bash
curl -I http://127.0.0.1:4173/robots.txt
curl -I http://127.0.0.1:4173/sitemap.xml
```

**人工验收点**

- 分享标题描述准确。
- noindex 页面没有被主站推广。
- Lighthouse 没有明显 SEO blocker。
- 性能没有因视觉改造明显变差。

**完成标准**

- SEO meta 完整。
- sitemap / robots 存在。
- 性能基线记录在 `PERFORMANCE_CHECKLIST.md` 或进度日志。

**风险与回滚**

- 风险：JSON-LD 编码不确定个人事实。  
  回滚：先不加 JSON-LD，等 About 内容稳定。

---

### M8：文档、验证脚本、维护说明补齐

**目标**  
让未来维护更轻，Codex 能持续检查站点。

**修改范围**

- `README.md`
- `AGENTS.md`
- `WEBIMPROVE_PROGRESS.md`
- `DESIGN_SYSTEM.md`
- `CONTENT_MODEL.md`
- `ACCESSIBILITY_CHECKLIST.md`
- `PERFORMANCE_CHECKLIST.md`
- `tools/`

**实施步骤**

1. 更新 README 的本地预览、页面列表、维护文件。
2. 若合适，在 AGENTS 中加入本次学到的规则。
3. 创建轻量 link checker 或 HTML sanity checker。
4. 记录项目卡片字段。
5. 记录 note 字段。
6. 记录 Lighthouse 手动流程。
7. 可选创建 `feed.xml` 维护说明。

**验证命令**

```bash
python tools/serve.py
python tools/check_site.py
```

若脚本不存在，M8 创建。

**人工验收点**

- 新维护者知道从哪里开始。
- Codex 知道验证命令。
- 文档没有与 `personalweb.md` 冲突。
- 辅助文件不是空壳。

**完成标准**

- 维护说明完整。
- 检查脚本能运行。
- 进度日志完整。

**风险与回滚**

- 风险：文档过多导致维护负担。  
  回滚：合并重复文档，保留最有用的 3–5 个。

---

### M9：最终审查与发布前检查

**目标**  
完成全站审查，确认可发布或已符合当前发布状态。

**修改范围**

- 全站只做修复，不做新功能。
- `WEBIMPROVE_PROGRESS.md`

**实施步骤**

1. 全站浏览：
   - `/`
   - `/projects/`
   - `/notes/`
   - published note pages
   - `/review/` noindex check
2. 全站链接检查。
3. Lighthouse home/projects/notes。
4. 移动端检查。
5. keyboard-only 检查。
6. Git diff 审查。
7. 记录最终状态。

**验证命令**

```bash
git status --short
git diff --stat
python tools/serve.py
python tools/check_site.py
```

Lighthouse：

```bash
npx --yes lighthouse http://127.0.0.1:4173/ --output=html --output-path=reports/final-home.html
npx --yes lighthouse http://127.0.0.1:4173/projects/ --output=html --output-path=reports/final-projects.html
npx --yes lighthouse http://127.0.0.1:4173/notes/ --output=html --output-path=reports/final-notes.html
```

**人工验收点**

- 首页第一屏清楚。
- 项目入口清楚。
- 移动端可用。
- 无明显 accessibility blocker。
- SEO meta 完整。
- 风格统一。
- 内容没有过度营销化。
- 进度日志完整。

**完成标准**

- 所有 M0–M9 完成或明确记录未完成原因。
- 验证失败项已修复或记录为 blocker。
- Codex 停止，不继续扩大范围。

**风险与回滚**

- 风险：最后阶段又引入新设计想法。  
  回滚：M9 只修复，不新增功能。

---

## 13. 给 Codex CLI 的 `/goal` 命令

建议先在 Codex CLI 中启用 goal 功能：

```toml
[features]
goals = true
```

然后在仓库根目录运行：

```text
/goal Implement webimprove.md milestone by milestone. Start by reading webimprove.md, README.md, personalweb.md, AGENTS.md, PLANS.md, CONTENT_GAPS.md, and docs/manual-qa-checklist.md. Begin with M0 repository reconnaissance, create or update WEBIMPROVE_PROGRESS.md, make scoped changes only, and run the appropriate validation commands after every milestone. Fix validation failures before continuing. If the actual tech stack or repository state conflicts with webimprove.md, update the plan and record the reason instead of forcing the change. Do not invent personal facts, publications, affiliations, metrics, contact methods, or project claims. Do not add third-party analytics, forms, backends, tracking scripts, or framework migrations unless explicitly approved. Preserve the research-builder-open-tools tone. Stop only when all acceptance criteria in webimprove.md are satisfied, or when a product/design/factual decision requires human input; in that case, write a blocker brief in WEBIMPROVE_PROGRESS.md.
```

更短版本：

```text
/goal Implement webimprove.md M0-M9 in order. Read the project docs first, keep WEBIMPROVE_PROGRESS.md updated after every milestone, make scoped changes only, run validation after each milestone, fix failures before moving on, preserve truthfulness and the research-builder tone, and stop only when all acceptance criteria pass or a real product/design/factual blocker requires human input.
```

---

## 14. 建议新增的辅助文件

### 14.1 `webimprove.md`

用途：

- 本轮改造蓝图。
- Codex `/goal` 的主要任务契约。
- 后续 roadmap 的来源文档。

### 14.2 `WEBIMPROVE_PROGRESS.md`

用途：

- 记录 M0–M9 状态。
- 每个 milestone 包含：
  - date
  - files changed
  - commands run
  - validation result
  - screenshots/manual checks
  - blockers
  - next step

模板：

```markdown
# WEBIMPROVE_PROGRESS.md

## Current milestone
- Active:
- Status:
- Last updated:

## M0 Repository reconnaissance
- Status:
- Files changed:
- Commands:
- Findings:
- Risks:
- Next:

## Blockers
```

### 14.3 `DESIGN_SYSTEM.md`

用途：

- 记录颜色、字体、间距、按钮、卡片、标签、断点。
- 避免 CSS 越写越散。
- 供 Codex 修改样式前读取。

### 14.4 `CONTENT_MODEL.md`

用途：

- 记录 Project Card 字段。
- 记录 Note Card 字段。
- 记录 About 事实边界。
- 记录哪些内容不可编造。

### 14.5 `ACCESSIBILITY_CHECKLIST.md`

用途：

- 手动和自动 a11y 检查。
- 保存 Lighthouse / axe 结果摘要。
- 记录未解决项。

### 14.6 `PERFORMANCE_CHECKLIST.md`

用途：

- Lighthouse / PageSpeed 检查流程。
- Core Web Vitals 目标。
- 图片、字体、CSS、JS 策略。
- 发布前检查。

### 14.7 `AGENTS.md`

当前仓库已有 `AGENTS.md`。建议只补充本轮稳定规则，不要重写：

- 每个 milestone 更新 `WEBIMPROVE_PROGRESS.md`
- 不新增私人信息
- 不过度营销
- `/review/` 不推广
- 静态站优先
- 框架迁移必须先 blocker/decision
- 验证失败先修复

---

## 15. 验收标准

最终完成时应满足：

1. **首页第一屏清楚**  
   5–10 秒内能理解身份、方向、下一步。

2. **项目入口清楚**  
   首页 3 个精选项目优先级明确，`/projects/` 全部项目状态、证据、入口一致。

3. **移动端体验可用**  
   无横向滚动，导航可用，卡片可扫读，CTA 不重叠。

4. **Lighthouse 分数达到合理目标**  
   静态站目标：
   - Performance mobile ≥ 90
   - Accessibility ≥ 90
   - Best Practices ≥ 90
   - SEO ≥ 90  
   若未达标，必须记录原因与下一步。

5. **无明显可访问性 blocker**  
   heading、focus、键盘导航、contrast、alt、reduced motion 基本通过。

6. **SEO meta 完整**  
   title、description、canonical、OG、Twitter Card、favicon、sitemap、robots 处理完成。

7. **站点本地预览成功**  
   `python tools/serve.py` 或 fallback 可打开核心页面。

8. **README 或维护文档更新**  
   新维护者知道如何预览、检查、继续维护。

9. **Codex 进度日志完整**  
   `WEBIMPROVE_PROGRESS.md` 包含 M0–M9 状态、命令、风险、未完成项。

10. **页面风格统一**  
    Hero、Research、Projects、Notes、About 使用同一设计系统。

11. **内容没有过度营销化**  
    无编造成果、无夸大指标、无未确认联系方式。

12. **公开边界保持清楚**  
    `/review/` 不被误推广；草稿不被误公开；敏感项目有边界说明。

---

## 16. 风险控制

### 16.1 视觉过度设计

风险：

- 网站变成 AI SaaS 模板。
- 渐变、动效、卡片过多，削弱研究可信度。

避免：

- 使用低饱和色。
- 保留留白。
- Hero 不做夸张动效。
- 每个视觉元素必须服务信息层级。

### 16.2 内容重写失真

风险：

- About 或项目卡片写出未证实成果。
- 把实验性项目包装成成熟产品。

避免：

- 所有事实以仓库 README / 用户提供 / public docs 为准。
- 缺信息时写 `待补充` 或更抽象表述。
- 项目卡片保留 `not_for` 字段。

### 16.3 中英文混排混乱

风险：

- 页面高度过大。
- 标签过多。
- 英文和中文相互重复，影响扫读。

避免：

- 短标签成对。
- 长文分段。
- 移动端允许换行。
- 不逐词翻译所有 UI。

### 16.4 Codex 自动改太多文件

风险：

- 一个 milestone 改动过大，难以 review。
- Header/footer 同步时引入不一致。

避免：

- 每个 milestone 限定文件范围。
- 每步更新 `WEBIMPROVE_PROGRESS.md`。
- 每次跑 `git diff --stat`。
- 大改前先计划。

### 16.5 GitHub Pages 构建失败

风险：

- `.nojekyll`、路径、大小写、base URL、404 等问题。
- 引入构建链后部署复杂化。

避免：

- 近期保持纯静态。
- 不引入框架。
- 本地使用 127.0.0.1 预览。
- 若框架迁移，单独 decision。

### 16.6 无测试情况下误改页面

风险：

- HTML 结构破坏。
- 链接断裂。
- mobile nav 失效。

避免：

- M8 创建 `tools/check_site.py`。
- 使用 Lighthouse 和手动浏览器 QA。
- 每次只改一个区域。
- 先检查核心页面再继续。

### 16.7 SEO / accessibility 只做表面修复

风险：

- 为了分数乱加 ARIA。
- meta 写得漂亮但内容不真实。
- OG 图与页面不匹配。

避免：

- 优先语义 HTML。
- 先修 heading、focus、contrast。
- SEO 描述只写真实内容。
- JSON-LD 暂缓到 About 稳定后。

### 16.8 框架迁移过早

风险：

- 原本简单的 GitHub Pages 站点变成高维护成本项目。
- 视觉打磨和框架迁移互相干扰。

避免：

- M0–M9 不迁移框架。
- 只有 Notes/Projects 明显增长后，再写独立迁移计划。
- Astro/Jekyll/Eleventy 只作为后续候选。

---

## 17. 最终输出格式与执行建议

本文件生成后，建议执行顺序：

1. 把 `webimprove.md` 放入仓库根目录。
2. 在 Codex CLI 中启用 goal 功能。
3. 运行第 13 节 `/goal` 命令。
4. 让 Codex 从 M0 开始。
5. 每个 milestone 后检查 `WEBIMPROVE_PROGRESS.md`。
6. 如果出现事实、品牌、联系方式、框架迁移、发布边界问题，让 Codex 写 blocker brief，不要硬做。

第一条建议执行的命令：

```text
/goal Implement webimprove.md milestone by milestone. Start by reading webimprove.md, README.md, personalweb.md, AGENTS.md, PLANS.md, CONTENT_GAPS.md, and docs/manual-qa-checklist.md. Begin with M0 repository reconnaissance, create or update WEBIMPROVE_PROGRESS.md, make scoped changes only, and run the appropriate validation commands after every milestone. Fix validation failures before continuing. If the actual tech stack or repository state conflicts with webimprove.md, update the plan and record the reason instead of forcing the change. Do not invent personal facts, publications, affiliations, metrics, contact methods, or project claims. Do not add third-party analytics, forms, backends, tracking scripts, or framework migrations unless explicitly approved. Preserve the research-builder-open-tools tone. Stop only when all acceptance criteria in webimprove.md are satisfied, or when a product/design/factual decision requires human input; in that case, write a blocker brief in WEBIMPROVE_PROGRESS.md.
```

---

## 18. 来源依据

### 18.1 站点与仓库调研

- `yscjrh.github.io` 首页：<https://yscjrh.github.io/>
- Projects 页面：<https://yscjrh.github.io/projects/>
- Notes 页面：<https://yscjrh.github.io/notes/>
- Build Log note：<https://yscjrh.github.io/notes/build-logs-homepage-second-pass.html>
- Research Reflection note：<https://yscjrh.github.io/notes/when-a-fluorescence-signal-becomes-usable.html>
- 网站源码仓库：<https://github.com/YSCJRH/yscjrh.github.io>
- 网站 README：<https://raw.githubusercontent.com/YSCJRH/yscjrh.github.io/main/README.md>
- 网站 `personalweb.md`：<https://raw.githubusercontent.com/YSCJRH/yscjrh.github.io/main/personalweb.md>
- AnswerLens 仓库：<https://github.com/YSCJRH/ai-visibility-auditor>
- codex-via-phone 仓库：<https://github.com/YSCJRH/codex-via-phone>
- Skylattice docs：<https://yscjrh.github.io/skylattice/>
- Skylattice 仓库：<https://github.com/YSCJRH/skylattice>
- mirror-sim 仓库：<https://github.com/YSCJRH/mirror-sim>
- create-double-skill 仓库：<https://github.com/YSCJRH/create-double-skill>

### 18.2 Codex `/goal` 与 agent 执行

- OpenAI Codex: Follow a goal：<https://developers.openai.com/codex/use-cases/follow-goals>
- OpenAI Codex CLI slash commands：<https://developers.openai.com/codex/cli/slash-commands>
- OpenAI Codex best practices：<https://developers.openai.com/codex/learn/best-practices>

### 18.3 UX / 首页 / 信息架构 / 项目展示

- NN/g Homepage usability guidelines：<https://www.nngroup.com/articles/113-design-guidelines-homepage-usability/>
- NN/g Information scent：<https://www.nngroup.com/articles/information-scent/>
- NN/g IA mistakes and clear labels：<https://www.nngroup.com/articles/3-ia-mistakes/>
- NN/g UX portfolio project selection：<https://www.nngroup.com/articles/ux-design-portfolios/>
- NN/g UX case study video：<https://www.nngroup.com/videos/ux-design-portfolio-case-study/>

### 18.4 性能、SEO、可访问性、GitHub Pages

- web.dev Web Vitals：<https://web.dev/articles/vitals>
- Google PageSpeed Insights docs：<https://developers.google.com/speed/docs/insights/v5/about>
- Chrome Lighthouse overview：<https://developer.chrome.com/docs/lighthouse/overview>
- W3C WCAG 2.2 Quick Reference：<https://www.w3.org/WAI/WCAG22/quickref/>
- Google SEO Starter Guide：<https://developers.google.com/search/docs/fundamentals/seo-starter-guide>
- GitHub Pages with Jekyll docs：<https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll>
- Open Graph Protocol：<https://ogp.me/>

---

## 19. 给未来 Codex 的最后提醒

这个网站不是为了显得“内容很多”。

它真正要表达的是：

> fluorescence analysis + intelligent algorithms + scientific instruments + open-source building + working notes

当不确定时，优先选择：

1. 清晰
2. 真实
3. 可检查
4. 可维护
5. 克制

不要让页面看起来比证据更确定。
