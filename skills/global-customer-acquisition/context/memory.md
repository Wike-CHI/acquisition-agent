# memory — 4层抗遗忘配置

> 系统初始化时读取，配置各层记忆系统参数。

---

## 4层架构概览

```
┌─────────────────────────────────────────────────────┐
│ L1: MemOS 结构化内存    — 每轮对话自动提取/注入      │
├─────────────────────────────────────────────────────┤
│ L2: 主动摘要压缩        — Token ≥ 65% 触发          │
├─────────────────────────────────────────────────────┤
│ L3: ChromaDB 向量存储   — 每轮存储 + 语义检索        │
├─────────────────────────────────────────────────────┤
│ L4: CRM 每日快照        — 每天 12:00 灾难恢复        │
└─────────────────────────────────────────────────────┘
```

---

## L1: MemOS 结构化内存

| 参数 | 值 |
|------|---|
| 提供者 | workbuddy_context |
| 触发时机 | 每轮对话结束后自动 |
| 提取字段 | customer_id, company, contact, email, source, country, industry, stage, bant, interests, objections, commitments, quotes_sent, last_contact, next_action |

---

## L2: 主动摘要压缩

| 参数 | 值 |
|------|---|
| 提供者 | context_compressor |
| 触发阈值 | Token ≥ 65% |
| 压缩规则 | 零信息损失 |

### 保留内容

- 客户身份和 BANT 信息
- 承诺、报价、异议
- 关键数字（价格/数量/规格）
- 决策人信息

### 压缩内容

- 闲聊和寒暄
- 重复表述
- 冗长解释

---

## L3: ChromaDB 向量存储

| 参数 | 值 |
|------|---|
| 存储目录 | `C:\Users\Administrator\chromadb\honglong-acquisition` |
| 集合名 | honglong_conversations |
| 嵌入模型 | sentence-transformers/all-MiniLM-L6-v2 |
| 维度 | 384 |
| 客户隔离 | ✅ 启用 |
| 自动标签 | ✅ 启用 |

### 自动标签

| 标签 | 触发条件 |
|------|---------|
| `has_quote` | 讨论价格/成本/报价时 |
| `has_commitment` | 任何一方做出承诺时 |
| `has_objection` | 检测到客户异议时 |
| `has_order` | 确认订单/购买时 |
| `has_sample` | 讨论样品请求时 |

---

## L4: CRM 每日快照

| 参数 | 值 |
|------|---|
| 调度 | 每天 12:00 (`0 12 * * *`) |
| 保留天数 | 90天 |
| 存储位置 | ChromaDB |

### 快照内容

- 所有客户的当前阶段
- 待发报价
- 逾期承诺
- 停滞线索统计

---

## Supermemory（增强 L1）

| 参数 | 值 |
|------|---|
| 提供者 | LanceDB |
| 存储目录 | `C:\Users\Administrator\lancedb\honglong` |
| 集合名 | honglong_memory |
| 嵌入模型 | text-embedding-3-small |
| 自动捕获 | ✅ 启用 |
| 捕获策略 | 仅最后一条消息的洞察 |

### 记忆类型 TTL

| 类型 | TTL | 示例 |
|------|-----|------|
| `customer_fact` | 永久 | "Al Rashid 每月采购 2000 条皮带" |
| `conversation_insight` | 90天 | "客户对分层机的宽幅规格更感兴趣" |
| `market_signal` | 30天 | "沙特 Q2 皮带需求上涨 15%" |
| `effective_script` | 永久 | "以当地案例开场 → 3倍回复率" |
| `competitor_intel` | 永久 | "竞品A价格低10%，但交期更长" |

---

## 监控指标

| 指标 | 告警阈值 |
|------|---------|
| 内存提取成功率 | < 95% |
| 主动摘要触发次数/天 | > 50次 |
| ChromaDB 检索命中率 | < 70% |
| 客户"你不记得"计数 | > 0（立即调查）|

---

## 获客案例索引

| 市场 | 日期 | 客户数量 | 平均 ICP | 报告文件 |
|------|------|---------|---------|---------|
| 美国 | 2026-04-01 | 3 家 | 83/100 | `usa-market-case-2026-04-01.md` |

---

## 关键经验总结

### LinkedIn 搜索工具选择（HOT 模式）

**优先级**：
1. Exa Free via mcporter（无需 API Key）- 首选
2. Exa API (exa-search) - 备选（需 EXA_API_KEY）
3. web_search (Google) - 最后降级（LinkedIn 受限）

**调用方式**：
```bash
mcporter call "exa.web_search_exa(query: 'linkedin profile procurement manager purchasing director conveyor belt industrial equipment USA', numResults: 8, includeDomains: ['linkedin.com'])"
```

**关键词模板**：西语/葡语 + 岗位 + 产品 + 国家

**执行前检查**：`mcporter list exa` 确认服务可用

---

### 开发信打磨≥7分标准

| 维度 | 得分 | 说明 |
|------|------|------|
| 个性化程度 | 2/2 | 提到决策人姓名、职务、公司动态 |
| 相关性 | 2/2 | 产品匹配、差异化优势 |
| 简洁性 | 2/2 | 100-130 词，3 段 |
| 语法质量 | 2/2 | 专业商务英语 |
| CTA 有效性 | 2/2 | 具体可行、明确时间 |
| **总分** | **10/10** | **满分** |

---

### 差异化优势量化

| 客户类型 | 差异化优势 | 量化指标 |
|---------|------------|---------|
| 大型跨国企业 | 钛板加热技术 | ±1°C 温控 |
| 大型跨国企业 | 能效提升 | 30% 能耗降低 |
| 大型跨国企业 | 保修期 | 2 年（比欧洲标准长 1 年） |
| 大型跨国企业 | 成本优势 | 30% 成本节省 |
| 欧洲竞争对手 | 成本优势 | 40% 成本节省 vs. 欧洲 |
| 中小企业 | 交付时间 | 7-10 天快速交付 |

---
