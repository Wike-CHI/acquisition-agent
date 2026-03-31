# FBS-BookWriter · Canonical 路径索引

> **用途**：根级 `references/*.md` 多为 **stub**（兼容旧链接）；**条文维护**一律在下列 canonical 文件进行。  
> **对照**：改某文件后应同步哪些入口，见 [`spec-sync-checklist.md`](./spec-sync-checklist.md)（按文件 → 检查点）；本页为 **路径** 单一事实来源。

| 领域 | Canonical 路径 | 根级 stub（若存在） |
|------|----------------|---------------------|
| S/P/C/B 自检与报告 | `references/02-quality/quality-check.md` | `references/quality-check.md` |
| 全书级一致性（C0、术语、破折号总账） | `references/02-quality/book-level-consistency.md` | — |
| 指标与折算分 | `references/02-quality/metrics.md` | `references/metrics.md` |
| S 层规则与禁用词 | `references/02-quality/quality-S.md` | `references/quality-S.md` |
| P/C/B 层规则 | `references/02-quality/quality-PLC.md` | `references/quality-PLC.md` |
| 学术关键词 | `references/02-quality/keywords.md` | `references/keywords.md` |
| L3 语义接口 | `references/02-quality/L3-semantic-interface.md` | `references/L3-semantic-interface.md` |
| 模板 / 预设 / 排版 / 视觉 / 人格 / 用户档案 | `references/03-product/04-templates.md` 等 | `templates.md` `presets.md` `typography.md` `visual.md` `persona.md` `user_profile_template.md` |
| 案例库（全文） | `references/case-library.md` | —（`03-product/10-case-library.md` → 指回根级） |
| 策略 / 积分 / 商详定价 / 风险 / 协同 / 资产 / 全球 / 竞品 | `references/04-business/*.md` | `strategy.md` `points-system.md` `pricing.md` 等 |
| 套餐档位（Starter/Pro/Enterprise） | `references/05-ops/pricing-packages.md` | — |
| 构建 / 交付 / S0 模块 / 运维类 | `references/05-ops/*.md` | `build.md` `delivery.md` `S0-research-module.md` |
| 国家标准与编校专项 | `references/05-ops/national-standards-editorial-checklist.md` | — |
| 主题一致性门禁（topicLock、GATE） | `references/05-ops/topic-consistency-gate.md` | — |
| WorkBuddy 用户记忆策略 | `references/05-ops/workbuddy-user-memory-strategy.md` | — |
| 首次使用与环境迭代（分级策略） | `references/05-ops/workbuddy-first-use-environment-tiered-strategy.md` | — |
| 环境指纹（search-policy.environmentSnapshot） | `integration/workbuddy-environment-snapshot.mjs` + `integration/lib/WorkbuddyEnvironmentSnapshot.js` | — |
| 多路审计（隐私/一致性/竞争力） | `references/05-ops/multi-agent-audit-privacy-competitiveness.md` | — |
| 工作流 / NLU / 短指令 / 技术 | `references/01-core/*.md` | — |

**包内校验**：`node scripts/audit-skill-consistency.mjs`（自 `FBS-BookWriter-skill` 根目录执行）。
