# MEMORY.md — 红龙获客系统 4层防遗忘记忆协议

> 红龙获客系统的记忆架构，确保跨会话客户信息永不丢失。
> 基于 B2B-SDR template v2026.4.24 MEMORY.md 改造，适配红龙业务场景。
> 最后更新：2026-04-27

---

> ⚠️ **架构说明**：本文件定义 4 层防遗忘记忆架构的设计规范。
> **当前部署状态（2026-04-27）**：尚未部署持久化记忆服务。
> L1 MemOS: 依赖外部 API Key，需 owner 配置
> L3 ChromaDB: 本地服务需手动启动（chroma run --port 8000）
> L4 Supermemory: 本地服务需手动启动
> **当前实际运行模式**：依赖 OpenClaw Active Memory 插件 + MEMORY.md 文件系统记录。
> **owner 可按需逐一启用各层服务。**

---

## 记忆架构总览

```
消息进入
  → L0 Active Memory sub-agent（可选，OpenClaw v2026.4.10+，在主回复前自动搜索记忆）
  → L1 MemOS 结构化记忆（对话开始自动注入，对话结束自动捕获）
  → L2 双阈值压缩（50% 后台保存 → 65% 全文压缩）
  → L3 ChromaDB 向量存储（每轮对话永久存档，customer_id 隔离 + 自动打标）
  → L4 CRM 每日快照（12:00 灾难恢复）
```

| 层级 | 引擎 | 机制 | 你的动作 |
|------|------|------|---------|
| **L0: Active Memory** | OpenClaw 可选子 Agent | 在主回复前自动搜索记忆，注入相关上下文。支持 message/recent/full 三种模式 | 设置 `mode: recent` 用于 SDR |
| **L1: MemOS** | 结构化记忆 | 对话开始自动注入过往记忆，对话结束自动捕获 BANT/承诺/异议 | 读取它给你的内容 |
| **L2: Proactive Summary** | 双阈值监控 | **50%**：后台非阻塞保存关键事实到 ChromaDB。**65%**：haiku 级模型全文压缩，数字/报价/承诺零丢失 | 超过 20 轮时在回复中嵌入关键数据摘要 |
| **L3: ChromaDB** | 每轮存储 | 每轮对话存储，customer_id 隔离 + 自动打标。检索用 recency-weighted 排序 | 触达前用 `chroma:search`，回复客户引用历史前用 `chroma:recall` |
| **L4: CRM Snapshot** | 每日备份 | 12:00 每日 Pipeline 快照存 ChromaDB，作为灾难恢复 | 无需手动操作 |

---

## 回退链（当某层不可用时）

| 故障层 | 降级行为 |
|--------|---------|
| **L1 MemOS 故障** | 读 CRM 获取客户上下文 + `chroma:recall` 获取最近对话。通知 owner："MemOS 不可用，以 CRM + ChromaDB 运行" |
| **L3 ChromaDB 故障** | 继续对话，使用 L1 MemOS 数据。临时用 Supermemory（`memory:add`）存研究资料。通知 owner："ChromaDB 不可用" |
| **L1 + L3 同时故障** | 以 CRM 为唯一数据源。返回客户可简要询问："上次我们聊到哪了？" 通知 owner |
| **Supermemory 故障** | 跳过研究资料存储，直接用 CRM notes。继续用 CRM + ChromaDB |
| **全部故障** | 无状态模式运行。立即通知 owner。每次交互前读 CRM |

---

## 操作规则（每次对话）

1. **对话开始**：读取 L1 MemOS 记忆快照。自然引用上次话题以保持连续性
2. **触达前**：`chroma:search` + `memory:search` 召回客户历史和研究资料
3. **每轮结束**：L3 自动存储 turn。在脑中提取 BANT 变化、新承诺、新异议
4. **研究后**：`memory:add` 将发现存入 Supermemory（公司情报、竞品数据）
5. **超过 20 轮**：在回复中嵌入简短关键数据摘要（防止 L2 压缩丢失）
6. **客户引用历史**：先 `chroma:search` + `memory:search` 再回复
7. **7 天以上未联系的返回客户**：`chroma:recall <customer_id>` 获取完整历史
8. **永远不说"抱歉我不记得了"**：用 `memory:search` 或 `chroma:search`，或者说 "let me check my notes"

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

# 展开被压缩的 turn 查看原文
chroma:expand <turn_id>
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

## 记忆优先级矩阵

| 信息类型 | L1 MemOS | L2 压缩 | L3 ChromaDB | L4 CRM | 保留期限 |
|---------|----------|---------|-------------|--------|---------|
| 客户 BANT / 承诺 | 自动捕获 | 原文保留 | 每轮存储 | — | 永久 |
| 报价 / 定价讨论 | 自动捕获 | 原文保留 | 自动打标 `has_quote` | — | 永久 |
| 客户异议 | 自动捕获 | 原文保留 | 自动打标 `has_objection` | — | 永久 |
| 公司调研 / 竞品情报 | — | — | — | — | 永久（Supermemory） |
| 有效话术 / 模式 | — | — | — | — | 永久（Supermemory） |
| 市场信号 / 趋势 | — | — | — | — | 30 天（Supermemory） |
| Pipeline 状态 | — | — | — | 每日快照 | 永久 |
| 原始对话轮次 | — | 压缩 | 全文存储 | — | 永久（ChromaDB） |

---

## 跨会话连续性规则

1. **永不冷启动**：如果 MemOS 注入了记忆，自然引用它（"上次我们聊到 X…"）
2. **追踪所有承诺**：己方和客户的都追踪。己方过期的 → 先道歉再补救。客户过期的 → 礼貌提醒
3. **检测返回客户**：CRM 有历史交互记录 → `chroma:recall` 后再回复
4. **交接保护**：会话结束前确保 CRM 已更新 + 关键研究已存 Supermemory
5. **每周记忆卫生**：周一 HEARTBEAT → `memory:stats` + `chroma:stats`。归档过期市场信号（>30天）

---

## 监控指标

### 健康检查项（HEARTBEAT 第11项）

| 指标 | 正常范围 | 告警 |
|------|---------|------|
| Supermemory 总数 | 100-500 | >500 建议归档旧 market_signal |
| Supermemory customer_fact 数 | >0 | =0 则研究未存储 |
| ChromaDB 总 turn 数 | — | 24h 无新增 turn → L3 可能未捕获 |
| ChromaDB 覆盖客户数 | 与 CRM active 数一致 | 差距 >30% → 部分客户未覆盖 |
| L4 快照天数 | 连续 >0 | 缺失 >2 天 → 备份异常 |

### 验证清单（4项测试场景）

| 场景 | 测试方法 | 预期结果 |
|------|---------|---------|
| 1. 新客户首次对话 | 创建空白 customer_session → BANT 逐轮捕获 | MemOS 正确初始化，每轮后 BANT 字段更新 |
| 2. 返回客户（7天+） | `chroma:recall <id>` → 恢复上下文 | 检索到完整历史对话和上次话题 |
| 3. 报价谈判中途压缩 | 超过 20 轮 → L2 触发 65% 压缩 | 报价数字/承诺/异议原文保留，寒暄压缩 |
| 4. 灾难恢复 | 模拟 L1+L3 全部不可用 | 回退到 CRM 数据，通知 owner，继续服务 |

---

## 命令速查

| 命令 | 用途 |
|------|------|
| `memory:add "[内容]" --type customer_fact` | 存研究资料到 Supermemory |
| `memory:add "[内容]" --type competitor_intel` | 存竞品情报 |
| `memory:add "[内容]" --type effective_tactic` | 存有效话术 |
| `memory:search "[关键词]" --limit 5` | 搜索 Supermemory |
| `memory:list --type customer_fact` | 列出指定类型记忆 |
| `memory:stats` | 查看 Supermemory 统计 |
| `chroma:store --customer "[id]" --turn N --user "..." --agent "..." --stage [stage] --topic [topic]` | 手动存储对话轮次 |
| `chroma:search "[查询]" --customer "[id]" --limit 5` | 语义搜索对话 |
| `chroma:recall "[customer_id]" --limit 10` | 获取客户完整历史 |
| `chroma:expand <turn_id>` | 查看被压缩 turn 的原文 |
| `chroma:snapshot` | 执行 L4 CRM 快照 |
| `chroma:stats` | 查看 ChromaDB 统计 |

---

## 与红龙现有技能的关系

| 现有技能 | 在4层记忆中的位置 |
|---------|-----------------|
| `supermemory` | L1 补充（研究资料） + L4 备份 |
| `chroma-memory` | L3 + L4 实现 |
| `honglong-assistant` | 定义何时读取/写入记忆 |
| `inquiry-response` | 读取 L1 BANT 数据决定回复策略 |
| `follow-up-signal-monitor` | 依赖 L1 `last_contact` 和 `next_followup_date` |
| `smart-memory` | L1 MemOS 补充（智能记忆管理） |
| `humanoid-memory` | L1 MemOS 拟人化记忆表达 |

---

*基于 OpenClaw v2026.4.24 · B2B-SDR Template MEMORY.md 同步 · 红龙工业设备定制版*
