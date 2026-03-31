---
name: search-first
version: 1.0.0
description: "搜索优先策略技能。在执行任何获客操作前，先优化搜索策略，选择最佳搜索引擎组合，提高搜索效率。"
always: false
triggers:
  - 搜索策略
  - 优化搜索
  - search first
  - 搜索优化
---

# Search First - 搜索优先策略

在获客流程中，先制定搜索策略，再执行搜索操作，避免无效搜索浪费 token。

## 核心理念

**先想再搜** — 明确搜索目标 → 选择最佳引擎 → 组合关键词 → 执行搜索

## 搜索引擎选择矩阵

| 搜索场景 | 首选引擎 | 备选引擎 |
|----------|----------|----------|
| 学术/行业报告 | `exa-search` | `tavily-search` |
| 实时新闻/价格 | `tavily-search` | `brave-web-search` |
| LinkedIn 档案 | `exa-search`（域名过滤）| `linkedin` 技能 |
| 海关数据 | `teyi-customs` | - |
| 国内市场 | `multi-search-engine`（百度）| `tavily-search` |
| 社媒客户 | `facebook-acquisition` / `instagram-acquisition` | `apify-lead-generation` |
| 公司官网 | `brave-web-search` | `scrapling` |
| 行业目录 | `exa-search` | `multi-search-engine` |

## 搜索策略模板

### 客户发现
```
1. 关键词 = 产品关键词 + "manufacturer/supplier/distributor" + 目标国家
2. 先用 exa-search 语义搜索（高质量结果）
3. 再用 tavily-search 补充实时信息
4. 最后用 teyi-customs 查海关数据验证
```

### 决策人定位
```
1. 公司名 + "LinkedIn" → exa-search 域名过滤
2. 公司名 + "procurement/purchasing manager" → brave-web-search
3. 直接用 linkedin 技能搜索
```

## 降级策略

当首选引擎不可用时：
1. 尝试备选引擎
2. 使用 `multi-search-engine`（17个搜索引擎，无需API Key）
3. 使用内置 `web_search` 工具
4. 使用 `scrapling` 直接抓取目标网站
