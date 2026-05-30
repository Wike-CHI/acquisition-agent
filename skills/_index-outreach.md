---
name: outreach-domain
description: 多渠道触达领域 MOC。开发信生成、邮件发送、WhatsApp/Telegram/LinkedIn 触达——通过最佳渠道联系客户。触发词：开发信、发邮件、WhatsApp、触达、联系客户。
version: 1.0.0
capability: core
priority: 85
---

# 多渠道触达

> **"用什么渠道、说什么话、什么时候发？"** — 本领域覆盖从内容生成到发送节奏的全链路。

## 技能节点

### 内容生成
- **[[cold-email-generator]]** — 开发信生成 v2.0。AI 检测 + 多轮润色 + 评分 ≥ 9.0。⚠️ 必须过此技能，不得直接写开发信。生成后自动调用 [[email-sender]] 发送。
- **[[sdr-humanizer]]** — 拟人化销售对话（取代 humanize-ai-text）。将 AI 生成消息转为自然人类风格，支持文化适配 + 时区感知 + 消息节奏控制。

### 邮件通道
- **[[email-sender]]** — SMTP 邮件发送。163 邮箱 via nodemailer，支持配置、批量发送、自动跟进节奏。
- **[[email-inbox]]** — 邮件收件检测。IMAP 连接企业邮箱，监听客户回复和询价，自动触发 CRM 更新。
- **[[email-content-review]]** — 邮件内容审查。发送前自动检查垃圾词、敏感内容、格式错误。
- **[[email-exhibition-invite]]** — 展会邀请邮件。生成展会邀约模板，支持展会信息自动填充。
- **[[email-follow-up]]** — 邮件跟进。智能跟进序列，根据客户行为（打开/点击/回复）触发不同跟进策略。
- **[[email-product-recommendation]]** — 产品推荐邮件。基于客户背调数据推荐匹配产品。
- **[[email-re-engagement]]** — 客户再激活邮件。针对沉默客户的重新激活序列。

### 即时通讯
- **[[whatsapp-outreach]]** — WhatsApp 触达。通过 wacli 发送，支持文本/文件/产品目录。⚠️ 72h 窗口铁律：最后一次交互后 72h 外禁止主动推送。
- **[[linkedin]]** — LinkedIn AI 触达。搜索决策人、发送连接请求和 InMail。
- **[[linkedin-writer]]** — LinkedIn 帖子写作。生成自然人性化的文章，红龙定制版含工业设备行业内容模板。

### 节奏与应答
- **[[delivery-queue]]** — 消息分段队列。模拟真人发送节奏（间隔/静默时段），支持邮件 + WhatsApp 双通道 drip campaign。
- **[[inquiry-response]]** — 询盘应答系统。54 条多语种话术（6 语种 × 9 场景），覆盖异议处理 + 技术问题 + 竞品对比。
- **[[follow-up-signal-monitor]]** — 跟进信号监控。沉默检测（3/7/14/30 天分级）+ 价值型跟进 + IMAP 邮件监控。

## 遍历指引

- 生成开发信 → [[cold-email-generator]] → [[sdr-humanizer]] → [[email-sender]]
- 发 WhatsApp → [[whatsapp-outreach]] → [[delivery-queue]]
- 俄罗斯市场 → [[cold-email-generator]]
- LinkedIn 开发 → [[linkedin]] + [[linkedin-writer]] + [[sdr-humanizer]]
- 客户询价 → [[inquiry-response]] → [[_index-conversion]]
- 客户沉默 → [[follow-up-signal-monitor]] → [[email-re-engagement]]

---

## 关联领域

- 触达前必做背调 → [[_index-discovery]] (company-research)
- 客户回复且有意向 → [[_index-conversion]] (smart-quote)
