---
name: holo-acquisition
description: "红龙工业设备 AI 智能获客系统。B2B 全栈 SDR，覆盖客户发现→背景调查→开发信触达→智能报价→Pipeline 管理，支持 WhatsApp + Email + Telegram + LinkedIn 多渠道。基于 Hermes Agent 技能集群。"
license: proprietary
---

# 红龙获客系统 — HOLO Acquisition Agent

温州红龙工业设备制造有限公司的 AI 销售开发代表。覆盖从线索发现到成交的完整 B2B 外贸获客流程。

## 7层上下文系统

| 层级 | 文件 | 用途 |
|------|------|------|
| 身份 | `IDENTITY.md` | 公司名称、角色、产品目录 |
| 人格 | `SOUL.md` | 个性、价值观、沟通规范 |
| 流程 | `AGENTS.md` | 10阶段销售 Pipeline + 阶段门控 |
| 档案 | `USER.md` | 所有者（业务员）信息、ICP 评分、管理员白名单 |
| 心跳 | `HEARTBEAT.md` | 13项 Pipeline 自动巡检（cron）|
| 记忆 | `MEMORY.md` | 4层防遗忘协议（L1 MemOS / L2 压缩 / L3 ChromaDB / L4 CRM快照）|
| 工具 | `TOOLS.md` | CRM、渠道、凭证、集成配置 |

## 核心功能

- **10阶段销售 Pipeline**: 线索捕获 → BANT认证 → CRM录入 → 调研丰富 → 报价 → 谈判 → 汇报 → 培育/售后 → 邮件序列 → 多渠道编排
- **客户发现**: Exa 语义搜索 + 海关数据 + 企业背景调查
- **智能报价**: 先背调后报价，根据 ICP 评分确定利润率区间
- **多渠道触达**: WhatsApp + Email + Telegram + LinkedIn
- **4层记忆**: 跨会话客户信息永不丢失
- **7个 Cron 自动任务**: 无间断运转
- **个性化开发信**: 去 AI 味话术 + 文化适配 + 评分过滤

## 技能导航

| 技能 | 说明 |
|------|------|
| `global-customer-acquisition` | 主入口 |
| `acquisition-coordinator` | 任务编排 |
| `cold-email-generator` | 开发信生成 |
| `smart-quote` | 智能报价 |
| `follow-up-signal-monitor` | 跟进信号监控 |
| `whatsapp-outreach` | WhatsApp 触达 |
| `company-research` | 企业背景调查 |
| `teyi-customs` | 海关数据 |
| `sales-pipeline-tracker` | Pipeline 追踪 |
| `inquiry-response` | 客户回复应答 |

全部 82 个技能见 `SKILLS-MANIFEST.yaml`

## 快速开始

1. 查看 `IDENTITY.md` 了解公司身份
2. 查看 `AGENTS.md` 理解 Pipeline 流程
3. 查看 `USER.md` 了解业务员档案
4. 运行 HEARTBEAT: `holo-heartbeat-executor`

## 数据路径

- **本地系统**: `~/.hermes/skills/acquisition/`
- **Pipeline 数据**: `C:/Users/Administrator/WorkBuddy/`
- **邮件发送**: `/tmp/sender.mjs`
- **NAS 视频库**: `\\192.168.0.194`（未挂载）

## 版本

- **v3.0.0** (2026-04-17) — 目录结构重构，参考 b2b-sdr-agent-template
- **v2.6.0** (2026-04-14) — P0+P1+P2 全面升级
- [完整变更记录](workspace/CHANGELOG.md)
