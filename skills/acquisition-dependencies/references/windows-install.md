### Windows: install-deps.ps1

```powershell
# =============================================================
# 红龙获客系统 · 依赖安装脚本 (Windows PowerShell)
# 版本: 2.0.0 | 自动检测系统环境
# =============================================================

$ErrorActionPreference = "Continue"

function Write-Log { param($msg) Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $msg" }
function Write-Ok  { param($msg) Write-Host "  ✓  $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  ⚠  $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "  ✗  $msg" -ForegroundColor Red }

# --- 环境检测 ---
$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

Write-Log "系统检测:"
Write-Log "  OS: $([System.Environment]::OSVersion.VersionString)"
Write-Log "  PowerShell: $($PSVersionTable.PSVersion)"
Write-Log "  管理员权限: $($IsAdmin)"
Write-Log "  Node: $((Get-Command node -ErrorAction SilentlyContinue).Version)"
Write-Log "  Python: $((Get-Command python -ErrorAction SilentlyContinue).Version)"

# --- 检测包管理器 ---
$HasChoco = Get-Command choco -ErrorAction SilentlyContinue
$HasScoop = Get-Command scoop -ErrorAction SilentlyContinue

# --- 安装 Python 包 ---
function Install-PythonDeps {
    Write-Log "安装 Python 依赖..."

    # 确保 pip 可用
    if (-not (Get-Command pip -ErrorAction SilentlyContinue)) {
        Write-Warn "pip 未找到，尝试安装..."
        if (Get-Command python -ErrorAction SilentlyContinue) {
            python -m ensurepip --default-pip 2>$null
        }
    }

    $pkgs = @("openpyxl", "python-docx", "PyYAML", "Pillow", "requests", "regex", "lxml")
    foreach ($pkg in $pkgs) {
        $mod = $pkg -replace "python-", "" -replace "-", "_"
        if ($pkg -eq "Pillow") { $mod = "PIL" }
        if ($pkg -eq "python-docx") { $mod = "docx" }
        if ($pkg -eq "PyYAML") { $mod = "yaml" }

        try {
            python -c "import $mod" 2>$null
            Write-Ok "$pkg (已安装)"
        } catch {
            Write-Log "  安装 $pkg..."
            pip install $pkg -q 2>&1 | Out-Null
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

    # pip install playwright
    if (-not (python -c "from playwright.sync_api import sync_playwright" 2>$null)) {
        pip install playwright -q 2>&1 | Out-Null
        Write-Ok "playwright pip 包"
    } else {
        Write-Ok "playwright (已安装)"
    }

    # 安装 Chromium
    python -m playwright install chromium 2>&1 | Out-Null
    Write-Ok "Chromium 浏览器"
}

# --- 安装 Node.js 包 ---
function Install-NodeDeps {
    Write-Log "安装 Node.js 依赖..."

    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Warn "npm 未找到，跳过 Node.js 依赖"
        return
    }

    $pkgs = @("nodemailer")
    foreach ($pkg in $pkgs) {
        if (node -e "require('$pkg')" 2>$null) {
            Write-Ok "$pkg (已安装)"
        } else {
            npm install -g $pkg 2>&1 | Out-Null
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

    $pyMods = @{openpyxl="openpyxl"; docx="docx"; yaml="yaml"; PIL="PIL"; requests="requests"; regex="regex"; lxml="lxml"}
    foreach ($mod in $pyMods.Keys) {
        $importName = $pyMods[$mod]
        python -c "import $importName" 2>$null
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Ok "python: $mod"
        } else {
            Write-Fail "python: $mod MISSING"
            $failed++
        }
    }

    python -c "from playwright.sync_api import sync_playwright" 2>$null
    if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
        Write-Ok "python: playwright"
    } else {
        Write-Fail "python: playwright MISSING"
        $failed++
    }

    node -e "require('nodemailer')" 2>$null
    if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
        Write-Ok "node: nodemailer"
    } else {
        Write-Warn "node: nodemailer 未安装 (可选)"
    }

    return $failed
}

# --- 主流程 ---
Write-Host ""
Write-Host "═══════════════════════════════════════════════════"
Write-Host "  红龙获客系统 · 依赖安装 v2.0 (Windows)"
Write-Host "═══════════════════════════════════════════════════"
Write-Host ""

Install-PythonDeps
Install-Playwright
Install-NodeDeps

Write-Host ""
$failed = Verify-All

if ($failed -eq 0) {
    Write-Host ""
    Write-Ok "全部依赖安装成功！"
    Write-Host ""
} else {
    Write-Host ""
    Write-Warn "部分依赖安装失败，请参考上方错误信息"
}
```

## acquisition-init 集成

在 `acquisition-init` 的 Step 4.5 和 Step 5 之间，插入一键安装入口：

```bash
# acquisition-init 在 Step 4.5 检测到依赖缺失时，自动调用：
bash ~/.hermes/skills/acquisition/acquisition-dependencies/scripts/install-deps.sh

# 或用户直接说"一键安装依赖"时触发：
bash ~/.hermes/skills/acquisition/acquisition-dependencies/scripts/install-deps.sh
```

## 版本历史

- **v2.0.0** (2026-04-14): 完全重写，支持 Linux/macOS/WSL2/Windows 自动检测

---

_版本: 2.0.0_
_更新: 2026-04-14_
_触发: 安装依赖、更新依赖、补全依赖、一键安装依赖_
