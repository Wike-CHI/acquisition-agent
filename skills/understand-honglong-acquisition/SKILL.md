---
name: understand-honglong-acquisition
version: 3.3.0
description: 红龙获客系统的AI学习指南。加载时机：(1)理解系统架构 (2)引用技能集群 (3)使用获客命令 (4)排错时 (5)踩坑后学习 (6)优化改进时。完整功能使用 skill://HOLO-AGENT。本技能整合自我改进机制，支持三层记忆系统+5种学习信号+自动晋升降级。同步至HOLO-AGENT v2.4.0。
---

# 理解红龙获客系统 v3.2.0

> **核心价值**：让AI从实践中学习，越用越聪明
>
> 快速导航：架构→references/ARCHITECTURE.md | 流程→references/PIPELINE.md | 排错→references/TROUBLESHOOT.md | **学习信号→LEARNING-SIGNALS.md**
>
> **全能操作技能**：直接使用 `skill://HOLO-AGENT`，包含完整操作手册。

## 系统全景

```
Skills Router（意图识别+渠道选择+故障切换）
       ↓
发现层 → 情报层 → 触达层 → 支持层 → 管理层
       ↓
执行控制层（ECL）：轨迹追踪+循环检测+置信度+状态监控
```

## ⚠️ 8条铁律（最容易错）

| # | 铁律 | 核心要求 | 违反后果 |
|---|------|---------|---------|
| 1 | 邮箱铁律 | 必须用决策人邮箱，禁用info@ | 发错人，到达率<10% |
| 2 | 评分铁律 | ICP评分≥75分才发邮件 | 浪费时间在低质量客户 |
| 3 | 质量铁律 | 开发信评分≥9.0分才发送 | 回复率<1% |
| 4 | 联系方式验证 | 禁止未经验证的单一来源 | 发错人 |
| 5 | 无邮箱不继续 | 没有邮箱不能进开发信步骤 | 浪费时间 |
| 6 | 禁止矿业客户 | 15,885家验证0家矿业客户 | 产品不匹配 |
| 7 | 开发信必打磨 | 润色+评分流程不可跳过 | 低质量邮件 |
| 8 | skill://协议 | 引用技能必须用skill:// | 跨平台不兼容 |

> 详细铁律说明见 `references/IRON-RULES.md`（主技能内）

## Skills Router 路由表速查

> v2.4.0 变更：路由配置已迁移为声明式 YAML，见 `references/ROUTING-TABLE.yaml`

### 路由流程

```
用户请求 → 匹配意图关键词 → 查ROUTING-TABLE.yaml → 选择技能 → 读取SKILL.md → 按步骤执行
```

### 路由摘要

| 意图 | 海外首选 | 国内首选 | 故障备选 |
|------|----------|----------|----------|
| 客户发现 | teyi-customs (P5) | exa-search (P5) | exa-search |
| 企业背调 | teyi-customs (P5) | company-research (P5) | exa-search |
| 决策人搜索 | exa-search (P5) ⭐ | exa-search (P5) ⭐ | company-research |
| 邮件触达 | cold-email-generator (P5) | email-sender (P5) | delivery-queue |
| 社媒运营 | ai-social-media-content (P5) | 同左 | 按平台备选 |
| 完整流程 | acquisition-coordinator (P5) | 同左 | 无 |

> ⭐ **决策人搜索**：国内/海外都用 Exa，不走 LinkedIn MCP！

> 完整路由表（含故障切换）见主技能 `references/ROUTING-TABLE.yaml`

## Exa MCP 工具链（exa-search v2.0）⭐

> exa-search 已从付费 REST API 迁移为免费 MCP（via mcporter），8个工具全开，无需 API Key。

### 8个可用工具

| 工具 | 用途 | 获客场景 |
|------|------|----------|
| `web_search_exa` | 通用网页搜索 | 客户发现、行业调研 |
| `web_search_advanced_exa` | 高级过滤搜索（日期/域名/文本） | 精准搜索 |
| `company_research_exa` ⭐ | 企业情报（收入/员工/竞品/LinkedIn） | 企业背调 |
| `people_search_exa` ⭐ | 职业档案搜索 | 决策人定位 |
| `deep_search_exa` | 深度查询扩展 | 复杂调研 |
| `crawling_exa` | 抓取网页全文 | 搜索后深入读取 |
| `get_code_context_exa` | 代码/文档搜索 | 技术调研 |
| `deep_researcher_start/check` | AI深度调研（异步） | 深度研究 |

### 调用方式

```bash
# 通用搜索
cmd /c "mcporter call exa.web_search_exa query=""industrial belt manufacturer"" numResults:5"

# 企业情报 ⭐
cmd /c "mcporter call exa.company_research_exa companyName=""Flexco"" numResults:3"

# 人员搜索 ⭐
cmd /c "mcporter call exa.people_search_exa query=""procurement manager conveyor belt"" numResults:5"
```

**⚠️ PowerShell 注意**：必须用 `cmd /c` 包一层，否则引号转义出错。

### company_research_exa 返回情报示例

调用 `company_research_exa companyName="Flexco"` 返回：
- 行业分类 + 年收入（$64.3M）
- 员工数（390人）+ 增长趋势
- LinkedIn 粉丝数 + 官网
- 竞争对手列表
- 近期收购/动态
- 联系方式（邮箱/电话）

> 配置 URL：`https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,deep_search_exa,crawling_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check`

## 联系方式验证优先级 ⚠️

| 优先级 | 来源 | 条件 |
|--------|------|------|
| **S级** | 官网"Contact Us"表单 | 当前有效 |
| **A级** | 特易详情页"联系方式" | 6个月内 |
| **B级** | LinkedIn决策人 | 1年内，标题清晰 |
| **C级** | 公司通用邮箱 | 需额外核实 |
| **❌ 禁用** | LinkedIn普通员工/公网邮箱 | 无时效验证 |

> 详细验证流程见主技能 `references/CONTACT-VERIFICATION.md`

## 7层上下文

```
IDENTITY → SOUL → AGENTS → USER → HEARTBEAT → MEMORY → TOOLS
```

## ContextManager

解决AI"忘记任务目标"的问题：

```javascript
// 4层防护：压缩 → 分层加载 → 锚定(goal/target永不压缩) → 监控
// 上下文使用率：110% → 35%
// 任务成功率：50% → 95%
```

## 11步获客流程速查

```
Step 0: 智能路由 → 自动选渠道
Step 1: 客户发现 → 搜索潜在客户
Step 1.5: 联系方式获取 → 无邮箱不继续（铁律5）
Step 2: 客户查重 → 防止重复开发
Step 3: 企业背调 → ICP 6维度评分
Step 4: LinkedIn决策人 → Exa搜索（不是LinkedIn MCP！）
Step 5: 竞品分析 → 差异化话术
Step 6: 开发信生成 → v2.0打磨流程，≥9.0分通过（铁律7）
Step 6.5: 报价单 → .docx
Step 7: 邮件发送 → 分段队列模拟真人
Step 8: Pipeline更新 → .xlsx
Step 8.5: 跟进管理 → 日历提醒
Step 9: 日报生成
```

## ICP评分体系（6维度×100分）

| 维度 | 权重 | 评分依据 |
|------|------|----------|
| 行业匹配度 | 20% | 传送带相关采购占比 |
| 采购能力 | 20% | 海关金额（S/A/B/C/D/E级）|
| 采购频率 | 20% | 交易次数+最新日期 |
| 客户类型 | 15% | 制造商=10/经销商=8/终端=5 |
| 决策周期 | 15% | 企业规模推断 |
| 决策人联系 | 10% | LinkedIn/官网联系方式 |

**客户等级**（与 coordinator/coordinator 铁律对齐）：

| 等级 | 阈值 | 开发策略 |
|------|------|---------|
| **A级** | ≥75分 | 重点开发，优先发邮件 |
| **B级** | 50-74分 | 暂缓，跟进观察 |
| **C级** | 30-49分 | 暂不开发 |
| **D级** | <30分 | 排除 |

> ⚠️ **阈值来源**：铁律第2条（≥75分才发邮件）= A级门槛，两个标准已统一。

> 详细评分标准见主技能 `references/SCORING.md`

## 开发信生成（v2.0 打磨流程）

**标准打磨流程**：
```
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

## 自我改进机制 ⭐ v3.0核心

> 让AI从实践中学习，越用越聪明

### 三层记忆系统

| 层级 | 位置 | 大小限制 | 加载策略 |
|------|------|---------|----------|
| **HOT** | `~/self-improving/memory.md` | ≤100行 | 每次必加载 |
| **WARM** | `~/self-improving/projects/honglong-acquisition.md` | ≤200行 | 匹配时加载 |
| **COLD** | `~/self-improving/archive/` | 无限制 | 显式查询时 |

### 5种学习信号（自动触发）

| 信号 | 触发词示例 | 动作 |
|------|-----------|------|
| **修正** | "不对"、"应该"、"错了" | → `corrections.md` |
| **偏好** | "我喜欢"、"总是这样" | → `memory.md` (HOT) |
| **模式** | 重复3次相同指令 | → 待定晋升 |
| **失败** | 执行错误/回退 | → `PRACTICE-CASES.md` |
| **优化** | "可以更好"、"改进" | → 评估后存储 |

> 详细触发规则见 `LEARNING-SIGNALS.md`

### 自动晋升/降级

```
模式使用3次/7天 → 晋升到HOT (memory.md)
模式未用30天    → 降级到WARM (projects/)
模式未用90天    → 归档到COLD (archive/)
```

### 主动学习触发

**当AI遇到这些情况时，自动读取相应文件：**

| 场景 | 自动读取文件 | 目的 |
|------|------------|------|
| 执行前 | `PRACTICE-CASES.md` | 避免重复踩坑 |
| 失败后 | `TROUBLESHOOT.md` + `corrections.md` | 快速恢复 |
| 优化时 | `memory.md` (HOT) | 应用已学规则 |
| 未知情况 | `references/ARCHITECTURE.md` | 查找架构方案 |

---

## v2.4.0 新特性速查

### Exa MCP 工具链升级（3→8工具）⭐

从默认 3 个工具升级为 8 个全工具版（免费，无需 API Key）：
- 新增 `company_research_exa`：企业情报（收入/员工/竞品/LinkedIn/动态）
- 新增 `people_search_exa`：职业档案搜索（决策人定位）
- 新增 `deep_search_exa`：深度查询扩展
- 新增 `web_search_advanced_exa`：高级过滤（日期/域名/文本）
- 新增 `crawling_exa`：网页全文抓取
- 新增 `deep_researcher_start/check`：AI 深度调研

配置方式：
```bash
mcporter config remove exa
mcporter config add exa "https://mcp.exa.ai/mcp?tools=web_search_exa,...（全部8个）"
mcporter list exa  # 验证显示 8 tools
```

### YAML 声明式路由（v2.4.0）

路由表从 JS 代码迁移为 `references/ROUTING-TABLE.yaml`：
- intents：7种意图 × 关键词匹配
- routing：按意图+市场选择技能（含 priority 和 fallback）
- fallback_map：故障切换映射
- iron_rules：8条质量铁律
- skills_index：所有子技能索引

### ICP客户群体定义

基于15,885家客户数据验证：

| 客户类型 | 客户数 | 占比 | 获客策略 |
|---------|--------|------|---------|
| **PVC PU输送带分销商** | 2,451家 | 15.4% | 搜索"conveyor belt distributor" |
| **橡胶输送带分销商** | 427家 | 2.7% | 搜索"industrial belt supplier" |
| **皮带加工厂** | 276家 | 1.7% | 搜索"belt splicing services" |
| **工程公司/集成商** | 95家 | 0.6% | 搜索"conveyor system integrator" |

**⚠️ 避免矿业客户**：验证0家矿业客户，避免关键词"mining conveyor"

### 社媒运营矩阵

| 平台 | 内容类型 | 频率 | 技能 |
|------|---------|------|------|
| Facebook | 产品帖/行业资讯/案例 | 3篇/周 | `ai-social-media-content` |
| Instagram | Reels/Stories/图文 | 5篇/周 | `ai-social-media-content` |
| LinkedIn | SEO文章/互动帖 | 2篇/周 | `linkedin-writer` |

### WhatsApp 触达规范 ⭐ v2.5.0 新增

> WhatsApp 是红龙最重要的海外触达渠道，Drip Campaign 中 D3 节点必须使用。

**内容规范**：
- 字数：≤ 80 词（比邮件更短）
- 语气：口语化、自然，不使用商务套话
- AI 检测：必须通过 humanize-ai-text 去除 AI 味（密度 < 2%）
- CTA：明确但软性，如"方便的话可以聊聊？"而非"必须回复"

**触达时机（Drip Campaign）**：
| 轮次 | 时机 | 渠道 | 内容重点 |
|------|------|------|---------|
| D0 | 首次联系 | 邮件 | 开发信 + 产品目录链接 |
| D3 | 第3天 | WhatsApp | 简短跟进 + WhatsApp 直接联系 |
| D5 | 第5天 | 邮件 | 价值主张 + 成功案例 |
| D14 | 第14天 | 邮件 + WhatsApp | 最终跟进 + 免费样品 |

**WhatsApp 签名**：
```
{姓名}
HONGLONG Industrial Equipment
📞 +86 {手机号}
🔗 wa.me/{whatsapp_link}
```

---

## 关键技能索引

| 技能 | 位置 | 功能 |
|------|------|------|
| HOLO-AGENT | `skill://HOLO-AGENT` | 全能获客操作（主入口）|
| 协调器 | `skill://acquisition-coordinator` | 获客任务协调器 |
| 评分器 | `skill://acquisition-evaluator` | 验收评估 |
| 工作流 | `skill://acquisition-workflow` | 端到端流程定义 |
| 产品库 | `skill://honglong-products` | 红龙产品知识 |
| 助手 | `skill://honglong-assistant` | 红龙小助手人格 |
| 开发信 | `skill://cold-email-generator` | 开发信生成v2.0 |
| 社媒内容 | `skill://ai-social-media-content` | AI社媒内容生成 |
| Facebook获客 | `skill://facebook-acquisition` | Facebook客户搜索 |

---

## 文件索引

| 文件 | 用途 |
|------|------|
| **主技能 references/** | |
| `references/ARCHITECTURE.md` | Skills Router完整表/ECL/ContextManager/7层上下文/自进化/子技能集群 |
| `references/PIPELINE.md` | 11步流程/ICP评分/开发信打磨/回退方案/海关变量 |
| `references/SOCIAL-MEDIA.md` | Facebook/Instagram/LinkedIn运营策略/内容模板/发布频率 |
| `references/TROUBLESHOOT.md` | 常见错误清单/回退/重试/社媒常见错误 |
| `references/ICP.md` | 目标客户群体详细定义 |
| `references/SCORING.md` | ICP评分体系详细标准 |
| `references/IRON-RULES.md` | 8条铁律详细说明 |
| `references/CONTACT-VERIFICATION.md` | 联系方式验证详细流程 |
| `references/EMAIL-SCORING.md` | 开发信评分标准 |
| **本技能** | |
| `LEARNING-SIGNALS.md` ⭐ | 5种学习信号详细触发规则/记录格式/晋升标准 |

**完整记忆文件**（使用 `$env:USERPROFILE` 确保跨机器兼容）：

```powershell
$base = "$env:USERPROFILE\self-improving"
# HOT: $base\memory.md
# WARM: $base\projects\honglong-acquisition.md
# COLD: $base\archive\
```

> ⚠️ **禁止硬编码**：所有路径必须使用 `$env:USERPROFILE` 变量，禁止写 `C:\Users\...` 等绝对路径。

---

*版本：v3.2.0 | 同步至 HOLO-AGENT v2.4.0 | 更新时间：2026-04-03*
