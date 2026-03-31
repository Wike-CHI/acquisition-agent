/**
 * 统一上下文管理器（MemSkill 增强版）
 * 整合上下文压缩 + MemSkill 技能条件化记忆构建
 */

const ContextCompressor = require('./context-compressor');
const LayeredSkillLoader = require('./layered-skill-loader');
const TaskStateAnchor = require('./task-state-anchor');
const SkillEvolutionCoordinator = require('./skill-evolution-coordinator');

class ContextManager {
  constructor(options = {}) {
    // 原有组件
    this.compressor = new ContextCompressor(options.compressor);
    this.skillLoader = new LayeredSkillLoader();
    this.anchor = new TaskStateAnchor();

    // 新增：MemSkill 集成
    this.evolutionCoordinator = new SkillEvolutionCoordinator();

    this.maxTokens = options.maxTokens || 98000;
    this.warningThreshold = options.warningThreshold || 0.8;
    this.criticalThreshold = options.criticalThreshold || 0.95;

    this.monitoringInterval = null;

    // 模式选择：compression（压缩）或 memskill（技能条件化）
    this.mode = options.mode || 'memskill';
  }

  /**
   * 初始化任务
   */
  initTask(taskId, task) {
    // 创建锚点
    const anchor = this.anchor.createAnchor(taskId, task);

    // 加载必要技能
    const skills = this.skillLoader.loadForTask(task.description || task.goal);

    return {
      anchor,
      skills,
      status: this.getStatus()
    };
  }

  /**
   * 执行步骤（带上下文保护）
   */
  async executeStep(taskId, step, executor) {
    // 验证锚点
    const validation = this.anchor.validateAnchor(taskId);
    if (!validation.valid) {
      // 尝试恢复
      const recovery = this.anchor.recoverContext(taskId);
      if (recovery) {
        console.log('🔄 上下文已恢复');
      } else {
        throw new Error('任务锚点无效，无法恢复');
      }
    }

    // 检查上下文使用情况
    const status = this.getStatus();
    if (status.utilization > this.criticalThreshold) {
      // 紧急优化
      console.log('🚨 上下文使用率过高，执行紧急优化');
      await this.optimize();
    }

    // 执行步骤
    try {
      const result = await executor(step);

      // 根据模式选择记忆构建方式
      let memory;
      if (this.mode === 'memskill') {
        // MemSkill 方法：技能条件化构建
        memory = this.evolutionCoordinator.buildMemory({
          taskId,
          step: step.name,
          result
        });

        // 更新锚点（使用 MemSkill 构建的记忆）
        this.anchor.updateAnchor(taskId, {
          state: {
            currentStep: step.index + 1,
            progress: ((step.index + 1) / validation.anchor.state.totalSteps) * 100
          },
          keyData: memory.mergedMemory || memory,
          history: {
            step: step.index,
            action: step.name,
            result: result.summary
          }
        });
      } else {
        // 传统方法：压缩
        const compressed = this.compressor.compress({
          result,
          taskId,
          step
        });

        this.anchor.updateAnchor(taskId, {
          state: {
            currentStep: step.index + 1,
            progress: ((step.index + 1) / validation.anchor.state.totalSteps) * 100
          },
          history: {
            step: step.index,
            action: step.name,
            result: result.summary
          }
        });
      }

      return result;

    } catch (error) {
      // 记录失败（新增：MemSkill）
      this.evolutionCoordinator.logFailure(
        taskId,
        step.name,
        error.message,
        step.context || JSON.stringify(step)
      );

      // 保存错误状态
      this.anchor.updateAnchor(taskId, {
        state: {
          status: 'failed'
        },
        history: {
          step: step.index,
          action: step.name,
          result: `错误: ${error.message}`
        }
      });

      throw error;
    }
  }

  /**
   * 优化上下文
   */
  async optimize() {
    console.log('🔧 开始优化上下文...');

    // 1. 压缩上下文
    const compressed = this.compressor.compress(this.getCurrentContext());

    // 2. 优化技能加载
    this.skillLoader.optimize();

    // 3. 清理旧锚点
    this.anchor.cleanup();

    const status = this.getStatus();
    console.log(`✅ 优化完成，当前使用率: ${status.utilization}`);

    return status;
  }

  /**
   * 技能进化（新增：MemSkill）
   */
  async evolve() {
    return await this.evolutionCoordinator.evolve();
  }

  /**
   * 获取进化报告（新增：MemSkill）
   */
  generateEvolutionReport() {
    return this.evolutionCoordinator.generateReport();
  }

  /**
   * 切换模式
   */
  setMode(mode) {
    if (mode === 'compression' || mode === 'memskill') {
      this.mode = mode;
      console.log(`✅ 模式已切换为: ${mode}`);
    } else {
      console.warn('⚠️ 无效的模式，支持: compression, memskill');
    }
  }

  /**
   * 获取当前上下文
   */
  getCurrentContext() {
    return {
      skills: this.skillLoader.getStatus(),
      anchors: this.anchor.getAllAnchors(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取状态
   */
  getStatus() {
    const skillStatus = this.skillLoader.getStatus();

    return {
      skillUsage: skillStatus.currentUsage,
      maxTokens: this.maxTokens,
      utilization: skillStatus.utilization,
      loadedSkills: skillStatus.loadedSkills,
      activeAnchors: this.anchor.getAllAnchors().length,
      status: this.getStatusLevel(skillStatus.utilization),
      mode: this.mode,
      memskill: this.evolutionCoordinator.getStats()
    };
  }

  /**
   * 获取状态级别
   */
  getStatusLevel(utilization) {
    const util = parseFloat(utilization);

    if (util > this.criticalThreshold * 100) {
      return 'critical';
    } else if (util > this.warningThreshold * 100) {
      return 'warning';
    } else {
      return 'ok';
    }
  }

  /**
   * 启动监控
   */
  startMonitoring(interval = 60000) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      const status = this.getStatus();

      if (status.status === 'critical') {
        console.error('🚨 上下文使用率过高！', status.utilization);
        this.optimize();
      } else if (status.status === 'warning') {
        console.warn('⚠️ 上下文使用率较高', status.utilization);
      }
    }, interval);

    console.log(`📊 上下文监控已启动（间隔: ${interval}ms）`);
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('📊 上下文监控已停止');
    }
  }

  /**
   * 生成报告（增强版）
   */
  generateReport() {
    const status = this.getStatus();
    const context = this.getCurrentContext();
    const evolutionReport = this.evolutionCoordinator.generateReport();

    return {
      timestamp: new Date().toISOString(),
      status,
      context: {
        loadedSkills: context.skills.loadedSkills,
        activeAnchors: context.anchors,
        utilization: status.utilization
      },
      evolution: evolutionReport,
      recommendations: this.generateRecommendations(status)
    };
  }

  /**
   * 生成建议
   */
  generateRecommendations(status) {
    const recommendations = [];

    if (status.status === 'critical') {
      recommendations.push('立即执行上下文优化');
      recommendations.push('卸载非关键技能');
      recommendations.push('压缩历史数据');
    } else if (status.status === 'warning') {
      recommendations.push('考虑压缩低优先级内容');
      recommendations.push('准备卸载不常用技能');
    }

    if (status.activeAnchors > 5) {
      recommendations.push('清理已完成或过期的任务锚点');
    }

    // MemSkill 建议
    if (status.memskill && status.memskill.failureLogSize > 50) {
      recommendations.push('执行技能进化以改进系统');
    }

    if (status.memskill && status.memskill.evolutionCount === 0) {
      recommendations.push('运行 evolve() 启动技能进化');
    }

    return recommendations;
  }
}

module.exports = ContextManager;
