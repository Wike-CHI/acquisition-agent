# 红龙获客系统 - 技能路由器

> **版本**: v2.6.0
> **更新日期**: 2026-04-10
> **职责**: 根据任务类型自动调度最合适的技能
> **路由配置**: `skill://acquisition-workflow/references/ROUTING-TABLE.yaml`

---

## 技能分类

### 1️⃣ 编排层（Orchestration）
| 技能 | 触发条件 | 输入 | 输出 |
|------|----------|------|------|
| `acquisition-coordinator` | 复杂任务/多步骤 | 任务描述 | 执行计划 |
| `acquisition-evaluator` | 验收/审核需求 | 待审内容 | 评估报告 |
| `acquisition-workflow` | 流程咨询/规范查询 | 流程问题 | 流程定义 |

### 2️⃣ 发现层（Discovery）
| 技能 | 触发条件 | 输入 | 输出 |
|------|----------|------|------|
| `linkedin` | 找LinkedIn客户 | 关键词/地区 | 客户列表 |
| `facebook-acquisition` | 找Facebook客户 | 关键词/群组 | 客户列表 |
| `instagram-acquisition` | 找Instagram客户 | 关键词/标签 | 客户列表 |
| `teyi-customs` | 查海关数据 | 产品/HS编码 | 进口商列表 |
| `autoresearch` | 通用网络搜索 | 关键词 | 搜索结果 |

### 3️⃣ 情报层（Intelligence）
| 技能 | 触发条件 | 输入 | 输出 |
|------|----------|------|------|
| `company-research` | 背调公司 | 公司名/域名 | 背调报告 |
| `market-research` | 市场分析 | 行业/产品 | 市场报告 |
| `deep-research` | 深度调研 | 复杂问题 | 多源报告 |

### 4️⃣ 触达层（Outreach）
| 技能 | 触发条件 | 输入 | 输出 |
|------|----------|------|------|
| `cold-email-generator` | 生成开发信 | 客户信息/产品 | 开发信 |
| `email-sender` | 发送邮件 | 收件人/内容 | 发送状态 |
| `email-marketing` | 邮件营销 | 营销目标 | 营销方案 |
| `linkedin-writer` | LinkedIn消息 | 客户信息 | 消息内容 |

### 5️⃣ 产品知识层
| 技能 | 触发条件 | 输入 | 输出 |
|------|----------|------|------|
| `honglong-products` | 产品咨询 | 产品问题 | 产品信息 |

### 6️⃣ CRM层
| 技能 | 触发条件 | 输入 | 输出 |
|------|----------|------|------|
| `fumamx-crm` | 孚盟CRM操作 | 操作指令 | 执行结果 |
| `crm` | 通用CRM需求 | 需求描述 | 解决方案 |

---

## 路由决策树

```
用户输入
   ↓
Step 1: 意图识别 — 匹配关键词（见上方映射表）
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

## 任务 → 技能映射

```
用户任务 → 技能路由
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"找客户" / "开发信" / "背调" / "获客"
  → acquisition-coordinator

"检查质量" / "评分" / "审核" / "验收"
  → acquisition-evaluator

"流程是什么" / "怎么做" / "规范"
  → acquisition-workflow

"LinkedIn" / "领英"
  → linkedin

"Facebook" / "脸书"
  → facebook-acquisition

"海关数据" / "进口商" / "HS编码"
  → teyi-customs

"背调" / "查公司" / "公司信息"
  → company-research

"调研" / "市场分析"
  → market-research / deep-research

"开发信" / "写邮件"
  → cold-email-generator

"发送邮件" / "发邮件"
  → email-sender

"孚盟" / "CRM客户"
  → fumamx-crm

"产品" / "型号" / "参数" / "规格"
  → honglong-products

"WhatsApp" / "WhatsApp触达"
  → delivery-queue（需配合手机端）
```

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

## 质量检查点

| 环节 | 检查标准 | 阈值 |
|------|----------|------|
| ICP评分 | 公司匹配度 | ≥75分 |
| 开发信质量 | AI评分 | ≥9.0分（10分制） |
| 联系方式时效 | LinkedIn最新动态 | ≤12个月 |
| 产品匹配度 | 产品线匹配 | 核心产品优先 |

---

## 执行铁律

在任何操作前，检查铁律（详细规则见 `skill://acquisition-workflow/references/IRON-RULES.md`）：

| 铁律 | 阶段 | 阻断 |
|------|------|------|
| 必须用决策人邮箱 | Phase 1.5 | ✅ |
| ICP ≥ 75分 | Phase 3 | ✅ |
| 开发信 ≥ 9.0分 | Phase 4 | ✅ |
| 禁止未验证单一来源 | Phase 1.5 | ✅ |
| 无邮箱不继续 | Phase 1.5 | ✅ |
| 禁止矿业客户 | Phase 3 | ✅ |

---

## 禁止事项（铁律）

1. ❌ 禁止联系矿业客户
2. ❌ 禁止在群晖NAS上运行自动化
3. ❌ 禁止绕过质量检查
4. ❌ 禁止未经审核直接发送

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
│  触达层 (outreach)                       │
│  cold-email / email-sender / whatsapp / queue │
├──────────────────────────────────────────┤
│  社媒层 (social)                         │
│  ai-social-media-content                │
├──────────────────────────────────────────┤
│  支持层 (support)                        │
│  products / nas / crm / deduplication    │
└──────────────────────────────────────────┘
```

---

*本文件是红龙获客系统 v2.6.0 的核心路由规范。*
*合并来源：SKILLS-ROUTER.md v2.5.0 + references/SKILLS-ROUTER.md v2.0.0*
*架构重构：共享文档已迁移至 acquisition-workflow/references/*
