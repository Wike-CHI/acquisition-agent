/**
 * 技能设计器
 * 根据困难案例自动设计新技能
 */

class SkillDesigner {
  constructor() {
    this.skillTemplates = this.loadSkillTemplates();
  }

  /**
   * 加载技能模板
   */
  loadSkillTemplates() {
    return [
      {
        type: 'extraction',
        template: {
          name: 'extract_${field}',
          description: '从上下文中提取${field}信息',
          triggers: [],
          implementation: '提取逻辑'
        }
      },
      {
        type: 'scoring',
        template: {
          name: 'assess_${dimension}',
          description: '评估${dimension}维度',
          triggers: [],
          implementation: '评分逻辑'
        }
      },
      {
        type: 'handling',
        template: {
          name: 'handle_${objection}',
          description: '处理${objection}异议',
          triggers: [],
          implementation: '异议处理逻辑'
        }
      }
    ];
  }

  /**
   * 设计新技能
   */
  async designSkills(hardCases) {
    const newSkills = [];

    for (const hardCase of hardCases) {
      // 根据模式选择模板
      const template = this.selectTemplate(hardCase.pattern);

      // 填充模板
      const skill = this.fillTemplate(template, hardCase);

      // 验证技能
      if (this.validateSkill(skill)) {
        newSkills.push(skill);
      }
    }

    console.log(`🎨 设计了 ${newSkills.length} 个新技能`);

    return newSkills;
  }

  /**
   * 选择模板
   */
  selectTemplate(pattern) {
    const patternMap = {
      '信息提取失败': this.skillTemplates[0],
      'ICP评分不准确': this.skillTemplates[1],
      '异议处理缺失': this.skillTemplates[2],
      '上下文溢出': null,
      '记忆质量低': null,
      '缺少必要的技能': this.skillTemplates[0],
      '技能选择错误': null
    };

    return patternMap[pattern] || this.skillTemplates[0];
  }

  /**
   * 填充模板
   */
  fillTemplate(template, hardCase) {
    const field = this.inferField(hardCase);
    const dimension = this.inferDimension(hardCase);
    const objection = this.inferObjection(hardCase);

    return {
      id: `${template.type}_${field}_${Date.now()}`,
      name: template.template.name
        .replace('${field}', field)
        .replace('${dimension}', dimension)
        .replace('${objection}', objection),
      description: template.template.description
        .replace('${field}', field)
        .replace('${dimension}', dimension)
        .replace('${objection}', objection),
      triggers: this.inferTriggers(hardCase),
      priority: 2,
      createdAt: new Date().toISOString(),
      source: 'auto_evolved'
    };
  }

  /**
   * 推断字段
   */
  inferField(hardCase) {
    const text = JSON.stringify(hardCase);

    if (text.includes('预算') || text.includes('价格')) return 'budget';
    if (text.includes('公司')) return 'company';
    if (text.includes('产品')) return 'product';
    if (text.includes('时间')) return 'timeline';
    if (text.includes('决策')) return 'decision_maker';

    if (text.includes('国家')) return 'country';
    if (text.includes('行业')) return 'industry';

    return 'general_info';
  }

  /**
   * 推断维度
   */
  inferDimension(hardCase) {
    const text = JSON.stringify(hardCase);

    if (text.includes('预算')) return 'budget';
    if (text.includes('规模')) return 'company_size';
    if (text.includes('需求')) return 'need';
    if (text.includes('紧迫')) return 'timeline';

    return 'general';
  }

  /**
   * 推断异议
   */
  inferObjection(hardCase) {
    const text = JSON.stringify(hardCase);

    if (text.includes('太贵')) return 'price';
    if (text.includes('不需要')) return 'need';
    if (text.includes('考虑')) return 'timing';
    if (text.includes('信任')) return 'trust';

    return 'general';
  }

  /**
   * 推断触发词
   */
  inferTriggers(hardCase) {
    const triggers = [];
    const text = JSON.stringify(hardCase).toLowerCase();

    // 提取关键词
    const keywords = ['预算', '价格', '公司', '产品', '时间', '决策', '国家', '行业'];
    keywords.forEach(kw => {
      if (text.includes(kw)) {
        triggers.push(kw);
      }
    });

    return triggers;
  }

  /**
   * 验证技能
   */
  validateSkill(skill) {
    // 检查必需字段
    if (!skill.name || !skill.description) {
      return false;
    }

    // 检查触发词
    if (!skill.triggers || skill.triggers.length === 0) {
      return false;
    }

    return true;
  }
}

module.exports = SkillDesigner;
