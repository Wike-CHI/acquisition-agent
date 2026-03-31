# WorkBuddy × FBS-BookWriter：用好宿主，再用好技能（全局洞察）

> **读者**：在 **WorkBuddy** 中使用本 Skill 的写作者、主编与集成方。  
> **官方底座**：[WorkBuddy 简介](https://www.codebuddy.cn/docs/workbuddy/Overview)（腾讯 CodeBuddy 文档）——理解用户**从哪里来**、**如何下达任务**、**工作台如何交付可验收结果**。  
> **本文件**：把官方叙事与 **FBS-BookWriter** 对齐，形成**高维一致心智模型**：**用好 WorkBuddy 是用好福帮手 Skill 的前提**；Skill 是宿主里的**一种能力、一类长文档场景**，不是孤立的「另一套产品」。

---

## 1. 官方心智：WorkBuddy 在干什么

依据 [WorkBuddy 简介](https://www.codebuddy.cn/docs/workbuddy/Overview) 的表述，可归纳为四条**宿主层**事实（与 Skill 无冲突）：

| 维度 | 要点 | 对写书 Skill 的含义 |
|------|------|---------------------|
| **入口** | 一句话描述需求，少步骤 | 用户说「写书」「写白皮书」等触发词时，宿主已承担「任务封装」 |
| **执行** | 自主拆解、规划、执行 | S0–S6 的**阶段推进**由模型 + 工具在**任务会话**内完成；Skill 提供规范与门禁，不替代宿主调度 |
| **形态** | 文档、表格、PPT、数据等多模态 | 本书以 **MD/HTML** 为主力交付；图表、封面等仍依赖宿主文件与可视化能力 |
| **落地** | 授权本地文件夹、批量处理、**可验收结果** | 成书目录、`.fbs` 账本、`assets/build.mjs` 等均在**用户可见的文件与结果区**闭环 |

**结论**：用户感知到的是 **WorkBuddy 这位「同事」** 在干活；FBS-BookWriter 是这位同事在写书场景下读的**专业手册与质检标准**。

---

## 2. 用户旅程：从入手到终局（与官方阅读顺序对齐）

官方建议的阅读顺序包含：**快速开始 → 创建任务 → 任务管理 → 任务对话 → 结果查看**（见 [WorkBuddy 简介](https://www.codebuddy.cn/docs/workbuddy/Overview) 文末「建议阅读顺序」）。映射到 **本书技能** 时，可理解为：

| 宿主阶段（官方） | 用户在做的事 | FBS 侧应出现的体验 |
|------------------|--------------|-------------------|
| **快速开始 / 进入工作台** | 安装、授权、熟悉界面 | 用户发现 **技能市场** 中的 FBS-BookWriter；首次任务不必读完 `references/` |
| **创建任务** | 选模式、写任务描述、补上下文（目录、文件） | 用触发词或显式选用 Skill；**一书一目录**或 monorepo 路径写清楚，便于检索账本与构建 |
| **任务管理** | 多任务、状态、续作 | 长文档天然跨会话：断点、版本、**下一章** 与 `section-3-workflow` 审批点一致 |
| **任务对话** | 追问、上传、顶部操作 | **S3 成文 / S5 终审** 的迭代发生在这里；联网检索、多成员话术在对话层触发 |
| **结果查看** | 右侧产物、文件、变更、预览 | **终局可验收**：章节 MD、全书稿、可选 HTML/PDF；与 `delivery.md`、S6 发布一致 |

**终局**：不是「模型说完再见」，而是用户在结果区**拿到能打开、能交付、能归档的文件**，并明确是否已通过 S5/C0 等门禁（见 `quality-check.md`、`book-level-consistency.md`）。

---

## 3. Skill 在 WorkBuddy 中的位置

- **Skill** = 宿主支持的 **能力包**（规范 + 触发词 + `references/`）；**一个场景**可对应多阶段（S0–S6）。  
- **任务** = 用户当下要完成的**一件事**（例如「这本书写到第 5 章并通过质检」）。  
- **关系**：同一任务会话内选用 FBS-BookWriter，模型应按 `SKILL.md` 的**技能加载后的行为约定**行事；宿主继续负责任务生命周期、文件授权与结果展示。

避免两种误解：

1. **不要把 Skill 当成「脱离 WorkBuddy 的离线说明书」**——执行与交付仍在宿主内完成。  
2. **不要把 WorkBuddy 当成「只会闲聊的对话框」**——简介明确强调**实际执行任务**与**可验收结果**（见 [对比表](https://www.codebuddy.cn/docs/workbuddy/Overview)），写书流程应充分利用任务与文件能力。

---

## 4. 「助手与朋友」：执行姿态（给模型与产品）

官方表述是「像**同事**一样自主规划与执行」。本 Skill 在此基础上对齐三条**福帮手侧**约定，与 `SKILL.md` §1 渐进式输出、触发词首响、合规红线一致：

1. **助手**：先给阶段结论与下一步，少让用户猜；长步骤主动播报进度（对应宿主「任务对话」里的可见性）。  
2. **朋友**：拒绝冷冰冰甩锅——检索失败、工具超时、门禁未过时，说明**可重试项**与**风险**，不假装已查证。  
3. **尊重终局**：用户要在「结果查看」里验收；未过 S5/C0 不冒充终稿，与 G3 等阻断条款一致。

---

## 5. 宿主 `.workbuddy/memory` 与本书主题锁（分工）

WorkBuddy 在用户目录或工作区下常见的 **`MEMORY.md` + 按日 `YYYY-MM-DD.md`**，形态多为 **Markdown 叙事与表格**：沉淀**跨任务偏好、项目路径、会话摘要**，服务宿主「记得你是谁、最近在忙什么」。这与 **本书工作区内** 的 **S0 简报首行 `**主题**`、可选 `.fbs/topic-lock.json`** 不在同一层：

| 层级 | 典型位置 | 主要用途 |
|------|----------|----------|
| **宿主记忆** | 如工作区 `.workbuddy/memory/` | 人可读档案、跨书/跨任务上下文；**不得**替代当前书的主题门禁 |
| **本书主题锁** | S0/S1 产出首行 + `.fbs` 约定（见 `topic-consistency-gate.md`） | **防上下文跳变**（P0）；阶段切换与「确认」话术必须对齐锁定主题 |

集成方应：**加载宿主记忆时仍要执行 C0-4 / GATE**（校验记忆片段是否与**当前书**主题一致）；冲突时 **ASK_CONFIRMATION**，禁止静默把别书摘要当成本书事实。

**可执行补充（v1.18.5）**：在宿主演进前提下，用 **opt-in** CLI 生成有界摘要并落盘 `.fbs/workbuddy-memory-digest.json`（**默认脱敏路径**），流程与边界见 **[`workbuddy-user-memory-strategy.md`](./workbuddy-user-memory-strategy.md)**（与 `search-policy.json` 的 `userMemoryIntegration` 对齐）。

**首次使用与环境迭代（研究稿）**：冷启动上下文与宿主快速迭代下的体验优化，采用 **分级策略**；完整条款与「确认后再改代码」的里程碑见 **[`workbuddy-first-use-environment-tiered-strategy.md`](./workbuddy-first-use-environment-tiered-strategy.md)**。

---

## 6. 与本包其他文档的衔接

| 文档 | 衔接点 |
|------|--------|
| [`SKILL.md`](../../SKILL.md) | 宿主名、触发词、§0 总纲与行为约定 |
| [`section-3-workflow.md`](../01-core/section-3-workflow.md) | 七阶段与审批点（任务内时间线） |
| [`topic-consistency-gate.md`](./topic-consistency-gate.md) | 主题锁定流程与 GATE 清单（P0） |
| [`workbuddy-user-memory-strategy.md`](./workbuddy-user-memory-strategy.md) | 用户记忆演进下的稳妥摄取与 CLI |
| [`workbuddy-first-use-environment-tiered-strategy.md`](./workbuddy-first-use-environment-tiered-strategy.md) | 首次使用 + 环境迭代：分级策略（待确认后落地代码） |
| [`workbuddy-agent-briefings.md`](../01-core/workbuddy-agent-briefings.md) | 多成员自然语言模板（任务内协作） |
| [`codebuddy-memory-workbuddy-integration.md`](./codebuddy-memory-workbuddy-integration.md) | 记忆与规则降 token（跨任务/跨文件的锚点） |
| [`doc-code-consistency.md`](./doc-code-consistency.md) | 文档承诺 vs 可执行脚本边界 |

---

## 7. 维护说明

- 官方导航或产品名变更时，以 [WorkBuddy 简介](https://www.codebuddy.cn/docs/workbuddy/Overview) 当前版本为准，更新本节链接与阶段名称。  
- 本文件**不**复述全文操作截图；操作细节请用户直接阅读官方「快速开始」等子文档。
