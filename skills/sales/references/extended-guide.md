## Overdue
| Lead | Stage | Days Overdue | Priority |
|------|-------|--------------|----------|
| [Co] | [Stage] | [X] days | 🔥/⚠️ |
```

---

## Meeting Management

### Pre-Meeting Research Template

```markdown
# Meeting Prep: [Company]
**Date:** [Date/Time]
**Attendees:** [Names, titles]

## Company Research
- Founded: [Year]
- Size: [Employees]
- Funding: [Stage/Amount]
- Recent news: [Key items]

## Attendee Research
- [Name 1]: [Background, relevant info]
- [Name 2]: [Background, relevant info]

## Their Likely Pain Points
1. [Pain point based on research]
2. [Pain point based on research]

## Questions to Ask
1. [Discovery question]
2. [Discovery question]
3. [Qualification question]

## Our Value Proposition for Them
[Customized pitch based on research]

## Objections to Expect
1. [Likely objection] → [Response]
2. [Likely objection] → [Response]

## Meeting Goals
1. [Specific goal]
2. [Specific goal]
```

### Post-Meeting Notes Template

```markdown
# Meeting Notes: [Company] — [Date]

## Attendees
- [Name, Title]

## Key Takeaways
1. [Insight]
2. [Insight]

## Pain Points Confirmed
- [Pain point]

## Decision Process
- Decision maker: [Name]
- Influencers: [Names]
- Timeline: [When]
- Budget: [Range if discussed]

## Objections Raised
- [Objection]: [How we handled it]

## Next Steps
- [ ] [Action] — Owner: [Name] — Due: [Date]
- [ ] [Action] — Owner: [Name] — Due: [Date]

## Follow-up Email
[Draft the follow-up email here]
```

---

## Objection Handling

### Common Objections & Responses

| Objection | Response Framework |
|-----------|-------------------|
| **"Too expensive"** | Explore value vs cost: "What's the cost of NOT solving this?" |
| **"We use [competitor]"** | "What made you choose them? What's working/not working?" |
| **"Not the right time"** | "What would make it the right time? Can we reconnect then?" |
| **"Need to think about it"** | "Of course. What specifically do you want to think through?" |
| **"Send me info"** | "Happy to. What specifically would be most helpful to see?" |
| **"We're too small"** | "That's actually perfect for [reason]. [Similar customer example]" |

### Objection Documentation

Track objections to improve pitch:
```markdown
# Objection Log

| Date | Company | Objection | Our Response | Result |
|------|---------|-----------|--------------|--------|
| [Date] | [Co] | [Objection] | [Response] | Won/Lost |
```

---

## Sales Analytics

### Weekly Sales Report Template

```markdown
# Sales Report — Week of [Date]

## Summary
- New leads: [X]
- Deals advanced: [X]
- Deals closed won: [X] ($[X])
- Deals closed lost: [X]

## Pipeline Health
- Total pipeline: $[X]
- Change from last week: +/-[X]%
- Weighted pipeline: $[X]
- Forecast this month: $[X]

## Activity Metrics
- Outreach sent: [X]
- Meetings held: [X]
- Proposals sent: [X]
- Follow-ups completed: [X]

## Wins
| Company | Value | Time to Close | Key Factor |
|---------|-------|---------------|------------|
| [Name] | $[X] | [X] days | [What won it] |

## Losses
| Company | Value | Stage Lost | Reason |
|---------|-------|------------|--------|
| [Name] | $[X] | [Stage] | [Why] |

## Focus for Next Week
1. [Priority]
2. [Priority]
```

### Win/Loss Analysis

```markdown
# Win/Loss Analysis — [Quarter]

## Win Patterns
- Common traits of won deals: [Patterns]
- Average deal size: $[X]
- Average sales cycle: [X] days
- Top win reasons:
  1. [Reason]
  2. [Reason]

## Loss Patterns
- Where deals die: [Stage]
- Common objections: [List]
- Top loss reasons:
  1. [Reason]
  2. [Reason]

## Insights & Actions
- [Insight] → [Action to take]
```

---

## Scripts

### sales-init.sh
Initialize your sales workspace with templates and tracking.

### lead-tracker.sh
CLI tool for quick lead management.

```bash
# Add new lead
./scripts/lead-tracker.sh add "Company Name" "Contact Name" "email@company.com"

# List all leads
./scripts/lead-tracker.sh list

# Update lead stage
./scripts/lead-tracker.sh update "Company Name" --stage "demo"

# Get daily follow-ups
./scripts/lead-tracker.sh followups
```

### pipeline-report.sh
Generate pipeline reports.

```bash
# Weekly pipeline summary
./scripts/pipeline-report.sh weekly

# Monthly forecast
./scripts/pipeline-report.sh forecast
```

---

## CRM Integration

### Built-in Tracking

If you don't use an external CRM, use markdown files:

```
sales/
├── leads/
│   ├── company-name.md
│   └── ...
├── pipeline.md
├── analytics/
│   ├── weekly-YYYY-MM-DD.md
│   └── ...
└── templates/
```

### External CRM Integration

**HubSpot:** Use HubSpot API for syncing
**Salesforce:** Use Salesforce API for syncing
**Notion:** Export/import via CSV or API

---

## Best Practices

1. **Follow up relentlessly** — 80% of sales need 5+ touchpoints
2. **Personalize everything** — Generic outreach = ignore
3. **Always have next step** — Every conversation ends with clear action
4. **Track why you lose** — More valuable than why you win
5. **Speed to lead** — Respond within 5 minutes when possible
6. **Listen more than talk** — Discovery > Pitching
7. **Document everything** — Your future self will thank you
8. **Review pipeline weekly** — Stale deals kill forecasts

---

## Common Mistakes

❌ **Pitching before understanding** — Do discovery first
❌ **Forgetting to follow up** — Use reminders religiously
❌ **Vanity metrics** — Calls made matters less than meetings held
❌ **Ignoring closed-lost** — They can become wins later
❌ **No CRM hygiene** — Bad data = bad decisions

---

## License

**License:** MIT — use freely, modify, distribute.

---

*"Sales is not about selling anymore, but about building trust and educating." — Siva Devaki*
