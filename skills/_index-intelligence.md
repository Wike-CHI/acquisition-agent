---
name: intelligence-domain
description: 情报与知识领域 MOC。产品知识库、记忆系统（3 层）、知识图谱、NAS 文件——Agent 的"长期记忆"和"企业知识"。触发词：产品参数、记忆、知识库、产品信息。
version: 1.0.0
capability: core
priority: 70
---

# 情报与知识

> **"红龙卖什么？上次和这个客户聊了什么？这个参数是多少？"** — 本领域是 Agent 的持久化知识层，所有获客行为前强制先查此领域。

## 技能节点

### 产品知识
- **[[honglong-products]]** — 红龙产品知识库（主入口）。8 品类 40+ 产品，结构化本地文档，NAS 原始文件为兜底权威来源。优先读取技能本地文档。**产品查询的唯一入口。**
- 产品目录位于 `product-kb/catalog.json`

### 记忆系统（双轨并行）
- **[[humanoid-memory]]** — 类人脑记忆系统。基于 V-score 的记忆整合 + 艾宾浩斯遗忘曲线。适用于对话状态记忆和客户交互历史。
- **[[smart-memory]]** — 本地向量记忆。基于向量存储的持久化记忆，适用于非结构化的长期知识检索。
- **[[knowledge-base]]** — 团队共享情报中心。⚠️ 核心职责：收到调研报告后必须实际保存到 NAS，不能只输出路径！NAS 目标：`\\192.168.0.98\home`。被 [[company-research]]、[[cold-email-generator]]、[[smart-quote]] 调用。

### 文件读取
- **[[nas-file-reader]]** — NAS 共享盘文件读取。快速读取 NAS 文件，支持 PDF OCR 识别、图片分析。⚠️ NAS 可能未挂载。

## 遍历指引

- 查产品参数 → [[honglong-products]]（先读本地文档，不够再读 NAS）
- 查客户历史 → [[humanoid-memory]] + [[knowledge-base]]
- 存储调研报告 → [[knowledge-base]]（必须实际写入 NAS）
- 读取技术文档 → [[nas-file-reader]]
- 大规模记忆搜索 → [[smart-memory]]

---

## 关联领域

- 知识库有更新内容 → [[_index-meta]]（可能触发技能更新）
- 背调报告存入 → [[knowledge-base]] ← [[_index-discovery]] (company-research)
- 产品数据用于报价 → [[_index-conversion]] (smart-quote)
