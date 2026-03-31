# 文档承诺 × 用户建议 × 代码落实（全局一致性）

> **用途**：把 **规范里承诺的事**、**给用户的建议**、**仓库里真实存在的可执行物** 放在一张表里，避免「读了 SKILL 以为全自动，其实要宿主 + 人工」。  
> **配套**：[`doc-code-consistency.md`](./doc-code-consistency.md)（技术边界）、[`consistency-insights.md`](./consistency-insights.md)（实录归档）、[`workbuddy-skill-foundation.md`](./workbuddy-skill-foundation.md)（宿主旅程）、[**多路并行审计（隐私·用户无关·竞争力）**](./multi-agent-audit-privacy-competitiveness.md)（发版前五路检查 + **待批优化项**）。  
> **版本**：与 `search-policy.json` 的 `version` 对齐维护。  
> **读法**：终端写作者优先读 **§2–§3**；发版/审计见 [`user-vs-maintainer-scope.md`](./user-vs-maintainer-scope.md)。

---

## 1. 三层定义（读表前必读）

| 层 | 含义 |
|----|------|
| **文档承诺** | `SKILL.md`、`references/` 中表述的**应然**（流程、门禁、交付形态）。 |
| **用户建议** | 规范中显式建议用户/主编做的事（初始化记忆、跑 CLI、验收结果区等）。 |
| **代码落实** | 技能包 zip 内 **实际存在的** `.js` / `.mjs` 与可被 `node` 调用的入口（以 `package-production.mjs` 纳入为准）。 |

**不等式**：文档承诺 ⊄ 代码落实。多数字段依赖 **宿主**（WorkBuddy / CodeBuddy）在会话内执行；代码落实补充 **离线校验** 与 **编排骨架**。

---

## 2. 全局对照表（主表）

| 领域 | 文档承诺（摘要） | 给用户的建议（摘要） | 代码落实（本包） | 一致性结论 |
|------|------------------|----------------------|------------------|------------|
| **联网检索** | §3.0.5、`search-policy.json`：阶段强制、每章 ≥N 次 | 事实句先检索；会话内用 WebSearch/WebFetch；可维护 `.fbs/search-ledger.jsonl` | `integration/lib/SearchBundle.js` 等（需注入 `webSearch`）；**`integration/enforce-search-policy.mjs`** 离线校验账本/章节摘要 | **会话执行靠宿主**；**离线门禁靠 CLI** |
| **质量五层 + C0** | `quality-check.md`、`book-level-consistency.md`（含 **C0-4** 主题） | S5 前人工终审；C0-1/C0-2/C0-4 按文档执行 | **`integration/quality-auditor.mjs`**（启发式）；**`BookLevelConsistency.js`**（C0-1 ρ_em）；**无** CY/T 全文计错引擎 | **打分与国标计错仍以人/第三方为主** |
| **主题锁定** | SKILL 第四条铁律、`topic-consistency-gate.md`、`search-policy.topicLock` | S0 简报首行 `**主题**`；「确认」回显主题；读跨书记忆前比对主题 | **`SearchPolicyFacade.getTopicLock()`** 读取策略节；**无**自动漂移检测引擎 | **漂移识别与拦截在宿主会话内** |
| **WorkBuddy 用户记忆** | `workbuddy-user-memory-strategy.md`、`userMemoryIntegration` | 主编 opt-in 生成摘要；注入前人工过滤 + 主题门禁 | **`integration/workbuddy-memory-digest.mjs`**、**`WorkbuddyMemoryDigest.js`**；**`init-project-memory`** 可选 `--with-workbuddy-hint` | **不自动注入**；JSON 状态类默认不解析 |
| **环境指纹** | `environmentSnapshot`、`workbuddy-first-use-environment-tiered-strategy.md` | 宿主/布局变化时重跑快照、查看 diff | **`integration/workbuddy-environment-snapshot.mjs`**、**`WorkbuddyEnvironmentSnapshot.js`**；**`init-project-memory`** 可选 `--with-environment-snapshot` | **仅路径存在性 + 策略版本**；无内容 hash |
| **C0-2 缩写多义** | 术语表唯一；禁止同书多义 | 维护 `GLOSSARY.md`；对照 [`abbreviation-audit-lexicon.json`](../02-quality/abbreviation-audit-lexicon.json) | 词库 JSON；`quality-auditor` **读取词库**报告命中次数 | **词库可扩展**；脚本不写死 abbrev |
| **多智能体** | WorkBuddy 话术、并行审查 | 复制 `workbuddy-agent-briefings.md` 建队 | **`multiagent-orchestrator.mjs`** 输出骨架；**无**宿主 API 调用 | **建队动作在宿主内** |
| **多路并行写书（磁盘·依赖·心跳）** | `section-3-workflow` §S3、`init-fbs-multiagent-artifacts`、CX 跨章层 | 本书根执行 `init-fbs` 模板；`sync-book-chapter-index` 核对 MEMORY 与文件；派发前 **`chapter-dependency-gate`**；`shared-knowledge-base` 自检；主编用 `heartbeat-monitor` / `task-requeue`（或同义主名）观测卡住与失败重派 | **`scripts/init-fbs-multiagent-artifacts.mjs`**、**`scripts/sync-book-chapter-index.mjs`**、**`scripts/chapter-scheduler-hint.mjs`**、**`scripts/shared-knowledge-base.mjs`**；**`integration/chapter-dependency-gate.mjs`**；**`integration/heartbeat-watchdog.mjs`**、**`heartbeat-monitor.mjs`**、**`task-queue-helper.mjs`**、**`task-requeue.mjs`**；**`integration/lib/HeartbeatService.js`** | **非全自动 DAG**；提供文件契约与 CLI 降人工协调成本 |
| **引用格式 / 术语** | `citation-format.md`、C0-2、`GLOSSARY.md` | 合稿前跑格式检查；术语争议对照表 | **`integration/citation-format-check.mjs`**、**`integration/terminology-gate.mjs`**（可选 `--strict`） | **启发式 / 表驱动**；不替代人工 |
| **工作流阶段** | S0–S6、`section-3-workflow.md` | 按审批点推进；勿静默跳过强制项 | **`workflow-progressor.mjs`** 阶段清单 | **无自动推进引擎** |
| **默认写书编排** | S0 并行包、章前门禁、S5 gate | 集成方注入 `workflowEngine` | **`BookWorkflowOrchestrator.js`** + `createDefaultBookWorkflowEngine` | **需宿主组装 ScenarioManager** |
| **排版构建** | MD→HTML/PDF/DOCX | 本地安装依赖后 `node assets/build.mjs`；S4 须预告长静默 | **`assets/build.mjs`**（**`[S4/build]`** 分阶段日志 v2.2+；Puppeteer/Mermaid 可能数十秒无输出） | **构建是显式本地命令**；终端进度应对话可见 |
| **记忆 / 降 token** | `CODEBUDDY.md`、规则、`@` | 按 `codebuddy-memory-workbuddy-integration.md` 配置本书项目 | **`scripts/init-project-memory.mjs`**；**`apply-book-memory-template.mjs` / `generate-book-context-index.mjs` 在 dist 中可能未随包** | **dist 最小包**：串联脚本会**跳过**缺失子脚本；可手拷模板 |
| **包内审计** | 维护者防漂移 | 发版前 `node scripts/audit-skill-consistency.mjs` | **`audit-skill-consistency.mjs`**（默认串联 **`scan-packaging-pii-patterns.mjs --fail`**） | **已落实** |
| **随包路径隐私扫描** | 禁止用户主目录硬编码进随包条文 | 维护者可单跑 `node scripts/scan-packaging-pii-patterns.mjs --fail` | **`scan-packaging-pii-patterns.mjs`** | **已落实**（`package-production` 默认执行） |
| **生产 zip** | 上架交付目录一致 | 技能根执行 `node scripts/package-production.mjs` | **`package-production.mjs`**（预检已含 audit 内嵌隐私扫描） | **已落实** |
| **三场景后端** | 社媒/调研/企业可加载 | 按需扩展 `scenarios/*/backend` | **最小 `index.js` 存在则可 require** | **参考实现，非生产业务后端** |
| **WorkBuddy 旅程** | Skill 挂在任务与工作台上 | 先理解宿主「任务—对话—结果」再写书 | 文档 **`workbuddy-skill-foundation.md`** | **无代码，属叙事对齐** |

---

## 3. 用户侧「最小可行」清单（按优先级）

1. **P0**：选用本 Skill 发起任务；成文阶段 **实际调用** 宿主检索工具；终稿前对照 `quality-check.md` 做终审。  
2. **P0（可选加固）**：每章落稿后 `node integration/enforce-search-policy.mjs --skill-root <技能根> --chapter-file <本章.md>`（或账本路径）。  
3. **P1**：S5 前 `node integration/quality-auditor.mjs --skill-root <技能根> --inputs <…>` 生成草稿报告。  
4. **P1**：并行写书时用 `workbuddy-agent-briefings.md` + 本书术语表消化 C0-2。  
5. **P2**：需要 HTML/PDF 时再装依赖并跑 `assets/build.mjs`；记忆模板若子脚本缺失则按 `templates/` 手拷。

---

## 4. 维护者「改完即查」

以下条目**不影响**终端用户用宿主写书；属仓库维护与发版闭环（与 [`user-vs-maintainer-scope.md`](./user-vs-maintainer-scope.md) 一致）：

- 增删 `integration/*.mjs` 或 `scripts/*.mjs` → 更新 **本表**、[`efficiency-implementation.md`](./efficiency-implementation.md)、[`doc-code-consistency.md`](./doc-code-consistency.md)。  
- 改 `search-policy.json` → 同步 `enforce-search-policy.mjs` 行为说明（若逻辑变更则改脚本）。  
- 改短指令条数 → `audit-skill-consistency.mjs` + `section-4-commands.md` + `SKILL.md` 中 **64** 等数字。  
- 发版 → `search-policy.version` + `quality-S.md` frontmatter + 本文件顶部「版本」句 + 确认 `scan-packaging-pii-patterns` 规则未误杀文档反例（allowlist/行豁免）。

---

## 5. 修订记录

| 技能包版本 | 日期 | 摘要 |
|------------|------|------|
| 1.18.9 | 2026-03-29 | 测试报告补强：`chapter-dependency-gate`、根目录 `chapter-status.md`、`task-requeue`/`heartbeat-monitor` 别名、`shared-knowledge-base`、`coordinator-arbiter-briefs`；SKILL 多 Writer 红线句 |
| 1.18.8 | 2026-03-29 | 多路并行：`.fbs` 模板扩展、章节索引/调度 CLI、心跳与任务队列、`citation-format-check` / `terminology-gate`；全书跨章层 **CX**；`quality-auditor` 伪精确启发式 |
| 1.18.5 | 2026-03-29 | SKILL YAML：`version` / `author` / `homepage`；与 [CodeBuddy Skills](https://www.codebuddy.cn/docs/cli/skills) 上架字段对齐；`search-policy` 同版本 |
| 1.18.3 | 2026-03-29 | 路径脱敏默认 + `scan-packaging-pii-patterns.mjs` + audit/package 默认串联；`PathRedaction` 导出；NLU `STATUS` 扩展；对外模板 §2.4 |
| 1.18.2 | 2026-03-29 | 冷启动专节 + digest `bookContextHeuristics` + environmentSnapshot CLI + 短指令 64 条 |
| 1.18.1 | 2026-03-29 | WorkBuddy 记忆稳妥摄取（userMemoryIntegration、CLI、策略文档、init 串联）；短指令 63 条 |
| 1.18.0 | 2026-03-29 | 主题锁定（topicLock、topic-consistency-gate、C0-4、CONFIRM_TOPIC、短指令 62 条） |
| 1.17.0 | 2026-03-29 | S4 `build.mjs` 分阶段日志；工作流/全局交付/doc-code 对齐 |
| 1.16.0 | 2026-03-29 | S3 体验与编排进度；用户/维护者解耦交叉引用 |
| 1.15.0 | 2026-03-29 | 首版全局对照表；与 dist 脚本真实清单对齐；强化用户建议列 |
