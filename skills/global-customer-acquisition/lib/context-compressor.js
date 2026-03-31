/**
 * 上下文压缩系统
 * 防止上下文窗口溢出
 */

class ContextCompressor {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 98000; // 可用空间
    this.compressionRatio = options.compressionRatio || 0.3; // 压缩到30%
    this.priorityLevels = {
      critical: 1,    // 永不压缩
      high: 2,        // 轻度压缩
      medium: 3,      // 中度压缩
      low: 4          // 重度压缩或删除
    };
  }

  /**
   * 压缩上下文
   */
  compress(context) {
    // 1. 分析当前使用情况
    const usage = this.analyzeUsage(context);

    if (usage.totalTokens <= this.maxTokens) {
      return context; // 无需压缩
    }

    // 2. 按优先级分类内容
    const classified = this.classifyByPriority(context);

    // 3. 执行压缩策略
    const compressed = {
      critical: classified.critical, // 保持原样
      high: this.compressHigh(classified.high),
      medium: this.compressMedium(classified.medium),
      low: this.compressLow(classified.low)
    };

    // 4. 合并并验证
    const result = this.merge(compressed);

    return result;
  }

  /**
   * 分析上下文使用情况
   */
  analyzeUsage(context) {
    let totalTokens = 0;

    const breakdown = {
      systemPrompt: this.countTokens(context.systemPrompt || ''),
      skills: this.countTokens(context.skills || ''),
      history: this.countTokens(context.history || ''),
      currentTask: this.countTokens(context.currentTask || ''),
      results: this.countTokens(context.results || '')
    };

    totalTokens = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { totalTokens, breakdown };
  }

  /**
   * 按优先级分类内容
   */
  classifyByPriority(context) {
    return {
      critical: {
        // 永不压缩：任务目标、关键客户数据
        taskGoal: context.taskGoal,
        keyCustomers: context.keyCustomers?.slice(0, 5), // 只保留前5个
        currentStep: context.currentStep
      },
      high: {
        // 轻度压缩：技能摘要、重要历史
        skillSummary: this.summarizeSkills(context.skills),
        recentHistory: context.history?.slice(-5) // 只保留最近5条
      },
      medium: {
        // 中度压缩：执行结果、中间数据
        executionResults: this.summarizeResults(context.results),
        intermediateData: this.summarizeIntermediate(context.intermediateData)
      },
      low: {
        // 重度压缩：详细日志、重复信息
        detailedLogs: null, // 删除
        duplicateInfo: null // 删除
      }
    };
  }

  /**
   * 压缩高优先级内容
   */
  compressHigh(content) {
    if (!content) return null;

    return {
      skillSummary: this.compressText(content.skillSummary, 0.5),
      recentHistory: content.recentHistory
    };
  }

  /**
   * 压缩中优先级内容
   */
  compressMedium(content) {
    if (!content) return null;

    return {
      executionResults: this.compressText(content.executionResults, 0.3),
      intermediateData: this.compressText(content.intermediateData, 0.3)
    };
  }

  /**
   * 压缩低优先级内容
   */
  compressLow(content) {
    // 低优先级内容直接删除或极度压缩
    return {
      summary: this.compressText(
        JSON.stringify(content),
        0.1 // 压缩到10%
      )
    };
  }

  /**
   * 压缩文本
   */
  compressText(text, ratio) {
    if (!text) return '';

    const tokens = this.countTokens(text);
    const targetTokens = Math.floor(tokens * ratio);

    // 简单策略：提取关键句子
    const sentences = text.split(/[。！？\n]/);
    const keySentences = this.extractKeySentences(sentences, targetTokens);

    return keySentences.join('。');
  }

  /**
   * 提取关键句子
   */
  extractKeySentences(sentences, targetTokens) {
    const scored = sentences.map(s => ({
      text: s,
      score: this.scoreSentence(s)
    }));

    // 按分数排序
    scored.sort((a, b) => b.score - a.score);

    // 选择句子直到达到目标token数
    const selected = [];
    let currentTokens = 0;

    for (const item of scored) {
      const tokens = this.countTokens(item.text);
      if (currentTokens + tokens <= targetTokens) {
        selected.push(item.text);
        currentTokens += tokens;
      }
    }

    return selected;
  }

  /**
   * 评分句子重要性
   */
  scoreSentence(sentence) {
    let score = 0;

    // 包含关键词
    const keywords = ['客户', '目标', '重要', '关键', '必须', '成功', '失败'];
    keywords.forEach(kw => {
      if (sentence.includes(kw)) score += 2;
    });

    // 包含数字
    if (/\d+/.test(sentence)) score += 1;

    // 包含公司名（大写字母）
    if (/[A-Z]{2,}/.test(sentence)) score += 2;

    // 句子长度（中等长度更好）
    const len = sentence.length;
    if (len > 20 && len < 100) score += 1;

    return score;
  }

  /**
   * 摘要技能
   */
  summarizeSkills(skills) {
    if (!skills) return '';

    // 提取技能的核心信息
    const summary = [];

    if (skills.includes('multi-search-engine')) {
      summary.push('✅ 多引擎搜索可用');
    }

    if (skills.includes('linkedin')) {
      summary.push('✅ LinkedIn决策人搜索');
    }

    if (skills.includes('teyi')) {
      summary.push('✅ 特易海关数据');
    }

    return summary.join('\n');
  }

  /**
   * 摘要执行结果
   */
  summarizeResults(results) {
    if (!results || results.length === 0) return '';

    // 只保留关键统计
    return `
执行摘要:
- 总步骤: ${results.length}
- 成功: ${results.filter(r => r.status === 'success').length}
- 失败: ${results.filter(r => r.status === 'failed').length}
- 最新结果: ${results[results.length - 1]?.summary || '无'}
    `.trim();
  }

  /**
   * 摘要中间数据
   */
  summarizeIntermediate(data) {
    if (!data) return '';

    // 压缩中间数据
    const keys = Object.keys(data);
    return `中间数据: ${keys.length} 个字段 (${keys.slice(0, 5).join(', ')}...)`;
  }

  /**
   * 合并压缩后的内容
   */
  merge(compressed) {
    const parts = [];

    // 添加关键内容
    if (compressed.critical) {
      parts.push('=== 关键信息（不可压缩）===');
      parts.push(JSON.stringify(compressed.critical, null, 2));
    }

    // 添加高优先级内容
    if (compressed.high) {
      parts.push('\n=== 重要信息 ===');
      parts.push(JSON.stringify(compressed.high, null, 2));
    }

    // 添加中优先级内容
    if (compressed.medium) {
      parts.push('\n=== 执行摘要 ===');
      parts.push(JSON.stringify(compressed.medium, null, 2));
    }

    return parts.join('\n');
  }

  /**
   * 计算token数（简化版）
   */
  countTokens(text) {
    if (!text) return 0;

    // 简化估算：
    // - 英文: 1 token ≈ 4 字符
    // - 中文: 1 token ≈ 1.5 字符

    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;

    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }

  /**
   * 生成上下文报告
   */
  generateReport(context) {
    const usage = this.analyzeUsage(context);
    const utilization = (usage.totalTokens / this.maxTokens) * 100;

    return {
      totalTokens: usage.totalTokens,
      maxTokens: this.maxTokens,
      utilization: `${utilization.toFixed(1)}%`,
      breakdown: usage.breakdown,
      status: utilization > 100 ? 'overflow' :
              utilization > 80 ? 'warning' : 'ok'
    };
  }
}

module.exports = ContextCompressor;
