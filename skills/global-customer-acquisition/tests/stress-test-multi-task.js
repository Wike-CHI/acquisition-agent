/**
 * 压力测试 - 多任务切换
 * 模拟真实场景：同时处理多个任务导致上下文混乱
 */

const ContextManager = require('../lib/context-manager');

async function stressTestMultiTask() {
  console.log('========================================');
  console.log('💪 压力测试 - 多任务切换');
  console.log('========================================\n');

  const ctxManager = new ContextManager({
    maxTokens: 98000,
    warningThreshold: 0.8,
    criticalThreshold: 0.95
  });

  // 创建3个并发任务
  const tasks = [
    {
      id: 'task-usa',
      goal: '搜索美国客户',
      target: 'USA conveyor belt manufacturers',
      steps: [
        { name: 'LinkedIn搜索', action: 'linkedin' },
        { name: '背调', action: 'research' },
        { name: '开发信', action: 'email' }
      ]
    },
    {
      id: 'task-germany',
      goal: '搜索德国客户',
      target: 'Germany conveyor belt manufacturers',
      steps: [
        { name: '海关数据', action: 'customs' },
        { name: '背调', action: 'research' },
        { name: '开发信', action: 'email' }
      ]
    },
    {
      id: 'task-india',
      goal: '搜索印度客户',
      target: 'India conveyor belt manufacturers',
      steps: [
        { name: 'Facebook搜索', action: 'facebook' },
        { name: '背调', action: 'research' },
        { name: '开发信', action: 'email' }
      ]
    }
  ];

  // 初始化所有任务
  console.log('初始化3个并发任务...\n');

  tasks.forEach(task => {
    ctxManager.initTask(task.id, task);
    console.log(`✅ ${task.id}: ${task.goal}`);
  });

  console.log('');

  let maxUtilization = 0;
  const taskResults = {};

  // 模拟交替执行任务
  for (let stepIndex = 0; stepIndex < 3; stepIndex++) {
    console.log(`\n--- 轮次 ${stepIndex + 1} ---\n`);

    for (const task of tasks) {
      const step = { index: stepIndex, ...task.steps[stepIndex] };

      console.log(`${task.id} - Step ${stepIndex + 1}: ${step.name}`);

      try {
        const result = await ctxManager.executeStep(task.id, step, async (s) => {
          await new Promise(resolve => setTimeout(resolve, 50));

          return {
            summary: `完成${s.name}`,
            timestamp: new Date().toISOString()
          };
        });

        console.log(`   ✅ ${result.summary}`);

        const status = ctxManager.getStatus();
        maxUtilization = Math.max(maxUtilization, parseFloat(status.utilization));

        console.log(`   上下文使用率: ${status.utilization}\n`);

        if (!taskResults[task.id]) {
          taskResults[task.id] = [];
        }
        taskResults[task.id].push({
          step: step.name,
          success: true,
          utilization: parseFloat(status.utilization)
        });

      } catch (error) {
        console.log(`   ❌ 失败: ${error.message}\n`);

        if (!taskResults[task.id]) {
          taskResults[task.id] = [];
        }
        taskResults[task.id].push({
          step: step.name,
          success: false,
          error: error.message
        });
      }
    }
  }

  // 验证所有任务锚点
  console.log('\n========================================');
  console.log('📊 测试结果');
  console.log('========================================\n');

  console.log('任务完成情况:');
  let allValid = true;
  let allCompleted = true;

  for (const task of tasks) {
    const validation = ctxManager.anchor.validateAnchor(task.id);
    const results = taskResults[task.id] || [];
    const completed = results.filter(r => r.success).length;
    const total = task.steps.length;

    console.log(`${task.id}:`);
    console.log(`  完成步骤: ${completed}/${total}`);
    console.log(`  锚点完整性: ${validation.valid ? '✅ 完整' : '❌ 损坏'}`);

    if (!validation.valid) {
      console.log(`  问题: ${validation.issues.join(', ')}`);
      allValid = false;
    }

    if (completed < total) {
      allCompleted = false;
    }

    console.log('');
  }

  const finalStatus = ctxManager.getStatus();

  console.log(`最大上下文使用率: ${maxUtilization}%`);
  console.log(`最终上下文使用率: ${finalStatus.utilization}`);
  console.log(`系统状态: ${finalStatus.status}`);
  console.log(`活跃锚点数: ${finalStatus.activeAnchors}\n`);

  console.log('========================================');
  console.log('✅ 测试完成');
  console.log('========================================\n');

  return {
    allCompleted,
    allValid,
    maxUtilization,
    finalUtilization: parseFloat(finalStatus.utilization),
    activeAnchors: finalStatus.activeAnchors,
    status: finalStatus.status
  };
}

// 运行测试
stressTestMultiTask()
  .then(result => {
    console.log('\n测试结果摘要:');
    console.log(JSON.stringify(result, null, 2));

    // 判断成功/失败
    if (result.allCompleted && result.allValid && result.maxUtilization < 80) {
      console.log('\n✅ 测试通过');
      process.exit(0);
    } else {
      console.log('\n❌ 测试失败');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  });
