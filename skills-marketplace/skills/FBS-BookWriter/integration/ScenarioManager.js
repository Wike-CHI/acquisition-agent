/**
 * FBS-BookWriter — ScenarioManager
 * 统一管理扩展场景的生命周期；依赖外部注入 workflow 与 scenarios 实现。
 */

'use strict';

const { EventEmitter } = require('events');

/**
 * 场景状态
 * @typedef {'uninitialized'|'initializing'|'ready'|'error'|'disposed'} ScenarioState
 */

/**
 * 场景信息
 * @typedef {Object} ScenarioInfo
 * @property {string} name - 场景名称
 * @property {string} version - 场景版本
 * @property {ScenarioState} state - 场景状态
 * @property {Object} handler - 场景处理器
 * @property {Error|null} error - 错误信息
 * @property {number} lastUsed - 最后使用时间戳
 */

/**
 * ScenarioManager
 * 场景管理器
 *
 * 功能：
 * - 场景生命周期管理
 * - 场景状态监控
 * - 技能服务分发（注入的检查器、检索、工作流等）
 * - 场景健康检查
 */
class ScenarioManager extends EventEmitter {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    super();
    
    this.logger = options.logger || console;
    this.config = options.config || {};
    
    // 技能服务注册（由宿主注入）
    this.skillServices = {
      qualityCheckers: {},
      scoreCalculator: null,
      webSearch: null,
      workflowEngine: null,
      /** @type {null|import('./lib/HeartbeatService').HeartbeatService} 可由宿主注入 integration/lib/HeartbeatService.js */
      heartbeatService: null
    };
    
    // 场景注册表
    /** @type {Map<string, ScenarioInfo>} */
    this.scenarios = new Map();
    
    // 注册内置场景
    this.registerBuiltinScenarios();
    
    // 状态
    this.initialized = false;
  }

  /**
   * 注册内置场景
   * @private
   */
  registerBuiltinScenarios() {
    // 社媒场景
    this.scenarios.set('social', {
      name: 'social',
      version: '1.0.0',
      state: 'uninitialized',
      handler: null,
      error: null,
      lastUsed: null,
      modulePath: '../scenarios/social-media/backend/index.js',
      config: {}
    });
    
    // 企业场景
    this.scenarios.set('enterprise', {
      name: 'enterprise',
      version: '1.0.0',
      state: 'uninitialized',
      handler: null,
      error: null,
      lastUsed: null,
      modulePath: '../scenarios/enterprise/backend/index.js',
      config: {}
    });
    
    // 调研场景
    this.scenarios.set('research', {
      name: 'research',
      version: '1.0.0',
      state: 'uninitialized',
      handler: null,
      error: null,
      lastUsed: null,
      modulePath: '../scenarios/research/backend/index.js',
      config: {}
    });
    
    // 默认场景：使用宿主注入的 workflowEngine
    this.scenarios.set('default', {
      name: 'default',
      version: '1.0.0',
      state: 'uninitialized',
      handler: null,
      error: null,
      lastUsed: null,
      modulePath: null,
      config: {},
      /** 使用注入的 workflowEngine，勿在未注入时当作可运行默认场景 */
      usesInjectedWorkflowEngine: true
    });
  }

  /**
   * 初始化管理器
   * @param {Object} skillServices - 技能服务集合（检索、检查器、工作流等）
   */
  async initialize(skillServices = {}) {
    this.logger.info('[ScenarioManager] Initializing...');
    
    // 注册技能服务
    this.registerSkillServices(skillServices);
    
    this.initialized = true;
    this.emit('initialized');
    
    this.logger.info('[ScenarioManager] Initialized successfully');
    return this;
  }

  /**
   * 注册技能服务
   * @param {Object} skillServices - 技能服务集合
   */
  registerSkillServices(skillServices) {
    this.skillServices = {
      ...this.skillServices,
      ...skillServices
    };
    
    // 更新已初始化的场景
    for (const [name, info] of this.scenarios) {
      if (info.handler && typeof info.handler.registerSkillServices === 'function') {
        info.handler.registerSkillServices(this.skillServices);
      }
    }
    
    this.emit('skillServicesUpdated', this.skillServices);
  }

  /**
   * 获取场景处理器
   * @param {string} scenarioName - 场景名称
   * @returns {Promise<Object|null>} 场景处理器
   */
  async getScenario(scenarioName) {
    const info = this.scenarios.get(scenarioName);
    
    if (!info) {
      this.logger.warn(`[ScenarioManager] Unknown scenario: ${scenarioName}`);
      return null;
    }
    
    // 如果已初始化，直接返回
    if (info.state === 'ready' && info.handler) {
      info.lastUsed = Date.now();
      return info.handler;
    }
    
    // 初始化场景
    if (info.state === 'uninitialized' || info.state === 'error') {
      await this.initializeScenario(scenarioName);
    }
    
    return info.handler;
  }

  /**
   * 初始化单个场景
   * @param {string} scenarioName - 场景名称
   * @private
   */
  async initializeScenario(scenarioName) {
    const info = this.scenarios.get(scenarioName);
    
    if (!info) {
      throw new Error(`Unknown scenario: ${scenarioName}`);
    }
    
    this.logger.info(`[ScenarioManager] Initializing scenario: ${scenarioName}`);
    info.state = 'initializing';
    this.emit('scenarioStateChange', { scenario: scenarioName, state: 'initializing' });
    
    try {
      if (info.usesInjectedWorkflowEngine) {
        // 默认场景：使用宿主注入的工作流引擎
        info.handler = this.skillServices.workflowEngine;
      } else {
        // 扩展场景：动态加载模块
        const module = require(info.modulePath);
        info.handler = this.createScenarioHandler(scenarioName, module);
      }
      
      // 向场景处理器注册技能服务
      if (info.handler && typeof info.handler.registerSkillServices === 'function') {
        info.handler.registerSkillServices(this.skillServices);
      }
      
      info.state = 'ready';
      info.error = null;
      info.lastUsed = Date.now();
      
      this.emit('scenarioStateChange', { scenario: scenarioName, state: 'ready' });
      this.logger.info(`[ScenarioManager] Scenario ready: ${scenarioName}`);
      
    } catch (error) {
      info.state = 'error';
      info.error = error;
      
      this.emit('scenarioStateChange', { scenario: scenarioName, state: 'error', error: error.message });
      this.logger.error(`[ScenarioManager] Scenario init failed: ${scenarioName}`, { error: error.message });
    }
  }

  /**
   * 创建场景处理器
   * @param {string} scenarioName - 场景名称
   * @param {Object} module - 场景模块
   * @returns {Object} 场景处理器
   * @private
   */
  createScenarioHandler(scenarioName, module) {
    switch (scenarioName) {
      case 'social':
        return new module.SocialMediaWorkflow({ logger: this.logger });
        
      case 'research':
        return new module.ResearchOrchestrator({ logger: this.logger });
        
      case 'enterprise':
        return new module.EnterpriseWorkflow({ logger: this.logger });
        
      default:
        return null;
    }
  }

  /**
   * 获取所有已就绪的场景
   * @returns {Promise<string[]>} 场景名称列表
   */
  async getReadyScenarios() {
    const ready = [];
    
    for (const [name, info] of this.scenarios) {
      if (info.state === 'ready') {
        ready.push(name);
      }
    }
    
    return ready;
  }

  /**
   * 获取场景状态
   * @param {string} scenarioName - 场景名称
   * @returns {ScenarioState} 场景状态
   */
  getScenarioState(scenarioName) {
    const info = this.scenarios.get(scenarioName);
    return info ? info.state : null;
  }

  /**
   * 获取所有场景状态
   * @returns {Object} 场景状态映射
   */
  getAllScenarioStates() {
    const states = {};
    
    for (const [name, info] of this.scenarios) {
      states[name] = {
        state: info.state,
        version: info.version,
        lastUsed: info.lastUsed,
        error: info.error?.message || null
      };
    }
    
    return states;
  }

  /**
   * 健康检查
   * @returns {Promise<Object>} 健康状态
   */
  async healthCheck() {
    const results = {};
    let allHealthy = true;
    
    for (const [name, info] of this.scenarios) {
      if (info.state === 'error') {
        results[name] = {
          healthy: false,
          error: info.error?.message || 'Unknown error'
        };
        allHealthy = false;
      } else if (info.state === 'ready') {
        // 执行处理器健康检查（如果有）
        if (typeof info.handler?.healthCheck === 'function') {
          try {
            results[name] = await info.handler.healthCheck();
          } catch (e) {
            results[name] = { healthy: false, error: e.message };
            allHealthy = false;
          }
        } else {
          results[name] = { healthy: true };
        }
      } else {
        results[name] = { healthy: false, state: info.state };
        if (info.state !== 'uninitialized') {
          allHealthy = false;
        }
      }
    }
    
    return {
      healthy: allHealthy,
      scenarios: results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 预热场景（提前初始化）
   * @param {string[]} scenarioNames - 场景名称列表
   */
  async warmup(scenarioNames) {
    this.logger.info(`[ScenarioManager] Warming up scenarios: ${scenarioNames.join(', ')}`);
    
    const promises = scenarioNames.map(name => this.getScenario(name));
    await Promise.all(promises);
    
    this.emit('warmupComplete', { scenarios: scenarioNames });
  }

  /**
   * 释放场景资源
   * @param {string} scenarioName - 场景名称
   */
  async disposeScenario(scenarioName) {
    const info = this.scenarios.get(scenarioName);
    
    if (!info) {
      return;
    }
    
    if (typeof info.handler?.dispose === 'function') {
      await info.handler.dispose();
    }
    
    info.state = 'disposed';
    info.handler = null;
    
    this.emit('scenarioStateChange', { scenario: scenarioName, state: 'disposed' });
  }

  /**
   * 释放所有场景资源
   */
  async disposeAll() {
    for (const name of this.scenarios.keys()) {
      await this.disposeScenario(name);
    }
    
    this.initialized = false;
    this.emit('disposed');
  }

  /**
   * 注册自定义场景
   * @param {string} name - 场景名称
   * @param {Object} config - 场景配置
   */
  registerScenario(name, config) {
    if (this.scenarios.has(name)) {
      this.logger.warn(`[ScenarioManager] Scenario already exists: ${name}`);
      return;
    }
    
    this.scenarios.set(name, {
      name,
      version: config.version || '1.0.0',
      state: 'uninitialized',
      handler: null,
      error: null,
      lastUsed: null,
      modulePath: config.modulePath,
      config: config,
      usesInjectedWorkflowEngine: false
    });
    
    this.emit('scenarioRegistered', { name, config });
  }

  /**
   * 获取管理器状态
   * @returns {Object} 状态信息
   */
  getStatus() {
    return {
      initialized: this.initialized,
      scenarioCount: this.scenarios.size,
      readyCount: [...this.scenarios.values()].filter(s => s.state === 'ready').length,
      skillServices: {
        hasQualityCheckers: Object.keys(this.skillServices.qualityCheckers).length > 0,
        hasScoreCalculator: !!this.skillServices.scoreCalculator,
        hasWebSearch: !!this.skillServices.webSearch,
        hasWorkflowEngine: !!this.skillServices.workflowEngine
      }
    };
  }
}

module.exports = { ScenarioManager };
