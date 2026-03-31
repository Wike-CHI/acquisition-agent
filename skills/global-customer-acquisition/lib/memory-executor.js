/**
 * 记忆执行器
 * 根据选择的技能构建记忆（MemSkill 核心功能）
 */

class MemoryExecutor {
  constructor() {
    this.skillImplementations = this.loadSkillImplementations();
  }

  /**
   * 加载技能实现
   */
  loadSkillImplementations() {
    return {
      extract_customer_info: {
        execute: (context) => {
          const info = {
            company: this.extractField(context, ['公司', 'company', '企业']),
            country: this.extractField(context, ['国家', 'country', '地区']),
            industry: this.extractField(context, ['行业', 'industry', '领域'])
          };

          return {
            type: 'customer_info',
            data: info,
            confidence: this.calculateConfidence(info)
          };
        }
      },

      extract_budget: {
        execute: (context) => {
          const budget = {
            range: this.extractField(context, ['预算', 'budget', '价格范围']),
            currency: this.extractField(context, ['$', 'USD', 'EUR', '人民币']),
            flexibility: context.includes('可协商') || context.includes('flexible') ? 'flexible' : 'fixed'
          };

          return {
            type: 'budget',
            data: budget,
            confidence: this.calculateConfidence(budget)
          };
        }
      },

      extract_decision_maker: {
        execute: (context) => {
          const keywords = ['决策', '老板', '采购', '负责人', 'decision', 'manager'];
          const isDecisionMaker = keywords.some(kw => context.includes(kw));

          return {
            type: 'decision_maker',
            data: {
              isDecisionMaker,
              role: this.extractField(context, ['职位', 'role', '头衔'])
            },
            confidence: isDecisionMaker ? 0.8 : 0.5
          };
        }
      },

      extract_product_interest: {
        execute: (context) => {
          const products = ['风冷机', '水冷机', '打齿机', '分层机', '裁切机', '导条机'];
          const interested = products.filter(p => context.includes(p));

          return {
            type: 'product_interest',
            data: {
              products: interested,
              specifications: this.extractField(context, ['规格', 'specification', '尺寸'])
            },
            confidence: interested.length > 0 ? 0.9 : 0.3
          };
        }
      },

      extract_timeline: {
        execute: (context) => {
          const timeline = {
            planned: this.extractField(context, ['计划', 'planned', '预计']),
            urgency: context.includes('紧急') || context.includes('urgent') ? 'high' : 'normal'
          };

          return {
            type: 'timeline',
            data: timeline,
            confidence: this.calculateConfidence(timeline)
          };
        }
      },

      assess_icp_score: {
        execute: (context) => {
          // 简化版 ICP 评分
          let score = 50; // 基础分

          if (context.includes('输送带')) score += 20;
          if (context.includes('制造商')) score += 15;
          if (context.includes('采购')) score += 10;
          if (context.includes('预算')) score += 5;

          return {
            type: 'icp_score',
            data: {
              score,
              level: score >= 80 ? 'A' : score >= 60 ? 'B' : 'C'
            },
            confidence: 0.7
          };
        }
      },

      identify_objections: {
        execute: (context) => {
          const objections = [];
          if (context.includes('太贵')) objections.push('价格异议');
          if (context.includes('不需要')) objections.push('需求异议');
          if (context.includes('考虑')) objections.push('决策延迟');

          return {
            type: 'objections',
            data: { objections },
            confidence: objections.length > 0 ? 0.8 : 0.4
          };
        }
      },

      track_competitors: {
        execute: (context) => {
          const competitors = [];
          const knownCompetitors = ['Flexco', 'Clipco', '其他供应商'];
          knownCompetitors.forEach(comp => {
            if (context.includes(comp)) {
              competitors.push(comp);
            }
          });

          return {
            type: 'competitors',
            data: { competitors },
            confidence: competitors.length > 0 ? 0.9 : 0.3
          };
        }
      },

      adapt_to_budget: {
        execute: (context) => {
          const needsAdaptation = context.includes('太贵') || context.includes('预算不足');

          return {
            type: 'budget_adaptation',
            data: {
              needsAdaptation,
              alternatives: needsAdaptation ? ['降级配置', '分期付款', '租赁方案'] : []
            },
            confidence: needsAdaptation ? 0.8 : 0.5
          };
        }
      },

      build_relationship: {
        execute: (context) => {
          const relationshipSignals = ['信任', '合作', '长期', '伙伴'];
          const signals = relationshipSignals.filter(s => context.includes(s));

          return {
            type: 'relationship',
            data: {
              signals,
              strength: signals.length
            },
            confidence: signals.length > 0 ? 0.7 : 0.3
          };
        }
      }
    };
  }

  /**
   * 构建记忆（MemSkill 核心功能）
   */
  buildMemory(context, skills) {
    const memories = [];

    console.log(`🔨 开始构建记忆，使用 ${skills.length} 个技能`);

    for (const skill of skills) {
      const implementation = this.skillImplementations[skill.id];

      if (implementation) {
        try {
          const result = implementation.execute(context);

          if (result.confidence > 0.5) {
            memories.push({
              skill: skill.id,
              skillName: skill.name,
              ...result,
              timestamp: new Date().toISOString()
            });

            console.log(`  ✅ ${skill.name}: 置信度 ${result.confidence.toFixed(2)}`);
          } else {
            console.log(`  ⚠️ ${skill.name}: 置信度过低 (${result.confidence.toFixed(2)})，跳过`);
          }
        } catch (error) {
          console.error(`  ❌ ${skill.name} 执行失败:`, error.message);
        }
      } else {
        console.warn(`  ⚠️ 技能 ${skill.id} 未实现`);
      }
    }

    // 合并记忆
    const mergedMemory = this.mergeMemories(memories);

    console.log(`✅ 记忆构建完成: ${memories.length} 条有效记忆`);

    return {
      memories,
      mergedMemory,
      summary: this.generateSummary(memories)
    };
  }

  /**
   * 提取字段
   */
  extractField(context, keywords) {
    for (const keyword of keywords) {
      const index = context.indexOf(keyword);
      if (index !== -1) {
        // 提取关键词后的内容（简化版）
        const start = index + keyword.length;
        const end = Math.min(start + 50, context.length);
        return context.substring(start, end).trim();
      }
    }
    return null;
  }

  /**
   * 计算置信度
   */
  calculateConfidence(data) {
    const fields = Object.values(data).filter(v => v !== null && v !== undefined);
    return fields.length / Object.keys(data).length;
  }

  /**
   * 合并记忆
   */
  mergeMemories(memories) {
    const merged = {};

    memories.forEach(memory => {
      merged[memory.type] = memory.data;
    });

    return merged;
  }

  /**
   * 生成摘要
   */
  generateSummary(memories) {
    const parts = [];

    memories.forEach(memory => {
      switch (memory.type) {
        case 'customer_info':
          if (memory.data.company) {
            parts.push(`公司: ${memory.data.company}`);
          }
          if (memory.data.country) {
            parts.push(`国家: ${memory.data.country}`);
          }
          break;

        case 'product_interest':
          if (memory.data.products && memory.data.products.length > 0) {
            parts.push(`感兴趣产品: ${memory.data.products.join(', ')}`);
          }
          break;

        case 'icp_score':
          parts.push(`ICP评分: ${memory.data.score} (${memory.data.level})`);
          break;

        case 'objections':
          if (memory.data.objections && memory.data.objections.length > 0) {
            parts.push(`异议: ${memory.data.objections.join(', ')}`);
          }
          break;
      }
    });

    return parts.join(' | ');
  }

  /**
   * 添加新技能实现
   */
  addSkillImplementation(skillId, implementation) {
    this.skillImplementations[skillId] = implementation;
    console.log(`✅ 已添加技能实现: ${skillId}`);
  }
}

module.exports = MemoryExecutor;
