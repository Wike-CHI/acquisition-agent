---
name: tavily-search
description: 使用 Tavily API 进行网页搜索和实时信息检索。当用户需要搜索最新信息、查找特定网页、或需要实时网络数据时使用。
version: 1.0.0
triggers:
  - tavily
  - tavily搜索
---

# Tavily Search - 网页搜索技能

这个技能提供使用 Tavily API 进行网页搜索的能力。

## 功能

- **网页搜索** - 搜索互联网上的最新信息
- **实时数据** - 获取实时的新闻、价格、天气等信息
- **内容提取** - 从搜索结果中提取关键信息

## 配置

需要配置 Tavily API Key：

1. 访问 https://tavily.com/
2. 注册账号并获取 API Key
3. 配置到环境变量:

```bash
export TAVILY_API_KEY=your_api_key
```

## 使用方法

### 1. 搜索最新信息
```
用户:搜索 GLM-5 最新发布信息
AI: [使用 tavily-search] → 返回最新信息
```

### 2. 查找特定内容
```
用户:找一些外贸获客的最佳实践
AI: [使用 tavily-search] → 返回相关文章
```

### 3. 实时数据
```
用户:今天温州天气怎么样?
AI: [使用 tavily-search] → 返回实时天气
```

## 示例代码
```python
import os
import requests

def tavily_search(query: str, max_results: int = 5):
    """使用 Tavily API 进行搜索"""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Error: TAVILY_API_KEY not configured"
    
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": api_key,
        "query": query,
        "max_results": max_results,
        "include_answer": True
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# 使用示例
result = tavily_search("GLM-5 latest release")
print(result)
```

## 注意事项

- 需要 Tavily API Key
- 免费版有每月 1000 次搜索限制
- 搜索结果包含来源链接和摘要
