---
name: sales
version: 1.0.0
description: 销售助手技能。CRM集成、线索跟踪、外联自动化、Pipeline管理。当用户说"销售管理"、"跟踪客户"、"销售自动化"时使用。
triggers:
  - 销售
  - 销售管理
author: openclaw
---

# Sales Skill 💼

> **Skill Graph：** 领域 → [[_index-conversion|报价与转化领域]] | 上游 ← [[sales-pipeline-tracker|Pipeline数据]] | 下游 → [[smart-quote|智能报价]] / [[holo-sales-trainer|销售培训]]


**Turn your AI agent into an elite sales operations partner.**

Track leads, manage pipelines, automate outreach, and never lose a deal to poor follow-up again.

---

## What This Skill Does

✅ **Lead Tracking** — Capture, qualify, and track leads through your pipeline
✅ **CRM Integration** — Work with your existing CRM or use built-in tracking
✅ **Outreach Automation** — Generate personalized outreach sequences
✅ **Pipeline Management** — Track deals, forecast revenue, identify bottlenecks
✅ **Follow-up Automation** — Never miss a follow-up again
✅ **Sales Analytics** — Track conversion rates, velocity, and win/loss reasons

---

## Quick Start

1. Set up your sales workspace:
```bash
./scripts/sales-init.sh
```

2. Configure your preferences in `TOOLS.md`:
```markdown
### Sales
- CRM: [HubSpot/Salesforce/Notion/Built-in]
- Default pipeline stages: [Stages]
- Follow-up cadence: [Days between touchpoints]
- Meeting booking link: [URL]
```

3. Start tracking leads!

---

## Lead Management

### Lead Qualification Framework (BANT)

| Criteria | Question | Weight |
|----------|----------|--------|
| **Budget** | Can they afford it? | 25% |
| **Authority** | Are they the decision-maker? | 25% |
| **Need** | Do they have a real problem you solve? | 30% |
| **Timeline** | When do they need a solution? | 20% |

**Lead Score Thresholds:**
- 80-100: Hot 🔥 — Contact immediately
- 60-79: Warm — Nurture actively
- 40-59: Cool — Keep in nurture sequence
- 0-39: Cold — Low priority

### Lead Capture Template

```markdown
# Lead: [Company Name]

## Contact Info
- **Name:** [Full Name]
- **Title:** [Job Title]
- **Email:** [Email]
- **Phone:** [Phone]
- **LinkedIn:** [URL]
- **Company:** [Company]
- **Website:** [URL]

## Qualification (BANT)
- **Budget:** [Yes/No/Unknown] — [Notes]
- **Authority:** [Decision-maker/Influencer/User] — [Notes]
- **Need:** [Strong/Moderate/Weak] — [Notes]
- **Timeline:** [Immediate/1-3mo/3-6mo/6mo+] — [Notes]
- **Lead Score:** [X/100]

## Source
- **How they found us:** [Source]
- **First touchpoint:** [Date]
- **Initial interest:** [What they asked about]

## Notes
[Relevant context, pain points, opportunities]

## Next Action
- [ ] [Action] — Due: [Date]
```

---

## Pipeline Management

### Standard Pipeline Stages

| Stage | Definition | Typical Actions |
|-------|------------|-----------------|
| **Lead** | Initial contact, not yet qualified | Qualify, research, initial outreach |
| **Qualified** | BANT criteria met | Discovery call, needs analysis |
| **Discovery** | Understanding needs | Demo prep, stakeholder mapping |
| **Demo/Proposal** | Presenting solution | Demo, proposal creation |
| **Negotiation** | Terms discussion | Handle objections, negotiate |
| **Closed Won** | Deal signed | Onboarding handoff |
| **Closed Lost** | Deal lost | Loss analysis, nurture |

### Pipeline Tracking Template

```markdown
# Sales Pipeline — [Month]

## Summary
- Total pipeline value: $[X]
- Weighted pipeline: $[X]
- Deals in pipeline: [X]
- Expected closes this month: [X]

## By Stage

### Lead ([X] deals, $[X])
| Company | Value | Owner | Last Activity | Next Step |
|---------|-------|-------|---------------|-----------|
| [Name] | $[X] | [You] | [Date] | [Action] |

### Qualified ([X] deals, $[X])
...

### Demo/Proposal ([X] deals, $[X])
...

### Negotiation ([X] deals, $[X])
...

## Stale Deals (>14 days no activity)
| Company | Stage | Last Activity | Recommended Action |
|---------|-------|---------------|-------------------|
```

### Pipeline Velocity Metrics

| Metric | How to Calculate | Target |
|--------|------------------|--------|
| **Win Rate** | Won ÷ (Won + Lost) | >25% |
| **Average Deal Size** | Total Won ÷ # Won | Track trend |
| **Sales Cycle** | Avg days from Lead → Won | <30 days |
| **Pipeline Coverage** | Pipeline ÷ Quota | 3x+ |

---

## Outreach Automation

### Cold Outreach Sequence

**Day 1: Initial Email**
```
Subject: [Personalized hook based on research]

Hi [Name],

[Observation about their company/role — show you did research].

[One sentence about what you do and why it's relevant to them].

[Specific question or soft CTA].

Best,
[Your name]
```

**Day 3: Follow-up 1**
```
Subject: Re: [Original subject]

Hi [Name],

Wanted to make sure this didn't get buried — [brief restate of value].

[New angle or additional value point].

Worth a quick chat?

[Your name]
```

**Day 7: Follow-up 2 (Value Add)**
```
Subject: [Related resource or insight]

Hi [Name],

Found this [article/resource/insight] and thought of you: [link]

[Brief explanation of why it's relevant].

If this resonates, happy to share how we helped [similar company] with [similar challenge].

[Your name]
```

**Day 14: Break-up Email**
```
Subject: Should I close your file?

Hi [Name],

I haven't heard back, so I'm assuming the timing isn't right.

No worries — I'll close out my notes for now.

If things change, feel free to reply anytime.

[Your name]
```

### Personalization Research Checklist

Before outreach, gather:
- [ ] Recent company news (funding, launch, hire)
- [ ] LinkedIn activity (posts, comments, likes)
- [ ] Company blog/newsletter
- [ ] Mutual connections
- [ ] Tech stack (if relevant)
- [ ] Competitors they might use

---

## Follow-up System

### Never Miss a Follow-up

**The Rule:** Every deal has a next action with a due date. No exceptions.

**Follow-up Cadence by Stage:**
| Stage | Check-in Frequency |
|-------|--------------------|
| Lead | Every 3-5 days |
| Qualified | Every 2-3 days |
| Demo/Proposal | Every 1-2 days |
| Negotiation | Daily |

### Follow-up Reminder Template

```markdown
# Daily Follow-up Queue

## Due Today
| Lead | Stage | Last Contact | Reason | Next Action |
|------|-------|--------------|--------|-------------|
| [Co] | [Stage] | [Date] | [Context] | [Action] |

---

## 详细参考

> 以下内容已拆分到 [[references/extended-guide.md]]，仅在需要时读取：
> - Overdue
> - Meeting Management
> - Company Research
> - Attendee Research
> - Their Likely Pain Points
> - Questions to Ask
> - Our Value Proposition for Them
> - Objections to Expect
> - Meeting Goals
> - Attendees
> - Key Takeaways
> - Pain Points Confirmed
> - Decision Process
> - Objections Raised
> - Next Steps
> - Follow-up Email
> - Objection Handling
> - Sales Analytics
> - Summary
> - Pipeline Health
> - Activity Metrics
> - Wins
> - Losses
> - Focus for Next Week
> - Win Patterns
> - Loss Patterns
> - Insights & Actions
> - Scripts
> - CRM Integration
> - Best Practices
> - Common Mistakes
> - License
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。
