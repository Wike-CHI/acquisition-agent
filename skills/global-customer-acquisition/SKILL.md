---
name: global-customer-acquisition
version: "1.0.0"
description: HOLO智能获客Agent核心入口 - 客户发现、背调、开发信、智能报价、社媒运营、Pipeline管理、市场拓展。
triggers:
  - 找客户
  - 背调公司
  - 发开发信
  - 智能报价
  - 社媒运营
  - 查看Pipeline
  - 开发市场
  - 批量获客
  - global-customer-acquisition
updated: 2026-04-14
---
# HOLO智能获客Agent v3.1.0

> **⚠️ 重要：读取配置优先**
> 执行本技能前，必须先读取以下配置文件：
>
> - `../../config/company-profile.json` — 公司信息（联系方式/竞品/品牌）
> - `../../config/infrastructure.json` — NAS 路径

---

## Skill Graph 导航

这是获客系统的 **总入口**。收到任务后，先扫描 [[_index.md|技能图谱主索引]] 理解全局，然后根据任务类型进入对应领域：

- 找客户/调研 → [[_index-discovery|客户发现领域]] → 典型入口：[[company-research]]、[[teyi-customs]]
- 写开发信/触达 → [[_index-outreach|多渠道触达领域]] → 典型入口：[[cold-email-generator]]、[[whatsapp-outreach]]
- 报价/Pipeline → [[_index-conversion|报价与转化领域]] → 典型入口：[[smart-quote]]、[[sales-pipeline-tracker]]
- 查产品知识 → [[_index-intelligence|情报与知识领域]] → [[honglong-products]]
- 系统自动化 → [[_index-operations|运营自动化领域]] → [[holo-heartbeat-executor]]
- 维护技能库 → [[_index-meta|系统元技能领域]] → [[skill-creator]]

复杂多步任务不应自行处理，应委托给 [[acquisition-coordinator]] 进行编排分解。

---

全能型获客+运营技能。业务员说一句话，AI完成全部操作。

## 业务员全能指令

| 业务员说                 | AI做什么                             |
| ------------------------ | ------------------------------------ |
| 帮我找美国传送带客户     | exa深度调研 → ICP评分               |
| 开发巴西市场             | 市场分析 + 葡语词簇三轮搜索          |
| 开发德国经销商           | 德语词簇搜索 + ICP评分               |
| 背调这家公司             | 6维度ICP评分报告                     |
| 给这家公司发开发信       | 开发信生成v2.0（≥9.0分）→ 发送     |
| 发WhatsApp消息           | 个性化消息生成 + 确认 + 发送         |
| 智能触达这个客户         | 自动判断最优渠道（邮件/WhatsApp）    |
| 批量触达TOP5客户         | 邮件+WhatsApp双通道批量触达          |
| 生成报价单               | .docx报价单（smart-quote驱动）       |
| 给我沙特客户报三代风冷机 | 智能报价：国家+产品+客户类型自动计算 |
| 发一条Facebook           | 生成多平台帖子 + 处理配图            |
| 查看Pipeline             | 客户状态报表                         |
| 哪些客户要跟进           | 日历提醒 + 待跟进列表                |

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

| 通道         | 质量门槛                       |
| ------------ | ------------------------------ |
| 开发信       | 评分≥9.0分 / 去AI味检测通过   |
| WhatsApp消息 | 评分≥8.0分 / 个性化（非群发） |
| 客户触达     | ICP评分≥75分                  |
| 联系方式     | S/A/B三级验证，禁止单一来源    |

> 详细规则：`skill://acquisition-workflow/references/IRON-RULES.md`

## 参考文档

| 文档                                                      | 内容                                                   |
| --------------------------------------------------------- | ------------------------------------------------------ |
| `HEARTBEAT.md`                                          | Pipeline 自动巡检（13项心跳任务），Cron驱动            |
| `MEMORY.md`                                             | 4层防遗忘记忆协议，对话全程记忆管理                    |
| `smart-quote`                                           | 智能报价系统（含报价锁定机制 + 授权矩阵）              |
| `acquisition-workflow/references/PIPELINE.md`           | 完整12步获客流程                                       |
| `acquisition-workflow/references/SCORING.md`            | ICP评分体系                                            |
| `acquisition-workflow/references/HOLO-ICP-PROFILE.md`   | 目标客户画像                                           |
| `acquisition-workflow/references/ROUTING-TABLE.yaml`    | 技能路由配置                                           |
| `acquisition-workflow/references/MULTILANG-KEYWORDS.md` | 多语种词簇库                                           |
| `skill://honglong-products`                             | 产品知识库                                             |
| `skill://holo-social-gen`                               | 社媒图片生成                                           |
| `全球大客户战略地图.md`                                 | 全球 9 大区域战略地图、11 家竞品情报、区域优先级 P0-P3 |
| `competitor-intel.md`                                   | 竞品应对话术库（Flexco/Almex/ContiTech 等）            |

---

_版本：v3.1.0 | 更新：2026-04-14_
_变更：删除250行冗余triggers；移除重复文档内容；瘦身为统一入口+意图路由层_
