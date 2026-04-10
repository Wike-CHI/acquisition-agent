---
name: exa-web-search-free
version: 2.1.0
description: "Free AI search via Exa MCP. ⚠️ 必须使用mcporter调用，禁止使用web_search工具！"
triggers:
  - 免费搜索
  - exa免费搜索
  - exa free
metadata: {"clawdbot":{"emoji":"🔍","requires":{"bins":["mcporter"]}}}
---

# Exa Web Search (Free) v2.1

## ⚠️⚠️⚠️ 强制要求：必须使用MCP，禁止使用web_search ⚠️⚠️⚠️

> **❌ 禁止：使用内置 web_search 工具**
>
> **✅ 正确：用 mcporter call exa.xxx 命令**

---

## 第一步：配置MCP

```bash
mcporter config add exa "https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,deep_search_exa,crawling_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check"

mcporter list  # 验证显示 exa: 8 tools online
```

---

## 第二步：执行搜索

### 决策人搜索（LinkedIn）⭐
```bash
mcporter call exa.people_search_exa query="procurement manager mining cement Africa" numResults=8
```

### 客户发现
```bash
mcporter call exa.web_search_exa query="conveyor belt distributor Brazil" numResults=8
```

### 企业背调
```bash
mcporter call exa.company_research_exa companyName=Votorantim numResults=3
```

---

## 工具清单

| 工具 | 用途 |
|------|------|
| `people_search_exa` | LinkedIn决策人搜索 ⭐ |
| `web_search_exa` | 通用搜索 |
| `company_research_exa` | 企业情报 |
| `crawling_exa` | 网页抓取 |

---

## ❌ 禁止这样做

```javascript
// 错误！禁止用web_search工具
web_search({ query: "..." })
```

---

## 参数格式注意

```bash
# ✅ 正确：query需要引号
mcporter call exa.people_search_exa query="procurement manager" numResults=5

# ❌ 错误：query没有引号
mcporter call exa.people_search_exa query=procurement manager
```

---

## PowerShell

```bash
mcporter call exa.people_search_exa query="procurement manager" numResults=5
```
