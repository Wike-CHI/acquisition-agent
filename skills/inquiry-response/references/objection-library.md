# 异议应答库

> 询盘应答技能的核心模块
> 覆盖 B2B 工业设备外销的 15 个高频异议场景
> 每个场景提供 2-4 种策略，含中英双语话术
>
> 版本：1.0.0 | 更新：2026-04-11

---

## 使用方法

```
1. 识别客户说的属于哪个异议（A01-A15）
2. 根据客户地区选择文化适配的策略
3. 根据客户具体措辞微调话术
4. 填入客户背景信息（公司名、痛点等）
5. 用 sdr-humanizer 去AI味后再发送
```

---

## A01 "太贵了 / Your price is too high"

> 出现频率：★★★★★ | 这是最大概率遇到的异议

### 策略1：价值分解（把总价拆到使用维度）

中文思路：不要正面讨论总价，把成本拆到每天/每次使用/每米接头，让客户感受到"其实很便宜"。

EN:
```
I totally understand — price matters. Let me put it in perspective:

A HOLO splicing press typically lasts 8-10 years with proper maintenance.
If you splice just 2 belts per week, that's roughly 100 splices per year.
Over 8 years, the cost per splice comes down to under $[X].

Compare that to the cost of one failed joint — downtime, material waste,
and emergency repairs can easily run $[Y] per incident.

The real question isn't "is it expensive?" — it's "can I afford NOT to
have reliable equipment?"
```

适配：
- 美国/澳洲：直接给数字，算ROI
- 德国：加技术参数佐证寿命
- 东南亚：强调"长期省钱"

### 策略2：对比行业均价（不提具体竞品名）

EN:
```
In the conveyor belt splicing equipment market, prices generally fall into
three tiers:

- European brands (e.g., German/Austrian): $15,000-25,000+
- Chinese manufacturers: $3,000-8,000
- HOLO: positioned at the sweet spot — European-standard quality at a
  fraction of the price.

We use imported components (Thomas pumps, SMC pneumatics, Omron controls)
and our machines are CE certified. The difference is we manufacture in
China with lower overhead, not lower standards.
```

### 策略3：条件让步（降价换条件）

EN:
```
I appreciate you being upfront about budget. Here's what I can do:

If you can confirm the order within [X days], I can offer:
- [5-8]% discount, OR
- Free spare parts kit (value $[X]), OR
- Free shipping to [port]

Which option works better for you?
```

注意：让步必须换条件（快速确认、增加数量、预付款等），不能无条件降价。

### 策略4：试探真实原因

EN:
```
Thanks for sharing that. Just so I can help find the best solution —
is the concern about the total investment, or about fitting it into
this quarter's budget?

Sometimes we can work with payment terms or phasing the order to
make it more manageable.
```

目的：很多时候"太贵了"不是真正原因，可能是预算周期、老板没批、或者跟别家在比价。先搞清楚真正卡在哪。

---

## A02 "我们已经有供应商了 / We already have a supplier"

> 出现频率：★★★★★

### 策略1：不否定，备胎定位

EN:
```
That's great — having a reliable supplier is important. I'm not asking
you to replace them.

What I'd suggest is keeping HOLO as a backup option. When your current
supplier has long lead times, quality issues, or you need a different
specification, we can step in quickly.

Many of our customers started exactly this way — using us for rush orders
or specialty items, then gradually shifting more volume as they saw the
quality firsthand.

Would it be okay if I send you our catalog for future reference?
```

### 策略2：找缺口（现有供应商满足不了的需求）

EN:
```
Understood. Out of curiosity — is there anything your current supplier
doesn't cover? For example:

- Custom voltage (60Hz) or non-standard belt widths?
- Faster lead times for urgent orders?
- Technical support in a different time zone?

We specialize in filling those gaps. Even if you're happy overall, having
a second source for edge cases can save you a lot of headaches.
```

### 策略3：样品/试用策略

EN:
```
Completely understand. Many long-term supplier relationships work well
until they don't.

How about this — let me send you a small order at a trial price.
You can compare the quality and service firsthand with zero risk.

Some of our best customers today started with a single test order.
```

---

## A03 "没听过你们品牌 / Never heard of your company"

> 出现频率：★★★★☆

### 策略1：用数据说话

EN:
```
I get that — we're not a household name like Flexco. But here's what
might surprise you:

- 800+ customers worldwide across 40+ countries
- 10+ years in the industry, manufacturing since 2006
- 70+ technical staff in our 5,500 sqm factory
- CE certified, National High-Tech Enterprise (China)
- OEM supplier for several well-known brands in the industry

We've been quietly doing the work behind the scenes. I'd love to show
you our factory via video call if you're interested.
```

### 策略2：免费验证降低风险

EN:
```
That's fair — trust takes time. Here's how other customers handled it:

1. We schedule a video factory tour (30 min)
2. You can request a test splicing video for your specific belt type
3. Start with a small trial order
4. We provide 12-month warranty + lifetime technical support

The risk is minimal, and many customers who started skeptical are now
ordering regularly. Shall I set up a factory tour?
```

---

## A04 "让我考虑考虑 / Let me think about it"

> 出现频率：★★★★☆
> 注意：在不同文化中含义不同。美国客户说这话大概率是委婉拒绝；巴西/中东可能是真的需要时间。

### 策略1：设置时效（制造紧迫感但不逼单）

EN:
```
Of course — it's an important decision. Take your time.

Just so you know, our current pricing is valid until [date]. After that,
raw material costs may push a [5-10]% increase across the board.

Also, our production schedule for next month is filling up. If you decide
within [X days], I can guarantee delivery by [date].

No pressure at all. When would be a good time for me to follow up?
```

### 策略2：消除犹豫的根源

EN:
```
Absolutely. While you're thinking it over, is there anything specific
holding you back? Common concerns from customers at this stage:

- Worried about quality? → I can send test reports or a sample video
- Budget timing? → We can adjust payment terms
- Need internal approval? → I can prepare a comparison document for your boss
- Not sure which model? → Tell me your belt specs and I'll recommend

I want to make sure you have everything you need to make the best decision.
```

### 策略3：阶梯跟进计划

```
Day 1:  发送补充资料（产品视频、客户案例、技术参数）
Day 3:  发送行业资讯/应用案例（不提销售，只分享价值）
Day 7:  轻度跟进 "Any questions after reviewing the materials?"
Day 14: 提供限时优惠或新信息
Day 30: 最后一次跟进，"Should I close your file or is this still on your radar?"
```

---

## A05 "你们的质量可靠吗 / How can I trust your quality"

> 出现频率：★★★★☆

### 策略1：认证+案例组合拳

EN:
```
Great question. Here's what backs our quality:

Certifications:
- CE certified (European standard)
- ISO 9001 quality management
- National High-Tech Enterprise certification

Key components:
- Thomas pumps (UK) — industry standard
- SMC pneumatics (Japan) — precise pressure control
- Omron/Eurotherm controllers — ±1°C temperature accuracy

Customer proof:
- [Customer in same country/region] has been using our equipment for [X] years
- We export to 40+ countries including Germany, USA, Brazil, Korea
- Our warranty return rate is under 1%

I can send you our CE certificate and a test splicing video for your
specific belt type. Would that help?
```

### 策略2：工厂验证

EN:
```
Rather than me telling you about quality, let me show you:

1. **Video factory tour** — I'll walk you through our production line in
   real-time. You can see the manufacturing process, quality checks, and
   testing stations.

2. **Live test** — Tell me your belt type and specs. We'll run a test
   splicing on camera so you can see the results firsthand.

3. **Reference call** — If you'd like, I can connect you with a customer
   in your region who's been using HOLO equipment.

When would be a good time for a video call?
```

---

## A06 "交期太长 / Lead time is too long"

> 出现频率：★★★☆☆

### 策略1：对比优势

EN:
```
I understand urgency. Let me give you context:

Our standard lead times:
- In-stock models: 3-7 days
- Standard production: 15-20 working days
- Custom specifications: 30-45 working days

Compare that to:
- European brands: typically 60-90 days
- Indian manufacturers: 30-45 days but quality varies

For your order, I've checked our production schedule and we can
prioritize it. If you confirm by [date], I can guarantee shipment
by [date].

Would you like me to check if we have any in-stock models that
match your requirements?
```

### 策略2：分批交付

EN:
```
If you need equipment urgently, here's what we can do:

- **Phase 1 (this week)**: Ship in-stock standard models for immediate use
- **Phase 2 (30 days)**: Produce and ship custom-spec items

This way your production doesn't stop while waiting for the full order.
Many customers use this approach for time-sensitive projects.
```

---

## A07 "我们能拿到更好的条款 / Competitors offer better terms"

> 出现频率：★★★☆☆

### 策略1：不比价格，比总拥有成本

EN:
```
I understand — terms matter. Before making a decision based purely on
price, consider the total cost of ownership:

- **Warranty**: HOLO provides 12 months. What does the competitor offer?
- **Spare parts**: Our spare parts are readily available and affordable.
  Some competitors lock you into expensive proprietary parts.
- **Technical support**: We provide lifetime remote technical assistance.
  Can they match that?
- **Resale value**: HOLO equipment holds its value well in the used market.

Sometimes a lower upfront price ends up costing more in the long run.
I'm happy to put together a TCO comparison if that would help.
```

### 策略2：匹配条件

EN:
```
Thanks for being transparent. If you can share the key terms they're
offering (price, payment, warranty, lead time), I'll see what I can do
to match or beat them.

We value long-term relationships over one-time margins. If we can make
the numbers work, we will.
```

---

## A08 "暂时不需要 / Not right now / No current need"

> 出现频率：★★★★☆

### 策略1：播种+保持联系

EN:
```
No problem at all. Equipment purchases are usually planned in advance.

Let me ask — do you have any upcoming projects where you might need:
- New splicing equipment?
- Replacement of aging machines?
- Expansion into new belt types or widths?

If so, it'd be helpful to start the conversation now so we can plan
production slots. No commitment needed.

In the meantime, I'll send you occasional industry updates and keep
you posted on any new models or promotions. Feel free to reach out
whenever the timing is right.
```

### 策略2：预防性销售

EN:
```
Completely understand. Out of curiosity — how old is your current
splicing equipment?

Most of our customers don't realize their equipment is underperforming
until they see what a new machine can do. If your current press is 5+
years old, you might be surprised by the improvement in:
- Temperature accuracy (our ±1°C vs older models' ±5°C)
- Splicing speed (30% faster heat-up time)
- Joint consistency (smart pressure control)

Something to keep in mind for your next equipment review cycle.
```

---

## A09 "你们是中国制造，质量不行 / Chinese quality is unreliable"

> 出现频率：★★★☆☆ （在欧洲尤其常见）

### 策略1：承认偏见，用事实翻转

EN:
```
I've heard that before, and honestly, some Chinese manufacturers have
earned that reputation. But the Chinese industrial equipment market is
changing fast.

Here's what sets HOLO apart:

1. **Imported core components**: Thomas pumps (UK), SMC pneumatics (Japan),
   Omron controls (Japan). The critical parts aren't "Chinese quality."

2. **European certification**: CE marked, meeting EU safety standards.
   We're audited regularly.

3. **Established export record**: 40+ countries including quality-conscious
   markets like Germany, UK, and South Korea.

4. **Factory direct**: You're buying from the manufacturer, not a trading
   company. We control every step of production.

I'd welcome a video factory tour so you can judge for yourself. 30 minutes
and you'll know exactly what you're getting.
```

---

## A10 "我需要和老板/团队商量 / Need to discuss with management"

> 出现频率：★★★☆☆

### 策略1：赋能内部销售

EN:
```
Absolutely — a good decision involves the right people.

To help you present this internally, I can prepare:
- A one-page summary with key specs, pricing, and ROI calculation
- Comparison with alternatives they might ask about
- Customer references from your industry
- A formal quotation valid for 30 days

Who else will be involved in the decision? If there are specific concerns
I can address proactively, let me know and I'll include that in the materials.

Shall I send the decision package by [date]?
```

---

## A11 "我之前买过中国设备，质量很差 / Had bad experience with Chinese equipment"

> 出现频率：★★★☆☆

### 策略1：共情+差异化

EN:
```
I'm sorry to hear that. Unfortunately, that's a real problem in our
industry — there are many trading companies reselling low-quality
equipment under various brand names.

HOLO is different in a few important ways:

1. **We're the actual manufacturer** — 5,500 sqm factory, 70+ technicians,
   in-house R&D. Not a trading company.

2. **We use premium components** — we don't cut corners on critical parts.
   Thomas pumps, SMC pneumatics, Omron controllers are standard on all
   our machines.

3. **We stand behind our product** — 12-month warranty, lifetime remote
   support, and we actually answer the phone when you call.

I understand trust needs to be rebuilt. The best way is to see it yourself.
Can we schedule a live demo where I show you our production and run a test
for your belt type?
```

---

## A12 "你们能做 OEM 吗 / Can you do OEM/ODM"

> 出现频率：★★☆☆☆ （这不是异议，是机会）

### 策略1：积极回应

EN:
```
Yes, we offer both OEM and ODM services. Here's what we can customize:

- **Branding**: Your logo, company name, colors on the machine
- **Packaging**: Custom packaging with your branding
- **Specifications**: Voltage, belt width, temperature range, control system
- **Software**: Custom interface language and settings
- **Documentation**: Manuals and certificates under your brand

Minimum order quantities and lead times depend on the customization level.
What specifically are you looking for?
```

---

## A13 "我只要一台 / I only need one unit"

> 出现频率：★★★☆☆ （暗示客户规模可能不大，但不能怠慢）

### 策略1：小单也要服务好

EN:
```
No problem — every customer starts somewhere, and we treat every order
with the same level of attention.

For single-unit orders:
- Full 12-month warranty applies
- Technical support by video call/email/WhatsApp
- Standard lead time (no penalty for small orders)
- We can still customize the voltage and specifications

Many of our largest customers today started with a single test unit.
Let's make sure your first experience is great.
```

---

## A14 "我们预算有限 / Budget is tight"

> 出现频率：★★★☆☆

### 策略1：灵活方案

EN:
```
I understand. Let me suggest a few options:

1. **Standard model instead of premium** — Our standard air-cooled presses
   use the same core components but without some advanced features. Still
   CE certified, still reliable.

2. **Refurbished equipment** — Occasionally we have trade-in units that
   have been fully serviced and tested. Significant savings.

3. **Payment flexibility** — We can offer:
   - 30% deposit + 70% before shipment (standard)
   - Or discuss other terms for established companies

4. **Start with the essentials** — Instead of buying everything at once,
   prioritize the equipment you need most and add more later.

What's your budget range? I'll recommend the best fit.
```

---

## A15 "我要跟XX（合作伙伴/经销商）买 / We buy from [partner name]"

> 出现频率：★★☆☆☆
> ⚠️ 特殊场景：必须先查 PARTNER-REGISTRY.md

### 如果提到的是合作伙伴（如 Beltwin）：

⛔ 不能说：
- "他们从我们这进货的"（暴露合作关系）
- "我们比你现在的供应商便宜"（攻击合作伙伴）
- "你被中间商赚了差价"（不专业）

✅ 应该说：

EN:
```
Great — they're a reputable supplier. As the original manufacturer of
HOLO equipment, I wanted to reach out directly in case you ever need:

- Factory-direct technical support and spare parts
- Custom specifications that might not be in their standard catalog
- Direct access to our engineering team for specialized applications
- Priority production slots for urgent orders

We work well alongside distributors and can complement what you're
already getting. Think of us as an additional resource, not a replacement.

Would you like me to send you our full product catalog for reference?
```

### 如果提到的不是合作伙伴（真正的竞品）：

正常走竞品对比流程，查 COMPETITOR-ANALYSIS-GUIDE.md。

---

## 文化适配速查

| 异议 | 美国 | 德国 | 巴西 | 东南亚 | 中东 | 澳洲 |
|------|------|------|------|--------|------|------|
| 太贵了 | ROI数字 | 技术价值论证 | 关系+分期 | 长期省钱 | 关系先行 | 务实算账 |
| 已有供应商 | 备胎策略 | 技术差异化 | 先交朋友 | 不急慢慢来 | 先建信任 | 我比他好在哪 |
| 没听过 | 数据+案例 | 认证+测试报告 | 推荐+案例 | 客户推荐 | 朋友介绍 | 干脆看厂 |
| 考虑考虑 | 可能是拒绝 | 真在考虑 | 真在考虑 | 可能是拒绝 | 真在考虑 | 可能是拒绝 |
| 中国质量 | 事实翻转 | 德国标准对比 | 没那么在意 | 价格优先 | 先看人 | 先看质量 |

---

## 使用注意事项

1. **话术不是死模板** — 根据客户措辞、行业、公司规模微调
2. **每次只用一个策略** — 不要把四个策略全扔给客户
3. **先共情再引导** — "I understand" 永远在前面
4. **用问句结尾** — 引导客户回复，而不是单向输出
5. **保持简短** — 3-5句话足够，不要写论文

---

_版本 1.0.0 | 2026-04-11_
_使用时配合 sdr-humanizer 去AI味，配合 cold-email-generator 生成完整邮件_
