/**
 * FBS-BookWriter — EnterpriseAdapter（依赖 `scenarios/enterprise/backend`）
 */

'use strict';

/**
 * EnterpriseAdapter
 * 企业场景适配器
 *
 * 功能：
 * - 包装企业场景模块
 * - 实现IScenario接口
 * - 统一技能服务注入
 *
 * 注意：企业场景仍在开发中，此适配器为预留接口
 */
class EnterpriseAdapter {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.name = 'enterprise';
    this.version = '1.0.0';
    
    // 底层处理器
    this.handler = null;
    
    this.skillServices = {
      qualityCheckers: {},
      webSearch: null,
      workflowEngine: null
    };
    
    // 状态
    this.state = 'uninitialized';
    
    // 企业场景配置
    this.config = {
      mode: options.mode || 'training', // training|manual|collaboration
      internalMode: options.internalMode || 'internal', // internal|external
      styleProfile: options.styleProfile || 'default'
    };
  }

  /**
   * 初始化
   * @param {Object} config - 配置
   * @returns {Promise<void>}
   */
  async initialize(config = {}) {
    try {
      this.logger.info('[EnterpriseAdapter] Initializing...');
      
      // 更新配置
      this.config = { ...this.config, ...config };
      
      // 企业场景模块路径
      const modulePath = '../../scenarios/enterprise/backend/index.js';
      
      try {
        // 尝试动态加载企业模块
        const EnterpriseModule = require(modulePath);
        
        this.handler = this.createHandler(EnterpriseModule);
        
      } catch (loadError) {
        this.logger.warn('[EnterpriseAdapter] Enterprise module not yet implemented', {
          error: loadError.message
        });
        
        // 企业场景未实现，创建空壳处理器
        this.handler = this.createPlaceholderHandler();
      }
      
      // 注册技能服务
      if (config.qualityCheckers) {
        this.registerQualityCheckers(config.qualityCheckers);
      }
      
      if (config.webSearch) {
        this.setWebSearch(config.webSearch);
      }
      
      if (config.workflowEngine) {
        this.skillServices.workflowEngine = config.workflowEngine;
      }
      
      this.state = 'ready';
      this.logger.info('[EnterpriseAdapter] Initialized successfully');
      
    } catch (error) {
      this.state = 'error';
      this.logger.error('[EnterpriseAdapter] Init failed', { error: error.message });
      throw error;
    }
  }

  /**
   * 创建处理器
   * @param {Object} module - 企业模块
   * @returns {Object} 处理器
   * @private
   */
  createHandler(module) {
    // 根据模式创建不同的处理器
    switch (this.config.mode) {
      case 'training':
        return this.createTrainingHandler(module);
        
      case 'manual':
        return this.createManualHandler(module);
        
      case 'collaboration':
        return this.createCollaborationHandler(module);
        
      default:
        return this.createTrainingHandler(module);
    }
  }

  /**
   * 创建培训处理器
   * @private
   */
  createTrainingHandler(module) {
    if (typeof module.TrainingWorkflow === 'function') {
      return new module.TrainingWorkflow({ logger: this.logger });
    }
    return null;
  }

  /**
   * 创建手册处理器
   * @private
   */
  createManualHandler(module) {
    if (typeof module.ManualGenerator === 'function') {
      return new module.ManualGenerator({ logger: this.logger });
    }
    return null;
  }

  /**
   * 创建协作处理器
   * @private
   */
  createCollaborationHandler(module) {
    if (typeof module.CollaborationManager === 'function') {
      return new module.CollaborationManager({ logger: this.logger });
    }
    return null;
  }

  /**
   * 创建占位处理器（企业场景未实现时使用）
   * @returns {Object}
   * @private
   */
  createPlaceholderHandler() {
    const self = this;
    
    return {
      execute: async function(input) {
        self.logger.warn('[EnterpriseAdapter] Enterprise scenario not implemented');
        return {
          success: false,
          error: 'Enterprise scenario not yet implemented',
          status: 'placeholder'
        };
      },
      
      getStatus: function() {
        return {
          name: 'enterprise',
          state: 'placeholder',
          ready: false
        };
      },
      
      healthCheck: async function() {
        return {
          healthy: false,
          state: 'placeholder',
          error: 'Enterprise scenario not implemented'
        };
      }
    };
  }

  /**
   * 执行场景任务
   * @param {Object} input - 输入
   * @returns {Promise<Object>} 结果
   */
  async execute(input) {
    if (!this.handler) {
      throw new Error('EnterpriseAdapter not initialized');
    }
    
    const { mode, params } = input;
    
    switch (mode) {
      case 'training':
        return await this.executeTraining(params);
        
      case 'manual':
        return await this.executeManualGeneration(params);
        
      case 'style':
        return await this.executeStyleCustomization(params);
        
      case 'role':
        return await this.executeRoleDefinition(params);
        
      default:
        // 默认执行培训
        return await this.executeTraining(input);
    }
  }

  /**
   * 执行培训生成
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeTraining(params) {
    const { topic, audience, internal, duration } = params;
    
    if (typeof this.handler.execute === 'function') {
      return await this.handler.execute({
        topic,
        audience,
        internal: internal ?? (this.config.internalMode === 'internal'),
        duration
      });
    }
    
    return {
      success: false,
      error: 'Training handler not available'
    };
  }

  /**
   * 执行手册生成
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeManualGeneration(params) {
    const { type, audience, tone } = params;
    
    if (typeof this.handler.generate === 'function') {
      return await this.handler.generate({
        type,
        audience,
        tone: tone || this.config.styleProfile
      });
    }
    
    return {
      success: false,
      error: 'Manual generator not available'
    };
  }

  /**
   * 执行风格定制
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeStyleCustomization(params) {
    const { style, brandProfile } = params;
    
    if (typeof this.handler.customizeStyle === 'function') {
      return await this.handler.customizeStyle({
        style,
        brandProfile
      });
    }
    
    return {
      success: false,
      error: 'Style customization not available'
    };
  }

  /**
   * 执行角色定义
   * @param {Object} params - 参数
   * @returns {Promise<Object>}
   * @private
   */
  async executeRoleDefinition(params) {
    const { roles, permissions } = params;
    
    if (typeof this.handler.defineRoles === 'function') {
      return await this.handler.defineRoles({
        roles,
        permissions
      });
    }
    
    return {
      success: false,
      error: 'Role definition not available'
    };
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
    
    if (this.handler && typeof this.handler.registerSkillServices === 'function') {
      this.handler.registerSkillServices(services);
    }
  }

  /**
   * 注册质量检查器
   * @param {Object} checkers - 质量检查器
   */
  registerQualityCheckers(checkers) {
    this.skillServices.qualityCheckers = {
      ...this.skillServices.qualityCheckers,
      ...checkers
    };
    
    if (!this.handler) return;
    for (const [name, checker] of Object.entries(checkers)) {
      if (typeof this.handler.setLayerChecker === 'function') {
        this.handler.setLayerChecker(name, checker);
      } else if (typeof this.handler.setV7Checker === 'function') {
        this.handler.setV7Checker(name, checker);
      }
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
      ready: this.state === 'ready' && !!this.handler,
      isPlaceholder: this.state === 'ready' && !this.handler,
      hasHandler: !!this.handler,
      hasWebSearch: !!this.skillServices.webSearch,
      hasQualityCheckers: Object.keys(this.skillServices.qualityCheckers).length > 0,
      config: this.config
    };
  }

  /**
   * 健康检查
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    const status = this.getStatus();
    
    return {
      healthy: status.ready && !status.isPlaceholder,
      state: this.state,
      name: this.name,
      warning: status.isPlaceholder ? 'Enterprise scenario not implemented' : null
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

module.exports = { EnterpriseAdapter };
