/**
 * 检查点系统
 * 支持断点续传和状态恢复
 */

class CheckpointManager {
  constructor() {
    this.checkpointPath = path.join(
      process.env.HOME,
      '.openclaw',
      'checkpoints'
    );
    this.maxCheckpoints = 50;
    this.currentCheckpoint = null;
  }

  /**
   * 创建检查点
   */
  async create(sessionId, state) {
    const checkpoint = {
      id: this.generateId(),
      sessionId,
      timestamp: new Date().toISOString(),
      state,
      version: '1.0.0'
    };

    // 保存检查点
    const checkpointFile = path.join(
      this.checkpointPath,
      sessionId,
      `${checkpoint.id}.json`
    );

    await fs.ensureDir(path.dirname(checkpointFile));
    await fs.writeJson(checkpointFile, checkpoint, { spaces: 2 });

    // 保存索引
    await this.updateIndex(sessionId, checkpoint);

    // 清理旧检查点
    await this.cleanup(sessionId);

    this.currentCheckpoint = checkpoint;

    console.log(`✅ 检查点已创建: ${checkpoint.id}`);
    return checkpoint;
  }

  /**
   * 恢复检查点
   */
  async restore(sessionId, checkpointId) {
    const checkpointFile = path.join(
      this.checkpointPath,
      sessionId,
      `${checkpointId}.json`
    );

    if (!await fs.pathExists(checkpointFile)) {
      throw new Error(`检查点不存在: ${checkpointId}`);
    }

    const checkpoint = await fs.readJson(checkpointFile);

    console.log(`✅ 检查点已恢复: ${checkpointId}`);
    return checkpoint;
  }

  /**
   * 获取最新检查点
   */
  async getLatest(sessionId) {
    const indexFile = path.join(
      this.checkpointPath,
      sessionId,
      'index.json'
    );

    if (!await fs.pathExists(indexFile)) {
      return null;
    }

    const index = await fs.readJson(indexFile);
    if (index.checkpoints.length === 0) {
      return null;
    }

    const latestId = index.checkpoints[index.checkpoints.length - 1];
    return await this.restore(sessionId, latestId);
  }

  /**
   * 列出所有检查点
   */
  async list(sessionId) {
    const indexFile = path.join(
      this.checkpointPath,
      sessionId,
      'index.json'
    );

    if (!await fs.pathExists(indexFile)) {
      return [];
    }

    const index = await fs.readJson(indexFile);
    return index.checkpoints;
  }

  /**
   * 更新索引
   */
  async updateIndex(sessionId, checkpoint) {
    const indexFile = path.join(
      this.checkpointPath,
      sessionId,
      'index.json'
    );

    let index = { checkpoints: [] };

    if (await fs.pathExists(indexFile)) {
      index = await fs.readJson(indexFile);
    }

    index.checkpoints.push(checkpoint.id);

    await fs.writeJson(indexFile, index, { spaces: 2 });
  }

  /**
   * 清理旧检查点
   */
  async cleanup(sessionId) {
    const checkpoints = await this.list(sessionId);

    if (checkpoints.length <= this.maxCheckpoints) {
      return;
    }

    // 删除最旧的检查点
    const toDelete = checkpoints.slice(0, checkpoints.length - this.maxCheckpoints);

    for (const checkpointId of toDelete) {
      const checkpointFile = path.join(
        this.checkpointPath,
        sessionId,
        `${checkpointId}.json`
      );
      await fs.remove(checkpointFile);
      console.log(`🗑️ 已删除旧检查点: ${checkpointId}`);
    }

    // 更新索引
    const indexFile = path.join(
      this.checkpointPath,
      sessionId,
      'index.json'
    );

    const index = await fs.readJson(indexFile);
    index.checkpoints = index.checkpoints.slice(-this.maxCheckpoints);
    await fs.writeJson(indexFile, index, { spaces: 2 });
  }

  /**
   * 生成检查点ID
   */
  generateId() {
    return `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 检查点支持的执行器
 */
class CheckpointAwareExecutor {
  constructor() {
    this.checkpointManager = new CheckpointManager();
  }

  /**
   * 执行任务（支持断点续传）
   */
  async execute(sessionId, task, options = {}) {
    // 检查是否有未完成的检查点
    const latestCheckpoint = await this.checkpointManager.getLatest(sessionId);

    if (latestCheckpoint && options.resume) {
      console.log(`🔄 从检查点恢复: ${latestCheckpoint.id}`);
      return await this.resumeFromCheckpoint(latestCheckpoint, task);
    }

    // 执行新任务
    const result = {
      sessionId,
      status: 'running',
      steps: []
    };

    try {
      for (let i = 0; i < task.steps.length; i++) {
        const step = task.steps[i];

        // 执行步骤
        const stepResult = await this.executeStep(step);
        result.steps.push(stepResult);

        // 创建检查点
        await this.checkpointManager.create(sessionId, {
          currentStep: i,
          completedSteps: result.steps,
          remainingSteps: task.steps.slice(i + 1)
        });

        // 检查是否需要暂停
        if (options.shouldPause && options.shouldPause(result)) {
          result.status = 'paused';
          return result;
        }
      }

      result.status = 'completed';
      return result;

    } catch (error) {
      result.status = 'failed';
      result.error = error.message;

      // 保存失败检查点
      await this.checkpointManager.create(sessionId, {
        error: error.message,
        failedAt: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * 从检查点恢复
   */
  async resumeFromCheckpoint(checkpoint, task) {
    const result = {
      sessionId: checkpoint.sessionId,
      status: 'resumed',
      steps: checkpoint.state.completedSteps || []
    };

    try {
      // 执行剩余步骤
      const remainingSteps = checkpoint.state.remainingSteps || [];

      for (let i = 0; i < remainingSteps.length; i++) {
        const step = remainingSteps[i];

        const stepResult = await this.executeStep(step);
        result.steps.push(stepResult);

        // 更新检查点
        await this.checkpointManager.create(checkpoint.sessionId, {
          currentStep: checkpoint.state.currentStep + i + 1,
          completedSteps: result.steps,
          remainingSteps: remainingSteps.slice(i + 1)
        });
      }

      result.status = 'completed';
      return result;

    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
      throw error;
    }
  }

  /**
   * 执行单个步骤
   */
  async executeStep(step) {
    // 模拟步骤执行
    return {
      name: step.name,
      status: 'completed',
      result: await step.execute(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { CheckpointManager, CheckpointAwareExecutor };
