# 文档与代码一致性审计

> **用户向全局对照**（承诺 / 建议 / 代码一张表）：[`promise-code-user-alignment.md`](./promise-code-user-alignment.md)。  
> 维护说明：本文件记录「规范文档声称的能力」与「仓库内可执行代码」的对照结果；随仓库变更应更新。

**审计日期**：以 Git 提交为准  
**代码范围**：技能包根下 `integration/**/*.js`（含 `integration/lib/**`）、`scenarios/**/backend/*.js`、`assets/*.{mjs,js,css}`（不含 `references/`、`SKILL.md` 正文审计）。**生产 zip**（`scripts/package-production.mjs`）在目录存在时**纳入** `integration/`、`scenarios/`；**CodeBuddy 最小上架**仍可仅发文档包，见 [`codebuddy-skill-delivery.md`](./codebuddy-skill-delivery.md)。

## 结论摘要

| 类别 | 说明 |
|------|------|
| **规范主体** | 写作流程、质量规则、检索门禁等多由 `SKILL.md` 与 `references/` 描述，由 **宿主**（CodeBuddy Code / WorkBuddy 等）执行，**不依赖**本仓库内业务后端。 |
| **integration/** | 提供场景路由、适配器与接口约定；**社媒 / 调研 / 企业** 三场景已随仓库提供 **参考实现**（`scenarios/.../backend/index.js`），可完成 `require` 与 `ScenarioManager` 初始化；业务深度仍以宿主 Skill 会话为主。详见 [`efficiency-implementation.md`](./efficiency-implementation.md)。 |
| **default 场景** | `ScenarioManager` 的 `default` 需注入 `workflowEngine`。本仓库提供 **`createDefaultBookWorkflowEngine({ skillRoot, bookRoot, progressThrottleMs, … })`**（`integration/lib/BookWorkflowOrchestrator.js`）：按 `search-policy.json` 执行 **S0 并行检索包**、**章前检索门禁**、**多角色章内流水线**（宿主注入 `webSearch` 与可选 `agents.*`）；**S5** `s5_release_gate` 支持 **`fullManuscriptText`** 自动核算全书破折号密度（**C0-1**，与 `book-level-consistency.md` / `qualityGate` 阈值对齐），未注入则仍无检索 handler。 |
| **assets/build.mjs** | 与 **canonical** `references/05-ops/build.md`、`03-product/06-typography.md` 描述一致（根级 `references/build.md` 等为 stub）：在本地安装 `markdown-it` / `puppeteer` / `html-to-docx` 后可做 MD→HTML/PDF/DOCX；未安装依赖时按脚本内降级处理。 |

## 文档中易误解的表述（建议宿主侧理解）

- **新手引导 / NLU 拦截 / 积分 / 偏好面板**：`section-8-onboarding.md`、`points-system.md` 等描述的是 **产品与交互规范**，不是本仓库内的 React/Node 实现。
- **社媒多平台、热点追踪、自动监控**：`SKILL.md` 与集成设计中的能力需 **宿主调度 + 联网工具**；`integration` 仅为对接骨架。
- **64 条短指令（经复核，见 `section-4-commands.md`）/ Critic 并行**：由宿主按文档执行；其中 **技能包落地** 10 条对应 `integration/*.mjs`（含 **`workbuddy-memory-digest.mjs`**、**`workbuddy-environment-snapshot.mjs`**）与 `scripts/init-project-memory.mjs`。  
- **纯文档一致性**：技能根目录可执行 `node scripts/audit-skill-consistency.mjs`（stub、S5、旧版短指令误计数等），**不**替代宿主侧 NLU 测试。
- **多路并行（v1.18.8+）**：`scripts/init-fbs-multiagent-artifacts.mjs`（含本书根 **`chapter-status.md`** 镜像）、`sync-book-chapter-index.mjs`、`chapter-scheduler-hint.mjs`、**`shared-knowledge-base.mjs`**；`integration/chapter-dependency-gate.mjs`；`integration/heartbeat-watchdog.mjs`（别名 **`heartbeat-monitor.mjs`**）、`integration/task-queue-helper.mjs`（别名 **`task-requeue.mjs`**）、`citation-format-check.mjs`、`terminology-gate.mjs`；库导出 **`HeartbeatService`**（`integration/lib/index.js`）。**不**提供全自动 DAG 调度器，详见 [`architecture-modes.md`](./architecture-modes.md)；Coordinator/Arbiter 为 **文档级话术**（[`coordinator-arbiter-briefs.md`](../01-core/coordinator-arbiter-briefs.md)）。
- **`global-research-scenario.md` / `global-region-language-matrix.md`**：正文存在历史编码损坏（乱码）段落时，请以 [`global.md`](../04-business/global.md) 及同目录其它可读文件为准，或从备份恢复 UTF-8 源文。

## 多智能体 / 联网检索 / 系统记忆（增效能力 triage）

> 目的：防止「文档写得很全、仓库里却没有对应可执行实现」的误解。下列三项是用户最关心的**增效点**，须与 **宿主（CodeBuddy / WorkBuddy）** 能力区分。

### 1. 自动建立多智能体（Agent Teams / 并行 Task）

| 层面 | 事实 |
|------|------|
| **文档** | `SKILL.md` §1、`workbuddy-agent-briefings.md` 提供 **自然语言话术**与分工建议；指向 [Agent Teams 官方说明](https://www.codebuddy.cn/docs/cli/agent-teams)（宿主功能）。 |
| **本仓库代码** | **无** 调用宿主 Agent Teams API 的脚本；`integration/lib` 提供 **BookWorkflowOrchestrator**（S0 并行检索、章前门禁、多角色流水线占位）与 **检索账本**；另 **`integration/multiagent-orchestrator.mjs`** 仅输出可复制 Task 骨架。`scenarios/.../backend` 为可加载场景类（见 [`efficiency-implementation.md`](./efficiency-implementation.md)）。`default` 场景须注入 `workflowEngine`（可用 `createDefaultBookWorkflowEngine`）。 |
| **正确理解** | 多智能体增效 = **用户在宿主内**按文档话术建队 / 并行子任务；技能包提供 **规范与可复制指令**，不是内置机器人编队服务。 |

### 2. 联网搜索（WebSearch / WebFetch）

| 层面 | 事实 |
|------|------|
| **文档** | `search-policy.json`、§3.0.5 定义 **门禁与次数期望**；`SKILL.md` Frontmatter `allowed-tools` 列出宿主**可能**提供的工具名。 |
| **本仓库代码** | **无** 搜索引擎实现、无对公网 API 的封装；`integration` 里 `setWebSearch(fn)` 仅为 **注入点**，需宿主传入真实 `fn`。另随包提供 **`integration/enforce-search-policy.mjs`**：对 `.fbs/search-ledger.jsonl` 或章节 MD 内「检索与来源」做 **离线门禁校验**（不代替实际 WebSearch）。 |
| **正确理解** | 「强制联网查证」= **执行方（模型+宿主工具）** 按规范调用检索；不是本仓库在后台自动跑爬虫或计次服务。CI/宿主可在落稿后调用上述 CLI 阻断「零检索落稿」。 |

### 3. 系统记忆（CodeBuddy Memory / 降 token）

| 层面 | 事实 |
|------|------|
| **文档** | [`codebuddy-memory-workbuddy-integration.md`](./codebuddy-memory-workbuddy-integration.md) 与官方 [管理 CodeBuddy 的记忆](https://www.codebuddy.cn/docs/cli/memory) 对齐，说明 `CODEBUDDY.md`、规则、`/memory`、Auto Memory 等。 |
| **本仓库代码** | 若存在 `scripts/apply-book-memory-template.mjs`：向**本书项目目录**写入/合并模板片段（需用户 **手动执行** Node 命令）；**不**在 Skill 加载时自动改写宿主记忆库。另 **`scripts/init-project-memory.mjs`** 在扩展脚本存在时串联调用。最小技能包可能仅含 `references/05-ops/templates/` 由用户自行复制。 |
| **正确理解** | 记忆增效 = **宿主产品能力** + **成书项目侧**可选脚本；技能包提供 **模板与约定**，不是内置记忆引擎进程。 |

### 反「偷懒」检查清单（维护者自用）

- [ ] `SKILL.md` 中「自动」「并行」等词若指 **工作流行为**，应能理解为 **宿主会话内** 由模型+工具执行，而非仓库内守护进程。  
- [ ] 介绍 `integration/` 时始终带一句：**骨架 / 需注入**，除非已补全 `scenarios/` 与真实 `workflowEngine`。  
- [ ] 更新 `search-policy.json` 后，区分 **会话内检索**（宿主工具）与 **随包 CLI**（`enforce-search-policy.mjs`）；勿声称「安装技能即自动全网检索」，但可写「可在 CI 调用 CLI 校验账本/章节摘要」。  
- [ ] **模型侧**：不得在未实际调用检索工具时声称已完成 `search-policy` 门禁或已「联网核对」；事实型句子须可指向检索摘要或账本记录。  
- [ ] **集成侧**：宿主注入的 `webSearch` 若本身无超时，应依赖 `integration/lib/SearchBundle.js` 对单次查询的 **默认 15s** 包裹（`BookWorkflowOrchestrator` 可传 `searchTimeoutMs` 覆盖；策略项见 `search-policy.json.searchAccessPolicy.singlePageTimeoutMs`），避免检索挂死拖死整段流水线。  
- [ ] **体验侧**：长步骤须符合 `SKILL.md` §1 渐进式输出；S0 跳过须有用户可见说明（见 `section-3-workflow`），与「静默继续」类禁止性条款一致。  

### 全局一致性速查（改一处、查三处）

| 你改了… | 建议同步核对 |
|---------|----------------|
| `search-policy.json`（章前次数 / 阶段列表） | `SKILL.md` §0 联网规范、`section-3-workflow` §3.0.5、`efficiency-implementation.md` |
| `SKILL.md` 触发词或 §0 阈值 | YAML `description`、价值承诺块、`global-delivery-consistency.md` §4 |
| S/P/C/B/V1 分值或条数 | `references/02-quality/metrics.md`、`quality-check.md`；根级 `references/metrics.md` 仅为 **stub** |
| `strategy.md` 深度轴静默分 | `SKILL.md` §0 **策略深度轴·静默分 8.0** 与全书通过线 **7.5** 分列；勿混算 |
| `pricing.md`（`04-business`）/ `pricing-packages.md`（`05-ops`） | `SKILL.md` 定价或套餐表述；`product-framework`；`global-delivery-consistency.md` §4 |
| `kpi-dictionary.md` | `metrics.md` 附录；`SKILL.md` 若出现 KPI 名称或口径 |
| `global-delivery-consistency.md` | `SKILL.md` 组成表与全局一致性链接；`doc-code-consistency.md`（本表）；触发词/阶段叙述 |
| `promise-code-user-alignment.md` | 主表字段与 `efficiency-implementation` 文件索引；`SKILL.md` §0 规范索引行 |
| `user-vs-maintainer-scope.md` | `skill-index` 维护者专区、`SKILL` 索引行；勿把发版文档塞进写作者必读 |
| `section-3-workflow.md` §S3 防卡顿 | `SKILL.md` §0 模型执行句；`SearchBundle.executeChapterGate` 的 `onProgress` |
| `section-3-workflow.md` §S4 防卡顿 / 长耗时表 | `SKILL.md` §0；`assets/build.mjs` 的 `buildProgress`（`[S4/build]`） |
| `book-level-consistency.md` / `quality-check.md` **C0** | `quality-S.md` S6、`section-3-workflow` S5 与 **S5-G5**、`metrics.md` C0 注、`SKILL.md` §1 |
| `national-standards-editorial-checklist.md` | `typography.md` §十、`quality-check` 国标段；**代码层无 CY/T 266 计错引擎**，`BookLevelConsistency` 仅 C0-1 破折号密度 |

## 建议

1. 若上架 **纯文档技能包**：不要将 `integration/` 表述为「已就绪后端」；或从交付包中移除 `integration/`。  
2. 若需 **可运行集成**：三场景已有最小 `backend/index.js`；可在此基础上扩展真实业务，或改写适配器对接自有模块。  
3. 在 `SKILL.md` 或 skill-index 中保留指向 **本审计文件** 的链接，避免读者以为仓库内包含完整产品实现。  
4. **终端用户与交付经理**：优先阅读 [`promise-code-user-alignment.md`](./promise-code-user-alignment.md)，按 **P0/P1/P2** 建议配置宿主与本地 CLI，再读本文件的 triage 细节。
