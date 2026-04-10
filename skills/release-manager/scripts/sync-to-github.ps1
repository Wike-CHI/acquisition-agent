# =============================================================
# sync-to-github.ps1 - 红龙获客系统本地→GitHub 增量同步脚本
# =============================================================
# 用途：将本地 ~/.workbuddy/skills/ 中红龙系统相关技能同步到 GitHub 仓库
# 用法：.\scripts\sync-to-github.ps1 [-CommitMessage "自定义提交信息"]
#
# v2.0 新增：
#   - Submodule 检测与自动修复
#   - 嵌套 .git 目录清理
#   - GCA 内部 skills/ 子目录排除（避免重复）
#   - 同步后自动检查 submodule 引用
# =============================================================

param(
    [string]$CommitMessage = "sync: update skills from local",
    [string]$RepoOwner = "Wike-CHI",
    [string]$RepoName = "acquisition-agent",
    [string]$Branch = "main",
    [switch]$SkipSubmoduleCheck = $false
)

$ErrorActionPreference = "Continue"

# --- 配置 ---
$LocalSkillsDir = Join-Path $env:USERPROFILE ".workbuddy\skills"
$RepoDir = Join-Path $env:TEMP "acquisition-agent-sync"

# 红龙获客系统保留的技能清单
$RetainedSkills = @(
    # 主入口
    "global-customer-acquisition",
    "understand-honglong-acquisition",
    # 编排层
    "acquisition-coordinator", "acquisition-evaluator", "acquisition-init", "acquisition-workflow",
    # 发现层
    "linkedin", "facebook-acquisition", "instagram-acquisition", "teyi-customs", "scrape", "scrapling",
    # 情报层
    "company-research", "market-research", "in-depth-research", "autoresearch", "customer-intelligence", "deep-research",
    # 触达层
    "email-sender", "email-marketing", "cold-email-generator", "linkedin-writer", "email-outreach-ops", "delivery-queue",
    # 支持层
    "customer-deduplication", "sales-pipeline-tracker", "crm", "fumamx-crm", "credential-manager",
    # 人格/产品层
    "honglong-assistant", "honglong-products",
    # 文档层
    "document-pro", "nano-pdf", "pdf-extract", "pdf-smart-tool-cn", "excel-xlsx", "office",
    # 人性化
    "humanize-ai-text", "humanizer", "sdr-humanizer",
    # 搜索层
    "brave-web-search", "exa-search", "exa-web-search-free", "tavily-search", "multi-search-engine", "web-content-fetcher",
    # 浏览器
    "browser-automation", "playwright", "agent-browser", "desktop-control",
    # 社媒
    "ai-social-media-content", "xiaohongshu",
    # 记忆
    "smart-memory", "humanoid-memory", "memory-hygiene", "memory-tiering", "memory-manager",
    # 工具
    "nas-file-reader", "daily-report-writer", "calendar-skill", "GitHub热门项目",
    "data-automation-service", "release-manager", "sales", "business-development",
    "smart-quote",
    "proactive-agent", "proactive-agent-lite",
    # 基础设施
    "acp", "skill-creator", "find-skills", "skill-discovery", "skill-finder-cn", "evolver",
    "agent-reach-setup",
    # 邮件
    "agentmail", "gog",
    # 新增技能（2026-04-10）
    "email-inbox", "holo-activity-log",
    # 中文目录
    "浏览器自动化", "内容分发", "去AI味", "QQ邮箱", "MCP管理器"
)

# 排除的子目录（同步时跳过）
$ExcludeDirs = @("node_modules", ".git", "coverage", "__pycache__", "test-output", ".serena", "release", "dist", "dist-full")
$ExcludeFiles = @("*.pyc", "*.pyo", ".env", "package-lock.json")

# --- 辅助函数 ---
function Write-Status($msg) { Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $msg" -ForegroundColor Cyan }
function Write-OK($msg) { Write-Host "  OK $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  WARN $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "  FAIL $msg" -ForegroundColor Red }

# =============================================================
# Step 0: 检查嵌套 .git 目录（Submodule 预防）
# =============================================================
function Find-NestedGitDirs {
    param([string]$Root)
    $nested = @()
    Get-ChildItem $Root -Recurse -Directory -Filter ".git" -ErrorAction SilentlyContinue | ForEach-Object {
        $relPath = $_.FullName.Replace("$Root\", "")
        if ($relPath -notmatch "^(.git|\.git\\)") {
            $nested += $relPath
        }
    }
    return $nested
}

function Fix-SubmoduleReference {
    param([string]$RepoRoot, [string]$SubmodulePath)

    Write-Warn "发现 submodule 引用: $SubmodulePath"
    Write-Status "修复中..."

    # 1. 从 git index 删除 submodule 引用
    Push-Location $RepoRoot
    git rm --cached $SubmodulePath 2>&1 | Out-Null

    # 2. 确保 .git 目录已删除
    $gitDir = Join-Path $RepoRoot ($SubmodulePath -replace "/", "\")
    if (Test-Path "$gitDir\.git") {
        Remove-Item "$gitDir\.git" -Recurse -Force
    }

    # 3. 重新 add 为普通目录
    git add $SubmodulePath 2>&1 | Out-Null

    # 4. 验证
    $mode = git ls-files --stage $SubmodulePath 2>&1 | Select-Object -First 1
    if ($mode -match "^160000") {
        Write-Fail "修复失败: 仍是 submodule 引用"
        Pop-Location
        return $false
    } else {
        Write-OK "已修复为普通文件: $SubmodulePath"
        Pop-Location
        return $true
    }
}

# --- 主流程 ---
Write-Status "=== 红龙获客系统 同步到 GitHub ==="
Write-Status "本地技能目录: $LocalSkillsDir"

# =============================================================
# Step 1: Clone 或更新仓库
# =============================================================
if (Test-Path $RepoDir) {
    Write-Status "更新已有仓库..."
    Push-Location $RepoDir
    $null = git fetch origin $Branch 2>&1
    $null = git reset --hard "origin/$Branch" 2>&1
    Pop-Location
} else {
    Write-Status "克隆仓库..."
    & "C:\Program Files\GitHub CLI\gh.exe" repo clone "$RepoOwner/$RepoName" $RepoDir -- --depth=1 2>&1 | Out-Null
}

if (-not (Test-Path $RepoDir)) {
    Write-Fail "无法获取仓库"
    exit 1
}

$RepoSkillsDir = Join-Path $RepoDir "skills"
if (-not (Test-Path $RepoSkillsDir)) {
    New-Item -ItemType Directory -Path $RepoSkillsDir -Force | Out-Null
}

# =============================================================
# Step 2: 同步技能（增量 robocopy）
# =============================================================
Write-Status "同步技能..."
$synced = 0
$skipped = 0
$failed = 0

foreach ($skill in $RetainedSkills) {
    $srcPath = Join-Path $LocalSkillsDir $skill
    $dstPath = Join-Path $RepoSkillsDir $skill

    if (-not (Test-Path $srcPath)) {
        Write-Warn "本地不存在: $skill"
        $skipped++
        continue
    }

    # 清空目标（避免残留）
    if (Test-Path $dstPath) {
        Remove-Item $dstPath -Recurse -Force
    }

    # robocopy 排除规则
    $xdArgs = $ExcludeDirs | ForEach-Object { "/XD", $_ }
    $xfArgs = $ExcludeFiles | ForEach-Object { "/XF", $_ }

    # 额外排除：GCA 内部的 skills/ 子目录（避免重复其他技能）
    $extraXdArgs = @()
    if ($skill -eq "global-customer-acquisition") {
        $extraXdArgs = @("/XD", "skills")
    }

    $result = robocopy $srcPath $dstPath /E /PURGE @xdArgs @xfArgs @extraXdArgs /NFL /NDL /NJH /NJS /NC /NS /NP 2>&1
    $exitCode = $LASTEXITCODE

    if ($exitCode -le 7) {
        if ($exitCode -gt 0) {
            Write-OK "$skill"
            $synced++
        }
    } else {
        Write-Fail "$skill (exit: $exitCode)"
        $failed++
    }
}

Write-Status "同步: 更新 $synced / 跳过 $skipped / 失败 $failed"

# =============================================================
# Step 3: Submodule 检测与修复
# =============================================================
if (-not $SkipSubmoduleCheck) {
    Write-Status "检查 submodule 引用..."
    Push-Location $RepoDir

    $submodules = git ls-files --stage 2>&1 | Where-Object { $_ -match "^160000" }
    if ($submodules) {
        Write-Warn "发现 $($submodules.Count) 个 submodule 引用!"
        foreach ($sm in $submodules) {
            $path = ($sm -split "`t")[-1]
            Fix-SubmoduleReference -RepoRoot $RepoDir -SubmodulePath $path
        }
    } else {
        Write-OK "无 submodule 引用"
    }

    # 检查嵌套 .git 目录
    $nested = Find-NestedGitDirs -Root $RepoDir
    if ($nested.Count -gt 0) {
        Write-Warn "发现 $($nested.Count) 个嵌套 .git 目录:"
        foreach ($n in $nested) {
            Write-Warn "  $n"
            Remove-Item (Join-Path $RepoDir ($n -replace "/", "\")) -Recurse -Force
        }
        Write-OK "已清理嵌套 .git 目录"
        git add -A 2>&1 | Out-Null
    }

    Pop-Location
}

# =============================================================
# Step 4: 检查变化并提交
# =============================================================
Push-Location $RepoDir
$changes = git status --porcelain 2>&1

if (-not $changes) {
    Write-Status "没有变化，无需提交"
    Pop-Location
    exit 0
}

$changeCount = ($changes | Measure-Object).Count
Write-Status "$changeCount 个文件有变化，提交中..."

git add -A 2>&1 | Out-Null

# 检查是否有 submodule 修复
$commitSuffix = ""
if (-not $SkipSubmoduleCheck) {
    $submodulesAfter = git ls-files --stage 2>&1 | Where-Object { $_ -match "^160000" }
    if (-not $submodulesAfter -and $submodules) {
        $commitSuffix = " + fix submodule refs"
    }
}

git commit -m "$CommitMessage$commitSuffix" 2>&1 | Out-Null

# 统计
$fileCount = (Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch '\\.git\\' }).Count
$size = [math]::Round(((Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch '\\.git\\' } | Measure-Object -Property Length -Sum).Sum / 1MB), 1)

git push origin $Branch 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-OK "推送成功! ($fileCount files, ${size}MB)"
} else {
    Write-Fail "推送失败 (exit: $LASTEXITCODE)"
}

Pop-Location
Write-Status "=== 同步完成 ==="
