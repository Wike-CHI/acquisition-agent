# 红龙获客系统 - 技能路由器

> **版本**: v2.5.0
> **更新日期**: 2026-04-09
> **职责**: 根据任务类型自动调度最合适的技能

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

## 调度规则

### 任务 → 技能映射

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

## 路由决策树

```
用户输入
   ↓
识别关键词（见上方映射表）
   ↓
匹配技能
   ↓
检查技能可用性
   ├─ 可用 → 执行技能
   └─ 不可用 → 回退到通用方案
              └─ acquisition-coordinator
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

## 禁止事项（铁律）

1. ❌ 禁止联系矿业客户
2. ❌ 禁止在群晖NAS上运行自动化
3. ❌ 禁止绕过质量检查
4. ❌ 禁止未经审核直接发送

---

*本文件是红龙获客系统 v2.5.0 的核心路由规范。*
