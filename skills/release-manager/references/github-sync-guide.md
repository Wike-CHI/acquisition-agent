# GitHub 同步操作指南

## 仓库信息

- **仓库**: `Wike-CHI/acquisition-agent`
- **分支**: `main`
- **本地缓存**: `%TEMP%\acquisition-agent-sync`
- **同步脚本**: `scripts/sync-to-github.ps1`

## ⚠️ 强制约束

> **禁止直接在 `~/.workbuddy/skills/` 执行 git add/commit/push**
>
> 所有 GitHub 推送必须通过 `sync-to-github.ps1` 脚本。
> 所有 GitHub 拉取必须通过 `pull-from-github.ps1` 脚本。
> 禁止绕过 TEMP 协调仓库（`%TEMP%\acquisition-agent-sync`）直接操作本地 skills。

## 同步流程

```
本地 ~/.workbuddy/skills/
        │
        ▼ 预检（gh auth / 网络连通性）
        │
        ▼ SKILL.md hash 检测 → 增量同步（跳过无变化的技能）
        │
%TEMP%/acquisition-agent-sync/skills/
        │
        ▼ submodule 检测 + 嵌套 .git 清理
        │
        ▼ git add + commit + push
        │
GitHub: Wike-CHI/acquisition-agent (main)
```

## 操作步骤

### 日常推送（本地 → GitHub）

```powershell
# ★ 必须从 skills 根目录运行
cd "C:\Users\Administrator\.workbuddy\skills"
.\release-manager\scripts\sync-to-github.ps1 -CommitMessage "feat: 新增XX技能"
```

### 日常拉取（GitHub → 本地）

```powershell
# ★ 从任意目录运行
cd "C:\Users\Administrator\.workbuddy\skills"
.\release-manager\scripts\pull-from-github.ps1

# 预览模式（显示将要更新的技能，不实际修改）
.\release-manager\scripts\pull-from-github.ps1 -WhatIf
```

### 拉取流程（单向）

```
GitHub: Wike-CHI/acquisition-agent (main)
    │
    ▼ fetch + pull
%TEMP%/acquisition-agent-sync/    ← TEMP 协调仓库
    │
    ▼ robocopy 增量同步
本地 ~/.workbuddy/skills/          ← 本地技能目录
```

> ⚠️ 拉取前请确保本地 skills 没有未推送的变更，否则会被覆盖！

```powershell
# ★ 必须从 skills 根目录运行
cd "C:\Users\Administrator\.workbuddy\skills"
.\release-manager\scripts\sync-to-github.ps1 -CommitMessage "feat: 新增XX技能"
```

### 首次初始化（从零开始）

如果需要从零重建 GitHub 仓库，参考以下步骤：

```powershell
# 1. 创建临时目录
$repo = "C:\Temp\acquisition-agent"
New-Item -ItemType Directory -Path $repo -Force

# 2. 初始化 Git
cd $repo
git init
git remote add origin https://github.com/Wike-CHI/acquisition-agent.git

# 3. 运行同步脚本（会自动 clone 或创建仓库）
.\scripts\sync-to-github.ps1
```

### 仓库大清理（深度清理）

如果仓库已经很大（>100MB），需要深度清理：

```powershell
$repo = "C:\Temp\acquisition-agent"

# Step 1: 统计各目录大小
Get-ChildItem "$repo\skills" -Directory | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -EA SilentlyContinue |
             Measure-Object -Property Length -Sum).Sum
    [PSCustomObject]@{ Name = $_.Name; SizeMB = [math]::Round($size / 1MB, 1) }
} | Sort-Object SizeMB -Descending | Format-Table -AutoSize

# Step 2: 删除构建产物
$gca = "$repo\skills\global-customer-acquisition"
Remove-Item "$gca\release" -Recurse -Force -EA SilentlyContinue
Remove-Item "$gca\dist" -Recurse -Force -EA SilentlyContinue
Remove-Item "$gca\dist-full" -Recurse -Force -EA SilentlyContinue

# Step 3: 删除产品大文件
$hp = "$repo\skills\honglong-products"
$exts = @("*.mp4", "*.avi", "*.mov", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.bmp", "*.webp")
foreach ($ext in $exts) {
    Get-ChildItem $hp -Recurse -Filter $ext -File -EA SilentlyContinue | Remove-Item -Force
}

# Step 4: 删除临时产品文档
Get-ChildItem $gca -Filter "temp-*" -File | Remove-Item -Force

# Step 5: 更新 .gitignore
# （参考下方 .gitignore 模板）

# Step 6: 提交并推送
git add -A
git commit --amend -m "chore: clean repo - remove large files and build artifacts"
git push --force origin main
```

## .gitignore 模板

```gitignore
# === 构建产物 ===
skills/global-customer-acquisition/release/
skills/global-customer-acquisition/dist/
skills/global-customer-acquisition/dist-full/

# === 产品大文件（图片/视频） ===
skills/honglong-products/**/*.mp4
skills/honglong-products/**/*.avi
skills/honglong-products/**/*.mov
skills/honglong-products/**/*.mkv
skills/honglong-products/**/*.png
skills/honglong-products/**/*.jpg
skills/honglong-products/**/*.jpeg
skills/honglong-products/**/*.gif
skills/honglong-products/**/*.bmp
skills/honglong-products/**/*.webp
skills/honglong-products/**/*.tif
skills/honglong-products/**/*.tiff

# === 临时文件 ===
temp-*
package-lock.json
*.pyc
.env

# === 通用排除 ===
node_modules/
.git/
__pycache__/
coverage/
test-output/
```

## Submodule 问题排查

### 症状

- GitHub 上目录显示为灰色，点击显示 `@xxxxxxx`
- `git submodule status` 报错：`fatal: no submodule mapping found in .gitmodules`

### 原因

技能目录（尤其是 `global-customer-acquisition`）内部有独立的 `.git/` 目录。Git 将其识别为 submodule，commit 中只存储 commit hash 引用而非实际文件。

### 手动修复

```powershell
cd "C:\Temp\acquisition-agent"

# 1. 查看哪些路径是 submodule 引用
git ls-files --stage | Where-Object { $_ -match "^160000" }

# 2. 删除 submodule 引用
git rm --cached skills/global-customer-acquisition

# 3. 确认 .git 已删除
Remove-Item "skills\global-customer-acquisition\.git" -Recurse -Force

# 4. 重新 add 为普通文件
git add skills/global-customer-acquisition

# 5. 验证（应为 100644 而非 160000）
git ls-files --stage skills/global-customer-acquisition | Select-Object -First 1
# 期望: 100644 blob xxxxx  skills/global-customer-acquisition/SKILL.md

# 6. 提交并 force push
git commit --amend -m "fix: resolve submodule reference"
git push --force origin main
```

## 技能白名单

同步脚本只保留以下技能（`$RetainedSkills` 数组）：

| 层级 | 技能 |
|------|------|
| 主入口 | global-customer-acquisition, understand-honglong-acquisition |
| 编排层 | acquisition-coordinator, acquisition-evaluator, acquisition-init, acquisition-workflow |
| 发现层 | linkedin, facebook-acquisition, instagram-acquisition, teyi-customs, scrapling |
| 情报层 | company-research, market-research, in-depth-research, autoresearch, customer-intelligence, deep-research |
| 触达层 | email-sender, email-marketing, cold-email-generator, linkedin-writer, email-outreach-ops, delivery-queue |
| 支持层 | customer-deduplication, sales-pipeline-tracker, crm, fumamx-crm, credential-manager |
| 人格层 | honglong-assistant, honglong-products |
| 文档层 | document-pro, nano-pdf, pdf-extract, pdf-smart-tool-cn, excel-xlsx, office |
| 搜索层 | brave-web-search, exa-search, exa-web-search-free, tavily-search, multi-search-engine |
| 浏览器 | browser-automation, playwright, agent-browser, desktop-control |
| 记忆 | smart-memory, humanoid-memory, memory-hygiene, memory-tiering, memory-manager |
| 工具 | nas-file-reader, daily-report-writer, calendar-skill, release-manager, sales |
| 基础设施 | acp, skill-creator, find-skills, skill-discovery, evolver, agent-reach-setup |

## 注意事项

1. **同步脚本自动排除 GCA 的 `skills/` 子目录**，避免重复同步其他技能
2. **robocopy 的排除目录**：node_modules, .git, coverage, __pycache__, test-output, .serena, release, dist, dist-full
3. **同步前会自动检测 submodule 引用并修复**
4. **不会删除 GitHub 上白名单以外的技能**（只同步白名单内的）
5. **force push 需要手动操作**，脚本不会自动 force push

---

_Version: 3.2.0_
