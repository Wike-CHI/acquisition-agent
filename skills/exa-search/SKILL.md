---
name: exa-search
version: 2.0.0
description: "AI 深度搜索技能（免费版）。通过 Exa MCP 进行语义搜索、企业情报、代码搜索、人员搜索、深度调研。无需 API Key。触发词：exa搜索、深度搜索、语义搜索、公司搜索、人员搜索、exa search"
always: false
triggers:
  - exa搜索
  - 深度搜索
  - exa search
  - 语义搜索
  - 公司搜索
  - 人员搜索
  - 企业搜索
---

# Exa Search v2.0 - 免费 AI 深度搜索

通过 Exa 免费 MCP 进行 AI 驱动的语义搜索，**无需 API Key**。

> v2.0 变更：从付费 REST API 迁移到免费 MCP（via mcporter），8个工具全开。

## 前置条件

- mcporter CLI 已安装（`npm i -g mcporter`）
- Exa MCP 已配置：`mcporter config add exa "https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,deep_search_exa,crawling_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check"`

验证：`mcporter list exa` 应显示 8 tools。

## 可用工具（8个）

### 1. web_search_exa — 通用网页搜索
搜索任何话题，返回干净内容。
```bash
mcporter call exa.web_search_exa query="industrial belt manufacturer Vietnam" numResults:5
```
**参数**：query（必填）、numResults（默认8）、type（auto/fast）、freshness（24h/week/month/year）、includeDomains（域名过滤）

### 2. web_search_advanced_exa — 高级过滤搜索
支持日期范围、域名排除、文本过滤等高级条件。
```bash
mcporter call exa.web_search_advanced_exa query="belt press" includeDomains='["linkedin.com"]' startPublishedDate="2025-01-01"
```

### 3. company_research_exa — 企业情报 ⭐
获取公司完整信息：收入、员工、竞争对手、LinkedIn、近期动态。
```bash
mcporter call exa.company_research_exa companyName="Flexco" numResults:3
```

### 4. people_search_exa — 人员搜索 ⭐
搜索职业档案，用于决策人定位。
```bash
mcporter call exa.people_search_exa query="procurement manager conveyor belt" numResults:5
```

### 5. deep_search_exa — 深度搜索
查询扩展，适合复杂研究。
```bash
mcporter call exa.deep_search_exa query="conveyor belt splicing market trends Southeast Asia"
```

### 6. crawling_exa — 网页全文抓取
搜索后深入读取指定 URL 的完整内容。
```bash
mcporter call exa.crawling_exa urls='["https://example.com"]' maxCharacters:5000
```

### 7. get_code_context_exa — 代码/文档搜索
搜索 GitHub、StackOverflow 代码示例。

### 8. deep_researcher_start / deep_researcher_check — AI 深度调研
启动异步调研任务并检查结果。

## 获客链路集成

| 路由意图 | 使用工具 | 用途 |
|----------|----------|------|
| customer_discovery（P4-5） | web_search_exa | 按行业+国家搜索潜在客户 |
| decision_maker_search（P5） | people_search_exa | 搜索 LinkedIn 职业档案 |
| company_research（fallback） | company_research_exa | 企业情报：收入/员工/竞品 |
| 背调深入 | crawling_exa | 抓取官网完整内容 |

## 调用注意事项

**PowerShell 环境下必须用 `cmd /c` 包一层**，否则引号转义会出错：
```bash
cmd /c "mcporter call exa.company_research_exa companyName=""Flexco"" numResults:3"
```

## 降级策略

如果 Exa MCP 不可用：
1. 内置 `web_search` 工具 — 通用网页搜索
2. `web_fetch` 工具 — 抓取已知 URL

## 与 exa-web-search-free 的关系

`exa-web-search-free` 是同一套 MCP 的另一个技能包，功能完全一致。
本技能（`exa-search`）作为获客路由表的统一入口，推荐优先使用本技能。
