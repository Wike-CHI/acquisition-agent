---
name: release-manager
description: >
  发布管理技能 v3.2.0 - 双模式发布：ZIP打包 + GitHub仓库同步。
  当用户说"发布新版本"、"打包系统"、"同步到GitHub"、"推送技能到仓库"、
  "sync to github"、"release"、"技能版本管理"、"清理仓库"、
  "更新GitHub仓库"、"force push"、"submodule修复"时使用。
  专为红龙获客系统定制，支持增量同步、submodule检测、大文件过滤。
  支持 Windows (PowerShell) 和 Linux/macOS (Bash) 双平台。
version: 3.2.0
triggers:
  - 发布管理
  - 打包
  - release
  - 同步GitHub
  - 推送GitHub
---

# release-manager

发布管理技能 - 双模式：ZIP 打包发布 + GitHub 仓库同步。

## 功能

### 模式 A：GitHub 仓库同步（推荐）

将本地技能目录中红龙系统相关技能同步到 GitHub 仓库。

- **增量同步** - 只传输有变化的技能，跳过无变化的
- **Submodule 检测** - 自动发现并修复嵌套 `.git/` 导致的 submodule 引用
- **大文件过滤** - 排除 node_modules/.git/等，.gitignore 屏蔽图片/视频/PDF
- **白名单机制** - 只保留红龙获客系统相关技能（~80个），排除无关技能
- **一键操作** - clone/pull → 同步 → 检测 → 提交 → 推送
- **跨平台** - Windows (PowerShell) + Linux/macOS (Bash)

### 模式 B：ZIP 打包发布

打包整个 workspace（7层上下文 + 技能集群 + 子目录）为 ZIP 分发包。

- **自动检测更新** - 扫描 `skills/` 目录变更，对比 `.release/state.json`
- **智能版本号** - SemVer：新增=MINOR，删除=MAJOR，修改=PATCH
- **一键打包** - 打包整个 workspace
- **Git 集成** - CHANGELOG + 提交 + 标签 + 推送

## 使用方式

> ⚠️ **强制约束：禁止直接在技能目录执行 git add/commit/push**
>
> 所有 GitHub 同步操作必须通过同步脚本。
> 直接操作会绕过 TEMP 同步仓库的协调机制，
> 导致本地仓库与 TEMP 仓库分叉，下一次脚本运行会覆盖本地变更。

### Windows (PowerShell)

```powershell
# ★ 必须从 skills 根目录运行（不是 release-manager 目录！）
cd "C:\Users\Administrator\.workbuddy\skills"
.\release-manager\scripts\sync-to-github.ps1 -CommitMessage "feat: 新增XX技能"

# 跳过预检
.\release-manager\scripts\sync-to-github.ps1 -CommitMessage "fix: 修复XX" -SkipPrereqCheck
```

### Linux / macOS (Bash)

```bash
# ★ 必须从技能根目录运行
cd ~/.hermes/skills/acquisition
bash release-manager/scripts/sync-to-github.sh -m "feat: 新增XX技能"

# 跳过预检
bash release-manager/scripts/sync-to-github.sh -m "fix: 修复XX" --skip-prereq

# 自定义仓库
bash release-manager/scripts/sync-to-github.sh -m "sync" --owner Wike-CHI --repo acquisition-agent
```

### 环境变量（Linux/macOS）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LOCAL_SKILLS_DIR` | `~/.hermes/skills/acquisition` | 本地技能目录 |
| `REPO_DIR` | `/tmp/acquisition-agent-sync` | 临时同步仓库路径 |
| `REPO_OWNER` | `Wike-CHI` | GitHub 用户名 |
| `REPO_NAME` | `acquisition-agent` | GitHub 仓库名 |
| `BRANCH` | `main` | 目标分支 |

### GitHub 同步

| 命令 | 行为 |
|------|------|
| 同步到GitHub | 增量同步本地技能 → GitHub |
| 同步（自定义消息） | 同步 + 自定义 commit message |
| 检查submodule | 扫描仓库中的嵌套 .git 问题 |
| 修复submodule | 自动修复 GCA 的 submodule 引用 |
| 清理大文件 | 扫描并列出仓库中的大文件 |

### ZIP 打包

| 命令 | 行为 |
|------|------|
| 检查更新 | 扫描变更 → 输出变更报告 + 版本建议 |
| 发布新版本 | 变更检测 → 版本计算 → CHANGELOG → ZIP → Git |
| 发布 v1.2.0 | 使用指定版本号发布 |
| 发布但不推送 | 打包+提交，不执行 git push |

运行（Windows）：
```powershell
.\scripts\check-updates.ps1
.\scripts\release.ps1
.\scripts\release.ps1 -Version 1.2.0 -NoPush
```

## 核心经验（踩坑总结）

### 1. Submodule 引用问题

**症状**：GitHub 上 `global-customer-acquisition/` 显示为灰色文件夹，点击提示 `@d7a368ab`

**原因**：GCA 内部有独立的 `.git/` 目录，git 将其识别为 submodule，commit 中只存 commit hash 引用

**修复**：
```bash
# 从 git index 中删除 submodule 引用
git rm --cached skills/global-customer-acquisition
# 确保 .git 目录已删除
rm -rf skills/global-customer-acquisition/.git
# 重新 add 为普通目录
git add skills/global-customer-acquisition
# 验证：应该是 100644 (blob) 而不是 160000 (commit)
git ls-files --stage skills/global-customer-acquisition | head -1
```

### 2. 仓库体积膨胀

**症状**：仓库从 5MB 膨胀到 2GB+

**原因**：构建产物（release/dist/）、产品图片/视频、产品说明书 PDF

**解决**：`.gitignore` 中屏蔽大文件：
```gitignore
# 构建产物
skills/global-customer-acquisition/release/
skills/global-customer-acquisition/dist/
skills/global-customer-acquisition/dist-full/

# 产品大文件
skills/honglong-products/**/*.mp4
skills/honglong-products/**/*.png
skills/honglong-products/**/*.jpg
skills/honglong-products/**/*.jpeg

# 临时产品文档
temp-*
```

### 3. 重复技能目录

**症状**：`skills/honglong-products/` 和 `skills/global-customer-acquisition/skills/honglong-products/` 重复

**原因**：GCA 内部 `skills/` 子目录是其他技能的符号链接/副本

**解决**：同步脚本中排除 GCA 的 `skills/` 子目录（只保留 GCA 自身文件）

## 版本号规则

| 变更类型 | 版本升级 | 示例 |
|----------|----------|------|
| 新增技能 | MINOR+1 | 1.0.0 → 1.1.0 |
| 删除技能 | MAJOR+1 | 1.0.0 → 2.0.0 |
| 修改技能 | PATCH+1 | 1.0.0 → 1.0.1 |
| 多个变更 | 取最高 | 新增+修改 → MINOR |

## 目录结构

```
release-manager/
├── SKILL.md                           # 本文件
├── scripts/
│   ├── sync-to-github.ps1             # GitHub 同步脚本 (Windows)
│   ├── sync-to-github.sh              # GitHub 同步脚本 (Linux/macOS)
│   ├── check-updates.ps1              # 变更检测
│   ├── release.ps1                    # ZIP 打包
│   ├── setup.ps1                      # 初始化
│   └── init-git.ps1                   # Git 初始化
└── references/
    ├── github-sync-guide.md           # GitHub 同步操作指南
    ├── packaging-structure.md         # ZIP 打包结构
    └── version-rules.md               # 版本号规则
```

## 依赖

### Windows
- Git（版本控制 + 标签）
- GitHub CLI（`gh` 可选，用于 PAT 认证 clone）
- PowerShell 5.1+（`Compress-Archive` 内置，无需 7-Zip）
- robocopy（Windows 内置，增量同步）

### Linux / macOS
- Git
- GitHub CLI（`gh` 可选）
- rsync（增量同步）
- curl（网络检测）
- python3（hash JSON 读写，通常系统自带）

---

_Version: 3.2.0_
