---
name: email-content-review
version: 1.0.0
description: "B2B 开发信复盘 Agent。基于冷邮件最佳实践和反垃圾规则，多维度评分 + 具体改进建议。使用 web_search 验证产品声明和竞品邮件策略。"
category: content-review
triggers:
  - 复盘邮件
  - 邮件审核
  - 邮件评分
  - review email
  - 邮件质量
tools:
  - web_search
---

# Email Content Review — B2B 开发信复盘

对已生成的开发信内容进行多维度质量评估，输出具体改进建议。

> 本技能是复盘环节的方法论驱动器。复盘 Agent 应加载本技能后，结合 `web_search` 工具进行事实核查和竞品策略对比。

---

## 复盘流程（Agent 必须按顺序执行）

```
Step 1: 加载评估维度 → 理解 6 个评分轴
Step 2: web_search 验证 → 核查竞品邮件策略、行业关键词、反垃圾规则
Step 3: 结构化输出 → 每个维度评分 + 具体修改建议
```

---

## 6 维度评分体系

每个维度 0-10 分，总评 = 6 维度加权平均。

### 1. 个性化程度（权重 25%）

邮件是否真正针对收件人定制？

| 检查项 | 得分标准 |
|--------|---------|
| 提及收件人公司名或行业 | 有 +3 |
| 引用了与该公司相关的具体场景 | 有 +3 |
| 主题行包含个性化元素 | 有 +2 |
| 未使用通用模板痕迹 | 无痕迹 +2 |

### 2. 价值主张清晰度（权重 20%）

价值主张是否清晰、具体、有吸引力？

| 检查项 | 得分标准 |
|--------|---------|
| 首段即点明客户收益 | 有 +3 |
| 包含具体数字（ROI、成本节省等）| 有 +3 |
| 差异化明确（vs 竞品/贸易商）| 有 +2 |
| 源头厂家优势自然融入 | 有 +2 |

### 3. 去 AI 味程度（权重 20%）

读起来像真人业务员写的？

| 禁用词检测 | 每出现一个 -1 |
|-----------|-------------|
| 过度客套（I hope this email finds you well）| -2 |
| 结尾模板化（I look forward to hearing from you）| -2 |
| 数据堆砌超过3个 | -1 |
| 整体结构太完美/太对称 | -2 |

**禁用词表**: leverage, game-changer, revolutionize, cutting-edge, empower, synergize, seamless, innovative, transformative, state-of-the-art, I hope this email finds you well, I hope you're doing well

### 4. 反垃圾合规（权重 15%）

邮件是否会被标记为垃圾邮件？

| 检查项 | 得分标准 |
|--------|---------|
| 主题行无 ALL CAPS / 多个感叹号 | 合规 +3 |
| 无 "FREE" / "DISCOUNT" 等垃圾触发词 | 合规 +3 |
| 无过多链接（≤2个）| 合规 +3 |
| 文字与图片比例合理 | 合规 +3 |
| 退订/偏好链接 | 有 +3 |

### 5. CTA 有效性（权重 10%）

行动号召是否明确且低门槛？

| 检查项 | 得分标准 |
|--------|---------|
| CTA 明确（回复/通话/演示）| 有 +4 |
| CTA 低门槛（不需要承诺购买）| 有 +3 |
| 只有一个 CTA（不分散注意力）| 有 +3 |

### 6. 事实可验证性（权重 10%）

产品声明是否有据可查？

| 检查项 | 得分标准 |
|--------|---------|
| 具体认证声明（CE/ISO）可查 | 有 +4 |
| 性能数据有依据 | 有 +3 |
| 无夸大或无法验证的声明 | 无 +3 |

> 复盘 Agent 应使用 web_search 抽查 1-2 个关键声明。

---

## 竞品对比（web_search 驱动）

复盘 Agent 应搜索竞品的冷邮件策略：

```
web_search(query="{product} cold email template B2B {industry}")
```

对比维度：
- 主题行策略 — 竞品用什么类型主题行？
- 结构模式 — 长信还是短邮件？
- CTA 类型 — 直接卖还是建立关系？
- 差异化机会 — 我们的邮件比竞品好在哪？

---

## 输出格式（严格遵循）

```
REVIEW_RESULT:
overall_score: [0-10]
pass: [true/false — ≥7.0 为通过]

dimensions:
- name: 个性化程度
  score: [0-10]
  findings: [2-3句具体发现]
  suggestions: [具体修改建议，可复制粘贴的改进文本]

- name: 价值主张清晰度
  score: [0-10]
  findings: ...
  suggestions: ...

- name: 去AI味程度
  score: [0-10]
  findings: ...
  suggestions: ...

- name: 反垃圾合规
  score: [0-10]
  findings: ...
  suggestions: ...

- name: CTA有效性
  score: [0-10]
  findings: ...
  suggestions: ...

- name: 事实可验证性
  score: [0-10]
  findings: ...
  suggestions: ...

competitor_insight: [竞品邮件策略对比发现，1-2句]
improved_content: [基于所有建议改写后的完整邮件内容，直接可替换原文]
```

---

## 与其他技能的关系

| 技能 | 关系 |
|------|------|
| `cold-email-generator` | 开发信生成上游 |
| `email-follow-up` | 跟进信模板参考 |
| `email-product-recommendation` | 产品推荐信模板参考 |
| `deep-research` | 深度竞品分析 |

---

## 约束

1. 评分必须基于证据，不凭感觉
2. 建议必须具体到可以复制粘贴的文本，不说"建议优化"
3. web_search 必须实际调用，不能跳过
4. improved_content 必须是完整可用的邮件内容（含主题行），不是片段
5. 评分标准不可降低 — 7.0 是硬门槛

_Version: 1.0.0 | 创建: 2026-05-16_
