---
name: cold-email-generator
version: 1.0.0
description: "开发信生成技能。根据客户背景、产品匹配度、目标市场文化，生成高质量、个性化的 B2B 开发信。支持多轮打磨、评分优化。"
always: false
triggers:
  - 开发信
  - cold email
  - 外联邮件
  - 销售邮件
  - 推销邮件
  - 生成邮件
---

# Cold Email Generator - 开发信生成

根据客户情报自动生成个性化 B2B 开发信，确保每封信都是为该客户量身定制。

## 核心原则

1. **个性化** - 每封信必须包含客户特定信息（公司名、产品线、近期动态）
2. **简洁** - 控制在 150 词以内，3-4 段
3. **价值导向** - 强调客户能获得什么，而非我们卖什么
4. **文化适配** - 根据目标国家文化调整语气和格式

## 生成流程

### 第1轮：信息收集
输入：
- 客户公司名 + 国家
- 客户业务范围
- 匹配的红龙产品
- ICP 评分等级

### 第2轮：初稿生成
模板结构：
```
Subject: [个性化主题行]
Greeting: [姓名，非 Dear Sir/Madam]
Hook: [与客户相关的行业趋势/痛点]
Value: [红龙产品如何解决该痛点]
CTA: [明确但不过于强硬的行动号召]
Signature: [Wike 签名]
```

### 第3轮：评分优化
评分维度（满分10分）：
- 个性化程度（0-2）：是否包含客户特定信息
- 相关性（0-2）：产品匹配度
- 简洁性（0-2）：是否简洁有力
- 语法质量（0-2）：无语法错误，专业语气
- CTA 有效性（0-2）：行动号召明确可行

**目标评分 ≥ 7.0**，低于7.0需重新打磨

## 签名规范（强制）

所有开发信必须使用以下签名：
```
Wike | HONGLONG Industrial Equipment
Phone/WhatsApp: +86 13165862311
Email: wikeye2025@163.com
Web: holobelt.com | beltsplicepress.com
Address: Ruian, Wenzhou, Zhejiang 325200, China
```

## 目标市场文化适配

| 市场 | 语气 | 注意事项 |
|------|------|----------|
| 越南 | 友好直接 | 可用 Vietnamese 问候语 |
| 印度 | 正式商务 | 强调价格优势 |
| 巴西 | 热情 | 可用 Portuguese 问候 |
| 马来西亚 | 中等正式 | 注意宗教节日 |
| 埃及 | 正式 | 注意时差和工作日 |

## 与获客系统集成

- `customer-intelligence` → 提供客户背调数据作为输入
- `honglong-products` → 提供产品匹配信息
- `acquisition-evaluator` → 验收开发信质量（需≥7.0分）
- `email-sender` → 发送最终版本
- `sdr-humanizer` → 拟人化优化（可选）
