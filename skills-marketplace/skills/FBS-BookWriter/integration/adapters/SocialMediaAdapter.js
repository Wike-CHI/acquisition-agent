/**
 * FBS-BookWriter — SocialMediaAdapter（依赖 `scenarios/social-media/backend`）
 */

'use strict';

/**
 * SocialMediaAdapter
 * 社媒场景适配器
 *
 * 功能：
 * - 包装SocialMediaWorkflow
 * - 实现IScenario接口
 * - 统一技能服务注入
 */
class SocialMediaAdapter {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.name = 'social';
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
      this.logger.info('[SocialMediaAdapter] Initializing...');
      
      // 动态加载社媒模块
      const SocialMediaModule = require('../../scenarios/social-media/backend/index.js');
      
      this.handler = new SocialMediaModule.SocialMediaWorkflow({
        logger: this.logger
      });
      
      // 注册技能服务
      if (config.qualityCheckers) {
        this.registerQualityCheckers(config.qualityCheckers);
      }
      
      if (config.webSearch) {
        this.setWebSearch(config.webSearch);
      }
      
      this.state = 'ready';
      this.logger.info('[SocialMediaAdapter] Initialized successfully');
      
    } catch (error) {
      this.state = 'error';
      this.logger.error('[SocialMediaAdapter] Init failed', { error: error.message });
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
      throw new Error('SocialMediaAdapter not initialized');
    }
    
    const { mode, params } = input;
    
    switch (mode) {
      case 'hotspot':
        return await this.executeHotspotMode(params);
        
      case 'direction':
        return await this.executeDirectionMode(params);
        
      case 'continuous':
        return await this.executeContinuousMode(params);
        
      default:
        // 默认执行热点模式
        return await this.executeHotspotMode(input);
    }
  }

  /**
   * 执行热点追踪模式
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeHotspotMode(params) {
    const { topic, brandProfile, targetPlatforms } = params;
    
    return await this.handler.executeHotspotMode({
      topic,
      brandProfile,
      targetPlatforms: targetPlatforms || ['wechat', 'zhihu', 'xiaohongshu', 'linkedin', 'weibo']
    });
  }

  /**
   * 执行方向模式
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeDirectionMode(params) {
    const { direction, coreIdea, targetAudience, brandProfile } = params;
    
    return await this.handler.executeDirectionMode({
      direction,
      coreIdea,
      targetAudience,
      brandProfile
    });
  }

  /**
   * 执行持续追踪模式
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeContinuousMode(params) {
    const { trackingTheme, brandProfile } = params;
    
    return await this.handler.executeContinuousMode({
      trackingTheme,
      brandProfile
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
    if (checkers.cLayer && this.handler) {
      this.setLayerChecker('CLayer', checkers.cLayer);
    }
  }

  /**
   * 设置联网搜索
   * @param {Function} webSearch - 联网搜索函数
   */
  setWebSearch(webSearch) {
    this.skillServices.webSearch = webSearch;
    
    if (this.handler && typeof this.handler.setWebSearch === 'function') {
      this.handler.setWebSearch(webSearch);
    }
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

module.exports = { SocialMediaAdapter };
