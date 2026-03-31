/**
 * FBS-BookWriter — ResearchAdapter（依赖 `scenarios/research/backend`）
 */

'use strict';

/**
 * ResearchAdapter
 * 调研场景适配器
 *
 * 功能：
 * - 包装ResearchOrchestrator
 * - 实现IScenario接口
 * - 统一技能服务注入
 */
class ResearchAdapter {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.name = 'research';
    this.version = '1.0.0';
    
    // 底层处理器
    this.handler = null;
    
    this.skillServices = {
      qualityCheckers: {},
      webSearch: null
    };
    
    // 状态
    this.state = 'uninitialized';
  }

  /**
   * 初始化
   * @param {Object} config - 配置
   * @returns {Promise<void>}
   */
  async initialize(config = {}) {
    try {
      this.logger.info('[ResearchAdapter] Initializing...');
      
      // 动态加载调研模块
      const ResearchModule = require('../../scenarios/research/backend/index.js');
      
      this.handler = new ResearchModule.ResearchOrchestrator({
        logger: this.logger,
        searchProviders: {
          webSearch: config.webSearch || null
        },
        qualitySystem: config.qualitySystem || null,
        skillRoot: config.skillRoot || null,
        bookRoot: config.bookRoot || null,
      });
      
      this.state = 'ready';
      this.logger.info('[ResearchAdapter] Initialized successfully');
      
    } catch (error) {
      this.state = 'error';
      this.logger.error('[ResearchAdapter] Init failed', { error: error.message });
      throw error;
    }
  }

  /**
   * 执行场景任务
   * @param {Object} input - 输入
   * @returns {Promise<Object>} 结果
   */
  async execute(input) {
    if (!this.handler) {
      throw new Error('ResearchAdapter not initialized');
    }
    
    const { mode, params } = input;
    
    switch (mode) {
      case 'quick':
        return await this.executeQuickResearch(params);
        
      case 'deep':
        return await this.executeDeepResearch(params);
        
      case 'report':
        return await this.executeReportGeneration(params);
        
      default:
        // 默认执行快速调研
        return await this.executeQuickResearch(input);
    }
  }

  /**
   * 执行快速调研
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeQuickResearch(params) {
    const { query, region, language, volume } = params;
    
    // 优先使用 quickScan(topic, regionCode)
    if (typeof this.handler.quickScan === 'function') {
      return await this.handler.quickScan(query, region || 'TIER_1');
    }
    
    // 备用：调用 executeFromCommand(userInput, overrideParams)
    if (typeof this.handler.executeFromCommand === 'function') {
      return await this.handler.executeFromCommand(query, {
        region: region || 'TIER_1',
        language: language || 'zh-CN',
        volume: volume || 'MEDIUM'
      });
    }
    
    throw new Error('Research handler does not support quick research');
  }

  /**
   * 执行深度调研
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeDeepResearch(params) {
    const { query, region, language, volume, searchRounds } = params;
    
    // 调用ResearchOrchestrator.execute
    if (typeof this.handler.execute === 'function') {
      return await this.handler.execute({
        query,
        region: region || 'TIER_1',
        language: language || 'zh-CN',
        volume: volume || 'LARGE',
        searchRounds: searchRounds || 3
      });
    }
    
    throw new Error('Research handler does not support deep research');
  }

  /**
   * 执行报告生成
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeReportGeneration(params) {
    const { researchData, template, format } = params;
    
    // 使用ResearchReportGenerator
    const ResearchModule = require('../../scenarios/research/backend/index.js');
    const generator = new ResearchModule.ResearchReportGenerator({
      logger: this.logger
    });
    
    return await generator.generate(researchData, {
      template: template || 'standard',
      format: format || 'markdown'
    });
  }

  /**
   * 注册技能服务
   * @param {Object} services - 技能服务集合
   */
  registerSkillServices(services) {
    this.skillServices = {
      ...this.skillServices,
      ...services
    };
    
    if (this.handler) {
      if (services.qualityCheckers) {
        this.registerQualityCheckers(services.qualityCheckers);
      }
      if (services.webSearch) {
        this.setWebSearch(services.webSearch);
      }
    }
  }

  /**
   * @param {string} layerName
   * @param {Object} checker
   */
  setLayerChecker(layerName, checker) {
    const h = this.handler;
    if (!h || !checker) return;
    if (typeof h.setLayerChecker === 'function') h.setLayerChecker(layerName, checker);
    else if (typeof h.setV7Checker === 'function') h.setV7Checker(layerName, checker);
  }

  /**
   * 注册质量检查器
   * @param {Object} checkers - 质量检查器
   */
  registerQualityCheckers(checkers) {
    if (checkers.gLayer && this.handler) {
      this.setLayerChecker('GLayer', checkers.gLayer);
    }
    if (checkers.pLayer && this.handler) {
      this.setLayerChecker('PLayer', checkers.pLayer);
    }
  }

  /**
   * 设置联网搜索（ResearchOrchestrator通过constructor注入，此方法保留兼容性）
   * @param {Function} webSearch - 联网搜索函数
   * @deprecated webSearch应通过initialize时的config.webSearch传入
   */
  setWebSearch(webSearch) {
    this.skillServices.webSearch = webSearch;
    
    // ResearchOrchestrator通过constructor配置，不支持动态更新
    // 如需更新，需重新初始化handler
    this.logger.debug('[ResearchAdapter] webSearch updated (will apply on re-init)');
  }

  /**
   * 获取状态
   * @returns {Object}
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      state: this.state,
      ready: this.state === 'ready',
      hasHandler: !!this.handler,
      hasWebSearch: !!this.skillServices.webSearch,
      hasQualityCheckers: Object.keys(this.skillServices.qualityCheckers).length > 0
    };
  }

  /**
   * 健康检查
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    return {
      healthy: this.state === 'ready' && !!this.handler,
      state: this.state,
      name: this.name
    };
  }

  /**
   * 释放资源
   */
  async dispose() {
    if (this.handler && typeof this.handler.dispose === 'function') {
      await this.handler.dispose();
    }
    
    this.handler = null;
    this.state = 'disposed';
  }
}

module.exports = { ResearchAdapter };
