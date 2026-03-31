/**
 * Autoresearch 集成测试
 * 测试新集成的 docx, xlsx, article-writing 技能
 */

const QuotationGenerator = require('../lib/quotation-generator');
const CustomerManager = require('../lib/customer-manager');
const EmailPolisher = require('../lib/email-polisher');
const fs = require('fs');
const path = require('path');

// 测试数据
const testData = {
  // 测试客户
  customers: [
    {
      companyName: 'Ace Belting Company',
      country: 'USA',
      contactName: 'John Smith',
      email: 'john@acebelting.com',
      phone: '+1 555-123-4567',
      industry: 'Conveyor Belt Distribution',
      icpScore: 85,
      status: 'quoted',
      productInterest: 'Air-cooled press, Ply separator',
      estimatedPurchase: '$50,000',
      lastContact: '2026-03-27',
      nextFollowUp: '2026-03-30',
      notes: 'High potential customer, interested in A2FRJ-1200'
    },
    {
      companyName: 'Sempertrans USA LLC',
      country: 'USA',
      contactName: 'Joni Derry',
      email: 'joni.derry@semperitgroup.com',
      phone: '+1 770-270-9193',
      industry: 'Conveyor Belt Manufacturing',
      icpScore: 92,
      status: 'negotiating',
      productInterest: 'Water-cooled press, Finger puncher',
      estimatedPurchase: '$120,000',
      lastContact: '2026-03-26',
      nextFollowUp: '2026-03-28',
      notes: 'Large customer, multiple product interest'
    },
    {
      companyName: 'Dorner Manufacturing',
      country: 'USA',
      contactName: 'Mike Johnson',
      email: 'mjohnson@dorner.com',
      phone: '+1 262-367-7600',
      industry: 'Conveyor Systems',
      icpScore: 78,
      status: 'interested',
      productInterest: 'Belt cutting machine',
      estimatedPurchase: '$35,000',
      lastContact: '2026-03-25',
      nextFollowUp: '2026-03-29',
      notes: 'Interested in precision cutting'
    }
  ],

  // 测试报价单
  quotation: {
    customerName: 'John Smith',
    customerCompany: 'Ace Belting Company',
    customerCountry: 'USA',
    customerEmail: 'john@acebelting.com',
    products: [
      { name: '风冷皮带接头机', spec: 'A2FRJ-1200', quantity: 1, price: 8500 },
      { name: '分层机', spec: 'A1-800', quantity: 1, price: 3200 }
    ],
    validityDays: 30,
    paymentTerms: '30% T/T 定金，70% T/T 发货前付清',
    deliveryTime: '15-20 个工作日',
    warranty: '1 年质保'
  },

  // 测试开发信
  email: {
    subject: 'Product Inquiry',
    body: `Hi,

We are a manufacturer from China. We make good machines for conveyor belt.

Please contact us if you need anything.

Thanks`,
    customerName: 'John',
    customerCompany: 'Ace Belting Company',
    product: 'air-cooled'
  }
};

// 测试函数
async function runTests() {
  console.log('========================================');
  console.log('🧪 Autoresearch 集成测试');
  console.log('========================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // ========== 测试 1: 报价单生成器 ==========
  console.log('📝 测试 1: 报价单生成器 (QuotationGenerator)');
  console.log('----------------------------------------');

  try {
    const generator = new QuotationGenerator();
    const quotation = generator.generate(testData.quotation);

    console.log('✅ 报价单生成成功');
    console.log(`   客户: ${testData.quotation.customerCompany}`);
    console.log(`   产品数: ${testData.quotation.products.length}`);
    console.log(`   总价: $${testData.quotation.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toLocaleString()}`);

    results.passed++;
    results.tests.push({ name: 'QuotationGenerator', status: 'PASS' });
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'QuotationGenerator', status: 'FAIL', error: error.message });
  }

  console.log('');

  // ========== 测试 2: 客户管理器 ==========
  console.log('📊 测试 2: 客户管理器 (CustomerManager)');
  console.log('----------------------------------------');

  try {
    const manager = new CustomerManager();

    // 生成客户列表
    const customerList = manager.generateCustomerList(testData.customers);
    console.log('✅ 客户列表生成成功');
    console.log(`   客户数: ${testData.customers.length}`);

    // 生成 Pipeline 报表
    const pipeline = manager.generatePipelineReport(testData.customers);
    console.log('✅ Pipeline 报表生成成功');
    console.log(`   报表数: ${pipeline.sheets.length}`);

    // 统计
    const gradeGroups = manager.groupByGrade(testData.customers);
    console.log('   等级分布:');
    Object.keys(gradeGroups).forEach(grade => {
      console.log(`     ${grade}级: ${gradeGroups[grade].length} 个`);
    });

    results.passed++;
    results.tests.push({ name: 'CustomerManager', status: 'PASS' });
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'CustomerManager', status: 'FAIL', error: error.message });
  }

  console.log('');

  // ========== 测试 3: 开发信润色器 ==========
  console.log('✍️  测试 3: 开发信润色器 (EmailPolisher)');
  console.log('----------------------------------------');

  try {
    const polisher = new EmailPolisher();
    const result = polisher.polish(testData.email);

    console.log('✅ 开发信润色成功');
    console.log(`   评分: ${result.score}/100`);
    console.log(`   问题数: ${result.issues.length}`);
    console.log(`   建议数: ${result.suggestions.length}`);

    console.log('\n   原始邮件:');
    console.log('   ────────────────────────────────');
    console.log(`   ${testData.email.body.split('\n').join('\n   ')}`);

    console.log('\n   润色后邮件:');
    console.log('   ────────────────────────────────');
    console.log(`   主题: ${result.polished.subject}`);
    console.log(`   ${result.polished.body.split('\n').join('\n   ')}`);

    if (result.issues.length > 0) {
      console.log('\n   发现的问题:');
      result.issues.forEach(issue => {
        console.log(`     ⚠️  ${issue.message}`);
      });
    }

    if (result.suggestions.length > 0) {
      console.log('\n   改进建议:');
      result.suggestions.forEach(suggestion => {
        console.log(`     💡 ${suggestion.message}`);
      });
    }

    results.passed++;
    results.tests.push({ name: 'EmailPolisher', status: 'PASS', score: result.score });
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'EmailPolisher', status: 'FAIL', error: error.message });
  }

  console.log('');

  // ========== 测试汇总 ==========
  console.log('========================================');
  console.log('📊 测试汇总');
  console.log('========================================');
  console.log(`通过: ${results.passed}/${results.passed + results.failed}`);
  console.log(`失败: ${results.failed}/${results.passed + results.failed}`);
  console.log(`成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('');

  // 详细结果
  console.log('详细结果:');
  results.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon} ${test.name}: ${test.status}`);
    if (test.score) {
      console.log(`     评分: ${test.score}/100`);
    }
    if (test.error) {
      console.log(`     错误: ${test.error}`);
    }
  });

  // 返回结果
  return results;
}

// 运行测试
runTests()
  .then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
