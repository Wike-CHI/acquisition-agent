/**
 * 分层技能加载系统
 * 只加载必要的技能，避免上下文溢出
 */

class LayeredSkillLoader {
  constructor() {
    this.skillRegistry = this.initSkillRegistry();
    this.loadedSkills = new Map();
    this.maxContextTokens = 98000;
    this.currentUsage = 0;
  }

  /**
   * 初始化技能注册表
   */
  initSkillRegistry() {
    return {
      // 核心技能（总是加载摘要）
      core: {
        'global-customer-acquisition': {
          path: 'SKILL.md',
          fullSize: 79800, // bytes
          summary: '全网获客系统：客户发现→背调→开发信→触达',
          priority: 'critical',
          alwaysLoad: true,
          loadFull: false // 默认只加载摘要
        }
      },

      // 平台技能（按需加载）
      platforms: {
        'linkedin': {
          path: 'skills/linkedin-acquisition/SKILL.md',
          summary: 'LinkedIn决策人搜索',
          priority: 'high',
          triggers: ['linkedin', '决策人', '职业社交']
        },
        'teyi-customs': {
          path: 'skills/teyi-customs/SKILL.md',
          summary: '特易海关数据查询',
          priority: 'high',
          triggers: ['海关', '采购记录', '进出口']
        },
        'facebook': {
          path: 'skills/facebook-acquisition/SKILL.md',
          summary: 'Facebook客户搜索',
          priority: 'medium',
          triggers: ['facebook', 'fb', '社媒']
        },
        'instagram': {
          path: 'skills/instagram-acquisition/SKILL.md',
          summary: 'Instagram客户搜索',
          priority: 'medium',
          triggers: ['instagram', 'ig']
        }
      },

      // 工作流技能（按需加载）
      workflows: {
        'customer-research': {
          path: 'skills/acquisition-coordinator/SKILL.md',
          summary: '客户背调协调器',
          priority: 'high',
          triggers: ['背调', '背景调查', '企业背调']
        },
        'email-outreach': {
          path: 'skills/cold-email-generator/SKILL.md',
          summary: '开发信生成',
          priority: 'high',
          triggers: ['开发信', '邮件', 'email']
        }
      }
    };
  }

  /**
   * 根据任务加载技能
   */
  loadForTask(taskDescription) {
    const needed = this.identifyNeededSkills(taskDescription);
    const loaded = [];

    for (const skillId of needed) {
      const skill = this.findSkill(skillId);
      if (skill) {
        const result = this.loadSkill(skillId, skill);
        if (result) {
          loaded.push(skillId);
        }
      }
    }

    return loaded;
  }

  /**
   * 识别需要的技能
   */
  identifyNeededSkills(taskDescription) {
    const needed = new Set();
    const desc = taskDescription.toLowerCase();

    // 总是包含核心技能（摘要）
    needed.add('global-customer-acquisition');

    // 检查平台触发词
    Object.entries(this.skillRegistry.platforms).forEach(([id, skill]) => {
      if (skill.triggers.some(t => desc.includes(t))) {
        needed.add(id);
      }
    });

    // 检查工作流触发词
    Object.entries(this.skillRegistry.workflows).forEach(([id, skill]) => {
      if (skill.triggers.some(t => desc.includes(t))) {
        needed.add(id);
      }
    });

    return Array.from(needed);
  }

  /**
   * 查找技能
   */
  findSkill(skillId) {
    return (
      this.skillRegistry.core[skillId] ||
      this.skillRegistry.platforms[skillId] ||
      this.skillRegistry.workflows[skillId]
    );
  }

  /**
   * 加载技能
   */
  loadSkill(skillId, skill) {
    // 检查是否已加载
    if (this.loadedSkills.has(skillId)) {
      return this.loadedSkills.get(skillId);
    }

    // 估算大小
    const size = this.estimateSize(skill);

    // 检查是否会溢出
    if (this.currentUsage + size > this.maxContextTokens) {
      // 尝试压缩或卸载低优先级技能
      if (!this.freeSpace(size)) {
        console.warn(`⚠️ 无法加载技能 ${skillId}：上下文空间不足`);
        return null;
      }
    }

    // 加载技能（摘要或完整）
    const content = skill.alwaysLoad && !skill.loadFull
      ? this.loadSummary(skill)
      : this.loadFull(skill);

    // 更新使用情况
    this.currentUsage += size;
    this.loadedSkills.set(skillId, {
      ...skill,
      content,
      loadedAt: new Date().toISOString()
    });

    console.log(`✅ 已加载技能: ${skillId} (${size} tokens)`);
    return this.loadedSkills.get(skillId);
  }

  /**
   * 加载摘要
   */
  loadSummary(skill) {
    return {
      summary: skill.summary,
      priority: skill.priority,
      usage: `使用触发词: ${skill.triggers?.join(', ') || '自动'}`
    };
  }

  /**
   * 加载完整内容
   */
  loadFull(skill) {
    // 实际实现需要读取文件
    // 这里返回结构化信息
    return {
      summary: skill.summary,
      path: skill.path,
      priority: skill.priority,
      // ... 完整内容
    };
  }

  /**
   * 估算技能大小
   */
  estimateSize(skill) {
    // 如果只加载摘要，估算为 100 tokens
    if (skill.alwaysLoad && !skill.loadFull) {
      return 100;
    }

    // 否则估算完整大小
    const bytes = skill.fullSize || 5000; // 默认 5KB
    return Math.ceil(bytes / 1000 * 500); // 1KB ≈ 500 tokens
  }

  /**
   * 释放空间
   */
  freeSpace(requiredSize) {
    // 按优先级排序已加载技能
    const sorted = Array.from(this.loadedSkills.entries())
      .filter(([id, skill]) => skill.priority !== 'critical')
      .sort((a, b) => {
        const priorityOrder = { low: 4, medium: 3, high: 2 };
        return priorityOrder[b[1].priority] - priorityOrder[a[1].priority];
      });

    let freed = 0;

    for (const [id, skill] of sorted) {
      if (freed >= requiredSize) break;

      // 卸载技能
      this.unloadSkill(id);
      freed += this.estimateSize(skill);
    }

    return freed >= requiredSize;
  }

  /**
   * 卸载技能
   */
  unloadSkill(skillId) {
    const skill = this.loadedSkills.get(skillId);
    if (skill) {
      this.currentUsage -= this.estimateSize(skill);
      this.loadedSkills.delete(skillId);
      console.log(`🗑️ 已卸载技能: ${skillId}`);
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      loadedSkills: Array.from(this.loadedSkills.keys()),
      currentUsage: this.currentUsage,
      maxTokens: this.maxContextTokens,
      utilization: `${((this.currentUsage / this.maxContextTokens) * 100).toFixed(1)}%`
    };
  }

  /**
   * 动态调整策略
   */
  optimize() {
    const utilization = this.currentUsage / this.maxContextTokens;

    if (utilization > 0.9) {
      // 使用率超过90%，压缩低优先级技能
      console.log('⚠️ 上下文使用率过高，执行优化...');

      // 将高优先级技能切换为摘要模式
      for (const [id, skill] of this.loadedSkills) {
        if (skill.priority === 'medium' || skill.priority === 'low') {
          this.unloadSkill(id);
        }
      }
    }

    return this.getStatus();
  }
}

module.exports = LayeredSkillLoader;
