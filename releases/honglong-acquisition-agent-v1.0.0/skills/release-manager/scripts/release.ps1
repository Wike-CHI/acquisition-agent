# release.ps1
# 发布新版本 - B2B SDR Template 清爽结构

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

# 智能路径解析
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)

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

# 检查更新
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

# 确定版本号
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

# 准备输出目录
$releaseDir = Join-Path $WorkspacePath $OutputPath
if (-not (Test-Path $releaseDir)) {
    New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
}

$zipFileName = "$ProjectName-v$Version.zip"
$zipPath = Join-Path $releaseDir $zipFileName

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# 打包
Write-Host ""
Write-Host "📦 打包中（清爽结构）..." -ForegroundColor Cyan

$tempDir = Join-Path $env:TEMP "$ProjectName-v$Version"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$releaseDate = Get-Date -Format "yyyy-MM-dd"
$skillCount = $changes.currentSkills.PSObject.Properties.Count

# 1. 根目录文档
Write-Host "  创建根目录文档..." -ForegroundColor Gray

$readmeContent = @"
# $ProjectName

> AI获客系统 - 自动化客户发现、背调、开发信、报价

## 快速开始

### 安装

\`\`\`bash
unzip $zipFileName -d ~/.workbuddy/workspace
\`\`\`

### 配置

编辑 \`workspace/\` 目录下的核心文件：
- \`IDENTITY.md\` - 公司信息
- \`USER.md\` - 负责人信息

### 使用

\`\`\`
帮我找10个美国的输送带制造商
\`\`\`

## 7层上下文系统

| 文件 | 说明 |
|------|------|
| \`IDENTITY.md\` | 公司信息、产品线 |
| \`SOUL.md\` | AI人格、沟通风格 |
| \`AGENTS.md\` | 销售工作流（10阶段） |
| \`USER.md\` | 负责人画像、ICP定义 |
| \`HEARTBEAT.md\` | 自动化巡检（10项检查） |
| \`MEMORY.md\` | 记忆架构（3层引擎） |
| \`TOOLS.md\` | CRM、渠道、工具配置 |

## 技能集群

- **总技能数**: $($skillCount)个
- **核心技能**: 6个（编排层）
- **执行技能**: 分布在发现/情报/触达/CRM

## 版本信息

- **版本**: v$Version
- **发布时间**: $releaseDate
- **打包结构**: B2B SDR Template

---

**Built with ❤️ by HOLO Team**
"@

$readmeContent | Set-Content (Join-Path $tempDir "README.md") -Encoding UTF8

$installContent = @"
# 安装指南

## 系统要求

- WorkBuddy 2.0+
- PowerShell 5.1+
- Git（可选，用于版本控制）

## 安装步骤

### 方法1: 解压到工作空间

\`\`\`bash
unzip $zipFileName -d ~/.workbuddy/workspace
\`\`\`

### 方法2: 使用安装脚本

\`\`\`powershell
cd $ProjectName-v$Version\deploy
.\install.ps1
\`\`\`

## 配置

### 1. 编辑核心文件

编辑 \`workspace/\` 目录下的文件：

| 文件 | 必须修改 |
|------|----------|
| \`IDENTITY.md\` | ✅ 是 |
| \`USER.md\` | ✅ 是 |
| \`AGENTS.md\` | ⚠️ 可选 |

### 2. 配置渠道

编辑 \`workspace/TOOLS.md\` 中的渠道配置。

## 验证安装

\`\`\`
检查获客系统状态
\`\`\`

## 技术支持

- 邮箱: wikeye2025@163.com
- 官网: holobelt.com
"@

$installContent | Set-Content (Join-Path $tempDir "INSTALL.md") -Encoding UTF8

$quickStartContent = @"
# 快速开始

## 5分钟上手

### Step 1: 验证安装

\`\`\`
检查获客系统状态
\`\`\`

### Step 2: 第一次客户发现

\`\`\`
帮我找5个美国的输送带制造商
\`\`\`

### Step 3: 第一次客户背调

\`\`\`
背调：ACE Belting
\`\`\`

### Step 4: 第一封开发信

\`\`\`
生成开发信：ACE Belting, 制造商, 风冷机
\`\`\`

### Step 5: 第一次报价

\`\`\`
报价：ACE Belting, 风冷机 A2FRJ-1200, 2台
\`\`\`

## 常用命令

| 命令 | 说明 |
|------|------|
| \`帮我找客户：[行业] + [国家]\` | 多渠道搜索 |
| \`背调：[公司名]\` | 企业背调 |
| \`生成开发信：[客户]\` | 生成开发信 |
| \`发送邮件：[邮箱]\` | 发送邮件 |

---

**开始使用，让AI帮你找客户！** 🚀
"@

$quickStartContent | Set-Content (Join-Path $tempDir "QUICK-START.md") -Encoding UTF8

# SETUP.md / BOOTSTRAP.md（如存在）
foreach ($f in @("SETUP.md", "BOOTSTRAP.md")) {
    $src = Join-Path $WorkspacePath $f
    if (Test-Path $src) {
        Copy-Item $src $tempDir -Force
    }
}

# 2. workspace 目录
Write-Host "  创建 workspace/ 目录..." -ForegroundColor Gray
$wsDir = Join-Path $tempDir "workspace"
New-Item -ItemType Directory -Path $wsDir -Force | Out-Null

$contextFiles = @("AGENTS.md", "HEARTBEAT.md", "IDENTITY.md", "MEMORY.md", "SOUL.md", "TOOLS.md", "USER.md", "BOOTSTRAP.md")
foreach ($f in $contextFiles) {
    $src = Join-Path $WorkspacePath $f
    if (Test-Path $src) {
        Copy-Item $src $wsDir -Force
    }
}

# 3. skills 目录
Write-Host "  复制 skills/ 目录..." -ForegroundColor Gray
$skillsDest = Join-Path $tempDir "skills"
if (Test-Path $SkillsPath) {
    Copy-Item -Path $SkillsPath -Destination $skillsDest -Recurse -Force
}

# 4. deploy 目录
Write-Host "  创建 deploy/ 目录..." -ForegroundColor Gray
$deployDir = Join-Path $tempDir "deploy"
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

$installScript = @"
# install.ps1 - 一键安装脚本

param(
    [string]`$TargetPath = "`$env:USERPROFILE\.workbuddy\workspace"
)

Write-Host "安装到: `$TargetPath" -ForegroundColor Cyan

# 复制 workspace 文件
Copy-Item -Path "..\workspace\*" -Destination "`$TargetPath" -Recurse -Force -ErrorAction SilentlyContinue

# 复制 skills 文件
`$skillsDest = Join-Path `$TargetPath "skills"
if (-not (Test-Path `$skillsDest)) {
    New-Item -ItemType Directory -Path `$skillsDest -Force | Out-Null
}
Copy-Item -Path "..\skills\*" -Destination `$skillsDest -Recurse -Force

Write-Host "✅ 安装完成！" -ForegroundColor Green
Write-Host "请编辑 `$TargetPath\IDENTITY.md 和 `$TargetPath\USER.md" -ForegroundColor Yellow
"@

$installScript | Set-Content (Join-Path $deployDir "install.ps1") -Encoding UTF8

# 复制 setup.ps1
$setupSrc = Join-Path $scriptDir "setup.ps1"
if (Test-Path $setupSrc) {
    Copy-Item $setupSrc $deployDir -Force
}

# 5. examples 目录
Write-Host "  创建 examples/ 目录..." -ForegroundColor Gray
New-Item -ItemType Directory -Path (Join-Path $tempDir "examples") -Force | Out-Null

# 6. 压缩
if (-not $DryRun) {
    Write-Host "  压缩文件..." -ForegroundColor Gray
    try {
        Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal -Force
    } catch {
        # fallback: 使用 7-Zip（如果可用）
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

# 更新 state.json
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
    structure   = "b2b-sdr-template"
}

if (-not $DryRun) {
    $newState | ConvertTo-Json -Depth 10 | Set-Content $statePath -Encoding UTF8
}

# CHANGELOG
Write-Host "📝 更新CHANGELOG..." -ForegroundColor Cyan

$changelogPath = Join-Path $WorkspacePath ".release\CHANGELOG.md"
$changelogHeader = @"
# 更新日志

## [$Version] - $releaseDate

**打包结构**: B2B SDR Template（清爽结构）

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

# 输出结果
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            ✅ 发布完成                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 文件: $zipPath"
Write-Host "📊 大小: $zipSize MB"
Write-Host "📌 版本: $Version"
Write-Host "🏗️  结构: B2B SDR Template（清爽）"
Write-Host ""
Write-Host "📋 变更内容:" -ForegroundColor Yellow
Write-Host "  新增: $($changes.added.Count) 个"
Write-Host "  修改: $($changes.modified.Count) 个"
Write-Host "  删除: $($changes.deleted.Count) 个"
Write-Host ""
Write-Host "📁 打包结构:" -ForegroundColor Cyan
Write-Host "  ├── README.md"
Write-Host "  ├── INSTALL.md"
Write-Host "  ├── QUICK-START.md"
Write-Host "  ├── workspace/  ($skillCount 个技能)"
Write-Host "  ├── skills/     (原始技能目录)"
Write-Host "  ├── deploy/     (安装脚本)"
Write-Host "  └── examples/  (示例配置)"

# Git 提交
Write-Host ""
Write-Host "📝 Git提交..." -ForegroundColor Cyan

if (-not $DryRun) {
    $isGitRepo = Test-Path ".git"

    if ($isGitRepo) {
        git add .
        $commitMsg = "chore: release v$Version (B2B SDR Template)

- 新增: $($changes.added.Count) 个技能
- 修改: $($changes.modified.Count) 个技能
- 删除: $($changes.deleted.Count) 个技能
- 打包结构: 清爽结构"
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
