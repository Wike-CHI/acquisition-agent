# FBS-BookWriter 技能包一致性洞察（归档）

> **归档日期**：2026-03-29  
> **背景项目**：《人机协同：从个人增效到生态共创的完整方法论》实录  
> **技能包版本（归档时）**：v1.13.0（首录）；**当前全局对照**见 [`promise-code-user-alignment.md`](./promise-code-user-alignment.md)。  
> **维护说明**：本文件为外部洞察的**技能包内归档**；**承诺×建议×代码** 的主表已迁至 `promise-code-user-alignment.md`，本页保留历史结论与维度速查。

---

## 1. 核心结论（摘要）

- **过程与文档存在断层**：例如 S3「每章 ≥2 次检索」、S5 五层报告、S4 构建、`assets/build.mjs`、记忆脚本等，在实际会话中可能被跳过，而规范仍声称强制或完整流程。
- **根因**：规范主要在 `references/`，可执行门禁长期依赖宿主与人工；仓库内缺少**可独立运行的校验/审计 CLI** 时，易出现「规范在纸、执行靠人」。
- **整改方向（已部分落入本包）**：
  - **P0**：提供 `integration/enforce-search-policy.mjs`（检索门禁校验）。
  - **P0/P1**：提供 `integration/quality-auditor.mjs`（规则向量化扫描 + 报告骨架）。
  - **P1**：`scripts/init-project-memory.mjs`（串联可选记忆脚本）、`integration/multiagent-orchestrator.mjs` / `workflow-progressor.mjs`（编排与阶段提示模板）。
  - **宿主侧**：仍须按 `search-policy.json` 注入检索与拦截；本包脚本**不替代**宿主工具调用。

---

## 2. 维度速查（与原洞察对齐）

| 维度 | 文档 | 历史缺口 | 本包落地 |
|------|------|----------|----------|
| 联网检索 | §3.0.5、`search-policy.json` | 无随包 CLI 校验 | `enforce-search-policy.mjs` |
| 质量检查 | quality-S / quality-check | 无随包扫描器 | `quality-auditor.mjs`（启发式，非全文 CY/T 引擎） |
| 多智能体 | `workbuddy-agent-briefings.md` | 无建队封装 | `multiagent-orchestrator.mjs`（模板输出） |
| 工作流 | `section-3-workflow.md` | 无推进引擎 | `workflow-progressor.mjs`（阶段清单） |
| 记忆 | `apply-book-memory-template` 等 | 脚本可能未随包 | `init-project-memory.mjs`（存在则调用） |
| 构建 | `assets/build.mjs` | 需手动执行 | 短指令 + SKILL 边界说明；构建仍本地执行 |
| 主题一致性 | SKILL 第四条铁律、`topic-consistency-gate.md`、C0-4 | 长会话易混用多项目上下文 | `search-policy.topicLock` + 文档门禁；宿主须实现回显与读文件前校验 |
| WorkBuddy 记忆 | `userMemoryIntegration`、digest CLI | 宿主记忆格式演进、静默污染 | **opt-in** 摘要 + 字节/字符上限；默认不解析 JSON 状态文件 |
| 环境指纹 | `environmentSnapshot`、snapshot CLI | 布局/策略版本漂移 | 仅存在性 + `search-policy.version`；diff 提示重跑 digest |
| 五路审计 | `multi-agent-audit-privacy-competitiveness.md` | 一致性/用户无关/隐私/卡顿/竞争力 | 发版前人工或多 Task 跑清单；**代码改造见文内 §6 待批项** |

---

## 3. 信任边界（给使用者）

- **🔒 P0**：模型**不得**在未实际调用检索工具时声称已完成联网门禁；成书项目应用 **`enforce-search-policy`** 或宿主账本对齐 `WebSearchLedger`。
- **⚙️ P1**：质量报告可由 **`quality-auditor`** 产出草稿，**终审与人读**仍以 `quality-check.md` 为准。
- **📋 P2**：HTML/PDF/DOCX、预览、自动推进模式依赖环境与宿主，见 `SKILL.md` 与 `doc-code-consistency.md`。

---

## 4. 后续（与宿主协作）

- WorkBuddy / CodeBuddy 可在 S3/S5 钩子中调用上述 `node integration/...` 命令（由项目路径与技能根参数化）。
- 更新本洞察时**勿删除**本节以上结构；可在文末追加「修订记录」表格。

---

## 5. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-03-29 | 增补与 `promise-code-user-alignment.md` 的交叉引用；主对照表以该文件为准。 |
| 2026-03-29 | v1.18：主题一致性维度与 `topic-consistency-gate.md` / 宿主记忆分工。 |
| 2026-03-29 | v1.18.1：`workbuddy-memory-digest` 与 `workbuddy-user-memory-strategy.md`。 |
| 2026-03-29 | v1.18.2：冷启动专节、`bookContextHeuristics`、`workbuddy-environment-snapshot`、短指令 64。 |
| 2026-03-29 | v1.18.3：`PathRedaction`、`scan-packaging-pii-patterns.mjs`、audit/package 默认串联；`STATUS` 心跳口语见 `section-nlu.md`。 |
| 2026-03-29 | v1.18.5：SKILL Frontmatter 与 CodeBuddy Skills 对齐（`version`/`author`/`homepage`）。 |
| 2026-03-29 | 新增多路并行审计报告：`multi-agent-audit-privacy-competitiveness.md`（隐私/用户无关性等）。 |
