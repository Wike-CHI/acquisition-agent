# CTA 策略库

> 开发信结尾的 Call-to-Action 策略，按优先级排序。
> 核心原则：CTA 是让客户做最小承诺的动作，不是让他立刻买。

---

## 优先级

| 优先级 | 策略 | 适用场景 | 转化率 |
|--------|------|---------|--------|
| S1 | 选择题钩子 | 所有首次开发信 | 最高 |
| S2 | 免费价值 | 有具体价值可提供的场景 | 高 |
| S3 | 限时窗口 | 有真实时间压力时 | 中高 |
| S4 | 行业定制 Hook | 有区域/行业案例时 | 中 |

**默认选择 S1**，除非有明确理由用其他策略。

**⚠️ CTA 中绝对禁止出现具体金额（$、¥、€）**，报价走 `smart-quote` 技能。

---

## S1：选择题钩子（默认首选）

**原理**：选择题比开放式问题回复率高 2-3 倍。客户不需要思考"要不要回复"，只需要"选A还是B"。

### 模板 1 — 产品匹配型（推荐）

```
Quick question: are you currently handling belt splicing in-house,
or do you outsource it?

If in-house, I can send a spec comparison that might cut your
splice time by 30%.

If you outsource, it might be worth comparing costs — most of
our customers recovered their investment within 12 months.
```

### 模板 2 — 痛点确认型

```
Which of these sounds more relevant to your operation?

a) Reducing belt change downtime
b) Cutting splice costs
c) Improving splice quality consistency

Happy to share how other [industry] companies in [country]
have addressed these.
```

### 模板 3 — 规格确认型

```
Would it help if I sent over a spec sheet for our [model]
that handles [belt width]mm belts?

No commitment — just want to make sure it's a fit before
taking more of your time.
```

### 使用规则

| 规则 | 说明 |
|------|------|
| 给 2 个选项 | 不要给 3 个以上，2 个最佳 |
| 两个选项都要有吸引力 | 无论选哪个都能开启对话 |
| 选项要跟客户业务相关 | 不是"买还是不买"，而是"A方案还是B方案" |
| 短句 | CTA 不超过 3-4 行 |

---

## S2：免费价值

**原理**：先给东西，再建立信任。免费价值降低回复心理门槛。

**⚠️ 条件**：必须有真实、具体、可立即提供的东西。不能承诺"我可以提供"然后没下文。

### 模板 1 — 免费资源

```
I put together a one-page comparison of splice methods for
[industry] applications — covers cycle time, cost per joint,
and failure rates.

Want me to send it over? No strings attached.
```

### 模板 2 — 免费测试/样品

```
We have a short video showing our [model] in action —
[belt width]mm belt, full splice cycle in under [X] minutes.

Can I share the link?
```

### 模板 3 — 免费咨询

```
If you're evaluating equipment options, I'm happy to do a
15-minute call to discuss your specific requirements —
no pitch, just honest advice based on what we've seen work
in [industry].

Would a brief call be useful?
```

---

## S3：限时窗口

**原理**：真实的时间压力推动决策。必须是真实的时间限制，不能编造。

**⚠️ 禁止编造虚假紧迫感**。以下模板仅在有真实依据时使用。

### 模板 1 — 产能窗口（真实可用）

```
Our production schedule for [month] is filling up.
If you're considering a trial, confirming by [date] would
secure the current lead time of [X] weeks.

After that, we're looking at [X+2-4] weeks for the next
available slot.
```

### 模板 2 — 报价有效期（询盘阶段见 interest-signals.md S3）

```
This pricing is valid through [date] due to current
material costs. I can't guarantee it beyond that window
without re-confirmation.
```

### 使用规则

| 规则 | 说明 |
|------|------|
| 必须真实 | 编造"仅限今天"会永久损害信任 |
| 给具体日期 | 不要说"很快""即将"，说具体日期 |
| 解释原因 | "原材料波动""产能在排期"比"限时优惠"可信 |
| 开发信慎用 | S3 更适合询盘跟进阶段，首次开发信优先 S1 |

---

## S4：行业定制 Hook

**原理**：提到客户所在行业/区域的专有信息，证明你做过功课。

**⚠️ 条件**：必须有该行业的真实知识或案例。禁止泛泛而谈。

### 模板 1 — 行业趋势

```
I noticed [specific industry trend/news relevant to prospect's company].

This is driving more companies in [industry] to bring splicing in-house.
Curious — is your team feeling that pressure too?
```

### 模板 2 — 区域案例

```
We've been working with several [industry] operations in [region/country]
over the past [X months/years].

Their biggest surprise? [Specific benefit — e.g., splice time dropped 40%].

Would a regional reference be useful?
```

### 使用规则

| 规则 | 说明 |
|------|------|
| 必须有真实依据 | 查 `competitor-intel.md` 或 NAS 客户档案 |
| 禁止编造客户名 | 没有 = 不用此策略 |
| 细节 > 泛泛 | "splice time dropped 40%" > "improved efficiency" |

---

## CTA 选择决策树

```
首次开发信？
├── 是 → 默认 S1 选择题钩子
│         ├── 客户有明确痛点 → S1 模板 2（痛点确认型）
│         └── 一般情况 → S1 模板 1（产品匹配型）
│
└── 否（跟进邮件）
    ├── 有免费资源可提供？ → S2
    ├── 有真实时间压力？ → S3
    ├── 有行业案例？ → S4
    └── 都没有 → 回到 S1
```

---

## 反面案例（禁止）

| ❌ 错误 CTA | 为什么错 |
|------------|---------|
| "Let me know if you're interested" | 太被动，客户不会主动回复 |
| "Click here to buy" | 太激进，开发信不是卖页面 |
| "Best regards, [Name]" 无 CTA | 没有任何行动号召，等于白写 |
| "Reply with your budget" | 要求太高，还没建立信任 |
| "Limited time offer! 50% off!" | 虚假紧迫感，B2B 客户不吃这套 |

---

_Version: 1.0.0 | 2026-04-22_
