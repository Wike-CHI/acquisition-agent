# HEARTBEAT — 13个定时任务配置

> 版本: v1.0 | 日期: 2026-03-31
> 本文件定义红龙获客系统的所有定时任务，与 `context/heartbeat.template.json` 保持同步。

---

## 定时任务清单

| # | 任务名称 | 调度规则 | 功能描述 | 优先级 |
|---|---------|---------|---------|--------|
| 1 | `gmail_inbox_check` | `*/1 * * * *` | Gmail 新回复检测，提醒业务员回复 | P1 |
| 2 | `whatsapp_expiry_check` | `*/1 * * * *` | WhatsApp 24h 超时警告 | P1 |
| 3 | `token_monitor` | `*/1 * * * *` | Token ≥ 65% 触发主动摘要（L2）| P0 |
| 4 | `memory_sync` | `*/5 * * * *` | 内存同步 MemOS + CRM | P1 |
| 5 | `stale_lead_detection` | `0 * * * *` | 停滞线索检测（超 7 天无进展）| P1 |
| 6 | `quote_followup` | `0 * * * *` | 报价跟踪（超 14 天无响应）| P1 |
| 7 | `lead_discovery` | `0 10 * * *` | 新客户发现任务 | P1 |
| 8 | `email_sequence_check` | `0 11 * * *` | drip campaign 检查 | P2 |
| 9 | `crm_snapshot` | `0 12 * * *` | ChromaDB 快照备份（L4）| P0 |
| 10 | `memory_health_check` | `0 14 * * *` | Token/摘要统计报告 | P2 |
| 11 | `stale_memory_cleanup` | `0 3 * * *` | 90 天休眠客户清理 | P2 |
| 12 | `competitor_intel` | `0 18 * * 5` | 竞品情报收集（每周五 18:00）| P2 |
| 13 | `nurture_check` | `0 9 * * 1` | 待培育客户检查（每周一 09:00）| P2 |

---

## 任务详情

### P0 — 关键任务

#### task-3: token_monitor（令牌监控）
```yaml
name: token_monitor
schedule: "*/1 * * * *"
priority: P0
action: |
  检查所有活跃对话的 Token 使用率
  IF Token ≥ 65%:
    - 触发主动摘要（L2）
    - 记录触发原因
    - 通知业务员（可选）
```

#### task-9: crm_snapshot（CRM快照）
```yaml
name: crm_snapshot
schedule: "0 12 * * *"
priority: P0
action: |
  1. 读取完整 CRM 管道（所有客户状态）
  2. 生成摘要快照
  3. 调用 chroma:snapshot 存入 ChromaDB
  4. 记录快照时间戳
  5. 检查是否有逾期承诺需要跟进
```

### P1 — 重要任务

#### task-1: gmail_inbox_check（Gmail 新回复检测）
```yaml
name: gmail_inbox_check
schedule: "*/1 * * * *"
priority: P1
action: |
  1. 读取 Gmail 收件箱（上次检查时间之后的新邮件）
  2. 按客户分类（根据邮件主题/发件人）
  3. 识别意图（询价/报价回复/技术问题/投诉）
  4. 更新对应客户的 MemOS（L1）
  5. 未读新邮件超过 3 封 → 提醒业务员
```

#### task-2: whatsapp_expiry_check（WhatsApp 超时检测）
```yaml
name: whatsapp_expiry_check
schedule: "*/1 * * * *"
priority: P1
action: |
  1. 扫描所有 WhatsApp 待回复消息
  2. 计算距上次回复的时间间隔
  3. 距 24h 剩余 < 2h → 红色警告
  4. 已超时 → 立即提醒业务员
  5. 自动记录超时客户
```

#### task-4: memory_sync（内存同步）
```yaml
name: memory_sync
schedule: "*/5 * * * *"
priority: P1
action: |
  1. 扫描所有活跃对话
  2. 将最新 MemOS 提取结果同步到:
     - MemOS 持久化存储
     - CRM 客户记录
  3. 同步置信度 < 90% 的记录 → 标记待复核
```

#### task-5: stale_lead_detection（停滞线索检测）
```yaml
name: stale_lead_detection
schedule: "0 * * * *"
priority: P1
action: |
  1. 扫描所有客户
  2. 计算距上次联系日期
  3. 超 7 天无进展 且 stage != closed:
     - 生成跟进建议
     - 记录停滞原因（如有）
     - 标记为"待激活"
  4. 超 30 天无进展 → 降级处理
```

#### task-6: quote_followup（报价跟踪）
```yaml
name: quote_followup
schedule: "0 * * * *"
priority: P1
action: |
  1. 扫描所有已发报价的客户
  2. 计算距发报价日期
  3. 距报价日期:
     - 7 天 → 发送跟进邮件草稿（待业务员确认）
     - 14 天 → 红色警告 + 建议激活策略
     - 30 天 → 记录为"无响应"
  4. 更新报价状态标签
```

### P2 — 常规任务

#### task-7: lead_discovery（客户发现）
```yaml
name: lead_discovery
schedule: "0 10 * * *"
priority: P1
action: |
  1. 按计划的市场关键词执行 Exa 搜索
  2. 去重过滤（与现有客户比较）
  3. 快速 ICP 评分（6维）
  4. 符合条件的新客户加入待开发队列
  5. 生成日报
```

#### task-8: email_sequence_check（邮件序列检查）
```yaml
name: email_sequence_check
schedule: "0 11 * * *"
priority: P2
action: |
  1. 扫描所有 drip campaign 状态
  2. 检查每个序列的时间触发点
  3. 触发下一步 → 加入 delivery-queue
  4. 报告本周序列进度
```

#### task-10: memory_health_check（内存健康检查）
```yaml
name: memory_health_check
schedule: "0 14 * * *"
priority: P2
action: |
  1. 统计今日 Token 使用情况
  2. 统计主动摘要触发次数（> 50 告警）
  3. ChromaDB 检索命中率统计（< 70% 告警）
  4. 生成每日内存健康报告
```

#### task-11: stale_memory_cleanup（休眠客户清理）
```yaml
name: stale_memory_cleanup
schedule: "0 3 * * *"
priority: P2
action: |
  1. 扫描所有客户
  2. 距最后更新 > 90 天 → 标记为"休眠"
  3. 生成休眠客户报告
  4. 可选：发送最后一次激活邮件
```

#### task-12: competitor_intel（竞品情报）
```yaml
name: competitor_intel
schedule: "0 18 * * 5"
priority: P2
action: |
  1. 搜索工业皮带行业竞品动态
  2. 收集新产品发布、价格调整、营销活动
  3. 更新竞品数据库
  4. 生成竞品周报
```

#### task-13: nurture_check（培育检查）
```yaml
name: nurture_check
schedule: "0 9 * * 1"
priority: P2
action: |
  1. 扫描所有"待培育"客户
  2. 按培育序列生成跟进内容建议
  3. 更新培育状态
  4. 提醒业务员本周培育计划
```

---

## 执行控制层（ECL）监控

每个 HEARTBEAT 任务都受 ECL 监控：

| 监控项 | 阈值 | 动作 |
|--------|------|------|
| 任务执行时长 | > 5 分钟 | 告警 + 中断 |
| 连续失败次数 | ≥ 3 次 | 暂停任务 + 告警 |
| 循环检测 | 同一客户 > 3 次/天 | 触发 ECL 介入 |
| 置信度 | < 80% | 降级处理 + 人工复核 |

---

## 调度格式

遵循 crontab 格式：

```
┌───────────── 分钟（0-59）
│ ┌─────────── 小时（0-23）
│ │ ┌───────── 日期（1-31）
│ │ │ ┌─────── 月份（1-12）
│ │ │ │ ┌───── 星期（0-6，0=周日）
│ │ │ │ │
* * * * *
```

所有任务通过 `context/heartbeat.template.json` 中的 `cron_jobs` 字段配置。
