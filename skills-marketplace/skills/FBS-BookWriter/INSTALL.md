# FBS-BookWriter 生产环境安装

## 包内容

- `SKILL.md`：技能入口（含 YAML Frontmatter）
- `references/`：规范全文
- `LICENSE`：许可证
- `assets/`：可选本地构建（MD→HTML/PDF/DOCX，需 Node）
- `integration/`、`scenarios/`：可选编排与场景参考实现（与 `doc-code-consistency.md`、`efficiency-implementation.md` 一致）
- `scripts/audit-skill-consistency.mjs`：解压后可执行一致性自检
- `scripts/scan-packaging-pii-patterns.mjs`：维护者可单独跑随包路径模式扫描（发版脚本已默认执行）

## CodeBuddy Code

将本目录**整体**放到：

- 项目级：`<项目根>/.codebuddy/skills/FBS-BookWriter/`
- 用户级：`~/.codebuddy/skills/FBS-BookWriter/`

文件夹名建议与 Frontmatter `name: FBS-BookWriter` 一致。

## WorkBuddy

将同上结构的 `FBS-BookWriter` 文件夹放入 WorkBuddy 技能目录（与当前产品配置一致即可，常见为 `.workbuddy/skills/FBS-BookWriter/`）。

## 解压后自检（维护者 / CI，可选）

```bash
cd FBS-BookWriter
node scripts/audit-skill-consistency.mjs
```

写作者可跳过；详见包内 `references/05-ops/user-vs-maintainer-scope.md`。

## 官方参考

- [Skills 功能](https://www.codebuddy.cn/docs/cli/skills)

---
生成时间：2026-03-29T08:17:24.649Z
包版本：1.18.9
