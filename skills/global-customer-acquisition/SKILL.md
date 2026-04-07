---
name: HOLO-AGENT
version: 2.5.0
description: HOLO智能获客Agent - 客户发现、背调、开发信、报价单、社媒运营、Pipeline管理。触发：找客户、背调公司、发开发信、生成报价单、社媒运营、查看Pipeline、HOLO、honglong、WhatsApp触达、智能触达
triggers:
  - 找客户
  - 背调公司
  - 发开发信
  - 生成报价单
  - 社媒运营
  - 查看Pipeline
  - HOLO
  - honglong
  - 红龙
  - WhatsApp
  - 智能触达
  - 多渠道触达
---

# HOLO智能获客Agent v2.5.0

> 全能型获客+运营技能。业务员说一句话，AI完成全部操作。
>
> 详细文档：references/ARCHITECTURE.md | references/PIPELINE.md | references/SOCIAL-MEDIA.md | references/TROUBLESHOOT.md
>
> 路由配置：references/ROUTING-TABLE.yaml | SKILLS-ROUTER.md

---

## 业务员全能指令表

业务员只需要说这些，系统就知道做什么：

| 业务员说 | AI做什么 |
|---------|---------|
| "帮我找美国传送带客户" | 深度调研：美国 conveyor belt |
| "我想开发巴西市场" | 市场分析 + 批量获客 |
| "帮我背调这家公司" | 6维度ICP评分 + 报告 |
| "给这家公司发开发信" | 开发信生成v2.0（润色+评分≥9.0分）+ 发送 |
| "发WhatsApp消息" | WhatsApp风格消息生成 + 确认 + 发送 |
| "智能触达这个客户" | 自动判断：有号码→WhatsApp，有邮箱→邮件，双通道最优 |
| "多渠道触达TOP5客户" | 批量双通道（邮件+WhatsApp）触达 |
| "生成报价单" | .docx报价单 |
| "帮我发一篇Facebook" | 生成帖子 + 发布 |
| "Instagram发什么" | 内容建议 + Hashtag + 脚本 |
| "帮我运营LinkedIn账号" | 内容日历 + 文章 + 互动策略 |
| "查看Pipeline" | 客户状态报表 |
| "哪些客户要跟进" | 日历提醒 + 待跟进列表 |

---

## 系统全景图

```
┌─────────────────────────────────────────────────────────────┐
│  Skills Router（声明式路由）⭐ v2.5.0                       │
│  读ROUTING-TABLE.yaml → 意图匹配 → 技能选择 → 故障切换     │
│  支持8种意图 × 邮件/WhatsApp双通道                          │
├─────────────────────────────────────────────────────────────┤
│  7层上下文系统                                            │
│  IDENTITY → SOUL → AGENTS → USER → HEARTBEAT → MEMORY → TOOLS │
├─────────────────────────────────────────────────────────────┤
│  获客流程                                                  │
│  发现层 → 情报层 → 触达层 → 支持层 → 管理层              │
├─────────────────────────────────────────────────────────────┤
│  纯Markdown指令 · 零代码依赖 · 跨平台兼容                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3条铁律

1. **邮箱铁律**：必须用决策人邮箱，禁用info@
2. **评分铁律**：ICP评分≥75分才触达（邮件和WhatsApp通用）
3. **质量铁律**：开发信评分≥9.0分 / WhatsApp消息评分≥8.0分才发送

> 详细规则见：references/IRON-RULES.md

---

## 🔒 WhatsApp安全铁律

1. **用户确认**：每条WhatsApp消息发送前必须让用户确认
2. **禁止群发**：每条消息必须个性化
3. **频率控制**：同一联系人每天最多3条
4. **静默时段**：对方当地时间22:00-08:00不发送

> 详细规则见：references/IRON-RULES.md

---

## 🔒 联系方式验证铁律

### ⚠️ 禁止使用未经验证的单一来源信息

**绝对禁止**：
- ❌ 使用**超过6个月**的LinkedIn信息（职位可能变更）
- ❌ 使用**发布日期未知**的公网邮箱
- ❌ 仅凭单一来源（仅LinkedIn或仅网页搜索）就发送邮件

**必须验证**（三选一，缺一不可）：
1. ✅ **时效性检查**：信息发布时间必须是**6个月内**
2. ✅ **多源验证**：LinkedIn + 官网 + 特易（取最新的）
3. ✅ **决策人确认**：职位必须是Purchasing Manager/Procurement Director

### ✅ 联系方式优先级（从高到低）

| 优先级 | 来源 | 条件 |
|--------|------|------|
| **S级** | 官网"Contact Us"表单 | 当前有效 |
| **A级** | 特易详情页"联系方式" | 6个月内 |
| **B级** | LinkedIn决策人 | 1年内，标题清晰 |
| **C级** | 公司通用邮箱 | 需额外核实 |
| **❌ 禁用** | LinkedIn普通员工/公网邮箱 | 无时效验证 |

> 详细验证流程见：references/CONTACT-VERIFICATION.md

---

## Skills Router 核心路由表

> 完整声明式路由配置见：**references/ROUTING-TABLE.yaml**
> 路由使用说明见：**SKILLS-ROUTER.md**

### 8种意图 × 路由摘要

| 意图 | 关键词 | 海外首选 | 国内首选 |
|------|--------|----------|----------|
| 客户发现 | 找客户/获客 | teyi-customs (P5) | exa-search (P5) |
| 企业背调 | 背调/评估 | teyi-customs (P5) | company-research (P5) |
| 决策人搜索 | 决策人/LinkedIn | exa-search (P5) | exa-search (P5) |
| 邮件触达 | 发邮件/开发信 | cold-email-generator (P5) | email-sender (P5) |
| WhatsApp触达 | WhatsApp/wa消息 | whatsapp-outreach (P5) | whatsapp-outreach (P5) |
| 智能触达 | 智能触达/多渠道 | whatsapp-outreach (P5) | email-sender (P5) |
| 社媒运营 | Facebook/LinkedIn | ai-social-media-content (P5) | ai-social-media-content (P5) |
| 完整流程 | 全流程/端到端 | acquisition-coordinator (P5) | acquisition-coordinator (P5) |

### 路由执行方式

```
用户请求 → 匹配意图关键词 → 查ROUTING-TABLE.yaml → 选择技能 → 读取SKILL.md → 按步骤执行
```

**故障切换**：主技能不可用时，自动按 fallback 顺序尝试备选技能。

---

## 11步获客流程（简化）

```
Step 0: 智能路由 → 自动选渠道（邮件/WhatsApp/双通道）
Step 1: 客户发现 → 搜索潜在客户
Step 1.5: 联系方式获取 → 无邮箱+无WhatsApp不继续
Step 2: 客户查重 → 防止重复开发
Step 3: 企业背调 → ICP 6维度评分
Step 4: LinkedIn决策人 → Exa搜索
Step 5: 竞品分析 → 差异化话术
Step 6: 消息生成 → 邮件开发信v2.0（≥9.0分）/ WhatsApp消息（≥8.0分）
Step 6.5: 报价单 → .docx
Step 7: 消息发送 → 邮件队列 / WhatsApp / 双通道
Step 8: Pipeline更新 → .xlsx
Step 8.5: 跟进管理 → 日历提醒
Step 9: 日报生成
```

> 详细流程见：references/PIPELINE.md

---

## ICP评分体系（6维度×100分）

| 维度 | 权重 | 评分依据 |
|------|------|----------|
| 行业匹配度 | 20% | 传送带相关采购占比 |
| 采购能力 | 20% | 海关金额（S/A/B/C/D/E级）|
| 采购频率 | 20% | 交易次数+最新日期 |
| 客户类型 | 15% | 制造商=10/经销商=8/终端=5 |
| 决策周期 | 15% | 企业规模推断 |
| 决策人联系 | 10% | LinkedIn/官网联系方式 |

**客户等级**：A级≥75分（可触达，重点开发）| B级60-74分（观察储备）| C级45-59分（待培育）| D级<45分（暂不开发）

> 详细评分标准见：references/SCORING.md

---

## 开发信生成（v2.0 真正打磨流程）

**标准打磨流程**：
```python
开发信生成
  ↓
第1轮润色（humanize-ai-text 自动检测+修复）
  ↓
第1轮评分（满分10分）
  ↓
评分 < 9.0分？
  ├─ 是 → 第2轮润色 → 第2轮评分
  └─ 否 → 最终版本（≥9.0分）
```

**评分标准**（满分10分）：
- 个性化程度 2.0分
- 相关性 2.0分
- 简洁性 2.0分
- 语法质量 2.0分
- 去AI味 2.0分

> 详细评分标准见：references/EMAIL-SCORING.md

---

## 社媒运营快速指令

| 业务员说 | AI做什么 |
|---------|---------|
| "帮我发一条Facebook" | 生成产品展示帖/行业资讯帖/客户案例帖 |
| "Facebook发什么内容" | 根据当周节奏推荐内容类型 |
| "生成Facebook广告" | 线索广告模板 + 受众设置 |
| "分析Facebook数据" | 汇总触达/互动/粉丝数据 |

> 详细社媒运营见：references/SOCIAL-MEDIA.md

---

## 外部技能集成

本系统已集成**21个外部技能**，提供完整的Office文档生成、搜索、邮件、PDF处理、NAS访问等能力。

| 功能 | 调用技能 |
|------|----------|
| NAS存储访问 | `skill://nas-file-reader` |
| Office文档生成 | `skill://docx` / `skill://pptx` / `skill://xlsx` |
| 搜索与调研 | `skill://tavily-search` / `skill://brave-web-search` |
| 邮件与通信 | `skill://email-skill` |
| WhatsApp触达 | `skill://WhatsApp` → `wacli` CLI |
| PDF处理 | `skill://pdf` |

> 完整外部技能索引见：external-skills/INDEX.md

---

## 子技能位置

| 技能 | 位置 |
|------|------|
| 协调器 | `skill://acquisition-coordinator` |
| 评分器 | `skill://acquisition-evaluator` |
| 工作流 | `skill://acquisition-workflow` |
| WhatsApp触达 | `skill://whatsapp-outreach` |
| 产品库 | `skill://honglong-products` |
| 助手 | `skill://honglong-assistant` |

---

## 学习指南

让AI理解系统架构：`skill://understand-honglong-acquisition`

---

## 常见问题

### AI执行错误？

1. 检查技能调用是否正确：使用 `skill://` 协议
2. 查看排错指南：references/TROUBLESHOOT.md

### 需要详细文档？

| 文档 | 内容 |
|------|------|
| references/ARCHITECTURE.md | 完整架构、Skills Router、7层上下文 |
| references/PIPELINE.md | 11步流程详细、ICP评分、开发信打磨 |
| references/SOCIAL-MEDIA.md | Facebook/Instagram/LinkedIn运营策略 |
| references/TROUBLESHOOT.md | 常见错误清单、回退/重试 |
| references/ICP.md | 目标客户群体详细定义 |
| references/SCORING.md | 评分体系详细标准 |
| references/IRON-RULES.md | 所有铁律详细说明 |
| references/CONTACT-VERIFICATION.md | 联系方式验证详细流程 |

---

*版本：v2.5.0 | 更新时间：2026-04-06*
*变更：集成WhatsApp触达通道（whatsapp-outreach子技能），多渠道智能路由，delivery-queue支持WhatsApp模式*
