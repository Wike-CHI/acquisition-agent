# 🐉 红龙获客系统 (HOLO Acquisition Agent)

> 温州红龙工业设备制造有限公司 — AI 智能获客技能集群

## 概述

红龙获客系统是一套基于 AI Agent 技能集群框架的自动化获客系统，涵盖客户发现、情报分析、开发信触达、Pipeline 管理等端到端流程。

## 架构

```
acquisition-agent/
├── skills/                          ← 技能集群
│   ├── global-customer-acquisition/ ← HOLO-AGENT 主入口 (v2.3.0)
│   ├── understand-honglong-acquisition/ ← 学习指南 (v3.1.0)
│   │
│   ├── acquisition-coordinator/     ← 编排层
│   ├── acquisition-evaluator/
│   ├── acquisition-init/
│   ├── acquisition-workflow/
│   │
│   ├── linkedin/                    ← 发现层
│   ├── facebook-acquisition/
│   ├── instagram-acquisition/
│   ├── teyi-customs/
│   ├── scrape/
│   ├── scrapling/
│   │
│   ├── company-research/            ← 情报层
│   ├── market-research/
│   ├── in-depth-research/
│   ├── autoresearch/
│   ├── customer-intelligence/
│   ├── deep-research/
│   │
│   ├── email-sender/                ← 触达层
│   ├── email-marketing/
│   ├── cold-email-generator/
│   ├── linkedin-writer/
│   ├── email-outreach-ops/
│   ├── delivery-queue/
│   │
│   ├── customer-deduplication/      ← 支持层
│   ├── sales-pipeline-tracker/
│   ├── crm/
│   ├── fumamx-crm/
│   ├── credential-manager/
│   │
│   ├── honglong-assistant/          ← 人格层
│   ├── honglong-products/           ← 产品层
│   │
│   └── ...（搜索/浏览器/文档/社媒等支撑技能）
│
├── scripts/
│   └── sync-to-github.ps1           ← 本地→GitHub 同步脚本
│
├── .gitignore
└── README.md
```

## 技能层级

| 层级 | 技能 | 说明 |
|------|------|------|
| **主入口** | global-customer-acquisition | HOLO-AGENT v2.3.0，统一调度入口 |
| **编排层** | coordinator / evaluator / workflow / init | 任务分解、质量评估、流程编排 |
| **发现层** | linkedin / facebook / instagram / 海关数据 / 爬虫 | 多渠道客户发现 |
| **情报层** | company-research / market-research / deep-research | 企业背调、市场分析 |
| **触达层** | email-sender / cold-email / linkedin-writer | 开发信生成与发送 |
| **支持层** | deduplication / pipeline / crm / 凭据管理 | 客户管理基础设施 |
| **人格层** | honglong-assistant | 红龙小助手身份配置 |
| **产品层** | honglong-products | 产品参数、图片、报价资料 |

## 核心铁律

1. 邮箱铁律：必须用决策人邮箱，禁用 info@
2. ICP 评分 ≥ 75 分才发邮件
3. 开发信评分 ≥ 9.0 分才发送
4. 禁止矿业客户
5. 无邮箱不继续

## 同步更新

本地更新技能后，运行同步脚本推送到 GitHub：

```powershell
.\scripts\sync-to-github.ps1
```

## 公司信息

- **公司**：温州红龙工业设备制造有限公司
- **地址**：瑞安市东山街道望新路188号3幢101室
- **核心产品**：风冷机、水冷机、分层机、导条机、木工设备
- **官网**：http://www.18816.cn

## License

Proprietary — 温州红龙工业设备制造有限公司内部使用
