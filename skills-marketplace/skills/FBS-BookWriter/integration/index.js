/**
 * FBS-BookWriter — integration 模块统一导出
 */

'use strict';

const { ScenarioRouter } = require('./ScenarioRouter.js');
const { ScenarioManager } = require('./ScenarioManager.js');
const { 
  SocialMediaAdapter, 
  EnterpriseAdapter, 
  ResearchAdapter,
  createAllAdapters,
  initializeAllAdapters
} = require('./adapters/index.js');
const interfaces = require('./interfaces.js');
const lib = require('./lib/index.js');

/**
 * 创建场景集成入口（路由 + 管理器 + 适配器）
 * @param {Object} options - 配置选项
 * @returns {Object} 扩展场景集成系统
 */
function createScenarioIntegration(options = {}) {
  const logger = options.logger || console;
  
  // 创建场景管理器
  const scenarioManager = new ScenarioManager({ logger });
  
  // 创建路由器
  const router = new ScenarioRouter({ 
    logger,
    config: options.routerConfig || {}
  });
  
  return {
    scenarioManager,
    router,
    
    // 便捷方法
    async initialize(skillServices) {
      await scenarioManager.initialize(skillServices);
      await router.initialize(skillServices);
      return this;
    },
    
    async route(input) {
      return router.route(input);
    },
    
    async execute(input) {
      return router.execute(input);
    },
    
    getStatus() {
      return {
        router: router.getStatus(),
        manager: scenarioManager.getStatus()
      };
    }
  };
}

module.exports = {
  // 核心类
  ScenarioRouter,
  ScenarioManager,

  // 检索 / 账本 / 默认写书编排（增效落地）
  ...lib,
  
  // 适配器
  SocialMediaAdapter,
  EnterpriseAdapter,
  ResearchAdapter,
  createAllAdapters,
  initializeAllAdapters,
  
  // 接口定义
  ...interfaces,
  
  // 工厂函数
  createScenarioIntegration
};
