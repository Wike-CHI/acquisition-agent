# 🐉 红龙获客系统

> 温州红龙工业设备制造有限公司 — AI 智能 B2B 获客技能集群

**版本：** v3.0.0 · [CHANGELOG](CHANGELOG.md)

---

## 目录结构

```
~/.hermes/skills/acquisition/
├── skills/          82个技能（路由系统索引）
├── archive/         33个已归档技能
├── deploy/          部署脚本 + CLI工具链
├── workspace/       ← 本地路径，仓库中为根目录文件
│   AGENTS.md        AI SDR Pipeline（10阶段）
│   HEARTBEAT.md     自动巡检（13项）
│   MEMORY.md        持久化记忆
│   ROUTING-TABLE.yaml   技能路由（74条）
│   SKILLS-MANIFEST.yaml 技能分类目录
│   NEW-STRUCTURE.md     结构说明
├── examples/        行业场景（建目录，内容待填）
├── product-kb/       产品知识库（NAS挂载后填入）
├── docs/internal/    内部文档
└── local/           Windows特定工具（turix-win）

# 仓库中 workspace/ 文件直接在根目录
```

> **参考模板：** [iPythoning/b2b-sdr-agent-template](https://github.com/iPythoning/b2b-sdr-agent-template)

---

## 核心技能导航

### 入口
| 技能 | 说明 |
|------|------|
| `global-customer-acquisition` | HOLO-AGENT 主入口 |
| `acquisition-coordinator` | 任务编排器 |
| `acquisition-workflow` | 端到端流程定义 |
| `acquisition-init` | 系统初始化引导 |

### 客户发现
| 技能 | 说明 |
|------|------|
| `company-research` | 海外B2B企业背景调查 |
| `market-research` | 六维度市场研究 |
| `deep-research` | 深度多源调研 |
| `teyi-customs` | 特易海关数据 |
| `exa-web-search-free` | AI语义搜索（免费） |

### 触达
| 技能 | 说明 |
|------|------|
| `cold-email-generator` | 开发信生成 v2.0 |
| `email-sender` | 163邮箱发送（nodemailer） |
| `whatsapp-outreach` | WhatsApp批量触达 |
| `telegram-toolkit` | Telegram触达（独联体/俄罗斯） |
| `linkedin` | LinkedIn AI触达 |
| `delivery-queue` | 发送节奏控制 |

### 转化
| 技能 | 说明 |
|------|------|
| `smart-quote` | 智能报价（先背调后报价） |
| `quotation-generator` | PDF形式发票生成 |
| `holo-proposal-generator` | 数字提案包PDF |
| `follow-up-signal-monitor` | 跟进信号监控 |
| `inquiry-response` | 客户回复智能应答 |

### 情报
| 技能 | 说明 |
|------|------|
| `customer-intelligence` | 客户情报整合 |
| `honglong-products` | 产品知识库 |
| `graphify` | 知识图谱 |
| `sdr-humanizer` | 拟人化话术 |

### 运营
| 技能 | 说明 |
|------|------|
| `sales-pipeline-tracker` | Pipeline阶段追踪 |
| `email-inbox` | 邮件收件检测 |
| `calendar-skill` | 日历提醒 |
| `fumamx-crm` | 孚盟MX CRM |

---

## Pipeline 概览（10阶段）

```
线索捕获 → BANT认证 → CRM录入 → 调研丰富
    → 报价 → 谈判 → 汇报 → 培育/售后
    → 邮件序列 → 多渠道编排
```

详见 [AGENTS.md](AGENTS.md)

---

## 系统状态

| 模块 | 状态 | 备注 |
|------|------|------|
| 技能路由 | ✅ 运行中 | 74条索引 |
| Cron自动巡检 | ✅ 运行中 | 7个定时任务 |
| 邮件发送 | ✅ 运行中 | 环境变量注码 |
| WhatsApp | ✅ 可用 | wacli |
| Telegram | ⚠️ 待配置 | Bot Token未设置 |
| 孚盟CRM | ⚠️ 待登录 | 未连通 |
| NAS知识库 | ⚠️ 待挂载 | 192.168.0.194 |
| LinkedIn | ⚠️ 待配置 | Cookie未注入 |

---

## 市场进度

| 市场 | 阶段 | 数据 |
|------|------|------|
| 南美（巴西/智利/阿根廷）| 🟡 开发中 | 31家已发现，10家A级 |
| 中东 | 🔴 待开发 | — |
| 东南亚 | 🔴 待开发 | — |
| 独联体 | 🔴 待开发 | — |
| 非洲 | 🔴 待开发 | — |

---

## 快速部署

```bash
# 克隆
git clone https://github.com/Wike-CHI/acquisition-agent.git \
  ~/.hermes/skills/acquisition

# 同步到GitHub
pwsh deploy/scripts/sync-to-github.ps1

# 查看Pipeline手册
cat AGENTS.md
```

---

## 技术栈

**框架** Hermes Agent（OpenClaw）技能集群
**语言** Python + Node.js + PowerShell
**存储** SQLite/supermemory 向量库 + CSV/JSON
**通信** 163邮箱 · WhatsApp · Telegram · LinkedIn
**自动化** Cron（7个定时任务）

---

## 版本

- **v3.0.0** (2026-04-17) — 目录结构重构
- **v2.6.0** (2026-04-14) — P0+P1+P2全面升级
- [完整变更记录](CHANGELOG.md)
