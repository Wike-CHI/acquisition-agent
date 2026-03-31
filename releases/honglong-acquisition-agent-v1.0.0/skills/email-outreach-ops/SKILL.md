---
name: email-outreach-ops
version: 1.0.0
description: 邮件外联运营技能。生成和管理供应商询价邮件、跟进流程、回复汇总。当用户需要：(1) 发送询价邮件 (2) 跟进供应商 (3) 汇总报价 (4) 生成开发信 (5) 客户触达 时使用此技能。
always: false
triggers:
  - 询价
  - 开发信
  - 外联
  - 跟进邮件
  - RFQ
  - quote
---

# 邮件外联运营技能

管理供应商询价、客户开发信、跟进邮件等外联运营工作。

## 一、邮件类型

### 1.1 询价邮件（RFQ）

**场景**：向供应商询价产品或服务

**模板**：
```
Subject: RFQ - {产品名称} - {公司名}

Dear {供应商名称},

I hope this email finds you well.

We are interested in purchasing {产品名称} for our company. Could you please provide a quote for:

Product: {产品详情}
Quantity: {数量}
Specifications: {规格要求}
Delivery Location: {交货地点}

Please include:
- Unit price and total cost
- Lead time
- Payment terms
- Shipping options
- Warranty/Certifications (if applicable)

Looking forward to your quotation.

Best regards,
{签名}
```

### 1.2 开发信（Cold Email）

**场景**：首次接触潜在客户

**模板**：
```
Subject: {个性化主题} - {客户公司名}

Hi {客户姓名},

{个性化开场 - 基于背调信息}

I'm writing to introduce HOLO (红龙), a leading manufacturer of industrial belt equipment with 20+ years of experience.

Our product line includes:
- Air/Water Cooled Press (Splice Press)
- Finger Puncher
- Belt Slitting Machine
- Ply Separator
- Guide Strip Welding Machine

{痛点关联 - 基于客户业务}

Website: www.beltsplicepress.com
LinkedIn: {LinkedIn链接}

Would you be interested in discussing potential collaboration?

Best regards,
{签名}
```

### 1.3 跟进邮件（Follow-up）

**场景**：跟进未回复的邮件

**模板1**（3天后）：
```
Subject: Re: {原主题}

Hi {姓名},

I wanted to follow up on my previous email. Did you have a chance to review it?

Happy to answer any questions you might have.

Best regards,
{签名}
```

**模板2**（7天后）：
```
Subject: Re: {原主题}

Hi {姓名},

Following up again. If timing isn't right, I'm happy to reconnect in a few months.

In the meantime, here's a case study of how we helped {类似客户}:
{案例链接}

Best regards,
{签名}
```

**模板3**（14天后 - 最后一次）：
```
Subject: Last check-in - {原主题}

Hi {姓名},

This is my last follow-up on this topic.

If you're not interested or the timing isn't right, no worries at all. I'll remove you from my outreach list.

If you'd like to reconnect in the future, feel free to reach out anytime.

Best regards,
{签名}
```

### 1.4 报价回复（Quote Response）

**场景**：收到供应商报价后回复

**模板**：
```
Subject: Re: Quotation for {产品}

Dear {供应商名称},

Thank you for your quotation dated {日期}.

We have reviewed your offer and would like to {接受/协商/婉拒}:

{接受}:
Your quote meets our requirements. Please proceed with the order. 
Attached is our PO for your reference.

{协商}:
Your quote is competitive, but we were hoping for a price around {目标价}.
Is there any flexibility on pricing?

{婉拒}:
Thank you for the quote. We have decided to go with another supplier at this time.
We will keep you in mind for future needs.

Best regards,
{签名}
```

## 二、邮件流程

### 2.1 询价流程

```
Step 1: 生成询价邮件
    ↓
Step 2: 发送给多个供应商（3-5家）
    ↓
Step 3: 等待回复（3-5个工作日）
    ↓
Step 4: 汇总报价（对比表）
    ↓
Step 5: 决策（选择供应商）
    ↓
Step 6: 发送确认/拒绝邮件
```

### 2.2 开发信流程

```
Step 1: 客户背调
    ↓
Step 2: 生成个性化开发信
    ↓
Step 3: 发送邮件
    ↓
Step 4: 跟进（3天/7天/14天）
    ↓
Step 5: 记录结果
    ↓
Step 6: 安排会议/通话
```

## 三、报价汇总表

### 3.1 标准格式

| 供应商 | 单价 | 总价 | 交期 | 付款方式 | 运费 | 备注 |
|--------|------|------|------|----------|------|------|
| 供应商A | $X | $XXX | 15天 | 30天账期 | 含 | - |
| 供应商B | $Y | $YYY | 10天 | 预付50% | 不含 | - |
| 供应商C | $Z | $ZZZ | 20天 | 月结 | 含 | 量大优惠 |

### 3.2 对比维度

| 维度 | 权重 | 说明 |
|------|------|------|
| 价格 | 40% | 单价+总价 |
| 交期 | 25% | 生产+运输时间 |
| 付款 | 15% | 账期/预付 |
| 质量 | 15% | 认证/质保 |
| 服务 | 5% | 响应速度/支持 |

## 四、跟进规则

### 4.1 跟进时间表

| 天数 | 动作 | 模板 |
|------|------|------|
| Day 0 | 发送初始邮件 | 初始模板 |
| Day 3 | 第1次跟进 | Follow-up 1 |
| Day 7 | 第2次跟进 | Follow-up 2 |
| Day 14 | 最后跟进 | Follow-up 3 |
| Day 15+ | 停止跟进 | - |

### 4.2 跟进策略

**高价值客户**（A级）：
- 电话跟进
- LinkedIn私信
- 多渠道触达

**中等客户**（B级）：
- 邮件跟进
- 3次跟进

**低价值客户**（C级）：
- 1-2次邮件
- 不强求

## 五、邮件最佳实践

### 5.1 主题行技巧

**好的主题行**：
- "Question about {公司名}'s conveyor belt needs"
- "Industrial belt solutions - 20% faster production"
- "{姓名}, quick question about {痛点}"

**避免的主题行**：
- "Hello"
- "Quote"
- "Business opportunity"
- "Urgent!!!"

### 5.2 个性化技巧

**开场白**：
- "I noticed {公司名} recently expanded to {新市场}..."
- "Congratulations on {公司名}'s 10th anniversary..."
- "I saw your post about {主题} on LinkedIn..."

**痛点关联**：
- "Many manufacturers struggle with belt splicing time..."
- "Based on your product line, I imagine you use a lot of..."
- "Your customers probably ask for..."

### 5.3 邮件长度

| 类型 | 理想长度 |
|------|----------|
| 开发信 | 100-150词 |
| 跟进邮件 | 50-100词 |
| 询价邮件 | 150-200词 |
| 报价邮件 | 100-150词 |

## 六、数据记录

### 6.1 发送记录

```json
{
  "date": "2026-03-25",
  "type": "cold_email",
  "to": "john@abc-industrial.com",
  "company": "ABC Industrial",
  "subject": "Industrial belt solutions for ABC",
  "status": "sent",
  "follow_up_date": "2026-03-28"
}
```

### 6.2 回复记录

```json
{
  "date": "2026-03-27",
  "from": "john@abc-industrial.com",
  "company": "ABC Industrial",
  "type": "reply",
  "interest_level": "high",
  "next_action": "schedule_call",
  "notes": "Interested in splice press, asked for quote"
}
```

## 七、快速命令

### 询价命令
```
用户: 向 [供应商] 询价 [产品]
例: 向3家供应商询价 splice press PA1800H
```

### 开发信命令
```
用户: 给 [公司] 发开发信
例: 给 ABC Industrial 发开发信
例: 给这5家公司批量发送开发信
```

### 跟进命令
```
用户: 跟进 [公司]
例: 跟进 ABC Industrial（3天未回复）
```

### 汇总命令
```
用户: 汇总报价
例: 汇总这3家供应商的报价
```

## 八、注意事项

### 8.1 避免垃圾邮件

- ✅ 个性化每封邮件
- ✅ 提供价值内容
- ✅ 遵守CAN-SPAM法案
- ❌ 不要购买邮件列表
- ❌ 不要群发相同内容
- ❌ 不要隐藏退订选项

### 8.2 发送频率

- 供应商：同一天可发多封
- 客户：每天不超过5封开发信
- 跟进：严格遵守时间表

### 8.3 法律合规

- 提供退订链接
- 包含公司地址
- 不使用误导性主题
- 遵守GDPR（欧盟客户）

---
*相关技能*:
- global-customer-acquisition: 全网获客主控
- email-marketing: 邮件营销
- customer-intelligence: 客户情报

*更新时间*: 2026-03-25
