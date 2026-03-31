/**
 * 压力测试 - 10个步骤的长时间任务
 * 模拟真实场景：长时间运行导致上下文累积
 */

const ContextManager = require('../lib/context-manager');

async function stressTest10Steps() {
  console.log('========================================');
  console.log('💪 压力测试 - 10步骤长时间任务');
  console.log('========================================\n');

  const ctxManager = new ContextManager({
    maxTokens: 98000,
    warningThreshold: 0.8,
    criticalThreshold: 0.95
  });

  // 创建10步骤任务
  const task = {
    goal: '完整获客流程（10步骤）',
    target: '美国输送带制造商',
    description: '从搜索到成交的完整流程',
    steps: [
      { name: 'LinkedIn搜索', action: 'linkedin_search' },
      { name: '海关数据查询', action: 'customs_search' },
      { name: '客户背调', action: 'research' },
      { name: 'ICP评分', action: 'score' },
      { name: '决策人查找', action: 'find_decision_maker' },
      { name: '生成开发信', action: 'generate_email' },
      { name: '发送邮件', action: 'send_email' },
      { name: '跟进电话', action: 'call' },
      { name: '报价', action: 'quote' },
      { name: '成交', action: 'close' }
    ]
  };

  const init = ctxManager.initTask('stress-10-steps', task);
  console.log('✅ 任务初始化完成');
  console.log(`   初始上下文使用率: ${init.status.utilization}\n`);

  let maxUtilization = 0;
  const results = [];

  // 执行每个步骤
  for (let i = 0; i < task.steps.length; i++) {
    const step = { index: i, ...task.steps[i] };

    console.log(`Step ${i + 1}: ${step.name}`);

    try {
      const result = await ctxManager.executeStep('stress-10-steps', step, async (s) => {
        // 模拟执行（每个步骤产生不同量的数据）
        await new Promise(resolve => setTimeout(resolve, 100));

        // 模拟产生大量中间数据
        const dataSizes = {
          'LinkedIn搜索': 100,
          '海关数据查询': 50,
          '客户背调': 20,
          'ICP评分': 10,
          '决策人查找': 30,
          '生成开发信': 15,
          '发送邮件': 5,
          '跟进电话': 8,
          '报价': 12,
          '成交': 3
        };

        const dataSize = dataSizes[s.name] || 10;

        return {
          summary: `完成${s.name}（产生${dataSize}条数据）`,
          dataSize,
          timestamp: new Date().toISOString()
        };
      });

      console.log(`   ✅ ${result.summary}`);

      const status = ctxManager.getStatus();
      maxUtilization = Math.max(maxUtilization, parseFloat(status.utilization));

      console.log(`   上下文使用率: ${status.utilization}\n`);

      results.push({
        step: step.name,
        success: true,
        utilization: parseFloat(status.utilization)
      });

    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}\n`);
      results.push({
        step: step.name,
        success: false,
        error: error.message
      });
    }
  }

  // 最终状态
  const finalStatus = ctxManager.getStatus();
  const validation = ctxManager.anchor.validateAnchor('stress-10-steps');

  console.log('========================================');
  console.log('📊 测试结果');
  console.log('========================================\n');

  console.log(`完成步骤数: ${results.filter(r => r.success).length}/${task.steps.length}`);
  console.log(`最大上下文使用率: ${maxUtilization}%`);
  console.log(`最终上下文使用率: ${finalStatus.utilization}`);
  console.log(`系统状态: ${finalStatus.status}`);
  console.log(`锚点完整性: ${validation.valid ? '✅ 完整' : '❌ 损坏'}\n`);

  // 显示每步的使用率变化
  console.log('每步上下文使用率变化:');
  results.forEach((r, i) => {
    const icon = r.success ? '✅' : '❌';
    console.log(`  ${icon} Step ${i + 1}: ${r.utilization}%`);
  });

  console.log('\n========================================');
  console.log('✅ 测试完成');
  console.log('========================================\n');

  return {
    completedSteps: results.filter(r => r.success).length,
    totalSteps: task.steps.length,
    maxUtilization,
    finalUtilization: parseFloat(finalStatus.utilization),
    anchorValid: validation.valid,
    status: finalStatus.status
  };
}

// 运行测试
stressTest10Steps()
  .then(result => {
    console.log('\n测试结果摘要:');
    console.log(JSON.stringify(result, null, 2));

    // 判断成功/失败
    if (result.completedSteps === result.totalSteps &&
        result.maxUtilization < 80 && result.anchorValid) {
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
