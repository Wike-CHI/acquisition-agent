---
name: chroma-memory
version: 1.0.0
description: ChromaDB 向量记忆技能，实现跨会话记忆连续性保障
triggers:
  - chroma memory
  - 向量记忆
  - chromadb
---

# chroma-memory — ChromaDB 向量记忆技能

> 版本: v1.0 | 日期: 2026-03-31
> 实现 4层抗遗忘系统的 L3（向量存储）和 L4（CRM快照）
> 专注文工业皮带 B2B 外贸场景。

---

## 概述

`chroma-memory` 是红龙获客系统的向量记忆技能，基于 ChromaDB 实现。每轮客户对话自动存储到向量数据库，支持语义检索和客户隔离，用于跨会话记忆连续性保障。

---

## 核心命令

| 命令 | 描述 | 触发时机 |
|------|------|---------|
| `chroma:store` | 存储一轮对话 | 每轮对话后自动调用 |
| `chroma:search <query>` | 语义搜索对话历史 | AI 判断需要检索时 |
| `chroma:recall <customer_id>` | 召回特定客户的对话历史 | 回访客户时 |
| `chroma:snapshot` | 每日 CRM 快照（L4）| HEARTBEAT 每天 12:00 |
| `chroma:stats` | 存储统计信息 | 内存健康检查时 |

---

## 命令详解

### chroma:store — 存储对话

**调用时机**：每轮对话生成后自动执行。

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `customer_id` | string | ✅ | 客户唯一标识（公司名或邮箱前缀）|
| `turn` | integer | ✅ | 对话轮次编号 |
| `user_message` | string | ✅ | 客户消息原文 |
| `agent_response` | string | ✅ | AI 回复原文 |
| `stage` | enum | ✅ | 当前阶段：`discovering` / `qualifying` / `proposal` / `negotiation` / `closed` |
| `topic` | enum | ✅ | 话题类型：`pricing` / `technical` / `logistics` / `comparison` / `objection` / `followup` / `other` |
| `metadata` | object | ❌ | 额外元数据（来源渠道、国家等）|

**自动标签检测**：

| 标签 | 检测规则 |
|------|---------|
| `has_quote` | 消息中包含 price/cost/报价/美元/报价单 等词 |
| `has_commitment` | 消息中包含 will/send/commit/答应/确认 等承诺词 |
| `has_objection` | 消息中包含 too expensive/competition/quality/delivery time 等异议词 |
| `has_order` | 消息中包含 order/purchase/buy/下单/成交 等购买词 |
| `has_sample` | 消息中包含 sample/prototype/样品/打样 等词 |

**示例**：

```bash
chroma:store \
  --customer "al_rashid_industries" \
  --turn 5 \
  --user "We need 50 units. What's the best price for FP2000 fingerpuncher?" \
  --agent "Thank you for your inquiry. For 50 units of FP2000, our FOB price is..." \
  --stage "qualifying" \
  --topic "pricing" \
  --metadata '{"source":"linkedin","country":"Saudi Arabia","product":"FP2000"}'
```

**AI 调用约定**：

每轮对话结束后，AI 自动执行：
```
1. 提取关键信息
2. 判断话题类型（topic）
3. 运行自动标签检测
4. 调用 chroma:store
```

---

### chroma:search — 语义搜索

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | ✅ | 自然语言搜索查询 |
| `customer_id` | string | ❌ | 限定特定客户（不填则全局搜索）|
| `limit` | integer | ❌ | 返回结果数量（默认 5）|

**示例**：

```bash
# 全局搜索"价格讨论"相关对话
chroma:search "price negotiation discussion" --limit 5

# 搜索特定客户的"报价"历史
chroma:search "quote pricing" --customer "al_rashid_industries" --limit 3
```

**AI 检索触发时机**：

| 场景 | 示例 |
|------|------|
| 客户引用过去事件 | "As we discussed last time..." / "上次你说的..." |
| 间隔 > 7 天回访 | 调用 `chroma:recall` |
| 承诺逾期未履行 | "你上周答应发的样品..." |

---

### chroma:recall — 客户历史召回

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `customer_id` | string | ✅ | 客户唯一标识 |
| `limit` | integer | ❌ | 返回最近 N 轮（默认 10）|

**示例**：

```bash
chroma:recall "al_rashid_industries" --limit 10
```

**自动触发条件**：
- 对话间隔 > 7 天时，AI 自动调用 `chroma:recall`
- CRM 显示客户状态为"待激活"时

**召回格式**：

```
=== 客户历史召回：al_rashid_industries ===
最近 10 轮对话：

[轮次 5] 2026-03-28 | 话题: pricing | 标签: has_quote
  客户：We need 50 units. What's the best price for FP2000?
  AI：FOB price for 50 units of FP2000 is USD X/台...

[轮次 4] 2026-03-27 | 话题: technical | 标签: -
  客户：What's the power consumption of FP2000?
  AI：FP2000 power consumption is 2.2kW...

...
```

---

### chroma:snapshot — CRM 快照（L4）

**调用时机**：HEARTBEAT 每天 12:00 自动执行。

**功能**：
1. 读取完整 CRM 管道（所有客户当前状态）
2. 生成结构化摘要
3. 存储到 ChromaDB（时间戳标记）
4. 作为 L1/L3 故障时的灾难恢复

**快照内容**：

```json
{
  "type": "crm_snapshot",
  "timestamp": "2026-03-31T12:00:00+08:00",
  "summary": {
    "total_customers": 47,
    "by_stage": {
      "discovering": 12,
      "qualifying": 15,
      "proposal": 8,
      "negotiation": 6,
      "closed": 6
    },
    "pending_quotes": 8,
    "overdue_commitments": 3,
    "stale_leads_7d": 5,
    "stale_leads_30d": 2
  },
  "top_pending": [
    {"company": "Al Rashid Industries", "days_since_quote": 14, "stage": "proposal"},
    {"company": "Gulf Tire Co", "days_since_quote": 7, "stage": "qualifying"}
  ],
  "overdue_commitments": [
    {"company": "Emirates Belt Factory", "commitment": "发送样品", "due_date": "2026-03-28"},
    {"company": "Riyadh Rubber", "commitment": "发送报价单", "due_date": "2026-03-25"}
  ]
}
```

---

### chroma:stats — 存储统计

```bash
chroma:stats
```

**输出示例**：

```
=== ChromaDB 存储统计 ===
总对话轮次: 847
总客户数: 47
向量维度: 1536

标签分布:
  has_quote: 156 (18.4%)
  has_commitment: 89 (10.5%)
  has_objection: 112 (13.2%)
  has_order: 23 (2.7%)
  has_sample: 67 (7.9%)

按阶段分布:
  discovering: 312 (36.8%)
  qualifying: 289 (34.1%)
  proposal: 156 (18.4%)
  negotiation: 67 (7.9%)
  closed: 23 (2.7%)

最近快照: 2026-03-31T12:00:00
```

---

## 客户隔离机制

所有数据按 `customer_id` 分区。**任何查询都强制包含客户隔离条件**：

```python
# 伪代码示例
results = chromadb.query(
    query_texts=[query],
    n_results=limit,
    where={"customer_id": customer_id}  # ← 强制客户隔离
)
```

**安全保证**：
- 一个客户的对话记录永远不会出现在另一个客户的搜索结果中
- 即使全局搜索，也会优先返回当前客户的上下文
- 管理员可查看所有数据（需单独授权）

---

## ChromaDB 配置

```yaml
# chroma-memory 配置
chroma:
  persist_directory: "{{DATA_DIR}}/chromadb/honglong-acquisition"
  collection_name: "honglong_conversations"
  embedding_model: "sentence-transformers/all-MiniLM-L6-v2"
  dimension: 384

auto_tags:
  enabled: true
  languages: ["en", "zh", "ar", "es"]
  keywords:
    has_quote: ["price", "cost", "报价", "USD", "quotation", "quote"]
    has_commitment: ["will", "send", "commit", "confirm", "答应", "确认"]
    has_objection: ["expensive", "competitor", "quality", "delivery", "价格", "竞争"]
    has_order: ["order", "purchase", "buy", "下单", "成交"]
    has_sample: ["sample", "prototype", "样品", "打样", "specimen"]

snapshot:
  schedule: "0 12 * * *"   # 每天 12:00
  retention_days: 90       # 快照保留 90 天
```

---

## 与 L1/L2/L4 集成

```
每轮对话
    ↓
chroma:store（L3）
    ↓
ChromaDB 存储
    ↓
检索时 ←→ chroma:search / chroma:recall

每天 12:00
    ↓
chroma:snapshot（L4）→ 读取 CRM → 存储快照

故障时
    ↓
从 L4 快照恢复 L1 MemOS 状态
```

---

## 错误处理

| 错误 | 处理方式 |
|------|---------|
| ChromaDB 连接失败 | 降级到纯文本日志存储，标记"待同步" |
| 存储失败 | 重试 3 次，失败后写入备用文件 |
| 检索无结果 | 返回空列表 + 提示"无历史记录" |
| 客户 ID 不存在 | 返回空 + 提示"新客户，无历史" |
