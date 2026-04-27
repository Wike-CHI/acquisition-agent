---
name: holo-acquisition
description: "红龙工业设备 AI 智能获客系统。B2B 全栈 SDR，覆盖客户发现→背景调查→开发信触达→智能报价→Pipeline 管理，支持 WhatsApp + Email + Telegram + LinkedIn 多渠道。基于 OpenClaw Agent 技能集群。"
license: proprietary
---

# 红龙获客系统 — HOLO Acquisition Agent

温州红龙工业设备制造有限公司的 AI 销售开发代表。覆盖从线索发现到成交的完整 B2B 外贸获客流程。

## 7层上下文系统

| 层级 | 文件 | 用途 |
|------|------|------|
| 身份 | `IDENTITY.md` | 公司名称、角色、产品目录、Pipeline 状态流 |
| 人格 | `SOUL.md` | 个性、价值观、沟通规范、安全协议 |
| 流程 | `AGENTS.md` | 10阶段销售 Pipeline + 阶段门控 + 授权矩阵 |
| 档案 | `USER.md` | 所有者信息、ICP 评分、Admin 白名单、授权矩阵 |
| 心跳 | `HEARTBEAT.md` | 14项 Pipeline 自动巡检（cron） |
| 记忆 | `MEMORY.md` | 4层防遗忘协议（L1 MemOS / L2 压缩 / L3 ChromaDB / L4 CRM快照） |
| 工具 | `TOOLS.md` | CRM、渠道、凭证、A2UI 交互式卡片 |

## 核心功能

- **10阶段销售 Pipeline**: 线索捕获 → BANT认证 → CRM录入 → 调研丰富 → 报价 → 谈判 → 汇报 → 培育/售后 → 邮件序列 → 多渠道编排
- **Operator 双语模式**: 中文内部对话 + 客户语言对外沟通（可选启用）
- **客户发现**: Exa 语义搜索 + Jina AI 网页提取 + 企业背景调查
- **智能报价**: 先背调后报价，锁对话审批流程，ICP 评分驱动利润率区间
- **多渠道触达**: WhatsApp + Email + Telegram + LinkedIn，市场自适应渠道选择
- **4层防遗忘记忆**: L0 Active Memory → L1 MemOS → L2 双阈值压缩 → L3 ChromaDB → L4 CRM 快照
- **14项自动心跳巡检**: 每 15 分钟自动检查 Pipeline 健康度
- **个性化开发信**: 去 AI 味话术 + 文化适配 + 评分过滤（≥ 9.0 才发送）
- **安全协议**: Prompt 注入防御、最小权限、数据边界、GDPR、频率检测、Admin-Only

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

全部 84 个活跃技能 + 33 个归档见 `skills/catalog.json`

## 快速开始

1. 查看 `IDENTITY.md` 了解公司身份和 Pipeline 状态流
2. 查看 `AGENTS.md` 理解 10 阶段 Pipeline 流程
3. 查看 `USER.md` 了解业务员档案和 ICP 评分
4. 查看 `SOUL.md` 了解沟通风格和安全协议
5. 运行 HEARTBEAT: `holo-heartbeat-executor`

## 支持文件

| 文件 | 用途 |
|------|------|
| `ANTI-AMNESIA.md` | 独立可执行记忆系统实施规范 + 部署指南 |
| `CHANGELOG.md` | 版本变更记录 |
| `.sync/last-release` | 上游 b2b-sdr-agent-template 版本追踪 |
| `.sync/latest-report.md` | 最近同步报告 |
| `.sync/competitor-intel.md` | 皮带/工业设备外贸竞品情报日报 |
| `scripts/daily-sync.sh` | OpenClaw 上游自动同步脚本 |
| `deploy/UPGRADE.md` | OpenClaw 升级指南（含已知问题） |
| `product-kb/catalog.json` | 产品目录 JSON（8 品类 40+ 产品） |
| `product-kb/scripts/generate-pi.js` | 形式发票 (PI) 生成器 CLI |

## 数据路径

- **本地系统**: `~/.openclaw/skills/acquisition/`
- **Pipeline 数据**: `C:/Users/Administrator/WorkBuddy/`
- **邮件发送**: `/tmp/sender.mjs`
- **NAS 视频库**: `\\192.168.0.194`（未挂载）

## 版本

- **v4.0.0** (2026-04-27) — Workspace 全量重构，基于 b2b-sdr-agent-template v2026.4.24 同步
- **v3.0.0** (2026-04-17) — 目录结构重构，参考 b2b-sdr-agent-template
- **v2.6.0** (2026-04-14) — P0+P1+P2 全面升级
- [完整变更记录](CHANGELOG.md)
