# FBS-BookWriter 集成设计（`integration/`）

## 文档信息

| 属性 | 值 |
|------|-----|
| 状态 | 设计说明 |

---

## 1. 架构概述

### 1.1 设计目标

1. **场景扩展**：社媒、企业、调研等场景与统一路由对接
2. **统一入口**：经 `ScenarioRouter` / NLU 意图路由到对应场景
3. **服务注入**：质量检查、评分、工作流等由**调用方注入**，本目录不实现业务引擎
4. **独立演进**：各场景可独立开发与部署

### 1.2 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                    SKILL.md 统一入口                         │
│              （场景化扩展 + NLU 路由）                          │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   NLU 统一入口层                             │
│              (ScenarioRouter / 意图识别)                  │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐    ┌───────▼───────┐    ┌───────▼───────┐
│  社媒场景   │    │  企业场景   │    │  调研场景   │
│Social-Media   │    │  Enterprise   │    │  Research    │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   核心服务（由调用方提供）                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐  │
│  │ Workflow│ │ Quality │ │ Scoring │ │ Security│ │Preference│ │
│  │ Engine  │ │ Checker │ │Calculator│ │ Service │ │         │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 核心依赖模块（由调用方实现或注入）

下列模块不在本仓库随附；集成时通过依赖注入或外部包提供：

| 模块 | 职责 |
|------|------|
| WorkflowEngine | 工作流调度 |
| HeartbeatService | 心跳监控 |
| ResearchService | 调研编排 |
| GLayerChecker / PLayerChecker / CLayerChecker | 分层质量检查 |
| BLayerScorer / VCRChecker / ScoreCalculator | 篇级与视觉评分 |
| QualitySync / SkillOrchestrator | 质量同步与编排（若使用） |

对照说明见 [`references/05-ops/doc-code-consistency.md`](../references/05-ops/doc-code-consistency.md)。

### 2.1 质量检查器并行调用模式（示意）

```javascript
// S3 三审并行（示意）
const [gResult, pResult, cResult] = await Promise.all([
  performLayerCheck('G', content),
  performLayerCheck('P', content),
  performLayerCheck('C', content)
]);

// S5 终审并行（示意）
const [bResult, vcrResult] = await Promise.all([
  performLayerCheck('B', content),
  performVCRCheck(content)
]);
```

---

## 3. 场景化功能分析

### 3.1 社媒场景 (Social-Media)

**模块结构**:
```
scenarios/social-media/backend/
├── HotTopicTracker.js      # 热点追踪
├── SocialMediaGenerator.js  # 内容生成
├── PlatformAdapter.js       # 平台适配
├── BrandEmbeddingChecker.js # 品牌植入检查
└── index.js                 # 统一导出
```

**核心流程**:
1. 热点采集 → 热点评估 → 品牌植入规划 → 内容生成 → 多平台适配 → 质量审核

**扩展点**:
- `setLayerChecker(name, checker)` - 注入分层质量检查器（旧实现可能仍暴露 `setV7Checker`，适配层会择优调用）
- `setWebSearch(webSearchFn)` - 注入联网搜索能力

### 3.2 企业场景 (Enterprise)

**模块结构**:
```
scenarios/enterprise/backend/
├── brand/         # 品牌管理
├── checker/      # 企业内容检查
├── collaboration/ # 协作管理
├── commands/      # 企业命令
├── content/       # 内容管理
├── roles/        # 角色权限
├── style/        # 风格定制
├── training/     # 培训模块
└── workflow/     # 企业工作流
```

**核心流程**:
1. 培训手册生成 / 内外版本分离 / 多样化文体

**依赖**: 无独立入口时可回退到宿主注入的 `workflowEngine`（本仓库不自带该引擎实现）

### 3.3 调研场景 (Research)

**模块结构**:
```
scenarios/research/backend/
├── ResearchOrchestrator.js    # 调研编排器
├── MultiLangSearchEngine.js   # 多语言搜索
├── CaseValidator.js           # 案例验证
├── ResearchReportGenerator.js # 报告生成
├── ResearchCommands.js        # 调研指令
├── ResearchConfig.js         # 调研配置
├── ResearchDataModels.js     # 数据模型
└── index.js                   # 统一导出
```

**核心流程**:
1. 地区/语种分级 → 多语言搜索 → 案例验证 → 报告生成

**关键配置**:
```javascript
REGION_TIERS  // 地区分级
LANGUAGE_TIERS // 语种分级
VOLUME_TIERS  // 产物体量分类
SEARCH_ROUNDS // 搜索轮次
```

---

## 4. 场景化扩展点设计

### 4.1 扩展点定义

| 扩展点 | 类型 | 说明 | 适用场景 |
|--------|------|------|---------|
| 分层质量检查器 | 注入 | 复用 GLayer/PLayer/CLayer/BLayer/VCR（与 SKILL 约定一致） | 全部 |
| 评分引擎 | 注入 | 复用 ScoreCalculator | 全部 |
| webSearch | 注入 | 联网搜索能力 | 社媒、调研 |
| brandProfile | 配置 | 品牌画像 | 社媒、企业 |
| regionConfig | 配置 | 地区/语种配置 | 调研 |

### 4.2 扩展点接口

```javascript
// 质量检查器扩展点
interface QualityLayerExtension {
  setLayerChecker(name: 'GLayer'|'PLayer'|'CLayer'|'BLayer'|'VCR', checker: Checker): void;
  getLayerChecker?(name: string): Checker | null;
}

// 评分引擎扩展点
interface ScoringExtension {
  setScoreCalculator(calculator: ScoreCalculator): void;
  calculateScore(metrics: QualityMetrics): Promise<ScoreResult>;
}

// 联网搜索扩展点
interface WebSearchExtension {
  setWebSearch(fn: (query: string) => Promise<SearchResult>): void;
  search(query: string): Promise<SearchResult>;
}
```

### 4.3 场景初始化模板

```javascript
// 社媒场景初始化
function createSocialMediaBackend(skillServices) {
  const { qualityCheckers, scoreCalculator, webSearch } = skillServices;
  
  const socialMedia = new SocialMediaWorkflow({
    logger: console
  });
  
  // 注入分层质量检查器
  socialMedia.setLayerChecker?.('GLayer', qualityCheckers.gLayer);
  socialMedia.setLayerChecker?.('PLayer', qualityCheckers.pLayer);
  socialMedia.setLayerChecker?.('CLayer', qualityCheckers.cLayer);
  
  // 注入联网搜索
  socialMedia.setWebSearch(webSearch);
  
  return socialMedia;
}

// 调研场景初始化
function createResearchBackend(skillServices) {
  const { qualityCheckers, scoreCalculator, webSearch } = skillServices;
  
  const research = new ResearchOrchestrator({
    logger: console
  });
  
  // 调研场景使用多语言搜索
  research.setSearchEngine(new MultiLangSearchEngine({
    webSearch,
    regionTiers: REGION_TIERS,
    languageTiers: LANGUAGE_TIERS
  }));
  
  return research;
}
```

---

## 5. 统一入口层设计

### 5.1 NLU路由架构

```javascript
/**
 * ScenarioRouter
 * 统一入口层 - NLU驱动的场景路由
 */
class ScenarioRouter {
  constructor(options = {}) {
    this.logger = options.logger || console;
    
    // 初始化各场景
    this.scenarios = {
      social: null,    // 社媒场景（延迟加载）
      enterprise: null, // 企业场景（延迟加载）
      research: null    // 调研场景（延迟加载）
    };
    
    // 场景识别规则
    this.scenarioRules = [
      {
        scenario: 'social',
        patterns: [
          /热点|hotspot| trending/i,
          /小红书|知乎|微博|linkedin/i,
          /品牌植入|brand/i,
          /多平台|multi.?platform/i,
          /社媒|social.?media/i
        ],
        keywords: ['追踪', '发布', '热点话题']
      },
      {
        scenario: 'enterprise',
        patterns: [
          /培训|training/i,
          /手册|manual/i,
          /企业|enterprise|corporate/i,
          /内部|external|external/i,
          /风格|style/i
        ],
        keywords: ['培训手册', '风格定制', '企业场景']
      },
      {
        scenario: 'research',
        patterns: [
          /调研|research/i,
          /搜索|search/i,
          /多语言|multi.?lang/i,
          /案例|case/i,
          /报告|report/i
        ],
        keywords: ['调研', '搜索', '案例验证', '报告生成']
      }
    ];
  }
  
  /**
   * 路由入口 - 根据用户输入选择场景
   * @param {Object} input - 用户输入
   * @param {string} input.text - 用户文本
   * @param {Object} input.context - 上下文信息
   * @returns {Promise<RouteResult>} 路由结果
   */
  async route(input) {
    const { text, context = {} } = input;
    
    // S1: 意图识别
    const intent = await this.recognizeIntent(text);
    
    // S2: 场景匹配
    const scenario = this.matchScenario(text, intent);
    
    // S3: 获取场景处理器
    const handler = await this.getScenarioHandler(scenario);
    
    // S4: 参数提取
    const params = this.extractParams(text, intent, scenario);
    
    return {
      scenario,
      intent,
      handler,
      params,
      originalInput: text
    };
  }
  
  /**
   * 意图识别
   * @private
   */
  async recognizeIntent(text) {
    // 调用宿主 NLU / 规则引擎（此处为占位示例）
    // 目前使用关键词匹配
    const intentPatterns = {
      'hotspot.track': [/追踪热点/, /热点追踪/, /hotspot track/i],
      'content.generate': [/生成内容/, /写文章/, /generate content/i],
      'brand.integrate': [/品牌植入/, /植入/i],
      'training.create': [/创建培训/, /培训手册/i],
      'research.search': [/调研/, /搜索/i],
      'report.generate': [/生成报告/, /report/i]
    };
    
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return intent;
        }
      }
    }
    
    return 'unknown';
  }
  
  /**
   * 场景匹配
   * @private
   */
  matchScenario(text, intent) {
    // S1: 基于规则匹配
    for (const rule of this.scenarioRules) {
      for (const pattern of rule.patterns) {
        if (pattern.test(text)) {
          return rule.scenario;
        }
      }
    }
    
    // S2: 基于意图推断
    const intentToScenario = {
      'hotspot.track': 'social',
      'content.generate': 'social',
      'brand.integrate': 'social',
      'training.create': 'enterprise',
      'research.search': 'research',
      'report.generate': 'research'
    };
    
    if (intentToScenario[intent]) {
      return intentToScenario[intent];
    }
    
    // S3: 默认标准场景（依赖注入的 workflowEngine）
    return 'default';
  }
  
  /**
   * 获取场景处理器（延迟加载）
   * @private
   */
  async getScenarioHandler(scenario) {
    if (this.scenarios[scenario]) {
      return this.scenarios[scenario];
    }
    
    switch (scenario) {
      case 'social':
        const socialModule = await import('../scenarios/social-media/backend/index.js');
        this.scenarios.social = new socialModule.SocialMediaWorkflow();
        return this.scenarios.social;
        
      case 'enterprise':
        // 企业场景待实现
        return null;
        
      case 'research':
        const researchModule = await import('../scenarios/research/backend/index.js');
        this.scenarios.research = new researchModule.ResearchOrchestrator();
        return this.scenarios.research;
        
      default:
        return null;
    }
  }
  
  /**
   * 提取参数
   * @private
   */
  extractParams(text, intent, scenario) {
    // 简化实现，实际应调用NLU实体提取
    return {
      rawText: text,
      intent,
      scenario,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 注册技能服务
   * @param {Object} skillServices - 技能服务集合
   */
  registerSkillServices(skillServices) {
    this.skillServices = skillServices;
    
    // 传播到各场景
    if (this.scenarios.social) {
      this.scenarios.social.setLayerChecker?.('GLayer', skillServices.qualityCheckers?.gLayer);
      this.scenarios.social.setWebSearch?.(skillServices.webSearch);
    }
    
    if (this.scenarios.research) {
      // 调研场景的注入
    }
  }
}

module.exports = { ScenarioRouter };
```

### 5.2 路由决策表

| 输入特征 | 场景 | 处理器 | 典型指令 |
|---------|------|--------|---------|
| 包含"热点/追踪/品牌" | social | SocialMediaWorkflow | "追踪最新热点" |
| 包含"培训/手册/企业" | enterprise | (待实现) | "生成培训手册" |
| 包含"调研/搜索/报告" | research | ResearchOrchestrator | "调研AI发展趋势" |
| 无特征/默认 | default | 注入的 WorkflowEngine | "写一章内容" |

---

## 6. 模块间接口定义

### 6.1 场景接口 (IScenario)

```javascript
/**
 * 场景统一接口
 * 所有场景化功能必须实现此接口
 */
interface IScenario {
  /**
   * 场景名称
   */
  name: string;
  
  /**
   * 场景版本
   */
  version: string;
  
  /**
   * 初始化场景
   * @param {Object} config - 场景配置
   */
  initialize(config: Object): Promise<void>;
  
  /**
   * 执行场景任务
   * @param {Object} input - 输入参数
   * @returns {Promise<Object>} 执行结果
   */
  execute(input: Object): Promise<Object>;
  
  /**
   * 注册技能服务
   * @param {Object} skillServices - 技能服务集合
   */
  registerSkillServices(skillServices: Object): void;
  
  /**
   * 获取场景状态
   */
  getStatus(): ScenarioStatus;
}
```

### 6.2 调研场景接口 (已确认对齐)

**ResearchOrchestrator实际方法签名**：
```javascript
// 构造函数
new ResearchOrchestrator({
  logger,
  searchProviders: { webSearch },
  qualitySystem
})

// 核心方法
quickScan(topic: string, regionCode: string): Promise<Result>
execute(params: ResearchParams): Promise<Result>
executeFromCommand(userInput: string, overrideParams: Object): Promise<Result>
crossRegionResearch(topic: string, regionCodes: string[]): Promise<Result>
```

**适配器映射**：
| 适配器模式 | 底层方法 | 参数转换 |
|-----------|---------|---------|
| quick | quickScan | `{query, region}` → `(query, regionCode)` |
| deep | execute | 直接透传 |
| report | ResearchReportGenerator | 新建实例调用 |

### 6.3 质量检查接口 (IQualityChecker)

```javascript
/**
 * 质量检查器接口
 * 与 SKILL 分层质量检查器兼容
 */
interface IQualityChecker {
  /**
   * 执行检查
   * @param {string} content - 待检查内容
   * @param {Object} options - 检查选项
   * @returns {Promise<CheckResult>} 检查结果
   */
  check(content: string, options?: Object): Promise<CheckResult>;
  
  /**
   * 获取检查类型
   */
  getType(): 'G' | 'P' | 'C' | 'B' | 'VCR';
  
  /**
   * 获取规则集合
   */
  getRules(): string[];
}
```

### 6.3 评分接口 (IScoreCalculator)

```javascript
/**
 * 评分计算器接口
 * 与文档中的 ScoreCalculator 约定兼容
 */
interface IScoreCalculator {
  /**
   * 计算质量评分
   * @param {Object} metrics - 质量指标
   * @returns {Promise<ScoreResult>} 评分结果
   */
  calculateQualityScore(metrics: Object): Promise<ScoreResult>;
  
  /**
   * 获取评分权重
   */
  getWeights(): Object;
  
  /**
   * 设置评分组件
   * @param {string} component - 组件名称
   * @param {Object} scorer - 评分器
   */
  setComponent(component: string, scorer: Object): void;
}
```

### 6.4 搜索接口 (ISearchEngine)

```javascript
/**
 * 搜索接口
 * 社媒热点追踪 & 调研多语言搜索 共用
 */
interface ISearchEngine {
  /**
   * 执行搜索
   * @param {SearchQuery} query - 搜索查询
   * @returns {Promise<SearchResult>} 搜索结果
   */
  search(query: SearchQuery): Promise<SearchResult>;
  
  /**
   * 批量搜索
   * @param {SearchQuery[]} queries - 搜索查询列表
   * @returns {Promise<SearchResult[]>} 搜索结果列表
   */
  searchBatch(queries: SearchQuery[]): Promise<SearchResult[]>;
  
  /**
   * 设置联网搜索函数
   * @param {Function} webSearchFn - 联网搜索函数
   */
  setWebSearch(webSearchFn: Function): void;
}

/**
 * 搜索查询
 */
interface SearchQuery {
  query: string;           // 搜索词
  language?: string;        // 语言 (zh-CN, en-US, etc.)
  region?: string;          // 地区
  source?: string[];       // 数据源
  limit?: number;           // 结果数量限制
}

/**
 * 搜索结果
 */
interface SearchResult {
  success: boolean;
  items: SearchResultItem[];
  metadata: {
    total: number;
    query: string;
    timestamp: string;
  };
}

/**
 * 搜索结果项
 */
interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  timestamp?: string;
}
```

---

## 7. 集成清单

### 7.1 文件清单

| 文件路径 | 用途 | 状态 |
|---------|------|------|
| integration/ScenarioRouter.js | 统一入口层 | 已存在（骨架；依赖 `scenarios/` 模块） |
| integration/ScenarioManager.js | 场景管理器 | 已存在 |
| integration/adapters/SocialMediaAdapter.js | 社媒适配器 | 已存在 |
| integration/adapters/EnterpriseAdapter.js | 企业适配器 | 已存在 |
| integration/adapters/ResearchAdapter.js | 调研适配器 | 已存在 |
| integration/interfaces.js | 接口定义 | 已存在 |

### 7.2 集成任务

| 任务 | 负责 | 依赖 | 状态 |
|------|------|------|------|
| 完善 ScenarioRouter | 集成方 | `scenarios/` 可用 | 进行中 |
| 完善 ScenarioManager | 集成方 | 注入 `workflowEngine` | 进行中 |
| 社媒/企业/调研适配器 | 集成方 | 各场景 backend 实现 | 骨架已有 |
| 集成测试 | 集成方 | 依赖齐备后 | 按需 |

---

## 8. 向后兼容

### 8.1 与 SKILL 规范对齐

- `SKILL.md` 仍为技能包总入口
- `default` 场景通过宿主注入的 `workflowEngine` 处理（本仓库不提供实现）
- 质量分层检查器与评分引擎由宿主注入，与文档约定对齐

### 8.2 场景隔离

- 各场景化功能独立模块，无直接依赖
- 场景间共享通过统一的技能服务注入层（`skillServices`）
- 场景可独立部署和版本管理

---

## 9. 实施计划

### 阶段1: 核心框架（预计2小时）
1. 创建 integration/ 目录结构
2. 实现 ScenarioRouter
3. 实现 ScenarioManager
4. 实现接口定义文件

### 阶段2: 场景适配器（预计3小时）
1. 实现 SocialMediaAdapter
2. 实现 EnterpriseAdapter
3. 实现 ResearchAdapter

### 阶段3: 集成测试（预计2小时）
1. 编写集成测试用例
2. 执行端到端测试
3. 修复发现的问题

### 总计: 约7小时

---

## 附录

### A. 参考文档

- 工作流引擎、质量检查器、评分计算器 — 由调用方提供（见 `references/05-ops/doc-code-consistency.md`）
- scenarios/social-media/backend/index.js - 社媒场景
- scenarios/research/backend/index.js - 调研场景

### B. 术语表

| 术语 | 说明 |
|------|------|
| NLU | Natural Language Understanding，自然语言理解 |
| G/P/C/B Layer | Global/Paragraph/Chapter/Book layer，质量检查层级 |
| VCR | Visual Content Relevance，可视化内容相关性 |
| Scenario | 场景，三大应用场景之一 |

---

*文档版本: 1.0.0*
*创建时间: 2026-03-23*
*设计者: architect*
