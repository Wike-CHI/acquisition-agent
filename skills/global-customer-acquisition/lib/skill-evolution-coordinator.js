/**
 * 抙能进化协调器
 * 整合 MemSkill 的核心功能到获客系统
 */

const SkillController = require('./skill-controller');
const MemoryExecutor = require('./memory-executor');
const HardCaseMiner = require('./hard-case-miner');
const SkillDesigner = require('./skill-designer');

class SkillEvolutionCoordinator {
  constructor() {
    this.skillController = new SkillController();
    this.memoryExecutor = new MemoryExecutor();
    this.hardCaseMiner = new HardCaseMiner();
    this.skillDesigner = new SkillDesigner();

    this.failureLog = [];
    this.evolutionHistory = [];
    this.maxFailureLogSize = 100;
  }

  /**
   * 构建记忆（MemSkill 核心功能）
   */
  buildMemory(context) {
    console.log('🧠 开始构建记忆（MemSkill 方法）...\n');

    // 1. 选择技能
    const skills = this.skillController.selectSkills(context);
    console.log(`  选择技能: ${skills.map(s => s.name).join(', ')}\n`);

    // 2. 构建记忆
    const memory = this.memoryExecutor.buildMemory(context, skills);
    console.log(`  构建记忆: ${memory.type}\n`);
    console.log(`  置信度: ${(memory.confidence * 100).toFixed(1)}%\n`);

    return memory;
  }

  /**
   * 记录失败
   */
  logFailure(taskId, step, error, context) {
    this.failureLog.push({
      taskId,
      step,
      error,
      context,
      timestamp: new Date().toISOString()
    });

    console.log(`❌ 记录失败: ${step} - ${error}`);

    // 检查是否需要进化
    if (this.failureLog.length >= this.maxFailureLogSize) {
      this.evolve();
    }
  }

  /**
   * 进化技能（MemSkill 核心功能）
   */
  async evolve() {
    console.log('\n🔄 开始技能进化...\n');

    // 1. 挖掘困难案例
    const hardCases = this.hardCaseMiner.mine(this.failureLog);
    console.log(`  挖掘困难案例: ${hardCases.length} 个\n`);

    // 2. 设计新技能
    const newSkills = await this.skillDesigner.designSkills(hardCases);
    console.log(`  设计新技能: ${newSkills.length} 个\n`);

    // 3. 添加到技能库
    newSkills.forEach(skill => {
      this.skillController.addSkill(skill);
    });

    // 4. 记录进化历史
    this.evolutionHistory.push({
      timestamp: new Date().toISOString(),
      hardCasesCount: hardCases.length,
      newSkillsCount: newSkills.length,
      newSkills: newSkills.map(s => s.name)
    });

    // 5. 清空失败日志
    this.failureLog = [];

    console.log('✅ 技能进化完成\n');

    return {
      hardCases: hardCases.length,
      newSkills: newSkills.length,
      skills: newSkills
    };
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalSkills: this.skillController.getAllSkills().length,
      failureLogSize: this.failureLog.length,
      evolutionCount: this.evolutionHistory.length,
      lastEvolution: this.evolutionHistory[this.evolutionHistory.length - 1] || null
    };
  }

  /**
   * 生成报告
   */
  generateReport() {
    const stats = this.getStats();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSkills: stats.totalSkills,
        pendingFailures: stats.failureLogSize,
        evolutionCount: stats.evolutionCount
      },
      recentEvolutions: this.evolutionHistory.slice(-5),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    const recommendations = [];

    // 检查失败日志
    if (this.failureLog.length > 50) {
      recommendations.push('失败日志较多，建议立即执行技能进化');
    }

    // 检查进化历史
    if (this.evolutionHistory.length === 0) {
      recommendations.push('尚未执行技能进化，建议运行 evolve()');
    }

    // 检查技能数量
    if (stats.totalSkills < 20) {
      recommendations.push('技能数量较少，建议增加更多领域特定技能');
    }

    return recommendations;
  }
}

module.exports = SkillEvolutionCoordinator;
