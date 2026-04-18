#!/usr/bin/env bash
# cleanup-user.sh — 清理业务员生成的 workspace 配置文件
#
# 使用方式：
#   bash workspace/cleanup-user.sh
#   bash workspace/cleanup-user.sh --force  (跳过确认)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FORCE=false
[[ "${1:-}" == "--force" ]] && FORCE=true

FILES=(USER.md IDENTITY.md AGENTS.md TOOLS.md SOUL.md MEMORY.md HEARTBEAT.md)
found=0

for f in "${FILES[@]}"; do
  if [[ -f "$SCRIPT_DIR/$f" ]]; then
    ((found++))
  fi
done

if [[ $found -eq 0 ]]; then
  echo "没有找到已生成的配置文件，无需清理。"
  exit 0
fi

echo "将删除以下业务员配置文件："
for f in "${FILES[@]}"; do
  if [[ -f "$SCRIPT_DIR/$f" ]]; then
    echo "  - $f"
  fi
done
echo ""

if [[ "$FORCE" == "false" ]]; then
  read -rp "确认删除？(y/N) " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "已取消。"
    exit 0
  fi
fi

for f in "${FILES[@]}"; do
  if [[ -f "$SCRIPT_DIR/$f" ]]; then
    rm -f "$SCRIPT_DIR/$f"
    echo "🗑️  已删除 $f"
  fi
done

echo ""
echo "Done. 已清理 $found 个配置文件。"
echo "下次运行 初始化获客系统 时会重新生成。"
