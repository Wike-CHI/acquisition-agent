/**
 * FBS-BookWriter — ScenarioRouter
 * NLU 驱动的场景路由入口
 */

'use strict';

const path = require('path');
const { EventEmitter } = require('events');

/** 向工作流或适配器注入一层质量检查器（优先 setLayerChecker，兼容旧名 setV7Checker） */
function injectQualityLayer(target, layerName, checker) {
  if (!target || !checker) return;
  if (typeof target.setLayerChecker === 'function') {
    target.setLayerChecker(layerName, checker);
    return;
  }
  if (typeof target.setV7Checker === 'function') {
    target.setV7Checker(layerName, checker);
    return;
  }
  const h = target.handler;
  if (!h) return;
  if (typeof h.setLayerChecker === 'function') h.setLayerChecker(layerName, checker);
  else if (typeof h.setV7Checker === 'function') h.setV7Checker(layerName, checker);
}

/**
 * 璺敱缁撴灉
 * @typedef {Object} RouteResult
 * @property {string} scenario - 鍦烘櫙鍚嶇О (social|enterprise|research|default)
 * @property {string} intent - 鎰忓浘璇嗗埆缁撴灉
 * @property {Object} handler - 鍦烘櫙澶勭悊鍣?
 * @property {Object} params - 鎻愬彇鐨勫弬鏁?
 * @property {string} originalInput - 鍘熷杈撳叆
 */

/**
 * ScenarioRouter
 * 缁熶竴鍏ュ彛灞?- NLU椹卞姩鐨勫満鏅矾鐢?
 *
 * 鍔熻兘锛?
 * - 鎰忓浘璇嗗埆
 * - 鍦烘櫙鍖归厤
 * - 澶勭悊鍣ㄥ垎鍙?
 * - 技能服务注入
 */
class ScenarioRouter extends EventEmitter {
  /**
   * 鏋勯€犲嚱鏁?
   * @param {Object} options - 閰嶇疆閫夐」
   */
  constructor(options = {}) {
    super();
    
    this.logger = options.logger || console;
    this.config = options.config || {};
    
    // 鍦烘櫙澶勭悊鍣紙寤惰繜鍔犺浇锛?
    this.scenarios = {
      social: null,      // 绀惧獟鍦烘櫙
      enterprise: null,  // 浼佷笟鍦烘櫙
      research: null,    // 璋冪爺鍦烘櫙
      default: null      // 默认场景处理器
    };
    
    // 技能服务注册表
    this.skillServices = {
      qualityCheckers: {},
      scoreCalculator: null,
      webSearch: null,
      workflowEngine: null
    };
    
    // 鍦烘櫙璇嗗埆瑙勫垯锛堟寜浼樺厛绾ф帓搴忥級
    this.scenarioRules = [
      {
        scenario: 'social',
        priority: 10,
        patterns: [
          /鐑偣|hotspot|trending/i,
          /灏忕孩涔鐭ヤ箮|寰崥|linkedin/i,
          /鍝佺墝妞嶅叆|brand[- ]?integration/i,
          /澶氬钩鍙皘multi[- ]?platform/i,
          /绀惧獟|social[- ]?media/i
        ],
        intentKeywords: {
          'hotspot.track': ['杩借釜鐑偣', '鐑偣杩借釜', '璺熻釜鐑偣'],
          'content.generate': ['鐢熸垚鍐呭', '鍐欐枃绔?, '鍙戝竷鍐呭'],
          'brand.integrate': ['鍝佺墝妞嶅叆', '鍝佺墝鍏宠仈'],
          'platform.adapt': ['澶氬钩鍙伴€傞厤', '骞冲彴杞崲']
        }
      },
      {
        scenario: 'enterprise',
        priority: 10,
        patterns: [
          /鍩硅|training/i,
          /鎵嬪唽|manual/i,
          /浼佷笟|enterprise|corporate/i,
          /鍐呴儴鐗堟湰|external|澶栧/i,
          /椋庢牸|style/i,
          /瑙掕壊|role/i
        ],
        intentKeywords: {
          'training.create': ['鍒涘缓鍩硅', '鍩硅鎵嬪唽'],
          'style.customize': ['椋庢牸瀹氬埗'],
          'role.define': ['瑙掕壊瀹氫箟']
        }
      },
      {
        scenario: 'research',
        priority: 10,
        patterns: [
          /璋冪爺|research/i,
          /鎼滅储|search/i,
          /澶氳瑷€|multi[- ]?lang/i,
          /妗堜緥|case/i,
          /鎶ュ憡|report/i
        ],
        intentKeywords: {
          'research.search': ['璋冪爺', '鎼滅储淇℃伅'],
          'report.generate': ['鐢熸垚鎶ュ憡', '鍐欐姤鍛?],
          'case.validate': ['妗堜緥楠岃瘉', '妗堜緥鍒嗘瀽']
        }
      }
    ];
    
    // 鎰忓浘鍒板満鏅殑鏄犲皠
    this.intentToScenario = {
      'hotspot.track': 'social',
      'content.generate': 'social',
      'brand.integrate': 'social',
      'platform.adapt': 'social',
      'training.create': 'enterprise',
      'style.customize': 'enterprise',
      'role.define': 'enterprise',
      'research.search': 'research',
      'report.generate': 'research',
      'case.validate': 'research'
    };
    
    // 鍒濆鍖栫姸鎬?
    this.initialized = false;
  }

  /**
   * 鍒濆鍖栬矾鐢?
   * @param {Object} skillServices - 技能服务集合
   */
  async initialize(skillServices = {}) {
    this.logger.info('[ScenarioRouter] Initializing...');
    
    // 注册技能服务
    this.registerSkillServices(skillServices);
    
    this.initialized = true;
    this.emit('initialized');
    
    this.logger.info('[ScenarioRouter] Initialized successfully');
    return this;
  }

  /**
   * 璺敱鍏ュ彛 - 鏍规嵁鐢ㄦ埛杈撳叆閫夋嫨鍦烘櫙骞舵墽琛?
   * @param {Object} input - 鐢ㄦ埛杈撳叆
   * @param {string} input.text - 鐢ㄦ埛鏂囨湰
   * @param {Object} input.context - 涓婁笅鏂囦俊鎭紙鍙€夛級
   * @returns {Promise<RouteResult>} 璺敱缁撴灉
   */
  async route(input) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const startTime = Date.now();
    const { text, context = {} } = input;
    
    try {
      // S1: 鎰忓浘璇嗗埆
      this.logger.debug('[ScenarioRouter] Recognizing intent...');
      const intent = await this.recognizeIntent(text);
      
      // S2: 鍦烘櫙鍖归厤
      this.logger.debug('[ScenarioRouter] Matching scenario...');
      const scenario = this.matchScenario(text, intent);
      
      // S3: 鑾峰彇鍦烘櫙澶勭悊鍣?
      this.logger.debug(`[ScenarioRouter] Getting handler for scenario: ${scenario}`);
      const handler = await this.getScenarioHandler(scenario);
      
      // S4: 鍙傛暟鎻愬彇
      this.logger.debug('[ScenarioRouter] Extracting params...');
      const params = this.extractParams(text, intent, scenario, context);
      
      const result = {
        scenario,
        intent,
        handler,
        params,
        originalInput: text,
        processingTime: Date.now() - startTime
      };
      
      this.emit('route', result);
      return result;
      
    } catch (error) {
      this.logger.error('[ScenarioRouter] Route error', { error: error.message });
      throw error;
    }
  }

  /**
   * 鎵ц璺敱
   * @param {Object} input - 鐢ㄦ埛杈撳叆
   * @returns {Promise<Object>} 鎵ц缁撴灉
   */
  async execute(input) {
    const routeResult = await this.route(input);
    
    if (!routeResult.handler) {
      return {
        success: false,
        error: `No handler for scenario: ${routeResult.scenario}`,
        routeResult
      };
    }
    
    try {
      const executeResult = await routeResult.handler.execute(routeResult.params);
      
      return {
        success: true,
        scenario: routeResult.scenario,
        intent: routeResult.intent,
        result: executeResult,
        processingTime: routeResult.processingTime
      };
      
    } catch (error) {
      this.logger.error('[ScenarioRouter] Execute error', { error: error.message });
      return {
        success: false,
        scenario: routeResult.scenario,
        intent: routeResult.intent,
        error: error.message,
        processingTime: Date.now() - Date.now() + routeResult.processingTime
      };
    }
  }

  /**
   * 鎰忓浘璇嗗埆
   * @param {string} text - 鐢ㄦ埛鏂囨湰
   * @returns {Promise<string>} 鎰忓浘
   * @private
   */
  async recognizeIntent(text) {
    // 鏂规硶1: 鍩轰簬瑙勫垯鐨勬剰鍥惧尮閰?
    for (const rule of this.scenarioRules) {
      for (const [intent, keywords] of Object.entries(rule.intentKeywords)) {
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            return intent;
          }
        }
      }
    }
    
    // 鏂规硶2: 璋冪敤NLU寮曟搸锛堝鏋滄湁锛?
    if (this.config.nluEngine) {
      try {
        const nluResult = await this.config.nluEngine.analyze(text);
        if (nluResult.intent) {
          return nluResult.intent;
        }
      } catch (e) {
        this.logger.warn('[ScenarioRouter] NLU analysis failed', { error: e.message });
      }
    }
    
    return 'unknown';
  }

  /**
   * 鍦烘櫙鍖归厤
   * @param {string} text - 鐢ㄦ埛鏂囨湰
   * @param {string} intent - 鎰忓浘
   * @returns {string} 鍦烘櫙鍚嶇О
   * @private
   */
  matchScenario(text, intent) {
    // S1: 鍩轰簬瑙勫垯鍖归厤
    for (const rule of this.scenarioRules) {
      for (const pattern of rule.patterns) {
        if (pattern.test(text)) {
          return rule.scenario;
        }
      }
    }
    
    // S2: 鍩轰簬鎰忓浘鎺ㄦ柇
    if (this.intentToScenario[intent]) {
      return this.intentToScenario[intent];
    }
    
    // S3: 默认标准场景
    return 'default';
  }

  /**
   * 鑾峰彇鍦烘櫙澶勭悊鍣紙寤惰繜鍔犺浇锛?
   * @param {string} scenario - 鍦烘櫙鍚嶇О
   * @returns {Promise<Object|null>} 鍦烘櫙澶勭悊鍣?
   * @private
   */
  async getScenarioHandler(scenario) {
    // 濡傛灉宸叉湁缂撳瓨锛岀洿鎺ヨ繑鍥?
    if (this.scenarios[scenario]) {
      return this.scenarios[scenario];
    }
    
    // 澶勭悊榛樿鍦烘櫙锛坴7宸ヤ綔娴佸紩鎿庯級
    if (scenario === 'default') {
      if (this.skillServices.workflowEngine) {
        return this.skillServices.workflowEngine;
      }
      return null;
    }
    
    // 鍔ㄦ€佸姞杞藉満鏅ā鍧?
    try {
      let handler;
      
      switch (scenario) {
        case 'social':
          handler = await this.loadSocialMediaScenario();
          break;
          
        case 'enterprise':
          handler = await this.loadEnterpriseScenario();
          break;
          
        case 'research':
          handler = await this.loadResearchScenario();
          break;
          
        default:
          this.logger.warn(`[ScenarioRouter] Unknown scenario: ${scenario}`);
          return null;
      }
      
      // 注入技能服务
      if (handler && handler.registerSkillServices) {
        handler.registerSkillServices(this.skillServices);
      }
      
      this.scenarios[scenario] = handler;
      return handler;
      
    } catch (error) {
      this.logger.error(`[ScenarioRouter] Failed to load scenario: ${scenario}`, { error: error.message });
      return null;
    }
  }

  /**
   * 鍔犺浇绀惧獟鍦烘櫙
   * @private
   */
  async loadSocialMediaScenario() {
    const socialModule = require('../scenarios/social-media/backend/index.js');
    
    const social = new socialModule.SocialMediaWorkflow({
      logger: this.logger
    });
    
    // 注入质量检查器
    if (this.skillServices.qualityCheckers) {
      const checkers = this.skillServices.qualityCheckers;
      if (checkers.gLayer) injectQualityLayer(social, 'GLayer', checkers.gLayer);
      if (checkers.pLayer) injectQualityLayer(social, 'PLayer', checkers.pLayer);
      if (checkers.cLayer) injectQualityLayer(social, 'CLayer', checkers.cLayer);
    }
    
    // 娉ㄥ叆鑱旂綉鎼滅储
    if (this.skillServices.webSearch) {
      social.setWebSearch(this.skillServices.webSearch);
    }
    
    return social;
  }

  /**
   * 鍔犺浇浼佷笟鍦烘櫙
   * @private
   */
  async loadEnterpriseScenario() {
    // 浼佷笟鍦烘櫙寰卐nterprise-coder瀹炵幇
    this.logger.warn('[ScenarioRouter] Enterprise scenario not yet implemented');
    return null;
  }

  /**
   * 鍔犺浇璋冪爺鍦烘櫙
   * @private
   */
  async loadResearchScenario() {
    const researchModule = require('../scenarios/research/backend/index.js');
    
    const research = new researchModule.ResearchOrchestrator({
      logger: this.logger,
      skillRoot: process.env.FBS_SKILL_ROOT || path.join(__dirname, '..'),
      bookRoot: process.env.FBS_BOOK_ROOT || null,
    });
    
    // 注入质量检查器
    if (this.skillServices.qualityCheckers) {
      const checkers = this.skillServices.qualityCheckers;
      if (checkers.gLayer) injectQualityLayer(research, 'GLayer', checkers.gLayer);
      if (checkers.pLayer) injectQualityLayer(research, 'PLayer', checkers.pLayer);
    }
    
    // 娉ㄥ叆鑱旂綉鎼滅储
    if (this.skillServices.webSearch) {
      research.setWebSearch?.(this.skillServices.webSearch);
    }
    
    return research;
  }

  /**
   * 鎻愬彇鍙傛暟
   * @param {string} text - 鐢ㄦ埛鏂囨湰
   * @param {string} intent - 鎰忓浘
   * @param {string} scenario - 鍦烘櫙
   * @param {Object} context - 涓婁笅鏂?
   * @returns {Object} 鎻愬彇鐨勫弬鏁?
   * @private
   */
  extractParams(text, intent, scenario, context) {
    return {
      rawText: text,
      intent,
      scenario,
      context,
      timestamp: new Date().toISOString()
    };
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
    
    // 浼犳挱鍒板凡鍔犺浇鐨勫満鏅?
    for (const [name, handler] of Object.entries(this.scenarios)) {
      if (handler && handler.registerSkillServices) {
        handler.registerSkillServices(this.skillServices);
      }
    }
    
    this.emit('skillServicesRegistered', this.skillServices);
  }

  /**
   * 鑾峰彇璺敱鍣ㄧ姸鎬?
   * @returns {Object} 鐘舵€佷俊鎭?
   */
  getStatus() {
    return {
      initialized: this.initialized,
      scenarios: {
        social: !!this.scenarios.social,
        enterprise: !!this.scenarios.enterprise,
        research: !!this.scenarios.research,
        default: !!this.scenarios.default
      },
      skillServices: {
        hasQualityCheckers: Object.keys(this.skillServices.qualityCheckers).length > 0,
        hasScoreCalculator: !!this.skillServices.scoreCalculator,
        hasWebSearch: !!this.skillServices.webSearch,
        hasWorkflowEngine: !!this.skillServices.workflowEngine
      }
    };
  }

  /**
   * 娣诲姞鍦烘櫙瑙勫垯锛堟墿灞曠敤锛?
   * @param {Object} rule - 鍦烘櫙瑙勫垯
   */
  addScenarioRule(rule) {
    this.scenarioRules.push({
      ...rule,
      priority: rule.priority || 5
    });
    
    // 鎸変紭鍏堢骇鎺掑簭
    this.scenarioRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 娓呴櫎鍦烘櫙缂撳瓨锛堢敤浜庨噸鏂板姞杞斤級
   * @param {string} scenario - 鍦烘櫙鍚嶇О锛屼负绌哄垯娓呴櫎鎵€鏈?
   */
  clearCache(scenario = null) {
    if (scenario) {
      this.scenarios[scenario] = null;
    } else {
      for (const key of Object.keys(this.scenarios)) {
        this.scenarios[key] = null;
      }
    }
  }
}

module.exports = { ScenarioRouter };

