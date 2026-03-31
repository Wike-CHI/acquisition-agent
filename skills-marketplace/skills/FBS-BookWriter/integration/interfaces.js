/**
 * FBS-BookWriter — integration 接口定义（JSDoc）
 */

'use strict';

/**
 * ============================================
 * 场景接口 (IScenario)
 * ============================================
 */

/**
 * 场景统一接口
 * 所有扩展场景必须实现此接口
 * @interface IScenario
 */

/**
 * @typedef {Object} ScenarioStatus
 * @property {boolean} ready - 是否就绪
 * @property {string} state - 状态
 * @property {number} lastUsed - 最后使用时间
 */

/**
 * 场景配置
 * @typedef {Object} ScenarioConfig
 * @property {Object} qualityCheckers - 质量检查器
 * @property {Object} scoreCalculator - 评分计算器
 * @property {Function} webSearch - 联网搜索函数
 * @property {Object} logger - 日志器
 */

// IScenario methods:
/**
 * @name initialize
 * @description 初始化场景
 * @param {ScenarioConfig} config - 场景配置
 * @returns {Promise<void>}
 * @memberof IScenario
 */

/**
 * @name execute
 * @description 执行场景任务
 * @param {Object} input - 输入参数
 * @returns {Promise<Object>} 执行结果
 * @memberof IScenario
 */

/**
 * @name registerSkillServices
 * @description 注册技能服务（检索、检查器、工作流等）
 * @param {Object} skillServices - 技能服务集合
 * @returns {void}
 * @memberof IScenario
 */

/**
 * @name getStatus
 * @description 获取场景状态
 * @returns {ScenarioStatus}
 * @memberof IScenario
 */


/**
 * ============================================
 * 质量检查器接口 (IQualityChecker)
 * ============================================
 */

/**
 * 质量检查器接口
 * 与 SKILL 质量分层（G/P/C 等）检查器兼容
 * @interface IQualityChecker
 */

/**
 * @typedef {Object} CheckResult
 * @property {boolean} passed - 是否通过
 * @property {number} score - 评分
 * @property {Object[]} issues - 问题列表
 * @property {Object} metadata - 元数据
 */

// IQualityChecker methods:
/**
 * @name check
 * @description 执行检查
 * @param {string} content - 待检查内容
 * @param {Object} options - 检查选项
 * @returns {Promise<CheckResult>}
 * @memberof IQualityChecker
 */

/**
 * @name getType
 * @description 获取检查类型
 * @returns {'G'|'P'|'C'|'B'|'VCR'}
 * @memberof IQualityChecker
 */

/**
 * @name getRules
 * @description 获取规则集合
 * @returns {string[]}
 * @memberof IQualityChecker
 */


/**
 * ============================================
 * 评分计算器接口 (IScoreCalculator)
 * ============================================
 */

/**
 * 评分计算器接口
 * 与文档中的 ScoreCalculator 约定兼容
 * @interface IScoreCalculator
 */

/**
 * @typedef {Object} ScoreResult
 * @property {boolean} success - 是否成功
 * @property {number} overall - 综合评分
 * @property {Object} components - 各维度评分
 * @property {Object} details - 详细评分信息
 * @property {string} timestamp - 时间戳
 */

/**
 * @typedef {Object} QualityMetrics
 * @property {string} content - 内容
 * @property {Object[]} visuals - 视觉元素
 * @property {string} author - 作者
 * @property {string} chapter - 章节
 */

// IScoreCalculator methods:
/**
 * @name calculateQualityScore
 * @description 计算质量评分
 * @param {QualityMetrics} metrics - 质量指标
 * @returns {Promise<ScoreResult>}
 * @memberof IScoreCalculator
 */

/**
 * @name getWeights
 * @description 获取评分权重
 * @returns {Object}
 * @memberof IScoreCalculator
 */

/**
 * @name setComponent
 * @description 设置评分组件
 * @param {string} component - 组件名称
 * @param {Object} scorer - 评分器
 * @returns {void}
 * @memberof IScoreCalculator
 */


/**
 * ============================================
 * 搜索接口 (ISearchEngine)
 * ============================================
 */

/**
 * 搜索接口
 * 社媒热点追踪 & 调研多语言搜索 共用
 * @interface ISearchEngine
 */

/**
 * @typedef {Object} SearchQuery
 * @property {string} query - 搜索词
 * @property {string} [language] - 语言 (zh-CN, en-US, etc.)
 * @property {string} [region] - 地区
 * @property {string[]} [source] - 数据源
 * @property {number} [limit] - 结果数量限制
 */

/**
 * @typedef {Object} SearchResult
 * @property {boolean} success - 是否成功
 * @property {SearchResultItem[]} items - 结果项
 * @property {Object} metadata - 元数据
 */

/**
 * @typedef {Object} SearchResultItem
 * @property {string} title - 标题
 * @property {string} url - URL
 * @property {string} snippet - 摘要
 * @property {string} source - 来源
 * @property {string} [timestamp] - 时间戳
 */

// ISearchEngine methods:
/**
 * @name search
 * @description 执行搜索
 * @param {SearchQuery} query - 搜索查询
 * @returns {Promise<SearchResult>}
 * @memberof ISearchEngine
 */

/**
 * @name searchBatch
 * @description 批量搜索
 * @param {SearchQuery[]} queries - 搜索查询列表
 * @returns {Promise<SearchResult[]>}
 * @memberof ISearchEngine
 */

/**
 * @name setWebSearch
 * @description 设置联网搜索函数
 * @param {Function} webSearchFn - 联网搜索函数
 * @returns {void}
 * @memberof ISearchEngine
 */


/**
 * ============================================
 * 品牌植入检查器接口 (IBrandIntegrationChecker)
 * ============================================
 */

/**
 * @typedef {Object} BrandProfile
 * @property {string} id - 品牌ID
 * @property {string} name - 品牌名称
 * @property {string} tagline - 品牌口号
 * @property {Object} valuePropositions - 价值主张
 * @property {Object} tone - 品牌调性
 * @property {Object[]} cases - 成功案例
 * @property {Object} blacklist - 禁用词库
 */

/**
 * @typedef {Object} BrandIntegrationResult
 * @property {boolean} success - 是否成功
 * @property {number} score - 植入评分
 * @property {Object[]} points - 植入点
 * @property {Object} riskAnalysis - 风险分析
 */

// IBrandIntegrationChecker methods:
/**
 * @name check
 * @description 检查品牌植入
 * @param {string} content - 内容
 * @param {Object} options - 选项
 * @returns {Promise<BrandIntegrationResult>}
 */

/**
 * @name analyzeBrandRelevance
 * @description 分析品牌与热点相关性
 * @param {Object} hotspot - 热点
 * @param {BrandProfile} brandProfile - 品牌画像
 * @returns {Object}
 */


/**
 * ============================================
 * 调研编排器接口 (IResearchOrchestrator)
 * ============================================
 */

/**
 * @typedef {Object} ResearchConfig
 * @property {string} region - 地区
 * @property {string} language - 语言
 * @property {string} volume - 产物体量
 * @property {number} searchRounds - 搜索轮次
 */

/**
 * @typedef {Object} ResearchResult
 * @property {boolean} success - 是否成功
 * @property {Object} data - 研究数据
 * @property {Object} report - 报告
 * @property {Object} validation - 验证结果
 */


/**
 * ============================================
 * 导出接口常量
 * ============================================
 */

/**
 * 场景类型
 * @constant {Object}
 */
const SCENARIO_TYPES = {
  SOCIAL: 'social',
  ENTERPRISE: 'enterprise',
  RESEARCH: 'research',
  DEFAULT: 'default'
};

/**
 * 质量检查器类型
 * @constant {Object}
 */
const CHECKER_TYPES = {
  G_LAYER: 'G',
  P_LAYER: 'P',
  C_LAYER: 'C',
  B_LAYER: 'B',
  VCR: 'VCR'
};

/**
 * 意图类型
 * @constant {Object}
 */
const INTENT_TYPES = {
  HOTSPOT_TRACK: 'hotspot.track',
  CONTENT_GENERATE: 'content.generate',
  BRAND_INTEGRATE: 'brand.integrate',
  PLATFORM_ADAPT: 'platform.adapt',
  TRAINING_CREATE: 'training.create',
  STYLE_CUSTOMIZE: 'style.customize',
  ROLE_DEFINE: 'role.define',
  RESEARCH_SEARCH: 'research.search',
  REPORT_GENERATE: 'report.generate',
  CASE_VALIDATE: 'case.validate',
  UNKNOWN: 'unknown'
};

/**
 * 评分组件
 * @constant {Object}
 */
const SCORE_COMPONENTS = {
  B_LAYER: 'bLayer',
  SECURITY: 'security',
  VCR: 'vcr',
  ENGAGEMENT: 'engagement'
};

module.exports = {
  // 类型常量
  SCENARIO_TYPES,
  CHECKER_TYPES,
  INTENT_TYPES,
  SCORE_COMPONENTS,
  
  // 接口类（用于类型检查）
  // 注意：这些仅作为文档参考，实际使用请通过duck typing
  IScenario: null,
  IQualityChecker: null,
  IScoreCalculator: null,
  ISearchEngine: null
};
