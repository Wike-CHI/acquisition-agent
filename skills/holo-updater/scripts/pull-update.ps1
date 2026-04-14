# =============================================================
# HOLO-AGENT 更新脚本 - 从 GitHub 拉取最新版本 (Windows)
# 版本: 1.0.0 | 适用于 Windows PowerShell
# 用法: .\pull-update.ps1 [-CheckOnly] [-Force]
# =============================================================

param(
    [switch]$CheckOnly,
    [switch]$Force
)

$ErrorActionPreference = "Continue"

$REPO_OWNER = "Wike-CHI"
$REPO_NAME = "acquisition-agent"
$BRANCH = "main"
$SKILLS_DIR = "$env:USERPROFILE\.hermes\skills\acquisition"
$REPO_DIR = "$env:TEMP\acquisition-agent-update"
$BACKUP_DIR = "$SKILLS_DIR\.backup"

function Write-Log  { param($msg) Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $msg" }
function Write-Ok    { param($msg) Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  WARN  $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "  FAIL  $msg" -ForegroundColor Red }

# --- 预检 ---
Write-Host ""
Write-Host "============================================================"
Write-Host "  HOLO-AGENT · 更新检查"
Write-Host "============================================================"
Write-Host ""

Write-Log "检查网络连通性..."
try {
    $null = curl -Uri "https://github.com" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Ok "github.com 可达"
} catch {
    Write-Fail "无法连接 github.com，请检查网络"
    exit 1
}

Write-Log "检查 git..."
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Fail "git 未安装"
    exit 1
}
Write-Ok "git $($gitCmd.Version)"
Write-Log "git 路径: $($gitCmd.Source)"

# --- Clone 或 Update ---
if (Test-Path "$REPO_DIR\.git") {
    Write-Log "更新已有仓库..."
    Push-Location $REPO_DIR
    git fetch origin $BRANCH 2>&1 | Out-Null
    Pop-Location
} else {
    Write-Log "克隆仓库 (shallow)..."
    git clone --depth=1 "https://github.com/$REPO_OWNER/$REPO_NAME.git" $REPO_DIR 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "clone 失败"
        exit 1
    }
    Write-Ok "克隆完成"
}

# --- 版本信息 ---
Push-Location $REPO_DIR
$LOCAL_COMMIT = git rev-parse HEAD 2>$null | Select-Object -First 1
$REMOTE_COMMIT = git rev-parse "origin/$BRANCH" 2>$null | Select-Object -First 1
$BEHIND = [int](git rev-list --count "origin/$BRANCH..HEAD" 2>$null)
$AHEAD = [int](git rev-list --count "HEAD..origin/$BRANCH" 2>$null)
Pop-Location

Write-Host ""
Write-Host "  仓库:     $REPO_OWNER/$REPO_NAME"
Write-Host "  分支:     $BRANCH"
Write-Host "  本地:     $($LOCAL_COMMIT?.Substring(0, [Math]::Min(8, $LOCAL_COMMIT?.Length)))"
Write-Host "  远程:     $($REMOTE_COMMIT?.Substring(0, [Math]::Min(8, $REMOTE_COMMIT?.Length)))"
Write-Host "  状态:     $BEHIND 落后 | $AHEAD 领先"

if ($BEHIND -eq 0 -and $AHEAD -eq 0) {
    Write-Host ""
    Write-Ok "已是最新版本"
    exit 0
}

if ($BEHIND -gt 0) {
    Write-Warn "本地领先远程 $BEHIND 个提交（你有未推送的更改）"
}

if ($AHEAD -gt 0) {
    Write-Host ""
    Write-Ok "发现远程有新版本 (领先 $AHEAD 个提交)"
}

if ($CheckOnly) {
    Write-Log "使用 -CheckOnly，仅检查不更新"
    exit 0
}

# --- 变更预览 ---
Write-Log "变更文件预览:"
Push-Location $REPO_DIR
git diff --stat HEAD "origin/$BRANCH" 2>$null | Select-Object -Last 10
Pop-Location

# --- 备份 ---
Write-Log "备份当前版本到 $BACKUP_DIR..."
$TS = Get-Date -Format "yyyyMMdd-HHmmss"
$BACKUP_PATH = "$BACKUP_DIR\$TS"
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $BACKUP_PATH | Out-Null

if (-not $Force) {
    Write-Host -NoNewline "  确认备份当前 skills/ 到 $BACKUP_PATH ? (Y/n): "
    $answer = Read-Host
    if ($answer -ne 'Y' -and $answer -ne 'y' -and $answer -ne '') {
        Write-Warn "已取消更新"
        exit 0
    }
}

Copy-Item -Path "$SKILLS_DIR\*" -Destination $BACKUP_PATH -Recurse -Force -ErrorAction SilentlyContinue
Write-Ok "备份完成: $BACKUP_PATH"

# 清理旧备份（保留最近5个）
$oldBackups = Get-ChildItem -Path $BACKUP_DIR -Directory | Sort-Object LastWriteTime -Descending | Select-Object -Skip 5
foreach ($old in $oldBackups) {
    Remove-Item -Path $old.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

# --- 执行更新 ---
Write-Log "执行更新..."

# robocopy 比 Copy-Item 更适合大目录增量同步
$robocopyArgs = @(
    $REPO_DIR, $SKILLS_DIR,
    "/E",        # 复制子目录包括空目录
    "/PURGE",    # 删除源中不存在的文件
    "/MT:8",     # 多线程
    "/XD", ".git", ".backup", "node_modules", "__pycache__", "acquisition.bak.*", ".archive"
)

$robocopyResult = robocopy @robocopyArgs 2>&1
Write-Ok "同步完成"

# --- 验证 ---
Write-Log "验证更新..."
$PASS = 0
$FAIL = 0

$criticalFiles = @(
    "SKILLS-MANIFEST.yaml",
    "acquisition-workflow\references\ROUTING-TABLE.yaml",
    "global-customer-acquisition\SKILL.md",
    "acquisition-dependencies\SKILL.md",
    "acquisition-init\SKILL.md",
    "holo-updater\SKILL.md"
)

foreach ($f in $criticalFiles) {
    if (Test-Path "$SKILLS_DIR\$f") {
        Write-Ok "$f"
        $PASS++
    } else {
        Write-Fail "缺失: $f"
        $FAIL++
    }
}

# YAML 合法性
if (Get-Command python -ErrorAction SilentlyContinue) {
    foreach ($yamlFile in @("SKILLS-MANIFEST.yaml", "acquisition-workflow\references\ROUTING-TABLE.yaml")) {
        $fullPath = "$SKILLS_DIR\$yamlFile"
        if (Test-Path $fullPath) {
            try {
                python -c "import yaml; yaml.safe_load(open(r'$fullPath'))" 2>$null | Out-Null
                if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
                    Write-Ok "YAML合法: $(Split-Path $yamlFile -Leaf)"
                } else { throw "fail" }
            } catch {
                Write-Fail "YAML格式错误: $(Split-Path $yamlFile -Leaf)"
                $FAIL++
            }
        }
    }
}

# --- 结果 ---
Write-Host ""
Write-Host "============================================================"
Write-Host "  更新报告"
Write-Host "============================================================"
Write-Host ""
Write-Host "  仓库:     $REPO_OWNER/$REPO_NAME"
Write-Host "  分支:     $BRANCH"
Write-Host "  旧版本:   $($LOCAL_COMMIT?.Substring(0, [Math]::Min(8, $LOCAL_COMMIT?.Length)))"
Write-Host "  新版本:   $($REMOTE_COMMIT?.Substring(0, [Math]::Min(8, $REMOTE_COMMIT?.Length)))"
Write-Host "  备份:     $BACKUP_PATH"
Write-Host ""
Write-Host "  验证:     $PASS 通过 | $FAIL 失败"
Write-Host ""

if ($FAIL -eq 0) {
    Write-Ok "更新成功！"
    Write-Host ""
    Write-Host "  输入任意命令开始使用，如："
    Write-Host "    帮我找10个巴西的工业皮带分销商"
} else {
    Write-Fail "更新完成但有 $FAIL 项验证失败，请检查"
}

Write-Host ""
Write-Host "============================================================"
