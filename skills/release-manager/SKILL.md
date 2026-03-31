---
name: release-manager
description: >
  发布管理技能 - 扫描 workspace 变更、智能计算版本号、生成CHANGELOG、
  打包为完整 workspace ZIP 包。
  当用户说"发布新版本"、"检查更新"、"打包红龙获客系统"、
  "打包整个系统"、"release"、"技能版本管理"时使用。
  专为红龙获客系统定制，打包目标是整个 workspace（含 7层上下文、
  技能集群、记忆、脚本等）。
version: 2.2.0
---

# release-manager

发布管理技能 - 扫描 workspace 变更并打包发布。

## 功能

- **自动检测更新** - 扫描 `skills/` 目录变更，对比 `.release/state.json`
- **智能版本号** - SemVer：新增=MINOR，删除=MAJOR，修改=PATCH
- **一键打包** - 打包整个 workspace（包含 7层上下文 + 技能集群 + 子目录）
- **Git 集成** - CHANGELOG + 提交 + 标签 + 推送

## 打包结构

详见 `references/packaging-structure.md`

```
honglong-acquisition-agent-v1.0.0/
├── README.md / INSTALL.md / QUICK-START.md   (根文档)
├── *.md                                      (7层上下文 + 架构文档)
├── skills/                                    (技能集群)
├── scripts/                                  (自定义脚本)
├── memory/                                   (历史记忆)
├── customer-data/                            (客户数据)
├── customer-acquisition-skills/              (获客技能包)
├── deploy/                                   (安装脚本)
└── output/                                  (输出结果)
```

## 使用方式

| 命令 | 行为 |
|------|------|
| 检查更新 | 扫描变更 → 输出变更报告 + 版本建议 |
| 发布新版本 | 变更检测 → 版本计算 → CHANGELOG → ZIP → Git |
| 发布 v1.2.0 | 使用指定版本号发布 |
| 发布但不推送 | 打包+提交，不执行 git push |

运行：
```powershell
.\scripts\check-updates.ps1
.\scripts\release.ps1
.\scripts\release.ps1 -Version 1.2.0 -NoPush
.\scripts\setup.ps1
```

## 版本号规则

| 变更类型 | 版本升级 | 示例 |
|----------|----------|------|
| 新增技能 | MINOR+1 | 1.0.0 → 1.1.0 |
| 删除技能 | MAJOR+1 | 1.0.0 → 2.0.0 |
| 修改技能 | PATCH+1 | 1.0.0 → 1.0.1 |
| 多个变更 | 取最高 | 新增+修改 → MINOR |

## 依赖

- Git（版本控制 + 标签）
- PowerShell 5.1+（`Compress-Archive` 内置，无需 7-Zip）
