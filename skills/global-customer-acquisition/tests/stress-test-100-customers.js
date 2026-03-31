/**
 * 压力测试 - 100个客户数据
 * 模拟真实场景：大量客户数据导致上下文压力
 */

const ContextManager = require('../lib/context-manager');

async function stressTest100Customers() {
  console.log('========================================');
  console.log('💪 压力测试 - 100个客户数据');
  console.log('========================================\n');

  const ctxManager = new ContextManager({
    maxTokens: 98000,
    warningThreshold: 0.8,
    criticalThreshold: 0.95
  });

  // 创建100个模拟客户数据
  const customers = [];
  for (let i = 1; i <= 100; i++) {
    customers.push({
      name: `Customer ${i}`,
      company: `Company ${i} Inc.`,
      country: ['USA', 'Germany', 'UK', 'France', 'India'][i % 5],
      industry: 'conveyor belt',
      icpScore: 50 + Math.floor(Math.random() * 50),
      email: `contact${i}@company${i}.com`,
      phone: `+1-555-${String(i).padStart(4, '0')}`,
      address: `${i}00 Main Street, City ${i}`,
      notes: `Customer notes for customer ${i}. This is a detailed note about the customer's requirements and history.`
    });
  }

  console.log(`生成了 ${customers.length} 个客户数据\n`);

  // 初始化任务
  const task = {
    goal: '批量处理100个客户',
    target: '100个潜在客户',
    description: '对100个客户进行背调和开发信生成',
    steps: [
      { name: '加载数据', action: 'load' },
      { name: '背调', action: 'research' },
      { name: '评分', action: 'score' },
      { name: '生成开发信', action: 'email' }
    ]
  };

  const init = ctxManager.initTask('stress-100', task);
  console.log('✅ 任务初始化完成');
  console.log(`   初始上下文使用率: ${init.status.utilization}\n`);

  // 模拟处理每个客户
  let processed = 0;
  let maxUtilization = 0;

  for (const customer of customers) {
    // 更新锚点
    ctxManager.anchor.updateAnchor('stress-100', {
      keyData: {
        customers: [customer]
      }
    });

    const status = ctxManager.getStatus();
    maxUtilization = Math.max(maxUtilization, parseFloat(status.utilization));

    processed++;

    if (processed % 10 === 0) {
      console.log(`处理进度: ${processed}/100`);
      console.log(`  当前上下文使用率: ${status.utilization}`);
      console.log(`  最大使用率: ${maxUtilization}%\n`);
    }
  }

  // 最终状态
  const finalStatus = ctxManager.getStatus();
  const report = ctxManager.generateReport();

  console.log('========================================');
  console.log('📊 测试结果');
  console.log('========================================\n');

  console.log(`处理客户数: ${processed}`);
  console.log(`最大上下文使用率: ${maxUtilization}%`);
  console.log(`最终上下文使用率: ${finalStatus.utilization}`);
  console.log(`系统状态: ${finalStatus.status}\n`);

  // 验证锚点完整性
  const validation = ctxManager.anchor.validateAnchor('stress-100');
  console.log(`锚点完整性: ${validation.valid ? '✅ 完整' : '❌ 损坏'}`);

  if (!validation.valid) {
    console.log(`问题: ${validation.issues.join(', ')}`);
  }

  console.log('\n========================================');
  console.log('✅ 测试完成');
  console.log('========================================\n');

  return {
    processed,
    maxUtilization,
    finalUtilization: parseFloat(finalStatus.utilization),
    anchorValid: validation.valid,
    status: finalStatus.status
  };
}

// 运行测试
stressTest100Customers()
  .then(result => {
    console.log('\n测试结果摘要:');
    console.log(JSON.stringify(result, null, 2));

    // 判断成功/失败
    if (result.maxUtilization < 80 && result.anchorValid) {
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
