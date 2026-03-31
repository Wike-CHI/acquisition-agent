/**
 * Skills Router - 红龙获客系统技能路由器
 * 
 * 核心能力:
 * 1. 意图识别 - 从用户请求中提取获客意图
 * 2. 渠道选择 - 根据意图+市场+可用性选出最优技能
 * 3. 故障切换 - 主技能不可用时自动切换备选
 * 
 * 与已有模块的关系:
 * - 调用 SkillController 做关键词嵌入匹配
 * - 调用 LayeredSkillLoader 做按需加载
 * - 路由规则来自 CHANNEL-ROUTER.md 的决策树
 * 
 * 创建时间: 2026-03-30
 */

'use strict';

// ─────────────────────────────────────────────────────────
// 路由表配置（对应 CHANNEL-ROUTER.md 的决策树）
// ─────────────────────────────────────────────────────────
const ROUTING_TABLE = {
  // 意图 → 渠道优先级列表
  customer_discovery: {
    domestic: [
      { skill: 'weibo',   priority: 5, desc: '微博搜索（国内实时活跃）' },
      { skill: 'wechat',  priority: 4, desc: '微信公众号（国内专业内容）' },
      { skill: 'baidu',   priority: 3, desc: '百度/天眼查（企业背调）' }
    ],
    overseas: [
      { skill: 'teyi',    priority: 5, desc: '特易海关数据（真实采购记录）' },
      { skill: 'exa',     priority: 5, desc: 'Exa搜索（全球企业/LinkedIn公开数据）' },
      { skill: 'facebook',priority: 4, desc: 'Facebook（社媒客户挖掘）' }
    ]
  },
  company_research: {
    domestic: [
      { skill: 'tianyancha', priority: 5, desc: '天眼查（国内企业信息权威）' },
      { skill: 'baidu',      priority: 4, desc: '百度百科（基础背调）' }
    ],
    overseas: [
      { skill: 'teyi',       priority: 5, desc: '特易海关（采购记录）' },
      { skill: 'jina-reader',priority: 5, desc: 'Jina Reader（官网深度读取）' },
      { skill: 'exa',        priority: 4, desc: 'Exa（企业新闻/财务信息）' }
    ]
  },
  decision_maker_search: {
    domestic: [
      { skill: 'exa',        priority: 5, desc: 'Exa搜索LinkedIn公开档案（决策人）' },
      { skill: 'tianyancha', priority: 4, desc: '天眼查（法人/联系人）' }
    ],
    overseas: [
      { skill: 'exa',        priority: 5, desc: 'Exa搜索LinkedIn公开档案（采购负责人/决策人）' }
    ]
  },
  email_outreach: {
    domestic: [
      { skill: 'email-sender',        priority: 5, desc: '邮件发送（163 SMTP）' },
      { skill: 'delivery-queue',      priority: 4, desc: '分段发送（模拟真人节奏）' }
    ],
    overseas: [
      { skill: 'delivery-queue',      priority: 5, desc: '分段发送（海外反垃圾）' },
      { skill: 'email-sender',        priority: 4, desc: '邮件发送' },
      { skill: 'email-outreach-ops',  priority: 3, desc: '开发信运营（询价/跟进）' }
    ]
  },
  linkedin_outreach: {
    overseas: [
      { skill: 'linkedin',   priority: 5, desc: 'LinkedIn 私信/连接请求（agent-browser AI驱动）' }
    ],
    domestic: [
      { skill: 'linkedin',   priority: 5, desc: 'LinkedIn 私信/连接请求（agent-browser AI驱动）' }
    ]
  },
  full_pipeline: {
    overseas: [
      // 完整流程：由 acquisition-coordinator 编排
      { skill: 'acquisition-coordinator', priority: 5, desc: '获客任务编排器（完整流程）' }
    ]
  }
};

// ─────────────────────────────────────────────────────────
// 意图识别规则
// ─────────────────────────────────────────────────────────
const INTENT_PATTERNS = [
  {
    intent: 'full_pipeline',
    patterns: ['完整流程', '端到端', '全流程获客', '批量获客', '全自动', '开始获客'],
    weight: 10  // 最高权重，全流程意图优先识别
  },
  {
    intent: 'customer_discovery',
    patterns: ['找客户', '搜索客户', '获客', '客户发现', '搜索', '找潜在', '潜在客户',
               '输送带', '制造商', '供应商', '采购商', '批发商', 'manufacturer', 'supplier'],
    weight: 5
  },
  {
    intent: 'company_research',
    patterns: ['背调', '背景调查', '企业背调', '了解公司', 'ICP评分', '评估客户',
               '竞品分析', '供应商分析', '公司信息', 'company research'],
    weight: 5
  },
  {
    intent: 'decision_maker_search',
    patterns: ['决策人', '采购负责人', '联系人', '找联系方式', 'LinkedIn搜索',
               'purchasing manager', 'decision maker', '负责人'],
    weight: 5
  },
  {
    intent: 'linkedin_outreach',
    patterns: ['LinkedIn私信', 'linkedin 私信', 'InMail', 'inmail', '发连接请求',
               'LinkedIn outreach', 'linkedin connect', '私信决策人',
               'LinkedIn触达', 'LinkedIn联系'],
    weight: 10  // 高权重，避免被 email_outreach 的"触达"关键词抢走
  },
  {
    intent: 'email_outreach',
    patterns: ['发邮件', '开发信', '邮件发送', '触达', '联系客户', 'cold email',
               '询价', '跟进', '发送', 'send email'],
    weight: 5
  }
];

// ─────────────────────────────────────────────────────────
// 市场类型识别
// ─────────────────────────────────────────────────────────
const MARKET_PATTERNS = {
  domestic: ['国内', '中国', '国内客户', '大陆', '内地', '中文', '天眼查'],
  overseas: ['海外', '国外', '外国', '美国', '欧洲', '东南亚', '英语', '英文',
             'USA', 'US', 'Europe', 'international', 'global', 'overseas',
             'conveyor', 'belt', 'manufacturer']
};

// ─────────────────────────────────────────────────────────
// 技能状态注册表（运行时动态更新）
// ─────────────────────────────────────────────────────────
const SKILL_STATUS = {
  'weibo':                 { available: true,  requiresSetup: false },
  'wechat':                { available: true,  requiresSetup: false },
  'baidu':                 { available: true,  requiresSetup: false },
  'tianyancha':            { available: true,  requiresSetup: false },
  'teyi':                  { available: true,  requiresSetup: true,  note: '首次使用请运行「初始化获客系统」配置特易凭据' },
  'linkedin':              { available: true,  requiresSetup: true,  note: '私信/连接请求可用（agent-browser驱动），搜索已由Exa替代；需先保存Session文件' },
  'exa':                   { available: true,  requiresSetup: false },
  'facebook':              { available: false, requiresSetup: true,  note: '需配置 Edge + Playwright' },
  'instagram':             { available: false, requiresSetup: true,  note: '需配置 Edge + Playwright' },
  'jina-reader':           { available: true,  requiresSetup: false },
  'email-sender':          { available: true,  requiresSetup: true,  note: '首次使用请运行 email-sender setup 配置个人邮箱' },
  'delivery-queue':        { available: true,  requiresSetup: false },
  'email-outreach-ops':    { available: true,  requiresSetup: false },
  'acquisition-coordinator': { available: true, requiresSetup: false }
};

// ─────────────────────────────────────────────────────────
// 核心路由器类
// ─────────────────────────────────────────────────────────
class SkillsRouter {
  constructor(options = {}) {
    // 深拷贝状态表，避免多实例间共享引用
    this.skillStatus = JSON.parse(JSON.stringify({ ...SKILL_STATUS, ...options.skillStatusOverrides }));
    this.verbose = options.verbose !== false; // 默认开启日志
  }

  /**
   * 主入口：接收用户请求，返回路由决策
   * 
   * @param {string} userRequest - 用户原始请求
   * @param {object} context     - 附加上下文（可选）
   * @returns {RouterResult}
   */
  route(userRequest, context = {}) {
    this._log(`\n🔀 Skills Router 开始路由...`);
    this._log(`📥 用户请求: "${userRequest}"`);

    // Step 1: 意图识别
    const intent = this.detectIntent(userRequest, context);
    this._log(`🎯 识别意图: ${intent}`);

    // Step 2: 市场类型判断
    const market = this.detectMarket(userRequest, context);
    this._log(`🌏 判断市场: ${market}`);

    // Step 3: 获取候选技能列表
    const candidates = this.getCandidates(intent, market);

    // Step 4: 可用性过滤 + 故障切换
    const { selected, fallbacks, unavailable } = this.applyAvailability(candidates);

    // Step 5: 生成路由结果
    const result = this.buildResult({
      intent,
      market,
      selected,
      fallbacks,
      unavailable,
      userRequest
    });

    this._log(`✅ 路由完成: ${selected.map(s => s.skill).join(', ')}`);
    if (fallbacks.length > 0) {
      this._log(`⚠️ 备选技能: ${fallbacks.map(s => s.skill).join(', ')}`);
    }

    return result;
  }

  // ─── 意图识别 ───────────────────────────────────────────

  detectIntent(text, context = {}) {
    // 上下文提示优先
    if (context.intent) return context.intent;

    const lower = text.toLowerCase();
    let bestIntent = 'customer_discovery'; // 默认意图
    let bestScore = 0;

    for (const { intent, patterns, weight } of INTENT_PATTERNS) {
      let score = 0;
      for (const pattern of patterns) {
        if (lower.includes(pattern.toLowerCase())) {
          // 每次命中，得分 = 该模式的字符长度 × weight（避免短词如"获客"污染全流程判断）
          score += pattern.length * weight;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    return bestIntent;
  }

  // ─── 市场类型判断 ─────────────────────────────────────────

  detectMarket(text, context = {}) {
    // 上下文提示优先
    if (context.market) return context.market;

    const lower = text.toLowerCase();
    let domesticScore = 0;
    let overseasScore = 0;

    for (const kw of MARKET_PATTERNS.domestic) {
      if (lower.includes(kw.toLowerCase())) domesticScore++;
    }
    for (const kw of MARKET_PATTERNS.overseas) {
      if (lower.includes(kw.toLowerCase())) overseasScore++;
    }

    if (domesticScore > overseasScore) return 'domestic';
    if (overseasScore > domesticScore) return 'overseas';

    // 默认走海外（红龙主业是出口）
    return 'overseas';
  }

  // ─── 候选技能获取 ─────────────────────────────────────────

  getCandidates(intent, market) {
    const table = ROUTING_TABLE[intent];
    if (!table) return [];

    // 先找市场匹配的，没有则用 overseas 兜底
    return table[market] || table['overseas'] || [];
  }

  // ─── 可用性过滤 + 故障切换 ────────────────────────────────

  applyAvailability(candidates) {
    const selected = [];
    const fallbacks = [];
    const unavailable = [];

    for (const candidate of candidates) {
      const status = this.skillStatus[candidate.skill];

      if (!status) {
        // 未注册的技能，假设可用
        selected.push({ ...candidate, status: 'unknown' });
        continue;
      }

      if (status.available) {
        selected.push({ ...candidate, status: 'available' });
      } else {
        unavailable.push({
          ...candidate,
          reason: status.note || '技能当前不可用'
        });
        // 尝试找同意图下的替代
        const alt = this._findFallback(candidate.skill, candidates);
        if (alt) {
          fallbacks.push({ ...alt, replacedBy: candidate.skill });
        }
      }
    }

    return { selected, fallbacks, unavailable };
  }

  // ─── 构建路由结果 ─────────────────────────────────────────

  buildResult({ intent, market, selected, fallbacks, unavailable, userRequest }) {
    const hasSelected = selected.length > 0;

    return {
      success: hasSelected,
      intent,
      market,
      // 推荐技能（按优先级排序）
      skills: selected.sort((a, b) => b.priority - a.priority),
      // 自动切换的备选
      fallbacks,
      // 不可用列表（含原因）
      unavailable,
      // 人类可读的摘要
      summary: this._buildSummary({ intent, market, selected, fallbacks, unavailable }),
      // 时间戳
      routedAt: new Date().toISOString(),
      // 原始请求
      originalRequest: userRequest
    };
  }

  // ─── 辅助：查找备选技能 ───────────────────────────────────

  _findFallback(primarySkill, candidates) {
    // 预定义的故障切换映射
    const FALLBACK_MAP = {
      'linkedin': 'exa',        // LinkedIn不可用 → Exa搜索LinkedIn索引
      'facebook': 'exa',        // Facebook不可用 → Exa
      'instagram': 'exa',       // Instagram不可用 → Exa
      'teyi':     'exa',        // 特易不可用 → Exa搜索海关数据
      'wechat':   'baidu',      // 微信不可用 → 百度
    };

    const fallbackSkill = FALLBACK_MAP[primarySkill];
    if (!fallbackSkill) return null;

    // 从候选列表中找到备选
    const fallback = candidates.find(c => c.skill === fallbackSkill);
    if (fallback && this.skillStatus[fallbackSkill]?.available !== false) {
      return fallback;
    }
    return null;
  }

  // ─── 辅助：生成人类可读摘要 ───────────────────────────────

  _buildSummary({ intent, market, selected, fallbacks, unavailable }) {
    const INTENT_CN = {
      customer_discovery:    '客户发现',
      company_research:      '企业背调',
      decision_maker_search: '决策人搜索',
      email_outreach:        '邮件触达',
      full_pipeline:         '完整获客流程'
    };
    const MARKET_CN = { domestic: '国内', overseas: '海外' };

    let lines = [
      `📋 路由摘要`,
      `  意图: ${INTENT_CN[intent] || intent} | 市场: ${MARKET_CN[market] || market}`,
    ];

    if (selected.length > 0) {
      lines.push(`  ✅ 选用技能 (${selected.length}个):`);
      selected
        .sort((a, b) => b.priority - a.priority)
        .forEach(s => lines.push(`     - ${s.skill}: ${s.desc}`));
    }

    if (fallbacks.length > 0) {
      lines.push(`  🔄 自动切换备选:`);
      fallbacks.forEach(f => lines.push(`     - ${f.skill}（替代不可用的 ${f.replacedBy}）`));
    }

    if (unavailable.length > 0) {
      lines.push(`  ❌ 不可用技能:`);
      unavailable.forEach(u => lines.push(`     - ${u.skill}: ${u.reason}`));
    }

    return lines.join('\n');
  }

  // ─── 辅助：更新技能可用状态（运行时调用）──────────────────

  /**
   * 标记技能为可用
   */
  markAvailable(skillName) {
    if (this.skillStatus[skillName]) {
      this.skillStatus[skillName].available = true;
      this._log(`✅ 技能已标记为可用: ${skillName}`);
    }
  }

  /**
   * 标记技能为不可用
   */
  markUnavailable(skillName, reason = '') {
    if (this.skillStatus[skillName]) {
      this.skillStatus[skillName].available = false;
      if (reason) this.skillStatus[skillName].note = reason;
      this._log(`❌ 技能已标记为不可用: ${skillName} (${reason})`);
    }
  }

  /**
   * 批量更新技能状态
   */
  updateStatus(statusMap) {
    Object.entries(statusMap).forEach(([skill, status]) => {
      if (this.skillStatus[skill]) {
        Object.assign(this.skillStatus[skill], status);
      }
    });
  }

  /**
   * 获取所有技能当前状态
   */
  getStatus() {
    const available = [];
    const unavailable = [];
    Object.entries(this.skillStatus).forEach(([skill, s]) => {
      (s.available ? available : unavailable).push(skill);
    });
    return { available, unavailable };
  }

  // ─── 内部日志 ─────────────────────────────────────────────

  _log(msg) {
    if (this.verbose) console.log(msg);
  }
}

// ─────────────────────────────────────────────────────────
// 便捷函数：直接路由，不需要实例化
// ─────────────────────────────────────────────────────────

/**
 * 快速路由（单例模式）
 * @param {string} userRequest
 * @param {object} context
 */
let _defaultRouter = null;
function route(userRequest, context = {}) {
  if (!_defaultRouter) {
    _defaultRouter = new SkillsRouter();
  }
  return _defaultRouter.route(userRequest, context);
}

// ─────────────────────────────────────────────────────────
// 导出
// ─────────────────────────────────────────────────────────

module.exports = {
  SkillsRouter,
  route,
  ROUTING_TABLE,
  INTENT_PATTERNS,
  SKILL_STATUS
};
