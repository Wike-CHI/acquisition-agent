# init-git.ps1
# 初始化 Git 仓库

param(
    [string]$RemoteUrl = "",
    [string]$Branch = "main",
    [string]$WorkspacePath = ""
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

Set-Location $WorkspacePath

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          🔄 初始化Git仓库              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 工作目录: $WorkspacePath"

# 检查是否已初始化
if (Test-Path ".git") {
    Write-Host ""
    Write-Host "⚠️  Git仓库已存在" -ForegroundColor Yellow

    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "📌 远程仓库: $remote" -ForegroundColor Gray
    }
    exit 0
}

# 创建 .gitignore
Write-Host ""
Write-Host "📝 创建 .gitignore..." -ForegroundColor Cyan

$gitignore = @"
# WorkBuddy
.workbuddy/
*.log

# 敏感配置
.nas_credentials
.email_config
.release/

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

# 初始化 Git
Write-Host "🔄 初始化Git..." -ForegroundColor Cyan
git init -b $Branch

# 添加所有文件
Write-Host "📦 添加文件..." -ForegroundColor Cyan
git add .

# 首次提交
Write-Host "💾 首次提交..." -ForegroundColor Cyan
$commitMsg = @"chore: 初始化红龙获客技能集群

- 红龙小助手人格
- AI获客技能集群
- 发布管理工具

v1.0.0-beta
"@
git commit -m $commitMsg

# 添加远程仓库
if ($RemoteUrl -ne "") {
    Write-Host "🔗 添加远程仓库..." -ForegroundColor Cyan
    git remote add origin $RemoteUrl

    Write-Host ""
    Write-Host "📤 推送到远程（手动执行）:" -ForegroundColor Yellow
    Write-Host "  git push -u origin $Branch"
}

# 创建标签
Write-Host "🏷️ 创建版本标签..." -ForegroundColor Cyan
git tag -a v1.0.0-beta -m "内测版本"

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ Git初始化完成              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 分支: $Branch"
Write-Host "🏷️  标签: v1.0.0-beta"

if ($RemoteUrl -eq "") {
    Write-Host ""
    Write-Host "💡 添加远程仓库:" -ForegroundColor Yellow
    Write-Host "  git remote add origin <your-repo-url>"
    Write-Host "  git push -u origin $Branch --tags"
}
