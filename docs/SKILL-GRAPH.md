---
name: skill-graph-design
description: acquisition-agent Skill Graph 架构设计文档 — 从扁平 84 技能到可遍历知识图谱的改造说明
version: 1.0.0
created: 2026-05-21
---

# Skill Graph 架构设计

## 概述

acquisition-agent 从传统的"一个文件一个技能"模式升级为 **Skill Graph（技能图谱）** ——由 Wiki-link 互连的可遍历知识网络。

核心理念：Agent 不再是"被动接收上下文照着执行"，而是"理解整个获客领域的知识网络，根据当前情境自主导航、精确拉取所需内容"。

## 设计原则

### 1. 渐进式披露（Progressive Disclosure）

```
主索引 (_index.md) → 领域 MOC → Wiki-link → SKILL.md 正文 → references/
```

Agent 在大多数路由决策中不读取完整文件——先扫描索引和 YAML frontmatter 理解全局，顺相关路径深入。

### 2. 原子节点（Atomic Nodes）

每个 SKILL.md 是一个完整的方法论声明，独立可执行，通过 Wiki-link 与其他节点组合。

### 3. 语义链接（Semantic Links）

Wiki-link 嵌入 prose 自然句中，携带"为什么跟随"的语义：
```markdown
报价前必须先做 [[company-research|企业背调]] 获取 ICP 评分，
因为利润率区间由 ICP 评分驱动。
```

### 4. MOC 导航（Maps of Content）

7 个领域 MOC 将 ~93 个技能组织为可导航的集群，Agent 按领域进入而非遍历扁平列表。

## 架构图

```
skills/
├── _index.md                    ← 主注意力入口（Agent 第一读）
├── _index-acquisition.md        ← 核心流程领域 MOC
├── _index-discovery.md          ← 客户发现领域 MOC
├── _index-outreach.md           ← 多渠道触达领域 MOC
├── _index-conversion.md         ← 报价与转化领域 MOC
├── _index-intelligence.md       ← 情报与知识领域 MOC
├── _index-operations.md         ← 运营自动化领域 MOC
├── _index-meta.md               ← 系统元技能领域 MOC
├── global-customer-acquisition/ ← 总入口（含 Wiki-link 导航）
├── company-research/            ← 背调节点（上游→下游链）
├── cold-email-generator/        ← 开发信节点（前后链接）
├── smart-quote/                 ← 报价节点（ICP→报价链）
├── ...                          ← 其余 ~85 个技能节点
├── catalog.json                 ← 机器可读索引（7 领域）
└── config/                      ← 内部配置（非技能）
```

## 关键路径

### 获客主路径
```
global-customer-acquisition
  → _index-discovery
    → teyi-customs (海关搜索)
    → company-research (背调，产生 ICP 评分)
  → _index-outreach
    → cold-email-generator → humanize-ai-text → email-sender
    → follow-up-signal-monitor (监控回复)
  → _index-conversion
    → smart-quote (ICP→利润率)
    → quotation-generator (PDF 报价单)
    → sales-pipeline-tracker (更新 Pipeline)
  → _index-intelligence
    → knowledge-base (存档报告)
```

### 7 大领域映射（14 旧分类 → 7 新领域）

| 旧分类 | 新领域 |
|--------|--------|
| automation (自动化) | → tools (分散到各领域) |
| CRM (客户管理) | → conversion |
| custom (定制技能) | → acquisition |
| document (文档处理) | → tools (跨领域工具) |
| email (邮件营销) | → outreach |
| knowledge (知识库) | → intelligence |
| messaging (即时通讯) | → outreach |
| other (其他) | → tools / operations |
| output (内容输出) | → conversion |
| research (调研分析) | → discovery |
| sales (销售赋能) | → conversion |
| social (社交媒体) | → outreach |
| system (系统工具) | → meta |
| workflow (工作流) | → operations |

## Agent 行为变化

### 旧模式：上下文注入
```
用户: "给这家公司发开发信"
Agent: 加载 cold-email-generator/SKILL.md 全部内容
      → 所有指令一次性注入上下文
      → 被动执行
```

### 新模式：自主导航
```
用户: "给这家公司发开发信"
Agent: 扫描 _index.md → 发现属于 outreach 领域
      → 读取 _index-outreach.md → 定位 cold-email-generator
      → 看到导航链：上游 ← company-research → 检查是否有背调
      → 有背调 → 读取 cold-email-generator/SKILL.md
      → 看到导航链：下游 → email-sender → 自动串联
      → 动态构建上下文：背调结果 + 开发信模板 + 邮件配置
```

## 兼容性

- **打包管线不变**：每个技能仍是独立目录 + SKILL.md
- **增量同步不变**：SHA-256 hash 机制照常工作
- **向后兼容**：旧版 Agent 忽略 `_index*.md` 和 `[[Wiki-link]]`，仍按原方式工作
- **渐进迁移**：无需一次性改造全部 93 个技能，Wiki-link 逐步添加

## 后续演进

1. **全量 Wiki-link 覆盖**：为剩余 80+ 技能添加语义导航链
2. **references/ 拆分**：将大文件（>400 行）的详细内容拆分到 references/
3. **YAML 标准化**：统一所有 SKILL.md 的 frontmatter 字段
4. **Usage 统计**：基于 CodeGraph 分析技能调用频率，优化图结构

## 参考

- Heinrich @arscontexta: [Skill Graphs > SKILL.md](https://x.com/arscontexta)
- 本项目 SKILL-FORMAT-STANDARD.md：技能格式标准
- Skill Graph 三层原子元素：Wiki-link + YAML frontmatter + MOC

---

_Version: 1.0.0 | 2026-05-21_
