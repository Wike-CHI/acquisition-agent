# ANTI-AMNESIA — 4层抗遗忘系统技术规范 v2.0

> 版本: v2.0 | 日期: 2026-03-31 | 来源: 红龙获客系统 v2.1.0
> 基于 PulseAgent x OpenClaw B2B SDR Digital Worker 规范，专注文工业皮带行业。

---

## 概述

红龙获客系统是一个 AI 驱动的 B2B 外贸获客系统，需要在多轮对话、跨会话、长时间跨度（数月）内保持客户记忆的完整性和连续性。**4层抗遗忘系统**确保在任何情况下都不会丢失关键客户信息。

---

## 四层架构

```
┌─────────────────────────────────────────────────────────────┐
│                     ANTI-AMNESIA 4层                        │
├─────────┬───────────────────────┬───────────────────────────┤
│  L1     │ MemOS 结构化记忆       │ 每轮对话自动提取/注入        │
│  L2     │ 主动摘要压缩           │ Token ≥ 65% 触发           │
│  L3     │ ChromaDB 向量存储      │ 每轮存储 + 语义检索          │
│  L4     │ CRM 每日快照           │ 每天 12:00 灾难恢复          │
├─────────┴───────────────────────┴───────────────────────────┤
│  铁律：无邮箱不进入开发信步骤                                  │
│  ECL监控：轨迹追踪 + 循环检测 + 置信度 + 状态变化             │
└─────────────────────────────────────────────────────────────┘
```

---

## L1: MemOS 结构化内存

### 目的
关键业务状态持久化，每轮对话自动提取并注入上下文。

### 内存模式

```
客户会话 {
  customer_id: string        // 客户唯一标识
  company: string            // 公司名称
  contact: string            // 联系人
  email: string             // 邮箱（铁律：无邮箱不进入开发信）
  source: string            // 来源渠道（LinkedIn/Google/Facebook/展会...）
  stage: string              // 当前阶段（discovery/qualifying/proposal/negotiation/closed）

  // BANT
  budget: string?
  authority: string?
  need: string?
  timeline: string?

  // 对话状态
  interests: string[]       // 产品兴趣列表
  objections: string[]       // 异议记录
  commitments: string[]      // 承诺记录（样品/报价/拜访...）
  quotes_sent: Quote[]      // 已发报价

  // 元数据
  last_contact: timestamp
  next_action: string
  last_update: timestamp
}
```

### 执行时机
- **消息到达** → 读取 MemOS（L1）
- **回复生成后** → 更新 MemOS（L1）
- **每轮对话后** → 自动提取并持久化

### 触发条件
每轮对话结束后，AI 自动执行内存提取，无需人工干预。

---

## L2: 主动摘要压缩

### 目的
Token 使用率 ≥ 65% 时触发，零信息损失的摘要压缩。

### 压缩规则

| 保留 | 压缩 |
|------|------|
| 客户身份、BANT 信息 | 闲聊、寒暄 |
| 承诺、报价、异议 | 重复表述 |
| 关键数字（价格/数量/规格）| 冗长解释 |
| 决策人信息 | 礼貌性重复 |

### 检测机制
```
cron_jobs:
  - name: "token_monitor"
    schedule: "*/1 * * * *"     # 每分钟检测
    action: 检查所有活跃对话的 Token 使用率，超过 65% 立即执行主动摘要
```

### 触发时机
- 实时 Token 使用率计算
- 65% 阈值触发主动压缩
- 摘要生成后替换历史消息

---

## L3: ChromaDB 向量存储

### 目的
每轮对话永久存储，支持跨会话语义检索。

### 核心命令

| 命令 | 描述 |
|------|------|
| `chroma:store` | 存储一轮对话（每轮后自动调用）|
| `chroma:search <query>` | 跨对话历史语义搜索 |
| `chroma:recall <customer_id>` | 回访客户召回历史（间隔 > 7 天自动触发）|
| `chroma:snapshot` | 每日 CRM 快照（L4）|
| `chroma:stats` | 存储统计信息 |

### 存储字段

```json
{
  "customer_id": "string",
  "turn": 1,
  "user_message": "string",
  "agent_response": "string",
  "stage": "discovering|qualifying|proposal|negotiation|closed",
  "topic": "pricing|technical|logistics|comparison|objection|other",
  "auto_tags": ["has_quote", "has_commitment", "has_objection", "has_order", "has_sample"],
  "timestamp": "ISO8601"
}
```

### 客户隔离
所有数据按 `customer_id` 分区，任何查询自动包含 `where={"customer_id": ...}` 条件，确保严格的租户数据隔离。

### 自动标签

| 标签 | 触发条件 |
|------|---------|
| `has_quote` | 讨论价格/成本/报价时 |
| `has_commitment` | 任何一方做出承诺时 |
| `has_objection` | 检测到客户异议时 |
| `has_order` | 确认订单/购买时 |
| `has_sample` | 讨论样品请求时 |

### 检索触发时机
- 客户引用过去事件时
- 对话间隔 > 7 天时
- 承诺逾期未履行时

---

## L4: CRM 每日快照

### 目的
灾难恢复，每天中午 12:00 备份完整管道状态到 ChromaDB。

### 执行方式

```yaml
cron_jobs:
  - name: "crm_snapshot"
    schedule: "0 12 * * *"     # 每天 12:00
    action: 读取完整 CRM 管道，存储摘要快照到 ChromaDB
```

### 快照内容
- 所有客户的当前阶段
- 未解决的承诺
- 待跟进的异议
- 报价未响应天数统计

### 回退机制
当 L1/L3 发生故障时，从 L4 快照恢复最近一次完整状态。

---

## 循环检测机制

### 令牌监控循环

```yaml
cron_jobs:
  - name: "token_monitor"
    schedule: "*/1 * * * *"     # 每分钟
    action: 检查所有活跃对话 Token，超过 65% 立即摘要
```

### 内存同步循环

```yaml
cron_jobs:
  - name: "memory_sync"
    schedule: "*/5 * * * *"     # 每 5 分钟
    action: 将活跃对话的最新内存同步到 MemOS 和 CRM
```

### 陈旧内存清理

```yaml
cron_jobs:
  - name: "stale_memory_cleanup"
    schedule: "0 3 * * *"       # 每天凌晨 3:00
    action: 检查 90 天未更新的客户内存，标记为休眠并生成报告
```

---

## 四层集成流程

```
新消息到达
    ↓
读取 MemOS（L1） → 注入客户上下文
    ↓
检查历史检索需求 → ChromaDB 召回（L3）
    ↓
检查 Token 使用率 → 主动摘要触发（L2）
    ↓
Agent 生成回复
    ↓
后处理：
  ├─ 更新 MemOS（L1）
  ├─ 存储 ChromaDB（L3）
  └─ 同步 CRM
    ↓
每日 12:00 → CRM 快照（L4）
```

---

## HEARTBEAT 定时任务（13个）

详见 `context/heartbeat.template.json`

| 时间 | 任务 | 功能 |
|------|------|------|
| 每分钟 | `gmail_inbox_check` | Gmail 新回复检测 |
| 每分钟 | `whatsapp_expiry_check` | WhatsApp 24h 超时警告 |
| 每分钟 | `token_monitor` | Token ≥ 65% 触发摘要（L2）|
| 每5分钟 | `memory_sync` | 内存同步 MemOS + CRM |
| 每小时 | `stale_lead_detection` | 停滞线索检测（超 7 天）|
| 每小时 | `quote_followup` | 报价跟踪（超 14 天）|
| 每天 10:00 | `lead_discovery` | 新客户发现任务 |
| 每天 11:00 | `email_sequence_check` | drip campaign 检查 |
| 每天 12:00 | `crm_snapshot` | ChromaDB 快照（L4）|
| 每天 14:00 | `memory_health_check` | Token/摘要统计 |
| 每天 03:00 | `stale_memory_cleanup` | 90 天休眠客户清理 |
| 每周五 | `competitor_intel` | 竞品情报收集 |
| 每周一 | `nurture_check` | 待培育客户检查 |
| 每月1日 | `monthly_report` | 月度汇总报告 |

---

## 监控指标

| 指标 | 告警阈值 |
|------|---------|
| 内存提取成功率 | < 95% |
| 主动摘要触发次数/天 | > 50 次（需调查）|
| ChromaDB 检索命中率 | < 70% |
| 客户"你不记得"计数 | > 0（立即调查）|

---

## 相关技能索引

| 技能 | 位置 | 实现层 |
|------|------|--------|
| `chroma-memory` | `skills/chroma-memory/` | L3 + L4 |
| `supermemory` | `skills/supermemory/` | L1 增强 |
| `delivery-queue` | `skills/delivery-queue/` | 分段发送 |

---

## 验证检查表

- [ ] 单会话长对话（> 50 轮）记忆保留测试
- [ ] 跨会话（间隔 > 7 天）记忆连续性测试
- [ ] 承诺跟踪能力测试
- [ ] 矛盾信息处理测试
- [ ] Token 65% 阈值压缩测试
- [ ] ChromaDB 检索命中率测试
