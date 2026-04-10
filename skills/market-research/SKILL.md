---
name: market-research
slug: market-research
version: 1.0.1
description: 市场研究技能的红龙定制包装入口。检测到 HONGLONG-OVERRIDE.md 时优先使用定制内容。
triggers:
  - 市场分析
  - 竞争分析
  - 市场规模
  - TAM SAM SOM
  - industry research
  - 市场调研
  - 竞品分析
  - 竞争对手分析
---

# 技能路由入口 — Market Research

> 本文件为 market-research 技能的路由入口。
> **不随社区技能更新覆盖**，保持红龙定制逻辑。

## 路由逻辑

AI Agent 执行以下检测：

```
本文件所在目录是否存在 HONGLONG-OVERRIDE.md？
    │
    ├─ 是 → 读取 HONGLONG-OVERRIDE.md 内容作为完整技能指令
    │         （跳过以下原始社区技能内容）
    │
    └─ 否 → 读取下方原始社区技能内容执行
```

> **为什么这样设计**：HONGLONG-OVERRIDE.md 是独立文件，社区技能更新只覆盖 SKILL.md，
> 不覆盖 HONGLONG-OVERRIDE.md，红龙定制内容得以保留。

---

## 原始社区技能内容

> 以下为原始 clawdhub 技能内容（仅当 HONGLONG-OVERRIDE.md 不存在时使用）

<!-- honglong-override: original community skill metadata
name: Market Research
description: "Research markets with sizing, segmentation, competitor mapping, pricing checks, and demand validation that turn fuzzy ideas into decision-ready evidence."
-->

# Market Research

Research markets with sizing, segmentation, competitor mapping, pricing checks, and demand validation.

## Market Sizing

### TAM/SAM/SOM Framework

- **TAM** (Total Addressable Market): Full market demand
- **SAM** (Serviceable Addressable Market): Segment you can serve
- **SOM** (Serviceable Obtainable Market): Realistic share in near term

### Data Sources

| Level | Sources |
|-------|---------|
| TAM | Industry associations, government statistics, global reports |
| SAM | Regional data, trade publications, company filings |
| SOM | Historical win rates, sales capacity, market share data |

## Segmentation

### B2B Segmentation Variables

| Variable | Options |
|----------|---------|
| Industry | Technology, Healthcare, Finance, Manufacturing... |
| Company size | Startup, SMB, Mid-Market, Enterprise |
| Geography | Country, Region, City tier |
| Behavior | Usage frequency, Feature adoption, Revenue impact |

## Competitor Mapping

### Framework

1. **Direct competitors** — Same product, same audience
2. **Indirect competitors** — Substitute products, adjacent audiences
3. **Potential competitors** — Could enter your space

### Output

- Market share estimates (even rough percentages are valuable)
- Competitive positioning map (2x2 on key dimensions)
- Win/loss patterns against each competitor

## Pricing Analysis

- Public pricing (if available)
- Quote distribution from sales team
- Industry benchmarks from analysts

## Demand Validation

- Search volume trends (Google Trends, industry keywords)
- Social mention volume and sentiment
- Sales team signal (are prospects aware of the problem?)

## Output Format

```
## Market Overview
## Sizing (TAM/SAM/SOM)
## Segmentation
## Competitive Landscape
## Pricing Trends
## Demand Signals
## Strategic Recommendations
```
