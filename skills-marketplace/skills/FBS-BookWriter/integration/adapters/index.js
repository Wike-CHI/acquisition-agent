/**
 * FBS-BookWriter — 场景适配器统一导出
 */

'use strict';

const { SocialMediaAdapter } = require('./SocialMediaAdapter.js');
const { EnterpriseAdapter } = require('./EnterpriseAdapter.js');
const { ResearchAdapter } = require('./ResearchAdapter.js');

/**
 * 创建所有适配器
 * @param {Object} options - 配置选项
 * @returns {Object} 适配器集合
 */
function createAllAdapters(options = {}) {
  return {
    social: new SocialMediaAdapter(options),
    enterprise: new EnterpriseAdapter(options),
    research: new ResearchAdapter(options)
  };
}

/**
 * 初始化所有适配器
 * @param {Object} adapters - 适配器集合
 * @param {Object} config - 配置
 * @returns {Promise<Object>} 初始化后的适配器
 */
async function initializeAllAdapters(adapters, config = {}) {
  const promises = Object.values(adapters).map(adapter => 
    adapter.initialize(config).catch(err => {
      console.error(`Adapter ${adapter.name} init failed:`, err.message);
      return adapter;
    })
  );
  
  await Promise.all(promises);
  return adapters;
}

module.exports = {
  SocialMediaAdapter,
  EnterpriseAdapter,
  ResearchAdapter,
  createAllAdapters,
  initializeAllAdapters
};
