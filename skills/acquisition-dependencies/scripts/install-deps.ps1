# =============================================================
# 红龙获客系统 · 依赖安装脚本 (Windows PowerShell)
# 版本: 2.0.0 | 自动检测系统环境
# 用法: .\install-deps.ps1
# 或:   irm https://... | iex  (远程安装)
# =============================================================

$ErrorActionPreference = "Continue"

function Write-Log  { param($msg) Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $msg" }
function Write-Ok    { param($msg) Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  WARN  $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "  FAIL  $msg" -ForegroundColor Red }

# --- 环境检测 ---
Write-Host ""
Write-Host "============================================================"
Write-Host "  红龙获客系统 · 依赖安装 v2.0 (Windows)"
Write-Host "============================================================"
Write-Host ""

$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

Write-Log "系统检测:"
Write-Log "  OS: $([System.Environment]::OSVersion.VersionString)"
Write-Log "  PowerShell: $($PSVersionTable.PSVersion)"
Write-Log "  管理员: $($IsAdmin)"
Write-Log "  Node: $((Get-Command node -ErrorAction SilentlyContinue).Version)"
Write-Log "  Python: $((Get-Command python -ErrorAction SilentlyContinue).Version)"
Write-Log "  pip: $((Get-Command pip -ErrorAction SilentlyContinue).Version)"
Write-Log "  npm: $((Get-Command npm -ErrorAction SilentlyContinue).Version)"
Write-Host ""

# --- 安装 Python 依赖 ---
function Install-PythonDeps {
    Write-Log "安装 Python 依赖..."

    # 确保 pip 可用
    $pipCmd = Get-Command pip -ErrorAction SilentlyContinue
    if (-not $pipCmd) {
        $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
        if ($pythonCmd) {
            Write-Log "  pip 未找到，尝试用 python -m pip"
            & python -m pip --version 2>$null | Out-Null
        }
    }

    $pkgs = @("openpyxl", "python-docx", "PyYAML", "Pillow", "requests", "regex", "lxml")
    foreach ($pkg in $pkgs) {
        $mod = $pkg -replace "python-", "" -replace "-", "_"
        if ($pkg -eq "Pillow") { $mod = "PIL" }
        if ($pkg -eq "python-docx") { $mod = "docx" }
        if ($pkg -eq "PyYAML") { $mod = "yaml" }

        try {
            $null = python -c "import $mod" 2>$null
            if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
                Write-Ok "$pkg (已有)"
            } else { throw "import failed" }
        } catch {
            Write-Log "  安装 $pkg..."
            pip install $pkg -q 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
                Write-Ok "$pkg"
            } else {
                Write-Fail "$pkg 安装失败"
            }
        }
    }
}

# --- 安装 Playwright ---
function Install-Playwright {
    Write-Log "安装 Playwright..."

    # playwright pip
    try {
        $null = python -c "from playwright.sync_api import sync_playwright" 2>$null
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Ok "playwright (已有)"
        } else { throw "not installed" }
    } catch {
        pip install playwright -q 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Ok "playwright pip"
        } else {
            Write-Fail "playwright pip 安装失败"
        }
    }

    # Chromium 浏览器
    Write-Log "  安装 Chromium 浏览器 (首次需要下载，请稍候)..."
    $playwrightResult = python -m playwright install chromium 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "Chromium 浏览器"
    } else {
        Write-Warn "Chromium 安装输出: $($playwrightResult | Select-Object -Last 3)"
        Write-Warn "Chromium 可能未完全安装，不影响核心功能"
    }
}

# --- 安装 Node.js 依赖 ---
function Install-NodeDeps {
    Write-Log "安装 Node.js 依赖..."

    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Warn "npm 未找到，跳过 Node.js 依赖"
        return
    }

    $pkgs = @("nodemailer")
    foreach ($pkg in $pkgs) {
        try {
            $null = node -e "require('$pkg')" 2>$null
            if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
                Write-Ok "$pkg (已有)"
            } else { throw "not found" }
        } catch {
            npm install -g $pkg 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
                Write-Ok "$pkg"
            } else {
                Write-Fail "$pkg 安装失败"
            }
        }
    }
}

# --- 验证 ---
function Verify-All {
    $failed = 0
    Write-Log "验证安装..."

    $pyMods = @{
        openpyxl = "openpyxl"
        docx     = "docx"
        yaml     = "yaml"
        PIL      = "PIL"
        requests = "requests"
        regex    = "regex"
        lxml     = "lxml"
    }

    foreach ($mod in $pyMods.Keys) {
        $importName = $pyMods[$mod]
        try {
            $null = python -c "import $importName" 2>$null
            if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
                Write-Ok "python: $mod"
            } else { throw "import failed"; $failed++ }
        } catch {
            Write-Fail "python: $mod MISSING"
            $failed++
        }
    }

    try {
        $null = python -c "from playwright.sync_api import sync_playwright" 2>$null
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Ok "python: playwright"
        } else { throw "import failed"; $failed++ }
    } catch {
        Write-Fail "python: playwright MISSING"
        $failed++
    }

    try {
        $null = node -e "require('nodemailer')" 2>$null
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Ok "node: nodemailer"
        } else { throw "not found" }
    } catch {
        Write-Warn "node: nodemailer (可选，未安装)"
    }

    return $failed
}

# --- 主流程 ---
Install-PythonDeps
Write-Host ""
Install-Playwright
Write-Host ""
Install-NodeDeps
Write-Host ""

$verifyFailed = Verify-All

Write-Host ""
if ($verifyFailed -eq 0) {
    Write-Ok "全部依赖安装成功！"
    Write-Host ""
    Write-Host "============================================================"
} else {
    Write-Warn "部分依赖安装失败 (共 $($verifyFailed) 项)，请参考上方错误信息"
    Write-Host "============================================================"
    exit 1
}
