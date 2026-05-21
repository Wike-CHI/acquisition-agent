---
name: customer-deduplication
version: 1.0.0
description: 客户去重技能。跨平台合并重复客户，按公司名称、域名、联系方式匹配。当用户需要：(1) 合并多个平台的客户列表 (2) 去除重复客户 (3) 统一客户信息 (4) 客户数据清洗 时使用此技能。
always: false
triggers:
  - 去重
  - 合并客户
  - 重复客户
  - deduplication
  - merge customers
---

# 客户去重技能

> **Skill Graph：** 领域 → [[_index-conversion|报价与转化领域]] | 上游 ← [[crm|CRM]] ← [[_index-conversion|转化领域]] | 下游 → [[knowledge-base|团队知识库]]（统一客户视图）


跨平台合并重复客户，统一客户信息，生成去重后的客户列表。

## 可执行脚本

本技能提供 Python 脚本（零第三方依赖），可直接运行去重：

```bash
# 跨平台合并去重
python scripts/dedup.py --input facebook.json linkedin.json --output result.json

# 从目录批量加载
python scripts/dedup.py --input-dir ./customer_data/ --output result.json

# 自定义相似度阈值（默认 0.70）
python scripts/dedup.py --input data.json --output result.json --threshold 0.80
```

> 脚本使用 `difflib.SequenceMatcher`（Python 标准库），无需 `pip install`。

## 一、去重维度

### 1.1 主要匹配维度

| 维度 | 权重 | 说明 | 示例 |
|------|------|------|------|
| **公司名称** | 40% | 标准化后匹配 | "ABC Industrial" = "ABC Industrial Ltd" |
| **域名** | 30% | 提取主域名匹配 | abc.com = www.abc.com |
| **邮箱域名** | 20% | 邮箱后缀匹配 | @abc.com |
| **电话** | 10% | 数字格式匹配 | +1-xxx = 001-xxx |

### 1.2 公司名称标准化规则

| 规则 | 原始 | 标准化 |
|------|------|--------|
| 移除后缀 | ABC Industrial Ltd | abc industrial |
| 移除前缀 | The ABC Company | abc company |
| 统一大小写 | ABC INDUSTRIAL | abc industrial |
| 移除特殊字符 | ABC-Industrial | abc industrial |
| 移除空格 | ABC  Industrial | abcindustrial |

### 1.3 常见公司后缀

```
Ltd, Limited, Inc, Incorporated, Corp, Corporation
Co, Company, LLC, LLP, GmbH, AG, SA, S.A., B.V.
Group, Holdings, Industries, International, Enterprises
```

## 二、去重流程

### Step 1: 收集客户数据

**输入格式**（支持多平台）：
```json
{
  "platform": "facebook",
  "customers": [
    {
      "name": "ABC Industrial Supply",
      "website": "https://www.abc-industrial.com",
      "email": "sales@abc-industrial.com",
      "phone": "+1-555-123-4567",
      "country": "USA"
    }
  ]
}
```

### Step 2: 标准化数据

```
1. 公司名称转小写
2. 移除公司后缀
3. 移除特殊字符
4. 提取域名主名
5. 格式化电话号码
```

### Step 3: 匹配重复项

**匹配规则**：
- 公司名称相似度 > 80% → 重复
- 域名相同 → 重复
- 邮箱域名相同 + 公司名称相似 → 重复

### Step 4: 合并重复项

**合并策略**：
- 保留最完整的名称
- 合并所有联系方式
- 合并所有来源平台
- 保留最新的信息

### Step 5: 输出去重结果

```json
{
  "unique_customers": [
    {
      "name": "ABC Industrial Supply",
      "normalized_name": "abcindustrialsupply",
      "website": "https://www.abc-industrial.com",
      "domain": "abc-industrial.com",
      "emails": ["sales@abc-industrial.com", "info@abc-industrial.com"],
      "phones": ["+1-555-123-4567"],
      "country": "USA",
      "sources": ["facebook", "linkedin", "instagram"],
      "source_count": 3,
      "first_found": "2026-03-25",
      "last_updated": "2026-03-25"
    }
  ],
  "duplicates_removed": 5,
  "total_unique": 15
}
```

## 三、匹配算法

### 3.1 公司名称相似度

**Levenshtein距离**：
```
相似度 = 1 - (编辑距离 / 最大长度)

示例：
"ABC Industrial" vs "ABC Industries"
编辑距离: 1
最大长度: 15
相似度: 1 - (1/15) = 93% → 重复
```

**Jaccard相似度**（单词集合）：
```
集合A = {ABC, Industrial}
集合B = {ABC, Industries}
交集 = {ABC}
并集 = {ABC, Industrial, Industries}
相似度 = 1/3 = 33% → 可能不重复（需要其他维度确认）
```

### 3.2 域名匹配

```python
# 提取主域名
def extract_domain(url):
    # 移除协议
    url = url.replace("https://", "").replace("http://", "")
    # 移除www
    url = url.replace("www.", "")
    # 移除路径
    domain = url.split("/")[0]
    return domain

# 示例
extract_domain("https://www.abc-industrial.com/about")
→ "abc-industrial.com"
```

### 3.3 综合评分

```
总分 = 公司名称分数 * 0.4 
     + 域名分数 * 0.3 
     + 邮箱域名分数 * 0.2 
     + 电话分数 * 0.1

总分 > 70% → 重复
```

## 四、去重场景

### 场景1: 跨平台去重

```
输入：
- Facebook: 20个客户
- LinkedIn: 15个客户
- Instagram: 12个客户
- 特易海关: 30个客户

处理：
1. 合并所有客户（77个）
2. 标准化
3. 匹配重复
4. 合并信息

输出：
- 去重后客户：45个
- 重复项：32个
```

### 场景2: 同平台去重

```
输入：
- 特易海关搜索结果（多次搜索）
- 搜索1: 秘鲁 - 30个
- 搜索2: 智利 - 25个
- 搜索3: 哥伦比亚 - 20个

处理：
1. 合并搜索结果
2. 去重（同一公司可能出现在多个国家搜索中）

输出：
- 去重后客户：60个
- 重复项：15个
```

### 场景3: 历史数据去重

```
输入：
- 本月新客户：20个
- 历史客户库：500个

处理：
1. 对比新客户与历史客户
2. 识别已存在客户
3. 标记新客户

输出：
- 新客户：15个
- 已存在：5个
```

---

## 详细参考

> 以下内容已拆分到 [[references/extended-guide.md]]，仅在需要时读取：
> - 五、特殊情况处理
> - 六、输出报告
> - 客户去重报告
> - 七、快速命令
> - 八、数据结构
> - 九、注意事项
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。
