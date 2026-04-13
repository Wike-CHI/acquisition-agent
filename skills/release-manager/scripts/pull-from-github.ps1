#Requires -Version 5.1
<#
.SYNOPSIS
  从 GitHub 拉取 HOLO 技能最新更新到本地 ~/.workbuddy/skills/
  遵循 release-manager 的协调机制：%TEMP%\acquisition-agent-sync 作为 TEMP 仓库

.DESCRIPTION
  远程 GitHub → TEMP 协调仓库 → 本地 skills 目录（单向拉取）
  - 不破坏协调机制，不直接在本地 skills 执行 git 操作
  - 支持增量拉取，只更新变化的技能目录

.EXAMPLE
  # 拉取全部更新
  .\pull-from-github.ps1

  # 预览模式（显示将要变更的技能，不实际修改）
  .\pull-from-github.ps1 -WhatIf
#>
param(
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/Wike-CHI/acquisition-agent.git"
$TEMP_REPO = "$env:TEMP\acquisition-agent-sync"
$LOCAL_SKILLS = "C:\Users\Administrator\.workbuddy\skills"

function Write-Step($msg) { Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "  ❌ $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   📥 从 GitHub 拉取 HOLO 技能更新        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: 验证 TEMP 协调仓库存在
Write-Step "检查 TEMP 协调仓库..."
if (-not (Test-Path "$TEMP_REPO\.git")) {
    Write-Fail "TEMP 协调仓库不存在: $TEMP_REPO"
    Write-Host "请先运行 sync-to-github.ps1 初始化仓库" -ForegroundColor Yellow
    exit 1
}
Write-Success "TEMP 协调仓库: $TEMP_REPO"
$currentBranch = git -C $TEMP_REPO branch --show-current
Write-Host "  当前分支: $currentBranch" -ForegroundColor Gray

# Step 2: 检查本地 skills 是否有未推送的变更
Write-Step "检查本地 skills 未提交变更..."
$localUnpushed = git -C $LOCAL_SKILLS status --porcelain 2>$null
if ($localUnpushed) {
    Write-Warn "本地 skills 有未提交的变更"
    Write-Host "  拉取会覆盖本地变更，请先运行 sync-to-github.ps1 推送" -ForegroundColor Yellow
    $confirm = Read-Host "强制拉取？(y/N)"
    if ($confirm -ne "y") { exit 0 }
}

# Step 3: Fetch 远程最新
Write-Step "Fetch 远程最新提交..."
git -C $TEMP_REPO fetch origin --quiet 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Fetch 失败，请检查网络和 GitHub 认证"
    exit 1
}

# 获取远程 HEAD
$remoteHead = git -C $TEMP_REPO rev-parse origin/main 2>$null
if (-not $remoteHead) {
    $remoteHead = git -C $TEMP_REPO rev-parse origin/master 2>$null
}
$localHead = git -C $TEMP_REPO rev-parse HEAD 2>$null

Write-Host "  本地 TEMP: $localHead" -ForegroundColor Gray
Write-Host "  远程 TEMP: $remoteHead" -ForegroundColor Gray

# Step 4: 计算差距
$behind = [int](git -C $TEMP_REPO rev-list --count "$localHead..origin/main" 2>$null)
if ($behind -eq 0) {
    $behind = [int](git -C $TEMP_REPO rev-list --count "$localHead..origin/master" 2>$null)
}
if ($behind -eq 0) {
    Write-Success "TEMP 仓库已是最新，无需拉取"
    exit 0
}
Write-Warn "远程领先 $behind 个提交，开始合并..."

# Step 5: 合并到 TEMP 仓库
Write-Step "合并远程更新到 TEMP 仓库..."
if ($WhatIf) {
    $changedFiles = git -C $TEMP_REPO diff --name-only "$localHead..origin/main" 2>$null
    if (-not $changedFiles) {
        $changedFiles = git -C $TEMP_REPO diff --name-only "$localHead..origin/master" 2>$null
    }
    $changedDirs = $changedFiles | ForEach-Object {
        if ($_ -match '^skills/([^/]+)/') { $Matches[1] }
    } | Select-Object -Unique
    Write-Host ""
    Write-Host "  以下技能将被更新（WhatIf 模式，未实际执行）:" -ForegroundColor Yellow
    $changedDirs | ForEach-Object { Write-Host "    ~ skills/$_" -ForegroundColor Yellow }
    exit 0
}

git -C $TEMP_REPO pull origin main --no-edit 2>$null
if ($LASTEXITCODE -ne 0) {
    git -C $TEMP_REPO pull origin master --no-edit 2>$null
}
if ($LASTEXITCODE -ne 0) {
    Write-Warn "自动合并失败，尝试 rebase..."
    git -C $TEMP_REPO pull --rebase origin main --quiet 2>$null
    if ($LASTEXITCODE -ne 0) {
        git -C $TEMP_REPO pull --rebase origin master --quiet 2>$null
    }
}
Write-Success "TEMP 仓库合并完成: $(git -C $TEMP_REPO log --oneline -1)"

# Step 6: 计算变化的技能目录
Write-Step "计算需要更新的技能..."
$localCommit = git -C $TEMP_REPO log --oneline -1
$mergedHead = git -C $TEMP_REPO rev-parse HEAD 2>$null
$changedFiles = git -C $TEMP_REPO diff --name-only "$localHead..$mergedHead" 2>$null
if (-not $changedFiles) {
    $changedFiles = git -C $TEMP_REPO diff --name-only HEAD~1..HEAD 2>$null
}
$changedDirs = $changedFiles | ForEach-Object {
    if ($_ -match '^skills/([^/]+)/') { $Matches[1] }
} | Where-Object { $_ -ne "release-manager" } | Select-Object -Unique

if (-not $changedDirs) {
    Write-Success "无技能需要更新"
    exit 0
}
Write-Host "  将更新 $($changedDirs.Count) 个技能:" -ForegroundColor Cyan
$changedDirs | ForEach-Object { Write-Host "    → skills/$_" -ForegroundColor Gray }

# Step 7: 增量同步到本地 skills（robocopy，遵守白名单）
Write-Step "同步到本地 skills 目录..."
$totalUpdated = 0
foreach ($dir in $changedDirs) {
    $src = Join-Path $TEMP_REPO "skills\$dir"
    $dst = Join-Path $LOCAL_SKILLS $dir
    if (Test-Path $src) {
        # robocopy: /MIR 镜像 /E 子目录 /XF .git 排除 .git
        robocopy $src $dst /MIR /XF ".git" /XD ".git" /NP /NFL /NDL /NC /NS /NL 2>&1 | Out-Null
        if ($LASTEXITCODE -ge 8) {
            Write-Warn "skills/$dir 同步失败 (exit $LASTEXITCODE)"
        } else {
            Write-Host "  ✅ skills/$dir" -ForegroundColor Green
            $totalUpdated++
        }
    }
}

# Step 8: 完成
Write-Host ""
Write-Success "✅ 拉取完成！更新了 $totalUpdated 个技能到本地"
Write-Host ""
Write-Host "💡 如果要推送到其他设备，重新运行:"
Write-Host "   sync-to-github.ps1 -CommitMessage `"chore: sync from GitHub`""
Write-Host ""
