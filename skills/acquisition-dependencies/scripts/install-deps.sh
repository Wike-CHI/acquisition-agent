#!/usr/bin/env bash
# =============================================================
# 红龙获客系统 · 依赖安装脚本 (Linux/macOS/WSL2)
# 版本: 2.0.0 | 自动检测系统环境
# 用法: bash install-deps.sh
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

    if [[ "$os_type" == "linux" ]] && grep -qi 'microsoft\|wsl' /proc/version 2>/dev/null; then
        os_type="wsl2"
    fi

    echo "$os_type"
}

# --- 检查依赖是否已安装 ---
check_python() {
    python3 -c "import $1" 2>/dev/null
}

check_npm() {
    node -e "require('$1')" 2>/dev/null
}

# --- 安装函数 ---
install_linux() {
    log "${BOLD}==> Linux/WSL2 环境${NC}"

    if command -v apt-get &>/dev/null; then
        log "检测到 apt 包管理器"
        sudo apt-get update -qq 2>/dev/null || true

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
        sudo apt-get install -y "${pkgs[@]}" 2>&1 | grep -v '^$' | tail -5 || true
        ok "apt 系统包安装完成"
    else
        warn "apt 不可用，跳过系统包安装"
    fi

    # pip3 补充安装
    log "使用 pip3 补充/升级包..."
    pip3 install --quiet --user openpyxl docx pyyaml Pillow requests regex lxml 2>/dev/null || true
    ok "pip3 安装完成"
}

install_macos() {
    log "${BOLD}==> macOS 环境${NC}"

    if ! command -v brew &>/dev/null; then
        fail "Homebrew 未安装，请先安装: /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        return 1
    fi

    log "安装 Homebrew 包..."
    brew install python3 node 2>&1 | tail -3
    ok "Homebrew 安装完成"
}

install_python_deps() {
    log "${BOLD}==> 安装 Python 依赖${NC}"

    # pip3 install 核心包
    local core_pkgs="openpyxl docx pyyaml Pillow requests regex lxml"
    local failed=()

    for pkg in $core_pkgs; do
        local import_name="$pkg"
        [[ "$pkg" == "Pillow" ]] && import_name="PIL"
        [[ "$pkg" == "python-docx" ]] && import_name="docx"
        [[ "$pkg" == "pyyaml" ]] && import_name="yaml"

        if python3 -c "import $import_name" 2>/dev/null; then
            ok "python: $pkg (已有)"
        else
            if pip3 install --quiet --user "$pkg" 2>/dev/null; then
                ok "python: $pkg"
            else
                fail "python: $pkg 安装失败"
                failed+=("$pkg")
            fi
        fi
    done

    # Playwright
    if python3 -c "from playwright.sync_api import sync_playwright" 2>/dev/null; then
        ok "python: playwright (已有)"
    else
        log "安装 Playwright (chromium)..."
        pip3 install --quiet playwright 2>/dev/null || true
        python3 -m playwright install chromium 2>&1 | tail -5 || true
        if python3 -c "from playwright.sync_api import sync_playwright" 2>/dev/null; then
            ok "python: playwright + chromium"
        else
            warn "playwright 浏览器安装可能未完成"
        fi
    fi

    if [[ ${#failed[@]} -gt 0 ]]; then
        warn "以下包安装失败: ${failed[*]}"
    fi
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
            ok "node: $pkg (已有)"
        else
            if npm install -g "$pkg" 2>/dev/null; then
                ok "node: $pkg"
            else
                fail "node: $pkg 安装失败"
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
    if [[ -d "$HOME/.nvm/versions/node" ]]; then
        local node_version
        node_version=$(ls "$HOME/.nvm/versions/node" 2>/dev/null | head -1)
        if [[ -n "$node_version" ]]; then
            local nvm_node="$HOME/.nvm/versions/node/$node_version/bin/node"
            local nvm_npm="$HOME/.nvm/versions/node/$node_version/bin/npm"

            if [[ -f "$nvm_node" ]]; then
                sudo ln -sf "$nvm_node" /usr/bin/node 2>/dev/null || true
                sudo ln -sf "$nvm_npm" /usr/bin/npm 2>/dev/null || true
                ok "node symlink → $node_version"
            fi
        fi
    fi
}

verify_all() {
    log "${BOLD}==> 验证安装${NC}"

    local failed=0

    # Python
    local py_mods="openpyxl docx yaml PIL requests regex lxml"
    for mod in $py_mods; do
        local import_name="$mod"
        [[ "$mod" == "PIL" ]] && import_name="PIL"
        [[ "$mod" == "docx" ]] && import_name="docx"
        [[ "$mod" == "yaml" ]] && import_name="yaml"

        if python3 -c "import $import_name" 2>/dev/null; then
            ok "python: $mod"
        else
            fail "python: $mod MISSING"
            ((failed++)) || true
        fi
    done

    # Playwright
    if python3 -c "from playwright.sync_api import sync_playwright" 2>/dev/null; then
        ok "python: playwright"
    else
        fail "python: playwright MISSING"
        ((failed++)) || true
    fi

    # Node
    if node -e "require('nodemailer')" 2>/dev/null; then
        ok "node: nodemailer"
    else
        warn "node: nodemailer (可选，未安装)"
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

    echo "  系统: $(uname -s) $(uname -m)"
    echo "  OS类型: $os_type"
    echo "  Node: $(node --version 2>/dev/null || echo 'NOT FOUND')"
    echo "  npm: $(npm --version 2>/dev/null || echo 'NOT FOUND')"
    echo "  Python: $(python3 --version 2>/dev/null || echo 'NOT FOUND')"
    echo "  pip3: $(pip3 --version 2>/dev/null | awk '{print $1, $2}' || echo 'NOT FOUND')"
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

    # 3. Python + Playwright
    install_python_deps

    # 4. npm
    install_npm_deps

    # 5. 验证
    echo ""
    if verify_all; then
        echo ""
        ok "全部依赖安装成功！"
        echo ""
        echo "═══════════════════════════════════════════════════"
    else
        echo ""
        warn "部分依赖安装失败，请参考上方错误信息"
        echo "═══════════════════════════════════════════════════"
        return 1
    fi
}

main "$@"
