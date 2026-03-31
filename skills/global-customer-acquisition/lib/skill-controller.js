/**
 * 技能控制器
 * 根据上下文自动选择合适的技能
 */

class SkillController {
  constructor() {
    this.skillBank = new Map();
    this.skillEmbeddings = new Map();
    this.loadBaseSkills();
  }

  /**
   * 加载基础技能
   */
  loadBaseSkills() {
    const baseSkills = [
      {
        id: 'extract_customer_info',
        name: '提取客户信息',
        description: '从对话中提取客户基本信息（公司、国家、行业）',
        triggers: ['客户介绍', '公司信息', '国家', '行业'],
        priority: 1
      },
      {
        id: 'extract_budget',
        name: '提取预算信息',
        description: '识别客户的预算范围和付款偏好',
        triggers: ['预算', '价格', '成本', '投资'],
        priority: 2
      },
      {
        id: 'extract_decision_maker',
        name: '识别决策者',
        description: '判断对话者是否为决策者或影响者',
        triggers: ['决策', '老板', '采购', '负责人'],
        priority: 2
      },
      {
        id: 'extract_product_interest',
        name: '提取产品兴趣',
        description: '识别客户感兴趣的产品和规格',
        triggers: ['产品', '规格', '型号', '需求'],
        priority: 1
      },
      {
        id: 'extract_timeline',
        name: '提取时间线',
        description: '识别客户的采购时间计划',
        triggers: ['时间', '计划', '交期', '什么时候'],
        priority: 2
      },
      {
        id: 'assess_icp_score',
        name: '评估ICP评分',
        description: '根据BANT信息评估客户ICP评分',
        triggers: ['评分', 'ICP', '质量', '优先级'],
        priority: 3
      },
      {
        id: 'identify_objections',
        name: '识别异议',
        description: '识别客户的异议和顾虑',
        triggers: ['太贵', '不需要', '考虑', '担心'],
        priority: 2
      },
      {
        id: 'track_competitors',
        name: '追踪竞争对手',
        description: '识别客户提到的竞争对手',
        triggers: ['竞争对手', '其他供应商', '对比', '比较'],
        priority: 3
      },
      {
        id: 'adapt_to_budget',
        name: '预算适配',
        description: '根据预算限制提供替代方案',
        triggers: ['预算不足', '太贵', '降级', '便宜'],
        priority: 2
      },
      {
        id: 'build_relationship',
        name: '建立关系',
        description: '建立信任和长期关系',
        triggers: ['信任', '合作', '长期', '关系'],
        priority: 3
      }
    ];

    baseSkills.forEach(skill => {
      this.skillBank.set(skill.id, skill);
      this.buildEmbedding(skill);
    });

    console.log(`✅ 已加载 ${baseSkills.length} 个基础技能`);
  }

  /**
   * 构建技能嵌入（简化版）
   */
  buildEmbedding(skill) {
    const keywords = [...skill.triggers, skill.name, skill.description];
    const embedding = new Set();

    keywords.forEach(text => {
      text.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 1) {
          embedding.add(word);
        }
      });
    });

    this.skillEmbeddings.set(skill.id, Array.from(embedding));
  }

  /**
   * 选择技能（MemSkill 核心）
   */
  selectSkills(context, topK = 3) {
    const contextWords = this.tokenize(context);
    const scores = new Map();

    // 计算每个技能的匹配分数
    for (const [skillId, embedding] of this.skillEmbeddings) {
      const score = this.calculateScore(contextWords, embedding);
      scores.set(skillId, score);
    }

    // 排序并返回 Top-K
    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    const selectedSkills = sorted.map(([skillId, score]) => ({
      ...this.skillBank.get(skillId),
      score
    }));

    console.log(`🎯 已选择 ${selectedSkills.length} 个技能: ${selectedSkills.map(s => s.name).join(', ')}`);

    return selectedSkills;
  }

  /**
   * 分词
   */
  tokenize(text) {
    if (!text) return [];

    const words = new Set();

    // 中文分词（简单）
    const chineseWords = text.match(/[\u4e00-\u9fa5]+/g) || [];
    chineseWords.forEach(word => {
      for (let i = 0; i < word.length; i++) {
        for (let j = i + 1; j <= Math.min(i + 4, word.length); j++) {
          words.add(word.substring(i, j));
        }
      }
    });

    // 英文分词
    const englishWords = text.toLowerCase().match(/[a-z]+/g) || [];
    englishWords.forEach(word => words.add(word));

    return Array.from(words);
  }

  /**
   * 计算匹配分数
   */
  calculateScore(contextWords, embedding) {
    let score = 0;

    contextWords.forEach(word => {
      if (embedding.includes(word)) {
        score += 1;
      }
    });

    // 归一化
    return score / Math.max(contextWords.length, 1);
  }

  /**
   * 添加新技能
   */
  addSkill(skill) {
    this.skillBank.set(skill.id, skill);
    this.buildEmbedding(skill);

    console.log(`✅ 已添加新技能: ${skill.name}`);
  }

  /**
   * 更新技能
   */
  updateSkill(skillId, updates) {
    const skill = this.skillBank.get(skillId);
    if (skill) {
      const updated = { ...skill, ...updates };
      this.skillBank.set(skillId, updated);
      this.buildEmbedding(updated);

      console.log(`✅ 已更新技能: ${skill.name}`);
    }
  }

  /**
   * 获取所有技能
   */
  getAllSkills() {
    return Array.from(this.skillBank.values());
  }
}

module.exports = SkillController;
