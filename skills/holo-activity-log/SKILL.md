---
name: holo-activity-log
version: 1.0.0
description: 记录业务操作日志到NAS共享活动日志（CSV），供Boss监控页面读取
trigger: 被其他技能调用（不直接触发）
tags:
  - logging
  - nas
  - monitoring
triggers:
  - holo-activity-log
  - 活动日志
  - 操作日志
  - BOSS监控日志
  - 业务日志
---

# holo-activity-log

> **Skill Graph：** 领域 → [[_index-acquisition|核心获客领域]] | 上游 ← [[_index-operations|运营领域]] | 下游 → [[daily-report-writer|日报生成]]（数据源）


> **系统技能** — 被 acquisition-workflow 及其他业务技能自动调用，不直接面向用户。

记录每个业务动作到 NAS 共享活动日志，供团队主管在 BOSS 监控页面查看。

## 功能

- 将操作记录追加到 `\\192.168.0.98\AI数据\activity\YYYY-MM-DD.csv`
- 自动检测设备标识（`用户名@IP`）
- NAS 不可用时降级到本地 `~/.openclaw/activity/`

## 参数

| 参数 | 必填 | 说明 |
|------|:----:|------|
| `action_type` | 是 | 动作类型：`search` / `email` / `research` / `icp_score` / `email_gen` / `email_send` / `quote` / `report` |
| `result` | 是 | 结果：`success` / `failed` / `partial` |
| `customer` | 推荐 | 客户名称 |
| `score` | 可选 | 数值（搜索结果数、ICP分数等） |
| `notes` | 可选 | 补充说明 |
| `skill_name` | 推荐 | 触发此日志的技能名 |

## 执行步骤

### Step 1: 记录日志

调用 PowerShell 脚本：

```powershell
powershell -File "{{SKILL_DIR}}/scripts/log-activity.ps1" `
  -ActionType "{{action_type}}" `
  -Customer "{{customer}}" `
  -Result "{{result}}" `
  -Score {{score}} `
  -Notes "{{notes}}" `
  -SkillName "{{skill_name}}"
```

### Step 2: 确认结果

检查脚本返回的 JSON：
- `success: true` → 日志已写入
- `success: false` → 降级到本地，不影响主流程

## CSV 格式

```csv
timestamp,device,action_type,customer,result,score,notes,skill_name
"2026-04-20 14:30:00","admin@192.168.0.100","search","非洲矿业","success","12","找到12家潜在客户","exa-web-search-free"
"2026-04-20 14:35:00","admin@192.168.0.100","research","National Cement","success","85","ICP 85分 A级","company-research"
```

## 何时调用

| 场景 | action_type | 触发技能 |
|------|-------------|---------|
| 搜索客户完成 | `search` | exa-web-search-free, teyi-customs |
| 邮箱验证完成 | `email` | email-verifier |
| 企业背调完成 | `research` | company-research, deep-research |
| ICP评分完成 | `icp_score` | customer-intelligence |
| 开发信生成 | `email_gen` | cold-email-generator |
| 邮件发送 | `email_send` | email-sender |
| 报价完成 | `quote` | smart-quote, quotation-generator |
| 日报生成 | `report` | daily-report-writer |

## 降级策略

NAS 不可达时自动降级到本地 `~/.openclaw/activity/`，不阻断调用方的主流程。
