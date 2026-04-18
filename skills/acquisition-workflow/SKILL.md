---
name: acquisition-workflow
version: 2.1.0
description: 获客工作流技能。定义端到端获客流程，每个环节的技能选择、质量检查点、输出格式。当需要执行完整获客流程或了解流程规范时使用。
always: false
triggers:
  - 获客流程
  - 客户开发流程
  - 销售流程
  - 工作流
  - workflow
  - 全流程
  - 端到端
  - 完整流程
  - 执行流程
  - 操作流程
  - Phase 1
  - Phase 2
  - Phase 3
  - Phase 4
  - 第一阶段
  - 第二阶段
  - 第三阶段
  - 第四阶段
  - 搜索阶段
  - 背调阶段
  - 触达阶段
  - 筛选阶段
  - 流程规范
  - 流程标准
  - 质量检查
  - 质量门控
  - 输出格式
  - 质量标准
  - 执行标准
  - 操作规范
  
  # ========== 阶段详情 ==========
  - 客户搜索
  - 联系方式验证
  - 邮箱验证
  - ICP评分
  - 客户筛选
  - 高价值客户
  - 触达策略
  - 跟进节奏
  - Drip Campaign
  - 四轮跟进
  - 开发信打磨
  
  # ========== 技能调用 ==========
  - 技能选择
  - 调用技能
  - 使用技能
  - 技能调度
  - 路由配置
  - 故障切换
  
  # ========== 协调器相关 ==========
  - acquisition-coordinator
  - 编排
  - 协调
  - 调度
---

# 获客工作流技能 v2.1

---

## ⚠️⚠️⚠️ 强制搜索规则 ⚠️⚠️⚠️

**❌ 禁止使用：内置 web_search 工具**
**✅ 必须使用：mcporter call exa.xxx（MCP）**

如果AI不知道如何使用MCP，参考：
```bash
# 第一步：配置MCP
mcporter config add exa "https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,deep_search_exa,crawling_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check"

# 第二步：验证
mcporter list  # 应显示 exa: 8 tools online

# 第三步：执行搜索（参数必须加引号！）
mcporter call exa.people_search_exa query="procurement manager mining cement" numResults=8
mcporter call exa.company_research_exa companyName=Votorantim numResults=3

# ⚠️ PowerShell必须用cmd/c
cmd /c "mcporter call exa.people_search_exa query=procurement manager numResults=5"
```

---

端到端获客流程**规范定义**。定义每个阶段做什么、调用什么技能、检查什么质量。

> **角色定位**：本技能是流程规范（Blueprint），定义"做什么"。
> **执行引擎**：`acquisition-coordinator` 负责实际调度执行（"怎么做"）。
> **关系**：coordinator 读取本规范 → 选择子技能 → 调度执行 → 质量门控。

> 🔒 跨平台兼容：纯 Markdown 流程规范，任何 AI Agent 均可执行

---

## 调用时机

- 用户请求完整的客户开发流程
- 需要了解某个阶段应该使用什么技能、执行什么质量检查
- acquisition-coordinator 编排复杂任务时参考此流程
- 新 Agent 学习获客系统端到端流程

---

## 输入要求

| 参数 | 必需 | 说明 |
|------|------|------|
| 目标市场 | ✅ | 国内/海外 |
| 行业关键词 | ✅ | 搜索用关键词 |
| 目标数量 | ❌ | 期望客户数（默认10） |

---

## 执行步骤

### 流程总览

```
Phase 1: 搜索 (10分钟)
    │
    ▼
Phase 1.5: 联系方式验证（铁律：无邮箱不继续）
    │
    ▼
Phase 2: 背调 (30分钟)
    │
    ▼
Phase 3: 筛选（铁律：ICP≥75分）
    │
    ▼
Phase 4: 触达（铁律：开发信≥9.0分）
```

### Phase 1: 搜索

**目标**: 发现15-30家潜在客户

**技能选择**:
| 场景 | 调用技能 |
|------|----------|
| 海关数据搜索 | teyi-customs |
| 语义搜索 | exa-search |
| Facebook挖掘 | facebook-acquisition |
| LinkedIn搜索 | linkedin |
| Instagram挖掘 | instagram-acquisition |
| 网页爬取 | scrapling |

> 详细路由配置见：`skill://acquisition-workflow/references/ROUTING-TABLE.yaml`

**质量检查点**:
- [ ] 搜索关键词是否准确？
- [ ] 结果是否属于目标行业？
- [ ] 每个客户是否有基本信息（名称/网站/行业）？

**输出**: 公司列表（每条包含公司名、网站、行业、国家）

### Phase 1.5: 联系方式获取与验证

**铁律：无邮箱不继续！**

**获取方式**（按优先级）:

| 方法 | 适用场景 | 时效性验证 |
|------|----------|-----------|
| 官网Contact表单 | 所有客户（首选） | ✅ 当前有效 |
| 特易详情页「联系方式」 | 特易搜索的客户 | ✅ 查看6个月内 |
| 易搜邮（EaseSearch） | 需要决策人邮箱 | ✅ 数据库最新 |
| LinkedIn决策人 | LinkedIn搜索的客户 | ⚠️ 必须≤12个月 |

**时效性验证**:

| 信息来源 | 时效要求 |
|---------|---------|
| LinkedIn Profile | ≤ 12个月 |
| 特易详情页 | ≤ 6个月 |
| 官网Contact页面 | 当前有效 |
| exa-search-free 结果 | ❌ 仅作线索，需二次验证 |

**多源验证流程**:
```
步骤1: 搜索找到线索
步骤2: 访问官网Contact页面（验证公司存在）
步骤3: 使用特易详情页（验证邮箱有效）
步骤4: 易搜邮补充（如需要决策人邮箱）
步骤5: 决定使用/放弃（≥2个来源验证 → 使用）
```

**联系方式质量标准**:
- ✅ S级：官网"Contact Us" + 特易验证
- ✅ A级：特易详情页（6个月内）+ 易搜邮验证
- ✅ B级：LinkedIn决策人（1年内）+ 官网二次验证
- ⚠️ C级：公司通用邮箱 info@/sales@（需电话核实）
- ❌ 禁用：超6个月LinkedIn/无时效验证exa结果/单源邮箱

**输出**: 带 email 字段的公司列表

### Phase 2: 背调

**目标**: 评估客户质量

**技能选择**:
| 场景 | 调用技能 |
|------|----------|
| 快速背调 | company-research |
| 深度背调 | in-depth-research |
| 市场分析 | market-research |
| 竞品识别 | honglong-products |

**质量检查点**:
- [ ] 评分是否合理？
- [ ] 是否识别出竞争对手？
- [ ] 关键信息是否完整？

**输出**: ICP评分报告（A/B/C/D级）

### Phase 3: 筛选

**目标**: 确定高价值客户

**筛选条件**:
- ICP评分 ≥ 75分
- 非竞争对手
- 有已验证联系方式
- 非矿业客户

**输出**: 高价值客户列表（2-5家）

### Phase 4: 触达

**目标**: 发送带产品资料的开发信

**技能选择**:
| 场景 | 调用技能 |
|------|----------|
| NAS挂载获取产品资料 | nas-file-reader |
| 产品匹配 | honglong-products |
| 开发信生成（v2.0打磨流程） | cold-email-generator |
| 邮件发送 | email-sender |
| 发送节奏控制 | delivery-queue |

**开发信签名规范**:
- 使用业务员本人联系方式（非公司公共邮箱）
- 包含：姓名、公司名、手机/WhatsApp、工作邮箱、官网、地址

**开发信打磨流程（v2.0）**:
```
生成 → 第1轮润色（humanize-ai-text）
     → 第1轮评分
     → 评分 < 9.0？→ 第2轮润色 → 第2轮评分
     → ≥ 9.0分 → 最终版本
```

**四轮跟进节奏（Drip Campaign）**:
| 轮次 | 时间 | 内容 |
|------|------|------|
| D0 | 发送当天 | 首封开发信 + 产品介绍 |
| D3 | 第3天 | LinkedIn连接请求 + 简短留言 |
| D5 | 第5天 | 跟进邮件：强调价值主张 + 案例 |
| D14 | 第14天 | 最终跟进：提供Free Sample/Demo |

**质量检查点**:
- [ ] 签名使用本人联系方式？
- [ ] 开发信评分 ≥ 9.0分？
- [ ] 邮箱已配置？
- [ ] 发送成功？

**输出**: 发送记录 + 四轮跟进计划 + 产品资料链接

---

## 输出格式

每个 Phase 完成后输出标准格式：

```markdown
## Phase N: [阶段名] 完成

**统计**: X 家客户处理，Y 家通过
**质量**: 通过率 Z%
**耗时**: [时间]

### 结果
[具体内容]

### 质量检查
- [x] 检查项1
- [ ] 检查项2（未通过）
```

---

## 质量门控

| 阶段 | 门控条件 | 不通过处理 |
|------|----------|-----------|
| Phase 1.5 | 必须有已验证邮箱 | 跳过该客户 |
| Phase 2 | ICP评分需有依据 | 重新背调 |
| Phase 3 | ICP ≥ 75分 | 标记暂缓 |
| Phase 4 | 开发信 ≥ 9.0分 | 重新润色 |

---

## 后续技能

| 完成后场景 | 可调用技能 |
|-----------|-----------|
| 生成报价单 | honglong-products |
| Pipeline更新 | crm |
| 质量验收 | acquisition-evaluator |
| 日历提醒 | calendar-skill |
| 社媒运营 | ai-social-media-content |
| **操作日志埋点** | holo-activity-log |
| **Pipeline自动巡检** | HEARTBEAT.md（13项心跳任务）|
| **客户记忆管理** | MEMORY.md（4层防遗忘协议）|

---

## 配套文档

本流程配合以下文档使用：

| 文档 | 用途 |
|------|------|
| `HEARTBEAT.md` | Pipeline 自动巡检（13项心跳任务），每次心跳自动执行 |
| `MEMORY.md` | 4层防遗忘记忆协议，对话全程记忆管理 |
| `AGENTS.md` | 10阶段Pipeline详细动作文档，所有操作人员可查 |
| `smart-quote` | 智能报价系统（含报价锁定机制 + 授权矩阵）|
| `cold-email-generator` | 开发信（含 Email Sequence 4步序列化跟进）|
| `telegram-toolkit` | Telegram-first市场支持（俄罗斯/伊朗/独联体）|
| `honglong-assistant` | 人格层（含反verbosity规则：消息必须短）|
| `acquisition-coordinator` | 实际执行引擎，读取本流程规范后调度子技能 |

---

## 操作日志埋点规范

> **重要**：每个Phase完成后应调用 `holo-activity-log` 记录操作

### 埋点时机

| Phase | 埋点时机 | action_type | 必填字段 |
|-------|---------|-------------|---------|
| Phase 1 | 搜索完成后 | `search` | result, score |
| Phase 1.5 | 邮箱验证后 | `email` | customer, result |
| Phase 2 | 背调完成后 | `research` | customer, result, score |
| Phase 3 | 筛选完成后 | `icp_score` | result, score |
| Phase 4 | 开发信生成后 | `email_gen` | customer, result, score |
| Phase 4 | 邮件发送后 | `email_send` | customer, result |

### 埋点示例

```
用户：帮我搜索10家非洲矿业客户
AI：
  1. 调用 exa-search skill 搜索客户
  2. ✅ 找到12家潜在客户
  3. 📝 调用 holo-activity-log 记录日志
  4. 返回客户列表
```

### 埋点调用方式

```yaml
# 在流程末尾添加
- skill: holo-activity-log
  params:
    skill_name: exa-search
    action_type: search
    customer: 非洲矿业
    result: success
    score: 12
    notes: 找到12家潜在客户，3家高价值
```

### 日志存储位置

- **NAS路径**：`\\192.168.0.194\AI数据\activity\`
- **文件格式**：`YYYY-MM-DD.csv`（每天一个文件）
- **设备标识**：`用户名@IP`（自动获取）

---

## CRM数据源说明（2026-04-16）

> ⚠️ 本地无CRM数据库。CRM为web-based fumamx系统（`skill://fumamx-crm`）。
> **邮件序列追踪使用文件方式**，非数据库查询。

### 邮件序列追踪路径（HEARTBEAT Item 7专用）
```
/tmp/us_outreach_log.md        # 主发送记录（Markdown表格）
/tmp/email_*.html              # 各客户邮件HTML正文
/tmp/email_followup_*.html    # 跟进邮件HTML正文
```

### 字段约定（us_outreach_log.md）
| 字段 | 说明 |
|------|------|
| `状态` | `SENT` / `REPLIED` / `BOUNCED` / `SPAM` / `NURTURE` |
| `MessageID` | 邮件发送ID |
| `首封日期` | 推断自文件创建日期 |
| `Day3发送日` | 实际发送日期（文件mtime） |

### 判断序列状态
- **Day 3 无回复**：当前日期 > 首封+3天 且 状态=SENT 且 无 `email_followup_1.html` mtime在期限内
- **Day 7 无回复**：当前日期 > 首封+7天 且 状态=SENT
- **Day 14 无回复**：当前日期 > 首封+14天 且 状态=SENT
- **有回复**：状态列含 `REPLIED`
- **培育**：状态列含 `NURTURE`

---

## 快速命令

```
帮我搜索 [数量] 个 [地区] 的 [行业] 客户
背调这些公司：[公司列表]
筛选高价值客户，标准：评分≥75分
给这些客户发开发信: [公司列表]
```

---

*版本: 2.1.1 | 更新时间: 2026-04-16*
*变更: 增加CRM数据源说明（邮件序列追踪文件路径+判断逻辑）*
