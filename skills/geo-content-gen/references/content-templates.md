# 内容模板库

> 供 geo-content-gen 主技能引用。6 种内容模板 + Schema.org 结构化数据 + 质量检查清单

## 目录

1. [Template 1: 技术教学](#template-1-技术教学geo-被引用率最高)
2. [Template 2: 对比评测](#template-2-对比评测ai-引擎第二爱引用)
3. [Template 3: 行业洞察](#template-3-行业洞察--数据驱动)
4. [Template 4: 案例展示](#template-4-案例展示)
5. [Template 5: 选购指南](#template-5-选购指南)
6. [Template 6: Alibaba 产品页](#template-6-alibaba-产品页)
7. [Schema.org 结构化数据](#schemaorg-结构化数据模板)
8. [质量检查清单](#质量检查清单10-项必查)
9. [禁用词表](#禁用词表去-ai-味)

---

## Template 1: 技术教学（GEO 被引用率最高）

```
H1: [问题/How-To 标题，含主关键词]
H2: 背景与常见误区
H2: 分步操作指南（Step 1/2/3...）
H2: 技术参数参考表
H2: 常见问题 FAQ（3-5 个问答）
H2: 总结 + CTA
```

**GEO 优化:** Step 清单用有序列表 / 技术参数用表格 / FAQ 用 Q&A 格式

**标题示例:**
- "How to Vulcanize a Conveyor Belt: Complete Step-by-Step Guide (2026)"
- "Conveyor Belt Splicing Temperature & Pressure Chart — Technical Reference"

---

## Template 2: 对比评测（AI 引擎第二爱引用）

```
H1: [A vs B 对比标题]
H2: 概述
H2: 对比表格（6-8 个维度）
H2: 各方案适用场景
H2: 成本分析
H2: FAQ
H2: 推荐结论 + CTA
```

**对比维度参考（热硫化 vs 冷硫化）:**

| 维度 | 热硫化 | 冷硫化 |
|------|--------|--------|
| 接头强度 | 90-100% 原带强度 | 60-80% 原带强度 |
| 使用寿命 | 5-10 年 | 1-3 年 |
| 施工时间 | 4-8 小时 | 1-2 小时 |
| 设备成本 | $5,000-$50,000 | $500-$2,000 |
| 适用场景 | 高张力/长距离/矿业 | 临时修复/低张力 |

---

## Template 3: 行业洞察 / 数据驱动

```
Hook: [一个反直觉的数据点]
H2: 行业现状数据
H2: 趋势分析
H2: 对采购决策者的影响
H2: 行动建议
CTA: 询盘/下载白皮书
```

**公开数据来源:**
- 全球输送带市场规模: ~$6.8B (2025), CAGR 3.5%
- 输送带维护占矿山运营成本: 15-25%
- 硫化接头 vs 机械接头寿命差: 3-5 倍

---

## Template 4: 案例展示

```
H1: [客户国家] [行业] 输送带硫化项目案例
H2: 客户背景
H2: 面临问题
H2: 解决方案（产品 + 技术参数）
H2: 实施结果（量化数据）
H2: 客户评价
CTA: 获取同类方案
```

**注意:** 客户名称需脱敏或征得同意 / 数据必须可验证 / 突出源头厂家优势

---

## Template 5: 选购指南

```
H1: How to Choose the Right [Product] for Your Application
H2: 关键参数解读（带宽/压力/温度/功率）
H2: 选购决策树
H2: 常见错误（3-5 个）
H2: 型号对比表
H2: FAQ
CTA: 获取报价
```

---

## Template 6: Alibaba 产品页

```
标题: [主关键词] + [属性] + [认证] + [Factory Direct]
H2: 产品描述（3-5 段，关键词自然分布）
H2: 核心卖点（5-8 个 bullet points）
H2: 技术参数表
H2: 应用场景
H2: 公司简介（源头厂家优势）
H2: FAQ（5-8 个问答）
H2: 证书 & 认证
```

---

## Schema.org 结构化数据模板

### Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Belt Vulcanizing Press [Model]",
  "manufacturer": {
    "@type": "Organization",
    "name": "Wenzhou Honglong Industrial Equipment Manufacturing Co., Ltd."
  },
  "description": "[Product description]",
  "category": "Industrial Equipment > Conveyor Belt Splicing",
  "certification": ["CE", "ISO 9001"],
  "countryOfOrigin": "CN"
}
```

### FAQ Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[FAQ Question]",
      "acceptedAnswer": { "@type": "Answer", "text": "[FAQ Answer]" }
    }
  ]
}
```

### HowTo Schema

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Vulcanize a Conveyor Belt",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "[Step Name]", "text": "[Step Description]" }
  ]
}
```

---

## 质量检查清单（10 项必查）

| # | 检查项 | 通过标准 |
|---|--------|---------|
| 1 | 关键词密度 | 主关键词 3-8 次，自然分布 |
| 2 | 数据点 | 至少 1 个具体数字或数据 |
| 3 | FAQ | 至少 1 个问答对 |
| 4 | 标题层级 | H1 → H2 → H3 结构清晰 |
| 5 | 长度合规 | 符合目标平台限制 |
| 6 | 本地化 | 非机器翻译，有文化适配 |
| 7 | CTA | 有明确的下一步行动指引 |
| 8 | 去 AI 味 | 禁用词列表扫描通过 |
| 9 | 内链 | 至少 1 个相关内容引用 |
| 10 | Schema 建议 | 附加 JSON-LD 代码片段 |

---

## 禁用词表（去 AI 味）

**英文禁用:**
- "In today's rapidly evolving..." / "I hope this helps"
- "As a leading..." / "We are proud to..."
- "It's worth noting that..." / "At the end of the day..."
- "Game-changer", "Revolutionary", "Cutting-edge"
- "I'm humbled to announce..." / "Let's dive in"
- "Empower", "Leverage" (作动词), "Synergy", "Disrupt"

**中文禁用:**
- "作为行业领先..." / "我们致力于..." / "众所周知..."
- "在当今快速发展的..."
- "赋能", "降本增效" (空洞堆砌时)
