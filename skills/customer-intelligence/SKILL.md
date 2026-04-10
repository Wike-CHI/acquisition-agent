---
name: customer-intelligence
version: 2.0.0
description: 客户情报整合技能。整合市场调研、客户背调、竞争对手分析。支持动态ICP评分。当用户需要深入了解特定市场、公司或竞争对手时使用。
always: false
triggers:
  - 市场调研
  - 客户背调
  - 竞争对手分析
  - 情报报告
  - 行业分析
  - ICP评分
  - 客户评分
---

# 客户情报整合技能

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
mcporter call exa.crawling_exa urls=["https://example.com"]

# ⚠️ PowerShell必须用cmd/c
cmd /c "mcporter call exa.people_search_exa query=procurement manager numResults=5"
```

---

整合多个调研技能，提供一站式客户情报服务。

## 核心功能
- 市场调研
- 客户背调
- 竞争对手分析
- **ICP 评分**（引用统一标准）
- 客户报告生成
- 数据整合
- 洞察提炼

---

## ICP 评分（引用统一标准）

> **权威标准**：ICP 评分使用 `skill://acquisition-workflow/references/ICP-STANDARDS.md` 定义的 6 维度 × 100 分体系。
>
> 本技能不再独立定义评分维度，所有评分计算和阈值判断均以上述文件为准。

### 快速参考

| 等级 | 分数 | 策略 |
|------|------|------|
| A 级 | ≥75 分 | 24h 内首次联系，3 天跟进 |
| B 级 | 50-74 分 | 48h 内首次联系，5 天跟进 |
| C 级 | 30-49 分 | 存入培育池，2 周联系 |
| D 级 | <30 分 | 暂不开发 |

### 动态调整规则

ICP 分数根据客户互动自动调整（每日上限 ±5）：

| 客户行为 | 分数变化 | 原因 |
|----------|----------|------|
| 快速回复（<1h） | **+1** | 高意向信号 |
| 主动询价 | **+2** | 购买意愿强 |
| 提及竞争对手 | **+2** | 正在比较，机会窗口 |
| 发送公司资料 | **+1** | 信任建立 |
| 询问 MOQ/交期 | **+1** | 采购流程推进 |
| 从邮件转到 WhatsApp | **+1** | 渠道升级 |
| 7 天无回复 | **-1** | 意向降低 |
| 要求移出名单 | **-3** | 明确拒绝 |
| 标记为垃圾 | **-5** | 无效线索 |
| 邮件退信 | **-2** | 联系方式无效 |

## 使用场景
```
用户: 我需要了解德国工业皮带市场
→ 市场调研 (市场分析)
→ 客户背调 (特定公司)
→ 竞争对手分析
→ 生成综合报告

用户: 背调这5家公司
→ 客户背调 (批量)
→ 生成背调报告

用户: 分析竞争对手
→ 竞争对手分析
→ 生成竞争报告
```

## 技能组合

| 调用技能 | 用途 | 场景 |
|----------|------|------|
| market-research | 市场调研 | TAM/SAM/SOM分析 |
| company-research | 企业背调 | 深度企业信息 |
| in-depth-research | 深度研究 | 复杂分析任务 |
| autoresearch | 自动研究 | 快速信息收集 |
| honglong-products | 产品知识 | 竞品对比 |

## 输出格式
```markdown
## 客户情报报告

### 市场概况
- 市场规模: $XX亿
- 增长率: XX%
- 主要玩家: [列表]

### 目标客户
- 客户画像
- 需求分析
- 痛点识别
- 购买行为

### 竞争格局
- 主要竞争对手
- 市场份额
- 竞争策略
- 差异化定位

### 市场机会
- 未满足需求
- 新兴趋势
- 进入壁垒

### 建议
- 市场进入策略
- 差异化定位
- 目标客户优先级
```

---
*依赖技能*: market-research, company-research, in-depth-research, autoresearch
