# 🐉 红龙获客系统 (HOLO Acquisition Agent)

> 温州红龙工业设备制造有限公司 — AI 智能获客技能集群

## 概述

红龙获客系统是一套基于 AI Agent 技能集群框架的自动化获客系统，涵盖客户发现、情报分析、开发信触达、Pipeline 管理等端到端流程。

**架构版本：** v3.0.0  
**参考模板：** [iPythoning/b2b-sdr-agent-template](https://github.com/iPythoning/b2b-sdr-agent-template)

---

## 目录结构

```
~/.hermes/skills/acquisition/
├── skills/          82个技能（路由系统索引）
├── workspace/       运营文件
├── archive/         33个已归档技能
├── deploy/         部署脚本和工具链
├── product-kb/     产品知识库（NAS挂载后填入）
├── examples/        行业场景案例
├── docs/internal/   内部文档
└── local/           本地平台特定工具
```

详见 [NEW-STRUCTURE.md](NEW-STRUCTURE.md)

---

## 快速开始

1. 克隆仓库到 `~/.hermes/skills/acquisition/`
2. 运行 `deploy/scripts/sync-to-github.ps1` 初始化
3. 查看 [workspace/AGENTS.md](AGENTS.md) — AI SDR Pipeline 操作手册
4. 查看 [workspace/HEARTBEAT.md](HEARTBEAT.md) — 系统自动巡检配置

---

## 核心文档

| 文档 | 说明 |
|------|------|
| [AGENTS.md](workspace/AGENTS.md) | AI SDR Pipeline 操作手册（10阶段） |
| [HEARTBEAT.md](workspace/HEARTBEAT.md) | 系统自动巡检配置（13项检查） |
| [MEMORY.md](workspace/MEMORY.md) | 持久化记忆（客户/竞品/上下文） |
| [ROUTING-TABLE.yaml](workspace/ROUTING-TABLE.yaml) | 路由表（74个技能索引） |
| [SKILLS-MANIFEST.yaml](workspace/SKILLS-MANIFEST.yaml) | 技能目录（67个技能分类） |
| [NEW-STRUCTURE.md](workspace/NEW-STRUCTURE.md) | 目录结构说明 |

---

## 技能导航

### 核心入口
- `global-customer-acquisition` — HOLO-AGENT 主入口
- `acquisition-coordinator` — 获客任务编排器
- `acquisition-workflow` — 端到端获客流程

### 发现层
- `company-research` — 海外 B2B 企业背景调查
- `market-research` — 六维度市场研究
- `teyi-customs` — 海关数据搜索

### 触达层
- `cold-email-generator` — 开发信生成（v2.0）
- `whatsapp-outreach` — WhatsApp 批量触达
- `linkedin` — LinkedIn AI 触达
- `telegram-toolkit` — Telegram 触达（独联体/俄罗斯）

### 情报层
- `customer-intelligence` — 客户情报整合
- `deep-research` — 深度多源调研
- `honglong-products` — 红龙产品知识库

### 运营层
- `smart-quote` — 智能报价系统
- `quotation-generator` — 报价单生成
- `follow-up-signal-monitor` — 跟进信号监控
- `email-sender` — 邮件自动发送
- `sales-pipeline-tracker` — Pipeline 阶段追踪

---

## 运营指标

| 市场 | 状态 | 线索 |
|------|------|------|
| 南美（巴西/智利/阿根廷） | 🟡 开发中 | 31家已发现，10家A级 |
| 中东（沙特/阿联酋） | 🔴 待开发 | — |
| 东南亚（越南/印尼/菲律宾） | 🔴 待开发 | — |
| 独联体（俄罗斯） | 🔴 待开发 | — |
| 非洲 | 🔴 待开发 | — |

---

## 技术栈

- **框架：** Hermes Agent（OpenClaw）技能集群
- **语言：** Python + Node.js + PowerShell
- **存储：** SQLite/supermemory 向量库 + CSV/JSON 文件
- **通信：** 163邮箱（SMTP）+ WhatsApp + Telegram + LinkedIn
- **自动化：** Cron（7个定时任务）
- **路由：** YAML-based intent routing + skills_index

---

## 版本历史

- **v3.0.0** (2026-04-17) — 目录结构重构，参考 b2b-sdr-agent-template
- **v2.6.0** (2026-04-14) — P0+P1+P2全面升级
- 详见 [CHANGELOG.md](CHANGELOG.md)
