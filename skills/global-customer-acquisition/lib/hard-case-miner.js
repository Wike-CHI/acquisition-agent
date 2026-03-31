/**
 * 困难案例挖掘器
 * 从失败中学习，改进技能（简化版)
 */

class HardCaseMiner {
  constructor() {
    this.failureLog = [];
  }

  /**
   * 挖掘困难案例
   */
  mine(failures, topK = 10) {
    const hardCases = [];

    failures.forEach(failure => {
      // 分析失败模式
      const pattern = this.analyzePattern(failure);

      // 计算难度分数
      const difficulty = this.calculateDifficulty(failure, pattern);

      hardCases.push({
        failure,
        pattern,
        difficulty,
        suggestions: this.generateSuggestions(failure, pattern)
      });
    });

    // 按难度排序
    hardCases.sort((a, b) => b.difficulty - a.difficulty);

    // 返回 Top-K
    return hardCases.slice(0, topK);
  }

  /**
   * 分析失败模式
   */
  analyzePattern(failure) {
    const text = JSON.stringify(failure).toLowerCase();

    if (text.includes('无法提取') || text.includes('null') || text.includes('undefined')) {
      return '信息提取失败';
    }

    if (text.includes('评分') && (text.includes('低') || text.includes('不准确'))) {
      return 'ICP评分不准确';
    }

    if (text.includes('异议') && !text.includes('处理')) {
      return '异议处理缺失';
    }

    if (text.includes('溢出') || text.includes('超出')) {
      return '上下文溢出';
    }

    if (text.includes('低置信') || text.includes('不完整')) {
      return '记忆质量低';
    }

    if (text.includes('缺少') && text.includes('没有')) {
      return '缺少必要技能';
    }

    if (text.includes('错误') && text.includes('不合适')) {
      return '技能选择错误';
    }

    return '未知失败';
  }

  /**
   * 计算难度分数
   */
  calculateDifficulty(failure, pattern) {
    let score = 0.5;

    // 根据模式增加分数
    const patternScores = {
      '信息提取失败': 0.2,
      'ICP评分不准确': 0.3,
      '异议处理缺失': 0.2,
      '上下文溢出': 0.1,
      '记忆质量低': 0.1,
      '缺少必要技能': 0.3,
      '技能选择错误': 0.2,
      '未知失败': 0.1
    };

    score += patternScores[pattern] || 0;

    // 根据上下文增加分数
    const context = JSON.stringify(failure);
    if (context.length > 1000) score += 0.1;
    if (context.length > 2000) score += 0.2;

    return Math.min(score, 1.0);
  }

  /**
   * 生成建议
   */
  generateSuggestions(failure, pattern) {
    const suggestions = [];

    switch (pattern) {
      case '信息提取失败':
        suggestions.push('添加字段验证逻辑');
        suggestions.push('改进提示词识别');
        suggestions.push('增加二次确认');
        break;

      case 'ICP评分不准确':
        suggestions.push('优化ICP评分算法');
        suggestions.push('添加更多评分维度');
        suggestions.push('调整权重分配');
        break;

      case '异议处理缺失':
        suggestions.push('添加异议处理技能库');
        suggestions.push('添加常见异议模板');
        suggestions.push('训练异议处理能力');
        break;

      case '上下文溢出':
        suggestions.push('优化上下文压缩策略');
        suggestions.push('添加更激进的摘要机制');
        suggestions.push('减少冗余信息');
        break;

      case '记忆质量低':
        suggestions.push('改进记忆构建逻辑');
        suggestions.push('添加验证机制');
        suggestions.push('提高置信度阈值');
        break;

      case '缺少必要技能':
        suggestions.push('分析缺少的技能类型');
        suggestions.push('添加新技能到技能库');
        suggestions.push('优化技能选择器');
        break;

      case '技能选择错误':
        suggestions.push('优化技能选择器');
        suggestions.push('添加技能评分机制');
        suggestions.push('训练更准确的选择模型');
        break;

      default:
        suggestions.push('分析失败原因');
        suggestions.push('记录到失败日志');
        break;
    }

    return suggestions;
  }
}

module.exports = HardCaseMiner;
