---
name: exa-search
version: 2.3.0
description: "AI 深度搜索技能（免费版）。通过 Exa MCP 进行语义搜索、企业情报、LinkedIn决策人搜索、深度调研。无需 API Key。触发词：exa搜索、深度搜索、LinkedIn搜索、找决策人、找客户"
always: false
triggers:
  - exa搜索
  - 深度搜索
  - 语义搜索
  - 公司搜索
  - 人员搜索
  - LinkedIn搜索
  - 找决策人
  - 找客户
  - 客户发现
---

# Exa Search v2.3 - AI深度搜索（禁止使用web_search！）

## ⚠️⚠️⚠️ 强制要求：必须使用MCP，禁止使用web_search ⚠️⚠️⚠️

> **本技能是红龙获客系统的核心搜索工具！**
>
> **❌ 禁止行为：使用内置 web_search 工具**
>
> **✅ 正确行为：使用 mcporter call exa.xxx 命令**

---

## 第一步：配置MCP（首次必做）

```bash
# 添加Exa MCP
mcporter config add exa "https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,deep_search_exa,crawling_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check"

# 验证配置
mcporter list
```

**期望输出**：`exa: 8 tools online`

---

## 第二步：执行搜索（必须用这个！）

### ✅ 正确格式
```bash
# LinkedIn决策人搜索 ⭐
mcporter call exa.people_search_exa query="procurement manager mining cement Africa" numResults=5

# 通用搜索
mcporter call exa.web_search_exa query="conveyor belt distributor Brazil" numResults=5

# 企业情报
mcporter call exa.company_research_exa companyName=Votorantim numResults=3
```

### ❌ 错误做法（禁止使用！）
```bash
# 错误1：用web_search工具
web_search query="..."

# 错误2：参数格式错误
mcporter call exa.web_search_exa query=conveyor belt  # query需要引号
```

---

## 工具速查表

| 工具 | 用途 | 命令示例 |
|------|------|----------|
| `people_search_exa` | **LinkedIn决策人搜索** ⭐ | `query="procurement manager mining"` |
| `web_search_exa` | 通用网页搜索 | `query="conveyor belt factory"` |
| `company_research_exa` | 企业情报 | `companyName=Votorantim` |
| `crawling_exa` | 网页全文抓取 | `urls=["https://..."]` |

---

## 获客场景标准用法

### 场景1：找决策人（LinkedIn）⭐ 最常用
```bash
mcporter call exa.people_search_exa query="procurement manager mining quarry cement Africa" numResults=8
mcporter call exa.people_search_exa query="supply chain director rubber belt factory" numResults=8
```

### 场景2：找客户
```bash
mcporter call exa.web_search_exa query="conveyor belt distributor manufacturer Brazil" numResults=8
```

### 场景3：企业背调
```bash
mcporter call exa.company_research_exa companyName=Votorantim numResults=3
```

### 场景4：抓取官网
```bash
mcporter call exa.crawling_exa urls=["https://company.com/about"] maxCharacters=5000
```

---

## PowerShell注意事项

```bash
# PowerShell直接执行即可
mcporter call exa.people_search_exa query="procurement manager mining" numResults=5
```

---

## 常见问题

**Q: 报 "Tool not found" 错误？**
A: MCP配置不完整，重新执行第一步的配置命令。

**Q: 报 "Invalid parameter" 错误？**
A: query参数必须加引号！

**Q: 想用web_search工具？**
A: ❌ 禁止！必须用 `mcporter call exa.web_search_exa`

---

## 更新日志

- v2.3: 修正参数格式，query需要引号
- v2.2: 强调必须使用MCP，禁止web_search
- v2.1: 添加详细配置教程
