---
name: acquisition-dependencies
version: 2.0.0
description: 红龙获客系统依赖安装技能 v2.0 - 跨平台自动检测+安装。自动识别 Linux/Windows/macOS 环境，安装所有 Python/npm 系统依赖。触发：安装依赖、更新依赖、补全依赖、一键安装依赖。
triggers:
  - 安装依赖
  - 更新依赖
  - 补全依赖
  - 安装依赖包
  - 修复依赖
  - 一键安装依赖
  - 初始化环境
---

# 红龙获客系统 · 依赖安装技能 v2.0

## 功能

自动检测当前系统环境（Linux/Windows/macOS/WSL2），根据检测结果安装所有必需的 Python 和 npm 依赖。

## 一键安装

```bash
# Linux/macOS/WSL2
bash <(curl -fsSL https://raw.githubusercontent.com/Wike-CHI/acquisition-agent/main/skills/acquisition-dependencies/scripts/install-deps.sh)

# Windows (PowerShell)
irm https://raw.githubusercontent.com/Wike-CHI/acquisition-agent/main/skills/acquisition-dependencies/scripts/install-deps.ps1 | iex
```

## 环境检测逻辑

技能加载时自动执行以下检测：

```
检测顺序：
  1. uname -s  → 判断 Linux/Darwin/NT
  2. /proc/version 或 os-release → 判断 WSL2
  3. command -v node/npm/python3 → 判断已安装的工具
  4. python3 -c "import platform; print(platform.system())" → 确认 OS
```

| 检测结果 | 系统类型 | 安装方式 |
|----------|----------|----------|
| Linux + 无WSL特征 | Debian/Ubuntu | apt-get |
| Linux + WSL2 | WSL2 | apt-get + WSL2特殊处理 |
| NT + Windir存在 | Windows | PowerShell + choco/scoop |
| Darwin | macOS | brew |

## 依赖清单

### Python 依赖（所有平台）

| 包名 | 用途 | 验证命令 |
|------|------|----------|
| openpyxl | Excel读写 | `python3 -c "import openpyxl"` |
| docx | Word读写 | `python3 -c "import docx"` |
| yaml | YAML解析 | `python3 -c "import yaml"` |
| Pillow | 图片处理 | `python3 -c "from PIL import Image"` |
| requests | HTTP请求 | `python3 -c "import requests"` |
| regex | 正则增强 | `python3 -c "import regex"` |
| lxml | XML/HTML解析 | `python3 -c "import lxml"` |
| playwright | 浏览器自动化 | `python3 -c "from playwright.sync_api import sync_playwright"` |

### Node.js 依赖（所有平台）

| 包名 | 用途 | 验证命令 |
|------|------|----------|
| nodemailer | 邮件发送 | `node -e "require('nodemailer')"` |

### 浏览器（可选）

| 浏览器 | 用途 | 安装命令 |
|--------|------|----------|
| Chromium | Playwright主力 | `python3 -m playwright install chromium` |
| Chrome | 备用 | `python3 -m playwright install chrome` |

## 安装脚本

### Linux/macOS: install-deps.sh

```bash
#!/usr/bin/env bash
# =============================================================
# 红龙获客系统 · 依赖安装脚本 (Linux/macOS/WSL2)
# 版本: 2.0.0 | 自动检测系统环境
# =============================================================

set -euo pipefail

# --- 颜色输出 ---
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $*"; }
ok()   { echo -e "${GREEN}  ✓${NC}  $*"; }
warn() { echo -e "${YELLOW}  ⚠${NC}  $*"; }
fail() { echo -e "${RED}  ✗${NC}  $*"; }

# --- 环境检测 ---
detect_os() {
    local os_type
    case "$(uname -s)" in
        Linux*)     os_type="linux" ;;
        Darwin*)    os_type="macos" ;;
        CYGWIN*|MINGW*|MSYS*|NT*) os_type="windows" ;;
        *)          os_type="unknown" ;;
    esac

    # 检测 WSL2
    if [[ "$os_type" == "linux" ]] && grep -qi 'microsoft\|wsl' /proc/version 2>/dev/null; then
        os_type="wsl2"
    fi

    echo "$os_type"
}

detect_node() {
    if command -v node &>/dev/null; then
        echo "node: $(node --version)"
    else
        echo "node: NOT FOUND"
    fi

    if command -v npm &>/dev/null; then
        echo "npm: $(npm --version)"
    else
        echo "npm: NOT FOUND"
    fi

    if command -v python3 &>/dev/null; then
        echo "python3: $(python3 --version 2>&1)"
    elif command -v python &>/dev/null; then
        echo "python: $(python --version 2>&1)"
    else
        echo "python3: NOT FOUND"
    fi
}

# --- 检查依赖是否已安装 ---
check_python_pkg() {
    python3 -c "import $1" 2>/dev/null
}

check_npm_pkg() {
    node -e "require('$1')" 2>/dev/null
}

# --- 安装函数 ---
install_linux() {
    log "${BOLD}==> Linux/WSL2 环境${NC}"

    if command -v apt-get &>/dev/null; then
        log "检测到 apt 包管理器"
        sudo apt-get update -qq

        local pkgs=(
            python3-pip
            python3-openpyxl
            python3-docx
            python3-yaml
            python3-pil
            python3-requests
            python3-regex
            python3-lxml
        )

        log "安装 Python 系统包..."
        sudo apt-get install -y "${pkgs[@]}" 2>&1 | tail -5
        ok "系统包安装完成"
    else
        warn "apt 不可用，尝试 pip3 直接安装..."
    fi

    # pip3 补充安装（确保最新版本）
    log "使用 pip3 补充/升级包..."
    pip3 install --quiet --user openpyxl docx pyyaml Pillow requests regex lxml 2>&1 | tail -3
    ok "pip3 安装完成"
}

install_macos() {
    log "${BOLD}==> macOS 环境${NC}"

    if ! command -v brew &>/dev/null; then
        fail "Homebrew 未安装，请先安装: /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        return 1
    fi

    log "安装 Homebrew 包..."
    brew install python3 node
    brew install python3-openpyxl python3-docx python3-yaml python3-pillow 2>/dev/null || true
    ok "Homebrew 安装完成"
}

install_python_deps() {
    log "${BOLD}==> 安装 Python 依赖${NC}"

    local python_pkgs="openpyxl docx pyyaml Pillow requests regex lxml"
    local failed=()

    for pkg in $python_pkgs; do
        if python3 -c "import ${pkg%%:*}" 2>/dev/null; then
            echo -n ""
        else
            if pip3 install --quiet --user "$pkg" 2>/dev/null; then
                ok "$pkg"
            else
                fail "$pkg 安装失败"
                failed+=("$pkg")
            fi
        fi
    done

    # Playwright
    if python3 -c "from playwright.sync_api import sync_playwright" 2>/dev/null; then
        ok "playwright 已安装"
    else
        log "安装 Playwright..."
        pip3 install --quiet playwright 2>&1 | tail -2
        python3 -m playwright install chromium --with-deps 2>&1 | tail -5
        ok "playwright + chromium 安装完成"
    fi

    if [[ ${#failed[@]} -gt 0 ]]; then
        warn "以下包安装失败: ${failed[*]}"
        return 1
    fi
    return 0
}

install_npm_deps() {
    log "${BOLD}==> 安装 Node.js 依赖${NC}"

    if ! command -v npm &>/dev/null; then
        warn "npm 未安装，跳过 Node.js 依赖"
        return 0
    fi

    local npm_pkgs="nodemailer"
    local failed=()

    for pkg in $npm_pkgs; do
        if node -e "require('$pkg')" 2>/dev/null; then
            ok "$pkg 已安装"
        else
            if npm install -g "$pkg" 2>/dev/null; then
                ok "$pkg"
            else
                fail "$pkg 安装失败"
                failed+=("$pkg")
            fi
        fi
    done

    if [[ ${#failed[@]} -gt 0 ]]; then
        warn "以下包安装失败: ${failed[*]}"
    fi
}

install_wsl2_extras() {
    log "${BOLD}==> WSL2 特殊处理${NC}"

    # WSL2 下确保 node path 正确
    local node_path
    if [[ -d "$HOME/.nvm/versions/node" ]]; then
        local node_version
        node_version=$(ls "$HOME/.nvm/versions/node" | head -1)
        if [[ -n "$node_version" ]]; then
            local nvm_node="$HOME/.nvm/versions/node/$node_version/bin/node"
            local nvm_npm="$HOME/.nvm/versions/node/$node_version/bin/npm"

            if [[ ! -L /usr/bin/node ]] && [[ -f "$nvm_node" ]]; then
                sudo ln -sf "$nvm_node" /usr/bin/node
                sudo ln -sf "$nvm_npm" /usr/bin/npm
                ok "node/npm symlink 已创建 → $node_version"
            fi
        fi
    fi
}

verify_all() {
    log "${BOLD}==> 验证安装${NC}"

    local failed=0

    # Python
    local py_pkgs="openpyxl docx yaml PIL requests regex lxml"
    for pkg in $py_pkgs; do
        local import_name="${pkg%%:*}"
        if python3 -c "import $import_name" 2>/dev/null; then
            ok "python: $pkg"
        else
            fail "python: $pkg MISSING"
            ((failed++))
        fi
    done

    # Playwright
    if python3 -c "from playwright.sync_api import sync_playwright" 2>/dev/null; then
        ok "python: playwright"
    else
        fail "python: playwright MISSING"
        ((failed++))
    fi

    # Node
    if node -e "require('nodemailer')" 2>/dev/null; then
        ok "node: nodemailer"
    else
        warn "node: nodemailer 未安装 (可选)"
    fi

    return $failed
}

# --- 主流程 ---
main() {
    echo ""
    echo "═══════════════════════════════════════════════════"
    echo "  红龙获客系统 · 依赖安装 v2.0"
    echo "═══════════════════════════════════════════════════"
    echo ""

    # 1. 环境检测
    local os_type
    os_type=$(detect_os)
    log "系统检测:"
    detect_node | while read -r line; do
        echo "       $line"
    done
    echo "       OS类型: $os_type"
    echo ""

    # 2. 根据系统安装
    case "$os_type" in
        linux|wsl2)
            install_linux
            if [[ "$os_type" == "wsl2" ]]; then
                install_wsl2_extras
            fi
            ;;
        macos)
            install_macos
            ;;
        windows)
            fail "Windows 原生环境请使用 PowerShell 脚本: install-deps.ps1"
            return 1
            ;;
        *)
            fail "无法识别的系统: $(uname -a)"
            return 1
            ;;
    esac

    # 3. Python + Playwright（所有环境）
    install_python_deps

    # 4. npm（所有环境）
    install_npm_deps

    # 5. 验证
    echo ""
    if verify_all; then
        echo ""
        ok "全部依赖安装成功！"
        echo ""
    else
        echo ""
        warn "部分依赖安装失败，请参考上方错误信息"
        return 1
    fi
}

main "$@"
```

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
