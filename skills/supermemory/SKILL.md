# supermemory — 增强记忆引擎

> 版本: v1.0 | 日期: 2026-03-31
> 实现 4层抗遗忘系统的 L1 增强层
> 专注文工业皮带 B2B 外贸场景，基于 LanceDB 向量存储。

---

## 概述

`supermemory` 是红龙获客系统的增强记忆引擎，比 L1 MemOS 更智能，用于存储市场情报、竞品分析、有效话术和客户洞察。与 ChromaDB（对话向量存储）不同，Supermemory 专注于**非对话类知识**。

---

## 记忆类型与 TTL

| 类型 | TTL | 示例 |
|------|-----|------|
| `customer_fact` | **永久** | "Al Rashid Industries 每月采购 2000 条皮带，交货期 30 天" |
| `conversation_insight` | **90 天** | "客户对分层机的宽幅规格更感兴趣" |
| `market_signal` | **30 天** | "沙特阿拉伯皮带市场需求 Q2 上涨 15%" |
| `effective_script` | **永久** | "以当地工厂案例开场 → 3倍回复率" |
| `competitor_intel` | **永久** | "竞品A打齿机价格低10%，但交期多15天" |

---

## 核心命令

| 命令 | 描述 |
|------|------|
| `memory:add` | 添加记忆 |
| `memory:search` | 语义搜索记忆 |
| `memory:list` | 列出某类型记忆 |
| `memory:delete` | 删除记忆 |
| `memory:stats` | 查看统计 |

---

## 命令详解

### memory:add — 添加记忆

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | enum | ✅ | 记忆类型（见上表）|
| `content` | string | ✅ | 记忆内容 |
| `tags` | string[] | ❌ | 标签列表 |
| `source` | string | ❌ | 来源（linkedin/exa/email/manual）|
| `confidence` | float | ❌ | 置信度 0-1（默认 0.8）|

**示例**：

```bash
# 添加客户事实
memory:add \
  --type "customer_fact" \
  --content "Al Rashid Industries，沙特阿拉伯最大轮胎制造商，年产值约2亿美元，员工1200人。采购决策周期3-6个月。" \
  --tags ["al_rashid", "saudi_arabia", "tire_manufacturer"] \
  --source "linkedin" \
  --confidence 0.9

# 添加有效话术
memory:add \
  --type "effective_script" \
  --content "开场白：提及当地同规模工厂使用HOLO设备的具体案例，回复率提升显著。示例：'我们为沙特一家月产5000条皮带的工厂提供了打齿机解决方案...' " \
  --tags ["opening_line", "saudi_arabia", "case_study"]

# 添加竞品情报
memory:add \
  --type "competitor_intel" \
  --content "竞品闪电牌打齿机：价格比HOLO低10-15%，功率更低（1.5kW vs 2.2kW），但精度略差。交货期25天 vs HOLO的18天。客户反馈主要是售后服务响应慢。" \
  --tags ["competitor", "fingerpuncher", "price_comparison"]

# 添加市场信号
memory:add \
  --type "market_signal" \
  --content "沙特阿拉伯 2026 年基础设施建设投资增长 20%，带动工业皮带需求。大型项目集中在东部省（Eastern Province）和利雅得。" \
  --tags ["market_trend", "saudi_arabia", "infrastructure"]
```

---

### memory:search — 语义搜索

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | ✅ | 自然语言查询 |
| `type` | enum | ❌ | 限定记忆类型 |
| `tags` | string[] | ❌ | 限定标签 |
| `limit` | integer | ❌ | 返回数量（默认 5）|

**示例**：

```bash
# 搜索沙特阿拉伯相关记忆
memory:search "沙特阿拉伯客户" --limit 5

# 搜索有效话术
memory:search "opening line for tire manufacturer" --type "effective_script"

# 搜索竞品情报
memory:search "打齿机竞品对比" --type "competitor_intel"

# 按标签搜索
memory:search "市场机会" --tags ["market_trend", "saudi_arabia"]
```

**AI 触发时机**：

| 场景 | 示例查询 |
|------|---------|
| 撰写开发信前 | "搜索沙特阿拉伯客户的所有记忆" |
| 竞品对比时 | "搜索竞品闪电牌相关信息" |
| 定价策略时 | "搜索客户对价格的接受区间" |
| 市场分析时 | "搜索中东市场最新信号" |

---

### memory:list — 列表查看

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | enum | ❌ | 记忆类型 |
| `limit` | integer | ❌ | 返回数量（默认 20）|

**示例**：

```bash
# 列出所有有效话术
memory:list --type "effective_script"

# 列出所有竞品情报
memory:list --type "competitor_intel"

# 列出最近 20 条记忆
memory:list --limit 20
```

---

### memory:delete — 删除记忆

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 记忆 ID |

**示例**：

```bash
memory:delete --id "mem_abc123"
```

---

### memory:stats — 存储统计

```bash
memory:stats
```

**输出示例**：

```
=== Supermemory 统计 ===
总记忆条数: 234

按类型分布:
  customer_fact:      45 (19.2%)
  conversation_insight: 67 (28.6%)
  market_signal:      38 (16.2%)
  effective_script:   52 (22.2%)
  competitor_intel:   32 (13.7%)

TTL 统计:
  永久有效:     129 (55.1%)
  90天内有效:    67 (28.6%)
  30天内有效:    38 (16.2%)

过期待清理:     12 条

存储引擎: LanceDB
向量维度: 1536
```

---

## LanceDB 配置

```yaml
# supermemory 配置
supermemory:
  provider: "lancedb"          # 默认本地存储，无需外部依赖
  persist_directory: "C:/Users/Administrator/lancedb/honglong"
  collection_name: "honglong_memory"

  # 备选 provider（需要 API key）
  # provider: "supermemory_cloud"
  # api_key: "{{SUPERMEMORY_API_KEY}}"

  embedding_model: "text-embedding-3-small"  # OpenAI embedding
  auto_capture: true
  capture_strategy: "last_turn"               # 仅捕获最后一条消息的洞察
  recall_top_k: 5

ttl_days:
  customer_fact: null       # 永久
  conversation_insight: 90
  market_signal: 30
  effective_script: null    # 永久
  competitor_intel: null    # 永久

auto_cleanup:
  enabled: true
  schedule: "0 3 * * *"   # 每天凌晨 3:00
  grace_period_days: 7       # 过期后多留 7 天再删除
```

---

## 备选 Provider

### Supermemory Cloud（托管服务）

```yaml
provider: "supermemory_cloud"
api_key: "{{SUPERMEMORY_API_KEY}}"
```

### Memos（自托管笔记）

```yaml
provider: "memos"
memos_url: "{{MEMOS_URL}}"
memos_token: "{{MEMOS_TOKEN}}"
```

---

## 与 L1 MemOS 集成

```
对话生成后
    ↓
MemOS L1: 结构化客户状态（自动提取）
    ↓
Supermemory: 非结构化洞察（AI 主动判断）
    ↓
两者协同注入上下文
    ↓
对话结束 → chroma:store L3（对话历史向量）
    ↓
每天 12:00 → chroma:snapshot L4（CRM 快照）
```

**集成规则**：
- MemOS 存储"事实状态"（客户名称、阶段、产品、承诺）
- Supermemory 存储"洞察和知识"（市场信号、话术、竞品）
- 两者共同构成 L1 的完整记忆

---

## AI 调用约定

当 AI 在对话中发现值得记录的信息时，应主动调用 `memory:add`：

| 发现内容 | 记忆类型 |
|---------|---------|
| 客户透露的采购规模/周期/决策人 | `customer_fact` |
| 客户的偏好/异议/关注点 | `conversation_insight` |
| 有效的开场白/话术/策略 | `effective_script` |
| 竞品动态/对比信息 | `competitor_intel` |
| 市场趋势/行业动态 | `market_signal` |
