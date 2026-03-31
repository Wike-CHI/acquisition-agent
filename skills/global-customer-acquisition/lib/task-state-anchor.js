/**
 * 任务状态锚定系统
 * 确保关键信息不会被挤出上下文
 */

class TaskStateAnchor {
  constructor() {
    this.anchors = new Map();
    this.maxAnchors = 10;
    this.stateStore = new Map(); // 外部存储
  }

  /**
   * 创建任务锚点
   */
  createAnchor(taskId, task) {
    const anchor = {
      id: taskId,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),

      // 关键信息（永不压缩）
      critical: {
        goal: task.goal,               // 任务目标
        target: task.target,           // 目标客户
        constraints: task.constraints, // 约束条件
        success: task.success          // 成功标准
      },

      // 当前状态
      state: {
        currentStep: 0,
        totalSteps: task.steps?.length || 0,
        status: 'running',
        progress: 0
      },

      // 关键数据（保持在上下文中）
      keyData: {
        customers: [],    // 最多5个关键客户
        products: [],     // 最多3个产品
        decisions: []     // 最多5个关键决策
      },

      // 执行历史（压缩存储）
      history: []
    };

    this.anchors.set(taskId, anchor);
    this.saveToStore(taskId, anchor);

    console.log(`⚓ 创建任务锚点: ${taskId}`);
    return anchor;
  }

  /**
   * 更新锚点
   */
  updateAnchor(taskId, updates) {
    const anchor = this.anchors.get(taskId);
    if (!anchor) {
      console.warn(`⚠️ 锚点不存在: ${taskId}`);
      return null;
    }

    // 更新最后访问时间
    anchor.lastAccessed = new Date().toISOString();

    // 更新状态
    if (updates.state) {
      anchor.state = { ...anchor.state, ...updates.state };
    }

    // 更新关键数据（保持限制）
    if (updates.keyData) {
      if (updates.keyData.customers) {
        anchor.keyData.customers = updates.keyData.customers.slice(0, 5);
      }
      if (updates.keyData.products) {
        anchor.keyData.products = updates.keyData.products.slice(0, 3);
      }
      if (updates.keyData.decisions) {
        anchor.keyData.decisions = updates.keyData.decisions.slice(-5);
      }
    }

    // 添加历史（压缩）
    if (updates.history) {
      anchor.history.push({
        timestamp: new Date().toISOString(),
        summary: this.summarizeHistory(updates.history)
      });

      // 只保留最近20条
      anchor.history = anchor.history.slice(-20);
    }

    this.anchors.set(taskId, anchor);
    this.saveToStore(taskId, anchor);

    return anchor;
  }

  /**
   * 获取锚点
   */
  getAnchor(taskId) {
    let anchor = this.anchors.get(taskId);

    if (!anchor) {
      // 尝试从外部存储恢复
      anchor = this.loadFromStore(taskId);
      if (anchor) {
        this.anchors.set(taskId, anchor);
      }
    }

    if (anchor) {
      // 更新最后访问时间
      anchor.lastAccessed = new Date().toISOString();
    }

    return anchor;
  }

  /**
   * 生成上下文摘要
   */
  generateContextSummary(taskId) {
    const anchor = this.getAnchor(taskId);
    if (!anchor) return null;

    return `
【任务锚点 - ${taskId}】

目标: ${anchor.critical.goal}
目标客户: ${anchor.critical.target}
约束: ${JSON.stringify(anchor.critical.constraints)}

当前进度: ${anchor.state.currentStep}/${anchor.state.totalSteps} (${anchor.state.status})

关键客户:
${anchor.keyData.customers.map((c, i) => `  ${i + 1}. ${c.name} (${c.country}) - ICP: ${c.icpScore}`).join('\n')}

关键决策:
${anchor.keyData.decisions.map((d, i) => `  ${i + 1}. ${d}`).join('\n')}

最后更新: ${anchor.lastAccessed}
    `.trim();
  }

  /**
   * 验证锚点完整性
   */
  validateAnchor(taskId) {
    const anchor = this.getAnchor(taskId);
    if (!anchor) {
      return { valid: false, reason: '锚点不存在' };
    }

    const issues = [];

    // 检查关键信息
    if (!anchor.critical.goal) {
      issues.push('缺少任务目标');
    }

    if (!anchor.critical.target) {
      issues.push('缺少目标客户');
    }

    // 检查状态一致性
    if (anchor.state.currentStep > anchor.state.totalSteps) {
      issues.push('当前步骤超出总步骤数');
    }

    return {
      valid: issues.length === 0,
      issues,
      anchor
    };
  }

  /**
   * 恢复丢失的上下文
   */
  recoverContext(taskId) {
    const validation = this.validateAnchor(taskId);

    if (!validation.valid) {
      console.warn('⚠️ 锚点验证失败:', validation.issues);
      return null;
    }

    const anchor = validation.anchor;

    // 生成恢复提示
    const recoveryPrompt = `
⚠️ 检测到上下文可能丢失，正在从锚点恢复...

任务目标: ${anchor.critical.goal}
当前进度: ${anchor.state.currentStep}/${anchor.state.totalSteps}

关键信息:
- 目标客户: ${anchor.critical.target}
- 约束条件: ${JSON.stringify(anchor.critical.constraints)}

已完成步骤: ${anchor.history.length}
关键决策: ${anchor.keyData.decisions.length}

请继续执行任务...
    `.trim();

    console.log('🔄 上下文恢复提示已生成');
    return recoveryPrompt;
  }

  /**
   * 压缩历史记录
   */
  summarizeHistory(history) {
    if (!history) return '';

    // 提取关键信息
    const summary = [];

    if (history.step) {
      summary.push(`步骤${history.step}`);
    }

    if (history.action) {
      summary.push(history.action);
    }

    if (history.result) {
      summary.push(`结果: ${history.result.substring(0, 50)}...`);
    }

    return summary.join(' - ');
  }

  /**
   * 保存到外部存储
   */
  saveToStore(taskId, anchor) {
    // 保存到文件或数据库
    this.stateStore.set(taskId, JSON.stringify(anchor));
    console.log(`💾 锚点已保存: ${taskId}`);
  }

  /**
   * 从外部存储加载
   */
  loadFromStore(taskId) {
    const data = this.stateStore.get(taskId);
    if (data) {
      try {
        const anchor = JSON.parse(data);
        console.log(`📂 锚点已加载: ${taskId}`);
        return anchor;
      } catch (error) {
        console.error(`❌ 加载锚点失败: ${taskId}`, error);
        return null;
      }
    }
    return null;
  }

  /**
   * 清理旧锚点
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24小时

    for (const [taskId, anchor] of this.anchors) {
      const lastAccessed = new Date(anchor.lastAccessed).getTime();
      if (now - lastAccessed > maxAge) {
        this.anchors.delete(taskId);
        console.log(`🗑️ 已清理旧锚点: ${taskId}`);
      }
    }
  }

  /**
   * 获取所有锚点状态
   */
  getAllAnchors() {
    const anchors = [];

    for (const [taskId, anchor] of this.anchors) {
      anchors.push({
        id: taskId,
        status: anchor.state.status,
        progress: `${anchor.state.currentStep}/${anchor.state.totalSteps}`,
        lastAccessed: anchor.lastAccessed
      });
    }

    return anchors;
  }
}

module.exports = TaskStateAnchor;
