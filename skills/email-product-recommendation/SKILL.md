---
name: email-product-recommendation
version: 1.0.0
description: "Use when 需要向客户推荐新产品/升级/促销时。路由：产品推荐邮件走此技能（内置产品匹配+推荐策略），禁止直接调 send_email_smtp。"
category: email-marketing
metadata:
  uiLabel: "产品推荐"
  uiDesc: "推荐新产品或升级方案"
  icon: "Sparkles"
triggers:
  - 产品推荐
  - recommendation
  - 新产品推荐
  - product launch
  - 升级推荐
---

# Email Product Recommendation — 产品推荐邮件

> **Skill Graph：** 领域 → [[_index-meta|系统元技能领域]]


向现有或潜在客户推荐新产品、升级方案或限时促销。

---

## 核心原则

1. **价值优先** — 先说客户能得到什么改进，再说产品
2. **具体数据** — 用对比数据说话（效率提升 X%，停机减少 Y%）
3. **相关性** — 推荐的产品必须与客户当前使用的设备或行业相关
4. **去 AI 味** — 读起来像资深工程师的推荐，不是营销邮件
5. **限时钩子** — 制造紧迫感但不夸张
6. **禁用词汇** — leverage, game-changer, revolutionize, cutting-edge, empower, synergize, I hope this helps

## 推荐场景

| 场景 | 说明 | 重点 |
|------|------|------|
| 新型号上市 | 新一代硫化机发布 | 性能提升数据 |
| 升级推荐 | 客户老设备可升级 | ROI 对比 |
| 行业定制版 | 特定行业解决方案 | 行业适配优势 |
| 促销活动 | 限时优惠/展会特价 | 时效性和价格优势 |

## 邮件结构

```
Hook（2句）: 行业趋势或客户痛点
Product（3-4句）: 推荐产品的核心改进 + 具体数据
Value（2句）: 客户直接获得的价值
CTA（1句）: 限时行动号召
```

## 输出格式

```
SUBJECTS:
1. 第一个主题行建议（突出产品改进）
2. 第二个主题行建议（突出客户价值）
3. 第三个主题行建议（突出限时性）
---
IMAGE_PROMPT: 新产品在工业场景中的专业摄影提示词（英文）
---
邮件正文内容
```

## 禁止事项

- 禁止具体报价金额
- 禁止夸大宣传（"revolutionary", "world's best"）
- 禁止超过 150 词
- 禁止与客户当前供应商攻击性对比

_Version: 1.0.0 | 创建: 2026-05-16_
