# =============================================================
# sync-to-github.ps1 - 红龙获客系统本地→GitHub 增量同步脚本
# =============================================================
# 用途：将本地 ~/.workbuddy/skills/ 中红龙系统相关技能同步到 GitHub 仓库
# 用法：cd "C:\Users\Administrator\.workbuddy\skills"; .\release-manager\scripts\sync-to-github.ps1 [-CommitMessage "..."]
#
# v3.3 (2026-04-13) 改进：
#   - P0: 双向同步感知 — fetch 后对比本地/远程提交差异
#   - P0: 分叉检测 — 本地和远程都有新提交时警告用户（而非静默覆盖）
#   - P0: 显示即将被覆盖的远程提交列表（防误删）
#   - P1: 4 种分支状态分别处理（一致/纯远程/纯本地/分叉）
#
# v2.1 (2026-04-11) 修复：
#   - P0: 强制预检（gh auth / 网络连通性）
#   - P1: SKILL.md hash 变化检测，增量同步跳过无变化的技能
#   - P1: git 操作添加 $LASTEXITCODE 错误处理
#   - P1: gh clone 失败自动回退到 git clone
# =============================================================

param(
    [string]$CommitMessage = "sync: update skills from local",
    [string]$RepoOwner = "Wike-CHI",
    [string]$RepoName = "acquisition-agent",
    [string]$Branch = "main",
    [switch]$SkipSubmoduleCheck = $false,
    [switch]$SkipPrereqCheck = $false
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
    "company-research", "market-research", "in-depth-research", "autoresearch", "customer-intelligence", "deep-research", "knowledge-base",
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
    # HOLO 社媒技能簇 (2026-04-13) — cli-anything-hub → image/infographic → gen (依赖链)
    "holo-social-gen", "holo-social-image", "holo-social-infographic", "cli-anything-hub",
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

# --- 预检函数（P1修复） ---
function Test-Prerequisites {
    Write-Status "=== 预检 ==="

    # 1. 检查 gh auth（使用 exit code + 宽松字符串匹配）
    $ghOut = gh auth status 2>&1 | Out-String
    # 去掉 ANSI 颜色码后检测
    $ghClean = $ghOut -replace '\x1b\[[0-9;]*[a-zA-Z]', '' -replace '\s+', ' '
    if ($LASTEXITCODE -ne 0 -or $ghClean -notmatch "Logged" -and $ghClean -notmatch "github") {
        Write-Fail "GitHub 未登录"
        Write-Host "   运行: gh auth login" -ForegroundColor Gray
        return $false
    }
    Write-OK "GitHub 已登录"

    # 2. 检查网络（用 HTTP HEAD 请求，不用 ICMP ping）
    try {
        $resp = Invoke-WebRequest -Uri "https://github.com" -Method HEAD -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-OK "网络正常 (HTTP $($resp.StatusCode))"
    } catch {
        Write-Fail "无法连接 github.com (HTTP)"
        return $false
    }

    return $true
}

# --- 增量变更检测函数（P1修复） ---
# 读取上次同步的技能 hash（存储在 RepoDir/.last-sync-hashes.json）
function Get-LastSyncHashes {
    $hashFile = Join-Path $RepoDir ".last-sync-hashes.json"
    if (Test-Path $hashFile) {
        try {
            return Get-Content $hashFile -Raw | ConvertFrom-Json -AsHashtable
        } catch { }
    }
    return @{}
}

function Save-LastSyncHashes($hashes) {
    $hashFile = Join-Path $RepoDir ".last-sync-hashes.json"
    $hashes | ConvertTo-Json -Depth 3 | Set-Content -Path $hashFile -Encoding UTF8
}

function Test-SkillChanged {
    param([string]$SkillName, [string]$SrcPath)

    $skillFile = Join-Path $SrcPath "SKILL.md"
    if (-not (Test-Path $skillFile)) {
        # 无 SKILL.md，视为变化（可能是新技能或目录结构变化）
        return $true
    }

    try {
        $currentHash = (Get-FileHash $skillFile -Algorithm MD5 -ErrorAction Stop).Hash
        $lastHashes = Get-LastSyncHashes
        $lastHash = $lastHashes[$SkillName]

        if ($null -eq $lastHash) {
            # 新技能或首次同步
            return $true
        }
        return ($currentHash -ne $lastHash)
    } catch {
        # 读取失败，当作变化处理
        return $true
    }
}

function Save-SkillHash {
    param([string]$SkillName, [string]$SrcPath)

    $skillFile = Join-Path $SrcPath "SKILL.md"
    if (-not (Test-Path $skillFile)) { return }

    try {
        $hash = (Get-FileHash $skillFile -Algorithm MD5).Hash
        $lastHashes = Get-LastSyncHashes
        $lastHashes[$SkillName] = $hash
        Save-LastSyncHashes $lastHashes
    } catch { }
}

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
# Step 0: 预检（P1 修复）
# =============================================================
if (-not $SkipPrereqCheck) {
    if (-not (Test-Prerequisites)) {
        Write-Fail "预检失败，退出"
        exit 1
    }
} else {
    Write-Warn "跳过预检（-SkipPrereqCheck）"
}

# =============================================================
# Step 1: Clone 或更新仓库（v3.3: 安全双向同步）
# =============================================================
if (Test-Path $RepoDir) {
    Write-Status "更新已有仓库..."
    Push-Location $RepoDir
    
    # 1) 先 fetch 远程最新状态
    $null = git fetch origin $Branch 2>&1
    if ($LASTEXITCODE -ne 0) { 
        Write-Warn "git fetch 失败，继续..."
        Pop-Location
        # 尝试继续（可能是离线环境）
    } else {
        # 2) 检查是否有远程新提交（本地没有的）
        $localCommit = git rev-parse HEAD 2>&1 | Select-Object -First 1
        $remoteCommit = git rev-parse "origin/$Branch" 2>&1 | Select-Object -First 1
        
        # 比较本地和远程是否一致
        $aheadCount = git rev-list --count "origin/$Branch..HEAD" 2>&1 | Select-Object -First 1
        $behindCount = git rev-list --count "HEAD..origin/$Branch" 2>&1 | Select-Object -First 1
        
        Write-Host "   本地: $($localCommit.Substring(0,7)) (+$aheadCount / -$behindCount)" -ForegroundColor DarkGray
        Write-Host "   远程: $($remoteCommit.Substring(0,7))" -ForegroundColor DarkGray
        
        # 3) 判断分支状态并采取对应策略
        if ($localCommit -eq $remoteCommit) {
            # 完全一致 → 无需操作
            Write-Host "   已是最新" -ForegroundColor DarkGray
        } elseif ($behindCount -gt 0 -and $aheadCount -eq 0) {
            # 只有远程有新提交 → 安全 pull
            Write-Status "拉取远程 $behindCount 个新提交..."
            $null = git reset --hard "origin/$Branch" 2>&1
            if ($LASTEXITCODE -ne 0) { Write-Warn "git reset 失败，继续..." }
            Write-OK "已拉取远程更新"
        } elseif ($behindCount -gt 0 -and $aheadCount -gt 0) {
            # 分叉！两边都有新提交 → 警告用户
            Write-Warn "⚠️ 分支分叉! (本地领先$aheadCount / 远程领先$behindCount)"
            Write-Host "   这意味着有其他设备/网页端推送了内容到 GitHub" -ForegroundColor Yellow
            Write-Host "   默认策略：保留远程变更 + 用本地覆盖（可能丢失远程编辑）" -ForegroundColor DarkGray
            Write-Host "   如需手动合并，请先取消本次同步" -ForegroundColor DarkGray
            
            # 记录将被覆盖的远程提交
            $remoteNewCommits = git log "HEAD..origin/$Branch" --oneline 2>&1
            if ($remoteNewCommits) {
                Write-Host "   即将覆盖的远程提交:" -ForegroundColor Red
                foreach ($c in ($remoteNewCommits -split "`n") | Where-Object { $_.Trim() }) {
                    Write-Host "     ✗ $c" -ForegroundColor Red
                }
            }
            
            # 执行 hard reset（与原逻辑一致）
            $null = git reset --hard "origin/$Branch" 2>&1
            if ($LASTEXITCODE -ne 0) { Write-Warn "git reset 失败，继续..." }
            Write-Warn "已重置到远程最新，本地变更将覆盖上去"
        } elseif ($aheadCount -gt 0 -and $behindCount -eq 0) {
            # 只有本地有新提交（上次 push 失败残留）→ 重置到远程再重新推
            Write-Warn "本地有 $aheadCount 个未推送提交(可能是上次push失败残留)"
            $null = git reset --hard "origin/$Branch" 2>&1
            if ($LASTEXITCODE -ne 0) { Write-Warn "git reset 失败，继续..." }
            Write-Host "   已重置到远程，将用本地技能重新生成提交" -ForegroundColor DarkGray
        }
    }
    
    Pop-Location
} else {
    Write-Status "克隆仓库..."
    $ghResult = & "C:\Program Files\GitHub CLI\gh.exe" repo clone "$RepoOwner/$RepoName" $RepoDir -- --depth=1 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "gh clone 失败，尝试 git clone..."
        git clone --depth=1 "https://github.com/$RepoOwner/$RepoName.git" $RepoDir 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Fail "无法克隆仓库"
            exit 1
        }
    }
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

    # ★ P1 增量检测：跳过无变化的技能
    if (-not (Test-SkillChanged -SkillName $skill -SrcPath $srcPath)) {
        Write-Host "  → 跳过(无变化): $skill" -ForegroundColor DarkGray
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
        Write-OK "$skill"
        $synced++
        # ★ P1：同步成功后保存 hash
        Save-SkillHash -SkillName $skill -SrcPath $srcPath
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
            $null = Fix-SubmoduleReference -RepoRoot $RepoDir -SubmodulePath $path
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
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 1) {
    Write-Fail "git add 失败 (exit: $LASTEXITCODE)"
    Pop-Location
    exit 1
}

# 检查是否有 submodule 修复
$commitSuffix = ""
if (-not $SkipSubmoduleCheck) {
    $submodulesAfter = git ls-files --stage 2>&1 | Where-Object { $_ -match "^160000" }
    if (-not $submodulesAfter -and $submodules) {
        $commitSuffix = " + fix submodule refs"
    }
}

git commit -m "$CommitMessage$commitSuffix" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Fail "git commit 失败 (exit: $LASTEXITCODE)"
    Pop-Location
    exit 1
}

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
