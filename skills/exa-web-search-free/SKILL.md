---
name: exa-web-search-free
version: 2.2.0
description: Free AI search via Exa MCP through web_search tool. Uses mcporter under the hood with auto-retry.
triggers:
  - 免费搜索
  - exa免费搜索
  - exa free
---

# Exa Web Search (Free) v2.2

## 强制要求：使用 web_search 工具

> **✅ 正确：调用 web_search 工具，search_type 选 company/people/deep/general**
>
> **⚠️ 备选：如 web_search 不可用，用 `mcporter call exa.xxx` 命令**
>
> web_search 内部封装了 mcporter + Exa MCP + 3次重试 + 诊断日志，比手动调 mcporter 更可靠。

---

## 第一步：使用 web_search 工具

```
web_search({ query: "...", search_type: "company", maxResults: 5 })
```

search_type 说明：
| type | 底层 Exa 工具 | 用途 |
|------|-------------|------|
| `company` | company_research_exa | 企业情报 |
| `people` | people_search_exa | LinkedIn决策人搜索 |
| `deep` | deep_search_exa | 扩展多查询研究 |
| `general` | web_search_exa | 通用搜索 |

---

## 参数格式

```javascript
web_search({
  query: "conveyor belt manufacturer Brazil",
  search_type: "company",    // company / people / deep / general
  maxResults: 5,             // 1-10
  search_depth: "basic"      // basic / advanced
})
```

---

## 备选：手动 mcporter（仅 web_search 不可用时）

```bash
mcporter call exa.people_search_exa query="procurement manager" numResults=5
