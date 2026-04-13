#!/usr/bin/env bash
# =============================================================
# sync-to-github.sh - 红龙获客系统本地→GitHub 增量同步脚本 (Linux/macOS)
# =============================================================
# 用途：将本地 ~/.hermes/skills/acquisition/ 中红龙系统相关技能同步到 GitHub 仓库
# 用法：cd ~/.hermes/skills/acquisition && bash release-manager/scripts/sync-to-github.sh [-m "提交信息"]
#
# v2.1 (2026-04-11) - Linux 版，功能对齐 PowerShell v2.1：
#   - P0: 强制预检（gh auth / 网络连通性）
#   - P1: SKILL.md hash 变化检测，增量同步跳过无变化的技能
#   - P1: git 操作添加错误处理
#   - P1: gh clone 失败自动回退到 git clone
#   - P1: submodule 检测与自动修复
# =============================================================

set -euo pipefail

# --- 配置 ---
LOCAL_SKILLS_DIR="${LOCAL_SKILLS_DIR:-$HOME/.hermes/skills/acquisition}"
REPO_DIR="${REPO_DIR:-/tmp/acquisition-agent-sync}"
REPO_OWNER="${REPO_OWNER:-Wike-CHI}"
REPO_NAME="${REPO_NAME:-acquisition-agent}"
BRANCH="${BRANCH:-main}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-sync: update skills from local}"
SKIP_SUBMODULE_CHECK=false
SKIP_PREREQ_CHECK=false

# 解析参数
while [[ $# -gt 0 ]]; do
    case "$1" in
        -m|--message)   COMMIT_MESSAGE="$2"; shift 2 ;;
        --owner)        REPO_OWNER="$2"; shift 2 ;;
        --repo)         REPO_NAME="$2"; shift 2 ;;
        --branch)       BRANCH="$2"; shift 2 ;;
        --skip-sub)     SKIP_SUBMODULE_CHECK=true; shift ;;
        --skip-prereq)  SKIP_PREREQ_CHECK=true; shift ;;
        -h|--help)
            echo "用法: sync-to-github.sh [选项]"
            echo "  -m, --message MSG   提交信息 (默认: 'sync: update skills from local')"
            echo "  --owner OWNER       GitHub 用户名 (默认: Wike-CHI)"
            echo "  --repo REPO         GitHub 仓库名 (默认: acquisition-agent)"
            echo "  --branch BRANCH     分支名 (默认: main)"
            echo "  --skip-sub          跳过 submodule 检查"
            echo "  --skip-prereq       跳过预检"
            exit 0 ;;
        *) echo "未知参数: $1"; exit 1 ;;
    esac
done

# 红龙获客系统保留的技能清单
RETAINED_SKILLS=(
    # 主入口
    "global-customer-acquisition"
    "understand-honglong-acquisition"
    # 编排层
    "acquisition-coordinator" "acquisition-evaluator" "acquisition-init" "acquisition-workflow"
    # 发现层
    "linkedin" "facebook-acquisition" "instagram-acquisition" "teyi-customs" "scrape" "scrapling"
    # 情报层
    "company-research" "market-research" "in-depth-research" "autoresearch" "customer-intelligence" "deep-research" "knowledge-base"
    # 触达层
    "email-sender" "email-marketing" "cold-email-generator" "linkedin-writer" "email-outreach-ops" "delivery-queue"
    # 支持层
    "customer-deduplication" "sales-pipeline-tracker" "crm" "fumamx-crm" "credential-manager"
    # 人格/产品层
    "honglong-assistant" "honglong-products"
    # 文档层
    "document-pro" "nano-pdf" "pdf-extract" "pdf-smart-tool-cn" "excel-xlsx" "office"
    # 人性化
    "humanize-ai-text" "humanizer" "sdr-humanizer"
    # 搜索层
    "brave-web-search" "exa-search" "exa-web-search-free" "tavily-search" "multi-search-engine" "web-content-fetcher"
    # 浏览器
    "browser-automation" "playwright" "agent-browser" "desktop-control"
    # 社媒
    "ai-social-media-content" "xiaohongshu"
    # 记忆
    "smart-memory" "humanoid-memory" "memory-hygiene" "memory-tiering" "memory-manager"
    # 工具
    "nas-file-reader" "daily-report-writer" "calendar-skill" "GitHub热门项目"
    "data-automation-service" "release-manager" "sales" "business-development"
    "smart-quote"
    "proactive-agent" "proactive-agent-lite"
    # 基础设施
    "acp" "skill-creator" "find-skills" "skill-discovery" "skill-finder-cn" "evolver"
    "agent-reach-setup"
    # 邮件
    "agentmail" "gog" "163-email-sender" "WhatsApp"
    # 新增技能
    "email-inbox" "holo-activity-log" "market-development-report"
    # 社媒内容生成簇
    "holo-social-gen" "holo-social-image" "holo-social-infographic"
    # CLI工具集
    "cli-anything-hub"
    # 依赖安装
    "acquisition-dependencies"
    # 询盘应答
    "inquiry-response"
    # 中文目录
    "浏览器自动化" "内容分发" "去AI味" "QQ邮箱" "MCP管理器"
)

# rsync 排除规则
RSYNC_EXCLUDES=(
    "--exclude=node_modules"
    "--exclude=.git"
    "--exclude=coverage"
    "--exclude=__pycache__"
    "--exclude=test-output"
    "--exclude=.serena"
    "--exclude=release"
    "--exclude=dist"
    "--exclude=dist-full"
    "--exclude=*.pyc"
    "--exclude=*.pyo"
    "--exclude=.env"
    "--exclude=package-lock.json"
)

# --- 辅助函数 ---
log_status() { echo -e "\033[36m[$(date '+%H:%M:%S')] $*\033[0m"; }
log_ok()     { echo -e "\033[32m  OK $*\033[0m"; }
log_warn()   { echo -e "\033[33m  WARN $*\033[0m"; }
log_fail()   { echo -e "\033[31m  FAIL $*\033[0m"; }

# --- 预检函数 ---
test_prerequisites() {
    log_status "=== 预检 ==="

    # 1. 检查 git
    if ! command -v git &>/dev/null; then
        log_fail "git 未安装"
        return 1
    fi
    log_ok "git 已安装"

    # 2. 检查 gh auth（可选）
    if command -v gh &>/dev/null; then
        if gh auth status &>/dev/null 2>&1; then
            log_ok "GitHub CLI 已登录"
        else
            log_warn "GitHub CLI 未登录（将使用 git push）"
        fi
    else
        log_warn "gh CLI 未安装（将使用纯 git）"
    fi

    # 3. 检查网络
    if curl -sf --connect-timeout 5 -I "https://github.com" &>/dev/null; then
        log_ok "网络正常 (github.com 可达)"
    else
        log_fail "无法连接 github.com"
        return 1
    fi

    return 0
}

# --- 增量变更检测 ---
HASH_FILE=""

get_hash_file() {
    echo "${REPO_DIR}/.last-sync-hashes.json"
}

# 获取 SKILL.md 的 MD5
get_skill_hash() {
    local skill_file="$1"
    if [[ ! -f "$skill_file" ]]; then
        echo ""
        return
    fi
    md5sum "$skill_file" 2>/dev/null | awk '{print $1}' || echo ""
}

# 检查技能是否有变化
test_skill_changed() {
    local skill_name="$1"
    local src_path="$2"
    local skill_file="${src_path}/SKILL.md"

    # 无 SKILL.md，视为变化
    if [[ ! -f "$skill_file" ]]; then
        return 0  # changed
    fi

    local hash_file
    hash_file=$(get_hash_file)

    # 无 hash 文件，视为变化
    if [[ ! -f "$hash_file" ]]; then
        return 0
    fi

    local current_hash
    current_hash=$(get_skill_hash "$skill_file")

    # 用 jq 或 python 查 hash
    local last_hash=""
    if command -v jq &>/dev/null; then
        last_hash=$(jq -r --arg k "$skill_name" '.[$k] // ""' "$hash_file" 2>/dev/null)
    elif command -v python3 &>/dev/null; then
        last_hash=$(python3 -c "
import json, sys
try:
    d = json.load(open('$hash_file'))
    print(d.get('$skill_name', ''))
except: print('')
" 2>/dev/null)
    fi

    # 新技能或首次同步
    if [[ -z "$last_hash" ]]; then
        return 0
    fi

    if [[ "$current_hash" == "$last_hash" ]]; then
        return 1  # not changed
    fi
    return 0  # changed
}

# 保存技能 hash
save_skill_hash() {
    local skill_name="$1"
    local src_path="$2"
    local skill_file="${src_path}/SKILL.md"

    if [[ ! -f "$skill_file" ]]; then
        return
    fi

    local hash_file
    hash_file=$(get_hash_file)
    local current_hash
    current_hash=$(get_skill_hash "$skill_file")

    # 用 python 更新 JSON（无需 jq 依赖）
    python3 -c "
import json, os
hf = '$hash_file'
d = {}
if os.path.exists(hf):
    try: d = json.load(open(hf))
    except: pass
d['$skill_name'] = '$current_hash'
with open(hf, 'w') as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
" 2>/dev/null
}

# --- Submodule 检测与修复 ---
find_nested_git_dirs() {
    local root="$1"
    find "$root" -name ".git" -type d 2>/dev/null | while read -r gitdir; do
        local relpath="${gitdir#$root/}"
        if [[ "$relpath" != ".git" && "$relpath" != ".git/"* ]]; then
            echo "$relpath"
        fi
    done
}

fix_submodule_reference() {
    local repo_root="$1"
    local sm_path="$2"

    log_warn "发现 submodule 引用: $sm_path"
    log_status "修复中..."

    pushd "$repo_root" &>/dev/null || return 1

    # 1. 从 git index 删除 submodule 引用
    git rm --cached "$sm_path" 2>/dev/null || true

    # 2. 确保 .git 目录已删除
    local git_dir="${repo_root}/${sm_path}/.git"
    if [[ -d "$git_dir" ]]; then
        rm -rf "$git_dir"
    fi

    # 3. 重新 add 为普通目录
    git add "$sm_path" 2>/dev/null || true

    # 4. 验证
    local mode
    mode=$(git ls-files --stage "$sm_path" 2>/dev/null | head -1 | awk '{print $1}')
    if [[ "$mode" == "160000" ]]; then
        log_fail "修复失败: 仍是 submodule 引用"
        popd &>/dev/null
        return 1
    else
        log_ok "已修复为普通文件: $sm_path"
        popd &>/dev/null
        return 0
    fi
}

# =============================================================
# 主流程
# =============================================================
log_status "=== 红龙获客系统 同步到 GitHub ==="
log_status "本地技能目录: $LOCAL_SKILLS_DIR"

# 检查本地技能目录
if [[ ! -d "$LOCAL_SKILLS_DIR" ]]; then
    log_fail "本地技能目录不存在: $LOCAL_SKILLS_DIR"
    exit 1
fi

# =============================================================
# Step 0: 预检
# =============================================================
if [[ "$SKIP_PREREQ_CHECK" == "false" ]]; then
    if ! test_prerequisites; then
        log_fail "预检失败，退出"
        exit 1
    fi
else
    log_warn "跳过预检 (--skip-prereq)"
fi

# =============================================================
# Step 1: Clone 或更新仓库
# =============================================================
if [[ -d "$REPO_DIR" ]]; then
    log_status "更新已有仓库..."
    pushd "$REPO_DIR" &>/dev/null
    git fetch origin "$BRANCH" 2>&1 || log_warn "git fetch 失败，继续..."
    git reset --hard "origin/$BRANCH" 2>&1 || log_warn "git reset 失败，继续..."
    popd &>/dev/null
else
    log_status "克隆仓库..."
    if command -v gh &>/dev/null && gh repo clone "$REPO_OWNER/$REPO_NAME" "$REPO_DIR" -- --depth=1 2>/dev/null; then
        :
    else
        log_warn "gh clone 失败，尝试 git clone..."
        if ! git clone --depth=1 "https://github.com/$REPO_OWNER/$REPO_NAME.git" "$REPO_DIR" 2>/dev/null; then
            log_fail "无法克隆仓库"
            exit 1
        fi
    fi
fi

if [[ ! -d "$REPO_DIR" ]]; then
    log_fail "无法获取仓库"
    exit 1
fi

REPO_SKILLS_DIR="${REPO_DIR}/skills"
mkdir -p "$REPO_SKILLS_DIR"

# =============================================================
# Step 2: 同步技能（增量 rsync）
# =============================================================
log_status "同步技能..."
synced=0
skipped=0
failed=0

for skill in "${RETAINED_SKILLS[@]}"; do
    src_path="${LOCAL_SKILLS_DIR}/${skill}"
    dst_path="${REPO_SKILLS_DIR}/${skill}"

    if [[ ! -d "$src_path" ]]; then
        log_warn "本地不存在: $skill"
        ((skipped++)) || true
        continue
    fi

    # ★ P1 增量检测：跳过无变化的技能
    if ! test_skill_changed "$skill" "$src_path"; then
        echo -e "\033[90m  → 跳过(无变化): $skill\033[0m"
        continue
    fi

    # rsync 同步（删除目标多余文件，排除垃圾目录）
    local_excludes=("${RSYNC_EXCLUDES[@]}")
    # GCA 内部的 skills/ 子目录排除
    if [[ "$skill" == "global-customer-acquisition" ]]; then
        local_excludes+=("--exclude=skills")
    fi

    if rsync -a --delete "${local_excludes[@]}" "$src_path/" "$dst_path/" 2>/dev/null; then
        log_ok "$skill"
        ((synced++)) || true
        save_skill_hash "$skill" "$src_path"
    else
        log_fail "$skill"
        ((failed++)) || true
    fi
done

log_status "同步: 更新 $synced / 跳过 $skipped / 失败 $failed"

# =============================================================
# Step 3: Submodule 检测与修复
# =============================================================
if [[ "$SKIP_SUBMODULE_CHECK" == "false" ]]; then
    log_status "检查 submodule 引用..."
    pushd "$REPO_DIR" &>/dev/null

    # 检查 160000 模式的 submodule 引用
    submodules=$(git ls-files --stage 2>/dev/null | grep "^160000" || true)
    if [[ -n "$submodules" ]]; then
        sm_count=$(echo "$submodules" | wc -l)
        log_warn "发现 ${sm_count} 个 submodule 引用!"
        while IFS= read -r sm; do
            sm_path=$(echo "$sm" | awk '{print $NF}')
            fix_submodule_reference "$REPO_DIR" "$sm_path" || true
        done <<< "$submodules"
    else
        log_ok "无 submodule 引用"
    fi

    # 检查嵌套 .git 目录
    nested=$(find_nested_git_dirs "$REPO_DIR")
    if [[ -n "$nested" ]]; then
        log_warn "发现嵌套 .git 目录:"
        while IFS= read -r n; do
            log_warn "  $n"
            rm -rf "${REPO_DIR}/${n}"
        done <<< "$nested"
        log_ok "已清理嵌套 .git 目录"
        git add -A 2>/dev/null || true
    fi

    popd &>/dev/null
fi

# =============================================================
# Step 4: 检查变化并提交
# =============================================================
pushd "$REPO_DIR" &>/dev/null

changes=$(git status --porcelain 2>/dev/null || true)
if [[ -z "$changes" ]]; then
    log_status "没有变化，无需提交"
    popd &>/dev/null
    exit 0
fi

change_count=$(echo "$changes" | wc -l)
log_status "${change_count} 个文件有变化，提交中..."

git add -A 2>&1 || { log_fail "git add 失败"; popd &>/dev/null; exit 1; }

# 检查是否有 submodule 修复
commit_suffix=""
if [[ "$SKIP_SUBMODULE_CHECK" == "false" && -n "$submodules" ]]; then
    submodules_after=$(git ls-files --stage 2>/dev/null | grep "^160000" || true)
    if [[ -z "$submodules_after" ]]; then
        commit_suffix=" + fix submodule refs"
    fi
fi

if ! git commit -m "${COMMIT_MESSAGE}${commit_suffix}" 2>/dev/null; then
    log_fail "git commit 失败"
    popd &>/dev/null
    exit 1
fi

# 统计
file_count=$(find . -not -path './.git/*' -type f | wc -l)
total_size=$(du -sm --exclude='.git' . 2>/dev/null | awk '{print $1}')

# 推送
log_status "推送中..."
if git push origin "$BRANCH" 2>&1; then
    log_ok "推送成功! (${file_count} files, ${total_size}MB)"
else
    log_fail "推送失败"
    popd &>/dev/null
    exit 1
fi

popd &>/dev/null
log_status "=== 同步完成 ==="
