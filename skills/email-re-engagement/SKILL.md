---
name: email-re-engagement
version: 1.0.0
description: "Use when 需要重新激活沉睡/流失客户时。路由：再激活邮件走此技能（内置流失判断和重激活策略），禁止直接调 send_email_smtp。"
category: email-marketing
metadata:
  uiLabel: "重新激活"
  uiDesc: "唤醒沉睡客户或过期线索"
  icon: "RefreshCw"
triggers:
  - 重新激活
  - re-engage
  - 沉睡客户
  - dormant
  - 唤醒客户
  - win back
---

# Email Re-Engagement — 沉睡客户激活邮件

> **Skill Graph：** 领域 → [[_index-meta|系统元技能领域]]


重新激活长期未互动的沉睡客户或过期线索。

---

## 核心原则

1. **承认间隔** — 自然地提到上次联系，不假装昨天才聊过
2. **新价值** — 提供上次联系时没有的新信息（新认证、新案例、新产品）
3. **零压力** — 不催促不追问，客户可以轻松回复
4. **去 AI 呕** — 像老朋友发来的问候，不是营销机器人的群发
5. **禁用词汇** — leverage, game-changer, revolutionize, cutting-edge, empower, synergize, I hope this helps

## 激活策略

| 场景 | 触发条件 | 价值锚点 |
|------|---------|---------|
| 老客户沉默 | 90天+未回复 | 新认证（CE 2026）/ 新案例 |
| 报价后消失 | 报价后30天+无回复 | 价格调整或升级方案 |
| 展会名片 | 展会后60天+未转化 | 定制化行业方案 |
| 询盘后消失 | 询价后14天+无回复 | 补充技术数据或竞品对比 |

## 邮件结构

```
Opening（1句）: 自然问候 + 提及上次联系
New Value（2-3句）: 新变化/新案例/新产品
Relevance（1-2句）: 与客户当前需求的关联
Soft CTA（1句）: 低门槛行动号召（只需回复"是"或"有兴趣"）
```

## 输出格式

```
SUBJECTS:
1. 第一个主题行建议（突出新变化）
2. 第二个主题行建议（突出相关性）
3. 第三个主题行建议（突出轻松回复）
---
IMAGE_PROMPT: 工厂车间或产品特写的专业摄影提示词（英文）
---
邮件正文内容
```

## 禁止事项

- 禁止催促式表达（"still interested?", "following up again"）
- 禁止超过 100 词（沉睡客户对长邮件容忍度极低）
- 禁止报价
- 禁止抱怨客户不回复

_Version: 1.0.0 | 创建: 2026-05-16_
