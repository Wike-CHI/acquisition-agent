# OpenClaw 升级指南 — acquisition-agent

> 红龙 HOLO Agent 的 OpenClaw 上游升级安全流程。
> 严格遵循每一步——跳过备份或验证步骤已经导致过生产事故。

## Pre-Upgrade Checklist

```bash
# 1. 备份配置（务必第一步执行）
cp -r ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak
cp -r ~/.openclaw/exec-approvals.json ~/.openclaw/exec-approvals.json.bak

# 2. 查看 changelog 中的 breaking changes
openclaw changelog
# 关注: config key 重命名、移除字段、新增必填字段、
# 权限模型变更、plugin API 变更

# 3. 记录当前版本
openclaw --version

# 4. 备份 acquisition-agent 技能库
cp -r ~/.openclaw/skills/acquisition ~/.openclaw/skills/acquisition.bak
```

## Upgrade

```bash
# 5. 安装新版本
npm install -g openclaw@latest

# 6. 刷新 Gateway 服务令牌（v2026.4.1 起必需）
openclaw gateway install --force

# 7. 运行 doctor
openclaw doctor

# 8. 重启 Gateway
openclaw gateway restart
```

## Post-Upgrade Verification

```bash
# 9. 验证 Gateway 存活
curl -s http://localhost:18789/health
# 预期: {"ok":true,"status":"live"}

# 10. 验证 WhatsApp/Telegram 通道
openclaw channels status
# WhatsApp 和 Telegram 均应显示 "running"

# 11. 验证 exec approvals
openclaw approvals get
# 应显示: security=full, ask=off, askFallback=full

# 12. 验证技能库完整性
ls ~/.openclaw/skills/acquisition/ | wc -l
# 应与升级前一致

# 13. 检查技能加载警告
openclaw doctor 2>&1 | grep -i "skip\|error\|warn"
```

## Rollback

```bash
# 恢复配置
cp ~/.openclaw/openclaw.json.bak ~/.openclaw/openclaw.json
cp ~/.openclaw/exec-approvals.json.bak ~/.openclaw/exec-approvals.json

# 降级
npm install -g openclaw@<previous-version>

# 重启
openclaw gateway install --force
openclaw gateway restart
```

## 对 acquisition-agent 的影响评估清单

升级后必须验证以下获客关键路径：

| 路径 | 验证方法 | 通过标准 |
|------|---------|---------|
| WhatsApp 发送 | 发送测试消息到测试号码 | 消息成功送达 |
| Telegram 通知 | 触发 Telegram bot 通知 | 消息成功接收 |
| 技能加载 | `/skills` 命令列出全部技能 | 84 个活跃技能可见 |
| Agent 生成 | 生成一个子 agent 执行简单任务 | Agent 正常生成并返回 |
| 记忆系统 | 写入 → 查询一条记忆 | 记忆可正确召回 |
| 浏览器 | `/browse` 打开测试页面 | 页面正常加载 |

## Known Issues by Version

### 2026.4.20

**安全关键升级。** 关闭多个 env 注入向量，扩展 config mutation guard，WebSocket 范围强化。

| 变更/功能 | 说明 | 对 acquisition-agent 的影响 |
|-----------|------|---------------------------|
| `OPENCLAW_*` 键在 workspace `.env` 中被阻止 | 所有 `OPENCLAW_*` env + `MINIMAX_API_HOST` 在非可信 `.env` 中被阻止 | 如技能中的 .env 文件使用了这些键，迁移到系统环境变量或 `openclaw.json` |
| Config mutation guard 扩展 | 来自 model agent 的 `config.patch`/`config.apply` 调用无法覆写 operator 可信路径 | 安全改进，无需操作 |
| WebSocket `operator.read` 要求 | Chat/agent/tool-result WebSocket 帧需要 `operator.read` scope | 如自定义 WebSocket 客户端不带此 scope，需添加 |
| Cron state 拆分到 `jobs-state.json` | 运行时执行状态从 `jobs.json` 定义中分离 | 如使用 cron 心跳巡检，确认 cron 任务正常运行 |
| Telegram 轮询 watchdog 90s → 120s | `channels.telegram.pollingStallThresholdMs` 提高 | Telegram 通道稳定性改善，无需操作 |

### 2026.4.10

**无 breaking changes。** 可安全升级——新功能 opt-in，126 个安全修复自动应用。

| 变更/功能 | 说明 | 对 acquisition-agent 的影响 |
|-----------|------|---------------------------|
| Active Memory 插件 | 新 opt-in 插件，默认禁用 | 建议启用：`plugins.active-memory.enabled: true`，增强获客 agent 记忆连贯性 |
| Codex provider for GPT-5 | `codex/gpt-*` 路由使用新 Codex provider | 如通过 `openai` provider 使用 GPT-5，迁移 model ID 到 `codex/gpt-5` |
| 126 安全 + 稳定性修复 | WhatsApp media、Gateway 稳定性等 | 直接受益——WhatsApp 获客通道更稳定 |

### 2026.4.9

**Breaking change: workspace `.env` 运行时控制 env var 被阻止。**

| 问题/变更 | 症状 | 修复 |
|-----------|------|------|
| Workspace `.env` 运行时控制 var 被静默忽略 | 通过 `.env` 的配置覆盖（如 `OPENCLAW_GATEWAY_PORT`）升级后无效 | 将这些 var 移到系统环境变量或 `openclaw.json` |
| SSRF 隔离绕过修复 | agent 或恶意页面可通过模拟点击绕过目的地检查 | 自动修复——安全改善 |
| OpenAI reasoning effort 默认 `high` | OpenAI 用户可能看到更高 token 消耗 | 如需控制成本，显式设置 `reasoningEffort: "medium"` |

### 2026.4.8

**无 breaking changes。** 仅修复，可安全升级。

| 修复的问题 | 症状 (v2026.4.7) | 说明 |
|-----------|------------------|------|
| 跨域重定向密钥泄露 | 307/308 重定向时 auth token 泄露 | 自动修复 |
| Telegram 设置失败 | `Cannot find module './dist/...'` | 已修复 |
| Claude thinking blocks 被丢弃 | Opus 4.5+ 推理能力回退 | 已修复——保持最高推理质量 |

### 2026.4.1

| 问题 | 症状 | 修复 |
|------|------|------|
| Gateway 嵌入式 token 过期 | `exec approval followup dispatch failed: gateway timeout` | `openclaw gateway install --force` |
| Skill symlink 安全检查 | `Skipping skill path` (大量警告) | 移除 `~/.openclaw/skills/` 中的外部 symlink |
| Telegram dmPolicy 默认值 | `dmPolicy: "pairing"` 阻止新联系人 | 改为 `"open"` + 添加 `allowFrom: ["*"]` |

## 完全重建（核选项）

如果手动修复不够，从模板完全重建：

```bash
cd acquisition-agent
# 完全重新同步技能库到 OpenClaw
# 这会清除并重建 ~/.openclaw/skills/acquisition/
# 确保先备份自定义配置
```

> **注意**: acquisition-agent 的技能库通过 holo-agent 的 `bundle-acquisition-skills.mjs` 打包，升级 OpenClaw 后可能需要重新打包以适配新版本。
