---
name: humanize-ai-text
version: 1.0.0
description: AI文本拟人化技能 — 检测并转化AI生成文本为自然人性化的表达，降低AI检测率至2%以下。冷邮件开发信必经流程。
always: false
triggers:
  - 去AI味
  - 拟人化润色
  - AI检测
  - humanize
---

# humanize-ai-text — AI文本拟人化

> **Skill Graph：** 领域 → [[_index-outreach|多渠道触达领域]] | 上游 ← [[company-research|企业背调]]（个性化素材） ← [[_index-outreach|触达领域]] | 下游 → [[email-sender|邮件发送]]


将 AI 生成的文本（尤其是冷开发信）转化为自然、人性化的表达，通过 AI 检测和智能转化双重流程，确保输出内容的 AI 密度 < 2%。

---

## 工作流程

```
输入：AI生成的文本（含AI模式特征）
    ↓
Step 1: detect.py → AI密度评分（≥8.5 则需要润色）
    ↓
Step 2: transform.py → 生成拟人化版本
    ↓
Step 3: 再检测 → 确认 AI密度 < 2%
    ↓
输出：可通过 AI 检测的自然文本
```

---

## Step 1: AI检测（detect.py）

### 使用方法

```bash
python detect.py "待检测的文本内容"
```

### 输出说明

```
AI Score: X.X / 10.0
判断: [PASS/NEED_HUMANIZE]
AI密度: X.XX%

PASS    → AI密度 < 8.5%，无需润色，可直接使用
NEED_HUMANIZE → AI密度 ≥ 8.5%，需要调用 Step 2 润色
```

### 检测维度

| 维度 | AI特征 | 人类特征 |
|------|--------|----------|
| 词汇多样性 | 使用 "Furthermore" "Moreover" "In conclusion" | 使用 "Also" "And" "So" |
| 句子结构 | 完美对称的复合句 | 偶有打断、补充 |
| 格式风格 | 过多列表、编号、格式一致 | 有变化、有省略 |
| 过渡词 | "首先、其次、最后" 三段式 | 自然的 "然后" "接着" |
| 开头 | "感谢您抽出宝贵时间" "我们很高兴..." | 直接切入、个性化开头 |

### 检测算法

```python
# 核心检测逻辑（伪代码）
def calculate_ai_score(text):
    score = 0.0
    # 1. 过渡词检测
    if has_pattern(text, ["Furthermore", "Moreover", "In conclusion", "Firstly", "Secondly"]):
        score += 2.0
    # 2. 格式化过度
    if has_excessive_bullets(text):
        score += 1.5
    # 3. 对称句子结构
    if has_perfect_parallelism(text):
        score += 1.0
    # 4. 开头问候语
    if has_formal_opening(text):
        score += 1.5
    # 5. 过度的正面形容词
    if has_excessive_superlatives(text):
        score += 1.0
    # 6. 关键词重复检测
    if has_keyword_repetition(text):
        score += 1.0
    return score
```

---

## Step 2: 智能润色（transform.py）

### 使用方法

```bash
python transform.py "需要润色的文本" [--target_score 8.5]
```

### 润色策略

| AI模式 | 润色方式 |
|--------|----------|
| 过度礼貌 | 改为直接、自信语气 |
| 机械过渡词 | 替换为自然的连接词 |
| 完美格式 | 打乱列表、添加口语化 |
| 冗长开头 | 改为简短、个性化切入点 |
| 三段式结构 | 合并或删除冗余段落 |
| 过多功能词 | 精简、保留核心信息 |

### 润色规则

```python
# 核心润色逻辑（伪代码）
def humanize(text, target_score=8.5):
    current_score = detect(text)

    # 多次迭代直到达到目标分数
    iterations = 0
    while current_score > target_score and iterations < 5:
        # 1. 简化开头（删除套话）
        text = simplify_opening(text)

        # 2. 替换过渡词
        text = replace_transitions(text)

        # 3. 打破格式化
        text = break_formatting(text)

        # 4. 添加口语化表达
        text = add_informal_touch(text)

        # 5. 删除冗余
        text = trim_redundancy(text)

        current_score = detect(text)
        iterations += 1

    return text
```

### 常见润色示例

| AI原文 | 润色后 |
|--------|--------|
| "首先，让我们探讨一下这个问题" | "我来直接说" |
| "感谢您抽出宝贵时间阅读我的邮件" | "直接说重点——" |
| "我们的产品具有以下优势：1. 2. 3." | "产品核心优势是：" |
| "综上所述，我们可以得出结论" | "所以，简单说——" |
| "此外，另一方面，然而" | "还有" |
| "请允许我自我介绍" | "我是——" |

---

## Step 3: 质量验证

润色完成后，自动运行检测确认 AI 密度 < 2%。若仍超标，提示人工介入。

### 验证通过标准

- AI Score < 2.0 (满分10.0)
- 核心信息完整度 > 95%
- 无拼写/语法错误

---

## 与其他技能配合

| 上游技能 | 输入 | humanize-ai-text 作用 |
|----------|------|----------------------|
| cold-email-generator | 冷开发信初稿 | 检测+润色 → AI密度<2% |
| linkedin-writer | LinkedIn 私信 | 检测+润色 → 自然表达 |
| whatsapp-outreach | WhatsApp 消息 | 检测+润色 → 口语化 |

| 下游技能 | 输出 |
|----------|------|
| email-sender | 发送最终版本 |
| acquisition-evaluator | 评分验收（需≥9.0分） |

---

## 配置

### 可选参数

```yaml
target_score: 6.0      # AI密度阈值（低于此值需润色）
min_score: 9.0        # 最终评分需达到此分数（满分10）
max_iterations: 5     # 最大润色迭代次数
preserve_keywords: []  # 保留关键词（不润色）
```

---

## 注意事项

1. **不要删除核心信息**：润色时必须保留产品名称、核心价值 proposition、客户名称
2. **避免过度润色**：每个句子只改 1-2 处，保留原意
3. **文化适配**：不同市场对正式度的期望不同，润色时考虑目标受众
4. **评分虚高问题**：若评分与实际不符，检查 detect.py 中的关键词库是否过期

---

_版本: 1.0.0_
_更新: 2026-04-21_
_用途: cold-email-generator v2.0 强制依赖_