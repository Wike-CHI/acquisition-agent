# A2UI 集成指南 - 红龙获客系统

> 让AI代理生成动态交互界面

---

## 🎯 什么是A2UI？

**A2UI (Agent-to-User Interface)** 是一个声明式协议，让AI代理能够生成动态、交互式的用户界面。

**核心优势**:
- ✅ **安全** - 数据不是代码，无eval()风险
- ✅ **跨平台** - 同一JSON可在Web/Mobile/iOS渲染
- ✅ **渐进式渲染** - 流式生成，逐个组件出现
- ✅ **交互丰富** - 超越Markdown，支持表单、按钮、列表

---

## 🚀 红龙系统A2UI应用场景

### 1. 客户详情卡片

**用户输入**:
```
显示ACE Belting的客户详情
```

**AI生成A2UI**:
```jsonl
{"id":"root","component":{"Column":{"children":["header","company-info","icp-score","actions"]}}}
{"id":"header","component":{"Text":{"text":{"literalString":"🏢 ACE Belting"},"usageHint":"h1"}}}
{"id":"company-info","component":{"Card":{"child":"info-content"}}}
{"id":"info-content","component":{"Column":{"children":["industry","location","products"]}}}
{"id":"industry","component":{"Text":{"text":{"literalString":"行业：输送带制造"},"usageHint":"body1"}}}
{"id":"location","component":{"Text":{"text":{"literalString":"地区：美国德州"},"usageHint":"body1"}}}
{"id":"products","component":{"Text":{"text":{"literalString":"兴趣产品：风冷机、打齿机"},"usageHint":"body1"}}}
{"id":"icp-score","component":{"Card":{"child":"score-content"}}}
{"id":"score-content","component":{"Row":{"children":["score-label","score-value"]}}}
{"id":"score-label","component":{"Text":{"text":{"literalString":"ICP评分"},"usageHint":"body2"}}}
{"id":"score-value","component":{"Text":{"text":{"literalString":"8.5/10"},"usageHint":"h2"}}}
{"id":"actions","component":{"Row":{"children":["btn-email","btn-quote"]}}}
{"id":"btn-email","component":{"Button":{"text":"📧 发送开发信","variant":"primary"}}}
{"id":"btn-quote","component":{"Button":{"text":"📋 生成报价","variant":"secondary"}}}
```

---

### 2. Pipeline看板

**用户输入**:
```
显示Pipeline状态
```

**AI生成A2UI**:
```jsonl
{"id":"root","component":{"Tabs":{"tabs":["tab-new","tab-contacted","tab-quoted","tab-won"]}}}
{"id":"tab-new","component":{"Tab":{"label":"新线索 (12)","content":"list-new"}}}
{"id":"list-new","component":{"List":{"items":["item1","item2","item3"]}}}
{"id":"item1","component":{"Card":{"child":"item1-content"}}}
{"id":"item1-content","component":{"Column":{"children":["item1-name","item1-score"]}}}
{"id":"item1-name","component":{"Text":{"text":{"literalString":"ACE Belting"},"usageHint":"body1"}}}
{"id":"item1-score","component":{"Badge":{"text":"ICP 8.5","variant":"success"}}}
```

---

### 3. 报价单预览

**用户输入**:
```
生成ACE Belting的报价单
```

**AI生成A2UI**:
```jsonl
{"id":"root","component":{"Card":{"child":"quote-content"}}}
{"id":"quote-content","component":{"Column":{"children":["quote-header","quote-table","quote-total","quote-actions"]}}}
{"id":"quote-header","component":{"Text":{"text":{"literalString":"报价单 #Q-2026-0328-001"},"usageHint":"h1"}}}
{"id":"quote-table","component":{"Table":{"headers":["产品","规格","数量","单价","小计"],"rows":[["风冷机","A2FRJ-1200","2台","$8,500","$17,000"],["打齿机","AFQ-800","1台","$6,200","$6,200"]]}}}
{"id":"quote-total","component":{"Row":{"children":["total-label","total-value"]}}}
{"id":"total-label","component":{"Text":{"text":{"literalString":"总计"},"usageHint":"h2"}}}
{"id":"total-value","component":{"Text":{"text":{"literalString":"$23,200"},"usageHint":"h2"}}}
{"id":"quote-actions","component":{"Row":{"children":["btn-edit","btn-send"]}}}
{"id":"btn-edit","component":{"Button":{"text":"✏️ 编辑","variant":"secondary"}}}
{"id":"btn-send","component":{"Button":{"text":"📧 发送给客户","variant":"primary"}}}
```

---

### 4. 跟进时间线

**用户输入**:
```
显示ACE Belting的跟进计划
```

**AI生成A2UI**:
```jsonl
{"id":"root","component":{"Column":{"children":["header","timeline"]}}}
{"id":"header","component":{"Text":{"text":{"literalString":"📅 跟进时间线 - ACE Belting"},"usageHint":"h1"}}}
{"id":"timeline","component":{"Column":{"children":["day1","day3","day7","day14"]}}}
{"id":"day1","component":{"Card":{"child":"day1-content"}}}
{"id":"day1-content","component":{"Row":{"children":["day1-icon","day1-text"]}}}
{"id":"day1-icon","component":{"Icon":{"icon":"email","color":"primary"}}}
{"id":"day1-text","component":{"Text":{"text":{"literalString":"Day 1 - 发送开发信"},"usageHint":"body1"}}}
{"id":"day3","component":{"Card":{"child":"day3-content"}}}
{"id":"day3-content","component":{"Row":{"children":["day3-icon","day3-text"]}}}
{"id":"day3-icon","component":{"Icon":{"icon":"follow","color":"warning"}}}
{"id":"day3-text","component":{"Text":{"text":{"literalString":"Day 3 - 跟进#1（产品案例）"},"usageHint":"body1"}}}
```

---

## 📝 如何在红龙系统中使用A2UI

### 方式1: 直接在回复中使用

**用户**:
```
显示我的Pipeline状态
```

**AI回复**:
```
你的Pipeline状态如下：

​```a2ui
{"id":"root","component":{"Column":{"children":["header","list"]}}}
{"id":"header","component":{"Text":{"text":{"literalString":"📊 Pipeline状态"},"usageHint":"h1"}}}
{"id":"list","component":{"List":{"items":["item1","item2","item3"]}}}
...
​```

**说明**:
- 新线索：12个
- 已联系：8个
- 已报价：5个
```

---

### 方式2: 在SKILL.md中添加指令

**文件**: `global-customer-acquisition/SKILL.md`

**添加内容**:
```markdown
## A2UI界面生成

当用户请求可视化展示时，使用A2UI生成动态界面：

### 触发词
- "显示客户详情"
- "查看Pipeline"
- "生成报价单"
- "跟进时间线"

### 生成规则
1. 使用标准组件：Card, Row, Column, Button, Text, List, Table
2. 保持JSONL格式（每行一个组件）
3. 包含交互按钮（发送邮件、生成报价等）
4. 双重渲染：Markdown文本 + A2UI代码块

### 示例
用户："显示ACE Belting的客户详情"

AI生成：
​```a2ui
{"id":"root","component":{"Card":{"child":"content"}}}
{"id":"content","component":{"Text":{"text":{"literalString":"ACE Belting - ICP 8.5"},"usageHint":"h1"}}}
​```
```

---

### 方式3: 创建专用A2UI技能

**文件**: `skills/honglong-a2ui/SKILL.md`

```markdown
# Honglong A2UI Generator

生成红龙获客系统的A2UI界面

## 功能

| 场景 | 组件 |
|------|------|
| 客户详情 | Card + Badge + Button |
| Pipeline | Tabs + List |
| 报价单 | Table + Card |
| 跟进时间线 | Column + Icon |

## 使用

```
A2UI客户详情：ACE Belting
A2UI Pipeline
A2UI报价单：ACE Belting, 风冷机2台
```
```

---

## 🔧 OpenClaw A2UI组件库

### 布局组件

| 组件 | 说明 |
|------|------|
| `Column` | 垂直布局 |
| `Row` | 水平布局 |
| `Card` | 卡片容器 |
| `List` | 列表 |
| `Tabs` | 标签页 |
| `Grid` | 网格布局 |

### 输入组件

| 组件 | 说明 |
|------|------|
| `Button` | 按钮（primary/secondary） |
| `TextField` | 文本输入框 |
| `CheckBox` | 复选框 |
| `MultipleChoice` | 多选题 |

### 展示组件

| 组件 | 说明 |
|------|------|
| `Text` | 文本（h1/h2/body1/body2） |
| `Image` | 图片 |
| `Icon` | 图标 |
| `Badge` | 徽章（success/warning/error） |
| `Table` | 表格 |

---

## 🎨 红龙系统A2UI模板

### 客户详情卡片模板

```jsonl
{"id":"root","component":{"Card":{"child":"content"}}}
{"id":"content","component":{"Column":{"children":["header","info","score","actions"]}}}
{"id":"header","component":{"Text":{"text":{"literalString":"🏢 {{公司名}}"},"usageHint":"h1"}}}
{"id":"info","component":{"Column":{"children":["industry","location","products"]}}}
{"id":"industry","component":{"Text":{"text":{"literalString":"行业：{{行业}}"},"usageHint":"body1"}}}
{"id":"location","component":{"Text":{"text":{"literalString":"地区：{{地区}}"},"usageHint":"body1"}}}
{"id":"products","component":{"Text":{"text":{"literalString":"兴趣：{{产品}}"},"usageHint":"body1"}}}
{"id":"score","component":{"Row":{"children":["score-label","score-badge"]}}}
{"id":"score-label","component":{"Text":{"text":{"literalString":"ICP评分"},"usageHint":"body2"}}}
{"id":"score-badge","component":{"Badge":{"text":"{{分数}}","variant":"success"}}}
{"id":"actions","component":{"Row":{"children":["btn-email","btn-quote"]}}}
{"id":"btn-email","component":{"Button":{"text":"📧 发送开发信","variant":"primary"}}}
{"id":"btn-quote","component":{"Button":{"text":"📋 生成报价","variant":"secondary"}}}
```

---

## 📊 实施步骤

### Step 1: 添加A2UI指令到SKILL.md

```bash
# 编辑SKILL.md
vim ~/.openclaw/workspace/skills/global-customer-acquisition/SKILL.md

# 添加A2UI章节
```

### Step 2: 创建A2UI模板文件

```bash
# 创建模板目录
mkdir -p ~/.openclaw/workspace/skills/global-customer-acquisition/a2ui-templates

# 创建客户详情模板
touch customer-detail.jsonl
touch pipeline-view.jsonl
touch quotation-preview.jsonl
```

### Step 3: 测试A2UI生成

```
用户: 显示ACE Belting的客户详情

AI: 生成A2UI JSONL → Canvas渲染 → 动态界面
```

---

## 🎯 优势总结

| 优势 | 红龙系统收益 |
|------|-------------|
| **交互丰富** | 超越文本，支持按钮、表单 |
| **可视化** | Pipeline、时间线、报价单一目了然 |
| **跨平台** | Web/Mobile统一体验 |
| **安全** | 无代码注入风险 |
| **渐进式** | 流式渲染，体验流畅 |

---

## 📚 参考资源

- **A2UI官方文档**: https://github.com/a2ui/a2ui
- **OpenClaw Canvas**: 使用Canvas工具渲染A2UI
- **红龙SKILL.md**: 集成A2UI生成指令

---

_版本: 1.0.0_
_更新: 2026-03-28_
