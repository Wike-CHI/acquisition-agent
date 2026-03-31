# 规范同步检查表（维护 FBS-BookWriter 时用）

> **目的**：缓解「SKILL.md 与子文档各自更新」导致的漂移（审计 P0 根因之一）。  
> **原则**：[`SKILL.md`](../../SKILL.md) 为产品叙事与宿主对齐的**主入口**；子文件为**权威细则**。改任一侧后，按本表勾选对应同步项。  
> **路径权威**：根级 stub 与 canonical 对照见 [`canonical-paths.md`](./canonical-paths.md)；本表侧重「改文件 → 要同步哪些入口」。

## 按文件同步（主表）

| 你修改的文件 | 必须同步检查的位置 |
|--------------|-------------------|
| `references/quality-S.md` / `references/quality-PLC.md`（根级 **stub**） | 仅维护跳转文案；**条文**只改 `references/02-quality/` 下同名文件 |
| `references/05-ops/search-policy.json` | `SKILL.md` §0 **联网搜索规范**；`section-3-workflow.md` §3.0.5；`global-delivery-consistency.md` 若涉阶段名 |
| `references/02-quality/quality-S.md` / `quality-PLC.md` / `quality-check.md` | `SKILL.md` §0 术语表、合规红线、§1 Task 表；`metrics.md` 若有分项定义 |
| `references/05-ops/user-vs-maintainer-scope.md` | 用户/维护者路径变更时同步 `skill-index` 维护者专区与 `SKILL` 索引行 |
| `references/05-ops/promise-code-user-alignment.md` | 增删脚本或改承诺时同步主表；版本句与 `search-policy.version` 一致 |
| `references/05-ops/multi-agent-audit-privacy-competitiveness.md` | 获批 §6 代码项后更新本文档勾选状态，并同步 `audit-skill-consistency` / `package-production`（若新增扫描开关） |
| `references/05-ops/workbuddy-skill-foundation.md` | WorkBuddy 官方用户旅程与 FBS 对齐；`SKILL.md` §0 / 规范索引 / `skill-index` 学习路径须可链回 |
| `references/01-core/section-4-commands.md` / `section-nlu.md` | `SKILL.md` §4 短指令 Tier 表与「共 N 条」计数；`skill-index.md` 指令行；统计表须含 **总计 \| 64**；记忆/环境见 `workbuddy-user-memory-strategy.md`、`search-policy` **environmentSnapshot**、分级策略稿 |
| `references/01-core/section-6-tech.md` §6.4 / §6.5.1 | `SKILL.md` §0 一致性表、§1 心跳摘要；`heartbeat-protocol.md`；`global-delivery-consistency.md` 防卡顿条 |
| `references/01-core/section-3-workflow.md`（阶段/门禁） | `SKILL.md` §3 引用与 §5 分阶段加载表；`search-policy.json` 的 `mandatoryWebSearchStages`；§3.0.5 表须含 **S5** |
| `references/case-library.md`（结构/字段） | `SKILL.md` §5 资源索引；`codebuddy-memory-workbuddy-integration.md` 若涉案例触发 |
| **任意根级 `references/*.md` stub**（除 `case-library.md` 全文） | 只改跳转文案；条文改 **canonical**（见 [`canonical-paths.md`](./canonical-paths.md)） |
| `references/03-product/10-case-library.md` | 须指向根级 `references/case-library.md`，勿另起全文 |
| Frontmatter `description` 触发词 | `SKILL.md` §0 触发词表/价值块与 YAML **逐条一致**；市场上架 `marketplace.json`（若适用） |
| `references/04-business/strategy.md`（canonical） | `SKILL.md` §0 **策略深度轴·静默分 8.0** 与全书通过线 **7.5**；[`doc-code-consistency.md`](./doc-code-consistency.md) 速查表 |
| `references/04-business/pricing.md` 与 `references/05-ops/pricing-packages.md` | `SKILL.md` 若涉套餐/定价叙事；`product-framework` / `global-delivery-consistency` §4；根级 `pricing.md` 仅为 stub |
| `references/04-business/kpi-dictionary.md` | `metrics.md` 附录业务映射；`SKILL.md` 若引用 KPI 口径 |
| `references/05-ops/global-delivery-consistency.md` | `SKILL.md` 组成表链接；`doc-code-consistency.md`；阶段/触发词/宿主差异条 |
| `references/02-quality/keywords.md`（canonical） | `quality-S.md` 禁用词交叉引用；根级 `keywords.md` 仅为 stub |
| `references/02-quality/L3-semantic-interface.md`（canonical） | `section-nlu.md` / 语义层叙述；根级 stub 仅跳转 |
| `references/02-quality/metrics.md`（canonical） | `SKILL.md` §0/§1 若写分值或折算；`quality-check.md`；根级 `metrics.md` 仅为 stub |
| `references/02-quality/book-level-consistency.md` | `quality-check.md` **C0** 与 §1.0.1；`quality-S.md` S6 全书注；`section-3-workflow` S5 流程与 **S5-G5**；`metrics.md` C0 说明；`SKILL.md` §1 资源与分阶段表 |
| `references/05-ops/national-standards-editorial-checklist.md` | `quality-check.md` 国标编校段；`06-typography.md` §十；`SKILL.md` Proofer 行；`skill-index.md`；`doc-code-consistency.md` |

## Stub 与 canonical（速记）

| 维护动作 | 做法 |
|---------|------|
| 改**条文** | 在 [`canonical-paths.md`](./canonical-paths.md) 所列 canonical 文件修改 |
| 改根级 stub | 仅更新**跳转句**与链接目标，不复制长正文 |
| 新增领域文档 | 二选一：全文放 canonical 并在根级加 stub；或**仅** canonical（根级不加则须更新 canonical-paths 表） |

**发布前建议**：

1. `node scripts/audit-skill-consistency.mjs`（技能包根目录；**已含** `scan-packaging-pii-patterns.mjs --fail`，除非 `--skip-packaging-pii-scan`）  
2. 再跑仓库内既有审计脚本（见 `codebuddy-skill-delivery.md`、`global-delivery-consistency.md` §4）。  
3. 生产 zip：`node scripts/package-production.mjs`（预检 `audit` 已含隐私扫描）。

## 版本控制集成（可选）

若技能包在 **Git 仓库**根目录下，可将审计挂到提交前，降低 SKILL 与子文档不同步入库的概率：

- **示例钩子**：[`scripts/hooks/pre-commit.sample`](../../scripts/hooks/pre-commit.sample)（复制为 `.git/hooks/pre-commit` 并 `chmod +x`，或在 Windows 用 Git Bash 执行同脚本）。  
- **安装辅助**（PowerShell）：[`scripts/install-git-hook.ps1`](../../scripts/install-git-hook.ps1) — 从技能包根目录执行，若上一级存在 `.git` 则写入 `pre-commit`。

CI 中可在检出技能包子目录后同样执行 `node scripts/audit-skill-consistency.mjs`。

---

*版本：1.18.5 | SKILL `version`/`author`/`homepage` 与 CodeBuddy Skills 对齐（2026-03-29）*
