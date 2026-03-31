# FBS-QualityChecker 独立 Skill 拆分规格（可选）

> **目的**：落实审计「质量子技能可独立复用」；**本文件为规格说明**，不自动生成第二套目录，实施时由发布脚本复制或子模块引用。

## 1. 建议 Frontmatter（CodeBuddy / WorkBuddy Skills）

```yaml
name: FBS-QualityChecker
description: |
  中文长文档去 AI 味与分层质检：S/P/C/B 检查单、折算分数、G 层合规提示；可单独对已有 Markdown 成稿出报告。
allowed-tools: Read, Grep, Glob, Edit
user-invocable: true
```

## 2. 最小文件集

| 文件 | 来源（从 FBS-BookWriter 复制或引用） |
|------|----------------------------------------|
| `SKILL.md` | 新写短入口：指向下方规范、禁止承接「写书全流程」 |
| `references/02-quality/quality-S.md` | 原样 |
| `references/02-quality/quality-PLC.md` | 原样 |
| `references/02-quality/quality-check.md` | 原样 |
| `references/02-quality/metrics.md` | 原样 |
| `references/02-quality/keywords.md` | 若启用 G1 学术扫描 |

## 3. 与 FBS-BookWriter 的边界

- **FBS-QualityChecker**：只做**读入成稿 → 出报告/标注**，不启动 S0–S6 写作流水线。  
- **FBS-BookWriter**：保留全书编排、检索门禁、案例库与交付构建。

## 4. 上架注意

- `description` 中避免与写书 Skill 触发词完全重叠；可加「质检、审校、去 AI 味报告」。  
- 若两 Skill 同装，依赖宿主**意图路由**区分「写书」vs「只检查这段」。
