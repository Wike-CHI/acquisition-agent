# init-git.ps1
# 初始化 Git 仓库

param(
    [string]$RemoteUrl = "",
    [string]$Branch = "main",
    [string]$WorkspacePath = ""
)

$ErrorActionPreference = "Stop"

# 路径解析
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

Set-Location $WorkspacePath

Write-Host ""
Write-Host "=== Git Init ===" -ForegroundColor Cyan
Write-Host "Workspace: $WorkspacePath"

# 检查是否已初始化
if (Test-Path ".git") {
    Write-Host "[SKIP] Git repo already exists" -ForegroundColor Yellow
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "Remote: $remote"
    }
    exit 0
}

# 创建 .gitignore
$gitignore = @"
# WorkBuddy
.workbuddy/
*.log

# 敏感配置
.release/
.nas_credentials
.email_config

# 临时文件
*.tmp
*.temp
*.bak

# 打包文件
releases/*.zip

# IDE
.idea/
.vscode/
*.swp

# Node
node_modules/

# Python
__pycache__/
*.pyc
.venv/

# 系统文件
.DS_Store
Thumbs.db
"@

$gitignore | Set-Content ".gitignore" -Encoding UTF8

# 初始化
git init -b $Branch
Write-Host "[OK] git init done"

git add .
Write-Host "[OK] git add . done"

git commit -m "chore: init honglong acquisition workspace v1.0.0"
Write-Host "[OK] first commit done"

# 远程仓库
if ($RemoteUrl -ne "") {
    git remote add origin $RemoteUrl
    Write-Host "[OK] Remote added: $RemoteUrl"
    Write-Host "Push: git push -u origin $Branch --tags"
} else {
    Write-Host ""
    Write-Host "TIP: Add remote with:"
    Write-Host "  git remote add origin <url>"
    Write-Host "  git push -u origin $Branch --tags"
}

# 标签
git tag -a v1.0.0 -m "Initial release"
Write-Host "[OK] Tag v1.0.0 created"

Write-Host ""
Write-Host "=== Git Init Complete ===" -ForegroundColor Green
