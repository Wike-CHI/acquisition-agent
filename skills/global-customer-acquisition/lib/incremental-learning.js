/**
 * 增量学习系统
 * 防止AI灾难性遗忘的核心模块
 */

class IncrementalLearning {
  constructor() {
    this.knowledgeBase = new Map();
    this.index = new KnowledgeIndex();
    this.forgettingPolicy = new ForgettingPolicy();
    this.conflictResolver = new ConflictResolver();
  }

  /**
   * 学习新知识
   */
  async learn(newKnowledge) {
    // 1. 去重检查
    const hash = this.hash(newKnowledge);
    if (this.knowledgeBase.has(hash)) {
      console.log('⚠️ 知识已存在，跳过');
      return { status: 'duplicate', hash };
    }

    // 2. 质量验证
    const validation = this.validate(newKnowledge);
    if (!validation.valid) {
      console.log('❌ 知识验证失败:', validation.errors);
      return { status: 'invalid', errors: validation.errors };
    }

    // 3. 冲突检测
    const conflicts = this.findConflicts(newKnowledge);
    if (conflicts.length > 0) {
      console.log('⚠️ 检测到知识冲突');
      const resolution = await this.conflictResolver.resolve(conflicts, newKnowledge);
      newKnowledge = resolution.merged;
    }

    // 4. 计算重要性评分
    const importance = this.calculateImportance(newKnowledge);
    newKnowledge.importance = importance;
    newKnowledge.learnedAt = new Date().toISOString();
    newKnowledge.accessCount = 0;

    // 5. 整合到知识库
    this.knowledgeBase.set(hash, newKnowledge);
    this.index.add(hash, newKnowledge);

    console.log('✅ 新知识已学习:', hash);

    // 6. 触发遗忘机制
    await this.forget();

    return { status: 'learned', hash, importance };
  }

  /**
   * 验证知识质量
   */
  validate(knowledge) {
    const errors = [];

    // 检查必需字段
    if (!knowledge.type) {
      errors.push('缺少知识类型');
    }

    if (!knowledge.data) {
      errors.push('缺少知识数据');
    }

    // 根据类型验证
    switch (knowledge.type) {
      case 'customer_knowledge':
        if (!knowledge.data.company_name) {
          errors.push('客户知识缺少公司名');
        }
        if (!knowledge.data.country) {
          errors.push('客户知识缺少国家');
        }
        break;

      case 'product_knowledge':
        if (!knowledge.data.product_name) {
          errors.push('产品知识缺少产品名');
        }
        break;

      case 'market_knowledge':
        if (!knowledge.data.market_name) {
          errors.push('市场知识缺少市场名');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 检测知识冲突
   */
  findConflicts(newKnowledge) {
    const conflicts = [];

    // 根据类型查找冲突
    for (const [hash, existing] of this.knowledgeBase) {
      if (existing.type !== newKnowledge.type) continue;

      // 客户知识冲突
      if (newKnowledge.type === 'customer_knowledge') {
        if (existing.data.company_name === newKnowledge.data.company_name) {
          conflicts.push({
            type: 'company_duplicate',
            existing,
            newKnowledge,
            field: 'company_name'
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 计算知识重要性评分
   */
  calculateImportance(knowledge) {
    let score = 5; // 基础分

    // 根据类型调整
    switch (knowledge.type) {
      case 'customer_knowledge':
        // ICP评分影响
        if (knowledge.data.icp_score) {
          score += (knowledge.data.icp_score / 100) * 3;
        }
        // 客户状态影响
        if (knowledge.data.status === 'hot_lead') {
          score += 2;
        } else if (knowledge.data.status === 'closed_won') {
          score += 3;
        }
        break;

      case 'product_knowledge':
        // 产品知识默认高重要性
        score += 2;
        break;

      case 'market_knowledge':
        // 市场知识中等重要性
        score += 1;
        break;
    }

    // 知识完整度
    const completeness = this.calculateCompleteness(knowledge);
    score += completeness * 0.5;

    return Math.min(10, Math.max(0, score));
  }

  /**
   * 计算知识完整度
   */
  calculateCompleteness(knowledge) {
    const requiredFields = {
      customer_knowledge: ['company_name', 'country', 'industry', 'icp_score', 'status'],
      product_knowledge: ['product_name', 'category', 'specifications'],
      market_knowledge: ['market_name', 'region', 'trends']
    };

    const fields = requiredFields[knowledge.type] || [];
    const present = fields.filter(f => knowledge.data[f] !== undefined);

    return present.length / fields.length;
  }

  /**
   * 遗忘机制
   */
  async forget() {
    const MAX_KNOWLEDGE = 10000; // 最大知识容量
    const ARCHIVE_THRESHOLD = 8000; // 归档阈值

    if (this.knowledgeBase.size < ARCHIVE_THRESHOLD) {
      return; // 未达到阈值，无需遗忘
    }

    console.log('🔄 触发遗忘机制...');

    // 查找低价值知识
    const candidates = [];

    for (const [hash, knowledge] of this.knowledgeBase) {
      const score = this.calculateForgettingScore(knowledge);
      if (score < 3) {
        candidates.push({ hash, knowledge, score });
      }
    }

    // 按评分排序
    candidates.sort((a, b) => a.score - b.score);

    // 归档低价值知识
    const toArchive = candidates.slice(0, candidates.length - MAX_KNOWLEDGE);

    for (const { hash, knowledge } of toArchive) {
      await this.archive(hash, knowledge);
      this.knowledgeBase.delete(hash);
    }

    console.log(`✅ 已归档 ${toArchive.length} 条低价值知识`);
  }

  /**
   * 计算遗忘评分（越低越应该遗忘）
   */
  calculateForgettingScore(knowledge) {
    let score = knowledge.importance || 5;

    // 访问频率
    score += Math.min(knowledge.accessCount || 0, 2);

    // 时效性（越旧越低）
    const age = Date.now() - new Date(knowledge.learnedAt).getTime();
    const ageInDays = age / (1000 * 60 * 60 * 24);
    if (ageInDays > 180) {
      score -= 2;
    } else if (ageInDays > 90) {
      score -= 1;
    }

    return Math.max(0, score);
  }

  /**
   * 归档知识
   */
  async archive(hash, knowledge) {
    const archivePath = path.join(
      process.env.HOME,
      '.openclaw',
      'knowledge',
      'archive',
      new Date().toISOString().split('T')[0]
    );

    await fs.ensureDir(archivePath);
    await fs.writeJson(path.join(archivePath, `${hash}.json`), knowledge);

    console.log(`📦 已归档: ${hash}`);
  }

  /**
   * 更新知识访问记录
   */
  updateAccess(hash) {
    const knowledge = this.knowledgeBase.get(hash);
    if (knowledge) {
      knowledge.accessCount = (knowledge.accessCount || 0) + 1;
      knowledge.lastAccess = new Date().toISOString();
      this.knowledgeBase.set(hash, knowledge);
    }
  }

  /**
   * 搜索知识
   */
  search(query) {
    return this.index.search(query);
  }

  /**
   * 生成知识哈希
   */
  hash(knowledge) {
    const content = JSON.stringify({
      type: knowledge.type,
      data: knowledge.data
    });
    return crypto.createHash('md5').update(content).digest('hex');
  }
}

/**
 * 知识索引
 */
class KnowledgeIndex {
  constructor() {
    this.index = new Map();
    this.embeddings = [];
  }

  add(hash, knowledge) {
    // 建立关键词索引
    const keywords = this.extractKeywords(knowledge);
    keywords.forEach(kw => {
      if (!this.index.has(kw)) {
        this.index.set(kw, []);
      }
      this.index.get(kw).push(hash);
    });
  }

  extractKeywords(knowledge) {
    const keywords = new Set();

    // 从数据中提取关键词
    const data = knowledge.data;

    if (data.company_name) {
      keywords.add(data.company_name.toLowerCase());
    }
    if (data.country) {
      keywords.add(data.country.toLowerCase());
    }
    if (data.industry) {
      keywords.add(data.industry.toLowerCase());
    }

    return Array.from(keywords);
  }

  search(query) {
    const keywords = query.toLowerCase().split(/\s+/);
    const results = new Map();

    keywords.forEach(kw => {
      const hashes = this.index.get(kw) || [];
      hashes.forEach(hash => {
        results.set(hash, (results.get(hash) || 0) + 1);
      });
    });

    return Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([hash]) => hash);
  }
}

/**
 * 冲突解决器
 */
class ConflictResolver {
  async resolve(conflicts, newKnowledge) {
    // 简单策略：新知识优先
    let merged = { ...newKnowledge };

    for (const conflict of conflicts) {
      // 合并互补信息
      merged.data = {
        ...conflict.existing.data,
        ...newKnowledge.data,
        // 保留历史
        _history: [
          ...(conflict.existing.data._history || []),
          {
            updatedAt: new Date().toISOString(),
            previousData: conflict.existing.data
          }
        ]
      };
    }

    return { merged };
  }
}

/**
 * 遗忘策略
 */
class ForgettingPolicy {
  constructor() {
    this.maxAge = 180; // 180天
    this.minAccessCount = 3;
    this.maxKnowledge = 10000;
  }

  shouldForget(knowledge) {
    const age = Date.now() - new Date(knowledge.learnedAt).getTime();
    const ageInDays = age / (1000 * 60 * 60 * 24);

    return (
      ageInDays > this.maxAge &&
      (knowledge.accessCount || 0) < this.minAccessCount
    );
  }
}

module.exports = IncrementalLearning;
