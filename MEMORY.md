# MEMORY.md — 红龙获客系统 4层防遗忘记忆协议

> 红龙获客系统的记忆架构，确保跨会话客户信息永不丢失。
> 基于 B2B-SDR template 的 ANTI-AMNESIA.md 改造，适配红龙业务场景。

---

## 记忆架构总览

```
消息进入
  → L0 Active Memory sub-agent（可选，OpenClaw v2026.4.10+）
  → L1 MemOS 结构化记忆（对话开始自动注入）
  → L2 双阈值压缩（50%后台保存 / 65%全文压缩）
  → L3 ChromaDB 向量存储（每轮对话永久存档）
  → L4 CRM 每日快照（12:00 灾难恢复）
```

---

## L1 — MemOS 结构化记忆

### 客户会话 JSON Schema

每个客户维护一个结构化记忆对象：

```json
{
  "memory_type": "customer_session",
  "customer_id": "{{whatsapp_phone or email}}",
  "last_updated": "{{ISO_8601_timestamp}}",
  "version": 1,

  "identity": {
    "name": "",
    "company": "",
    "role": "",
    "language": "",
    "country": "",
    "timezone": ""
  },

  "bant": {
    "budget": "",
    "authority": "",
    "need": "",
    "timeline": ""
  },

  "conversation_state": {
    "stage": "first_contact | qualifying | quoted | negotiating | closed_won | closed_lost | nurture",
    "last_topic": "",
    "pending_action": "",
    "next_followup_date": "",
    "human_escalation_needed": false
  },

  "product_interest": {
    "products_discussed": [],
    "preferred_specs": {},
    "moq_discussed": "",
    "price_range_discussed": "",
    "samples_requested": false,
    "quotes_sent": []
  },

  "objections_log": [
    {
      "objection": "",
      "response_given": "",
      "resolved": false,
      "timestamp": ""
    }
  ],

  "commitments": [
    {
      "who": "agent | customer",
      "what": "",
      "by_when": "",
      "status": "pending | done | overdue"
    }
  ],

  "key_facts": []
}
```

### 读取规则（对话开始时）

1. 按 `customer_id`（电话或邮箱）查询 MemOS
2. 有记录 → 提取结构化字段，注入到 System Prompt
3. 无记录 → 新建空白 customer_session
4. 返回客户时：`chroma:recall` + `memory:search` 补全上下文

### 写入规则（每轮对话结束时）

1. 提取本轮新增信息（只更新有变化的字段）
2. 矛盾信息：覆盖旧数据，同时记录到 `key_facts`
3. `conversation_state.stage` 只能前进，不能后退（除非客户明确说不再有兴趣）
4. 过期承诺（`by_when` 已过且仍为 pending）→ 自动标记为 `overdue`

### 模板注入格式

对话开始时，将以下结构化内容注入 Agent 上下文：

```
## 客户记忆快照（自动注入）

[客户] {{identity.name}} | {{identity.company}} | {{identity.role}}
[语言] {{identity.language}} | [时区] {{identity.timezone}}
[阶段] {{conversation_state.stage}}
[BANT]
  - Budget: {{bant.budget}}
  - Authority: {{bant.authority}}
  - Need: {{bant.need}}
  - Timeline: {{bant.timeline}}
[产品兴趣] {{product_interest.products_discussed | join(", ")}}
[已讨论规格] {{product_interest.preferred_specs | json}}
[报价历史] {{product_interest.quotes_sent | json}}
[样品] {{product_interest.samples_requested ? "已申请" : "未申请"}}
[最后话题] {{conversation_state.last_topic}}
[待办动作] {{conversation_state.pending_action}}
[下次跟进] {{conversation_state.next_followup_date}}
[未解决异议]
{% for obj in objections_log if not obj.resolved %}
  - {{obj.objection}}（上次回应：{{obj.response_given}}）
{% endfor %}
[未完成承诺]
{% for c in commitments if c.status == "pending" or c.status == "overdue" %}
  - [{{c.status | upper}}] {{c.who}}: {{c.what}}（截止：{{c.by_when}}）
{% endfor %}
[关键事实]
{% for fact in key_facts[-5:] %}
  - {{fact}}
{% endfor %}
```

---

## L2 — 双阈值压缩

### 阈值定义

| 阈值 | 触发条件 | 动作 |
|------|---------|------|
| **50%** | Token 使用量达到 50% | 非阻塞后台保存关键数据到 ChromaDB |
| **65%** | Token 使用量达到 65% | 执行全文压缩，数字/quotes/承诺原文保留 |

### 65% 压缩规则

**必须保留（原文或等效）**：
- 客户明确需求、数量、预算、时间线
- 报价数字和条款
- 双方达成的承诺和协议
- 客户异议和 Agent 回应
- 客户情感信号（不满、犹豫、热情）
- 所有具体数字（价格、数量、日期）

**可以压缩**：
- 寒暄/Rapport → `[rapport established]`
- 重复产品介绍 → `[introduced product X, emphasized Y]`
- 多轮确认 → `[after multiple rounds, finalized as X]`

### 压缩输出格式

```
=== 对话摘要（压缩于 {{timestamp}}）===

[轮次] 原始 {{N}} 轮 → 压缩后
[客户阶段] {{stage}}
[关键对话线索]
1. [时间] 事件/信息
2. [时间] 事件/信息
...

[原文保留]
- 报价："..."
- 客户关键句："..."
- 承诺："..."

[已压缩]
- [破冰完成，客户语气友好]
- [介绍产品线，客户对 X 型号感兴趣]
...
```

---

## L3 — ChromaDB 向量存储

### 每轮存储

每轮对话结束后自动存储到 ChromaDB：

```json
{
  "customer_id": "{{phone or email}}",
  "turn_number": 5,
  "timestamp": "{{ISO_8601}}",
  "stage": "{{conversation_state.stage}}",
  "topic": "{{当前话题标签}}",
  "has_quote": true,
  "has_objection": false,
  "has_commitment": true,
  "user_message": "...",
  "agent_response": "..."
}
```

### 自动打标

| 标签 | 触发条件 |
|------|---------|
| `has_quote` | 消息含价格/成本/FOB/CIF/$ / €/折扣 |
| `has_commitment` | 任何一方做出承诺（"我会…"/"我们会在…"） |
| `has_objection` | "太贵了"/"没兴趣"/"比竞品贵" |
| `has_order` | "下单"/"确认购买"/"付定金" |
| `has_sample` | "样品"/"试用"/"先发一台" |

### 检索命令

```bash
# 语义搜索对话历史
chroma:search "客户讨论报价" --customer "{{customer_id}}" --limit 5

# 客户回来后完整上下文
chroma:recall "{{customer_id}}" --limit 10

# 按话题检索（找某个具体讨论）
chroma:search "交期谈判" --customer "{{customer_id}}" --limit 3
```

---

## L4 — CRM 每日快照

### 触发时间

每日 12:00（HEARTBEAT 第12项）

### 动作

1. 读取 CRM 全部 active leads
2. 生成 Pipeline 摘要（stage 分布、Pipeline 价值估算）
3. 存入 ChromaDB，collection=`pipeline_snapshots`，date tag=当天日期
4. 同步存 Supermemory，tag=`pipeline_backup`

### 快照格式

```json
{
  "date": "{{YYYY-MM-DD}}",
  "total_active_leads": X,
  "by_stage": {
    "new": X,
    "contacted": X,
    "interested": X,
    "quote_sent": X,
    "negotiating": X,
    "nurture": X
  },
  "hot_leads": X,
  "pipeline_value_usd": "XXX,XXX",
  "new_this_week": X,
  "closed_won_this_month": X,
  "closed_lost_this_month": X
}
```

---

## 降级策略

某层记忆不可用时的处理：

| 故障层 | 降级行为 |
|--------|---------|
| L1 MemOS 故障 | 读 CRM 获取基本信息 + `chroma:recall` 获取最近对话，通知 owner |
| L3 ChromaDB 故障 | 继续对话，使用 MemOS 数据，临时用 Supermemory 存研究资料 |
| L1 + L3 同时故障 | 以 CRM 为唯一数据源，询问客户简要回顾 |
| Supermemory 故障 | 跳过研究资料存储，直接用 CRM notes |
| 全部故障 | 通知 owner，告知系统处于降级模式 |

---

## 命令速查

| 命令 | 用途 |
|------|------|
| `memory:add "[内容]" --type customer_fact` | 存研究资料到 Supermemory |
| `memory:search "[关键词]"` | 搜索 Supermemory |
| `memory:stats` | 查看 Supermemory 统计 |
| `chroma:store` | 存储对话轮次（自动触发）|
| `chroma:search "[查询]" --customer "[id]"` | 语义搜索对话 |
| `chroma:recall "[customer_id]"` | 获取客户完整历史 |
| `chroma:snapshot` | 执行 L4 CRM 快照 |
| `chroma:stats` | 查看 ChromaDB 统计 |

---

## L1 MemOS 配置

```yaml
environment_variables:
  MEMOS_API_KEY: "<从 MemOS Dashboard 获取>"
  MEMOS_NAMESPACE: "holo_acquisition"
  CHROMA_COLLECTION: "holo_conversation_history"
  TOKEN_THRESHOLD: 0.65
```

MemOS 接入方式：
- Dashboard: https://memos-dashboard.openmem.net
- API: https://api.openmem.net/v1
- 免费额度可用

---

## 与红龙现有技能的关系

| 现有技能 | 在4层记忆中的位置 |
|---------|-----------------|
| `supermemory` | L1 补充（研究资料） + L4 备份 |
| `chroma-memory` | L3 + L4 实现 |
| `honglong-assistant` | 定义何时读取/写入记忆 |
| `inquiry-response` | 读取 L1 BANT 数据决定回复策略 |
| `follow-up-signal-monitor` | 依赖 L1 `last_contact` 和 `next_followup_date` |
