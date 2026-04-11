---
name: sales-response
description: >
  销售智能应答技能 - 红龙获客系统的客户回复处理中心。
  收到客户邮件/WhatsApp回复后，自动分类异议、匹配合适话术、生成个性化回复。
  覆盖：异议处理(15种)、各国商业文化画像(18国)、产品FAQ、谈判策略、竞品情报。
  触发词：回复客户、收到询盘、客户说太贵、异议处理、客户议价、sales reply、inquiry response。
triggers:
  - 回复客户
  - 收到询盘
  - 客户说太贵
  - 客户议价
  - 异议处理
  - 客户还价
  - 销售应答
  - inquiry response
  - sales reply
  - objection handling
  - 回复邮件
  - 怎么回客户
  - 客户的问题
  - 销售话术
  - negotiation
  - 谈判策略
always: false
---

# sales-response

> ⭐ 红龙获客系统 - 销售智能应答技能 v1.0.0

收到客户回复后，智能分类 → 文化适配 → 异议处理 → 生成回复。

---

## 核心能力

```
客户回复邮件/WhatsApp
       ↓
  scripts/classify-inquiry.py（自动分类）
       ↓
  判断类型：
  ├─ objection  → objection-handbook.md（异议处理）
  ├─ inquiry    → product-faq.md（产品FAQ）
  ├─ negotiation → negotiation-tactics.md（谈判策略）
  ├─ sample_request → product-faq.md Q8（索样）
  └─ follow_up → cultural-profiles.md（跟进节奏）
       ↓
  匹配对应国家文化画像（cultural-profiles.md）
       ↓
  生成个性化回复（templates/）
       ↓
  拟人化处理（sdr-humanizer）
       ↓
  通过 163-email-sender 发送
```

---

## 快速使用流程

### Step 1：粘贴客户邮件内容

将客户回复的邮件正文粘贴给 Agent，说：
> "客户回复了，帮我处理：[粘贴邮件内容]"

### Step 2：Agent 自动完成

Agent 自动：
1. 分类客户回复（异议/询价/谈判/技术问题）
2. 识别客户所在国家，匹配文化画像
3. 从知识库调取对应话术
4. 生成个性化回复草稿
5. 拟人化处理（去掉AI味）

### Step 3：确认发送

- 如果用户授权自主发送 → 直接发送
- 如果需要用户确认 → 展示回复草稿

---

## 参考文档索引

| 文档 | 内容 | 使用场景 |
|------|------|---------|
| `references/cultural-profiles.md` | 18国商业文化画像 | 理解客户心理、调整沟通风格 |
| `references/objection-handbook.md` | 15种异议处理方案 | 客户说"太贵了"等问题 |
| `references/product-faq.md` | 产品高频问答 | 客户问技术参数、选型等 |
| `references/negotiation-tactics.md` | 谈判策略库 | 报价后拉锯、条款谈判 |
| `references/competitor-intel.md` | 竞品/经销商情报 | Beltwin比较、竞品应对 |

| 模板 | 用途 |
|------|------|
| `templates/reply-objection.md` | 异议回复模板 |
| `templates/reply-inquiry.md` | 询盘回复模板 |
| `templates/reply-technical.md` | 技术问题回复模板 |

---

## 常见场景话术索引

### 客户说"价格太贵"

1. 查 `objection-handbook.md` → 01 价格太贵
2. 选方案：数据驱动(A) / 关系建立(B) / 价值重塑(C)
3. 查 `cultural-profiles.md` → 客户国家 → 调整语气
4. 用 `templates/reply-objection.md` 模板

### 客户说"Beltwin报价更低"

1. 查 `competitor-intel.md` → Beltwin 部分
2. **绝对不能攻击 Beltwin**（十年合作伙伴）
3. 主打"源头厂家"定位话术
4. 参考 `objection-handbook.md` → 异议13

### 客户问技术参数

1. 查 `product-faq.md` → 对应分类（选型/参数/兼容性等）
2. 直接给标准答案（中英双语）
3. 参考 `templates/reply-technical.md`

### 客户一直拖延不回复

1. 查 `cultural-profiles.md` → 客户国家 → 跟进节奏建议
2. 查 `objection-handbook.md` → 04 考虑考虑
3. 设定合理的跟进时间节点

### Beltwin 覆盖市场客户议价

1. 查 `competitor-intel.md` → Beltwin覆盖地图
2. 主打原厂家价值，不要打价格战
3. 参考谈判策略：条款谈判优先于价格谈判

---

## 目录结构

```
sales-response/
├── SKILL.md                          # 本文件
├── scripts/
│   └── classify-inquiry.py           # 询盘分类器
├── references/
│   ├── cultural-profiles.md          # 18国商业文化画像
│   ├── objection-handbook.md         # 15种异议处理方案
│   ├── product-faq.md                # 产品高频问答
│   ├── negotiation-tactics.md         # 谈判策略库
│   └── competitor-intel.md           # 竞品/经销商情报
└── templates/
    ├── reply-objection.md            # 异议回复模板
    ├── reply-inquiry.md              # 询盘回复模板
    └── reply-technical.md            # 技术问题回复模板
```

---

## ⚠️ 重要原则

1. **Beltwin 是合作伙伴** — 不能在回复中攻击 Beltwin
2. **不承诺做不到的事** — 货期、价格、规格说到做到
3. **24小时内回复** — B2B商务礼仪，邮件必须当天回复
4. **先理解再回应** — 不要客户问价格直接给底价，先挖需求
5. **国家文化适配** — 同样的话术，语气要随国家调整

---

## 版本信息

- Version: 1.0.0
- 创建日期：2026-04-11
- 来源：红龙获客系统销售应答技能，基于实战经验沉淀
- 维护：与红龙获客系统同步更新

---

_Version: 1.0.0_
