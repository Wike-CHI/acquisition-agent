#!/usr/bin/env bash
# setup-user.sh — 从环境变量或命令行参数生成所有 workspace 配置文件
#
# 使用方式：
#   方式1: cp .env.example .env → 填写信息 → bash workspace/setup-user.sh
#   方式2: bash workspace/setup-user.sh --owner-name "张三" --email "xx@163.com" ...
#
# 生成的文件：USER.md, IDENTITY.md, AGENTS.md, TOOLS.md,
#             SOUL.md, MEMORY.md, HEARTBEAT.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
TEMPLATE_DIR="$SCRIPT_DIR"

# ── 默认值 ──
OWNER_NAME="未设置"
OWNER_DISPLAY_NAME="未设置"
COMPANY_NAME="HOLO Industrial Equipment Mfg Co., Ltd"
COMPANY_FULL_NAME="温州红龙工业设备制造有限公司（HOLO Industrial Equipment Mfg Co., Ltd）"
BRAND_NAME="HOLO"
OWNER_EMAIL="未设置"
OWNER_PHONE="未设置"
GITHUB_USER="未设置"
FACTORY_LOCATION="中国温州"
TIMEZONE="中国（UTC+8）"
COMPETITOR_NAME="Beltwin"
PIPELINE_DATA_PATH="C:/Users/${OWNER_NAME:-user}/WorkBuddy/"

# ── 解析命令行参数 ──
while [[ $# -gt 0 ]]; do
  case "$1" in
    --owner-name)       OWNER_NAME="$2"; shift 2 ;;
    --display-name)     OWNER_DISPLAY_NAME="$2"; shift 2 ;;
    --company-name)     COMPANY_NAME="$2"; shift 2 ;;
    --company-full)     COMPANY_FULL_NAME="$2"; shift 2 ;;
    --brand)            BRAND_NAME="$2"; shift 2 ;;
    --email)            OWNER_EMAIL="$2"; shift 2 ;;
    --phone)            OWNER_PHONE="$2"; shift 2 ;;
    --github)           GITHUB_USER="$2"; shift 2 ;;
    --factory-location) FACTORY_LOCATION="$2"; shift 2 ;;
    --timezone)         TIMEZONE="$2"; shift 2 ;;
    --competitor)       COMPETITOR_NAME="$2"; shift 2 ;;
    --pipeline-path)    PIPELINE_DATA_PATH="$2"; shift 2 ;;
    *) echo "未知参数: $1"; exit 1 ;;
  esac
done

# ── 从 .env 文件读取（如存在且无命令行参数）──
if [[ $# -eq 0 ]] && [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# ── 变量映射 ──
declare -A VARS
VARS=(
  [OWNER_NAME]="$OWNER_NAME"
  [OWNER_DISPLAY_NAME]="$OWNER_DISPLAY_NAME"
  [COMPANY_NAME]="$COMPANY_NAME"
  [COMPANY_FULL_NAME]="$COMPANY_FULL_NAME"
  [BRAND_NAME]="$BRAND_NAME"
  [OWNER_EMAIL]="$OWNER_EMAIL"
  [OWNER_PHONE]="$OWNER_PHONE"
  [GITHUB_USER]="$GITHUB_USER"
  [FACTORY_LOCATION]="$FACTORY_LOCATION"
  [TIMEZONE]="$TIMEZONE"
  [COMPETITOR_NAME]="$COMPETITOR_NAME"
  [PIPELINE_DATA_PATH]="$PIPELINE_DATA_PATH"
)

# ── 每个模板文件使用的变量 ──
declare -A FILE_VARS
FILE_VARS=(
  [USER.md]="OWNER_NAME COMPANY_NAME BRAND_NAME OWNER_EMAIL OWNER_PHONE GITHUB_USER TIMEZONE"
  [IDENTITY.md]="OWNER_DISPLAY_NAME COMPANY_NAME FACTORY_LOCATION BRAND_NAME COMPANY_FULL_NAME"
  [AGENTS.md]="COMPANY_NAME OWNER_DISPLAY_NAME OWNER_PHONE OWNER_EMAIL"
  [TOOLS.md]="OWNER_EMAIL PIPELINE_DATA_PATH"
  [SOUL.md]="OWNER_NAME"
  [MEMORY.md]="OWNER_NAME OWNER_DISPLAY_NAME"
  [HEARTBEAT.md]="OWNER_EMAIL COMPETITOR_NAME"
)

# ── 执行替换 ──
for file in "${!FILE_VARS[@]}"; do
  src="$TEMPLATE_DIR/${file%.md}.template.md"
  dst="$TEMPLATE_DIR/$file"
  if [[ ! -f "$src" ]]; then
    echo "⚠️  跳过 $file（模板不存在: $src）"
    continue
  fi

  content=$(cat "$src")
  for var in ${FILE_VARS[$file]}; do
    val="${VARS[$var]}"
    content=$(echo "$content" | sed "s/\${$var}/$val/g")
  done
  echo "$content" > "$dst"
  echo "✅ $file"
done

echo ""
echo "Done. 所有 workspace 配置已生成。"
echo "生成文件数: ${#FILE_VARS[@]}"
