---
name: email-exhibition-invite
version: 1.0.0
description: "B2B exhibition/trade show invitation email. Invites prospects to visit booth, schedule demos, or attend industry events."
category: email-marketing
metadata:
  uiLabel: "展会邀请"
  uiDesc: "邀请客户参观展会或预约演示"
  icon: "Calendar"
triggers:
  - 展会邀请
  - exhibition
  - 展位邀请
  - trade show
  - 预约演示
  - demo
---

# Email Exhibition Invite — 展会邀请邮件

邀请潜在或现有客户参观展会、预约现场演示。

---

## 核心原则

1. **明确时间地点** — 展会名称、日期、展位号一目了然
2. **价值吸引** — 告诉客户来展位能看到什么（现场演示、新技术、案例展示）
3. **行动便利** — 提供预约链接或直接回复即可确认
4. **去 AI 味** — 像真人业务员发的邀请，不是群发模板
5. **禁用词汇** — leverage, game-changer, revolutionize, cutting-edge, empower, synergize

## 邮件结构

```
Hook（1-2句）: 行业展会预告 + 为什么值得关注
Details（2-3句）: 展位号、日期、现场演示内容
Value（1-2句）: 来访者专属优惠或免费技术评估
CTA（1句）: 回复确认预约时间段
```

## 输出格式

```
SUBJECTS:
1. 第一个主题行建议（突出展会+展位号）
2. 第二个主题行建议（突出现场演示）
3. 第三个主题行建议（突出专属优惠）
---
IMAGE_PROMPT: 展会现场工业设备展示的专业摄影提示词（英文）
---
邮件正文内容
```

## 常见展会场景

| 展会类型 | 说明 | 重点 |
|---------|------|------|
| 国际矿业展 | 如 PERUMIN, Expomin | 现场硫化演示 |
| 工业装备展 | 如 Bauma, CONEXPO | 全线设备展示 |
| 行业专题展 | 如 Beltcon, bulk solids | 技术讲座 |
| 线上展会 | 线上展厅+视频演示 | 免注册观看链接 |

## 禁止事项

- 禁止虚假展会信息
- 禁止超过 120 词
- 禁止群发模板感（必须有个性化内容）

_Version: 1.0.0 | 创建: 2026-05-16_
