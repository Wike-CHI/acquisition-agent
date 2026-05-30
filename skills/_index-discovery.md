---
name: discovery-domain
description: 客户发现与调研领域 MOC。搜索潜在客户、企业背调、市场研究、海关数据——找到客户并判断其价值。触发词：找客户、搜索、背调、调研、市场分析。
version: 1.0.0
capability: core
priority: 90
---

# 客户发现与调研

> **"这个客户值得开发吗？"** — 本领域回答此问题。从搜索客户存在性，到深度背调，到 ICP 评分，再到结构化报告。

## 技能节点

### 搜索与发现
- **[[teyi-customs]]** — 特易海关数据。查采购记录，发现从中国进口工业皮带设备的海外买家。覆盖 233 国 4100 万+企业。**发现客户的第一来源。**
- **[[exa-web-search-free]]** — 免费 AI 语义搜索。通过 Exa MCP 搜索企业和决策人。⚠️ 必须通过 mcporter 调用。

### 调研与分析
- **[[company-research]]** — 海外 B2B 企业背调（红龙定制）。6 维度 ICP 评分，输出结构化报告，用于客户筛选和开发信个性化。**背调的标准入口。**
- **[[market-research]]** — 六维度市场研究。市场规模、增长、细分、竞争格局、客户画像、进入策略。自动加载 HONGLONG-OVERRIDE.md。
- **[[deep-research]]** — 深度多源调研。系统性研究公司/市场/行业，方法论追踪 + 迭代深入。用于复杂调研需求。
- **[[customer-intelligence]]** — 客户情报整合。市场调研 + 背调 + 竞品分析，支持动态 ICP 评分，输出统一情报视图。
- **[[market-development-report]]** — 市场开发调研报告。输入目标市场，自动生成结构化报告（规模/竞争/关税/优先级/关键词）。
- **[[five-step-bg-check]]** — 外贸客户 5 招背调法。递进式公开信息搜集，适合快速初筛。区别于 [[company-research]] 的深度背调。
- **[[graphify]]** — 知识图谱。从产品目录、客户对话、市场调研中构建知识图谱，发现隐藏关联和交叉销售机会。

## 遍历指引

- 开拓新市场 → [[market-development-report]] → [[market-research]]
- 已有公司名 → [[company-research]]
- 找进口商 → [[teyi-customs]]
- 搜索决策人 → [[exa-web-search-free]]
- 快速初筛 → [[five-step-bg-check]]
- 深度调研 → [[deep-research]] + [[customer-intelligence]]

---

## 关联领域

调研完成后，根据目的进入：
- 发送开发信 → [[_index-outreach]] (cold-email-generator)
- 准备报价 → [[_index-conversion]] (smart-quote)
- 存储情报 → [[_index-intelligence]] (knowledge-base)
