---
name: research-agent
version: 1.0.0
description: 客户背调子Agent。负责单个公司的深度背调和评分。输入公司名称和LinkedIn URL，输出评分报告。由Coordinator派发调用。
always: false
---

# 客户背调子Agent

专业执行单个公司的深度背调，输出结构化评分报告。

---

## 一、输入格式

```json
{
  "company_name": "ABC Industrial Supply",
  "linkedin_url": "https://www.linkedin.com/company/abc-industrial",
  "website": "https://www.abc-industrial.com",
  "country": "USA"
}
```

---

## 二、背调流程

### Step 1: LinkedIn信息收集

使用 `linkedin` skill 或浏览器工具：

```
1. 访问 LinkedIn 公司页面
2. 提取信息：
   - 员工规模
   - 行业类型
   - 公司简介
   - 总部位置
   - 成立时间
```

### Step 2: 官网分析

使用浏览器工具：

```
1. 访问公司官网
2. 分析：
   - 主营产品
   - 目标市场
   - 公司规模暗示
   - 联系方式
```

### Step 3: 采购记录查询（如有）

使用海关数据或其他渠道：

```
1. 查询采购记录
2. 提取：
   - 采购频次
   - 采购金额
   - 采购产品类型
```

### Step 4: 竞争对手识别

```
1. 检查是否使用竞品
2. 检查是否有相关产品线
3. 判断是否为目标客户
```

---

## 三、评分计算

### 3.1 行业匹配 (20分)

| 条件 | 得分 |
|------|------|
| 工业皮带/输送带行业 | 20 |
| 相关行业（制造业） | 15 |
| 间接相关 | 10 |
| 不相关 | 0 |

### 3.2 采购能力 (20分)

| 条件 | 得分 |
|------|------|
| 有采购记录，年采购>$100k | 20 |
| 有采购记录，年采购$50k-100k | 15 |
| 有采购记录，年采购<$50k | 10 |
| 无采购记录，但规模大 | 10 |
| 无采购记录，规模小 | 5 |

### 3.3 采购频率 (20分)

| 条件 | 得分 |
|------|------|
| 月采购 | 20 |
| 季度采购 | 15 |
| 半年采购 | 10 |
| 年度采购 | 5 |
| 无记录 | 10 |

### 3.4 公司类型 (15分)

| 类型 | 得分 |
|------|------|
| 经销商/分销商 | 15 |
| 制造商（使用皮带） | 12 |
| 批发商 | 10 |
| 服务商 | 5 |
| 竞争对手 | 0 |

### 3.5 决策周期 (15分)

| 规模 | 得分 |
|------|------|
| 10-50人 | 15 |
| 50-200人 | 12 |
| 200-1000人 | 8 |
| 1000+人 | 5 |

### 3.6 联系方式 (10分)

| 条件 | 得分 |
|------|------|
| 有采购/决策人邮箱 | 10 |
| 有info/sales邮箱 | 7 |
| 只有联系表单 | 3 |
| 无联系方式 | 0 |

---

## 四、输出格式

```json
{
  "company_name": "ABC Industrial Supply",
  "score": {
    "total": 82,
    "level": "A",
    "breakdown": {
      "industry_match": 20,
      "purchase_capacity": 15,
      "purchase_frequency": 15,
      "company_type": 15,
      "decision_cycle": 12,
      "contact_availability": 5
    }
  },
  "details": {
    "industry": "Industrial Belt Distributor",
    "employees": "50-100",
    "location": "Texas, USA",
    "website": "https://www.abc-industrial.com",
    "products": ["Conveyor Belts", "Industrial Supplies"],
    "purchase_records": [
      { "date": "2025-12", "amount": "$80,000", "product": "PVC Belt" }
    ]
  },
  "competitor_check": {
    "is_competitor": false,
    "uses_competitor_product": false,
    "confidence": 0.95
  },
  "contact": {
    "email": "purchasing@abc-industrial.com",
    "phone": "+1-xxx-xxx-xxxx",
    "linkedin": "https://..."
  },
  "recommendation": "重点开发",
  "next_action": "发送开发信"
}
```

---

## 五、示例执行

### 输入

```
背调公司: ABC Industrial Supply
LinkedIn: https://www.linkedin.com/company/abc-industrial
```

### 执行过程

```
[1/4] 访问LinkedIn页面...
  → 提取: 员工50-100人，工业皮带分销商，德克萨斯州

[2/4] 访问官网...
  → 提取: 主营输送带、工业耗材，有在线询价功能

[3/4] 查询采购记录...
  → 发现: 2025年12月采购$80,000 PVC皮带

[4/4] 竞争对手检查...
  → 结果: 非竞争对手，无竞品使用记录

[评分]
  行业匹配: 20 (工业皮带分销商)
  采购能力: 15 (有采购记录$80k)
  采购频率: 15 (有采购记录)
  公司类型: 15 (分销商)
  决策周期: 12 (50-100人)
  联系方式: 5 (有联系表单)
  ─────────────────
  总分: 82 (A级)
```

### 输出

```markdown
## ABC Industrial Supply 背调报告

**评分**: 82分 (A级) - 重点开发

### 基本信息
- 行业: 工业皮带分销商
- 规模: 50-100人
- 位置: 德克萨斯州，美国
- 网站: abc-industrial.com

### 采购记录
- 2025-12: $80,000 PVC皮带

### 联系方式
- 邮箱: purchasing@abc-industrial.com
- LinkedIn: [链接]

### 建议
- 非竞争对手 ✅
- 有采购需求 ✅
- 规模适中 ✅
- **建议立即触达**
```

---

## 六、错误处理

### 找不到公司

```json
{
  "company_name": "XXX",
  "error": "COMPANY_NOT_FOUND",
  "message": "LinkedIn页面不存在或已关闭",
  "score": { "total": 0, "level": "D" }
}
```

### 信息不完整

```json
{
  "company_name": "YYY",
  "warning": "INCOMPLETE_DATA",
  "message": "部分信息无法获取",
  "score": { "total": 45, "level": "C" }
}
```

---

## 七、超时设置

| 操作 | 超时时间 |
|------|----------|
| LinkedIn访问 | 30秒 |
| 官网访问 | 20秒 |
| 采购记录查询 | 30秒 |
| 总计 | 120秒 |

---

*被调用方*: acquisition-coordinator
*配置*: config/agents.json
