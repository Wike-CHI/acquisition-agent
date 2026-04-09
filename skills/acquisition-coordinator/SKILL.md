---
name: acquisition-coordinator
version: 2.0.0
description: 获客任务协调器。负责拆解复杂获客任务、读取子技能SKILL.md并按步骤执行、整合结果。当用户请求：(1) 完整获客流程 (2) 批量背调 (3) 并行搜索 (4) 多步骤获客任务 时使用此技能。
always: false
triggers:
  - 批量获客
  - 完整流程
  - 并行搜索
  - 批量背调
  - 多步骤任务
  - 协调
  - coordinator
---

# 获客任务协调器 v2.1

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
mcporter call exa.web_search_exa query="conveyor belt manufacturer Brazil" numResults=8

# ⚠️ PowerShell必须用cmd/c
cmd /c "mcporter call exa.people_search_exa query=procurement manager numResults=5"
```

---

多步骤获客任务的**执行引擎**，负责**任务分析、子技能调度、质量门控、结果整合**。

> **角色定位**：本技能是执行引擎（Engine），负责调度和执行。
> 流程规范定义（Blueprint）见 `acquisition-workflow/SKILL.md`。
> 两者关系：workflow 定义"做什么"，coordinator 负责"怎么做"。

> ⚡ 核心原则：读取子技能 SKILL.md → 按步骤执行 → 质量检查 → 整合输出
> 🔒 跨平台兼容：纯 Markdown 指令，不依赖任何平台专属 API

---

## 调用时机

当用户请求满足以下任一条件时，由 HOLO-AGENT 路由到此技能：

1. **完整获客流程** — "帮我找10个美国客户并发邮件"
2. **批量背调** — "背调这5家公司"
3. **多步骤任务** — 任何需要串行调用 2+ 个子技能的请求
4. **并行搜索** — "同时用特易和LinkedIn搜索"

单步简单任务（如单个LinkedIn搜索）不需要经过协调器，直接路由到目标技能。

---

## 输入要求

调用时需要提供：

| 参数 | 必需 | 说明 |
|------|------|------|
| 任务描述 | ✅ | 用户的原始请求 |
| 目标市场 | ✅ | 国内/海外（影响技能路由） |
| 目标数量 | ❌ | 期望获取的客户数（默认10） |
| 行业关键词 | ✅ | 搜索用关键词 |
| 语言偏好 | ❌ | 开发信语言（默认英语） |

---

## 执行步骤

### Step 0: 任务分析

分析用户请求，判断任务类型和复杂度：

- **简单任务**（单步）→ 直接路由到目标技能，不经过协调器
- **批量任务**（同操作重复）→ 按步骤执行，逐个处理
- **复杂任务**（多步串行）→ 按 Phase 编排执行

### Step 1: 搜索阶段

**操作**：读取目标搜索技能的 SKILL.md，按其"执行步骤"操作。

1. 查阅 `skill://global-customer-acquisition/references/ROUTING-TABLE.yaml` 中 `customer_discovery` 的路由配置
2. 根据目标市场选择合适的搜索技能
3. **读取该技能的 SKILL.md**，按其中的"执行步骤"执行搜索
4. 收集搜索结果，统一格式

**可用搜索技能**（按优先级）：

| 优先级 | 技能 | 适用场景 |
|--------|------|----------|
| 5 | teyi-customs | 海外 + 需要采购记录 |
| 5 | exa-search | 通用搜索、语义搜索 |
| 4 | facebook-acquisition | Facebook 渠道 |
| 4 | scrapling | 网页爬取 |

**质量检查**：
- [ ] 搜索关键词是否准确？
- [ ] 结果是否属于目标行业？
- [ ] 每个客户是否有有效邮箱？

### Step 1.5: 联系方式验证

**铁律：无邮箱不继续！**

按 `skill://acquisition-workflow` 的联系方式验证流程执行（参考 `skill://global-customer-acquisition/references/CONTACT-VERIFICATION.md`）：
1. 检查每个客户的联系方式来源
2. 执行时效性验证
3. 多源交叉验证（至少2个来源）
4. 无法验证的客户标记为"需人工确认"并跳过

### Step 2: 背调阶段

**操作**：对通过验证的客户逐个执行背调。

1. 读取 `skill://company-research` 或 `skill://deep-research`
2. 按步骤执行背调
3. 计算 ICP 6维度评分（参考 `skill://global-customer-acquisition/references/SCORING.md`）
4. 输出评分报告

**背调技能选择**：

| 场景 | 技能 |
|------|------|
| 快速背调 | company-research |
| 深度背调 | deep-research / in-depth-research |
| 竞品分析 | honglong-products |

### Step 3: 筛选阶段

**质量门控：ICP评分 ≥ 75 分才继续！**（铁律，参考 `skill://global-customer-acquisition/references/IRON-RULES.md`）

筛选条件：
1. ICP评分 ≥ 75分
2. 非竞争对手
3. 有已验证联系方式（时效 ≤ 12个月）
4. 非矿业客户（铁律）

输出：高价值客户列表（2-5家）

### Step 4: 触达阶段

**操作**：对通过筛选的客户执行触达。

1. 读取 `skill://cold-email-generator` 生成个性化开发信（评分 ≥ 9.0 分，10分制）
2. 读取 `skill://email-sender` 配置邮箱并发送
3. 设置跟进计划（D3/D5/D14）

**质量检查**：
- [ ] 开发信评分 ≥ 9.0 分（10分制）？
- [ ] 签名使用业务员本人联系方式？
- [ ] 发送频率合理？

### Step 5: 结果整合

将所有阶段的结果整合为统一报告：

```markdown
## 获客任务报告

**任务**: [用户原始请求]
**执行时间**: [时间戳]

### 搜索结果
- 搜索到 X 家潜在客户
- 有效联系方式：Y 家
- 验证通过：Z 家

### 背调结果
| 公司 | ICP评分 | 等级 | 状态 |
|------|---------|------|------|
| ABC Industrial | 85 | A | ✅ 通过 |
| XYZ Corp | 68 | B | ⏭️ 暂缓 |

### 触达结果
- 已发送：N 封
- 跟进计划：D3/D5/D14 已创建
- 产品资料：已附链接

### 下一步建议
- [ ] 关注 D3 跟进
- [ ] 检查邮件回复
- [ ] 更新 Pipeline
```

---

## 输出格式

完成后返回**Markdown格式报告**，包含：
1. 搜索统计
2. 背调评分表格
3. 触达记录
4. 跟进计划
5. 下一步建议

---

## 质量门控

| 检查点 | 条件 | 失败处理 |
|--------|------|----------|
| 联系方式验证 | 必须有已验证邮箱 | 跳过该客户 |
| ICP评分 | ≥ 75分 | 标记暂缓 |
| 开发信质量 | ≥ 9.0分 | 重新润色 |
| 竞品检查 | 非竞争对手 | 排除 |
| 矿业过滤 | 非矿业客户 | 排除 |

### 错误处理

| 错误类型 | 处理方式 |
|----------|----------|
| 搜索技能不可用 | 自动切换备选技能（查ROUTING-TABLE.yaml的fallback） |
| 单个背调失败 | 跳过，继续处理其他客户 |
| 开发信评分不足 | 重新润色（最多2轮），仍不足则人工介入 |
| 邮件发送失败 | 记录失败原因，建议手动重试 |

---

## 后续技能

完成本技能后，根据结果可继续调用：

| 场景 | 后续技能 |
|------|----------|
| 生成报价单 | `skill://honglong-products` |
| 社媒运营 | `skill://ai-social-media-content` |
| Pipeline更新 | `skill://sales-pipeline-tracker` |
| 验收报告 | `skill://acquisition-evaluator` |

---

## 子技能调用方式

本协调器通过以下方式调用子技能：

1. **读取子技能 SKILL.md** — 获取该技能的完整指令
2. **按子技能的"执行步骤"操作** — 严格遵循其步骤
3. **通过子技能的"质量门控"** — 确认结果合格
4. **将结果传递给下一阶段** — 格式化后继续

**禁止使用**：
- ❌ `sessions_spawn()` / `sessions_yield()` 等平台专属API
- ❌ 直接假设子技能的具体实现细节
- ❌ 跳过子技能的质量门控

---

*版本: 2.0.0 | 更新时间: 2026-04-03*
*变更: 去除 sessions_spawn 等平台专属API，改为纯指令调用*
