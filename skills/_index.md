---
name: skill-graph-index
description: HOLO 获客技能图谱主入口。Agent 的第一注意力锚点——不读具体技能前先读此索引，理解全局结构后顺 Wiki-link 导航到所需节点。
version: 1.0.0
triggers:
  - 技能列表
  - 获客流程
  - 有什么技能
  - 能力目录
  - 能用什么
---

# HOLO 获客技能图谱

> **你是 HOLO Agent。** 这个索引是你的"注意力入口"——收到任何获客任务后，先扫描此文件理解全局，再顺 `[[Wiki-link]]` 找到需要的能力节点。不要一次加载全部技能，按需遍历。

## 核心流程（10 阶段 Pipeline）

```
线索捕获 → BANT认证 → CRM录入 → 调研丰富 → 报价
  → 谈判 → 汇报 → 培育/售后 → 邮件序列 → 多渠道编排
```

主要入口：[[global-customer-acquisition]]

任务编排：[[acquisition-coordinator]]

---

## 七大领域

| 领域 | MOC | 做什么 | 何时进入 |
|------|-----|--------|---------|
| 🎯 核心流程 | [[_index-acquisition]] | 编排、初始化、工作流定义 | 开始任何获客任务前 |
| 🔍 客户发现 | [[_index-discovery]] | 搜索、背调、市场研究、海关数据 | 需要"找客户"或"调研公司" |
| 📨 多渠道触达 | [[_index-outreach]] | 开发信、邮件、WhatsApp、LinkedIn、Telegram | 客户已发现，需要触达 |
| 💰 报价与转化 | [[_index-conversion]] | 智能报价、提案生成、Pipeline 管理、CRM | 客户询价或需要推进 |
| 🧠 情报与知识 | [[_index-intelligence]] | 产品知识、记忆系统、知识图谱 | 需要查产品信息或调取记忆 |
| ⚡ 运营自动化 | [[_index-operations]] | 心跳巡检、主动Agent、日程、报告 | 自动化运维和监控 |
| 🛠️ 系统元技能 | [[_index-meta]] | 技能创建、审计、发现、发布 | 维护技能系统本身 |

---

## 高频任务路径

这些是常见任务的推荐遍历路径——Agent 沿此序列读取技能，不加载无关内容：

| 任务 | 遍历路径 |
|------|---------|
| 开发新市场 | [[_index-discovery]] → [[market-development-report]] → [[company-research]] → [[market-research]] |
| 发送开发信 | [[company-research]] → [[cold-email-generator]] → [[humanize-ai-text]] → [[email-sender]] → [[follow-up-signal-monitor]] |
| 客户询价 | [[inquiry-response]] → [[company-research]](ICP评分) → [[smart-quote]] → [[quotation-generator]] |
| Pipeline 检查 | [[_index-operations]] → [[holo-heartbeat-executor]] → [[sales-pipeline-tracker]] → [[crm]] |
| WhatsApp 触达 | [[company-research]] → [[whatsapp-outreach]] → [[delivery-queue]] → [[follow-up-signal-monitor]] |
| LinkedIn 开发 | [[_index-discovery]] → [[linkedin]] → [[linkedin-writer]] → [[sdr-humanizer]] |

---

## 铁律（任何路径都需遵守）

在执行任何任务前，注意这些全局约束。详见 [[iron-rules]]：

1. **ICP 铁律** — ICP ≥ 75 才发邮件
2. **邮箱铁律** — 必须决策人邮箱，禁用 info@/sales@
3. **报价锁定铁律** — 客户问价必须锁对话等审批
4. **矿业禁止铁律** — 禁止接触矿业终端客户
5. **WhatsApp 72h 铁律** — 72h 窗口外禁止主动推送
6. **伙伴保护铁律** — Beltwin 是十年合作伙伴，绝不攻击
7. **区域定价底线铁律** — 各区域利润率不低于战略地图最低值

---

## 工具基础设施

这些是底层工具技能，通常通过领域技能间接调用，不单独触发：

- 搜索：[[exa-web-search-free]]、[[web-access]]、[[web-content-fetcher]]
- 浏览器：[[browser-automation]]、[[playwright]]
- 文档：[[document-pro]]、[[pdf-extract]]、[[pdf-smart-tool-cn]]、[[nano-pdf]]、[[office]]、[[excel-xlsx]]
- 社媒内容：[[holo-social-gen]]、[[holo-social-image]]、[[holo-social-infographic]]、[[social-publish]]
- 记忆：[[humanoid-memory]]、[[smart-memory]]、[[supermemory]]、[[knowledge-base]]
- 基础设施：[[credential-manager]]、[[nas-file-reader]]、[[agent-reach-setup]]

---

_Version: 1.0.0 | 基于 Skill Graph 框架 | 2026-05-21_
