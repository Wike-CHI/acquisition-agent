---
name: conversion-domain
description: 报价与转化领域 MOC。智能报价、提案生成、Pipeline 管理、CRM 操作——把兴趣变成订单。触发词：报价、询价、提案、Pipeline、CRM。
version: 1.0.0
capability: core
priority: 80
---

# 报价与转化

> **"怎么报价？怎么跟进？Deal 处于什么阶段？"** — 从客户表达购买意向到成交的全链路。

## 技能节点

### 报价与提案
- **[[smart-quote]]** — 智能报价。⚠️ 先背调后报价！锁对话审批流程，ICP 评分驱动利润率区间。**报价的唯一入口。**
- **[[quotation-generator]]** — PDF 形式发票生成。生成红龙公司标准 QUOTATION FORM PDF，含产品照片位和详细规格参数。
- **[[holo-proposal-generator]]** — HOLO 数字提案包。包含封面、客户摘要、方案对比、案例、报价、CTA 的专业 PDF 提案。

### Pipeline 与 CRM
- **[[sales]]** — 通用销售助手（取代 sales-pipeline-tracker）。Pipeline 阶段追踪 + CRM 集成 + 线索跟踪 + 外联自动化 + 收入预测 + 瓶颈识别。
- **[[crm]]** — 个人 CRM。结构化客户数据库，支持搜索、分类、标签、跟进记录。
- **[[fumamx-crm]]** — 孚盟 MX CRM 集成。B+C 双轨架构（MCP Server 23 tools + CDP 浏览器自动化），覆盖客户/联系人/跟进/报价单/销售订单/邮件/培育/公海/任务/统计。
- **[[fumamx-update]]** — 孚盟 CRM 客户更新。更新已有客户信息、添加到培育序列。
- **[[customer-deduplication]]** — 客户去重。跨平台合并重复客户，按公司名/域名/联系方式匹配。

### 销售赋能
- **[[sales]]** — 通用销售助手。CRM 集成、线索跟踪、外联自动化、Pipeline 管理。
- **[[sales-champion]]** — 销冠决策引擎。SPIN 需求判断 + 影响力说服 + 挑战者谈判 + 信号识别词典。
- **[[holo-sales-trainer]]** — 销售训练场。AI 模拟真实客户对话 + 话术评估。
- **[[sdr-training-ground]]** — SDR 培训场。AI 模拟客户对话 + 话术练习。
- **[[business-development]]** — 商务拓展。合作伙伴外联、竞品分析、商务提案。

## 遍历指引

- 客户问价 → [[smart-quote]]（先调 [[company-research]] 获取 ICP 评分）
- 生成报价单 PDF → [[quotation-generator]]
- 做提案包 → [[holo-proposal-generator]]
- 查 Pipeline → [[sales]]
- 操作用 CRM → [[fumamx-crm]]
- 处理异议 → [[sales-champion]]
- 新人培训 → [[holo-sales-trainer]] + [[sdr-training-ground]]

---

## 关联领域

- 报价前必背调 → [[_index-discovery]] (company-research)
- 报价后跟进 → [[_index-outreach]] (follow-up-signal-monitor)
- 成交后存储 → [[_index-intelligence]] (knowledge-base)
