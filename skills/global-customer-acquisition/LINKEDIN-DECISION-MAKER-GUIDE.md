# LinkedIn 决策人搜索流程使用指南

> 集成到获客系统的流程模板
> 更新时间：2026-03-27

---

## 快速开始

### 触发命令

```
LinkedIn 决策人：[公司名/行业]
LinkedIn 决策人搜索：[关键词] [地区]
```

### 示例

```
# 按公司搜索
LinkedIn 决策人：Ace Belting Company

# 按行业搜索
LinkedIn 决策人搜索：purchasing manager conveyor belt USA

# 按地区搜索
LinkedIn 决策人搜索：procurement manager conveyor belt Michigan
```

---

## 完整流程

### Step 1: Exa 搜索 LinkedIn

```bash
mcporter call "exa.web_search_exa(query: 'site:linkedin.com [关键词]', numResults: 10)"
```

### Step 2: 解析结果

提取字段：
- 姓名 (name)
- 职位 (title)
- 公司 (company)
- 地区 (location)
- LinkedIn URL (linkedin_url)
- 连接数 (connections)
- 关注者数 (followers)
- 经验年限 (experience)

### Step 3: 优先级排序

**高优先级** (⭐⭐⭐⭐⭐):
- 职位：Purchasing Manager, Procurement Manager, Buyer
- 连接数：300+
- 活跃度：高

**中优先级** (⭐⭐⭐⭐):
- 职位：Operations Manager, Plant Manager
- 连接数：100-300
- 活跃度：中

**低优先级** (⭐⭐⭐):
- 职位：Engineer, Technician
- 连接数：<100
- 活跃度：低

### Step 4: 生成报告

使用模板：`templates/linkedin-decision-maker-report.md`

填充数据：
```json
{
  "company_name": "美国传送带行业",
  "target_market": "美国传送带制造商/服务商",
  "data_source": "Exa + LinkedIn Index",
  "insights": [...],
  "high_priority_contacts": [...],
  "medium_priority_contacts": [...],
  "low_priority_contacts": [...],
  "success_probabilities": [...]
}
```

### Step 5: 保存报告

保存路径：`projects/customer-data/linkedin-[关键词]-[日期].md`

---

## 连接消息模板

### 高优先级（采购经理）

```
Hi [First Name],

I noticed you're the Purchasing Manager at [Company] 
with [X] years of experience in the industry.

I'm with Red Dragon Industrial Equipment - we specialize in 
vulcanizing presses for conveyor belt splicing. Given your 
extensive experience, I thought you might be interested in 
how our clients have reduced belt splicing time by 40% while 
maintaining quality.

Would love to connect and share case studies from similar 
conveyor manufacturers.

Best,
[Your Name]
```

### 中优先级（运营/工厂经理）

```
Hi [First Name],

Saw you're the [Title] at [Company].

We manufacture belt processing equipment that helps 
conveyor manufacturers improve production efficiency. 
Our equipment has helped clients reduce downtime by 30%.

Would love to connect and share more details.

Best,
[Your Name]
```

### 技术背景（工程师）

```
Hi [First Name],

Noticed your [engineering background/technical role] at [Company].

As a technical professional, you might appreciate our 
equipment's precision - temperature control ±2°C, 
pressure uniformity ±5%.

Happy to share technical specifications.

Best,
[Your Name]
```

---

## 电话脚本

### 获取采购部门联系方式

```
"Hi, this is [Your Name] from Red Dragon Industrial Equipment.
We specialize in vulcanizing presses for conveyor belt 
manufacturers. Could I speak with someone in purchasing 
regarding supplier inquiries?"

备选:
"May I have the email address for your purchasing department?"
```

### 转接到采购经理

```
"I understand [Name] is your Purchasing Manager. 
Could you transfer me to their extension or provide 
their direct email address?"
```

---

## 成功指标

### 回应概率

| 条件 | 概率 |
|------|------|
| 连接数 500+ | 70% |
| 连接数 100-500 | 50% |
| 连接数 <100 | 30% |
| 有技术背景 | +10% |
| 同一公司多联系人 | +20% |

### 转化周期

| 客户类型 | 周期 |
|----------|------|
| 大型制造商 | 2-4周 |
| 中型制造商 | 3-6周 |
| 小型服务商 | 4-8周 |
| 经销商 | 1-3周 |

---

## 自动化检查

### 每次心跳检查

```bash
# 检查 LinkedIn MCP 服务
mcporter list | grep linkedin

# 检查 Exa 服务
mcporter call "exa.web_search_exa(query: 'test', numResults: 1)"
```

### 报告生成

```bash
# 自动保存到
projects/customer-data/linkedin-*.md

# 文件命名格式
linkedin-[关键词]-YYYY-MM-DD.md
```

---

## 集成到获客流程

### 在 global-customer-acquisition 中的位置

```
获客流程:
1. 客户发现 → 海关数据/Google搜索
2. 企业背调 → 公司背调 + ICP评分
3. **LinkedIn 决策人** → 本流程 ⭐
4. 开发信生成 → 个性化开发信
5. 多渠道触达 → 邮件/LinkedIn/电话
6. 跟进管理 → 自动化跟进
```

### 触发时机

- 用户请求 "LinkedIn 决策人" 时
- 完成企业背调后，需要找联系人时
- 海关数据找到客户，需要触达时

### 输出

- 决策人报告（Markdown）
- 连接消息模板
- 电话脚本
- 成功概率评估

---

## 文件结构

```
global-customer-acquisition/
├── SKILL.md                              # 主技能文件（已更新）
└── templates/
    ├── linkedin-decision-maker-report.md # 决策人报告模板（已更新）
    ├── email-templates.md                # 邮件模板
    └── follow-up-templates.md            # 跟进模板

projects/customer-data/
├── linkedin-decision-makers-2026-03-27.md  # 示例报告
└── ASGCO-report-2026-03-27.md              # 客户报告
```

---

_更新时间：2026-03-27_
_Agent Reach 获客系统 v1.2.0_
