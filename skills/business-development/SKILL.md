---
name: business-development
version: 1.0.0
description: 商务拓展技能。合作伙伴外联、市场研究、竞品分析、提案生成。当用户说"找合作伙伴"、"做市场分析"、"写商务提案"时使用。
author: openclaw
triggers:
  - 商务拓展
  - partnership
  - BD
---

# Business Development Skill — 红龙工业设备商务拓展

> **Skill Graph：** 领域 → [[_index-conversion|报价与转化领域]]


**红龙工业设备外贸商务拓展。** 找经销商、分析竞品、市场扩张、展会策略。

> 核心参考：`docs/全球大客户战略地图.md` — 11家竞品、9大区域优先级、利润底线

## 红龙核心策略
- **先做经销商的供应商** — 成为已有分销网络的设备供货商
- **整套方案切入** — 接头机+打齿机+分层机组合，提高客单价
- **对标 Flexco/Almex 做替代** — TCO算账，"同样的品质，省60%"
- **Beltwin 是合作伙伴** — 温州同行十年合作，不攻击不抢客户
- **展会+拜访** — 美国/欧洲展会是接触大客户最佳途径

---

## What This Skill Does

✅ **Dealer Discovery** — 找海外经销商/代理商/分销商
✅ **Market Research** — 分析目标市场规模、趋势、机会
✅ **Competitor Analysis** — 跟踪竞品动态（Flexco/Almex/ContiTech etc.）
✅ **Proposal Generation** — 商业提案和合作提案
✅ **Strategic Planning** — 支持市场扩张决策

---

## Quick Start

1. Configure your BD focus in `TOOLS.md`:
```markdown
### Business Development
- Target markets: [Industries/Geographies]
- Partnership types: [Integration/Reseller/Co-marketing/etc.]
- Competitor watch list: [Key competitors]
- Proposal templates: [Location]
```

2. Set up your workspace:
```bash
./scripts/bd-init.sh
```

3. Start building partnerships!

---

## Partnership Development

### Partnership Types

| Type | Description | Value Proposition |
|------|-------------|-------------------|
| **Integration** | Technical product connection | Expand functionality, reach new users |
| **Reseller/Distribution** | Sell through partners | Access new channels, scale faster |
| **Co-Marketing** | Joint marketing efforts | Share audiences, reduce CAC |
| **Referral** | Lead sharing | Lower-friction partnership |
| **Strategic** | Deep collaboration | Market expansion, shared resources |
| **White-Label** | Rebrand product for partner | New revenue stream |

### Partner Qualification Framework

**PARTNER Score:**

| Criteria | Question | Weight |
|----------|----------|--------|
| **P**otential | What's the upside? | 20% |
| **A**lignment | Do goals/values match? | 20% |
| **R**each | What audience can they access? | 15% |
| **T**iming | Are they ready now? | 15% |
| **N**eed | Do they need what we offer? | 15% |
| **E**xperience | Have they done this before? | 10% |
| **R**isk | What could go wrong? | 5% |

**Score 70+:** Prioritize actively
**Score 50-70:** Keep warm
**Score <50:** Deprioritize

### Partner Profile Template

```markdown
# Partner Profile: [Company Name]

## Overview
- **Company:** [Name]
- **Website:** [URL]
- **Industry:** [Industry]
- **Size:** [Employees / Revenue if known]
- **Founded:** [Year]
- **HQ:** [Location]

## Key Contacts
- **Primary:** [Name, Title, Email, LinkedIn]
- **Secondary:** [Name, Title, Email, LinkedIn]

## Their Business
- **What they do:** [Description]
- **Target customers:** [Who they serve]
- **Key products:** [Products/Services]
- **Competitive advantage:** [What makes them different]

## Partnership Opportunity
- **Type:** [Integration/Reseller/Co-marketing/etc.]
- **Value to them:** [What we offer]
- **Value to us:** [What they offer]
- **Synergy:** [How we complement each other]

## Qualification (PARTNER Score)
- Potential: [X/10] — [Notes]
- Alignment: [X/10] — [Notes]
- Reach: [X/10] — [Notes]
- Timing: [X/10] — [Notes]
- Need: [X/10] — [Notes]
- Experience: [X/10] — [Notes]
- Risk: [X/10] — [Notes]
- **Total:** [X/70]

## Research Notes
[Relevant findings from research]

## Status & Next Steps
- **Current stage:** [Prospect/Outreach/Discussion/Negotiation/Active]
- **Last contact:** [Date]
- **Next action:** [Action] — Due: [Date]
```

---

## Partnership Outreach

### Outreach Sequence

**Phase 1: Research (Before Contact)**
- [ ] Company website deep dive
- [ ] Key personnel LinkedIn research
- [ ] Recent news/press releases
- [ ] Existing partnerships they have
- [ ] Mutual connections check
- [ ] Their tech stack (if relevant)

**Phase 2: Initial Outreach**

Email Template:
```
Subject: Partnership idea: [Specific value proposition]

Hi [Name],

[Personalized observation showing you did research — reference something specific they did/said].

I lead BD at [Your Company]. We [brief description of what you do] for [target customers].

I noticed [observation about their business] and think there's an interesting opportunity to [specific partnership concept].

[One sentence on mutual benefit — what's in it for them + what's in it for you].

Would you be open to a quick call to explore?

Best,
[Your name]
```

**Phase 3: Follow-up**

Day 5:
```
Subject: Re: Partnership idea

Hi [Name],

Wanted to follow up on my note below. I've been thinking more about how [specific idea] could work.

[Add one more value point or insight].

Worth 15 minutes to discuss?

[Your name]
```

Day 12 (Value-add):
```
Subject: [Relevant resource/insight]

Hi [Name],

Found this [article/report/insight] and thought of you: [link]

[Brief tie to why it's relevant to potential partnership].

Still think there's something interesting here if you're open to exploring.

[Your name]
```

### Partnership Meeting Agenda

```markdown
# Partnership Discussion: [Company]
**Date:** [Date]
**Attendees:** [Names]

## Agenda (30 min)

1. **Intros** (5 min)
   - Background on each company
   - Roles in the partnership

2. **Opportunity Discussion** (10 min)
   - Partnership concept
   - Mutual value proposition
   - Initial scope

3. **Alignment Check** (10 min)
   - Goals and expectations
   - Potential challenges
   - Resources needed

4. **Next Steps** (5 min)
   - Action items
   - Timeline
   - Next meeting

## Questions to Ask
- What would success look like for you?
- What's your typical partnership process?
- Who else needs to be involved?
- What's your timeline for decision?
```

---

## Market Research

### Market Research Framework

**1. Market Sizing (TAM/SAM/SOM)**

| Metric | Definition | How to Calculate |
|--------|------------|------------------|
| **TAM** | Total Addressable Market | Total revenue if you had 100% market share |
| **SAM** | Serviceable Addressable Market | Portion you can actually reach |
| **SOM** | Serviceable Obtainable Market | Realistic near-term capture |

**2. Market Analysis Template**

```markdown
# Market Research: [Market/Industry]

---

## 详细参考

> 以下内容已拆分到 [[references/extended-guide.md]]，仅在需要时读取：
> - Executive Summary
> - Market Size
> - Market Dynamics
> - Customer Segments
> - Competitive Landscape
> - Trends
> - Opportunities
> - Threats
> - Recommendations
> - Sources
> - Competitor Analysis
> - Overview
> - Product/Service
> - Strengths
> - Weaknesses
> - Market Position
> - Recent Moves
> - Their Customers
> - How We Compare
> - Battlecard (for sales)
> - Positioning Map
> - Feature Comparison
> - Summary
> - Proposal Generation
> - Executive Summary
> - The Opportunity
> - The Partnership
> - How It Works
> - Commercial Terms
> - Success Metrics
> - Risk Mitigation
> - About [Your Company]
> - Next Steps
> - BD Pipeline Management
> - Summary
> - By Stage
> - Stale Opportunities (>30 days no activity)
> - Strategic Planning
> - Strengths (Internal, Positive)
> - Weaknesses (Internal, Negative)
> - Opportunities (External, Positive)
> - Threats (External, Negative)
> - Strategic Implications
> - Context
> - Options
> - Evaluation
> - Recommendation
> - Risks & Mitigations
> - Next Steps
> - Scripts
> - Best Practices
> - Common Mistakes
> - License
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。
