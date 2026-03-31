---
name: webserp
description: 网页搜索技能 - 使用搜索引擎搜索网页信息并提取内容。当用户需要搜索最新信息、查找特定网页、或需要实时网络数据时使用。
---

# WebSerp - 网页搜索技能

这个技能提供网页搜索能力，帮助 AI 获取实时网络信息。

## 功能

- **网页搜索** - 使用搜索引擎搜索网页
- **内容提取** - 从搜索结果中提取关键信息
- **结果汇总** - 整理搜索结果并生成摘要

## 使用场景

### 1. 搜索最新信息

```
用户：搜索 GLM-5 最新发布信息
AI：[使用 webserp 搜索] → 返回最新信息
```

### 2. 查找特定内容

```
用户：找一些外贸获客的最佳实践
AI：[使用 webserp 搜索] → 返回相关文章
```

### 3. 实时数据

```
用户：今天温州天气怎么样？
AI：[使用 webserp 搜索] → 返回实时天气
```

## 工具

### web_search

搜索网页内容。

**参数：**
- `query` (必需): 搜索查询
- `count` (可选): 返回结果数量，默认5
- `country` (可选): 国家代码，如 'CN', 'US'
- `language` (可选): 语言代码，如 'zh', 'en'

**示例：**
```json
{
  "query": "GLM-5 智谱AI 最新发布",
  "count": 5,
  "language": "zh"
}
```

### web_fetch

获取网页内容。

**参数：**
- `url` (必需): 网页URL
- `extractMode` (可选): 提取模式，'markdown' 或 'text'

**示例：**
```json
{
  "url": "https://example.com/article",
  "extractMode": "markdown"
}
```

## 配置

需要配置搜索引擎 API：

```bash
# 配置 Brave Search API
openclaw configure --section web

# 或设置环境变量
BRAVE_API_KEY=your_api_key
```

## 注意事项

1. **API 限制** - 搜索 API 有调用限制，请合理使用
2. **内容验证** - 搜索结果需要验证准确性
3. **隐私保护** - 不要搜索敏感个人信息

## 示例工作流

### 背调场景

```
1. 用户：帮我背调这家公司 ABC Corp
2. AI：[webserp] 搜索 "ABC Corp company info"
3. AI：[webserp] 搜索 "ABC Corp news"
4. AI：整合信息，生成背调报告
```

### 市场调研

```
1. 用户：工业皮带接驳设备市场趋势
2. AI：[webserp] 搜索 "conveyor belt splicing market trends 2024"
3. AI：[webserp] 搜索 "industrial belt equipment market size"
4. AI：整合信息，生成市场报告
```

---

*版本: 1.0.0*
*作者: PaperBoardOfficial*
*适配: OpenClaw*
