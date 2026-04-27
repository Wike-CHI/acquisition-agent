#!/bin/bash
# Daily Upstream Sync Monitor — acquisition-agent
# 从 openclaw/openclaw 拉取新提交并生成结构化报告
# 用法: ./scripts/daily-sync.sh [--report-only]
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SYNC_DIR="$REPO_DIR/.sync"
LAST_COMMIT_FILE="$SYNC_DIR/last-synced-commit"
REPORT_FILE="$SYNC_DIR/latest-report.md"
COMPETITOR_INTEL="$SYNC_DIR/competitor-intel.md"

cd "$REPO_DIR"

# 确保 upstream remote 存在
if ! git remote get-url upstream &>/dev/null; then
  git remote add upstream https://github.com/openclaw/openclaw.git
fi

# 读取上次同步的提交
if [ ! -f "$LAST_COMMIT_FILE" ]; then
  echo "❌ 未找到基线提交。请先运行初始设置。"
  echo "   echo 'FIRST_RUN' > $LAST_COMMIT_FILE"
  exit 1
fi

LAST_SHA=$(cat "$LAST_COMMIT_FILE" | tr -d '[:space:]')

# 通过 GitHub API 获取上游提交（避免慢速 git fetch）
echo "🔍 获取 openclaw/openclaw 上游提交（自 $LAST_SHA 起）..."
COMMITS_JSON=$(gh api "repos/openclaw/openclaw/commits?per_page=100" 2>/dev/null || echo "[]")

if [ "$COMMITS_JSON" = "[]" ]; then
  echo "⚠️  GitHub API 返回空或不可达，跳过本次同步。"
  exit 0
fi

# 找出新提交（LAST_SHA 之前的所有提交）
NEW_COMMITS=$(echo "$COMMITS_JSON" | jq -r --arg last "$LAST_SHA" '
  . as $all |
  ($all | to_entries | map(select(.value.sha == $last)) | .[0].key // length) as $idx |
  if $idx == 0 then empty
  else
    $all[:$idx] | reverse | .[] |
    "\(.sha[0:7]) | \(.commit.author.name) | \(.commit.message | split("\n")[0])"
  end
')

if [ -z "$NEW_COMMITS" ]; then
  echo "✅ 自从上次同步以来没有新提交。"
  exit 0
fi

COMMIT_COUNT=$(echo "$NEW_COMMITS" | wc -l | tr -d ' ')
LATEST_SHA=$(echo "$COMMITS_JSON" | jq -r '.[0].sha')

echo "📊 发现 $COMMIT_COUNT 个新提交"

# 生成结构化报告
cat > "$REPORT_FILE" << REPORT_HEADER
# Upstream Sync Report — $(date +%Y-%m-%d)

**Source**: openclaw/openclaw (main)
**Last synced**: $LAST_SHA
**Latest upstream**: $LATEST_SHA
**New commits**: $COMMIT_COUNT

## Commit Log

| SHA | Author | Message |
|-----|--------|---------|
$(echo "$NEW_COMMITS" | while IFS='|' read -r sha author msg; do
  echo "| $sha |$author |$msg |"
done)

## 分类（供 AI 分析）

将每个提交分类：
- **RELEVANT** — 影响 WhatsApp/Telegram/Email 通道、CRM、多租户、部署脚本、安全补丁
- **WATCH** — 通用平台改进、Bug 修复、CI/CD 变更（值得关注）
- **SKIP** — 无关（Discord、iMessage、Signal、Line、Zalo、内部重构）

## 对 acquisition-agent 的影响分析

RELEVANT 提交需要评估对以下模块的影响：
1. **获客通道**: WhatsApp/Telegram/Email 发送与接收稳定性
2. **技能运行时**: Agent spawn/routing 变更是否影响技能执行
3. **安全**: SSRF、密钥管理等安全补丁是否需立即跟进
4. **部署**: 打包脚本、Electron 集成是否需要适配

## Action Items

对 RELEVANT 提交：
1. 评估对 acquisition-agent 技能库的影响
2. 更新 CHANGELOG.md
3. 如有安全补丁，标记为优先升级

REPORT_HEADER

echo ""
echo "📋 报告已保存到: $REPORT_FILE"

# 输出报告摘要
echo ""
echo "====== 摘要 ======"
echo "新增提交: $COMMIT_COUNT"
echo "最新上游 SHA: ${LATEST_SHA:0:7}"
echo "=================="

# 除非是 --report-only 模式，否则更新 last-synced-commit
if [[ "${1:-}" != "--report-only" ]]; then
  echo "$LATEST_SHA" > "$LAST_COMMIT_FILE"
  echo ""
  echo "✅ 已更新 last-synced-commit 为: ${LATEST_SHA:0:7}"
fi

# 更新 CHANGELOG.md 中的上游跟踪信息
if [ -f "$REPO_DIR/CHANGELOG.md" ] && [[ "${1:-}" != "--report-only" ]]; then
  echo ""
  echo "💡 提示：在 CHANGELOG.md 中添加本次同步记录。"
fi
