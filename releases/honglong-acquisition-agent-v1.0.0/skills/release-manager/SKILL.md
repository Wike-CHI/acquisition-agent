---
name: release-manager
description: >
  发布管理技能 - 扫描技能集群变更、智能计算版本号、生成CHANGELOG、
  打包为B2B SDR Template结构ZIP包。当用户说"发布新版本"、"检查更新"、
  "打包技能"、"打包红龙获客系统"、"release"、"技能版本管理"时使用。
  专为红龙获客系统定制，可直接打包整个技能集群。
version: 2.1.0
---

# release-manager

发布管理技能 - 自动识别更新、管理版本、打包发布。

## 功能

- **自动检测更新** - 扫描 `skills/` 目录，对比 `.release/state.json`
- **智能版本号** - SemVer：新增=MINOR，删除=MAJOR，修改=PATCH
- **一键打包** - B2B SDR Template 清爽结构
- **Git 集成** - CHANGELOG + 提交 + 标签 + 推送

## 使用方式

| 命令 | 行为 |
|------|------|
| 检查更新 | 扫描变更 → 输出变更报告 + 版本建议 |
| 发布新版本 | 变更检测 → 版本计算 → CHANGELOG → ZIP → Git |
| 发布 v1.2.0 | 使用指定版本号发布 |
| 发布但不推送 | 打包+提交，不执行 git push |

## 版本号规则

遵循语义化版本（SemVer）：`MAJOR.MINOR.PATCH`

| 变更类型 | 版本升级 | 示例 |
|----------|----------|------|
| 新增技能 | MINOR+1 | 1.0.0 → 1.1.0 |
| 删除技能 | MAJOR+1 | 1.0.0 → 2.0.0 |
| 修改技能 | PATCH+1 | 1.0.0 → 1.0.1 |
| 多个变更 | 取最高 | 新增+修改 → MINOR |

## 打包结构

详见 `references/packaging-structure.md`

```
project-name-v1.0.0/
├── README.md / INSTALL.md / QUICK-START.md
├── workspace/        (7层上下文)
├── skills/           (所有技能)
├── deploy/           (安装脚本)
└── examples/         (示例配置)
```

## 脚本

| 脚本 | 说明 |
|------|------|
| `check-updates.ps1` | 扫描变更 → 输出报告 + 版本建议 |
| `release.ps1` | 完整发布流程（打包+Git） |
| `init-git.ps1` | 初始化 Git 仓库 |
| `setup.ps1` | 交互式安装向导 |

运行示例：
```powershell
.\scripts\check-updates.ps1
.\scripts\release.ps1
.\scripts\release.ps1 -Version 1.2.0 -NoPush
.\scripts\setup.ps1
```

## 依赖

- Git（版本控制 + 标签）
- PowerShell 5.1+（`Compress-Archive` 内置）

## 配置

状态文件位于 `.release/state.json`，包含：版本号、发布日期、技能哈希、大小。
