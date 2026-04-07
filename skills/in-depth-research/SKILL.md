---
name: in-depth-research
version: 1.0.0-honglong-override
description: 深度研究技能的红龙定制包装入口。检测到 HONGLONG-OVERRIDE.md 时优先使用定制内容。
triggers:
  - 深度研究
  - 深度调研
  - in-depth research
---

# 技能路由入口 — in-depth-research

> 本文件为 in-depth-research 技能的路由入口。
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

---
name: In-Depth Research
version: 1.0.0
description: Conducts comprehensive research on markets, companies, technologies, and trends with multi-source validation and structured output. 当需要进行深度调研、背景调查、全面研究时使用此技能。
---

# In-Depth Research

Multi-source research skill that validates findings across sources and delivers decision-ready intelligence.

## Research Methodology

### Phase 1: Source Identification
- Define research scope and key questions
- Identify authoritative primary sources (industry reports, government data, academic papers)
- Map secondary sources (news, blogs, company filings)

### Phase 2: Parallel Collection
- Execute searches across all identified sources simultaneously
- Document source quality and recency
- Flag contradictions immediately

### Phase 3: Triangulation
- Cross-validate key facts across 3+ independent sources
- Weight findings by source reliability
- Calculate confidence scores for each finding

### Phase 4: Synthesis
- Structure output by research question
- Distinguish facts from interpretations
- Highlight areas of uncertainty

## Output Standards

| Standard | Requirement |
|----------|-------------|
| Source count | Minimum 5 independent sources |
| Recency | No data older than 24 months without caveat |
| Attribution | Every claim traced to source |
| Confidence | High/Medium/Low/Unknown for each finding |
