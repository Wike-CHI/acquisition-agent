# =============================================================
# sync-to-github.ps1 - 红龙获客系统本地→GitHub 增量同步脚本
# =============================================================
# 用途：将本地 ~/.workbuddy/skills/ 中红龙系统相关技能同步到 GitHub 仓库
# 用法：.\scripts\sync-to-github.ps1 [-CommitMessage "自定义提交信息"]
# =============================================================

param(
    [string]$CommitMessage = "sync: update skills from local",
    [string]$RepoOwner = "Wike-CHI",
    [string]$RepoName = "acquisition-agent",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

# --- 配置 ---
$LocalSkillsDir = Join-Path $env:USERPROFILE ".workbuddy\skills"
$RepoDir = Join-Path $env:TEMP "acquisition-agent-sync"

# 红龙获客系统保留的技能清单
$RetainedSkills = @(
    # 主入口
    "global-customer-acquisition",
    "understand-honglong-acquisition",
    # 编排层
    "acquisition-coordinator", "acquisition-evaluator", "acquisition-init", "acquisition-workflow", "market-development-report",
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
    "proactive-agent", "proactive-agent-lite",
    # 基础设施
    "acp", "skill-creator", "find-skills", "skill-discovery", "skill-finder-cn", "evolver",
    "agent-reach-setup",
    # 邮件
    "agentmail", "gog", "163-email-sender",
    # 中文目录
    "浏览器自动化", "内容分发", "去AI味", "QQ邮箱", "MCP管理器"
)

# 排除的子目录（同步时跳过）
$ExcludeDirs = @("node_modules", ".git", "coverage", "__pycache__", "test-output", ".serena")
$ExcludeFiles = @("*.pyc", "*.pyo", ".env")

# --- 辅助函数 ---
function Write-Status($msg) { Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $msg" -ForegroundColor Cyan }
function Write-OK($msg) { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "  ❌ $msg" -ForegroundColor Red }

# --- 主流程 ---
Write-Status "=== 红龙获客系统 同步到 GitHub ==="
Write-Status "本地技能目录: $LocalSkillsDir"

# 1. Clone 或更新仓库
if (Test-Path $RepoDir) {
    Write-Status "更新已有仓库..."
    Push-Location $RepoDir
    git fetch origin $Branch 2>&1 | Out-Null
    git reset --hard "origin/$Branch" 2>&1 | Out-Null
    Pop-Location
} else {
    Write-Status "克隆仓库..."
    $env:GH_TOKEN = $env:GH_TOKEN # 需要 GH_TOKEN 环境变量
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

# 2. 同步技能
$synced = 0
$skipped = 0
$failed = 0

foreach ($skill in $RetainedSkills) {
    $srcPath = Join-Path $LocalSkillsDir $skill
    $dstPath = Join-Path $RepoSkillsDir $skill

    if (-not (Test-Path $srcPath)) {
        Write-Warn "本地不存在: $skill（跳过）"
        $skipped++
        continue
    }

    # 清空目标
    if (Test-Path $dstPath) {
        Remove-Item $dstPath -Recurse -Force
    }

    # robocopy 排除规则
    $xdArgs = $ExcludeDirs | ForEach-Object { "/XD", $_ }
    $xfArgs = $ExcludeFiles | ForEach-Object { "/XF", $_ }

    $result = robocopy $srcPath $dstPath /E /PURGE @xdArgs @xfArgs /NFL /NDL /NJH /NJS /NC /NS /NP 2>&1
    $exitCode = $LASTEXITCODE

    # robocopy 返回码: 0=无变化, 1=复制成功, 2=额外文件, 3=有变化, 7+ 有错误
    if ($exitCode -le 7) {
        if ($exitCode -eq 0) {
            # 无变化
        } else {
            Write-OK "$skill（已更新）"
            $synced++
        }
    } else {
        Write-Fail "$skill（错误码: $exitCode）"
        $failed++
    }
}

Write-Status "同步结果: 更新 $synced / 跳过 $skipped / 失败 $failed"

# 3. 检查是否有变化
Push-Location $RepoDir
$changes = git status --porcelain 2>&1

if (-not $changes) {
    Write-Status "没有变化，无需提交"
    Pop-Location
    exit 0
}

# 4. 提交并推送
Write-Status "提交变更..."
git add -A 2>&1 | Out-Null
git commit -m $CommitMessage 2>&1 | Out-Null
git push origin $Branch 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-OK "推送成功！"
} else {
    Write-Fail "推送失败"
}

Pop-Location
Write-Status "=== 同步完成 ==="
