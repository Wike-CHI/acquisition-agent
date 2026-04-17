# 红龙获客系统完整架构（学习指南版）

> 本文件是主技能 `HOLO-AGENT` references/ARCHITECTURE.md 的精简学习版。
> 完整版请参考：`C:\Users\Administrator\.workbuddy\skills\global-customer-acquisition\references\ARCHITECTURE.md`

---

## 1. Skills Router（技能路由器）

### 核心路由表

```javascript
const ROUTING_TABLE = {
  customer_discovery: {
    overseas: [
      { skill: 'teyi',        priority: 5, desc: '特易海关数据' },
      { skill: 'exa-search',   priority: 5, desc: 'Exa语义搜索' },
      { skill: 'facebook',     priority: 4, desc: 'Facebook' }
    ]
  },
  company_research: {
    overseas: [
      { skill: 'teyi',        priority: 5, desc: '特易海关' },
      { skill: 'exa-search',   priority: 4, desc: 'Exa' }
    ]
  },
  decision_maker_search: {  // ⭐ 关键：国内/海外都用Exa
    domestic:  [{ skill: 'exa-search', priority: 5 }],
    overseas:  [{ skill: 'exa-search', priority: 5 }]
  },
  email_outreach: {
    overseas: [
      { skill: 'delivery-queue',     priority: 5 },
      { skill: 'email-sender',       priority: 4 },
      { skill: 'email-outreach-ops', priority: 3 }
    ]
  },
  social_media_outreach: {
    facebook: [
      { skill: 'ai-social-media-content', priority: 5 },
      { skill: 'facebook-acquisition',     priority: 4 }
    ],
    instagram: [{ skill: 'ai-social-media-content', priority: 5 }],
    linkedin: [
      { skill: 'ai-social-media-content', priority: 5 },
      { skill: 'linkedin-writer',          priority: 4 }
    ]
  },
  full_pipeline: {
    overseas: [{ skill: 'acquisition-coordinator', priority: 5 }]
  }
};

// 故障切换映射
const FALLBACK_MAP = {
  'linkedin': ['exa-search'],
  'teyi': ['exa-search', 'customs'],
  'email-sender': ['delivery-queue'],
  'ai-social-media-content': ['facebook-acquisition']
};
```

---

## 2. ContextManager（上下文管理器）

### 4层防护

```javascript
class ContextManager {
  constructor(options = {}) {
    this.compressor = new ContextCompressor();      // 1. 上下文压缩
    this.skillLoader = new LayeredSkillLoader();    // 2. 分层技能加载
    this.anchor = new TaskStateAnchor();            // 3. 任务状态锚定
    this.evolutionCoordinator = new SkillEvolutionCoordinator(); // 4. 自进化
  }
}
```

### 效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 上下文使用率 | 110% | 35% |
| 任务成功率 | 50% | 95% |
| 信息丢失率 | 30% | 0% |

---

## 3. ECL执行控制层

### 健康指标

| 指标 | 正常值 | 异常阈值 |
|------|--------|----------|
| 平均置信度 | ≥ 0.7 | < 0.6 |
| 循环检测触发 | 0次/天 | ≥3次/天 |
| 状态变化率 | ≥60% | <40% |

---

## 4. 7层上下文系统

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

## 5. 子技能集群

| 技能 | 功能 |
|------|------|
| `acquisition-coordinator` | 获客任务协调器，拆解任务派发Agent |
| `acquisition-workflow` | 定义端到端流程、质量检查点 |
| `acquisition-init` | 初始化引导（首次配置凭据/NAS/邮箱）|
| `acquisition-evaluator` | 验收Agent，评估其他Agent工作质量 |
| `teyi-customs` | 特易海关数据挖掘 |
| `facebook-acquisition` | Facebook客户搜索 |
| `instagram-acquisition` | Instagram视觉获客 |
| `cold-email-generator` | 开发信生成v2.0 |
| `ai-social-media-content` | AI社媒内容生成（9平台） |
| `email-sender` | 邮件自动发送 |
| `delivery-queue` | 分段发送队列 |

---

## 6. 三层记忆系统（v2.3.0）

```
HOT（确认的持久化规则） → WARM（领域级/项目级学习） → COLD（冷存储）
```

### HOT 记忆（5大核心规则）

| 规则 | 说明 | 来源 |
|------|------|------|
| 1. 无邮箱不进入开发信步骤 | Step 3后强制检查 | 美国市场获客 |
| 2. 报价灵活，不硬性推销 | 根据客户类型定制 | 美国市场获客 |
| 3. 避免矿业客户 | 15,885家客户数据验证 | 客户群体分析 |
| 4. LinkedIn决策人用Exa | Exa Free via mcporter | 纠正记录 |
| 5. 开发信生成v2.0 | 强制润色 + 评分≥9.0分 | 功能重构 |

### 5种学习信号分类

| 信号类型 | 存储位置 | 晋升速度 | 优先级 |
|---------|---------|---------|--------|
| **显式纠正** | HOT/memory.md | 立即HOT | P0 |
| **明确偏好** | HOT/memory.md | 重复2次→HOT | P1 |
| **成功工作流** | WARM/projects/ | 重复3次→HOT | P2 |
| **自我反思** | WARM/domains/ | 重复3次→HOT | P2 |
| **用户反馈** | WARM/projects/ | 根据评分决定 | P1 |

---

_版本：v3.1.0 | 同步至 HOLO-AGENT v2.3.0 | 更新时间：2026-04-03_
