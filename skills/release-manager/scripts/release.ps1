# release.ps1
# 发布红龙获客系统 - 打包整个 workspace

param(
    [string]$Version = "",
    [string]$ProjectName = "honglong-acquisition-agent",
    [switch]$DryRun = $false,
    [switch]$NoPush = $false,
    [string]$OutputPath = "releases",
    [string]$WorkspacePath = "",
    [string]$SkillsPath = ""
)

$ErrorActionPreference = "Stop"

# ============================================================
# 路径解析
# ============================================================
# 智能推断：从 release-manager 的 scripts/ 向上找到 workspace 根目录
# skills/release-manager/scripts -> skills/release-manager -> workspace root
#
# 红龙获客系统的打包源是整个 workspace，而非 ~/.workbuddy/skills/
# 正确的 workspace 结构：
#   workspace/
#   ├── *.md (7层上下文 + 架构文档)
#   ├── skills/ (技能集群)
#   ├── memory/ (历史记忆)
#   ├── customer-data/ (客户数据)
#   ├── scripts/ (自定义脚本)
#   └── output/ (输出结果)
# ============================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)  # release-manager -> skills -> workspace root

if ($WorkspacePath -eq "") {
    $potentialWorkspace = Split-Path -Parent $skillRoot
    if (Test-Path (Join-Path $potentialWorkspace ".release")) {
        $WorkspacePath = $potentialWorkspace
    } else {
        $WorkspacePath = $skillRoot
    }
}

if ($SkillsPath -eq "") {
    $SkillsPath = Join-Path $WorkspacePath "skills"
}

Set-Location $WorkspacePath

# ============================================================
# Step 1: 检查更新
# ============================================================
$checkScript = Join-Path $scriptDir "check-updates.ps1"
$changesJson = & $checkScript -WorkspacePath $WorkspacePath -SkillsPath $SkillsPath 2>$null | Select-Object -Last 1

if (-not $changesJson) {
    Write-Host "⚠️  无法获取变更信息" -ForegroundColor Yellow
    exit 1
}

$changes = $changesJson | ConvertFrom-Json

if (-not $changes.hasChanges) {
    Write-Host ""
    Write-Host "✨ 无变更，跳过发布" -ForegroundColor Yellow
    exit 0
}

# ============================================================
# Step 2: 确定版本号
# ============================================================
if ($Version -eq "") {
    $Version = $changes.suggestedVersion
}

if ($Version -notmatch '^\d+\.\d+\.\d+$') {
    Write-Host "❌ 版本号格式错误: $Version (应为 X.Y.Z)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       📦 发布版本 $Version             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green

if ($DryRun) {
    Write-Host "🔍 DRY RUN - 不会实际执行" -ForegroundColor Yellow
}

# ============================================================
# Step 3: 统计 workspace 内容（用于报告）
# ============================================================
$skillDirs = Get-ChildItem $SkillsPath -Directory -Depth 0 -EA SilentlyContinue | Where-Object {
    $_.Name -notmatch '^(IsReadOnly|IsFixedSize|IsSynchronized|Count)$' -and
    $_.Name -notmatch '^\.' -and
    $_.Name -notin @('__pycache__', 'skills', 'references', 'templates', 'hooks', 'local', 'evals', 'experiments')
}
$skillCount = $skillDirs.Count

$allMdFiles = @(Get-ChildItem $WorkspacePath -Filter "*.md" -Depth 0 -EA SilentlyContinue)
$contextFiles = $allMdFiles | Where-Object { $_.Name -in @(
    'AGENTS.md', 'HEARTBEAT.md', 'IDENTITY.md', 'MEMORY.md',
    'SOUL.md', 'TOOLS.md', 'USER.md', 'BOOTSTRAP.md',
    'ARCHITECTURE.md', 'SETUP.md', 'SYSTEM-INDEX.md',
    'EXECUTION-LAYER.md', 'QUICK-REFERENCE.md'
)}

$subdirs = @(
    @{ Name = "skills"; Desc = "技能集群" },
    @{ Name = "scripts"; Desc = "自定义脚本" },
    @{ Name = "memory"; Desc = "历史记忆" },
    @{ Name = "customer-data"; Desc = "客户数据" },
    @{ Name = "output"; Desc = "输出结果" },
    @{ Name = "emails"; Desc = "邮件记录" },
    @{ Name = "docs"; Desc = "临时文档" },
    @{ Name = "projects"; Desc = "项目文件" },
    @{ Name = "multi-agent"; Desc = "多Agent配置" },
    @{ Name = "nas-knowledge"; Desc = "NAS知识索引" },
    @{ Name = "customer-search"; Desc = "客户搜索" },
    @{ Name = "customer-outreach"; Desc = "客户触达" },
    @{ Name = "releases"; Desc = "发布记录" },
    @{ Name = "customer-acquisition-skills"; Desc = "获客技能包" }
)

# ============================================================
# Step 4: 准备输出目录
# ============================================================
$releaseDir = Join-Path $WorkspacePath $OutputPath
if (-not (Test-Path $releaseDir)) {
    New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
}

$zipFileName = "$ProjectName-v$Version.zip"
$zipPath = Join-Path $releaseDir $zipFileName

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# ============================================================
# Step 5: 打包（workspace 根目录）
# ============================================================
Write-Host ""
Write-Host "📦 打包 workspace..." -ForegroundColor Cyan

$tempDir = Join-Path $env:TEMP "$ProjectName-v$Version"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$releaseDate = Get-Date -Format "yyyy-MM-dd"

# 5.1: 根目录文档（README + INSTALL + QUICK-START）
Write-Host "  创建根目录文档..." -ForegroundColor Gray

$readmeContent = @"
# $ProjectName

> AI获客系统 - 自动化客户发现、背调、开发信、报价
> 红龙工业设备专属，v$Version

## 快速开始

### 安装

解压 ZIP 到 `~/.workbuddy/workspace` 或任意位置：
\`\`\`bash
unzip $zipFileName -d ~/.workbuddy/workspace
\`\`\`

### 配置（首次使用）

1. 编辑根目录下的核心文件：
   - \`IDENTITY.md\` - 公司信息
   - \`USER.md\` - 负责人信息
   - \`BOOTSTRAP.md\` - 启动指南
2. 阅读 \`SYSTEM-INDEX.md\` - AI必读索引

### 使用

\`\`\`
帮我找10个美国的输送带制造商
背调：ACE Belting
生成开发信：ACE Belting, 制造商, 风冷机
\`\`\`

## 系统架构

**3层架构**：用户交互层 → 业务逻辑层（7层上下文 + 10阶段销售流程）→ 数据持久层（CRM + NAS + 记忆）

**7层上下文**：IDENTITY → SOUL → AGENTS → USER → HEARTBEAT → MEMORY → TOOLS

## 目录结构

| 目录/文件 | 内容 |
|-----------|------|
| \`*.md\` (根目录) | 7层上下文 + 架构文档 |
| \`skills/\` | 技能集群（$skillCount 个技能） |
| \`scripts/\` | 自定义脚本 |
| \`memory/\` | 历史记忆 |
| \`customer-data/\` | 客户数据 |
| \`customer-acquisition-skills/\` | 获客技能包 |

## 版本信息

- **版本**: v$Version
- **发布时间**: $releaseDate
- **打包结构**: workspace-root（完整 workspace）

---

**Built with ❤️ by HOLO Team**
"@

$readmeContent | Set-Content (Join-Path $tempDir "README.md") -Encoding UTF8

$installContent = @"
# 安装指南

## 系统要求

- WorkBuddy 2.0+
- PowerShell 5.1+
- Git（可选）

## 安装步骤

### 方法1: 自动安装

解压 ZIP 后，运行：
\`\`\`powershell
cd deploy
.\install.ps1
\`\`\`

### 方法2: 手动安装

解压 ZIP，复制所有内容到 \`~/.workbuddy/workspace/\`

## 首次配置（9步）

1. **配置个人信息** → 编辑根目录 \`IDENTITY.md\`
2. **配置负责人** → 编辑根目录 \`USER.md\`
3. **配置AI人格** → 编辑根目录 \`SOUL.md\`
4. **配置自动化** → 编辑根目录 \`HEARTBEAT.md\`
5. **配置工具** → 编辑根目录 \`TOOLS.md\`
6. **配置记忆** → 编辑根目录 \`MEMORY.md\`
7. **阅读架构** → 阅读 \`ARCHITECTURE.md\`
8. **阅读索引** → 阅读 \`SYSTEM-INDEX.md\`
9. **验证系统** → 执行 \`检查获客系统状态\`

## 关键文档

| 文档 | 用途 |
|------|------|
| SYSTEM-INDEX.md | AI必读！完整系统索引 |
| ARCHITECTURE.md | 系统架构设计 |
| BOOTSTRAP.md | 启动指南 |
| SETUP.md | 完整9步配置 |
| EXECUTION-LAYER.md | 状态机 + 规则引擎 |

## 技术支持

- 负责人: Wike
- 邮箱: wikeye2025@163.com
- 官网: holobelt.com
"@

$installContent | Set-Content (Join-Path $tempDir "INSTALL.md") -Encoding UTF8

$quickStartContent = @"
# 快速开始

## 5分钟上手

### Step 1: 阅读 SYSTEM-INDEX.md（必读）

\`\`\`
SYSTEM-INDEX.md 是整个系统的索引，AI 启动时会读取它
\`\`\`

### Step 2: 第一次客户发现

\`\`\`
帮我找5个越南的输送带制造商
\`\`\`

### Step 3: 第一次背调

\`\`\`
背调：VICSUN CO., LTD
\`\`\`

### Step 4: 第一封开发信

\`\`\`
生成开发信：VICSUN CO., LTD, 制造商, 风冷机
\`\`\`

### Step 5: 发送邮件

\`\`\`
发送邮件给 vicsunco.ltd@gmail.com
主题: HOLO Air Cooled Press - Professional Belt Splicing Solution
\`\`\`

## 常用命令

### 客户发现
| 命令 | 说明 |
|------|------|
| \`帮我找客户：[行业] + [国家]\` | 多渠道搜索 |
| \`从海关数据查：[产品] + [国家]\` | 特易海关 |
| \`在LinkedIn搜索：[职位] + [国家]\` | LinkedIn |

### 客户管理
| 命令 | 说明 |
|------|------|
| \`背调：[公司名]\` | 企业背调 |
| \`创建客户：[信息]\` | CRM录入 |
| \`ICP评分：[公司名]\` | 评分 |

### 触达
| 命令 | 说明 |
|------|------|
| \`生成开发信：[客户]\` | 开发信生成 |
| \`发送邮件：[邮箱]\` | 发送邮件 |
| \`跟进：[公司名] Day 3\` | 跟进邮件 |

---

**开始使用，让AI帮你找客户！** 🚀
"@

$quickStartContent | Set-Content (Join-Path $tempDir "QUICK-START.md") -Encoding UTF8

# 5.2: 复制根目录 .md 文档（7层上下文 + 架构文档）
Write-Host "  复制根目录文档..." -ForegroundColor Gray
$rootMdFiles = Get-ChildItem $WorkspacePath -Filter "*.md" -Depth 0 -EA SilentlyContinue
foreach ($f in $rootMdFiles) {
    if ($f.Name -ne "README.md" -and $f.Name -ne "INSTALL.md" -and $f.Name -ne "QUICK-START.md") {
        Copy-Item $f.FullName $tempDir -Force
    }
}

# 5.3: 复制子目录（skills/ scripts/ memory/ 等）
# 排除 releases/（打包输出目录，累积旧 ZIP 会导致体积膨胀）
Write-Host "  复制 workspace 子目录..." -ForegroundColor Gray
$excludeDirs = @("releases")
foreach ($item in $subdirs) {
    if ($item.Name -in $excludeDirs) {
        Write-Host "    ⊘ $($item.Name)/ (跳过)" -ForegroundColor DarkGray
        continue
    }
    $src = Join-Path $WorkspacePath $item.Name
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $tempDir -Recurse -Force
        $count = (Get-ChildItem $src -Recurse -File -EA SilentlyContinue).Count
        Write-Host "    ✓ $($item.Name)/ ($count 个文件)" -ForegroundColor Gray
    }
}

# 5.4: 创建 deploy/ 目录
Write-Host "  创建 deploy/..." -ForegroundColor Gray
$deployDir = Join-Path $tempDir "deploy"
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

$installScript = @"
# install.ps1 - 一键安装脚本

param(
    [string]`$TargetPath = "`$env:USERPROFILE\.workbuddy\workspace"
)

Write-Host "安装到: `$TargetPath" -ForegroundColor Cyan

if (-not (Test-Path `$TargetPath)) {
    New-Item -ItemType Directory -Path `$TargetPath -Force | Out-Null
}

# 复制所有内容
Copy-Item -Path ".\\*" -Destination "`$TargetPath" -Recurse -Force -Exclude "*.zip","releases\\*","deploy\\*"

Write-Host "✅ 安装完成！" -ForegroundColor Green
Write-Host ""
Write-Host "请编辑 `$TargetPath\IDENTITY.md 和 `$TargetPath\USER.md" -ForegroundColor Yellow
Write-Host "然后阅读 `$TargetPath\SYSTEM-INDEX.md" -ForegroundColor Yellow
"@

$installScript | Set-Content (Join-Path $deployDir "install.ps1") -Encoding UTF8

# 复制 setup.ps1
$setupSrc = Join-Path $scriptDir "setup.ps1"
if (Test-Path $setupSrc) {
    Copy-Item $setupSrc $deployDir -Force
}

# ============================================================
# Step 6: 压缩
# ============================================================
if (-not $DryRun) {
    Write-Host "  压缩文件..." -ForegroundColor Gray
    try {
        Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal -Force
    } catch {
        $7z = "C:\Program Files\7-Zip\7z.exe"
        if (Test-Path $7z) {
            & $7z a -tzip $zipPath "$tempDir\*" -mx=5 | Out-Null
        } else {
            throw "压缩失败: $_"
        }
    }
}

# 清理
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

# ZIP 大小
if (Test-Path $zipPath) {
    $zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
} else {
    $zipSize = 0
}

# ============================================================
# Step 7: 更新 state.json
# ============================================================
Write-Host ""
Write-Host "📝 更新状态..." -ForegroundColor Cyan

$stateDir = Join-Path $WorkspacePath ".release"
if (-not (Test-Path $stateDir)) {
    New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
}

$statePath = Join-Path $stateDir "state.json"
$newState = @{
    version     = $Version
    releaseDate = $releaseDate
    skills      = $changes.currentSkills
    totalSkills = $skillCount
    zipFile     = $zipFileName
    zipSize     = "$zipSize MB"
    structure   = "workspace-root"
}

if (-not $DryRun) {
    $newState | ConvertTo-Json -Depth 10 | Set-Content $statePath -Encoding UTF8
}

# ============================================================
# Step 8: 生成/更新 CHANGELOG
# ============================================================
Write-Host "📝 更新CHANGELOG..." -ForegroundColor Cyan

$changelogPath = Join-Path $WorkspacePath ".release\CHANGELOG.md"
$changelogHeader = @"
# 更新日志

## [$Version] - $releaseDate

**打包结构**: workspace-root（完整 workspace）

"@

$changelogBody = ""
if ($changes.added.Count -gt 0) {
    $changelogBody += "### 新增`n"
    $changes.added | ForEach-Object { $changelogBody += "- $_`n" }
    $changelogBody += "`n"
}
if ($changes.modified.Count -gt 0) {
    $changelogBody += "### 修改`n"
    $changes.modified | ForEach-Object { $changelogBody += "- $_`n" }
    $changelogBody += "`n"
}
if ($changes.deleted.Count -gt 0) {
    $changelogBody += "### 删除`n"
    $changes.deleted | ForEach-Object { $changelogBody += "- $_`n" }
    $changelogBody += "`n"
}
$changelogBody += "---`n`n"

if (-not $DryRun) {
    if (Test-Path $changelogPath) {
        $existing = Get-Content $changelogPath -Raw
        $changelogHeader + $changelogBody + ($existing -replace "^# 更新日志`n", "") | Set-Content $changelogPath -Encoding UTF8
    } else {
        $changelogHeader + $changelogBody | Set-Content $changelogPath -Encoding UTF8
    }
}

# ============================================================
# Step 9: 输出结果
# ============================================================
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            ✅ 发布完成                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 文件: $zipPath"
Write-Host "📊 大小: $zipSize MB"
Write-Host "📌 版本: $Version"
Write-Host "🏗️  结构: workspace-root（完整 workspace）"
Write-Host ""
Write-Host "📋 变更内容:" -ForegroundColor Yellow
Write-Host "  新增: $($changes.added.Count) 个技能"
Write-Host "  修改: $($changes.modified.Count) 个技能"
Write-Host "  删除: $($changes.deleted.Count) 个技能"
Write-Host ""
Write-Host "📁 打包内容:" -ForegroundColor Cyan
Write-Host "  ├── README.md / INSTALL.md / QUICK-START.md"
Write-Host "  ├── *.md ($($rootMdFiles.Count) 个文档)"
Write-Host "  ├── skills/ ($skillCount 个技能目录)"
$allIncludedDirs = $subdirs | Where-Object { $itemName = $_.Name; (Test-Path (Join-Path $WorkspacePath $itemName)) -and $itemName -notin $excludeDirs }
foreach ($item in $allIncludedDirs) {
    $src = Join-Path $WorkspacePath $item.Name
    $count = (Get-ChildItem $src -Recurse -File -EA SilentlyContinue).Count
    Write-Host "  ├── $($item.Name)/ ($($item.Desc)) $count 个文件"
}
Write-Host "  └── deploy/ (安装脚本)"

# ============================================================
# Step 10: Git 提交
# ============================================================
Write-Host ""
Write-Host "📝 Git提交..." -ForegroundColor Cyan

if (-not $DryRun) {
    $isGitRepo = Test-Path ".git"

    if ($isGitRepo) {
        git add .
        $commitMsg = "chore: release v$Version (workspace-root)

- 新增: $($changes.added.Count) 个技能
- 修改: $($changes.modified.Count) 个技能
- 删除: $($changes.deleted.Count) 个技能
- 打包结构: workspace-root"
        git commit -m $commitMsg

        git tag -a "v$Version" -m "Release v$Version"

        $hasRemote = git remote get-url origin 2>$null
        if ($hasRemote -and -not $NoPush) {
            Write-Host "📤 推送到远程..." -ForegroundColor Cyan
            git push
            git push --tags
            Write-Host "✅ 已推送到 $hasRemote" -ForegroundColor Green
        } elseif ($hasRemote -and $NoPush) {
            Write-Host "⏭️ 跳过推送 (-NoPush)" -ForegroundColor Yellow
        } else {
            Write-Host "⚠️ 未配置远程仓库，跳过推送" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ 不是 Git 仓库，跳过提交" -ForegroundColor Yellow
        Write-Host "  运行 init-git.ps1 初始化 Git" -ForegroundColor Gray
    }
}
