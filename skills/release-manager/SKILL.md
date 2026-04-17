---
name: release-manager
description: >
  发布管理技能 v3.2.0 - 双模式发布：ZIP打包 + GitHub仓库同步。
  当用户说"发布新版本"、"打包系统"、"同步到GitHub"、"推送技能到仓库"、
  "sync to github"、"release"、"技能版本管理"、"清理仓库"、
  "更新GitHub仓库"、"force push"、"submodule修复"时使用。
  专为红龙获客系统定制，支持增量同步、submodule检测、大文件过滤。
version: 3.2.0
triggers:
  - 发布管理
  - 打包
  - release
  - 目录结构
---

# release-manager

发布管理技能 - 双模式：ZIP 打包发布 + GitHub 仓库同步。

## 红龙获客系统目录结构（正确版）

> ⚠️ **2026-04-17 踩坑记录**：`workspace/` 子目录是错误概念！运营文件必须
> 直接放在集群根目录，不存在 `~/.hermes/skills/acquisition/workspace/` 这个路径。

红龙获客系统运行在 `~/.hermes/skills/acquisition/`，结构如下：

```
~/.hermes/skills/acquisition/          ← 集群根目录（Hermes Agent 读取这里）
│
├── README.md                          ← 项目说明
├── CHANGELOG.md                       ← 变更记录
├── AGENTS.md                          ← AI SDR Pipeline 操作手册
├── HEARTBEAT.md                       ← 自动巡检配置
├── MEMORY.md                          ← 持久化记忆
├── ROUTING-TABLE.yaml                 ← 技能路由表（~74条）
├── SKILLS-MANIFEST.yaml               ← 技能分类目录（82个）
│
├── skills/                            ← 82个活跃技能
├── archive/                           ← 33个已归档技能
├── deploy/                            ← 部署脚本和CLI工具链
├── product-kb/                        ← 产品知识库（NAS挂载后填入）
├── examples/                          ← 行业场景案例（南美/中东/东南亚）
├── docs/internal/                     ← 内部文档
└── local/                             ← Windows平台特定工具（turix-win）
```

**不存在** `workspace/` 子目录。运营文件（AGENTS.md 等）直接在根目录。

GitHub 仓库结构与本地完全一致，克隆到 `/tmp/acquisition-agent/`。

---

## 核心原则：双环境同步约束

> ⚠️ **最容易犯的错误**：只编辑 GitHub 克隆或只编辑本地系统，导致两处分歧。

| 环境 | 路径 | 角色 |
|------|------|------|
| **本地运行系统** | `~/.hermes/skills/acquisition/` | Hermes Agent 实际读取 |
| **GitHub 仓库克隆** | `/tmp/acquisition-agent/` | GitHub 同步用的临时工作区 |

**正确操作顺序**：
1. 在本地运行系统（`~/.hermes/skills/acquisition/`）直接编辑文件
2. 将变更同步到 GitHub 克隆（`/tmp/acquisition-agent/`）
3. 在克隆里 commit + push
4. **完成！本地系统已经是最新，无需额外同步**

**错误的做法**：
- ❌ 直接在 `/tmp/acquisition-agent/` 编辑文件而不回写本地
- ❌ 在本地编辑后不更新 GitHub 克隆就 push
- ❌ 创建 `~/.hermes/skills/acquisition/workspace/` 子目录（这是错误概念）

**文件分布规则**：
- `skills/`、`archive/`、`deploy/` → 直接同步子目录
- 根目录运营文件（`AGENTS.md` 等）→ 用 `cp` 同步（不是 `git mv`）

---

## 功能

### 模式 A：GitHub 仓库同步（推荐）

将本地 `~/.workbuddy/skills/` 中红龙系统相关技能同步到 GitHub 仓库。

- **增量同步** - 只传输有变化的技能，跳过无变化的
- **Submodule 检测** - 自动发现并修复嵌套 `.git/` 导致的 submodule 引用
- **大文件过滤** - robocopy 排除 node_modules/.git/等，.gitignore 屏蔽图片/视频/PDF
- **白名单机制** - 只保留红龙获客系统相关技能（~80个），排除无关技能
- **一键操作** - clone/pull → 同步 → 检测 → 提交 → 推送

### 模式 B：ZIP 打包发布

打包整个 workspace（7层上下文 + 技能集群 + 子目录）为 ZIP 分发包。

- **自动检测更新** - 扫描 `skills/` 目录变更，对比 `.release/state.json`
- **智能版本号** - SemVer：新增=MINOR，删除=MAJOR，修改=PATCH
- **一键打包** - 打包整个 workspace
- **Git 集成** - CHANGELOG + 提交 + 标签 + 推送

## 使用方式

> ⚠️ **强制约束：禁止直接在 `~/.workbuddy/skills/` 目录执行 git add/commit/push**
>
> 所有 GitHub 同步操作必须通过 `scripts/sync-to-github.ps1` 脚本。
> 直接操作会绕过 TEMP 同步仓库（`%TEMP%\acquisition-agent-sync`）的协调机制，
> 导致本地仓库与 TEMP 仓库分叉，下一次脚本运行会覆盖本地变更。
>
> **唯一正确的操作**：
> ```powershell
> cd "C:\Users\Administrator\.workbuddy\skills"
> .\release-manager\scripts\sync-to-github.ps1 -CommitMessage "你的提交信息"
> ```

### GitHub 同步

| 命令 | 行为 |
|------|------|
| 同步到GitHub | 增量同步本地技能 → GitHub |
| 同步（自定义消息） | 同步 + 自定义 commit message |
| 检查submodule | 扫描仓库中的嵌套 .git 问题 |
| 修复submodule | 自动修复 GCA 的 submodule 引用 |
| 清理大文件 | 扫描并列出仓库中的大文件 |

运行：
```powershell
# ★ 必须从 skills 根目录运行（不是 release-manager 目录！）
cd "C:\Users\Administrator\.workbuddy\skills"
.\release-manager\scripts\sync-to-github.ps1 -CommitMessage "feat: 新增XX技能"
```

### ZIP 打包

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
```

## 核心经验（踩坑总结）

### 1. Submodule 引用问题

**症状**：GitHub 上 `global-customer-acquisition/` 显示为灰色文件夹，点击提示 `@d7a368ab`

**原因**：GCA 内部有独立的 `.git/` 目录，git 将其识别为 submodule，commit 中只存 commit hash 引用

**修复**：
```powershell
# 从 git index 中删除 submodule 引用
git rm --cached skills/global-customer-acquisition
# 确保 .git 目录已删除
Remove-Item "skills\global-customer-acquisition\.git" -Recurse -Force
# 重新 add 为普通目录
git add skills/global-customer-acquisition
# 验证：应该是 100644 (blob) 而不是 160000 (commit)
git ls-files --stage skills/global-customer-acquisition | Select-Object -First 1
```

### 4. WSL/Linux 下 GitHub 推送

**发现**：在 WSL 环境中，如果已有克隆好的 git 仓库在 `/tmp/`，仓库本身已配置了 git remote（通过 SSH 或 HTTPS URL），则可以直接 `git push`，无需额外配置认证。推送时 git 自动使用 `~/.gitconfig` 中定义的 user.email。

**操作流程（WSL/Linux）**：
```bash
# 假设仓库已在 /tmp/acquisition-agent
cd /tmp/acquisition-agent

# 同步新技能/文档
rsync -a --delete \
    --exclude=node_modules --exclude=.git \
    ~/.hermes/skills/acquisition/{新技能目录}/ skills/{新技能目录}/

# 提交并推送
git add 新文件...
git commit -m "feat: ..."
git push origin main
git tag v3.0.0 && git push origin v3.0.0
```

**优势**：无需重新 clone（仓库已存在），无需手动配置 gh auth 或 token 环境变量。

---

### 3. 仓库体积膨胀

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
│   ├── sync-to-github.ps1             # GitHub 同步脚本
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

- Git（版本控制 + 标签）
- GitHub CLI（`gh` 可选，用于 PAT 认证 clone）
- PowerShell 5.1+（`Compress-Archive` 内置，无需 7-Zip）
- robocopy（Windows 内置，增量同步）

---

_Version: 3.1.0_
