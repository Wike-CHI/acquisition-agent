---
name: email-marketing
version: 1.1.0
description: Email deliverability, list management, sequences, segmentation, campaign optimization. 红龙获客系统定制版增加工业皮带设备行业专用模板和策略。
triggers:
  - 邮件营销
  - email marketing
---

## Deliverability Foundations

- Authenticate all sending domains: SPF, DKIM, and DMARC — missing any one tanks deliverability
- Warm up new domains/IPs: start with 50-100 emails/day, increase 20% daily over 2-4 weeks
- Never buy email lists — purchased lists destroy sender reputation permanently
- Clean list regularly: remove bounces immediately, unengaged after 90 days
- Monitor blacklists: MXToolbox, Google Postmaster Tools — problems compound if not caught early

## List Health Metrics

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Open rate | >20% | 10-20% | <10% |
| Click rate | >2% | 1-2% | <1% |
| Bounce rate | <2% | 2-5% | >5% |
| Unsubscribe | <0.5% | 0.5-1% | >1% |
| Spam complaints | <0.1% | 0.1-0.3% | >0.3% |

- One spam complaint per 1000 emails is the danger zone — above this, inbox placement drops sharply

## Subject Lines

- 40-50 characters optimal — truncates on mobile after 35-40
- Personalization works: name or company in subject increases opens 10-20%
- Curiosity beats clarity for opens, but clarity wins for clicks — balance based on goal
- Avoid spam triggers: ALL CAPS, excessive punctuation!!!, "free", "act now"
- Test emoji: works for some audiences, hurts others — A/B test before committing
- Preview text is second subject line — don't waste it with "View in browser"

## Email Sequences

**Welcome sequence (5-7 emails over 2 weeks):**
1. Immediate: Deliver promised value + set expectations
2. Day 1: Best content or quick win
3. Day 3: Story/origin + values
4. Day 5: Social proof + case study
5. Day 7: Soft offer or deeper engagement
6. Day 10: Address common objection
7. Day 14: Clear CTA

- First email in sequence has highest open rate — make it count
- Space emails 1-3 days apart — daily is too aggressive for most audiences

## Segmentation

- Segment by behavior, not just demographics — what they clicked matters more than job title
- Minimum viable segments: new subscribers, engaged (opened in 30 days), unengaged, customers
- Tag on every click — builds behavioral profile automatically
- Sunset unengaged subscribers after 90 days — send re-engagement, then remove
- VIP segment for highest engagement — reward them with early access, exclusives

## Timing and Frequency

- Tuesday-Thursday mid-morning performs best on average — but test your audience
- B2B: business hours. B2C: evenings and weekends can work
- Frequency depends on value: daily works if valuable, weekly fails if boring
- Let subscribers choose frequency — reduces unsubscribes significantly
- Send time optimization: most ESPs offer this, use it

## Campaign Types

- **Newsletter**: regular value, builds relationship, low direct conversion
- **Promotional**: clear offer, urgency, direct conversion focus
- **Transactional**: receipts, confirmations — highest open rates, add value here
- **Re-engagement**: "We miss you" + incentive + easy unsubscribe
- **Announcement**: product launches, major updates — segment to interested only

## Writing for Email

- One goal per email — multiple CTAs dilute response
- Write for skimmers: bold key phrases, short paragraphs, bullet points
- P.S. lines get read — put secondary CTA or key point there
- Plain text often outperforms HTML for personal-style emails
- Mobile-first: 60%+ open on mobile — single column, large tap targets

## Automation Triggers

- Sign up → Welcome sequence
- Purchase → Onboarding + cross-sell sequence
- Abandoned cart → 3-email recovery (1h, 24h, 72h)
- No open in 30 days → Re-engagement sequence
- Link click → Tag and trigger relevant follow-up
- Date-based → Birthday, renewal reminder, anniversary

## A/B Testing

- Test one variable at a time: subject, send time, CTA, from name
- Need 1000+ recipients per variant for statistical significance
- Subject line tests: 20% of list first, winner to remaining 80%
- Measure what matters: opens for subject, clicks for content, conversions for offers
- Document every test — institutional learning prevents repeat experiments

## Common Mistakes

- Sending to entire list always — segment or face declining engagement
- No double opt-in — leads to fake emails and spam traps
- Ignoring mobile preview — broken layouts kill credibility
- Same email to all segments — personalization is expected now
- Hard selling too early — value first, offer later
- Ignoring unsubscribe feedback — they tell you what's wrong

## Compliance

- Include physical address in every email — required by CAN-SPAM, GDPR
- Unsubscribe must work within 10 days — one-click preferred
- Honor opt-outs immediately — delayed removal is illegal in many jurisdictions
- GDPR: explicit consent required, document it, allow data deletion
- Separate consent for different email types — marketing vs transactional

---

## 红龙行业定制 — B2B 工业皮带设备开发信

> 以下内容为红龙获客系统定制，基于 B2B 冷邮件开发信场景。

### 红龙专用邮件序列（Drip Campaign）

| 轮次 | 时间 | 主题 | 目标 |
|------|------|------|------|
| D0 | 发送当天 | 产品介绍 + 公司背景 | 建立初步印象 |
| D3 | 第3天 | 价值主张 + 案例数据 | 展示差异化优势 |
| D7 | 第7天 | 技术细节 + 认证资质 | 建立专业信任 |
| D14 | 第14天 | 限时优惠 + Sample | 促成行动 |

### 行业专用 Subject Line 公式

| 公式 | 示例 | 适用场景 |
|------|------|----------|
| 产品 + 痛点 | "Cut your belt splicing time by 40%" | 首次接触 |
| 地区 + 产品 | "Conveyor belt solutions for [Country] distributors" | 区域定向 |
| 问题 + 解决 | "Struggling with uneven splicing? There's a better way" | 痛点切入 |
| 简洁直接 | "HOLO belt equipment catalog" | 专业买家 |

### 红龙产品邮件模板

**D0 — 首次接触**：
```
Subject: Industrial Belt Solutions - {Company}

Hi {FirstName},

Noticed {Company} works with conveyor belt systems.

We manufacture belt splicing equipment at HOLO (20+ years, CE certified):
- Air/Water Cooled Press (Finger Puncher)
- Belt Slitting Machine
- Ply Separator

Currently serving distributors in {Region}.

Would a product catalog be useful?

Best,
{Signature}
```

**D3 — 价值主张**：
```
Subject: Re: Industrial Belt Solutions - {Company}

Hi {FirstName},

Following up with a quick comparison:

| Feature | HOLO | Typical |
|---------|------|---------|
| Temperature control | ±1°C | ±5°C |
| Splicing time | 15 min | 25 min |
| Belt width | up to 2000mm | up to 1500mm |

Happy to send test results or schedule a call.

Best,
{Signature}
```

**D7 — 技术信任**：
```
Subject: Re: Industrial Belt Solutions - {Company}

Hi {FirstName},

Some specs that matter for belt fabrication:
- Press area: 300x600mm to 1800x12000mm
- Heating method: air-cooled / water-cooled options
- CE certification, ISO 9001 compliant

Website: www.beltsplicepress.com

No pressure — just want you to have the info.

Best,
{Signature}
```

### 红龙客户分层邮件策略

| 客户类型 | 邮件重点 | CTA |
|----------|----------|-----|
| 输送带分销商 | 产品多样性 + 价格竞争力 | 索取 Catalog |
| 皮带加工厂 | 原带质量 + 加工设备 | 索取报价 |
| 工程公司/集成商 | 技术能力 + 定制方案 | 预约技术通话 |
| 终端用户 | 一站式解决方案 | 索取 Sample |

### 红龙签名规范

```
Best regards,
{业务员姓名}
Sales Manager
HOLO (温州红龙工业设备制造有限公司)
WhatsApp: {号码}
Email: {工作邮箱}
Web: www.beltsplicepress.com
Address: 瑞安市东山街道望新路188号3幢101室
```
