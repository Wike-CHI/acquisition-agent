# 红龙获客系统完整架构

> 按需加载。需要理解系统内部机制时读取此文件。

---

## 1. Skills Router（技能路由器）

**配置文件**: `references/ROUTING-TABLE.yaml`
**使用说明**: `SKILLS-ROUTER.md`

> v2.4.0 变更：路由配置从 JS 代码迁移为纯 YAML 声明式配置。
> AI Agent 读取 YAML 做路由决策，无需运行任何代码。
> 旧文件 `lib/skills-router.js` 已标记为 deprecated，仅供参考。

### 路由流程

```
用户请求
    ↓
Step 1: 意图识别 — 匹配 intents 中的关键词
    ↓
Step 2: 条件判断 — 根据市场/平台/需求选择技能
    ↓
Step 3: 技能选择 — 按 priority 排序，选最高可用
    ↓
Step 4: 读取目标技能 SKILL.md → 按步骤执行
    ↓
Step 5: 故障切换 — 不可用时查 fallback_map
```

### 路由表摘要

完整配置见 `references/ROUTING-TABLE.yaml`，以下为摘要：

| 意图 | 海外首选 | 国内首选 | 故障备选 |
|------|----------|----------|----------|
| customer_discovery | teyi-customs (P5) | exa-search (P5) | exa-search |
| company_research | teyi-customs (P5) | company-research (P5) | exa-search |
| decision_maker_search | exa-search (P5) | exa-search (P5) | company-research |
| email_outreach | cold-email-generator (P5) | email-sender (P5) | delivery-queue |
| social_media_outreach | ai-social-media-content (P5) | ai-social-media-content (P5) | 按平台备选 |
| full_pipeline | acquisition-coordinator (P5) | acquisition-coordinator (P5) | 无 |

### 铁律配置

8条铁律定义在 `ROUTING-TABLE.yaml` 的 `iron_rules` 节，每条标注阻断阶段和是否阻断。

### 故障切换映射

定义在 `ROUTING-TABLE.yaml` 的 `fallback_map` 节：

| 主技能 | 备选顺序 |
|--------|----------|
| teyi-customs | exa-search |
| linkedin | exa-search |
| facebook-acquisition | exa-search |
| email-sender | delivery-queue |
| cold-email-generator | email-outreach-ops |

---

## 2. ContextManager（上下文管理器）

**文件**: `lib/context-manager.js`

### 4层防护

```javascript
class ContextManager {
  constructor(options = {}) {
    this.compressor = new ContextCompressor();      // 1. 上下文压缩
    this.skillLoader = new LayeredSkillLoader();  // 2. 分层技能加载
    this.anchor = new TaskStateAnchor();         // 3. 任务状态锚定
    this.evolutionCoordinator = new SkillEvolutionCoordinator(); // 4. 自进化
    this.mode = options.mode || 'memskill';
  }
}
```

### TaskStateAnchor 锚点结构

```javascript
anchor = {
  critical: {           // 永不压缩
    goal: task.goal,           // 任务目标
    target: task.target,        // 目标客户
    constraints: task.constraints, // 约束条件
    success: task.success       // 成功标准
  },
  state: { currentStep: 0, totalSteps: 0, status: 'running' },
  keyData: {
    customers: [],   // 最多5个
    products: [],   // 最多3个
    decisions: []    // 最多5个
  },
  history: []
};
```

### 效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 上下文使用率 | 110% | 35% |
| 任务成功率 | 50% | 95% |
| 信息丢失率 | 30% | 0% |

---

## 3. ExecutionController（ECL执行控制层）

**文件**: `~/.agent-reach/execution-controller.js`

### 健康指标

| 指标 | 正常值 | 异常阈值 |
|------|--------|----------|
| 平均置信度 | ≥ 0.7 | < 0.6 |
| 循环检测触发 | 0次/天 | ≥3次/天 |
| 状态变化率 | ≥60% | <40% |
| 待审批项 | <5 | ≥10 |

### CLI

```bash
node ~/.agent-reach/execution-cli.js stats   # 查看统计
node ~/.agent-reach/execution-cli.js test    # 测试
node ~/.agent-reach/execution-cli.js next <customer_id> <state> <icp_score>  # 下一步
```

---

## 4. SkillEvolutionCoordinator（自进化）

**文件**: `lib/skill-evolution-coordinator.js`

### 核心循环

```
流程执行 → 收集反馈(1-5星) → 分析建议 → 自我优化 → GitHub提交
```

### 反馈处理

| 评分 | 动作 |
|------|------|
| ⭐ | 紧急优化，立即修复 |
| ⭐⭐ | 深度优化，制定方案 |
| ⭐⭐⭐ | 常规优化，下次处理 |
| ⭐⭐⭐⭐ | 记录为最佳实践 |
| ⭐⭐⭐⭐⭐ | 推广为标准流程 |

### 核心组件

```javascript
this.skillController = new SkillController();      // 10个基础技能
this.memoryExecutor = new MemoryExecutor();         // 技能条件化记忆
this.hardCaseMiner = new HardCaseMiner();           // 困难案例挖掘
this.skillDesigner = new SkillDesigner();            // 技能模板库
```

---

## 5. 7层上下文系统

```
L1. IDENTITY  → 公司身份（HOLO红龙，品牌、联系方式）
L2. SOUL      → AI人格（红龙小助手身份）
L3. AGENTS    → 销售工作流手册（产品知识+话术模板）
L4. USER      → 负责人画像（wike业务偏好）
L5. HEARTBEAT → 自动化巡检（每分钟，含ECL检查）
L6. MEMORY    → 跨会话持久记忆
L7. TOOLS     → 工具使用指南、权限
```

---

## 6. 17个核心lib工具

```
context-manager.js           # 上下文管理器（整合）
task-state-anchor.js        # 任务状态锚定
context-compressor.js        # 上下文压缩
layered-skill-loader.js      # 分层技能加载
skills-router.js             # 技能路由器
skill-evolution-coordinator.js  # 自进化协调
skill-controller.js         # 技能选择控制
memory-executor.js           # 技能条件化记忆
hard-case-miner.js           # 困难案例挖掘
skill-designer.js            # 技能模板设计
quotation-generator.js       # 报价单生成器
customer-manager.js          # 客户管理器
email-polisher.js           # 开发信润色器
checkpoint-manager.js        # 检查点管理
knowledge-graph.js          # 知识图谱
incremental-learning.js       # 增量学习
dependency-health-checker.js  # 依赖健康检查
```

---

## 7. 内嵌子技能集群

| 技能 | 功能 |
|------|------|
| `skills/acquisition-coordinator/` | 获客任务协调器，拆解任务派发Agent |
| `skills/acquisition-workflow/` | 定义端到端流程、质量检查点 |
| `skills/acquisition-init/` | 初始化引导（首次配置凭据/NAS/邮箱）|
| `skills/teyi-customs/` | 特易海关数据挖掘 |
| `skills/facebook-acquisition/` | Facebook客户搜索 |
| `skills/instagram-acquisition/` | Instagram视觉获客 |

---

## 8. 5种官方Skill设计模式

| 模式 | 应用位置 |
|------|---------|
| **模式一：引导式流程** | SKILL.md第1节 + FALLBACK-PLAN.md |
| **模式二：决策者定位** | LINKEDIN-DECISION-MAKER-GUIDE.md |
| **模式三：反复打磨** | EMAIL-QUALITY-CHECK.md |
| **模式四：智能路由** | CHANNEL-ROUTER.md + SKILLS-ROUTER.md |
| **模式五：竞品分析** | COMPETITOR-ANALYSIS-GUIDE.md |

---

## 9. 7层上下文配置（v2.1.0 新增）

> v2.1.0 新增。所有配置文件位于 `context/` 目录，均为 MD 文件格式。

### 配置目录结构

```
global-customer-acquisition/
├── ANTI-AMNESIA.md              # 4层抗遗忘技术规范索引 ⭐ v2.1.0
├── context/                      # ⭐ v2.1.0 7层MD配置文件
│   ├── README.md                # 加载顺序说明
│   ├── identity.md              # L1: 公司身份（已知值写死）
│   ├── soul.md                 # L2: AI人格
│   ├── agents.md               # L3: 销售手册索引
│   ├── user.md                 # L4: 业务员信息（姓名/邮箱需填）
│   ├── heartbeat.md            # L5: 定时任务索引
│   ├── memory.md               # L6: 4层记忆配置
│   └── tools.md                # L7: 工具层配置
└── skills/                      # 技能集群
    ├── chroma-memory/           # ⭐ L3+L4向量存储
    ├── supermemory/             # ⭐ L1增强记忆层
    └── ...
```

### MD 配置 vs 旧方案

| 旧方案 | v2.1.0 | 优势 |
|--------|---------|------|
| IDENTITY.md（分散在~/.workbuddy/）| `context/identity.md` | ✅ 可打包，✅ 已知值写死 |
| SOUL.md / USER.md（含个人信息）| `context/*.md` | ✅ 只有 user.md 需填个人信息 |
| 无HEARTBEAT规范 | `context/heartbeat.md` | ✅ 13个任务完整定义 |
| 无4层抗遗忘规范 | ANTI-AMNESIA.md | ✅ 完整技术规范 |

### 使用说明

- `identity.md` / `soul.md` / `agents.md` / `memory.md` / `tools.md` / `heartbeat.md`：无需修改
- `user.md`：填写业务员姓名和邮箱即可

### 4层抗遗忘系统架构

```
每轮对话结束
    ↓
L1: MemOS 结构化内存 → 客户/阶段/承诺/异议 → 注入上下文
    ↓
L2: 主动摘要压缩 → Token ≥ 65% → 零损失压缩
    ↓
L3: ChromaDB 向量存储 → 每轮对话 + 自动标签 + 语义检索
    ↓
每天 12:00 → L4: CRM 每日快照 → ChromaDB 灾难恢复备份
```

---

## 10. 技能集群索引（v2.1.0 新增）

| 优先级 | 技能 | 位置 | 实现层 |
|--------|------|------|--------|
| P0 | `ANTI-AMNESIA.md` | 根目录 | 4层规范索引 |
| P0 | `chroma-memory` | `skills/chroma-memory/` | L3 + L4 |
| P1 | `supermemory` | `skills/supermemory/` | L1 增强 |
| P1 | `delivery-queue` | `skills/delivery-queue/` | 分段发送 |
| P1 | `cold-email-generator` | `skills/cold-email-generator/` | 开发信生成 |
| P2 | `acquisition-coordinator` | `skills/acquisition-coordinator/` | 任务协调 |
| P2 | `acquisition-workflow` | `skills/acquisition-workflow/` | 流程定义 |
| P2 | `company-research` | `skills/company-research/` | 企业背调 |
| P2 | `deep-research` | `skills/deep-research/` | 深度调研 |
| P2 | `humanize-ai-text` | `skills/humanize-ai-text/` | 文本润色 |

---

## 11. 三层记忆系统（v2.3.0 新增）⭐

> v2.3.0 整合 self-improving-proactive-agent 的自我更新优化机制。

### 记忆系统架构

```
HOT（确认的持久化规则） → WARM（领域级/项目级学习） → COLD（冷存储）
```

### 目录结构

```
global-customer-acquisition/
├── learning-system/              # ⭐ v2.3.0 三层记忆系统
│   ├── HOT/                      # 确认的持久化规则和偏好
│   │   ├── memory.md            # 5大核心规则 + 2大偏好
│   │   ├── corrections.md       # 7个纠正项
│   │   ├── index.md             # 存储映射和主题索引
│   │   ├── customer-icp.md      # 目标客户群体ICP ⭐
│   │   └── anti-stuck-mechanisms.md  # 8大防卡顿机制 ⭐
│   ├── WARM/                     # 领域级/项目级学习
│   │   ├── domains/             # 领域级学习
│   │   │   ├── usa-market-learning.md    # 美国市场获客经验 ⭐
│   │   │   ├── linkedin-search-learning.md  # LinkedIn搜索最佳实践
│   │   │   └── email-quality-learning.md    # 开发信质量标准
│   │   └── projects/            # 项目级学习
│   │       └── honglong-icp-learning.md     # 红龙ICP定义
│   ├── COLD/                     # 冷存储
│   │   ├── archive/             # 归档
│   │   └── graveyard/           # 已废弃
│   └── working-buffer.md        # 挥发性面包屑（会话上下文恢复）
│
├── proactivity/                  # ⭐ v2.3.0 proactivity系统
│   ├── memory.md               # 激活规则和边界保护
│   ├── session-state.md        # 当前目标、决策、阻塞、下一步
│   ├── heartbeat.md            # 心跳维护规则
│   ├── patterns.md             # 5个可重用成功模式
│   └── log.md                  # 近期主动行动记录
│
└── SELF-EVOLUTION-SYSTEM.md    # 自进化循环（6步 → 7步）⭐
```

### HOT 记忆（5大核心规则）

| 规则 | 说明 | 来源 |
|------|------|------|
| **1. 无邮箱不进入开发信步骤** | Step 3后强制检查，无邮箱停止 | 美国市场获客 |
| **2. 报价灵活，不硬性推销** | 根据客户类型定制报价策略 | 美国市场获客 |
| **3. 避免矿业客户** | 15,885家客户数据验证，0家矿业客户 | 客户群体分析 |
| **4. LinkedIn决策人用Exa** | Exa Free via mcporter（无需API Key） | 纠正记录 |
| **5. 开发信生成v2.0** | 强制润色 + 评分≥9.0分 | 功能重构 |

### 5种学习信号分类

| 信号类型 | 存储位置 | 晋升速度 | 优先级 |
|---------|---------|---------|--------|
| **显式纠正** | HOT/memory.md | 立即HOT | P0 |
| **明确偏好** | HOT/memory.md | 重复2次→HOT | P1 |
| **成功工作流** | WARM/projects/ | 重复3次→HOT | P2 |
| **自我反思** | WARM/domains/ | 重复3次→HOT | P2 |
| **用户反馈** | WARM/projects/ | 根据评分决定 | P1 |

### 自动晋升/降级机制

**晋升规则**：
- 重复3次在7天内 → 晋升到 HOT
- 重复使用的 pattern（重复3次以上）→ 晋升到 SKILL.md

**降级规则**：
- 未使用30天 → 降级到 WARM
- 未使用90天 → 归档到 COLD

### proactivity系统（5个可重用模式）

1. **主动激活规则**：在获客流程开始前主动检查配置
2. **自动上下文恢复**：working-buffer.md 自动恢复会话上下文
3. **智能失败重试**：自动重试队列（1h→2h→4h）
4. **主动最佳实践推广**：重复3次以上自动晋升到 SKILL.md
5. **定期心跳维护**：每日/每周/每月检查系统状态

### 整合效果

| 项目 | 整合前 | 整合后 | 改善 |
|------|--------|--------|------|
| **学习系统** | ❌ 无系统化学习 | **✅ 三层记忆系统** | ⭐⭐⭐⭐⭐ |
| **学习信号** | ❌ 只有用户反馈 | **✅ 5种学习信号** | ⭐⭐⭐⭐⭐ |
| **晋升/降级** | ❌ 无自动机制 | **✅ 自动晋升/降级** | ⭐⭐⭐⭐⭐ |
| **上下文恢复** | ⭐⭐ 手动查找 | **✅ 自动恢复** | ⭐⭐⭐⭐ |
| **心跳维护** | ❌ 无 | **✅ 定期检查** | ⭐⭐⭐⭐⭐ |
| **主动系统** | ❌ 无 | **✅ 5个模式** | ⭐⭐⭐⭐⭐ |

---

_更新时间：2026-04-03_
_版本: v2.4.0_
_状态: 路由器已迁移至YAML声明式配置，子技能调用已去sessions_spawn_
