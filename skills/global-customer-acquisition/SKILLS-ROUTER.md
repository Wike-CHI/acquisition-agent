# Skills Router 路由使用指南

> 红龙获客系统的意图路由配置说明
> 版本: 2.0.0 | 更新时间: 2026-04-03

---

## 概述

Skills Router 负责**意图识别 → 技能选择 → 调用执行**三步路由。

路由配置已从 JS 代码迁移到声明式 YAML 文件，AI Agent 通过读取 YAML 做路由决策，无需运行任何代码。

**核心文件**: `references/ROUTING-TABLE.yaml`

---

## 路由流程

```
用户请求
    ↓
Step 1: 意图识别 — 匹配 intents 中的关键词
    ↓
Step 2: 条件判断 — 根据市场/平台/需求选择技能列表
    ↓
Step 3: 技能选择 — 按 priority 排序，选最高优先级可用技能
    ↓
Step 4: 读取技能 — 读取目标技能的 SKILL.md
    ↓
Step 5: 执行 — 按技能的"执行步骤"操作
    ↓
Step 6: 质量门控 — 检查 iron_rules 是否通过
    ↓
Step 7: 故障切换 — 如技能不可用，查 fallback_map 切换备选
```

---

## 如何使用 ROUTING-TABLE.yaml

### Step 1: 意图识别

读取 YAML 中的 `intents` 节，将用户请求与关键词匹配：

```yaml
intents:
  customer_discovery:
    keywords: [找客户, 搜索客户, 获客, ...]
```

**匹配规则**：
- 用户说"帮我找美国传送带客户" → 命中"找客户" → `customer_discovery`
- 用户说"背调这家公司" → 命中"背调" → `company_research`
- 用户说"给这家公司发邮件" → 命中"发邮件" → `email_outreach`

### Step 2: 选择技能

根据意图 + 市场条件，查 `routing` 节：

```yaml
routing:
  customer_discovery:
    overseas:
      - skill: teyi-customs
        priority: 5
        condition: "需要采购记录数据"
        fallback: [exa-search]
```

**选择逻辑**：
1. 确定市场：海外 → `overseas`，国内 → `domestic`，不区分 → `all_markets`
2. 按 `priority` 排序，选最高
3. 检查 `condition` 是否满足
4. 主技能不可用 → 按 `fallback` 顺序尝试

### Step 3: 故障切换

如果技能执行失败或不可用，查 `fallback_map`：

```yaml
fallback_map:
  teyi-customs: [exa-search]
  linkedin: [exa-search]
```

**"不可用"的定义**：
- 技能文件不存在
- 技能执行报错
- 当前平台不支持该技能

### Step 4: 执行铁律

在任何操作前，检查 `iron_rules`：

| 铁律 | 阶段 | 阻断 |
|------|------|------|
| 必须用决策人邮箱 | Phase 1.5 | ✅ |
| ICP ≥ 75分 | Phase 3 | ✅ |
| 开发信 ≥ 9.0分 | Phase 4 | ✅ |
| 禁止未验证单一来源 | Phase 1.5 | ✅ |
| 无邮箱不继续 | Phase 1.5 | ✅ |
| 禁止矿业客户 | Phase 3 | ✅ |

---

## 路由示例

### 示例1: 简单路由

```
用户: "帮我搜索 LinkedIn 上 Ace Belting 的采购负责人"

路由过程:
1. 意图: decision_maker_search（命中"决策人"+"LinkedIn"）
2. 市场: all_markets（不区分）
3. 技能: exa-search（priority 5）
4. 执行: 读取 exa-search/SKILL.md → 按步骤搜索
```

### 示例2: 带故障切换

```
用户: "帮我用特易搜索美国传送带买家"

路由过程:
1. 意图: customer_discovery（命中"搜索"+"买家"）
2. 市场: overseas（美国）
3. 技能: teyi-customs（priority 5）
4. 特易不可用 → fallback: exa-search
5. 执行: 读取 exa-search/SKILL.md → 按步骤搜索
```

### 示例3: 完整流程

```
用户: "帮我找10个美国的工业皮带经销商并发邮件"

路由过程:
1. 意图: full_pipeline（命中"找...并发邮件"=完整流程）
2. 市场: overseas
3. 技能: acquisition-coordinator（priority 5）
4. 执行: 读取 acquisition-coordinator/SKILL.md → 按5步执行
```

---

## 技能层级

```
┌──────────────────────────────────────────┐
│  编排层 (orchestration)                  │
│  coordinator / workflow / evaluator      │
├──────────────────────────────────────────┤
│  发现层 (discovery)                      │
│  teyi-customs / exa-search / facebook    │
├──────────────────────────────────────────┤
│  情报层 (intelligence)                   │
│  company-research / deep-research        │
├──────────────────────────────────────────┤
│  触达层 (outreach)                              │
│  cold-email / email-sender / whatsapp / queue   │
├──────────────────────────────────────────┤
│  社媒层 (social)                         │
│  ai-social-media-content                │
├──────────────────────────────────────────┤
│  支持层 (support)                        │
│  products / nas / crm / deduplication    │
└──────────────────────────────────────────┘
```

---

## 旧文件参考

以下文件为旧版实现，已标记为 deprecated，仅供历史参考：

| 旧文件 | 状态 | 替代方案 |
|--------|------|----------|
| `lib/skills-router.js` | ⚠️ deprecated | `references/ROUTING-TABLE.yaml` |
| `lib/context-manager.js` | ⚠️ deprecated | 上下文由 AI 自行管理 |
| `tests/test-skills-router.js` | ⚠️ deprecated | 无需测试代码 |

---

*版本: 2.1.0 | 更新时间: 2026-04-06*
*变更: 触达层加入 WhatsApp 渠道*
