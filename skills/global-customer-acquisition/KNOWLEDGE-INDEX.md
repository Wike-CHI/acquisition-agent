# 知识索引系统

> 防止AI灾难性遗忘的核心系统
> 更新时间: 2026-03-27

---

## 🎯 系统目标

1. **快速检索** - 语义搜索知识库
2. **增量学习** - 自动整合新知识
3. **智能遗忘** - 归档低价值知识
4. **版本控制** - 追踪知识变化

---

## 📊 知识分类

### 1. 客户知识

```
知识类型: customer_knowledge
存储位置: ~/.openclaw/knowledge/customers/
索引字段:
  - company_name (公司名)
  - country (国家)
  - industry (行业)
  - icp_score (ICP评分)
  - status (状态)
  - last_contact (最后联系时间)
```

### 2. 产品知识

```
知识类型: product_knowledge
存储位置: ~/.openclaw/knowledge/products/
索引字段:
  - product_name (产品名)
  - category (分类)
  - specifications (规格)
  - price_range (价格范围)
```

### 3. 市场知识

```
知识类型: market_knowledge
存储位置: ~/.openclaw/knowledge/markets/
索引字段:
  - market_name (市场名)
  - region (地区)
  - trends (趋势)
  - competitors (竞争对手)
```

### 4. 流程知识

```
知识类型: process_knowledge
存储位置: ~/.openclaw/knowledge/processes/
索引字段:
  - process_name (流程名)
  - steps (步骤)
  - success_rate (成功率)
  - last_used (最后使用)
```

---

## 🔧 使用方法

### 添加知识

```javascript
// 添加客户知识
knowledgeIndex.add({
  type: 'customer_knowledge',
  data: {
    company_name: 'Ace Belting Company',
    country: 'USA',
    industry: 'conveyor belt',
    icp_score: 73,
    status: 'contacted',
    last_contact: '2026-03-27'
  }
});
```

### 搜索知识

```javascript
// 语义搜索
const results = knowledgeIndex.search({
  query: '美国输送带客户',
  type: 'customer_knowledge',
  limit: 10
});

// 返回结果
results.forEach(r => {
  console.log(`${r.company_name} - ICP: ${r.icp_score}`);
});
```

### 更新知识

```javascript
// 更新客户状态
knowledgeIndex.update({
  id: 'ace-belting-company',
  updates: {
    status: 'quoted',
    last_contact: '2026-03-28'
  }
});
```

### 归档知识

```javascript
// 归档低价值知识
knowledgeIndex.archive({
  condition: {
    last_used: { before: '2025-09-27' },
    access_count: { lessThan: 3 }
  }
});
```

---

## 📊 知识评分

### 重要性评分（0-10）

| 因素 | 权重 | 说明 |
|------|------|------|
| **访问频率** | 30% | 越常访问越重要 |
| **ICP评分** | 25% | 客户质量 |
| **最近访问** | 20% | 时效性 |
| **转化率** | 15% | 实际价值 |
| **知识完整度** | 10% | 信息完整性 |

### 遗忘策略

| 评分 | 动作 |
|------|------|
| **≥ 8** | 保持活跃，高频索引 |
| **5-7** | 保持，低频索引 |
| **3-4** | 归档到冷存储 |
| **< 3** | 删除（保留元数据） |

---

## 🔄 增量学习流程

```
新知识输入
    ↓
┌─────────────────────────────────────┐
│  1. 去重检查                        │
│     - 检查是否已存在               │
│     - 检查是否冲突                 │
├─────────────────────────────────────┤
│  2. 质量验证                        │
│     - 必需字段完整性               │
│     - 数据格式正确性               │
├─────────────────────────────────────┤
│  3. 冲突解决                        │
│     - 新旧知识对比                 │
│     - 选择更可靠的版本             │
├─────────────────────────────────────┤
│  4. 知识整合                        │
│     - 合并互补信息                 │
│     - 更新索引                     │
├─────────────────────────────────────┤
│  5. 触发遗忘                        │
│     - 检查容量限制                 │
│     - 归档低价值知识               │
└─────────────────────────────────────┘
```

---

## 📁 存储结构

```
~/.openclaw/knowledge/
├── index.json              # 主索引
├── customers/              # 客户知识
│   ├── ace-belting.json
│   ├── asgco.json
│   └── ...
├── products/               # 产品知识
│   ├── air-cooled-press.json
│   ├── water-cooled-press.json
│   └── ...
├── markets/                # 市场知识
│   ├── usa-market.json
│   ├── europe-market.json
│   └── ...
├── processes/              # 流程知识
│   ├── customer-acquisition.json
│   ├── email-outreach.json
│   └── ...
└── archive/                # 归档知识
    ├── 2025-Q1/
    ├── 2025-Q2/
    └── ...
```

---

## 🔍 索引示例

### index.json

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-27T15:10:00Z",
  "stats": {
    "totalKnowledge": 1234,
    "customers": 456,
    "products": 23,
    "markets": 12,
    "processes": 8
  },
  "indexes": {
    "by_company": {
      "ace-belting-company": "customers/ace-belting.json",
      "asgco": "customers/asgco.json"
    },
    "by_country": {
      "USA": ["ace-belting-company", "asgco"],
      "Germany": ["sempertrans-germany"]
    },
    "by_industry": {
      "conveyor belt": ["ace-belting-company", "asgco"],
      "manufacturing": [...]
    },
    "by_icp_score": {
      "A": [...],
      "B": [...],
      "C": [...]
    }
  }
}
```

---

## 🚀 集成到获客系统

### 在 SKILL.md 中使用

```javascript
// 搜索客户知识
const customers = knowledgeIndex.search({
  query: '美国输送带制造商',
  type: 'customer_knowledge',
  limit: 10
});

// 如果找到现有知识
if (customers.length > 0) {
  // 使用已有知识
  const customer = customers[0];
  
  // 更新访问记录
  knowledgeIndex.update({
    id: customer.id,
    updates: {
      last_access: new Date(),
      access_count: customer.access_count + 1
    }
  });
} else {
  // 创建新知识
  knowledgeIndex.add({
    type: 'customer_knowledge',
    data: newCustomerData
  });
}
```

---

## 📊 监控指标

| 指标 | 目标 | 告警阈值 |
|------|------|----------|
| **索引大小** | < 100 MB | > 500 MB |
| **搜索延迟** | < 100 ms | > 500 ms |
| **知识完整度** | > 80% | < 60% |
| **归档比例** | 10-20% | > 50% |

---

## 🔄 定期维护

### 每日

```bash
# 重建索引
knowledgeIndex.rebuild()

# 清理重复
knowledgeIndex.deduplicate()
```

### 每周

```bash
# 归档低价值知识
knowledgeIndex.archive()

# 优化索引
knowledgeIndex.optimize()
```

### 每月

```bash
# 知识审计
knowledgeIndex.audit()

# 备份知识库
knowledgeIndex.backup()
```

---

_更新时间: 2026-03-27_
_版本: v1.0.0_
_状态: 设计完成，待实现_
