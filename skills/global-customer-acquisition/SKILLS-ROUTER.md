# Skills Router 集成指南

> 将 skills-router 集成到获客技能集群
> 更新时间: 2026-03-27

---

## 🎯 Skills Router 作用

Skills Router 负责：
1. **技能路由** - 根据用户需求自动选择技能
2. **任务分发** - 将任务分发给合适的技能
3. **结果聚合** - 整合多个技能的结果

---

## 📁 已集成的路由功能

### 1. 智能路由（CHANNEL-ROUTER.md）

**功能**: 自动选择最佳获客渠道

```javascript
// 智能路由逻辑
if (国内客户) {
    return ['微博', '微信公众号', 'V2EX'];
} else if (海外客户 + 采购记录) {
    return ['特易海关数据', 'LinkedIn', 'Exa'];
} else if (海外客户 + 决策人) {
    return ['LinkedIn MCP', 'Exa索引'];
}
```

**文件**: `CHANNEL-ROUTER.md` (10 KB)

---

### 2. 获客任务协调器（acquisition-coordinator）

**功能**: 拆解任务、派发Agent、整合结果

**任务分类**:
- 简单任务（单步）→ 直接处理
- 批量任务（并行）→ 派发多个Agent
- 复杂任务（多步）→ 流水线执行

**子Agent类型**:
| Agent | 职责 | 派发方式 |
|-------|------|----------|
| Search Agent | 搜索潜在客户 | 单个或并行 |
| Research Agent | 客户背调评分 | 批量并行 |
| Outreach Agent | 生成发送邮件 | 批量并行 |

**文件**: `skills/acquisition-coordinator/SKILL.md`

---

## 🔧 Skills Router 设计

### 完整路由架构

```
用户请求
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Skills Router                                              │
├─────────────────────────────────────────────────────────────┤
│  1. 意图识别                                                 │
│     ├── 客户发现 → Search Skills                           │
│     ├── 企业背调 → Research Skills                         │
│     ├── 决策人搜索 → LinkedIn Skills                       │
│     ├── 开发信生成 → Email Skills                          │
│     └── 完整流程 → Coordinator                              │
│                                                             │
│  2. 技能选择                                                 │
│     ├── 根据市场（国内/海外）                               │
│     ├── 根据需求（采购记录/决策人/背调）                   │
│     └── 根据平台可用性                                      │
│                                                             │
│  3. 任务分发                                                 │
│     ├── 单技能 → 直接调用                                  │
│     ├── 多技能并行 → sessions_spawn (并行)                │
│     └── 多技能串行 → 流水线执行                            │
│                                                             │
│  4. 结果聚合                                                 │
│     ├── 合并结果                                           │
│     ├── 去重                                               │
│     └── 质量筛选                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 技能路由表

### 客户发现技能

| 市场类型 | 推荐技能 | 优先级 | 状态 |
|----------|----------|--------|------|
| **国内** | 微博搜索 | ⭐⭐⭐⭐ | ✅ 可用 |
| **国内** | 微信公众号 | ⭐⭐⭐ | ✅ 可用 |
| **海外** | LinkedIn MCP | ⭐⭐⭐⭐⭐ | ✅ 运行中 |
| **海外** | Facebook | ⭐⭐⭐⭐ | ⚠️ 需配置 |
| **海外** | Instagram | ⭐⭐⭐ | ⚠️ 需配置 |
| **全球** | Exa搜索 | ⭐⭐⭐⭐ | ✅ 可用 |

### 企业背调技能

| 需求 | 推荐技能 | 优先级 | 状态 |
|------|----------|--------|------|
| **采购记录** | 特易海关数据 | ⭐⭐⭐⭐⭐ | ✅ 可用 |
| **企业信息** | Jina Reader | ⭐⭐⭐⭐ | ✅ 可用 |
| **市场分析** | Exa搜索 | ⭐⭐⭐⭐ | ✅ 可用 |
| **竞品分析** | 特易海关数据 | ⭐⭐⭐⭐⭐ | ✅ 可用 |

### 决策人搜索技能

| 平台 | 推荐技能 | 优先级 | 状态 |
|------|----------|--------|------|
| **LinkedIn** | LinkedIn MCP | ⭐⭐⭐⭐⭐ | ✅ 运行中 |
| **LinkedIn** | Exa索引 | ⭐⭐⭐⭐ | ✅ 可用（备选）|

### 开发信技能

| 功能 | 推荐技能 | 优先级 | 状态 |
|------|----------|--------|------|
| **生成** | cold-email-generator | ⭐⭐⭐⭐ | ✅ 可用 |
| **质量检查** | EMAIL-QUALITY-CHECK | ⭐⭐⭐⭐⭐ | ✅ 可用 |
| **发送** | email-sender | ⭐⭐⭐⭐ | ✅ 可用 |

---

## 🚀 使用示例

### 示例1: 自动路由到最佳技能

```
用户: 批量获客：美国输送带制造商，10家

Skills Router:
1. 意图识别: 客户发现 + 海外市场
2. 技能选择:
   - 特易海关数据（采购记录）⭐⭐⭐⭐⭐
   - LinkedIn MCP（决策人）⭐⭐⭐⭐⭐
   - Exa搜索（企业背调）⭐⭐⭐⭐
3. 任务分发: 并行调用3个技能
4. 结果聚合: 合并 + 去重 + ICP评分

输出:
- 找到 50 家客户
- 背调完成 10 家
- A级客户 3 家
```

---

### 示例2: 智能切换技能

```
用户: LinkedIn搜索：Ace Belting Company

Skills Router:
1. 意图识别: 决策人搜索
2. 技能选择: LinkedIn MCP
3. 检查状态: LinkedIn MCP 不可用（浏览器初始化中）
4. 自动切换: Exa索引（备选技能）
5. 执行搜索

输出:
⚠️ LinkedIn MCP 不可用
✅ 自动切换到 Exa索引
找到 2 个决策人
```

---

## 🔧 集成实现

### 1. 在 SKILL.md 中添加路由逻辑

```yaml
triggers:
  - 批量获客
  - 客户发现
  - 企业背调
  - LinkedIn搜索
  - 开发信

routing:
  intent_detection:
    - keywords: ["获客", "搜索", "找客户"]
      intent: "customer_discovery"
    - keywords: ["背调", "评估", "ICP"]
      intent: "company_research"
    - keywords: ["决策人", "LinkedIn", "联系人"]
      intent: "decision_maker_search"

  skill_selection:
    customer_discovery:
      - market: "国内"
        skills: ["weibo", "wechat"]
      - market: "海外"
        skills: ["teyi-customs", "linkedin", "exa"]
    
    company_research:
      - need: "采购记录"
        skills: ["teyi-customs"]
      - need: "企业信息"
        skills: ["jina-reader", "exa"]
```

---

### 2. 创建路由器脚本

```javascript
// skills-router.js

class SkillsRouter {
  constructor() {
    this.skills = {
      'weibo': { available: true, priority: 4 },
      'exa': { available: true, priority: 4 },
      'linkedin': { available: false, priority: 5 },
      'teyi': { available: true, priority: 5 },
      'facebook': { available: false, priority: 4 },
      'instagram': { available: false, priority: 3 }
    };
  }

  // 意图识别
  detectIntent(userRequest) {
    if (userRequest.includes('获客') || userRequest.includes('搜索')) {
      return 'customer_discovery';
    } else if (userRequest.includes('背调') || userRequest.includes('评估')) {
      return 'company_research';
    } else if (userRequest.includes('决策人') || userRequest.includes('LinkedIn')) {
      return 'decision_maker_search';
    }
  }

  // 技能选择
  selectSkills(intent, market) {
    const routingTable = {
      'customer_discovery': {
        '国内': ['weibo', 'wechat'],
        '海外': ['teyi', 'linkedin', 'exa']
      },
      'company_research': {
        '采购记录': ['teyi'],
        '企业信息': ['jina-reader', 'exa']
      }
    };

    const candidateSkills = routingTable[intent]?.[market] || [];
    
    // 过滤可用技能
    return candidateSkills
      .filter(skill => this.skills[skill]?.available)
      .sort((a, b) => this.skills[b].priority - this.skills[a].priority);
  }

  // 自动切换
  autoSwitch(primarySkill, fallbackSkills) {
    if (this.skills[primarySkill]?.available) {
      return primarySkill;
    }
    
    // 查找第一个可用的备选技能
    for (const skill of fallbackSkills) {
      if (this.skills[skill]?.available) {
        console.log(`⚠️ ${primarySkill} 不可用，切换到 ${skill}`);
        return skill;
      }
    }
    
    return null;
  }

  // 执行技能
  async executeSkill(skillName, params) {
    // 调用对应技能
    switch (skillName) {
      case 'weibo':
        return await mcporter.call(`weibo.search_users`, params);
      case 'exa':
        return await mcporter.call(`exa.web_search_exa`, params);
      case 'teyi':
        return await this.executeTeyi(params);
      default:
        throw new Error(`Unknown skill: ${skillName}`);
    }
  }
}

module.exports = SkillsRouter;
```

---

## ✅ 集成检查

| 检查项 | 状态 |
|--------|------|
| **智能路由（CHANNEL-ROUTER.md）** | ✅ 已集成 |
| **获客协调器（acquisition-coordinator）** | ✅ 已集成 |
| **Skills Router 脚本** | ✅ 已落地 `lib/skills-router.js` |
| **路由表配置** | ✅ 内置于 `lib/skills-router.js` |
| **自动切换逻辑** | ✅ 已实现（FALLBACK_MAP + applyAvailability） |
| **测试覆盖** | ✅ 29个测试全部通过 `tests/test-skills-router.js` |

---

## 📦 已落地的文件

- `lib/skills-router.js` - 核心路由器（意图识别 + 渠道选择 + 故障切换）
- `tests/test-skills-router.js` - 测试套件（7组场景，29个断言）

## 🚀 使用方法

```javascript
const { SkillsRouter, route } = require('./lib/skills-router');

// 方式1: 快速路由（单例）
const result = route('搜索美国传送带制造商');
console.log(result.summary);

// 方式2: 实例化（可动态更新状态）
const router = new SkillsRouter();
router.markAvailable('linkedin'); // LinkedIn 服务启动后调用
const result = router.route('LinkedIn搜索采购负责人');
```

---

_更新时间: 2026-03-30_
_集成状态: ✅ 完全落地_
