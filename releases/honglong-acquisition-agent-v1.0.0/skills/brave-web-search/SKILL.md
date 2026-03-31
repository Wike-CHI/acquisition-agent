---
name: brave-web-search
version: 1.0.0
description: "Brave 网页搜索技能。使用 Brave Search API 进行隐私友好的网页搜索。支持摘要、原创内容过滤。需配置 BRAVE_API_KEY。"
always: false
triggers:
  - brave搜索
  - brave search
  - 网页搜索
---

# Brave Web Search

通过 Brave Search API 进行隐私友好的高质量网页搜索。

## 功能

- **网页搜索** - 独立索引，非 Google 依赖
- **摘要生成** - AI 生成搜索结果摘要
- **原创内容优先** - 过滤转载/聚合内容
- **安全搜索** - 内置安全过滤

## 配置

需要 `BRAVE_API_KEY` 环境变量。免费 API Key 申请：https://brave.com/search/api/

通过 `credential-manager` 配置：
```
请配置 Brave Search API Key
```

## 使用方式

### 基础搜索
```
搜索 "conveyor belt supplier in Brazil"
```

### 带摘要的搜索
```
搜索 "belt splicing machine market size" 并生成摘要
```

## API 调用示例

```python
import requests

headers = {"X-Subscription-Token": BRAVE_API_KEY}
response = requests.get(
    "https://api.search.brave.com/res/v1/web/search",
    headers=headers,
    params={"q": "industrial belt manufacturer", "count": 10}
)
```

## 降级策略

如果 Brave API 不可用，自动降级到：
1. `tavily-search` - Tavily 搜索
2. `multi-search-engine` - 多搜索引擎聚合
3. `web_search` - 内置网页搜索工具
