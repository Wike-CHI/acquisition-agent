# WorkBuddy 用户记忆 × FBS-BookWriter：稳妥策略（随宿主演进）

> **版本**：1.18.5（与 `search-policy.version` 对齐）  
> **定位**：在 WorkBuddy **持续优化记忆系统** 的前提下，用**可版本化、可审计、有界只读**的方式，把「用户与工作区沉淀」转化为**更好体验与更稳输出**，同时**不削弱**主题锁与 C0-4。  
> **关联**：[`search-policy.json`](./search-policy.json) `userMemoryIntegration` · [`topic-consistency-gate.md`](./topic-consistency-gate.md) · [`workbuddy-skill-foundation.md`](./workbuddy-skill-foundation.md) §5 · **首次使用与环境迭代分级策略（Tier 0–2 已落地）**见 [`workbuddy-first-use-environment-tiered-strategy.md`](./workbuddy-first-use-environment-tiered-strategy.md)

---

## 1. 原则（必须同时满足）

| 原则 | 含义 |
|------|------|
| **演进容忍** | 用户目录 `~/.workbuddy/` 与工作区 `.workbuddy/` 下的文件名、层级可能变更；技能包**不硬编码**不可恢复路径，以 `search-policy.json` 的列表为准。 |
| **opt-in** | 默认**不**自动把记忆灌进写书上下文；由主编执行 CLI 或宿主钩子，**显式**生成摘要。 |
| **有界摄取** | 单文件字节上限、全文摘要字符上限见 `userMemoryIntegration`；防止超大文件拖垮会话或掩盖本书主题。 |
| **非事实源** | `USER.md` / `IDENTITY.md` / `SOUL.md` 等可能含**人设、偏好、多项目摘要**；**不得**当作本书事实或引用依据；事实句仍须检索。 |
| **门禁在后** | 任何摘要进入模型前，须已通过或并行执行 **`topic-consistency-gate` + C0-4**；冲突 **ASK_CONFIRMATION**。 |
| **可丢弃** | 摘要缺失、路径不存在时，写书流程**必须**仍能完整执行（降级为无记忆增强）。 |

---

## 2. 分层：读什么、做什么用

### 2.1 工作区 `.workbuddy/memory/`

- **`MEMORY.md`**：长期汇总（项目、路径、偏好、任务摘要）→ 适合 **S0/S1 前**由主编扫一眼，提取**与本书主题一致**的约束（如目录约定、禁用词）。  
- **`YYYY-MM-DD.md`**：按日日志 → 默认只取**最近 N 份**（策略内 `includeDateLogsMax`），避免陈旧对话干扰。

### 2.2 用户目录 `~/.workbuddy/`（示例：Windows `%USERPROFILE%\.workbuddy\`）

- **`USER.md`**：用户画像与偏好 → 用于 **语气、称呼、排版习惯**；写入本书须有边界说明。  
- **`BOOTSTRAP.md`**：启动/约束摘要 → 可与 **任务级**行为对齐；仍须主题校验。  
- **`IDENTITY.md` / `SOUL.md`**：助手人设 → **禁止**与「本书作者声口」混用；仅作交互层参考，**不**自动进入正文风格单。  
- **JSON 状态类**（如 `settings`、`workspace-state`）：**本技能包 CLI 默认不解析**（格式不稳定）；若宿主需要，由宿主在稳定后再接。

---

## 3. 执行路径（推荐）

1. **锁定本书主题**（S0 简报首行、`topicLock`）。  
2. **生成摘要**（二选一或组合）：  
   - `node integration/workbuddy-memory-digest.mjs --skill-root <技能根> --book-root <本书根> --write`（**默认脱敏路径**；调试加 `--no-redact`）  
   - 或附加 `--workspace <其它工作区>`；若不想读用户目录，加 `--no-user-profile`。  
3. **人工浏览** `.fbs/workbuddy-memory-digest.json` 的 `combinedExcerpt` 与 `warnings`。  
4. **删减或标注**后再注入宿主上下文（或写入 `CODEBUDDY.md` 小节）。  
5. **S1 定位**时把「来自记忆的偏好」与「本书体裁/读者」写进产出物，并保留可追溯引用（如「见 digest 某段」）。

---

## 4. 代码入口

| 组件 | 路径 |
|------|------|
| CLI | `integration/workbuddy-memory-digest.mjs` |
| 库 API | `integration/lib/WorkbuddyMemoryDigest.js`（`buildDigest`、`writeDigestToBook`） |
| 策略读取 | `SearchPolicyFacade.getUserMemoryIntegration()` |
| 串联初始化 | `node scripts/init-project-memory.mjs --book <本书根> --with-workbuddy-hint`（可选 `--workbuddy-hint-workspace-only` / `--no-redact`） |

---

## 5. 与 1.18 主题锁的关系

- **1.18**：堵住「上下文跳变」——记忆是**高风险输入源**，故在 **1.18.1** 用**单独策略节 + CLI** 承接，避免把未校验记忆与 `topicLock` 绑死在同一隐式路径。  
- **1.18.1**：在**不打开自动注入**的前提下，让集成方**有能力**安全利用记忆改善体验与一致性（偏好、路径、术语习惯）。

---

## 6. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-03-29 | 初版：随 `search-policy` 1.18.1 与 `WorkbuddyMemoryDigest` 落地。 |
| 2026-03-29 | 1.18.2：环境快照 CLI、digest 冷启动启发字段；分级策略见 `workbuddy-first-use-environment-tiered-strategy.md`。 |
| 2026-03-29 | 1.18.3：`--write` 默认路径脱敏；`init-project-memory` 透传 `--no-redact`；随包隐私扫描见 `scan-packaging-pii-patterns.mjs`。 |
| 2026-03-29 | 1.18.5：SKILL Frontmatter `version`/`author`/`homepage` 与 CodeBuddy Skills 对齐。 |
| 2026-03-29 | 交叉引用分级策略稿：首次使用 + WorkBuddy 环境迭代（见同目录 `workbuddy-first-use-environment-tiered-strategy.md`）。 |
