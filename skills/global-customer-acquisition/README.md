# HOLO 智能获客系统 v2.5.0

> 温州红龙工业设备制造有限公司 · AI Agent 获客技能集群
>
> **一句话获客**：业务员说一句话，AI 自动完成客户发现 → 背调 → 开发信 → 触达 → 跟进
>
> 支持 **邮件 + WhatsApp 双通道** 智能触达

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│  Skills Router（声明式路由）⭐ v2.5.0                          │
│  读 ROUTING-TABLE.yaml → 意图匹配 → 技能选择 → 故障切换       │
│  8种意图 × 邮件/WhatsApp 双通道                                │
├─────────────────────────────────────────────────────────────────┤
│  7 层上下文系统                                               │
│  IDENTITY → SOUL → AGENTS → USER → HEARTBEAT → MEMORY → TOOLS │
├─────────────────────────────────────────────────────────────────┤
│  获客流程                                                     │
│  发现层 → 情报层 → 触达层 → 支持层 → 管理层                  │
├─────────────────────────────────────────────────────────────────┤
│  纯 Markdown 指令 · 零代码依赖 · 跨平台兼容                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 技能集群（70+ 技能）

### 编排层

| 技能 | 用途 |
|------|------|
| `acquisition-coordinator` | 获客任务协调器，拆解复杂任务 |
| `acquisition-evaluator` | 独立验收 Agent，评估工作质量 |
| `acquisition-init` | 获客系统初始化引导 |
| `acquisition-workflow` | 端到端获客工作流定义 |

### 发现层

| 技能 | 用途 |
|------|------|
| `linkedin` | LinkedIn 客户搜索 |
| `facebook-acquisition` | Facebook 客户挖掘 |
| `instagram-acquisition` | Instagram 客户搜索 |
| `teyi-customs` | 特易海关数据查询 |
| `scrapling` | 通用网页爬虫 |

### 情报层

| 技能 | 用途 |
|------|------|
| `company-research` | 企业背调与情报 |
| `market-research` | 市场调研 |
| `in-depth-research` | 深度多源调研 |
| `deep-research` | 深度调研（别名入口）|
| `autoresearch` | 自动调研 |
| `customer-intelligence` | 客户情报整合 + 动态 ICP 评分 |

### 触达层

| 技能 | 用途 |
|------|------|
| `cold-email-generator` | 开发信生成 v2.0（≥9.0 分才通过）|
| `email-sender` | 邮件自动发送 |
| `email-marketing` | 邮件营销 |
| `email-outreach-ops` | 邮件外联运营 |
| `linkedin-writer` | LinkedIn 内容撰写 |
| `whatsapp-outreach` | **WhatsApp 触达**（HOLO 专属）|
| `delivery-queue` | 消息分段发送，模拟真人节奏 |

### 支持层

| 技能 | 用途 |
|------|------|
| `customer-deduplication` | 跨平台客户去重 |
| `sales-pipeline-tracker` | 销售管道追踪 |
| `crm` | CRM 管理 |
| `fumamx-crm` | Fumamx CRM 集成 |

### 人格 / 产品层

| 技能 | 用途 |
|------|------|
| `honglong-assistant` | 红龙小助手身份，自动激活获客技能 |
| `honglong-products` | 红龙产品库（风冷机/水冷机/分层机等）|

### 记忆层

| 技能 | 用途 |
|------|------|
| `smart-memory` | 智能记忆管理 |
| `humanoid-memory` | 类人记忆系统 |
| `memory-hygiene` | 记忆清理维护 |
| `memory-tiering` | 记忆分层 |
| `memory-manager` | 记忆管理器 |
| `chroma-memory` | **向量记忆**（HOLO 专属）|
| `supermemory` | **超级记忆**（HOLO 专属）|

### 基础设施层

| 技能 | 用途 |
|------|------|
| `agent-reach` | **多渠道统一触达接口**（HOLO 专属）|
| `agent-reach-setup` | Agent Reach 配置 |
| `release-manager` | 版本发布管理 |
| `skill-creator` | 技能创建器 |
| `find-skills` | 技能发现 |
| `evolver` | 技能自进化 |

---

## 3 条铁律

1. **邮箱铁律**：必须用决策人邮箱，禁用 `info@`
2. **评分铁律**：ICP 评分 ≥ 75 分才触达
3. **质量铁律**：开发信评分 ≥ 9.0 分 / WhatsApp 消息评分 ≥ 8.0 分才发送

---

## 业务员指令表

| 业务员说 | AI 做什么 |
|---------|---------|
| "帮我找美国传送带客户" | 深度调研 + 批量获客 |
| "帮我背调这家公司" | 6 维度 ICP 评分 + 报告 |
| "给这家公司发开发信" | 生成 → 润色 → 评分 → 发送 |
| "发 WhatsApp 消息" | 个性化消息 → 确认 → 发送 |
| "智能触达这个客户" | 自动判断最优通道（邮件/WhatsApp）|
| "帮我发一篇 Facebook" | 生成帖子 + 发布 |
| "查看 Pipeline" | 客户状态报表 |

---

## 快速开始

### 1. 安装

```powershell
# 克隆仓库
git clone https://github.com/Wike-CHI/acquisition-agent.git

# 技能目录结构
skills/
├── global-customer-acquisition/   # 主入口技能
│   ├── SKILL.md                   # 核心指令（v2.5.0）
│   ├── references/                # 详细文档
│   └── skills/                    # HOLO 子技能（33个）
├── acquisition-coordinator/       # 协调器
├── cold-email-generator/          # 开发信
├── whatsapp-outreach/             # WhatsApp触达
├── ...                            # 70+ 技能
└── sync-to-github.ps1             # 同步脚本
```

### 2. 使用

直接对 AI 说业务需求即可，系统自动路由到对应技能。

---

## 同步脚本

将本地技能增量同步到 GitHub 仓库：

```powershell
.\dist\external-skills\release-manager\scripts\sync-to-github.ps1
```

**v2.5.0 新增**：
- HOLO 子技能自动回退查找（`global-customer-acquisition/skills/`）
- 4 个 HOLO 专属技能纳入同步：`chroma-memory`、`supermemory`、`agent-reach`、`whatsapp-outreach`
- 同步日志标记 `(HOLO)` 标识子目录来源

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| **v2.5.0** | 2026-04-06 | WhatsApp 双通道触达 + HOLO 子技能同步修复 |
| v2.4.0 | 2026-04-03 | 智能触达路由 + 联系方式验证铁律 |
| v2.3.0 | 2026-03-30 | Skills Router 声明式路由重构 |
| v2.0.0 | 2026-03-25 | HOLO 架构 + 7 层上下文系统 |
| v1.2.0 | 2026-03-27 | 5 种 Skill 设计模式 + 12 依赖技能 |

---

## 统计

| 项目 | 数量 |
|------|------|
| 技能总数 | 70+ |
| 获客流程步骤 | 11 步 |
| ICP 评分维度 | 6 维度 |
| 触达通道 | 邮件 + WhatsApp |
| 社媒平台 | Facebook / Instagram / LinkedIn |
| 外部技能集成 | 21 个 |

---

## 许可

MIT License · 温州红龙工业设备制造有限公司

---

_让获客变得简单、高效、可持续！🚀_
