# 🐉 红龙获客系统

> 温州红龙工业设备制造有限公司 — AI 智能 B2B 获客技能集群

**版本：** v4.0.0 · [CHANGELOG](CHANGELOG.md)

---

## 目录结构

```
acquisition-agent/
├── skills/              84个活跃技能
├── archive/             33个已归档技能
├── workspace/           工作空间模板
│   ├── AGENTS.template.md       AI SDR Pipeline（10阶段）
│   ├── HEARTBEAT.template.md    自动巡检（13项）
│   ├── IDENTITY.template.md     公司身份
│   ├── MEMORY.template.md       持久化记忆
│   ├── SOUL.template.md         AI 灵魂/人格
│   ├── USER.template.md         用户画像
│   ├── TOOLS.template.md        工具配置
│   ├── ROUTING-TABLE.yaml       技能路由（74条）
│   ├── SKILLS-MANIFEST.yaml     技能分类目录
│   └── operator-config.template.md  操作员配置
├── product-kb/          产品知识库
├── docs/                内部文档
├── examples/            行业场景
├── local/               Windows特定工具
└── deploy/              部署脚本

# 注意：skills/config/ 是内部配置目录，不是技能
```

---

## 安装方式

### 方式一：集成到 HOLO Agent（推荐）

acquisition-agent 作为 HOLO Agent 的内置技能库，通过以下方式集成：

1. **打包阶段**：`holo-agent/scripts/bundle-acquisition-skills.mjs`
   - 从 GitHub 拉取 `skills/`、`workspace/`、`product-kb/`
   - 打包到 `holo-agent/build/acquisition-skills/`
   - electron-builder 打包时放入 `resources/`

2. **运行时阶段**：`holo-agent/electron/utils/acquisition-skills.ts`
   - 启动时同步技能到 `~/.openclaw/skills/market/`
   - 基于 SHA-256 hash 增量同步
   - workspace 模板同步到 `~/.openclaw/workspace/`

```
holo-agent/build/acquisition-skills/
    ├── skills/           → ~/.openclaw/skills/market/
    ├── workspace-templates/ → ~/.openclaw/workspace/
    └── product-kb/       → ~/.openclaw/product-kb/
```

### 方式二：独立部署

```bash
# 克隆到本地
git clone https://github.com/Wike-CHI/acquisition-agent.git \
  ~/acquisition-agent

# 安装技能（独立使用）
cd ~/acquisition-agent
./deploy/scripts/install-skills.sh
```

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

详见 [AGENTS.md](workspace/AGENTS.template.md)

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
| NAS知识库 | ⚠️ 待挂载 | 192.168.0.98 |
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

## 技术栈

**框架** OpenClaw Agent 技能集群
**语言** Python + Node.js + PowerShell
**存储** SQLite/supermemory 向量库 + CSV/JSON
**通信** 163邮箱 · WhatsApp · Telegram · LinkedIn
**自动化** Cron（7个定时任务）

---

## 版本

- **v4.0.0** (2026-04-22) — 重构为 HOLO Agent 内置技能库
- **v3.0.0** (2026-04-17) — 目录结构重构
- **v2.6.0** (2026-04-14) — P0+P1+P2全面升级
- [完整变更记录](CHANGELOG.md)
