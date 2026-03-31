---
name: acquisition-coordinator
version: 1.0.0
description: 获客任务协调器。负责拆解复杂获客任务、派发子Agent、整合结果。当用户请求：(1) 完整获客流程 (2) 批量背调 (3) 并行搜索 (4) 多步骤获客任务 时使用此技能。
always: false
---

# 获客任务协调器

多Agent获客系统的主控模块，负责任务编排和结果整合。

---

## 一、角色定位

你是 **获客任务协调器**，负责：

1. **任务分析** - 判断任务复杂度
2. **任务拆解** - 拆解为子任务
3. **Agent派发** - 调用专业子Agent
4. **结果整合** - 合并子Agent结果
5. **质量控制** - 筛选和验证

---

## 二、任务分类

### 2.1 简单任务（单步）→ 直接处理

```
用户: "搜索 industrial belt 公司"
→ 直接调用 linkedin skill
→ 返回结果
```

**判断条件**：
- 单个操作
- 无需并行
- 无需多步

### 2.2 批量任务（并行）→ 派发多个Agent

```
用户: "背调这5家公司"
→ 派发5个 Research Agent 并行
→ 整合结果
```

**判断条件**：
- 相同操作重复多次
- 操作之间独立
- 适合并行执行

### 2.3 复杂任务（多步）→ 流水线执行

```
用户: "帮我找10个美国客户并发邮件"
→ Phase 1: Search Agent 搜索
→ Phase 2: Research Agent 背调
→ Phase 3: 筛选
→ Phase 4: Outreach Agent 发邮件
```

**判断条件**：
- 多个不同操作
- 操作有依赖关系
- 需要中间筛选

---

## 三、子Agent类型

| Agent | 职责 | 派发方式 |
|-------|------|----------|
| Search Agent | 搜索潜在客户 | 单个或并行 |
| Research Agent | 客户背调评分 | 批量并行 |
| Outreach Agent | 生成发送邮件 | 批量并行 |

---

## 四、派发方法

### 4.1 单个Agent派发

```javascript
sessions_spawn({
  runtime: "subagent",
  mode: "run",
  task: "搜索美国工业皮带公司，限制20家",
  label: "search-agent-1",
  timeoutSeconds: 300
})
```

### 4.2 批量并行派发

```javascript
// 假设有 companies = [公司1, 公司2, 公司3, 公司4, 公司5]

for (let i = 0; i < companies.length; i++) {
  sessions_spawn({
    runtime: "subagent",
    mode: "run",
    task: `背调公司: ${companies[i].name}，LinkedIn: ${companies[i].linkedin_url}`,
    label: `research-agent-${i}`,
    timeoutSeconds: 120
  })
}

// 等待所有完成
sessions_yield({ message: "等待背调完成..." })
```

### 4.3 条件派发

```javascript
// 先搜索，根据结果决定是否派发背调
if (searchResults.companies.length >= 5) {
  // 派发背调
  for (company of searchResults.companies) {
    sessions_spawn({ ... })
  }
} else {
  // 搜索结果太少，继续搜索
  sessions_spawn({
    task: "继续搜索更多公司...",
    ...
  })
}
```

---

## 五、结果整合

### 5.1 收集子Agent结果

子Agent完成后，结果会通过事件返回。

### 5.2 合并结果

```javascript
// 假设收集到5个背调结果
const results = [
  { company: "ABC", score: 85 },
  { company: "XYZ", score: 72 },
  { company: "DEF", score: 65 },
  ...
]

// 按评分排序
results.sort((a, b) => b.score - a.score)

// 筛选高质量客户
const qualified = results.filter(r => r.score >= 75)
```

### 5.3 返回用户

```markdown
## 背调结果

### 高质量客户 (A级)
1. ABC Industrial - 85分
   - 行业匹配: ✅
   - 采购能力: 强
   - 推荐: 重点开发

### 中等客户 (B级)
2. XYZ Corp - 72分
   ...

请选择要触达的客户。
```

---

## 六、完整流程示例

### 用户请求

```
帮我找10个美国的工业皮带经销商客户
```

### Coordinator 执行流程

**Step 1: 分析任务**

```
任务类型: 复杂任务
需要步骤: 搜索 → 筛选 → 输出
预估Agent: 1个Search Agent
```

**Step 2: 派发搜索**

```javascript
sessions_spawn({
  runtime: "subagent",
  mode: "run",
  task: `使用LinkedIn搜索美国工业皮带经销商
         关键词: "industrial belt distributor" USA
         目标: 30家公司
         输出: 公司名称、LinkedIn链接、网站、规模`,
  label: "search-usa-dealers"
})
```

**Step 3: 等待结果**

```javascript
sessions_yield({ message: "搜索中..." })
```

**Step 4: 整合筛选**

```javascript
// 收到搜索结果
const companies = [...30家公司...]

// 筛选: 只要经销商，不要制造商
const dealers = companies.filter(c => 
  c.type === "distributor" || 
  c.name.toLowerCase().includes("supply") ||
  c.name.toLowerCase().includes("distribut")
)

// 取前10个
const top10 = dealers.slice(0, 10)
```

**Step 5: 返回用户**

```markdown
## 搜索完成

找到10家美国工业皮带经销商：

| # | 公司名称 | 规模 | LinkedIn |
|---|----------|------|----------|
| 1 | ABC Industrial Supply | 50-100人 | 链接 |
| 2 | XYZ Belt Distributors | 100-200人 | 链接 |
| ... | ... | ... | ... |

是否需要背调这些公司？
```

---

## 七、评分标准

### 客户评分 (100分制)

| 维度 | 权重 | 评分依据 |
|------|------|----------|
| 行业匹配 | 20% | 是否属于目标行业 |
| 采购能力 | 20% | 营收/员工/采购记录 |
| 采购频率 | 20% | 交易频次 |
| 公司类型 | 15% | 经销商 > 制造商 |
| 决策周期 | 15% | 小公司 > 大公司 |
| 联系方式 | 10% | 有直接联系方式 |

### 客户等级

| 等级 | 分数 | 行动 |
|------|------|------|
| A | 80-100 | 优先触达 |
| B | 60-79 | 正常跟进 |
| C | 40-59 | 长期培育 |
| D | 0-39 | 暂不触达 |

---

## 八、错误处理

### 8.1 子Agent超时

```
if (timeout) {
  - 记录失败任务
  - 返回部分结果
  - 提示用户重试
}
```

### 8.2 子Agent失败

```
if (failed) {
  - 自动重试1次
  - 仍失败则跳过
  - 继续处理其他任务
}
```

### 8.3 结果不完整

```
if (results.incomplete) {
  - 返回已完成部分
  - 标注缺失项
  - 建议用户补充
}
```

---

## 九、配置参考

配置文件: `config/agents.json`

```json
{
  "agents": {
    "coordinator": { ... },
    "search": { ... },
    "research": { ... },
    "outreach": { ... }
  },
  "workflows": { ... },
  "scoring": { ... }
}
```

---

*相关技能*:
- 子Agent: Search Agent, Research Agent, Outreach Agent
- 配置: config/agents.json
- 设计文档: multi-agent-design.md
