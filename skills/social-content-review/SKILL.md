---
name: social-content-review
version: 1.0.0
description: "B2B 社媒内容复盘 Agent。基于 GEO-SEO 方法论和 B2B 销售社媒最佳实践，多维度评分 + 具体改进建议。使用 web_search 验证事实声明和竞品内容。"
category: content-review
triggers:
  - 复盘内容
  - 内容审核
  - 内容评分
  - review content
  - SEO检查
  - 内容质量
tools:
  - web_search
---

# Social Content Review — B2B 社媒内容复盘

对已生成的社媒内容进行多维度质量评估，输出具体改进建议。

> 本技能是复盘环节的方法论驱动器，不是静态 prompt。复盘 Agent 应加载本技能后，结合 `web_search` 工具进行事实核查和竞品对比。

---

## 复盘流程（Agent 必须按顺序执行）

```
Step 1: 加载评估维度 → 理解 6 个评分轴
Step 2: web_search 验证 → 核查内容中的数据声明、关键词热度、竞品内容
Step 3: 结构化输出 → 每个维度评分 + 具体修改建议
```

---

## 6 维度评分体系

每个维度 0-10 分，总评 = 6 维度加权平均。

### 1. GEO 可引用性（权重 25%）

内容是否能被 ChatGPT/Perplexity/Kimi 引用？

| 检查项 | 得分标准 |
|--------|---------|
| 包含 FAQ 问答对 | 有 +2 |
| 包含 A vs B 对比结构 | 有 +2 |
| 包含步骤清单（Step 1/2/3）| 有 +2 |
| 包含具体数据点 | 有 +2 |
| H1/H2/H3 结构清晰 | 有 +1 |
| 包含 Schema.org 友好的结构 | 有 +1 |

### 2. B2B 决策者吸引力（权重 20%）

内容是否能打动采购决策人？

| 检查项 | 得分标准 |
|--------|---------|
| Hook 直接解决已知痛点 | 有 +3 |
| 包含 ROI / TCO 数据 | 有 +3 |
| 体现了源头厂家差异化（非贸易商）| 有 +2 |
| CTA 明确且低门槛 | 有 +2 |

### 3. 去AI味程度（权重 20%）

读起来像真人工程师写的，不是 AI 生成的？

| 禁用词检测 | 每出现一个 -1 |
|-----------|-------------|
| 过度使用数据罗列 | 每超过3个连续数据点 -1 |
| 段落开头全是数据 | 每个扣 -1 |
| 结尾 "I hope this helps" 类句式 | -2 |

**禁用词表**: leverage, game-changer, revolutionize, cutting-edge, empower, synergize, seamless, innovative, transformative, paradigm shift, next-generation, state-of-the-art

### 4. 平台合规性（权重 15%）

内容是否符合目标平台的格式要求？

| 平台 | 检查项 |
|------|--------|
| LinkedIn | Hook ≤ 120字符, 正文 800-1300字符, 3-5 hashtag, 结尾提问 |
| Facebook | 100-250词, 口语化, 2-3 hashtag |
| Alibaba | 标题关键词前置, 5-8 FAQ, 无 hashtag |

### 5. 事实可验证性（权重 10%）

内容中的数据声明是否可验证？

| 检查项 | 得分标准 |
|--------|---------|
| 具体数字有来源 | 有 +5 |
| "延长寿命3倍" 类声明可验证 | 是 +3 |
| 使用了模糊描述（"大幅提升"）| 每处 -2 |

> 复盘 Agent 应使用 web_search 抽查 1-2 个关键声明。

### 6. 关键词 SEO 覆盖（权重 10%）

目标关键词是否自然融入？

| 检查项 | 得分标准 |
|--------|---------|
| 主关键词出现在前 100 字符 | 有 +4 |
| 包含长尾关键词变体 | 有 +3 |
| 关键词密度自然（不堆砌）| 有 +3 |

> 复盘 Agent 应使用 web_search 检查关键词当前热度。

---

## 竞品对比（web_search 驱动）

复盘 Agent 应搜索竞品在目标平台的近期内容，对比：

```
web_search(query="site:linkedin.com {product} manufacturer {competitor}")
```

对比维度：
- 主题选择 — 竞品在写什么话题？
- 互动量 — 竞品的 engagement 如何？
- 差异化机会 — 我们可以写什么竞品没覆盖的？

---

## 输出格式（严格遵循）

```
REVIEW_RESULT:
overall_score: [0-10]
pass: [true/false — ≥7.0 为通过]

dimensions:
- name: GEO可引用性
  score: [0-10]
  findings: [2-3句具体发现]
  suggestions: [具体修改建议，可复制粘贴的改进文本]

- name: B2B决策者吸引力
  score: [0-10]
  findings: ...
  suggestions: ...

- name: 去AI味程度
  score: [0-10]
  findings: ...
  suggestions: ...

- name: 平台合规性
  score: [0-10]
  findings: ...
  suggestions: ...

- name: 事实可验证性
  score: [0-10]
  findings: ...
  suggestions: ...

- name: 关键词SEO覆盖
  score: [0-10]
  findings: ...
  suggestions: ...

competitor_insight: [竞品内容对比发现，1-2句]
improved_content: [基于所有建议改写后的完整内容，直接可替换原文]
```

---

## 与其他技能的关系

| 技能 | 关系 |
|------|------|
| `geo-content-gen` | GEO 方法论参考 |
| `ai-social-media-content` | 平台适配规范参考 |
| `holo-social-gen` | 内容生成上游 |
| `deep-research` | 深度竞品分析 |

---

## 约束

1. 评分必须基于证据，不凭感觉
2. 建议必须具体到可以复制粘贴的文本，不说"建议优化"
3. web_search 必须实际调用，不能跳过
4. improved_content 必须是完整可用的内容，不是片段
5. 评分标准不可降低 — 7.0 是硬门槛

_Version: 1.0.0 | 创建: 2026-05-16_
