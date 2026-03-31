# 对外可见发布口径模板（WorkBuddy）

## 1. 用途

用于对外说明“用户可见能力、边界与交付物”，降低误承诺风险，减少沟通往返。

## 2. 标准模板（可直接复用）

### 2.1 能力说明（公开）

- 本技能提供：S0-S6 长文档协同流程、联网检索门禁、分层质量校验、排版与交付规范。
- 本次交付包含：`SKILL.md`、`references/`（可选 `assets/`）。
- 发布前已通过：可见性边界审计、全量审计与打包校验。

### 2.2 边界说明（公开）

- 本交付不包含内部设计与商业计划文件。
- 不承诺宿主未开放的工具能力；具体以宿主可用能力为准。
- 不声称 `integration/` 为开箱即跑的生产系统（除非另行明确交付）。

### 2.3 体验承诺（公开）

- 长任务采用“先摘要后展开”，避免长时间静默等待。
- 提供阶段性进度提示与可重试建议。
- 默认优先最短路径文档，减少无效上下文加载。

### 2.4 可验证差异清单（相对泛化「写书助手」）

> 对外一句话可压缩为三条硬证据；验收方按下列项核对 **文档是否存在 + 仓库是否可执行**（与 [`multi-agent-audit-privacy-competitiveness.md`](./multi-agent-audit-privacy-competitiveness.md) §4.5 一致）。

| 证据 | 用户可见/可感知 | 仓库锚点 |
|------|-----------------|----------|
| **主题锁 + C0-4** | 「确认」回显锁定主题；终稿前术语/主题一致性门禁有文档链 | `search-policy.json` **topicLock**；`topic-consistency-gate.md`；`book-level-consistency.md`（C0-4） |
| **可运行门禁 CLI** | 维护者/集成方可离线跑检索账本校验、章前质检 | `integration/enforce-search-policy.mjs`、`integration/quality-auditor.mjs`；`scripts/audit-skill-consistency.mjs` |
| **WorkBuddy 记忆与环境 opt-in** | 摘要/环境 JSON **显式**生成，默认脱敏路径；非静默污染本书 | `workbuddy-memory-digest.mjs`（`--write` 默认脱敏）、`workbuddy-environment-snapshot.mjs`；`PathRedaction.js` |
| **发版隐私兜底** | zip 前扫描随包条文是否含疑似用户主目录硬编码 | `scripts/scan-packaging-pii-patterns.mjs`（由 `audit-skill-consistency.mjs` 默认 `--fail` 串联；`package-production` 预检即跑 audit） |

## 3. 发布前 30 秒核对

- [ ] 未提及内部目录与内部数据。
- [ ] 未出现“默认可用但实际未实现”的能力承诺。
- [ ] 已声明可见交付范围与非交付范围。
- [ ] 话术与 `doc-code-consistency.md` 保持一致。
- [ ] 若对外承诺「可验证差异」，已对照 §2.4 表勾选可核对项。
