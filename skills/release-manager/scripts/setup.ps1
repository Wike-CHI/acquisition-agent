# setup.ps1
# 交互式安装向导

param(
    [switch]$Silent = $false
)

$ErrorActionPreference = "Stop"

# 颜色函数
function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success { param([string]$Message); Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error   { param([string]$Message); Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param([string]$Message); Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info    { param([string]$Message); Write-Host "ℹ️  $Message" -ForegroundColor Blue }

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

# 欢迎界面
Clear-Host
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║        🚀 红龙获客系统 - 安装向导                        ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║        HONGLONG Acquisition Agent Setup Wizard            ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if (-not $Silent) {
    Write-Host "这个向导将帮助你："
    Write-Host "  1. 检查系统环境"
    Write-Host "  2. 配置7层上下文"
    Write-Host "  3. 配置获客渠道"
    Write-Host "  4. 验证安装"
    Write-Host ""
    Read-Host "按 Enter 继续..."
}

# Step 1: 检查环境
Write-Step "Step 1: 检查系统环境"

# 检查 WorkBuddy
$wbPath = "$env:USERPROFILE\.workbuddy"
if (Test-Path $wbPath) {
    Write-Success "WorkBuddy 已安装: $wbPath"
} else {
    Write-Error "WorkBuddy 未安装"
    Write-Info "请先安装 WorkBuddy: https://workbuddy.dev"
    exit 1
}

# 检查 Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js 已安装: $nodeVersion"
} catch {
    Write-Error "Node.js 未安装"
    Write-Info "请安装 Node.js 18+"
    exit 1
}

# 检查 Git
try {
    $gitVersion = git --version
    Write-Success "Git 已安装: $gitVersion"
} catch {
    Write-Warning "Git 未安装（可选）"
}

# Step 2: 选择安装位置
Write-Step "Step 2: 选择安装位置"

$defaultWorkspace = "$env:USERPROFILE\.workbuddy\workspace"

if (-not $Silent) {
    Write-Host "默认位置: $defaultWorkspace"
    $customPath = Read-Host "按 Enter 使用默认位置，或输入自定义路径"

    if ($customPath -ne "") {
        $WorkspacePath = $customPath
    }
}

Write-Info "安装位置: $WorkspacePath"

if (-not (Test-Path $WorkspacePath)) {
    New-Item -ItemType Directory -Path $WorkspacePath -Force | Out-Null
    Write-Success "创建目录: $WorkspacePath"
}

# Step 3: 复制文件
Write-Step "Step 3: 复制文件"

Write-Host "复制7层上下文..." -ForegroundColor Gray
$contextFiles = @("AGENTS.md", "HEARTBEAT.md", "IDENTITY.md", "MEMORY.md", "SOUL.md", "TOOLS.md", "USER.md", "BOOTSTRAP.md")

foreach ($file in $contextFiles) {
    $srcPath = Join-Path $skillRoot $file
    $destPath = Join-Path $WorkspacePath $file

    if (Test-Path $srcPath) {
        Copy-Item $srcPath $destPath -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

Write-Host "复制技能..." -ForegroundColor Gray
$skillsSrc = Join-Path $skillRoot "skills"
$skillsDest = Join-Path $WorkspacePath "skills"

if (Test-Path $skillsSrc) {
    if (-not (Test-Path $skillsDest)) {
        New-Item -ItemType Directory -Path $skillsDest -Force | Out-Null
    }
    Copy-Item -Path "$skillsSrc\*" -Destination $skillsDest -Recurse -Force
    Write-Success "复制技能完成"
}

# Step 4: 配置7层上下文
Write-Step "Step 4: 配置7层上下文（可选）"

if (-not $Silent) {
    Write-Host "是否现在配置公司信息？(直接回车跳过)" -ForegroundColor Yellow
    Write-Host ""

    $configureNow = Read-Host "是否配置？(Y/n)"

    if ($configureNow -ne "n" -and $configureNow -ne "N") {
        # IDENTITY.md
        Write-Host ""
        Write-Host "━━━ 配置 IDENTITY.md ━━━" -ForegroundColor Yellow

        $companyName = Read-Host "公司全称（默认：温州红龙工业设备制造有限公司）"
        if ($companyName -eq "") { $companyName = "温州红龙工业设备制造有限公司" }

        $brand = Read-Host "品牌名（默认：HOLO）"
        if ($brand -eq "") { $brand = "HOLO" }

        $phone = Read-Host "联系电话（默认：0577-66856856）"
        if ($phone -eq "") { $phone = "0577-66856856" }

        $email = Read-Host "公司邮箱（默认：sale@18816.cn）"
        if ($email -eq "") { $email = "sale@18816.cn" }

        $identityContent = @"
# IDENTITY.md — 公司身份

## 🏢 公司信息

| 项目 | 内容 |
|------|------|
| **公司全称** | $companyName |
| **品牌** | $brand |
| **行业** | 工业皮带设备制造 |
| **目标市场** | 全球（重点：东南亚、中东、非洲、拉美、欧美） |
| **联系方式** | 电话：$phone / 邮箱：$email |

## 💪 核心竞争力

| 优势 | 说明 |
|------|------|
| **20年行业经验** | 技术成熟稳定 |
| **7大产品线** | 覆盖输送带设备全流程 |
| **交期优势** | 标准产品7-15天 |
| **价格优势** | 比欧美品牌便宜50%+ |

---

_版本: 1.0.0_
_更新: $(Get-Date -Format "yyyy-MM-dd")_
"@

        $identityContent | Set-Content (Join-Path $WorkspacePath "IDENTITY.md") -Encoding UTF8
        Write-Success "IDENTITY.md 已更新"

        # USER.md
        Write-Host ""
        Write-Host "━━━ 配置 USER.md ━━━" -ForegroundColor Yellow

        $ownerName = Read-Host "负责人姓名"
        if ($ownerName -eq "") { $ownerName = "Wike" }

        $ownerPhone = Read-Host "手机号（从 .env 的 HONGLONG_PHONE 读取，直接回车跳过）"
        if ($ownerPhone -eq "") { $ownerPhone = $env:HONGLONG_PHONE }

        $ownerEmail = Read-Host "邮箱（从 .env 的 HONGLONG_EMAIL 读取，直接回车跳过）"
        if ($ownerEmail -eq "") { $ownerEmail = $env:HONGLONG_EMAIL }

        $userContent = @"
# USER.md - 负责人画像

## 👤 基本信息

- **姓名**: $ownerName
- **职位**: AI应用工程师
- **公司**: 温州红龙工业设备制造有限公司
- **时区**: Asia/Shanghai

## 📞 联系方式

| 渠道 | 账号 |
|------|------|
| **手机** | $ownerPhone |
| **WhatsApp** | $ownerPhone |
| **邮箱** | $ownerEmail |

---

_更新时间: $(Get-Date -Format "yyyy-MM-dd")_
"@

        $userContent | Set-Content (Join-Path $WorkspacePath "USER.md") -Encoding UTF8
        Write-Success "USER.md 已更新"
    }
}

# Step 5: 渠道配置（可选）
Write-Step "Step 5: 配置获客渠道（可选）"

if (-not $Silent) {
    Write-Host "可配置渠道：Email(SMTP)、WhatsApp、LinkedIn"
    Write-Host ""

    $configureChannels = Read-Host "是否现在配置渠道？(y/N)"

    if ($configureChannels -eq "y" -or $configureChannels -eq "Y") {
        Write-Host ""
        Write-Host "━━━ 配置 Email ━━━" -ForegroundColor Yellow

        $smtpServer = Read-Host "SMTP服务器（默认：smtp.163.com:465）"
        if ($smtpServer -eq "") { $smtpServer = "smtp.163.com:465" }

        Write-Host ""
        Write-Host "💡 邮箱配置说明:" -ForegroundColor Blue
        Write-Host "  163邮箱需要使用'授权码'而非登录密码"
        Write-Host "  获取方式：163邮箱 → 设置 → POP3/SMTP → 开启 → 获取授权码"
    }
}

# Step 6: 验证安装
Write-Step "Step 6: 验证安装"

$allChecksPass = $true

$requiredFiles = @("AGENTS.md", "HEARTBEAT.md", "IDENTITY.md", "MEMORY.md", "SOUL.md", "TOOLS.md", "USER.md")

Write-Host "检查7层上下文..."
foreach ($file in $requiredFiles) {
    $fPath = Join-Path $WorkspacePath $file
    if (Test-Path $fPath) {
        Write-Host "  ✓ $file" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ $file (缺失)" -ForegroundColor Red
        $allChecksPass = $false
    }
}

Write-Host "检查技能..."
$skillsPath = Join-Path $WorkspacePath "skills"
if (Test-Path $skillsPath) {
    $skillCount = (Get-ChildItem $skillsPath -Directory -ErrorAction SilentlyContinue).Count
    Write-Host "  ✓ 技能数量: $skillCount" -ForegroundColor Gray
} else {
    Write-Host "  ✗ skills/ 目录缺失" -ForegroundColor Red
    $allChecksPass = $false
}

# Step 7: 完成
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║               ✅ 安装完成！                              ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if ($allChecksPass) {
    Write-Success "所有检查通过"
} else {
    Write-Warning "部分检查未通过，请手动验证"
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  下一步" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 重启 WorkBuddy："
Write-Host "   workbuddy restart" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 测试系统："
Write-Host "   帮我找5个美国的输送带制造商" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 发布新版本："
Write-Host "   .\scripts\release.ps1" -ForegroundColor Gray

if (-not $Silent) {
    Read-Host "按 Enter 完成..."
}
