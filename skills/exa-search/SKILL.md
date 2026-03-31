---
name: exa-search
version: 1.0.0
description: "AI 深度搜索技能。使用 Exa API 进行语义搜索，适合学术内容、公司信息、行业报告等高质量搜索。当用户需要深度搜索、学术内容、公司信息搜索时使用。需配置 EXA_API_KEY。"
always: false
triggers:
  - exa搜索
  - 深度搜索
  - exa search
  - 语义搜索
  - 公司搜索
---

# Exa Search - AI 深度搜索

通过 Exa API 进行 AI 驱动的语义搜索，获取高质量、相关性强的搜索结果。

## 功能

- **语义搜索** - 理解查询意图，非关键词匹配
- **内容搜索** - 搜索网页全文内容
- **域名过滤** - 限定搜索范围（如 linkedin.com）
- **高亮摘要** - 自动提取最相关段落

## 配置

需要 `EXA_API_KEY` 环境变量。通过 `credential-manager` 配置：
```
请配置 Exa 搜索 API Key
```

## 使用方式

### 基础搜索
```
搜索 "industrial belt manufacturer Vietnam"
```

### 域名限定搜索
```
在 linkedin.com 搜索 "belt splicing press procurement manager"
```

### 与获客系统集成
- 客户发现 → 搜索行业关键词+国家
- 决策人定位 → 搜索 LinkedIn 公开档案
- 竞品分析 → 搜索竞争对手官网内容

## API 调用示例

```python
import requests

headers = {"x-api-key": EXA_API_KEY}
response = requests.post(
    "https://api.exa.ai/search",
    headers=headers,
    json={
        "query": "industrial belt press manufacturer",
        "num_results": 10,
        "type": "auto"
    }
)
```

## 降级策略

如果 Exa API 不可用，自动降级到：
1. `tavily-search` - 新闻/实时搜索
2. `multi-search-engine` - 多搜索引擎聚合
3. `web_search` - 内置网页搜索工具
