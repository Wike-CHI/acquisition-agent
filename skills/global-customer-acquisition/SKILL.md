---
name: global-customer-acquisition
description: HOLO智能获客Agent核心入口 - 客户发现、背调、开发信、智能报价、社媒运营、Pipeline管理、市场拓展。触发：找客户、背调公司、发开发信、智能报价、社媒运营、查看Pipeline、HOLO、honglong、WhatsApp触达、开发市场、批量获客。
updated: 2026-04-14
---

# HOLO智能获客Agent v3.1.0

全能型获客+运营技能。业务员说一句话，AI完成全部操作。

## 核心搜索规则（MCP）

**必须使用 `mcporter call exa.*`，禁止使用内置 web_search 工具。**

首次配置：
```bash
mcporter config add exa "https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check"

# 验证
mcporter list  # 应显示 exa: 6+ tools online
```

常用命令：
```bash
# 决策人搜索（最常用）
mcporter call exa.people_search_exa query="procurement manager mining cement Brazil" numResults=8

# 通用搜索
mcporter call exa.web_search_exa query="conveyor belt distributor Germany" numResults=8

# 企业背调
mcporter call exa.company_research_exa companyName=Votorantim numResults=3

# 深度调研（复杂任务）
mcporter call exa.deep_researcher_start query="Brazil conveyor belt market size" && \
mcporter call exa.deep_researcher_check
```

> 📚 详细配置：`skill://exa-search`

## 业务员全能指令

| 业务员说 | AI做什么 |
|---------|---------|
| 帮我找美国传送带客户 | exa深度调研 → ICP评分 |
| 开发巴西市场 | 市场分析 + 葡语词簇三轮搜索 |
| 开发德国经销商 | 德语词簇搜索 + ICP评分 |
| 背调这家公司 | 6维度ICP评分报告 |
| 给这家公司发开发信 | 开发信生成v2.0（≥9.0分）→ 发送 |
| 发WhatsApp消息 | 个性化消息生成 + 确认 + 发送 |
| 智能触达这个客户 | 自动判断最优渠道（邮件/WhatsApp） |
| 批量触达TOP5客户 | 邮件+WhatsApp双通道批量触达 |
| 生成报价单 | .docx报价单（smart-quote驱动） |
| 给我沙特客户报三代风冷机 | 智能报价：国家+产品+客户类型自动计算 |
| 发一条Facebook | 生成多平台帖子 + 处理配图 |
| 查看Pipeline | 客户状态报表 |
| 哪些客户要跟进 | 日历提醒 + 待跟进列表 |

## 系统架构

```
Skills Router（声明式路由）→ 意图匹配 → 技能选择
  ├─ 客户发现  → teyi-customs / exa-search
  ├─ 企业背调  → teyi-customs / company-research
  ├─ 决策人    → exa.people_search_exa
  ├─ 邮件触达  → cold-email-generator → email-sender
  ├─ WhatsApp  → whatsapp-outreach
  ├─ 智能报价  → smart-quote
  └─ 社媒运营  → ai-social-media-content → holo-social-image
```

> 完整路由配置：`skill://acquisition-workflow/references/ROUTING-TABLE.yaml`

## 多语种搜索

非英语市场自动切换本地语言（德语/西班牙语/法语/葡语/阿拉伯语/印尼语/越南语/土耳其语），突破信息差。

> 完整词簇库：`skill://acquisition-workflow/references/MULTILANG-KEYWORDS.md`

## 质量门禁

| 通道 | 质量门槛 |
|------|---------|
| 开发信 | 评分≥9.0分 / 去AI味检测通过 |
| WhatsApp消息 | 评分≥8.0分 / 个性化（非群发） |
| 客户触达 | ICP评分≥75分 |
| 联系方式 | S/A/B三级验证，禁止单一来源 |

> 详细规则：`skill://acquisition-workflow/references/IRON-RULES.md`

## 参考文档

| 文档 | 内容 |
|------|------|
| `skill://acquisition-workflow/references/PIPELINE.md` | 完整12步获客流程 |
| `skill://acquisition-workflow/references/SCORING.md` | ICP评分体系 |
| `skill://acquisition-workflow/references/HOLO-ICP-PROFILE.md` | 目标客户画像 |
| `skill://acquisition-workflow/references/ROUTING-TABLE.yaml` | 技能路由配置 |
| `skill://acquisition-workflow/references/MULTILANG-KEYWORDS.md` | 多语种词簇库 |
| `skill://smart-quote` | 智能报价系统 |
| `skill://honglong-products` | 产品知识库 |
| `skill://holo-social-gen` | 社媒图片生成 |

---

_版本：v3.1.0 | 更新：2026-04-14_
_变更：删除250行冗余triggers；移除重复文档内容；瘦身为统一入口+意图路由层_
