#!/usr/bin/env bash
# =============================================================
# HOLO-AGENT 更新脚本 - 从 GitHub 拉取最新版本
# 版本: 1.0.0 | 适用于 Linux/macOS/WSL2
# 用法: bash pull-update.sh [--check-only] [--force]
# =============================================================

set -euo pipefail

# --- 配置 ---
REPO_OWNER="${REPO_OWNER:-Wike-CHI}"
REPO_NAME="${REPO_NAME:-acquisition-agent}"
BRANCH="${BRANCH:-main}"
SKILLS_DIR="${SKILLS_DIR:-$HOME/.hermes/skills/acquisition}"
# REPO_DIR 用固定路径，避免 /tmp 被清理
REPO_DIR="/tmp/acquisition-agent-update"
BACKUP_DIR="${SKILLS_DIR}/.backup"
RSYNC_CMD=""

# --- 颜色 ---
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
log()  { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $*"; }
ok()   { echo -e "${GREEN}  ✓${NC}  $*"; }
warn() { echo -e "${YELLOW}  ⚠${NC}  $*"; }
fail() { echo -e "${RED}  ✗${NC}  $*"; }

# --- 全局选项 ---
CHECK_ONLY=false
FORCE=false

# --- rsync 检测 + 回退 ---
detect_rsync() {
    if command -v rsync &>/dev/null; then
        RSYNC_CMD="rsync"
        ok "rsync 可用"
    else
        if cp --version &>/dev/null; then
            RSYNC_CMD="cp"
            warn "rsync 不可用，使用 cp --delete 回退"
        else
            fail "rsync 和 cp 均不可用，无法执行更新"
            exit 1
        fi
    fi
}

# --- python3 检测 ---
detect_python() {
    if command -v python3 &>/dev/null; then
        ok "python3 $(python3 --version 2>&1 | awk '{print $2}')"
    else
        warn "python3 未安装，跳过 YAML 验证"
    fi
}

# --- 参数解析（最先执行，--help/-h 应立即退出） ---
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --check-only) CHECK_ONLY=true; shift ;;
            --force) FORCE=true; shift ;;
            -h|--help)
                echo "用法: pull-update.sh [选项]"
                echo "  --check-only  仅检查更新，不执行"
                echo "  --force       强制更新，跳过备份确认"
                exit 0 ;;
            *) echo "未知参数: $1"; exit 1 ;;
        esac
    done
}

# --- 预检 ---
parse_args "$@"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  HOLO-AGENT · 更新检查"
echo "═══════════════════════════════════════════════════"
echo ""

detect_rsync
detect_python

log "检查网络连通性..."
if curl -sf --connect-timeout 5 -I "https://github.com" &>/dev/null; then
    ok "github.com 可达"
else
    fail "无法连接 github.com，请检查网络"
    exit 1
fi

log "检查 git 配置..."
if ! command -v git &>/dev/null; then
    fail "git 未安装"
    exit 1
fi
ok "git $(git --version | awk '{print $3}')"

# --- Clone 或 Update 仓库 ---
mkdir -p "$(dirname "$REPO_DIR")"

if [[ -d "$REPO_DIR/.git" ]]; then
    log "更新已有仓库..."
    pushd "$REPO_DIR" &>/dev/null
    git fetch origin "$BRANCH" 2>&1 || { fail "fetch 失败"; popd &>/dev/null; exit 1; }
    popd &>/dev/null
else
    log "克隆仓库 (shallow, --depth=1)..."
    if ! git clone --depth=1 "https://github.com/$REPO_OWNER/$REPO_NAME.git" "$REPO_DIR" 2>&1; then
        fail "clone 失败"
        exit 1
    fi
    ok "克隆完成"
fi

# --- 获取版本信息 ---
pushd "$REPO_DIR" &>/dev/null

LOCAL_COMMIT="$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
REMOTE_COMMIT="$(git rev-parse origin/$BRANCH 2>/dev/null || echo 'unknown')"
BEHIND=$(( $(git rev-list --count origin/$BRANCH..HEAD 2>/dev/null || echo 0) ))
AHEAD=$(( $(git rev-list --count HEAD..origin/$BRANCH 2>/dev/null || echo 0) ))

echo ""
echo "  仓库:     $REPO_OWNER/$REPO_NAME"
echo "  分支:     $BRANCH"
echo "  本地:     ${LOCAL_COMMIT:0:8}"
echo "  远程:     ${REMOTE_COMMIT:0:8}"
echo "  状态:     $BEHIND 落后 | $AHEAD 领先"

popd &>/dev/null

# --- 检查是否需要更新 ---
if [[ "$AHEAD" == "0" ]] && [[ "$BEHIND" == "0" ]]; then
    echo ""
    ok "已是最新版本 (${LOCAL_COMMIT:0:8})"
    exit 0
fi

if [[ "$BEHIND" != "0" ]]; then
    warn "本地领先远程 $BEHIND 个提交（你有未推送的更改）"
fi

if [[ "$AHEAD" != "0" ]]; then
    echo ""
    ok "发现远程有新版本 (领先 $AHEAD 个提交)"
fi

# --- 检查模式 ---
if [[ "$CHECK_ONLY" == "true" ]]; then
    echo ""
    log "使用 --check-only，仅检查不更新"
    exit 0
fi

# --- 显示变更文件 ---
log "变更文件预览:"
pushd "$REPO_DIR" &>/dev/null
git diff --stat HEAD..origin/$BRANCH 2>/dev/null | tail -10 || true
popd &>/dev/null

# --- 备份 ---
echo ""
log "备份当前版本到 ${BACKUP_DIR}/..."
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="${BACKUP_DIR}/${TS}"
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_PATH"

if [[ "$FORCE" != "true" ]]; then
    echo ""
    echo -n "  确认备份当前 skills/ 到 ${BACKUP_PATH} ? (Y/n): "
    read -r answer
    answer="${answer:-Y}"
    if [[ "$answer" != "Y" && "$answer" != "y" ]]; then
        warn "已取消更新"
        exit 0
    fi
fi

# 备份完成后清理旧备份（保留最近5个）
cp -r "$SKILLS_DIR" "$BACKUP_PATH" 2>/dev/null || true
ok "备份完成: ${BACKUP_PATH}"

# 清理旧备份（保留最近5个）
if [[ -d "$BACKUP_DIR" ]]; then
    ls -dt "$BACKUP_DIR"/*/ 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true
fi

# --- 执行更新 ---
log "执行更新 (rsync 覆盖 skills/)..."

# 同步 skills/ 目录
if [[ "$RSYNC_CMD" == "rsync" ]]; then
    if ! rsync -a --delete \
        --exclude='.git' \
        --exclude='.backup' \
        --exclude='.archive' \
        --exclude='acquisition.bak.*' \
        --exclude='node_modules' \
        --exclude='__pycache__' \
        "$REPO_DIR/skills/" "$SKILLS_DIR/" 2>&1; then
        fail "rsync 同步失败"
        exit 1
    fi
else
    # cp 回退（不支持增量，保留 .backup .archive）
    if ! cp -r "$REPO_DIR/skills/"* "$SKILLS_DIR/" 2>&1; then
        fail "cp 同步失败"
        exit 1
    fi
fi
ok "同步完成"

# --- 验证 ---
log "验证更新..."

PASS=0
FAIL=0

# 检查关键文件
for f in \
    "SKILLS-MANIFEST.yaml" \
    "acquisition-workflow/references/ROUTING-TABLE.yaml" \
    "global-customer-acquisition/SKILL.md" \
    "acquisition-dependencies/SKILL.md" \
    "acquisition-init/SKILL.md" \
    "holo-updater/SKILL.md"
do
    if [[ -f "$SKILLS_DIR/$f" ]]; then
        ok "$f"
        ((PASS++)) || true
    else
        fail "缺失: $f"
        ((FAIL++)) || true
    fi
done

# YAML 合法性检查
if command -v python3 &>/dev/null; then
    for yaml_file in \
        "$SKILLS_DIR/SKILLS-MANIFEST.yaml" \
        "$SKILLS_DIR/acquisition-workflow/references/ROUTING-TABLE.yaml"
    do
        if [[ -f "$yaml_file" ]]; then
            if python3 -c "import yaml; yaml.safe_load(open('$yaml_file'))" 2>/dev/null; then
                ok "YAML合法: $(basename "$yaml_file")"
            else
                fail "YAML格式错误: $(basename "$yaml_file")"
                ((FAIL++)) || true
            fi
        fi
    done
fi

# --- 结果 ---
echo ""
echo "═══════════════════════════════════════════════════"
echo "  更新报告"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  仓库:     $REPO_OWNER/$REPO_NAME"
echo "  分支:     $BRANCH"
echo "  旧版本:   ${LOCAL_COMMIT:0:8}"
echo "  新版本:   ${REMOTE_COMMIT:0:8}"
echo "  备份:     ${BACKUP_PATH}"
echo ""
echo "  验证:     $PASS 通过 | $FAIL 失败"
echo ""

if [[ "$FAIL" == "0" ]]; then
    ok "更新成功！"
    echo ""
    echo "  输入任意命令开始使用，如："
    echo "    帮我找10个巴西的工业皮带分销商"
else
    fail "更新完成但有 $FAIL 项验证失败，请检查"
fi

echo ""
echo "═══════════════════════════════════════════════════"
