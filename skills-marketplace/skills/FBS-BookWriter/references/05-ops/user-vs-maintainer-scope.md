# 用户功能 vs 维护者职责（解耦说明）

> **目的**：**不削弱**终端写作者可用的规范与交付质量；把 **发版、审计、打包、仓库自检** 等与「写一本书」无直接关系的内容，从**默认阅读路径**中剥离，避免用户误以为必须跑脚本才能用书。  
> **版本叙事**：面向用户的「本书工作流与质量」以 `SKILL.md`、`section-3-workflow.md`、`quality-check.md` 等为准；**包版本号**仅在 `search-policy.json` / `quality-S.md` frontmatter 等与合规配置强相关的位置保留，**不必**在会话里反复播报发版号。

---

## 1. 终端用户（写作者 / 主编）——建议只读

| 类型 | 路径或入口 |
|------|------------|
| 总纲与触发 | `SKILL.md` |
| 流程与 **S3 体验** | `references/01-core/section-3-workflow.md` |
| 质量与 C0 | `references/02-quality/quality-check.md`、`book-level-consistency.md` |
| 宿主工作台 | `references/05-ops/workbuddy-skill-foundation.md` |
| 承诺与能力边界（进阶） | `references/05-ops/promise-code-user-alignment.md` **§2–§3** |

**不要求**普通用户阅读：`spec-sync-checklist.md`、`consistency-insights.md`（实录归档）、`global-delivery-consistency.md` 全文、`audit-skill-consistency` 脚本说明等。

---

## 2. 维护者（发版 / 集成 / 文档维护）——必读子集

| 用途 | 路径 |
|------|------|
| 打包生产 zip | `scripts/package-production.mjs` |
| 包内文档漂移自检 | `scripts/audit-skill-consistency.mjs` |
| 改子规范时勾选项 | `references/05-ops/spec-sync-checklist.md` |
| 规范 vs 代码 triage | `references/05-ops/doc-code-consistency.md` |
| 全局交付交叉核对 | `references/05-ops/global-delivery-consistency.md` |
| 实录归档（非用户教程） | `references/05-ops/consistency-insights.md` |

**INSTALL.md**（随 `package-production` 生成）：其中的「解压后自检」面向维护者或 CI；**写作者可忽略** `scripts/` 仍不影响在宿主内正常使用 Skill。

---

## 3. 与 `skill-index.md` 的约定

- **AI 快速学习路径**：默认只引导 **§1 用户区**文档；维护者专区见索引文末 **「维护者专区」** 表。  
- 新增「发版/审计」类文档时：归入 **维护者专区**，**勿**插入 P0 写作者必读表的核心行。

---

## 4. 修订记录

| 技能包版本 | 摘要 |
|------------|------|
| 1.16.0 | 首版：用户/维护者路径解耦；与 S3 体验优化同发 |
