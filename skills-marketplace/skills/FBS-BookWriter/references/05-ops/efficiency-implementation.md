# 增效措施落地说明（多智能体 / 联网 / 记忆）

> 与 [`doc-code-consistency.md`](./doc-code-consistency.md) 配合阅读。

## 策略（面向长文档、时效性、专业性）

| 维度 | 策略 | 代码落点 |
|------|------|----------|
| **联网** | S0 用 **并行多查询** 覆盖**内容竞品**/读者/**本书变现**（与 `section-3-workflow` 主体内涵锚定、`SearchBundle.buildS0Queries` 模板一致）；每章用 **门禁检索**（次数见 `search-policy.json`），结果写入 **JSONL 账本** 可审计；单次 `webSearch` **默认 15s 超时**（防检索挂死），同一运行内超时域名不再访问；同域名日内超时≥3 次则一周内不再访问，并持久化到 `.fbs/domain-blocklist.json`；`BookWorkflowOrchestrator({ searchTimeoutMs })` 可覆盖 | `integration/lib/SearchBundle.js`、`WebSearchLedger.js` |
| **质量门禁** | S2→S3 显性确认、每 5 章中检、章节质量门禁（结构偏差率/AI 味/来源精确化）、S5 发布门禁（含 C0-1 破折号）；结果写入 `.fbs/quality-gate-ledger.jsonl`；**不含** CY/T 266—2023 编校差错计错 | `integration/lib/BookWorkflowOrchestrator.js`；国标编校见 [`national-standards-editorial-checklist.md`](./national-standards-editorial-checklist.md) |
| **多智能体** | 单宿主内 **串行角色**：检索门禁 → `writer` → `critic_*`；各角色为宿主注入的 **async 函数**，未注入则返回待办提示（不假装已审稿）；**每个已注入角色单步默认 300s 超时**（`roleStepTimeoutMs`，传 **0** 关闭）；`onProgress` 可用 **`progressThrottleMs`**（毫秒）合并过密进度事件，减轻宿主 UI 卡顿 | `integration/lib/MultiAgentPipeline.js`、`BookWorkflowOrchestrator.runChapterWithAgents` |
| **全书 C0-1（编排）** | `execute({ mode: 's5_release_gate', payload })` 支持 **`fullManuscriptText`**：按 `qualityGate.emDashPerThousandWarnAbove` / `BlockAbove` 与 `BookLevelConsistency.evaluateEmDashBookLevel` 判定；`requireBookLevelC0: true` 时**必须**传全文或宿主侧已显式处理；**C0-2 术语**仍由宿主/主编按 `book-level-consistency.md` 执行 | `integration/lib/BookLevelConsistency.js`、`BookWorkflowOrchestrator._validateS5ReleaseGate` |
| **记忆 / 降 token** | 成书项目生成 **`FBS_CONTEXT_INDEX.md`**，用 `@技能根/单文件` 拉规范；配合 `.codebuddy/rules` 条件注入 | 扩展包中的 `generate-book-context-index.mjs` / `apply-book-memory-template.mjs`（若未随包分发则按模板手拷） |
| **默认写书引擎** | 宿主将 `workflowEngine` 设为 `BookWorkflowOrchestrator`，并注入 `webSearch`（及可选 `bookRoot` 写账本） | `integration/lib/BookWorkflowOrchestrator.js` |
| **S4 构建** | 本地 `build.mjs`：Chromium、networkidle、Mermaid 等待可能长静默；脚本输出 **`[S4/build]`** 分阶段日志，会话侧应预告并摘要回用户 | `assets/build.mjs` |

## API 速览（CommonJS）

```javascript
const {
  createDefaultBookWorkflowEngine,
  runProfessionalChapterPipeline,
} = require('./integration/lib');

const engine = createDefaultBookWorkflowEngine({
  skillRoot: '/path/to/FBS-BookWriter',
  bookRoot: '/path/to/my-book', // 可选，启用 .fbs/search-ledger.jsonl
  logger: console,
  searchTimeoutMs: 15000, // 可选；默认 15000，单次 webSearch 超时会记失败并写账本
  roleStepTimeoutMs: 300000, // 可选；默认 300000（5min）/ 步；0 = 关闭 agents.* 单步超时
});
engine.registerSkillServices({ webSearch: hostWebSearchFn });

await engine.runS0ParallelResearch('本书主题');
await engine.runChapterResearchGate('CH-01', '本章论点');
await engine.execute({ mode: 'confirm_outline', payload: { approvedBy: 'user' } }); // S2→S3 显性确认
await engine.runChapterWithAgents('CH-01', '本章论点', {
  writer: async (ctx) => ({ draft: '…' }),
});
const q = await engine.execute({
  mode: 'chapter_quality_gate',
  payload: {
    draft: '示例正文',
    citations: [{ org: '机构', report: '报告', url: 'https://example.com' }],
    chapterPlan: { requiredAnchors: ['关键词A'] },
  },
});
const release = await engine.execute({
  mode: 's5_release_gate',
  payload: {
    qualityReport: true,
    dataFreshnessTable: true,
    totalScoreConverted: 7.8,
    bLayerScore: 4.2,
    deletionRiskConfirmed: true,
    publishConfirmed: true,
    hasAcademicRisk: false,
    // 可选：全书 MD 正文 → 自动 C0-1（ρ_em）；不传则须宿主侧完成或传 bookLevelC0Pass:true
    // fullManuscriptText: fs.readFileSync('book.md', 'utf8'),
  },
});
```

环境变量（`ScenarioRouter` 加载调研场景时）：`FBS_SKILL_ROOT`、`FBS_BOOK_ROOT`。

## 文件索引

| 路径 | 作用 |
|------|------|
| `integration/lib/SearchPolicyFacade.js` | 读取 `references/05-ops/search-policy.json` |
| `integration/lib/WebSearchLedger.js` | `.fbs/search-ledger.jsonl` |
| `integration/lib/SearchBundle.js` | S0 并行包、章前门禁；`executeChapterGate` 支持 **`onProgress`**（章前逐次检索 start/done，降 S3 卡顿感） |
| `integration/lib/MultiAgentPipeline.js` | 章内多角色流水线 |
| `integration/lib/BookWorkflowOrchestrator.js` | 默认 `workflowEngine` 实现（含 S2→S3 大纲确认门禁、每5章中检、章节质量门禁、S5 发布门禁 + **bookLevelC0**） |
| `integration/lib/BookLevelConsistency.js` | 全书破折号密度（C0-1）纯逻辑，可与宿主质检共用 |
| `integration/lib/index.js` | 聚合导出 |
| `scenarios/research/backend/index.js` | `runS0ParallelResearch`（需 `skillRoot`） |
| `scripts/audit-fbs-efficiency.mjs` | 自检 |
| `scripts/summarize-quality-gates.mjs` | 读取 `.fbs/quality-gate-ledger.jsonl` 输出阻断率 / Top 问题码 / 结构偏差均值 |
| `scripts/generate-book-context-index.mjs` | 生成本书 `@` 索引 |
| `scripts/apply-book-memory-template.mjs` | 记忆模板（`--dry-run`） |
| `scripts/init-project-memory.mjs` | 一键串联记忆模板 + 上下文索引（子脚本存在则执行） |
| `integration/enforce-search-policy.mjs` | S3 离线检索门禁：账本或章节 MD 摘要 |
| `integration/quality-auditor.mjs` | S5 启发式质量扫描（非国标全文引擎）；C0-2 缩写命中自 `02-quality/abbreviation-audit-lexicon.json` 读取；**伪精确**货币/占比模式提示（测试报告导向，须人工核对） |
| `integration/lib/HeartbeatService.js` | `.fbs/member-heartbeats.json` 读写与超时判定（宿主可注入 `ScenarioManager.skillServices.heartbeatService`） |
| `integration/heartbeat-watchdog.mjs` | CLI：列出 STALE 成员心跳 |
| `integration/task-queue-helper.mjs` | CLI：`list` / `enqueue` / `complete` / `fail`（配合并行写书任务卡） |
| `integration/citation-format-check.mjs` | CLI：章节「检索与来源」`[n]:` 行 P0/P1 启发式 |
| `integration/terminology-gate.mjs` | CLI：可选 `--strict` 对照 `GLOSSARY.md` 表行 |
| `scripts/init-fbs-multiagent-artifacts.mjs` | 初始化/补齐 `.fbs`：`chapter-dependencies.json`、`member-heartbeats.json`、`task-queue.json`、`GLOSSARY.md` 等 |
| `scripts/sync-book-chapter-index.mjs` | 扫本书根 MD → `chapter-scan-result.json`，可选回写 `chapter-dependencies.json` 状态 |
| `scripts/chapter-scheduler-hint.mjs` | 读扫描结果与依赖，提示「可派发」章节（稿缺失且依赖已齐） |
| `scripts/shared-knowledge-base.mjs` | 校验 `.fbs` 核心共享文件与根目录 `chapter-status.md` 镜像（测试报告 07） |
| `integration/chapter-dependency-gate.mjs` | 派发前：依赖章是否在磁盘上匹配到 MD（退出码 1 = 不可派发） |
| `integration/task-requeue.mjs` | `task-queue-helper.mjs` 别名（测试报告 08 脚本名） |
| `integration/heartbeat-monitor.mjs` | `heartbeat-watchdog.mjs` 别名（测试报告 03 脚本名） |
| `references/02-quality/abbreviation-audit-lexicon.json` | C0-2 易多义缩写等专项审计词库（维护者增删，脚本不写死 abbrev） |
| `integration/multiagent-orchestrator.mjs` | 并行 Task 话术骨架（不调用宿主 API） |
| `integration/workflow-progressor.mjs` | S0–S6 阶段清单提示 |
| `assets/build.mjs` | S4：`[S4/build][书id]` 进度行 + Chromium/PDF/Mermaid/DOCX 关键节点（降「构建卡死」误判） |

### 与「福帮手生产 zip」对齐的 `scripts/` 实况

`scripts/package-production.mjs` 会复制整个 `scripts/` 目录。**v1.18.6+** 默认随包包含 `apply-book-memory-template.mjs` 与 `generate-book-context-index.mjs`（与 `init-project-memory.mjs` 串联）。若你手中的历史快照缺少上表中的 **`audit-fbs-efficiency.mjs`、`summarize-quality-gates.mjs`** 等，以磁盘为准；全局对照见 [`promise-code-user-alignment.md`](./promise-code-user-alignment.md)。

### 质量门禁汇总脚本

```bash
node scripts/summarize-quality-gates.mjs --book "<本书根>"
node scripts/summarize-quality-gates.mjs --book "<本书根>" --json
node scripts/summarize-quality-gates.mjs --book "<本书根>" --since 7d
node scripts/summarize-quality-gates.mjs --book "<本书根>" --baseline "2026-03-01..2026-03-08" --compare "2026-03-08..2026-03-15" --json
```

## 宿主侧仍须提供

- **WebSearch / WebFetch**：真实检索函数；本仓库不负责公网 API。
- **主笔 / 审校 LLM**：通过 `agents.writer` 等注入，或由用户在 WorkBuddy 里人工多成员执行（与 `workbuddy-agent-briefings.md` 一致）。
- **CodeBuddy 记忆**：见 [官方记忆文档](https://www.codebuddy.cn/docs/cli/memory)。

## qualityGate 配置项（`search-policy.json`）

| 键 | 默认值 | 作用 |
|----|--------|------|
| `minConvertedScore` | `7.5` | S5 折算分门槛 |
| `minRawScore` | `15` | S5 原始分门槛 |
| `minBLayerScore` | `4` | S5 B 层门槛 |
| `aiContrastMax` | `8` | 章节中“不是…而是…”最大次数 |
| `aiAdverbMax` | `12` | 程度副词阈值 |
| `minAnchorCoverage` | `0.5` | 结构锚点最小覆盖率（用于结构偏差率） |
| `minRhythmCv` | `0.2` | 段落节奏最小变异系数 |
| `requireBookLevelC0` | `false` | `true` 时 S5 须传 `fullManuscriptText` 做 C0-1 自动核算 |
| `emDashPerThousandWarnAbove` | `1` | 全书 ρ_em 警告阈值（与 `quality-S` S6 对齐） |
| `emDashPerThousandBlockAbove` | `3` | 全书 ρ_em 阻断阈值 |
